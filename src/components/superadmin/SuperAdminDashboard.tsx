import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant } from '../../types';
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
  Share2
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

          <div className="flex items-center gap-3 shrink-0">
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
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-bold ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Lojas de Clientes
            </h2>
            <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              ({filteredTenants.length} exibidas)
            </span>
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

        {/* Tenant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTenants.map((tenant) => {
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
                    ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                    : 'bg-[#11161B] border-[#1C2631] hover:border-blue-500/40'
                }`}
              >
                {/* Store Visual Header - Padronizado em Azul / Cinza Gelo / Black Carbon */}
                <div 
                  className={`h-20 p-4 relative flex items-center justify-between border-b ${
                    themeMode === 'light'
                      ? 'bg-gradient-to-r from-slate-100 via-slate-100 to-slate-200/60 border-slate-200'
                      : 'bg-gradient-to-r from-[#0B0F12] via-[#11161B] to-[#161D24] border-[#1C2631]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tenant.branding.logoUrl ? (
                      <div className={`w-10 h-10 rounded-xl border p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden ${
                        themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-neutral-950 border-neutral-800'
                      }`}>
                        <img
                          src={tenant.branding.logoUrl}
                          alt={tenant.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-500/40 flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0">
                        {tenant.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm truncate max-w-[170px] ${
                        themeMode === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        {tenant.name}
                      </h3>
                      <p className={`text-[11px] truncate max-w-[180px] ${
                        themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {tenant.address.city} - {tenant.address.neighborhood}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${planBadgeColor[tenant.plan] || 'bg-neutral-800 text-white'}`}>
                    {tenant.plan}
                  </span>
                </div>

                {/* Store Body Data */}
                <div className="p-5 space-y-4 flex-1">
                  
                  {/* Slogan */}
                  <p className={`text-xs line-clamp-2 min-h-[32px] ${
                    themeMode === 'light' ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    {tenant.slogan || 'Sem slogan cadastrado'}
                  </p>

                  {/* Owner & WhatsApp */}
                  <div className={`space-y-1.5 text-xs border-t pt-3 ${
                    themeMode === 'light' ? 'text-neutral-700 border-neutral-200' : 'text-neutral-300 border-neutral-800/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={themeMode === 'light' ? 'text-neutral-500' : 'text-neutral-500'}>Responsável:</span>
                      <span className={`font-medium ${themeMode === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>{tenant.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeMode === 'light' ? 'text-neutral-500' : 'text-neutral-500'}>WhatsApp:</span>
                      <span className={`font-mono ${themeMode === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>{tenant.whatsapp.phoneNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeMode === 'light' ? 'text-neutral-500' : 'text-neutral-500'}>Taxa de Entrega:</span>
                      <span className={`font-mono ${themeMode === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>R$ {tenant.address.standardDeliveryFee.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl border text-xs ${
                    themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
                  }`}>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Vendas Totais</span>
                      <p className={`font-bold tabular-nums mt-0.5 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        R$ {(tenant.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Pedidos</span>
                      <p className="font-bold text-emerald-500 tabular-nums mt-0.5">
                        {tenant.ordersCount || 0} feitos
                      </p>
                    </div>
                  </div>

                  {/* Onboarding Status */}
                  {!tenant.onboardingCompleted ? (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-medium">Onboarding Pendente</span>
                      </div>
                      <button
                        onClick={() => onOpenOnboardingForTenant(tenant)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 underline hover:opacity-80"
                      >
                        Iniciar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Configuração inicial concluída</span>
                    </div>
                  )}

                </div>

                {/* Card Actions Footer */}
                <div className={`p-3 border-t flex items-center gap-2 ${
                  themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
                }`}>
                  <button
                    onClick={() => handleImpersonateTenant(tenant.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Acessar Painel</span>
                  </button>

                  <button
                    onClick={() => handleOpenStorefront(tenant.id)}
                    title="Abrir Vitrine Pública da Adega"
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      themeMode === 'light' 
                        ? 'bg-neutral-200/70 hover:bg-neutral-300 text-neutral-700' 
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenOnboardingForTenant(tenant)}
                    title="Editar Passo a Passo / Configurações"
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
                    title="Excluir Estabelecimento"
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

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
    </div>
  );
};
