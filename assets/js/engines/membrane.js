/* ============================================================================
   Qwiqly — ONION WAVE · "MEMBRANE"
   A tensile architectural skin: GPU-rendered contour mesh displaced by a
   CPU heightfield wave simulation. Drag to pull a funnel, release to snap back.
   Scroll inflates the flat sheet into a vaulted nave. Exports an A2 SVG plot.
   Zero network payload — all geometry is procedural.
   ========================================================================== */
(function () {
  "use strict";

  var NS = (window.QW = window.QW || {});
  NS.engines = NS.engines || {};

  /* ---------------------------------------------------------------- math --- */
  function mat4Identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  function mat4Perspective(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
    return out;
  }

  function mat4LookAt(out, eye, center, up) {
    var zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    var l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
    out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
    out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
    out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    out[15] = 1;
    return out;
  }

  function mat4Multiply(out, a, b) {
    for (var i = 0; i < 4; i++) {
      var ai0 = a[i], ai1 = a[i + 4], ai2 = a[i + 8], ai3 = a[i + 12];
      out[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
      out[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
      out[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
      out[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return out;
  }

  function mat4Invert(out, m) {
    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    var a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    var a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    var a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
    var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return out.set(mat4Identity());
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }

  /* ------------------------------------------------------------ geometry --- */
  // The sheet: u left→right, v near→far.
  var Z_NEAR = 2.0, Z_FAR = -8.0, HALF_NEAR = 7.0, HALF_FAR = 16.0;

  function sheetPoint(u, v, hh, inflate, out) {
    var z = Z_NEAR + (Z_FAR - Z_NEAR) * v;
    var halfW = HALF_NEAR + (HALF_FAR - HALF_NEAR) * v;
    var x = (u - 0.5) * 2 * halfW;
    var vault = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    var y = -1.7 + hh * 1.55 + inflate * 4.9 * Math.pow(Math.max(vault, 0), 0.75);
    out[0] = x; out[1] = y; out[2] = z;
    return out;
  }

  function buildMesh(lines, segs) {
    var vertsPerLine = segs + 1;
    var totalVerts = lines * 2 * vertsPerLine;
    var pos = new Float32Array(totalVerts * 2);
    var idx = new Uint16Array(lines * 2 * segs * 2);
    var stride = 0, ip = 0, vi = 0;
    // u lines (constant v)
    for (var j = 0; j < lines; j++) {
      var v = j / (lines - 1);
      for (var i = 0; i <= segs; i++) {
        pos[stride++] = i / segs;
        pos[stride++] = v;
        if (i < segs) {
          idx[ip++] = vi + i; idx[ip++] = vi + i + 1;
        }
      }
      vi += vertsPerLine;
    }
    // v lines (constant u)
    for (var k = 0; k < lines; k++) {
      var u = k / (lines - 1);
      for (var n = 0; n <= segs; n++) {
        pos[stride++] = u;
        pos[stride++] = n / segs;
        if (n < segs) {
          idx[ip++] = vi + n; idx[ip++] = vi + n + 1;
        }
      }
      vi += vertsPerLine;
    }
    return { pos: pos, idx: idx, count: idx.length, verts: totalVerts };
  }

  /* --------------------------------------------------------------- shader --- */
  var VERT = [
    "attribute vec2 aUV;",
    "uniform sampler2D uH;",
    "uniform mat4 uVP;",
    "uniform float uInflate;",
    "uniform float uTime;",
    "uniform vec3 uOffset;",
    "varying float vFade;",
    "varying float vEnergy;",
    "float unpackH(vec2 uv){",
    "  vec4 t = texture2D(uH, uv);",
    "  return (t.r*255.0*256.0 + t.g*255.0) / 65535.0 * 2.0 - 1.0;",
    "}",
    "void main(){",
    "  float u = aUV.x; float v = aUV.y;",
    "  float hh = unpackH(aUV);",
    "  float z = mix(2.0, -8.0, v);",
    "  float halfW = mix(7.0, 16.0, v);",
    "  float x = (u - 0.5) * 2.0 * halfW;",
    "  float vault = sin(3.14159265 * u) * sin(3.14159265 * v);",
    "  float y = -1.7 + hh * 1.95 + uInflate * 4.9 * pow(max(vault, 0.0), 0.75);",
    "  y += sin(u * 7.0 + uTime * 0.55) * 0.075 * (0.35 + uInflate);",
    "  y += sin(v * 5.0 - uTime * 0.4) * 0.05;",
    "  vec4 clip = uVP * vec4(x + uOffset.x, y + uOffset.y, z + uOffset.z, 1.0);",
    "  gl_Position = clip;",
    "  float nearFade = pow(1.0 - v, 0.62);",
    "  float edgeFade = smoothstep(0.0, 0.10, u) * smoothstep(0.0, 0.10, 1.0 - u);",
    "  vFade = mix(0.06, 1.0, nearFade) * (0.22 + 0.78 * edgeFade);",
    "  vEnergy = abs(hh);",
    "}"
  ].join("\n");

  var FRAG = [
    "precision mediump float;",
    "uniform vec3 uColor;",
    "uniform float uOpacity;",
    "varying float vFade;",
    "varying float vEnergy;",
    "void main(){",
    "  float a = vFade * uOpacity;",
    "  gl_FragColor = vec4(uColor * (1.0 + vEnergy * 0.55) * a, 1.0);",
    "}"
  ].join("\n");

  /* --------------------------------------------------------------- engine --- */
  function Membrane(root) {
    var stage = root.querySelector(".mb-stage");
    var canvas = root.querySelector("#mb-canvas");
    var plotBtn = root.querySelector("#mb-plot");
    var pctEl = root.querySelector("#mb-scroll-pct");
    var tTension = root.querySelector("#mb-t-tension");
    var tSpan = root.querySelector("#mb-t-span");
    var tMesh = root.querySelector("#mb-t-mesh");
    var hintEl = root.querySelector(".mb-hint");
    var surface = root.querySelector("#mb-surface");

    if (!stage || !canvas) return null;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var mobile = window.matchMedia("(max-width: 767px)");

    var gl = null;
    var ctx2d = null;

    var N = mobile.matches ? 96 : 128;
    var h, vel, field;
    var DAMP = 0.9855, C2 = 0.30, REST = 0.004;
    var energy = 0;

    var LODS = [
      { lines: 120, segs: 96 },
      { lines: 88, segs: 80 },
      { lines: 62, segs: 58 }
    ];
    var lodIndex = 0;
    var meshes = [];

    var running = false;
    var visible = true;
    var raf = 0;
    var lastT = 0;
    var t = 0;
    var dirty = true;

    var inflate = 0, inflateTarget = 0;
    var camX = 0, camY = 0, camXT = 0, camYT = 0;

    // pointer state
    var ptr = { u: 0.5, v: 0.36, x: 0, y: 0, active: false, down: false, px: 0, py: 0, pull: 0 };
    var keyPtr = { u: null, v: null };

    // frame-time watchdog
    var ftSum = 0, ftCount = 0, downshifted = 0;
    var workSum = 0;
    var lastWork = 0, lastFrame = 0;
    var tNow = (window.performance && performance.now)
      ? function () { return performance.now(); }
      : function () { return Date.now(); };

    /* ---------------------------------------------------------- gl setup --- */
    function initGL() {
      var opts = { antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true };
      try {
        gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
      } catch (e) { gl = null; }
      if (!gl) return false;

      var vs = compile(VERT, gl.VERTEX_SHADER);
      var fs = compile(FRAG, gl.FRAGMENT_SHADER);
      if (!vs || !fs) return false;
      var prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);

      var loc = {
        aUV: gl.getAttribLocation(prog, "aUV"),
        uH: gl.getUniformLocation(prog, "uH"),
        uVP: gl.getUniformLocation(prog, "uVP"),
        uInflate: gl.getUniformLocation(prog, "uInflate"),
        uTime: gl.getUniformLocation(prog, "uTime"),
        uOffset: gl.getUniformLocation(prog, "uOffset"),
        uColor: gl.getUniformLocation(prog, "uColor"),
        uOpacity: gl.getUniformLocation(prog, "uOpacity")
      };

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);

      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(N * N * 4));

      gl.uniform1i(loc.uH, 0);
      gl.uniform3f(loc.uColor, 0.88, 0.92, 0.97);

      var buffers = [];
      for (var i = 0; i < LODS.length; i++) {
        var m = buildMesh(LODS[i].lines, LODS[i].segs);
        var vb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vb);
        gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.STATIC_DRAW);
        var ib = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
        buffers.push({ vb: vb, ib: ib, count: m.count, lines: LODS[i].lines });
      }

      var vpLoc = gl.getUniformLocation(prog, "uVP");
      var offsetLoc = loc.uOffset;

      return {
        prog: prog, loc: loc, tex: tex, buffers: buffers, vpLoc: vpLoc, offsetLoc: offsetLoc
      };
    }

    function compile(src, type) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        if (window.console) console.warn("membrane shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    var G = null;

    /* ------------------------------------------------------------- sim --- */
    var hNext = null;

    function resetField() {
      h = new Float32Array(N * N);
      hNext = new Float32Array(N * N);
      vel = new Float32Array(N * N);
      field = new Uint8Array(N * N * 4);
      for (var i = 0; i < N * N; i++) field[i * 4 + 3] = 255;
    }

    // Velocity-form wave equation, double buffered so every Laplacian reads the
    // same snapshot. A small spring term pulls the sheet back to rest, which is
    // what gives the tensile material its elastic snapback.
    function stepSim() {
      var i, lap, vv, hv;
      var e = 0;
      for (var y = 1; y < N - 1; y++) {
        var row = y * N;
        for (var x = 1; x < N - 1; x++) {
          i = row + x;
          lap = h[i - 1] + h[i + 1] + h[i - N] + h[i + N] - 4 * h[i];
          vv = (vel[i] + lap * C2 - h[i] * REST) * DAMP;
          if (vv > 0.5) vv = 0.5; else if (vv < -0.5) vv = -0.5;
          vel[i] = vv;
        }
      }
      for (var y2 = 1; y2 < N - 1; y2++) {
        var row2 = y2 * N;
        for (var x2 = 1; x2 < N - 1; x2++) {
          i = row2 + x2;
          hv = h[i] + vel[i];
          if (hv > 1.05) hv = 1.05; else if (hv < -1.05) hv = -1.05;
          hNext[i] = hv;
          e += hv < 0 ? -hv : hv;
        }
      }
      // clamped (zero-gradient) edges
      for (var k = 0; k < N; k++) {
        hNext[k] = hNext[N + k]; hNext[(N - 1) * N + k] = hNext[(N - 2) * N + k];
        hNext[k * N] = hNext[k * N + 1]; hNext[k * N + N - 1] = hNext[k * N + N - 2];
      }
      var tmp = h; h = hNext; hNext = tmp;
      energy = e / (N * N * 0.5);
      return energy;
    }

    function brush(cx, cy, radius, strength, mode) {
      var r2 = radius * radius * 2;
      var x0 = Math.max(1, Math.floor(cx - radius * 2)), x1 = Math.min(N - 2, Math.ceil(cx + radius * 2));
      var y0 = Math.max(1, Math.floor(cy - radius * 2)), y1 = Math.min(N - 2, Math.ceil(cy + radius * 2));
      for (var y = y0; y <= y1; y++) {
        var dy = y - cy;
        for (var x = x0; x <= x1; x++) {
          var dx = x - cx;
          var w = Math.exp(-(dx * dx + dy * dy) / r2);
          if (w < 0.004) continue;
          var idx = y * N + x;
          if (mode === 0) {
            vel[idx] -= w * strength;
          } else {
            h[idx] += (strength - h[idx]) * 0.2 * w;
            vel[idx] *= 1 - 0.6 * w;
          }
        }
      }
    }

    function packField() {
      var i4 = 0;
      for (var i = 0; i < N * N; i++) {
        var v = h[i] * 0.5 + 0.5;
        if (v < 0) v = 0; else if (v > 1) v = 1;
        var q = (v * 65535) | 0;
        field[i4] = q >> 8;
        field[i4 + 1] = q & 255;
        i4 += 4;
      }
    }

    /* --------------------------------------------------------- viewport --- */
    var proj = new Float32Array(16), view = new Float32Array(16), vp = new Float32Array(16), vpInv = new Float32Array(16);

    function updateCamera() {
      var aspect = canvas.width / Math.max(1, canvas.height);
      var mob = mobile.matches;
      var eye = [camX * 2.6, (mob ? 3.55 : 2.55) + camY * 1.5, 10.4];
      var center = [camX * 0.8, (mob ? -0.75 : 0.15) + camY * 0.4, -3.4];
      mat4Perspective(proj, (mob ? 64 : 54) * Math.PI / 180, aspect, 0.5, 60);
      mat4LookAt(view, eye, center, [0, 1, 0]);
      mat4Multiply(vp, proj, view);
      mat4Invert(vpInv, vp);
    }

    function resize() {
      var rect = stage.getBoundingClientRect();
      var dprCap = mobile.matches ? 1.6 : 2;
      var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      var w = Math.max(320, Math.round(rect.width));
      var hgt = Math.max(320, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(hgt * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = hgt + "px";
      if (ctx2d) {
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      updateCamera();
      dirty = true;
    }

    /* ------------------------------------------------------------ render --- */
    function render() {
      if (!G) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      updateCamera();

      gl.bindTexture(gl.TEXTURE_2D, G.tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RGBA, gl.UNSIGNED_BYTE, field);

      var mesh = G.buffers[lodIndex];
      gl.useProgram(G.prog);
      gl.uniformMatrix4fv(G.loc.uVP, false, vp);
      gl.uniform1f(G.loc.uInflate, inflate);
      gl.uniform1f(G.loc.uTime, t * 0.001);
      gl.uniform3f(G.loc.uOffset, camX * 0.6, camY * 0.35, 0);
      gl.uniform1f(G.loc.uOpacity, 0.62);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb);
      gl.enableVertexAttribArray(G.loc.aUV);
      gl.vertexAttribPointer(G.loc.aUV, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
      gl.drawElements(gl.LINES, mesh.count, gl.UNSIGNED_SHORT, 0);
    }

    /* --------------------------------------------------- canvas2d fallback --- */
    function init2D() {
      ctx2d = canvas.getContext("2d");
      if (!ctx2d) return false;
      return true;
    }

    function render2D() {
      var c = ctx2d;
      var w = canvas.width / (window.devicePixelRatio || 1);
      var hh = canvas.height / (window.devicePixelRatio || 1);
      c.clearRect(0, 0, w, hh);
      var lines = 64, segs = 52;
      var cx = w / 2, horizon = hh * 0.34;
      c.lineWidth = 0.6;
      var p = [0, 0, 0];
      for (var kind = 0; kind < 2; kind++) {
        for (var j = 0; j < lines; j++) {
          var prevX = 0, prevY = 0, has = false;
          for (var i = 0; i <= segs; i++) {
            var u = kind === 0 ? i / segs : j / (lines - 1);
            var v = kind === 0 ? j / (lines - 1) : i / segs;
            var hi = Math.min(N - 1, Math.max(0, Math.round(u * (N - 1))));
            var vi = Math.min(N - 1, Math.max(0, Math.round(v * (N - 1))));
            sheetPoint(u, v, h[vi * N + hi], inflate, p);
            var persp = 9 / (9 - p[2]);
            var sx = cx + p[0] * persp * (w / 16);
            var sy = horizon - p[1] * persp * (w / 16);
            var fade = Math.pow(1 - v, 0.7) * 0.85 + 0.08;
            if (has) {
              c.strokeStyle = "rgba(226,232,240," + (fade * 0.5).toFixed(3) + ")";
              c.beginPath(); c.moveTo(prevX, prevY); c.lineTo(sx, sy); c.stroke();
            }
            prevX = sx; prevY = sy; has = true;
          }
        }
      }
    }

    /* -------------------------------------------------------------- loop --- */
    function tick(now) {
      if (!running) return;
      var dt = Math.min(now - lastT, 40);
      lastT = now;
      t = now;

      var workStart = tNow();

      var simDt = Math.min(dt / 16.667, 2);
      for (var s = 0; s < (simDt > 1.4 ? 2 : 1); s++) stepSim(dt);

      // pointer force - tight, deep funnel while held
      if (ptr.down) {
        brush(ptr.u * N, (1 - ptr.v) * N, N * (0.078 + ptr.pull * 0.05), -0.95, 1);
      } else if (ptr.active && !reduce.matches) {
        brush(ptr.u * N, (1 - ptr.v) * N, N * 0.075, 0.055, 0);
      }

      // camera easing
      camX += (camXT - camX) * 0.06;
      camY += (camYT - camY) * 0.06;

      // inflation easing
      inflate += (inflateTarget - inflate) * 0.075;

      packField();
      if (gl) render(); else render2D();

      // frame budget watchdog. dt alone is useless on 120-240 Hz displays and
      // inside headless Chrome, so we also time the callback itself and read
      // the frame interval as a fallback signal for dropped vsyncs.
      var work = tNow() - workStart;
      lastWork = work; lastFrame = dt;
      ftSum += dt; workSum += work; ftCount++;
      if (ftCount >= 48) {
        var avgFrame = ftSum / ftCount;
        var avgWork = workSum / ftCount;
        ftSum = 0; workSum = 0; ftCount = 0;
        if ((avgWork > 6.5 || avgFrame > 21) && lodIndex < LODS.length - 1) {
          lodIndex++; downshifted++;
        } else if (avgWork < 3 && avgFrame < 13 && lodIndex > 0 && downshifted < 2) {
          lodIndex--;
        }
      }

      raf = requestAnimationFrame(tick);
    }

    /* ------------------------------------------------------------ scroll --- */
    function onScroll() {
      var rect = root.getBoundingClientRect();
      var total = root.offsetHeight - window.innerHeight;
      var p = total > 0 ? -rect.top / total : 0;
      p = Math.max(0, Math.min(1, p));
      inflateTarget = p * 0.85;
      if (pctEl) {
        var pct = Math.round(p * 100);
        if (pctEl.textContent !== String(pct)) pctEl.textContent = String(pct);
      }
      // copy drifts out as the vault rises
      var copy = root.querySelector(".mb-copy");
      if (copy) copy.style.setProperty("--rise", (p * 46).toFixed(1) + "px");
    }

    /* ----------------------------------------------------------- pointer --- */
    function screenToUV(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      var ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;
      // unproject two points on the ray
      var a = unproject(ndcX, ndcY, -1);
      var b = unproject(ndcX, ndcY, 1);
      var dy = b[1] - a[1];
      if (Math.abs(dy) < 1e-5) return null;
      var tt = (-1.7 - a[1]) / dy;
      if (tt < 0) return null;
      var wx = a[0] + (b[0] - a[0]) * tt;
      var wz = a[2] + (b[2] - a[2]) * tt;
      var v = (wz - Z_NEAR) / (Z_FAR - Z_NEAR);
      v = Math.max(0.02, Math.min(0.98, v));
      var halfW = HALF_NEAR + (HALF_FAR - HALF_NEAR) * v;
      var u = 0.5 + wx / (2 * halfW);
      u = Math.max(0.02, Math.min(0.98, u));
      return { u: u, v: 1 - v };
    }

    function unproject(x, y, z) {
      var v = [x, y, z, 1];
      var out = [0, 0, 0, 0];
      for (var i = 0; i < 4; i++) {
        out[i] = vpInv[i] * v[0] + vpInv[i + 4] * v[1] + vpInv[i + 8] * v[2] + vpInv[i + 12] * v[3];
      }
      var w = out[3] || 1;
      return [out[0] / w, out[1] / w, out[2] / w];
    }

    function updatePointer(clientX, clientY) {
      var uv = screenToUV(clientX, clientY);
      if (!uv) return;
      ptr.u = uv.u; ptr.v = uv.v;
      ptr.x = clientX; ptr.y = clientY;
    }

    function onPointerMove(e) {
      if (reduce.matches) return;
      ptr.active = true;
      updatePointer(e.clientX, e.clientY);
      if (ptr.down) {
        var d = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py) + ptr.pull * 260;
        ptr.pull = Math.min(1, d / 620);
      }
      camXT = (e.clientX / window.innerWidth - 0.5) * 1.8;
      camYT = (e.clientY / window.innerHeight - 0.5) * 1.2;
      if (hintEl && scratchOnce) { hintEl.classList.add("is-off"); scratchOnce = false; }
    }

    var scratchOnce = true;

    function onPointerDown(e) {
      var target = e.target;
      if (target && target.closest && target.closest("a, button")) return;
      ptr.down = true;
      ptr.pull = 0;
      ptr.px = e.clientX; ptr.py = e.clientY;
      updatePointer(e.clientX, e.clientY);
      if (hintEl) hintEl.classList.add("is-off");
      stage.classList.add("is-grabbing");
      if (e.pointerId != null && stage.setPointerCapture) {
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      }
    }

    function onPointerUp() {
      if (!ptr.down) return;
      ptr.down = false;
      ptr.pull = 0;
      stage.classList.remove("is-grabbing");
      // release burst: the stored displacement springs back on its own
    }

    function onLeave() {
      ptr.active = false;
      camXT = 0; camYT = 0;
    }

    /* ---------------------------------------------------------- keyboard --- */
    function onKey(e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (keyPtr.u == null) { keyPtr.u = ptr.u; keyPtr.v = ptr.v; }
        var step = e.shiftKey ? 0.08 : 0.025;
        if (e.key === "ArrowLeft") keyPtr.u = Math.max(0.02, keyPtr.u - step);
        if (e.key === "ArrowRight") keyPtr.u = Math.min(0.98, keyPtr.u + step);
        if (e.key === "ArrowUp") keyPtr.v = Math.min(0.98, keyPtr.v + step);
        if (e.key === "ArrowDown") keyPtr.v = Math.max(0.02, keyPtr.v - step);
        ptr.u = keyPtr.u; ptr.v = keyPtr.v; ptr.active = true;
        if (hintEl) hintEl.classList.add("is-off");
        brush(ptr.u * N, (1 - ptr.v) * N, N * 0.075, 0.5, 0);
      } else if (e.code === "Space") {
        e.preventDefault();
        if (!ptr.down) {
          ptr.down = true; ptr.pull = 0.4;
          brush(ptr.u * N, (1 - ptr.v) * N, N * 0.08, -0.88, 1);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!ptr.down) {
          ptr.down = true; ptr.pull = 0.5;
          brush(ptr.u * N, (1 - ptr.v) * N, N * 0.08, -0.88, 1);
        }
      }
    }

    function onKeyUp(e) {
      if (e.code === "Space" || e.key === "Enter") {
        ptr.down = false; ptr.pull = 0;
      }
    }

    /* -------------------------------------------------------------- plot --- */
    function buildPolylines() {
      var lines = 120, segs = 96;
      var out = [];
      var p = [0, 0, 0];
      for (var kind = 0; kind < 2; kind++) {
        for (var j = 0; j < lines; j++) {
          var pts = [];
          for (var i = 0; i <= segs; i++) {
            var u = kind === 0 ? i / segs : j / (lines - 1);
            var v = kind === 0 ? j / (lines - 1) : i / segs;
            var hi = Math.min(N - 1, Math.round(u * (N - 1)));
            var vi = Math.min(N - 1, Math.round(v * (N - 1)));
            var hv = h[vi * N + hi];
            sheetPoint(u, v, hv, inflate, p);
            // axonometric: rotate around Y then tilt
            var ang = -0.55, tilt = 0.58;
            var px = p[0] * Math.cos(ang) - p[2] * Math.sin(ang);
            var pz = p[0] * Math.sin(ang) + p[2] * Math.cos(ang);
            var py = -p[1] - pz * tilt;
            pts.push([px, py]);
          }
          out.push(pts);
        }
      }
      return out;
    }

    function downloadPlot() {
      var W = 594, H = 420, PAD = 30;
      var polys = buildPolylines();
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      var i, j, p;
      for (i = 0; i < polys.length; i++) {
        for (j = 0; j < polys[i].length; j++) {
          p = polys[i][j];
          if (p[0] < minX) minX = p[0];
          if (p[0] > maxX) maxX = p[0];
          if (p[1] < minY) minY = p[1];
          if (p[1] > maxY) maxY = p[1];
        }
      }
      var bw = W - PAD * 2, bh = H - PAD * 2 - 54;
      var s = Math.min(bw / (maxX - minX || 1), bh / (maxY - minY || 1));
      var offX = PAD + (bw - (maxX - minX) * s) / 2 - minX * s;
      var offY = PAD + (bh - (maxY - minY) * s) / 2 - minY * s;

      var parts = [];
      parts.push('<?xml version="1.0" encoding="UTF-8"?>');
      parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm" viewBox="0 0 ' + W + " " + H + '">');
      parts.push('<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>');
      parts.push('<g fill="none" stroke="#000000" stroke-width="0.22" stroke-linecap="round">');
      var step = 1;
      for (i = 0; i < polys.length; i++) {
        var d = [];
        for (j = 0; j < polys[i].length; j += step) {
          p = polys[i][j];
          d.push((j ? "L" : "M") + (p[0] * s + offX).toFixed(2) + " " + (p[1] * s + offY).toFixed(2));
        }
        parts.push('<path d="' + d.join("") + '"/>');
      }
      parts.push("</g>");
      parts.push('<g fill="#000000" font-family="Helvetica, Arial, sans-serif">');
      parts.push('<text x="' + PAD + '" y="' + (H - 30) + '" font-size="7" letter-spacing="1.6">QWIQLY — MEMBRANE / PLOT 001</text>');
      parts.push('<text x="' + PAD + '" y="' + (H - 19) + '" font-size="5.4" letter-spacing="1.2">ONION WAVE · TENSILE SHEET · INFLATION ' + Math.round(inflate / 0.85 * 100) + "%</text>");
      parts.push('<text x="' + (W - PAD) + '" y="' + (H - 30) + '" font-size="7" text-anchor="end" letter-spacing="1.6">A2 / 594 × 420 MM</text>');
      parts.push('<text x="' + (W - PAD) + '" y="' + (H - 19) + '" font-size="5.4" text-anchor="end" letter-spacing="1.2">' + new Date().toISOString().slice(0, 10) + "</text>");
      parts.push("</g>");
      parts.push("</svg>");

      var blob = new Blob([parts.join("")], { type: "image/svg+xml" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "qwiqly-membrane-plot-001.svg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      if (plotBtn) {
        plotBtn.classList.add("is-done");
        setTimeout(function () { plotBtn.classList.remove("is-done"); }, 1600);
      }
    }

    /* --------------------------------------------------------------- boot --- */
    function poster() {
      resize();
      for (var w = 0; w < 110; w++) {
        stepSim();
        if (w < 30) brush(N * 0.63, N * 0.44, N * 0.14, -0.7, 1);
      }
      onScroll();
      packField();
      if (gl) render(); else render2D();
    }

    resetField();
    G = initGL();
    if (!G) init2D();
    if (!G && !ctx2d) return null;

    resize();
    if (reduce.matches) poster();

    // interactions
    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerenter", function () { ptr.active = true; });
    if (surface) {
      surface.addEventListener("keydown", onKey);
      surface.addEventListener("keyup", onKeyUp);
      surface.addEventListener("focus", function () { if (hintEl) hintEl.classList.add("is-off"); });
    }
    if (plotBtn) plotBtn.addEventListener("click", downloadPlot);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    var ro = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(function () { resize(); });
      ro.observe(stage);
    }

    // live readouts, throttled
    var readoutTimer = setInterval(function () {
      if (!running) return;
      if (tTension) tTension.textContent = Math.min(9.99, energy * 9).toFixed(2);
      if (tSpan) tSpan.textContent = (7 + inflate * 6).toFixed(1) + " m";
      if (tMesh) tMesh.textContent = (LODS[lodIndex].lines * 2 * (LODS[lodIndex].segs + 1)).toLocaleString("en-US");
      window.__mbPerf = { work: +lastWork.toFixed(2), frame: +lastFrame.toFixed(2), lod: lodIndex };
    }, 180);

    onScroll();

    return {
      name: "membrane",
      start: function () {
        if (reduce.matches) { poster(); return; }
        if (running) return;
        running = true;
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      },
      stop: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
      resize: resize,
      poster: poster,
      // Quality seam: the watchdog drives these, and QA/stress tests can too.
      setLod: function (i) {
        lodIndex = Math.max(0, Math.min(LODS.length - 1, i | 0));
        return LODS[lodIndex];
      },
      getLod: function () { return lodIndex; },
      getPerf: function () { return { work: lastWork, frame: lastFrame, energy: energy }; },
      destroy: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        clearInterval(readoutTimer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", resize);
        if (ro) ro.disconnect();
      }
    };
  }

  NS.engines.onion = Membrane;
})();
