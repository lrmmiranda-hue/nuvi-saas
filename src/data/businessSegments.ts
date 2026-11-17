import { BusinessSegmentType, Tenant, TenantCategory } from '../types';

export interface BusinessSegmentConfig {
  id: BusinessSegmentType;
  title: string;
  shortLabel: string;
  emoji: string;
  description: string;
  pitch: string;
  namePlaceholder: string;
  sloganExample: string;
  badgeNotice: string;
  primaryColor: string;
  accentColor: string;
  themeStyle: 'amber_pub' | 'dark_adega' | 'gold_luxury' | 'modern_emerald' | 'clean_light';
  bannerUrl: string;
  packTerm: string;
  suggestedCategories: { id: string; label: string }[];
}

export const BUSINESS_SEGMENTS: BusinessSegmentConfig[] = [
  {
    id: 'adega',
    title: 'Adega & Distribuidora de Bebidas',
    shortLabel: 'Adega & Bebidas',
    emoji: '🍷',
    description: 'Bebidas geladas, cervejas, combos de destilados, vinhos, gelo e carvão.',
    pitch: 'Venda latas avulsas ou fardos no balcão e receba pedidos no WhatsApp com taxa de entrega por raio.',
    namePlaceholder: 'Ex: Adega do Silva, Distribuidora Central',
    sloganExample: 'Bebidas geladas, combos e entrega rápida no seu bairro',
    badgeNotice: 'Cerveja trincando e entrega em até 30 minutos',
    primaryColor: '#881337', // Vinho/Carmim
    accentColor: '#F59E0B', // Âmbar Dourado
    themeStyle: 'gold_luxury',
    bannerUrl: '/src/assets/images/adega_hero_banner_1793972462239.jpg',
    packTerm: 'Fardos & Caixas',
    suggestedCategories: [
      { id: 'cervejas', label: 'Cervejas' },
      { id: 'vinhos', label: 'Vinhos' },
      { id: 'destilados', label: 'Destilados & Whiskeys' },
      { id: 'combos', label: 'Combos & Kits' },
      { id: 'gelo_carvao', label: 'Gelo & Carvão' },
      { id: 'sem_alcool', label: 'Refrigerantes & Sucos' },
      { id: 'petiscos', label: 'Petiscos & Salgadinhos' },
    ]
  },
  {
    id: 'restaurante_lanchonete',
    title: 'Restaurante, Lanchonete & Hambúrguer',
    shortLabel: 'Lanchonete & Restaurante',
    emoji: '🍔',
    description: 'Hambúrgueres, lanches, porções, marmitas, sobremesas e bebidas.',
    pitch: 'Diga adeus às taxas abusivas de 27% do iFood. Receba pedidos direto no cardápio online com link no WhatsApp.',
    namePlaceholder: 'Ex: Burger Smash House, Lanchonete & Bar',
    sloganExample: 'O melhor lanche artesanal com entrega quentinha na sua casa',
    badgeNotice: 'Feito na hora e entrega expressa quentinha',
    primaryColor: '#B91C1C', // Vermelho Intenso
    accentColor: '#F59E0B', // Laranja Cheddar
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Combos & Porções',
    suggestedCategories: [
      { id: 'hamburgueres', label: 'Hambúrgueres Artesanais' },
      { id: 'combos_lanches', label: 'Combos com Batata & Refri' },
      { id: 'porcoes', label: 'Porções & Aperitivos' },
      { id: 'bebidas_lanche', label: 'Bebidas & Sucos' },
      { id: 'sobremesas', label: 'Sobremesas & Shakes' },
    ]
  },
  {
    id: 'pizzaria',
    title: 'Pizzaria & Esfiharia',
    shortLabel: 'Pizzaria',
    emoji: '🍕',
    description: 'Pizzas salgadas, doces, bordas recheadas, esfihas e refrigerantes.',
    pitch: 'PDV ágil para balcão de retirada e catálogo com taxa de frete dinâmica calculada por bairro.',
    namePlaceholder: 'Ex: Bella Napoli Pizzaria, Forno à Lenha',
    sloganExample: 'Massa artesanal, borda recheada e forno à lenha todos os dias',
    badgeNotice: 'Pizzas quentinhas com borda vulcão e refrigerante gelado',
    primaryColor: '#991B1B', // Vermelho Italiano
    accentColor: '#10B981', // Verde Manjericão
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Tamanhos & Bordas',
    suggestedCategories: [
      { id: 'pizzas_tradicionais', label: 'Pizzas Tradicionais' },
      { id: 'pizzas_especiais', label: 'Pizzas Especiais Gourmet' },
      { id: 'pizzas_doces', label: 'Pizzas Doces' },
      { id: 'esfihas', label: 'Esfihas Abertas' },
      { id: 'bebidas', label: 'Refrigerantes 2L & Cervejas' },
    ]
  },
  {
    id: 'comida_japonesa',
    title: 'Comida Oriental & Culinária Japonesa',
    shortLabel: 'Culinária Japonesa',
    emoji: '🍣',
    description: 'Sushis, sashimis, temakis, pokes, pratos quentes (yakisoba, guioza), barcas e combinados especiais.',
    pitch: 'Cardápio digital japonês feito na hora, sem taxas abusivas de marketplaces, com pedidos diretos e entrega rápida.',
    namePlaceholder: 'Ex: Sakura Sushi Bar, Tokyo Japanese Food, Nikkei Temakeria',
    sloganExample: 'Sushis frescos, sashimis selecionados e combinados preparados na hora',
    badgeNotice: 'Peixes frescos todos os dias e combinados com tarê da casa',
    primaryColor: '#09090B', // Preto Carbono Nobre
    accentColor: '#DC2626', // Vermelho Carmim Oriental
    themeStyle: 'dark_adega',
    bannerUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Combinados & Barcas',
    suggestedCategories: [
      { id: 'sushis_sashimis', label: 'Sushis & Sashimis' },
      { id: 'combinados_barcas', label: 'Combinados & Barcas' },
      { id: 'temakis_pokes', label: 'Temakis & Pokes' },
      { id: 'hot_rolls', label: 'Hot Rolls & Especiais' },
      { id: 'pratos_quentes', label: 'Pratos Quentes (Yakisoba, Guioza)' },
      { id: 'bebidas_japonesas', label: 'Bebidas & Saquês' },
      { id: 'sobremesas', label: 'Sobremesas Orientais' },
    ]
  },
  {
    id: 'mercadinho_emporio',
    title: 'Mercadinho de Bairro, Mercearia & Empório',
    shortLabel: 'Mercadinho & Mercearia',
    emoji: '🛒',
    description: 'Alimentos, frios, laticínios, hortifruti, limpeza, fardos de mercearia e conveniência.',
    pitch: 'Caixa balcão com leitor de código de barras USB/Bluetooth, controle de margem de lucro e fardos no atacado.',
    namePlaceholder: 'Ex: Mercado São José, Empório Gourmet Central',
    sloganExample: 'Tudo para o seu lar com preço justo e entrega no seu bairro',
    badgeNotice: 'Preço de atacado no fardo e entrega rápida no seu condomínio',
    primaryColor: '#047857', // Verde Mercadinho
    accentColor: '#F59E0B', // Amarelo Oferta
    themeStyle: 'modern_emerald',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Fardos & Caixas',
    suggestedCategories: [
      { id: 'mercearia', label: 'Mercearia & Básicos' },
      { id: 'bebidas', label: 'Bebidas & Laticínios' },
      { id: 'frios', label: 'Frios & Queijos' },
      { id: 'limpeza', label: 'Higiene & Limpeza' },
      { id: 'bomboniere', label: 'Doces & Biscoitos' },
    ]
  },
  {
    id: 'petshop',
    title: 'Pet Shop & Casa de Ração',
    shortLabel: 'Pet Shop & Ração',
    emoji: '🐾',
    description: 'Rações por saco ou quilo fracionado, petiscos, medicamentos veterinários e brinquedos.',
    pitch: 'Venda sacos fechados (15kg/20kg) com preço especial e fidelize clientes com agendamentos de entrega via WhatsApp.',
    namePlaceholder: 'Ex: Amigo Fiel Pet Shop, Casa da Ração',
    sloganExample: 'Amor, cuidado e a melhor nutrição para o seu melhor amigo',
    badgeNotice: 'Entregamos ração pesada na sua porta sem cobrar frete',
    primaryColor: '#0E7490', // Ciano / Azul Pet
    accentColor: '#F97316', // Laranja Pet
    themeStyle: 'clean_light',
    bannerUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Sacos & Pacotes',
    suggestedCategories: [
      { id: 'racao_caes', label: 'Rações para Cães' },
      { id: 'racao_gatos', label: 'Rações para Gatos' },
      { id: 'petiscos', label: 'Petiscos & Sachês' },
      { id: 'farmacia_pet', label: 'Farmácia Veterinária' },
      { id: 'acessorios', label: 'Coleiras, Camas & Brinquedos' },
    ]
  },
  {
    id: 'cosmeticos_farmacia',
    title: 'Cosméticos, Perfumaria & Beleza',
    shortLabel: 'Cosméticos & Beleza',
    emoji: '💄',
    description: 'Perfumes, maquiagens, cuidados com cabelo, skincare e produtos de higiene pessoal.',
    pitch: 'Vitrine digital com fotos elegantes dos produtos e pedidos de clientes direto no WhatsApp da consultora/loja.',
    namePlaceholder: 'Ex: Glamour Cosméticos, Essência Perfumaria',
    sloganExample: 'Realçando sua beleza natural com as melhores marcas importadas e nacionais',
    badgeNotice: 'Produtos 100% originais com embalagem especial para presente',
    primaryColor: '#BE185D', // Rosa Glamour
    accentColor: '#F59E0B', // Dourado Champagne
    themeStyle: 'gold_luxury',
    bannerUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Kits & Linhas',
    suggestedCategories: [
      { id: 'perfumes', label: 'Perfumes Importados & Nacionais' },
      { id: 'cabelos', label: 'Tratamento Capilar & Shampoos' },
      { id: 'maquiagem', label: 'Maquiagens & Batons' },
      { id: 'skincare', label: 'Cuidados com a Pele (Skincare)' },
      { id: 'kits_presente', label: 'Kits & Presentes' },
    ]
  }
];

export const getSegmentById = (id?: BusinessSegmentType): BusinessSegmentConfig => {
  return BUSINESS_SEGMENTS.find((s) => s.id === id) || BUSINESS_SEGMENTS[0];
};

/**
 * Retorna todas as categorias configuradas para o comércio do Tenant (com status ativo/inativo).
 * Se o Tenant ainda não tem a lista personalizada salva, inicializa com as sugeridas do segmento.
 */
export const getTenantCategories = (tenant?: Tenant | null): TenantCategory[] => {
  if (!tenant) return [];
  
  if (tenant.categories && tenant.categories.length > 0) {
    return tenant.categories;
  }

  // Inicializa a partir das categorias sugeridas do nicho do estabelecimento
  const segmentConfig = getSegmentById(tenant.businessSegment || 'adega');
  const baseCategories: TenantCategory[] = segmentConfig.suggestedCategories.map((c) => ({
    id: c.id,
    label: c.label,
    enabled: true,
    isCustom: false,
  }));

  // Mescla quaisquer categorias customizadas antigas que o lojista possa ter criado
  if (tenant.customCategories && tenant.customCategories.length > 0) {
    tenant.customCategories.forEach((cat) => {
      if (!baseCategories.some((b) => b.id === cat.id)) {
        baseCategories.push({
          id: cat.id,
          label: cat.label,
          enabled: true,
          isCustom: true,
        });
      }
    });
  }

  return baseCategories;
};

/**
 * Retorna o rótulo legível de qualquer categoria, priorizando as categorias do comércio atual
 */
export const getCategoryDisplayName = (
  categoryId: string, 
  segment?: BusinessSegmentType,
  categoriesOrCustom?: { id: string; label: string; enabled?: boolean }[]
): string => {
  // Verifica primeiro nas categorias da loja do lojista
  if (categoriesOrCustom && categoriesOrCustom.length > 0) {
    const match = categoriesOrCustom.find((c) => c.id === categoryId);
    if (match) return match.label;
  }

  if (segment) {
    const config = getSegmentById(segment);
    const found = config.suggestedCategories.find((c) => c.id === categoryId);
    if (found) return found.label;
  }

  // Busca em todos os segmentos
  for (const seg of BUSINESS_SEGMENTS) {
    const match = seg.suggestedCategories.find((c) => c.id === categoryId);
    if (match) return match.label;
  }

  // Dicionário genérico fallback
  const fallbackDict: Record<string, string> = {
    cervejas: 'Cervejas & Chopes',
    vinhos: 'Vinhos & Espumantes',
    destilados: 'Destilados & Whiskeys',
    combos: 'Combos & Kits',
    gelo_carvao: 'Gelo & Carvão',
    sem_alcool: 'Refrigerantes & Sucos',
    petiscos: 'Petiscos & Salgadinhos',
    todas: 'Todas as Categorias',
  };

  if (fallbackDict[categoryId]) {
    return fallbackDict[categoryId];
  }

  // Formata snake_case para Title Case
  return categoryId
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Agrupa e extrai as categorias ativas presentes nos produtos de um lojista para a vitrine
 */
export const getTenantActiveCategories = (
  products: { category: string }[],
  segment?: BusinessSegmentType,
  categoriesOrCustom?: { id: string; label: string; enabled?: boolean }[]
): { id: string; label: string; count: number }[] => {
  const countMap: Record<string, number> = {};

  // Se houver lista de categorias da loja, filtra apenas as que estão habilitadas (enabled !== false)
  const allowedCategories = categoriesOrCustom
    ? categoriesOrCustom.filter((c) => c.enabled !== false)
    : [];

  if (allowedCategories.length > 0) {
    allowedCategories.forEach((cat) => {
      countMap[cat.id] = 0;
    });
  }

  products.forEach((p) => {
    if (p.category) {
      // Se tiver lista definida pela loja, só conta se a categoria estiver habilitada
      if (allowedCategories.length === 0 || allowedCategories.some((c) => c.id === p.category)) {
        countMap[p.category] = (countMap[p.category] || 0) + 1;
      }
    }
  });

  return Object.keys(countMap).map((catId) => ({
    id: catId,
    label: getCategoryDisplayName(catId, segment, categoriesOrCustom),
    count: countMap[catId] || 0,
  }));
};

export interface SegmentColorPair {
  name: string;
  desc: string;
  primary: string;
  accent: string;
}

export interface SegmentColorOptions {
  option1: SegmentColorPair;
  option2: SegmentColorPair;
}

/**
 * 2 opções de cores sob medida conforme o tipo de estabelecimento do lojista
 */
export const SEGMENT_COLOR_OPTIONS: Record<string, SegmentColorOptions> = {
  adega: {
    option1: {
      name: 'Vinho Bordô & Âmbar Dourado',
      desc: 'Clássico para adegas, vinhos e destilados nobres',
      primary: '#881337',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Preto Carbono & Ouro Real',
      desc: 'Visual moderno de pub e distribuidora noturna',
      primary: '#18181B',
      accent: '#EAB308',
    },
  },
  comida_japonesa: {
    option1: {
      name: 'Vermelho Oriental & Dourado Nobre',
      desc: 'Identidade tradicional japonesa, sushi bars e temakerias',
      primary: '#DC2626',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Preto Carbono & Carmesim Premium',
      desc: 'Visual sofisticado de culinária japonesa e lounge',
      primary: '#18181B',
      accent: '#EF4444',
    },
  },
  pizzaria: {
    option1: {
      name: 'Verde Manjericão & Vermelho Tomate',
      desc: 'Cores italianas tradicionais para pizzarias e esfiharias',
      primary: '#059669',
      accent: '#E11D48',
    },
    option2: {
      name: 'Vermelho Forno & Amarelo Queijo',
      desc: 'Estilo acolhedor de forno à lenha e pizzas crocantes',
      primary: '#991B1B',
      accent: '#F59E0B',
    },
  },
  restaurante_lanchonete: {
    option1: {
      name: 'Laranja Burger & Amarelo Mostarda',
      desc: 'Vibrante e estimulante para hamburguerias e lanches',
      primary: '#EA580C',
      accent: '#EAB308',
    },
    option2: {
      name: 'Vermelho Retrô & Amarelo Cheddar',
      desc: 'Estilo clássico americano e smash burger',
      primary: '#B91C1C',
      accent: '#F59E0B',
    },
  },
  mercadinho_emporio: {
    option1: {
      name: 'Verde Mercado & Amarelo Oferta',
      desc: 'Confiança e frescor para mercearias e empórios',
      primary: '#047857',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Azul Comercial & Laranja Destaque',
      desc: 'Visual limpo e moderno de mini-mercado de bairro',
      primary: '#1D4ED8',
      accent: '#F97316',
    },
  },
  petshop: {
    option1: {
      name: 'Azul Pet & Laranja Energia',
      desc: 'Aconchegante e amigável para pet shops e clínicas',
      primary: '#0E7490',
      accent: '#F97316',
    },
    option2: {
      name: 'Verde Natureza & Amarelo Ouro',
      desc: 'Saúde animal, rações e produtos naturais',
      primary: '#15803D',
      accent: '#FACC15',
    },
  },
  cosmeticos_beleza: {
    option1: {
      name: 'Rosa Elegância & Dourado Rosé',
      desc: 'Beleza, perfumaria e cosméticos femininos',
      primary: '#BE185D',
      accent: '#FB7185',
    },
    option2: {
      name: 'Roxo Glamour & Dourado Nobre',
      desc: 'Estética, cuidados pessoais e salões',
      primary: '#6D28D9',
      accent: '#F59E0B',
    },
  },
};

export const getSegmentColorOptions = (segment?: BusinessSegmentType): SegmentColorOptions => {
  if (segment && SEGMENT_COLOR_OPTIONS[segment]) {
    return SEGMENT_COLOR_OPTIONS[segment];
  }
  return SEGMENT_COLOR_OPTIONS.adega;
};

