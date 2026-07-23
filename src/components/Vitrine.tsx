/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingCart, RefreshCw, Layers, Check, ChevronRight, Eye, Building2, Info, ClipboardCopy, Leaf, Coins, LayoutGrid, List, Minus, Plus } from 'lucide-react';
import { Produto } from '../types';
import { MOCK_PRODUTOS, MOCK_CATEGORIAS, MOCK_SECRETARIAS, fuzzySearch, getEstadoInfo, getCategoriaTone } from '../data';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

interface VitrineProps {
  onAddToCart: (produto: Produto, quantidade?: number) => void;
  cartProductIds: string[];
  produtosData?: Produto[];
}

type MatrixCol = 'NOVO' | 'USADO' | 'DANIFICADO';

const mapEstadoToMatrixCol = (estado: string): MatrixCol => {
  if (estado === 'NOVO') return 'NOVO';
  if (estado === 'BOM' || estado === 'REGULAR') return 'USADO';
  return 'DANIFICADO';
};

interface MatrixReservationProps {
  catmat: string;
  currentProducts: Produto[];
  onReserve: (produto: Produto, quantidade: number) => void;
  cartProductIds: string[];
}

function MatrixReservation({ catmat, currentProducts, onReserve, cartProductIds }: MatrixReservationProps) {
  const items = useMemo(() => currentProducts.filter(p => p.codigoCatmat === catmat), [currentProducts, catmat]);
  
  // Group by secretaria
  const grouped = useMemo(() => {
    const map = new Map<string, Record<MatrixCol, Produto[]>>();
    items.forEach(p => {
      const col = mapEstadoToMatrixCol(p.estadoConservacao);
      if (!map.has(p.secretariaOrigem)) {
        map.set(p.secretariaOrigem, { NOVO: [], USADO: [], DANIFICADO: [] });
      }
      map.get(p.secretariaOrigem)![col].push(p);
    });
    return Array.from(map.entries()).map(([secretaria, cols]) => ({ secretaria, cols }));
  }, [items]);

  const [activeCell, setActiveCell] = useState<{ secretaria: string; col: MatrixCol } | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleCellClick = (secretaria: string, col: MatrixCol, prods: Produto[]) => {
    if (prods.length === 0) return;
    setActiveCell({ secretaria, col });
    const key = `${secretaria}-${col}`;
    if (!quantities[key]) setQuantities(prev => ({ ...prev, [key]: 1 }));
  };

  const updateQuantity = (key: string, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[key] || 1;
      const next = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const handleReserve = (prods: Produto[], key: string) => {
    if (prods.length > 0) {
      onReserve(prods[0], quantities[key] || 1);
      setActiveCell(null);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        Disponibilidade na Rede Municipal
      </h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-[10px] uppercase text-gray-500 border-b border-gray-200 tracking-wider">
            <tr>
              <th className="px-4 py-3 font-bold">Secretaria Cedente</th>
              <th className="px-4 py-3 font-bold text-center w-28">Novo</th>
              <th className="px-4 py-3 font-bold text-center w-28">Usado</th>
              <th className="px-4 py-3 font-bold text-center w-28">Danificado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {grouped.map(({ secretaria, cols }) => (
              <tr key={secretaria} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-700 max-w-[200px] truncate" title={secretaria}>
                  {secretaria}
                </td>
                {(['NOVO', 'USADO', 'DANIFICADO'] as MatrixCol[]).map(col => {
                  const prods = cols[col];
                  const total = prods.reduce((acc, p) => acc + p.quantidade, 0);
                  const isAvailable = total > 0;
                  const isActive = activeCell?.secretaria === secretaria && activeCell?.col === col;
                  const key = `${secretaria}-${col}`;
                  
                  // Check if any product in this cell is already in cart
                  const inCart = prods.some(p => cartProductIds.includes(p.id));
                  
                  return (
                    <td key={col} className="px-2 py-2 text-center align-middle border-l border-gray-100">
                      {isAvailable ? (
                        isActive && !inCart ? (
                          <div className="flex flex-col items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-1 bg-white border border-emerald-200 rounded-md p-0.5 shadow-sm">
                              <button onClick={() => updateQuantity(key, -1, total)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-mono font-bold text-xs w-5 text-center text-emerald-800">{quantities[key] || 1}</span>
                              <button onClick={() => updateQuantity(key, 1, total)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <Button 
                              variant="primary" 
                              size="small" 
                              className="w-full text-[10px] py-1 px-1 h-auto"
                              onClick={() => handleReserve(prods, key)}
                            >
                              Adicionar
                            </Button>
                          </div>
                        ) : inCart ? (
                          <div className="flex flex-col items-center justify-center gap-1 opacity-70">
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">No Carrinho</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellClick(secretaria, col, prods)}
                            className="w-full h-full min-h-[36px] rounded hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-center font-bold text-gray-600 border border-transparent hover:border-emerald-200"
                            title="Clique para selecionar quantidade"
                          >
                            {total}
                          </button>
                        )
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Vitrine({ onAddToCart, cartProductIds, produtosData }: VitrineProps) {
  // View mode state (list or grid, defaults to list)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem('bolsa_view_mode') as 'list' | 'grid') || 'list';
  });

  const handleSetViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('bolsa_view_mode', mode);
  };

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  
  // Pagination limit (Load More)
  const [displayLimit, setDisplayLimit] = useState(6);
  
  // Selected product for the "Detalhes" modal
  const [detailProduct, setDetailProduct] = useState<Produto | null>(null);
  
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sorting secretariats and categories alphabetically as requested
  const sortedSecretarias = useMemo(() => {
    return [...MOCK_SECRETARIAS].sort((a, b) => a.localeCompare(b));
  }, []);

  const sortedCategorias = useMemo(() => {
    return [...MOCK_CATEGORIAS].sort((a, b) => a.localeCompare(b));
  }, []);

  const currentProductsList = produtosData && produtosData.length > 0 ? produtosData : MOCK_PRODUTOS;

  // Filter products incrementally in real-time
  const filteredProducts = useMemo(() => {
    return currentProductsList.filter((item) => {
      const matchSearch = fuzzySearch(searchTerm, item.nome) || 
                          fuzzySearch(searchTerm, item.categoria) ||
                          fuzzySearch(searchTerm, item.codigoCatmat) ||
                          fuzzySearch(searchTerm, item.codigoPatrimonio);
      
      const matchCategory = selectedCategory ? item.categoria === selectedCategory : true;
      const matchSecretaria = selectedSecretaria ? item.secretariaOrigem === selectedSecretaria : true;
      const matchEstado = selectedEstado.length > 0 ? selectedEstado.includes(item.estadoConservacao) : true;

      return matchSearch && matchCategory && matchSecretaria && matchEstado;
    });
  }, [searchTerm, selectedCategory, selectedSecretaria, selectedEstado, currentProductsList]);

  // Handle adding product to cart
  const handleAddToCart = (e: React.MouseEvent, produto: Produto, quantidade?: number) => {
    e.stopPropagation();
    onAddToCart(produto, quantidade);
    showToast(`"${produto.nome}" adicionado ao carrinho de remanejamento!`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSecretaria('');
    setSelectedEstado([]);
    setDisplayLimit(6);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedSecretaria || selectedEstado.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-secondary text-on-secondary px-5 py-3.5 rounded-lg shadow-xl border border-secondary flex items-center gap-2 motion-safe:animate-toast-in motion-reduce:animate-none"
        >
          <Check className="h-5 w-5 bg-secondary-container rounded-full p-0.5 text-on-secondary-container" aria-hidden="true" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Seção Superior - Boas-vindas e Visão da Plataforma */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
          Catálogo de Bens Ociosos
        </h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Evite novas compras públicas! Solicite o remanejamento direto de itens disponíveis, ociosos ou sem giro parados em outras secretarias de Florianópolis.
        </p>
      </div>

      {/* Grid de Busca e Shortcuts Rápidos */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <Input
          label="Buscar bens ociosos"
          id="vitrine-search-input"
          type="text"
          placeholder="Buscar por nome do material, patrimônio, código CATMAT ou categoria... (ex: papel, monitor, cadeira)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setDisplayLimit(6); // reset pagination when typing
          }}
          icon={<Search className="h-4 w-4" aria-hidden="true" />}
        />

        {/* Atalhos Rápidos e Botão de Limpar Busca */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Atalhos Rápidos:</span>
            {['Cadeira', 'Mesa', 'Monitor', 'Armário', 'Computador', 'Ar Condicionado'].map((termo) => (
              <Button
                key={termo}
                variant="secondary"
                size="small"
                onClick={() => {
                  setSearchTerm(termo);
                  setDisplayLimit(6);
                }}
              >
                {termo}
              </Button>
            ))}
          </div>

          {hasActiveFilters && (
            <Button
              variant="tertiary"
              size="small"
              onClick={clearFilters}
              icon={<RefreshCw className="h-3.5 w-3.5 mr-1" aria-hidden="true" />}
              className="text-red-700 hover:bg-red-50"
            >
              Limpar Filtros & Busca
            </Button>
          )}
        </div>
      </div>

      {/* Layout de Filtro Lateral + Grid Central */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar de Filtros Lateral (Scroll Independente + Ajuste de Altura) */}
        <aside className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-primary flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600" />
              Filtrar Catálogo
            </h3>
            {hasActiveFilters && (
              <Button variant="tertiary" size="small" onClick={clearFilters}>
                Limpar
              </Button>
            )}
          </div>

          {/* Filtro: Categoria */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700">Categoria</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedCategory ? 'primary' : 'secondary'}
                size="small"
                onClick={() => { setSelectedCategory(''); setDisplayLimit(6); }}
              >
                Todas
              </Button>
              {sortedCategorias.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => { setSelectedCategory(prev => prev === cat ? '' : cat); setDisplayLimit(6); }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtro: Secretaria Cedente */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700">Secretaria Cedente</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedSecretaria ? 'primary' : 'secondary'}
                size="small"
                onClick={() => { setSelectedSecretaria(''); setDisplayLimit(6); }}
              >
                Todas
              </Button>
              {sortedSecretarias.map((sec) => (
                <Button
                  key={sec}
                  variant={selectedSecretaria === sec ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => { setSelectedSecretaria(prev => prev === sec ? '' : sec); setDisplayLimit(6); }}
                  title={sec}
                >
                  {sec.split('(')[1]?.replace(')','') || sec}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtro: Estado de Conservação */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700">Estado de Conservação</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'NOVO', label: 'Novo' },
                { value: 'BOM', label: 'Bom' },
                { value: 'REGULAR', label: 'Regular' },
                { value: 'PESSIMO', label: 'Péssimo' },
                { value: 'SUCATA', label: 'Sucata' }
              ].map(estado => {
                const isActive = selectedEstado.includes(estado.value);
                return (
                  <Button
                    key={estado.value}
                    variant={isActive ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => {
                      setSelectedEstado(prev => 
                        prev.includes(estado.value) 
                          ? prev.filter(e => e !== estado.value) 
                          : [...prev, estado.value]
                      );
                      setDisplayLimit(6);
                    }}
                  >
                    {estado.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Informativo de Acessibilidade */}
          <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-[11px] text-emerald-800 flex items-start gap-2">
            <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Acessibilidade Ativa</p>
              <p className="mt-0.5 leading-relaxed text-emerald-700">
                Esta tela herda as regras eMAG e WCAG 2.1 AA. Suporta navegação integral via teclado e leitores de tela.
              </p>
            </div>
          </div>
        </aside>

        {/* Grid Central de Bens */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Bens encontrados: <strong className="text-primary font-mono text-sm">{filteredProducts.length}</strong>
              </span>
              {hasActiveFilters && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                  Filtros ativos
                </span>
              )}
            </div>

            {/* Alternador de Modo de Visualização (Lista vs Grade) - gov.br DS padrão */}
            <div className="flex items-center gap-1.5">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                circle
                size="small"
                onClick={() => handleSetViewMode('list')}
                title="Modo Lista (Padrão AliExpress)"
                aria-label="Alternar para Modo Lista"
                icon={<List className="h-4 w-4" aria-hidden="true" />}
              />
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                circle
                size="small"
                onClick={() => handleSetViewMode('grid')}
                title="Modo Grade (Cards Tradicionais)"
                aria-label="Alternar para Modo Grade"
                icon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center gap-3">
              <Search className="h-12 w-12 text-gray-300" />
              <p className="font-bold text-gray-700">Nenhum bem ocioso encontrado</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Tente ajustar os filtros ou reescrever o termo de busca para encontrar itens equivalentes em outros almoxarifados.
              </p>
              <Button variant="primary" onClick={clearFilters} className="mt-2">
                Limpar Todos os Filtros
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"} id="vitrine-products-grid">
              {filteredProducts.slice(0, displayLimit).map((produto) => {
                const badge = getEstadoInfo(produto.estadoConservacao);
                const isAlreadyInCart = cartProductIds.includes(produto.id);

                return (
                  <article
                    key={produto.id}
                    id={`product-card-${produto.id}`}
                    onClick={() => setDetailProduct(produto)}
                    className={`br-card hover bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 flex cursor-pointer group ${
                      viewMode === 'grid' ? 'flex-col justify-between' : 'flex-col md:flex-row justify-between'
                    }`}
                  >
                    {/* Foto sem cortes - lateral no modo lista, topo no modo grade/mobile */}
                    <div className={`relative bg-gray-100 overflow-hidden shrink-0 ${
                      viewMode === 'grid' 
                        ? 'h-48 w-full border-b border-gray-200' 
                        : 'h-44 md:h-auto md:w-64 border-b md:border-b-0 md:border-r border-gray-200'
                    }`}>
                      <img
                        src={produto.fotoUrl}
                        alt={produto.nome}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md tracking-wide ${badge.tone}`}>
                        {badge.label}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-bold font-mono px-2 py-1 rounded-md tracking-wider">
                        PAT: {produto.codigoPatrimonio}
                      </span>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 md:p-5 flex flex-col flex-grow justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                          <span>CATMAT: {produto.codigoCatmat}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getCategoriaTone(produto.categoria)}`}>
                            {produto.categoria}
                          </span>
                        </div>
                        
                        {/* Detalhes linkable (Ctrl+Click support) */}
                        <a
                          href={`#detalhes-${produto.id}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey) {
                              e.preventDefault();
                              setDetailProduct(produto);
                            }
                          }}
                          className="font-display font-bold text-primary hover:text-emerald-600 hover:underline leading-snug line-clamp-2 text-base md:text-lg mt-1 block"
                        >
                          {produto.nome}
                        </a>
                        
                        <p className="text-xs md:text-sm text-gray-600 flex items-start gap-1 mt-1">
                          <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">Cedente: <strong>{produto.secretariaOrigem}</strong></span>
                        </p>
                      </div>

                      {viewMode === 'grid' ? (
                        /* Layout Otimizado para Modo Grade (Previne texto cortado) */
                        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 mt-1">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block">Disponível</span>
                              <span className="text-base font-bold text-primary">{produto.quantidade} <span className="text-xs text-gray-500 font-normal">un.</span></span>
                              {produto.detalhamentoEstado && (
                                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold block mt-0.5 max-w-[140px] truncate" title={produto.detalhamentoEstado}>
                                  {produto.detalhamentoEstado}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 uppercase font-bold block">Economia Estimada</span>
                              <span className="text-sm font-bold text-emerald-600 font-mono">R$ {produto.valorEstimadoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Button
                              variant="tertiary"
                              size="small"
                              onClick={() => setDetailProduct(produto)}
                              icon={<Eye className="h-3.5 w-3.5 mr-1" aria-hidden="true" />}
                              className="w-full justify-center"
                            >
                              Detalhes
                            </Button>

                            <Button
                              variant={isAlreadyInCart ? 'secondary' : 'primary'}
                              size="small"
                              onClick={(e) => handleAddToCart(e, produto)}
                              disabled={isAlreadyInCart}
                              icon={
                                isAlreadyInCart
                                  ? <Check className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                                  : <ShoppingCart className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                              }
                              className="w-full justify-center"
                            >
                              {isAlreadyInCart ? 'Reservado' : 'Reservar'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Layout Expandido para Modo Lista */
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 mt-2 gap-4">
                          <div className="flex gap-6">
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block">Disponível</span>
                              <span className="text-xl font-bold text-primary">{produto.quantidade} <span className="text-sm text-gray-500 font-normal">un.</span></span>
                              {produto.detalhamentoEstado && (
                                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold block mt-0.5">
                                  {produto.detalhamentoEstado}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <span className="text-[10px] text-gray-400 uppercase font-bold block">Economia Estimada</span>
                              <span className="text-base font-bold text-emerald-600 font-mono">R$ {produto.valorEstimadoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="tertiary"
                              size="small"
                              onClick={() => setDetailProduct(produto)}
                              icon={<Eye className="h-4 w-4 mr-1" aria-hidden="true" />}
                            >
                              Ver Detalhes
                            </Button>

                            <Button
                              variant={isAlreadyInCart ? 'secondary' : 'primary'}
                              size="small"
                              onClick={(e) => handleAddToCart(e, produto)}
                              disabled={isAlreadyInCart}
                              icon={
                                isAlreadyInCart
                                  ? <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                                  : <ShoppingCart className="h-4 w-4 mr-1" aria-hidden="true" />
                              }
                            >
                              {isAlreadyInCart ? 'Adicionado' : 'Reservar Item'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Botão Carregar Mais para mitigar CLS e Paginação */}
          {filteredProducts.length > displayLimit && (
            <div className="flex justify-center py-4">
              <Button variant="secondary" onClick={() => setDisplayLimit((prev) => prev + 6)}>
                Carregar Mais Itens Ociosos
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* MODAL de Detalhes Completo */}
      <Modal
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        title={detailProduct?.nome ?? ''}
        footer={
          detailProduct && (
            <div className='flex gap-1 justify-end w-full'>
              <Button variant="secondary" onClick={() => setDetailProduct(null)}>
                Voltar ao Catálogo
              </Button>
            </div>
          )
        }
      >
        {detailProduct && (
          <div className="flex flex-col gap-5 pt-3 overflow-x-hidden">
            <div className="relative h-64 -m-6 mb-0 bg-gray-100 ">
              <img
                src={detailProduct.fotoUrl}
                alt={detailProduct.nome}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 left-6 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoInfo(detailProduct.estadoConservacao).tone}`}>
                {getEstadoInfo(detailProduct.estadoConservacao).label}
              </span>
            </div>

            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoriaTone(detailProduct.categoria)}`}>
                {detailProduct.categoria}
              </span>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600 bg-gray-200 border border-gray-150 p-2.5 rounded-lg font-mono">
                <div className="flex items-center gap-1.5">
                  <ClipboardCopy className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                  <span>Nº Patrimônio: <strong>{detailProduct.codigoPatrimonio}</strong></span>
                </div>
                <div className="h-3 w-[1px] bg-gray-300" />
                <div>
                  <span>CATMAT: <strong>{detailProduct.codigoCatmat}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Descrição do Item</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3.5 rounded-lg border border-gray-100">
                {detailProduct.descricaoCompleta || "Sem descrição adicional disponível para este item ocioso."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="border border-gray-150 rounded-lg p-3 bg-gray-200 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Impacto do Reuso (Referência)</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                  Economia B2B: R$ {detailProduct.valorEstimadoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                  Carbono Evitado: {detailProduct.co2eEvitadoKg} kg CO₂e
                </span>
              </div>
            </div>

            <MatrixReservation
              catmat={detailProduct.codigoCatmat}
              currentProducts={currentProductsList}
              onReserve={(produto, quantidade) => handleAddToCart({ stopPropagation: () => {} } as React.MouseEvent, produto, quantidade)}
              cartProductIds={cartProductIds}
            />
          </div>
        )}
      </Modal>

    </div>
  );
}
