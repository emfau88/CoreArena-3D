import { startGame } from './app/game';
import './style.css';
import './hud.css';

const host = document.querySelector<HTMLElement>('#app')!;
const game = new URLSearchParams(location.search).get('mode') === 'pve'
  ? import('./app/pveGame').then(({ startPve }) => startPve(host)) : startGame(host);
game.then((dispose) => {
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}).catch((error: unknown) => {
  console.error(error);
  const loading = document.querySelector('#loading');
  if (loading) loading.textContent = 'Die Arena konnte nicht starten. Bitte Chrome oder Edge mit Hardwarebeschleunigung verwenden.';
});
