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
  Plus,
  UtensilsCrossed,
  Smartphone,
  Monitor,
  Heart,
  ArrowLeft,
  ChevronRight,
  Star
} from 'lucide-react';

interface StoreBrandingSettingsProps {
  isLight?: boolean;
}

export const StoreBrandingSettings: React.FC<StoreBrandingSettingsProps> = ({ isLight = false }) => {
  const { currentTenant, updateTenant, setViewRole, showAlert } = useStore();

  const [brandingEdits, setBrandingEdits] = useState(currentTenant?.branding);
  const [sloganEdit, setSloganEdit] = useState(currentTenant?.slogan || '');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

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

  const handleRemoveBanner = () => {
    if (brandingEdits && currentTenant) {
      const updatedBranding = { ...brandingEdits, bannerUrl: '' };
      setBrandingEdits(updatedBranding);
      updateTenant(currentTenant.id, { branding: updatedBranding });
      showAlert({
        title: 'Capa Removida',
        message: 'A vitrine usará o fundo com iluminação e degradê acetinado.',
        variant: 'info',
      });
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
          </div>

          {/* PRÉVIA EM TEMPO REAL DA VITRINE ONLINE */}
          {isOnlineEnabled ? (
            <div className={`rounded-2xl border overflow-hidden shadow-lg transition-colors ${
              isLight ? 'bg-white border-neutral-300' : 'bg-neutral-950 border-neutral-800'
            }`}>
              <div className={`p-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${brandingEdits?.bannerUrl ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                  <span className={`font-bold ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
                    Prévia em Tempo Real da Vitrine Online
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Seletor de Dispositivo: Celular vs Computador */}
                  <div className="flex items-center rounded-lg border overflow-hidden p-0.5 bg-black/10 dark:bg-black/30 border-slate-300 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>📱 Celular (Foto no Fundo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>💻 Computador</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewRole('storefront')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <span>Abrir Vitrine Real</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Banner Hero Preview - Luxury Glassmorphism com Borda Cinza Claro & Animação Flash */}
              {(() => {
                const brandAccent = brandingEdits?.accentColor || currentTenant.branding.accentColor || '#F59E0B';
                const brandPrimary = brandingEdits?.primaryColor || currentTenant.branding.primaryColor || '#881337';
                const bannerStyle = brandingEdits?.bannerStyle || currentTenant.branding?.bannerStyle || 'silver_flash';
                const bannerLayout = brandingEdits?.bannerLayout || currentTenant.branding?.bannerLayout || 'ifood_cover';
                const bannerImage = brandingEdits?.bannerUrl || (segmentWallpapers.length > 0 ? segmentWallpapers[0].url : '');

                let luxuryBg = '';
                if (bannerStyle === 'platinum_minimal') {
                  luxuryBg = isLight
                    ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
                    : 'linear-gradient(140deg, #090b0e 0%, #0e1217 50%, #06080a 100%)';
                } else if (bannerStyle === 'brand_aurora_flash') {
                  luxuryBg = isLight
                    ? `radial-gradient(ellipse 90% 80% at 85% 15%, ${brandAccent}18 0%, transparent 60%), radial-gradient(ellipse 70% 70% at 10% 90%, ${brandPrimary}12 0%, transparent 55%), linear-gradient(135deg, #ffffff 0%, #fbfbfc 50%, #f4f5f7 100%)`
                    : `radial-gradient(ellipse 90% 80% at 85% 15%, ${brandAccent}30 0%, transparent 65%), radial-gradient(ellipse 75% 70% at 10% 90%, ${brandPrimary}40 0%, transparent 60%), linear-gradient(140deg, #0d0f15 0%, #12151f 40%, #090a0f 100%)`;
                } else {
                  luxuryBg = isLight
                    ? `radial-gradient(ellipse 80% 70% at 80% 20%, ${brandAccent}12 0%, transparent 60%), linear-gradient(135deg, #ffffff 0%, #f9fafb 45%, #f1f5f9 100%)`
                    : `radial-gradient(ellipse 80% 70% at 80% 20%, ${brandAccent}22 0%, transparent 65%), linear-gradient(140deg, #0b0e14 0%, #111620 45%, #080a0f 100%)`;
                }

                // Borda Cinza Claro Fina e Elegante solicitada pelo usuário
                const luxuryBorder = isLight ? '#cbd5e1' : '#334155';

                const promoSlides = (brandingEdits?.promoBanners && brandingEdits.promoBanners.length > 0)
                  ? brandingEdits.promoBanners
                  : segmentWallpapers.length > 0
                  ? segmentWallpapers.slice(0, 3).map(w => w.url)
                  : [bannerImage].filter(Boolean);

                // =========================================================================
                // 1. MODO PRÉVIA CELULAR: DINÂMICO PARA OS 3 LAYOUTS
                // =========================================================================
                if (previewDevice === 'mobile') {
                  return (
                    <div className="p-4 sm:p-6 flex justify-center bg-slate-900/40">
                      <div
                        className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 relative ${
                          isLight ? 'bg-white text-slate-900' : 'bg-neutral-950 text-white'
                        }`}
                        style={{ borderColor: luxuryBorder }}
                      >
                        {/* OPÇÃO 1 CELULAR: CAPA PANORÂMICA IFOOD */}
                        {bannerLayout === 'ifood_cover' && (
                          <>
                            {/* Capa de Fundo no Celular */}
                            <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                              {bannerImage ? (
                                <img
                                  src={bannerImage}
                                  alt="Capa de Fundo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full" style={{ background: luxuryBg }} />
                              )}

                              {/* Vinheta Escura */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                              {/* Feixe Flash */}
                              <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                                <div
                                  className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                                  style={{
                                    background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 100%)`
                                  }}
                                />
                              </div>

                              {/* Botões Flutuantes sobre a Imagem no Topo */}
                              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
                                <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/20">
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/20">
                                    <Heart className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/20">
                                    <Search className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Sobreposto com Logo Quadradinha + Nome e Slogan na Frente */}
                            <div className={`px-4 pb-4 relative z-20 -mt-6 rounded-t-3xl pt-0 transition-colors ${
                              isLight ? 'bg-white' : 'bg-neutral-950'
                            }`}>
                              {/* Cabeçalho do Card: Logo + Nome & Slogan na frente */}
                              <div className="flex items-end justify-between gap-2.5 -mt-12 mb-2">
                                <div className="flex items-end gap-2.5 min-w-0 flex-1">
                                  {/* Logo Quadradinha */}
                                  <div
                                    className={`w-18 h-18 rounded-2xl shadow-2xl border-4 shrink-0 overflow-hidden flex items-center justify-center relative z-30 ${
                                      isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-900'
                                    }`}
                                    style={{
                                      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.35)'
                                    }}
                                  >
                                    {brandingEdits?.logoUrl ? (
                                      <img
                                        src={brandingEdits.logoUrl}
                                        alt="Logo da Loja"
                                        className="w-full h-full object-cover rounded-xl"
                                      />
                                    ) : (
                                      <div
                                        className="w-full h-full rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-inner"
                                        style={{ backgroundColor: brandPrimary }}
                                      >
                                        {currentTenant.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Nome e Slogan na frente da logo */}
                                  <div className="min-w-0 flex-1 pb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                                        style={{ backgroundColor: brandAccent }}
                                      >
                                        <Sparkles className="w-2.5 h-2.5" />
                                      </span>
                                      <h1 className="text-sm font-black truncate" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                                        {currentTenant.name}
                                      </h1>
                                    </div>
                                    <p className={`text-[10px] mt-0.5 font-medium line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {sloganEdit || currentTenant.slogan || 'Qualidade, sabor e tradição'}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-1 pb-1.5 shrink-0">
                                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                </div>
                              </div>

                              {/* Seletor de Mesa / Consumo no Salão */}
                              <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 my-1 text-[11px] ${
                                isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-sky-950/25 border-sky-500/30 text-sky-200'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <UtensilsCrossed className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                  <span className="font-bold">🍽️ Consumo no Salão / Mesas</span>
                                </div>
                                <span className="font-bold text-sky-500 text-[10px]">➔</span>
                              </div>

                              {/* Divisória 1 */}
                              <div className={`border-t my-1.5 ${isLight ? 'border-slate-100' : 'border-neutral-800'}`} />

                              {/* Raio e Mínimo configurados */}
                              <div className={`text-[11px] flex items-center gap-1.5 font-medium py-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                <span>Raio: até {currentTenant.address?.deliveryRadiusKm || 5} km</span>
                                <span>•</span>
                                <span>Mínimo: R$ {(currentTenant.address?.minimumOrder || currentTenant.config?.minimumOrderValue || 0).toFixed(2).replace('.', ',')}</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* OPÇÃO 2 CELULAR: CARD INTEGRADO 99FOOD */}
                        {bannerLayout === 'card_99food' && (
                          <div
                            className="p-4 space-y-3 relative overflow-hidden"
                            style={{ background: luxuryBg }}
                          >
                            {/* Imagem de Fundo Suave Acetinada */}
                            {bannerImage && (
                              <div
                                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                                style={{
                                  backgroundImage: `url("${bannerImage}")`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            )}

                            {/* Feixe Flash */}
                            <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                              <div
                                className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                                style={{
                                  background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 100%)`
                                }}
                              />
                            </div>

                            {/* Status e Selo */}
                            <div className="relative z-20 flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Aberto Agora
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/15">
                                Moderno 99Food
                              </span>
                            </div>

                            {/* Logo Integrada ao Lado do Nome */}
                            <div className="relative z-20 flex items-center gap-3">
                              <div
                                className={`w-14 h-14 rounded-2xl shadow-lg border-2 shrink-0 overflow-hidden flex items-center justify-center ${
                                  isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-800'
                                }`}
                              >
                                {brandingEdits?.logoUrl ? (
                                  <img
                                    src={brandingEdits.logoUrl}
                                    alt="Logo da Loja"
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full rounded-xl flex items-center justify-center font-black text-xl text-white"
                                    style={{ backgroundColor: brandPrimary }}
                                  >
                                    {currentTenant.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h1 className="text-base font-black truncate" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                                  {currentTenant.name}
                                </h1>
                                <p className={`text-xs font-medium line-clamp-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {sloganEdit || currentTenant.slogan || 'Qualidade, sabor e tradição'}
                                </p>
                              </div>
                            </div>

                            {/* Botão de Mesa Compacto */}
                            <div className={`relative z-20 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                              isLight ? 'bg-white/80 border-slate-200 text-slate-900' : 'bg-black/40 border-neutral-800 text-white'
                            }`}>
                              <span className="font-bold flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3.5 h-3.5 text-sky-400" />
                                Consumo no Salão / Mesas
                              </span>
                              <span className="text-sky-400 font-bold text-[10px]">Toque p/ pedir</span>
                            </div>
                          </div>
                        )}

                        {/* OPÇÃO 3 CELULAR: CARROSSEL PROMOCIONAL */}
                        {bannerLayout === 'carousel_promos' && (
                          <div className="space-y-2 pb-3">
                            {/* Carrossel de Slides Rotativos */}
                            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                              {promoSlides.length > 0 && (
                                <img
                                  src={promoSlides[0]}
                                  alt="Slide Promocional"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                              {/* Indicadores de Slides */}
                              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                                <div className="w-5 h-1.5 rounded-full bg-white" />
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                              </div>

                              <span className="absolute top-2.5 right-2.5 z-20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold shadow-md">
                                Oferta em Destaque
                              </span>
                            </div>

                            {/* Card da Loja Compacto */}
                            <div className="px-4 pt-1 space-y-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-12 h-12 rounded-xl shadow-md border-2 shrink-0 overflow-hidden flex items-center justify-center ${
                                    isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-800'
                                  }`}
                                >
                                  {brandingEdits?.logoUrl ? (
                                    <img
                                      src={brandingEdits.logoUrl}
                                      alt="Logo da Loja"
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div
                                      className="w-full h-full rounded-lg flex items-center justify-center font-black text-lg text-white"
                                      style={{ backgroundColor: brandPrimary }}
                                    >
                                      {currentTenant.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h1 className="text-sm font-black truncate" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                                    {currentTenant.name}
                                  </h1>
                                  <p className={`text-[11px] font-medium line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {sloganEdit || currentTenant.slogan || 'Qualidade, sabor e tradição'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // =========================================================================
                // 2. MODO PRÉVIA COMPUTADOR: DINÂMICO PARA OS 3 LAYOUTS
                // =========================================================================
                if (bannerLayout === 'ifood_cover') {
                  return (
                    <div
                      className={`rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 relative backdrop-blur-xl ${
                        isLight ? 'bg-white text-slate-900 shadow-slate-200/50' : 'bg-neutral-950 text-white shadow-black/60'
                      }`}
                      style={{ borderColor: luxuryBorder }}
                    >
                      {/* Capa Panorâmica Superior no Computador */}
                      <div className="relative h-52 md:h-60 w-full overflow-hidden bg-slate-900">
                        {bannerImage ? (
                          <img
                            src={bannerImage}
                            alt="Capa da Loja"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full" style={{ background: luxuryBg }} />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

                        {/* Feixe Flash */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                          <div
                            className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                            style={{
                              background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 100%)`
                            }}
                          />
                        </div>

                        {/* Botões Superiores */}
                        <div className="absolute top-4 inset-x-6 z-20 flex items-center justify-between">
                          <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20">
                            <ArrowLeft className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20">
                              <Heart className="w-4 h-4" />
                            </div>
                            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20">
                              <Search className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500 text-white font-bold shadow-md">
                              ● Aberto Agora
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Sobreposto com Logo Quadradinha + Nome e Slogan na Frente no Computador */}
                      <div className={`px-6 pb-6 relative z-20 -mt-8 rounded-t-3xl pt-0 transition-colors ${
                        isLight ? 'bg-white' : 'bg-neutral-950'
                      }`}>
                        {/* Cabeçalho do Card: Logo + Nome & Slogan na frente */}
                        <div className="flex items-end justify-between gap-4 -mt-16 mb-3">
                          <div className="flex items-end gap-4 min-w-0 flex-1">
                            <div
                              className={`w-24 h-24 rounded-2xl shadow-2xl border-4 shrink-0 overflow-hidden flex items-center justify-center relative z-30 ${
                                isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-900'
                              }`}
                              style={{
                                boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.35)'
                              }}
                            >
                              {brandingEdits?.logoUrl ? (
                                <img
                                  src={brandingEdits.logoUrl}
                                  alt="Logo da Loja"
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <div
                                  className="w-full h-full rounded-xl flex items-center justify-center font-black text-3xl text-white shadow-inner"
                                  style={{ backgroundColor: brandPrimary }}
                                >
                                  {currentTenant.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Nome e Slogan na frente da logo */}
                            <div className="min-w-0 flex-1 pb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                                  style={{ backgroundColor: brandAccent }}
                                >
                                  <Sparkles className="w-3 h-3" />
                                </span>
                                <h1 className="text-xl font-black" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                                  {currentTenant.name}
                                </h1>
                              </div>
                              <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {sloganEdit || currentTenant.slogan || 'Qualidade, sabor e tradição'}
                              </p>
                            </div>
                          </div>

                          <div className="p-1 pb-2 shrink-0">
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>

                        {/* Barra de Mesa e Entrega */}
                        <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between text-xs ${
                          isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-sky-950/25 border-sky-500/30 text-sky-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-sky-500" />
                            <span className="font-extrabold">🍽️ Consumo no Salão / Mesas — Toque aqui para selecionar sua Mesa</span>
                          </div>
                          <span className="font-bold text-sky-500">Selecionar Mesa ➔</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (bannerLayout === 'carousel_promos') {
                  return (
                    <div className="space-y-4">
                      {/* Carrossel Promocional Widescreen */}
                      <div
                        className="relative h-52 md:h-60 rounded-3xl overflow-hidden border shadow-xl bg-slate-900"
                        style={{ borderColor: luxuryBorder }}
                      >
                        {promoSlides.length > 0 && (
                          <img
                            src={promoSlides[0]}
                            alt="Promoção Carrossel"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                          <div
                            className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                            style={{
                              background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 100%)`
                            }}
                          />
                        </div>

                        {/* Indicadores Bolinhas */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                          <div className="w-6 h-1.5 rounded-full bg-white" />
                          <div className="w-2 h-1.5 rounded-full bg-white/50" />
                          <div className="w-2 h-1.5 rounded-full bg-white/50" />
                        </div>
                      </div>

                      {/* Card da Loja Integrado */}
                      <div
                        className={`p-5 rounded-3xl border shadow-xl flex items-center justify-between gap-4 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-neutral-950 border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-14 h-14 rounded-2xl shadow-lg border-2 shrink-0 overflow-hidden flex items-center justify-center ${
                              isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-800'
                            }`}
                          >
                            {brandingEdits?.logoUrl ? (
                              <img
                                src={brandingEdits.logoUrl}
                                alt="Logo da Loja"
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div
                                className="w-full h-full rounded-xl flex items-center justify-center font-black text-xl text-white"
                                style={{ backgroundColor: brandPrimary }}
                              >
                                {currentTenant.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h1 className="text-lg font-black" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                              {currentTenant.name}
                            </h1>
                            <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {sloganEdit || currentTenant.slogan || 'Qualidade, sabor e tradição'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ● Aberto Agora
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // OPÇÃO 2 PADRÃO COMPUTADOR: CARD INTEGRADO 99FOOD
                return (
                  <div
                    className={`rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 p-4 sm:p-6 backdrop-blur-xl ${
                      isLight ? 'bg-white/95 text-slate-900 shadow-slate-200/50' : 'bg-neutral-950/90 text-white shadow-black/60'
                    }`}
                    style={{
                      background: luxuryBg,
                      borderColor: luxuryBorder,
                    }}
                  >
                    {/* 1. Iluminação Ambiente Suave de Fundo */}
                    {bannerStyle !== 'platinum_minimal' && (
                      <>
                        <div 
                          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-35 mix-blend-screen"
                          style={{
                            background: `radial-gradient(circle, ${brandAccent}55 0%, transparent 70%)`
                          }}
                        />
                        <div 
                          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 mix-blend-screen"
                          style={{
                            background: `radial-gradient(circle, ${brandPrimary}60 0%, transparent 70%)`
                          }}
                        />
                      </>
                    )}

                    {/* 2. Feixe de Luz Flash Metálico de Alto Impacto */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                      <div 
                        className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 100%)`
                        }}
                      />
                    </div>

                    {/* 3. Linha Acetinada Prateada com Reflexo Flash no Topo */}
                    <div 
                      className="absolute top-0 inset-x-0 h-[1.5px] pointer-events-none opacity-60"
                      style={{
                        background: isLight
                          ? 'linear-gradient(90deg, transparent 0%, #94a3b8 20%, #ffffff 50%, #94a3b8 80%, transparent 100%)'
                          : 'linear-gradient(90deg, transparent 0%, #475569 20%, #e2e8f0 50%, #475569 80%, transparent 100%)'
                      }}
                    />

                    {/* Conteúdo da Prévia Computador */}
                    <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                              isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Aberto Agora
                          </span>

                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: `${brandAccent}15`,
                              color: brandAccent,
                              borderColor: `${brandAccent}35`,
                            }}
                          >
                            ★ {currentTenant.businessSegment === 'pizzaria' ? 'Pizzaria & Forno' : currentTenant.businessSegment === 'adega' ? 'Adega & Bebidas' : 'Seleção Especial'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 pt-0.5">
                          {brandingEdits?.logoUrl ? (
                            <div 
                              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-lg border-2 shrink-0 overflow-hidden flex items-center justify-center ${
                                isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-800'
                              }`}
                            >
                              <img
                                src={brandingEdits.logoUrl}
                                alt="Logo Preview"
                                className="w-full h-full object-cover rounded-xl"
                              />
                            </div>
                          ) : (
                            <div 
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0 text-white"
                              style={{ 
                                backgroundColor: brandPrimary,
                                boxShadow: `0 6px 14px -3px ${brandPrimary}50`
                              }}
                            >
                              {currentTenant.name.charAt(0)}
                            </div>
                          )}

                          <div>
                            <h1 
                              className="text-base sm:text-xl font-black tracking-tight flex items-center gap-1.5 leading-snug"
                              style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                            >
                              <span>{currentTenant.name}</span>
                              <Info className="w-3.5 h-3.5 opacity-80 shrink-0" style={{ color: brandAccent }} />
                            </h1>
                            <p 
                              className="text-[11px] sm:text-xs mt-0.5 font-medium line-clamp-1"
                              style={{ color: isLight ? '#475569' : '#d4d4d8' }}
                            >
                              {sloganEdit || currentTenant.slogan || 'Qualidade, sabor e tradição'}
                            </p>
                            <span 
                              className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full border shadow-2xs"
                              style={{
                                backgroundColor: `${brandAccent}15`,
                                color: isLight ? '#0f172a' : brandAccent,
                                borderColor: `${brandAccent}40`,
                              }}
                            >
                              <Clock className="w-2.5 h-2.5 shrink-0" style={{ color: brandAccent }} />
                              <span>Ver horários, endereço e cartões ℹ️</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                            style={{ backgroundColor: brandPrimary }}
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider block opacity-75" style={{ color: isLight ? '#475569' : '#a1a1aa' }}>
                              No Salão
                            </span>
                            <span className="text-xs font-black" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                              Mesa 01
                            </span>
                          </div>
                        </div>

                        <div 
                          className="px-2.5 py-1 rounded-xl text-[11px] font-black text-white shadow-xs flex items-center gap-1 shrink-0"
                          style={{ backgroundColor: brandPrimary }}
                        >
                          <span>🧾 R$ 149,70</span>
                        </div>

                        <div 
                          className="p-2 rounded-xl border text-white shadow-sm shrink-0"
                          style={{
                            backgroundColor: isLight ? '#ffffff' : 'rgba(15, 15, 18, 0.85)',
                            borderColor: `${brandAccent}45`,
                            color: brandAccent
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
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

          {/* SEÇÃO 1: LOGOTIPO DA LOJA */}
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

          {/* SEÇÃO 2: 3 OPÇÕES DE LAYOUT DO BANNER (ESTILO IFOOD / 99FOOD) */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Store className="w-4 h-4 text-sky-500" />
                  <span>3 Opções de Layout do Banner (Estilo iFood / 99Food)</span>
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ✓ Escolha o formato desejado
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Escolha como a vitrine e a foto da sua loja serão exibidas para seus clientes no celular e no computador.
              </p>
            </div>

            {/* Grid dos 3 Modelos de Layout Solicitados pelo Usuário */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: 'ifood_cover',
                  name: 'Capa Panorâmica iFood',
                  badge: 'Idêntico ao iFood',
                  desc: 'Foto panorâmica no topo, logo circular centralizada sobreposta e detalhes de entrega/avaliação idênticos à foto do app.',
                  icon: '🍕',
                  highlight: true
                },
                {
                  id: 'card_99food',
                  name: 'Card Integrado 99Food',
                  badge: 'Moderno 99Food',
                  desc: 'Card compacto e moderno com visual acetinado, foto integrada e visualização ágil das informações da loja.',
                  icon: '⚡',
                  highlight: false
                },
                {
                  id: 'carousel_promos',
                  name: 'Carrossel Promocional',
                  badge: 'Ofertas em Slides',
                  desc: 'Banners promocionais rotativos em carrossel no topo, ideal para destacar ofertas, combos e novidades.',
                  icon: '📢',
                  highlight: false
                }
              ].map((layout) => {
                const currentLayout = brandingEdits?.bannerLayout || currentTenant.branding?.bannerLayout || 'ifood_cover';
                const isSelected = currentLayout === layout.id;

                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...(brandingEdits || currentTenant.branding),
                        bannerLayout: layout.id as any
                      };
                      setBrandingEdits(updated);
                      updateTenant(currentTenant.id, { branding: updated });
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative overflow-hidden ${
                      isSelected
                        ? isLight
                          ? 'border-sky-500 bg-sky-50/70 text-slate-900 shadow-sm ring-1 ring-sky-500/30'
                          : 'border-sky-500 bg-sky-950/40 text-white shadow-sm ring-1 ring-sky-500/30'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{layout.icon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : isLight ? 'bg-slate-200 text-slate-700' : 'bg-neutral-800 text-slate-400'
                        }`}>
                          {layout.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-black">{layout.name}</h4>
                      <p className={`text-[11px] leading-relaxed mt-1 ${
                        isSelected ? (isLight ? 'text-slate-800' : 'text-slate-200') : (isLight ? 'text-slate-500' : 'text-neutral-400')
                      }`}>
                        {layout.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-neutral-800/80">
                      <span className="text-[10px] font-bold text-slate-400">
                        {isSelected ? '✓ Selecionado' : 'Toque para ativar'}
                      </span>
                      <span className={`text-[10px] font-black ${isSelected ? 'text-sky-500' : 'text-slate-400'}`}>
                        {isSelected ? 'Ativo na Vitrine' : 'Usar'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 3: FOTO DE FUNDO / CAPA DA VITRINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  <span>Foto de Fundo / Capa da Vitrine ({currentSegmentConfig.emoji} {currentSegmentConfig.shortLabel})</span>
                </h3>
                {brandingEdits?.bannerUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Capa</span>
                  </button>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Envie sua própria foto de capa, cole uma URL ou selecione abaixo uma das fotos profissionais em alta resolução preparadas para o seu ramo ({currentSegmentConfig.shortLabel}).
              </p>
            </div>

            {/* Upload e Controles da Capa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-xs font-bold shadow-2xs ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-100 border-neutral-700'
              }`}>
                <Upload className="w-4 h-4 text-sky-500" />
                <span>Anexar Foto de Capa (PNG, JPG, WebP)</span>
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
                onChange={(e) => {
                  const updated = {
                    ...(brandingEdits || currentTenant.branding),
                    bannerUrl: e.target.value
                  };
                  setBrandingEdits(updated);
                  updateTenant(currentTenant.id, { branding: updated });
                }}
                placeholder="Ou cole a URL direta de uma foto de capa"
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-mono border focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-200 placeholder:text-neutral-500 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Galeria de Fotos Prontas em Alta Resolução do Segmento */}
            {segmentWallpapers.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Fotos em Alta Resolução Prontas para {currentSegmentConfig.title} (Toque para usar):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {segmentWallpapers.map((wp) => {
                    const isSelected = brandingEdits?.bannerUrl === wp.url;
                    return (
                      <div
                        key={wp.id}
                        onClick={() => {
                          const updated = {
                            ...(brandingEdits || currentTenant.branding),
                            bannerUrl: wp.url
                          };
                          setBrandingEdits(updated);
                          updateTenant(currentTenant.id, { branding: updated });
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                          isSelected
                            ? 'border-sky-500 ring-2 ring-sky-500/30'
                            : 'border-slate-200 dark:border-neutral-800 hover:border-sky-400'
                        }`}
                      >
                        <div className="h-24 w-full overflow-hidden bg-slate-900">
                          <img
                            src={wp.url}
                            alt={wp.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 pointer-events-none">
                          <span className="text-[10px] font-bold text-white truncate drop-shadow-sm">
                            {wp.title}
                          </span>
                          <span className="text-[8.5px] text-sky-300 font-semibold truncate">
                            {wp.tag}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 4: ESTILOS DE BANNER HERO (BORDA CINZA CLARO & ANIMAÇÃO FLASH) */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>Estilos de Banner da Vitrine (Borda Cinza Claro & Efeito Flash)</span>
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  ⚡ Feixe de Luz Reluzente em Tempo Real
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Selecione o modelo de acabamento do cabeçalho da sua vitrine. Todos possuem borda cinza claro fina e animação com flash de luz metálico contínuo.
              </p>
            </div>

            {/* Grid dos 3 Modelos de Banner com Borda Cinza Claro e Flash */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: 'silver_flash',
                  name: 'Flash Silver Luxury',
                  badge: 'Mais Recomendado',
                  desc: 'Borda cinza claro nítida, fundo dark obsidian acetinado e feixe flash prateado cruzando o banner.',
                  icon: '✨',
                },
                {
                  id: 'brand_aurora_flash',
                  name: 'Brand Aurora Flash',
                  badge: 'Cores da Marca',
                  desc: 'Borda cinza claro com aura suave das cores do seu comércio e flash metálico reluzente.',
                  icon: '🌟',
                },
                {
                  id: 'platinum_minimal',
                  name: 'Platinum Minimal',
                  badge: 'Ultra Clean',
                  desc: 'Fundo preto carbono puro ou branco clean, borda cinza claro e flash sutil estilo Apple.',
                  icon: '💎',
                },
              ].map((style) => {
                const currentBannerStyle = brandingEdits?.bannerStyle || currentTenant.branding?.bannerStyle || 'silver_flash';
                const isSelected = currentBannerStyle === style.id;

                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setBrandingEdits({
                        ...(brandingEdits || currentTenant.branding),
                        bannerStyle: style.id as any,
                      });
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative overflow-hidden ${
                      isSelected
                        ? isLight
                          ? 'border-sky-500 bg-sky-50/70 text-slate-900 shadow-sm ring-1 ring-sky-500/30'
                          : 'border-sky-500 bg-sky-950/40 text-white shadow-sm ring-1 ring-sky-500/30'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{style.icon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : isLight ? 'bg-slate-200 text-slate-700' : 'bg-neutral-800 text-slate-400'
                        }`}>
                          {style.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-black">{style.name}</h4>
                      <p className={`text-[11px] leading-relaxed mt-1 ${
                        isSelected ? (isLight ? 'text-slate-800' : 'text-slate-200') : (isLight ? 'text-slate-500' : 'text-neutral-400')
                      }`}>
                        {style.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-neutral-800/80">
                      <span className="text-[10px] font-bold text-slate-400">
                        Borda: Cinza Claro
                      </span>
                      <span className={`text-[10px] font-black ${isSelected ? 'text-sky-500' : 'text-slate-400'}`}>
                        {isSelected ? '✓ Ativo no Banner' : 'Selecionar'}
                      </span>
                    </div>
                  </button>
                );
              })}
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
