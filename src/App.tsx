/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Vitrine from './components/Vitrine';
import Carrinho from './components/Carrinho';
import WorkflowManager from './components/WorkflowManager';
import AvisosCompras from './components/AvisosCompras';
import Relatorios from './components/Relatorios';
import { Produto, CartItem, Requisicao, StatusRequisicao, RequisitanteData } from './types';
import { MOCK_PRODUTOS } from './data';
import { Landmark, Info, MessageSquareCode, ShieldCheck, Scale, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('bolsa_active_tab') || 'vitrine';
  });

  // [CONTRIBUIÇÃO PARCEIROS]: O estado atual inicializa com MOCK_PRODUTOS via localStorage.
  // TODO: Conectar este estado com o endpoint real do backend (GET /api/products) para 
  // consumir os dados diretamente do MongoDB / Prisma.
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem('bolsa_produtos');
    return saved ? JSON.parse(saved) : MOCK_PRODUTOS;
  });

  // Reallocation Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bolsa_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // [CONTRIBUIÇÃO PARCEIROS]: O histórico de requisições também é mockado.
  // TODO: Trocar para o endpoint (POST /api/requests e futuramente GET /api/requests)
  // para persistir o histórico e aplicar o Workflow de Aprovação de fato no banco.
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>(() => {
    const saved = localStorage.getItem('bolsa_requisicoes');
    if (saved) return JSON.parse(saved);

    // Initial mock requisitions for demonstration
    return [
      {
        id: "req-001",
        codigoProcesso: "PMF-48291/2026",
        dataCriacao: "10/07/2026",
        requisitante: {
          nomeCompleto: "Thiago Barbosa",
          matriculaFuncional: "884321-9",
          secretariaSetor: "Secretaria Municipal de Saúde (SMS)",
          emailInstitucional: "thiago.barbosa@pmf.sc.gov.br",
          declaraTermos: true
        },
        itens: [
          {
            produtoId: "prod-003",
            nome: "Mesa de Escritório em L",
            quantidade: 2,
            justificativa: "Substituição de mobiliário danificado na recepção da UBS Trindade.",
            secretariaOrigem: "Secretaria Municipal de Saúde (SMS)",
            valorEstimadoNovo: 850.00,
            co2eEvitadoKg: 35
          }
        ],
        status: "SUBMETIDA",
        historicoStatus: [
          { status: "RASCUNHO", data: "10/07/2026 10:15", responsavel: "Thiago Barbosa" },
          { status: "SUBMETIDA", data: "10/07/2026 10:30", responsavel: "Thiago Barbosa", observacao: "Reserva física temporária garantida automaticamente" }
        ]
      },
      {
        id: "req-002",
        codigoProcesso: "PMF-34912/2026",
        dataCriacao: "08/07/2026",
        requisitante: {
          nomeCompleto: "Tony Max",
          matriculaFuncional: "128493-5",
          secretariaSetor: "Secretaria Municipal de Administração (SMA)",
          emailInstitucional: "tony.max@pmf.sc.gov.br",
          declaraTermos: true
        },
        itens: [
          {
            produtoId: "prod-001",
            nome: "Monitor Dell 24 Polegadas",
            quantidade: 4,
            justificativa: "Equipar a nova equipe de planejamento e monitoramento de contratos de terceirização.",
            secretariaOrigem: "Secretaria Municipal de Educação (SME)",
            valorEstimadoNovo: 950.00,
            co2eEvitadoKg: 45
          }
        ],
        status: "APROVADA",
        historicoStatus: [
          { status: "SUBMETIDA", data: "08/07/2026 14:00", responsavel: "Tony Max" },
          { status: "EM_ANALISE", data: "08/07/2026 14:30", responsavel: "Central de Triagem" },
          { status: "APROVADA", data: "09/07/2026 09:15", responsavel: "Gestor Central", observacao: "Cessão homologada. Termo de cessão disponível para assinatura." }
        ]
      }
    ];
  });

  // Save states to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('bolsa_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('bolsa_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('bolsa_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bolsa_requisicoes', JSON.stringify(requisicoes));
  }, [requisicoes]);

  // Cart operations
  const handleAddToCart = (produto: Produto) => {
    const existing = cart.find(item => item.produto.id === produto.id);
    if (existing) return;

    const newItem: CartItem = {
      produto,
      quantidadeSolicitada: 1,
      justificativa: ''
    };
    setCart([...cart, newItem]);
  };

  const handleUpdateQuantity = (produtoId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.produto.id === produtoId) {
        const newQty = item.quantidadeSolicitada + delta;
        const maxQty = item.produto.quantidade;
        if (newQty >= 1 && newQty <= maxQty) {
          return { ...item, quantidadeSolicitada: newQty };
        }
      }
      return item;
    }));
  };

  const handleUpdateJustificativa = (produtoId: string, justificativa: string) => {
    setCart(cart.map(item => {
      if (item.produto.id === produtoId) {
        return { ...item, justificativa };
      }
      return item;
    }));
  };

  const handleRemoveItem = (produtoId: string) => {
    setCart(cart.filter(item => item.produto.id !== produtoId));
  };

  // Submit Requisition Handler
  const handleSubmitRequisition = (requisitante: RequisitanteData) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const codigoProcesso = `PMF-${randomNum}/2026`;
    const dataCriacao = new Date().toLocaleDateString('pt-BR');

    const novaRequisicao: Requisicao = {
      id: `req-${Date.now()}`,
      codigoProcesso,
      dataCriacao,
      requisitante,
      itens: cart.map(item => ({
        produtoId: item.produto.id,
        nome: item.produto.nome,
        quantidade: item.quantidadeSolicitada,
        justificativa: item.justificativa,
        secretariaOrigem: item.produto.secretariaOrigem,
        valorEstimadoNovo: item.produto.valorEstimadoNovo,
        co2eEvitadoKg: item.produto.co2eEvitadoKg
      })),
      status: 'SUBMETIDA',
      historicoStatus: [
        { status: 'SUBMETIDA', data: `${dataCriacao} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, responsavel: requisitante.nomeCompleto, observacao: 'Processo aberto pelo servidor' }
      ]
    };

    setRequisicoes([novaRequisicao, ...requisicoes]);
    setCart([]); // Clear cart
    setActiveTab('requisicoes'); // switch to requisitions list
  };

  // Transition Workflow Status Handler
  const handleUpdateStatus = (requisicaoId: string, novoStatus: StatusRequisicao, motivoRejeicao?: string) => {
    setRequisicoes(prev => prev.map(req => {
      if (req.id === requisicaoId) {
        const timestamp = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Subtract inventory physical quantity if requisition gets approved
        if (novoStatus === 'APROVADA') {
          setProdutos(currentProds => currentProds.map(prod => {
            const requestedItem = req.itens.find(i => i.produtoId === prod.id);
            if (requestedItem) {
              const updatedQty = Math.max(0, prod.quantidade - requestedItem.quantidade);
              return { ...prod, quantidade: updatedQty };
            }
            return prod;
          }));
        }

        return {
          ...req,
          status: novoStatus,
          motivoRejeicao: motivoRejeicao || req.motivoRejeicao,
          historicoStatus: [
            ...req.historicoStatus,
            {
              status: novoStatus,
              data: timestamp,
              responsavel: 'Gestor Central (SMA)',
              observacao: novoStatus === 'APROVADA' ? 'Dotação homologada. Pronta para remanejamento físico.' : novoStatus === 'REJEITADA' ? 'Solicitação indeferida conforme regras de dotação' : undefined
            }
          ]
        };
      }
      return req;
    }));
  };

  // Bypass action from system block - add and open cart directly
  const handleAddFromSimulated = (produto: Produto) => {
    handleAddToCart(produto);
    setActiveTab('carrinho');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      
      {/* Header oficial gov.br DS e PMF */}
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        cartCount={cart.length}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-10">
        <div className="transition-all duration-300">
          
          {activeTab === 'vitrine' && (
            <Vitrine
              onAddToCart={handleAddToCart}
              cartProductIds={cart.map(item => item.produto.id)}
            />
          )}

          {activeTab === 'carrinho' && (
            <Carrinho
              cartItems={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateJustificativa={handleUpdateJustificativa}
              onRemoveItem={handleRemoveItem}
              onSubmitRequisition={handleSubmitRequisition}
              onGoToVitrine={() => setActiveTab('vitrine')}
            />
          )}

          {activeTab === 'requisicoes' && (
            <WorkflowManager
              requisicoes={requisicoes}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'trava' && (
            <AvisosCompras
              onAddFromSimulated={handleAddFromSimulated}
              onSetTab={setActiveTab}
            />
          )}

          {activeTab === 'placar' && (
            <Relatorios
              requisicoes={requisicoes}
            />
          )}

        </div>
      </main>

      {/* Rodapé Oficial da Prefeitura de Florianópolis gov.br DS */}
      <footer className="bg-primary-dark text-white border-t-4 border-emerald-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Prefeitura */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-emerald-400" />
              <span className="font-bold font-display uppercase tracking-wider text-sm">Prefeitura de Florianópolis</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Secretaria Municipal de Administração (SMA)<br />
              Diretoria de Patrimônio e Gestão de Almoxarifados Públicos.
            </p>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-400/25 w-fit">
              Desafio 14 - PoC TRL3
            </span>
          </div>

          {/* Col 2: Regulatory compliance */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-xs uppercase text-gray-200 tracking-wider font-display">Marco Regulatório</span>
            <ul className="text-xs text-gray-300 space-y-1.5 leading-snug">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Lei Federal nº 14.133/2021 (Nova Lei de Licitações)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Scale className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Decreto Estadual nº 45.242/2009 (Estado de Conservação)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Globe className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>eMAG & WCAG 2.1 AA (Acessibilidade Digital)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal gov.br Links */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-xs uppercase text-gray-200 tracking-wider font-display">Links de Transparência</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 hover:underline">Acessibilidade</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 hover:underline">Dados Abertos</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 hover:underline">Privacidade</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 hover:underline">Termos de Uso</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 hover:underline">Ouvidoria</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 hover:underline">Portal de Compras</a>
            </div>
          </div>

        </div>

        {/* Copyleft bottom footer bar */}
        <div className="bg-primary-dark/85 border-t border-white/10 text-[10px] text-gray-400 py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 Prefeitura Municipal de Florianópolis. Todos os direitos reservados.</span>
            <span>Desenvolvido no âmbito da 1ª Jornada Incubintech de Inovação Aberta.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
