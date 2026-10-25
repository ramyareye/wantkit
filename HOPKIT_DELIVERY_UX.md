# HopKit Delivery simplification — 2026-10-25

## Scope and status

User found the developer rehearsal UI confusing and requested a minimal,
Linear-like experience. User committed and pushed the reviewed 12-file checkpoint
as `b7ab0f0ec778104a9a7875bb5add41810c588790`. Deployed once to preview and accepted
there on 2026-10-25. Production still runs the previous UI; no production deployment
is authorized for this UI change. The actual developer rehearsal remains pending.

Preview: <https://kharidyar-preview.formahsa.workers.dev/delivery>, version
`836f7659-e6a3-461d-bbd7-e465f0820b30`. Rollback version:
`2e6f6fd9-0110-45f8-8fa1-a3bc9a9027c3`. No migration, invitations or real imports.

## Changes

- Compact searchable task rows and status filters, opening a native dialog side
  panel (full-screen on small phones). Escape closes it and restores row focus.
- Plain next actions: Start task, Post update, I'm blocked, Send for review;
  existing transitions and review protections remain enforced.
- Evidence, details and history are disclosures. Saving/stale/retry states keep
  the panel's form disabled, with recovery guidance and an available close button.
- Simpler My time and weekly review screens; evidence and project totals folded
  away. Removing a draft entry requires a reason and explicit confirmation.
- Task selection remains controlled when editing time. Submit-week attestation,
  separate reviewer requirements and unset commercial terms are preserved.
- Queue loader includes all startable READY tasks, beyond the focus endpoint's
  two suggestions, and deduplicates overlapping active/blocked results.

Application files: `apps/web/src/react-app/DeliveryPage.tsx`, `DeliveryPage.css`,
`DeliveryQueue.tsx`, `DeliveryTaskUpdates.tsx`, `DeliveryWeeks.tsx`,
`delivery-presentation.ts`, `delivery-queue.ts` and the two corresponding unit tests.
Local demo/regression files: `apps/web/scripts/delivery-fixture.tsx` and
`apps/web/scripts/test-delivery-local.ts`. No backend, schema, bindings or dependency
changes. The sibling Todoless API source was read/compiled unchanged in memory.

## Validation

- TypeScript build and focused ESLint pass; `git diff --check` passes.
- Preview build and Wrangler dry-run pass; emitted target/bindings are preview.
  Local required-secret and existing bundle-size/shared-module warnings remain.
  The deployed package used the existing release process that preserves live
  secrets/variables/integrations; ordinary package deploy defaults omit existing
  integrations. No migration was needed or run.
- 26 focused client, update, presentation and queue unit tests pass.
- Release checkpoint: all 123 UI tests across 20 files pass.
- `--verify-updates` passes against disposable local Miniflare/D1 through the real
  HopKit proxy: progress/blockers, lost-response retry, version conflict, review
  freeze, return reason, access controls, and all three READY tasks retained.
- Browser checks via CUA pass: search/filter, start/progress/block/clear/review,
  owner acceptance/completion, unchanged time-entry save retaining task and minutes,
  removal cancellation, contributor week submission and separate owner approval.
  Contributor has no self-review or week-approval action. All records are fictional.
- Desktop 1280×800 and mobile 390×844 layouts fit without horizontal overflow;
  dark appearance and Escape/focus restoration verified; no console errors.
- Legacy automated browser selectors were updated but that full browser branch
  was not run; the browser flows above were exercised through CUA.
- Hosted preview: all 15 public route/asset/auth-boundary checks pass. All 299
  source inputs match the pushed commit; all three backend modules are unchanged.
  Fresh before/after checks confirm settings, bindings, domains and both schemas
  unchanged, integrity/FK checks healthy, and production's version unchanged.
- Hosted signed-in checks with the owner's private Todoless connection pass:
  developer queue and original D-01 panel/details, existing one-minute draft's
  edit form retaining its task/minutes/note, and existing approved weekly totals.
  Editing was cancelled; no task/time/week writes or approvals were performed.
  Own draft exposes no approval action; actual developer no-self-approval remains
  part of the pending developer-led rehearsal. No browser console errors.

Evidence: `.tmp/hopkit-delivery-minimal-2026-10-25/` contains build/deploy logs,
frozen artifact manifest, before/after and public-check receipts, hosted acceptance
receipt/screenshots, plus desktop/mobile and local week-approval screenshots.

## Local demo and next task

Current demo: <http://127.0.0.1:52189/demo>, process 24814 (ephemeral).
Use contributor / Use owner load fictional identities; no real key is needed.
Server compiles source once, so restart after code changes. If stopped, run from
this checkout and use the new URL printed in the output:

```sh
TODOLESS_SOURCE_ROOT=/Users/reza/Documents/web/todoless/apps/api bun apps/web/scripts/test-delivery-local.ts --serve
```

Production preparation is complete (not deployed). `apps/web/wrangler.json` now
sets production name `hopkit`, `workers_dev: false`, and `preview_urls: false`.
Production deployment/version inspection commands in `apps/web/package.json`
also target `hopkit`. Local/preview configuration and D1/R2/Workflow identifiers
are unchanged. The legacy top-level name remains the local/build label; the
production environment explicitly selects `hopkit`.

Fresh Cloudflare reads confirm the custom domain and existing research Workflow
point to `hopkit`, production remains version
`46ffa845-633d-4e27-84d4-e06d3e28688e`, both production link settings remain off,
and no automatic production build triggers exist. Settings/bindings and accepted
preview version are unchanged. Current config fields were checked against
[Cloudflare's configuration reference](https://developers.cloudflare.com/workers/wrangler/configuration/).

Production build (including TypeScript) and preserved-package Wrangler dry-run
pass. The package has 17 files: all 11 client files exactly match the accepted
preview, and all three backend modules match both preview and current production.
All 299 source hashes are captured; only the two config/package files differ from
the accepted commit. No schema/dependency/application-code changes or new migration.
Prior 123-test UI and hosted acceptance results apply to identical runtime bytes.

Frozen package/evidence: `.tmp/hopkit-delivery-minimal-2026-10-25/production/`.
It contains `source.json`, `config.patch`, `manifest.json` and `dist/`. Existing
production integration vars, bindings, secret names and domain-management boundary
are preserved in `dist/kharidyar/release-preserved.json`; only Worker name and the
two link flags differ from the prior production package. `kharidyar` in this local
artifact directory is a build label, not the upload target. Existing build-size
and shared-module warnings remain; no failed check.

Next: checkpoint the two config/package files plus this release note. This mixed
`HANDOFF.md`, earlier Delivery pilot notes and untracked rehearsal note should stay
outside that focused checkpoint. Do not run the default production deploy command:
its base vars still omit live integrations. Production deployment remains a
separate explicit authorization; refresh source/artifact/live-state guards first.
Rollback target is `46ffa845-633d-4e27-84d4-e06d3e28688e`, retaining schema0017.

Local package recheck (read-only; does not deploy):

```sh
node .tmp/hopkit-delivery-minimal-2026-10-25/prepare-production.mjs verify
```

The preparation helper expects current HEAD `b7ab0f0` and an empty index. After an
approved checkpoint, reconcile those Git guards with the recorded source hashes;
do not replace the source/artifact baseline. Before any authorized upload, use a
fresh live snapshot and the exact frozen `release-preserved.json`.

Before resuming the real developer rehearsal, choose which existing D-01 card to
use: the original `[SYNTHETIC-2026-10-25] D-01: Developer progress, evidence and
weekly review`, or the separately existing `[SYNTHETIC-DEVELOPER-2026-10-25] D-01:
Own-account task and weekly-hours rehearsal`. Both are assigned to ebh and Ready.
This release created neither card and changed neither. Do not create another,
delete either automatically, or impersonate the developer.

## Preserved state

Branch main, current HEAD `b7ab0f0` (base `6cda306`); index is empty.
Pre-existing dirty release notes stayed
byte-identical throughout this work:

- `DELIVERY_PILOT_RELEASE.json`: SHA-256 `133d713f7e41044d87976faf88e4f345aaeadd1767aca49c3afc7af036293deb`
- `DELIVERY_PILOT_RELEASE.md`: SHA-256 `b19744118468107e67fe67cd7b6dac4cbee2cbce4edbf50c036f4d110345f719`

Production D-01 (`tsk_f5a38a91d2bc472cb66009cbef289f09`) remains READY/version 2,
assigned to ebh.developer@gmail.com with
ramyariran@gmail.com as separate reviewer. No production hours/weeks were written
by this work. Existing tasks, approved week, one-minute draft and unset terms are
preserved. The production owner tab is retained for a later rehearsal handoff.
