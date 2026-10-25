# 02 — Elsewhere feature evidence matrix

Sprint `P0.SITE00.STUDIOWORLD.CHARACTER-STUDIOS-TO-DIRECTOR-COMPOSER.INTEGRATION-AUDIT.V1`. Read-only.

## 1. What could and could not be inspected

| Source | Status | Notes |
| --- | --- | --- |
| `https://elsewherestudiosai.com/` | **Not reachable from this environment** | DNS lookup fails for the domain, with and without `www.`, under the session's network policy. The page was not opened. |
| Instagram reel `De3QxrGg2EV` | **Not reachable** | DNS lookup fails for `www.instagram.com`. The reel was not watched. |
| Founder's screen recording of the reel | **Not available** | No video file is in the workspace or the session uploads. It was not inspected. |
| Search-engine index of the vendor page | Used | Quoted vendor marketing text, via web search on 2026-10-25. The vendor describes its own product; nothing here is independently tested. |
| Founder's observations (sprint §00) | Used, labelled | Recorded as the founder's observations, not as verified features. |

Name collisions found during the search: **Elsewhere AI Studio** (`elsewhereaistudio.com`) and **Elsewhere ◇ Studios** (`elsewherestudios.com`) are different businesses. This matrix concerns `elsewherestudiosai.com` only.

## 2. Evidence by feature

Evidence levels: **VENDOR_PUBLISHED** (text on the vendor's indexed page), **FOUNDER_OBSERVED** (from the founder's review of the reel; not seen by the audit), **NOT_CONFIRMED** (named in the brief, found in neither source).

| Feature | Evidence | What is known | What is not known |
| --- | --- | --- | --- |
| Model Studio / reusable AI models | VENDOR_PUBLISHED | "Train your own brand model once and reuse the same face and look across every campaign." "Total consistency, no re-shoots." | Whether it is fine-tuning (LoRA-like) or a reference set; how many images; whether looks are separate from the face. |
| Echo (reference-to-prompt) | VENDOR_PUBLISHED | "Drop in any inspo image and Echo reads its lighting, mood, and style, then writes the prompt for you." | Whether the user can mark what the image is for (lighting only vs identity); whether extracted fields are editable. |
| Cinematic Video | VENDOR_PUBLISHED | "Turn a single photo into cinematic motion with Elsewhere Motion, Kling, and more." Named models: Elsewhere Motion, Kling 3.0, Seedance 2.5, Seedance 2.0, and others. | Per-model durations and resolutions beyond the free-tier example. |
| UGC Video | VENDOR_PUBLISHED | Creator-style talking videos for brands. | Lip-sync method; voice source. |
| Visible credit costs / plans | VENDOR_PUBLISHED | Credit plans: Free 25 credits ("enough for your first Elsewhere Motion video (5s, 480p)"); paid tiers listed as 120, 350, 800 and 2,000 credits a month (Starter, Creator, Brand, Agency in the indexed text). "Every paid plan runs the full model stack." Managed service "from $150". | Per-job credit prices per model. |
| Storyboard | FOUNDER_OBSERVED | The founder saw a storyboard step in the reel. | Not found on the indexed vendor page. Its structure (frames, ordering, per-shot settings) is unverified. |
| Look controls | FOUNDER_OBSERVED | — | Not found in the vendor text. |
| Shot controls and camera movement | FOUNDER_OBSERVED | — | Not found in the vendor text. |
| Generation-model selection | VENDOR_PUBLISHED (model list) + FOUNDER_OBSERVED (selector) | Multiple named video models. | The selector's behaviour. |
| Duration, resolution, aspect-ratio settings | FOUNDER_OBSERVED (+ one vendor example: 5 s, 480p) | — | The available values. |
| Masterclass (six lessons) | VENDOR_PUBLISHED | Free with paid plans. | — |

## 3. What the evidence supports

The vendor's own words support three workflow principles, and only these are treated as verified in this audit:

1. **Identity is created once and reused.** The user does not re-describe the face and look per campaign.
2. **A reference image becomes direction without the user writing it.** Lighting, mood and style are read from an image.
3. **Cost is visible before generation**, in a single credit currency, across several models.

The storyboard, look, shot and camera controls the founder observed are plausible and consistent with these principles, but this audit has not seen them. Recommendations in 08 and 10 are built on the three verified principles and on the founder's observations, labelled as such. Nothing in this audit copies Elsewhere's visual design, assets or implementation.

## 4. Sources

- Elsewhere Studios — AI Campaign Studio for Brands: <https://elsewherestudiosai.com/> (indexed text via web search; the page itself could not be opened from this environment)
- Name collisions: <https://elsewhereaistudio.com/>, <https://elsewherestudios.com/>
