const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');

let isPlayingMusic = false;

// Control de música
musicBtn.addEventListener('click', () => {
    if (isPlayingMusic) {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
        isPlayingMusic = false;
    } else {
        bgMusic.play().catch(err => console.log('Error al reproducir música:', err));
        musicBtn.classList.add('playing');
        isPlayingMusic = true;
    }
});

// Intentar reproducir automáticamente con volumen bajo
bgMusic.volume = 0.3;
setTimeout(() => {
    bgMusic.play().catch(err => {
        console.log('Auto-play bloqueado, el usuario debe hacer clic en el botón');
    });
}, 500);

// Configurar tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Arrays para elementos
let particles = [];
let orbitHearts = [];
let floatingHearts = [];
let messages = [];
let shootingStars = [];

// Ángulo de rotación de la órbita
let orbitAngle = 0;

// Clase para partículas de estrellas
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        this.opacity += this.twinkleSpeed * this.twinkleDirection;
        
        if (this.opacity >= 1) {
            this.twinkleDirection = -1;
        } else if (this.opacity <= 0.2) {
            this.twinkleDirection = 1;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Efecto de brillo
        ctx.strokeStyle = `rgba(255, 255, 200, ${this.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}

// Clase para corazones en órbita
class OrbitHeart {
    constructor(angle, radius) {
        this.angle = angle;
        this.radius = radius;
        this.size = Math.random() * 20 + 15;
        this.opacity = 0.9;
    }

    update(centerX, centerY, totalAngle) {
        this.x = centerX + Math.cos(this.angle + totalAngle) * this.radius;
        this.y = centerY + Math.sin(this.angle + totalAngle) * this.radius;
    }

    draw() {
        ctx.save();
        
        // Glow effect
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Corazón principal
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff1493';
        drawHeart(this.x, this.y, this.size);
        
        // Borde del corazón
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

// Clase para estrellas fugaces
class ShootingStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.vx = Math.random() * 5 + 3;
        this.vy = Math.random() * 3 + 1;
        this.opacity = 1;
        this.lifetime = Math.random() * 100 + 50;
        this.age = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        this.opacity = 1 - (this.age / this.lifetime);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const gradient = ctx.createLinearGradient(
            this.x - this.vx * 5, this.y - this.vy * 5,
            this.x, this.y
        );
        gradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.vx * 8, this.y - this.vy * 8);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isDead() {
        return this.age >= this.lifetime || this.x > canvas.width || this.y > canvas.height;
    }
}

// Clase para corazones flotantes
class FloatingHeart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = Math.random() * -2 - 1;
        this.size = Math.random() * 2 + 0.8;
        this.opacity = 1;
        this.lifetime = Math.random() * 250 + 200;
        this.age = 0;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.age++;
        this.opacity = 1 - (this.age / this.lifetime);
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff1493';
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size, this.size);
        drawHeart(0, 0, 15);
        ctx.restore();
    }

    isDead() {
        return this.age >= this.lifetime;
    }
}

// Función para dibujar un corazón
function drawHeart(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    
    ctx.bezierCurveTo(
        x - size / 2, y - size / 4,
        x - size / 2, y - size / 2,
        x - size / 4, y - size / 2
    );
    
    ctx.bezierCurveTo(
        x, y - size / 1.2,
        x, y - size / 1.2,
        x, y + size / 4
    );
    
    ctx.bezierCurveTo(
        x, y - size / 1.2,
        x, y - size / 1.2,
        x + size / 4, y - size / 2
    );
    
    ctx.bezierCurveTo(
        x + size / 2, y - size / 2,
        x + size / 2, y - size / 4,
        x, y + size / 4
    );
    
    ctx.fill();
}

// Clase para mensajes flotantes
class FloatingMessage {
    constructor() {
        const messages_list = [
            'Te Amo',
            'Eres mi Universo',
            'Para Siempre',
            'Mi Amor',
            'Infinito',
            'Te Adoro',
            'Mi Vida',
            'Mi Alma',
            'Eres Todo',
            'Te Quiero',
            'Mi Ángel',
            'Eternamente Tuya',
            'Amor Infinito',
            'Mi Corazón',
            'Eres Perfecta',
            '💕 Te Amo 💕',
            '✨ Amor ✨',
            '⭐ Ángela ⭐'
        ];
        
        this.message = messages_list[Math.floor(Math.random() * messages_list.length)];
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * -1.5 - 0.5;
        this.opacity = 0.8;
        this.lifetime = Math.random() * 400 + 300;
        this.age = 0;
        this.size = Math.random() * 24 + 14;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        this.opacity = 0.8 * (1 - (this.age / this.lifetime));
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff69b4';
        ctx.font = `bold ${this.size}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 15;
        ctx.fillText(this.message, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.age >= this.lifetime;
    }
}

// Inicializar estrellas
function initStars() {
    particles = [];
    for (let i = 0; i < 200; i++) {
        particles.push(new Star());
    }
}

// Inicializar corazones en órbita
function initOrbitHearts() {
    orbitHearts = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const numHearts = 40; // Muchos más corazones
    const radius = 250;
    
    for (let i = 0; i < numHearts; i++) {
        const angle = (i / numHearts) * Math.PI * 2;
        orbitHearts.push(new OrbitHeart(angle, radius));
    }
}

// Crear corazones aleatorios flotantes
function createFloatingHearts() {
    if (Math.random() < 0.25) {
        floatingHearts.push(new FloatingHeart(
            Math.random() * canvas.width,
            canvas.height + 50
        ));
    }
}

// Crear mensajes
function createMessages() {
    if (Math.random() < 0.12) {
        messages.push(new FloatingMessage());
    }
}

// Crear estrellas fugaces
function createShootingStars() {
    if (Math.random() < 0.08) {
        shootingStars.push(new ShootingStar());
    }
}

// Dibujar fondo
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.3, '#16213e');
    gradient.addColorStop(0.6, '#0f3460');
    gradient.addColorStop(1, '#1a1a3f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Animar
function animate() {
    drawBackground();
    
    // Estrellas
    particles.forEach(star => {
        star.update();
        star.draw();
    });
    
    // Estrellas fugaces
    createShootingStars();
    shootingStars = shootingStars.filter(star => !star.isDead());
    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });
    
    // Corazones en órbita
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    orbitAngle += 0.01; // Velocidad de rotación
    
    orbitHearts.forEach(heart => {
        heart.update(centerX, centerY, orbitAngle);
        heart.draw();
    });
    
    // Corazones flotantes
    createFloatingHearts();
    floatingHearts = floatingHearts.filter(heart => !heart.isDead());
    floatingHearts.forEach(heart => {
        heart.update();
        heart.draw();
    });
    
    // Mensajes
    createMessages();
    messages = messages.filter(msg => !msg.isDead());
    messages.forEach(msg => {
        msg.update();
        msg.draw();
    });
    
    requestAnimationFrame(animate);
}

// Interactividad
canvas.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
        floatingHearts.push(new FloatingHeart(e.clientX, e.clientY));
    }
    messages.push(new FloatingMessage());
});

canvas.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.08) {
        floatingHearts.push(new FloatingHeart(
            e.clientX + (Math.random() - 0.5) * 80,
            e.clientY + (Math.random() - 0.5) * 80
        ));
    }
});

// Iniciar
initStars();
initOrbitHearts();
animate();
