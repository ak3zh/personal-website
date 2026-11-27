/* Loaded in <head>, before the page is drawn.
   1. Applies the saved light/dark choice at once, so a dark page never flashes light first.
   2. Marks the page as "pending" while app.js translates it: translated texts stay invisible and
      nothing animates, so the header does not flash English or slide between states on every page.
   A timer shows the page anyway if app.js fails to load. Without JavaScript nothing is hidden. */
(function () {
  'use strict';
  var root = document.documentElement;
  try {
    var theme = window.localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') { root.setAttribute('data-theme', theme); }
  } catch (e) { /* storage blocked: keep the system theme */ }
  root.classList.add('i18n-pending');
  window.setTimeout(function () { root.classList.remove('i18n-pending'); }, 1500);
})();
