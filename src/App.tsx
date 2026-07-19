/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Vitrine from './components/Vitrine';
import Carrinho from './components/Carrinho';
import WorkflowManager from './components/WorkflowManager';
import AvisosCompras from './components/AvisosCompras';
import Relatorios from './components/Relatorios';
import { Produto, CartItem, Requisicao, StatusRequisicao, RequisitanteData } from './types';
import { MOCK_PRODUTOS } from './data';

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

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Pular para o conteúdo principal
      </a>

      {/* Header oficial gov.br DS e PMF */}
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        cartCount={cart.length}
      />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-10">
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

      <Footer />

    </div>
  );
}
