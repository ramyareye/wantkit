# HopKit combined release — live in production

## Production release — 2026-10-25 (live)

The user authorized deploying the tested candidate to **https://hopkit.hiphop.dev**,
preserving features/settings/dirty work and checking editing, with no invitations
or real task import. Released once at **16:27:27 Europe/Amsterdam (15:27:27 UTC)**.
Runtime source is `c5fee8480ea3697e0c9687e372feeb776f8a750d`; current main/remote
`ae3f75c31eeae580926121cc54ba2637071750ac` adds only the prior preview notes.
All 295 committed/working source inputs and 17 production artifacts matched the
tested frozen package before release. No build/source changes were necessary.

- Worker `kharidyar`, version **`46ffa845-633d-4e27-84d4-e06d3e28688e`** at 100%;
  deployment `c3bcd9b3-553d-417b-92c0-2baf698dbd4a`.
- Only additive migration `0017_collection_mode_settings.sql` applied to production
  D1 `85ccca6c-adde-4125-87de-a4de614b1091`. All **2,791 existing rows across 46
  application tables** were preserved; the new table was empty. Integrity/FK
  checks pass before/after. Recovery bookmark is stored in the private receipt.
- Live variables, inherited secrets, bindings, integrations, compatibility,
  observability, routes and domains compare preserved. Preview remains accepted
  version `2e6f6fd9-0110-45f8-8fa1-a3bc9a9027c3`, schema0017. Both Workers had zero
  Builds triggers. No account/security change, resource rename or other-repo edit.
- All **15 public production checks** pass, including exact HTML/assets, health,
  security headers and rejected anonymous private requests. Fresh Google login
  returns ramyariran@gmail.com to the existing account. HopKit branding and the
  existing Living Room's 19 items/Home tools load. Brief/images/Concept views load;
  General mode was inspected in the chooser then cancelled, with no planning write.
- **Delivery acceptance passed:** the user connected their existing personal key
  as ramyariran@gmail.com. The original task stayed selected after asynchronous
  loading; unchanged save succeeded and refresh retained the same single one-minute
  synthetic draft and all visible fields. No new entry, actual-work confirmation,
  submission, approval or existing contributor edit. No key read/storage by agent.
  Planning and Delivery tabs showed no console errors.
- Final D1 check confirms planning counts/schema/integrity unchanged. Fresh login
  added one session (13 to 14) and two normal auth rate-limit records (1 to 3);
  these database-backed Better Auth records are separate from planning data.

Code rollback: `1e7a0d54-1248-4b0a-94a1-4eefd562f854`, retaining settings and the
additive table/data. No restore/drop is needed. No rollback was required.
The package is `.tmp/hopkit-time-entry-release-2026-10-25/production/`, using
`dist/kharidyar/release-preserved.json`; ordinary deploy defaults omit integrations.
Do not repeat the completed deployment. Evidence is under
`.tmp/hopkit-combined-release-2026-10-25/`: `production-authorization.json`,
`production-builds-before.json`, `production-release-{before,after}.json`,
`production-migration-result.json`, deployment/migration logs,
`production-public.json`, `production-hosted.json` and screenshots.

Only these four release/handoff documents change in this closeout. The two dirty
Delivery pilot notes remain byte-for-byte preserved; index empty. No assistant
staging, commit or push. Next: checkpoint these release notes, then have the
actual developer complete the separately planned synthetic task/hour acceptance.
Real imports require their own authorization. No invitation or real import was
performed, and no further deployment is needed for this accepted candidate.

---

# Historical preview acceptance and preparation

Updated 2026-10-25. Checkout/chat: **`/Users/reza/Documents/HH/hopkit`**.
User-pushed `c5fee8480ea3697e0c9687e372feeb776f8a750d` contains the reviewed
combined release plus the time-entry fix. The six-file checkpoint and all 295
application/build inputs match the tested packages. User's subsequent “go”
authorized the preview update and edit/save check only; both are complete.
**Do not deploy production or apply production migrations yet.**

[HOPKIT_TIME_ENTRY_RELEASE.md](./HOPKIT_TIME_ENTRY_RELEASE.md) records exact
release evidence, the retained synthetic draft and next production steps.

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

## Live state — verified after preview deployment

| Environment | Worker | Active version (100%) | Schema |
| --- | --- | --- | --- |
| Preview | kharidyar-preview | `2e6f6fd9-0110-45f8-8fa1-a3bc9a9027c3` | 0017 |
| Production | kharidyar | `1e7a0d54-1248-4b0a-94a1-4eefd562f854` | 0016 |

Preview: https://kharidyar-preview.formahsa.workers.dev, now including the
selection fix. Deployment `244cb337-7a12-48b5-a9a2-fa96924ae6cb` completed once
at 2026-10-25 14:57:55 UTC. Post-deploy guards confirm production, settings,
bindings, domains and schemas unchanged; integrity/FK checks pass. No migration
ran. Both Workers have zero Builds triggers; no GitHub workflows were present.

New acceptance: all 15 public checks match the frozen package; existing Google
session and reconnected Todoless account are ramyariran@gmail.com. Saved task
preselection survives asynchronous loading, unchanged save succeeds, switching
projects (including back) requires a new task selection, and cancel/refresh
preserves saved fields. One synthetic one-minute QA entry remains **unsubmitted**
in Reza's draft week starting 2026-10-19 in HipHop delivery rehearsal, Grow/G-01.
No actual-work confirmation, approval/payment or existing contributor edit. The
preview uses live Todoless, so this labelled draft is retained there for review.

Completed combined-preview acceptance: 15 public artifact/health/private-boundary
checks; fresh Google login as ramyariran@gmail.com; existing legacy Home data;
HopKit branding; synthetic General→Home→General and reload with shared brief,
preferences, palette, references and retained Home concept; EN/FA/RTL/mobile.
Authenticated Delivery workspace, own/contributor queues, portfolio, hours and
weekly approval/audit history load without console errors. Those earlier checks
were read-only; the new targeted synthetic edit/save acceptance is recorded above.

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
  `time-entry-preview-after.json` records the completed preview release guards;
  `time-entry-public.json` and `time-entry-hosted.json` record current acceptance.

Do not use ordinary deploy defaults; they disable integrations and omit Delivery's
origin. Preview rollback target is the previous version `6e1e2616-0e86-42c7-8886-622dedf96364`;
production rollback target is its current `1e7a0d54-...` version. Preserve settings
and the additive 0017 table when reverting code. No D1 restore/drop is needed for
code rollback; destructive recovery requires separate approval.

## Next steps and dirty state

1. Checkpoint four release/handoff updates: HANDOFF.md,
   HOPKIT_COMBINED_HANDOFF.md, HOPKIT_TIME_ENTRY_RELEASE.md and RELEASE.md.
   The source checkpoint was committed/pushed by the user; the agent performed
   no Git mutation here. Index remains empty. The two pre-existing
   DELIVERY_PILOT_RELEASE.md/JSON changes remain byte-for-byte preserved.
2. Only with **separate production authorization**, refresh source/artifact/live
   guards and D1 bookmark/counts, apply `0017_collection_mode_settings.sql` to
   production `85ccca6c-adde-4125-87de-a4de614b1091`, deploy the matched preserved
   candidate and verify both domains/account flows. Preview acceptance is complete.

No generated artifacts, secrets or unrelated pilot changes belong in the notes
checkpoint. No other repository edit, source copy, worktree, resource rename,
account/security change or invitation. Life Planner/Food, real task imports and
full Cloudflare resource migration remain separate work.

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
