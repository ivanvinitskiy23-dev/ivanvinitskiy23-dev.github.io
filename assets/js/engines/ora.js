/* ============================================================================
   Qwiqly — ORA ACID · 3D Holographic Deck Stack Engine
   Tactile Deck Physics: Drag & Toss, Holographic Foil Sheen, Slide Scrubbing.
   ========================================================================== */
(function () {
  "use strict";

  var NS = (window.QW = window.QW || {});
  NS.engines = NS.engines || {};

  var DECKS = {
    1: { slug: "vance-turnaround", title: "Vance Turnaround", slides: 8, label: "01 / Vance" },
    2: { slug: "kinesthetic-lab", title: "Kinesthetic Lab", slides: 8, label: "02 / Kinesthetic" },
    3: { slug: "aura-kinetic", title: "AURA × Kinetic", slides: 8, label: "03 / AURA" }
  };

  function createOra(root) {
    var stack = root.querySelector("#ora-stack");
    var deckLabel = root.querySelector("#ora-label");
    var cards = root.querySelectorAll(".ora-card");
    if (!stack || !cards.length) return null;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    var active = 1;
    var running = false;
    var raf = 0;

    // Tilt parallax
    var tx = 0, ty = 0, cx = 0, cy = 0;

    // Drag tracking
    var isPointerDown = false;
    var isDragging = false;
    var startX = 0, startY = 0;
    var lastX = 0, lastTime = 0, velocityX = 0;
    var dragTarget = null;

    // Preload slides for instant latency-free scrubbing
    function preloadDecks() {
      try {
        for (var k in DECKS) {
          var d = DECKS[k];
          for (var s = 1; s <= d.slides; s++) {
            var im = new Image();
            im.src = "assets/work/" + d.slug + "/slide-0" + s + ".webp";
          }
        }
      } catch (e) {}
    }
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preloadDecks, { timeout: 2000 });
    } else {
      setTimeout(preloadDecks, 800);
    }

    function setActive(n) {
      if (!DECKS[n]) return;
      active = n;
      stack.dataset.active = String(n);
      if (deckLabel) deckLabel.textContent = DECKS[n].title;

      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var id = Number(c.dataset.card);
        var isFront = (id === n);
        c.setAttribute("aria-current", isFront ? "true" : "false");
        c.style.transform = "";
        c.classList.remove("is-dragging");

        // Reset slide image to slide 1 or cover
        var img = c.querySelector(".ora-slide-img");
        if (img && DECKS[id]) {
          img.src = "assets/work/" + DECKS[id].slug + "/cover-640.webp";
        }
        var progress = c.querySelector(".ora-scrub-progress");
        if (progress) progress.style.width = "12.5%";
        var scrubLabel = c.querySelector(".ora-scrub-label");
        if (scrubLabel) scrubLabel.textContent = "Slide 01 / 08";
      }
    }

    function nextDeck() {
      var next = active === 1 ? 2 : (active === 2 ? 3 : 1);
      setActive(next);
    }

    function prevDeck() {
      var prev = active === 1 ? 3 : (active === 2 ? 1 : 2);
      setActive(prev);
    }

    /* -------------------------------------------------------- slide scrub --- */
    function onCardPointerMove(e) {
      if (isDragging) return;
      var card = e.currentTarget;
      if (Number(card.dataset.card) !== active) return;

      var rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      // Slide scrub across 8 slides
      var deck = DECKS[active];
      if (deck) {
        var slideNum = Math.min(deck.slides, Math.max(1, Math.floor(px * deck.slides) + 1));
        var img = card.querySelector(".ora-slide-img");
        if (img) {
          var nextSrc = "assets/work/" + deck.slug + "/slide-0" + slideNum + ".webp";
          if (img.getAttribute("src") !== nextSrc) {
            img.src = nextSrc;
          }
        }
        var progress = card.querySelector(".ora-scrub-progress");
        if (progress) {
          progress.style.width = ((slideNum / deck.slides) * 100).toFixed(1) + "%";
        }
        var scrubLabel = card.querySelector(".ora-scrub-label");
        if (scrubLabel) {
          scrubLabel.textContent = "Slide 0" + slideNum + " / 0" + deck.slides;
        }
      }
    }

    function onCardPointerLeave(e) {
      // Nothing needed on leave
    }

    /* ---------------------------------------------------------- drag & toss --- */
    function onPointerDown(e) {
      // Don't drag if clicking the "OPEN ↗" button directly
      if (e.target.closest(".ora-card-open")) return;

      var card = e.target.closest(".ora-card");
      if (!card) return;

      var cardId = Number(card.dataset.card);
      if (cardId !== active) {
        // Clicking a background card directly brings it forward
        e.preventDefault();
        setActive(cardId);
        return;
      }

      isPointerDown = true;
      isDragging = false;
      dragTarget = card;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastTime = performance.now();
      velocityX = 0;

      window.addEventListener("pointermove", onWindowPointerMove, { passive: false });
      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerUp);
    }

    function onWindowPointerMove(e) {
      if (!isPointerDown || !dragTarget) return;

      var dx = e.clientX - startX;
      var dy = e.clientY - startY;

      var now = performance.now();
      var dt = Math.max(1, now - lastTime);
      velocityX = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastTime = now;

      if (!isDragging && Math.hypot(dx, dy) > 6) {
        isDragging = true;
        dragTarget.classList.add("is-dragging");
      }

      if (isDragging) {
        if (e.cancelable) e.preventDefault();
        var rx = -dy * 0.06;
        var ry = dx * 0.08;
        var rz = dx * 0.035;
        dragTarget.style.transform =
          "translate(-50%, -50%) translate3d(" +
          dx.toFixed(1) + "px, " + (dy * 0.35).toFixed(1) + "px, 95px) " +
          "rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg) rotateZ(" + rz.toFixed(1) + "deg)";
      }
    }

    function onWindowPointerUp(e) {
      if (!isPointerDown) return;
      isPointerDown = false;

      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);

      if (!dragTarget) return;

      var card = dragTarget;
      dragTarget = null;
      card.classList.remove("is-dragging");

      if (isDragging) {
        isDragging = false;
        var dx = e.clientX - startX;
        var vx = velocityX;

        // Fling / toss threshold: distance > 60px or flick speed > 0.35px/ms
        if (dx < -65 || vx < -0.38) {
          nextDeck();
        } else if (dx > 65 || vx > 0.38) {
          prevDeck();
        } else {
          // Spring back to center
          card.style.transform = "";
        }
      }
    }

    /* ------------------------------------------------------------- parallax --- */
    function onRootPointer(e) {
      if (e.pointerType === "touch" || reduce.matches) return;
      var r = root.getBoundingClientRect();
      if (!r.width) return;
      tx = ((e.clientX - r.left) / r.width - 0.5) * -7;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 5;
      if (!raf && running) raf = requestAnimationFrame(tick);
    }

    function tick() {
      raf = 0;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      stack.style.setProperty("--rx", cy.toFixed(2) + "deg");
      stack.style.setProperty("--ry", cx.toFixed(2) + "deg");
      if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) {
        raf = requestAnimationFrame(tick);
      }
    }

    /* ------------------------------------------------------------- keyboard --- */
    function onKey(e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextDeck();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevDeck();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var frontCard = stack.querySelector('.ora-card[aria-current="true"]');
        if (frontCard) {
          var deck = DECKS[active];
          var progress = frontCard.querySelector(".ora-scrub-progress");
          var curWidth = parseFloat((progress && progress.style.width) || "12.5");
          var curSlide = Math.round((curWidth / 100) * deck.slides);
          var nextSlide = e.key === "ArrowDown" ? curSlide + 1 : curSlide - 1;
          if (nextSlide < 1) nextSlide = deck.slides;
          if (nextSlide > deck.slides) nextSlide = 1;

          var img = frontCard.querySelector(".ora-slide-img");
          if (img) img.src = "assets/work/" + deck.slug + "/slide-0" + nextSlide + ".webp";
          if (progress) progress.style.width = ((nextSlide / deck.slides) * 100).toFixed(1) + "%";
          var scrubLabel = frontCard.querySelector(".ora-scrub-label");
          if (scrubLabel) scrubLabel.textContent = "Slide 0" + nextSlide + " / 0" + deck.slides;
        }
      }
    }

    /* --------------------------------------------------------------- events --- */
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      c.addEventListener("pointermove", onCardPointerMove, { passive: true });
      c.addEventListener("pointerleave", onCardPointerLeave, { passive: true });
    }

    stack.addEventListener("pointerdown", onPointerDown);
    stack.addEventListener("keydown", onKey);
    root.addEventListener("pointermove", onRootPointer, { passive: true });

    setActive(1);

    return {
      name: "ora",
      start: function () {
        running = true;
      },
      poster: function () {
        stack.style.setProperty("--rx", "0deg");
        stack.style.setProperty("--ry", "0deg");
        setActive(1);
      },
      stop: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
      resize: function () {},
      destroy: function () {
        this.stop();
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);
      }
    };
  }

  NS.engines.ora = createOra;
})();
