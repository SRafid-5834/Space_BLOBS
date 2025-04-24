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

  createAsteroidMesh() {
    const radius = Math.random() * Math.random() * 30;
    
    // Create base geometries with medium subdivision level
    const asteroidGeometries = [
      new THREE.DodecahedronGeometry(radius, 15),
      new THREE.OctahedronGeometry(radius, 15),
      new THREE.IcosahedronGeometry(radius, 15),
      new THREE.TetrahedronGeometry(radius, 15)
    ];
    
    const geomIndex = Math.floor(Math.random() * asteroidGeometries.length);
    const geometry = asteroidGeometries[geomIndex];
    
    // Apply shape variations and noise
    this.applyShapeVariations(geometry, radius);
    
    // Create material with appropriate shading
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 1,
      metalness: .2,
      flatShading: Math.random() > 0.3 // Mix of flat and smooth asteroids
    });
    
    const asteroid = new THREE.Mesh(geometry, asteroidMaterial);
    
    // Position randomly within bounds
    const x = Math.random() * 800 - 400;
    const y = Math.random() * 800 - 400;
    const z = Math.random() * 800 - 400;
    asteroid.position.set(x, y, z);
    
    // Random initial rotation
    asteroid.rotation.x = 50;
    asteroid.rotation.y = Math.random() * Math.PI * 2;
    asteroid.rotation.z = Math.random() * Math.PI * 2;
    
    return asteroid;
  }

  
}