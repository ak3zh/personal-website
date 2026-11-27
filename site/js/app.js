/* Language switcher, theme toggle and motion. No external requests; text is set with textContent only. */
(function () {
  'use strict';
  var LANGS = ['kk', 'ru', 'en'];
  var I18N = window.I18N || {};

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage may be blocked */ } }

  function detectLang() {
    var fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (LANGS.indexOf(fromUrl) !== -1) { return fromUrl; }
    var saved = safeGet('lang');
    if (LANGS.indexOf(saved) !== -1) { return saved; }
    var nav = ((navigator.language || 'en') + '').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) !== -1 ? nav : 'en';
  }

  function t(lang, key) {
    var dict = I18N[lang] || {};
    if (Object.prototype.hasOwnProperty.call(dict, key)) { return dict[key]; }
    return (I18N.en || {})[key];
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var text = t(lang, nodes[i].getAttribute('data-i18n'));
      if (typeof text === 'string') { nodes[i].textContent = text; }
    }
    var aria = document.querySelectorAll('[data-i18n-aria]');
    for (var j = 0; j < aria.length; j++) {
      var label = t(lang, aria[j].getAttribute('data-i18n-aria'));
      if (typeof label === 'string') { aria[j].setAttribute('aria-label', label); }
    }
    var page = document.body.getAttribute('data-page');
    var title = t(lang, 'meta.' + page + '.title');
    if (title) { document.title = title; }
    var desc = t(lang, 'meta.' + page + '.desc');
    var meta = document.querySelector('meta[name="description"]');
    if (desc && meta) { meta.setAttribute('content', desc); }
    var buttons = document.querySelectorAll('[data-lang]');
    for (var k = 0; k < buttons.length; k++) {
      buttons[k].setAttribute('aria-pressed', buttons[k].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
    safeSet('lang', lang);
    if (window.history && history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    var links = document.querySelectorAll('a[data-internal]');
    for (var m = 0; m < links.length; m++) {
      var base = links[m].getAttribute('data-internal');
      links[m].setAttribute('href', base + '?lang=' + lang);
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function currentTheme() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set) { return set; }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncThemeButton() {
    var toggle = document.getElementById('theme-toggle');
    if (toggle) { toggle.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false'); }
  }

  // Motion helpers. Values go into one constructed style sheet, so no style attribute is added (CSP stays strict).
  var root = document.documentElement;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var varSheet = null, cssVars = {};
  function setVars(values) {
    if (!varSheet) { return false; }
    for (var name in values) { if (Object.prototype.hasOwnProperty.call(values, name)) { cssVars[name] = values[name]; } }
    var text = ':root{';
    for (var key in cssVars) { if (Object.prototype.hasOwnProperty.call(cssVars, key)) { text += key + ':' + cssVars[key] + ';'; } }
    varSheet.replaceSync(text + '}');
    return true;
  }
  function initVarSheet() {
    if (!window.CSSStyleSheet || !('adoptedStyleSheets' in document)) { return; }
    try { varSheet = new CSSStyleSheet(); document.adoptedStyleSheets = document.adoptedStyleSheets.concat([varSheet]); } catch (e) { varSheet = null; }
  }

  // Cursor spotlight: only for a mouse or trackpad, never when the visitor asks for less motion.
  function initSpotlight() {
    if (!varSheet || reduceMotion || !window.matchMedia || !window.matchMedia('(pointer: fine)').matches) { return; }
    var x = 0, y = 0, pending = false;
    document.addEventListener('pointermove', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') { return; }
      x = event.clientX; y = event.clientY;
      if (pending) { return; }
      pending = true;
      window.requestAnimationFrame(function () {
        setVars({ '--mx': Math.round(x) + 'px', '--my': Math.round(y) + 'px' });
        root.classList.add('spotlight');
        pending = false;
      });
    }, { passive: true });
    root.addEventListener('mouseleave', function () { root.classList.remove('spotlight'); });
  }

  // Sliding highlight under the current menu item.
  function movePill(link, instant) {
    var nav = document.querySelector('.nav');
    if (!nav || !link || !varSheet) { return; }
    var n = nav.getBoundingClientRect(), r = link.getBoundingClientRect();
    var sx = nav.scrollLeft || 0; // on phones the menu scrolls sideways
    if (instant) { root.classList.add('pill-instant'); }
    setVars({ '--pill-x': Math.round(r.left - n.left + sx) + 'px', '--pill-y': Math.round(r.top - n.top) + 'px', '--pill-w': Math.round(r.width) + 'px', '--pill-h': Math.round(r.height) + 'px' });
    if (instant) {
      void nav.offsetWidth;
      window.requestAnimationFrame(function () { root.classList.remove('pill-instant'); });
    }
    root.classList.add('pill-ready');
  }
  function currentNavLink() { return document.querySelector('.nav a[aria-current="page"]'); }
  function initPill() {
    var nav = document.querySelector('.nav'), current = currentNavLink();
    // Phones: if the current item is outside the scrolled menu, bring it into view.
    if (nav && current && nav.scrollWidth > nav.clientWidth && current.offsetLeft + current.offsetWidth > nav.clientWidth) { nav.scrollLeft = current.offsetLeft - 16; }
    if (!varSheet) { return; }
    movePill(current, true);
    var pending = false;
    window.addEventListener('resize', function () {
      if (pending) { return; }
      pending = true;
      window.requestAnimationFrame(function () { movePill(currentNavLink(), true); pending = false; });
    });
  }

  // Leaving a page: the highlight slides to the chosen item and the content fades out, then the next page opens.
  function initPageTransitions() {
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a[data-internal]') : null;
      if (!link || reduceMotion || event.defaultPrevented) { return; }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) { return; }
      if (link.getAttribute('aria-current') === 'page') { return; }
      event.preventDefault();
      var href = link.getAttribute('href');
      var target = document.querySelector('.nav a[data-internal="' + link.getAttribute('data-internal') + '"]');
      if (target && root.classList.contains('pill-ready')) {
        target.classList.add('is-target');
        root.classList.add('navigating');
        movePill(target, false);
      }
      root.classList.add('leaving');
      window.setTimeout(function () { window.location.href = href; }, 280);
    });
    // Coming back with the browser's Back button can show the saved page: undo the leaving state.
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) { return; }
      root.classList.remove('leaving', 'navigating');
      var marked = document.querySelectorAll('.nav a.is-target');
      for (var i = 0; i < marked.length; i++) { marked[i].classList.remove('is-target'); }
      movePill(currentNavLink(), true);
    });
  }

  function fadeText() {
    var main = document.querySelector('main');
    if (!main || reduceMotion) { return; }
    main.classList.remove('lang-swap');
    void main.offsetWidth;
    main.classList.add('lang-swap');
  }

  function init() {
    initVarSheet();
    initSpotlight();
    var saved = safeGet('theme');
    if (saved === 'dark' || saved === 'light') { applyTheme(saved); }
    syncThemeButton();
    applyLang(detectLang());
    initPill();
    void document.body.offsetHeight; // settle the final look while transitions are still off, so nothing slides into place
    root.classList.remove('i18n-pending');
    initPageTransitions();

    var buttons = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (event) {
        applyLang(event.currentTarget.getAttribute('data-lang'));
        fadeText();
        movePill(currentNavLink(), false);
      });
    }
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        safeSet('theme', next);
        syncThemeButton();
      });
    }
  }

  // The script sits at the end of <body>, so the page is already parsed: translate at once, before the first paint.
  if (document.querySelector('.site-footer')) { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
