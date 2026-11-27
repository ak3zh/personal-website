# 03. Privacy and ethics risk assessment

Scale: Likelihood and Impact are Low / Medium / High. Residual is the level after the control.

| ID | Risk | L | I | Control | Residual | Evidence |
|---|---|---|---|---|---|---|
| R-01 | **Oversharing**: private data (phone, address, grades, student ID, e-mail) appears on the site or in the repository. | M | H | Content inventory classifies each item; only GitHub is offered as contact; automated scan for phone/e-mail patterns; final grep of the repository before every push. | Low | T-17, inventory items 19 |
| R-02 | **Third-party personal data**: teammates' names or demo passwords from the CRM project are published. | M | H | Omitted (inventory 17, 18); the CRM repository is private, so the site does not link to it. | Low | Inventory; grep of site files |
| R-03 | **Copyright and licences**: the Cruip template (GPL-3.0) is copied, or fonts/images are reused without a licence. | M | H | No template code, no images, no font files are included; the stylesheet is original; credit shown on the site. | Low | docs/04-design.md section 6; repository file list |
| R-04 | **False or inflated claims**: wrong statement about the author's role in the CRM project, invented achievements, generated plans presented as facts. | M | M | Achievements left out; plans flagged as drafted at the author's request and approved by him; project descriptions are limited to what the repositories show; author reviews all texts. | Low after review | Inventory 6, 10, 11 |
| R-05 | **Bias and language quality**: machine-written Kazakh/Russian text may be unnatural or wrong; Kazakh is treated as an afterthought. | M | M | Same keys in all three languages (test), Kazakh letters checked on the real site and on a phone, author reviews translations. | Medium until the author's review is done | T-05, T-15, M-01 |
| R-06 | **Account security**: the hosting account, GitHub account or FTP details leak (passwords in the repo, in the report or in screenshots). | M | H | No credentials in any file; the author creates the accounts and types passwords himself; the submission contains no passwords; 2FA is advised on GitHub and hosting; screenshots are checked before inclusion. | Low | Security review |
| R-07 | **Tracking by accident**: analytics, fonts or scripts from third parties are added by the host or by code. | L | M | No external requests (CSP `default-src 'self'`); privacy statement says no cookies. The hosting provider may add its own scripts or notices: checked on the deployed site and recorded. | Low | T-13, D-01 |
| R-08 | **Malicious input**: crafted URL parameters inject script. | L | M | `?lang` is checked against a whitelist; text is inserted with `textContent`; CSP forbids inline script. | Low | T-04, T-13 |
| R-09 | **Accessibility exclusion**: keyboard, screen-reader or low-vision users cannot use the site. | M | M | Semantic markup, contrast tests, keyboard test, accessible names (review finding A1). | Low | T-09, T-10, T-11 |
| R-10 | **Identical sites**: the site looks too much like the template or another student's site (both would fail). | M | H | Own content, own palette, own CSS, own structure and wording; the template is only an inspiration and is credited. | Medium: depends on the template's popularity | Design document |
| R-11 | **Loss of work**: hosting account closed or files lost. | L | M | Full source in a Git repository; a source archive kept with the release tag. | Low | Repository |

## Contact method

GitHub profile link only. It needs no personal data from the visitor and no data from the author beyond what the author already publishes. A form or an e-mail address would need a server script or publish an address; both were rejected (see docs/07-code-review.md, R1).
