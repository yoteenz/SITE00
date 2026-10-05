# Local Unreal Setup — StudioWorldCharacterRuntime (UE 5.8.2)

**Target host:** Founder Windows PC (`StudioWorldRuntimeHost-LOCAL`)  
**Cloud agent VM:** does **not** have access to this machine — follow this doc locally.

## Prerequisites (verify on Windows)

| Component | Prototype | Notes |
|-----------|-----------|-------|
| Unreal Engine 5.8.2 | REQUIRED | Founder-confirmed installed |
| Metahuman Creator Core Data | REQUIRED | Install via Epic Launcher → MetaHuman |
| MetaHuman Creator Plugin | REQUIRED | Enable in UE 5.8 project, restart editor |
| MetaHuman character asset | REQUIRED | One neutral prototype Metahuman |
| Pixel Streaming / PS2 | REQUIRED | Enable plugin for UE 5.8.2 |
| MetaHuman Animator | OPTIONAL | Not needed for appearance swap prototype |
| MetaHuman Live Link | OPTIONAL | |
| Chaos Cloth | OPTIONAL | Garment drape later |

Classification until verified locally: **UNKNOWN / REQUIRES LOCAL VERIFICATION**.

## 1. Create project

1. Epic Launcher → Unreal 5.8.2 → New **Blank** or **Film/Video** project.
2. Name: `StudioWorldCharacterRuntime`
3. Location: e.g. `D:\StudioWorld\Unreal\StudioWorldCharacterRuntime`

## 2. Enable plugins

Edit → Plugins → enable and restart when prompted:

- **MetaHuman Creator**
- **MetaHuman Core Tech** (if listed)
- **Pixel Streaming** (or **Pixel Streaming 2** if that is the 5.8 default in your build)

Document exact plugin names as shown in your 5.8.2 install.

## 3. Import / create prototype Metahuman

1. MetaHuman Creator → export neutral test character (likeness perfection **not** required for transport proof).
2. Import into project; note asset path.
3. Assign to default pawn or level actor `BP_StudioWorldCharacter`.

## 4. Testing ground level

Minimal map:

- Neutral floor + backdrop (not full Studio World environment)
- One `BP_StudioWorldCharacter`
- `BP_CameraRig` with presets (see CAPTURE-RIG.md)
- Directional + fill light rig

## 5. Command channel (companion to Pixel Streaming)

Implement a **WebSocket server** on localhost (suggested port **8888**) that:

- Accepts JSON `RuntimeCommand` (see RUNTIME-PROTOCOL.md)
- Returns JSON `RuntimeResponse` with **`mock: false`**
- Handles at minimum: `LOAD_CHARACTER`, `APPLY_ASSEMBLY`, `SET_HAIR` or `SET_WARDROBE`, `SET_CAMERA`, `CAPTURE_FRAME`

SITE00 env: `VITE_SITE00_UNREAL_COMMAND_WS=ws://127.0.0.1:8888`

## 6. Pixel Streaming

Follow Epic UE 5.8 Pixel Streaming docs:

1. Package or run **Play In Editor** with `-PixelStreamingURL=...`
2. Start signalling server (Epic sample or PS2 infrastructure)
3. Browser opens stream URL (typically localhost, e.g. port **80** or **8888** depending on config)

**Do not** port-forward to the public internet for prototype.

## 7. Verify connectivity

1. Start Unreal + signalling.
2. Open SITE00 with `?liveRuntime=1` (no `runtimeMock`).
3. Badge must **not** show CONNECTED unless WebSocket + stream succeed.
4. Send `LOAD_CHARACTER`; verify ACK `requestId` matches and `mock: false`.

## 8. First live mutation

1. `SET_HAIR` or wardrobe variant A → verify in stream.
2. `SET_HAIR` variant B → **same** `runtimeCharacterId`, new appearance.

## 9. First capture

1. `SET_CAMERA` → `FRONT_FULL_BODY`
2. `CAPTURE_FRAME` → PNG readback → return in response payload
3. SITE00 stores `CharacterCaptureRecord` with lineage fields populated

## 10. Shutdown

Stop Pixel Streaming, close Unreal, stop signalling — no 24/7 GPU requirement.
