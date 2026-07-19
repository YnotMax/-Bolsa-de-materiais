/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Clock, Check, ChevronRight, Building, ShieldCheck, Download } from 'lucide-react';
import { Requisicao, StatusRequisicao } from '../types';
import { MOTIVOS_REJEICAO } from '../data';
import Button from './Button';
import Message from './Message';
import Modal from './Modal';
import Textarea from './Textarea';

interface WorkflowManagerProps {
  requisicoes: Requisicao[];
  onUpdateStatus: (requisicaoId: string, novoStatus: StatusRequisicao, motivoRejeicao?: string) => void;
}

export default function WorkflowManager({ requisicoes, onUpdateStatus }: WorkflowManagerProps) {
  const [roleMode, setRoleMode] = useState<'cedente' | 'requisitante'>('cedente');
  const [activeRequisition, setActiveRequisition] = useState<Requisicao | null>(null);
  
  // Rejection modal state
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [selectedMotivoEstruturado, setSelectedMotivoEstruturado] = useState('');
  const [detalhesRejeicao, setDetalhesRejeicao] = useState('');

  const getStatusInfo = (status: StatusRequisicao): { tone: string; label: string } => {
    switch (status) {
      case 'SUBMETIDA':
        return { tone: 'bg-info text-white', label: 'Submetida' };
      case 'EM_ANALISE':
        return { tone: 'bg-warning text-black font-semibold', label: 'Em Análise (Estoque Reservado)' };
      case 'APROVADA':
        return { tone: 'bg-success text-white', label: 'Aprovada' };
      case 'TRANSFERIDA':
        return { tone: 'bg-success text-white', label: 'Transferida (Concluída)' };
      case 'REJEITADA':
        return { tone: 'bg-danger text-white', label: 'Rejeitada' };
      default:
        return { tone: 'bg-gray-40 text-white', label: status };
    }
  };

  const handleOpenRejectionModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRejectingReqId(id);
    setSelectedMotivoEstruturado(MOTIVOS_REJEICAO[0]);
    setDetalhesRejeicao('');
  };

  const submitRejection = () => {
    if (!rejectingReqId) return;
    const motivoCompleto = `[Recusa Estruturada: ${selectedMotivoEstruturado}] ${detalhesRejeicao}`.trim();
    onUpdateStatus(rejectingReqId, 'REJEITADA', motivoCompleto);
    
    // update current active item if showing details
    if (activeRequisition && activeRequisition.id === rejectingReqId) {
      setActiveRequisition(prev => prev ? { ...prev, status: 'REJEITADA', motivoRejeicao: motivoCompleto } : null);
    }

    setRejectingReqId(null);
    setSelectedMotivoEstruturado('');
    setDetalhesRejeicao('');
  };

  const handleSimulatedDownloadTerm = (req: Requisicao) => {
    alert(`[Simulação PoC TRL3] Termo de Cessão de Uso Digital gerado para o Processo ${req.codigoProcesso}.\n\nBens: ${req.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}\nRequisitante: ${req.requisitante.nomeCompleto}\nEmail: ${req.requisitante.emailInstitucional}\n\nDocumento assinado digitalmente ICP-Brasil e em conformidade com as regras de governança municipal.`);
  };

  // Filter requests depending on role selected
  const filteredRequisitions = requisicoes.filter(r => {
    if (roleMode === 'requisitante') {
      // Requisitioner sees all their requests
      return true;
    } else {
      // Cedente sees pending approvals or those related to SME/SMA (the mock origin secretariats)
      return true; // Simple sandbox allows managing everything
    }
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
            Gestão de Tramitações e Workflow
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Acompanhe o trâmite oficial das requisições e autorize cessões de bens ociosos de forma transparente e auditada.
          </p>
        </div>

        {/* Alternador de Perfis (Gamificação / Adaptação Stockly) */}
        <div className="bg-gray-100 p-1 rounded-lg border border-gray-250 flex items-center self-stretch md:self-auto">
          <Button
            variant={roleMode === 'cedente' ? 'primary' : 'tertiary'}
            className="flex-1 md:flex-initial"
            onClick={() => {
              setRoleMode('cedente');
              setActiveRequisition(null);
            }}
          >
            Aprovação (Dona Cedente)
          </Button>
          <Button
            variant={roleMode === 'requisitante' ? 'primary' : 'tertiary'}
            className="flex-1 md:flex-initial"
            onClick={() => {
              setRoleMode('requisitante');
              setActiveRequisition(null);
            }}
          >
            Acompanhamento (Requisitante)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Painel Esquerdo: Lista de Processos */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-gray-100 pb-2">
            Processos de Transferência
          </h3>

          <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto">
            {filteredRequisitions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Nenhuma requisição submetida ainda.</p>
            ) : (
              filteredRequisitions.map((req) => {
                const isSelected = activeRequisition?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setActiveRequisition(req)}
                    id={`requisicao-card-${req.id}`}
                    className={`br-card hover border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono text-gray-400 block">{req.codigoProcesso}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusInfo(req.status).tone}`}>
                        {getStatusInfo(req.status).label}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-primary mt-1.5 truncate">
                      {req.itens.map(i => `${i.quantidade}x ${i.nome}`).join(' + ')}
                    </h4>

                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                      <Building className="h-3.5 w-3.5" />
                      <span className="truncate">Destino: {req.requisitante.secretariaSetor}</span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-gray-400 mt-3 border-t border-gray-100 pt-2">
                      <span>Criado: {req.dataCriacao}</span>
                      <span className="text-primary font-semibold flex items-center gap-0.5">
                        Ver trâmite <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Linha do Tempo e Detalhes do Trâmite */}
        <div className="lg:col-span-2">
          {activeRequisition ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              {/* Top Details Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Nº do Processo: {activeRequisition.codigoProcesso}
                  </span>
                  <h3 className="text-lg font-bold text-primary font-display mt-2">
                    Solicitação de Remanejamento de Bens
                  </h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusInfo(activeRequisition.status).tone}`}>
                  {getStatusInfo(activeRequisition.status).label}
                </span>
              </div>

              {/* Servidor Requisitante */}
              <div className="bg-gray-50 border border-gray-150 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dados do Requisitante</h4>
                  <p className="text-xs font-bold text-primary">{activeRequisition.requisitante.nomeCompleto}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">Setor: {activeRequisition.requisitante.secretariaSetor}</p>
                  <p className="text-[11px] text-gray-500">Matrícula: {activeRequisition.requisitante.matriculaFuncional}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contato Oficial</h4>
                  <p className="text-xs font-mono text-primary">{activeRequisition.requisitante.emailInstitucional}</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Assinatura Eletrônica Aceita
                  </p>
                </div>
              </div>

              {/* Bens Requisitados e Justificativa de Uso */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Itens e Justificativas de Uso</h4>
                
                <div className="space-y-3">
                  {activeRequisition.itens.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-grow">
                        <span className="text-[10px] font-mono text-gray-400 uppercase block">Cedente: {item.secretariaOrigem}</span>
                        <h5 className="font-bold text-xs text-primary mt-0.5">{item.nome}</h5>
                        <p className="text-xs text-gray-700 mt-2 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100">
                          <strong>Justificativa de Uso:</strong> "{item.justificativa}"
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 md:border-l md:border-gray-100 md:pl-4 min-w-[120px]">
                        <span className="text-[10px] text-gray-400 uppercase block">Qtd Solicitada</span>
                        <span className="text-base font-bold text-primary block">{item.quantidade} un.</span>
                        <span className="text-[10px] text-emerald-600 font-bold mt-1 block">R$ {(item.valorEstimadoNovo * item.quantidade).toLocaleString('pt-BR')} economizados</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserva Otimista de Estoque Informativo */}
              {activeRequisition.status === 'SUBMETIDA' && (
                <Message
                  variant="warning"
                  title="Reserva Otimista Ativa."
                  body="Este processo possui reserva física temporária garantida no banco de dados para evitar requisições duplicadas simultâneas."
                />
              )}

              {/* Se rejeitado, mostrar motivo */}
              {activeRequisition.status === 'REJEITADA' && activeRequisition.motivoRejeicao && (
                <Message
                  variant="danger"
                  title="Motivo da Recusa / Rejeição."
                  body={activeRequisition.motivoRejeicao}
                />
              )}

              {/* Botões de Ação para Cedente / Central */}
              {roleMode === 'cedente' && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-4 rounded-lg border border-gray-150 mt-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Ações de Homologação
                  </span>

                  <div className="flex gap-2">
                    {activeRequisition.status === 'SUBMETIDA' && (
                      <>
                        <Button
                          variant="tertiary"
                          className="text-danger border border-danger"
                          onClick={(e) => handleOpenRejectionModal(e, activeRequisition.id)}
                        >
                          Recusar Pedido
                        </Button>

                        <Button
                          variant="primary"
                          onClick={() => onUpdateStatus(activeRequisition.id, 'APROVADA')}
                        >
                          Homologar & Aprovar
                        </Button>
                      </>
                    )}

                    {activeRequisition.status === 'APROVADA' && (
                      <Button
                        variant="primary"
                        onClick={() => onUpdateStatus(activeRequisition.id, 'TRANSFERIDA')}
                        icon={<Check className="h-4 w-4" aria-hidden="true" />}
                      >
                        Confirmar Entrega Física / Transferência
                      </Button>
                    )}

                    {(activeRequisition.status === 'APROVADA' || activeRequisition.status === 'TRANSFERIDA') && (
                      <Button
                        variant="secondary"
                        onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                        icon={<Download className="h-4 w-4" aria-hidden="true" />}
                      >
                        Termo de Cessão PDF
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {roleMode === 'requisitante' && (activeRequisition.status === 'APROVADA' || activeRequisition.status === 'TRANSFERIDA') && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-grow">
                    <Message
                      variant="success"
                      title="Sucesso."
                      body="Sua requisição foi homologada com sucesso! Entrega agendada."
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                    icon={<Download className="h-4 w-4" aria-hidden="true" />}
                  >
                    Baixar Termo Digital
                  </Button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center flex flex-col items-center gap-4 shadow-xs">
              <FileText className="h-14 w-14 text-gray-300" />
              <div>
                <h3 className="font-bold text-gray-800 text-base">Nenhum processo selecionado</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Escolha uma requisição de transferência da lista lateral para visualizar o histórico de trâmite, prazos e homologações.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE REJEIÇÃO ESTRUTURADA IMPEDITIVA */}
      <Modal
        open={!!rejectingReqId}
        onClose={() => setRejectingReqId(null)}
        title="Recusar Requisição"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setRejectingReqId(null)}>
              Cancelar
            </Button>
            <Button variant="primary" className="bg-danger" onClick={submitRejection}>
              Registrar Rejeição Oficial
            </Button>
          </>
        }
      >
        <p className="text-xs text-gray-600 mb-4">
          Toda recusa de remanejamento deve exigir a seleção de um motivo regulamentar para auditoria.
        </p>

        <div className="flex flex-col gap-4">
          {/* Motivo Estruturado dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-rejeicao" className="text-xs font-bold text-gray-700">Selecione o Motivo Regulamentar <span className="text-red-500">*</span></label>
            <select
              id="motivo-rejeicao"
              value={selectedMotivoEstruturado}
              onChange={(e) => setSelectedMotivoEstruturado(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-background focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            >
              {MOTIVOS_REJEICAO.map((motivo) => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </div>

          {/* Detalhes complementares */}
          <Textarea
            label="Detalhes Complementares"
            id="rejeicao-detalhes"
            placeholder="Escreva detalhes adicionais sobre o impedimento técnico ou operacional constatado."
            value={detalhesRejeicao}
            onChange={(e) => setDetalhesRejeicao(e.target.value)}
            textareaClassName="resize-none h-20"
          />
        </div>
      </Modal>

    </div>
  );
}
