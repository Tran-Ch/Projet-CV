const canvas = document.getElementById('starfield');
const context = canvas.getContext('2d');
const root = document.documentElement;

let stars = [];
let width = 0;
let height = 0;
let pixelRatio = window.devicePixelRatio || 1;

const STAR_COUNT = 260;
const STAR_SPEED = 0.12;

function resizeCanvas() {
    pixelRatio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    generateStars();
}

function generateStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.2,
        alpha: Math.random() * 0.5 + 0.3,
        twinkle: Math.random() * 0.03 + 0.005,
        drift: Math.random() * STAR_SPEED + 0.05
    }));
}

function drawStars() {
    context.clearRect(0, 0, width, height);

    stars.forEach((star) => {
        star.y += star.drift;
        if (star.y > height + star.radius) {
            star.y = -star.radius;
            star.x = Math.random() * width;
        }

        star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
        star.alpha = Math.min(0.9, Math.max(0.1, star.alpha));

        const glow = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
        glow.addColorStop(0, `rgba(187, 229, 255, ${star.alpha})`);
        glow.addColorStop(1, 'rgba(187, 229, 255, 0)');

        context.beginPath();
        context.fillStyle = glow;
        context.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
    });

    requestAnimationFrame(drawStars);
}

function handlePointerMove(event) {
    const x = (event.clientX / window.innerWidth - 0.5) * 40;
    const y = (event.clientY / window.innerHeight - 0.5) * 40;
    root.style.setProperty('--pointer-x', `${x}px`);
    root.style.setProperty('--pointer-y', `${y}px`);
}

function handlePointerLeave() {
    root.style.setProperty('--pointer-x', '0px');
    root.style.setProperty('--pointer-y', '0px');
}

function init() {
    resizeCanvas();
    drawStars();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('pointermove', handlePointerMove);
window.addEventListener('pointerleave', handlePointerLeave);
window.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) {
        handlePointerLeave();
    }
});
window.addEventListener('touchmove', (event) => {
    if (event.touches && event.touches.length) {
        const touch = event.touches[0];
        handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
}, { passive: true });

window.addEventListener('touchend', handlePointerLeave);

const reloadHandler = document.querySelector('.signature__handler');

if (reloadHandler) {
    const triggerReload = () => {
        window.location.reload();
    };

    reloadHandler.addEventListener('click', (event) => {
        event.preventDefault();
        triggerReload();
    });

    reloadHandler.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            triggerReload();
        }
    });
}

init();