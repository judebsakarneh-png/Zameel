/* The Zameel support agent from the promo film, drawn in grey and rendered as halftone dots.
   Same drawing as video/source/zameel-promo.html, wrapped so several can live on one page.
   new ZameelAgent(canvas, { mode: 'dark' | 'light', spacing, view }) */
(function () {
  var CW = 480, CH = 600;
  var MARK_SRC = (document.currentScript && document.currentScript.dataset.mark) || "assets/brand/zameel-mark.svg";
  var mark = new Image(); mark.src = MARK_SRC;

  function Agent(canvas, opts) {
    opts = opts || {};
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.mode = opts.mode || "dark";           // 'dark': navy dots on light; 'light': white dots on navy
    this.sp = opts.spacing || 7;
    this.view = opts.view || null;             // {x, y, s} as fractions of the canvas size; default fits the bust
    this.badge = opts.badge !== false;
    this.src = document.createElement("canvas"); this.src.width = CW; this.src.height = CH;
    this.g = this.src.getContext("2d", { willReadFrequently: true });
    this.p = { tilt: 0, lookX: 0, lookY: 0, blink: 0, smile: 1.1 };
    this.last = "";
    this.resize();
  }

  Agent.prototype.resize = function () {
    var r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height); this.dpr = dpr;
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.last = "";
  };

  Agent.prototype.rr = function (x, y, w, h, r) { var g = this.g; g.beginPath(); g.roundRect(x, y, w, h, r); };

  Agent.prototype.drawSource = function () {
    var g = this.g, p = this.p, L = this.mode === "light", rr = this.rr.bind(this), gr;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH);
    g.globalCompositeOperation = "source-over";
    // body + turtleneck
    gr = g.createLinearGradient(60, 420, 420, 620); gr.addColorStop(0, L ? "#6e6e6e" : "#4a4a4a"); gr.addColorStop(1, L ? "#3a3a3a" : "#141414");
    g.fillStyle = gr; rr(40, 432, 400, 260, [170, 170, 0, 0]); g.fill();
    g.fillStyle = "#2c2c2c"; rr(172, 380, 136, 80, 28); g.fill();
    g.strokeStyle = "#555"; g.lineWidth = 4;
    for (var x = 190; x <= 290; x += 20) { g.beginPath(); g.moveTo(x, 392); g.lineTo(x, 446); g.stroke(); }
    g.fillStyle = "#333"; rr(158, 432, 164, 34, 17); g.fill();

    g.save(); g.translate(240, 410); g.rotate(p.tilt); g.translate(-240, -410);
    g.fillStyle = "#d0d0d0"; g.strokeStyle = "#666"; g.lineWidth = 5;
    [96, 384].forEach(function (ex) { g.beginPath(); g.arc(ex, 262, 26, 0, Math.PI * 2); g.fill(); g.stroke(); });
    gr = g.createRadialGradient(205, 215, 30, 240, 250, 175); gr.addColorStop(0, "#f6f6f6"); gr.addColorStop(.7, "#e2e2e2"); gr.addColorStop(1, "#bdbdbd");
    g.fillStyle = gr; g.beginPath(); g.ellipse(240, 248, 148, 140, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#6a6a6a"; g.lineWidth = 5; g.stroke();
    // curly hair
    g.fillStyle = L ? "#5c5c5c" : "#121212";
    g.beginPath(); g.ellipse(240, 160, 140, 78, 0, Math.PI, 0); g.fill();
    var curls = [[110, 178, 38], [96, 214, 30], [142, 132, 42], [196, 106, 44], [254, 100, 46], [310, 116, 44], [352, 150, 40], [380, 194, 32], [174, 160, 34], [236, 150, 36], [300, 160, 34], [388, 226, 24], [92, 246, 22]];
    curls.forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], c[2], 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = L ? "#9a9a9a" : "#3c3c3c"; g.lineWidth = 4;
    curls.forEach(function (c) { g.beginPath(); g.arc(c[0] - c[2] * .1, c[1] - c[2] * .05, c[2] * .55, Math.PI * 1.05, Math.PI * 1.75); g.stroke(); });
    // headset
    g.strokeStyle = "#7a7a7a"; g.lineWidth = 14; g.lineCap = "round";
    g.beginPath(); g.arc(240, 250, 166, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.fillStyle = "#2a2a2a"; rr(70, 222, 38, 80, 17); g.fill(); rr(372, 222, 38, 80, 17); g.fill();
    g.fillStyle = "#6a6a6a"; rr(78, 232, 10, 56, 5); g.fill();
    g.strokeStyle = "#2a2a2a"; g.lineWidth = 9;
    g.beginPath(); g.moveTo(92, 296); g.quadraticCurveTo(108, 352, 176, 350); g.stroke();
    g.fillStyle = "#2a2a2a"; rr(170, 340, 30, 20, 10); g.fill();
    // cheeks
    g.fillStyle = "rgba(0,0,0,.13)";
    g.beginPath(); g.ellipse(166, 306, 26, 15, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(314, 306, 26, 15, 0, 0, Math.PI * 2); g.fill();
    // eyes
    var lx = p.lookX * 9, ly = p.lookY * 6, open = 1 - p.blink;
    [194, 286].forEach(function (ex) {
      var x = ex + lx, y = 262 + ly;
      if (open > .15) {
        g.fillStyle = "#080808"; g.beginPath(); g.ellipse(x, y, 22, 30 * open, 0, 0, Math.PI * 2); g.fill();
        if (open > .6) { g.fillStyle = "#fff"; g.beginPath(); g.arc(x + 7, y - 11 * open, 7.5, 0, Math.PI * 2); g.fill(); }
      } else {
        g.strokeStyle = "#080808"; g.lineWidth = 7; g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y + 9, x + 20, y); g.stroke();
      }
    });
    var w = 30 * p.smile, d = 15 * p.smile;
    g.strokeStyle = "#101010"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(240 - w, 312); g.quadraticCurveTo(240, 312 + 2 * d, 240 + w, 312); g.stroke();
    g.restore();
    // dissolve the bottom of the bust
    g.globalCompositeOperation = "destination-out";
    gr = g.createLinearGradient(0, 520, 0, 600); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = gr; g.fillRect(0, 500, CW, 100);
    g.globalCompositeOperation = "source-over";
  };

  // Hex grid fixed to the character, so the pattern never shimmers as it moves.
  Agent.prototype.render = function () {
    var p = this.p, key = [p.tilt, p.lookX, p.lookY, p.blink, p.smile].map(function (v) { return v.toFixed(3); }).join();
    if (key === this.last) return;
    this.last = key;
    this.drawSource();
    var ctx = this.ctx, d = this.g.getImageData(0, 0, CW, CH).data, sp = this.sp, dark = this.mode === "dark";
    var v0 = this.view || { x: .5, y: .5, s: this.w / CW };
    var X = v0.x * this.w, Y = v0.y * this.h, s = this.view ? v0.s * this.w / CW : v0.s;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.fillStyle = dark ? "#0E1D70" : "#FDFBFC";
    ctx.beginPath();
    var rowH = sp * 0.866, rmax = sp * 0.58;
    for (var row = 0, y = sp / 2; y < CH; row++, y += rowH) {
      for (var x = (row & 1) ? sp : sp / 2; x < CW; x += sp) {
        var i = ((y | 0) * CW + (x | 0)) * 4, a = d[i + 3] / 255;
        if (a < 0.04) continue;
        var l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        var v = (dark ? 1 - l : l) * a;
        if (v < 0.035) continue;
        var r = rmax * Math.sqrt(v) * s, sx = X + (x - CW / 2) * s, sy = Y + (y - CH / 2) * s;
        ctx.moveTo(sx + r, sy); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      }
    }
    ctx.fill();
    // crisp chest badge with the real Zameel mark (never halftoned)
    if (this.badge) {
      var bx = X + (306 - CW / 2) * s, by = Y + (488 - CH / 2) * s, bs = 50 * s;
      ctx.fillStyle = "#FDFBFC"; ctx.beginPath(); ctx.roundRect(bx, by, bs, bs, 9 * s); ctx.fill();
      if (!dark) { ctx.strokeStyle = "rgba(14,29,112,.15)"; ctx.lineWidth = 1; ctx.stroke(); }
      if (mark.complete && mark.naturalWidth) { var m = bs * .66; ctx.drawImage(mark, bx + (bs - m) / 2, by + (bs - m) / 2, m, m * 175 / 173); }
    }
  };

  Agent.ready = mark.decode ? mark.decode().catch(function () {}) : Promise.resolve();
  window.ZameelAgent = Agent;
})();
