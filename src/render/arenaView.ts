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
import type { WeaponSnapshot } from '../core/combat';
import type { PickupDefinition, PickupState } from '../core/pickups';
import { ARENA_PICKUPS } from '../arena/pickups';
import { CombatView } from './combatView';

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
  private readonly vitals = new THREE.Group();
  private readonly health = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.07), new THREE.MeshBasicMaterial({ color: 0x9be8ca }));
  private readonly armor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.035), new THREE.MeshBasicMaterial({ color: 0xe5c48b }));
  private readonly practice: PracticeView;
  private readonly combat: CombatView;
  private readonly raycaster = new THREE.Raycaster();
  private readonly animateEnvironment: ((dt: number) => void) | void;

  constructor(host: HTMLElement, arena: ArenaDefinition, options: { training?: boolean; pickups?: readonly PickupDefinition[]; shadowSpan?: number;
    build?: (scene: THREE.Scene, arena: ArenaDefinition) => void | ((dt: number) => void) } = {}) {
    const touch = matchMedia('(any-pointer: coarse)').matches;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1 : 1.5));
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
    sun.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 25, bottom: -25, near: 1, far: 100 });
    if (options.shadowSpan) Object.assign(sun.shadow.camera, { left: -options.shadowSpan, right: options.shadowSpan,
      top: options.shadowSpan, bottom: -options.shadowSpan });
    sun.shadow.normalBias = 0.035;
    this.scene.add(sun);
    this.animateEnvironment = (options.build ?? buildArena)(this.scene, arena);
    this.practice = new PracticeView(this.scene, arena, options.training ?? true);
    this.combat = new CombatView(this.scene, options.pickups ?? ARENA_PICKUPS);
    this.scene.add(this.actor);
    const vitalBack = new THREE.Mesh(new THREE.PlaneGeometry(1.52, 0.24),
      new THREE.MeshBasicMaterial({ color: 0x0b131a, transparent: true, opacity: 0.75, depthWrite: false }));
    vitalBack.position.z = -0.005;
    this.health.position.y = 0.04; this.armor.position.y = -0.045;
    this.vitals.add(vitalBack, this.health, this.armor); this.scene.add(this.vitals);
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
    aim: AimSolution | null = null, shot: DiagnosticShot | null = null, bot: Snapshot | null = null, match?: MatchSnapshot,
    weapons?: WeaponSnapshot, pickups?: readonly PickupState[]): void {
    this.position.set(
      THREE.MathUtils.lerp(previous.position.x, current.position.x, alpha),
      THREE.MathUtils.lerp(previous.position.y, current.position.y, alpha),
      THREE.MathUtils.lerp(previous.position.z, current.position.z, alpha),
    );
    this.actor.position.copy(this.position);
    this.actor.rotation.y = aim ? Math.atan2(aim.firePoint.x - current.position.x, aim.firePoint.z - current.position.z) : current.facing;
    this.fighter.animate(Math.hypot(current.velocity.x, current.velocity.z), dt);
    this.marker.position.set(this.position.x, this.position.y + 0.01, this.position.z);
    const life = match?.phase === 'ready' ? undefined : match?.actors.player;
    this.actor.visible = this.marker.visible = life?.alive ?? true;
    (this.marker.material as THREE.MeshBasicMaterial).color.setHex(life && life.protectionTicks > 0 ? 0xffdd88 : 0x91d6db);
    this.camera.follow(this.position, dt);
    this.vitals.visible = !!life?.alive;
    if (life) {
      this.vitals.position.copy(this.position).add(new THREE.Vector3(0, 2.15, 0));
      this.vitals.quaternion.copy(this.camera.camera.quaternion);
      this.health.scale.x = life.hp / 100; this.health.position.x = -(1 - life.hp / 100) * 0.7;
      this.armor.scale.x = life.armor / 100; this.armor.position.x = -(1 - life.armor / 100) * 0.7;
      this.health.material.color.setHex(life.hp <= 30 ? 0xff967f : 0x9be8ca);
    }
    this.practice.update(current, aim, shot, bot, dt, match, this.camera.camera, weapons?.selected);
    this.combat.update(!!match && match.phase !== 'ready', match?.tick ?? 0, weapons, pickups, this.camera.mode === 'side');
    this.animateEnvironment?.(dt);
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
