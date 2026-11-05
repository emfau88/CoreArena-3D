import * as THREE from 'three';
import type {RapierWorld} from '../../physics/rapierWorld';

// Shared by the excavated bed, the gravel deposits and the masonry opening.
// The middle arch spans z = 44.14 ± 1.08 and has faces at x = -5.3 and -3.
const middleArchZ = 44.14;
export function channelZ(x: number) {
  const approach = THREE.MathUtils.smoothstep(x, -32, -8);
  const bend = Math.sin((x + 18) * .48) * Math.exp(-((x + 16) ** 2) / 45);
  const aroundFoot = 2.05 * Math.exp(-((x+18)**2)/18);
  return middleArchZ - (1 - approach) * 7.4 + bend * 1.15 + aroundFoot
    + .8 * THREE.MathUtils.smoothstep(x, -1, 8);
}

export function channelWeight(distance: number) {
  return Math.exp(-(distance * distance) / .72);
}

export function carveChannel(x: number, z: number, hillside: number) {
  const distance = Math.abs(z - channelZ(x));
  const length = THREE.MathUtils.smoothstep(x, -32, -24) * (1 - THREE.MathUtils.smoothstep(x, 2, 9));
  const bank = length * (1 - THREE.MathUtils.smoothstep(distance, .55, 3.2));
  const bed = -12.03 - .039 * (x + 22) + .35 * Math.min(distance, 2);
  return THREE.MathUtils.lerp(hillside, bed, bank) - .47 * length * channelWeight(distance);
}

// One indexed mesh with shared edges. Spacing increases outside the corner and
// channel; no overlapping LOD tiles or separate render calls at their seams.
function axis(start: number, intervals: readonly (readonly [number, number])[]) {
  const values = [start];
  for (const [end, steps] of intervals) {
    const from = values[values.length - 1]!;
    for (let i = 1; i <= steps; i++) values.push(THREE.MathUtils.lerp(from, end, i / steps));
  }
  return values;
}

export function makeTerrain() {
  const xs = axis(-50, [[-32, 6], [-23, 9], [2, 43], [20, 12], [50, 10]]);
  const zs = axis(0, [[14, 5], [30, 12], [49, 38], [58, 8], [80, 7]]);
  const geometry = new THREE.PlaneGeometry(1, 1, xs.length-1, zs.length-1);
  const position = geometry.getAttribute('position');
  for (let row = 0; row < zs.length; row++) {
    for (let col = 0; col < xs.length; col++) position.setXYZ(row*xs.length+col, xs[col]!, 0, zs[row]!);
  }
  return geometry;
}

export type CornerPiece = (geometry: THREE.BufferGeometry, surface: 'wall' | 'cap', tint: number) => void;

const heel = new THREE.Vector3(-15.76, 0, 37.94);
const toe = new THREE.Vector3(-18.05, 0, 41.38);
const length = heel.distanceTo(toe);
const yaw = -Math.atan2(toe.z-heel.z, toe.x-heel.x);
const crown = (u:number) => THREE.MathUtils.lerp(-.59,-9.22,u/length);

export function installColliders(world: RapierWorld) {
  // Only the steep wing extends above the fall threshold. Give it a solid
  // sloping shell aligned with the coping, including its overhanging lip.
  const points:number[]=[];
  for (const u of [0,length]) for (const v of [-.765,.765]) for(const y of [-13.8,crown(u)+.16]) {
    points.push(heel.x+u*Math.cos(yaw)+v*Math.sin(yaw),y,heel.z-u*Math.sin(yaw)+v*Math.cos(yaw));
  }
  world.addStaticHull('stone-retaining-wing',new Float32Array(points));
}

export function buildMasonry(add: CornerPiece, ground: (x:number,z:number)=>number) {
  // Along the wing, local x points downslope, y stays vertical. Its steep
  // coping grows out of the real wall, without adding a walkable high ledge.
  function face(start: number, end: number, low0: number, low1: number,
    high0: number, high1: number, width: number, surface: 'wall' | 'cap', tint: number,
    shoulder?: number) {
    const outline = new THREE.Shape();
    outline.moveTo(start,low0); outline.lineTo(end,low1);
    outline.lineTo(end,high1);
    if (shoulder !== undefined && shoulder>start && shoulder<end) outline.lineTo(shoulder,high0);
    outline.lineTo(start,high0); outline.closePath();
    const g = new THREE.ExtrudeGeometry(outline,{depth:width,bevelEnabled:false});
    g.translate(0,0,-width/2).rotateY(yaw).translate(heel.x,0,heel.z);
    add(g,surface,tint);
  }
  function stone(x:number,y:number,z:number,w:number,h:number,d:number,
    tint:number, turn=yaw, tilt=0, surface:'wall'|'cap'='wall') {
    const box = new THREE.BoxGeometry(w,h,d);
    const geometry = box.toNonIndexed();
    box.dispose();
    geometry.rotateZ(tilt).rotateY(turn).translate(x,y,z);
    add(geometry,surface,tint);
  }
  face(0,length,-13.8,-13.8,crown(0),crown(length),1.32,'wall',0x716e61);
  // Stagger the joints and clip the last stones to the incline. A darker
  // backing shows through the shallow mortar joints, even in grazing light.
  const stoneTints=[0xbcb9ab,0xc7c0af,0xb6b7ac,0xc2bcac,0xbab3a3];
  for(let row=0;row<20;row++){
    const low=-13.39+row*.65;
    const limit=Math.min(length,(crown(0)-low)*length/8.63);
    for(let along=row%2===0?0:-.63,brick=0;along<limit;along+=1.26,brick++){
      const a=Math.max(0,along)+.014,b=Math.min(limit,along+1.26)-.014;
      if(b-a<.08)continue;
      face(a,b,low,low,Math.min(low+.628,crown(a)),Math.min(low+.628,crown(b)),
        1.38+.011*((row+brick)%3),'wall',stoneTints[(row*3+brick)%stoneTints.length]!,
        (crown(0)-low-.628)*length/8.63);
    }
  }
  for(let i=0;i<8;i++) {
    const a=length*i/8+.012, b=length*(i+1)/8-.012;
    face(a,b,crown(a)-.035,crown(b)-.035,crown(a)+.16,crown(b)+.16,1.53,'cap',
      i%3===0?0xc2bca6:0xd1cbb5);
  }
  // Broad battered foot keyed into rock, coursed pier, and a projecting cap.
  const px=toe.x, pz=toe.z;
  stone(px,-12.42,pz,2.65,2.5,2.42,0x98947e);
  stone(px,-11.11,pz,2.4,.22,2.2,0xb5b09a);
  for(let i=0;i<4;i++){
    const w=2.08-i*.07, y=-10.77+i*.43;
    const split=i%2===0?.36:.63;
    for(const [a,b] of [[0,split],[split,1]] as const){
      const along=((a+b)/2-.5)*w;
      stone(px+along*Math.cos(yaw),y,pz-along*Math.sin(yaw),
        w*(b-a)-.025,.419,1.86-i*.045,i%2===0?0xb9b3a1:0xaaa590);
    }
  }
  stone(px,-9.18,pz,2.22,.24,2.04,0xd4ccb6,yaw,0,'cap');
  stone(-16.25,ground(-16.25,42.7)+.18,42.7,.92,.62,.71,0xc3baa5,.47,-.24,'cap');
  stone(-14.8,ground(-14.8,43.8)+.12,43.8,.66,.51,.88,0xb4ae99,-.32,.19);
}
