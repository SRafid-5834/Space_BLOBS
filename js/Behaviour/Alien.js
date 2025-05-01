import * as THREE from 'three';
import { VectorUtil } from '../Util/VectorUtil.js';
import { Character } from './Character.js';
import { WanderState, PursueState } from './AlienState.js';

export class Alien extends Character {
  constructor(color, player, obstacles) {
    super(color);
    
    this.gameObject.children[0].geometry = new THREE.SphereGeometry(2, 16, 16);

    this.scene = player.gameObject.parent || null;
    
    // Reference to player and obstacles
    this.player = player;
    this.obstacles = obstacles;
    
    // Alien specific properties
    this.wanderAngle = Math.random() * (Math.PI * 2);
    this.detectionRadius = 35; // Detection radius for player
    this.normalSpeed = 8;
    this.pursuitSpeed = 15;
    this.pathfindSpeed = 100;
    this.topSpeed = this.normalSpeed;
    
    // Avoid collision method
    this.avoidCollision = this.avoidCollision.bind(this);
  }

  setModel(model) {
    if (this.model) {
      this.group.remove(this.model);
    }
    this.model = model;
    this.model.scale.set(5, 5, 5); // Adjust as needed
    this.model.position.set(0, -1.7, 0);
    this.gameObject.add(this.model);

    // Tag all meshes in the model with the alien's reference
    this.model.traverse((object) => {
      if (object.isMesh) {
        // Add a custom property to identify this mesh as part of this alien
        object.userData.alienRef = this;
      }
    });
  }

  // Update method override to incorporate state machine
  update(deltaTime, bounds) {
    // Update state
    this.currentState.update(this, deltaTime);
    
    // Update physics and position via parent class
    super.update(deltaTime, bounds);
  }

  // Wander steering behavior
  wander() {
    let distance = 10;
    let radius = 10;
    let angleOffset = 0.3;

    let futureLocation = this.velocity.clone();
    futureLocation.setLength(distance);
    futureLocation.add(this.location);
    
    let target = new THREE.Vector3(radius * Math.sin(this.wanderAngle), 0, radius * Math.cos(this.wanderAngle));
    target.add(futureLocation);
  
    let steer = this.seek(target);

    let change = Math.random() * (angleOffset * 2) - angleOffset;
    this.wanderAngle = this.wanderAngle + change;
    
    return steer;
  }

  // Pursue steering behavior
  pursue(character, lookAhead) {
    let prediction = new THREE.Vector3();
    prediction.addScaledVector(character.velocity, lookAhead);

    let predictedTarget = new THREE.Vector3();
    predictedTarget.addVectors(prediction, character.location);

    return this.seek(predictedTarget);
  }

}  