import * as THREE from 'three';
import { MONSTER, PVE_RULES, frostShards, type MonsterKind, type EncounterRules, type PveSnapshot } from '../core/pve';

/** Procedural stone creature: all geometry stays in the repo; no asset/CDN dependency. */
export class MonsterView {
  private readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly arms: THREE.Group[] = [];
  private readonly feet: THREE.Mesh[] = [];
  private readonly limbs: THREE.Group[] = [];
  private readonly shards = new THREE.Group();
  private readonly attackFan = new THREE.Group();
  private readonly meleeArc: THREE.Mesh;
  private readonly coreMaterial = new THREE.MeshStandardMaterial({ color: 0xffcf75, emissive: 0xff732c, emissiveIntensity: 2.4, roughness: 0.25 });
  private readonly warningMaterial = new THREE.MeshBasicMaterial({ color: 0xffb84f, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
  private readonly warning = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 64), this.warningMaterial);
  private readonly wave = new THREE.Mesh(new THREE.RingGeometry(0.97, 1.03, 96), new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  private readonly burst = new THREE.Group();
  private readonly debris: THREE.Mesh[] = [];
  private previousHp = PVE_RULES.bossHp as number;
  private flash = 0;
  private deathTime = 0;
  constructor(scene: THREE.Scene, private readonly kind: MonsterKind = 'stone', private readonly rules: EncounterRules = PVE_RULES, private readonly monster = MONSTER) {
    this.meleeArc = new THREE.Mesh(new THREE.RingGeometry(rules.meleeRange - 0.12, rules.meleeRange, 32, 1,
      Math.PI / 2 - 1.05, 2.1), new THREE.MeshBasicMaterial({ color: 0xff9b73, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false }));
    this.meleeArc.rotation.x = Math.PI / 2;
    scene.add(this.meleeArc);
    this.previousHp = rules.bossHp;
    const rock = new THREE.MeshStandardMaterial({ color: 0x343b40, roughness: 0.8, metalness: 0.3, flatShading: true });
    const edge = new THREE.MeshStandardMaterial({ color: 0x727c76, roughness: 0.7, metalness: 0.2, flatShading: true });
    if (kind !== 'stone') {
      rock.color.setHex(kind === 'frost' ? 0x396a8e : 0x3d2830);
      edge.color.setHex(kind === 'frost' ? 0x90d7ed : 0x80514a);
      this.coreMaterial.color.setHex(kind === 'frost' ? 0xc4faff : 0xffc44d);
      this.coreMaterial.emissive.setHex(kind === 'frost' ? 0x29bfff : 0xff400a);
    }
    const chunk = (parent: THREE.Group, size: number, x: number, y: number, z: number, material = rock) => {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), material);
      mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
    };
    if (kind === 'stone') {
    chunk(this.body, 1.75, 0, 1.8, 0).scale.set(1, 1.05, 0.75);
    chunk(this.body, 0.98, 0, 3.45, 0.15, edge).scale.set(1, 0.85, 0.8);
    chunk(this.body, 0.5, 0, 2.05, 1.18, this.coreMaterial).scale.set(0.65, 1, 0.35);
    for (const side of [-1, 1]) {
      const foot = chunk(this.body, 0.65, side * 0.85, 0.35, 0.2, edge);
      foot.scale.set(0.8, 0.6, 1.15); this.feet.push(foot);
      const arm = new THREE.Group(); arm.position.set(side * 1.55, 2.55, 0); this.body.add(arm); this.arms.push(arm);
      chunk(arm, 0.85, 0, 0, 0, edge);
      chunk(arm, 0.68, side * 0.45, -0.85, 0.1);
      chunk(arm, 0.9, side * 0.55, -1.5, 0.5, edge);
      chunk(this.body, 0.11, side * 0.3, 3.55, 0.83, this.coreMaterial).scale.set(2, 0.65, 0.6);
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.3, 5), edge);
      horn.position.set(side * 0.65, 4.2, 0); horn.rotation.z = -side * 0.4; this.body.add(horn);
    }
    } else if (kind === 'frost') {
      chunk(this.body, 1.6, 0, 1.5, -0.6, edge).scale.set(1, 0.65, 1.2);
      chunk(this.body, 0.9, 0, 1.4, 1, rock).scale.set(1, 0.65, 0.9);
      chunk(this.body, 0.5, 0, 2.3, -0.6, this.coreMaterial);
      for (const side of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Group(); leg.position.set(side * 0.8, 1.3, -1.2 + i * 0.75);
          const joint = new THREE.Vector3(side * 1.45, 0.3, (i - 1.5) * 0.3);
          const tip = new THREE.Vector3(side * 2.1, -1.22, (i - 1.5) * 0.55);
          for (const [a, b] of [[new THREE.Vector3(), joint], [joint, tip]] as const) {
            const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.19, a.distanceTo(b), 5), edge);
            limb.position.copy(a).add(b).multiplyScalar(0.5);
            limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); leg.add(limb);
          }
          this.body.add(leg); this.limbs.push(leg);
        }
        for (let i = 0; i < 2; i++) chunk(this.body, 0.12, side * (0.22 + i * 0.27), 1.55, 1.73 - i * 0.1, this.coreMaterial);
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.8, 5), edge);
        fang.position.set(side * 0.4, 0.9, 1.65); fang.rotation.x = Math.PI; this.body.add(fang);
      }
    } else {
      chunk(this.body, 1.6, 0, 1.5, -0.4).scale.set(1, 1, 0.9);
      chunk(this.body, 1.25, 0, 2.85, 0.4, edge).scale.set(1, 0.8, 1);
      chunk(this.body, 0.7, 0, 2.35, 1.35, this.coreMaterial).scale.set(1, 0.45, 0.4);
      for (let i = 0; i < 5; i++) {
        const segment = new THREE.Group(); segment.position.set(Math.sin(i * 0.7) * 0.7, 0.65, -1.2 - i * 0.58);
        chunk(segment, 0.9 - i * 0.12, 0, 0, 0, i % 2 ? edge : rock); this.body.add(segment); this.limbs.push(segment);
        const fin = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.85, 4), this.coreMaterial);
        fin.position.y = 0.7 - i * 0.07; segment.add(fin);
      }
      for (const side of [-1, 1]) {
        chunk(this.body, 0.16, side * 0.55, 3.08, 1.33, this.coreMaterial);
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.4, 5), edge);
        horn.position.set(side * 0.8, 3.8, 0.1); horn.rotation.z = -side * 0.45; this.body.add(horn);
      }
    }
    const crater = new THREE.Mesh(new THREE.CircleGeometry(2.75, 48), new THREE.MeshStandardMaterial({ color: 0x101315, roughness: 1 }));
    const ground = new THREE.Group(); ground.position.set(this.monster.center.x, 0, this.monster.center.z);
    crater.rotation.x = -Math.PI / 2; crater.position.y = 0.025; ground.add(crater);
    for (let i = 0; i < 18; i++) {
      const angle = i * Math.PI * 2 / 18;
      const stone = chunk(ground, 0.18 + (i % 4) * 0.08, Math.cos(angle) * 2.65, 0.15, Math.sin(angle) * 2.65, edge);
      stone.rotation.set(i, i * 0.4, i * 0.7); this.debris.push(stone);
    }
    for (let i = 0; i < 9; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.35 + i % 2 * 0.15, 2.5 + i % 3 * 0.45, 5), edge);
      const angle = i * Math.PI * 2 / 9;
      spike.position.set(Math.cos(angle) * 1.6, 1.3, Math.sin(angle) * 1.6); this.burst.add(spike);
    }
    this.root.position.set(this.monster.center.x, 0, this.monster.center.z); this.root.add(this.body);
    this.warning.rotation.x = this.wave.rotation.x = -Math.PI / 2;
    if (kind === 'frost') {
      for (let i = 0; i < 3; i++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), this.coreMaterial); shard.scale.set(0.65, 0.65, 1.8); this.shards.add(shard);
        const line = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 16), this.warningMaterial);
        line.rotation.x = -Math.PI / 2;
        const pivot = new THREE.Group(); pivot.rotation.y = (i - 1) * 0.38; line.position.set(0, 0.05, 8); pivot.add(line); this.attackFan.add(pivot);
      }
    } else if (kind === 'ember') {
      const vertices: number[] = [];
      for (let i = 0; i < 20; i++) {
        const a = -0.48 + i * 0.048, b = a + 0.048;
        vertices.push(0, 0.05, 0, Math.sin(a) * 11, 0.05, Math.cos(a) * 11, Math.sin(b) * 11, 0.05, Math.cos(b) * 11);
      }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      this.attackFan.add(new THREE.Mesh(geometry, this.warningMaterial));
      for (let i = 0; i < 12; i++) {
        const flame = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), this.coreMaterial);
        const distance = 2 + i % 4 * 2.1, angle = (Math.floor(i / 4) - 1) * 0.3;
        flame.position.set(Math.sin(angle) * distance, 0.8, Math.cos(angle) * distance); flame.scale.set(0.65, 1.5, 0.65); this.shards.add(flame);
      }
    }
    scene.add(ground, this.root, this.warning, this.wave, this.burst, this.shards, this.attackFan);
  }
  update(state: PveSnapshot, dt: number): void {
    this.root.position.set(state.center.x, state.center.y - this.monster.center.y, state.center.z);
    const turn = Math.atan2(Math.sin(state.facing - this.root.rotation.y), Math.cos(state.facing - this.root.rotation.y));
    this.root.rotation.y = state.phase === 'emerging' ? 0 : this.root.rotation.y + turn * Math.min(1, dt * 9);
    const stride = state.moving ? Math.sin(state.tick * 0.16) : 0;
    this.limbs.forEach((limb, i) => {
      if (this.kind === 'frost') limb.rotation.z = stride * (i % 2 ? 0.13 : -0.13);
      else limb.rotation.y = Math.sin(state.tick * 0.12 - i * 0.7) * (state.moving ? 0.25 : 0.06);
    });
    this.feet.forEach((foot, i) => {
      const step = stride * (i === 0 ? 1 : -1);
      foot.position.z = 0.2 + step * 0.42; foot.position.y = 0.35 + Math.max(0, step) * 0.24;
    });
    if (state.bossHp < this.previousHp) this.flash = 0.1;
    this.previousHp = state.bossHp; this.flash = Math.max(0, this.flash - dt);
    this.coreMaterial.emissiveIntensity = this.flash > 0 ? 6 : 2 + Math.sin(state.tick / 10) * 0.5;
    const emergence = state.phase === 'emerging' ? Math.min(1, state.phaseTick / this.rules.emergeTicks) : 1;
    this.deathTime = state.outcome === 'victory' ? Math.min(1, this.deathTime + dt) : 0;
    this.body.position.y = -4.6 * (1 - emergence) - this.deathTime * 4.4 + Math.abs(stride) * 0.09;
    this.body.rotation.z = Math.sin(state.tick / 18) * 0.018 + this.deathTime * 0.18 + stride * 0.035;
    const melee = state.phase === 'melee' && state.outcome === 'running';
    const preparation = melee ? Math.min(1, state.phaseTick / this.rules.meleeWarning) : 0;
    const strike = melee && state.phaseTick >= this.rules.meleeWarning
      ? Math.max(0, 1 - (state.phaseTick - this.rules.meleeWarning) / this.rules.meleeRecovery) : 0;
    this.body.rotation.x = melee ? (strike ? strike * 0.22 : -preparation * 0.12) : 0;
    this.body.position.z = melee ? (strike ? strike * 0.55 : -preparation * 0.18) : 0;
    this.meleeArc.visible = melee;
    this.meleeArc.position.set(state.center.x, 0.07, state.center.z);
    this.meleeArc.rotation.set(Math.PI / 2, 0, -state.facing);
    (this.meleeArc.material as THREE.MeshBasicMaterial).opacity = strike ? 0.9 * strike : 0.25 + preparation * 0.45;
    this.body.visible = emergence > 0.12 && this.deathTime < 1;
    const windup = state.phase === 'warning' ? state.phaseTick / (state.kind === 'wave' ? this.rules.waveWarning : this.rules.eruptionWarning) : 0;
    this.arms.forEach((arm, index) => {
      arm.rotation.x = state.phase === 'attack' ? -0.3 * Math.max(0, 1 - state.phaseTick / 15) : -windup * 2.1;
      arm.rotation.z = (index === 0 ? 1 : -1) * (state.phase === 'recovery' ? 0.12 : windup * 0.2);
      arm.rotation.x += stride * (index === 0 ? 0.14 : -0.14);
      if (melee && index === 0) arm.rotation.x = strike ? -1.5 * strike : preparation * 0.8;
    });
    this.debris.forEach((rock, i) => {
      rock.position.y = 0.15 + (state.phase === 'emerging' ? Math.sin(emergence * Math.PI) * (1 + i % 4 * 0.4) : 0);
    });
    this.warning.visible = state.outcome === 'running' && (state.phase === 'warning' || state.phase === 'emerging');
    const eruption = state.kind === 'eruption' && state.phase === 'warning';
    this.warning.position.set(eruption ? state.target.x : state.center.x, (eruption ? state.target.y : 0) + 0.06,
      eruption ? state.target.z : state.center.z);
    const radius = eruption ? this.rules.eruptionRadius : 2.9;
    this.warning.scale.setScalar(radius); this.warningMaterial.opacity = 0.4 + Math.sin(state.tick / 5) * 0.2 + windup * 0.35;
    const specialWave = state.kind === 'wave' && state.outcome === 'running';
    this.wave.visible = this.kind === 'stone' && state.phase === 'attack' && specialWave;
    this.attackFan.visible = this.kind !== 'stone' && specialWave && (state.phase === 'warning' || this.kind === 'ember' && state.phase === 'attack');
    this.attackFan.position.set(state.center.x, 0, state.center.z); this.attackFan.rotation.y = state.facing;
    this.shards.visible = this.kind !== 'stone' && specialWave && state.phase === 'attack';
    if (this.kind === 'frost') frostShards(state).forEach((point, i) => {
      this.shards.children[i]!.position.set(point.x, point.y, point.z);
      this.shards.children[i]!.rotation.y = state.facing + (i - 1) * 0.38;
    });
    if (this.kind === 'ember') {
      this.shards.position.set(state.center.x, 0, state.center.z); this.shards.rotation.y = state.facing;
      this.shards.children.forEach((flame, i) => { flame.scale.y = 1.1 + Math.sin(state.tick * 0.5 + i) * 0.4; });
    }
    this.wave.position.set(state.center.x, 0.09, state.center.z); this.wave.scale.setScalar(state.waveRadius);
    this.burst.visible = state.kind === 'eruption' && state.phase === 'attack' && state.outcome === 'running';
    this.burst.position.set(state.target.x, state.target.y, state.target.z);
    this.burst.scale.y = Math.max(0.01, Math.sin(Math.min(1, state.phaseTick / this.rules.eruptionTicks) * Math.PI));
  }
}
