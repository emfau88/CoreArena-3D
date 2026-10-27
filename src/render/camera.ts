import * as THREE from 'three';
import type { Vec3 } from '../core/types';
import type { CameraBasis } from '../input/movement';

export class ArenaCamera {
  readonly camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 180);
  private readonly focus = new THREE.Vector3();
  private readonly offset = new THREE.Vector3(0, 58, 42);
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  mode: 'side' | 'straight' | 'isometric' = 'straight';
  private horizontalView = false;
  private followFactor = 0.42;
  private viewScale = 1;
  private mobile = false;
  constructor() { this.place(); }
  trackPlayer(position: Vec3, viewScale = 1, initialView: 'straight' | 'side' = 'straight'): void {
    this.followFactor = 1; this.viewScale = viewScale;
    this.horizontalView = initialView === 'side'; this.mode = initialView; this.snap(position);
  }
  snap(position: Vec3): void {
    this.focus.set(position.x * this.followFactor, 0, position.z * this.followFactor);
    this.place();
  }
  toggle(): void {
    this.mode = this.mode === 'side' ? 'straight' : this.mode === 'straight' ? 'isometric'
      : this.horizontalView ? 'side' : 'straight';
    this.place();
  }
  resize(width: number, height: number, mobile = false): void {
    this.mobile = mobile;
    // A closer, steeper view fills the viewport, including ultrawide/landscape phones.
    const viewHeight = Math.min(21, 40 * height / width) * this.viewScale / (mobile ? 1.15 : 1);
    this.camera.left = -viewHeight * width / height / 2;
    this.camera.right = -this.camera.left;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -this.camera.top;
    this.camera.updateProjectionMatrix();
  }
  follow(position: Vec3, dt: number, velocity?: Vec3): void {
    const blend = 1 - Math.exp(-5 * dt);
    const lead = this.mobile && this.followFactor === 1 ? .35 : 0;
    this.focus.x += (position.x * this.followFactor + (velocity?.x ?? 0) * lead - this.focus.x) * blend;
    this.focus.z += (position.z * this.followFactor + (velocity?.z ?? 0) * lead - this.focus.z) * blend;
    this.place();
  }
  basis(): CameraBasis {
    this.right.setFromMatrixColumn(this.camera.matrixWorld, 0).setY(0).normalize();
    this.camera.getWorldDirection(this.forward);
    this.forward.setY(0).normalize();
    return { right: { ...this.right }, forward: { ...this.forward } };
  }
  private place(): void {
    if (this.mode === 'side') this.offset.set(42, 58, 0);
    else if (this.mode === 'straight') this.offset.set(0, 58, 42);
    else this.offset.set(26, 58, 36);
    this.camera.position.copy(this.focus).add(this.offset);
    this.camera.lookAt(this.focus);
    this.camera.updateMatrixWorld();
  }
}
