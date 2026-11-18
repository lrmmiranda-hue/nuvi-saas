import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, BusinessSegmentType } from '../../types';
import { BUSINESS_SEGMENTS, getSegmentById } from '../../data/businessSegments';
import { NuviLogo } from '../common/NuviLogo';
import { 
  Store, 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Barcode, 
  Boxes, 
  ShoppingCart, 
  ShieldCheck, 
  Zap,
  Eye,
  EyeOff,
  Sun,
  Moon
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
    globalConfig,
    showAlert 
  } = useStore();

  const isLight = themeMode === 'light';

  // Opções de Planos de Venda ativos no Painel Master
  const activePlans = (globalConfig?.plans || []).filter(p => p.active);

  // Selected Business Segment (padrão adega)
  const [selectedSegment, setSelectedSegment] = useState<BusinessSegmentType>('adega');
  const currentSegmentConfig = getSegmentById(selectedSegment);

  // Plano Selecionado (inicializa com a primeira opção ativa definida pelo Master)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(activePlans[0]?.id || 'plan_cardapio');

  // Mantém seleção válida se a lista de planos ativos mudar
  React.useEffect(() => {
    if (activePlans.length > 0 && !activePlans.some(p => p.id === selectedPlanId)) {
      setSelectedPlanId(activePlans[0].id);
    }
  }, [activePlans, selectedPlanId]);

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim() || !whatsappNumber.trim() || !password.trim()) {
      showAlert({
        title: 'Campos Obrigatórios',
        message: 'Por favor, preencha o nome do seu comércio, seu nome, seu WhatsApp e defina sua senha de acesso para continuar.',
        variant: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Cria a nova loja com período de teste ativo (trial) e configurações do segmento
      const cleanSlug = storeName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const newTenant = createTenant({
        name: storeName.trim(),
        slug: cleanSlug || `${selectedSegment}-${Date.now().toString().slice(-4)}`,
        businessSegment: selectedSegment,
        slogan: slogan.trim() || currentSegmentConfig.sloganExample,
        ownerName: ownerName.trim(),
        whatsapp: {
          phoneNumber: whatsappNumber.replace(/\D/g, ''),
          enableWhatsAppOrders: true,
          orderTemplate: '',
          statusUpdateTemplate: '',
          welcomeMessage: `Olá! Seja bem-vindo à ${storeName.trim()}. Como posso te ajudar hoje?`,
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
        plan: (selectedPlanId as any) || 'starter',
        status: 'trial',
        adminPassword: password.trim(),
        onboardingCompleted: false,
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
          enablePhysicalStore: true,
          enableOnlineSales: true,
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
    }, 500);
  };

  return (
    <div className={`min-h-[92vh] py-8 px-4 flex flex-col justify-center items-center transition-colors relative ${
      isLight ? 'bg-slate-50/80' : 'bg-transparent'
    }`}>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna Esquerda: Formulário de Cadastro com Paleta Azul e Tons Elegantes */}
        <div className="lg:col-span-7">
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl text-left transition-all ${
            isLight 
              ? 'bg-white border-slate-200 shadow-sky-900/5' 
              : 'bg-[#0E1318] border-sky-950/60 shadow-black/80'
          }`}>
            
            <div className="mb-5 border-b pb-4 border-slate-200 dark:border-[#1C2631]">
              <div className="flex items-start justify-between gap-3">
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
                    Escolha o segmento e preencha os dados para ativar seu painel de vendas e vitrine.
                  </p>
                </div>

                {/* Logo Nuvi no canto direito da tabela/card, clicável para alternar entre Modo Claro e Escuro */}
                <button
                  type="button"
                  onClick={toggleThemeMode}
                  title="Clique na logo para alternar entre Modo Claro e Escuro"
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 focus:outline-none p-1 rounded-xl"
                >
                  <NuviLogo size="sm" isLight={isLight} showSubtitle={false} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* SELETOR DE RAMO / TIPO DE COMÉRCIO (Grid 3x3 responsivo para acomodar todos os ramos) */}
              <div className="space-y-2">
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
                            ? 'bg-gradient-to-br from-sky-600/20 via-blue-600/15 to-transparent shadow-sm border-0 ring-0'
                            : isLight
                            ? 'bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 text-slate-700'
                            : 'bg-[#121820] hover:bg-[#182230] border border-[#1C2631] hover:border-sky-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl leading-none">{seg.emoji}</span>
                          {isSelected && (
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-slate-800' : 'text-[#F8FAFC]'}`} />
                          )}
                        </div>
                        <span className={`text-[11px] leading-tight line-clamp-1 ${
                          isSelected 
                            ? (isLight ? 'text-slate-800 font-extrabold' : 'text-[#F8FAFC] font-extrabold') 
                            : ''
                        }`}>
                          {seg.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELEÇÃO DE PLANO / OPÇÃO DE VENDA ATIVA CONFORME DEFINIDO NO PAINEL MASTER */}
              {activePlans.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      2. Escolha sua Opção de Assinatura *
                    </label>
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      7 Dias Grátis no Plano Selecionado
                    </span>
                  </div>

                  <div className={`grid gap-2.5 ${
                    activePlans.length === 1 ? 'grid-cols-1' :
                    activePlans.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                    activePlans.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                    'grid-cols-1 sm:grid-cols-2'
                  }`}>
                    {activePlans.map((plan) => {
                      const isPlanSelected = selectedPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 outline-none ${
                            isPlanSelected
                              ? 'bg-gradient-to-br from-sky-600/20 via-blue-600/15 to-transparent shadow-md border-transparent'
                              : isLight
                              ? 'bg-slate-50 hover:bg-sky-50/40 border border-slate-200 hover:border-sky-300'
                              : 'bg-[#121820] hover:bg-[#182230] border border-[#1C2631] hover:border-sky-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 w-full">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 uppercase tracking-wider">
                              {plan.badge || 'Plano'}
                            </span>
                            {isPlanSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-neutral-600 shrink-0 mt-0.5" />
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                              {plan.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {plan.tagline}
                            </p>
                          </div>

                          <div className="pt-1 border-t border-slate-200/80 dark:border-[#1C2631] flex items-baseline gap-1">
                            <span className="text-xs font-semibold text-slate-500">R$</span>
                            <span className="text-base font-black text-sky-600 dark:text-sky-400">
                              {plan.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{plan.period}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Nome do Estabelecimento */}
              <div className="space-y-1.5 pt-1">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  3. Nome do seu Estabelecimento ({currentSegmentConfig.shortLabel}) *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
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

                {/* Box de Exemplo em Tempo Real */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                  isLight ? 'bg-sky-50/60 border-sky-200 text-slate-800' : 'bg-[#121820] border-sky-950/60 text-slate-200'
                }`}>
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold italic text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      "{slogan.trim() || currentSegmentConfig.sloganExample}"
                    </p>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Seu cliente verá: <strong className="text-sky-600 dark:text-sky-400">{storeName.trim() || currentSegmentConfig.namePlaceholder.split(',')[0].replace('Ex: ', '')}</strong>
                    </p>
                  </div>
                </div>
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
                      required
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
                      required
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
                    required
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
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Você usará o seu WhatsApp e esta senha para gerenciar suas vendas e caixa.
                </p>
              </div>

              {/* Botão de Criação sem borda, sombra suave e fonte chumbo no modo claro / branco gelo no modo escuro */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ color: isLight ? '#1e293b' : '#F8FAFC' }}
                className={`w-full mt-3 py-3.5 px-4 rounded-xl active:scale-[0.99] font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 border-0 ring-0 outline-none ${
                  isLight
                    ? 'bg-gradient-to-r from-sky-400/25 via-blue-400/20 to-sky-400/25 hover:from-sky-400/35 hover:to-sky-400/35 text-slate-800 shadow-xs'
                    : 'bg-gradient-to-br from-sky-600/30 via-blue-600/25 to-sky-500/20 hover:from-sky-600/40 hover:via-blue-600/35 text-[#F8FAFC] shadow-md shadow-black/30'
                }`}
              >
                {isSubmitting ? (
                  <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                    isLight ? 'border-slate-800/30 border-t-slate-800' : 'border-[#F8FAFC]/30 border-t-[#F8FAFC]'
                  }`} />
                ) : (
                  <>
                    <Zap className={`w-4 h-4 ${isLight ? 'text-slate-800' : 'text-[#F8FAFC]'}`} />
                    <span 
                      style={{ color: isLight ? '#1e293b' : '#F8FAFC' }}
                      className={`font-black text-sm tracking-tight ${isLight ? 'text-slate-800' : 'text-[#F8FAFC]'}`}
                    >
                      Criar Minha Loja ({currentSegmentConfig.shortLabel}) & Começar Grátis
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isLight ? 'text-slate-800' : 'text-[#F8FAFC]'}`} />
                  </>
                )}
              </button>

              <p className={`text-[11px] text-center ${isLight ? 'text-slate-500' : 'text-slate-400'} pt-1`}>
                Ao criar sua loja, você tem 7 dias de acesso completo sem compromisso.
              </p>

              <div className="pt-3 border-t border-slate-200 dark:border-[#1C2631] text-center">
                <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Já possui uma loja cadastrada?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setViewRole('login_tenant')}
                  className="text-xs font-bold text-sky-500 hover:underline cursor-pointer ml-1"
                >
                  Entrar no Painel do Lojista
                </button>
              </div>

            </form>

          </div>
        </div>

        {/* Coluna Direita: Apresentação com Identidade Visual Nuvi Master */}
        <div className="lg:col-span-5 space-y-6 text-left lg:sticky lg:top-8">
          
          {/* Logo Nuvi em Destaque (clicável para alternar Modo Claro / Escuro) */}
          <div className="pb-1">
            <button
              type="button"
              onClick={toggleThemeMode}
              title="Clique na logo para alternar entre Modo Claro e Escuro"
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none text-left"
            >
              <NuviLogo size="lg" isLight={isLight} showSubtitle={false} />
            </button>
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

          {/* Selo de Segurança */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-600 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631] text-slate-300'
          }`}>
            <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
            <span>Sem necessidade de cartão de crédito. Configure seu sistema em menos de 2 minutos!</span>
          </div>

        </div>

      </div>

    </div>
  );
};
