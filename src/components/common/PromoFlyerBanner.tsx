import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, X, Flame, Zap, Rocket, Tag } from 'lucide-react';
import { SaaSPromoBanner, SaaSPromoBannerTheme } from '../../types';

interface PromoFlyerBannerProps {
  banner: SaaSPromoBanner;
  onDismiss?: () => void;
  isPreview?: boolean;
}

export const PROMO_BANNER_THEMES: {
  id: SaaSPromoBannerTheme;
  name: string;
  badge: string;
  tagHighlight: string;
  description: string;
  colorPreview: string;
}[] = [
  {
    id: 'cyber_neon',
    name: 'Cyber Retail Pro',
    badge: '⚡ OFERTA EXCLUSIVA NUVI',
    tagHighlight: '30% OFF',
    description: 'Estilo retail dinâmico com faixas angulares, grid de dots e badge inclinada',
    colorPreview: 'from-[#051324] via-[#0B284C] to-[#071E38]'
  },
  {
    id: 'sunset_gold',
    name: 'Gold Luxury Sale',
    badge: '🔥 MEGA OFERTA LIMITADA',
    tagHighlight: 'VIP DEALS',
    description: 'Design de campanha luxuosa com faixas douradas, pontos geométricos e fogo',
    colorPreview: 'from-[#140803] via-[#331505] to-[#1A0A02]'
  },
  {
    id: 'emerald_turbo',
    name: 'Turbo Speed Deals',
    badge: '🚀 TURBINE SEU COMÉRCIO',
    tagHighlight: 'TURBO',
    description: 'Composição de alta velocidade em verde esmeralda com faixas de conversão',
    colorPreview: 'from-[#01140A] via-[#06331D] to-[#021C11]'
  }
];

export const PromoFlyerBanner: React.FC<PromoFlyerBannerProps> = ({
  banner,
  onDismiss,
  isPreview = false,
}) => {
  const theme = banner.theme || 'cyber_neon';

  // Configurações visuais criativas de cada tema de banner (Retail / Campanha)
  const themeStyles = {
    cyber_neon: {
      background: 'bg-gradient-to-r from-[#041120] via-[#092548] to-[#06182e]',
      stripe1: 'bg-gradient-to-r from-sky-500/20 via-cyan-400/25 to-transparent',
      stripe2: 'bg-gradient-to-r from-blue-600/20 to-sky-400/10',
      stripe3: 'bg-cyan-400/15',
      accentGlow: 'bg-cyan-500/20',
      badgeBg: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25',
      badgeIcon: <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />,
      tagHighlightBg: 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-xl shadow-cyan-900/40',
      tagHighlightLabel: '30% OFF',
      accentText: 'text-sky-100/90',
      dotColor: 'text-sky-300/20',
      btnGradient: 'bg-gradient-to-r from-[#25D366] via-[#20bd5a] to-[#128C7E] hover:from-[#22c35e] hover:to-[#0f7a6e] text-white shadow-xl shadow-emerald-950/60',
      defaultBadge: '⚡ OFERTA EXCLUSIVA NUVI',
    },
    sunset_gold: {
      background: 'bg-gradient-to-r from-[#120803] via-[#331505] to-[#1a0a02]',
      stripe1: 'bg-gradient-to-r from-amber-500/20 via-orange-400/25 to-transparent',
      stripe2: 'bg-gradient-to-r from-amber-600/20 to-yellow-500/10',
      stripe3: 'bg-amber-400/15',
      accentGlow: 'bg-amber-500/20',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25',
      badgeIcon: <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />,
      tagHighlightBg: 'bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-xl shadow-amber-950/50',
      tagHighlightLabel: 'MEGA SALE',
      accentText: 'text-amber-100/90',
      dotColor: 'text-amber-300/20',
      btnGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-xl shadow-amber-950/60',
      defaultBadge: '🔥 MEGA OFERTA LIMITADA',
    },
    emerald_turbo: {
      background: 'bg-gradient-to-r from-[#01140A] via-[#06331D] to-[#021C11]',
      stripe1: 'bg-gradient-to-r from-emerald-500/20 via-teal-400/25 to-transparent',
      stripe2: 'bg-gradient-to-r from-green-600/20 to-emerald-400/10',
      stripe3: 'bg-emerald-400/15',
      accentGlow: 'bg-emerald-500/20',
      badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25',
      badgeIcon: <Rocket className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />,
      tagHighlightBg: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-950/50',
      tagHighlightLabel: 'TURBO',
      accentText: 'text-emerald-100/90',
      dotColor: 'text-emerald-300/20',
      btnGradient: 'bg-gradient-to-r from-[#25D366] via-[#10b981] to-[#059669] hover:from-[#20bd5a] hover:to-[#047857] text-white shadow-xl shadow-emerald-950/60',
      defaultBadge: '🚀 TURBINE SEU COMÉRCIO',
    }
  }[theme];

  const badgeLabel = banner.badgeText || themeStyles.defaultBadge;

  // Extrai possível percentual de desconto ou destaque da mensagem ou título
  const detectedHighlight = (() => {
    const text = `${banner.title || ''} ${banner.message || ''}`;
    const percentMatch = text.match(/\b\d{1,2}%\s*(?:off|de\s*desconto)?\b/i);
    if (percentMatch) return percentMatch[0].toUpperCase();
    return themeStyles.tagHighlightLabel;
  })();

  return (
    <div className={`relative rounded-3xl overflow-hidden border-0 ring-0 shadow-2xl transition-all p-5 sm:p-7 text-white select-none ${themeStyles.background}`}>
      
      {/* ======================================================== */}
      {/* ELEMENTOS GRÁFICOS DINÂMICOS DE CAMPANHA (ESTILO RETAIL) */}
      {/* ======================================================== */}
      
      {/* 1. Faixas Angulares de Velocidade em Camadas (Skewed Stripes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Faixa larga de base */}
        <div 
          className={`absolute -top-16 -bottom-16 left-1/4 w-72 sm:w-96 transform -skew-x-[20deg] ${themeStyles.stripe1}`} 
        />
        {/* Faixa secundária de corte */}
        <div 
          className={`absolute -top-20 -bottom-20 left-1/3 w-32 sm:w-48 transform -skew-x-[20deg] ${themeStyles.stripe2}`} 
        />
        {/* Linha fina de velocidade */}
        <div 
          className={`absolute -top-10 -bottom-10 left-1/2 w-4 transform -skew-x-[20deg] ${themeStyles.stripe3}`} 
        />
        {/* Faixa direita de profundidade */}
        <div 
          className={`absolute -top-24 -bottom-24 right-10 w-64 transform -skew-x-[20deg] opacity-40 ${themeStyles.stripe1}`} 
        />
      </div>

      {/* 2. Grid de Pontinhos Decorativos (Dot Pattern de Flyer) */}
      <div className="absolute top-3 left-10 pointer-events-none opacity-40 hidden sm:block">
        <svg width="68" height="36" viewBox="0 0 68 36" fill="currentColor" className={themeStyles.dotColor}>
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="18" cy="4" r="1.5" />
          <circle cx="32" cy="4" r="1.5" />
          <circle cx="46" cy="4" r="1.5" />
          <circle cx="60" cy="4" r="1.5" />
          <circle cx="4" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
          <circle cx="32" cy="18" r="1.5" />
          <circle cx="46" cy="18" r="1.5" />
          <circle cx="60" cy="18" r="1.5" />
          <circle cx="4" cy="32" r="1.5" />
          <circle cx="18" cy="32" r="1.5" />
          <circle cx="32" cy="32" r="1.5" />
          <circle cx="46" cy="32" r="1.5" />
          <circle cx="60" cy="32" r="1.5" />
        </svg>
      </div>

      <div className="absolute bottom-3 right-48 pointer-events-none opacity-30 hidden md:block">
        <svg width="54" height="26" viewBox="0 0 54 26" fill="currentColor" className={themeStyles.dotColor}>
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="18" cy="4" r="1.5" />
          <circle cx="32" cy="4" r="1.5" />
          <circle cx="46" cy="4" r="1.5" />
          <circle cx="4" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
          <circle cx="32" cy="18" r="1.5" />
          <circle cx="46" cy="18" r="1.5" />
        </svg>
      </div>

      {/* 3. Formas Geométricas Flutuantes (Losangos e Círculos Vazados) */}
      <div className="absolute top-4 right-1/3 w-3.5 h-3.5 border-2 border-white/20 transform rotate-45 pointer-events-none hidden sm:block animate-pulse" />
      <div className="absolute bottom-4 left-1/3 w-2.5 h-2.5 rounded-full border border-white/25 pointer-events-none hidden sm:block" />
      <div className="absolute top-1/2 right-12 w-6 h-6 rounded-full border-2 border-white/10 pointer-events-none hidden lg:block" />

      {/* 4. Iluminação Suave de Fundo (Backlight sem borda) */}
      <div className={`absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-60 ${themeStyles.accentGlow}`} />
      <div className={`absolute -bottom-16 right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-50 ${themeStyles.accentGlow}`} />

      {/* 5. Feixe de Luz Transversal Contínuo e Elegante */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="nuvi-banner-light-ray absolute top-0 bottom-0 w-44 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-[22deg]" />
      </div>

      <style>{`
        @keyframes nuviBannerRayAnim {
          0% { transform: translateX(-180%) skewX(-22deg); opacity: 0; }
          25% { opacity: 0.8; }
          60% { transform: translateX(750%) skewX(-22deg); opacity: 0.6; }
          75% { opacity: 0; }
          100% { transform: translateX(750%) skewX(-22deg); opacity: 0; }
        }
        .nuvi-banner-light-ray {
          animation: nuviBannerRayAnim 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Botão de Fechar / Dispensar Banner (quando não é prévia) */}
      {!isPreview && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer z-30 shadow-xs"
          title="Fechar aviso promocional"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* ======================================================== */}
      {/* CONTEÚDO PRINCIPAL DO BANNER DE CAMPANHA                 */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pr-6 sm:pr-8">
        
        {/* Lado Esquerdo: Badges Dinâmicas + Títulos Estilizados */}
        <div className="space-y-2.5 max-w-3xl">
          
          {/* Linha de Badges Promocionais Estilo Retail */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Badge Inclinada Estilo Sale (Super Sale da referência) */}
            <div className={`transform -rotate-2 px-3 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-transform hover:scale-105 ${themeStyles.badgeBg}`}>
              {themeStyles.badgeIcon}
              <span>{badgeLabel}</span>
            </div>

            {/* Selo Flutuante de Desconto / Vantagem em Destaque */}
            <div className={`transform rotate-1 px-2.5 py-0.5 rounded-md font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1 ${themeStyles.tagHighlightBg}`}>
              <Tag className="w-3 h-3" />
              <span>{detectedHighlight}</span>
            </div>

            {/* Indicador de Oferta Ativa */}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Campanha Ativa</span>
            </span>
          </div>

          {/* Título Principal com Tipografia de Alto Impacto */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {banner.title || 'Promoção Exclusiva de Lançamento Nuvi SaaS'}
          </h2>

          {/* Mensagem / Descrição Comercial Clara e Atrativa */}
          <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-2xl ${themeStyles.accentText}`}>
            {banner.message || 'Assine o Plano Completo neste mês com descontos especiais e garanta suporte prioritário de implantação!'}
          </p>
        </div>

        {/* Lado Direito: Botão de Ação Estilo "SHOP NOW" com WhatsApp */}
        <div className="shrink-0 pt-1 lg:pt-0">
          {isPreview ? (
            <div className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-2xl inline-flex items-center gap-3 select-none transform hover:scale-[1.02] transition-transform ${themeStyles.btnGradient}`}>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              </div>
              <span className="tracking-tight">{banner.ctaText || 'Falar com Consultor no WhatsApp'}</span>
              <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
            </div>
          ) : (
            <a
              href={banner.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-2xl inline-flex items-center gap-3 cursor-pointer active:scale-[0.98] transform hover:scale-[1.02] transition-all ${themeStyles.btnGradient}`}
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              </div>
              <span className="tracking-tight">{banner.ctaText || 'Falar com Consultor no WhatsApp'}</span>
              <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
            </a>
          )}
        </div>

      </div>

    </div>
  );
};
