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
    lives: 5,
    gameOver: false,
    won: false,
    wave: 0,
    distance: 0,
    timeElapsed: 0
};

// Dragon object
const dragon = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    speed: 6,
    targetX: canvas.width / 2,
    targetY: canvas.height - 100,
    trailX: [],
    trailY: []
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
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        // Slower base speed for easier gameplay
        this.speed = 1.5 + Math.random() * 2;
        this.wobbleAmount = Math.random() * 1.5;
        this.wobbleSpeed = 0.015 + Math.random() * 0.03;
        this.wobbleOffset = 0;
        this.rotation = 0;
    }

    update() {
        this.y += this.speed;
        this.wobbleOffset += this.wobbleSpeed;
        this.x += Math.sin(this.wobbleOffset) * this.wobbleAmount;
        this.rotation += 0.02;
        
        // Keep in bounds horizontally
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Spaceship glow
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Spaceship body
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(15, 15);
        ctx.lineTo(0, 8);
        ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fill();
        
        // Windows with glow
        ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
        ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-5, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Particles
let particles = [];

class Particle {
    constructor(x, y, vx, vy, color, life = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.decay = 0.015;
        this.size = 4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08;
        this.life -= this.decay;
        this.size *= 0.98;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Create explosion particles
function createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, vx, vy, color, 1));
    }
}

// Create trail particles
function createTrail(x, y) {
    const colors = ['rgba(0, 255, 100, 0.6)', 'rgba(0, 200, 150, 0.4)'];
    particles.push(new Particle(
        x + Math.random() * 10 - 5,
        y + Math.random() * 10 - 5,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        colors[Math.floor(Math.random() * colors.length)],
        0.7
    ));
}

// Draw dragon with smoother animations
function drawDragon() {
    ctx.save();
    
    // Calculate rotation based on movement direction
    const dx = dragon.targetX - dragon.x;
    const angle = Math.atan2(dx, -50);
    
    ctx.translate(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
    ctx.rotate(angle * 0.3);
    
    // Dragon glow
    ctx.fillStyle = 'rgba(0, 255, 150, 0.2)';
    ctx.shadowColor = 'rgba(0, 255, 150, 0.6)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon head
    ctx.fillStyle = '#00ff99';
    ctx.shadowColor = 'rgba(0, 255, 150, 0.8)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, -18, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon eyes - animated
    const eyeOffset = Math.sin(game.timeElapsed * 0.1) * 2;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-6, -20 + eyeOffset, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -20 + eyeOffset, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-6, -20 + eyeOffset, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -20 + eyeOffset, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon body
    ctx.fillStyle = '#00ff99';
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon wings - animated
    const wingFlap = Math.sin(game.timeElapsed * 0.15) * 0.3;
    ctx.fillStyle = 'rgba(0, 255, 150, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-16, 0, 10, 14, Math.PI / 4 + wingFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(16, 0, 10, 14, -Math.PI / 4 - wingFlap, 0, Math.PI * 2);
    ctx.fill();
    
    // Dragon tail - animated
    ctx.strokeStyle = '#00ff99';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 20);
    const tailWave = Math.sin(game.timeElapsed * 0.2) * 5;
    ctx.quadraticCurveTo(10 + tailWave, 32, 8, 45);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Add trail particles
    if (Math.random() > 0.6) {
        createTrail(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
    }
}

// Draw Jupiter
function drawJupiter() {
    const jupiterY = 70;
    const jupiterRadius = 30;
    
    // Jupiter glow (stronger)
    ctx.fillStyle = 'rgba(255, 165, 0, 0.4)';
    ctx.shadowColor = 'rgba(255, 165, 0, 0.9)';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, jupiterY, jupiterRadius + 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Jupiter planet
    const gradient = ctx.createRadialGradient(canvas.width / 2 - 10, jupiterY - 10, 5, canvas.width / 2, jupiterY, jupiterRadius);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.7, '#FFA500');
    gradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, jupiterY, jupiterRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Jupiter bands
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, jupiterY + (i - 1.5) * 10, jupiterRadius, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Goal text
    ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GOAL: Reach Jupiter!', canvas.width / 2, jupiterY + jupiterRadius + 30);
    
    ctx.shadowBlur = 0;
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 150; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 237) % canvas.height;
        const brightness = 0.5 + Math.sin(game.timeElapsed * 0.02 + i) * 0.5;
        ctx.globalAlpha = brightness;
        const size = (i % 3) * 0.7 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
}

// Update dragon position with smooth movement
function updateDragon() {
    const dx = dragon.targetX - dragon.x;
    const dy = dragon.targetY - dragon.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 8) {
        dragon.velocityX = (dx / distance) * dragon.speed * 0.9;
        dragon.velocityY = (dy / distance) * dragon.speed * 0.9;
    } else {
        dragon.velocityX *= 0.85;
        dragon.velocityY *= 0.85;
    }
    
    dragon.x += dragon.velocityX;
    dragon.y += dragon.velocityY;
    
    // Boundary checking with padding
    dragon.x = Math.max(10, Math.min(canvas.width - dragon.width - 10, dragon.x));
    dragon.y = Math.max(10, Math.min(canvas.height - dragon.height - 10, dragon.y));
}

// Check collision with more forgiveness
function checkCollision(rect1, rect2) {
    const padding = 15; // More forgiving collision detection
    return rect1.x + padding < rect2.x + rect2.width &&
           rect1.x + rect1.width - padding > rect2.x &&
           rect1.y + padding < rect2.y + rect2.height &&
           rect1.y + rect1.height - padding > rect2.y;
}

// Spawn spaceships with slower progression
function spawnSpaceships() {
    game.wave++;
    // Much slower spawn rate that increases gradually
    const spawnRate = Math.min(3, 0.3 + game.wave * 0.15);
    
    if (Math.random() < spawnRate * 0.01) {
        spaceships.push(new Spaceship());
    }
}

// Update game
function update() {
    game.timeElapsed++;
    
    if (game.gameOver || game.won) return;
    
    // Calculate distance to Jupiter
    const jupiterY = 70;
    const distanceToJupiter = Math.max(0, jupiterY - dragon.y);
    game.distance = Math.min(100, Math.round((1 - distanceToJupiter / canvas.height) * 100));
    
    // Check if reached Jupiter (more forgiving)
    if (dragon.y < 120) {
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
            createExplosion(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2, 'rgba(0, 255, 150, 0.8)', 25);
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
    // Clear canvas with smooth space background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    drawJupiter();
    
    // Draw spaceships
    spaceships.forEach(ship => ship.draw());
    
    // Draw particles
    particles.forEach(p => p.draw());
    
    // Draw dragon
    drawDragon();
    
    // Draw difficulty indicator
    ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Wave: ${game.wave}`, 20, canvas.height - 20);
}

// End game
function endGame(won) {
    const modal = document.getElementById('gameOverScreen');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    const finalScore = document.getElementById('finalScore');
    
    if (won) {
        title.textContent = '🎉 You Won!';
        message.textContent = 'You reached Jupiter safely! Amazing flying!';
        createExplosion(canvas.width / 2, canvas.height / 2, 'rgba(0, 255, 200, 0.9)', 50);
    } else {
        title.textContent = '💫 Game Over!';
        message.textContent = 'You collided with a spaceship. Try again!';
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
