import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BusinessSegmentType } from '../../types';
import { WALLPAPER_CATEGORIES, StoreWallpaper, MediaUsageType } from '../../data/wallpapers';
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
  Search,
  ExternalLink,
  Clipboard,
  Globe,
  ArrowLeft,
  Heart,
  Store
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

  // Busca inteligente no Google Imagens conforme Título ou Segmento
  const handleSearchOnGoogle = () => {
    const segmentObj = WALLPAPER_CATEGORIES.find(c => c.id === newCategory);
    const segmentLabel = segmentObj ? segmentObj.label.split('&')[0].trim() : '';

    const queryTerms: string[] = [];
    if (newTitle.trim()) {
      queryTerms.push(newTitle.trim());
    } else {
      queryTerms.push(segmentLabel);
    }

    if (newUsageType === 'slide') {
      queryTerms.push('promoção banner horizontal');
    } else {
      queryTerms.push('banner capa horizontal alta resolução');
    }

    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(queryTerms.join(' '))}`;
    window.open(searchUrl, '_blank');
  };

  // Colar link diretamente da área de transferência
  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        const inputEl = document.getElementById('media_url_input') as HTMLInputElement;
        if (inputEl) inputEl.focus();
        showAlert({
          title: 'Cole no Campo',
          message: 'Pressione Ctrl+V dentro do campo para colar a URL da imagem copiada do Google.',
          variant: 'info'
        });
        return;
      }

      const text = await navigator.clipboard.readText();
      const trimmed = (text || '').trim();
      if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image'))) {
        setNewUrl(trimmed);
        setImagePreview(trimmed);
        showAlert({
          title: 'Link Colado! 📋',
          message: 'O link da foto foi colado com sucesso e a prévia do banner atualizada.',
          variant: 'success'
        });
      } else {
        showAlert({
          title: 'Nenhum link de foto encontrado',
          message: 'No Google Imagens, clique com o botão direito sobre a foto desejada, escolha "Copiar endereço da imagem" e depois clique em Colar Link.',
          variant: 'warning'
        });
      }
    } catch {
      const inputEl = document.getElementById('media_url_input') as HTMLInputElement;
      if (inputEl) inputEl.focus();
    }
  };

  // Upload local de arquivo do computador
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
        message: 'Por favor, pesquise no Google e cole o link da foto, ou faça upload de uma imagem.',
        variant: 'warning'
      });
      return;
    }

    if (!newTitle.trim()) {
      showAlert({
        title: 'Título Obrigatório',
        message: 'Por favor, informe um título descritivo para a imagem (ex: "Pizza Calabresa Forno a Lenha").',
        variant: 'warning'
      });
      return;
    }

    const saved = addMediaItem({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || undefined,
      category: newCategory,
      usageType: newUsageType,
      tag: newTag.trim() || 'Oficial Nuvi',
      url: finalUrl,
    });

    const categoryObj = WALLPAPER_CATEGORIES.find(c => c.id === newCategory);

    showAlert({
      title: 'Imagem Gravada no Banco! 🖼️',
      message: `A imagem "${saved.title}" foi salva com sucesso no banco de dados e já está disponível para todos os clientes de "${categoryObj?.label || newCategory}".`,
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
      message: `Tem certeza que deseja excluir "${item.title}"? Ela será removida do banco de dados e não aparecerá mais para os clientes.`,
      confirmText: 'Sim, Excluir Imagem',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteMediaItem(item.id);
        showAlert({
          title: 'Imagem Removida',
          message: 'A imagem foi excluída com sucesso do banco de dados.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all my-auto ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f141a] border-[#1d2836] text-white'
        }`}
      >
        {/* CABEÇALHO */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between gap-4 ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#141b24] border-[#1d2836]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <ImageIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black tracking-tight truncate">
                  Banco Central de Imagens por Tipo de Comércio
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  {mediaLibrary.length} Imagens Gravadas
                </span>
              </div>
              <p className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pesquise no Google, copie o link e salve imagens no formato exato da capa da vitrine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botão Adicionar Imagem */}
            <button
              type="button"
              onClick={() => setIsAddingOpen(!isAddingOpen)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-sky-600/25 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar Imagem</span>
              <span className="sm:hidden">Nova Foto</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600' : 'bg-[#1a2330] hover:bg-[#222e3f] border-[#29384b] text-slate-300'
              }`}
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FORMULÁRIO DE NOVA IMAGEM COM PESQUISA NO GOOGLE E PRÉVIA EM TAMANHO REAL DE CAPA */}
        {isAddingOpen && (
          <form 
            onSubmit={handleSaveNewMedia}
            className={`p-4 sm:p-6 border-b animate-slide-down ${
              isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-sky-950/25 border-sky-900/40'
            }`}
          >
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-sky-200/50 dark:border-sky-800/50">
                <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Cadastrar Imagem com Pesquisa no Google & Prévia de Capa Real
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              {/* GRID PRINCIPAL: FORMULÁRIO + PRÉVIA EM TAMANHO REAL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* LADO ESQUERDO: CAMPOS E BUSCADOR NO GOOGLE (5 colunas) */}
                <div className="lg:col-span-5 space-y-3">
                  
                  {/* TÍTULO DA IMAGEM COM BOTÃO DA LUPA DO GOOGLE */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold">Título da Imagem *</label>
                      <button
                        type="button"
                        onClick={handleSearchOnGoogle}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Abrir o Google Imagens com este título"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Pesquisar no Google</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ex: Pizza de Calabresa Forno a Lenha"
                        className={`w-full pl-3 pr-24 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSearchOnGoogle}
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        title="Buscar imagens no Google"
                      >
                        <Search className="w-3 h-3 stroke-[2.5]" />
                        <span>Buscar</span>
                      </button>
                    </div>
                  </div>

                  {/* SEGMENTO E FINALIDADE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold block mb-1">Tipo de Comércio *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as BusinessSegmentType)}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${
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
                      <label className="text-xs font-bold block mb-1">Finalidade</label>
                      <select
                        value={newUsageType}
                        onChange={(e) => setNewUsageType(e.target.value as MediaUsageType)}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      >
                        <option value="cover">Capa Panorâmica da Loja</option>
                        <option value="slide">Slide Promocional (Ofertas)</option>
                        <option value="product">Foto de Produto / Destaque</option>
                        <option value="all">Todas as Finalidades</option>
                      </select>
                    </div>
                  </div>

                  {/* CAMPO DE URL COM BOTÃO DE COLAR LINK E UPLOAD */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">Link da Imagem (URL) *</label>
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Colar link da área de transferência"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Colar Link Copiado</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        id="media_url_input"
                        type="url"
                        value={newUrl.startsWith('data:') ? '' : newUrl}
                        onChange={(e) => {
                          setNewUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="Cole o endereço da imagem do Google (https://...)"
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                        title="Colar link copiado"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Colar</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Ou faça upload do computador:</span>
                      <label className="font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Escolher Arquivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* TAG E LEGENDA */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[11px] font-bold block mb-1">Tag (Selo)</label>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Ex: Mais Escolhido"
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block mb-1">Legenda (Opcional)</label>
                      <input
                        type="text"
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        placeholder="Ex: Foto em alta resolução"
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-[#151c24] border-[#253342]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* BOTÃO SALVAR */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Salvar Foto no Banco de Dados</span>
                    </button>
                  </div>
                </div>

                {/* LADO DIREITO: PRÉVIA NO TAMANHO EXATO DO BANNER DE CAPA (7 colunas) */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Prévia em Tamanho Real do Banner de Capa
                      </span>
                      <span className="text-[9.5px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Proporção Panorâmica 100% Fiel
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSearchOnGoogle}
                      className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      <span>Procurar no Google</span>
                    </button>
                  </div>

                  {/* CONTAINER DO BANNER EM TAMANHO EXATO DA CAPA DA VITRINE */}
                  <div className="rounded-3xl border shadow-xl overflow-hidden relative border-slate-300 dark:border-neutral-700 bg-slate-900 transition-all">
                    
                    {/* FOTO DA CAPA EM PROPORÇÃO PANORÂMICA (h-44 sm:h-52 md:h-60) */}
                    <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      {imagePreview || newUrl ? (
                        <>
                          <img
                            src={imagePreview || newUrl}
                            alt="Prévia de Capa"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            onError={() => {
                              setImagePreview('');
                              showAlert({
                                title: 'Erro ao Carregar Imagem',
                                message: 'A URL informada não permite exibição direta ou expirou. Tente clicar com o botão direito na imagem do Google e "Copiar endereço da imagem".',
                                variant: 'warning'
                              });
                            }}
                          />

                          {/* Vinheta Escura para Contraste com os Botões */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

                          {/* Efeito Feixe Flash Metálico */}
                          <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                            <div
                              className="w-2/3 h-full absolute inset-y-0 animate-banner-light-sweep mix-blend-screen opacity-70"
                              style={{
                                background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 25%, rgba(255, 255, 255, 0.85) 50%, rgba(255, 255, 255, 0.08) 75%, transparent 100%)`
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-2 text-slate-400">
                          <ImageIcon className="w-12 h-12 mx-auto opacity-30 animate-pulse text-sky-400" />
                          <span className="text-xs font-bold block text-slate-300">
                            Nenhuma foto carregada na capa
                          </span>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Clique em <strong>"Buscar no Google"</strong>, copie a foto que você gostar e clique em <strong>"Colar Link"</strong> para ver a prévia exata aqui.
                          </p>
                          <button
                            type="button"
                            onClick={handleSearchOnGoogle}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Abrir Google Imagens Agora</span>
                          </button>
                        </div>
                      )}

                      {/* ELEMENTOS REAIS DA CAPA DA VITRINE SOBREPOSTOS */}
                      {/* 1. Barra Superior com Botão Voltar e Status */}
                      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md">
                          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-rose-500 flex items-center justify-center border border-white/20 shadow-md">
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          </div>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/90 text-white border border-emerald-400 shadow-md">
                            ● Aberto
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD SOBREPOSTO ESTILO IFOOD / NUVI (MOSTRANDO A LOGO EM CIMA DA FOTO) */}
                    <div className={`px-4 sm:px-6 pb-3 pt-0 relative z-20 -mt-6 rounded-t-3xl transition-colors ${
                      isLight ? 'bg-white' : 'bg-neutral-950'
                    }`}>
                      <div className="flex items-end gap-3 min-w-0">
                        {/* LOGO QUADRADINHO COM METADE EM CIMA DA IMAGEM */}
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-2xl border-4 shrink-0 overflow-hidden flex items-center justify-center relative z-30 -mt-8 sm:-mt-10 ${
                          isLight ? 'bg-white border-white' : 'bg-neutral-900 border-neutral-900'
                        }`}>
                          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-inner">
                            {newTitle ? newTitle.charAt(0).toUpperCase() : 'N'}
                          </div>
                        </div>

                        {/* NOME DA LOJA E INFORMAÇÕES DE TESTE */}
                        <div className="min-w-0 flex-1 pb-1 pt-1">
                          <h3 className={`text-sm sm:text-base font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {newTitle || 'Título da Foto / Nome da Loja'}
                          </h3>
                          <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {newSubtitle || 'Assim que o seu cliente visualizará o banner na vitrine oficial.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DICA DE ORIENTAÇÃO */}
                  <div className="mt-2 text-center text-[10.5px] text-slate-500">
                    💡 As fotos de capa usam formato horizontal panorâmico. Fotos com pessoas ou pratos no centro ficam perfeitas!
                  </div>
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

        {/* LISTAGEM DE IMAGENS EM GRID PANORÂMICO */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredMedia.length === 0 ? (
            <div className="py-16 text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                Nenhuma imagem encontrada
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Não há imagens cadastradas para este filtro. Clique em "Adicionar Imagem" no topo para buscar fotos no Google e salvar no banco deste comércio.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((media) => {
                const categoryConfig = WALLPAPER_CATEGORIES.find((c) => c.id === media.category);
                return (
                  <div
                    key={media.id}
                    className={`group rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-xl flex flex-col ${
                      isLight ? 'bg-white border-slate-200 hover:border-sky-400' : 'bg-[#151c24] border-[#222e3c] hover:border-sky-500/50'
                    }`}
                  >
                    {/* Imagem em Proporção de Capa Real (aspect-[16/7]) */}
                    <div className="relative aspect-[16/8] w-full overflow-hidden bg-slate-900 shrink-0">
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
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-all opacity-85 group-hover:opacity-100 cursor-pointer active:scale-90"
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
                          ✓ No Banco
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
              Imagens salvas aqui são gravadas no banco de dados e aparecem instantaneamente para os lojistas do segmento escolhido.
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
