// Builds the service pages, the privacy page (English and Arabic) and sitemap.xml
// from tools/pages-content.js. Run from the website folder:  node tools/build-pages.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const { SERVICES, PRIVACY, STEPS, UI } = require("./pages-content.js");
const SITE = "https://zameel.cx";
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pre = (lang) => (lang === "ar" ? "/ar/" : "/");
const url = (lang, slug) => `${pre(lang)}${slug}/`;
const other = (lang) => (lang === "ar" ? "en" : "ar");
const tick = '<svg width="16" height="16" aria-hidden="true"><use href="#i-tick"/></svg>';
const arrow = '<svg class="arr" width="16" height="16" aria-hidden="true"><use href="#i-arrow"/></svg>';

function head(lang, slug, title, desc, jsonld) {
  const en = SITE + url("en", slug), ar = SITE + url("ar", slug);
  return `<!doctype html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${lang === "ar" ? ar : en}">
<link rel="alternate" hreflang="en" href="${en}">
<link rel="alternate" hreflang="ar" href="${ar}">
<link rel="alternate" hreflang="x-default" href="${en}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0E1D70">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Zameel">
<meta property="og:locale" content="${lang === "ar" ? "ar_AR" : "en_US"}">
<meta property="og:url" content="${lang === "ar" ? ar : en}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<link rel="icon" href="/favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-tick" viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  </defs>
</svg>
`;
}

function nav(lang, slug) {
  const u = UI[lang], h = pre(lang), o = other(lang);
  return `<a class="skip" href="#main">${esc(u.skip)}</a>

<header class="nav" id="nav">
  <div class="wrap nav-in">
    <a class="brand" href="${h}" aria-label="Zameel, home"><img src="/assets/brand/zameel-logo-full-colour.svg" alt="Zameel زميل" width="136" height="44"></a>
    <nav class="nav-links" aria-label="Main">
      <a href="${h}#services">${esc(u.services)}</a>
      <a href="${h}#standards">${esc(u.standards)}</a>
      <a href="${h}#record">${esc(u.record)}</a>
      <a href="${h}#faq">${esc(u.faq)}</a>
    </nav>
    <div class="nav-end">
      <a class="lang" href="${url(o, slug)}" hreflang="${o}" lang="${o}">${esc(u.langName)}</a>
      <a class="btn btn-orange btn-sm" href="${h}#contact">${esc(u.cta)}</a>
    </div>
  </div>
</header>
`;
}

function foot(lang) {
  const u = UI[lang], h = pre(lang);
  const links = SERVICES.map((s) => `      <a href="${url(lang, "services/" + s.slug)}">${esc(s[lang].nav)}</a>`).join("\n");
  return `<footer class="foot">
  <img class="foot-mark" src="/assets/brand/zameel-mark-white.svg" alt="" aria-hidden="true">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <img src="/assets/brand/zameel-logo-white.svg" alt="Zameel زميل" width="160" height="52">
      <p class="foot-tag">${esc(u.footTag)}</p>
      <a class="foot-mail" href="mailto:info@zameel.cx" dir="ltr">info@zameel.cx</a>
    </div>
    <nav class="foot-links" aria-label="Footer">
${links}
      <a href="${url(lang, "privacy")}">${esc(u.privacy)}</a>
      <a href="#" id="cookie-settings">${esc(u.cookies)}</a>
      <a href="https://www.linkedin.com/company/zameelcx/" rel="noopener" target="_blank" translate="no">LinkedIn</a>
    </nav>
    <p class="foot-meta"><span>${esc(u.foot)}</span> <span>© <span id="yr">2026</span> Zameel</span></p>
  </div>
</footer>

<script src="/assets/js/consent.js"></script>
<script src="/assets/js/page.js"></script>
</body>
</html>
`;
}

function servicePage(s, lang) {
  const c = s[lang], u = UI[lang], h = pre(lang), slug = "services/" + s.slug, st = STEPS[lang];
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", "@id": SITE + url(lang, slug) + "#service", name: c.eyebrow, serviceType: c.eyebrow,
        description: c.desc, url: SITE + url(lang, slug), inLanguage: lang, availableLanguage: ["ar", "en"],
        provider: { "@type": "Organization", "@id": SITE + "/#org", name: "Zameel", url: SITE + "/", sameAs: ["https://www.linkedin.com/company/zameelcx/"] } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: u.home, item: SITE + h },
        { "@type": "ListItem", position: 2, name: c.nav, item: SITE + url(lang, slug) } ] },
    ],
  };
  return head(lang, slug, c.title, c.desc, jsonld) + nav(lang, slug) + `
<main id="main">
  <section class="page-hero">
    <div class="wrap page-hero-in">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${h}">${esc(u.home)}</a> <span aria-hidden="true">/</span> <span>${esc(c.nav)}</span></nav>
      <p class="eyebrow"><span class="dot" aria-hidden="true"></span><span>${esc(c.eyebrow)}</span></p>
      <h1 class="page-h">${esc(c.h1)}</h1>
      <p class="hero-sub">${esc(c.sub)}</p>
      <div class="ctas">
        <a class="btn btn-orange" href="${h}#contact"><span>${esc(u.ctaLong)}</span>${arrow}</a>
        <a class="btn btn-ghost" href="${h}#services">${esc(u.allServices)}</a>
      </div>
    </div>
  </section>

  <section class="page-body">
    <div class="wrap page-grid">
      <div class="prose">
        <h2 class="h2">${esc(c.introH)}</h2>
${c.intro.map((p) => `        <p>${esc(p)}</p>`).join("\n")}
      </div>
      <div class="inc">
        <h2>${esc(c.cardH)}</h2>
        <ul class="checks">
${c.checks.map((t) => `          <li>${tick}<span>${esc(t)}</span></li>`).join("\n")}
        </ul>
      </div>
    </div>
  </section>

  <section class="steps" aria-labelledby="steps-h">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span><span>${esc(st.eyebrow)}</span></p>
        <h2 id="steps-h" class="h2">${esc(st.h)}</h2>
      </div>
      <ol class="rail">
${st.items.map(([w, t, p]) => `        <li class="step"><span class="when">${esc(w)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join("\n")}
      </ol>
    </div>
  </section>

  <section class="faq page-faq" aria-labelledby="faq-h">
    <div class="wrap faq-grid">
      <div class="sec-head">
        <h2 id="faq-h" class="h2">${esc(c.faqH)}</h2>
      </div>
      <div class="qa">
${c.faq.map(([q, a], i) => `        <details name="faq"${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
      </div>
    </div>
  </section>

  <div class="band">
    <section class="wrap cta-band">
      <h2 class="h2">${esc(u.ctaH)}</h2>
      <p class="lede">${esc(u.ctaP)}</p>
      <a class="btn btn-orange" href="${h}#contact"><span>${esc(u.ctaLong)}</span>${arrow}</a>
    </section>
  </div>
</main>

` + foot(lang);
}

function privacyPage(lang) {
  const c = PRIVACY[lang], u = UI[lang], h = pre(lang);
  const jsonld = { "@context": "https://schema.org", "@type": "WebPage", name: c.h1, url: SITE + url(lang, "privacy"), inLanguage: lang,
    isPartOf: { "@id": SITE + "/#website" } };
  return head(lang, "privacy", c.title, c.desc, jsonld) + nav(lang, "privacy") + `
<main id="main">
  <section class="page-hero">
    <div class="wrap page-hero-in">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${h}">${esc(u.home)}</a> <span aria-hidden="true">/</span> <span>${esc(c.h1)}</span></nav>
      <h1 class="page-h">${esc(c.h1)}</h1>
      <p class="hero-sub">${esc(c.updated)}</p>
    </div>
  </section>
  <section class="wrap legal">
${c.body.map(([t, p]) => `    <h2>${esc(t)}</h2>\n    <p>${p}</p>`).join("\n")}
  </section>
</main>

` + foot(lang);
}

const pages = [];
function write(rel, html) {
  const f = path.join(root, rel, "index.html");
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  pages.push(rel);
}
for (const s of SERVICES) for (const lang of ["en", "ar"]) write((lang === "ar" ? "ar/" : "") + "services/" + s.slug, servicePage(s, lang));
for (const lang of ["en", "ar"]) write((lang === "ar" ? "ar/" : "") + "privacy", privacyPage(lang));

// sitemap.xml: home + every generated page, each with its en/ar alternates
const pairs = [""].concat(SERVICES.map((s) => "services/" + s.slug + "/"), ["privacy/"]);
const entry = (loc, p) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/${p}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE}/ar/${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/${p}"/>
  </url>`;
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pairs.map((p) => entry(`${SITE}/${p}`, p) + "\n" + entry(`${SITE}/ar/${p}`, p)).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sm);
console.log("Wrote " + pages.length + " pages and sitemap.xml");
