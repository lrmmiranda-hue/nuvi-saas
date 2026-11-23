import React from 'react';
import { NuviLogo } from './NuviLogo';
import { Store, ShieldAlert, ArrowLeft, PlusCircle, LogIn, Lock } from 'lucide-react';

interface TenantNotFoundViewProps {
  requestedSlug?: string;
}

export const TenantNotFoundView: React.FC<TenantNotFoundViewProps> = ({ requestedSlug }) => {
  const displaySlug = requestedSlug ? requestedSlug.replace(/^\/+|\/+$/g, '') : '';

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGoToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/acesso_lojista';
    }
  };

  const handleGoToMaster = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/acesso_master';
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 flex flex-col justify-center items-center text-center">
      <div className="w-full max-w-lg">
        {/* Logo Nuvi */}
        <div className="flex justify-center mb-6">
          <NuviLogo size="lg" isLight={true} showSubtitle={false} />
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5 text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                404 • Não Encontrado
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                Estabelecimento Não Encontrado
              </h2>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Endereço digitado:</span>
            <code className="font-mono text-rose-600 font-bold bg-white px-2 py-1 rounded-md border border-slate-200 block truncate">
              nuvi-saas.web.app/{displaySlug || 'link-invalido'}
            </code>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Este estabelecimento <strong>não existe</strong>, foi <strong>desativado</strong> ou <strong>excluído</strong> da plataforma Nuvi SaaS. Verifique se o endereço foi digitado corretamente.
          </p>

          {/* Aviso de Privacidade e Segurança */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Isolamento e Segurança:</strong> Por normas de proteção e sigilo entre lojistas, o sistema nunca exibe dados de outro comércio quando um link antigo ou inexistente é acessado.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Nova Loja (Teste Grátis 7 Dias)</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Login do Lojista</span>
              </button>

              <button
                type="button"
                onClick={handleGoToMaster}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Acesso Master</span>
              </button>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <p className="text-xs text-slate-500 mt-6">
          Nuvi SaaS • Sistema para Adegas, Mercadinhos, Pizzarias e Restaurantes
        </p>
      </div>
    </div>
  );
};
