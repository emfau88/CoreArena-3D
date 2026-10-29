import * as THREE from 'three';

/** First courier silhouette pass. Edit owned bind-pose vertices, never animated bones. */
export function applyCourierLook(body:THREE.Object3D):void {
  const oldMaterials=new Set<THREE.MeshStandardMaterial>();
  body.traverse(object=>{
    if(!(object instanceof THREE.SkinnedMesh))return;
    const head=object.name.includes('Head'),torso=object.name.includes('Body');
    const leg=object.name.includes('Leg'),arm=object.name.includes('Arm');
    const geometry=object.geometry,p=geometry.getAttribute('position');
    const trim=new Float32Array(p.count);
    geometry.computeBoundingBox();
    const bottom=geometry.boundingBox!.min.y;
    for(let i=0;i<p.count;i++){
      let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      if(head){x*=1.05;y=bottom+(y-bottom)*.9;}
      if(torso){
        // Gentle pear shape below the shoulders; keep arm/neck attachment points.
        const fullness=1-THREE.MathUtils.smoothstep(y,.45,1.2);
        x*=1+.1*fullness;z*=1+.07*fullness;
      }
      if(leg){
        const boot=1-THREE.MathUtils.smoothstep(y,.15,.3),center=Math.sign(x)*.171;
        x=center+(x-center)*(1+.18*boot);z=.03+(z-.03)*(1+.2*boot);
        trim[i]=1-THREE.MathUtils.smoothstep(y,.19,.23);
      }
      if(arm)trim[i]=THREE.MathUtils.smoothstep(Math.abs(x),.72,.81);
      p.setXYZ(i,x,y,z);
    }
    p.needsUpdate=true;
    geometry.setAttribute('courierTrim',new THREE.BufferAttribute(trim,1));
    geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const source=object.material as THREE.MeshStandardMaterial;
    oldMaterials.add(source);
    const mat=source.clone();mat.color.setHex(0xffffff);mat.roughness=head?.7:.86;mat.metalness=0;
    // Recolour only painted atlas regions; preserve the original dark face/seams/buttons.
    // No extra bitmap or changes to the shared KayKit source/guard instances.
    mat.onBeforeCompile=shader=>{
      shader.uniforms.courierPaint={value:new THREE.Color(head?0xf4e4c6:0xd96c50)};
      shader.uniforms.courierGraphite={value:new THREE.Color(0x303b43)};
      shader.uniforms.courierHelmet={value:head?1:0};
      shader.vertexShader=shader.vertexShader.replace('#include <common>',
        '#include <common>\nattribute float courierTrim;\nvarying float vCourierTrim;');
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nvCourierTrim=courierTrim;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
        '#include <common>\nuniform vec3 courierPaint;\nuniform vec3 courierGraphite;\nuniform float courierHelmet;\nvarying float vCourierTrim;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        float courierHi=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
        float courierLo=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
        float courierMask=mix(smoothstep(.03,.12,courierHi-courierLo),smoothstep(.08,.28,courierHi),courierHelmet);
        vec3 courierColour=mix(courierPaint,courierGraphite,vCourierTrim);
        diffuseColor.rgb=mix(diffuseColor.rgb,courierColour*mix(.6,1.,clamp(courierHi*2.,0.,1.)),courierMask);
      `);
    };
    mat.customProgramCacheKey=()=> 'ruins-courier-palette-v1';
    object.material=mat;
  });
  // The replacement materials still share this actor's owned texture.
  oldMaterials.forEach(material=>material.dispose());
}
