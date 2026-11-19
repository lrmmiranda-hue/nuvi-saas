import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreUser, StoreUserRole, StoreModulePermission } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  LogIn,
  Check,
  X,
  Lock,
  Sparkles,
  ShoppingBag,
  Store,
  Boxes,
  BarChart3,
  Settings,
  Palette,
  MessageCircle,
  Truck,
  Eye,
  EyeOff
} from 'lucide-react';

interface StoreUsersManagerProps {
  isLight: boolean;
}

const ALL_MODULE_PERMISSIONS: { id: StoreModulePermission; label: string; desc: string; icon: any }[] = [
  { id: 'vendas', label: 'Venda de Balcão (PDV)', desc: 'Abrir caixa, bipar produtos e finalizar vendas presenciais', icon: Store },
  { id: 'produtos', label: 'Catálogo de Produtos', desc: 'Cadastrar e editar produtos, preços e promoções', icon: ShoppingBag },
  { id: 'estoque', label: 'Controle de Estoque', desc: 'Entrada de mercadorias, conferência e histórico', icon: Boxes },
  { id: 'pedidos', label: 'Gestão de Pedidos', desc: 'Receber e despachar pedidos da vitrine e WhatsApp', icon: ShoppingBag },
  { id: 'metricas', label: 'Gestão Financeira & Caixa', desc: 'Ver faturamento, extrato de vendas e lançar despesas', icon: BarChart3 },
  { id: 'configuracoes', label: 'Configurações da Loja', desc: 'Editar dados cadastrais, horários e chave PIX', icon: Settings },
  { id: 'visual', label: 'Visual, Cores & Vitrine', desc: 'Alterar banners, paletas de cores e tema da loja', icon: Palette },
  { id: 'whatsapp', label: 'Central WhatsApp', desc: 'Configurar mensagens automáticas e templates', icon: MessageCircle },
  { id: 'entrega', label: 'Raio & Taxas de Entrega', desc: 'Configurar frete e bairros atendidos', icon: Truck },
];

export const StoreUsersManager: React.FC<StoreUsersManagerProps> = ({ isLight }) => {
  const {
    tenantUsers,
    currentStoreUser,
    setCurrentStoreUserId,
    addStoreUser,
    updateStoreUser,
    deleteStoreUser,
    showAlert,
    showConfirm
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<StoreUserRole>('caixa');
  const [roleLabel, setRoleLabel] = useState('Operador de Caixa (Frente)');
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<StoreModulePermission[]>(['vendas']);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  const toggleShowPin = (id: string) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenNew = () => {
    setEditingUserId(null);
    setName('');
    setUsername(`operador${tenantUsers.length + 1}`);
    setPin('1234');
    setRole('caixa');
    setRoleLabel('Operador de Caixa (Frente)');
    setActive(true);
    setPermissions(['vendas']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: StoreUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPin(user.pin);
    setRole(user.role);
    setRoleLabel(user.roleLabel || 'Operador de Caixa');
    setActive(user.active);
    setPermissions(user.permissions || ['vendas']);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: 'caixa' | 'estoque' | 'total') => {
    if (preset === 'caixa') {
      setRole('caixa');
      setRoleLabel('Operador de Caixa (Frente)');
      setPermissions(['vendas']);
    } else if (preset === 'estoque') {
      setRole('estoquista');
      setRoleLabel('Conferente de Estoque');
      setPermissions(['estoque', 'produtos']);
    } else if (preset === 'total') {
      setRole('gerente');
      setRoleLabel('Gerente Geral');
      setPermissions(ALL_MODULE_PERMISSIONS.map(p => p.id));
    }
  };

  const togglePermission = (permId: StoreModulePermission) => {
    if (permissions.includes(permId)) {
      if (permissions.length === 1) {
        showAlert({
          title: 'Permissão Obrigatória',
          message: 'O usuário precisa ter acesso a pelo menos 1 janela/módulo do sistema.',
          variant: 'warning'
        });
        return;
      }
      setPermissions(permissions.filter(p => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showAlert({ title: 'Campo Obrigatório', message: 'Informe o nome do funcionário.', variant: 'warning' });
      return;
    }
    if (!pin.trim()) {
      showAlert({ title: 'PIN Obrigatório', message: 'Defina um PIN/Senha de 4 a 6 dígitos.', variant: 'warning' });
      return;
    }

    if (editingUserId) {
      updateStoreUser(editingUserId, {
        name: name.trim(),
        username: username.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, ''),
        pin: pin.trim(),
        role,
        roleLabel,
        active,
        permissions,
      });
      showAlert({
        title: 'Usuário Atualizado',
        message: `As permissões de "${name}" foram salvas com sucesso!`,
        variant: 'success'
      });
    } else {
      addStoreUser({
        name: name.trim(),
        username: username.trim().toLowerCase() || `user_${Date.now().toString().slice(-4)}`,
        pin: pin.trim(),
        role,
        roleLabel,
        active,
        permissions,
      });
      showAlert({
        title: 'Usuário Cadastrado',
        message: `O operador "${name}" foi cadastrado com sucesso!`,
        variant: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (user: StoreUser) => {
    if (tenantUsers.length <= 1) {
      showAlert({
        title: 'Operação Bloqueada',
        message: 'A loja precisa ter no mínimo 1 usuário administrador ativo.',
        variant: 'warning'
      });
      return;
    }

    showConfirm({
      title: 'Excluir Operador',
      message: `Tem certeza que deseja remover o acesso de "${user.name}"? O histórico de vendas anteriores continuará preservado.`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteStoreUser(user.id);
        showAlert({
          title: 'Usuário Removido',
          message: `O usuário "${user.name}" foi removido do sistema.`,
          variant: 'success'
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1C2631]">
        <div>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Users className="w-5 h-5 text-sky-500" />
            <span>Controle de Usuários, Caixas & Permissões</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Cadastre funcionários e defina exatamente quais janelas e abas cada um pode acessar (ex: somente Venda de Balcão).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] hover:from-[#0E2A4D] hover:to-[#133763] text-white font-bold text-xs shadow-md shadow-[#0C2340]/40 border-0 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Operador / Caixa</span>
        </button>
      </div>

      {/* Destaque do Operador Ativo no Momento */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight
          ? 'bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-sky-200 text-slate-800'
          : 'bg-gradient-to-r from-[#0C2340]/50 via-[#0E2A4D]/40 to-[#0A1E37]/50 border-sky-900/40 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center font-black text-lg border border-sky-500/30">
            {currentStoreUser?.name ? currentStoreUser.name[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● Operador Ativo no Caixa
              </span>
            </div>
            <h4 className="text-sm font-black mt-0.5">
              {currentStoreUser?.name || 'Administrador'}
              <span className="text-xs font-normal opacity-70 ml-2">({currentStoreUser?.roleLabel || 'Gerente'})</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-400">
            {currentStoreUser?.permissions?.length || 0} módulos permitidos
          </span>
        </div>
      </div>

      {/* Grid de Usuários Cadastrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenantUsers.map((user) => {
          const isCurrentActive = currentStoreUser?.id === user.id;
          const isShowingPin = showPins[user.id];

          return (
            <div
              key={user.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isCurrentActive
                  ? isLight
                    ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500/30 shadow-sm'
                    : 'border-sky-500/60 bg-[#0E1B2B] shadow-md ring-1 ring-sky-500/30'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-[#0E1318] border-[#1C2631] hover:border-slate-700'
              }`}
            >
              <div>
                {/* Cabeçalho do Card de Usuário */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                      isCurrentActive
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-neutral-800 text-slate-200 border border-neutral-700'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {user.name}
                        </h4>
                        {isCurrentActive && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500 text-white">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {user.roleLabel} • @{user.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isLight
                          ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                          : 'border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white'
                      }`}
                      title="Editar Usuário e Permissões"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* PIN e Status */}
                <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 font-medium">PIN de Acesso:</span>
                    <span className="font-mono font-bold">
                      {isShowingPin ? user.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleShowPin(user.id)}
                      className="ml-1 text-slate-400 hover:text-white cursor-pointer"
                      title={isShowingPin ? 'Ocultar PIN' : 'Ver PIN'}
                    >
                      {isShowingPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Acesso Ativo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                        <XCircle className="w-3 h-3" />
                        <span>Bloqueado</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista de Janelas / Módulos Permitidos */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Janelas Permitidas ({user.permissions?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions?.map((permId) => {
                      const mod = ALL_MODULE_PERMISSIONS.find(m => m.id === permId);
                      if (!mod) return null;
                      return (
                        <span
                          key={permId}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            isLight
                              ? 'bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
                          }`}
                        >
                          <mod.icon className="w-2.5 h-2.5 text-sky-400" />
                          <span>{mod.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ação: Assumir Caixa / Alternar Operador */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#1C2631]">
                {isCurrentActive ? (
                  <div className="w-full py-2 rounded-xl text-center text-xs font-bold text-sky-500 bg-sky-500/10 border border-sky-500/20 flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Operador Conectado Neste Momento</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStoreUserId(user.id);
                      showAlert({
                        title: 'Operador Conectado',
                        message: `Você agora está operando no caixa como "${user.name}". As próximas vendas e baixas no estoque sairão com o seu nome.`,
                        variant: 'success'
                      });
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isLight
                        ? 'border-slate-300 hover:border-sky-500 hover:text-sky-600 bg-slate-50'
                        : 'border-[#1C2631] hover:border-sky-500 hover:text-white bg-[#121820]'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5 text-sky-400" />
                    <span>Entrar como {user.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criar / Editar Usuário & Permissões */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0E1318] border-[#1C2631] text-white'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1C2631]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold">
                  {editingUserId ? 'Editar Operador & Permissões' : 'Cadastrar Novo Operador'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Presets Rápidos */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Predefinições Rápidas de Perfil:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('caixa')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      role === 'caixa'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121820] border-[#1C2631] text-slate-300'
                    }`}
                  >
                    Somente Caixa (PDV)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('estoque')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      role === 'estoquista'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121820] border-[#1C2631] text-slate-300'
                    }`}
                  >
                    Estoque & Produtos
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('total')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      role === 'gerente'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#121820] border-[#1C2631] text-slate-300'
                    }`}
                  >
                    Acesso Total (Gerente)
                  </button>
                </div>
              </div>

              {/* Nome e Login */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Nome do Funcionário *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:border-sky-500 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Identificador / Login *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Ex: caixa1"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:border-sky-500 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Cargo e PIN de Caixa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Título do Cargo</label>
                  <input
                    type="text"
                    value={roleLabel}
                    onChange={(e) => setRoleLabel(e.target.value)}
                    placeholder="Ex: Operador de Caixa Noturno"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:border-sky-500 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">PIN / Senha de Acesso Rápido *</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Ex: 1234"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold tracking-widest outline-none focus:border-sky-500 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Usado para trocar de operador rapidamente na frente de caixa.
                  </span>
                </div>
              </div>

              {/* Checkboxes de Permissões Individuais */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold block">
                    Permissões de Acesso às Janelas do Painel:
                  </label>
                  <span className="text-[11px] text-sky-400 font-bold">
                    {permissions.length} selecionados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_MODULE_PERMISSIONS.map((perm) => {
                    const isChecked = permissions.includes(perm.id);
                    const Icon = perm.icon;

                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => togglePermission(perm.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-sky-600/15 border-sky-500/60 ring-1 ring-sky-500/20'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            : 'bg-[#121820] border-[#1C2631] hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-sky-600 border-sky-500 text-white'
                            : isLight ? 'border-slate-400' : 'border-neutral-600'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-sky-400' : 'text-slate-400'}`} />
                            <span className={`text-xs font-bold leading-tight ${
                              isChecked ? (isLight ? 'text-sky-900' : 'text-white') : (isLight ? 'text-slate-700' : 'text-slate-300')
                            }`}>
                              {perm.label}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {perm.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C2631]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isLight ? 'border-slate-300 hover:bg-slate-100' : 'border-[#1C2631] hover:bg-neutral-800'
                  }`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0C2340] via-[#0E2A4D] to-[#0A1E37] hover:from-[#0E2A4D] hover:to-[#133763] text-white font-bold text-xs shadow-md shadow-[#0C2340]/40 border-0 transition-all active:scale-95 cursor-pointer"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Cadastrar Operador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
