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
  
  applyShapeVariations(geometry, radius) {
    const positionAttribute = geometry.attributes.position;
    const vertices = positionAttribute.array;
    
    // Apply large-scale shape variations first
    this.applyLargeShapeVariations(vertices, radius);
    
    // Then apply fine noise details
    this.applyNoiseToGeometry(geometry, radius);
    
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  
  applyLargeShapeVariations(vertices, radius) {
    // Choose a random shape variation type
    const variationType = Math.floor(Math.random() * 5);
    
    // Apply based on type
    switch (variationType) {
      case 0: // Elongated shape
        const stretchAxis = Math.floor(Math.random() * 3);
        const stretchFactor = 1.0 + Math.random() * 0.6;
        for (let i = 0; i < vertices.length; i += 3) {
          vertices[i + stretchAxis] *= stretchFactor;
        }
        break;
        
      case 1: // Flattened shape
        const flattenAxis = Math.floor(Math.random() * 3);
        const flattenFactor = 0.6 + Math.random() * 0.3;
        for (let i = 0; i < vertices.length; i += 3) {
          vertices[i + flattenAxis] *= flattenFactor;
        }
        break;
        
      case 2: // Ridge or crater
        const ridgeFrequency = 2 + Math.floor(Math.random() * 3);
        const ridgeDepth = 0.1 + Math.random() * 0.2;
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const y = vertices[i + 1];
          const z = vertices[i + 2];
          
          const length = Math.sqrt(x * x + y * y + z * z);
          const nx = x / length;
          const ny = y / length;
          
          // Create ridge or crater based on position
          const angle = Math.atan2(ny, nx) * ridgeFrequency;
          const ridge = Math.sin(angle) * ridgeDepth * radius * .05;
          
          vertices[i] = nx * (radius + ridge);
          vertices[i + 1] = ny * (radius + ridge);
          vertices[i + 2] = (z / length) * (radius + ridge);
        }
        break;
        
      case 3: // Large protrusion
        const bumpSize = 0.5 + Math.random() * 0.3;
        const bumpCenter = {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random() * 2 - 1
        };
        // Normalize bump center
        const bumpLength = Math.sqrt(bumpCenter.x*bumpCenter.x + bumpCenter.y*bumpCenter.y + bumpCenter.z*bumpCenter.z);
        bumpCenter.x /= bumpLength;
        bumpCenter.y /= bumpLength;
        bumpCenter.z /= bumpLength;
        
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const y = vertices[i + 1];
          const z = vertices[i + 2];
          
          const length = Math.sqrt(x * x + y * y + z * z);
          const nx = x / length;
          const ny = y / length;
          const nz = z / length;
          
          // Calculate dot product to determine position relative to bump center
          const dot = nx * bumpCenter.x + ny * bumpCenter.y + nz * bumpCenter.z;
          // Apply bump based on proximity to bump center
          const bump = Math.max(0, 1 - Math.acos(dot) / (Math.PI / 2)) * bumpSize * radius;
          
          vertices[i] = nx * (radius + bump);
          vertices[i + 1] = ny * (radius + bump);
          vertices[i + 2] = nz * (radius + bump);
        }
        break;
        
      case 4: // Angular edges
        // Just leave as is for some asteroids to maintain angular look
        break;
    }
  }
  
  applyNoiseToGeometry(geometry, radius) {
    const positionAttribute = geometry.attributes.position;
    const vertices = positionAttribute.array;
    
    // Determine noise parameters for this asteroid
    const noiseScale = 1.0;
    const noiseStrength = 0.1 + Math.random() * 0.1;
    const octaves = 3 + Math.floor(Math.random() * 3);
    const persistence = 0.5 + Math.random() * 0.2;
    const seed = Math.floor(Math.random() * 1000);
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      const length = Math.sqrt(x * x + y * y + z * z);
      const nx = x / length;
      const ny = y / length;
      const nz = z / length;
      
      // Add seed offset for variety between asteroids
      const noiseValue = this.perlin.octaveNoise(
        nx + 0.5 + seed * 0.1, 
        ny + 0.5 + seed * 0.1, 
        noiseScale,
        octaves,
        persistence,
        2.0
      );
      
      const distortion = radius * noiseStrength * (noiseValue * 2 - 1);
      
      // Apply the noise distortion
      vertices[i] += nx * distortion;
      vertices[i + 1] += ny * distortion;
      vertices[i + 2] += nz * distortion;
    }
  }
  
  // Method to update asteroid rotation - call this in your main update loop
  update() {
    this.gameObject.rotation.x += this.rotationSpeed.x;
    this.gameObject.rotation.y += this.rotationSpeed.y;
    this.gameObject.rotation.z += this.rotationSpeed.z;
  }
}