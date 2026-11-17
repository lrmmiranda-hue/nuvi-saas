import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BUSINESS_SEGMENTS } from '../../data/businessSegments';
import { BusinessSegmentType, SaaSFeaturePermissions, SaaSSubscriptionPlan } from '../../types';
import { 
  Settings, 
  X, 
  ShieldCheck, 
  DollarSign, 
  Megaphone, 
  Sliders, 
  Store, 
  ShoppingCart, 
  Boxes, 
  Truck, 
  BarChart3, 
  Barcode, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Save, 
  AlertCircle,
  HelpCircle,
  Lock,
  Unlock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MasterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterSettingsModal: React.FC<MasterSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    globalConfig, 
    updateGlobalConfig, 
    updatePlanPrice, 
    updateSegmentPermissions, 
    updatePromoBanner,
    showAlert,
    themeMode 
  } = useStore();

  const isLight = themeMode === 'light';

  const [activeTab, setActiveTab] = useState<'permissions' | 'plans' | 'promo'>('permissions');

  // Estado da aba de permissões
  const [selectedTarget, setSelectedTarget] = useState<'global' | BusinessSegmentType>('global');

  // Estado local para os 4 planos
  const [plansState, setPlansState] = useState<SaaSSubscriptionPlan[]>(globalConfig.plans);

  // Estado local para o banner promocional
  const [promoState, setPromoState] = useState(globalConfig.promoBanner);

  if (!isOpen) return null;

  // Obtém as permissões do alvo selecionado
  const currentPermissions: SaaSFeaturePermissions = selectedTarget === 'global'
    ? globalConfig.defaultPermissions
    : {
        ...globalConfig.defaultPermissions,
        ...(globalConfig.segmentPermissions?.[selectedTarget] || {})
      };

  const handleToggleFeature = (feature: keyof SaaSFeaturePermissions) => {
    const newValue = !currentPermissions[feature];
    if (selectedTarget === 'global') {
      updateGlobalConfig({
        defaultPermissions: {
          ...globalConfig.defaultPermissions,
          [feature]: newValue,
        }
      });
    } else {
      updateSegmentPermissions(selectedTarget, { [feature]: newValue });
    }
  };

  const handlePlanPriceChange = (planId: string, value: string) => {
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    setPlansState(prev => prev.map(p => p.id === planId ? { ...p, price: numericValue } : p));
  };

  const handleSavePlans = () => {
    updateGlobalConfig({ plans: plansState });
    showAlert({
      title: 'Planos Atualizados!',
      message: 'Os preços e condições das 4 opções de assinatura foram atualizados com sucesso.',
      variant: 'success'
    });
  };

  const handleSavePromo = () => {
    updatePromoBanner(promoState);
    showAlert({
      title: 'Promoção Salva!',
      message: 'A mensagem promocional do sistema foi atualizada e será exibida no painel dos lojistas.',
      variant: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-800' 
          : 'bg-[#0E1318] border-sky-950/70 text-slate-100'
      }`}>
        
        {/* Header do Modal com Ícone de Engrenagem */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Configurações Globais do Nuvi SaaS
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Painel Master
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie permissões de módulos, preços dos 4 planos de venda e banners promocionais.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500' 
                : 'bg-[#161D24] hover:bg-[#202A34] border-[#222E3A] text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas Internas de Navegação */}
        <div className={`px-6 pt-3 border-b flex items-center gap-2 overflow-x-auto ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0E1318] border-[#1C2631]'
        }`}>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'permissions'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Permissões & Módulos</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'plans'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Preços dos 4 Planos de Venda</span>
          </button>

          <button
            onClick={() => setActiveTab('promo')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'promo'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Divulgação & Promoções no Painel</span>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ============================================================ */}
          {/* ABA 1: PERMISSÕES DE MÓDULOS DOS PAINÉIS                     */}
          {/* ============================================================ */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              
              {/* Box de Estratégia do Negócio */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                isLight 
                  ? 'bg-sky-50/70 border-sky-200 text-slate-800' 
                  : 'bg-sky-950/20 border-sky-900/40 text-slate-200'
              }`}>
                <Sparkles className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sky-700 dark:text-sky-300">
                    Estratégia de Liberação Gradual dos Painéis
                  </p>
                  <p className="leading-relaxed">
                    Você pode ocultar ou bloquear módulos para que o lojista comece usando apenas o <strong>Cardápio / Vitrine</strong> e depois contrate o <strong>PDV de Balcão</strong>, <strong>Controle de Estoque</strong> ou <strong>Delivery</strong>.
                  </p>
                </div>
              </div>

              {/* Seletor do Alvo (Geral ou por Segmento) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Configurar Permissões Para:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTarget('global')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                      selectedTarget === 'global'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-500/25'
                        : isLight 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                        : 'bg-[#151D24] hover:bg-[#1C2631] border-[#222E3A] text-slate-300'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Padrão Global (Todos os Comércios)</span>
                  </button>

                  {BUSINESS_SEGMENTS.map(seg => {
                    const isSelected = selectedTarget === seg.id;
                    const hasCustomRules = Boolean(globalConfig.segmentPermissions?.[seg.id]);
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setSelectedTarget(seg.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-500/25'
                            : isLight 
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                            : 'bg-[#151D24] hover:bg-[#1C2631] border-[#222E3A] text-slate-300'
                        }`}
                      >
                        <span>{seg.emoji}</span>
                        <span>{seg.shortLabel}</span>
                        {hasCustomRules && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Regras personalizadas ativas" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid de Módulos & Chaves de Ativação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                
                {/* 1. Cardápio & Vitrine Online */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  currentPermissions.enableStorefront
                    ? (isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/15 border-sky-900/40')
                    : (isLight ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-[#121820]/60 border-[#1C2631] opacity-60')
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Cardápio & Vitrine Online
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Permite receber pedidos na web e WhatsApp com catálogo público.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('enableStorefront')}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1 ${
                      currentPermissions.enableStorefront ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      currentPermissions.enableStorefront ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Frente de Caixa Balcão (PDV) */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  currentPermissions.enablePDVBalcao
                    ? (isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/15 border-sky-900/40')
                    : (isLight ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-[#121820]/60 border-[#1C2631] opacity-60')
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Vendas no Balcão (PDV Ágil)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Acesso ao caixa rápido presencial, mesas e emissão de comprovantes.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('enablePDVBalcao')}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1 ${
                      currentPermissions.enablePDVBalcao ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      currentPermissions.enablePDVBalcao ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 3. Controle de Estoque */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  currentPermissions.enableStockControl
                    ? (isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/15 border-sky-900/40')
                    : (isLight ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-[#121820]/60 border-[#1C2631] opacity-60')
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Controle de Estoque & Reposição
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Entradas, saídas automáticas, custo e avisos de produtos acabando.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('enableStockControl')}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1 ${
                      currentPermissions.enableStockControl ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      currentPermissions.enableStockControl ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 4. Delivery & Frete por Raio */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  currentPermissions.enableDeliveryRadius
                    ? (isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/15 border-sky-900/40')
                    : (isLight ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-[#121820]/60 border-[#1C2631] opacity-60')
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Delivery & Taxa por Raio (KM)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Cálculo dinâmico de taxa por distância e regras de frete grátis.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('enableDeliveryRadius')}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1 ${
                      currentPermissions.enableDeliveryRadius ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      currentPermissions.enableDeliveryRadius ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 5. Relatórios & Métricas */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  currentPermissions.enableFinancialMetrics
                    ? (isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/15 border-sky-900/40')
                    : (isLight ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-[#121820]/60 border-[#1C2631] opacity-60')
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Relatórios & Métricas Financeiras
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Painel de faturamento diário, ticket médio e produtos mais vendidos.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('enableFinancialMetrics')}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1 ${
                      currentPermissions.enableFinancialMetrics ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      currentPermissions.enableFinancialMetrics ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 6. Leitor de Código de Barras */}
                <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                  currentPermissions.enableBarcodeScanner
                    ? (isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/15 border-sky-900/40')
                    : (isLight ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-[#121820]/60 border-[#1C2631] opacity-60')
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shrink-0">
                      <Barcode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Leitor de Código de Barras USB / BT
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Bipe rápido de latas, garrafas e pacotes com leitor óptico.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('enableBarcodeScanner')}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 mt-1 ${
                      currentPermissions.enableBarcodeScanner ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      currentPermissions.enableBarcodeScanner ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Alterações de permissões são aplicadas em tempo real nos painéis selecionados.
                </span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Sincronizado automaticamente</span>
                </span>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: PREÇOS DAS 4 OPÇÕES DE ASSINATURA                      */}
          {/* ============================================================ */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Tabela Oficial de Preços dos 4 Planos Nuvi SaaS
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina os valores mensais que você cobrará dos comerciantes ao assinarem a plataforma.
                </p>
              </div>

              {/* Grid dos 4 Planos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plansState.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isLight 
                        ? 'bg-slate-50/70 border-slate-200 hover:border-sky-300' 
                        : 'bg-[#121820] border-[#1C2631] hover:border-sky-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                          Opção {index + 1} • {plan.badge || 'Plano'}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {plan.active ? 'Ativo para Venda' : 'Inativo'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {plan.description}
                        </p>
                      </div>

                      {/* Campo de Preço do Plano */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Preço da Assinatura (R$):
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-500">R$</span>
                          <input
                            type="number"
                            step="0.10"
                            min="0"
                            value={plan.price}
                            onChange={(e) => handlePlanPriceChange(plan.id, e.target.value)}
                            className={`w-36 px-3 py-2 text-sm font-black rounded-xl border outline-none transition-all ${
                              isLight 
                                ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                                : 'bg-[#0B0F12] border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                            }`}
                          />
                          <span className="text-xs text-slate-500 font-semibold">{plan.period}</span>
                        </div>
                      </div>

                      {/* Recursos Inclusos */}
                      <div className="pt-2 space-y-1.5 border-t border-slate-200 dark:border-[#1C2631]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recursos Inclusos:
                        </span>
                        {plan.features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de Salvar Planos */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSavePlans}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Preços dos 4 Planos</span>
                </button>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 3: DIVULGAÇÃO & PROMOÇÕES DE VENDAS NO PAINEL             */}
          {/* ============================================================ */}
          {activeTab === 'promo' && (
            <div className="space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Banner Promocional no Painel dos Lojistas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Divulgue promoções de upgrade, descontos e ofertas de planos diretamente dentro do painel de todas as lojas.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Ativação do Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                }`}>
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-sky-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Exibir Banner Promocional para Todos os Comerciantes
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Aparecerá fixado no topo do painel de gestão das lojas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoState(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      promoState.enabled ? 'bg-sky-600' : 'bg-slate-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      promoState.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Título da Promoção */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Título da Oferta / Promoção
                  </label>
                  <input
                    type="text"
                    value={promoState.title}
                    onChange={(e) => setPromoState(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: 🔥 Promoção Especial de Lançamento Nuvi SaaS"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                        : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                    }`}
                  />
                </div>

                {/* Mensagem da Promoção */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Texto / Mensagem da Oferta
                  </label>
                  <textarea
                    rows={2}
                    value={promoState.message}
                    onChange={(e) => setPromoState(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Ex: Assine o Plano Completo neste mês com 30% de desconto e garanta suporte prioritário!"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                        : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                    }`}
                  />
                </div>

                {/* Botão de Ação (CTA) e Link do WhatsApp do Master */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={promoState.ctaText}
                      onChange={(e) => setPromoState(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Ex: Falar com Consultor no WhatsApp"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                        isLight 
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                          : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Link de Destino / Seu WhatsApp
                    </label>
                    <input
                      type="text"
                      value={promoState.ctaUrl}
                      onChange={(e) => setPromoState(prev => ({ ...prev, ctaUrl: e.target.value }))}
                      placeholder="Ex: https://wa.me/5511999999999?text=Quero%20a%20promoção"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                        isLight 
                          ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                          : 'bg-[#121820] border border-[#1C2631] text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Prévia Visual do Banner */}
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Prévia de como o comerciante verá no topo do painel:
                  </span>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <h4 className="font-extrabold text-xs sm:text-sm">{promoState.title || 'Título da Promoção'}</h4>
                      </div>
                      <p className="text-xs text-sky-100">{promoState.message || 'Descrição da promoção...'}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="px-4 py-2 rounded-xl bg-white text-blue-700 font-extrabold text-xs shadow-md inline-flex items-center gap-1.5">
                        <span>{promoState.ctaText || 'Aproveitar'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Botão Salvar Promoção */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSavePromo}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Publicar Promoção no Painel dos Lojistas</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer do Modal */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span>Configurações exclusivas do Administrador Geral Nuvi</span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' 
                : 'bg-[#161D24] hover:bg-[#1E2933] border-[#222E3A] text-slate-200'
            }`}
          >
            Fechar
          </button>
        </div>

      </div>

    </div>
  );
};
