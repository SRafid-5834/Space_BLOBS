import * as THREE from 'three';

// Base State class for Alien
export class AlienState {
  constructor() {
    if (this.constructor === AlienState) {
      throw new Error("AlienState is an abstract class and cannot be instantiated directly");
    }
    
    if (this.enter === undefined) {
      throw new Error("State must implement enter method");
    }
    
    if (this.update === undefined) {
      throw new Error("State must implement update method");
    }
  }
  
  enter(alien) {}
  update(alien, deltaTime) {}
  
  // Helper method to transition to a new state
  transition(alien, newState) {
    alien.currentState = newState;
    alien.currentState.enter(alien);
  }
}

export class PathfindState extends AlienState {
  constructor(targetPosition) {
    super();
    this.targetPosition = targetPosition;
    this.path = [];
    this.currentPathIndex = 0;
    this.reachedTarget = false;
    this.pathfindingComplete = false;
  }

  enter(alien) {
    console.log("Alien entering Pathfind state to initial player position");

    // Set speed to pathfind speed
    alien.topSpeed = alien.pathfindSpeed;
    
    // Create a path to the target position using the graph
    const startPos = alien.location.clone();
    
    // Access the graph directly from the scene, not from alien.scene
    const graph = THREE.Cache.get('alienGraph') || alien.scene?.alienGraph; 
    
    if (graph) {
      this.path = graph.findPath(startPos, this.targetPosition);
      this.currentPathIndex = 0;
      
      // If no path found or already at destination, transition to wander
      if (this.path.length === 0) {
        this.transition(alien, new WanderState());
        return;
      }
      
      console.log(`Path found with ${this.path.length} waypoints`);
    } else {
      console.error("No alien graph found in scene");
      this.transition(alien, new WanderState());
    }
  }

  update(alien, deltaTime) {
    // If pathfinding is complete, transition to wander
    if (this.pathfindingComplete) {
      // Reset speed to normal before transitioning
      alien.topSpeed = alien.normalSpeed;
      this.transition(alien, new WanderState());
      return;
    }
    
    // If we have a path to follow
    if (this.path && this.path.length > 0) {
      // Get current waypoint
      const currentWaypoint = this.path[this.currentPathIndex];
      
      if (!currentWaypoint) {
        console.error("Invalid waypoint in path");
        this.pathfindingComplete = true;
        return;
      }
      
      // Convert to THREE.Vector3
      const target = new THREE.Vector3(
        currentWaypoint.x,
        currentWaypoint.y,
        currentWaypoint.z
      );
}
