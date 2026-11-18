import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Tenant, BusinessSegmentType } from '../../types';
import { BUSINESS_SEGMENTS, getSegmentById } from '../../data/businessSegments';
import { PRESET_THEMES, PRESET_BANNERS } from '../tenant/OnboardingWizardModal';
import { 
  X, 
  Building2, 
  Store, 
  Sparkles, 
  Check, 
  Lock, 
  Eye, 
  EyeOff,
  Copy,
  ExternalLink,
  CheckCircle2,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: (tenant: Tenant) => void;
}

export const NewTenantModal: React.FC<NewTenantModalProps> = ({
  isOpen,
  onClose,
  onTenantCreated,
}) => {
  const { createTenant, showAlert, themeMode } = useStore();
  const isLight = themeMode === 'light';

  const [selectedSegment, setSelectedSegment] = useState<BusinessSegmentType>('adega');
  const segmentConfig = getSegmentById(selectedSegment);

  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('São Paulo');
  const [neighborhood, setNeighborhood] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);

  // Tela de confirmação e credenciais após a criação
  const [createdTenantResult, setCreatedTenantResult] = useState<Tenant | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFinishSuccess = () => {
    if (createdTenantResult) {
      onTenantCreated(createdTenantResult);
    }
    setCreatedTenantResult(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert({
        title: 'Nome Obrigatório',
        message: 'Por favor, informe o nome comercial do cliente.',
        variant: 'warning',
      });
      return;
    }

    const theme = PRESET_THEMES[selectedThemeIndex];
    const cleanSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newTenant = createTenant({
      name: name.trim(),
      slug: cleanSlug,
      businessSegment: selectedSegment,
      slogan: slogan || segmentConfig.sloganExample,
      ownerName: ownerName || 'Proprietário',
      ownerEmail: ownerEmail || 'contato@cliente.com.br',
      ownerPhone: ownerPhone || '11999990000',
      adminPassword: password.trim() || '123456',
      plan,
      branding: {
        logoUrl: '',
        bannerUrl: segmentConfig.bannerUrl || PRESET_BANNERS[0].url,
        primaryColor: segmentConfig.primaryColor || theme.primary,
        accentColor: segmentConfig.accentColor || theme.accent,
        themeStyle: segmentConfig.themeStyle || theme.style,
        badgeNotice: segmentConfig.badgeNotice || 'Entrega expressa e atendimento direto',
        fontStyle: 'Outfit',
      },
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: neighborhood || 'Centro',
        city: city || 'São Paulo',
        state: 'SP',
        zip: '01001-000',
        deliveryRadiusKm: 10,
        minimumOrder: 30,
        standardDeliveryFee: 8.0,
        freeDeliveryThreshold: 150,
        allowPickup: true,
        openingHours: 'Seg a Sáb: 10h às 00h',
      },
      whatsapp: {
        phoneNumber: ownerPhone ? `55${ownerPhone.replace(/\D/g, '')}` : '5511999990000',
        enableWhatsAppOrders: true,
        orderTemplate: `📦 *NOVO PEDIDO - {loja}* 📦\n\n*Pedido:* #{id_pedido}\n*Cliente:* {cliente}\n*Telefone:* {telefone}\n*Tipo:* {tipo_entrega}\n\n*Itens:*\n{itens}\n\n*Subtotal:* R$ {subtotal}\n*Taxa de Entrega:* R$ {taxa_entrega}\n*TOTAL:* R$ {total}\n*Pagamento:* {pagamento}{troco_info}\n\n*Endereço:* {endereco}`,
        statusUpdateTemplate: `Olá {cliente}! Seu pedido #{id_pedido} na *{loja}* está: *{novo_status}*.`,
        welcomeMessage: `Olá! Bem-vindo à ${name}. Como posso te ajudar hoje?`,
        supportLinkEnabled: true,
      },
      onboardingCompleted: false, // will require onboarding
    });

    setCreatedTenantResult(newTenant);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${
    isLight 
      ? 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-2xs' 
      : 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
  }`;

  const labelClass = `block text-xs font-semibold mb-1 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-8 transition-colors ${
        isLight ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-[#11161B] border-[#1C2631] text-neutral-100'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0B0F12] border-[#1C2631]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                {createdTenantResult ? 'Acesso Criado com Sucesso' : 'Cadastrar Novo Estabelecimento / Lojista'}
              </h2>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {createdTenantResult ? 'Compartilhe o link do cardápio e os dados de login com o cliente' : 'Crie um novo ambiente isolado para qualquer segmento de comércio'}
              </p>
            </div>
          </div>
          <button
            onClick={createdTenantResult ? handleFinishSuccess : onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Se acabou de criar, exibe tela de credenciais com link da vitrine e senha */}
        {createdTenantResult ? (
          <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500" />
              <div>
                <h3 className="font-black text-sm">Loja Cadastrada com Sucesso!</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">
                  O comércio <strong>{createdTenantResult.name}</strong> já está ativo no sistema.
                </p>
              </div>
            </div>

            {/* Links e Acessos Oficiais */}
            <div className="space-y-3">
              {/* Link da Vitrine Online / Cardápio */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Link Oficial da Vitrine / Cardápio</span>
                  <p className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400 truncate">
                    {`https://nuvi-saas.vercel.app/${createdTenantResult.slug}/cardapio`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(`https://nuvi-saas.vercel.app/${createdTenantResult.slug}/cardapio`, 'vitrine')}
                    className="p-2 rounded-lg border text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'vitrine' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'vitrine' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <a
                    href={`/${createdTenantResult.slug}/cardapio`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir</span>
                  </a>
                </div>
              </div>

              {/* Link do Painel do Lojista */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Link de Acesso do Lojista</span>
                  <p className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400 truncate">
                    {`https://nuvi-saas.vercel.app/acesso_lojista`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(`https://nuvi-saas.vercel.app/acesso_lojista`, 'painel')}
                  className="p-2 rounded-lg border text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedField === 'painel' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'painel' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Credenciais de Login */}
              <div className={`p-3.5 rounded-xl border grid grid-cols-2 gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151D24] border-[#222E3A]'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp de Login:</span>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {createdTenantResult.ownerPhone || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Senha de Acesso:</span>
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {createdTenantResult.adminPassword || '123456'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações de Compartilhamento */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-neutral-800">
              <a
                href={`https://wa.me/55${(createdTenantResult.ownerPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá ${createdTenantResult.ownerName}! Seu estabelecimento ${createdTenantResult.name} está liberado no Nuvi SaaS:\n\n` +
                  `🌐 Sua Vitrine / Cardápio: https://nuvi-saas.vercel.app/${createdTenantResult.slug}/cardapio\n` +
                  `📱 Seu Painel de Gestão: https://nuvi-saas.vercel.app/acesso_lojista\n` +
                  `🔑 Login (WhatsApp): ${createdTenantResult.ownerPhone}\n` +
                  `🔒 Senha: ${createdTenantResult.adminPassword || '123456'}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20be5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar Acesso no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Concluir & Abrir Gestão
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Segmento de Comércio */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Segmento / Tipo de Comércio do Cliente *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BUSINESS_SEGMENTS.map((seg) => {
                const isSelected = selectedSegment === seg.id;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => {
                      setSelectedSegment(seg.id);
                      if (!slogan) setSlogan(seg.sloganExample);
                    }}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1 outline-none ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs border-transparent'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700'
                        : 'bg-[#0B0F12] hover:bg-[#161D24] border border-[#1C2631] text-neutral-300'
                    }`}
                  >
                    <span className="text-lg leading-none">{seg.emoji}</span>
                    <span className={`text-[10px] font-bold leading-tight line-clamp-1 ${
                      isSelected ? (isLight ? 'text-blue-700' : 'text-blue-400') : ''
                    }`}>
                      {seg.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Nome Fantasia do Estabelecimento ({segmentConfig.shortLabel}) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={segmentConfig.namePlaceholder}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>
                  Slogan / Proposta de Valor
                </label>
                <button
                  type="button"
                  onClick={() => setSlogan(segmentConfig.sloganExample)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Usar simulação</span>
                </button>
              </div>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder={segmentConfig.sloganExample}
                className={inputClass}
              />
              <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-950/20 border-blue-500/30 text-blue-200'
              }`}>
                <span className="truncate italic">
                  💡 Simulação para {segmentConfig.shortLabel}: "{segmentConfig.sloganExample}"
                </span>
                <button
                  type="button"
                  onClick={() => setSlogan(segmentConfig.sloganExample)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white shrink-0 cursor-pointer"
                >
                  Preencher
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Nome do Lojista / Contratante
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Marcos Paulo"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                WhatsApp do Lojista (DDD + Número) *
              </label>
              <input
                type="tel"
                required
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="11988887777"
                className={inputClass}
              />
            </div>

            {/* Senha de Acesso Inicial */}
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Senha de Acesso do Lojista (Painel & PDV) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defina a senha de acesso (padrão: 123456)"
                  className={`${inputClass} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-blue-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
                Essa é a senha que o lojista usará para entrar no painel da loja dele junto com o WhatsApp.
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Cidade
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Bairro Principal
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Pinheiros, Vila Madalena..."
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Plano Contratado do SaaS
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'starter', label: 'Starter', price: 'R$ 99/mês' },
                  { id: 'pro', label: 'Pro (Recomendado)', price: 'R$ 189/mês' },
                  { id: 'enterprise', label: 'Enterprise', price: 'R$ 299/mês' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      plan === p.id
                        ? isLight
                          ? 'border-blue-600 bg-blue-50 text-neutral-900 font-bold shadow-2xs'
                          : 'border-blue-500 bg-blue-500/15 text-white font-bold'
                        : isLight
                        ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 shadow-2xs'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-semibold">{p.label}</div>
                    <div className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{p.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Initial Theme Selection */}
          <div className={`pt-3 border-t ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
            <label className={labelClass}>
              Tema Visual Inicial da Vitrine
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((theme, idx) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedThemeIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedThemeIndex === idx
                      ? isLight
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-2xs'
                        : 'border-blue-500 bg-neutral-800 ring-1 ring-blue-500/50'
                      : isLight
                      ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs'
                      : 'border-neutral-800 bg-neutral-800/40 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-md border border-black/20 shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className={`text-xs font-medium ${isLight ? 'text-neutral-900' : 'text-white'}`}>{theme.name}</span>
                  </div>
                  {selectedThemeIndex === idx && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex items-center justify-end gap-2 pt-4 border-t ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                isLight ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md cursor-pointer"
            >
              Cadastrar Estabelecimento
            </button>
          </div>

        </form>
        )}

      </div>
    </div>
  );
};
