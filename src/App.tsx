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
import { OnboardingWizardModal } from './components/tenant/OnboardingWizardModal';
import { NewTenantModal } from './components/superadmin/NewTenantModal';
import { Tenant } from './types';
import { detectPortalMode } from './utils/portalEnvironment';

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
  } = useStore();

  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
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

  // Separação de temas padronizada:
  // No Painel Master (porta 3005): utiliza adminThemeMode
  // No Portal do Lojista / Vitrine (porta 3006): utiliza themeMode
  const effectiveThemeMode = 
    portalMode === 'master' || viewRole === 'super_admin'
      ? adminThemeMode
      : themeMode;

  // Sincroniza classes no elemento <html> e <body> para garantir que o tema correto seja aplicado
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
      // Modo Escuro: Black Carbon (#0B0F12) padronizado em todos os sistemas
      body.style.backgroundColor = '#0B0F12';
      body.style.color = '#f5f5f5';
    }
  }, [effectiveThemeMode]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-accent', accentColor);
  }, [primaryColor, accentColor]);

  // Se estiver na porta 3005 (Master) e NÃO estiver autenticado:
  // Renderiza a página de login limpa e profissional, sem cabeçalhos ou controles duplicados!
  if (portalMode === 'master' && !isMasterAuthenticated) {
    return (
      <div className={`min-h-screen ${adminThemeMode === 'light' ? 'light' : 'dark'}`}>
        <MasterLoginView />
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
      
      {/* Cabeçalho Dedicado Conforme a Porta / Ambiente */}
      {portalMode === 'master' ? (
        <MasterHeader />
      ) : (
        <TenantHeader
          onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Visão do Master (Porta 3005) */}
        {portalMode === 'master' && (
          <SuperAdminDashboard
            onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
            onOpenOnboardingForTenant={handleOpenOnboardingForTenant}
          />
        )}

        {/* Visões do Lojista e Vitrine (Porta 3006) */}
        {portalMode === 'tenant' && (
          <>
            {viewRole === 'tenant_admin' && (
              <TenantDashboard
                onOpenOnboarding={() => {
                  setOnboardingTargetTenant(currentTenant);
                  setIsOnboardingModalOpen(true);
                }}
              />
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
              <StorefrontView />
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
