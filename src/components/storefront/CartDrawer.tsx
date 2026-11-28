import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, Order, PaymentMethod, DeliveryType } from '../../types';
import { 
  X, 
  Trash2, 
  Minus, 
  Plus, 
  MapPin, 
  Truck, 
  Store, 
  CreditCard, 
  Banknote, 
  QrCode, 
  MessageSquare, 
  Snowflake, 
  Check, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onOrderCompleted: (order: Order) => void;
  tableNumber?: string;
  onSetTableNumber?: (table: string) => void;
  isTableServiceEnabled?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tenant,
  onOrderCompleted,
  tableNumber,
  onSetTableNumber,
  isTableServiceEnabled,
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    generateWhatsAppOrderUrl,
    showAlert,
    themeMode,
  } = useStore();

  const isLight = themeMode === 'light';
  const brandAccent = tenant.branding?.accentColor || '#F59E0B';
  const brandPrimary = tenant.branding?.primaryColor || '#881337';
  const isTablesOnly = tenant.config?.storefrontServiceMode === 'tables_only';
  const isDeliveryOnly = tenant.config?.storefrontServiceMode === 'delivery_only';
  const tableSelectionMode = tenant.config?.tableSelectionMode || 'both';
  const hasTableService = !isDeliveryOnly && Boolean(isTableServiceEnabled ?? (tenant.config?.enableTableService || tableNumber));

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(() => {
    if (isTablesOnly || tableNumber) return 'mesa';
    return 'delivery';
  });
  const [selectedTable, setSelectedTable] = useState<string>(tableNumber || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashChangeFor, setCashChangeFor] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (isTablesOnly || tableNumber) {
      if (tableNumber) setSelectedTable(tableNumber);
      setDeliveryType('mesa');
    }
  }, [tableNumber, isTablesOnly]);

  // Address
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: tenant.address.city || 'São Paulo',
    complement: '',
    referencePoint: '',
  });

  if (!isOpen) return null;

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isFreeDelivery =
    deliveryType === 'pickup' ||
    deliveryType === 'mesa' ||
    (tenant.address.freeDeliveryThreshold &&
      subtotal >= tenant.address.freeDeliveryThreshold);

  const deliveryFee =
    deliveryType === 'pickup' || deliveryType === 'mesa'
      ? 0
      : isFreeDelivery
      ? 0
      : tenant.address.standardDeliveryFee || 0;

  // Programa de Fidelidade & Recompensa
  const isLoyaltyEnabled = tenant.config?.enableLoyaltyProgram ?? true;
  const loyaltyTarget = tenant.config?.loyaltyTargetOrders || 10;
  const loyaltyReward = tenant.config?.loyaltyRewardValue || 20;
  
  const loyaltyKey = `nuvi_loyalty_${tenant.id}`;
  let clientStamps = 3;
  try {
    const saved = localStorage.getItem(loyaltyKey);
    clientStamps = saved ? Number(saved) : 3;
  } catch {}

  const hasLoyaltyReward = isLoyaltyEnabled && clientStamps >= loyaltyTarget;
  const loyaltyDiscount = hasLoyaltyReward ? Math.min(loyaltyReward, subtotal) : 0;
  const total = Math.max(0, subtotal + deliveryFee - loyaltyDiscount);

  const remainingForFreeDelivery =
    tenant.address.freeDeliveryThreshold && subtotal < tenant.address.freeDeliveryThreshold
      ? tenant.address.freeDeliveryThreshold - subtotal
      : 0;

  const handleFillDemoAddress = () => {
    setCustomerName('Carlos Eduardo Silveira');
    setCustomerPhone('11998877665');
    setAddress({
      street: 'Rua das Camélias',
      number: '180',
      neighborhood: 'Jardins',
      city: tenant.address.city || 'São Paulo',
      complement: 'Apt 42',
      referencePoint: 'Próximo à Praça Central',
    });
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showAlert({
        title: 'Carrinho Vazio',
        message: 'Seu carrinho está vazio! Adicione bebidas antes de finalizar.',
        variant: 'warning',
      });
      return;
    }

    // Tratamento especial para MESA (Salão / Dine-in)
    if (deliveryType === 'mesa') {
      const mesaFinal = selectedTable.trim() || tableNumber?.trim();
      if (!mesaFinal) {
        showAlert({
          title: 'Mesa Não Informada',
          message: 'Por favor, informe o número da mesa em que você está sentado.',
          variant: 'warning',
        });
        return;
      }

      const clientName = customerName.trim() || `Cliente Mesa ${mesaFinal.replace(/[^0-9]/g, '') || mesaFinal}`;
      const clientPhone = customerPhone.trim() || 'Presencial Salão';

      const newOrder = createOrder({
        customerName: clientName,
        customerPhone: clientPhone,
        deliveryType: 'mesa',
        tableNumber: mesaFinal,
        isTableOrder: true,
        tableStatus: 'aberta',
        address: undefined,
        deliveryFee: 0,
        items: [...cart],
        subtotal,
        total: subtotal,
        paymentMethod,
        cashChangeFor: paymentMethod === 'dinheiro' && cashChangeFor ? Number(cashChangeFor) : null,
        status: 'novo',
        notes: orderNotes,
      });

      showAlert({
        title: '🍽️ Pedido Enviado para a Cozinha!',
        message: `Tudo certo! Seus itens foram adicionados à comanda da Mesa ${mesaFinal} e já estão sendo preparados. Bom apetite!`,
        variant: 'info',
      });

      clearCart();
      onOrderCompleted(newOrder);
      onClose();
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showAlert({
        title: 'Dados Incompletos',
        message: 'Por favor, informe seu nome e telefone WhatsApp para contato e acompanhamento do pedido.',
        variant: 'warning',
      });
      return;
    }

    if (deliveryType === 'delivery' && (!address.street.trim() || !address.number.trim() || !address.neighborhood.trim())) {
      showAlert({
        title: 'Endereço Incompleto',
        message: 'Por favor, informe a rua, número e bairro para a entrega do seu pedido.',
        variant: 'warning',
      });
      return;
    }

    // Create order in store state (isolated by tenantId)
    const newOrder = createOrder({
      customerName,
      customerPhone,
      deliveryType,
      address: deliveryType === 'delivery' ? address : undefined,
      deliveryFee,
      items: [...cart],
      subtotal,
      total,
      paymentMethod,
      cashChangeFor: paymentMethod === 'dinheiro' && cashChangeFor ? Number(cashChangeFor) : null,
      status: 'novo',
      notes: orderNotes,
    });

    // Registra selo no Cartão Fidelidade
    if (isLoyaltyEnabled) {
      try {
        const nextStamps = hasLoyaltyReward ? 1 : clientStamps + 1;
        localStorage.setItem(loyaltyKey, String(nextStamps));
      } catch {}
    }

    const isWhatsAppEnabled = tenant.whatsapp.enableWhatsAppOrders !== false;

    // If WhatsApp is enabled, open WhatsApp link
    if (isWhatsAppEnabled) {
      const waUrl = generateWhatsAppOrderUrl(newOrder, tenant);
      window.open(waUrl, '_blank');
    }

    // Notify parent & clean up
    clearCart();
    onOrderCompleted(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop para desktop */}
      <div 
        className="hidden sm:block absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full h-full sm:w-screen sm:max-w-md sm:border-l flex flex-col shadow-2xl transition-colors">
        <div className={`w-full h-full flex flex-col shadow-2xl transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}>
          
          {/* Drawer Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
          }`}>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>Carrinho de Compras</span>
                <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  ({cart.reduce((a, b) => a + b.quantity, 0)} itens)
                </span>
              </h2>
              <p className={`text-xs truncate max-w-[280px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                {tenant.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Store className={`w-12 h-12 mx-auto ${isLight ? 'text-slate-400' : 'text-neutral-600'}`} />
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Seu carrinho está vazio</h3>
                <p className={`text-xs max-w-xs mx-auto ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Adicione produtos do catálogo ou cardápio para montar seu pedido.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: tenant.branding?.accentColor || '#F59E0B',
                      color: '#09090b',
                    }}
                  >
                    <span>Ver Cardápio & Escolher Itens</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Free Delivery Bar - Apenas para Delivery / Retirada (NUNCA para Mesas) */}
                {deliveryType !== 'mesa' && tenant.address.freeDeliveryThreshold && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-neutral-950 border-neutral-800'
                  }`}>
                    {remainingForFreeDelivery > 0 ? (
                      <div>
                        <div className={`flex justify-between mb-1.5 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                          <span>Faltam <strong>R$ {remainingForFreeDelivery.toFixed(2)}</strong> para Frete Grátis</span>
                          <span 
                            className="font-mono font-bold"
                            style={{ color: tenant.branding?.accentColor || '#F59E0B' }}
                          >
                            {Math.round((subtotal / tenant.address.freeDeliveryThreshold) * 100)}%
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-neutral-800'}`}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (subtotal / tenant.address.freeDeliveryThreshold) * 100)}%`,
                              backgroundColor: tenant.branding?.accentColor || '#F59E0B',
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Parabéns! Você ganhou Frete Grátis neste pedido.</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${
                    isLight ? 'text-slate-600' : 'text-neutral-400'
                  }`}>
                    Itens Selecionados
                  </span>
                  {cart.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.chilled}-${idx}`}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {item.productName}
                          </h4>
                          {item.chilled && (
                            <span className="text-[10px] text-sky-500 font-bold flex items-center gap-0.5 bg-sky-500/15 px-1 py-0.2 rounded shrink-0">
                              <Snowflake className="w-2.5 h-2.5" /> Gelada
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          {item.volume} · R$ {item.price.toFixed(2)} cada
                        </p>
                        {item.notes && (
                          <p className="text-[10px] text-amber-500 italic mt-0.5 truncate font-medium">
                            Obs: {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Stepper */}
                      <div className={`flex items-center gap-1.5 p-1 rounded-lg border shrink-0 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-neutral-900 border-neutral-700/80'
                      }`}>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.chilled)}
                          className={`p-1 rounded cursor-pointer ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-neutral-400 hover:text-white'}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-5 text-center font-bold text-xs tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.chilled)}
                          className={`p-1 rounded cursor-pointer ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-neutral-400 hover:text-white'}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right shrink-0">
                        <span className={`font-bold block tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId, item.chilled)}
                          className="text-[10px] text-rose-500 hover:text-rose-600 mt-1 cursor-pointer font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Type Selection / Identificação da Mesa */}
                {tableNumber ? (
                  /* Cliente já está em uma mesa específica (via QR Code ou seleção prévia) */
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isLight ? 'bg-blue-50/80 border-blue-200 text-blue-950' : 'bg-blue-950/30 border-blue-800/60 text-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                          Consumo no Salão
                        </span>
                        <h4 className="text-sm font-black">
                          {selectedTable.toUpperCase().includes('MESA') ? selectedTable : `Mesa ${selectedTable}`}
                        </h4>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          Itens lançados direto na comanda desta mesa.
                        </p>
                      </div>
                    </div>

                    {(!isTablesOnly && tenant.config?.tableSelectionMode !== 'qrcode_fixed') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSetTableNumber) onSetTableNumber('');
                          setSelectedTable('');
                          setDeliveryType('delivery');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-300 dark:border-blue-700/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Mudar
                      </button>
                    )}
                  </div>
                ) : isTablesOnly ? (
                  /* Modo Exclusivo de Mesas / Salão */
                  <div className={`p-3.5 rounded-2xl border space-y-2 ${
                    isLight ? 'bg-blue-50/80 border-blue-200 text-blue-950' : 'bg-blue-950/30 border-blue-800/60 text-white'
                  }`}>
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold">Consumo Exclusivo no Salão (Mesa)</span>
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                      Selecione ou confirme sua mesa abaixo para enviar seu pedido diretamente para a cozinha.
                    </p>
                  </div>
                ) : (
                  <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                      Forma de Recebimento
                    </span>
                    <div className={`grid gap-2 text-xs ${hasTableService ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1 font-medium transition-all cursor-pointer ${
                          deliveryType === 'delivery'
                            ? 'font-bold shadow-sm'
                            : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                        style={
                          deliveryType === 'delivery'
                            ? {
                                borderColor: brandPrimary,
                                background: isLight ? `${brandPrimary}15` : `${brandPrimary}25`,
                                boxShadow: `0 0 0 1.5px ${brandPrimary}`,
                                color: isLight ? '#0f172a' : '#ffffff',
                              }
                            : {}
                        }
                      >
                        <Truck
                          className="w-4 h-4"
                          style={deliveryType === 'delivery' ? { color: brandAccent } : {}}
                        />
                        <span>Em Casa</span>
                        <span className="text-[10px] opacity-80">
                          {deliveryFee === 0 ? 'Grátis' : `Taxa R$ ${deliveryFee.toFixed(2)}`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1 font-medium transition-all cursor-pointer ${
                          deliveryType === 'pickup'
                            ? 'font-bold shadow-sm'
                            : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                        style={
                          deliveryType === 'pickup'
                            ? {
                                borderColor: brandPrimary,
                                background: isLight ? `${brandPrimary}15` : `${brandPrimary}25`,
                                boxShadow: `0 0 0 1.5px ${brandPrimary}`,
                                color: isLight ? '#0f172a' : '#ffffff',
                              }
                            : {}
                        }
                      >
                        <Store
                          className="w-4 h-4"
                          style={deliveryType === 'pickup' ? { color: brandAccent } : {}}
                        />
                        <span>Retirar</span>
                        <span className="text-[10px] text-emerald-500 font-bold">Sem taxa</span>
                      </button>

                      {hasTableService && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType('mesa')}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center text-center gap-1 font-medium transition-all cursor-pointer ${
                            deliveryType === 'mesa'
                              ? 'font-bold shadow-sm'
                              : isLight
                              ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                          }`}
                          style={
                            deliveryType === 'mesa'
                              ? {
                                  borderColor: brandPrimary,
                                  background: isLight ? `${brandPrimary}15` : `${brandPrimary}25`,
                                  boxShadow: `0 0 0 1.5px ${brandPrimary}`,
                                  color: isLight ? '#0f172a' : '#ffffff',
                                }
                              : {}
                          }
                        >
                          <UtensilsCrossed
                            className="w-4 h-4"
                            style={deliveryType === 'mesa' ? { color: brandAccent } : {}}
                          />
                          <span>Na Mesa</span>
                          <span className="text-[10px] text-emerald-500 font-bold">Salão / Cozinha</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Bloco de Mesa quando selecionado manualmente */}
                {deliveryType === 'mesa' && !tableNumber && (
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                    isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-800/60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isLight ? 'text-blue-950' : 'text-blue-200'}`}>
                          Atendimento em Mesa (Dine-in)
                        </h4>
                        <p className={`text-[11px] ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                          Os itens serão enviados direto para a cozinha e adicionados à sua comanda.
                        </p>
                      </div>
                    </div>

                    {tableSelectionMode === 'qrcode_fixed' ? (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          📱 Escaneie a Plaquinha da Sua Mesa
                        </p>
                        <p className="text-[11px] opacity-90">
                          Este estabelecimento exige a leitura do QR Code colado na mesa para enviar pedidos pelo salão.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className={`text-[11px] font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                          Qual é o número da sua Mesa? *
                        </label>
                        <input
                          type="text"
                          required
                          value={selectedTable}
                          onChange={(e) => {
                            setSelectedTable(e.target.value);
                            if (onSetTableNumber) onSetTableNumber(e.target.value);
                          }}
                          placeholder="Ex: Mesa 04 (ou apenas 4)"
                          className={`w-full px-3 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Info Form */}
                <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                      {deliveryType === 'mesa' ? 'Nome ou Apelido na Mesa (Opcional)' : 'Seus Dados para o Pedido'}
                    </span>
                    {deliveryType !== 'mesa' && (
                      <button
                        type="button"
                        onClick={handleFillDemoAddress}
                        className="text-[11px] text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                      >
                        Preencher Exemplo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        required={deliveryType !== 'mesa'}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={deliveryType === 'mesa' ? 'Seu Nome (opcional)' : 'Seu Nome Completo *'}
                        className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                          isLight
                            ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                        }`}
                      />
                    </div>
                    {deliveryType !== 'mesa' ? (
                      <div>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="WhatsApp (ex: 11988887777) *"
                          className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Observação da mesa (ex: sem gelo, mal passado)"
                          className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Delivery Address if delivery */}
                  {deliveryType === 'delivery' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Rua / Avenida *"
                          className={`col-span-2 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                        <input
                          type="text"
                          required
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                          placeholder="Nº *"
                          className={`px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={address.neighborhood}
                          onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                          placeholder="Bairro *"
                          className={`px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                        <input
                          type="text"
                          value={address.complement}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Apt, Bloco (opcional)"
                          className={`px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloco de Forma de Pagamento OU Aviso da Comanda da Mesa */}
                {deliveryType === 'mesa' ? (
                  <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-blue-50/80 border-blue-200 text-blue-950' : 'bg-blue-950/20 border-blue-800/50 text-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs font-black">Pagamento no Fechamento da Mesa</span>
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
                      Você não precisa pagar agora! Os itens deste pedido serão somados à conta da sua mesa. No final, você escolhe se paga via <strong>PIX, Dinheiro ou Cartão</strong> diretamente com o garçom ou no caixa.
                    </p>
                  </div>
                ) : (
                  /* Payment Method para Delivery ou Retirada */
                  <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                      Forma de Pagamento
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'pix'
                            ? isLight
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500/40'
                              : 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                            : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>PIX</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cartao_entrega')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'cartao_entrega'
                            ? isLight
                              ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500/40'
                              : 'border-blue-500 bg-neutral-800 text-white font-bold'
                            : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                        style={paymentMethod === 'cartao_entrega' && tenant.branding?.accentColor ? { borderColor: tenant.branding.accentColor } : {}}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Cartão</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('dinheiro')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === 'dinheiro'
                            ? isLight
                              ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500/40'
                              : 'border-blue-500 bg-neutral-800 text-white font-bold'
                            : isLight
                            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                        style={paymentMethod === 'dinheiro' && tenant.branding?.accentColor ? { borderColor: tenant.branding.accentColor } : {}}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Dinheiro</span>
                      </button>
                    </div>

                    {paymentMethod === 'dinheiro' && (
                      <div className="pt-1">
                        <input
                          type="number"
                          step="1"
                          value={cashChangeFor}
                          onChange={(e) => setCashChangeFor(e.target.value)}
                          placeholder="Precisa de troco para quanto? Ex: 50 ou 100"
                          className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                            isLight
                              ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                              : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Drawer Footer with Totals & WhatsApp CTA */}
          {cart.length > 0 && (
            <div className={`p-4 border-t space-y-2.5 shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className={`space-y-1 text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                <div className="flex justify-between items-center">
                  <span>{deliveryType === 'mesa' ? 'Subtotal dos Itens:' : 'Subtotal:'}</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>
                {deliveryType !== 'mesa' && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Taxa de Entrega:</span>
                    <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-500' : isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                      {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Desconto Clube Fidelidade:</span>
                    </span>
                    <span>- R$ {loyaltyDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className={`flex justify-between items-center text-sm font-extrabold pt-1 border-t ${
                  isLight ? 'text-slate-900 border-slate-200' : 'text-white border-neutral-800'
                }`}>
                  <span>TOTAL:</span>
                  <span 
                    className="font-black text-lg font-mono tabular-nums"
                    style={{ color: brandPrimary }}
                  >
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {deliveryType === 'mesa' ? (
                <>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer text-white"
                    style={{
                      background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 3px 12px ${brandPrimary}40`,
                    }}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>🍽️ Enviar Itens para a Cozinha ({selectedTable ? `Mesa ${selectedTable.replace(/[^0-9]/g, '') || selectedTable}` : 'Informar Mesa'})</span>
                  </button>

                  <p className="text-[10px] text-center font-medium opacity-80" style={{ color: brandAccent }}>
                    ⚡ Pedido instantâneo! Entra direto na cozinha e acumula na comanda da sua mesa.
                  </p>
                </>
              ) : tenant.whatsapp.enableWhatsAppOrders !== false ? (
                <>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Finalizar Pedido via WhatsApp</span>
                  </button>

                  <p className="text-[10px] text-neutral-400 text-center">
                    Seu pedido será registrado no painel de {tenant.name} e você enviará a confirmação no WhatsApp oficial.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer text-white"
                    style={{
                      background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 3px 12px ${brandPrimary}40`,
                    }}
                  >
                    <Store className="w-4 h-4" />
                    <span>Confirmar Pedido no Sistema</span>
                  </button>

                  <p className="text-[10px] text-neutral-400 text-center">
                    Seu pedido será recebido e processado imediatamente pelo painel de {tenant.name}.
                  </p>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
