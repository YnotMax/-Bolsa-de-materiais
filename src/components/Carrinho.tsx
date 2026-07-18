/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, Trash2, ShieldAlert, ArrowLeft, Send, CheckCircle2, UserCheck, Minus, Plus } from 'lucide-react';
import { CartItem, RequisitanteData } from '../types';
import { MOCK_SECRETARIAS, getEstadoInfo } from '../data';
import Button from './Button';
import Input from './Input';
import Checkbox from './Checkbox';
import Textarea from './Textarea';
import Message from './Message';

interface CarrinhoProps {
  cartItems: CartItem[];
  onUpdateQuantity: (produtoId: string, delta: number) => void;
  onUpdateJustificativa: (produtoId: string, justificativa: string) => void;
  onRemoveItem: (produtoId: string) => void;
  onSubmitRequisition: (requisitante: RequisitanteData) => void;
  onGoToVitrine: () => void;
}

export default function Carrinho({
  cartItems,
  onUpdateQuantity,
  onUpdateJustificativa,
  onRemoveItem,
  onSubmitRequisition,
  onGoToVitrine,
}: CarrinhoProps) {
  // Requester form state
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [email, setEmail] = useState('');
  const [declara, setDeclara] = useState(false);

  // Form error states
  const [emailError, setEmailError] = useState('');
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  // Validate e-mail institutional
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError('E-mail institucional é obrigatório');
    } else if (!val.endsWith('@pmf.sc.gov.br')) {
      setEmailError('O e-mail deve pertencer ao domínio @pmf.sc.gov.br');
    } else {
      setEmailError('');
    }
  };

  const isFormValid = 
    nome.trim().length > 0 &&
    matricula.trim().length > 0 &&
    secretaria !== '' &&
    email.endsWith('@pmf.sc.gov.br') &&
    declara &&
    cartItems.length > 0 &&
    cartItems.every(item => item.justificativa.trim().length >= 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setShowValidationWarning(true);
      return;
    }

    const requisitante: RequisitanteData = {
      nomeCompleto: nome,
      matriculaFuncional: matricula,
      secretariaSetor: secretaria,
      emailInstitucional: email,
      declaraTermos: declara
    };

    onSubmitRequisition(requisitante);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title & Desc */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
          Carrinho de Remanejamento
        </h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Revise os bens ociosos reservados e preencha a justificativa legal de interesse municipal para prosseguir com a transferência.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center gap-4">
          <ShoppingCart className="h-16 w-16 text-gray-300" />
          <div>
            <p className="font-bold text-gray-800 text-lg">Seu carrinho de remanejamento está vazio</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Navegue na nossa vitrine virtual para encontrar materiais e móveis ociosos em outras unidades administrativas.
            </p>
          </div>
          <Button variant="primary" onClick={onGoToVitrine} icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
            Navegar no Catálogo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Seção da Esquerda: Itens no Carrinho */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <h3 className="font-bold text-lg text-gray-800 font-display flex items-center gap-2">
              <span>Bens Selecionados ({cartItems.length})</span>
            </h3>

            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <article
                  key={item.produto.id}
                  id={`cart-item-${item.produto.id}`}
                  className="br-card hover bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:border-emerald-500 transition-all flex flex-col sm:flex-row gap-5"
                >
                  {/* Imagem do Item com tag */}
                  <div className="w-full sm:w-44 h-32 bg-gray-50 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img
                      src={item.produto.fotoUrl}
                      alt={item.produto.nome}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${getEstadoInfo(item.produto.estadoConservacao).tone}`}>
                      {getEstadoInfo(item.produto.estadoConservacao).label}
                    </span>
                  </div>

                  {/* Informações e Editor */}
                  <div className="flex flex-col justify-between flex-grow gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[11px] font-mono text-gray-400 block">PAT: {item.produto.codigoPatrimonio}</span>
                        <h4 className="font-display font-bold text-primary text-base leading-snug">
                          {item.produto.nome}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Cedente: <strong className="text-gray-700">{item.produto.secretariaOrigem}</strong>
                        </p>
                      </div>
                      <Button
                        variant="tertiary"
                        circle
                        onClick={() => onRemoveItem(item.produto.id)}
                        aria-label="Remover item"
                        id={`btn-remove-${item.produto.id}`}
                        icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                      />
                    </div>

                    {/* Quantidade Editor */}
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-150 w-fit">
                      <span className="text-xs text-gray-500 font-bold px-1">Quantidade:</span>
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <Button
                          variant="tertiary"
                          size="small"
                          circle
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, -1)}
                          disabled={item.quantidadeSolicitada <= 1}
                          aria-label="Diminuir quantidade"
                          icon={<Minus className="h-3.5 w-3.5" aria-hidden="true" />}
                        />
                        <span className="w-10 text-center text-sm font-bold text-primary font-mono">
                          {item.quantidadeSolicitada}
                        </span>
                        <Button
                          variant="tertiary"
                          size="small"
                          circle
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, 1)}
                          disabled={item.quantidadeSolicitada >= item.produto.quantidade}
                          aria-label="Aumentar quantidade"
                          icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        Máx: {item.produto.quantidade} un.
                      </span>
                    </div>

                    {/* Campo de Justificativa de Uso */}
                    <div className="mt-1">
                      <Textarea
                        label="Justificativa de Uso Individual *"
                        id={`justificativa-${item.produto.id}`}
                        placeholder="Descreva a finalidade pública desse material. Ex: Substituição de cadeiras quebradas no setor de atendimento ao cidadão."
                        value={item.justificativa}
                        onChange={(e) => onUpdateJustificativa(item.produto.id, e.target.value)}
                        counterText={`Mínimo 10 caracteres (restam: ${Math.max(0, 10 - item.justificativa.length)})`}
                        className={`resize-none h-16 ${
                          item.justificativa.trim().length >= 10 ? '' : 'border-amber-300 focus:ring-amber-500'
                        }`}
                        required
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Seção da Direita: Form de Requisitante */}
          <aside className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-md lg:sticky lg:top-24 flex flex-col gap-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-primary font-display flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                Dados do Requisitante
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Identificação do servidor público responsável pela solicitação.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Campo: Nome Completo */}
              <Input
                label="Nome Completo *"
                id="nome-completo"
                type="text"
                placeholder="Nome do Servidor Requisitante"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              {/* Campo: Matrícula Funcional */}
              <Input
                label="Matrícula Funcional *"
                id="matricula-funcional"
                type="text"
                placeholder="Ex: 129481-2"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />

              {/* Campo: Secretaria Setor */}
              <div className="flex flex-col gap-1">
                <label htmlFor="secretaria-requisitante" className="text-xs font-bold text-gray-700">
                  Secretaria/Setor Requisitante <span className="text-red-500">*</span>
                </label>
                <select
                  id="secretaria-requisitante"
                  value={secretaria}
                  onChange={(e) => setSecretaria(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg bg-background focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Selecione seu órgão municipal</option>
                  {MOCK_SECRETARIAS.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Campo: Email Institucional */}
              <Input
                label="E-mail Institucional *"
                id="email-institucional"
                type="email"
                placeholder="exemplo@pmf.sc.gov.br"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                state={emailError ? 'danger' : undefined}
                helperText={emailError || 'Apenas domínios @pmf.sc.gov.br são aceitos.'}
                required
              />

              {/* Checkbox Termo de Compromisso */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="checkbox-termos"
                  checked={declara}
                  onChange={(e) => setDeclara(e.target.checked)}
                  required
                  label="Declaro que os bens ociosos ora requisitados destinam-se exclusivamente para uso no serviço público e que há dotação física para os acomodar."
                />
              </div>

              {/* Warning if validation incomplete */}
              {showValidationWarning && !isFormValid && (
                <Message
                  variant="warning"
                  title="Solicitação Incompleta."
                  body="Por favor, verifique se preencheu todos os dados do requisitante, se o e-mail possui o final oficial e se cada justificativa de uso possui no mínimo 10 caracteres."
                />
              )}

              {/* Botões de Submissão */}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isFormValid}
                  id="btn-submit-requisition"
                  className="w-full justify-center"
                  icon={<Send className="h-4 w-4" aria-hidden="true" />}
                >
                  Submeter Requisição de Remanejamento
                </Button>

                <Button
                  type="button"
                  variant="tertiary"
                  onClick={onGoToVitrine}
                  className="w-full justify-center"
                >
                  Continuar Procurando Bens
                </Button>
              </div>

            </form>
          </aside>

        </div>
      )}

    </div>
  );
}
