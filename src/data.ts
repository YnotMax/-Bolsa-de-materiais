/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Produto, EstadoConservacao } from './types';

export const MOCK_PRODUTOS: Produto[] = [
  {
    id: "prod-001",
    codigoPatrimonio: "PMF-129482",
    codigoCatmat: "349281", // CATMAT para Monitores
    nome: "Monitor Dell 24 Polegadas",
    categoria: "Informática",
    estadoConservacao: "BOM",
    quantidade: 15,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Monitor Dell Professional de 24 polegadas, resolução Full HD (1920x1080), conexões HDMI e DisplayPort. Em excelente estado de conservação, testado e com cabos inclusos.",
    valorEstimadoNovo: 950.00,
    co2eEvitadoKg: 45
  },
  {
    id: "prod-002",
    codigoPatrimonio: "PMF-084931",
    codigoCatmat: "442910", // CATMAT para Cadeiras
    nome: "Cadeira Giratória Ergonômica",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    quantidade: 8,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Cadeira giratória com braços reguláveis, apoio lombar ajustável, mecanismo relax e rodízios PU que evitam riscos no piso. Revestimento em tecido crepe preto.",
    valorEstimadoNovo: 680.00,
    co2eEvitadoKg: 25
  },
  {
    id: "prod-003",
    codigoPatrimonio: "PMF-349204",
    codigoCatmat: "294821", // CATMAT para Mesas
    nome: "Mesa de Escritório em L",
    categoria: "Mobiliário",
    estadoConservacao: "REGULAR",
    quantidade: 12,
    secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
    fotoUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Mesa de escritório em formato L com tampo de 25mm de espessura, estrutura metálica e calha para passagem de cabos. Dimensões: 1,60m x 1,60m. Apresenta pequenos riscos de uso.",
    valorEstimadoNovo: 850.00,
    co2eEvitadoKg: 35
  },
  {
    id: "prod-004",
    codigoPatrimonio: "PMF-889341",
    codigoCatmat: "150921", // CATMAT para Papelaria
    nome: "Resma de Papel A4 500fls",
    categoria: "Materiais de Escritório",
    estadoConservacao: "NOVO",
    quantidade: 140,
    secretariaOrigem: "Secretaria Municipal de Finanças (SEF)",
    fotoUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Papel almaço/sulfite branco tamanho A4 (210mm x 297mm), gramatura 75g/m². Caixas fechadas remanescentes de planejamento anual superestimado.",
    valorEstimadoNovo: 32.00,
    co2eEvitadoKg: 2
  },
  {
    id: "prod-005",
    codigoPatrimonio: "PMF-294830",
    codigoCatmat: "392810", // CATMAT para Computadores
    nome: "Notebook Lenovo ThinkPad L14",
    categoria: "Informática",
    estadoConservacao: "BOM",
    quantidade: 5,
    secretariaOrigem: "Secretaria Municipal de Planejamento (SMP)",
    fotoUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Processador Intel Core i5 de 10ª Geração, 16GB RAM, SSD 256GB, Tela 14 polegadas HD, teclado ABNT2. Equipamentos retornados de contratos temporários de projetos.",
    valorEstimadoNovo: 4200.00,
    co2eEvitadoKg: 120
  },
  {
    id: "prod-006",
    codigoPatrimonio: "PMF-582910",
    codigoCatmat: "209412", // CATMAT para Climatização
    nome: "Ar Condicionado Split 12000 BTU",
    categoria: "Outros",
    estadoConservacao: "REGULAR",
    quantidade: 3,
    secretariaOrigem: "Secretaria de Turismo, Cultura e Esporte (SCTC)",
    fotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Aparelho de ar condicionado Split, ciclo frio, 220V. Necessita de higienização padrão e substituição simples de fita de isolamento na unidade condensadora externa.",
    valorEstimadoNovo: 1800.00,
    co2eEvitadoKg: 85
  },
  {
    id: "prod-007",
    codigoPatrimonio: "PMF-729481",
    codigoCatmat: "348210", // CATMAT para Impressoras
    nome: "Impressora Multifuncional HP LaserJet Pro",
    categoria: "Informática",
    estadoConservacao: "PESSIMO",
    quantidade: 2,
    secretariaOrigem: "Secretaria de Assistência Social (SEMAS)",
    fotoUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Impressora a laser monocromática, fotocopiadora e scanner. Apresenta falha no tracionador de papel e atolamento constante. Recomendada apenas para reparo completo ou doação de peças.",
    valorEstimadoNovo: 1200.00,
    co2eEvitadoKg: 50
  },
  {
    id: "prod-008",
    codigoPatrimonio: "PMF-482012",
    codigoCatmat: "442930", // CATMAT para Gaveteiros
    nome: "Gaveteiro de Madeira 3 Gavetas",
    categoria: "Mobiliário",
    estadoConservacao: "BOM",
    quantidade: 14,
    secretariaOrigem: "Instituto de Planejamento Urbano (IPUF)",
    fotoUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Gaveteiro volante em MDF, cor carvalho, 3 gavetas (sendo 1 gaveta para pastas suspensas), com chave. Rolamentos em perfeito estado.",
    valorEstimadoNovo: 350.00,
    co2eEvitadoKg: 15
  },
  {
    id: "prod-009",
    codigoPatrimonio: "PMF-994810",
    codigoCatmat: "258391", // CATMAT para Teclados
    nome: "Teclado USB Standard Preto",
    categoria: "Informática",
    estadoConservacao: "NOVO",
    quantidade: 45,
    secretariaOrigem: "Secretaria Municipal de Administração (SMA)",
    fotoUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Teclados USB com fio pretos, padrão ABNT2, teclas silenciosas de perfil baixo. Caixa original lacrada.",
    valorEstimadoNovo: 60.00,
    co2eEvitadoKg: 5
  },
  {
    id: "prod-010",
    codigoPatrimonio: "PMF-102941",
    codigoCatmat: "302841", // CATMAT para Projetores
    nome: "Projetor Multimídia Epson",
    categoria: "Outros",
    estadoConservacao: "REGULAR",
    quantidade: 4,
    secretariaOrigem: "Secretaria Municipal de Educação (SME)",
    fotoUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=600&h=400",
    descricaoCompleta: "Projetor de 3000 lumens, entrada HDMI e VGA. A lâmpada está com 1200 horas de uso (vida útil estimada de 4000h). Acompanha controle remoto e cabo de força.",
    valorEstimadoNovo: 3200.00,
    co2eEvitadoKg: 90
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

export const MOTIVOS_REJEICAO = [
  "Item já comprometido para demanda local urgente",
  "Deterioração identificada pós-vistoria técnica",
  "Quantidade solicitada excede a reserva disponível física",
  "Incompatibilidade operacional ou logística atestada",
  "Secretaria cedente necessita reincorporar o patrimônio"
];

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
