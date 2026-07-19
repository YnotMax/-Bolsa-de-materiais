/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Package2, ShoppingCart, BarChart3, ShieldAlert, FileText, Menu, X, Landmark, UserCheck, Search } from 'lucide-react';
import BRHeader from '@govbr-ds/core/dist/components/header/header.js';
import BRMenu from '@govbr-ds/core/dist/components/menu/menu.js';
import Tag from './Tag';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  cartCount: number;
}

const NAV_ITEMS = [
  { id: 'vitrine', label: 'Vitrine Virtual', icon: Package2 },
  { id: 'carrinho', label: 'Carrinho', icon: ShoppingCart },
  { id: 'requisicoes', label: 'Requisições', icon: FileText },
  { id: 'trava', label: 'Trava Sistêmica', icon: ShieldAlert },
  { id: 'placar', label: 'Placar & Relatórios', icon: BarChart3 },
];

export default function Header({ currentTab, setTab, cartCount }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dsInitialized = useRef(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (dsInitialized.current) return;
    if (!headerRef.current || !menuRef.current) return;
    dsInitialized.current = true;
    // BRHeader/BRMenu expose no destroy()/teardown method (verified from source), so
    // there is nothing to return as effect cleanup. The dsInitialized ref guard exists
    // to stop StrictMode's dev-only double-invoke from constructing two live instances.
    new BRHeader('header', headerRef.current);
    new BRMenu('menu', menuRef.current);
  }, []);

  // BRHeader/BRMenu toggle open/closed state via direct DOM class mutations from
  // multiple paths (click, Escape, scrim, X button, item-click). Mirroring that with
  // React state would desync from whichever path the library itself handles, so instead
  // we observe the actual DOM state and reflect it onto the trigger buttons'
  // aria-expanded. This MutationObserver is created and owned entirely by this
  // component (not by BRHeader/BRMenu), so its cleanup is real and safe on unmount.
  useEffect(() => {
    const menuEl = menuRef.current;
    const menuTrigger = menuTriggerRef.current;
    const searchEl = headerRef.current?.querySelector('.header-search');
    const searchTrigger = searchTriggerRef.current;
    if (!menuEl || !menuTrigger || !searchEl || !searchTrigger) return;

    menuTrigger.setAttribute('aria-expanded', menuEl.classList.contains('active') ? 'true' : 'false');
    searchTrigger.setAttribute('aria-expanded', searchEl.classList.contains('active') ? 'true' : 'false');

    const menuObserver = new MutationObserver(() => {
      const isActive = menuEl.classList.contains('active');
      menuTrigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      if (!isActive) {
        menuTrigger.focus();
      }
    });
    menuObserver.observe(menuEl, { attributes: true, attributeFilter: ['class'] });

    const searchObserver = new MutationObserver(() => {
      searchTrigger.setAttribute('aria-expanded', searchEl.classList.contains('active') ? 'true' : 'false');
    });
    searchObserver.observe(searchEl, { attributes: true, attributeFilter: ['class'] });

    return () => {
      menuObserver.disconnect();
      searchObserver.disconnect();
    };
  }, []);

  // BRMenu's own JS (verified from source in Task 1's review) handles Escape and
  // Arrow-key navigation but never constrains Tab within the open off-canvas panel — a
  // keyboard user could Tab past the last menu item onto page content hidden behind the
  // scrim. This traps Tab/Shift+Tab within the open menu.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const menuEl = menuRef.current;
      if (e.key !== 'Tab' || !menuEl || !menuEl.classList.contains('active')) return;
      const focusable = menuEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Phase 2 scope: search switches to the Vitrine tab. Passing the typed term into
    // Vitrine's own filter state is Phase 4 work, when Vitrine.tsx itself is migrated.
    setTab('vitrine');
  };

  const cartLabel = `${cartCount} ${cartCount === 1 ? 'item' : 'itens'} no carrinho`;

  return (
    <>
      {/* Barra de Identificação Institucional superior do gov.br */}
      <div className="bg-primary-dark text-[11px] font-sans border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center opacity-90 text-white">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wider text-amber-400">BR</span>
            <div className="w-[1px] h-3 bg-white/30" />
            <a href="https://www.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline text-white">Portal do Governo Brasileiro</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Serviços Municipais</span>
            <span className="font-semibold text-emerald-400">● PMF Ativa</span>
          </div>
        </div>
      </div>

      <header ref={headerRef} className="br-header" data-sticky>
        <div className="container-lg">
          <div className="header-top">
            <div className="header-logo">
              <Landmark className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="br-divider vertical mx-1" />
              <div className="header-sign">Prefeitura de Florianópolis</div>
            </div>
            <div className="header-actions">
              <div className="header-search-trigger">
                <button ref={searchTriggerRef} className="br-button circle" type="button" aria-label="Abrir Busca" data-toggle="search" data-target=".header-search">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="header-login">
                <div className="header-avatar flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-primary flex items-center gap-1 justify-end font-semibold">
                      <UserCheck className="h-3 w-3" /> Requisitante / Cedente
                    </div>
                    <div className="text-xs font-medium text-gray-700 max-w-[150px] truncate">Maurício Alexandre</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary flex items-center justify-center font-bold text-primary text-sm">
                    MA
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom flex-wrap gap-y-2">
            <div className="header-menu min-w-44">
              <div className="header-menu-trigger">
                <button ref={menuTriggerRef} className="br-button circle" type="button" aria-label="Abrir menu de navegação" aria-controls="main-navigation" data-toggle="menu" data-target="#main-navigation">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="header-info min-w-0">
                <h1 className="header-title truncate" style={{ margin: 0, fontWeight: 'inherit' }}>Bolsa de Materiais</h1>
                <div className="header-subtitle truncate">Reaproveitamento entre almoxarifados municipais</div>
              </div>
            </div>
            <div className="header-search">
              <form className="br-input has-icon" onSubmit={handleSearchSubmit}>
                <label htmlFor="header-search-input">Texto da pesquisa</label>
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="O que você procura?"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button className="br-button circle small" type="submit" aria-label="Pesquisar">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <button className="br-button circle search-close ml-1" type="button" aria-label="Fechar Busca" data-dismiss="search">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Navegação Desktop persistente — decisão de design deliberada: DS-gov usa
                apenas menu off-canvas, mas essas 5 seções são usadas o tempo todo
                (ver Phase 2 design spec, Decisão 3). Off-canvas é usado no mobile abaixo. */}
            <nav className="hidden lg:flex items-center gap-2 ml-4" aria-label="Navegação principal">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`br-button ${isActive ? 'primary' : ''} small items-center`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className='ml-1'>{item.label}</span>
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span className="ml-1">
                        <Tag variant="count" tone="danger" count={cartCount} label={cartLabel} />
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Menu off-canvas (mobile). Sibling of <header>, not nested inside it — matches
          DS-gov's own reference structure, connected only via #main-navigation /
          data-target="#main-navigation". */}
      <div className="br-menu" id="main-navigation" ref={menuRef}>
        <div className="menu-container">
          <div className="menu-panel">
            <div className="menu-header">
              <div className="menu-title">
                <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Bolsa de Materiais</span>
              </div>
              <div className="menu-close">
                <button className="br-button circle" type="button" aria-label="Fechar o menu" data-dismiss="menu">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <nav className="menu-body" role="tree">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
                    href="#"
                    role="treeitem"
                    aria-current={currentTab === item.id ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      setTab(item.id);
                      menuRef.current?.classList.remove('active');
                    }}
                  >
                    <span className="icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="content">{item.label}</span>
                    {item.id === 'carrinho' && cartCount > 0 && (
                      <span className="ml-2">
                        <Tag variant="count" tone="danger" count={cartCount} label={cartLabel} />
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="menu-scrim" data-dismiss="menu" />
        </div>
      </div>
    </>
  );
}
