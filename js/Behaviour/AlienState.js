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