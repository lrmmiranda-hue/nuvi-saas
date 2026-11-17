import React from 'react';
import { Order, Tenant } from '../../types';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, MessageSquare, Clock, MapPin, X, ArrowRight } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  tenant,
}) => {
  const { generateWhatsAppOrderUrl } = useStore();

  if (!isOpen || !order) return null;

  const whatsAppUrl = generateWhatsAppOrderUrl(order, tenant);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-neutral-100 text-center space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
            Pedido Registrado com Sucesso
          </span>
          <h2 className="text-xl font-bold text-white mt-2">
            Pedido #{order.id}
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            Recebido por <strong>{tenant.name}</strong>
          </p>
        </div>

        {/* Order Card Preview */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Previsão de Entrega:</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              30 a 45 minutos
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-400">
            <span>Tipo:</span>
            <span className="text-neutral-200">
              {order.deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada no Balcão'}
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-400 border-t border-neutral-800/80 pt-2">
            <span>Total a pagar:</span>
            <span className="font-bold text-amber-400 text-sm font-mono">
              R$ {order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* CTA Options */}
        <div className="space-y-2">
          {tenant.whatsapp.enableWhatsAppOrders !== false ? (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir Conversa no WhatsApp da Adega</span>
            </a>
          ) : (
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2 text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>O lojista já foi notificado no painel da adega e iniciará a separação dos itens.</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
          >
            Continuar Navegando na Vitrine
          </button>
        </div>

      </div>
    </div>
  );
};
