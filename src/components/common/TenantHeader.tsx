import React from 'react';
import { useStore } from '../../context/StoreContext';
import { getSegmentById } from '../../data/businessSegments';
import { 
  Store, 
  ShoppingBag, 
  Sun, 
  Moon, 
  LogOut
} from 'lucide-react';

interface TenantHeaderProps {
  onOpenNewTenantModal?: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = () => {
  const {
    viewRole,
    setViewRole,
    currentTenant,
    themeMode,
    toggleThemeMode,
    logoutTenant,
  } = useStore();

  const isLight = themeMode === 'light';

  const segmentConfig = currentTenant?.businessSegment 
    ? getSegmentById(currentTenant.businessSegment) 
    : undefined;

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs' 
        : 'bg-[#0E1318]/95 border-[#1A222B] text-slate-100 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Lado Esquerdo: Identificação Exclusiva da Loja do Lojista */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left ${
            isLight 
              ? 'bg-slate-50 border-slate-300' 
              : 'bg-[#151D24] border-[#222E3A]'
          }`}>
            {/* Ícone ou Avatar da Loja */}
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0"
              style={{ backgroundColor: currentTenant?.branding?.primaryColor || '#0284C7' }}
            >
              {segmentConfig?.emoji ? segmentConfig.emoji : currentTenant?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[240px]">
                {currentTenant?.name || 'Meu Estabelecimento'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold truncate">
                {segmentConfig?.shortLabel || 'Comércio'} • {currentTenant?.address?.city || 'Brasil'}
              </span>
            </div>
          </div>
        </div>

        {/* Centro: Alternância de Modo (Painel de Gestão vs Vitrine/Cardápio da Própria Loja) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-[#151D24] border border-slate-300/80 dark:border-[#222E3A]">
          <button
            onClick={() => setViewRole('tenant_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewRole === 'tenant_admin'
                ? 'btn-graphite bg-neutral-800 text-white shadow-xs border border-neutral-700'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Painel do Lojista</span>
            <span className="sm:hidden">Painel</span>
          </button>

          <button
            onClick={() => setViewRole('storefront')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewRole === 'storefront'
                ? 'btn-graphite bg-neutral-800 text-white shadow-xs border border-neutral-700'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Vitrine Online</span>
            <span className="sm:hidden">Vitrine</span>
          </button>
        </div>

        {/* Lado Direito: Tema Claro/Escuro e Sair */}
        <div className="flex items-center gap-2">
          
          {/* Alternador de Tema da Loja */}
          <button
            onClick={toggleThemeMode}
            title={isLight ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                : 'bg-[#151D24] hover:bg-[#1E2933] border-[#222E3A] text-slate-200'
            }`}
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Botão de Sair do Painel do Lojista */}
          <button
            onClick={() => {
              logoutTenant();
              setViewRole('login_tenant');
            }}
            title="Encerrar sessão do lojista"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                : 'border-rose-900/50 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>

        </div>

      </div>
    </header>
  );
};
