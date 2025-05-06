import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(camera, target) {
      this.camera = camera;
      this.target = target;
      
      // Camera offset from player (in player's local space)
      this.offset = new THREE.Vector3(0, 8, -12); // Above and behind
      
      this.lagFactor = 0.1;
    }

}