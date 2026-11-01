/* Qwiqly v2 — site behaviour: themes, filters, mascot, motion. */
(function () {
  "use strict";

  var root = document.documentElement;
  var THEMES = ["emerald", "ora", "pixel", "atomic", "onion", "coppola"];
  var NAME = {
    emerald: "Emerald Mechanic",
    ora: "Ora Acid",
    pixel: "Pixel Gallery",
    atomic: "Atomic Chrome",
    onion: "Onion Wave",
    coppola: "Coppola Noir"
  };
  var COLOR = {
    emerald: "#050806",
    ora: "#0b0b09",
    pixel: "#0a0c12",
    atomic: "#080b10",
    onion: "#000000",
    coppola: "#0b0907"
  };
  var LABELS = {
    emerald: {
      about: "About", work: "Selected work", workTitle: "Presentations",
      themes: "Systems", method: "Method", methodTitle: "How decks get shipped", contact: "Contact"
    },
    ora: {
      about: "Studio", work: "The archive", workTitle: "Decks that close.",
      themes: "Skins", method: "How it ships", methodTitle: "Four moves. One deck.", contact: "Start"
    },
    pixel: {
      about: "The studio", work: "High scores", workTitle: "Select your deck.",
      themes: "Select theme", method: "The process", methodTitle: "How to play", contact: "Say hello"
    },
    atomic: {
      about: "Practice", work: "Selected systems", workTitle: "The work.",
      themes: "Editions", method: "Method", methodTitle: "How the lab runs", contact: "Brief"
    },
    onion: {
      about: "Notes", work: "Index", workTitle: "The index.",
      themes: "Editions", method: "Approach", methodTitle: "How it is built", contact: "Enquiries"
    },
    coppola: {
      about: "Credits", work: "The reel", workTitle: "Selected frames.",
      themes: "Versions", method: "Production", methodTitle: "How it is made", contact: "Commission"
    }
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(pointer: fine)");
  var urlTheme = null;
  try {
    var params = new URLSearchParams(window.location.search);
    urlTheme = params.get("theme");
  } catch (e) {}
  var storedTheme = null;
  try { storedTheme = localStorage.getItem("qw-theme"); } catch (e) {}
  var current = (urlTheme && THEMES.indexOf(urlTheme) > -1)
    ? urlTheme
    : (storedTheme && THEMES.indexOf(storedTheme) > -1)
      ? storedTheme
      : (THEMES.indexOf(root.dataset.theme) > -1 ? root.dataset.theme : "emerald");

  var themeBtn = document.getElementById("themeBtn");
  var themePop = document.getElementById("themePop");
  var themePopList = document.getElementById("themePopList");
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var toastEl = document.getElementById("toast");
  var toastTimer = 0;

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1900);
  }

  function setLabel(el, text) {
    if (!el || el.dataset.applied === text) return;
    var lastText = null;
    for (var i = el.childNodes.length - 1; i >= 0; i--) {
      if (el.childNodes[i].nodeType === 3) { lastText = el.childNodes[i]; break; }
    }
    if (lastText) lastText.nodeValue = text;
    else el.appendChild(document.createTextNode(text));
    el.dataset.applied = text;
  }

  function syncUI(theme) {
    current = theme;
    root.dataset.theme = theme;
    root.style.colorScheme = "dark";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", COLOR[theme]);

    document.querySelectorAll('[data-theme-set]').forEach(function (el) {
      var on = el.getAttribute("data-theme-set") === theme;
      el.setAttribute("aria-pressed", on ? "true" : "false");
      if (el.classList.contains("theme-card")) {
        var badge = el.querySelector(".tc-badge");
        if (badge) badge.textContent = on ? "Active" : "Live theme";
        if (badge) badge.classList.toggle("is-active", on);
      }
    });

    var dict = LABELS[theme] || LABELS.emerald;
    document.querySelectorAll("[data-label]").forEach(function (el) {
      var key = el.getAttribute("data-label");
      if (dict[key]) setLabel(el, dict[key]);
    });

    document.querySelectorAll("a[data-deck]").forEach(function (a) {
      var slug = a.getAttribute("data-deck");
      var next = "work/" + slug + ".html" + (theme === "emerald" ? "" : "?theme=" + theme);
      if (a.getAttribute("href") !== next) a.setAttribute("href", next);
    });

    var share = document.getElementById("tp-share");
    if (share) share.textContent = "?theme=" + theme;

    try { localStorage.setItem("qw-theme", theme); } catch (e) {}

    document.documentElement.dispatchEvent(new CustomEvent("qw:theme", { detail: { theme: theme } }));
  }

  function updateUrl(theme) {
    if (location.protocol === "file:") return;
    try {
      var url = location.pathname + "?theme=" + theme + location.hash;
      history.replaceState(null, "", url);
    } catch (e) {}
  }

  function applyTheme(theme, opts) {
    opts = opts || {};
    if (THEMES.indexOf(theme) < 0 || theme === current) {
      if (theme === current && !opts.silent) closePop();
      return;
    }
    var commit = function () { syncUI(theme); };
    if (!opts.silent) updateUrl(theme);

    if (document.startViewTransition && !reduce.matches && !opts.instant) {
      document.startViewTransition(commit);
    } else {
      commit();
    }

    if (!opts.silent) {
      toast(NAME[theme] + " — theme saved");
      if (themeBtn) themeBtn.setAttribute("aria-expanded", "false");
      closePop(true);
      if (opts.scrollTop) {
        setTimeout(function () {
          window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
        }, 120);
      }
    }
  }

  /* ---------- theme popover ---------- */
  var popOpen = false;

  function openPop() {
    if (!themePop || !themeBtn) return;
    popOpen = true;
    themePop.classList.add("is-open");
    themePop.inert = false;
    themeBtn.setAttribute("aria-expanded", "true");
    var active = themePop.querySelector('[aria-pressed="true"]');
    if (active) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { active.focus({ preventScroll: true }); });
      });
    }
  }

  function closePop(silent) {
    if (!themePop || !themeBtn) return;
    popOpen = false;
    themePop.classList.remove("is-open");
    themePop.inert = true;
    themeBtn.setAttribute("aria-expanded", "false");
    if (!silent) themeBtn.focus({ preventScroll: true });
  }

  if (themePop) themePop.inert = true;
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      if (popOpen) closePop(); else openPop();
    });
  }
  if (themePop) {
    themePop.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); closePop(); }
    });
  }
  document.addEventListener("pointerdown", function (e) {
    if (!popOpen || !themePop) return;
    if (themePop.contains(e.target) || (themeBtn && themeBtn.contains(e.target))) return;
    closePop();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && popOpen) closePop();
  });

  document.querySelectorAll("[data-theme-set]").forEach(function (el) {
    el.addEventListener("click", function () {
      var theme = el.getAttribute("data-theme-set");
      var fromGrid = el.classList.contains("theme-card");
      applyTheme(theme, { scrollTop: fromGrid });
      if (drawer && drawer.classList.contains("is-open")) closeDrawer();
    });
  });

  /* ---------- mobile drawer ---------- */
  function openDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.add("is-open");
    drawer.inert = false;
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    document.body.classList.add("nav-locked");
    var first = drawer.querySelector("a, button");
    if (first) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { first.focus({ preventScroll: true }); });
      });
    }
  }
  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove("is-open");
    drawer.inert = true;
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-locked");
    if (drawer.contains(document.activeElement) || document.activeElement === document.body) {
      burger.focus({ preventScroll: true });
    }
  }
  if (drawer) drawer.inert = true;
  if (burger) {
    burger.addEventListener("click", function () {
      if (drawer && drawer.classList.contains("is-open")) closeDrawer(); else openDrawer();
    });
  }
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!drawer || !drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeDrawer();
      return;
    }
    if (e.key !== "Tab" || !burger) return;
    var items = [burger].concat(Array.prototype.slice.call(drawer.querySelectorAll("a, button")));
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900 && drawer && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ---------- nav stuck ---------- */
  var nav = document.getElementById("nav");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (nav) nav.classList.toggle("is-stuck", window.scrollY > 14);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- work filters ---------- */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var featured = document.querySelector(".featured");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var countEl = document.getElementById("workCount");
  var emptyEl = document.getElementById("empty");

  function applyFilter(type) {
    var visible = 0;
    cards.forEach(function (card) {
      var show = type === "all" || card.getAttribute("data-type") === type;
      card.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    if (featured) {
      var showFeatured = type === "all" || featured.getAttribute("data-type") === type;
      featured.classList.toggle("is-hidden", !showFeatured);
      if (showFeatured) visible++;
    }
    if (countEl) countEl.textContent = String(visible);
    if (emptyEl) emptyEl.hidden = visible > 0;
    filterButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-filter") === type ? "true" : "false");
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
  reduce.addEventListener && reduce.addEventListener("change", function () {
    if (reduce.matches) reveals.forEach(function (el) { el.classList.add("in"); });
  });

  /* ---------- mascot ---------- */
  var mascot = document.getElementById("mascot");
  if (mascot) {
    var sheet = mascot.querySelector(".mascot-sheet");
    var cell = 4;
    var mode = "directions";
    var boopIndex = 0;
    var boopTimer = 0;
    var blinkTimer = 0;
    var reactionsReady = false;
    var DIR = "assets/img/mascot-directions.webp?v=original";
    var REACT = "assets/img/mascot-reactions.webp?v=original";

    function pos(i) {
      return (i % 3) * 50 + "% " + Math.floor(i / 3) * 50 + "%";
    }
    function paint(i, m) {
      cell = i; mode = m;
      sheet.style.backgroundImage = 'url("' + (m === "reactions" ? REACT : DIR) + '")';
      sheet.style.backgroundPosition = pos(i);
      sheet.dataset.sheet = m;
    }
    function warmReactions() {
      if (reactionsReady) return;
      reactionsReady = true;
      var im = new Image();
      im.src = REACT;
    }
    function boop() {
      if (!sheet) return;
      if (reduce.matches) return;
      warmReactions();
      boopIndex = (boopIndex + 1) % 8;
      paint(boopIndex, "reactions");
      sheet.style.setProperty("--rx", "0deg");
      sheet.style.setProperty("--ry", "0deg");
      clearTimeout(boopTimer);
      boopTimer = setTimeout(function () {
        paint(4, "directions");
        sheet.style.setProperty("--rx", "0deg");
        sheet.style.setProperty("--ry", "0deg");
      }, 720);
    }
    mascot.addEventListener("click", boop);
    mascot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); boop(); }
    });

    if (fine.matches && !reduce.matches) {
      document.addEventListener("pointermove", function (e) {
        if (root.dataset.theme !== "emerald") return;
        if (mascot.offsetParent === null || mode === "reactions") return;
        var r = mascot.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy) || 1;
        var deg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        var next = 4;
        if (dist > r.width * 0.16) {
          if (deg >= 337.5 || deg < 22.5) next = 5;
          else if (deg < 67.5) next = 8;
          else if (deg < 112.5) next = 7;
          else if (deg < 157.5) next = 6;
          else if (deg < 202.5) next = 3;
          else if (deg < 247.5) next = 0;
          else if (deg < 292.5) next = 1;
          else next = 2;
        }
        if (next !== cell) paint(next, "directions");
        var nx = Math.max(-1, Math.min(1, dx / (r.width * 0.7)));
        var ny = Math.max(-1, Math.min(1, dy / (r.height * 0.7)));
        sheet.style.setProperty("--ry", (nx * 8).toFixed(2) + "deg");
        sheet.style.setProperty("--rx", (-ny * 7).toFixed(2) + "deg");
      }, { passive: true });
    }

    function blink() {
      if (reduce.matches || docHidden() || root.dataset.theme !== "emerald") return;
      if (mascot.offsetParent === null || mode === "reactions") return;
      var prev = cell;
      paint(1, "directions");
      setTimeout(function () { if (mode === "directions") paint(prev, "directions"); }, 130);
    }
    function docHidden() { return document.visibilityState === "hidden"; }
    blinkTimer = setInterval(blink, 5200);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") clearInterval(blinkTimer), blinkTimer = setInterval(blink, 5200);
    });
  }

  /* ---------- coppola spotlight / atomic drift ---------- */
  var cp = document.querySelector(".hero--coppola");
  if (cp && fine.matches && !reduce.matches) {
    cp.addEventListener("pointermove", function (e) {
      var r = cp.getBoundingClientRect();
      var mx = ((e.clientX - r.left) / r.width) * 100;
      var my = ((e.clientY - r.top) / r.height) * 100;
      cp.style.setProperty("--mx", mx.toFixed(1) + "%");
      cp.style.setProperty("--my", my.toFixed(1) + "%");
    }, { passive: true });
  }

  var at = document.querySelector(".hero--atomic");
  if (at && fine.matches && !reduce.matches) {
    at.addEventListener("pointermove", function (e) {
      var r = at.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      at.style.setProperty("--ax", (nx * -10).toFixed(1) + "px");
      at.style.setProperty("--ay", (ny * -8).toFixed(1) + "px");
    }, { passive: true });
  }

  /* ---------- preload theme art after idle ---------- */
  function warm() {
    ["hero-pixel-city", "hero-atomic", "hero-onion", "hero-coppola"].forEach(function (name) {
      var im = new Image();
      im.src = "assets/img/" + name + ".webp";
    });
  }
  if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 3500 });
  else setTimeout(warm, 1800);

  /* ---------- year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- boot ---------- */
  syncUI(current);
})();
