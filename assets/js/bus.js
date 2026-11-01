/* ============================================================================
   Qwiqly — engine bus
   One lifecycle for every hero: mount lazily, start only when the theme is
   active AND the hero is on screen AND the tab is visible. Never bind twice.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var registry = {};
  var io = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function entryFor(el) {
    for (var k in registry) {
      if (registry[k] && registry[k].root === el) return registry[k];
    }
    return null;
  }

  function observe(el) {
    if (!("IntersectionObserver" in window)) {
      var e = entryFor(el);
      if (e) { e.visible = true; }
      apply();
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var e = entryFor(entries[i].target);
          if (e) e.visible = entries[i].isIntersecting;
        }
        apply();
      }, { rootMargin: "120px 0px 120px 0px", threshold: 0 });
    }
    io.observe(el);
  }

  function mount(name) {
    if (registry[name] || !name) return registry[name];
    var el = document.querySelector('[data-engine="' + name + '"]');
    var factory = window.QW && window.QW.engines && window.QW.engines[name];
    if (!el || !factory) return null;

    var api = null;
    try {
      api = factory(el);
    } catch (err) {
      if (window.console) console.warn("[qw] engine failed:", name, err);
    }
    if (!api) {
      el.setAttribute("data-engine-failed", "");
      return null;
    }

    var entry = { api: api, root: el, visible: false, running: false, name: name };
    registry[name] = entry;
    observe(el);
    return entry;
  }

  function apply() {
    var active = root.dataset.theme;
    var still = reduce.matches;
    for (var k in registry) {
      if (!Object.prototype.hasOwnProperty.call(registry, k)) continue;
      var e = registry[k];
      var should = k === active && e.visible && !document.hidden && !still;
      if (should && !e.running) {
        e.running = true;
        e.postered = false;
        try { e.api.start(); } catch (err) { if (window.console) console.warn(err); }
      } else if (!should && e.running) {
        e.running = false;
        try { e.api.stop(); } catch (err) {}
      }
      // Reduced motion: paint one composed still instead of animating.
      if (still && k === active && e.visible && !e.postered) {
        e.postered = true;
        try { if (e.api.poster) e.api.poster(); } catch (err) {}
      }
    }
    root.classList.toggle("qw-static", still);
  }

  function sync() {
    mount(root.dataset.theme);
    apply();
  }

  document.documentElement.addEventListener("qw:theme", function (e) {
    var next = e.detail && e.detail.theme;
    if (next) mount(next);
    apply();
  });

  document.addEventListener("visibilitychange", apply);

  // Free the GPU/CPU when the page goes into the back/forward cache.
  window.addEventListener("pagehide", function () {
    for (var k in registry) {
      if (registry[k] && registry[k].running) {
        registry[k].running = false;
        try { registry[k].api.stop(); } catch (err) {}
      }
    }
  });
  window.addEventListener("pageshow", apply);

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (var k in registry) {
        if (registry[k] && registry[k].running) {
          try { registry[k].api.resize(); } catch (err) {}
        }
      }
      apply();
    }, 140);
  }, { passive: true });

  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      for (var k in registry) {
        if (!registry[k]) continue;
        try { registry[k].api.stop(); } catch (err) {}
        registry[k].running = false;
      }
      apply();
    });
  }

  window.QW = window.QW || {};
  window.QW.bus = {
    sync: sync,
    apply: apply,
    mount: mount,
    get: function (name) { return registry[name] ? registry[name].api : null; },
    running: function () {
      var out = [];
      for (var k in registry) if (registry[k] && registry[k].running) out.push(k);
      return out;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }
})();
