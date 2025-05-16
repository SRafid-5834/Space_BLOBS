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

  // Find the closest node to a 3D position
  findClosestNode(position) {
    let closestNode = null;
    let minDistance = Infinity;
    
    for (const node of this.nodes) {
      const dx = node.position.x - position.x;
      const dy = node.position.y - position.y;
      const dz = node.position.z - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestNode = node;
      }
    }
    
    return closestNode;
  }
  
  // A* pathfinding algorithm
  findPath(startPos, endPos) {
    // Find closest nodes to the start and end positions
    const startNode = this.findClosestNode(startPos);
    const endNode = this.findClosestNode(endPos);
    
    if (!startNode || !endNode) return [];
    
    // Reset nodes
    for (const node of this.nodes) {
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.parent = null;
    }
    
    const openSet = [];
    const closedSet = new Set();
    
    openSet.push(startNode);
    
    while (openSet.length > 0) {
      // Get node with lowest f score
      let currentIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openSet[currentIndex];
      
      // If we reached the end, reconstruct path
      if (current === endNode) {
        const path = [];
        let temp = current;
        while (temp) {
          path.push(temp.position);
          temp = temp.parent;
        }
        return path.reverse();
      }
      
      // Remove current from open set and add to closed set
      openSet.splice(currentIndex, 1);
      closedSet.add(current.id);
      
      // Check all neighbors
      for (const edge of current.edges) {
        const neighbor = edge.node;
        
        // Skip if already processed
        if (closedSet.has(neighbor.id)) continue;
        
        // Calculate g score
        const gScore = current.g + edge.cost;
        
        // Check if not in open set or better path found
        const inOpenSet = openSet.includes(neighbor);
        if (!inOpenSet || gScore < neighbor.g) {
          // Update neighbor
          neighbor.g = gScore;
          neighbor.h = neighbor.distanceTo(endNode);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          
          if (!inOpenSet) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    // No path found
    return [];
  }
}
