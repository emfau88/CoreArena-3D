import type * as THREE from 'three';
import type {CourtyardAssets} from '../../render/courtyardLook';
import type {AdventureFightState} from '../../core/adventureFight';
import './environmentTest.css';

/** Comparison controls are independent of the B-only scene module. */
export async function createEnvironmentTest(host:HTMLElement,variant:'reference'|'outpost-test',assets:CourtyardAssets) {
  const environment=variant==='outpost-test'?(await import('./outpostEnvironment')).createOutpostEnvironment(assets):undefined;
  const panel=document.createElement('nav');panel.id='environment-comparison';panel.ariaLabel='Umgebung vergleichen';
  for(const [i,id] of (['reference','outpost-test'] as const).entries()){
    const link=document.createElement('a'),url=new URL(location.href);url.searchParams.set('environment',id);
    link.href=url.href;link.textContent=i===0?'A · Bisheriger Hof':'B · Neuer Ladehof';
    link.setAttribute('aria-current',id===variant?'page':'false');panel.append(link);
  }
  const hint=document.createElement('small');hint.textContent='Ansicht wechseln startet die Mission neu';panel.append(hint);host.append(panel);
  host.dataset.environment=variant;
  return {style:environment?.style,
    build:(scene:THREE.Scene)=>environment?.build(scene),
    update:(state:AdventureFightState,dt:number)=>environment?.update(state,dt),
    diagnostics:()=>({variant,...environment?.diagnostics()}),
    // ArenaView disposes all scene-owned geometries, materials and textures.
    dispose(){panel.remove();delete host.dataset.environment;},
  };
}
