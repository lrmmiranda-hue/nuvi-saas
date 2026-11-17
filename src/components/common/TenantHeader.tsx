import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getOtherPortalUrl } from '../../utils/portalEnvironment';
import { getSegmentById } from '../../data/businessSegments';
import { 
  Store, 
  ShoppingBag, 
  Sun, 
  Moon, 
  ChevronDown, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Check,
  LogOut
} from 'lucide-react';

interface TenantHeaderProps {
  onOpenNewTenantModal: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ onOpenNewTenantModal }) => {
  const {
    viewRole,
    setViewRole,
    currentTenant,
    setCurrentTenantId,
    tenants,
    themeMode,
    toggleThemeMode,
    logoutTenant,
  } = useStore();

  const isLight = themeMode === 'light';
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const storeMenuRef = useRef<HTMLDivElement>(null);

  const segmentConfig = currentTenant?.businessSegment 
    ? getSegmentById(currentTenant.businessSegment) 
    : undefined;

  const masterPortalUrl = getOtherPortalUrl('master');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target as Node)) {
        setIsStoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs' 
        : 'bg-[#0E1318]/95 border-[#1A222B] text-slate-100 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Lado Esquerdo: Identificação da Loja Atual + Seletor de Loja para Testes */}
        <div className="flex items-center gap-3">
          
          {/* Seletor de Loja Ativa */}
          <div className="relative" ref={storeMenuRef}>
            <button
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300' 
                  : 'bg-[#151D24] hover:bg-[#1E2933] border-[#222E3A]'
              }`}
            >
              {/* Ícone ou Avatar da Loja */}
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                style={{ backgroundColor: currentTenant?.branding?.primaryColor || '#0284C7' }}
              >
                {segmentConfig?.emoji ? segmentConfig.emoji : currentTenant?.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[200px]">
                    {currentTenant?.name || 'Selecione uma Loja'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isStoreMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold truncate">
                  {segmentConfig?.title || 'Comércio'} • {currentTenant?.address?.city || 'Brasil'}
                </span>
              </div>
            </button>

            {/* Dropdown de Alternância de Lojas */}
            {isStoreMenuOpen && (
              <div className={`absolute left-0 mt-2 w-72 rounded-2xl border shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                isLight 
                  ? 'bg-white border-slate-200 divide-y divide-slate-100 text-slate-800' 
                  : 'bg-[#11171D] border-[#1C2631] divide-y divide-neutral-800 text-slate-200'
              }`}>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Alternar Loja (Ambiente de Testes)
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {tenants.map((t) => {
                    const isSelected = t.id === currentTenant?.id;
                    const tSegment = t.businessSegment ? getSegmentById(t.businessSegment) : undefined;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentTenantId(t.id);
                          setIsStoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? (isLight ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-blue-950/40 text-blue-300 font-bold')
                            : (isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-neutral-800/60 text-slate-300')
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{tSegment?.emoji || '🏪'}</span>
                          <div className="truncate">
                            <p className="truncate font-semibold">{t.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{tSegment?.title || 'Comércio'}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsStoreMenuOpen(false);
                      onOpenNewTenantModal();
                    }}
                    className="btn-graphite w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Cadastrar Nova Loja
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Centro: Alternância de Modo (Painel do Lojista vs Vitrine do Cardápio) */}
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

        {/* Lado Direito: Tema Claro/Escuro e Link para o Master */}
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

          {/* Link discreto para o Master na porta 3005 */}
          <a
            href={masterPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Acessar o Painel Master na porta 3005"
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isLight 
                ? 'border-slate-300 text-slate-600 hover:bg-slate-100' 
                : 'border-[#222E3A] text-slate-400 hover:bg-[#151D24] hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Master</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-slate-500/20 font-mono">
              :3005
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

        </div>

      </div>
    </header>
  );
};
