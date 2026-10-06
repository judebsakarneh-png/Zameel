# Zameel website (v2)

Static bilingual (English / Arabic) site for zameel.cx in the promo-film style: halftone agent, navy and white scenes, dot charts. Plain HTML, CSS and JavaScript, with one small Node build that writes the pages.

```
src/home.html               homepage content (English). Edit this, not index.html
tools/home-ar.js            Arabic copy for the homepage, as [English, Arabic] pairs
tools/content.js            English and Arabic copy for the service and privacy pages
tools/dashboard-content.js  English and Arabic copy for the client dashboard page
tools/build.js              writes every page below, plus 404.html and sitemap.xml
tools/build-preview.py      makes a click-through copy for a claude.ai Artifact preview

index.html, ar/index.html                 homepages            (GENERATED)
services/*/, ar/services/*/               4 service pages      (GENERATED)
privacy/, ar/privacy/                     privacy policy       (GENERATED)
dashboard/, ar/dashboard/                 example client dashboard, noindex (GENERATED)
404.html, sitemap.xml                     (GENERATED)

assets/css/site.css         all styles; brand tokens at the top, Arabic (right to left) rules at the bottom
assets/js/character.js      the halftone agent from the promo video
assets/js/common.js         every page: nav, FAQ, footer dots, small agents on inner pages
assets/js/site.js           homepage scenes, chat demo, tabs, charts, form (English and Arabic strings inside)
assets/js/dashboard.js      the client dashboard screens
assets/js/consent.js        Google Analytics (G-NY7GP3VSQ2) + cookie banner, banner only on European time zones
api/contact.js              Vercel function: emails form submissions through Resend (unchanged from v1)
robots.txt, site.webmanifest, favicons, assets/og-image.png, assets/brand/   carried over from v1
vercel.json                 trailing-slash redirects, asset caching, basic security headers
llms.txt                    plain summary of the site for AI search tools
SEO.md                      what is done on the site for search, and the off-site steps after launch
```

## Build

```
cd website-v2
node tools/build.js
```

The build stops with a list if any English string in `tools/home-ar.js` is no longer found in `src/home.html`, so a copy edit on the English homepage must be mirrored in the Arabic pairs.

## Preview locally

```
python3 -m http.server 8000      # http://localhost:8000 and http://localhost:8000/ar/
```

The form only sends on Vercel (`npx vercel dev` with RESEND_API_KEY set locally).

## Publish

Same Vercel project and environment variables as v1 (see the v1 README for Resend and DNS). To replace the live site, copy the contents of this folder over the repo root (keep `.git`), commit and push to `main`; Vercel redeploys on push. `src/`, `tools/` and this README are listed in `.vercelignore`, so they are not served.

## Rules for the copy

No client results, client counts or certifications Zameel does not hold. No pricing. No country names (Gulf as a region is fine). "Account manager", never "team lead". Plain "Arabic and English", no dialect claims. The track-record figures are the leadership's own scorecards, never Zameel client results. The dashboard page is labelled as an example account with made-up numbers.
