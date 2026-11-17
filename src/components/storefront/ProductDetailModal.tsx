import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductPackOption } from '../../types';
import { getCategoryDisplayName } from '../../data/businessSegments';
import { X, Snowflake, Flame, Minus, Plus, ShoppingBag, Boxes, Check, UtensilsCrossed } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product, 
    quantity: number, 
    chilled: boolean, 
    notes: string, 
    packUnits?: number, 
    packLabel?: string
  ) => void;
  themeColor?: string;
  isMenuOnly?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  themeColor = '#D97706',
  isMenuOnly = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [chilled, setChilled] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedPack, setSelectedPack] = useState<ProductPackOption | null>(null);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setChilled(product.isChilledAvailable);
      setNotes('');
      setSelectedPack(null); // Padrão unidade avulsa
    }
  }, [product, isOpen]);

  const { currentTenant, themeMode } = useStore();
  const isLight = themeMode === 'light';
  const isAdega = currentTenant?.businessSegment === 'adega';

  if (!isOpen || !product) return null;

  const unitPrice = product.promoPrice ?? product.price;
  const currentItemPrice = selectedPack ? selectedPack.price : unitPrice;
  const totalPrice = currentItemPrice * quantity;
  const enabledPacks = isAdega ? (product.packOptions || []).filter(p => p.enabled) : [];

  const handleAdd = () => {
    onAddToCart(
      product, 
      quantity, 
      chilled, 
      notes, 
      selectedPack?.unitsCount, 
      selectedPack?.label
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative w-full h-52 sm:h-60 bg-neutral-950 shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-700">
              <Flame className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {isAdega && product.alcoholContent && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-neutral-200 border border-white/10">
                Teor: {product.alcoholContent}
              </span>
            )}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-amber-300 border border-white/10">
              {selectedPack ? `${selectedPack.unitsCount}x ${product.volume}` : product.volume}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
              {getCategoryDisplayName(product.category, currentTenant?.businessSegment, currentTenant?.categories || currentTenant?.customCategories)}
            </span>
            <h2 className={`text-lg sm:text-xl font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-amber-500 tabular-nums">
                R$ {currentItemPrice.toFixed(2)}
              </span>
              {!selectedPack && product.promoPrice && (
                <span className={`text-xs line-through tabular-nums ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                  R$ {product.price.toFixed(2)}
                </span>
              )}
              {selectedPack && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">
                  {selectedPack.label}
                </span>
              )}
            </div>
          </div>

          {/* Ingredientes / Composição em Destaque */}
          {product.ingredients && (
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isLight ? 'bg-amber-50/70 border-amber-200/90 text-amber-950' : 'bg-neutral-850/80 border-amber-500/30 text-neutral-200'
            }`}>
              <span className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Ingredientes & Composição do Prato:</span>
              </span>
              <p className="text-xs leading-relaxed italic">
                {product.ingredients}
              </p>
            </div>
          )}

          {product.description && (
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
              {product.description}
            </p>
          )}

          {/* Opção de Venda em Fardo / Caixa Fechada */}
          {enabledPacks.length > 0 && (
            <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <Boxes className="w-4 h-4" />
                <span>Escolha o Tamanho da Compra (Avulso ou Fardo Fechado):</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Opção Unidade */}
                <button
                  type="button"
                  onClick={() => setSelectedPack(null)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                    selectedPack === null
                      ? isLight
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500/40 text-blue-950 font-bold'
                        : 'border-blue-500 bg-neutral-800 ring-1 ring-blue-500/40 text-white font-bold'
                      : isLight
                      ? 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400'
                      : 'border-neutral-800 bg-neutral-850/60 text-neutral-300 hover:border-neutral-700'
                  }`}
                  style={selectedPack === null ? { borderColor: themeColor } : {}}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPack === null ? 'border-transparent' : 'border-neutral-400'
                      }`}
                      style={selectedPack === null ? { backgroundColor: themeColor } : {}}
                    >
                      {selectedPack === null && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span>1x Unidade Avulsa ({product.volume})</span>
                  </div>
                  <span className="font-bold" style={{ color: themeColor }}>
                    R$ {unitPrice.toFixed(2)}
                  </span>
                </button>

                {/* Opções de Fardos / Caixas */}
                {enabledPacks.map((pack, pIdx) => {
                  const isPackSelected = selectedPack?.unitsCount === pack.unitsCount;
                  const unitDiff = (unitPrice * pack.unitsCount) - pack.price;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isPackSelected
                          ? isLight
                            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500/40 text-blue-950 font-bold'
                            : 'border-blue-500 bg-neutral-800 ring-1 ring-blue-500/40 text-white font-bold'
                          : isLight
                          ? 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400'
                          : 'border-neutral-800 bg-neutral-850/60 text-neutral-300 hover:border-neutral-700'
                      }`}
                      style={isPackSelected ? { borderColor: themeColor } : {}}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isPackSelected ? 'border-transparent' : 'border-neutral-400'
                          }`}
                          style={isPackSelected ? { backgroundColor: themeColor } : {}}
                        >
                          {isPackSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <span>{pack.label}</span>
                          {unitDiff > 0 && (
                            <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                              Economize R$ {unitDiff.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold" style={{ color: themeColor }}>
                        R$ {pack.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Temperature Preference if beverage in Adega */}
          {isAdega && product.isChilledAvailable && (
            <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <label className={`block text-xs font-bold mb-2 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                Como você prefere receber?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setChilled(true)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all cursor-pointer ${
                    chilled
                      ? isLight
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500/40 font-bold'
                        : 'border-sky-500 bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/40'
                      : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'border-neutral-800 bg-neutral-850 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Snowflake className="w-4 h-4" />
                  <span>Super Gelada</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChilled(false)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all cursor-pointer ${
                    !chilled
                      ? isLight
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500/40 font-bold'
                        : 'border-amber-500 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/40'
                      : isLight
                      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      : 'border-neutral-800 bg-neutral-850 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Temp. Ambiente</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes (oculto se for somente cardápio consultivo) */}
          {!isMenuOnly && (
            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                Observações do Item (Opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Trazer guardanapos, gelo extra..."
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500'
                }`}
              />
            </div>
          )}
        </div>

        {/* Footer / CTA Bar */}
        <div className={`p-4 border-t flex items-center justify-between gap-4 shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          {isMenuOnly ? (
            <div className="w-full flex items-center justify-between gap-3">
              <div>
                <span className={`text-[11px] block font-medium ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Valor no Cardápio:
                </span>
                <span className="text-lg font-black tabular-nums" style={{ color: themeColor }}>
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: themeColor }}
              >
                Fechar Detalhes
              </button>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className={`flex items-center gap-2 p-1 rounded-xl border ${
                isLight ? 'bg-white border-slate-300' : 'bg-neutral-800 border-neutral-700'
              }`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className={`w-7 text-center font-bold text-sm tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add CTA */}
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: themeColor, color: '#ffffff' }}
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="text-white font-bold">Adicionar R$ {totalPrice.toFixed(2)}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
