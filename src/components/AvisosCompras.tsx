/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Produto, CompraSimulada } from '../types';
import { MOCK_PRODUTOS } from '../data';
import Input from './Input';
import Button from './Button';
import Message from './Message';
import Modal from './Modal';
import Textarea from './Textarea';

interface AvisosComprasProps {
  onAddFromSimulated: (produto: Produto) => void;
  onSetTab: (tab: string) => void;
  produtosData?: Produto[];
}

export default function AvisosCompras({ onAddFromSimulated, onSetTab, produtosData }: AvisosComprasProps) {
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

  const currentProductsList = produtosData && produtosData.length > 0 ? produtosData : MOCK_PRODUTOS;

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
    const similarItems = currentProductsList.filter(p => {
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

  const getStatusInfo = (status: string): { tone: string; label: string } => {
    switch (status) {
      case 'FORCADO_COM_JUSTIFICATIVA':
        return { tone: 'bg-warning text-black font-semibold', label: 'Compra Forçada (Justificada)' };
      case 'REQUISITADO_REMANEJAMENTO':
        return { tone: 'bg-success text-white', label: 'Redirecionado ao Reuso' };
      default:
        return { tone: 'bg-gray-40 text-white', label: status };
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
            <div className="flex flex-col gap-2">
              <Message
                variant="info"
                title="Códigos de teste para disparar a trava sistêmica."
                body="Use um dos códigos CATMAT ou termos de descrição abaixo na simulação para forçar o bloqueio."
              />
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 font-medium pl-1">
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">349281</strong> ou escreva <strong>Monitor</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">442910</strong> ou escreva <strong>Cadeira</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">150921</strong> ou escreva <strong>Papel</strong> no campo de descrição</li>
                <li>Digite o CATMAT <strong className="font-mono text-primary bg-gray-100 px-1 rounded">392810</strong> ou escreva <strong>Notebook</strong> no campo de descrição</li>
              </ul>
            </div>

            <form onSubmit={handleSimulateSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código CATMAT */}
                <Input
                  label="Código CATMAT (6 dígitos)"
                  id="compra-catmat"
                  type="text"
                  placeholder="Ex: 349281"
                  value={catmat}
                  onChange={(e) => setCatmat(e.target.value)}
                  inputClassName="font-mono"
                />

                {/* Órgão Requisitante */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="compra-sec" className="text-xs font-bold text-gray-700">Órgão Comprador</label>
                  <select
                    id="compra-sec"
                    value={sec}
                    onChange={(e) => setSec(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-background focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Secretaria Municipal de Educação (SME)">Secretaria Municipal de Educação (SME)</option>
                    <option value="Secretaria Municipal de Saúde (SMS)">Secretaria Municipal de Saúde (SMS)</option>
                    <option value="Secretaria Municipal de Administração (SMA)">Secretaria Municipal de Administração (SMA)</option>
                    <option value="Secretaria de Assistência Social (SEMAS)">Secretaria de Assistência Social (SEMAS)</option>
                  </select>
                </div>
              </div>

              {/* Descrição do Bem */}
              <Input
                label="Descrição / Objeto da Compra *"
                id="compra-desc"
                type="text"
                placeholder="Ex: Aquisição de monitores LED para novos servidores do setor"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />

              {/* Quantidade */}
              <Input
                label="Quantidade Necessária"
                id="compra-quant"
                type="number"
                min="1"
                value={quant}
                onChange={(e) => setQuant(parseInt(e.target.value) || 1)}
                inputClassName="w-24 font-mono"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="mt-2"
                id="btn-simulate-procurement"
              >
                Simular Abertura de Licitação / Compra
              </Button>

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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusInfo(comp.status).tone}`}>
                        {getStatusInfo(comp.status).label}
                      </span>
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
            
            <Button
              variant="tertiary"
              className="text-danger w-full mt-2"
              onClick={() => {
                localStorage.removeItem('compras_simuladas');
                setCompras([]);
              }}
            >
              Limpar Logs
            </Button>
          </div>
        </div>

      </div>

      {/* POP-UP TRAVA SISTÊMICA (ALERTA PROATIVO) */}
      <Modal
        open={!!activeAlert}
        onClose={() => { setActiveAlert(null); resetForm(); }}
        title="Bens Equivalentes Disponíveis sem Custos!"
        footer={
          <>
            <Button variant="tertiary" onClick={() => { setActiveAlert(null); resetForm(); }}>
              Cancelar Simulação
            </Button>
            <Button variant="primary" className="bg-warning text-black" onClick={handleBypassSubmit}>
              Burlar Bloqueio (Justificar)
            </Button>
            <Button variant="secondary" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} onClick={() => { setActiveAlert(null); onSetTab('vitrine'); }}>
              Ir para Vitrine de Reuso
            </Button>
          </>
        }
      >
        {activeAlert && (
          <div className="flex flex-col gap-5">
            <Message
              variant="danger"
              title="Bloqueio legal aplicado."
              body="A Lei Federal nº 14.133/2021 e as boas práticas de responsabilidade fiscal vetam a compra de novos materiais se houver similares ociosos cadastrados."
            />

            <div className="text-xs text-gray-600">
              Sua intenção de compra de <strong className="text-gray-800 font-mono">"{activeAlert.compra.descricao}"</strong> (Qtd: {activeAlert.compra.quantidade}) foi bloqueada porque localizamos os seguintes itens ociosos no Almoxarifado Compartilhado:
            </div>

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

                  <Button
                    variant="secondary"
                    size="small"
                    icon={<ArrowRight className="h-3 w-3" aria-hidden="true" />}
                    onClick={() => handleRedeemIdle(item)}
                  >
                    Resgatar Item
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-150 pt-4 flex flex-col gap-3">
              <Message
                variant="warning"
                title="Deseja desviar deste bloqueio legal?"
                body="Para prosseguir com o processo licitatório comercial de mercado, o gestor de compras é legalmente obrigado a preencher uma justificativa detalhada e formal (mínimo 15 caracteres) explicando por que os itens ociosos listados não atendem à dotação necessária."
              />

              <Textarea
                label="Justificativa Formal de Recusa dos Itens Ociosos *"
                id="bypass-justification"
                placeholder="Ex: O material ocioso listado não possui as dimensões de segurança necessárias para o laboratório de biologia..."
                value={justificativaForcadaText}
                onChange={(e) => {
                  setJustificativaForcadaText(e.target.value);
                  setJustificativaError('');
                }}
                state={justificativaError ? 'danger' : undefined}
                textareaClassName="resize-none h-16"
              />
              {justificativaError && (
                <p className="text-[10px] text-danger font-bold mt-0.5">{justificativaError}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
