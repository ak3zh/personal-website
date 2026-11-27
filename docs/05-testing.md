# 05. Testing and traceability

Automated suite: `tests/run-tests.js` (Playwright 1.63). Run: `node tests/run-tests.js` for the local files, or `BASE=https://your-site/ node tests/run-tests.js` for the public site. Results of the last local run (2026-11-27): see below. Mutation checks: six deliberate faults were put into a copy of the site (an empty Kazakh text, a removed CSP, low-contrast grey text, a removed reduced-motion rule, a removed rel attribute on an external link, a removed language-button name); the suite failed T-05, T-13, T-11, T-14, T-07 and T-09, exactly the six affected checks, and passed the rest. Later checks of the same kind: hiding the cursor glow under the page background failed T-19 (the test compares screen pixels); removing the early theme and the style settling step failed T-23.

## 1. Automated checks and results (local files, Chromium)

| Test | Check | Covers | Result |
|---|---|---|---|
| T-05 | Translations complete: every key has non-empty kk, ru and en text; every key used in HTML exists; page titles/descriptions translated | AC-02, NFR-06 | PASS (keys=84 missing=0 unknown=0) |
| T-11 | Accessibility: text/background contrast >= 4.5:1 in light and dark themes | AC-09 | PASS (min ratio 5.93) |
| T-18 | Performance: whole site under 100 KB; any page with its CSS and JS under 60 KB | AC-15 | PASS (site total 72.3 KB in 12 files; largest page bundle 50.3 KB) |
| T-24 | Server rules file: 404 page, forced HTTPS, security headers, UTF-8 | AC-22 | PASS (all rules present (checked as text; behaviour is T-25)) |
| T-25 | Public site: http redirects to https, security headers are sent | AC-22, AC-14 | NOT RUN (needs the public URL (BASE=https://...)) |
| T-01@chromium | Navigation: 5 pages load, nav links work, aria-current correct | AC-13 | PASS |
| T-02@chromium | Language switch KK/RU/EN on every page changes h1 and html lang | AC-01, AC-02 | PASS |
| T-03@chromium | Chosen language persists to another page | AC-03 | PASS (Жобалар) |
| T-04@chromium | URL ?lang=ru applied; invalid ?lang=xx falls back to a supported language | AC-04 | PASS (ru->ru, xx->en) |
| T-06@chromium | Responsive: no horizontal scroll at 320/375/768/1280/1920 px (5 pages x 3 languages) | AC-07 | PASS |
| T-07@chromium | Links: external links have rel=noopener, internal links point to existing pages | AC-06 | PASS |
| T-08@chromium | Forms: site has no forms or text inputs (nothing to submit or validate) | AC-10 | PASS |
| T-09@chromium | Accessibility structure: one h1, landmarks, skip link, button names, title, description, lang | AC-08, AC-17 | PASS |
| T-10@chromium | Keyboard: skip link first, language buttons reachable and operable, focus outline visible | AC-08 | PASS (first=skip reached=true lang=kk outline=true) |
| T-12@chromium | Error handling: site still works when browser storage is blocked | AC-11, AC-17 | PASS (errors=0) |
| T-13@chromium | Security: CSP meta, no inline scripts/styles/handlers, no external resources, crafted ?lang value is not executed | AC-04, AC-10 (NFR-04) | PASS |
| T-14@chromium | Reduced motion: hero animation disabled when the user asks for less motion | AC-12 | PASS (animationName=none) |
| T-15@chromium | Encoding and deployed checks: UTF-8, Kazakh letters present in text (local run: HTTPS not applicable) | AC-14 (local part) | PASS (charset=UTF-8 kk letters on home: әғқөұүі) |
| T-17@chromium | Content: required facts in all 3 languages, 5 subjects, 3 projects, no phone/e-mail-like data, home links in first screen | AC-01, AC-05, AC-10 | PASS |
| T-19@chromium | Cursor spotlight follows the mouse, adds no style attribute, is off with reduced motion and on touch screens | AC-19 | PASS |
| T-20@chromium | Motion and grid: menu underline sits under the current item and slides on navigation, content fades out then in, language kept, cards in 3 columns on desktop and 1 on phones, no motion with reduced motion | AC-19, AC-20 | PASS |
| T-21@chromium | No header jump: same header box on every page, stable scrollbar space, untranslated text never shown, page still readable without JavaScript | AC-21 | PASS |
| T-22@chromium | Error page: unknown address (also inside folders) returns status 404 with a styled page in the chosen language, a working link home and noindex | AC-18 | PASS |
| T-23@chromium | Header steady and compact: saved theme applied before the first paint, nothing in the header animates when a page opens, on phones the header stays short and the current menu item is visible | AC-21 | PASS |
| T-16@chromium | No JavaScript errors on any visited page | AC-11 | PASS |
| T-BROWSER@firefox | Compatibility run in firefox | AC-16 | NOT RUN (browser not installed in this environment) |
| T-BROWSER@webkit | Compatibility run in webkit | AC-16 | NOT RUN (browser not installed in this environment) |

Firefox and WebKit are **not run**: those browsers are not installed in the development environment. They are recorded as NOT RUN, not as passed; manual test M-03 and the deployed-site checks cover them.

## 2. Manual tests (author and a second person)

| ID | Test | Who | Result |
|---|---|---|---|
| M-01 | Open the public site on a real phone; read the Kazakh version; check that ә ғ қ ң ө ұ ү һ і render with no boxes or substituted glyphs | Author | PENDING (after deployment) |
| M-02 | User test: a second person (not the author) is asked, without help, to (a) switch the site to Kazakh, (b) find the education page, (c) open the GitHub link, (d) say what the site does not collect. Record time, errors and comments | Second person | PENDING: must be done with a real person; no result is invented |
| M-03 | Open the public site in Safari and Firefox; click through five pages and three languages | Author | PENDING |
| M-04 | Keyboard-only pass over the five pages; check the focus order and the skip link | Author | PENDING |

## 3. Checks on the deployed site

| ID | Check | Result |
|---|---|---|
| D-01 | `BASE=<public URL> node tests/run-tests.js`: all pages, languages, assets; look for host-injected scripts or banners | PENDING |
| D-02 | The address starts with https and the certificate is valid; the http address redirects or fails safely | PENDING |
| D-03 | Every page opens in each language through the public URL and Kazakh letters are correct | PENDING |
| D-04 | No file from the repository other than `site/` is reachable on the host | PENDING |

## 4. Traceability: acceptance criterion to test to result

| AC | Criterion (short) | Tests | Result |
|---|---|---|---|
| AC-01 | Kazakh text and lang=kk on load | T-02, T-17 | PASS (Chromium) |
| AC-02 | Language buttons change all text | T-02, T-05 | PASS |
| AC-03 | Language kept on the next page | T-03 | PASS |
| AC-04 | Invalid ?lang falls back, no script runs | T-04, T-13 | PASS |
| AC-05 | Education facts and 5 subjects in 3 languages | T-17 | PASS |
| AC-06 | 3 projects, safe external links | T-07, T-17 | PASS |
| AC-07 | No horizontal scroll 320 to 1920 px | T-06 | PASS |
| AC-08 | Keyboard use, skip link, focus visible | T-09, T-10, M-04 | PASS automated; M-04 pending |
| AC-09 | Contrast at least 4.5:1 | T-11 | PASS (min 5.93) |
| AC-10 | Privacy text, no forms, no phone/e-mail | T-08, T-13, T-17 | PASS |
| AC-11 | Works with storage blocked, no JS errors | T-12, T-16 | PASS |
| AC-12 | Reduced motion respected | T-14 | PASS |
| AC-13 | Navigation on every page, current page marked | T-01 | PASS |
| AC-14 | UTF-8, Kazakh letters, HTTPS | T-15, D-02, D-03, M-01 | Local part PASS; HTTPS and deployed parts PENDING |
| AC-15 | Site under 100 KB | T-18 | PASS (see T-18) |
| AC-16 | Works in Chrome/Edge, Firefox, Safari | T-BROWSER, M-03, D-01 | Chromium only; Firefox and WebKit NOT RUN |
| AC-17 | Accessible names for language/theme buttons | T-09, T-12 | PASS |
| AC-18 | Own 404 page, status 404, link home, noindex | T-22 | PASS (local server that behaves like the host); public site PENDING |
| AC-19 | Sliding underline, page fade, cursor glow; off with reduced motion | T-19, T-20 | PASS |
| AC-20 | Cards in a grid on desktop, one column on phones | T-20 | PASS |
| AC-21 | Header steady and compact, no English flash, saved theme before paint | T-21, T-23 | PASS |
| AC-22 | HTTPS redirect and security headers | T-24, T-25 | File PASS; public site NOT RUN until deployment |

## 5. Security checks

- Secret scan of the repository outside `docs/`: no matches for `password|passwd|secret|token|api key|private key` (run 2026-11-27). The word appears in documents only as part of the text of the risk assessment.
- External requests: none (T-13). Forms: none (T-08).

## 6. Test limitations

The suite checks structure, behaviour, contrast, layout overflow and encoding. It does not judge translation quality, visual taste or real-device rendering; those are covered by the author's review and by M-01 and M-02.
