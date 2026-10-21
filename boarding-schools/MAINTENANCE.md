# Boarding School Guide — implementation and maintenance

The guide extends the existing static HTML/CSS/JavaScript website. No framework, backend or build service is introduced. Existing service options, language storage and FormSubmit submission are preserved.

## Files and routes

- `schools.json`: the manually maintained source of facts, Korean/English summaries, official URLs, reporting years and verification dates.
- `boarding.js`: progressive search, combined filters, selection storage, shareable comparison URLs and two-column mobile comparison.
- `boarding.css`: styles scoped to this guide, using the existing brand tokens.
- `index.html`, `compare/index.html`, and the eight school folders: generated, static, bilingual pages. School profiles are indexable and readable without JavaScript.
- `../scripts/build-boarding-pages.py`: regenerate pages and add routes to the existing sitemap. Run `python scripts/build-boarding-pages.py` from the repository root after editing data.
- `../scripts/test-boarding.mjs`: DOM, filtering, selection, native form payload, provenance and local-link regression checks. Requires `jsdom` as a development-only dependency (`MEP_JSDOM` may point to its `lib/api.js` entry).
- Existing changes: shared navigation/footer in `site.js`; shared script cache version on the nine existing pages; guide introduction in `long-term-planning/index.html`; phone field/privacy explanation in `contact/index.html`; validation in `contact/contact.js`; sitemap entries.

Routes (existing directory/index.html convention):

- `/boarding-schools/`
- `/boarding-schools/compare/`
- `/boarding-schools/bedes/`
- `/boarding-schools/bradfield/`
- `/boarding-schools/bryanston/`
- `/boarding-schools/canford/`
- `/boarding-schools/clayesmore/`
- `/boarding-schools/embley/`
- `/boarding-schools/lancing/`
- `/boarding-schools/talbot-heath/`

## Data policy and verified sources

Initial research date: **21 October 2026**. Each non-null fact records its official source URL and verification date; fees and results carry years when confirmed. The live site does not scrape school websites. No school photographs are copied or hotlinked: all cards use text/CSS placeholders. Names are listed alphabetically; no ranking or admission scoring is provided.

Sources reviewed include school overviews, boarding pages, fee schedules, international admissions, academic pathways, results, university destinations and school-hosted inspection reports. Exact URLs are in `schools.json` and rendered on profiles. Significant verified items:

| School | Verified annual tuition + boarding | Basis / limitations |
| --- | --- | --- |
| Bede's | £55,200 (2026/27) | (£11,750 tuition + £6,650 full boarding) × 3; Sixth Form supplement and other extras excluded |
| Bradfield | £60,750 (2026/27) | Published annual boarding fee; deposits and additional charges excluded |
| Bryanston | £59,250 (2026/27) | £19,750 × 3; Senior School boarding |
| Canford | £57,219 (2026/27) | Published annual boarding fee |
| Clayesmore | Not currently verified | Official termly Year 9–13 figure £16,503.60 includes VAT, but the page does not state the academic year. Excluded from annual price filters |
| Embley | £50,310 (2026/27) | International boarder £16,374 + compulsory lunch £396, × 3; Pre-A-Level/one-year GCSE rate differs |
| Lancing | £57,540 (2026/27) | £19,180 × 3; full boarding described as 5–7 nights weekly |
| Talbot Heath | Not currently verified | Tuition and boarding charges are published separately; combined year-group totals and lunch inclusion need confirmation |

Fees state VAT inclusion where applicable. Derived annual figures are explicitly identified. Extras and individual circumstances can change final bills. Different result metrics are labelled individually: no cross-school score is calculated.

Talbot Heath is identified as the **girls' school in Bournemouth**, verified against its official Senior School page. Embley's co-educational status is confirmed in the school-hosted May 2026 ISI report. Bryanston's Senior School age/gender information is confirmed in its school-hosted February 2026 ISI report.

## Information requiring manual review

Null facts display `정보 확인 중 / Not currently verified`. They are excluded from matching restrictive filters. In particular:

- Clayesmore: fee academic year and comparable annual total.
- Talbot Heath: combined tuition/boarding total, compulsory meal charges, boarding entry ages and detailed international entry assessments.
- Bede's: campus/age arrangements for Years 7–8 versus Senior School; detailed entrance assessments.
- Bradfield: detailed international assessments/English thresholds; clearly dated exam statistics before publication.
- Bryanston: detailed EAL programme and learning support; dated exam statistics.
- Embley: dated exam results, detailed learning support and confirmed university destination cohorts.
- Lancing: general EAL scope beyond the verified Pre-Sixth programme and detailed learning support.
- All other null fields: school-specific support details, size, weekend conditions, activities or dated destinations not confirmed during this review.

Partial facts are intentionally visible: support provision is not inferred merely from the presence of international or EAL pupils. School age ranges and published entry routes do not guarantee available places or boarding eligibility.

## Contact form and deployment

The required `phone` field uses `type=tel`, `autocomplete=tel`, flexible international validation and native browser POST. It is placed after email and included in the existing FormSubmit table/email payload; no database exists in this repository. The honeypot, endpoint, CAPTCHA default, redirect, success notice and service options are preserved. The privacy explanation explicitly includes phone numbers and consultation follow-up through FormSubmit.

A browser test can intercept the native FormSubmit request to verify its actual URL-encoded POST body **without sending an enquiry**. This proves client transmission, not delivery to the recipient inbox. Before publishing, perform one controlled real submission and confirm the phone number appears in the received email; provider activation/CAPTCHA and inbox delivery cannot be established from the source code. No fabricated test enquiry has been sent to the live mailbox.

No deployment configuration or new secrets are required. Merge only after reviewing the guide and outstanding school data. The live branch has not been changed as part of this work.

## Validation performed

- JavaScript syntax checks: `site.js`, `boarding.js`, `contact/contact.js` — passed.
- Static generator Python compilation and generated route/link checks — passed.
- DOM regression suite — **376 checks passed**, including **234 local link/asset references**.
- Chromium 153: combined filters, clearing, three-school selection, share URL restoration, two-school mobile pair switching, Talbot Heath girls' label and Korean/English switching — passed.
- Responsive browser checks: five routes at 390, 800, 820, 1024 and 1440px (**25 combinations**) — no horizontal overflow; desktop navigation fits.
- Native FormSubmit POST intercepted locally: `phone=+82 10-1234-5678` received in the outgoing request body — passed. No enquiry sent to the live provider or mailbox.
- Browser JavaScript errors — none observed. Desktop directory/contact and desktop/mobile comparison/profile screenshots inspected.
- `git diff --check` — passed. The repository has no existing package build/lint/test command; no production dependencies added.

Outstanding verification: actual FormSubmit inbox delivery/activation and the school-data items listed above. No merge, domain change or deployment was performed.
