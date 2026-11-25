// Gerador de Padrões Abstratos Line-Art Vetoriais por Segmento de Comércio
// Cria SVGs seamless com traços finos (outlines), elegantes e transparentes, ideais para fundos claro e escuro.

function toSvgBase64(svg: string): string {
  if (typeof window !== 'undefined' && window.btoa) {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
  }
  // Fallback seguro em ambientes sem window
  try {
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

export function getSegmentAbstractPattern(segment: string | undefined, strokeColor: string, opacity: number = 0.35): string {
  // Garante cor válida sem double-encoding
  const color = strokeColor || '#F59E0B';
  const strokeAttr = `stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${opacity}"`;

  let innerSvg = '';

  switch (segment) {
    case 'sorveteria':
      // Doodles de sorvete: casquinha, picolé, sundae, cereja, confeitos
      innerSvg = `
        <!-- Casquinha de sorvete 1 -->
        <g transform="translate(15, 10)">
          <path d="M10 20 L25 55 L40 20 Z" ${strokeAttr}/>
          <path d="M15 28 L30 45" ${strokeAttr}/>
          <path d="M35 28 L20 45" ${strokeAttr}/>
          <path d="M10 20 C7 10 18 2 25 2 C32 2 43 10 40 20" ${strokeAttr}/>
          <circle cx="25" cy="1" r="2.5" ${strokeAttr}/>
        </g>
        <!-- Picolé no palito -->
        <g transform="translate(70, 15)">
          <path d="M10 25 C10 12 28 12 28 25 L28 42 L10 42 Z" ${strokeAttr}/>
          <path d="M19 42 L19 55" ${strokeAttr}/>
          <line x1="16" y1="20" x2="16" y2="35" ${strokeAttr}/>
          <line x1="22" y1="20" x2="22" y2="35" ${strokeAttr}/>
        </g>
        <!-- Taça Sundae -->
        <g transform="translate(115, 8)">
          <path d="M8 22 C8 35 32 35 32 22 Z" ${strokeAttr}/>
          <path d="M20 35 L20 48 M12 48 L28 48" ${strokeAttr}/>
          <path d="M10 22 C10 14 16 12 20 12 C24 12 30 14 30 22" ${strokeAttr}/>
          <circle cx="20" cy="9" r="2.5" ${strokeAttr}/>
          <path d="M22 8 C25 5 28 6 30 4" ${strokeAttr}/>
        </g>
        <!-- Confeitos e estrelinhas -->
        <circle cx="60" cy="12" r="1.5" ${strokeAttr}/>
        <circle cx="110" cy="55" r="1.5" ${strokeAttr}/>
        <path d="M60 45 L64 45 M62 43 L62 47" ${strokeAttr}/>
      `;
      break;

    case 'adega':
    case 'bebidas':
      // Doodles de adega: garrafa, taça de vinho, uvas, saca-rolhas, copo com gelo
      innerSvg = `
        <!-- Garrafa de vinho -->
        <g transform="translate(15, 8)">
          <path d="M18 5 L18 16 C12 20 12 25 12 30 L12 55 L26 55 L26 30 C26 25 26 20 20 16 L20 5 Z" ${strokeAttr}/>
          <line x1="17" y1="5" x2="21" y2="5" ${strokeAttr}/>
          <rect x="14" y="34" width="10" height="12" rx="1" ${strokeAttr}/>
        </g>
        <!-- Taça de vinho -->
        <g transform="translate(62, 12)">
          <path d="M10 10 C10 26 26 26 26 10 Z" ${strokeAttr}/>
          <line x1="18" y1="26" x2="18" y2="46" ${strokeAttr}/>
          <line x1="12" y1="46" x2="24" y2="46" ${strokeAttr}/>
          <path d="M12 18 C15 21 21 21 24 18" ${strokeAttr}/>
        </g>
        <!-- Cacho de uvas -->
        <g transform="translate(105, 12)">
          <circle cx="18" cy="18" r="4" ${strokeAttr}/>
          <circle cx="26" cy="18" r="4" ${strokeAttr}/>
          <circle cx="14" cy="25" r="4" ${strokeAttr}/>
          <circle cx="22" cy="25" r="4" ${strokeAttr}/>
          <circle cx="30" cy="25" r="4" ${strokeAttr}/>
          <circle cx="18" cy="32" r="4" ${strokeAttr}/>
          <circle cx="26" cy="32" r="4" ${strokeAttr}/>
          <circle cx="22" cy="38" r="4" ${strokeAttr}/>
          <path d="M22 14 C22 8 26 7 28 5 M22 10 C18 9 16 11 15 13" ${strokeAttr}/>
        </g>
        <circle cx="55" cy="15" r="1.5" ${strokeAttr}/>
        <circle cx="95" cy="50" r="1.5" ${strokeAttr}/>
      `;
      break;

    case 'pizzaria':
      // Doodles de pizzaria: fatia de pizza, rolo de massa, forno, tomate
      innerSvg = `
        <!-- Fatia de pizza -->
        <g transform="translate(15, 10)">
          <path d="M8 12 L38 32 C26 44 14 36 8 12 Z" ${strokeAttr}/>
          <path d="M8 12 C10 7 24 9 38 32" ${strokeAttr}/>
          <circle cx="18" cy="22" r="2.5" ${strokeAttr}/>
          <circle cx="26" cy="28" r="2.5" ${strokeAttr}/>
          <circle cx="17" cy="30" r="2" ${strokeAttr}/>
        </g>
        <!-- Rolo de massa -->
        <g transform="translate(68, 18)">
          <rect x="12" y="14" width="24" height="10" rx="3" transform="rotate(-25 24 19)" ${strokeAttr}/>
          <line x1="3" y1="28" x2="10" y2="24" ${strokeAttr}/>
          <line x1="38" y1="12" x2="45" y2="8" ${strokeAttr}/>
        </g>
        <!-- Tomatinho com folha -->
        <g transform="translate(115, 18)">
          <circle cx="18" cy="22" r="10" ${strokeAttr}/>
          <path d="M18 12 C18 8 16 7 14 6 M18 10 C21 8 23 8 24 9" ${strokeAttr}/>
        </g>
        <circle cx="58" cy="12" r="1.5" ${strokeAttr}/>
        <path d="M60 45 L64 45 M62 43 L62 47" ${strokeAttr}/>
      `;
      break;

    case 'hamburgueria':
    case 'restaurante_lanchonete':
      // Doodles de lanchonete: burger, batata frita, refri com canudo
      innerSvg = `
        <!-- Hambúrguer -->
        <g transform="translate(12, 14)">
          <path d="M6 18 C6 8 32 8 32 18 Z" ${strokeAttr}/>
          <rect x="4" y="21" width="30" height="4" rx="2" ${strokeAttr}/>
          <path d="M5 28 C10 26 15 30 20 27 C25 30 30 26 33 28" ${strokeAttr}/>
          <rect x="6" y="31" width="26" height="5" rx="2.5" ${strokeAttr}/>
          <circle cx="14" cy="13" r="0.8" ${strokeAttr}/>
          <circle cx="24" cy="13" r="0.8" ${strokeAttr}/>
          <circle cx="19" cy="15" r="0.8" ${strokeAttr}/>
        </g>
        <!-- Copo com canudo -->
        <g transform="translate(65, 10)">
          <path d="M10 16 L14 48 L28 48 L32 16 Z" ${strokeAttr}/>
          <line x1="8" y1="16" x2="34" y2="16" ${strokeAttr}/>
          <line x1="21" y1="16" x2="25" y2="4" ${strokeAttr}/>
          <line x1="25" y1="4" x2="31" y2="4" ${strokeAttr}/>
        </g>
        <!-- Batata frita -->
        <g transform="translate(110, 14)">
          <path d="M8 24 L12 50 L28 50 L32 24 Z" ${strokeAttr}/>
          <rect x="11" y="8" width="3" height="18" ${strokeAttr}/>
          <rect x="16" y="5" width="3" height="21" ${strokeAttr}/>
          <rect x="21" y="7" width="3" height="19" ${strokeAttr}/>
          <rect x="26" y="11" width="3" height="15" ${strokeAttr}/>
        </g>
      `;
      break;

    case 'acai':
      // Doodles de açaí: tigela, folhas tropicais, colher, frutas
      innerSvg = `
        <!-- Tigela de açaí -->
        <g transform="translate(14, 15)">
          <path d="M6 22 C6 38 34 38 34 22 Z" ${strokeAttr}/>
          <path d="M4 22 C10 18 30 18 36 22" ${strokeAttr}/>
          <circle cx="14" cy="18" r="3" ${strokeAttr}/>
          <circle cx="22" cy="17" r="3" ${strokeAttr}/>
          <circle cx="28" cy="19" r="2.5" ${strokeAttr}/>
          <line x1="20" y1="36" x2="20" y2="44" ${strokeAttr}/>
          <line x1="12" y1="44" x2="28" y2="44" ${strokeAttr}/>
        </g>
        <!-- Folha tropical -->
        <g transform="translate(68, 12)">
          <path d="M20 5 C10 15 10 32 20 45 C30 32 30 15 20 5 Z" ${strokeAttr}/>
          <line x1="20" y1="5" x2="20" y2="52" ${strokeAttr}/>
          <line x1="20" y1="18" x2="13" y2="23" ${strokeAttr}/>
          <line x1="20" y1="28" x2="13" y2="33" ${strokeAttr}/>
          <line x1="20" y1="23" x2="27" y2="28" ${strokeAttr}/>
          <line x1="20" y1="33" x2="27" y2="38" ${strokeAttr}/>
        </g>
        <!-- Bagas de açaí -->
        <g transform="translate(118, 18)">
          <circle cx="12" cy="15" r="4.5" ${strokeAttr}/>
          <circle cx="22" cy="16" r="4.5" ${strokeAttr}/>
          <circle cx="16" cy="24" r="4.5" ${strokeAttr}/>
          <path d="M12 11 C15 7 20 7 23 11" ${strokeAttr}/>
        </g>
      `;
      break;

    case 'cafeteria':
    case 'padaria':
      // Doodles de café e padaria: xícara fumegante, grão de café, croissant, trigo
      innerSvg = `
        <!-- Xícara com vapor -->
        <g transform="translate(14, 15)">
          <path d="M8 18 C8 34 26 34 26 18 Z" ${strokeAttr}/>
          <path d="M26 21 C30 21 32 24 32 26 C32 29 29 31 26 30" ${strokeAttr}/>
          <line x1="4" y1="36" x2="30" y2="36" ${strokeAttr}/>
          <path d="M13 13 C12 10 15 8 14 5" ${strokeAttr}/>
          <path d="M20 13 C19 10 22 8 21 5" ${strokeAttr}/>
        </g>
        <!-- Grãos de café -->
        <g transform="translate(68, 18)">
          <ellipse cx="16" cy="20" rx="8" ry="11" transform="rotate(-30 16 20)" ${strokeAttr}/>
          <path d="M12 11 C16 16 14 24 20 28" ${strokeAttr}/>
          <ellipse cx="32" cy="28" rx="6" ry="8" transform="rotate(35 32 28)" ${strokeAttr}/>
          <path d="M29 22 C32 26 31 30 35 33" ${strokeAttr}/>
        </g>
        <!-- Croissant -->
        <g transform="translate(112, 16)">
          <path d="M8 28 C12 18 28 18 32 28 C30 33 26 35 20 33 C14 35 10 33 8 28 Z" ${strokeAttr}/>
          <path d="M15 21 L16 33" ${strokeAttr}/>
          <path d="M25 21 L24 33" ${strokeAttr}/>
        </g>
      `;
      break;

    case 'comida_japonesa':
      // Doodles de sushi: niguiri, rolinhos, hashi, tigela de ramen
      innerSvg = `
        <!-- Niguiri -->
        <g transform="translate(14, 18)">
          <path d="M6 18 C6 10 32 10 32 18 C32 24 6 24 6 18 Z" ${strokeAttr}/>
          <rect x="8" y="20" width="22" height="10" rx="4" ${strokeAttr}/>
          <rect x="17" y="13" width="5" height="17" ${strokeAttr}/>
        </g>
        <!-- Hashis e Hossomaki -->
        <g transform="translate(66, 14)">
          <line x1="4" y1="4" x2="38" y2="40" ${strokeAttr}/>
          <line x1="9" y1="3" x2="42" y2="35" ${strokeAttr}/>
          <circle cx="16" cy="36" r="7" ${strokeAttr}/>
          <circle cx="16" cy="36" r="3" ${strokeAttr}/>
        </g>
        <!-- Tigela de Ramen -->
        <g transform="translate(115, 16)">
          <path d="M6 18 C6 34 32 34 32 18 Z" ${strokeAttr}/>
          <line x1="4" y1="18" x2="34" y2="18" ${strokeAttr}/>
          <path d="M14 12 C13 9 16 8 15 5" ${strokeAttr}/>
          <path d="M22 12 C21 9 24 8 23 5" ${strokeAttr}/>
        </g>
      `;
      break;

    case 'confeitaria':
      // Doodles doces: cupcake, fatia de bolo, pirulito, bala
      innerSvg = `
        <!-- Cupcake -->
        <g transform="translate(14, 14)">
          <path d="M10 24 L14 44 L28 44 L32 24 Z" ${strokeAttr}/>
          <path d="M7 24 C7 14 16 10 21 10 C26 10 35 14 35 24 Z" ${strokeAttr}/>
          <circle cx="21" cy="7" r="2.5" ${strokeAttr}/>
          <line x1="16" y1="24" x2="18" y2="44" ${strokeAttr}/>
          <line x1="26" y1="24" x2="24" y2="44" ${strokeAttr}/>
        </g>
        <!-- Pirulito espiral -->
        <g transform="translate(70, 14)">
          <circle cx="20" cy="18" r="11" ${strokeAttr}/>
          <path d="M20 12 A6 6 0 0 1 20 24 A3 3 0 0 1 20 18" ${strokeAttr}/>
          <line x1="20" y1="29" x2="20" y2="48" ${strokeAttr}/>
        </g>
        <!-- Fatia de bolo com vela -->
        <g transform="translate(115, 14)">
          <path d="M6 34 L32 34 L28 20 L6 28 Z" ${strokeAttr}/>
          <line x1="16" y1="20" x2="16" y2="12" ${strokeAttr}/>
          <circle cx="16" cy="10" r="1.5" ${strokeAttr}/>
          <line x1="6" y1="30" x2="30" y2="26" ${strokeAttr}/>
        </g>
      `;
      break;

    default:
      // Gastronomia & Comércio Geral: prato com talheres, sacola de compras, estrelas, taça
      innerSvg = `
        <!-- Prato com talheres -->
        <g transform="translate(14, 15)">
          <circle cx="20" cy="22" r="12" ${strokeAttr}/>
          <circle cx="20" cy="22" r="7" ${strokeAttr}/>
          <line x1="4" y1="12" x2="4" y2="32" ${strokeAttr}/>
          <path d="M2 12 L6 12 L5 19 L3 19 Z" ${strokeAttr}/>
          <line x1="36" y1="12" x2="36" y2="32" ${strokeAttr}/>
          <path d="M34 12 C38 12 38 19 34 19 Z" ${strokeAttr}/>
        </g>
        <!-- Sacola de compras com coração -->
        <g transform="translate(68, 14)">
          <rect x="10" y="14" width="22" height="24" rx="3" ${strokeAttr}/>
          <path d="M16 14 C16 8 26 8 26 14" ${strokeAttr}/>
          <path d="M18 24 L21 27 L24 24" ${strokeAttr}/>
        </g>
        <!-- Estrela / Qualidade -->
        <g transform="translate(116, 16)">
          <polygon points="20,8 23,16 32,17 25,23 27,32 20,27 13,32 15,23 8,17 17,16" ${strokeAttr}/>
        </g>
        <circle cx="60" cy="10" r="1.5" ${strokeAttr}/>
        <circle cx="108" cy="50" r="1.5" ${strokeAttr}/>
      `;
      break;
  }

  // Gera SVG como Data URL codificada em Base64
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70" viewBox="0 0 160 70">${innerSvg}</svg>`;
  return toSvgBase64(svg);
}
