import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, BusinessSegmentType } from '../../types';
import { BUSINESS_SEGMENTS, getSegmentById } from '../../data/businessSegments';
import { NuviLogo } from '../common/NuviLogo';
import { PlansComparisonTable } from '../common/PlansComparisonTable';
import {
  Store,
  User,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  Check,
  Search,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  Barcode,
  Boxes,
  ShoppingCart,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Info,
  CreditCard
} from 'lucide-react';

interface TenantRegisterViewProps {
  onSuccess: (newTenant: Tenant) => void;
}

export const TenantRegisterView: React.FC<TenantRegisterViewProps> = ({ onSuccess }) => {
  const {
    createTenant,
    setCurrentTenantId,
    setViewRole,
    themeMode,
    toggleThemeMode,
    showAlert,
    globalConfig,
    tenants
  } = useStore();

  const isLight = true;

  // Ramo selecionado (padrão: adega)
  const [selectedSegment, setSelectedSegment] = useState<BusinessSegmentType>('adega');
  const currentSegmentConfig = getSegmentById(selectedSegment);

  // Plano selecionado e modal de consulta
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_nuvi_pro');
  const [isPlansInfoModalOpen, setIsPlansInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<'table' | 'cards'>('table');

  // Estados do Filtro de Ramo no Celular (conforme Imagem 2)
  const [isBranchFilterOpen, setIsBranchFilterOpen] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  // Form fields (para o computador e mobile)
  const [storeName, setStoreName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Os 4 Planos Oficiais do Nuvi SaaS com preços integrados às configurações globais (filtrados pelos que estão ativos no Master)
  const officialNuviPlans = [
    {
      id: 'plan_cardapio',
      tenantPlan: 'vitrine' as const,
      name: 'Cardápio QR Code Mesas',
      badge: 'Básico / QR Mesas',
      tag: 'Mesas & QR',
      price: globalConfig?.plans?.find(p => p.id === 'plan_cardapio')?.price ?? 49.90,
      description: 'Acesso exclusivo a cardápio digital de mesa para clientes visualizarem via QR Code, sem PDV balcão.',
      icon: '📱'
    },
    {
      id: 'plan_balcao_pdv',
      tenantPlan: 'balcao' as const,
      name: 'Balcão & PDV Caixa Rápido',
      badge: 'Frente de Caixa',
      tag: 'PDV & Balcão',
      price: globalConfig?.plans?.find(p => p.id === 'plan_balcao_pdv')?.price ?? 89.90,
      description: 'Frente de Caixa (PDV) ultra-rápida no toque e bipe de leitor USB/Bluetooth para registrar vendas ágeis no balcão.',
      icon: '⚡'
    },
    {
      id: 'plan_delivery_estoque',
      tenantPlan: 'starter' as const,
      name: 'Delivery & Estoque Profissional',
      badge: 'Profissional',
      tag: 'Estoque & Frete',
      price: globalConfig?.plans?.find(p => p.id === 'plan_delivery_estoque')?.price ?? 139.90,
      description: 'Controle de estoque em tempo real com baixa automática, alerta de reposição e frete calculado por raio em KM.',
      icon: '📦'
    },
    {
      id: 'plan_nuvi_pro',
      tenantPlan: 'pro' as const,
      name: 'Nuvi Pro Total (Completo)',
      badge: 'Mais Recomendado',
      tag: 'Tudo Incluso',
      price: globalConfig?.plans?.find(p => p.id === 'plan_nuvi_pro')?.price ?? 199.90,
      description: 'A solução definitiva sem limites: Frente de Caixa (PDV) + Vitrine Web + Estoque Automático + Delivery + Gestão Financeira.',
      icon: '👑'
    }
  ].filter(p => {
    const configPlan = globalConfig?.plans?.find(cp => cp.id === p.id);
    return configPlan ? configPlan.active !== false : true;
  });

  const currentSelectedPlan = officialNuviPlans.find(p => p.id === selectedPlanId) || officialNuviPlans[0] || {
    id: 'plan_nuvi_pro',
    tenantPlan: 'pro' as const,
    name: 'Nuvi Pro Total (Completo)',
    badge: 'Mais Recomendado',
    tag: 'Tudo Incluso',
    price: 199.90,
    description: 'A solução definitiva sem limites.',
    icon: '👑'
  };

  // Lista de ramos filtrados para a busca no celular (Imagem 2)
  const filteredBranches = BUSINESS_SEGMENTS.filter(seg =>
    seg.title.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    seg.shortLabel.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    seg.pitch.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Se for no desktop com formulário completo e faltar dados obrigatórios
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobileView && (!storeName.trim() || !ownerName.trim() || !whatsappNumber.trim() || !password.trim())) {
      showAlert({
        title: 'Campos Obrigatórios',
        message: 'Por favor, preencha o nome do seu comércio, seu nome, seu WhatsApp e defina sua senha de acesso para continuar.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const finalStoreName = storeName.trim() || currentSegmentConfig.title;

      const cleanSlug = finalStoreName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `${selectedSegment}-${Date.now().toString().slice(-4)}`;

      const existingSlug = tenants.some(t => (t.slug || '').toLowerCase() === cleanSlug.toLowerCase());
      const finalSlug = existingSlug ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

      const newTenant = createTenant({
        name: finalStoreName,
        slug: finalSlug,
        businessSegment: selectedSegment,
        slogan: slogan.trim() || currentSegmentConfig.sloganExample,
        ownerName: ownerName.trim() || 'Comerciante',
        whatsapp: {
          phoneNumber: whatsappNumber.replace(/\D/g, '') || '11999999999',
          enableWhatsAppOrders: true,
          orderTemplate: '',
          statusUpdateTemplate: '',
          welcomeMessage: `Olá! Seja bem-vindo à ${finalStoreName}. Como posso te ajudar hoje?`,
          supportLinkEnabled: true,
        },
        address: {
          street: 'A definir',
          number: 'S/N',
          neighborhood: neighborhood.trim() || 'Centro',
          city: city.trim() || 'São Paulo',
          state: 'SP',
          zip: '00000-000',
          deliveryRadiusKm: 10,
          minimumOrder: 20,
          standardDeliveryFee: 7.00,
          freeDeliveryThreshold: 100.00,
          allowPickup: true,
          openingHours: 'Seg a Dom: 10h às 23h',
        },
        plan: currentSelectedPlan.tenantPlan,
        status: 'trial',
        adminPassword: password.trim() || 'admin',
        onboardingCompleted: false, // Abre o Passo a Passo de Configuração Inicial automaticamente!
        branding: {
          logoUrl: '',
          bannerUrl: currentSegmentConfig.bannerUrl,
          primaryColor: currentSegmentConfig.primaryColor,
          accentColor: currentSegmentConfig.accentColor,
          themeStyle: currentSegmentConfig.themeStyle,
          badgeNotice: currentSegmentConfig.badgeNotice,
          colorMode: 'dark',
        },
        config: {
          enablePhysicalStore: selectedPlanId !== 'plan_cardapio',
          enableOnlineSales: selectedPlanId !== 'plan_balcao_pdv',
          enableStockControl: selectedPlanId === 'plan_delivery_estoque' || selectedPlanId === 'plan_nuvi_pro',
          acceptPix: true,
          acceptCard: true,
          acceptCash: true,
          allowOrdersWhenClosed: false,
          soundAlerts: true,
        }
      });

      setIsSubmitting(false);
      setCurrentTenantId(newTenant.id);
      setViewRole('tenant_admin');
      onSuccess(newTenant);
    }, 400);
  };

  return (
    <div className={`min-h-[92vh] py-6 sm:py-8 px-3 sm:px-4 flex flex-col justify-center items-center transition-colors relative ${
      isLight ? 'bg-slate-50/80' : 'bg-transparent'
    }`}>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Coluna Esquerda (ou Topo no Celular): Apresentação com Identidade Visual Nuvi Master */}
        <div className="w-full lg:col-span-5 space-y-6 text-left lg:sticky lg:top-8">

          {/* Logo Nuvi em Destaque à Esquerda */}
          <div className="pb-1">
            <NuviLogo size="lg" isLight={true} showSubtitle={false} />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Experimente Grátis por 7 Dias</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              A plataforma definitiva para o seu comércio crescer.
            </h1>

            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Frente de Caixa (PDV), controle de estoque inteligente com leitura de código de barras e vitrine digital integrada ao WhatsApp.
            </p>
          </div>

          {/* Destaque Dinâmico do Segmento Atual com Paleta Nuvi */}
          <div className={`p-4 rounded-2xl border space-y-2 text-xs transition-all ${
            isLight
              ? 'bg-sky-50/70 border-sky-200 text-slate-800 shadow-xs'
              : 'bg-[#0E1520] border-sky-900/40 text-slate-200 shadow-md'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 text-sm">
              <span className="text-2xl">{currentSegmentConfig.emoji}</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{currentSegmentConfig.title}</span>
            </div>
            <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
              {currentSegmentConfig.pitch}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
              <span className="bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                📦 {currentSegmentConfig.packTerm}
              </span>
              <span>•</span>
              <span className="bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                ⚡ Pedidos no WhatsApp
              </span>
            </div>
          </div>

          {/* Funcionalidades com Estilo Nuvi Master */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                <Barcode className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Frente de Caixa Balcão (PDV Ágil)
                </h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Bipe produtos via código de barras USB ou venda rápida no toque. Venda no balcão e mesas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Estoque em Tempo Real & Margem de Lucro
                </h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Baixa automática a cada venda, alerta de reposição e importação fácil de planilhas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Cardápio & Vitrine Online com Pedidos no WhatsApp
                </h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Link exclusivo para compartilhar no Instagram e WhatsApp. Zero taxas de comissão.
                </p>
              </div>
            </div>
          </div>

          {/* Selo de Segurança & Botão de Informações dos Planos */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-600 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631] text-slate-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
              <span>Sem necessidade de cartão de crédito. Configure seu sistema em menos de 2 minutos!</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPlansInfoModalOpen(true)}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 shadow-xs'
                  : 'bg-[#142334] hover:bg-[#1a2f45] text-sky-300 border-sky-500/30'
              }`}
            >
              <Info className="w-4 h-4 text-sky-500" />
              <span>Informações dos Planos</span>
            </button>
          </div>

        </div>

        {/* Coluna Direita: Formulário de Cadastro */}
        <div className="lg:col-span-7 w-full">
          <div className={`p-5 sm:p-8 rounded-3xl border shadow-2xl text-left transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-sky-900/5'
              : 'bg-[#0E1318] border-sky-950/60 shadow-black/80'
          }`}>

            {/* Cabeçalho do Card */}
            <div className="mb-5 border-b pb-4 border-slate-200 dark:border-[#1C2631]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Cadastre o seu Comércio
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    {currentSegmentConfig.shortLabel}
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Escolha o segmento e ative seu painel de vendas e vitrine.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ======================================================== */}
              {/* 1. SELETOR DE RAMO NO COMPUTADOR: Grid 3x3 como estava antes */}
              {/* ======================================================== */}
              <div className="hidden md:block space-y-2">
                <label className={`block text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  1. Qual é o ramo da sua loja? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUSINESS_SEGMENTS.map((seg) => {
                    const isSelected = selectedSegment === seg.id;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setSelectedSegment(seg.id)}
                        className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 outline-none ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white shadow-md shadow-[#0C2340]/40 border-0'
                            : isLight
                            ? 'bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 text-slate-700'
                            : 'bg-[#121820] hover:bg-[#182230] border border-[#1C2631] hover:border-sky-800 text-slate-300'
                        }`}
                        >
                        <div className="flex items-center justify-between">
                          <span className="text-xl leading-none">{seg.emoji}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          )}
                        </div>
                        <span className={`text-[11px] leading-tight line-clamp-1 ${
                          isSelected
                            ? 'text-white font-bold'
                            : ''
                        }`}>
                          {seg.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ======================================================== */}
              {/* 1. SELETOR DE RAMO NO CELULAR: Filtro Dropdown conforme Imagem 2 */}
              {/* ======================================================== */}
              <div className="md:hidden space-y-2">
                <label className={`block text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  1. Escolha o ramo da sua loja: *
                </label>

                {/* Botão Gatilho do Dropdown */}
                <button
                  type="button"
                  onClick={() => setIsBranchFilterOpen(!isBranchFilterOpen)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isBranchFilterOpen
                      ? isLight
                        ? 'bg-slate-100/90 border-slate-300 text-slate-800'
                        : 'bg-[#151F2C] border-[#223142] text-white'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-[#0E1520] border-[#1C2631] text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none">{currentSegmentConfig.emoji}</span>
                    <div className="text-left">
                      <span className="font-bold text-xs block text-slate-900 dark:text-white">
                        {currentSegmentConfig.title}
                      </span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Toque para filtrar outro ramo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                      Selecionado
                    </span>
                    <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${isBranchFilterOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Painel do Filtro conforme Imagem 2 (Sem bordas azuis pesadas no celular) */}
                {isBranchFilterOpen && (
                  <div className={`p-3 rounded-2xl border shadow-xl space-y-2.5 transition-all ${
                    isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#0E1520] border-[#1C2631] shadow-black/80'
                  }`}>
                    {/* Input de Busca com borda suave e ícone de lupa */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={branchSearchQuery}
                        onChange={(e) => setBranchSearchQuery(e.target.value)}
                        placeholder="Digite para buscar ramo (ex: Adega, Pizzaria)..."
                        className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium outline-none border focus:border-sky-500 transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                            : 'bg-[#080E17] border-[#1C2631] text-white placeholder-slate-500'
                        }`}
                        autoFocus
                      />
                      {branchSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBranchSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Cabeçalho da Lista: Marcar exibidos (conforme imagem 2) */}
                    <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Marcar ramo exibido ({filteredBranches.length})</span>
                    </div>

                    {/* Lista vertical rolável com barra de scroll e checkboxes brancos */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                      {filteredBranches.map((seg) => {
                        const isSelected = selectedSegment === seg.id;
                        return (
                          <button
                            key={seg.id}
                            type="button"
                            onClick={() => {
                              setSelectedSegment(seg.id);
                              setIsBranchFilterOpen(false);
                              setBranchSearchQuery('');
                            }}
                            className={`w-full p-2.5 rounded-lg flex items-center gap-3 text-left transition-colors cursor-pointer ${
                              isSelected
                                ? isLight
                                  ? 'bg-blue-50 text-blue-900 font-bold'
                                  : 'bg-blue-600/20 text-white font-bold'
                                : isLight
                                ? 'hover:bg-slate-100 text-slate-700'
                                : 'hover:bg-[#121B27] text-slate-300'
                            }`}
                          >
                            {/* Checkbox branco conforme Imagem 2 */}
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-white border-white text-slate-900'
                                : isLight
                                ? 'border-slate-300 bg-white'
                                : 'border-slate-600 bg-transparent'
                            }`}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-slate-900 stroke-[3]" />
                              )}
                            </div>

                            {/* Emoji e Nome do Ramo */}
                            <span className="text-base leading-none">{seg.emoji}</span>
                            <span className="text-xs font-semibold flex-1 truncate">
                              {seg.title}
                            </span>
                          </button>
                        );
                      })}

                      {filteredBranches.length === 0 && (
                        <p className="text-center text-xs py-4 text-slate-500">
                          Nenhum ramo encontrado para "{branchSearchQuery}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. NOME DO ESTABELECIMENTO */}
              <div className="space-y-1.5 pt-1">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  2. Nome do seu Estabelecimento ({currentSegmentConfig.shortLabel}) *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={currentSegmentConfig.namePlaceholder}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                        : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                    }`}
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* CAMPOS EXCLUSIVOS DO COMPUTADOR (Como estava antes) */}
              {/* ======================================================== */}
              <div className="hidden md:block space-y-4">
                {/* 4. Frase de Destaque / Slogan da Vitrine */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      4. Frase de Destaque / Slogan da Vitrine
                    </label>
                    <button
                      type="button"
                      onClick={() => setSlogan(currentSegmentConfig.sloganExample)}
                      className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      <span>Usar sugestão</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder={currentSegmentConfig.sloganExample}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                        : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                    }`}
                  />
                </div>

                {/* Responsável & WhatsApp (Grid 2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Seu Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ex: Carlos Miranda"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                            : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      WhatsApp da Loja (com DDD) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Ex: 11987654321"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono font-medium outline-none transition-all ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                            : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Cidade & Bairro (Grid 2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Cidade
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: São Paulo"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                            : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro, Vila Nova..."
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                          : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Senha de Acesso */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Crie sua Senha de Acesso ao Painel *
                    </label>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Mínimo 6 dígitos
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha de acesso"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white'
                          : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 cursor-pointer"
                      title={showPassword ? 'Ocultar Senha' : 'Ver Senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Seleção do Plano Ativo para Teste Gratuito */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    3. Escolha seu Plano ({officialNuviPlans.length} opções disponíveis) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPlansInfoModalOpen(true)}
                    className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-sky-500" />
                    <span>Comparar planos</span>
                  </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${officialNuviPlans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-2`}>
                  {officialNuviPlans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/25'
                            : isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                            : 'bg-[#121820] hover:bg-[#182230] border-[#1C2631] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{plan.icon}</span>
                          <span className="text-xs font-black text-sky-500">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <span className="text-xs font-bold truncate block">{plan.name}</span>
                        <span className="text-[10px] text-slate-400 truncate block">{plan.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Criação */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl active:scale-[0.99] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 border-0 ring-0 outline-none bg-sky-600 hover:bg-sky-500 text-white shadow-none"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-white" />
                    <span>
                      Criar Minha Loja ({currentSegmentConfig.shortLabel}) & Começar Grátis
                    </span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <div className="md:hidden p-2.5 rounded-xl border border-sky-500/25 bg-sky-500/5 text-[11px] text-center text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>No celular, as cores, WhatsApp e endereço são personalizados no <strong>Passo a Passo Guiado</strong> em seguida.</span>
              </div>

              {/* Link de login se já tiver loja */}
              <div className="pt-2 border-t border-slate-200 text-center space-y-2">
                <div>
                  <span className="text-xs text-slate-600">
                    Já possui uma loja cadastrada?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewRole('login_tenant')}
                    className="text-xs font-bold text-sky-600 hover:underline cursor-pointer ml-1"
                  >
                    Entrar no Painel do Lojista
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>

      </div>

      {/* Modal de Informações e Consulta de Planos */}
      {isPlansInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0F1722] border-[#1C2631]'
          }`}>
            {/* Header do Modal */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121B27] border-[#1C2631]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Tabela Comparativa Oficial dos 4 Planos Nuvi SaaS
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 uppercase border border-emerald-500/30">
                      Demonstrativo de Recursos
                    </span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Veja em detalhes os recursos liberados em cada plano e selecione a melhor opção para o seu comércio.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPlansInfoModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-neutral-800 text-slate-400'
                }`}
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas do Modal: Tabela Comparativa vs Cards */}
            <div className={`px-6 pt-2 border-b flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0F1722] border-[#1C2631]'
            }`}>
              <button
                type="button"
                onClick={() => setInfoModalTab('table')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  infoModalTab === 'table'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📊 Tabela Comparativa de Recursos (Demonstrativo)
              </button>
              <button
                type="button"
                onClick={() => setInfoModalTab('cards')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  infoModalTab === 'cards'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                💳 Miniaturas dos Planos ({officialNuviPlans.length})
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {infoModalTab === 'table' ? (
                <PlansComparisonTable
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={(id) => {
                    setSelectedPlanId(id);
                    setIsPlansInfoModalOpen(false);
                    showAlert({
                      title: 'Plano Selecionado!',
                      message: 'Sua escolha foi atualizada. Ao concluir o cadastro, você testará este plano gratuitamente por 7 dias.',
                      variant: 'success'
                    });
                  }}
                  isLight={isLight}
                />
              ) : (
                <>
                  {/* Banner de Observação Importante */}
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                    isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  }`}>
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold block text-sm">
                        Você não precisa cadastrar nenhum cartão de crédito agora!
                      </span>
                      <p className={`text-xs ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                        Seu cadastro libera um período de teste gratuito para experimentar todas as ferramentas na prática. O pagamento só acontece após o término do teste, caso decida contratar, de forma direta e sem burocracia <strong>via PIX</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Grid Dinâmico com os Planos Ativos */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${officialNuviPlans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3`}>
                    {officialNuviPlans.map((p) => {
                      const isSelected = selectedPlanId === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'border-sky-500 ring-2 ring-sky-500/25 bg-sky-500/5'
                              : isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#121B27] border-[#1C2631] text-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                                {p.tag}
                              </span>
                              <span className="text-base">{p.icon}</span>
                            </div>
                            <h4 className="font-black text-xs leading-snug mb-1">
                              {p.name}
                            </h4>
                            <p className={`text-[11px] leading-relaxed line-clamp-3 mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {p.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-[#1C2631]">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-sky-500">
                                R$ {p.price.toFixed(2).replace('.', ',')}
                              </span>
                              <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                /mês
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPlanId(p.id);
                                setIsPlansInfoModalOpen(false);
                              }}
                              className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-600 text-white'
                                  : 'bg-sky-500/10 hover:bg-sky-600 text-sky-600 hover:text-white dark:text-sky-400'
                              }`}
                            >
                              {isSelected ? 'Selecionado' : 'Escolher'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer do Modal */}
            <div className={`p-4 border-t flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121B27] border-[#1C2631]'
            }`}>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Você poderá alterar ou fazer upgrade de plano a qualquer momento no painel.
              </span>
              <button
                type="button"
                onClick={() => setIsPlansInfoModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Fechar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
