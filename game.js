const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
const game = {
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    wave: 0,
    distance: 0
};

// Dragon object
const dragon = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    targetX: canvas.width / 2,
    targetY: canvas.height - 100
};

// Input handling
let touchActive = false;
let mouseX = canvas.width / 2;
let mouseY = canvas.height - 100;

canvas.addEventListener('touchstart', (e) => {
    touchActive = true;
});

canvas.addEventListener('touchend', () => {
    touchActive = false;
});

canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    dragon.targetX = touch.clientX;
    dragon.targetY = touch.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!touchActive) {
        dragon.targetX = mouseX;
        dragon.targetY = mouseY;
    }
});

// Spaceships array
let spaceships = [];

class Spaceship {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 3;
        this.wobbleAmount = Math.random() * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.05;
        this.wobbleOffset = 0;
    }

    update() {
        this.y += this.speed;
        this.wobbleOffset += this.wobbleSpeed;
        this.x += Math.sin(this.wobbleOffset) * this.wobbleAmount;
    }

    draw() {
        // Draw spaceship with glow
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        
        // Spaceship body
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Windows
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17, this.y + 5, 8, 8);
        
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Particles
let particles = [];

class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= this.decay;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Create explosion particles
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        const speed = 3 + Math.random() * 4;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, vx, vy, color));
    }
}

// Draw dragon
function drawDragon() {
    ctx.save();
    ctx.translate(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
    
    // Dragon head
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, -15, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon eyes
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-5, -18, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -18, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon body
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon wings
    ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-12, -5, 8, 12, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -5, 8, 12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon tail
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.quadraticCurveTo(8, 25, 5, 35);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.restore();
}

// Draw Jupiter
function drawJupiter() {
    const jupiterY = 60;
    const jupiterRadius = 25;
    
    // Jupiter glow
    ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
    ctx.shadowColor = 'rgba(255, 165, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, jupiterY, jupiterRadius + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Jupiter planet
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, jupiterY, jupiterRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Jupiter bands
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, jupiterY + (i - 1) * 8, jupiterRadius, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 237) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
}

// Update dragon position
function updateDragon() {
    const dx = dragon.targetX - dragon.x;
    const dy = dragon.targetY - dragon.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
        dragon.velocityX = (dx / distance) * dragon.speed;
        dragon.velocityY = (dy / distance) * dragon.speed;
    } else {
        dragon.velocityX *= 0.9;
        dragon.velocityY *= 0.9;
    }
    
    dragon.x += dragon.velocityX;
    dragon.y += dragon.velocityY;
    
    // Boundary checking
    dragon.x = Math.max(0, Math.min(canvas.width - dragon.width, dragon.x));
    dragon.y = Math.max(0, Math.min(canvas.height - dragon.height, dragon.y));
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Spawn spaceships
function spawnSpaceships() {
    game.wave++;
    const spawnRate = Math.min(5, 1 + game.wave * 0.5);
    
    if (Math.random() < spawnRate * 0.01) {
        spaceships.push(new Spaceship());
    }
}

// Update game
function update() {
    if (game.gameOver || game.won) return;
    
    // Calculate distance to Jupiter
    const jupiterY = 60;
    const distanceToJupiter = Math.max(0, jupiterY - dragon.y);
    game.distance = Math.min(100, Math.round((1 - distanceToJupiter / canvas.height) * 100));
    
    // Check if reached Jupiter
    if (dragon.y < 100) {
        game.won = true;
        endGame(true);
        return;
    }
    
    updateDragon();
    spawnSpaceships();
    
    // Update spaceships
    spaceships.forEach((ship, index) => {
        ship.update();
        
        // Check collision with dragon
        if (checkCollision(dragon, ship)) {
            createExplosion(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2, 'rgba(0, 255, 0, 0.8)');
            game.lives--;
            spaceships.splice(index, 1);
            
            if (game.lives <= 0) {
                game.gameOver = true;
                endGame(false);
            }
        }
        
        // Remove off-screen spaceships
        if (ship.isOffScreen()) {
            game.score += 10;
            spaceships.splice(index, 1);
        }
    });
    
    // Update particles
    particles = particles.filter(p => !p.isDead());
    particles.forEach(p => p.update());
    
    // Update stats
    document.getElementById('score').textContent = game.score;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('distance').textContent = game.distance;
}

// Draw game
function draw() {
    // Clear canvas with space background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    drawJupiter();
    
    spaceships.forEach(ship => ship.draw());
    particles.forEach(p => p.draw());
    drawDragon();
}

// End game
function endGame(won) {
    const modal = document.getElementById('gameOverScreen');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    const finalScore = document.getElementById('finalScore');
    
    if (won) {
        title.textContent = '🎉 You Won!';
        message.textContent = 'You reached Jupiter safely!';
    } else {
        title.textContent = '💀 Game Over!';
        message.textContent = 'You collided with a spaceship!';
    }
    
    finalScore.textContent = game.score;
    modal.classList.remove('hidden');
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
