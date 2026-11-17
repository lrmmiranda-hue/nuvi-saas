import React, { useState, useEffect, useMemo } from 'react';
import { Product, CategoryType, ProductPackOption } from '../../types';
import { getSegmentById, getTenantCategories } from '../../data/businessSegments';
import { useStore } from '../../context/StoreContext';
import { CategoryManagerModal } from './CategoryManagerModal';
import { 
  X, 
  Plus, 
  Upload, 
  Search, 
  Package, 
  Clock, 
  UtensilsCrossed, 
  Image as ImageIcon,
  Barcode,
  Boxes,
  Calculator,
  FileText
} from 'lucide-react';

const DEFAULT_PACKS: ProductPackOption[] = [
  { id: 'pack_6', type: 'fardo', unitsCount: 6, label: 'Fardo c/ 6 un', price: 0, barcode: '', enabled: false },
  { id: 'pack_12', type: 'fardo', unitsCount: 12, label: 'Fardo c/ 12 un', price: 0, barcode: '', enabled: false },
  { id: 'pack_18', type: 'fardo', unitsCount: 18, label: 'Fardo c/ 18 un', price: 0, barcode: '', enabled: false },
  { id: 'pack_24', type: 'caixa', unitsCount: 24, label: 'Caixa c/ 24 un', price: 0, barcode: '', enabled: false },
];

/**
 * Determina se a categoria selecionada é uma categoria de bebida (cervejas, vinhos, destilados, combos, refrigerantes/sucos).
 * Se for petiscos, carvão/gelo, acessórios, tabacaria, etc., NÃO deve ter venda em fardos/atacado.
 */
const isBeverageCategory = (categoryId?: string, categoryLabel?: string): boolean => {
  if (!categoryId) return false;
  
  const text = `${categoryId} ${categoryLabel || ''}`.toLowerCase();

  // Categorias que expressamente NÃO são bebidas:
  const nonBeverageList = [
    'petisco', 'snack', 'salgad', 'amendoim', 'batata', 'azeitona', 'queijo', 'frios',
    'gelo', 'carvao', 'carvão', 'acendedor',
    'tabacaria', 'cigarro', 'fumo', 'seda', 'piteira', 'filtro', 'narguile', 'essencia', 'pod', 'vape', 'isqueiro', 'palheiro',
    'acessorio', 'acessório', 'copo', 'taca', 'taça', 'abridor', 'cooler', 'termic', 'térmic', 'caneca', 'balde',
    'doce', 'chocolate', 'bomboniere', 'bala', 'chiclete'
  ];

  if (nonBeverageList.some((kw) => text.includes(kw))) {
    return false;
  }

  // Categorias padrão de bebidas de Adega e palavras-chave de bebidas:
  const beverageList = [
    'cerveja', 'chope', 'chopp', 'vinho', 'espumante', 'destilado', 'whisky', 'whiskey', 
    'vodka', 'gin', 'rum', 'cachaca', 'cachaça', 'tequila', 'licor', 'combo', 'kit',
    'bebida', 'refrigerante', 'suco', 'energetico', 'energético', 'agua', 'água', 
    'sem_alcool', 'refresco', 'ice', 'lata', 'garrafa', 'drink', 'aperitivo'
  ];

  if (beverageList.some((kw) => text.includes(kw))) {
    return true;
  }

  // Categorias de ID fixo da adega que são bebidas
  const standardAdegaBeverages = ['cervejas', 'vinhos', 'destilados', 'combos', 'sem_alcool'];
  if (standardAdegaBeverages.includes(categoryId)) {
    return true;
  }

  return false;
};

/**
 * Determina se a categoria selecionada é expressamente NÃO gastronômica (rações, pets, bebidas industriais, remédios, cosméticos, etc.).
 * Nestes casos, o item NUNCA deve ser considerado receita de cozinha/cardápio artesanal com ingredientes.
 */
const isNonKitchenCategory = (categoryId?: string, categoryLabel?: string): boolean => {
  if (!categoryId) return false;
  const text = `${categoryId} ${categoryLabel || ''}`.toLowerCase();
  
  // Categorias que NUNCA são comida/cardápio de cozinha caseira:
  return (
    text.includes('racao') || text.includes('ração') || text.includes('pet') || text.includes('gato') || 
    text.includes('cao') || text.includes('cão') || text.includes('caes') || text.includes('cães') ||
    text.includes('sache') || text.includes('sachê') || text.includes('medicamento') || text.includes('higiene') || 
    text.includes('acessorio') || text.includes('acessório') || text.includes('cerveja') || text.includes('vinho') || 
    text.includes('destilado') || text.includes('sem_alcool') || text.includes('tabacaria') || text.includes('cosmetico') || 
    text.includes('cosmético') || text.includes('limpeza') || text.includes('mercearia')
  );
};

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'tenantId'>) => void;
  editingProduct?: Product | null;
  defaultCategory?: CategoryType;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}) => {
  const { currentTenant, showAlert, themeMode } = useStore();
  const isLight = themeMode === 'light';

  // Configuração do nicho de comércio do lojista ativo
  const segmentConfig = getSegmentById(currentTenant?.businessSegment || 'adega');
  const isAdega = segmentConfig.id === 'adega';
  
  // REGRA CRÍTICA: Gastronomia artesanal (Pizzaria, Restaurante/Lanchonete, Culinária Japonesa) possuem cardápio caseiro/cozinha!
  // Adega, Pet Shop, Mercadinho, Tabacaria, Cosméticos são focados em mercadorias de estoque.
  const isFoodOrPizza = segmentConfig.id === 'pizzaria' || segmentConfig.id === 'restaurante_lanchonete' || segmentConfig.id === 'comida_japonesa';
  const isBarcodeScannerConfigEnabled = currentTenant?.config?.enableBarcodeScanner ?? (isAdega || currentTenant?.businessSegment === 'mercadinho_emporio');

  // Categorias ativas da loja (somente as com enabled !== false do comércio atual)
  const tenantCategories = useMemo(() => {
    return getTenantCategories(currentTenant).filter((c) => c.enabled !== false);
  }, [currentTenant]);

  const defaultCategory = tenantCategories.length > 0 ? tenantCategories[0].id : 'geral';

  // Somente Lanchonete e Pizzaria podem iniciar ou alternar para 'cardapio'
  const [itemType, setItemType] = useState<'cardapio' | 'mercadoria'>(isFoodOrPizza ? 'cardapio' : 'mercadoria');
  const [ingredients, setIngredients] = useState<string>('');
  const [showManualBarcode, setShowManualBarcode] = useState(false);

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'tenantId'>>({
    name: '',
    barcode: '',
    category: defaultCategory,
    description: '',
    price: 0,
    promoPrice: null,
    costPrice: 0,
    volume: 'Unidade',
    imageUrl: '',
    isChilledAvailable: false,
    inStock: true,
    stockQuantity: 100,
    minStockAlert: 5,
    showInStorefront: true,
    featured: false,
    alcoholContent: '',
    packOptions: DEFAULT_PACKS,
  });

  const [fardoStockInput, setFardoStockInput] = useState<number>(0);
  const [fardoPackSize, setFardoPackSize] = useState<number>(12);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      const existingPacks = editingProduct.packOptions || [];
      const mergedPacks = DEFAULT_PACKS.map(def => {
        const found = existingPacks.find(p => p.unitsCount === def.unitsCount);
        return found ? { ...found } : { ...def };
      });

      // Se NÃO for Pizzaria nem Lanchonete, ou se o produto for expressamente não gastronômico (rações, pets, bebidas industriais, etc.), é 100% OBRIGATÓRIO ser mercadoria de estoque
      const isActuallyNonFood = isNonKitchenCategory(editingProduct.category);
      const initialType = (isFoodOrPizza && !isActuallyNonFood) 
        ? (editingProduct.itemType || 'cardapio') 
        : 'mercadoria';
      setItemType(initialType);
      setIngredients((isFoodOrPizza && !isActuallyNonFood) ? (editingProduct.ingredients || '') : '');

      setFormData({
        name: editingProduct.name,
        barcode: editingProduct.barcode || '',
        category: editingProduct.category,
        description: editingProduct.description || '',
        price: editingProduct.price,
        promoPrice: editingProduct.promoPrice ?? null,
        costPrice: editingProduct.costPrice ?? 0,
        volume: editingProduct.volume || (initialType === 'cardapio' ? 'Tamanho Padrão' : 'Unidade'),
        imageUrl: editingProduct.imageUrl || '',
        isChilledAvailable: editingProduct.isChilledAvailable ?? false,
        inStock: editingProduct.inStock ?? true,
        stockQuantity: editingProduct.stockQuantity ?? 100,
        minStockAlert: editingProduct.minStockAlert ?? 5,
        showInStorefront: editingProduct.showInStorefront !== false,
        featured: editingProduct.featured ?? false,
        alcoholContent: editingProduct.alcoholContent ?? '',
        packOptions: mergedPacks,
      });
    } else {
      const initialType = isFoodOrPizza ? 'cardapio' : 'mercadoria';
      setItemType(initialType);
      setIngredients('');

      setFormData({
        name: '',
        barcode: initialType === 'cardapio' ? '' : `789${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        category: defaultCategory,
        description: '',
        price: 0,
        promoPrice: null,
        costPrice: 0,
        volume: initialType === 'cardapio' 
          ? (segmentConfig.id === 'pizzaria' ? 'Grande 8 Pedaços' : segmentConfig.id === 'comida_japonesa' ? 'Combinado 20 peças' : 'Individual') 
          : segmentConfig.id === 'petshop' ? 'Saco 15kg' : isAdega ? 'Lata 350ml' : 'Unidade',
        imageUrl: '',
        isChilledAvailable: initialType === 'mercadoria' && isAdega,
        inStock: true,
        stockQuantity: initialType === 'cardapio' ? 999 : 50,
        minStockAlert: 5,
        showInStorefront: true,
        featured: false,
        alcoholContent: '',
        packOptions: DEFAULT_PACKS,
      });
    }
  }, [editingProduct, isOpen, isAdega, isFoodOrPizza, defaultCategory, segmentConfig.id]);

  if (!isOpen) return null;

  // Atualiza um fardo/caixa específico
  const handleUpdatePack = (index: number, updates: Partial<ProductPackOption>) => {
    setFormData(prev => {
      const packs = [...(prev.packOptions || DEFAULT_PACKS)];
      packs[index] = { ...packs[index], ...updates };
      return { ...prev, packOptions: packs };
    });
  };

  // Sugerir preço automático para um fardo com desconto
  const handleSuggestPackPrice = (index: number) => {
    const basePrice = formData.price;
    if (basePrice <= 0) {
      showAlert({
        title: 'Preço Unitário Obrigatório',
        message: 'Preencha primeiro o Preço de Venda Unitário da bebida para calcular o preço sugerido do fardo.',
        variant: 'info'
      });
      return;
    }

    const packs = [...(formData.packOptions || DEFAULT_PACKS)];
    const pack = packs[index];
    const discountMultiplier = pack.unitsCount >= 24 ? 0.90 : pack.unitsCount >= 18 ? 0.92 : pack.unitsCount >= 12 ? 0.94 : 0.96;
    const suggested = Number((basePrice * pack.unitsCount * discountMultiplier).toFixed(2));

    handleUpdatePack(index, { price: suggested });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) {
      showAlert({
        title: 'Dados Inválidos',
        message: 'Por favor, informe o nome e um preço de venda válido (maior que zero) para o item.',
        variant: 'warning',
      });
      return;
    }

    // Somente restaurante/lanchonete e pizzaria podem ser cardápio
    const effectiveItemType = isFoodOrPizza ? itemType : 'mercadoria';

    // Fardos e opção gelada são exclusivos para bebidas na adega
    const currentCatObj = tenantCategories.find((c) => c.id === formData.category);
    const isBeverage = isBeverageCategory(formData.category, currentCatObj?.label);
    const allowsPacks = isAdega && effectiveItemType === 'mercadoria' && isBeverage;

    // Para itens caseiros / cardápio, se não tiver código de barras, cria identificador interno automático
    const finalBarcode = effectiveItemType === 'cardapio'
      ? (formData.barcode.trim() || `CARD-${Date.now().toString().slice(-6)}`)
      : (formData.barcode.trim() || `EAN-${Date.now()}`);

    const finalData = {
      ...formData,
      barcode: finalBarcode,
      itemType: effectiveItemType,
      ingredients: effectiveItemType === 'cardapio' ? ingredients.trim() : undefined,
      isChilledAvailable: allowsPacks ? formData.isChilledAvailable : false,
      packOptions: allowsPacks ? formData.packOptions : [],
      stockQuantity: effectiveItemType === 'cardapio' ? 999 : formData.stockQuantity,
    };

    onSave(finalData);
    onClose();
  };

  // Descobre a categoria atual do produto
  const currentCatObj = tenantCategories.find((c) => c.id === formData.category);
  const isBeverage = isBeverageCategory(formData.category, currentCatObj?.label);
  const isNonFood = isNonKitchenCategory(formData.category, currentCatObj?.label);

  // REGRA MÁXIMA: isCardapio SÓ PODE SER TRUE SE FOR pizzaria OU restaurante_lanchonete E a categoria não for industrial/pet/bebida!
  // Para Adega, Pet Shop, Mercadinho, etc., isCardapio é SEMPRE FALSE.
  const isCardapio = isFoodOrPizza && itemType === 'cardapio' && !isNonFood;

  // Fardos de atacado SÓ são permitidos para BEBIDAS na Adega!
  // Se for petiscos, carvão, gelo, tabacaria, acessórios, bomboniere, etc., allowsPacks é FALSE.
  const allowsPacks = isAdega && !isCardapio && isBeverage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full ${allowsPacks ? 'max-w-4xl' : 'max-w-2xl'} rounded-2xl border shadow-2xl overflow-hidden my-4 sm:my-6 transition-colors ${
        isLight ? 'bg-white border-slate-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
      }`}>
        
        {/* Header do Modal */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {isCardapio ? <UtensilsCrossed className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            </div>
            <div>
              <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {editingProduct 
                  ? (isCardapio 
                      ? 'Editar Item do Cardápio' 
                      : isAdega 
                      ? (allowsPacks ? 'Editar Bebida' : 'Editar Produto da Adega')
                      : segmentConfig.id === 'petshop' 
                      ? 'Editar Produto Pet / Ração' 
                      : 'Editar Produto / Mercadoria')
                  : (isCardapio 
                      ? 'Cadastrar Novo Item no Cardápio' 
                      : isAdega 
                      ? (allowsPacks ? 'Cadastrar Bebida no Estoque' : 'Cadastrar Item na Adega')
                      : segmentConfig.id === 'petshop'
                      ? 'Cadastrar Produto Pet / Ração no Estoque'
                      : 'Cadastrar Produto / Mercadoria no Estoque')}
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                {isCardapio 
                  ? 'Prato, lanche, pizza ou receita caseira preparada na cozinha (sem exigência de EAN ou fardos)'
                  : isAdega
                  ? (allowsPacks
                      ? 'Bebida avulsa, controle de estoque unitário e venda no atacado por fardos'
                      : 'Item de adega (petisco, gelo/carvão ou acessório): controle de estoque unitário, custo e margem')
                  : segmentConfig.id === 'petshop'
                  ? 'Rações por saco ou quilo, sachês, petiscos e medicamentos com controle de estoque e venda balcão'
                  : 'Mercadoria com código de barras, custo, margem e controle de estoque'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 max-h-[82vh] overflow-y-auto space-y-4">
          
          {/* SELETOR VISUAL DE TIPO DE ITEM: EXCLUSIVO PARA LANCHONETE E PIZZARIA */}
          {/* EM ADEGA, PET SHOP, MERCADINHO, ISSO NUNCA APARECE! */}
          {isFoodOrPizza && (
            <div className={`p-1.5 rounded-xl border flex flex-col sm:flex-row gap-1.5 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setItemType('cardapio');
                  if (!formData.volume || formData.volume === 'Lata 350ml') {
                    setFormData(prev => ({ 
                      ...prev, 
                      volume: segmentConfig.id === 'pizzaria' ? 'Grande 8 Pedaços' : segmentConfig.id === 'comida_japonesa' ? 'Combinado 20 peças' : 'Porção Individual',
                      barcode: '',
                      stockQuantity: 999
                    }));
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCardapio
                    ? 'btn-graphite bg-neutral-800 text-white border border-neutral-700 shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>🍽️ Item de Cardápio / Produção Caseira</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType('mercadoria');
                  if (!formData.barcode) {
                    setFormData(prev => ({ 
                      ...prev, 
                      barcode: `789${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                      volume: 'Lata 350ml',
                      stockQuantity: 50
                    }));
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isCardapio
                    ? 'btn-graphite bg-neutral-800 text-white border border-neutral-700 shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>🥤 Refrigerantes, Sucos & Bebidas de Estoque</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* COLUNA ESQUERDA: Dados do Produto, Preços e Estoque */}
            <div className={`${allowsPacks ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3.5`}>
              
              {/* Card 1: Identificação & Classificação */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-950/60 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {isCardapio 
                      ? '1. Dados do Item do Cardápio' 
                      : (isAdega && allowsPacks)
                      ? '1. Identificação da Bebida' 
                      : '1. Identificação do Produto / Mercadoria'}
                  </span>
                  {isCardapio && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Cozinha & Cardápio Digital
                    </span>
                  )}
                </div>

                {/* Nome do Produto */}
                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                    {isCardapio 
                      ? 'Nome do Prato / Pizza / Lanche *' 
                      : isAdega 
                      ? 'Nome da Bebida / Produto *' 
                      : segmentConfig.id === 'petshop' 
                      ? 'Nome do Produto Pet / Ração *' 
                      : 'Nome do Produto / Mercadoria *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={
                      isCardapio
                        ? segmentConfig.id === 'pizzaria'
                          ? 'Ex: Pizza Calabresa Especial Forno à Lenha'
                          : segmentConfig.id === 'comida_japonesa'
                          ? 'Ex: Combinado Salmão & Atum Especial 20 Peças'
                          : segmentConfig.id === 'restaurante_lanchonete'
                          ? 'Ex: Burger Smash Duplo Cheddar Bacon'
                          : 'Ex: Nome do prato ou item artesanal'
                        : isAdega
                        ? 'Ex: Cerveja Heineken Puro Malte 350ml'
                        : segmentConfig.id === 'petshop'
                        ? 'Ex: Ração Cães Adultos Raças Pequenas 2.5kg'
                        : 'Ex: Refrigerante Coca-Cola 2 Litros'
                    }
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none transition-colors ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500' 
                        : 'bg-neutral-850 border-neutral-700 text-white focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Grid Classificação: Categoria, Tamanho/Volume e Código EAN (se mercadoria) */}
                <div className={`grid grid-cols-1 ${!isCardapio ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5`}>
                  
                  {/* Categoria */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={`block text-[11px] font-semibold ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                        Categoria *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCatManagerOpen(true)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Adicionar, editar ou remover categorias da loja"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Nova / Gerenciar</span>
                      </button>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        if (newCat === '__NEW_CAT__') {
                          setIsCatManagerOpen(true);
                          return;
                        }
                        const newCatObj = tenantCategories.find((c) => c.id === newCat);
                        const isNonFoodSelected = isNonKitchenCategory(newCat, newCatObj?.label);
                        if (isNonFoodSelected && itemType === 'cardapio') {
                          setItemType('mercadoria');
                          setIngredients('');
                        }
                        setFormData({ ...formData, category: newCat as CategoryType });
                      }}
                      style={{
                        colorScheme: isLight ? 'light' : 'dark',
                        backgroundColor: isLight ? '#f8fafc' : '#1e1e1e',
                        color: isLight ? '#0f172a' : '#f8fafc',
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${
                        isLight 
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' 
                          : 'bg-neutral-800 border-neutral-700 text-white focus:border-blue-500'
                      }`}
                    >
                      {/* APENAS AS CATEGORIAS ATIVAS DA LOJA ATUAL (SEM CATEGORIAS CRUZADAS DE OUTROS NICHOS) */}
                      {tenantCategories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          style={{
                            backgroundColor: isLight ? '#ffffff' : '#262626',
                            color: isLight ? '#0f172a' : '#f8fafc',
                          }}
                        >
                          {cat.label}
                        </option>
                      ))}

                      {/* Se a categoria atual do produto for legada e não estiver na lista ativa */}
                      {formData.category && !tenantCategories.some((c) => c.id === formData.category) && (
                        <option
                          value={formData.category}
                          style={{
                            backgroundColor: isLight ? '#ffffff' : '#262626',
                            color: isLight ? '#0f172a' : '#f8fafc',
                          }}
                        >
                          {formData.category} (Atual)
                        </option>
                      )}

                      <option 
                        value="__NEW_CAT__" 
                        style={{ 
                          backgroundColor: isLight ? '#fffbeb' : '#1c1917', 
                          color: '#f59e0b', 
                          fontWeight: 'bold' 
                        }}
                      >
                        ➕ Criar Nova Categoria...
                      </option>
                    </select>
                  </div>

                  {/* Volume ou Tamanho / Porção */}
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                      {isCardapio ? 'Tamanho / Porção' : segmentConfig.id === 'petshop' ? 'Embalagem / Peso' : 'Volume / Embalagem'}
                    </label>
                    <input
                      type="text"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      placeholder={
                        isCardapio 
                          ? segmentConfig.id === 'pizzaria' ? 'Ex: Grande 8 Pedaços, Broto' : 'Ex: 400g, Individual, P/M/G'
                          : segmentConfig.id === 'petshop' ? 'Ex: Saco 15kg, Sachê 85g, 500ml'
                          : isAdega ? 'Ex: Lata 350ml, Garrafa 750ml'
                          : 'Ex: Unidade, Pacote 1kg'
                      }
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none ${
                        isLight 
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' 
                          : 'bg-neutral-850 border-neutral-700 text-white focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {/* Código EAN (SOMENTE PARA MERCADORIAS QUANDO ATIVADO OU SOLICITADO) */}
                  {!isCardapio && (
                    isBarcodeScannerConfigEnabled || showManualBarcode ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className={`block text-[11px] font-semibold ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                            Código de Barras EAN {isFoodOrPizza ? '(Bebida)' : ''}
                          </label>
                          {!isBarcodeScannerConfigEnabled && (
                            <button
                              type="button"
                              onClick={() => setShowManualBarcode(false)}
                              className="text-[10px] text-neutral-400 hover:text-neutral-300 cursor-pointer"
                            >
                              ✕ Ocultar
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Barcode className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="789..."
                            className={`w-full pl-8 pr-2 py-1.5 rounded-lg text-xs font-mono border focus:outline-none ${
                              isLight 
                                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' 
                                : 'bg-neutral-850 border-neutral-700 text-white focus:border-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-1.5 ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-neutral-850/60 border-neutral-800 text-neutral-400'
                      }`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Barcode className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">Leitor desativado</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowManualBarcode(true)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap cursor-pointer hover:underline"
                        >
                          + Código EAN
                        </button>
                      </div>
                    )
                  )}

                </div>

                {/* CAMPO DE INGREDIENTES / COMPOSIÇÃO - EXCLUSIVO PARA CARDÁPIO (PIZZAS, LANCHES, PRATOS) */}
                {isCardapio && (
                  <div className={`p-3 rounded-xl border space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                    <label className={`block text-[11px] font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Ingredientes / Composição do Item (Cardápio Online)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder={
                        segmentConfig.id === 'pizzaria'
                          ? 'Ex: Massa artesanal de fermentação lenta, molho rústico de tomate italiano, mussarela especial, calabresa artesanal fatiada, cebola roxa e orégano fresco.'
                          : segmentConfig.id === 'comida_japonesa'
                          ? 'Ex: 4 sashimis de salmão maçaricado, 4 uramakis filadélfia, 4 hossomakis de atum, 4 niguiris selados com azeite trufado e 4 hot rolls crocantes.'
                          : 'Ex: Pão brioche selado na manteiga, 2x smash burger de 90g (blend bovino), queijo cheddar derretido, fatias crocantes de bacon e maionese da casa.'
                      }
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none leading-relaxed transition-colors ${
                        isLight 
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500' 
                          : 'bg-neutral-950 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-blue-500'
                      }`}
                    />
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      💡 Os ingredientes aparecem na vitrine e no cardápio online para o cliente ver o que compõe o produto.
                    </p>
                  </div>
                )}

                {/* Grid Preços: Venda, Custo e Margem */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                      Preço Venda (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0.1"
                      required
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0.00"
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border focus:outline-none ${
                        isLight 
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' 
                          : 'bg-neutral-850 border-neutral-700 text-white focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                      Preço de Custo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={formData.costPrice || ''}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      placeholder="0.00"
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none ${
                        isLight 
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' 
                          : 'bg-neutral-850 border-neutral-700 text-white focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                      Margem Estimada
                    </label>
                    <div className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-center border ${
                      formData.price > (formData.costPrice || 0)
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                    }`}>
                      {formData.price > 0 && (formData.costPrice || 0) > 0
                        ? `${(((formData.price - (formData.costPrice || 0)) / formData.price) * 100).toFixed(0)}% lucro`
                        : '—'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Card 2: Controle de Disponibilidade / Estoque */}
              {isCardapio ? (
                /* Cardápio de Cozinha (Pizzaria e Lanchonete) */
                <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isLight ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-emerald-500/5 border-emerald-500/20 text-neutral-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-emerald-700 dark:text-emerald-400">
                        Disponibilidade na Cozinha
                      </span>
                      <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                        Item caseiro do cardápio: disponível para venda contínua sem travar por falta de fardos.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formData.inStock ? 'Em Produção' : 'Pausado'}
                    </span>
                  </label>
                </div>
              ) : (
                /* Mercadoria: Controle de estoque unitário e entrada de fardos (se Adega) */
                <div className="p-3.5 rounded-xl border border-dashed border-blue-500/30 bg-blue-50/40 dark:bg-blue-500/5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-neutral-100'}`}>
                      <Boxes className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Estoque & Entrada de Mercadoria
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Total: <strong>{formData.stockQuantity} un</strong> {allowsPacks ? `(${Math.floor(formData.stockQuantity / 12)} fardos c/ 12)` : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    
                    {/* Entrada Rápida de Fardos (somente se Adega e for Categoria de Bebida) */}
                    {allowsPacks ? (
                      <div className={`sm:col-span-7 p-2 rounded-lg border ${
                        isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-850 border-neutral-800'
                      }`}>
                        <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          📦 Entrada Rápida em Fardos:
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qtd Fardos"
                            value={fardoStockInput || ''}
                            onChange={(e) => setFardoStockInput(parseInt(e.target.value, 10) || 0)}
                            className={`w-20 px-2 py-1 rounded text-xs font-mono font-bold border focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                            }`}
                          />
                          <span className="text-[11px] text-neutral-500 font-semibold">c/</span>
                          <select
                            value={fardoPackSize}
                            onChange={(e) => setFardoPackSize(Number(e.target.value))}
                            style={{
                              colorScheme: isLight ? 'light' : 'dark',
                              backgroundColor: isLight ? '#ffffff' : '#262626',
                              color: isLight ? '#0f172a' : '#f8fafc',
                            }}
                            className={`px-1.5 py-1 rounded text-xs font-bold border focus:outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                            }`}
                          >
                            <option value={6}>6u</option>
                            <option value={12}>12u</option>
                            <option value={18}>18u</option>
                            <option value={24}>24u</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (fardoStockInput > 0) {
                                const added = fardoStockInput * fardoPackSize;
                                setFormData(prev => ({ ...prev, stockQuantity: prev.stockQuantity + added }));
                                setFardoStockInput(0);
                              }
                            }}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                          >
                            + Somar
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Campos Total Unidades e Alerta Mínimo */}
                    <div className={`${allowsPacks ? 'sm:col-span-5' : 'sm:col-span-12'} p-2 rounded-lg border flex items-center gap-2 ${
                      isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-850 border-neutral-800'
                    }`}>
                      <div className="w-1/2">
                        <label className={`block text-[10px] font-semibold mb-0.5 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                          Total Unid.
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                          className={`w-full px-2 py-1 rounded text-xs font-mono font-bold border focus:outline-none ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                          }`}
                        />
                      </div>
                      <div className="w-1/2">
                        <label className={`block text-[10px] font-semibold mb-0.5 ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>
                          Alerta Mín.
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.minStockAlert ?? 5}
                          onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                          className={`w-full px-2 py-1 rounded text-xs font-mono border focus:outline-none ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-neutral-800 border-neutral-700 text-white'
                          }`}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Card 3: Foto do Produto (Upload, Busca no Google e Link) */}
              <div className={`p-3 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-950/60 border-neutral-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Foto / Imagem do Item
                  </span>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="text-[10px] text-red-500 hover:text-red-400 font-semibold cursor-pointer"
                    >
                      Remover Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Preview da Imagem */}
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-neutral-900 border-neutral-700'
                  }`}>
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <ImageIcon className="w-5 h-5 mx-auto text-neutral-400 opacity-60" />
                        <span className="block text-[8px] text-neutral-400 font-mono mt-0.5 leading-none">Sem Foto</span>
                      </div>
                    )}
                  </div>

                  {/* Ações: Upload + Ícone de Pesquisa no Google + Input de Link */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {/* Botão de Anexar Imagem */}
                      <label className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs shrink-0 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                          : 'bg-neutral-850 hover:bg-neutral-750 text-white border-neutral-700'
                      }`}>
                        <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Anexar Imagem</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                showAlert({
                                  title: 'Arquivo Muito Grande',
                                  message: 'A foto deve ter no máximo 5MB.',
                                  variant: 'warning',
                                });
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const result = ev.target?.result as string;
                                if (result) {
                                  setFormData({ ...formData, imageUrl: result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {/* Somente o Ícone de Pesquisa no Google Imagens */}
                      <button
                        type="button"
                        onClick={() => {
                          const query = formData.name.trim() || 'produto';
                          window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank');
                        }}
                        title="Procurar imagem no Google Imagens"
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 border-slate-300'
                            : 'bg-neutral-850 hover:bg-blue-500/20 hover:border-blue-500/40 text-neutral-300 hover:text-blue-400 border-neutral-700'
                        }`}
                      >
                        <Search className="w-4 h-4" />
                      </button>

                      {/* Campo para colar o link da imagem */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="Cole o link da imagem aqui..."
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none transition-colors ${
                            isLight 
                              ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500' 
                              : 'bg-neutral-850 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkboxes de Ativação */}
                <div className={`pt-2 border-t flex flex-wrap items-center gap-3 text-xs ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  {!isCardapio && isAdega && allowsPacks && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isChilledAvailable}
                        onChange={(e) => setFormData({ ...formData, isChilledAvailable: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className={`text-[11px] ${isLight ? 'text-slate-800 font-medium' : 'text-neutral-200'}`}>Opção Gelada ❄️</span>
                    </label>
                  )}

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className={`text-[11px] ${isLight ? 'text-slate-800 font-medium' : 'text-neutral-200'}`}>
                      {isCardapio ? 'Disponível no Cardápio' : 'Ativo p/ Venda'}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={formData.showInStorefront}
                      onChange={(e) => setFormData({ ...formData, showInStorefront: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className={`text-[11px] font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      Visível na Vitrine Online
                    </span>
                  </label>
                </div>

              </div>

            </div>

            {/* COLUNA DIREITA (5 Colunas): Venda em Fardo / Caixa - EXCLUSIVO PARA BEBIDAS DA ADEGA */}
            {allowsPacks && (
              <div className="lg:col-span-5 space-y-3">
                <div className={`p-3.5 rounded-xl border space-y-2.5 h-full flex flex-col justify-between ${
                  isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-neutral-950/60 border-neutral-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-blue-400'}`}>
                        <Boxes className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        2. Venda no Atacado ({segmentConfig.packTerm})
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Baixa Automática
                      </span>
                    </div>
                    <p className={`text-[10px] leading-tight mb-2 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                      Marque os pacotes para vender no balcão e na vitrine.
                    </p>

                    {/* Lista Compacta dos 4 Fardos */}
                    <div className="space-y-2">
                      {(formData.packOptions || DEFAULT_PACKS).map((pack, idx) => {
                        const unitPrice = formData.price;
                        const standardTotal = unitPrice * pack.unitsCount;
                        const discount = pack.price > 0 && standardTotal > 0 ? ((standardTotal - pack.price) / standardTotal) * 100 : 0;

                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border transition-all ${
                              pack.enabled
                                ? isLight
                                  ? 'bg-white border-blue-400 shadow-2xs ring-1 ring-blue-400/30'
                                  : 'bg-neutral-900 border-blue-500/50 ring-1 ring-blue-500/20'
                                : isLight
                                ? 'bg-slate-100/70 border-slate-200 opacity-70'
                                : 'bg-neutral-900/40 border-neutral-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={pack.enabled}
                                  onChange={(e) => handleUpdatePack(idx, { enabled: e.target.checked })}
                                  className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                                />
                                <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {pack.unitsCount === 24 ? '📦 Caixa 24 un' : `🧃 Fardo c/ ${pack.unitsCount} un`}
                                </span>
                              </label>

                              {pack.enabled && discount > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  -{discount.toFixed(0)}% desc
                                </span>
                              )}
                            </div>

                            {pack.enabled && (
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                {/* Preço do Fardo */}
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="0.10"
                                    min="0.1"
                                    placeholder="Preço R$"
                                    value={pack.price || ''}
                                    onChange={(e) => handleUpdatePack(idx, { price: parseFloat(e.target.value) || 0 })}
                                    className={`w-full px-2 py-1 rounded text-xs font-mono font-bold border focus:outline-none ${
                                      isLight 
                                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' 
                                        : 'bg-neutral-850 border-neutral-700 text-white focus:border-blue-500'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSuggestPackPrice(idx)}
                                    title="Calcular preço com desconto sugerido"
                                    className={`p-1 rounded border text-xs cursor-pointer transition-colors shrink-0 ${
                                      isLight 
                                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-slate-300'
                                    }`}
                                  >
                                    <Calculator className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Barcode do Fardo */}
                                <div className="relative">
                                  <Barcode className="w-3 h-3 text-neutral-400 absolute left-1.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    placeholder="EAN do fardo..."
                                    value={pack.barcode || ''}
                                    onChange={(e) => handleUpdatePack(idx, { barcode: e.target.value })}
                                    className={`w-full pl-6 pr-1.5 py-1 rounded text-[11px] font-mono border focus:outline-none ${
                                      isLight 
                                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500' 
                                        : 'bg-neutral-800 border-neutral-700 text-white focus:border-blue-500'
                                    }`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`p-2 rounded-lg border text-[10px] ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}>
                    💡 Ao vender um fardo no balcão ou na vitrine, o estoque geral de latas/garrafas é baixado de forma automática e precisa.
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
            isLight ? 'border-slate-200' : 'border-neutral-800'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-graphite px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {editingProduct 
                ? 'Salvar Alterações' 
                : isCardapio 
                ? 'Cadastrar Item no Cardápio' 
                : isAdega 
                ? 'Cadastrar Bebida' 
                : 'Cadastrar Produto'}
            </button>
          </div>

        </form>

      </div>

      {/* Modal de Gerenciamento de Categorias */}
      <CategoryManagerModal
        isOpen={isCatManagerOpen}
        onClose={() => setIsCatManagerOpen(false)}
        onSelectCategory={(catId) => {
          setFormData((prev) => ({ ...prev, category: catId as CategoryType }));
        }}
      />
    </div>
  );
};
