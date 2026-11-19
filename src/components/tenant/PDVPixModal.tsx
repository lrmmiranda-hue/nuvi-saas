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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-800' 
            : 'bg-[#0E1318] border-[#1C2631] text-white'
        }`}
      >
        {/* Header do Modal */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121920] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight flex items-center gap-2">
                Pagamento via PIX Dinâmico
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ao Vivo
                </span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Aponte a câmera do celular ou banco do cliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* Valor da Venda em Destaque */}
          <div className={`w-full p-4 rounded-2xl border ${
            isLight 
              ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-white'
          }`}>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 block mb-1">
              Valor Exato a Receber
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-500 tracking-tight">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Chave cadastrada:</span>
              <span className="font-mono font-bold text-slate-300 truncate max-w-[220px]">
                {pixKey || 'Não configurada'}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="relative group">
            <div className="p-4 rounded-3xl bg-white border-4 border-emerald-500/40 shadow-xl inline-block">
              {pixKey ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code PIX com Valor"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-500 p-4">
                  <QrCode className="w-12 h-12 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold">Chave PIX não cadastrada nas configurações da loja.</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Cliente pode escanear com qualquer app de banco</span>
            </div>
          </div>

          {/* Copia e Cola */}
          {pixPayload && (
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#151D24] hover:bg-[#1C2630] text-slate-200 border-[#22303D]'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Código Pix Copiado com Sucesso!' : 'Copiar Código PIX (Copia e Cola)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer com Botão de Confirmação de Pagamento */}
        <div className={`p-5 border-t flex flex-col sm:flex-row items-center gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121920] border-[#1C2631]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
              isLight 
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                : 'bg-transparent hover:bg-white/5 border-slate-700 text-slate-300'
            }`}
          >
            Mudar Forma de Pagamento
          </button>

          <button
            type="button"
            onClick={onConfirmPayment}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Confirmar Pagamento Recebido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
