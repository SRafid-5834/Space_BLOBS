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
}  