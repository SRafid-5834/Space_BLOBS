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
    
    let dx0y0 = new THREE.Vector2(xoffset, yoffset);
    let dx1y0 = new THREE.Vector2(xoffset - 1, yoffset);
    let dx0y1 = new THREE.Vector2(xoffset, yoffset - 1);
    let dx1y1 = new THREE.Vector2(xoffset - 1, yoffset - 1);
    
    // These lines were failing - ensure indices are valid
    let dot1 = this.gradients[x0][y0].dot(dx0y0);
    let dot2 = this.gradients[x1][y0].dot(dx1y0);
    let dot3 = this.gradients[x0][y1].dot(dx0y1);
    let dot4 = this.gradients[x1][y1].dot(dx1y1);
    
    let fadedXOffset = this.fade(xoffset);
    let fadedYOffset = this.fade(yoffset);
    
    let lerp1 = MathUtil.lerp(dot1, dot2, fadedXOffset);
    let lerp2 = MathUtil.lerp(dot3, dot4, fadedXOffset);
    let average = MathUtil.lerp(lerp1, lerp2, fadedYOffset);
    
    return MathUtil.map(average, -1, 1, 0, 1);
  }
  
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  octaveNoise(x, y, baseFrequency, numOctaves, persistence, lacunarity) {
    let totalNoise = 0;
    let frequency = baseFrequency;
    let amplitude = 1;
    let maxAmplitude = 0;
    
    for (let i = 0; i < numOctaves; i++) {
      totalNoise += this.noise(x, y, frequency) * amplitude;
      maxAmplitude += amplitude;
      // Decrease our amplitude based on persistence
      amplitude *= persistence;
      // Increase our frequency based on lacunarity
      frequency *= lacunarity;
    }
    
    return totalNoise/maxAmplitude;
  }
}