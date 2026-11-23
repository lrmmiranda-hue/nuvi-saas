import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, StockMovement, CategoryType } from '../../types';
import { getSegmentById, getTenantActiveCategories } from '../../data/businessSegments';
import { getStarterProductsForSegment } from '../../data/segmentProducts';
import { CategoryManagerModal } from './CategoryManagerModal';
import { 
  Boxes, 
  Barcode, 
  PackagePlus, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ExternalLink, 
  Store, 
  X, 
  Download, 
  Upload, 
  FileText, 
  Filter,
  Eye,
  Edit3,
  DollarSign,
  Layers,
  Menu,
  User
} from 'lucide-react';

interface InventoryViewProps {
  onOpenProductModal: (product?: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenProductModal }) => {
  const { 
    currentTenant, 
    tenantProducts, 
    tenantStockMovements, 
    receiveStock, 
    updateProduct,
    findProductByBarcode, 
    importProductsFromExcel,
    showAlert,
    themeMode,
  } = useStore();

  const isLight = themeMode === 'light';

  // Nicho do estabelecimento ativo
  const isAdega = currentTenant?.businessSegment === 'adega';
  const isFoodOrPizza = currentTenant?.businessSegment === 'pizzaria' || currentTenant?.businessSegment === 'restaurante_lanchonete' || currentTenant?.businessSegment === 'comida_japonesa';
  const segmentConfig = getSegmentById(currentTenant?.businessSegment || 'adega');

  const activeCategories = useMemo(() => {
    return getTenantActiveCategories(
      tenantProducts, 
      currentTenant?.businessSegment, 
      currentTenant?.categories || currentTenant?.customCategories
    );
  }, [tenantProducts, currentTenant?.businessSegment, currentTenant?.categories, currentTenant?.customCategories]);

  // Modal de Gerenciamento de Categorias (Pizzaria, Lanchonete, Adega, etc.)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Internal tabs: 'inventory' | 'movements'
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'movements'>('inventory');

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'baixo' | 'zerado' | 'ok' | 'fardos'>('todos');

  // RECEIVING MODAL STATE
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  const [receiveMode, setReceiveMode] = useState<'fardo' | 'unidade'>('fardo');
  const [receivePacksCount, setReceivePacksCount] = useState<number>(5);
  const [receivePackSize, setReceivePackSize] = useState<number>(12);
  const [receivePackCostPrice, setReceivePackCostPrice] = useState<number>(0);
  const [receiveBarcode, setReceiveBarcode] = useState('');
  const [selectedProductForReceiving, setSelectedProductForReceiving] = useState<Product | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState<number>(24);
  const [receiveCostPrice, setReceiveCostPrice] = useState<number>(0);
  const [receiveSupplierInvoice, setReceiveSupplierInvoice] = useState('');
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receivingSuccessMessage, setReceivingSuccessMessage] = useState<string | null>(null);
  const receiveBarcodeInputRef = useRef<HTMLInputElement>(null);

  // EXCEL IMPORT MODAL STATE
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelPasteText, setExcelPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Array<Partial<Product> & { name: string; price: number }>>([]);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number } | null>(null);

  // MENU SUSPENSO ÚNICO COM TODAS AS AÇÕES DO ESTOQUE
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    if (isActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  // Audio Beep for Receiving Barcode Scanner
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch {}
  };

  // KPIs
  const totalItemsCount = tenantProducts.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalCostValue = tenantProducts.reduce((acc, p) => acc + (p.stockQuantity * (p.costPrice || p.price * 0.6)), 0);
  const totalSaleValue = tenantProducts.reduce((acc, p) => acc + (p.stockQuantity * (p.promoPrice ?? p.price)), 0);
  const lowStockCount = tenantProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.minStockAlert || 5)).length;
  const outOfStockCount = tenantProducts.filter(p => p.stockQuantity <= 0).length;

  // Filtered Products
  const filteredProducts = tenantProducts.filter(p => {
    const matchesCat = categoryFilter === 'todas' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchQuery));
    
    let matchesStatus = true;
    if (statusFilter === 'baixo') {
      matchesStatus = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockAlert || 5);
    } else if (statusFilter === 'zerado') {
      matchesStatus = p.stockQuantity <= 0;
    } else if (statusFilter === 'ok') {
      matchesStatus = p.stockQuantity > (p.minStockAlert || 5);
    } else if (statusFilter === 'fardos') {
      matchesStatus = Boolean(p.packOptions && p.packOptions.some(pack => pack.enabled));
    }

    return matchesCat && matchesSearch && matchesStatus;
  });

  // Handle Receiving Barcode Input
  const handleReceiveBarcodeLookup = (code: string) => {
    setReceiveBarcode(code);
    const prod = findProductByBarcode(code.trim());
    if (prod) {
      setSelectedProductForReceiving(prod);
      const unitCost = prod.costPrice || Number((prod.price * 0.65).toFixed(2));
      setReceiveCostPrice(unitCost);

      const defaultSize = (prod.packOptions && prod.packOptions.length > 0)
        ? prod.packOptions[0].unitsCount
        : (prod.category === 'cervejas' ? 12 : prod.category === 'vinhos' ? 6 : 12);

      setReceivePackSize(defaultSize);
      setReceivePacksCount(5);
      setReceivePackCostPrice(Number((unitCost * defaultSize).toFixed(2)));
      setReceiveQuantity(5 * defaultSize);
      playBeep();
    } else {
      setSelectedProductForReceiving(null);
    }
  };

  const handleOpenReceivingForProduct = (prod: Product) => {
    setSelectedProductForReceiving(prod);
    setReceiveBarcode(prod.barcode);
    const unitCost = prod.costPrice || Number((prod.price * 0.65).toFixed(2));
    setReceiveCostPrice(unitCost);

    const defaultSize = (prod.packOptions && prod.packOptions.length > 0)
      ? prod.packOptions[0].unitsCount
      : (prod.category === 'cervejas' ? 12 : prod.category === 'vinhos' ? 6 : 12);

    setReceivePackSize(defaultSize);
    setReceivePacksCount(5);
    setReceivePackCostPrice(Number((unitCost * defaultSize).toFixed(2)));
    setReceiveQuantity(5 * defaultSize);
    setReceiveMode('fardo');
    setIsReceivingModalOpen(true);
  };

  // Confirm Goods Receiving (Unidade ou Fardo)
  const handleConfirmReceiving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReceiving) {
      showAlert({
        title: 'Produto Não Selecionado',
        message: 'Por favor, selecione ou bipe um produto válido para dar entrada.',
        variant: 'warning',
      });
      return;
    }

    const finalQuantity = receiveMode === 'fardo' 
      ? receivePacksCount * receivePackSize 
      : receiveQuantity;

    if (finalQuantity <= 0) {
      showAlert({
        title: 'Quantidade Inválida',
        message: 'A quantidade recebida deve ser maior que zero.',
        variant: 'warning',
      });
      return;
    }

    const finalUnitCost = receiveMode === 'fardo' && receivePackCostPrice > 0
      ? Number((receivePackCostPrice / receivePackSize).toFixed(2))
      : receiveCostPrice;

    const notesSummary = receiveMode === 'fardo'
      ? `${receivePacksCount} fardo(s) c/ ${receivePackSize} un (${finalQuantity} un totais)${receiveNotes ? ' - ' + receiveNotes : ''}`
      : receiveNotes;

    receiveStock(
      selectedProductForReceiving.id,
      finalQuantity,
      finalUnitCost,
      receiveSupplierInvoice.trim() || undefined,
      notesSummary.trim() || undefined
    );

    playBeep();
    setReceivingSuccessMessage(
      receiveMode === 'fardo'
        ? `Entrada de ${receivePacksCount} fardos (${finalQuantity} un) para "${selectedProductForReceiving.name}" confirmada! Estoque atualizado.`
        : `Entrada de ${finalQuantity} un para "${selectedProductForReceiving.name}" confirmada! Estoque atualizado.`
    );

    setTimeout(() => {
      setReceivingSuccessMessage(null);
      setIsReceivingModalOpen(false);
      setSelectedProductForReceiving(null);
      setReceiveBarcode('');
      setReceiveSupplierInvoice('');
      setReceiveNotes('');
    }, 2000);
  };

  // Sample data for Excel / CSV Import (específico para o segmento ativo)
  const loadSampleExcelData = () => {
    const starter = getStarterProductsForSegment(currentTenant?.businessSegment || 'adega', 'modelo');
    const header = "Código de Barras\tNome do Produto\tCategoria\tVolume\tPreço Venda\tPreço Custo\tEstoque\tEstoque Mínimo";
    const rows = starter.slice(0, 10).map(p => {
      const cost = p.costPrice || Number((p.price * 0.6).toFixed(2));
      return `${p.barcode}\t${p.name}\t${p.category}\t${p.volume}\t${p.price.toFixed(2)}\t${cost.toFixed(2)}\t${p.stockQuantity}\t${p.minStockAlert || 5}`;
    });
    const sample = [header, ...rows].join('\n');
    setExcelPasteText(sample);
    parseSpreadsheetText(sample);
  };

  // Baixar Planilha Modelo (.CSV) formatada para preenchimento no Excel do segmento ativo
  const downloadSpreadsheetTemplate = () => {
    const starter = getStarterProductsForSegment(currentTenant?.businessSegment || 'adega', 'modelo');
    const header = "CodigoBarras;NomeProduto;Categoria;Volume;PrecoVenda;PrecoCusto;Estoque;EstoqueMinimo\n";
    const rows = starter.slice(0, 10).map(p => {
      const cost = p.costPrice || Number((p.price * 0.6).toFixed(2));
      return `${p.barcode};${p.name};${p.category};${p.volume};${p.price.toFixed(2)};${cost.toFixed(2)};${p.stockQuantity};${p.minStockAlert || 5}`;
    }).join('\n');

    const csvContent = "\uFEFF" + header + rows + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `modelo_estoque_${currentTenant?.businessSegment || 'produtos'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert({
      title: 'Planilha Modelo Baixada!',
      message: `O arquivo modelo de ${segmentConfig.shortLabel} foi baixado. Preencha seus produtos no Excel e depois importe aqui!`,
      variant: 'success',
    });
  };

  // Parse TSV or CSV from Excel/Google Sheets
  const parseSpreadsheetText = (rawText: string) => {
    const lines = rawText.trim().split('\n');
    if (lines.length < 2) {
      setParsedPreview([]);
      return;
    }

    const rows: Array<Partial<Product> & { name: string; price: number }> = [];

    // Skip header line if it looks like header
    const startIndex = lines[0].toLowerCase().includes('nome') || lines[0].toLowerCase().includes('código') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by tab (Excel/Sheets copy) or comma or semicolon
      let cols = line.split('\t');
      if (cols.length < 3) cols = line.split(';');
      if (cols.length < 3) cols = line.split(',');

      if (cols.length >= 2) {
        // Match columns or fallback gracefully
        const barcode = cols[0]?.trim() || '';
        const name = cols[1]?.trim() || '';
        const category = (cols[2]?.trim().toLowerCase() as CategoryType) || 'cervejas';
        const volume = cols[3]?.trim() || 'Unidade';
        const price = parseFloat(cols[4]?.replace(',', '.').replace(/[^\d.]/g, '') || '0') || 10;
        const costPrice = parseFloat(cols[5]?.replace(',', '.').replace(/[^\d.]/g, '') || '0') || Number((price * 0.6).toFixed(2));
        const stockQuantity = parseInt(cols[6]?.replace(/[^\d]/g, '') || '50', 10) || 50;
        const minStockAlert = parseInt(cols[7]?.replace(/[^\d]/g, '') || '5', 10) || 5;

        if (name) {
          rows.push({
            barcode,
            name,
            category: (['cervejas', 'vinhos', 'destilados', 'combos', 'gelo_carvao', 'sem_alcool', 'petiscos'].includes(category) 
              ? category 
              : 'cervejas') as CategoryType,
            volume,
            price,
            costPrice,
            stockQuantity,
            minStockAlert,
            inStock: stockQuantity > 0,
            showInStorefront: true, // Always automatically available in vitrine
            isChilledAvailable: category === 'cervejas' || category === 'sem_alcool',
          });
        }
      }
    }

    setParsedPreview(rows);
  };

  // Confirm Excel Import
  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) {
      showAlert({
        title: 'Sem Dados para Importar',
        message: 'Nenhum produto válido para importar. Cole os dados da planilha ou clique em "Carregar Exemplo".',
        variant: 'warning',
      });
      return;
    }

    const result = importProductsFromExcel(parsedPreview);
    setImportResult(result);
    playBeep();

    setTimeout(() => {
      setImportResult(null);
      setIsExcelModalOpen(false);
      setExcelPasteText('');
      setParsedPreview([]);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row com estilo Nuvi Master */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Items */}
        <div className={`p-4 rounded-2xl border space-y-1 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wide ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Itens em Estoque
            </span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-2xl font-black font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {totalItemsCount} <span className={`text-xs font-sans font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>unidades</span>
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Distribuídos em {tenantProducts.length} produtos cadastrados
          </p>
        </div>

        {/* Total Cost Value */}
        <div className={`p-4 rounded-2xl border space-y-1 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wide ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Custo do Estoque
            </span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-2xl font-black font-mono tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
            R$ {totalCostValue.toFixed(2)}
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Capital investido em mercadorias
          </p>
        </div>

        {/* Total Sale Potential & Margin */}
        <div className={`p-4 rounded-2xl border space-y-1 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wide ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Potencial de Venda
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-black font-mono tabular-nums ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
            R$ {totalSaleValue.toFixed(2)}
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Lucro projetado: R$ {(totalSaleValue - totalCostValue).toFixed(2)}
          </p>
        </div>

        {/* Alerts: Low / Out of Stock */}
        <div className={`p-4 rounded-2xl border space-y-1 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wide ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Alertas de Reposição
            </span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 || outOfStockCount > 0 ? (isLight ? 'text-amber-600' : 'text-amber-400') : (isLight ? 'text-slate-400' : 'text-slate-500')}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black font-mono ${
              outOfStockCount > 0 
                ? (isLight ? 'text-rose-600' : 'text-rose-400') 
                : (isLight ? 'text-slate-900' : 'text-white')
            }`}>
              {outOfStockCount + lowStockCount}
            </span>
            <div className="text-[10px] space-y-0.5">
              <span className={`block font-semibold ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>{outOfStockCount} zerados</span>
              <span className={`block font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{lowStockCount} estoque baixo</span>
            </div>
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            Abaixo do estoque mínimo configurado
          </p>
        </div>

      </div>

      {/* Main Stock Toolbar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
      }`}>
        
        {/* Sub-tab navigation */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs transition-colors ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{isFoodOrPizza ? 'Itens do Cardápio' : isAdega ? 'Bebidas no Estoque' : 'Estoque Atual'} ({tenantProducts.length})</span>
          </button>
          
          {!isFoodOrPizza && (
            <button
              onClick={() => setActiveSubTab('movements')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'movements'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Histórico de Entradas & Saídas ({tenantStockMovements.length})</span>
            </button>
          )}
        </div>

        {/* Menu de Ações Único com Somente o Ícone Menu */}
        <div className="relative shrink-0" ref={actionsMenuRef}>
          <button
            type="button"
            onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
            className={`flex items-center justify-center p-2.5 rounded-xl text-white font-bold text-xs shadow-md border-0 transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-gradient-to-r from-[#184C8A]/75 via-[#1E5CA6]/78 to-[#144278]/80 hover:from-[#1E5CA6]/85 hover:to-[#2563EB]/85 shadow-sky-900/15 backdrop-blur-md'
                : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] hover:from-[#0E2A4D] hover:to-[#133763] shadow-[#0C2340]/40'
            }`}
            title="Menu de Ações do Estoque (Novo Produto, Entrada, Planilha, Categorias)"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Dropdown Menu */}
          {isActionsMenuOpen && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border p-2 z-50 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
                : 'bg-[#10161E]/95 border-[#1C2631] text-slate-200 shadow-black/80'
            }`}>
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                  Gerenciamento Rápido
                </span>
              </div>

              {/* 1. Cadastrar Novo Produto */}
              <button
                type="button"
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  onOpenProductModal();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isLight
                    ? 'hover:bg-sky-50 text-slate-800 hover:text-sky-600'
                    : 'hover:bg-sky-500/10 text-slate-200 hover:text-sky-400'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block leading-tight">Novo Produto</span>
                  <span className="text-[10px] font-normal text-slate-400">Cadastrar item no catálogo</span>
                </div>
              </button>

              {/* 2. Entrada de Mercadoria / Estoque */}
              {!isFoodOrPizza && (
                <button
                  type="button"
                  onClick={() => {
                    setIsActionsMenuOpen(false);
                    setSelectedProductForReceiving(null);
                    setReceiveBarcode('');
                    setReceivePacksCount(5);
                    setReceivePackSize(12);
                    setReceiveQuantity(isAdega ? 60 : 20);
                    setReceiveMode(isAdega ? 'fardo' : 'unidade');
                    setIsReceivingModalOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isLight
                      ? 'hover:bg-emerald-50 text-slate-800 hover:text-emerald-600'
                      : 'hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-400'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <Boxes className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block leading-tight">Entrada de Mercadoria</span>
                    <span className="text-[10px] font-normal text-slate-400">Dar entrada em fardos e unidades</span>
                  </div>
                </button>
              )}

              {/* 3. Importar Planilha */}
              <button
                type="button"
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  setIsExcelModalOpen(true);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isLight
                    ? 'hover:bg-teal-50 text-slate-800 hover:text-teal-600'
                    : 'hover:bg-teal-500/10 text-slate-200 hover:text-teal-400'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block leading-tight">Importar Planilha</span>
                  <span className="text-[10px] font-normal text-slate-400">Subir produtos via Excel / CSV</span>
                </div>
              </button>

              {/* 4. Gerenciar Categorias */}
              <button
                type="button"
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  setIsCategoryModalOpen(true);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isLight
                    ? 'hover:bg-indigo-50 text-slate-800 hover:text-indigo-600'
                    : 'hover:bg-indigo-500/10 text-slate-200 hover:text-indigo-400'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="block leading-tight">Categorias ({activeCategories.length})</span>
                  <span className="text-[10px] font-normal text-slate-400">Organizar categorias do cardápio</span>
                </div>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* SUB-TAB 1: INVENTORY TABLE */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl border text-xs transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>Status:</span>
              {[
                { id: 'todos', label: 'Todos' },
                ...(isAdega ? [{ id: 'fardos', label: '📦 Venda em Fardo' }] : []),
                { id: 'baixo', label: `Baixo Estoque (${lowStockCount})` },
                { id: 'zerado', label: `Zerados (${outOfStockCount})` },
                { id: 'ok', label: 'Normal' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer text-xs ${
                    statusFilter === st.id
                      ? 'btn-graphite bg-neutral-800 text-white border border-neutral-700 font-bold shadow-xs'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  colorScheme: isLight ? 'light' : 'dark',
                  backgroundColor: isLight ? '#ffffff' : '#0a0a0a',
                  color: isLight ? '#0f172a' : '#f5f5f5',
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none transition-colors ${
                  isLight 
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-2xs' 
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 focus:border-blue-500'
                }`}
              >
                <option value="todas">Todas as Categorias</option>
                {activeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label} ({cat.count})</option>
                ))}
              </select>

              <div className="relative w-48 sm:w-56">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome ou código..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none transition-colors ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-2xs' 
                      : 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b uppercase text-[10px] tracking-wider transition-colors ${
                    isLight 
                      ? 'border-slate-200 bg-slate-100/90 text-slate-700 font-bold' 
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold'
                  }`}>
                    <th className="p-3 pl-4">Código (EAN)</th>
                    <th className="p-3">Bebida / Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3 text-right">Preço Custo</th>
                    <th className="p-3 text-right">Preço Venda</th>
                    <th className="p-3 text-right">Margem %</th>
                    <th className="p-3 text-center">Estoque Atual</th>
                    <th className="p-3 text-center">Vitrine Online</th>
                    <th className="p-3 text-right pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-neutral-800/80'}`}>
                  {filteredProducts.map(product => {
                    const cost = product.costPrice || Number((product.price * 0.6).toFixed(2));
                    const price = product.promoPrice ?? product.price;
                    const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(0) : '0';
                    const isLow = product.stockQuantity > 0 && product.stockQuantity <= (product.minStockAlert || 5);
                    const isZero = product.stockQuantity <= 0;

                    return (
                      <tr 
                        key={product.id} 
                        className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-850/50'
                        }`}
                      >
                        
                        {/* Barcode */}
                        <td className={`p-3 pl-4 font-mono whitespace-nowrap ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                          <div className="flex items-center gap-1.5">
                            <Barcode className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-neutral-500'}`} />
                            <span>{product.barcode || '—'}</span>
                          </div>
                        </td>

                        {/* Product Name & Thumbnail */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className={`w-9 h-9 rounded-lg object-cover shrink-0 border ${
                                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                                }`}
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                                isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-neutral-950 border-neutral-800 text-neutral-600'
                              }`}>
                                <Boxes className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className={`font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {product.name}
                              </span>
                              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                                {product.volume}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className={`p-3 capitalize ${isLight ? 'text-slate-600 font-medium' : 'text-neutral-400'}`}>
                          {product.category}
                        </td>

                        {/* Cost Price */}
                        <td className={`p-3 text-right font-mono tabular-nums ${isLight ? 'text-slate-600 font-semibold' : 'text-neutral-400'}`}>
                          R$ {cost.toFixed(2)}
                        </td>

                        {/* Sale Price */}
                        <td className={`p-3 text-right font-mono tabular-nums ${isLight ? 'text-slate-900 font-extrabold' : 'text-white font-bold'}`}>
                          R$ {price.toFixed(2)}
                          {product.promoPrice && (
                            <span className="text-[10px] text-rose-600 block font-bold">Promo</span>
                          )}
                        </td>

                        {/* Margin */}
                        <td className={`p-3 text-right font-mono tabular-nums font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          {margin}%
                        </td>

                        {/* Current Stock with Visual Alert & Pack Converter */}
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center">
                            {isFoodOrPizza && (product.itemType === 'cardapio' || !product.barcode || product.barcode.startsWith('CARD-')) ? (
                              <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                <span>Cozinha / Pronto</span>
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                                isZero
                                  ? isLight ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : isLow
                                  ? isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {isZero && <AlertTriangle className="w-3 h-3" />}
                                {product.stockQuantity} un
                              </span>
                            )}

                            {/* Conversor de Fardos para Controle de Venda - EXCLUSIVO ADEGA */}
                            {isAdega && product.stockQuantity > 0 && (
                              <div className="mt-1">
                                {(() => {
                                  const packs = (product.packOptions || []).filter(p => p.enabled);
                                  const packSize = packs.length > 0 ? packs[0].unitsCount : (product.category === 'cervejas' ? 12 : product.category === 'vinhos' ? 6 : 12);
                                  const fardosFechados = Math.floor(product.stockQuantity / packSize);
                                  const sobras = product.stockQuantity % packSize;

                                  return (
                                    <span 
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isLight 
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                          : 'bg-neutral-800 text-amber-300 border border-neutral-700'
                                      }`}
                                      title={`Controle de Venda: ${fardosFechados} fardo(s) fechado(s) de ${packSize} unidades + ${sobras} unidades avulsas`}
                                    >
                                      <Boxes className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                      <span>{fardosFechados} fardo{fardosFechados !== 1 ? 's' : ''} (c/{packSize})</span>
                                      {sobras > 0 && <span className="opacity-75">+{sobras}u</span>}
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Show in Storefront toggle */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => updateProduct(product.id, { showInStorefront: !product.showInStorefront })}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                              product.showInStorefront !== false
                                ? isLight
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : isLight
                                ? 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                            title="Clique para alternar visibilidade na vitrine online"
                          >
                            {product.showInStorefront !== false ? 'Visível na Loja' : 'Oculto'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isFoodOrPizza && (
                              <button
                                onClick={() => handleOpenReceivingForProduct(product)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                                  isLight
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                                }`}
                                title={isAdega ? 'Dar entrada de fardos ou unidades neste produto' : 'Dar entrada de estoque'}
                              >
                                <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{isAdega ? '+ Fardos' : '+ Entrada'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => onOpenProductModal(product)}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              }`}
                              title="Editar Produto"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="p-12 text-center space-y-2">
                  <Boxes className={`w-8 h-8 mx-auto ${isLight ? 'text-slate-400' : 'text-neutral-600'}`} />
                  <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Nenhum produto encontrado</p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    Ajuste os filtros de busca ou cadastre novas bebidas no estoque.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: STOCK MOVEMENTS HISTORY */}
      {activeSubTab === 'movements' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Registro Auditável de Movimentações de Estoque
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              Histórico em tempo real de entradas de mercadorias via leitor/código de barras, vendas de balcão (PDV), vendas da vitrine e importações de planilhas.
            </p>
          </div>

          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b uppercase text-[10px] tracking-wider transition-colors ${
                    isLight 
                      ? 'border-slate-200 bg-slate-100/90 text-slate-700 font-bold' 
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold'
                  }`}>
                    <th className="p-3 pl-4">Data / Hora</th>
                    <th className="p-3">Tipo de Operação</th>
                    <th className="p-3">Operador / Caixa</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Código</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-center">Estoque Antes → Depois</th>
                    <th className="p-3">NF / Observações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-neutral-800/80'}`}>
                  {tenantStockMovements.map(mov => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr 
                        key={mov.id} 
                        className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-850/50'
                        }`}
                      >
                        <td className={`p-3 pl-4 font-mono whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {new Date(mov.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(mov.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                            mov.type === 'entrada_recebimento'
                              ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : mov.type === 'venda_pdv'
                              ? isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : mov.type === 'importacao_excel'
                              ? isLight ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : isLight ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {mov.type === 'entrada_recebimento' && 'Recebimento de Mercadoria'}
                            {mov.type === 'venda_pdv' && 'Venda Balcão (PDV)'}
                            {mov.type === 'venda_online' && 'Venda Vitrine / WhatsApp'}
                            {mov.type === 'importacao_excel' && 'Importação de Planilha'}
                            {mov.type === 'ajuste_manual' && 'Ajuste Manual'}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                          }`}>
                            <User className="w-3 h-3 text-sky-400" />
                            <span>{mov.operatorName || 'Administrador'}</span>
                          </span>
                        </td>

                        <td className={`p-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {mov.productName}
                        </td>

                        <td className={`p-3 font-mono ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {mov.barcode || '—'}
                        </td>

                        <td className="p-3 text-center font-mono font-bold tabular-nums">
                          <span className={isPositive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : (isLight ? 'text-rose-600' : 'text-rose-400')}>
                            {isPositive ? `+${mov.quantity}` : mov.quantity} un
                          </span>
                        </td>

                        <td className={`p-3 text-center font-mono tabular-nums ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                          {mov.previousStock} → <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{mov.newStock}</span>
                        </td>

                        <td className={`p-3 text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {mov.supplierInvoice && (
                            <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>{mov.supplierInvoice}</span>
                          )}
                          <span>{mov.notes || '—'}</span>
                        </td>
                      </tr>
                    );
                  })}

                  {tenantStockMovements.length === 0 && (
                    <tr>
                      <td colSpan={8} className={`p-8 text-center ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
                        Nenhuma movimentação de estoque registrada até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECEBIMENTO DE MERCADORIA COM LEITOR DE CÓDIGO DE BARRAS */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-8 transition-colors ${
            isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
          }`}>
            
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    Recebimento de Mercadorias (Entrada no Estoque)
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {isAdega 
                      ? 'Informe a quantidade em fardos/caixas recebidos ou unidades avulsas'
                      : 'Informe a quantidade recebida e o custo para reposição de estoque'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceivingModalOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmReceiving} className="p-6 space-y-4">
              
              {/* Barcode Scanner Input */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  {isAdega ? 'Código de Barras da Bebida ou do Fardo *' : 'Código de Barras (EAN) do Produto *'}
                </label>
                <div className="relative">
                  <Barcode className="w-5 h-5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={receiveBarcodeInputRef}
                    type="text"
                    value={receiveBarcode}
                    onChange={(e) => handleReceiveBarcodeLookup(e.target.value)}
                    placeholder={isAdega ? 'Bipe a lata, garrafa ou o plástico do fardo...' : 'Bipe o código de barras ou selecione o item no catálogo...'}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl font-mono text-sm border transition-colors no-focus-outline outline-none focus:outline-none focus:ring-0 ${
                      isLight 
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500' 
                        : 'bg-neutral-950 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Quick Simulation Barcode Buttons */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>Testar bip rápido:</span>
                  {tenantProducts.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleReceiveBarcodeLookup(p.barcode)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] border transition-colors cursor-pointer ${
                        isLight 
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300' 
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {p.name.split(' ')[0]} ({p.barcode.slice(-4)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Identified Feedback Card */}
              {selectedProductForReceiving ? (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight 
                    ? 'bg-emerald-50/70 border-emerald-300 text-neutral-900' 
                    : 'bg-neutral-950 border-emerald-500/40 text-neutral-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {isAdega ? 'Bebida Identificada' : 'Produto Identificado'}
                    </span>
                    <span className={`text-xs font-mono ${isLight ? 'text-neutral-700' : 'text-neutral-400'}`}>
                      Estoque atual: <strong className={isLight ? 'text-neutral-900' : 'text-white'}>{selectedProductForReceiving.stockQuantity} un</strong>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {selectedProductForReceiving.imageUrl && (
                      <img
                        src={selectedProductForReceiving.imageUrl}
                        alt=""
                        className={`w-12 h-12 rounded-lg object-cover border shrink-0 ${
                          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                        }`}
                      />
                    )}
                    <div>
                      <h4 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        {selectedProductForReceiving.name}
                      </h4>
                      <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        {selectedProductForReceiving.category} · {selectedProductForReceiving.volume} · Venda R$ {selectedProductForReceiving.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : receiveBarcode.trim() ? (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Nenhum produto cadastrado com esse código. Selecione o item na lista abaixo:</span>
                </div>
              ) : null}

              {/* Product selector dropdown fallback */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Ou Escolha no Catálogo de Produtos:
                </label>
                <select
                  value={selectedProductForReceiving?.id || ''}
                  onChange={(e) => {
                    const p = tenantProducts.find(item => item.id === e.target.value);
                    if (p) {
                      handleReceiveBarcodeLookup(p.barcode);
                    }
                  }}
                  style={{
                    colorScheme: isLight ? 'light' : 'dark',
                    backgroundColor: isLight ? '#f8fafc' : '#262626',
                    color: isLight ? '#0f172a' : '#f5f5f5',
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isLight 
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500' 
                      : 'bg-neutral-800 border-neutral-700 text-white focus:border-blue-500'
                  }`}
                >
                  <option value="">-- Selecione um produto --</option>
                  {tenantProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.volume}) — Estoque atual: {p.stockQuantity} un
                    </option>
                  ))}
                </select>
              </div>

              {/* SELETOR DE MODO DE ENTRADA: FARDO OU UNIDADE - EXCLUSIVO ADEGAS */}
              {isAdega && (
                <div className="space-y-1.5 pt-1">
                  <label className={`block text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-neutral-200'}`}>
                    Como essa Mercadoria Chegou da Distribuidora? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiveMode('fardo');
                        if (receivePackCostPrice === 0 && receiveCostPrice > 0) {
                          setReceivePackCostPrice(Number((receiveCostPrice * receivePackSize).toFixed(2)));
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        receiveMode === 'fardo'
                          ? isLight
                            ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500/40'
                            : 'bg-amber-500/15 border-amber-500 text-amber-400 ring-1 ring-amber-500/40'
                          : isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                      }`}
                    >
                      <Boxes className="w-4 h-4 text-amber-500" />
                      <span>Em Fardos / Caixas (Atacado)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReceiveMode('unidade')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        receiveMode === 'unidade'
                          ? isLight
                            ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500/40'
                            : 'bg-amber-500/15 border-amber-500 text-amber-400 ring-1 ring-amber-500/40'
                          : isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                      }`}
                    >
                      <PackagePlus className="w-4 h-4 text-emerald-500" />
                      <span>Em Unidades Avulsas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CAMPOS SE FOR ENTRADA EM FARDO */}
              {receiveMode === 'fardo' ? (
                <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
                  isLight ? 'bg-amber-50/60 border-amber-300' : 'bg-neutral-950 border-amber-500/30'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Quantidade de Fardos */}
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-neutral-900' : 'text-neutral-200'}`}>
                        Qtd de Fardos Recebidos *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={receivePacksCount}
                          onChange={(e) => setReceivePacksCount(parseInt(e.target.value, 10) || 0)}
                          className={`w-full px-3 py-2 rounded-xl font-mono text-sm font-bold border focus:outline-none ${
                            isLight 
                              ? 'bg-white border-neutral-300 text-neutral-900 focus:border-blue-500' 
                              : 'bg-neutral-900 border-neutral-700 text-white focus:border-blue-500'
                          }`}
                        />
                        <div className="flex gap-1 shrink-0">
                          {[5, 10, 20].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setReceivePacksCount(cnt)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                                isLight 
                                  ? 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300' 
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                              }`}
                            >
                              +{cnt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tamanho do Fardo (Unidades por Fardo) */}
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-neutral-900' : 'text-neutral-200'}`}>
                        Unidades por Fardo *
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[6, 12, 18, 24].map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              setReceivePackSize(sz);
                              if (receiveCostPrice > 0) {
                                setReceivePackCostPrice(Number((receiveCostPrice * sz).toFixed(2)));
                              }
                            }}
                            className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                              receivePackSize === sz
                                ? isLight
                                  ? 'bg-amber-500 border-amber-600 text-neutral-950 font-extrabold shadow-xs'
                                  : 'bg-amber-500 border-amber-400 text-neutral-950 font-extrabold'
                                : isLight
                                ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                                : 'bg-neutral-850 border-neutral-700 text-neutral-300 hover:text-white'
                            }`}
                          >
                            {sz === 24 ? '24 Cx' : `${sz} un`}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Preço de Custo Pago por Fardo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-neutral-900' : 'text-neutral-200'}`}>
                        Custo Pago por Fardo (R$)
                      </label>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={receivePackCostPrice || ''}
                        onChange={(e) => setReceivePackCostPrice(parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 42.00"
                        className={`w-full px-3 py-2 rounded-xl font-mono text-sm border focus:outline-none ${
                          isLight 
                            ? 'bg-white border-neutral-300 text-neutral-900 focus:border-blue-500' 
                            : 'bg-neutral-900 border-neutral-700 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        Custo Unitário Calculado:
                      </label>
                      <div className={`px-3 py-2 rounded-xl border text-sm font-mono font-bold ${
                        isLight ? 'bg-white border-neutral-300 text-neutral-800' : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                      }`}>
                        R$ {receivePackCostPrice > 0 && receivePackSize > 0 ? (receivePackCostPrice / receivePackSize).toFixed(2) : (receiveCostPrice || 0).toFixed(2)} / un
                      </div>
                    </div>
                  </div>

                  {/* Card Verde com Cálculo Visual em Tempo Real */}
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    isLight ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900' : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-extrabold text-sm block">
                          {receivePacksCount} fardo(s) x {receivePackSize} un = {receivePacksCount * receivePackSize} unidades totais
                        </span>
                        <span className="text-[11px] opacity-90">
                          Serão adicionadas ao estoque da loja para venda avulsa e em fardos.
                        </span>
                      </div>
                    </div>
                    {selectedProductForReceiving && (
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-[10px] block opacity-75">Estoque final:</span>
                        <span className="font-bold text-sm">
                          {selectedProductForReceiving.stockQuantity + (receivePacksCount * receivePackSize)} un
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* CAMPOS SE FOR ENTRADA EM UNIDADES AVULSAS */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-neutral-900' : 'text-neutral-300'}`}>
                      Quantidade Recebida (Unidades) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        required
                        value={receiveQuantity}
                        onChange={(e) => setReceiveQuantity(parseInt(e.target.value, 10) || 0)}
                        className={`w-full px-3 py-2 rounded-xl font-mono text-sm font-bold border focus:outline-none ${
                          isLight 
                            ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500' 
                            : 'bg-neutral-950 border-neutral-700 text-white focus:border-blue-500'
                        }`}
                      />
                      <div className="flex gap-1 shrink-0">
                        {[12, 24, 48].map(qty => (
                          <button
                            key={qty}
                            type="button"
                            onClick={() => setReceiveQuantity(qty)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                              isLight 
                                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300' 
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                            }`}
                          >
                            +{qty}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-neutral-900' : 'text-neutral-300'}`}>
                      Preço de Custo Unitário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={receiveCostPrice || ''}
                      onChange={(e) => setReceiveCostPrice(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 rounded-xl font-mono text-sm border focus:outline-none ${
                        isLight 
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500' 
                          : 'bg-neutral-950 border-neutral-700 text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Supplier & Invoice info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    NF-e / Distribuidor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={receiveSupplierInvoice}
                    onChange={(e) => setReceiveSupplierInvoice(e.target.value)}
                    placeholder="Ex: NF 4521 - Ambev / Distribuidora"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isLight 
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500' 
                        : 'bg-neutral-950 border-neutral-800 text-white focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    Observação / Lote
                  </label>
                  <input
                    type="text"
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                    placeholder="Ex: Lote validade dez/2026"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isLight 
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500' 
                        : 'bg-neutral-950 border-neutral-800 text-white focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Vitrine Auto-Sync Notice */}
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                isLight ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-sky-950/20 border-sky-500/30 text-sky-300'
              }`}>
                <Store className="w-4 h-4 shrink-0 text-sky-500" />
                <span>
                  <strong>Sincronização Automática:</strong> Esta entrada aumentará o estoque imediatamente e os fardos/unidades estarão prontos para venda no balcão e na vitrine.
                </span>
              </div>

              {/* Success alert message */}
              {receivingSuccessMessage && (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{receivingSuccessMessage}</span>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className={`flex items-center justify-end gap-2 pt-4 border-t ${
                isLight ? 'border-neutral-200' : 'border-neutral-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsReceivingModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isLight ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedProductForReceiving || (receiveMode === 'fardo' ? receivePacksCount <= 0 : receiveQuantity <= 0)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedProductForReceiving && (receiveMode === 'fardo' ? receivePacksCount > 0 : receiveQuantity > 0)
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md active:scale-95'
                      : isLight ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>
                    Confirmar Entrada {receiveMode === 'fardo' ? `de ${receivePacksCount} Fardo(s) (${receivePacksCount * receivePackSize} un)` : `de ${receiveQuantity} un`}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: IMPORTAR PLANILHA EXCEL / CSV */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-8 transition-colors ${
            isLight ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
          }`}>
            
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    Importar Planilha de Produtos & Estoque
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Importação em massa via Excel, CSV ou Copiar e Colar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Botões de Ação: Baixar Modelo CSV e Carregar Exemplo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-dashed border-neutral-200 dark:border-neutral-800">
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold block ${isLight ? 'text-neutral-900' : 'text-neutral-200'}`}>
                    Modelo para preenchimento:
                  </span>
                  <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Baixe o arquivo padrão para preencher no Excel do seu computador
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={downloadSpreadsheetTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Planilha Modelo (.CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadSampleExcelData}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    Preencher Exemplo
                  </button>
                </div>
              </div>

              {/* File upload input */}
              <div className={`p-4 rounded-xl border border-dashed text-center transition-colors ${
                isLight ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-700 bg-neutral-950'
              }`}>
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".csv, .tsv, .txt, .xlsx, .xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        setExcelPasteText(content);
                        parseSpreadsheetText(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="excelFileInput"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border transition-colors shadow-2xs ${
                    isLight
                      ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                      : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
                  }`}
                >
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>Selecionar arquivo .CSV / Planilha do Computador</span>
                </label>
                <p className={`text-[11px] mt-1.5 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Ou copie as colunas direto do Excel/Google Sheets e cole na caixa abaixo:
                </p>
              </div>

              {/* Textarea for pasting */}
              <div>
                <textarea
                  rows={5}
                  value={excelPasteText}
                  onChange={(e) => {
                    setExcelPasteText(e.target.value);
                    parseSpreadsheetText(e.target.value);
                  }}
                  placeholder="CodigoBarras;NomeProduto;Categoria;Volume;PrecoVenda;PrecoCusto;Estoque;EstoqueMinimo&#10;7891991000826;Cerveja Heineken Puro Malte;cervejas;Lata 350ml;6.50;4.10;72;12"
                  className={`w-full p-3 rounded-xl font-mono text-xs border focus:outline-none transition-colors ${
                    isLight 
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Preview parsed count */}
              {parsedPreview.length > 0 && (
                <div className={`p-3 rounded-xl border space-y-2 ${
                  isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-950 border-neutral-800'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ {parsedPreview.length} produtos identificados para importação
                    </span>
                    <span className={isLight ? 'text-neutral-600 text-[11px]' : 'text-neutral-400 text-[11px]'}>
                      Serão sincronizados na vitrine online e estoque
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] font-mono">
                    {parsedPreview.slice(0, 5).map((p, idx) => (
                      <div key={idx} className={`flex justify-between py-1 border-b ${
                        isLight ? 'border-neutral-200 text-neutral-800' : 'border-neutral-900 text-neutral-300'
                      }`}>
                        <span>{p.barcode || 'Sem EAN'} · {p.name} ({p.volume})</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          R$ {p.price.toFixed(2)} · Est: {p.stockQuantity} un
                        </span>
                      </div>
                    ))}
                    {parsedPreview.length > 5 && (
                      <div className={`text-center text-[10px] pt-1 font-sans ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        ... e mais {parsedPreview.length - 5} produtos na lista
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Import Result Notification */}
              {importResult && (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  isLight 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900' 
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Importação concluída! {importResult.imported} novos produtos criados e {importResult.updated} atualizados no estoque e na vitrine.
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className={`flex items-center justify-end gap-2 pt-4 border-t ${
                isLight ? 'border-neutral-200' : 'border-neutral-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isLight ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={parsedPreview.length === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    parsedPreview.length > 0
                      ? 'btn-graphite bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 shadow-xs active:scale-95'
                      : isLight ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Confirmar e Sincronizar na Vitrine</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: GERENCIAR CATEGORIAS */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategory={(catId) => {
          setCategoryFilter(catId);
        }}
      />

    </div>
  );
};
