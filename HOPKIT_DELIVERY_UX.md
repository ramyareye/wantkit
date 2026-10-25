# HopKit Delivery simplification — 2026-10-25

## Scope and status

User found the developer rehearsal UI confusing and requested a minimal,
Linear-like experience. Implemented locally in the current checkout. No deployment,
commit, push, invitations or real task import. Production still runs the
previous UI; the actual developer rehearsal remains pending.

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
  This validates packaging, not live secrets. Before deployment, use the existing
  release process that preserves live secrets/variables/integrations; ordinary
  package deploy defaults omit existing integrations. No migration is needed.
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

Evidence: `.tmp/hopkit-delivery-minimal-2026-10-25/` contains desktop task list,
task panel, mobile and local week-approval screenshots.

## Local demo and next task

Current demo: <http://127.0.0.1:52189/demo>, process 24814 (ephemeral).
Use contributor / Use owner load fictional identities; no real key is needed.
Server compiles source once, so restart after code changes. If stopped, run from
this checkout and use the new URL printed in the output:

```sh
TODOLESS_SOURCE_ROOT=/Users/reza/Documents/web/todoless/apps/api bun apps/web/scripts/test-delivery-local.ts --serve
```

User approved continuing with release preparation. The UI, demo/tests and this
handoff form one focused checkpoint; the earlier release/rehearsal notes remain
outside it. Next: exact staged-tree/commit approval, then push and preview release
preparation. No deployment is currently authorized for this UI change. After an
approved release, resume the existing D-01 developer rehearsal; do not recreate
that task or impersonate the developer.

## Preserved state

Branch main, base HEAD `6cda306`; index was empty before preparation.
Pre-existing dirty release notes stayed
byte-identical throughout this work:

- `DELIVERY_PILOT_RELEASE.json`: SHA-256 `133d713f7e41044d87976faf88e4f345aaeadd1767aca49c3afc7af036293deb`
- `DELIVERY_PILOT_RELEASE.md`: SHA-256 `b19744118468107e67fe67cd7b6dac4cbee2cbce4edbf50c036f4d110345f719`

Production D-01 (`tsk_f5a38a91d2bc472cb66009cbef289f09`) remains READY/version 2,
assigned to ebh.developer@gmail.com with
ramyariran@gmail.com as separate reviewer. No production hours/weeks were written
by this work. Existing tasks, approved week, one-minute draft and unset terms are
preserved. The production owner tab is retained for a later rehearsal handoff.
