import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, Product, Order, OrderItem, ViewRole, OrderStatus, StockMovement, PaymentMethod, GlobalSaaSConfig, SaaSFeaturePermissions, SaaSSubscriptionPlan, SaaSPromoBanner, BusinessSegmentType } from '../types';
import { INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';
import { ConfirmModal, ConfirmDialogOptions, AlertDialogOptions, DialogVariant } from '../components/common/ConfirmModal';
import { getSegmentById, getTenantCategories } from '../data/businessSegments';
import { getStarterProductsForSegment } from '../data/segmentProducts';
import { detectPortalMode } from '../utils/portalEnvironment';
import { parseCurrentRoute } from '../utils/routes';

interface StoreContextType {
  tenants: Tenant[];
  currentTenantId: string;
  currentTenant: Tenant | undefined;
  viewRole: ViewRole;
  setViewRole: (role: ViewRole) => void;
  setCurrentTenantId: (id: string) => void;
  allProducts: Product[];
  tenantProducts: Product[];
  allOrders: Order[];
  tenantOrders: Order[];
  cart: OrderItem[];
  addToCart: (
    product: Product, 
    quantity?: number, 
    chilled?: boolean, 
    notes?: string, 
    packUnits?: number, 
    packLabel?: string
  ) => void;
  removeFromCart: (productId: string, chilled: boolean) => void;
  updateCartQuantity: (productId: string, quantity: number, chilled: boolean) => void;
  clearCart: () => void;
  createTenant: (tenantData: Partial<Tenant>) => Tenant;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  addCategory: (label: string) => string;
  updateCategory: (id: string, newLabel: string) => void;
  toggleCategory: (id: string, enabled?: boolean) => void;
  deleteCategory: (id: string) => void;
  addCustomCategory: (label: string) => string;
  removeCustomCategory: (categoryId: string) => void;
  createProduct: (productData: Omit<Product, 'id' | 'tenantId'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createOrder: (orderData: Omit<Order, 'id' | 'tenantId' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  generateWhatsAppOrderUrl: (order: Order, tenant: Tenant) => string;
  generateWhatsAppStatusUpdateUrl: (order: Order, tenant: Tenant, newStatus: OrderStatus) => string;
  generateWhatsAppDirectChatUrl: (tenant: Tenant, customMsg?: string) => string;
  resetToDefaults: () => void;
  // Estoque e Frente de Caixa (PDV)
  stockMovements: StockMovement[];
  tenantStockMovements: StockMovement[];
  receiveStock: (
    productId: string, 
    quantity: number, 
    costPrice?: number, 
    supplierInvoice?: string, 
    notes?: string
  ) => void;
  registerPDVSale: (
    items: OrderItem[], 
    paymentMethod: PaymentMethod, 
    customerName?: string, 
    cashChangeFor?: number | null
  ) => Order;
  findProductByBarcode: (barcode: string) => Product | undefined;
  findProductOrPackByBarcode: (barcode: string) => { product: Product; pack?: import('../types').ProductPackOption } | undefined;
  importProductsFromExcel: (
    products: Array<Partial<Product> & { name: string; price: number }>
  ) => { imported: number; updated: number };
  // Modal de Avisos e Confirmações
  showConfirm: (options: ConfirmDialogOptions) => void;
  showAlert: (options: AlertDialogOptions | string) => void;
  // Tema Independente do Super Admin
  adminThemeMode: 'dark' | 'light';
  setAdminThemeMode: (mode: 'dark' | 'light') => void;
  toggleAdminThemeMode: () => void;
  // Tema Contextual (Super Admin / Lojista / Vitrine)
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;
  // Autenticação Master Admin
  isMasterAuthenticated: boolean;
  loginMaster: (email: string, pass: string) => boolean;
  logoutMaster: () => void;
  // Autenticação Lojista
  isTenantAuthenticated: boolean;
  loginTenant: (identifier: string, pass: string) => boolean;
  logoutTenant: () => void;
  // Configurações Globais do SaaS Nuvi (Permissões de Módulos, Preços de Planos e Promoções)
  globalConfig: GlobalSaaSConfig;
  updateGlobalConfig: (newConfig: Partial<GlobalSaaSConfig>) => void;
  updatePlanPrice: (planId: string, newPrice: number) => void;
  updateSegmentPermissions: (segment: BusinessSegmentType, perms: Partial<SaaSFeaturePermissions>) => void;
  updatePromoBanner: (banner: Partial<SaaSPromoBanner>) => void;
  isFeatureAllowed: (feature: keyof SaaSFeaturePermissions, tenant?: Tenant) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TENANTS: 'adegasaas_tenants_v2',
  PRODUCTS: 'adegasaas_products_v2',
  ORDERS: 'adegasaas_orders_v2',
  MOVEMENTS: 'adegasaas_stock_movements_v2',
  CURRENT_TENANT_ID: 'adegasaas_curr_tenant_v2',
  VIEW_ROLE: 'adegasaas_view_role_v2',
  THEME_MODE: 'adegasaas_theme_mode_v2',
  ADMIN_THEME_MODE: 'adegasaas_admin_theme_v2',
  MASTER_AUTH: 'adegasaas_master_auth_v2',
  TENANT_AUTH: 'adegasaas_tenant_auth_v2',
  GLOBAL_CONFIG: 'nuvi_saas_global_config_v1',
};

export const DEFAULT_GLOBAL_CONFIG: GlobalSaaSConfig = {
  defaultPermissions: {
    enableStorefront: true,
    enablePDVBalcao: true,
    enableStockControl: true,
    enableDeliveryRadius: true,
    enableFinancialMetrics: true,
    enableBarcodeScanner: true,
  },
  segmentPermissions: {
    adega: {
      enableStorefront: true,
      enablePDVBalcao: true,
      enableStockControl: true,
      enableDeliveryRadius: true,
      enableFinancialMetrics: true,
      enableBarcodeScanner: true,
    },
    pesqueiro: {
      enableStorefront: true,
      enablePDVBalcao: true,
      enableStockControl: true,
      enableDeliveryRadius: true,
      enableFinancialMetrics: true,
      enableBarcodeScanner: false,
    },
    pastelaria: {
      enableStorefront: true,
      enablePDVBalcao: true,
      enableStockControl: false,
      enableDeliveryRadius: true,
      enableFinancialMetrics: true,
      enableBarcodeScanner: false,
    },
  },
  plans: [
    {
      id: 'plan_cardapio',
      name: 'Cardápio Digital & Pedidos',
      tagline: 'Ideal para iniciar sem custos elevados',
      price: 49.90,
      period: '/mês',
      description: 'Vitrine digital com fotos, descrições e pedidos no WhatsApp sem taxas de comissão.',
      badge: 'Iniciante',
      features: [
        'Vitrine Web Exclusiva com link próprio',
        'Cardápio Digital com QR Code para mesas e balcão',
        'Pedidos formatados direto no WhatsApp',
        'Banners promocionais e fotos ilimitadas',
        'Suporte técnico via WhatsApp'
      ],
      active: true,
    },
    {
      id: 'plan_balcao_pdv',
      name: 'Balcão & PDV Caixa Rápido',
      tagline: 'Para quem vende no balcão físico',
      price: 89.90,
      period: '/mês',
      description: 'Frente de Caixa (PDV) ultra-rápida no toque e leitor de código de barras.',
      badge: 'Mais Vendido',
      features: [
        'Tudo do Plano Cardápio Digital',
        'Frente de Caixa Balcão (PDV Ágil)',
        'Venda avulsa ou em fardos/caixas',
        'Bipe com leitor USB / Bluetooth',
        'Fechamento de caixa diário'
      ],
      active: true,
    },
    {
      id: 'plan_delivery_estoque',
      name: 'Delivery & Estoque Profissional',
      tagline: 'Autonomia total de entregas e estoque',
      price: 139.90,
      period: '/mês',
      description: 'Controle de estoque em tempo real com baixa automática e cálculo de frete por raio.',
      badge: 'Profissional',
      features: [
        'Tudo do Plano Balcão & PDV',
        'Controle de Estoque e Alertas de Reposição',
        'Cálculo de taxa de entrega dinâmica por raio (KM)',
        'Importação de planilhas Excel prontas',
        'Controle de pedidos em tempo real (Separando / A Caminho)'
      ],
      active: true,
    },
    {
      id: 'plan_nuvi_pro',
      name: 'Nuvi Pro Total (Completo)',
      tagline: 'A solução definitiva sem limites',
      price: 199.90,
      period: '/mês',
      description: 'Todos os módulos liberados com margem de lucro, múltiplos caixas e atendimento VIP.',
      badge: 'Completo VIP',
      features: [
        'Acesso Ilimitado a Todos os Recursos e Módulos',
        'Relatórios Financeiros e Margem de Lucro Bruta',
        'Múltiplos Caixas e Usuários Simultâneos',
        'Backup Diário em Nuvem Garantido',
        'Atendimento e Consultoria VIP Prioritária'
      ],
      active: true,
    }
  ],
  promoBanner: {
    enabled: true,
    title: '🔥 Promoção Exclusiva de Lançamento Nuvi SaaS',
    message: 'Assine o Plano Completo neste mês com 30% de desconto e garanta suporte prioritário de implantação!',
    ctaText: 'Falar com Consultor no WhatsApp',
    ctaUrl: 'https://wa.me/5511999999999?text=Ol%C3%A1!%20Tenho%20interesse%20na%20promo%C3%A7%C3%A3o%20do%20Nuvi%20SaaS.'
  }
};

// Garante que bebidas de adega (como cervejas e refrigerantes) possuam fardos padrão de 12 e 18 habilitados
// e que pratos caseiros (pizzas, hambúrgueres, porções) NUNCA possuam código de barras
export const enrichProductsWithDefaultPacks = (products: Product[]): Product[] => {
  return products.map(prod => {
    // Se for item caseiro/artesanal de pizzaria, lanchonete ou comida japonesa, remove código de barras e marca como cardápio
    const isArtisanalFood = (
      prod.category?.includes('pizza') ||
      prod.category?.includes('esfiha') ||
      prod.category?.includes('hamburguer') ||
      prod.category?.includes('lanche') ||
      prod.category?.includes('porco') ||
      prod.category?.includes('porcao') ||
      prod.category?.includes('combos_lanches') ||
      prod.category?.includes('sushi') ||
      prod.category?.includes('sashimi') ||
      prod.category?.includes('temaki') ||
      prod.category?.includes('poke') ||
      prod.category?.includes('hot_roll') ||
      prod.category?.includes('combinados') ||
      prod.category?.includes('pratos_quentes') ||
      prod.category?.includes('pastel') ||
      prod.category?.includes('salgado') ||
      prod.id?.includes('-pz-') ||
      prod.id?.includes('-jp-') ||
      prod.id?.includes('-pas-') ||
      (prod.id?.includes('-pq-') && prod.category !== 'bebidas_geladas' && prod.category !== 'iscas_massas') ||
      (prod.id?.includes('-lc-') && prod.category !== 'bebidas_lanche')
    );

    if (isArtisanalFood) {
      return {
        ...prod,
        barcode: '',
        itemType: 'cardapio',
        packOptions: [],
      };
    }

    if (prod.packOptions && prod.packOptions.some(p => p.enabled)) {
      return prod;
    }

    if (prod.category === 'cervejas' || prod.category === 'sem_alcool') {
      const basePrice = prod.promoPrice ?? prod.price;
      const cleanBarcode = prod.barcode || `789${prod.id.replace(/\D/g, '') || '1000'}`;
      return {
        ...prod,
        packOptions: [
          {
            id: 'pack_12',
            type: 'fardo',
            unitsCount: 12,
            label: 'Fardo c/ 12 unidades',
            price: Number((basePrice * 12 * 0.94).toFixed(2)),
            barcode: `${cleanBarcode}-12`,
            enabled: true,
          },
          {
            id: 'pack_18',
            type: 'fardo',
            unitsCount: 18,
            label: 'Fardo c/ 18 unidades',
            price: Number((basePrice * 18 * 0.92).toFixed(2)),
            barcode: `${cleanBarcode}-18`,
            enabled: true,
          },
          {
            id: 'pack_24',
            type: 'caixa',
            unitsCount: 24,
            label: 'Caixa c/ 24 unidades',
            price: Number((basePrice * 24 * 0.90).toFixed(2)),
            barcode: `${cleanBarcode}-24`,
            enabled: true,
          },
          {
            id: 'pack_6',
            type: 'fardo',
            unitsCount: 6,
            label: 'Pack c/ 6 unidades',
            price: Number((basePrice * 6 * 0.96).toFixed(2)),
            barcode: `${cleanBarcode}-6`,
            enabled: true,
          },
        ]
      };
    }

    return prod;
  });
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load Tenants
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  // Load Products (com enriquecimento automático de fardos para cervejas e bebidas)
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const initial = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      return enrichProductsWithDefaultPacks(initial);
    } catch {
      return enrichProductsWithDefaultPacks(INITIAL_PRODUCTS);
    }
  });

  // Load Orders
  const [allOrders, setAllOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Load Stock Movements
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Tenant (detectado de forma inteligente por Rota Limpa ou Parâmetro em todos os tenants criados)
  const [currentTenantId, setCurrentTenantIdState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const allLoadedTenants = (() => {
          try {
            const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed as Tenant[];
            }
          } catch {}
          return INITIAL_TENANTS;
        })();

        const route = parseCurrentRoute(allLoadedTenants);
        if (route.tenantSlugOrId) {
          const match = allLoadedTenants.find(t => 
            t.id.toLowerCase() === route.tenantSlugOrId?.toLowerCase() || 
            (t.slug && t.slug.toLowerCase() === route.tenantSlugOrId?.toLowerCase()) ||
            t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === route.tenantSlugOrId?.toLowerCase().replace(/[^a-z0-9]/g, '') ||
            (t.slug && t.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === route.tenantSlugOrId?.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );
          if (match) return match.id;
          return route.tenantSlugOrId;
        }
      }
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT_ID);
      return saved || 'adega-imperial';
    } catch {
      return 'adega-imperial';
    }
  });

  // Current view role: 'super_admin' | 'tenant_admin' | 'storefront' | 'login_tenant' | 'register_tenant'
  const [viewRole, setViewRoleState] = useState<ViewRole>(() => {
    try {
      if (typeof window !== 'undefined') {
        const allLoadedTenants = (() => {
          try {
            const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed as Tenant[];
            }
          } catch {}
          return INITIAL_TENANTS;
        })();

        const route = parseCurrentRoute(allLoadedTenants);
        return route.role;
      }
      const portal = detectPortalMode();
      if (portal === 'master') return 'super_admin';
      return 'register_tenant';
    } catch {
      return 'register_tenant';
    }
  });

  // Customer Shopping Cart (per current session)
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Tema Independente e Isolado do Super Admin (persistido separadamente)
  const [adminThemeMode, setAdminThemeModeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_THEME_MODE);
      return (saved === 'light' || saved === 'dark') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  const setAdminThemeMode = (mode: 'dark' | 'light') => {
    setAdminThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_THEME_MODE, mode);
    } catch {}
  };

  const toggleAdminThemeMode = () => {
    setAdminThemeMode(adminThemeMode === 'dark' ? 'light' : 'dark');
  };

  // Autenticação Master Admin
  const [isMasterAuthenticated, setIsMasterAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.MASTER_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const loginMaster = (email: string, pass: string): boolean => {
    // Credencial padrão master admin
    if (email.toLowerCase() === 'admin@adegasaas.com' && pass === 'admin123') {
      setIsMasterAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEYS.MASTER_AUTH, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logoutMaster = () => {
    setIsMasterAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.MASTER_AUTH);
    } catch {}
  };

  // Autenticação Lojista
  const [isTenantAuthenticated, setIsTenantAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TENANT_AUTH) === 'true';
    } catch {
      return true; // Mantém ativo por padrão para facilitar navegação
    }
  });

  const loginTenant = (identifier: string, pass: string): boolean => {
    const rawInput = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    // Localiza a loja por telefone/WhatsApp, e-mail, slug ou nome
    const found = tenants.find((t) => {
      const tenantPhone = (t.whatsapp?.phoneNumber || '').replace(/\D/g, '');
      const ownerPhone = (t.ownerPhone || '').replace(/\D/g, '');
      const email = (t.ownerEmail || '').toLowerCase();
      const slug = (t.slug || '').toLowerCase();
      const name = (t.name || '').toLowerCase();

      const phoneMatch = cleanDigits.length >= 8 && (
        tenantPhone.endsWith(cleanDigits.slice(-8)) || 
        ownerPhone.endsWith(cleanDigits.slice(-8)) ||
        cleanDigits.endsWith(tenantPhone.slice(-8))
      );

      const textMatch = rawInput.length >= 3 && (
        email === rawInput || 
        slug === rawInput || 
        name === rawInput || 
        t.id === rawInput
      );

      return phoneMatch || textMatch;
    });

    if (found) {
      // Valida a senha cadastrada pelo lojista (ou padrão '123456' se não definida)
      const expectedPassword = (found.adminPassword && found.adminPassword.trim()) ? found.adminPassword.trim() : '123456';
      if (pass.trim() && pass.trim() !== expectedPassword) {
        return false;
      }
      setCurrentTenantId(found.id);
      setIsTenantAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEYS.TENANT_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT_ID, found.id);
      } catch {}
      return true;
    }

    return false;
  };

  const logoutTenant = () => {
    setIsTenantAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.TENANT_AUTH);
    } catch {}
  };

  // Configurações Globais do SaaS Nuvi (Permissões, 4 Planos de Venda e Promoções)
  const [globalConfig, setGlobalConfigState] = useState<GlobalSaaSConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GLOBAL_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GLOBAL_CONFIG,
          ...parsed,
          defaultPermissions: {
            ...DEFAULT_GLOBAL_CONFIG.defaultPermissions,
            ...(parsed.defaultPermissions || {})
          },
          plans: parsed.plans && parsed.plans.length === 4 ? parsed.plans : DEFAULT_GLOBAL_CONFIG.plans,
          promoBanner: {
            ...DEFAULT_GLOBAL_CONFIG.promoBanner,
            ...(parsed.promoBanner || {})
          }
        };
      }
      return DEFAULT_GLOBAL_CONFIG;
    } catch {
      return DEFAULT_GLOBAL_CONFIG;
    }
  });

  const updateGlobalConfig = (newConfig: Partial<GlobalSaaSConfig>) => {
    setGlobalConfigState((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updatePlanPrice = (planId: string, newPrice: number) => {
    setGlobalConfigState((prev) => {
      const updatedPlans = prev.plans.map((p) => (p.id === planId ? { ...p, price: newPrice } : p));
      const updated = { ...prev, plans: updatedPlans };
      try {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateSegmentPermissions = (segment: BusinessSegmentType, perms: Partial<SaaSFeaturePermissions>) => {
    setGlobalConfigState((prev) => {
      const currentSegmentPerms = prev.segmentPermissions?.[segment] || {};
      const updatedSegmentPermissions = {
        ...(prev.segmentPermissions || {}),
        [segment]: {
          ...currentSegmentPerms,
          ...perms
        }
      };
      const updated = { ...prev, segmentPermissions: updatedSegmentPermissions };
      try {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updatePromoBanner = (banner: Partial<SaaSPromoBanner>) => {
    setGlobalConfigState((prev) => {
      const updatedPromo = { ...prev.promoBanner, ...banner };
      const updated = { ...prev, promoBanner: updatedPromo };
      try {
        localStorage.setItem(STORAGE_KEYS.GLOBAL_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Verifica se uma funcionalidade está liberada para um lojista/segmento
  const isFeatureAllowed = (feature: keyof SaaSFeaturePermissions, tenant?: Tenant): boolean => {
    const targetTenant = tenant || currentTenant;
    const segment = targetTenant?.businessSegment;

    // Se houver regra específica para o segmento da loja
    if (segment && globalConfig.segmentPermissions?.[segment]?.[feature] !== undefined) {
      return Boolean(globalConfig.segmentPermissions[segment]![feature]);
    }

    // Caso contrário, adota a permissão padrão configurada pelo Master
    return Boolean(globalConfig.defaultPermissions[feature]);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    } catch (e) {
      console.error(e);
    }
  }, [tenants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
    } catch (e) {
      console.error(e);
    }
  }, [allProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));
    } catch (e) {
      console.error(e);
    }
  }, [allOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
    } catch (e) {
      console.error(e);
    }
  }, [stockMovements]);

  const setCurrentTenantId = (id: string) => {
    setCurrentTenantIdState(id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT_ID, id);
    setCart([]);
  };

  const setViewRole = (role: ViewRole) => {
    setViewRoleState(role);
    localStorage.setItem(STORAGE_KEYS.VIEW_ROLE, role);

    try {
      if (typeof window !== 'undefined' && window.history) {
        const port = window.location.port;
        // Não altera rotas em portas separadas locais 3005 e 3006
        if (port === '3005' || port === '3006') return;

        const tenant = tenants.find((t) => t.id === currentTenantId || t.slug === currentTenantId);
        const slug = tenant?.slug || tenant?.id || 'loja';

        if (role === 'super_admin') {
          window.history.pushState({}, '', '/acesso_master');
        } else if (role === 'login_tenant') {
          window.history.pushState({}, '', '/acesso_lojista');
        } else if (role === 'register_tenant') {
          window.history.pushState({}, '', '/');
        } else if (role === 'storefront') {
          window.history.pushState({}, '', `/${slug}/cardapio`);
        } else if (role === 'tenant_admin') {
          window.history.pushState({}, '', `/${slug}/painel`);
        }
      }
    } catch {}
  };

  // Safe current tenant lookup (localiza por id ou por slug amigável da URL)
  const currentTenant = tenants.find((t) => t.id === currentTenantId || t.slug === currentTenantId) || tenants[0];

  // Estado reativo persistido para o tema da vitrine e do painel do lojista
  const [tenantThemeMode, setTenantThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('adegasaas_tenant_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
      return currentTenant?.branding?.colorMode || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Tema contextual: Super Admin usa adminThemeMode, Lojista e Vitrine usam tenantThemeMode
  const themeMode: 'dark' | 'light' =
    viewRole === 'super_admin'
      ? adminThemeMode
      : tenantThemeMode;

  const setThemeMode = (mode: 'dark' | 'light') => {
    if (viewRole === 'super_admin') {
      setAdminThemeMode(mode);
    } else {
      setTenantThemeMode(mode);
      try {
        localStorage.setItem('adegasaas_tenant_theme_mode', mode);
      } catch {}
      if (currentTenant) {
        updateTenant(currentTenant.id, {
          branding: {
            ...currentTenant.branding,
            colorMode: mode,
          },
        });
      }
    }
  };

  const toggleThemeMode = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  // Isolated products, orders and movements for currentTenant
  const tenantProducts = allProducts.filter((p) => p.tenantId === currentTenant?.id);
  const tenantOrders = allOrders.filter((o) => o.tenantId === currentTenant?.id);
  const tenantStockMovements = stockMovements.filter((m) => m.tenantId === currentTenant?.id);

  // Cart operations
  const addToCart = (
    product: Product, 
    quantity = 1, 
    chilled = false, 
    notes = '',
    packUnits?: number,
    packLabel?: string
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.chilled === chilled && item.packUnits === packUnits
      );
      const effectivePrice = product.promoPrice ?? product.price;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            productName: packLabel ? `${product.name} (${packLabel})` : product.name,
            barcode: product.barcode,
            price: effectivePrice,
            quantity,
            chilled,
            notes,
            volume: packUnits ? `${packUnits}x ${product.volume}` : product.volume,
            packUnits,
            packLabel,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string, chilled: boolean) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.chilled === chilled)));
  };

  const updateCartQuantity = (productId: string, quantity: number, chilled: boolean) => {
    if (quantity <= 0) {
      removeFromCart(productId, chilled);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.chilled === chilled
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Find product by barcode in current store (supports unit barcode or pack barcode)
  const findProductByBarcode = (barcode: string): Product | undefined => {
    const cleanBarcode = barcode.trim().toLowerCase();
    if (!cleanBarcode) return undefined;
    return tenantProducts.find((p) => 
      p.barcode?.toLowerCase() === cleanBarcode ||
      p.packOptions?.some((pack) => pack.enabled && pack.barcode?.toLowerCase() === cleanBarcode)
    );
  };

  const findProductOrPackByBarcode = (barcode: string): { product: Product; pack?: import('../types').ProductPackOption } | undefined => {
    const cleanBarcode = barcode.trim().toLowerCase();
    if (!cleanBarcode) return undefined;

    for (const prod of tenantProducts) {
      if (prod.barcode?.toLowerCase() === cleanBarcode) {
        return { product: prod };
      }
      const matchedPack = prod.packOptions?.find(
        (pack) => pack.enabled && pack.barcode?.toLowerCase() === cleanBarcode
      );
      if (matchedPack) {
        return { product: prod, pack: matchedPack };
      }
    }
    return undefined;
  };

  // Tenant CRUD
  const createTenant = (tenantData: Partial<Tenant>): Tenant => {
    const generatedSlug = (tenantData.name || 'novo-comercio')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const finalSlug = (tenantData.slug && tenantData.slug.trim()) ? tenantData.slug.trim() : generatedSlug;
    const id = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    const segment = tenantData.businessSegment || 'adega';
    const segmentConfig = getSegmentById(segment);

    const newTenant: Tenant = {
      id,
      slug: finalSlug,
      name: tenantData.name || `Novo ${segmentConfig.shortLabel}`,
      slogan: tenantData.slogan || segmentConfig.sloganExample,
      businessSegment: segment,
      ownerName: tenantData.ownerName || 'Proprietário',
      ownerEmail: tenantData.ownerEmail || 'contato@loja.com.br',
      ownerPhone: tenantData.ownerPhone || '11999990000',
      document: tenantData.document || '00.000.000/0001-00',
      adminPassword: (tenantData.adminPassword && tenantData.adminPassword.trim()) ? tenantData.adminPassword.trim() : '123456',
      branding: {
        logoUrl: tenantData.branding?.logoUrl || '',
        bannerUrl: tenantData.branding?.bannerUrl || segmentConfig.bannerUrl,
        primaryColor: tenantData.branding?.primaryColor || segmentConfig.primaryColor,
        accentColor: tenantData.branding?.accentColor || segmentConfig.accentColor,
        themeStyle: tenantData.branding?.themeStyle || segmentConfig.themeStyle,
        badgeNotice: tenantData.branding?.badgeNotice || segmentConfig.badgeNotice,
        fontStyle: 'Outfit',
      },
      address: {
        street: tenantData.address?.street || 'Av. Principal',
        number: tenantData.address?.number || '100',
        neighborhood: tenantData.address?.neighborhood || 'Centro',
        city: tenantData.address?.city || 'São Paulo',
        state: tenantData.address?.state || 'SP',
        zip: tenantData.address?.zip || '01001-000',
        deliveryRadiusKm: tenantData.address?.deliveryRadiusKm || 10,
        minimumOrder: tenantData.address?.minimumOrder || 30,
        standardDeliveryFee: tenantData.address?.standardDeliveryFee || 8,
        freeDeliveryThreshold: tenantData.address?.freeDeliveryThreshold || 150,
        allowPickup: true,
        openingHours: tenantData.address?.openingHours || 'Seg a Sáb: 10h às 23h',
      },
      whatsapp: {
        phoneNumber: tenantData.whatsapp?.phoneNumber || '5511999990000',
        enableWhatsAppOrders: tenantData.whatsapp?.enableWhatsAppOrders ?? true,
        orderTemplate: `${segmentConfig.emoji} *PEDIDO - {loja}* ${segmentConfig.emoji}\n\n*Pedido:* #{id_pedido}\n*Cliente:* {cliente}\n*Telefone:* {telefone}\n*Tipo:* {tipo_entrega}\n\n*Itens:*\n{itens}\n\n*Subtotal:* R$ {subtotal}\n*Taxa Entrega:* R$ {taxa_entrega}\n*TOTAL:* R$ {total}\n*Pagamento:* {pagamento}{troco_info}\n\n*Endereço:* {endereco}`,
        statusUpdateTemplate: `Olá {cliente}! Seu pedido #{id_pedido} na *{loja}* está: *{novo_status}*.`,
        welcomeMessage: `Olá! Bem-vindo à ${tenantData.name || 'nossa loja'}. Como posso te ajudar hoje?`,
        supportLinkEnabled: true,
      },
      config: {
        enablePhysicalStore: tenantData.config?.enablePhysicalStore ?? true,
        enableOnlineSales: tenantData.config?.enableOnlineSales ?? true,
        enableBarcodeScanner: tenantData.config?.enableBarcodeScanner ?? (segment === 'adega' || segment === 'mercadinho_emporio'),
        pixKey: tenantData.config?.pixKey || '',
        acceptPix: tenantData.config?.acceptPix ?? true,
        acceptCard: tenantData.config?.acceptCard ?? true,
        acceptCash: tenantData.config?.acceptCash ?? true,
        allowOrdersWhenClosed: tenantData.config?.allowOrdersWhenClosed ?? false,
        soundAlerts: tenantData.config?.soundAlerts ?? true,
      },
      categories: segmentConfig.suggestedCategories.map((c) => ({
        id: c.id,
        label: c.label,
        enabled: true,
        isCustom: false,
      })),
      isOpen: true,
      onboardingCompleted: false,
      plan: tenantData.plan || 'pro',
      status: 'active',
      createdAt: new Date().toISOString(),
      totalRevenue: 0,
      ordersCount: 0,
    };

    setTenants((prev) => {
      const updatedList = [newTenant, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    // Populate com catálogo inicial temático correspondente ao segmento do comércio criado
    const starterProducts = getStarterProductsForSegment(segment, id);
    setAllProducts((prev) => [...prev, ...starterProducts]);

    return newTenant;
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setAllProducts((prev) => prev.filter((p) => p.tenantId !== id));
    setAllOrders((prev) => prev.filter((o) => o.tenantId !== id));
    setStockMovements((prev) => prev.filter((m) => m.tenantId !== id));
    if (currentTenantId === id) {
      const remaining = tenants.filter((t) => t.id !== id);
      if (remaining.length > 0) {
        setCurrentTenantId(remaining[0].id);
      }
    }
  };

  // Adiciona nova categoria à loja do lojista ativo (Pizzaria, Lanchonete, Adega, etc.)
  const addCategory = (label: string): string => {
    if (!label.trim() || !currentTenantId) return '';
    const cleanLabel = label.trim();
    const id = cleanLabel
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const catId = id || `cat_${Date.now()}`;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === currentTenantId) {
          const currentList = getTenantCategories(t);
          if (currentList.some((c) => c.id === catId)) {
            // Se já existe, reativa a categoria
            return {
              ...t,
              categories: currentList.map((c) => c.id === catId ? { ...c, enabled: true, label: cleanLabel } : c)
            };
          }
          const updatedCategories = [
            ...currentList,
            { id: catId, label: cleanLabel, enabled: true, isCustom: true }
          ];
          return {
            ...t,
            categories: updatedCategories,
            customCategories: [...(t.customCategories || []), { id: catId, label: cleanLabel }],
          };
        }
        return t;
      })
    );

    return catId;
  };

  // Atualiza o nome / rótulo de uma categoria (sugerida ou personalizada)
  const updateCategory = (id: string, newLabel: string) => {
    if (!id || !newLabel.trim() || !currentTenantId) return;
    const cleanLabel = newLabel.trim();

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === currentTenantId) {
          const currentList = getTenantCategories(t);
          const updatedCategories = currentList.map((c) =>
            c.id === id ? { ...c, label: cleanLabel } : c
          );
          return {
            ...t,
            categories: updatedCategories,
            customCategories: (t.customCategories || []).map((c) =>
              c.id === id ? { ...c, label: cleanLabel } : c
            ),
          };
        }
        return t;
      })
    );
  };

  // Alterna o status da categoria entre "Usar" (true) e "Não Utilizar" (false)
  const toggleCategory = (id: string, enabled?: boolean) => {
    if (!id || !currentTenantId) return;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === currentTenantId) {
          const currentList = getTenantCategories(t);
          const updatedCategories = currentList.map((c) => {
            if (c.id === id) {
              const newStatus = enabled !== undefined ? enabled : !c.enabled;
              return { ...c, enabled: newStatus };
            }
            return c;
          });
          return {
            ...t,
            categories: updatedCategories,
          };
        }
        return t;
      })
    );
  };

  // Exclui uma categoria da lista do comércio
  const deleteCategory = (categoryId: string) => {
    if (!categoryId || !currentTenantId) return;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === currentTenantId) {
          const currentList = getTenantCategories(t);
          const updatedCategories = currentList.filter((c) => c.id !== categoryId);
          return {
            ...t,
            categories: updatedCategories,
            customCategories: (t.customCategories || []).filter((c) => c.id !== categoryId),
          };
        }
        return t;
      })
    );
  };

  // Retrocompatibilidade
  const addCustomCategory = (label: string): string => addCategory(label);
  const removeCustomCategory = (categoryId: string) => deleteCategory(categoryId);

  // Product CRUD
  const createProduct = (productData: Omit<Product, 'id' | 'tenantId'>): Product => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      tenantId: currentTenantId,
      barcode: productData.barcode || `${Math.floor(7890000000000 + Math.random() * 999999999)}`,
      showInStorefront: productData.showInStorefront ?? true,
      minStockAlert: productData.minStockAlert ?? 10,
    };

    setAllProducts((prev) => [newProduct, ...prev]);

    // Record initial stock movement if quantity > 0
    if (newProduct.stockQuantity > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        tenantId: currentTenantId,
        productId: newProduct.id,
        productName: newProduct.name,
        barcode: newProduct.barcode,
        type: 'entrada_recebimento',
        quantity: newProduct.stockQuantity,
        previousStock: 0,
        newStock: newProduct.stockQuantity,
        costPrice: newProduct.costPrice,
        notes: 'Cadastro inicial de produto no estoque',
        createdAt: new Date().toISOString(),
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.productId !== id));
  };

  // Receive stock / Entrada de mercadorias
  const receiveStock = (
    productId: string, 
    quantity: number, 
    costPrice?: number, 
    supplierInvoice?: string, 
    notes?: string
  ) => {
    setAllProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const previousStock = p.stockQuantity || 0;
          const newStock = previousStock + quantity;
          const updatedCostPrice = costPrice !== undefined ? costPrice : p.costPrice;

          // Record movement
          const movement: StockMovement = {
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            tenantId: p.tenantId,
            productId: p.id,
            productName: p.name,
            barcode: p.barcode,
            type: 'entrada_recebimento',
            quantity: quantity,
            previousStock: previousStock,
            newStock: newStock,
            costPrice: updatedCostPrice,
            supplierInvoice: supplierInvoice,
            notes: notes || 'Recebimento de mercadoria',
            createdAt: new Date().toISOString(),
          };
          setStockMovements((prevMov) => [movement, ...prevMov]);

          return {
            ...p,
            stockQuantity: newStock,
            inStock: newStock > 0,
            costPrice: updatedCostPrice,
          };
        }
        return p;
      })
    );
  };

  // PDV Physical Sale (Balcão de Adega)
  const registerPDVSale = (
    items: OrderItem[], 
    paymentMethod: PaymentMethod, 
    customerName = 'Cliente Balcão', 
    cashChangeFor?: number | null
  ): Order => {
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const total = subtotal; // no delivery fee for in-store balcão

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `PDV-${randomNum}`;

    const newSaleOrder: Order = {
      id: orderId,
      tenantId: currentTenantId,
      channel: 'pdv',
      customerName,
      customerPhone: '',
      deliveryType: 'balcao',
      deliveryFee: 0,
      items,
      subtotal,
      total,
      paymentMethod,
      cashChangeFor,
      status: 'finalizado',
      notes: 'Venda de balcão via PDV',
      createdAt: new Date().toISOString(),
    };

    // 1. Decrement stock for each item & log movements
    setAllProducts((prevProducts) => {
      const updated = [...prevProducts];
      const newMovements: StockMovement[] = [];

      items.forEach((item) => {
        const prodIndex = updated.findIndex((p) => p.id === item.productId);
        if (prodIndex > -1) {
          const prod = updated[prodIndex];
          const previousStock = prod.stockQuantity || 0;
          const unitsToDeduct = (item.packUnits && item.packUnits > 1) ? item.packUnits * item.quantity : item.quantity;
          const newStock = Math.max(0, previousStock - unitsToDeduct);

          updated[prodIndex] = {
            ...prod,
            stockQuantity: newStock,
            inStock: newStock > 0,
          };

          newMovements.push({
            id: `mov-${Date.now()}-${item.productId}`,
            tenantId: currentTenantId,
            productId: prod.id,
            productName: prod.name,
            barcode: prod.barcode,
            type: 'venda_pdv',
            quantity: -unitsToDeduct,
            previousStock,
            newStock,
            costPrice: prod.costPrice,
            notes: item.packLabel 
              ? `Venda balcão #${orderId} (${item.quantity}x ${item.packLabel})`
              : `Venda balcão #${orderId}`,
            createdAt: new Date().toISOString(),
          });
        }
      });

      if (newMovements.length > 0) {
        setStockMovements((prev) => [...newMovements, ...prev]);
      }

      return updated;
    });

    // 2. Add to orders
    setAllOrders((prev) => [newSaleOrder, ...prev]);

    // 3. Update store metrics
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenantId
          ? {
              ...t,
              totalRevenue: (t.totalRevenue || 0) + total,
              ordersCount: (t.ordersCount || 0) + 1,
            }
          : t
      )
    );

    return newSaleOrder;
  };

  // Import products from Excel
  const importProductsFromExcel = (
    productsToImport: Array<Partial<Product> & { name: string; price: number }>
  ): { imported: number; updated: number } => {
    let imported = 0;
    let updated = 0;
    const now = new Date().toISOString();
    const newMovements: StockMovement[] = [];

    setAllProducts((prevProducts) => {
      let currentList = [...prevProducts];

      productsToImport.forEach((item) => {
        const cleanBarcode = item.barcode?.trim();
        const existingIndex = cleanBarcode 
          ? currentList.findIndex((p) => p.tenantId === currentTenantId && p.barcode === cleanBarcode)
          : currentList.findIndex((p) => p.tenantId === currentTenantId && p.name.toLowerCase() === item.name.toLowerCase());

        const qty = item.stockQuantity || 0;

        if (existingIndex > -1) {
          // Update existing
          const existing = currentList[existingIndex];
          const prevQty = existing.stockQuantity || 0;
          const newQty = prevQty + qty;

          currentList[existingIndex] = {
            ...existing,
            price: item.price ?? existing.price,
            costPrice: item.costPrice ?? existing.costPrice,
            stockQuantity: newQty,
            inStock: newQty > 0,
            volume: item.volume || existing.volume,
            category: item.category || existing.category,
            showInStorefront: true,
          };

          if (qty > 0) {
            newMovements.push({
              id: `mov-${Date.now()}-${existing.id}`,
              tenantId: currentTenantId,
              productId: existing.id,
              productName: existing.name,
              barcode: existing.barcode,
              type: 'importacao_excel',
              quantity: qty,
              previousStock: prevQty,
              newStock: newQty,
              costPrice: item.costPrice ?? existing.costPrice,
              notes: 'Atualização via Importação Excel',
              createdAt: now,
            });
          }
          updated++;
        } else {
          // Create new
          const newId = `prod-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const barcode = cleanBarcode || `${Math.floor(7890000000000 + Math.random() * 999999999)}`;
          const newProduct: Product = {
            id: newId,
            tenantId: currentTenantId,
            barcode,
            name: item.name,
            category: item.category || 'cervejas',
            description: item.description || `${item.name} - Disponível na adega`,
            price: Number(item.price),
            promoPrice: item.promoPrice ?? null,
            costPrice: item.costPrice ? Number(item.costPrice) : undefined,
            volume: item.volume || 'Unidade',
            imageUrl: item.imageUrl || '/src/assets/images/beer_ice_cold_1793972463737.jpg',
            isChilledAvailable: item.isChilledAvailable ?? true,
            inStock: qty > 0,
            stockQuantity: qty,
            minStockAlert: item.minStockAlert ?? 10,
            showInStorefront: true, // Automatically seen in storefront!
            featured: false,
          };

          currentList.push(newProduct);

          if (qty > 0) {
            newMovements.push({
              id: `mov-${Date.now()}-${newId}`,
              tenantId: currentTenantId,
              productId: newId,
              productName: newProduct.name,
              barcode: newProduct.barcode,
              type: 'importacao_excel',
              quantity: qty,
              previousStock: 0,
              newStock: qty,
              costPrice: newProduct.costPrice,
              notes: 'Carga inicial via Importação Excel',
              createdAt: now,
            });
          }
          imported++;
        }
      });

      return currentList;
    });

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    return { imported, updated };
  };

  // Order CRUD (Online checkout)
  const createOrder = (orderData: Omit<Order, 'id' | 'tenantId' | 'createdAt'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `ORD-${randomNum}`;
    const newOrder: Order = {
      ...orderData,
      id,
      tenantId: currentTenantId,
      channel: orderData.channel || 'online',
      createdAt: new Date().toISOString(),
    };

    // Decrement stock for ordered items
    setAllProducts((prevProducts) => {
      const updated = [...prevProducts];
      const newMovements: StockMovement[] = [];

      orderData.items.forEach((item) => {
        const prodIndex = updated.findIndex((p) => p.id === item.productId);
        if (prodIndex > -1) {
          const prod = updated[prodIndex];
          const previousStock = prod.stockQuantity || 0;
          const unitsToDeduct = (item.packUnits && item.packUnits > 1) ? item.packUnits * item.quantity : item.quantity;
          const newStock = Math.max(0, previousStock - unitsToDeduct);

          updated[prodIndex] = {
            ...prod,
            stockQuantity: newStock,
            inStock: newStock > 0,
          };

          newMovements.push({
            id: `mov-${Date.now()}-${item.productId}`,
            tenantId: currentTenantId,
            productId: prod.id,
            productName: prod.name,
            barcode: prod.barcode,
            type: 'venda_online',
            quantity: -unitsToDeduct,
            previousStock,
            newStock,
            costPrice: prod.costPrice,
            notes: item.packLabel 
              ? `Venda Online #${id} (${item.quantity}x ${item.packLabel})` 
              : `Venda Online #${id}`,
            createdAt: new Date().toISOString(),
          });
        }
      });

      if (newMovements.length > 0) {
        setStockMovements((prev) => [...newMovements, ...prev]);
      }

      return updated;
    });

    setAllOrders((prev) => [newOrder, ...prev]);

    // Update tenant total metrics
    setTenants((prev) =>
      prev.map((t) =>
        t.id === currentTenantId
          ? {
              ...t,
              totalRevenue: (t.totalRevenue || 0) + newOrder.total,
              ordersCount: (t.ordersCount || 0) + 1,
            }
          : t
      )
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // WhatsApp Message Generators
  const generateWhatsAppOrderUrl = (order: Order, tenant: Tenant): string => {
    const itemsFormatted = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.productName} (${i.volume})${
            i.chilled ? ' ❄️ [GELADA]' : ''
          } - R$ ${(i.price * i.quantity).toFixed(2)}${
            i.notes ? `\n   Obs: ${i.notes}` : ''
          }`
      )
      .join('\n');

    const paymentLabels: Record<string, string> = {
      pix: 'PIX (Chave enviada na confirmação)',
      cartao_entrega: 'Cartão na entrega (Maquininha)',
      cartao_debito: 'Cartão de Débito',
      cartao_credito: 'Cartão de Crédito',
      dinheiro: 'Dinheiro',
    };

    const trocoInfo =
      order.paymentMethod === 'dinheiro' && order.cashChangeFor
        ? ` (Troco para R$ ${order.cashChangeFor.toFixed(2)})`
        : '';

    const addressFormatted =
      order.deliveryType === 'delivery' && order.address
        ? `${order.address.street}, Nº ${order.address.number}${
            order.address.complement ? ` - ${order.address.complement}` : ''
          }\nBairro: ${order.address.neighborhood} - ${order.address.city}${
            order.address.referencePoint ? `\nRef: ${order.address.referencePoint}` : ''
          }`
        : 'Retirada no Balcão da Loja';

    let message = tenant.whatsapp.orderTemplate || '';
    if (!message) {
      message = `*PEDIDO #{id_pedido} - {loja}*\n\nCliente: {cliente}\nItens:\n{itens}\n\nTOTAL: R$ {total}`;
    }

    message = message
      .replace(/{id_pedido}/g, order.id)
      .replace(/{loja}/g, tenant.name)
      .replace(/{cliente}/g, order.customerName)
      .replace(/{telefone}/g, order.customerPhone)
      .replace(/{tipo_entrega}/g, order.deliveryType === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Balcão')
      .replace(/{itens}/g, itemsFormatted)
      .replace(/{subtotal}/g, order.subtotal.toFixed(2).replace('.', ','))
      .replace(/{taxa_entrega}/g, order.deliveryFee.toFixed(2).replace('.', ','))
      .replace(/{total}/g, order.total.toFixed(2).replace('.', ','))
      .replace(/{pagamento}/g, paymentLabels[order.paymentMethod] || order.paymentMethod)
      .replace(/{troco_info}/g, trocoInfo)
      .replace(/{endereco}/g, addressFormatted);

    const cleanPhone = tenant.whatsapp.phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const generateWhatsAppStatusUpdateUrl = (order: Order, tenant: Tenant, newStatus: OrderStatus): string => {
    const statusLabels: Record<OrderStatus, string> = {
      novo: 'Recebido e Aguardando Confirmação',
      preparando: 'Sendo separado e embalado',
      em_entrega: 'Saiu para entrega com nosso entregador',
      finalizado: 'Entregue com sucesso! Bom proveito',
      cancelado: 'Cancelado',
    };

    let template = tenant.whatsapp.statusUpdateTemplate || `Olá {cliente}! Seu pedido #{id_pedido} está: *{novo_status}*.`;
    const message = template
      .replace(/{cliente}/g, order.customerName)
      .replace(/{id_pedido}/g, order.id)
      .replace(/{loja}/g, tenant.name)
      .replace(/{novo_status}/g, statusLabels[newStatus]);

    const cleanCustomerPhone = order.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanCustomerPhone.startsWith('55')
      ? cleanCustomerPhone
      : `55${cleanCustomerPhone}`;

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  };

  const generateWhatsAppDirectChatUrl = (tenant: Tenant, customMsg?: string): string => {
    const cleanPhone = tenant.whatsapp.phoneNumber.replace(/\D/g, '');
    const msg = customMsg || tenant.whatsapp.welcomeMessage || `Olá, gostaria de tirar uma dúvida com a ${tenant.name}!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Modal dialog global state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    isConfirmMode: boolean;
    variant: DialogVariant;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    isConfirmMode: false,
    variant: 'info',
    onConfirm: () => {},
  });

  const showConfirm = (options: ConfirmDialogOptions) => {
    setDialogState({
      isOpen: true,
      title: options.title || 'Confirmação',
      message: options.message,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      isConfirmMode: true,
      variant: options.variant || 'warning',
      onConfirm: () => {
        if (options.onConfirm) options.onConfirm();
      },
    });
  };

  const showAlert = (options: AlertDialogOptions | string) => {
    if (typeof options === 'string') {
      setDialogState({
        isOpen: true,
        title: 'Aviso do Sistema',
        message: options,
        confirmText: 'Entendido',
        isConfirmMode: false,
        variant: 'info',
        onConfirm: () => {},
      });
    } else {
      setDialogState({
        isOpen: true,
        title: options.title || 'Aviso do Sistema',
        message: options.message,
        confirmText: options.confirmText || 'Entendido',
        isConfirmMode: false,
        variant: options.variant || 'info',
        onConfirm: () => {
          if (options.onConfirm) options.onConfirm();
        },
      });
    }
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.TENANTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    setTenants(INITIAL_TENANTS);
    setAllProducts(INITIAL_PRODUCTS);
    setAllOrders(INITIAL_ORDERS);
    setStockMovements([]);
    setCurrentTenantId('adega-imperial');
    setViewRole('super_admin');
    setCart([]);
  };

  return (
    <StoreContext.Provider
      value={{
        tenants,
        currentTenantId,
        currentTenant,
        viewRole,
        setViewRole,
        setCurrentTenantId,
        allProducts,
        tenantProducts,
        allOrders,
        tenantOrders,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createTenant,
        updateTenant,
        deleteTenant,
        addCategory,
        updateCategory,
        toggleCategory,
        deleteCategory,
        addCustomCategory,
        removeCustomCategory,
        createProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        generateWhatsAppOrderUrl,
        generateWhatsAppStatusUpdateUrl,
        generateWhatsAppDirectChatUrl,
        resetToDefaults,
        stockMovements,
        tenantStockMovements,
        receiveStock,
        registerPDVSale,
        findProductByBarcode,
        findProductOrPackByBarcode,
        importProductsFromExcel,
        showConfirm,
        showAlert,
        adminThemeMode,
        setAdminThemeMode,
        toggleAdminThemeMode,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        isMasterAuthenticated,
        loginMaster,
        logoutMaster,
        isTenantAuthenticated,
        loginTenant,
        logoutTenant,
        globalConfig,
        updateGlobalConfig,
        updatePlanPrice,
        updateSegmentPermissions,
        updatePromoBanner,
        isFeatureAllowed,
      }}
    >
      {children}
      <ConfirmModal
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        isConfirmMode={dialogState.isConfirmMode}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onClose={closeDialog}
      />
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
