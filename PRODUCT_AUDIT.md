# Product audit — 2026-10-03

**Status: closed at the user's request.** After the correction pass, the user skipped the remaining product audit, then deferred comparison grouping and ratings sorting too. Keep completed updates and historical findings below; none of their suggested follow-up work is in the immediate queue. Resume only if explicitly requested.

## Correction pass — 2026-10-03

The user requested the next task: fill missing photos and Offers. Applied 18 photo updates to existing Products and created six Offers on existing Candidates. All 24 writes returned succeeded and were read back successfully. No duplicate Items/Candidates were imported, no planning status changed, and no grouping occurred.

- Photos: **195 of 201 Products now have photo URLs; six remain missing**, all discontinued SKLUM references with uncertain exact colours/finishes. Their sources returned empty Product metadata and a malformed placeholder image; those were rejected.
- Offers: all 201 Products now have an Offer. The two MUJI Offers have exact prices (€89.95 coat stand, €139 bedside table) and retailer-reported online stock. The three Yumeko Offers retain starting prices (€109.95 / €229 / €229) with size-specific price/stock unknown. Glasgow has its direct size-filtered source, with exact selected-variant price/stock left unknown. This leaves 105 Offers without unit prices, including the 104 pre-existing gaps.
- Verified every new photo URL responds HTTP 200 with an image content type and every saved photo/Offer matches the intended update. The MUJI coat-stand photo also loaded in the production browser, alongside its sourced Offer. Screenshot: .tmp/product-photo-offer-proof.png (untracked verification artifact; do not stage it with documentation).
- IKEA article codes and HEMA product pages identify the saved variants. HOOMstyle Noa's manufacturer photo was matched to EAN 8720955642378 (sand/taupe, pleated heading tape); preserved the existing Praxis Offer. Jaloezieen's image is explicitly labelled a product-family reference because colour/dimensions remain unselected.
- Created Merchant MUJI (52d6221f-d604-4f6a-8734-4b9fb2246642) for the two MUJI Offers. A pre-existing unused MUJI Europe Merchant was subsequently visible in the browser selector; both are retained. No merchant removal/merge was attempted. Yumeko and Beter Bed reuse their existing Merchants.
- Existing descriptions keep their historical observations; newer checked facts are recorded on the new Offers. Shipping stays unknown where only a minimum charge or checkout-dependent quote is available.

Remaining missing photos:

- Beni mango wood coffee table
- Beni mango wood side table
- Kover 3-seat corduroy velvet sofa
- Ural mango wood TV unit
- Bren velvet and steel dining chair
- Ural extendable mango wood dining table

Next requested task: finish the IKEA Remaining Details price/variant gaps, then the remaining quotes and reviewed alternative grouping. Archive/reference/replacement decisions for discontinued SKLUM entries remain with the user.

### Completed operation IDs

Do not retry completed writes with new IDs. Every operation below succeeded and was verified.

| Operation | Product | Operation ID |
| --- | --- | --- |
| Photo | IKEA ÄNGSFRYLE — beige sheer curtain, 300×300 cm | 7c5bb59c-90ff-4e6c-8fe1-1db6474c6d00 |
| Photo | IKEA SILVERLÖNN — beige cotton sheer curtains, 1 pair | 54f7988c-5679-49ce-8bd4-18cf41d715c9 |
| Photo | HEMA — ready-made ecru cotton curtain with heading tape | b77bdc3c-0d1b-4e3c-b608-f8d6cfcba4bd |
| Photo | IKEA DYTÅG — white linen curtains, 1 pair | ddfe9cac-663a-41b5-8ca9-088b8ecfe406 |
| Photo | IKEA VILBORG — beige room-darkening curtains | 5971868b-8caa-459e-b94d-a1ad1b091f42 |
| Photo | IKEA VECKLARFLY — natural bamboo Venetian blind | 6df1d215-7a4b-444d-a68b-658ee916c584 |
| Photo | HEMA Hotel cotton percale fitted sheet — beige, 160 × 200 cm | afae22ab-ddee-4e15-96a1-95da163d77a8 |
| Photo | IKEA SOLFIBBLA duvet cover set — beige/white stripes, 240 × 220 cm | 2498d0a0-ba51-4bef-b375-eed9d499cd77 |
| Photo | IKEA ÄNGSLILJA duvet cover set — naturel, 240 × 220 cm | 12cfb8ea-15a3-48b4-964b-91728042e994 |
| Photo | IKEA DVALA fitted sheet — beige, 160 × 200 cm | f2613099-e6b4-48c3-912a-85fe70b1f9e5 |
| Photo | HEMA Hotel cotton percale duvet cover set — white, 240 × 200/220 cm | 0a0d39bd-6fe5-4943-bbdd-34f6de81a196 |
| Photo | MUJI Oak Bedside Table — 37 × 37 × 44 cm | 5ed087bc-0c35-4ffc-9fc3-5ec5439753af |
| Photo | HEMA Elst — ecru inbetween, made to measure | eff7e67b-32c7-4061-a994-9f54cf51094d |
| Photo | bonprix — white/green floral textured curtain | f6c63a78-8f3d-48b2-953f-9b3fe885241f |
| Photo | Jaloezieen.nl — made-to-measure 35 mm bamboo blind | f1add15f-5773-4e13-9103-ad0adb3fd902 |
| Photo | Karwei / vtwonen Frost — white semi-transparent curtain | ad40dd5b-fbf8-4c7a-9203-5c0e9c4c4c1e |
| Photo | MUJI Beech Wood Coat Stand — 48 × 42 × 173.5 cm | 50681e03-3277-49c0-8fb2-d35843785bb0 |
| Photo | Praxis / HOOMstyle Noa — sand inbetween with hooks | 24da7c11-8098-4aa6-b00c-4ae32f6c87a0 |
| Offer | MUJI Beech Wood Coat Stand — 48 × 42 × 173.5 cm | 2d2c81c4-2565-4bc0-a5c6-a5ec5c5f8cc2 |
| Offer | MUJI Oak Bedside Table — 37 × 37 × 44 cm | 99bc1f1f-ebb1-4a73-b370-da493707fe60 |
| Offer | Yumeko cotton percale duvet cover set — White Sand | 2a3a77f9-d531-48d6-9505-81ab1ffe47b3 |
| Offer | Yumeko washed linen duvet cover set — Misty Green | 0085322d-2b39-4196-aca7-5a2e44a27ed4 |
| Offer | Yumeko washed linen duvet cover set — Natural | a3375a03-b516-4f48-95e6-452b0aae6408 |
| Offer | Maxi Glasgow bed frame — 180 × 200 cm, balkeneiken | 119f83c9-ab3e-4860-b9de-83fd11ad5b90 |


## Original audit snapshot (before corrections)

Read-only production saved-data audit of all nine collections in the existing home workspace. The user confirmed importing was finished and requested a fast pass. No product mutations, imports, grouping, retailer refreshes or deployment occurred.

## Coverage and limits

203 active Items; 201 Candidates referencing 201 distinct Products; 195 Offers. All candidate pages were read completely (no remaining pages). Two Flooring & DIY needs have no Candidates. Large collection exports exceeded connector limits; individual comparison reads supplied complete product/image fields. Rate limits were respected between batches.

This checks saved-field presence and syntax, not live retailer accuracy, image loading, image/variant visual matches, URL responses, or current prices/stock. Offer checked dates range from 2026-09-08 to 2026-09-26 (7–25 days old today). Connector freshness labels were not treated as proof of current accuracy.

## Completeness

| Collection | Items | Products | Missing photo URL | Offers without price |
| --- | ---: | ---: | ---: | ---: |
| Living Room | 19 | 19 | 4 | 11 |
| IKEA — Remaining Details | 34 | 34 | 0 | 33 |
| Flooring & DIY | 2 | 0 | 0 | 0 |
| Balcony & Plants | 12 | 12 | 0 | 9 |
| Lighting & Textiles | 56 | 56 | 11 | 27 |
| Entrance & Storage | 17 | 17 | 1 | 8 |
| Home Office | 5 | 5 | 0 | 1 |
| Kitchen & Dining | 14 | 14 | 2 | 2 |
| Bedroom | 44 | 44 | 6 | 13 |

- Photo URLs: 177 present, 24 missing. Blank photos are not an upload-field limitation: comparison reads expose saved image URLs.
- Prices: 88 exact and 3 starting prices; 104 Offers have no unit price. Another 6 Products have no Offer, so 110 Products have no saved price quote.
- Sources: all 195 Offer URLs have valid HTTP(S) syntax; 0 are merchant-root URLs rather than product pages. No duplicate normalized Offer URLs were found. Live links were not checked.
- Brand: present on all 201 Products. Merchant: present on all 195 Offers.
- Shipping: unknown for 194 of 195 Offers. Stock: unknown for 163; 15 saved as unavailable, 17 as available. These are saved observations, not live verification.
- Ratings and review counts: 14 Products have both saved attributes. Sorting remains a separate optional task.
- Every Item with Candidates currently has one Candidate, so alternatives remain separate Items. Grouping needs a reviewed mapping; no records were moved.

## First fixes, in order

1. Fill the 24 missing photos and 6 missing Offers with verified product/variant sources. Preserve valid existing fields.
2. Finish the IKEA Remaining Details collection: 33 of 34 Offers lack price; names/variants still need fuller review.
3. Fill remaining price gaps; refresh old quotes and check shipping/stock when shortlisting. Preserve unavailable products as references until the user decides whether to replace them.
4. Propose grouping alternatives under shared needs before modifying records. Optional numeric ratings/review sorting comes afterward.

## Missing photos

- Beni mango wood coffee table
- Beni mango wood side table
- Kover 3-seat corduroy velvet sofa
- Ural mango wood TV unit
- MUJI Beech Wood Coat Stand — 48 × 42 × 173.5 cm
- Bren velvet and steel dining chair
- Ural extendable mango wood dining table
- HEMA Elst — ecru inbetween, made to measure
- Praxis / HOOMstyle Noa — sand inbetween with hooks
- Karwei / vtwonen Frost — white semi-transparent curtain
- IKEA ÄNGSFRYLE — beige sheer curtain, 300×300 cm
- IKEA SILVERLÖNN — beige cotton sheer curtains, 1 pair
- HEMA — ready-made ecru cotton curtain with heading tape
- IKEA DYTÅG — white linen curtains, 1 pair
- IKEA VILBORG — beige room-darkening curtains
- bonprix — white/green floral textured curtain
- IKEA VECKLARFLY — natural bamboo Venetian blind
- Jaloezieen.nl — made-to-measure 35 mm bamboo blind
- HEMA Hotel cotton percale fitted sheet — beige, 160 × 200 cm
- IKEA SOLFIBBLA duvet cover set — beige/white stripes, 240 × 220 cm
- IKEA ÄNGSLILJA duvet cover set — naturel, 240 × 220 cm
- IKEA DVALA fitted sheet — beige, 160 × 200 cm
- HEMA Hotel cotton percale duvet cover set — white, 240 × 200/220 cm
- MUJI Oak Bedside Table — 37 × 37 × 44 cm

## Products without an Offer

- MUJI Beech Wood Coat Stand — 48 × 42 × 173.5 cm
- MUJI Oak Bedside Table — 37 × 37 × 44 cm
- Yumeko cotton percale duvet cover set — White Sand
- Yumeko washed linen duvet cover set — Misty Green
- Yumeko washed linen duvet cover set — Natural
- Glasgow bed frame — balkeneiken, 180 × 200 cm

## Saved unavailable products

- Beni mango wood coffee table
- Beni mango wood side table
- Kover 3-seat corduroy velvet sofa
- Ural mango wood TV unit
- Lauso standing coat rack
- Kerk bamboo coat rack with shoe rack
- Bren velvet and steel dining chair
- Ural extendable mango wood dining table
- Vries jute pendant lamp
- Kirwen cotton cushion 45 × 45 cm
- Mariselina mango wood bed — natural, 180 × 200 cm
- Abrams nightstand 50 × 35 cm
- Balary mango wood nightstand 50 × 35 cm
- Mariselina mango wood bed
- Mariselina mango wood bed

Repeated Mariselina names are separate entries; title similarity alone does not prove a duplicate or justify deleting variants.
