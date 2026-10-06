// Copy for the client dashboard page (/dashboard/ and /ar/dashboard/), English and Arabic.
// Everything on the page is an example account with made-up data, and the page says so.
// T.js holds the strings assets/js/dashboard.js needs at run time; they are embedded in the page as JSON.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const T = {
  en: {
    title: "Client dashboard | Zameel",
    desc: "Every Zameel client gets a live view of their account: conversations, reply times, quality scores, the team and weekly reports. Explore an example account.",
    kicker: "Client dashboard",
    h1: "Your account, <em>open any time.</em>",
    lede: "Every client gets a live view of their account, from the first week. This is an example account with made-up numbers, so click through every screen.",
    brand: "Your brand",
    sample: "Example account",
    nav: "Dashboard screens",
    period: "Period", week: "This week", month: "Last 4 weeks",
    screens: { overview: "Overview", conv: "Conversations", quality: "Quality", team: "Team", reports: "Reports" },
    am: "Your account manager", amSub: "Weekly review every Sunday",
    updated: "Updated a few minutes ago",
    ov: {
      k: ["Conversations", "Median first reply", "Resolved first contact", "Quality score"],
      vol: "Conversations per day", volSub: "Each dot is 10 conversations",
      mix: "By channel", mixSub: "Each dot is 1% of conversations",
      heat: "When customers write", heatSub: "Bigger dot, more conversations",
      sla: "Service levels this period",
      slas: [["First reply on chat", "Target under 2 min"], ["First reply on email", "Target under 1 hour"], ["Quality score", "Target 90%"], ["Open past 24 hours", "Target 0"]],
    },
    cv: {
      k: ["Open now", "Resolved", "Escalated to your team", "Median handling time"],
      lang: "Language", langSub: "Each dot is 1% of conversations",
      reasons: "Why customers write", reasonsSub: "Share of conversations",
      list: "Recent conversations", all: "All channels",
      cols: ["Conversation", "Channel", "Language", "Reason", "Agent", "First reply", "Status"],
      pick: "Pick a conversation to read it.",
      tags: "Tags",
    },
    qa: {
      big: "Quality score", bigSub: "Average of all reviewed conversations",
      reviewed: "Conversations reviewed", coached: "Coaching sessions", calib: "Calibration with your team",
      calibV: "Every 2 weeks",
      checks: "Score by check", trend: "Weekly score", trendSub: "Last 8 weeks",
      reviews: "Latest reviews", note: "Coaching note",
    },
    tm: {
      k: ["Agents on your account", "On shift now", "Hours covered today", "Languages on every shift"],
      cover: "Cover through the day", coverSub: "Navy dots: agents on shift. Orange dots: conversations per hour, in tens.",
      agents: "Your team", on: "On shift", off: "Off shift", conv: "Conversations this period", score: "Quality score", shift: "Shift",
    },
    rp: {
      list: "Weekly reports", sent: "Sent", view: "Read",
      next: "Next monthly review", nextV: "Sunday 2 November, with your account manager",
      hi: "Highlights", issues: "Top issues", actions: "Next week", sla: "Service levels",
    },
    foot: "Example account. The numbers on this page are made up to show what the dashboard looks like.",
    cta: "Ask for a walkthrough",
  },
  ar: {
    title: "لوحة متابعة العملاء | زميل",
    desc: "يحصل كل عميل من زميل على متابعة مباشرة لحسابه: المحادثات وأوقات الرد ودرجات الجودة والفريق والتقارير الأسبوعية. تصفحوا حسابًا تجريبيًا.",
    kicker: "لوحة متابعة العملاء",
    h1: "حسابكم، <em>مفتوح في أي وقت.</em>",
    lede: "يحصل كل عميل على متابعة مباشرة لحسابه من الأسبوع الأول. هذا حساب تجريبي بأرقام افتراضية، فتصفحوا كل الشاشات.",
    brand: "علامتكم",
    sample: "حساب تجريبي",
    nav: "شاشات لوحة المتابعة",
    period: "الفترة", week: "هذا الأسبوع", month: "آخر 4 أسابيع",
    screens: { overview: "نظرة عامة", conv: "المحادثات", quality: "الجودة", team: "الفريق", reports: "التقارير" },
    am: "مدير حسابكم", amSub: "مراجعة أسبوعية كل يوم أحد",
    updated: "حُدّثت قبل دقائق",
    ov: {
      k: ["المحادثات", "وسيط أول رد", "حُلّت من أول تواصل", "درجة الجودة"],
      vol: "المحادثات يوميًا", volSub: "كل نقطة = 10 محادثات",
      mix: "حسب القناة", mixSub: "كل نقطة = 1% من المحادثات",
      heat: "متى يكتب العملاء", heatSub: "كلما كبرت النقطة زادت المحادثات",
      sla: "مستويات الخدمة في هذه الفترة",
      slas: [["أول رد على المحادثة", "الهدف أقل من دقيقتين"], ["أول رد على البريد", "الهدف أقل من ساعة"], ["درجة الجودة", "الهدف 90%"], ["مفتوحة منذ أكثر من 24 ساعة", "الهدف 0"]],
    },
    cv: {
      k: ["مفتوحة الآن", "تم حلها", "صُعّدت إلى فريقكم", "وسيط وقت المعالجة"],
      lang: "اللغة", langSub: "كل نقطة = 1% من المحادثات",
      reasons: "لماذا يكتب العملاء", reasonsSub: "نسبة من المحادثات",
      list: "أحدث المحادثات", all: "كل القنوات",
      cols: ["المحادثة", "القناة", "اللغة", "السبب", "الموظف", "أول رد", "الحالة"],
      pick: "اختاروا محادثة لقراءتها.",
      tags: "التصنيفات",
    },
    qa: {
      big: "درجة الجودة", bigSub: "متوسط كل المحادثات التي رُوجعت",
      reviewed: "محادثات رُوجعت", coached: "جلسات توجيه", calib: "توحيد التقييم مع فريقكم",
      calibV: "كل أسبوعين",
      checks: "الدرجة حسب الفحص", trend: "الدرجة الأسبوعية", trendSub: "آخر 8 أسابيع",
      reviews: "أحدث المراجعات", note: "ملاحظة التوجيه",
    },
    tm: {
      k: ["موظفون على حسابكم", "في الوردية الآن", "ساعات مغطاة اليوم", "لغتان في كل وردية"],
      cover: "التغطية على مدار اليوم", coverSub: "النقاط الكحلية: الموظفون في الوردية. النقاط البرتقالية: المحادثات في الساعة، بالعشرات.",
      agents: "فريقكم", on: "في الوردية", off: "خارج الوردية", conv: "محادثات في هذه الفترة", score: "درجة الجودة", shift: "الوردية",
    },
    rp: {
      list: "التقارير الأسبوعية", sent: "أُرسل", view: "اقرأ",
      next: "المراجعة الشهرية القادمة", nextV: "الأحد 2 نوفمبر، مع مدير حسابكم",
      hi: "أبرز النقاط", issues: "أبرز المشكلات", actions: "الأسبوع القادم", sla: "مستويات الخدمة",
    },
    foot: "حساب تجريبي. الأرقام في هذه الصفحة افتراضية لتوضيح شكل لوحة المتابعة.",
    cta: "اطلبوا جولة تعريفية",
  },
};

// Strings and sample text the script draws at run time.
const JS = {
  en: {
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], week: "Week", day: "Day", conv: "conversations",
    vsWeek: "vs last week", vsMonth: "vs previous 4 weeks", pts: "pts", pt: "pt", target2: "Target under 2 min", yourCard: "Your scorecard",
    channels: ["WhatsApp", "Email", "Live chat", "Instagram", "Voice"],
    langs: ["Arabic", "English"], langShort: ["AR", "EN"],
    reasons: ["Order status", "Refunds and returns", "Delivery changes", "Payment issues", "Product questions", "Account access"],
    status: ["Resolved", "Waiting on customer", "Escalated to you"],
    checks: ["Accuracy", "Tone", "Policy", "Resolution", "Language", "Process"],
    agents: ["Lina H.", "Omar S.", "Sara K.", "Yousef A.", "Hala M.", "Karim D."],
    met: "Met", none: "None", min: "min", h: "h", m: "m", s: "s", hrs: "hours", of: "of",
    chat: {
      0: [["c", "Hi, where is my order 48{n}? It said it would arrive yesterday."], ["a", "Sorry for the wait. It's with the courier and arrives today before 6pm. Here's the tracking link."], ["c", "Great, thank you."]],
      1: [["c", "The shoes don't fit. Can I return them?"], ["a", "Of course. You're within the 14-day window, so I've booked a free pickup for tomorrow and your refund starts once they're scanned."], ["c", "Perfect."]],
      2: [["c", "Can you deliver to my office instead?"], ["a", "Yes. I've changed the address on order 48{n} to your office. It still arrives Thursday."], ["c", "Thanks!"]],
      3: [["c", "I was charged twice for the same order."], ["a", "I can see both charges. I've passed this to your payments team with the details, and the extra charge is reversed within 3 working days."], ["c", "OK, thanks for checking."]],
      4: [["c", "Does this kettle work with 110V?"], ["a", "It's built for 220–240V only, so it won't work on 110V. The travel model next to it supports both."], ["c", "Good to know."]],
      5: [["c", "I can't log in to my account."], ["a", "I've sent a reset link to the email on your account. It works for 30 minutes."], ["c", "That worked, thank you."]],
    },
    reviews: [
      { agent: 0, ch: 0, score: 100, miss: [], text: "Customer asked to swap a damaged item. Agent checked the order, offered replacement or refund, and booked the pickup in one reply.", note: "Model reply. Shared with the team as an example." },
      { agent: 2, ch: 1, score: 92, miss: [4], text: "Refund request in English after an Arabic first message. Correct refund amount and timeline.", note: "Reply switched language mid-thread. Stay in the customer's latest language." },
      { agent: 3, ch: 2, score: 88, miss: [2, 5], text: "Delivery change after dispatch. The change was made but the courier note was missing.", note: "Always confirm the cut-off time and add the courier note. Walked through it together on Monday." },
      { agent: 1, ch: 0, score: 96, miss: [1], text: "Payment issue escalated to your team with screenshots and order details.", note: "Good escalation. Open with an apology before the steps." },
    ],
    report: {
      hi: ["{c} conversations, {d} vs the week before", "Median first reply on chat: {f}", "Quality score {q}% across {r} reviewed conversations"],
      issues: ["Delivery delays in the north region drove most order-status questions", "Several customers asked about the new return policy"],
      actions: ["Add a saved reply for the new return policy", "Second evening agent on Thursday for the weekend offer"],
    },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  ar: {
    days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], week: "الأسبوع", day: "اليوم", conv: "محادثة",
    vsWeek: "مقارنة بالأسبوع الماضي", vsMonth: "مقارنة بالأسابيع الأربعة السابقة", pts: "نقطة", pt: "نقطة", target2: "الهدف أقل من دقيقتين", yourCard: "بطاقة التقييم لديكم",
    channels: ["واتساب", "البريد", "المحادثة المباشرة", "إنستغرام", "المكالمات"],
    langs: ["العربية", "الإنجليزية"], langShort: ["عربي", "إنجليزي"],
    reasons: ["حالة الطلب", "الاسترجاع والإرجاع", "تغيير التوصيل", "مشكلات الدفع", "أسئلة عن المنتجات", "الدخول إلى الحساب"],
    status: ["تم الحل", "بانتظار العميل", "صُعّدت إليكم"],
    checks: ["الدقة", "الأسلوب", "السياسات", "الحل", "اللغة", "الإجراءات"],
    agents: ["لينا ح.", "عمر س.", "سارة ك.", "يوسف أ.", "هالة م.", "كريم د."],
    met: "تحقق", none: "لا شيء", min: "دقيقة", h: "س", m: "د", s: "ث", hrs: "ساعة", of: "من",
    chat: {
      0: [["c", "مرحبًا، أين طلبي 48{n}؟ كان من المفترض أن يصل أمس."], ["a", "نعتذر عن التأخير. الطلب مع المندوب ويصل اليوم قبل السادسة مساءً، وهذا رابط التتبع."], ["c", "ممتاز، شكرًا."]],
      1: [["c", "الحذاء لم يناسبني، هل يمكنني إرجاعه؟"], ["a", "بالتأكيد. أنتم ضمن مهلة الـ14 يومًا، وحجزت لكم استلامًا مجانيًا غدًا، ويبدأ الاسترجاع فور مسح الشحنة."], ["c", "ممتاز."]],
      2: [["c", "هل يمكن التوصيل إلى مكتبي بدلًا من المنزل؟"], ["a", "نعم. غيّرت عنوان الطلب 48{n} إلى مكتبكم، ويصل يوم الخميس كما هو."], ["c", "شكرًا!"]],
      3: [["c", "خُصم مني المبلغ مرتين لنفس الطلب."], ["a", "أرى الخصمين. حوّلت الأمر إلى فريق المدفوعات لديكم مع التفاصيل، ويُعاد المبلغ الزائد خلال 3 أيام عمل."], ["c", "حسنًا، شكرًا على المتابعة."]],
      4: [["c", "هل تعمل هذه الغلاية على 110 فولت؟"], ["a", "صُممت لـ220 إلى 240 فولت فقط، لذا لن تعمل على 110 فولت. طراز السفر المجاور يدعم الاثنين."], ["c", "معلومة مفيدة."]],
      5: [["c", "لا أستطيع الدخول إلى حسابي."], ["a", "أرسلت رابط إعادة تعيين إلى البريد المسجل في حسابكم، وهو صالح لمدة 30 دقيقة."], ["c", "نجح الأمر، شكرًا."]],
    },
    reviews: [
      { agent: 0, ch: 0, score: 100, miss: [], text: "طلب العميل استبدال منتج تالف. تحقق الموظف من الطلب، وعرض البديل أو الاسترجاع، وحجز الاستلام في رد واحد.", note: "رد نموذجي، شاركناه مع الفريق كمثال." },
      { agent: 2, ch: 1, score: 92, miss: [4], text: "طلب استرجاع بالإنجليزية بعد رسالة أولى بالعربية. المبلغ والمدة صحيحان.", note: "تغيرت لغة الرد في منتصف المحادثة. التزموا بآخر لغة استخدمها العميل." },
      { agent: 3, ch: 2, score: 88, miss: [2, 5], text: "تغيير عنوان بعد خروج الشحنة. نُفّذ التغيير لكن ملاحظة المندوب لم تُضف.", note: "أكدوا دائمًا موعد الإغلاق وأضيفوا ملاحظة المندوب. راجعناها معًا يوم الاثنين." },
      { agent: 1, ch: 0, score: 96, miss: [1], text: "مشكلة دفع صُعّدت إلى فريقكم مع لقطات الشاشة وتفاصيل الطلب.", note: "تصعيد جيد. ابدأوا بالاعتذار قبل الخطوات." },
    ],
    report: {
      hi: ["{c} محادثة، {d} مقارنة بالأسبوع السابق", "وسيط أول رد على المحادثة: {f}", "درجة الجودة {q}% في {r} محادثة رُوجعت"],
      issues: ["تأخر التوصيل في المنطقة الشمالية كان وراء معظم أسئلة حالة الطلب", "سأل عدد من العملاء عن سياسة الإرجاع الجديدة"],
      actions: ["إضافة رد جاهز لسياسة الإرجاع الجديدة", "موظف مسائي ثانٍ يوم الخميس لعرض نهاية الأسبوع"],
    },
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  },
};

const ICON = {
  overview: '<path d="M3 3h6v8H3zM11 3h6v5h-6zM11 10h6v7h-6zM3 13h6v4H3z"/>',
  conv: '<path d="M3 4h14v9H8l-4 3v-3H3z"/>',
  quality: '<path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.3 5.2 16.9l.9-5.4L2.2 7.7l5.4-.8z"/>',
  team: '<circle cx="7" cy="7" r="3"/><circle cx="14" cy="8" r="2.4"/><path d="M1.8 17c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6M12.6 12.6c2.2-.3 4.3 1 5 3.6"/>',
  reports: '<path d="M5 2h7l4 4v12H5z"/><path d="M12 2v4h4M8 10h5M8 13h5"/>',
};

function body(lang) {
  const t = T[lang], ar = lang === "ar", h = ar ? "/ar/" : "/";
  const ids = ["overview", "conv", "quality", "team", "reports"];
  const tabs = ids.map((id, i) => `          <button role="tab" id="tab-${id}" aria-controls="scr-${id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}><svg viewBox="0 0 20 20" aria-hidden="true">${ICON[id]}</svg><span>${t.screens[id]}</span></button>`).join("\n");
  const kpis = (pre, labels) => `<div class="kpis">${labels.map((l, i) => `<div class="kpi"><span>${esc(l)}</span><b data-k="${pre}${i}">–</b><i data-d="${pre}${i}">&nbsp;</i></div>`).join("")}</div>`;
  const panel = (cls, cap, sub, inner) => `<figure class="dpanel${cls ? " " + cls : ""}"><figcaption>${esc(cap)}${sub ? ` <span>${esc(sub)}</span>` : ""}</figcaption>${inner}</figure>`;
  const cv = (id, h2, label) => `<div class="dcv"${h2 ? ` style="height:${h2}px"` : ""}><canvas id="${id}" role="img" aria-label="${esc(label)}"></canvas></div>`;
  return `<main id="main" class="dash-main">
  <section class="dhero" data-scene>
    <div class="wrap dhero-in">
      <nav class="crumbs" aria-label="${ar ? "مسار التنقل" : "Breadcrumb"}"><a href="${h}">${ar ? "الرئيسية" : "Home"}</a><span aria-hidden="true">/</span><span>${esc(t.kicker)}</span></nav>
      <h1 class="h1 ph1">${t.h1}</h1>
      <p class="lede">${esc(t.lede)}</p>
    </div>
  </section>

  <section class="dapp-wrap" data-scene>
    <div class="wrap">
      <div class="dapp" id="dapp">
        <aside class="dside">
          <div class="dash-brand"><img src="/assets/brand/zameel-mark-white.svg" alt="" width="24" height="24">${ar ? "زميل" : "Zameel"} <span>· ${esc(t.brand)}</span></div>
          <div class="dnav" role="tablist" aria-label="${esc(t.nav)}" aria-orientation="vertical">
${tabs}
          </div>
          <div class="dam"><span class="dam-av"><canvas class="char" data-agent="0.5" data-spacing="12" data-view='{"x":0.5,"y":0.64,"s":0.854}' aria-hidden="true"></canvas></span><div><b>${esc(t.am)}</b><span>${esc(t.amSub)}</span></div></div>
        </aside>
        <div class="dmain">
          <div class="dbar">
            <h2 id="dtitle">${t.screens.overview}</h2>
            <span class="sample">${esc(t.sample)}</span>
            <span class="dupd">${esc(t.updated)}</span>
            <div class="dseg" role="group" aria-label="${esc(t.period)}"><button type="button" aria-pressed="true" data-p="w">${esc(t.week)}</button><button type="button" aria-pressed="false" data-p="m">${esc(t.month)}</button></div>
          </div>

          <div class="scr on" role="tabpanel" id="scr-overview" aria-labelledby="tab-overview">
            ${kpis("o", t.ov.k)}
            <div class="dgrid">
              ${panel("wide", t.ov.vol, t.ov.volSub, cv("c-vol", 0, t.ov.vol))}
              ${panel("", t.ov.mix, t.ov.mixSub, cv("c-mix", 0, t.ov.mix) + '<ul class="dlegend" id="l-mix"></ul>')}
              ${panel("full", t.ov.heat, t.ov.heatSub, cv("c-heat", 0, t.ov.heat))}
            </div>
            <div class="slas"><h3>${esc(t.ov.sla)}</h3><div class="sla-row">${t.ov.slas.map((s, i) => `<div class="slat"><span>${esc(s[0])}</span><b data-s="${i}">–</b><i>${esc(s[1])}</i><em class="ok" data-ok="${i}"></em></div>`).join("")}</div></div>
          </div>

          <div class="scr" role="tabpanel" id="scr-conv" aria-labelledby="tab-conv" hidden>
            ${kpis("c", t.cv.k)}
            <div class="dgrid">
              ${panel("", t.cv.lang, t.cv.langSub, cv("c-lang", 0, t.cv.lang) + '<ul class="dlegend" id="l-lang"></ul>')}
              ${panel("wide", t.cv.reasons, t.cv.reasonsSub, cv("c-reason", 0, t.cv.reasons))}
            </div>
            <div class="dpanel conv-box">
              <div class="conv-head"><h3>${esc(t.cv.list)}</h3><div class="chips" id="ch-filter" role="group" aria-label="${esc(t.cv.cols[1])}"></div></div>
              <div class="conv-grid">
                <div class="tbl-wrap"><table class="tbl" id="conv-tbl"><thead><tr>${t.cv.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody></tbody></table></div>
                <div class="conv-view" id="conv-view" aria-live="polite"><p class="empty">${esc(t.cv.pick)}</p></div>
              </div>
            </div>
          </div>

          <div class="scr" role="tabpanel" id="scr-quality" aria-labelledby="tab-quality" hidden>
            <div class="qa-top">
              <div class="qa-big"><canvas id="c-ring" role="img" aria-label="${esc(t.qa.big)}"></canvas><div><b id="qa-score">–</b><span>${esc(t.qa.big)}</span><i>${esc(t.qa.bigSub)}</i></div></div>
              <div class="kpi"><span>${esc(t.qa.reviewed)}</span><b data-k="q0">–</b></div>
              <div class="kpi"><span>${esc(t.qa.coached)}</span><b data-k="q1">–</b></div>
              <div class="kpi"><span>${esc(t.qa.calib)}</span><b class="sm">${esc(t.qa.calibV)}</b></div>
            </div>
            <div class="dgrid">
              ${panel("", t.qa.checks, "", cv("c-checks", 0, t.qa.checks))}
              ${panel("wide", t.qa.trend, t.qa.trendSub, cv("c-trend", 0, t.qa.trend))}
            </div>
            <div class="dpanel"><h3 class="ph3">${esc(t.qa.reviews)}</h3><div class="reviews" id="reviews"></div></div>
          </div>

          <div class="scr" role="tabpanel" id="scr-team" aria-labelledby="tab-team" hidden>
            ${kpis("t", t.tm.k)}
            ${panel("full", t.tm.cover, t.tm.coverSub, cv("c-cover", 220, t.tm.cover))}
            <div class="dpanel"><h3 class="ph3">${esc(t.tm.agents)}</h3><div class="agents" id="agents"></div></div>
          </div>

          <div class="scr" role="tabpanel" id="scr-reports" aria-labelledby="tab-reports" hidden>
            <div class="rp-grid">
              <div class="dpanel"><h3 class="ph3">${esc(t.rp.list)}</h3><ul class="rp-list" id="rp-list"></ul>
                <div class="rp-next"><span>${esc(t.rp.next)}</span><b>${esc(t.rp.nextV)}</b></div></div>
              <article class="dpanel rp-doc" id="rp-doc" aria-live="polite"></article>
            </div>
          </div>
          <div class="dtip" id="dtip" hidden></div>
        </div>
      </div>
      <div class="dfoot"><p class="fine">${esc(t.foot)}</p><a class="btn btn-navy" href="${h}#contact">${esc(t.cta)} <svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
    </div>
  </section>
</main>
<script type="application/json" id="dash-i18n">${JSON.stringify(Object.assign({ screens: t.screens, ui: { reviewer: t.qa.note, tags: t.cv.tags, sent: t.rp.sent, view: t.rp.view, hi: t.rp.hi, issues: t.rp.issues, actions: t.rp.actions, sla: t.rp.sla, all: t.cv.all, on: t.tm.on, off: t.tm.off, conv: t.tm.conv, score: t.tm.score, shift: t.tm.shift, slas: t.ov.slas.map((s) => s[0]) } }, JS[lang])).replace(/</g, "\\u003c")}</script>`;
}

module.exports = {
  en: { title: T.en.title, desc: T.en.desc, body: body("en") },
  ar: { title: T.ar.title, desc: T.ar.desc, body: body("ar") },
};
