// Builds every page of the Zameel site, English and Arabic, plus sitemap.xml and 404.html.
// Sources: src/home.html (homepage body), tools/home-ar.js (its Arabic copy),
// tools/content.js (service + privacy pages), tools/dashboard-content.js (dashboard page).
// Run from the website-v2 folder:  node tools/build.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const { SERVICES, PRIVACY, STEPS, UI } = require("./content.js");
const HOME_AR = require("./home-ar.js");
const DASH = require("./dashboard-content.js");
const SITE = "https://zameel.cx";
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pre = (lang) => (lang === "ar" ? "/ar/" : "/");
const url = (lang, p) => pre(lang) + p;                 // p is "" or "services/x/"
const other = (lang) => (lang === "ar" ? "en" : "ar");
const arrow = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

const NAV = {
  en: { services: "Services", quality: "Quality", dashboard: "Dashboard", cost: "Cost", record: "Track record", faq: "FAQ",
    cta: "Book a call", skip: "Skip to content", home: "Zameel, home", langName: "العربية", langLabel: "اقرأ الموقع بالعربية",
    fServices: "Services", fCompany: "Zameel", fMore: "More", contact: "Contact", how: "How we start", menu: "Menu" },
  ar: { services: "الخدمات", quality: "الجودة", dashboard: "لوحة المتابعة", cost: "التكلفة", record: "سجلّنا", faq: "أسئلة شائعة",
    cta: "احجزوا مكالمة", skip: "تخطَّ إلى المحتوى", home: "زميل، الصفحة الرئيسية", langName: "English", langLabel: "Read this site in English",
    fServices: "الخدمات", fCompany: "زميل", fMore: "المزيد", contact: "تواصلوا معنا", how: "كيف نبدأ", menu: "القائمة" },
};

function head(lang, p, title, desc, jsonld, opts = {}) {
  const en = SITE + url("en", p), ar = SITE + url("ar", p), self = lang === "ar" ? ar : en;
  return `<!doctype html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${self}">
<link rel="alternate" hreflang="en" href="${en}">
<link rel="alternate" hreflang="ar" href="${ar}">
<link rel="alternate" hreflang="x-default" href="${en}">
<meta name="robots" content="${opts.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#0E1D70">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Zameel">
<meta property="og:locale" content="${lang === "ar" ? "ar_AR" : "en_US"}">
<meta property="og:locale:alternate" content="${lang === "ar" ? "en_US" : "ar_AR"}">
<meta property="og:url" content="${self}">
<meta property="og:title" content="${esc(opts.ogTitle || title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${lang === "ar" ? "شعار زميل مع عبارة: عملياتكم. فريقنا. معيار واحد." : "Zameel logo with the line: Your operations. Our people. One standard."}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(opts.ogTitle || title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/assets/og-image.png">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<link rel="icon" href="/favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&family=Tajawal:wght@400;500;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
</head>
<body${opts.bodyClass ? ` class="${opts.bodyClass}"` : ""}>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-replay" viewBox="0 0 16 16"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4M2.5 2.5V5H5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>
`;
}

// home = true on the homepage, where section links stay on the page
function header(lang, p, home) {
  const n = NAV[lang], h = home ? "" : pre(lang), o = other(lang);
  const dash = home ? "#dashboard" : url(lang, "dashboard/");
  return `<a class="skip" href="#main">${esc(n.skip)}</a>

<header class="nav" id="nav">
  <div class="wrap nav-in">
    <a class="brand" href="${home ? "#hero" : pre(lang)}" aria-label="${esc(n.home)}"><img src="/assets/brand/zameel-logo-full-colour.svg" alt="Zameel زميل" width="118" height="38"></a>
    <nav class="nav-links" aria-label="${lang === "ar" ? "الرئيسية" : "Main"}">
      <a href="${h}#channels">${n.services}</a>
      <a href="${h}#trained">${n.quality}</a>
      <a href="${dash}"${p === "dashboard/" ? ' class="on" aria-current="page"' : ""}>${n.dashboard}</a>
      <a href="${h}#savings">${n.cost}</a>
      <a href="${h}#record">${n.record}</a>
      <a href="${h}#faq">${n.faq}</a>
    </nav>
    <a class="lang" href="${url(o, p)}" hreflang="${o}" lang="${o}" aria-label="${esc(n.langLabel)}">${n.langName}</a>
    <a class="btn btn-navy btn-sm" href="${h}#contact">${n.cta}</a>
  </div>
  <span class="progress" aria-hidden="true"></span>
</header>
`;
}

function footer(lang, scripts) {
  const n = NAV[lang], u = UI[lang], h = pre(lang);
  const svc = SERVICES.map((s) => `        <a href="${url(lang, "services/" + s.slug + "/")}">${esc(s[lang].nav)}</a>`).join("\n");
  return `<footer class="foot">
  <canvas class="foot-dots" id="foot-dots" aria-hidden="true" data-mark="/assets/brand/zameel-mark.svg"></canvas>
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <img src="/assets/brand/zameel-logo-white.svg" alt="Zameel زميل" width="142" height="46">
      <p>${esc(u.footTag)}</p>
      <a class="foot-mail" href="mailto:info@zameel.cx" dir="ltr">info@zameel.cx</a>
    </div>
    <nav class="foot-links" aria-label="${lang === "ar" ? "روابط التذييل" : "Footer"}">
      <div><h4>${n.fServices}</h4>
${svc}
      </div>
      <div><h4>${n.fCompany}</h4>
        <a href="${url(lang, "dashboard/")}">${n.dashboard}</a>
        <a href="${h}#trained">${n.quality}</a>
        <a href="${h}#record">${n.record}</a>
        <a href="${h}#contact">${n.contact}</a>
      </div>
      <div><h4>${n.fMore}</h4>
        <a href="${url(lang, "privacy/")}">${esc(u.privacy)}</a>
        <a href="#" id="cookie-settings">${esc(u.cookies)}</a>
        <a href="https://www.linkedin.com/company/zameelcx/" rel="noopener" target="_blank" translate="no">LinkedIn</a>
        <a href="${url(other(lang), "")}" hreflang="${other(lang)}" lang="${other(lang)}">${n.langName}</a>
      </div>
    </nav>
    <p class="foot-meta"><span>${esc(u.foot)}</span><span>© <span id="yr">2026</span> ${lang === "ar" ? "زميل" : "Zameel"}</span></p>
  </div>
</footer>
<script src="/assets/js/consent.js"></script>
${scripts.map((s) => `<script src="/assets/js/${s}"${s === "character.js" ? ' data-mark="/assets/brand/zameel-mark.svg"' : ""}></script>`).join("\n")}
</body>
</html>
`;
}

/* ---------- homepage ---------- */
const ORG = {
  "@type": "Organization", "@id": SITE + "/#org", name: "Zameel", alternateName: "زميل", url: SITE + "/",
  logo: { "@type": "ImageObject", url: SITE + "/assets/brand/icon-512.png", width: 512, height: 512 }, image: SITE + "/assets/og-image.png", slogan: "Your operations. Our people. One standard.",
  email: "info@zameel.cx", sameAs: ["https://www.linkedin.com/company/zameelcx/"],
};
// FAQ and service list are read from the page itself, so the structured data always matches what visitors see
function homeLd(lang, body) {
  const strip = (x) => x.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
  const qs = [...body.matchAll(/<summary>([\s\S]*?)<span class="pm"[\s\S]*?<div class="ans"><p>([\s\S]*?)<\/p>/g)];
  return { "@context": "https://schema.org", "@graph": [ORG,
    { "@type": "ProfessionalService", "@id": SITE + "/#service", name: "Zameel", url: SITE + "/", image: SITE + "/assets/og-image.png",
      parentOrganization: { "@id": SITE + "/#org" },
      description: lang === "ar" ? "تعهيد دعم العملاء والأعمال المكتبية بالعربية والإنجليزية." : "Arabic and English customer support and back-office outsourcing.",
      knowsLanguage: ["ar", "en"],
      knowsAbout: ["Customer support outsourcing", "WhatsApp customer support", "Back-office outsourcing", "Peak-season customer support"] },
    { "@type": "WebSite", "@id": SITE + "/#website", url: SITE + "/", name: "Zameel", alternateName: ["زميل", "Zameel CX"], inLanguage: ["en", "ar"], publisher: { "@id": SITE + "/#org" } },
    { "@type": "WebPage", "@id": SITE + url(lang, "") + "#webpage", url: SITE + url(lang, ""), name: HOME_META[lang].title, description: HOME_META[lang].desc,
      inLanguage: lang, isPartOf: { "@id": SITE + "/#website" }, about: { "@id": SITE + "/#org" } },
    { "@type": "ItemList", name: lang === "ar" ? "خدمات زميل" : "Zameel services", itemListElement: SERVICES.map((sv, i) => ({
      "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: sv[lang].eyebrow, description: sv[lang].desc, url: SITE + url(lang, "services/" + sv.slug + "/"),
        provider: { "@id": SITE + "/#org" }, availableLanguage: ["ar", "en"] } })) },
    { "@type": "FAQPage", mainEntity: qs.map((m) => ({ "@type": "Question", name: strip(m[1]), acceptedAnswer: { "@type": "Answer", text: strip(m[2]) } })) },
  ] };
}
const HOME_META = {
  en: { title: "Zameel CX | Arabic & English Customer Support and Back-Office", og: "Zameel | Your operations. Our people. One standard.",
    desc: "Zameel runs Arabic and English customer support and back-office work. Your hours, your tools, a report every week." },
  ar: { title: "زميل Zameel | دعم العملاء والأعمال المكتبية بالعربية والإنجليزية", og: "زميل | عملياتكم. فريقنا. معيار واحد.",
    desc: "زميل يدير دعم العملاء والأعمال المكتبية بالعربية والإنجليزية. في ساعات عملكم، وداخل أدواتكم، مع تقرير أسبوعي." },
};

function applyPairs(html, pairs, label) {
  const missing = [];
  for (const [a, b] of pairs) {
    if (!html.includes(a)) { missing.push(a); continue; }
    html = html.split(a).join(b);
  }
  if (missing.length) throw new Error(label + ": " + missing.length + " strings not found:\n  " + missing.map((m) => m.slice(0, 90)).join("\n  "));
  return html;
}
function localise(html, lang) {
  if (lang !== "ar") return html;
  return html.replace(/href="\/(services|privacy|dashboard)\//g, 'href="/ar/$1/');
}

function homePage(lang) {
  let body = fs.readFileSync(path.join(root, "src/home.html"), "utf8");
  if (lang === "ar") body = applyPairs(body, HOME_AR, "Arabic homepage");
  const m = HOME_META[lang];
  return head(lang, "", m.title, m.desc, homeLd(lang, body), { ogTitle: m.og }) + header(lang, "", true) + "\n" + localise(body, lang) + "\n\n"
    + footer(lang, ["character.js", "common.js", "site.js"]);
}

/* ---------- service + privacy pages ---------- */
const AGENT_LOOK = { "customer-support-outsourcing": -0.5, "whatsapp-support": 0.6, "back-office": -0.2, "peak-season-support": 0.4 };
function crumbs(lang, label) {
  const u = UI[lang];
  return `<nav class="crumbs" aria-label="${lang === "ar" ? "مسار التنقل" : "Breadcrumb"}"><a href="${pre(lang)}">${esc(u.home)}</a><span aria-hidden="true">/</span><span>${esc(label)}</span></nav>`;
}
function steps(lang) {
  const st = STEPS[lang];
  return `  <section class="scene mist" aria-labelledby="steps-h">
    <div class="wrap">
      <div class="sec-head rv">
        <span class="kicker">${esc(st.eyebrow)}</span>
        <h2 class="h2" id="steps-h">${esc(st.h)}</h2>
      </div>
      <ol class="rail">
${st.items.map(([w, t, p]) => `        <li class="step lit"><span class="when">${esc(w)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join("\n")}
      </ol>
    </div>
  </section>`;
}
function ctaBand(lang) {
  const u = UI[lang];
  return `  <section class="scene navy cta-band" aria-labelledby="cta-h">
    <div class="wrap cta-in">
      <div class="rv">
        <h2 class="h2" id="cta-h">${esc(u.ctaH)}</h2>
        <p class="lede">${esc(u.ctaP)}</p>
      </div>
      <a class="btn btn-white" href="${pre(lang)}#contact">${esc(u.ctaLong)} ${arrow}</a>
    </div>
  </section>`;
}

const MORE = require("./service-more.js");
function servicePage(s, lang) {
  const m = MORE[s.slug][lang];
  const c = Object.assign({}, s[lang], { faq: s[lang].faq.concat(m.faq) }), u = UI[lang], h = pre(lang), p = "services/" + s.slug + "/";
  const jsonld = { "@context": "https://schema.org", "@graph": [
    { "@type": "Service", "@id": SITE + url(lang, p) + "#service", name: c.eyebrow, serviceType: c.eyebrow, description: c.desc,
      url: SITE + url(lang, p), inLanguage: lang, availableLanguage: ["ar", "en"], image: SITE + "/assets/og-image.png",
      provider: { "@type": "Organization", "@id": SITE + "/#org", name: "Zameel", url: SITE + "/", sameAs: ["https://www.linkedin.com/company/zameelcx/"] } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: u.home, item: SITE + h },
      { "@type": "ListItem", position: 2, name: c.nav, item: SITE + url(lang, p) }] },
    { "@type": "FAQPage", mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ] };
  const others = SERVICES.filter((o) => o !== s);
  return head(lang, p, c.title, c.desc, jsonld) + header(lang, p, false) + `
<main id="main">
  <section class="phero" data-scene>
    <div class="wrap phero-grid">
      <div class="phero-copy">
        ${crumbs(lang, c.nav)}
        <span class="kicker">${esc(c.eyebrow)}</span>
        <h1 class="h1 ph1">${esc(c.h1)}</h1>
        <p class="lede">${esc(c.sub)}</p>
        <div class="ctas">
          <a class="btn btn-navy" href="${h}#contact">${esc(u.ctaLong)} ${arrow}</a>
          <a class="btn btn-ghost" href="${h}#channels">${esc(u.allServices)} ${arrow}</a>
        </div>
      </div>
      <div class="phero-stage" aria-hidden="true"><canvas class="char" data-agent="${AGENT_LOOK[s.slug]}"></canvas></div>
    </div>
  </section>

  <section class="scene pbody" data-scene>
    <div class="wrap pgrid">
      <div class="prose rv">
        <h2 class="h2">${esc(c.introH)}</h2>
${c.intro.map((t) => `        <p>${esc(t)}</p>`).join("\n")}
      </div>
      <div class="inc rv">
        <span class="kicker">${esc(c.cardH)}</span>
        <ul class="ticks">
${c.checks.map((t) => `          <li>${esc(t)}</li>`).join("\n")}
        </ul>
      </div>
    </div>
  </section>

  <section class="scene pmore" data-scene>
    <div class="wrap">
      <div class="prose rv">
        <h2 class="h2">${esc(m.moreH)}</h2>
${m.more.map((t) => `        <p>${esc(t)}</p>`).join("\n")}
      </div>
    </div>
  </section>

${steps(lang)}

  <section class="scene" aria-labelledby="faq-h">
    <div class="wrap faq-grid">
      <div class="sec-head rv">
        <h2 class="h2" id="faq-h">${esc(c.faqH)}</h2>
      </div>
      <div class="qa">
${c.faq.map(([q, a], i) => `        <details${i === 0 ? " open" : ""}><summary>${esc(q)}<span class="pm" aria-hidden="true"></span></summary><div class="ans"><p>${esc(a)}</p></div></details>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="scene mist related" aria-labelledby="rel-h">
    <div class="wrap">
      <h2 class="h3x" id="rel-h">${lang === "ar" ? "خدمات أخرى" : "Other services"}</h2>
      <div class="rel">
${others.map((o) => `        <a class="rcard" href="${url(lang, "services/" + o.slug + "/")}"><span class="kicker">${esc(o[lang].eyebrow)}</span><b>${esc(o[lang].h1)}</b>${arrow}</a>`).join("\n")}
      </div>
    </div>
  </section>

${ctaBand(lang)}
</main>

` + footer(lang, ["character.js", "common.js"]);
}

function privacyPage(lang) {
  const c = PRIVACY[lang], p = "privacy/";
  const jsonld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", name: c.h1, url: SITE + url(lang, p), inLanguage: lang, isPartOf: { "@id": SITE + "/#website" } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: UI[lang].home, item: SITE + pre(lang) },
      { "@type": "ListItem", position: 2, name: c.h1, item: SITE + url(lang, p) }] }] };
  return head(lang, p, c.title, c.desc, jsonld) + header(lang, p, false) + `
<main id="main">
  <section class="phero short">
    <div class="wrap phero-copy">
      ${crumbs(lang, c.h1)}
      <h1 class="h1 ph1">${esc(c.h1)}</h1>
      <p class="lede">${esc(c.updated)}</p>
    </div>
  </section>
  <section class="scene legal-wrap">
    <div class="wrap legal">
${c.body.map(([t, x]) => `      <h2>${esc(t)}</h2>\n      <p>${x}</p>`).join("\n")}
    </div>
  </section>
</main>

` + footer(lang, ["common.js"]);
}

/* ---------- dashboard ---------- */
function dashboardPage(lang) {
  const d = DASH[lang], p = "dashboard/";
  const jsonld = { "@context": "https://schema.org", "@type": "WebPage", name: d.title, url: SITE + url(lang, p), inLanguage: lang, isPartOf: { "@id": SITE + "/#website" } };
  return head(lang, p, d.title, d.desc, jsonld, { bodyClass: "dash-page", noindex: true }) + header(lang, p, false) + "\n" + d.body + "\n\n" + footer(lang, ["character.js", "common.js", "dashboard.js"]);
}

/* ---------- write ---------- */
const written = [];
function write(rel, html) {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  written.push(rel);
}
for (const lang of ["en", "ar"]) {
  const dir = lang === "ar" ? "ar/" : "";
  write(dir + "index.html", homePage(lang));
  for (const s of SERVICES) write(dir + "services/" + s.slug + "/index.html", servicePage(s, lang));
  write(dir + "privacy/index.html", privacyPage(lang));
  write(dir + "dashboard/index.html", dashboardPage(lang));
}

// 404: one bilingual page, served by Vercel for any missing path
write("404.html", `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found | Zameel</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0E1D70">
<link rel="icon" href="/favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,800;1,700&family=Tajawal:wght@500;800&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
</head>
<body class="nf">
<main class="nf-in">
  <div class="nf-agent" aria-hidden="true"><canvas class="char" data-agent="0.8" data-mode="light"></canvas></div>
  <div class="nf-copy">
    <img src="/assets/brand/zameel-logo-white.svg" alt="Zameel زميل" width="160" height="52">
    <h1 class="h2">This page <em>doesn't exist.</em></h1>
    <p class="lede">The link may be old or mistyped.</p>
    <p class="lede" lang="ar" dir="rtl">هذه الصفحة غير موجودة. ربما الرابط قديم أو فيه خطأ.</p>
    <div class="ctas"><a class="btn btn-white" href="/">Back to zameel.cx ${arrow}</a><a class="btn btn-ghost" href="/ar/" lang="ar">العودة إلى الرئيسية</a></div>
  </div>
</main>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="i-arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></symbol></svg>
<script src="/assets/js/character.js" data-mark="/assets/brand/zameel-mark.svg"></script>
<script src="/assets/js/common.js"></script>
</body>
</html>
`);

// sitemap: every indexable page, each with its en/ar alternates (the dashboard is an example and stays out)
const pairs = [""].concat(SERVICES.map((s) => "services/" + s.slug + "/"), ["privacy/"]);
const entry = (loc, p) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/${p}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE}/ar/${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/${p}"/>
  </url>`;
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pairs.map((p) => entry(`${SITE}/${p}`, p) + "\n" + entry(`${SITE}/ar/${p}`, p)).join("\n")}
</urlset>
`);
console.log("Wrote " + written.length + " files:\n  " + written.join("\n  "));
