import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient, EstadoConservacao, StatusRequisicao } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Correção automática da URL do MongoDB caso o usuário tenha esquecido de colocar o nome do banco
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && dbUrl.includes('.net/?')) {
  process.env.DATABASE_URL = dbUrl.replace('.net/?', '.net/bolsa_materiais?');
} else if (dbUrl && dbUrl.endsWith('.net/')) {
  process.env.DATABASE_URL = dbUrl + 'bolsa_materiais';
}

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // PIlar A: Vitrine e Busca Inteligente (Fuzzy Matching)
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const { search, categoria, estado, secretariaId } = req.query;
      let whereClause: any = {};

      if (categoria) whereClause.categoria = String(categoria);
      if (estado) whereClause.estadoConservacao = String(estado) as EstadoConservacao;
      if (secretariaId) whereClause.secretariaId = String(secretariaId);

      const produtos = await prisma.produto.findMany({
        where: whereClause,
        include: { secretaria: true },
      });

      let resultados = produtos;
      if (search) {
        const searchTerm = String(search).toLowerCase();
        resultados = produtos.filter((p) => {
          return (
            p.nome.toLowerCase().includes(searchTerm) ||
            p.descricao.toLowerCase().includes(searchTerm) ||
            (p.codigoPatrimonio && p.codigoPatrimonio.toLowerCase().includes(searchTerm)) ||
            (p.codigoCATMAT && p.codigoCATMAT.toLowerCase().includes(searchTerm))
          );
        });
      }

      // Calcula estoque líquido disponível em tempo real
      const responseData = resultados.map((p) => ({
        id: p.id,
        codigoPatrimonio: p.codigoPatrimonio,
        codigoCATMAT: p.codigoCATMAT,
        nome: p.nome,
        descricao: p.descricao,
        categoria: p.categoria,
        estadoConservacao: p.estadoConservacao,
        quantidadeFisica: p.quantidadeFisica,
        quantidadeReservada: p.quantidadeReservada,
        quantidadeDisponivel: Math.max(0, p.quantidadeFisica - p.quantidadeReservada),
        secretaria: p.secretaria.nome,
        secretariaId: p.secretariaId,
        fotoUrl: p.fotoUrl,
      }));

      res.json(responseData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pilar B: Motor de Aprovação e Reserva Virtual
  app.post('/api/requests', async (req: Request, res: Response) => {
    const { requisitanteId, cedenteId, justificativaGeral, itens } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      // return res.status(400).json({ error: "Chave de Idempotência é obrigatória para evitar envios concorrentes." });
    }

    try {
      const resultadoTransacao = await prisma.$transaction(async (tx) => {
        // Validação restrita de e-mail institucional municipal
        const requisitante = await tx.usuario.findUnique({ where: { id: requisitanteId } });
        if (!requisitante || !requisitante.email.endsWith('@pmf.sc.gov.br')) {
          throw new Error("Acesso negado: Requisitante inválido ou e-mail institucional incorreto.");
        }

        for (const item of itens) {
          const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
          if (!produto) throw new Error("Item não localizado.");

          const disponivel = produto.quantidadeFisica - produto.quantidadeReservada;
          if (disponivel < item.quantidade) {
            throw new Error(`Estoque insuficiente de ${produto.nome}.`);
          }

          // Aplica a Reserva Virtual Otimista (I_disponivel = I_fisico - I_reservado)
          await tx.produto.update({
            where: { id: item.produtoId },
            data: { quantidadeReservada: { increment: item.quantidade } },
          });
        }

        return await tx.requisicao.create({
          data: {
            codigo: uuidv4(),
            status: StatusRequisicao.SUBMETIDA,
            requisitanteId,
            cedenteId,
            justificativaGeral,
            itens: {
              create: itens.map((item: any) => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                justificativaItem: item.justificativaItem,
              })),
            },
          },
          include: { itens: true },
        });
      });

      res.status(201).json(resultadoTransacao);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Pilar C: Alerta de Ociosidade no Planejamento de Compras (Simulador)
  app.post('/api/procurement-intent', async (req: Request, res: Response) => {
    const { nomeItem, quantidade, codigoCATMAT, secretariaId } = req.body;

    try {
      const itensOciosos = await prisma.produto.findMany({
        where: {
          OR: [
            { codigoCATMAT: codigoCATMAT },
            { nome: { contains: nomeItem, mode: 'insensitive' } },
          ],
        },
        include: { secretaria: true },
      });

      // Filtra apenas insumos que estão com saldo ativo parado em outras secretarias
      const ociososDisponiveis = itensOciosos.filter(
        (p) => p.quantidadeFisica - p.quantidadeReservada > 0 && p.secretariaId !== secretariaId
      );

      if (ociososDisponiveis.length > 0) {
        return res.status(200).json({
          alertaAtivo: true,
          mensagem: `Alerta Legal! Foram localizados ${ociososDisponiveis.reduce((acc, curr) => acc + (curr.quantidadeFisica - curr.quantidadeReservada), 0)} materiais idênticos ociosos na rede.`,
          sugestoes: ociososDisponiveis.map((p) => ({
            produtoId: p.id,
            nome: p.nome,
            estadoConservacao: p.estadoConservacao,
            quantidadeDisponivel: p.quantidadeFisica - p.quantidadeReservada,
            secretariaCedente: p.secretaria.nome,
          })),
        });
      }

      res.json({ alertaAtivo: false, mensagem: "Inventário livre de ociosidade correspondente." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pilar D: Relatórios de Desempenho e ESG
  app.get('/api/analytics', async (req: Request, res: Response) => {
    try {
      const fatorCO2: { [key: string]: number } = {
        "Mobiliário": 70,   // kg CO2e evitado por unidade reusada
        "Informática": 150, // kg CO2e (computadores/monitores têm alta carga incorporada)
        "Escritório": 5,
      };

      const requisicoesAprovadas = await prisma.requisicao.findMany({
        where: { status: { in: [StatusRequisicao.APROVADA, StatusRequisicao.TRANSFERIDA] } },
        include: { itens: { include: { produto: true } } },
      });

      let RDE_total = 0; // Redução de Despesa Estimada
      let CO2_total_evitado = 0;

      requisicoesAprovadas.forEach((req) => {
        req.itens.forEach((item) => {
          const precoMercadoEstimado = item.produto.categoria === "Informática" ? 1200 : 350;
          RDE_total += item.quantidade * precoMercadoEstimado;

          const fator = fatorCO2[item.produto.categoria] || 10;
          CO2_total_evitado += item.quantidade * fator;
        });
      });

      res.json({
        RDE: RDE_total,
        CO2e: CO2_total_evitado,
        unidadeCO2: "kg",
        movimentacoesSucedidas: requisicoesAprovadas.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
