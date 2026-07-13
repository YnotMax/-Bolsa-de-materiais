import { PrismaClient, Role, EstadoConservacao } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Semeando ambiente laboratorial (TRL3)...");

  await prisma.itemRequisicao.deleteMany({});
  await prisma.requisicao.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.secretaria.deleteMany({});

  // Criação de órgãos locais de Florianópolis
  const sma = await prisma.secretaria.create({ data: { nome: "Secretaria Municipal de Administração", sigla: "SMA" } });
  const sme = await prisma.secretaria.create({ data: { nome: "Secretaria Municipal de Educação", sigla: "SME" } });
  const sms = await prisma.secretaria.create({ data: { nome: "Secretaria Municipal de Saúde", sigla: "SMS" } });
  const semas = await prisma.secretaria.create({ data: { nome: "Secretaria Municipal de Assistência Social", sigla: "SEMAS" } });

  // Criação de servidores simulados
  await prisma.usuario.create({
    data: { nome: "Thiago Barbosa", matricula: "PMF-99450", email: "thiago.barbosa@pmf.sc.gov.br", role: Role.GESTOR_CENTRAL, secretariaId: sma.id }
  });
  await prisma.usuario.create({
    data: { nome: "Tony Max da Silva Costa", matricula: "PMF-39953", email: "tony.costa@pmf.sc.gov.br", role: Role.SECRETARIA_CEDENTE, secretariaId: sme.id }
  });
  await prisma.usuario.create({
    data: { nome: "Maurício Alexandre", matricula: "PMF-05199", email: "mauricio.alexandre@pmf.sc.gov.br", role: Role.SECRETARIA_REQUISITANTE, secretariaId: sms.id }
  });

  // Cadastro de insumos de teste
  await prisma.produto.createMany({
    data: [
      {
        codigoPatrimonio: "PMF-129482",
        codigoCATMAT: "389281",
        nome: "Monitor Dell 24 Polegadas",
        descricao: "Monitor profissional regulável HDMI/DisplayPort em perfeito estado",
        categoria: "Informática",
        estadoConservacao: EstadoConservacao.BOM,
        quantidadeFisica: 15,
        secretariaId: sme.id,
        fotoUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&q=80&w=600&h=400"
      },
      {
        codigoPatrimonio: "PMF-229410",
        codigoCATMAT: "120394",
        nome: "Cadeira Giratória de Escritório",
        descricao: "Cadeira ergonômica ajustável com braços reguláveis na cor preta",
        categoria: "Mobiliário",
        estadoConservacao: EstadoConservacao.BOM,
        quantidadeFisica: 25,
        secretariaId: sms.id,
        fotoUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600&h=400"
      },
      {
        codigoPatrimonio: "PMF-338291",
        codigoCATMAT: "492819",
        nome: "Mesa de Escritório MDF",
        descricao: "Mesa ampla para computador com canaleta interna de fiação. Estado regular.",
        categoria: "Mobiliário",
        estadoConservacao: EstadoConservacao.REGULAR,
        quantidadeFisica: 8,
        secretariaId: semas.id,
        fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400"
      },
      {
        codigoPatrimonio: null,
        codigoCATMAT: "110293",
        nome: "Resma de Papel A4 Chamex",
        descricao: "Papel sulfite branco 75g/m² pacote de 500 folhas",
        categoria: "Escritório",
        estadoConservacao: EstadoConservacao.NOVO,
        quantidadeFisica: 200,
        secretariaId: sme.id,
        fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400"
      }
    ]
  });

  console.log("Base de dados local TRL3 semeada com sucesso!");
}

main();
