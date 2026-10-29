const icon = (kind: 'arc' | 'pulse') => `<svg viewBox="0 0 96 36" aria-hidden="true" focusable="false">
  <path d="M9 12H24L29 8H57V12H77V21H52L44 25H31L27 33H18L20 22H9Z" fill="currentColor" opacity=".55"/>
  ${kind === 'pulse' ? '<path d="M54 13H91V18H54M31 9H52V14H31" fill="currentColor"/><path d="M39 22V31H48L51 22" fill="currentColor" opacity=".65"/>'
    : '<path d="M54 8H85V13H61V21H85V26H54Z" fill="currentColor"/><path d="M72 9L65 18H76L69 27" fill="none" stroke="currentColor" stroke-width="2"/>'}
</svg>`;

export function weaponHud(pulse = false): string {
  return `<div class="weapon-buttons">
    <button id="weapon-arc" type="button" aria-pressed="${!pulse}" title="Automatischer Energiefächer · kurze Reichweite · halten für weitere Salven"><kbd>1</kbd><span class="weapon-icon">${icon('arc')}</span><span class="weapon-name">Arc Lash</span><span class="weapon-type">AUTO-FÄCHER</span><b>∞</b></button>
    <button id="weapon-pulse" type="button" aria-pressed="${pulse}"><kbd>2</kbd><span class="weapon-icon">${icon('pulse')}</span><span class="weapon-name">Pulse</span><span class="weapon-type">REPEATER</span><b id="ammo-count">${pulse ? '54 / 54' : '—'}</b></button>
  </div>`;
}

export const lifeHud = `<div class="vitals-heading"><span class="vitals-cross">✚</span> VITALWERTE <span class="vitals-live">● ONLINE</span></div>
  <div class="vitals-numbers"><span><span id="hp-value">100</span><small> HP</small></span><span class="armor"><span id="armor-value">50</span><small> RÜSTUNG</small></span></div>
  <progress id="hp-bar" max="100" value="100" aria-label="Lebenspunkte"></progress>
  <progress id="armor-bar" max="100" value="50" aria-label="Rüstung"></progress>`;

export function installDisplayControls(host: HTMLElement): () => void {
  const button = document.createElement('button'); button.id = 'fullscreen-toggle'; button.type = 'button';
  const abort = new AbortController(), options = { signal: abort.signal };
  const label = () => { button.textContent = document.fullscreenElement ? '⛶ Fenster' : '⛶ Vollbild';
    button.setAttribute('aria-label', document.fullscreenElement ? 'Vollbild verlassen' : 'Vollbild aktivieren'); };
  const toggle = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { button.textContent = 'Vollbild nicht verfügbar'; }
  };
  button.title = 'Vollbild umschalten (F)'; label(); host.append(button);
  button.addEventListener('click', () => { void toggle(); }, options);
  document.addEventListener('fullscreenchange', label, options);
  window.addEventListener('keydown', event => {
    if (event.code === 'KeyF' && !event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey
      && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault(); void toggle();
    }
  }, options);
  if (!document.fullscreenEnabled) button.hidden = true;
  return () => { abort.abort(); button.remove(); };
}
