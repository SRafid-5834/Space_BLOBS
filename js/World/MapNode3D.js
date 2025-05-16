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
  
	
}
