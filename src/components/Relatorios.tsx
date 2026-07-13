/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Leaf, Award, Landmark, AlertTriangle, ArrowUpRight, HelpCircle, Sparkles } from 'lucide-react';
import { Requisicao } from '../types';

interface RelatoriosProps {
  requisicoes: Requisicao[];
}

export default function Relatorios({ requisicoes }: RelatoriosProps) {
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
        const itemEconomia = item.valorEstimadoNovo * item.quantidade;
        const itemCO2 = item.co2eEvitadoKg * item.quantidade;
        baseEconomia += itemEconomia;
        baseCO2 += itemCO2;
        baseItens += item.quantidade;
      });
      baseProjetosImpedidos += 1;
    });

    return {
      economia: baseEconomia,
      co2: baseCO2,
      itens: baseItens,
      projetos: baseProjetosImpedidos
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
          Placar de Economia & Eficiência
        </h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Painel de transparência ativa que consolida a economia do erário de Florianópolis e os ganhos de sustentabilidade ambiental por meio do reuso.
        </p>
      </div>

      {/* Bento Grid - Métricas de Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Redução de Despesa Estimada */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Erário Economizado (RDE)</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1">
              R$ {stats.economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2% em relação ao mês anterior
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Emissões de CO2 Evitadas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Carbono Evitado (CO₂e)</span>
            <span className="text-xl md:text-2xl font-bold text-emerald-700 font-mono leading-none mt-1">
              {stats.co2.toLocaleString('pt-BR')} kg
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
              🌿 Equivalente a {Math.round(stats.co2 / 6)} árvores plantadas
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
            <Leaf className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Itens Remanejados */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Itens Remanejados</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1">
              {stats.itens} unidades
            </span>
            <span className="text-[11px] text-gray-500 mt-2 block">
              Materiais que escaparam da ociosidade
            </span>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Licitações Evitadas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Licitações Bloqueadas</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-mono leading-none mt-1">
              {stats.projetos} processos
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
              🔒 Impedidos pela trava sistêmica
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg border border-amber-100">
            <Award className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Ranking de Eficiência de Secretarias (Gamificação) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabela do Placar */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-primary font-display flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Placar de Economia Pública (Gamificação)
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Competição Saudável</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-[10px] uppercase font-bold bg-gray-50">
                  <th className="py-2.5 px-3 w-12 text-center">Posição</th>
                  <th className="py-2.5 px-3">Secretaria</th>
                  <th className="py-2.5 px-3 text-right">RDE (Economia)</th>
                  <th className="py-2.5 px-3 text-right">CO₂ Evitado</th>
                  <th className="py-2.5 px-3 text-center">Selo de Eficiência</th>
                </tr>
              </thead>
              <tbody>
                {rankingSecretarias.map((sec, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-center font-bold">
                      {idx === 0 && <span className="inline-block bg-amber-400 text-amber-950 h-5 w-5 rounded-full text-xs leading-5">1º</span>}
                      {idx === 1 && <span className="inline-block bg-slate-300 text-slate-900 h-5 w-5 rounded-full text-xs leading-5">2º</span>}
                      {idx === 2 && <span className="inline-block bg-amber-600 text-amber-50 h-5 w-5 rounded-full text-xs leading-5 text-white">3º</span>}
                      {idx > 2 && <span className="inline-block text-gray-500">{idx + 1}º</span>}
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary">{sec.nome}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      R$ {sec.economiaB2B.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{sec.co2Evitado} kg</td>
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
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Como funciona o cálculo?
            </h3>
            
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                A <strong>Redução de Despesa Estimada (RDE)</strong> quantifica o valor financeiro poupado pela prefeitura ao reutilizar materiais:
              </p>
              <div className="bg-gray-50 border border-gray-150 p-2.5 rounded-md font-mono text-[10px] text-primary-dark">
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

          <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-lg p-3 text-xs">
            <p className="font-bold flex items-center gap-1 text-emerald-950">
              🌿 Selo Verde Florianópolis
            </p>
            <p className="mt-1 text-[11px] text-emerald-800">
              As secretarias com classificação "Selo Verde Ouro" recebem bônus na cota de aprovação de dotações complementares no orçamento do próximo ano!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
