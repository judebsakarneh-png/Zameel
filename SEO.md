# Zameel search setup (v2 site)

## Done on the site
- Every page has its own title, description, canonical URL and English/Arabic hreflang pair.
- Homepage title leads with the brand ("Zameel CX"), service pages each target one search phrase, so pages do not compete with each other.
- One H1 per page; the homepage H1 now carries "Arabic and English customer support outsourcing" above the tagline.
- Structured data (JSON-LD): Organization, ProfessionalService, WebSite, WebPage, list of the 4 services and the FAQ on both homepages; Service + Breadcrumb + FAQ on each service page; Breadcrumb on privacy.
- Open Graph and Twitter cards with the share image, in both languages.
- sitemap.xml: 12 URLs (home, 4 services, privacy, each in English and Arabic) with alternates and lastmod. Same URLs as the live site, so nothing indexed breaks.
- robots.txt allows everything and points to the sitemap. The example dashboard is noindex.
- llms.txt for AI search tools. vercel.json adds trailing-slash redirects (one URL per page), asset caching and security headers.
- Service pages carry a "who it is for" section and 5 FAQs each (about 600 words), closer to the pages that rank today.
- Light pages: no images to load in the hero, scripts at the end of the page, about 140 KB of own CSS and JS.

## After going live (only Jude can do these)
1. Google Search Console: submit https://zameel.cx/sitemap.xml, then "Request indexing" for the homepage, /ar/ and the 4 service pages.
2. Bing Webmaster Tools: import from Search Console (Bing also feeds ChatGPT search and Copilot).
3. Google Business Profile once there is an address.
4. Listings that link back: Clutch, GoodFirms, Crunchbase, DesignRush, Sortlist, and the Zendesk / Freshdesk partner directories.
5. LinkedIn: post weekly and link the site from the company page.
6. One useful article a month (for example "How to staff support for Ramadan" or "WhatsApp support SLAs"), each linking to a service page.

## What can rank first
- Brand: "Zameel", "Zameel CX", "زميل خدمة العملاء" within weeks of indexing.
- Narrow phrases where competition is low: Arabic customer support outsourcing, WhatsApp customer support outsourcing, bilingual Arabic English support agents, Ramadan customer support cover, e-commerce back-office outsourcing, تعهيد خدمة العملاء, دعم عملاء واتساب.
- Broad phrases like "customer support outsourcing" are dominated by large BPOs with years of links; those take months of the steps above, and no site change can guarantee a position.

Full competitor research, keyword priorities and Search Console steps: /mnt/project-files/seo/zameel-seo-report.pdf
