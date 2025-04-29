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

// Create a directional guidance line for the player
function createForwardLine() {
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff0000,   // Red line
    transparent: true,
    opacity: 0.3       // 30% transparency
  });
  
  // Initial vertices (will be updated during animation)
  const points = [
    new THREE.Vector3(0, 0, 0),     // Player's position
    new THREE.Vector3(0, 0, 2000)    // Forward direction
  ];
  
  lineGeometry.setFromPoints(points);
  
  forwardLine = new THREE.Line(lineGeometry, lineMaterial);
  player.gameObject.add(forwardLine); // Attach to player
}

// Function to create a starfield
function createStarfield() {
  // Create a large sphere for the starfield
  const skyGeometry = new THREE.SphereGeometry(1000, 32, 32); 
  
  // Rendered on the inside of the sphere
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x000008,
    side: THREE.BackSide, // Render on inside
    depthWrite: false
  });
  
  // Create the starfield
  const starfield = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(starfield);
  
  // Adding stars as textures on the starfield
  const starsGeometry = new THREE.BufferGeometry();
  const starsVertices = [];
  
  for (let i = 0; i < 10000; i++) {
    const radius = 995; // Slightly smaller than starfield
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    starsVertices.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  
  const starsMaterial = new THREE.PointsMaterial({
    size: 1.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });
  
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

// Function to create the laser beams
function createLaserBeams() {
  // Only create beams if there's fuel
  if (isFuelDepleted) {
    shooting = false;
    return;
  }
  
  // Remove any existing beams
  removeLaserBeams();
  
  // Create three parallel beams
  for (let i = -1; i <= 1; i++) {
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff, // Cyan blueish color
    });
    
    // Create points for the beam in local space
    const points = [
      new THREE.Vector3(i * .9, 0, 0),    // Start point with x offset for each beam
      new THREE.Vector3(i * .9, 0, 2000)  // End point 2000 units forward
    ];
    
    lineGeometry.setFromPoints(points);
    const beam = new THREE.Line(lineGeometry, lineMaterial);
    
    // Set the beams position and rotation
    // This ensures it inherits from the player properly
    beam.position.set(0, 0, 0);
    beam.rotation.set(0, 0, 0);
    
    player.gameObject.add(beam);
    laserBeams.push(beam);
  }
}

// Function to remove laser beams
function removeLaserBeams() {
  for (let beam of laserBeams) {
    player.gameObject.remove(beam);
    beam.geometry.dispose();
    beam.material.dispose();
  }
  laserBeams = [];
}

// Update the fuel level based on input
function updateFuel(deltaTime) {
  // Convert deltaTime to seconds
  const seconds = deltaTime;
  
  // Consume fuel when using overdrive
  if (overdrive && !isFuelDepleted) {
    fuelLevel -= 20 * seconds; // 20% per second
  }
  
  // Consume fuel when using laser beams
  if (shooting && !isFuelDepleted) {
    fuelLevel -= 10 * seconds; // 10% per second
  }
  
  // Replenish fuel when not using abilities
  if (!overdrive && !shooting) {
    fuelLevel += 10 * seconds; // 10% per second
  }
  
  // Clamp fuel level between 0 and 100
  fuelLevel = Math.max(0, Math.min(100, fuelLevel));
  
  // Check if fuel is depleted
  isFuelDepleted = fuelLevel <= 0;
  
  // Update the visual fuel gauge
  updateFuelGauge(fuelLevel);
}

// Function to handle player damage
function damagePlayer() {
  if (invincibilityFrames <= 0) {
    playerLives--;
    document.getElementById('lives-digit').textContent = playerLives;
    
    // Create a damage flash effect
    createDamageFlash();
    
    // Set invincibility frames to prevent multiple hits
    invincibilityFrames = 60; // About 1 second at 60fps
    
    // Check for game over
    if (playerLives <= 0) {
      isGameOver = true;
      gameOver(restartGame);
    }
  }
}

// SKIPPING GAME RESTART LOGIC FOR NOW

function initializePathfinding() {
  // Create a graph covering the game bounds
  const graph = new MapGraph3D(bounds, 30); // 30-unit grid cells
  
  // Store the graph in the scene and in THREE.Cache for global access
  scene.alienGraph = graph;
  THREE.Cache.add('alienGraph', graph);
  
  console.log("Pathfinding graph initialized");
  
  // Capture player's initial position
  const initialPlayerPos = player.location.clone();
  console.log("Player position for pathfinding:", initialPlayerPos);
  
  // Set all aliens to pathfind to player's initial position
  for (let i = 0; i < aliens.length; i++) {
    const alien = aliens[i];
    // Making sure alien has access to scene
    alien.scene = scene;
    
    // Create new pathfind state
    const pathfindState = new PathfindState(initialPlayerPos);
    
    // Apply the state
    alien.currentState = pathfindState;
    console.log(`Setting alien ${i} to pathfind state`);
    
    // Enter the state explicitly
    pathfindState.enter(alien);
  }
}
