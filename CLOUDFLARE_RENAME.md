# HopKit Cloudflare rename

**Preparation follow-up — October 24:** all eight local R2 helper tests pass.
No resource migration, remote copy or deployment was performed by the combined
source-preparation task. Cloudflare API reads on October 23 found zero Builds
triggers on both existing Workers, superseding the older access uncertainty.
Preview now has a separate Delivery-only release; use DELIVERY_PILOT_RELEASE.md
and refresh live versions/settings before resuming this deferred migration.

**Latest result — October 23:** the user approved the production domain-only
cutover, and `https://hopkit.hiphop.dev` is live on the existing production Worker
and data. Google sign-in and existing collection reads pass. See
[HOPKIT_DOMAIN_RELEASE.md](./HOPKIT_DOMAIN_RELEASE.md) for the applied settings,
verification and rollback. Branding follows separately; the full resource
migration below remains preview-first, deferred and unapplied.

Resource-migration preparation below was updated 2026-10-22 (Europe/Amsterdam), before the separately approved domain cutover above. **HopKit and `hopkit.hiphop.dev` are confirmed.** The full resource migration remains selected for preparation, preview first and production separately; its resource creation, copies and binding cutover remain unauthorized. Earlier production-origin and OAuth observations below are historical; use the domain release record for the current state.
Working folder: `/Users/reza/Documents/web/wantkit`, branch `main`.
Account: `a9d6a76bb46b28869fc41b0aa08a4b86` (existing Wrangler login).

## Resource map

| Environment / resource | Current | Target | Operation |
| --- | --- | --- | --- |
| Preview Worker | `kharidyar-preview` | `hopkit-preview` | Name-only Worker update; coordinate preview URL/auth |
| Production Worker | `kharidyar` | `hopkit` | Name-only Worker update; verify existing custom domain |
| Preview D1 | `kharidyar-preview` | `hopkit-preview` | New database, verified data copy, binding cutover |
| Production D1 | `kharidyar-production` | `hopkit-production` | New database, verified data copy, binding cutover |
| Preview R2 | `kharidyar-concept-media-preview` | `hopkit-concept-media-preview` | New private bucket, verified object copy, binding cutover |
| Production R2 | `kharidyar-concept-media-production` | `hopkit-concept-media-production` | New private bucket, verified object copy, binding cutover |
| Preview Workflow | `kharidyar-research-preview` | `hopkit-research-preview` | New Workflow using existing `ResearchWorkflow` class; binding cutover |
| Production Workflow | `kharidyar-research` | `hopkit-research` | New Workflow using existing `ResearchWorkflow` class; binding cutover |

The October 18 paginated account inventory found no `hopkit` names in Workers, D1, R2 or Workflows. Recheck immediately before creation and stop on a collision; never adopt or overwrite an existing target implicitly. Private evidence: `.tmp/hopkit-targets-2026-10-18T11-54-39.956Z.json`; read-only helper: `.tmp/hopkit-target-inspect.mjs`. Local resource names are separate emulator configuration: preserve local D1/R2 state before changing `kharidyar-local`, `kharidyar-concept-media-local` or `kharidyar-research-local`. A name change can select fresh local storage; do not silently discard the existing local dataset.

### Evidence and release boundary

- Preview refreshed 2026-10-18. Worker immutable ID: `6b889f7a6ed1465c8975e5aea9abf668`; active version `2f5314c4-2f57-4d61-a55d-a9786728e8b5` at 100%.
- Production last inspected 2026-10-12. Worker immutable ID: `76201a3d06164b37aa95af5455788b6b`; active version `8232de9d-f03f-469c-8fc3-344a78fe259a` at 100%.
- Both versions are the October 3 landing-page release from source `c0b4562`. Current `main` is `bfcdcec3efc81fd9d387e38b73e8fb1fa7e5113a` and contains unreleased General/Home work. A rename must not release that source or apply migration 0017.
- Preview D1 ID: `153fad62-2d09-41a3-8ee7-f7efd2b91c80`, reported size 1,089,536 bytes. Production D1 ID: `85ccca6c-adde-4125-87de-a4de614b1091`, reported size 3,563,520 bytes.
- R2 reports preview: 4 objects / 2.13 MB; production: 2 objects / 954 kB. Both report WEUR / Standard. These metrics are planning estimates; exact key/metadata/content verification is required during migration.
- Preview Workflow refreshed October 18: zero instances in all returned states. Production was last checked October 12, also zero. Recheck immediately before switching; this is not a permanent guarantee.
- Each Worker has six secret bindings and thirteen plain-text variables. Actual variable values, secret identity and all bindings must be preserved, except the agreed preview-origin changes. Source defaults disable live integrations and must not overwrite live configuration.
- Production custom domain `wantkit.todoless.dev` currently maps to `kharidyar`. Both Workers also have enabled `workers.dev` URLs and preview URLs.
- Cloudflare Builds API returned 403, but Chrome native UI on October 18 verified preview Settings → Builds shows “Git repository / Connect”: no Git repository is connected to preview. Its Trigger events section shows no cron, queue consumers or email routing. Production Builds remains unverified. No checked-in GitHub Actions workflows exist.

Ignored inventory evidence: `.tmp/cloudflare-rename-inventory.json`, `.tmp/cloudflare-rename-builds.json`; read-only helper `.tmp/cloudflare-rename-inspect.mjs`. These omit secret values and redact plain-text variables except the public research origin. Use `wrangler auth token --json` internally for authenticated helpers, never print it; the historical `default.toml` token was stale while Wrangler's active credentials worked.

Preview preflight refreshed on October 18: `.tmp/cloudflare-rename-preview-before.json` saves private live settings/version metadata; `.tmp/cloudflare-rename-preview-objects.json` lists four objects; `.tmp/cloudflare-rename-preview-public.json` records five public artifact hashes. The newest uploaded version equals the active version above, and deployment identity stayed unchanged throughout. The four object entries total 2,129,658 bytes; content has not been downloaded or exported. Settings and public artifact hashes match the earlier snapshot. The read-only helper is `.tmp/cloudflare-rename-preview-preflight.mjs`; both helpers passed `node --check`. Do not print credentials or private values from these ignored snapshots.

## Supported operations and implications

[Worker PATCH](https://developers.cloudflare.com/api/resources/workers/subresources/beta/subresources/workers/methods/edit/) accepts `name` and leaves omitted fields unchanged. Use the existing immutable Worker ID rather than creating a new Worker. Verify deployment versions, bindings, domain routing and Workflow script association after each rename; the field documentation alone does not prove every dependent integration follows automatically.

The documented [D1 PATCH](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/edit/) updates replication, [R2 PATCH](https://developers.cloudflare.com/api/resources/r2/subresources/buckets/methods/edit/) updates the default storage class, and [Workflow PUT](https://developers.cloudflare.com/api/resources/workflows/methods/update/) identifies the Workflow by its existing name. None exposes a new-name field. Treat replacing these resources as a data/configuration migration. Do not use deletion/undeletion or undocumented API fields as a rename workaround.

## Preview candidate and domains

| Setting | Current | Prepared target |
| --- | --- | --- |
| Worker identity | `6b889f7a6ed1465c8975e5aea9abf668` | Same identity, name `hopkit-preview` |
| Preview origin | `https://kharidyar-preview.formahsa.workers.dev` | `https://hopkit-preview.formahsa.workers.dev` |
| `DB` binding | `153fad62-2d09-41a3-8ee7-f7efd2b91c80` | ID returned by creating `hopkit-preview`; never guess an ID |
| `CONCEPT_MEDIA` binding | `kharidyar-concept-media-preview` | `hopkit-concept-media-preview` |
| `RESEARCH_WORKFLOW` binding | `kharidyar-research-preview` | `hopkit-research-preview`, same `ResearchWorkflow` class |
| `BETTER_AUTH_URL` secret | Existing preview origin | New preview origin |
| `AUTH_TRUSTED_ORIGINS` secret | Existing private allowlist | Preserve authorized entries and add new preview origin; obtain securely from the original secret source |
| `RESEARCH_BROWSER_ALLOWED_ORIGIN` | Existing preview origin | New preview origin |
| Other bindings, flags, allowlists and settings | Live snapshot | Preserve; do not substitute source defaults |

Google OAuth needs the exact new preview redirect `https://hopkit-preview.formahsa.workers.dev/api/auth/callback/google`. The current source uses Better Auth's server-side Google flow; adding a Google JavaScript origin is not established as necessary for this flow. Keep the application's trusted-origin change above separate from Google's JavaScript-origin setting. Inventory connectors that store the old endpoint. Neither configuration has been changed.

### Google OAuth checkpoint — October 22

- Project: **`kharidyar`**. Its Clients page lists one web application client, **`Web client 1 Kharidyar`**, ID `743213423379-5tkkggvn1frktihjvphkkqbeq06e9n3c.apps.googleusercontent.com`. [Open the verified client](https://console.cloud.google.com/auth/clients/743213423379-5tkkggvn1frktihjvphkkqbeq06e9n3c.apps.googleusercontent.com?project=kharidyar). Use the existing Google account that has project access; account selection was sufficient, with no new login or permission change.
- Current Google JavaScript origins: only `https://wantkit.todoless.dev`.
- Current authorized redirects: `https://kharidyar.formahsa.workers.dev/api/auth/callback/google`, `https://kharidyar-preview.formahsa.workers.dev/api/auth/callback/google`, and `https://wantkit.todoless.dev/api/auth/callback/google`.
- Exact later preview change: **append** `https://hopkit-preview.formahsa.workers.dev/api/auth/callback/google`; preserve all three existing redirects and the existing JavaScript origin. No new client, secret rotation, production URL or consent-branding change is needed for this preparation. [Google's web-server OAuth documentation](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred) requires the registered redirect URI for this flow.
- The saved, ignored credential file identifies this same project/client; only non-secret identifiers and redirects were inspected. The Console explicitly registers the current preview callback, but the live Worker's `GOOGLE_CLIENT_ID` secret value has not been compared. Preserve its existing credentials; confirm the effective client ID during the later authorized auth smoke or from the original deployment secret source before changing credentials. Do not infer a need to replace them.
- No OAuth fields were edited or saved, no credentials were revealed/downloaded/rotated, and no sign-in flow against the application was started. Client/consent branding is shared with production and stays outside the preview-only change. Existing Cloudflare evidence below remains dated October 18; this lookup did not refresh it.

Reserve `https://hopkit.hiphop.dev` for production. Keep `https://wantkit.todoless.dev` during preview and as a transition origin when production is separately reviewed. The October 18 zone read confirms `hiphop.dev` is active in the same Cloudflare account. DNS-record inspection returned HTTP 403: the exact hostname remains unverified, not available by assumption. Before production, check `hopkit.hiphop.dev` for DNS/custom-domain conflicts through an authorized dashboard or existing appropriate credential. [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) require an active owned zone; existing CNAME conflicts must be resolved through the later approved cutover. No domain purchase is part of this plan.

### R2 copy preparation

[`cloudflare-rename-r2.mjs`](./apps/web/scripts/cloudflare-rename-r2.mjs) is a library, with no CLI, credentials, session creation or automatic execution. It accepts only the named preview pair and a fresh source manifest. It checks all listing pages, object revisions, SHA-256 bytes, HTTP metadata, exact custom-metadata casing and storage class; refuses conflicting/extra destination objects; uses create-only conditional writes; supports retry for identical copies; and verifies both buckets afterward. Any failure retains partial target objects for inspection and forbids cutover. Its conservative preparation bounds are 100 objects, 10 MiB each and 32 MiB total, not Cloudflare quotas.

Three preview objects carry `imageId` / `visualRunId` metadata. Plain Wrangler object upload and the documented REST upload do not expose these fields. Use the supported [R2 binding API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) for this copy. Uploaded timestamps/version identifiers will change at the destination. The private REST listing retains source modification timestamps; the copy manifest retains source version identifiers. Neither is application metadata to rewrite.

The intended Node transport is [Wrangler `getPlatformProxy`](https://developers.cloudflare.com/workers/wrangler/api/) with two explicit R2 bindings in a dedicated config under the current checkout's ignored `.tmp` directory. For the later approved remote copy, verify account and exact bucket names against that config, set `persist: false`, disable environment-file loading, enable remote access only for these two bindings, and always dispose the proxy. Do not load the application's Worker/config or expose a public copy endpoint. Merely supplying name strings to the helper does not verify a proxy's real destination. No remote proxy has been started and no copy has run.

All eight focused unit tests pass, covering pagination, metadata, retries, target collisions/races, source drift, corruption, bounds and production-target rejection. The local-only emulator fixture `.tmp/hopkit-r2-local-check.mjs` also passes metadata casing/date, body/checksum, retry and create-only checks. It caught a proxy serialization failure with Node `Headers`; the tested plain-object condition is `onlyIf: { etagDoesNotMatch: "*" }`. This does not establish remote-service behavior. Bucket-level policies are separate from the object helper. October 18 API reads confirm WEUR/Standard/default jurisdiction, managed public URL disabled, no custom domains, no locks, and one enabled seven-day multipart-abort lifecycle rule. CORS and notification reads returned 404 and remain unverified pending dashboard inspection. Private evidence: `.tmp/hopkit-preview-details-2026-10-18T12-07-06.613Z.json`; the helper does not migrate these policies.

## Ordered migration plan

1. **Scope chosen:** full D1/R2/Workflow migration and Worker renames, preview first; production separately. Do not ask the user to choose this scope again. Complete the concrete preview candidate before requesting the protected mutation/deployment approval.
2. **Resolve cutover prerequisites.** Preview Builds is verified disconnected through the dashboard; recheck immediately before mutation. The Google client above registers current preview and production callbacks. Before renaming preview, append its exact HopKit preview redirect after approval, preserving existing entries and credentials. Coordinate `BETTER_AUTH_URL`, `AUTH_TRUSTED_ORIGINS`, `RESEARCH_BROWSER_ALLOWED_ORIGIN` and any connector registrations. Keep production untouched during preview; its later target is `https://hopkit.hiphop.dev`. Plan for the legacy `workers.dev` URLs changing.
3. **Prepare the exact preview candidate.** Preserve the deployed release and settings; prepare only resource bindings and preview-origin changes. Verify a supported settings/version update can preserve the live code, assets and inherited secrets. Do not fall back to deploying HEAD. Any need for a separate source checkout/copy or a build requires its own approval. Candidate source must remain in the current folder unless another destination is explicitly approved.
4. **Approve preview mutation.** Present the exact resource-creation/copy operations, configuration diff, deployed source/version, verification steps and rollback before deployment. Create the target D1/R2/Workflow resources only within that approved scope. Preserve bucket access, CORS/lifecycle/custom metadata and database schema/migration history. [D1 export/import](https://developers.cloudflare.com/d1/best-practices/import-export-data/) is supported; keep exports private and ignored. Recheck active Workflow instances and establish and verify a full request/job freeze before final snapshots. Cover browser requests (session reads can write), MCP, scheduled work, research Workflows and background tasks, not only POST/PUT requests. Record in-flight completion and keep both old/new stores unavailable to application writes until validation finishes.
5. **Cut over and verify preview.** Rename its existing Worker, switch bindings/auth origin using the reviewed live-release candidate, update `apps/web/wrangler.json`, resource-targeting package scripts and current documentation, and regenerate Worker types if bindings change. Verify exact DB schema/row counts/integrity, R2 object keys/metadata/content hashes, unchanged release assets, Google auth, private-media access and Workflow binding. Any tests creating product records must be scoped and authorized as part of the smoke plan. Retain old resources.
6. **Approve production separately.** Repeat only after preview succeeds. Snapshot current settings/version and data again; coordinate production write quiescence/final sync. Separately review the production custom domain and OAuth/connector transition to `hopkit.hiphop.dev`, preserving application secrets and a usable transition origin. Preserve existing application secrets, live flags/allowlists, compatibility settings and observability (including API-only fields).
7. **Finish local names and checkpoint.** Back up/preserve emulator storage before local renaming, update local commands, validate current resource resolution, then use the exact staged-tree commit gate and separate exact-SHA push gate. Old cloud resource deletion is a later explicit cleanup decision.

## Recovery rules

Keep old D1/R2/Workflow resources and before-settings/version evidence until migration verification is accepted. Before reopening writes, recovery can restore the old bindings/name/origins and verified previous version. Once writes reach new storage, switching back alone loses those writes: freeze again and reconcile new data before rollback. Never delete a database or bucket as part of this rename without separate explicit approval.

## Remaining preparation, in order

1. Google project/client and its current preview/production callbacks are identified above; its HopKit preview redirect is absent and the exact additive change is prepared, not applied. Finish connector endpoint inventory and the remaining bucket CORS/notification verification. Preserve the successful target-name and zero-instance checks, refreshing them immediately before mutation. Preview Builds is verified disconnected; production Builds is a later check. No permission or credential changes are authorized implicitly.
2. Finish the settings-only cutover mechanism. The [settings PATCH API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/script_and_version_settings/methods/edit/) accepts binding edits and `inherit`, but this endpoint only accepts `latest` for inheritance. Require active version = latest = `2f5314c4-2f57-4d61-a55d-a9786728e8b5` and an unchanged settings digest immediately before mutation. Preserve the complete deployed code/assets and live settings, including API-only fields. The newer Worker-version GET returned an `assets` field in the private details snapshot; inspect it on resume. Confirm upload/deployment behavior and a usable prior-version rollback before executing; five public artifact hashes alone do not establish complete asset preservation. Never deploy HEAD as a fallback.
3. Establish the request/job freeze and verify the D1 export/import checks. [D1 export](https://developers.cloudflare.com/d1/best-practices/import-export-data/) blocks other database requests while exporting, so defer it to the approved window. Retain schema and migration history, verify integrity and per-table rows/content after import, and stop on unsupported virtual tables; do not remove them. Do not apply migration 0017. Keep exports/manifests private, ignored and timestamped.
4. Assemble the exact create/copy/settings/rename operations and validated recovery path using the preview candidate above, then present the preview mutation review. The complete execution package is **not yet ready or approved**. A live settings experiment or remote R2 session is not authorized by preparation alone.
5. After preview is accepted, propose production separately; then handle the HopKit source/package/UI rename and GitHub/folder follow-ups under their own applicable gates. Preserve local emulator state before changing local resource names. No old cloud resources are to be deleted.
