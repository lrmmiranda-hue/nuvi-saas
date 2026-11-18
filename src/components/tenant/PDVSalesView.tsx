import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, OrderItem, PaymentMethod, Order, ProductPackOption } from '../../types';
import { getTenantActiveCategories } from '../../data/businessSegments';
import { 
  Barcode, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Search, 
  DollarSign, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Printer, 
  RotateCcw, 
  AlertCircle,
  Snowflake,
  Flame,
  Check,
  User,
  X,
  Boxes,
  Layers,
  Sparkles,
  Dog,
  Pizza,
  UtensilsCrossed,
  Fish,
  Settings
} from 'lucide-react';

export const PDVSalesView: React.FC = () => {
  const { 
    currentTenant, 
    tenantProducts, 
    findProductByBarcode, 
    findProductOrPackByBarcode,
    registerPDVSale,
    showAlert,
    themeMode,
  } = useStore();

  const isLight = themeMode === 'light';
  const brandAccent = currentTenant?.branding?.accentColor || '#F59E0B';

  const isLightColor = (hex: string): boolean => {
    if (!hex || !hex.startsWith('#')) return false;
    const c = hex.substring(1);
    const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    if (isNaN(rgb)) return false;
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 165;
  };

  // Barcode input state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeScanFeedback, setBarcodeScanFeedback] = useState<{ message: string; isError?: boolean } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Cart for PDV sale
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [cashAmountGiven, setCashAmountGiven] = useState<string>('');
  
  // Completed sale receipt modal
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Product catalog browsing state
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Segmento do comércio ativo (Fardos de bebidas SOMENTE em adega)
  const isAdega = currentTenant?.businessSegment === 'adega';
  const isFoodOrPizza = currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa';
  const isBarcodeScannerEnabled = currentTenant?.config?.enableBarcodeScanner ?? (isAdega || currentTenant?.businessSegment === 'mercadinho_emporio');

  // Modal de Seleção Rápida de Fardos no Balcão
  const [selectedProductForPackModal, setSelectedProductForPackModal] = useState<Product | null>(null);

  // Retorna os fardos cadastrados ou fornece os padrões do mercado (Fardo 12, Fardo 18, Caixa 24, Pack 6) EXCLUSIVO para Adegas
  const getEffectiveProductPacks = (prod: Product): ProductPackOption[] => {
    if (!isAdega) return []; // Fardo de bebidas somente em adega!
    const custom = (prod.packOptions || []).filter(p => p.enabled);
    if (custom.length > 0) return custom;

    const isPackApplicable = prod.category === 'cervejas' || prod.category === 'sem_alcool' || prod.category === 'combos';
    if (!isPackApplicable) return [];

    const basePrice = prod.promoPrice ?? prod.price;
    const barcodeBase = prod.barcode || `789${prod.id.replace(/\D/g, '') || '1000'}`;

    return [
      {
        id: 'pack_12',
        type: 'fardo',
        unitsCount: 12,
        label: 'Fardo c/ 12 un',
        price: Number((basePrice * 12 * 0.94).toFixed(2)),
        barcode: `${barcodeBase}-12`,
        enabled: true,
      },
      {
        id: 'pack_18',
        type: 'fardo',
        unitsCount: 18,
        label: 'Fardo c/ 18 un',
        price: Number((basePrice * 18 * 0.92).toFixed(2)),
        barcode: `${barcodeBase}-18`,
        enabled: true,
      },
      {
        id: 'pack_24',
        type: 'caixa',
        unitsCount: 24,
        label: 'Caixa c/ 24 un',
        price: Number((basePrice * 24 * 0.90).toFixed(2)),
        barcode: `${barcodeBase}-24`,
        enabled: true,
      },
      {
        id: 'pack_6',
        type: 'fardo',
        unitsCount: 6,
        label: 'Pack c/ 6 un',
        price: Number((basePrice * 6 * 0.96).toFixed(2)),
        barcode: `${barcodeBase}-6`,
        enabled: true,
      },
    ];
  };

  // Audio beep emulation via Web Audio API
  const playBeep = (success = true) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (success) {
        osc.frequency.value = 880; // A5 pleasant chime
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else {
        osc.frequency.value = 320; // Lower error buzz
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Keep barcode input focused for rapid scanner gun use
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Handle barcode submission (scanner gun sends Enter key at end of scan)
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    // Tenta encontrar por código de unidade ou código próprio do fardo
    const match = findProductOrPackByBarcode ? findProductOrPackByBarcode(code) : undefined;

    if (match) {
      if (match.pack) {
        addPackToCart(match.product, match.pack);
        playBeep(true);
        setBarcodeScanFeedback({ message: `✓ ${match.pack.label} de ${match.product.name} bipado!` });
      } else {
        addItemToCart(match.product);
        playBeep(true);
        setBarcodeScanFeedback({ message: `✓ ${match.product.name} bipado!` });
      }
      setBarcodeInput('');
    } else {
      const fallback = findProductByBarcode(code);
      if (fallback) {
        addItemToCart(fallback);
        playBeep(true);
        setBarcodeScanFeedback({ message: `✓ ${fallback.name} bipado!` });
        setBarcodeInput('');
      } else {
        playBeep(false);
        setBarcodeScanFeedback({ message: `Código ${code} não encontrado no catálogo`, isError: true });
      }
    }

    setTimeout(() => {
      setBarcodeScanFeedback(null);
    }, 3000);

    barcodeInputRef.current?.focus();
  };

  // Add individual unit to cart
  const addItemToCart = (product: Product, chilled = false) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && !item.packUnits && item.chilled === chilled);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          price: product.promoPrice ?? product.price,
          quantity: 1,
          chilled: chilled || product.isChilledAvailable,
          volume: product.volume,
        }
      ];
    });
  };

  // Add wholesale pack (fardo 6, 12, 18 ou caixa 24) to cart
  const addPackToCart = (product: Product, pack: ProductPackOption) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => 
        item.productId === product.id && item.packUnits === pack.unitsCount
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: `${product.name} (${pack.label})`,
          barcode: pack.barcode || product.barcode,
          price: pack.price,
          quantity: 1,
          chilled: false,
          volume: `${pack.unitsCount}x ${product.volume}`,
          packUnits: pack.unitsCount,
          packLabel: pack.label,
        }
      ];
    });
    playBeep(true);
    setBarcodeScanFeedback({ message: `✓ ${pack.label} adicionado ao caixa!` });
    setTimeout(() => setBarcodeScanFeedback(null), 2500);
  };

  // Adjust item quantity
  const updateQuantity = (index: number, delta: number) => {
    setCartItems(prev => {
      const next = [...prev];
      const target = next[index];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      next[index] = { ...target, quantity: newQty };
      return next;
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setCashAmountGiven('');
    barcodeInputRef.current?.focus();
  };

  // Totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  // Change calculation for cash payment
  const cashNum = parseFloat(cashAmountGiven.replace(',', '.')) || 0;
  const changeDue = paymentMethod === 'dinheiro' && cashNum > total ? cashNum - total : 0;

  // Finalize PDV sale
  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      showAlert({
        title: 'Nenhum Item no Caixa',
        message: 'Adicione pelo menos um item à venda antes de finalizar.',
        variant: 'warning',
      });
      return;
    }

    if (paymentMethod === 'dinheiro' && cashNum > 0 && cashNum < total) {
      showAlert({
        title: 'Valor Insuficiente',
        message: `O valor entregue em dinheiro (R$ ${cashNum.toFixed(2)}) é menor que o total da venda (R$ ${total.toFixed(2)}).`,
        variant: 'warning',
      });
      return;
    }

    const order = registerPDVSale(
      cartItems,
      paymentMethod,
      customerName.trim() || 'Cliente Balcão',
      paymentMethod === 'dinheiro' && cashNum >= total ? cashNum : undefined
    );

    playBeep(true);
    setCompletedOrder(order);
    setCartItems([]);
    setCustomerName('');
    setCashAmountGiven('');
  };

  // Categorias ativas presentes nos produtos do comércio
  const activeCategories = useMemo(() => {
    return getTenantActiveCategories(tenantProducts, currentTenant?.businessSegment, currentTenant?.customCategories);
  }, [tenantProducts, currentTenant?.businessSegment, currentTenant?.customCategories]);

  // Simulador de leitor dinâmico baseado nos produtos reais do segmento da loja
  const testBarcodes = useMemo(() => {
    if (tenantProducts.length === 0) {
      return [
        { label: 'Item 1', barcode: '789100000001' },
        { label: 'Item 2', barcode: '789100000002' },
      ];
    }
    const sample = tenantProducts.slice(0, 5);
    const items: { label: string; barcode: string }[] = [];
    sample.forEach(p => {
      items.push({
        label: p.name.length > 20 ? p.name.slice(0, 18) + '...' : p.name,
        barcode: p.barcode || `789${p.id.replace(/\D/g, '') || '1000'}`,
      });
      if (isAdega && p.packOptions && p.packOptions.length > 0) {
        const pk = p.packOptions.find(o => o.enabled);
        if (pk && pk.barcode) {
          items.push({
            label: `📦 ${pk.label} ${p.name.split(' ')[0]}`,
            barcode: pk.barcode,
          });
        }
      }
    });
    return items.slice(0, 5);
  }, [tenantProducts, isAdega]);

  const handleSimulateScan = (code: string) => {
    setBarcodeInput(code);
    const match = findProductOrPackByBarcode ? findProductOrPackByBarcode(code) : undefined;
    if (match) {
      if (match.pack) {
        addPackToCart(match.product, match.pack);
      } else {
        addItemToCart(match.product);
      }
      playBeep(true);
      setBarcodeScanFeedback({ message: `✓ ${match.product.name} bipado!` });
      setBarcodeInput('');
    } else {
      const fallback = findProductByBarcode(code);
      if (fallback) {
        addItemToCart(fallback);
        playBeep(true);
        setBarcodeScanFeedback({ message: `✓ ${fallback.name} bipado!` });
        setBarcodeInput('');
      } else {
        playBeep(false);
        setBarcodeScanFeedback({ message: `Código ${code} não encontrado`, isError: true });
      }
    }
    setTimeout(() => setBarcodeScanFeedback(null), 3000);
  };

  // Filter products for catalog search
  const filteredProducts = tenantProducts.filter(p => {
    const matchesCat = categoryFilter === 'todas' || p.category === categoryFilter;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.barcode && p.barcode.includes(searchQuery));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header do PDV: Modo Bipar com Leitor USB vs Modo Cardápio / Catálogo Ágil */}
      <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-[#11161B] border-[#1C2631]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${brandAccent}15`,
                color: brandAccent,
                borderColor: `${brandAccent}40`,
              }}
            >
              {currentTenant?.businessSegment === 'petshop' ? (
                <Dog className="w-7 h-7" />
              ) : currentTenant?.businessSegment === 'comida_japonesa' ? (
                <Fish className="w-7 h-7" />
              ) : currentTenant?.businessSegment === 'pizzaria' ? (
                <Pizza className="w-7 h-7" />
              ) : isFoodOrPizza ? (
                <UtensilsCrossed className="w-7 h-7" />
              ) : isBarcodeScannerEnabled ? (
                <Barcode className="w-7 h-7" />
              ) : (
                <ShoppingCart className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Frente de Caixa / Vendas no Balcão (PDV)
                </h2>
                {isBarcodeScannerEnabled ? (
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    Pronto para Bipar
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isLight ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  }`}>
                    Modo Cardápio / Catálogo
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                {isBarcodeScannerEnabled
                  ? isAdega
                    ? 'Passe o leitor de código de barras nos produtos ou nos fardos. Baixa automática e imediata no estoque.'
                    : 'Passe o leitor de código de barras nos itens ou selecione no catálogo abaixo.'
                  : isFoodOrPizza
                  ? 'Clique nas pizzas, lanches ou bebidas do cardápio para adicionar ao pedido. (Para bipar latas com leitor USB, ative em Configurações).'
                  : 'Clique nos produtos do catálogo abaixo para adicionar à venda do balcão.'}
              </p>
            </div>
          </div>

          {/* Se o leitor estiver ativado, exibe o input para bipar */}
          {isBarcodeScannerEnabled ? (
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Barcode className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`} />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Bipe ou digite o código de barras (EAN)..."
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl font-mono text-sm transition-colors no-focus-outline outline-none focus:outline-none focus:ring-0 focus:ring-transparent focus:shadow-none ${
                    isLight
                      ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-400'
                      : 'bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-700'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: brandAccent,
                  color: isLightColor(brandAccent) ? '#09090b' : '#ffffff',
                }}
              >
                Bipar
              </button>
            </form>
          ) : (
            <div className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}>
              <Settings className="w-4 h-4 shrink-0" style={{ color: brandAccent }} />
              <span>Leitor de código de barras desativado nas Configurações</span>
            </div>
          )}

        </div>

        {/* Scan Feedback Alert */}
        {barcodeScanFeedback && isBarcodeScannerEnabled && (
          <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 font-semibold ${
            barcodeScanFeedback.isError 
              ? isLight ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
              : isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {barcodeScanFeedback.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{barcodeScanFeedback.message}</span>
          </div>
        )}

        {/* Barcode Test Simulator Bar (somente se leitor ativo) */}
        {isBarcodeScannerEnabled && (
          <div className={`mt-3 pt-3 border-t flex items-center gap-2 flex-wrap text-xs ${
            isLight ? 'border-neutral-200' : 'border-neutral-800/80'
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isLight ? 'text-neutral-700' : 'text-neutral-400'
            }`}>
              Simulador de Leitor (1-Clique):
            </span>
            {testBarcodes.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateScan(item.barcode)}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors text-[11px] font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border-neutral-700'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" style={{ color: brandAccent }} />
                <span>{item.label}</span>
                <span className={`font-mono text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>({item.barcode.slice(-4)})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main PDV Layout: Left = Catalog / Quick-Click, Right = Active Sale Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Product Catalog for Manual Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border ${
            isLight
              ? 'bg-white border-slate-200 shadow-2xs'
              : 'bg-[#11161B] border-[#1C2631]'
          }`}>
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setCategoryFilter('todas')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all cursor-pointer ${
                  categoryFilter === 'todas'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold shadow-xs'
                    : isLight
                    ? 'bg-slate-100 hover:bg-sky-50 text-slate-700 border border-slate-200/80'
                    : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                }`}
              >
                Todas ({tenantProducts.length})
              </button>
              {activeCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-slate-100 hover:bg-sky-50 text-slate-700 border border-slate-200/80'
                      : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nome ou código..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-neutral-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-400'
                    : 'bg-neutral-950 border border-neutral-800 text-white focus:border-neutral-700'
                }`}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const price = product.promoPrice ?? product.price;
              const isBeverage = product.category === 'bebidas' || product.category === 'bebidas_lanche' || product.category === 'refrigerantes' || product.category === 'sucos' || product.category === 'cervejas';
              const isCardapio = (isFoodOrPizza && !isBeverage) || product.itemType === 'cardapio';
              const isLowStock = !isCardapio && product.stockQuantity <= (product.minStockAlert || 5);
              const isOutOfStock = !isCardapio && product.stockQuantity <= 0;
              const enabledPacks = isCardapio ? [] : getEffectiveProductPacks(product);

              return (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all relative ${
                    isLight
                      ? 'bg-white border-slate-300 hover:border-slate-400 shadow-2xs'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  } ${isOutOfStock ? 'opacity-60' : ''}`}
                >
                  <div>
                    {/* Header: Identificação do Item & Estoque (Sem exibição de código de barras numérico no card) */}
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className={`truncate font-semibold text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                        {product.volume || (isCardapio ? '🍽️ Item do Cardápio' : 'Unidade')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        isCardapio
                          ? isLight ? 'text-emerald-800 bg-emerald-100' : 'text-emerald-400 bg-emerald-500/20'
                          : isOutOfStock 
                          ? isLight ? 'text-red-700 bg-red-100' : 'text-red-400 bg-red-500/20' 
                          : isLowStock 
                          ? isLight ? 'text-amber-800 bg-amber-100' : 'text-amber-400 bg-amber-500/20' 
                          : isLight ? 'text-slate-800 bg-slate-100 font-semibold' : 'text-neutral-300 bg-neutral-800'
                      }`}>
                        {isCardapio ? '🍽️ Feito na Hora' : `${product.stockQuantity} un`} {(() => {
                          if (!isAdega || isCardapio) return '';
                          const pSize = enabledPacks.length > 0 ? enabledPacks[0].unitsCount : (product.category === 'cervejas' ? 12 : product.category === 'vinhos' ? 6 : null);
                          if (!pSize || product.stockQuantity < pSize) return '';
                          return `(${Math.floor(product.stockQuantity / pSize)} fardos)`;
                        })()}
                      </span>
                    </div>

                    {/* Name */}
                    <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {product.name}
                    </h4>

                    {/* Descrição sutil */}
                    {product.description && (
                      <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-neutral-400'
                      }`}>
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className={`mt-3 pt-2.5 border-t ${
                    isLight ? 'border-slate-200' : 'border-neutral-800'
                  }`}>
                    
                    {/* Preço e Botões de Ação */}
                    <div className="flex items-end justify-between gap-2">
                      <div className="shrink-0">
                        <span 
                          className="text-sm font-extrabold tabular-nums block"
                          style={{ color: brandAccent }}
                        >
                          R$ {price.toFixed(2)}
                        </span>
                        {isAdega && (
                          <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            Unidade Avulsa
                          </span>
                        )}
                      </div>

                      {isAdega && !isCardapio ? (
                        <div className="flex flex-col gap-1.5 shrink-0 min-w-[76px]">
                          <button
                            type="button"
                            onClick={() => {
                              addItemToCart(product);
                              playBeep(true);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                            }`}
                            title={`Adicionar 1 unidade de ${product.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" style={{ color: brandAccent }} />
                            <span>1 un</span>
                          </button>

                          {enabledPacks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedProductForPackModal(product)}
                              title="Escolher entre fardos (6, 12, 18 ou 24 unidades)"
                              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                              }`}
                            >
                              <Boxes className="w-3.5 h-3.5" style={{ color: brandAccent }} />
                              <span>Fardos</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            addItemToCart(product);
                            playBeep(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                          }`}
                          title={`Adicionar ${product.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" style={{ color: brandAccent }} />
                          <span>+ 1 un</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: Active Sale Checkout / Cashier Box (5 cols) */}
        <div className={`lg:col-span-5 rounded-2xl border p-5 space-y-4 shadow-xl transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          
          <div className={`flex items-center justify-between border-b pb-3 ${
            isLight ? 'border-slate-200' : 'border-[#1C2631]'
          }`}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" style={{ color: brandAccent }} />
              <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Venda em Andamento
              </h3>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${brandAccent}15`,
                  color: isLight ? '#0f172a' : brandAccent,
                  borderColor: `${brandAccent}40`,
                }}
              >
                {cartItems.reduce((acc, i) => acc + (i.packUnits ? i.packUnits * i.quantity : i.quantity), 0)} itens baixados
              </span>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className={`text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-600 hover:text-rose-600' : 'text-neutral-400 hover:text-rose-400'
                }`}
                title="Limpar venda"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Customer Name (Optional) */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-950 border-neutral-800'
          }`}>
            <User className={`w-3.5 h-3.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`} />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do Cliente (opcional - Padrão: Balcão)"
              className={`w-full bg-transparent text-xs focus:outline-none ${
                isLight ? 'text-neutral-900 placeholder:text-neutral-500' : 'text-white placeholder:text-neutral-500'
              }`}
            />
          </div>

          {/* Cart Itemized List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-950 border-neutral-800/80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      {item.productName}
                    </span>
                    {item.packUnits ? (
                      <span 
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1"
                        style={{
                          backgroundColor: `${brandAccent}18`,
                          color: isLight ? '#0f172a' : brandAccent,
                          borderColor: `${brandAccent}40`,
                        }}
                      >
                        <Boxes className="w-2.5 h-2.5" style={{ color: brandAccent }} />
                        {item.packUnits * item.quantity} un baixadas
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        Unidade Avulsa
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    <span>{item.volume}</span>
                    <span>·</span>
                    <span className="font-mono font-bold" style={{ color: brandAccent }}>R$ {item.price.toFixed(2)} cada</span>
                  </div>
                </div>

                {/* Quantity steppers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(idx, -1)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                      isLight ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`w-6 text-center font-bold tabular-nums ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(idx, 1)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                      isLight ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0 w-16">
                  <span className="font-extrabold tabular-nums font-mono" style={{ color: brandAccent }}>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(idx)}
                  className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className={`p-8 text-center border border-dashed rounded-xl space-y-2 ${
                isLight ? 'border-neutral-300 bg-neutral-50/50' : 'border-neutral-800'
              }`}>
                <Barcode className={`w-8 h-8 mx-auto ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
                <p className={`text-xs font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Nenhum produto adicionado ao caixa ainda.<br />
                  {isAdega 
                    ? 'Bipe o código de barras da lata ou do fardo, ou selecione na vitrine ao lado.'
                    : 'Clique nos produtos do catálogo ao lado para iniciar a venda no balcão.'}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
              Forma de Pagamento no Balcão:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                { id: 'pix', label: 'PIX', icon: QrCode },
                { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
                { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
              ].map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 text-white border-neutral-700 font-bold shadow-xs'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Change Calculator (If Dinheiro) */}
          {paymentMethod === 'dinheiro' && (
            <div className={`p-3 rounded-xl border space-y-2 ${
              isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Valor Entregue pelo Cliente:
                </span>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">R$</span>
                  <input
                    type="text"
                    value={cashAmountGiven}
                    onChange={(e) => setCashAmountGiven(e.target.value)}
                    placeholder={total > 0 ? total.toFixed(2) : '0,00'}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className={`w-full pl-7 pr-2 py-1 rounded text-right text-xs font-mono font-bold no-focus-outline outline-none focus:outline-none focus:ring-0 ${
                      isLight
                        ? 'bg-white border border-neutral-300 text-neutral-900 focus:border-neutral-400'
                        : 'bg-neutral-900 border border-neutral-700 text-white focus:border-neutral-600'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className={`text-[10px] font-semibold ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>Rápido:</span>
                {[total, 10, 20, 50, 100].filter(val => val >= total || val === total).slice(0, 4).map((val, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCashAmountGiven(val.toFixed(2))}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    R$ {val.toFixed(2)}
                  </button>
                ))}
              </div>

              {changeDue > 0 && (
                <div className={`pt-2 border-t flex items-center justify-between text-xs font-semibold ${
                  isLight ? 'border-neutral-200 text-emerald-800' : 'border-neutral-800 text-emerald-400'
                }`}>
                  <span>Troco a Devolver:</span>
                  <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    R$ {changeDue.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* PIX Key Quick Copy (If PIX) */}
          {paymentMethod === 'pix' && currentTenant?.config?.pixKey && (
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isLight 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-emerald-950/20 border border-emerald-500/30'
            }`}>
              <span className={`text-[11px] block font-semibold ${isLight ? 'text-emerald-800' : 'text-neutral-400'}`}>
                Chave PIX do Estabelecimento:
              </span>
              <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 select-all">
                {currentTenant.config.pixKey}
              </p>
            </div>
          )}

          {/* Total & Finalize Button */}
          <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
            <div className="flex items-baseline justify-between">
              <span className={`text-xs uppercase tracking-wider font-bold ${isLight ? 'text-neutral-700' : 'text-neutral-400'}`}>
                Total da Venda:
              </span>
              <span 
                className="text-2xl font-extrabold font-mono tabular-nums"
                style={{ color: brandAccent }}
              >
                R$ {total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleFinalizeSale}
              disabled={cartItems.length === 0}
              className={`w-full py-3.5 rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                cartItems.length > 0
                  ? 'hover:brightness-110 active:scale-[0.99]'
                  : isLight ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
              style={cartItems.length > 0 ? {
                backgroundColor: brandAccent,
                color: isLightColor(brandAccent) ? '#09090b' : '#ffffff',
              } : {}}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Finalizar Venda (Baixar Estoque)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Sale Receipt Modal (Cupom de Venda Balcão) */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
          }`}>
            
            <div className="p-6 space-y-4">
              <div className={`text-center space-y-1 border-b border-dashed pb-4 ${isLight ? 'border-neutral-300' : 'border-neutral-700'}`}>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Venda Concluída com Sucesso!
                </h3>
                <p className={`text-xs font-mono font-semibold ${isLight ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  {currentTenant?.name} · Cupom #{completedOrder.id}
                </p>
                <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  {new Date(completedOrder.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(completedOrder.createdAt).toLocaleTimeString('pt-BR')}
                </p>
              </div>

              {/* Items in receipt */}
              <div className={`space-y-1.5 text-xs font-mono border-b border-dashed pb-4 ${isLight ? 'border-neutral-300' : 'border-neutral-700'}`}>
                {completedOrder.items.map((item, i) => (
                  <div key={i} className={`flex justify-between ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="tabular-nums font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals in receipt */}
              <div className="space-y-1 text-xs">
                <div className={`flex justify-between ${isLight ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  <span>Pagamento:</span>
                  <span className="capitalize font-semibold">{completedOrder.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className={`flex justify-between text-base font-bold pt-2 border-t ${
                  isLight ? 'border-neutral-300 text-neutral-900' : 'border-neutral-800 text-white'
                }`}>
                  <span>TOTAL:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-extrabold">
                    R$ {completedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stock Deducted Notice */}
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              }`}>
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Estoque deduzido e sincronizado no sistema da loja.</span>
              </div>

              {/* Receipt Modal Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isLight 
                      ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800' 
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Cupom</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="flex-1 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: brandAccent,
                    color: isLightColor(brandAccent) ? '#09090b' : '#ffffff',
                  }}
                >
                  Nova Venda
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modal Rápido de Seleção de Atacado / Fardos no Balcão */}
      {selectedProductForPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-neutral-900 border-neutral-700 text-white'
          }`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                  style={{ backgroundColor: `${brandAccent}20`, color: brandAccent }}
                >
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Venda no Balcão: {selectedProductForPackModal.name}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Estoque disponível: {selectedProductForPackModal.stockQuantity} unidades
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForPackModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
              {/* Opção 1: Unidade Avulsa */}
              <button
                type="button"
                onClick={() => {
                  addItemToCart(selectedProductForPackModal);
                  playBeep(true);
                  setSelectedProductForPackModal(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' 
                    : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold">
                    🍺
                  </span>
                  <div className="text-left">
                    <span className="font-bold text-xs block">1 Unidade Avulsa</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      Lata / Garrafa avulsa ({selectedProductForPackModal.volume})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold block font-mono" style={{ color: brandAccent }}>
                    R$ {(selectedProductForPackModal.promoPrice ?? selectedProductForPackModal.price).toFixed(2)}
                  </span>
                </div>
              </button>

              {/* Fardos Cadastrados (12, 18, 24, 6) */}
              <div className="pt-2">
                <span 
                  className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                  style={{ color: brandAccent }}
                >
                  Opções de Fardos & Caixas:
                </span>
                <div className="space-y-2">
                  {getEffectiveProductPacks(selectedProductForPackModal).map((pack, idx) => {
                    const hasStock = selectedProductForPackModal.stockQuantity >= pack.unitsCount;
                    const unitEquivalent = (pack.price / pack.unitsCount).toFixed(2);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!hasStock}
                        onClick={() => {
                          addPackToCart(selectedProductForPackModal, pack);
                          setSelectedProductForPackModal(null);
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                          hasStock
                            ? isLight
                              ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 cursor-pointer shadow-2xs'
                              : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 cursor-pointer'
                            : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-neutral-900 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: `${brandAccent}20`, color: brandAccent }}
                          >
                            📦
                          </span>
                          <div className="text-left">
                            <span className="font-bold text-xs block">{pack.label}</span>
                            <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                              Baixa de <strong>{pack.unitsCount} unidades</strong> no estoque
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold block font-mono" style={{ color: brandAccent }}>
                            R$ {pack.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            R$ {unitEquivalent} /un
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`p-3 border-t text-right ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
              <button
                type="button"
                onClick={() => setSelectedProductForPackModal(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
