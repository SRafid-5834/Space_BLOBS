export class MapNode3D {
	constructor(id, x, y, z) {
	  this.id = id;
	  this.position = { x, y, z };
	  this.edges = [];  // Connections to other nodes
	  this.f = 0;       // Total cost (g + h)
	  this.g = 0;       // Cost from start
	  this.h = 0;       // Heuristic cost to end
	  this.parent = null; // For path reconstruction
	}
  
	// Add a connection to another node
	addEdge(node, cost) {
	  this.edges.push({ node, cost });
	}
  
	// Calculate distance to another node
	distanceTo(node) {
	  const dx = this.position.x - node.position.x;
	  const dy = this.position.y - node.position.y;
	  const dz = this.position.z - node.position.z;
	  return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
}
