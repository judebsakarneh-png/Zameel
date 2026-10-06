/* Zameel client dashboard (example account). Five screens drawn in the halftone dot style.
   All numbers are generated from a fixed seed so the example looks the same for everyone.
   Strings come from the JSON block #dash-i18n, so the same script runs the Arabic page. */
(function () {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var T = JSON.parse($("#dash-i18n").textContent);
  var AR = document.documentElement.lang === "ar", RTL = document.documentElement.dir === "rtl";
  var FONT = AR ? "Tajawal, Inter, sans-serif" : "Inter, sans-serif";
  var NAVY = "#0E1D70", ORANGE = "#F66747", PALE = "#D5D9EC", KICK = "#6A7096", INK = "#1A1F3D";
  var SHADES = [NAVY, "#4B5AA8", "#8D97CF", "#C3C9E8", ORANGE];
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var num = function (n) { return n.toLocaleString("en-US"); };
  function dur(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m ? m + (AR ? " " + T.m + " " : T.m + " ") + s + (AR ? " " + T.s : T.s) : s + (AR ? " " + T.s : T.s);
  }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function fitCanvas(cv) {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c: c, w: r.width, h: r.height };
  }
  function tweenRun(ms, fn) {
    if (calm) { fn(1); return; }
    var t0 = performance.now();
    (function f(now) { var k = clamp((now - t0) / ms, 0, 1); fn(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function dot(c, x, y, r) { if (!(r > 0)) return; c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); }
  // charts are mirrored on the Arabic page, so they read right to left
  function mirror(f) { return RTL ? function (x) { return f.w - x; } : function (x) { return x; }; }
  function fmtDate(d) { return d.getDate() + " " + T.months[d.getMonth()]; }

  /* ---------- data ---------- */
  var WEEK_START = new Date(2026, 9, 4); // the example account's current week starts Sunday 4 October
  function makeData(p) {
    var w = p === "w", r = rng(w ? 11 : 29), n = w ? 7 : 28, vol = [];
    for (var i = 0; i < n; i++) { var dow = i % 7; vol.push(Math.round(150 + 50 * Math.sin((dow + 1) / 7 * Math.PI) + r() * 40 + (dow === 4 ? 25 : 0))); }
    var heat = [];
    for (var d = 0; d < 7; d++) { var row = []; for (var h = 0; h < 24; h++) {
      var v = 2 + 26 * Math.exp(-Math.pow((h - 21) / 2.4, 2)) + 16 * Math.exp(-Math.pow((h - 13) / 2.2, 2)) + 8 * Math.exp(-Math.pow((h - 10) / 1.6, 2));
      if (h < 7) v *= .25; v *= (d === 4 || d === 3 ? 1.2 : 1) * (.85 + r() * .3) * (w ? 1 : 4); row.push(Math.round(v)); } heat.push(row); }
    var total = vol.reduce(function (a, b) { return a + b; }, 0);
    var hourly = []; for (var hh = 0; hh < 24; hh++) { var s = 0; for (var dd = 0; dd < 7; dd++) s += heat[dd][hh]; hourly.push(s / 7 / (w ? 1 : 4)); }
    var rows = [];
    for (var k = 0; k < 14; k++) {
      var ch = [0, 0, 1, 0, 2, 1, 0, 3, 0, 2, 4, 1, 0, 2][k];
      rows.push({ id: 48213 + Math.round(r() * 700) + k * 3, ch: ch, lang: r() < .62 ? 0 : 1, reason: Math.floor(r() * 6), agent: Math.floor(r() * 6),
        first: ch === 1 ? 600 + Math.round(r() * 1700) : 30 + Math.round(r() * 80), status: k === 3 ? 2 : (k === 1 || k === 6 ? 1 : 0) });
    }
    return {
      p: p, vol: vol, heat: heat, hourly: hourly, total: total, rows: rows,
      mix: w ? [46, 22, 17, 9, 6] : [44, 23, 18, 9, 6],
      lang: w ? [64, 36] : [62, 38],
      reasons: w ? [27, 21, 15, 12, 15, 10] : [25, 22, 16, 13, 14, 10],
      qa: [96, 95, 93, 90, 97, 92].map(function (q) { return q - (w ? 0 : Math.round(r() * 2)); }),
      trend: [90, 91, 92, 91, 93, 93, 94, w ? 94 : 93],
      score: w ? 94 : 93, reviewed: w ? 186 : 742, coached: w ? 9 : 34,
      kpi: {
        o0: [num(total), (w ? "▲ 6% " : "▲ 4% ") + (w ? T.vsWeek : T.vsMonth)], o1: [dur(w ? 102 : 111), T.target2],
        o2: [(w ? 87 : 86) + "%", "▲ " + (w ? "2 " + T.pts : "1 " + T.pt)], o3: [(w ? 94 : 93) + "%", T.yourCard],
        c0: ["23", "&nbsp;"], c1: [num(Math.round(total * .95)), "95%"], c2: [num(Math.round(total * .031)), "3.1%"], c3: [dur(w ? 372 : 381), "&nbsp;"],
        t0: ["6", T.langs.join(" + ")], t2: ["16 " + T.hrs, "08:00 – 24:00"], t3: [T.langShort.join(" + "), "&nbsp;"],
      },
      sla: [dur(w ? 102 : 111), (w ? 38 : 41) + " " + T.min, (w ? 94 : 93) + "%", "0"],
    };
  }
  var SHIFTS = [[8, 16], [8, 16], [12, 20], [16, 24], [16, 24], [12, 20]];
  var D = makeData("w");

  /* ---------- tabs ---------- */
  var tabs = $$('.dnav [role="tab"]'), title = $("#dtitle"), drawn = {};
  var IDS = tabs.map(function (t) { return t.id.replace("tab-", ""); });
  function show(i, focus, keepHash) {
    tabs.forEach(function (t, j) {
      var on = i === j, pn = $("#" + t.getAttribute("aria-controls"));
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      pn.hidden = !on; pn.classList.toggle("on", on);
    });
    title.textContent = T.screens[IDS[i]];
    if (focus) tabs[i].focus();
    if (!keepHash && history.replaceState) history.replaceState(null, "", "#" + IDS[i]);
    tip.hidden = true;
    render(IDS[i], !drawn[IDS[i]]);
    drawn[IDS[i]] = true;
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { show(i); });
    t.addEventListener("keydown", function (e) {
      var k = { ArrowDown: 1, ArrowUp: -1, ArrowRight: RTL ? -1 : 1, ArrowLeft: RTL ? 1 : -1 }[e.key];
      if (k) { e.preventDefault(); show((i + k + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------- shared pieces ---------- */
  function setKpis(keys) {
    keys.forEach(function (k) {
      var b = $('[data-k="' + k + '"]'), d = $('[data-d="' + k + '"]'), v = D.kpi[k];
      if (b && v) b.textContent = v[0];
      if (d && v) d.innerHTML = v[1];
    });
  }
  var tip = $("#dtip"), main = $(".dmain"), hits = {};
  function bindTip(id, test) {
    var cv = $("#" + id);
    cv.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, hit = null;
      (hits[id] || []).forEach(function (h) { if (test(h, x, y)) hit = h; });
      if (!hit) { tip.hidden = true; return; }
      var br = main.getBoundingClientRect();
      tip.textContent = hit.t; tip.hidden = false;
      tip.style.left = (r.left - br.left + hit.x) + "px"; tip.style.top = (r.top - br.top + (hit.y || y)) + "px";
    });
    cv.addEventListener("pointerleave", function () { tip.hidden = true; });
  }
  function waffle(id, parts, k) {
    var f = fitCanvas($("#" + id)), c = f.c, mx = mirror(f), cols = 10, sp = Math.min(f.w / cols, f.h / 10), r = sp * .34;
    var ox = (f.w - sp * cols) / 2, idx = 0;
    parts.forEach(function (n, g) {
      c.fillStyle = SHADES[parts.length === 2 ? g * 2 : g]; c.beginPath();
      for (var j = 0; j < n; j++, idx++) {
        if (idx / 100 > k) continue;
        var col = idx % cols, row = Math.floor(idx / cols);
        dot(c, mx(ox + sp * (col + .5)), sp * (row + .5), r);
      }
      c.fill();
    });
  }
  function legend(id, names, parts) {
    $("#" + id).innerHTML = names.map(function (n, i) {
      return '<li><i style="background:' + SHADES[parts.length === 2 ? i * 2 : i] + '"></i>' + esc(n) + "<b>" + parts[i] + "%</b></li>";
    }).join("");
  }
  // horizontal dot bars: label, dots, value
  function dotBars(id, labels, vals, max, cols, k, unit) {
    var f = fitCanvas($("#" + id)), c = f.c, mx = mirror(f), rows = labels.length, rowH = f.h / rows;
    c.font = "600 12px " + FONT;
    var lw = Math.max.apply(null, labels.map(function (l) { return c.measureText(l).width; })) + 14;
    var step = (f.w - lw - 44) / cols, r = Math.min(step * .36, rowH * .22);
    if (step <= 0) return;
    c.textBaseline = "middle";
    labels.forEach(function (l, i) {
      var y = rowH * (i + .5), filled = vals[i] / max * cols * k;
      c.fillStyle = INK; c.textAlign = RTL ? "right" : "left"; c.font = "600 12px " + FONT; c.fillText(l, mx(0), y);
      for (var j = 0; j < cols; j++) {
        var x = mx(lw + step * (j + .5)), part = clamp(filled - j, 0, 1);
        c.fillStyle = PALE; c.beginPath(); c.arc(x, y, r * .45, 0, Math.PI * 2); c.fill();
        if (part > 0) { c.fillStyle = NAVY; c.beginPath(); c.arc(x, y, r * Math.sqrt(part), 0, Math.PI * 2); c.fill(); }
      }
      c.fillStyle = NAVY; c.textAlign = RTL ? "left" : "right"; c.font = "800 12px " + FONT; c.fillText(Math.round(vals[i] * k) + unit, mx(f.w), y);
    });
  }

  /* ---------- overview ---------- */
  function drawVol(k) {
    var cv = $("#c-vol"), f = fitCanvas(cv), c = f.c, mx = mirror(f), n = D.vol.length, lab = 20, top = 4;
    var wide = n === 7 ? 4 : 1, colW = f.w / n, step = Math.min(colW * .78 / wide, (f.h - lab - top) / Math.ceil(26 / wide)), r = step * .36;
    hits["c-vol"] = [];
    c.font = "600 11px " + FONT; c.textAlign = "center";
    for (var i = 0; i < n; i++) {
      var x = colW * (i + .5), dots = Math.round(D.vol[i] / 10), show = Math.round(dots * k);
      c.fillStyle = i === n - 1 ? ORANGE : NAVY; c.beginPath();
      for (var j = 0; j < show; j++) dot(c, mx(x + step * ((j % wide) - (wide - 1) / 2)), f.h - lab - step * (Math.floor(j / wide) + .5), r);
      c.fill();
      if (n === 7 || i % 7 === 0) { c.fillStyle = KICK; c.fillText(n === 7 ? T.days[i] : T.week + " " + (i / 7 + 1), mx(n === 7 ? x : x + colW * 3), f.h - 5); }
      var x0 = mx(colW * i), x1 = mx(colW * (i + 1));
      hits["c-vol"].push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), x: mx(x), y: f.h - lab - step * Math.ceil(dots / wide), t: (n === 7 ? T.days[i] : T.day + " " + (i + 1)) + " · " + D.vol[i] + " " + T.conv });
    }
  }
  function drawHeat(k) {
    var f = fitCanvas($("#c-heat")), c = f.c, mx = mirror(f), lw = AR ? 58 : 34, lab = 18, cw = (f.w - lw) / 24, rh = (f.h - lab) / 7;
    var max = 0; D.heat.forEach(function (row) { row.forEach(function (v) { max = Math.max(max, v); }); });
    var rmax = Math.min(cw, rh) * .46; hits["c-heat"] = [];
    c.font = "600 11px " + FONT; c.textBaseline = "middle";
    for (var d = 0; d < 7; d++) {
      c.fillStyle = KICK; c.textAlign = RTL ? "right" : "left"; c.fillText(T.days[d], mx(0), rh * (d + .5));
      for (var h = 0; h < 24; h++) {
        var v = D.heat[d][h], x = mx(lw + cw * (h + .5)), y = rh * (d + .5), rr = Math.max(1, rmax * Math.sqrt(v / max) * k);
        c.fillStyle = v / max > .82 ? ORANGE : NAVY; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
        hits["c-heat"].push({ x: x, y: y, r: cw / 2, ry: rh / 2, t: T.days[d] + " " + String(h).padStart(2, "0") + ":00 · " + v + " " + T.conv });
      }
    }
    c.textAlign = "center"; c.fillStyle = KICK;
    for (var h2 = 0; h2 < 24; h2 += 3) c.fillText(String(h2).padStart(2, "0") + ":00", mx(lw + cw * (h2 + .5)), f.h - 6);
  }
  function overview(anim) {
    setKpis(["o0", "o1", "o2", "o3"]);
    D.sla.forEach(function (v, i) { $('[data-s="' + i + '"]').textContent = v; $('[data-ok="' + i + '"]').textContent = "✓ " + T.met; });
    legend("l-mix", T.channels, D.mix);
    var go = function (k) { drawVol(k); drawHeat(k); waffle("c-mix", D.mix, k); };
    if (anim) tweenRun(1100, go); else go(1);
  }

  /* ---------- conversations ---------- */
  var chFilter = -1, curRow = null;
  function chips() {
    var box = $("#ch-filter");
    box.innerHTML = [T.ui.all].concat(T.channels).map(function (n, i) { return '<button type="button" aria-pressed="' + (i - 1 === chFilter) + '" data-ch="' + (i - 1) + '">' + esc(n) + "</button>"; }).join("");
    $$("button", box).forEach(function (b) { b.addEventListener("click", function () { chFilter = +b.dataset.ch; chips(); table(); }); });
  }
  function table() {
    var tb = $("#conv-tbl tbody");
    var rows = D.rows.filter(function (r) { return chFilter < 0 || r.ch === chFilter; });
    tb.innerHTML = rows.map(function (r) {
      return '<tr tabindex="0" data-id="' + r.id + '"' + (curRow === r.id ? ' class="on"' : "") + '><td dir="ltr">#' + r.id + "</td><td>" + esc(T.channels[r.ch]) + "</td><td>" + T.langShort[r.lang] +
        "</td><td>" + esc(T.reasons[r.reason]) + "</td><td>" + esc(T.agents[r.agent]) + "</td><td>" + dur(r.first) +
        '</td><td><span class="st st' + r.status + '">' + esc(T.status[r.status]) + "</span></td></tr>";
    }).join("") || '<tr><td colspan="7">' + esc(T.none) + "</td></tr>";
    $$("tr[data-id]", tb).forEach(function (tr) {
      var open = function () { curRow = +tr.dataset.id; $$("tr", tb).forEach(function (o) { o.classList.toggle("on", o === tr); }); viewConv(D.rows.filter(function (r) { return r.id === curRow; })[0]); };
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }
  function viewConv(r) {
    var v = $("#conv-view"), msgs = T.chat[r.reason];
    v.innerHTML = '<div class="cv-head"><b dir="ltr">#' + r.id + "</b><span>" + esc(T.channels[r.ch]) + " · " + esc(T.agents[r.agent]) + "</span></div>" +
      '<div class="cv-msgs">' + msgs.map(function (m) { return '<div class="qb ' + m[0] + '">' + esc(m[1].replace("{n}", String(r.id).slice(2))) + "</div>"; }).join("") + "</div>" +
      '<div class="cv-tags"><span>' + esc(T.ui.tags) + ':</span><span class="tag">' + esc(T.reasons[r.reason]) + '</span><span class="tag">' + esc(T.status[r.status]) + "</span></div>";
  }
  function conversations(anim) {
    setKpis(["c0", "c1", "c2", "c3"]);
    legend("l-lang", T.langs, D.lang);
    if (!$("#ch-filter button")) chips();
    table();
    if (curRow == null) { curRow = D.rows[0].id; table(); viewConv(D.rows[0]); }
    var go = function (k) { waffle("c-lang", D.lang, k); dotBars("c-reason", T.reasons, D.reasons, 30, 15, k, "%"); };
    if (anim) tweenRun(1000, go); else go(1);
  }

  /* ---------- quality ---------- */
  function ring(k) {
    var f = fitCanvas($("#c-ring")), c = f.c, cx = f.w / 2, cy = f.h / 2, R = Math.min(f.w, f.h) / 2 - 8, n = 50;
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (RTL ? -1 : 1) * i / n * Math.PI * 2, on = i / n < D.score / 100 * k;
      c.fillStyle = on ? (i >= n * D.score / 100 - 1 ? ORANGE : NAVY) : PALE;
      c.beginPath(); c.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, on ? 4.2 : 2.6, 0, Math.PI * 2); c.fill();
    }
  }
  function drawTrend(k) {
    var cv = $("#c-trend"), f = fitCanvas(cv), c = f.c, mx = mirror(f), n = D.trend.length, lab = 20, lo = 84, colW = f.w / n;
    var step = Math.min((f.h - lab - 8) / (100 - lo), colW * .5), r = step * .36;
    hits["c-trend"] = [];
    c.font = "600 11px " + FONT; c.textAlign = "center";
    for (var i = 0; i < n; i++) {
      var x = mx(colW * (i + .5)), v = D.trend[i], show = Math.round((v - lo) * k);
      c.fillStyle = PALE; c.beginPath();
      for (var j = show; j < 100 - lo; j++) dot(c, x, f.h - lab - step * (j + .5), r * .4);
      c.fill();
      c.fillStyle = i === n - 1 ? ORANGE : NAVY; c.beginPath();
      for (var q = 0; q < show; q++) dot(c, x, f.h - lab - step * (q + .5), r);
      c.fill();
      var ws = new Date(WEEK_START); ws.setDate(ws.getDate() - 7 * (n - 1 - i));
      if ((n - 1 - i) % 2 === 0) { c.fillStyle = KICK; c.fillText(fmtDate(ws), x, f.h - 5); }
      hits["c-trend"].push({ x0: Math.min(mx(colW * i), mx(colW * (i + 1))), x1: Math.max(mx(colW * i), mx(colW * (i + 1))), x: x, y: f.h - lab - step * (v - lo), t: fmtDate(ws) + " · " + v + "%" });
    }
  }
  function reviews() {
    $("#reviews").innerHTML = T.reviews.map(function (rv) {
      var chk = T.checks.map(function (n, i) { var miss = rv.miss.indexOf(i) > -1; return '<span class="rc' + (miss ? " miss" : "") + '">' + (miss ? "✕ " : "✓ ") + esc(n) + "</span>"; }).join("");
      var nm = T.agents[rv.agent];
      return '<details class="rv-card"><summary><span class="av">' + esc(nm.charAt(0)) + '</span><span class="who"><b>' + esc(nm) + "</b><i>" + esc(T.channels[rv.ch]) + '</i></span><span class="sc' + (rv.score < 90 ? " lo" : "") + '">' + rv.score + "%</span></summary>" +
        "<p>" + esc(rv.text) + '</p><div class="rcs">' + chk + '</div><p class="cn"><b>' + esc(T.ui.reviewer) + ":</b> " + esc(rv.note) + "</p></details>";
    }).join("");
  }
  function quality(anim) {
    $("#qa-score").textContent = D.score + "%";
    $('[data-k="q0"]').textContent = num(D.reviewed); $('[data-k="q1"]').textContent = D.coached;
    if (!$("#reviews details")) reviews();
    var go = function (k) { ring(k); dotBars("c-checks", T.checks, D.qa, 100, 20, k, "%"); drawTrend(k); };
    if (anim) tweenRun(1100, go); else go(1);
  }

  /* ---------- team ---------- */
  function onShift(i, h) { return h >= SHIFTS[i][0] && h < SHIFTS[i][1]; }
  function drawCover(k) {
    var cv = $("#c-cover"), f = fitCanvas(cv), c = f.c, mx = mirror(f), lab = 18, colW = f.w / 24, mid = (f.h - lab) * .5;
    var step = Math.min(colW * .7, mid / 6.5), r = step * .36;
    hits["c-cover"] = [];
    c.strokeStyle = "#E3E6F2"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, mid); c.lineTo(f.w, mid); c.stroke();
    c.font = "600 11px " + FONT; c.textAlign = "center";
    for (var h = 0; h < 24; h++) {
      var x = mx(colW * (h + .5)), on = 0;
      for (var a = 0; a < 6; a++) if (onShift(a, h)) on++;
      var vol = Math.round(D.hourly[h] / 10);
      c.fillStyle = NAVY; c.beginPath();
      for (var j = 0; j < Math.round(on * k); j++) dot(c, x, mid - step * (j + .6), r);
      c.fill();
      c.fillStyle = ORANGE; c.beginPath();
      for (var q = 0; q < Math.round(vol * k); q++) dot(c, x, mid + step * (q + .6), r * .85);
      c.fill();
      if (h % 3 === 0) { c.fillStyle = KICK; c.fillText(String(h).padStart(2, "0") + ":00", x, f.h - 4); }
      hits["c-cover"].push({ x0: Math.min(mx(colW * h), mx(colW * (h + 1))), x1: Math.max(mx(colW * h), mx(colW * (h + 1))), x: x, y: mid - step * (on + .6),
        t: String(h).padStart(2, "0") + ":00 · " + on + " / 6 · " + Math.round(D.hourly[h]) + " " + T.conv });
    }
  }
  function agents() {
    var hour = new Date().getHours(), conv = D.total / 6;
    var share = [1.12, 1.08, .96, 1.02, .9, .92], score = [97, 95, 92, 93, 94, 96];
    $("#agents").innerHTML = T.agents.map(function (nm, i) {
      var on = onShift(i, hour), strip = "";
      for (var h = 0; h < 24; h++) strip += "<i" + (onShift(i, h) ? ' class="w"' : "") + (h === hour ? ' data-now=""' : "") + "></i>";
      var dots = ""; for (var j = 0; j < 10; j++) dots += "<i" + (j < Math.round((score[i] - 85) / 1.5) ? ' class="f"' : "") + "></i>";
      return '<div class="agent"><div class="ag-top"><span class="av">' + esc(nm.charAt(0)) + '</span><b>' + esc(nm) + '</b><span class="pill2' + (on ? " on" : "") + '">' + esc(on ? T.ui.on : T.ui.off) + "</span></div>" +
        '<dl><div><dt>' + esc(T.ui.conv) + "</dt><dd>" + num(Math.round(conv * share[i])) + "</dd></div><div><dt>" + esc(T.ui.score) + "</dt><dd>" + score[i] + '%<span class="sd">' + dots + "</span></dd></div></dl>" +
        '<div class="shift"><span>' + esc(T.ui.shift) + ' <b dir="ltr">' + String(SHIFTS[i][0]).padStart(2, "0") + ":00 – " + String(SHIFTS[i][1] % 24).padStart(2, "0") + ':00</b></span><span class="strip">' + strip + "</span></div></div>";
    }).join("");
    var now = 0; for (var a = 0; a < 6; a++) if (onShift(a, hour)) now++;
    $('[data-k="t1"]').textContent = now;
    $('[data-d="t1"]').textContent = String(hour).padStart(2, "0") + ":00";
  }
  function team(anim) {
    setKpis(["t0", "t2", "t3"]);
    agents();
    if (anim) tweenRun(1000, drawCover); else drawCover(1);
  }

  /* ---------- reports ---------- */
  var curRep = 0;
  function reports() {
    var list = $("#rp-list"), weeks = [];
    for (var i = 0; i < 4; i++) {
      var a = new Date(WEEK_START); a.setDate(a.getDate() - 7 * (i + 1));
      var b = new Date(a); b.setDate(b.getDate() + 6);
      var sent = new Date(b); sent.setDate(sent.getDate() + 1);
      var r = rng(7919 * (i + 3)); r(); var c = 1180 + Math.round(r() * 160), q = [94, 93, 93, 92][i];
      weeks.push({ a: a, b: b, sent: sent, c: c, d: (r() > .4 ? "▲ " : "▼ ") + (1 + Math.round(r() * 6)) + "%", f: dur(96 + Math.round(r() * 20)), q: q, rv: 170 + Math.round(r() * 30), e: 34 + Math.round(r() * 10) });
    }
    list.innerHTML = weeks.map(function (w, i) {
      return '<li><button type="button" aria-pressed="' + (i === curRep) + '" data-i="' + i + '"><b>' + fmtDate(w.a) + " – " + fmtDate(w.b) + "</b><span>" + num(w.c) + " " + esc(T.conv) + " · " + w.q + "%</span><i>" + esc(T.ui.sent) + " " + fmtDate(w.sent) + "</i></button></li>";
    }).join("");
    $$("button", list).forEach(function (b) { b.addEventListener("click", function () { curRep = +b.dataset.i; reports(); }); });
    var w = weeks[curRep], fill = function (s) { return s.replace("{c}", num(w.c)).replace("{d}", w.d).replace("{f}", w.f).replace("{q}", w.q).replace("{r}", w.rv); };
    var slaV = [w.f, w.e + " " + T.min, w.q + "%", "0"];
    $("#rp-doc").innerHTML = '<header><img src="/assets/brand/zameel-mark.svg" alt="" width="28" height="28"><div><span>' + esc(T.ui.sent) + " " + fmtDate(w.sent) + "</span><h3>" + fmtDate(w.a) + " – " + fmtDate(w.b) + "</h3></div></header>" +
      "<h4>" + esc(T.ui.hi) + "</h4><ul>" + T.report.hi.map(function (s) { return "<li>" + esc(fill(s)) + "</li>"; }).join("") + "</ul>" +
      "<h4>" + esc(T.ui.sla) + '</h4><table class="rp-sla">' + T.ui.slas.map(function (s, i) { return "<tr><th scope=\"row\">" + esc(s) + "</th><td>" + slaV[i] + '</td><td class="ok">✓ ' + esc(T.met) + "</td></tr>"; }).join("") + "</table>" +
      "<h4>" + esc(T.ui.issues) + "</h4><ul>" + T.report.issues.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
      "<h4>" + esc(T.ui.actions) + "</h4><ul>" + T.report.actions.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>";
  }

  /* ---------- render + period ---------- */
  var RENDER = { overview: overview, conv: conversations, quality: quality, team: team, reports: function () { reports(); } };
  function current() { var i = 0; tabs.forEach(function (t, j) { if (t.getAttribute("aria-selected") === "true") i = j; }); return IDS[i]; }
  function render(id, anim) { RENDER[id](anim && !calm); }
  $$(".dseg button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".dseg button").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      D = makeData(b.dataset.p); drawn = {}; drawn[current()] = true; render(current(), true);
    });
  });
  bindTip("c-vol", function (h, x) { return x >= h.x0 && x < h.x1; });
  bindTip("c-heat", function (h, x, y) { return Math.abs(x - h.x) < h.r && Math.abs(y - h.y) < h.ry; });
  bindTip("c-trend", function (h, x) { return x >= h.x0 && x < h.x1; });
  bindTip("c-cover", function (h, x) { return x >= h.x0 && x < h.x1; });
  var rt = 0;
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { render(current(), false); }, 120); });

  var start = Math.max(0, IDS.indexOf(location.hash.slice(1)));
  var go = function () { show(start, false, true); };
  if (document.fonts) document.fonts.ready.then(go); else go();
})();
