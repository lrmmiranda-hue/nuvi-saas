import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, PaymentMethod, Expense } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Calendar, 
  Trash2, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Store, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  X,
  PieChart,
  Tag,
  User,
  Clock
} from 'lucide-react';

export const FinancialManagementView: React.FC = () => {
  const { 
    currentTenant, 
    tenantOrders, 
    tenantExpenses, 
    addExpense, 
    deleteExpense, 
    showAlert, 
    showConfirm,
    themeMode 
  } = useStore();

  const isLight = themeMode === 'light';

  // Sub-abas: 'vendas' (Entradas) vs 'gastos' (Saídas)
  const [activeTab, setActiveTab] = useState<'vendas' | 'gastos'>('vendas');

  // Filtro de Período: 'hoje' | '7dias' | 'mes' | 'todos'
  const [periodFilter, setPeriodFilter] = useState<'hoje' | '7dias' | 'mes' | 'todos'>('mes');

  // Modal de Lançamento de Despesa / Gasto
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('fornecedor');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<Expense['paymentMethod']>('pix');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Categorias de Gastos
  const expenseCategories = [
    { id: 'fornecedor', label: 'Fornecedor / Mercadorias', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    { id: 'aluguel', label: 'Aluguel & Ponto', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    { id: 'funcionarios', label: 'Funcionários & Diárias', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { id: 'energia_agua', label: 'Energia / Luz & Água', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    { id: 'embalagens', label: 'Embalagens & Sacolas', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { id: 'manutencao', label: 'Manutenção & Equipamentos', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    { id: 'outros', label: 'Outros Gastos Operacionais', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  ];

  // Helper de filtragem de data
  const isWithinPeriod = (dateStr: string) => {
    if (periodFilter === 'todos') return true;
    const itemDate = new Date(dateStr);
    const now = new Date();
    
    if (periodFilter === 'hoje') {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    
    if (periodFilter === '7dias') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }
    
    if (periodFilter === 'mes') {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    
    return true;
  };

  // Vendas filtradas por período (apenas pedidos não cancelados)
  const filteredOrders = useMemo(() => {
    return tenantOrders
      .filter(o => o.status !== 'cancelado')
      .filter(o => isWithinPeriod(o.createdAt))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tenantOrders, periodFilter]);

  // Gastos filtrados por período
  const filteredExpenses = useMemo(() => {
    return tenantExpenses
      .filter(e => isWithinPeriod(e.date || e.createdAt))
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [tenantExpenses, periodFilter]);

  // Cálculos Financeiros
  const totalInflow = useMemo(() => {
    return filteredOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  }, [filteredOrders]);

  const totalOutflow = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const netBalance = totalInflow - totalOutflow;

  const averageTicket = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    return totalInflow / filteredOrders.length;
  }, [totalInflow, filteredOrders.length]);

  // Vendas por Forma de Pagamento
  const paymentBreakdown = useMemo(() => {
    const summary: Record<string, number> = {
      pix: 0,
      dinheiro: 0,
      cartao_debito: 0,
      cartao_credito: 0,
      cartao_entrega: 0
    };

    filteredOrders.forEach(order => {
      const method = order.paymentMethod || 'dinheiro';
      summary[method] = (summary[method] || 0) + (order.total || 0);
    });

    return summary;
  }, [filteredOrders]);

  // Handler para salvar novo gasto
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(expenseAmount.replace(',', '.'));
    if (!expenseDescription.trim()) {
      showAlert({ title: 'Atenção', message: 'Informe a descrição do gasto.', variant: 'warning' });
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showAlert({ title: 'Atenção', message: 'Informe um valor válido maior que zero.', variant: 'warning' });
      return;
    }

    addExpense({
      description: expenseDescription.trim(),
      category: expenseCategory,
      amount: parsedAmount,
      paymentMethod: expensePaymentMethod,
      date: expenseDate || new Date().toISOString().split('T')[0],
      notes: expenseNotes.trim(),
    });

    showAlert({
      title: 'Gasto Lançado com Sucesso!',
      message: `Despesa de R$ ${parsedAmount.toFixed(2)} cadastrada no fluxo de caixa.`,
      variant: 'success'
    });

    // Reset formulário
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseNotes('');
    setIsExpenseModalOpen(false);
  };

  // Handler para deletar gasto
  const handleDeleteExpense = (id: string, desc: string) => {
    showConfirm({
      title: 'Excluir Lançamento de Gasto?',
      message: `Tem certeza que deseja remover "${desc}" do fluxo de caixa?`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteExpense(id);
        showAlert({ title: 'Removido', message: 'Lançamento de gasto excluído com sucesso.', variant: 'info' });
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DA GESTÃO FINANCEIRA */}
      <div className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#11161B] border-[#1C2631]'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
              isLight ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
            }`}>
              Gestão Financeira & Caixa
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Fluxo Completo de Vendas e Despesas
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Painel de Gestão & Resultados
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Visualize entradas de vendas, controle saídas de fornecedores/custos e acompanhe o lucro real do estabelecimento.
          </p>
        </div>

        {/* Filtros de Período Rápido */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0B0F14] border-[#1C2631]'
          }`}>
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: '7dias', label: '7 Dias' },
              { id: 'mes', label: 'Este Mês' },
              { id: 'todos', label: 'Todos' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  periodFilter === p.id
                    ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Botão de Lançar Gasto */}
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-rose-600/25 hover:shadow-rose-500/40 transition-all active:scale-[0.98] cursor-pointer bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-400/30"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Lançar Gasto / Despesa</span>
          </button>
        </div>
      </div>

      {/* CARDS PRINCIPAIS DE FLUXO DE CAIXA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Entradas (Vendas) */}
        <div className={`p-5 rounded-2xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Entradas (Vendas)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-emerald-500 block">
              R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] font-semibold mt-1 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Receipt className="w-3.5 h-3.5 text-emerald-500" />
              <span>{filteredOrders.length} {filteredOrders.length === 1 ? 'venda registrada' : 'vendas registradas'}</span>
            </span>
          </div>
        </div>

        {/* 2. Saídas (Gastos & Despesas) */}
        <div className={`p-5 rounded-2xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Saídas (Gastos & Custos)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-rose-500 block">
              R$ {totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] font-semibold mt-1 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>{filteredExpenses.length} {filteredExpenses.length === 1 ? 'despesa lançada' : 'despesas lançadas'}</span>
            </span>
          </div>
        </div>

        {/* 3. Saldo Líquido / Caixa */}
        <div className={`p-5 rounded-2xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Saldo Líquido em Caixa
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-sky-500/15 text-sky-500' : 'bg-amber-500/15 text-amber-500'
            }`}>
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className={`text-2xl sm:text-3xl font-black font-mono tabular-nums block ${
              netBalance >= 0 ? 'text-sky-500' : 'text-rose-500'
            }`}>
              R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] font-bold mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
              netBalance >= 0 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}>
              {netBalance >= 0 ? '✓ Caixa Positivo' : '⚠️ Caixa Negativo'}
            </span>
          </div>
        </div>

        {/* 4. Ticket Médio */}
        <div className={`p-5 rounded-2xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Ticket Médio por Venda
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className={`text-2xl sm:text-3xl font-black font-mono tabular-nums block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Valor médio consumido por cliente
            </span>
          </div>
        </div>

      </div>

      {/* DETALHAMENTO DE FORMAS DE PAGAMENTO DAS VENDAS */}
      <div className={`p-4 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#11161B] border-[#1C2631]'
      }`}>
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <PieChart className="w-4 h-4 text-sky-500" />
            Entradas por Forma de Pagamento no Período
          </span>
          <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Total: R$ {totalInflow.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* PIX */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-500" />
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>PIX</span>
            </div>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              R$ {paymentBreakdown.pix.toFixed(2)}
            </span>
          </div>

          {/* Dinheiro */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-500" />
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Dinheiro</span>
            </div>
            <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
              R$ {paymentBreakdown.dinheiro.toFixed(2)}
            </span>
          </div>

          {/* Débito */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-950/20 border-sky-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-500" />
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Débito</span>
            </div>
            <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400">
              R$ {paymentBreakdown.cartao_debito.toFixed(2)}
            </span>
          </div>

          {/* Crédito */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/20 border-purple-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Crédito</span>
            </div>
            <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400">
              R$ {(paymentBreakdown.cartao_credito + paymentBreakdown.cartao_entrega).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE EXTRATO: VENDAS (ENTRADAS) vs GASTOS (SAÍDAS) */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('vendas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'vendas'
                  ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Extrato de Vendas Realizadas ({filteredOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gastos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'gastos'
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Lançamentos de Saídas / Gastos ({filteredExpenses.length})</span>
            </button>
          </div>

          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Exibindo registros de acordo com o filtro selecionado
          </span>
        </div>

        {/* TAB 1: EXTRATO DE VENDAS */}
        {activeTab === 'vendas' && (
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border border-dashed space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-400" />
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Nenhuma venda encontrada para este período
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  As vendas efetuadas no PDV de Balcão e os pedidos recebidos pela Vitrine/WhatsApp aparecerão automaticamente aqui com todos os detalhes.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isPDV = order.channel === 'pdv' || order.deliveryType === 'balcao';
                return (
                  <div
                    key={order.id}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-sky-300' 
                        : 'bg-[#11161B] border-[#1C2631] hover:border-sky-800'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPDV
                          ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {isPDV ? <Store className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            #{order.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isPDV
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}>
                            {isPDV ? '🏪 Venda Balcão (PDV)' : '🛵 Pedido Delivery / Online'}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border font-semibold ${
                            order.paymentMethod === 'pix'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : order.paymentMethod === 'dinheiro'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          }`}>
                            {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão'}
                          </span>
                        </div>

                        {/* Detalhes do Cliente, Horário e Operador do Caixa */}
                        <div className={`flex items-center gap-2 flex-wrap text-xs mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span>Cliente: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{order.customerName || 'Balcão'}</strong></span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-sky-500" />
                            <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold text-[10px]">
                            <User className="w-3 h-3" />
                            <span>Caixa: {order.cashierUserName || 'Administrador'}</span>
                          </span>
                        </div>

                        <p className={`text-[11px] mt-1 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {order.items.map(item => `${item.quantity}x ${item.productName}`).join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Recebido</span>
                      <span className="text-xl font-black font-mono tabular-nums text-emerald-500">
                        + R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: LANÇAMENTOS DE SAÍDAS / GASTOS */}
        {activeTab === 'gastos' && (
          <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border border-dashed space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <Tag className="w-10 h-10 mx-auto text-slate-400" />
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Nenhum gasto lançado para este período
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Registre compras de fornecedores, contas de energia, aluguel ou diárias para ter controle exato do seu lucro líquido.
                </p>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-md"
                >
                  + Lançar Primeiro Gasto
                </button>
              </div>
            ) : (
              filteredExpenses.map((expense) => {
                const catInfo = expenseCategories.find(c => c.id === expense.category) || expenseCategories[0];

                return (
                  <div
                    key={expense.id}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-rose-300' 
                        : 'bg-[#11161B] border-[#1C2631] hover:border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border bg-rose-500/10 text-rose-500 border-rose-500/20">
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {expense.description}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                          {expense.paymentMethod && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border font-semibold ${
                              isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}>
                              {expense.paymentMethod}
                            </span>
                          )}
                        </div>

                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Data: <strong>{new Date(expense.date || expense.createdAt).toLocaleDateString('pt-BR')}</strong>
                          {expense.notes && (
                            <>
                              <span className="mx-1.5">·</span>
                              <span>{expense.notes}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Pago</span>
                        <span className="text-xl font-black font-mono tabular-nums text-rose-500">
                          - R$ {Number(expense.amount).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense.id, expense.description)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isLight
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                            : 'bg-rose-950/20 hover:bg-rose-900/40 border-rose-900/40 text-rose-400'
                        }`}
                        title="Excluir este lançamento de gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {/* MODAL DE LANÇAR NOVO GASTO / DESPESA */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#11161B] border-[#1C2631] text-white'
          }`}>
            
            <div className={`p-5 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1C2631] bg-[#0E1318]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Lançar Saída / Gasto Operacional
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Registre custos da loja para cálculo automático do lucro real
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              
              {/* Descrição */}
              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Descrição do Gasto / Despesa *
                </label>
                <input
                  type="text"
                  required
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Ex: Pagamento Fornecedor Ambev, Conta de Luz, Compra de Gelo..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500 focus:bg-white'
                      : 'bg-[#0B0F14] border-[#1F2C3A] text-white focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Grid: Valor e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Valor do Gasto (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input
                      type="text"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0,00"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold outline-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500 focus:bg-white'
                          : 'bg-[#0B0F14] border-[#1F2C3A] text-white focus:border-rose-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Categoria do Gasto
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                        : 'bg-[#0B0F14] border-[#1F2C3A] text-white focus:border-rose-500'
                    }`}
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Forma de Pagamento e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Forma de Pagamento
                  </label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                        : 'bg-[#0B0F14] border-[#1F2C3A] text-white focus:border-rose-500'
                    }`}
                  >
                    <option value="pix" className="bg-slate-900 text-white">PIX</option>
                    <option value="dinheiro" className="bg-slate-900 text-white">Dinheiro</option>
                    <option value="cartao_debito" className="bg-slate-900 text-white">Cartão de Débito</option>
                    <option value="cartao_credito" className="bg-slate-900 text-white">Cartão de Crédito</option>
                    <option value="transferencia" className="bg-slate-900 text-white">Transferência Bancária</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Data do Gasto
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                        : 'bg-[#0B0F14] border-[#1F2C3A] text-white focus:border-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Observações Opcionais */}
              <div>
                <label className={`block font-bold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Observações ou Nº de Nota Fiscal (Opcional)
                </label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="Ex: NF 1234, pago à vista com desconto..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500'
                      : 'bg-[#0B0F14] border-[#1F2C3A] text-white focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-neutral-800 hover:bg-neutral-700 text-slate-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40 transition-all active:scale-[0.98] cursor-pointer bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-400/30"
                >
                  Confirmar Lançamento do Gasto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
