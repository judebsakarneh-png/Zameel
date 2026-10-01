/* Zameel site behaviour: language switch, chat replay, pinned logo scene,
   service tabs, before/after slider, track-record bars, pricing calculator, contact form. */
(function () {
  "use strict";

  var AR = window.ZAMEEL_AR || {};

  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-t]"));
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll("[data-ta]"));
  var EN = {};
  nodes.forEach(function (n) {
    var k = n.getAttribute("data-t");
    if (!(k in EN)) EN[k] = n.hasAttribute("data-html") ? n.innerHTML : n.textContent;
  });
  EN.emailErr = "Enter a valid email, like name@company.com";
  EN.nameErr = "Enter your name.";
  EN.sendErr = "That didn't send. Email us directly at info@zameel.cx";
  EN.mailOpen = "Your email app should open with these details. If it doesn't, email info@zameel.cx";
  EN.was = "was"; EN.seatsWord = "seats"; EN.seatsWordMany = "seats";
  EN.langBtn = "العربية"; EN.langLabel = "التبديل إلى العربية";
  ariaNodes.forEach(function (n) { var k = n.getAttribute("data-ta"); if (!(k in EN)) EN[k] = n.getAttribute("aria-label"); });

  var cur = "en";
  function dict() { return cur === "ar" ? AR : EN; }

  /* ---------- Language ---------- */
  var langBtn = document.getElementById("lang-toggle");
  function setLang(l) {
    cur = l;
    var d = dict();
    root.lang = l; root.dir = l === "ar" ? "rtl" : "ltr";
    nodes.forEach(function (n) {
      var k = n.getAttribute("data-t");
      if (d[k] == null) return;
      if (n.hasAttribute("data-html")) n.innerHTML = d[k]; else n.textContent = d[k];
    });
    ariaNodes.forEach(function (n) { var k = n.getAttribute("data-ta"); if (d[k] != null) n.setAttribute("aria-label", d[k]); });
    langBtn.textContent = d.langBtn;
    langBtn.lang = l === "ar" ? "en" : "ar";
    langBtn.setAttribute("aria-label", d.langLabel);
    var e = document.getElementById("e-email"); if (e && e.textContent) e.textContent = d.emailErr;
    drawScrub(); drawCalc();
    if (typeof measureOrbit === "function") requestAnimationFrame(measureOrbit);
    try { localStorage.setItem("zameel-lang", l); } catch (_) {}
  }
  // On the live site the switch is a link between / and /ar/ (each page is fully translated in its HTML).
  // A <button> switch translates in place (used by the single-file preview).
  var inPlace = langBtn.tagName === "BUTTON";
  if (inPlace) langBtn.addEventListener("click", function () { setLang(cur === "en" ? "ar" : "en"); });

  /* ---------- Nav shadow ---------- */
  var nav = document.getElementById("nav");
  function onNav() { nav.classList.toggle("scrolled", window.scrollY > 8); }

  /* ---------- Before / after slider ---------- */
  var M = [{ a: 730, b: 60, kind: "time" }, { a: 38, b: 100, kind: "pct" }, { a: 0, b: 100, kind: "pct" }];
  var scrub = document.getElementById("scrub");
  function fmt(m, v) {
    v = Math.round(v);
    if (m.kind === "pct") return v + "%";
    var h = Math.floor(v / 60), mi = v % 60;
    if (cur === "ar") return h ? (mi ? h + "س " + mi + "د" : h + " س") : (mi + " د");
    return h ? (mi ? h + "h " + mi + "m" : h + "h") : (mi + " min");
  }
  function drawScrub() {
    if (!scrub) return;
    var t = scrub.value / 100, d = dict();
    scrub.style.setProperty("--p", scrub.value + "%");
    M.forEach(function (m, i) {
      document.querySelector('[data-m="' + i + '"]').textContent = fmt(m, m.a + (m.b - m.a) * t);
      document.querySelector('[data-f="' + i + '"]').innerHTML = t > 0.02 ? (d.was + " <s>" + fmt(m, m.a) + "</s>") : "&nbsp;";
    });
    document.getElementById("lb-before").classList.toggle("on", t < 0.5);
    document.getElementById("lb-after").classList.toggle("on", t >= 0.5);
  }
  if (scrub) scrub.addEventListener("input", drawScrub);

  /* ---------- Pricing calculator ---------- */
  var seatCount = document.getElementById("seat-count");
  var seatRange = document.getElementById("seat-range");
  var MIN = 3, MAX = 60;
  function money(n) { return "$" + n.toLocaleString("en-US"); }
  function seatsVal() { var n = parseInt(seatCount.value, 10); return isNaN(n) ? MIN : Math.min(MAX, Math.max(MIN, n)); }
  function drawCalc() {
    if (!seatCount) return;
    var n = seatsVal();
    var rate = parseInt((document.querySelector('input[name="seat"]:checked') || {}).value || 1600, 10);
    var d = dict();
    document.getElementById("out-month").textContent = money(n * rate);
    var word = cur === "ar" ? (n > 10 ? d.seatsWordMany : d.seatsWord) : d.seatsWord;
    document.getElementById("out-rate").textContent = n + " " + word + " × " + money(rate);
    seatRange.value = Math.min(n, +seatRange.max);
    seatRange.style.setProperty("--p", ((Math.min(n, +seatRange.max) - MIN) / (+seatRange.max - MIN) * 100) + "%");
  }
  function setSeats(n) { seatCount.value = Math.min(MAX, Math.max(MIN, n)); drawCalc(); }
  if (seatCount) {
    document.getElementById("seat-dec").addEventListener("click", function () { setSeats(seatsVal() - 1); });
    document.getElementById("seat-inc").addEventListener("click", function () { setSeats(seatsVal() + 1); });
    seatRange.addEventListener("input", function () { setSeats(+seatRange.value); });
    seatCount.addEventListener("input", drawCalc);
    seatCount.addEventListener("blur", function () { setSeats(seatsVal()); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="seat"]'), function (r) { r.addEventListener("change", drawCalc); });
  }

  /* ---------- Service tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(i); });
    t.addEventListener("keydown", function (e) {
      var rtl = root.dir === "rtl", next = rtl ? "ArrowLeft" : "ArrowRight", prev = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === next) { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      if (e.key === prev) { e.preventDefault(); selectTab((i - 1 + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------- Pinned logo scene: services slide out from under the circle ---------- */
  var orbit = document.querySelector(".orbit");
  var track = document.getElementById("orbit-track");
  var stage = document.getElementById("orbit-stage");
  var core = document.getElementById("orb-core");
  var ring = document.getElementById("ring-fg");
  var items = Array.prototype.slice.call(document.querySelectorAll(".orb-item"));
  var deltas = [];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
  function canPin() { return !reduce && window.innerHeight >= 540; }
  function measureOrbit() {
    if (!orbit) return;
    orbit.classList.toggle("pinned", canPin());
    items.forEach(function (it) { it.style.transform = "none"; });
    var c = core.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    deltas = items.map(function (it) {
      var r = it.getBoundingClientRect();
      return [cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)];
    });
    // If the stage does not fit the screen, show everything at rest instead of pinning.
    if (orbit.classList.contains("pinned") && stage.scrollHeight > stage.clientHeight + 4) orbit.classList.remove("pinned");
    updateOrbit();
  }
  window.measureOrbit = measureOrbit;
  function updateOrbit() {
    if (!orbit) return;
    if (!orbit.classList.contains("pinned")) {
      items.forEach(function (it) { it.style.transform = ""; it.style.opacity = ""; });
      ring.style.strokeDashoffset = "0"; core.style.transform = "";
      return;
    }
    var r = track.getBoundingClientRect();
    var total = Math.max(1, track.offsetHeight - stage.offsetHeight);
    var p = clamp(-r.top / total, 0, 1);
    ring.style.strokeDashoffset = String(100 * (1 - clamp(p / 0.82, 0, 1)));
    core.style.transform = "scale(" + (0.9 + 0.1 * easeOut(clamp(p / 0.12, 0, 1))) + ")";
    items.forEach(function (it, k) {
      var i = +it.getAttribute("data-i");
      var e = easeOut(clamp((p - 0.06 - i * 0.1) / 0.3, 0, 1));
      var d = deltas[k] || [0, 0];
      it.style.transform = "translate(" + (d[0] * (1 - e)).toFixed(1) + "px," + (d[1] * (1 - e)).toFixed(1) + "px) scale(" + (0.35 + 0.65 * e).toFixed(3) + ")";
      it.style.opacity = e < 0.02 ? "0" : String(Math.min(1, e * 1.6));
    });
  }

  /* ---------- Steps rail fill ---------- */
  var rail = document.getElementById("rail");
  function fillRail() {
    if (!rail) return;
    var t0 = null;
    rail.style.setProperty("--fill", "0%");
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1400);
      rail.style.setProperty("--fill", (easeOut(k) * 100).toFixed(1) + "%");
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll / resize loop ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onNav(); updateOrbit(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  var rto;
  window.addEventListener("resize", function () { clearTimeout(rto); rto = setTimeout(measureOrbit, 120); });

  /* ---------- In-view animations (content stays visible if this never runs) ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var bars = document.getElementById("bars");
    bars.classList.add("pre");
    var playedScrub = false;
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".sec-head, .tcard, .calc, .record-copy, .qa, .contact-copy, #lead"));
    revealEls.forEach(function (el, i) { el.classList.add("rv"); el.style.transitionDelay = (el.classList.contains("tcard") ? (i % 4) * 80 : 0) + "ms"; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        if (el === bars) { bars.classList.remove("pre"); return; }
        if (el === rail) { fillRail(); return; }
        if (el.classList.contains("metrics") && !playedScrub) {
          playedScrub = true;
          var t0 = null; scrub.value = 0; drawScrub();
          setTimeout(function () {
            requestAnimationFrame(function step(ts) {
              if (!t0) t0 = ts;
              var k = Math.min(1, (ts - t0) / 1600);
              scrub.value = Math.round(easeOut(k) * 100); drawScrub();
              if (k < 1) requestAnimationFrame(step);
            });
          }, 250);
          return;
        }
        el.classList.add("in");
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    io.observe(bars); io.observe(rail); io.observe(document.querySelector(".metrics"));
  }

  /* ---------- Chat replay ---------- */
  var thread = document.getElementById("thread");
  if (!reduce && thread) {
    var msgs = Array.prototype.slice.call(thread.children);
    msgs.forEach(function (m, i) { if (i > 0) m.hidden = true; });
    thread.classList.add("js-anim");
    var mi = 1;
    (function next() {
      if (mi >= msgs.length) return;
      var m = msgs[mi], out = m.classList.contains("out"), typing = null;
      if (out) { typing = document.createElement("div"); typing.className = "typing"; typing.setAttribute("aria-hidden", "true"); typing.innerHTML = "<i></i><i></i><i></i>"; thread.insertBefore(typing, m); }
      setTimeout(function () { if (typing) typing.remove(); m.hidden = false; mi++; next(); }, out ? 1300 : 800);
    })();
  }

  /* ---------- Contact form ----------
     data-endpoint="/api/contact" posts JSON to the Vercel function in api/contact.js, which emails via Resend.
     With an empty data-endpoint, the form opens the visitor's email app addressed to info@zameel.cx. */
  var form = document.getElementById("lead");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var d = dict();
    var name = document.getElementById("f-name"), em = document.getElementById("f-email"), err = document.getElementById("e-email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
      err.textContent = d.emailErr; em.setAttribute("aria-invalid", "true"); em.focus(); return;
    }
    err.textContent = ""; em.removeAttribute("aria-invalid");
    if (!name.value.trim()) { err.textContent = d.nameErr; name.focus(); return; }
    var done = document.getElementById("done");
    var endpoint = form.getAttribute("data-endpoint");
    if (endpoint) {
      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      payload.lang = cur;
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(endpoint, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done.textContent = d.done; done.hidden = false; form.reset(); })
        .catch(function () { done.textContent = d.sendErr; done.hidden = false; })
        .then(function () { btn.disabled = false; });
    } else {
      var body = ["Name: " + name.value, "Company: " + document.getElementById("f-company").value, "Email: " + em.value,
        "WhatsApp: " + document.getElementById("f-wa").value, "Need: " + document.getElementById("f-need").value].join("\n");
      done.textContent = d.mailOpen; done.hidden = false;
      window.location.href = "mailto:info@zameel.cx?subject=" + encodeURIComponent("Discovery call request") + "&body=" + encodeURIComponent(body);
    }
  });

  /* ---------- Start ---------- */
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
  if (inPlace) {
    var start = "en";
    try { start = localStorage.getItem("zameel-lang") || "en"; } catch (_) {}
    if (location.hash === "#ar") start = "ar";
    setLang(start);
  } else {
    cur = root.lang === "ar" ? "ar" : "en";
    drawScrub(); drawCalc();
  }
  onNav();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureOrbit);
  window.addEventListener("load", measureOrbit);
  measureOrbit();
})();
