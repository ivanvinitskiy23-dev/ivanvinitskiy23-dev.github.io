/* Qwiqly v2 — deck viewer behaviour.
 *
 * Each deck is a static page at work/<slug>.html. This script only swaps the
 * slide image, keeps ?slide= and ?theme= in the URL, and wires the controls.
 */
(function () {
  "use strict";

  var BASE = window.QW_BASE || "../";
  var SLUG = window.QW_DECK_SLUG;
  var THEMES = ["emerald", "ora", "pixel", "atomic", "onion", "coppola"];
  var THEME_BG = {
    emerald: "#060907",
    ora: "#0b0b09",
    pixel: "#0a0c12",
    atomic: "#080b10",
    onion: "#f3f2ed",
    coppola: "#0b0907"
  };
  var THEME_KEY = "qw-theme";

  var decks = Array.isArray(window.QW_DECKS) ? window.QW_DECKS : [];
  var deckIndex = -1;
  for (var d = 0; d < decks.length; d++) {
    if (decks[d].slug === SLUG) { deckIndex = d; break; }
  }
  var deck = decks[deckIndex];
  if (!deck) return;

  var total = deck.slides;
  var shot = document.getElementById("shot");
  var shotAvif = document.getElementById("shotAvif");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var countEl = document.getElementById("count");
  var bar = document.getElementById("bar");
  var thumbsEl = document.getElementById("thumbs");
  var nextDeckEl = document.getElementById("nextDeck");
  var backLink = document.getElementById("backLink");
  var homeLink = document.getElementById("homeLink");
  var fsBtn = document.getElementById("fs");
  var zoomBtn = document.getElementById("zoom");
  var stage = document.getElementById("stage");
  var stageInner = stage ? stage.querySelector(".v-stage") : null;
  var toastEl = document.getElementById("vToast");
  if (!shot) return;

  var theme = window.__QW_THEME;
  if (THEMES.indexOf(theme) < 0) theme = document.documentElement.dataset.theme || "emerald";
  if (THEMES.indexOf(theme) < 0) theme = "emerald";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var index = 1;
  var toastTimer = 0;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function slideSrc(n, ext) {
    return BASE + "assets/work/" + deck.slug + "/slide-" + pad(n) + "." + (ext || "webp");
  }

  var avifSupported = (function () {
    try {
      var c = document.createElement("canvas");
      c.width = 1;
      c.height = 1;
      return c.toDataURL("image/avif").indexOf("image/avif") > -1;
    } catch (e) {
      return false;
    }
  })();

  function themeQuery() {
    return theme === "emerald" ? "" : "&theme=" + theme;
  }

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 1500);
  }

  function syncTheme() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_BG[theme] || "#060907");
    if (homeLink) homeLink.setAttribute("href", BASE + "index.html" + (theme === "emerald" ? "" : "?theme=" + theme));
    if (backLink) backLink.setAttribute("href", BASE + "index.html?theme=" + theme + "#work");
    var kind = document.querySelector(".v-kind");
    if (kind) kind.style.setProperty("--deck", deck.accent || "");
  }

  function syncNextDeck() {
    if (!nextDeckEl || !decks.length) return;
    var next = decks[(deckIndex + 1) % decks.length];
    nextDeckEl.setAttribute("href", BASE + "work/" + next.slug + ".html" + (theme === "emerald" ? "" : "?theme=" + theme));
    var label = nextDeckEl.querySelector("b");
    if (label) label.textContent = next.title;
    nextDeckEl.setAttribute("aria-label", "Next deck: " + next.title);
  }

  function syncUrl() {
    if (location.protocol === "file:") return;
    try {
      var url = location.pathname + "?slide=" + index + themeQuery() + location.hash;
      history.replaceState(null, "", url);
    } catch (e) {}
  }

  var preloaded = {};
  function preload(n) {
    if (n < 1 || n > total || preloaded[n]) return;
    preloaded[n] = true;
    var im = new Image();
    im.decoding = "async";
    im.src = avifSupported ? slideSrc(n, "avif") : slideSrc(n);
  }

  function paint(n) {
    var src = slideSrc(n);
    if (shot.getAttribute("src") !== src) {
      if (shotAvif) shotAvif.setAttribute("srcset", slideSrc(n, "avif"));
      shot.classList.add("is-loading");
      shot.setAttribute("src", src);
      var done = function () { shot.classList.remove("is-loading"); };
      if (shot.complete) done();
      else shot.addEventListener("load", done, { once: true });
    }
    shot.setAttribute("alt", deck.title + " — slide " + n + " of " + total);
    if (stageInner && stage.classList.contains("is-zoom")) {
      stageInner.scrollTop = 0;
      stageInner.scrollLeft = 0;
    }
    if (countEl) countEl.textContent = n + " / " + total;
    if (bar) bar.style.width = (n / total) * 100 + "%";

    if (thumbsEl) {
      var buttons = thumbsEl.children;
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-current", i + 1 === n ? "true" : "false");
      }
      var active = buttons[n - 1];
      if (active) {
        var box = thumbsEl.getBoundingClientRect();
        var rect = active.getBoundingClientRect();
        if (rect.left < box.left) {
          thumbsEl.scrollLeft += rect.left - box.left - 8;
        } else if (rect.right > box.right) {
          thumbsEl.scrollLeft += rect.right - box.right + 8;
        }
      }
    }

    if (prevBtn) prevBtn.disabled = n <= 1;
    if (nextBtn) nextBtn.disabled = n >= total;

    preload(n + 1);
    preload(n - 1);
  }

  function go(n, opts) {
    opts = opts || {};
    if (n < 1 || n > total) return false;
    if (n === index && !opts.force) return false;
    index = n;
    paint(index);
    if (!opts.silent) syncUrl();
    return true;
  }

  function buildThumbs() {
    if (!thumbsEl) return;
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= total; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "v-thumb";
      b.setAttribute("data-slide", String(i));
      b.setAttribute("aria-label", "Go to slide " + i + " of " + total);
      b.setAttribute("aria-current", i === 1 ? "true" : "false");
      var im = document.createElement("img");
      im.src = slideSrc(i);
      im.alt = "";
      im.width = 160;
      im.height = 90;
      im.loading = "lazy";
      im.decoding = "async";
      b.appendChild(im);
      frag.appendChild(b);
    }
    thumbsEl.appendChild(frag);
    thumbsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".v-thumb");
      if (!btn) return;
      go(Number(btn.getAttribute("data-slide")));
    });
  }

  /* ---------- fullscreen ---------- */

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function setFsLabel() {
    if (!fsBtn) return;
    var on = !!fullscreenElement();
    fsBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Enter fullscreen");
    fsBtn.setAttribute("title", (on ? "Exit" : "Enter") + " fullscreen (F)");
  }

  function toggleFullscreen() {
    var on = !!fullscreenElement();
    try {
      if (!on) {
        var el = document.documentElement;
        var req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) req.call(el);
        else toast("Fullscreen is not available");
      } else {
        var exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
    } catch (e) {
      toast("Fullscreen is not available");
    }
  }

  if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", setFsLabel);
  document.addEventListener("webkitfullscreenchange", setFsLabel);

  /* ---------- mobile zoom ---------- */

  function setZoom(on) {
    if (!stage) return;
    stage.classList.toggle("is-zoom", on);
    if (zoomBtn) {
      zoomBtn.setAttribute("aria-pressed", on ? "true" : "false");
      zoomBtn.setAttribute("aria-label", on ? "Fit slide to screen" : "Zoom slide");
      zoomBtn.setAttribute("title", on ? "Fit to screen (Z)" : "Zoom (Z)");
    }
    if (on) {
      if (stageInner) {
        stageInner.scrollTop = 0;
        stageInner.scrollLeft = 0;
      }
    } else if (stageInner) {
      stageInner.scrollTop = 0;
      stageInner.scrollLeft = 0;
    }
  }

  if (zoomBtn) {
    zoomBtn.addEventListener("click", function () {
      setZoom(!stage.classList.contains("is-zoom"));
    });
  }

  /* ---------- controls ---------- */

  if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented) return;
    var tag = (e.target && e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
        e.preventDefault(); go(index + 1); break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault(); go(index - 1); break;
      case " ":
      case "Spacebar":
        e.preventDefault(); go(e.shiftKey ? index - 1 : index + 1); break;
      case "Home":
        e.preventDefault(); go(1); break;
      case "End":
        e.preventDefault(); go(total); break;
      case "f":
      case "F":
        e.preventDefault(); toggleFullscreen(); break;
      case "z":
      case "Z":
        e.preventDefault(); setZoom(!stage.classList.contains("is-zoom")); break;
      case "Escape":
        if (!fullscreenElement()) {
          e.preventDefault();
          location.href = BASE + "index.html?theme=" + theme + "#work";
        }
        break;
      default:
        break;
    }
  });

  /* ---------- swipe ---------- */

  var touchX = 0;
  var touchY = 0;
  var touching = false;
  if (stage) {
    stage.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      touching = true;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!touching) return;
      touching = false;
      if (stage.classList.contains("is-zoom")) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - touchX;
      var dy = t.clientY - touchY;
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      go(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- boot ---------- */

  try {
    var q = new URLSearchParams(location.search);
    if (q.get("theme") && THEMES.indexOf(q.get("theme")) > -1) {
      localStorage.setItem(THEME_KEY, q.get("theme"));
    }
    var wanted = parseInt(q.get("slide"), 10);
    if (!isNaN(wanted)) index = Math.min(total, Math.max(1, wanted));
  } catch (e) {}

  syncTheme();
  syncNextDeck();
  buildThumbs();
  setFsLabel();
  paint(index);
  syncUrl();
})();
