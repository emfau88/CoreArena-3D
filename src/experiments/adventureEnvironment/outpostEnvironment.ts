import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {CourtyardAssets,CourtyardStyle} from '../../render/courtyardLook';
import type {AdventureFightState} from '../../core/adventureFight';
import {OUTPOST_PROPS} from '../../arena/stoneDressing';

/** Original project geometry and canvas painting. No external assets or new game rules. */
function loadingFloor(source:CanvasImageSource) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=704;
  const g=canvas.getContext('2d')!,px=32;
  let seed=41026;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  g.fillStyle='#9c9f91';g.fillRect(0,0,1024,704);
  for(let z=0;z<11;z++)for(let x=0;x<16;x++){
    const c=151+Math.floor(random()*11);g.fillStyle=`rgb(${c+7},${c+9},${c})`;
    g.fillRect(x*64+1,z*64+1,62,62);
    g.fillStyle='rgba(242,239,211,.12)';g.fillRect(x*64+2,z*64+2,60,1);
  }
  g.globalAlpha=.38;
  for(let z=0;z<704;z+=128)for(let x=0;x<1024;x+=128)g.drawImage(source,x,z,128,128);
  g.globalAlpha=1;
  const rect=(x:number,z:number,w:number,d:number,color:string)=>{g.fillStyle=color;g.fillRect((x-w/2+16)*px,(z-d/2-16)*px,w*px,d*px);};
  // A quiet central route, broad edging and two inset charging pads. All are flat paint.
  rect(0,27,30,20,'rgba(190,190,169,.08)');
  for(const x of [-14.9,14.9])rect(x,27,.5,21,'#666f66');
  for(const z of [17,37])rect(0,z,29.5,.45,'#68726a');
  for(const x of [-3,-9]){
    rect(x,34,3.6,4.1,'#737e76');rect(x,34,3.3,3.8,'#89958c');
    rect(x,34,2.4,.035,'#c4c7ad');rect(x,34,.035,2.8,'#c4c7ad');
  }
  rect(7,32,5.3,4.6,'#7e8981');
  for(let i=0;i<7;i++)rect(4.9+i*.65,34.1,.32,.12,'#c0ad77');
  // Worn directional field and a large bay number read from the side camera.
  g.save();g.translate(3.5*px,17*px);g.rotate(-Math.PI/2);
  g.fillStyle='rgba(223,219,182,.44)';g.font='600 64px sans-serif';g.fillText('01',0,0);g.restore();
  for(let i=0;i<9500;i++){
    g.fillStyle=random()>.5?'rgba(255,255,240,.025)':'rgba(18,35,29,.025)';
    g.fillRect(random()*1024,random()*704,1+random()*3,1+random()*3);
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  map.wrapS=map.wrapT=THREE.ClampToEdgeWrapping;map.anisotropy=4;
  map.repeat.set(4/32,4/22);map.offset.set(.5,38/22);
  return map;
}

export function createOutpostEnvironment(assets:CourtyardAssets) {
  const group=new THREE.Group();group.name='outpost-environment-test';
  let clock=0,lastTick=0,stage='off';const rotors:THREE.Object3D[]=[],indicators:THREE.MeshStandardMaterial[]=[];
  const material=(color:number,roughness=.9,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const stone=material(0x929c8b),pale=material(0xc8c8ac),iron=material(0x354e48,.72,.3),
    edge=material(0x687e71,.8,.2),brass=material(0xaa9060,.75,.25),earth=material(0x34483e);
  stone.map=assets.wall.map;pale.map=assets.floor.map;
  // A broad matte floor needs diffuse light and actor shadows, not per-pixel PBR.
  const floor=new THREE.MeshLambertMaterial({map:loadingFloor(assets.floor.map.image as CanvasImageSource)});
  // Keep the original wall batches and shadow passes shared across all courts.
  // The floor is the only existing surface replaced by the experiment.
  const style:CourtyardStyle={material:(shape,_part,original)=>shape.id==='floor-entry'?floor:original};

  function build(scene:THREE.Scene) {
    scene.add(group);
    const batches=new Map<THREE.Material,THREE.BufferGeometry[]>();
    const add=(geometry:THREE.BufferGeometry,x:number,y:number,z:number,m:THREE.Material,rotation=0)=>{
      if(geometry.index){const indexed=geometry;geometry=indexed.toNonIndexed();indexed.dispose();}
      geometry.rotateY(rotation).translate(x,y,z);
      const pos=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),uv=geometry.getAttribute('uv');
      for(let i=0;i<pos.count;i++){
        const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i));
        uv.setXY(i,(ny>=nx&&ny>=nz?pos.getX(i):nx>nz?pos.getZ(i):pos.getX(i))/3,
          (ny>=nx&&ny>=nz?-pos.getZ(i):pos.getY(i))/3);
      }
      const list=batches.get(m)??[];list.push(geometry);batches.set(m,list);
    };
    const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,angle=0)=>
      add(new RoundedBoxGeometry(w,h,d,1,Math.min(.08,w/6,h/6,d/6)),x,y,z,m,angle);
    const cylinder=(x:number,y:number,z:number,r:number,h:number,m:THREE.Material)=>
      add(new THREE.CylinderGeometry(r,r,h,10),x,y,z,m);
    // The exterior is below the existing -6 m fall/death threshold. It cannot become
    // a false walkable floor or a new obstacle in the original movement envelope.
    box(0,-12.3,42,94,.6,52,earth);
    box(0,-5.75,27,31.95,10.7,21.95,stone);
    box(0,-11,27,35,1.1,25,iron);
    for(const x of [-16,16])for(const z of [18,23,28,33,37]){
      // Stay inside the original perimeter-wall footprint, including the small caps.
      box(x,-5.4,z,.45,9.8,.65,edge);box(x,-1.2,z,.45,.3,.8,pale);
    }
    // Retaining terraces and broken wall modules around the lower service yard.
    for(const side of [-1,1]){
      box(side*26,-10.5,31,9,3,28,stone);
      for(const z of [20,26,32,38,43]){
        box(side*23,-8.6,z,.65,1.2,4.8,edge);
        box(side*23,-7.95,z,.78,.1,4.8,pale);
        box(side*23,-8.4,z+2.35,1,1.6,1,iron);
      }
    }
    // Signature object: the lowered loading gantry beyond the arrival wall.
    // Broad top-facing ribs and twin drums remain legible in the orthographic view.
    box(0,-11.5,44,19,1,9,stone);box(0,-10.8,44,17,.4,7,iron);
    for(const x of [-7.2,7.2]){
      box(x,-9.1,44,1.2,3.2,5.6,edge);box(x,-7.45,44,1.5,.2,5.9,pale);
      for(const z of [45,44,49])box(x,-8.7,z,1.28,.22,.25,brass);
    }
    box(0,-8.1,43,14,.65,2.1,iron);box(0,-7.7,43,14.5,.15,2.4,pale);
    for(let x=-5.7;x<6;x+=1.9){box(x,-7.55,43,.18,.14,2.2,edge);}
    for(const x of [-3.4,3.4]){
      cylinder(x,-9.4,45.8,1.65,2,edge);cylinder(x,-8.35,45.8,1.75,.16,brass);
      const rotor=new THREE.Group();rotor.position.set(x,-8.22,45.8);
      for(let i=0;i<5;i++){
        const blade=new THREE.Mesh(new THREE.BoxGeometry(.27,.08,1.3),iron);
        const a=i*Math.PI*2/5;blade.rotation.y=a;blade.position.set(Math.sin(a)*.65,0,Math.cos(a)*.65);rotor.add(blade);
      }
      // One mesh per rotor, shared material, no additional shadow pass.
      const blades:THREE.BufferGeometry[]=[];
      rotor.children.forEach(child=>{const mesh=child as THREE.Mesh;mesh.updateMatrix();blades.push(mesh.geometry.clone().applyMatrix4(mesh.matrix));mesh.geometry.dispose();});
      rotor.clear();rotor.add(new THREE.Mesh(mergeGeometries(blades),iron));blades.forEach(g=>g.dispose());
      group.add(rotor);rotors.push(rotor);
    }
    // Existing physical objects get recessed panels, corner details and vent slots.
    // The details stay inside their original solid footprints.
    for(const p of OUTPOST_PROPS.filter(p=>p.z>=16)){
      const {x,y,z,width:w,height:h,depth:d}=p;
      box(x,y+h+.006,z,w*.78,.012,d*.75,iron);
      for(const sign of [-1,1]){
        box(x+sign*(w/2-.08),y+h+.014,z,.07,.025,d-.12,brass);
        for(const dz of [-1,1])box(x+sign*(w/2-.08),y+h-.13,z+dz*(d/2-.08),.12,.22,.12,edge);
      }
      for(let i=0;i<5;i++)box(x-w*.24+i*w*.12,y+h+.02,z,w*.04,.012,d*.4,pale);
    }
    // Wall insets stay below its existing top and within its solid volume.
    for(const x of [-12,-6,0,6,12]){
      box(x,.55,38.246,2.7,.38,.012,iron);
      box(x,.55,37.746,2.7,.38,.012,edge);
      for(let i=0;i<4;i++)box(x-.8+i*.53,.55,37.735,.3,.04,.015,pale);
    }
    for(const side of [-1,1])for(const z of [19,24,29,34]){
      box(side*15.746,.7,z,.014,.48,2.2,iron);
      box(side*15.73,.72,z,.02,.06,1.75,brass);
    }
    // Low distant equipment is grouped, rather than scattered over the fighting floor.
    for(const [x,z,w,d] of [[-13,49,2.8,2.3],[11,43,3.3,2.6],[13,47,2,3.4],[-20,22,2.1,2.4]]){
      box(x!,-10.8,z!,w!,2.4,d!,edge);box(x!,-9.56,z!,w!+.1,.08,d!+.1,pale);
      for(const sign of [-1,1])box(x!+sign*w!*.3,-10.8,z!,.14,2.45,d!+.03,iron);
    }
    // The distant architecture has fixed lighting. Bake its broad face shading into
    // vertices, then batch by texture instead of colour: three cheap opaque draws.
    const texturedBatches=new Map<THREE.Texture|null,THREE.BufferGeometry[]>();
    const sun=new THREE.Vector3(-20,35,18).normalize();
    for(const [m,parts] of batches){
      const source=m as THREE.MeshStandardMaterial;
      for(const part of parts){
        const normal=part.getAttribute('normal'),colors=new Float32Array(normal.count*3);
        for(let i=0;i<normal.count;i++){
          const light=.9+.65*Math.max(0,normal.getX(i)*sun.x+normal.getY(i)*sun.y+normal.getZ(i)*sun.z);
          colors[i*3]=source.color.r*light;colors[i*3+1]=source.color.g*light;colors[i*3+2]=source.color.b*light;
        }
        part.setAttribute('color',new THREE.BufferAttribute(colors,3));
      }
      const list=texturedBatches.get(source.map)??[];list.push(...parts);texturedBatches.set(source.map,list);
    }
    for(const [map,parts] of texturedBatches){
      const shade=new THREE.MeshBasicMaterial({vertexColors:true,map});
      const mesh=new THREE.Mesh(mergeGeometries(parts),shade);parts.forEach(g=>g.dispose());
      mesh.name='environment-static';mesh.receiveShadow=false;mesh.castShadow=false;group.add(mesh);
    }
    stone.dispose();pale.dispose();edge.dispose();brass.dispose();earth.dispose();
    // Matching dark-green, low-detail growth in the lower yard. Shared foliage assets.
    const placements=[[-20,18,.8],[-21,29,.9],[-23,41,1],[-12,48,.8],[13,45,.9],[22,36,1],[21,23,.8]];
    for(const part of assets.dressing.plants.Blackberry_Bush_1b){
      const mesh=new THREE.InstancedMesh(part.geometry,part.material,placements.length),dummy=new THREE.Object3D();
      placements.forEach(([x,z,s],i)=>{dummy.position.set(x!,-11.9,z!);dummy.scale.setScalar(s!*2);dummy.rotation.y=i*2.1;dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
      mesh.computeBoundingSphere();mesh.receiveShadow=true;group.add(mesh);
    }
    const status=material(0x8a9e8b,.6,.25);status.emissive.setHex(0x88b9a1);indicators.push(status);
    const strips:THREE.BufferGeometry[]=[];
    strips.push(new THREE.BoxGeometry(.016,.42,.66).translate(-6.49,1.2,34));
    strips.push(new THREE.BoxGeometry(10,.04,.12).translate(0,-7.6,43));
    const lights=new THREE.Mesh(mergeGeometries(strips),status);strips.forEach(g=>g.dispose());group.add(lights);
  }
  return {style,build,
    update(state:AdventureFightState,dt:number){
      if(state.pve.tick<lastTick)clock=0;lastTick=state.pve.tick;clock+=dt;
      stage=state.relayActive?'online':state.consoleActive?'standby':'off';
      for(const m of indicators){m.emissiveIntensity=stage==='online'?.9:stage==='standby'?.25:0;m.color.setHex(stage==='off'?0x516359:0x9dbbaa);}
      rotors.forEach((rotor,i)=>{rotor.rotation.y=stage==='off'?0:clock*(stage==='online'?.7:.22)*(i?1:-1);});
    },
    diagnostics:()=>({stage,animationTime:clock,rotors:rotors.map(r=>r.rotation.y)}),
  };
}
