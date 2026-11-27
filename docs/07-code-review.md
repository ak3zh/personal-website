# 07. Agent code review

**Reviewer:** Claude (Anthropic model `claude-sonnet-5-5`, Claude Code environment), in a separate review pass over the finished files `site/*.html`, `site/css/style.css`, `site/js/app.js`, `build.js`, `tests/run-tests.js`. The files were read against these criteria: accessibility, security, compatibility, maintainability and privacy; each finding names the file, the failure scenario and a fix. The same assistant wrote the code, so the review is not independent; this is a limitation. The decisions below are proposed with evidence and must be confirmed by the author.

## Findings

| ID | Suggestion by the reviewer | Decision | Reason and evidence |
|---|---|---|---|
| A1 | The language buttons are named only by the letters "KK", "RU", "EN". A screen reader reads them as letters. Give each an accessible name in its own language. | **Accepted** | Real accessibility gap (WCAG 4.1.2 / 2.5.3). Fixed in `build.js`: `aria-label="Қазақша"`, `"Русский"`, `"English"` (each button already has its own `lang`). Test T-09 now checks the three names; a mutation that removed one name made T-09 fail ("langNames=false"). |
| A2 | `backdrop-filter` and `color-mix()` in the header: a browser without `color-mix()` drops the whole `background` declaration, so the header becomes transparent over the page text. Add a plain fallback colour first. | **Accepted** | Valid CSS cascade behaviour. Fixed: `background: var(--surface);` before the `color-mix()` line in `style.css`. Evidence is the source diff and the T-09 check that the header has a non-transparent background in Chromium. A browser without `color-mix()` is not available here, so the fallback itself was not run (recorded in the test notes). |
| A3 | The theme button changes the page but does not expose its state. Add `aria-pressed` and update it on click and on load. | **Accepted** | Fixed in `build.js` (`aria-pressed="false"`) and `app.js` (`syncThemeButton()` runs on load and after each click). Test T-12 now also fails if `aria-pressed` does not change after a click. |
| C1 | Add `<link rel="alternate" hreflang="kk\|ru\|en">` to every page so that search engines know the language versions. | **Corrected** | The idea is right, but `hreflang` needs absolute URLs and the public address is not known yet. Decision: add the tags after deployment with the real HTTPS URL (`?lang=` addresses plus `x-default`), and re-run the tests. Status: to do at launch (backlog item 10). |
| R1 | Add a contact form with e-mail sending (and basic analytics to see visits), so people can reach the author and he can see traffic. | **Rejected** | Conflicts with requirements NFR-04, NFR-05 and design decision DD-4: a form needs server code (not available on a static page set), input validation, spam protection and stores personal data; analytics need cookies or third-party scripts and break the CSP and the privacy statement. Evidence: T-08 (no forms), T-13 (no external requests), privacy text on the contact page. GitHub is the agreed contact method. |

## Additional observations (not counted above)

- Flash of English text before the script applies Kazakh or Russian: **kept as a documented limitation** (DD-1). Removing it needs inline code (breaks the CSP) or three page sets.
- Re-check after A3: the button label "Switch light/dark theme" did not match the `aria-pressed` state (pressed what?). The label was changed to "Dark theme" / "Тёмная тема" / "Қараңғы режим", so "pressed" means the dark theme is on.
- Re-check of the layout: at 1280 px the long Kazakh navigation pushed the language buttons onto a second line under the name. The header now always has two rows (name with language and theme buttons, then the navigation), the same in all three languages; the HTML order was changed to match, so keyboard focus follows the visual order.
- The `translateX(-1.1rem)` centring of the caption in the dark panel is fragile: left as is because it is cosmetic and visually checked.

## Problems found after the review, during iteration 3

These were found by the author while looking at the site in his own browser, not by the review above. They are listed because they show what the automated checks missed.

| # | Problem | Cause | Fix and evidence |
|---|---|---|---|
| P1 | Header jumped on every page change | (a) the page was drawn in English and translated a moment later; (b) the language button, theme colours and menu highlight animated from their default state to the saved one; (c) a saved dark theme was applied only after the main script; (d) short and long pages had different scrollbar space | `early.js` in `<head>` applies the theme and hides texts being translated; transitions are off until the final look is settled; scrollbar space reserved on desktop. T-21 and T-23 were added; removing the fix makes T-23 fail. |
| P2 | Cursor glow disappeared | A later CSS change gave the page root a background, which painted over the glow layer. The earlier test checked only the CSS values, so it still passed | The body is now its own stacking context, so the glow always sits above the page background and below the content. T-19 now compares screen pixels near and far from the cursor; it fails on the broken version. |
| P3 | Glow not visible on the author's computer at first | The copy of the site sent to his Downloads folder was an older version | Files are now compared by checksum after every copy. |
| P4 | Header looked heavy (logo badge, floating card, two rows) | Design choice | Replaced by one quiet row with a sliding underline; on phones the menu scrolls sideways. T-23 checks the phone header height and that the current item is visible. |
