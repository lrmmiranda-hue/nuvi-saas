import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreUsersManager } from './StoreUsersManager';
import { StoreBrandingSettings } from './StoreBrandingSettings';
import { TableQRCodeModal } from './TableQRCodeModal';
import {
  Building2,
  Sliders,
  QrCode,
  Users,
  Settings as SettingsIcon,
  Store,
  Sparkles,
  Barcode,
  UtensilsCrossed,
  LayoutGrid,
  List,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Printer,
  Moon,
  Sun,
  MapPin,
  Clock,
  Phone,
  FileText,
  User,
  CreditCard,
  Banknote,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Lock,
  Info,
  Palette,
  Send,
  LogOut
} from 'lucide-react';

interface StoreSettingsViewProps {
  isLight: boolean;
}

type SettingsSubmenuTab = 'cadastrais' | 'visual' | 'whatsapp' | 'layout' | 'pix_pagamentos' | 'usuarios';

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({ isLight }) => {
  const {
    currentTenant,
    updateTenant,
    themeMode,
    setThemeMode,
    showAlert,
    logoutTenant,
    setViewRole,
    generateWhatsAppDirectChatUrl
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubmenuTab>('cadastrais');

  // Form states de dados cadastrais
  const [storeNameEdit, setStoreNameEdit] = useState(currentTenant?.name || '');
  const [sloganEdit, setSloganEdit] = useState(currentTenant?.slogan || '');
  const [ownerNameEdit, setOwnerNameEdit] = useState(currentTenant?.ownerName || '');
  const [ownerPhoneEdit, setOwnerPhoneEdit] = useState(currentTenant?.ownerPhone || '');
  const [ownerEmailEdit, setOwnerEmailEdit] = useState(currentTenant?.ownerEmail || '');
  const [documentEdit, setDocumentEdit] = useState(currentTenant?.document || '');

  // Form states de endereço e raio
  const [addressEdits, setAddressEdits] = useState(currentTenant?.address || {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip: '',
    deliveryRadiusKm: 5,
    minimumOrder: 20,
    standardDeliveryFee: 5,
    freeDeliveryThreshold: 80,
    allowPickup: true,
    openingHours: 'Seg a Sáb: 10h às 23h | Dom: 10h às 18h',
  });

  // Form states de regras operacionais & pagamentos
  const [configEdits, setConfigEdits] = useState(currentTenant?.config || {
    enablePhysicalStore: true,
    enableOnlineSales: true,
    enableBarcodeScanner: true,
    enableMenuOnlyMode: false,
    enableTableService: false,
    tableCount: 12,
    serviceFeePercentage: 10,
    catalogLayout: 'grid' as const,
    pixKey: '',
    acceptPix: true,
    acceptCard: true,
    acceptCash: true,
    allowOrdersWhenClosed: false,
    soundAlerts: true,
  });

  const [isTableQRCodeModalOpen, setIsTableQRCodeModalOpen] = useState(false);

  // Form states de WhatsApp
  const [whatsAppEdits, setWhatsAppEdits] = useState(currentTenant?.whatsapp || {
    phoneNumber: '',
    enableWhatsAppOrders: true,
    orderTemplate: '',
    statusUpdateTemplate: '',
    welcomeMessage: '',
    supportLinkEnabled: true,
  });

  // Form states do PIX
  const [pixKeyEdit, setPixKeyEdit] = useState(currentTenant?.config?.pixKey || '');
  const [pixKeyTypeEdit, setPixKeyTypeEdit] = useState<'cnpj' | 'cpf' | 'telefone' | 'email' | 'aleatoria'>('cnpj');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedMenuUrl, setCopiedMenuUrl] = useState(false);

  const activeAccent = currentTenant?.branding?.accentColor || '#38bdf8';
  const isPhysicalEnabled = configEdits.enablePhysicalStore ?? currentTenant?.config?.enablePhysicalStore ?? true;
  const isOnlineEnabled = configEdits.enableOnlineSales ?? currentTenant?.config?.enableOnlineSales ?? true;
  const isBarcodeScannerEnabled = configEdits.enableBarcodeScanner ?? currentTenant?.config?.enableBarcodeScanner ?? true;

  // URLs para QR Codes
  const menuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/loja/${currentTenant?.slug || currentTenant?.id}`
    : `https://nuvi-saas.web.app/loja/${currentTenant?.slug || currentTenant?.id}`;

  const qrCodeMenuUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}&margin=10`;
  const qrCodePixDemoUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `00020126580014br.gov.bcb.pix0136${pixKeyEdit || '00000000000'}5204000053039865802BR5925${currentTenant?.name || 'Comercio'}6009SAO PAULO62070503***6304`
  )}&margin=10`;

  const handleCopyPix = () => {
    if (!pixKeyEdit.trim()) return;
    navigator.clipboard.writeText(pixKeyEdit.trim());
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyMenuUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopiedMenuUrl(true);
    setTimeout(() => setCopiedMenuUrl(false), 2500);
  };

  const handleSaveAll = () => {
    if (!currentTenant) return;

    updateTenant(currentTenant.id, {
      name: storeNameEdit,
      slogan: sloganEdit,
      ownerName: ownerNameEdit,
      ownerPhone: ownerPhoneEdit,
      ownerEmail: ownerEmailEdit,
      document: documentEdit,
      config: {
        ...currentTenant.config,
        ...configEdits,
        pixKey: pixKeyEdit.trim(),
      },
      whatsapp: {
        ...currentTenant.whatsapp,
        ...whatsAppEdits,
      },
      address: {
        ...currentTenant.address,
        ...addressEdits,
      },
    });

    showAlert({
      title: 'Configurações Salvas',
      message: 'Todas as alterações foram salvas e sincronizadas com sucesso!',
      variant: 'success',
    });
  };

  const SUBMENU_ITEMS: { id: SettingsSubmenuTab; label: string; desc: string; icon: any; badge?: string }[] = [
    {
      id: 'cadastrais',
      label: 'Dados Cadastrais & Loja',
      desc: 'Nome, CNPJ, responsável, horários e endereço',
      icon: Building2
    },
    {
      id: 'visual',
      label: 'Visual, Cores & Vitrine',
      desc: 'Cores da marca, flyer de fundo, logo e vitrine',
      icon: Palette
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp & Mensagens',
      desc: 'Pedidos automáticos, templates e número',
      icon: MessageSquare
    },
    {
      id: 'layout',
      label: 'Layout & Visual do Sistema',
      desc: 'Físico/online, estilo de cardápio e modo escuro',
      icon: Sliders
    },
    {
      id: 'pix_pagamentos',
      label: 'Chave PIX & Pagamentos',
      desc: 'Chave PIX do caixa, QR Code das mesas e formas de pagamento',
      icon: QrCode
    },
    {
      id: 'usuarios',
      label: 'Usuários & Permissões',
      desc: 'Cadastrar funcionários, PIN e travar telas por função',
      icon: Users,
      badge: 'Equipe'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Topo Geral da Janela de Configurações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1C2631]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Configurações da Loja
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 border border-sky-500/30">
              Painel Geral
            </span>
          </div>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Navegue pelas categorias na lateral esquerda para gerenciar dados cadastrais, visual, chave PIX e usuários da loja.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="nuvi-btn-cyber-blue flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md border-0 transition-all active:scale-95 cursor-pointer shrink-0 text-white"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>

      {/* Grid Principal: Submenu Lateral Esquerdo (4 cols) + Conteúdo (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* SUBMENU LATERAL ESQUERDO */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 w-full space-y-2 lg:sticky lg:top-4">
          <div className={`p-2.5 rounded-2xl border space-y-1.5 ${
            isLight ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
          }`}>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 text-slate-400 block">
              Menu de Configurações
            </span>

            {SUBMENU_ITEMS.map((item) => {
              const isSelected = activeSubTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border-0 ring-0 outline-none ${
                    isSelected
                      ? 'nuvi-btn-cyber-blue text-white shadow-md'
                      : isLight
                      ? 'hover:bg-slate-200/60 text-slate-700'
                      : 'hover:bg-[#151D24] text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected
                        ? isLight
                          ? 'bg-white/20 text-white'
                          : 'bg-[#16365c] text-sky-300'
                        : isLight
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-neutral-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold block truncate ${
                          isSelected ? 'text-white font-extrabold' : ''
                        }`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] block line-clamp-1 leading-snug mt-0.5 ${
                        isSelected ? 'text-sky-200 opacity-90' : 'text-slate-400'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Card Resumo do Estabelecimento & Ação Sair */}
          <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#0B0F14] border-[#1C2631] text-slate-400'
          }`}>
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Store className="w-4 h-4 text-sky-500" />
              <span>{currentTenant?.name}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              ID: <span className="font-mono">{currentTenant?.id}</span> • Slug: <span className="font-mono">/{currentTenant?.slug}</span>
            </p>

            {/* Botão Sair da Loja integrado no menu de configurações */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#1C2631]">
              <button
                type="button"
                onClick={() => {
                  logoutTenant();
                  setViewRole('login_tenant');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 transition-all cursor-pointer"
                title="Encerrar sessão deste estabelecimento"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Loja (Logout)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ÁREA DE CONTEÚDO PRINCIPAL (DIREITA) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 w-full space-y-6">

          {/* ======================================================== */}
          {/* 1. SUB-ABA: DADOS CADASTRAIS & EMPRESA */}
          {/* ======================================================== */}
          {activeSubTab === 'cadastrais' && (
            <div className="space-y-6">
              {/* Informações Básicas da Empresa */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Building2 className="w-4 h-4 text-sky-500" />
                  <span>1. Dados Cadastrais do Estabelecimento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold block mb-1">Nome Fantasia do Comércio *</label>
                    <input
                      type="text"
                      required
                      value={storeNameEdit}
                      onChange={(e) => setStoreNameEdit(e.target.value)}
                      placeholder="Ex: Adega Imperial"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Slogan / Proposta de Valor</label>
                    <input
                      type="text"
                      value={sloganEdit}
                      onChange={(e) => setSloganEdit(e.target.value)}
                      placeholder="Ex: Vinhos, destilados e cervejas 24h"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Nome do Responsável / Proprietário</label>
                    <input
                      type="text"
                      value={ownerNameEdit}
                      onChange={(e) => setOwnerNameEdit(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">CNPJ ou CPF da Empresa</label>
                    <input
                      type="text"
                      value={documentEdit}
                      onChange={(e) => setDocumentEdit(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">WhatsApp de Atendimento da Loja *</label>
                    <input
                      type="tel"
                      value={ownerPhoneEdit}
                      onChange={(e) => setOwnerPhoneEdit(e.target.value)}
                      placeholder="Ex: 11999998888"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      value={ownerEmailEdit}
                      onChange={(e) => setOwnerEmailEdit(e.target.value)}
                      placeholder="contato@loja.com.br"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Endereço & Horário de Funcionamento */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <span>2. Localização, Horários & Raio de Atendimento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-bold block mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      value={addressEdits.street}
                      onChange={(e) => setAddressEdits({ ...addressEdits, street: e.target.value })}
                      placeholder="Av. Paulista"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Número</label>
                    <input
                      type="text"
                      value={addressEdits.number}
                      onChange={(e) => setAddressEdits({ ...addressEdits, number: e.target.value })}
                      placeholder="1500"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Bairro</label>
                    <input
                      type="text"
                      value={addressEdits.neighborhood}
                      onChange={(e) => setAddressEdits({ ...addressEdits, neighborhood: e.target.value })}
                      placeholder="Bela Vista"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Cidade</label>
                    <input
                      type="text"
                      value={addressEdits.city}
                      onChange={(e) => setAddressEdits({ ...addressEdits, city: e.target.value })}
                      placeholder="São Paulo"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">CEP</label>
                    <input
                      type="text"
                      value={addressEdits.zip}
                      onChange={(e) => setAddressEdits({ ...addressEdits, zip: e.target.value })}
                      placeholder="01310-200"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-bold block mb-1">Horário de Funcionamento (Visível aos Clientes)</label>
                    <input
                      type="text"
                      value={addressEdits.openingHours}
                      onChange={(e) => setAddressEdits({ ...addressEdits, openingHours: e.target.value })}
                      placeholder="Seg a Dom: 10h às 23h"
                      className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-sky-500 ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SUB-ABA: LAYOUT & VISUAL DO SISTEMA */}
          {/* ======================================================== */}
          {activeSubTab === 'layout' && (
            <div className="space-y-6">
              {/* Modelo Operacional (Físico vs Online) */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Store className="w-4 h-4 text-sky-500" />
                  <span>Modelo Operacional da Loja</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Toggle Venda Balcão */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div>
                      <span className="font-bold block">Frente de Caixa (PDV Balcão)</span>
                      <span className="text-[10px] text-slate-400">Ativar vendas rápidas no balcão e mesas</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configEdits.enablePhysicalStore ?? true}
                      onChange={(e) => setConfigEdits({ ...configEdits, enablePhysicalStore: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Toggle Vendas Online / Vitrine */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div>
                      <span className="font-bold block">Vitrine & Cardápio Digital Online</span>
                      <span className="text-[10px] text-slate-400">Permitir pedidos pelo link/WhatsApp</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configEdits.enableOnlineSales ?? true}
                      onChange={(e) => setConfigEdits({ ...configEdits, enableOnlineSales: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Toggle Leitor Código de Barras */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between sm:col-span-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-sky-500" />
                      <div>
                        <span className="font-bold block">Leitor de Código de Barras USB / Bluetooth</span>
                        <span className="text-[10px] text-slate-400">Bipar produtos instantaneamente no PDV</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={configEdits.enableBarcodeScanner ?? true}
                      onChange={(e) => setConfigEdits({ ...configEdits, enableBarcodeScanner: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Toggle Atendimento em Mesas & Comandas (Dine-in) */}
                  <div className={`p-4 rounded-xl border space-y-3 sm:col-span-2 ${
                    configEdits.enableTableService
                      ? isLight ? 'bg-sky-50 border-sky-300' : 'bg-sky-950/20 border-sky-500/40'
                      : isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-sky-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold block text-xs sm:text-sm">
                              Atendimento em Mesas & Comandas (Dine-in)
                            </span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-500">
                              Restaurante & Bar
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Ao ativar, os pedidos feitos no salão indicam a Mesa e vão direto para a Cozinha sem WhatsApp, acumulando na conta da mesa para recebimento no caixa.
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={configEdits.enableTableService ?? false}
                        onChange={(e) => setConfigEdits({ ...configEdits, enableTableService: e.target.checked })}
                        className="w-5 h-5 rounded text-sky-500 cursor-pointer"
                      />
                    </div>

                    {configEdits.enableTableService && (
                      <div className="pt-3 border-t border-sky-200 dark:border-sky-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            Mesas no Salão:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={configEdits.tableCount || 12}
                            onChange={(e) => setConfigEdits({ ...configEdits, tableCount: Math.max(1, parseInt(e.target.value) || 1) })}
                            className={`w-20 px-2.5 py-1 rounded-lg text-xs font-bold border outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0B0F14] border-[#1C2631] text-white'
                            }`}
                          />
                          <span className="text-xs text-slate-400">mesas ativas</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsTableQRCodeModalOpen(true)}
                          className="nuvi-btn-cyber-blue flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer hover:brightness-110 shrink-0 text-white"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Imprimir Plaquinhas QR Code das Mesas</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modelo de Exibição dos Itens (Grade vs Lista) */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Sliders className="w-4 h-4 text-sky-500" />
                    <span>Estilo Visual da Vitrine & Cardápio</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Como seus clientes visualizarão os produtos na vitrine digital.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfigEdits({ ...configEdits, catalogLayout: 'grid' })}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      (configEdits.catalogLayout || 'grid') === 'grid'
                        ? 'border-sky-500 bg-sky-500/10'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-sky-500" />
                        <span className="font-bold text-xs">Grade com Fotos Grandes</span>
                      </div>
                      {(configEdits.catalogLayout || 'grid') === 'grid' && (
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Ideal para adegas, empórios e conveniências com fotos em destaque.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfigEdits({ ...configEdits, catalogLayout: 'list' })}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      configEdits.catalogLayout === 'list'
                        ? 'border-sky-500 bg-sky-500/10'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4 text-sky-500" />
                        <span className="font-bold text-xs">Lista Compacta com Miniatura</span>
                      </div>
                      {configEdits.catalogLayout === 'list' && (
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Ideal para cardápios rápidos estilo restaurante, lanchonete e delivery.
                    </p>
                  </button>
                </div>
              </div>

              {/* Tema de Cores do Painel do Lojista */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Moon className="w-4 h-4 text-sky-500" />
                  <span>Modo de Exibição do Painel (Tema Claro / Escuro)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      themeMode === 'dark'
                        ? 'border-sky-500 bg-[#0C2340]/40 ring-1 ring-sky-500/30'
                        : 'border-[#1C2631] bg-[#121820]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-sky-400" />
                      <div>
                        <span className="font-bold text-xs text-white block">Tema Escuro (Dark Carbon)</span>
                        <span className="text-[10px] text-slate-400">Recomendado para balcão e menor cansaço</span>
                      </div>
                    </div>
                    {themeMode === 'dark' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      themeMode === 'light'
                        ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500/30 text-slate-900'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'border-[#1C2631] bg-[#121820]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-xs block">Tema Claro (Clean Light)</span>
                        <span className="text-[10px] text-slate-500">Visual clássico de escritório</span>
                      </div>
                    </div>
                    {themeMode === 'light' && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. SUB-ABA: CHAVE PIX & PAGAMENTOS */}
          {/* ======================================================== */}
          {activeSubTab === 'pix_pagamentos' && (
            <div className="space-y-6">
              {/* Configuração da Chave PIX do Caixa */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <QrCode className="w-4 h-4 text-emerald-500" />
                    <span>Configuração da Chave PIX da Frente de Caixa</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Esta chave é utilizada na tela de Venda de Balcão (PDV) para gerar o QR Code dinâmico com o valor exato no momento de finalizar a venda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  <div className="sm:col-span-4">
                    <label className="font-bold block mb-1">Tipo de Chave</label>
                    <select
                      value={pixKeyTypeEdit}
                      onChange={(e) => setPixKeyTypeEdit(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="telefone">Telefone / Celular</option>
                      <option value="email">E-mail</option>
                      <option value="aleatoria">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-8">
                    <label className="font-bold block mb-1">Chave PIX *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pixKeyEdit}
                        onChange={(e) => setPixKeyEdit(e.target.value)}
                        placeholder="Ex: 34.901.221/0001-89 ou 11999998888"
                        className={`w-full px-3 py-2 rounded-xl border font-mono outline-none focus:border-emerald-500 ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#121820] border-[#1C2631] text-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Copiar Chave PIX"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Demonstração do QR Code do PIX */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <img
                      src={qrCodePixDemoUrl}
                      alt="Demonstração QR Code PIX"
                      className="w-16 h-16 rounded-lg bg-white p-1 border shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                        ✓ QR Code PIX Ativo na Frente de Caixa
                      </span>
                      <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                        Na tela de Venda de Balcão, ao escolher PIX e clicar em "Finalizar Venda", uma janela abre na hora com o QR Code e o valor exato para o cliente escanear e pagar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code de Acesso ao Cardápio Digital (Mesas & Totens) */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <QrCode className="w-4 h-4 text-sky-500" />
                    <span>QR Code de Acesso ao Cardápio Digital (Para Colocar nas Mesas)</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Imprima ou compartilhe este QR Code nos balcões, totens e mesas do seu estabelecimento para os clientes abrirem seu cardápio pelo celular.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-slate-200 dark:border-[#1C2631]">
                  <img
                    src={qrCodeMenuUrl}
                    alt="QR Code do Cardápio das Mesas"
                    className="w-28 h-28 rounded-xl bg-white p-2 border shadow-md shrink-0"
                  />

                  <div className="space-y-2 text-xs flex-1">
                    <span className="font-bold block text-slate-900 dark:text-white">
                      Link do Cardápio Digital:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={menuUrl}
                        className={`w-full px-3 py-1.5 rounded-lg border font-mono text-[11px] ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#121820] border-[#1C2631] text-slate-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleCopyMenuUrl}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedMenuUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMenuUrl ? 'Copiado!' : 'Copiar Link'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={qrCodeMenuUrl}
                        download={`qrcode-cardapio-${currentTenant?.slug || 'loja'}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Imagem QR Code</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => window.open(qrCodeMenuUrl, '_blank')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1C2631] text-slate-700 dark:text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Abrir para Imprimir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formas de Pagamento Aceitas */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <CreditCard className="w-4 h-4 text-sky-500" />
                  <span>Formas de Pagamento Habilitadas</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold">PIX</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configEdits.acceptPix ?? true}
                      onChange={(e) => setConfigEdits({ ...configEdits, acceptPix: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-500" />
                      <span className="font-bold">Cartão (Débito & Crédito)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configEdits.acceptCard ?? true}
                      onChange={(e) => setConfigEdits({ ...configEdits, acceptCard: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-500" />
                      <span className="font-bold">Dinheiro em Espécie</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configEdits.acceptCash ?? true}
                      onChange={(e) => setConfigEdits({ ...configEdits, acceptCash: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. SUB-ABA: USUÁRIOS & PERMISSÕES (NOVO) */}
          {/* ======================================================== */}
          {activeSubTab === 'usuarios' && (
            <StoreUsersManager isLight={isLight} />
          )}

          {/* ======================================================== */}
          {/* 2. SUB-ABA: VISUAL, CORES & VITRINE */}
          {/* ======================================================== */}
          {activeSubTab === 'visual' && (
            <StoreBrandingSettings isLight={isLight} />
          )}

          {/* ======================================================== */}
          {/* 3. SUB-ABA: WHATSAPP & MENSAGENS */}
          {/* ======================================================== */}
          {activeSubTab === 'whatsapp' && (
            <div className="space-y-6">
              {/* Integração WhatsApp & Mensagens Automáticas */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#0E1318] border-[#1C2631]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1C2631]">
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>Integração WhatsApp & Mensagens Automáticas</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Configure as mensagens prontas e decida se deseja receber os pedidos diretamente no WhatsApp.
                    </p>
                  </div>

                  <a
                    href={currentTenant ? generateWhatsAppDirectChatUrl(currentTenant, 'Olá! Teste de integração do WhatsApp do Estabelecimento.') : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Testar no WhatsApp</span>
                  </a>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Toggle de Pedidos WhatsApp */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    whatsAppEdits.enableWhatsAppOrders 
                      ? isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30' 
                      : isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="enableWhatsappOrdersToggle" className={`text-xs font-bold block cursor-pointer ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          Trabalhar com Pedidos via WhatsApp
                        </label>
                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                          {whatsAppEdits.enableWhatsAppOrders
                            ? 'Pedidos geram mensagem formatada no WhatsApp da loja com endereço, troco e itens.'
                            : 'Pedidos são finalizados diretamente no sistema/painel sem envio obrigatório de mensagem.'
                          }
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="enableWhatsappOrdersToggle"
                        checked={whatsAppEdits.enableWhatsAppOrders ?? true}
                        onChange={(e) => setWhatsAppEdits({ ...whatsAppEdits, enableWhatsAppOrders: e.target.checked })}
                        className="w-5 h-5 rounded text-sky-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Número de WhatsApp da Loja */}
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Número do WhatsApp que Recebe os Pedidos *
                    </label>
                    <input
                      type="text"
                      value={whatsAppEdits.phoneNumber || ''}
                      onChange={(e) => setWhatsAppEdits({ ...whatsAppEdits, phoneNumber: e.target.value })}
                      placeholder="Ex: 5511998765432"
                      className={`w-full max-w-md px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Formato com código do país (55) + DDD + 9 dígitos sem traços ou parênteses.
                    </p>
                  </div>

                  {/* Modelo de Mensagem de Pedido Recebido */}
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Modelo de Mensagem de Pedido Recebido
                    </label>
                    <textarea
                      rows={5}
                      value={whatsAppEdits.orderTemplate || ''}
                      onChange={(e) => setWhatsAppEdits({ ...whatsAppEdits, orderTemplate: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;id_pedido&#125;</span>
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;loja&#125;</span>
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;cliente&#125;</span>
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;itens&#125;</span>
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;total&#125;</span>
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;endereco&#125;</span>
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">&#123;pagamento&#125;</span>
                    </div>
                  </div>

                  {/* Modelo de Atualização de Status */}
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Mensagem de Atualização de Status (ex: Saiu para Entrega)
                    </label>
                    <input
                      type="text"
                      value={whatsAppEdits.statusUpdateTemplate || ''}
                      onChange={(e) => setWhatsAppEdits({ ...whatsAppEdits, statusUpdateTemplate: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  {/* Mensagem de Boas-Vindas */}
                  <div>
                    <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Mensagem de Boas-Vindas
                    </label>
                    <input
                      type="text"
                      value={whatsAppEdits.welcomeMessage || ''}
                      onChange={(e) => setWhatsAppEdits({ ...whatsAppEdits, welcomeMessage: e.target.value })}
                      placeholder="Olá! Seja bem-vindo à nossa loja."
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#121820] border-[#1C2631] text-white'
                      }`}
                    />
                  </div>

                  {/* Suporte Link Flutuante */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121820] border-[#1C2631]'
                  }`}>
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Exibir Botão Flutuante de Suporte WhatsApp na Vitrine
                      </span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Permite que clientes no site cliquem para falar com você no WhatsApp
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      id="supportEnabledSettings"
                      checked={whatsAppEdits.supportLinkEnabled ?? true}
                      onChange={(e) => setWhatsAppEdits({ ...whatsAppEdits, supportLinkEnabled: e.target.checked })}
                      className="w-5 h-5 rounded text-sky-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Plaquinhas QR Code das Mesas */}
      {isTableQRCodeModalOpen && currentTenant && (
        <TableQRCodeModal
          tenant={currentTenant}
          onClose={() => setIsTableQRCodeModalOpen(false)}
          isLight={isLight}
        />
      )}
    </div>
  );
};
