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
  Settings,
  Maximize2,
  Minimize2,
  Clock,
  Wine,
  Tag,
  CheckCircle2,
  LayoutGrid,
  List,
  Pause,
  Play,
  Percent,
  MessageSquare,
  Share2,
  Send,
  Smartphone,
  Keyboard,
  History
} from 'lucide-react';
import { PDVPixModal } from './PDVPixModal';

export const PDVSalesView: React.FC = () => {
  const {
    currentTenant,
    tenantProducts,
    findProductByBarcode,
    findProductOrPackByBarcode,
    registerPDVSale,
    showAlert,
    themeMode,
    currentStoreUser,
    tenantUsers,
    setCurrentStoreUserId,
    updateTenant,
  } = useStore();

  const isLight = themeMode === 'light';

  // Operador de Caixa & Modal de Troca
  const [showSwitchOperatorModal, setShowSwitchOperatorModal] = useState(false);

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
  const [receiptWhatsappPhone, setReceiptWhatsappPhone] = useState('');

  // Desconto / Arredondamento na Venda
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountInputVal, setDiscountInputVal] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');

  // Vendas em Espera (Suspender / Retomar Venda no Caixa)
  interface SuspendedSale {
    id: string;
    timeStr: string;
    customerName: string;
    items: OrderItem[];
    discount: number;
    total: number;
  }

  const [suspendedSales, setSuspendedSales] = useState<SuspendedSale[]>(() => {
    try {
      const saved = sessionStorage.getItem('nuvi_suspended_sales');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  // Simulador de leitor (colapsável para manter a tela limpa)
  const [showSimulatorBar, setShowSimulatorBar] = useState(false);

  // Modo Tela Cheia Balcão / Tablet
  const [isFullscreenPDV, setIsFullscreenPDV] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreenPDV) {
      setIsFullscreenPDV(true);
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => { });
        }
      } catch { }
    } else {
      setIsFullscreenPDV(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }
      } catch { }
    }
  };

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
    setDiscountAmount(0);
    barcodeInputRef.current?.focus();
  };

  // Totals & Descontos
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const effectiveDiscount = Math.min(subtotal, Math.max(0, discountAmount || 0));
  const total = Math.max(0, subtotal - effectiveDiscount);

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

    // Se o pagamento for PIX, abre o QR Code com o valor exato na tela
    if (paymentMethod === 'pix') {
      setShowPixModal(true);
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

    executeConfirmSale();
  };

  const executeConfirmSale = () => {
    const order = registerPDVSale(
      cartItems,
      paymentMethod,
      customerName.trim() || 'Cliente Balcão',
      paymentMethod === 'dinheiro' && cashNum >= total ? cashNum : undefined,
      effectiveDiscount
    );

    playBeep(true);
    setCompletedOrder(order);
    setCartItems([]);
    setCustomerName('');
    setCashAmountGiven('');
    setDiscountAmount(0);
    setShowPixModal(false);
  };

  // Suspender Venda Atual (Pôr em Espera)
  const handleSuspendCurrentSale = () => {
    if (cartItems.length === 0) return;

    const newSuspended: SuspendedSale = {
      id: `susp_${Date.now()}`,
      timeStr: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName.trim() || `Cliente #${suspendedSales.length + 1}`,
      items: [...cartItems],
      discount: effectiveDiscount,
      total,
    };

    const updated = [newSuspended, ...suspendedSales];
    setSuspendedSales(updated);
    try {
      sessionStorage.setItem('nuvi_suspended_sales', JSON.stringify(updated));
    } catch {}

    playBeep(true);
    clearCart();
    showAlert({
      title: 'Venda Colocada em Espera ⏸️',
      message: `A venda de "${newSuspended.customerName}" (R$ ${newSuspended.total.toFixed(2)}) foi guardada. Você pode atender o próximo cliente agora!`,
      variant: 'info'
    });
  };

  // Retomar Venda em Espera
  const handleResumeSale = (sale: SuspendedSale) => {
    if (cartItems.length > 0) {
      showAlert({
        title: 'Caixa com Venda Ativa',
        message: 'Finalize, limpe ou suspenda a venda atual antes de retomar outra venda.',
        variant: 'warning'
      });
      return;
    }

    setCartItems(sale.items);
    setCustomerName(sale.customerName.startsWith('Cliente #') ? '' : sale.customerName);
    setDiscountAmount(sale.discount || 0);

    const updated = suspendedSales.filter(s => s.id !== sale.id);
    setSuspendedSales(updated);
    try {
      sessionStorage.setItem('nuvi_suspended_sales', JSON.stringify(updated));
    } catch {}

    setShowSuspendedModal(false);
    playBeep(true);
    showAlert({
      title: 'Venda Retomada! ▶️',
      message: `Os itens de "${sale.customerName}" foram carregados de volta no caixa.`,
      variant: 'success'
    });
  };

  // Descartar Venda Suspensa
  const handleDeleteSuspendedSale = (id: string) => {
    const updated = suspendedSales.filter(s => s.id !== id);
    setSuspendedSales(updated);
    try {
      sessionStorage.setItem('nuvi_suspended_sales', JSON.stringify(updated));
    } catch {}
  };

  // Enviar Cupom Formatado no WhatsApp
  const handleSendReceiptViaWhatsApp = (phoneInput: string) => {
    if (!completedOrder || !currentTenant) return;
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showAlert({
        title: 'WhatsApp Inválido',
        message: 'Informe o DDD + número do WhatsApp (ex: 11 99999-9999).',
        variant: 'warning'
      });
      return;
    }

    const itemsText = completedOrder.items
      .map(item => `▪️ ${item.quantity}x ${item.productName} — R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const paymentLabel = completedOrder.paymentMethod === 'pix' ? 'PIX' :
      completedOrder.paymentMethod === 'dinheiro' ? 'Dinheiro' :
      completedOrder.paymentMethod === 'cartao_debito' ? 'Cartão Débito' : 'Cartão Crédito';

    const orderDate = new Date(completedOrder.createdAt).toLocaleDateString('pt-BR');
    const orderTime = new Date(completedOrder.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const message = encodeURIComponent(
      `*🧾 COMPROVANTE DE VENDA • ${currentTenant.name.toUpperCase()}*\n` +
      `--------------------------------\n` +
      `📅 *Data:* ${orderDate} às ${orderTime}\n` +
      `🆔 *Cupom:* #${completedOrder.id}\n` +
      `👤 *Cliente:* ${completedOrder.customerName || 'Cliente Balcão'}\n` +
      `--------------------------------\n` +
      `*ITENS COMPRADOS:*\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `*Subtotal:* R$ ${completedOrder.subtotal.toFixed(2)}\n` +
      (completedOrder.discount ? `*Desconto:* - R$ ${completedOrder.discount.toFixed(2)}\n` : '') +
      `*TOTAL:* R$ ${completedOrder.total.toFixed(2)}\n` +
      `*Forma de Pagamento:* ${paymentLabel}\n` +
      (completedOrder.cashChangeFor && completedOrder.cashChangeFor > completedOrder.total
        ? `*Troco Devolvido:* R$ ${(completedOrder.cashChangeFor - completedOrder.total).toFixed(2)}\n`
        : '') +
      `--------------------------------\n` +
      `Muito obrigado pela preferência! Volte sempre! 👋🏪`
    );

    const waUrl = cleanPhone.startsWith('55')
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/55${cleanPhone}?text=${message}`;

    window.open(waUrl, '_blank');
  };

  // Listener Global de Teclas de Atalho do Caixa (F2, F4, F6, F8, F9, F10, F11, F12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se algum modal estiver aberto, não dispara os atalhos
      if (completedOrder || showPixModal || showSwitchOperatorModal || selectedProductForPackModal || showSuspendedModal || showDiscountModal) {
        if (e.key === 'Escape') {
          if (completedOrder) setCompletedOrder(null);
          if (showPixModal) setShowPixModal(false);
          if (showSwitchOperatorModal) setShowSwitchOperatorModal(false);
          if (selectedProductForPackModal) setSelectedProductForPackModal(null);
          if (showSuspendedModal) setShowSuspendedModal(false);
          if (showDiscountModal) setShowDiscountModal(false);
        }
        return;
      }

      // F2: Focar na busca / bipar
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
        return;
      }

      // F4: Limpar carrinho
      if (e.key === 'F4') {
        e.preventDefault();
        if (cartItems.length > 0) {
          clearCart();
        }
        return;
      }

      // F6: Suspender venda atual
      if (e.key === 'F6') {
        e.preventDefault();
        if (cartItems.length > 0) {
          handleSuspendCurrentSale();
        }
        return;
      }

      // F8: Dinheiro
      if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMethod('dinheiro');
        return;
      }

      // F9: PIX
      if (e.key === 'F9') {
        e.preventDefault();
        setPaymentMethod('pix');
        return;
      }

      // F10: Cartão Débito
      if (e.key === 'F10') {
        e.preventDefault();
        setPaymentMethod('cartao_debito');
        return;
      }

      // F11: Cartão Crédito
      if (e.key === 'F11') {
        e.preventDefault();
        setPaymentMethod('cartao_credito');
        return;
      }

      // F12: Finalizar venda
      if (e.key === 'F12') {
        e.preventDefault();
        handleFinalizeSale();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, paymentMethod, completedOrder, showPixModal, showSwitchOperatorModal, selectedProductForPackModal, showSuspendedModal, showDiscountModal]);

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
    <div className={isFullscreenPDV ? (isLight ? 'fixed inset-0 z-50 bg-[#F1F5F9] text-slate-900 p-3 flex flex-col gap-3 overflow-hidden select-none' : 'fixed inset-0 z-50 bg-[#0A0E13] text-white p-3 flex flex-col gap-3 overflow-hidden select-none') : 'space-y-4'}>

      {/* Top Header do PDV: Modo Bipar com Leitor USB vs Modo Cardápio / Catálogo Ágil & Botão Tela Cheia */}
      <div className={`p-3.5 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-[#0D141C] border-[#1A2533] text-white shadow-sm'
        }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${isLight ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}
            >
              {currentTenant?.businessSegment === 'petshop' ? (
                <Dog className="w-6 h-6" />
              ) : currentTenant?.businessSegment === 'comida_japonesa' ? (
                <Fish className="w-6 h-6" />
              ) : currentTenant?.businessSegment === 'pizzaria' ? (
                <Pizza className="w-6 h-6" />
              ) : isFoodOrPizza ? (
                <UtensilsCrossed className="w-6 h-6" />
              ) : isBarcodeScannerEnabled ? (
                <Barcode className="w-6 h-6" />
              ) : (
                <ShoppingCart className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentTenant?.name ? `${currentTenant.name} · Balcão` : 'Frente de Caixa (PDV)'}
                </h2>
                {isFullscreenPDV && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {currentTime}
                  </span>
                )}
                {isBarcodeScannerEnabled ? (
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                    Leitor Pronto
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    }`}>
                    Modo Balcão / Tablet
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isBarcodeScannerEnabled
                  ? 'Bipe com o leitor USB ou selecione as categorias e produtos acima para vender.'
                  : 'Selecione as categorias no topo e clique nos produtos para vender no balcão.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Se o leitor estiver ativado, exibe o input para bipar */}
            {isBarcodeScannerEnabled && (
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 flex-1 sm:w-64">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Bipar código de barras..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl font-mono text-xs outline-none transition-colors ${isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400'
                        : 'bg-[#070B0E] border border-[#1E2B3A] text-white placeholder:text-slate-500'
                      }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white transition-all cursor-pointer shadow-md shadow-sky-600/25 border border-sky-400/30 active:scale-95"
                >
                  Bipar
                </button>
              </form>
            )}

            {/* Indicador do Operador Ativo no Caixa */}
            <button
              type="button"
              onClick={() => setShowSwitchOperatorModal(true)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 ${isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
                  : 'bg-[#0C2340]/70 border-sky-500/30 text-white hover:bg-[#0E2A4D]'
                }`}
              title="Clique para alternar o operador do caixa"
            >
              <User className="w-3.5 h-3.5 text-sky-500" />
              <span>Caixa: <strong className={isLight ? 'text-sky-800' : 'text-sky-200'}>{currentStoreUser?.name || 'Administrador'}</strong></span>
              <span className="text-[10px] text-sky-500 underline font-normal ml-0.5">Trocar</span>
            </button>

            {/* Botão Modo Balcão Tela Cheia (Tablet / PC) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] shadow-lg ${isFullscreenPDV
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/25 border border-amber-300'
                  : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-600/25 border border-sky-400/30'
                }`}
              title={isFullscreenPDV ? 'Sair do Modo Tela Cheia' : 'Abrir PDV em Tela Cheia para Tablet ou Computador'}
            >
              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0">
                {isFullscreenPDV ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </div>
              <span className="font-bold tracking-tight">{isFullscreenPDV ? 'Sair da Tela Cheia' : 'Modo Balcão Tela Cheia (Tablet)'}</span>
            </button>
          </div>

        </div>

        {/* Scan Feedback Alert */}
        {barcodeScanFeedback && isBarcodeScannerEnabled && (
          <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 font-semibold ${barcodeScanFeedback.isError
              ? isLight ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
            {barcodeScanFeedback.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{barcodeScanFeedback.message}</span>
          </div>
        )}

        {/* Barra de Ações Rápidas: Vendas em Espera & Simulador de Leitor Opcional */}
        <div className={`mt-2.5 pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap text-xs ${
          isLight ? 'border-slate-200' : 'border-[#1A2533]'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão de Vendas em Espera se houver */}
            {suspendedSales.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSuspendedModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 hover:bg-amber-500/25 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                title="Clique ou pressione F6 para ver e retomar vendas guardadas"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{suspendedSales.length} {suspendedSales.length === 1 ? 'Venda em Espera' : 'Vendas em Espera'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20">F6</span>
              </button>
            )}

            {isBarcodeScannerEnabled && (
              <button
                type="button"
                onClick={() => setShowSimulatorBar(!showSimulatorBar)}
                className="text-[11px] font-bold text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🧪 {showSimulatorBar ? 'Ocultar Simulador' : 'Testar Bipagem (Simulador)'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="hidden sm:inline">Teclas rápidas ativas:</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">F2 Bipar</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">F8 Dinheiro</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">F9 PIX</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-500 font-bold">F12 Finalizar</span>
          </div>
        </div>

        {/* Simulador de Leitor Expansível */}
        {showSimulatorBar && isBarcodeScannerEnabled && (
          <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 flex-wrap text-xs animate-slide-down ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070B0E] border-[#1E2B3A]'
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Simular Leitor (1-Clique):
            </span>
            {testBarcodes.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateScan(item.barcode)}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors text-[11px] font-semibold cursor-pointer ${
                  isLight
                    ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
                    : 'border-[#1A2533] bg-[#121B26] hover:bg-[#182332] text-slate-200 hover:text-white'
                }`}
              >
                <Barcode className="w-3.5 h-3.5 text-sky-500" />
                <span>{item.label}</span>
                <span className={`font-mono text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>({item.barcode.slice(-4)})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main PDV Layout com 2 Colunas: Esquerda (Categorias Superiores + Busca + Grade Ampla), Direita (Comanda) */}
      <div className={`flex flex-col lg:flex-row gap-4 items-stretch ${isFullscreenPDV ? 'flex-1 min-h-0 overflow-hidden' : ''
        }`}>

        {/* COLUNA ESQUERDA / PRINCIPAL: CATEGORIAS SUPERIORES + BUSCA + GRID DE PRODUTOS */}
        <div className={`flex-1 min-w-0 flex flex-col gap-3 ${isFullscreenPDV ? 'overflow-hidden max-h-full' : ''
          }`}>

          {/* BARRA SUPERIOR DE CATEGORIAS (HORIZONTAL COM SCROLL SUAVE) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 select-none scrollbar-none">
            {/* Botão "Todas" */}
            <button
              type="button"
              onClick={() => setCategoryFilter('todas')}
              className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95 font-bold ${categoryFilter === 'todas'
                  ? isLight
                    ? 'bg-sky-500/15 text-sky-800 border-0 shadow-none'
                    : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white border-0 shadow-md shadow-[#0C2340]/40'
                  : isLight
                    ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70 border-0 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#161D24] border-0 font-semibold'
                }`}
            >
              <div className="flex items-center gap-1.5">
                <Boxes className={`w-4 h-4 ${categoryFilter === 'todas' ? (isLight ? 'text-sky-700' : 'text-white') : 'text-sky-500'}`} />
                <span>Todas as Categorias</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${categoryFilter === 'todas'
                  ? isLight ? 'bg-sky-200/70 text-sky-900' : 'bg-black/25 text-white'
                  : isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-400'
                }`}>
                {tenantProducts.length}
              </span>
            </button>

            {/* Categorias Individuais */}
            {activeCategories.map((cat) => {
              const isSelected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95 font-bold ${isSelected
                      ? isLight
                        ? 'bg-sky-500/15 text-sky-800 border-0 shadow-none'
                        : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white border-0 shadow-md shadow-[#0C2340]/40'
                      : isLight
                        ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70 border-0 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-[#161D24] border-0 font-semibold'
                    }`}
                >
                  <span className="text-sm">
                    {cat.id.includes('cerveja') ? '🍺' :
                      cat.id.includes('vinho') ? '🍷' :
                        cat.id.includes('pizza') ? '🍕' :
                          cat.id.includes('lanche') || cat.id.includes('hamb') ? '🍔' :
                            cat.id.includes('sushi') || cat.id.includes('japa') ? '🍣' :
                              cat.id.includes('bebida') || cat.id.includes('refri') ? '🥤' :
                                cat.id.includes('porcao') || cat.id.includes('petisco') ? '🍟' :
                                  cat.id.includes('destil') || cat.id.includes('whisky') ? '🥃' :
                                    cat.id.includes('sobremesa') || cat.id.includes('doce') || cat.id.includes('bolo') ? '🍰' :
                                      cat.id.includes('roupa') || cat.id.includes('moda') ? '👗' :
                                        cat.id.includes('sorvete') || cat.id.includes('acai') ? '🍧' :
                                          cat.id.includes('pao') || cat.id.includes('padaria') ? '🥖' :
                                            cat.id.includes('salgado') || cat.id.includes('coxinha') ? '🥟' :
                                              cat.id.includes('carne') || cat.id.includes('acougue') ? '🥩' :
                                                cat.id.includes('fruta') || cat.id.includes('legume') || cat.id.includes('horti') ? '🍎' :
                                                  cat.id.includes('agua') || cat.id.includes('gas') ? '💧' :
                                                    cat.id.includes('cafe') ? '☕' :
                                                      '🏷️'}
                  </span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected
                      ? 'bg-white/20 text-white'
                      : isLight
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                    {cat.count}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Barra de Busca de Produtos */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'border-[#1A2533] bg-[#0D141C]'
            }`}>
            <div className="relative flex-1">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-400'
                }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produto por nome ou código..."
                className={`w-full pl-8 pr-7 py-2 rounded-lg text-xs font-semibold outline-none transition-all ${isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500'
                    : 'bg-[#070B0E] border border-[#1E2B3A] text-white placeholder:text-slate-500 focus:border-sky-500'
                  }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold whitespace-nowrap px-2.5 py-1.5 rounded-lg border ${isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-[#070B0E] text-slate-400 border-[#1E2B3A]'
                }`}>
                {filteredProducts.length} itens
              </span>

              {/* Seletor Rápido: Grade em 4 Colunas vs Lista Compacta */}
              <div className={`flex items-center rounded-lg p-0.5 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#070B0E] border-[#1E2B3A]'
                }`}>
                <button
                  type="button"
                  onClick={() => {
                    if (currentTenant) {
                      updateTenant(currentTenant.id, {
                        config: { ...currentTenant.config, posLayout: 'grid' }
                      });
                    }
                  }}
                  title="Exibir em Grade (4 colunas)"
                  className={`p-1 rounded-md transition-all cursor-pointer ${(currentTenant?.config?.posLayout || 'grid') === 'grid'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentTenant) {
                      updateTenant(currentTenant.id, {
                        config: { ...currentTenant.config, posLayout: 'list' }
                      });
                    }
                  }}
                  title="Exibir em Lista Compacta"
                  className={`p-1 rounded-md transition-all cursor-pointer ${currentTenant?.config?.posLayout === 'list'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Exibição dos Produtos: Lista Compacta vs Grade em 4 Colunas */}
          {(currentTenant?.config?.posLayout === 'list') ? (
            /* Modo Lista Compacta */
            <div className={`space-y-2 overflow-y-auto pr-1 ${isFullscreenPDV ? 'flex-1 min-h-0' : 'max-h-[640px]'
              }`}>
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
                    onClick={() => {
                      addItemToCart(product);
                      playBeep(true);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer group active:scale-[0.99] select-none shadow-xs ${isLight
                        ? 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md'
                        : 'border-[#1A2533] bg-[#0D141C] hover:bg-[#121B26] hover:border-sky-500/50'
                      } ${isOutOfStock ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Miniatura Quadrada do Produto */}
                      <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-[#1E2B3A]'
                        }`}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-base font-bold text-slate-400">
                            {product.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Informações: Nome, Categoria e Estoque */}
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold leading-tight truncate ${isLight ? 'text-slate-800' : 'text-white'
                          }`}>
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {product.volume || (isCardapio ? '🍽️ Cardápio' : 'Unidade')}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${isCardapio
                              ? 'text-emerald-500 bg-emerald-500/15 border border-emerald-500/30'
                              : isOutOfStock
                                ? 'text-red-500 bg-red-500/15 border border-red-500/30'
                                : isLowStock
                                  ? 'text-amber-500 bg-amber-500/15 border border-amber-500/30'
                                  : isLight
                                    ? 'text-slate-600 bg-slate-100 border border-slate-200'
                                    : 'text-neutral-300 bg-neutral-800'
                            }`}>
                            {isCardapio ? 'Feito na Hora' : `${product.stockQuantity} un`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preço e Botão Adicionar */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-sm font-black tabular-nums ${isLight ? 'text-sky-600' : 'text-sky-400'
                        }`}>
                        R$ {price.toFixed(2).replace('.', ',')}
                      </span>

                      <div className="flex items-center gap-1">
                        {isAdega && !isCardapio && enabledPacks.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductForPackModal(product);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-sky-700 border-slate-200'
                                : 'bg-[#070B0E] hover:bg-[#141E28] text-sky-400 border-[#1A2533]'
                              }`}
                            title="Fardos e caixas"
                          >
                            📦 Fardos
                          </button>
                        )}

                        <span className="w-7 h-7 rounded-lg nuvi-btn-cyber-blue text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#0C2340]/40 border-0 transition-transform active:scale-95 hover:brightness-110">
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Modo Grade Fixo em 4 Colunas */
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 overflow-y-auto pr-1 ${isFullscreenPDV ? 'flex-1 min-h-0' : 'max-h-[640px]'
              }`}>
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
                    onClick={() => {
                      addItemToCart(product);
                      playBeep(true);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all relative cursor-pointer group active:scale-[0.98] select-none shadow-sm ${isLight
                        ? 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md'
                        : 'border-[#1A2533] bg-[#0D141C] hover:bg-[#121B26] hover:border-sky-500/50'
                      } ${isOutOfStock ? 'opacity-60' : ''}`}
                  >
                    <div>
                      {/* Header: Volume/Tipo e Estoque */}
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className={`truncate font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {product.volume || (isCardapio ? '🍽️ Cardápio' : 'Unidade')}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${isCardapio
                            ? 'text-emerald-500 bg-emerald-500/15 border border-emerald-500/30'
                            : isOutOfStock
                              ? 'text-red-500 bg-red-500/15 border border-red-500/30'
                              : isLowStock
                                ? 'text-amber-500 bg-amber-500/15 border border-amber-500/30'
                                : isLight
                                  ? 'text-slate-600 bg-slate-100 border border-slate-200'
                                  : 'text-neutral-300 bg-neutral-800'
                          }`}>
                          {isCardapio ? 'Feito na Hora' : `${product.stockQuantity} un`}
                        </span>
                      </div>

                      {/* Descrição / Nome do Produto no Topo */}
                      <h4 className={`text-xs font-bold leading-snug line-clamp-2 min-h-[30px] mb-2 ${isLight ? 'text-slate-800' : 'text-white'
                        }`}>
                        {product.name}
                      </h4>

                      {/* Foto Auto-Adaptável que Estende Completando a Área */}
                      {product.imageUrl && (
                        <div className={`w-full aspect-[16/10] sm:aspect-video rounded-xl overflow-hidden mb-2 relative flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-black/30'
                          }`}>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>

                    {/* Preço e Botão Adicionar */}
                    <div className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-1.5 ${isLight ? 'border-slate-100' : 'border-[#1A2533]'
                      }`}>
                      <div>
                        <span className={`text-sm font-black tabular-nums block ${isLight ? 'text-sky-600' : 'text-sky-400'
                          }`}>
                          R$ {price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isAdega && !isCardapio && enabledPacks.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductForPackModal(product);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-sky-700 border-slate-200'
                                : 'bg-[#070B0E] hover:bg-[#141E28] text-sky-400 border-[#1A2533]'
                              }`}
                            title="Fardos e caixas"
                          >
                            📦 Fardos
                          </button>
                        )}

                        {/* Botão Adicionar */}
                        <span className="w-7 h-7 rounded-xl nuvi-btn-cyber-blue text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#0C2340]/40 border-0 transition-transform active:scale-95 hover:brightness-110">
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Sale Checkout / Cashier Box */}
        <div className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 rounded-2xl border p-4.5 space-y-4 transition-colors flex flex-col justify-between ${isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50'
            : 'bg-[#0D141C] border-[#1A2533] text-white shadow-xl'
          } ${isFullscreenPDV ? 'overflow-y-auto' : ''}`}>

          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-[#1A2533]'
            }`}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-sky-500" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                Venda em Andamento
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-sky-500/15 text-sky-500 border-sky-500/30">
                {cartItems.reduce((acc, i) => acc + (i.packUnits ? i.packUnits * i.quantity : i.quantity), 0)} itens baixados
              </span>
            </div>

            {cartItems.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSuspendCurrentSale}
                  className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30 font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Pôr venda atual em espera (F6) para atender outro cliente"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Espera (F6)</span>
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs flex items-center gap-1 px-2 py-1.5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Limpar venda atual (F4)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar (F4)</span>
                </button>
              </div>
            )}
          </div>

          {/* Customer Name */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1E2B3A] bg-[#070B0E]'
            }`}>
            <User className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do Cliente (opcional - Padrão: Balcão)"
              className={`w-full bg-transparent text-xs outline-none focus:outline-none ${isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
                }`}
            />
          </div>

          {/* Cart Itemized List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1A2533] bg-[#070B0E]'
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      {item.productName}
                    </span>
                    {item.packUnits ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 bg-sky-500/15 text-sky-500 border-sky-500/30">
                        <Boxes className="w-2.5 h-2.5 text-sky-500" />
                        {item.packUnits * item.quantity} un baixadas
                      </span>
                    ) : (
                      <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                        Unidade Avulsa
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                    <span>{item.volume}</span>
                    <span>·</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
                      R$ {item.price.toFixed(2)} cada
                    </span>
                  </div>
                </div>

                {/* Quantity steppers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(idx, -1)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-[#141E28] hover:bg-[#1E2B3A] text-white'
                      }`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className={`w-6 text-center font-bold tabular-nums ${isLight ? 'text-slate-800' : 'text-white'
                    }`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(idx, 1)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-[#141E28] hover:bg-[#1E2B3A] text-white'
                      }`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0 w-16">
                  <span className={`font-extrabold tabular-nums font-mono ${isLight ? 'text-sky-600' : 'text-sky-400'
                    }`}>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className={`p-8 text-center border border-dashed rounded-xl space-y-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1A2533] bg-[#070B0E]/60'
                }`}>
                <Barcode className="w-8 h-8 mx-auto text-slate-400" />
                <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Nenhum produto adicionado ao caixa ainda.<br />
                  Clique nos produtos acima para iniciar a venda no balcão.
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-slate-100' : 'border-[#1A2533]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
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
                    className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${isSelected
                        ? 'nuvi-btn-cyber-blue text-white font-bold shadow-md shadow-[#0C2340]/40'
                        : isLight
                          ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          : 'bg-[#070B0E] border border-[#1A2533] text-slate-400 hover:text-white hover:bg-[#131E2B]'
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
            <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1A2533] bg-[#070B0E]'
              }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Valor Entregue pelo Cliente:
                </span>
                <div className="relative w-28">
                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>R$</span>
                  <input
                    type="text"
                    value={cashAmountGiven}
                    onChange={(e) => setCashAmountGiven(e.target.value)}
                    placeholder={total > 0 ? total.toFixed(2) : '0,00'}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className={`w-full pl-7 pr-2 py-1 rounded text-right text-xs font-mono font-bold outline-none border focus:border-sky-500 ${isLight
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-[#121820] border-[#1E2B3A] text-white'
                      }`}
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Rápido:</span>
                {[total, 10, 20, 50, 100].filter(val => val >= total || val === total).slice(0, 4).map((val, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCashAmountGiven(val.toFixed(2))}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer border ${isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-[#141E28] hover:bg-[#1E2B3A] text-slate-200 border-[#1A2533]'
                      }`}
                  >
                    R$ {val.toFixed(2)}
                  </button>
                ))}
              </div>

              {changeDue > 0 && (
                <div className={`pt-2 border-t flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 ${isLight ? 'border-slate-200' : 'border-[#1A2533]'
                  }`}>
                  <span>Troco a Devolver:</span>
                  <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    R$ {changeDue.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total & Finalize Button */}
          <div className={`pt-3 border-t space-y-2.5 ${isLight ? 'border-slate-100' : 'border-[#1A2533]'}`}>
            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs font-medium">
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Subtotal dos itens:</span>
              <span className={`font-mono font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                R$ {subtotal.toFixed(2)}
              </span>
            </div>

            {/* Linha de Desconto / Arredondamento */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={discountAmount > 0 ? 'text-emerald-500 font-bold' : isLight ? 'text-slate-500' : 'text-slate-400'}>
                  Desconto no Caixa:
                </span>
                {discountAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscountAmount(0)}
                    className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer ml-1"
                    title="Remover desconto"
                  >
                    (remover)
                  </button>
                )}
              </div>
              {discountAmount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(true)}
                  className="font-mono font-bold text-emerald-500 hover:underline cursor-pointer"
                  title="Alterar desconto"
                >
                  - R$ {discountAmount.toFixed(2)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(true)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    isLight
                      ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  + Desconto / Arredondar
                </button>
              )}
            </div>

            {/* Total Final */}
            <div className="flex items-baseline justify-between pt-1 border-t border-dashed border-[#1E2B3A]">
              <span className={`text-xs uppercase tracking-wider font-extrabold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                Total a Pagar:
              </span>
              <span className={`text-2xl font-black font-mono tabular-nums ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
                R$ {total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                if (cartItems.length === 0) return;
                if (paymentMethod === 'pix') {
                  setShowPixModal(true);
                } else {
                  handleFinalizeSale();
                }
              }}
              disabled={cartItems.length === 0}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${cartItems.length > 0
                  ? 'nuvi-btn-cyber-blue text-white font-bold shadow-md shadow-[#0C2340]/40 border-0 active:scale-[0.98] hover:brightness-110'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border-0'
                }`}
            >
              {paymentMethod === 'pix' ? (
                <QrCode className="w-5 h-5 text-white shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-white stroke-[2.5] shrink-0" />
              )}
              <span className="text-white font-bold tracking-tight">
                {paymentMethod === 'pix' ? 'Finalizar Venda (F12 / QR Code PIX)' : 'Finalizar Venda (F12)'}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Sale Receipt Modal (Cupom de Venda Balcão) */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
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
                <div className={`flex justify-between text-base font-bold pt-2 border-t ${isLight ? 'border-neutral-300 text-neutral-900' : 'border-neutral-800 text-white'
                  }`}>
                  <span>TOTAL:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-extrabold">
                    R$ {completedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stock Deducted Notice */}
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                }`}>
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Estoque deduzido e sincronizado no sistema da loja.</span>
              </div>

              {/* Envio de Comprovante no WhatsApp do Cliente */}
              <div className={`p-3 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121A26] border-[#1E2B3A]'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Enviar Cupom no WhatsApp
                  </span>
                  <span className="text-[10px] text-slate-400">Sem gastar papel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={receiptWhatsappPhone}
                      onChange={(e) => setReceiptWhatsappPhone(e.target.value)}
                      className={`w-full pl-8 pr-2 py-1.5 rounded-lg text-xs font-mono outline-hidden border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                          : 'bg-[#0B1017] border-[#1A2533] text-white focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendReceiptViaWhatsApp(receiptWhatsappPhone)}
                    disabled={!receiptWhatsappPhone.trim()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      receiptWhatsappPhone.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>

              {/* Receipt Modal Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${isLight
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
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs shadow-none bg-sky-600 hover:bg-sky-500 text-white transition-all active:scale-95 cursor-pointer"
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
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-colors ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-neutral-900 border-neutral-700 text-white'
            }`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
              }`}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold bg-sky-500/15 text-sky-500"
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
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${isLight
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
                  <span className="text-sm font-extrabold block font-mono text-sky-600 dark:text-sky-400">
                    R$ {(selectedProductForPackModal.promoPrice ?? selectedProductForPackModal.price).toFixed(2)}
                  </span>
                </div>
              </button>

              {/* Fardos Cadastrados (12, 18, 24, 6) */}
              <div className="pt-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 text-sky-600 dark:text-sky-400"
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
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${hasStock
                            ? isLight
                              ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 cursor-pointer shadow-2xs'
                              : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 cursor-pointer'
                            : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-neutral-900 border-slate-200'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-sky-500/15 text-sky-500"
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
                          <span className="text-sm font-extrabold block font-mono text-sky-600 dark:text-sky-400">
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
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic PIX QR Code Modal */}
      {showPixModal && currentTenant && (
        <PDVPixModal
          totalAmount={total}
          tenant={currentTenant}
          isLight={isLight}
          onClose={() => setShowPixModal(false)}
          onConfirmPayment={() => {
            setShowPixModal(false);
            handleFinalizeSale();
          }}
        />
      )}

      {/* Modal de Troca Rápida de Operador do Caixa */}
      {showSwitchOperatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#1E2B3A] bg-[#0E1520] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2B3A]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">Alternar Operador de Caixa</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchOperatorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Selecione o operador que está assumindo a frente de caixa:
            </p>

            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {tenantUsers.map((u) => {
                const isCurrent = currentStoreUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setCurrentStoreUserId(u.id);
                      setShowSwitchOperatorModal(false);
                      showAlert({
                        title: 'Caixa Alterado',
                        message: `Operador "${u.name}" assumiu o caixa. Todas as vendas e saídas sairão em seu nome.`,
                        variant: 'success'
                      });
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${isCurrent
                        ? 'border-sky-500 bg-sky-500/15 ring-1 ring-sky-500/30'
                        : 'border-[#1E2B3A] bg-[#121A26] hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isCurrent ? 'bg-sky-500 text-white' : 'bg-neutral-800 text-slate-300'
                        }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-white">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.roleLabel}</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/20">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2B3A] flex justify-end">
              <button
                type="button"
                onClick={() => setShowSwitchOperatorModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#1E2B3A] hover:bg-neutral-800 text-slate-300 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desconto / Arredondamento da Venda */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0E1520] border-[#1E2B3A] text-white'
          }`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121A26] border-[#1E2B3A]'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Aplicar Desconto no Caixa</h3>
                  <p className="text-[11px] text-slate-400">Subtotal atual: R$ {subtotal.toFixed(2)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tipo de Desconto */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-black/20 border border-[#1A2533]">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    discountType === 'fixed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Valor Fixo (R$)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    discountType === 'percent'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Porcentagem (%)
                </button>
              </div>

              {/* Input de Valor */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {discountType === 'fixed' ? 'Valor do Desconto (R$):' : 'Porcentagem de Desconto (%):'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={discountType === 'fixed' ? subtotal : 100}
                  value={discountInputVal}
                  onChange={(e) => setDiscountInputVal(e.target.value)}
                  placeholder="0,00"
                  className={`w-full px-3 py-2.5 rounded-xl font-mono text-base font-bold outline-hidden border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                      : 'bg-[#0B1017] border-[#1A2533] text-white focus:border-emerald-500'
                  }`}
                  autoFocus
                />
              </div>

              {/* Botões rápidos de desconto */}
              <div className="space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Atalhos rápidos:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {discountType === 'fixed' ? (
                    <>
                      {[1, 2, 5, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDiscountInputVal(String(val))}
                          className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                              : 'bg-transparent border-[#1E2B3A] text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[5, 10, 15, 20].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDiscountInputVal(String(val))}
                          className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                              : 'bg-transparent border-[#1E2B3A] text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Arredondar Centavos (Eliminar quebradinho) */}
                {subtotal % 1 !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const cents = Number((subtotal % 1).toFixed(2));
                      setDiscountType('fixed');
                      setDiscountInputVal(String(cents));
                    }}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-between hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Arredondar para baixo (retirar centavos):</span>
                    <span className="font-mono font-black">R$ {(subtotal % 1).toFixed(2)}</span>
                  </button>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1E2B3A]">
                <button
                  type="button"
                  onClick={() => {
                    setDiscountAmount(0);
                    setShowDiscountModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#1E2B3A] text-xs font-bold text-slate-400 hover:bg-neutral-800 cursor-pointer"
                >
                  Sem Desconto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(discountInputVal) || 0;
                    if (discountType === 'percent') {
                      const calculated = (subtotal * val) / 100;
                      setDiscountAmount(Math.min(subtotal, Math.max(0, calculated)));
                    } else {
                      setDiscountAmount(Math.min(subtotal, Math.max(0, val)));
                    }
                    setShowDiscountModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Aplicar Desconto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vendas em Espera (Suspended Sales) */}
      {showSuspendedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0E1520] border-[#1E2B3A] text-white'
          }`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121A26] border-[#1E2B3A]'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Pause className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Vendas Guardadas em Espera</h3>
                  <p className="text-[11px] text-slate-400">Atenda outros clientes sem perder o carrinho atual</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSuspendedModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {suspendedSales.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Pause className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Nenhuma venda colocada em espera no momento.</p>
                  <p className="text-[11px] text-slate-500">Pressione F6 ou clique em "Em Espera" para guardar um carrinho.</p>
                </div>
              ) : (
                suspendedSales.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121A26] border-[#1E2B3A]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate text-amber-400">
                          {s.clientName || 'Cliente Balcão'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {s.items.reduce((acc, it) => acc + it.quantity, 0)} itens: {s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                      <p className="text-xs font-mono font-bold text-sky-400">
                        Total: R$ {s.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteSuspendedSale(s.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                        title="Descartar venda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResumeSale(s)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Retomar no Caixa</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[#1E2B3A] flex justify-end">
              <button
                type="button"
                onClick={() => setShowSuspendedModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#1E2B3A] hover:bg-neutral-800 text-slate-300 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Atalhos Rápidos no Rodapé do Caixa */}
      <div className={`mt-4 py-2.5 px-4 rounded-xl border flex items-center justify-between flex-wrap gap-2 text-xs font-mono shadow-xs ${
        isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#0E1520] border-[#1E2B3A] text-slate-400'
      }`}>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <Keyboard className="w-4 h-4 text-sky-500" />
          <span className={`hidden sm:inline ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Atalhos do Teclado:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-black/40 border-[#1E2B3A] text-sky-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F2</strong> Bipar</span>
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/40 border-[#1E2B3A] text-slate-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F4</strong> Limpar</span>
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-black/40 border-[#1E2B3A] text-amber-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F6</strong> Espera</span>
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-black/40 border-[#1E2B3A] text-emerald-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F8</strong> Dinheiro</span>
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-black/40 border-[#1E2B3A] text-purple-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F9</strong> PIX</span>
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-black/40 border-[#1E2B3A] text-blue-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F10</strong> Débito</span>
          <span className={`px-2 py-0.5 rounded border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-black/40 border-[#1E2B3A] text-indigo-300'}`}><strong className={isLight ? 'text-slate-900' : 'text-white'}>F11</strong> Crédito</span>
          <span className={`px-2 py-0.5 rounded border font-bold ${isLight ? 'bg-sky-500 text-white border-sky-600 shadow-xs' : 'bg-sky-600/30 border-sky-500/50 text-sky-200'}`}><strong className="text-white">F12</strong> Finalizar</span>
        </div>
      </div>

    </div>
  );
};
