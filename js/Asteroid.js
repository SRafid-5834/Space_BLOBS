import * as THREE from 'three';
import { Perlin } from './Util/Perlin.js';

export class Asteroid {
  constructor() {
    this.perlin = new Perlin(32);
    this.gameObject = this.createAsteroidMesh();
    
    // Add rotation speeds as properties
    this.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.01
    };
  }

}