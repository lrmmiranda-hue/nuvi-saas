import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { NuviLogo } from '../common/NuviLogo';
import {
  Store,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Building2,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface TenantLoginViewProps {
  onSuccess?: () => void;
}

export const TenantLoginView: React.FC<TenantLoginViewProps> = ({ onSuccess }) => {
  const {
    tenants,
    currentTenant,
    setCurrentTenantId,
    loginTenant,
    setViewRole,
    themeMode,
    toggleThemeMode,
    showAlert
  } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isLight = themeMode === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Por favor, informe seu WhatsApp ou E-mail.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ok = loginTenant(identifier, password);
      setIsSubmitting(false);

      if (ok) {
        setViewRole('tenant_admin');
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Nenhum estabelecimento encontrado com estes dados. Verifique o WhatsApp/e-mail digitado.');
      }
    }, 400);
  };

  const handleQuickLogin = (tenantId: string) => {
    const t = tenants.find((item) => item.id === tenantId);
    if (t) {
      setCurrentTenantId(t.id);
      loginTenant(t.whatsapp.phoneNumber, '123456');
      setViewRole('tenant_admin');
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className={`min-h-[85vh] py-10 px-4 flex flex-col justify-center items-center transition-colors relative ${
      isLight ? 'bg-slate-50' : 'bg-transparent'
    }`}>
      {/* Top Controls: Back to storefront */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setViewRole('storefront')}
          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
              : 'bg-[#11161B] border-[#1C2631] text-slate-300 hover:bg-[#161D24]'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          <span>Ver Vitrine</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Header Card com Logo Nuvi */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <NuviLogo size="lg" isLight={isLight} showSubtitle={false} />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Painel do Lojista
          </h1>
          <p className={`text-xs mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Acesso exclusivo do proprietário e equipe do estabelecimento.
          </p>
        </div>

        {/* Form Container */}
        <div className={`p-6 md:p-8 rounded-2xl border shadow-xl backdrop-blur-xs transition-all ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-slate-200/50'
            : 'bg-[#11161B] border-[#1C2631] shadow-black/40'
        }`}>
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                WhatsApp ou E-mail do Estabelecimento
              </label>
              <div className="relative">
                <Phone className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: 11977771234 ou contato@loja.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0B0F12] border-[#1C2631] text-white placeholder-slate-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    showAlert({
                      title: 'Recuperação de Senha',
                      message: 'Para recuperar sua senha, entre em contato direto pelo WhatsApp do suporte ou solicite um reset via código SMS.',
                      variant: 'info'
                    });
                  }}
                  className="text-[11px] text-blue-500 hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0B0F12] border-[#1C2631] text-white placeholder-slate-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 cursor-pointer accent-blue-500"
                />
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                  Manter conectado neste caixa
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.99] text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <span>Entrar no Painel da Loja</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Store Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-[#1C2631]">
            <span className={`text-[11px] font-semibold block mb-2 text-center uppercase tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              ⚡ Acesso Rápido para Testar (1 Clique):
            </span>
            <div className="grid grid-cols-1 gap-2">
              {tenants.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleQuickLogin(t.id)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-[#0B0F12] hover:bg-[#161D24] border-[#1C2631] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: t.branding.primaryColor || '#0284C7' }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold block truncate">{t.name}</span>
                      <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t.ownerName} • {t.address.city}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center space-y-2">
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Ainda não tem o sistema no seu comércio?{' '}
            <button
              onClick={() => setViewRole('register_tenant')}
              className="text-blue-500 font-bold hover:underline cursor-pointer"
            >
              Criar Loja Grátis (7 Dias)
            </button>
          </p>

          <div>
            <button
              onClick={() => setViewRole('super_admin')}
              className={`text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Acesso Master Administrador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

