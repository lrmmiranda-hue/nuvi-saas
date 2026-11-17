import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { getSegmentById, getTenantCategories } from '../../data/businessSegments';
import { 
  X, 
  Plus, 
  Trash2, 
  Tag, 
  Layers, 
  Check, 
  Pencil, 
  Info, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const { 
    currentTenant, 
    tenantProducts, 
    addCategory, 
    updateCategory, 
    toggleCategory, 
    deleteCategory, 
    showAlert, 
    showConfirm, 
    themeMode 
  } = useStore();

  const [newCatLabel, setNewCatLabel] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState('');

  const isLight = themeMode === 'light';

  if (!isOpen || !currentTenant) return null;

  const segmentConfig = getSegmentById(currentTenant.businessSegment || 'adega');
  const allCategories = getTenantCategories(currentTenant);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatLabel.trim();
    if (!trimmed) return;

    const newId = addCategory(trimmed);
    if (newId) {
      setNewCatLabel('');
      showAlert({
        title: 'Categoria Criada',
        message: `A categoria "${trimmed}" agora está disponível e ativa no catálogo da sua loja!`,
        variant: 'success',
      });
      if (onSelectCategory) {
        onSelectCategory(newId);
      }
    }
  };

  const handleStartEdit = (id: string, currentLabel: string) => {
    setEditingCatId(id);
    setEditLabelValue(currentLabel);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editLabelValue.trim();
    if (!trimmed) {
      showAlert({
        title: 'Nome Inválido',
        message: 'O nome da categoria não pode ficar vazio.',
        variant: 'warning',
      });
      return;
    }
    updateCategory(id, trimmed);
    setEditingCatId(null);
    setEditLabelValue('');
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setEditLabelValue('');
  };

  const handleDelete = (catId: string, label: string) => {
    const productsInCat = tenantProducts.filter((p) => p.category === catId);

    if (productsInCat.length > 0) {
      showConfirm({
        title: 'Excluir Categoria em Uso?',
        message: `Existem ${productsInCat.length} produto(s) cadastrado(s) na categoria "${label}". Ao excluir, ela não aparecerá mais nos filtros nem na vitrine. Deseja realmente remover?`,
        confirmText: 'Sim, Excluir Categoria',
        variant: 'danger',
        onConfirm: () => {
          deleteCategory(catId);
          showAlert({
            title: 'Categoria Excluída',
            message: `A categoria "${label}" foi removida do catálogo.`,
            variant: 'info',
          });
        },
      });
    } else {
      deleteCategory(catId);
      showAlert({
        title: 'Categoria Excluída',
        message: `A categoria "${label}" foi removida com sucesso!`,
        variant: 'info',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-neutral-900 border-neutral-800 text-white'
      }`}>
        
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Gerenciar Categorias da Loja
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                Comércio: <strong>{segmentConfig.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Adicionar Nova Categoria Form */}
          <form onSubmit={handleAdd} className={`p-3.5 rounded-xl border space-y-2.5 ${
            isLight ? 'bg-blue-50/70 border-blue-200/80' : 'bg-blue-500/5 border-blue-500/20'
          }`}>
            <div>
              <label className={`block text-xs font-bold mb-0.5 ${isLight ? 'text-slate-900' : 'text-blue-400'}`}>
                ➕ Adicionar Nova Categoria:
              </label>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                Crie novas categorias exclusivas para seu cardápio ou estoque (ex: Pizzas Doces, Porções Especiais, Sucos Naturais).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-slate-400' : 'text-neutral-400'
                }`} />
                <input
                  type="text"
                  required
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="Nome da nova categoria..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none focus:border-blue-500 transition-colors ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' 
                      : 'bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="btn-graphite px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          {/* Lista de Categorias do Estabelecimento com Status, Edição e Lixeira */}
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isLight ? 'bg-sky-50/80 border-sky-200 text-sky-950' : 'bg-sky-950/30 border-sky-800/60 text-sky-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>O que significa "Ativa" ou "Oculta"?</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                • <strong className="text-emerald-600 dark:text-emerald-400">Ativa:</strong> A categoria aparece como aba no <strong>Catálogo/Cardápio Online</strong> para os clientes e fica disponível para selecionar ao cadastrar produtos no <strong>Estoque/PDV</strong>.<br />
                • <strong className="text-neutral-500">Oculta / Pausada:</strong> Fica escondida do cardápio e do cadastro (ideal para pausar uma categoria sem precisar apagá-la).<br />
                • <strong className="text-rose-500">Lixeira:</strong> Exclui permanentemente a categoria da sua loja.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                Categorias do Estabelecimento ({allCategories.length})
              </span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                Clique no botão para Ativar ou Ocultar no Catálogo
              </span>
            </div>

            {allCategories.length === 0 ? (
              <div className={`p-4 rounded-xl border text-center text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}>
                Nenhuma categoria cadastrada. Adicione uma nova acima.
              </div>
            ) : (
              <div className="space-y-2">
                {allCategories.map((cat) => {
                  const prodCount = tenantProducts.filter((p) => p.category === cat.id).length;
                  const isEditing = editingCatId === cat.id;
                  const isEnabled = cat.enabled !== false;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isEnabled
                          ? isLight
                            ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                          : isLight
                          ? 'bg-slate-100/70 border-slate-200 opacity-60'
                          : 'bg-neutral-900/50 border-neutral-850 opacity-60'
                      }`}
                    >
                      {/* Lado Esquerdo: Status Toggle + Nome/Input */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Botão Toggle Ativa vs Oculta */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          title={isEnabled ? 'Clique para ocultar esta categoria do catálogo e do cadastro' : 'Clique para ativar esta categoria no catálogo e no cadastro'}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            isEnabled
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : isLight
                              ? 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                          <span>{isEnabled ? 'Ativa no Catálogo & Estoque' : 'Oculta / Pausada'}</span>
                        </button>

                        {/* Nome ou Campo de Edição */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <input
                              type="text"
                              value={editLabelValue}
                              onChange={(e) => setEditLabelValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(cat.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                              className={`px-2 py-1 rounded text-xs font-semibold border flex-1 min-w-0 focus:outline-none focus:border-blue-500 ${
                                isLight 
                                  ? 'bg-white border-blue-400 text-slate-900' 
                                  : 'bg-neutral-900 border-blue-500 text-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat.id)}
                              className="p-1 rounded bg-emerald-500 text-neutral-950 hover:bg-emerald-400 cursor-pointer"
                              title="Salvar Nome"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className={`p-1 rounded cursor-pointer ${
                                isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              }`}
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={`font-bold text-xs truncate ${
                              !isEnabled
                                ? 'line-through text-neutral-500'
                                : isLight 
                                ? 'text-slate-900' 
                                : 'text-white'
                            }`}>
                              {cat.label}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                              isLight ? 'bg-slate-100 text-slate-600' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {prodCount} un
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lado Direito: Ações (Editar, Selecionar, Lixeira) */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Botão Selecionar (se chamado do editor de produto) */}
                          {onSelectCategory && isEnabled && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCategory(cat.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:bg-blue-500/25 cursor-pointer"
                            >
                              Selecionar
                            </button>
                          )}

                          {/* Botão Editar Nome */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat.id, cat.label)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLight 
                                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' 
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            }`}
                            title={`Editar nome de "${cat.label}"`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão da Lixeira (Excluir Categoria) */}
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.label)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition-colors cursor-pointer"
                            title={`Excluir categoria "${cat.label}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className={`px-5 sm:px-6 py-3.5 border-t flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Categorias ativas aparecem tanto no Catálogo/Cardápio Online para os clientes quanto na lista de opções do Estoque e PDV.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
