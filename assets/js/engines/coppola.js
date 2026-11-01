/* ============================================================================
   Qwiqly — COPPOLA NOIR · windshield
   Condensation mask, refractive droplets, gravity streaks, finger wipe,
   mechanical wiper sweep, synthesized squeak. DPR capped, half-res fog.
   ========================================================================== */
(function () {
  "use strict";

  var NS = (window.QW = window.QW || {});
  NS.engines = NS.engines || {};

  function createCoppola(root) {
    var canvas = root.querySelector("#cp-rain-canvas");
    var wiperBtn = root.querySelector("#cp-wiper-btn");
    var hint = root.querySelector("#cp-wiper-hint");
    if (!canvas) return null;

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return null;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    var width = 0, height = 0, dpr = 1;
    var MASK_SCALE = 0.6;

    var maskCanvas = document.createElement("canvas");
    var maskCtx = maskCanvas.getContext("2d");

    /* ---------------------------------------------------------------- audio --- */
    var audio = null;

    function initAudio() {
      if (audio) return audio;
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      try { audio = new Ctor(); } catch (e) { audio = null; }
      return audio;
    }

    function squeak() {
      if (!audio || audio.state !== "running") return;
      try {
        var t0 = audio.currentTime;
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        var filter = audio.createBiquadFilter();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.exponentialRampToValueAtTime(520, t0 + 0.22);
        osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.75);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1100, t0);
        filter.Q.value = 1.4;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.045, t0 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.78);
        osc.connect(filter); filter.connect(gain); gain.connect(audio.destination);
        osc.start(t0); osc.stop(t0 + 0.8);
      } catch (e) {}
    }

    /* ------------------------------------------------------------------ fog --- */
    var noise = null;
    function makeNoise() {
      var n = document.createElement("canvas");
      n.width = 96; n.height = 96;
      var nc = n.getContext("2d");
      var img = nc.createImageData(96, 96);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = 180 + Math.random() * 75;
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      nc.putImageData(img, 0, 0);
      return n;
    }

    /* ---------------------------------------------------------------- size --- */
    function resize() {
      var r = root.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(320, Math.round(r.width));
      height = Math.max(320, Math.round(r.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;

      maskCanvas.width = Math.max(64, Math.round(canvas.width * MASK_SCALE));
      maskCanvas.height = Math.max(64, Math.round(canvas.height * MASK_SCALE));
      resetMask();
      seedDrops();
    }

    function maskTransform() {
      var k = (canvas.width / Math.max(1, width)) * MASK_SCALE;
      return k;
    }

    function resetMask() {
      var k = maskTransform();
      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.globalCompositeOperation = "source-over";
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.setTransform(k, 0, 0, k, 0, 0);

      // open a soft window over the headline so the first paint is legible
      maskCtx.globalCompositeOperation = "destination-out";
      var cxp = width * 0.5, cyp = height * 0.46;
      var g = maskCtx.createRadialGradient(cxp, cyp, 10, cxp, cyp, Math.max(width * 0.42, height * 0.5));
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.55, "rgba(0,0,0,0.92)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      maskCtx.fillStyle = g;
      maskCtx.beginPath();
      maskCtx.ellipse(cxp, cyp, width * 0.52, height * 0.34, 0, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.globalCompositeOperation = "source-over";
    }

    /* -------------------------------------------------------------- drops --- */
    var statics = [];
    var drops = [];
    var MAX_RUNNING = 12;

    function seedDrops() {
      statics.length = 0;
      drops.length = 0;
    }

    function spawnDrop() {
      // Disabled: user requested pure steamy condensation without droplet clutter
      return;
    }

    /* --------------------------------------------------------------- wipe --- */
    var wiping = false;
    var lastX = -1, lastY = -1;
    var idle = 0;

    function wipeAt(x, y) {
      idle = 0;
      if (hint) hint.style.opacity = "0";
      maskCtx.save();
      maskCtx.globalCompositeOperation = "destination-out";
      var radius = width < 640 ? 30 : 42;
      var g = maskCtx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.62, "rgba(0,0,0,0.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      maskCtx.fillStyle = g;
      maskCtx.beginPath();
      maskCtx.arc(x, y, radius, 0, Math.PI * 2);
      maskCtx.fill();
      if (lastX >= 0) {
        maskCtx.lineWidth = radius * 1.55;
        maskCtx.lineCap = "round";
        maskCtx.strokeStyle = "rgba(0,0,0,0.85)";
        maskCtx.beginPath();
        maskCtx.moveTo(lastX, lastY);
        maskCtx.lineTo(x, y);
        maskCtx.stroke();
      }
      maskCtx.restore();
      lastX = x; lastY = y;
    }

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      wipeAt(e.clientX - r.left, e.clientY - r.top);
    }
    function onTouch(e) {
      if (!e.touches.length) return;
      var r = canvas.getBoundingClientRect();
      wipeAt(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
    }
    function onLeave() { lastX = -1; lastY = -1; }

    canvas.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchend", onLeave);

    /* -------------------------------------------------------------- wiper --- */
    var sweeping = false;
    var angle = -Math.PI * 0.46;
    var phase = 0;
    var autoTimer = 0;

    function sweep(silent) {
      if (sweeping) return;
      if (!silent) {
        initAudio();
        if (audio && audio.state === "suspended") audio.resume();
        setTimeout(squeak, 20);
      }
      sweeping = true;
      phase = 1;
      angle = -Math.PI * 0.46;
      if (hint) hint.style.opacity = "0";
    }

    if (wiperBtn) {
      wiperBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        sweep();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (!running) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "w" || e.key === "W") { e.preventDefault(); sweep(); }
    });

    /* --------------------------------------------------------------- loop --- */
    var last = 0;

    function update(dt) {
      idle += dt;
      autoTimer += dt;
      if (autoTimer > 34 && !sweeping && !reduce.matches) {
        autoTimer = 0;
        sweep(true);
      }

      if (idle > 5 && !sweeping) {
        maskCtx.save();
        maskCtx.globalCompositeOperation = "source-over";
        maskCtx.fillStyle = "rgba(255,255,255,0.006)";
        maskCtx.fillRect(0, 0, width, height);
        maskCtx.restore();
      }

      if (sweeping) {
        var px = width * 0.5;
        var py = height + 90;
        var len = Math.max(width, height) * 1.5;
        var speed = phase === 1 ? 3.6 : 3.2;
        angle += (phase === 1 ? 1 : -1) * dt * speed;

        maskCtx.save();
        maskCtx.globalCompositeOperation = "destination-out";
        maskCtx.lineWidth = 96;
        maskCtx.lineCap = "round";
        maskCtx.strokeStyle = "#000";
        maskCtx.beginPath();
        maskCtx.moveTo(px, py);
        maskCtx.lineTo(px + Math.sin(angle) * len, py - Math.cos(angle) * len);
        maskCtx.stroke();
        maskCtx.restore();

        if (phase === 1 && angle >= Math.PI * 0.46) phase = 2;
        else if (phase === 2 && angle <= -Math.PI * 0.46) {
          sweeping = false;
          phase = 0;
          drops.length = 0;
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // condensation
      ctx.save();
      ctx.fillStyle = "rgba(10, 12, 16, 0.66)";
      ctx.fillRect(0, 0, width, height);

      var glare = ctx.createRadialGradient(width * 0.5, height * 0.58, 10, width * 0.5, height * 0.58, width * 0.75);
      glare.addColorStop(0, "rgba(232, 178, 90, 0.14)");
      glare.addColorStop(0.45, "rgba(31, 168, 160, 0.07)");
      glare.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glare;
      ctx.fillRect(0, 0, width, height);

      if (noise) {
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = ctx.createPattern(noise, "repeat");
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }

      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0, width, height);
      ctx.restore();

      // wiper arm
      if (sweeping) {
        var px = width * 0.5, py = height + 90;
        var len = Math.max(width, height) * 1.5;
        var tipX = px + Math.sin(angle) * len;
        var tipY = py - Math.cos(angle) * len;
        ctx.save();
        ctx.strokeStyle = "rgba(8,10,12,0.85)";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tipX, tipY); ctx.stroke();
        ctx.strokeStyle = "rgba(150,160,172,0.55)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tipX, tipY); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tipX, tipY); ctx.stroke();
        ctx.restore();
      }
    }

    function tick(now) {
      if (!running) return;
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      update(dt);
      render();
      raf = requestAnimationFrame(tick);
    }

    var raf = 0;
    var running = false;

    resize();
    noise = makeNoise();

    window.addEventListener("resize", resize);

    return {
      name: "coppola",
      start: function () {
        if (reduce.matches) { this.poster(); return; }
        running = true;
        last = performance.now();
        resize();
        render();
        raf = requestAnimationFrame(tick);
      },
      // Reduced motion: one frosted, rain-streaked frame.
      poster: function () {
        resize();
        seedDrops();
        render();
      },
      stop: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (audio && audio.state === "running") { try { audio.suspend(); } catch (e) {} }
      },
      resize: resize,
      destroy: function () {
        this.stop();
        window.removeEventListener("resize", resize);
      }
    };
  }

  NS.engines.coppola = createCoppola;
})();
