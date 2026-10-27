import * as THREE from 'three';
import type { ArenaDefinition } from '../arena/arena';
import type { AimSolution, DiagnosticShot } from '../core/aim';
import type { Snapshot } from '../core/types';
import { createFighter } from './fighter';
import type { MatchSnapshot } from '../core/match';
import { TRAINING_FIELD } from '../arena/training';
import { createWeaponModel } from './gear';
import type { WeaponId } from '../core/combat';

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
    new THREE.BufferAttribute(new Float32Array(27), 3));
  private readonly tracer = new THREE.Line(this.tracerGeometry, new THREE.LineBasicMaterial({ color: 0xd6a6ff }));
  private readonly gun = new THREE.Group();
  private readonly weapons = { arc: createWeaponModel('arc'), pulse: createWeaponModel('pulse') };
  private readonly bot = createFighter(0xd7b779);
  private readonly targets = new Map<string, THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>>();
  private readonly targetDetails = new Map<string, { hoop: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>; bars: THREE.Group; hp: THREE.Mesh; armor: THREE.Mesh }>();
  private readonly hazard = new THREE.Group();
  private readonly targetRoot = new THREE.Group();
  private readonly normal = new THREE.Vector3();
  constructor(scene: THREE.Scene, arena: ArenaDefinition, private readonly trainingEnabled = true) {
    this.gun.add(this.weapons.arc, this.weapons.pulse);
    for (const target of arena.targets ?? []) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(target.radius, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xa96253, metalness: 0.55, roughness: 0.35, emissive: 0xffb881, emissiveIntensity: 0 }));
      mesh.position.set(target.center.x, target.center.y, target.center.z);
      mesh.castShadow = true;
      this.targetRoot.add(mesh); this.targets.set(target.id, mesh);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(target.radius + 0.14, 0.035, 6, 32),
        new THREE.MeshStandardMaterial({ color: 0xd9bd87, metalness: 0.6, roughness: 0.3 }));
      hoop.rotation.x = Math.PI / 2; hoop.position.copy(mesh.position); this.targetRoot.add(hoop);
      const bars = new THREE.Group();
      bars.position.set(target.center.x, target.center.y + 1, target.center.z);
      const bar = (color: number, y: number) => {
        const item = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.09), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
        item.position.y = y; bars.add(item); return item;
      };
      const hp = bar(0xeaa18b, 0); const armor = bar(0x8ddcfa, 0.16);
      this.targetRoot.add(bars); this.targetDetails.set(target.id, { hoop, bars, hp, armor });
      const label = labelMesh(`${target.level} / ZIEL`, 3.2);
      label.position.set(target.center.x, target.center.y - 1.07, target.center.z + 1.25);
      label.rotation.x = -Math.PI / 2; this.targetRoot.add(label);
    }
    this.reticle.renderOrder = this.impact.renderOrder = 20;
    this.tracer.frustumCulled = false;
    this.bot.actor.visible = false;
    const field = new THREE.Mesh(new THREE.PlaneGeometry(TRAINING_FIELD.width, TRAINING_FIELD.depth),
      new THREE.MeshBasicMaterial({ color: 0xe98754, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    field.rotation.x = -Math.PI / 2;
    this.hazard.position.set(TRAINING_FIELD.x, 0.035, TRAINING_FIELD.z);
    const fieldLabel = labelMesh('SCHADENSFELD', 3.1); fieldLabel.rotation.x = -Math.PI / 2; fieldLabel.position.z = 2;
    this.hazard.add(field, fieldLabel); scene.add(this.hazard);
    scene.add(this.reticle, this.impact, this.tracer, this.gun, this.bot.actor, this.targetRoot);
  }
  update(state: Snapshot, aim: AimSolution | null, shot: DiagnosticShot | null, bot: Snapshot | null, dt: number, match?: MatchSnapshot, camera?: THREE.Camera, selected: WeaponId = 'arc'): void {
    this.weapons.arc.visible = selected === 'arc'; this.weapons.pulse.visible = selected === 'pulse';
    this.reticle.visible = this.gun.visible = !!aim;
    if (aim) {
      this.reticle.position.set(aim.target.point.x, aim.target.point.y, aim.target.point.z);
      this.normal.set(aim.target.normal.x, aim.target.normal.y, aim.target.normal.z).normalize();
      this.reticle.position.addScaledVector(this.normal, 0.035);
      this.reticle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.normal);
      this.reticle.material.color.setHex(aim.blocked ? 0xffaa68 : 0x91e6d4);
      this.gun.position.set((state.position.x + aim.muzzle.x) / 2,
        (state.position.y + 1.15 + aim.muzzle.y) / 2, (state.position.z + aim.muzzle.z) / 2);
      this.gun.lookAt(aim.firePoint.x, aim.firePoint.y, aim.firePoint.z);
    }
    const tick = match && match.phase !== 'ready' ? match.tick : state.tick;
    const recent = !!shot && tick - shot.tick >= 0 && tick - shot.tick < 6;
    this.tracer.visible = this.impact.visible = recent;
    if (shot && recent) {
      const { muzzle, end } = shot.aim;
      const points = this.tracerGeometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < 9; i++) {
        const t = i / 8, jitter = i === 0 || i === 8 ? 0 : Math.sin(i * 13 + tick * 3) * 0.12;
        points.setXYZ(i, muzzle.x + (end.x - muzzle.x) * t + jitter,
          muzzle.y + (end.y - muzzle.y) * t + jitter * 0.5, muzzle.z + (end.z - muzzle.z) * t - jitter);
      }
      points.needsUpdate = true;
      this.impact.position.set(end.x, end.y, end.z);
    }
    const training = match?.phase !== undefined && match.phase !== 'ready';
    this.targetRoot.visible = !match?.actors.rival;
    this.hazard.visible = this.trainingEnabled && training && !match?.actors.rival;
    for (const [id, mesh] of this.targets) {
      const life = training ? match?.actors[id] : undefined;
      const detail = this.targetDetails.get(id)!;
      mesh.visible = detail.hoop.visible = life?.alive ?? true;
      mesh.material.emissiveIntensity = recent && shot?.aim.impact?.id === id ? 1.5 : 0;
      detail.hoop.material.color.setHex(life && life.protectionTicks > 0 ? 0x8ddcfa : 0xd9bd87);
      detail.bars.visible = !!life?.alive;
      if (life) { detail.hp.scale.x = life.hp / 100; detail.armor.scale.x = life.armor / 100; }
      if (camera) detail.bars.quaternion.copy(camera.quaternion);
    }
    this.bot.actor.visible = !!bot;
    if (bot) {
      this.bot.actor.position.set(bot.position.x, bot.position.y, bot.position.z);
      this.bot.actor.rotation.y = bot.facing;
      this.bot.animate(Math.hypot(bot.velocity.x, bot.velocity.z), dt);
    }
  }
}
