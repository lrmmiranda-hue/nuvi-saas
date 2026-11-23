/**
 * Utilitário para detecção e isolamento de ambientes por Porta / Subdomínio
 * 
 * - Porta 3005: Painel Master Geral (Dono da Plataforma Nuvi SaaS)
 * - Porta 3006: Portal do Lojista & Vitrine Online do Cardápio
 */

export type PortalMode = 'master' | 'tenant';

export function detectPortalMode(): PortalMode {
  if (typeof window === 'undefined') return 'master';

  // 1. Suporte a parâmetro na URL para navegação (?portal=master ou ?portal=tenant ou ?loja=slug)
  const urlParams = new URLSearchParams(window.location.search);
  const portalParam = urlParams.get('portal')?.toLowerCase();
  if (portalParam === 'master' || portalParam === 'admin') return 'master';
  if (portalParam === 'tenant' || portalParam === 'lojista' || portalParam === 'vitrine' || urlParams.has('loja') || urlParams.has('tenant')) return 'tenant';

  // 2. Detecção automática baseada na porta local (desenvolvimento)
  const port = window.location.port;
  if (port === '3005') return 'master';
  if (port === '3006') return 'tenant';

  // 3. Detecção baseada na rota da URL (local ou nuvisaas.web.app/portal)
  const pathname = window.location.pathname.toLowerCase();
  if (pathname === '/portal' || pathname === '/acesso_master' || pathname === '/admin' || pathname === '/master') {
    return 'master';
  }
  if (pathname === '/acesso_lojista' || pathname.includes('/cardapio') || pathname.includes('/painel') || pathname.includes('/vitrine')) {
    return 'tenant';
  }

  // Fallback padrão
  return 'tenant';
}

export function getOtherPortalUrl(target: PortalMode, tenantId?: string): string {
  if (typeof window === 'undefined') return '#';
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocal) {
    const targetPort = target === 'master' ? '3005' : '3006';
    let url = `${protocol}//${hostname}:${targetPort}`;
    if (target === 'tenant' && tenantId) {
      url += `?tenant=${tenantId}`;
    }
    return url;
  }

  // Em produção (Vercel / Nuvem): usa parâmetros limpos de navegação
  if (target === 'master') {
    return `${protocol}//${hostname}?portal=master`;
  }

  let url = `${protocol}//${hostname}?portal=tenant`;
  if (tenantId) {
    url += `&tenant=${tenantId}`;
  }
  return url;
}
