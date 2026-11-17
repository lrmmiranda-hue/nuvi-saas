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
  HelpCircle,
  Eye,
  EyeOff
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
    showAlert 
  } = useStore();

  const isLight = themeMode === 'light';

  // Selected Business Segment
  const [selectedSegment, setSelectedSegment] = useState<BusinessSegmentType>('adega');
  const currentSegmentConfig = getSegmentById(selectedSegment);

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
        plan: 'starter',
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
    <div className={`min-h-[88vh] py-8 px-4 flex flex-col justify-center items-center transition-colors relative ${
      isLight ? 'bg-slate-50' : 'bg-transparent'
    }`}>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: SaaS Value Proposition & Nuvi Branding */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Logo Nuvi em Destaque */}
          <div className="pb-1">
            <NuviLogo size="lg" isLight={isLight} showSubtitle={false} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Teste Grátis por 7 Dias</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Monte o sistema do seu comércio em 2 minutos.
            </h1>

            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Frente de Caixa (PDV), controle de estoque em tempo real com margem de lucro e vitrine digital integrada ao WhatsApp.
            </p>
          </div>

          {/* Destaque do Segmento Atual */}
          <div className={`p-4 rounded-2xl border space-y-1.5 text-xs transition-colors ${
            isLight 
              ? 'bg-slate-100/90 border-slate-300 text-slate-800' 
              : 'bg-neutral-800/60 border-neutral-700 text-slate-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <span className="text-xl">{currentSegmentConfig.emoji}</span>
              <span>{currentSegmentConfig.title}</span>
            </div>
            <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
              {currentSegmentConfig.pitch}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span>Embalagens: {currentSegmentConfig.packTerm}</span>
              <span>·</span>
              <span>Vitrine WhatsApp Pronta</span>
            </div>
          </div>

          {/* Key Features List */}
          <div className="space-y-3 pt-1">
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-300 dark:border-neutral-700 mt-0.5">
                <Barcode className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Frente de Caixa Balcão (PDV)
                </h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Bipe itens com leitor de código de barras USB/Bluetooth. Venda avulso ou em caixas e fardos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-300 dark:border-neutral-700 mt-0.5">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Estoque & Alertas de Reposição
                </h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Importe planilhas Excel prontas e receba avisos quando produtos estiverem acabando.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-300 dark:border-neutral-700 mt-0.5">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Vitrine Online & Pedidos no WhatsApp
                </h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Seus clientes montam o carrinho na web e o pedido chega pronto no seu WhatsApp sem comissões.
                </p>
              </div>
            </div>

          </div>

          {/* Social Proof Note */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-600 shadow-2xs' : 'bg-[#11161B] border-[#1C2631] text-slate-400'
          }`}>
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Sem necessidade de cartão de crédito para testar. Comece a usar agora mesmo!</span>
          </div>

        </div>

        {/* Right Column: Register Form Card */}
        <div className="lg:col-span-7">
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl text-left transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-[#11161B] border-[#1C2631] shadow-black/80'
          }`}>
            
            <div className="mb-5 space-y-1 border-b pb-4 border-slate-200 dark:border-[#1C2631]">
              <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Cadastre a sua Loja
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Escolha o ramo do seu comércio e preencha os dados para gerar seu sistema exclusivo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* SELETOR DE RAMO / TIPO DE COMÉRCIO */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  1. Qual é o segmento do seu comércio? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUSINESS_SEGMENTS.map((seg) => {
                    const isSelected = selectedSegment === seg.id;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setSelectedSegment(seg.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'btn-graphite bg-neutral-800 text-white border border-neutral-700 shadow-xs font-bold'
                            : isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-[#0B0F12] hover:bg-[#161D24] border-[#1C2631] text-slate-300'
                        }`}
                      >
                        <span className="text-xl leading-none">{seg.emoji}</span>
                        <span className={`text-[11px] font-bold leading-tight line-clamp-1 ${
                          isSelected ? 'text-white' : ''
                        }`}>
                          {seg.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Nome do Estabelecimento */}
              <div className="space-y-1.5 pt-1">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  2. Nome do seu Estabelecimento ({currentSegmentConfig.shortLabel}) *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={currentSegmentConfig.namePlaceholder}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                        : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Slogan & Simulação Conforme Cada Comércio */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    3. Slogan / Frase de Impacto da Vitrine
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlogan(currentSegmentConfig.sloganExample)}
                    className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Usar simulação</span>
                  </button>
                </div>
                
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder={currentSegmentConfig.sloganExample}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                      : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
                  }`}
                />

                {/* Box de Simulação / Exemplo em Tempo Real */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                  isLight ? 'bg-slate-100/90 border-slate-300 text-slate-800' : 'bg-neutral-850 border-neutral-700 text-slate-200'
                }`}>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Simulação para {currentSegmentConfig.shortLabel}
                      </span>
                      {slogan !== currentSegmentConfig.sloganExample && (
                        <button
                          type="button"
                          onClick={() => setSlogan(currentSegmentConfig.sloganExample)}
                          className="btn-graphite text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer shadow-xs transition-all"
                        >
                          Aplicar este Slogan
                        </button>
                      )}
                    </div>
                    <p className="mt-1 font-medium italic text-[11px] leading-relaxed">
                      "{currentSegmentConfig.sloganExample}"
                    </p>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Seu cliente verá: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{storeName.trim() || currentSegmentConfig.namePlaceholder.split(',')[0].replace('Ex: ', '')}</strong> • <em>{slogan.trim() || currentSegmentConfig.sloganExample}</em>
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
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ex: José Carlos de Moura"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                        isLight 
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                          : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    WhatsApp da Loja (com DDD) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Ex: 11987654321"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono font-medium outline-none transition-all ${
                        isLight 
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                          : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
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
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                        isLight 
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                          : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
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
                    placeholder="Ex: Pinheiros, Centro, Vila Nova..."
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                        : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
                    }`}
                  />
                </div>

              </div>

              {/* Senha de Acesso */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Crie uma Senha para o seu Painel *
                  </label>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Mínimo 6 dígitos
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha de acesso"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400/20 focus:bg-white shadow-2xs' 
                        : 'bg-[#0B0F12] border border-[#1C2631] text-white focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    title={showPassword ? 'Ocultar Senha' : 'Ver Senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Você usará esta senha junto com o seu WhatsApp para acessar o seu painel de vendas e PDV.
                </p>
              </div>

              {/* Botão de Criação */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-graphite w-full mt-2 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Criar Minha Loja ({currentSegmentConfig.shortLabel}) Grátis & Começar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className={`text-[11px] text-center ${isLight ? 'text-slate-500' : 'text-slate-400'} pt-1`}>
                Ao criar sua loja, você ganha 7 dias de acesso completo sem compromisso.
              </p>

              <div className="pt-3 border-t border-slate-200 dark:border-[#1C2631] flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Já possui loja?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewRole('login_tenant')}
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline cursor-pointer ml-1"
                  >
                    Entrar no Painel do Lojista
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setViewRole('super_admin')}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  🔒 Acesso Master
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
