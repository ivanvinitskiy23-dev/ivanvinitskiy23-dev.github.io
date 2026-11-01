/* ============================================================================
   Qwiqly — ATOMIC CHROME — 120 FPS Buttery-Smooth Scroll-Scrubbed Engine
   461 WebP frames, zero-eviction instant RAM cache, sub-pixel physical LERP
   inertia (0.11 factor), cover-fit canvas rendering, instant seek with zero lag.
   ========================================================================== */
(function () {
  "use strict";

  var NS = (window.QW = window.QW || {});
  NS.engines = NS.engines || {};

  var TOTAL = 461;
  var BASE = "assets/themes/atomic/f_";

  function url(i) {
    var n = String(i + 1);
    while (n.length < 4) n = "0" + n;
    return BASE + n + ".webp";
  }

  function createAtomic(root) {
    var stage = root.querySelector(".at-stage");
    var canvas = root.querySelector("#at-canvas");
    var fallback = root.querySelector("#at-fallback");
    var frameEl = root.querySelector("#at-frame");
    var fillEl = root.querySelector("#at-scrub-fill");
    var valEl = root.querySelector("#at-scrub-val");
    var spy = root.querySelectorAll(".at-spy-dot");

    if (!stage || !canvas) return null;
    var ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return null;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 120 FPS Instant Preload Array (No eviction thrashing, zero network lag on scrub)
    var frames = new Array(TOTAL);
    var loadedCount = 0;
    var broken = false;

    var cw = 0, ch = 0, dpr = 1;
    var target = 0, current = 0;
    var raf = 0;
    var running = false;
    var lastDrawn = -1;
    var shown = false;

    // Load Frame 1 immediately for instant paint
    var f1 = new Image();
    f1.src = url(0);
    f1.onload = function () {
      frames[0] = f1;
      loadedCount++;
      if (!shown) {
        shown = true;
        if (fallback) fallback.classList.add("is-off");
      }
      drawFrame(0);
    };
    f1.onerror = function () {
      broken = true;
      if (fallback) fallback.classList.remove("is-off");
    };

    // Preload remaining frames in smooth non-blocking queue
    function preloadFrames() {
      for (var i = 1; i < TOTAL; i++) {
        (function (idx) {
          var img = new Image();
          img.src = url(idx);
          img.onload = function () {
            frames[idx] = img;
            loadedCount++;
            if (!shown && idx === Math.round(current * (TOTAL - 1))) {
              shown = true;
              if (fallback) fallback.classList.add("is-off");
              drawFrame(idx);
            }
          };
        })(i);
      }
    }

    // Trigger preload on idle or immediately
    if (window.requestIdleCallback) {
      window.requestIdleCallback(preloadFrames, { timeout: 800 });
    } else {
      setTimeout(preloadFrames, 100);
    }

    // Canvas resize with crisp pixel backing
    function resize() {
      var r = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(320, Math.round(r.width));
      ch = Math.max(320, Math.round(r.height));
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = cw + "px";
      canvas.style.height = ch + "px";
      lastDrawn = -1;
      requestDraw();
    }

    // Draw frame with cover-fit and sub-frame nearest fallback
    function drawFrame(idx) {
      if (broken) return;
      var img = frames[idx];

      // If exact frame is still downloading, find nearest loaded frame without stutter
      if (!img || !img.complete) {
        for (var d = 1; d <= 25; d++) {
          if (idx - d >= 0 && frames[idx - d] && frames[idx - d].complete) {
            img = frames[idx - d];
            break;
          } else if (idx + d < TOTAL && frames[idx + d] && frames[idx + d].complete) {
            img = frames[idx + d];
            break;
          }
        }
      }

      if (!img || !img.complete) return;

      var iw = img.naturalWidth || 1920;
      var ih = img.naturalHeight || 1080;

      // Responsive scale: narrow slightly on desktop (0.91) so shoulders and text breathe
      var isMobile = canvas.width < 768 * dpr;
      var factor = isMobile ? 1.0 : 0.91;
      var baseScale = Math.max(canvas.width / iw, canvas.height / ih);
      var scale = baseScale * factor;
      var dw = iw * scale;
      var dh = ih * scale;
      var dx = (canvas.width - dw) / 2 + (isMobile ? 0 : canvas.width * 0.035);

      // Vertical placement: lift girl UP so visible hair bangs meet the HUD line with zero gap
      var barElem = root.querySelector(".at-bar");
      var barOffset = isMobile ? 65 : 95;
      if (barElem) {
        var sRect = stage.getBoundingClientRect();
        var bRect = barElem.getBoundingClientRect();
        if (sRect && bRect) {
          barOffset = bRect.bottom - sRect.top;
        }
      }
      // Visible bangs in the 1080p source image are at y ≈ 70px.
      // Anchoring to y=70 brings the hair arc right up flush to the HUD line.
      var dy = Math.round((barOffset * dpr) - (70 * scale));

      ctx.fillStyle = "#05070b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      try {
        ctx.drawImage(img, dx, dy, dw, dh);
      } catch (e) {}
    }

    // High-Refresh Inertial Render Loop
    function requestDraw() {
      if (!running || raf) return;
      raf = requestAnimationFrame(tick);
    }

    function tick() {
      raf = 0;
      if (!running) return;

      // Silky-smooth physical LERP inertia (factor 0.11)
      var diff = target - current;
      current += diff * 0.11;
      if (Math.abs(diff) < 0.0002) {
        current = target;
      }

      var idx = Math.min(TOTAL - 1, Math.max(0, Math.round(current * (TOTAL - 1))));
      if (idx !== lastDrawn) {
        drawFrame(idx);
        lastDrawn = idx;
        if (frameEl) {
          var n = String(idx + 1);
          while (n.length < 4) n = "0" + n;
          frameEl.textContent = n;
        }
      }

      // Subtle 3D camera depth scale matching the original approved feel
      canvas.style.transform =
        "translate3d(0," + (current * 14).toFixed(1) + "px,0) scale(" + (1 + current * 0.025).toFixed(3) + ")";

      if (Math.abs(target - current) > 0.0003) {
        raf = requestAnimationFrame(tick);
      }
    }

    // Scroll Handler
    function onScroll() {
      var rect = root.getBoundingClientRect();
      var travel = root.offsetHeight - window.innerHeight;
      var p = travel > 0 ? -rect.top / travel : 0;
      target = Math.max(0, Math.min(1, p));

      if (fillEl) fillEl.style.width = (target * 100).toFixed(1) + "%";
      if (valEl) valEl.textContent = Math.round(target * 100) + "%";

      if (!raf && running) {
        requestDraw();
      }
    }

    function updateSpy() {
      if (!spy.length) return;
      var best = null, bestDist = Infinity;
      for (var i = 0; i < spy.length; i++) {
        var id = spy[i].getAttribute("data-section");
        var el = id === "hero-atomic" ? root : document.getElementById(id);
        if (!el) continue;
        var d = Math.abs(el.getBoundingClientRect().top - window.innerHeight * 0.42);
        if (d < bestDist) {
          bestDist = d;
          best = spy[i];
        }
      }
      for (var j = 0; j < spy.length; j++) {
        spy[j].classList.toggle("is-on", spy[j] === best);
      }
    }

    function onScrollFrame() {
      onScroll();
      updateSpy();
    }

    window.addEventListener("scroll", onScrollFrame, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    root.querySelectorAll(".at-spy-dot").forEach(function (dot) {
      dot.addEventListener("click", function (e) {
        var href = dot.getAttribute("href");
        var targetEl = href && href.charAt(0) === "#" ? document.querySelector(href) : null;
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
        }
      });
    });

    return {
      name: "atomic",
      start: function () {
        if (reduce.matches) {
          this.poster();
          return;
        }
        running = true;
        resize();
        onScroll();
        requestDraw();
      },
      poster: function () {
        resize();
        onScroll();
        current = target;
        drawFrame(Math.round(target * (TOTAL - 1)));
        if (fallback) fallback.classList.add("is-off");
      },
      stop: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
      resize: resize,
      destroy: function () {
        this.stop();
        window.removeEventListener("scroll", onScrollFrame);
        window.removeEventListener("resize", resize);
      }
    };
  }

  NS.engines.atomic = createAtomic;
})();
