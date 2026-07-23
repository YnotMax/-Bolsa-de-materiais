/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Leaf, Award, Sparkles, Lock, ShieldCheck, History, UserCheck, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import Message from './Message';
import { Requisicao, User } from '../types';

interface RelatoriosProps {
  requisicoes: Requisicao[];
  loggedUser?: User | null;
}

// requisicoes is hydrated from localStorage with no runtime schema check, so a stale or
// hand-edited record can carry a missing/non-numeric field here; coerce rather than let it
// poison every total on this transparency panel with NaN.
function safeNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatInt(value: number): string {
  return Math.round(value).toLocaleString('pt-BR');
}

const TRANSACOES_SISTEMA = [
  {
    id: "tx-001",
    hora: "10:42",
    data: "22/07/2026",
    usuario: "Thiago Barbosa",
    secretaria: "Secretaria Municipal de Saúde (SMS)",
    acao: "Requisitou remanejamento de material",
    detalhes: "2x Mesa de Escritório em L (Processo PMF-48291/2026)",
    tipo: "REQUISIÇÃO",
    badgeColor: "bg-blue-100 text-blue-900 border border-blue-200"
  },
  {
    id: "tx-002",
    hora: "10:15",
    data: "22/07/2026",
    usuario: "Gestor Central (SMA)",
    secretaria: "Secretaria Municipal de Administração (SMA)",
    acao: "Sessão iniciada como Administrador",
    detalhes: "Autenticação via SSO Municipal com acesso a auditoria global",
    tipo: "LOGIN ADMIN",
    badgeColor: "bg-purple-100 text-purple-900 border border-purple-200"
  },
  {
    id: "tx-003",
    hora: "09:58",
    data: "22/07/2026",
    usuario: "Maurício Alexandre",
    secretaria: "Secretaria Municipal de Educação (SME)",
    acao: "Intenção de licitação interceptada",
    detalhes: "Tentativa de comprar 15x Monitor Dell 24' - Trava sistêmica evitou compra",
    tipo: "TRAVA SISTÊMICA",
    badgeColor: "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
  },
  {
    id: "tx-004",
    hora: "09:30",
    data: "22/07/2026",
    usuario: "Alex Silva",
    secretaria: "Secretaria Municipal de Finanças (SEF)",
    acao: "Disponibilizou excedente no estoque",
    detalhes: "140x Resma de Papel A4 disponibilizadas para reuso",
    tipo: "CESSÃO ESTOQUE",
    badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-200"
  },
  {
    id: "tx-005",
    hora: "09:12",
    data: "22/07/2026",
    usuario: "Thiago Barbosa",
    secretaria: "Secretaria Municipal de Saúde (SMS)",
    acao: "Cessão aprovada e homologada",
    detalhes: "Processo PMF-34912/2026 homologado e concluído com sucesso",
    tipo: "HOMOLOGADO",
    badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-200"
  }
];

export default function Relatorios({ requisicoes, loggedUser }: RelatoriosProps) {
  const isAdmin = loggedUser?.rule === 'admin';

  // Calculate stats based on approved/transferred requisitions + mock seed values
  const stats = useMemo(() => {
    // Standard mock base values to make the dashboard look populated and real
    let baseEconomia = 87430.00;
    let baseCO2 = 3840;
    let baseItens = 142;
    let baseProjetosImpedidos = 9;

    // Add actual values from approved or transferred requisitions
    const activeRequisitions = requisicoes.filter(r => r.status === 'APROVADA' || r.status === 'TRANSFERIDA');

    activeRequisitions.forEach(r => {
      r.itens.forEach(item => {
        const quantidade = safeNumber(item.quantidade);
        const valorEstimadoNovo = safeNumber(item.valorEstimadoNovo);
        const co2eEvitadoKg = safeNumber(item.co2eEvitadoKg);
        baseEconomia += valorEstimadoNovo * quantidade;
        baseCO2 += co2eEvitadoKg * quantidade;
        baseItens += quantidade;
      });
      baseProjetosImpedidos += 1;
    });

    return {
      economia: Math.max(0, baseEconomia),
      co2: Math.max(0, baseCO2),
      itens: Math.max(0, Math.round(baseItens)),
      projetos: Math.max(0, baseProjetosImpedidos)
    };
  }, [requisicoes]);

  // Gamified Ranking of Secretariats based on contributions
  const rankingSecretarias = useMemo(() => {
    return [
      {
        nome: "Secretaria Municipal de Educação (SME)",
        pontos: 480,
        economiaB2B: 42500,
        co2Evitado: 1200,
        reusos: 42,
        selo: "Selo Verde Ouro"
      },
      {
        nome: "Secretaria Municipal de Saúde (SMS)",
        pontos: 390,
        economiaB2B: 32100,
        co2Evitado: 890,
        reusos: 31,
        selo: "Selo Verde Ouro"
      },
      {
        nome: "Secretaria Municipal de Administração (SMA)",
        pontos: 350,
        economiaB2B: 28900,
        co2Evitado: 750,
        reusos: 27,
        selo: "Selo Verde Prata"
      },
      {
        nome: "Secretaria Municipal de Finanças (SEF)",
        pontos: 220,
        economiaB2B: 18200,
        co2Evitado: 430,
        reusos: 15,
        selo: "Selo Verde Bronze"
      },
      {
        nome: "Secretaria Municipal de Planejamento (SMP)",
        pontos: 180,
        economiaB2B: 11500,
        co2Evitado: 310,
        reusos: 11,
        selo: "Selo Eficiência"
      }
    ];
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight flex items-center gap-2">
            Placar de Economia & Eficiência
            {isAdmin && (
              <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Visão Gestor Central
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Painel de transparência ativa que consolida a economia do erário de Florianópolis e os ganhos de sustentabilidade ambiental por meio do reuso.
          </p>
        </div>
      </div>

      {/* PAINEL EXCLUSIVO DO GESTOR ADMIN: LOG DE TRANSAÇÕES E AUDITORIA GERAL (GOV.BR DS COMPLIANT) */}
      {isAdmin && (
        <div className="br-card bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-200 pb-4 gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" /> Auditoria & Governança Pública
              </span>
              <h3 className="text-lg font-bold font-display text-primary mt-1.5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                Painel de Controle e Registro de Transações dos Servidores
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs bg-blue-50 text-primary px-3 py-1.5 rounded-lg border border-blue-200 font-mono">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Sessão Gestor: <strong>{loggedUser?.name}</strong></span>
            </div>
          </div>

          {/* Log de Auditoria em Formato Institucional Gov.br */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <History className="h-4 w-4 text-amber-600" />
                Histórico Recente de Ações Intersecretaria
              </h4>
              <span className="text-[11px] font-mono text-gray-500">Transparência Ativa • Lei 14.133/2021</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {TRANSACOES_SISTEMA.map((tx) => (
                <div key={tx.id} className="bg-gray-50/80 border border-gray-200 hover:bg-gray-100/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs text-primary font-bold bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded shrink-0">{tx.hora}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-gray-900 font-bold">{tx.usuario}</strong>
                        <span className="text-[10px] text-gray-600 bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono">{tx.secretaria}</span>
                      </div>
                      <p className="text-gray-700 mt-0.5">{tx.acao}: <span className="text-primary font-semibold">{tx.detalhes}</span></p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wide shrink-0 ${tx.badgeColor}`}>
                    {tx.tipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid - Métricas de Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Redução de Despesa Estimada */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Erário Economizado (RDE)</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1 wrap-break-word">
              R$ {formatBRL(stats.economia)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> +14.2% em relação ao mês anterior
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100 shrink-0">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {/* Card 2: Emissões de CO2 Evitadas */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Carbono Evitado (CO₂e)</span>
            <span className="text-xl md:text-2xl font-bold text-emerald-700 font-mono leading-none mt-1 wrap-break-word">
              {formatInt(stats.co2)} kg
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <Leaf className="h-3 w-3 shrink-0" aria-hidden="true" /> Equivalente a {formatInt(stats.co2 / 6)} árvores plantadas
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100 shrink-0">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {/* Card 3: Itens Remanejados */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Itens Remanejados</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1 wrap-break-word">
              {formatInt(stats.itens)} unidades
            </span>
            <span className="text-[11px] text-gray-500 mt-2 block">
              Materiais que escaparam da ociosidade
            </span>
          </div>
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg border border-blue-100 shrink-0">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {/* Card 4: Licitações Evitadas */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Licitações Bloqueadas</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1 wrap-break-word">
              {formatInt(stats.projetos)} processos
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <Lock className="h-3 w-3 shrink-0" aria-hidden="true" /> Impedidos pela trava sistêmica
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg border border-amber-100 shrink-0">
            <Award className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

      </div>

      {/* Ranking de Eficiência de Secretarias (Gamificação) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabela do Placar */}
        <div className="lg:col-span-2 br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-primary font-display flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" aria-hidden="true" />
              Placar de Economia Pública (Gamificação)
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Competição Saudável</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600 border-collapse">
              <caption className="sr-only">
                Ranking de secretarias por economia gerada, CO₂ evitado e selo de eficiência
              </caption>
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase font-bold bg-gray-50">
                  <th scope="col" className="py-2.5 px-3 w-12 text-center">Posição</th>
                  <th scope="col" className="py-2.5 px-3">Secretaria</th>
                  <th scope="col" className="py-2.5 px-3 text-right">RDE (Economia)</th>
                  <th scope="col" className="py-2.5 px-3 text-right">CO₂ Evitado</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Selo de Eficiência</th>
                </tr>
              </thead>
              <tbody>
                {rankingSecretarias.map((sec, idx) => (
                  <tr key={sec.nome} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-center font-bold">
                      {idx === 0 && <span className="inline-block bg-amber-400 text-amber-950 h-5 w-5 rounded-full text-xs leading-5">1º</span>}
                      {idx === 1 && <span className="inline-block bg-slate-300 text-slate-900 h-5 w-5 rounded-full text-xs leading-5">2º</span>}
                      {idx === 2 && <span className="inline-block bg-amber-600 text-amber-50 h-5 w-5 rounded-full text-xs leading-5 text-white">3º</span>}
                      {idx > 2 && <span className="inline-block text-gray-500">{idx + 1}º</span>}
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary max-w-60 wrap-break-word">{sec.nome}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                      R$ {formatBRL(sec.economiaB2B)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">{formatInt(sec.co2Evitado)} kg</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        idx === 0 || idx === 1 ? 'bg-amber-100 text-amber-800' :
                        idx === 2 ? 'bg-gray-100 text-gray-800' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {sec.selo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel lateral explicativo e metas */}
        <div className="br-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Como funciona o cálculo?
            </h3>
            
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                A <strong>Redução de Despesa Estimada (RDE)</strong> quantifica o valor financeiro poupado pela prefeitura ao reutilizar materiais:
              </p>
              <div className="bg-gray-100 border border-gray-150 p-2.5 rounded-md font-mono text-[10px] text-primary-dark">
                RDE = Preço Novo - Custo Operacional
              </div>
              <p>
                Os custos operacionais de transporte entre unidades vizinhas de Florianópolis são extremamente baixos, garantindo quase 98% de margem líquida de economia direta no remanejamento.
              </p>
              <p>
                <strong>Pontuação do Placar:</strong> Cada transferência aprovada gera pontos de responsabilidade fiscal para a secretaria cedente (que disponibilizou o item parado) e para a secretaria requisitante.
              </p>
            </div>
          </div>

          <Message
            variant="success"
            title="Selo Verde Florianópolis."
            body={'As secretarias com classificação "Selo Verde Ouro" recebem bônus na cota de aprovação de dotações complementares no orçamento do próximo ano!'}
          />
        </div>

      </div>

    </div>
  );
}
