import React, { useState } from 'react';
import { Tenant } from '../../types';
import { getQRCodeUrl } from '../../utils/pixPayload';
import { QrCode, Printer, Copy, Check, X, ExternalLink, Sparkles, Smartphone, Store } from 'lucide-react';

interface TableQRCodeModalProps {
  tenant: Tenant;
  onClose: () => void;
  isLight?: boolean;
}

export const TableQRCodeModal: React.FC<TableQRCodeModalProps> = ({
  tenant,
  onClose,
  isLight = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('');

  // Origem do site (Firebase Hosting oficial ou local)
  const origin = window.location.origin.includes('web.app') || window.location.origin.includes('firebaseapp.com')
    ? window.location.origin
    : 'https://nuvi-saas.web.app';

  // Link do cardápio digital
  const baseUrl = `${origin}/${tenant.slug}/cardapio`;
  const finalMenuUrl = tableNumber.trim() ? `${baseUrl}?mesa=${encodeURIComponent(tableNumber.trim())}` : baseUrl;
  
  const qrCodeUrl = getQRCodeUrl(finalMenuUrl, 450);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir a plaquinha de mesa.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Plaquinha de Mesa - ${tenant.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #f1f5f9;
              padding: 20px;
            }
            .plate-card {
              width: 380px;
              background: #ffffff;
              border-radius: 24px;
              padding: 32px 24px;
              text-align: center;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
              border: 2px solid #e2e8f0;
            }
            .logo-box {
              width: 64px;
              height: 64px;
              margin: 0 auto 12px;
              border-radius: 16px;
              background: #0ea5e9;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 24px;
              overflow: hidden;
            }
            .logo-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            h1 {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .slogan {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 20px;
            }
            .badge-mesa {
              display: inline-block;
              background: #0284c7;
              color: white;
              font-weight: 800;
              font-size: 13px;
              padding: 4px 16px;
              border-radius: 20px;
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 12px;
              border-radius: 20px;
              border: 3px solid #0284c7;
              display: inline-block;
              margin-bottom: 16px;
            }
            .qr-wrapper img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .instruction {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
            }
            .sub-instruction {
              font-size: 11px;
              color: #64748b;
              line-height: 1.4;
            }
            .footer {
              margin-top: 20px;
              padding-top: 14px;
              border-top: 1px dashed #cbd5e1;
              font-size: 10px;
              color: #94a3b8;
              font-weight: 600;
            }
            @media print {
              body { background: transparent; padding: 0; }
              .plate-card { box-shadow: none; border: 1.5px solid #000; margin: auto; }
            }
          </style>
        </head>
        <body>
          <div class="plate-card">
            <div class="logo-box">
              ${tenant.branding?.logoUrl ? `<img src="${tenant.branding.logoUrl}" alt="Logo" />` : (tenant.name?.slice(0, 2).toUpperCase() || 'NV')}
            </div>
            <h1>${tenant.name}</h1>
            <p class="slogan">${tenant.slogan || 'Cardápio Digital & Atendimento Inteligente'}</p>

            ${tableNumber.trim() ? `<div class="badge-mesa">MESA ${tableNumber.trim()}</div>` : `<div class="badge-mesa">CARDÁPIO DIGITAL</div>`}

            <div class="qr-wrapper">
              <img src="${qrCodeUrl}" alt="QR Code Mesa" />
            </div>

            <p class="instruction">📱 Aponte a câmera do seu celular</p>
            <p class="sub-instruction">Acesse o cardápio completo, veja fotos, preços e faça seu pedido direto na mesa!</p>

            <div class="footer">
              Nuvi SaaS • Tecnologia para Bares, Adegas e Restaurantes
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121920] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                QR Code do Cardápio Digital
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Para mesas, balcão, totens e plaquinhas de acrílico
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

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          
          {/* Opção de identificador da mesa (opcional) */}
          <div className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121920] border-[#1C2631]'
          }`}>
            <span className="text-xs font-bold text-left">
              Número da Mesa (opcional):
              <span className={`block text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Ex: 01, 12, Balcão, VIP
              </span>
            </span>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Ex: 01"
              className={`w-24 px-3 py-1.5 rounded-xl text-center font-bold text-sm outline-none border transition-colors ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500' 
                  : 'bg-neutral-900 border-neutral-700 text-white focus:border-sky-500'
              }`}
            />
          </div>

          {/* QR Code Card */}
          <div className="p-4 rounded-3xl bg-white border-4 border-sky-500/40 shadow-xl inline-block">
            <img
              src={qrCodeUrl}
              alt="QR Code do Cardápio Digital"
              className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
            />
          </div>

          {/* Link URL */}
          <div className="w-full">
            <div className={`p-2.5 rounded-xl border font-mono text-[11px] flex items-center justify-between gap-2 overflow-hidden ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#151D24] border-[#1F2C38] text-slate-300'
            }`}>
              <span className="truncate">{finalMenuUrl}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copiar link"
                  className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-400 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={finalMenuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir cardápio"
                  className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            {copied && (
              <span className="text-[11px] font-bold text-emerald-400 mt-1 block">
                Link do cardápio copiado com sucesso!
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
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
            Fechar
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir Plaquinha de Mesa (A4)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
