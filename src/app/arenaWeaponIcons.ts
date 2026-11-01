const svg=(paths:string)=>`<svg viewBox="0 0 96 36" aria-hidden="true" focusable="false">${paths}</svg>`;

/** Match the short Arc fork, magazine-fed Pulse and long single-barrel Rail. */
export const arenaWeaponIcons={
  arc:svg('<path d="M15 10H42V25H29L25 34H17L20 24H15Z" fill="currentColor"/><path d="M42 6H77V12H48V25H77V31H42Z" fill="currentColor"/><circle cx="60" cy="18" r="6" fill="none" stroke="currentColor" stroke-width="3"/>'),
  pulse:svg('<path d="M4 12H20V9H52V13H85V21H52V25H36L34 35H23L26 24H20V20H4Z" fill="currentColor"/><path d="M44 24H58V33H44Z" fill="currentColor" opacity=".6"/><path d="M83 11H91V23H83Z" fill="currentColor"/>'),
  rail:svg('<path d="M3 9H34V25H18L15 33H7L10 25H3Z" fill="currentColor"/><path d="M34 14H90V22H34M88 11H95V25H88" fill="currentColor"/><path d="M28 3H48V8H28Z" fill="currentColor" opacity=".6"/>'),
};
