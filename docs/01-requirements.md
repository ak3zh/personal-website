# 01. Requirements

Project: personal website of Akezhan Bekov (KBTU, Information Systems), course task TSIS #01.
Status of this document: iteration 2 (see "Iterations and checkpoints").

## 1. Audience, goals, scope

**Audience:** teachers and classmates at KBTU, future employers or internship recruiters, anyone who follows the GitHub profile.
**Goals:** (1) show who the author is, what he studies and builds; (2) work in Kazakh, Russian and English; (3) publish nothing private; (4) stay small, fast, accessible and easy to maintain.
**In scope:** five static pages, a language switcher, a light/dark theme, GitHub contact link, privacy statement, automated tests, deployment to free hosting over HTTPS.
**Out of scope (excluded on purpose):** contact form, login/authentication, comments, analytics, cookies, a database, a CMS, photographs, a paid domain or hosting, a blog.
**Constraints:** free hosting only (InfinityFree + free subdomain); no purchases; individual work; no private identifiers, home address, phone, grades or documents; deadline 6 Dec 2026 23:59:59.

## 2. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The home page shows a short introduction, key facts (university, high school, GitHub) and links to the main sections. | Must |
| FR-02 | A language selector (KK, RU, EN) is present on every page and translates all visible text, the page title, the meta description and the accessible labels, and sets the `lang` attribute of the page. | Must |
| FR-03 | The education page shows KBTU, the School of Information Technology and Engineering, the major (Information Systems) and the previous high school. | Must |
| FR-04 | The education page lists the completed subjects with a short, general description. | Must |
| FR-05 | The projects page lists the projects with technologies and a link only where the project is public and safe to link. | Must |
| FR-06 | The interests page shows hobbies and future plans. Achievements are shown only if the author states real ones (none stated, so none shown). | Must |
| FR-07 | The contact page offers GitHub as the only contact method and a short privacy statement and credits. | Must |
| FR-08 | Main navigation is present on every page and marks the current page. | Must |
| FR-09 | The chosen language is kept when the visitor moves to another page and after reload; an unsupported `?lang=` value falls back to a supported language. | Must |
| FR-10 | The visitor can switch between a light and a dark theme; the choice is remembered on the device. | Could |
| FR-11 | Every page has a skip link to the main content. | Should |
| FR-12 | An unknown address shows the site's own error page (status 404) in the chosen language with a link to the home page. | Should |
| FR-13 | Motion that helps orientation: the menu underline slides to the chosen section, content fades out and the next page's blocks rise in, cards react to hover, a soft glow follows the mouse on the background, text fades in after a language change. All of it is off when the visitor asks for reduced motion. | Could |
| FR-14 | Content blocks are laid out in a grid (three columns on desktop, two on tablets, one on phones) instead of one long column. | Should |

## 3. Non-functional requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-01 | Accessibility: semantic landmarks, one `h1` per page, named buttons, visible keyboard focus, text contrast of at least 4.5:1 in both themes. | Tests T-09, T-10, T-11 |
| NFR-02 | Responsive layout from 320 px to 1920 px without horizontal scrolling. | Test T-06 |
| NFR-03 | Performance: the whole site is under 100 KB; any page with its CSS and JS is under 60 KB; no external requests. | Test T-18, T-13 |
| NFR-04 | Security: Content-Security-Policy, no inline scripts/styles/handlers, `rel="noopener noreferrer"` on external links, text inserted with `textContent` only, HTTPS on the public site. | Tests T-07, T-13; deployed check D-02 |
| NFR-05 | Privacy: no cookies, analytics, forms or tracking; no phone number, address, grades or documents are published. | Tests T-08, T-17; content inventory |
| NFR-06 | Internationalisation: UTF-8; Kazakh-specific letters render correctly; all three dictionaries have the same keys. | Tests T-05, T-15; manual M-01 |
| NFR-07 | Dependability: the site works when browser storage is blocked and shows readable English text if JavaScript is off; no JavaScript errors. | Tests T-12, T-16 |
| NFR-08 | Maintainability: no runtime dependencies; one dictionary file is the single source of text; README and AGENTS.md explain how to build, test and deploy. | Repository review |
| NFR-09 | Compatibility with current Chrome, Edge, Firefox and Safari. | T-BROWSER (Chromium run; Firefox and WebKit not run here), manual M-03 |
| NFR-10 | Respect the "reduce motion" preference. | Test T-14 |
| NFR-11 | Every reused component and its licence is identified. | docs/04-design.md section 6 |
| NFR-12 | Server rules on the host: HTTP redirects to HTTPS; security headers (CSP with frame-ancestors, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy); UTF-8. | T-24 (file), T-25 (public site) |
| NFR-13 | Visual stability: the header does not move, flash another language or change colour when a page opens; a saved dark theme is applied before the first paint. | T-21, T-23 |

## 4. User stories and acceptance criteria

**US-01.** As a Kazakh-speaking visitor I want to read the site in Kazakh so that I understand it without translating.
- AC-01. *Given* the page is opened with `?lang=kk`, *When* it has loaded, *Then* the headings, navigation and text are Kazakh and `<html lang>` is `kk`.

**US-02.** As a visitor I want to change the language on any page so that I can choose the language I prefer.
- AC-02. *Given* any of the five pages, *When* I press KK, RU or EN, *Then* all text on that page changes to the chosen language without a reload and the pressed button is marked with `aria-pressed="true"`.
- AC-03. *Given* I chose Kazakh on the home page, *When* I open the projects page from the navigation, *Then* it is shown in Kazakh.
- AC-04. *Given* the address contains `?lang=xx`, *When* the page loads, *Then* a supported language is used and no script from the value is executed.

**US-03.** As a recruiter I want to see the education and subjects quickly so that I can judge the background.
- AC-05. *Given* the education page in any language, *When* it loads, *Then* KBTU, SITE, Information Systems, the high school and five subjects are shown.

**US-04.** As a visitor I want to see the projects and open the public code so that I can check the work.
- AC-06. *Given* the projects page, *When* it loads, *Then* three projects are listed, links appear only for projects that are publicly reachable, and each external link opens safely (`rel="noopener noreferrer"`).

**US-05.** As a visitor on a phone I want the pages to fit the screen so that I do not scroll sideways.
- AC-07. *Given* a viewport of 320, 375, 768, 1280 or 1920 px, *When* any page in any language is shown, *Then* there is no horizontal scrolling.

**US-06.** As a keyboard or screen-reader user I want a clear structure so that I can navigate without a mouse.
- AC-08. *Given* the keyboard only, *When* I press Tab from the top of a page, *Then* the skip link comes first, the language buttons can be reached and operated with Enter, and the focus outline is visible.
- AC-09. *Given* either theme, *When* any text is shown, *Then* the contrast with its background is at least 4.5:1.
- AC-17. *Given* a screen reader, *When* it reads the language buttons and the theme button, *Then* the buttons have names (Қазақша, Русский, English) and the theme button is named "Dark theme" (translated) and states whether it is on.

**US-07.** As a privacy-minded visitor I want to know what the site collects so that I can trust it.
- AC-10. *Given* the contact page, *When* it loads, *Then* a privacy statement is shown, the site has no forms or text fields, and no phone number or e-mail address appears on any page.

**US-08.** As a visitor with strict browser settings I want the site to keep working so that blocked storage does not break it.
- AC-11. *Given* browser storage throws an error, *When* I use the language and theme buttons, *Then* they still work and there are no JavaScript errors.

**US-09.** As a visitor sensitive to motion I want animations reduced.
- AC-12. *Given* "reduce motion" is on, *When* the home page loads, *Then* the title animation is off.

**US-10.** As a visitor I want the same navigation everywhere so that I never feel lost.
- AC-13. *Given* any page, *When* it loads, *Then* the five navigation links are present and the current page has `aria-current="page"`.

**US-11.** As a visitor who followed a broken link I want a clear error page so that I can get back to the site.
- AC-18. *Given* an unknown address (also inside folders), *When* it opens, *Then* the server answers 404 with the site's styled page in my language, a link to the home page and `noindex`.

**US-12.** As a visitor with a mouse I want smooth, calm motion so that I see where I am going.
- AC-19. *Given* a desktop browser, *When* I click a menu item, *Then* the underline slides to it, the content fades out and the next page's content rises in, with my language kept; *When* I move the mouse, *Then* a soft glow follows it on the background and adds no style attributes; with reduced motion none of this happens.

**US-13.** As a visitor I want the content in a compact grid so that I can scan it quickly.
- AC-20. *Given* the education, projects, interests or contact page, *When* it is shown at 1280 px, *Then* the cards are in rows of three (or two); at 375 px they are in one column.

**US-14.** As a visitor I want a calm header so that pages do not jump.
- AC-21. *Given* a saved language and dark theme, *When* I open any page, *Then* the header has the same size and place on every page, nothing in it animates on load and no English text flashes first; on phones the header stays short and the current menu item is visible.

**Technical acceptance criteria (not tied to one story):**
- AC-14. The pages are UTF-8, Kazakh letters (ә ғ қ ө ұ ү і) are rendered, and the public site is served over HTTPS.
- AC-15. The whole site is smaller than 100 KB.
- AC-16. The site works in Chrome/Edge, Firefox and Safari.
- AC-22. The server rules file forces HTTPS and sends the security headers, and the public site behaves accordingly.

## 5. Prioritised backlog (MoSCoW)

| Rank | Item | Priority | Iteration |
|---|---|---|---|
| 1 | FR-02, FR-09 language switching and persistence | Must | 1 |
| 2 | FR-01, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08 page content and navigation | Must | 1 |
| 3 | NFR-04, NFR-05 security and privacy | Must | 1 |
| 4 | NFR-01, NFR-02 accessibility and responsive layout | Must | 1 |
| 5 | Automated test suite and traceability | Must | 2 |
| 6 | Visual redesign (Cruip-inspired own CSS) | Should | 2 |
| 7 | FR-10 light/dark theme, FR-11 skip link | Should / Could | 2 |
| 8 | Accessible names for language/theme buttons (found by review) | Should | 2 |
| 9 | Deployment, public-URL tests, screenshots, tag | Must | 3 |
| 10 | `hreflang` links with absolute URLs (after the URL is known) | Could | 4 |
| 11 | FR-13 motion, FR-14 grid, minimalist header (author's feedback) | Should / Could | 3 |
| 12 | FR-12 error page, NFR-12 server rules, NFR-13 visual stability | Should | 3 |

## 6. Iterations and teacher checkpoints

| Iteration | Content | Status |
|---|---|---|
| 1 | Requirements, first version of the five pages with three languages, plain visual style | Done |
| 2 | Visual redesign, dictionary completed (79 keys x 3), automated tests, review fixes | Done |
| 3 | Changes after the author reviewed the site in his browser: cursor glow, page transitions and hover motion, grid layout, minimalist header without a logo, fixes for header jumps, error page, server rules | Done |
| 4 | Deployment on free hosting, tests against the public URL, release tag, report | In progress |

| Checkpoint | What was checked | What changed afterwards |
|---|---|---|
| #01 Requirements | Pending: not yet held when this document was written | To be filled in after the teacher's feedback |
| #02 Design | Pending | To be filled in |
| #03 Prototype | Pending | To be filled in |
| #04 Quality | Pending | To be filled in |
| #05 Launch | Pending | To be filled in |

Changes made on the author's own decisions (not from checkpoints): only GitHub is shown as an account and AI tool names are not shown on the site, on the author's instruction; the link to the CRM repository was removed because the repository is private; the author's name stays in Russian spelling in Kazakh; the visual style was changed to a Cruip-inspired one at the author's request; after looking at the site in Chrome the author asked for a glow that follows the mouse, smooth transitions and hover motion, cards in a grid instead of one column, a header that does not jump, and a more minimal header without the logo badge (iteration 3).
