# 08. AI use log

Tool: Claude Code (Anthropic), model `claude-sonnet-5-5` ("Claude Sonnet 5.5"), used in the Claude desktop/web app with file, shell, browser and Playwright tools. The author directed the work, supplied all personal facts and decisions, and must review and approve the result. Nothing in the site is claimed to be written without review.

**Important limitation of this log.** The conversation was long and was compacted once to continue. The author's prompts below are quoted exactly. The assistant's earlier full replies were not kept word for word after the compaction, so entries marked "full reply: from chat" must be copied by the author from the chat history into `03_AI_Evidence.pdf`. Descriptions of results are summaries, and each links to files or tests that can be checked.

## Context engineering

- A short summary of the course task (requirements, deadlines, eight assessed tasks, package format) was kept at the start of every continuation of the session.
- Standing constraints were kept as explicit rules: do not touch the CRM repository; do not publish teammates' names or demo passwords; show GitHub as the only account and no AI tool names on the site; keep the Russian spelling of the name; never type passwords; ask before publishing.
- The content was limited to facts the author gave; the one exception (plans) was labelled as drafted at his request.
- Source material for design: the Cruip template page (read for look only).
- Tests and the traceability table were used as the "memory" of what the site must do.

## Exchanges

### 1. Planning (understand the task)
- **Author's prompt (exact):** `@Lesson_14_-_Software_Engineering_-_TSIS_01.pdf что тут надо делать`
- **Assistant reply:** an explanation in Russian of the task, the eight assessed parts, the package files and the questions needed to start. Full reply: from chat.
- **Result:** list of required decisions (major, school, subjects, contact, projects, interests, plans).
- **Author's evaluation:** to be written by the author.

### 2. Content questions
- **Author's prompts (exact):** `Information systems, школа SITE, пройденные предметы computer networks, Basics of Information Systems, Fundamentals of Business for Information Systems, Cybersecurity Management, Soft skills in English`; then answers to the assistant's questions: high school `Гимназия №68, Алматы`; contact `GitHub`; `Без фото, минимализм`; projects `Smart Campus, Warehouse Inventory Tracker, CRM систему с другого предмета`; link `https://github.com/ak3zh/connecta-crm`; interests `программирование, спорт, музыка, автомобильный спорт, автомобили`; achievements `нет`; plans `придумай сам`; name `оставь как на русском`; to the question whether two more personal details could be mentioned on the site: `нет`.
- **Assistant reply:** questions, then a content plan. Full reply: from chat.
- **Result:** content inventory (`docs/02`). Plans were flagged as drafted by the assistant.

### 3. Implementation (first usable site)
- **Prompt:** the author's decisions above, with the instruction to build and publish an original trilingual site.
- **Assistant action:** wrote `translations.js` (en/ru/kk), `build.js`, five pages, `style.css`, `app.js`; checked screenshots in three languages on desktop and mobile.
- **Result:** the first usable version (iteration 1). The exact first output was overwritten by later edits; the repository history (once published) starts from the first commit that contains it. Author's evaluation: to be written.

### 4. Design change
- **Author's prompt (exact):** `используй этот дизайн на сайте https://github.com/cruip/tailwind-landing-page-template`
- **Assistant action:** read the template's page; found it is Next.js/Tailwind and GPL-3.0; recreated only the look in original CSS and credited it; warned about similarity risk.
- **Result:** `site/css/style.css`; credit text on the Contact page; decision DD-2 and licence table in `docs/04`.
- **Author's evaluation:** to be written.

### 5. Testing
- **Prompt (author's standing task):** the TSIS requirement for at least 12 tests with a traceability table.
- **Assistant action:** wrote `tests/run-tests.js` (16 checks first, 18 after adding content and page-weight checks); ran it; made a mutated copy of the site (emptied Kazakh key, removed CSP, low contrast, disabled reduced-motion rule, removed `rel`) and confirmed the suite fails on exactly those.
- **Result:** `docs/05-testing.md`; local run 18 passed, 0 failed, 2 not run (Firefox, WebKit).

### 6. Debugging
- **Problems found while testing:** (a) selectors `nav a[href="index.html"]` failed because the script appends `?lang=`; fixed by matching the start of the attribute; (b) the caption in the dark panel was always "Akezhan Bekov" in every language; fixed with `data-i18n="site.name"`; (c) a messy leftover block in test T-15 was rewritten.
- **Evidence:** tests T-01, T-02, T-15 pass after the fixes.

### 7. Refactoring and review
- **Assistant action:** read the final files against accessibility, security, compatibility, maintainability and privacy criteria; five findings (see `docs/07-code-review.md`): 3 accepted (A1-A3), 1 corrected (C1), 1 rejected (R1). `build.js` now also copies `translations.js` into `site/js/` so there is one source.
- **Evidence:** diff of `build.js`, `style.css`, `app.js`; tests T-09 and T-12 extended; mutation check failed T-09 as expected.

### 8. Re-check of everything
- **Author's prompt (exact):** `перепроверь все`
- **Assistant action:** re-read all 79 keys in three languages, the documents, the repository and the screenshots; re-ran the tests and the mutation check.
- **Found and fixed:** Kazakh wording (the word for a UI theme, "live demo", "completed subjects", two subject descriptions, the major phrase); the theme button's name contradicted its pressed state; on desktop the Kazakh navigation pushed the language buttons under the name, so the header was reorganised into two rows with matching focus order; the CRM repository turned out to be private (link removed earlier); personal details the author did not want named were removed from the public documents; the requirement IDs were put in order.
- **Evidence:** tests 18 passed, 0 failed, 2 not run; mutation check 6 of 6 faults detected; new screenshots.
- **Author's evaluation:** to be written.

### 9. Cursor glow
- **Author's prompt (exact):** `а можно ли сделать чтоб на сайте за мышкой следовала подсвечивающаяся область на фоне, как это называется?`
- **Assistant reply:** named the effect (cursor spotlight / cursor glow), added it: a radial gradient on a fixed background layer, position from `pointermove` via `requestAnimationFrame`, values in a constructed style sheet (CSP stays strict), off on touch screens and with reduced motion. Test T-19 added.
- **Follow-up prompt (exact):** `там не работает этот эффект который ты делал` → the copy in the author's Downloads folder was stale; recopied and verified by checksum.

### 10. Motion and grid layout
- **Author's prompt (exact):** `мне надо чтоб была плавная анимация когда я навожусь и переключаю между разделами и как то еало блоки с текстом расставиьть не сверху вниз, а в сетку`
- **Assistant action:** sliding menu highlight, fade-out before navigation and staggered rise-in of blocks, hover lift on cards and buttons, text fade after a language change; cards in a 3/2/1-column grid. Test T-20 added; T-03 updated to wait for the delayed navigation.

### 11. Debugging the header jumps
- **Author's prompts (exact):** `при переключении вкладок шапка дергается`, then `шапка дергается при переключении разделов, пропал эффект обводки за мышкой`
- **Assistant action:** measured which header elements animate on page load (language button, theme colours, menu highlight), found the light-to-dark flash and the English flash, and found that its own earlier CSS change had hidden the glow. Fixes and the new pixel-based test are described in `docs/07-code-review.md` (P1, P2). Tests T-21 and T-23 added.

### 12. Error page
- **Author's prompt (exact):** `пока сделай это` (about the suggestion to add an own 404 page)
- **Assistant action:** `404.html` in three languages with root-relative links, `ErrorDocument` rule, test T-22 with a small local server that behaves like the host.

### 13. Minimalist header
- **Author's prompt (exact):** `дизайн шапки надо поменять, более минималистчино, без аватарки`
- **Assistant action:** removed the logo badge and the floating card; one row with a sliding underline; the subtitle moved to the footer; phones get a single sideways-scrolling menu row.

### 14. Server rules and publishing the changes
- **Author's prompt (exact):** `делай тогда` (about adding `.htaccess` and pushing the changes to GitHub)
- **Assistant action:** `.htaccess` with forced HTTPS (rule from the host's guide), security headers, UTF-8; test T-24 (file) and T-25 (public site, after deployment); documents updated.

From entry 9 on, the assistant's complete replies are kept in the session record and can be copied into `03_AI_Evidence.pdf` word for word.

### 15. Deployment and report (in progress)
Entries for deployment, public-URL tests and the report are added when they happen.
