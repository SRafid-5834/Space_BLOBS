import * as THREE from 'three';

export class VectorUtil {

	// Add two vectors
	// Returns a new vector = a + b
	static add(a, b) {
		let v = a.clone();
		v.add(b);
		return v;
	}

	// Subtracts vector a from b 
	// Returns a new vector = a - b
	static sub(a, b) {
		let v = a.clone();
		v.sub(b);
		return v;
	}

	// Multiplies vector a by scalar s
	// Returns a new vector = a * s
	static multiplyScalar(a, s) {
		let v = a.clone();
		v.multiplyScalar(s);
		return v;
	}

	


}