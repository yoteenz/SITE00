# SITE 00 Visual Reconstruction — P0.VR.1D.11

**Character Lab full-screen reference reconstruction + exact shell copy + FAL asset extraction**

## Reference

- `visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png`
- Artwork crops: `public/visual-references/founder/ndxbook/character-lab-artwork/*.webp`

## Module

| File | Role |
|------|------|
| `p0vr1d11/characterLabMobileVisualShellSpec.ts` | `CharacterLabMobileVisualShellSpec` |
| `p0vr1d11/characterLabScreenImplementationSpec.ts` | Full-screen spec with shell regions |
| `p0vr1d11/characterLabReferenceAssetResolver.ts` | Asset manifest + FAL classification |
| `p0vr1d11/runNdxCharacterLabCorrectionPass.ts` | Live render + overlay QA |

## UI

- `MobileCharacterLabScreen` — reference-fidelity layout (tabs, hero row, identity + sticky note, quote, 4-col performance)
- Reference crops for portrait, language note surface, working draft sticky note
- DOM text overlay on sticky note (avoids FAL text hallucination)

## Tests

```bash
npm test -- tests/visualReconstructionP0VR1D11.test.ts
```
