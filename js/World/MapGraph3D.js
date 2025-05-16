import { MapNode3D } from './MapNode3D.js';

export class MapGraph3D {
  constructor(bounds, cellSize) {
    this.bounds = bounds;
    this.cellSize = cellSize;
    this.nodes = [];
    this.nodeMap = new Map(); // For quick lookup by position
    
    // Create 3D grid of nodes
    this.createGrid();
    this.connectNodes();
  }

  // Create grid of nodes based on bounds and cell size
  createGrid() {
    const { min, max } = this.bounds;
    let id = 0;
    
    for (let x = min.x; x <= max.x; x += this.cellSize) {
      for (let y = min.y; y <= max.y; y += this.cellSize) {
        for (let z = min.z; z <= max.z; z += this.cellSize) {
          const node = new MapNode3D(id++, x, y, z);
          this.nodes.push(node);
          // Store node in map for quick lookup
          const key = `${x},${y},${z}`;
          this.nodeMap.set(key, node);
        }
      }
    }
  }

  
}
