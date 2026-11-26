import React, { useState } from 'react';
import { Tenant } from '../../types';
import { generatePixPayload, getQRCodeUrl } from '../../utils/pixPayload';
import { QrCode, Copy, Check, X, ShieldCheck, Banknote, Smartphone } from 'lucide-react';

interface PDVPixModalProps {
  totalAmount: number;
  tenant: Tenant;
  onConfirmPayment: () => void;
  onClose: () => void;
  isLight?: boolean;
}

export const PDVPixModal: React.FC<PDVPixModalProps> = ({
  totalAmount,
  tenant,
  onConfirmPayment,
  onClose,
  isLight = false,
}) => {
  const [copied, setCopied] = useState(false);

  // Chave Pix configurada na loja ou fallback para documento
  const pixKey = tenant.config?.pixKey || tenant.document || '';
  const beneficiaryName = tenant.name || 'ESTABELECIMENTO';
  const city = tenant.address?.city || 'BRASIL';

  // Gera payload dinâmico oficial com o valor exato da venda
  const pixPayload = generatePixPayload({
    pixKey,
    beneficiaryName,
    city,
    amount: totalAmount,
    txid: `PDV${Date.now().toString().slice(-6)}`,
  });

  const qrCodeUrl = getQRCodeUrl(pixPayload || pixKey, 340);

  const handleCopy = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-800' 
            : 'bg-[#0E1318] border-[#1C2631] text-white'
        }`}
      >
        {/* Header do Modal */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121920] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                PIX Dinâmico na Tela
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ao Vivo
                </span>
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Cliente aponta a câmera do celular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 flex flex-col items-center text-center space-y-3.5">
          {/* Valor da Venda em Destaque */}
          <div className={`w-full p-2.5 rounded-xl border ${
            isLight 
              ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-white'
          }`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 block">
              Valor a Receber
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tight font-mono">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <span>Chave:</span>
              <span className="font-mono font-bold text-slate-300 truncate max-w-[180px]">
                {pixKey || 'Não configurada'}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="relative group">
            <div className="p-2.5 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-md inline-block">
              {pixKey ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code PIX com Valor"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-500 p-2">
                  <QrCode className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-[11px] font-semibold">Chave PIX não cadastrada.</span>
                </div>
              )}
            </div>

            <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Abra qualquer aplicativo de banco</span>
            </div>
          </div>

          {/* Copia e Cola */}
          {pixPayload && (
            <div className="w-full">
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#151D24] hover:bg-[#1C2630] text-slate-200 border-[#22303D]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Código Pix Copiado!' : 'Copiar Chave/Código PIX'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer com Botão de Confirmação de Pagamento */}
        <div className={`p-3.5 border-t flex items-center gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121920] border-[#1C2631]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
              isLight 
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                : 'bg-transparent hover:bg-white/5 border-slate-700 text-slate-300'
            }`}
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={onConfirmPayment}
            className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirmar Pagamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
