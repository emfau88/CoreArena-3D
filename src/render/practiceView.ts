import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import type { AimSolution, DiagnosticShot } from '../core/aim';
import type { Snapshot } from '../core/types';
import { createFighter } from './fighter';

export function labelMesh(text: string, width = 3): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 96;
  const context = canvas.getContext('2d')!;
  context.font = '600 64px Segoe UI'; context.textAlign = 'center';
  context.fillStyle = '#d8c69d'; context.fillText(text, 256, 65);
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, width * 96 / 512),
    new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
}

export class PracticeView {
  private readonly reticle = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.20, 24),
    new THREE.MeshBasicMaterial({ color: 0x91e6d4, side: THREE.DoubleSide, depthTest: false }));
  private readonly impact = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xf9ba6e, depthTest: false }));
  private readonly tracerGeometry = new THREE.BufferGeometry().setAttribute('position',
    new THREE.BufferAttribute(new Float32Array(6), 3));
  private readonly tracer = new THREE.Line(this.tracerGeometry, new THREE.LineBasicMaterial({ color: 0xb6fff1 }));
  private readonly gun = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x424e55, metalness: 0.7, roughness: 0.35 }));
  private readonly bot = createFighter(0xd7b779);
  private readonly targets = new Map<string, THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>>();
  private readonly normal = new THREE.Vector3();
  constructor(scene: THREE.Scene, arena: ArenaDefinition) {
    for (const target of arena.targets ?? []) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(target.radius, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xa96253, metalness: 0.55, roughness: 0.35, emissive: 0xffb881, emissiveIntensity: 0 }));
      mesh.position.set(target.center.x, target.center.y, target.center.z);
      mesh.castShadow = true;
      scene.add(mesh); this.targets.set(target.id, mesh);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(target.radius + 0.14, 0.035, 6, 32),
        new THREE.MeshStandardMaterial({ color: 0xd9bd87, metalness: 0.6, roughness: 0.3 }));
      hoop.rotation.x = Math.PI / 2; hoop.position.copy(mesh.position); scene.add(hoop);
      const label = labelMesh(`${target.level} / ZIEL`, 3.2);
      label.position.set(target.center.x, target.center.y - 1.07, target.center.z + 1.25);
      label.rotation.x = -Math.PI / 2; scene.add(label);
    }
    this.reticle.renderOrder = this.impact.renderOrder = 20;
    this.tracer.frustumCulled = false;
    this.bot.actor.visible = false;
    scene.add(this.reticle, this.impact, this.tracer, this.gun, this.bot.actor);
  }
  update(state: Snapshot, aim: AimSolution | null, shot: DiagnosticShot | null, bot: Snapshot | null, dt: number): void {
    this.reticle.visible = this.gun.visible = !!aim;
    if (aim) {
      this.reticle.position.set(aim.target.point.x, aim.target.point.y, aim.target.point.z);
      this.normal.set(aim.target.normal.x, aim.target.normal.y, aim.target.normal.z).normalize();
      this.reticle.position.addScaledVector(this.normal, 0.035);
      this.reticle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.normal);
      this.reticle.material.color.setHex(aim.blocked ? 0xffaa68 : 0x91e6d4);
      this.gun.position.set((state.position.x + aim.muzzle.x) / 2,
        (state.position.y + 1.15 + aim.muzzle.y) / 2, (state.position.z + aim.muzzle.z) / 2);
      this.gun.lookAt(aim.target.point.x, aim.target.point.y, aim.target.point.z);
    }
    const recent = !!shot && state.tick - shot.tick < 6;
    this.tracer.visible = this.impact.visible = recent;
    if (shot && recent) {
      const { muzzle, end } = shot.aim;
      const points = this.tracerGeometry.getAttribute('position') as THREE.BufferAttribute;
      points.setXYZ(0, muzzle.x, muzzle.y, muzzle.z); points.setXYZ(1, end.x, end.y, end.z);
      points.needsUpdate = true;
      this.impact.position.set(end.x, end.y, end.z);
    }
    for (const [id, mesh] of this.targets) mesh.material.emissiveIntensity = recent && shot?.aim.impact?.id === id ? 1.5 : 0;
    this.bot.actor.visible = !!bot;
    if (bot) {
      this.bot.actor.position.set(bot.position.x, bot.position.y, bot.position.z);
      this.bot.actor.rotation.y = bot.facing;
      this.bot.animate(Math.hypot(bot.velocity.x, bot.velocity.z), dt);
    }
  }
}
