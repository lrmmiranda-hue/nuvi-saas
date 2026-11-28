import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, CategoryType, StoreManagementConfig, BusinessSegmentType } from '../../types';
import { CATEGORIES_CONFIG } from '../../data/mockData';
import { BUSINESS_SEGMENTS, getSegmentById, getTenantCategories, getCategoryDisplayName, getSegmentColorOptions } from '../../data/businessSegments';
import { PRESET_THEMES, PRESET_BANNERS, getSegmentThemes } from './OnboardingWizardModal';
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
  Printer,
  Navigation,
  VolumeX,
  Play,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  User,
  Bell
} from 'lucide-react';
import { TableQRCodeModal } from './TableQRCodeModal';
import { generatePixPayload, getQRCodeUrl } from '../../utils/pixPayload';
import { playOrderAlertChime, startContinuousOrderAlert, stopContinuousOrderAlert } from '../../utils/audioAlert';
import { printThermalReceipt } from '../../utils/thermalPrinter';

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
    isMasterAuthenticated,
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

  // Orders filter & Search & Som & Impressão & Paginação
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderSoundEnabled, setOrderSoundEnabled] = useState(true);
  const [lastKnownOrderCount, setLastKnownOrderCount] = useState(0);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [thermalPaperWidth, setThermalPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [currentOrderPage, setCurrentOrderPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(6);

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

  // Novos pedidos pendentes de confirmação
  const unacceptedOrders = tenantOrders.filter(o => o.status === 'novo');
  const hasUnacceptedOrders = unacceptedOrders.length > 0;

  // Monitora novos pedidos que chegam e toca som de alerta de alta atenção estilo iFood até aceitar
  useEffect(() => {
    if (hasUnacceptedOrders && orderSoundEnabled) {
      startContinuousOrderAlert(8);
    } else {
      stopContinuousOrderAlert();
    }
    return () => {
      stopContinuousOrderAlert();
    };
  }, [hasUnacceptedOrders, orderSoundEnabled]);

  // Impressão Térmica de Cupom Não-Fiscal (80mm ou 58mm)
  const handlePrintDeliveryTicket = (order: Order, width: '80mm' | '58mm' = thermalPaperWidth, type: 'completa' | 'cozinha' | 'entrega' = 'completa') => {
    printThermalReceipt(order, currentTenant, { paperWidth: width, copyType: type });
  };

  // Filtered orders com suporte a busca rápida por nome, número ou telefone
  const filteredOrders = useMemo(() => {
    return tenantOrders.filter((order) => {
      if (orderStatusFilter !== 'todos' && order.status !== orderStatusFilter) {
        return false;
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchPhone = order.customerPhone.includes(q);
        const matchStreet = order.address?.street?.toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchStreet;
      }
      return true;
    });
  }, [tenantOrders, orderStatusFilter, orderSearchQuery]);

  // Contadores por status para os filtros rápidos
  const orderCounts = useMemo(() => {
    return {
      todos: tenantOrders.length,
      novo: tenantOrders.filter((o) => o.status === 'novo').length,
      preparando: tenantOrders.filter((o) => o.status === 'preparando').length,
      em_entrega: tenantOrders.filter((o) => o.status === 'em_entrega').length,
      finalizado: tenantOrders.filter((o) => o.status === 'finalizado').length,
      cancelado: tenantOrders.filter((o) => o.status === 'cancelado').length,
    };
  }, [tenantOrders]);

  // Paginação dos pedidos
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const currentOrdersOnPage = useMemo(() => {
    const startIndex = (currentOrderPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredOrders, currentOrderPage, ordersPerPage]);

  // Ajusta a página se a lista diminuir
  useEffect(() => {
    if (currentOrderPage > totalOrderPages) {
      setCurrentOrderPage(1);
    }
  }, [totalOrderPages, currentOrderPage]);

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

  // Permissões de Módulos definidas pelo Administrador Master ou Plano Contratado
  const allowPDV = isFeatureAllowed('enablePDVBalcao', currentTenant);
  const allowStock = isFeatureAllowed('enableStockControl', currentTenant);
  const allowStorefront = isFeatureAllowed('enableStorefront', currentTenant);
  const allowMetrics = isFeatureAllowed('enableFinancialMetrics', currentTenant);
  const allowDiningTables = isFeatureAllowed('enableDiningTables', currentTenant);
  const allowKitchenKDS = isFeatureAllowed('enableKitchenKDS', currentTenant);

  // Mesas & Salão ativas caso permitido pelo plano e não desativado nas configs
  const isTableServiceActive = (currentTenant?.config?.enableTableService !== false) && allowDiningTables;
  const activeTableOrdersCount = tenantOrders.filter(o => o.deliveryType === 'mesa' && o.status !== 'finalizado' && o.status !== 'cancelado').length;
  const pendingKitchenCount = tenantOrders.filter(o => o.status === 'novo' || o.status === 'preparando').length;

  // Dynamically constructed available tabs based on tenant operational model & Master Permissions
  // Prioridade número 1 solicitada: Catálogo de Produtos / Cardápio sempre em primeiro lugar!
  const allSystemTabs = [
    { id: 'produtos', label: productsTabLabel, icon: productsTabIcon, count: tenantProducts.length },
    ...(allowPDV ? [{ id: 'vendas', label: 'Vendas Balcão (PDV)', icon: ShoppingCart }] : []),
    ...(isTableServiceActive ? [
      { id: 'mesas', label: 'Mesas & Salão', icon: UtensilsCrossed, count: activeTableOrdersCount > 0 ? activeTableOrdersCount : undefined },
    ] : []),
    ...(allowKitchenKDS ? [{ id: 'cozinha', label: 'Cozinha (KDS)', icon: ChefHat, count: pendingKitchenCount > 0 ? pendingKitchenCount : undefined }] : []),
    ...(!isFoodOrPizza && allowStock ? [{ 
      id: 'estoque', 
      label: isAdega ? 'Estoque & Recebimento' : 'Controle de Estoque', 
      icon: Boxes, 
      count: tenantProducts.length 
    }] : []),
    ...(allowStorefront ? [
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

  // Auto-switch tab if current tab is hidden by disabling online or physical mode or plan permissions
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
          
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Logo Image or Fallback Monogram - Tamanho Aumentado */}
            {currentTenant.branding.logoUrl ? (
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shadow-md shrink-0 flex items-center justify-center p-1.5 transition-all ${
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md shrink-0 bg-gradient-to-br from-sky-600 to-blue-600 text-white border-2 border-sky-400/30"
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

          {/* Ações Rápidas do Topo: Status da Loja, Ver Vitrine e Sair */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

            {/* Ícone Sair / Desconectar da Loja */}
            <button
              type="button"
              onClick={logoutTenant}
              title="Sair do Painel (Desconectar sessão)"
              className="p-2 rounded-xl transition-all cursor-pointer bg-transparent border-0 outline-none flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </button>
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
      {activeTab === 'mesas' && isTableServiceActive && (
        <DiningTablesView />
      )}

      {/* TAB: VISÃO DA COZINHA (KDS) & FILA DE PREPARO */}
      {activeTab === 'cozinha' && allowKitchenKDS && (
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
          
          {/* Barra de Filtros, Busca Rápida e Controle de Som */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Subfilters */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs overflow-x-auto ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
            }`}>
              {[
                { id: 'todos', label: 'Todos', count: orderCounts.todos },
                { id: 'novo', label: 'Novos', count: orderCounts.novo },
                { id: 'preparando', label: 'Em Preparo', count: orderCounts.preparando },
                { id: 'em_entrega', label: 'Em Entrega', count: orderCounts.em_entrega },
                { id: 'finalizado', label: 'Finalizados', count: orderCounts.finalizado },
                { id: 'cancelado', label: 'Cancelados', count: orderCounts.cancelado },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setOrderStatusFilter(st.id);
                    setCurrentOrderPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs flex items-center gap-1.5 ${
                    orderStatusFilter === st.id
                      ? isLight
                        ? 'bg-sky-500/15 text-sky-800 border-0 shadow-none'
                        : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white border-0 shadow-md shadow-[#0C2340]/40'
                      : isLight
                        ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-[#161D24] font-semibold'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      orderStatusFilter === st.id
                        ? isLight
                          ? 'bg-sky-600 text-white'
                          : 'bg-sky-500 text-slate-900'
                        : isLight
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Busca Rápida e Botão de Som */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pedido, cliente, fone..."
                  value={orderSearchQuery}
                  onChange={(e) => {
                    setOrderSearchQuery(e.target.value);
                    setCurrentOrderPage(1);
                  }}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border ${
                    isLight ? 'bg-white border-slate-300 text-slate-800 focus:border-sky-500' : 'bg-[#11161B] border-[#1C2631] text-white focus:border-sky-500'
                  }`}
                />
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSearchQuery('');
                      setCurrentOrderPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botão Testar Som */}
              <button
                type="button"
                onClick={() => {
                  playOrderAlertChime();
                  showAlert({
                    title: 'Campainha Testada',
                    message: 'O alerta sonoro foi tocado com sucesso!',
                    variant: 'info'
                  });
                }}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
                title="Testar o sino de novo pedido"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline text-[11px]">Testar Som</span>
              </button>

              {/* Botão de Som de Notificação */}
              <button
                type="button"
                onClick={() => {
                  const newState = !orderSoundEnabled;
                  setOrderSoundEnabled(newState);
                  if (newState) {
                    playOrderAlertChime();
                  } else {
                    stopContinuousOrderAlert();
                  }
                }}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                  orderSoundEnabled
                    ? isLight
                      ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-500'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-400'
                }`}
                title={orderSoundEnabled ? 'Notificação sonora de novos pedidos ATIVADA (clique para silenciar)' : 'Notificação sonora DESATIVADA'}
              >
                {orderSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline text-[11px]">{orderSoundEnabled ? 'Som Ativo' : 'Mudo'}</span>
              </button>
            </div>
          </div>

          {/* BANNER DE ALERTA URGENTE: NOVOS PEDIDOS AGUARDANDO ACEITE */}
          {hasUnacceptedOrders && (
            <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse border border-rose-400/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                  <Bell className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base leading-tight">
                    🔔 {unacceptedOrders.length} {unacceptedOrders.length === 1 ? 'Novo Pedido Aguardando Confirmação!' : 'Novos Pedidos Aguardando Confirmação!'}
                  </h4>
                  <p className="text-xs text-white/90">
                    A campainha está tocando. Clique em "Aceitar Pedido" para iniciar o preparo e parar o alerta sonoro.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setOrderSoundEnabled(false);
                    stopContinuousOrderAlert();
                  }}
                  className="px-3 py-2 rounded-xl bg-black/30 hover:bg-black/40 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Silenciar Som 🔇
                </button>
                <button
                  type="button"
                  onClick={() => {
                    unacceptedOrders.forEach(o => updateOrderStatus(o.id, 'preparando'));
                    stopContinuousOrderAlert();
                    showAlert({
                      title: 'Pedidos Aceitos!',
                      message: `${unacceptedOrders.length} pedido(s) enviado(s) para preparo.`,
                      variant: 'success'
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Aceitar Todos ({unacceptedOrders.length}) →</span>
                </button>
              </div>
            </div>
          )}

          {/* Orders Cards List (Compactado e com suporte a Tema Claro e Escuro) */}
          <div className="space-y-3">
            {currentOrdersOnPage.map((order) => {
              const statusInfo = orderStatusConfig[order.status] || orderStatusConfig.novo;

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 space-y-3 shadow-xs transition-colors ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#11161B] border-[#1C2631] text-white'
                  }`}
                >
                  {/* Order Top Bar - Compacta com ID, Status, Canal, Horário e Cliente */}
                  <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${
                    isLight ? 'border-slate-100' : 'border-neutral-800/80'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        #{order.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isLight ? 'bg-slate-100 text-slate-700' : 'bg-neutral-800/80 text-neutral-300'
                      }`}>
                        {order.deliveryType === 'delivery' 
                          ? '🛵 Entrega' 
                          : order.deliveryType === 'mesa' 
                          ? `🍽️ Mesa ${order.tableNumber || ''}` 
                          : '🏪 Balcão'}
                      </span>
                      {order.deliveryType === 'mesa' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          👨‍🍳 Cozinha
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className={isLight ? 'text-slate-500 font-medium' : 'text-neutral-400'}>
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`hidden sm:inline ${isLight ? 'text-slate-400' : 'text-neutral-600'}`}>•</span>
                      <span className={`hidden sm:inline ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Resumo em 2 Colunas: Cliente & Entrega / Itens e Total */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                    {/* Coluna 1: Dados do Cliente, Endereço e Pagamento */}
                    <div className={`lg:col-span-4 p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
                      isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0B1015] border-[#1C2631]'
                    }`}>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                          isLight ? 'text-slate-500' : 'text-neutral-500'
                        }`}>
                          Cliente & Contato
                        </span>
                        <p className={`font-bold mt-0.5 text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {order.customerName}
                        </p>
                        <p className={`font-mono text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {order.customerPhone}
                        </p>
                      </div>

                      <div className={`border-t pt-2 ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                          isLight ? 'text-slate-500' : 'text-neutral-500'
                        }`}>
                          {order.deliveryType === 'delivery' ? 'Endereço de Entrega' : 'Tipo de Atendimento'}
                        </span>
                        {order.address ? (
                          <p className={`mt-0.5 leading-snug ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                            <strong>{order.address.street}, {order.address.number}</strong>
                            {order.address.complement ? ` (${order.address.complement})` : ''}
                            <span className={`block text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                              {order.address.neighborhood} - {order.address.city}
                            </span>
                          </p>
                        ) : (
                          <p className={`mt-0.5 font-medium ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                            {order.deliveryType === 'mesa' ? `Atendimento na Mesa ${order.tableNumber}` : 'Retirada física no balcão'}
                          </p>
                        )}
                      </div>

                      <div className={`border-t pt-1.5 flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                        <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
                          Pagamento:
                        </span>
                        <span className={`font-bold capitalize ${isLight ? 'text-slate-800' : 'text-white'}`}>
                          {order.paymentMethod === 'cartao_entrega' ? 'Cartão na Maquininha' : order.paymentMethod}
                          {order.cashChangeFor && (
                            <span className="text-sky-500 font-normal ml-1">
                              (Troco p/ R${order.cashChangeFor.toFixed(0)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Coluna 2: Itens do Pedido Compactados */}
                    <div className={`lg:col-span-8 p-2.5 rounded-xl border flex flex-col justify-between ${
                      isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0B1015] border-[#1C2631]'
                    }`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between pb-1 border-b border-inherit">
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${
                            isLight ? 'text-slate-500' : 'text-neutral-500'
                          }`}>
                            Itens ({order.items.length})
                          </span>
                          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            Subtotal R$ {order.subtotal.toFixed(2)} + Frete R$ {order.deliveryFee.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className={`flex items-center justify-between py-0.5 text-xs ${
                              isLight ? 'text-slate-800' : 'text-neutral-300'
                            }`}>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                                  isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-950/80 text-sky-400 border border-sky-800/40'
                                }`}>
                                  {item.quantity}x
                                </span>
                                <span className="font-semibold">{item.productName}</span>
                                {item.volume && (
                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
                                    ({item.volume})
                                  </span>
                                )}
                                {item.chilled && (
                                  <span className="text-[10px] text-sky-500 flex items-center gap-0.5 bg-sky-500/10 px-1 rounded font-medium">
                                    <Snowflake className="w-2.5 h-2.5" /> Gelada
                                  </span>
                                )}
                                {item.notes && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                                    • {item.notes}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-semibold tabular-nums ml-2 shrink-0">
                                R$ {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Bar */}
                      <div className={`border-t pt-2 mt-2 flex items-center justify-between ${
                        isLight ? 'border-slate-200' : 'border-neutral-800'
                      }`}>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                          <span className={isLight ? 'text-slate-600' : 'text-neutral-400'}>
                            {order.deliveryType === 'delivery' ? 'Taxa de Entrega Inclusa' : 'Sem Taxa de Entrega'}
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400 font-mono">
                          TOTAL: R$ {order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls: Status Ágil, Impressão, Rota GPS e WhatsApp */}
                  <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
                    isLight ? 'border-slate-100' : 'border-neutral-800/80'
                  }`}>
                    {/* Botões Rápidos de Mudança de Status */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {order.status === 'novo' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'preparando')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar Preparo →</span>
                        </button>
                      )}

                      {order.status === 'preparando' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, order.deliveryType === 'delivery' ? 'em_entrega' : 'finalizado')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>{order.deliveryType === 'delivery' ? 'Despachar (Saiu p/ Entrega) →' : 'Pronto / Finalizar ✓'}</span>
                        </button>
                      )}

                      {order.status === 'em_entrega' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'finalizado')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Concluir Entrega ✓</span>
                        </button>
                      )}

                      {/* Seletor manual para outros casos (cancelar, reabrir) */}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-blue-500 cursor-pointer ${
                          isLight
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <option value="novo">Novo</option>
                        <option value="preparando">Em Preparo</option>
                        <option value="em_entrega">Em Entrega</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelar</option>
                      </select>
                    </div>

                    {/* Ações: Imprimir Comanda, Abrir Rota GPS e WhatsApp */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Botão Imprimir Comanda Térmica */}
                      <button
                        type="button"
                        onClick={() => setPrintingOrder(order)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border shadow-2xs ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-slate-200'
                        }`}
                        title="Imprimir Cupom Térmico (80mm / 58mm / Cozinha / Entrega)"
                      >
                        <Printer className="w-3.5 h-3.5 text-sky-500" />
                        <span>Imprimir Cupom</span>
                      </button>

                      {/* Botão Rota GPS Google Maps para o Entregador */}
                      {order.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${order.address.street}, ${order.address.number}, ${order.address.neighborhood}, ${order.address.city}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600/15 hover:bg-sky-600/25 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold transition-colors cursor-pointer"
                          title="Abrir rota no Google Maps para o motoboy"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Rota GPS</span>
                        </a>
                      )}

                      {/* Send Status Update to Client WhatsApp */}
                      <a
                        href={generateWhatsAppStatusUpdateUrl(order, currentTenant, order.status)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Avisar no Zap</span>
                      </a>

                      {/* Direct message */}
                      <a
                        href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'
                            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                        }`}
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
              <div className={`p-10 text-center rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <ShoppingBag className={`w-8 h-8 mx-auto ${isLight ? 'text-slate-400' : 'text-neutral-600'}`} />
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Nenhum pedido encontrado
                </h4>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {orderSearchQuery || orderStatusFilter !== 'todos'
                    ? 'Nenhum pedido corresponde aos filtros selecionados.'
                    : 'Os pedidos feitos por clientes na sua vitrine aparecerão instantaneamente aqui.'}
                </p>
              </div>
            )}
          </div>

          {/* BARRA DE PAGINAÇÃO DOS PEDIDOS */}
          {filteredOrders.length > 0 && (
            <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#11161B] border-[#1C2631] text-neutral-300'
            }`}>
              {/* Informações da página e quantidade */}
              <div className="flex items-center gap-3">
                <span>
                  Mostrando{' '}
                  <strong>{(currentOrderPage - 1) * ordersPerPage + 1}</strong> a{' '}
                  <strong>{Math.min(currentOrderPage * ordersPerPage, filteredOrders.length)}</strong> de{' '}
                  <strong>{filteredOrders.length}</strong> {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>

                {/* Seletor de itens por página */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-slate-400">Por página:</span>
                  {[6, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setOrdersPerPage(num);
                        setCurrentOrderPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        ordersPerPage === num
                          ? isLight
                            ? 'bg-sky-500 text-white'
                            : 'bg-sky-600 text-white'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controles de Navegação Entre Páginas */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentOrderPage <= 1}
                  onClick={() => setCurrentOrderPage((prev) => Math.max(prev - 1, 1))}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números das Páginas */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalOrderPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalOrderPages || Math.abs(p - currentOrderPage) <= 1)
                    .map((pageNumber, idx, arr) => {
                      const showEllipsisBefore = idx > 0 && pageNumber - arr[idx - 1] > 1;
                      return (
                        <div key={pageNumber} className="flex items-center gap-1">
                          {showEllipsisBefore && <span className="px-1 text-slate-400">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentOrderPage(pageNumber)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              currentOrderPage === pageNumber
                                ? isLight
                                  ? 'bg-sky-500 text-white shadow-xs'
                                  : 'bg-sky-600 text-white shadow-xs'
                                : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={currentOrderPage >= totalOrderPages}
                  onClick={() => setCurrentOrderPage((prev) => Math.min(prev + 1, totalOrderPages))}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                  title="Próxima Página"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer border ${
                isLight
                  ? 'bg-gradient-to-r from-sky-500/15 via-blue-500/15 to-indigo-500/15 hover:from-sky-500/25 hover:to-indigo-500/25 text-sky-800 border-sky-400/40 shadow-xs'
                  : 'bg-gradient-to-r from-sky-600/25 via-blue-600/25 to-indigo-600/25 hover:from-sky-600/35 hover:to-indigo-600/35 text-sky-200 border-sky-400/40 shadow-xs'
              }`}
            >
              <Plus className="w-4 h-4 text-sky-600 dark:text-sky-300" />
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
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setProductCategoryFilter('todas')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  productCategoryFilter === 'todas'
                    ? isLight
                      ? 'bg-sky-500/15 text-sky-800 border-0 shadow-none'
                      : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white border-0 shadow-md shadow-[#0C2340]/40'
                    : isLight
                      ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-[#161D24] font-semibold'
                }`}
              >
                <span>Todas</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  productCategoryFilter === 'todas'
                    ? isLight ? 'bg-sky-200/70 text-sky-900' : 'bg-black/25 text-white'
                    : isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-400'
                }`}>
                  {tenantProducts.length}
                </span>
              </button>
              {tenantCategories.map((cat) => {
                const isSelected = productCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setProductCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                      isSelected
                        ? isLight
                          ? 'bg-sky-500/15 text-sky-800 border-0 shadow-none'
                          : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white border-0 shadow-md shadow-[#0C2340]/40'
                        : isLight
                          ? 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/70 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#161D24] font-semibold'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
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

      {/* MODAL DE IMPRESSÃO TÉRMICA (80mm / 58mm / Cozinha / Entrega) */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setPrintingOrder(null)} />
          <div className={`relative max-w-md w-full rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#151c24] border-[#253342] text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-600 text-white">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Imprimir Comanda Térmica</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Pedido #{printingOrder.id} • {printingOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Largura da Bobina */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                Largura da Bobina da Impressora:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThermalPaperWidth('80mm')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    thermalPaperWidth === '80mm'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : isLight ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span>Bobina 80mm (Padrão)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThermalPaperWidth('58mm')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    thermalPaperWidth === '58mm'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : isLight ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span>Bobina 58mm (Mini)</span>
                </button>
              </div>
            </div>

            {/* Vias de Impressão */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                Escolha a Via para Imprimir:
              </label>
              
              <button
                type="button"
                onClick={() => {
                  handlePrintDeliveryTicket(printingOrder, thermalPaperWidth, 'completa');
                  setPrintingOrder(null);
                }}
                className="w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer hover:border-sky-500 hover:bg-sky-500/10 group"
              >
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <Printer className="w-4 h-4" />
                    <span>Via Completa (Balcão / Caixa / Cliente)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Contém cabeçalho da loja, itens, valores, observações e forma de pagamento.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePrintDeliveryTicket(printingOrder, thermalPaperWidth, 'cozinha');
                  setPrintingOrder(null);
                }}
                className="w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer hover:border-amber-500 hover:bg-amber-500/10 group"
              >
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <ChefHat className="w-4 h-4" />
                    <span>Via da Cozinha / KDS (Produção)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Itens em tamanho grande e observações em destaque, sem valores.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePrintDeliveryTicket(printingOrder, thermalPaperWidth, 'entrega');
                  setPrintingOrder(null);
                }}
                className="w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/10 group"
              >
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Navigation className="w-4 h-4" />
                    <span>Via do Entregador (Motoboy)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Endereço completo em destaque, referência e total a receber.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
