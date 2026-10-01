/* Zameel inner pages (services, privacy): analytics, nav shadow, footer year. */
(function () {
  "use strict";

  var GA_ID = "G-NY7GP3VSQ2";
  if (GA_ID && /^(www\.)?zameel\.cx$/.test(location.hostname)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(gs);
  }

  var nav = document.getElementById("nav");
  function onNav() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
