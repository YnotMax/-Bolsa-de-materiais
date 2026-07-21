/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EstadoConservacao = 'NOVO' | 'BOM' | 'REGULAR' | 'PESSIMO' | 'SUCATA';

export interface Produto {
  id: string;
  codigoPatrimonio: string;
  codigoCatmat: string;
  nome: string;
  categoria: string;
  estadoConservacao: EstadoConservacao;
  quantidade: number;
  secretariaOrigem: string;
  fotoUrl: string;
  descricaoCompleta?: string;
  valorEstimadoNovo: number; // in BRL, used for RDE
  co2eEvitadoKg: number; // CO2 equivalent savings in kg
}

export interface CartItem {
  produto: Produto;
  quantidadeSolicitada: number;
  justificativa: string;
}

export type StatusRequisicao = 'RASCUNHO' | 'SUBMETIDA' | 'EM_ANALISE' | 'APROVADA' | 'TRANSFERIDA' | 'REJEITADA';

export interface RequisitanteData {
  nomeCompleto: string;
  matriculaFuncional: string;
  secretariaSetor: string;
  emailInstitucional: string;
  declaraTermos: boolean;
}

export interface Requisicao {
  id: string;
  codigoProcesso: string; // PMF-XXXXX/2026
  dataCriacao: string;
  requisitante: RequisitanteData;
  itens: {
    produtoId: string;
    nome: string;
    quantidade: number;
    justificativa: string;
    secretariaOrigem: string;
    valorEstimadoNovo: number;
    co2eEvitadoKg: number;
  }[];
  status: StatusRequisicao;
  historicoStatus: {
    status: StatusRequisicao;
    data: string;
    responsavel: string;
    observacao?: string;
  }[];
  motivoRejeicao?: string;
  motivoRejeicaoEstruturado?: string;
}

export interface CompraSimulada {
  codigoCatmat: string;
  descricao: string;
  quantidade: number;
  secretariaRequisitante: string;
  justificativaCompra?: string;
  status: 'PENDENTE' | 'ALERTA_EXIBIDO' | 'REQUISITADO_REMANEJAMENTO' | 'FORCADO_COM_JUSTIFICATIVA';
  justificativaForcada?: string;
}

export type UserRule = 'manager' | 'commum';

export interface User {
  id: string;
  name: string;
  image_url: string;
  rule: UserRule;
  inserted_at: string;
  updated_at: string;
}
