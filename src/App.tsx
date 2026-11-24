import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { MasterHeader } from './components/common/MasterHeader';
import { TenantHeader } from './components/common/TenantHeader';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { MasterLoginView } from './components/superadmin/MasterLoginView';
import { TenantDashboard } from './components/tenant/TenantDashboard';
import { TenantRegisterView } from './components/tenant/TenantRegisterView';
import { TenantLoginView } from './components/tenant/TenantLoginView';
import { StorefrontView } from './components/storefront/StorefrontView';
import { TenantNotFoundView } from './components/common/TenantNotFoundView';
import { OnboardingWizardModal } from './components/tenant/OnboardingWizardModal';
import { NewTenantModal } from './components/superadmin/NewTenantModal';
import { MasterSettingsModal } from './components/superadmin/MasterSettingsModal';
import { Tenant } from './types';
import { detectPortalMode } from './utils/portalEnvironment';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    viewRole,
    setViewRole,
    currentTenant,
    setCurrentTenantId,
    tenants,
    themeMode,
    adminThemeMode,
    isMasterAuthenticated,
    authenticatedTenantId,
    notFoundSlug,
    isInitialSyncDone,
  } = useStore();

  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isMasterSettingsOpen, setIsMasterSettingsOpen] = useState(false);
  const [onboardingTargetTenant, setOnboardingTargetTenant] = useState<Tenant | undefined>(undefined);

  // Detecta se estamos na porta 3005 (Master) ou 3006 (Lojista/Vitrine)
  const portalMode = detectPortalMode();

  const handleOpenOnboardingForTenant = (tenant: Tenant) => {
    setOnboardingTargetTenant(tenant);
    setCurrentTenantId(tenant.id);
    setIsOnboardingModalOpen(true);
  };

  const handleTenantCreated = (newTenant: Tenant) => {
    setCurrentTenantId(newTenant.id);
    setOnboardingTargetTenant(newTenant);
    setIsOnboardingModalOpen(true);
  };

  // Cores dinâmicas da loja ativa
  const primaryColor = currentTenant?.branding?.primaryColor || '#0284C7';
  const accentColor = currentTenant?.branding?.accentColor || '#38BDF8';

  // Separação de temas sincronizada:
  // Nas telas de Cadastro (Teste Grátis) e Acesso do Lojista (/acesso_lojista): SEMPRE modo claro
  // No Painel Master: utiliza adminThemeMode
  // No Painel do Lojista autenticado / Vitrine: utiliza themeMode
  const isMasterView = viewRole === 'super_admin';
  const isAuthOrRegister = viewRole === 'register_tenant' || viewRole === 'login_tenant' || viewRole === 'not_found';

  const effectiveThemeMode = 
    isAuthOrRegister
      ? 'light'
      : isMasterView
        ? adminThemeMode
        : themeMode;

  // Sincroniza classes no elemento <html> e <body> para garantir o tema correto
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (effectiveThemeMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
      body.style.backgroundColor = '#F8FAFC';
      body.style.color = '#0f172a';
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      body.style.backgroundColor = '#0B0F12';
      body.style.color = '#f5f5f5';
    }
  }, [effectiveThemeMode]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-accent', accentColor);
  }, [primaryColor, accentColor]);

  if (isMasterView && !isMasterAuthenticated) {
    return (
      <div className="min-h-screen light bg-slate-50">
        <MasterLoginView />
      </div>
    );
  }

  // Enquanto sincroniza os dados do Firestore no primeiro carregamento/reload (F5),
  // exibe tela de carregamento suave em vez de tela escura ou falso 404
  if (!isInitialSyncDone && !currentTenant && (viewRole === 'tenant_admin' || viewRole === 'storefront' || viewRole === 'not_found')) {
    return (
      <div className="min-h-screen light bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Carregando dados da loja...</p>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        effectiveThemeMode === 'light' 
          ? 'bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white light'
          : 'bg-[#0B0F12] text-slate-100 selection:bg-blue-600 selection:text-white dark'
      }`}
      style={{
        ['--brand-primary' as any]: primaryColor,
        ['--brand-accent' as any]: accentColor,
      }}
    >
      {/* Cabeçalho Dedicado Conforme o Modo Ativo (Oculto em telas de cadastro, login e no painel despoluído do lojista) */}
      {isMasterView ? (
        <MasterHeader onOpenSettings={() => setIsMasterSettingsOpen(true)} />
      ) : null}

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto ${isAuthOrRegister ? 'px-2 sm:px-4' : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-6'}`}>
        
        {/* Visão do Master Geral */}
        {isMasterView ? (
          <SuperAdminDashboard
            onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
            onOpenOnboardingForTenant={handleOpenOnboardingForTenant}
          />
        ) : (
          /* Visões da Loja Selecionada (Painel, Vitrine ou Login do Lojista) */
          <>
            {viewRole === 'not_found' && (
              <TenantNotFoundView requestedSlug={notFoundSlug} />
            )}

            {viewRole === 'tenant_admin' && (
              !currentTenant ? (
                <TenantNotFoundView requestedSlug={notFoundSlug} />
              ) : (authenticatedTenantId !== currentTenant.id && !isMasterAuthenticated) ? (
                <TenantLoginView
                  onSuccess={() => {
                    setViewRole('tenant_admin');
                  }}
                />
              ) : (
                <TenantDashboard
                  onOpenOnboarding={() => {
                    setOnboardingTargetTenant(currentTenant);
                    setIsOnboardingModalOpen(true);
                  }}
                />
              )
            )}

            {viewRole === 'login_tenant' && (
              <TenantLoginView
                onSuccess={() => {
                  setViewRole('tenant_admin');
                }}
              />
            )}

            {viewRole === 'register_tenant' && (
              <TenantRegisterView
                onSuccess={(newTenant) => {
                  setOnboardingTargetTenant(newTenant);
                  setIsOnboardingModalOpen(true);
                }}
              />
            )}

            {viewRole === 'storefront' && (
              !currentTenant ? (
                <TenantNotFoundView requestedSlug={notFoundSlug} />
              ) : (
                <StorefrontView />
              )
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <NewTenantModal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
        onTenantCreated={handleTenantCreated}
      />

      <OnboardingWizardModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        targetTenant={onboardingTargetTenant}
      />

      <MasterSettingsModal
        isOpen={isMasterSettingsOpen}
        onClose={() => setIsMasterSettingsOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
