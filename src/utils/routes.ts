/**
 * Roteamento Inteligente e URLs Rigorosas para Nuvi SaaS
 * 
 * Regras Estritas:
 * - /                         -> Site Oficial / Cadastro de Novos Comerciantes (Teste Grátis)
 * - /acesso_master            -> ÚNICO link exclusivo do Administrador Geral (Master)
 * - /acesso_lojista           -> Login Único de Comerciantes (WhatsApp + Senha)
 * - /:slug/cardapio ou /:slug -> Vitrine Pública & Cardápio da Loja ESPECÍFICA (ex: /donana/cardapio)
 * - /:slug/painel             -> Painel & PDV daquela Loja ESPECÍFICA (ex: /donana/painel)
 * - Links com estabelecimentos excluídos ou inexistentes (ex: /pesqueiro-ademar/painel ou /loja/cardapio)
 *   NUNCA devem exibir dados de outra loja! Retornam 'not_found' com tela 404 dedicada.
 */

import { ViewRole, Tenant } from '../types';

export interface RouteResolution {
  role: ViewRole;
  tenantSlugOrId?: string;
  isMaster: boolean;
  tenantNotFound?: boolean;
  requestedSlug?: string;
}

export const OFFICIAL_PLATFORM_ORIGIN = 'https://nuvi-saas.web.app';

/**
 * Palavras reservadas do sistema que NUNCA podem ser tratadas como slug de loja
 */
export const RESERVED_SYSTEM_WORDS = [
  'portal',
  'acesso_master',
  'acesso_lojista',
  'cadastro',
  'criar_loja',
  'login',
  'admin',
  'master'
];

/**
 * Busca RÍGIDA e SEGURA de Loja por Slug, ID ou Nome
 * Não permite correspondência frouxa que cause vazamento de dados entre lojistas.
 */
export function findTenantBySlugOrId(tenants: Tenant[], query?: string): Tenant | undefined {
  if (!query || !tenants || tenants.length === 0) return undefined;
  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9]/g, '');
  if (!cleanQ) return undefined;

  // Se for palavra reservada do sistema, rejeita imediatamente
  if (RESERVED_SYSTEM_WORDS.includes(q) || RESERVED_SYSTEM_WORDS.includes(cleanQ)) {
    return undefined;
  }

  // 1. Busca exata por ID ou por Slug
  let match = tenants.find((t) => {
    const tId = (t.id || '').toLowerCase().trim();
    const tSlug = (t.slug || '').toLowerCase().trim();
    return tId === q || tSlug === q;
  });
  if (match) return match;

  // 2. Busca exata normalizada (remove hífens e caracteres especiais)
  match = tenants.find((t) => {
    const cleanId = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSlug = (t.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanId === cleanQ || cleanSlug === cleanQ;
  });
  if (match) return match;

  // 3. Busca por base sem sufixo numérico (ex: "donana" bate com slug "donana-3623-3624")
  // Apenas correspondência EXATA da base, sem startsWith genérico
  const baseQ = cleanQ.replace(/-\d+.*$/, '');
  match = tenants.find((t) => {
    const s = (t.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const id = (t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const baseSlug = s.replace(/\d+.*$/, '');
    const baseId = id.replace(/\d+.*$/, '');

    return (
      (baseSlug.length >= 3 && (baseSlug === cleanQ || baseSlug === baseQ)) ||
      (baseId.length >= 3 && (baseId === cleanQ || baseId === baseQ))
    );
  });
  if (match) return match;

  // 4. Busca por nome completo do estabelecimento (EXATA normalizada, sem acentos)
  match = tenants.find((t) => {
    const cleanName = (t.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    return cleanName.length >= 3 && cleanName === cleanQ;
  });
  if (match) return match;

  return undefined;
}

export function parseCurrentRoute(tenants: Tenant[]): RouteResolution {
  if (typeof window === 'undefined') {
    return { role: 'super_admin', isMaster: true };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const port = window.location.port;
  const cleanPath = pathname.toLowerCase();

  // 1. Acesso Master EXCLUSIVO do Administrador Geral da Plataforma (/acesso_master)
  // REGRA DO USUÁRIO: Apenas /acesso_master abre o Master. Nenhum outro link (como /painel) deve abrir o Master!
  if (cleanPath === '/acesso_master' || cleanPath.startsWith('/acesso_master')) {
    return { role: 'super_admin', isMaster: true };
  }

  // 2. Acesso do Lojista (/acesso_lojista ou /login)
  if (cleanPath === '/acesso_lojista' || cleanPath === '/login' || cleanPath === '/lojista') {
    return { role: 'login_tenant', isMaster: false };
  }

  // 3. /painel, /admin, /portal soltos (sem slug de loja):
  // Se houver uma loja ativa salva, restaura para o painel dela; caso contrário vai para login
  if (
    cleanPath === '/painel' || 
    cleanPath === '/admin' || 
    cleanPath === '/portal' || 
    cleanPath === '/master'
  ) {
    try {
      const savedTenantId = localStorage.getItem('adegasaas_current_tenant_id') || localStorage.getItem('nuvi_auth_tenant_id');
      if (savedTenantId) {
        const found = findTenantBySlugOrId(tenants, savedTenantId);
        if (found) {
          return {
            role: 'tenant_admin',
            tenantSlugOrId: found.id,
            isMaster: false,
            tenantNotFound: false
          };
        }
      }
    } catch { }
    return { role: 'login_tenant', isMaster: false };
  }

  // 4. /cardapio ou /vitrine soltos: restaura loja ativa ou vai para início
  if (cleanPath === '/cardapio' || cleanPath === '/vitrine') {
    try {
      const savedTenantId = localStorage.getItem('adegasaas_current_tenant_id');
      if (savedTenantId) {
        const found = findTenantBySlugOrId(tenants, savedTenantId);
        if (found) {
          return {
            role: 'storefront',
            tenantSlugOrId: found.id,
            isMaster: false,
            tenantNotFound: false
          };
        }
      }
    } catch { }
    return { role: 'register_tenant', isMaster: false };
  }

  // 4. Cadastro de Novos Lojistas (Página Principal ou /cadastro)
  if (cleanPath === '/cadastro' || cleanPath === '/criar_loja') {
    return { role: 'register_tenant', isMaster: false };
  }

  // 5. Tratamento de portas locais de desenvolvimento:
  if (cleanPath === '/' || cleanPath === '') {
    if (port === '3005') {
      return { role: 'super_admin', isMaster: true };
    }
    if (port === '3006') {
      return { role: 'tenant_admin', isMaster: false };
    }
    return { role: 'register_tenant', isMaster: false };
  }

  // 6. Rotas Dinâmicas de Lojas: /:slug/cardapio, /:slug/vitrine ou /:slug/painel
  const parts = cleanPath.split('/').filter(Boolean);
  if (parts.length >= 1) {
    const slug = parts[0];
    const subRoute = parts[1] || '';

    // Se o primeiro segmento for palavra reservada (como /loja/cardapio, /cardapio, /vitrine):
    // Isso NÃO é um comércio cadastrado! Retorna NOT_FOUND imediatamente!
    if (RESERVED_SYSTEM_WORDS.includes(slug)) {
      return {
        role: 'not_found',
        tenantNotFound: true,
        requestedSlug: slug,
        isMaster: false
      };
    }

    // Busca rígida do estabelecimento
    const found = findTenantBySlugOrId(tenants, slug);

    // SE NÃO ENCONTRAR O ESTABELECIMENTO (ex: pesqueiro-ademar que foi excluído):
    // NUNCA fazer fallback na loja de outro lojista! Retorna NOT_FOUND!
    if (!found) {
      return {
        role: 'not_found',
        tenantNotFound: true,
        requestedSlug: slug,
        isMaster: false
      };
    }

    // SE ENCONTROU A LOJA:
    if (subRoute === 'painel') {
      return {
        role: 'tenant_admin',
        tenantSlugOrId: found.id,
        isMaster: false,
        tenantNotFound: false
      };
    }

    return {
      role: 'storefront',
      tenantSlugOrId: found.id,
      isMaster: false,
      tenantNotFound: false
    };
  }

  // Fallback seguro: Cadastro / Página Inicial
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
