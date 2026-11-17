/**
 * Utilitário para detecção e isolamento de ambientes por Porta / Subdomínio
 * 
 * - Porta 3005: Painel Master Geral (Dono da Plataforma Nuvi SaaS)
 * - Porta 3006: Portal do Lojista & Vitrine Online do Cardápio
 */

export type PortalMode = 'master' | 'tenant';

export function detectPortalMode(): PortalMode {
  if (typeof window === 'undefined') return 'master';

  // 1. Suporte a parâmetro na URL para testes flexíveis (?portal=master ou ?portal=tenant)
  const urlParams = new URLSearchParams(window.location.search);
  const portalParam = urlParams.get('portal')?.toLowerCase();
  if (portalParam === 'master' || portalParam === 'admin') return 'master';
  if (portalParam === 'tenant' || portalParam === 'lojista' || portalParam === 'vitrine') return 'tenant';

  // 2. Detecção automática baseada na porta local
  const port = window.location.port;
  if (port === '3005') return 'master';
  if (port === '3006') return 'tenant';

  // 3. Fallback: Se for qualquer outra porta (ex: 5173 ou produção), verifica localStorage
  try {
    const saved = localStorage.getItem('saas_preferred_portal');
    if (saved === 'master' || saved === 'tenant') return saved;
  } catch {}

  return 'tenant';
}

export function getOtherPortalUrl(target: PortalMode, tenantId?: string): string {
  if (typeof window === 'undefined') return '#';
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const targetPort = target === 'master' ? '3005' : '3006';
  
  let url = `${protocol}//${hostname}:${targetPort}`;
  if (target === 'tenant' && tenantId) {
    url += `?tenant=${tenantId}`;
  }
  return url;
}
