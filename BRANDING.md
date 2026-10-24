# HopKit Branding

- Decision: **HopKit** confirmed on 2026-10-18, replacing WantKit. The intended direction covers shopping, food planning and travel, connected to AI.
- Production origin: `https://hopkit.hiphop.dev` is live after the approved domain-only cutover on 2026-10-23. The existing Worker/data and old hostname are retained; see [`HOPKIT_DOMAIN_RELEASE.md`](./HOPKIT_DOMAIN_RELEASE.md). Google consent app name is now **HopKit**. Website branding is implemented locally for the combined release and is not deployed yet.
- Deferred resource-rename target: `https://hopkit-preview.formahsa.workers.dev`; existing preview remains `https://kharidyar-preview.formahsa.workers.dev`.
- Current branding: **HopKit** in UI and English copy, **هاپ‌کیت** in previously transliterated Persian prose, with an H mark in the existing green tile. Package descriptions, auth/assistant display labels and download filenames use HopKit. Technical package/type identifiers remain stable during this visible-branding change.

## Current checkpoint — 2026-10-23

**Follow-up, 2026-10-24:** combined source review and General/Home browser checks
are complete. The full 387-test gate and both build/dry-runs pass; eight R2 helper
tests also pass. Combined files are staged for exact approval; no commit, push,
deployment or folder rename. [HOPKIT_COMBINED_HANDOFF.md](./HOPKIT_COMBINED_HANDOFF.md)
supersedes the older next steps below. Cloudflare API reads on October 23 found
zero Builds triggers on both existing Workers; recheck before any push.

The user chose to finish branding **in this folder and push all work together**,
then rename the folder to `/Users/reza/Documents/web/hopkit` at the end. Keep the
current folder until that combined-work checkpoint; no alternate source copy or
standalone branding deployment is approved by this choice. Exact commit and push
approval gates still apply. No staging, commit, push or folder move occurred.

- Changed app title/metadata, `BrandMark` and new `public/hopkit-mark.svg`; English
  and Persian catalogs; Better Auth display name; MCP display title/notices and
  fallback connector name; local runner prompts; exported context filenames;
  fixture branding and package display descriptions. Retained the old SVG asset
  for cached clients. No layout, color system or product-capability change.
- Preserved package namespaces, auth types, `wantkit` MCP server identifier/scopes,
  owner metadata, routes, cookies/session settings, and locale/theme/invitation
  storage keys. Existing integrations and preferences need no additional identity
  migration for this branding. The earlier domain cutover still requires assistant
  reconnection; branding does not undo that requirement.
- Google Console saved **App name = HopKit** in project `kharidyar`; the same
  credentials, four callbacks, three authorized domains, contacts and Testing
  status remain. No logo upload, new consent, verification submission, Google
  project/client replacement or publishing-status change.
- Validation: TypeScript, lint, current-tree production build, whitespace checks
  and **146 focused tests** pass: 38 UI/preferences/navigation, 5 localization,
  15 auth/context/research, 81 MCP and 7 local-runner tests. Updated the existing
  export assertion to expect `hopkit-context-*`. Build retains the known Zod
  annotation and bundle-size warnings. No full combined release approval is
  implied by these focused checks.
- Browser verified the built English dark/System and Persian light/RTL public
  views. Local static preview: `http://127.0.0.1:5187/about`, with a signed-out
  session stub and no live API. Screenshots/logs are ignored under
  `.tmp/hopkit-branding-*`. The server command is
  `python3 .tmp/hopkit-branding-preview.py`; no production data is served.
- An initial baseline-only patch was superseded by the user's current-folder
  choice before any source copy/build/deployment. Its patch and manifest are
  retained only as ignored `.tmp/superseded-HOPKIT_BRANDING*` evidence; never
  release that obsolete snapshot. The current source includes the final fixes.

Next: finish the other current-folder work, review the exact combined staged tree
and commit, separately approve the exact push/release, then perform the requested
folder rename. General/Home/Delivery and migration 0017 still need their combined
release checks. Cloudflare resource migration remains deferred and preview-first.

## Rename progress

The earlier WantKit source rename covers package manifests, imports, scripts, lockfile, product documentation, development fixture emails and internal auth types. Locale preferences currently use `wantkit.locale` with a read fallback for `kharidyar.locale`. The later HopKit source change must preserve both historical preferences when introducing `hopkit.locale`.

Progress and next steps:

1. **Source checkpoint pushed by the user:** `bfcdcec3efc81fd9d387e38b73e8fb1fa7e5113a` includes the remaining rename and General/Home work. TypeScript, lint and 348 tests passed for the source rename; a rename production build remains pending approval. The General/Home release still requires Generalization task 3 and its preview-first release gate.
2. **GitHub rename complete, verified 2026-10-12.** `origin` is `https://github.com/ramyareye/wantkit.git`; local and remote `main` match the checkpoint above. No `.github` workflows are present. Preview Cloudflare Builds was verified disconnected in the dashboard on October 18; production integration remains unverified because the existing Wrangler login returns 403 for that API. Keep the user's default GitHub CLI account `rezababaeicelebratix`; personal repository administration can use the `ramyareye` browser login.
3. **Local folder and Codex project verified:** `/Users/reza/Documents/web/wantkit`. The previous folder no longer exists. Continue in this checkout.
4. **HopKit preparation resumed, 2026-10-18:** see [`CLOUDFLARE_RENAME.md`](./CLOUDFLARE_RENAME.md). Targets now use `hopkit`; full resource migration remains preview first, production separately. The deployed preview version is unchanged. A metadata-preserving R2 copy helper and local tests are prepared; Preview Builds is verified disconnected. OAuth, remaining bucket-policy checks, write-freeze and code/assets-preserving cutover checks remain prerequisites. The user paused preparation before identifying the Google OAuth project/client. Active configuration continues to target existing resources; no live migration has run.
5. **Visible branding implemented locally, 2026-10-23:** see the checkpoint above. The user chose a combined push with the other current-folder work. Internal package/type/storage/protocol identifiers remain stable; any later internal rename is a separate compatibility change. The requested local folder rename is the final follow-up. Keep the default GitHub CLI account and do not deploy current HEAD as an infrastructure-only rename.

Historical release evidence, former URLs and local paths remain accurate to the events they describe. Ignored credentials and build/test artifacts are not renamed by this source change.

References: [GitHub repository rename behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository), [Cloudflare Wrangler resource configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Historical shortlist — 2026-09-01

The notes below record earlier naming research. The HopKit decision above supersedes these recommendations; domain-availability claims are historical.

### WantKit — international direction

- Public brand: **WantKit**
- First domain to consider: **wantkit.com**
- Additional domains to consider: **wantkit.app** and **wantkit.io**

Why it works:

- It is short, easy to say, and understandable internationally.
- A themed Collection can naturally be presented as a kit: “New Apartment Kit,” “Running Kit,” or “Summer Wardrobe Kit.”
- It fits shared lists, product research, comparisons, and future AI features without making the product sound like a shop.
- It feels more modern and extensible than BuyBuddy.

The product owner reported all three domains as apparently unregistered on 2026-09-01. This has not been independently confirmed in this document; availability, prior use, and trademark conflicts must be checked again immediately before registration.

### Kiesmaatje — Dutch direction

- Public brand: **Kiesmaatje**
- Preferred domain: **kiesmaatje.nl**
- Suggested tagline: **Samen slimmer kiezen.**

`Kiesmaatje` fits the product better than a literal translation of “BuyBuddy.” The product helps people collect ideas, research options, compare offers, collaborate, and make decisions; it is not itself a shop.

SIDN reported `kiesmaatje.nl` as free when checked on 2026-09-01. Availability can change at any time and must be confirmed immediately before registration.

### Directional choice

- Prefer **WantKit** for an international, English-friendly product with `.com`, `.app`, or `.io` positioning.
- Prefer **Kiesmaatje** for a Netherlands-first identity and a distinctly Dutch public brand.

At the time of this shortlist, neither name was final.

## Other Dutch alternatives considered

| Name | Domain status on 2026-09-01 | Assessment |
| --- | --- | --- |
| Koopmaatje | `koopmaatje.nl` reported free | The closest Dutch translation of “BuyBuddy,” but the domain previously hosted an indexed affiliate site and may carry old search history. |
| Koopgenoot | `koopgenoot.nl` reported free | Distinct and collaborative, but less natural in everyday Dutch. |
| Wenskompas | `wenskompas.nl` reported free | Warm and suitable for visual concepts and wish planning, but less clearly related to purchasing and already used as the name of an arts project. |
| Koopplanner | `koopplanner.nl` reported free | Accurate but functional rather than memorable or friendly. |

## Names not recommended

- **BuyBody** has an unintended body-purchasing meaning in English.
- **BuyBuddy** is already used by multiple international shopping products. SIDN reported `buybuddy.nl` in quarantine rather than freely available on 2026-09-01.
- `winkelmaatje.nl`, `koopkompas.nl`, `kiesmaat.nl`, `samenkiezen.nl`, `koopplan.nl`, `keuzemaatje.nl`, `winkelkompas.nl`, `kieswijzer.nl`, `goedgekozen.nl`, and `kiesgoed.nl` were already registered when checked.

## Implementation boundary

HopKit branding is implemented in the existing checkout and saved as the Google
consent app name. Website deployment is deferred to the combined release.
Package identifiers remain `wantkit`; database, storage, Workflow and Worker
identifiers remain `kharidyar` until their separately reviewed migration.

Before a public launch, perform a formal Benelux trademark and Dutch business-name check. Domain availability alone does not establish trademark clearance.

## Sources

- [SIDN Whois](https://www.sidn.nl/whois)
- [SIDN Whois status and command-line guidance](https://www.sidn.nl/nl-domeinnaam/uitleg-whois)
- [Existing BuyBuddy shopping product](https://buybuddyai.com/)
- [Existing BuyBuddy iOS app](https://apps.apple.com/nl/app/buybuddy/id6463859462)
- [Previously indexed Koopmaatje content](https://www.koopmaatje.nl/l/beste-cadeau-tiener/)
- [Existing Wenskompas arts project](https://www.hotelmariakapel.nl/en/project-2023/7)
