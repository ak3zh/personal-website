# 06. Security and dependability review

Scope: the static site in `site/`. Method: code reading, automated tests T-07, T-12, T-13, a mutation check (deliberately breaking the site to confirm the tests notice), and a manual checklist.

## Threat model (short)

Assets: the author's reputation and accounts (GitHub, hosting), visitors' privacy. Entry points: URL query (`?lang=`), browser storage values, third-party links, the hosting account, the Git repository. No authentication, no forms, no server code, so no login attack surface.

| # | Threat | Control | Status |
|---|---|---|---|
| S-1 | Script injection through `?lang=` or stored values | Value checked against the list `kk/ru/en` before use; all text set with `textContent`; CSP forbids inline script | Verified by T-04, T-13 |
| S-2 | Third-party code or tracking | CSP `default-src 'self'`; no external scripts, fonts, images or analytics | Verified by T-13; host-injected content to be checked on the deployed site (D-01) |
| S-3 | Reverse-tabnabbing from external links | `rel="noopener noreferrer"` on every external link | Verified by T-07 (mutation test removed one `rel` and the test failed) |
| S-4 | Clickjacking | `frame-ancestors 'none'` and `X-Frame-Options: DENY` sent by the server (`site/.htaccess`); a meta CSP cannot do this | File checked by T-24; header on the public site checked by T-25 after deployment |
| S-5 | Transport security | HTTPS on the public URL; certificate provided by the host; `.htaccess` redirects every http request to https (rule from the host's own guide, with loop protection behind a proxy) | T-24 (file); T-25 and D-02 after deployment |
| S-6 | Secrets in the repository | No keys, passwords or tokens exist in the project; `.gitignore` excludes local files; final search before every push | Verified by search, see below |
| S-7 | Account compromise (hosting, GitHub) | Author creates accounts and types passwords himself; strong unique passwords and 2FA recommended; no credentials in the submission | Author's action |
| S-8 | Loss of the source | Full source in Git, a release tag and a zip archive of the tagged commit | Done at release |
| S-9 | Failure of browser storage or JavaScript | Storage calls wrapped in try/catch; English text is in the HTML | Verified by T-12, T-16 |
| S-10 | Hosting provider interstitial or injected content | Unknown until deployed | Recorded as a limitation after deployment |
| S-11 | Style injection through the motion code | Mouse position and menu-underline values go into a constructed style sheet (`adoptedStyleSheets`) built from numbers only; no style attributes, so the strict CSP stays without `'unsafe-inline'` | T-19, T-20 check that no element gets a style attribute |
| S-12 | Wrong addresses revealing server pages | Own 404 page with `noindex`; server listing of folders is not relied on (only public files exist) | T-22 |

## Input validation

The site has no input fields. The only external input is the `lang` query parameter, validated against a whitelist (S-1).

## Graceful failure

- Storage blocked: pages still work (T-12).
- JavaScript off: English text is shown; navigation links work.
- Missing translation key: falls back to English (`t()` function).

## Secret scan

Command run on the repository before publishing: `grep -rniE "password|passwd|secret|token|api[_-]?key|BEGIN (RSA|PRIVATE)" .` The result is recorded in docs/05-testing.md section 5.

## Residual risks

Headers depend on the host allowing `mod_headers` (checked after deployment, T-25); `early.js` reads only the saved theme from storage, inside try/catch; dependence on the free host's availability and policies; translations not yet reviewed by a second native speaker.
