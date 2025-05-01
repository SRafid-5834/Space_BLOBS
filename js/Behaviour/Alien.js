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

  // Arrive steering behavior with radius for slowing down
  arrive(target, radius) {
    let desired = new THREE.Vector3();
    desired.subVectors(target, this.location);

    let distance = desired.length();

    if (distance < 0.01) {
      return new THREE.Vector3();
    } else {
      if (distance < radius) {
        let speed = (distance / radius) * this.topSpeed;
        desired.setLength(speed);
      } else {
        desired.setLength(this.topSpeed);
      }
    }

    let steer = new THREE.Vector3();
    steer.subVectors(desired, this.velocity);

    if (steer.length() > this.maxForce) {
      steer.setLength(this.maxForce);
    }
    return steer;
  }

  // Seek behavior
  seek(target) {
    // Create vector pointing from location to target
    let desired = new THREE.Vector3().subVectors(target, this.location);
    
    // Scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(this.topSpeed);
    
    // Steering = Desired minus Velocity
    let steer = new THREE.Vector3().subVectors(desired, this.velocity);
    
    // Limit to maximum steering force
    if (steer.length() > this.maxForce) {
      steer.normalize();
      steer.multiplyScalar(this.maxForce);
    }
    
    return steer;
  }

  // Avoid collision steering behavior
  avoidCollision(obstacle, characterToObstacle, ray) {
    // If no valid obstacle, return zero vector
    if (!obstacle || !obstacle.position) {
      return new THREE.Vector3();
    }

    let steer = new THREE.Vector3();

    // Project the vector from character to obstacle
    // onto the character to the end of our ray
    let scalarProjection = 0;
    
    // Calculate scalar projection only if ray has length
    if (ray.length() > 0) {
      let rayNormalized = ray.clone().normalize();
      scalarProjection = characterToObstacle.dot(rayNormalized);
    }

    // Check to see if the ray has 
    // collided with the obstacle
    let collision = this.detectCollision(obstacle, ray, scalarProjection);

    // If we have collided
    if (collision) {
      // Get the point of contact (collision point)
      // with the ray and obstacle
      let collisionPoint = this.getCollisionPoint(obstacle, ray, scalarProjection);
    
      // Get the target to avoid the obstacle
      let avoidTarget = this.getAvoidTarget(obstacle, collisionPoint, 5);

      // Create steering force to avoid obstacle
      steer = this.seek(avoidTarget);
    }

    return steer;
  }

}  