/* Zameel inner pages (services, privacy): nav shadow (analytics: consent.js), footer year. */
(function () {
  "use strict";

  var nav = document.getElementById("nav");
  function onNav() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
