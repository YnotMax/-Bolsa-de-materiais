import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient, EstadoConservacao, StatusRequisicao } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Automatic Database URL correction
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && dbUrl.includes('.net/?')) {
  process.env.DATABASE_URL = dbUrl.replace('.net/?', '.net/bolsa_materiais?');
} else if (dbUrl && dbUrl.endsWith('.net/')) {
  process.env.DATABASE_URL = dbUrl + 'bolsa_materiais';
}

const prisma = new PrismaClient();

// In-Memory Fallback State for development/demonstration when database is offline
let memoryProducts: any[] = [
  {
    id: "prod-001",
    codigoPatrimonio: "PAT-2024-001",
    codigoCATMAT: "349281",
    nome: "Monitor Dell 24' IPS Full HD",
    descricao: "Monitor LED Dell 24 polegadas com ajuste de altura e rotação pivotante. Excelente estado de conservação, testado e com cabos HDMI e energia inclusos.",
    categoria: "Informática",
    estadoConservacao: "BOM",
    quantidadeFisica: 12,
    quantidadeReservada: 4,
    secretariaId: "sec-001",
    secretaria: { nome: "Secretaria Municipal de Educação (SME)" },
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-002",
    codigoPatrimonio: "PAT-2024-002",
    codigoCATMAT: "442910",
    nome: "Cadeira Ergonômica Presidente Flexform",
    descricao: "Cadeira de escritório ergonômica revestida em tela mesh preta, com braços reguláveis, suporte lombar e mecanismo sincronizado de reclinação.",
    categoria: "Mobiliário",
    estadoConservacao: "NOVO",
    quantidadeFisica: 8,
    quantidadeReservada: 0,
    secretariaId: "sec-002",
    secretaria: { nome: "Secretaria Municipal de Administração (SMA)" },
    fotoUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1273?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-003",
    codigoPatrimonio: "PAT-2024-003",
    codigoCATMAT: "442915",
    nome: "Mesa de Escritório em L (Estação de Trabalho)",
    descricao: "Estação de trabalho em MDP com acabamento amadeirado e calha passa-cabos embutida. Ideal para atendimento ao público ou salas administrativas.",
    categoria: "Mobiliário",
    estadoConservacao: "REGULAR",
    quantidadeFisica: 5,
    quantidadeReservada: 2,
    secretariaId: "sec-003",
    secretaria: { nome: "Secretaria Municipal de Saúde (SMS)" },
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-004",
    codigoPatrimonio: "PAT-2024-004",
    codigoCATMAT: "150921",
    nome: "Caixa de Papel Sulfite A4 (5000 Folhas)",
    descricao: "Caixa lacrada contendo 10 ream de papel de alta alvura para impressão e fotocópia institucional.",
    categoria: "Escritório",
    estadoConservacao: "NOVO",
    quantidadeFisica: 25,
    quantidadeReservada: 0,
    secretariaId: "sec-004",
    secretaria: { nome: "Secretaria de Assistência Social (SEMAS)" },
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-005",
    codigoPatrimonio: "PAT-2024-005",
    codigoCATMAT: "392810",
    nome: "Notebook Lenovo ThinkPad i5 16GB",
    descricao: "Notebook corporativo Intel Core i5, 16GB RAM, SSD 512GB, tela 14 polegadas FHD. Acompanha carregador original.",
    categoria: "Informática",
    estadoConservacao: "BOM",
    quantidadeFisica: 6,
    quantidadeReservada: 0,
    secretariaId: "sec-001",
    secretaria: { nome: "Secretaria Municipal de Educação (SME)" },
    fotoUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-010",
    codigoPatrimonio: "PMF-102941",
    codigoCATMAT: "302841",
    nome: "Projetor Multimídia Epson",
    categoria: "Outros",
    estadoConservacao: "REGULAR",
    quantidade: 4,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Projetor de 3000 lumens, entrada HDMI e VGA. A lâmpada está com 1200 horas de uso (vida útil estimada de 4000h). Acompanha controle remoto e cabo de força.",
    valorEstimadoNovo: 3200.00,
    co2eEvitadoKg: 90
  },
  {
    id: "prod-011",
    codigoPatrimonio: "PMF-992384",
    codigoCATMAT: "442935",
    nome: "Armário de Aço 2 Portas",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    quantidade: 6,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Armário de aço reforçado, cor cinza, com duas portas de abrir e 4 prateleiras reguláveis. Ideal para arquivo morto e materiais de almoxarifado. Inclui chaves.",
    valorEstimadoNovo: 750.00,
    co2eEvitadoKg: 55
  },
  {
    id: "prod-012",
    codigoPatrimonio: "PMF-334212",
    codigoCATMAT: "389210",
    nome: "Fragmentadora de Papel Secreta",
    categoria: "Outros",
    estadoConservacao: "SUCATA",
    quantidade: 2,
    secretariaOrigem: "Secretaria Municipal de Finanças (SEF)",
    fotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Fragmentadora industrial com motor travado. Lâminas e cesto em bom estado, serve para doação de peças ou conserto especializado.",
    valorEstimadoNovo: 1500.00,
    co2eEvitadoKg: 70
  },
  {
    id: "prod-013",
    codigoPatrimonio: "PMF-772930",
    codigoCATMAT: "294825",
    nome: "Mesa de Reunião Redonda",
    categoria: "Mobiliário",
    estadoConservacao: "REGULAR",
    quantidade: 3,
    secretariaOrigem: "Secretaria Municipal de Planejamento (SMP)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesa redonda para reunião, diâmetro de 1,20m, base disco de aço escovado. Apresenta lascados nas bordas do tampo.",
    valorEstimadoNovo: 600.00,
    co2eEvitadoKg: 20
  },
  {
    id: "prod-014",
    codigoPatrimonio: "PMF-448291",
    codigoCATMAT: "150925",
    nome: "Quadro Branco Magnético",
    categoria: "Materiais de Escritório",
    estadoConservacao: "BOM",
    quantidade: 20,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Quadro branco magnético tamanho 1,20m x 0,90m, moldura em alumínio. Perfeito para salas de aula e reuniões rápidas.",
    valorEstimadoNovo: 180.00,
    co2eEvitadoKg: 8
  },
  {
    id: "prod-015",
    codigoPatrimonio: "PMF-558291",
    codigoCATMAT: "392815",
    nome: "Mouse Óptico USB",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    quantidade: 100,
    secretariaOrigem: "Instituto de Planejamento Urbano (IPUF)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mouse óptico com fio USB, design ergonômico básico, 3 botões com scroll. Lotes lacrados excedentes de licitação.",
    valorEstimadoNovo: 25.00,
    co2eEvitadoKg: 1
  }
];

let memoryRequisitions: any[] = [
  {
    id: "req-001",
    codigoProcesso: "PMF-48291/2026",
    codigo: "PMF-48291/2026",
    dataCriacao: "10/07/2026",
    status: "SUBMETIDA",
    requisitanteId: "user-001",
    cedenteId: "sec-003",
    justificativaGeral: "Necessidade de substituição de mobiliário no setor de atendimento ao cidadão.",
    requisitante: {
      nomeCompleto: "Thiago Barbosa",
      matriculaFuncional: "884321-9",
      secretariaSetor: "Secretaria Municipal de Saúde (SMS)",
      emailInstitucional: "thiago.barbosa@pmf.sc.gov.br",
      declaraTermos: true
    },
    itens: [
      {
        produtoId: "prod-003",
        nome: "Mesa de Escritório em L",
        quantidade: 2,
        justificativa: "Substituição de mobiliário danificado na recepção da UBS Trindade.",
        secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
        valorEstimadoNovo: 850.00,
        co2eEvitadoKg: 35
      }
    ],
    historicoStatus: [
      { status: "RASCUNHO", data: "10/07/2026 10:15", responsavel: "Thiago Barbosa" },
      { status: "SUBMETIDA", data: "10/07/2026 10:30", responsavel: "Thiago Barbosa", observacao: "Reserva física temporária garantida automaticamente" }
    ]
  },
  {
    id: "req-002",
    codigoProcesso: "PMF-34912/2026",
    codigo: "PMF-34912/2026",
    dataCriacao: "08/07/2026",
    status: "APROVADA",
    requisitanteId: "user-002",
    cedenteId: "sec-001",
    justificativaGeral: "Equipar novos auditores de fiscalização.",
    requisitante: {
      nomeCompleto: "Tony Max",
      matriculaFuncional: "128493-5",
      secretariaSetor: "Secretaria Municipal de Administração (SMA)",
      emailInstitucional: "tony.max@pmf.sc.gov.br",
      declaraTermos: true
    },
    itens: [
      {
        produtoId: "prod-001",
        nome: "Monitor Dell 24' IPS Full HD",
        quantidade: 4,
        justificativa: "Equipar a nova equipe de planejamento e monitoramento de contratos.",
        secretariaOrigem: "Secretaria Municipal de Educação (SME)",
        valorEstimadoNovo: 950.00,
        co2eEvitadoKg: 45
      }
    ],
    historicoStatus: [
      { status: "SUBMETIDA", data: "08/07/2026 14:00", responsavel: "Tony Max" },
      { status: "APROVADA", data: "09/07/2026 09:15", responsavel: "Gestor Central", observacao: "Cessão homologada. Termo de cessão disponível para assinatura." }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Pilar A: Vitrine e Busca Inteligente (Fuzzy Matching)
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const { search, categoria, estado, secretariaId } = req.query;

      if (process.env.DATABASE_URL) {
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

        return res.json(responseData);
      }

      // Fallback em memória
      let resultados = memoryProducts;

      if (categoria) {
        resultados = resultados.filter(p => p.categoria === categoria);
      }
      if (estado) {
        resultados = resultados.filter(p => p.estadoConservacao === estado);
      }
      if (search) {
        const term = String(search).toLowerCase();
        resultados = resultados.filter(p => 
          p.nome.toLowerCase().includes(term) ||
          p.descricao.toLowerCase().includes(term) ||
          p.codigoPatrimonio.toLowerCase().includes(term) ||
          p.codigoCATMAT.toLowerCase().includes(term)
        );
      }

      const responseData = resultados.map(p => ({
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
        fotoUrl: p.fotoUrl
      }));

      res.json(responseData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/requests - Lista requisições de remanejamento
  app.get('/api/requests', async (req: Request, res: Response) => {
    try {
      if (process.env.DATABASE_URL) {
        const reqs = await prisma.requisicao.findMany({
          include: {
            itens: { include: { produto: true } },
            requisitante: true,
            cedente: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return res.json(reqs);
      }

      res.json(memoryRequisitions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pilar B: Motor de Aprovação e Reserva Virtual
  app.post('/api/requests', async (req: Request, res: Response) => {
    const { requisitanteId, cedenteId, justificativaGeral, requisitante, itens } = req.body;

    try {
      if (process.env.DATABASE_URL && requisitanteId && cedenteId) {
        const resultadoTransacao = await prisma.$transaction(async (tx) => {
          const reqUser = await tx.usuario.findUnique({ where: { id: requisitanteId } });
          if (!reqUser || !reqUser.email.endsWith('@pmf.sc.gov.br')) {
            throw new Error("Acesso negado: Requisitante inválido ou e-mail institucional incorreto.");
          }

          for (const item of itens) {
            const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
            if (!produto) throw new Error("Item não localizado.");

            const disponivel = produto.quantidadeFisica - produto.quantidadeReservada;
            if (disponivel < item.quantidade) {
              throw new Error(`Estoque insuficiente de ${produto.nome}.`);
            }

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
                  justificativaItem: item.justificativaItem || item.justificativa,
                })),
              },
            },
            include: { itens: true },
          });
        });

        return res.status(201).json(resultadoTransacao);
      }

      // Validação de E-mail Institucional
      const email = requisitante?.emailInstitucional || '';
      if (!email.endsWith('@pmf.sc.gov.br')) {
        return res.status(400).json({ error: "Acesso negado: O e-mail deve pertencer ao domínio @pmf.sc.gov.br." });
      }

      // Aplicação em memória com Reserva Virtual Otimista
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const codigoProcesso = `PMF-${randomNum}/2026`;
      const dataCriacao = new Date().toLocaleDateString('pt-BR');

      const novaReq: any = {
        id: `req-${Date.now()}`,
        codigoProcesso,
        codigo: codigoProcesso,
        dataCriacao,
        status: "SUBMETIDA",
        requisitante: requisitante || {
          nomeCompleto: "Servidor Municipal",
          matriculaFuncional: "123456-0",
          secretariaSetor: "Secretaria Requisitante",
          emailInstitucional: email,
          declaraTermos: true
        },
        itens: itens.map((item: any) => {
          const prod = memoryProducts.find(p => p.id === item.produtoId);
          if (prod) {
            prod.quantidadeReservada = (prod.quantidadeReservada || 0) + item.quantidade;
          }
          return {
            produtoId: item.produtoId,
            nome: prod ? prod.nome : "Material Ocioso",
            quantidade: item.quantidade,
            justificativa: item.justificativaItem || item.justificativa || "Atendimento ao interesse público",
            secretariaOrigem: prod ? prod.secretaria.nome : "Prefeitura de Florianópolis",
            valorEstimadoNovo: prod?.categoria === 'Informática' ? 950 : 850,
            co2eEvitadoKg: prod?.categoria === 'Informática' ? 45 : 35
          };
        }),
        historicoStatus: [
          {
            status: "SUBMETIDA",
            data: `${dataCriacao} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
            responsavel: requisitante?.nomeCompleto || "Servidor Requisitante",
            observacao: "Reserva física temporária garantida automaticamente"
          }
        ]
      };

      memoryRequisitions.unshift(novaReq);
      res.status(201).json(novaReq);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/requests/:id/status - Atualização de ciclo de vida do workflow
  app.patch('/api/requests/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, motivoRejeicao } = req.body;

    try {
      if (process.env.DATABASE_URL) {
        const updated = await prisma.requisicao.update({
          where: { id },
          data: {
            status: status as StatusRequisicao,
            motivoRejeicao: motivoRejeicao || undefined,
          },
          include: { itens: true },
        });

        // Se APROVADA ou TRANSFERIDA, baixar estoque físico
        if (status === StatusRequisicao.APROVADA || status === StatusRequisicao.TRANSFERIDA) {
          for (const item of updated.itens) {
            await prisma.produto.update({
              where: { id: item.produtoId },
              data: {
                quantidadeFisica: { decrement: item.quantidade },
                quantidadeReservada: { decrement: item.quantidade },
              },
            });
          }
        }

        return res.json(updated);
      }

      // Em memória
      const reqTarget = memoryRequisitions.find(r => r.id === id);
      if (!reqTarget) {
        return res.status(404).json({ error: "Requisição não encontrada." });
      }

      reqTarget.status = status;
      if (motivoRejeicao) reqTarget.motivoRejeicao = motivoRejeicao;

      const timestamp = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      reqTarget.historicoStatus.push({
        status,
        data: timestamp,
        responsavel: 'Gestor Central (SMA)',
        observacao: status === 'APROVADA' ? 'Dotação homologada. Pronta para remanejamento físico.' : status === 'REJEITADA' ? 'Solicitação indeferida' : undefined
      });

      // Baixa de estoque se APROVADA
      if (status === 'APROVADA') {
        reqTarget.itens.forEach((item: any) => {
          const prod = memoryProducts.find(p => p.id === item.produtoId);
          if (prod) {
            prod.quantidadeFisica = Math.max(0, prod.quantidadeFisica - item.quantidade);
            prod.quantidadeReservada = Math.max(0, prod.quantidadeReservada - item.quantidade);
          }
        });
      }

      res.json(reqTarget);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pilar C: Alerta de Ociosidade no Planejamento de Compras (Simulador)
  app.post('/api/procurement-intent', async (req: Request, res: Response) => {
    const { nomeItem, quantidade, codigoCATMAT, secretariaId } = req.body;

    try {
      if (process.env.DATABASE_URL) {
        const itensOciosos = await prisma.produto.findMany({
          where: {
            OR: [
              { codigoCATMAT: codigoCATMAT },
              { nome: { contains: nomeItem, mode: 'insensitive' } },
            ],
          },
          include: { secretaria: true },
        });

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

        return res.json({ alertaAtivo: false, mensagem: "Inventário livre de ociosidade correspondente." });
      }

      // Fallback em memória
      const catmatTerm = (codigoCATMAT || '').trim();
      const nameTerm = (nomeItem || '').toLowerCase().trim();

      const ociososDisponiveis = memoryProducts.filter(p => {
        const disponivel = p.quantidadeFisica - p.quantidadeReservada;
        if (disponivel <= 0) return false;
        
        const matchCatmat = catmatTerm && p.codigoCATMAT === catmatTerm;
        const matchName = nameTerm && p.nome.toLowerCase().includes(nameTerm);
        return matchCatmat || matchName;
      });

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
        "Mobiliário": 70,
        "Informática": 150,
        "Escritório": 5,
      };

      if (process.env.DATABASE_URL) {
        const requisicoesAprovadas = await prisma.requisicao.findMany({
          where: { status: { in: [StatusRequisicao.APROVADA, StatusRequisicao.TRANSFERIDA] } },
          include: { itens: { include: { produto: true } } },
        });

        let RDE_total = 0;
        let CO2_total_evitado = 0;

        requisicoesAprovadas.forEach((req) => {
          req.itens.forEach((item) => {
            const precoMercadoEstimado = item.produto.categoria === "Informática" ? 1200 : 350;
            RDE_total += item.quantidade * precoMercadoEstimado;

            const fator = fatorCO2[item.produto.categoria] || 10;
            CO2_total_evitado += item.quantidade * fator;
          });
        });

        return res.json({
          RDE: RDE_total,
          CO2e: CO2_total_evitado,
          unidadeCO2: "kg",
          movimentacoesSucedidas: requisicoesAprovadas.length,
        });
      }

      // Em memória
      let RDE_total = 87430.00;
      let CO2_total_evitado = 3840;
      const aprovadas = memoryRequisitions.filter(r => r.status === 'APROVADA' || r.status === 'TRANSFERIDA');

      aprovadas.forEach((req) => {
        req.itens.forEach((item: any) => {
          RDE_total += (item.valorEstimadoNovo || 350) * item.quantidade;
          CO2_total_evitado += (item.co2eEvitadoKg || 10) * item.quantidade;
        });
      });

      res.json({
        RDE: RDE_total,
        CO2e: CO2_total_evitado,
        unidadeCO2: "kg",
        movimentacoesSucedidas: aprovadas.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware para desenvolvimento
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
