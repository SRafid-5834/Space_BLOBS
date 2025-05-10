import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Resources {
  constructor(fileList) {
    this.loader = new GLTFLoader();
    this.files = fileList; // array of { name, url }
    this.models = new Map(); // stores loaded models
  }

  
}
