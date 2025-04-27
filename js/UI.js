// UI.js - UI elements for the game

// Function to create UI for lives display
function createLivesUI(initialLives) {
  const livesContainer = document.createElement('div');
  livesContainer.id = 'lives-container';
  livesContainer.style.position = 'absolute';
  livesContainer.style.top = '20px';
  livesContainer.style.left = '20px';
  livesContainer.style.display = 'flex';
  livesContainer.style.flexDirection = 'column';
  livesContainer.style.alignItems = 'center';
  livesContainer.style.fontFamily = 'Arial, sans-serif';
  
  // Create large digit for lives count
  const livesDigit = document.createElement('div');
  livesDigit.id = 'lives-digit';
  livesDigit.textContent = initialLives;
  livesDigit.style.fontSize = '72px';
  livesDigit.style.fontWeight = 'bold';
  livesDigit.style.color = '#0080ff'; // Blue color
  livesDigit.style.textShadow = 
    '-2px -2px 0 white, ' +
    '2px -2px 0 white, ' +
    '-2px 2px 0 white, ' +
    '2px 2px 0 white'; // Thick white border effect
  livesDigit.style.lineHeight = '1';
  
  // Create "LIVES" text underneath
  const livesText = document.createElement('div');
  livesText.textContent = 'LIVES';
  livesText.style.fontSize = '24px';
  livesText.style.color = 'white';
  livesText.style.marginTop = '-2px'; // Move a bit closer to the number
  
  // Add both elements to the container
  livesContainer.appendChild(livesDigit);
  livesContainer.appendChild(livesText);
  
  document.body.appendChild(livesContainer);
}


// Function to create the alien indicators UI
function createAlienCountUI(alienCount) {
  // Create container for alien indicators
  const alienCountContainer = document.createElement('div');
  alienCountContainer.id = 'alien-count-container';
  alienCountContainer.style.position = 'absolute';
  alienCountContainer.style.top = '20px';
  alienCountContainer.style.right = '20px';
  alienCountContainer.style.display = 'flex';
  alienCountContainer.style.gap = '5px';
  document.body.appendChild(alienCountContainer);
  
  // Create alien indicators
  for (let i = 0; i < alienCount; i++) {
    const alienIndicator = document.createElement('div');
    alienIndicator.className = 'alien-indicator';
    alienIndicator.style.width = '30px';
    alienIndicator.style.height = '30px';
    alienIndicator.style.backgroundColor = '#5df15d'; // Bright green color
    alienIndicator.style.borderRadius = '50%'; // Circular shape
    alienIndicator.style.border = '2px solid white'; // White border
    alienIndicator.style.position = 'relative';
    
    // Add small circular eyes for detail
    const leftEye = document.createElement('div');
    leftEye.style.width = '5px';
    leftEye.style.height = '5px';
    leftEye.style.backgroundColor = '#2ca82c'; // Darker green for eyes
    leftEye.style.borderRadius = '50%';
    leftEye.style.position = 'absolute';
    leftEye.style.top = '8px';
    leftEye.style.left = '7px';
    
    const rightEye = document.createElement('div');
    rightEye.style.width = '5px';
    rightEye.style.height = '5px';
    rightEye.style.backgroundColor = '#2ca82c'; // Darker green for eyes
    rightEye.style.borderRadius = '50%';
    rightEye.style.position = 'absolute';
    rightEye.style.top = '8px';
    rightEye.style.right = '7px';
    
    alienIndicator.appendChild(leftEye);
    alienIndicator.appendChild(rightEye);
    
    alienCountContainer.appendChild(alienIndicator);
  }
}

// Function to update alien indicators when an alien is destroyed
function updateAlienIndicators(aliens) {
  const indicators = document.querySelectorAll('.alien-indicator');
  const aliveAliens = aliens.filter(alien => !alien.isDead).length;
  const deadAliens = indicators.length - aliveAliens;
  
  // Update indicators to show dead aliens in grayscale
  for (let i = 0; i < indicators.length; i++) {
    if (i < deadAliens) {
      indicators[i].style.backgroundColor = '#888888'; // Gray color
      indicators[i].style.filter = 'grayscale(100%)';
      
      // Also make eyes gray
      const eyes = indicators[i].querySelectorAll('div');
      eyes.forEach(eye => {
        eye.style.backgroundColor = '#555555';
      });
    }
  }
}

// Reset alien indicators for game restart
function resetAlienIndicators() {
  const indicators = document.querySelectorAll('.alien-indicator');
  indicators.forEach(indicator => {
    indicator.style.backgroundColor = '#5df15d'; // Reset to green
    indicator.style.filter = 'none'; // Remove grayscale filter
    
    // Reset eyes color
    const eyes = indicator.querySelectorAll('div');
    eyes.forEach(eye => {
      eye.style.backgroundColor = '#2ca82c';
    });
  });
}

// Create the fuel gauge UI
function createFuelGauge(initialFuelLevel, gaugeHeight, gaugeWidth) {
  // Create container
  const fuelContainer = document.createElement('div');
  fuelContainer.id = 'fuel-container';
  fuelContainer.style.position = 'absolute';
  fuelContainer.style.bottom = '20px';
  fuelContainer.style.left = '20px';
  fuelContainer.style.display = 'flex';
  fuelContainer.style.flexDirection = 'column';
  fuelContainer.style.alignItems = 'center';
  
  // Create gauge background/border
  const fuelBorder = document.createElement('div');
  fuelBorder.style.width = `${gaugeWidth}px`;
  fuelBorder.style.height = `${gaugeHeight}px`;
  fuelBorder.style.border = '2px solid white';
  fuelBorder.style.borderRadius = '5px';
  fuelBorder.style.position = 'relative';
  fuelBorder.style.overflow = 'hidden';
  
  // Create fuel level indicator
  const fuelIndicator = document.createElement('div');
  fuelIndicator.id = 'fuel-indicator';
  fuelIndicator.style.width = '100%';
  fuelIndicator.style.height = '100%';
  fuelIndicator.style.backgroundColor = '#00ff00'; // Green color for fuel
  fuelIndicator.style.position = 'absolute';
  fuelIndicator.style.bottom = '0';
  fuelIndicator.style.transition = 'height 0.3s ease-out';
  
  // Create fuel text
  const fuelText = document.createElement('div');
  fuelText.textContent = 'FUEL';
  fuelText.style.color = 'white';
  fuelText.style.marginTop = '5px';
  fuelText.style.fontFamily = 'Arial, sans-serif';
  
  // Assemble the components
  fuelBorder.appendChild(fuelIndicator);
  fuelContainer.appendChild(fuelBorder);
  fuelContainer.appendChild(fuelText);
  document.body.appendChild(fuelContainer);
  
  // Set initial fuel level
  updateFuelGauge(initialFuelLevel);
}

// Update the fuel gauge display
function updateFuelGauge(fuelLevel) {
  const fuelIndicator = document.getElementById('fuel-indicator');
  fuelIndicator.style.height = `${fuelLevel}%`;
  
  // Change color based on fuel level
  if (fuelLevel <= 20) {
    fuelIndicator.style.backgroundColor = '#ff0000'; // Red when low
  } else if (fuelLevel <= 50) {
    fuelIndicator.style.backgroundColor = '#ffff00'; // Yellow when medium
  } else {
    fuelIndicator.style.backgroundColor = '#00ff00'; // Green when high
  }
}

// Function to create damage flash effect
function createDamageFlash() {
  const flash = document.createElement('div');
  flash.style.position = 'absolute';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.width = '100%';
  flash.style.height = '100%';
  flash.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  flash.style.pointerEvents = 'none';
  document.body.appendChild(flash);
  
  // Remove flash after a short time
  setTimeout(() => {
    document.body.removeChild(flash);
  }, 200);
}
