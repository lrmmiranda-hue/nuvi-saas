export interface StoreWallpaper {
  id: string;
  category: 'adega' | 'restaurante' | 'pizzaria' | 'japonesa' | 'mercadinho' | 'petshop' | 'tabacaria' | 'cosmeticos';
  title: string;
  subtitle: string;
  url: string;
  tag: string;
}

export const WALLPAPER_CATEGORIES = [
  { id: 'adega' as const, label: 'Adega & Bebidas', icon: 'Wine' },
  { id: 'restaurante' as const, label: 'Lanches & Hamburgueria', icon: 'Sandwich' },
  { id: 'pizzaria' as const, label: 'Pizzaria & Forno', icon: 'Pizza' },
  { id: 'japonesa' as const, label: 'Culinária Japonesa & Sushi', icon: 'Fish' },
  { id: 'mercadinho' as const, label: 'Mercadinho & Empório', icon: 'ShoppingCart' },
  { id: 'petshop' as const, label: 'Pet Shop & Ração', icon: 'Dog' },
  { id: 'cosmeticos' as const, label: 'Cosméticos & Beleza', icon: 'Sparkles' },
];

export const STORE_WALLPAPERS: StoreWallpaper[] = [
  // ==========================================
  // 🍷 1. ADEGA & DISTRIBUIDORA DE BEBIDAS
  // ==========================================
  {
    id: 'adega_iluminada',
    category: 'adega',
    title: 'Adega Clássica Iluminada',
    subtitle: 'Barris de carvalho, vinhos finos e iluminação âmbar aconchegante',
    url: '/src/assets/images/adega_hero_banner_1793972462239.jpg',
    tag: 'Mais Escolhido',
  },
  {
    id: 'cervejas_geladas',
    category: 'adega',
    title: 'Cervejas Artesanais no Gelo',
    subtitle: 'Garrafas e latas super geladas trincando com gotas d\'água',
    url: '/src/assets/images/beer_ice_cold_1793972463737.jpg',
    tag: 'Distribuidoras',
  },
  {
    id: 'destilados_lounge',
    category: 'adega',
    title: 'Balcão de Destilados & Drinks',
    subtitle: 'Coquetéis premium, whisky importado, gin e taças de cristal',
    url: '/src/assets/images/gin_whiskey_combo_1793972463037.jpg',
    tag: 'Premium Drinks',
  },
  {
    id: 'vinho_taca_fino',
    category: 'adega',
    title: 'Vinho Nobre & Taça Cristal',
    subtitle: 'Elegância e requinte para empórios, bistrôs e sommeliers',
    url: '/src/assets/images/wine_fine_bottle_1793972464525.jpg',
    tag: 'Vinhos Finos',
  },
  {
    id: 'chopp_artesanal_suado',
    category: 'adega',
    title: 'Torneiras de Chopp & Caneca Suada',
    subtitle: 'Chopeira profissional com colarinho cremoso super gelado',
    url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80',
    tag: 'Choperia',
  },
  {
    id: 'prateleiras_bebidas_luz',
    category: 'adega',
    title: 'Distribuidora Moderna com LEDs',
    subtitle: 'Prateleiras iluminadas com garrafas coloridas, destilados e energéticos',
    url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80',
    tag: 'Distribuidora 24h',
  },
  {
    id: 'balde_gelo_cervejas',
    category: 'adega',
    title: 'Balde de Gelo com Cervejas Long Neck',
    subtitle: 'Cervejas trincando de geladas prontas para a festa e churrasco',
    url: 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Super Geladas',
  },
  {
    id: 'whisky_copo_gelo',
    category: 'adega',
    title: 'Whisky Bourbon On The Rocks',
    subtitle: 'Whisky envelhecido com gelo lapidado em lounge sofisticado',
    url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Destilados & Whiskies',
  },
  {
    id: 'bar_cocktails_neon',
    category: 'adega',
    title: 'Bar de Coquetéis & Noite Vibrante',
    subtitle: 'Drinks tropicais coloridos, gin tônica e iluminação noturna',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Kits & Combos',
  },
  {
    id: 'adega_subterranea',
    category: 'adega',
    title: 'Cave Rústica & Barris de Carvalho',
    subtitle: 'Tradição e sofisticação em vinhos e espumantes premiados',
    url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Tradição & Vinhos',
  },

  // ==========================================
  // 🍔 2. LANCHES, HAMBURGUERIA & RESTAURANTE
  // ==========================================
  {
    id: 'burger_artesanal_queijo',
    category: 'restaurante',
    title: 'Burger Artesanal & Queijo Cheddar',
    subtitle: 'Hambúrguer suculento no pão brioche com bacon crocante e queijo derretido',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'smash_burger_combos',
    category: 'restaurante',
    title: 'Smash Burger & Batata Frita Crocante',
    subtitle: 'Combos irresistíveis com batata rústica, molho da casa e refrigerante',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    tag: 'Smash Burger',
  },
  {
    id: 'burger_brioche_bacon',
    category: 'restaurante',
    title: 'Burger Duplo Gourmet com Bacon',
    subtitle: 'Dois blends bovinos suculentos com cebola caramelizada e barbecue',
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
    tag: 'Burger Artesanal',
  },
  {
    id: 'petiscos_porcoes_bar',
    category: 'restaurante',
    title: 'Porções & Petiscos de Boteco',
    subtitle: 'Batata frita com cheddar e bacon, anéis de cebola e tulipas de frango',
    url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
    tag: 'Porções & Fritas',
  },
  {
    id: 'batatas_rusticas_molho',
    category: 'restaurante',
    title: 'Batatas Rústicas com Alecrim & Molhos',
    subtitle: 'Aperitivos dourados crocantes por fora e macios por dentro',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80',
    tag: 'Aperitivos',
  },
  {
    id: 'hotdog_artesanal',
    category: 'restaurante',
    title: 'Hot Dog Prensado Especial',
    subtitle: 'Pão macio com salsicha especial, purê, vinagrete, milho e batata palha',
    url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Lanches & Dogs',
  },
  {
    id: 'churrasco_grelha_fogo',
    category: 'restaurante',
    title: 'Churrasco na Brasa & Cortes Nobres',
    subtitle: 'Picanha grelhada no ponto com fumaça aromática e braseiro ardente',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tag: 'Churrascaria',
  },
  {
    id: 'prato_comida_caseira',
    category: 'restaurante',
    title: 'Restaurante & Comida Caseira Suculenta',
    subtitle: 'Pratos executivos com tempero caseiro, saladas frescas e carnes no ponto',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Almoço & Refeições',
  },

  // ==========================================
  // 🍕 3. PIZZARIA & FORNO À LENHA
  // ==========================================
  {
    id: 'pizza_forno_lenha',
    category: 'pizzaria',
    title: 'Pizza Forno a Lenha & Queijo Puxa',
    subtitle: 'Massa artesanal assada na brasa com queijo borbulhante e manjericão fresco',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    tag: 'Forno a Lenha',
  },
  {
    id: 'pizza_calabresa_artesanal',
    category: 'pizzaria',
    title: 'Pizza Calabresa Especial & Bordas Recheadas',
    subtitle: 'Calabresa fatiada fininha com cebola roxa, azeitonas e borda vulcão',
    url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1200&q=80',
    tag: 'Tradicional',
  },
  {
    id: 'pizza_fatia_queijo',
    category: 'pizzaria',
    title: 'Fatia Napolitana com Queijo Puxando',
    subtitle: 'Massa de fermentação lenta com molho de tomate italiano e mozzarella',
    url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80',
    tag: 'Artesanal',
  },
  {
    id: 'esfihas_abertas_forno',
    category: 'pizzaria',
    title: 'Esfihas Abertas & Massa Fresca Dourada',
    subtitle: 'Esfihas douradas quentinhas de carne moída temperada, queijo e frango c/ catupiry',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Esfiharia',
  },
  {
    id: 'pizzaiolo_preparo',
    category: 'pizzaria',
    title: 'Pizzaiolo Abrindo Massa no Mármore',
    subtitle: 'Tradição italiana artesanal com farinha especial e preparo manual',
    url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Massa Fresca',
  },
  {
    id: 'pizza_margherita_fresca',
    category: 'pizzaria',
    title: 'Pizza Margherita com Manjericão e Tomate',
    subtitle: 'Sabor clássico italiano com azeite de oliva extra virgem e folhas frescas',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gourmet',
  },
  {
    id: 'forno_brasa_fogo',
    category: 'pizzaria',
    title: 'Braseiro Ardente do Forno de Pizza',
    subtitle: 'Calor intenso da lenha que garante a crocância perfeita da massa',
    url: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Fogo & Lenha',
  },

  // ==========================================
  // 🍣 4. CULINÁRIA JAPONESA & SUSHI BAR
  // ==========================================
  {
    id: 'sushi_bar_moderno',
    category: 'japonesa',
    title: 'Sushi Bar Contemporâneo & Peixes Nobres',
    subtitle: 'Bancada escura sofisticada com sushis artesanais e iluminação oriental intimista',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'barca_salmao_premium',
    category: 'japonesa',
    title: 'Barca de Salmão & Sashimis Selecionados',
    subtitle: 'Apresentação nobre em barca de madeira com fatias frescas de salmão e niguiris',
    url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
    tag: 'Barcas & Combinados',
  },
  {
    id: 'temaki_crocante_nori',
    category: 'japonesa',
    title: 'Temakis Artesanais & Nori Crocante',
    subtitle: 'Cones recheados com salmão fresco em cubos, cream cheese e cebolinha',
    url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1200&q=80',
    tag: 'Temakeria',
  },
  {
    id: 'hot_roll_tare_fogo',
    category: 'japonesa',
    title: 'Hot Rolls Crocantes com Molho Tarê',
    subtitle: 'Sushis empanados dourados com farinha panko, tarê brilhante e gergelim tostado',
    url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hot Rolls',
  },
  {
    id: 'poke_bowl_tropical',
    category: 'japonesa',
    title: 'Poke Bowl Colorido de Salmão & Frutas',
    subtitle: 'Tigela oriental leve com shari, manga fresca, sunomono e gergelim',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pokes & Fresh',
  },
  {
    id: 'restaurante_japones_lanternas',
    category: 'japonesa',
    title: 'Lounge Oriental com Lanternas Japonesas',
    subtitle: 'Ambiente aconchegante típico de Tóquio com luminárias de papel e esteiras de bambu',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    tag: 'Lounge Oriental',
  },

  // ==========================================
  // 🛒 5. MERCADINHO & EMPÓRIO
  // ==========================================
  {
    id: 'mercadinho_prateleiras_coloridas',
    category: 'mercadinho',
    title: 'Mercearia & Prateleiras de Alimentos',
    subtitle: 'Produtos de consumo diário, cereais, matinais e despensa completa',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'frios_queijos_tabua',
    category: 'mercadinho',
    title: 'Empório de Queijos, Frios & Vinhos',
    subtitle: 'Cortes selecionados de queijos artesanais, embutidos e antepastos nobres',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80',
    tag: 'Empório & Frios',
  },
  {
    id: 'frutas_hortifruti_fresco',
    category: 'mercadinho',
    title: 'Hortifruti & Frutas Frescas Selecionadas',
    subtitle: 'Cores vibrantes de alimentos frescos, verduras e legumes colhidos no dia',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hortifruti Fresco',
  },
  {
    id: 'padaria_paes_frescos',
    category: 'mercadinho',
    title: 'Padaria & Pães Artesanais Crocantes',
    subtitle: 'Pães franceses quentinhos, brioches, baguetes e roscas doces',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    tag: 'Padaria & Pães',
  },
  {
    id: 'mercado_corredor_moderno',
    category: 'mercadinho',
    title: 'Supermercado & Corredores Organizados',
    subtitle: 'Ambiente amplo, limpo e abastecido para compras do mês e do dia a dia',
    url: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Conveniência',
  },
  {
    id: 'emporio_graos_temperos',
    category: 'mercadinho',
    title: 'Empório de Grãos, Especiarias & Azeites',
    subtitle: 'Castanhas, temperos naturais, grãos a granel e azeites nobres',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gourmet & Grãos',
  },

  // ==========================================
  // 🐾 5. PET SHOP & CASA DE RAÇÃO
  // ==========================================
  {
    id: 'petshop_cachorro_feliz',
    category: 'petshop',
    title: 'Pet Shop Amigo & Cães Saudáveis',
    subtitle: 'Cachorrinho alegre com brinquedos, ração nutritiva e muito carinho',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Popular',
  },
  {
    id: 'gatinho_fofo_pet',
    category: 'petshop',
    title: 'Gatos & Cuidados Especiais',
    subtitle: 'Nutrição premium, arranhadores, areias higiênicas e sachês para felinos',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    tag: 'Felinos',
  },
  {
    id: 'racao_pesada_sacos',
    category: 'petshop',
    title: 'Casa da Ração & Sacos Fechados (15kg/20kg)',
    subtitle: 'Alimentação completa com marcas premium para cães e gatos de todos os portes',
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Rações por Saco',
  },
  {
    id: 'filhotes_brincando',
    category: 'petshop',
    title: 'Filhotes Brincalhões & Nutrição Inicial',
    subtitle: 'Rações especiais para filhotes, vitaminas, mamadeiras e petiscos macios',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Filhotes & Brinquedos',
  },
  {
    id: 'banho_tosa_pet',
    category: 'petshop',
    title: 'Banho, Tosa & Estética Animal',
    subtitle: 'Shampoos veterinários, perfumes pet, escovação e cuidados de higiene',
    url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80',
    tag: 'Banho & Tosa',
  },
  {
    id: 'pet_saude_veterinaria',
    category: 'petshop',
    title: 'Farmácia Veterinária & Coleiras',
    subtitle: 'Antipulgas, vermífugos, caminhas confortáveis e peitorais seguros',
    url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Acessórios & Saúde',
  },

  // ==========================================
  // 💨 6. TABACARIA & LOUNGE
  // ==========================================
  {
    id: 'tabacaria_hookah_lounge',
    category: 'tabacaria',
    title: 'Hookah Lounge Noturno com LEDs',
    subtitle: 'Ambiente aconchegante para narguilé, essências importadas e amigos',
    url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hookah Lounge',
  },
  {
    id: 'smoke_fumaça_neon',
    category: 'tabacaria',
    title: 'Fumaça com Iluminação Neon Roxa & Âmbar',
    subtitle: 'Efeito estético moderno e misterioso para tabacarias, pods e vapes',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Neon Vibes',
  },
  {
    id: 'acessorios_tabacaria_madeira',
    category: 'tabacaria',
    title: 'Acessórios Premium de Tabacaria',
    subtitle: 'Carvões selecionados, sedas de celulose, bongs de vidro e cutelaria fina',
    url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Headshop',
  },
  {
    id: 'charutos_premium_cedro',
    category: 'tabacaria',
    title: 'Charutos Finos em Caixa de Cedro Nobre',
    subtitle: 'Charutos artesanais, cortadores guillotine e isqueiros maçarico',
    url: 'https://images.unsplash.com/photo-1528154291023-a6525fabb164?auto=format&fit=crop&w=1200&q=80',
    tag: 'Charutaria',
  },
  {
    id: 'braseiro_carvao_fumaca',
    category: 'tabacaria',
    title: 'Carvão de Coco Aceso & Brasa Ardente',
    subtitle: 'Carvões hexagonais para queima limpa e sem odor para narguilé',
    url: 'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?auto=format&fit=crop&w=1200&q=80',
    tag: 'Carvões & Brasa',
  },
  {
    id: 'lounge_luzes_noturno',
    category: 'tabacaria',
    title: 'Tabacaria & Lounge Moderno com Sofás',
    subtitle: 'Espaço lounge com iluminação baixa para momentos de descontração',
    url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
    tag: 'Lounge Noturno',
  },

  // ==========================================
  // 💄 7. COSMÉTICOS & PERFUMARIA
  // ==========================================
  {
    id: 'cosmeticos_perfumes_luxo',
    category: 'cosmeticos',
    title: 'Perfumaria Fina & Frascos de Cristal',
    subtitle: 'Fragrâncias importadas com reflexos dourados sofisticados',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Perfumaria',
  },
  {
    id: 'maquiagem_batons_tons',
    category: 'cosmeticos',
    title: 'Maquiagens & Paleta de Cores',
    subtitle: 'Pincéis profissionais, batons e pós para beleza e estética',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
    tag: 'Maquiagem',
  },
  {
    id: 'skincare_hidratantes_spa',
    category: 'cosmeticos',
    title: 'Skincare, Cuidados & Bem-Estar',
    subtitle: 'Produtos naturais e cremes hidratantes com textura sedosa e relaxante',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    tag: 'Skincare',
  },
  {
    id: 'batom_vermelho_glamour',
    category: 'cosmeticos',
    title: 'Batons & Maquiagem Glamour',
    subtitle: 'Tons vibrantes de batons clássicos, gloss e sombras elegantes',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80',
    tag: 'Glamour & Batons',
  },
  {
    id: 'salao_beleza_cabelos',
    category: 'cosmeticos',
    title: 'Tratamento Capilar & Salão Elegante',
    subtitle: 'Máscaras capilares, óleos nutritivos e finalizadores profissionais',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cabelos & Spa',
  },
  {
    id: 'perfumes_dourados_luxo',
    category: 'cosmeticos',
    title: 'Fragrâncias Importadas & Ouro Champanhe',
    subtitle: 'Aromas florais e amadeirados em embalagens refinadas para presentes',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
    tag: 'Linhas Nobres',
  },
];
