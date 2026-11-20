import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, CategoryType, StoreManagementConfig, BusinessSegmentType } from '../../types';
import { CATEGORIES_CONFIG } from '../../data/mockData';
import { BUSINESS_SEGMENTS, getSegmentById, getTenantCategories, getCategoryDisplayName, getSegmentColorOptions } from '../../data/businessSegments';
import { PRESET_THEMES, PRESET_BANNERS, getSegmentThemes } from './OnboardingWizardModal';
import { STORE_WALLPAPERS, WALLPAPER_CATEGORIES, StoreWallpaper } from '../../data/wallpapers';
import { ProductEditorModal } from './ProductEditorModal';
import { PDVSalesView } from './PDVSalesView';
import { InventoryView } from './InventoryView';
import { FinancialManagementView } from './FinancialManagementView';
import { StoreSettingsView } from './StoreSettingsView';
import { DiningTablesView } from './DiningTablesView';
import { KitchenKDSView } from './KitchenKDSView';
import { PromoFlyerBanner } from '../common/PromoFlyerBanner';
import { 
  Building2, 
  Store, 
  ShoppingBag, 
  Palette, 
  MessageSquare, 
  MapPin, 
  BarChart3, 
  Wallet,
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
  UtensilsCrossed,
  ChefHat,
  Globe,
  Info,
  Sun,
  Moon,
  Wine,
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
  Lock,
  ChevronDown,
  Copy,
  Printer,
  User
} from 'lucide-react';
import { TableQRCodeModal } from './TableQRCodeModal';
import { generatePixPayload, getQRCodeUrl } from '../../utils/pixPayload';

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
    currentStoreUser,
    tenantUsers,
    setCurrentStoreUserId,
  } = useStore();

  // Modal para troca rápida de operador de caixa no cabeçalho
  const [showSwitchOperatorModal, setShowSwitchOperatorModal] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'produtos' | 'vendas' | 'estoque' | 'pedidos' | 'mesas' | 'cozinha' | 'configuracoes' | 'visual' | 'whatsapp' | 'entrega' | 'metricas'
  >('produtos');

  // Orders filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');

  // Promo banner dismiss state
  const [isPromoDismissed, setIsPromoDismissed] = useState(false);

  // Quando o Master publica ou altera a promoção, reexibe o banner automaticamente
  useEffect(() => {
    if (globalConfig?.promoBanner?.updatedAt) {
      setIsPromoDismissed(false);
    }
  }, [globalConfig?.promoBanner?.updatedAt]);

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

  // Estados de QR Code PIX e Cardápio de Mesas
  const [showTableQRModal, setShowTableQRModal] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [copiedPixPayload, setCopiedPixPayload] = useState(false);
  const [copiedMenuLink, setCopiedMenuLink] = useState(false);
  const [pixKeyTypeEdit, setPixKeyTypeEdit] = useState<'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria'>('cnpj');
  const [pixBeneficiaryEdit, setPixBeneficiaryEdit] = useState(currentTenant?.name || '');
  const [pixCityEdit, setPixCityEdit] = useState(currentTenant?.address?.city || 'SAO PAULO');

  // Link público oficial do cardápio digital
  const menuPublicUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' && (window.location.origin.includes('web.app') || window.location.origin.includes('firebaseapp.com'))
      ? window.location.origin
      : 'https://nuvi-saas.web.app';
    return `${origin}/${currentTenant?.slug || 'loja'}/cardapio`;
  }, [currentTenant?.slug]);

  // Payload PIX oficial da loja no padrão Bacen
  const storePixPayload = useMemo(() => {
    const key = configEdits.pixKey || currentTenant?.document || '';
    if (!key) return '';
    return generatePixPayload({
      pixKey: key,
      pixKeyType: pixKeyTypeEdit,
      beneficiaryName: pixBeneficiaryEdit || currentTenant?.name || 'LOJA',
      city: pixCityEdit || currentTenant?.address?.city || 'CIDADE',
    });
  }, [configEdits.pixKey, currentTenant?.document, pixKeyTypeEdit, pixBeneficiaryEdit, pixCityEdit, currentTenant?.name, currentTenant?.address?.city]);

  const activePrimary = brandingEdits?.primaryColor || currentTenant?.branding?.primaryColor || '#09090B';
  const activeAccent = brandingEdits?.accentColor || currentTenant?.branding?.accentColor || '#F59E0B';

  // Estados para filtro dropdown de cores no celular
  const [isColorFilterOpen, setIsColorFilterOpen] = useState(false);
  const [colorSearchQuery, setColorSearchQuery] = useState('');

  const currentSegmentThemes = useMemo(() => {
    return getSegmentThemes(currentTenant?.businessSegment);
  }, [currentTenant?.businessSegment]);

  const activeThemeSelected = useMemo(() => {
    return currentSegmentThemes.find(
      (t) =>
        t.primary.toLowerCase() === activePrimary.toLowerCase() &&
        t.accent.toLowerCase() === activeAccent.toLowerCase()
    ) || currentSegmentThemes[0] || {
      id: 'custom',
      name: 'Paleta Personalizada',
      primary: activePrimary,
      accent: activeAccent,
      style: 'gold_luxury' as const,
      desc: 'Cores ativas na vitrine',
    };
  }, [currentSegmentThemes, activePrimary, activeAccent]);

  const filteredSegmentThemes = useMemo(() => {
    if (!colorSearchQuery.trim()) return currentSegmentThemes;
    const q = colorSearchQuery.toLowerCase();
    return currentSegmentThemes.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q))
    );
  }, [currentSegmentThemes, colorSearchQuery]);

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
    return WALLPAPER_CATEGORIES.filter((cat: { id: string }) => cat.id === targetWallpaperCat || cat.id === 'propaganda');
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

  // Mesas & Salão ativas por padrão para restaurantes, lanchonetes, pizzarias, adegas e comércios (salvo se desativado nas configs)
  const isTableServiceActive = currentTenant?.config?.enableTableService !== false;
  const activeTableOrdersCount = tenantOrders.filter(o => o.deliveryType === 'mesa' && o.status !== 'finalizado' && o.status !== 'cancelado').length;
  const pendingKitchenCount = tenantOrders.filter(o => o.status === 'novo' || o.status === 'preparando').length;

  // Dynamically constructed available tabs based on tenant operational model & Master Permissions
  // Prioridade número 1 solicitada: Catálogo de Produtos / Cardápio sempre em primeiro lugar!
  const allSystemTabs = [
    ...((isFoodOrPizza || isOnlineEnabled || true) && allowStorefront ? [
      { id: 'produtos', label: productsTabLabel, icon: productsTabIcon, count: tenantProducts.length },
    ] : []),
    ...(isPhysicalEnabled && allowPDV ? [{ id: 'vendas', label: 'Vendas Balcão (PDV)', icon: ShoppingCart }] : []),
    ...(isTableServiceActive ? [
      { id: 'mesas', label: 'Mesas & Salão', icon: UtensilsCrossed, count: activeTableOrdersCount > 0 ? activeTableOrdersCount : undefined },
    ] : []),
    { id: 'cozinha', label: 'Cozinha (KDS)', icon: ChefHat, count: pendingKitchenCount > 0 ? pendingKitchenCount : undefined },
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
    ...(allowMetrics ? [
      { id: 'metricas', label: 'Gestão Financeira & Caixa', icon: Wallet },
    ] : []),
    { id: 'configuracoes', label: 'Configurações da Loja', icon: Settings },
  ];

  // Filtra as abas pelas permissões do usuário/operador logado
  const availableTabs = useMemo(() => {
    // Gerente Geral / Proprietário SEMPRE tem acesso a todas as abas do sistema
    if (!currentStoreUser?.permissions || currentStoreUser.permissions.length === 0 || currentStoreUser.role === 'gerente') {
      return allSystemTabs;
    }
    const filtered = allSystemTabs.filter((tab) => {
      // Se a aba for mesas ou cozinha, libera para quem tem acesso a vendas/pedidos ou permissão direta
      if (tab.id === 'mesas' || tab.id === 'cozinha') {
        return (
          currentStoreUser.permissions.includes(tab.id as any) ||
          currentStoreUser.permissions.includes('vendas') ||
          currentStoreUser.permissions.includes('pedidos')
        );
      }
      return currentStoreUser.permissions.includes(tab.id as any);
    });
    return filtered.length > 0 ? filtered : allSystemTabs;
  }, [allSystemTabs, currentStoreUser?.permissions, currentStoreUser?.role]);

  // Auto-switch tab if current tab is hidden by disabling online or physical mode
  useEffect(() => {
    // Abas de salão e cozinha sempre são preservadas
    if (activeTab === 'mesas' || activeTab === 'cozinha') return;
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
      
      {/* Banner de Divulgação de Promoções de Vendas do SaaS Nuvi com Efeito de Flyer Inteligente Animado */}
      {globalConfig?.promoBanner?.enabled && !isPromoDismissed && (
        <PromoFlyerBanner
          banner={globalConfig.promoBanner}
          onDismiss={() => setIsPromoDismissed(true)}
        />
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

          {/* Ações Rápidas do Topo: Atalhos Diretos para Salão & Cozinha + Ícones de Acesso */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão Rápido: Gestão de Salão / Mesas */}
            <button
              type="button"
              onClick={() => setActiveTab('mesas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'mesas'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                  : isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/50'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salão & Mesas</span>
              <span className="sm:hidden">Mesas</span>
              {activeTableOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-bold">
                  {activeTableOrdersCount}
                </span>
              )}
            </button>

            {/* Botão Rápido: Visão da Cozinha KDS */}
            <button
              type="button"
              onClick={() => setActiveTab('cozinha')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'cozinha'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : isLight
                  ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cozinha KDS</span>
              <span className="sm:hidden">Cozinha</span>
              {pendingKitchenCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-black animate-pulse">
                  {pendingKitchenCount}
                </span>
              )}
            </button>

            {/* Ícone sem Fundo: Loja Aberta / Fechada */}
            <button
              type="button"
              onClick={handleToggleOpen}
              title={currentTenant.isOpen ? 'Loja Aberta (clique para fechar a loja)' : 'Loja Fechada (clique para abrir a loja)'}
              className={`p-2 rounded-xl transition-all cursor-pointer bg-transparent border-0 outline-none flex items-center justify-center ${
                currentTenant.isOpen
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
            >
              <Power className="w-5 h-5 stroke-[2.4]" />
            </button>

            {/* Ícone sem Fundo: Casinha da Vitrine Online */}
            {isOnlineEnabled && (
              <button
                type="button"
                onClick={() => setViewRole('storefront')}
                title="Ver Minha Vitrine (Abrir loja online)"
                className="p-2 rounded-xl transition-all cursor-pointer bg-transparent border-0 outline-none flex items-center justify-center text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
              >
                <Store className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}
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
                    ? isLight
                      ? 'bg-sky-500/15 text-sky-800 border-0 shadow-none'
                      : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white border-0 shadow-md shadow-[#0C2340]/40'
                    : isLight
                      ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70'
                      : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (isLight ? 'text-sky-700' : 'text-white') : 'text-sky-500'}`} />
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

      {/* TAB: GESTÃO DE MESAS & COMANDAS NO SALÃO */}
      {activeTab === 'mesas' && (
        <DiningTablesView />
      )}

      {/* TAB: VISÃO DA COZINHA (KDS) & FILA DE PREPARO */}
      {activeTab === 'cozinha' && (
        <KitchenKDSView />
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
                      ? 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white font-bold border-0 shadow-md shadow-[#0C2340]/40'
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
                      <span className="text-xs font-semibold text-neutral-400">
                        {order.deliveryType === 'delivery' 
                          ? '🛵 Entrega em Casa' 
                          : order.deliveryType === 'mesa' 
                          ? `🍽️ Mesa ${order.tableNumber || ''} (Salão)` 
                          : '🏪 Retirada no Balcão'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.deliveryType === 'mesa' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          👨‍🍳 Cozinha • Mesa {order.tableNumber || ''}
                        </span>
                      )}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] hover:from-[#0E2A4D] hover:to-[#133763] text-white font-extrabold text-xs border-0 shadow-md shadow-[#0C2340]/40 transition-all active:scale-95 cursor-pointer"
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
                    ? 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white font-bold border-0 shadow-md shadow-[#0C2340]/40'
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
                      ? 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white font-bold border-0 shadow-md shadow-[#0C2340]/40'
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="p-1 text-slate-400 hover:text-sky-500 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
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
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
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
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] hover:from-[#0E2A4D] hover:to-[#133763] text-white font-extrabold text-xs border-0 shadow-md shadow-[#0C2340]/40 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Primeiro Produto
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFIGURAÇÕES DA LOJA COM SUBMENU LATERAL ESQUERDO */}
      {activeTab === 'configuracoes' && (
        <StoreSettingsView isLight={isLight} />
      )}

      {/* TAB: GESTÃO FINANCEIRA, ENTRADAS DE VENDAS & CONTROLE DE GASTOS */}
      {activeTab === 'metricas' && (
        <FinancialManagementView />
      )}

      {/* Product Editor Modal */}
      <ProductEditorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Table QR Code & Menu Plaque Modal */}
      {showTableQRModal && currentTenant && (
        <TableQRCodeModal
          tenant={currentTenant}
          onClose={() => setShowTableQRModal(false)}
          isLight={isLight}
        />
      )}

      {/* Modal de Troca Rápida de Usuário / Operador no Painel */}
      {showSwitchOperatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1520] border-[#1E2B3A] text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2B3A]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                <h3 className="text-sm font-bold">Alternar Operador / Usuário</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchOperatorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Selecione o operador que está acessando o sistema. O painel exibirá somente as janelas autorizadas para este perfil:
            </p>

            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {tenantUsers.map((u) => {
                const isCurrent = currentStoreUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setCurrentStoreUserId(u.id);
                      setShowSwitchOperatorModal(false);
                      showAlert({
                        title: 'Operador Alterado',
                        message: `Sessão ativa alterada para "${u.name}" (${u.roleLabel}). As abas permitidas foram carregadas.`,
                        variant: 'success'
                      });
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-500/15 ring-1 ring-sky-500/30'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        : 'border-[#1E2B3A] bg-[#121A26] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCurrent ? 'bg-sky-500 text-white' : 'bg-neutral-800 text-slate-300'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">{u.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {u.roleLabel} • {u.permissions?.length || 0} janelas
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/20">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1E2B3A] flex justify-end">
              <button
                type="button"
                onClick={() => setShowSwitchOperatorModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  isLight ? 'border-slate-300 hover:bg-slate-100' : 'border-[#1E2B3A] hover:bg-neutral-800 text-slate-300'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
