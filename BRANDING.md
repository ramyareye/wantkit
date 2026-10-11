# WantKit Branding

- Status: **WantKit** confirmed as the project name on 2026-10-12.
- Public origin: `https://wantkit.todoless.dev`.
- Naming: **WantKit** in prose and UI; `wantkit` for the root package and future repository slug; `@wantkit/*` for workspace packages; `WantKitAuth` / `WantKitSession` for internal auth types.

## Rename progress

The local source rename covers package manifests, imports, scripts, lockfile, current product documentation, development fixture emails and internal auth types. The unused original brand mark is removed. Locale preferences now use `wantkit.locale`, with a read fallback for `kharidyar.locale` so existing users retain their language choice.

Remaining steps, in order:

1. Review the locally validated rename together with the existing uncommitted collection-mode work. TypeScript, lint and 348 tests pass; a production build is still pending approval. Builds, commits, pushes and deployments retain their explicit approval gates.
2. **GitHub rename complete, verified 2026-10-12.** The user renamed the repository to `ramyareye/wantkit`; this checkout's `origin` is `https://github.com/ramyareye/wantkit.git`, and its remote `main` resolves to the user's partial checkpoint `d02a166ecb43843989ca2ecb1e0d5aaae7541f9f`. The remaining source/feature files need their follow-up commit and push. GitHub redirects repository links and Git traffic, but callers should use the new URL; published Action references and project-site URLs need separate attention if present. Do not reuse the old repository name. No `.github` workflows were present in this checkout during the local rename; external CI/deployment integrations have not been audited. Keep the user's default GitHub CLI account `rezababaeicelebratix`; personal repository administration can use the `ramyareye` browser login.
3. If desired, rename the local directory only with explicit approval for its exact destination, then update editor/Codex paths. Current working directory remains `/Users/reza/Documents/web/kharidyar`.
4. Treat infrastructure naming as a separate approved migration: Worker names `kharidyar` / `kharidyar-preview`, D1 names `kharidyar-{local,preview,production}`, R2 names `kharidyar-concept-media-{local,preview,production}`, Workflow names `kharidyar-research{,-local,-preview}`, and the preview `workers.dev` origin. Inventory bindings, stored data, secrets, OAuth redirects, connector URLs and deployment integrations before changing them. A source replacement is not a resource migration. Existing configuration and resource-targeting commands retain their current names.

Historical release evidence, former URLs and local paths remain accurate to the events they describe. Ignored credentials and build/test artifacts are not renamed by this source change.

References: [GitHub repository rename behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository), [Cloudflare Wrangler resource configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Historical shortlist — 2026-09-01

The notes below record the earlier naming research. The WantKit decision above supersedes the provisional recommendations; domain-availability claims are historical.

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

WantKit is now the chosen brand and package namespace. Existing database, storage, Workflow and Worker identifiers remain `kharidyar` until a separately approved infrastructure migration, as described above.

Before a public launch, perform a formal Benelux trademark and Dutch business-name check. Domain availability alone does not establish trademark clearance.

## Sources

- [SIDN Whois](https://www.sidn.nl/whois)
- [SIDN Whois status and command-line guidance](https://www.sidn.nl/nl-domeinnaam/uitleg-whois)
- [Existing BuyBuddy shopping product](https://buybuddyai.com/)
- [Existing BuyBuddy iOS app](https://apps.apple.com/nl/app/buybuddy/id6463859462)
- [Previously indexed Koopmaatje content](https://www.koopmaatje.nl/l/beste-cadeau-tiener/)
- [Existing Wenskompas arts project](https://www.hotelmariakapel.nl/en/project-2023/7)
