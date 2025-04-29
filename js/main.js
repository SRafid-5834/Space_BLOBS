import * as THREE from 'three';
import { Character } from './Behaviour/Character.js';
import { Alien } from './Behaviour/Alien.js';
import { ThirdPersonCamera } from './Behaviour/ThirdPersonCamera.js';
import { MapGraph3D } from './World//MapGraph3D.js';
import { PathfindState } from './Behaviour/AlienState.js';
import { Asteroid } from './Asteroid.js';
import { Resources } from './Util/Resources.js';
import {
  createLivesUI,
  createAlienCountUI,
  updateAlienIndicators,
  resetAlienIndicators,
  createFuelGauge,
  updateFuelGauge,
  createDamageFlash,
  showVictory,
  gameOver
} from './UI.js';

// Create Scene
const scene = new THREE.Scene();

// Variables for camera
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 1.0;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const renderer = new THREE.WebGLRenderer();

// Create clock
const clock = new THREE.Clock();

// List of models to load
const files = [
  { name: 'spaceship', url: '/models/spaceship.glb' },
  { name: 'blob', url: '/models/blob.glb' }
];

// Load resources
const resources = new Resources(files);
await resources.loadAll();

// Create player
const player = new Character(0x0000ff);
player.setModel(resources.get('spaceship'));

let playerLives = 5;
let isGameOver = false;
let invincibilityFrames = 0; // To prevent multiple hits at once

// Create asteroids
const asteroids = [];
const asteroidCount = 500; // Number of asteroids to create
for (let i = 0; i < asteroidCount; i++) {
  const asteroid = new Asteroid();
  asteroids.push(asteroid.gameObject);
  scene.add(asteroid.gameObject);
}

// Create aliens array
const aliens = [];
const alienCount = 2; // Number of aliens to create

// Declare bounds
let bounds;

// Declare forward guidance line
let forwardLine;

// Declare variables for overdrive and shooting, also array to hold lasers
let overdrive = false;
let shooting = false;
let laserBeams = [];


let fuelLevel = 100; // Full tank at start
let fuelGaugeHeight = 200; // Height of the visual fuel gauge
let fuelGaugeWidth = 30; // Width of the fuel gauge
let isFuelDepleted = false;

// MOVEMENT EVENTLISTENERS INITIALIZATION
// Initialize booleans for controlling movement
let w = false, a = false, s = false, d = false;
function initEventListeners() {
  // Key down event listener
  document.addEventListener("keydown", function(event) {
    if (event.code === "KeyW") w = true;
    else if (event.code === "KeyA") a = true;
    else if (event.code === "KeyS") s = true;
    else if (event.code === "KeyD") d = true;
    else if (event.code === "ShiftLeft") overdrive = true;
    else if (event.code === "Space") {
      shooting = true;
      createLaserBeams();
    }
  });
  
  document.addEventListener("keyup", function(event) {
    if (event.code === "KeyW") w = false;
    else if (event.code === "KeyA") a = false;
    else if (event.code === "KeyS") s = false;
    else if (event.code === "KeyD") d = false;
    else if (event.code === "ShiftLeft") overdrive = false;
    else if (event.code === "Space") {
      shooting = false;
      removeLaserBeams();
    }
  });
}