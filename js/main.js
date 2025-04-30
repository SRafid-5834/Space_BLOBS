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

function spawnAlien(count){
  // Create {count} aliens at random positions
  for (let i = 0; i < count; i++) {
    const alien = new Alien(0x000000, player, asteroids);
    alien.setModel(resources.get('blob'));
    
    // Settibg scene reference immediately
    alien.scene = scene;
    
    // Random position within bounds
    const x = Math.random() * (bounds.max.x - bounds.min.x) + bounds.min.x;
    const y = Math.random() * (bounds.max.y - bounds.min.y) + bounds.min.y;
    const z = Math.random() * (bounds.max.z - bounds.min.z) + bounds.min.z;
    
    alien.location = new THREE.Vector3(x, y, z);
    
    aliens.push(alien);
    scene.add(alien.gameObject);
  }
}

// Setup our scene
function init() {
  scene.background = new THREE.Color(0x000008);
  scene.add(camera);

  // Renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Directional Light
  let directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(0, 200, 800);
  scene.add(directionalLight);

  // Ambient Light
  let ambient = new THREE.AmbientLight(0xffffff, .05);
  scene.add(ambient);

  // Initialize bounds
  bounds = new THREE.Box3(
    new THREE.Vector3(-300, -300, -300), // scene min
    new THREE.Vector3(300, 300, 300) // scene max
  );

  // Add the player to the scene
  scene.add(player.gameObject);
  
  // Create forward guidance line
  createForwardLine();

  // Create 10 aliens at random positions
  // for (let i = 0; i < alienCount; i++) {
  //   const alien = new Alien(0x000000, player, asteroids);
  //   alien.setModel(resources.get('blob'));
    
  //   // Settibg scene reference immediately
  //   alien.scene = scene;
    
  //   // Random position within bounds
  //   const x = Math.random() * (bounds.max.x - bounds.min.x) + bounds.min.x;
  //   const y = Math.random() * (bounds.max.y - bounds.min.y) + bounds.min.y;
  //   const z = Math.random() * (bounds.max.z - bounds.min.z) + bounds.min.z;
    
  //   alien.location = new THREE.Vector3(x, y, z);
    
  //   aliens.push(alien);
  //   scene.add(alien.gameObject);
  // }
  spawnAlien(alienCount); // Create alien

  initializePathfinding(); // Initialize pathfinding for aliens

  // init event listeners
  initEventListeners();

  createStarfield(); // Create the starfield with stars


  createLivesUI(playerLives); // Create UI for lives display
  createAlienCountUI(alienCount); // Create UI for alien indicators

  createFuelGauge(fuelLevel, fuelGaugeHeight, fuelGaugeWidth); // Create the fuel gauge UI

  // First call to animate
  animate();
}

// Function to control our player
function controlPlayer() {
  // Update player's topSpeed based on overdrive state
  player.topSpeed = overdrive ? 120 : 12; // 10x speed when in overdrive

  // Get the player's forward direction
  const forwardDirection = new THREE.Vector3();
  player.gameObject.getWorldDirection(forwardDirection);
  // Normalize the direction and scale it for movement
  forwardDirection.normalize();
  
  // Apply overdrive multiplier if shift is pressed and fuel is available
  const speedMultiplier = (overdrive && !isFuelDepleted) ? 10 : 1;

  // Apply continuous movement
  player.applyForce(forwardDirection.clone().multiplyScalar(10 * speedMultiplier));
  
  // Get the right direction
  const rightDirection = new THREE.Vector3();
  rightDirection.crossVectors(forwardDirection, new THREE.Vector3(0, 1, 0)).normalize();

  // Apply left/right movement based on input
  if (a) player.applyForce(rightDirection.clone().multiplyScalar(-10 * speedMultiplier));
  if (d) player.applyForce(rightDirection.clone().multiplyScalar(10 * speedMultiplier));

  // W moves up, S moves down on the y axis
  if (w) player.applyForce(new THREE.Vector3(0, 10 * speedMultiplier, 0));
  if (s) player.applyForce(new THREE.Vector3(0, -10 * speedMultiplier, 0));
}

// Update the forward line to show the direction
function updateForwardLine() {
  if (!forwardLine) return;
  
  // Get current position
  const startPoint = new THREE.Vector3(0, 0, 0);
  
  // Calculate the forward direction
  const endPoint = new THREE.Vector3(0, 0, 2000); // 2000 units forward
  
  // Update the line geometry
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
  forwardLine.geometry.dispose();
  forwardLine.geometry = lineGeometry;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // Change in time
  let deltaTime = clock.getDelta();
  
  // Update fuel based on input
  updateFuel(deltaTime);

  // Update forward guidance line
  updateForwardLine();
  
  // Generate our steering force for player
  let steer = player.avoidMultipleCollisions(asteroids, 5);

  // If there is steering force
  if (steer.length() != 0) { 
    // Apply our steering force with higher priority
    if (overdrive) {
      player.applyForce(steer.clone().multiplyScalar(20));
    }
    player.applyForce(steer.multiplyScalar(2));
  } else {
    // Control our player
    controlPlayer();
  }

  
  // Create Third Person Camera
  const thirdPersonCamera = new ThirdPersonCamera(camera, player.gameObject);

  // Update player and camera
  player.update(deltaTime, bounds);
  // thirdPersonCamera.update(deltaTime);
  thirdPersonCamera.update();

  // Update all aliens
  for (let alien of aliens) {
    alien.update(deltaTime, bounds);
  }

  // Update laser beams with raycasting if they exist
  if (shooting && !isFuelDepleted && laserBeams.length > 0) {
    for (let beam of laserBeams) {
      const raycaster = new THREE.Raycaster();
      
      // Get player's position as origin
      const origin = new THREE.Vector3();
      player.gameObject.getWorldPosition(origin);
      
      // Get the beam's forward direction in world space
      const beamDirection = new THREE.Vector3(0, 0, 1); // Use positive Z
      beamDirection.applyQuaternion(player.gameObject.quaternion);
      
      raycaster.set(origin, beamDirection);
      
      // Objects to check
      const objectsToCheck = [...asteroids, ...aliens.map(a => a.gameObject)];
      
      // Check for intersections
      const intersects = raycaster.intersectObjects(objectsToCheck, true);
      
      // If we hit something
      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        
        // Check if the hit object belongs to an alien via the userData property
        if (hitObject.userData && hitObject.userData.alienRef) {
          const hitAlien = hitObject.userData.alienRef;
          
          if (!hitAlien.isDead) {
            console.log("Alien hit!");
            // Mark alien as dead
            hitAlien.isDead = true;
            
            // Remove from scene
            scene.remove(hitAlien.gameObject);
            
            // Remove from aliens array
            const index = aliens.indexOf(hitAlien);
            if (index > -1) {
              aliens.splice(index, 1);
            }
            
            // Update alien indicators
            updateAlienIndicators(aliens);
  
            // Check for victory (all aliens destroyed)
            if (aliens.length === 0) {
              console.log("Victory! All aliens destroyed");
              showVictory(restartGame);
            }
          }
        }
        
        // Calculate the local space distance for beam length
        const localPoint = player.gameObject.worldToLocal(intersects[0].point.clone());
        
        // Update beam geometry with correct endpoints
        const beamOffset = new THREE.Vector3(
          beam.geometry.attributes.position.array[0],
          beam.geometry.attributes.position.array[1],
          0 // Start at local origin Z
        );
        
        // Create new points array
        const points = [
          beamOffset,
          new THREE.Vector3(
            beamOffset.x,
            beamOffset.y,
            localPoint.z // End at hit point Z in local space
          )
        ];
        
        // Update geometry
        beam.geometry.dispose();
        beam.geometry = new THREE.BufferGeometry().setFromPoints(points);
      }

    }
  }

  // Update invincibility frames
  if (invincibilityFrames > 0) {
    invincibilityFrames -= 1;
    
    // Optional: make the player blink when invincible
    player.gameObject.visible = Math.floor(invincibilityFrames / 5) % 2 === 0;
  } else {
    player.gameObject.visible = true;
  }

}