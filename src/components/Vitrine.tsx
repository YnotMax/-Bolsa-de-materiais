/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingCart, RefreshCw, Layers, Check, ChevronRight, Eye, Building2, Info, ClipboardCopy, Leaf, Coins } from 'lucide-react';
import { Produto } from '../types';
import { MOCK_PRODUTOS, MOCK_CATEGORIAS, MOCK_SECRETARIAS, fuzzySearch, getEstadoInfo } from '../data';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

interface VitrineProps {
  onAddToCart: (produto: Produto) => void;
  cartProductIds: string[];
}

export default function Vitrine({ onAddToCart, cartProductIds }: VitrineProps) {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSecretaria, setSelectedSecretaria] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  
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

  // Filter products incrementally in real-time
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUTOS.filter((item) => {
      const matchSearch = fuzzySearch(searchTerm, item.nome) || 
                          fuzzySearch(searchTerm, item.categoria) ||
                          fuzzySearch(searchTerm, item.codigoCatmat) ||
                          fuzzySearch(searchTerm, item.codigoPatrimonio);
      
      const matchCategory = selectedCategory ? item.categoria === selectedCategory : true;
      const matchSecretaria = selectedSecretaria ? item.secretariaOrigem === selectedSecretaria : true;
      const matchEstado = selectedEstado ? item.estadoConservacao === selectedEstado : true;

      return matchSearch && matchCategory && matchSecretaria && matchEstado;
    });
  }, [searchTerm, selectedCategory, selectedSecretaria, selectedEstado]);

  // Handle adding product to cart
  const handleAddToCart = (e: React.MouseEvent, produto: Produto) => {
    e.stopPropagation();
    onAddToCart(produto);
    showToast(`"${produto.nome}" adicionado ao carrinho de remanejamento!`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSecretaria('');
    setSelectedEstado('');
    setDisplayLimit(6);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedSecretaria || selectedEstado;

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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-primary tracking-tight">
            Catálogo de Bens Ociosos
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Evite novas compras públicas! Solicite o remanejamento direto de itens disponíveis, ociosos ou sem giro parados em outras secretarias de Florianópolis.
          </p>
        </div>
        <Button
          variant="tertiary"
          size="small"
          onClick={clearFilters}
          icon={<RefreshCw className="h-3 w-3" aria-hidden="true" />}
        >
          Resetar Busca
        </Button>
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

        {/* Categoria Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Atalhos Rápidos:</span>
          <Button
            variant={!selectedCategory ? 'primary' : 'tertiary'}
            size="small"
            onClick={() => setSelectedCategory('')}
          >
            Todos os Itens
          </Button>
          {sortedCategorias.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'tertiary'}
              size="small"
              onClick={() => {
                setSelectedCategory(selectedCategory === cat ? '' : cat);
                setDisplayLimit(6);
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Layout de Filtro Lateral + Grid Central */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar de Filtros Lateral */}
        <aside className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:sticky lg:top-24 flex flex-col gap-5">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setDisplayLimit(6);
              }}
              id="filter-category"
              className="w-full bg-background border border-gray-200 rounded-lg text-xs py-2 px-3 text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Todas as categorias</option>
              {sortedCategorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtro: Secretaria Cedente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Secretaria Cedente</label>
            <select
              value={selectedSecretaria}
              onChange={(e) => {
                setSelectedSecretaria(e.target.value);
                setDisplayLimit(6);
              }}
              id="filter-secretaria"
              className="w-full bg-background border border-gray-200 rounded-lg text-xs py-2 px-3 text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Todas as secretarias</option>
              {sortedSecretarias.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Filtro: Estado de Conservação */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Estado de Conservação</label>
            <select
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
                setDisplayLimit(6);
              }}
              id="filter-estado"
              className="w-full bg-background border border-gray-200 rounded-lg text-xs py-2 px-3 text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Todos os estados</option>
              <option value="NOVO">Novo (Sem uso)</option>
              <option value="BOM">Bom estado</option>
              <option value="REGULAR">Regular estado</option>
              <option value="PESSIMO">Péssimo estado</option>
              <option value="SUCATA">Sucata / Doação peças</option>
            </select>
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
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Bens encontrados: {filteredProducts.length}
            </span>
            {hasActiveFilters && (
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                Filtros ativos
              </span>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="vitrine-products-grid">
              {filteredProducts.slice(0, displayLimit).map((produto) => {
                const badge = getEstadoInfo(produto.estadoConservacao);
                const isAlreadyInCart = cartProductIds.includes(produto.id);

                return (
                  <article
                    key={produto.id}
                    id={`product-card-${produto.id}`}
                    className="br-card hover bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Foto sem cortes - horizontal */}
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
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
                    <div className="p-4 flex flex-col flex-grow justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                          <span>CATMAT: {produto.codigoCatmat}</span>
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">
                            {produto.categoria}
                          </span>
                        </div>
                        
                        {/* Detalhes linkable (Ctrl+Click support) */}
                        <a
                          href={`#detalhes-${produto.id}`}
                          onClick={(e) => {
                            // Let Ctrl+Click open in a simulated new screen, standard click opens detail
                            if (!e.ctrlKey && !e.metaKey) {
                              e.preventDefault();
                              setDetailProduct(produto);
                            }
                          }}
                          className="font-display font-bold text-primary hover:text-emerald-600 hover:underline leading-snug line-clamp-2 text-base mt-1 block"
                        >
                          {produto.nome}
                        </a>
                        
                        <p className="text-xs text-gray-600 flex items-start gap-1 mt-2">
                          <Building2 className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">Cedente: <strong>{produto.secretariaOrigem}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Disponível</span>
                          <span className="text-lg font-bold text-primary">{produto.quantidade} <span className="text-xs text-gray-500">un.</span></span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Economia Estimada</span>
                          <span className="text-sm font-bold text-emerald-600 font-mono">R$ {produto.valorEstimadoNovo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => setDetailProduct(produto)}
                          icon={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
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
                              ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              : <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                        >
                          {isAlreadyInCart ? 'Adicionado' : 'Reservar Item'}
                        </Button>
                      </div>
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
            <>
              <Button variant="secondary" onClick={() => setDetailProduct(null)}>
                Voltar ao Catálogo
              </Button>
              <Button
                variant="primary"
                onClick={(e) => {
                  handleAddToCart(e, detailProduct);
                  setDetailProduct(null);
                }}
                disabled={cartProductIds.includes(detailProduct.id)}
                icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
              >
                {cartProductIds.includes(detailProduct.id) ? 'Já no Carrinho' : 'Reservar Item'}
              </Button>
            </>
          )
        }
      >
        {detailProduct && (
          <div className="flex flex-col gap-5">
            <div className="relative h-64 -m-6 mb-0 bg-gray-100">
              <img
                src={detailProduct.fotoUrl}
                alt={detailProduct.nome}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEstadoInfo(detailProduct.estadoConservacao).tone}`}>
                {getEstadoInfo(detailProduct.estadoConservacao).label}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                {detailProduct.categoria}
              </span>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-150 p-2.5 rounded-lg font-mono">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-150 rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secretaria Cedente</span>
                <span className="text-xs font-bold text-primary">{detailProduct.secretariaOrigem}</span>
                <span className="text-[10px] text-gray-500">O estoque e a entrega serão coordenados com este órgão municipal.</span>
              </div>

              <div className="border border-gray-150 rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Impacto do Reuso</span>
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

            <div className="flex items-center pt-4 border-t border-gray-150 mt-2">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Físico Disponível</span>
                <span className="text-lg font-bold text-primary">{detailProduct.quantidade} unidades</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
