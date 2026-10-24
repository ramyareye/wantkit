# HopKit Delivery pilot

**Current status — 2026-10-24:** the separate Delivery-only candidate is already
deployed to preview with the live Todoless backend and migrations 0005–0009.
Personal-account acceptance remains pending; production has no Delivery release.
Use [DELIVERY_PILOT_RELEASE.md](./DELIVERY_PILOT_RELEASE.md) for that hosted record.
The current combined HopKit source is being prepared for Git review only, with
deployment explicitly paused. The dated local checkpoints below are historical.

Follow-up: flexible personal execution is now implemented in **Personal portfolio**.
Choose existing projects across workspaces; show one active priority/two Ready
alternatives, blockers and weekly progress. Optional shared 0-120 minute daily
availability supports repeated zero days and unset values. Pause/resume keeps the
active task and restart note. It never logs hours or changes deadlines/approvals.
API/MCP support requires migration 0009; no HopKit migration or dependency change.
26 UI/client + 8 proxy tests, lint/typecheck/build and synthetic browser checks pass.
See [the portfolio contract](../todoless/docs/planning/personal-portfolio-checkpoint-2026-10-23.md).
The current release package is 22 files; the earlier 19-file snapshot below is historical.

Follow-up 2026-10-23: [updated hosted review package](DELIVERY_PILOT_RELEASE.md).
The two UI gaps are fixed: Update progress saves notes/next action/evidence and
existing blocker details without changing status; latest task return reasons and
paginated history are visible, including after later progress. Review/Verify
evidence remains frozen. Version, exact retry and authorization guards stay intact.
New files: DeliveryTaskUpdates, delivery-task-updates and focused tests; queue,
types, proxy and local fixture updated. No backend runtime/schema changes here.

Validation: 20 UI/client + 7 proxy tests, real disposable-D1 concurrency/retry/
authorization checks, contributor/owner browser checks, lint, typecheck and local
current-checkout build pass. Run `bun apps/web/scripts/test-delivery-local.ts --verify-updates`.
The refreshed 19-file baseline patch excludes General/Home/branding/resource work;
it is not a built release. Todoless needs 0005-0008 and hardened recovery validation.
The separate domain handoff now records hopkit.hiphop.dev live with c0b4562 source;
preserve its origins/bindings. No live action was performed by this checkpoint.
The October 22 checkpoint below is historical; this follow-up takes precedence.

Updated 2026-10-22. Implemented and tested locally in the existing `../wantkit`
checkout. No commit, push, deployment, live origin configuration or real pilot data.
The existing HopKit rename remains paused; this is a separate bounded UI checkpoint.

## Use and scope

Signed-in users can open **Delivery** from the planning header or `/delivery`.
Connect a personal Todoless API key, verify the displayed Todoless identity, and
choose a workspace. HopKit and Todoless identities remain separate. A key must
have `workspace:read` and `members:read`; changes also require `workspace:write`.
Workspace keys cannot record human time. Tokens stay in tab memory, never
localStorage/sessionStorage/database/cookies. Disconnect, page exit or reload
clears the connection. Pending writes should be retried before leaving the tab.

- **Task queue:** one active task, two ready alternatives and shortage/conflict
  notices; person selector; blockers/dependencies; briefs, acceptance checks and
  evidence. Reasoned status transitions include human review and verification.
  Completion does not imply deployed/device-accepted. Prepare full Ready briefs,
  dependencies, projects and assignments through Todoless API/MCP for this pilot.
- **My hours:** one week across all projects, manual project/task/date/activity,
  whole minutes, notes and optional evidence. Draft entries can be edited or
  removed (reason required). Submit only after explicitly confirming human time.
- **Weekly approval:** owner or delegated approver reviews another person's week,
  approves original/adjusted minutes or returns with a reason. No self-approval.
  A contributor can revise returned/approved weeks; prior versions remain in the
  audit trail. Submitted and approved totals stay separate, including by project.
- **CSV:** exports the selected week directly from Todoless, retaining its safe
  escaping and submitted/approved/terms/payment fields. No money is moved.

English pilot screen, responsive light/dark layouts. The existing planning modes,
localization, sign-in, connector and release boundaries remain intact. Delivery
loads in its own client chunk. No shared editable task store or database was added.

## Connection boundary

The signed-in `POST /api/delivery/request` route accepts a bounded request envelope
and an `X-Todoless-Key` header. Only the enumerated read routes, task-delivery PUT,
week creation and week action POST are allowed. Origin must exactly match the
HopKit app origin, body size is limited, redirects/HTML are rejected, and no
HopKit cookie or unrelated headers are forwarded. Responses are no-store. Key,
body and upstream error details are not logged by the proxy.

`TODOLESS_API_ORIGIN` is optional operator configuration and is **not set** by this
checkpoint. With it unset, the proxy returns `DELIVERY_NOT_CONFIGURED`. Use a
reviewed HTTPS Todoless origin when rollout is authorized. HTTP loopback is allowed
only when HopKit's configured app origin is also loopback. The browser cannot
choose the destination. No shared owner key, OAuth/provider changes or persistent
credential vault were introduced.

This UI requires the current sibling Todoless implementation, including migrations
0006-0008 and the additive read fields `/v1/me.data.workspace_id` plus time settings
`access: { user_id, can_approve, can_configure }`. Authorization remains enforced
on every backend operation. HopKit's own workspace membership is not a substitute
for Todoless membership; no per-project privacy is implied within a workspace.

Writes carry the displayed resource version and a unique idempotency key. A stale
write blocks editing until records are refreshed. Unknown outcomes keep the exact
command/key; **Retry exact action** is the only subsequent write until resolved.
This prevents a lost response or double click from creating duplicate time entries.
The pending receipt is also memory-only; after forced tab closure/reload inspect
current records before recreating an entry.

## Validation and reproducible local check

- `bun run typecheck` and `bun run lint`: pass.
- `bun run test`: 360 tests pass (27 domain, 5 i18n, 148 Worker, 81 MCP, 92 UI/client,
  7 runner). New focused cases cover real signed-in session enforcement, disabled
  configuration, origin/path/credential-management restrictions, redirect/HTML
  rejection, forwarded headers, CSV/errors, retries, double clicks, calendar DST,
  personal-key clearing and approval reductions/self-review.
- `bun run --filter @wantkit/web build:local`: pass; Delivery is a separate ~31 kB
  JS chunk (~9.6 kB gzip). Existing shared-bundle size and third-party annotation
  notices remain. No deployment/dry-run or cloud mutation was run.
- `apps/web/scripts/test-delivery-local.ts`: passes in Chrome using the actual
  React screen/proxy and actual Todoless Worker with disposable D1 and synthetic
  fixtures. Covers start/review/verify/done, stale-version refresh, two project
  entries, deliberately lost save response and identical retry with no duplicate,
  submit, no self-approval UI, return/revise, adjusted approval, CSV, no persistent
  keys and mobile overflow. Grow 90 + Veloura 120 = 210 submitted minutes;
  adjusted approval preserves that snapshot with 180 approved minutes.
- Browser fixture bypasses only HopKit login; actual Worker tests separately
  exercise database-backed session enforcement. Live Google sign-in, deployed
  transport and real invitations were not exercised. All fixture settings/keys
  are fictional; operator config, `.dev.vars` and remote bindings are not loaded.

Run from this repository after installing its and sibling Todoless dependencies:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  bun run --filter @wantkit/web test:delivery:local
```

Use an existing Playwright installation and locally installed Chrome. The default
backend source is `../todoless/apps/api`; override `TODOLESS_SOURCE_ROOT` only to
point at an explicitly approved checkout. No alternate source copies are made.
The script closes its browser/server/emulator and uses no persistent database.
Ignored evidence is under `.tmp/delivery-ui/` (desktop/mobile screenshots and CSV),
`.tmp/delivery-tests.log` and `.tmp/delivery-build.log`.

## Changed scope and remaining work

New `DeliveryPage`, `DeliveryQueue`, `DeliveryWeeks`, CSS, client/types/resource hook;
Worker proxy/routes; focused tests and local browser fixture. Small additions to
App, planning navigation, Worker route registration and the optional test script.
Todoless changes are only the two additive read fields, their test and handoffs.
The earlier six dirty rename files are preserved; README/HANDOFF additions keep
all prior content. Both indexes remain empty, both branches remain `main`.

Next: accept the local experience, agree actual week calendar and any terms, then
prepare an explicitly authorized preview pilot/release with verified recovery and
exact Git gates. No rate/currency/cap/week settings were set in live systems.
Approximately 10h/week is shared availability, not a billing cap. Payments remain
manual. Grow/Veloura pilot first; WF retains existing ownership, and Celebratix
stays in Linear. Platform/generator work remains future scope.

HopKit's current source includes unreleased General/Home changes and migration
0017. Todoless prerequisites are also unreleased. Do not deploy current HEAD,
configure a production connection, or resume the paused Cloudflare rename merely
because local UI tests passed. Follow the separate release/security approval gates.
