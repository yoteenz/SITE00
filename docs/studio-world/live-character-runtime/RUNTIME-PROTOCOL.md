# Runtime Command Protocol (v1)

Transport-agnostic JSON over WebSocket (local) or future TLS channel (cloud).

## Command envelope

```json
{
  "protocolVersion": 1,
  "requestId": "uuid",
  "characterId": "subject-woman",
  "assemblyVersion": "2.2-draft",
  "manifestHash": "mf-a1b2c3d4",
  "command": "APPLY_ASSEMBLY",
  "payload": {},
  "timestamp": "ISO-8601"
}
```

## Commands (prototype subset)

`LOAD_CHARACTER`, `APPLY_ASSEMBLY`, `SET_HAIR`, `SET_WARDROBE`, `SET_CAMERA`, `CAPTURE_FRAME`, `RUN_TEST`

## Response

Statuses: `ACK`, `APPLIED`, `REJECTED`, `ERROR`, `CAPTURE_READY`, `TEST_COMPLETE`

Required ACK fields:

- `requestId`
- `runtimeCharacterId`
- `appliedAssemblyVersion`
- `runtimeStateHash` (when practical)
- **`mock`** — `true` only for `MockCharacterRuntimeAdapter`; Unreal must send `false`

## Implementation

- `shared/studio-world-live-character-runtime/protocol.ts`
- `UnrealCharacterRuntimeAdapter` — real WebSocket client, fails offline
- `MockCharacterRuntimeAdapter` — dev only, always `mock: true`
