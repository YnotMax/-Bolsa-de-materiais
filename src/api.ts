/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Produto, Requisicao, StatusRequisicao, CompraSimulada } from './types';
import { MOCK_PRODUTOS } from './data';

const API_BASE = '/api';

/**
 * Interface de resposta da busca de produtos
 */
export interface ProductQueryParams {
  search?: string;
  categoria?: string;
  estado?: string;
  secretariaId?: string;
}

/**
 * Busca produtos do backend (GET /api/products)
 */
export async function fetchProductsFromApi(params?: ProductQueryParams): Promise<Produto[]> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoria) query.append('categoria', params.categoria);
    if (params?.estado) query.append('estado', params.estado);
    if (params?.secretariaId) query.append('secretariaId', params.secretariaId);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Transforma para a interface de Produto do frontend
    return data.map((p: any) => ({
      id: p.id,
      codigoPatrimonio: p.codigoPatrimonio,
      codigoCatmat: p.codigoCATMAT || p.codigoCatmat,
      nome: p.nome,
      descricaoCompleta: p.descricao,
      categoria: p.categoria,
      estadoConservacao: p.estadoConservacao,
      quantidade: p.quantidadeDisponivel ?? p.quantidadeFisica ?? p.quantidade,
      secretariaOrigem: p.secretaria || p.secretariaOrigem,
      valorEstimadoNovo: p.categoria === 'Informática' ? 950 : p.categoria === 'Mobiliário' ? 850 : 350,
      co2eEvitadoKg: p.categoria === 'Informática' ? 45 : p.categoria === 'Mobiliário' ? 35 : 10,
      fotoUrl: p.fotoUrl
    }));
  } catch (err) {
    console.warn('[API Client] Erro ao conectar ao backend /api/products, utilizando dados locais:', err);
    return MOCK_PRODUTOS;
  }
}

/**
 * Submete uma nova requisição (POST /api/requests)
 */
export async function submitRequisitionApi(payload: {
  requisitanteId?: string;
  cedenteId?: string;
  justificativaGeral?: string;
  requisitante: any;
  itens: Array<{
    produtoId: string;
    quantidade: number;
    justificativaItem: string;
  }>;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': `req-${Date.now()}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erro ao submeter requisição' };
    }
    return { success: true, data };
  } catch (err: any) {
    console.warn('[API Client] Erro ao conectar ao backend /api/requests:', err);
    return { success: false, error: err.message || 'Erro de conexão com o servidor' };
  }
}

/**
 * Busca histórico de requisições (GET /api/requests)
 */
export async function fetchRequisitionsFromApi(): Promise<Requisicao[]> {
  try {
    const res = await fetch(`${API_BASE}/requests`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Erro ao buscar requisições do backend:', err);
    return [];
  }
}

/**
 * Atualiza status de requisição (PATCH /api/requests/:id/status)
 */
export async function updateRequisitionStatusApi(
  requisicaoId: string,
  novoStatus: StatusRequisicao,
  motivoRejeicao?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/requests/${requisicaoId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus, motivoRejeicao })
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, data };
  } catch (err: any) {
    console.warn('[API Client] Erro ao atualizar status:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Simula intenção de compra / Trava de ociosidade (POST /api/procurement-intent)
 */
export async function simulateProcurementApi(payload: {
  nomeItem: string;
  quantidade: number;
  codigoCATMAT?: string;
  secretariaId?: string;
}): Promise<{
  alertaAtivo: boolean;
  mensagem: string;
  sugestoes?: Array<{
    produtoId: string;
    nome: string;
    estadoConservacao: string;
    quantidadeDisponivel: number;
    secretariaCedente: string;
  }>;
}> {
  try {
    const res = await fetch(`${API_BASE}/procurement-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Erro na simulação de compra:', err);
    return {
      alertaAtivo: false,
      mensagem: 'Serviço de trava de compras operando em modo offline.'
    };
  }
}

/**
 * Busca estatísticas ESG e RDE (GET /api/analytics)
 */
export async function fetchAnalyticsFromApi(): Promise<{
  RDE: number;
  CO2e: number;
  unidadeCO2: string;
  movimentacoesSucedidas: number;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API Client] Erro ao carregar métricas ESG:', err);
    return null;
  }
}
