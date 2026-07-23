/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Produto, EstadoConservacao, User, UserRule } from './types';

export const MOCK_PRODUTOS: Produto[] = [
  // --- MONITORES (CATMAT 349281) ---
  {
    id: "prod-001",
    codigoPatrimonio: "PMF-129482",
    codigoCatmat: "349281",
    nome: "Monitor Dell 24 Polegadas",
    categoria: "Informática",
    estadoConservacao: "BOM",
    detalhamentoEstado: "15 Bons em SME",
    quantidade: 15,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Monitor Dell Professional de 24 polegadas, resolução Full HD (1920x1080), conexões HDMI e DisplayPort. Em excelente estado de conservação, testado e com cabos inclusos.",
    valorEstimadoNovo: 950.00,
    co2eEvitadoKg: 45
  },
  {
    id: "prod-001-sma-novo",
    codigoPatrimonio: "PMF-129483",
    codigoCatmat: "349281",
    nome: "Monitor Dell 24 Polegadas",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "25 Novos em SMA",
    quantidade: 25,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Monitor Dell Professional de 24 polegadas na caixa original lacrada.",
    valorEstimadoNovo: 950.00,
    co2eEvitadoKg: 45
  },
  {
    id: "prod-001-sms-reg",
    codigoPatrimonio: "PMF-129484",
    codigoCatmat: "349281",
    nome: "Monitor Dell 24 Polegadas",
    categoria: "Informática",
    estadoConservacao: "REGULAR",
    detalhamentoEstado: "10 Regulares em SMS",
    quantidade: 10,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Monitor Dell de 24 polegadas com pequenos riscos superficiais na carcaça.",
    valorEstimadoNovo: 950.00,
    co2eEvitadoKg: 45
  },
  {
    id: "prod-001-semas-pes",
    codigoPatrimonio: "PMF-129485",
    codigoCatmat: "349281",
    nome: "Monitor Dell 24 Polegadas",
    categoria: "Informática",
    estadoConservacao: "PESSIMO",
    detalhamentoEstado: "3 Péssimos em SEMAS",
    quantidade: 3,
    secretariaOrigem: "Secretaria de Assistência Social (SEMAS)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Monitor Dell de 24 polegadas com manchas no display, ideal para reposição de peças.",
    valorEstimadoNovo: 950.00,
    co2eEvitadoKg: 45
  },

  // --- CADEIRAS (CATMAT 442910) ---
  {
    id: "prod-002",
    codigoPatrimonio: "PMF-084931",
    codigoCatmat: "442910",
    nome: "Cadeira Giratória Ergonômica",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    detalhamentoEstado: "8 Boas em SMA",
    quantidade: 8,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Cadeira giratória com braços reguláveis, apoio lombar ajustável, mecanismo relax e rodízios PU que evitam riscos no piso. Revestimento em tecido crepe preto.",
    valorEstimadoNovo: 680.00,
    co2eEvitadoKg: 25
  },
  {
    id: "prod-002-sme-novo",
    codigoPatrimonio: "PMF-084932",
    codigoCatmat: "442910",
    nome: "Cadeira Giratória Ergonômica",
    categoria: "Mobiliário",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "30 Novas em SME",
    quantidade: 30,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Lote de cadeiras ergonômicas recém-entregues sem uso prévio.",
    valorEstimadoNovo: 680.00,
    co2eEvitadoKg: 25
  },
  {
    id: "prod-002-sms-reg",
    codigoPatrimonio: "PMF-084933",
    codigoCatmat: "442910",
    nome: "Cadeira Giratória Ergonômica",
    categoria: "Mobiliário",
    estadoConservacao: "REGULAR",
    detalhamentoEstado: "14 Regulares em SMS",
    quantidade: 14,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Cadeiras giratórias com pequenas marcas de desgaste no estofado.",
    valorEstimadoNovo: 680.00,
    co2eEvitadoKg: 25
  },
  {
    id: "prod-002-sctc-suc",
    codigoPatrimonio: "PMF-084934",
    codigoCatmat: "442910",
    nome: "Cadeira Giratória Ergonômica",
    categoria: "Mobiliário",
    estadoConservacao: "SUCATA",
    detalhamentoEstado: "4 Sucatas em SCTC",
    quantidade: 4,
    secretariaOrigem: "Secretaria de Turismo, Cultura e Esporte (SCTC)",
    fotoUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Cadeiras com amortecedor a gás quebrado e pistão danificado.",
    valorEstimadoNovo: 680.00,
    co2eEvitadoKg: 25
  },

  // --- MESAS (CATMAT 294821) --- (Conforme desenho do usuário no screenshot)
  {
    id: "prod-003",
    codigoPatrimonio: "PMF-349204",
    codigoCatmat: "294821",
    nome: "Mesa de Escritório em L",
    categoria: "Mobiliário",
    estadoConservacao: "REGULAR",
    detalhamentoEstado: "12 Regulares em SMS",
    quantidade: 12,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesa de escritório em formato L com tampo de 25mm de espessura, estrutura metálica e calha para passagem de cabos. Dimensões: 1,60m x 1,60m. Apresenta pequenos riscos de uso.",
    valorEstimadoNovo: 850.00,
    co2eEvitadoKg: 35
  },
  {
    id: "prod-003-sms-novo",
    codigoPatrimonio: "PMF-349205",
    codigoCatmat: "294821",
    nome: "Mesa de Escritório em L",
    categoria: "Mobiliário",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "10 Novas em SMS",
    quantidade: 10,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesas em L novas, desmontadas na embalagem original.",
    valorEstimadoNovo: 850.00,
    co2eEvitadoKg: 35
  },
  {
    id: "prod-003-sms-bom",
    codigoPatrimonio: "PMF-349206",
    codigoCatmat: "294821",
    nome: "Mesa de Escritório em L",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    detalhamentoEstado: "9 Boas em SMS",
    quantidade: 9,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesas em L em bom estado de conservação.",
    valorEstimadoNovo: 850.00,
    co2eEvitadoKg: 35
  },
  {
    id: "prod-003-sms-pessimo",
    codigoPatrimonio: "PMF-349207",
    codigoCatmat: "294821",
    nome: "Mesa de Escritório em L",
    categoria: "Mobiliário",
    estadoConservacao: "PESSIMO",
    detalhamentoEstado: "2 Péssimas em SMS",
    quantidade: 2,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesas com tampo avariado por umidade.",
    valorEstimadoNovo: 850.00,
    co2eEvitadoKg: 35
  },
  {
    id: "prod-003-sme-bom",
    codigoPatrimonio: "PMF-349208",
    codigoCatmat: "294821",
    nome: "Mesa de Escritório em L",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    detalhamentoEstado: "15 Boas em SME",
    quantidade: 15,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Lote de mesas em L disponíveis na SME.",
    valorEstimadoNovo: 850.00,
    co2eEvitadoKg: 35
  },

  // --- PAPEL A4 (CATMAT 150921) ---
  {
    id: "prod-004",
    codigoPatrimonio: "PMF-889341",
    codigoCatmat: "150921",
    nome: "Resma de Papel A4 500fls",
    categoria: "Materiais de Escritório",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "140 Novas em SEF",
    quantidade: 140,
    secretariaOrigem: "Secretaria Municipal de Finanças (SEF)",
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Papel almaço/sulfite branco tamanho A4 (210mm x 297mm), gramatura 75g/m². Caixas fechadas remanescentes de planejamento anual superestimado.",
    valorEstimadoNovo: 32.00,
    co2eEvitadoKg: 2
  },
  {
    id: "prod-004-sme-novo",
    codigoPatrimonio: "PMF-889342",
    codigoCatmat: "150921",
    nome: "Resma de Papel A4 500fls",
    categoria: "Materiais de Escritório",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "200 Novas em SME",
    quantidade: 200,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Caixas de resmas A4 disponíveis no almoxarifado central da Educação.",
    valorEstimadoNovo: 32.00,
    co2eEvitadoKg: 2
  },
  {
    id: "prod-004-sma-novo",
    codigoPatrimonio: "PMF-889343",
    codigoCatmat: "150921",
    nome: "Resma de Papel A4 500fls",
    categoria: "Materiais de Escritório",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "85 Novas em SMA",
    quantidade: 85,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Resmas de papel sulfite de estoque excedente da SMA.",
    valorEstimadoNovo: 32.00,
    co2eEvitadoKg: 2
  },

  // --- NOTEBOOKS (CATMAT 392810) ---
  {
    id: "prod-005",
    codigoPatrimonio: "PMF-294830",
    codigoCatmat: "392810",
    nome: "Notebook Lenovo ThinkPad L14",
    categoria: "Informática",
    estadoConservacao: "BOM",
    detalhamentoEstado: "5 Bons em SMP",
    quantidade: 5,
    secretariaOrigem: "Secretaria Municipal de Planejamento (SMP)",
    fotoUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Processador Intel Core i5 de 10ª Geração, 16GB RAM, SSD 256GB, Tela 14 polegadas HD, teclado ABNT2. Equipamentos retornados de contratos temporários de projetos.",
    valorEstimadoNovo: 4200.00,
    co2eEvitadoKg: 120
  },
  {
    id: "prod-005-sma-novo",
    codigoPatrimonio: "PMF-294831",
    codigoCatmat: "392810",
    nome: "Notebook Lenovo ThinkPad L14",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "12 Novos em SMA",
    quantidade: 12,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Notebooks ThinkPad na caixa lacrada.",
    valorEstimadoNovo: 4200.00,
    co2eEvitadoKg: 120
  },
  {
    id: "prod-005-sms-bom",
    codigoPatrimonio: "PMF-294832",
    codigoCatmat: "392810",
    nome: "Notebook Lenovo ThinkPad L14",
    categoria: "Informática",
    estadoConservacao: "BOM",
    detalhamentoEstado: "8 Bons em SMS",
    quantidade: 8,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Notebooks em ótimo estado de funcionamento.",
    valorEstimadoNovo: 4200.00,
    co2eEvitadoKg: 120
  },

  // --- AR CONDICIONADO (CATMAT 209412) ---
  {
    id: "prod-006",
    codigoPatrimonio: "PMF-582910",
    codigoCatmat: "209412",
    nome: "Ar Condicionado Split 12000 BTU",
    categoria: "Outros",
    estadoConservacao: "REGULAR",
    detalhamentoEstado: "3 Regulares em SCTC",
    quantidade: 3,
    secretariaOrigem: "Secretaria de Turismo, Cultura e Esporte (SCTC)",
    fotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Aparelho de ar condicionado Split, ciclo frio, 220V. Necessita de higienização padrão e substituição simples de fita de isolamento na unidade condensadora externa.",
    valorEstimadoNovo: 1800.00,
    co2eEvitadoKg: 85
  },
  {
    id: "prod-006-sms-bom",
    codigoPatrimonio: "PMF-582911",
    codigoCatmat: "209412",
    nome: "Ar Condicionado Split 12000 BTU",
    categoria: "Outros",
    estadoConservacao: "BOM",
    detalhamentoEstado: "6 Bons em SMS",
    quantidade: 6,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Aparelhos de ar condicionado revisados recentemente.",
    valorEstimadoNovo: 1800.00,
    co2eEvitadoKg: 85
  },

  // --- IMPRESSORAS (CATMAT 348210) ---
  {
    id: "prod-007",
    codigoPatrimonio: "PMF-729481",
    codigoCatmat: "348210",
    nome: "Impressora Multifuncional HP LaserJet Pro",
    categoria: "Informática",
    estadoConservacao: "PESSIMO",
    detalhamentoEstado: "2 Péssimas em SEMAS",
    quantidade: 2,
    secretariaOrigem: "Secretaria de Assistência Social (SEMAS)",
    fotoUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Impressora a laser monocromática, fotocopiadora e scanner. Apresenta falha no tracionador de papel e atolamento constante. Recomendada apenas para reparo completo ou doação de peças.",
    valorEstimadoNovo: 1200.00,
    co2eEvitadoKg: 50
  },
  {
    id: "prod-007-sme-bom",
    codigoPatrimonio: "PMF-729482",
    codigoCatmat: "348210",
    nome: "Impressora Multifuncional HP LaserJet Pro",
    categoria: "Informática",
    estadoConservacao: "BOM",
    detalhamentoEstado: "8 Boas em SME",
    quantidade: 8,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Impressoras revisadas com toner incluso.",
    valorEstimadoNovo: 1200.00,
    co2eEvitadoKg: 50
  },

  // --- GAVETEIROS (CATMAT 442930) ---
  {
    id: "prod-008",
    codigoPatrimonio: "PMF-482012",
    codigoCatmat: "442930",
    nome: "Gaveteiro de Madeira 3 Gavetas",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    detalhamentoEstado: "14 Bons em IPUF",
    quantidade: 14,
    secretariaOrigem: "Instituto de Planejamento Urbano (IPUF)",
    fotoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Gaveteiro volante em MDF, cor carvalho, 3 gavetas (sendo 1 gaveta para pastas suspensas), com chave. Rolamentos em perfeito estado.",
    valorEstimadoNovo: 350.00,
    co2eEvitadoKg: 15
  },
  {
    id: "prod-008-sma-novo",
    codigoPatrimonio: "PMF-482013",
    codigoCatmat: "442930",
    nome: "Gaveteiro de Madeira 3 Gavetas",
    categoria: "Mobiliário",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "10 Novos em SMA",
    quantidade: 10,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Gaveteiros novos embalados de fábrica.",
    valorEstimadoNovo: 350.00,
    co2eEvitadoKg: 15
  },

  // --- TECLADOS (CATMAT 258391) ---
  {
    id: "prod-009",
    codigoPatrimonio: "PMF-994810",
    codigoCatmat: "258391",
    nome: "Teclado USB Standard Preto",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "45 Novos em SMA",
    quantidade: 45,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Teclados USB com fio pretos, padrão ABNT2, teclas silenciosas de perfil baixo. Caixa original lacrada.",
    valorEstimadoNovo: 60.00,
    co2eEvitadoKg: 5
  },
  {
    id: "prod-009-sme-novo",
    codigoPatrimonio: "PMF-994811",
    codigoCatmat: "258391",
    nome: "Teclado USB Standard Preto",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "60 Novos em SME",
    quantidade: 60,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Teclados USB lacrados no depósito central da Educação.",
    valorEstimadoNovo: 60.00,
    co2eEvitadoKg: 5
  },

  // --- PROJETORES (CATMAT 302841) ---
  {
    id: "prod-010",
    codigoPatrimonio: "PMF-102941",
    codigoCatmat: "302841",
    nome: "Projetor Multimídia Epson",
    categoria: "Outros",
    estadoConservacao: "REGULAR",
    detalhamentoEstado: "4 Regulares em SME",
    quantidade: 4,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Projetor de 3000 lumens, entrada HDMI e VGA. A lâmpada está com 1200 horas de uso (vida útil estimada de 4000h). Acompanha controle remoto e cabo de força.",
    valorEstimadoNovo: 3200.00,
    co2eEvitadoKg: 90
  },
  {
    id: "prod-010-sctc-bom",
    codigoPatrimonio: "PMF-102942",
    codigoCatmat: "302841",
    nome: "Projetor Multimídia Epson",
    categoria: "Outros",
    estadoConservacao: "BOM",
    detalhamentoEstado: "5 Bons em SCTC",
    quantidade: 5,
    secretariaOrigem: "Secretaria de Turismo, Cultura e Esporte (SCTC)",
    fotoUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Projetores Epson em excelente estado de funcionamento.",
    valorEstimadoNovo: 3200.00,
    co2eEvitadoKg: 90
  },

  // --- ARMÁRIOS (CATMAT 442935) ---
  {
    id: "prod-011",
    codigoPatrimonio: "PMF-992384",
    codigoCatmat: "442935",
    nome: "Armário de Aço 2 Portas",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    detalhamentoEstado: "6 Bons em SMS",
    quantidade: 6,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Armário de aço reforçado, cor cinza, com duas portas de abrir e 4 prateleiras reguláveis. Ideal para arquivo morto e materiais de almoxarifado. Inclui chaves.",
    valorEstimadoNovo: 750.00,
    co2eEvitadoKg: 55
  },
  {
    id: "prod-011-sma-novo",
    codigoPatrimonio: "PMF-992385",
    codigoCatmat: "442935",
    nome: "Armário de Aço 2 Portas",
    categoria: "Mobiliário",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "10 Novos em SMA",
    quantidade: 10,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Armários de aço novos, sem uso.",
    valorEstimadoNovo: 750.00,
    co2eEvitadoKg: 55
  },

  // --- FRAGMENTADORAS (CATMAT 389210) ---
  {
    id: "prod-012",
    codigoPatrimonio: "PMF-334212",
    codigoCatmat: "389210",
    nome: "Fragmentadora de Papel Secreta",
    categoria: "Outros",
    estadoConservacao: "SUCATA",
    detalhamentoEstado: "2 Sucatas em SEF",
    quantidade: 2,
    secretariaOrigem: "Secretaria Municipal de Finanças (SEF)",
    fotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Fragmentadora industrial com motor travado. Lâminas e cesto em bom estado, serve para doação de peças ou conserto especializado.",
    valorEstimadoNovo: 1500.00,
    co2eEvitadoKg: 70
  },

  // --- MESAS DE REUNIÃO (CATMAT 294825) ---
  {
    id: "prod-013",
    codigoPatrimonio: "PMF-772930",
    codigoCatmat: "294825",
    nome: "Mesa de Reunião Redonda",
    categoria: "Mobiliário",
    estadoConservacao: "REGULAR",
    detalhamentoEstado: "3 Regulares em SMP",
    quantidade: 3,
    secretariaOrigem: "Secretaria Municipal de Planejamento (SMP)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesa redonda para reunião, diâmetro de 1,20m, base disco de aço escovado. Apresenta lascados nas bordas do tampo.",
    valorEstimadoNovo: 600.00,
    co2eEvitadoKg: 20
  },

  // --- QUADROS BRANCOS (CATMAT 150925) ---
  {
    id: "prod-014",
    codigoPatrimonio: "PMF-448291",
    codigoCatmat: "150925",
    nome: "Quadro Branco Magnético",
    categoria: "Materiais de Escritório",
    estadoConservacao: "BOM",
    detalhamentoEstado: "20 Bons em SME",
    quantidade: 20,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Quadro branco magnético tamanho 1,20m x 0,90m, moldura em alumínio. Perfeito para salas de aula e reuniões rápidas.",
    valorEstimadoNovo: 180.00,
    co2eEvitadoKg: 8
  },

  // --- MOUSES (CATMAT 392815) ---
  {
    id: "prod-015",
    codigoPatrimonio: "PMF-558291",
    codigoCatmat: "392815",
    nome: "Mouse Óptico USB",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    detalhamentoEstado: "100 Novos em IPUF",
    quantidade: 100,
    secretariaOrigem: "Instituto de Planejamento Urbano (IPUF)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mouse óptico com fio USB, design ergonômico básico, 3 botões com scroll. Lotes lacrados excedentes de licitação.",
    valorEstimadoNovo: 25.00,
    co2eEvitadoKg: 1
  }
];

export const MOCK_CATEGORIAS = [
  "Informática",
  "Mobiliário",
  "Materiais de Escritório",
  "Outros"
];

export const MOCK_SECRETARIAS = [
  "Secretaria Municipal de Administração (SMA)",
  "Secretaria Municipal de Educação (SME)",
  "Secretaria Municipal de Saúde (SMS)",
  "Secretaria Municipal de Finanças (SEF)",
  "Secretaria Municipal de Planejamento (SMP)",
  "Secretaria de Turismo, Cultura e Esporte (SCTC)",
  "Secretaria de Assistência Social (SEMAS)",
  "Instituto de Planejamento Urbano (IPUF)"
];

export const MOCK_USERS: Omit<User, 'rule'>[] = [
  {
    id: '1',
    name: 'Mauricio Alexandre',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
  {
    id: '2',
    name: 'Tonny',
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
  {
    id: '3',
    name: 'Alex',
    image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
  {
    id: '4',
    name: 'Gestor Central (SMA)',
    image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    inserted_at: '2026-01-10T08:30:00-03:00',
    updated_at: '2026-01-10T08:30:00-03:00',
  },
];

export function getLoginUsers(): User[] {
  return MOCK_USERS.map((u) => {
    let rule: UserRule = 'commum';
    if (u.id === '1') rule = 'manager';
    else if (u.id === '4') rule = 'admin';
    return { ...u, rule };
  });
}

export const MOTIVOS_REJEICAO = [
  "Item já comprometido para demanda local urgente",
  "Deterioração identificada pós-vistoria técnica",
  "Quantidade solicitada excede a reserva disponível física",
  "Incompatibilidade operacional ou logística atestada",
  "Secretaria cedente necessita reincorporar o patrimônio"
];

// Category tag colors for the Vitrine grid. Deliberately drawn from hues the DS-gov
// semantic states don't already use (green/success, yellow/warning, red/danger,
// blue/info+primary) so a category pill is never mistaken for a status badge.
// "Outros" stays neutral gray: it's the catch-all bucket, not a real category identity.
const CATEGORIA_TONES: Record<string, string> = {
  "Informática": 'bg-violet-200 text-violet-700 border border-violet-100',
  "Mobiliário": 'bg-teal-50 text-teal-700 border border-teal-100',
  "Materiais de Escritório": 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100',
};

export function getCategoriaTone(categoria: string): string {
  return CATEGORIA_TONES[categoria] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
}

export function fuzzySearch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return t.includes(q);
}

// State of conservation colors (DS-gov utility classes) and short labels, based on
// Decreto n\u00ba 45.242/2009 \u2014 the single source of truth consumed by every page that
// renders a conservation-state badge (Vitrine, Carrinho, and future Phase 4 pages).
export function getEstadoInfo(estado: EstadoConservacao): { tone: string; label: string } {
  switch (estado) {
    case 'NOVO':
      return { tone: 'bg-success text-white', label: 'Novo' };
    case 'BOM':
      return { tone: 'bg-success text-white', label: 'Bom Estado' };
    case 'REGULAR':
      return { tone: 'bg-warning text-black font-semibold', label: 'Regular' };
    case 'PESSIMO':
      return { tone: 'bg-danger text-white', label: 'P\u00e9ssimo' };
    case 'SUCATA':
      return { tone: 'bg-gray-40 text-white', label: 'Sucata' };
    default:
      return { tone: 'bg-gray-40 text-white', label: estado };
  }
}
