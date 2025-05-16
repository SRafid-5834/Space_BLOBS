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

  // Connect nodes to their neighbors
  connectNodes() {
    for (const node of this.nodes) {
      const { x, y, z } = node.position;
      
      // Connect to 6 adjacent nodes (up, down, left, right, forward, backward)
      const directions = [
        { x: x + this.cellSize, y, z },
        { x: x - this.cellSize, y, z },
        { x, y: y + this.cellSize, z },
        { x, y: y - this.cellSize, z },
        { x, y, z: z + this.cellSize },
        { x, y, z: z - this.cellSize }
      ];
      
      for (const pos of directions) {
        const key = `${pos.x},${pos.y},${pos.z}`;
        const neighbor = this.nodeMap.get(key);
        if (neighbor) {
          const cost = node.distanceTo(neighbor);
          node.addEdge(neighbor, cost);
        }
      }
    }
  }

  
}
