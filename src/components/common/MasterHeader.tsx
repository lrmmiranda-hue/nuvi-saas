import React from 'react';
import { useStore } from '../../context/StoreContext';
import { NuviLogo } from './NuviLogo';
import { 
  ShieldCheck, 
  LogOut,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

interface MasterHeaderProps {
  onOpenSettings?: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({ onOpenSettings }) => {
  const {
    adminThemeMode,
    toggleAdminThemeMode,
    logoutMaster,
    setViewRole,
    tenants
  } = useStore();

  const isLight = adminThemeMode === 'light';

  const handleLogout = () => {
    logoutMaster();
    setViewRole('login_tenant');
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-800 shadow-xs' 
        : 'bg-[#0E1318]/95 border-[#1A222B] text-slate-200 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Logo Nuvi e Identificação do Dono da Plataforma */}
        <div className="flex items-center gap-4">
          <NuviLogo size="md" isLight={isLight} showSubtitle={true} />
          
          <div className={`hidden sm:block h-6 w-px ${isLight ? 'bg-slate-300' : 'bg-neutral-800'}`} />

          <div className="hidden sm:flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isLight 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Gestão Master SaaS
            </span>
            <span className={`text-xs hidden md:inline ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              Supervisão de {tenants.length} Lojas
            </span>
          </div>
        </div>

        {/* Lado Direito: Configurações, Layout Escuro/Claro (ao lado da engrenagem) e Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botão de Configurações Master com Ícone de Engrenagem */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Configurações Globais & Permissões"
              className={`p-2 transition-all cursor-pointer outline-none bg-transparent border-0 hover:rotate-90 ${
                isLight ? 'text-slate-500 hover:text-sky-600' : 'text-slate-400 hover:text-sky-400'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Botão de Alternar Layout Escuro / Claro do Master (ao lado da engrenagem) */}
          <button
            onClick={toggleAdminThemeMode}
            title={isLight ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            className={`p-2 transition-colors cursor-pointer outline-none bg-transparent border-0 ${
              isLight ? 'text-slate-500 hover:text-blue-600' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            {isLight ? (
              <Moon className="w-5 h-5 text-slate-600 hover:text-blue-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {/* Botão de Sair do Painel Master */}
          <button
            onClick={handleLogout}
            title="Encerrar sessão de Administrador"
            className={`p-2 transition-colors cursor-pointer outline-none bg-transparent border-0 ${
              isLight ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <LogOut className="w-5 h-5" />
          </button>

        </div>

      </div>
    </header>
  );
};
