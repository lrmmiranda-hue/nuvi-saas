import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, TenantPlan } from '../../types';
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
  CreditCard,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Zap,
  QrCode,
  ShieldCheck,
  MessageCircle,
  RefreshCw,
  Repeat,
  MoreVertical,
  X,
  Check
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
    updateTenant,
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
  const [isPixKeyModalOpen, setIsPixKeyModalOpen] = useState(false);
  const [activeMenuTenantId, setActiveMenuTenantId] = useState<string | null>(null);

  const [masterPixKey, setMasterPixKey] = useState<string>(() => {
    try {
      return localStorage.getItem('nuvi_master_pix_key') || 'financeiro@nuvisaas.com.br';
    } catch {
      return 'financeiro@nuvisaas.com.br';
    }
  });
  const [tempPixKey, setTempPixKey] = useState('');

  // Modo de Exibição Unificado: 'table' (Tabela Compacta / Lista) ou 'grid_4' (Miniaturas em 4 Colunas)
  const [viewMode, setViewMode] = useState<'table' | 'grid_4'>(() => {
    try {
      const saved = localStorage.getItem('nuvi_master_unified_view_mode');
      return saved === 'grid_4' || saved === 'table' ? saved : 'table';
    } catch {
      return 'table';
    }
  });

  const handleSetViewMode = (mode: 'table' | 'grid_4') => {
    setViewMode(mode);
    try {
      localStorage.setItem('nuvi_master_unified_view_mode', mode);
    } catch {}
  };

  // Fecha o menu de ações ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setActiveMenuTenantId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Preços oficiais de referência dos planos
  const PLAN_PRICES: Record<string, number> = {
    vitrine: 49.90,
    balcao: 89.90,
    starter: 139.90,
    hibrido: 139.90,
    pro: 199.90,
    enterprise: 199.90
  };

  const PLAN_TITLES: Record<string, string> = {
    vitrine: 'Cardápio Digital (R$ 49,90)',
    balcao: 'Balcão & PDV (R$ 89,90)',
    starter: 'Delivery & Estoque (R$ 139,90)',
    hibrido: 'Delivery & Estoque (R$ 139,90)',
    pro: 'Nuvi Pro Total (R$ 199,90)',
    enterprise: 'Nuvi Pro Total (R$ 199,90)'
  };

  // Cálculo da assinatura e vencimento de cada loja
  const getTenantSubscriptionInfo = (tenant: Tenant) => {
    const now = new Date();
    const rawPrice = tenant?.monthlyPrice ?? PLAN_PRICES[tenant?.plan] ?? 139.90;
    const planPrice = typeof rawPrice === 'number' && !isNaN(rawPrice) ? rawPrice : 139.90;

    let expDate = new Date();
    try {
      if (tenant?.subscriptionExpiresAt) {
        const parsed = new Date(tenant.subscriptionExpiresAt);
        if (!isNaN(parsed.getTime())) {
          expDate = parsed;
        } else {
          expDate = new Date(now.getTime() + 7 * 86400000);
        }
      } else {
        const created = tenant?.createdAt ? new Date(tenant.createdAt) : now;
        const validCreated = !isNaN(created.getTime()) ? created : now;
        const days = tenant?.status === 'trial' ? 7 : 30;
        expDate = new Date(validCreated.getTime() + days * 86400000);
      }
    } catch {
      expDate = new Date(now.getTime() + 7 * 86400000);
    }

    const diffMs = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0;
    const isExpiringSoon = diffDays > 0 && diffDays <= 5;
    const isMonthlyAuto = (tenant.billingType || 'mensal') === 'mensal';

    return {
      expDate,
      diffDays: isNaN(diffDays) ? 0 : diffDays,
      isExpired,
      isExpiringSoon,
      isMonthlyAuto,
      planPrice,
      planTitle: PLAN_TITLES[tenant?.plan] || 'Plano Nuvi SaaS'
    };
  };

  // SaaS KPIs Unificados
  const totalStores = tenants.length;
  const activeStores = tenants.filter((t) => t.status === 'active' && !getTenantSubscriptionInfo(t).isExpired).length;
  const totalGMV = tenants.reduce((acc, t) => acc + (t.totalRevenue || 0), 0);
  const totalOrdersCount = tenants.reduce((acc, t) => acc + (t.ordersCount || 0), 0);

  // MRR real calculado a partir da soma dos planos das lojas ativas
  const realMRR = tenants.reduce((acc, t) => {
    const info = getTenantSubscriptionInfo(t);
    return acc + (t.status !== 'suspended' ? info.planPrice : 0);
  }, 0);

  // Contadores para os filtros rápidos
  const expiringCount = tenants.filter(t => {
    const info = getTenantSubscriptionInfo(t);
    return info.isExpiringSoon && t.status !== 'suspended';
  }).length;

  const expiredCount = tenants.filter(t => {
    const info = getTenantSubscriptionInfo(t);
    return info.isExpired && t.status !== 'suspended';
  }).length;

  const trialCount = tenants.filter(t => t.status === 'trial').length;
  const mensualCount = tenants.filter(t => (t.billingType || 'mensal') === 'mensal').length;
  const prepagoCount = tenants.filter(t => t.billingType === 'prepago').length;

  // Filtro inteligente de lojas
  const filteredTenants = tenants.filter((t) => {
    const q = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      (t.ownerName || '').toLowerCase().includes(q) ||
      (t.slug || '').toLowerCase().includes(q) ||
      (t.ownerPhone || '').includes(q) ||
      (t.whatsapp?.phoneNumber || '').includes(q) ||
      (t.address?.city || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const info = getTenantSubscriptionInfo(t);
    const billing = t.billingType || 'mensal';

    if (filterStatus === 'active') return t.status === 'active' && !info.isExpired;
    if (filterStatus === 'expiring') return info.isExpiringSoon && t.status !== 'suspended';
    if (filterStatus === 'expired') return info.isExpired && t.status !== 'suspended';
    if (filterStatus === 'trial') return t.status === 'trial';
    if (filterStatus === 'mensal') return billing === 'mensal';
    if (filterStatus === 'prepago') return billing === 'prepago';
    if (filterStatus === 'suspended') return t.status === 'suspended';

    return true;
  });

  // Acesso direto ao painel do lojista (Impersonate Master)
  const handleImpersonateTenant = (tenantId: string) => {
    const t = tenants.find(x => x.id === tenantId);
    if (t && typeof window !== 'undefined') {
      const rawSlug = t.slug || t.id;
      const cleanSlug = rawSlug.replace(/^\/+|\/+$/g, '');
      window.history.pushState(null, '', `/${cleanSlug}/painel`);
    }
    setCurrentTenantId(tenantId);
    setAuthenticatedTenantId(tenantId);
    setIsTenantAuthenticated(true);
    try {
      localStorage.setItem('nuvi_authenticated_store_v4', tenantId);
    } catch { }
    setViewRole('tenant_admin');
  };

  // Acesso direto à vitrine pública da loja
  const handleOpenStorefront = (tenantId: string) => {
    const t = tenants.find(x => x.id === tenantId);
    if (t && typeof window !== 'undefined') {
      const rawSlug = t.slug || t.id;
      const cleanSlug = rawSlug.replace(/^\/+|\/+$/g, '');
      window.history.pushState(null, '', `/${cleanSlug}/cardapio`);
    }
    setCurrentTenantId(tenantId);
    setViewRole('storefront');
  };

  const handleCopyStorefrontUrl = (tenant: Tenant) => {
    const slug = (tenant.slug || tenant.id).replace(/^\/+|\/+$/g, '');
    const url = buildStoreUrl('cardapio', slug);
    navigator.clipboard?.writeText(url);
    showAlert({
      title: 'Link da Vitrine Copiado! 🛍️',
      message: `O link oficial da vitrine de "${tenant.name}" foi copiado:\n\n${url}\n\nEnvie aos clientes para verem o cardápio e comprarem!`,
      variant: 'success'
    });
  };

  const handleCopyDashboardUrl = (tenant: Tenant) => {
    const slug = (tenant.slug || tenant.id).replace(/^\/+|\/+$/g, '');
    const url = buildStoreUrl('painel', slug);
    navigator.clipboard?.writeText(url);
    showAlert({
      title: 'Link do Painel Copiado! ⚙️',
      message: `O link do painel e PDV de "${tenant.name}" foi copiado:\n\n${url}\n\nEnvie ao lojista para acessar o sistema diretamente!`,
      variant: 'success'
    });
  };

  // Liberação de +30 Dias (Renovação manual / Pré-Pago / PIX)
  const handleLiberarPlano = (tenant: Tenant, dias: number = 30) => {
    const now = new Date();
    const info = getTenantSubscriptionInfo(tenant);
    const baseDate = info.isExpired ? now : info.expDate;
    const newExpDate = new Date(baseDate.getTime() + dias * 86400000);

    updateTenant(tenant.id, {
      status: 'active',
      subscriptionExpiresAt: newExpDate.toISOString(),
      lastPaymentDate: now.toISOString(),
      lastPaymentMethod: 'PIX',
    });

    showAlert({
      title: 'Plano Renovado com Sucesso! ⚡',
      message: `A loja "${tenant.name}" foi renovada por mais ${dias} dias!\n\nNovo vencimento: ${newExpDate.toLocaleDateString('pt-BR')}\nPagamento via PIX registrado no sistema.`,
      variant: 'success'
    });
  };

  // Alternar entre Plano Mensal (Renovação Automática) e Plano Pré-Pago
  const handleToggleBillingType = (tenant: Tenant) => {
    const currentType = tenant.billingType || 'mensal';
    const newType = currentType === 'mensal' ? 'prepago' : 'mensal';
    
    const updates: Partial<Tenant> = {
      billingType: newType,
    };

    if (newType === 'mensal') {
      const now = new Date();
      updates.status = 'active';
      const info = getTenantSubscriptionInfo(tenant);
      if (info.isExpired) {
        updates.subscriptionExpiresAt = new Date(now.getTime() + 30 * 86400000).toISOString();
      }
    }

    updateTenant(tenant.id, updates);

    showAlert({
      title: newType === 'mensal' ? 'Plano Mensal Automático Ativado! 🔄' : 'Plano Pré-Pago Ativado! ⚡',
      message: newType === 'mensal' 
        ? `A loja "${tenant.name}" agora opera no modelo Mensal (Renovação Automática Recorrente).`
        : `A loja "${tenant.name}" agora opera no modelo Pré-Pago (Renovação Manual a cada 30 dias via PIX).`,
      variant: 'success'
    });
  };

  // Envio de Cobrança PIX personalizada no WhatsApp
  const handleSendPixCobrançaWhatsApp = (tenant: Tenant) => {
    const info = getTenantSubscriptionInfo(tenant);
    const cleanPhone = (tenant.ownerPhone || tenant.whatsapp?.phoneNumber || '').replace(/\D/g, '');
    if (!cleanPhone) {
      showAlert({
        title: 'WhatsApp não informado',
        message: `O lojista de "${tenant.name}" não possui número de WhatsApp cadastrado.`,
        variant: 'warning'
      });
      return;
    }

    const texto = encodeURIComponent(
      `Olá ${tenant.ownerName || 'Lojista'}! 👋\n\n` +
      `Passando para avisar sobre a assinatura da sua loja *${tenant.name}* no sistema Nuvi:\n\n` +
      `📦 *Plano:* ${info.planTitle}\n` +
      `💰 *Valor:* R$ ${info.planPrice.toFixed(2).replace('.', ',')}\n` +
      `📅 *Vencimento:* ${info.expDate.toLocaleDateString('pt-BR')} ${info.isExpired ? '*(Vencido)*' : `*(Faltam ${info.diffDays} dias)*`}\n\n` +
      `Para liberar seus módulos (PDV, Mesas, Vitrine e WhatsApp), faça o pagamento via PIX:\n\n` +
      `🔑 *Chave PIX:* ${masterPixKey}\n` +
      `🏦 *Titular:* Nuvi SaaS Tecnologia\n\n` +
      `Assim que pagar, envie o comprovante por aqui para liberação imediata. Obrigado!`
    );

    const waUrl = cleanPhone.startsWith('55')
      ? `https://wa.me/${cleanPhone}?text=${texto}`
      : `https://wa.me/55${cleanPhone}?text=${texto}`;

    window.open(waUrl, '_blank');
  };

  const handleChangeTenantPlan = (tenantId: string, newPlan: TenantPlan) => {
    updateTenant(tenantId, {
      plan: newPlan,
      monthlyPrice: PLAN_PRICES[newPlan] || 139.90,
    });
    showAlert({
      title: 'Plano Alterado!',
      message: 'O plano do lojista foi atualizado com sucesso.',
      variant: 'success'
    });
  };

  const handleSaveMasterPixKey = () => {
    if (!tempPixKey.trim()) return;
    setMasterPixKey(tempPixKey.trim());
    try {
      localStorage.setItem('nuvi_master_pix_key', tempPixKey.trim());
    } catch {}
    setIsPixKeyModalOpen(false);
    showAlert({
      title: 'Chave PIX Atualizada! 🔑',
      message: 'Sua chave PIX foi configurada para todas as mensagens de cobrança.',
      variant: 'success'
    });
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Top Banner & KPIs */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        themeMode === 'light'
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'bg-[#11161B] border-[#1C2631] text-white shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                Super Admin Master
              </span>
              <span className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Painel Unificado: Lojas, Assinaturas & Planos de Cobrança
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Gestão Global de Estabelecimentos & Assinaturas
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Gerencie lojas, acompanhe renovações, alterne entre planos mensais ou pré-pagos e acesse painéis e vitrines em um só lugar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Botão Configurar Chave PIX */}
            <button
              type="button"
              onClick={() => {
                setTempPixKey(masterPixKey);
                setIsPixKeyModalOpen(true);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                themeMode === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-[#161D24] border-[#253342] text-slate-200 hover:text-white hover:bg-[#1E2732]'
              }`}
              title="Configurar a Chave PIX do Master usada nas mensagens de cobrança"
            >
              <QrCode className="w-4 h-4 text-emerald-500" />
              <span>Chave PIX Master</span>
            </button>

            {/* Botão Cadastrar Novo Estabelecimento */}
            <button
              type="button"
              onClick={onOpenNewTenantModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:shadow-sky-500/35 transition-all active:scale-[0.98] cursor-pointer bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border border-sky-400/30"
            >
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Cadastrar Estabelecimento</span>
            </button>
          </div>
        </div>

        {/* Global SaaS Metric Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t ${
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
              <span>{activeStores} com assinatura ativa</span>
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Volume Transacionado (GMV)</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className={`text-2xl font-black tabular-nums ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
              R$ {totalGMV.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-[11px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Vendas somadas de todas as lojas</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Pedidos Processados</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <p className={`text-2xl font-black tabular-nums ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalOrdersCount}</p>
            <p className={`text-[11px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Via PDV Balcão, Mesas e Vitrine</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0B0F12] border-[#1C2631]'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-xs font-semibold">Receita Recorrente (MRR)</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black tabular-nums text-blue-600 dark:text-blue-400">
              R$ {realMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
            </p>
            <p className={`text-[11px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {mensalCount} Mensais • {prepagoCount} Pré-Pagos
            </p>
          </div>

        </div>
      </div>

      {/* Toolbar Unificada: Filtros de Status, Busca e Alternador de Layout */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Pills de Filtro Rápido */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : themeMode === 'light'
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'bg-[#11161B] text-slate-400 border border-[#1C2631] hover:text-white'
              }`}
            >
              Todas ({tenants.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : themeMode === 'light'
                  ? 'bg-white text-emerald-700 border border-slate-200 hover:bg-emerald-50/50'
                  : 'bg-[#11161B] text-emerald-400 border border-[#1C2631] hover:text-white'
              }`}
            >
              Ativas ({activeStores})
            </button>

            {expiringCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterStatus('expiring')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 animate-pulse ${
                  filterStatus === 'expiring'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Vencendo ({expiringCount})</span>
              </button>
            )}

            {expiredCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterStatus('expired')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'expired'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Vencidas ({expiredCount})</span>
              </button>
            )}

            {trialCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterStatus('trial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterStatus === 'trial'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : themeMode === 'light'
                    ? 'bg-white text-purple-700 border border-slate-200 hover:bg-purple-50/50'
                    : 'bg-[#11161B] text-purple-400 border border-[#1C2631] hover:text-white'
                }`}
              >
                Trial ({trialCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilterStatus('mensal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                filterStatus === 'mensal'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : themeMode === 'light'
                  ? 'bg-white text-sky-700 border border-slate-200 hover:bg-sky-50/50'
                  : 'bg-[#11161B] text-sky-400 border border-[#1C2631] hover:text-white'
              }`}
            >
              <Repeat className="w-3 h-3" />
              <span>Mensal ({mensalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('prepago')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                filterStatus === 'prepago'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : themeMode === 'light'
                  ? 'bg-white text-amber-700 border border-slate-200 hover:bg-amber-50/50'
                  : 'bg-[#11161B] text-amber-400 border border-[#1C2631] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Pré-Pago ({prepagoCount})</span>
            </button>
          </div>

          {/* Lado Direito: Busca e Alternador de Modo */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, dono, telefone..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  themeMode === 'light'
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
                    : 'bg-[#11161B] border border-[#1C2631] text-white placeholder-slate-500'
                }`}
              />
            </div>

            {/* Alternador de Modo: Tabela Compacta vs 4 Colunas */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-[#151D24] border border-slate-300/80 dark:border-[#222E3A] shrink-0">
              <button
                type="button"
                onClick={() => handleSetViewMode('table')}
                title="Exibir em Tabela Compacta (Otimizada)"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabela Compacta</span>
              </button>

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
                <span className="hidden sm:inline">4 Colunas</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* MODO 1: TABELA COMPACTA UNIFICADA (LOJAS + ASSINATURAS + LINKS)  */}
      {/* ============================================================== */}
      {viewMode === 'table' ? (
        <div className={`rounded-2xl border overflow-hidden shadow-xs ${
          themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  themeMode === 'light' 
                    ? 'bg-slate-100/90 border-slate-200 text-slate-600' 
                    : 'bg-[#0B0F12] border-[#1C2631] text-slate-400'
                }`}>
                  <th className="py-3 px-3.5">Estabelecimento</th>
                  <th className="py-3 px-3.5">Responsável & Contato</th>
                  <th className="py-3 px-3.5">Plano Contratado</th>
                  <th className="py-3 px-3.5 text-center">Modelo de Cobrança</th>
                  <th className="py-3 px-3.5">Renovação & Vencimento</th>
                  <th className="py-3 px-3.5 text-center">Acessar Sistema</th>
                  <th className="py-3 px-3.5 text-right">Ações & Links</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                themeMode === 'light' ? 'divide-slate-200' : 'divide-[#1C2631]'
              }`}>
                {filteredTenants.map((tenant) => {
                  const subInfo = getTenantSubscriptionInfo(tenant);
                  const isMonthly = (tenant.billingType || 'mensal') === 'mensal';
                  const segConfig = tenant.businessSegment ? getSegmentById(tenant.businessSegment) : undefined;
                  const isMenuOpen = activeMenuTenantId === tenant.id;

                  return (
                    <tr
                      key={tenant.id}
                      className={`transition-colors ${
                        themeMode === 'light' 
                          ? 'hover:bg-slate-50/90 text-slate-800' 
                          : 'hover:bg-[#161D24] text-slate-200'
                      }`}
                    >
                      {/* 1. Estabelecimento */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-bold overflow-hidden shrink-0">
                            {tenant.branding?.logoUrl ? (
                              <img src={tenant.branding.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sky-500 text-xs font-black">{tenant.name.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className={`font-bold block truncate max-w-[170px] ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                              {tenant.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[170px]">
                              /{tenant.slug} • {segConfig?.shortLabel || 'Comércio'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Responsável & WhatsApp */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-0.5">
                          <span className={`block font-semibold text-xs ${themeMode === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                            {tenant.ownerName || 'Não informado'}
                          </span>
                          {tenant.whatsapp?.phoneNumber ? (
                            <a
                              href={`https://wa.me/55${tenant.whatsapp.phoneNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{tenant.whatsapp.phoneNumber}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sem telefone</span>
                          )}
                        </div>
                      </td>

                      {/* 3. Plano Contratado & Valor */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          <select
                            value={tenant.plan}
                            onChange={(e) => handleChangeTenantPlan(tenant.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              themeMode === 'light'
                                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                                : 'bg-[#151D24] border-[#253342] text-white focus:bg-[#1E2732]'
                            }`}
                          >
                            <option value="vitrine">🛍️ Cardápio Digital (R$ 49,90)</option>
                            <option value="balcao">⚡ Balcão & PDV (R$ 89,90)</option>
                            <option value="starter">📦 Delivery & Estoque (R$ 139,90)</option>
                            <option value="hibrido">📦 Delivery & Estoque (R$ 139,90)</option>
                            <option value="pro">👑 Nuvi Pro Total (R$ 199,90)</option>
                            <option value="enterprise">👑 Nuvi Pro Total (R$ 199,90)</option>
                          </select>
                          <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 block">
                            R$ {subInfo.planPrice.toFixed(2).replace('.', ',')}/mês
                          </span>
                        </div>
                      </td>

                      {/* 4. Modelo de Cobrança (Mensal Automático vs Pré-Pago) */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBillingType(tenant)}
                          title="Clique para alternar entre Plano Mensal (Recorrente) e Pré-Pago"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                            isMonthly
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                        >
                          {isMonthly ? (
                            <>
                              <Repeat className="w-3 h-3 animate-spin-slow" />
                              <span>Mensal Auto</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 text-amber-500" />
                              <span>Pré-Pago</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 5. Renovação & Vencimento */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {subInfo.isExpired ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Vencido há {Math.abs(subInfo.diffDays)}d</span>
                              </span>
                            ) : subInfo.isExpiringSoon ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" />
                                <span>Vence em {subInfo.diffDays}d</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{tenant.status === 'trial' ? 'Trial' : 'Ativo'} ({subInfo.diffDays}d)</span>
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-400 block font-mono">
                            Venc: {!isNaN(subInfo.expDate.getTime()) ? subInfo.expDate.toLocaleDateString('pt-BR') : 'A definir'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Acessar Sistema (Botões Diretos: Painel e Vitrine) */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Botão Acesso ao Painel */}
                          <button
                            type="button"
                            onClick={() => handleImpersonateTenant(tenant.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Acessar o Painel Administrativo e PDV desta loja"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Painel</span>
                          </button>

                          {/* Botão Acesso à Vitrine */}
                          <button
                            type="button"
                            onClick={() => handleOpenStorefront(tenant.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Visualizar a Vitrine e Cardápio Online dos clientes"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Vitrine</span>
                          </button>
                        </div>
                      </td>

                      {/* 7. Ações & Links Rápidos Compactos com Menu */}
                      <td className="py-3 px-3.5 text-right relative">
                        <div className="inline-flex items-center gap-1 action-menu-container">
                          
                          {/* Botão Rápido: Liberar +30 Dias (em destaque se for pré-pago ou vencendo) */}
                          <button
                            type="button"
                            onClick={() => handleLiberarPlano(tenant)}
                            title="Renovar por +30 dias via PIX"
                            className="px-2 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Zap className="w-3 h-3 fill-sky-500" />
                            <span className="hidden xl:inline">+30d</span>
                          </button>

                          {/* Ícone Rápido: Cobrança PIX WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleSendPixCobrançaWhatsApp(tenant)}
                            title="Enviar mensagem de cobrança PIX no WhatsApp do lojista"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Ícone Rápido: Copiar Link Vitrine */}
                          <button
                            type="button"
                            onClick={() => handleCopyStorefrontUrl(tenant)}
                            title="Copiar Link da Vitrine / Cardápio"
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              themeMode === 'light'
                                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                : 'bg-[#151D24] border-[#253342] text-slate-300 hover:text-white'
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Ícone Rápido: Copiar Link Painel */}
                          <button
                            type="button"
                            onClick={() => handleCopyDashboardUrl(tenant)}
                            title="Copiar Link do Painel do Lojista"
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              themeMode === 'light'
                                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                : 'bg-[#151D24] border-[#253342] text-slate-300 hover:text-white'
                            }`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão de Menu de Opções (Dropdown) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuTenantId(isMenuOpen ? null : tenant.id);
                              }}
                              title="Mais opções e configurações"
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isMenuOpen
                                  ? 'bg-blue-600 text-white border-blue-500'
                                  : themeMode === 'light'
                                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                  : 'bg-[#1E2732] border-[#2C3B4C] text-slate-300 hover:text-white'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu Flutuante */}
                            {isMenuOpen && (
                              <div className={`absolute right-0 top-8 z-50 w-52 rounded-xl p-1.5 border shadow-xl space-y-0.5 text-left ${
                                themeMode === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#151D24] border-[#2C3B4C] text-slate-200'
                              }`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleBillingType(tenant);
                                    setActiveMenuTenantId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/10 hover:text-blue-500 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Repeat className="w-3.5 h-3.5 text-blue-500" />
                                  <span>{isMonthly ? 'Mudar para Pré-Pago' : 'Mudar para Mensal Auto'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleLiberarPlano(tenant);
                                    setActiveMenuTenantId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Liberar +30 Dias PIX</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSendPixCobrançaWhatsApp(tenant);
                                    setActiveMenuTenantId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Cobrar via WhatsApp</span>
                                </button>

                                <div className="border-t border-slate-200 dark:border-neutral-700 my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenOnboardingForTenant(tenant);
                                    setActiveMenuTenantId(null);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-500/10 hover:text-sky-500 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                                  <span>Visual, Cores & Logo</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuTenantId(null);
                                    showConfirm({
                                      title: 'Excluir Estabelecimento',
                                      message: `Deseja realmente excluir a loja "${tenant.name}"?\nTodos os dados deste estabelecimento serão removidos.`,
                                      confirmText: 'Sim, excluir loja',
                                      cancelText: 'Cancelar',
                                      variant: 'danger',
                                      onConfirm: () => deleteTenant(tenant.id),
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir Estabelecimento</span>
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTenants.length === 0 && (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Store className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-700 dark:text-white">Nenhum estabelecimento encontrado</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Nenhuma loja corresponde ao filtro selecionado. Ajuste a busca ou cadastre um novo estabelecimento.
                </p>
                <button
                  type="button"
                  onClick={onOpenNewTenantModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo Estabelecimento</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* MODO 2: MINIATURAS (4 COLUNAS) UNIFICADAS                      */
        /* ============================================================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTenants.map((tenant) => {
            const subInfo = getTenantSubscriptionInfo(tenant);
            const isMonthly = (tenant.billingType || 'mensal') === 'mensal';
            const segConfig = tenant.businessSegment ? getSegmentById(tenant.businessSegment) : undefined;
            const isMenuOpen = activeMenuTenantId === tenant.id;

            return (
              <div
                key={tenant.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group shadow-sm ${
                  themeMode === 'light'
                    ? 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                    : 'bg-[#11161B] border-[#1C2631] hover:border-sky-500/40'
                }`}
              >
                {/* Header do Card */}
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

                  <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                    tenant.status === 'active' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-neutral-800 text-white'
                  }`}>
                    {tenant.plan}
                  </span>
                </div>

                {/* Corpo do Card com Dados de Renovação & Contato */}
                <div className="p-3.5 space-y-2.5 flex-1 text-xs">
                  
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

                  {/* Informações de Renovação & Modelo */}
                  <div className={`p-2.5 rounded-xl border space-y-1.5 text-[11px] ${
                    themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">Modelo:</span>
                      <button
                        type="button"
                        onClick={() => handleToggleBillingType(tenant)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          isMonthly
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                        title="Clique para alternar modelo"
                      >
                        {isMonthly ? '🔄 Mensal Auto' : '⚡ Pré-Pago'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">Vencimento:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {!isNaN(subInfo.expDate.getTime()) ? subInfo.expDate.toLocaleDateString('pt-BR') : 'A definir'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold">Status:</span>
                      {subInfo.isExpired ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                          Vencido ({Math.abs(subInfo.diffDays)}d)
                        </span>
                      ) : subInfo.isExpiringSoon ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                          Vence em {subInfo.diffDays}d
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Ativo ({subInfo.diffDays}d)
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Botões Diretos de Acesso: Painel e Vitrine */}
                <div className={`p-2 border-t flex items-center gap-1.5 ${
                  themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B0F12] border-[#1C2631]'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleImpersonateTenant(tenant.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Acessar o Painel Administrativo da loja"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Painel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenStorefront(tenant.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Abrir Vitrine Pública"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Vitrine</span>
                  </button>
                </div>

                {/* Barra de Ações Rápidas & Menu no Rodapé do Card */}
                <div className={`px-2 py-1.5 border-t flex items-center justify-between gap-1 text-xs relative action-menu-container ${
                  themeMode === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0B0F12]/80 border-[#1C2631]'
                }`}>
                  {/* Botão Rápido +30 Dias */}
                  <button
                    type="button"
                    onClick={() => handleLiberarPlano(tenant)}
                    title="Renovar por +30 dias via PIX"
                    className="py-1 px-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Zap className="w-2.5 h-2.5 fill-sky-500" />
                    <span>+30 Dias</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSendPixCobrançaWhatsApp(tenant)}
                      title="Enviar Cobrança PIX no WhatsApp"
                      className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyStorefrontUrl(tenant)}
                      title="Copiar Link da Vitrine"
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                    >
                      <Link2 className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyDashboardUrl(tenant)}
                      title="Copiar Link do Painel"
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuTenantId(isMenuOpen ? null : tenant.id);
                        }}
                        title="Mais opções"
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>

                      {isMenuOpen && (
                        <div className={`absolute right-0 bottom-8 z-50 w-48 rounded-xl p-1.5 border shadow-xl space-y-0.5 text-left ${
                          themeMode === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#151D24] border-[#2C3B4C] text-slate-200'
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              handleToggleBillingType(tenant);
                              setActiveMenuTenantId(null);
                            }}
                            className="w-full px-2 py-1 rounded-lg text-xs font-medium hover:bg-blue-500/10 hover:text-blue-500 flex items-center gap-2 cursor-pointer"
                          >
                            <Repeat className="w-3.5 h-3.5 text-blue-500" />
                            <span>{isMonthly ? 'Mudar para Pré-Pago' : 'Mudar para Mensal Auto'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onOpenOnboardingForTenant(tenant);
                              setActiveMenuTenantId(null);
                            }}
                            className="w-full px-2 py-1 rounded-lg text-xs font-medium hover:bg-sky-500/10 hover:text-sky-500 flex items-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            <span>Visual & Onboarding</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuTenantId(null);
                              showConfirm({
                                title: 'Excluir Estabelecimento',
                                message: `Deseja realmente excluir a loja "${tenant.name}"?`,
                                confirmText: 'Sim, excluir loja',
                                cancelText: 'Cancelar',
                                variant: 'danger',
                                onConfirm: () => deleteTenant(tenant.id),
                              });
                            }}
                            className="w-full px-2 py-1 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Loja</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Configurar Chave PIX do Master */}
      {isPixKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 ${
            themeMode === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#11161B] border-[#1C2631] text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Chave PIX do Master</h3>
                  <p className="text-[11px] text-slate-400">Usada nas mensagens de cobrança aos lojistas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPixKeyModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold block">
                Sua Chave PIX (CNPJ, Celular, E-mail ou Chave Aleatória):
              </label>
              <input
                type="text"
                value={tempPixKey}
                onChange={(e) => setTempPixKey(e.target.value)}
                placeholder="Ex: 11999998888 ou pix@suaempresa.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold outline-none border transition-all ${
                  themeMode === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                    : 'bg-[#161D24] border-[#253342] text-white focus:border-sky-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPixKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMasterPixKey}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md cursor-pointer"
              >
                Salvar Chave PIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações Master (Permissões, Preços dos 4 Planos e Promoções) */}
      <MasterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};