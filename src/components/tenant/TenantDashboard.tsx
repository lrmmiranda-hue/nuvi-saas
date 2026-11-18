import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, CategoryType, StoreManagementConfig, BusinessSegmentType } from '../../types';
import { CATEGORIES_CONFIG } from '../../data/mockData';
import { BUSINESS_SEGMENTS, getSegmentById, getTenantCategories, getCategoryDisplayName, getSegmentColorOptions } from '../../data/businessSegments';
import { PRESET_THEMES, PRESET_BANNERS } from './OnboardingWizardModal';
import { STORE_WALLPAPERS, WALLPAPER_CATEGORIES, StoreWallpaper } from '../../data/wallpapers';
import { ProductEditorModal } from './ProductEditorModal';
import { PDVSalesView } from './PDVSalesView';
import { InventoryView } from './InventoryView';
import { 
  Building2, 
  Store, 
  ShoppingBag, 
  Palette, 
  MessageSquare, 
  MapPin, 
  BarChart3, 
  Plus, 
  Search, 
  Clock, 
  Sparkles, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Send, 
  Phone, 
  ExternalLink,
  Snowflake,
  AlertTriangle,
  Flame,
  Check,
  Power,
  Settings,
  Upload,
  CreditCard,
  QrCode,
  Banknote,
  Volume2,
  Barcode,
  Image as ImageIcon,
  Boxes,
  ShoppingCart,
  Globe,
  Info,
  Sun,
  Moon,
  Wine,
  UtensilsCrossed,
  Sandwich,
  Pizza,
  Dog,
  Fish,
  Eye,
  RefreshCw,
  Sliders,
  LayoutGrid,
  List,
  CheckCircle2,
  ArrowRight,
  Megaphone,
  LogOut,
  X,
  MessageCircle,
  Lock
} from 'lucide-react';

interface TenantDashboardProps {
  onOpenOnboarding: () => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ onOpenOnboarding }) => {
  const {
    currentTenant,
    updateTenant,
    tenantProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    tenantOrders,
    updateOrderStatus,
    generateWhatsAppOrderUrl,
    generateWhatsAppStatusUpdateUrl,
    generateWhatsAppDirectChatUrl,
    setViewRole,
    showAlert,
    showConfirm,
    themeMode,
    setThemeMode,
    toggleThemeMode,
    logoutTenant,
    isFeatureAllowed,
    globalConfig,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'vendas' | 'estoque' | 'pedidos' | 'produtos' | 'configuracoes' | 'visual' | 'whatsapp' | 'entrega' | 'metricas'
  >('vendas');

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');

  // Promo banner dismiss state
  const [isPromoDismissed, setIsPromoDismissed] = useState(false);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('todas');
  const [productSearch, setProductSearch] = useState('');

  // Branding edits
  const [brandingEdits, setBrandingEdits] = useState(currentTenant?.branding);
  const [sloganEdit, setSloganEdit] = useState(currentTenant?.slogan || '');

  // Address edits
  const [addressEdits, setAddressEdits] = useState(currentTenant?.address);

  // WhatsApp edits
  const [whatsAppEdits, setWhatsAppEdits] = useState(currentTenant?.whatsapp);

  // Store Management Config edits
  const [configEdits, setConfigEdits] = useState<StoreManagementConfig>({
    enablePhysicalStore: currentTenant?.config?.enablePhysicalStore ?? true,
    enableOnlineSales: currentTenant?.config?.enableOnlineSales ?? true,
    enableBarcodeScanner: currentTenant?.config?.enableBarcodeScanner ?? (currentTenant?.businessSegment === 'adega' || currentTenant?.businessSegment === 'mercadinho_emporio'),
    enableMenuOnlyMode: currentTenant?.config?.enableMenuOnlyMode ?? false,
    catalogLayout: currentTenant?.config?.catalogLayout || currentTenant?.branding?.catalogLayout || (currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa' ? 'list' : 'grid'),
    pixKey: currentTenant?.config?.pixKey || currentTenant?.document || '',
    acceptPix: currentTenant?.config?.acceptPix ?? true,
    acceptCard: currentTenant?.config?.acceptCard ?? true,
    acceptCash: currentTenant?.config?.acceptCash ?? true,
    allowOrdersWhenClosed: currentTenant?.config?.allowOrdersWhenClosed ?? false,
    soundAlerts: currentTenant?.config?.soundAlerts ?? true,
    ...(currentTenant?.config || {}),
  });

  // Store base info edits (for Configurações tab)
  const [storeNameEdit, setStoreNameEdit] = useState(currentTenant?.name || '');
  const [ownerNameEdit, setOwnerNameEdit] = useState(currentTenant?.ownerName || '');
  const [ownerPhoneEdit, setOwnerPhoneEdit] = useState(currentTenant?.ownerPhone || '');
  const [ownerEmailEdit, setOwnerEmailEdit] = useState(currentTenant?.ownerEmail || '');
  const [documentEdit, setDocumentEdit] = useState(currentTenant?.document || '');
  const [colorPaletteFilter, setColorPaletteFilter] = useState<'all' | 'dark' | 'light' | 'vibrant'>('all');

  const activePrimary = brandingEdits?.primaryColor || currentTenant?.branding?.primaryColor || '#09090B';
  const activeAccent = brandingEdits?.accentColor || currentTenant?.branding?.accentColor || '#F59E0B';

  const isLightColor = (hex: string): boolean => {
    if (!hex || !hex.startsWith('#')) return false;
    const c = hex.substring(1);
    const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    if (isNaN(rgb)) return false;
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 165;
  };

  // Keep synced if currentTenant changes
  useEffect(() => {
    if (currentTenant) {
      setBrandingEdits(currentTenant.branding);
      setSloganEdit(currentTenant.slogan);
      setAddressEdits(currentTenant.address);
      setWhatsAppEdits(currentTenant.whatsapp);
      setStoreNameEdit(currentTenant.name);
      setOwnerNameEdit(currentTenant.ownerName);
      setOwnerPhoneEdit(currentTenant.ownerPhone);
      setOwnerEmailEdit(currentTenant.ownerEmail);
      setDocumentEdit(currentTenant.document);
      setConfigEdits({
        enablePhysicalStore: currentTenant.config?.enablePhysicalStore ?? true,
        enableOnlineSales: currentTenant.config?.enableOnlineSales ?? true,
        enableBarcodeScanner: currentTenant.config?.enableBarcodeScanner ?? (currentTenant.businessSegment === 'adega' || currentTenant.businessSegment === 'mercadinho_emporio'),
        enableMenuOnlyMode: currentTenant.config?.enableMenuOnlyMode ?? false,
        pixKey: currentTenant.config?.pixKey || currentTenant.document || '',
        acceptPix: currentTenant.config?.acceptPix ?? true,
        acceptCard: currentTenant.config?.acceptCard ?? true,
        acceptCash: currentTenant.config?.acceptCash ?? true,
        allowOrdersWhenClosed: currentTenant.config?.allowOrdersWhenClosed ?? false,
        soundAlerts: currentTenant.config?.soundAlerts ?? true,
        ...(currentTenant.config || {}),
      });
    }
  }, [currentTenant]);



  if (!currentTenant) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Nenhum estabelecimento comercial selecionado.
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = tenantOrders.filter((order) => {
    if (orderStatusFilter === 'todos') return true;
    return order.status === orderStatusFilter;
  });

  // Filtered products
  const filteredProducts = tenantProducts.filter((product) => {
    const matchesCat = productCategoryFilter === 'todas' || product.category === productCategoryFilter;
    const matchesQuery = product.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Toggle store open/closed
  const handleToggleOpen = () => {
    updateTenant(currentTenant.id, { isOpen: !currentTenant.isOpen });
  };

  // Upload Logo file via FileReader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: 'Arquivo Muito Grande',
        message: 'A imagem da logo deve ter no máximo 5MB.',
        variant: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && brandingEdits) {
        const updatedBranding = { ...brandingEdits, logoUrl: dataUrl };
        setBrandingEdits(updatedBranding);
        updateTenant(currentTenant.id, { branding: updatedBranding });
      }
    };
    reader.readAsDataURL(file);
  };

  const targetWallpaperCat = (() => {
    const seg = currentTenant?.businessSegment || 'adega';
    if (seg === 'comida_japonesa') return 'japonesa';
    if (seg === 'restaurante_lanchonete') return 'restaurante';
    if (seg === 'mercadinho_emporio') return 'mercadinho';
    if (seg === 'cosmeticos_farmacia') return 'cosmeticos';
    return seg;
  })();

  const relevantWallpaperCategories = useMemo(() => {
    return WALLPAPER_CATEGORIES.filter((cat: { id: string }) => cat.id === targetWallpaperCat);
  }, [targetWallpaperCat]);

  const [wallpaperCategory, setWallpaperCategory] = useState<string>(targetWallpaperCat);

  useEffect(() => {
    setWallpaperCategory(targetWallpaperCat);
  }, [targetWallpaperCat]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showAlert({
        title: 'Arquivo Muito Grande',
        message: 'A imagem do papel de parede deve ter no máximo 8MB.',
        variant: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && brandingEdits) {
        const updatedBranding = { ...brandingEdits, bannerUrl: dataUrl };
        setBrandingEdits(updatedBranding);
        updateTenant(currentTenant.id, { branding: updatedBranding });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (brandingEdits) {
      const updatedBranding = { ...brandingEdits, logoUrl: '' };
      setBrandingEdits(updatedBranding);
      updateTenant(currentTenant.id, { branding: updatedBranding });
    }
  };

  const handleSaveBranding = () => {
    if (brandingEdits) {
      updateTenant(currentTenant.id, {
        branding: brandingEdits,
        slogan: sloganEdit,
      });
      showAlert({
        title: 'Vitrine & Visual Salvos com Sucesso!',
        message: 'O papel de parede, logotipo e as cores da sua vitrine online foram atualizados.',
        variant: 'success',
      });
    }
  };

  const handleSaveAddress = () => {
    if (addressEdits) {
      updateTenant(currentTenant.id, { address: addressEdits });
      showAlert({
        title: 'Sucesso',
        message: 'Endereço e regras de entrega salvos com sucesso!',
        variant: 'success',
      });
    }
  };

  const handleSaveWhatsApp = () => {
    if (whatsAppEdits) {
      updateTenant(currentTenant.id, { whatsapp: whatsAppEdits });
      showAlert({
        title: 'Sucesso',
        message: 'Configurações de WhatsApp salvas com sucesso!',
        variant: 'success',
      });
    }
  };

  const handleSaveStoreManagement = () => {
    if (currentTenant) {
      updateTenant(currentTenant.id, {
        name: storeNameEdit,
        slogan: sloganEdit,
        ownerName: ownerNameEdit,
        ownerPhone: ownerPhoneEdit,
        ownerEmail: ownerEmailEdit,
        document: documentEdit,
        config: {
          ...currentTenant.config,
          ...configEdits,
        },
        whatsapp: whatsAppEdits || currentTenant.whatsapp,
        address: addressEdits || currentTenant.address,
      });
      showAlert({
        title: 'Sucesso',
        message: 'Configurações gerais do painel da loja e endereço salvas com sucesso!',
        variant: 'success',
      });
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (data: Omit<Product, 'id' | 'tenantId'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      createProduct(data);
    }
  };

  // Status badge styling
  const orderStatusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    novo: { label: 'Novo Pedido', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
    preparando: { label: 'Em Preparo', bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-400' },
    em_entrega: { label: 'Saiu p/ Entrega', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400' },
    finalizado: { label: 'Finalizado', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
    cancelado: { label: 'Cancelado', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' },
  };

  const isPhysicalEnabled = configEdits.enablePhysicalStore ?? currentTenant.config?.enablePhysicalStore ?? true;
  const isOnlineEnabled = configEdits.enableOnlineSales ?? currentTenant.config?.enableOnlineSales ?? true;
  const isBarcodeScannerEnabled = configEdits.enableBarcodeScanner ?? currentTenant.config?.enableBarcodeScanner ?? (currentTenant.businessSegment === 'adega' || currentTenant.businessSegment === 'mercadinho_emporio');
  const isFoodOrPizza = currentTenant.businessSegment === 'pizzaria' || currentTenant.businessSegment === 'restaurante_lanchonete' || currentTenant.businessSegment === 'comida_japonesa' || currentTenant.businessSegment === 'pastelaria';
  const isAdega = currentTenant.businessSegment === 'adega';
  const isWhatsAppOrdersEnabled = (whatsAppEdits?.enableWhatsAppOrders ?? currentTenant.whatsapp?.enableWhatsAppOrders ?? true) && isOnlineEnabled;

  // Categorias ativas da loja para filtragem correta no nicho
  const tenantCategories = useMemo(() => {
    return getTenantCategories(currentTenant).filter((c) => c.enabled !== false);
  }, [currentTenant]);

  // Rótulo e ícone dinâmico da aba de produtos conforme o segmento do comércio
  const { productsTabLabel, productsTabIcon } = useMemo(() => {
    switch (currentTenant.businessSegment) {
      case 'petshop':
        return { productsTabLabel: 'Produtos Pet & Rações', productsTabIcon: Dog };
      case 'pizzaria':
        return { productsTabLabel: 'Cardápio & Pizzas', productsTabIcon: Pizza };
      case 'restaurante_lanchonete':
        return { productsTabLabel: 'Cardápio & Lanches', productsTabIcon: UtensilsCrossed };
      case 'comida_japonesa':
        return { productsTabLabel: 'Cardápio & Culinária Japonesa', productsTabIcon: Fish };
      case 'pesqueiro':
        return { productsTabLabel: 'Cardápio & Porções de Peixe', productsTabIcon: Fish };
      case 'pastelaria':
        return { productsTabLabel: 'Cardápio & Pastéis', productsTabIcon: UtensilsCrossed };
      case 'mercadinho_emporio':
        return { productsTabLabel: 'Catálogo & Mercearia', productsTabIcon: Store };
      case 'cosmeticos_farmacia':
        return { productsTabLabel: 'Catálogo de Cosméticos', productsTabIcon: Sparkles };
      case 'adega':
        return { productsTabLabel: 'Cardápio / Bebidas', productsTabIcon: Wine };
      default:
        return { productsTabLabel: 'Catálogo & Produtos', productsTabIcon: ShoppingBag };
    }
  }, [currentTenant.businessSegment]);

  // Permissões de Módulos definidas pelo Administrador Master
  const allowPDV = isFeatureAllowed('enablePDVBalcao', currentTenant);
  const allowStock = isFeatureAllowed('enableStockControl', currentTenant);
  const allowStorefront = isFeatureAllowed('enableStorefront', currentTenant);
  const allowMetrics = isFeatureAllowed('enableFinancialMetrics', currentTenant);

  // Dynamically constructed available tabs based on tenant operational model & Master Permissions
  const availableTabs = [
    ...(isPhysicalEnabled && allowPDV ? [{ id: 'vendas', label: 'Vendas Balcão (PDV)', icon: ShoppingCart }] : []),
    // Para Pizzaria e Lanchonete, NÃO exibe a aba de estoque ("Gestão de Cardápio"), mantendo unicamente a aba de "Cardápio & Lanches" / "Cardápio & Pizzas"!
    ...(!isFoodOrPizza && allowStock ? [{ 
      id: 'estoque', 
      label: isAdega ? 'Estoque & Recebimento' : 'Controle de Estoque', 
      icon: Boxes, 
      count: tenantProducts.length 
    }] : []),
    ...(isOnlineEnabled && allowStorefront ? [
      { id: 'pedidos', label: 'Gestão de Pedidos', icon: ShoppingBag, count: tenantOrders.length },
    ] : []),
    // Para Pizzaria e Lanchonete, a aba de Cardápio sempre fica visível (ou se vendas online estiver habilitado para outros segmentos)
    ...((isFoodOrPizza || isOnlineEnabled) && allowStorefront ? [
      { id: 'produtos', label: productsTabLabel, icon: productsTabIcon, count: tenantProducts.length },
    ] : []),
    { id: 'configuracoes', label: 'Configurações da Loja', icon: Settings },
    { id: 'visual', label: 'Visual, Cores & Vitrine', icon: Palette },
    ...(isWhatsAppOrdersEnabled ? [
      { id: 'whatsapp', label: 'WhatsApp & Mensagens', icon: MessageSquare },
    ] : []),
    ...(allowMetrics ? [
      { id: 'metricas', label: 'Métricas & Desempenho', icon: BarChart3 },
    ] : []),
  ];

  // Auto-switch tab if current tab is hidden by disabling online or physical mode
  useEffect(() => {
    const isCurrentValid = availableTabs.some((t) => t.id === activeTab);
    if (!isCurrentValid && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id as any);
    }
  }, [availableTabs, activeTab]);

  const isLight = themeMode === 'light';
  const primaryColor = brandingEdits?.primaryColor || currentTenant.branding.primaryColor || '#D97706';
  const accentColor = brandingEdits?.accentColor || currentTenant.branding.accentColor || '#F59E0B';

  const handleToggleThemeMode = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    if (currentTenant) {
      updateTenant(currentTenant.id, {
        branding: {
          ...currentTenant.branding,
          colorMode: nextMode,
        },
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Banner de Divulgação de Promoções de Vendas do SaaS Nuvi com Efeito de Luz Azul */}
      {globalConfig?.promoBanner?.enabled && !isPromoDismissed && (
        <div className="relative rounded-3xl overflow-hidden border border-sky-400/40 shadow-2xl shadow-sky-950/60 transition-all p-5 sm:p-6 bg-gradient-to-r from-[#031424] via-[#062444] to-[#0A3966] text-white">
          
          {/* Botão de Fechar / Dispensar Banner no Painel do Lojista */}
          <button
            type="button"
            onClick={() => setIsPromoDismissed(true)}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer z-20"
            title="Fechar aviso promocional"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Luzes Difusas de Fundo Criativas */}
          <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-sky-500/30 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-10 right-28 w-60 h-60 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          
          {/* Padrão Sutil de Grade Geométrica */}
          <div 
            className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"
          />

          {/* Feixe de Luz Azul/Ciano Animado (Passando e Sumindo em Loop Suave) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="nuvi-sweep-light absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent skew-x-[-22deg]" />
          </div>

          <style>{`
            @keyframes nuviSweepAnim {
              0% { transform: translateX(-180%); opacity: 0; }
              20% { opacity: 1; }
              55% { transform: translateX(650%); opacity: 0.9; }
              70% { opacity: 0; }
              100% { transform: translateX(650%); opacity: 0; }
            }
            .nuvi-sweep-light {
              animation: nuviSweepAnim 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `}</style>

          {/* Conteúdo do Banner */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pr-6 sm:pr-8">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  Oferta Exclusiva Nuvi
                </span>
                <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
                  {globalConfig.promoBanner.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-medium">
                {globalConfig.promoBanner.message}
              </p>
            </div>

            {/* Botão de Contato WhatsApp com Tonalidade Verde Oficial, Ícone e Fonte Branca */}
            <a
              href={globalConfig.promoBanner.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#25D366] via-[#20bd5a] to-[#128C7E] hover:from-[#22c35e] hover:to-[#0f7a6e] text-white font-extrabold text-xs shadow-xl shadow-emerald-950/50 active:scale-[0.98] transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer border border-emerald-300/40"
            >
              <MessageCircle className="w-4 h-4 text-white fill-white shrink-0" />
              <span className="text-white font-extrabold text-xs tracking-tight">{globalConfig.promoBanner.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-white shrink-0" />
            </a>
          </div>

        </div>
      )}

      {/* Onboarding Pending Banner */}
      {!currentTenant.onboardingCompleted && (
        <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          isLight
            ? 'bg-slate-100 border-slate-300 text-slate-800'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Passo a Passo de Configuração Inicial Disponível
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                Preencha os dados do estabelecimento, defina sua paleta de cores, configure o endereço da loja e o WhatsApp para começar a vender.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOnboarding}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shrink-0 shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
          >
            Iniciar Passo a Passo
          </button>
        </div>
      )}

      {/* Tenant Header / Store Identity Card - Estilo Nuvi Master */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-[#11161B] border-[#1C2631] text-white shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            {/* Logo Image or Fallback Monogram */}
            {currentTenant.branding.logoUrl ? (
              <div className={`w-14 h-14 rounded-2xl overflow-hidden border shadow-xs shrink-0 flex items-center justify-center p-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <img
                  src={currentTenant.branding.logoUrl}
                  alt={currentTenant.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-xs shrink-0 bg-gradient-to-br from-sky-600 to-blue-600 text-white border border-sky-400/30"
              >
                <span>{currentTenant.name.charAt(0)}</span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentTenant.name}
                </h1>
                <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isLight ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                }`}>
                  {currentTenant.plan}
                </span>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Área Restrita do Estabelecimento
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {currentTenant.slogan || 'Bebidas no ponto e entrega rápida'}
              </p>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                {currentTenant.address.street}, {currentTenant.address.number} - {currentTenant.address.neighborhood}, {currentTenant.address.city}
              </p>
            </div>
          </div>

          {/* Controles do Estabelecimento: Layout e Sair posicionados logo acima de Ver Minha Vitrine */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            
            {/* Linha Superior: Alternar Layout (Claro/Escuro) e Sair do Painel */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleThemeMode}
                title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-2xs' 
                    : 'bg-[#151D24] hover:bg-[#1E2933] border-[#222E3A] text-slate-200'
                }`}
              >
                {isLight ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Modo Escuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modo Claro</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  logoutTenant();
                  setViewRole('login_tenant');
                }}
                title="Encerrar sessão do lojista"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 shadow-2xs'
                    : 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-900/50 text-rose-400'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>

            {/* Linha Inferior: Status da Loja e Botão Ver Minha Vitrine em Tom Azul Nuvi */}
            <div className="flex items-center gap-2.5">
              {/* Open / Closed Toggle */}
              <button
                onClick={handleToggleOpen}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  currentTenant.isOpen
                    ? isLight
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : isLight
                      ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{currentTenant.isOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
              </button>

              {/* View Live Storefront com Degradê Azul Nuvi Master */}
              {isOnlineEnabled ? (
                <button
                  onClick={() => setViewRole('storefront')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-white" />
                  <span>Ver Minha Vitrine</span>
                  <ExternalLink className="w-3 h-3 text-white" />
                </button>
              ) : (
                <div 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#151D24] border-[#222E3A] text-slate-400'
                  }`}
                  title="Vendas online e vitrine pública desativadas nas configurações"
                >
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Loja Física (Sem Vitrine)</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Tab Navigation - Padronizada em Azul Nuvi Master */}
        <div className={`flex items-center gap-1 mt-6 pt-4 border-t overflow-x-auto text-xs ${
          isLight ? 'border-slate-200' : 'border-[#1C2631]'
        }`}>
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400/40'
                    : isLight
                      ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
                      : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-sky-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span 
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive 
                        ? 'bg-black/25 text-white font-bold' 
                        : isLight 
                          ? 'bg-sky-100 text-sky-800 font-bold' 
                          : 'bg-sky-950/60 text-sky-400 border border-sky-800/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB: VENDAS NO BALCÃO (FRENTE DE CAIXA / PDV COM LEITOR DE CÓDIGO DE BARRAS) */}
      {activeTab === 'vendas' && (
        <PDVSalesView />
      )}

      {/* TAB: CONTROLE DE ESTOQUE, RECEBIMENTO DE MERCADORIAS & IMPORTAR EXCEL */}
      {activeTab === 'estoque' && (
        <InventoryView 
          onOpenProductModal={(prod) => {
            setEditingProduct(prod || null);
            setIsProductModalOpen(true);
          }} 
        />
      )}

      {/* TAB 1: PEDIDOS EM TEMPO REAL */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          
          {/* Status Subfilters */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs overflow-x-auto ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
            }`}>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'novo', label: 'Novos' },
                { id: 'preparando', label: 'Em Preparo' },
                { id: 'em_entrega', label: 'Em Entrega' },
                { id: 'finalizado', label: 'Finalizados' },
                { id: 'cancelado', label: 'Cancelados' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === st.id
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-xs'
                      : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido listado' : 'pedidos listados'}
            </p>
          </div>

          {/* Orders Cards List */}
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusInfo = orderStatusConfig[order.status] || orderStatusConfig.novo;

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-colors ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-base">
                        #{order.id}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {order.deliveryType === 'delivery' ? '🛵 Entrega em Casa' : '🏪 Retirada no Balcão'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-500 uppercase text-[10px] block">Cliente</span>
                      <p className="font-semibold text-white mt-0.5">{order.customerName}</p>
                      <p className="text-neutral-400 font-mono">{order.customerPhone}</p>
                    </div>

                    <div>
                      <span className="text-neutral-500 uppercase text-[10px] block">Endereço de Entrega</span>
                      {order.address ? (
                        <p className="text-neutral-300 mt-0.5">
                          {order.address.street}, {order.address.number}
                          {order.address.complement ? ` - ${order.address.complement}` : ''}
                          <span className="block text-neutral-400">{order.address.neighborhood} - {order.address.city}</span>
                        </p>
                      ) : (
                        <p className="text-neutral-300 mt-0.5">Retirada física no balcão</p>
                      )}
                    </div>

                    <div>
                      <span className="text-neutral-500 uppercase text-[10px] block">Forma de Pagamento</span>
                      <p className="font-medium text-white mt-0.5 capitalize">
                        {order.paymentMethod === 'cartao_entrega' ? 'Cartão na Entrega (Maquininha)' : order.paymentMethod}
                      </p>
                      {order.cashChangeFor && (
                        <p className="text-blue-400 text-[11px]">
                          Troco para: R$ {order.cashChangeFor.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Itemized Order List */}
                  <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800/70 space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                      Itens do Pedido ({order.items.length})
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-neutral-300">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white tabular-nums">{item.quantity}x</span>
                            <span>{item.productName} ({item.volume})</span>
                            {item.chilled && (
                              <span className="text-[10px] text-sky-400 flex items-center gap-0.5 bg-sky-500/10 px-1 rounded">
                                <Snowflake className="w-2.5 h-2.5" /> Gelada
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-[11px] text-blue-400/90 italic">Obs: {item.notes}</span>
                            )}
                          </div>
                          <span className="font-mono text-neutral-200 tabular-nums">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-neutral-800/80 pt-2 flex items-center justify-between text-xs">
                      <div className="text-neutral-400 space-x-2">
                        <span>Subtotal: R$ {order.subtotal.toFixed(2)}</span>
                        <span>·</span>
                        <span>Frete: R$ {order.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="text-sm font-bold text-blue-400">
                        TOTAL: R$ {order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Action Controls: Change Status & WhatsApp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Alterar Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="novo">Novo Pedido</option>
                        <option value="preparando">Em Preparo</option>
                        <option value="em_entrega">Saiu para Entrega</option>
                        <option value="finalizado">Finalizado / Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Send Status Update to Client WhatsApp */}
                      <a
                        href={generateWhatsAppStatusUpdateUrl(order, currentTenant, order.status)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Avisar Cliente no WhatsApp</span>
                      </a>

                      {/* Direct message */}
                      <a
                        href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                        title="Abrir chat direto com o cliente"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Nenhum pedido encontrado</h4>
                <p className="text-xs text-neutral-400">
                  Os pedidos feitos por clientes na sua vitrine aparecerão instantaneamente aqui.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PRODUTOS & CARDÁPIO */}
      {activeTab === 'produtos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isFoodOrPizza 
                  ? productsTabLabel 
                  : isAdega 
                  ? 'Catálogo de Bebidas & Produtos' 
                  : 'Catálogo & Produtos do Estabelecimento'}
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                {isFoodOrPizza 
                  ? 'Pratos, lanches, porções, pizzas e bebidas cadastrados no cardápio.' 
                  : 'Produtos cadastrados exclusivamente para o seu estabelecimento.'}
              </p>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isFoodOrPizza 
                  ? (currentTenant.businessSegment === 'pizzaria' 
                      ? 'Adicionar Pizza / Item' 
                      : currentTenant.businessSegment === 'comida_japonesa'
                      ? 'Adicionar Sushi / Combinado'
                      : 'Adicionar Lanche / Item')
                  : (isAdega ? 'Adicionar Bebida / Produto' : 'Adicionar Produto')}
              </span>
            </button>
          </div>

          {/* Product Filter Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
          }`}>
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => setProductCategoryFilter('todas')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  productCategoryFilter === 'todas'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold shadow-xs'
                    : isLight ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70' : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                }`}
              >
                Todas ({tenantProducts.length})
              </button>
              {tenantCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setProductCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    productCategoryFilter === cat.id
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold shadow-xs'
                      : isLight ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70' : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar produto..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-sky-500 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0B0F12] border-[#1C2631] text-white placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 hover:border-sky-300 shadow-sm' 
                    : 'bg-[#11161B] border-[#1C2631] hover:border-sky-800 shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Photo & badges */}
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <Flame className="w-8 h-8" />
                      </div>
                    )}

                    {product.isChilledAvailable && (
                      <span className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-sm text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-sky-500/30">
                        <Snowflake className="w-3 h-3" /> Gelada
                      </span>
                    )}

                    {product.promoPrice && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        PROMO
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-neutral-500">
                      {getCategoryDisplayName(product.category, currentTenant.businessSegment, currentTenant.categories || currentTenant.customCategories)} · {product.volume}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Preço</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-blue-400 tabular-nums">
                        R$ {(product.promoPrice ?? product.price).toFixed(2)}
                      </span>
                      {product.promoPrice && (
                        <span className="text-[11px] text-neutral-500 line-through tabular-nums">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        showConfirm({
                          title: 'Remover Produto',
                          message: `Deseja realmente remover "${product.name}" do catálogo da loja?`,
                          confirmText: 'Sim, remover',
                          cancelText: 'Cancelar',
                          variant: 'danger',
                          onConfirm: () => deleteProduct(product.id),
                        });
                      }}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className={`p-12 text-center rounded-2xl border space-y-2 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
            }`}>
              <Flame className="w-8 h-8 text-neutral-600 mx-auto" />
              <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Nenhum produto cadastrado nesta categoria</h4>
              <button
                onClick={handleOpenAddProduct}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Primeiro Produto
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIGURAÇÕES DA LOJA & GESTÃO DO PAINEL */}
      {activeTab === 'configuracoes' && (
        <div className="space-y-6">
          <div className={`pb-3 flex items-center justify-between border-b ${
            isLight ? 'border-slate-200' : 'border-[#1C2631]'
          }`}>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Gerenciamento Geral da Loja
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Configure as regras operacionais, modo de pedidos WhatsApp, formas de pagamento e dados da sua empresa.
              </p>
            </div>

            <button
              onClick={handleSaveStoreManagement}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white active:scale-95"
            >
              Salvar Configurações
            </button>
          </div>

          {/* Section: Modelo Operacional do Estabelecimento (Físico vs Online) */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Store className="w-4 h-4" style={{ color: activeAccent }} />
                <span>Modelo Operacional do Negócio (Físico vs Online)</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  isLight 
                    ? 'bg-slate-100 text-slate-700 border-slate-200' 
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}>
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>
                    {isPhysicalEnabled && isOnlineEnabled
                      ? 'Modo Híbrido Completo'
                      : isPhysicalEnabled
                      ? 'Apenas Loja Física (Balcão)'
                      : 'Apenas Vendas Online'}
                  </span>
                </span>
              </div>
            </div>

            {/* Banner de Trava de Segurança do Plano */}
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className={`font-bold block ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>
                    Opções Bloqueadas pelo seu Plano de Assinatura
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isLight ? 'text-amber-800' : 'text-neutral-300'}`}>
                    O modelo de operação (Somente Balcão, Vitrine Digital ou Híbrido) foi definido no cadastro/onboarding. Para fazer alteração ou upgrade do plano, solicite diretamente à administração pelo WhatsApp.
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                  `Olá! Sou da loja *${currentTenant.name}* (ID: ${currentTenant.id}) e gostaria de solicitar a alteração/upgrade do meu modelo de plano contratado.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Solicitar Alteração no WhatsApp</span>
              </a>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              Os módulos abaixo estão configurados conforme a contratação do seu plano:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Checkbox 1: Loja Física (Travado pelo Plano) */}
              <div 
                className={`p-4 rounded-xl border transition-all relative ${
                  isPhysicalEnabled 
                    ? isLight
                      ? 'shadow-xs border-amber-300 bg-amber-50/30'
                      : 'border-neutral-700 bg-neutral-900/90' 
                    : isLight
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-neutral-950 border-neutral-800 opacity-60'
                }`}
                style={isPhysicalEnabled ? {
                  borderColor: activeAccent,
                  backgroundColor: `${activeAccent}12`,
                  boxShadow: `0 0 0 1px ${activeAccent}33`,
                } : {}}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" style={{ color: activeAccent }} />
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Trabalhar com Loja Física / Vendas Balcão (PDV)
                      </span>
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                      {isPhysicalEnabled
                        ? 'Módulo ATIVADO pelo seu plano. Leitor de código de barras e comprovantes de venda liberados.'
                        : 'Módulo desativado no plano atual.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPhysicalEnabled}
                    disabled={true}
                    title="Esta opção é vinculada ao seu plano contratado e não pode ser alterada diretamente."
                    style={{ accentColor: activeAccent }}
                    className="w-5 h-5 rounded cursor-not-allowed opacity-75 mt-0.5 shrink-0"
                  />
                </div>
              </div>

              {/* Checkbox 2: Vendas Online (Travado pelo Plano) */}
              <div className={`p-4 rounded-xl border transition-all relative ${
                isOnlineEnabled 
                  ? isLight
                    ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-400/30'
                    : 'bg-sky-950/20 border-sky-500/40 ring-1 ring-sky-500/20' 
                  : isLight
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-neutral-950 border-neutral-800 opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-500" />
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Trabalhar com Vendas Online (Vitrine & Cardápio)
                      </span>
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                      {isOnlineEnabled
                        ? 'Módulo ATIVADO pelo seu plano. Vitrine pública, cardápio digital e pedidos no WhatsApp liberados.'
                        : 'Módulo desativado no plano atual.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isOnlineEnabled}
                    disabled={true}
                    title="Esta opção é vinculada ao seu plano contratado e não pode ser alterada diretamente."
                    style={{ accentColor: activeAccent }}
                    className="w-5 h-5 rounded cursor-not-allowed opacity-75 mt-0.5 shrink-0"
                  />
                </div>
              </div>

              {/* Checkbox 3: Leitor de Código de Barras (EAN) */}
              <div 
                className={`p-4 rounded-xl border transition-all sm:col-span-2 ${
                  isBarcodeScannerEnabled 
                    ? isLight
                      ? 'shadow-xs'
                      : '' 
                    : isLight
                    ? 'bg-slate-100/80 border-slate-200 opacity-75'
                    : 'bg-neutral-950 border-neutral-800 opacity-60'
                }`}
                style={isBarcodeScannerEnabled ? {
                  borderColor: activeAccent,
                  backgroundColor: `${activeAccent}12`,
                  boxShadow: `0 0 0 1px ${activeAccent}33`,
                } : {}}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4" style={{ color: activeAccent }} />
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Trabalhar com Leitor de Código de Barras (EAN)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isBarcodeScannerEnabled
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isLight
                            ? 'bg-slate-200 text-slate-600 border border-slate-300'
                            : 'bg-neutral-500/20 text-neutral-400 border border-neutral-700/40'
                      }`}>
                        {isBarcodeScannerEnabled ? '✓ Leitor Ativado' : '✕ Leitor Desativado'}
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                      {isFoodOrPizza 
                        ? 'Pizzas, sushis e lanches artesanais NÃO utilizam código de barras. Ative esta opção caso deseje bipar refrigerantes, cervejas e sucos com leitor USB/Bluetooth no balcão. Se desativado, o sistema foca 100% no cardápio ágil sem bipador.'
                        : 'Permite bipar produtos e fardos com leitor de código de barras USB/Bluetooth no Frente de Caixa (PDV) e no cadastro de mercadorias.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isBarcodeScannerEnabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const nextConfig = { ...configEdits, enableBarcodeScanner: checked };
                      setConfigEdits(nextConfig);
                      updateTenant(currentTenant.id, { config: nextConfig });
                    }}
                    style={{ accentColor: activeAccent }}
                    className="w-5 h-5 rounded cursor-pointer mt-0.5 shrink-0"
                  />
                </div>
              </div>

              {/* Checkbox 4: Modo Somente Cardápio / Consulta (Sem Botão Adicionar & Sem Carrinho) */}
              <div 
                className={`p-4 rounded-xl border transition-all sm:col-span-2 ${
                  configEdits.enableMenuOnlyMode ?? currentTenant.config?.enableMenuOnlyMode ?? false
                    ? isLight
                      ? 'shadow-xs'
                      : '' 
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-neutral-950 border-neutral-800'
                }`}
                style={(configEdits.enableMenuOnlyMode ?? currentTenant.config?.enableMenuOnlyMode ?? false) ? {
                  borderColor: activeAccent,
                  backgroundColor: `${activeAccent}12`,
                  boxShadow: `0 0 0 1px ${activeAccent}33`,
                } : {}}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" style={{ color: activeAccent }} />
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Modo Somente Cardápio / Consulta Digital (Sem Carrinho & Sem Botão Adicionar)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (configEdits.enableMenuOnlyMode ?? currentTenant.config?.enableMenuOnlyMode ?? false)
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isLight
                            ? 'bg-slate-200 text-slate-600 border border-slate-300'
                            : 'bg-neutral-500/20 text-neutral-400 border border-neutral-700/40'
                      }`}>
                        {(configEdits.enableMenuOnlyMode ?? currentTenant.config?.enableMenuOnlyMode ?? false) ? '✓ Somente Cardápio Ativo' : '✕ Com Carrinho e Pedidos'}
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                      Quando ativado, os botões "+ Adicionar" e o carrinho de compras são ocultados da vitrine/cardápio online. Ideal para restaurantes, pizzarias, bares e sushi bars que utilizam o link ou QR Code nas mesas apenas para os clientes consultarem pratos, fotos, descrições, acompanhamentos e valores.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configEdits.enableMenuOnlyMode ?? currentTenant.config?.enableMenuOnlyMode ?? false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const nextConfig = {
                        ...currentTenant.config,
                        ...configEdits,
                        enableMenuOnlyMode: checked,
                      };
                      setConfigEdits(nextConfig);
                      updateTenant(currentTenant.id, { config: nextConfig });
                    }}
                    style={{ accentColor: activeAccent }}
                    className="w-5 h-5 rounded cursor-pointer mt-0.5 shrink-0"
                  />
                </div>
              </div>
            </div>

            {!isOnlineEnabled && (
              <div 
                className="p-3 rounded-xl border text-xs flex items-start gap-2"
                style={{
                  borderColor: `${activeAccent}40`,
                  backgroundColor: `${activeAccent}12`,
                  color: isLight ? '#0f172a' : '#f8fafc',
                }}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: activeAccent }} />
                <span>
                  <strong>Modo Loja Física Ativo:</strong> Como a opção de vendas online está desmarcada, os menus de <strong>WhatsApp & Mensagens</strong>, <strong>Cardápio / Catálogo</strong>, <strong>Gestão de Pedidos</strong> e <strong>Visual, Cores & Vitrine</strong> foram ocultados automaticamente da navegação.
                </span>
              </div>
            )}
          </div>

          {/* Section: Modelo Visual do Cardápio na Vitrine (Grade vs Lista com Miniatura) */}
          {isOnlineEnabled && (
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#11161B] border-[#1C2631]'
            }`}>
              <div>
                <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Sliders className="w-4 h-4 text-sky-500" />
                  <span>Modelo de Exibição dos Itens na Vitrine</span>
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Defina o formato visual que seus clientes verão ao navegar pelo cardápio/catálogo da sua loja.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opção 1: Grade de Cards (Fotos Grandes) */}
                <div
                  onClick={() => {
                    const nextConfig = { ...configEdits, catalogLayout: 'grid' as const };
                    setConfigEdits(nextConfig);
                    updateTenant(currentTenant.id, { 
                      config: nextConfig, 
                      branding: { ...currentTenant.branding, catalogLayout: 'grid' } 
                    });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    (configEdits.catalogLayout || 'grid') === 'grid'
                      ? 'border-sky-500 bg-sky-500/15 shadow-md text-white'
                      : isLight
                      ? 'bg-slate-50 hover:bg-sky-50/50 border-slate-300 text-slate-800'
                      : 'bg-[#151D24] hover:bg-[#1E2933] border-[#222E3A] text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-sky-400" />
                      <span className="font-bold text-sm">Grade com Fotos Grandes</span>
                    </div>
                    {(configEdits.catalogLayout || 'grid') === 'grid' && (
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Cards retangulares com fotos amplas em destaque e botão de adicionar no rodapé. Ideal para adegas, empórios, conveniências e vitrines de produtos.
                  </p>
                  <div className="h-12 rounded-lg bg-black/10 dark:bg-white/5 border border-black/10 p-1 flex gap-2 items-center">
                    <div className="flex-1 h-full rounded bg-sky-400/25 flex flex-col p-1 justify-between">
                      <div className="w-full h-4 rounded bg-sky-400/35" />
                      <div className="w-2/3 h-1.5 rounded bg-sky-400/40" />
                    </div>
                    <div className="flex-1 h-full rounded bg-sky-400/25 flex flex-col p-1 justify-between">
                      <div className="w-full h-4 rounded bg-sky-400/35" />
                      <div className="w-2/3 h-1.5 rounded bg-sky-400/40" />
                    </div>
                  </div>
                </div>

                {/* Opção 2: Lista Compacta com Miniatura (Estilo Restaurante / Delivery) */}
                <div
                  onClick={() => {
                    const nextConfig = { ...configEdits, catalogLayout: 'list' as const };
                    setConfigEdits(nextConfig);
                    updateTenant(currentTenant.id, { 
                      config: nextConfig, 
                      branding: { ...currentTenant.branding, catalogLayout: 'list' } 
                    });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    configEdits.catalogLayout === 'list'
                      ? 'border-sky-500 bg-sky-500/15 shadow-md text-white'
                      : isLight
                      ? 'bg-slate-50 hover:bg-sky-50/50 border-slate-300 text-slate-800'
                      : 'bg-[#151D24] hover:bg-[#1E2933] border-[#222E3A] text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <List className="w-5 h-5 text-slate-300" />
                      <span className="font-bold text-sm">Lista com Miniatura Lateral</span>
                    </div>
                    {configEdits.catalogLayout === 'list' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Lista corrida com título, descrição, preço e miniatura quadrada à direita. O formato tradicional e clássico de cardápios de pizzarias, hamburguerias e delivery.
                  </p>
                  <div className="h-12 rounded-lg bg-black/10 dark:bg-white/5 border border-black/10 p-1 flex flex-col justify-between gap-1">
                    <div className="flex items-center justify-between gap-2 h-4">
                      <div className="w-3/4 h-2 rounded bg-slate-400/40" />
                      <div className="w-4 h-4 rounded bg-slate-400/40 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-2 h-4">
                      <div className="w-2/3 h-2 rounded bg-slate-400/40" />
                      <div className="w-4 h-4 rounded bg-slate-400/40 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Pedidos & WhatsApp Toggle (Apenas visível se Vendas Online estiver marcado) */}
          {isOnlineEnabled && (
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>Modo de Operação de Pedidos & WhatsApp</span>
              </h3>

              {/* Main WhatsApp Orders Toggle */}
              <div className={`p-4 rounded-xl border transition-all ${
                whatsAppEdits?.enableWhatsAppOrders ?? currentTenant.whatsapp.enableWhatsAppOrders ?? true
                  ? isLight
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30'
                    : 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30' 
                  : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-neutral-950 border-neutral-800'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Trabalhar com Pedidos via WhatsApp
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (whatsAppEdits?.enableWhatsAppOrders ?? currentTenant.whatsapp.enableWhatsAppOrders ?? true)
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : isLight
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {(whatsAppEdits?.enableWhatsAppOrders ?? currentTenant.whatsapp.enableWhatsAppOrders ?? true) ? 'MENU VISÍVEL' : 'MENU OCULTO'}
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                      {(whatsAppEdits?.enableWhatsAppOrders ?? currentTenant.whatsapp.enableWhatsAppOrders ?? true)
                        ? 'Ao finalizar no carrinho, o cliente é redirecionado para o WhatsApp da sua loja com a mensagem pronta de pedido (itens, total, troco e endereço) e a aba "WhatsApp & Mensagens" é exibida no menu.' 
                        : 'Ao desmarcar, o menu "WhatsApp & Mensagens" é removido da navegação e os pedidos são recebidos e confirmados 100% diretamente no sistema web.'
                      }
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    id="enableWhatsappOrdersToggle"
                    checked={whatsAppEdits?.enableWhatsAppOrders ?? currentTenant.whatsapp.enableWhatsAppOrders ?? true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setWhatsAppEdits(prev => prev ? ({ ...prev, enableWhatsAppOrders: checked }) : prev);
                      updateTenant(currentTenant.id, {
                        whatsapp: {
                          ...(whatsAppEdits || currentTenant.whatsapp),
                          enableWhatsAppOrders: checked,
                        }
                      });
                    }}
                    className="w-5 h-5 rounded text-blue-500 bg-neutral-800 border-neutral-700 cursor-pointer mt-1 shrink-0"
                  />
                </div>
              </div>

            {/* Other operational toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800/80'
              }`}>
                <div>
                  <label htmlFor="soundAlertsToggle" className={`text-xs font-semibold block cursor-pointer ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Alertas Sonoros no Painel
                  </label>
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Avisar sonoro quando entrar novo pedido
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="soundAlertsToggle"
                  checked={configEdits.soundAlerts}
                  onChange={(e) => setConfigEdits({ ...configEdits, soundAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-500 bg-neutral-800 border-neutral-700"
                />
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800/80'
              }`}>
                <div>
                  <label htmlFor="closedOrdersToggle" className={`text-xs font-semibold block cursor-pointer ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Permitir Pedidos com Loja Fechada
                  </label>
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Agendar para entrega na abertura
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="closedOrdersToggle"
                  checked={configEdits.allowOrdersWhenClosed}
                  onChange={(e) => setConfigEdits({ ...configEdits, allowOrdersWhenClosed: e.target.checked })}
                  style={{ accentColor: activeAccent }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
          )}

          {/* Section: Formas de Pagamento Aceitas */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <CreditCard className="w-4 h-4" style={{ color: activeAccent }} />
              <span>Formas de Pagamento Aceitas no Checkout</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* PIX */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                configEdits.acceptPix 
                  ? isLight
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20'
                    : 'bg-neutral-950 border-emerald-500/40' 
                  : isLight
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-neutral-950/50 border-neutral-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-emerald-950' : 'text-white'}`}>
                    <QrCode className="w-4 h-4 text-emerald-500" /> PIX
                  </span>
                  <input
                    type="checkbox"
                    checked={configEdits.acceptPix}
                    onChange={(e) => setConfigEdits({ ...configEdits, acceptPix: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-500 bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-neutral-400'}`}>
                    Chave PIX do Estabelecimento:
                  </label>
                  <input
                    type="text"
                    value={configEdits.pixKey || ''}
                    onChange={(e) => setConfigEdits({ ...configEdits, pixKey: e.target.value })}
                    placeholder="CNPJ, Celular ou E-mail"
                    className={`w-full px-2.5 py-1.5 rounded font-mono text-xs transition-all ${
                      isLight 
                        ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                        : 'bg-neutral-900 border border-neutral-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Cartão */}
              <div 
                className={`p-3.5 rounded-xl border transition-all ${
                  configEdits.acceptCard 
                    ? isLight
                      ? 'shadow-xs'
                      : '' 
                    : isLight
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-neutral-950/50 border-neutral-800 opacity-60'
                }`}
                style={configEdits.acceptCard ? {
                  borderColor: `${activeAccent}66`,
                  backgroundColor: `${activeAccent}12`,
                } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <CreditCard className="w-4 h-4" style={{ color: activeAccent }} /> Cartão na Entrega / Balcão
                  </span>
                  <input
                    type="checkbox"
                    checked={configEdits.acceptCard}
                    onChange={(e) => setConfigEdits({ ...configEdits, acceptCard: e.target.checked })}
                    style={{ accentColor: activeAccent }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-neutral-400'}`}>
                  Entregador leva a maquininha (Débito e Crédito).
                </p>
              </div>

              {/* Dinheiro */}
              <div 
                className={`p-3.5 rounded-xl border transition-all ${
                  configEdits.acceptCash 
                    ? isLight
                      ? 'shadow-xs'
                      : '' 
                    : isLight
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-neutral-950/50 border-neutral-800 opacity-60'
                }`}
                style={configEdits.acceptCash ? {
                  borderColor: `${activeAccent}66`,
                  backgroundColor: `${activeAccent}12`,
                } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Banknote className="w-4 h-4" style={{ color: activeAccent }} /> Dinheiro com Troco
                  </span>
                  <input
                    type="checkbox"
                    checked={configEdits.acceptCash}
                    onChange={(e) => setConfigEdits({ ...configEdits, acceptCash: e.target.checked })}
                    style={{ accentColor: activeAccent }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-neutral-400'}`}>
                  Permite solicitar troco no checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Dados Cadastrais da Empresa */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Building2 className="w-4 h-4" style={{ color: activeAccent }} />
                <span>Dados Cadastrais da Empresa</span>
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                <span>Ramo:</span>
                <span>{getSegmentById(currentTenant.businessSegment).emoji}</span>
                <span className="font-bold">{getSegmentById(currentTenant.businessSegment).title}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Nome Fantasia do Estabelecimento
                </label>
                <input
                  type="text"
                  value={storeNameEdit}
                  onChange={(e) => setStoreNameEdit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  CNPJ ou CPF
                </label>
                <input
                  type="text"
                  value={documentEdit}
                  onChange={(e) => setDocumentEdit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg font-mono transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Nome do Proprietário / Gerente
                </label>
                <input
                  type="text"
                  value={ownerNameEdit}
                  onChange={(e) => setOwnerNameEdit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Telefone Comercial / Suporte
                </label>
                <input
                  type="text"
                  value={ownerPhoneEdit}
                  onChange={(e) => setOwnerPhoneEdit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg font-mono transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  value={ownerEmailEdit}
                  onChange={(e) => setOwnerEmailEdit(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section: Endereço da Loja & Raio de Atendimento / Entrega */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <MapPin className="w-4 h-4" style={{ color: activeAccent }} />
                <span>Endereço da Loja & Raio de Atendimento</span>
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Endereço físico do seu comércio, horários de funcionamento e taxas/regras de entrega para os clientes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Rua / Avenida
                </label>
                <input
                  type="text"
                  value={addressEdits?.street || ''}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      street: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Número
                </label>
                <input
                  type="text"
                  value={addressEdits?.number || ''}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      number: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Bairro
                </label>
                <input
                  type="text"
                  value={addressEdits?.neighborhood || ''}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      neighborhood: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Cidade
                </label>
                <input
                  type="text"
                  value={addressEdits?.city || ''}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      city: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  CEP
                </label>
                <input
                  type="text"
                  value={addressEdits?.zip || ''}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      zip: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg font-mono transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Raio de Entrega (km)
                </label>
                <input
                  type="number"
                  value={addressEdits?.deliveryRadiusKm || 10}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      deliveryRadiusKm: Number(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Taxa de Entrega Padrão (R$)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={addressEdits?.standardDeliveryFee || 0}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      standardDeliveryFee: Number(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Frete Grátis Acima de (R$)
                </label>
                <input
                  type="number"
                  step="5"
                  value={addressEdits?.freeDeliveryThreshold || 0}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      freeDeliveryThreshold: Number(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div className="sm:col-span-3">
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-300'}`}>
                  Horário de Atendimento
                </label>
                <input
                  type="text"
                  value={addressEdits?.openingHours || ''}
                  onChange={(e) =>
                    setAddressEdits({
                      ...(addressEdits || currentTenant.address),
                      openingHours: e.target.value,
                    })
                  }
                  placeholder="Ex: Seg a Sáb: 10h às 02h | Dom: 11h às 23h"
                  className={`w-full px-3 py-2 rounded-lg transition-all ${
                    isLight 
                      ? 'bg-white border border-slate-300 text-slate-900 font-semibold focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border border-neutral-800 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO: APARÊNCIA DO SISTEMA (MODO CLARO / ESCURO) */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Aparência do Sistema</span>
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Defina o layout do sistema administrativo (modo claro ou modo escuro).
              </p>
            </div>

            {/* Modo de Cor do Sistema: Claro ou Escuro */}
            <div>
              <label className={`block text-xs font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                Modo Visual do Sistema do Lojista:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('light');
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      colorMode: 'light',
                    });
                    if (currentTenant) {
                      updateTenant(currentTenant.id, {
                        branding: {
                          ...currentTenant.branding,
                          colorMode: 'light',
                        },
                      });
                    }
                  }}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'border-neutral-700 bg-neutral-800 text-white shadow-xs font-bold'
                      : isLight
                      ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${themeMode === 'light' ? 'bg-neutral-700 text-white' : isLight ? 'bg-blue-100 text-blue-600' : 'bg-neutral-700 text-white'}`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className={`block text-xs font-bold ${themeMode === 'light' ? 'text-white' : isLight ? 'text-slate-900' : 'text-neutral-300'}`}>
                      Modo Claro (Diurno)
                    </span>
                    <span className={`text-[11px] ${themeMode === 'light' ? 'text-neutral-300' : 'text-slate-500 dark:text-neutral-400'}`}>
                      Visual limpo com fundo branco e contraste suave
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('dark');
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      colorMode: 'dark',
                    });
                    if (currentTenant) {
                      updateTenant(currentTenant.id, {
                        branding: {
                          ...currentTenant.branding,
                          colorMode: 'dark',
                        },
                      });
                    }
                  }}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'border-neutral-700 bg-neutral-800 text-white shadow-xs font-bold'
                      : isLight
                      ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${themeMode === 'dark' ? 'bg-neutral-700 text-white' : isLight ? 'bg-slate-200 text-slate-800' : 'bg-neutral-700 text-white'}`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className={`block text-xs font-bold ${themeMode === 'dark' ? 'text-white' : isLight ? 'text-slate-900' : 'text-neutral-300'}`}>
                      Modo Escuro (Noturno)
                    </span>
                    <span className={`text-[11px] ${themeMode === 'dark' ? 'text-neutral-300' : 'text-slate-500 dark:text-neutral-400'}`}>
                      Visual grafite escuro premium para menor cansaço visual
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveStoreManagement}
              className="btn-graphite px-6 py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Salvar Todas as Configurações da Loja
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: VISUAL, CORES & VITRINE ONLINE */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Personalização da Vitrine Online & Identidade Visual
              </h2>
              <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Escolha as cores da marca, o papel de parede (estilo flyer) de acordo com seu comércio e o logotipo da vitrine web.
              </p>
            </div>

            <button
              onClick={handleSaveBranding}
              style={{
                backgroundColor: activeAccent,
                color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Visual & Vitrine</span>
            </button>
          </div>

          {/* PRÉVIA EM TEMPO REAL DA VITRINE ONLINE */}
          {isOnlineEnabled ? (
            <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors ${
              isLight ? 'bg-white border-neutral-300' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className={`p-3 border-b flex items-center justify-between text-xs ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${brandingEdits?.bannerUrl ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                  <span className={`font-bold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    Prévia em Tempo Real da Vitrine Online
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Como seus clientes verão na web
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewRole('storefront')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <span>Abrir Vitrine</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Banner Hero Preview com o Papel de Parede / Flyer e Estilo de Iluminação */}
              {(() => {
                const lighting = brandingEdits?.bannerLighting || 'dark_lights';
                const isWhite = lighting === 'white_lights';
                const isDarkLights = lighting === 'dark_lights';
                const isNeutral = lighting === 'neutral';

                // Overlay Dinâmico
                let overlayBg = `linear-gradient(100deg, ${brandingEdits?.primaryColor || '#881337'}F2 0%, ${brandingEdits?.primaryColor || '#881337'}B3 50%, rgba(10, 10, 10, 0.88) 100%)`;
                let overlayBoxShadow = 'none';

                if (isNeutral) {
                  overlayBg = 'linear-gradient(to right, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.75) 100%)';
                } else if (isDarkLights) {
                  overlayBg = `
                    radial-gradient(circle at 82% 18%, ${brandingEdits?.accentColor || '#F59E0B'}45 0%, rgba(14, 165, 233, 0.25) 30%, transparent 65%),
                    radial-gradient(circle at 95% 82%, rgba(14, 165, 233, 0.20) 0%, transparent 45%),
                    linear-gradient(130deg, transparent 52%, rgba(255, 255, 255, 0.08) 68%, ${brandingEdits?.accentColor || '#F59E0B'}30 73%, transparent 84%),
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
                    radial-gradient(circle at 95% 82%, ${brandingEdits?.accentColor || '#F59E0B'}25 0%, transparent 45%),
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
                  <div className={`relative min-h-[175px] sm:min-h-[195px] flex items-center overflow-hidden rounded-2xl ${
                    isWhite 
                      ? 'ring-1 ring-white/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)]' 
                      : isDarkLights
                      ? 'ring-1 ring-white/10 shadow-2xl'
                      : ''
                  }`}>
                    {/* Imagem de Fundo (Papel de Parede / Flyer) */}
                    {brandingEdits?.bannerUrl ? (
                      <div
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-500 scale-100 ${
                          (isWhite || isDarkLights) ? 'contrast-[1.10] saturate-[1.15]' : ''
                        }`}
                        style={{ backgroundImage: `url(${brandingEdits.bannerUrl})` }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 transition-colors"
                        style={{ backgroundColor: isWhite ? '#ffffff' : (brandingEdits?.primaryColor || '#0a0a0a') }}
                      />
                    )}

                    {/* Efeitos Especiais de Luzes Focadas e Feixes quando isWhite */}
                    {isWhite && (
                      <>
                        <div 
                          className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-80"
                          style={{
                            background: `radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(254, 240, 138, 0.45) 30%, ${brandingEdits?.accentColor || '#F59E0B'}35 60%, transparent 80%)`
                          }}
                        />
                        <div 
                          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                          style={{
                            background: 'linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.8) 65%, transparent 80%)'
                          }}
                        />
                        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white via-white/90 to-transparent opacity-95" />
                      </>
                    )}

                    {/* Efeitos Especiais de Luzes Focadas e Feixes quando isDarkLights */}
                    {isDarkLights && (
                      <>
                        <div 
                          className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-75"
                          style={{
                            background: `radial-gradient(circle, ${brandingEdits?.accentColor || '#F59E0B'}55 0%, rgba(14, 165, 233, 0.35) 35%, transparent 75%)`
                          }}
                        />
                        <div 
                          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                          style={{
                            background: 'linear-gradient(115deg, transparent 38%, rgba(255, 255, 255, 0.5) 65%, transparent 80%)'
                          }}
                        />
                        <div 
                          className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] opacity-75"
                          style={{
                            background: `linear-gradient(to right, transparent, ${brandingEdits?.accentColor || '#F59E0B'}90, rgba(255,255,255,0.4), transparent)`
                          }}
                        />
                      </>
                    )}

                    {/* Camada de Iluminação e Gradiente */}
                    <div 
                      className="absolute inset-0 transition-all duration-300"
                      style={{
                        background: overlayBg,
                        boxShadow: overlayBoxShadow,
                      }}
                    />

                    {/* Conteúdo da Vitrine na Prévia */}
                    <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 w-full">
                      <div className="flex items-center gap-4 max-w-2xl">
                        {/* Logotipo */}
                        {brandingEdits?.logoUrl ? (
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5 border shrink-0 shadow-xl backdrop-blur-xs flex items-center justify-center ${
                            isWhite ? 'bg-white/90 border-slate-300 shadow-md' : 'bg-black/60 border-white/20'
                          }`}>
                            <img
                              src={brandingEdits.logoUrl}
                              alt="Logo Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center font-extrabold text-2xl sm:text-3xl shrink-0 shadow-xl backdrop-blur-xs transition-colors"
                            style={{
                              backgroundColor: isWhite ? '#ffffff' : (brandingEdits?.primaryColor || '#0a0a0a'),
                              borderColor: brandingEdits?.accentColor || '#F59E0B',
                              color: isWhite ? '#0f172a' : (brandingEdits?.accentColor || '#F59E0B')
                            }}
                          >
                            {currentTenant.name.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-1">
                          <span 
                            className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm border transition-all"
                            style={{
                              backgroundColor: `${brandingEdits?.accentColor || '#D97706'}33`,
                              color: brandingEdits?.accentColor || '#F59E0B',
                              borderColor: `${brandingEdits?.accentColor || '#D97706'}77`,
                            }}
                          >
                            <Sparkles className="w-3 h-3" />
                            {brandingEdits?.badgeNotice || 'Entrega expressa e atendimento direto'}
                          </span>
                          <h3 className={`text-xl sm:text-2xl font-black drop-shadow-md ${
                            isWhite ? 'text-slate-900' : 'text-white'
                          }`}>
                            {currentTenant.name}
                          </h3>
                          <p className={`text-xs max-w-md ${
                            isWhite ? 'text-slate-700 font-medium' : 'text-white/90 drop-shadow-xs'
                          }`}>
                            {sloganEdit || currentTenant.slogan || getSegmentById(currentTenant.businessSegment).sloganExample}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-200'
            }`}>
              <Store className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
              <div>
                <span className="font-bold block">Plano Apenas Loja Física / Balcão (PDV) Ativo</span>
                <span className={isLight ? 'text-slate-600' : 'text-neutral-400'}>
                  O seu estabelecimento opera com foco presencial no caixa. Banners de vitrine pública ficam ocultos. As cores da sua marca são aplicadas no Frente de Caixa (PDV), botões de bipar e comprovantes.
                </span>
              </div>
            </div>
          )}

          {/* SEÇÃO 1: PAPEL DE PAREDE / FUNDO DA VITRINE DIVIDIDO POR CATEGORIAS */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  <Sparkles className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Papel de Parede & Flyer de Fundo da Vitrine</span>
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Escolha um flyer temático que combine com o seu negócio ou envie sua própria imagem.
                </p>
              </div>

              {/* Botão para desativar imagem e deixar apenas cores sólidas */}
              {brandingEdits?.bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBrandingEdits({ ...(brandingEdits || currentTenant.branding), bannerUrl: '' })}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 underline font-semibold self-start sm:self-auto cursor-pointer"
                >
                  Usar apenas cores sólidas (Sem imagem)
                </button>
              )}
            </div>

            {/* Abas de Categorias de Papel de Parede */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs overflow-x-auto ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              {relevantWallpaperCategories.map((cat) => {
                const isActive = wallpaperCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setWallpaperCategory(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200'
                          : 'shadow-sm'
                        : isLight
                        ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                    style={isActive && !isLight ? {
                      backgroundColor: activeAccent,
                      color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
                    } : {}}
                  >
                    {cat.id === 'adega' && <Wine className="w-3.5 h-3.5" />}
                    {cat.id === 'restaurante' && <Sandwich className="w-3.5 h-3.5" />}
                    {cat.id === 'pizzaria' && <Pizza className="w-3.5 h-3.5" />}
                    {cat.id === 'japonesa' && <Fish className="w-3.5 h-3.5" />}
                    {cat.id === 'mercadinho' && <ShoppingCart className="w-3.5 h-3.5" />}
                    {cat.id === 'petshop' && <Dog className="w-3.5 h-3.5" />}
                    {cat.id === 'cosmeticos' && <Sparkles className="w-3.5 h-3.5" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid de Papéis de Parede da Categoria Selecionada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STORE_WALLPAPERS
                .filter((w) => w.category === wallpaperCategory)
                .map((wallpaper) => {
                  const isSelected = brandingEdits?.bannerUrl === wallpaper.url;
                  return (
                    <button
                      key={wallpaper.id}
                      type="button"
                      onClick={() =>
                        setBrandingEdits({
                          ...(brandingEdits || currentTenant.branding),
                          bannerUrl: wallpaper.url,
                        })
                      }
                      className={`group relative rounded-xl border overflow-hidden text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'shadow-md scale-[1.01]'
                          : isLight
                          ? 'border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                      style={isSelected ? {
                        borderColor: activeAccent,
                        boxShadow: `0 0 0 2px ${activeAccent}44`,
                      } : {}}
                    >
                      {/* Miniatura da Imagem */}
                      <div className="relative h-28 w-full overflow-hidden bg-neutral-900">
                        <img
                          src={wallpaper.url}
                          alt={wallpaper.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Tag no topo */}
                        <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-xs">
                          {wallpaper.tag}
                        </span>

                        {/* Checkmark se selecionado */}
                        {isSelected && (
                          <div 
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md"
                            style={{
                              backgroundColor: activeAccent,
                              color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="p-3 space-y-1">
                        <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          {wallpaper.title}
                        </h4>
                        <p className={`text-[10px] leading-snug line-clamp-2 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          {wallpaper.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Opção para Enviar Papel de Parede / Flyer Próprio */}
            <div className={`p-4 rounded-xl border border-dashed space-y-3 transition-colors ${
              isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-950/70 border-neutral-700'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" style={{ color: activeAccent }} />
                  <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    Enviar Papel de Parede / Flyer Personalizado da sua Loja
                  </span>
                </div>
                <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  PNG, JPG, WebP até 8MB
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all shadow-2xs ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
                }`}>
                  <Upload className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Anexar Imagem do Computador / Celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={brandingEdits?.bannerUrl || ''}
                  onChange={(e) =>
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      bannerUrl: e.target.value,
                    })
                  }
                  placeholder="Ou cole a URL direta de uma imagem da internet"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: LOGOTIPO DA LOJA */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  <ImageIcon className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Logotipo da Loja / Marca</span>
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Anexe o arquivo de imagem da logo do seu estabelecimento para aparecer na vitrine e nos comprovantes.
                </p>
              </div>

              {brandingEdits?.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs text-rose-500 hover:text-rose-600 underline font-semibold cursor-pointer"
                >
                  Remover Logo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
              {/* Logo Preview Slot */}
              <div 
                className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-2 relative"
                style={{
                  backgroundColor: brandingEdits?.logoUrl ? (isLight ? '#f8fafc' : '#0a0a0a') : (brandingEdits?.primaryColor || '#881337'),
                  borderColor: isLight ? '#cbd5e1' : '#404040',
                }}
              >
                {brandingEdits?.logoUrl ? (
                  <img
                    src={brandingEdits.logoUrl}
                    alt="Logotipo do Estabelecimento"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center font-bold text-white">
                    <span className="text-3xl">{currentTenant.name.charAt(0)}</span>
                    <span className="text-[9px] font-normal opacity-80">Sem Logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-xs font-bold shadow-2xs ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-100 border-neutral-700'
                }`}>
                  <Upload className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Anexar Imagem da Logo (PNG, JPG, SVG, WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={brandingEdits?.logoUrl || ''}
                  onChange={(e) =>
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      logoUrl: e.target.value,
                    })
                  }
                  placeholder="Ou cole a URL direta da imagem da logo"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: CORES DA VITRINE DO CARDÁPIO ONLINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Cores da Vitrine do Cardápio ({getSegmentById(currentTenant.businessSegment).emoji} {getSegmentById(currentTenant.businessSegment).shortLabel})</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Exclusivo Vitrine dos Clientes
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Estas cores são exibidas exclusivamente no catálogo/cardápio online público da sua loja. O sistema administrativo do lojista permanece padronizado no design profissional da plataforma (branco, cinza gelo, black carbon e azul).
              </p>
            </div>

            {/* Paleta Completa de Temas da Vitrine (Dark Contrast & Nobres) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_THEMES.map((theme) => {
                const currentPrimary = brandingEdits?.primaryColor || currentTenant.branding.primaryColor || '#09090B';
                const currentAccent = brandingEdits?.accentColor || currentTenant.branding.accentColor || '#F59E0B';
                const isSelected = 
                  currentPrimary.toLowerCase() === theme.primary.toLowerCase() &&
                  currentAccent.toLowerCase() === theme.accent.toLowerCase();

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        primaryColor: theme.primary,
                        accentColor: theme.accent,
                        themeStyle: theme.style,
                      });
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'btn-graphite border-neutral-700 bg-neutral-800 ring-2 ring-neutral-600 text-white shadow-xs font-bold'
                        : isLight
                        ? 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
                        : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 -ml-1 shadow-xs"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <span className={`text-xs font-bold ${isSelected && !isLight ? 'text-white' : isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shrink-0">
                          Ativa
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                      {theme.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Cor Primária da Marca (Cabeçalhos / Fundo)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandingEdits?.primaryColor || '#881337'}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        primaryColor: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandingEdits?.primaryColor || ''}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        primaryColor: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                        : 'bg-neutral-950 border-neutral-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Cor Secundária / Destaques (Botões, Preços & Badges)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandingEdits?.accentColor || '#D97706'}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        accentColor: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandingEdits?.accentColor || ''}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        accentColor: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                        : 'bg-neutral-950 border-neutral-800 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Teste Visual em Tempo Real da Combinação */}
            <div 
              className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
              style={{
                borderColor: `${brandingEdits?.accentColor || '#D97706'}55`,
                backgroundColor: `${brandingEdits?.accentColor || '#D97706'}12`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-6 h-6 rounded-lg shadow-sm border flex items-center justify-center text-xs font-black"
                  style={{
                    backgroundColor: brandingEdits?.accentColor || '#F59E0B',
                    color: isLightColor(brandingEdits?.accentColor || '#F59E0B') ? '#09090b' : '#ffffff',
                    borderColor: `${brandingEdits?.accentColor || '#F59E0B'}88`,
                  }}
                >
                  ✓
                </div>
                <div>
                  <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Como sua Cor Secundária ({brandingEdits?.accentColor || '#D97706'}) aparece nos botões e preços:
                  </span>
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    Ela é aplicada na sacola, botões de adicionar produto, preços em destaque e badges de entrega.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span 
                  className="font-mono font-black text-sm tabular-nums"
                  style={{ color: brandingEdits?.accentColor || '#F59E0B' }}
                >
                  R$ 38,90
                </span>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                  style={{
                    backgroundColor: brandingEdits?.accentColor || '#F59E0B',
                    color: isLightColor(brandingEdits?.accentColor || '#F59E0B') ? '#09090b' : '#ffffff',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: TEXTOS E AVISOS DA VITRINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <Edit3 className="w-4 h-4" style={{ color: activeAccent }} />
              <span>Slogan & Avisos em Destaque na Vitrine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                    Slogan do Estabelecimento
                  </label>
                  <button
                    type="button"
                    onClick={() => setSloganEdit(getSegmentById(currentTenant.businessSegment).sloganExample)}
                    className="text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: activeAccent }}
                    title="Usar sugestão recomendada para seu segmento"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sugestão ({getSegmentById(currentTenant.businessSegment).shortLabel})</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={sloganEdit}
                  onChange={(e) => setSloganEdit(e.target.value)}
                  placeholder={getSegmentById(currentTenant.businessSegment).sloganExample}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-neutral-950 border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Badge de Aviso no Banner (Flyer)
                </label>
                <input
                  type="text"
                  value={brandingEdits?.badgeNotice || ''}
                  onChange={(e) =>
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      badgeNotice: e.target.value,
                    })
                  }
                  placeholder="Ex: Entrega expressa em até 30 min!"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-neutral-950 border-neutral-800 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Botão de Salvar no Rodapé */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveBranding}
              style={{
                backgroundColor: activeAccent,
                color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
              }}
              className="px-6 py-3 rounded-xl active:scale-95 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Visual, Cores & Vitrine</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: WHATSAPP & MENSAGENS */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Integração WhatsApp & Mensagens Automáticas</h2>
              <p className="text-xs text-neutral-400">
                Configure as mensagens prontas e decida se deseja receber os pedidos diretamente no WhatsApp.
              </p>
            </div>

            <button
              onClick={handleSaveWhatsApp}
              className="btn-graphite px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>

          <div className="space-y-4">
            {/* Toggle de Pedidos WhatsApp */}
            <div className={`p-4 rounded-xl border transition-all ${
              isWhatsAppOrdersEnabled 
                ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30' 
                : 'bg-neutral-900 border-neutral-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="enableWhatsappTabToggle" className="text-sm font-bold text-white cursor-pointer block">
                    Trabalhar com Pedidos via WhatsApp
                  </label>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    {isWhatsAppOrdersEnabled
                      ? 'Pedidos geram mensagem formatada no WhatsApp da loja com endereço, troco e itens.'
                      : 'Pedidos são finalizados diretamente no sistema/painel sem envio obrigatório de mensagem.'
                    }
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="enableWhatsappTabToggle"
                  checked={isWhatsAppOrdersEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setWhatsAppEdits(prev => prev ? ({ ...prev, enableWhatsAppOrders: checked }) : prev);
                    updateTenant(currentTenant.id, {
                      whatsapp: {
                        ...(whatsAppEdits || currentTenant.whatsapp),
                        enableWhatsAppOrders: checked,
                      }
                    });
                  }}
                  className="w-5 h-5 rounded text-blue-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Número do WhatsApp que Recebe os Pedidos *
              </label>
              <input
                type="text"
                value={whatsAppEdits?.phoneNumber || ''}
                onChange={(e) =>
                  setWhatsAppEdits({
                    ...(whatsAppEdits || currentTenant.whatsapp),
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="Ex: 5511998765432"
                className="w-full max-w-md px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs font-mono"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Formato com código do país (55) + DDD + 9 dígitos.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Modelo de Mensagem de Pedido Recebido
              </label>
              <textarea
                rows={6}
                value={whatsAppEdits?.orderTemplate || ''}
                onChange={(e) =>
                  setWhatsAppEdits({
                    ...(whatsAppEdits || currentTenant.whatsapp),
                    orderTemplate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-neutral-400">
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;id_pedido&#125;</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;loja&#125;</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;cliente&#125;</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;itens&#125;</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;total&#125;</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;endereco&#125;</span>
                <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-sky-300">&#123;pagamento&#125;</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Mensagem de Atualização de Status (ex: Saiu para Entrega)
              </label>
              <input
                type="text"
                value={whatsAppEdits?.statusUpdateTemplate || ''}
                onChange={(e) =>
                  setWhatsAppEdits({
                    ...(whatsAppEdits || currentTenant.whatsapp),
                    statusUpdateTemplate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="supportEnabled"
                checked={whatsAppEdits?.supportLinkEnabled ?? true}
                onChange={(e) =>
                  setWhatsAppEdits({
                    ...(whatsAppEdits || currentTenant.whatsapp),
                    supportLinkEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-blue-500 bg-neutral-800 border-neutral-700"
              />
              <label htmlFor="supportEnabled" className="text-xs text-neutral-200">
                Ativar botão flutuante de atendimento e suporte via WhatsApp na vitrine
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <a
              href={generateWhatsAppDirectChatUrl(currentTenant, 'Olá! Teste de integração do WhatsApp do Estabelecimento.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-emerald-400 font-medium"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Testar Mensagem no WhatsApp</span>
            </a>

            <button
              onClick={handleSaveWhatsApp}
              className="btn-graphite px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Salvar Configurações WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: MÉTRICAS DA ADEGA */}
      {activeTab === 'metricas' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-white">Desempenho Comercial do Estabelecimento</h2>
            <p className="text-xs text-neutral-400">
              Dados de vendas gerados exclusivamente nesta unidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Faturamento Acumulado</span>
              <p className="text-2xl font-bold text-white tabular-nums mt-1">
                R$ {(currentTenant.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Total de Pedidos</span>
              <p className="text-2xl font-bold text-blue-400 tabular-nums mt-1">
                {tenantOrders.length}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Ticket Médio</span>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                R${' '}
                {tenantOrders.length > 0
                  ? (tenantOrders.reduce((acc, o) => acc + o.total, 0) / tenantOrders.length).toFixed(2)
                  : '0,00'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Editor Modal */}
      <ProductEditorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

    </div>
  );
};
