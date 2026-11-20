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
    bannerUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
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
  },
  {
    id: 'pesqueiro',
    title: 'Pesqueiro, Pesque-Pague & Petiscaria',
    shortLabel: 'Pesqueiro & Petiscaria',
    emoji: '🎣',
    description: 'Porções de tilápia fresca, peixes fritos, cervejas geladas, iscas, massas e artigos de pesca.',
    pitch: 'Atenda clientes nos quiosques e lago com agilidade. Controle de porções de peixe, bebidas trincando e iscas no balcão.',
    namePlaceholder: 'Ex: Pesqueiro Rancho Fundo, Pesque-Pague Lago Azul',
    sloganExample: 'O melhor dia de lazer, pesca esportiva e as porções mais crocantes',
    badgeNotice: 'Tilápia frita na hora, cerveja trincando e pescaria garantida',
    primaryColor: '#0284C7', // Azul Céu & Água
    accentColor: '#38BDF8', // Ciano Luminoso
    themeStyle: 'clean_light',
    bannerUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Porções & Iscas',
    suggestedCategories: [
      { id: 'porcoes_peixe', label: 'Porções de Peixe & Petiscos' },
      { id: 'bebidas_geladas', label: 'Cervejas & Bebidas Geladas' },
      { id: 'iscas_massas', label: 'Iscas, Massas & Atrativos' },
      { id: 'artigos_pesca', label: 'Artigos de Pesca & Varas' },
      { id: 'pratos_almoco', label: 'Almoço & Pratos Executivos' },
      { id: 'sobremesas', label: 'Sobremesas & Picolés' },
    ]
  },
  {
    id: 'pastelaria',
    title: 'Pastelaria, Salgados & Caldo de Cana',
    shortLabel: 'Pastelaria & Caldos',
    emoji: '🥟',
    description: 'Pastéis fritos na hora com massa crocante, salgados artesanais, caldo de cana gelado e sucos.',
    pitch: 'Frente de Caixa (PDV) ultra-rápido para balcão e delivery no WhatsApp com cardápio digital sem taxas abusivas.',
    namePlaceholder: 'Ex: Pastel do Japonês, Pastelaria Central Gourmet',
    sloganExample: 'Massa crocante e sequinha, recheio generoso e caldo de cana gelado',
    badgeNotice: 'Pastel frito na hora com recheio de verdade e massa crocante',
    primaryColor: '#D97706', // Âmbar Dourado Crocante
    accentColor: '#F59E0B', // Amarelo Pastel
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Combos & Pastéis',
    suggestedCategories: [
      { id: 'pasteis_tradicionais', label: 'Pastéis Tradicionais' },
      { id: 'pasteis_especiais', label: 'Pastéis Especiais & Gourmet' },
      { id: 'pasteis_doces', label: 'Pastéis Doces' },
      { id: 'salgados', label: 'Salgados Fritos & Assados' },
      { id: 'caldo_de_cana', label: 'Caldo de Cana & Sucos Naturais' },
      { id: 'refrigerantes_bebidas', label: 'Refrigerantes & Bebidas' },
    ]
  },
  {
    id: 'loja_roupas',
    title: 'Loja de Roupas, Moda & Acessórios',
    shortLabel: 'Moda & Roupas',
    emoji: '👗',
    description: 'Moda feminina, masculina, infantil, calçados, bolsas, acessórios e promoções.',
    pitch: 'Vitrine virtual com fotos elegantes tipo lookbook, grade de tamanhos (P, M, G, GG) e atendimento direto no WhatsApp.',
    namePlaceholder: 'Ex: Boutique Elegance, Urban Style Store, Maria Bonita Moda',
    sloganExample: 'As últimas tendências da moda e conforto para o seu estilo',
    badgeNotice: 'Coleção nova disponível e entrega expressa no mesmo dia',
    primaryColor: '#4F46E5', // Índigo Fashion
    accentColor: '#EC4899', // Rosa Pink
    themeStyle: 'clean_light',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Kits & Looks',
    suggestedCategories: [
      { id: 'feminino', label: 'Moda Feminina' },
      { id: 'masculino', label: 'Moda Masculina' },
      { id: 'infantil', label: 'Moda Infantil' },
      { id: 'calcados', label: 'Calçados & Tênis' },
      { id: 'acessorios', label: 'Bolsas & Acessórios' },
      { id: 'promocoes', label: 'Ofertas & Bazar' },
    ]
  },
  {
    id: 'sorveteria',
    title: 'Sorveteria, Açaíteria & Gelateria',
    shortLabel: 'Sorveteria & Açaí',
    emoji: '🍧',
    description: 'Sorvetes artesanais por bola ou pote, copos de açaí montados na hora, picolés e milk-shakes.',
    pitch: 'Cardápio digital refrescante com opções de acompanhamentos e caldas livres para o cliente montar no WhatsApp.',
    namePlaceholder: 'Ex: Gelato Real, Ponto do Açaí Tropical, Sorveteria da Praça',
    sloganExample: 'Refrescância, cremosidade irresistível e o puro açaí da Amazônia',
    badgeNotice: 'Puro creme, frutas frescas e calda liberada',
    primaryColor: '#7C3AED', // Roxo Açaí
    accentColor: '#06B6D4', // Ciano Refrescante
    themeStyle: 'clean_light',
    bannerUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Potes & Copos',
    suggestedCategories: [
      { id: 'acai_copos', label: 'Copos & Tigelas de Açaí' },
      { id: 'sorvetes_potes', label: 'Potes de Sorvete (1L e 2L)' },
      { id: 'picoles', label: 'Picolés & Paletas Mexicanas' },
      { id: 'milkshakes', label: 'Milk-Shakes Cremosos' },
      { id: 'sobremesas_geladas', label: 'Taças & Sobremesas Especiais' },
      { id: 'bebidas', label: 'Águas & Refrigerantes' },
    ]
  },
  {
    id: 'padaria',
    title: 'Padaria, Panificadora & Confeitaria',
    shortLabel: 'Padaria & Pães',
    emoji: '🥖',
    description: 'Pães artesanais quentinhos, frios fatiados na hora, lanches na chapa, cafés, roscas e tortas.',
    pitch: 'Frente de caixa rápida para o fluxo da manhã e delivery de pães e café da manhã entregues pontualmente.',
    namePlaceholder: 'Ex: Padaria Estrela da Manhã, Panificadora Pão & Cia',
    sloganExample: 'O aroma do pão quentinho e café fresco todas as manhãs',
    badgeNotice: 'Pão francês quentinho saindo do forno a toda hora',
    primaryColor: '#B45309', // Âmbar Dourado Pão
    accentColor: '#F59E0B', // Dourado Crosta
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Cestas & Combos',
    suggestedCategories: [
      { id: 'paes', label: 'Pães Tradicionais & Especiais' },
      { id: 'frios_laticinios', label: 'Frios & Laticínios Fatiados' },
      { id: 'cafes_bebidas', label: 'Cafés, Leite & Sucos' },
      { id: 'lanches_chapa', label: 'Lanches na Chapa & Ovos' },
      { id: 'bolos_doces', label: 'Bolos, Roscas & Doces' },
      { id: 'salgados_forno', label: 'Salgados de Forno & Folhados' },
    ]
  },
  {
    id: 'casa_bolos',
    title: 'Casa de Bolos, Doceria & Tortas Artesanais',
    shortLabel: 'Casa de Bolos & Doces',
    emoji: '🎂',
    description: 'Bolos caseiros tradicionais tipo vó, bolos vulcão com cobertura farta, tortas doces e sobremesas em pote.',
    pitch: 'Vitrine visual apaixonante com pedidos de pronta entrega e encomendas de bolos para festas e aniversários.',
    namePlaceholder: 'Ex: Casa de Bolos da Vovó, Delícias de Açúcar, Doce Sabor Ateliê',
    sloganExample: 'Bolos caseiros fresquinhos feitos com afeto e receitas de família',
    badgeNotice: 'Bolo quentinho saindo a toda hora com gostinho de infância',
    primaryColor: '#BE123C', // Cereja Confeitaria
    accentColor: '#F59E0B', // Caramelo Dourado
    themeStyle: 'clean_light',
    bannerUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Tamanhos & Formas',
    suggestedCategories: [
      { id: 'bolos_caseiros', label: 'Bolos Caseiros Tradicionais' },
      { id: 'bolos_vulcao', label: 'Bolos Vulcão & Cobertura' },
      { id: 'tortas_doces', label: 'Tortas & Cheesecakes' },
      { id: 'bolos_pote', label: 'Bolos no Pote & Sobremesas' },
      { id: 'docinhos_festa', label: 'Docinhos & Brigadeiros Gourmet' },
      { id: 'bebidas', label: 'Cafés, Refrigerantes & Sucos' },
    ]
  },
  {
    id: 'salgaderia',
    title: 'Salgaderia, Fábrica de Salgados & Centos para Festa',
    shortLabel: 'Salgaderia & Festas',
    emoji: '🍗',
    description: 'Coxinhas douradas, quibes crocantes, risoles, empadas, esfihas e centos para festas fritos ou congelados.',
    pitch: 'Atenda clientes de balcão com agilidade e receba encomendas de centos para festas com cálculo automático.',
    namePlaceholder: 'Ex: Rei da Coxinha, Fábrica de Salgados Central, Dona Coxinha',
    sloganExample: 'Salgados sequinhos, recheio generoso e centos perfeitos para a sua festa',
    badgeNotice: 'Fritura sequinha na hora ou congelados para sua conveniência',
    primaryColor: '#C2410C', // Laranja Quente Salgado
    accentColor: '#EAB308', // Dourado Crocante
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Centos & Caixas',
    suggestedCategories: [
      { id: 'salgados_fritos', label: 'Salgados Fritos Unitários' },
      { id: 'salgados_assados', label: 'Salgados Assados & Folhados' },
      { id: 'centos_festa', label: 'Centos para Festas (Fritos)' },
      { id: 'congelados', label: 'Salgados Congelados para Fritar' },
      { id: 'churros_doces', label: 'Minis Churros & Doces' },
      { id: 'refrigerantes', label: 'Refrigerantes 2L & Latas' },
    ]
  },
  {
    id: 'acougue',
    title: 'Açougue, Casa de Carnes & Boutique do Churrasco',
    shortLabel: 'Açougue & Carnes',
    emoji: '🥩',
    description: 'Cortes nobres bovinos, aves frescas, suínos, espetinhos prontos, linguiças artesanais e kits churrasco.',
    pitch: 'Agilidade na pesagem do balcão e delivery de carnes frescas com combos especiais para o fim de semana.',
    namePlaceholder: 'Ex: Casa de Carnes Boi Nobre, Açougue & Boutique do Churrasco',
    sloganExample: 'Carnes nobres selecionadas, cortes especiais e o melhor para o seu churrasco',
    badgeNotice: 'Cortes frescos preparados na hora pelo açougueiro',
    primaryColor: '#7F1D1D', // Vermelho Carne Escuro
    accentColor: '#F59E0B', // Dourado Brasa
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Kits & Peças',
    suggestedCategories: [
      { id: 'bovinos', label: 'Cortes Bovinos Especiais' },
      { id: 'aves_frangos', label: 'Aves & Frangos Frescos' },
      { id: 'suinos', label: 'Cortes Suínos & Linguiças' },
      { id: 'espetinhos', label: 'Espetinhos Prontos para Grelhar' },
      { id: 'kits_churrasco', label: 'Kits Churrasco & Combos' },
      { id: 'carvao_temperos', label: 'Carvão, Sal Grosso & Temperos' },
    ]
  },
  {
    id: 'hortifruti',
    title: 'Hortifrúti, Quitanda & Sacolão de Bairro',
    shortLabel: 'Hortifrúti & Quitanda',
    emoji: '🍎',
    description: 'Frutas selecionadas, verduras frescas, legumes, ovos caipiras, temperos naturais e grãos.',
    pitch: 'Receba pedidos de sacolas da feira da semana diretamente no WhatsApp com produtos colhidos no dia.',
    namePlaceholder: 'Ex: Sacolão da Terra, Hortifrúti Pomar Verde, Quitanda Saudável',
    sloganExample: 'Frutas, legumes e verduras direto do produtor para a sua mesa todos os dias',
    badgeNotice: 'Colheita fresca do dia e produtos higienizados com carinho',
    primaryColor: '#15803D', // Verde Hortifrúti
    accentColor: '#EAB308', // Amarelo Fruta
    themeStyle: 'modern_emerald',
    bannerUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Sacolas & Bandejas',
    suggestedCategories: [
      { id: 'frutas', label: 'Frutas Selecionadas' },
      { id: 'verduras', label: 'Verduras & Folhas Frescas' },
      { id: 'legumes', label: 'Legumes & Tubérculos' },
      { id: 'ovos_laticinios', label: 'Ovos & Queijos Frescos' },
      { id: 'temperos_graos', label: 'Temperos, Ervas & Grãos' },
      { id: 'sucos_naturais', label: 'Sucos Naturais & Polpas' },
    ]
  },
  {
    id: 'agua_gas',
    title: 'Distribuidora de Água Mineral & Gás de Cozinha',
    shortLabel: 'Água & Gás',
    emoji: '💧',
    description: 'Botijões de gás P13, galões de água mineral 20L, fardos de água garrafa e acessórios seguros.',
    pitch: 'Venda expressa via WhatsApp e PDV ágil com despacho instantâneo para motoentregadores no bairro.',
    namePlaceholder: 'Ex: SuperGás & Água Express, Disk Água Central, Ultragás do Bairro',
    sloganExample: 'Disk entrega mais rápida da região: gás seguro e água mineral na sua porta',
    badgeNotice: 'Entrega em até 20 minutos com instalação segura e gratuita',
    primaryColor: '#0369A1', // Azul Gás & Água
    accentColor: '#F59E0B', // Chama Dourada
    themeStyle: 'clean_light',
    bannerUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Fardos & Cascos',
    suggestedCategories: [
      { id: 'gas_cozinha', label: 'Gás de Cozinha (P13, P20, P45)' },
      { id: 'agua_20l', label: 'Galões de Água 20L (Retornável)' },
      { id: 'agua_garrafas', label: 'Fardos de Água Mineral (500ml e 1.5L)' },
      { id: 'acessorios_gas', label: 'Reguladores, Mangueiras & Suportes' },
      { id: 'carvao_gelo', label: 'Gelo & Carvão' },
    ]
  },
  {
    id: 'cafeteria',
    title: 'Cafeteria, Bistrô & Casa de Chá',
    shortLabel: 'Cafeteria & Bistrô',
    emoji: '☕',
    description: 'Cafés especiais expressos, cappuccinos cremosos, croissants folhados, brunch e sobremesas finas.',
    pitch: 'Cardápio charmoso para pedidos de mesa, retirada no balcão e delivery com embalagens térmicas seguras.',
    namePlaceholder: 'Ex: Grão Nobre Cafeteria, Café Paris Bistrô, Aroma & Grão',
    sloganExample: 'Cafés selecionados de origem, torra perfeita e um refúgio acolhedor',
    badgeNotice: 'Grãos moídos na hora por baristas apaixonados',
    primaryColor: '#451A03', // Marrom Café Nobre
    accentColor: '#D97706', // Caramelo Quente
    themeStyle: 'amber_pub',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Combos & Doses',
    suggestedCategories: [
      { id: 'cafes_quentes', label: 'Cafés Quentes & Espressos' },
      { id: 'cafes_gelados', label: 'Cafés Gelados & Frappés' },
      { id: 'salgados_folhados', label: 'Croissants & Pães de Queijo' },
      { id: 'brunch_sanduiches', label: 'Brunch & Sanduíches Especiais' },
      { id: 'bolos_doces', label: 'Fatias de Bolo & Tortas Finas' },
      { id: 'graos_moidos', label: 'Pacotes de Café em Grão e Moído' },
    ]
  },
  {
    id: 'farmacia',
    title: 'Farmácia, Drogaria & Cuidados Diários',
    shortLabel: 'Farmácia & Drogaria',
    emoji: '💊',
    description: 'Medicamentos isentos de prescrição, vitaminas, fraldas, higiene pessoal e primeiros socorros.',
    pitch: 'Atendimento de balcão ágil com leitor de código de barras e delivery rápido para medicamentos e cuidados.',
    namePlaceholder: 'Ex: Drogaria Saúde & Vida, Farmácia Popular Central, DrogaMaster',
    sloganExample: 'Cuidando da sua saúde e da sua família com preço acessível e entrega rápida',
    badgeNotice: 'Entrega emergencial rápida no seu bairro com farmacêutico de plantão',
    primaryColor: '#059669', // Verde Farmácia
    accentColor: '#0284C7', // Azul Saúde
    themeStyle: 'modern_emerald',
    bannerUrl: 'https://images.unsplash.com/photo-1586015555751-63c2c10b7a4f?auto=format&fit=crop&w=1600&q=80',
    packTerm: 'Caixas & Kits',
    suggestedCategories: [
      { id: 'primeiros_socorros', label: 'Primeiros Socorros & Curativos' },
      { id: 'vitaminas_suplementos', label: 'Vitaminas & Suplementos' },
      { id: 'infantil_bebe', label: 'Mamãe & Bebê (Fraldas e Lenços)' },
      { id: 'higiene_pessoal', label: 'Higiene & Cuidados Pessoais' },
      { id: 'dermocosmeticos', label: 'Dermocosméticos & Protetor Solar' },
      { id: 'medicamentos_isentos', label: 'Medicamentos Isentos (MIPs)' },
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
  loja_roupas: {
    option1: {
      name: 'Índigo Chic & Rosa Pink',
      desc: 'Moderno e sofisticado para boutiques e lojas de moda',
      primary: '#4F46E5',
      accent: '#EC4899',
    },
    option2: {
      name: 'Preto Minimalista & Dourado Nobre',
      desc: 'Estilo de grife e alta costura',
      primary: '#18181B',
      accent: '#EAB308',
    },
  },
  sorveteria: {
    option1: {
      name: 'Roxo Açaí & Ciano Refrescante',
      desc: 'Vibrante e irresistível para açaí e gelaterias',
      primary: '#7C3AED',
      accent: '#06B6D4',
    },
    option2: {
      name: 'Rosa Chiclete & Amarelo Manga',
      desc: 'Cores alegres e tropicais de sorveteria artesanal',
      primary: '#DB2777',
      accent: '#F59E0B',
    },
  },
  padaria: {
    option1: {
      name: 'Âmbar Forno & Dourado Pão',
      desc: 'Acolhedor e tradicional de panificadora e café',
      primary: '#B45309',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Marrom Café & Trigo Claro',
      desc: 'Estilo rústico artesanal de pães de fermentação natural',
      primary: '#78350F',
      accent: '#D97706',
    },
  },
  casa_bolos: {
    option1: {
      name: 'Cereja Doce & Caramelo Dourado',
      desc: 'Doce e afetuoso para bolos caseiros e confeitarias',
      primary: '#BE123C',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Chocolate Trufado & Baunilha Suave',
      desc: 'Cores requintadas de ateliê de doces e tortas',
      primary: '#451A03',
      accent: '#FBBF24',
    },
  },
  salgaderia: {
    option1: {
      name: 'Laranja Salgado & Amarelo Dourado',
      desc: 'Estimulante e apetitoso para coxinhas e centos de festa',
      primary: '#C2410C',
      accent: '#EAB308',
    },
    option2: {
      name: 'Vermelho Intenso & Ouro Crocante',
      desc: 'Visual forte e comercial de fábrica de salgados',
      primary: '#B91C1C',
      accent: '#F59E0B',
    },
  },
  acougue: {
    option1: {
      name: 'Vermelho Brasa & Dourado Fogo',
      desc: 'Carnes nobres, churrasco e cortes especiais',
      primary: '#7F1D1D',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Preto Nobre & Vinho Carmim',
      desc: 'Boutique de carnes e cortes premium para parrilla',
      primary: '#18181B',
      accent: '#DC2626',
    },
  },
  hortifruti: {
    option1: {
      name: 'Verde Folha & Laranja Tangerina',
      desc: 'Frescor, saúde e colheita do dia',
      primary: '#15803D',
      accent: '#EA580C',
    },
    option2: {
      name: 'Verde Esmeralda & Amarelo Fruta',
      desc: 'Visual limpo de quitanda e sacolão de bairro',
      primary: '#047857',
      accent: '#FACC15',
    },
  },
  agua_gas: {
    option1: {
      name: 'Azul Gás & Chama Dourada',
      desc: 'Confiança e segurança para distribuidoras de gás e água',
      primary: '#0369A1',
      accent: '#F59E0B',
    },
    option2: {
      name: 'Ciano Mineral & Laranja Entrega',
      desc: 'Disk entrega veloz e água purificada cristalina',
      primary: '#0891B2',
      accent: '#EA580C',
    },
  },
  cafeteria: {
    option1: {
      name: 'Marrom Café Nobre & Caramelo Quente',
      desc: 'Aconchegante e sofisticado para bistrôs e cafés especiais',
      primary: '#451A03',
      accent: '#D97706',
    },
    option2: {
      name: 'Verde Bistrô & Bege Latte',
      desc: 'Estilo contemporâneo de cafeteria europeia',
      primary: '#064E3B',
      accent: '#D97706',
    },
  },
  farmacia: {
    option1: {
      name: 'Verde Farmácia & Azul Saúde',
      desc: 'Cuidado, bem-estar e credibilidade profissional',
      primary: '#059669',
      accent: '#0284C7',
    },
    option2: {
      name: 'Azul Médico & Vermelho Emergência',
      desc: 'Destaque clássico de drogaria e primeiros socorros',
      primary: '#1D4ED8',
      accent: '#DC2626',
    },
  },
};

export const getSegmentColorOptions = (segment?: BusinessSegmentType): SegmentColorOptions => {
  if (segment && SEGMENT_COLOR_OPTIONS[segment]) {
    return SEGMENT_COLOR_OPTIONS[segment];
  }
  return SEGMENT_COLOR_OPTIONS.adega;
};

