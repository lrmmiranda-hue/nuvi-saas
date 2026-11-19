/**
 * Utilitário de Geração de Payload PIX (Padrão BR Code / Banco Central do Brasil)
 * Compatível com todos os bancos e carteiras digitais (Nubank, Itaú, Bradesco, Inter, Mercado Pago, etc.)
 */

// Cálculo do CRC16 (CCITT-FALSE / Polinômio 0x1021) conforme especificação do Bacen
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Formata campo no padrão TLV (Tag-Length-Value)
function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

// Remove acentos e caracteres especiais para nomes de conformidade EMV
function sanitizeEMV(str: string, maxLength: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .substring(0, maxLength);
}

export interface PixPayloadParams {
  pixKey: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';
  beneficiaryName?: string;
  city?: string;
  amount?: number;
  txid?: string;
}

/**
 * Gera a string Pix Copia e Cola válida no padrão BR Code oficial
 */
export function generatePixPayload({
  pixKey,
  beneficiaryName = 'LOJA',
  city = 'BRASIL',
  amount,
  txid = '***'
}: PixPayloadParams): string {
  if (!pixKey) return '';

  const cleanKey = pixKey.trim();
  const cleanName = sanitizeEMV(beneficiaryName, 25) || 'RECEBEDOR';
  const cleanCity = sanitizeEMV(city, 15) || 'CIDADE';
  const cleanTxid = sanitizeEMV(txid, 25) || '***';

  // ID 00: Payload Format Indicator
  let payload = formatTLV('00', '01');

  // ID 01: Point of Initiation Method (12 = dinâmico / uso único, 11 = estático / múltiplos usos)
  payload += formatTLV('01', amount && amount > 0 ? '12' : '11');

  // ID 26: Merchant Account Information - PIX
  const gui = formatTLV('00', 'br.gov.bcb.pix');
  const key = formatTLV('01', cleanKey);
  payload += formatTLV('26', `${gui}${key}`);

  // ID 52: Merchant Category Code
  payload += formatTLV('52', '0000');

  // ID 53: Transaction Currency (986 = Real Brasileiro BRL)
  payload += formatTLV('53', '986');

  // ID 54: Transaction Amount
  if (amount && amount > 0) {
    payload += formatTLV('54', amount.toFixed(2));
  }

  // ID 58: Country Code
  payload += formatTLV('58', 'BR');

  // ID 59: Merchant Name
  payload += formatTLV('59', cleanName);

  // ID 60: Merchant City
  payload += formatTLV('60', cleanCity);

  // ID 62: Additional Data Field Template
  const refLabel = formatTLV('05', cleanTxid);
  payload += formatTLV('62', refLabel);

  // ID 63: CRC16
  const payloadWithCRCId = `${payload}6304`;
  const checksum = calculateCRC16(payloadWithCRCId);

  return `${payloadWithCRCId}${checksum}`;
}

/**
 * Retorna URL de renderização do QR Code em alta resolução
 */
export function getQRCodeUrl(data: string, size = 300): string {
  if (!data) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(data)}`;
}
