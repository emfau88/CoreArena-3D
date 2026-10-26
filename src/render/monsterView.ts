import * as THREE from 'three';
import { MONSTER, PVE_RULES, type PveSnapshot } from '../core/pve';

/** Procedural stone creature: all geometry stays in the repo; no asset/CDN dependency. */
export class MonsterView {
  private readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly arms: THREE.Group[] = [];
  private readonly coreMaterial = new THREE.MeshStandardMaterial({ color: 0xffcf75, emissive: 0xff732c, emissiveIntensity: 2.4, roughness: 0.25 });
  private readonly warningMaterial = new THREE.MeshBasicMaterial({ color: 0xffb84f, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
  private readonly warning = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 64), this.warningMaterial);
  private readonly wave = new THREE.Mesh(new THREE.RingGeometry(0.97, 1.03, 96), new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  private readonly burst = new THREE.Group();
  private readonly debris: THREE.Mesh[] = [];
  private previousHp = PVE_RULES.bossHp as number;
  private flash = 0;
  private deathTime = 0;
  constructor(scene: THREE.Scene) {
    const rock = new THREE.MeshStandardMaterial({ color: 0x343b40, roughness: 0.8, metalness: 0.3, flatShading: true });
    const edge = new THREE.MeshStandardMaterial({ color: 0x727c76, roughness: 0.7, metalness: 0.2, flatShading: true });
    const chunk = (parent: THREE.Group, size: number, x: number, y: number, z: number, material = rock) => {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), material);
      mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
    };
    chunk(this.body, 1.75, 0, 1.8, 0).scale.set(1, 1.05, 0.75);
    chunk(this.body, 0.98, 0, 3.45, 0.15, edge).scale.set(1, 0.85, 0.8);
    chunk(this.body, 0.5, 0, 2.05, 1.18, this.coreMaterial).scale.set(0.65, 1, 0.35);
    for (const side of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(side * 1.55, 2.55, 0); this.body.add(arm); this.arms.push(arm);
      chunk(arm, 0.85, 0, 0, 0, edge);
      chunk(arm, 0.68, side * 0.45, -0.85, 0.1);
      chunk(arm, 0.9, side * 0.55, -1.5, 0.5, edge);
      chunk(this.body, 0.11, side * 0.3, 3.55, 0.83, this.coreMaterial).scale.set(2, 0.65, 0.6);
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.3, 5), edge);
      horn.position.set(side * 0.65, 4.2, 0); horn.rotation.z = -side * 0.4; this.body.add(horn);
    }
    const crater = new THREE.Mesh(new THREE.CircleGeometry(2.75, 48), new THREE.MeshStandardMaterial({ color: 0x101315, roughness: 1 }));
    crater.rotation.x = -Math.PI / 2; crater.position.y = 0.025; this.root.add(crater);
    for (let i = 0; i < 18; i++) {
      const angle = i * Math.PI * 2 / 18;
      const stone = chunk(this.root, 0.18 + (i % 4) * 0.08, Math.cos(angle) * 2.65, 0.15, Math.sin(angle) * 2.65, edge);
      stone.rotation.set(i, i * 0.4, i * 0.7); this.debris.push(stone);
    }
    for (let i = 0; i < 9; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.35 + i % 2 * 0.15, 2.5 + i % 3 * 0.45, 5), edge);
      const angle = i * Math.PI * 2 / 9;
      spike.position.set(Math.cos(angle) * 1.6, 1.3, Math.sin(angle) * 1.6); this.burst.add(spike);
    }
    this.root.position.set(MONSTER.center.x, 0, MONSTER.center.z); this.root.add(this.body);
    this.warning.rotation.x = this.wave.rotation.x = -Math.PI / 2;
    scene.add(this.root, this.warning, this.wave, this.burst);
  }
  update(state: PveSnapshot, dt: number): void {
    if (state.bossHp < this.previousHp) this.flash = 0.1;
    this.previousHp = state.bossHp; this.flash = Math.max(0, this.flash - dt);
    this.coreMaterial.emissiveIntensity = this.flash > 0 ? 6 : 2 + Math.sin(state.tick / 10) * 0.5;
    const emergence = state.phase === 'emerging' ? Math.min(1, state.phaseTick / PVE_RULES.emergeTicks) : 1;
    this.deathTime = state.outcome === 'victory' ? Math.min(1, this.deathTime + dt) : 0;
    this.body.position.y = -4.6 * (1 - emergence) - this.deathTime * 4.4;
    this.body.rotation.z = Math.sin(state.tick / 18) * 0.018 + this.deathTime * 0.18;
    this.body.visible = emergence > 0.12 && this.deathTime < 1;
    const windup = state.phase === 'warning' ? state.phaseTick / (state.kind === 'wave' ? PVE_RULES.waveWarning : PVE_RULES.eruptionWarning) : 0;
    this.arms.forEach((arm, index) => {
      arm.rotation.x = state.phase === 'attack' ? -0.3 * Math.max(0, 1 - state.phaseTick / 15) : -windup * 2.1;
      arm.rotation.z = (index === 0 ? 1 : -1) * (state.phase === 'recovery' ? 0.12 : windup * 0.2);
    });
    this.debris.forEach((rock, i) => {
      rock.position.y = 0.15 + (state.phase === 'emerging' ? Math.sin(emergence * Math.PI) * (1 + i % 4 * 0.4) : 0);
    });
    this.warning.visible = state.outcome === 'running' && (state.phase === 'warning' || state.phase === 'emerging');
    const eruption = state.kind === 'eruption' && state.phase === 'warning';
    this.warning.position.set(eruption ? state.target.x : MONSTER.center.x, (eruption ? state.target.y : 0) + 0.06,
      eruption ? state.target.z : MONSTER.center.z);
    const radius = eruption ? PVE_RULES.eruptionRadius : 2.9;
    this.warning.scale.setScalar(radius); this.warningMaterial.opacity = 0.4 + Math.sin(state.tick / 5) * 0.2 + windup * 0.35;
    this.wave.visible = state.phase === 'attack' && state.kind === 'wave' && state.outcome === 'running';
    this.wave.position.set(MONSTER.center.x, 0.09, MONSTER.center.z); this.wave.scale.setScalar(state.waveRadius);
    this.burst.visible = state.kind === 'eruption' && state.phase === 'attack' && state.outcome === 'running';
    this.burst.position.set(state.target.x, state.target.y, state.target.z);
    this.burst.scale.y = Math.max(0.01, Math.sin(Math.min(1, state.phaseTick / PVE_RULES.eruptionTicks) * Math.PI));
  }
}
