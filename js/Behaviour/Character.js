import * as THREE from 'three';
import { VectorUtil } from '../Util/VectorUtil.js';

export class Character {

  constructor(color) {

    // Creating a cone game object for our Character
    let coneGeo = new THREE.ConeGeometry(0.5, 1, 10);
    let coneMat = new THREE.MeshStandardMaterial({ color: color });
    let mesh = new THREE.Mesh(coneGeo, coneMat);
    mesh.rotation.x = Math.PI / 2;

    this.gameObject = new THREE.Group();
    this.gameObject.add(mesh);
    this.gameObject.rotation.order = 'YXZ';

    // Instance variables
    this.location = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.topSpeed = 12;

    this.mass = 1;
    this.maxForce = 20;

    this.isOverdrive = false;
  }

  setModel(model) {
    if (this.model) {
      this.group.remove(this.model);
    }

    this.model = model;
    this.model.scale.set(.6, 1, .7); // Adjust as needed
    this.model.rotation.y = Math.PI / 1.98;
    this.model.position.set(0.26, -4, -1.2);
    this.gameObject.add(this.model);
  }

  // Seek steering behaviour
  seek(target) {

    // Calculate desired velocity
    let desired = VectorUtil.sub(target, this.location);
    desired.setLength(this.topSpeed);
  
    // Calculate steering force
    let steer = VectorUtil.sub(desired, this.velocity);

    if (steer.length() > this.maxForce) {
      steer.setLength(this.maxForce);
    }

    return steer;
  }

  // Wrap around the scene
  checkBounds(bounds) {
    this.location.x = THREE.MathUtils.euclideanModulo(
      this.location.x - bounds.min.x,
      bounds.max.x - bounds.min.x
    ) + bounds.min.x;

	this.location.y = THREE.MathUtils.euclideanModulo(
		this.location.y - bounds.min.y,
		bounds.max.y - bounds.min.y
	) + bounds.min.y;

    this.location.z = THREE.MathUtils.euclideanModulo(
      this.location.z - bounds.min.z,
      bounds.max.z - bounds.min.z
    ) + bounds.min.z;

  }

}