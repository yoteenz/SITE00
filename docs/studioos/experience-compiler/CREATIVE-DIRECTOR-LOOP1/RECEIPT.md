# P0.STUDIOOS.EXPERIENCE-COMPILER.CGPT-CREATIVE-DIRECTOR-LOOP1

Sprint receipt · Architecture + workspace · No fake model outputs · No production deploy.

## Workspace route

`/studio/site00/experience-compiler?tab=creative`

## API

`/api/site00/experience-compiler-creative-director?action=...`

## Proofs

- Desktop markup: `proof-desktop-markup.html` (vitest-generated shell, no fabricated territories)
- Tests: `src/studioos/experience-compiler/__tests__/creativeDirectorLoop.test.ts`

## Runtime

Live OpenAI calls require server `OPENAI_API_KEY`. Vitest forces `MODEL_RUNTIME_BLOCKED`.
