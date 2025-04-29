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

