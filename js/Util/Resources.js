import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Resources {
  constructor(fileList) {
    this.loader = new GLTFLoader();
    this.files = fileList; // array of { name, url }
    this.models = new Map(); // stores loaded models
  }

  async loadAll() {
    const loadPromises = this.files.map(file => 
      this.loader.loadAsync(file.url)
        .then(gltf => {
          this.models.set(file.name, gltf.scene); // store only the scene (model)
        })
        .catch(err => {
          console.error(`Failed to load model: ${file.url}`, err);
        })
    );

    await Promise.all(loadPromises);
  }

  
}
