import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Check,
  Printer,
  Maximize2,
  Minimize2,
  Filter,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  RefreshCw,
  Volume2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const KitchenKDSView: React.FC = () => {
  const {
    currentTenant,
    tenantOrders,
    updateOrderStatus,
    themeMode,
  } = useStore();

  const isLight = themeMode === 'light';
  const [filterChannel, setFilterChannel] = useState<'todos' | 'mesa' | 'balcao' | 'delivery'>('todos');
  const [filterStatus, setFilterStatus] = useState<'ativos' | 'novo' | 'preparando' | 'pronto'>('ativos');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Atualiza relógio a cada 10 segundos para manter os contadores de tempo precisos
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Pedidos que vão para a cozinha (exclui cancelados e finalizados antigos)
  const kitchenOrders = tenantOrders.filter((order) => {
    if (order.status === 'cancelado') return false;

    // Filtro por canal
    if (filterChannel === 'mesa' && order.deliveryType !== 'mesa') return false;
    if (filterChannel === 'balcao' && order.deliveryType !== 'balcao' && order.deliveryType !== 'pickup') return false;
    if (filterChannel === 'delivery' && order.deliveryType !== 'delivery') return false;

    // Filtro por status
    if (filterStatus === 'ativos') {
      return order.status === 'novo' || order.status === 'preparando' || order.status === 'pronto';
    }
    return order.status === filterStatus;
  }).sort((a, b) => {
    // A cozinha deve ver sempre os pedidos do MAIS ANTIGO para o mais novo (ordem cronológica - FIFO)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Contadores
  const countNovos = tenantOrders.filter((o) => o.status === 'novo').length;
  const countPreparando = tenantOrders.filter((o) => o.status === 'preparando').length;
  const countProntos = tenantOrders.filter((o) => o.status === 'pronto').length;

  const getElapsedTime = (createdAt: string) => {
    const elapsedMs = now - new Date(createdAt).getTime();
    const minutes = Math.floor(elapsedMs / 60000);
    return minutes;
  };

  const handlePrintKitchenTicket = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const channelText = order.deliveryType === 'mesa'
      ? `🍽️ MESA ${order.tableNumber?.replace(/[^0-9]/g, '') || order.tableNumber || 'S/N'}`
      : order.deliveryType === 'delivery'
      ? '🛵 DELIVERY'
      : '🛍️ BALCÃO';

    const itemsHtml = order.items
      .map(
        (it) => `
        <div style="margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">
          <div style="font-size: 16px; font-weight: bold;">[ ${it.quantity}x ] ${it.productName}</div>
          ${it.notes ? `<div style="font-size: 13px; font-weight: bold; color: #d00; margin-top: 2px;">⚠️ OBS: ${it.notes}</div>` : ''}
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Comanda Cozinha - ${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 10px; width: 280px; margin: 0 auto; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
            .title { font-size: 20px; font-weight: bold; }
            .badge { font-size: 22px; font-weight: 900; background: #000; color: #fff; padding: 4px; margin: 6px 0; }
            .meta { font-size: 12px; margin-bottom: 6px; }
            .footer { font-size: 11px; text-align: center; border-top: 2px solid #000; padding-top: 6px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">*** COZINHA / KDS ***</div>
            <div class="badge">${channelText}</div>
            <div class="meta">PEDIDO: <b>#${order.id}</b> | HORA: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            ${order.customerName ? `<div class="meta">CLIENTE: ${order.customerName}</div>` : ''}
          </div>
          <div>${itemsHtml}</div>
          ${order.notes ? `<div style="background: #f0f0f0; padding: 5px; margin-top: 8px; font-size: 13px;"><b>OBS GERAL:</b> ${order.notes}</div>` : ''}
          <div class="footer">NUVI SAAS • SISTEMA KDS DE COZINHA</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Control Bar da Cozinha */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isLight
          ? 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-amber-200 text-slate-900 shadow-sm'
          : 'bg-gradient-to-r from-neutral-900 via-[#141A22] to-neutral-900 border-neutral-800 text-white shadow-xl'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/25 shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  KDS • Cozinha & Bar em Tempo Real
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-lg font-black tracking-tight">
                Visão da Cozinha & Fila de Preparo
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Acompanhe e despache pedidos feitos nas mesas, no balcão e no delivery.
              </p>
            </div>
          </div>

          {/* Contadores da Fila */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setFilterStatus(filterStatus === 'novo' ? 'ativos' : 'novo')}
              className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                filterStatus === 'novo'
                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                  : isLight
                  ? 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
                  : 'bg-neutral-900/90 border-amber-500/30 text-amber-300 hover:bg-neutral-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <div className="text-left">
                <span className="text-[10px] font-bold block uppercase opacity-80 leading-none">Na Fila</span>
                <span className="text-sm font-black">{countNovos}</span>
              </div>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'preparando' ? 'ativos' : 'preparando')}
              className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                filterStatus === 'preparando'
                  ? 'bg-blue-600 text-white border-blue-500 font-black shadow-md'
                  : isLight
                  ? 'bg-white border-blue-200 text-blue-800 hover:bg-blue-50'
                  : 'bg-neutral-900/90 border-blue-500/30 text-blue-300 hover:bg-neutral-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div className="text-left">
                <span className="text-[10px] font-bold block uppercase opacity-80 leading-none">No Fogo</span>
                <span className="text-sm font-black">{countPreparando}</span>
              </div>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'pronto' ? 'ativos' : 'pronto')}
              className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                filterStatus === 'pronto'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md'
                  : isLight
                  ? 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                  : 'bg-neutral-900/90 border-emerald-500/30 text-emerald-300 hover:bg-neutral-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="text-left">
                <span className="text-[10px] font-bold block uppercase opacity-80 leading-none">Prontos</span>
                <span className="text-sm font-black">{countProntos}</span>
              </div>
            </button>

            {/* Botão de Tela Cheia para TV da Cozinha */}
            <button
              onClick={toggleFullscreen}
              title="Modo Tela Cheia (TV / Tablet da Cozinha)"
              className="p-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Origem */}
        <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
          isLight ? 'border-amber-200/60' : 'border-neutral-800'
        }`}>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className={`text-[11px] font-bold mr-1 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              Filtrar Origem:
            </span>
            <button
              onClick={() => setFilterChannel('todos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterChannel === 'todos'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              Todas as Origens ({kitchenOrders.length})
            </button>
            <button
              onClick={() => setFilterChannel('mesa')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterChannel === 'mesa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>🍽️ Mesas / Salão</span>
            </button>
            <button
              onClick={() => setFilterChannel('balcao')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterChannel === 'balcao'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>🛍️ Balcão</span>
            </button>
            <button
              onClick={() => setFilterChannel('delivery')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterChannel === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>🛵 Delivery</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              Atualizado automaticamente
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Pedidos da Cozinha (Cards Grandes estilo KDS) */}
      {kitchenOrders.length === 0 ? (
        <div className={`py-16 text-center rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
        }`}>
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
          <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
            Nenhum pedido na fila da cozinha
          </h3>
          <p className="text-xs max-w-sm mx-auto mt-1">
            Quando os clientes pedirem nas mesas, no cardápio ou no balcão, os pedidos aparecerão aqui em tempo real!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => {
            const minutes = getElapsedTime(order.createdAt);
            const isLate = minutes >= 20;
            const isWarning = minutes >= 10 && minutes < 20;

            const isMesa = order.deliveryType === 'mesa';
            const tableLabel = order.tableNumber
              ? `MESA ${order.tableNumber.replace(/[^0-9]/g, '') || order.tableNumber}`
              : 'MESA (S/N)';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border flex flex-col shadow-lg transition-all overflow-hidden ${
                  order.status === 'novo'
                    ? isLight
                      ? 'bg-white border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-neutral-900 border-amber-500/70 ring-2 ring-amber-500/20'
                    : order.status === 'preparando'
                    ? isLight
                      ? 'bg-white border-blue-400 ring-2 ring-blue-400/30'
                      : 'bg-neutral-900 border-blue-500/70 ring-2 ring-blue-500/20'
                    : isLight
                    ? 'bg-white border-emerald-400 ring-2 ring-emerald-400/30'
                    : 'bg-neutral-900 border-emerald-500/70 ring-2 ring-emerald-500/20'
                }`}
              >
                {/* Header do Card: Branco Gelo e Fonte Chumbo conforme solicitado */}
                <div className={`p-3.5 border-b flex items-center justify-between ${
                  isLight 
                    ? 'bg-[#F1F5F9] border-slate-300 text-[#1E293B]' 
                    : 'bg-[#1E293B] border-slate-700 text-slate-100'
                }`}>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {isMesa ? 'Salão / Comanda' : order.deliveryType === 'delivery' ? 'Entrega em Casa' : 'Venda Balcão'}
                    </span>
                    <h3 className={`text-base font-black tracking-tight ${
                      isLight ? 'text-[#1E293B]' : 'text-white'
                    }`}>
                      {isMesa ? `🍽️ ${tableLabel}` : order.deliveryType === 'delivery' ? `🛵 PEDIDO #${order.id}` : `🛍️ BALCÃO #${order.id}`}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isLate
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-400 text-black'
                        : isLight
                        ? 'bg-slate-200 border border-slate-300 text-slate-800'
                        : 'bg-black/40 text-slate-200'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{minutes} min</span>
                    </span>
                    <span className={`text-[10px] block mt-0.5 font-mono font-bold ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Identificação de Cliente se houver */}
                {order.customerName && (
                  <div className={`px-3.5 py-1.5 text-xs font-semibold border-b flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                  }`}>
                    <span className="truncate">Cliente: <strong>{order.customerName}</strong></span>
                    <button
                      type="button"
                      onClick={() => handlePrintKitchenTicket(order)}
                      title="Imprimir comanda para a chapa/cozinha"
                      className="p-1 rounded text-slate-400 hover:text-amber-500 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Itens para Preparo */}
                <div className="p-3.5 flex-1 space-y-2.5 overflow-y-auto max-h-[280px]">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-colors ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/80 border-neutral-800/80'
                      }`}
                    >
                      <span className="px-2 py-1 rounded-lg bg-amber-500 text-black font-black text-sm shrink-0">
                        {item.quantity}x
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {item.productName}
                        </h4>
                        {item.volume && (
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            {item.volume}
                          </span>
                        )}
                        {item.notes && (
                          <div className="mt-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[11px] font-bold">
                            ⚠️ {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Observação Geral do Pedido */}
                  {order.notes && (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
                      📢 Obs Geral: {order.notes}
                    </div>
                  )}
                </div>

                {/* Status & Botões de Ação da Cozinha */}
                <div className={`p-3 border-t mt-auto space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 text-[11px]">Etapa:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'novo'
                        ? 'bg-amber-500/20 text-amber-500'
                        : order.status === 'preparando'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {order.status === 'novo' ? 'Aguardando Início' : order.status === 'preparando' ? 'Em Preparo' : 'Pronto para Servir'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'novo' ? (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'preparando')}
                        className="col-span-2 py-2.5 px-3 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar Preparo</span>
                      </button>
                    ) : order.status === 'preparando' ? (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'pronto')}
                        className="col-span-2 py-2.5 px-3 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Pronto para Servir</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, isMesa ? 'entregue' : 'finalizado')}
                        className="col-span-2 py-2.5 px-3 rounded-xl font-black text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>{isMesa ? 'Entregue na Mesa' : 'Despachado / Concluído'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
