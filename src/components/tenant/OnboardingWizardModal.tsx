import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, TenantBranding, TenantAddress, TenantWhatsAppSettings, BusinessSegmentType } from '../../types';
import { getSegmentById } from '../../data/businessSegments';
import { STORE_WALLPAPERS, WALLPAPER_CATEGORIES, getSegmentWallpapers } from '../../data/wallpapers';
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
  Dog,
  Search,
  ChevronDown
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
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner_beer',
    title: 'Cervejas Artesanais Geladas',
    url: 'https://images.unsplash.com/photo-1608270199042-3a3111f19812?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner_spirits',
    title: 'Bar de Destilados & Drinks',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner_propaganda_combos',
    title: 'Propaganda: Mega Combos & Ofertas Especiais',
    url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner_propaganda_cervejas',
    title: 'Propaganda: Cervejas Super Geladas & Fardos Promocionais',
    url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'banner_propaganda_happy_hour',
    title: 'Propaganda: Festival de Drinks & Delivery no WhatsApp',
    url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
  },
];

// =========================================================================
// 🎨 PALETAS EXCLUSIVAS POR COMÉRCIO (EXATAMENTE 6 OPÇÕES CONTEXTUALIZADAS)
// =========================================================================
export const SEGMENT_THEMES: Record<BusinessSegmentType, PresetTheme[]> = {
  pizzaria: [
    {
      id: 'pizza_forno',
      name: 'Forno a Lenha & Terracota',
      primary: '#1C1917',
      accent: '#EA580C',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Tons acolhedores inspirados no fogo do forno iglu e tijolos rústicos.',
    },
    {
      id: 'pizza_pomodoro',
      name: 'Pomodoro & Manjericão',
      primary: '#18181B',
      accent: '#DC2626',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Vermelho intenso do molho italiano clássico com toque artesanal.',
    },
    {
      id: 'pizza_queijo',
      name: 'Queijo Dourado & Âmbar',
      primary: '#09090B',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Mussarela gratinada e borda crocante para pizzarias e esfiharias.',
    },
    {
      id: 'pizza_vinho',
      name: 'Vinho Italiano & Bordô',
      primary: '#2E081C',
      accent: '#F43F5E',
      style: 'gold_luxury',
      category: 'vibrant',
      desc: 'Combinação refinada de trattoria italiana, massas e vinhos finos.',
    },
    {
      id: 'pizza_noite',
      name: 'Noite Napolitana & Fogo',
      primary: '#09090B',
      accent: '#F97316',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Preto carbon com laranja brasa, ideal para delivery noturno ágil.',
    },
    {
      id: 'pizza_rustica',
      name: 'Trattoria Madeira & Trigo',
      primary: '#292524',
      accent: '#FBBF24',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Tradição rústica com foco em massas artesanais de fermentação lenta.',
    },
  ],
  pesqueiro: [
    {
      id: 'pesqueiro_represa',
      name: 'Azul Lago & Dourado Nobre',
      primary: '#082F49',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'vibrant',
      desc: 'Inspirado na tranquilidade das águas e na culinária nobre de peixes.',
    },
    {
      id: 'pesqueiro_peixe_ouro',
      name: 'Peixe Dourado & Âmbar',
      primary: '#09090B',
      accent: '#EAB308',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Elegância e destaque para porções crocantes e peixes assados.',
    },
    {
      id: 'pesqueiro_natureza',
      name: 'Verde Represa & Menta',
      primary: '#064E3B',
      accent: '#34D399',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Ambiente campestre ao ar livre, quiosques e pesque e pague familiar.',
    },
    {
      id: 'pesqueiro_porcoes',
      name: 'Porções & Iscas Crocantes',
      primary: '#18181B',
      accent: '#F97316',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Quente e dinâmico para petiscos, camarão empanado e cerveja gelada.',
    },
    {
      id: 'pesqueiro_deck',
      name: 'Deck de Madeira & Ciano',
      primary: '#1C1917',
      accent: '#06B6D4',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Madeira rústica com ciano cristalino para decks na beira do lago.',
    },
    {
      id: 'pesqueiro_sunset',
      name: 'Pôr do Sol no Rancho',
      primary: '#3B0764',
      accent: '#FB923C',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Cores de entardecer na represa para lazer, música e refeições completas.',
    },
  ],
  adega: [
    {
      id: 'adega_ouro',
      name: 'Preto & Ouro Imperial',
      primary: '#09090B',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Sofisticação máxima para adegas, vinhos nobres e destilados premium.',
    },
    {
      id: 'adega_bordeaux',
      name: 'Bordeaux & Champagne',
      primary: '#881337',
      accent: '#FBBF24',
      style: 'gold_luxury',
      category: 'vibrant',
      desc: 'Vinhos tintos encorpados, taças de cristal e bistrôs requintados.',
    },
    {
      id: 'adega_cerveja',
      name: 'Cerveja Gelada & Âmbar',
      primary: '#0F172A',
      accent: '#EAB308',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Cervejas trincando no gelo, chopp artesanal e combos de latas.',
    },
    {
      id: 'adega_carvalho',
      name: 'Carvalho & Malte Whisky',
      primary: '#3E1F17',
      accent: '#D97706',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Tons amadeirados de barril para uísques, runs e destilados envelhecidos.',
    },
    {
      id: 'adega_gin',
      name: 'Gin & Ciano Cristalino',
      primary: '#09090B',
      accent: '#06B6D4',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Visual contemporâneo e refrescante para gins, tônicas e drinks autorais.',
    },
    {
      id: 'adega_lounge',
      name: 'Noite Lounge & Roxo Cyber',
      primary: '#18181B',
      accent: '#A855F7',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Atmosfera moderna para distribuidoras 24h e conveniências noturnas.',
    },
  ],
  restaurante_lanchonete: [
    {
      id: 'rest_brasa',
      name: 'Vermelho Brasa & Cheddar',
      primary: '#B91C1C',
      accent: '#F59E0B',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Clássico imbatível para hamburguerias artesanais e lanches apetitosos.',
    },
    {
      id: 'rest_black_angus',
      name: 'Black Angus & Fogo',
      primary: '#09090B',
      accent: '#EF4444',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Carvão e fogo alto para carnes nobres grelhadas na parrilla.',
    },
    {
      id: 'rest_bbq',
      name: 'Smoked BBQ & Laranja Brasa',
      primary: '#431407',
      accent: '#F97316',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'American BBQ, defumados, costelinha e molhos especiais.',
    },
    {
      id: 'rest_rustico',
      name: 'Madeira Rústica & Ouro',
      primary: '#292524',
      accent: '#EAB308',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Gourmet e artesanal com pães brioche e tábuas de hambúrguer.',
    },
    {
      id: 'rest_gourmet',
      name: 'Gourmet Fresh & Verde Oliva',
      primary: '#064E3B',
      accent: '#84CC16',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Alface americana fresca, ingredientes orgânicos e lanches gourmet.',
    },
    {
      id: 'rest_noite',
      name: 'Dark Burger & Ciano',
      primary: '#18181B',
      accent: '#06B6D4',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Visual moderno e urbano para delivery express e kombis gourmet.',
    },
  ],
  comida_japonesa: [
    {
      id: 'japa_imperial',
      name: 'Preto Imperial & Carmim Sushi',
      primary: '#09090B',
      accent: '#DC2626',
      style: 'dark_adega',
      category: 'vibrant',
      desc: 'Tradição milenar oriental com elegância e foco em peixes frescos.',
    },
    {
      id: 'japa_tokyo',
      name: 'Tokyo Dark & Salmão Fresh',
      primary: '#18181B',
      accent: '#FB7185',
      style: 'dark_adega',
      category: 'vibrant',
      desc: 'Moderno e sofisticado para temakerias, combinados e pokes.',
    },
    {
      id: 'japa_wasabi',
      name: 'Verde Wasabi & Bambu',
      primary: '#064E3B',
      accent: '#84CC16',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Harmonia com folhas de bambu, shisô e frescor da culinária japonesa.',
    },
    {
      id: 'japa_ouro',
      name: 'Ouro Oriental & Carvão',
      primary: '#09090B',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Requinte para restaurantes à la carte com rodízio e pratos quentes.',
    },
    {
      id: 'japa_torii',
      name: 'Vermelho Torii & Sakura',
      primary: '#7F1D1D',
      accent: '#F43F5E',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Inspirado nos portais japoneses e nas cerejeiras floridas.',
    },
    {
      id: 'japa_clean',
      name: 'Minimalista Preto & Branco',
      primary: '#0A0A0A',
      accent: '#F8FAFC',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Minimalismo puro com protagonismo absoluto para a beleza dos pratos.',
    },
  ],
  mercadinho_emporio: [
    {
      id: 'merc_verde',
      name: 'Verde Orgânico & Hortifrúti',
      primary: '#064E3B',
      accent: '#10B981',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Frescor de feira, verduras selecionadas e produtos saudáveis.',
    },
    {
      id: 'merc_azul',
      name: 'Azul Confiança & Amarelo',
      primary: '#0F172A',
      accent: '#EAB308',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Visual de supermercado tradicional, dinâmico e de alta conversão.',
    },
    {
      id: 'merc_emporio',
      name: 'Empório Nobre & Âmbar',
      primary: '#451A03',
      accent: '#D97706',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Queijos artesanais, frios especiais e produtos coloniais.',
    },
    {
      id: 'merc_clean',
      name: 'Conveniência Clean & Celeste',
      primary: '#0284C7',
      accent: '#38BDF8',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Claro e objetivo para minimercados de condomínio e mercearias rápidas.',
    },
    {
      id: 'merc_laranja',
      name: 'Cesta Cheia & Laranja',
      primary: '#18181B',
      accent: '#F97316',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Ofertas diárias e destaque para economia e compras familiares.',
    },
    {
      id: 'merc_dark',
      name: 'Preto & Amarelo Express',
      primary: '#09090B',
      accent: '#FACC15',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Visual moderno de minimercados autônomos e conveniências 24 horas.',
    },
  ],
  petshop: [
    {
      id: 'pet_azul',
      name: 'Azul Pet & Amarelo Canário',
      primary: '#0284C7',
      accent: '#EAB308',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Alegre e acolhedor para lojas de ração, brinquedos e banho e tosa.',
    },
    {
      id: 'pet_turquesa',
      name: 'Turquesa Aqua & Laranja',
      primary: '#0D9488',
      accent: '#F97316',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Cuidado animal, higiene, estética pet e clínicas veterinárias.',
    },
    {
      id: 'pet_roxo',
      name: 'Roxo Divertido & Ciano',
      primary: '#581C87',
      accent: '#38BDF8',
      style: 'dark_adega',
      category: 'vibrant',
      desc: 'Criativo e amigável para acessórios, caminhas e mimos para pets.',
    },
    {
      id: 'pet_verde',
      name: 'Verde Natureza & Menta',
      primary: '#065F46',
      accent: '#84CC16',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Alimentação natural, rações premium e saúde animal preventiva.',
    },
    {
      id: 'pet_dark',
      name: 'Pet Dark & Dourado Nobre',
      primary: '#18181B',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Boutique pet sofisticada para raças nobres e produtos importados.',
    },
    {
      id: 'pet_rosa',
      name: 'Rosa Carinho & Bege',
      primary: '#831843',
      accent: '#F472B6',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Afetuoso para gatos, filhotes e cuidados delicados no banho.',
    },
  ],
  cosmeticos_farmacia: [
    {
      id: 'cosm_rosa',
      name: 'Rosa Glamour & Ouro',
      primary: '#831843',
      accent: '#F472B6',
      style: 'gold_luxury',
      category: 'vibrant',
      desc: 'Beleza clássica, maquiagens de festa e fragrâncias exclusivas.',
    },
    {
      id: 'cosm_dark_pink',
      name: 'Preto & Pink Neon',
      primary: '#09090B',
      accent: '#EC4899',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Atitude fashion para salões, manicures e cosméticos modernos.',
    },
    {
      id: 'cosm_ouro',
      name: 'Dourado Nobre & Champanhe',
      primary: '#18181B',
      accent: '#FBBF24',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Perfumaria importada fina e tratamentos capilares profissionais.',
    },
    {
      id: 'cosm_spa',
      name: 'Menta Spa & Skincare',
      primary: '#064E3B',
      accent: '#2DD4BF',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Dermocosméticos, bem-estar, massoterapia e cuidados com a pele.',
    },
    {
      id: 'cosm_lavanda',
      name: 'Lavanda Relax & Lilás',
      primary: '#4C1D95',
      accent: '#C084FC',
      style: 'dark_adega',
      category: 'vibrant',
      desc: 'Aromaterapia, óleos essenciais e sabonetes artesanais relaxantes.',
    },
    {
      id: 'cosm_farma',
      name: 'Farmácia Saúde & Ciano',
      primary: '#0F172A',
      accent: '#38BDF8',
      style: 'modern_emerald',
      category: 'dark',
      desc: 'Credibilidade e segurança para farmácias, suplementos e vitaminas.',
    },
  ],
  tabacaria: [
    {
      id: 'tab_couro',
      name: 'Couro Rústico & Âmbar',
      primary: '#3E1F17',
      accent: '#D97706',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Charutos nobres, cachimbos artesanais e tabacos envelhecidos.',
    },
    {
      id: 'tab_ouro',
      name: 'Preto Fosco & Ouro Nobre',
      primary: '#09090B',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Linhas premium de narguiles, sedas finas e isqueiros de luxo.',
    },
    {
      id: 'tab_prata',
      name: 'Fumaça & Prata Titanium',
      primary: '#18181B',
      accent: '#94A3B8',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Minimalismo escuro com contraste metálico para acessórios modernos.',
    },
    {
      id: 'tab_brasa',
      name: 'Brasa Viva & Carmim',
      primary: '#450A0A',
      accent: '#EF4444',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Carvões de narguile acesos e energia de lounge noturno.',
    },
    {
      id: 'tab_ciano',
      name: 'Lounge Noturno & Ciano',
      primary: '#09090B',
      accent: '#06B6D4',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Atmosfera de pub e lounge com iluminação led futurista.',
    },
    {
      id: 'tab_verde',
      name: 'Verde Oliva & Folha Natural',
      primary: '#064E3B',
      accent: '#10B981',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'Sedas orgânicas de cânhamo e essências naturais de alta qualidade.',
    },
  ],
  pastelaria: [
    {
      id: 'past_dourado',
      name: 'Dourado Massa Frita & Âmbar',
      primary: '#09090B',
      accent: '#F59E0B',
      style: 'gold_luxury',
      category: 'dark',
      desc: 'Casquinha sequinha crocante e recheios generosos de pastel.',
    },
    {
      id: 'past_cana',
      name: 'Caldo de Cana & Verde Limão',
      primary: '#064E3B',
      accent: '#84CC16',
      style: 'modern_emerald',
      category: 'vibrant',
      desc: 'A clássica dupla do pastel de feira com caldo de cana trincando.',
    },
    {
      id: 'past_recheio',
      name: 'Vermelho Recheio & Queijo',
      primary: '#991B1B',
      accent: '#FBBF24',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Carne moída especial, pizza, queijo derretido e temperos.',
    },
    {
      id: 'past_feira',
      name: 'Laranja Feira & Sol',
      primary: '#7C2D12',
      accent: '#FB923C',
      style: 'amber_pub',
      category: 'vibrant',
      desc: 'Tradição brasileira de feira livre e pastelarias tradicionais.',
    },
    {
      id: 'past_crocante',
      name: 'Preto & Ouro Crocante',
      primary: '#18181B',
      accent: '#F59E0B',
      style: 'dark_adega',
      category: 'dark',
      desc: 'Pastelaria gourmet e delivery de pastéis doces e salgados.',
    },
    {
      id: 'past_rustico',
      name: 'Rústico Tradição Familiar',
      primary: '#451A03',
      accent: '#FCD34D',
      style: 'amber_pub',
      category: 'dark',
      desc: 'Receita de família com massa caseira fresca e ingredientes nobres.',
    },
  ],
};

export const getSegmentThemes = (segment?: BusinessSegmentType): PresetTheme[] => {
  if (segment && SEGMENT_THEMES[segment]) {
    return SEGMENT_THEMES[segment];
  }
  return SEGMENT_THEMES.adega;
};

// =========================================================================
// 🔍 SUGESTÕES DE BUSCA NO GOOGLE IMAGENS POR COMÉRCIO
// =========================================================================
export const SEGMENT_GOOGLE_SEARCH_IDEAS: Record<BusinessSegmentType, Array<{ label: string; query: string }>> = {
  pesqueiro: [
    { label: '🐟 Porções & Peixe Frito', query: 'porção de peixe frito tilápia isca com limão alta resolução' },
    { label: '🍤 Camarão & Petiscos', query: 'porção de camarão empanado crocante restaurante' },
    { label: '🍲 Pratos À La Carte de Peixe', query: 'pratos à la carte peixe grelhado moqueca restaurante' },
    { label: '🥗 Mesa com Acompanhamentos', query: 'mesa farta restaurante pesqueiro arroz pirao farofa acompanhamentos' },
    { label: '🎣 Pesqueiro, Lago & Deck', query: 'pesqueiro lago deck de pesca natureza por do sol' },
    { label: '🍖 Porção de Carnes & Churrasco', query: 'porção de carne picanha mandioca restaurante pesqueiro' },
  ],
  pizzaria: [
    { label: '🍕 Pizza Saindo do Forno', query: 'pizza saindo forno a lenha queijo derretendo alta resolucao' },
    { label: '🪵 Mesa de Pizzaria Rústica', query: 'mesa de pizzaria rustica fatias de pizza taça vinho' },
    { label: '🍅 Pomodoro & Manjericão', query: 'ingredientes pizza molho tomate manjericao farinha rustico' },
    { label: '🔥 Forno a Lenha com Chamas', query: 'forno a lenha pizzaria com fogo chamas' },
    { label: '🧀 Borda Recheada & Queijo', query: 'fatia de pizza puxando queijo mussarela borda recheada' },
    { label: '🍫 Pizzas Doces Especiais', query: 'pizza doce chocolate morango nutella gourmet' },
  ],
  adega: [
    { label: '🍷 Adega de Vinhos & Barris', query: 'adega de vinhos barris de carvalho iluminacao aconchegante' },
    { label: '🍺 Cervejas no Gelo Trincando', query: 'cervejas garrafas geladas no gelo gotas trincando alta resolucao' },
    { label: '🥃 Bar de Whisky & Destilados', query: 'whisky gin garrafas premium balcao de drinks' },
    { label: '🍻 Torneiras de Chopp Artesanal', query: 'torneiras de chopp artesanal caneca suada colarinho' },
    { label: '🍾 Champagnes & Espumantes', query: 'garrafa de espumante balde de gelo taca brinde' },
    { label: '🍹 Coquetéis & Gin Tônica', query: 'taca de gin tonica especiarias barman balcao' },
  ],
  restaurante_lanchonete: [
    { label: '🍔 Hambúrguer Artesanal na Brasa', query: 'hamburguer artesanal queijo cheddar derretendo bacon' },
    { label: '🍟 Batata Frita & Acompanhamentos', query: 'porção batata frita crocante molhos cheddar bacon' },
    { label: '🥩 Parrilla & Carnes Grelhadas', query: 'churrasco parrilla carnes nobres grelhadas fogo' },
    { label: '🥪 Lanches Gourmet & Artesanais', query: 'sanduiche artesanal pao brioche restaurante lanchonete' },
    { label: '🥤 Bebidas & Milk Shakes', query: 'milk shake artesanal chocolate morango calda' },
    { label: '🍽️ Prato Executivo Almoço', query: 'prato executivo restaurante arroz feijao carne salada' },
  ],
  comida_japonesa: [
    { label: '🍣 Barco de Sushi & Sashimi', query: 'barco de sushi sashimi combinados salmao restaurante japones' },
    { label: '🥢 Combinado de Salmão & Atum', query: 'prato sushi combinado salmao nigiri hossomaki uramaki' },
    { label: '🥟 Temakis & Entradas Quentes', query: 'temaki salmao grelhado shimeji guioza culinaria japonesa' },
    { label: '🍱 Pokes Havainos & Orientais', query: 'poke de salmao arroz manga edamame tigela' },
    { label: '🍜 Lámen & Sopas Orientais', query: 'tigela de ramen oriental caldo ovo cebolinha chashu' },
    { label: '🏮 Ambiente Restaurante Japonês', query: 'restaurante japones iluminação oriental decoracao' },
  ],
  mercadinho_emporio: [
    { label: '🥦 Hortifrúti & Frutas Frescas', query: 'hortifruti feira frutas verduras frescas bancada supermercado' },
    { label: '🧀 Frios, Queijos & Laticínios', query: 'tabua de queijos finos frios fatiados emporio' },
    { label: '🥖 Padaria & Pães Artesanais', query: 'padaria paes artesanais quentinhos cesta emporio' },
    { label: '🥫 Prateleiras de Mercearia', query: 'prateleiras organizadas mercadinho empório produtos' },
    { label: '🍷 Vinhos & Produtos Coloniais', query: 'produtos coloniais doces compotas queijos vinhos' },
    { label: '🛒 Carrinho de Compras & Ofertas', query: 'carrinho supermercado compras produtos feira' },
  ],
  petshop: [
    { label: '🐶 Cães Brincando & Rações', query: 'cachorros fofos brincando racao pet shop' },
    { label: '🐱 Gatos & Brinquedos Pet', query: 'gatos fofos arranhador brinquedos pet shop' },
    { label: '🛁 Banho e Tosa Profissional', query: 'banho e tosa cachorro tosado limpo banheira pet' },
    { label: '🦴 Petiscos, Ossos & Rações', query: 'pacotes de ração petiscos ossinhos loja pet shop' },
    { label: '🧸 Acessórios, Coleiras & Camas', query: 'caminhas para cachorro coleiras roupinhas pet' },
    { label: '🦜 Pássaros, Peixes & Pequenos Animais', query: 'aquario peixes ornamentais passaros pet shop' },
  ],
  cosmeticos_farmacia: [
    { label: '💄 Batons & Maquiagem Profissional', query: 'maquiagem batons pinceis paleta de sombras penteadeira' },
    { label: '🧴 Skincare & Cremes Hidratantes', query: 'skincare cosméticos frascos cremes cuidados com a pele' },
    { label: '✨ Perfumaria Fina & Frascos de Luxo', query: 'perfumes importados frascos de cristal iluminação dourada' },
    { label: '💆 Tratamento Capilar & Salão', query: 'produtos tratamento capilar mascaras oleos salao beleza' },
    { label: '🌿 Cosméticos Naturais & Spa', query: 'cosmeticos naturais veganos folhas toalha sabonete artesanal' },
    { label: '💊 Farmácia & Medicamentos', query: 'farmacia prateleiras organizadas remedios suplementos saude' },
  ],
  tabacaria: [
    { label: '🍂 Charutos Nobres & Caixas de Madeira', query: 'charutos cubanos tabaco caixa de cedro cortador isqueiro' },
    { label: '💨 Narguiles & Sessão Lounge', query: 'narguile fumaca lounge vasos mangueiras tabacaria' },
    { label: '🔥 Isqueiros Especiais & Maçaricos', query: 'isqueiros zippo macariqueiro acessorios tabacaria' },
    { label: '🍃 Sedas Orgânicas & Dichavadores', query: 'sedas papeis dichavadores acessorios tabacaria' },
    { label: '🏺 Pipas, Cachimbos & Fumos', query: 'cachimbos de madeira fumo especial fita couro' },
    { label: '🛋️ Lounge Noturno de Tabacaria', query: 'tabacaria lounge sofisticado iluminacao noturna' },
  ],
  pastelaria: [
    { label: '🥟 Pastel Frito Quentinho & Crocante', query: 'pastel de feira frito sequinho dourado recheado' },
    { label: '🥤 Garapa & Caldo de Cana Gelado', query: 'copo de caldo de cana com limao gelo feira' },
    { label: '🧀 Pastel de Queijo Puxando', query: 'pastel queijo derretendo recheio generoso' },
    { label: '🥩 Pastel de Carne Especial com Ovo', query: 'pastel de carne com ovo temperado frito' },
    { label: '🍫 Pasteis Doces & Chocolate', query: 'pastel doce chocolate banana canela queijo doce' },
    { label: '🎪 Barraca de Pastel & Feira Livre', query: 'barraca de pastel feira livre tradicional fritando' },
  ],
};

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  targetTenant,
}) => {
  const { currentTenant, updateTenant, setViewRole, showAlert, themeMode, globalConfig } = useStore();
  const tenant = targetTenant || currentTenant;
  const isLight = themeMode === 'light';

  const [step, setStep] = useState<number>(1);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [bannerMode, setBannerMode] = useState<'prontas' | 'google'>('prontas');
  const [googleImageUrl, setGoogleImageUrl] = useState<string>('');

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

  // Imagens prontas e exclusivas do segmento (estritamente 6 imagens do ramo)
  const segmentWallpapers = useMemo(() => {
    return getSegmentWallpapers(activeSegment);
  }, [activeSegment]);

  // Estados para filtro dropdown de cores no celular
  const [isColorFilterOpen, setIsColorFilterOpen] = useState(false);
  const [colorSearchQuery, setColorSearchQuery] = useState('');

  const currentSegmentThemes = useMemo(() => getSegmentThemes(activeSegment), [activeSegment]);

  const activeThemeSelected = useMemo(() => {
    return currentSegmentThemes.find(
      (t) =>
        t.primary.toLowerCase() === formData.branding.primaryColor.toLowerCase() &&
        t.accent.toLowerCase() === formData.branding.accentColor.toLowerCase()
    ) || currentSegmentThemes[0] || {
      id: 'custom',
      name: 'Paleta Personalizada',
      primary: formData.branding.primaryColor,
      accent: formData.branding.accentColor,
      style: formData.branding.themeStyle,
      desc: 'Cores selecionadas na vitrine',
    };
  }, [currentSegmentThemes, formData.branding.primaryColor, formData.branding.accentColor]);

  const filteredSegmentThemes = useMemo(() => {
    if (!colorSearchQuery.trim()) return currentSegmentThemes;
    const q = colorSearchQuery.toLowerCase();
    return currentSegmentThemes.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q))
    );
  }, [currentSegmentThemes, colorSearchQuery]);

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
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-neutral-50/70 border-neutral-200' : 'bg-neutral-950/80 border-neutral-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      Qual é o Modelo de Foco do seu Estabelecimento? *
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 font-semibold border border-sky-500/30">
                        Definido pelo Plano
                      </span>
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Selecione o plano de assinatura do seu comércio. Os recursos e módulos operacionais serão ativados de acordo com a sua escolha.
                    </p>
                  </div>
                </div>

                {/* Grid Dinâmico com os Planos Ativos do SaaS em 2 Colunas (Mobile e Desktop) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  {((globalConfig?.plans && globalConfig.plans.length > 0)
                    ? globalConfig.plans.filter((p) => p.active !== false)
                    : [
                        {
                          id: 'plan_cardapio',
                          name: 'Cardápio Digital & Pedidos',
                          tagline: 'Ideal para iniciar sem custos elevados',
                          price: 49.90,
                          period: '/mês',
                          description: 'Vitrine digital com fotos, descrições e pedidos no WhatsApp sem taxas de comissão.',
                          badge: 'Iniciante',
                          features: ['Vitrine Web com link próprio', 'Cardápio Digital QR Code', 'Pedidos direto no WhatsApp'],
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
                          features: ['PDV Balcão Caixa Rápido', 'Leitor de Código de Barras', 'Fechamento de caixa diário'],
                          active: true,
                        },
                        {
                          id: 'plan_delivery_estoque',
                          name: 'Delivery & Estoque Profissional',
                          tagline: 'Autonomia total de entregas e estoque',
                          price: 139.90,
                          period: '/mês',
                          description: 'Controle de estoque em tempo real com baixa automática e frete por raio.',
                          badge: 'Profissional',
                          features: ['Balcão PDV + Vitrine Web', 'Estoque e Reposição em Tempo Real', 'Cálculo de Frete por KM'],
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
                          features: ['Todos os recursos ilimitados', 'Margem de lucro e relatórios', 'Atendimento VIP Prioritário'],
                          active: true,
                        },
                      ]
                  ).map((planItem) => {
                    const lower = `${planItem.id} ${planItem.name}`.toLowerCase();
                    const isBalcaoPlan = lower.includes('balcao') && !lower.includes('delivery') && !lower.includes('pro') && !lower.includes('hibrido');
                    const isCardapioPlan = lower.includes('cardapio') || lower.includes('vitrine');

                    // Verifica se este plano está selecionado
                    const isSelected = isBalcaoPlan
                      ? (formData.config.enablePhysicalStore && !formData.config.enableOnlineSales)
                      : isCardapioPlan
                      ? (!formData.config.enablePhysicalStore && formData.config.enableOnlineSales)
                      : (formData.config.enablePhysicalStore && formData.config.enableOnlineSales);

                    const PlanIcon = isBalcaoPlan ? ShoppingCart : isCardapioPlan ? Globe : lower.includes('pro') ? Sparkles : Store;

                    return (
                      <button
                        key={planItem.id}
                        type="button"
                        onClick={() => {
                          if (isBalcaoPlan) {
                            setFormData({
                              ...formData,
                              plan: 'balcao',
                              config: { ...formData.config, enablePhysicalStore: true, enableOnlineSales: false },
                              whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: false },
                            });
                          } else if (isCardapioPlan) {
                            setFormData({
                              ...formData,
                              plan: 'vitrine',
                              config: { ...formData.config, enablePhysicalStore: false, enableOnlineSales: true },
                              whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: true },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              plan: 'hibrido',
                              config: { ...formData.config, enablePhysicalStore: true, enableOnlineSales: true },
                              whatsapp: { ...formData.whatsapp, enableWhatsAppOrders: true },
                            });
                          }
                        }}
                        className={`w-full p-2.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white shadow-md shadow-[#0C2340]/40 border-0'
                            : isLight
                            ? 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 shadow-none'
                            : 'bg-neutral-900/80 border border-neutral-800 text-neutral-300 hover:border-neutral-700 shadow-none'
                        }`}
                      >
                        <div className="w-full min-w-0">
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                              <PlanIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? 'text-sky-500' : 'text-neutral-400'}`} />
                              <span className={`font-bold text-xs sm:text-sm leading-snug break-words ${isSelected ? (isLight ? 'text-sky-950 font-extrabold' : 'text-sky-200') : (isLight ? 'text-neutral-900' : 'text-white')}`}>
                                {planItem.name}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 shrink-0 mt-0.5" />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <div className="flex items-baseline gap-1">
                              <span className={`text-base sm:text-xl font-black ${isSelected ? (isLight ? 'text-sky-700' : 'text-sky-400') : (isLight ? 'text-neutral-900' : 'text-white')}`}>
                                R$ {planItem.price.toFixed(2).replace('.', ',')}
                              </span>
                              <span className={`text-[10px] sm:text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                {planItem.period || '/mês'}
                              </span>
                            </div>
                            {planItem.badge && (
                              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                                {planItem.badge}
                              </span>
                            )}
                          </div>

                          <p className={`text-[11px] sm:text-xs leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {planItem.description}
                          </p>

                          {planItem.features && planItem.features.length > 0 && (
                            <ul className="space-y-1 sm:space-y-1.5 pt-1.5 sm:pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                              {planItem.features.slice(0, 3).map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs leading-snug">
                                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 text-sky-500 shrink-0" />
                                  <span className={`break-words ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Resumo Granular dos Módulos Habilitados pelo Plano Selecionado */}
                <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-neutral-800/80'}`}>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    formData.config.enablePhysicalStore
                      ? isLight ? 'bg-sky-50/50 border-sky-200 text-slate-900' : 'bg-sky-950/20 border-sky-500/30 text-white'
                      : isLight ? 'bg-slate-100/50 border-slate-200 opacity-60 text-slate-500' : 'bg-neutral-900 border-neutral-800 opacity-50 text-neutral-400'
                  }`}>
                    <div>
                      <span className="font-semibold flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-sky-500" />
                        Loja Física / Vendas no Balcão (PDV Frente de Caixa)
                      </span>
                      <span className="text-[11px] block mt-0.5 opacity-80">
                        {formData.config.enablePhysicalStore ? 'Módulo ATIVADO pelo seu plano atual' : 'Módulo DESATIVADO pelo seu plano atual'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      formData.config.enablePhysicalStore
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        : 'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      {formData.config.enablePhysicalStore ? 'Incluso' : 'Não incluso'}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    formData.config.enableOnlineSales
                      ? isLight ? 'bg-sky-50/50 border-sky-200 text-slate-900' : 'bg-sky-950/20 border-sky-500/30 text-white'
                      : isLight ? 'bg-slate-100/50 border-slate-200 opacity-60 text-slate-500' : 'bg-neutral-900 border-neutral-800 opacity-50 text-neutral-400'
                  }`}>
                    <div>
                      <span className="font-semibold flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-500" />
                        Vendas Online / Vitrine & Cardápio Digital na Web
                      </span>
                      <span className="text-[11px] block mt-0.5 opacity-80">
                        {formData.config.enableOnlineSales ? 'Módulo ATIVADO pelo seu plano atual' : 'Módulo DESATIVADO pelo seu plano atual'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      formData.config.enableOnlineSales
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        : 'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      {formData.config.enableOnlineSales ? 'Incluso' : 'Não incluso'}
                    </span>
                  </div>

                  {formData.config.enableOnlineSales && (
                    <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs pl-6 border-l-4 border-l-sky-500 ${
                      isLight ? 'bg-white border-slate-300 shadow-2xs text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
                    }`}>
                      <div>
                        <span className={`font-semibold block ${isLight ? 'text-sky-700 font-bold' : 'text-sky-400'}`}>
                          Recebimento de Pedidos no WhatsApp
                        </span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          Envia o carrinho do cliente com a mensagem formatada para o WhatsApp da sua loja
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
                        className="w-4 h-4 rounded text-sky-500 border-neutral-300 cursor-pointer accent-sky-500"
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
                    Paleta de Cores da Vitrine & Cardápio ({segmentConfig.title} - 6 Opções Recomendadas)
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
                    className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer self-start"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Usar padrão recomendado para {segmentConfig.shortLabel}</span>
                  </button>
                </div>
                <p className={`text-[11px] mb-3 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  As 6 opções abaixo foram especialmente selecionadas para combinar perfeitamente com a identidade visual de <strong>{segmentConfig.title}</strong>.
                </p>
                {/* ======================================================== */}
                {/* 1. SELETOR DE CORES NO CELULAR: Filtro Dropdown conforme Imagem 2 */}
                {/* ======================================================== */}
                <div className="sm:hidden space-y-2">
                  {/* Botão Gatilho do Dropdown */}
                  <button
                    type="button"
                    onClick={() => setIsColorFilterOpen(!isColorFilterOpen)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isColorFilterOpen
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-[#0E1520] border-[#1C2631] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: activeThemeSelected.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 -ml-1.5 shadow-xs"
                          style={{ backgroundColor: activeThemeSelected.accent }}
                        />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-xs block text-slate-900 dark:text-white">
                          {activeThemeSelected.name}
                        </span>
                        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Toque para filtrar outra paleta de cores
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                        Selecionada
                      </span>
                      <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${isColorFilterOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Painel do Filtro conforme Imagem 2 */}
                  {isColorFilterOpen && (
                    <div className={`p-3 rounded-2xl border-2 border-blue-500 shadow-2xl space-y-2.5 transition-all ${
                      isLight ? 'bg-white shadow-blue-500/10' : 'bg-[#0B131E] shadow-black/80'
                    }`}>
                      {/* Input de Busca com borda azul e ícone de lupa */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={colorSearchQuery}
                          onChange={(e) => setColorSearchQuery(e.target.value)}
                          placeholder="Digite para buscar cor (ex: Ouro, Azul, Vinho)..."
                          className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium outline-none border-2 border-blue-500/80 focus:border-blue-500 transition-colors ${
                            isLight
                              ? 'bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                              : 'bg-[#080E17] text-white placeholder-slate-500'
                          }`}
                          autoFocus
                        />
                        {colorSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setColorSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Cabeçalho da Lista: Marcar exibidos (conforme imagem 2) */}
                      <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <span>Marcar paleta exibida ({filteredSegmentThemes.length})</span>
                      </div>

                      {/* Lista vertical rolável com barra de scroll e checkboxes brancos */}
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                        {filteredSegmentThemes.map((theme) => {
                          const isSelected =
                            formData.branding.primaryColor.toLowerCase() === theme.primary.toLowerCase() &&
                            formData.branding.accentColor.toLowerCase() === theme.accent.toLowerCase();
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  branding: {
                                    ...formData.branding,
                                    primaryColor: theme.primary,
                                    accentColor: theme.accent,
                                    themeStyle: theme.style,
                                  },
                                });
                                setIsColorFilterOpen(false);
                                setColorSearchQuery('');
                              }}
                              className={`w-full p-2.5 rounded-lg flex items-center gap-3 text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? isLight
                                    ? 'bg-blue-50 text-blue-900 font-bold'
                                    : 'bg-blue-600/20 text-white font-bold'
                                  : isLight
                                  ? 'hover:bg-slate-100 text-slate-700'
                                  : 'hover:bg-[#121B27] text-slate-300'
                              }`}
                            >
                              {/* Checkbox branco conforme Imagem 2 */}
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-white border-white text-slate-900'
                                  : isLight
                                  ? 'border-slate-300 bg-white'
                                  : 'border-slate-600 bg-transparent'
                              }`}>
                                {isSelected && (
                                  <Check className="w-3 h-3 text-slate-900 stroke-[3]" />
                                )}
                              </div>

                              {/* Bolinhas de cores */}
                              <div className="flex items-center shrink-0">
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                                  style={{ backgroundColor: theme.primary }}
                                />
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20 -ml-1.5 shadow-xs"
                                  style={{ backgroundColor: theme.accent }}
                                />
                              </div>

                              {/* Nome da cor e descrição */}
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold block truncate">
                                  {theme.name}
                                </span>
                                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {theme.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {filteredSegmentThemes.length === 0 && (
                          <p className="text-center text-xs py-4 text-slate-500">
                            Nenhuma paleta encontrada para "{colorSearchQuery}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* 2. SELETOR DE CORES NO COMPUTADOR: Grid como estava antes */}
                {/* ======================================================== */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getSegmentThemes(activeSegment).map((theme) => {
                    const isSelected =
                      formData.branding.primaryColor.toLowerCase() === theme.primary.toLowerCase() &&
                      formData.branding.accentColor.toLowerCase() === theme.accent.toLowerCase();
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
                        className={`text-left p-3.5 rounded-xl transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white shadow-md shadow-[#0C2340]/40 border-0'
                            : isLight
                            ? 'border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
                            : 'border border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shrink-0 -ml-1.5 shadow-xs"
                              style={{ backgroundColor: theme.accent }}
                            />
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {theme.name}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                          )}
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
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className={labelClass}>
                        Banner de Fundo & Papel de Parede da Vitrine
                      </label>
                      <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Escolha uma imagem pronta do catálogo ou busque fotos temáticas em alta resolução no Google Imagens:
                      </p>
                    </div>
                  </div>

                  {/* 2 Botões de Ação no Topo: Imagens Prontas vs Buscar no Google */}
                  <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-fit">
                    <button
                      type="button"
                      onClick={() => setBannerMode('prontas')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        bannerMode === 'prontas'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isLight
                          ? 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>🖼️ Imagens Prontas do Sistema</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBannerMode('google')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        bannerMode === 'google'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isLight
                          ? 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>🔍 Buscar Imagens no Google</span>
                    </button>
                  </div>

                  {/* MODO 1: IMAGENS PRONTAS EXCLUSIVAS DO RAMO DO COMÉRCIO */}
                  {bannerMode === 'prontas' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                          <span>{segmentConfig.emoji}</span>
                          <span>Imagens Prontas para {segmentConfig.title} ({segmentWallpapers.length} opções exclusivas)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 uppercase">
                          Exclusivo do seu Ramo
                        </span>
                      </div>

                      {/* Grid de Imagens Exclusivas da Categoria do Comércio */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {segmentWallpapers.map((banner) => {
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
                                  ? 'border-sky-500 ring-2 ring-sky-500 shadow-md'
                                  : isLight
                                  ? 'border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs'
                                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                              }`}
                            >
                              <div className="relative w-full h-24 overflow-hidden bg-neutral-950">
                                <img
                                  src={banner.url}
                                  alt={banner.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold">
                                  {banner.tag}
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
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
                    </div>
                  )}

                  {/* MODO 2: BUSCAR NO GOOGLE IMAGENS DIRETAMENTE PARA O COMÉRCIO */}
                  {bannerMode === 'google' && (
                    <div className={`p-4 rounded-xl border space-y-4 ${
                      isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-neutral-950 border-neutral-800'
                    }`}>
                      <div>
                        <h4 className={`text-xs font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          <Search className="w-4 h-4 text-sky-500" />
                          Sugestões de Busca no Google Imagens para {segmentConfig.title}
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                          Clique em um dos botões abaixo para abrir a pesquisa com fotos em alta definição em uma nova aba. Depois, copie o link da imagem desejada e cole no campo abaixo.
                        </p>
                      </div>

                      {/* Botões de Consulta do Google formatados para o segmento */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(SEGMENT_GOOGLE_SEARCH_IDEAS[activeSegment] || SEGMENT_GOOGLE_SEARCH_IDEAS.adega).map((idea, idx) => (
                          <a
                            key={idx}
                            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(idea.query)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                              isLight
                                ? 'bg-white border-sky-200 text-sky-950 hover:bg-sky-50 hover:border-sky-300 shadow-2xs'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <span className="truncate">{idea.label}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          </a>
                        ))}
                      </div>

                      {/* Campo para colar a URL com botão de aplicar */}
                      <div className="pt-2 border-t border-sky-200/60 dark:border-neutral-800/80 space-y-2">
                        <label className={`block text-xs font-bold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                          Cole a URL da Imagem Escolhida no Google:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={googleImageUrl}
                            onChange={(e) => setGoogleImageUrl(e.target.value)}
                            placeholder="https://... (exemplo: cole o link da imagem aqui)"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!googleImageUrl.trim()) {
                                showAlert({
                                  title: 'URL Inválida',
                                  message: 'Por favor, cole um link válido de imagem da internet antes de aplicar.',
                                  variant: 'warning'
                                });
                                return;
                              }
                              setFormData({
                                ...formData,
                                branding: { ...formData.branding, bannerUrl: googleImageUrl.trim() }
                              });
                              showAlert({
                                title: 'Banner Atualizado!',
                                message: 'A imagem do Google foi aplicada como banner da sua vitrine.',
                                variant: 'success'
                              });
                            }}
                            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aplicar Imagem</span>
                          </button>
                        </div>
                      </div>

                      {/* Pré-visualização da imagem atual */}
                      {formData.branding.bannerUrl && (
                        <div className="p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-black/40 flex items-center gap-3">
                          <div className="w-16 h-10 rounded overflow-hidden shrink-0 bg-neutral-900 border border-neutral-700">
                            <img
                              src={formData.branding.bannerUrl}
                              alt="Banner Atual"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                              Banner Ativo Atualmente
                            </span>
                            <p className="text-xs text-neutral-300 truncate">
                              {formData.branding.bannerUrl}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input de URL Personalizada Genérico */}
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
                      placeholder="Ou digite/cole a URL direta de uma imagem personalizada para o banner"
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
              {(() => {
                const rawSlug = (formData.name || tenant.slug || tenant.name || 'minha-loja');
                const storeSlug = rawSlug
                  .toLowerCase()
                  .trim()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');

                const baseDomain = (typeof window !== 'undefined' && window.location.hostname.includes('nuvi-saas.web.app'))
                  ? window.location.origin
                  : 'https://nuvi-saas.web.app';

                const vitrineCardapioUrl = `${baseDomain}/${storeSlug}/cardapio`;
                const painelLojistaUrl = `${baseDomain}/${storeSlug}/painel`;
                const phone = (formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber).replace(/\D/g, '');
                const pass = formData.adminPassword || tenant.adminPassword || '123456';

                return (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isLight ? 'bg-sky-50/70 border-sky-200 shadow-2xs' : 'bg-sky-950/20 border-sky-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-500" />
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-sky-950' : 'text-sky-400'}`}>
                        Links Oficiais de Acesso da sua Loja
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Link Vitrine / Cardápio */}
                      <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                              <Store className="w-3.5 h-3.5 text-sky-500" /> Vitrine & Cardápio dos Clientes
                            </span>
                            <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-bold">
                              Pública
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 mb-2">
                            <p className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 break-all select-all">
                              {vitrineCardapioUrl}
                            </p>
                          </div>
                          <p className={`text-[10px] mb-2 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Link oficial do cardápio digital para divulgar nas redes sociais e WhatsApp.
                          </p>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(vitrineCardapioUrl);
                              showAlert({
                                title: 'Link da Vitrine Copiado!',
                                message: `O link do cardápio foi copiado com sucesso:\n${vitrineCardapioUrl}`,
                                variant: 'success'
                              });
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copiar Link</span>
                          </button>
                          <a
                            href={vitrineCardapioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 rounded-lg border border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            title="Abrir cardápio em nova aba"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Link Painel do Lojista */}
                      <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                              <Lock className="w-3.5 h-3.5 text-amber-500" /> Painel do Lojista (PDV)
                            </span>
                            <span className="text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-bold">
                              Restrito
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 mb-2">
                            <p className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 break-all select-all">
                              {painelLojistaUrl}
                            </p>
                          </div>
                          <div className={`text-[11px] font-mono space-y-0.5 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800/80 mb-2 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                            <p>📱 Login: <strong>{formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber}</strong></p>
                            <p>🔑 Senha: <strong>{formData.adminPassword || tenant.adminPassword || '123456'}</strong></p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(painelLojistaUrl);
                              showAlert({
                                title: 'Link do Painel Copiado!',
                                message: `O link do painel foi copiado:\n${painelLojistaUrl}\n\nLogin: ${formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber}\nSenha: ${formData.adminPassword || tenant.adminPassword || '123456'}`,
                                variant: 'success'
                              });
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copiar Link do Painel</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Share Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const emoji = segmentConfig.emoji || '🏪';
                        const msg = `*${emoji} Acesso Oficial ao Sistema - ${formData.name || tenant.name}*\n\nOlá ${formData.ownerName || tenant.ownerName}! Seus acessos foram configurados com sucesso:\n\n🛒 *Vitrine & Cardápio dos Clientes:*\n${vitrineCardapioUrl}\n\n💻 *Painel do Lojista (PDV e Gestão):*\n${painelLojistaUrl}\n📱 *Usuário / WhatsApp:* ${formData.whatsapp.phoneNumber || tenant.whatsapp.phoneNumber}\n🔑 *Senha de Acesso:* ${pass}\n\nBoas vendas! Qualquer dúvida estamos à disposição.`;
                        const waUrl = `https://wa.me/${phone.startsWith('55') ? phone : '55' + phone}?text=${encodeURIComponent(msg)}`;
                        window.open(waUrl, '_blank');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Dados de Acesso no WhatsApp do Lojista</span>
                    </button>
                  </div>
                );
              })()}

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
