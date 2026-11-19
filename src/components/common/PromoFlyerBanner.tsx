import React from 'react';
import { MessageCircle, ArrowRight, X, Flame, Zap, Rocket, Tag } from 'lucide-react';
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

  // Configurações visuais criativas de cada tema de banner (Retail Slim)
  const themeStyles = {
    cyber_neon: {
      background: 'bg-gradient-to-r from-[#041120] via-[#092548] to-[#06182e]',
      stripe1: 'bg-gradient-to-r from-sky-500/15 via-cyan-400/20 to-transparent',
      stripe2: 'bg-gradient-to-r from-blue-600/15 to-sky-400/10',
      stripe3: 'bg-cyan-400/10',
      accentGlow: 'bg-cyan-500/15',
      badgeBg: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20',
      badgeIcon: <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />,
      tagHighlightBg: 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-900/30',
      tagHighlightLabel: '30% OFF',
      accentText: 'text-sky-100/90',
      dotColor: 'text-sky-300/15',
      // Botão menor com fundo transparente translúcido
      btnStyle: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 backdrop-blur-md shadow-md shadow-black/30',
      btnIconColor: 'text-emerald-400 fill-emerald-400',
      defaultBadge: '⚡ OFERTA EXCLUSIVA NUVI',
    },
    sunset_gold: {
      background: 'bg-gradient-to-r from-[#120803] via-[#331505] to-[#1a0a02]',
      stripe1: 'bg-gradient-to-r from-amber-500/15 via-orange-400/20 to-transparent',
      stripe2: 'bg-gradient-to-r from-amber-600/15 to-yellow-500/10',
      stripe3: 'bg-amber-400/10',
      accentGlow: 'bg-amber-500/15',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20',
      badgeIcon: <Flame className="w-3 h-3 text-slate-950 fill-slate-950" />,
      tagHighlightBg: 'bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-md shadow-amber-950/40',
      tagHighlightLabel: 'MEGA SALE',
      accentText: 'text-amber-100/90',
      dotColor: 'text-amber-300/15',
      // Botão menor com fundo transparente translúcido
      btnStyle: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/30 backdrop-blur-md shadow-md shadow-black/30',
      btnIconColor: 'text-amber-400 fill-amber-400',
      defaultBadge: '🔥 MEGA OFERTA LIMITADA',
    },
    emerald_turbo: {
      background: 'bg-gradient-to-r from-[#01140A] via-[#06331D] to-[#021C11]',
      stripe1: 'bg-gradient-to-r from-emerald-500/15 via-teal-400/20 to-transparent',
      stripe2: 'bg-gradient-to-r from-green-600/15 to-emerald-400/10',
      stripe3: 'bg-emerald-400/10',
      accentGlow: 'bg-emerald-500/15',
      badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20',
      badgeIcon: <Rocket className="w-3 h-3 text-slate-950 fill-slate-950" />,
      tagHighlightBg: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-950/40',
      tagHighlightLabel: 'TURBO',
      accentText: 'text-emerald-100/90',
      dotColor: 'text-emerald-300/15',
      // Botão menor com fundo transparente translúcido
      btnStyle: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 backdrop-blur-md shadow-md shadow-black/30',
      btnIconColor: 'text-emerald-400 fill-emerald-400',
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
    <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border-0 ring-0 shadow-2xl transition-all py-3.5 px-4 sm:py-4 sm:px-6 text-white select-none ${themeStyles.background}`}>
      
      {/* ======================================================== */}
      {/* ELEMENTOS GRÁFICOS DINÂMICOS DE CAMPANHA (RETAIL SLIM)   */}
      {/* ======================================================== */}
      
      {/* 1. Faixas Angulares de Velocidade em Camadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className={`absolute -top-12 -bottom-12 left-1/4 w-64 sm:w-80 transform -skew-x-[20deg] ${themeStyles.stripe1}`} 
        />
        <div 
          className={`absolute -top-16 -bottom-16 left-1/3 w-28 sm:w-40 transform -skew-x-[20deg] ${themeStyles.stripe2}`} 
        />
        <div 
          className={`absolute -top-10 -bottom-10 left-1/2 w-3 transform -skew-x-[20deg] ${themeStyles.stripe3}`} 
        />
        <div 
          className={`absolute -top-20 -bottom-20 right-10 w-52 transform -skew-x-[20deg] opacity-40 ${themeStyles.stripe1}`} 
        />
      </div>

      {/* 2. Grid de Pontinhos Decorativos */}
      <div className="absolute top-2.5 left-8 pointer-events-none opacity-30 hidden sm:block">
        <svg width="54" height="26" viewBox="0 0 54 26" fill="currentColor" className={themeStyles.dotColor}>
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="16" cy="4" r="1.5" />
          <circle cx="28" cy="4" r="1.5" />
          <circle cx="40" cy="4" r="1.5" />
          <circle cx="4" cy="16" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
          <circle cx="28" cy="16" r="1.5" />
          <circle cx="40" cy="16" r="1.5" />
        </svg>
      </div>

      {/* 3. Formas Geométricas Flutuantes Discretas */}
      <div className="absolute top-3 right-1/3 w-3 h-3 border border-white/20 transform rotate-45 pointer-events-none hidden md:block" />
      <div className="absolute bottom-3 left-1/3 w-2 h-2 rounded-full border border-white/20 pointer-events-none hidden md:block" />

      {/* 4. Iluminação Suave de Fundo */}
      <div className={`absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-50 ${themeStyles.accentGlow}`} />
      <div className={`absolute -bottom-12 right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-40 ${themeStyles.accentGlow}`} />

      {/* 5. Feixe de Luz Transversal Contínuo e Elegante */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="nuvi-banner-light-ray absolute top-0 bottom-0 w-36 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-[22deg]" />
      </div>

      <style>{`
        @keyframes nuviBannerRayAnim {
          0% { transform: translateX(-180%) skewX(-22deg); opacity: 0; }
          25% { opacity: 0.7; }
          60% { transform: translateX(750%) skewX(-22deg); opacity: 0.5; }
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
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer z-30 shadow-xs"
          title="Fechar aviso promocional"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ======================================================== */}
      {/* CONTEÚDO PRINCIPAL (SLIM / ALTURA COMPACTA)              */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 pr-5 sm:pr-6">
        
        {/* Lado Esquerdo: Badges Dinâmicas + Título + Mensagem Enxuta */}
        <div className="space-y-1 sm:space-y-1.5 max-w-3xl min-w-0">
          
          {/* Linha de Badges Promocionais Estilo Retail */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Badge Inclinada Estilo Sale */}
            <div className={`transform -rotate-2 px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 transition-transform hover:scale-105 ${themeStyles.badgeBg}`}>
              {themeStyles.badgeIcon}
              <span>{badgeLabel}</span>
            </div>

            {/* Selo Flutuante de Desconto / Vantagem em Destaque */}
            <div className={`transform rotate-1 px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${themeStyles.tagHighlightBg}`}>
              <Tag className="w-2.5 h-2.5" />
              <span>{detectedHighlight}</span>
            </div>

            {/* Indicador de Oferta Ativa */}
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white/60 uppercase tracking-widest pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Oferta Ativa</span>
            </span>
          </div>

          {/* Título Principal com Tipografia de Alto Impacto e Altura Controlada */}
          <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-snug drop-shadow-sm truncate">
            {banner.title || 'Promoção Exclusiva de Lançamento Nuvi SaaS'}
          </h2>

          {/* Mensagem Comercial Enxuta */}
          <p className={`text-[11px] sm:text-xs font-medium leading-relaxed line-clamp-2 ${themeStyles.accentText}`}>
            {banner.message || 'Assine o Plano Completo neste mês com descontos especiais e garanta suporte prioritário de implantação!'}
          </p>
        </div>

        {/* Lado Direito / Canto Inferior Direito: Botão Menor e Transparente */}
        <div className="shrink-0 self-end sm:self-end pt-1 sm:pt-0">
          {isPreview ? (
            <div className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs inline-flex items-center gap-2 select-none transition-all active:scale-95 ${themeStyles.btnStyle}`}>
              <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${themeStyles.btnIconColor}`} />
              <span className="tracking-tight">{banner.ctaText || 'Falar com Consultor'}</span>
              <ArrowRight className="w-3 h-3 shrink-0 stroke-[2.2] opacity-80" />
            </div>
          ) : (
            <a
              href={banner.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${themeStyles.btnStyle}`}
            >
              <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${themeStyles.btnIconColor}`} />
              <span className="tracking-tight">{banner.ctaText || 'Falar com Consultor'}</span>
              <ArrowRight className="w-3 h-3 shrink-0 stroke-[2.2] opacity-80" />
            </a>
          )}
        </div>

      </div>

    </div>
  );
};
