# JURNL identity forensic recovery

No image generation. Reproduces lockup layer extraction and writes reports under `JURNL/MANIFEST/IDENTITY_RECOVERY_V1/`.

```bash
pip install pillow numpy
python3 scripts/jurnl/identity-recovery/forensic_recovery.py
python3 scripts/jurnl/identity-recovery/build_provenance_matrix.py
```

Layer extraction algorithm matches `scripts/jurnl/reference-replica/export_assets.py` (`lockup` step).
