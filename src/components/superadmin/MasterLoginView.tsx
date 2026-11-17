import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { NuviLogo } from '../common/NuviLogo';
import { getOtherPortalUrl } from '../../utils/portalEnvironment';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Sun, 
  Moon,
  Store,
  ExternalLink
} from 'lucide-react';

interface MasterLoginViewProps {
  onSuccess?: () => void;
}

export const MasterLoginView: React.FC<MasterLoginViewProps> = ({ onSuccess }) => {
  const { 
    loginMaster, 
    adminThemeMode, 
    toggleAdminThemeMode, 
    currentTenant,
  } = useStore();

  const isLight = adminThemeMode === 'light';

  const [email, setEmail] = useState('admin@adegasaas.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tenantPortalUrl = getOtherPortalUrl('tenant', currentTenant?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = loginMaster(email.trim(), password);
      setIsLoading(false);
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('E-mail ou senha master inválidos. Tente admin@adegasaas.com e admin123.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail('admin@adegasaas.com');
    setPassword('admin123');
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      loginMaster('admin@adegasaas.com', 'admin123');
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 300);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors relative ${
      isLight ? 'bg-slate-50' : 'bg-[#0B0F12]'
    }`}>
      
      {/* Botão ÚNICO e Discreto de Tema no Canto Superior Direito */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <button
          onClick={toggleAdminThemeMode}
          title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isLight 
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs' 
              : 'bg-[#151D24] border-[#222E3A] text-slate-200 hover:bg-[#1E2933]'
          }`}
        >
          {isLight ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>{isLight ? 'Modo Escuro' : 'Modo Claro'}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Topo com Logo Nuvi e Título Oficial */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <NuviLogo size="lg" isLight={isLight} showSubtitle={true} />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-500/10 text-blue-500 border-blue-500/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acesso Mestre White-Label</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Portal do Administrador Geral
          </h1>
          
          <p className={`text-xs sm:text-sm max-w-sm mx-auto ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Painel exclusivo para controle de contratantes, lojas, planos, faturamento SaaS e métricas da plataforma.
          </p>
        </div>

        {/* Card do Formulário de Login */}
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl transition-colors ${
          isLight 
            ? 'bg-white border-slate-200 shadow-slate-200/50' 
            : 'bg-[#11171D] border-[#1C2631] shadow-black/80'
        }`}>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mensagem de Erro se houver */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@adegasaas.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white' 
                      : 'bg-[#161F28] border border-[#23313E] text-white focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Senha Mestre
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white' 
                      : 'bg-[#161F28] border border-[#23313E] text-white focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão de Entrar com Degradê Nuvi Azul */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar na Plataforma Master</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Atalho de Demonstração Rápida */}
          <div className={`mt-6 pt-5 border-t space-y-3 ${
            isLight ? 'border-slate-200' : 'border-[#1C2631]'
          }`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Acesso Rápido de Teste:
              </span>
              <span className="font-mono text-slate-500 text-[10px]">admin123</span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800' 
                  : 'bg-[#151D24] border-[#222E3A] hover:bg-[#1E2933] text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Entrar com 1 Clique (Demonstração Master)</span>
            </button>
          </div>

        </div>

        {/* Link para o Portal do Lojista na porta 3006 */}
        <div className="text-center pt-2">
          <a
            href={tenantPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline transition-colors ${
              isLight ? 'text-slate-600 hover:text-blue-600' : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-blue-500" />
            <span>Acessar o Portal do Lojista & Vitrine (Porta 3006)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

      </div>

    </div>
  );
};
