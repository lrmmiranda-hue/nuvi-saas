export type CategoryType = 
  | 'cervejas'
  | 'vinhos'
  | 'destilados'
  | 'combos'
  | 'gelo_carvao'
  | 'sem_alcool'
  | 'petiscos'
  | (string & {});

export interface ProductPackOption {
  id: string; // ex: 'pack_6', 'pack_12', 'pack_18', 'pack_24', 'custom'
  type: 'fardo' | 'engradado' | 'caixa';
  unitsCount: number; // 6, 12, 18, 24 ou livre
  label: string; // Ex: "Fardo c/ 6", "Fardo c/ 12", "Caixa c/ 24"
  price: number; // Preço de venda do fardo completo
  barcode?: string; // Código de barras do fardo (se houver no plástico/caixa)
  enabled: boolean; // Se está disponível para venda
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  barcode: string; // Código de barras EAN-13 ou código interno (ex: 7891991000826)
  category: CategoryType;
  description: string;
  price: number;
  promoPrice?: number | null;
  costPrice?: number; // Preço de custo para controle de margem da adega
  volume: string; // Ex: "750ml", "Lata 350ml", "Garrafa 1L", "Saco 5kg", "Grande 8 Pedaços"
  imageUrl: string;
  isChilledAvailable: boolean; // se pode vir gelada
  inStock: boolean;
  stockQuantity: number;
  minStockAlert?: number; // Estoque mínimo para alerta de reposição
  showInStorefront?: boolean; // Se aparece na vitrine online (padrão true)
  featured?: boolean;
  alcoholContent?: string; // Ex: "13.5%", "4.8%", "0.0%"
  packOptions?: ProductPackOption[]; // Fardos, engradados ou caixas (6, 12, 18, 24)
  // Separação para Pizzaria, Restaurante, Lanchonete vs Adega
  itemType?: 'cardapio' | 'mercadoria'; // 'cardapio': Produção na cozinha/cardápio sem travas de fardo; 'mercadoria': Revenda com controle de estoque
  ingredients?: string; // Ingredientes / Composição do prato, lanche ou pizza
}

export type DeliveryType = 'delivery' | 'pickup' | 'balcao';
export type PaymentMethod = 'pix' | 'cartao_entrega' | 'cartao_debito' | 'cartao_credito' | 'dinheiro';
export type OrderStatus = 'novo' | 'preparando' | 'em_entrega' | 'finalizado' | 'cancelado';
export type OrderChannel = 'online' | 'pdv';

export interface OrderItem {
  productId: string;
  productName: string;
  barcode?: string;
  price: number;
  quantity: number;
  chilled: boolean;
  notes?: string;
  volume: string;
  packUnits?: number; // Se for fardo/caixa, quantas unidades individuais consome do estoque (ex: 6, 12, 18, 24)
  packLabel?: string; // Ex: "Fardo c/ 12 un"
}

export interface Order {
  id: string;
  tenantId: string;
  channel?: OrderChannel; // 'online' (vitrine / whatsapp) ou 'pdv' (balcão da adega física)
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
    referencePoint?: string;
  };
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashChangeFor?: number | null;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  barcode: string;
  type: 'entrada_recebimento' | 'venda_pdv' | 'venda_online' | 'ajuste_manual' | 'importacao_excel';
  quantity: number; // positivo para entrada, negativo para saída
  previousStock: number;
  newStock: number;
  costPrice?: number;
  supplierInvoice?: string;
  notes?: string;
  createdAt: string;
}

export interface TenantBranding {
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  accentColor: string;
  themeStyle: 'dark_adega' | 'gold_luxury' | 'modern_emerald' | 'amber_pub' | 'clean_light';
  badgeNotice: string;
  fontStyle?: string;
  colorMode?: 'dark' | 'light'; // Modo claro ou escuro preferido do lojista
  bannerLighting?: 'brand' | 'neutral' | 'dark_lights' | 'white_lights'; // Estilo de iluminação da vitrine
  catalogLayout?: 'grid' | 'list'; // 'grid' = Grade com cards e fotos grandes; 'list' = Lista compacta com miniatura estilo restaurante/delivery
}

export interface TenantAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  complement?: string;
  deliveryRadiusKm: number;
  minimumOrder: number;
  standardDeliveryFee: number;
  freeDeliveryThreshold?: number;
  allowPickup: boolean;
  openingHours: string;
}

export interface TenantWhatsAppSettings {
  phoneNumber: string; // formato internacional sem simbolos, ex: 5511999998888
  enableWhatsAppOrders: boolean; // se os pedidos são enviados via WhatsApp ou processados direto pelo sistema
  orderTemplate: string;
  statusUpdateTemplate: string;
  welcomeMessage: string;
  supportLinkEnabled: boolean;
}

export interface StoreManagementConfig {
  enablePhysicalStore?: boolean; // Trabalhar com loja física / vendas no balcão (PDV, leitor de código de barras)
  enableOnlineSales?: boolean; // Trabalhar com vendas online / cardápio digital / vitrine web
  enableBarcodeScanner?: boolean; // Trabalhar com leitor de código de barras (USB/Bluetooth)
  enableMenuOnlyMode?: boolean; // Modo Somente Cardápio / Consulta: desativa botão adicionar e carrinho, operando como cardápio puro de mesa
  catalogLayout?: 'grid' | 'list'; // 'grid': Grade com fotos grandes; 'list': Lista compacta com miniatura
  pixKey?: string;
  acceptPix: boolean;
  acceptCard: boolean;
  acceptCash: boolean;
  allowOrdersWhenClosed: boolean;
  soundAlerts: boolean;
}

export type TenantPlan = 'balcao' | 'vitrine' | 'hibrido' | 'starter' | 'pro' | 'enterprise';

export interface PlanConfig {
  id: 'balcao' | 'vitrine' | 'hibrido';
  name: string;
  price: number;
  priceFormatted: string;
  tagline: string;
  description: string;
  features: string[];
  enablePhysicalStore: boolean;
  enableOnlineSales: boolean;
}

export const SAAS_PLANS: Record<'balcao' | 'vitrine' | 'hibrido', PlanConfig> = {
  balcao: {
    id: 'balcao',
    name: 'Balcão Físico (PDV & Estoque)',
    price: 89.90,
    priceFormatted: 'R$ 89,90/mês',
    tagline: 'Foco em Vendas Presenciais',
    description: 'Para estabelecimentos comerciais com atendimento no balcão físico.',
    features: [
      'Frente de Caixa (PDV) Rápido',
      'Leitor de Código de Barras USB / Bluetooth',
      'Controle de Estoque & Alerta de Reposição',
      'Entrada de Mercadorias & Histórico',
      'Comprovante de Venda do Balcão'
    ],
    enablePhysicalStore: true,
    enableOnlineSales: false,
  },
  vitrine: {
    id: 'vitrine',
    name: 'Vitrine Online & WhatsApp',
    price: 119.90,
    priceFormatted: 'R$ 119,90/mês',
    tagline: 'Foco em Delivery e Pedidos Online',
    description: 'Para comércios focados em catálogo online e pedidos via WhatsApp.',
    features: [
      'Vitrine Web Exclusiva com sua Marca',
      'Cardápio Digital / Catálogo de Produtos',
      'Pedidos Formatados Direto no WhatsApp',
      'Banner Promocional e Regras de Frete por Raio',
      'Gestão de Pedidos (Separando, Saiu p/ Entrega)'
    ],
    enablePhysicalStore: false,
    enableOnlineSales: true,
  },
  hibrido: {
    id: 'hibrido',
    name: 'Híbrido Completo (Físico + Online)',
    price: 179.90,
    priceFormatted: 'R$ 179,90/mês',
    tagline: 'Balcão + Vitrine com Estoque Unificado',
    description: 'Tudo o que o seu comércio precisa: balcão presencial + delivery online.',
    features: [
      'Todos os recursos de Balcão e PDV',
      'Todos os recursos de Vitrine & WhatsApp',
      'Estoque Unificado (Baixa automática no PDV e na Web)',
      'Banner, Cores da Marca e Suporte Completo'
    ],
    enablePhysicalStore: true,
    enableOnlineSales: true,
  },
};

export type BusinessSegmentType = 
  | 'adega' 
  | 'restaurante_lanchonete' 
  | 'pizzaria' 
  | 'comida_japonesa'
  | 'mercadinho_emporio' 
  | 'petshop' 
  | 'tabacaria' 
  | 'cosmeticos_farmacia';

export interface TenantCategory {
  id: string;
  label: string;
  enabled: boolean; // Se está ativa para uso no cardápio/catálogo
  isCustom?: boolean; // Se foi adicionada manualmente pelo lojista
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  businessSegment?: BusinessSegmentType;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  document: string; // CNPJ ou CPF
  branding: TenantBranding;
  address: TenantAddress;
  whatsapp: TenantWhatsAppSettings;
  config?: StoreManagementConfig;
  categories?: TenantCategory[]; // Lista unificada de categorias gerenciadas da loja
  customCategories?: { id: string; label: string }[]; // Compatibilidade retroativa
  isOpen: boolean;
  onboardingCompleted: boolean;
  plan: TenantPlan;
  status: 'active' | 'trial' | 'suspended';
  adminPassword?: string; // Senha do lojista para acessar o painel
  createdAt: string;
  totalRevenue: number;
  ordersCount: number;
}

export type ViewRole = 'super_admin' | 'tenant_admin' | 'storefront' | 'register_tenant' | 'login_tenant';
