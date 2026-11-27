# Personal website of Akezhan Bekov

A small, fast, three-language (Kazakh, Russian, English) personal website: education, completed subjects, projects, interests and plans, and a GitHub contact link. Course task TSIS #01, "AI-Driven Software Engineering", KBTU.

- No frameworks, no runtime dependencies, no external requests, no cookies, no analytics, no forms.
- Language switcher (KK / RU / EN) on every page, light/dark theme, accessible navigation, responsive card grid.
- Calm motion: sliding menu underline, page transitions, hover lift, a soft glow that follows the mouse; all off with "reduce motion".
- Own trilingual 404 page; server rules force HTTPS and send security headers.
- Static files only, so it runs on any free host. Public address: see `04_Demo.txt` of the submission (filled in after deployment).

## Structure

```
site/            the website (upload this folder's contents to the host)
  index.html about.html projects.html interests.html contact.html 404.html
  .htaccess      server rules: own 404 page, forced HTTPS, security headers, UTF-8
  css/style.css  js/early.js  js/app.js  js/translations.js  assets/favicon.svg
translations.js  source of all texts (en, ru, kk); copied to site/js/ by build.js
build.js         generates the six HTML pages and .htaccess from the English dictionary
tests/           automated tests (Playwright)
docs/            requirements, content inventory, risks, design, testing, security, code review, AI log
docs/diagrams/   Mermaid sources and rendered images, wireframes
```

## Use

```
node build.js                  # regenerate site/*.html and copy translations.js
node tests/run-tests.js        # test the local files (needs Playwright with Chromium)
BASE=https://example.freedev.app/ node tests/run-tests.js   # test the public site
```
To view locally: open `site/index.html` in a browser, or run `python3 -m http.server -d site`.

## Change a text

Edit `translations.js` (all three languages must keep the same keys), run `node build.js`, then `node tests/run-tests.js`. Test T-05 fails if a key is missing in any language.

## Deploy (InfinityFree, free)

1. Create a free InfinityFree account and a free subdomain (for example `ak3zh.freedev.app`). Do not buy anything.
2. Open the File Manager (or use FTP with the credentials shown in the control panel) and go to `htdocs`.
3. Delete the default `index2.html` file, then upload the **contents** of `site/`: the six HTML files, the hidden `.htaccess` file and the `css`, `js`, `assets` folders. If the site shows "500 Internal Server Error" after uploading `.htaccess`, the host rejected a rule: remove the headers block and tell the developer.
4. Open the address with `https://`, check every page in all three languages, then run the tests with `BASE=...`.
Never put passwords or FTP details in this repository.

## Quality and process

Documents are in `docs/`: requirements (`01`), content inventory (`02`), privacy and ethics risks (`03`), design and decisions (`04`), testing and traceability (`05`), security review (`06`), agent code review (`07`), AI use log (`08`). The site was developed with Claude Code (Anthropic) as a coding assistant, under the author's direction and review.

## Licence and credits

Code: MIT (see `LICENSE`). Texts and personal facts: all rights reserved by the author. Visual style inspired by the Cruip "Simple Light" template (GPL-3.0); no template code is used. No third-party fonts, images or scripts are included.
