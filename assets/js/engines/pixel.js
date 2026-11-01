/**
 * Qwiqly — Pixel Gallery Cyberpunk Arcade Blaster (60-120 FPS Canvas Shmup)
 * Zero AI-slop: Authentic 16-bit pixel art, procedural neon cityscape,
 * dual-mode (Auto-pilot Screensaver / Manual Cursor Blaster),
 * WebAudio 8-bit retro sound synthesizer.
 */

(function () {
  'use strict';

  const NS = (window.QW = window.QW || {});
  NS.engines = NS.engines || {};

  function createPixel(root) {
    const canvas = root.querySelector('#px-game-canvas');
    const container = root.querySelector('.px-stage');
    if (!canvas || !container) return null;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HUD Elements
    const scoreEl = root.querySelector('#px-hud-score');
    const hiScoreEl = root.querySelector('#px-hud-hiscore');
    const chainEl = root.querySelector('#px-hud-chain');
    const modeEl = root.querySelector('#px-hud-mode');
    const sfxBtn = root.querySelector('#px-sfx-toggle');

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Audio Synth
    let audioCtx = null;
    let sfxEnabled = false;

    function initAudio() {
      if (!audioCtx) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (AudioCtor) audioCtx = new AudioCtor();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playLaserSfx() {
      if (!sfxEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }

    function playExplosionSfx() {
      if (!sfxEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } catch (e) {}
    }

    if (sfxBtn) {
      sfxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        initAudio();
        sfxEnabled = !sfxEnabled;
        sfxBtn.textContent = sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
        sfxBtn.classList.toggle('active', sfxEnabled);
      });
    }

    // High Score Persistence
    let score = 0;
    let hiScore = parseInt(localStorage.getItem('qwiqly_px_hiscore') || '12400', 10);
    let chainCount = 0;
    let chainTimer = 0;

    if (hiScoreEl) hiScoreEl.textContent = String(hiScore).padStart(5, '0');

    // Buildings for Full-Width Procedural City Skyline
    const buildings = [];
    let totalCityWidth = 0;

    function generateBuildings(w) {
      if (totalCityWidth >= w + 400 && buildings.length > 0) return;
      buildings.length = 0;
      let currX = 0;
      const targetWidth = Math.max(w * 1.6, 3600);
      // Brightened cyberpunk architecture palettes (distinct from deep space sky)
      const colors = ['#1a2436', '#141d2c', '#1e2b40', '#25354e', '#162030', '#202d42', '#283850'];
      const winColors = ['#2EE59A', '#2EF2FF', '#ffd447', '#ff6b35', '#b794f6', '#38bdf8'];
      let idx = 0;
      while (currX < targetWidth) {
        const bw = 55 + Math.floor(Math.random() * 45); // 55-100px width
        const bh = 110 + Math.floor(Math.random() * 200); // 110-310px height
        const b = {
          x: currX,
          w: bw,
          h: bh,
          color: colors[idx % colors.length],
          roofColor: 'rgba(46, 242, 255, 0.45)',
          windowColor: winColors[idx % winColors.length],
          antenna: Math.random() > 0.55 ? { h: 16 + Math.floor(Math.random() * 24), color: Math.random() > 0.5 ? '#ff3d71' : '#2EF2FF' } : null,
          windows: []
        };
        const rows = Math.floor(bh / 20);
        const cols = Math.floor((bw - 16) / 14);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() > 0.38) {
              b.windows.push({ r: r, c: c });
            }
          }
        }
        buildings.push(b);
        currX += bw + Math.floor(Math.random() * 6) - 1;
        idx++;
      }
      totalCityWidth = currX;
    }

    // Resize handling
    function resize() {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(240, Math.floor(rect.height));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false; // Authentic sharp pixel scaling
      generateBuildings(width);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Game State
    let isManual = false;
    let idleTimer = 0;
    let autoPilotTime = 0;
    let lastTime = performance.now();

    const player = {
      x: width * 0.5,
      y: height * (width < 768 ? 0.46 : 0.75),
      targetX: width * 0.5,
      targetY: height * (width < 768 ? 0.46 : 0.75),
      vx: 0,
      tilt: 0,
      width: 32,
      height: 32,
      fireTimer: 0,
      fireRate: 0.11, // ~9-10 shots per sec
      powerupLevel: 1,
      powerupTimer: 0
    };

    const bullets = [];
    const enemies = [];
    const particles = [];
    const textPopups = [];

    // Background Layers
    const stars = [];
    const NUM_STARS = 45;
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        speed: 0.5 + Math.random() * 1.5,
        size: Math.random() > 0.85 ? 2 : 1,
        color: Math.random() > 0.5 ? '#2EF2FF' : '#E8E0D4',
        flicker: Math.random() * Math.PI * 2
      });
    }

    // Initial buildings already created dynamically on resize

    // Mouse & Touch Controls
    function handlePointerMove(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        player.targetX = Math.max(20, Math.min(width - 20, x));
        player.targetY = Math.max(20, Math.min(height - 20, y));

        if (!isManual) {
          isManual = true;
          if (modeEl) {
            modeEl.textContent = 'MANUAL';
            modeEl.style.color = '#2EE59A';
          }
        }
        idleTimer = 0;
      }
    }

    container.addEventListener('mousemove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    container.addEventListener('mouseleave', () => {
      idleTimer = 4.0; // Return to autopilot sooner
    });

    // Enemy Spawning
    let spawnTimer = 0;
    const ENEMY_TYPES = [
      { name: 'AI SLOP', color: '#ff3366', points: 150, hp: 1, w: 26, h: 22, type: 'slop' },
      { name: 'LOREM', color: '#a855f7', points: 200, hp: 2, w: 28, h: 24, type: 'bug' },
      { name: 'CLICHÉ', color: '#eab308', points: 300, hp: 2, w: 32, h: 26, type: 'drone' },
      { name: 'POWERUP', color: '#2EE59A', points: 500, hp: 1, w: 24, h: 24, type: 'powerup' }
    ];

    function spawnEnemy() {
      const isPowerup = Math.random() < 0.12;
      const template = isPowerup ? ENEMY_TYPES[3] : ENEMY_TYPES[Math.floor(Math.random() * 3)];

      enemies.push({
        x: 30 + Math.random() * (width - 60),
        y: -30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.2 + Math.random() * 1.8,
        w: template.w,
        h: template.h,
        hp: template.hp,
        maxHp: template.hp,
        points: template.points || 150,
        color: template.color,
        name: template.name,
        type: template.type,
        flashTimer: 0,
        sineOffset: Math.random() * Math.PI * 2
      });
    }

    // Fire Player Laser
    function fireLaser() {
      playLaserSfx();

      if (player.powerupLevel > 1) {
        // Triple Spread
        bullets.push({ x: player.x - 12, y: player.y - 14, vx: -1.2, vy: -12, color: '#2EF2FF' });
        bullets.push({ x: player.x, y: player.y - 18, vx: 0, vy: -13, color: '#2EE59A' });
        bullets.push({ x: player.x + 12, y: player.y - 14, vx: 1.2, vy: -12, color: '#2EF2FF' });
      } else {
        // Dual Blaster
        bullets.push({ x: player.x - 8, y: player.y - 14, vx: 0, vy: -12, color: '#2EE59A' });
        bullets.push({ x: player.x + 8, y: player.y - 14, vx: 0, vy: -12, color: '#2EF2FF' });
      }
    }

    // Pixel Particle Explosion
    function createExplosion(x, y, color, count = 16) {
      playExplosionSfx();
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() > 0.6 ? 3 : 2,
          color: color,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.04
        });
      }
    }

    function addScore(pts, x, y, label) {
      chainCount++;
      chainTimer = 2.5; // seconds to keep chain

      const mult = Math.min(8, 1 + Math.floor(chainCount / 4));
      const total = pts * mult;
      score += total;

      if (score > hiScore) {
        hiScore = score;
        localStorage.setItem('qwiqly_px_hiscore', String(hiScore));
        if (hiScoreEl) hiScoreEl.textContent = String(hiScore).padStart(5, '0');
      }

      if (scoreEl) scoreEl.textContent = String(score).padStart(5, '0');
      if (chainEl) chainEl.textContent = `x${mult}`;

      textPopups.push({
        x: x,
        y: y,
        text: label ? `${label} +${total}` : `+${total}`,
        color: mult > 1 ? '#2EF2FF' : '#ffffff',
        alpha: 1,
        vy: -1.2
      });
    }

    // MAIN GAME LOOP
    function update(dt) {
      autoPilotTime += dt;
      idleTimer += dt;

      // Autopilot return if inactive for 4 seconds
      if (isManual && idleTimer > 4.5) {
        isManual = false;
        if (modeEl) {
          modeEl.textContent = 'AUTOPILOT';
          modeEl.style.color = 'rgba(232, 224, 212, 0.6)';
        }
      }

      if (!isManual) {
        // Smooth figure-8 infinity glide
        const compact = width < 768;
        const cx = width * 0.5;
        const cy = height * (compact ? 0.44 : 0.72);
        player.targetX = cx + Math.sin(autoPilotTime * 1.4) * (width * (compact ? 0.24 : 0.32));
        player.targetY = cy + Math.sin(autoPilotTime * 2.8) * 35;
      }

      // Player Movement LERP
      const prevX = player.x;
      player.x += (player.targetX - player.x) * 0.14;
      player.y += (player.targetY - player.y) * 0.14;
      player.vx = player.x - prevX;
      player.tilt = Math.max(-0.4, Math.min(0.4, player.vx * 0.04));

      // Player Continuous Auto-fire
      player.fireTimer += dt;
      if (player.fireTimer >= player.fireRate) {
        player.fireTimer = 0;
        fireLaser();
      }

      // Power-up Timer
      if (player.powerupLevel > 1) {
        player.powerupTimer -= dt;
        if (player.powerupTimer <= 0) {
          player.powerupLevel = 1;
        }
      }

      // Chain Multiplier Decay
      if (chainCount > 0) {
        chainTimer -= dt;
        if (chainTimer <= 0) {
          chainCount = 0;
          if (chainEl) chainEl.textContent = 'x1';
        }
      }

      // Update Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.y < -20 || b.x < 0 || b.x > width) {
          bullets.splice(i, 1);
        }
      }

      // Spawn Enemies
      spawnTimer += dt;
      const currentSpawnRate = isManual ? 0.7 : 1.2;
      if (spawnTimer >= currentSpawnRate) {
        spawnTimer = 0;
        spawnEnemy();
      }

      // Update Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.vy;
        e.x += e.vx + Math.sin(autoPilotTime * 3 + e.sineOffset) * 0.8;
        if (e.flashTimer > 0) e.flashTimer -= dt;

        // Check Collision with Bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (Math.abs(b.x - e.x) < e.w * 0.6 && Math.abs(b.y - e.y) < e.h * 0.6) {
            // Hit!
            bullets.splice(j, 1);
            e.hp--;
            e.flashTimer = 0.08;

            if (e.hp <= 0) {
              // Destroyed
              createExplosion(e.x, e.y, e.color, e.type === 'powerup' ? 24 : 16);

              if (e.type === 'powerup') {
                player.powerupLevel = 2;
                player.powerupTimer = 8.0; // 8 seconds of triple laser
                addScore(e.points, e.x, e.y, 'TRIPLE LASER!');
              } else {
                addScore(e.points, e.x, e.y, e.name);
              }

              enemies.splice(i, 1);
              break;
            }
          }
        }

        // Out of screen
        if (e.y > height + 40) {
          enemies.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // Update Text Popups
      for (let i = textPopups.length - 1; i >= 0; i--) {
        const tp = textPopups[i];
        tp.y += tp.vy;
        tp.alpha -= dt * 1.1;
        if (tp.alpha <= 0) {
          textPopups.splice(i, 1);
        }
      }
    }

    // DRAW FRAME
    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Cyberpunk Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#06070a');
      skyGrad.addColorStop(0.6, '#0d111a');
      skyGrad.addColorStop(1, '#161c28');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y += s.speed * 0.4;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
      }

      // 3. City Skyline Silhouette (Bottom) — seamless full-width coverage
      const baseCityY = height - 120;
      const parallax = (player.x * 0.05);
      const loopW = totalCityWidth || (width + 400);
      for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        let bx = (b.x - parallax) % loopW;
        if (bx < -b.w) bx += loopW;
        if (bx > width + 60 || bx + b.w < -60) continue;

        const by = height - b.h * 0.62;
        ctx.fillStyle = b.color;
        ctx.fillRect(Math.floor(bx), Math.floor(by), Math.floor(b.w), Math.floor(b.h));

        // Illuminated rooftop neon edge
        ctx.fillStyle = b.roofColor;
        ctx.fillRect(Math.floor(bx), Math.floor(by), Math.floor(b.w), 2);

        // Rooftop antenna with blinking beacon tip
        if (b.antenna) {
          const antX = Math.floor(bx + b.w * 0.5);
          ctx.fillStyle = 'rgba(215, 230, 245, 0.35)';
          ctx.fillRect(antX, Math.floor(by - b.antenna.h), 1, Math.floor(b.antenna.h));
          ctx.fillStyle = ((autoPilotTime * 3 + i) % 2 > 1) ? b.antenna.color : 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(antX - 1, Math.floor(by - b.antenna.h - 1), 3, 3);
        }

        // Windows
        ctx.fillStyle = b.windowColor;
        for (let w = 0; w < b.windows.length; w++) {
          const win = b.windows[w];
          const wx = bx + 8 + win.c * 14;
          const wy = by + 12 + win.r * 14;
          if (wy < height - 8) {
            ctx.fillRect(Math.floor(wx), Math.floor(wy), 4, 6);
          }
        }
      }

      // 4. Neon Ground Grid
      ctx.strokeStyle = 'rgba(61, 139, 140, 0.15)';
      ctx.lineWidth = 1;
      const gridOffset = (autoPilotTime * 30) % 24;
      for (let y = baseCityY + 30; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 5. Bullets
      for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        ctx.fillStyle = b.color;
        ctx.fillRect(Math.floor(b.x - 2), Math.floor(b.y - 6), 4, 12);

        // Subtle glow core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(b.x - 1), Math.floor(b.y - 4), 2, 8);
      }

      // 6. Enemies
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        ctx.save();
        ctx.translate(Math.floor(e.x), Math.floor(e.y));

        if (e.flashTimer > 0) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = e.color;
        }

        if (e.type === 'powerup') {
          // Floating glowing floppy disk / chip
          ctx.fillRect(-10, -10, 20, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-6, -8, 12, 6);
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(-4, 2, 8, 6);
        } else if (e.type === 'slop') {
          // Glitch Cube with warning cross
          ctx.fillRect(-12, -10, 24, 20);
          ctx.fillStyle = '#111';
          ctx.fillRect(-8, -6, 16, 12);
          ctx.fillStyle = e.flashTimer > 0 ? '#fff' : e.color;
          ctx.fillRect(-2, -4, 4, 8);
          ctx.fillRect(-5, -2, 10, 4);
        } else {
          // Cyber Bug Dart
          ctx.beginPath();
          ctx.moveTo(0, 10);
          ctx.lineTo(12, -8);
          ctx.lineTo(-12, -8);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-3, -2, 6, 4);
        }

        // Tiny pixel enemy label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(e.name, 0, -14);

        ctx.restore();
      }

      // 7. Player Ship ("Unit Q" Cyber Fighter)
      ctx.save();
      ctx.translate(Math.floor(player.x), Math.floor(player.y));
      ctx.rotate(player.tilt);

      // Jet Thruster Flame
      const flameHeight = 8 + Math.sin(autoPilotTime * 30) * 5;
      ctx.fillStyle = '#2EF2FF';
      ctx.fillRect(-4, 12, 8, flameHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, 12, 4, flameHeight * 0.6);

      // Main Ship Chassis (Pixel Triangle)
      ctx.fillStyle = '#121620';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(16, 12);
      ctx.lineTo(-16, 12);
      ctx.closePath();
      ctx.fill();

      // Wing Highlights (Emerald / Cream)
      ctx.fillStyle = '#E8E0D4';
      ctx.fillRect(-14, 6, 4, 8);
      ctx.fillRect(10, 6, 4, 8);

      // Wingtips
      ctx.fillStyle = '#2EE59A';
      ctx.fillRect(-16, 10, 2, 4);
      ctx.fillRect(14, 10, 2, 4);

      // Center Cockpit Glow
      ctx.fillStyle = '#2EF2FF';
      ctx.fillRect(-3, -6, 6, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -4, 2, 4);

      // Power-up Shield Aura
      if (player.powerupLevel > 1) {
        ctx.strokeStyle = `rgba(46, 229, 154, ${0.4 + Math.sin(autoPilotTime * 15) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // 8. Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1.0;

      // 9. Floating Score Text Popups
      ctx.font = 'bold 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      for (let i = 0; i < textPopups.length; i++) {
        const tp = textPopups[i];
        ctx.fillStyle = tp.color;
        ctx.globalAlpha = Math.max(0, tp.alpha);
        ctx.fillText(tp.text, Math.floor(tp.x), Math.floor(tp.y));
      }
      ctx.globalAlpha = 1.0;
    }

    // Animation loop
    let rafId = 0;
    let running = false;
    function loop(now) {
      rafId = requestAnimationFrame(loop);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const rect = container.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        update(dt);
        render();
      }
    }
  
    // Dock Icons Interaction
    const dockItems = root.querySelectorAll('.px-dock-item');
    dockItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (!sfxEnabled || !audioCtx) return;
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, audioCtx.currentTime);
          osc.frequency.setValueAtTime(680, audioCtx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.08);
        } catch (e) {}
      });
    });

    resize();

    return {
      name: 'pixel',
      start: function () {
        if (reduce.matches) { this.poster(); return; }
        if (running) return;
        running = true;
        resize();
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      },
      // Reduced motion: a single dressed frame — ship, skyline, star field.
      poster: function () {
        resize();
        player.x = width * 0.5;
        player.y = height * (width < 768 ? 0.46 : 0.66);
        player.targetX = player.x;
        player.targetY = player.y;
        render();
        if (modeEl) { modeEl.textContent = 'STILL'; modeEl.style.color = 'rgba(232, 224, 212, 0.6)'; }
      },
      stop: function () {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        if (audioCtx && audioCtx.state === 'running') {
          try { audioCtx.suspend(); } catch (e) {}
        }
      },
      resize: resize,
      destroy: function () {
        this.stop();
        window.removeEventListener('resize', resize);
      }
    };
  }

  NS.engines.pixel = createPixel;
})();
