import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import './style.css';

async function start() {
  await RAPIER.init();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171b20);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 8, 8);
  camera.lookAt(0, 0, 0);
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x53585d, roughness: 0.9 }),
  );
  scene.add(floor, new THREE.HemisphereLight(0xffffff, 0x303038, 2));
  document.querySelector('#app')!.append(renderer.domElement);
  document.querySelector('#loading')!.remove();
  renderer.render(scene, camera);
}

start().catch((error: unknown) => {
  console.error(error);
  document.querySelector('#loading')!.textContent =
    'Die Arena konnte nicht starten. Bitte Chrome oder Edge mit Hardwarebeschleunigung verwenden.';
});
