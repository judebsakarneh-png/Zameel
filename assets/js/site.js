/* Zameel v2 page behaviour. Every animation starts from content that is already readable;
   sections below the fold are "armed" at load and play once when they scroll into view. */
(function () {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var AR = document.documentElement.lang === "ar", RTL = document.documentElement.dir === "rtl";
  var L = function (en, ar) { return AR ? ar : en; };
  var FONT = AR ? "Tajawal, Inter, sans-serif" : "Inter, sans-serif";

  /* ---------- nav: current section (shadow and progress live in common.js) ---------- */
  var curScene = "";
  var scenes = $$("[data-scene]"), links = $$(".nav-links a");
  function onScroll() {
    var cur = scenes[0];
    scenes.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s; });
    if (cur && curScene !== cur.id) {
      curScene = cur.id;
      links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + (cur.dataset.nav || cur.id)); });
    }
    railFill();
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- agents (halftone characters) ---------- */
  var agents = [], pointer = null, raf = 0;
  function addAgent(canvas, opts) {
    if (!canvas || !window.ZameelAgent) return null;
    var a = new ZameelAgent(canvas, opts);
    a.base = { lookX: opts.lookX || 0, lookY: opts.lookY || 0, smile: opts.smile || 1.15, tilt: 0 };
    a.t = Object.assign({}, a.base);
    a.nextBlink = performance.now() + 900 + Math.random() * 2500;
    a.blinkAt = -1; a.pulseAt = -1; a.visible = false; a.follow = opts.follow !== false;
    Object.assign(a.p, a.base);
    agents.push(a);
    new IntersectionObserver(function (es) { a.visible = es[0].isIntersecting; if (a.visible) { a.resize(); a.render(); kick(); } }).observe(canvas);
    return a;
  }
  function kick() { if (!raf && !calm) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    var any = false;
    agents.forEach(function (a) {
      if (!a.visible) return;
      any = true;
      var tx = a.base.lookX, ty = a.base.lookY;
      if (a.follow && pointer && now - pointer.t < 4000) {
        var r = a.cv.getBoundingClientRect();
        tx = clamp((pointer.x - (r.left + r.width / 2)) / (innerWidth * .4), -1, 1);
        ty = clamp((pointer.y - (r.top + r.height * .42)) / (innerHeight * .45), -1, 1);
      } else if (!pointer) {
        tx += .25 * Math.sin(now / 1900 + a.sp); ty += .15 * Math.sin(now / 2600);
      }
      a.p.lookX += (tx - a.p.lookX) * .12;
      a.p.lookY += (ty - a.p.lookY) * .12;
      a.p.smile += (a.t.smile - a.p.smile) * .1;
      var tilt = a.pulseAt > 0 ? -.09 * Math.sin(Math.PI * clamp((now - a.pulseAt) / 950, 0, 1)) : 0;
      a.p.tilt += (tilt - a.p.tilt) * .25;
      if (now > a.nextBlink) { a.blinkAt = now; a.nextBlink = now + 2600 + Math.random() * 3200; }
      var b = (now - a.blinkAt) / 160;
      a.p.blink = b > 0 && b < 1 ? Math.sin(Math.PI * b) : 0;
      a.render();
    });
    if (any) raf = requestAnimationFrame(tick);
  }
  addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") { pointer = { x: e.clientX, y: e.clientY, t: performance.now() }; kick(); } }, { passive: true });
  addEventListener("resize", function () { agents.forEach(function (a) { a.resize(); a.render(); }); });
  function hoverSmile(el, a) {
    if (!el || !a) return;
    el.addEventListener("pointerenter", function () { a.t.smile = 1.35; a.pulseAt = performance.now(); kick(); });
    el.addEventListener("pointerleave", function () { a.t.smile = a.base.smile; kick(); });
  }

  /* ---------- scene arming ---------- */
  var plays = {};
  function arm() {
    if (calm) return;
    scenes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top > innerHeight * .85) s.classList.add("armed");
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = e.target; io.unobserve(s);
        var wasArmed = s.classList.contains("armed");
        requestAnimationFrame(function () {
          var pl = $$(".cards, .ggrid, .days7", s);
          pl.forEach(function (el) { el.classList.add("play"); });
          setTimeout(function () { pl.forEach(function (el) { el.classList.remove("play"); }); }, 1600);
          s.classList.remove("armed");
          if (wasArmed && plays[s.id]) plays[s.id]();
        });
      });
    }, { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    scenes.forEach(function (s) { io.observe(s); });
  }

  /* ---------- hero ---------- */
  var heroAgent = addAgent($("#hero-agent"), { spacing: 7, lookX: -.3, smile: 1.2 });
  hoverSmile($(".hero-stage"), heroAgent);
  if (!calm) {
    var hero = $("#hero");
    hero.classList.add("armed");
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      hero.classList.remove("armed");
      setTimeout(function () { if (heroAgent) { heroAgent.t.smile = 1.3; heroAgent.pulseAt = performance.now(); kick(); } }, 900);
    }); });
  }

  /* ---------- phone chat ---------- */
  var msgs = $("#msgs"), askBtns = $$(".ask button");
  // On the Arabic page the "other language" bubbles are English, so `alt` marks them.
  var REPLIES = AR ? {
    refund: { q: "هل يمكنني استرجاع مبلغ منتج وصل تالفًا؟", a: "نعم. أرسلوا صورة للمنتج وسأبدأ الاسترجاع الآن." },
    invoice: { q: "I need an invoice for my last order.", a: "Of course, I've just sent the invoice to your email.", alt: true },
    hours: { q: "هل أنتم متاحون هذا المساء؟", a: "نعم، نحن هنا طوال المساء. كيف يمكنني مساعدتكم؟" },
  } : {
    refund: { q: "Can I get a refund on a damaged item?", a: "Yes. Send a photo of the item and I'll start the refund now." },
    invoice: { q: "أحتاج فاتورة لطلبي الأخير", a: "أكيد، أرسلت الفاتورة إلى بريدك الآن.", alt: true },
    hours: { q: "Are you open this evening?", a: "Yes, we're here all evening. How can I help?" },
  };
  var ALT = AR ? { cls: "en", lang: "en", dir: "ltr" } : { cls: "ar", lang: "ar", dir: "rtl" };
  var clock = 4;
  function stamp() { clock++; return "10:" + String(clock).padStart(2, "0"); }
  function bubble(text, who, alt) {
    var b = document.createElement("div");
    b.className = "bub " + who + (alt ? " " + ALT.cls : "");
    if (alt) { b.lang = ALT.lang; b.dir = ALT.dir; }
    b.textContent = text;
    var sm = document.createElement("small"); sm.textContent = stamp() + (who === "a" ? " ✓✓" : ""); b.appendChild(sm);
    msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight;
  }
  async function typing(ms) {
    var t = document.createElement("div"); t.className = "typing"; t.setAttribute("aria-label", L("Agent is typing", "الموظف يكتب"));
    t.innerHTML = "<i></i><i></i><i></i>"; msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight;
    await wait(ms); t.remove();
  }
  var chatBusy = false;
  function lockAsk(on) { chatBusy = on; askBtns.forEach(function (b) { b.disabled = on; }); }
  plays.team = async function () {
    lockAsk(true); msgs.innerHTML = ""; clock = 1;
    var seq = $$("template#chat-start")[0].content.children;
    await wait(500);
    for (var i = 0; i < seq.length; i++) {
      var m = seq[i];
      if (m.classList.contains("a")) await typing(900);
      bubble(m.firstChild.textContent, m.classList.contains("a") ? "a" : "c", m.classList.contains(ALT.cls));
      await wait(500);
    }
    lockAsk(false);
  };
  askBtns.forEach(function (b) {
    b.addEventListener("click", async function () {
      if (chatBusy) return;
      var r = REPLIES[b.dataset.q]; lockAsk(true);
      bubble(r.q, "c", r.alt);
      await wait(calm ? 0 : 350);
      if (!calm) await typing(1000);
      bubble(r.a, "a", r.alt);
      lockAsk(false);
    });
  });
  msgs.scrollTop = msgs.scrollHeight;
  var teamAgent = addAgent($("#team-agent"), { spacing: 9, lookX: .9, lookY: -.2, smile: 1.15 });

  /* ---------- handled grid ---------- */
  var avatar = addAgent($("#am-agent"), { spacing: 12, view: { x: .5, y: .64, s: .854 }, smile: 1.1, lookX: .2, follow: true });
  var gridRun = 0;
  plays.handled = async function () {
    var run = ++gridRun, cnt = $("#cnt");
    var rows = $$("#g1 .pill"), boxes = $$("#g3 .box"), chips = $$("#g4 .chip"), appr = $("#appr"), sent = $("#sent"), bar = $("#wk");
    rows.concat(boxes, chips).forEach(function (e) { e.classList.add("off"); });
    appr.style.opacity = 0; appr.style.transform = "translateY(10px)"; sent.style.opacity = 0;
    cnt.classList.remove("done"); cnt.textContent = L("Open · ", "مفتوحة · ") + 18; bar.style.transition = "none"; bar.style.setProperty("--w", 0);
    await wait(700); if (run !== gridRun) return;
    bar.style.transition = "transform 3s linear"; bar.style.setProperty("--w", 1);
    var steps = [[rows[0], 0], [boxes[0], 100], [chips[0], 200], [rows[1], 400], [boxes[1], 500], [chips[1], 600], [rows[2], 800], [boxes[2], 900], [chips[2], 1000], [boxes[3], 1300], [chips[3], 1200]];
    steps.forEach(function (s) { setTimeout(function () { if (run === gridRun) s[0].classList.remove("off"); }, s[1]); });
    setTimeout(function () { if (run !== gridRun) return; appr.style.opacity = 1; appr.style.transform = "none"; }, 1700);
    var t0 = performance.now() + 1500;
    (function count(now) {
      if (run !== gridRun) return;
      var k = clamp((now - t0) / 700, 0, 1), n = Math.round(18 * (1 - k));
      if (k < 1) { cnt.textContent = L("Open · ", "مفتوحة · ") + n; requestAnimationFrame(count); }
      else { cnt.textContent = L("All caught up ✓", "لا شيء معلّق ✓"); cnt.classList.add("done"); }
    })(performance.now());
    setTimeout(function () { if (run === gridRun) { sent.style.opacity = 1; if (avatar) { avatar.t.smile = 1.35; avatar.pulseAt = performance.now(); kick(); } } }, 3100);
  };
  $("#replay").addEventListener("click", function () { if (calm) return; plays.handled(); });
  $$("#g1 .pill").forEach(function (p) { p.addEventListener("click", function () { p.classList.toggle("off"); }); });

  /* ---------- service tabs ---------- */
  var tabs = $$('#tabs [role="tab"]'), tabList = $("#tabs"), ink = document.createElement("span");
  ink.className = "ink"; ink.setAttribute("aria-hidden", "true"); tabList.prepend(ink);
  var curTab = 0;
  function moveInk() { var b = tabs[curTab]; ink.style.width = b.offsetWidth + "px"; ink.style.height = b.offsetHeight + "px"; ink.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)"; }
  function select(i, focus) {
    curTab = i;
    tabs.forEach(function (t, j) {
      var on = j === i; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      var pn = $("#" + t.getAttribute("aria-controls"));
      pn.classList.toggle("on", on); pn.inert = !on; pn.setAttribute("aria-hidden", !on);
    });
    if (focus) tabs[i].focus();
    moveInk();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(i); });
    t.addEventListener("keydown", function (e) {
      var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
      if (e.key === "Home") { e.preventDefault(); select(0, true); }
      if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
  addEventListener("resize", placeInk);
  function placeInk() { ink.classList.add("still"); moveInk(); ink.offsetWidth; ink.classList.remove("still"); }
  if (document.fonts) document.fonts.ready.then(placeInk);
  select(0); placeInk();

  /* ---------- standard: typical desk vs Zameel ---------- */
  var M = [{ a: 730, b: 60, kind: "time" }, { a: 38, b: 100, kind: "pct" }, { a: 0, b: 100, kind: "pct" }];
  var range = $("#scrub"), segB = $$(".seg button"), seg = $(".seg");
  function fmt(m, v) {
    v = Math.round(v);
    if (m.kind === "pct") return v + "%";
    var h = Math.floor(v / 60), mi = v % 60;
    if (AR) return h ? (mi ? h + " س " + mi + " د" : (h === 1 ? "ساعة" : h + " ساعات")) : mi + " دقيقة";
    return h ? (mi ? h + "h " + mi + "m" : h + "h") : mi + " min";
  }
  function drawScrub() {
    var t = range.value / 100;
    range.style.setProperty("--p", range.value + "%");
    range.setAttribute("aria-valuetext", t < .5 ? L("Typical desk", "المكتب المعتاد") : L("With Zameel", "مع زميل"));
    M.forEach(function (m, i) {
      $('[data-m="' + i + '"]').textContent = fmt(m, m.a + (m.b - m.a) * t);
      $('[data-f="' + i + '"]').innerHTML = t > .02 ? L("Typical desk: ", "المكتب المعتاد: ") + "<s>" + fmt(m, m.a) + "</s>" : "&nbsp;";
    });
    var after = t >= .5;
    seg.style.setProperty("--k", after ? 1 : 0);
    segB[0].setAttribute("aria-pressed", !after); segB[1].setAttribute("aria-pressed", after);
  }
  var tween = 0;
  function animateTo(to, ms) {
    var from = +range.value, t0 = performance.now(), id = ++tween;
    if (calm) { range.value = to; drawScrub(); return; }
    (function f(now) {
      if (id !== tween) return;
      var k = clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - k, 3);
      range.value = Math.round(from + (to - from) * e); drawScrub();
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  range.addEventListener("input", function () { tween++; drawScrub(); });
  segB.forEach(function (b, i) { b.addEventListener("click", function () { animateTo(i ? 100 : 0, 700); }); });
  plays.standard = function () { range.value = 0; drawScrub(); setTimeout(function () { animateTo(100, 1600); }, 500); };
  drawScrub();

  /* ---------- steps rail fills as you read ---------- */
  var rail = $("#rail"), stepEls = $$("#rail .step");
  function railFill() {
    if (!rail || calm) return;
    var r = rail.getBoundingClientRect(), vertical = innerWidth <= 760;
    var k = clamp((innerHeight * .75 - r.top) / (r.height + innerHeight * .25), 0, 1);
    rail.style.setProperty("--fill", k.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle("lit", k >= (vertical ? i / stepEls.length : i / 2.6) + .02); });
  }

  /* ---------- together ---------- */
  var togAgent = addAgent($("#tog-agent"), { mode: "light", spacing: 7, lookX: -1, lookY: -.15, smile: 1.3 });
  hoverSmile($(".tog-stage"), togAgent);
  plays.together = function () { setTimeout(function () { if (togAgent) { togAgent.pulseAt = performance.now(); kick(); } }, 1900); };

  /* ---------- end card ---------- */
  var endAgent = addAgent($("#end-agent"), { spacing: 9, smile: 1.3 });

  /* ---------- form ---------- */
  var form = $("#lead");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var email = $("#f-email"), name = $("#f-name"), err = $("#e-email"), done = $("#done");
    err.textContent = "";
    if (!name.value.trim()) { name.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { err.textContent = L("Enter a work email like name@company.com.", "اكتبوا بريدًا إلكترونيًا للعمل، مثل name@company.com"); email.focus(); return; }
    if ($("#f-website").value) return;
    var endpoint = form.getAttribute("data-endpoint"), btn = $("button[type=submit]", form);
    var show = function (msg) { done.textContent = msg; done.hidden = false; };
    var thanks = L("Thank you. A senior manager will reply within one working day.", "شكرًا لكم. سيرد عليكم أحد كبار المدراء خلال يوم عمل واحد.");
    if (!endpoint) { show(thanks); form.reset(); return; }
    var payload = {}; new FormData(form).forEach(function (v, k) { payload[k] = v; }); payload.lang = AR ? "ar" : "en";
    btn.disabled = true;
    fetch(endpoint, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); show(thanks); form.reset(); })
      .catch(function () { show(L("That didn't send. Please email info@zameel.cx and we'll reply within one working day.", "تعذّر الإرسال. راسلونا على info@zameel.cx وسنرد خلال يوم عمل واحد.")); })
      .then(function () { btn.disabled = false; });
  });

  /* ---------- canvas helpers ---------- */
  function fitCanvas(cv) {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c: c, w: r.width, h: r.height };
  }
  function tweenRun(ms, fn, done) {
    if (calm) { fn(1); if (done) done(); return; }
    var t0 = performance.now();
    (function f(now) { var k = clamp((now - t0) / ms, 0, 1); fn(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(f); else if (done) done(); })(t0);
  }
  var NAVY = "#0E1D70", ORANGE = "#F66747", PALE = "#D5D9EC", KICK = "#6A7096";

  /* ---------- quality checks ---------- */
  var CRIT = AR ? {
    acc: "هل كل معلومة صحيحة؟ حالة الطلب وموعد التوصيل ومبلغ الاسترجاع تطابق ما في أنظمتكم.",
    tone: "هل يشبه الرد علامتكم؟ ودود وهادئ وواضح، مع اعتذار حين يلزم.",
    pol: "هل اتبع الموظف قواعدكم؟ التحقق من الهوية، وتطبيق مهلة الإرجاع، ولا وعود خارج السياسة.",
    res: "هل حُلّت المشكلة في هذه المحادثة، أو حُوّلت إلى الشخص المناسب مع كل ما يحتاجه؟",
    lang: "هل الكتابة سليمة بالعربية والإنجليزية، وبلغة العميل وأسلوبه؟",
    proc: "هل صُنّفت التذكرة ووُثّقت وأُغلقت بطريقة فريقكم، لتبقى تقاريركم دقيقة؟"
  } : {
    acc: "Is every fact right? Order status, delivery date and refund amount match what your systems say.",
    tone: "Does it sound like your brand? Warm, calm and clear, with an apology where one is due.",
    pol: "Did the agent follow your rules? Identity checked, return window applied, nothing promised outside policy.",
    res: "Was the problem solved in this conversation, or passed to the right person with everything they need?",
    lang: "Is the writing clean in Arabic and English, in the customer's language and register?",
    proc: "Is the ticket tagged, noted and closed the way your team works, so your reports stay true?"
  };
  var critBtns = $$("#crit button"), qmsgs = $(".qc-msgs"), critNote = $("#crit-note");
  function pickCrit(i, focus) {
    critBtns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i); b.tabIndex = j === i ? 0 : -1; });
    var c = critBtns[i].dataset.c;
    critNote.textContent = CRIT[c];
    qmsgs.classList.add("focus");
    $$(".qb", qmsgs).forEach(function (q) { q.classList.toggle("hit", (" " + q.dataset.c + " ").indexOf(" " + c + " ") > -1); });
    $("#qc-score").textContent = L("Checking: ", "الفحص: ") + critBtns[i].textContent;
    if (focus) critBtns[i].focus();
  }
  critBtns.forEach(function (b, i) {
    b.addEventListener("click", function () { pickCrit(i); });
    b.addEventListener("keydown", function (e) {
      var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); pickCrit((i + k + critBtns.length) % critBtns.length, true); }
    });
  });
  pickCrit(0);

  /* ---------- dashboard (sample data, drawn as dots) ---------- */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var DAYS = AR ? ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var CONV = L(" conversations", " محادثة");
  function makeData(p) {
    var r = rng(p === "w" ? 11 : 29), n = p === "w" ? 7 : 28, vol = [];
    for (var i = 0; i < n; i++) { var dow = i % 7; vol.push(Math.round(150 + 50 * Math.sin((dow + 1) / 7 * Math.PI) + r() * 40 + (dow === 4 ? 25 : 0))); }
    var heat = [];
    for (var d = 0; d < 7; d++) { var row = []; for (var h = 0; h < 24; h++) {
      var v = 2 + 26 * Math.exp(-Math.pow((h - 21) / 2.4, 2)) + 16 * Math.exp(-Math.pow((h - 13) / 2.2, 2)) + 8 * Math.exp(-Math.pow((h - 10) / 1.6, 2));
      if (h < 7) v *= .25; v *= (d === 4 || d === 3 ? 1.2 : 1) * (.85 + r() * .3) * (p === "w" ? 1 : 4); row.push(Math.round(v)); } heat.push(row); }
    var QN = AR ? ["الدقة", "الأسلوب", "السياسات", "الحل", "اللغة", "الإجراءات"] : ["Accuracy", "Tone", "Policy", "Resolution", "Language", "Process"];
    var qa = [[QN[0], 96], [QN[1], 95], [QN[2], 93], [QN[3], 90], [QN[4], 97], [QN[5], 92]].map(function (q) { return [q[0], q[1] - (p === "w" ? 0 : Math.round(r() * 2))]; });
    var kpi = AR ? (p === "w" ? [["1,284", "▲ 6% مقارنة بالأسبوع الماضي"], ["1 د 42 ث", "الهدف أقل من دقيقتين"], ["87%", "▲ نقطتان"], ["94%", "بطاقة التقييم لديكم"]]
                              : [["5,236", "▲ 4% مقارنة بالأسابيع الأربعة السابقة"], ["1 د 51 ث", "الهدف أقل من دقيقتين"], ["86%", "▲ نقطة واحدة"], ["93%", "بطاقة التقييم لديكم"]])
           : p === "w" ? [["1,284", "▲ 6% vs last week"], ["1m 42s", "Target under 2 min"], ["87%", "▲ 2 pts"], ["94%", "Your scorecard"]]
                       : [["5,236", "▲ 4% vs previous 4 weeks"], ["1m 51s", "Target under 2 min"], ["86%", "▲ 1 pt"], ["93%", "Your scorecard"]];
    return { p: p, vol: vol, heat: heat, qa: qa, kpi: kpi };
  }
  var dashEl = $("#dash"), tip = $("#dtip"), dashBody = $(".dash-body"), D = makeData("w"), hits = { vol: [], heat: [] };
  function mirror(f) { return RTL ? function (x) { return f.w - x; } : function (x) { return x; }; }
  function drawVol(k) {
    var f = fitCanvas($("#ch-vol")), c = f.c, mx = mirror(f), n = D.vol.length, lab = 20, top = 4;
    var wide = n === 7 ? 4 : 1, colW = f.w / n, step = Math.min(colW * .78 / wide, (f.h - lab - top) / Math.ceil(26 / wide)), r = step * .36;
    hits.vol = [];
    c.font = "600 11px " + FONT; c.textAlign = "center"; c.fillStyle = KICK;
    for (var i = 0; i < n; i++) {
      var x = colW * (i + .5), dots = Math.round(D.vol[i] / 10), show = Math.round(dots * k);
      c.fillStyle = i === n - 1 ? ORANGE : NAVY; c.beginPath();
      for (var j = 0; j < show; j++) { var dx = mx(x + step * ((j % wide) - (wide - 1) / 2)), y = f.h - lab - step * (Math.floor(j / wide) + .5); c.moveTo(dx + r, y); c.arc(dx, y, r, 0, Math.PI * 2); }
      c.fill();
      if (n === 7 || i % 7 === 0) { c.fillStyle = KICK; c.fillText(n === 7 ? DAYS[i] : L("Week ", "الأسبوع ") + (i / 7 + 1), mx(n === 7 ? x : x + colW * 3), f.h - 5); }
      hits.vol.push({ x0: Math.min(mx(colW * i), mx(colW * (i + 1))), x1: Math.max(mx(colW * i), mx(colW * (i + 1))), x: mx(x), y: f.h - lab - step * Math.ceil(dots / wide), t: (n === 7 ? DAYS[i] : L("Day ", "اليوم ") + (i + 1)) + " · " + D.vol[i] + CONV });
    }
  }
  function drawQA(k) {
    var f = fitCanvas($("#ch-qa")), c = f.c, mx = mirror(f), rows = D.qa.length, lw = 78, rowH = f.h / rows, cols = 20;
    var step = (f.w - lw - 36) / cols, r = Math.min(step * .36, rowH * .22);
    c.font = "600 12px " + FONT; c.textBaseline = "middle";
    D.qa.forEach(function (q, i) {
      var y = rowH * (i + .5), filled = q[1] / 5 * k;
      c.fillStyle = "#1A1F3D"; c.textAlign = RTL ? "right" : "left"; c.fillText(q[0], mx(0), y);
      for (var j = 0; j < cols; j++) {
        var x = mx(lw + step * (j + .5)), part = clamp(filled - j, 0, 1);
        c.fillStyle = PALE; c.beginPath(); c.arc(x, y, r * .45, 0, Math.PI * 2); c.fill();
        if (part > 0) { c.fillStyle = NAVY; c.beginPath(); c.arc(x, y, r * Math.sqrt(part), 0, Math.PI * 2); c.fill(); }
      }
      c.fillStyle = NAVY; c.textAlign = RTL ? "left" : "right"; c.font = "800 12px " + FONT; c.fillText(Math.round(q[1] * k) + "%", mx(f.w), y); c.font = "600 12px " + FONT;
    });
  }
  function drawHeat(k) {
    var f = fitCanvas($("#ch-heat")), c = f.c, mx = mirror(f), lw = AR ? 52 : 34, lab = 18, cw = (f.w - lw) / 24, rh = (f.h - lab) / 7;
    var max = 0; D.heat.forEach(function (row) { row.forEach(function (v) { max = Math.max(max, v); }); });
    var rmax = Math.min(cw, rh) * .46; hits.heat = [];
    c.font = "600 11px " + FONT; c.textBaseline = "middle";
    for (var d = 0; d < 7; d++) {
      c.fillStyle = KICK; c.textAlign = RTL ? "right" : "left"; c.fillText(DAYS[d], mx(0), rh * (d + .5));
      for (var h = 0; h < 24; h++) {
        var v = D.heat[d][h], x = mx(lw + cw * (h + .5)), y = rh * (d + .5), rr = Math.max(1, rmax * Math.sqrt(v / max) * k);
        c.fillStyle = v / max > .82 ? ORANGE : NAVY; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
        hits.heat.push({ x: x, y: y, r: cw / 2, ry: rh / 2, t: DAYS[d] + " " + String(h).padStart(2, "0") + ":00 · " + v + CONV });
      }
    }
    c.textAlign = "center"; c.fillStyle = KICK;
    for (var h2 = 0; h2 < 24; h2 += 3) c.fillText(String(h2).padStart(2, "0") + ":00", mx(lw + cw * (h2 + .5)), f.h - 6);
  }
  function drawDash(anim) {
    $$("[data-k]").forEach(function (b, i) { b.textContent = D.kpi[i][0]; });
    $$("[data-d]").forEach(function (b, i) { b.textContent = D.kpi[i][1]; });
    if (!anim) { drawVol(1); drawQA(1); drawHeat(1); return; }
    tweenRun(1100, function (k) { drawVol(k); drawQA(k); drawHeat(k); });
  }
  $$(".dseg button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".dseg button").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      D = makeData(b.dataset.p); drawDash(true);
    });
  });
  function showTip(e, cv, list, test) {
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, hit = null;
    list.forEach(function (h) { if (test(h, x, y)) hit = h; });
    if (!hit) { tip.hidden = true; return; }
    var br = dashBody.getBoundingClientRect();
    tip.textContent = hit.t; tip.hidden = false;
    tip.style.left = (r.left - br.left + hit.x) + "px"; tip.style.top = (r.top - br.top + (hit.y || y)) + "px";
  }
  $("#ch-vol").addEventListener("pointermove", function (e) { showTip(e, this, hits.vol, function (h, x) { return x >= h.x0 && x < h.x1; }); });
  $("#ch-heat").addEventListener("pointermove", function (e) { showTip(e, this, hits.heat, function (h, x, y) { return Math.abs(x - h.x) < h.r && Math.abs(y - h.y) < h.ry; }); });
  ["#ch-vol", "#ch-heat"].forEach(function (s) { $(s).addEventListener("pointerleave", function () { tip.hidden = true; }); });
  plays.dashboard = function () { drawDash(true); };
  addEventListener("resize", function () { drawDash(false); });

  /* ---------- one seat: the hidden costs of hiring, as dots ---------- */
  var seatCv = $("#seat-cv"), costLis = $$("#costs li"), seatBtns = $$(".seat-seg button"), seatSeg = $(".seat-seg");
  var SEAT_N = [64, 10, 10, 10, 10, 10, 10, 10], seatDots = [], seatMode = 0, seatT = 0, seatSel = -1, seatAnim = 0;
  var SEAT_LBL = AR ? ["الراتب", "المزايا", "التوظيف", "التدريب", "التعويض", "الإشراف", "المعدات", "التغطية"] : ["Salary", "Benefits", "Recruiting", "Training", "Replacing", "Supervision", "Equipment", "Cover"];
  function hexCluster(n, cx, cy, sp) {
    var pts = [], ring = 0;
    pts.push([cx, cy]);
    while (pts.length < n) { ring++;
      for (var k = 0; k < 6 && pts.length < n; k++) for (var j = 0; j < ring && pts.length < n; j++) {
        var a0 = Math.PI / 3 * k, a1 = Math.PI / 3 * (k + 1), t = j / ring;
        var x = Math.cos(a0) * (1 - t) + Math.cos(a1) * t, y = Math.sin(a0) * (1 - t) + Math.sin(a1) * t;
        pts.push([cx + x * ring * sp, cy + y * ring * sp]);
      } }
    return pts;
  }
  function seatLayout() {
    var f = fitCanvas(seatCv), w = f.w, h = f.h, sp = Math.max(9, Math.min(15, w / 34)), water = h * .36;
    var sal = hexCluster(SEAT_N[0], w / 2, water - sp * 4.6, sp);
    var cols = w < 480 ? 3 : 4, rows = Math.ceil(7 / cols), hid = [];
    for (var i = 1; i < 8; i++) {
      var top, band, k = i - 1, r = Math.floor(k / cols), c = k % cols, inRow = Math.min(cols, 7 - r * cols);
      var cx = w * (c + .5 + (cols - inRow) / 2) / cols, top = water + 34 + sp * 1.6, band = h - top - sp * 2.4, cy = top + band * (r + .5) / rows + (c % 2 ? sp * .5 : -sp * .3);
      hid.push(hexCluster(SEAT_N[i], cx, cy, sp));
    }
    var total = SEAT_N.reduce(function (a, b) { return a + b; }, 0), gcols = Math.min(16, Math.floor((w - 40) / (sp * 1.15))), grows = Math.ceil(total / gcols);
    var gw = (gcols - 1) * sp * 1.15, gh = (grows - 1) * sp * 1.15, gx = (w - gw) / 2, gy = (h - gh) / 2 + 14;
    seatDots = []; var idx = 0;
    for (var g = 0; g < 8; g++) {
      var src = g === 0 ? sal : hid[g - 1];
      src.forEach(function (p) {
        var col = idx % gcols, row = Math.floor(idx / gcols);
        seatDots.push({ g: g, a: p, b: [gx + col * sp * 1.15, gy + row * sp * 1.15], d: (idx % gcols) / gcols * .25 + row / grows * .2 });
        idx++;
      });
    }
    seatLayout.f = f; seatLayout.sp = sp; seatLayout.water = water; seatLayout.lab = { hid: hid, sal: sal, gy: gy };
  }
  function seatDraw() {
    var f = seatLayout.f; if (!f) return;
    var c = f.c, w = f.w, h = f.h, sp = seatLayout.sp, water = seatLayout.water, t = seatT;
    c.clearRect(0, 0, w, h);
    var ease = function (x) { x = clamp(x, 0, 1); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    // water
    c.globalAlpha = 1 - t;
    c.fillStyle = "rgba(255,255,255,.05)"; c.fillRect(0, water, w, h - water);
    c.strokeStyle = "rgba(185,192,228,.55)"; c.setLineDash([2, 6]); c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, water); c.lineTo(w, water); c.stroke(); c.setLineDash([]);
    c.font = "600 12px " + FONT; c.fillStyle = "#B9C0E4"; c.textAlign = RTL ? "right" : "left";
    var lx = RTL ? w - 16 : 16;
    c.fillText(L("What you see", "ما ترونه"), lx, water - 10); c.fillText(L("What you also pay for", "ما تدفعونه أيضًا"), lx, water + 22);
    c.textAlign = "center";
    seatLayout.lab.hid.forEach(function (cl, i) {
      var y = Math.max.apply(null, cl.map(function (p) { return p[1]; })) + sp * 1.6;
      c.fillStyle = seatSel === i + 1 ? "#F66747" : "#B9C0E4"; c.fillText(SEAT_LBL[i + 1], cl[0][0], y);
    });
    c.fillStyle = seatSel === 0 ? "#F66747" : "#FDFBFC"; c.font = "700 13px " + FONT;
    c.fillText(SEAT_LBL[0], w / 2, water - sp * 4.6 - sp * 5.4);
    c.globalAlpha = t; c.font = "700 14px " + FONT; c.fillStyle = "#FDFBFC";
    c.fillText(L("One monthly seat, everything included", "مقعد شهري واحد، كل شيء مشمول"), w / 2, seatLayout.lab.gy - sp * 1.8);
    c.globalAlpha = 1;
    // dots
    seatDots.forEach(function (d) {
      var k = ease((t - d.d) / .55);
      var x = d.a[0] + (d.b[0] - d.a[0]) * k, y = d.a[1] + (d.b[1] - d.a[1]) * k;
      var under = d.g > 0, hot = seatSel === d.g;
      c.fillStyle = hot ? "#F66747" : (under && k < 1 ? "rgba(185,192,228," + (.55 + .45 * k) + ")" : "#FDFBFC");
      c.beginPath(); c.arc(x, y, sp * (hot ? .4 : .34), 0, Math.PI * 2); c.fill();
    });
  }
  function seatGo(m) {
    seatMode = m;
    seatSeg.style.setProperty("--k", m);
    seatBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === m); });
    $("#seat").classList.toggle("z", m === 1);
    cancelAnimationFrame(seatAnim);
    var from = seatT, t0 = performance.now(), dur = 1300;
    if (calm) { seatT = m; seatDraw(); return; }
    (function f(now) { var k = clamp((now - t0) / dur, 0, 1); seatT = from + (m - from) * k; seatDraw(); if (k < 1) seatAnim = requestAnimationFrame(f); })(t0);
  }
  seatBtns.forEach(function (b, i) { b.addEventListener("click", function () { seatGo(i); }); });
  costLis.forEach(function (li, i) {
    var b = $("button", li);
    var on = function () { seatSel = i; costLis.forEach(function (o) { o.classList.toggle("on", o === li); }); seatDraw(); };
    b.addEventListener("pointerenter", on); b.addEventListener("focus", on); b.addEventListener("click", on);
  });
  $("#costs").addEventListener("pointerleave", function () { seatSel = -1; costLis.forEach(function (o) { o.classList.remove("on"); }); seatDraw(); });
  plays.savings = function () { seatT = 0; seatDraw(); setTimeout(function () { if (seatMode === 0) seatGo(1); }, 1600); };
  addEventListener("resize", function () { seatLayout(); seatDraw(); });

  arm();
  onScroll();
  var ready = window.ZameelAgent ? ZameelAgent.ready : Promise.resolve();
  Promise.all([ready, document.fonts ? document.fonts.ready : 0]).then(function () {
    agents.forEach(function (a) { a.resize(); a.last = ""; a.render(); });
    drawDash(false); seatLayout(); seatDraw();
    kick();
  });
})();

/* film: silent loop when on screen, full-screen pop-up from the hero button, phone captions */
(function () {
  var v = document.getElementById("film-v"), lb = document.getElementById("lb");
  if (!v || !lb) return;
  var lv = lb.querySelector("video"), btn = document.querySelector("[data-watch]");
  var caps = [].map.call(document.querySelectorAll("#film-caps li"), function (li) { return [+li.dataset.a, +li.dataset.b, li.textContent]; });
  function cap(vid, el) {
    vid.addEventListener("timeupdate", function () {
      var t = vid.currentTime, s = "";
      caps.forEach(function (c) { if (t >= c[0] && t < c[1]) s = c[2]; });
      if (el.textContent !== s) el.textContent = s;
    });
  }
  cap(v, document.getElementById("film-cap")); cap(lv, lb.querySelector(".lb-cap"));
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) v.play().catch(function () {}); else v.pause(); }, { threshold: .35 }).observe(v);
  }
  v.addEventListener("click", function () { v.paused ? v.play().catch(function () {}) : v.pause(); });
  function close() { lb.classList.remove("open"); lv.pause(); setTimeout(function () { lb.hidden = true; }, 300); if (btn) btn.focus(); }
  if (btn) btn.addEventListener("click", function () {
    v.pause(); lb.hidden = false; lv.currentTime = 0;
    requestAnimationFrame(function () { lb.classList.add("open"); });
    lv.play().catch(function () {}); lb.querySelector(".lb-x").focus();
    if (window.gtag) gtag("event", "film_play");
  });
  lb.querySelector(".lb-x").addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  lv.addEventListener("ended", close);
  addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) close(); });
})();
