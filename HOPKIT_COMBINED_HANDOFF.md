# HopKit production candidate — prepared, not deployed

**Task-preselection candidate update, 2026-10-25:** local reconciliation is complete.
[HOPKIT_TIME_ENTRY_RELEASE.md](./HOPKIT_TIME_ENTRY_RELEASE.md) records the refreshed
packages, 117 UI tests, browser regression and preserved-config dry-runs. The two
preparation packages have identical source and artifact hashes, verified during
checkpoint review. The deployed preview and original frozen evidence are preserved.
Preview rollout of the fix and production rollout still need explicit approval.

Updated 2026-10-25. Checkout/chat: **`/Users/reza/Documents/HH/hopkit`**.
The user requested review of the local time-entry fix and combined production
preparation, with **no deployment**. Review and local validation are complete.
Candidate captured from pushed `cd6e21a27d522de71b016aa09d49c74d884c60ca` plus the
two reviewed files below. No application edits were needed during this review.
**Do not deploy either environment or apply production migrations yet.**

## Reviewed change and validation

- `apps/web/src/react-app/DeliveryWeeks.tsx`: keep the saved task in controlled
  React state while options load. Changing projects clears the task, including
  when switching back. The required field prevents submitting an empty selection.
  Existing form keys reset state when choosing another entry; stale task responses
  are discarded by the unchanged resource hook. No blocking review finding.
- `apps/web/scripts/test-delivery-local.ts`: delays option loading deliberately,
  checks disabled loading controls and saved-task preselection, saves an unchanged
  entry and verifies all entry/task IDs and logged fields remain equal, then checks
  explicit new-task selection and project-switch/reset validation. These are real
  React/proxy/disposable-D1 integration checks, not mocked implementation assertions.
- **Fresh checks pass:** lint (excluding generated `.tmp/**`), TypeScript, all
  **117 UI tests**, the full local Delivery integration workflow, both builds and
  both preserved-config deployment dry-runs. The integration suite also covers
  stale-version handling, exact lost-response retry, task transitions, 210/180
  submitted/approved minutes, revision/history, CSV, desktop/mobile and key clearing.
  Only synthetic local data was used; external requests are blocked in that suite.
- The initial sandbox test could not bind localhost; it was stopped and passed
  with the required permission. Initial broad lint scanned archived generated
  dry-run bundles; the successful run excludes only `.tmp/**`. No application lint
  failure was hidden. Existing Zod/chunk-size build warnings remain non-blocking.
- Earlier full **387-test** gate, schema validation and migration failure/retry
  evidence remain applicable to unchanged backend/domain/MCP code. The fresh
  focused suite covers the only runtime delta. No migration or binding was added.

## Live state — unchanged by this preparation

| Environment | Worker | Active version (100%) | Schema |
| --- | --- | --- | --- |
| Preview | kharidyar-preview | `6e1e2616-0e86-42c7-8886-622dedf96364` | 0017 |
| Production | kharidyar | `1e7a0d54-1248-4b0a-94a1-4eefd562f854` | 0016 |

Preview: https://kharidyar-preview.formahsa.workers.dev. Its combined release is
live, but **does not contain the time-entry fix**. Deployment:
`af71c074-e320-4a0d-9e9e-b5e42e7fe563`. Production retains its Delivery-only baseline
and both `hopkit.hiphop.dev` / `wantkit.todoless.dev` domains. Fresh read-only checks
confirm both versions, preserved settings/domains and unchanged production schema.
The earlier trigger inventory found zero Builds triggers and no GitHub workflows;
refresh this inventory before any push or deployment.

Completed combined-preview acceptance: 15 public artifact/health/private-boundary
checks; fresh Google login as ramyariran@gmail.com; existing legacy Home data;
HopKit branding; synthetic General→Home→General and reload with shared brief,
preferences, palette, references and retained Home concept; EN/FA/RTL/mobile.
Authenticated Delivery workspace, own/contributor queues, portfolio, hours and
weekly approval/audit history load without console errors. Those hosted checks
were read-only and did not exercise the time-entry fix or create Delivery records.

Preview migration 0017 previously preserved all 314 existing rows across 46
application tables and added an empty mode-settings table. Integrity checks pass.
Synthetic planning collection `HopKit preview acceptance 2026-10-25`
(`7e66705b-e734-4aa7-9e82-ff88053fb70d`) remains for review in Test 1; no real
purchases/tasks were added. The separately authorized two-role Delivery rehearsal
is documented in `/Users/reza/Documents/web/todoless/docs/planning/team-rehearsal-2026-10-25.md`.
It completed with the owner's second account; the developer's own session remains
unobserved. No additional invitation/import/approval/hour changes occurred here.

## Prepared candidate and recovery

Private ignored evidence is under `.tmp/hopkit-combined-release-2026-10-25/`.
The original deployed snapshots/one-shot marker are retained unchanged. New
candidate files are under **`with-time-entry/`**; these are compiled output copies,
not an alternate source tree. All application work/builds stayed in this checkout.

- `with-time-entry/source.json` records all 295 inputs and the exact two-file diff.
  Its SHA-256 is `0a70bb386ef80ef4dab966163fd04ac73019f6076422afe86a2c0b0dbdc5e8a0`.
- Each environment has `dist/kharidyar/release-preserved.json`, `manifest.json`
  and dry-run output. Each manifest contains 17 artifacts. All three dry-run Worker
  modules match the frozen modules and are byte-identical to the combined preview's
  Worker modules. All 11 client files match between the new environments.
- The configurations are unchanged from the validated preserved configurations:
  all 14 plain variables, six secret bindings, integration owner flags/allowlists,
  resource bindings, compatibility, observability and domain handling are retained.
  Generated default configs also compare equal. No secret values were retrieved.
  Both environments keep `TODOLESS_API_ORIGIN=https://todoless.dev`.
- Preview manifest SHA-256:
  `61d93ffae128595c3e3a120f1b294da3d1aae435ab2e476ea13072821e44d819`.
  Production manifest SHA-256:
  `f07409784cd603f3dfbb7078cd8d18573612329d347dacb701f98854f421a45a`.
- `candidate-prepare.py verify` checks the candidate source/artifact hashes,
  preserved Delivery notes, empty index and identical client bytes. Its current
  HEAD/index guards intentionally need review once staging or a commit changes Git
  state; content hashes remain the validation reference. Do not
  overwrite manifests or weaken guards to bypass drift. The old `prepare.mjs`
  whole-source check correctly rejects this newer two-file candidate.
- Logs: `time-entry-integration.log`, `time-entry-ui.log`, `time-entry-lint.log`,
  `time-entry-types.log`, `time-entry-{preview,production}-build.log` and matching
  dry-run logs. `with-time-entry/artifact-verification.json` records comparisons.
  `preview-release-after.json` records the fresh read-only live check.

Do not use ordinary deploy defaults; they disable integrations and omit Delivery's
origin. Future preview rollback target is its current version `6e1e2616-...` above;
production rollback target is its current `1e7a0d54-...` version. Preserve settings
and the additive 0017 table when reverting code. No D1 restore/drop is needed for
code rollback; destructive recovery requires separate approval.

## Next steps and dirty state

1. Exact commit approval is pending for the six-file checkpoint: the time-entry
   form, its integration test and four release/handoff documents. After an
   approved commit, verify the resulting source hashes and follow the separate
   exact-SHA push gate. Neither push nor deployment is authorized.
2. After deployment is authorized, refresh source/artifact/live-state guards and
   deploy the **revised preview candidate** (0017 is already applied there). Verify
   the time-entry edit in preview, retaining existing hosted acceptance evidence.
3. Only after preview acceptance and **separate production authorization**, refresh
   D1 bookmark/counts, apply only `0017_collection_mode_settings.sql` to production
   `85ccca6c-adde-4125-87de-a4de614b1091`, deploy the matched preserved candidate,
   and verify both domains/account flows. No remote migration ran in this prep.

The checkpoint contains only the reviewed runtime/test files and HANDOFF.md,
HOPKIT_COMBINED_HANDOFF.md, HOPKIT_TIME_ENTRY_RELEASE.md and RELEASE.md. The two pre-existing
DELIVERY_PILOT_RELEASE.md/JSON changes remain byte-for-byte preserved and unstaged.
No generated artifacts, secrets or unrelated pilot changes belong in this commit.
Checkpoint reconciliation changes only release/handoff documents plus ignored evidence.
No other repository was edited; no source copy, worktree, resource rename, account
or security change. Life Planner/Food, real task imports and full Cloudflare
resource migration remain separate work.

Current documentation: [Wrangler dry-run and variable preservation](https://developers.cloudflare.com/workers/wrangler/commands/workers/),
[D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/) and
[Worker rollback](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

---

# Historical combined commit review checkpoint

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
