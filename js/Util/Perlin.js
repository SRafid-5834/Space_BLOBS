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
  
  // To actually create our noise
  noise(x, y, frequency) {
    // Make sure x and y are positive to avoid negative indices
    x = Math.abs((x * frequency) % this.size);
    y = Math.abs((y * frequency) % this.size);
    
    // Use Math.floor and ensure indices are within bounds
    let x0 = Math.floor(x) % this.size;
    let y0 = Math.floor(y) % this.size;
    let x1 = (x0 + 1) % this.size;
    let y1 = (y0 + 1) % this.size;
    
    let xoffset = x - x0;
    let yoffset = y - y0;
    
  }
}