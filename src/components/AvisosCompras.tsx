/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, HelpCircle, Check, Info, FileText, ArrowRight, ExternalLink, HelpCircle as HelpIcon, ShieldCheck } from 'lucide-react';
import { Produto, CompraSimulada } from '../types';
import { MOCK_PRODUTOS } from '../data';

interface AvisosComprasProps {
  onAddFromSimulated: (produto: Produto) => void;
  onSetTab: (tab: string) => void;
}

export default function AvisosCompras({ onAddFromSimulated, onSetTab }: AvisosComprasProps) {
  // Simulator form state
  const [catmat, setCatmat] = useState('');
  const [desc, setDesc] = useState('');
  const [quant, setQuant] = useState(1);
  const [sec, setSec] = useState('Secretaria Municipal de Educação (SME)');

  // Simulation history state (saved in memory or localStorage)
  const [compras, setCompras] = useState<CompraSimulada[]>(() => {
    const saved = localStorage.getItem('compras_simuladas');
    return saved ? JSON.parse(saved) : [
      {
        codigoCatmat: "150921",
        descricao: "Compra de emergência de papel sulfite para o gabinete",
        quantidade: 50,
        secretariaRequisitante: "Secretaria de Assistência Social (SEMAS)",
        status: 'FORCADO_COM_JUSTIFICATIVA',
        justificativaForcada: "O papel é para impressora especial térmica e necessita de entrega imediata em 2 horas."
      },
      {
        codigoCatmat: "349281",
        descricao: "Monitores adicionais para novas salas de aula",
        quantidade: 10,
        secretariaRequisitante: "Secretaria Municipal de Educação (SME)",
        status: 'REQUISITADO_REMANEJAMENTO'
      }
    ];
  });

  // Active alert state
  const [activeAlert, setActiveAlert] = useState<{
    compra: CompraSimulada;
    similarItems: Produto[];
  } | null>(null);

  // Bypass justification state
  const [justificativaForcadaText, setJustificativaForcadaText] = useState('');
  const [justificativaError, setJustificativaError] = useState('');

  const saveCompras = (newCompras: CompraSimulada[]) => {
    setCompras(newCompras);
    localStorage.setItem('compras_simuladas', JSON.stringify(newCompras));
  };

  // Find similar items based on catmat or fuzzy match in description
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catmat && !desc) return;

    const novaCompra: CompraSimulada = {
      codigoCatmat: catmat.trim(),
      descricao: desc.trim(),
      quantidade: quant,
      secretariaRequisitante: sec,
      status: 'PENDENTE'
    };

    // Find similar items in the Bolsa de Materiais
    const similarItems = MOCK_PRODUTOS.filter(p => {
      // match exact CATMAT code
      const isCatmatMatch = novaCompra.codigoCatmat && p.codigoCatmat === novaCompra.codigoCatmat;
      // or match description/name
      const query = novaCompra.descricao.toLowerCase();
      const isDescMatch = query && (
        p.nome.toLowerCase().includes(query) || 
        p.categoria.toLowerCase().includes(query)
      );

      return isCatmatMatch || isDescMatch;
    });

    if (similarItems.length > 0) {
      // Trigger systemic block alert (A Trava Sistêmica)
      setActiveAlert({
        compra: novaCompra,
        similarItems
      });
      setJustificativaForcadaText('');
      setJustificativaError('');
    } else {
      // No idle items found, simulation completes directly
      const finalized: CompraSimulada = { ...novaCompra, status: 'FORCADO_COM_JUSTIFICATIVA', justificativaForcada: 'Nenhum item similar ocioso encontrado.' };
      saveCompras([finalized, ...compras]);
      alert('Nenhum material correspondente está ocioso. Processo de licitação de mercado liberado automaticamente!');
      resetForm();
    }
  };

  const resetForm = () => {
    setCatmat('');
    setDesc('');
    setQuant(1);
  };

  // Option 1: Cancel market purchase and redeem from catalog
  const handleRedeemIdle = (item: Produto) => {
    if (!activeAlert) return;
    
    // Create simulated purchase record
    const record: CompraSimulada = {
      ...activeAlert.compra,
      status: 'REQUISITADO_REMANEJAMENTO'
    };
    saveCompras([record, ...compras]);

    // Add to cart and switch to cart tab
    onAddFromSimulated(item);
    setActiveAlert(null);
    resetForm();
  };

  // Option 2: Bypass with formal justification
  const handleBypassSubmit = () => {
    if (!activeAlert) return;

    if (justificativaForcadaText.trim().length < 15) {
      setJustificativaError('A justificativa de recusa do bem ocioso deve possuir no mínimo 15 caracteres.');
      return;
    }

    const record: CompraSimulada = {
      ...activeAlert.compra,
      status: 'FORCADO_COM_JUSTIFICATIVA',
      justificativaForcada: justificativaForcadaText.trim()
    };
    saveCompras([record, ...compras]);

    setActiveAlert(null);
    resetForm();
    alert('Justificativa registrada. Licitação liberada com registro de inconformidade para auditoria interna.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FORCADO_COM_JUSTIFICATIVA':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Compra Forçada (Justificada)</span>;
      case 'REQUISITADO_REMANEJAMENTO':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Redirecionado ao Reuso</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-200 text-[10px] px-2 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Informações da Tela */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
          Trava Sistêmica de Compras
        </h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Simule o fluxo de planejamento de novas licitações de mercado. O sistema realiza varreduras em tempo real e bloqueia aquisições se houver bens equivalentes ociosos disponíveis na prefeitura.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Painel do Simulador */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-base text-gray-800 font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Preencher Intenção de Nova Compra de Mercado
            </h3>

            {/* Sugestões de Teste */}
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-3.5 text-xs">
              <p className="font-bold mb-1 flex items-center gap-1.5 text-emerald-900">
                <Info className="h-4 w-4" /> Códigos de teste para disparar a trava sistêmica:
              </p>
              <ul className="list-disc list-inside space-y-1 text-emerald-700 font-medium">
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">349281</strong> ou escreva <strong className="text-emerald-900">Monitor</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">442910</strong> ou escreva <strong className="text-emerald-900">Cadeira</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">150921</strong> ou escreva <strong className="text-emerald-900">Papel</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-emerald-900 bg-emerald-150 px-1 rounded">392810</strong> ou escreva <strong className="text-emerald-900">Notebook</strong> no campo de descrição</li>
              </ul>
            </div>

            <form onSubmit={handleSimulateSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código CATMAT */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="compra-catmat" className="text-xs font-bold text-gray-700">Código CATMAT (6 dígitos)</label>
                  <input
                    type="text"
                    id="compra-catmat"
                    placeholder="Ex: 349281"
                    value={catmat}
                    onChange={(e) => setCatmat(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                {/* Órgão Requisitante */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="compra-sec" className="text-xs font-bold text-gray-700">Órgão Comprador</label>
                  <select
                    id="compra-sec"
                    value={sec}
                    onChange={(e) => setSec(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Secretaria Municipal de Educação (SME)">Secretaria Municipal de Educação (SME)</option>
                    <option value="Secretaria Municipal de Saúde (SMS)">Secretaria Municipal de Saúde (SMS)</option>
                    <option value="Secretaria Municipal de Administração (SMA)">Secretaria Municipal de Administração (SMA)</option>
                    <option value="Secretaria de Assistência Social (SEMAS)">Secretaria de Assistência Social (SEMAS)</option>
                  </select>
                </div>
              </div>

              {/* Descrição do Bem */}
              <div className="flex flex-col gap-1">
                <label htmlFor="compra-desc" className="text-xs font-bold text-gray-700">Descrição / Objeto da Compra <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="compra-desc"
                  placeholder="Ex: Aquisição de monitores LED para novos servidores do setor"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Quantidade */}
              <div className="flex flex-col gap-1">
                <label htmlFor="compra-quant" className="text-xs font-bold text-gray-700">Quantidade Necessária</label>
                <input
                  type="number"
                  id="compra-quant"
                  min="1"
                  value={quant}
                  onChange={(e) => setQuant(parseInt(e.target.value) || 1)}
                  className="w-24 text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-3 px-6 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                id="btn-simulate-procurement"
              >
                Simular Abertura de Licitação / Compra
              </button>

            </form>
          </div>
        </div>

        {/* Histórico e Auditoria Simplificada */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-gray-100 pb-2">
              Logs da Trava Sistêmica
            </h3>
            
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
              {compras.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhuma simulação no histórico ainda.</p>
              ) : (
                compras.map((comp, idx) => (
                  <div key={idx} className="border border-gray-150 rounded-lg p-3 bg-gray-50/50 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono font-bold text-[10px] text-gray-500">CATMAT: {comp.codigoCatmat || "N/D"}</span>
                      {getStatusBadge(comp.status)}
                    </div>
                    
                    <p className="font-bold text-primary">{comp.descricao}</p>
                    
                    <div className="flex justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-1.5 mt-1">
                      <span>Qtd: <strong>{comp.quantidade}</strong></span>
                      <span className="truncate max-w-[120px]">{comp.secretariaRequisitante}</span>
                    </div>

                    {comp.justificativaForcada && (
                      <div className="bg-amber-50 border border-amber-100 text-amber-900 rounded p-2 text-[10px] mt-1 italic">
                        <strong>Justificativa de desvio registrada:</strong> "{comp.justificativaForcada}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => {
                localStorage.removeItem('compras_simuladas');
                setCompras([]);
              }}
              className="text-[10px] text-red-500 hover:underline text-center w-full mt-2"
            >
              Limpar Logs
            </button>
          </div>
        </div>

      </div>

      {/* POP-UP TRAVA SISTÊMICA (ALERTA PROATIVO) */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-red-500 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Vermelho de Alerta Impeditivo */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-5 flex items-start gap-3.5">
              <AlertOctagon className="h-8 w-8 text-white animate-pulse flex-shrink-0 mt-1" />
              <div>
                <span className="bg-red-800 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/20">
                  ALERTA SISTÊMICO - BLOQUEIO DE COMPRA
                </span>
                <h3 className="text-lg md:text-xl font-bold font-display mt-1 leading-snug">
                  Bens Equivalentes Disponíveis sem Custos!
                </h3>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  A Lei Federal nº 14.133/2021 e as boas práticas de responsabilidade fiscal vetam a compra de novos materiais se houver similares ociosos cadastrados.
                </p>
              </div>
            </div>

            {/* Conteúdo: Itens Ociosos Correspondentes */}
            <div className="p-6 flex flex-col gap-5">
              
              <div className="text-xs text-gray-600">
                Sua intenção de compra de <strong className="text-gray-800 font-mono">"{activeAlert.compra.descricao}"</strong> (Qtd: {activeAlert.compra.quantidade}) foi bloqueada porque localizamos os seguintes itens ociosos no Almoxarifado Compartilhado:
              </div>

              {/* Lista de Correspondências */}
              <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto border border-gray-150 rounded-lg p-2 bg-gray-50">
                {activeAlert.similarItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.fotoUrl}
                        alt={item.nome}
                        referrerPolicy="no-referrer"
                        className="h-12 w-16 object-cover rounded border border-gray-200 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-primary leading-tight">{item.nome}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Orgão: <strong>{item.secretariaOrigem}</strong></p>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">
                          Estado: {item.estadoConservacao} (Disp: {item.quantidade} un.)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeemIdle(item)}
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-[11px] rounded transition-colors flex items-center gap-1"
                    >
                      Resgatar Item
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Justificativa de Desvio para Prosseguir */}
              <div className="border-t border-gray-150 pt-4 flex flex-col gap-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs">
                  <p className="font-bold">Deseja desviar deste bloqueio legal?</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Para prosseguir com o processo licitatório comercial de mercado, o gestor de compras é legalmente obrigado a preencher uma justificativa detalhada e formal (mínimo 15 caracteres) explicando por que os itens ociosos listados não atendem à dotação necessária.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bypass-justification" className="text-xs font-bold text-gray-800">
                    Justificativa Formal de Recusa dos Itens Ociosos <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bypass-justification"
                    placeholder="Ex: O material ocioso listado não possui as dimensões de segurança necessárias para o laboratório de biologia..."
                    value={justificativaForcadaText}
                    onChange={(e) => {
                      setJustificativaForcadaText(e.target.value);
                      setJustificativaError('');
                    }}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-red-500 resize-none h-16 font-sans"
                  />
                  {justificativaError && (
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">{justificativaError}</p>
                  )}
                </div>
              </div>

              {/* Botões do Popup */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setActiveAlert(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar Simulação
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleBypassSubmit}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Burlar Bloqueio (Justificar)
                  </button>
                  
                  <button
                    onClick={() => {
                      // Let's take them back to the Vitrine Virtual to see everything
                      setActiveAlert(null);
                      onSetTab('vitrine');
                    }}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Ir para Vitrine de Reuso
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
