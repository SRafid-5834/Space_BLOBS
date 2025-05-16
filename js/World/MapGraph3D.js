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

  
}
