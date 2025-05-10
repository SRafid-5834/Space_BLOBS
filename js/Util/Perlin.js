import * as THREE from 'three';
import { MathUtil } from '../Util/MathUtil.js';

export class Perlin {
  constructor(size) {
    this.size = size;
    this.gradients = [];
    this.createGrid();
  }
  
  
}