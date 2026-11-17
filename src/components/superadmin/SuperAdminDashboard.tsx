import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant } from '../../types';
import { buildStoreUrl } from '../../utils/routes';
import { getSegmentById } from '../../data/businessSegments';
import { MasterSettingsModal } from './MasterSettingsModal';
import { 
  Building2, 
  Store, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Smartphone,
  Eye,
  Settings,
  Sun,
  Moon,
  LogOut,
  Copy,
  Share2,
  Link2,
  Sliders,
  List,
  LayoutGrid,
  Phone,
  MapPin
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onOpenNewTenantModal: () => void;
  onOpenOnboardingForTenant: (tenant: Tenant) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onOpenNewTenantModal,
  onOpenOnboardingForTenant,
}) => {
  const {
    tenants,
    deleteTenant,
    setCurrentTenantId,
    setViewRole,
    showConfirm,
    showAlert,
    themeMode,
    toggleThemeMode,
    currentTenant,
    logoutMaster,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Modo de Exibição das Lojas: 'grid_4' (Miniaturas em 4 Colunas) ou 'list' (Lista)
  const [viewMode, setViewMode] = useState<'grid_4' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('nuvi_master_stores_view_mode');
      return saved === 'list' || saved === 'grid_4' ? saved : 'grid_4';
    } catch {
      return 'grid_4';
    }
  });

  const handleSetViewMode = (mode: 'grid_4' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('nuvi_master_stores_view_mode', mode);
    } catch {}
  };

  // SaaS KPIs
  const totalStores = tenants.length;
  const activeStores = tenants.filter((t) => t.status === 'active').length;
  const totalGMV = tenants.reduce((acc, t) => acc + (t.totalRevenue || 0), 0);
  const totalOrdersCount = tenants.reduce((acc, t) => acc + (t.ordersCount || 0), 0);

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleImpersonateTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setViewRole('tenant_admin');
  };

  const handleOpenStorefront = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setViewRole('storefront');
  };

  const handleCopyStorefrontUrl = (tenant: Tenant) => {
    const slug = tenant.slug || tenant.id;
    const url = buildStoreUrl('cardapio', slug);
    navigator.clipboard?.writeText(url);
    showAlert({
      title: 'Link da Vitrine Copiado!',
      message: `O link oficial do cardápio de "${tenant.name}" foi copiado:\n\n${url}\n\nEnvie este link para os clientes comprarem pelo WhatsApp e cardápio online!`,
      variant: 'success'
    });
  };

  const handleCopyDashboardUrl = (tenant: Tenant) => {
    const slug = tenant.slug || tenant.id;
    const url = buildStoreUrl('painel', slug);
    navigator.clipboard?.writeText(url);
    showAlert({
      title: 'Link do Painel Copiado!',
      message: `O link do painel e PDV de "${tenant.name}" foi copiado:\n\n${url}\n\nEnvie este link para o dono/gerente do estabelecimento acessar o sistema!`,
      variant: 'success'
    });
  };

  // Cores fixas oficiais da marca Nuvi para a Gestão do Painel Master
  const masterPrimaryColor = '#0284C7'; // Azul Nuvi
  const masterAccentColor = '#38BDF8';  // Ciano Claro Nuvi

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero SaaS Header: Cores Nuvi com Black Carbon */}
      <div className={`rounded-2xl border p-6 sm:p-8 transition-colors ${
        themeMode === 'light'
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : 'bg-[#11161B] border-[#1C2631] text-white shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded border ${
                themeMode === 'light'
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}>
                Painel Master Nuvi SaaS
              </span>
              <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Gestão Centralizada de Todas as Lojas & Estabelecimentos
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Administração Global de Clientes & Lojas
            </h1>
            <p className={`text-sm mt-1 max-w-2xl ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Cada contratante possui sua própria vitrine, catálogo de produtos/cardápio e regras de entrega 100% isoladas. Como administrador geral, você supervisiona todas as lojas criadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] cursor-pointer bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 shadow-xs"
            >
              <Settings className="w-4 h-4 text-sky-500 animate-[spin_12s_linear_infinite]" />
              <span>Configurações & Permissões</span>
            </button>

            <button
              onClick={onOpenNewTenantModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl !text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"
            >
              <Plus className="w-4 h-4 !text-white stroke-[2.5]" />
              <span className="!text-white">Cadastrar Novo Estabelecimento</span>
            </button>
          </div>
        </div>

        {/* Global SaaS Metric Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t ${
          themeMode === 'light' ? 'border-slate-200' : 'border-[#1C2631]'
        }`}>
          
          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Lojas Cadastradas</span>
              <Store className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-2xl font-black tabular-nums ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalStores}</p>
            <p className="text-[11px] text-blue-500 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>{activeStores} ativas em operação</span>
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Volume Total Transacionado (GMV)</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-2xl font-black tabular-nums ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
              R$ {totalGMV.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-[11px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Soma de vendas em todas as lojas</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Pedidos Processados</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <p className={`text-2xl font-black tabular-nums ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalOrdersCount}</p>
            <p className={`text-[11px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Via WhatsApp e Vitrine Web</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Receita de Assinaturas (MRR)</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400">
              R$ {(totalStores * 189).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
            </p>
            <p className={`text-[11px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Modelo recorrente Nuvi SaaS</p>
          </div>

        </div>
      </div>

      {/* Share Self-Service Register Link Card for Prospects / WhatsApp */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        themeMode === 'light'
          ? 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 shadow-2xs'
          : 'bg-gradient-to-r from-blue-950/25 via-[#11161B] to-transparent border-blue-500/25'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-bold ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Link de Cadastro para Enviar aos Lojistas
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase">
                Trial 7 Dias Grátis
              </span>
            </div>
            <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Envie este link no WhatsApp para lojistas e estabelecimentos criarem o próprio sistema sozinhos em 2 minutos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const url = `${window.location.origin}`;
              navigator.clipboard?.writeText(url);
              showAlert({
                title: 'Link Copiado com Sucesso!',
                message: 'O link de cadastro para lojistas foi copiado para a sua área de transferência. Agora é só colar no WhatsApp do seu cliente!',
                variant: 'success'
              });
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Link para WhatsApp</span>
          </button>

          <button
            onClick={() => setViewRole('register_tenant')}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              themeMode === 'light'
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
                : 'bg-[#11161B] border-[#1C2631] text-slate-300 hover:bg-[#161D24]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Testar Tela de Cadastro</span>
          </button>
        </div>
      </div>

      {/* Stores List Section */}
      <div className="space-y-4">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Lojas de Clientes
              </h2>
              <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                ({filteredTenants.length} exibidas)
              </span>
            </div>

            {/* Alternador de Modo: Miniaturas com 4 Colunas vs Lista */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-[#151D24] border border-slate-300/80 dark:border-[#222E3A]">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid_4')}
                title="Exibir em Miniaturas com 4 Colunas"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid_4'
                    ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Miniaturas (4 Colunas)</span>
                <span className="sm:hidden">4 Colunas</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                title="Exibir em Lista"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, dono ou cidade..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  themeMode === 'light'
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                    : 'bg-[#11161B] border border-[#1C2631] text-white placeholder-slate-500'
                }`}
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white border border-slate-300 text-slate-900 shadow-2xs'
                  : 'bg-[#11161B] border border-[#1C2631] text-slate-200'
              }`}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="trial">Em Teste / Trial</option>
              <option value="suspended">Suspensas</option>
            </select>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODO 1: MINIATURAS COM 4 COLUNAS                               */}
        {/* ============================================================== */}
        {viewMode === 'grid_4' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTenants.map((tenant) => {
              const segConfig = tenant.businessSegment ? getSegmentById(tenant.businessSegment) : undefined;
              const planBadgeColor: Record<string, string> = {
                starter: 'bg-neutral-800 text-neutral-300',
                pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                enterprise: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
              };

              return (
                <div
                  key={tenant.id}
                  className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group shadow-sm ${
                    themeMode === 'light'
                      ? 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                      : 'bg-[#11161B] border-[#1C2631] hover:border-sky-500/40'
                  }`}
                >
                  {/* Store Visual Header Compacto */}
                  <div 
                    className={`p-3 relative flex items-center justify-between border-b ${
                      themeMode === 'light'
                        ? 'bg-gradient-to-r from-slate-100 via-slate-100 to-slate-200/60 border-slate-200'
                        : 'bg-gradient-to-r from-[#0B0F12] via-[#11161B] to-[#161D24] border-[#1C2631]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {tenant.branding.logoUrl ? (
                        <div className={`w-8 h-8 rounded-lg border p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden ${
                          themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-neutral-950 border-neutral-800'
                        }`}>
                          <img
                            src={tenant.branding.logoUrl}
                            alt={tenant.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                          style={{ backgroundColor: tenant.branding?.primaryColor || '#0284C7' }}
                        >
                          {segConfig?.emoji || tenant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-bold text-xs truncate ${
                          themeMode === 'light' ? 'text-slate-900' : 'text-white'
                        }`} title={tenant.name}>
                          {tenant.name}
                        </h3>
                        <p className={`text-[10px] truncate ${
                          themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {segConfig?.shortLabel || 'Comércio'} • {tenant.address.city}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full shrink-0 ${planBadgeColor[tenant.plan] || 'bg-neutral-800 text-white'}`}>
                      {tenant.plan}
                    </span>
                  </div>

                  {/* Store Body Data Compacto */}
                  <div className="p-3.5 space-y-3 flex-1 text-xs">
                    
                    {/* Responsável & WhatsApp */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>Dono:</span>
                        <span className={`font-semibold truncate max-w-[130px] ${themeMode === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                          {tenant.ownerName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>WhatsApp:</span>
                        <a 
                          href={`https://wa.me/55${tenant.whatsapp.phoneNumber.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono font-medium text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          {tenant.whatsapp.phoneNumber}
                        </a>
                      </div>
                    </div>

                    {/* Metrics Grid Compacto */}
                    <div className={`grid grid-cols-2 gap-1.5 p-2 rounded-xl border text-[11px] ${
                      themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
                    }`}>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block">Vendas</span>
                        <p className={`font-black tabular-nums ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          R$ {(tenant.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block">Pedidos</span>
                        <p className="font-black text-emerald-500 tabular-nums">
                          {tenant.ordersCount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Onboarding Status */}
                    {!tenant.onboardingCompleted ? (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-500 font-medium">Config Inicial Pendente</span>
                        <button
                          onClick={() => onOpenOnboardingForTenant(tenant)}
                          className="font-bold text-emerald-600 dark:text-emerald-400 underline cursor-pointer"
                        >
                          Iniciar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>Loja configurada</span>
                      </div>
                    )}

                  </div>

                  {/* Links Rápidos de Compartilhamento */}
                  <div className={`px-2.5 py-1.5 border-t flex items-center justify-between gap-1.5 text-xs ${
                    themeMode === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0B0F12]/80 border-[#1C2631]'
                  }`}>
                    <button
                      onClick={() => handleCopyStorefrontUrl(tenant)}
                      title="Copiar link da vitrine/cardápio para WhatsApp"
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-[10px] transition-all cursor-pointer"
                    >
                      <Link2 className="w-2.5 h-2.5" />
                      <span>Vitrine</span>
                    </button>

                    <button
                      onClick={() => handleCopyDashboardUrl(tenant)}
                      title="Copiar link do painel e PDV para o lojista"
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-[10px] transition-all cursor-pointer"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Painel</span>
                    </button>
                  </div>

                  {/* Card Actions Footer Compacto */}
                  <div className={`p-2 border-t flex items-center gap-1.5 ${
                    themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
                  }`}>
                    <button
                      onClick={() => handleImpersonateTenant(tenant.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold text-[11px] transition-all cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Acessar</span>
                    </button>

                    <button
                      onClick={() => handleOpenStorefront(tenant.id)}
                      title="Abrir Vitrine Pública"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        themeMode === 'light' 
                          ? 'bg-neutral-200/70 hover:bg-neutral-300 text-neutral-700' 
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenOnboardingForTenant(tenant)}
                      title="Configurações e Cores"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    </button>

                    <button
                      onClick={() => {
                        showConfirm({
                          title: 'Excluir Estabelecimento',
                          message: `Deseja realmente excluir a loja "${tenant.name}"?\nTodos os produtos e pedidos deste estabelecimento serão apagados permanentemente.`,
                          confirmText: 'Sim, excluir loja',
                          cancelText: 'Cancelar',
                          variant: 'danger',
                          onConfirm: () => deleteTenant(tenant.id),
                        });
                      }}
                      title="Excluir Loja"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================== */
          /* MODO 2: LISTA DE LOJAS DOS CLIENTES                            */
          /* ============================================================== */
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${
            themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    themeMode === 'light' 
                      ? 'bg-slate-100/80 border-slate-200 text-slate-500' 
                      : 'bg-[#0E1318] border-[#1C2631] text-slate-400'
                  }`}>
                    <th className="py-3 px-4">Estabelecimento / Ramo</th>
                    <th className="py-3 px-4">Responsável & WhatsApp</th>
                    <th className="py-3 px-4">Plano & Status</th>
                    <th className="py-3 px-4">Vendas & Pedidos</th>
                    <th className="py-3 px-4 text-center">Links Rápidos</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  themeMode === 'light' ? 'divide-slate-200' : 'divide-[#1C2631]'
                }`}>
                  {filteredTenants.map((tenant) => {
                    const segConfig = tenant.businessSegment ? getSegmentById(tenant.businessSegment) : undefined;
                    const planBadgeColor: Record<string, string> = {
                      starter: 'bg-neutral-800 text-neutral-300',
                      pro: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                      enterprise: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
                    };

                    return (
                      <tr 
                        key={tenant.id}
                        className={`transition-colors ${
                          themeMode === 'light' 
                            ? 'hover:bg-slate-50/80 text-slate-800' 
                            : 'hover:bg-[#161D24] text-slate-200'
                        }`}
                      >
                        {/* Loja & Segmento */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs"
                              style={{ backgroundColor: tenant.branding?.primaryColor || '#0284C7' }}
                            >
                              {segConfig?.emoji || tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold text-xs truncate max-w-[180px] ${
                                themeMode === 'light' ? 'text-slate-900' : 'text-white'
                              }`}>
                                {tenant.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                {segConfig?.shortLabel || 'Comércio'} • {tenant.address.city} - {tenant.address.neighborhood}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Dono & WhatsApp */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-xs">{tenant.ownerName}</p>
                          <a 
                            href={`https://wa.me/55${tenant.whatsapp.phoneNumber.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{tenant.whatsapp.phoneNumber}</span>
                          </a>
                        </td>

                        {/* Plano & Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full inline-block ${planBadgeColor[tenant.plan] || 'bg-neutral-800 text-white'}`}>
                              {tenant.plan}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="capitalize">{tenant.status}</span>
                            </div>
                          </div>
                        </td>

                        {/* Vendas & Pedidos */}
                        <td className="py-3.5 px-4 tabular-nums">
                          <p className={`font-black text-xs ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            R$ {(tenant.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[11px] text-emerald-500 font-semibold">
                            {tenant.ordersCount || 0} pedidos
                          </p>
                        </td>

                        {/* Links Rápidos */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyStorefrontUrl(tenant)}
                              title="Copiar link da vitrine para mandar aos clientes"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Vitrine</span>
                            </button>

                            <button
                              onClick={() => handleCopyDashboardUrl(tenant)}
                              title="Copiar link do painel do lojista"
                              className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Painel</span>
                            </button>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleImpersonateTenant(tenant.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Acessar</span>
                            </button>

                            <button
                              onClick={() => handleOpenStorefront(tenant.id)}
                              title="Ver Vitrine"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                themeMode === 'light' ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-neutral-800 text-slate-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenOnboardingForTenant(tenant)}
                              title="Configurações e Cores"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                themeMode === 'light' ? 'hover:bg-slate-200 text-sky-600' : 'hover:bg-neutral-800 text-sky-400'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                showConfirm({
                                  title: 'Excluir Estabelecimento',
                                  message: `Deseja realmente excluir a loja "${tenant.name}"?\nTodos os produtos e pedidos deste estabelecimento serão apagados permanentemente.`,
                                  confirmText: 'Sim, excluir loja',
                                  cancelText: 'Cancelar',
                                  variant: 'danger',
                                  onConfirm: () => deleteTenant(tenant.id),
                                });
                              }}
                              title="Excluir Loja"
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredTenants.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#11161B] border border-[#1C2631] space-y-3">
            <Store className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum estabelecimento encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Nenhuma loja corresponde ao termo pesquisado. Crie uma nova loja ou limpe o filtro.
            </p>
            <button
              onClick={onOpenNewTenantModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Nova Loja
            </button>
          </div>
        )}

      </div>

      {/* White-Label Sales Engine Info Strip */}
      <div className={`rounded-2xl border p-6 space-y-4 ${
        themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
      }`}>
        <h3 className={`text-sm font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
          <Sparkles className="w-4 h-4 text-sky-400" />
          Como Funciona o Modelo White-Label Multi-Segmentos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <h4 className={`font-semibold mb-1 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>1. Isolamento Total de Dados</h4>
            <p className={themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}>
              Cada contratante só enxerga seus próprios clientes, pedidos e produtos. Estabelecimentos concorrentes nunca compartilham catálogo nem faturamento.
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <h4 className={`font-semibold mb-1 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>2. Customização Visual por Loja</h4>
            <p className={themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}>
              O lojista escolhe logo, paleta de cores, banner, segmento de mercado e regras de entrega. A vitrine reflete 100% a identidade da marca.
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <h4 className={`font-semibold mb-1 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>3. Pedidos via WhatsApp Direto</h4>
            <p className={themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}>
              O cliente final faz o pedido na vitrine ou o operador vende no PDV Balcão com despacho ágil e recibo pronto para WhatsApp e impressora térmica.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Configurações Master (Permissões, Preços dos 4 Planos e Promoções) */}
      <MasterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
