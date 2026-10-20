import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import type { Ray, Snapshot, Vec3 } from '../core/types';
import type { AimSolution, DiagnosticShot } from '../core/aim';
import { PracticeView } from './practiceView';
import { CAPSULE_CENTER } from '../core/types';
import { ArenaCamera } from './camera';
import { buildArena } from './buildArena';
import { createFighter } from './fighter';
import type { MatchSnapshot } from '../core/match';

export class ArenaView {
  readonly renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  readonly scene = new THREE.Scene();
  readonly camera = new ArenaCamera();
  private readonly fighter = createFighter();
  readonly actor = this.fighter.actor;
  readonly marker: THREE.Mesh;
  private readonly debugGeometry = new THREE.BufferGeometry();
  private readonly debug = new THREE.LineSegments(this.debugGeometry,
    new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: 0.8 }));
  private readonly position = new THREE.Vector3();
  private readonly practice: PracticeView;
  private readonly raycaster = new THREE.Raycaster();

  constructor(host: HTMLElement, arena: ArenaDefinition) {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.domElement.setAttribute('aria-label', 'Obsidian Garden – begehbare 3D-Arena');
    this.renderer.domElement.tabIndex = 0;
    host.append(this.renderer.domElement);
    this.scene.background = new THREE.Color(0x171b20);
    this.scene.add(new THREE.HemisphereLight(0xf5f6f2, 0x34383d, 1.6));
    const sun = new THREE.DirectionalLight(0xfff3e4, 2.7);
    sun.position.set(-20, 35, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 25, bottom: -25, near: 1, far: 100 });
    sun.shadow.normalBias = 0.035;
    this.scene.add(sun);
    buildArena(this.scene, arena);
    this.practice = new PracticeView(this.scene, arena);
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
  draw(previous: Snapshot, current: Snapshot, alpha: number, dt: number,
    aim: AimSolution | null = null, shot: DiagnosticShot | null = null, bot: Snapshot | null = null, match?: MatchSnapshot): void {
    this.position.set(
      THREE.MathUtils.lerp(previous.position.x, current.position.x, alpha),
      THREE.MathUtils.lerp(previous.position.y, current.position.y, alpha),
      THREE.MathUtils.lerp(previous.position.z, current.position.z, alpha),
    );
    this.actor.position.copy(this.position);
    this.actor.rotation.y = aim ? Math.atan2(aim.target.point.x - current.position.x, aim.target.point.z - current.position.z) : current.facing;
    this.fighter.animate(Math.hypot(current.velocity.x, current.velocity.z), dt);
    this.marker.position.set(this.position.x, this.position.y + 0.01, this.position.z);
    const life = match?.phase === 'ready' ? undefined : match?.actors.player;
    this.actor.visible = this.marker.visible = life?.alive ?? true;
    (this.marker.material as THREE.MeshBasicMaterial).color.setHex(life && life.protectionTicks > 0 ? 0xffdd88 : 0x91d6db);
    this.camera.follow(this.position, dt);
    this.practice.update(current, aim, shot, bot, dt, match, this.camera.camera);
    this.renderer.render(this.scene, this.camera.camera);
  }
  pointerRay(x: number, y: number): Ray {
    this.raycaster.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, 1 - y / innerHeight * 2), this.camera.camera);
    return { origin: { ...this.raycaster.ray.origin }, direction: { ...this.raycaster.ray.direction } };
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
    const textures = new Set<THREE.Texture>();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
