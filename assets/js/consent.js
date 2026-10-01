/* Cookie consent + Google Analytics (GA4 Consent Mode).
   Analytics cookies stay off until the visitor clicks Accept. The choice is kept in
   localStorage; the "Cookie settings" link in the footer (#cookie-settings) reopens the banner.
   Loaded on every page before main.js / page.js. */
(function () {
  "use strict";

  var GA_ID = "G-NY7GP3VSQ2";
  var KEY = "zameel-consent";
  var live = /^(www\.)?zameel\.cx$/.test(location.hostname);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    wait_for_update: 500
  });

  function read() { try { return localStorage.getItem(KEY); } catch (_) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (_) {} }
  function grant() { window.gtag("consent", "update", { analytics_storage: "granted" }); }

  if (read() === "granted") grant();

  if (GA_ID && live) {
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(gs);
  }

  var T = {
    en: { text: "We use analytics cookies to see which pages are useful. Nothing is used for advertising.", yes: "Accept", no: "Decline", more: "Privacy policy", priv: "/privacy/", label: "Cookie choice" },
    ar: { text: "نستخدم ملفات تعريف الارتباط للتحليلات لمعرفة الصفحات المفيدة، ولا نستخدمها للإعلانات.", yes: "موافق", no: "رفض", more: "سياسة الخصوصية", priv: "/ar/privacy/", label: "اختيار ملفات تعريف الارتباط" }
  };

  var box = null;
  function close() { if (box) { box.remove(); box = null; } }
  function show() {
    if (box) return;
    var t = T[document.documentElement.lang === "ar" ? "ar" : "en"];
    box = document.createElement("div");
    box.className = "consent";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", t.label);
    box.innerHTML = '<p>' + t.text + ' <a href="' + t.priv + '">' + t.more + '</a></p>' +
      '<div class="consent-btns"><button type="button" class="btn btn-sm consent-no">' + t.no + '</button>' +
      '<button type="button" class="btn btn-orange btn-sm consent-yes">' + t.yes + '</button></div>';
    box.querySelector(".consent-yes").addEventListener("click", function () { save("granted"); grant(); close(); });
    box.querySelector(".consent-no").addEventListener("click", function () {
      save("denied"); window.gtag("consent", "update", { analytics_storage: "denied" }); close();
    });
    document.body.appendChild(box);
  }

  function init() {
    if (!read()) show();
    var link = document.getElementById("cookie-settings");
    if (link) link.addEventListener("click", function (e) { e.preventDefault(); show(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
