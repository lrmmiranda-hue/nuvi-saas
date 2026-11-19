import React from 'react';
import { useStore } from '../../context/StoreContext';
import { NuviLogo } from './NuviLogo';
import { getOtherPortalUrl } from '../../utils/portalEnvironment';
import { 
  ShieldCheck, 
  ExternalLink, 
  Sun, 
  Moon, 
  LogOut,
  Store,
  Layers,
  Settings
} from 'lucide-react';

interface MasterHeaderProps {
  onOpenSettings?: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({ onOpenSettings }) => {
  const {
    adminThemeMode,
    toggleAdminThemeMode,
    logoutMaster,
    currentTenant,
    tenants
  } = useStore();

  const isLight = adminThemeMode === 'light';
  const tenantPortalUrl = getOtherPortalUrl('tenant', currentTenant?.id);

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
          
          <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-neutral-800" />

          <div className="hidden sm:flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isLight 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Gestão Master SaaS
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 hidden md:inline">
              Supervisão de {tenants.length} Lojas
            </span>
          </div>
        </div>

        {/* Lado Direito: Acesso à porta 3006 (Lojistas), Tema e Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botão de Atalho para o Portal do Lojista na porta 3006 */}
          <a
            href={tenantPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Acessar o Painel do Lojista e Vitrines na porta 3006"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 transition-all shadow-xs cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Testar Painel do Lojista</span>
            <span className="md:hidden">Lojistas</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600/30 text-blue-300 font-mono">
              :3006
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Botão de Configurações Master com Ícone de Engrenagem (Somente Ícone sem Fundo) */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Configurações Globais & Permissões"
              className="p-2 text-slate-400 hover:text-sky-400 hover:rotate-90 bg-transparent border-0 transition-all cursor-pointer outline-none"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Alternador de Tema Claro / Escuro do Master (Somente Ícone sem Fundo) */}
          <button
            onClick={toggleAdminThemeMode}
            title={isLight ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            className="p-2 text-slate-400 hover:text-amber-400 bg-transparent border-0 transition-colors cursor-pointer outline-none"
          >
            {isLight ? (
              <Moon className="w-5 h-5 text-slate-600 hover:text-blue-600" />
            ) : (
              <Sun className="w-5 h-5 text-slate-400 hover:text-amber-400" />
            )}
          </button>

          {/* Botão de Sair do Painel Master (Somente Ícone sem Fundo) */}
          <button
            onClick={logoutMaster}
            title="Encerrar sessão de Administrador"
            className="p-2 text-slate-400 hover:text-rose-400 bg-transparent border-0 transition-colors cursor-pointer outline-none"
          >
            <LogOut className="w-5 h-5" />
          </button>

        </div>

      </div>
    </header>
  );
};
