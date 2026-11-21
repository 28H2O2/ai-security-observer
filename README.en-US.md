# AI Threat Intelligence Station

[简体中文](README.md) | **English**

An AI security intelligence reader maintained by the Fudan University JADE group (`复旦 JADE · AI 威胁情报站`). It curates public AI security incidents, vulnerability advisories, and attack research into structured Chinese digests, annotating every entry with its source, evidence boundaries, and primary links without unverified extrapolation.

The station shares the same human-curated data snapshot with its [companion WeChat Mini Program](https://github.com/28H2O2/ai-security-observer-miniprogram): this repository hosts the full web edition, while the Mini Program serves mobile readers. The repository slug `ai-security-observer` is kept unchanged so existing links continue to resolve. See the Vercel production URL on the repository homepage for the live site.

## What This Dataset Contains

Current snapshot metrics (governed by the review date in `content/review.json`):

| Metric | Value |
| --- | --- |
| Snapshot review date | 2026-11-21 (`Asia/Shanghai`) |
| Deduplicated entries | 135 (38 real-world incidents / 44 vulnerability advisories / 53 research disclosures) |
| With primary disclosure | 126 |
| With explicit CVE IDs | 50 |
| Contributing sources | 32 |
| Originally from PDF digests | 16 |
| ASO assessment coverage | 104 scored / 16 insufficient evidence / 15 not applicable / 0 pending |

The latest update (`2026-11-21`) added three primary entries: the AWS Cairn/MONAI Label intrusion investigation, the Document Loader MCP directory-bypass advisory, and OpenAI's internal reasoning-extraction defense study. Original November 20 disclosure dates are preserved, with patch-release uncertainty, Shanghai CVE dates, and evaluation limits recorded separately. Existing entries are unchanged. See the [update verification log](research/update-2026-11-21.md) for scope details.

This dataset is a **human-curated static snapshot**. There is no live scraping, scheduled crawling, online model summarization, or automated fact-checking, and deploying the site never generates new intelligence entries on its own. Dates mark the review snapshot rather than crawler execution time. AI-assisted summaries and scores **have not yet undergone full manual review**.

"With primary disclosure" only means an entry traces back to the original discloser, not that an independent party or this station has reproduced it. The existence of a vulnerability does not mean exploitation has occurred in the wild. Unknown dates, financial losses, and exploitation status are recorded explicitly as undisclosed or unconfirmed. See [Sources, Format, and Verification Methodology](research/site-methodology.md).

## Capabilities

- Browse across three views (all intelligence, real-world incidents, and research disclosures) ordered by disclosure date; search and filter parameters persist in the URL for direct sharing, and read state is saved in local browser storage.
- Search across titles, summaries, products, tags, package names, incidents, and CVE IDs; combine filters by source, topic, evidence status, date window, and scoring state; sort by date or risk priority.
- Inspect per-item impact scope, remediation guidance, evidence boundaries, exploitation preconditions, affected packages and versions, and fix recommendations, with primary source links placed right below the title.
- Generate daily or weekly (Monday to Sunday) briefings from existing entries, including historical archives and empty-date views; export filtered results as Markdown or JSON; subscribe to the latest 50 items via `feed.xml` (RSS).
- Explore the source registry grouped across vendor advisories, security research teams, structured databases, and Chinese security communities, with search, source detail views, and `#/sources?source=cve` deep links.
- Read ASO Risk Score v1.0 (`ASO score/100` in lists, four-dimension breakdown, rationale, and supporting evidence on detail pages; `#/risk-rules` explains the formula `7I + 5F + 4S + 4A`, anchors, and coverage, omitting composite scores whenever required evidence is missing). ASO is a station-specific metric, **not CVSS, EPSS, or exploitation probability**. Full specification: [docs/aso-risk-score.md](docs/aso-risk-score.md).
- Read core documentation without JavaScript: `methodology.html` (source and verification notes) and `risk-methodology.html` (scoring specification) are generated at build time from the same rules and data as the interactive app.

The web app uses hash routes (`#/feed`, `#/item/<id>`, and related views), so static hosting needs no URL rewrite rules.

## Quick Start

Requires Node.js 22 with zero third-party runtime dependencies.

```sh
npm ci
npm run build   # builds dist/data, feed.xml, and the two static methodology pages from content/
npm test
npm start       # serves http://127.0.0.1:4173
```

`npm run build` produces a local preview build: `SITE_URL` defaults to the local loopback address, so RSS feeds and canonical item URLs point to `127.0.0.1` and must not be published directly to production. The committed `dist/` directory is built in production mode (for example `SITE_URL='https://your-production-domain/' npm run build:production`); after previewing locally, do not commit `127.0.0.1` values in `meta.siteUrl` or `feed.xml`.

## Repository Layout

| Path | Purpose |
| --- | --- |
| `content/` | Single source of truth: intelligence items, source registry, risk assessments, and review date |
| `scripts/` | Build scripts and test suite; `build-data.mjs` handles deduplication, validation, and output generation |
| `dist/` | Ready-to-serve static site: HTML pages, stylesheets, client scripts, and generated data |
| `dist/data/` | Generated JSON payloads: `items.json`, `briefings.json`, `sources.json`, `risk-coverage.json` |
| `docs/` | ASO scoring specification and validation notes |
| `research/` | Content update logs, source verification records, and methodology notes (not published as static assets) |
| `deployment/` | Nginx configuration templates and mainland China network acceptance checklist |
| `vercel.json` | Vercel build configuration |

## Data Maintenance

1. Add or edit records under `content/`. `review.json` stores the explicit review date (builds never overwrite it with the current date), `sources.json` registers upstream sources, and `risk-assessments.json` stores ASO scoring entries.
2. Run `npm run build` to merge duplicate incidents across PDF digests and primary disclosures, populate explicitly annotated original links and CVE IDs, validate ID uniqueness, source references, date formats, public URLs, and duplicate advisories, and regenerate briefings, RSS, risk coverage, and both static methodology pages.
3. Run `npm test`, then commit both `content/` and `dist/`.
4. In the companion Mini Program repository, run `scripts/sync-data.mjs` and `scripts/build-pages.mjs` to sync the updated snapshot into mobile pages.

Core item fields: `id`, `title`, `summary`, `kind`, `risk`, `tags`, `entities`, `publishedAt`, `originalPublishedAt`, `occurredAt`, `sourceId`, `references`, `evidence`, `limitations`, `impact`, and `recommendation`. PDF-sourced records additionally keep `externalId` and `pdfPage`; CVE records additionally keep `cveIds`, `cvePublishedAt`, `preconditions`, and `affectedPackages`. Sorting uses the primary disclosure date and falls back to the digest compilation date when the original date cannot be verified. Project advisory dates and CVE publication dates are displayed separately; snapshot dates use `Asia/Shanghai`.

`publication.js` is shared between the browser app and build scripts, and `briefings.json` stores only category keys and item IDs to avoid duplicating body text. DOM rendering and export serializers apply separate escaping paths. Automated crawlers, incremental deduplication, automated evidence verification, and scheduled publishing are intentionally out of scope; source status `checked` indicates only that reachability and format checks passed on the registration date.

## Deployment

### Vercel

Import this repository into Vercel with Root Directory left at `.`. `vercel.json` is preconfigured:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build:production` |
| Output Directory | `dist` |
| `SITE_URL` | Optional explicit HTTPS root URL; falls back to `VERCEL_PROJECT_PRODUCTION_URL` when unset |

An explicit `SITE_URL` takes precedence; preview deployment URLs are rejected for production builds. Keep Vercel's "Automatically expose System Environment Variables" enabled, or set `SITE_URL` manually. Production builds reject missing, placeholder, loopback, or non-HTTPS URLs and never fall back silently to a hardcoded host. Only `dist/` is published; research notes and local PDFs stay unpublished. Refer to the [Vercel `vercel.json` documentation](https://vercel.com/docs/project-configuration/vercel-json) for platform fields.

### Self-Hosted Server

```sh
npm ci
npm run package:preview                                    # local preview archive (RSS points to 127.0.0.1)
SITE_URL='https://your-production-domain/' npm run package # production release archive
```

`npm run package` runs the production build, full test suite, and tar packaging in sequence, writing archives to `output/releases/`. The tarball contains only static assets and deployment configs, so the target host only needs Nginx (no Node.js runtime). For Hong Kong node setup, TLS, rollback procedures, and mainland China three-carrier verification, see [deployment/README.md](deployment/README.md). Legacy Sites hosting metadata is preserved in `.openai/hosting.json` and ignored by Vercel.

## Further Reading

- [DESIGN.md](DESIGN.md): typography, color, and interaction conventions
- [docs/aso-risk-score.md](docs/aso-risk-score.md): ASO risk formula, four-dimension anchors, and maintenance workflow
- [research/site-methodology.md](research/site-methodology.md): source selection, entry schema, and verification rules
- [research/update-2026-11-21.md](research/update-2026-11-21.md): latest content batch and verification scope (`research/update-*.md` tracks earlier batches)
- [research/risk-assessment-2026-11-04.md](research/risk-assessment-2026-11-04.md): full ASO baseline assessment log
- Engineering references: [AIHOT](https://github.com/KKKKhazix/AIHOT) (MIT), [AI Safety Radar](https://github.com/nrc-cnrc/ai-safety-radar-securite-ia), and [S33R](https://github.com/clivoa/S33R); this project reuses none of their branding, UI, or backend code

## Contact & Copyright

Fudan University JADE Team: [Group Homepage](https://whitzard-ai.github.io/index.html) | [Members](https://whitzard-ai.github.io/member.html); contact: Prof. Mi Zhang ([mi_zhang@fudan.edu.cn](mailto:mi_zhang@fudan.edu.cn)).

Copyright of all primary materials belongs to their respective authors. This site provides independently written Chinese digests and links to original disclosures without redistributing third-party full texts or PDFs. Code version `0.4.1`; snapshot review date `2026-11-21` (historical entries are not re-verified in full on every update). No user accounts, online LLM summarization, or third-party analytics scripts.
