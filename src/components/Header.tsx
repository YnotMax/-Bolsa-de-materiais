/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Package2, ShoppingCart, BarChart3, HelpCircle, ShieldAlert, FileText, Menu, X, Landmark, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  cartCount: number;
}

export default function Header({ currentTab, setTab, cartCount }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'vitrine', label: 'Vitrine Virtual', icon: Package2 },
    { id: 'carrinho', label: 'Carrinho', icon: ShoppingCart, count: cartCount },
    { id: 'requisicoes', label: 'Requisições', icon: FileText },
    { id: 'trava', label: 'Trava Sistêmica', icon: ShieldAlert },
    { id: 'placar', label: 'Placar & Relatórios', icon: BarChart3 },
  ];

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      {/* Barra de Identificação Institucional superior do gov.br */}
      <div className="bg-primary-dark text-[11px] font-sans border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center opacity-90">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wider text-amber-400">BR</span>
            <div className="w-[1px] h-3 bg-white/30" />
            <a href="https://www.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline">Portal do Governo Brasileiro</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Serviços Municipais</span>
            <span className="font-semibold text-emerald-400">● PMF Ativa</span>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo e Nome do App */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('vitrine')}>
            <div className="bg-white/10 p-2 rounded-lg border border-white/20 transition-colors hover:bg-white/15">
              <Landmark className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-400 font-display">Florianópolis</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded border border-emerald-400/30">PoC TRL3</span>
              </div>
              <h1 className="font-display font-bold text-lg md:text-xl tracking-tight leading-none text-white">Bolsa de Materiais</h1>
            </div>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center h-full gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  id={`nav-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 h-10 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm border-b-2 border-emerald-400'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Usuário Ativo & Gov.br */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-emerald-400 flex items-center gap-1 justify-end font-semibold">
                <UserCheck className="h-3 w-3" /> Requisitante / Cedente
              </div>
              <div className="text-xs font-medium text-gray-200 max-w-[150px] truncate">Maurício Alexandre</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-bold text-emerald-400 text-sm">
              MA
            </div>
          </div>

          {/* Botão de Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary-dark border-t border-white/10 py-3 px-4 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-md font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
          
          <div className="h-[1px] bg-white/10 my-2" />
          
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-bold text-emerald-400 text-sm">
              MA
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> Maurício Alexandre
              </div>
              <div className="text-[10px] text-gray-400">Secretaria de Administração (SMA)</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
