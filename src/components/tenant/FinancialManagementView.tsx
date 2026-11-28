import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, Expense } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Store, 
  Truck, 
  X,
  PieChart,
  Tag,
  User,
  Clock,
  Printer,
  Copy,
  Check,
  Search,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  Sparkles,
  Calculator
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
  const [periodFilter, setPeriodFilter] = useState<'hoje' | '7dias' | 'mes' | 'todos'>('hoje');

  // Simulador de Economia Anti-Marketplace
  const [simulatedMonthlyRevenue, setSimulatedMonthlyRevenue] = useState<number>(25000);

  // Filtro de texto para busca
  const [searchFilter, setSearchFilter] = useState('');

  // Fundo de Troco Inicial (persistido localmente por tenant)
  const [initialCashFund, setInitialCashFund] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`nuvi_cash_fund_${currentTenant?.id}`);
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  const [isEditingFund, setIsEditingFund] = useState(false);
  const [tempFundValue, setTempFundValue] = useState(String(initialCashFund));

  // Modal de Fechamento / Conferência de Caixa
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Modal de Lançamento de Despesa / Gasto
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('fornecedor');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<Expense['paymentMethod']>('dinheiro');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Categorias de Gastos
  const expenseCategories = [
    { id: 'fornecedor', label: 'Fornecedor / Mercadorias', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    { id: 'funcionarios', label: 'Funcionários & Diárias', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { id: 'aluguel', label: 'Aluguel & Ponto', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    { id: 'energia_agua', label: 'Energia / Luz & Água', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    { id: 'embalagens', label: 'Embalagens & Sacolas', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { id: 'manutencao', label: 'Manutenção & Equipamentos', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    { id: 'outros', label: 'Outros Gastos / Sangria', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  ];

  // Salvar fundo de troco
  const handleSaveFund = () => {
    const parsed = parseFloat(tempFundValue.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      showAlert({ title: 'Atenção', message: 'Informe um valor de troco inicial válido.', variant: 'warning' });
      return;
    }
    setInitialCashFund(parsed);
    try {
      localStorage.setItem(`nuvi_cash_fund_${currentTenant?.id}`, String(parsed));
    } catch {}
    setIsEditingFund(false);
    showAlert({ title: 'Troco Inicial Atualizado', message: `Fundo de troco definido em R$ ${parsed.toFixed(2)}.`, variant: 'success' });
  };

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

  // Vendas filtradas por período (apenas vendas efetivamente concluídas/pagas)
  const filteredOrders = useMemo(() => {
    return tenantOrders
      .filter(o => o.status !== 'cancelado')
      .filter(o => {
        if (o.deliveryType === 'mesa' || o.isTableOrder) {
          return o.status === 'finalizado' || o.tableStatus === 'fechada';
        }
        return o.status === 'finalizado' || o.status === 'em_entrega';
      })
      .filter(o => isWithinPeriod(o.createdAt))
      .filter(o => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.cashierUserName && o.cashierUserName.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tenantOrders, periodFilter, searchFilter]);

  // Gastos filtrados por período
  const filteredExpenses = useMemo(() => {
    return tenantExpenses
      .filter(e => isWithinPeriod(e.date || e.createdAt))
      .filter(e => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return (
          e.description.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [tenantExpenses, periodFilter, searchFilter]);

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
    const summary = {
      pix: 0,
      dinheiro: 0,
      cartao_debito: 0,
      cartao_credito: 0,
      cartao_entrega: 0
    };

    filteredOrders.forEach(order => {
      const method = (order.paymentMethod || 'dinheiro') as keyof typeof summary;
      if (summary[method] !== undefined) {
        summary[method] += order.total || 0;
      } else {
        summary.dinheiro += order.total || 0;
      }
    });

    return summary;
  }, [filteredOrders]);

  // Gastos pagos em dinheiro físico (saídas da gaveta)
  const cashExpensesTotal = useMemo(() => {
    return filteredExpenses
      .filter(e => e.paymentMethod === 'dinheiro')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  // Dinheiro em espécie esperado na gaveta
  // (Fundo de Troco Inicial + Vendas em Dinheiro - Despesas em Dinheiro)
  const expectedCashInDrawer = useMemo(() => {
    const fund = periodFilter === 'hoje' ? initialCashFund : 0;
    return fund + paymentBreakdown.dinheiro - cashExpensesTotal;
  }, [periodFilter, initialCashFund, paymentBreakdown.dinheiro, cashExpensesTotal]);

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
      title: 'Gasto Registrado com Sucesso!',
      message: `Despesa de R$ ${parsedAmount.toFixed(2)} cadastrada no fluxo de caixa.`,
      variant: 'success'
    });

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

  // Impressão Térmica / Relatório de Fechamento de Caixa
  const handlePrintClosingReport = () => {
    const tenantName = currentTenant?.name || 'Estabelecimento';
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const periodLabel = periodFilter === 'hoje' ? 'Hoje' : periodFilter === '7dias' ? 'Últimos 7 Dias' : periodFilter === 'mes' ? 'Este Mês' : 'Geral (Todos)';

    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) {
      showAlert({ title: 'Atenção', message: 'Permita pop-ups no seu navegador para imprimir o relatório de fechamento.', variant: 'warning' });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Fechamento de Caixa - ${tenantName}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body {
              font-family: 'Courier New', monospace;
              width: 72mm;
              margin: 4mm auto;
              padding: 0;
              font-size: 11px;
              line-height: 1.35;
              color: #000;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .subtitle { font-size: 10px; margin-bottom: 4px; }
            .highlight { background-color: #eee; padding: 3px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="title">${tenantName.toUpperCase()}</div>
            <div class="subtitle">FECHAMENTO / CONFERÊNCIA DE CAIXA</div>
            <div>Data: ${dateFormatted} às ${timeFormatted}</div>
            <div>Período: ${periodLabel}</div>
          </div>
          <div class="divider"></div>

          <div class="bold" style="margin-bottom: 4px;">RESUMO DAS ENTRADAS (VENDAS)</div>
          <div class="row"><span>Total Vendas:</span><span class="bold">R$ ${totalInflow.toFixed(2)}</span></div>
          <div class="row"><span>Qtd. Vendas:</span><span>${filteredOrders.length}</span></div>
          <div class="row"><span>Ticket Médio:</span><span>R$ ${averageTicket.toFixed(2)}</span></div>

          <div class="divider"></div>
          <div class="bold" style="margin-bottom: 4px;">FORMAS DE RECEBIMENTO</div>
          <div class="row"><span>• PIX:</span><span>R$ ${paymentBreakdown.pix.toFixed(2)}</span></div>
          <div class="row"><span>• Dinheiro (Espécie):</span><span>R$ ${paymentBreakdown.dinheiro.toFixed(2)}</span></div>
          <div class="row"><span>• Cartão Débito:</span><span>R$ ${paymentBreakdown.cartao_debito.toFixed(2)}</span></div>
          <div class="row"><span>• Cartão Crédito:</span><span>R$ ${(paymentBreakdown.cartao_credito + paymentBreakdown.cartao_entrega).toFixed(2)}</span></div>

          <div class="divider"></div>
          <div class="bold" style="margin-bottom: 4px;">CONFERÊNCIA DA GAVETA (ESPÉCIE)</div>
          ${periodFilter === 'hoje' ? `<div class="row"><span>(+) Troco Inicial:</span><span>R$ ${initialCashFund.toFixed(2)}</span></div>` : ''}
          <div class="row"><span>(+) Vendas em Dinheiro:</span><span>R$ ${paymentBreakdown.dinheiro.toFixed(2)}</span></div>
          <div class="row"><span>(-) Saídas da Gaveta:</span><span>R$ ${cashExpensesTotal.toFixed(2)}</span></div>
          <div class="row highlight"><span>(=) ESPERADO NA GAVETA:</span><span>R$ ${expectedCashInDrawer.toFixed(2)}</span></div>

          <div class="divider"></div>
          <div class="bold" style="margin-bottom: 4px;">DESPESAS / SAÍDAS TOTAIS</div>
          <div class="row"><span>Total de Despesas:</span><span class="bold">- R$ ${totalOutflow.toFixed(2)}</span></div>
          <div class="row"><span>Qtd. Despesas:</span><span>${filteredExpenses.length}</span></div>

          <div class="divider"></div>
          <div class="row bold" style="font-size: 13px;">
            <span>SALDO LÍQUIDO FINAL:</span>
            <span>R$ ${netBalance.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="center" style="font-size: 9px; margin-top: 10px;">
            NUVI Gestão Comercial & Fiscal<br/>
            Comprovante Emitido em ${dateFormatted}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copiar resumo em formato de mensagem de texto para WhatsApp
  const handleCopySummary = () => {
    const tenantName = currentTenant?.name || 'Estabelecimento';
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-BR');
    const periodLabel = periodFilter === 'hoje' ? 'Hoje' : periodFilter === '7dias' ? 'Últimos 7 Dias' : periodFilter === 'mes' ? 'Este Mês' : 'Geral';

    const text = `📊 *FECHAMENTO DE CAIXA - ${tenantName.toUpperCase()}*\n` +
      `📅 Data: ${dateFormatted} | Período: ${periodLabel}\n` +
      `----------------------------------------\n` +
      `💰 *Total Vendas:* R$ ${totalInflow.toFixed(2)} (${filteredOrders.length} pedidos)\n` +
      `💳 *PIX:* R$ ${paymentBreakdown.pix.toFixed(2)}\n` +
      `💵 *Dinheiro:* R$ ${paymentBreakdown.dinheiro.toFixed(2)}\n` +
      `💳 *Débito:* R$ ${paymentBreakdown.cartao_debito.toFixed(2)}\n` +
      `💳 *Crédito:* R$ ${(paymentBreakdown.cartao_credito + paymentBreakdown.cartao_entrega).toFixed(2)}\n` +
      `----------------------------------------\n` +
      `📥 *Dinheiro Físico na Gaveta:* R$ ${expectedCashInDrawer.toFixed(2)}\n` +
      `📉 *Despesas / Saídas:* - R$ ${totalOutflow.toFixed(2)}\n` +
      `⭐ *Saldo Líquido:* R$ ${netBalance.toFixed(2)}\n` +
      `----------------------------------------\n` +
      `_Gerado pelo sistema NUVI_`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DA GESTÃO FINANCEIRA COM BOTÕES PRINCIPAIS */}
      <div className={`p-5 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#11161B] border-[#1C2631]'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isLight ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
            }`}>
              Gestão Financeira & Caixa
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Fluxo Completo de Vendas, Despesas & Gaveta
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Painel Financeiro & Fechamento de Caixa
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Controle entradas de vendas, dinheiro físico na gaveta, despesas e imprima o fechamento do dia.
          </p>
        </div>

        {/* Ações Rápidas: Filtros de Período, Conferência de Caixa e Lançar Gasto */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Seletor de Período Padronizado */}
          <div className={`flex items-center gap-1 p-1 rounded-2xl border text-xs ${
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
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
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

          {/* Botão de Conferência & Fechamento */}
          <button
            type="button"
            onClick={() => setIsClosingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
            title="Abrir resumo para conferência da gaveta e impressão do fechamento"
          >
            <Printer className="w-4 h-4" />
            <span>Fechamento / Resumo</span>
          </button>

          {/* Botão de Lançar Gasto */}
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:shadow-rose-500/30 transition-all active:scale-[0.98] cursor-pointer bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-400/30"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Lançar Gasto</span>
          </button>
        </div>
      </div>

      {/* CARDS PRINCIPAIS: FOCO NO QUE O COMERCIANTE MAIS PRECISA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Entradas de Vendas */}
        <div className={`p-5 rounded-3xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Vendas Consolidadas
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
              <span>{filteredOrders.length} {filteredOrders.length === 1 ? 'pedido pago' : 'pedidos pagos'}</span>
            </span>
          </div>
        </div>

        {/* 2. Dinheiro Físico na Gaveta (SUPER IMPORTANTE PARA O LOJISTA) */}
        <div className={`p-5 rounded-3xl border space-y-2 shadow-sm transition-colors relative overflow-hidden ${
          isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              Gaveta / Dinheiro Vivo
            </span>
            <button
              type="button"
              onClick={() => {
                setTempFundValue(String(initialCashFund));
                setIsEditingFund(true);
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
              title="Ajustar troco inicial da abertura de caixa"
            >
              Troco: R$ {initialCashFund.toFixed(0)} ✎
            </button>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400 block">
              R$ {expectedCashInDrawer.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-semibold mt-1 flex items-center gap-1 text-amber-700/80 dark:text-amber-300/80">
              <Banknote className="w-3.5 h-3.5" />
              <span>Notas e moedas na gaveta</span>
            </span>
          </div>
        </div>

        {/* 3. Saídas (Gastos & Despesas) */}
        <div className={`p-5 rounded-3xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Saídas & Custos
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

        {/* 4. Saldo Líquido Real */}
        <div className={`p-5 rounded-3xl border space-y-2 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Saldo Líquido
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-sky-500/15 text-sky-500' : 'bg-rose-500/15 text-rose-500'
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

      </div>

      {/* 💰 CARD DE DESTAQUE: ECONOMIA ANTI-MARKETPLACE (ANTI-IFOOD) */}
      {(() => {
        const marketplaceCommissionSaved = totalInflow * 0.23; // Média de 23% cobrado por marketplaces tradicionais
        const nuviEstimatedCost = 99.0;
        const simulatedCommissionMonth = simulatedMonthlyRevenue * 0.23;
        const simulatedCommissionYear = simulatedCommissionMonth * 12;
        const nuviAnnualCost = nuviEstimatedCost * 12;
        const simulatedNetAnnualSavings = Math.max(0, simulatedCommissionYear - nuviAnnualCost);

        return (
          <div className="p-5 sm:p-6 rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 relative overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Lado Esquerdo: Economia Real do Estabelecimento */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Vantagem Competitiva NUVI
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Zero comissões por venda sobre seu faturamento
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Economia em Comissões de Marketplace</span>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Marketplaces tradicionais cobram em média <b>23% a 27%</b> de comissão sobre cada pedido. Com o seu sistema NUVI próprio, <b>100% do valor da venda fica com você</b>.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/30 border border-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Vendas no Período
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
                      R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/30 border border-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                      Taxas Marketplaces (23%)
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-rose-500">
                      - R$ {marketplaceCommissionSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Economizado no seu Bolso
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      + R$ {marketplaceCommissionSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Simulador de Economia Anual */}
              <div className="lg:w-80 shrink-0 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-sky-500" />
                    Simulador de Lucro
                  </span>
                  <span className="text-[10px] font-bold text-sky-500">Meta Mensal</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Se vender por mês:</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 text-sm">
                      R$ {simulatedMonthlyRevenue.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="80000"
                    step="5000"
                    value={simulatedMonthlyRevenue}
                    onChange={(e) => setSimulatedMonthlyRevenue(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                    <span>R$ 5k</span>
                    <span>R$ 40k</span>
                    <span>R$ 80k</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-150 dark:border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Economia no Ano:</span>
                    <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      R$ {simulatedNetAnnualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    💰 Isso paga sua assinatura NUVI por mais de 50 anos!
                  </p>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL DE EDIÇÃO RÁPIDA DE TROCO INICIAL */}
      {isEditingFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#11161B] border-[#1C2631] text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                Definir Fundo de Troco Inicial
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingFund(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Valor em dinheiro colocado na gaveta no início do turno para passar troco aos clientes.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
              <input
                type="text"
                autoFocus
                value={tempFundValue}
                onChange={(e) => setTempFundValue(e.target.value)}
                placeholder="100,00"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0B0F14] border-[#1F2C3A]'
                }`}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingFund(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFund}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm"
              >
                Salvar Troco
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETALHAMENTO DAS FORMAS DE PAGAMENTO COM PERCENTUAIS */}
      <div className={`p-5 rounded-3xl border transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#11161B] border-[#1C2631]'
      }`}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex-wrap gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <PieChart className="w-4 h-4 text-sky-500" />
            Entradas por Forma de Pagamento no Período
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Ticket Médio: <strong className={isLight ? 'text-slate-800' : 'text-white'}>R$ {averageTicket.toFixed(2)}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Total: R$ {totalInflow.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* PIX */}
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
            isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-500" />
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>PIX</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {totalInflow > 0 ? `${((paymentBreakdown.pix / totalInflow) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <span className="font-mono font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
              R$ {paymentBreakdown.pix.toFixed(2)}
            </span>
          </div>

          {/* Dinheiro */}
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
            isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-500" />
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Dinheiro</span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {totalInflow > 0 ? `${((paymentBreakdown.dinheiro / totalInflow) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <span className="font-mono font-black text-sm sm:text-base text-amber-600 dark:text-amber-400">
              R$ {paymentBreakdown.dinheiro.toFixed(2)}
            </span>
          </div>

          {/* Débito */}
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
            isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-950/20 border-sky-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Débito</span>
              </div>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-500/10 px-1.5 py-0.5 rounded">
                {totalInflow > 0 ? `${((paymentBreakdown.cartao_debito / totalInflow) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <span className="font-mono font-black text-sm sm:text-base text-sky-600 dark:text-sky-400">
              R$ {paymentBreakdown.cartao_debito.toFixed(2)}
            </span>
          </div>

          {/* Crédito */}
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
            isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/20 border-purple-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Crédito</span>
              </div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded">
                {totalInflow > 0 ? `${(((paymentBreakdown.cartao_credito + paymentBreakdown.cartao_entrega) / totalInflow) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <span className="font-mono font-black text-sm sm:text-base text-purple-600 dark:text-purple-400">
              R$ {(paymentBreakdown.cartao_credito + paymentBreakdown.cartao_entrega).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* EXTRATO DETALHADO COM ABAS E CAMPO DE BUSCA */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
          
          {/* Abas Padronizadas */}
          <div className={`flex items-center gap-1.5 p-1 rounded-2xl border text-xs ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('vendas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'vendas'
                  ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Extrato de Vendas ({filteredOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gastos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'gastos'
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Saídas & Gastos ({filteredExpenses.length})</span>
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={activeTab === 'vendas' ? 'Buscar cliente ou nº pedido...' : 'Buscar despesa ou fornecedor...'}
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500' 
                  : 'bg-[#11161B] border-[#1C2631] text-white focus:border-sky-500'
              }`}
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: EXTRATO DE VENDAS */}
        {activeTab === 'vendas' && (
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border border-dashed space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-400" />
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Nenhuma venda encontrada para este período
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  As vendas efetuadas no PDV de Balcão e os pedidos recebidos pela Vitrine/WhatsApp aparecerão automaticamente aqui.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isPDV = order.channel === 'pdv' || order.deliveryType === 'balcao';
                return (
                  <div
                    key={order.id}
                    className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-sky-300' 
                        : 'bg-[#11161B] border-[#1C2631] hover:border-sky-800'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
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
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border font-semibold ${
                            order.paymentMethod === 'pix'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : order.paymentMethod === 'dinheiro'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          }`}>
                            {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão'}
                          </span>
                        </div>

                        {/* Detalhes do Cliente, Horário e Operador */}
                        <div className={`flex items-center gap-2 flex-wrap text-xs mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span>Cliente: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{order.customerName || 'Balcão'}</strong></span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-sky-500" />
                            <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
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
              <div className={`p-12 text-center rounded-3xl border border-dashed space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <Tag className="w-10 h-10 mx-auto text-slate-400" />
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  Nenhum gasto lançado para este período
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Registre compras de mercadorias, contas de energia, embalagens ou sangria do caixa para ter controle exato do lucro real.
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
                    className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-rose-300' 
                        : 'bg-[#11161B] border-[#1C2631] hover:border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border bg-rose-500/10 text-rose-500 border-rose-500/20">
                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'white'}`}>
                            {expense.description}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                          {expense.paymentMethod && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border font-semibold ${
                              expense.paymentMethod === 'dinheiro'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}>
                              Pago em: {expense.paymentMethod}
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

      {/* MODAL DE FECHAMENTO / CONFERÊNCIA DE CAIXA */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#11161B] border-[#1C2631] text-white'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1C2631] bg-[#0E1318]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Printer className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Resumo para Fechamento de Caixa
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Conferência da gaveta, formas de pagamento e exportação
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsClosingModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Card Destaque: Dinheiro na Gaveta */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? 'bg-amber-50/80 border-amber-300 text-amber-900' : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    CONFERÊNCIA DA GAVETA FÍSICA
                  </span>
                  <span className="text-base font-black font-mono">
                    R$ {expectedCashInDrawer.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Troco Inicial:</span>
                    <strong>R$ {periodFilter === 'hoje' ? initialCashFund.toFixed(2) : '0,00'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">(+) Vendas Dinheiro:</span>
                    <strong className="text-emerald-600">R$ {paymentBreakdown.dinheiro.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">(-) Saídas Gaveta:</span>
                    <strong className="text-rose-600">R$ {cashExpensesTotal.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Detalhamento de Entradas */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Total Faturado em Vendas:</span>
                  <span className="text-emerald-500 font-mono text-sm">R$ {totalInflow.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div><span>PIX:</span> <strong className="font-mono block">R$ {paymentBreakdown.pix.toFixed(2)}</strong></div>
                  <div><span>Dinheiro:</span> <strong className="font-mono block">R$ {paymentBreakdown.dinheiro.toFixed(2)}</strong></div>
                  <div><span>Débito:</span> <strong className="font-mono block">R$ {paymentBreakdown.cartao_debito.toFixed(2)}</strong></div>
                  <div><span>Crédito:</span> <strong className="font-mono block">R$ {(paymentBreakdown.cartao_credito + paymentBreakdown.cartao_entrega).toFixed(2)}</strong></div>
                </div>
              </div>

              {/* Saídas e Saldo */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <div>
                  <span className="text-slate-500 block text-[10px]">TOTAL DE DESPESAS</span>
                  <span className="text-rose-500 font-mono text-sm">- R$ {totalOutflow.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">SALDO LÍQUIDO FINAL</span>
                  <span className={`font-mono text-sm ${netBalance >= 0 ? 'text-sky-500' : 'text-rose-500'}`}>
                    R$ {netBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ações do Modal: Imprimir e Copiar para WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                    copiedSummary
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-slate-200 border-neutral-700'
                  }`}
                >
                  {copiedSummary ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? 'Copiado para o WhatsApp!' : 'Copiar Resumo em Texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintClosingReport}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Cupom de Fechamento</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

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
                    Registre custos da loja para cálculo automático do lucro real e da gaveta
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
                  placeholder="Ex: Fornecedor de queijos, Diária de motoboy, Conta de luz, Sangria para o cofre..."
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
                    Forma de Pagamento (Saiu de onde?)
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
                    <option value="dinheiro" className="bg-slate-900 text-white">💵 Dinheiro (Saiu da Gaveta do Caixa)</option>
                    <option value="pix" className="bg-slate-900 text-white">📱 PIX (Conta Bancária)</option>
                    <option value="cartao_debito" className="bg-slate-900 text-white">💳 Cartão de Débito</option>
                    <option value="cartao_credito" className="bg-slate-900 text-white">💳 Cartão de Crédito</option>
                    <option value="transferencia" className="bg-slate-900 text-white">🏦 Transferência Bancária / TED</option>
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
                  placeholder="Ex: NF 1234, pago à vista com desconto, entregue na loja..."
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
