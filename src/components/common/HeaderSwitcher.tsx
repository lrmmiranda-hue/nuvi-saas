import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Building2, 
  Store, 
  ShoppingBag, 
  Layers, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Plus,
  Sun,
  Moon,
  LogOut,
  Lock,
  UtensilsCrossed
} from 'lucide-react';
import { NuviLogo } from './NuviLogo';

interface HeaderSwitcherProps {
  onOpenNewTenantModal: () => void;
  onOpenOnboardingModal: () => void;
}

export const HeaderSwitcher: React.FC<HeaderSwitcherProps> = ({
  onOpenNewTenantModal,
  onOpenOnboardingModal,
}) => {
  const {
    tenants,
    currentTenantId,
    currentTenant,
    viewRole,
    setViewRole,
    setCurrentTenantId,
    cart,
    resetToDefaults,
    showAlert,
    adminThemeMode,
    toggleAdminThemeMode,
    themeMode,
    toggleThemeMode,
    isMasterAuthenticated,
    logoutMaster,
  } = useStore();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isSuperAdmin = viewRole === 'super_admin';
  const isLight = isSuperAdmin ? adminThemeMode === 'light' : themeMode === 'light';
  const isGastronomy = currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa';
  const storefrontLabel = isGastronomy ? 'Cardápio Digital' : 'Vitrine da Loja';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-800 shadow-xs' 
        : isSuperAdmin 
        ? 'bg-[#0B0F12]/95 border-[#1A222C] text-slate-100' 
        : 'bg-neutral-900/95 border-neutral-800 text-neutral-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          
          {/* Brand & Platform Identity: NUVI com tamanho ampliado */}
          <div className="flex items-center gap-3.5 shrink-0">
            <NuviLogo size="md" isLight={isLight} showSubtitle={true} />
            <div className={`hidden sm:block border-l pl-3.5 py-0.5 ${
              isLight ? 'border-slate-200' : isSuperAdmin ? 'border-[#1C2631]' : 'border-neutral-800'
            }`}>
              <span className={`text-[11px] font-bold block leading-tight ${
                isLight ? 'text-slate-800' : isSuperAdmin ? 'text-blue-400' : 'text-neutral-300'
              }`}>
                Gestão Master SaaS
              </span>
              <p className={`text-[10px] leading-tight ${
                isLight ? 'text-slate-500' : isSuperAdmin ? 'text-slate-400' : 'text-neutral-400'
              }`}>
                Plataforma Multi-Lojas & PDV
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs - Padronizado em Azul Nuvi */}
          <nav className={`flex items-center p-1 rounded-xl border text-xs ${
            isLight 
              ? 'bg-slate-100 border-slate-200' 
              : isSuperAdmin 
              ? 'bg-[#11161B] border-[#1C2631]' 
              : 'bg-neutral-950 border-neutral-800'
          }`}>
            <button
              onClick={() => setViewRole('super_admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                viewRole === 'super_admin'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs font-bold'
                  : isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isMasterAuthenticated ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Painel Master ({tenants.length})</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-blue-300" />
                  <span>Login Master</span>
                </>
              )}
            </button>

            <button
              onClick={() => setViewRole('tenant_admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                (viewRole === 'tenant_admin' || viewRole === 'login_tenant')
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs font-bold'
                  : isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Painel do Lojista</span>
            </button>

            <button
              onClick={() => {
                if (currentTenant?.config?.enableOnlineSales === false) {
                  showAlert({
                    title: 'Vendas Online Desativadas',
                    message: `A loja "${currentTenant.name}" está configurada exclusivamente como Loja Física (Balcão/PDV).\n\nPara liberar a vitrine online para seus clientes, ative "Vendas Online" nas Configurações da Loja no Painel do Lojista.`,
                    variant: 'warning',
                  });
                  return;
                }
                setViewRole('storefront');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap relative cursor-pointer ${
                viewRole === 'storefront'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs font-bold'
                  : currentTenant?.config?.enableOnlineSales === false
                  ? isLight ? 'text-slate-400' : 'text-neutral-500'
                  : isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60' : 'text-neutral-400 hover:text-white'
              }`}
              title={currentTenant?.config?.enableOnlineSales === false ? 'Vendas online desativadas nesta loja' : storefrontLabel}
            >
              {isGastronomy ? <UtensilsCrossed className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              <span>{storefrontLabel}</span>
              {currentTenant?.config?.enableOnlineSales === false ? (
                <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                  isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  Balcão
                </span>
              ) : (
                totalCartItems > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )
              )}
            </button>
          </nav>

          {/* Tenant Switcher & Quick Actions */}
          <div className="flex items-center gap-2">
            
            {/* Botão de Logout Master Admin (visível quando logado no Super Admin) */}
            {isMasterAuthenticated && isSuperAdmin && (
              <button
                onClick={() => {
                  logoutMaster();
                  setViewRole('tenant_admin');
                }}
                title="Sair da Sessão Master Admin"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Sair Master</span>
              </button>
            )}

            {/* Botão de Alternar Modo Claro / Escuro (disponível no sistema) */}
            <button
              onClick={isSuperAdmin ? toggleAdminThemeMode : toggleThemeMode}
              title={isLight ? 'Alternar para Modo Escuro (Black Carbon)' : 'Alternar para Modo Claro (Branco & Cinza Gelo)'}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : isSuperAdmin
                  ? 'bg-[#11161B] hover:bg-[#161D24] border-[#1C2631] text-slate-300'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-slate-300'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Active Store Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                    : 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200'
                }`}
              >
                {currentTenant?.branding.logoUrl ? (
                  <img
                    src={currentTenant.branding.logoUrl}
                    alt="Logo"
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 bg-blue-600"
                  />
                )}
                <span className="max-w-[130px] truncate hidden md:inline">
                  {currentTenant?.name || 'Selecionar Loja'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`} />
              </button>

              {tenantDropdownOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-2xl p-2 z-50 text-left ${
                    isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                  }`}
                  onMouseLeave={() => setTenantDropdownOpen(false)}
                >
                  <div className={`px-2 py-1.5 border-b mb-1 flex items-center justify-between ${
                    isLight ? 'border-slate-200 text-slate-500' : 'border-neutral-800 text-neutral-400'
                  }`}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Lojas Cadastradas
                    </span>
                    <button
                      onClick={() => {
                        setTenantDropdownOpen(false);
                        onOpenNewTenantModal();
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Nova Loja
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {tenants.map((tenant) => {
                      const isSelected = tenant.id === currentTenantId;
                      return (
                        <button
                          key={tenant.id}
                          onClick={() => {
                            setCurrentTenantId(tenant.id);
                            setTenantDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? isLight ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold' : 'bg-blue-950/40 border border-blue-800/60 text-white font-semibold'
                              : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-neutral-300 hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {tenant.branding.logoUrl ? (
                              <img
                                src={tenant.branding.logoUrl}
                                alt="Logo"
                                className="w-5 h-5 rounded-md object-contain shrink-0 bg-neutral-950 p-0.5 border border-white/10"
                              />
                            ) : (
                              <div
                                className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow-xs bg-blue-600"
                              >
                                {tenant.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0 text-left">
                              <p className={`truncate font-medium ${isLight ? 'text-slate-900' : 'text-neutral-100'}`}>{tenant.name}</p>
                              <p className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>{tenant.address.city} - {tenant.address.neighborhood}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className={`border-t mt-2 pt-2 px-1 flex items-center justify-between ${
                    isLight ? 'border-slate-200' : 'border-neutral-800'
                  }`}>
                    <button
                      onClick={() => {
                        setTenantDropdownOpen(false);
                        onOpenOnboardingModal();
                      }}
                      className={`w-full text-center py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-blue-700' : 'bg-neutral-800 hover:bg-neutral-700 text-blue-400'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Passo a Passo de Configuração</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset to defaults helper */}
            <button
              onClick={resetToDefaults}
              title="Restaurar dados de exemplo do SaaS"
              className={`p-2 rounded-lg border transition-colors ${
                isLight 
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-600 hover:text-neutral-900' 
                  : 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
