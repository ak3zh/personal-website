const fs = require('fs'); const vm = require('vm'); const path = require('path');
const w = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'translations.js'), 'utf8'), { window: w });
const EN = w.I18N.en;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const T = (k, tag = 'span', attrs = '') => `<${tag}${attrs} data-i18n="${k}">${esc(EN[k])}</${tag}>`;
const pages = [['home', 'index.html', 'nav.home'], ['about', 'about.html', 'nav.about'], ['projects', 'projects.html', 'nav.projects'], ['interests', 'interests.html', 'nav.interests'], ['contact', 'contact.html', 'nav.contact']];
const sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.5-.1-1-.2-1.5A6 6 0 0 1 13.5 3.2 9 9 0 0 0 12 3z"/></svg>';
// root is '' for normal pages and '/' for 404.html, which the server shows at any wrong address (also inside folders).
function layout(page, file, body, root = '') {
  const nav = pages.map(([p, f, k]) => `<li><a href="${root}${f}" data-internal="${root}${f}"${p === page ? ' aria-current="page"' : ''} data-i18n="${k}">${esc(EN[k])}</a></li>`).join('\n            ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">
  <meta name="description" content="${esc(EN['meta.' + page + '.desc'])}">
  <title>${esc(EN['meta.' + page + '.title'])}</title>
  <link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${root}css/style.css">
  <script src="${root}js/early.js"></script>${page === 'notfound' ? '\n  <meta name="robots" content="noindex">' : ''}
</head>
<body data-page="${page}">
  <a class="skip" href="#content" data-i18n="a11y.skip">${esc(EN['a11y.skip'])}</a>
  <header class="site-header">
    <div class="bar">
      <a class="brand" href="${root}index.html" data-internal="${root}index.html"><span class="brand-text">${T('site.name')}</span></a>
      <nav class="nav" aria-label="${esc(EN['a11y.nav'])}" data-i18n-aria="a11y.nav">
        <span class="nav-pill" aria-hidden="true"></span>
        <ul>
            ${nav}
        </ul>
      </nav>
      <div class="tools">
        <div class="lang" role="group" aria-label="${esc(EN['a11y.lang'])}" data-i18n-aria="a11y.lang">
          <button type="button" data-lang="kk" lang="kk" aria-label="Қазақша" aria-pressed="false">KK</button>
          <button type="button" data-lang="ru" lang="ru" aria-label="Русский" aria-pressed="false">RU</button>
          <button type="button" data-lang="en" lang="en" aria-label="English" aria-pressed="true">EN</button>
        </div>
        <button type="button" class="theme-btn" id="theme-toggle" aria-pressed="false" aria-label="${esc(EN['theme.toggle'])}" data-i18n-aria="theme.toggle">${sun}</button>
      </div>
    </div>
  </header>
  <main id="content">
${body}
  </main>
  <footer class="site-footer">
    <div class="wrap foot">${T('footer.text')}${T('site.role', 'span', ' class="foot-role"')}</div>
  </footer>
  <script src="${root}js/translations.js"></script>
  <script src="${root}js/app.js"></script>
</body>
</html>
`;
}
const subj = ['net', 'isb', 'biz', 'sec', 'soft'].map(s => `        <li><h3>${T('subj.' + s + '.n')}</h3><p class="muted">${T('subj.' + s + '.d')}</p></li>`).join('\n');
const proj = (id, links) => `        <li>
          <h3>${T('proj.' + id + '.n')}</h3>
          <p>${T('proj.' + id + '.d')}</p>
          <p class="meta">${T('projects.tech')} ${T('proj.' + id + '.t')}</p>
          <div class="links">${links}</div>
        </li>`;
const ext = (href, k) => `<a href="${href}" rel="noopener noreferrer" data-i18n="${k}">${esc(EN[k])}</a>`;
const body = {
  home: `      <h1 data-i18n="home.h1">${esc(EN['home.h1'])}</h1>
      <p class="lead" data-i18n="home.lead">${esc(EN['home.lead'])}</p>
      <p data-i18n="home.studies">${esc(EN['home.studies'])}</p>
      <div class="actions">
        <a class="btn primary" href="projects.html" data-internal="projects.html" data-i18n="home.cta.projects">${esc(EN['home.cta.projects'])}</a>
        <a class="btn secondary" href="about.html" data-internal="about.html" data-i18n="home.cta.about">${esc(EN['home.cta.about'])}</a>
      </div>`,
  about: `      <h1 data-i18n="about.h1">${esc(EN['about.h1'])}</h1>
      <div class="bento">
        <section class="card span-2">
          <h2 data-i18n="about.kbtu.h">${esc(EN['about.kbtu.h'])}</h2>
          <dl class="facts">
            <dt data-i18n="about.kbtu.name">${esc(EN['about.kbtu.name'])}</dt>
            <dd data-i18n="about.kbtu.school">${esc(EN['about.kbtu.school'])}</dd>
            <dd data-i18n="about.kbtu.major">${esc(EN['about.kbtu.major'])}</dd>
          </dl>
        </section>
        <section class="card">
          <h2 data-i18n="about.school.h">${esc(EN['about.school.h'])}</h2>
          <p data-i18n="about.school.name">${esc(EN['about.school.name'])}</p>
        </section>
      </div>
      <h2 data-i18n="about.subjects.h">${esc(EN['about.subjects.h'])}</h2>
      <ul class="list grid-3">
${subj}
      </ul>
      <p class="meta" data-i18n="about.subjects.note">${esc(EN['about.subjects.note'])}</p>`,
  projects: `      <h1 data-i18n="projects.h1">${esc(EN['projects.h1'])}</h1>
      <p class="lead" data-i18n="projects.intro">${esc(EN['projects.intro'])}</p>
      <ul class="list grid-3 projects">
${proj('crm', `<span class="muted" data-i18n="projects.nolink">${esc(EN['projects.nolink'])}</span>`)}
${proj('sc', ext('https://smart-campus-room-av-2h2i.bolt.host', 'projects.demo') + ' ' + ext('https://github.com/ak3zh/smart-campus-practice12', 'projects.code'))}
${proj('wh', `<span class="muted" data-i18n="projects.nolink">${esc(EN['projects.nolink'])}</span>`)}
      </ul>`,
  interests: `      <h1 data-i18n="interests.h1">${esc(EN['interests.h1'])}</h1>
      <p class="lead" data-i18n="interests.intro">${esc(EN['interests.intro'])}</p>
      <ul class="pills">
        <li data-i18n="int.prog">${esc(EN['int.prog'])}</li>
        <li data-i18n="int.sport">${esc(EN['int.sport'])}</li>
        <li data-i18n="int.music">${esc(EN['int.music'])}</li>
        <li data-i18n="int.motor">${esc(EN['int.motor'])}</li>
        <li data-i18n="int.cars">${esc(EN['int.cars'])}</li>
      </ul>
      <h2 data-i18n="plans.h">${esc(EN['plans.h'])}</h2>
      <ul class="list grid-3">
        <li><p data-i18n="plans.1">${esc(EN['plans.1'])}</p></li>
        <li><p data-i18n="plans.2">${esc(EN['plans.2'])}</p></li>
        <li><p data-i18n="plans.3">${esc(EN['plans.3'])}</p></li>
      </ul>`,
  contact: `      <h1 data-i18n="contact.h1">${esc(EN['contact.h1'])}</h1>
      <p class="lead" data-i18n="contact.lead">${esc(EN['contact.lead'])}</p>
      <p><a class="btn primary" href="https://github.com/ak3zh" rel="noopener noreferrer" data-i18n="contact.github">${esc(EN['contact.github'])}</a></p>
      <div class="bento two">
        <section class="card">
          <h2 data-i18n="privacy.h">${esc(EN['privacy.h'])}</h2>
          <p data-i18n="privacy.text">${esc(EN['privacy.text'])}</p>
        </section>
        <section class="card">
          <h2 data-i18n="credits.h">${esc(EN['credits.h'])}</h2>
          <p data-i18n="credits.text">${esc(EN['credits.text'])}</p>
        </section>
      </div>`
};
const glance = `        <div class="window" role="group" aria-label="${esc(EN['site.name'])}">
          <div class="window-bar" aria-hidden="true"><i></i><i></i><i></i><span data-i18n="site.name">${esc(EN["site.name"])}</span></div>
          <dl class="window-body">
            <div><dt data-i18n="about.kbtu.h">${esc(EN['about.kbtu.h'])}</dt><dd data-i18n="about.kbtu.name">${esc(EN['about.kbtu.name'])}</dd></div>
            <div><dt data-i18n="about.school.h">${esc(EN['about.school.h'])}</dt><dd data-i18n="about.school.name">${esc(EN['about.school.name'])}</dd></div>
            <div><dt data-i18n="contact.h1">${esc(EN['contact.h1'])}</dt><dd><a href="https://github.com/ak3zh" rel="noopener noreferrer" data-i18n="contact.github">${esc(EN['contact.github'])}</a></dd></div>
          </dl>
        </div>`;
body.home = `    <section class="hero"><div class="wrap">\n` + body.home.replace('<h1 ', '<h1 class="hero-title" ').replace('<p class="lead"', '<p class="lead hero-lead"').replace('<div class="actions">', '<div class="actions center">') + `\n` + glance + `\n    </div></section>`;
for (const k of ['about', 'projects', 'interests', 'contact']) body[k] = `    <div class="page wrap">\n` + body[k] + `\n    </div>`;
for (const [p, f] of pages) fs.writeFileSync(path.join(__dirname, 'site', f), layout(p, f, body[p]));
const notFound = `    <section class="hero notfound"><div class="wrap">
      <p class="nf-code" aria-hidden="true">404</p>
      <h1 class="hero-title" data-i18n="nf.h1">${esc(EN['nf.h1'])}</h1>
      <p class="lead hero-lead" data-i18n="nf.text">${esc(EN['nf.text'])}</p>
      <div class="actions center">
        <a class="btn primary" href="/index.html" data-internal="/index.html" data-i18n="nf.home">${esc(EN['nf.home'])}</a>
      </div>
    </div></section>`;
fs.writeFileSync(path.join(__dirname, 'site', '404.html'), layout('notfound', '404.html', notFound, '/'));
fs.writeFileSync(path.join(__dirname, 'site', '.htaccess'), [
  '# Server rules for the free host (Apache). Each block is skipped if the module is not available.',
  '',
  '# 1. The site\'s own trilingual error page for unknown addresses.',
  'ErrorDocument 404 /404.html',
  '',
  '# 2. Always HTTPS (rule recommended by InfinityFree; the extra conditions prevent redirect loops behind a proxy).',
  '<IfModule mod_rewrite.c>',
  '  RewriteEngine On',
  '  RewriteCond %{HTTP:X-Forwarded-Proto} !https',
  '  RewriteCond %{HTTPS} off',
  '  RewriteCond %{HTTP:CF-Visitor} !{"scheme":"https"}',
  '  RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
  '</IfModule>',
  '',
  '# 3. Security headers. The CSP repeats the meta tag in the pages and adds what a meta tag cannot: frame-ancestors (no embedding in other sites).',
  '<IfModule mod_headers.c>',
  '  Header always set Content-Security-Policy "default-src \'self\'; img-src \'self\' data:; base-uri \'none\'; form-action \'none\'; frame-ancestors \'none\'; object-src \'none\'"',
  '  Header always set X-Frame-Options "DENY"',
  '  Header always set X-Content-Type-Options "nosniff"',
  '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  '  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"',
  '</IfModule>',
  '',
  '# 4. Correct text encoding for every page, script and style sheet.',
  'AddDefaultCharset UTF-8',
  '<IfModule mod_mime.c>',
  '  AddCharset UTF-8 .html .css .js .svg',
  '</IfModule>',
  ''
].join('\n'));
fs.writeFileSync(path.join(__dirname, 'site/assets/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#14181c"/><text x="32" y="42" font-family="Arial, sans-serif" font-size="28" font-weight="700" text-anchor="middle" fill="#ffffff">AB</text><path d="M8 54h48" stroke="#e8a900" stroke-width="3" stroke-dasharray="8 6"/></svg>
`);
console.log('built');
fs.copyFileSync(path.join(__dirname, 'translations.js'), path.join(__dirname, 'site/js/translations.js'));
