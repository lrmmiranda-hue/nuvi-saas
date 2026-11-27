import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CategoryType, Order } from '../../types';
import { getTenantActiveCategories, getCategoryDisplayName } from '../../data/businessSegments';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { getSegmentWallpapers } from '../../data/wallpapers';
import {
  ShoppingBag,
  ShoppingCart,
  Home,
  Menu,
  Search,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Snowflake,
  Flame,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  Filter,
  Check,
  ShieldCheck,
  Beer,
  Wine,
  GlassWater,
  CupSoda,
  UtensilsCrossed,
  Store,
  Lock,
  BookOpen,
  User,
  LogIn,
  X,
  ArrowLeft,
  Info,
  Megaphone,
  CreditCard,
  ExternalLink,
  Sun,
  Moon,
  LayoutGrid,
  List,
  ReceiptText,
  Heart,
  QrCode,
  Smartphone,
  Download,
  Share2,
  Copy
} from 'lucide-react';

export const StorefrontView: React.FC = () => {
  const {
    currentTenant,
    tenantProducts,
    tenantOrders,
    cart,
    addToCart,
    generateWhatsAppDirectChatUrl,
    setViewRole,
    themeMode,
    toggleThemeMode,
    isFeatureAllowed,
    showAlert,
    mediaLibrary,
  } = useStore();

  const isLight = themeMode === 'light';

  // Validação de Permissão de Mesas pelo Plano e Configuração Operacional do Lojista
  const isDiningTablesPlanAllowed = isFeatureAllowed('enableDiningTables') !== false && isFeatureAllowed('storefrontTablesEnabled') !== false;
  const serviceMode = currentTenant?.config?.storefrontServiceMode || 'hybrid';
  const selectionMode = currentTenant?.config?.tableSelectionMode || 'both';

  // Mesas só ficam disponíveis no cardápio se o plano permitir e o lojista não tiver deixado somente delivery
  const isTableServiceAvailable = Boolean(
    isDiningTablesPlanAllowed &&
    currentTenant?.config?.enableTableService !== false &&
    serviceMode !== 'delivery_only'
  );

  // Validação de Permissão de Delivery pelo Plano, Segmento e Configuração da Loja
  const isDeliveryPlanAllowed = isFeatureAllowed('enableDeliveryRadius') !== false && isFeatureAllowed('storefrontDeliveryEnabled') !== false;
  const isDeliveryAvailable = Boolean(
    isDeliveryPlanAllowed &&
    currentTenant?.config?.enableDelivery !== false &&
    serviceMode !== 'tables_only'
  );

  // Validação de Retirada no Balcão
  const isPickupAllowed = isFeatureAllowed('storefrontPickupEnabled') !== false && currentTenant?.config?.allowPickup !== false;

  // Atendimento em Mesas (Salão / Dine-in)
  const [tableNumber, setTableNumber] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('mesa') || params.get('table') || sessionStorage.getItem('nuvi_store_table') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (tableNumber) {
        sessionStorage.setItem('nuvi_store_table', tableNumber);
      } else {
        sessionStorage.removeItem('nuvi_store_table');
      }
    } catch {}
  }, [tableNumber]);

  // Modalidade de Atendimento Ativa escolhida pelo Cliente
  const [selectedServiceType, setSelectedServiceType] = useState<'delivery' | 'pickup' | 'dine_in'>(() => {
    try {
      const saved = sessionStorage.getItem('nuvi_service_type');
      if (saved === 'dine_in' || saved === 'pickup' || saved === 'delivery') return saved as any;
      const params = new URLSearchParams(window.location.search);
      if (params.get('mesa') || params.get('table')) return 'dine_in';
    } catch {}
    return 'delivery';
  });

  const activeServiceType = useMemo<'delivery' | 'pickup' | 'dine_in'>(() => {
    if (Boolean(tableNumber) && isTableServiceAvailable) return 'dine_in';
    if (selectedServiceType === 'dine_in' && isTableServiceAvailable) return 'dine_in';
    if (selectedServiceType === 'delivery' && isDeliveryAvailable) return 'delivery';
    if (selectedServiceType === 'pickup' && isPickupAllowed) return 'pickup';
    if (isDeliveryAvailable) return 'delivery';
    if (isPickupAllowed) return 'pickup';
    if (isTableServiceAvailable) return 'dine_in';
    return 'pickup';
  }, [selectedServiceType, tableNumber, isTableServiceAvailable, isDeliveryAvailable, isPickupAllowed]);

  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);
  const [isTableOrdersModalOpen, setIsTableOrdersModalOpen] = useState(false);
  const [tempTableInput, setTempTableInput] = useState('');

  const isTableActive = Boolean(isTableServiceAvailable && (tableNumber || serviceMode === 'tables_only'));

  // Pedidos ativos da mesa atual
  const tableOrders = useMemo(() => {
    if (!tableNumber) return [];
    const normalizedTarget = tableNumber.replace(/[^0-9]/g, '');
    return tenantOrders.filter((ord) => {
      if (ord.status === 'cancelado') return false;
      if (ord.tableStatus === 'fechada') return false;
      const ordMesa = (ord.tableNumber || '').replace(/[^0-9]/g, '');
      return ordMesa === normalizedTarget || ord.tableNumber === tableNumber;
    });
  }, [tenantOrders, tableNumber]);

  const tableOrdersTotal = useMemo(() => {
    return tableOrders.reduce((sum, ord) => sum + ord.total, 0);
  }, [tableOrders]);

  // Controle de Layout do Cardápio: Grade com fotos grandes vs Lista com miniatura lateral
  const [viewModeOverride, setViewModeOverride] = useState<'grid' | 'list' | null>(null);

  const configuredLayout = currentTenant?.config?.catalogLayout || currentTenant?.branding?.catalogLayout;
  const isListLayout = (viewModeOverride ?? configuredLayout ?? (currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa' ? 'list' : 'grid')) === 'list';

  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyChilled, setFilterOnlyChilled] = useState(false);
  const [filterOnlyPromo, setFilterOnlyPromo] = useState(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`nuvi_fav_${currentTenant?.id}`) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (currentTenant?.id) {
        const saved = localStorage.getItem(`nuvi_fav_${currentTenant.id}`) === 'true';
        setIsFavorited(saved);
      }
    } catch {}
  }, [currentTenant?.id]);

  // PWA / Instalação do App na Tela Inicial do Celular
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallAppModalOpen, setIsInstallAppModalOpen] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isCopiedStoreLink, setIsCopiedStoreLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIOSDevice(isApple);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Configuração inteligente para iPhone e Android: define título, apple-touch-icon e nome da loja
  useEffect(() => {
    if (!currentTenant) return;
    document.title = `${currentTenant.name} - Cardápio Online & Pedidos`;

    const tenantLogo = currentTenant.logoUrl || '/logo3.png';

    // 1. Apple Touch Icon para iPhone / iPad baixar a logo oficial da página ao compartilhar
    let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = tenantLogo;

    // 2. Favicon do navegador
    let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = tenantLogo;

    // 3. Nome do App ao adicionar na tela inicial do iPhone
    let appleTitle = document.querySelector<HTMLMetaElement>("meta[name='apple-mobile-web-app-title']");
    if (!appleTitle) {
      appleTitle = document.createElement('meta');
      appleTitle.name = 'apple-mobile-web-app-title';
      document.head.appendChild(appleTitle);
    }
    appleTitle.content = currentTenant.name;

    // 4. Modo tela cheia para Web App no iOS
    let appleCapable = document.querySelector<HTMLMetaElement>("meta[name='apple-mobile-web-app-capable']");
    if (!appleCapable) {
      appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      document.head.appendChild(appleCapable);
    }
    appleCapable.content = 'yes';
  }, [currentTenant?.name, currentTenant?.logoUrl]);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Carrossel Promocional estilo iFood / 99Food
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isStoreInfoModalOpen, setIsStoreInfoModalOpen] = useState(false);

  // Mobile Bottom Navigation Drawers & Modals
  const [isMobileMenuDrawerOpen, setIsMobileMenuDrawerOpen] = useState(false);
  const [isMobileSearchModalOpen, setIsMobileSearchModalOpen] = useState(false);
  const [isMobileAccountModalOpen, setIsMobileAccountModalOpen] = useState(false);

  const isAdega = currentTenant?.businessSegment === 'adega';
  const isGastronomy = currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa';
  const isMenuOnly = currentTenant?.config?.enableMenuOnlyMode ?? false;

  const activeCategories = useMemo(() => {
    return getTenantActiveCategories(
      tenantProducts,
      currentTenant?.businessSegment,
      currentTenant?.categories || currentTenant?.customCategories
    );
  }, [tenantProducts, currentTenant?.businessSegment, currentTenant?.categories, currentTenant?.customCategories]);

  if (!currentTenant) {
    return (
      <div className="p-12 text-center text-neutral-400">
        Nenhum estabelecimento selecionado.
      </div>
    );
  }

  // If store is physical-only (online sales disabled)
  if (currentTenant.config?.enableOnlineSales === false) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">{currentTenant.name}</h2>
        <p className="text-xs text-neutral-400">
          Este estabelecimento atende exclusivamente de forma presencial no balcão da loja física. A vitrine online e delivery estão desativados nas configurações.
        </p>
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-left space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500">Endereço da Loja:</span>
          <p className="text-white font-semibold">{currentTenant.address.street}, {currentTenant.address.number}</p>
          <p className="text-neutral-400">{currentTenant.address.neighborhood} - {currentTenant.address.city}</p>
          <p className="text-blue-400 text-[11px] mt-1 font-semibold">{currentTenant.address.openingHours}</p>
        </div>
        <button
          onClick={() => setViewRole('tenant_admin')}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
        >
          Ir para o Painel da Loja
        </button>
      </div>
    );
  }

  // Filter products strictly belonging to this tenant and configured for storefront
  const filteredProducts = tenantProducts.filter((product) => {
    const matchesStorefront = product.showInStorefront !== false;
    const matchesCat = selectedCategory === 'todas' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChilled = !filterOnlyChilled || product.isChilledAvailable;
    const matchesPromo = !filterOnlyPromo || (product.promoPrice !== null && product.promoPrice !== undefined);

    return matchesStorefront && matchesCat && matchesSearch && matchesChilled && matchesPromo;
  });

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1, product.isChilledAvailable, '');
  };

  const handleOrderCompleted = (order: Order) => {
    setConfirmedOrder(order);
    setIsConfirmationModalOpen(true);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    cervejas: <Beer className="w-3.5 h-3.5" />,
    vinhos: <Wine className="w-3.5 h-3.5" />,
    destilados: <GlassWater className="w-3.5 h-3.5" />,
    combos: <Sparkles className="w-3.5 h-3.5" />,
    gelo_carvao: <Flame className="w-3.5 h-3.5" />,
    sem_alcool: <CupSoda className="w-3.5 h-3.5" />,
    petiscos: <UtensilsCrossed className="w-3.5 h-3.5" />,
  };

  const brandAccent = currentTenant.branding?.accentColor || '#F59E0B';
  const brandPrimary = currentTenant.branding?.primaryColor || '#881337';

  return (
    <div className="space-y-6 pb-28" style={{ '--brand-accent': brandAccent, '--brand-primary': brandPrimary } as React.CSSProperties}>

      {/* Brand Hero Banner - 2 Opções de Layout: Capa Panorâmica ou Carrossel Promocional em Slides */}
      {(() => {
        const rawBannerLayout = currentTenant.branding?.bannerLayout || 'ifood_cover';
        const bannerLayout: 'ifood_cover' | 'carousel_promos' = rawBannerLayout === 'card_99food' ? 'ifood_cover' : (rawBannerLayout as any);
        const segmentWallpapers = getSegmentWallpapers(currentTenant.businessSegment, mediaLibrary);
        const bannerImage = currentTenant.branding?.bannerUrl || (segmentWallpapers.length > 0 ? segmentWallpapers[0].url : '');
        const promoSlides = (currentTenant.branding?.promoBanners && currentTenant.branding.promoBanners.length > 0)
          ? currentTenant.branding.promoBanners
          : segmentWallpapers.length > 0
          ? segmentWallpapers.slice(0, 3).map(w => w.url)
          : [bannerImage].filter(Boolean);

        return (
          <div
            className={`rounded-none sm:rounded-3xl border-x-0 border-t-0 sm:border shadow-none sm:shadow-xl mb-3 sm:mb-6 overflow-hidden transition-all duration-300 backdrop-blur-xl ${
              isLight ? 'bg-white text-slate-900 border-slate-200 shadow-slate-200/50' : 'bg-neutral-950 text-white border-neutral-800 shadow-black/60'
            }`}
          >
            {/* Capa Panorâmica Superior com Imagem ou Slides do Carrossel */}
            <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden bg-slate-900">
              {bannerLayout === 'carousel_promos' && promoSlides.length > 0 ? (
                <>
                  {promoSlides.map((slideUrl, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        idx === activeSlideIndex % promoSlides.length ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <img
                        src={slideUrl}
                        alt={`Destaque ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* Indicadores Bolinhas do Carrossel Panorâmico */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {promoSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveSlideIndex(dotIdx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          dotIdx === activeSlideIndex % promoSlides.length ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="absolute top-4 right-20 z-20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold shadow-md">
                    📢 Ofertas em Slides
                  </span>
                </>
              ) : bannerImage ? (
                <img
                  src={bannerImage}
                  alt="Capa da Loja"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}

                {/* Vinheta Escura para Contraste com os Botões e Informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

                {/* Linha Acetinada Prateada no Topo */}
                <div
                  className="absolute top-0 inset-x-0 h-[1.5px] pointer-events-none opacity-60"
                  style={{
                    background: isLight
                      ? 'linear-gradient(90deg, transparent 0%, #94a3b8 20%, #ffffff 50%, #94a3b8 80%, transparent 100%)'
                      : 'linear-gradient(90deg, transparent 0%, #475569 20%, #e2e8f0 50%, #475569 80%, transparent 100%)'
                  }}
                />

                {/* BARRA SUPERIOR SOBRE A FOTO (IDÊNTICO AO IFOOD) */}
                <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
                  {/* Botão Voltar Circular Translúcido */}
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery || selectedCategory !== 'todas') {
                        setSearchQuery('');
                        setSelectedCategory('todas');
                      } else {
                        window.history.back();
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-all border border-white/20 cursor-pointer active:scale-95"
                    title="Voltar"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Controles do Canto Direito: Favoritar, Buscar e Status */}
                  <div className="flex items-center gap-2 relative z-30">
                    {/* Botão Favoritar / Curtir (Coração) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const nextFav = !isFavorited;
                        setIsFavorited(nextFav);
                        try {
                          localStorage.setItem(`nuvi_fav_${currentTenant.id}`, String(nextFav));
                        } catch {}
                        showAlert({
                          title: nextFav ? '❤️ Loja Adicionada aos Favoritos!' : 'Removido dos Favoritos',
                          message: nextFav
                            ? `${currentTenant.name} foi salva nos seus favoritos.`
                            : `${currentTenant.name} foi removida dos favoritos.`,
                          variant: 'info'
                        });
                      }}
                      className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-all border border-white/20 cursor-pointer active:scale-90"
                      title={isFavorited ? 'Remover dos favoritos' : 'Favoritar Loja'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          isFavorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Botão Buscar */}
                    <button
                      type="button"
                      onClick={() => setIsMobileSearchModalOpen(true)}
                      className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition-all border border-white/20 cursor-pointer active:scale-95"
                      title="Buscar no cardápio"
                    >
                      <Search className="w-4 h-4 text-white stroke-[2.5]" />
                    </button>

                    {/* Badge Aberto / Fechado */}
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-md flex items-center gap-1.5 backdrop-blur-md ${
                        currentTenant.isOpen
                          ? 'bg-emerald-500/90 text-white border-emerald-400'
                          : 'bg-rose-500/90 text-white border-rose-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currentTenant.isOpen ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                      {currentTenant.isOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD SOBREPOSTO ESTILO IFOOD (CONFORME FOTO DO USUÁRIO) */}
              <div className={`px-2.5 sm:px-6 pb-3 sm:pb-6 relative z-20 -mt-6 sm:-mt-8 rounded-t-[20px] sm:rounded-t-3xl pt-0 transition-colors ${
                isLight ? 'bg-white' : 'bg-neutral-950'
              }`}>
                {/* 1. CABEÇALHO DO CARD: LOGO COM METADE SOBRE A IMAGEM + NOME E SLOGAN NA FRENTE */}
                <div className="flex items-end justify-between gap-3 sm:gap-4 mb-2.5">
                  <div
                    onClick={() => setIsStoreInfoModalOpen(true)}
                    className="flex items-end gap-3 sm:gap-4 min-w-0 flex-1 cursor-pointer group"
                  >
                    {/* LOGO QUADRADINHO COM METADE EM CIMA DA IMAGEM E METADE NO CARD */}
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl border-4 shrink-0 transition-transform group-hover:scale-105 overflow-hidden flex items-center justify-center relative z-30 -mt-10 sm:-mt-12 ${
                        isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-900'
                      }`}
                      style={{
                        boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.35), 0 4px 12px -2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {currentTenant.branding.logoUrl ? (
                        <img
                          src={currentTenant.branding.logoUrl}
                          alt={currentTenant.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-inner"
                          style={{ backgroundColor: brandPrimary }}
                        >
                          {currentTenant.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* NOME DA LOJA (DONANA) E SLOGAN NA FRENTE DO LOGO */}
                    <div className="min-w-0 flex-1 pb-1 pt-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})` }}
                        >
                          <Sparkles className="w-3 h-3" />
                        </span>
                        <h1
                          className="text-base sm:text-xl font-black tracking-tight truncate flex items-center gap-1.5"
                          style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                        >
                          {currentTenant.name}
                        </h1>
                      </div>
                      {/* Slogan ao lado do nome Donana */}
                      <p className={`text-xs mt-0.5 font-medium line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {currentTenant.slogan || 'Qualidade, sabor e tradição'}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setIsStoreInfoModalOpen(true)}
                    className="cursor-pointer group p-1.5 pb-2 shrink-0"
                    title="Ver detalhes da loja"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* 3. SELETOR INTELIGENTE DE MODALIDADE: ENTREGA / RETIRADA / MESA */}
                {(() => {
                  const deliveryRadius = currentTenant.address?.deliveryRadiusKm || (currentTenant.config as any)?.deliveryRadiusKm || 5;
                  const minimumOrder = currentTenant.address?.minimumOrder || currentTenant.config?.minimumOrderValue || 0;
                  const deliveryFee = currentTenant.address?.standardDeliveryFee || (currentTenant.config as any)?.deliveryFee || 0;
                  const estimatedTime = (currentTenant as any).deliveryEstimatedTime || (currentTenant.address as any)?.deliveryEstimatedTime || currentTenant.config?.estimatedDeliveryTime || '25 - 40';

                  const availableModesCount = [isDeliveryAvailable, isPickupAllowed, isTableServiceAvailable].filter(Boolean).length;

                  return (
                    <div className="space-y-2 pt-2 pb-1">
                      {/* BARRA DE SELEÇÃO DE MODALIDADES (Entrega / Retirada / Mesa) */}
                      {(isDeliveryAvailable || isPickupAllowed || isTableServiceAvailable) && (
                        <div className="w-full flex justify-center sm:justify-start my-1.5">
                          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl border bg-slate-100/90 dark:bg-neutral-900/90 border-slate-200 dark:border-neutral-800 shadow-2xs relative">
                            {isDeliveryAvailable && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceType('delivery');
                                  try { sessionStorage.setItem('nuvi_service_type', 'delivery'); } catch {}
                                  if (tableNumber) setTableNumber(null);
                                }}
                                style={activeServiceType === 'delivery' ? {
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 3px 12px ${brandPrimary}45`,
                                  color: '#ffffff',
                                } : {}}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  activeServiceType === 'delivery'
                                    ? 'text-white'
                                    : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span>🛵 Entrega</span>
                              </button>
                            )}

                            {isPickupAllowed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceType('pickup');
                                  try { sessionStorage.setItem('nuvi_service_type', 'pickup'); } catch {}
                                  if (tableNumber) setTableNumber(null);
                                }}
                                style={activeServiceType === 'pickup' ? {
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 3px 12px ${brandPrimary}45`,
                                  color: '#ffffff',
                                } : {}}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  activeServiceType === 'pickup'
                                    ? 'text-white'
                                    : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span>🛍️ Retirada</span>
                              </button>
                            )}

                            {isTableServiceAvailable && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceType('dine_in');
                                  try { sessionStorage.setItem('nuvi_service_type', 'dine_in'); } catch {}
                                  if (!tableNumber && selectionMode !== 'qrcode_fixed') {
                                    setTempTableInput(tableNumber || '');
                                    setIsTableSelectorOpen(true);
                                  }
                                }}
                                style={activeServiceType === 'dine_in' ? {
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 3px 12px ${brandPrimary}45`,
                                  color: '#ffffff',
                                } : {}}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  activeServiceType === 'dine_in'
                                    ? 'text-white'
                                    : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span>🍽️ Mesa / Salão</span>
                                {tableNumber && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-md font-black">
                                    {tableNumber.replace(/[^0-9]/g, '') || tableNumber}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CONTEÚDO ESPECÍFICO CONFORME A MODALIDADE ATIVA */}
                      {activeServiceType === 'dine_in' && isTableServiceAvailable ? (
                        Boolean(tableNumber) ? (
                          <div className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          }`}>
                            <div
                              onClick={() => {
                                setTempTableInput(tableNumber || '');
                                setIsTableSelectorOpen(true);
                              }}
                              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
                              title="Toque para alterar a mesa"
                            >
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                                style={{ backgroundColor: brandPrimary }}
                              >
                                <UtensilsCrossed className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider block opacity-85 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Consumo no Salão
                                </span>
                                <span className="text-sm font-black block" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                                  Mesa {tableNumber?.replace(/[^0-9]/g, '') || tableNumber}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsTableOrdersModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                                style={{ backgroundColor: brandPrimary }}
                              >
                                <ReceiptText className="w-3.5 h-3.5" />
                                <span>Extrato (R$ {tableOrdersTotal.toFixed(2)})</span>
                              </button>
                            </div>
                          </div>
                        ) : selectionMode === 'qrcode_fixed' ? (
                          <div className={`py-1.5 px-3 rounded-xl border flex items-center gap-2.5 my-1 ${
                            isLight ? 'bg-amber-50/80 border-amber-200/90 text-amber-950' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                          }`}>
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs shrink-0"
                              style={{ backgroundColor: brandPrimary }}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                              <span className="font-extrabold text-[11px] text-amber-900 dark:text-amber-300 truncate">
                                📱 Aponte a câmera para o QR Code da mesa
                              </span>
                              <span className={`text-[10px] truncate ${isLight ? 'text-amber-700/80' : 'text-amber-400/80'}`}>
                                (Necessário para pedidos no salão)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setTempTableInput(tableNumber || '');
                              setIsTableSelectorOpen(true);
                            }}
                            className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border cursor-pointer group transition-all my-1 ${
                              isLight
                                ? 'bg-sky-50/70 hover:bg-sky-100/80 border-sky-200 text-sky-950'
                                : 'bg-sky-950/25 hover:bg-sky-900/35 border-sky-500/30 text-sky-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                                style={{ backgroundColor: brandPrimary }}
                              >
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs block">
                                  🍽️ Consumo no Salão / Mesas
                                </span>
                                <span className={`text-[10px] ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                                  Está no estabelecimento? Toque aqui para selecionar sua Mesa
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold text-xs">
                              <span>Selecionar Mesa</span>
                              <ChevronRight className="w-4 h-4 text-sky-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </div>
                          </div>
                        )
                      ) : activeServiceType === 'pickup' && isPickupAllowed ? (
                        <div className={`text-xs flex items-center justify-center sm:justify-start text-center sm:text-left gap-2 flex-wrap font-medium py-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Retirada no Balcão
                          </span>
                          <span>•</span>
                          <span>Pronto em ~15-25 min</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sem taxa de entrega</span>
                          <span>•</span>
                          <span>Retirar no endereço da loja</span>
                        </div>
                      ) : isDeliveryAvailable ? (
                        <div className={`text-xs flex items-center justify-center sm:justify-start text-center sm:text-left gap-1.5 flex-wrap font-medium py-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">🕒 {estimatedTime} min</span>
                          <span>•</span>
                          <span>Raio: até {deliveryRadius} km</span>
                          <span>•</span>
                          <span>Mínimo: R$ {minimumOrder.toFixed(2).replace('.', ',')}</span>
                          {deliveryFee > 0 ? (
                            <>
                              <span>•</span>
                              <span>Frete: R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                            </>
                          ) : (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Frete Grátis</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className={`text-xs flex items-center justify-center sm:justify-start text-center sm:text-left gap-2 font-medium py-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <Store className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>Atendimento presencial no estabelecimento físico • Pronta Entrega</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
        );
      })()}

      {/* Container de Conteúdo com Margens Laterais Finas no Celular */}
      <div className="px-1.5 sm:px-0 space-y-5">

      {/* Filter Toolbar & Category Navigation Tabs em Linha Única */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 text-xs scrollbar-none">
        {/* Filtro Em Promoção */}
        <button
          onClick={() => setFilterOnlyPromo(!filterOnlyPromo)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer shrink-0 ${filterOnlyPromo
              ? 'bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400 shadow-2xs'
              : isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>Em Promoção</span>
        </button>

        {/* Filtro Apenas Geladas (se for adega/bebidas) */}
        {isAdega && (
          <button
            onClick={() => setFilterOnlyChilled(!filterOnlyChilled)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer shrink-0 ${filterOnlyChilled
                ? 'bg-sky-500/15 border-sky-500/50 text-sky-600 dark:text-sky-400'
                : isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500" />
            <span>Apenas Geladas</span>
          </button>
        )}

        {/* Botão Todos os Produtos */}
        <button
          onClick={() => setSelectedCategory('todas')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${selectedCategory === 'todas'
              ? 'shadow-sm font-extrabold text-white'
              : isLight
                ? 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          style={selectedCategory === 'todas' ? {
            background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
            boxShadow: `0 3px 12px ${brandPrimary}40`,
            color: '#ffffff',
          } : {}}
        >
          Todos os Produtos ({tenantProducts.length})
        </button>

        {/* Abas das Categorias */}
        {activeCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${isSelected
                  ? 'shadow-sm font-extrabold text-white'
                  : isLight
                    ? 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              style={isSelected ? {
                background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                boxShadow: `0 3px 12px ${brandPrimary}40`,
                color: '#ffffff',
              } : {}}
            >
              {categoryIcons[cat.id] || <Sparkles className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected
                  ? 'bg-white/20 text-white'
                  : isLight
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEÇÃO PRINCIPAL DO CARDÁPIO: EXIBE TODOS OS ITENS DIRETAMENTE */}
      <div className="space-y-4">
        {selectedCategory !== 'todas' && (
          <div className="pt-1">
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {activeCategories.find((c) => c.id === selectedCategory)?.label || 'Produtos Selecionados'}
            </h2>
          </div>
        )}

        {isListLayout ? (
          /* MODO LISTA COMPACTA COM MINIATURA LATERAL (Estilo Restaurante / Delivery Tradicional) */
          <div className="space-y-8">
            {selectedCategory === 'todas' && !searchQuery ? (
              // Agrupamento por Categorias Ativas
              activeCategories.map((cat) => {
                const prodsInCat = filteredProducts.filter((p) => p.category === cat.id);
                if (prodsInCat.length === 0) return null;

                return (
                  <div key={cat.id} className="space-y-2">
                    <h3 className={`text-lg sm:text-xl font-black border-b pb-2 flex items-center justify-between ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-neutral-800'
                      }`}>
                      <span>{cat.label}</span>
                      <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                        {prodsInCat.length} {prodsInCat.length === 1 ? 'item' : 'itens'}
                      </span>
                    </h3>

                    <div className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-neutral-800'}`}>
                      {prodsInCat.map((product) => {
                        const effectivePrice = product.promoPrice ?? product.price;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleOpenProduct(product)}
                            className={`py-4 flex items-start justify-between gap-4 cursor-pointer transition-colors group ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-850/40'
                              }`}
                          >
                            <div className="flex-1 min-w-0 pr-1">
                              <h4 className={`text-base sm:text-lg font-bold group-hover:text-[var(--brand-accent)] transition-colors leading-snug ${isLight ? 'text-slate-900' : 'text-white'
                                }`}>
                                {product.name}
                              </h4>

                              {(product.ingredients || product.description) && (
                                <div className="mt-1">
                                  <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-300'
                                    }`}>
                                    {product.ingredients ? `Sabores: ${product.ingredients}` : product.description}
                                  </p>
                                  <span
                                    className="text-xs font-bold underline inline-block mt-0.5 cursor-pointer"
                                    style={{ color: brandAccent }}
                                  >
                                    Ver mais
                                  </span>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base sm:text-lg font-extrabold" style={{ color: brandAccent }}>
                                    R$ {effectivePrice.toFixed(2)}
                                  </span>
                                  {product.promoPrice && (
                                    <span className="text-xs text-slate-400 line-through">
                                      R$ {product.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>

                                {!isMenuOnly && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleQuickAdd(e, product)}
                                    className="flex items-center gap-1 py-1 px-3 rounded-lg font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer text-white"
                                    style={{
                                      backgroundColor: brandAccent,
                                      color: '#ffffff',
                                    }}
                                  >
                                    <Plus className="w-3.5 h-3.5 text-white" />
                                    <span>Adicionar</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {product.imageUrl && (
                              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border shadow-2xs ${isLight ? 'border-slate-200 bg-slate-100' : 'border-neutral-800 bg-neutral-900'
                                }`}>
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              // Categoria selecionada ou termo pesquisado
              <div className="space-y-2">
                <h3 className={`text-lg sm:text-xl font-black border-b pb-2 flex items-center justify-between ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-neutral-800'
                  }`}>
                  <span>
                    {selectedCategory !== 'todas'
                      ? activeCategories.find((c) => c.id === selectedCategory)?.label || 'Produtos Selecionados'
                      : `Resultados para: "${searchQuery}"`}
                  </span>
                  <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
                  </span>
                </h3>

                <div className={`divide-y ${isLight ? 'divide-slate-200/80' : 'divide-neutral-800'}`}>
                  {filteredProducts.map((product) => {
                    const effectivePrice = product.promoPrice ?? product.price;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleOpenProduct(product)}
                        className={`py-4 flex items-start justify-between gap-4 cursor-pointer transition-colors group ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-850/40'
                          }`}
                      >
                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className={`text-base sm:text-lg font-bold group-hover:text-[var(--brand-accent)] transition-colors leading-snug ${isLight ? 'text-slate-900' : 'text-white'
                            }`}>
                            {product.name}
                          </h4>

                          {(product.ingredients || product.description) && (
                            <div className="mt-1">
                              <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-300'
                                }`}>
                                {product.ingredients ? `Sabores: ${product.ingredients}` : product.description}
                              </p>
                              <span
                                className="text-xs font-bold underline inline-block mt-0.5 cursor-pointer"
                                style={{ color: brandAccent }}
                              >
                                Ver mais
                              </span>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-baseline gap-2">
                              <span className="text-base sm:text-lg font-extrabold" style={{ color: brandAccent }}>
                                R$ {effectivePrice.toFixed(2)}
                              </span>
                              {product.promoPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  R$ {product.price.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {!isMenuOnly && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickAdd(e, product)}
                                className="flex items-center gap-1 py-1.5 px-3.5 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 3px 10px ${brandPrimary}40`,
                                  color: '#ffffff',
                                }}
                              >
                                <Plus className="w-3.5 h-3.5 text-white" />
                                <span>Adicionar</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {product.imageUrl && (
                          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border shadow-2xs ${isLight ? 'border-slate-200 bg-slate-100' : 'border-neutral-800 bg-neutral-900'
                            }`}>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Retail / Gastronomy Product Grid: 2 colunas no celular, 3 a 4 no desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const effectivePrice = product.promoPrice ?? product.price;

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenProduct(product)}
                  className={`group rounded-xl sm:rounded-2xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md border ${isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-white'
                    }`}
                >
                  {/* Product Image Slot (compacto no mobile h-28 a h-32, h-48 no desktop) */}
                  <div className="relative w-full h-28 sm:h-40 md:h-48 bg-neutral-950 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                        <Flame className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center gap-1">
                      {product.isChilledAvailable && (
                        <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-sky-400 border border-sky-500/30 flex items-center gap-0.5">
                          <Snowflake className="w-2.5 h-2.5" /> Gelada
                        </span>
                      )}
                      {product.promoPrice && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-red-600 text-white">
                          OFERTA
                        </span>
                      )}
                    </div>

                    {product.alcoholContent && (
                      <span className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-neutral-300 border border-white/10">
                        {product.alcoholContent}
                      </span>
                    )}
                  </div>

                  {/* Product Metadata & Actions */}
                  <div className="p-2 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Clean unboxed metadata with dot separator */}
                      <div className={`flex items-center gap-1 text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold truncate ${isLight ? 'text-slate-500' : 'text-neutral-400'
                        }`}>
                        <span className="truncate">{getCategoryDisplayName(product.category, currentTenant?.businessSegment, currentTenant?.categories || currentTenant?.customCategories)}</span>
                        {product.volume && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate font-mono">{product.volume}</span>
                          </>
                        )}
                      </div>

                      <h3 className={`text-xs sm:text-sm font-bold mt-0.5 transition-colors line-clamp-2 leading-tight ${isLight ? 'text-slate-900 group-hover:text-[var(--brand-accent)]' : 'text-white group-hover:text-[var(--brand-accent)]'
                        }`}>
                        {product.name}
                      </h3>

                      {product.ingredients ? (
                        <p className={`text-[10px] sm:text-[11px] line-clamp-2 mt-1 italic leading-tight ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                          <span className="font-semibold not-italic" style={{ color: brandAccent }}>Ingredientes: </span>
                          {product.ingredients}
                        </p>
                      ) : product.description ? (
                        <p className={`text-[10px] sm:text-xs line-clamp-2 mt-1 leading-tight ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {product.description}
                        </p>
                      ) : null}
                    </div>

                    {/* Price & Add Button */}
                    <div className={`pt-2 border-t flex items-center justify-between gap-1 ${isLight ? 'border-slate-100' : 'border-neutral-800/80'
                      }`}>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                          <span
                            className="text-xs sm:text-base font-extrabold block leading-none"
                            style={{ color: brandAccent }}
                          >
                            R$ {effectivePrice.toFixed(2)}
                          </span>
                          {product.promoPrice && (
                            <span className="text-[10px] sm:text-xs text-neutral-500 line-through">
                              R$ {product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex items-center justify-center gap-1 py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                          boxShadow: `0 2px 8px ${brandPrimary}35`,
                          color: '#ffffff',
                        }}
                        title="Adicionar ao Carrinho"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                        <span className="hidden sm:inline text-white font-bold">Adicionar</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className={`p-12 text-center rounded-2xl border space-y-2 ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}>
            <Beer className="w-8 h-8 text-neutral-500 mx-auto" />
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Nenhum produto encontrado</h4>
            <p className="text-xs">
              Tente buscar por outro termo ou selecione outra categoria.
            </p>
          </div>
        )}
      </div>

      {/* Storefront Footer with Store Details & Discreet Merchant Login */}
      {!isGastronomy && !isMenuOnly && (
        <footer className={`mt-16 pt-8 pb-12 border-t transition-colors text-xs ${isLight
            ? 'border-slate-200 bg-white/70 text-slate-700'
            : 'border-neutral-800/80 bg-transparent text-neutral-300'
          }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                style={{ backgroundColor: currentTenant.branding.primaryColor || '#0284C7' }}
              >
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentTenant.name}
                </h4>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {currentTenant.address.street}, {currentTenant.address.number} - {currentTenant.address.neighborhood}, {currentTenant.address.city}
                </p>
              </div>
            </div>

            {/* Merchant Discreet Entry Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setViewRole('tenant_admin')}
                className={`px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                  }`}
              >
                <Lock className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                <span>Área do Lojista (Painel & PDV)</span>
              </button>

              <button
                onClick={() => setViewRole('register_tenant')}
                className={`px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-xs'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                <span>Criar Minha Loja</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      </div>

      {/* Floating Bottom Cart Bar (Apenas se NÃO for modo somente cardápio e houver itens) */}
      {!isMenuOnly && totalCartItems > 0 && (
        <div className="fixed bottom-18 sm:bottom-6 inset-x-4 max-w-lg mx-auto z-30">
          <div className="p-3.5 rounded-2xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700 text-white shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
                style={{
                  background: brandPrimary,
                  color: '#ffffff',
                }}
              >
                {totalCartItems}
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">Total do Pedido:</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  R$ {totalCartAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                boxShadow: `0 4px 16px ${brandPrimary}50`,
              }}
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Ver Carrinho & Pedir</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR FIXA NO CELULAR: 3 ABAS NO MODO CARDÁPIO (Cardápio, Busca, Entrar) OU 4 ABAS NO MODO LOJA */}
      {isMenuOnly ? (
        <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 h-[58px] grid grid-cols-3 items-center justify-items-center shadow-lg safe-area-pb transition-colors ${isLight ? 'bg-white border-t border-[#e2e8f0] text-[#0F1111]' : 'bg-[#0E1318]/95 backdrop-blur-md border-t border-[#1C2631] text-white shadow-2xl'
          }`}>
          {/* 1. Cardápio */}
          {(() => {
            const isActive = !isMobileSearchModalOpen && !isMobileAccountModalOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchModalOpen(false);
                  setIsMobileAccountModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setSelectedCategory('todas');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <BookOpen className="w-[22px] h-[22px] stroke-[1.75]" />
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Cardápio
                </span>
              </button>
            );
          })()}

          {/* 2. Busca */}
          {(() => {
            const isActive = isMobileSearchModalOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsMobileAccountModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setIsMobileSearchModalOpen(true);
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <Search className="w-[22px] h-[22px] stroke-[1.75]" />
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Busca
                </span>
              </button>
            );
          })()}

          {/* 3. Entrar */}
          {(() => {
            const isActive = isMobileAccountModalOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setIsMobileAccountModalOpen(true);
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <LogIn className="w-[22px] h-[22px] stroke-[1.75]" />
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Entrar
                </span>
              </button>
            );
          })()}
        </div>
      ) : (
        <div className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 h-[58px] grid grid-cols-4 items-center justify-items-center shadow-lg safe-area-pb transition-colors ${isLight ? 'bg-white border-t border-[#e2e8f0] text-[#0F1111]' : 'bg-[#0E1318]/95 backdrop-blur-md border-t border-[#1C2631] text-white shadow-2xl'
          }`}>
          {/* 1. Início */}
          {(() => {
            const isActive = !isCartOpen && !isMobileSearchModalOpen && !isMobileAccountModalOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsMobileSearchModalOpen(false);
                  setIsMobileAccountModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setSelectedCategory('todas');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <Home className="w-[22px] h-[22px] stroke-[1.75]" />
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Início
                </span>
              </button>
            );
          })()}

          {/* 2. Conta */}
          {(() => {
            const isActive = isMobileAccountModalOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsMobileSearchModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setIsMobileAccountModalOpen(true);
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <User className="w-[22px] h-[22px] stroke-[1.75]" />
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Conta
                </span>
              </button>
            );
          })()}

          {/* 3. Carrinho */}
          {(() => {
            const isActive = isCartOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchModalOpen(false);
                  setIsMobileAccountModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setIsCartOpen(prev => !prev);
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <div className="relative">
                  <ShoppingCart className="w-[22px] h-[22px] stroke-[1.75]" />
                  <span
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-black leading-none px-1 rounded-full text-white"
                    style={{ backgroundColor: brandPrimary }}
                  >
                    {totalCartItems}
                  </span>
                </div>
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Carrinho
                </span>
              </button>
            );
          })()}

          {/* 4. Pesquisar */}
          {(() => {
            const isActive = isMobileSearchModalOpen;
            return (
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsMobileAccountModalOpen(false);
                  setIsMobileMenuDrawerOpen(false);
                  setIsMobileSearchModalOpen(true);
                }}
                style={isActive ? { color: brandAccent } : {}}
                className={`relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer ${
                  isActive ? 'font-bold' : isLight ? 'text-[#0F1111]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 w-12 h-[4px] rounded-b-full transition-all"
                    style={{
                      background: `linear-gradient(90deg, ${brandPrimary}, ${brandAccent})`,
                      boxShadow: `0 2px 10px ${brandAccent}70`
                    }}
                  />
                )}
                <Search className="w-[22px] h-[22px] stroke-[1.75]" />
                <span className={`text-[11px] leading-tight tracking-tight mt-1 ${isActive ? 'font-black' : 'font-normal'}`}>
                  Pesquisar
                </span>
              </button>
            );
          })()}
        </div>
      )}

      {/* GAVETA DO CARDÁPIO (MOBILE BOTTOM SHEET) */}
      {isMobileMenuDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="absolute inset-0" onClick={() => setIsMobileMenuDrawerOpen(false)} />
          <div className={`relative rounded-t-3xl border-t p-5 max-h-[82vh] overflow-y-auto space-y-4 shadow-2xl ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: brandAccent }} />
                <h3 className="font-extrabold text-sm">Cardápio & Categorias</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opção Cardápio Geral */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('todas');
                setIsMobileMenuDrawerOpen(false);
              }}
              className={`w-full p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${selectedCategory === 'todas'
                  ? 'shadow-xs font-black'
                  : isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                }`}
              style={selectedCategory === 'todas' ? {
                borderColor: brandAccent,
                backgroundColor: `${brandAccent}15`,
                color: isLight ? '#0f172a' : brandAccent,
              } : {}}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4" style={{ color: brandAccent }} />
                <span>Cardápio Geral (Todos os Itens)</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                {tenantProducts.length}
              </span>
            </button>

            {/* Lista com todas as categorias do estabelecimento */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block px-1">
                Seções do Cardápio
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsMobileMenuDrawerOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${isSelected
                          ? 'shadow-xs font-black'
                          : isLight
                            ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                            : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                        }`}
                      style={isSelected ? {
                        borderColor: brandAccent,
                        backgroundColor: `${brandAccent}15`,
                        color: isLight ? '#0f172a' : brandAccent,
                      } : {}}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ color: brandAccent }}>
                          {categoryIcons[cat.id] || <Sparkles className="w-4 h-4" />}
                        </div>
                        <span className="font-bold">{cat.label}</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                        {cat.count} itens
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TELA INTEIRA DE PESQUISA & MENU DE CATEGORIAS (MOBILE & DESKTOP) */}
      {isMobileSearchModalOpen && (
        <div className={`fixed inset-x-0 top-0 bottom-[58px] sm:bottom-0 sm:inset-0 z-40 sm:z-50 p-4 sm:p-8 flex flex-col overflow-y-auto transition-colors ${isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F12] text-white'
          }`}>
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Header da Busca - idêntico à imagem de referência */}
            <div className="flex items-center gap-3">
              <div className={`relative flex-1 rounded-2xl border flex items-center px-4 py-2.5 shadow-2xs ${isLight ? 'bg-white border-slate-300' : 'bg-neutral-900 border-neutral-700'
                }`}>
                <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500 shrink-0 mr-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos"
                  className={`w-full text-sm sm:text-base font-medium focus:outline-none bg-transparent ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-neutral-500'
                    }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Seção Categorias com Chips Arredondados idêntica à imagem enviada */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 mb-3">
                Categorias
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                      }}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer border shadow-2xs ${isSelected
                          ? 'border-transparent shadow-xs font-bold'
                          : isLight
                            ? 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-neutral-500'
                        }`}
                      style={isSelected ? {
                        backgroundColor: brandAccent,
                        color: '#09090b',
                      } : {}}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista ou Grid de Resultados ao Clicar na Categoria ou Buscar */}
            <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-neutral-400">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  {selectedCategory !== 'todas' && ` na categoria "${activeCategories.find(c => c.id === selectedCategory)?.label}"`}
                  {searchQuery && ` para "${searchQuery}"`}
                </span>

                <button
                  type="button"
                  onClick={() => setIsMobileSearchModalOpen(false)}
                  className="text-xs sm:text-sm font-bold underline cursor-pointer"
                  style={{ color: brandAccent }}
                >
                  Abrir no cardápio
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 pb-12">
                {filteredProducts.map((product) => {
                  const effectivePrice = product.promoPrice ?? product.price;
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsMobileSearchModalOpen(false);
                        handleOpenProduct(product);
                      }}
                      className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-md ${isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        }`}
                    >
                      <div className="w-full h-24 sm:h-32 rounded-xl bg-neutral-950/10 dark:bg-neutral-950 overflow-hidden mb-2">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <Flame className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold line-clamp-1 leading-tight">{product.name}</h4>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-400 line-clamp-1 mt-0.5">{product.volume}</span>
                      <span className="text-xs sm:text-sm font-extrabold font-mono mt-1.5 block" style={{ color: brandAccent }}>
                        R$ {effectivePrice.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TELA INTEIRA DE CONTA NO CELULAR */}
      {isMobileAccountModalOpen && (
        <div className={`sm:hidden fixed inset-x-0 top-0 bottom-[58px] z-40 overflow-y-auto p-4 space-y-4 transition-colors ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F12] text-white'
        }`}>
          {/* Header da Tela de Conta */}
          <div className={`flex items-center justify-between pb-3 border-b ${
            isLight ? 'border-slate-200' : 'border-[#1C2631]'
          }`}>
            <div className="flex items-center gap-2.5">
              {currentTenant.logoUrl ? (
                <img src={currentTenant.logoUrl} alt={currentTenant.name} className="w-8 h-8 rounded-xl object-cover border shadow-xs" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentTenant.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Minha Conta</h2>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{currentTenant.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileAccountModalOpen(false)}
              className={`p-1.5 rounded-full cursor-pointer ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#1C2631] text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Card de Identificação do Cliente */}
          <div className={`p-4 rounded-3xl flex items-center gap-3.5 border shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
          }`}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: `${brandAccent}20`, color: brandAccent }}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Cliente {currentTenant.name}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pedidos rápidos & acompanhamento
              </p>
            </div>
          </div>

          {/* 2. Card de Mesa no Salão (Se estiver em uma mesa) */}
          {tableNumber && (
            <div className={`p-4 rounded-3xl border space-y-2 shadow-xs ${
              isLight ? 'bg-sky-50/80 border-sky-200 text-sky-950' : 'bg-sky-950/25 border-sky-500/30 text-sky-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-sky-500" />
                  Mesa {tableNumber} (Em Atendimento)
                </span>
                <span className="font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                  R$ {tableOrdersTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Acompanhe os pedidos lançados na sua comanda ou peça a conta.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsMobileAccountModalOpen(false);
                  setIsTableOrdersModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Ver Extrato da Comanda / Mesa</span>
              </button>
            </div>
          )}

          {/* 3. Card Destaque: Instalar Aplicativo no Celular com Logo */}
          <div
            onClick={() => {
              setIsMobileAccountModalOpen(false);
              setIsInstallAppModalOpen(true);
            }}
            className="p-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/15 flex items-center gap-3.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Smartphone className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">
                Instalar App {currentTenant.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                Coloque o ícone da loja na sua tela inicial para pedir em 1 toque
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          {/* 4. Lista de Atalhos Principais para o Cliente */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Atalhos & Serviços
            </span>

            {/* Falar no WhatsApp */}
            {currentTenant.whatsapp?.supportLinkEnabled && (
              <a
                href={generateWhatsAppDirectChatUrl(currentTenant)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 font-bold text-xs transition-all shadow-2xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50' : 'bg-[#11161B] border-[#1C2631] text-white hover:bg-[#161F28]'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500 text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <span className="block text-xs font-bold">Falar no WhatsApp da Loja</span>
                  <span className="text-[10px] font-normal text-slate-400">Atendimento, pedidos especiais e suporte</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </a>
            )}

            {/* Informações da Loja, Horários e Mapa */}
            <button
              type="button"
              onClick={() => {
                setIsMobileAccountModalOpen(false);
                setIsStoreInfoModalOpen(true);
              }}
              className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                isLight ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50' : 'bg-[#11161B] border-[#1C2631] text-white hover:bg-[#161F28]'
              }`}
            >
              <div className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800 text-neutral-300'}`}>
                <Info className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <span className="block text-xs font-bold">Informações & Horários</span>
                <span className="text-[10px] font-normal text-slate-400">Endereço, formas de pagamento e localização</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Alternar Tema Claro / Escuro */}
            <button
              type="button"
              onClick={toggleThemeMode}
              className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 font-bold text-xs transition-all cursor-pointer shadow-2xs ${
                isLight ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50' : 'bg-[#11161B] border-[#1C2631] text-white hover:bg-[#161F28]'
              }`}
            >
              <div className={`p-2 rounded-xl ${isLight ? 'bg-amber-100 text-amber-700' : 'bg-neutral-800 text-amber-400'}`}>
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div className="text-left flex-1">
                <span className="block text-xs font-bold">{isLight ? 'Ativar Modo Escuro (Dark)' : 'Ativar Modo Claro'}</span>
                <span className="text-[10px] font-normal text-slate-400">Aparência visual do cardápio</span>
              </div>
            </button>
          </div>

          {/* 5. Área Administrativa / Lojista (Discreta no Rodapé) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Administração da Loja
            </span>

            <button
              type="button"
              onClick={() => {
                setIsMobileAccountModalOpen(false);
                setViewRole('login_tenant');
              }}
              className={`w-full p-3 rounded-2xl border flex items-center gap-3 font-semibold text-xs transition-all cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#11161B] hover:bg-[#161F28] border-[#1C2631] text-slate-300'
              }`}
            >
              <Lock className="w-4 h-4 text-sky-500" />
              <span className="flex-1 text-left text-xs">Área do Lojista (Painel & PDV)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={addToCart}
        themeColor={brandAccent}
        isMenuOnly={isMenuOnly}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tenant={currentTenant}
        onOrderCompleted={handleOrderCompleted}
        tableNumber={tableNumber || undefined}
        onSetTableNumber={(tbl) => setTableNumber(tbl)}
        isTableServiceEnabled={isTableActive}
      />

      {/* Modal Selecionar Número da Mesa */}
      {isTableSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsTableSelectorOpen(false)} />
          <div className={`relative max-w-sm w-full rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-4 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Identificar Mesa</h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">Em qual mesa você está sentado?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTableSelectorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-neutral-300">
                Digite o número da sua mesa:
              </label>
              <input
                type="text"
                autoFocus
                value={tempTableInput}
                onChange={(e) => setTempTableInput(e.target.value)}
                placeholder="Ex: Mesa 04 ou 4"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 ${isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900'
                    : 'bg-neutral-950 border border-neutral-700 text-white'
                  }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (tempTableInput.trim()) {
                      setTableNumber(tempTableInput.trim());
                      setIsTableSelectorOpen(false);
                    }
                  }
                }}
              />
            </div>

            {/* Atalhos rápidos de mesa */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block mb-2">
                Atalhos Rápidos:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: Math.min(12, currentTenant.config?.tableCount || 12) }, (_, i) => {
                  const num = String(i + 1).padStart(2, '0');
                  const mesaStr = `Mesa ${num}`;
                  const isSelected = tableNumber === mesaStr || tableNumber === String(i + 1);
                  return (
                    <button
                      key={mesaStr}
                      type="button"
                      onClick={() => {
                        setTableNumber(mesaStr);
                        setIsTableSelectorOpen(false);
                      }}
                      style={isSelected ? { backgroundColor: brandPrimary, borderColor: brandPrimary } : {}}
                      className={`p-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${isSelected
                          ? 'text-white shadow-sm'
                          : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {tableNumber && (
                <button
                  type="button"
                  onClick={() => {
                    setTableNumber(null);
                    setIsTableSelectorOpen(false);
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Limpar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (tempTableInput.trim()) {
                    setTableNumber(tempTableInput.trim());
                  }
                  setIsTableSelectorOpen(false);
                }}
                style={{ backgroundColor: brandPrimary }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 text-white transition-all shadow-md"
              >
                Confirmar Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Extrato da Conta da Mesa (Cliente Consulta) */}
      {isTableOrdersModalOpen && tableNumber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsTableOrdersModalOpen(false)} />
          <div className={`relative max-w-md w-full rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <ReceiptText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    Extrato Parcial • {tableNumber.replace(/[^0-9]/g, '') ? `Mesa ${tableNumber.replace(/[^0-9]/g, '')}` : tableNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {tableOrders.length} {tableOrders.length === 1 ? 'pedido lançado' : 'pedidos lançados'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTableOrdersModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista dos Pedidos da Mesa */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {tableOrders.map((ord, idx) => (
                <div
                  key={ord.id}
                  className={`p-3 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: brandPrimary }}>
                      Rodada #{idx + 1} • {ord.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ord.status === 'novo'
                        ? 'bg-amber-500/15 text-amber-500'
                        : ord.status === 'preparando'
                          ? 'bg-blue-500/15 text-blue-500'
                          : ord.status === 'pronto'
                            ? 'bg-emerald-500/15 text-emerald-500 font-black'
                            : 'bg-slate-500/15 text-slate-500'
                      }`}>
                      {ord.status === 'novo' ? 'Na Cozinha' : ord.status === 'preparando' ? 'Em Preparo' : ord.status === 'pronto' ? 'Pronto para Servir' : 'Entregue'}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-neutral-800">
                    {ord.items.map((it, iIdx) => (
                      <div key={iIdx} className="py-1 flex justify-between items-center text-slate-700 dark:text-neutral-300">
                        <span>
                          <strong className="text-slate-900 dark:text-white">{it.quantity}x</strong> {it.productName}
                        </span>
                        <span className="font-mono">R$ {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-200 dark:border-neutral-800 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Subtotal:</span>
                    <span>R$ {ord.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Acumulado */}
            <div
              className={`p-3.5 rounded-2xl border shrink-0 space-y-1.5 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-neutral-950/80 text-white'
                }`}
              style={{ borderColor: `${brandPrimary}40` }}
            >
              <div className="flex justify-between items-baseline font-black">
                <span className="text-xs uppercase tracking-wider">Total Consumido:</span>
                <span className="text-lg font-black" style={{ color: brandPrimary }}>
                  R$ {tableOrdersTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                💳 Para fechar sua conta e efetuar o pagamento, solicite o encerramento ao garçom ou dirija-se ao caixa informando sua mesa.
              </p>
            </div>

            <div className="pt-1 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTableOrdersModalOpen(false)}
                style={{ backgroundColor: brandPrimary }}
                className="w-full py-2.5 rounded-xl font-bold text-xs hover:opacity-90 text-white transition-all shadow-md"
              >
                Voltar ao Cardápio & Pedir Mais
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        tenant={currentTenant}
      />

      {/* MODAL DE INFORMAÇÕES DO ESTABELECIMENTO (HORÁRIOS, CARTÕES, ENDEREÇO) */}
      {isStoreInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setIsStoreInfoModalOpen(false)} />

          <div className={`relative max-w-lg w-full rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-5 my-8 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}>
            {/* Header com Logo, Nome e Botão Fechar */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-150 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                {currentTenant.branding.logoUrl ? (
                  <div className={`w-12 h-12 rounded-xl p-1 border shrink-0 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/60 border-neutral-700'}`}>
                    <img src={currentTenant.branding.logoUrl} alt={currentTenant.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: brandAccent }}
                  >
                    {currentTenant.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight">{currentTenant.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{currentTenant.slogan || 'Cardápio Digital & Atendimento Oficial'}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${currentTenant.isOpen
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentTenant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {currentTenant.isOpen ? 'Aberto Agora' : 'Fechado no momento'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStoreInfoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* 1. Horários de Funcionamento */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: brandAccent }}>
                    <Clock className="w-4 h-4 text-black" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300">Horário de Funcionamento</h4>
                </div>
                <div className="pl-8 space-y-1">
                  <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {currentTenant.address.openingHours || 'Segunda a Sábado: 10h às 00h'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Atendimento no local e pedidos expressos direto pelo cardápio.
                  </p>
                </div>
              </div>

              {/* 2. Formas de Pagamento & Cartões Aceitos */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: brandAccent }}>
                    <CreditCard className="w-4 h-4 text-black" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300">Formas de Pagamento Aceitas</h4>
                </div>
                <div className="pl-8 space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2.5 py-1 rounded-lg border font-semibold bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200">
                      💳 Cartão de Crédito
                    </span>
                    <span className="px-2.5 py-1 rounded-lg border font-semibold bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200">
                      💳 Cartão de Débito
                    </span>
                    <span className="px-2.5 py-1 rounded-lg border font-bold bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300">
                      ⚡ PIX Instantâneo
                    </span>
                    <span className="px-2.5 py-1 rounded-lg border font-semibold bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200">
                      💵 Dinheiro / Troco
                    </span>
                    {isGastronomy && (
                      <span className="px-2.5 py-1 rounded-lg border font-semibold bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200">
                        🍽️ Vale Refeição (VR / Ticket)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Bandeiras aceitas na maquininha: Visa, Mastercard, Elo, Hipercard, American Express.
                  </p>
                </div>
              </div>

              {/* 3. Endereço Completo & Localização */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: brandAccent }}>
                    <MapPin className="w-4 h-4 text-black" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300">Endereço & Localização</h4>
                </div>
                <div className="pl-8 space-y-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-neutral-100">
                    {currentTenant.address.street}, {currentTenant.address.number}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Bairro {currentTenant.address.neighborhood} - {currentTenant.address.city}
                  </p>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${currentTenant.name}, ${currentTenant.address.street}, ${currentTenant.address.number}, ${currentTenant.address.neighborhood}, ${currentTenant.address.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold underline transition-colors pt-1"
                    style={{ color: brandAccent }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Como chegar (Abrir no Google Maps)</span>
                  </a>
                </div>
              </div>

              {/* 4. Contato & WhatsApp */}
              {currentTenant.whatsapp?.supportLinkEnabled && (
                <div className={`p-3.5 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'}`}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg text-white bg-emerald-600">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300">Contato & Atendimento</h4>
                  </div>
                  <div className="pl-8 flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-neutral-300">WhatsApp oficial da loja</span>
                    <a
                      href={generateWhatsAppDirectChatUrl(currentTenant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Falar no WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsStoreInfoModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border text-white"
                style={{
                  backgroundColor: brandAccent,
                  color: '#ffffff',
                  borderColor: brandAccent,
                }}
              >
                Voltar ao Cardápio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SALVAR APP NO CELULAR COM LOGO (PWA) */}
      {isInstallAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#11161B] text-slate-900 dark:text-white border border-slate-200 dark:border-[#1C2631] shadow-2xl overflow-hidden text-center">
            
            {/* Topo com Botão Fechar */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                📱 Aplicativo da Loja
              </span>
              <button
                type="button"
                onClick={() => setIsInstallAppModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Logo do Estabelecimento */}
              <div className="relative inline-block mx-auto">
                {currentTenant.logoUrl ? (
                  <img
                    src={currentTenant.logoUrl}
                    alt={currentTenant.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-xl border-2 border-white dark:border-slate-700 ring-4 ring-emerald-500/20 mx-auto"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl mx-auto border-2 border-white">
                    <Store className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>

              {/* Informações da Loja */}
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Instalar App {currentTenant.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tenha nosso cardápio na tela inicial do seu celular, com o ícone da loja junto aos seus aplicativos!
                </p>
              </div>

              {/* Instruções ou Ação de Instalação */}
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={async () => {
                    deferredPrompt.prompt();
                    const choice = await deferredPrompt.userChoice;
                    if (choice.outcome === 'accepted') {
                      setIsInstallAppModalOpen(false);
                      showAlert({
                        title: '🎉 App Instalado!',
                        message: `O app da ${currentTenant.name} foi adicionado à sua tela inicial!`,
                        variant: 'success'
                      });
                    }
                    setDeferredPrompt(null);
                  }}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Adicionar à Tela Inicial Agora</span>
                </button>
              ) : isIOSDevice ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2.5">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Como adicionar no iPhone (Safari):
                  </span>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                    <span>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima na barra inferior).</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                    <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> ➕.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <span>Toque em <strong>Adicionar</strong>. O ícone da loja aparecerá na sua tela!</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    No seu navegador:
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Toque nos <strong>3 pontinhos</strong> do navegador (canto superior ou inferior) e selecione <strong>"Adicionar à Tela Inicial"</strong> ou <strong>"Instalar Aplicativo"</strong>.
                  </p>
                </div>
              )}

              {/* Botões Secundários: WhatsApp e Copiar Link */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Acesse o cardápio da ${currentTenant.name}: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Salvar no Zap</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(window.location.href);
                      setIsCopiedStoreLink(true);
                      setTimeout(() => setIsCopiedStoreLink(false), 2000);
                    } catch {}
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isCopiedStoreLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-sky-500" />}
                  <span>{isCopiedStoreLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
