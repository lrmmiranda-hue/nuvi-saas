import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onOrderCompleted: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tenant,
  onOrderCompleted,
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

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashChangeFor, setCashChangeFor] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');

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
    (tenant.address.freeDeliveryThreshold &&
      subtotal >= tenant.address.freeDeliveryThreshold);

  const deliveryFee =
    deliveryType === 'pickup'
      ? 0
      : isFreeDelivery
      ? 0
      : tenant.address.standardDeliveryFee || 0;

  const total = subtotal + deliveryFee;

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
    <div className="fixed inset-x-0 top-0 bottom-[58px] sm:bottom-0 sm:inset-0 z-40 sm:z-50 overflow-hidden">
      {/* Backdrop para desktop */}
      <div 
        className="hidden sm:block absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-w-full flex">
        <div className={`w-full sm:w-screen sm:max-w-md sm:border-l flex flex-col shadow-2xl transition-colors ${
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
                {/* Free Delivery Bar */}
                {tenant.address.freeDeliveryThreshold && (
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

                {/* Delivery Type Selection */}
                <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                    Forma de Recebimento
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all cursor-pointer ${
                        deliveryType === 'delivery'
                          ? isLight
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500/40'
                            : 'border-blue-500 bg-neutral-800 text-white font-bold ring-1 ring-blue-500/40'
                          : isLight
                          ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                      style={deliveryType === 'delivery' && tenant.branding?.accentColor ? { borderColor: tenant.branding.accentColor } : {}}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Entrega em Casa</span>
                      <span className="text-[10px] opacity-75">
                        {deliveryFee === 0 ? 'Grátis' : `Taxa R$ ${deliveryFee.toFixed(2)}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all cursor-pointer ${
                        deliveryType === 'pickup'
                          ? isLight
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500/40'
                            : 'border-blue-500 bg-neutral-800 text-white font-bold ring-1 ring-blue-500/40'
                          : isLight
                          ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                      style={deliveryType === 'pickup' && tenant.branding?.accentColor ? { borderColor: tenant.branding.accentColor } : {}}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retirar na Loja</span>
                      <span className="text-[10px] text-emerald-500 font-bold">Sem taxa</span>
                    </button>
                  </div>
                </div>

                {/* Customer Info Form */}
                <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                      Seus Dados para o Pedido
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemoAddress}
                      className="text-[11px] text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                    >
                      Preencher Exemplo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu Nome Completo *"
                        className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-amber-500 ${
                          isLight
                            ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500'
                        }`}
                      />
                    </div>
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

                {/* Payment Method */}
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
              </>
            )}

          </div>

          {/* Drawer Footer with Totals & WhatsApp CTA */}
          {cart.length > 0 && (
            <div className={`p-6 border-t space-y-3 shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className={`space-y-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                    {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className={`flex justify-between text-base font-bold pt-1 border-t ${
                  isLight ? 'text-slate-900 border-slate-200' : 'text-white border-neutral-800'
                }`}>
                  <span>TOTAL:</span>
                  <span 
                    className="font-black text-lg"
                    style={{ color: tenant.branding?.accentColor || '#3B82F6' }}
                  >
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {tenant.whatsapp.enableWhatsAppOrders !== false ? (
                <>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Finalizar Pedido via WhatsApp</span>
                  </button>

                  <p className="text-[10px] text-neutral-500 text-center">
                    Seu pedido será registrado no painel da adega e você enviará a confirmação diretamente no WhatsApp oficial.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] cursor-pointer text-white"
                    style={{
                      backgroundColor: tenant.branding?.accentColor || '#3B82F6',
                      color: '#ffffff',
                    }}
                  >
                    <Store className="w-4 h-4" />
                    <span>Confirmar Pedido no Sistema</span>
                  </button>

                  <p className="text-[10px] text-neutral-400 text-center">
                    Modo Direto: Seu pedido será recebido e processado imediatamente pelo painel da loja sem necessidade de WhatsApp.
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
