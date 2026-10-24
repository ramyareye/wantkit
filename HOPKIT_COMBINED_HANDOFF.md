# HopKit combined work — commit review checkpoint

Updated 2026-10-24. Continue in `/Users/reza/Documents/web/wantkit`.
Browser checks and source review are complete. The 72-file combined checkpoint
is staged for exact approval (41 modified, 31 new; no unstaged tracked changes).
No commit, push, deployment or folder rename in this pass. Recheck Git on resume.

## Objective and boundaries

Finish HopKit branding, General/Home shared briefs and existing Delivery/personal
portfolio together, then follow exact commit and separate push approvals. Rename
the folder to `/Users/reza/Documents/web/hopkit` last. Work in this checkout; no
alternate source copy or subagents. **Do not deploy.** Life Planner is docs-only;
full Cloudflare resource migration remains deferred and preview-first.

## Implementation and reviewed scope

- HopKit UI/EN/FA branding, H mark/favicon, auth/assistant display labels, runner
  prompts and export filenames. Package/protocol/storage/cookie identifiers stay
  stable. Domain settings record the already completed production cutover.
- General/Home task 3: shared brief/media/palette, neutral General examples,
  optional preferences (collapsed in General, expanded in Home), separate
  HomeConcept and lazy, keyboard-accessible Saved Home details. Closing optional
  fields does not discard their values. No schema or data conversion added here.
- Delivery/personal portfolio: signed-in bounded proxy, memory-only personal key,
  queue/progress/return feedback, human hours/review, exact retries, private
  optional availability and pause/resume. Existing separate hosted evidence is
  retained; real two-person acceptance is still pending.
- Reviewed new runtime/tests, branding/config diffs, migration-prep helper and
  documentation. DELIVERY_PILOT.patch and DELIVERY_PILOT_RELEASE.json are generated
  review records for a different, Delivery-only baseline. Verified patch checksum,
  all 22 base/candidate hashes and contexts in memory; no source copy was made.
  They are not the combined deployment artifact. No dependency/lockfile change.

## Validation

- October 23 `bun run check`: lint, TypeScript, schema metadata, **387 tests**
  (domain 27, i18n 5, Worker 150, MCP 81, UI 117, runner 7), production build and
  Wrangler dry-run. `.tmp/hopkit-combined-check.log`.
- Preview build/dry-run passed: `.tmp/hopkit-combined-preview.log`. Current dist is
  preview output, not a frozen production release. Successful unchanged checks
  were reused. The only later runtime edit is the CSS variable correction below.
- October 24: **8 R2 helper tests / 95 assertions** pass. Local only; no remote copy.
- Browser: Home → General → Home retains an edited brief, materials, brands,
  palette and concept. Closed General preferences save unchanged values. Saved
  Home details opens with Enter, requests concept/floor plans only on demand;
  Home restores normal navigation and expanded preferences. Mobile English and
  Persian/RTL fit at 390px; editor/Escape, light/dark and desktop views pass.
- Visual review caught one undefined CSS variable in retained-content help text;
  changed it to `--ink-muted` and verified computed colors in both themes.
- Synthetic data only. Existing Delivery browser/real-disposable-D1 checks are
  documented in DELIVERY_PILOT_RELEASE.md and were not repeated unchanged. No live
  login, invitations, records or providers were exercised in this pass.
- QA screenshots: ignored `output/playwright/hopkit-combined-*.png`. Harness is
  `.tmp/mode-shell-qa`, port 5192, Playwright session `hopkit-combined`. The separate
  original branding preview at port 5187 was untouched. Reproduce the harness with
  `apps/web/node_modules/.bin/vite --config .tmp/mode-shell-qa/vite.config.mjs --configLoader native`.
- Console inspection found only the synthetic harness's missing favicon and
  React development notices. No application exception was observed.
- The required full staged whitespace check flags only unified-diff context
  prefixes inside DELIVERY_PILOT.patch. Those bytes are required patch syntax and
  match its verified release hash; do not trim them. All other staged paths pass.

Existing build notices: large shared chunk, third-party annotations and absent
local production secrets during dry-run. A later release must preserve verified
live settings/secrets rather than checked-in disabled integration defaults.

## Git and hosted state

- Branch main, base HEAD `bfcdcec3efc81fd9d387e38b73e8fb1fa7e5113a`.
  Origin `https://github.com/ramyareye/wantkit.git`. Keep gh account
  `rezababaeicelebratix`. No GitHub repository rename in this task.
- No checked-in GitHub workflows. Cloudflare API reported zero Builds triggers
  on both existing Workers October 23. Other external integrations/webhooks were
  not exhaustively inventoried. Recheck remote SHA/triggers before a push.
- Production: domain-only c0b4562 release at `https://hopkit.hiphop.dev`, version
  `11e7a71d-93f2-4903-9071-e238019bac8a`; old hostname/resources retained. Google
  consent name is HopKit. Assistant reconnection after domain cutover remains a
  separate follow-up; no registrations were deleted or recreated.
- Separate Delivery preview: version `dfd648fb-6c4c-4bb6-8de7-bafd3a1d54ab` on the
  existing preview Worker with `TODOLESS_API_ORIGIN=https://todoless.dev`. Its
  release record reports Todoless migrations 0005–0009 live. Personal signups,
  invitation approval and two-person acceptance remain pending. This pass made
  no hosted changes and did not independently rerun those hosted checks.
- A later combined rollout needs HopKit migration 0017 before code and refreshed
  preview/production settings, recovery and acceptance. No deployment is implied
  by committing or pushing. Preserve the separate Delivery preview connection.

## Next, in order

1. Present the exact staged tree, validation and proposed commit message; wait
   for “Proceed with this exact staged tree and commit message?” approval.
   Recheck every staged byte after approval, then commit only that content.
2. Prepare the independent exact-SHA push gate: destination/current remote SHA,
   outgoing commits/files and deployment triggers. Ask the exact push question
   and recheck source/remote before pushing the reviewed SHA via explicit refspec.
3. Keep deployment paused. Rename the folder last, preserving dirty/ignored files
   and stopping processes using the old path first. Reconnect Codex to the new
   directory and rebuild path-dependent output before any later release.

A new chat is optional. Resume with: “Continue HOPKIT_COMBINED_HANDOFF.md; complete
exact commit/push approvals, do not deploy, rename the folder last.”
