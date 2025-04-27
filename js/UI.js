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

  