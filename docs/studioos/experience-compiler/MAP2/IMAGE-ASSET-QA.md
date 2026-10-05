# Image asset QA

`AssetQAResult` validates dimensions, family, continuity, must include/exclude, transparency, and contamination rules (`crossContaminationCheck`). Composer injection should re-run visual diff QA against Opus slots (future hook).

Preview QA runs on requirements at compile time (`asset_qa_preview` on pipeline slice).
