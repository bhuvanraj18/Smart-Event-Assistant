/**
 * Confetti Animation Utility
 * Lightweight canvas-based confetti using Event Genie's color palette.
 * Usage: launchConfetti(containerElement)
 */

const COLORS = [
  '#8b6914', // accent-gold
  '#c4626a', // accent-rose
  '#a0784c', // accent-warm
  '#f5f0e8', // cream
  '#e6c453', // bright gold
  '#d4a574', // soft copper
  '#f0d8a8', // pale gold
];

const PARTICLE_COUNT = 150;
const GRAVITY = 0.35;
const DRAG = 0.98;
const FADE_SPEED = 0.008;

class Particle {
  constructor(canvas) {
    this.x = canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.3;
    this.y = canvas.height * 0.4;
    this.vx = (Math.random() - 0.5) * 18;
    this.vy = -Math.random() * 22 - 8;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size = Math.random() * 8 + 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 12;
    this.opacity = 1;
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
  }

  update() {
    this.vx *= DRAG;
    this.vy += GRAVITY;
    this.vy *= DRAG;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.opacity -= FADE_SPEED;
  }

  draw(ctx) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;

    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * Launch a confetti burst inside the given container element.
 * The canvas auto-removes after the animation completes.
 * @param {HTMLElement} container - DOM element to place the canvas inside
 */
export function launchConfetti(container) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  (container || document.body).appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(canvas));

  let animId;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
      if (p.opacity > 0) alive = true;
    });

    if (alive) {
      animId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animId);
      canvas.remove();
    }
  };

  animate();
}
