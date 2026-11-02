# JURNL identity forensic recovery

No image generation.

- **V1 forensic:** `forensic_recovery.py` → `JURNL/MANIFEST/IDENTITY_RECOVERY_V1/`
- **V2 canonical QA:** `canonical_extraction_v2.py` → `JURNL/MANIFEST/IDENTITY_RECOVERY_V2/` + updates `RECOVERED_IDENTITY_REGISTRY.json`
- **Review ZIPs:** `package_founder_review_v2.sh`

```bash
pip install pillow numpy
python3 scripts/jurnl/identity-recovery/forensic_recovery.py
python3 scripts/jurnl/identity-recovery/build_provenance_matrix.py
```

Layer extraction algorithm matches `scripts/jurnl/reference-replica/export_assets.py` (`lockup` step).
