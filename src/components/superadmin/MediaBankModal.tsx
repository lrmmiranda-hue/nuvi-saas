import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BusinessSegmentType } from '../../types';
import { WALLPAPER_CATEGORIES, StoreWallpaper, MediaUsageType } from '../../data/wallpapers';
import { BUSINESS_SEGMENTS } from '../../data/businessSegments';
import { 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Layers, 
  Filter, 
  Search,
  Eye,
  Tag
} from 'lucide-react';

interface MediaBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaBankModal: React.FC<MediaBankModalProps> = ({ isOpen, onClose }) => {
  const { 
    mediaLibrary, 
    addMediaItem, 
    deleteMediaItem, 
    resetMediaLibrary, 
    showConfirm, 
    showAlert, 
    themeMode 
  } = useStore();

  const isLight = themeMode === 'light';

  // Filtros
  const [selectedSegment, setSelectedSegment] = useState<'all' | BusinessSegmentType>('all');
  const [selectedUsage, setSelectedUsage] = useState<'all' | MediaUsageType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modo de Adição
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<BusinessSegmentType>('adega');
  const [newUsageType, setNewUsageType] = useState<MediaUsageType>('cover');
  const [newTag, setNewTag] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Upload local de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert({
        title: 'Arquivo Inválido',
        message: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).',
        variant: 'warning'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewMedia = (e: React.FormEvent) => {
    e.preventDefault();

    const finalUrl = (newUrl || imagePreview).trim();
    if (!finalUrl) {
      showAlert({
        title: 'Imagem Obrigatória',
        message: 'Por favor, faça upload de uma foto ou insira um link de imagem.',
        variant: 'warning'
      });
      return;
    }

    if (!newTitle.trim()) {
      showAlert({
        title: 'Título Obrigatório',
        message: 'Por favor, informe um título descritivo para a imagem.',
        variant: 'warning'
      });
      return;
    }

    addMediaItem({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || undefined,
      category: newCategory,
      usageType: newUsageType,
      tag: newTag.trim() || 'Oficial Nuvi',
      url: finalUrl,
    });

    showAlert({
      title: 'Imagem Adicionada com Sucesso! 🖼️',
      message: `A imagem "${newTitle.trim()}" foi cadastrada e já está disponível para todos os clientes de "${newCategory.replace('_', ' ')}".`,
      variant: 'success'
    });

    // Limpar formulário
    setNewTitle('');
    setNewSubtitle('');
    setNewTag('');
    setNewUrl('');
    setImagePreview('');
    setIsAddingOpen(false);
  };

  const handleDelete = (item: StoreWallpaper) => {
    showConfirm({
      title: 'Excluir Imagem do Banco?',
      message: `Tem certeza que deseja excluir "${item.title}"? Ela não aparecerá mais para os clientes deste segmento.`,
      confirmText: 'Sim, Excluir Imagem',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteMediaItem(item.id);
        showAlert({
          title: 'Imagem Removida',
          message: 'A imagem foi excluída com sucesso do banco oficial.',
          variant: 'info'
        });
      }
    });
  };

  const handleResetDefaults = () => {
    showConfirm({
      title: 'Restaurar Imagens Padrão?',
      message: 'Isso irá restaurar todas as imagens originais de fábrica do sistema para todos os segmentos.',
      confirmText: 'Restaurar Padrão',
      cancelText: 'Cancelar',
      variant: 'warning',
      onConfirm: () => {
        resetMediaLibrary();
        showAlert({
          title: 'Banco Restaurado!',
          message: 'As imagens padrão foram restabelecidas com sucesso.',
          variant: 'success'
        });
      }
    });
  };

  // Contagem por segmento
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mediaLibrary.length };
    mediaLibrary.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [mediaLibrary]);

  // Lista filtrada
  const filteredMedia = useMemo(() => {
    return mediaLibrary.filter((m) => {
      if (selectedSegment !== 'all' && m.category !== selectedSegment) return false;
      if (selectedUsage !== 'all' && m.usageType && m.usageType !== selectedUsage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSub = (m.subtitle || '').toLowerCase().includes(q);
        const matchesTag = (m.tag || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesTag) return false;
      }
      return true;
    });
  }, [mediaLibrary, selectedSegment, selectedUsage, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all my-auto ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f141a] border-[#1d2836] text-white'
        }`}
      >
        {/* CABEÇALHO */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#141b24] border-[#1d2836]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <ImageIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight truncate">
                  Banco Central de Imagens por Tipo de Comércio
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  {mediaLibrary.length} Imagens no Acervo
                </span>
              </div>
              <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Adicione, organize ou exclua as fotos que aparecem para seus lojistas escolherem nas vitrines e banners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botão Adicionar Imagem */}
            <button
              type="button"
              onClick={() => setIsAddingOpen(!isAddingOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-sky-600/25 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar Imagem</span>
              <span className="sm:hidden">Nova</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600' : 'bg-[#1a2330] hover:bg-[#222e3f] border-[#29384b] text-slate-300'
              }`}
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FORMULÁRIO DE NOVA IMAGEM (COLAPSÁVEL) */}
        {isAddingOpen && (
          <form 
            onSubmit={handleSaveNewMedia}
            className={`p-5 sm:p-6 border-b animate-slide-down ${
              isLight ? 'bg-sky-50/60 border-sky-100' : 'bg-sky-950/20 border-sky-900/30'
            }`}
          >
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Cadastrar Nova Imagem para os Lojistas
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Coluna 1 e 2: Dados */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Título da Imagem *</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: Combo Família Pizza Forno a Lenha"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                      }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold block mb-1">Tipo de Comércio (Segmento) *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as BusinessSegmentType)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      >
                        {WALLPAPER_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Finalidade da Imagem</label>
                      <select
                        value={newUsageType}
                        onChange={(e) => setNewUsageType(e.target.value as MediaUsageType)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      >
                        <option value="cover">Capa Panorâmica da Loja (Banner)</option>
                        <option value="slide">Banner de Slide Promocional</option>
                        <option value="product">Foto de Produto / Destaque</option>
                        <option value="all">Todas as Finalidades</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold block mb-1">Tag / Selo (Opcional)</label>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Ex: Mais Escolhido, Promoção, Verão"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Legenda / Descrição (Opcional)</label>
                      <input
                        type="text"
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        placeholder="Ex: Foto em alta definição de ambiente"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Como Inserir a Foto */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold block">Foto da Imagem *</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                        isLight ? 'border-sky-300 hover:bg-sky-100/50 bg-white' : 'border-sky-700/50 hover:bg-sky-900/20 bg-[#151c24]'
                      }`}>
                        <Upload className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                          Fazer Upload do Computador
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="flex-1">
                        <input
                          type="url"
                          value={newUrl.startsWith('data:') ? '' : newUrl}
                          onChange={(e) => {
                            setNewUrl(e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          placeholder="Ou cole a URL direta da imagem (https://...)"
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                            isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna 3: Prévia da Foto */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold block mb-1">Prévia da Imagem</label>
                  <div className={`flex-1 min-h-[140px] rounded-2xl border overflow-hidden flex items-center justify-center relative ${
                    isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#11161d] border-[#222d3b]'
                  }`}>
                    {imagePreview || newUrl ? (
                      <img
                        src={imagePreview || newUrl}
                        alt="Prévia"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                        <span className="text-[11px] font-medium block">Nenhuma foto carregada</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar no Banco de Imagens</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* BARRA DE FILTROS */}
        <div className={`p-4 border-b space-y-3 ${
          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-[#121820] border-[#1d2836]'
        }`}>
          {/* Busca e Finalidade */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, tag ou descrição..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isLight ? 'bg-white border-slate-300' : 'bg-[#161d26] border-[#253342]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Uso:</span>
                <select
                  value={selectedUsage}
                  onChange={(e) => setSelectedUsage(e.target.value as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                    isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-[#161d26] border-[#253342] text-slate-200'
                  }`}
                >
                  <option value="all">Todas as Finalidades</option>
                  <option value="cover">Apenas Capas da Loja</option>
                  <option value="slide">Apenas Slides Promocionais</option>
                  <option value="product">Apenas Fotos de Produtos</option>
                </select>
              </div>

              {/* Botão Restaurar Padrões */}
              <button
                type="button"
                onClick={handleResetDefaults}
                className={`p-2 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 text-slate-400 hover:text-amber-500 ${
                  isLight ? 'bg-white border-slate-300 hover:bg-slate-50' : 'bg-[#161d26] border-[#253342] hover:bg-[#1f2835]'
                }`}
                title="Restaurar imagens padrão de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Restaurar Padrões</span>
              </button>
            </div>
          </div>

          {/* CHIPS HORIZONTAIS DE SEGMENTO DE COMÉRCIO */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedSegment('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSegment === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : isLight ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-[#18202b] border border-[#263445] text-slate-300 hover:bg-[#202b3a]'
              }`}
            >
              <span>Todos os Comércios</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-black">
                {segmentCounts.all}
              </span>
            </button>

            {WALLPAPER_CATEGORIES.map((cat) => {
              const count = segmentCounts[cat.id] || 0;
              const isSelected = selectedSegment === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedSegment(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm'
                      : isLight ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-[#18202b] border border-[#263445] text-slate-300 hover:bg-[#202b3a]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : count > 0 ? 'bg-sky-500/15 text-sky-500' : 'bg-slate-500/15 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTAGEM DE IMAGENS EM GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredMedia.length === 0 ? (
            <div className="py-16 text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                Nenhuma imagem encontrada
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Não há imagens cadastradas para este filtro. Clique em "Adicionar Imagem" no topo para subir novas fotos para este comércio.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all cursor-pointer shadow-sm"
              >
                + Adicionar Imagem Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {filteredMedia.map((media) => {
                const categoryConfig = WALLPAPER_CATEGORIES.find((c) => c.id === media.category);
                return (
                  <div
                    key={media.id}
                    className={`group rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg flex flex-col ${
                      isLight ? 'bg-white border-slate-200 hover:border-sky-400' : 'bg-[#151c24] border-[#222e3c] hover:border-sky-500/50'
                    }`}
                  >
                    {/* Imagem com Ações Flutuantes */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={media.url}
                        alt={media.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Selo do Segmento */}
                      <span className="absolute top-2 left-2 z-10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/20">
                        {categoryConfig?.label.split('&')[0] || media.category}
                      </span>

                      {/* Botão Excluir */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(media);
                        }}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-all opacity-80 group-hover:opacity-100 cursor-pointer active:scale-90"
                        title="Excluir esta imagem do banco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Tag Inferior */}
                      {media.tag && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-sky-600/90 text-white backdrop-blur-xs shadow-xs">
                            {media.tag}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dados da Foto */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold line-clamp-1 group-hover:text-sky-600 transition-colors" title={media.title}>
                          {media.title}
                        </h4>
                        {media.subtitle && (
                          <p className={`text-[10px] mt-0.5 line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {media.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[9.5px]">
                        <span className="text-slate-400 font-semibold">
                          {media.usageType === 'slide' ? '📢 Slide de Oferta' : media.usageType === 'product' ? '📦 Foto de Produto' : '🖼️ Capa Panorâmica'}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Ativo
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RODAPÉ INFORMATIVO */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#141b24] border-[#1d2836] text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Imagens cadastradas ficam salvas e aparecem instantaneamente para todos os lojistas do segmento correspondente.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
              isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-[#1b2430] border-[#293646] text-slate-200 hover:bg-[#222e3e]'
            }`}
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
