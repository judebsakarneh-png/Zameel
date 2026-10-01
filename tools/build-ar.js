// Builds ar/index.html from index.html + assets/js/i18n-ar.js so Google can index the Arabic page.
// Run from the website folder after editing copy:  node tools/build-ar.js
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
global.window = {};
require(path.join(root, "assets/js/i18n-ar.js"));
const AR = window.ZAMEEL_AR;
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const missing = [];

// Text content of every element carrying data-t="key"
html = html.replace(/<(\w+)([^>]*?\sdata-t="([\w-]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, key, inner) => {
  if (AR[key] == null) { missing.push(key); return m; }
  return `<${tag}${attrs}>${AR[key]}</${tag}>`;
});
// aria-labels carrying data-ta="key"
html = html.replace(/<(\w+)([^>]*?)\saria-label="[^"]*"([^>]*?\sdata-ta="([\w-]+)"[^>]*)>/g, (m, tag, a, b, key) =>
  AR[key] == null ? m : `<${tag}${a} aria-label="${AR[key]}"${b}>`);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
html = html
  .replace('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl">')
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(AR.metaDesc)}">`)
  .replace('<link rel="canonical" href="https://zameel.cx/">', '<link rel="canonical" href="https://zameel.cx/ar/">')
  .replace('<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="ar_AR">')
  .replace('<meta property="og:locale:alternate" content="ar_AR">', '<meta property="og:locale:alternate" content="en_US">')
  .replace('<meta property="og:url" content="https://zameel.cx/">', '<meta property="og:url" content="https://zameel.cx/ar/">')
  .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc("زميل | " + AR.footTag)}">`)
  .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(AR.metaDesc)}">`)
  .replace('<a class="lang" id="lang-toggle" href="ar/" hreflang="ar" lang="ar">العربية</a>', '<a class="lang" id="lang-toggle" href="../" hreflang="en" lang="en">English</a>')
  // relative paths from /ar/
  .replace(/(src|href)="(assets\/|favicon\.svg)/g, '$1="../$2');

fs.mkdirSync(path.join(root, "ar"), { recursive: true });
fs.writeFileSync(path.join(root, "ar/index.html"), html);
console.log("Wrote ar/index.html" + (missing.length ? "  (no Arabic for: " + [...new Set(missing)].join(", ") + ")" : ""));
