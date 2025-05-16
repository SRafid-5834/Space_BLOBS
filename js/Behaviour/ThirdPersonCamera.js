import * as THREE from "/lib/three.module.js";

export class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    
    // Camera offset from player (in player's local space)
    this.offset = new THREE.Vector3(0, 8, -12); // Above and behind
    
    this.lagFactor = 0.1;
  }

  update() {
    if (!this.target) return;

    // Clone the offset and rotate it by the character's quaternion (which includes pitch & yaw)
    const offsetRotated = this.offset.clone();
    offsetRotated.applyQuaternion(this.target.quaternion);

    // Calc desired camera position: character position + rotated offset
    const desiredPos = new THREE.Vector3()
      .copy(this.target.position)
      .add(offsetRotated);

    // Smoothly lerp camera toward desired position
    this.camera.position.lerp(desiredPos, this.lagFactor);

    // Make the camera look slightly ahead of the character
    const lookAhead = this.target.position.clone();
    const forwardOffset = new THREE.Vector3(0, 0, 10); 
    forwardOffset.applyQuaternion(this.target.quaternion);
    lookAhead.add(forwardOffset);

    this.camera.lookAt(lookAhead);
  }
}