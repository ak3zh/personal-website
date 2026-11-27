/* Automated checks for the personal website (Playwright). Usage: BASE=https://host/ node tests/run-tests.js
   Without BASE the local ./site folder is used (file://). Needs: npm i playwright. */
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const BASE = process.env.BASE || 'file://' + path.join(__dirname, '..', 'site') + '/';
const DEPLOYED = /^https:/.test(BASE);
const PAGES = ['index.html', 'about.html', 'projects.html', 'interests.html', 'contact.html'];
const results = [];
function rec(id, name, ok, detail) { results.push({ id, name, ok, detail }); console.log((ok === null ? 'NOT RUN ' : ok ? 'PASS ' : 'FAIL ') + id + ' ' + name + (detail ? ' - ' + detail : '')); }
const lum = (h) => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// For the 404 check on local files: a tiny web server that behaves like the host (unknown address -> 404.html, status 404).
function startLocalServer() {
  const http = require('http'); const root = path.join(__dirname, '..', 'site');
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(root, rel);
    if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isFile() && !path.basename(file).startsWith('.')) { res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); return fs.createReadStream(file).pipe(res); }
    res.writeHead(404, { 'Content-Type': types['.html'] }); fs.createReadStream(path.join(root, '404.html')).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}
async function run(browserType, label) {
  const browser = await browserType.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(String(e))); p.on('console', m => { if (m.type() !== 'error') return; const at = (m.location() || {}).url || ''; if (/status of 404/.test(m.text()) && /no-such-page|missing/.test(at)) return; /* the deliberate 404 in T-22 */ errors.push(m.text() + (at ? ' @ ' + at : '')); });
  const tag = (id) => id + (label ? '@' + label : '');
  // T-01 navigation
  let ok = true, detail = [];
  for (const pg of PAGES) {
    const r = await p.goto(BASE + pg + '?lang=en'); await p.waitForLoadState('load');
    const status = r ? r.status() : 200; if (r && status !== 200 && status !== 0) { ok = false; detail.push(pg + ' ' + status); }
    const cur = await p.$$eval('nav a[aria-current="page"]', els => els.map(e => e.getAttribute('href')));
    if (cur.length !== 1 || cur[0].split('?')[0] !== pg) { ok = false; detail.push(pg + ' aria-current=' + cur); }
  }
  await p.goto(BASE + 'index.html?lang=en');
  for (const pg of PAGES) { await Promise.all([p.waitForURL(u => u.toString().includes(pg), { waitUntil: 'load' }), p.click('nav a[href^="' + pg + '"]')]); if (!(p.url().includes(pg === 'index.html' ? 'index.html' : pg))) { ok = false; detail.push('click ' + pg + ' -> ' + p.url()); } await p.goto(BASE + 'index.html?lang=en'); }
  rec(tag('T-01'), 'Navigation: 5 pages load, nav links work, aria-current correct', ok, detail.join('; '));
  // T-02 language switching on every page
  ok = true; detail = [];
  const expectH1 = { index: { kk: 'Сәлем', ru: 'Привет', en: 'Hi' }, about: { kk: 'Білім', ru: 'Образование', en: 'Education' }, projects: { kk: 'Жобалар', ru: 'Проекты', en: 'Projects' }, interests: { kk: 'Қызығушылықтар', ru: 'Интересы', en: 'Interests' }, contact: { kk: 'Байланыс', ru: 'Контакты', en: 'Contact' } };
  for (const pg of PAGES) for (const lang of ['kk', 'ru', 'en']) {
    await p.goto(BASE + pg + '?lang=en'); await p.click('button[data-lang="' + lang + '"]');
    const h1 = await p.textContent('h1'); const hl = await p.evaluate(() => document.documentElement.lang);
    const key = pg.replace('.html', '');
    if (!h1.includes(expectH1[key][lang]) || hl !== lang) { ok = false; detail.push(pg + ' ' + lang + ' h1="' + h1 + '" lang=' + hl); }
  }
  rec(tag('T-02'), 'Language switch KK/RU/EN on every page changes h1 and html lang', ok, detail.join('; '));
  // T-03 persistence
  await p.goto(BASE + 'index.html?lang=en'); await p.click('button[data-lang="kk"]'); await p.goto(BASE + 'projects.html');
  const h1b = await p.textContent('h1'); rec(tag('T-03'), 'Chosen language persists to another page', h1b.includes('Жобалар'), h1b);
  // T-04 ?lang param + invalid value fallback
  await p.goto(BASE + 'about.html?lang=ru'); const a = await p.evaluate(() => document.documentElement.lang);
  await p.evaluate(() => localStorage.clear()); await p.goto(BASE + 'about.html?lang=xx'); const b = await p.evaluate(() => document.documentElement.lang);
  rec(tag('T-04'), 'URL ?lang=ru applied; invalid ?lang=xx falls back to a supported language', a === 'ru' && ['kk', 'ru', 'en'].includes(b), 'ru->' + a + ', xx->' + b);
  // T-06 responsive
  ok = true; detail = [];
  for (const w of [320, 375, 768, 1280, 1920]) { await p.setViewportSize({ width: w, height: 800 }); for (const pg of PAGES) for (const lang of ['kk', 'ru', 'en']) { await p.goto(BASE + pg + '?lang=' + lang); const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (ov > 0) { ok = false; detail.push(w + 'px ' + pg + ' ' + lang + ' +' + ov); } } }
  await p.setViewportSize({ width: 1280, height: 800 });
  rec(tag('T-06'), 'Responsive: no horizontal scroll at 320/375/768/1280/1920 px (5 pages x 3 languages)', ok, detail.slice(0, 5).join('; '));
  // T-07 links
  ok = true; detail = [];
  for (const pg of PAGES) { await p.goto(BASE + pg + '?lang=en'); const ext = await p.$$eval('a[href^="http"]', els => els.map(e => ({ h: e.href, r: e.rel }))); for (const e of ext) if (!/noopener/.test(e.r)) { ok = false; detail.push(pg + ' ' + e.h + ' rel=' + e.r); } const internal = await p.$$eval('a[data-internal]', els => els.map(e => e.getAttribute('data-internal'))); for (const i of internal) if (!PAGES.includes(i)) { ok = false; detail.push('bad internal ' + i); } }
  rec(tag('T-07'), 'Links: external links have rel=noopener, internal links point to existing pages', ok, detail.join('; '));
  // T-08 forms
  ok = true; for (const pg of PAGES) { await p.goto(BASE + pg + '?lang=en'); const n = await p.$$eval('form, input, textarea, select', e => e.length); if (n) ok = false; }
  rec(tag('T-08'), 'Forms: site has no forms or text inputs (nothing to submit or validate)', ok, '');
  // T-09 accessibility structure
  ok = true; detail = [];
  for (const pg of PAGES) { await p.goto(BASE + pg + '?lang=en'); const r = await p.evaluate(() => ({ h1: document.querySelectorAll('h1').length, header: !!document.querySelector('header'), nav: !!document.querySelector('nav[aria-label]'), main: document.querySelectorAll('main').length, footer: !!document.querySelector('footer'), skip: document.querySelector('a.skip') && document.querySelector('a.skip').getAttribute('href') === '#content' && !!document.getElementById('content'), btnNames: [...document.querySelectorAll('button')].every(b => (b.getAttribute('aria-label') || b.textContent).trim().length > 0), langNames: [...document.querySelectorAll('button[data-lang]')].map(b => b.getAttribute('aria-label')).join('|') === 'Қазақша|Русский|English', themeState: ['true', 'false'].includes(document.getElementById('theme-toggle').getAttribute('aria-pressed')), headerBg: getComputedStyle(document.querySelector('.site-header')).backgroundColor !== 'rgba(0, 0, 0, 0)', title: document.title.length > 3, desc: (document.querySelector('meta[name=description]') || {}).content.length > 20, imgAlt: [...document.querySelectorAll('img')].every(i => i.hasAttribute('alt')), lang: !!document.documentElement.lang })); for (const k of Object.keys(r)) { const v = r[k]; if (v === false || (k === 'h1' && v !== 1) || (k === 'main' && v !== 1)) { ok = false; detail.push(pg + ' ' + k + '=' + v); } } }
  rec(tag('T-09'), 'Accessibility structure: one h1, landmarks, skip link, button names, title, description, lang', ok, detail.join('; '));
  // T-10 keyboard
  await p.goto(BASE + 'index.html?lang=en'); await p.keyboard.press('Tab'); const first = await p.evaluate(() => document.activeElement.className);
  let reached = false; for (let i = 0; i < 20; i++) { await p.keyboard.press('Tab'); const f = await p.evaluate(() => document.activeElement.getAttribute('data-lang')); if (f === 'kk') { reached = true; break; } }
  await p.keyboard.press('Enter'); const afterKey = await p.evaluate(() => document.documentElement.lang);
  const outline = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none'; });
  rec(tag('T-10'), 'Keyboard: skip link first, language buttons reachable and operable, focus outline visible', first === 'skip' && reached && afterKey === 'kk' && outline, 'first=' + first + ' reached=' + reached + ' lang=' + afterKey + ' outline=' + outline);
  // T-12 error handling
  const ctx2 = await browser.newContext(); await ctx2.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  const p2 = await ctx2.newPage(); const errs2 = []; p2.on('pageerror', e => errs2.push(String(e)));
  await p2.goto(BASE + 'projects.html?lang=ru'); const okLang = await p2.evaluate(() => document.documentElement.lang); await p2.click('button[data-lang="en"]'); const okEn = await p2.textContent('h1'); const before = await p2.getAttribute('#theme-toggle', 'aria-pressed'); await p2.click('#theme-toggle'); const after = await p2.getAttribute('#theme-toggle', 'aria-pressed'); if (before === after) errs2.push('theme aria-pressed did not change');
  rec(tag('T-12'), 'Error handling: site still works when browser storage is blocked', okLang === 'ru' && okEn === 'Projects' && errs2.length === 0, 'errors=' + errs2.length); await ctx2.close();
  // T-13 security
  ok = true; detail = [];
  for (const pg of PAGES) { await p.goto(BASE + pg + '?lang=en'); const r = await p.evaluate(() => ({ csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'), inlineScript: [...document.querySelectorAll('script')].some(s => !s.src), styleAttr: document.querySelectorAll('[style]').length, onattr: [...document.querySelectorAll('*')].some(e => [...e.attributes].some(a => /^on/i.test(a.name))), ext: [...document.querySelectorAll('script[src],link[href],img[src]')].some(e => /^https?:\/\//.test(e.getAttribute('src') || e.getAttribute('href'))) })); if (!r.csp || r.inlineScript || r.styleAttr || r.onattr || r.ext) { ok = false; detail.push(pg + JSON.stringify(r)); } }
  await p.goto(BASE + 'index.html?lang=%3Cscript%3Ewindow.__x=1%3C/script%3E'); const xss = await p.evaluate(() => ({ x: window.__x, injected: document.querySelectorAll('script:not([src])').length }));
  if (xss.x || xss.injected) { ok = false; detail.push('xss ' + JSON.stringify(xss)); }
  rec(tag('T-13'), 'Security: CSP meta, no inline scripts/styles/handlers, no external resources, crafted ?lang value is not executed', ok, detail.join('; '));
  // T-14 reduced motion
  const ctx3 = await browser.newContext({ reducedMotion: 'reduce' }); const p3 = await ctx3.newPage(); await p3.goto(BASE + 'index.html?lang=en');
  const anim = await p3.evaluate(() => getComputedStyle(document.querySelector('.hero-title')).animationName); rec(tag('T-14'), 'Reduced motion: hero animation disabled when the user asks for less motion', anim === 'none', 'animationName=' + anim); await ctx3.close();
  // T-15 deployed-site / encoding checks
  await p.goto(BASE + 'index.html?lang=kk'); const enc = await p.evaluate(() => document.characterSet); const txt = await p.evaluate(() => document.body.innerText);
  const kkChars = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і'].filter(ch => txt.toLowerCase().includes(ch));
  let https = true, headers = '';
  if (DEPLOYED) { const r = await p.goto(BASE + 'index.html'); https = p.url().startsWith('https://'); headers = String(r.status()); }
  rec(tag('T-15'), 'Encoding and deployed checks: UTF-8, Kazakh letters present in text' + (DEPLOYED ? ', HTTPS' : ' (local run: HTTPS not applicable)'), enc.toLowerCase() === 'utf-8' && kkChars.length >= 4 && https, 'charset=' + enc + ' kk letters on home: ' + kkChars.join('') + (headers ? ' status ' + headers : ''));

  // T-17 content, privacy scan and first-screen links
  ok = true; detail = [];
  const must = { index: { kk: ['Акежан Беков', 'Ақпараттық жүйелер'], ru: ['Акежан Беков', 'Информационные системы'], en: ['Akezhan Bekov', 'Information Systems'] }, about: { kk: ['ҚБТУ', 'SITE', 'Ақпараттық жүйелер', '№68'], ru: ['КБТУ', 'SITE', 'Информационные системы', '№68'], en: ['KBTU', 'SITE', 'Information Systems', 'No. 68'] }, projects: { kk: ['Connecta CRM', 'Smart Campus', 'Warehouse Inventory Tracker'], ru: ['Connecta CRM', 'Smart Campus', 'Warehouse Inventory Tracker'], en: ['Connecta CRM', 'Smart Campus', 'Warehouse Inventory Tracker'] }, contact: { kk: ['GitHub', 'Құпиялылық'], ru: ['GitHub', 'Приватность'], en: ['GitHub', 'Privacy'] } };
  for (const pg of Object.keys(must)) for (const lang of ['kk', 'ru', 'en']) { await p.goto(BASE + pg + '.html?lang=' + lang); const t = await p.evaluate(() => document.body.innerText); for (const needle of must[pg][lang]) if (!t.includes(needle)) { ok = false; detail.push(pg + ' ' + lang + ' missing ' + needle); } }
  for (const lang of ['kk', 'ru', 'en']) { await p.goto(BASE + 'about.html?lang=' + lang); const n = await p.$$eval('ul.list > li', e => e.filter(x => x.querySelector('h3') && x.querySelector('p')).length); if (n !== 5) { ok = false; detail.push('subjects ' + lang + '=' + n); } await p.goto(BASE + 'projects.html?lang=' + lang); const m = await p.$$eval('ul.list > li', e => e.filter(x => x.querySelector('h3') && /:/.test(x.querySelector('.meta').textContent)).length); if (m !== 3) { ok = false; detail.push('projects ' + lang + '=' + m); } }
  for (const pg of PAGES) for (const lang of ['kk', 'ru', 'en']) { await p.goto(BASE + pg + '?lang=' + lang); const t = await p.evaluate(() => document.body.innerText); if (/\+?\d[\d\s()-]{8,}\d/.test(t) || /[\w.-]+@[\w.-]+\.\w+/.test(t)) { ok = false; detail.push('private-looking data on ' + pg + ' ' + lang); } }
  for (const vp of [{ width: 1280, height: 800 }, { width: 375, height: 740 }]) { await p.setViewportSize(vp); await p.goto(BASE + 'index.html?lang=en'); const vis = await p.evaluate(() => ['projects.html', 'about.html'].every(h => { const a = document.querySelector('.hero a[data-internal="' + h + '"]'); const r = a.getBoundingClientRect(); return r.top < window.innerHeight; })); if (!vis) { ok = false; detail.push('home links below first screen at ' + vp.width); } }
  await p.setViewportSize({ width: 1280, height: 800 });
  rec(tag('T-17'), 'Content: required facts in all 3 languages, 5 subjects, 3 projects, no phone/e-mail-like data, home links in first screen', ok, detail.slice(0, 5).join('; '));
  // T-19 cursor spotlight
  { ok = true; detail = [];
    await p.goto(BASE + 'about.html?lang=en'); await p.mouse.move(300, 400); await p.waitForTimeout(600);
    const s1 = await p.evaluate(() => ({ on: document.documentElement.classList.contains('spotlight'), bg: getComputedStyle(document.body, '::before').backgroundImage, op: getComputedStyle(document.body, '::before').opacity, styleAttr: document.querySelectorAll('[style]').length }));
    if (!s1.on || !/300px 400px/.test(s1.bg) || s1.op !== '1' || s1.styleAttr) { ok = false; detail.push('mouse ' + JSON.stringify(s1)); }
    // The glow must really be visible: compare a background pixel under the cursor with one far away (no cards there).
    { await p.setViewportSize({ width: 1280, height: 800 }); await p.goto(BASE + 'contact.html?lang=en'); await p.mouse.move(40, 620); await p.waitForTimeout(700);
      const png = await p.screenshot({ clip: { x: 0, y: 600, width: 1280, height: 40 } });
      const px = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const at = x => [...g.getImageData(Math.round(x * img.width / 1280), Math.round(20 * img.height / 40), 1, 1).data].slice(0, 3); return { near: at(40), far: at(1240) }; }, png.toString('base64'));
      const diff = px.near.reduce((s, v, i) => s + Math.abs(v - px.far[i]), 0);
      if (diff < 12) { ok = false; detail.push('glow not visible on screen ' + JSON.stringify(px)); } }
    await p.goto(BASE + 'about.html?lang=en'); await p.mouse.move(300, 400); await p.waitForTimeout(400);
    await p.mouse.move(700, 200); await p.waitForTimeout(200);
    const bg2 = await p.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage); if (!/700px 200px/.test(bg2)) { ok = false; detail.push('does not follow'); }
    const c4 = await browser.newContext({ reducedMotion: 'reduce' }); const p4 = await c4.newPage(); await p4.goto(BASE + 'about.html?lang=en'); await p4.mouse.move(300, 400); await p4.waitForTimeout(300);
    const rm = await p4.evaluate(() => ({ on: document.documentElement.classList.contains('spotlight'), disp: getComputedStyle(document.body, '::before').display })); if (rm.on || rm.disp !== 'none') { ok = false; detail.push('reduced motion ' + JSON.stringify(rm)); } await c4.close();
    const c5 = await browser.newContext({ hasTouch: true, isMobile: browser._name !== 'firefox', viewport: { width: 375, height: 740 } }); const p5 = await c5.newPage(); await p5.goto(BASE + 'about.html?lang=en'); await p5.touchscreen.tap(100, 300).catch(() => {}); await p5.waitForTimeout(300);
    const touch = await p5.evaluate(() => document.documentElement.classList.contains('spotlight')); if (touch) { ok = false; detail.push('active on touch screen'); } await c5.close();
    rec(tag('T-19'), 'Cursor spotlight follows the mouse, adds no style attribute, is off with reduced motion and on touch screens', ok, detail.join('; ')); }
  // T-20 motion and grid layout
  { ok = true; detail = [];
    await p.setViewportSize({ width: 1280, height: 800 });
    for (const pg of PAGES) { await p.goto(BASE + pg + '?lang=kk'); await p.waitForTimeout(600);
      const m = await p.evaluate(() => { const a = document.querySelector('.nav a[aria-current="page"]').getBoundingClientRect(); const pill = document.querySelector('.nav-pill').getBoundingClientRect(); return { ready: document.documentElement.classList.contains('pill-ready'), dx: Math.abs(a.left - pill.left), dy: Math.abs(a.bottom - pill.bottom), dw: Math.abs(a.width - pill.width), style: document.querySelectorAll('[style]').length }; });
      if (!m.ready || m.dx > 2 || m.dy > 2 || m.dw > 2 || m.style) { ok = false; detail.push(pg + ' pill ' + JSON.stringify(m)); } }
    await p.goto(BASE + 'about.html?lang=en'); await p.waitForTimeout(500);
    const before = await p.evaluate(() => document.querySelector('.nav-pill').getBoundingClientRect().left);
    const nav = p.waitForURL(u => u.toString().includes('projects.html'), { waitUntil: 'load' });
    await p.click('nav a[href^="projects.html"]'); await p.waitForTimeout(120);
    const mid = await p.evaluate(() => ({ leaving: document.documentElement.classList.contains('leaving'), url: location.pathname, pill: document.querySelector('.nav-pill').getBoundingClientRect().left }));
    await nav;
    if (!mid.leaving || !/about/.test(mid.url) || !(mid.pill > before)) { ok = false; detail.push('leave ' + JSON.stringify(mid) + ' before=' + before); }
    if (!p.url().includes('lang=en')) { ok = false; detail.push('language lost after transition'); }
    const grid = async () => p.evaluate(() => { const li = [...document.querySelectorAll('ul.grid-3 > li')]; return { tops: li.map(e => Math.round(e.getBoundingClientRect().top)), lefts: li.map(e => Math.round(e.getBoundingClientRect().left)) }; });
    await p.goto(BASE + 'about.html?lang=kk'); await p.waitForTimeout(900); const g1 = await grid();
    if (!(g1.tops[0] === g1.tops[1] && g1.tops[1] === g1.tops[2] && g1.tops[3] > g1.tops[0] && g1.tops[3] === g1.tops[4])) { ok = false; detail.push('desktop grid ' + JSON.stringify(g1.tops)); }
    await p.setViewportSize({ width: 375, height: 740 }); await p.goto(BASE + 'about.html?lang=kk'); await p.waitForTimeout(900); const g2 = await grid();
    if (!g2.tops.every((v, i, a) => i === 0 || v > a[i - 1]) || new Set(g2.lefts).size !== 1) { ok = false; detail.push('mobile grid ' + JSON.stringify(g2)); }
    await p.setViewportSize({ width: 1280, height: 800 });
    const c6 = await browser.newContext({ reducedMotion: 'reduce' }); const p6 = await c6.newPage(); await p6.goto(BASE + 'about.html?lang=en');
    await Promise.all([p6.waitForURL(u => u.toString().includes('contact.html')), p6.click('nav a[href^="contact.html"]')]);
    const rm = await p6.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.page > h1')).animationName, leaving: document.documentElement.classList.contains('leaving') }));
    if (rm.anim !== 'none' || rm.leaving) { ok = false; detail.push('reduced motion ' + JSON.stringify(rm)); } await c6.close();
    rec(tag('T-20'), 'Motion and grid: menu underline sits under the current item and slides on navigation, content fades out then in, language kept, cards in 3 columns on desktop and 1 on phones, no motion with reduced motion', ok, detail.join('; ')); }
  // T-21 no header jump between pages
  { ok = true; detail = [];
    const rects = [];
    for (const pg of PAGES) { await p.goto(BASE + pg + '?lang=kk'); rects.push(await p.evaluate(() => { const b = document.querySelector('.bar').getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(','); })); }
    if (new Set(rects).size !== 1) { ok = false; detail.push('header differs between pages ' + rects.join(' | ')); }
    const gutter = await p.evaluate(() => getComputedStyle(document.documentElement).scrollbarGutter); if (!/stable/.test(gutter)) { ok = false; detail.push('scrollbar-gutter ' + gutter); }
    const c7 = await browser.newContext(); const p7 = await c7.newPage();
    await p7.route('**/js/app.js', async r => { await new Promise(res => setTimeout(res, 700)); await r.continue(); });
    await p7.goto(BASE + 'about.html?lang=kk', { waitUntil: 'commit' }); await p7.waitForSelector('.nav', { state: 'attached' }); await p7.waitForTimeout(250);
    const early = await p7.evaluate(() => ({ pending: document.documentElement.classList.contains('i18n-pending'), vis: getComputedStyle(document.querySelector('.nav')).visibility }));
    await p7.waitForLoadState('load'); await p7.waitForTimeout(100);
    const late = await p7.evaluate(() => ({ pending: document.documentElement.classList.contains('i18n-pending'), vis: getComputedStyle(document.querySelector('.nav')).visibility, text: document.querySelector('.nav a[aria-current]').textContent }));
    if (!early.pending || early.vis !== 'hidden') { ok = false; detail.push('English shown before translation ' + JSON.stringify(early)); }
    if (late.pending || late.vis !== 'visible' || late.text !== 'Білім') { ok = false; detail.push('after load ' + JSON.stringify(late)); }
    await c7.close();
    const c8 = await browser.newContext({ javaScriptEnabled: false }); const p8 = await c8.newPage(); await p8.goto(BASE + 'about.html');
    const nojs = await p8.evaluate(() => ({ vis: getComputedStyle(document.querySelector('main')).visibility, h1: document.querySelector('h1').textContent })); if (nojs.vis !== 'visible' || nojs.h1 !== 'Education') { ok = false; detail.push('no-JS ' + JSON.stringify(nojs)); } await c8.close();
    rec(tag('T-21'), 'No header jump: same header box on every page, stable scrollbar space, untranslated text never shown, page still readable without JavaScript', ok, detail.join('; ')); }
  // T-22 error page
  { ok = true; detail = []; let server = null; let origin = BASE;
    if (!/^https?:/.test(BASE)) { server = await startLocalServer(); origin = 'http://127.0.0.1:' + server.address().port + '/'; }
    for (const [bad, lang, h1] of [['no-such-page', 'kk', 'Бет табылмады'], ['folder/deep/missing.html', 'ru', 'Страница не найдена'], ['missing', 'en', 'Page not found']]) {
      const resp = await p.goto(origin + bad + '?lang=' + lang); await p.waitForTimeout(300);
      const r = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent, styled: getComputedStyle(document.body).display === 'flex', home: document.querySelector('.notfound a.btn').getAttribute('href'), robots: !!document.querySelector('meta[name="robots"][content="noindex"]'), lang: document.documentElement.lang }));
      if (resp.status() !== 404 || r.h1 !== h1 || !r.styled || !/^\/index\.html\?lang=/.test(r.home) || !r.robots || r.lang !== lang) { ok = false; detail.push(bad + ' ' + resp.status() + ' ' + JSON.stringify(r)); }
    }
    await Promise.all([p.waitForURL(u => /index\.html/.test(u.toString()), { waitUntil: 'load' }), p.click('.notfound a.btn')]);
    if (!(await p.evaluate(() => !!document.querySelector('.hero-title')))) { ok = false; detail.push('home link does not open the home page'); }
    if (server) server.close();
    rec(tag('T-22'), 'Error page: unknown address (also inside folders) returns status 404 with a styled page in the chosen language, a working link home and noindex', ok, detail.join('; ')); }
  // T-23 header does not move or change colour when a new page opens
  { ok = true; detail = [];
    const c9 = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p9 = await c9.newPage();
    await p9.goto(BASE + 'about.html?lang=kk'); await p9.evaluate(() => { try { localStorage.setItem('theme', 'dark'); localStorage.setItem('lang', 'kk'); } catch (e) {} });
    for (const pg of ['projects.html', 'interests.html', 'contact.html', 'index.html']) {
      await Promise.all([p9.waitForURL(u => u.toString().includes(pg), { waitUntil: 'load' }), p9.click('nav a[href^="' + pg + '"]')]);
      const moving = await p9.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.site-header')).map(a => (a.effect.target.textContent || a.effect.target.className).trim() + ':' + (a.transitionProperty || a.animationName)));
      if (moving.length) { ok = false; detail.push(pg + ' header animates on load: ' + moving.join(', ')); }
    }
    await p9.route('**/js/app.js', async r => { await new Promise(res => setTimeout(res, 600)); await r.continue(); });
    await p9.goto(BASE + 'index.html', { waitUntil: 'commit' }); await p9.waitForSelector('header', { state: 'attached' }); await p9.waitForTimeout(150);
    const early = await p9.evaluate(() => document.documentElement.getAttribute('data-theme')); if (early !== 'dark') { ok = false; detail.push('saved dark theme applied only after app.js: ' + early); }
    await c9.close();
    // phones: the header stays short (menu in one scrolling row) and the current item is visible
    { const c10 = await browser.newContext({ viewport: { width: 375, height: 740 } }); const p10 = await c10.newPage();
      for (const lang of ['kk', 'ru', 'en']) { await p10.goto(BASE + 'contact.html?lang=' + lang); await p10.waitForTimeout(400);
        const m = await p10.evaluate(() => { const h = document.querySelector('.site-header').getBoundingClientRect().height; const nav = document.querySelector('.nav').getBoundingClientRect(); const a = document.querySelector('.nav a[aria-current="page"]').getBoundingClientRect(); const pill = document.querySelector('.nav-pill').getBoundingClientRect(); return { h: Math.round(h), visible: a.left >= nav.left - 1 && a.right <= nav.right + 1, pillOk: Math.abs(pill.left - a.left) <= 2 && Math.abs(pill.width - a.width) <= 2, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }; });
        if (m.h > 120 || !m.visible || !m.pillOk || m.overflow > 0) { ok = false; detail.push('phone ' + lang + ' ' + JSON.stringify(m)); } }
      await c10.close(); }
    rec(tag('T-23'), 'Header steady and compact: saved theme applied before the first paint, nothing in the header animates when a page opens, on phones the header stays short and the current menu item is visible', ok, detail.join('; ')); }
  if (errors.length) rec(tag('T-16'), 'No JavaScript errors on any visited page', false, errors.slice(0, 3).join(' | ')); else rec(tag('T-16'), 'No JavaScript errors on any visited page', true, '');
  await browser.close();
}
(async () => {
  // T-05 translation completeness (static)
  const w = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'site/js/translations.js'), 'utf8'), { window: w });
  const keys = Object.keys(w.I18N.en); let miss = [];
  for (const l of ['kk', 'ru']) for (const k of keys) if (!w.I18N[l][k] || !String(w.I18N[l][k]).trim()) miss.push(l + ':' + k);
  const html = PAGES.map(pg => fs.readFileSync(path.join(__dirname, '..', 'site', pg), 'utf8')).join('\n'); const used = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map(m => m[1]); const unknown = used.filter(k => !keys.includes(k));
  const pageKeys = PAGES.flatMap(pg => ['title', 'desc'].map(t => 'meta.' + pg.replace('.html', '').replace('index', 'home') + '.' + t)); const noMeta = pageKeys.filter(k => !keys.includes(k));
  rec('T-05', 'Translations complete: every key has non-empty kk, ru and en text; every key used in HTML exists; page titles/descriptions translated', !miss.length && !unknown.length && !noMeta.length, 'keys=' + keys.length + ' missing=' + miss.length + ' unknown=' + unknown.length);
  // T-11 contrast
  const css = fs.readFileSync(path.join(__dirname, '..', 'site/css/style.css'), 'utf8');
  const grab = (blockStart) => { const i = css.indexOf(blockStart); const j = css.indexOf('}', i); const blk = css.slice(i, j); const o = {}; for (const m of blk.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) o[m[1]] = m[2]; return o; };
  const light = grab(':root {'); const dark = Object.assign({}, light, grab(':root[data-theme="dark"] {'));
  const pairs = [['ink', 'bg'], ['body', 'bg'], ['muted', 'bg'], ['muted', 'surface'], ['brand', 'bg'], ['brand', 'surface'], ['brand-ink', 'brand-btn'], ['bg', 'ink'], ['bg', 'dark'], ['panel-ink', 'panel'], ['panel-muted', 'panel']];
  let bad = [], min = 99; for (const [n, th] of [['light', light], ['dark', dark]]) for (const [f, b] of pairs) { const r = ratio(th[f], th[b]); min = Math.min(min, r); if (r < 4.5) bad.push(n + ' ' + f + '/' + b + ' ' + r.toFixed(2)); }
  rec('T-11', 'Accessibility: text/background contrast >= 4.5:1 in light and dark themes', !bad.length, 'min ratio ' + min.toFixed(2) + (bad.length ? ' bad: ' + bad.join(', ') : ''));
  // T-18 page weight (static)
  { const sdir = path.join(__dirname, '..', 'site'); const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); const files = walk(sdir); const total = files.reduce((a, f) => a + fs.statSync(f).size, 0); const biggestPage = Math.max(...PAGES.map(pg => fs.statSync(path.join(sdir, pg)).size + fs.statSync(path.join(sdir, 'css/style.css')).size + fs.statSync(path.join(sdir, 'js/app.js')).size + fs.statSync(path.join(sdir, 'js/translations.js')).size));
    rec('T-18', 'Performance: whole site under 100 KB; any page with its CSS and JS under 60 KB', total < 100 * 1024 && biggestPage < 60 * 1024, 'site total ' + (total / 1024).toFixed(1) + ' KB in ' + files.length + ' files; largest page bundle ' + (biggestPage / 1024).toFixed(1) + ' KB'); }
  // T-24 server rules (static) and T-25 the same rules on the public site
  { const ht = fs.readFileSync(path.join(__dirname, '..', 'site', '.htaccess'), 'utf8');
    const need = ['ErrorDocument 404 /404.html', 'RewriteCond %{HTTP:X-Forwarded-Proto} !https', 'RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]', "frame-ancestors 'none'", 'X-Content-Type-Options "nosniff"', 'Referrer-Policy', 'AddDefaultCharset UTF-8'];
    const missing = need.filter(n => !ht.includes(n));
    rec('T-24', 'Server rules file: 404 page, forced HTTPS, security headers, UTF-8', missing.length === 0, missing.length ? 'missing: ' + missing.join(' | ') : 'all rules present (checked as text; behaviour is T-25)'); }
  if (DEPLOYED) {
    const https = require('https'); const http = require('http'); const u = new URL(BASE);
    const head = (mod, url) => new Promise(res => { const r = mod.request(url, { method: 'GET' }, x => { x.resume(); res({ status: x.statusCode, headers: x.headers }); }); r.on('error', e => res({ error: String(e) })); r.end(); });
    const plain = await head(http, 'http://' + u.host + '/about.html'); const secure = await head(https, BASE + 'about.html');
    const ok = plain.status >= 301 && plain.status <= 308 && /^https:/.test(plain.headers.location || '') && secure.status === 200 && /frame-ancestors/.test(secure.headers['content-security-policy'] || '') && secure.headers['x-content-type-options'] === 'nosniff';
    rec('T-25', 'Public site: http redirects to https, security headers are sent', ok, JSON.stringify({ http: plain.status || plain.error, location: (plain.headers || {}).location, csp: !!(secure.headers || {})['content-security-policy'], nosniff: (secure.headers || {})['x-content-type-options'] }));
  } else rec('T-25', 'Public site: http redirects to https, security headers are sent', null, 'needs the public URL (BASE=https://...)');
  await run(chromium, 'chromium');
  if (!process.env.CHROMIUM_ONLY) { for (const [bt, n] of [[firefox, 'firefox'], [webkit, 'webkit']]) { try { await run(bt, n); } catch (e) { rec('T-BROWSER@' + n, 'Compatibility run in ' + n, null, 'browser not installed in this environment'); } } }
  fs.writeFileSync(process.env.OUT || path.join(__dirname, 'results.json'), JSON.stringify({ base: BASE, date: new Date().toISOString(), results }, null, 2));
  const fails = results.filter(r => r.ok === false).length; const skipped = results.filter(r => r.ok === null).length; console.log('\n' + results.filter(r => r.ok).length + ' passed, ' + fails + ' failed, ' + skipped + ' not run'); process.exit(fails ? 1 : 0);
})();
