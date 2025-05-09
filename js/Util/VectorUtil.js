import * as THREE from 'three';

export class VectorUtil {

	// Add two vectors
	// Returns a new vector = a + b
	static add(a, b) {
		let v = a.clone();
		v.add(b);
		return v;
	}

	

}