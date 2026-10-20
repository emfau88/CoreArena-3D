import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import type { Snapshot, Vec3 } from '../core/types';
import { CAPSULE, CAPSULE_CENTER } from '../core/types';
import { ArenaCamera } from './camera';

export class ArenaView {
  readonly renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  readonly scene = new THREE.Scene();
  readonly camera = new ArenaCamera();
  readonly actor = new THREE.Group();
  readonly marker: THREE.Mesh;
  private readonly debugGeometry = new THREE.BufferGeometry();
  private readonly debug = new THREE.LineSegments(this.debugGeometry,
    new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: 0.8 }));
  private readonly position = new THREE.Vector3();

  constructor(host: HTMLElement, arena: ArenaDefinition) {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.domElement.setAttribute('aria-label', 'Obsidian Garden – begehbare 3D-Arena');
    this.renderer.domElement.tabIndex = 0;
    host.append(this.renderer.domElement);
    this.scene.background = new THREE.Color(0x171b20);
    this.scene.add(new THREE.HemisphereLight(0xf5f6f2, 0x34383d, 2));
    const sun = new THREE.DirectionalLight(0xfff3e4, 3);
    sun.position.set(-20, 35, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 25, bottom: -25, near: 1, far: 100 });
    sun.shadow.normalBias = 0.035;
    this.scene.add(sun);
    const materials = {
      floor: new THREE.MeshStandardMaterial({ color: 0x45494d, roughness: 0.95 }),
      stone: new THREE.MeshStandardMaterial({ color: 0x62676a, roughness: 0.88 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x363c42, roughness: 0.55, metalness: 0.65 }),
    };
    for (const box of arena.boxes) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z), materials[box.material]);
      mesh.name = box.id;
      mesh.position.set(box.center.x, box.center.y, box.center.z);
      mesh.castShadow = box.id !== 'floor';
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(CAPSULE.radius, CAPSULE.halfHeight * 2, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xcbd7d9, metalness: 0.4, roughness: 0.5 }));
    body.position.y = CAPSULE_CENTER;
    body.castShadow = true;
    this.actor.add(body);
    this.scene.add(this.actor);
    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.72, 48),
      new THREE.MeshBasicMaterial({ color: 0x91d6db, side: THREE.DoubleSide }));
    this.marker.rotation.x = -Math.PI / 2;
    this.scene.add(this.marker);
    this.debug.visible = false;
    this.debug.frustumCulled = false;
    this.debug.renderOrder = 10;
    this.scene.add(this.debug);
    this.resize();
  }
  resize(): void {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.resize(innerWidth, innerHeight);
  }
  draw(previous: Snapshot, current: Snapshot, alpha: number, dt: number): void {
    this.position.set(
      THREE.MathUtils.lerp(previous.position.x, current.position.x, alpha),
      THREE.MathUtils.lerp(previous.position.y, current.position.y, alpha),
      THREE.MathUtils.lerp(previous.position.z, current.position.z, alpha),
    );
    this.actor.position.copy(this.position);
    this.actor.rotation.y = current.facing;
    this.marker.position.set(this.position.x, 0.028, this.position.z);
    this.camera.follow(this.position, dt);
    this.renderer.render(this.scene, this.camera.camera);
  }
  showColliders(visible: boolean, lines?: { vertices: Float32Array; colors: Float32Array }): void {
    this.debug.visible = visible;
    if (visible && lines) {
      this.debugGeometry.setAttribute('position', new THREE.BufferAttribute(lines.vertices, 3));
      this.debugGeometry.setAttribute('color', new THREE.BufferAttribute(lines.colors, 4));
    }
  }
  projectedPosition(position: Vec3): { x: number; y: number } {
    const point = new THREE.Vector3(position.x, position.y + CAPSULE_CENTER, position.z).project(this.camera.camera);
    return { x: (point.x + 1) * innerWidth / 2, y: (1 - point.y) * innerHeight / 2 };
  }
  dispose(): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
