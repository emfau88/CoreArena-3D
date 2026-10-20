import { startGame } from './app/game';
import './style.css';

startGame(document.querySelector<HTMLElement>('#app')!).then((dispose) => {
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}).catch((error: unknown) => {
  console.error(error);
  document.querySelector('#loading')!.textContent =
    'Die Arena konnte nicht starten. Bitte Chrome oder Edge mit Hardwarebeschleunigung verwenden.';
});
