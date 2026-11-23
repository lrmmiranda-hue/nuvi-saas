/**
 * Roteamento Inteligente e URLs Amigáveis para Nuvi SaaS
 * 
 * Exemplos de Rotas:
 * - /                         -> Site Oficial / Cadastro de Novos Comerciantes
 * - /acesso_master            -> Portal do Dono do SaaS (Administrador Geral)
 * - /acesso_lojista           -> Login Único de Comerciantes (WhatsApp + Senha)
 * - /:slug/cardapio ou /:slug -> Vitrine Pública & Cardápio da Loja (ex: /donana/cardapio)
 * - /:slug/painel             -> Painel & PDV daquela Loja (ex: /donana/painel)
 */

import { ViewRole, Tenant } from '../types';

export interface RouteResolution {
  role: ViewRole;
  tenantSlugOrId?: string;
  isMaster: boolean;
}

export const OFFICIAL_PLATFORM_ORIGIN = 'https://nuvi-saas.web.app';

/**
 * Busca inteligente de Loja por Slug, ID ou Nome
 * Suporta correspondência exata, variações com/sem hífens e sufixos numéricos
 */
export function findTenantBySlugOrId(tenants: Tenant[], query?: string): Tenant | undefined {
  if (!query || !tenants || tenants.length === 0) return undefined;
  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9]/g, '');
  if (!cleanQ) return undefined;

  // 1. Busca exata por ID ou por Slug
  let match = tenants.find((t) => {
    const tId = (t.id || '').toLowerCase().trim();
    const tSlug = (t.slug || '').toLowerCase().trim();
    return tId === q || tSlug === q;
  });
  if (match) return match;

  // 2. Busca exata normalizada (remove hífens, pontuações e acentos)
  match = tenants.find((t) => {
    const cleanId = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSlug = (t.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanId === cleanQ || cleanSlug === cleanQ;
  });
  if (match) return match;

  // 3. Busca por base sem sufixo numérico (ex: "donana" bate com "donana-3623" ou "donana-3623-3624")
  const baseQ = q.replace(/-\d+.*$/, '').replace(/[^a-z0-9]/g, '');
  match = tenants.find((t) => {
    const s = (t.slug || '').toLowerCase();
    const id = (t.id || '').toLowerCase();
    const cleanS = s.replace(/[^a-z0-9]/g, '');
    const baseSlug = s.replace(/-\d+.*$/, '').replace(/[^a-z0-9]/g, '');
    const baseId = id.replace(/-\d+.*$/, '').replace(/[^a-z0-9]/g, '');

    return (
      (baseSlug && baseSlug === cleanQ) ||
      (baseSlug && baseSlug === baseQ) ||
      (baseId && baseId === cleanQ) ||
      (baseId && baseId === baseQ) ||
      cleanS.startsWith(cleanQ) ||
      cleanQ.startsWith(cleanS)
    );
  });
  if (match) return match;

  // 4. Busca por nome do estabelecimento (ex: "donana" bate com "Donana")
  match = tenants.find((t) => {
    const cleanName = (t.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    return cleanName === cleanQ || cleanName.startsWith(cleanQ) || cleanQ.startsWith(cleanName);
  });
  if (match) return match;

  return undefined;
}

export function parseCurrentRoute(tenants: Tenant[]): RouteResolution {
  if (typeof window === 'undefined') {
    return { role: 'super_admin', isMaster: true };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const urlParams = new URLSearchParams(window.location.search);
  const port = window.location.port;

  // 1. Suporte por parâmetros de busca (query params)
  const portalParam = urlParams.get('portal')?.toLowerCase();
  const lojaParam = urlParams.get('loja') || urlParams.get('vitrine');
  const painelParam = urlParams.get('painel');

  if (portalParam === 'master' || portalParam === 'admin') {
    return { role: 'super_admin', isMaster: true };
  }

  if (lojaParam) {
    const matched = findTenantBySlugOrId(tenants, lojaParam);
    return { role: 'storefront', tenantSlugOrId: matched ? matched.id : lojaParam, isMaster: false };
  }

  if (painelParam) {
    const matched = findTenantBySlugOrId(tenants, painelParam);
    return { role: 'tenant_admin', tenantSlugOrId: matched ? matched.id : painelParam, isMaster: false };
  }

  // 2. Rotas Limpas
  const cleanPath = pathname.toLowerCase();

  // Acesso Master do Dono da Plataforma (/portal ou /acesso_master)
  if (cleanPath === '/portal' || cleanPath === '/acesso_master' || cleanPath === '/admin' || cleanPath === '/master') {
    return { role: 'super_admin', isMaster: true };
  }

  // Acesso Padrão para todos os Lojistas
  if (cleanPath === '/acesso_lojista' || cleanPath === '/login' || cleanPath === '/lojista') {
    return { role: 'login_tenant', isMaster: false };
  }

  // Cadastro de Novos Lojistas (Página Principal ou /cadastro)
  if (cleanPath === '/cadastro' || cleanPath === '/criar_loja') {
    return { role: 'register_tenant', isMaster: false };
  }

  // Tratamento de portas locais de desenvolvimento:
  // Se estiver na raiz ('/' ou vazio):
  // Porta 3005 abre Super Admin (Master)
  // Porta 3006 abre Loja
  if (cleanPath === '/' || cleanPath === '') {
    if (port === '3005') {
      return { role: 'super_admin', isMaster: true };
    }
    if (port === '3006') {
      return { role: 'tenant_admin', isMaster: false };
    }
    return { role: 'register_tenant', isMaster: false };
  }

  // Rotas Dinâmicas de Lojas: /:slug/cardapio, /:slug/vitrine ou /:slug/painel
  const parts = cleanPath.split('/').filter(Boolean);
  if (parts.length >= 1) {
    const slug = parts[0];
    const subRoute = parts[1] || '';

    // Ignora rotas especiais do sistema
    if (!['acesso_master', 'acesso_lojista', 'cadastro', 'criar_loja'].includes(slug)) {
      const found = findTenantBySlugOrId(tenants, slug);
      const targetSlug = found ? found.id : slug;

      if (subRoute === 'painel' || subRoute === 'admin') {
        return { role: 'tenant_admin', tenantSlugOrId: targetSlug, isMaster: false };
      }
      return { role: 'storefront', tenantSlugOrId: targetSlug, isMaster: false };
    }
  }

  // Fallback padrão
  if (port === '3005') {
    return { role: 'super_admin', isMaster: true };
  }
  return { role: 'register_tenant', isMaster: false };
}

/**
 * Gera links limpos e oficiais para compartilhar com lojistas e clientes.
 * Sempre utiliza o domínio oficial https://nuvi-saas.web.app
 */
export function buildStoreUrl(type: 'cardapio' | 'painel' | 'cadastro' | 'master' | 'login_lojista', tenantSlugOrId?: string): string {
  const origin = OFFICIAL_PLATFORM_ORIGIN;

  switch (type) {
    case 'master':
      return `${origin}/acesso_master`;
    case 'login_lojista':
      return `${origin}/acesso_lojista`;
    case 'cadastro':
      return `${origin}/`;
    case 'cardapio':
      return tenantSlugOrId ? `${origin}/${tenantSlugOrId}/cardapio` : origin;
    case 'painel':
      return tenantSlugOrId ? `${origin}/${tenantSlugOrId}/painel` : `${origin}/acesso_lojista`;
    default:
      return origin;
  }
}
