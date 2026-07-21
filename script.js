const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Configurar tamaño del canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Arrays para elementos
let particles = [];
let hearts = [];
let messages = [];

// Clase para partículas de estrellas
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        this.opacity += this.twinkleSpeed * this.twinkleDirection;
        
        if (this.opacity >= 1) {
            this.twinkleDirection = -1;
        } else if (this.opacity <= 0.3) {
            this.twinkleDirection = 1;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Clase para corazones
class Heart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = Math.random() * -2 - 1;
        this.size = Math.random() * 1.5 + 1;
        this.opacity = 1;
        this.lifetime = Math.random() * 200 + 150;
        this.age = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravedad
        this.age++;
        this.opacity = 1 - (this.age / this.lifetime);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff1493';
        ctx.translate(this.x, this.y);
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
    
    // Lado izquierdo
    ctx.bezierCurveTo(
        x - size / 2, y - size / 4,
        x - size / 2, y - size / 2,
        x - size / 4, y - size / 2
    );
    
    // Superior
    ctx.bezierCurveTo(
        x, y - size / 1.2,
        x, y - size / 1.2,
        x, y + size / 4
    );
    
    // Lado derecho
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
            '💕',
            '✨',
            '⭐'
        ];
        
        this.message = messages_list[Math.floor(Math.random() * messages_list.length)];
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = Math.random() * -1 - 0.5;
        this.opacity = 0.8;
        this.lifetime = Math.random() * 300 + 200;
        this.age = 0;
        this.size = Math.random() * 20 + 12;
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
        ctx.font = `bold ${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 10;
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
    for (let i = 0; i < 150; i++) {
        particles.push(new Star());
    }
}

// Crear corazones aleatorios
function createHearts() {
    if (Math.random() < 0.3) {
        hearts.push(new Heart(
            Math.random() * canvas.width,
            canvas.height + 50
        ));
    }
}

// Crear mensajes
function createMessages() {
    if (Math.random() < 0.15) {
        messages.push(new FloatingMessage());
    }
}

// Dibujar fondo con degradado
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Animar
function animate() {
    // Dibujar fondo
    drawBackground();
    
    // Actualizar y dibujar estrellas
    particles.forEach(star => {
        star.update();
        star.draw();
    });
    
    // Crear nuevos corazones
    createHearts();
    
    // Actualizar y dibujar corazones
    hearts = hearts.filter(heart => !heart.isDead());
    hearts.forEach(heart => {
        heart.update();
        heart.draw();
    });
    
    // Crear nuevos mensajes
    createMessages();
    
    // Actualizar y dibujar mensajes
    messages = messages.filter(msg => !msg.isDead());
    messages.forEach(msg => {
        msg.update();
        msg.draw();
    });
    
    requestAnimationFrame(animate);
}

// Interactividad: crear corazones al hacer clic
canvas.addEventListener('click', (e) => {
    for (let i = 0; i < 5; i++) {
        hearts.push(new Heart(e.clientX, e.clientY));
    }
    messages.push(new FloatingMessage());
});

// Interactividad: crear corazones al mover el mouse
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (Math.random() < 0.1) {
        hearts.push(new Heart(
            mouseX + (Math.random() - 0.5) * 100,
            mouseY + (Math.random() - 0.5) * 100
        ));
    }
});

// Iniciar animación
initStars();
animate();