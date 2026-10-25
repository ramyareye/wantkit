# HopKit time-entry release candidate

Updated 2026-10-25 in `/Users/reza/Documents/HH/hopkit`. **Pushed by the user and
deployed to preview; hosted edit/save acceptance passed. Production is paused.**
Commit `c5fee8480ea3697e0c9687e372feeb776f8a750d` matches the reviewed six-file
checkpoint and all 295 tested source inputs. No assistant commit or push.

## Exact scope

The candidate contains the combined HopKit preview source at
`cd6e21a27d522de71b016aa09d49c74d884c60ca` plus these two reviewed files:

- `apps/web/src/react-app/DeliveryWeeks.tsx`: task preselection survives delayed
  option loading; changing projects clears selection.
- `apps/web/scripts/test-delivery-local.ts`: deterministic delayed-loading browser
  regression, entry/ID preservation and project-switch/required-task checks.

All other 293 recorded application/build inputs match the combined preview source.
No dependency, API, schema, security, domain or commercial-term change. Existing
HopKit branding, General/Home and Delivery/personal-portfolio features are included
in the combined candidate. Company work remains in Linear; payments stay manual.

## Validation

- New regression reproduced the old bug and passed with the fix in the previous
  checkpoint. Fresh candidate run passes the complete synthetic delivery browser
  harness, including task lifecycle, stale/retry protection, weekly return/revise,
  adjusted approval, CSV, desktop/mobile and memory-only personal credentials.
- Fresh UI suite: **117 tests across 18 files pass**. Existing focused ESLint result
  remains valid for unchanged source; both builds include TypeScript checks.
- Preview and production builds pass. Each has 17 frozen artifacts, byte-identical
  client files across environments and successful Wrangler dry-run. All three
  emitted Worker modules match each frozen package and the previous combined build.
- Existing CSS, static assets and preserved deployment configurations are unchanged.
  The only artifact changes are two JavaScript bundle names/contents and their
  `index.html` references. Original combined-release artifacts/manifests are intact.
- Prior 387-test combined release and hosted preview acceptance remain recorded in
  HOPKIT_COMBINED_HANDOFF.md; unchanged backend/MCP/schema suites were not repeated.
  Existing chunk-size/shared-module build warnings remain; no failed check.
- Hosted preview acceptance passed after deployment: saved task restored when
  asynchronous options arrived; unchanged save succeeded; changing project and
  changing back left the required task blank; cancelling and refreshing retained
  the original fields. Deliberately delayed responses remain covered locally.
- The test created Reza's draft week starting 2026-10-19 and one explicitly
  synthetic one-minute QA entry dated 2026-10-25 in **HipHop delivery rehearsal**,
  project `[SYNTHETIC-2026-10-25] Grow`, task G-01. Its note says this is not actual
  worked/payable time and must remain unsubmitted. No actual-work confirmation,
  submission, approval, payment, task mutation or deletion. Existing approved
  contributor rehearsal records were not edited. Preview uses the live Todoless
  backend; this synthetic draft is retained there for review, not in preview D1.

## Frozen local package

Ignored evidence directory: `.tmp/hopkit-time-entry-release-2026-10-25/`.
It contains the 295-input `source.json`, exact `time-entry.patch`, local-only
`prepare.mjs`, both environment manifests/dist directories, test/build/dry-run
logs and `verification.json`. It contains compiled output and evidence only;
all source edits and builds used this checkout, with no alternate source copy.

Source manifest SHA-256:
`3b215db534b9e5aab2fe89e346b3b077ffe6d248c551d577ba6e3c13a47cf235`.

Use the environment's `dist/kharidyar/release-preserved.json` only after release
approval and refreshed guards. Both files are copied byte-for-byte from the
reviewed preserved configurations: all existing variables, bindings, inherited
secret names, integration flags and domain-management boundaries are retained.
Default build/deploy configurations still omit required live integration settings.
No secrets were retrieved or changed. Do not overwrite the earlier package or
rerun its completed one-shot preview deployment script.

Checkpoint reconciliation confirmed that this package and the parallel
`.tmp/hopkit-combined-release-2026-10-25/with-time-entry/` package contain identical
295 source hashes and all 17 artifact hashes per environment. Their source-manifest
hashes differ because preparation metadata differs; they represent the same code
and configuration, not competing release candidates.

Local recheck:
`node .tmp/hopkit-time-entry-release-2026-10-25/prepare.mjs verify`

The helper's original HEAD/index guards must be reviewed after staging or an
approved commit; retain the captured content hashes rather than replacing its
baseline. Git approval and push gates remain separate from deployment approval.

## Preview deployment and recovery

User-authorized preview deployment ran once at 2026-10-25 14:57:55 UTC:

- Worker `kharidyar-preview`, active version
  `2e6f6fd9-0110-45f8-8fa1-a3bc9a9027c3` at 100%; deployment
  `244cb337-7a12-48b5-a9a2-fa96924ae6cb`.
- All 15 public route/asset/health/private-boundary checks pass against the frozen
  package. Existing Google session and manually reconnected personal Todoless
  identity are ramyariran@gmail.com. Keys were not read or stored by the agent.
- Preview remains on 0017. No migration ran. Before/after guards confirm all
  settings, bindings, inherited secrets and domains preserved; D1 integrity/FK
  checks pass. Production Worker/settings/domains/schema remain unchanged at
  `1e7a0d54-1248-4b0a-94a1-4eefd562f854`, schema 0016. Zero Builds triggers for
  either Worker were freshly verified; no GitHub workflows were present.
- Preview code rollback target: `6e1e2616-0e86-42c7-8886-622dedf96364`.
  Retain settings and schema/data. No database restore/drop is needed.

Evidence under `.tmp/hopkit-combined-release-2026-10-25/`:
`checkpoint-push-verification.json`, `time-entry-builds-before.json`,
`time-entry-preview-{authorization,before,after}.json`, deployment logs,
`time-entry-public.json`, and `time-entry-hosted.json`/screenshots.
The completed deployment-started marker must remain; do not redeploy this package
just to repeat verification. `time-entry-preview.mjs after` is read-only remotely.

## Next release, in order

1. Review/checkpoint these four updated release/handoff documents separately from
   the two preserved dirty Delivery pilot notes. Commit and push keep their exact
   approval gates; no staging, commit or push was performed for this closeout.
2. Production needs separate authorization. Refresh remote/source/artifact and
   provider-state guards, capture D1 bookmark/counts, apply only additive
   `0017_collection_mode_settings.sql`, then deploy the matching preserved
   production package and verify both domains, login, General/Home and Delivery.
   The established code rollback target is `1e7a0d54-...`; preserve additive data.
3. Developer's own hosted action, real VE-A05/VE-B02 import, Life Planner/Food and
   full Cloudflare resource migration remain separate work.

Technical references: [Wrangler deploy](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy)
and [code rollback](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).
