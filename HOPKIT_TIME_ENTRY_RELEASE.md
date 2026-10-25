# HopKit time-entry release candidate

Prepared 2026-10-25 in `/Users/reza/Documents/HH/hopkit`. **Local validation complete;
not deployed, committed or pushed.** This note is included in the requested Git
checkpoint; exact staged-tree/commit approval is pending. Other dirty work is preserved.

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
- Hosted acceptance of this new fix is pending. This checkpoint made no live API,
  task/hour/calendar, invitation, deployment or migration changes.

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

## Next release, in order

1. Obtain explicit **preview-only code deployment** approval for this candidate.
   Refresh active/latest versions, preserved settings/domains and source/artifact
   hashes. Preview should still be `6e1e2616-0e86-42c7-8886-622dedf96364` on schema
   0017 according to the prior release evidence. Stop on unexpected drift.
2. Deploy the frozen preview package with its preserved configuration. No new
   preview migration. Verify asset hashes, health/private access and synthetic
   delayed-load edit/save behavior, plus existing Delivery and planning views.
   Reconnect personal keys manually if needed; keep them out of tools/chat/logs.
3. Use the existing combined preview version above as the code rollback target;
   retain schema/data/settings. Do not roll back database data for this UI fix.
4. Production remains a separate decision after preview acceptance. The recorded
   production baseline is `1e7a0d54-1248-4b0a-94a1-4eefd562f854` on schema 0016.
   Releasing the combined package there also introduces its already-previewed
   branding/General/Home features and requires existing additive migration
   `0017_collection_mode_settings.sql`, fresh live guards/bookmark/counts and
   separate production authorization. No new migration belongs to the selection fix.
5. Git commit and push retain their exact approval gates. Developer's own hosted
   action and real VE-A05/VE-B02 import remain separate follow-ups; no import is
   authorized by this package.

Current live values above are taken from the prior release evidence, not new
provider reads in this local preparation checkpoint. Technical references:
[Wrangler dry-run](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy)
and [code rollback](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).
