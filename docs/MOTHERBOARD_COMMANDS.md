# Motherboard commands (quick reference for agents)

When the user says **"add to motherboard"**, **"load motherboard"**, or **"Snapshot codebase to motherboard"** and you don't have context:

- **Where is the motherboard?** It is a **folder** in this repo: **`motherboard/`** (at project root). It is not a single file. There is no file named `MOTHERBOARD.md` at root—use the folder and its existing files only.
- **What to do:**
  - **"add to motherboard"** → Read `motherboard/README.md` and `motherboard/ADDING.md`, then append one new entry to `motherboard/MEMORY.md` per the protocol (summarize the full conversation; do not overwrite existing content). Do not ask the user to specify what to add or where the motherboard is.
  - **"load motherboard"** → Read `motherboard/README.md`, `motherboard/CORE.md`, `motherboard/CODEBASE.md`, `motherboard/MEMORY.md` and use as context.
  - **"Snapshot codebase to motherboard"** → Overwrite `motherboard/CODEBASE.md` with a structured summary of the current codebase (see `motherboard/README.md`).

Do **not** reply that there is no motherboard or ask the user to clarify. The motherboard folder exists; read it and follow the instructions there.
