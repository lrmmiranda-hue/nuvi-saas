/**
 * Roteamento Inteligente e URLs Amigáveis para Nuvi SaaS
 * 
 * Exemplos de Rotas:
 * - /                         -> Site Oficial / Cadastro de Novos Comerciantes
 * - /acesso_master            -> Portal do Dono do SaaS (Administrador Geral)
 * - /acesso_lojista           -> Login Único de Comerciantes (WhatsApp + Senha)
 * - /:slug/cardapio ou /:slug -> Vitrine Pública & Cardápio da Loja (ex: /adegadoze/cardapio)
 * - /:slug/painel             -> Painel & PDV daquela Loja (ex: /adegadoze/painel)
 */

import { ViewRole, Tenant } from '../types';

export interface RouteResolution {
  role: ViewRole;
  tenantSlugOrId?: string;
  isMaster: boolean;
}

export function parseCurrentRoute(tenants: Tenant[]): RouteResolution {
  if (typeof window === 'undefined') {
    return { role: 'super_admin', isMaster: true };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const urlParams = new URLSearchParams(window.location.search);
  const port = window.location.port;

  // 1. Suporte legado por parâmetros de busca (query params)
  const portalParam = urlParams.get('portal')?.toLowerCase();
  const lojaParam = urlParams.get('loja') || urlParams.get('vitrine');
  const painelParam = urlParams.get('painel');

  if (portalParam === 'master' || portalParam === 'admin') {
    return { role: 'super_admin', isMaster: true };
  }

  if (lojaParam) {
    return { role: 'storefront', tenantSlugOrId: lojaParam, isMaster: false };
  }

  if (painelParam) {
    return { role: 'tenant_admin', tenantSlugOrId: painelParam, isMaster: false };
  }

  // 2. Ambiente Local de Desenvolvimento por Porta
  if (port === '3005') {
    return { role: 'super_admin', isMaster: true };
  }
  if (port === '3006') {
    return { role: 'tenant_admin', isMaster: false };
  }

  // 3. Rotas Limpas e Oficiais na Nuvem (Vercel ou Domínio Próprio)
  const cleanPath = pathname.toLowerCase();

  // Acesso Master do Dono da Plataforma
  if (cleanPath === '/acesso_master' || cleanPath === '/admin' || cleanPath === '/master') {
    return { role: 'super_admin', isMaster: true };
  }

  // Acesso Padrão para todos os Lojistas
  if (cleanPath === '/acesso_lojista' || cleanPath === '/login' || cleanPath === '/lojista') {
    return { role: 'login_tenant', isMaster: false };
  }

  // Cadastro de Novos Lojistas (Página Principal ou /cadastro)
  if (cleanPath === '/' || cleanPath === '/cadastro' || cleanPath === '/criar_loja') {
    return { role: 'register_tenant', isMaster: false };
  }

  // Rotas Dinâmicas de Lojas: /:slug/cardapio, /:slug/vitrine ou /:slug/painel
  const parts = cleanPath.split('/').filter(Boolean);
  if (parts.length >= 1) {
    const slug = parts[0];
    const subRoute = parts[1] || '';

    // Normaliza procurando a loja por slug ou ID
    const found = tenants.find((t) => {
      const tSlug = (t.slug || t.id).toLowerCase();
      const tId = t.id.toLowerCase();
      const cleanTarget = slug.replace(/[^a-z0-9]/g, '');
      return (
        tSlug === slug ||
        tId === slug ||
        tSlug.replace(/[^a-z0-9]/g, '') === cleanTarget ||
        tId.replace(/[^a-z0-9]/g, '') === cleanTarget
      );
    });

    if (found || parts.length >= 2) {
      const targetSlug = found ? found.id : slug;
      if (subRoute === 'painel' || subRoute === 'admin') {
        return { role: 'tenant_admin', tenantSlugOrId: targetSlug, isMaster: false };
      }
      return { role: 'storefront', tenantSlugOrId: targetSlug, isMaster: false };
    }
  }

  // Fallback padrão: Página de Cadastro da Nuvi SaaS
  return { role: 'register_tenant', isMaster: false };
}

/**
 * Gera links limpos e oficiais para compartilhar com lojistas e clientes
 */
export function buildStoreUrl(type: 'cardapio' | 'painel' | 'cadastro' | 'master' | 'login_lojista', tenantSlugOrId?: string): string {
  if (typeof window === 'undefined') return '/';
  const origin = window.location.origin;

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
