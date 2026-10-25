# 10 — Reference-to-direction capability audit

The sprint asks whether a founder reference (image, frame, moodboard, fashion photograph, scene, camera or lighting example) can become direction without changing identity or location. Elsewhere describes a feature (Echo) that reads lighting, mood and style from an image and writes the prompt. That description is vendor-published and was not tested here (deliverable 02).

## 1. What exists

| Capability | Evidence | What it does | Class |
| --- | --- | --- | --- |
| Reference roles (CAST NDX) | `shared/site00-studio-world-production/characterVisualCasting/*` | FULL_LOOK, FACE, HAIR, WARDROBE, FACE_CLOSEUP, FULL_BODY, SIDE, BACK roles on founder uploads; identity, wardrobe and environment locks | IMPLEMENTED_NOT_RUNTIME_VERIFIED (NDXBOOK) |
| Authority-first reference binding (gateway) | `shared/site00-production-guardrails/providerGateway/runProductionProviderRequest.ts`; `tests/referenceBindingGuard.test.ts` | Refuses a job whose references are not bound to an authority | PARTIALLY_IMPLEMENTED (2 of 209 call sites) |
| Reference manifest with content hashes (Kling 4 branch) | PR #1683, `cursor/ndxbook-kling4-cinematic-pipeline-8aec` | START_FRAME and END_FRAME roles, hashed manifest | SCHEMA_OR_INTERFACE_ONLY |
| Spatial authority and lighting states (THE EXCHANGE) | `directorial/spatial.ts` validateSpatialAuthority; S1-01 `LS-GOLDEN` | Room geography, landmarks and named lighting states the shot must keep | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Keyframe specs (THE EXCHANGE) | `KEYFRAME_MANIFEST_V1.json` spec fields | Character placement, expression, wardrobe, lighting, architecture per frame; `derivesFrom` chains | IMPLEMENTED_NOT_RUNTIME_VERIFIED |
| Multi-reference image route | `directorial/routing.ts` OA-NBP-I2I-2K | Up to 14 references per image job, **with no purpose per reference** | SCHEMA_OR_INTERFACE_ONLY (execution) |
| Vision reading of images | `api/_lib/site00GrokDesignBench/grokVisionProvider.ts:407`; `api/_lib/site00OpusNative/config.ts:32` | Image analysis for the design bench and page replication | IMPLEMENTED (other domains) |
| Image to direction fields | — | — | NOT_FOUND |

**Conclusion.**
- The repository can describe what a reference is for (NDXBOOK only), and it can read images (other domains).
- It cannot turn a reference into shot direction, and its main multi-reference route does not record purpose.
- The first gap is purpose (G-REF-01, P1). Extraction (G-REF-02) is P2.

## 2. Purpose types and binding rules

| Purpose | May shape | Must never change | Typical source |
| --- | --- | --- | --- |
| IDENTITY_REFERENCE | Face, body, hair texture, skin tone, distinctive details | — (it is the authority) | Approved actor views only |
| WARDROBE_AUTHORITY | Garments, jewelry, accessories, footwear, nails | Face; body proportions | Approved Look items |
| ENVIRONMENT_AUTHORITY | Architecture, set layout, landmarks, props in place | The fictional location's identity, or the cast | Approved set and environment keyframes |
| STYLE_REFERENCE | Palette, grade, atmosphere, texture, mood | Identity, wardrobe, location | Moodboards, photographs |
| CAMERA_REFERENCE | Framing, angle, height, lens character, depth of field, movement | Identity, wardrobe, location | Film frames, camera examples |
| PERFORMANCE_REFERENCE | Pose, gesture, expression energy, timing | Identity, wardrobe | Clips, frames |

**Enforcement.**
- Each job input carries one purpose.
- Only IDENTITY_REFERENCE inputs may fill identity slots (for example the start frame's subject or an image-to-image face reference).
- A STYLE_REFERENCE or CAMERA_REFERENCE is passed as text direction or as a secondary reference, never as the identity source.
- A reference cannot change the scene's set: the environment comes from ENVIRONMENT_AUTHORITY or the approved environment keyframe.

**Every reference record keeps:**
- source (URL or file and who supplied it);
- hash;
- purpose;
- founder approval;
- the jobs that used it.

## 3. Extraction targets

The S1-01 shot record already has fields for most extraction targets. Extraction should fill them, not add new ones.

| Sprint §10 target | Existing shot or keyframe field |
| --- | --- |
| Composition | `composition` |
| Framing | `framing` |
| Camera angle | `cameraAngle` |
| Camera height | `cameraHeight` |
| Lens character | `lensIntent`, `focalLength` |
| Lighting direction | `lighting` (named lighting state) |
| Colour palette | none: add to the lighting state |
| Atmosphere | none: add to the lighting state or treatment |
| Material textures | keyframe `spec.architecture` (partly) |
| Subject placement | keyframe `spec.characterPlacement` |
| Depth of field | `depthOfField` |
| Movement implications | `cameraMovement`, `movementSpeed`, `cameraDirection` |
| Production design cues | `landmarks`, keyframe `spec.architecture` |

## 4. Recommendation

1. **Purpose first (G-REF-01).** Add purpose to job inputs and to the reference tray in the inspector (deliverable 08 U-04). No image analysis needed.
2. **Then extraction (G-REF-02).**
   - Reuse an existing vision path behind the provider gateway rather than adding a service.
   - Show extracted values as editable suggestions on the shot, each tagged with the reference it came from.
   - The founder accepts each one. Nothing writes to identity fields.
3. **Approval.** The founder decides which vision provider may see unreleased material.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| R-01 | Purpose on every reference and job input | Director Composer | G-SCENE-01 | A STYLE_REFERENCE in an identity slot is refused; each job lists inputs by purpose |
| R-02 | Reference record with source, hash, purpose, approval and usage | Production Asset Registry | G-DATA-01 | A reference shows every job that used it |
| R-03 | Suggest-only extraction into existing shot fields | Director Composer | R-01, founder provider choice | For three founder references, suggestions appear with their source; none changes identity, wardrobe or set |
