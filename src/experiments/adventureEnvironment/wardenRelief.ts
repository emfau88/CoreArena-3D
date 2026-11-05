import * as THREE from 'three';

type Point = readonly [x:number, y:number];
type Cut=(loop:Point[],foot:number,lip:number,peak:number,tint:number,crest?:Point)=>void;

/** Fragments of a monumental stone warden. Local Z measures depth into each carving. */
export function createWardenRelief(material: THREE.Material, fragment:'face'|'hand'): THREE.Mesh {
  const positions:number[] = [], colors:number[] = [], uvs:number[] = [];
  const shade = new THREE.Color();
  const vertex = (p:Point, depth:number, tint:number, light:number) => {
    positions.push(p[0],p[1],depth);
    uvs.push((p[0]+depth*.23)/3.1,(p[1]+depth*.37)/3.1);
    shade.setHex(tint).multiplyScalar(light).toArray(colors,colors.length);
  };
  // Each cut has a buried foot, a chipped bevel and a sloping crown. Adjacent
  // cuts overlap in depth so eye sockets and broken plates have real side walls.
  function cut(loop:Point[], foot:number, lip:number, peak:number, tint:number, crest?:Point) {
    let area=0;
    for (let i=0;i<loop.length;i++) {
      const a=loop[i]!, b=loop[(i+1)%loop.length]!;
      area+=a[0]*b[1]-a[1]*b[0];
    }
    const points=area>0?loop:[...loop].reverse();
    const center:Point=[points.reduce((n,p)=>n+p[0],0)/points.length,points.reduce((n,p)=>n+p[1],0)/points.length];
    const bevel=points.map(([x,y]):Point=>[THREE.MathUtils.lerp(x,center[0],.13),THREE.MathUtils.lerp(y,center[1],.13)]);
    for(let i=0;i<points.length;i++){
      const j=(i+1)%points.length, a=points[i]!, b=points[j]!, c=bevel[i]!, d=bevel[j]!;
      const facet=.90+.08*Math.sin(i*2.4);
      vertex(a,foot,tint,.31);vertex(b,foot,tint,.31);vertex(d,lip,tint,.74);
      vertex(a,foot,tint,.31);vertex(d,lip,tint,.74);vertex(c,lip,tint,.74);
      vertex(c,lip,tint,facet);vertex(d,lip,tint,facet);vertex(crest??center,peak,tint,1.04);
    }
  }
  if(fragment==='face') carveFace(cut);
  else carveHand(cut);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='buried-warden-'+fragment;
  const normal=(fragment==='face'?new THREE.Vector3(.47,.84,-.18):new THREE.Vector3(.42,.93,-.04)).normalize();
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),normal).normalize();
  const up=new THREE.Vector3().crossVectors(normal,right);
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,normal));
  mesh.rotateZ(fragment==='face'?-.13:-.25);
  mesh.castShadow=mesh.receiveShadow=true;
  return mesh;
}

function carveFace(cut:Cut){
  const slate=0x94a5a4, face=0xb9c2b1, fresh=0xcdd1be, dark=0x738781;
  cut([[-2.72,-1.4],[-2.25,-2.34],[-.66,-2.75],[1.36,-2.63],[2.5,-1.24],
    [2.72,.72],[1.8,1.89],[.61,2.27],[-1.34,2.19],[-2.59,1.28]],-3.7,0,.15,slate);
  cut([[-1.86,.86],[-1.22,1.91],[.52,2.1],[1.58,1.58],[1.91,.56],[1.34,.22],
    [.17,.49],[-.96,.26]],.02,.42,.75,face,[.05,1.38]);
  for(const sign of [-1,1]){
    const mirrored=(points:Point[])=>points.map(([x,y]):Point=>[sign*x,y]);
    const tip=sign>0?2.65:3.1;
    cut(mirrored([[1.3,1.22],[1.48,2.05],[2.5,tip],[2.27,1.83],[2.36,1.34],
      [1.94,.72]]),-.33,.28,.89,slate,[sign*1.85,1.69]);
    // A long heavy brow casts into a recessed, deliberately dull amber eye slit.
    cut(mirrored([[.15,.43],[.68,.70],[1.53,.73],[2.10,1.05],[1.86,.43],
      [.70,.13],[.16,.07]]),.12,.67,.91,fresh,[sign*.77,.49]);
    cut(mirrored([[.46,.00],[.78,.09],[1.47,.26],[1.29,.08],[.69,-.115]]),.14,.22,.25,0xdaa459);
    cut(mirrored([[.50,-.35],[1.40,-.07],[1.90,.21],[1.83,-.66],
      [1.02,-1.50],[.74,-.96]]),.02,.48,.75,face,[sign*1.29,-.52]);
    cut(mirrored([[1.97,.25],[2.42,.48],[2.24,-.67],[1.48,-1.47],[1.65,-.71]]),
      -.08,.22,.38,dark);
  }
  cut([[-.20,.53],[.17,.57],[.35,-.46],[.57,-.72],[.12,-.89],[-.49,-.69]],.05,.49,1.07,
    fresh,[.04,-.44]);
  cut([[-1.05,-1.46],[-.58,-.97],[-.08,-1.09],[.41,-.98],[1.03,-1.37],
    [.55,-1.43],[-.04,-1.35]],.02,.31,.50,face);
  cut([[-.93,-1.62],[-.19,-1.55],[.77,-1.68],[.62,-2.14],[-.27,-2.39],[-.85,-2.10]],
    -.02,.37,.62,slate);
}

function carveHand(cut:Cut){
  const slate=0x9caaa7, worn=0xc0c6b2, joint=0x80908d;
  cut([[-3.05,-.23],[-2.83,.88],[-1.76,1.21],[-1.12,.78],[-1.26,-.62],[-2.32,-.80]],-2.5,.24,.55,slate);
  cut([[-1.70,.74],[-.87,1.38],[.24,1.35],[.72,.81],[.69,-.64],[-.21,-1.30],
    [-1.17,-1.13],[-1.7,-.49]],-1.85,.66,.93,worn,[-.67,.31]);
  // The thumb splays away from the four curled fingers, partly buried at the wrist.
  cut([[-1.47,-.68],[-.94,-.7],[-.53,-1.26],[-.68,-1.62],[-1.17,-1.86],[-1.54,-1.43]],-1.3,.39,.58,slate);
  cut([[-1.13,-1.54],[-.66,-1.44],[-.18,-1.71],[-.32,-2.04],[-.86,-2.07]],-1,.20,.36,worn);
  for(const [y,length,w] of [[.97,1.48,.20],[.38,2.03,.25],[-.23,2.31,.26],[-.82,1.95,.23]] as const){
    cut([[.04,y-w],[.50,y+w],[1.04,y+w*.8],[1.14,y-w*.8],[.57,y-w*1.25]],-.95,.59,.87,slate,[.61,y+.05]);
    cut([[.94,y+w*.78],[length-.10,y+w],[length+.13,y-.02],[length-.02,y-w*1.15],[1.06,y-w*.85]],-.91,.38,.68,worn);
    cut([[length-.07,y-w],[length+.14,y+.01],[length+.49,y-.20],[length+.51,y-.45],[length+.18,y-.48]],-1,.16,.34,joint);
  }
}
