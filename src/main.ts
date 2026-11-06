import { startGame } from './app/game';
import { installDisplayControls } from './app/hud';
import './style.css';
import './hud.css';
import { loadFighterAssets } from './render/kayFighter';
import { resolveAdventureEntry,resolveFrostEntry } from './app/adventureVariant';
import {isAdventureHub} from './app/adventureNavigation';

const host = document.querySelector<HTMLElement>('#app')!;
const diagnostics = import.meta.env.DEV || import.meta.env.MODE === 'test';
const environment = import.meta.env.MODE === 'environment-test' || import.meta.env.MODE === 'environment-preview';
const allowPrototype=diagnostics||import.meta.env.MODE==='adventure-preview'||environment;
let dispose:(()=>void)|undefined,disposeDisplay:(()=>void)|undefined,pending=Promise.resolve();
const assets=loadFighterAssets();
const route=()=>{pending=pending.then(async()=>{
  disposeDisplay?.();dispose?.();dispose=disposeDisplay=undefined;
  host.innerHTML='<div id="loading">Adventure wird geladen …</div>';delete host.dataset.ready;
  const params=new URLSearchParams(location.search),adventure=resolveAdventureEntry(params,diagnostics,allowPrototype,environment);
  const frost=resolveFrostEntry(params,allowPrototype);
  await assets;
  dispose=isAdventureHub(params,allowPrototype)?(await import('./app/adventureHub')).startAdventureHub(host):
    frost?await (await import('./app/frostAdventureGame')).startFrostAdventure(host,frost):
    adventure?await (await import('./app/adventureGame')).startAdventure(host,adventure):
    params.get('mode')==='pve'?await (await import('./app/pveGame')).startPve(host):await startGame(host);
  disposeDisplay=installDisplayControls(host);
  const hub=host.querySelector('#adventure-hub .campaign-card'),fullscreen=host.querySelector('#fullscreen-toggle');
  if(hub&&fullscreen)hub.append(fullscreen);
}).catch((error:unknown)=>{console.error(error);const loading=document.querySelector('#loading');
  if(loading)loading.textContent='Das Spiel konnte nicht starten. Bitte Chrome oder Edge mit Hardwarebeschleunigung verwenden.';});};
window.addEventListener('adventure:navigate',route);window.addEventListener('popstate',route);route();
if(import.meta.hot)import.meta.hot.dispose(()=>{window.removeEventListener('adventure:navigate',route);window.removeEventListener('popstate',route);disposeDisplay?.();dispose?.();});
