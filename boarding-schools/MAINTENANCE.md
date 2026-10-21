# Maintaining the British Boarding School Guide

This is an extension of the existing static GitHub Pages site. No framework or
production package dependencies are required. All eight school identities and
website addresses were supplied in the brief. Official website access returned
proxy 403 responses during implementation, so no school facts are marked verified.
Talbot Heath is explicitly identified as the girls’ school requested in the brief;
its official school-type fact remains unverified and is not used as a filter match.
No school photos are used: the guide uses typographic placeholders.

## Update and verify school facts

Edit `boarding-schools/schools.json`, then run from the repository root:

```sh
python3 scripts/build-boarding-schools.py
```

This regenerates the directory, comparison shell, eight static profile pages,
`data.js` and the guide sitemap entries. Do not edit generated output directly.
`guide.js` and `guide.css` are maintained directly. Bump their query-string cache
versions in the generator when changing them, including the data cache version.

Each fact records `value`, `sourceUrl`, `academicYear` and `verifiedAt` (ISO date).
Leave unavailable values and their verification metadata null. A fact only displays
as verified when value, source URL and verification date are all present.
A negative statement such as “no boarding” also requires official verification.
Do not infer eligibility from missing facts.

Expected values for filterable fields:

- `location`: consistently named county string.
- `gender`: `boys`, `girls` or `coeducational`.
- `age`: array of verified entry ages as numbers, not the entire pupil age range.
- `programmes`: array containing applicable `GCSE`, `A-Level`, `IB`, `BTEC`.
- `boarding`: array containing applicable `full`, `weekly`, `flexible`.
- `fees`: numeric annual full-boarding GBP fee. Specify the academic year and
  record VAT and extras separately. Do not extrapolate a term fee without checking
  the official number of terms and fee inclusions. Only compare equivalent annual
  fees; clarify any year-group variation in additional bilingual notes.
- Other facts: `{ "ko": "…", "en": "…" }` for bilingual factual summaries.

For results, record the exam, exact measure (e.g. A-level A*–A percentage), cohort
where available, and results year in both the text and `academicYear`. Never show
an unlabelled percentage. Summarise university destinations without rankings.
For fees, record applicable year groups and VAT in the source-supported notes.
If a school has multiple fees or result measures, summarise the scope clearly;
do not substitute a single misleading number into the numeric fee filter.

## Verification queue (all eight schools)

Check each school's official overview, admissions/international admissions, fees,
GCSE and Sixth Form curriculum, results, destinations, boarding/weekends/houses,
EAL, learning support, pastoral care, facilities and activities. Record the exact
relevant source page per fact and the date it was actually read. Link addresses
have not been independently checked for redirects or availability. Do not mark
facts verified just because an address was provided.

## Local validation

Serve from the repository root (root-relative paths require this):

```sh
python3 -m http.server 8001 --bind 127.0.0.1
```

The browser smoke checks in `scripts/check-site.cjs` require Playwright and Chromium
(the cloud image already provides both). Run `node scripts/check-site.cjs` with the
server running. These test actual page rendering, filters, comparison state,
responsive navigation, image loading, language switching, phone validation and
an intercepted browser POST. They do not submit real personal information or
verify email delivery. There is no existing build or lint runner; the generator,
JavaScript syntax checks and browser checks cover this static workflow.

The contact form still posts to the existing FormSubmit recipient, with a required
`phone` field, the existing honeypot, subject and success redirect unchanged.
An inbox owner must confirm receipt of a consenting test submission and check any
FormSubmit activation or spam filtering. No phone numbers are stored locally or
published by the site. External form delivery and the provider's retention are
outside the static site's control.

Deploy through the existing GitHub Pages configuration. Do not change DNS or the
CNAME as part of this feature. Verify the Pages deployment SHA and live guide and
contact page after publication; a successful push is not deployment confirmation.
