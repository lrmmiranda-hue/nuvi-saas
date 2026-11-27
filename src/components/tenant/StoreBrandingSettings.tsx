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
  Star,
  Zap,
  ShoppingBag
} from 'lucide-react';

interface StoreBrandingSettingsProps {
  isLight?: boolean;
}

export const StoreBrandingSettings: React.FC<StoreBrandingSettingsProps> = ({ isLight = false }) => {
  const { currentTenant, updateTenant, setViewRole, showAlert, isFeatureAllowed, mediaLibrary } = useStore();

  const [brandingEdits, setBrandingEdits] = useState(currentTenant?.branding);
  const [sloganEdit, setSloganEdit] = useState(currentTenant?.slogan || '');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Modalidades ativas para a prévia fiel
  const isDeliveryAvailable = useMemo(() => {
    if (!currentTenant) return true;
    const directSetting = (currentTenant as any).deliveryEnabled ?? (currentTenant.config as any)?.deliveryEnabled ?? (currentTenant.config as any)?.enableDelivery;
    if (directSetting !== undefined && directSetting !== null) return Boolean(directSetting);
    return isFeatureAllowed('storefrontDeliveryEnabled');
  }, [currentTenant, isFeatureAllowed]);

  const isPickupAllowed = useMemo(() => {
    if (!currentTenant) return true;
    const directSetting = (currentTenant as any).pickupEnabled ?? (currentTenant.config as any)?.pickupEnabled ?? (currentTenant.config as any)?.enablePickup;
    if (directSetting !== undefined && directSetting !== null) return Boolean(directSetting);
    return isFeatureAllowed('storefrontPickupEnabled');
  }, [currentTenant, isFeatureAllowed]);

  const isTableServiceAvailable = useMemo(() => {
    if (!currentTenant) return true;
    const directSetting = (currentTenant as any).enableDiningTables ?? (currentTenant.config as any)?.enableDiningTables ?? (currentTenant.config as any)?.tablesEnabled;
    if (directSetting !== undefined && directSetting !== null) return Boolean(directSetting);
    return isFeatureAllowed('storefrontTablesEnabled');
  }, [currentTenant, isFeatureAllowed]);

  const [previewServiceType, setPreviewServiceType] = useState<'delivery' | 'pickup' | 'dine_in'>('delivery');

  useEffect(() => {
    if (previewServiceType === 'delivery' && !isDeliveryAvailable) {
      if (isPickupAllowed) setPreviewServiceType('pickup');
      else if (isTableServiceAvailable) setPreviewServiceType('dine_in');
    } else if (previewServiceType === 'dine_in' && !isTableServiceAvailable) {
      if (isDeliveryAvailable) setPreviewServiceType('delivery');
      else if (isPickupAllowed) setPreviewServiceType('pickup');
    }
  }, [isDeliveryAvailable, isPickupAllowed, isTableServiceAvailable, previewServiceType]);

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
    return getSegmentWallpapers(currentTenant?.businessSegment, mediaLibrary);
  }, [currentTenant?.businessSegment, mediaLibrary]);

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

              {/* Banner Hero Preview - Acabamento Clean e Profissional */}
              {(() => {
                const brandAccent = brandingEdits?.accentColor || currentTenant.branding.accentColor || '#F59E0B';
                const brandPrimary = brandingEdits?.primaryColor || currentTenant.branding.primaryColor || '#881337';
                const rawBannerLayout = brandingEdits?.bannerLayout || currentTenant.branding?.bannerLayout || 'ifood_cover';
                const bannerLayout: 'ifood_cover' | 'carousel_promos' = rawBannerLayout === 'card_99food' ? 'ifood_cover' : (rawBannerLayout as any);
                const bannerImage = brandingEdits?.bannerUrl || (segmentWallpapers.length > 0 ? segmentWallpapers[0].url : '');

                const promoSlides = (brandingEdits?.promoBanners && brandingEdits.promoBanners.length > 0)
                  ? brandingEdits.promoBanners
                  : segmentWallpapers.length > 0
                  ? segmentWallpapers.slice(0, 3).map(w => w.url)
                  : [bannerImage].filter(Boolean);

                const deliveryRadius = currentTenant.address?.deliveryRadiusKm || (currentTenant.config as any)?.deliveryRadiusKm || 5;
                const minimumOrder = currentTenant.address?.minimumOrder || currentTenant.config?.minimumOrderValue || 0;
                const deliveryFee = currentTenant.address?.standardDeliveryFee || (currentTenant.config as any)?.deliveryFee || 0;
                const estimatedTime = (currentTenant as any).deliveryEstimatedTime || (currentTenant.address as any)?.deliveryEstimatedTime || currentTenant.config?.estimatedDeliveryTime || '25 - 40';

                // =========================================================================
                // 1. MODO PRÉVIA CELULAR: DINÂMICO PARA OS 2 LAYOUTS
                // =========================================================================
                if (previewDevice === 'mobile') {
                  return (
                    <div className="p-4 sm:p-6 flex justify-center bg-slate-900/40">
                      <div
                        className={`w-full max-w-sm rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 relative ${
                          isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-neutral-950 text-white border-neutral-800'
                        }`}
                      >
                        {/* Capa de Fundo no Celular (Estática ou Carrossel de Slides conforme o layout) */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                          {bannerLayout === 'carousel_promos' && promoSlides.length > 0 ? (
                            <>
                              <img
                                src={promoSlides[0]}
                                alt="Slide Promocional"
                                className="w-full h-full object-cover"
                              />
                              {/* Indicadores Bolinhas do Carrossel */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                                <div className="w-5 h-1.5 rounded-full bg-white shadow-xs" />
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                              </div>
                              <span className="absolute top-3 right-12 z-20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold shadow-md">
                                Ofertas em Slides
                              </span>
                            </>
                          ) : bannerImage ? (
                            <img
                              src={bannerImage}
                              alt="Capa de Fundo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900" />
                          )}

                          {/* Vinheta Escura */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

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

                          {/* Cabeçalho do Card: Logo com metade em cima da imagem + Nome & Slogan na frente */}
                          <div className="flex items-end justify-between gap-2.5 mb-2">
                            <div className="flex items-end gap-2.5 min-w-0 flex-1">
                              {/* Logo Quadradinha: metade em cima da foto e metade no card */}
                              <div
                                className={`w-20 h-20 rounded-2xl shadow-2xl border-4 shrink-0 overflow-hidden flex items-center justify-center relative z-30 -mt-10 ${
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
                              <div className="min-w-0 flex-1 pb-1 pt-2">
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

                          {/* SELETOR INTERATIVO DE MODALIDADES NA PRÉVIA (CENTRALIZADO) */}
                          {(isDeliveryAvailable || isPickupAllowed || isTableServiceAvailable) && (
                            <div className="flex justify-center w-full my-2">
                              <div className="inline-flex items-center gap-1 p-1 rounded-2xl border bg-slate-100/90 dark:bg-neutral-900/90 border-slate-200 dark:border-neutral-800 shadow-2xs">
                                {isDeliveryAvailable && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewServiceType('delivery')}
                                    style={previewServiceType === 'delivery' ? {
                                      background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                      boxShadow: `0 2px 10px ${brandPrimary}45`,
                                      color: '#ffffff',
                                    } : {}}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                      previewServiceType === 'delivery'
                                        ? 'text-white'
                                        : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                    }`}
                                  >
                                    <span>🛵 Entrega</span>
                                  </button>
                                )}
                                {isPickupAllowed && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewServiceType('pickup')}
                                    style={previewServiceType === 'pickup' ? {
                                      background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                      boxShadow: `0 2px 10px ${brandPrimary}45`,
                                      color: '#ffffff',
                                    } : {}}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                      previewServiceType === 'pickup'
                                        ? 'text-white'
                                        : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                    }`}
                                  >
                                    <span>🛍️ Retirada</span>
                                  </button>
                                )}
                                {isTableServiceAvailable && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewServiceType('dine_in')}
                                    style={previewServiceType === 'dine_in' ? {
                                      background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                      boxShadow: `0 2px 10px ${brandPrimary}45`,
                                      color: '#ffffff',
                                    } : {}}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                      previewServiceType === 'dine_in'
                                        ? 'text-white'
                                        : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                    }`}
                                  >
                                    <span>🍽️ Mesa / Salão</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* INFORMAÇÕES DINÂMICAS CONFORME A MODALIDADE */}
                          {previewServiceType === 'dine_in' && isTableServiceAvailable ? (
                            <div className={`p-2 rounded-xl border flex items-center justify-between text-[11px] my-1 ${
                              isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-sky-950/25 border-sky-500/30 text-sky-200'
                            }`}>
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span className="font-bold">🍽️ Consumo no Salão / Mesas</span>
                              </div>
                              <span className="text-sky-500 font-bold text-[10px]">Toque p/ selecionar ➔</span>
                            </div>
                          ) : previewServiceType === 'pickup' && isPickupAllowed ? (
                            <div className={`text-[11px] flex items-center justify-center gap-1.5 flex-wrap font-medium py-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">🛍️ Retire no Balcão</span>
                              <span>•</span>
                              <span>Pronto em ~15-25 min</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sem taxa de entrega</span>
                            </div>
                          ) : isDeliveryAvailable ? (
                            <div className={`text-[11px] flex items-center justify-center gap-1.5 flex-wrap font-medium py-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">🕒 {estimatedTime} min</span>
                              <span>•</span>
                              <span className="font-bold text-sky-600 dark:text-sky-400">📍 Raio: até {deliveryRadius} km</span>
                              <span>•</span>
                              <span>Mínimo: R$ {minimumOrder.toFixed(2).replace('.', ',')}</span>
                              <span>•</span>
                              <span>{deliveryFee > 0 ? `Frete: R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Frete Grátis'}</span>
                            </div>
                          ) : (
                            <div className={`text-[11px] flex items-center justify-center gap-1.5 font-medium py-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              <Store className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span>Atendimento presencial no estabelecimento físico • Pronta Entrega</span>
                            </div>
                          )}
                        </div>
                      </div>


                    </div>
                  );
                }

                // =========================================================================
                // 2. MODO PRÉVIA COMPUTADOR: DINÂMICO PARA OS 2 LAYOUTS
                // =========================================================================
                return (
                  <div
                    className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 relative backdrop-blur-xl ${
                      isLight ? 'bg-white text-slate-900 border-slate-200 shadow-slate-200/50' : 'bg-neutral-950 text-white border-neutral-800 shadow-black/60'
                    }`}
                  >
                    {/* Capa Panorâmica Superior no Computador (Estática ou Slides) */}
                    <div className="relative h-52 md:h-60 w-full overflow-hidden bg-slate-900">
                      {bannerLayout === 'carousel_promos' && promoSlides.length > 0 ? (
                        <>
                          <img
                            src={promoSlides[0]}
                            alt="Slide Promocional"
                            className="w-full h-full object-cover"
                          />
                          {/* Indicadores Bolinhas do Carrossel */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                            <div className="w-6 h-1.5 rounded-full bg-white shadow-md" />
                            <div className="w-2 h-1.5 rounded-full bg-white/50" />
                            <div className="w-2 h-1.5 rounded-full bg-white/50" />
                          </div>
                          <span className="absolute top-4 right-20 z-20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold shadow-md">
                            📢 Ofertas em Slides
                          </span>
                        </>
                      ) : bannerImage ? (
                        <img
                          src={bannerImage}
                          alt="Capa da Loja"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

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
                      <div className="flex items-end justify-between gap-4 mb-3">
                        <div className="flex items-end gap-4 min-w-0 flex-1">
                          <div
                            className={`w-24 h-24 rounded-2xl shadow-2xl border-4 shrink-0 overflow-hidden flex items-center justify-center relative z-30 -mt-12 ${
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

                      {/* SELETOR INTERATIVO DE MODALIDADES NO COMPUTADOR (ALINHADO À ESQUERDA) */}
                      {(isDeliveryAvailable || isPickupAllowed || isTableServiceAvailable) && (
                        <div className="flex justify-start w-full my-3">
                          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-100/90 dark:bg-neutral-900/90 border-slate-200 dark:border-neutral-800 shadow-2xs">
                            {isDeliveryAvailable && (
                              <button
                                type="button"
                                onClick={() => setPreviewServiceType('delivery')}
                                style={previewServiceType === 'delivery' ? {
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 2px 10px ${brandPrimary}45`,
                                  color: '#ffffff',
                                } : {}}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  previewServiceType === 'delivery'
                                    ? 'text-white'
                                    : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span>🛵 Entrega</span>
                              </button>
                            )}
                            {isPickupAllowed && (
                              <button
                                type="button"
                                onClick={() => setPreviewServiceType('pickup')}
                                style={previewServiceType === 'pickup' ? {
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 2px 10px ${brandPrimary}45`,
                                  color: '#ffffff',
                                } : {}}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  previewServiceType === 'pickup'
                                    ? 'text-white'
                                    : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span>🛍️ Retirada</span>
                              </button>
                            )}
                            {isTableServiceAvailable && (
                              <button
                                type="button"
                                onClick={() => setPreviewServiceType('dine_in')}
                                style={previewServiceType === 'dine_in' ? {
                                  background: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
                                  boxShadow: `0 2px 10px ${brandPrimary}45`,
                                  color: '#ffffff',
                                } : {}}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  previewServiceType === 'dine_in'
                                    ? 'text-white'
                                    : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-neutral-300 hover:text-white'
                                }`}
                              >
                                <span>🍽️ Mesa / Salão</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* INFORMAÇÕES DINÂMICAS CONFORME A MODALIDADE */}
                      {previewServiceType === 'dine_in' && isTableServiceAvailable ? (
                        <div className={`mt-2 p-3 rounded-2xl border flex items-center justify-between text-xs ${
                          isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-sky-950/25 border-sky-500/30 text-sky-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-sky-500" />
                            <span className="font-extrabold">🍽️ Consumo no Salão / Mesas — Toque aqui para selecionar sua Mesa</span>
                          </div>
                          <span className="font-bold text-sky-500">Selecionar Mesa ➔</span>
                        </div>
                      ) : previewServiceType === 'pickup' && isPickupAllowed ? (
                        <div className={`text-xs flex items-center justify-start gap-2 flex-wrap font-medium py-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">🛍️ Retirada no Balcão</span>
                          <span>•</span>
                          <span>Pronto em ~15-25 min</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sem taxa de entrega</span>
                          <span>•</span>
                          <span>Retirar no endereço da loja</span>
                        </div>
                      ) : isDeliveryAvailable ? (
                        <div className={`text-xs flex items-center justify-start gap-2 flex-wrap font-medium py-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">🕒 {estimatedTime} min</span>
                          <span>•</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">📍 Raio: até {deliveryRadius} km</span>
                          <span>•</span>
                          <span>Mínimo: R$ {minimumOrder.toFixed(2).replace('.', ',')}</span>
                          <span>•</span>
                          <span>{deliveryFee > 0 ? `Frete: R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Frete Grátis'}</span>
                        </div>
                      ) : (
                        <div className={`text-xs flex items-center justify-start gap-2 font-medium py-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <Store className="w-4 h-4 text-sky-500 shrink-0" />
                          <span>Atendimento presencial no estabelecimento físico • Pronta Entrega</span>
                        </div>
                      )}
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

          {/* SEÇÃO 2: 2 OPÇÕES DE LAYOUT DO BANNER DA VITRINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Store className="w-4 h-4 text-sky-500" />
                  <span>2 Opções de Layout do Banner da Vitrine</span>
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ✓ Escolha o formato desejado
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Escolha como a vitrine e a foto da sua loja serão exibidas para seus clientes no celular e no computador.
              </p>
            </div>

            {/* Grid dos 2 Modelos de Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {[
                {
                  id: 'ifood_cover',
                  name: 'Capa Panorâmica',
                  badge: 'Mais Recomendado',
                  desc: 'Foto panorâmica no topo com logo sobreposta, seletor de modalidades (Entrega / Retirada / Mesa) e dados de frete e raio visíveis.',
                  icon: '⚡',
                  highlight: true
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
                const currentLayout = (brandingEdits?.bannerLayout === 'card_99food' ? 'ifood_cover' : brandingEdits?.bannerLayout) || 
                  (currentTenant.branding?.bannerLayout === 'card_99food' ? 'ifood_cover' : currentTenant.branding?.bannerLayout) || 
                  'ifood_cover';
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

          {/* SEÇÃO 4: TEXTOS DA VITRINE */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-colors ${
            isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <Edit3 className="w-4 h-4" style={{ color: activeAccent }} />
              <span>Slogan em Destaque na Vitrine</span>
            </h3>

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
