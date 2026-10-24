# Delivery-only hosted pilot review package

Updated 2026-10-23. **Exact Delivery candidate deployed to preview; personal-account acceptance pending.**
Use [the complete Veloura release review](../todoless/docs/planning/veloura-pilot-release-2026-10-23.md)
for migrations, targets, personal accounts, verification, recovery and approval.

## Current hosted rehearsal

The user authorized the hosted rehearsal. API/MCP and migrations0005-0009 are
live; all original 55 Todoless rows were preserved and 26 hosted checks passed.
Preview version `dfd648fb-6c4c-4bb6-8de7-bafd3a1d54ab` serves the exact candidate at
[Delivery preview](https://kharidyar-preview.formahsa.workers.dev/delivery).
Preview adds only `TODOLESS_API_ORIGIN=https://todoless.dev`; existing bindings,
flags, auth settings, resources and observability were inherited and verified.
Production remains `11e7a71d-93f2-4903-9071-e238019bac8a`, with both domains and
all settings unchanged. This preview uses the live Todoless backend.

The user chose self-service signup. Neither supplied email exists in Todoless;
the developer also needs HopKit signup. No account/key, invitation, verification
email, membership, task or hours record was created. The real browser reaches
Google sign-in. Two-person queue/hours/approval acceptance is still pending.
See [current evidence, recovery and signup steps](../todoless/docs/planning/hosted-rehearsal-2026-10-23.md).
No commit, push or staging. Both dirty trees and empty indexes are preserved.
The previous local validation below remains valid; source and patch hashes match.

## Exact source boundary

[DELIVERY_PILOT.patch](DELIVERY_PILOT.patch) contains 22 files based on deployed
application source `c0b456257f9710c8beedf7c4e27e401d1c9b6f3f`.
[DELIVERY_PILOT_RELEASE.json](DELIVERY_PILOT_RELEASE.json) records the patch hash,
each base/candidate hash, the allowlist and remaining blockers. Context and
candidate hashes were checked against Git objects. The user explicitly approved
`/private/tmp/todoless-hopkit-release-candidate-2026-10-23`; the exact patch was
applied there to a c0b4562 archive, with frozen offline dependencies. All 273
baseline files and 22 patch files were verified. The original checkout and index
remain untouched. The source patch itself is unchanged.

Three baseline integration files are kept to their reviewed Delivery hunks:

- `apps/web/src/react-app/App.tsx`: lazy signed-in route and login return.
- `apps/web/src/react-app/PlanningDashboard.tsx`: one Delivery navigation link.
- `apps/web/src/worker/index.ts`: bounded authenticated proxy registration.

Thirteen new runtime files:

- `apps/web/src/react-app/DeliveryPage.tsx`, `DeliveryPage.css`, `DeliveryQueue.tsx`,
  `DeliveryTaskUpdates.tsx`, `DeliveryPortfolio.tsx`, `DeliveryWeeks.tsx`, `delivery-client.ts`,
  `delivery-task-updates.ts`, `delivery-types.ts`, `portfolio-client.ts`, `use-delivery-resource.ts`.
- `apps/web/src/worker/delivery-proxy.ts`, `delivery-routes.ts`.

Six validation-only files: `delivery-client.test.ts`,
`delivery-task-updates.test.tsx`, `portfolio-client.test.tsx`, Worker `test/delivery-proxy.test.ts`,
`scripts/delivery-fixture.tsx` and `scripts/test-delivery-local.ts`.
Demo controls/credentials must not appear in deployed assets/routes.
No package/dependency/lockfile change or HopKit migration is needed.

## Personal portfolio addition

The user also authorized flexible personal-project execution. Delivery now has a
Personal portfolio tab selecting existing projects across workspaces, one chosen
active priority, up to two Ready alternatives, current blockers and weekly updates.
Private shared daily availability accepts 0-120 minutes or unset; several zero
days are valid. Pause/resume keeps the active task and restart note. No deadline,
task status, approval or actual-hour records are changed by these preferences.
It does not duplicate life planning, shopping or routines.

API migration 0009 adds private preferences/availability/receipts; it follows the
existing 0005-0008 prerequisites. No HopKit migration is added. API/MCP validation
now passes 53 tests/701 assertions plus typecheck, API behavior/smoke and real MCP.
Synthetic browser selection, three zero days, 120 minutes and pause/resume pass.
See [the portfolio checkpoint](../todoless/docs/planning/personal-portfolio-checkpoint-2026-10-23.md).

## Fixed UI gaps

**Update progress** records a note, next action, evidence/build reference without
sending a status change. Blocked tasks also expose their blocker owner, reason
and next action. Existing version checks, exact retries and permissions apply.
Review/Verify evidence stays frozen: return work to implementation first.

Cards show the latest return reason, author, UTC timestamp and version, plus
paginated task history. The return remains visible after newer progress notes.
History reads are authorized by Todoless through the existing signed-in proxy;
only GET and limit/cursor are newly allowed. No API schema/migration change.

## Exclusions and current hosted context

Exclude General/Home runtime, migration 0017/schema changes, post-baseline package
rename, branding work, resource migration, current dist, seeds, evidence and keys.
Keep original baseline Worker exports/auth/connector flows. The three integration
candidates were preserved from the earlier reviewed patch so concurrent branding
and General/Home edits cannot be swept in by copying full working files.

The separate [domain handoff](HOPKIT_DOMAIN_RELEASE.md) now records production at
`https://hopkit.hiphop.dev`, Worker `kharidyar`, version
`11e7a71d-93f2-4903-9071-e238019bac8a`; old wantkit.todoless.dev remains attached.
Production application source is still c0b4562/schema0016. Preview now serves
c0b4562 plus the exact Delivery patch, still on schema0016. This task did not
perform or alter that domain cutover.
Preserve the new live origins and all existing bindings; source-baseline selection
does not authorize reverting settings. Branding has separate dirty work; its
handoff records a combined-release preference, with its standalone patch retired.
This task still prepares the explicitly requested Delivery-only scope. A combined
release needs its own complete feature/schema review; do not silently broaden this
package. If branding ships first, refresh the baseline and integration hunks.
Full Cloudflare resource migration remains separate and deferred.

Do not deploy current HEAD/dist or ordinary build-and-deploy scripts: they contain
General/Home and concurrent work. Recheck hashes and active code/settings before
building a real candidate. A different base or added path needs scope review.

## Validation and remaining blockers

This follow-up passes 26 UI/client tests, 8 proxy/session tests, lint, TypeScript
and a local current-checkout build. Existing large shared-chunk and third-party
annotation warnings remain. Real disposable D1 integration passes progress/blocker
saves, exact retry after a lost successful response, a two-client version race,
review freeze, persistent return reason and outsider/viewer/removed-member access.
Interactive browser checks pass contributor progress/blocker edits, owner return,
and feedback still visible after later contributor progress. All data is synthetic.

Run the focused integration check in this checkout:

```sh
bun apps/web/scripts/test-delivery-local.ts --verify-updates
```

The exact c0b4562 + patch candidate now passes lint, TypeScript/production build,
26 UI/client and 8 proxy tests, plus the same real D1 integration check. Its
compiled production Worker also passes valid/missing/forged/revoked session,
cross-origin, credential-route and recovery/resumption checks against the exact
compiled API. Thirteen deployment module/asset hashes are in the JSON manifest.
Artifact checks exclude General/Home schema0017, Delivery demo controls and rename
helpers. Earlier full 360-test/browser evidence is historical; hosted OAuth and
two-person acceptance are still pending. Existing chunk/Zod warnings remain.

The independent API recovery artifact passes populated 0004 -> 0009 migration
failure/rollback/retry, full API freeze, retained history/hours/CSV/exact retries
and hardened resumption. It intentionally pauses reads and writes, including
credential issuance, while allowing maintenance health. No old vulnerable API
rollback is proposed. See the [recovery runbook](../todoless/docs/planning/release-candidate-recovery-2026-10-23.md).

Do not deploy the baseline-generated `dist/kharidyar/wrangler.json`: it contains
the old research origin. Preserve the completed domain cutover and inherit current
bindings/auth/settings in separately reviewed release metadata. The rehearsal
verified all existing settings unchanged and production research origin
`https://hopkit.hiphop.dev`; only preview adds the Delivery-origin binding.

Todoless migrations 0005-0009 and existing security/history/hour/delivery
dependencies are now deployed. API recovery must retain the credential fixes; blind
rollback to the old vulnerable API is unacceptable. No separate hosted Todoless
preview is configured. `TODOLESS_API_ORIGIN=https://todoless.dev` is active on preview only.
Actual personal signups, shared-workspace invitation approval, Google Testing
audience access if needed, and two-person acceptance remain pending. The synthetic
rehearsal uses Monday / Europe/Amsterdam; no live calendar is configured.
Use separate personal keys. Rates/currency/cap stay
unset, approximately 10h/week is shared availability, and payments stay manual.

## Local demo and next acceptance

```sh
bun run --filter @wantkit/web dev:delivery:demo
```

Use the printed loopback /demo URL and fictional contributor/owner switches.
Try Update progress on Active/Blocked, owner returns from Review, and inspect
Task updates & return reasons. My hours has a Grow 90 + Veloura 120 minute draft;
submit as contributor and return/approve in the owner's Weekly approval view.
No Google login or real keys: real UI/proxy/Worker, disposable D1, no .dev.vars or
remote bindings. Server shutdown discards the data. This is not hosted acceptance.

Next: user signups, then explicit approval for shared rehearsal workspace
invitations and the two-person synthetic workflow. Production UI promotion and
the two-card real import remain separate later actions. Git commit/push gates
remain separate; no staging, commit or push occurred. API/MCP/preview deployment
and API migrations were authorized and performed in the hosted rehearsal.
