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

  // To update our character
  update(deltaTime, bounds) {

    // Update acceleration via velocity
    this.velocity.addScaledVector(this.acceleration, deltaTime);
    if (this.velocity.length() > this.topSpeed) {
      this.velocity.setLength(this.topSpeed);
    }

    // Update velocity via location
    this.location.addScaledVector(this.velocity, deltaTime);

    this.checkBounds(bounds);

    if (this.velocity.length() > 0.001) {
      const yaw = Math.atan2(this.velocity.x, this.velocity.z);

      // Calculate pitch from vertical velocity vs. horizontal magnitude
      const horizontalMag = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
      let pitch = -Math.atan2(this.velocity.y, horizontalMag); // negative if up/down is inverted

      // Clamp pitch so you don't flip upside down
      const maxPitch = Math.PI / 3; // 60° up/down
      pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));

      // Apply pitch (X), yaw (Y), roll (Z=0) in 'YXZ' order
      this.gameObject.rotation.set(pitch, yaw, .03);
    }
    this.gameObject.position.copy(this.location);
    this.acceleration.setLength(0);

    // Update overdrive state based on speed
    this.isOverdrive = this.topSpeed > 20;
  }

  // Apply force to our character
  applyForce(force) {
    force.divideScalar(this.mass);
    this.acceleration.add(force);
  }

  // Method to avoid multiple collisions
  avoidMultipleCollisions(obstacles, lookAhead) {
    // If no obstacles, return zero vector
    if (obstacles.length === 0) {
      return new THREE.Vector3();
    }
    
    let center = null;
    // Create the center whisker based on velocity
    if (!this.isOverdrive){
      center = this.velocity.clone().normalize().multiplyScalar(lookAhead);
    } else {
      // Increase lookAhead distance when in overdrive
      const adjustedLookAhead = this.isOverdrive ? lookAhead * 10 : lookAhead;
      center = this.velocity.clone().normalize().multiplyScalar(adjustedLookAhead);
    }
    
    // Clone center vector and create whiskers
    const whiskerLength = 0.5;  // 0.5x times the center 
    let whisker1 = center.clone().multiplyScalar(whiskerLength);
    let whisker2 = center.clone().multiplyScalar(whiskerLength);

    // Rotate whiskers around the Y-axis
    const whiskerAngle = 50;  // angles of whiskers
    const radian = whiskerAngle * Math.PI/180;
    whisker1.applyAxisAngle(new THREE.Vector3(0, 1, 0), radian);
    whisker2.applyAxisAngle(new THREE.Vector3(0, 1, 0), -radian);

    // Obtain the closest obstacle
    let obstacle = this.closestObject(obstacles);
    
    // If no obstacle found, return zero vector
    if (!obstacle) {
      return new THREE.Vector3();
    }
    
    // Calculate the vector from character to obstacle
    let characterToObstacle = obstacle.position.clone().sub(this.location);

    // To accumulate steering forces
    let totalSteer = new THREE.Vector3();
    
    // Avoid using all three vectors (center, whisker1, whisker2)
    let steerCenter = this.avoidCollision(obstacle, characterToObstacle, center);
    let steerWhisker1 = this.avoidCollision(obstacle, characterToObstacle, whisker1);
    let steerWhisker2 = this.avoidCollision(obstacle, characterToObstacle, whisker2);

    // Combine avoidance forces from all three vectors
    totalSteer.add(steerCenter).add(steerWhisker1).add(steerWhisker2);
    
    // Limit the force if needed
    if (totalSteer.length() > this.maxForce) {
      totalSteer.normalize().multiplyScalar(this.maxForce);
    }

    return totalSteer;
  }

  // Modify the closestObject method to also calculate and store the radius:
  closestObject(obstacles) {
    let closestObstacle = null;
    let minDistance = Infinity;

    for (let obstacle of obstacles) {
      // Skip if the obstacle doesn't have a position
      if (!obstacle.position) continue;
      
      let distance = this.location.distanceTo(obstacle.position);

      if (distance < minDistance) {
        minDistance = distance;
        closestObstacle = obstacle;
      }
    }
    
    // If we found an obstacle, calculate its radius if it doesn't have one
    if (closestObstacle && !closestObstacle.radius) {
      // Try to get the geometry's bounding sphere
      if (closestObstacle.geometry) {
        closestObstacle.geometry.computeBoundingSphere();
        closestObstacle.radius = closestObstacle.geometry.boundingSphere.radius;
      } else if (closestObstacle.children && closestObstacle.children.length > 0) {
        // For group objects, estimate the radius from the first child with geometry
        for (let child of closestObstacle.children) {
          if (child.geometry) {
            child.geometry.computeBoundingSphere();
            closestObstacle.radius = child.geometry.boundingSphere.radius;
            break;
          }
        }
      }
      
      // Default radius if we couldn't calculate one
      if (!closestObstacle.radius) {
        closestObstacle.radius = 5.0;  // Default radius
      }
    }

    return closestObstacle;
  }

  // Modify detectCollision method to better handle potential missing properties
  detectCollision(obstacle, ray, scalarProjection) {
    // Making sure we have a valid obstacle with a radius
    if (!obstacle || typeof obstacle.radius === 'undefined') {
      return false;
    }

    // clamp our scalar projection to the extents
    let clampedSP = THREE.MathUtils.clamp(scalarProjection, 0, ray.length());

    // Closest point is our character's location + current ray at a length of the clamped SP
    let closestPoint = ray.clone().normalize().multiplyScalar(clampedSP);
    closestPoint.add(this.location);

    // Check if the closest point is within the obstacle's radius
    return closestPoint.distanceTo(obstacle.position) <= obstacle.radius;
  }

  // Avoid collision steering behaviour
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

  // Gets the collision point of our 
  // obstacle and the ray
  getCollisionPoint(obstacle, ray, scalarProjection) {

    // Get vector projection using scalar projection
    let vectorProjection = VectorUtil.setLength(ray, scalarProjection);
    vectorProjection.add(this.location);

    // Use trigonometry to figure out the 
    // collision point on the circle
    let opp = VectorUtil.sub(vectorProjection, obstacle.position);
    let adjLength = Math.sqrt(obstacle.radius**2 - opp.length()**2);

    let collisionLength = scalarProjection - adjLength;
    let collisionVector = VectorUtil.setLength(ray, collisionLength);

    let collisionPoint = VectorUtil.add(this.location, collisionVector);

    return collisionPoint;
  }

  // Gets the target to avoid our collision
  getAvoidTarget(obstacle, collisionPoint, howFar) {

    let normal = VectorUtil.sub(collisionPoint, obstacle.position);
    normal.setLength(howFar);
    
    let target = VectorUtil.add(collisionPoint, normal);

    return target;
  }
  
}