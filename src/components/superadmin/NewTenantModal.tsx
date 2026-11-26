import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, BusinessSegmentType, TenantPlan } from '../../types';
import { BUSINESS_SEGMENTS, getSegmentById } from '../../data/businessSegments';
import { PRESET_THEMES, PRESET_BANNERS } from '../tenant/OnboardingWizardModal';
import { 
  X, 
  Store, 
  Sparkles, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Palette,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Zap,
  Search,
  ChevronDown
} from 'lucide-react';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: (tenant: Tenant) => void;
}

export const NewTenantModal: React.FC<NewTenantModalProps> = ({
  isOpen,
  onClose,
  onTenantCreated,
}) => {
  const { createTenant, showAlert, themeMode, globalConfig } = useStore();
  const isLight = themeMode === 'light';

  // Controle dos 2 passos solicitados (1 e 2 unidos no Passo 1, e Acessos/Localização no Passo 2)
  const [step, setStep] = useState<1 | 2>(1);

  // Estados do formulário
  const [selectedSegment, setSelectedSegment] = useState<BusinessSegmentType>('adega');
  const segmentConfig = getSegmentById(selectedSegment);

  const [isBranchFilterOpen, setIsBranchFilterOpen] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  const filteredBranches = BUSINESS_SEGMENTS.filter(seg =>
    seg.title.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    seg.shortLabel.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    seg.pitch.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('São Paulo');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_nuvi_pro');
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);

  // Tela de confirmação e credenciais após a criação
  const [createdTenantResult, setCreatedTenantResult] = useState<Tenant | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFinishSuccess = () => {
    if (createdTenantResult) {
      onTenantCreated(createdTenantResult);
    }
    setCreatedTenantResult(null);
    onClose();
  };

  const handleAdvanceToStep2 = () => {
    if (!name.trim()) {
      showAlert({
        title: 'Nome Obrigatório',
        message: 'Por favor, informe o nome comercial do estabelecimento antes de avançar.',
        variant: 'warning',
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert({
        title: 'Nome Obrigatório',
        message: 'Por favor, informe o nome comercial do cliente.',
        variant: 'warning',
      });
      setStep(1);
      return;
    }

    if (!ownerPhone.trim()) {
      showAlert({
        title: 'WhatsApp Obrigatório',
        message: 'Por favor, informe o WhatsApp do lojista para acesso e recebimento de pedidos.',
        variant: 'warning',
      });
      setStep(2);
      return;
    }

    const theme = PRESET_THEMES[selectedThemeIndex] || PRESET_THEMES[0];
    const cleanSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Busca o plano selecionado entre os 4 oficiais
    const currentSelectedPlan = officialNuviPlans.find(p => p.id === selectedPlanId) || officialNuviPlans[3];

    const newTenant = createTenant({
      name: name.trim(),
      slug: cleanSlug,
      businessSegment: selectedSegment,
      slogan: slogan || segmentConfig.sloganExample,
      ownerName: ownerName || 'Proprietário',
      ownerEmail: ownerEmail || 'contato@cliente.com.br',
      ownerPhone: ownerPhone || '11999990000',
      adminPassword: password.trim() || '123456',
      plan: currentSelectedPlan.tenantPlan,
      branding: {
        logoUrl: '',
        bannerUrl: segmentConfig.bannerUrl || PRESET_BANNERS[0].url,
        primaryColor: segmentConfig.primaryColor || theme.primary,
        accentColor: segmentConfig.accentColor || theme.accent,
        themeStyle: segmentConfig.themeStyle || theme.style,
        badgeNotice: segmentConfig.badgeNotice || 'Entrega expressa e atendimento direto',
        fontStyle: 'Outfit',
      },
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: neighborhood || 'Centro',
        city: city || 'São Paulo',
        state: 'SP',
        zip: '01001-000',
        deliveryRadiusKm: 10,
        minimumOrder: 30,
        standardDeliveryFee: 8.0,
        freeDeliveryThreshold: 150,
        allowPickup: true,
        openingHours: 'Seg a Sáb: 10h às 23h | Dom: 10h às 20h',
      },
      whatsapp: {
        phoneNumber: ownerPhone || '5511999990000',
        enableWhatsAppOrders: true,
        orderTemplate: `📦 *NOVO PEDIDO - {loja}* 📦\n\n*Pedido:* #{id_pedido}\n*Cliente:* {cliente}\n*Telefone:* {telefone}\n*Entrega:* {tipo_entrega}\n\n*Itens:* \n{itens}\n\n*Subtotal:* R$ {subtotal}\n*Taxa Entrega:* R$ {taxa_entrega}\n*TOTAL:* R$ {total}\n*Pagamento:* {pagamento}{troco_info}\n\n*Endereço de Entrega:* \n{endereco}`,
        statusUpdateTemplate: `Olá {cliente}! Seu pedido #{id_pedido} na *{loja}* foi atualizado: *{novo_status}*.`,
        welcomeMessage: `Olá! Bem-vindo à ${name}. Como podemos te atender hoje?`,
        supportLinkEnabled: true,
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
      },
    });

    setCreatedTenantResult(newTenant);
  };

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
    isLight
      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20'
      : 'bg-[#121820] border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
  }`;

  const labelClass = `block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`;

  // Os 4 Planos Oficiais do Nuvi SaaS com preços sincronizados do Master
  const officialNuviPlans = [
    {
      id: 'plan_cardapio',
      tenantPlan: 'vitrine' as TenantPlan,
      name: 'Cardápio Digital & Pedidos',
      badge: 'Iniciante / Delivery',
      tag: 'WhatsApp',
      price: globalConfig?.plans?.find(p => p.id === 'plan_cardapio')?.price ?? 49.90,
      description: 'Vitrine online exclusiva, QR Code de mesa/balcão e pedidos direto no WhatsApp sem cobrança de taxas por venda.',
      features: ['Vitrine Web com link próprio', 'Pedidos no WhatsApp', 'QR Code de balcão e mesas', 'Sem taxas de comissão'],
      icon: '🛍️'
    },
    {
      id: 'plan_balcao_pdv',
      tenantPlan: 'balcao' as TenantPlan,
      name: 'Balcão & PDV Caixa Rápido',
      badge: 'Frente de Caixa',
      tag: 'PDV & Balcão',
      price: globalConfig?.plans?.find(p => p.id === 'plan_balcao_pdv')?.price ?? 89.90,
      description: 'Frente de Caixa (PDV) ultra-rápida no toque e bipe de leitor USB/Bluetooth para registrar vendas ágeis no balcão.',
      features: ['PDV Balcão completo', 'Leitor de código de barras USB', 'Venda avulsa ou fardo/caixa', 'Fechamento de caixa diário'],
      icon: '⚡'
    },
    {
      id: 'plan_delivery_estoque',
      tenantPlan: 'starter' as TenantPlan,
      name: 'Delivery & Estoque Profissional',
      badge: 'Profissional',
      tag: 'Estoque & Frete',
      price: globalConfig?.plans?.find(p => p.id === 'plan_delivery_estoque')?.price ?? 139.90,
      description: 'Controle de estoque em tempo real com baixa automática, alerta de reposição e frete calculado por raio em KM.',
      features: ['Baixa automática de estoque', 'Alerta de reposição mínima', 'Cálculo de frete por KM', 'Gestão de entregas'],
      icon: '📦'
    },
    {
      id: 'plan_nuvi_pro',
      tenantPlan: 'hibrido' as TenantPlan,
      name: 'Nuvi Pro Total (Completo)',
      badge: 'Mais Recomendado',
      tag: 'Tudo Incluso',
      price: globalConfig?.plans?.find(p => p.id === 'plan_nuvi_pro')?.price ?? 199.90,
      description: 'A solução definitiva sem limites: Frente de Caixa (PDV) + Vitrine Web + Estoque Automático + Delivery + Gestão Financeira.',
      features: ['Vitrine + PDV simultâneos', 'Controle total de estoque', 'Gestão Financeira & DRE', 'Suporte VIP prioritário'],
      icon: '👑'
    }
  ];

  const currentSelectedPlan = officialNuviPlans.find(p => p.id === selectedPlanId) || officialNuviPlans[3];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-800' 
          : 'bg-[#0E1318] border-[#1C2631] text-white'
      }`}>

        {/* Header do Modal com o mesmo estilo do Passo a Passo */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center font-bold">
              <Store className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Cadastrar Novo Estabelecimento / Lojista
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Crie um novo ambiente isolado para qualquer segmento de comércio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight 
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60' 
                : 'text-slate-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar: APENAS 2 PASSOS (Unindo 1 e 2 no Passo 1, e Acesso/Localização no Passo 2) */}
        {!createdTenantResult && (
          <div className={`grid grid-cols-2 border-b text-xs transition-colors ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-neutral-950 border-neutral-800'
          }`}>
            {[
              { num: 1, label: 'Estabelecimento & Identidade Visual', icon: Building2 },
              { num: 2, label: 'Acesso, Contato & Localização', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isDone = step > item.num;
              const isCurrent = step === item.num;
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => {
                    if (item.num === 1) setStep(1);
                    if (item.num === 2) handleAdvanceToStep2();
                  }}
                  className={`py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                    isCurrent
                      ? isLight
                        ? 'border-sky-600 text-sky-700 bg-white font-bold shadow-xs'
                        : 'border-sky-500 text-white bg-[#121820] font-bold'
                      : isDone
                      ? isLight
                        ? 'border-emerald-500 text-emerald-800 font-bold bg-emerald-50/60'
                        : 'border-emerald-500 text-emerald-400 font-medium'
                      : isLight
                      ? 'border-transparent text-slate-600 hover:text-slate-900 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="font-semibold">{item.num}. {item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Corpo do Modal */}
        {createdTenantResult ? (
          /* Tela de Sucesso com as Credenciais e Acessos Gerados */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className={`p-5 rounded-2xl border text-center space-y-2 ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-emerald-500">Estabelecimento Cadastrado com Sucesso!</h3>
              <p className="text-xs max-w-md mx-auto">
                A loja <strong>"{createdTenantResult.name}"</strong> foi criada e já está configurada com vitrine online, painel de controle e PDV.
              </p>
            </div>

            <div className="space-y-3">
              {/* Link da Vitrine / Cardápio Online */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Link da Vitrine / Cardápio Online</span>
                  <p className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400 truncate">
                    {`https://nuvi-saas.web.app/${createdTenantResult.slug}/cardapio`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(`https://nuvi-saas.web.app/${createdTenantResult.slug}/cardapio`, 'vitrine')}
                    className="p-2 rounded-lg border text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'vitrine' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'vitrine' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <a
                    href={`/${createdTenantResult.slug}/cardapio`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir</span>
                  </a>
                </div>
              </div>

              {/* Link do Painel do Lojista */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Link de Acesso do Lojista</span>
                  <p className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400 truncate">
                    {`https://nuvi-saas.web.app/acesso_lojista`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(`https://nuvi-saas.web.app/acesso_lojista`, 'painel')}
                  className="p-2 rounded-lg border text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedField === 'painel' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'painel' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Credenciais de Login */}
              <div className={`p-3.5 rounded-xl border grid grid-cols-2 gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp de Login:</span>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {createdTenantResult.ownerPhone || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Senha de Acesso:</span>
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {createdTenantResult.adminPassword || '123456'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações de Compartilhamento no WhatsApp */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-neutral-800">
              <a
                href={`https://wa.me/55${(createdTenantResult.ownerPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá ${createdTenantResult.ownerName}! Seu estabelecimento ${createdTenantResult.name} está liberado no Nuvi SaaS:\n\n` +
                  `🌐 Sua Vitrine / Cardápio: https://nuvi-saas.web.app/${createdTenantResult.slug}/cardapio\n` +
                  `📱 Seu Painel de Gestão: https://nuvi-saas.web.app/acesso_lojista\n` +
                  `🔑 Login (WhatsApp): ${createdTenantResult.ownerPhone}\n` +
                  `🔒 Senha: ${createdTenantResult.adminPassword || '123456'}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20be5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar Acesso no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Concluir & Abrir Gestão
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            
            {/* Scrollable Form Content */}
            <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">

              {/* ======================================================== */}
              {/* PASSO 1: ESTABELECIMENTO & IDENTIDADE VISUAL (1 e 2 UNIDOS) */}
              {/* ======================================================== */}
              {step === 1 && (
                <div className="space-y-6">

                  {/* 1. Escolha do Ramo / Segmento de Comércio Compacto com Busca */}
                  <div className={`p-4 rounded-2xl border space-y-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>
                        1. Qual é o ramo / segmento de comércio do cliente? *
                      </label>
                      <span className="text-[11px] font-bold text-sky-500">
                        {segmentConfig.title}
                      </span>
                    </div>

                    {/* Botão Seletor Compacto */}
                    <button
                      type="button"
                      onClick={() => setIsBranchFilterOpen(!isBranchFilterOpen)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-[#0E1520] hover:bg-[#131b26] border-[#1C2631] text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl leading-none">{segmentConfig.emoji}</span>
                        <div className="text-left">
                          <span className="font-bold text-xs block text-slate-900 dark:text-white">
                            {segmentConfig.title}
                          </span>
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Clique para alterar o ramo
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-neutral-700">
                          Selecionado
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isBranchFilterOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Painel do Filtro com Busca em tempo real */}
                    {isBranchFilterOpen && (
                      <div className={`p-3 rounded-2xl border shadow-xl space-y-2.5 transition-all ${
                        isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-[#0E1520] border-[#1C2631] shadow-black/80'
                      }`}>
                        {/* Input de Busca com ícone de lupa */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={branchSearchQuery}
                            onChange={(e) => setBranchSearchQuery(e.target.value)}
                            placeholder="Digite para buscar ramo (ex: Adega, Pizzaria)..."
                            className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs font-medium outline-none border focus:border-sky-500 transition-colors ${
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

                        {/* Cabeçalho da Lista */}
                        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span>Marcar ramo exibido ({filteredBranches.length})</span>
                        </div>

                        {/* Lista vertical rolável com barra de scroll */}
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                          {filteredBranches.map((seg) => {
                            const isSelected = selectedSegment === seg.id;
                            return (
                              <button
                                key={seg.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSegment(seg.id);
                                  if (!slogan) setSlogan(seg.sloganExample);
                                  setIsBranchFilterOpen(false);
                                  setBranchSearchQuery('');
                                }}
                                className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? isLight
                                      ? 'bg-slate-100 text-slate-900 font-bold'
                                      : 'bg-slate-800 text-white font-bold'
                                    : isLight
                                    ? 'hover:bg-slate-100 text-slate-700'
                                    : 'hover:bg-[#121B27] text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-lg leading-none">{seg.emoji}</span>
                                  <div>
                                    <span className="text-xs font-bold block">{seg.title}</span>
                                    <span className="text-[10px] text-slate-400">{seg.shortLabel}</span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-sky-500 stroke-[2.5]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Nome do Estabelecimento e Slogan Comercial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        2. Nome Fantasia do Estabelecimento ({segmentConfig.shortLabel}) *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={segmentConfig.namePlaceholder}
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>
                          Slogan / Proposta de Valor
                        </label>
                        <button
                          type="button"
                          onClick={() => setSlogan(segmentConfig.sloganExample)}
                          className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:opacity-80 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Usar simulação</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={slogan}
                        onChange={(e) => setSlogan(e.target.value)}
                        placeholder={segmentConfig.sloganExample}
                        className={inputClass}
                      />
                      <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        isLight ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-sky-950/20 border-sky-500/30 text-sky-200'
                      }`}>
                        <span className="truncate italic">
                          💡 Sugestão para {segmentConfig.shortLabel}: "{segmentConfig.sloganExample}"
                        </span>
                        <button
                          type="button"
                          onClick={() => setSlogan(segmentConfig.sloganExample)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white shrink-0 cursor-pointer"
                        >
                          Preencher
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Seleção de Plano do SaaS (Cards Dinâmicos em Grid 4 Colunas) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>
                        3. Escolha o Plano de Assinatura do Estabelecimento *
                      </label>
                      <span className="text-[11px] font-bold text-sky-500">
                        {currentSelectedPlan.name} selecionado
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {officialNuviPlans.map((p) => {
                        const isSelected = selectedPlanId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? 'nuvi-btn-cyber-blue text-white shadow-xl shadow-[#0C2340]/50 border-0 ring-0 outline-none scale-[1.01]'
                                : isLight
                                ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-300 text-slate-800 shadow-sm'
                                : 'bg-[#121820] hover:bg-[#182230] border-[#1C2631] hover:border-slate-700 text-white'
                            }`}
                          >
                            {/* Header do Card */}
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                  isSelected 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                                }`}>
                                  {p.tag}
                                </span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5] shrink-0" />
                                ) : (
                                  <span className="text-base leading-none">{p.icon}</span>
                                )}
                              </div>

                              <h4 className={`font-black text-xs leading-snug mb-1 ${
                                isSelected ? 'text-white' : isLight ? 'text-slate-900' : 'text-white'
                              }`}>
                                {p.name}
                              </h4>

                              <p className={`text-[11px] leading-relaxed line-clamp-2 mb-3 ${
                                isSelected ? 'text-sky-100' : isLight ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                {p.description}
                              </p>
                            </div>

                            {/* Preço e Botão */}
                            <div className={`pt-3 border-t flex flex-col gap-2 ${
                              isSelected ? 'border-white/20' : isLight ? 'border-slate-100' : 'border-[#1C2631]'
                            }`}>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-xl font-black ${
                                  isSelected ? 'text-white' : 'text-sky-500'
                                }`}>
                                  R$ {p.price.toFixed(2).replace('.', ',')}
                                </span>
                                <span className={`text-[10px] font-semibold ${
                                  isSelected ? 'text-sky-200' : isLight ? 'text-slate-400' : 'text-slate-500'
                                }`}>/mês</span>
                              </div>

                              <div className={`w-full py-1.5 px-2 rounded-xl text-center font-bold text-[11px] transition-all ${
                                isSelected
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : isLight
                                  ? 'bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-600'
                                  : 'bg-[#1C2631] text-slate-300 group-hover:bg-[#253342] group-hover:text-white'
                              }`}>
                                {isSelected ? '✓ Plano Selecionado' : 'Selecionar'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Tema Visual & Cores Iniciais da Vitrine */}
                  <div className="space-y-2">
                    <label className={labelClass}>
                      4. Tema Visual e Paleta de Cores da Vitrine
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_THEMES.slice(0, 8).map((t, idx) => {
                        const isSelected = selectedThemeIndex === idx;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedThemeIndex(idx)}
                            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'nuvi-btn-cyber-blue text-white shadow-md shadow-[#0C2340]/40'
                                : isLight
                                ? 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                                : 'bg-[#121820] border border-[#1C2631] hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-4 h-4 rounded-full border border-white/30 shadow-xs" 
                                  style={{ backgroundColor: t.primary }} 
                                />
                                <div 
                                  className="w-4 h-4 rounded-full border border-white/30 shadow-xs" 
                                  style={{ backgroundColor: t.accent }} 
                                />
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                              )}
                            </div>
                            <span className={`text-[10px] font-bold truncate ${
                              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                            }`}>
                              {t.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* PASSO 2: ACESSO, CONTATO & LOCALIZAÇÃO */}
              {/* ======================================================== */}
              {step === 2 && (
                <div className="space-y-6">

                  {/* 1. Dados do Lojista e Contato */}
                  <div className={`p-4 rounded-2xl border space-y-4 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      <User className="w-4 h-4 text-sky-500" />
                      1. Responsável & WhatsApp de Contato
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Nome do Lojista / Proprietário
                        </label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder="Ex: Carlos Eduardo"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          WhatsApp do Lojista (DDD + Número) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder="Ex: 11988887777"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Credenciais de Acesso ao Painel & PDV */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      <Lock className="w-4 h-4 text-sky-500" />
                      2. Senha de Acesso do Lojista (Painel & PDV) *
                    </h3>

                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Defina a senha (padrão: 123456)"
                        className={`${inputClass} pl-9 pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-sky-500 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      O lojista usará este número de WhatsApp e esta senha para entrar no painel de vendas e PDV.
                    </p>
                  </div>

                  {/* 3. Localização da Loja */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      <MapPin className="w-4 h-4 text-sky-500" />
                      3. Localização do Estabelecimento
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Cidade</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="São Paulo"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Bairro Principal</label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Centro, Pinheiros..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Resumo da Configuração Antes de Criar */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/20 border-sky-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{segmentConfig.emoji}</span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {name || 'Nome do Estabelecimento'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {segmentConfig.title} • {city || 'São Paulo'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-sky-500 block">
                        {currentSelectedPlan.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        R$ {currentSelectedPlan.price.toFixed(2).replace('.', ',')}/mês • Pronto para ativação
                      </span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Wizard Navigation Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-between transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
            }`}>
              
              <div>
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isLight 
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' 
                        : 'bg-[#161D24] hover:bg-[#1E2933] border-[#222E3A] text-slate-200'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleAdvanceToStep2}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>Próximo Passo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-white" />
                    <span>Criar Estabelecimento & Gerar Acessos</span>
                  </button>
                )}
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
};
