import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CategoryType, Order } from '../../types';
import { getTenantActiveCategories, getCategoryDisplayName } from '../../data/businessSegments';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { OrderConfirmationModal } from './OrderConfirmationModal';
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
  CreditCard,
  ExternalLink,
  Sun,
  Moon,
  LayoutGrid,
  List
} from 'lucide-react';

export const StorefrontView: React.FC = () => {
  const {
    currentTenant,
    tenantProducts,
    cart,
    addToCart,
    generateWhatsAppDirectChatUrl,
    setViewRole,
    themeMode,
    toggleThemeMode,
  } = useStore();

  const isLight = themeMode === 'light';

  // Controle de Layout do Cardápio: Grade com fotos grandes vs Lista com miniatura lateral
  const [viewModeOverride, setViewModeOverride] = useState<'grid' | 'list' | null>(null);

  const configuredLayout = currentTenant?.config?.catalogLayout || currentTenant?.branding?.catalogLayout;
  const isListLayout = (viewModeOverride ?? configuredLayout ?? (currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa' ? 'list' : 'grid')) === 'list';

  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyChilled, setFilterOnlyChilled] = useState(false);
  const [filterOnlyPromo, setFilterOnlyPromo] = useState(false);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
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

      {/* Brand Hero Banner with Tenant Colors & Flyer Wallpaper */}
      {(() => {
        const lighting = currentTenant.branding.bannerLighting || 'dark_lights';
        const isWhite = lighting === 'white_lights';
        const isDarkLights = lighting === 'dark_lights';
        const isNeutral = lighting === 'neutral';

        let overlayBg = `linear-gradient(105deg, ${brandPrimary}F2 0%, ${brandPrimary}B3 50%, rgba(10, 10, 10, 0.88) 100%)`;
        let overlayBoxShadow = 'none';

        if (isNeutral) {
          overlayBg = 'linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.75) 100%)';
        } else if (isDarkLights) {
          overlayBg = `
            radial-gradient(circle at 82% 18%, ${brandAccent}45 0%, rgba(14, 165, 233, 0.25) 30%, transparent 65%),
            radial-gradient(circle at 95% 82%, rgba(14, 165, 233, 0.20) 0%, transparent 45%),
            linear-gradient(130deg, transparent 52%, rgba(255, 255, 255, 0.08) 68%, ${brandAccent}30 73%, transparent 84%),
            linear-gradient(to right, 
              rgba(8, 8, 8, 0.97) 0%, 
              rgba(10, 10, 10, 0.92) 28%, 
              rgba(10, 10, 10, 0.68) 50%, 
              rgba(10, 10, 10, 0.22) 72%, 
              rgba(5, 5, 5, 0.04) 100%
            )
          `;
          overlayBoxShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 0 50px rgba(0, 0, 0, 0.6)';
        } else if (isWhite) {
          overlayBg = `
            radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.75) 0%, rgba(254, 243, 199, 0.35) 28%, transparent 62%),
            radial-gradient(circle at 95% 82%, ${brandAccent}25 0%, transparent 45%),
            linear-gradient(130deg, transparent 52%, rgba(255, 255, 255, 0.45) 68%, rgba(255, 250, 235, 0.65) 73%, transparent 84%),
            linear-gradient(to right, 
              rgba(255, 255, 255, 0.98) 0%, 
              rgba(255, 255, 255, 0.95) 28%, 
              rgba(255, 255, 255, 0.76) 50%, 
              rgba(255, 255, 255, 0.28) 72%, 
              rgba(255, 255, 255, 0.05) 100%
            )
          `;
          overlayBoxShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.95), inset 0 -1px 30px rgba(0, 0, 0, 0.05)';
        }

        return (
          <div
            className={`rounded-3xl border overflow-hidden relative mb-6 transition-all duration-300 ${
              isWhite 
                ? 'border-neutral-200/90 bg-white ring-1 ring-white/90 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08),_0_0_25px_rgba(255,255,255,0.7)]' 
                : isDarkLights
                ? 'border-neutral-800 bg-neutral-950 shadow-2xl ring-1 ring-white/10'
                : 'border-neutral-800 bg-neutral-950 shadow-2xl'
            }`}
          >
            {/* Background Wallpaper Flyer Layer com animação cinematográfica contínua */}
            {currentTenant.branding.bannerUrl ? (
              <div
                className={`absolute inset-0 bg-cover bg-center animate-banner-kenburns ${
                  (isWhite || isDarkLights) ? 'contrast-[1.10] saturate-[1.15]' : ''
                }`}
                style={{ backgroundImage: `url(${currentTenant.branding.bannerUrl})` }}
              />
            ) : (
              <div
                className="absolute inset-0 transition-colors"
                style={{ backgroundColor: isWhite ? '#ffffff' : (currentTenant.branding.primaryColor || '#881337') }}
              />
            )}

            {/* EFEITOS ESPECIAIS DE LUZ CINEMATOGRÁFICA SOBRE A IMAGEM ESCOLHIDA */}
            {/* 1. Feixe de Luz / Varredura Luminosa Periódica (Light Sweep) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
              <div 
                className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.15) 65%, transparent 100%)'
                }}
              />
            </div>

            {/* 2. Spotlight Pulsante de Iluminação de Estúdio no canto superior direito */}
            <div 
              className="pointer-events-none absolute -top-16 -right-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-2xl animate-banner-spotlight opacity-75 mix-blend-screen z-10"
              style={{
                background: `radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(254, 240, 138, 0.45) 30%, ${brandAccent}45 60%, transparent 80%)`
              }}
            />

            {/* 3. Brilho Ambiente no canto inferior */}
            <div 
              className="pointer-events-none absolute -bottom-10 left-1/4 w-72 h-36 rounded-full blur-3xl opacity-35 mix-blend-screen z-10"
              style={{
                background: `radial-gradient(ellipse, ${brandAccent}70 0%, transparent 70%)`
              }}
            />

            {/* 4. Linha Superior de Luz / Reflexo Especular */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90 z-10" />

            {/* Efeitos Especiais de Luzes Focadas e Feixes quando isWhite */}
            {isWhite && (
              <>
                {/* Feixe de Luz Angular / Prisma translúcido sobre a imagem */}
                <div 
                  className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    background: 'linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.8) 65%, transparent 80%)'
                  }}
                />
              </>
            )}

            {/* Efeitos Especiais de Luzes Focadas e Feixes quando isDarkLights */}
            {isDarkLights && (
              <>
                {/* Feixe de Luz Angular / Cyber Streak translúcido */}
                <div 
                  className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    background: 'linear-gradient(115deg, transparent 38%, rgba(255, 255, 255, 0.5) 65%, transparent 80%)'
                  }}
                />
              </>
            )}

            {/* Soft Contrast Gradient Layer */}
            <div
              className={`relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 ${
                isGastronomy || isMenuOnly ? 'p-4 sm:p-6 md:p-8' : 'p-4 sm:p-8 md:p-10'
              }`}
              style={{
                background: overlayBg,
                boxShadow: overlayBoxShadow,
              }}
            >
              <div className="space-y-2 sm:space-y-3 max-w-2xl">
                {/* Notice Badge & Horário: Removido em cardápios digitais para deixar limpo */}
                {!isGastronomy && !isMenuOnly && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border backdrop-blur-sm shadow-xs inline-flex items-center gap-1.5 transition-colors"
                      style={{
                        backgroundColor: `${brandAccent}28`,
                        color: brandAccent,
                        borderColor: `${brandAccent}60`,
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      {currentTenant.branding.badgeNotice || 'Bebidas no ponto certo'}
                    </span>

                    {/* Open / Closed Status */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${currentTenant.isOpen
                          ? isWhite ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isWhite ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currentTenant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {currentTenant.isOpen ? 'Aberto Agora' : 'Fechado no momento'}
                    </span>
                  </div>
                )}

                {/* LOGO, NOME E SLOGAN (CLICÁVEIS PARA ABRIR INFORMAÇÕES DA LOJA) */}
                <div 
                  onClick={() => setIsStoreInfoModalOpen(true)}
                  className="flex items-center gap-3.5 sm:gap-4 pt-1 cursor-pointer group select-none transition-all active:scale-[0.99]"
                  title="Toque para ver horários, cartões aceitos e endereço do estabelecimento"
                >
                  {currentTenant.branding.logoUrl ? (
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-1.5 border shrink-0 shadow-md transition-transform group-hover:scale-105 ${isWhite ? 'bg-white/95 border-slate-300 shadow-sm' : 'bg-black/60 border-white/20'
                      }`}>
                      <img
                        src={currentTenant.branding.logoUrl}
                        alt={currentTenant.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md shrink-0 border transition-transform group-hover:scale-105 ${isWhite ? 'bg-slate-900 text-white border-slate-700' : 'text-white border-white/20'
                        }`}
                      style={!isWhite ? { backgroundColor: brandAccent } : {}}
                    >
                      {currentTenant.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h1 
                        className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm group-hover:underline flex items-center gap-1.5"
                        style={{ color: isWhite ? '#0f172a' : '#ffffff' }}
                      >
                        <span>{currentTenant.name}</span>
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 opacity-80 group-hover:opacity-100 shrink-0 transition-opacity" style={{ color: brandAccent }} />
                      </h1>
                    </div>
                    <p 
                      className="text-xs sm:text-sm mt-0.5 font-medium drop-shadow-xs"
                      style={{ color: isWhite ? '#334155' : '#e2e8f0' }}
                    >
                      {currentTenant.slogan || (isGastronomy ? 'Cardápio Digital Oficial' : 'Sua distribuidora com entrega rápida e os melhores rótulos')}
                    </p>
                    <span 
                      className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold mt-1 px-2.5 py-0.5 rounded-full backdrop-blur-sm border shadow-xs group-hover:brightness-110 transition-all"
                      style={{
                        backgroundColor: `${brandAccent}25`,
                        color: isWhite ? '#0f172a' : brandAccent,
                        borderColor: `${brandAccent}50`,
                      }}
                    >
                      <Clock className="w-3 h-3 shrink-0" style={{ color: brandAccent }} />
                      <span>Ver horários, endereço e cartões ℹ️</span>
                    </span>
                  </div>
                </div>

                {/* Address & Operational Info: Removido em cardápios digitais para deixar visual limpo */}
                {!isGastronomy && !isMenuOnly && (
                  <div 
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs pt-0.5 drop-shadow-xs"
                    style={{ color: isWhite ? '#475569' : '#cbd5e1' }}
                  >
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: brandAccent }} />
                      {currentTenant.address.street}, {currentTenant.address.number} · {currentTenant.address.neighborhood}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: brandAccent }} />
                      {currentTenant.address.openingHours}
                    </span>
                    {currentTenant.address.freeDeliveryThreshold && (
                      <>
                        <span>·</span>
                        <span className="font-bold" style={{ color: brandAccent }}>
                          Frete Grátis acima de R$ {currentTenant.address.freeDeliveryThreshold.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Header Actions: Tema Claro/Escuro, WhatsApp e Sacola */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
                {/* Botão de Alternar Modo Claro / Modo Escuro na Vitrine */}
                <button
                  onClick={toggleThemeMode}
                  title={isLight ? 'Visualizar Vitrine em Modo Escuro' : 'Visualizar Vitrine em Modo Claro'}
                  style={{
                    backgroundColor: isWhite ? '#ffffff' : 'rgba(0, 0, 0, 0.75)',
                    color: isWhite ? '#0f172a' : '#ffffff',
                    borderColor: isWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.25)',
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer border ${
                    isWhite ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-black/90 text-white'
                  }`}
                >
                  {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
                  <span className="hidden sm:inline">{isLight ? 'Modo Escuro' : 'Modo Claro'}</span>
                </button>

                {!isGastronomy && !isMenuOnly && currentTenant.whatsapp.supportLinkEnabled && (
                  <a
                    href={generateWhatsAppDirectChatUrl(currentTenant)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {!isMenuOnly && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    style={{
                      backgroundColor: isWhite ? '#ffffff' : 'rgba(0, 0, 0, 0.75)',
                      color: isWhite ? '#0f172a' : '#ffffff',
                      borderColor: isWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.25)',
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer border ${
                      isWhite ? 'hover:bg-slate-100' : 'hover:bg-black/90'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" style={{ color: brandAccent }} />
                    <span className="hidden sm:inline" style={{ color: isWhite ? '#0f172a' : '#ffffff' }}>Sacola</span>
                    {totalCartItems > 0 && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs shrink-0"
                        style={{
                          backgroundColor: brandAccent,
                          color: '#09090b',
                        }}
                      >
                        {totalCartItems}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filter Toolbar & Category Navigation */}
      <div className="space-y-3">
        {/* Quick Filter Toggles */}
        <div className="flex items-center gap-2">
          {isAdega && (
            <button
              onClick={() => setFilterOnlyChilled(!filterOnlyChilled)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                filterOnlyChilled
                  ? 'bg-sky-500/15 border-sky-500/50 text-sky-600 dark:text-sky-400'
                  : isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Apenas Geladas</span>
            </button>
          )}

          <button
            onClick={() => setFilterOnlyPromo(!filterOnlyPromo)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
              filterOnlyPromo
                ? 'bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400'
                : isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Em Promoção</span>
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'todas'
                ? 'shadow-sm font-extrabold text-white'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
            }`}
            style={selectedCategory === 'todas' ? {
              backgroundColor: brandAccent,
              color: '#ffffff',
            } : {}}
          >
            Todos os Produtos ({tenantProducts.length})
          </button>

          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'shadow-sm font-extrabold text-white'
                    : isLight
                    ? 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white'
                }`}
                style={isSelected ? {
                  backgroundColor: brandAccent,
                  color: '#ffffff',
                } : {}}
              >
                {categoryIcons[cat.id] || <Sparkles className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
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
      </div>

      {/* SEÇÃO PRINCIPAL DO CARDÁPIO: EXIBE TODOS OS ITENS DIRETAMENTE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selectedCategory !== 'todas' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todas');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ver Todos os Itens</span>
              </button>
            )}

            <h2 className={`text-sm sm:text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {selectedCategory === 'todas'
                ? (isAdega ? 'Todos os Produtos' : 'Todos os Itens do Cardápio')
                : activeCategories.find((c) => c.id === selectedCategory)?.label || 'Produtos Selecionados'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item disponível' : 'itens disponíveis'}
            </span>

            {/* Alternador Rápido de Layout na Vitrine (Grade vs Lista com Miniatura) */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-neutral-800 border-neutral-700'
            }`}>
              <button
                type="button"
                onClick={() => setViewModeOverride('grid')}
                title="Exibir em Grade com Fotos Grandes"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  !isListLayout
                    ? 'btn-graphite bg-neutral-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewModeOverride('list')}
                title="Exibir em Lista Compacta com Miniatura Lateral"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  isListLayout
                    ? 'btn-graphite bg-neutral-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

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
                    <h3 className={`text-lg sm:text-xl font-black border-b pb-2 flex items-center justify-between ${
                      isLight ? 'text-slate-900 border-slate-200' : 'text-white border-neutral-800'
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
                            className={`py-4 flex items-start justify-between gap-4 cursor-pointer transition-colors group ${
                              isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-850/40'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-1">
                              <h4 className={`text-base sm:text-lg font-bold group-hover:text-[var(--brand-accent)] transition-colors leading-snug ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}>
                                {product.name}
                              </h4>

                              {(product.ingredients || product.description) && (
                                <div className="mt-1">
                                  <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                                    isLight ? 'text-slate-600' : 'text-neutral-300'
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
                              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border shadow-2xs ${
                                isLight ? 'border-slate-200 bg-slate-100' : 'border-neutral-800 bg-neutral-900'
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
                <h3 className={`text-lg sm:text-xl font-black border-b pb-2 flex items-center justify-between ${
                  isLight ? 'text-slate-900 border-slate-200' : 'text-white border-neutral-800'
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
                        className={`py-4 flex items-start justify-between gap-4 cursor-pointer transition-colors group ${
                          isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-850/40'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className={`text-base sm:text-lg font-bold group-hover:text-[var(--brand-accent)] transition-colors leading-snug ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {product.name}
                          </h4>

                          {(product.ingredients || product.description) && (
                            <div className="mt-1">
                              <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                                isLight ? 'text-slate-600' : 'text-neutral-300'
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
                          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border shadow-2xs ${
                            isLight ? 'border-slate-200 bg-slate-100' : 'border-neutral-800 bg-neutral-900'
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
                  className={`group rounded-xl sm:rounded-2xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md border ${
                    isLight
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
                      <div className={`flex items-center gap-1 text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold truncate ${
                        isLight ? 'text-slate-500' : 'text-neutral-400'
                      }`}>
                        <span className="truncate">{getCategoryDisplayName(product.category, currentTenant?.businessSegment, currentTenant?.categories || currentTenant?.customCategories)}</span>
                        {product.volume && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate font-mono">{product.volume}</span>
                          </>
                        )}
                      </div>

                      <h3 className={`text-xs sm:text-sm font-bold mt-0.5 transition-colors line-clamp-2 leading-tight ${
                        isLight ? 'text-slate-900 group-hover:text-[var(--brand-accent)]' : 'text-white group-hover:text-[var(--brand-accent)]'
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
                    <div className={`pt-2 border-t flex items-center justify-between gap-1 ${
                      isLight ? 'border-slate-100' : 'border-neutral-800/80'
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
                        className="flex items-center justify-center gap-1 py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0 text-white"
                        style={{
                          backgroundColor: brandAccent,
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
          <div className={`p-12 text-center rounded-2xl border space-y-2 ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
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
        <footer className={`mt-16 pt-8 pb-12 border-t transition-colors text-xs ${
          isLight 
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
                className={`px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                <span>Área do Lojista (Painel & PDV)</span>
              </button>

              <button
                onClick={() => setViewRole('register_tenant')}
                className={`px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight
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

      {/* Floating Bottom Cart Bar (Apenas se NÃO for modo somente cardápio e houver itens) */}
      {!isMenuOnly && totalCartItems > 0 && (
        <div className="fixed bottom-18 sm:bottom-6 inset-x-4 max-w-lg mx-auto z-30">
          <div className="p-3.5 rounded-2xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700 text-white shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
                style={{
                  backgroundColor: brandAccent,
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
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <span>Ver Carrinho & Pedir</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR FIXA NO CELULAR: 3 ABAS NO MODO CARDÁPIO (Cardápio, Busca, Entrar) OU 4 ABAS NO MODO LOJA */}
      {isMenuOnly ? (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e2e8f0] h-[58px] grid grid-cols-3 items-center justify-items-center shadow-lg safe-area-pb">
          {/* 1. Cardápio */}
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
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {!isMobileSearchModalOpen && !isMobileAccountModalOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <BookOpen className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              !isMobileSearchModalOpen && !isMobileAccountModalOpen ? 'font-bold' : 'font-normal'
            }`}>
              Cardápio
            </span>
          </button>

          {/* 2. Busca */}
          <button
            type="button"
            onClick={() => {
              setIsMobileAccountModalOpen(false);
              setIsMobileMenuDrawerOpen(false);
              setIsMobileSearchModalOpen(true);
            }}
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {isMobileSearchModalOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <Search className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              isMobileSearchModalOpen ? 'font-bold' : 'font-normal'
            }`}>
              Busca
            </span>
          </button>

          {/* 3. Entrar */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchModalOpen(false);
              setIsMobileMenuDrawerOpen(false);
              setIsMobileAccountModalOpen(true);
            }}
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {isMobileAccountModalOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <LogIn className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              isMobileAccountModalOpen ? 'font-bold' : 'font-normal'
            }`}>
              Entrar
            </span>
          </button>
        </div>
      ) : (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e2e8f0] h-[58px] grid grid-cols-4 items-center justify-items-center shadow-lg safe-area-pb">
          {/* 1. Início */}
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
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {!isCartOpen && !isMobileSearchModalOpen && !isMobileAccountModalOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <Home className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              !isCartOpen && !isMobileSearchModalOpen && !isMobileAccountModalOpen ? 'font-bold' : 'font-normal'
            }`}>
              Início
            </span>
          </button>

          {/* 2. Conta */}
          <button
            type="button"
            onClick={() => {
              setIsCartOpen(false);
              setIsMobileSearchModalOpen(false);
              setIsMobileMenuDrawerOpen(false);
              setIsMobileAccountModalOpen(true);
            }}
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {isMobileAccountModalOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <User className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              isMobileAccountModalOpen ? 'font-bold' : 'font-normal'
            }`}>
              Conta
            </span>
          </button>

          {/* 3. Carrinho */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchModalOpen(false);
              setIsMobileAccountModalOpen(false);
              setIsMobileMenuDrawerOpen(false);
              setIsCartOpen(prev => !prev);
            }}
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {isCartOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <div className="relative">
              <ShoppingCart className="w-[22px] h-[22px] stroke-[1.75]" />
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#0F1111] leading-none">
                {totalCartItems}
              </span>
            </div>
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              isCartOpen ? 'font-bold' : 'font-normal'
            }`}>
              Carrinho
            </span>
          </button>

          {/* 4. Pesquisar */}
          <button
            type="button"
            onClick={() => {
              setIsCartOpen(false);
              setIsMobileAccountModalOpen(false);
              setIsMobileMenuDrawerOpen(false);
              setIsMobileSearchModalOpen(true);
            }}
            className="relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1 transition-colors cursor-pointer text-[#0F1111]"
          >
            {isMobileSearchModalOpen && (
              <span className="absolute top-0 w-8 h-[3.5px] bg-[#0F1111] rounded-b-sm" />
            )}
            <Search className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className={`text-[11px] leading-tight tracking-tight mt-1 ${
              isMobileSearchModalOpen ? 'font-bold' : 'font-normal'
            }`}>
              Pesquisar
            </span>
          </button>
        </div>
      )}

      {/* GAVETA DO CARDÁPIO (MOBILE BOTTOM SHEET) */}
      {isMobileMenuDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="absolute inset-0" onClick={() => setIsMobileMenuDrawerOpen(false)} />
          <div className={`relative rounded-t-3xl border-t p-5 max-h-[82vh] overflow-y-auto space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
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
              className={`w-full p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                selectedCategory === 'todas'
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
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected
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
        <div className="fixed inset-x-0 top-0 bottom-[58px] sm:bottom-0 sm:inset-0 z-40 sm:z-50 p-4 sm:p-8 flex flex-col overflow-y-auto bg-white text-slate-900">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            {/* Header da Busca - idêntico à imagem de referência */}
            <div className="flex items-center gap-3">
              <div className={`relative flex-1 rounded-2xl border flex items-center px-4 py-2.5 shadow-2xs ${
                isLight ? 'bg-white border-slate-300' : 'bg-neutral-900 border-neutral-700'
              }`}>
                <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500 shrink-0 mr-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos"
                  className={`w-full text-sm sm:text-base font-medium focus:outline-none bg-transparent ${
                    isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-neutral-500'
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
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer border shadow-2xs ${
                        isSelected
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
                      className={`p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-md ${
                        isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
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
        <div className="sm:hidden fixed inset-x-0 top-0 bottom-[58px] z-40 bg-white text-slate-900 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Header da Tela de Conta */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sua Conta</h2>
              <p className="text-xs text-slate-500">{currentTenant.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileAccountModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Card de Perfil / Boas-vindas */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: `${brandAccent}20`, color: brandAccent }}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">Cliente Convidado</h3>
              <p className="text-xs text-slate-500">Navegando no cardápio de {currentTenant.name}</p>
            </div>
          </div>

          {/* Opções e Atalhos */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Acesso & Serviços
            </span>

            {/* 1. Área do Lojista */}
            <button
              type="button"
              onClick={() => {
                setIsMobileAccountModalOpen(false);
                setViewRole('login_tenant');
              }}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-3.5 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <span className="block text-sm font-bold text-slate-900">Área do Lojista (Painel & PDV)</span>
                <span className="text-xs text-slate-500 font-normal">Acesso com senha e WhatsApp da loja</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 2. Criar Minha Loja */}
            <button
              type="button"
              onClick={() => {
                setIsMobileAccountModalOpen(false);
                setViewRole('register_tenant');
              }}
              className="w-full p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 flex items-center gap-3.5 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <span className="block text-sm font-bold text-blue-900">Criar Minha Loja Grátis</span>
                <span className="text-xs text-blue-700/80 font-normal">Cadastre seu próprio negócio em 2 minutos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-500" />
            </button>

            {/* 3. Informações da Loja */}
            <button
              type="button"
              onClick={() => {
                setIsMobileAccountModalOpen(false);
                setIsStoreInfoModalOpen(true);
              }}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-3.5 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <Info className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <span className="block text-sm font-bold text-slate-900">Informações do Estabelecimento</span>
                <span className="text-xs text-slate-500 font-normal">Horários, formas de pagamento e localização</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 4. WhatsApp */}
            {currentTenant.whatsapp?.supportLinkEnabled && (
              <a
                href={generateWhatsAppDirectChatUrl(currentTenant)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 flex items-center gap-3.5 font-bold text-xs transition-all cursor-pointer shadow-2xs"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <span className="block text-sm font-bold text-emerald-900">Falar no WhatsApp da Loja</span>
                  <span className="text-xs text-emerald-700/80 font-normal">Tire dúvidas e faça pedidos especiais</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </a>
            )}
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
      />

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
          
          <div className={`relative max-w-lg w-full rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-5 my-8 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
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
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      currentTenant.isOpen
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

    </div>
  );
};
