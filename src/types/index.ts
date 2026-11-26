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

export type DeliveryType = 'delivery' | 'pickup' | 'balcao' | 'mesa';
export type PaymentMethod = 'pix' | 'cartao_entrega' | 'cartao_debito' | 'cartao_credito' | 'dinheiro';
export type OrderStatus = 'novo' | 'preparando' | 'pronto' | 'entregue' | 'em_entrega' | 'finalizado' | 'cancelado';
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
  tableNumber?: string; // Número ou identificador da Mesa (ex: "01", "Mesa 04")
  isTableOrder?: boolean; // Se o pedido é de atendimento no salão / mesa
  tableStatus?: 'aberta' | 'fechada'; // Status da comanda da mesa
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
  cashierUserId?: string; // ID do usuário/operador que efetuou a venda no caixa
  cashierUserName?: string; // Nome do usuário/operador no caixa
  createdAt: string;
}

export interface DiningTable {
  id: string;
  number: number;
  name: string;
  status: 'available' | 'occupied' | 'closing';
  openedAt?: string;
  customerName?: string;
  orders: Order[];
  totalAmount: number;
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
  operatorId?: string; // ID do usuário que realizou a operação
  operatorName?: string; // Nome do usuário/operador
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
  patternStyle?: 'line_art' | 'none'; // 'line_art' = Fundo vetorial temático sutil do comércio; 'none' = Fundo liso minimalista
  bannerStyle?: 'silver_flash' | 'brand_aurora_flash' | 'platinum_minimal'; // Estilo do banner com borda cinza claro e flash
  bannerLayout?: 'ifood_cover' | 'card_99food' | 'carousel_promos'; // 3 Opções de layout estilo iFood / 99Food
  promoBanners?: string[]; // Até 3 banners promocionais para o carrossel estilo iFood / 99Food
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
  enableTableService?: boolean; // Atendimento em Mesas & Comandas (Dine-in): pedidos no cardápio vão direto para a cozinha acumulando na mesa
  storefrontServiceMode?: 'delivery_only' | 'tables_only' | 'hybrid'; // Modalidade de operação: somente delivery, somente mesas no salão, ou híbrido
  tableSelectionMode?: 'qrcode_fixed' | 'client_select' | 'both'; // Identificação das mesas: QR Code fixo por mesa, escolha manual no cardápio, ou ambos
  tableCount?: number; // Quantidade de mesas do salão (padrão: 12)
  serviceFeePercentage?: number; // Taxa de serviço opcional para fechamento de mesa (ex: 10%)
  catalogLayout?: 'grid' | 'list'; // 'grid': Grade com fotos grandes; 'list': Lista compacta com miniatura
  posLayout?: 'grid' | 'list'; // 'grid': Grade em 4 colunas; 'list': Lista compacta com miniatura para agilidade no balcão
  pixKey?: string;
  acceptPix: boolean;
  acceptCard: boolean;
  acceptCash: boolean;
  allowOrdersWhenClosed: boolean;
  soundAlerts: boolean;
}

export type TenantPlan = 'balcao' | 'balcao_estoque' | 'vitrine' | 'hibrido' | 'starter' | 'pro' | 'enterprise';

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
  | 'cosmeticos_farmacia'
  | 'pesqueiro'
  | 'pastelaria'
  | 'loja_roupas'
  | 'sorveteria'
  | 'padaria'
  | 'casa_bolos'
  | 'salgaderia'
  | 'acougue'
  | 'hortifruti'
  | 'agua_gas'
  | 'cafeteria'
  | 'farmacia';

export interface TenantCategory {
  id: string;
  label: string;
  enabled: boolean; // Se está ativa para uso no cardápio/catálogo
  isCustom?: boolean; // Se foi adicionada manualmente pelo lojista
}

export interface Expense {
  id: string;
  tenantId: string;
  description: string;
  category: 'fornecedor' | 'aluguel' | 'funcionarios' | 'energia_agua' | 'embalagens' | 'manutencao' | 'outros';
  amount: number;
  paymentMethod?: 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'transferencia';
  date: string;
  notes?: string;
  createdAt: string;
}

export type StoreUserRole = 'gerente' | 'caixa' | 'atendente' | 'estoquista' | 'personalizado';

export type StoreModulePermission =
  | 'produtos'        // Catálogo de Produtos
  | 'vendas'          // Venda de Balcão (PDV)
  | 'mesas'           // Atendimento em Mesas & Salão
  | 'cozinha'         // Visão da Cozinha (KDS) & Bar
  | 'estoque'         // Controle de Estoque
  | 'pedidos'         // Gestão de Pedidos
  | 'metricas'        // Gestão Financeira & Resultados
  | 'configuracoes'   // Configurações da Loja
  | 'visual'          // Visual, Cores & Vitrine
  | 'whatsapp'        // Central WhatsApp
  | 'entrega';        // Raio & Taxas de Entrega

export interface StoreUser {
  id: string;
  tenantId: string;
  name: string;
  username: string; // Ex: "caixa1", "maria"
  pin: string; // PIN ou senha de 4 a 6 dígitos
  role: StoreUserRole;
  roleLabel: string; // Ex: "Operador de Caixa", "Gerente Geral"
  active: boolean;
  permissions: StoreModulePermission[];
  createdAt: string;
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
  expenses?: Expense[]; // Lançamentos de despesas e saídas financeiras do lojista
  users?: StoreUser[]; // Usuários e operadores da loja com controle de permissões
  isOpen: boolean;
  onboardingCompleted: boolean;
  plan: TenantPlan;
  status: 'active' | 'trial' | 'suspended';
  adminPassword?: string; // Senha do lojista para acessar o painel
  createdAt: string;
  totalRevenue: number;
  ordersCount: number;
  subscriptionExpiresAt?: string; // Data de vencimento da assinatura
  lastPaymentDate?: string; // Data do último pagamento recebido
  lastPaymentMethod?: string; // Método de pagamento (ex: 'PIX')
  monthlyPrice?: number; // Valor da mensalidade do plano
  billingType?: 'mensal' | 'prepago'; // 'mensal' = Renovação Automática Recorrente | 'prepago' = Pré-pago Manual (+30 dias)
}

export type ViewRole = 'super_admin' | 'tenant_admin' | 'storefront' | 'register_tenant' | 'login_tenant' | 'not_found';

export interface SaaSFeaturePermissions {
  enableStorefront: boolean;        // Cardápio & Vitrine Online Aberto
  enableDiningTables?: boolean;     // Mesas & Cardápio QR Code
  enablePDVBalcao: boolean;         // Vendas no Balcão (PDV Frente de Caixa)
  enableStockControl: boolean;      // Controle de Estoque & Reposição
  enableDeliveryRadius: boolean;    // Delivery & Taxa por Raio / WhatsApp
  enableFinancialMetrics: boolean;  // Relatórios & Métricas Financeiras
  enableBarcodeScanner: boolean;    // Leitor de Código de Barras USB / Bluetooth
  enableKitchenKDS?: boolean;       // KDS Cozinha / Painel de Pedidos
}

export interface SaaSSubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string; // ex: '/mês'
  description: string;
  badge?: string; // ex: 'Mais Popular', 'Econômico', 'Completo'
  features: string[];
  active: boolean;
  permissions?: Partial<SaaSFeaturePermissions>;
}

export type SaaSPromoBannerTheme = 'cyber_neon' | 'sunset_gold' | 'emerald_turbo';

export interface SaaSPromoBanner {
  enabled: boolean;
  title: string;
  message: string;
  ctaText: string;
  ctaUrl: string; // Link de contato ou WhatsApp do Master
  theme?: SaaSPromoBannerTheme;
  badgeText?: string;
  updatedAt?: number;
}

export interface GlobalSaaSConfig {
  defaultPermissions: SaaSFeaturePermissions;
  segmentPermissions?: Partial<Record<BusinessSegmentType, Partial<SaaSFeaturePermissions>>>;
  plans: SaaSSubscriptionPlan[];
  promoBanner: SaaSPromoBanner;
}
