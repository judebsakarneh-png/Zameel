/* Zameel v2: behaviour shared by every page.
   Nav shadow and reading progress, animated FAQ, the dotted mark in the footer, the year,
   and (on pages other than the homepage) small halftone agents and scroll reveals. */
(function () {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var home = !!$("#hero.hero");

  /* ---------- nav ---------- */
  var nav = $("#nav"), prog = $("#nav .progress");
  function onScroll() {
    if (!nav) return;
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("scrolled", y > 8);
    if (prog) prog.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- faq: animated, one open at a time ---------- */
  $$(".qa").forEach(function (qa) {
    $$("details", qa).forEach(function (d) {
      var s = $("summary", d), body = $(".ans", d);
      s.addEventListener("click", function (e) {
        if (calm || !body) return;
        e.preventDefault();
        if (d.open) {
          var h = body.offsetHeight;
          body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "cubic-bezier(.65,0,.35,1)" }).onfinish = function () { d.open = false; };
        } else {
          $$("details[open]", qa).forEach(function (o) { if (o !== d) o.open = false; });
          d.open = true;
          var h2 = body.offsetHeight;
          body.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" });
        }
      });
    });
  });

  /* ---------- reveals (the homepage runs its own scenes) ---------- */
  if (!home && !calm && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove("armed"); io.unobserve(e.target); } });
    }, { threshold: .15 });
    $$(".rv").forEach(function (el) { if (el.getBoundingClientRect().top > innerHeight * .9) { el.classList.add("armed"); io.observe(el); } });
  }

  /* ---------- small halftone agents: <canvas data-agent="lookX" data-mode="light"> ---------- */
  var agents = [], pointer = null, raf = 0;
  function tick(now) {
    raf = 0;
    var any = false;
    agents.forEach(function (a) {
      if (!a.visible) return;
      any = true;
      var tx = a.base, ty = 0;
      if (pointer && now - pointer.t < 4000) {
        var r = a.cv.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, (pointer.x - (r.left + r.width / 2)) / (innerWidth * .4)));
        ty = Math.max(-1, Math.min(1, (pointer.y - (r.top + r.height * .42)) / (innerHeight * .45)));
      } else if (!pointer) { tx += .25 * Math.sin(now / 1900); ty = .15 * Math.sin(now / 2600); }
      a.p.lookX += (tx - a.p.lookX) * .12; a.p.lookY += (ty - a.p.lookY) * .12;
      if (now > a.nextBlink) { a.blinkAt = now; a.nextBlink = now + 2600 + Math.random() * 3200; }
      var b = (now - a.blinkAt) / 160;
      a.p.blink = b > 0 && b < 1 ? Math.sin(Math.PI * b) : 0;
      a.render();
    });
    if (any && !calm) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf && !calm) raf = requestAnimationFrame(tick); }
  if (!home && window.ZameelAgent) {
    $$("canvas[data-agent]").forEach(function (cv) {
      var a = new ZameelAgent(cv, { mode: cv.dataset.mode || "dark", spacing: +(cv.dataset.spacing || 7), view: cv.dataset.view ? JSON.parse(cv.dataset.view) : null });
      a.base = +cv.dataset.agent || 0; a.p.lookX = a.base; a.p.smile = 1.2;
      a.nextBlink = performance.now() + 1200; a.blinkAt = -1; a.visible = false;
      agents.push(a);
      new IntersectionObserver(function (es) { a.visible = es[0].isIntersecting; if (a.visible) { a.resize(); a.render(); kick(); } }).observe(cv);
    });
    addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") { pointer = { x: e.clientX, y: e.clientY, t: performance.now() }; kick(); } }, { passive: true });
    addEventListener("resize", function () { agents.forEach(function (a) { a.resize(); a.render(); }); });
    var ready = ZameelAgent.ready || Promise.resolve();
    Promise.all([ready, document.fonts ? document.fonts.ready : 0]).then(function () { agents.forEach(function (a) { a.resize(); a.last = ""; a.render(); }); kick(); });
  }

  /* ---------- footer: the Zameel mark as a field of dots ---------- */
  var fcv = $("#foot-dots");
  if (fcv) {
    var fimg = new Image(), fdots = [], fp = null, rtl = document.documentElement.dir === "rtl";
    fimg.src = fcv.dataset.mark;
    var fit = function () {
      var r = fcv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      fcv.width = Math.max(1, Math.round(r.width * dpr)); fcv.height = Math.max(1, Math.round(r.height * dpr));
      var c = fcv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { c: c, w: r.width, h: r.height };
    };
    var drawFoot = function () {
      var f = fit(), c = f.c;
      fdots.forEach(function (p) {
        var boost = 0;
        if (fp) { var dx = p.x - fp.x, dy = p.y - fp.y; boost = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 160); }
        c.globalAlpha = .1 + boost * .35; c.fillStyle = p.o ? "#F66747" : "#FDFBFC";
        c.beginPath(); c.arc(p.x, p.y, p.r * (1 + boost * .7), 0, Math.PI * 2); c.fill();
      });
      c.globalAlpha = 1;
    };
    var buildFoot = function () {
      var f = fit(), size = Math.min(Math.max(f.h * .95, 240), 420), src = document.createElement("canvas"), sp = 10;
      src.width = Math.ceil(size); src.height = Math.ceil(size);
      var g = src.getContext("2d");
      g.drawImage(fimg, 0, 0, size, size * 175 / 173);
      var d = g.getImageData(0, 0, src.width, src.height).data, ox = f.w * (rtl ? .44 : .56) - size / 2, oy = (f.h - size) / 2;
      fdots = [];
      for (var y = sp / 2, row = 0; y < src.height; y += sp * .866, row++) for (var x = (row & 1) ? sp : sp / 2; x < src.width; x += sp) {
        var i = ((y | 0) * src.width + (x | 0)) * 4, a = d[i + 3] / 255;
        if (a > .1) fdots.push({ x: ox + x, y: oy + y, r: 1 + 3.6 * a, o: d[i] > 200 });
      }
      drawFoot();
    };
    fimg.onload = buildFoot;
    var footEl = fcv.parentNode;
    if (!calm) {
      footEl.addEventListener("pointermove", function (e) { var r = fcv.getBoundingClientRect(); fp = { x: e.clientX - r.left, y: e.clientY - r.top }; requestAnimationFrame(drawFoot); });
      footEl.addEventListener("pointerleave", function () { fp = null; requestAnimationFrame(drawFoot); });
    }
    addEventListener("resize", function () { if (fimg.complete) buildFoot(); });
  }

  var yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
