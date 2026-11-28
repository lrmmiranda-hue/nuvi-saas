/**
 * Utilitário de Alerta Sonoro de Novo Pedido (Web Audio API)
 * Gera toques polifônicos estilo iFood / Delivery sem depender de arquivos externos.
 */

let audioCtx: AudioContext | null = null;
let alertIntervalId: any = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Toca um acorde de sino de 3 notas com timbre agradável e envolvente de alta atenção
 */
export function playOrderAlertChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Frequências das notas (Fá#5, Lá#5, Dó#6 - tríade alegre e marcante)
    const notes = [
      { freq: 739.99, delay: 0.00, dur: 0.65, gain: 0.40 }, // F#5
      { freq: 932.33, delay: 0.14, dur: 0.75, gain: 0.45 }, // A#5
      { freq: 1108.73, delay: 0.28, dur: 1.10, gain: 0.50 }, // C#6
    ];

    notes.forEach(({ freq, delay, dur, gain }) => {
      const startTime = now + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Oscilador harmônico (senóide suave com transição brilhante)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.002, startTime + dur);

      // Envelope com ataque rápido e decaimento natural de sino metálico
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  } catch (err) {
    console.warn('[AudioAlert] Não foi possível reproduzir som:', err);
  }
}

/**
 * Inicia o alerta sonoro contínuo (repete a cada X segundos até ser silenciado ou o pedido ser aceito)
 */
export function startContinuousOrderAlert(intervalSeconds: number = 7): void {
  stopContinuousOrderAlert();
  // Toca o primeiro imediatamente
  playOrderAlertChime();
  // Repete a cada intervalo
  alertIntervalId = setInterval(() => {
    playOrderAlertChime();
  }, intervalSeconds * 1000);
}

/**
 * Para imediatamente o alerta sonoro contínuo
 */
export function stopContinuousOrderAlert(): void {
  if (alertIntervalId) {
    clearInterval(alertIntervalId);
    alertIntervalId = null;
  }
}

/**
 * Retorna se o alarme contínuo está ativo no momento
 */
export function isContinuousOrderAlertActive(): boolean {
  return alertIntervalId !== null;
}
