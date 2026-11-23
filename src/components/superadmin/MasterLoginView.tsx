import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { NuviLogo } from '../common/NuviLogo';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface MasterLoginViewProps {
  onSuccess?: () => void;
}

export const MasterLoginView: React.FC<MasterLoginViewProps> = ({ onSuccess }) => {
  const { 
    loginMaster, 
    isMasterPasswordSet,
    setupMasterPassword,
    setViewRole,
  } = useStore();

  const hasPassword = isMasterPasswordSet();
  const [isFirstAccess, setIsFirstAccess] = useState(!hasPassword);

  const [username, setUsername] = useState('lrm.miranda');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage('Por favor, informe seu usuário de administrador.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    if (isFirstAccess) {
      if (password.length < 6) {
        setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não coincidem.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const ok = setupMasterPassword(username.trim(), password.trim());
        setIsLoading(false);
        if (ok) {
          setSuccessMessage('Senha mestre cadastrada com sucesso!');
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 300);
        } else {
          setErrorMessage('Não foi possível salvar a senha. Tente novamente.');
        }
      }, 400);
      return;
    }

    // Login regular
    setIsLoading(true);
    setTimeout(() => {
      const success = loginMaster(username.trim(), password.trim());
      setIsLoading(false);
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Usuário ou senha incorretos.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 relative">
      
      {/* Botão de Retorno ao Portal no Canto Superior Esquerdo */}
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={() => setViewRole('login_tenant')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Voltar ao Portal</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Topo com Logo Nuvi e Título Oficial */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <NuviLogo size="lg" isLight={true} showSubtitle={true} />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-500/10 text-blue-600 border-blue-500/25">
            {isFirstAccess ? <KeyRound className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isFirstAccess ? 'Primeiro Acesso Mestre' : 'Acesso Mestre White-Label'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {isFirstAccess ? 'Definir Senha Mestre' : 'Portal do Administrador Geral'}
          </h1>
          
          <p className="text-xs sm:text-sm max-w-sm mx-auto text-slate-600">
            {isFirstAccess 
              ? 'Bem-vindo, lrm.miranda. Crie sua senha de acesso exclusivo para gerenciar a plataforma Nuvi SaaS.' 
              : 'Painel exclusivo para controle de contratantes, lojas, planos, faturamento SaaS e métricas da plataforma.'}
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mensagem de Erro se houver */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-600">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Campo Usuário */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Usuário do Administrador
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="lrm.miranda"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-slate-400 focus:ring-0"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isFirstAccess ? 'Criar Senha Mestre' : 'Senha Mestre'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isFirstAccess ? 'Mínimo 6 caracteres' : '••••••••'}
                  autoComplete={isFirstAccess ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-slate-400 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha (apenas no primeiro acesso) */}
            {isFirstAccess && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha criada"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-slate-400 focus:ring-0"
                  />
                </div>
              </div>
            )}

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isFirstAccess ? 'Cadastrar Senha e Acessar Master' : 'Entrar na Plataforma Master'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Opção para alternar entre primeiro acesso e login */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsFirstAccess(!isFirstAccess);
                setErrorMessage(null);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-xs text-slate-600 hover:text-slate-800 hover:underline transition-colors cursor-pointer"
            >
              {isFirstAccess 
                ? 'Já possui senha cadastrada? Fazer login' 
                : 'Primeiro acesso ou deseja redefinir senha? Clique aqui'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
