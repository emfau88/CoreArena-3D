import { startGame } from './app/game';
import { installDisplayControls } from './app/hud';
import './style.css';
import './hud.css';
import { loadFighterAssets } from './render/kayFighter';
import { resolveAdventureEntry } from './app/adventureVariant';

const host = document.querySelector<HTMLElement>('#app')!;
const params = new URLSearchParams(location.search);
const diagnostics = import.meta.env.DEV || import.meta.env.MODE === 'test';
const adventure = resolveAdventureEntry(params, diagnostics,
  diagnostics || import.meta.env.MODE === 'adventure-preview' || import.meta.env.MODE === 'environment-test',
  import.meta.env.MODE === 'environment-test');
const game = loadFighterAssets().then(()=>adventure ? import('./app/adventureGame').then(({ startAdventure }) => startAdventure(host, adventure))
  : params.get('mode') === 'pve' ? import('./app/pveGame').then(({ startPve }) => startPve(host)) : startGame(host));
game.then((dispose) => {
  const disposeDisplay = installDisplayControls(host);
  if (import.meta.hot) import.meta.hot.dispose(() => { disposeDisplay(); dispose(); });
}).catch((error: unknown) => {
  console.error(error);
  const loading = document.querySelector('#loading');
  if (loading) loading.textContent = 'Die Arena konnte nicht starten. Bitte Chrome oder Edge mit Hardwarebeschleunigung verwenden.';
});
