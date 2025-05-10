import * as THREE from 'three';
import { MathUtil } from '../Util/MathUtil.js';

export class Perlin {
  constructor(size) {
    this.size = size;
    this.gradients = [];
    this.createGrid();
  }
  
  // Populates our gradient grid 
  // with random vectors
  createGrid() {
    for (let i = 0; i < this.size; i++) {
      let row = [];

      for (let j = 0; j < this.size; j++) {
        // Get a random x and y
        let x = MathUtil.map(Math.random(), 0, 1, -1, 1);
        let y = MathUtil.map(Math.random(), 0, 1, -1, 1);
 
        let gradient = new THREE.Vector2(x, y);
        // normalize the gradient length
        gradient.setLength(1);
        row.push(gradient);
      }
      // Push to our gradient grid
      this.gradients.push(row);
    }
  }
  
  
}