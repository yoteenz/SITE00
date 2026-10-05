# Runtime Host Model

## Prototype host

`StudioWorldRuntimeHost-LOCAL` — founder Windows PC running Unreal 5.8.2.

Registration type: `RuntimeHostRegistration` (`runtimeHost.ts`)

Fields: `runtimeHostId`, `runtimeType`, `engineVersion`, `capabilities`, `connectionState`, `lastSeen`, `activeCharacterId`, `activeAssemblyVersion`, `signallingUrl`

## States

`OFFLINE` | `BOOTING` | `READY` | `BUSY` | `STREAMING` | `CAPTURING` | `IDLE` | `SHUTTING_DOWN` | `ERROR`

## SITE00 behavior

| Unreal | Viewport |
|--------|----------|
| Running + synced | LIVE + stream |
| Off / unreachable | OFFLINE → **STATIC_AUTHORITY** fallback |
| Version mismatch | OUT OF SYNC banner |

SITE00 core workflows remain usable offline; only live render/simulation/live capture require the host.

## Future hosts

Same `CharacterRuntimeAdapter` interface for `CLOUD_GPU` hosts — do not hard-code localhost in fabrication UI (use env + host registry).
