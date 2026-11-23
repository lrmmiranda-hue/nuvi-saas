import { BusinessSegmentType } from '../types';

export interface StoreWallpaper {
  id: string;
  category: BusinessSegmentType;
  title: string;
  subtitle: string;
  url: string;
  tag: string;
}

export const WALLPAPER_CATEGORIES: { id: BusinessSegmentType; label: string; icon: string }[] = [
  { id: 'adega', label: 'Adega & Bebidas', icon: 'Wine' },
  { id: 'restaurante_lanchonete', label: 'Lanches & Hamburgueria', icon: 'Sandwich' },
  { id: 'pizzaria', label: 'Pizzaria & Forno', icon: 'Pizza' },
  { id: 'comida_japonesa', label: 'Culinária Japonesa & Sushi', icon: 'Fish' },
  { id: 'mercadinho_emporio', label: 'Mercadinho & Empório', icon: 'ShoppingCart' },
  { id: 'petshop', label: 'Pet Shop & Ração', icon: 'Dog' },
  { id: 'tabacaria', label: 'Tabacaria & Lounge', icon: 'Flame' },
  { id: 'cosmeticos_farmacia', label: 'Cosméticos & Beleza', icon: 'Sparkles' },
  { id: 'pesqueiro', label: 'Pesqueiro & Porções de Peixe', icon: 'Fish' },
  { id: 'pastelaria', label: 'Pastelaria & Caldo de Cana', icon: 'UtensilsCrossed' },
  { id: 'loja_roupas', label: 'Loja de Roupas & Moda', icon: 'ShoppingBag' },
  { id: 'sorveteria', label: 'Sorveteria & Açaí', icon: 'Sparkles' },
  { id: 'padaria', label: 'Padaria & Confeitaria', icon: 'Store' },
  { id: 'casa_bolos', label: 'Casa de Bolos & Tortas', icon: 'Sparkles' },
  { id: 'salgaderia', label: 'Salgaderia & Salgados de Festa', icon: 'UtensilsCrossed' },
  { id: 'acougue', label: 'Açougue & Casa de Carnes', icon: 'Flame' },
  { id: 'hortifruti', label: 'Hortifrúti & Quitanda', icon: 'ShoppingCart' },
  { id: 'agua_gas', label: 'Água Mineral & Gás', icon: 'Boxes' },
  { id: 'cafeteria', label: 'Cafeteria & Bistrô', icon: 'Store' },
  { id: 'farmacia', label: 'Farmácia & Drogaria', icon: 'Sparkles' },
];

export const STORE_WALLPAPERS: StoreWallpaper[] = [
  // ==========================================
  // 🍷 1. ADEGA & DISTRIBUIDORA DE BEBIDAS (6 IMAGENS)
  // ==========================================
  {
    id: 'adega_1_barris_vinhos',
    category: 'adega',
    title: 'Adega Clássica Iluminada',
    subtitle: 'Barris de carvalho, vinhos finos e iluminação âmbar aconchegante',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'adega_2_cervejas_gelo',
    category: 'adega',
    title: 'Cervejas Artesanais no Gelo',
    subtitle: 'Garrafas e latas super geladas trincando com gotas d\'água',
    url: 'https://images.unsplash.com/photo-1608270199042-3a3111f19812?auto=format&fit=crop&w=1200&q=80',
    tag: 'Super Geladas',
  },
  {
    id: 'adega_3_destilados_drinks',
    category: 'adega',
    title: 'Balcão de Destilados & Drinks',
    subtitle: 'Coquetéis premium, whisky importado, gin e taças de cristal',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
    tag: 'Combos & Kits',
  },
  {
    id: 'adega_4_chopp_artesanal',
    category: 'adega',
    title: 'Torneiras de Chopp & Caneca Suada',
    subtitle: 'Chopeira profissional com colarinho cremoso super gelado',
    url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80',
    tag: 'Choperia',
  },
  {
    id: 'adega_5_whisky_bourbon',
    category: 'adega',
    title: 'Whisky Bourbon On The Rocks',
    subtitle: 'Whisky envelhecido com gelo lapidado em lounge sofisticado',
    url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Whiskies Nobres',
  },
  {
    id: 'adega_6_distribuidora_leds',
    category: 'adega',
    title: 'Distribuidora Moderna com LEDs',
    subtitle: 'Prateleiras iluminadas com garrafas coloridas, destilados e energéticos',
    url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80',
    tag: 'Distribuidora 24h',
  },

  // ==========================================
  // 🍔 2. RESTAURANTE, LANCHONETE & HAMBÚRGUER (6 IMAGENS)
  // ==========================================
  {
    id: 'restaurante_1_burger_cheddar',
    category: 'restaurante_lanchonete',
    title: 'Burger Artesanal & Queijo Cheddar',
    subtitle: 'Hambúrguer suculento no pão brioche com bacon crocante e queijo derretido',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'restaurante_2_smash_fritas',
    category: 'restaurante_lanchonete',
    title: 'Smash Burger & Batata Frita Crocante',
    subtitle: 'Combos irresistíveis com batata rústica, molho da casa e refrigerante',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    tag: 'Smash Burger',
  },
  {
    id: 'restaurante_3_burger_duplo_bacon',
    category: 'restaurante_lanchonete',
    title: 'Burger Duplo Gourmet com Bacon',
    subtitle: 'Dois blends bovinos suculentos com cebola caramelizada e barbecue',
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
    tag: 'Burger Artesanal',
  },
  {
    id: 'restaurante_4_porcoes_petiscos',
    category: 'restaurante_lanchonete',
    title: 'Porções & Petiscos de Boteco',
    subtitle: 'Batata frita com cheddar e bacon, anéis de cebola e tulipas de frango',
    url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
    tag: 'Porções & Fritas',
  },
  {
    id: 'restaurante_5_batatas_rusticas',
    category: 'restaurante_lanchonete',
    title: 'Batatas Rústicas com Alecrim & Molhos',
    subtitle: 'Aperitivos dourados crocantes por fora e macios por dentro',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80',
    tag: 'Aperitivos',
  },
  {
    id: 'restaurante_6_hotdog_artesanal',
    category: 'restaurante_lanchonete',
    title: 'Hot Dog Prensado Especial',
    subtitle: 'Pão macio com salsicha especial, purê, vinagrete, milho e batata palha',
    url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Lanches & Dogs',
  },

  // ==========================================
  // 🍕 3. PIZZARIA & ESFIHARIA (6 IMAGENS)
  // ==========================================
  {
    id: 'pizzaria_1_forno_lenha',
    category: 'pizzaria',
    title: 'Pizza Forno a Lenha & Queijo Puxa',
    subtitle: 'Massa artesanal assada na brasa com queijo borbulhante e manjericão fresco',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    tag: 'Forno a Lenha',
  },
  {
    id: 'pizzaria_2_calabresa',
    category: 'pizzaria',
    title: 'Pizza Calabresa Especial & Bordas Recheadas',
    subtitle: 'Calabresa fatiada fininha com cebola roxa, azeitonas e borda vulcão',
    url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1200&q=80',
    tag: 'Tradicional',
  },
  {
    id: 'pizzaria_3_fatia_queijo',
    category: 'pizzaria',
    title: 'Fatia Napolitana com Queijo Puxando',
    subtitle: 'Massa de fermentação lenta com molho de tomate italiano e mozzarella',
    url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80',
    tag: 'Artesanal',
  },
  {
    id: 'pizzaria_4_esfihas_abertas',
    category: 'pizzaria',
    title: 'Esfihas Abertas & Massa Fresca Dourada',
    subtitle: 'Esfihas douradas quentinhas de carne moída temperada, queijo e frango c/ catupiry',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Esfiharia',
  },
  {
    id: 'pizzaria_5_pizzaiolo_preparo',
    category: 'pizzaria',
    title: 'Pizzaiolo Abrindo Massa no Mármore',
    subtitle: 'Tradição italiana artesanal com farinha especial e preparo manual',
    url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Massa Fresca',
  },
  {
    id: 'pizzaria_6_margherita_fresca',
    category: 'pizzaria',
    title: 'Pizza Margherita com Manjericão e Tomate',
    subtitle: 'Sabor clássico italiano com azeite de oliva extra virgem e folhas frescas',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gourmet',
  },

  // ==========================================
  // 🍣 4. COMIDA JAPONESA & SUSHI BAR (6 IMAGENS)
  // ==========================================
  {
    id: 'japonesa_1_sushi_bar',
    category: 'comida_japonesa',
    title: 'Sushi Bar Contemporâneo & Peixes Nobres',
    subtitle: 'Bancada escura sofisticada com sushis artesanais e iluminação oriental intimista',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'japonesa_2_barca_salmao',
    category: 'comida_japonesa',
    title: 'Barca de Salmão & Sashimis Selecionados',
    subtitle: 'Apresentação nobre em barca de madeira com fatias frescas de salmão e niguiris',
    url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
    tag: 'Barcas & Combinados',
  },
  {
    id: 'japonesa_3_temaki_crocante',
    category: 'comida_japonesa',
    title: 'Temakis Artesanais & Nori Crocante',
    subtitle: 'Cones recheados com salmão fresco em cubos, cream cheese e cebolinha',
    url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1200&q=80',
    tag: 'Temakeria',
  },
  {
    id: 'japonesa_4_hot_roll_tare',
    category: 'comida_japonesa',
    title: 'Hot Rolls Crocantes com Molho Tarê',
    subtitle: 'Sushis empanados dourados com farinha panko, tarê brilhante e gergelim tostado',
    url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hot Rolls',
  },
  {
    id: 'japonesa_5_poke_bowl',
    category: 'comida_japonesa',
    title: 'Poke Bowl Colorido de Salmão & Frutas',
    subtitle: 'Tigela oriental leve com shari, manga fresca, sunomono e gergelim',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pokes & Fresh',
  },
  {
    id: 'japonesa_6_niguiris_tradicionais',
    category: 'comida_japonesa',
    title: 'Niguiris & Combinados Tradicionais',
    subtitle: 'Salmão selado com maçarico, azeite trufado e arroz temperado no ponto exato',
    url: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Niguiris Especiais',
  },

  // ==========================================
  // 🛒 5. MERCADINHO & EMPÓRIO (6 IMAGENS)
  // ==========================================
  {
    id: 'mercadinho_1_prateleiras',
    category: 'mercadinho_emporio',
    title: 'Mercearia & Prateleiras de Alimentos',
    subtitle: 'Produtos de consumo diário, cereais, matinais e despensa completa',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'mercadinho_2_queijos_frios',
    category: 'mercadinho_emporio',
    title: 'Empório de Queijos, Frios & Vinhos',
    subtitle: 'Cortes selecionados de queijos artesanais, embutidos e antepastos nobres',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80',
    tag: 'Empório & Frios',
  },
  {
    id: 'mercadinho_3_corredores',
    category: 'mercadinho_emporio',
    title: 'Supermercado & Corredores Organizados',
    subtitle: 'Ambiente amplo, limpo e abastecido para compras do mês e do dia a dia',
    url: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Conveniência',
  },
  {
    id: 'mercadinho_4_graos_temperos',
    category: 'mercadinho_emporio',
    title: 'Empório de Grãos, Especiarias & Azeites',
    subtitle: 'Castanhas, temperos naturais, grãos a granel e azeites nobres',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gourmet & Grãos',
  },
  {
    id: 'mercadinho_5_cesta_compras',
    category: 'mercadinho_emporio',
    title: 'Cesta de Compras & Despensa Básica',
    subtitle: 'Arroz, feijão, café, óleo e todos os itens de primeira necessidade',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Despensa Completa',
  },
  {
    id: 'mercadinho_6_itens_dia_a_dia',
    category: 'mercadinho_emporio',
    title: 'Mercadinho de Bairro com Tudo Perto',
    subtitle: 'Atendimento ágil de vizinhança com os principais produtos essenciais',
    url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mercadinho de Bairro',
  },

  // ==========================================
  // 🐾 6. PET SHOP & CASA DE RAÇÃO (6 IMAGENS)
  // ==========================================
  {
    id: 'petshop_1_cachorro_feliz',
    category: 'petshop',
    title: 'Pet Shop Amigo & Cães Saudáveis',
    subtitle: 'Cachorrinho alegre com brinquedos, ração nutritiva e muito carinho',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Popular',
  },
  {
    id: 'petshop_2_gato_cuidados',
    category: 'petshop',
    title: 'Gatos & Cuidados Especiais',
    subtitle: 'Nutrição premium, arranhadores, areias higiênicas e sachês para felinos',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    tag: 'Felinos',
  },
  {
    id: 'petshop_3_racao_sacos',
    category: 'petshop',
    title: 'Casa da Ração & Sacos Fechados (15kg/20kg)',
    subtitle: 'Alimentação completa com marcas premium para cães e gatos de todos os portes',
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Rações por Saco',
  },
  {
    id: 'petshop_4_filhotes_brinquedos',
    category: 'petshop',
    title: 'Filhotes Brincalhões & Nutrição Inicial',
    subtitle: 'Rações especiais para filhotes, vitaminas, mamadeiras e petiscos macios',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Filhotes & Brinquedos',
  },
  {
    id: 'petshop_5_banho_tosa',
    category: 'petshop',
    title: 'Banho, Tosa & Estética Animal',
    subtitle: 'Shampoos veterinários, perfumes pet, escovação e cuidados de higiene',
    url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80',
    tag: 'Banho & Tosa',
  },
  {
    id: 'petshop_6_acessorios_saude',
    category: 'petshop',
    title: 'Farmácia Veterinária & Coleiras',
    subtitle: 'Antipulgas, vermífugos, caminhas confortáveis e peitorais seguros',
    url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Acessórios & Saúde',
  },

  // ==========================================
  // 💨 7. TABACARIA & LOUNGE (6 IMAGENS)
  // ==========================================
  {
    id: 'tabacaria_1_hookah_lounge',
    category: 'tabacaria',
    title: 'Narguilé Hookah & Lounge Noturno',
    subtitle: 'Narguilés completos, roshs artesanais e ambiente acolhedor com fumaça densa',
    url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hookah Lounge',
  },
  {
    id: 'tabacaria_2_charutos_cubanos',
    category: 'tabacaria',
    title: 'Charutos Feitos à Mão & Caixas de Cedro',
    subtitle: 'Charutos importados, umidores profissionais, cortadores e maçaricos nobres',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    tag: 'Charutos Nobres',
  },
  {
    id: 'tabacaria_3_sedas_headshop',
    category: 'tabacaria',
    title: 'Sedas, Dichavadores & Headshop',
    subtitle: 'Sedas brown, filtros de vidro, piteiras e acessórios completos para fumo',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    tag: 'Headshop',
  },
  {
    id: 'tabacaria_4_lounge_neon',
    category: 'tabacaria',
    title: 'Lounge Moderno com Iluminação Neon',
    subtitle: 'Espaço descontraído para curtir com os amigos e apreciar novos sabores',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    tag: 'Lounge Noturno',
  },
  {
    id: 'tabacaria_5_essencias_carvao',
    category: 'tabacaria',
    title: 'Essências Premium & Carvão de Coco',
    subtitle: 'Linhas completas de essências importadas, mentolados e carvões ecológicos',
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    tag: 'Essências & Carvão',
  },
  {
    id: 'tabacaria_6_tabaco_cachimbo',
    category: 'tabacaria',
    title: 'Tabaco Orgânico & Cachimbos Clássicos',
    subtitle: 'Blends de tabacos suaves, piteiras artesanais e isqueiros zippo',
    url: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1200&q=80',
    tag: 'Tabaco Especial',
  },

  // ==========================================
  // ✨ 8. COSMÉTICOS, PERFUMARIA & BELEZA (6 IMAGENS)
  // ==========================================
  {
    id: 'cosmeticos_1_perfumes_luxo',
    category: 'cosmeticos_farmacia',
    title: 'Perfumaria Importada & Fragrâncias Finas',
    subtitle: 'Frascos luxuosos de perfumes marcantes, colônias e essências importadas',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Perfumaria',
  },
  {
    id: 'cosmeticos_2_maquiagem_pinceis',
    category: 'cosmeticos_farmacia',
    title: 'Maquiagem Profissional, Batons & Pincéis',
    subtitle: 'Bases aveludadas, sombras pigmentadas, batons matte e kits de pincéis',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
    tag: 'Maquiagem',
  },
  {
    id: 'cosmeticos_3_skincare_serum',
    category: 'cosmeticos_farmacia',
    title: 'Skincare, Séruns & Tratamento Facial',
    subtitle: 'Rotina de cuidados diários com ácido hialurônico, vitamina C e protetor solar',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    tag: 'Skincare Facial',
  },
  {
    id: 'cosmeticos_4_linha_capilar',
    category: 'cosmeticos_farmacia',
    title: 'Tratamento Capilar & Salão de Beleza',
    subtitle: 'Shampoos profissionais, máscaras de hidratação intensa e óleos nutritivos',
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cabelos & Salão',
  },
  {
    id: 'cosmeticos_5_estetica_corporal',
    category: 'cosmeticos_farmacia',
    title: 'Cosméticos Corporais & Hidratantes',
    subtitle: 'Loções corporais perfumadas, esfoliantes naturais e sabonetes artesanais',
    url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Corpo & Banho',
  },
  {
    id: 'cosmeticos_6_boutique_beleza',
    category: 'cosmeticos_farmacia',
    title: 'Boutique de Cosméticos & Bem-Estar',
    subtitle: 'Ambiente aconchegante com produtos de autocuidado e beleza feminina',
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
    tag: 'Auto-Cuidado',
  },

  // ==========================================
  // 🐟 9. PESQUEIRO, PORÇÕES & RESTAURANTE (6 IMAGENS)
  // ==========================================
  {
    id: 'pesqueiro_1_tilapia_crocante',
    category: 'pesqueiro',
    title: 'Porção de Tilápia Crocante com Limão',
    subtitle: 'Iscas de tilápia empanadas e sequinhas com molho tártaro artesanal',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'pesqueiro_2_lago_natureza',
    category: 'pesqueiro',
    title: 'Pesqueiro & Natureza com Lagos Espelhados',
    subtitle: 'Ambiente tranquilo ao ar livre para pesca esportiva e lazer em família',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pesqueiro & Lazer',
  },
  {
    id: 'pesqueiro_3_varas_pesca',
    category: 'pesqueiro',
    title: 'Equipamentos de Pesca & Iscas Vivas',
    subtitle: 'Varas, molinetes, cevas, anzóis e tudo para a pescaria perfeita',
    url: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pesca Esportiva',
  },
  {
    id: 'pesqueiro_4_iscas_fritas',
    category: 'pesqueiro',
    title: 'Porções de Lambari & Camarão Frito',
    subtitle: 'Petiscos saborosos de água doce servidos na tábua com limão taiti',
    url: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=1200&q=80',
    tag: 'Porções & Peixes',
  },
  {
    id: 'pesqueiro_5_peixe_assado',
    category: 'pesqueiro',
    title: 'Peixe Assado na Brasa com Legumes',
    subtitle: 'Pratos à la carte com peixes nobres grelhados na hora',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pratos Nobres',
  },
  {
    id: 'pesqueiro_6_quiosques_lazer',
    category: 'pesqueiro',
    title: 'Quiosques Beira-Lago & Almoço Caipira',
    subtitle: 'Mesas cobertas para passar o dia pescando e almoçando com a família',
    url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Restaurante Caipira',
  },

  // ==========================================
  // 🥟 10. PASTELARIA & CALDO DE CANA (6 IMAGENS)
  // ==========================================
  {
    id: 'pastelaria_1_pastel_dourado',
    category: 'pastelaria',
    title: 'Pastel de Feira Dourado e Crocante',
    subtitle: 'Massa crocante estalando com bolhas douradas e recheio generoso',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'pastelaria_2_caldo_cana',
    category: 'pastelaria',
    title: 'Caldo de Cana Natural com Limão',
    subtitle: 'Garapa moída na hora super gelada com gotas de limão ou abacaxi',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Caldo de Cana',
  },
  {
    id: 'pastelaria_3_pastel_queijo',
    category: 'pastelaria',
    title: 'Pastel de Queijo com Queijo Puxando',
    subtitle: 'Muçarela derretida farta com massa sequinha e sabor inconfundível',
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Queijo Puxa',
  },
  {
    id: 'pastelaria_4_combo_pastel_caldo',
    category: 'pastelaria',
    title: 'Combo Tradicional: Pastelão & Caldo',
    subtitle: 'A combinação brasileira perfeita para o lanche da tarde ou domingo',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Combo Perfeito',
  },
  {
    id: 'pastelaria_5_fritura_hora',
    category: 'pastelaria',
    title: 'Fritura Artesanal na Hora',
    subtitle: 'Pastéis montados no momento do pedido e fritos em óleo limpo e quente',
    url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
    tag: 'Frito na Hora',
  },
  {
    id: 'pastelaria_6_recheios_especiais',
    category: 'pastelaria',
    title: 'Pastéis Especiais com Carne Seca & Catupiry',
    subtitle: 'Pastéis doces de Nutella com morango e pastéis gourmet recheadíssimos',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pastéis Especiais',
  },

  // ==========================================
  // 👗 11. LOJA DE ROUPAS & MODA (6 IMAGENS)
  // ==========================================
  {
    id: 'loja_roupas_1_araras',
    category: 'loja_roupas',
    title: 'Araras de Roupas & Coleção Nova',
    subtitle: 'Peças exclusivas organizadas por cores, estampas e tecidos premium',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Coleção Nova',
  },
  {
    id: 'loja_roupas_2_vitrine_moda',
    category: 'loja_roupas',
    title: 'Vitrine de Moda & Tendências Atuais',
    subtitle: 'Manequins estilosos com combinações modernas para todas as estações',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Tendências',
  },
  {
    id: 'loja_roupas_3_peças_dobradas',
    category: 'loja_roupas',
    title: 'Peças Selecionadas & Malhas Finas',
    subtitle: 'Camisetas em algodão egípcio, calças jeans, blazers e vestidos leves',
    url: 'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Qualidade Premium',
  },
  {
    id: 'loja_roupas_4_boutique_elegante',
    category: 'loja_roupas',
    title: 'Boutique Elegante de Vestuário',
    subtitle: 'Espaço requintado para moda feminina, masculina e moda íntima',
    url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Boutique Fashion',
  },
  {
    id: 'loja_roupas_5_looks_completos',
    category: 'loja_roupas',
    title: 'Looks Completos & Estilo Fashion',
    subtitle: 'Roupas casuais, moda fitness e trajes para eventos com muito charme',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Looks Prontos',
  },
  {
    id: 'loja_roupas_6_moda_casual',
    category: 'loja_roupas',
    title: 'Moda Casual & Linha Conforto',
    subtitle: 'Roupas leves, peças em linho e jeans versáteis para o dia a dia',
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    tag: 'Moda Casual',
  },

  // ==========================================
  // 🍨 12. SORVETERIA & AÇAÍ (6 IMAGENS)
  // ==========================================
  {
    id: 'sorveteria_1_casquinha_bolas',
    category: 'sorveteria',
    title: 'Sorvete Cremoso em Casquinhas Crocantes',
    subtitle: 'Bolas generosas de sorvete de chocolate, morango e baunilha com calda',
    url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'sorveteria_2_acai_frutas',
    category: 'sorveteria',
    title: 'Açaí na Tigela com Banana e Granola',
    subtitle: 'Açaí puro super cremoso com leite em pó, morangos e leite condensado',
    url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=80',
    tag: 'Açaí na Tigela',
  },
  {
    id: 'sorveteria_3_gelato_vitrine',
    category: 'sorveteria',
    title: 'Vitrine de Gelato Italiano Artesanal',
    subtitle: 'Cores vibrantes e sabores autênticos de frutas, pistache e doce de leite',
    url: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gelato Italiano',
  },
  {
    id: 'sorveteria_4_taca_sundae',
    category: 'sorveteria',
    title: 'Taça de Sundae com Calda de Chocolate',
    subtitle: 'Sobremesa clássica com chantilly, castanhas e calda quente',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Taças Especiais',
  },
  {
    id: 'sorveteria_5_picoles_artesanais',
    category: 'sorveteria',
    title: 'Picolés Gourmet & Frutas Naturais',
    subtitle: 'Paletas recheadas, picolés de fruta e delícias geladas refrescantes',
    url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Picolés & Paletas',
  },
  {
    id: 'sorveteria_6_milkshake_cremoso',
    category: 'sorveteria',
    title: 'Milk-Shakes Cremosos com Chantilly',
    subtitle: 'Batidos com sorvete de verdade, pedaços de cookies e caldas irresistíveis',
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80',
    tag: 'Milk-Shakes',
  },

  // ==========================================
  // 🥖 13. PADARIA & CONFEITARIA (6 IMAGENS)
  // ==========================================
  {
    id: 'padaria_1_paes_franceses',
    category: 'padaria',
    title: 'Pães Franceses Quentinhos da Fornada',
    subtitle: 'Crostinha crocante dourada com miolo macio saindo do forno a todo momento',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    tag: 'Pão Quentinho',
  },
  {
    id: 'padaria_2_paes_artesanais',
    category: 'padaria',
    title: 'Pães Artesanais de Fermentação Natural',
    subtitle: 'Baguetes francesas, pão rústico de nozes e foccacias aromáticas',
    url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=80',
    tag: 'Fermentação Natural',
  },
  {
    id: 'padaria_3_croissant_folhado',
    category: 'padaria',
    title: 'Croissants Folhados & Pão de Queijo',
    subtitle: 'Massa folhada amanteigada crocante com recheios doces e salgados',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
    tag: 'Croissants',
  },
  {
    id: 'padaria_4_balcao_confeitaria',
    category: 'padaria',
    title: 'Doces Tradicionais, Sonhos e Folhados',
    subtitle: 'Sonhos recheados com creme de baunilha, carolinas, mil-folhas e tortinhas',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    tag: 'Confeitaria Fina',
  },
  {
    id: 'padaria_5_padeiro_artesanal',
    category: 'padaria',
    title: 'Preparo Artesanal com Amor e Farinha Especial',
    subtitle: 'Tradição da panificação artesanal com fermentação lenta e receitas clássicas',
    url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Padeiro Artesanal',
  },
  {
    id: 'padaria_6_pao_queijo_cafe',
    category: 'padaria',
    title: 'Pão de Queijo Mineiro & Café com Leite',
    subtitle: 'A combinação mais querida do café da manhã brasileiro quentinha na mesa',
    url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80',
    tag: 'Café da Manhã',
  },

  // ==========================================
  // 🎂 14. CASA DE BOLOS CASEIROS & TORTAS (6 IMAGENS)
  // ==========================================
  {
    id: 'casa_bolos_1_chocolate_vulcao',
    category: 'casa_bolos',
    title: 'Bolo de Chocolate com Calda Vulcão',
    subtitle: 'Massa úmida e fofinha coberta com brigadeiro cremoso e raspas de chocolate',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'casa_bolos_2_red_velvet',
    category: 'casa_bolos',
    title: 'Bolo Red Velvet com Frutas Vermelhas',
    subtitle: 'Camadas aveludadas de bolo com recheio de cream cheese e morangos frescos',
    url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Red Velvet',
  },
  {
    id: 'casa_bolos_3_caseiro_vovo',
    category: 'casa_bolos',
    title: 'Bolo Caseiro Fofo da Vovó',
    subtitle: 'Bolo de cenoura com chocolate, fubá cremoso, milho e laranja com calda',
    url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bolos Caseiros',
  },
  {
    id: 'casa_bolos_4_torta_morango',
    category: 'casa_bolos',
    title: 'Tortas Doces com Morangos Frescos',
    subtitle: 'Torta de limão com merengue tostado, torta holandesa e morango com chantilly',
    url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80',
    tag: 'Tortas Doces',
  },
  {
    id: 'casa_bolos_5_bolo_aniversario',
    category: 'casa_bolos',
    title: 'Bolos Decorados para Festas e Eventos',
    subtitle: 'Bolos de aniversário temáticos, recheios trufados e acabamento impecável',
    url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bolos de Festa',
  },
  {
    id: 'casa_bolos_6_fatias_cafe',
    category: 'casa_bolos',
    title: 'Fatias de Bolo com Café da Tarde',
    subtitle: 'O acompanhamento perfeito para o café com a família e encontros especiais',
    url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1200&q=80',
    tag: 'Café da Tarde',
  },

  // ==========================================
  // 🥟 15. SALGADERIA & SALGADOS DE FESTA (6 IMAGENS)
  // ==========================================
  {
    id: 'salgaderia_1_coxinhas_frango',
    category: 'salgaderia',
    title: 'Coxinhas Douradas com Catupiry',
    subtitle: 'Casquinha super crocante com recheio cremoso de frango desfiado temperado',
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'salgaderia_2_cento_festas',
    category: 'salgaderia',
    title: 'Cento de Salgadinhos de Festa Variados',
    subtitle: 'Bolinhas de queijo, kibes, coxinhas, risoles de palmito e croquetes de carne',
    url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cento de Salgados',
  },
  {
    id: 'salgaderia_3_salgados_assados',
    category: 'salgaderia',
    title: 'Salgados Assados, Esfihas e Empadas',
    subtitle: 'Empadas que derretem na boca, folhados de presunto e queijo e esfihas macias',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80',
    tag: 'Assados Especiais',
  },
  {
    id: 'salgaderia_4_kibes_recheados',
    category: 'salgaderia',
    title: 'Kibes Crocantes com Recheio de Queijo',
    subtitle: 'Kibe frito artesanal com hortelã fresca e recheio cremoso de queijo puxa',
    url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
    tag: 'Kibes Recheados',
  },
  {
    id: 'salgaderia_5_coxinha_gigante',
    category: 'salgaderia',
    title: 'Coxinha Gigante de Lanchonete',
    subtitle: 'A clássica coxinha de balcão com massa de batata fofinha e muito recheio',
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
    tag: 'Coxinha Gigante',
  },
  {
    id: 'salgaderia_6_fritura_quentinha',
    category: 'salgaderia',
    title: 'Bandejas de Salgados Fritos na Hora',
    subtitle: 'Salgadinhos sequinhos e crocantes prontos para servir em qualquer comemoração',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tag: 'Fritos na Hora',
  },

  // ==========================================
  // 🥩 16. AÇOUGUE & CASA DE CARNES (6 IMAGENS)
  // ==========================================
  {
    id: 'acougue_1_picanha_churrasco',
    category: 'acougue',
    title: 'Picanha Nobre & Cortes de Churrasco',
    subtitle: 'Picanha com capa de gordura perfeita, fatiada para a grelha e sal grosso',
    url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'acougue_2_bife_ancho',
    category: 'acougue',
    title: 'Bife Ancho Marmorizado & Prime Rib',
    subtitle: 'Cortes nobres com alto nível de marmoreio para suculência extrema no fogo',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cortes Nobres',
  },
  {
    id: 'acougue_3_balcao_carnes',
    category: 'acougue',
    title: 'Casa de Carnes & Balcão Selecionado',
    subtitle: 'Carnes frescas abatidas no padrão higiênico rigoroso com cortes sob medida',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
    tag: 'Carnes Frescas',
  },
  {
    id: 'acougue_4_linguicas_artesanais',
    category: 'acougue',
    title: 'Linguiças Artesanais e Espetos Prontos',
    subtitle: 'Linguiça toscana apimentada, pernil recheado com queijo coalho e espetinhos',
    url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80',
    tag: 'Linguiças & Espetos',
  },
  {
    id: 'acougue_5_costela_brasa',
    category: 'acougue',
    title: 'Costela Bovina na Brasa',
    subtitle: 'Costela de ripa e ponta de agulha suculentas para assar devagar no braseiro',
    url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80',
    tag: 'Costela no Bafo',
  },
  {
    id: 'acougue_6_boutique_dryaged',
    category: 'acougue',
    title: 'Boutique de Carnes Especiais & Dry Aged',
    subtitle: 'Carnes maturadas e cortes especiais para quem ama alta gastronomia de carnes',
    url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80',
    tag: 'Boutique de Carnes',
  },

  // ==========================================
  // 🍎 17. HORTIFRÚTI, QUITANDA & SACOLÃO (6 IMAGENS)
  // ==========================================
  {
    id: 'hortifruti_1_frutas_coloridas',
    category: 'hortifruti',
    title: 'Bancas de Frutas Frescas e Selecionadas',
    subtitle: 'Maçãs, bananas, laranjas, uvas doces e mangas frescas do produtor à sua mesa',
    url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'hortifruti_2_verduras_frescas',
    category: 'hortifruti',
    title: 'Verduras e Folhas Frescas Orgânicas',
    subtitle: 'Alfaces crespas, rúculas crocantes, espinafre e couve colhidos fresquinhos',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    tag: 'Verduras do Dia',
  },
  {
    id: 'hortifruti_3_legumes_variados',
    category: 'hortifruti',
    title: 'Legumes Frescos: Tomates, Cenouras & Batatas',
    subtitle: 'Cores vivas e nutrientes essenciais para preparar receitas saudáveis e saborosas',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=1200&q=80',
    tag: 'Legumes Frescos',
  },
  {
    id: 'hortifruti_4_cesta_tropicais',
    category: 'hortifruti',
    title: 'Cesta de Frutas Tropicais da Estação',
    subtitle: 'Abacaxis doces, melancias refrescantes, mamões e maracujás perfumados',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',
    tag: 'Frutas da Estação',
  },
  {
    id: 'hortifruti_5_sacolao_bairro',
    category: 'hortifruti',
    title: 'Sacolão de Bairro com Qualidade e Economia',
    subtitle: 'Preços justos e reposição diária para o feirante e para a dona de casa',
    url: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=1200&q=80',
    tag: 'Sacolão do Bairro',
  },
  {
    id: 'hortifruti_6_temperos_ervas',
    category: 'hortifruti',
    title: 'Temperos, Ervas Frescas e Grãos Naturais',
    subtitle: 'Cheiro-verde, manjericão, alecrim, hortelã e alho de qualidade superior',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Temperos Naturais',
  },

  // ==========================================
  // 💧 18. ÁGUA MINERAL & GÁS DE COZINHA (6 IMAGENS)
  // ==========================================
  {
    id: 'agua_gas_1_galoes_20l',
    category: 'agua_gas',
    title: 'Galões de Água Mineral 20L Cristalinos',
    subtitle: 'Água pura da fonte mineral em galões retornáveis higienizados e lacrados',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Pedido',
  },
  {
    id: 'agua_gas_2_botijoes_p13',
    category: 'agua_gas',
    title: 'Botijões de Gás de Cozinha P13 Oficiais',
    subtitle: 'Gás de cozinha certificado com garantia de peso e segurança para sua família',
    url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gás de Cozinha P13',
  },
  {
    id: 'agua_gas_3_fardos_garrafas',
    category: 'agua_gas',
    title: 'Fardos de Água Mineral em Garrafinhas (500ml/1.5L)',
    subtitle: 'Água com e sem gás para eventos, empresas, comércios e consumo em casa',
    url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80',
    tag: 'Fardos de Água',
  },
  {
    id: 'agua_gas_4_agua_pura_fonte',
    category: 'agua_gas',
    title: 'Água Mineral Pura da Fonte com Minerais',
    subtitle: 'Hidratação saudável e frescor garantido para o bem-estar da sua família',
    url: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=1200&q=80',
    tag: 'Água Cristalina',
  },
  {
    id: 'agua_gas_5_entrega_rapida',
    category: 'agua_gas',
    title: 'Entrega Rápida de Gás e Água em Domicílio',
    subtitle: 'Atendimento expresso de motoboy para não deixar seu almoço esperando',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    tag: 'Entrega Rápida',
  },
  {
    id: 'agua_gas_6_distribuidora_cascos',
    category: 'agua_gas',
    title: 'Distribuidora Autorizada com Cascos Prontos',
    subtitle: 'Venda de botijão completo, cascos vazios, reguladores e mangueiras de gás',
    url: 'https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gás & Acessórios',
  },

  // ==========================================
  // ☕ 19. CAFETERIA, BISTRÔ & CASA DE CHÁ (6 IMAGENS)
  // ==========================================
  {
    id: 'cafeteria_1_espresso_latte',
    category: 'cafeteria',
    title: 'Café Espresso & Latte Art Cremoso',
    subtitle: 'Xícara aquecida com espresso encorpado e desenho delicado no leite vaporizado',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'cafeteria_2_graos_especiais',
    category: 'cafeteria',
    title: 'Grãos de Café Especiais Torrados',
    subtitle: 'Cafés 100% arábica com notas de chocolate, caramelo e frutas amarelas',
    url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Grãos Nobres',
  },
  {
    id: 'cafeteria_3_ambiente_bistro',
    category: 'cafeteria',
    title: 'Ambiente Confortável de Cafeteria & Bistrô',
    subtitle: 'Mesas de madeira acolhedoras para trabalhar, ler um livro ou conversar',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bistrô Aconchegante',
  },
  {
    id: 'cafeteria_4_cafe_gelado_frappe',
    category: 'cafeteria',
    title: 'Cafés Gelados, Frappés e Doces',
    subtitle: 'Iced lattes cremosos, frappuccinos com calda de caramelo e chantilly',
    url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cafés Gelados',
  },
  {
    id: 'cafeteria_5_brunch_croissant',
    category: 'cafeteria',
    title: 'Brunch Especial com Croissant e Café',
    subtitle: 'Tostas de abacate com ovo pochê, croissants amanteigados e sucos naturais',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    tag: 'Brunch Especial',
  },
  {
    id: 'cafeteria_6_maquina_barista',
    category: 'cafeteria',
    title: 'Barista Extraindo Espresso Nobre',
    subtitle: 'Técnica e precisão na extração de cafés filtrados e bebidas especiais',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Café de Barista',
  },

  // ==========================================
  // 💊 20. FARMÁCIA, DROGARIA & CUIDADOS (6 IMAGENS)
  // ==========================================
  {
    id: 'farmacia_1_prateleiras_drogaria',
    category: 'farmacia',
    title: 'Drogaria & Prateleiras de Cuidados',
    subtitle: 'Produtos de saúde, medicamentos de venda livre, higiene e atendimento cuidadoso',
    url: 'https://images.unsplash.com/photo-1586015555751-63c2c10b7a4f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mais Escolhido',
  },
  {
    id: 'farmacia_2_vitaminas_suplementos',
    category: 'farmacia',
    title: 'Vitaminas, Suplementos & Bem-Estar',
    subtitle: 'Imunidade fortalecida com polivitamínicos, ômega 3, colágeno e minerais',
    url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1200&q=80',
    tag: 'Vitaminas & Saúde',
  },
  {
    id: 'farmacia_3_primeiros_socorros',
    category: 'farmacia',
    title: 'Primeiros Socorros & Cuidados Diários',
    subtitle: 'Curativos, antissépticos, termômetros digitais e itens para emergências domésticas',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    tag: 'Primeiros Socorros',
  },
  {
    id: 'farmacia_4_balcao_atendimento',
    category: 'farmacia',
    title: 'Balcão de Atendimento & Farmacêutico',
    subtitle: 'Orientação profissional atenciosa para a saúde de toda a sua família',
    url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80',
    tag: 'Atenção Farmacêutica',
  },
  {
    id: 'farmacia_5_dermocosmeticos_solar',
    category: 'farmacia',
    title: 'Dermocosméticos & Protetores Solares',
    subtitle: 'Marcas renomadas de proteção solar, hidratação de pele sensível e cuidados',
    url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Dermocosméticos',
  },
  {
    id: 'farmacia_6_mamae_bebe_cuidados',
    category: 'farmacia',
    title: 'Linha Mamãe & Bebê, Fraldas e Higiene',
    subtitle: 'Fraldas confortáveis, lenços umedecidos, pomadas e fórmulas infantis',
    url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mamãe & Bebê',
  },
];

/**
 * Retorna estritamente as 6 imagens do segmento do estabelecimento.
 */
export const getSegmentWallpapers = (segment?: BusinessSegmentType): StoreWallpaper[] => {
  const seg = segment || 'adega';
  const filtered = STORE_WALLPAPERS.filter((w) => w.category === seg);
  if (filtered.length > 0) {
    return filtered.slice(0, 6);
  }
  return STORE_WALLPAPERS.filter((w) => w.category === 'adega').slice(0, 6);
};
