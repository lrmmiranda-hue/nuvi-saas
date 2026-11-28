import { Order, Tenant } from '../types';

export interface ThermalPrintOptions {
  paperWidth?: '80mm' | '58mm';
  copyType?: 'completa' | 'cozinha' | 'entrega';
}

/**
 * Utilitário de Impressão Térmica de Cupom Não-Fiscal
 * Compatível com impressoras térmicas padrão 80mm e 58mm (Epson, Elgin, Bematech, Daruma, etc.)
 */
export function printThermalReceipt(
  order: Order,
  tenant: Tenant,
  options: ThermalPrintOptions = {}
): void {
  const { paperWidth = '80mm', copyType = 'completa' } = options;

  const widthPx = paperWidth === '58mm' ? 220 : 310;
  const fontSizeBase = paperWidth === '58mm' ? '11px' : '13px';
  const fontSizeTitle = paperWidth === '58mm' ? '15px' : '18px';
  const fontSizeBadge = paperWidth === '58mm' ? '16px' : '20px';

  const channelText =
    order.deliveryType === 'delivery'
      ? '🛵 ENTREGA / DELIVERY'
      : order.deliveryType === 'mesa'
      ? `🍽️ MESA ${order.tableNumber?.replace(/[^0-9]/g, '') || order.tableNumber || 'S/N'}`
      : '🛍️ RETIRADA NO BALCÃO';

  const formattedDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const divider = paperWidth === '58mm' ? '--------------------------' : '----------------------------------------';
  const doubleDivider = paperWidth === '58mm' ? '==========================' : '========================================';

  let copyTitle = 'VIA DO CLIENTE / BALCÃO';
  if (copyType === 'cozinha') copyTitle = '*** VIA DA COZINHA (PRODUÇÃO) ***';
  if (copyType === 'entrega') copyTitle = '*** VIA DO ENTREGADOR / MOTOBOY ***';

  // Itens formatados
  const itemsHtml = order.items
    .map((it) => {
      if (copyType === 'cozinha') {
        return `
          <div style="margin-bottom: 7px; padding-bottom: 4px; border-bottom: 1px dashed #000;">
            <div style="font-size: ${paperWidth === '58mm' ? '14px' : '17px'}; font-weight: 900;">
              [ ${it.quantity}x ] ${it.productName}
            </div>
            ${it.volume ? `<div style="font-size: 11px; color: #333;">Tamanho/Var: ${it.volume}</div>` : ''}
            ${it.notes ? `<div style="font-size: 12px; font-weight: bold; background: #eee; padding: 2px 4px; margin-top: 2px;">⚠️ OBS: ${it.notes}</div>` : ''}
          </div>
        `;
      }

      return `
        <div style="margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px dashed #aaa;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${fontSizeBase};">
            <span>${it.quantity}x ${it.productName}</span>
            <span>R$ ${(it.price * it.quantity).toFixed(2)}</span>
          </div>
          <div style="font-size: 11px; color: #444; display: flex; justify-content: space-between;">
            <span>${it.volume || ''}${it.chilled ? ' ❄️ Gelada' : ''}</span>
            <span>(${it.quantity} x R$ ${it.price.toFixed(2)})</span>
          </div>
          ${it.notes ? `<div style="font-size: 11px; font-style: italic; color: #b00; margin-top: 2px;">Obs: ${it.notes}</div>` : ''}
        </div>
      `;
    })
    .join('');

  // Endereço de entrega
  let addressHtml = '';
  if (order.address && (copyType === 'completa' || copyType === 'entrega')) {
    addressHtml = `
      <div style="margin: 8px 0; padding: 6px; border: 1.5px solid #000; font-size: ${fontSizeBase};">
        <div style="font-weight: 900; font-size: ${paperWidth === '58mm' ? '12px' : '14px'}; margin-bottom: 3px;">📍 ENDEREÇO DE ENTREGA:</div>
        <div style="font-weight: bold;">${order.address.street}, ${order.address.number}${order.address.complement ? ` (${order.address.complement})` : ''}</div>
        <div><b>Bairro:</b> ${order.address.neighborhood}</div>
        <div><b>Cidade:</b> ${order.address.city}</div>
        ${order.address.referencePoint ? `<div style="margin-top: 3px; font-style: italic;">Ref: ${order.address.referencePoint}</div>` : ''}
      </div>
    `;
  } else if (!order.address && (copyType === 'completa' || copyType === 'entrega')) {
    addressHtml = `
      <div style="margin: 6px 0; text-align: center; font-weight: bold; border: 1px dashed #000; padding: 4px;">
        RETIRADA PRESENCIAL NO BALCÃO
      </div>
    `;
  }

  // Bloco de Totais
  let totalsHtml = '';
  if (copyType !== 'cozinha') {
    totalsHtml = `
      <div style="margin-top: 6px; font-size: ${fontSizeBase};">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>R$ ${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Taxa de Entrega:</span>
          <span>${order.deliveryFee > 0 ? `R$ ${order.deliveryFee.toFixed(2)}` : 'GRÁTIS'}</span>
        </div>
        <div style="font-size: 11px; margin: 4px 0;">${divider}</div>
        <div style="display: flex; justify-content: space-between; font-size: ${paperWidth === '58mm' ? '15px' : '18px'}; font-weight: 900;">
          <span>TOTAL A COBRAR:</span>
          <span>R$ ${order.total.toFixed(2)}</span>
        </div>
        <div style="margin-top: 5px; font-size: 11px;">
          <b>Forma de Pagto:</b> ${
            order.paymentMethod === 'cartao_entrega'
              ? 'Cartão na Entrega (Maquininha)'
              : order.paymentMethod === 'dinheiro'
              ? `Dinheiro ${order.cashChangeFor ? `(Troco p/ R$ ${order.cashChangeFor.toFixed(2)})` : ''}`
              : order.paymentMethod?.toUpperCase()
          }
        </div>
      </div>
    `;
  }

  const printWindow = window.open('', '_blank', `width=${widthPx + 80},height=650`);
  if (!printWindow) {
    alert('Por favor, permita pop-ups no navegador para emitir a impressão térmica.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Comanda #${order.id} - ${tenant.name}</title>
        <style>
          @page {
            size: ${paperWidth} auto;
            margin: 0mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
          }
          body {
            font-family: 'Courier New', Courier, monospace, monospace;
            width: ${widthPx}px;
            margin: 0 auto;
            padding: 8px;
            color: #000;
            background: #fff;
            line-height: 1.25;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .title { font-size: ${fontSizeTitle}; font-weight: 900; letter-spacing: -0.5px; }
          .badge {
            font-size: ${fontSizeBadge};
            font-weight: 900;
            background: #000;
            color: #fff;
            padding: 4px;
            margin: 6px 0;
            text-align: center;
          }
          .divider { margin: 4px 0; font-size: 10px; overflow: hidden; white-space: nowrap; }
          .meta { font-size: 11px; margin-bottom: 2px; }
          .footer {
            font-size: 10px;
            text-align: center;
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 6px;
          }
          @media print {
            body { width: 100%; margin: 0; padding: 4px; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">${tenant.name.toUpperCase()}</div>
          ${tenant.address?.street ? `<div class="meta">${tenant.address.street}, ${tenant.address.number || ''}</div>` : ''}
          ${tenant.phone ? `<div class="meta">WhatsApp: ${tenant.phone}</div>` : ''}
          <div class="meta bold" style="margin-top: 3px;">${copyTitle}</div>
        </div>

        <div class="badge">${channelText}</div>

        <div style="font-size: 11px; margin-bottom: 6px;">
          <div><b>PEDIDO:</b> #${order.id}</div>
          <div><b>DATA/HORA:</b> ${formattedDate} às ${formattedTime}</div>
          <div><b>CLIENTE:</b> ${order.customerName}</div>
          ${order.customerPhone ? `<div><b>TELEFONE:</b> ${order.customerPhone}</div>` : ''}
        </div>

        <div class="divider">${doubleDivider}</div>

        ${addressHtml}

        <div style="font-weight: 900; font-size: 12px; margin: 4px 0;">ITENS DO PEDIDO:</div>
        <div>${itemsHtml}</div>

        ${order.notes ? `
          <div style="border: 1px solid #000; padding: 4px; margin: 6px 0; font-size: 12px; background: #fafafa;">
            <b>OBSERVAÇÕES GERAIS:</b><br/>
            ${order.notes}
          </div>
        ` : ''}

        <div class="divider">${doubleDivider}</div>

        ${totalsHtml}

        <div class="footer">
          NUVI SAAS • SISTEMA DE GESTÃO & VENDAS<br/>
          www.nuvi-saas.web.app
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
