# 02. Content inventory (KK / RU / EN)

Every item has a source and an owner. "Classification": **public** (shown on the site), **private** (kept off the site), **omitted** (not used at all). Texts exist in all three languages in `translations.js` (keys shown).

| # | Content item | Keys | Source | Owner | Classification | Notes |
|---|---|---|---|---|---|---|
| 1 | Name: Akezhan Bekov (Russian spelling kept in Kazakh) | site.name, home.h1 | Author | Author | public | Author chose the spelling. |
| 2 | Short introduction | home.lead, home.studies | Written for the site from facts given by the author | Author | public | Needs the author's approval. |
| 3 | University KBTU, School SITE, major Information Systems | about.kbtu.* | Author | Author | public | |
| 4 | High school: Gymnasium No. 68, Almaty | about.school.* | Author | Author | public | School name only; no years, no class, no teachers. |
| 5 | Five completed subjects with one-line descriptions | subj.* | Subject names from the author; descriptions written for the site | Author | public | Descriptions are general; author must check them. No grades. |
| 6 | Project: Connecta CRM (team course project) | proj.crm.* | Team repository `github.com/ak3zh/connecta-crm` (not publicly reachable: returns 404 without sign-in); author's own role statement | Author and team | public (description only, **no link**) | Link removed because the repository is private. Teammate names and the demo passwords from that repository are **omitted**. The author must confirm the contribution sentence is true. |
| 7 | Project: Smart Campus Room Availability Checker | proj.sc.* | Author's own course work (Practice #12) | Author | public (links) | Links to the public demo (Bolt) and the public practice repository `ak3zh/smart-campus-practice12`; fictional data only. |
| 8 | Project: Warehouse Inventory Tracker | proj.wh.* | Author's own course work | Author | public (no link) | No public link. |
| 9 | Interests: programming, sport, music, motorsport, cars | interests.*, int.* | Author | Author | public | |
| 10 | Achievements | none | Author said there are none | Author | omitted | Section not shown instead of inventing one. |
| 11 | Plans | plans.* | **Drafted by the assistant at the author's request ("придумай сам")** | Author | public after approval | Must be read and approved or edited by the author before launch. |
| 12 | GitHub profile link `github.com/ak3zh` | contact.* | Author | Author | public | Only contact method. |
| 13 | Privacy statement | privacy.* | Written for the site | Author | public | |
| 14 | Credits: Cruip style inspiration, GPL-3.0, no code copied | credits.* | Cruip template page | Cruip | public | |
| 15 | Other personal or business accounts | none | Author | Author | omitted | Author decided that GitHub is the only account shown. |
| 16 | Names of AI tools used in development | none | Author | Author | omitted from the site | The honest AI-use record is in the report and `03_AI_Evidence.pdf`. |
| 17 | Teammates' names (CRM project) | none | CRM repository README | Teammates | omitted | No permission to publish personal information about other people. |
| 18 | Demo accounts and passwords from the CRM README | none | CRM repository README | Team | omitted | Never published. |
| 19 | Phone number, e-mail, home address, student ID, grades, transcripts, documents | none | n/a | Author | private / omitted | Not on the site and not in the repository. The report and submission use the student ID only because the course requires it in the e-mail subject. |
| 20 | Photograph | none | Author | Author | omitted | Author chose a minimal site without photos, so no consent or image-rights question arises. |
| 21 | Navigation, button labels, language names, alt/aria texts, titles, meta descriptions | nav.*, a11y.*, theme.*, meta.* | Written for the site | Author | public | Translated in all three languages. Language buttons carry their own-language names. |
| 22 | Fonts | none | System fonts, Inter first in the stack only if installed | n/a | public | No font files are loaded or shipped. |
| 23 | Error page texts (page not found, explanation, link home) | nf.*, meta.notfound.* | Written for the site | Author | public | Three languages; the page is marked noindex. |

## Translation review

The English text is the source. Russian and Kazakh versions were written by the assistant and **must be read by the author** (a native Russian speaker with Kazakh knowledge): names of subjects and terms are checked for consistency, Kazakh letters are verified on the deployed site (T-15, M-01). Any correction goes into `translations.js` and the tests are re-run.
