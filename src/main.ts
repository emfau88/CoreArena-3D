import { startGame } from './app/game';
import { installDisplayControls } from './app/hud';
import './style.css';
import './hud.css';
import { loadFighterAssets } from './render/kayFighter';

const host = document.querySelector<HTMLElement>('#app')!;
const params = new URLSearchParams(location.search);
const adventure = params.get('mode') === 'pve' && params.get('adventure') === '1' && (params.get('level') ?? 'stone') === 'stone';
const game = loadFighterAssets().then(()=>adventure ? import('./app/adventureGame').then(({ startAdventure }) => startAdventure(host))
  : params.get('mode') === 'pve' ? import('./app/pveGame').then(({ startPve }) => startPve(host)) : startGame(host));
game.then((dispose) => {
  const disposeDisplay = installDisplayControls(host);
  if (import.meta.hot) import.meta.hot.dispose(() => { disposeDisplay(); dispose(); });
}).catch((error: unknown) => {
  console.error(error);
  const loading = document.querySelector('#loading');
  if (loading) loading.textContent = 'Die Arena konnte nicht starten. Bitte Chrome oder Edge mit Hardwarebeschleunigung verwenden.';
});
