import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, X, Sparkles, QrCode, ChefHat, Truck, ShoppingCart, Boxes, BarChart3 } from 'lucide-react';

interface PlansComparisonTableProps {
  selectedPlanId?: string;
  onSelectPlan?: (planId: string) => void;
  isLight?: boolean;
}

export const PlansComparisonTable: React.FC<PlansComparisonTableProps> = ({
  selectedPlanId,
  onSelectPlan,
  isLight = false,
}) => {
  const { globalConfig } = useStore();

  // Dados consolidados dos 5 Planos Oficiais do Nuvi SaaS com preços em tempo real
  const plansData = [
    {
      id: 'plan_cardapio',
      name: 'Cardápio QR Mesas & Vitrine',
      badge: 'Iniciante / Salão',
      tag: 'Mesas & QR',
      icon: '📱',
      price: globalConfig?.plans?.find(p => p.id === 'plan_cardapio')?.price ?? 49.90,
      tables: true,
      tablesText: 'QR Code nas Mesas',
      kds: false,
      kdsText: 'Não incluso',
      delivery: false,
      deliveryText: 'Sem frete KM',
      pdv: false,
      pdvText: 'Não incluso',
      stock: false,
      stockText: 'Não incluso',
      metrics: false,
      metricsText: 'Não incluso',
      highlight: false,
      target: 'Bares e restaurantes que querem cardápio digital de mesa via QR Code'
    },
    {
      id: 'plan_balcao_estoque',
      name: 'Balcão & Estoque [Sem Vitrine]',
      badge: 'Loja Física',
      tag: 'Sem Vitrine',
      icon: '📦',
      price: globalConfig?.plans?.find(p => p.id === 'plan_balcao_estoque')?.price ?? 69.90,
      tables: false,
      tablesText: 'Sem mesas',
      kds: false,
      kdsText: 'Não incluso',
      delivery: false,
      deliveryText: 'Sem vitrine web',
      pdv: true,
      pdvText: 'PDV Balcão Ágil',
      stock: true,
      stockText: 'Estoque + Leitor USB/BT',
      metrics: false,
      metricsText: 'Não incluso',
      highlight: false,
      target: 'Adegas, tabacarias e mercadinhos focados em caixa e controle de mercadorias'
    },
    {
      id: 'plan_balcao_pdv',
      name: 'Balcão & PDV Caixa Rápido',
      badge: 'Mais Vendido',
      tag: 'Frente de Caixa',
      icon: '⚡',
      price: globalConfig?.plans?.find(p => p.id === 'plan_balcao_pdv')?.price ?? 89.90,
      tables: true,
      tablesText: 'QR Code + Comandas',
      kds: false,
      kdsText: 'Não incluso',
      delivery: false,
      deliveryText: 'Sem frete KM',
      pdv: true,
      pdvText: 'PDV Ágil + Leitor',
      stock: false,
      stockText: 'Não incluso',
      metrics: false,
      metricsText: 'Não incluso',
      highlight: true,
      target: 'Lanchonetes e lojas de atendimento presencial ágil no balcão e salão'
    },
    {
      id: 'plan_delivery_estoque',
      name: 'Delivery & Estoque Pro',
      badge: 'Profissional',
      tag: 'Estoque & Frete',
      icon: '🚚',
      price: globalConfig?.plans?.find(p => p.id === 'plan_delivery_estoque')?.price ?? 139.90,
      tables: true,
      tablesText: 'QR Code + Comandas',
      kds: false,
      kdsText: 'Não incluso',
      delivery: true,
      deliveryText: 'Frete por Raio (KM)',
      pdv: true,
      pdvText: 'PDV Balcão Ágil',
      stock: true,
      stockText: 'Estoque Automático',
      metrics: true,
      metricsText: 'Métricas & Relatórios',
      highlight: false,
      target: 'Pizzarias, hamburguerias e entregas com alto volume de delivery'
    },
    {
      id: 'plan_nuvi_pro',
      name: 'Nuvi Pro Total (Completo VIP)',
      badge: 'Recomendado Master',
      tag: 'Tudo Incluso',
      icon: '👑',
      price: globalConfig?.plans?.find(p => p.id === 'plan_nuvi_pro')?.price ?? 199.90,
      tables: true,
      tablesText: 'QR Code + Comandas',
      kds: true,
      kdsText: 'KDS Cozinha em Tempo Real',
      delivery: true,
      deliveryText: 'Frete por Raio (KM)',
      pdv: true,
      pdvText: 'Múltiplos PDVs + Leitor',
      stock: true,
      stockText: 'Estoque Completo',
      metrics: true,
      metricsText: 'Lucro Real & DRE',
      highlight: true,
      target: 'Operação completa e integrada: Salão + Cozinha + Delivery + Balcão'
    }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Box de Resumo Estratégico */}
      <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
        isLight ? 'bg-sky-50/80 border-sky-200 text-sky-950' : 'bg-sky-950/20 border-sky-500/30 text-sky-200'
      }`}>
        <Sparkles className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-sm block">
            Demonstrativo Oficial de Recursos & Módulos Nuvi SaaS
          </span>
          <p className="leading-relaxed">
            Cada plano libera recursos específicos para atender desde comércios que precisam apenas de <strong>Cardápio QR nas Mesas</strong> até operações completas com <strong>Cozinha KDS</strong> e <strong>Controle de Estoque</strong>.
          </p>
        </div>
      </div>

      {/* Tabela Comparativa Responsiva */}
      <div className={`rounded-2xl border overflow-x-auto shadow-xs ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#101720] border-[#1C2631]'
      }`}>
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-[760px]">
          <thead>
            <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
              isLight ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-[#0B0F14] border-[#1C2631] text-slate-400'
            }`}>
              <th className="py-3 px-4">Plano & Assinatura</th>
              <th className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-sky-500" />
                  <span>Mesas & Salão</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cozinha (KDS)</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Delivery & Frete KM</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                  <span>PDV Balcão</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Estoque</span>
                </div>
              </th>
              {onSelectPlan && (
                <th className="py-3 px-4 text-right">Ação</th>
              )}
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#1C2631]'}`}>
            {plansData.map((plan) => {
              const isSelected = selectedPlanId === plan.id;

              return (
                <tr
                  key={plan.id}
                  className={`transition-colors ${
                    isSelected
                      ? isLight ? 'bg-sky-50/70 font-semibold' : 'bg-sky-950/30 font-semibold'
                      : isLight ? 'hover:bg-slate-50' : 'hover:bg-[#151D24]'
                  }`}
                >
                  {/* Plano & Valor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{plan.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {plan.name}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                            plan.highlight 
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                              : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {plan.badge}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">/mês</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mesas & Salão */}
                  <td className="py-3 px-3 text-center">
                    {plan.tables ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{plan.tablesText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-400">
                        <X className="w-3 h-3 text-slate-400" />
                        <span>{plan.tablesText}</span>
                      </span>
                    )}
                  </td>

                  {/* Cozinha (KDS) */}
                  <td className="py-3 px-3 text-center">
                    {plan.kds ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Check className="w-3 h-3 text-amber-500" />
                        <span>{plan.kdsText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-400">
                        <X className="w-3 h-3 text-slate-400" />
                        <span>{plan.kdsText}</span>
                      </span>
                    )}
                  </td>

                  {/* Delivery & Frete KM */}
                  <td className="py-3 px-3 text-center">
                    {plan.delivery ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{plan.deliveryText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-400">
                        <X className="w-3 h-3 text-slate-400" />
                        <span>{plan.deliveryText}</span>
                      </span>
                    )}
                  </td>

                  {/* PDV Balcão */}
                  <td className="py-3 px-3 text-center">
                    {plan.pdv ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                        <Check className="w-3 h-3 text-blue-500" />
                        <span>{plan.pdvText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-400">
                        <X className="w-3 h-3 text-slate-400" />
                        <span>{plan.pdvText}</span>
                      </span>
                    )}
                  </td>

                  {/* Controle de Estoque */}
                  <td className="py-3 px-3 text-center">
                    {plan.stock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25">
                        <Check className="w-3 h-3 text-cyan-500" />
                        <span>{plan.stockText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-400">
                        <X className="w-3 h-3 text-slate-400" />
                        <span>{plan.stockText}</span>
                      </span>
                    )}
                  </td>

                  {/* Ação de Seleção Rápida */}
                  {onSelectPlan && (
                    <td className="py-3 px-4 text-right">
                      {isSelected ? (
                        <span className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-[11px] shadow-sm">
                          Plano Escolhido
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectPlan(plan.id)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-600 text-sky-600 hover:text-white dark:text-sky-400 font-bold text-[11px] transition-all cursor-pointer border border-sky-500/20 active:scale-95"
                        >
                          Escolher Este Plano
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
