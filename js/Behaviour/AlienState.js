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
}
