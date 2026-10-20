import * as THREE from 'three';
import type { Vec3 } from '../core/types';
import type { CameraBasis } from '../input/movement';

export class ArenaCamera {
  readonly camera = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.1, 180);
  private readonly focus = new THREE.Vector3();
  private readonly offset = new THREE.Vector3(0, 52, 51);
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  mode: 'straight' | 'isometric' = 'straight';
  constructor() { this.place(); }
  toggle(): void {
    this.mode = this.mode === 'straight' ? 'isometric' : 'straight';
    if (this.mode === 'straight') this.offset.set(0, 52, 51);
    else this.offset.set(30, 52, 41);
    this.place();
  }
  resize(width: number, height: number): void {
    const viewHeight = 32;
    this.camera.left = -viewHeight * width / height / 2;
    this.camera.right = -this.camera.left;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -this.camera.top;
    this.camera.updateProjectionMatrix();
  }
  follow(position: Vec3, dt: number): void {
    const blend = 1 - Math.exp(-5 * dt);
    this.focus.x += (position.x * 0.42 - this.focus.x) * blend;
    this.focus.z += (position.z * 0.42 - this.focus.z) * blend;
    this.place();
  }
  basis(): CameraBasis {
    this.right.setFromMatrixColumn(this.camera.matrixWorld, 0).setY(0).normalize();
    this.camera.getWorldDirection(this.forward);
    this.forward.setY(0).normalize();
    return { right: { ...this.right }, forward: { ...this.forward } };
  }
  private place(): void {
    this.camera.position.copy(this.focus).add(this.offset);
    this.camera.lookAt(this.focus);
    this.camera.updateMatrixWorld();
  }
}
