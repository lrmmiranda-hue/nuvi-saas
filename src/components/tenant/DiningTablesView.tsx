import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, Product, PaymentMethod } from '../../types';
import { TableQRCodeModal } from './TableQRCodeModal';
import { 
  UtensilsCrossed, 
  Users, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Receipt, 
  DollarSign, 
  Printer, 
  X, 
  AlertCircle,
  Search,
  Sparkles,
  QrCode,
  CreditCard,
  Banknote,
  Boxes,
  Check,
  Trash2,
  ArrowRightLeft,
  Share2,
  Send,
  Smartphone,
  Calculator,
  UserCheck
} from 'lucide-react';
import { PDVPixModal } from './PDVPixModal';

export const DiningTablesView: React.FC = () => {
  const {
    currentTenant,
    tenantOrders,
    tenantProducts,
    updateOrderStatus,
    createOrder,
    closeAndConsolidateTableOrders,
    removeOrderItemFromTable,
    transferTableOrders,
    currentStoreUser,
    showConfirm,
    themeMode,
    showAlert
  } = useStore();

  const isLight = themeMode === 'light';

  const tableCount = currentTenant?.config?.tableCount || 12;
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'todas' | 'ocupadas' | 'livres'>('todas');
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

  // Modal de adicionar produto manual à mesa pelo garçom/caixa
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  // Modal de transferência de mesa (exclusivo do lojista/gestor)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetTableNum, setTargetTableNum] = useState<number | ''>('');

  // Envio de conta pelo WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [showWhatsappInput, setShowWhatsappInput] = useState(false);

  // Divisão de Conta (Racha Conta por pessoas)
  const [splitCount, setSplitCount] = useState(1);
  // Registro de pagamentos por pessoa: { [personIndex: number]: { paid: boolean; method: PaymentMethod; amount: number; at: string } }
  const [splitPayments, setSplitPayments] = useState<Record<number, { paid: boolean; method: PaymentMethod; amount: number; at: string }>>({});
  const [activePayingPerson, setActivePayingPerson] = useState<number | null>(null);

  // Modal de fechamento de conta
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isPixPaymentModalOpen, setIsPixPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [applyServiceFee, setApplyServiceFee] = useState(true);
  const [cashAmountGiven, setCashAmountGiven] = useState('');

  // Pedidos de mesa ativos (não finalizados nem cancelados)
  const activeTableOrders = tenantOrders.filter(o => 
    (o.deliveryType === 'mesa' || o.isTableOrder) && 
    o.status !== 'finalizado' && 
    o.status !== 'cancelado' &&
    o.tableStatus !== 'fechada'
  );

  // Mapeamento das mesas de 1 a tableCount
  const tables = Array.from({ length: tableCount }, (_, idx) => {
    const num = idx + 1;
    const tableIdStr = num.toString().padStart(2, '0');
    
    // Pedidos vinculados a essa mesa com comparação robusta por número inteiro
    const orders = activeTableOrders.filter(o => {
      const tNum = (o.tableNumber || '').replace(/\D/g, '');
      const tInt = parseInt(tNum, 10);
      if (!isNaN(tInt) && tInt === num) return true;
      const cleanT = (o.tableNumber || '').trim().toLowerCase();
      return cleanT === `mesa ${num}` || cleanT === `mesa ${tableIdStr}` || cleanT === tableIdStr || cleanT === num.toString();
    });

    const isOccupied = orders.length > 0;
    const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const earliestOrder = orders.length > 0 
      ? orders.reduce((prev, curr) => new Date(prev.createdAt) < new Date(curr.createdAt) ? prev : curr) 
      : null;

    // Status da cozinha em tempo real para a mesa
    const hasReadyItems = orders.some(o => o.status === 'pronto');
    const hasPreparingItems = orders.some(o => o.status === 'preparando' || o.status === 'novo');
    const allDelivered = orders.length > 0 && orders.every(o => o.status === 'entregue');

    return {
      number: num,
      name: `Mesa ${tableIdStr}`,
      isOccupied,
      orders,
      totalAmount,
      openedAt: earliestOrder ? earliestOrder.createdAt : undefined,
      customerName: earliestOrder ? earliestOrder.customerName : undefined,
      hasReadyItems,
      hasPreparingItems,
      allDelivered,
    };
  });

  const occupiedTablesCount = tables.filter(t => t.isOccupied).length;
  const availableTablesCount = tableCount - occupiedTablesCount;
  const totalOpenRevenue = tables.reduce((sum, t) => sum + t.totalAmount, 0);

  const filteredTables = tables.filter(t => {
    if (filterMode === 'ocupadas') return t.isOccupied;
    if (filterMode === 'livres') return !t.isOccupied;
    return true;
  });

  const currentTable = selectedTableNum ? tables.find(t => t.number === selectedTableNum) : null;

  // Lançar novo item na mesa manualmente pelo garçom/balconista
  const handleAddItemToTable = () => {
    if (!currentTable || !selectedProduct) return;

    createOrder({
      customerName: currentTable.customerName || `Cliente ${currentTable.name}`,
      customerPhone: '',
      deliveryType: 'mesa',
      tableNumber: currentTable.number.toString().padStart(2, '0'),
      isTableOrder: true,
      tableStatus: 'aberta',
      deliveryFee: 0,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          barcode: selectedProduct.barcode,
          price: selectedProduct.promoPrice ?? selectedProduct.price,
          quantity: itemQuantity,
          chilled: false,
          notes: itemNotes,
          volume: selectedProduct.volume || 'Unidade',
        }
      ],
      subtotal: (selectedProduct.promoPrice ?? selectedProduct.price) * itemQuantity,
      total: (selectedProduct.promoPrice ?? selectedProduct.price) * itemQuantity,
      paymentMethod: 'pix',
      status: 'preparando',
      notes: itemNotes,
    });

    showAlert({
      title: 'Item Lançado!',
      message: `${itemQuantity}x ${selectedProduct.name} adicionado à ${currentTable.name}.`,
      variant: 'success'
    });

    setIsAddItemModalOpen(false);
    setSelectedProduct(null);
    setItemQuantity(1);
    setItemNotes('');
  };

  // Impressão da pré-conta para conferência do cliente na mesa
  const handlePrintBill = () => {
    if (!currentTable) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor, permita pop-ups para imprimir a pré-conta.');
      return;
    }

    const subtotal = currentTable.totalAmount;
    const serviceFee = applyServiceFee ? subtotal * 0.10 : 0;
    const finalTotal = subtotal + serviceFee;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pré-Conta - ${currentTable.name} - ${currentTenant?.name}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .text-center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h2 style="margin: 0; font-size: 16px;">${currentTenant?.name}</h2>
            <p style="margin: 2px 0; font-size: 11px;">${currentTenant?.slogan || 'Extrato de Conferência de Mesa'}</p>
            <div class="divider"></div>
            <h3 style="margin: 4px 0; font-size: 18px;">${currentTable.name}</h3>
            <p style="margin: 2px 0; font-size: 11px;">Aberta em: ${currentTable.openedAt ? new Date(currentTable.openedAt).toLocaleTimeString('pt-BR') : '--:--'}</p>
            <div class="divider"></div>
          </div>
          <div>
            ${currentTable.orders.flatMap(o => o.items).map(item => `
              <div class="item-row">
                <span>${item.quantity}x ${item.productName}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="divider"></div>
          <div class="item-row">
            <span>Subtotal:</span>
            <span>R$ ${subtotal.toFixed(2)}</span>
          </div>
          ${applyServiceFee ? `
            <div class="item-row">
              <span>Taxa de Serviço (10%):</span>
              <span>R$ ${serviceFee.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item-row bold" style="font-size: 14px; margin-top: 4px;">
            <span>TOTAL:</span>
            <span>R$ ${finalTotal.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <p class="text-center" style="font-size: 10px; margin-top: 10px;">Não é documento fiscal.<br/>Agradecemos a preferência!</p>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  // Enviar extrato / pré-conta formatada no WhatsApp da mesa
  const handleSendBillViaWhatsApp = (targetPhone?: string) => {
    if (!currentTable) return;
    const phone = (targetPhone || whatsappPhone).replace(/\D/g, '');
    if (!phone) {
      showAlert({
        title: 'Telefone Obrigatório',
        message: 'Digite o número do WhatsApp com DDD para enviar a comanda.',
        variant: 'warning'
      });
      return;
    }

    const subtotal = currentTable.totalAmount;
    const serviceFee = applyServiceFee ? subtotal * 0.10 : 0;
    const finalTotal = subtotal + serviceFee;

    const itemsText = currentTable.orders
      .flatMap(o => o.items)
      .map(it => `• ${it.quantity}x ${it.productName} - R$ ${(it.price * it.quantity).toFixed(2).replace('.', ',')}`)
      .join('\n');

    let msg = `🧾 *CONTA / EXTRATO - ${currentTable.name}*\n`;
    msg += `🏬 *${currentTenant?.name || 'Nosso Estabelecimento'}*\n`;
    msg += `─────────────────────────\n`;
    msg += `*Itens Consumidos:*\n${itemsText}\n`;
    msg += `─────────────────────────\n`;
    msg += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (applyServiceFee) {
      msg += `Taxa de Serviço (10%): R$ ${serviceFee.toFixed(2).replace('.', ',')}\n`;
    }
    msg += `*TOTAL A PAGAR: R$ ${finalTotal.toFixed(2).replace('.', ',')}*\n`;
    if (splitCount > 1) {
      const perPerson = finalTotal / splitCount;
      msg += `👥 *Divisão (${splitCount} pessoas):* R$ ${perPerson.toFixed(2).replace('.', ',')} por pessoa\n`;
    }
    if (currentTenant?.pixKey) {
      msg += `\n🔑 *Chave PIX:* ${currentTenant.pixKey}\n`;
      if (currentTenant.pixName) msg += `(${currentTenant.pixName})\n`;
    }
    msg += `\nMuito obrigado pela preferência e volte sempre! 🙏✨`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${encoded}`, '_blank');
  };

  // Transferência de Mesa (Restrito ao dono/gerente do estabelecimento)
  const handleTransferTable = () => {
    if (!currentTable || !targetTableNum) return;

    // Validação de permissão: somente gerente ou dono (admin)
    const isOwnerOrManager = !currentStoreUser || currentStoreUser.role === 'admin' || currentStoreUser.role === 'manager';
    if (!isOwnerOrManager) {
      showAlert({
        title: 'Acesso Restrito',
        message: 'Apenas o dono ou gerente do estabelecimento tem autorização para transferir comandas entre mesas.',
        variant: 'danger'
      });
      return;
    }

    const toNum = Number(targetTableNum);
    if (toNum === currentTable.number) {
      showAlert({
        title: 'Mesa Inválida',
        message: 'A mesa de destino deve ser diferente da mesa atual.',
        variant: 'warning'
      });
      return;
    }

    const success = transferTableOrders(currentTable.number.toString(), toNum.toString());

    if (success) {
      showAlert({
        title: 'Mesa Transferida com Sucesso!',
        message: `Todos os pedidos e consumo da ${currentTable.name} foram transferidos para a Mesa ${toNum.toString().padStart(2, '0')}.`,
        variant: 'success'
      });
      setIsTransferModalOpen(false);
      setTargetTableNum('');
      setSelectedTableNum(toNum);
    } else {
      showAlert({
        title: 'Erro na Transferência',
        message: 'Não foi possível encontrar pedidos ativos nesta mesa para transferir.',
        variant: 'danger'
      });
    }
  };

  // Remover item lançado por engano com confirmação
  const handleRemoveItem = (orderId: string, itemIdx: number, itemName: string) => {
    showConfirm({
      title: 'Remover Item Lançado?',
      message: `Deseja realmente excluir "${itemName}" desta comanda? O total da mesa será recalculado automaticamente.`,
      confirmText: 'Sim, Remover',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        removeOrderItemFromTable(orderId, itemIdx);
        showAlert({
          title: 'Item Removido',
          message: `"${itemName}" foi retirado da comanda da ${currentTable?.name}.`,
          variant: 'success'
        });
      }
    });
  };

  // Executa o encerramento e consolidação definitiva da mesa
  const executeCloseTable = (methodToUse: PaymentMethod = paymentMethod) => {
    if (!currentTable) return;

    // Consolida todos os itens e pedidos da comanda em UMA ÚNICA venda total
    const consolidated = closeAndConsolidateTableOrders(
      currentTable.number.toString(),
      methodToUse,
      applyServiceFee
    );

    const valorTotal = consolidated?.total ?? (currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0));

    showAlert({
      title: 'Mesa Fechada com Sucesso!',
      message: `A ${currentTable.name} foi encerrada. Venda total consolidada de R$ ${valorTotal.toFixed(2).replace('.', ',')} lançada no Extrato de Vendas!`,
      variant: 'success'
    });

    setIsClosingModalOpen(false);
    setIsPixPaymentModalOpen(false);
    setSelectedTableNum(null);
    setCashAmountGiven('');
    setSplitCount(1);
    setSplitPayments({});
    setActivePayingPerson(null);
  };

  // Registrar pagamento individual de uma pessoa no racha-conta
  const handlePayIndividualSplit = (personIdx: number, methodToUse: PaymentMethod = paymentMethod) => {
    if (!currentTable) return;
    const totalComTaxa = currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0);
    const valorPorPessoa = totalComTaxa / splitCount;

    if (methodToUse === 'pix') {
      setActivePayingPerson(personIdx);
      setIsPixPaymentModalOpen(true);
      return;
    }

    const updated = {
      ...splitPayments,
      [personIdx]: {
        paid: true,
        method: methodToUse,
        amount: valorPorPessoa,
        at: new Date().toLocaleTimeString('pt-BR')
      }
    };
    setSplitPayments(updated);

    showAlert({
      title: 'Parte Paga com Sucesso!',
      message: `Pessoa ${personIdx + 1} pagou sua parte de R$ ${valorPorPessoa.toFixed(2).replace('.', ',')} via ${methodToUse.replace('_', ' ')}.`,
      variant: 'success'
    });

    // Se todas as pessoas pagaram suas partes, finaliza a mesa automaticamente!
    const paidCount = Object.values(updated).filter(p => p.paid).length;
    if (paidCount >= splitCount) {
      setTimeout(() => {
        executeCloseTable(methodToUse);
      }, 600);
    }
  };

  // Fechar a mesa, registrar recebimento e liberar mesa
  const handleFinalizeAndCloseTable = () => {
    if (!currentTable) return;
    if (paymentMethod === 'pix') {
      setIsPixPaymentModalOpen(true);
      return;
    }
    executeCloseTable(paymentMethod);
  };

  return (
    <div className="space-y-6">

      {/* Header com Indicadores do Salão */}
      <div className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0E1318] border-[#1C2631]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Gestão de Mesas & Atendimento no Salão
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Ao Vivo
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Pedidos feitos pelo cardápio no salão entram direto na mesa e na cozinha em tempo real.
            </p>
          </div>
        </div>

        {/* Resumo de Indicadores */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className={`px-3 py-2 rounded-xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Mesas Ocupadas</span>
            <span className="text-base font-black text-sky-500">
              {occupiedTablesCount} <span className="text-xs font-normal text-slate-400">/ {tableCount}</span>
            </span>
          </div>

          <div className={`px-3 py-2 rounded-xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Mesas Livres</span>
            <span className="text-base font-black text-emerald-500">
              {availableTablesCount}
            </span>
          </div>

          <div className={`px-3.5 py-2 rounded-xl border text-center ${
            isLight ? 'bg-sky-50 border-sky-200' : 'bg-sky-950/20 border-sky-500/30'
          }`}>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 block uppercase">Em Aberto no Salão</span>
            <span className="text-base font-black text-sky-600 dark:text-sky-300">
              R$ {totalOpenRevenue.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsQRCodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl nuvi-btn-cyber-blue text-white font-bold text-xs shadow-md shadow-[#0C2340]/40 transition-all cursor-pointer hover:brightness-110 active:scale-95 shrink-0"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>Plaquinhas QR Code</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#11161B] border-[#1C2631]'
        }`}>
          {[
            { id: 'todas', label: 'Todas as Mesas', count: tableCount },
            { id: 'ocupadas', label: 'Ocupadas', count: occupiedTablesCount },
            { id: 'livres', label: 'Livres', count: availableTablesCount },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                filterMode === f.id
                  ? 'nuvi-btn-cyber-blue text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-[#161D24]'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterMode === f.id ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-slate-500'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Clique em uma mesa ocupada para ver o extrato ou fechar a conta
        </p>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {filteredTables.map((table) => {
          const isSelected = selectedTableNum === table.number;

          return (
            <div
              key={table.number}
              onClick={() => setSelectedTableNum(table.number)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group select-none ${
                isSelected
                  ? 'ring-2 ring-sky-500 scale-[1.02]'
                  : ''
              } ${
                table.hasReadyItems
                  ? isLight
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/40 shadow-md'
                    : 'bg-emerald-950/30 border-emerald-500/70 ring-2 ring-emerald-500/30 shadow-md'
                  : table.isOccupied
                  ? isLight
                    ? 'bg-sky-50/70 border-sky-300 shadow-sm hover:shadow-md'
                    : 'bg-[#0E1B2A] border-sky-600/50 hover:border-sky-400 shadow-md'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  : 'bg-[#0D141C] border-[#1A2533] hover:border-slate-700 hover:bg-[#131E2B]'
              }`}
            >
              <div>
                {/* Header do Card da Mesa */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      table.isOccupied
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {table.isOccupied ? 'Ocupada' : 'Livre'}
                    </span>

                    {/* Alerta de Cozinha em Tempo Real na Mesa */}
                    {table.hasReadyItems && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 animate-pulse shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        Pronto!
                      </span>
                    )}
                    {!table.hasReadyItems && table.hasPreparingItems && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        👨‍🍳 Cozinha
                      </span>
                    )}
                  </div>
                  
                  {table.isOccupied ? (
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                  ) : (
                    <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                {/* Número Grande da Mesa */}
                <h3 className={`text-lg sm:text-xl font-black mb-1 ${
                  table.isOccupied
                    ? isLight ? 'text-sky-900' : 'text-white'
                    : isLight ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  {table.name}
                </h3>

                {table.isOccupied ? (
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 truncate">
                      {table.customerName || `${table.orders.length} pedidos`}
                    </p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                        {table.openedAt ? `${new Date(table.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </span>
                      {table.openedAt && (() => {
                        const diffMins = Math.floor((Date.now() - new Date(table.openedAt).getTime()) / 60000);
                        const isLongStay = diffMins >= 45;
                        return (
                          <span
                            className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                              isLongStay
                                ? 'bg-amber-500/20 text-amber-500 font-extrabold'
                                : 'text-slate-400'
                            }`}
                            title={isLongStay ? 'Mesa há bastante tempo no salão! Que tal oferecer mais um pedido?' : 'Tempo de permanência'}
                          >
                            ⏱️ {diffMins}m
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Pronta para clientes
                  </p>
                )}
              </div>

              {/* Valor Parcial da Mesa */}
              <div className={`mt-3 pt-2.5 border-t flex items-baseline justify-between ${
                table.isOccupied 
                  ? 'border-sky-200 dark:border-sky-800/40' 
                  : isLight ? 'border-slate-100' : 'border-[#1A2533]'
              }`}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total:</span>
                <span className={`text-sm font-black ${
                  table.isOccupied
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-400'
                }`}>
                  R$ {table.totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Lateral / Modal da Mesa Selecionada */}
      {currentTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1318] border-[#1C2631] text-white'
          }`}>
            
            {/* Header do Extrato da Mesa */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  currentTable.isOccupied ? 'bg-sky-500/20 text-sky-500' : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Comanda da {currentTable.name}
                    </h3>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      currentTable.isOccupied
                        ? 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                        : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    }`}>
                      {currentTable.isOccupied ? 'Mesa Ocupada' : 'Mesa Disponível'}
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {currentTable.openedAt ? `Aberta às ${new Date(currentTable.openedAt).toLocaleTimeString('pt-BR')}` : 'Nenhum pedido em andamento'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTableNum(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da Comanda */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              
              {/* Botões de Ações Rápidas */}
              <div className="flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 text-sky-500 border border-sky-500/30 hover:bg-sky-500/25 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lançar Item</span>
                  </button>

                  {/* Transferir Mesa (Restrito ao Dono / Gerente) */}
                  {currentTable.isOccupied && (
                    <button
                      type="button"
                      onClick={() => setIsTransferModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 font-bold text-xs transition-colors cursor-pointer"
                      title="Mudar de Mesa (Somente Gestor/Dono)"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Mudar de Mesa</span>
                    </button>
                  )}
                </div>

                {currentTable.isOccupied && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWhatsappInput(!showWhatsappInput)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold text-xs transition-colors cursor-pointer"
                      title="Enviar extrato detalhado para o WhatsApp do cliente"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintBill}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-neutral-700"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Input Rápido de Enviar WhatsApp */}
              {showWhatsappInput && currentTable.isOccupied && (
                <div className={`p-3 rounded-2xl border flex items-center gap-2 animate-in fade-in duration-150 ${
                  isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
                }`}>
                  <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <input
                    type="tel"
                    placeholder="DDD + WhatsApp do cliente (Ex: 11999998888)"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-mono outline-none border ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/40 border-emerald-500/30 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendBillViaWhatsApp()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Enviar</span>
                  </button>
                </div>
              )}

              {/* Lista dos Pedidos e Itens da Mesa */}
              {currentTable.orders.length > 0 ? (
                <div className="space-y-3">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Itens Pedidos na Mesa ({currentTable.orders.flatMap(o => o.items).length} itens):
                  </span>

                  {currentTable.orders.map((order, oIdx) => (
                    <div 
                      key={order.id}
                      className={`p-3.5 rounded-2xl border space-y-2 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs border-b pb-2 border-slate-200 dark:border-[#1C2631]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-500">#{order.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            order.status === 'novo'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : order.status === 'preparando' 
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30' 
                              : order.status === 'pronto'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-black animate-pulse'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {order.status === 'novo' && '⏳ Aguardando Cozinha'}
                            {order.status === 'preparando' && '👨‍🍳 Em Preparo'}
                            {order.status === 'pronto' && '🟢 Pronto'}
                            {(order.status === 'entregue' || order.status === 'finalizado') && '✓ Entregue'}
                          </span>

                          {order.status === 'pronto' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'entregue')}
                              className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer transition-all"
                              title="Marcar como entregue na mesa"
                            >
                              Servir Mesa
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {order.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center justify-between text-xs group/item py-0.5">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-black text-sky-500">{item.quantity}x</span>
                              <span className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                {item.productName}
                              </span>
                              {item.notes && (
                                <span className="text-[10px] italic text-amber-500 shrink-0">({item.notes})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(order.id, iIdx, item.productName)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer opacity-70 group-hover/item:opacity-100"
                                title="Excluir item lançado por engano"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-8 rounded-2xl border border-dashed text-center space-y-2 ${
                  isLight ? 'border-slate-300 bg-slate-50' : 'border-[#1C2631] bg-[#121820]/50'
                }`}>
                  <UtensilsCrossed className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    A mesa está livre no momento.
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Quando o cliente escanear o QR Code da mesa ou você lançar um pedido, os itens aparecerão aqui.
                  </p>
                </div>
              )}

            </div>

            {/* Footer com Fechamento da Conta */}
            {currentTable.isOccupied && (
              <div className={`p-6 border-t space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Total da Conta:</span>
                    <span className="text-2xl font-black text-sky-500">
                      R$ {currentTable.totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsClosingModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl nuvi-btn-cyber-blue text-white font-black text-sm shadow-lg shadow-[#0C2340]/50 transition-all cursor-pointer hover:brightness-110 active:scale-95"
                  >
                    <Receipt className="w-5 h-5 text-white" />
                    <span>Fechar Conta & Liberar Mesa</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal de Fechamento de Conta da Mesa (Recebimento) */}
      {isClosingModalOpen && currentTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1318] border-[#1C2631] text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#1C2631]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold">
                  Fechar Conta • {currentTable.name}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsClosingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total e Taxa de Serviço */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Subtotal dos Itens:</span>
                <span className="font-bold">R$ {currentTable.totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-[#1C2631]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyServiceFee}
                    onChange={(e) => setApplyServiceFee(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                  />
                  <span>Taxa de Serviço Opcional (10%)</span>
                </label>
                <span className="font-bold text-sky-500">
                  {applyServiceFee ? `R$ ${(currentTable.totalAmount * 0.10).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-black pt-2 border-t border-slate-200 dark:border-[#1C2631]">
                <span>TOTAL A PAGAR:</span>
                <span className="text-sky-500 text-xl font-mono">
                  R$ {(currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0)).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Divisão de Conta Inteligente (Racha Conta) */}
            <div className={`p-3.5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  <Users className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
                  Dividir Conta por Pessoa:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newCount = Math.max(1, splitCount - 1);
                      setSplitCount(newCount);
                      setSplitPayments({});
                    }}
                    className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer transition-colors border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                        : 'bg-neutral-800 border-[#1E2B3A] text-white hover:bg-neutral-700'
                    }`}
                  >
                    -
                  </button>
                  <span className={`font-mono font-black text-xs min-w-8 text-center ${
                    isLight ? 'text-slate-900 font-extrabold' : 'text-white'
                  }`}>
                    {splitCount} {splitCount === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newCount = splitCount + 1;
                      setSplitCount(newCount);
                      setSplitPayments({});
                    }}
                    className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer transition-colors border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                        : 'bg-neutral-800 border-[#1E2B3A] text-white hover:bg-neutral-700'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {splitCount > 1 && (() => {
                const totalComTaxa = currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0);
                const valorPorPessoa = totalComTaxa / splitCount;
                const paidList = Object.values(splitPayments).filter(p => p.paid);
                const totalPagoAteAgora = paidList.reduce((acc, p) => acc + p.amount, 0);
                const saldoRestante = Math.max(0, totalComTaxa - totalPagoAteAgora);

                return (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-[#1C2631]">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}>
                        Valor por pessoa:
                      </span>
                      <span className={`font-mono font-black text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        R$ {valorPorPessoa.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Barra de Progresso de Pagamento das Partes */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                          Pagos: {paidList.length} de {splitCount}
                        </span>
                        <span className="font-mono text-sky-500 font-bold">
                          Restam: R$ {saldoRestante.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-black/40 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${(paidList.length / splitCount) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Lista de Pessoas para Pagamento Individual */}
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {Array.from({ length: splitCount }, (_, idx) => {
                        const payment = splitPayments[idx];
                        const isPaid = payment?.paid;

                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                              isPaid
                                ? isLight
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                                : isLight
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-[#0B1017] border-[#1A2533] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'
                              }`}>
                                {idx + 1}
                              </div>
                              <span className="font-semibold text-[11px]">
                                Pessoa {idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[11px]">
                                R$ {valorPorPessoa.toFixed(2).replace('.', ',')}
                              </span>

                              {isPaid ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  Pago ({payment.method.toUpperCase()})
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePayIndividualSplit(idx, paymentMethod)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <span>Pagar Parte</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <span className="text-xs font-bold block text-slate-400">Forma de Pagamento:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pix', label: 'PIX', icon: QrCode },
                  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                  { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
                  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSel = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSel
                          ? 'nuvi-btn-cyber-blue text-white font-bold shadow-md'
                          : isLight
                          ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-[#121820] border border-[#1C2631] text-slate-300 hover:bg-[#182230]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detalhes Específicos da Forma de Pagamento */}
            {paymentMethod === 'dinheiro' && (() => {
              const totalComTaxa = currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0);
              const valorDado = parseFloat(cashAmountGiven.replace(',', '.')) || 0;
              const troco = valorDado > totalComTaxa ? valorDado - totalComTaxa : 0;
              return (
                <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2 text-xs">
                  <span className="font-bold block text-amber-700 dark:text-amber-400">
                    Cálculo de Troco (Dinheiro)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cashAmountGiven}
                      onChange={(e) => setCashAmountGiven(e.target.value)}
                      placeholder="Valor Entregue (Ex: 50,00)"
                      className="flex-1 px-3 py-2 rounded-xl border bg-white dark:bg-black/40 text-xs font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCashAmountGiven(totalComTaxa.toFixed(2))}
                      className="px-2.5 py-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[11px] hover:bg-amber-500/30 cursor-pointer"
                    >
                      Exato
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[20, 50, 100, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashAmountGiven(val.toString())}
                        className="flex-1 py-1 rounded-lg border text-[10px] font-bold bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        R${val}
                      </button>
                    ))}
                  </div>
                  {valorDado > 0 && (
                    <div className="flex justify-between items-center pt-1 font-bold border-t border-amber-500/20">
                      <span>Troco a devolver:</span>
                      <span className="text-emerald-500 font-black text-sm">
                        R$ {troco.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {(paymentMethod === 'cartao_debito' || paymentMethod === 'cartao_credito') && (
              <div className="p-3.5 rounded-2xl border border-sky-500/30 bg-sky-500/10 text-center text-xs space-y-1">
                <span className="font-bold text-sky-700 dark:text-sky-400 block">
                  Maquininha de Cartão ({paymentMethod === 'cartao_debito' ? 'Débito' : 'Crédito'})
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Passe o cartão do cliente na maquininha física no valor de <strong>R$ {(currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0)).toFixed(2).replace('.', ',')}</strong>
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleFinalizeAndCloseTable}
              className="w-full py-3.5 rounded-2xl nuvi-btn-cyber-blue text-white font-black text-sm shadow-xl shadow-[#0C2340]/40 transition-all cursor-pointer hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 text-white stroke-[3]" />
              <span>{paymentMethod === 'pix' ? 'Gerar PIX & Liberar Mesa' : 'Confirmar Pagamento & Liberar Mesa'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Item Manual à Mesa */}
      {isAddItemModalOpen && currentTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1318] border-[#1C2631] text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#1C2631]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold">
                  Lançar Item na {currentTable.name}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Busca de Produto */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar produto por nome..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold outline-none border ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:border-sky-500' 
                      : 'bg-[#121820] border-[#1C2631] text-white focus:border-sky-500'
                  }`}
                />
              </div>

              {/* Lista de Seleção de Produtos */}
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {tenantProducts
                  .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .slice(0, 15)
                  .map(p => {
                    const isSel = selectedProduct?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSel
                            ? 'nuvi-btn-cyber-blue text-white font-bold'
                            : isLight
                            ? 'hover:bg-slate-100 text-slate-800'
                            : 'hover:bg-[#161D24] text-slate-200'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="font-mono font-bold shrink-0 ml-2 text-sky-400">
                          R$ {(p.promoPrice ?? p.price).toFixed(2).replace('.', ',')}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {selectedProduct && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#1C2631]">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Quantidade:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-neutral-800 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">{itemQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-neutral-800 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder="Observação (ex: Sem gelo, sem cebola...)"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium outline-none border ${
                      isLight 
                        ? 'bg-slate-50 border-slate-300 text-slate-800' 
                        : 'bg-[#121820] border-[#1C2631] text-white'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToTable}
                  className="w-full py-3 rounded-xl nuvi-btn-cyber-blue text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:brightness-110 active:scale-95"
                >
                  Confirmar Lançamento na {currentTable.name}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal Plaquinhas QR Code */}
      {isQRCodeModalOpen && currentTenant && (
        <TableQRCodeModal
          tenant={currentTenant}
          onClose={() => setIsQRCodeModalOpen(false)}
          isLight={isLight}
        />
      )}

      {/* Modal de Pagamento PIX com QR Code Dinâmico na Tela */}
      {isPixPaymentModalOpen && currentTable && currentTenant && (
        <PDVPixModal
          totalAmount={
            splitCount > 1
              ? (currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0)) / splitCount
              : currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0)
          }
          tenant={currentTenant}
          isLight={isLight}
          onConfirmPayment={() => {
            if (splitCount > 1 && activePayingPerson !== null) {
              const valorPorPessoa = (currentTable.totalAmount * (applyServiceFee ? 1.10 : 1.0)) / splitCount;
              const updated = {
                ...splitPayments,
                [activePayingPerson]: {
                  paid: true,
                  method: 'pix' as PaymentMethod,
                  amount: valorPorPessoa,
                  at: new Date().toLocaleTimeString('pt-BR')
                }
              };
              setSplitPayments(updated);
              setIsPixPaymentModalOpen(false);
              setActivePayingPerson(null);

              showAlert({
                title: 'Parte Paga via PIX!',
                message: `Pessoa ${activePayingPerson + 1} pagou sua parte de R$ ${valorPorPessoa.toFixed(2).replace('.', ',')} via PIX.`,
                variant: 'success'
              });

              // Se todos pagaram, encerra
              const paidCount = Object.values(updated).filter(p => p.paid).length;
              if (paidCount >= splitCount) {
                setTimeout(() => {
                  executeCloseTable('pix');
                }, 600);
              }
            } else {
              executeCloseTable('pix');
            }
          }}
          onClose={() => {
            setIsPixPaymentModalOpen(false);
            setActivePayingPerson(null);
          }}
        />
      )}

      {/* Modal de Transferência / Troca de Mesa (Restrito ao Dono / Gestor) */}
      {isTransferModalOpen && currentTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1318] border-[#1C2631] text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-[#1C2631]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Transferir Comanda</h3>
                  <p className="text-[11px] text-slate-400">Origem: {currentTable.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              }`}>
                <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Apenas o dono ou gerente do estabelecimento pode efetuar a troca de mesas.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Selecione a Mesa de Destino:
                </label>
                <select
                  value={targetTableNum}
                  onChange={(e) => setTargetTableNum(e.target.value ? Number(e.target.value) : '')}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121820] border-[#1C2631] text-white'
                  }`}
                >
                  <option value="">Selecione a nova mesa...</option>
                  {tables
                    .filter((t) => t.number !== currentTable.number)
                    .map((t) => (
                      <option key={t.number} value={t.number}>
                        {t.name} {t.isOccupied ? `(Já tem pedidos - Juntar contas)` : '(Livre)'}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#1C2631] text-xs font-bold text-slate-400 hover:bg-neutral-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleTransferTable}
                  disabled={!targetTableNum}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetTableNum
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transferir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
