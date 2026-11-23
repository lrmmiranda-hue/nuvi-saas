import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { STORE_WALLPAPERS, WALLPAPER_CATEGORIES, getSegmentWallpapers } from '../../data/wallpapers';
import { PRESET_THEMES, PRESET_BANNERS, getSegmentThemes } from './OnboardingWizardModal';
import { getSegmentById } from '../../data/businessSegments';
import {
  Check,
  ExternalLink,
  Sparkles,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sun,
  Moon,
  ChevronDown,
  Search,
  CheckCircle2,
  Edit3,
  ShieldAlert,
  Info,
  Clock,
  MapPin,
  MessageSquare,
  ShoppingCart,
  Store,
  Wine,
  Sandwich,
  Pizza,
  Fish,
  Dog,
  Megaphone,
  Palette,
  X,
  Plus
} from 'lucide-react';

interface StoreBrandingSettingsProps {
  isLight?: boolean;
}

export const StoreBrandingSettings: React.FC<StoreBrandingSettingsProps> = ({ isLight = false }) => {
  const { currentTenant, updateTenant, setViewRole, showAlert } = useStore();

  const [brandingEdits, setBrandingEdits] = useState(currentTenant?.branding);
  const [sloganEdit, setSloganEdit] = useState(currentTenant?.slogan || '');

  // Sincroniza quando currentTenant mudar
  useEffect(() => {
    if (currentTenant) {
      setBrandingEdits(currentTenant.branding);
      setSloganEdit(currentTenant.slogan);
    }
  }, [currentTenant]);

  const isOnlineEnabled = currentTenant?.config?.enableOnlineSales ?? true;
  const activePrimary = brandingEdits?.primaryColor || currentTenant?.branding?.primaryColor || '#09090B';
  const activeAccent = brandingEdits?.accentColor || currentTenant?.branding?.accentColor || '#F59E0B';

  const [isColorFilterOpen, setIsColorFilterOpen] = useState(false);
  const [colorSearchQuery, setColorSearchQuery] = useState('');

  const currentSegmentThemes = useMemo(() => {
    return getSegmentThemes(currentTenant?.businessSegment);
  }, [currentTenant?.businessSegment]);

  const activeThemeSelected = useMemo(() => {
    return currentSegmentThemes.find(
      (t) =>
        t.primary.toLowerCase() === activePrimary.toLowerCase() &&
        t.accent.toLowerCase() === activeAccent.toLowerCase()
    ) || currentSegmentThemes[0] || {
      id: 'custom',
      name: 'Paleta Personalizada',
      primary: activePrimary,
      accent: activeAccent,
      style: 'gold_luxury' as const,
      desc: 'Cores ativas na vitrine',
    };
  }, [currentSegmentThemes, activePrimary, activeAccent]);

  const filteredSegmentThemes = useMemo(() => {
    if (!colorSearchQuery.trim()) return currentSegmentThemes;
    const q = colorSearchQuery.toLowerCase();
    return currentSegmentThemes.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q))
    );
  }, [currentSegmentThemes, colorSearchQuery]);

  const isLightColor = (hex: string): boolean => {
    if (!hex || !hex.startsWith('#')) return false;
    const c = hex.substring(1);
    const rgb = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
    if (isNaN(rgb)) return false;
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 165;
  };

  const currentSegmentConfig = useMemo(() => {
    return getSegmentById(currentTenant?.businessSegment || 'adega');
  }, [currentTenant?.businessSegment]);

  const segmentWallpapers = useMemo(() => {
    return getSegmentWallpapers(currentTenant?.businessSegment);
  }, [currentTenant?.businessSegment]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: 'Arquivo Muito Grande',
        message: 'A imagem da logo deve ter no máximo 5MB.',
        variant: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && brandingEdits && currentTenant) {
        const updatedBranding = { ...brandingEdits, logoUrl: dataUrl };
        setBrandingEdits(updatedBranding);
        updateTenant(currentTenant.id, { branding: updatedBranding });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showAlert({
        title: 'Arquivo Muito Grande',
        message: 'A imagem do papel de parede deve ter no máximo 8MB.',
        variant: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && brandingEdits && currentTenant) {
        const updatedBranding = { ...brandingEdits, bannerUrl: dataUrl };
        setBrandingEdits(updatedBranding);
        updateTenant(currentTenant.id, { branding: updatedBranding });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (brandingEdits && currentTenant) {
      const updatedBranding = { ...brandingEdits, logoUrl: '' };
      setBrandingEdits(updatedBranding);
      updateTenant(currentTenant.id, { branding: updatedBranding });
    }
  };

  const handleSaveBranding = () => {
    if (brandingEdits && currentTenant) {
      updateTenant(currentTenant.id, {
        branding: brandingEdits,
        slogan: sloganEdit,
      });
      showAlert({
        title: 'Vitrine & Visual Salvos!',
        message: 'A identidade visual da sua vitrine foi atualizada com sucesso.',
        variant: 'success',
      });
    }
  };

  if (!currentTenant) return null;

  return (
        <div className="space-y-6">
          <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                Personalização da Vitrine Online & Identidade Visual
              </h2>
              <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Escolha as cores da marca, o papel de parede (estilo flyer) de acordo com seu comércio e o logotipo da vitrine web.
              </p>
            </div>

            <button
              onClick={handleSaveBranding}
              style={{
                backgroundColor: activeAccent,
                color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Visual & Vitrine</span>
            </button>
          </div>

          {/* PRÉVIA EM TEMPO REAL DA VITRINE ONLINE */}
          {isOnlineEnabled ? (
            <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors ${
              isLight ? 'bg-white border-neutral-300' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className={`p-3 border-b flex items-center justify-between text-xs ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${brandingEdits?.bannerUrl ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                  <span className={`font-bold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    Prévia em Tempo Real da Vitrine Online
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Como seus clientes verão na web
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewRole('storefront')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <span>Abrir Vitrine</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Banner Hero Preview com o Papel de Parede / Flyer e Estilo de Iluminação Idêntico à Vitrine */}
              {(() => {
                const lighting = brandingEdits?.bannerLighting || 'dark_lights';
                const isWhite = lighting === 'white_lights';
                const isDarkLights = lighting === 'dark_lights';
                const isNeutral = lighting === 'neutral';
                const brandAccent = brandingEdits?.accentColor || currentTenant.branding.accentColor || '#F59E0B';
                const brandPrimary = brandingEdits?.primaryColor || currentTenant.branding.primaryColor || '#881337';

                // Overlay Dinâmico 100% igual à Vitrine Real
                let overlayBg = `linear-gradient(105deg, ${brandPrimary}F2 0%, ${brandPrimary}B3 50%, rgba(10, 10, 10, 0.88) 100%)`;
                let overlayBoxShadow = 'none';

                if (isNeutral) {
                  overlayBg = 'linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.75) 100%)';
                } else if (isDarkLights) {
                  overlayBg = `
                    radial-gradient(circle at 82% 18%, ${brandAccent}45 0%, rgba(14, 165, 233, 0.25) 30%, transparent 65%),
                    radial-gradient(circle at 95% 82%, rgba(14, 165, 233, 0.20) 0%, transparent 45%),
                    linear-gradient(130deg, transparent 52%, rgba(255, 255, 255, 0.08) 68%, ${brandAccent}30 73%, transparent 84%),
                    linear-gradient(to right, 
                      rgba(8, 8, 8, 0.97) 0%, 
                      rgba(10, 10, 10, 0.92) 28%, 
                      rgba(10, 10, 10, 0.68) 50%, 
                      rgba(10, 10, 10, 0.22) 72%, 
                      rgba(5, 5, 5, 0.04) 100%
                    )
                  `;
                  overlayBoxShadow = 'none';
                } else if (isWhite) {
                  overlayBg = `
                    radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.75) 0%, rgba(254, 243, 199, 0.35) 28%, transparent 62%),
                    radial-gradient(circle at 95% 82%, ${brandAccent}25 0%, transparent 45%),
                    linear-gradient(130deg, transparent 52%, rgba(255, 255, 255, 0.45) 68%, rgba(255, 250, 235, 0.65) 73%, transparent 84%),
                    linear-gradient(to right, 
                      rgba(255, 255, 255, 0.98) 0%, 
                      rgba(255, 255, 255, 0.95) 28%, 
                      rgba(255, 255, 255, 0.76) 50%, 
                      rgba(255, 255, 255, 0.28) 72%, 
                      rgba(255, 255, 255, 0.05) 100%
                    )
                  `;
                  overlayBoxShadow = 'none';
                }

                return (
                  <div className={`rounded-3xl border-0 ring-0 shadow-2xl overflow-hidden relative transition-all duration-300 ${
                    isWhite 
                      ? 'bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)]' 
                      : 'bg-neutral-950 shadow-2xl'
                  }`}>
                    {/* Background Wallpaper Flyer Layer com animação cinematográfica contínua */}
                    {brandingEdits?.bannerUrl ? (
                      <div
                        className={`absolute inset-0 bg-cover bg-center animate-banner-kenburns ${
                          (isWhite || isDarkLights) ? 'contrast-[1.10] saturate-[1.15]' : ''
                        }`}
                        style={{ backgroundImage: `url(${brandingEdits.bannerUrl})` }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 transition-colors"
                        style={{ backgroundColor: isWhite ? '#ffffff' : (brandPrimary || '#0a0a0a') }}
                      />
                    )}

                    {/* EFEITOS ESPECIAIS DE LUZ CINEMATOGRÁFICA IDÊNTICOS À VITRINE */}
                    {/* 1. Feixe de Luz / Varredura Luminosa Periódica (Light Sweep) */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                      <div 
                        className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.15) 65%, transparent 100%)'
                        }}
                      />
                    </div>

                    {/* 2. Spotlight Pulsante de Iluminação de Estúdio no canto superior direito */}
                    <div 
                      className="pointer-events-none absolute -top-16 -right-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-2xl animate-banner-spotlight opacity-75 mix-blend-screen z-10"
                      style={{
                        background: `radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(254, 240, 138, 0.45) 30%, ${brandAccent}45 60%, transparent 80%)`
                      }}
                    />

                    {/* 3. Brilho Ambiente no canto inferior */}
                    <div 
                      className="pointer-events-none absolute -bottom-10 left-1/4 w-72 h-36 rounded-full blur-3xl opacity-35 mix-blend-screen z-10"
                      style={{
                        background: `radial-gradient(ellipse, ${brandAccent}70 0%, transparent 70%)`
                      }}
                    />

                    {/* Feixes de Luz Angulares se White ou DarkLights */}
                    {isWhite && (
                      <div 
                        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                        style={{
                          background: 'linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.8) 65%, transparent 80%)'
                        }}
                      />
                    )}
                    {isDarkLights && (
                      <div 
                        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                        style={{
                          background: 'linear-gradient(115deg, transparent 38%, rgba(255, 255, 255, 0.5) 65%, transparent 80%)'
                        }}
                      />
                    )}

                    {/* Camada de Gradiente Suave com Box Shadow - Versão Compacta Otimizada */}
                    <div 
                      className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5"
                      style={{
                        background: overlayBg,
                        boxShadow: overlayBoxShadow,
                      }}
                    >
                      <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                        {/* Notice Badge & Status Aberto/Fechado */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm shadow-xs inline-flex items-center gap-1.5 transition-colors"
                            style={{
                              backgroundColor: `${brandAccent}28`,
                              color: brandAccent,
                              borderColor: `${brandAccent}60`,
                            }}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {brandingEdits?.badgeNotice || currentTenant.branding.badgeNotice || 'Bebidas no ponto certo'}
                          </span>

                          <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                            currentTenant.isOpen
                              ? isWhite ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isWhite ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${currentTenant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {currentTenant.isOpen ? 'Aberto Agora' : 'Fechado no momento'}
                          </span>
                        </div>

                        {/* LOGO, NOME E SLOGAN */}
                        <div className="flex items-center gap-3 pt-0.5">
                          {brandingEdits?.logoUrl ? (
                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl p-1 border shrink-0 shadow-md ${
                              isWhite ? 'bg-white/95 border-slate-300 shadow-sm' : 'bg-black/60 border-white/20'
                            }`}>
                              <img
                                src={brandingEdits.logoUrl}
                                alt="Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div 
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shrink-0 border ${
                                isWhite ? 'bg-slate-900 text-white border-slate-700' : 'text-white border-white/20'
                              }`}
                              style={!isWhite ? { backgroundColor: brandAccent } : {}}
                            >
                              {currentTenant.name.charAt(0)}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h1 
                                className="text-base sm:text-xl font-black tracking-tight drop-shadow-sm flex items-center gap-1.5 leading-snug"
                                style={{ color: isWhite ? '#0f172a' : '#ffffff' }}
                              >
                                <span>{currentTenant.name}</span>
                                <Info className="w-3.5 h-3.5 opacity-80 shrink-0" style={{ color: brandAccent }} />
                              </h1>
                            </div>
                            <p 
                              className="text-[11px] sm:text-xs mt-0.5 font-medium drop-shadow-xs line-clamp-1"
                              style={{ color: isWhite ? '#334155' : '#e2e8f0' }}
                            >
                              {sloganEdit || currentTenant.slogan || getSegmentById(currentTenant.businessSegment).sloganExample}
                            </p>
                            <span 
                              className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full backdrop-blur-sm border shadow-xs"
                              style={{
                                backgroundColor: `${brandAccent}25`,
                                color: isWhite ? '#0f172a' : brandAccent,
                                borderColor: `${brandAccent}50`,
                              }}
                            >
                              <Clock className="w-2.5 h-2.5 shrink-0" style={{ color: brandAccent }} />
                              <span>Ver horários, endereço e cartões ℹ️</span>
                            </span>
                          </div>
                        </div>

                        {/* Informações de Endereço & Horários */}
                        <div 
                          className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] sm:text-[11px] pt-0.5 drop-shadow-xs"
                          style={{ color: isWhite ? '#475569' : '#cbd5e1' }}
                        >
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" style={{ color: brandAccent }} />
                            {currentTenant.address?.street || 'Avenida Principal'}, {currentTenant.address?.number || 'S/N'} · {currentTenant.address?.neighborhood || 'Centro'}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" style={{ color: brandAccent }} />
                            {currentTenant.address?.openingHours || 'Seg a Dom: 10h às 23h'}
                          </span>
                          {currentTenant.address?.freeDeliveryThreshold && (
                            <>
                              <span>·</span>
                              <span className="font-bold" style={{ color: brandAccent }}>
                                Frete Grátis &gt; R$ {currentTenant.address.freeDeliveryThreshold.toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Header Actions: SOMENTE OS ÍCONES (Modo Escuro, WhatsApp e Sacola) */}
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        {/* Ícone Modo Escuro com Efeito Animado Shimmer Nuvi */}
                        <div 
                          title="Modo Escuro / Claro"
                          className="nuvi-btn-cyber-blue p-2 sm:p-2.5 rounded-xl font-bold shadow-md border flex items-center justify-center cursor-default"
                        >
                          <Moon className="w-4 h-4 text-sky-200" />
                        </div>

                        {/* Ícone WhatsApp */}
                        <div 
                          title="Falar no WhatsApp"
                          className="p-2 sm:p-2.5 rounded-xl font-bold shadow-md bg-emerald-600 text-white opacity-95 flex items-center justify-center cursor-default"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </div>

                        {/* Ícone Sacola com Badge Flutuante */}
                        <div 
                          title="Sacola de Compras"
                          style={{
                            backgroundColor: isWhite ? '#ffffff' : 'rgba(0, 0, 0, 0.75)',
                            color: isWhite ? '#0f172a' : '#ffffff',
                            borderColor: isWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.25)',
                          }}
                          className="relative p-2 sm:p-2.5 rounded-xl font-bold shadow-md border flex items-center justify-center cursor-default"
                        >
                          <ShoppingCart className="w-4 h-4 shrink-0" style={{ color: brandAccent }} />
                          <span
                            className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black shadow-md flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: brandAccent,
                              color: '#09090b',
                            }}
                          >
                            0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-neutral-900 border-neutral-800 text-neutral-200'
            }`}>
              <Store className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
              <div>
                <span className="font-bold block">Plano Apenas Loja Física / Balcão (PDV) Ativo</span>
                <span className={isLight ? 'text-slate-600' : 'text-neutral-400'}>
                  O seu estabelecimento opera com foco presencial no caixa. Banners de vitrine pública ficam ocultos. As cores da sua marca são aplicadas no Frente de Caixa (PDV), botões de bipar e comprovantes.
                </span>
              </div>
            </div>
          )}

          {/* SEÇÃO 1: PAPEL DE PAREDE / FUNDO DA VITRINE DIVIDIDO POR CATEGORIAS */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  <Sparkles className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Papel de Parede & Flyer de Fundo da Vitrine</span>
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Escolha um flyer temático que combine com o seu negócio ou envie sua própria imagem.
                </p>
              </div>

              {/* Botão para desativar imagem e deixar apenas cores sólidas */}
              {brandingEdits?.bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBrandingEdits({ ...(brandingEdits || currentTenant.branding), bannerUrl: '' })}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 underline font-semibold self-start sm:self-auto cursor-pointer"
                >
                  Usar apenas cores sólidas (Sem imagem)
                </button>
              )}
            </div>

            {/* Barra de identificação do comércio e galeria exclusiva */}
            <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{currentSegmentConfig.emoji}</span>
                <span className={`font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  Imagens Prontas para {currentSegmentConfig.title} ({segmentWallpapers.length} opções exclusivas)
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Exclusivo do seu Ramo
              </span>
            </div>

            {/* Grid com exatamente as 6 imagens do ramo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {segmentWallpapers.map((wallpaper, idx) => {
                const isSelected = brandingEdits?.bannerUrl === wallpaper.url;
                return (
                  <button
                    key={wallpaper.id}
                    type="button"
                    onClick={() =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        bannerUrl: wallpaper.url,
                      })
                    }
                    className={`group relative rounded-xl border overflow-hidden text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'shadow-md scale-[1.01]'
                        : isLight
                        ? 'border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                    style={isSelected ? {
                      borderColor: activeAccent,
                      boxShadow: `0 0 0 2px ${activeAccent}44`,
                    } : {}}
                  >
                    {/* Miniatura da Imagem */}
                    <div className="relative h-28 w-full overflow-hidden bg-neutral-900">
                      <img
                        src={wallpaper.url}
                        alt={wallpaper.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Tag no topo */}
                      <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-xs">
                        {wallpaper.tag || `Opção ${idx + 1}`}
                      </span>

                      {/* Checkmark se selecionado */}
                      {isSelected && (
                        <div 
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md"
                          style={{
                            backgroundColor: activeAccent,
                            color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="p-3 space-y-1">
                      <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        {wallpaper.title}
                      </h4>
                      <p className={`text-[10px] leading-snug line-clamp-2 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {wallpaper.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Opção para Enviar Papel de Parede / Flyer Próprio */}
            <div className={`p-4 rounded-xl border border-dashed space-y-3 transition-colors ${
              isLight ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-950/70 border-neutral-700'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" style={{ color: activeAccent }} />
                  <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    Enviar Papel de Parede / Flyer Personalizado da sua Loja
                  </span>
                </div>
                <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  PNG, JPG, WebP até 8MB
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all shadow-2xs ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
                }`}>
                  <Upload className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Anexar Imagem do Computador / Celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={brandingEdits?.bannerUrl || ''}
                  onChange={(e) =>
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      bannerUrl: e.target.value,
                    })
                  }
                  placeholder="Ou cole a URL direta de uma imagem da internet"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: LOGOTIPO DA LOJA */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                  <ImageIcon className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Logotipo da Loja / Marca</span>
                </h3>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  Anexe o arquivo de imagem da logo do seu estabelecimento para aparecer na vitrine e nos comprovantes.
                </p>
              </div>

              {brandingEdits?.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs text-rose-500 hover:text-rose-600 underline font-semibold cursor-pointer"
                >
                  Remover Logo
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
              {/* Logo Preview Slot */}
              <div 
                className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-2 relative"
                style={{
                  backgroundColor: brandingEdits?.logoUrl ? (isLight ? '#f8fafc' : '#0a0a0a') : (brandingEdits?.primaryColor || '#881337'),
                  borderColor: isLight ? '#cbd5e1' : '#404040',
                }}
              >
                {brandingEdits?.logoUrl ? (
                  <img
                    src={brandingEdits.logoUrl}
                    alt="Logotipo do Estabelecimento"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center font-bold text-white">
                    <span className="text-3xl">{currentTenant.name.charAt(0)}</span>
                    <span className="text-[9px] font-normal opacity-80">Sem Logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-xs font-bold shadow-2xs ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-100 border-neutral-700'
                }`}>
                  <Upload className="w-4 h-4" style={{ color: activeAccent }} />
                  <span>Anexar Imagem da Logo (PNG, JPG, SVG, WebP)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={brandingEdits?.logoUrl || ''}
                  onChange={(e) =>
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      logoUrl: e.target.value,
                    })
                  }
                  placeholder="Ou cole a URL direta da imagem da logo"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: CORES DA VITRINE DO CARDÁPIO ONLINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Cores da Vitrine do Cardápio ({getSegmentById(currentTenant.businessSegment).emoji} {getSegmentById(currentTenant.businessSegment).shortLabel})</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Exclusivo Vitrine dos Clientes
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Estas cores são exibidas exclusivamente no catálogo/cardápio online público da sua loja. O sistema administrativo do lojista permanece padronizado no design profissional da plataforma (branco, cinza gelo, black carbon e azul).
              </p>
            </div>

            {/* ======================================================== */}
            {/* 1. SELETOR DE CORES NO CELULAR: Filtro Dropdown conforme Imagem 2 */}
            {/* ======================================================== */}
            <div className="sm:hidden space-y-2">
              {/* Botão Gatilho do Dropdown */}
              <button
                type="button"
                onClick={() => setIsColorFilterOpen(!isColorFilterOpen)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isColorFilterOpen
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                    : isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-[#0E1520] border-[#1C2631] text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: activeThemeSelected.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 -ml-1 shadow-xs"
                      style={{ backgroundColor: activeThemeSelected.accent }}
                    />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">
                      {activeThemeSelected.name}
                    </span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Toque para filtrar outra paleta de cores
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                    Ativa
                  </span>
                  <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${isColorFilterOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Painel do Filtro conforme Imagem 2 */}
              {isColorFilterOpen && (
                <div className={`p-3 rounded-2xl border-2 border-blue-500 shadow-2xl space-y-2.5 transition-all ${
                  isLight ? 'bg-white shadow-blue-500/10' : 'bg-[#0B131E] shadow-black/80'
                }`}>
                  {/* Input de Busca com borda azul e ícone de lupa */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={colorSearchQuery}
                      onChange={(e) => setColorSearchQuery(e.target.value)}
                      placeholder="Digite para buscar cor (ex: Ouro, Azul, Vinho)..."
                      className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium outline-none border-2 border-blue-500/80 focus:border-blue-500 transition-colors ${
                        isLight
                          ? 'bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                          : 'bg-[#080E17] text-white placeholder-slate-500'
                      }`}
                      autoFocus
                    />
                    {colorSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setColorSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Cabeçalho da Lista: Marcar exibidos (conforme imagem 2) */}
                  <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Marcar paleta exibida ({filteredSegmentThemes.length})</span>
                  </div>

                  {/* Lista vertical rolável com barra de scroll e checkboxes brancos */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {filteredSegmentThemes.map((theme) => {
                      const currentPrimary = brandingEdits?.primaryColor || currentTenant?.branding?.primaryColor || '#09090B';
                      const currentAccent = brandingEdits?.accentColor || currentTenant?.branding?.accentColor || '#F59E0B';
                      const isSelected = 
                        currentPrimary.toLowerCase() === theme.primary.toLowerCase() &&
                        currentAccent.toLowerCase() === theme.accent.toLowerCase();
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setBrandingEdits({
                              ...(brandingEdits || currentTenant.branding),
                              primaryColor: theme.primary,
                              accentColor: theme.accent,
                              themeStyle: theme.style,
                            });
                            setIsColorFilterOpen(false);
                            setColorSearchQuery('');
                          }}
                          className={`w-full p-2.5 rounded-lg flex items-center gap-3 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-blue-50 text-blue-900 font-bold'
                                : 'bg-blue-600/20 text-white font-bold'
                              : isLight
                              ? 'hover:bg-slate-100 text-slate-700'
                              : 'hover:bg-[#121B27] text-slate-300'
                          }`}
                        >
                          {/* Checkbox branco conforme Imagem 2 */}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white border-white text-slate-900'
                              : isLight
                              ? 'border-slate-300 bg-white'
                              : 'border-slate-600 bg-transparent'
                          }`}>
                            {isSelected && (
                              <Check className="w-3 h-3 text-slate-900 stroke-[3]" />
                            )}
                          </div>

                          {/* Bolinhas de cores */}
                          <div className="flex items-center shrink-0">
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 -ml-1 shadow-xs"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>

                          {/* Nome da cor e descrição */}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold block truncate">
                              {theme.name}
                            </span>
                            <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {theme.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {filteredSegmentThemes.length === 0 && (
                      <p className="text-center text-xs py-4 text-slate-500">
                        Nenhuma paleta encontrada para "{colorSearchQuery}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. SELETOR DE CORES NO COMPUTADOR: Grid como estava antes */}
            {/* ======================================================== */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-3">
              {getSegmentThemes(currentTenant.businessSegment).map((theme) => {
                const currentPrimary = brandingEdits?.primaryColor || currentTenant.branding.primaryColor || '#09090B';
                const currentAccent = brandingEdits?.accentColor || currentTenant.branding.accentColor || '#F59E0B';
                const isSelected = 
                  currentPrimary.toLowerCase() === theme.primary.toLowerCase() &&
                  currentAccent.toLowerCase() === theme.accent.toLowerCase();

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        primaryColor: theme.primary,
                        accentColor: theme.accent,
                        themeStyle: theme.style,
                      });
                    }}
                    className={`text-left p-3.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-gradient-to-r from-[#184C8A]/75 via-[#1E5CA6]/78 to-[#144278]/80 text-white shadow-md shadow-sky-900/15 backdrop-blur-md border-0 ring-0 outline-none'
                          : 'bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] text-white shadow-md shadow-[#0C2340]/40 border-0 ring-0 outline-none'
                        : isLight
                        ? 'border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
                        : 'border border-neutral-800 bg-neutral-900 hover:border-neutral-700 shadow-none'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 -ml-1 shadow-xs"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500 text-white shrink-0">
                          Ativa
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug ${isSelected ? 'text-white' : isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                      {theme.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Cor Primária da Marca (Cabeçalhos / Fundo)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandingEdits?.primaryColor || '#881337'}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        primaryColor: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandingEdits?.primaryColor || ''}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        primaryColor: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                        : 'bg-neutral-950 border-neutral-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Cor Secundária / Destaques (Botões, Preços & Badges)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandingEdits?.accentColor || '#D97706'}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        accentColor: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={brandingEdits?.accentColor || ''}
                    onChange={(e) =>
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        accentColor: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                      isLight
                        ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                        : 'bg-neutral-950 border-neutral-800 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Teste Visual em Tempo Real da Combinação */}
            <div 
              className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
              style={{
                borderColor: `${brandingEdits?.accentColor || '#D97706'}55`,
                backgroundColor: `${brandingEdits?.accentColor || '#D97706'}12`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-6 h-6 rounded-lg shadow-sm border flex items-center justify-center text-xs font-black"
                  style={{
                    backgroundColor: brandingEdits?.accentColor || '#F59E0B',
                    color: isLightColor(brandingEdits?.accentColor || '#F59E0B') ? '#09090b' : '#ffffff',
                    borderColor: `${brandingEdits?.accentColor || '#F59E0B'}88`,
                  }}
                >
                  ✓
                </div>
                <div>
                  <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Como sua Cor Secundária ({brandingEdits?.accentColor || '#D97706'}) aparece nos botões e preços:
                  </span>
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    Ela é aplicada na sacola, botões de adicionar produto, preços em destaque e badges de entrega.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span 
                  className="font-mono font-black text-sm tabular-nums"
                  style={{ color: brandingEdits?.accentColor || '#F59E0B' }}
                >
                  R$ 38,90
                </span>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                  style={{
                    backgroundColor: brandingEdits?.accentColor || '#F59E0B',
                    color: isLightColor(brandingEdits?.accentColor || '#F59E0B') ? '#09090b' : '#ffffff',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: TEXTOS E AVISOS DA VITRINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <Edit3 className="w-4 h-4" style={{ color: activeAccent }} />
              <span>Slogan & Avisos em Destaque na Vitrine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-semibold ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                    Slogan do Estabelecimento
                  </label>
                  <button
                    type="button"
                    onClick={() => setSloganEdit(getSegmentById(currentTenant.businessSegment).sloganExample)}
                    className="text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: activeAccent }}
                    title="Usar sugestão recomendada para seu segmento"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sugestão ({getSegmentById(currentTenant.businessSegment).shortLabel})</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={sloganEdit}
                  onChange={(e) => setSloganEdit(e.target.value)}
                  placeholder={getSegmentById(currentTenant.businessSegment).sloganExample}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-neutral-950 border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  Badge de Aviso no Banner (Flyer)
                </label>
                <input
                  type="text"
                  value={brandingEdits?.badgeNotice || ''}
                  onChange={(e) =>
                    setBrandingEdits({
                      ...(brandingEdits || currentTenant.branding),
                      badgeNotice: e.target.value,
                    })
                  }
                  placeholder="Ex: Entrega expressa em até 30 min!"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                      : 'bg-neutral-950 border-neutral-800 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Botão de Salvar no Rodapé */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveBranding}
              style={{
                backgroundColor: activeAccent,
                color: isLightColor(activeAccent) ? '#09090b' : '#ffffff',
              }}
              className="px-6 py-3 rounded-xl active:scale-95 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Visual, Cores & Vitrine</span>
            </button>
          </div>
        </div>
  );
};
