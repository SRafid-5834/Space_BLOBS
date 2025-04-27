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
  