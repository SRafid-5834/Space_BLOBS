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

}