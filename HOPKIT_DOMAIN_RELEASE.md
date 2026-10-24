# HopKit production domain release

Subsequent branding checkpoint, October 23: Google consent app name is now
**HopKit**; local website branding awaits the combined release chosen by the user.
The production version below remains unchanged. See [BRANDING.md](./BRANDING.md).

**Live and verified 2026-10-23 (Europe/Amsterdam; October 22 UTC).** The user
explicitly approved: “go ahead with the domain-only cutover ... branding after.”
`https://hopkit.hiphop.dev` now serves the existing production application. Fresh
Google sign-in with the user's chosen existing account returned to the new host
and loaded the existing workspace and Living Room collection. No planning data
was edited. Do not rerun the completed mutations below.

| Record | Applied identity |
| --- | --- |
| Worker | Existing `kharidyar` |
| Version, 100% | `11e7a71d-93f2-4903-9071-e238019bac8a` |
| Deployment | `2bc46b9d-8f80-45ad-82bc-c1607ea22cb6` |
| Settings applied | `2026-10-22T22:17:24.366028Z` |
| New custom domain | `cda4e6bacb6263de0150c61cd595a7672e53f0f7` |
| Certificate | `5f12cbd1-296f-4a2d-8f00-e6f37d3159b5` |
| Preserved application source | `c0b456257f9710c8beedf7c4e27e401d1c9b6f3f` |

The old hostname remains attached and passes public smoke checks. Branding,
Google publishing status, full resource migration and unreleased source remain
separate. No application build, schema migration, Git commit or push occurred.

## Scope and Google project recommendation

Keep Google project ID `kharidyar` and its existing OAuth client. The human-readable
project name can later become **HopKit** without replacing credentials; Google
project IDs are permanent ([Google documentation](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects)).
The client display label and public consent name are separate settings. The
consent name currently reads **Wantkit**, and the app is in **Testing** status.
Do not change publishing status or submit verification as part of this cutover.

Attach the domain to the **existing production Worker `kharidyar`**. A new Worker,
build or Git push is unnecessary merely to attach a custom domain. Preserve the
existing D1, R2 and Workflow bindings. The full resource migration remains in
[CLOUDFLARE_RENAME.md](./CLOUDFLARE_RENAME.md), with its own preview-first rollout.
This first step will still display the existing WantKit UI. A coordinated HopKit
UI/consent rebrand and the unreleased General/Home/Delivery features are separate
releases; do not build current HEAD or apply migration 0017 here.

## Verified pre-cutover baseline

- Cloudflare account: `a9d6a76bb46b28869fc41b0aa08a4b86`.
- `hiphop.dev` is active in this account; zone `8180966981477c2a768e324f2cd3a4c4`.
  Exact `hopkit.hiphop.dev` DNS and custom-domain queries returned zero entries;
  the zone has no Worker routes. This resolves the earlier DNS-read uncertainty.
- `wantkit.todoless.dev` remains attached to `kharidyar`, enabled, with custom-domain
  previews disabled. Keep it throughout cutover and recovery.
- Active **and latest** production version: `8232de9d-f03f-469c-8fc3-344a78fe259a`
  at 100%; deployment `5396d6d1-b8a8-4d74-bf03-a565d32eb26c`. This is deployed
  source `c0b4562`, not local HEAD `bfcdcec`.
- Twenty-five bindings: six secrets, thirteen plain-text values and six resource
  bindings. Existing live integration flags/allowlists, runtime and observability
  settings are preserved. Do not substitute checked-in disabled defaults.
- Production `/api/health` returns `{"status":"ok"}`. Public MCP discovery reports
  the current issuer `https://wantkit.todoless.dev/api/auth` and resource
  `https://wantkit.todoless.dev/api/mcp`.
- Five public HTML/asset fingerprints are saved in ignored
  `.tmp/hopkit-production-domain-public.json`. Root SHA-256 remains
  `4e398b297a5b6a98944228681988592a8499a1f8cfd6416b2ce6d8f27db84059`.

## Exact applied changes

| Surface | Applied change |
| --- | --- |
| Cloudflare custom domain | Add `hopkit.hiphop.dev` to existing `kharidyar`; keep `wantkit.todoless.dev`; disable custom-domain preview routing |
| Google authorized domains | Append `hiphop.dev`; keep `formahsa.workers.dev` and `todoless.dev` |
| Google client redirects | Append `https://hopkit.hiphop.dev/api/auth/callback/google`; preserve all three existing callbacks |
| Google JavaScript origins | Keep current `https://wantkit.todoless.dev`; this server-side auth flow does not establish a need for another JavaScript origin |
| `BETTER_AUTH_URL` | `https://hopkit.hiphop.dev` |
| `AUTH_TRUSTED_ORIGINS` | `https://wantkit.todoless.dev,https://kharidyar.formahsa.workers.dev,https://hopkit.hiphop.dev` |
| `RESEARCH_BROWSER_ALLOWED_ORIGIN` | `https://hopkit.hiphop.dev` |
| All other bindings | Inherit existing values; no credential rotation or storage change |

The original trusted-origin list is recorded in RELEASE.md's September 9 domain
release; subsequent releases explicitly preserved those settings. It was not
read back from the encrypted live binding. The prepared candidate is ignored
`.tmp/hopkit-production-domain-candidate.json`: exactly three changed bindings and
22 inherited bindings, with the active/latest version guard validated. It contains
public origin values only, no application or provider credential values.

Use the supported [script-settings PATCH](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/script_and_version_settings/methods/edit/)
with a multipart JSON `settings` part, retaining deployed code/assets. `inherit`
on this endpoint uses `latest`, so reject any baseline drift before mutation.
The candidate records an explicit deployment annotation. The guarded PATCH ran
once and automatically deployed the new version at 100%. All readable settings
other than the research origin and release annotations compare equal afterward;
all 25 binding identities/types remain. The two secret origin values are masked
by the API, so their behavior was verified through Google login and discovery.
All four code/sourcemap modules, the main module and asset configuration compare
equal between immutable old/new versions. No local source was uploaded.

## Reviewed cutover procedure and recovery

Steps 1–4 are complete. Step 5 remains a user-facing follow-up; step 6 is only
the conditional recovery procedure, and was not needed.

1. Review this domain-only scope, its three runtime changes and connector impact.
   After approval, refresh active/latest identity, complete settings, public
   fingerprints, DNS/domain state and Google client configuration. Stop on drift.
2. Append Google's domain/callback, retaining existing entries. Stop if Google
   requires an unapproved verification or publishing change. Wait for the new
   callback to be accepted before the auth-origin cutover.
3. Attach the custom domain to `kharidyar` and verify certificate issuance and
   unchanged public assets before advertising it. The existing Worker is already
   available for this dashboard step ([Cloudflare instructions](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)).
4. Apply the exact origin settings together, preserving all other bindings,
   code/assets and script-level settings. Record the resulting version/deployment.
   Verify health, private endpoint rejection, both domains, public fingerprints,
   Google sign-in/callback, signed-in reads and new MCP discovery. Do not create
   planning records or invoke research/generation as part of smoke testing.
5. Coordinate reconnection of existing assistant clients to
   `https://hopkit.hiphop.dev/api/mcp`. The deployed source validates issuer and
   audience against `BETTER_AUTH_URL`; old tokens will not satisfy the new values.
   Retaining the old domain alone does not preserve those tokens. Keep current
   registrations and scopes; no connector deletion or new consent is implicit.
   Users also need a new browser session on the new hostname.
6. On failed validation, redeploy baseline version
   `8232de9d-f03f-469c-8fc3-344a78fe259a` at 100% and verify old auth origin,
   research origin, settings, health and assets. [Worker rollback](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
   does not undo DNS or Google changes; retain their additive entries for review
   and direct users back to `wantkit.todoless.dev`. New-origin connector sessions
   may need reconnecting again. No data rollback is required: storage and schema
   remain unchanged. Do not delete any resource as cleanup.

## Validation, evidence and next step

- `release:smoke` passes on both hostnames: document/security headers, public API,
  database health and anonymous session rejection.
- Eighteen additional read-only checks pass: five exact baseline artifacts on
  each host; canonical HopKit OAuth and protected-resource discovery on both;
  invalid-token rejection for workspace, MCP and private concept-image endpoints.
- Google Console readback confirms `hiphop.dev` and the fourth callback, retaining
  all previous entries. Fresh Google sign-in and existing collection reads pass.
- `.tmp/hopkit-domain-cutover-before.json`, `hopkit-domain-cutover-after.json`,
  `hopkit-domain-settings-patch-result.json`, `hopkit-domain-code-verified.json`
  and `hopkit-domain-public-verified.json` retain private evidence. Screenshots
  `hopkit-google-domain-saved.png`, `hopkit-google-callback-saved.png` and
  `hopkit-domain-live.png` document the provider and application results.
- Default/production `RESEARCH_BROWSER_ALLOWED_ORIGIN` in `apps/web/wrangler.json`
  is synchronized; preview and resource identities remain unchanged. Existing
  disabled checked-in integration defaults were not deployed. No full build or
  application test rerun was needed for this settings-only release.

Next: reconnect existing assistants to `https://hopkit.hiphop.dev/api/mcp`, then
prepare the HopKit UI/consent branding release separately. Existing registrations
were not removed or recreated. Full resource migration stays deferred and
preview-first. Git staging, commit and push remain subject to their exact gates.
