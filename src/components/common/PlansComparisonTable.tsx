import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, X, Sparkles, QrCode, ChefHat, Truck, ShoppingCart, Boxes, BarChart3, TrendingUp, UtensilsCrossed } from 'lucide-react';

interface PlansComparisonTableProps {
  selectedPlanId?: string;
  onSelectPlan?: (planId: string) => void;
  isLight?: boolean;
}

export const PlansComparisonTable: React.FC<PlansComparisonTableProps> = ({
  selectedPlanId,
  isLight = false,
}) => {
  const { globalConfig } = useStore();

  // Dados consolidados dos 4 Planos Oficiais do Nuvi SaaS com preços em tempo real
  const plansData = [
    {
      id: 'plan_cardapio',
      name: 'Cardápio QR Mesas & Vitrine',
      badge: 'Iniciante / Salão',
      tag: 'Mesas & QR',
      icon: '📱',
      price: globalConfig?.plans?.find(p => p.id === 'plan_cardapio')?.price ?? 49.90,
      tables: true,
      tablesText: 'QR Mesas',
      kds: false,
      delivery: false,
      pdv: false,
      stock: false,
      metrics: true,
      metricsText: 'Vendas & Caixa',
      highlight: false,
      target: 'Bares e restaurantes que querem cardápio digital de mesa via QR Code'
    },
    {
      id: 'plan_balcao_pdv',
      name: 'Balcão & PDV Caixa Rápido',
      badge: 'Mais Vendido',
      tag: 'Frente de Caixa',
      icon: '⚡',
      price: globalConfig?.plans?.find(p => p.id === 'plan_balcao_pdv')?.price ?? 89.90,
      tables: true,
      tablesText: 'QR + Comandas',
      kds: false,
      delivery: false,
      pdv: true,
      pdvText: 'PDV Ágil',
      stock: false,
      metrics: true,
      metricsText: 'Métricas & Vendas',
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
      tablesText: 'QR + Comandas',
      kds: false,
      delivery: true,
      deliveryText: 'Frete KM',
      pdv: true,
      pdvText: 'PDV Balcão',
      stock: true,
      stockText: 'Estoque Pro',
      metrics: true,
      metricsText: 'Métricas & Lucro',
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
      tablesText: 'QR + Comandas',
      kds: true,
      kdsText: 'KDS Cozinha',
      delivery: true,
      deliveryText: 'Frete KM',
      pdv: true,
      pdvText: 'PDV + Leitor',
      stock: true,
      stockText: 'Estoque Total',
      metrics: true,
      metricsText: 'DRE & Lucro Real',
      highlight: true,
      target: 'Operação completa e integrada: Salão + Cozinha + Delivery + Balcão'
    }
  ].filter(p => {
    const configPlan = globalConfig?.plans?.find(cp => cp.id === p.id);
    return configPlan ? configPlan.active !== false : true;
  });

  return (
    <div className="w-full space-y-3">
      {/* Box de Resumo Estratégico Compacto */}
      <div className={`p-3 sm:p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
        isLight ? 'bg-sky-50/80 border-sky-200 text-sky-950' : 'bg-sky-950/20 border-sky-500/30 text-sky-200'
      }`}>
        <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold text-xs block">
            Demonstrativo Oficial de Recursos & Módulos Nuvi SaaS
          </span>
          <p className="text-[11px] leading-relaxed opacity-90">
            Cada plano libera recursos para o seu modelo de negócio. <strong>Relatórios e Métricas Financeiras</strong> estão disponíveis em todos os planos.
          </p>
        </div>
      </div>

      {/* Tabela Comparativa Compacta e Sem Rolagem Excessiva */}
      <div className={`rounded-xl border overflow-x-auto shadow-xs ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#101720] border-[#1C2631]'
      }`}>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`border-b text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              isLight ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-[#0B0F14] border-[#1C2631] text-slate-400'
            }`}>
              <th className="py-2.5 px-3 min-w-[170px] sm:min-w-[190px]">Plano & Valor</th>
              <th className="py-2.5 px-2 text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-sky-500" />
                  <span>Gestão das Mesas</span>
                </div>
              </th>
              <th className="py-2.5 px-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cozinha</span>
                </div>
              </th>
              <th className="py-2.5 px-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Delivery KM</span>
                </div>
              </th>
              <th className="py-2.5 px-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                  <span>PDV Balcão</span>
                </div>
              </th>
              <th className="py-2.5 px-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Estoque</span>
                </div>
              </th>
              <th className="py-2.5 px-1.5 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Métricas & Financeiro</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y text-[11px] ${isLight ? 'divide-slate-200' : 'divide-[#1C2631]'}`}>
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
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg leading-none shrink-0">{plan.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {plan.name}
                          </span>
                          <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                            plan.highlight 
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                              : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {plan.badge}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">/mês</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mesas & Salão */}
                  <td className="py-2.5 px-1.5 text-center">
                    {plan.tables ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{plan.tablesText}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 opacity-60 font-mono">—</span>
                    )}
                  </td>

                  {/* Cozinha (KDS) */}
                  <td className="py-2.5 px-1.5 text-center">
                    {plan.kds ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
                        <Check className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{plan.kdsText}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 opacity-60 font-mono">—</span>
                    )}
                  </td>

                  {/* Delivery & Frete KM */}
                  <td className="py-2.5 px-1.5 text-center">
                    {plan.delivery ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{plan.deliveryText}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 opacity-60 font-mono">—</span>
                    )}
                  </td>

                  {/* PDV Balcão */}
                  <td className="py-2.5 px-1.5 text-center">
                    {plan.pdv ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 whitespace-nowrap">
                        <Check className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{plan.pdvText}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 opacity-60 font-mono">—</span>
                    )}
                  </td>

                  {/* Controle de Estoque */}
                  <td className="py-2.5 px-1.5 text-center">
                    {plan.stock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 whitespace-nowrap">
                        <Check className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>{plan.stockText}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 opacity-60 font-mono">—</span>
                    )}
                  </td>

                  {/* Relatórios & Métricas Financeiras (Para TODOS os planos) */}
                  <td className="py-2.5 px-1.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{plan.metricsText}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
