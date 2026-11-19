import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, X, Flame, Zap, Rocket } from 'lucide-react';
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
  description: string;
  colorPreview: string;
}[] = [
  {
    id: 'cyber_neon',
    name: 'Cyber Neon VIP',
    badge: '⚡ OFERTA EXCLUSIVA NUVI',
    description: 'Fundo azul noturno com laser ciano e partículas holográficas',
    colorPreview: 'from-[#031424] via-[#06294d] to-[#0a4275]'
  },
  {
    id: 'sunset_gold',
    name: 'Sunset Gold & Chamas',
    badge: '🔥 MEGA OFERTA LIMITADA',
    description: 'Fundo degradê dourado/âmbar com chamas e reflexo de ouro líquido',
    colorPreview: 'from-[#1f0b02] via-[#481c05] to-[#7a2e07]'
  },
  {
    id: 'emerald_turbo',
    name: 'Emerald Turbo WhatsApp',
    badge: '🚀 TURBINE SUAS VENDAS',
    description: 'Fundo verde esmeralda com anéis de energia e laser neon de conversão',
    colorPreview: 'from-[#01170e] via-[#053d24] to-[#09663d]'
  }
];

export const PromoFlyerBanner: React.FC<PromoFlyerBannerProps> = ({
  banner,
  onDismiss,
  isPreview = false,
}) => {
  const theme = banner.theme || 'cyber_neon';

  // Configurações específicas de cada tema de flyer
  const themeStyles = {
    cyber_neon: {
      container: 'bg-gradient-to-r from-[#020e1c] via-[#052445] to-[#093e6c] border-sky-400/50 shadow-sky-950/80',
      glow1: 'bg-sky-500/35',
      glow2: 'bg-cyan-400/30',
      glow3: 'bg-blue-600/25',
      sweepColor: 'via-cyan-300/50',
      badgeBg: 'bg-sky-400/20 text-sky-200 border-sky-300/30',
      badgeIcon: <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />,
      btnGradient: 'bg-gradient-to-r from-[#25D366] via-[#20bd5a] to-[#128C7E] hover:from-[#22c35e] hover:to-[#0f7a6e] text-white border-emerald-300/40 shadow-emerald-950/60',
      defaultBadge: '⚡ OFERTA EXCLUSIVA NUVI',
      accentText: 'text-sky-100/90'
    },
    sunset_gold: {
      container: 'bg-gradient-to-r from-[#1c0a02] via-[#451904] to-[#752a06] border-amber-400/50 shadow-amber-950/80',
      glow1: 'bg-amber-500/35',
      glow2: 'bg-orange-500/30',
      glow3: 'bg-yellow-400/25',
      sweepColor: 'via-amber-200/50',
      badgeBg: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
      badgeIcon: <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />,
      btnGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white border-amber-300/40 shadow-amber-950/60',
      defaultBadge: '🔥 MEGA OFERTA LIMITADA',
      accentText: 'text-amber-100/90'
    },
    emerald_turbo: {
      container: 'bg-gradient-to-r from-[#01170e] via-[#053d24] to-[#09663d] border-emerald-400/50 shadow-emerald-950/80',
      glow1: 'bg-emerald-500/35',
      glow2: 'bg-teal-400/30',
      glow3: 'bg-green-600/25',
      sweepColor: 'via-emerald-200/50',
      badgeBg: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
      badgeIcon: <Rocket className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />,
      btnGradient: 'bg-gradient-to-r from-[#25D366] via-[#10b981] to-[#059669] hover:from-[#20bd5a] hover:to-[#047857] text-white border-emerald-300/40 shadow-emerald-950/60',
      defaultBadge: '🚀 TURBINE SUAS VENDAS',
      accentText: 'text-emerald-100/90'
    }
  }[theme];

  const badgeLabel = banner.badgeText || themeStyles.defaultBadge;

  return (
    <div className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all p-5 sm:p-6 text-white ${themeStyles.container}`}>
      
      {/* Botão de Fechar / Dispensar Banner (apenas quando não é prévia) */}
      {!isPreview && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer z-20"
          title="Fechar aviso promocional"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Luzes Difusas de Fundo Estilo Flyer Publicitário */}
      <div className={`absolute -top-12 -left-12 w-56 h-56 rounded-full blur-3xl pointer-events-none animate-pulse ${themeStyles.glow1}`} />
      <div className={`absolute -bottom-10 right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none ${themeStyles.glow2}`} />
      <div className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${themeStyles.glow3}`} />
      
      {/* Padrão Sutil de Grade Geométrica */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]"
      />

      {/* Feixe de Luz Animado Atravessando o Flyer Continuamente */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`nuvi-flyer-sweep absolute top-0 bottom-0 w-52 bg-gradient-to-r from-transparent ${themeStyles.sweepColor} to-transparent skew-x-[-22deg]`} />
      </div>

      <style>{`
        @keyframes nuviFlyerSweepAnim {
          0% { transform: translateX(-180%); opacity: 0; }
          20% { opacity: 1; }
          55% { transform: translateX(650%); opacity: 0.9; }
          70% { opacity: 0; }
          100% { transform: translateX(650%); opacity: 0; }
        }
        .nuvi-flyer-sweep {
          animation: nuviFlyerSweepAnim 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Conteúdo do Flyer */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pr-6 sm:pr-8">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded-lg bg-white/10 text-amber-300 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </span>
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${themeStyles.badgeBg}`}>
              {themeStyles.badgeIcon}
              <span>{badgeLabel}</span>
            </span>
            <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
              {banner.title || 'Promoção Exclusiva'}
            </h3>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed font-medium ${themeStyles.accentText}`}>
            {banner.message || 'Descrição da oferta especial para os comerciantes da plataforma.'}
          </p>
        </div>

        {/* Botão de Contato WhatsApp com Efeito de Flyer e Ícone Verde do WhatsApp */}
        {isPreview ? (
          <div className={`px-5 py-3 rounded-2xl font-extrabold text-xs shadow-xl inline-flex items-center gap-2.5 shrink-0 border select-none ${themeStyles.btnGradient}`}>
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
            </div>
            <span className="text-white font-extrabold text-xs tracking-tight">{banner.ctaText || 'Falar no WhatsApp'}</span>
            <ArrowRight className="w-4 h-4 text-white shrink-0" />
          </div>
        ) : (
          <a
            href={banner.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs shadow-xl active:scale-[0.98] transition-all inline-flex items-center gap-2.5 shrink-0 cursor-pointer border ${themeStyles.btnGradient}`}
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
            </div>
            <span className="text-white font-extrabold text-xs tracking-tight">{banner.ctaText || 'Falar no WhatsApp'}</span>
            <ArrowRight className="w-4 h-4 text-white shrink-0" />
          </a>
        )}
      </div>

    </div>
  );
};
