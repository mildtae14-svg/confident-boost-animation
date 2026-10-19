/**
 * CONFIDENT BOOST - Luxury Gold Animation Engine
 * High-performance Vanilla JavaScript HTML5 Canvas & 3D Interactive Showcase
 */

// Sound Synthesizer using Web Audio API (No external audio files needed)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.pentatonic = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0, 2637.02]; // C6, E6, G6, B6, C7, E7
    this.noteIdx = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime(boost = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freq = this.pentatonic[this.noteIdx % this.pentatonic.length] * boost;
      this.noteIdx++;

      // Primary sine oscillator for crystal clarity
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Shimmer overtone oscillator
      const oscOvertone = this.ctx.createOscillator();
      const gainOvertone = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscOvertone.type = 'triangle';
      oscOvertone.frequency.setValueAtTime(freq * 2.02, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      gainOvertone.gain.setValueAtTime(0.08, now);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      oscOvertone.connect(gainOvertone);
      gainOvertone.connect(this.ctx.destination);

      osc.start(now);
      oscOvertone.start(now);

      osc.stop(now + 1.2);
      oscOvertone.stop(now + 0.8);
    } catch (e) {
      console.warn("Audio playback not allowed yet", e);
    }
  }
}

// Particle & Flare Canvas Animation System
class AnimationEngine {
  constructor(canvas, cardElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.card = cardElement;
    this.sound = new SoundFX();

    this.isPlaying = true;
    this.enableTilt = true;
    this.enableRibbon = true;
    this.enableFlares = true;
    this.particleDensityMultiplier = 1.0;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Particle storage
    this.bokehList = [];
    this.dustList = [];
    this.burstSparks = [];
    this.shockwaves = [];
    this.fixedFlares = [];

    // Interactive tracking
    this.mouse = { x: -100, y: -100, prevX: -100, prevY: -100, isInside: false };
    this.tilt = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };

    this.lastTime = performance.now();
    this.globalTime = 0;

    this.setupFixedFlares();
    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupFixedFlares() {
    // Exact anchor coordinates normalized [0..1] mapping key sparkle nodes on poster
    this.fixedFlares = [
      { id: 'new-star', nx: 0.155, ny: 0.076, scale: 1.4, freq: 1.8, phase: 0.0, baseR: 28 },
      { id: 'cap-glow', nx: 0.655, ny: 0.320, scale: 1.8, freq: 2.2, phase: 1.2, baseR: 36 },
      { id: 'bottle-shoulder', nx: 0.510, ny: 0.395, scale: 1.3, freq: 1.5, phase: 2.5, baseR: 24 },
      { id: 'logo-crest', nx: 0.645, ny: 0.635, scale: 1.2, freq: 1.9, phase: 0.7, baseR: 22 },
      { id: 'pedestal-front', nx: 0.665, ny: 0.842, scale: 2.0, freq: 2.5, phase: 3.1, baseR: 40 },
      { id: 'pedestal-left', nx: 0.405, ny: 0.845, scale: 1.3, freq: 1.4, phase: 4.2, baseR: 26 },
      { id: 'pedestal-right', nx: 0.805, ny: 0.825, scale: 1.4, freq: 1.6, phase: 1.8, baseR: 28 },
      { id: 'facet-left', nx: 0.505, ny: 0.805, scale: 1.4, freq: 2.1, phase: 2.0, baseR: 26 },
      { id: 'facet-right', nx: 0.765, ny: 0.785, scale: 1.3, freq: 1.7, phase: 5.2, baseR: 25 },
      { id: 'badge-odor', nx: 0.092, ny: 0.490, scale: 1.1, freq: 1.3, phase: 0.9, baseR: 20 },
      { id: 'badge-fresh', nx: 0.092, ny: 0.565, scale: 1.1, freq: 1.5, phase: 2.1, baseR: 20 },
      { id: 'badge-care', nx: 0.092, ny: 0.640, scale: 1.1, freq: 1.2, phase: 3.4, baseR: 20 }
    ];
  }

  resize() {
    const rect = this.card.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  initParticles() {
    const bokehCount = Math.floor(25 * this.particleDensityMultiplier);
    const dustCount = Math.floor(140 * this.particleDensityMultiplier);

    this.bokehList = [];
    for (let i = 0; i < bokehCount; i++) {
      this.bokehList.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 12 + Math.random() * 32,
        speedY: 0.3 + Math.random() * 0.7,
        swayFreq: 0.001 + Math.random() * 0.002,
        swayAmp: 15 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.15 + Math.random() * 0.35,
        hue: 45 + Math.random() * 12 // Gold warm hue
      });
    }

    this.dustList = [];
    for (let i = 0; i < dustCount; i++) {
      this.dustList.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 1 + Math.random() * 2.5,
        speedY: 0.6 + Math.random() * 1.4,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.03 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    const handlePointerMove = (clientX, clientY) => {
      const rect = this.card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        this.mouse.prevX = this.mouse.x;
        this.mouse.prevY = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;
        this.mouse.isInside = true;

        // 3D Tilt calculation (-15deg to +15deg)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const normX = (x - centerX) / centerX;
        const normY = (y - centerY) / centerY;

        this.tilt.targetY = normX * 12; // Rotate around Y axis
        this.tilt.targetX = -normY * 12; // Rotate around X axis

        // Update CSS variable for specular gleam
        const pctX = (x / rect.width * 100).toFixed(1) + '%';
        const pctY = (y / rect.height * 100).toFixed(1) + '%';
        this.card.style.setProperty('--mouse-x', pctX);
        this.card.style.setProperty('--mouse-y', pctY);

        // Spawn glittering mouse cursor trail
        const dist = Math.hypot(x - this.mouse.prevX, y - this.mouse.prevY);
        if (dist > 4 && this.isPlaying) {
          this.emitMouseSparks(x, y, 2);
        }
      } else {
        this.handlePointerLeave();
      }
    };

    this.card.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
    this.card.addEventListener('mouseleave', () => this.handlePointerLeave());

    // Touch support
    this.card.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.card.addEventListener('touchend', () => this.handlePointerLeave());

    // Click burst
    this.card.addEventListener('click', (e) => {
      const rect = this.card.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      this.triggerShockwave(clickX, clickY);
      this.triggerBurst(clickX, clickY, 45);
      this.sound.playChime(1.1);
    });
  }

  handlePointerLeave() {
    this.mouse.isInside = false;
    this.tilt.targetX = 0;
    this.tilt.targetY = 0;
  }

  emitMouseSparks(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.2;
      this.burstSparks.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        radius: 1.5 + Math.random() * 2.5,
        color: ['#FFF8DC', '#FFE082', '#FFD700', '#FFFFFF'][Math.floor(Math.random() * 4)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  triggerBurst(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6.5;
      this.burstSparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        radius: 2 + Math.random() * 3.5,
        color: ['#FFFFFF', '#FFF59D', '#FFE082', '#FFCA28', '#FFB300'][Math.floor(Math.random() * 5)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.02,
        gravity: 0.12,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        isStar: Math.random() > 0.4
      });
    }
  }

  triggerShockwave(x, y) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: 130 + Math.random() * 30,
      alpha: 0.9,
      speed: 6.5
    });
  }

  // Draw 4-point star flare with radiant light spikes
  drawStarFlare(ctx, cx, cy, radius, alpha, rotation = 0) {
    if (alpha <= 0.01 || radius <= 1) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.globalCompositeOperation = 'screen';

    // 1. Central warm golden glow
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.6);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    coreGrad.addColorStop(0.3, 'rgba(255, 245, 160, 0.9)');
    coreGrad.addColorStop(0.7, 'rgba(255, 215, 0, 0.4)');
    coreGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Primary 4-pointed spikes (Horizontal & Vertical)
    const spikeLength = radius * 2.2;
    const spikeThickness = radius * 0.16;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    // Horizontal
    ctx.beginPath();
    ctx.moveTo(-spikeLength, 0);
    ctx.quadraticCurveTo(0, -spikeThickness, spikeLength, 0);
    ctx.quadraticCurveTo(0, spikeThickness, -spikeLength, 0);
    ctx.fill();

    // Vertical
    ctx.beginPath();
    ctx.moveTo(0, -spikeLength);
    ctx.quadraticCurveTo(-spikeThickness, 0, 0, spikeLength);
    ctx.quadraticCurveTo(spikeThickness, 0, 0, -spikeLength);
    ctx.fill();

    // 3. Diagonal secondary smaller spikes (45 degrees)
    ctx.rotate(Math.PI / 4);
    const diagLength = spikeLength * 0.55;
    const diagThickness = spikeThickness * 0.75;
    ctx.fillStyle = 'rgba(255, 230, 140, 0.75)';

    ctx.beginPath();
    ctx.moveTo(-diagLength, 0);
    ctx.quadraticCurveTo(0, -diagThickness, diagLength, 0);
    ctx.quadraticCurveTo(0, diagThickness, -diagLength, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -diagLength);
    ctx.quadraticCurveTo(-diagThickness, 0, 0, diagLength);
    ctx.quadraticCurveTo(diagThickness, 0, 0, -diagLength);
    ctx.fill();

    ctx.restore();
  }

  // Draw Dynamic Flowing Liquid Ribbon / Energy Swirl
  drawLiquidRibbon(ctx, time) {
    if (!this.enableRibbon) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Spline curve tracing around the bottle
    const pointsCount = 45;
    const ribbonPoints = [];
    const t = time * 0.0018;

    for (let i = 0; i <= pointsCount; i++) {
      const p = i / pointsCount;
      // Parametric swirl trajectory matching the poster's liquid path
      const baseX = this.width * (0.42 + 0.44 * Math.sin(p * Math.PI * 1.3 + 0.3));
      const baseY = this.height * (0.28 + p * 0.58);
      
      // Dynamic harmonic wave modulation
      const waveX = Math.sin(t * 2.5 + p * 8) * 14;
      const waveY = Math.cos(t * 1.8 + p * 6) * 8;

      ribbonPoints.push({
        x: baseX + waveX,
        y: baseY + waveY,
        width: Math.sin(p * Math.PI) * (18 + Math.sin(t * 3 + p * 4) * 6),
        alpha: Math.sin(p * Math.PI) * 0.45
      });
    }

    // Render fluid ribbon body
    for (let i = 0; i < ribbonPoints.length - 1; i++) {
      const p1 = ribbonPoints[i];
      const p2 = ribbonPoints[i + 1];

      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, `rgba(255, 240, 160, ${p1.alpha})`);
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${p1.alpha * 1.4})`);
      grad.addColorStop(1, `rgba(212, 175, 55, ${p2.alpha})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = p1.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Liquid edge highlight glints
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    for (let i = 0; i < ribbonPoints.length; i++) {
      const pt = ribbonPoints[i];
      const edgeX = pt.x + (Math.sin(i * 0.4 + t * 4) * pt.width * 0.5);
      const edgeY = pt.y;
      if (i === 0) ctx.moveTo(edgeX, edgeY);
      else ctx.lineTo(edgeX, edgeY);
    }
    ctx.stroke();

    ctx.restore();
  }

  // Draw Bokeh Light Spheres
  drawBokeh(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const b of this.bokehList) {
      if (this.isPlaying) {
        b.y -= b.speedY;
        b.phase += b.swayFreq;
        if (b.y < -b.radius * 2) {
          b.y = this.height + b.radius * 2;
          b.x = Math.random() * this.width;
        }
      }

      // Parallax offset on mouse move
      const parallaxX = this.mouse.isInside ? (this.mouse.x - this.width / 2) * 0.03 : 0;
      const parallaxY = this.mouse.isInside ? (this.mouse.y - this.height / 2) * 0.03 : 0;
      const currentX = b.x + Math.sin(b.phase) * b.swayAmp + parallaxX;
      const currentY = b.y + parallaxY;

      const grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, b.radius);
      grad.addColorStop(0, `hsla(${b.hue}, 100%, 85%, ${b.alpha * 0.7})`);
      grad.addColorStop(0.4, `hsla(${b.hue}, 90%, 65%, ${b.alpha * 0.35})`);
      grad.addColorStop(1, `hsla(${b.hue}, 80%, 50%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(currentX, currentY, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Rising Champagne Gold Dust
  drawDust(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const d of this.dustList) {
      if (this.isPlaying) {
        d.y -= d.speedY;
        d.x += d.speedX;
        d.phase += d.twinkleSpeed;

        if (d.y < -10) {
          d.y = this.height + 10;
          d.x = Math.random() * this.width;
        }
      }

      const twinkleAlpha = Math.max(0.05, d.alpha * (0.5 + 0.5 * Math.sin(d.phase)));
      ctx.fillStyle = `rgba(255, 235, 140, ${twinkleAlpha})`;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Explosive Sparks & Confetti
  drawBursts(ctx) {
    if (this.burstSparks.length === 0 && this.shockwaves.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 1. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      if (this.isPlaying) {
        sw.radius += sw.speed;
        sw.alpha -= 0.022;
      }

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `rgba(255, 223, 0, ${sw.alpha * 0.75})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer soft ring
      ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.88, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Sparkling particles
    for (let i = this.burstSparks.length - 1; i >= 0; i--) {
      const p = this.burstSparks[i];
      if (this.isPlaying) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) p.vy += p.gravity;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed || 0;
      }

      if (p.alpha <= 0) {
        this.burstSparks.splice(i, 1);
        continue;
      }

      if (p.isStar) {
        this.drawStarFlare(ctx, p.x, p.y, p.radius * 4, p.alpha, p.rotation);
      } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Draw Anchor Flares
  drawFixedFlares(ctx, time) {
    if (!this.enableFlares) return;

    for (const f of this.fixedFlares) {
      const posX = this.width * f.nx;
      const posY = this.height * f.ny;

      // Pulsing scale & opacity
      const pulse = Math.sin(time * 0.002 * f.freq + f.phase);
      const currentRadius = f.baseR * (0.8 + 0.35 * pulse) * f.scale;
      const currentAlpha = 0.5 + 0.5 * pulse;
      const rot = time * 0.0005 * f.freq + f.phase;

      this.drawStarFlare(ctx, posX, posY, currentRadius, currentAlpha, rot);
    }
  }

  // Update 3D card tilt with smooth Lerp interpolation
  updateCardTilt() {
    if (!this.enableTilt) {
      this.card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      return;
    }

    // Lerp smoothing (linear interpolation)
    const factor = 0.09;
    this.tilt.currentX += (this.tilt.targetX - this.tilt.currentX) * factor;
    this.tilt.currentY += (this.tilt.targetY - this.tilt.currentY) * factor;

    const scale = this.mouse.isInside ? 1.025 : 1.0;
    this.card.style.transform = `perspective(1200px) rotateX(${this.tilt.currentX.toFixed(2)}deg) rotateY(${this.tilt.currentY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
  }

  // Main Render Loop
  animate(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (this.isPlaying) {
      this.globalTime += delta;
    }

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Layer 1: Soft Floating Bokeh Orbs
    this.drawBokeh(this.ctx);

    // Layer 2: Rising Champagne Gold Dust
    this.drawDust(this.ctx);

    // Layer 3: Flowing Liquid Ribbon / Energy Swirl
    this.drawLiquidRibbon(this.ctx, this.globalTime);

    // Layer 4: Fixed Anchor Star Flares
    this.drawFixedFlares(this.ctx, this.globalTime);

    // Layer 5: Interactive Sparkles, Mouse Trails & Shockwaves
    this.drawBursts(this.ctx);

    // Update 3D Perspective Card Physics
    this.updateCardTilt();

    requestAnimationFrame(this.animate);
  }
}

// Initialize Application once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('animation-canvas');
  const card = document.getElementById('poster-card');

  if (!canvas || !card) return;

  const engine = new AnimationEngine(canvas, card);

  // Wire Hotspot Nodes
  document.querySelectorAll('.hotspot-node').forEach((node) => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      engine.triggerShockwave(x, y);
      engine.triggerBurst(x, y, 50);
      engine.sound.playChime(1.25);
    });
  });

  // Wire UI Controls
  const playBtn = document.getElementById('btn-play-pause');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      engine.isPlaying = !engine.isPlaying;
      playBtn.innerHTML = engine.isPlaying 
        ? `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> พักอนิเมชั่น` 
        : `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg> เล่นอนิเมชั่น`;
    });
  }

  const burstBtn = document.getElementById('btn-burst');
  if (burstBtn) {
    burstBtn.addEventListener('click', () => {
      const centerX = engine.width * 0.58;
      const centerY = engine.height * 0.55;
      engine.triggerShockwave(centerX, centerY);
      engine.triggerBurst(centerX, centerY, 70);
      engine.sound.playChime(1.3);
    });
  }

  const tiltToggle = document.getElementById('toggle-tilt');
  if (tiltToggle) {
    tiltToggle.addEventListener('change', (e) => {
      engine.enableTilt = e.target.checked;
    });
  }

  const ribbonToggle = document.getElementById('toggle-ribbon');
  if (ribbonToggle) {
    ribbonToggle.addEventListener('change', (e) => {
      engine.enableRibbon = e.target.checked;
    });
  }

  const flaresToggle = document.getElementById('toggle-flares');
  if (flaresToggle) {
    flaresToggle.addEventListener('change', (e) => {
      engine.enableFlares = e.target.checked;
    });
  }

  const soundToggle = document.getElementById('toggle-sound');
  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      engine.sound.enabled = e.target.checked;
      if (engine.sound.enabled) {
        engine.sound.init();
        engine.sound.playChime(1.0);
      }
    });
  }

  const densitySlider = document.getElementById('slider-density');
  if (densitySlider) {
    densitySlider.addEventListener('input', (e) => {
      engine.particleDensityMultiplier = parseFloat(e.target.value);
      engine.initParticles();
    });
  }

  // Preset Buttons
  const presetLuxe = document.getElementById('preset-luxe');
  if (presetLuxe) {
    presetLuxe.addEventListener('click', () => {
      engine.particleDensityMultiplier = 1.0;
      engine.enableRibbon = true;
      engine.enableFlares = true;
      engine.enableTilt = true;
      if (densitySlider) densitySlider.value = 1.0;
      if (ribbonToggle) ribbonToggle.checked = true;
      if (flaresToggle) flaresToggle.checked = true;
      if (tiltToggle) tiltToggle.checked = true;
      engine.initParticles();
      engine.triggerBurst(engine.width * 0.5, engine.height * 0.5, 50);
      engine.sound.playChime(1.0);
    });
  }

  const presetDiamond = document.getElementById('preset-diamond');
  if (presetDiamond) {
    presetDiamond.addEventListener('click', () => {
      engine.particleDensityMultiplier = 1.8;
      engine.enableRibbon = true;
      engine.enableFlares = true;
      if (densitySlider) densitySlider.value = 1.8;
      engine.initParticles();
      engine.triggerShockwave(engine.width * 0.65, engine.height * 0.32);
      engine.triggerBurst(engine.width * 0.65, engine.height * 0.32, 80);
      engine.sound.playChime(1.4);
    });
  }

  const presetMinimal = document.getElementById('preset-minimal');
  if (presetMinimal) {
    presetMinimal.addEventListener('click', () => {
      engine.particleDensityMultiplier = 0.35;
      engine.enableRibbon = false;
      if (densitySlider) densitySlider.value = 0.35;
      if (ribbonToggle) ribbonToggle.checked = false;
      engine.initParticles();
    });
  }

  // Expose to window for debugging or extensions
  window.ConfidentBoostEngine = engine;
});
