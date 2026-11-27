# AGENTS.md: rules for coding agents working in this repository

## What this project is
A static, three-language personal website (kk, ru, en) for Akezhan Bekov. Deployed as plain files to free hosting. The author is a student; the site must stay small and understandable.

## Hard rules
1. **No private data.** Never add phone numbers, e-mail addresses, home address, student ID, grades, documents, photos or names of other people. Do not copy demo accounts or passwords from other repositories.
2. **No secrets.** No passwords, tokens, FTP details or keys in any file, commit message or screenshot.
3. **No external requests.** No CDN, web fonts, analytics, trackers or third-party scripts. The Content-Security-Policy is `default-src 'self'`.
4. **No inline code.** No inline `<script>`, `style=` attributes or `on*=` handlers. Insert text with `textContent`, never `innerHTML`.
5. **Three languages stay in sync.** Every key in `translations.js` needs non-empty `en`, `ru` and `kk` text. Keep the author's name in Russian spelling in Kazakh. GitHub is the only contact or social link; do not add other accounts, and do not name AI tools on the site.
6. **Do not invent facts.** Add no achievements, grades, employers or project claims the author did not state.
7. **Do not touch other repositories.** In particular `ak3zh/connecta-crm` is read-only: never push, commit or edit there.
8. **No new dependencies.** The site has none. Development tools (Playwright, Mermaid CLI) stay out of `site/`.
9. **Respect licences.** The Cruip template is GPL-3.0 and is inspiration only: do not copy its code or assets.

## Workflow
- Edit `translations.js`, `build.js`, `site/css/style.css` or `site/js/app.js`; run `node build.js`; commit the generated HTML together with the source.
- Run `node tests/run-tests.js` before every commit. All checks must pass; checks that cannot run must show as NOT RUN, never as passed.
- Small commits with a message that says what changed and why. Keep `docs/` in step with the code (requirement and test IDs: FR-, NFR-, US-, AC-, T-).
- Unused code, placeholders and commented-out code are removed, not left behind.

## Motion
- Every animation must stop under `prefers-reduced-motion: reduce`, and the site must work without JavaScript.
- Never write `style` attributes from JavaScript: put numbers into the constructed style sheet in `app.js` (`setVars`). Tests T-19 and T-20 fail on style attributes.
- Nothing in the header may animate when a page opens (test T-23).

## Style
Semantic HTML, one `h1` per page, landmarks, visible focus, contrast of at least 4.5:1, no horizontal scrolling at 320 px. Plain, short sentences in the texts.
