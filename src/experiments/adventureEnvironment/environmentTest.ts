import type * as THREE from 'three';
import type {CourtyardAssets, CourtyardStyle} from '../../render/courtyardLook';
import type {AdventureFightState} from '../../core/adventureFight';
import type {AdventureEnvironment} from '../../app/adventureVariant';
import './environmentTest.css';

const choices = [
  ['reference', 'A · Bisheriger Hof'],
  ['outpost-test', 'B · Neuer Ladehof'],
  ['stone-yard', 'C · Hof mit Außenraum'],
  ['rocky-bank', 'D · Felsböschung'],
  ['retaining-corner', 'E · Stützmauer'],
  ['warden-ravine', 'F · Wächterklamm'],
] as const;

export async function createEnvironmentTest(host:HTMLElement,variant:AdventureEnvironment,assets:CourtyardAssets) {
  const environment=variant==='outpost-test'?(await import('./outpostEnvironment')).createOutpostEnvironment(assets):undefined;
  const stoneYard = variant === 'stone-yard' ? (await import('./stoneYard')).buildStoneYard : undefined;
  const corner = variant === 'retaining-corner' ? await import('./retainingCorner') : undefined;
  const bankModule = variant === 'rocky-bank' || corner ? await import('./rockyBank') : undefined;
  const rockyBank = await bankModule?.createRockyBank(corner);
  const ravine = variant === 'warden-ravine' ? await (await import('./wardenRavine')).createWardenRavine() : undefined;
  const style: CourtyardStyle | undefined = ravine ? {replaceExteriorBeds:'all'} : rockyBank ? {replaceExteriorBeds:'arrival'} : environment?.style;
  const panel=document.createElement('nav');panel.id='environment-comparison';panel.ariaLabel='Umgebung vergleichen';
  for(const [id,label] of choices){
    const link=document.createElement('a'),url=new URL(location.href);url.searchParams.set('environment',id);
    link.href=url.href;link.textContent=label;
    link.setAttribute('aria-current',id===variant?'page':'false');panel.append(link);
  }
  const hint=document.createElement('small');hint.textContent='Ansicht wechseln startet die Mission neu';panel.append(hint);host.append(panel);
  host.dataset.environment=variant;
  return {style, edgeHint:ravine?.edgeHint ?? bankModule?.edgeHint,
    installColliders:corner?.installColliders,
    build(scene:THREE.Scene){environment?.build(scene);stoneYard?.(scene,assets);rockyBank?.(scene,assets);ravine?.build(scene,assets);},
    update:(state:AdventureFightState,dt:number)=>environment?.update(state,dt),
    diagnostics:()=>({variant,...environment?.diagnostics()}),
    // ArenaView disposes all scene-owned geometries, materials and textures.
    dispose(){panel.remove();delete host.dataset.environment;},
  };
}
