import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, TenantBranding, TenantAddress, TenantWhatsAppSettings, BusinessSegmentType } from '../../types';
import { getSegmentById } from '../../data/businessSegments';
import { STORE_WALLPAPERS, WALLPAPER_CATEGORIES } from '../../data/wallpapers';
import { 
  Building2, 
  Palette, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles,
  Store,
  Upload,
  Info,
  Boxes,
  ShoppingCart,
  Globe,
  Phone,
  Copy,
  ExternalLink,
  Send,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  Flame,
  Pizza,
  Wine,
  Dog
} from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTenant?: Tenant;
}

export interface PresetTheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  style: 'gold_luxury' | 'amber_pub' | 'dark_adega' | 'modern_emerald';
  category: 'dark' | 'light' | 'vibrant';
  desc: string;
}

export const PRESET_THEMES: PresetTheme[] = [
  // --- GRUPO 1: BASE PRETO (DARK CONTRAST) ---
  {
    id: 'black_gold',
    name: 'Preto & Ouro Dourado',
    primary: '#09090B',
    accent: '#F59E0B',
    style: 'gold_luxury',
    category: 'dark',
    desc: 'Visual nobre de alto padrão para adegas, lounges e carnes nobres',
  },
  {
    id: 'black_red',
    name: 'Preto & Vermelho Fogo',
    primary: '#09090B',
    accent: '#EF4444',
    style: 'amber_pub',
    category: 'dark',
    desc: 'Contraste esportivo e impactante para hamburguerias e delivery',
  },
  {
    id: 'black_emerald',
    name: 'Preto & Esmeralda Neon',
    primary: '#09090B',
    accent: '#10B981',
    style: 'modern_emerald',
    category: 'dark',
    desc: 'Visual tech e moderno para empórios, lounges e bebidas',
  },
  {
    id: 'black_cyan',
    name: 'Preto & Ciano Elétrico',
    primary: '#09090B',
    accent: '#06B6D4',
    style: 'dark_adega',
    category: 'dark',
    desc: 'Futurista de alto contraste para conveniências e distribuidoras',
  },
  {
    id: 'black_orange',
    name: 'Preto & Laranja Brasa',
    primary: '#09090B',
    accent: '#F97316',
    style: 'amber_pub',
    category: 'dark',
    desc: 'Quente e dinâmico para lanchonetes e pizzarias noturnas',
  },
  {
    id: 'black_lime',
    name: 'Preto & Verde Lima',
    primary: '#09090B',
    accent: '#84CC16',
    style: 'dark_adega',
    category: 'dark',
    desc: 'Energia visual e visibilidade máxima no balcão e vitrine',
  },
  {
    id: 'black_purple',
    name: 'Preto & Roxo Cyber',
    primary: '#09090B',
    accent: '#A855F7',
    style: 'dark_adega',
    category: 'dark',
    desc: 'Noturno e moderno para adegas, pubs e lounges',
  },
  {
    id: 'black_pink',
    name: 'Preto & Pink Neon',
    primary: '#09090B',
    accent: '#EC4899',
    style: 'dark_adega',
    category: 'dark',
    desc: 'Vibrante para cosméticos, docerias noturnas e drinks especiais',
  },
  {
    id: 'black_white',
    name: 'Preto & Branco Neve',
    primary: '#000000',
    accent: '#F8FAFC',
    style: 'dark_adega',
    category: 'dark',
    desc: 'Minimalismo puro monocromático com foco total nos produtos',
  },

  // --- GRUPO 2: CORES VIBRANTES & GASTRONOMIA ---
  {
    id: 'amber_pub',
    name: 'Vermelho Brasa & Cheddar',
    primary: '#B91C1C',
    accent: '#F59E0B',
    style: 'amber_pub',
    category: 'vibrant',
    desc: 'Perfeito para hamburguerias artesanais, pizzarias e delivery',
  },
  {
    id: 'gold_luxury',
    name: 'Bordeaux & Champagne',
    primary: '#881337',
    accent: '#FBBF24',
    style: 'gold_luxury',
    category: 'vibrant',
    desc: 'Ideal para adegas de vinhos finos e restaurantes requintados',
  },
  {
    id: 'fire_orange',
    name: 'Forno a Lenha & Âmbar',
    primary: '#C2410C',
    accent: '#FB923C',
    style: 'amber_pub',
    category: 'vibrant',
    desc: 'Combinação clássica para pizzarias napolitanas e assados',
  },
  {
    id: 'navy_cyan',
    name: 'Azul Marinho & Ciano',
    primary: '#1E3A8A',
    accent: '#06B6D4',
    style: 'dark_adega',
    category: 'vibrant',
    desc: 'Moderno de alto contraste para distribuidoras e conveniências',
  },
  {
    id: 'forest_mint',
    name: 'Esmeralda & Menta Fresh',
    primary: '#064E3B',
    accent: '#10B981',
    style: 'modern_emerald',
    category: 'vibrant',
    desc: 'Excelente para empórios, hortifruti, naturais e mercearias',
  },
  {
    id: 'chocoberry',
    name: 'Chocolate & Caramelo',
    primary: '#451A03',
    accent: '#D97706',
    style: 'gold_luxury',
    category: 'vibrant',
    desc: 'Ideal para docerias, confeitarias, sorveterias e cafeterias',
  },
  {
    id: 'pet_vibrant',
    name: 'Azul Cobalto & Amarelo',
    primary: '#0284C7',
    accent: '#EAB308',
    style: 'modern_emerald',
    category: 'vibrant',
    desc: 'Alegre e chamativo para pet shops e clínicas veterinárias',
  },
  {
    id: 'oriental_red',
    name: 'Preto Imperial & Carmim Sushi',
    primary: '#09090B',
    accent: '#DC2626',
    style: 'dark_adega',
    category: 'vibrant',
    desc: 'Autêntico para sushi bars, temakerias e culinária japonesa',
  },
  {
    id: 'tokyo_pink',
    name: 'Tokyo Dark & Salmão Fresh',
    primary: '#18181B',
    accent: '#FB7185',
    style: 'dark_adega',
    category: 'vibrant',
    desc: 'Sofisticado para gastronomia oriental moderna, combinados e pokes',
  },
  {
    id: 'acai_purple',
    name: 'Roxo Açaí & Verde Fresh',
    primary: '#3B0764',
    accent: '#84CC16',
    style: 'dark_adega',
    category: 'vibrant',
    desc: 'Energético e marcante para açaí, docerias e lanches de verão',
  },
];

export const PRESET_BANNERS = [
  {
    id: 'banner_wine',
    title: 'Adega Clássica Iluminada',
    url: '/src/assets/images/adega_hero_banner_1793972462239.jpg',
  },
  {
    id: 'banner_beer',
    title: 'Cervejas Artesanais Geladas',
    url: '/src/assets/images/beer_ice_cold_1793972463737.jpg',
  },
  {
    id: 'banner_spirits',
    title: 'Bar de Destilados & Drinks',
    url: '/src/assets/images/gin_whiskey_combo_1793972463037.jpg',
  },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  targetTenant,
}) => {
  const { currentTenant, updateTenant, setViewRole, showAlert, themeMode } = useStore();
  const tenant = targetTenant || currentTenant;
  const isLight = themeMode === 'light';

  const [step, setStep] = useState<number>(1);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Form state com businessSegment alterável exclusivamente pelo Master Admin
  const [formData, setFormData] = useState<{
    name: string;
    slogan: string;
    businessSegment: BusinessSegmentType;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    adminPassword?: string;
    document: string;
    plan: 'balcao' | 'vitrine' | 'hibrido';
    branding: TenantBranding;
    address: TenantAddress;
    whatsapp: TenantWhatsAppSettings;
    config: {
      enablePhysicalStore: boolean;
      enableOnlineSales: boolean;
      pixKey?: string;
      acceptPix: boolean;
      acceptCard: boolean;
      acceptCash: boolean;
      allowOrdersWhenClosed: boolean;
      soundAlerts: boolean;
    };
  }>({
    name: '',
    slogan: '',
    businessSegment: tenant?.businessSegment || 'adega',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    adminPassword: '',
    document: '',
    plan: 'hibrido',
    branding: {
      logoUrl: '',
      bannerUrl: '',
      primaryColor: '#0284C7',
      accentColor: '#38BDF8',
      themeStyle: 'dark_adega',
      badgeNotice: 'Entrega expressa e atendimento direto',
      fontStyle: 'Outfit',
    },
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: 'São Paulo',
      state: 'SP',
      zip: '',
      deliveryRadiusKm: 10,
      minimumOrder: 30,
      standardDeliveryFee: 8.0,
      freeDeliveryThreshold: 150,
      allowPickup: true,
      openingHours: 'Seg a Sáb: 10h às 23h | Dom: 10h às 20h',
    },
    whatsapp: {
      phoneNumber: '5511999990000',
      enableWhatsAppOrders: true,
      orderTemplate: `📦 *NOVO PEDIDO - {loja}* 📦\n\n*Pedido:* #{id_pedido}\n*Cliente:* {cliente}\n*Telefone:* {telefone}\n*Entrega:* {tipo_entrega}\n\n*Itens:* \n{itens}\n\n*Subtotal:* R$ {subtotal}\n*Taxa Entrega:* R$ {taxa_entrega}\n*TOTAL:* R$ {total}\n*Pagamento:* {pagamento}{troco_info}\n\n*Endereço de Entrega:* \n{endereco}`,
      statusUpdateTemplate: `Olá {cliente}! Seu pedido #{id_pedido} na *{loja}* foi atualizado: *{novo_status}*.`,
      welcomeMessage: 'Olá! Seja bem-vindo à nossa loja. Como posso te ajudar hoje?',
      supportLinkEnabled: true,
    },
    config: {
      enablePhysicalStore: true,
      enableOnlineSales: true,
      acceptPix: true,
      acceptCard: true,
      acceptCash: true,
      allowOrdersWhenClosed: false,
      soundAlerts: true,
    },
  });

  // Configuração dinâmica do segmento ativo no Wizard
  const activeSegment: BusinessSegmentType = formData.businessSegment || tenant?.businessSegment || 'adega';
  const segmentConfig = getSegmentById(activeSegment);

  const targetWallpaperCat = (() => {
    if (activeSegment === 'restaurante_lanchonete') return 'restaurante';
    if (activeSegment === 'mercadinho_emporio') return 'mercadinho';
    if (activeSegment === 'cosmeticos_farmacia') return 'cosmeticos';
    return activeSegment as any;
  })();

  const relevantWallpaperCategories = useMemo(() => {
    return WALLPAPER_CATEGORIES.filter((cat) => cat.id === targetWallpaperCat);
  }, [targetWallpaperCat]);

  const [activeWallpaperCat, setActiveWallpaperCat] = useState<string>(targetWallpaperCat);

  useEffect(() => {
    setActiveWallpaperCat(targetWallpaperCat);
  }, [targetWallpaperCat]);

  // Populate from tenant
  useEffect(() => {
    if (tenant) {
      const segConfig = getSegmentById(tenant.businessSegment || 'adega');
      const isOldAdegaBannerOnNonAdega = segConfig.id !== 'adega' && (
        !tenant.branding?.bannerUrl ||
        tenant.branding.bannerUrl.includes('adega_hero_banner') ||
        tenant.branding.bannerUrl.includes('beer_ice_cold') ||
        tenant.branding.bannerUrl.includes('gin_whiskey')
      );
      const effectiveBanner = isOldAdegaBannerOnNonAdega ? segConfig.bannerUrl : (tenant.branding?.bannerUrl || segConfig.bannerUrl);

      setFormData({
        name: tenant.name || '',
        slogan: tenant.slogan || segConfig.sloganExample,
        businessSegment: tenant.businessSegment || 'adega',
        ownerName: tenant.ownerName || '',
        ownerEmail: tenant.ownerEmail || '',
        ownerPhone: tenant.ownerPhone || '',
        adminPassword: tenant.adminPassword || '123456',
        document: tenant.document || '',
        plan: (tenant.plan === 'balcao' || tenant.plan === 'vitrine' || tenant.plan === 'hibrido')
          ? tenant.plan
          : (tenant.config?.enablePhysicalStore && !tenant.config?.enableOnlineSales)
          ? 'balcao'
          : (!tenant.config?.enablePhysicalStore && tenant.config?.enableOnlineSales)
          ? 'vitrine'
          : 'hibrido',
        branding: {
          logoUrl: tenant.branding?.logoUrl || '',
          bannerUrl: effectiveBanner,
          primaryColor: tenant.branding?.primaryColor || segConfig.primaryColor,
          accentColor: tenant.branding?.accentColor || segConfig.accentColor,
          themeStyle: tenant.branding?.themeStyle || segConfig.themeStyle,
          badgeNotice: tenant.branding?.badgeNotice || segConfig.badgeNotice,
          fontStyle: tenant.branding?.fontStyle || 'Outfit',
        },
        address: {
          street: tenant.address?.street || '',
          number: tenant.address?.number || '',
          neighborhood: tenant.address?.neighborhood || '',
          city: tenant.address?.city || 'São Paulo',
          state: tenant.address?.state || 'SP',
          zip: tenant.address?.zip || '',
          deliveryRadiusKm: tenant.address?.deliveryRadiusKm || 10,
          minimumOrder: tenant.address?.minimumOrder || 30,
          standardDeliveryFee: tenant.address?.standardDeliveryFee || 8.0,
          freeDeliveryThreshold: tenant.address?.freeDeliveryThreshold || 150,
          allowPickup: tenant.address?.allowPickup ?? true,
          openingHours: tenant.address?.openingHours || 'Seg a Sáb: 10h às 23h',
        },
        whatsapp: {
          phoneNumber: tenant.whatsapp?.phoneNumber || '5511999990000',
          enableWhatsAppOrders: tenant.whatsapp?.enableWhatsAppOrders ?? true,
          orderTemplate: tenant.whatsapp?.orderTemplate || '',
          statusUpdateTemplate: tenant.whatsapp?.statusUpdateTemplate || '',
          welcomeMessage: tenant.whatsapp?.welcomeMessage || '',
          supportLinkEnabled: tenant.whatsapp?.supportLinkEnabled ?? true,
        },
        config: {
          enablePhysicalStore: tenant.config?.enablePhysicalStore ?? true,
          enableOnlineSales: tenant.config?.enableOnlineSales ?? true,
          pixKey: tenant.config?.pixKey || '',
          acceptPix: tenant.config?.acceptPix ?? true,
          acceptCard: tenant.config?.acceptCard ?? true,
          acceptCash: tenant.config?.acceptCash ?? true,
          allowOrdersWhenClosed: tenant.config?.allowOrdersWhenClosed ?? false,
          soundAlerts: tenant.config?.soundAlerts ?? true,
        },
      });
    }
  }, [tenant, isOpen]);

  if (!isOpen || !tenant) return null;

  const handleSaveAndAdvance = () => {
    updateTenant(tenant.id, {
      ...formData,
      businessSegment: tenant.businessSegment, // Fixo e imutável após o cadastro inicial
      onboardingCompleted: step === 4 ? true : tenant.onboardingCompleted,
    });

    if (step < 4) {
      setStep(step + 1);
    } else {
      showAlert({
        title: 'Configurações Salvas com Sucesso!',
        message: 'Os dados do seu estabelecimento, formas de atendimento e WhatsApp foram atualizados.',
        variant: 'success'
      });
      onClose();
    }
  };

  const handleFinishAndOpenStore = () => {
    updateTenant(tenant.id, {
      ...formData,
      businessSegment: tenant.businessSegment, // Fixo e imutável após o cadastro inicial
      onboardingCompleted: true,
    });
    onClose();
    if (formData.config.enableOnlineSales) {
      setViewRole('storefront');
    } else {
      setViewRole('tenant_admin');
    }
  };

  // Reusable dynamic styles
  const inputClass = `w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${
    isLight 
      ? 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-amber-500 shadow-2xs' 
      : 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-500'
  }`;

  const labelClass = `block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden my-8 transition-colors ${
        isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Passo a Passo de Configuração Inicial
              </h2>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Personalize os dados do seu comércio ({segmentConfig.shortLabel}), marca e automações
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar */}
        <div className={`grid grid-cols-4 border-b text-xs transition-colors ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-neutral-950 border-neutral-800'
        }`}>
          {[
            { num: 1, label: 'Estabelecimento', icon: Building2 },
            { num: 2, label: 'Visual & Cores', icon: Palette },
            { num: 3, label: 'Endereço & Raio', icon: MapPin },
            { num: 4, label: 'WhatsApp & Acessos', icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = step > item.num;
            const isCurrent = step === item.num;
            return (
              <button
                key={item.num}
                onClick={() => setStep(item.num)}
                className={`py-3 px-2 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  isCurrent
                    ? isLight
                      ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-xs'
                      : 'border-neutral-600 text-white bg-neutral-800 font-bold'
                    : isDone
                    ? isLight
                      ? 'border-emerald-500 text-emerald-800 font-bold bg-emerald-50/60'
                      : 'border-emerald-500 text-emerald-400 font-medium'
                    : isLight
                    ? 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <Icon className="w-4 h-4 shrink-0" />
                )}
                <span className="hidden sm:inline">{item.num}. {item.label}</span>
                <span className="sm:hidden">{item.num}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">

          {/* STEP 1: DADOS DO ESTABELECIMENTO & MODELO DE OPERAÇÃO */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* OPERATING MODEL SELECTION */}
              <div className={`p-4 rounded-xl border space-y-4 ${
                isLight ? 'bg-neutral-50/70 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      Qual é o Modelo de Foco do seu Estabelecimento? *
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Defina como seu comércio irá operar no dia a dia. Você poderá alterar isso a qualquer momento.
                    </p>
                  </div>
                </div>

                {/* 3 Preset Model Selection Cards com Planos e Preços */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Card 1: Híbrido Completo */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        plan: 'hibrido',
                        config: { ...formData.config, enablePhysicalStore: true, enableOnlineSales: true },
                        whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: true },
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      formData.config.enablePhysicalStore && formData.config.enableOnlineSales
                        ? isLight
                          ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/40 text-neutral-900 shadow-xs'
                          : 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40 text-white'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 shadow-2xs'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          <Store className="w-4 h-4 text-amber-500" /> Híbrido Completo
                        </span>
                        {formData.config.enablePhysicalStore && formData.config.enableOnlineSales && (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-sm font-extrabold text-amber-500">R$ 179,90</span>
                        <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>/mês</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase">
                          2 em 1
                        </span>
                      </div>
                      <p className={`text-[11px] leading-snug ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        Balcão físico com leitor de código de barras (PDV) + Vitrine online com pedidos no WhatsApp e estoque unificado.
                      </p>
                    </div>
                  </button>

                  {/* Card 2: Apenas Loja Física */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        plan: 'balcao',
                        config: { ...formData.config, enablePhysicalStore: true, enableOnlineSales: false },
                        whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: false },
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      formData.config.enablePhysicalStore && !formData.config.enableOnlineSales
                        ? isLight
                          ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/40 text-neutral-900 shadow-xs'
                          : 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40 text-white'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 shadow-2xs'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          <ShoppingCart className="w-4 h-4 text-emerald-500" /> Apenas Balcão (PDV)
                        </span>
                        {formData.config.enablePhysicalStore && !formData.config.enableOnlineSales && (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">R$ 89,90</span>
                        <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>/mês</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                          Físico
                        </span>
                      </div>
                      <p className={`text-[11px] leading-snug ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        Foco no balcão presencial: leitor de barras (PDV), estoque rápido e comprovante. Sem vitrine pública na web.
                      </p>
                    </div>
                  </button>

                  {/* Card 3: Apenas Online / Delivery */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        plan: 'vitrine',
                        config: { ...formData.config, enablePhysicalStore: false, enableOnlineSales: true },
                        whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: true },
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      !formData.config.enablePhysicalStore && formData.config.enableOnlineSales
                        ? isLight
                          ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/40 text-neutral-900 shadow-xs'
                          : 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40 text-white'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 shadow-2xs'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          <Globe className="w-4 h-4 text-sky-500" /> Vitrine & WhatsApp
                        </span>
                        {!formData.config.enablePhysicalStore && formData.config.enableOnlineSales && (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">R$ 119,90</span>
                        <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>/mês</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 uppercase">
                          Online
                        </span>
                      </div>
                      <p className={`text-[11px] leading-snug ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        Foco em pedidos digitais: cardápio web na internet, frete por raio (km) e pedidos recebidos prontos no WhatsApp.
                      </p>
                    </div>
                  </button>

                </div>

                {/* Granular Checkboxes */}
                <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-neutral-800/80'}`}>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    isLight ? 'bg-white border-slate-300 shadow-2xs text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
                  }`}>
                    <div>
                      <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Trabalhar com Loja Física / Vendas no Balcão (PDV)
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                        Ativa o Frente de Caixa (PDV), leitor de código de barras e emissão de comprovantes
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.config.enablePhysicalStore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, enablePhysicalStore: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded text-amber-500 border-neutral-300 cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    isLight ? 'bg-white border-slate-300 shadow-2xs text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
                  }`}>
                    <div>
                      <span className={`font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Trabalhar com Vendas Online / Vitrine & Cardápio Digital
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                        Ativa o site da loja na web para clientes fazerem pedidos delivery ou retirada
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.config.enableOnlineSales}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          config: { ...formData.config, enableOnlineSales: checked },
                          whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: checked ? formData.whatsapp.enableWhatsAppOrders : false },
                        });
                      }}
                      className="w-4 h-4 rounded text-amber-500 border-neutral-300 cursor-pointer accent-amber-500"
                    />
                  </div>

                  {formData.config.enableOnlineSales && (
                    <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs pl-6 border-l-4 border-l-amber-500 ${
                      isLight ? 'bg-white border-slate-300 shadow-2xs text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
                    }`}>
                      <div>
                        <span className={`font-semibold block ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>
                          Trabalhar com Pedidos via WhatsApp
                        </span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          Redireciona o carrinho do cliente com a mensagem pronta de pedido para o seu WhatsApp
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.whatsapp.enableWhatsAppOrders !== false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500 border-neutral-300 cursor-pointer accent-amber-500"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Form Dados Gerais */}
              <div className={`border-b pb-3 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Dados do Estabelecimento & Responsável
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Informações que aparecerão para seus clientes e no cadastro da sua loja.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Ramo / Segmento do Estabelecimento (Fixo e Imutável) */}
                <div className={`sm:col-span-2 p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-neutral-400">
                        Ramo / Segmento Comercial
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border border-slate-300 dark:border-neutral-700 uppercase">
                        Fixo / Imutável
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                      <span>{segmentConfig.emoji}</span>
                      <span>{segmentConfig.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      O segmento foi fixado no cadastro inicial. Caso precise operar em outro ramo comercial, exclua esta loja e cadastre uma nova.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Nome Fantasia do Estabelecimento ({segmentConfig.shortLabel}) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={segmentConfig.namePlaceholder}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>
                      Slogan / Frase de Impacto da Vitrine
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, slogan: segmentConfig.sloganExample })}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Usar simulação</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    placeholder={segmentConfig.sloganExample}
                    className={inputClass}
                  />
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-neutral-850 border-neutral-700 text-neutral-200'
                  }`}>
                    <span className="truncate italic">
                      💡 Simulação para {segmentConfig.shortLabel}: "{segmentConfig.sloganExample}"
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, slogan: segmentConfig.sloganExample })}
                      className="btn-graphite text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 shrink-0 cursor-pointer shadow-xs"
                    >
                      Preencher
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Nome do Responsável / Gerente *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Seu nome"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    WhatsApp / Celular Comercial *
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: { ...formData.whatsapp, phoneNumber: e.target.value },
                        ownerPhone: e.target.value,
                      })
                    }
                    placeholder="11999990000"
                    className={inputClass}
                  />
                  <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Usado como login do lojista e para receber pedidos.
                  </span>
                </div>

                {/* CAMPO DE SENHA DO LOJISTA */}
                <div className="sm:col-span-2 p-3 rounded-xl border border-amber-500/40 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Senha de Acesso do Lojista ao Painel *
                    </label>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                      Segurança do Lojista
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={formData.adminPassword || ''}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      placeholder="Defina uma senha de acesso para o lojista entrar no painel"
                      className={`${inputClass} pr-10 font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    O lojista usará o número de WhatsApp acima e esta senha para entrar no sistema de balcão (PDV), controle de estoque e caixa.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    CNPJ ou CPF
                  </label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    E-mail Comercial
                  </label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="contato@sualoja.com.br"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={formData.address.openingHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, openingHours: e.target.value },
                      })
                    }
                    placeholder="Ex: Seg a Sáb: 14h às 23h | 24 Horas"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: IDENTIDADE VISUAL & CORES */}
          {step === 2 && (
            <div className="space-y-5">
              <div className={`border-b pb-3 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Identidade Visual, Cores & Banners da Vitrine
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Escolha o tema e as imagens que combinam com o perfil do seu comércio ({segmentConfig.shortLabel}).
                </p>
              </div>

              {/* Logotipo do Estabelecimento - Anexar Imagem */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-neutral-50/70 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
              }`}>
                <div>
                  <label className={`block text-xs font-semibold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    Logotipo do Estabelecimento / Marca
                  </label>
                  <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Anexe uma imagem do seu computador ou celular (PNG, JPG, SVG) ou informe uma URL
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Preview Logo */}
                  <div className="w-16 h-16 rounded-xl border border-dashed flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner"
                    style={{
                      backgroundColor: formData.branding.logoUrl ? 'transparent' : formData.branding.primaryColor,
                      borderColor: isLight ? '#cbd5e1' : '#404040',
                    }}
                  >
                    {formData.branding.logoUrl ? (
                      <img
                        src={formData.branding.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="font-bold text-lg text-white">
                          {formData.name ? formData.name.charAt(0) : 'A'}
                        </span>
                        <span className="block text-[8px] text-white/80 font-mono">Sem Logo</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2">
                    <label className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs ${
                      isLight
                        ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                    }`}>
                      <Upload className="w-3.5 h-3.5 text-amber-500" />
                      <span>Anexar Imagem da Logo do Computador</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              showAlert({
                                title: 'Arquivo Muito Grande',
                                message: 'O arquivo da logo deve ter no máximo 5MB.',
                                variant: 'warning',
                              });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) {
                                setFormData({
                                  ...formData,
                                  branding: { ...formData.branding, logoUrl: result },
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={formData.branding.logoUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, logoUrl: e.target.value },
                        })
                      }
                      placeholder="Ou cole a URL da imagem da logo (opcional)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Presets */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <label className={labelClass}>
                    Paleta de Cores da Vitrine do Cardápio Online
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        branding: {
                          ...formData.branding,
                          primaryColor: segmentConfig.primaryColor,
                          accentColor: segmentConfig.accentColor,
                          themeStyle: segmentConfig.themeStyle,
                          badgeNotice: segmentConfig.badgeNotice,
                        },
                      })
                    }
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Usar cores recomendadas para {segmentConfig.shortLabel}</span>
                  </button>
                </div>
                <p className={`text-[11px] mb-3 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  As cores selecionadas personalizam o catálogo e cardápio online acessado pelos clientes. Os sistemas administrativos internos e de PDV permanecem padronizados e neutros (branco, cinza gelo, black carbon e azul).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_THEMES.map((theme) => {
                    const isSelected =
                      formData.branding.primaryColor === theme.primary &&
                      formData.branding.accentColor === theme.accent;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            branding: {
                              ...formData.branding,
                              primaryColor: theme.primary,
                              accentColor: theme.accent,
                              themeStyle: theme.style,
                            },
                          })
                        }
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'border-neutral-900 bg-slate-100 ring-2 ring-neutral-700/20 shadow-xs'
                              : 'border-neutral-400 bg-neutral-850 ring-2 ring-neutral-500/30'
                            : isLight
                            ? 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
                            : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 -ml-1 shadow-xs"
                            style={{ backgroundColor: theme.accent }}
                          />
                          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {theme.name}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {theme.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Cor Primária (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, primaryColor: e.target.value },
                        })
                      }
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, primaryColor: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Cor Secundária / Destaques (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.branding.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, accentColor: e.target.value },
                        })
                      }
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, accentColor: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Banner Selection Dinâmico por Segmentos de Comércio */}
              {formData.config.enableOnlineSales ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <label className={labelClass}>
                        Banner de Fundo & Papel de Parede da Vitrine
                      </label>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Escolha a categoria do seu comércio para visualizar layouts temáticos em alta definição:
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 uppercase self-start">
                      Layouts por Nicho
                    </span>
                  </div>

                  {/* Abas de Categorias de Comércio para os Banners */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                    {relevantWallpaperCategories.map((cat) => {
                      const isActive = activeWallpaperCat === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveWallpaperCat(cat.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                            isActive
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : isLight
                              ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Grid de Imagens da Categoria Ativa */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STORE_WALLPAPERS.filter((w) => w.category === activeWallpaperCat).map((banner) => {
                      const isSelected = formData.branding.bannerUrl === banner.url;
                      return (
                        <button
                          key={banner.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              branding: { ...formData.branding, bannerUrl: banner.url },
                            })
                          }
                          className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-500 ring-2 ring-amber-500 shadow-md'
                              : isLight
                              ? 'border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs'
                              : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                          }`}
                        >
                          <div className="relative w-full h-24 overflow-hidden bg-neutral-950">
                            <img
                              src={banner.url}
                              alt={banner.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold">
                              {banner.tag}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className={`p-2 transition-colors ${
                            isLight ? 'bg-white text-neutral-800' : 'bg-neutral-950 text-neutral-200'
                          }`}>
                            <p className="text-[11px] font-bold truncate leading-tight">{banner.title}</p>
                            <p className={`text-[10px] truncate leading-tight mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                              {banner.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input de URL Personalizada */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={formData.branding.bannerUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, bannerUrl: e.target.value },
                        })
                      }
                      placeholder="Ou cole a URL direta de uma imagem da internet para o banner"
                      className={inputClass}
                    />
                  </div>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                }`}>
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      Banner de Vitrine Ocultado
                    </h4>
                    <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Como este estabelecimento opera exclusivamente com <strong>Balcão Físico (PDV)</strong>, o banner de fundo da vitrine fica oculto pois não há catálogo público na web.
                    </p>
                  </div>
                </div>
              )}

              {/* Notice Banner */}
              <div>
                <label className={labelClass}>
                  Texto de Aviso em Destaque na Vitrine
                </label>
                <input
                  type="text"
                  value={formData.branding.badgeNotice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, badgeNotice: e.target.value },
                    })
                  }
                  placeholder="Ex: Cerveja trincando entregue em até 35 min!"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* STEP 3: ENDEREÇO & RAIO DE ENTREGA */}
          {step === 3 && (
            <div className="space-y-4">
              <div className={`border-b pb-3 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Endereço da Loja & Regras de Entrega
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Configure onde sua loja fica localizada e como entrega para os clientes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Rua / Avenida *</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    placeholder="Ex: Rua das Videiras"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Número *</label>
                  <input
                    type="text"
                    value={formData.address.number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, number: e.target.value },
                      })
                    }
                    placeholder="120"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Bairro *</label>
                  <input
                    type="text"
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, neighborhood: e.target.value },
                      })
                    }
                    placeholder="Moema, Pinheiros..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    placeholder="São Paulo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>CEP</label>
                  <input
                    type="text"
                    value={formData.address.zip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zip: e.target.value },
                      })
                    }
                    placeholder="01234-000"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Delivery Settings */}
              <div className={`pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <div>
                  <label className={labelClass}>
                    Raio de Entrega (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.address.deliveryRadiusKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, deliveryRadiusKm: Number(e.target.value) },
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Taxa Padrão de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={formData.address.standardDeliveryFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          standardDeliveryFee: Number(e.target.value),
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Frete Grátis acima de (R$)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={formData.address.freeDeliveryThreshold || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          freeDeliveryThreshold: Number(e.target.value),
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allowPickup"
                  checked={formData.address.allowPickup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, allowPickup: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500 border-neutral-300 cursor-pointer accent-amber-500"
                />
                <label htmlFor="allowPickup" className={`text-xs cursor-pointer ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
                  Permitir que clientes retirem pedidos no balcão da loja (sem taxa)
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: WHATSAPP & ACESSOS GERADOS */}
          {step === 4 && (
            <div className="space-y-5">
              <div className={`border-b pb-3 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <h3 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Integração WhatsApp & Links de Acesso Gerados
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Configure o número para pedidos e visualize os links exclusivos de acesso da sua loja.
                </p>
              </div>

              {/* Toggle Trabalhar com WhatsApp */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-neutral-50/70 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="onboardingEnableWhatsappOrders" className={`text-xs font-bold cursor-pointer ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      Trabalhar com Pedidos via WhatsApp
                    </label>
                    <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Se desmarcado, os pedidos serão finalizados 100% diretamente no sistema web e gerenciados no painel.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="onboardingEnableWhatsappOrders"
                    checked={formData.whatsapp.enableWhatsAppOrders !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: e.target.checked },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-500 border-neutral-300 cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Número de WhatsApp da Loja (com DDD e 9 dígitos) *
                </label>
                <input
                  type="text"
                  value={formData.whatsapp.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp, phoneNumber: e.target.value },
                    })
                  }
                  placeholder="Ex: 5511998765432"
                  className={inputClass}
                />
                <p className={`text-[11px] mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Recomendado: 55 + DDD + Telefone (ex: 5511998765432). É para esse número que a mensagem formatada de pedido será enviada.
                </p>
              </div>

              {/* CARD DE LINKS DE ACESSO GERADOS */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-amber-50/70 border-amber-200 shadow-2xs' : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                    Links de Acesso Gerados para a sua Loja
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Link Vitrine */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                    isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          <Store className="w-3.5 h-3.5 text-amber-500" /> Vitrine dos Clientes
                        </span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-semibold">Pública</span>
                      </div>
                      <p className={`text-[11px] font-mono break-all ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        {window.location.origin}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}`;
                        navigator.clipboard?.writeText(url);
                        showAlert({
                          title: 'Link da Vitrine Copiado!',
                          message: 'O link da vitrine pública foi copiado para a sua área de transferência.',
                          variant: 'success'
                        });
                      }}
                      className="mt-2 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Link da Vitrine</span>
                    </button>
                  </div>

                  {/* Link Painel */}
                  <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                    isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          <Lock className="w-3.5 h-3.5 text-amber-500" /> Painel do Lojista (PDV)
                        </span>
                        <span className="text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-semibold">Restrito</span>
                      </div>
                      <div className={`text-[11px] font-mono space-y-0.5 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        <p>📱 Login: <strong>{formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber}</strong></p>
                        <p>🔑 Senha: <strong>{formData.adminPassword || tenant.adminPassword || '123456'}</strong></p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}`;
                        navigator.clipboard?.writeText(url);
                        showAlert({
                          title: 'Link do Painel Copiado!',
                          message: `O link do painel foi copiado. O lojista pode entrar com o WhatsApp (${formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber}) e a senha (${formData.adminPassword || tenant.adminPassword || '123456'}).`,
                          variant: 'success'
                        });
                      }}
                      className="mt-2 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Link do Painel</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={() => {
                    const phone = (formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber).replace(/\D/g, '');
                    const siteUrl = `${window.location.origin}`;
                    const pass = formData.adminPassword || tenant.adminPassword || '123456';
                    const emoji = segmentConfig.emoji || '🏪';
                    const msg = `*${emoji} Acesso ao Sistema da sua Loja - ${formData.name || tenant.name}*\n\nOlá ${formData.ownerName || tenant.ownerName}! Seus acessos foram configurados com sucesso:\n\n🛒 *Vitrine dos Clientes:*\n${siteUrl}\n\n💻 *Painel do Lojista (PDV e Estoque):*\n${siteUrl}\n📱 *Usuário / WhatsApp:* ${formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber}\n🔑 *Senha de Acesso:* ${pass}\n\nQualquer dúvida estamos à disposição!`;
                    const waUrl = `https://wa.me/${phone.startsWith('55') ? phone : '55' + phone}?text=${encodeURIComponent(msg)}`;
                    window.open(waUrl, '_blank');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Dados de Acesso no WhatsApp do Lojista</span>
                </button>
              </div>

              <div>
                <label className={labelClass}>
                  Modelo de Mensagem de Novo Pedido (WhatsApp)
                </label>
                <textarea
                  rows={4}
                  value={formData.whatsapp.orderTemplate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp, orderTemplate: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="supportDirect"
                  checked={formData.whatsapp.supportLinkEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp, supportLinkEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500 border-neutral-300 cursor-pointer accent-amber-500"
                />
                <label htmlFor="supportDirect" className={`text-xs cursor-pointer ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
                  Exibir botão flutuante de "Suporte Direto via WhatsApp" na vitrine pública
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className={`flex items-center justify-between px-6 py-4 border-t transition-colors ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 4 ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveAndAdvance}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 shadow-2xs'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
                >
                  Salvar Configurações
                </button>
                <button
                  type="button"
                  onClick={handleFinishAndOpenStore}
                  className="btn-graphite flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  Concluir & Abrir Vitrine
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndAdvance}
                className="btn-graphite flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Próximo Passo
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
