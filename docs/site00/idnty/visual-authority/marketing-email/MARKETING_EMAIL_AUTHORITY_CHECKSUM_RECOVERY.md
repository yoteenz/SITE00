# Marketing email authority — checksum recovery

Sprint: `P0.SITE00.IDNTY.MARKETING-EMAIL-AUTHORITY-REPOSITORY-RECOVERY3` (continues recovery 1–2)  
Date: 2026-10-10  
Status: **BLOCKED**

The approved reference was not registered. Neither chat attachment matches the expected digest. The module system, design tokens, and campaign mapping stay unwritten until a byte-identical file arrives. Batch I and the C–J credit ceiling are unchanged.

## Expected digest

```
e814042c318f7f45d7db07a6d11e4878fcc20888c583a76537828cfa3c2ede83
```

Canonical path (not created):

`docs/site00/idnty/visual-authority/marketing-email/SITE00_MARKETING_EMAIL_APPROVED_AUTHORITY_V1.jpg`

## Copies received

| Copy | Cache file | Bytes | SHA256 | Pixels |
| --- | --- | --- | --- | --- |
| 1 | `01a127dc-b3c9-774b-9ee0-a4e750ec2bc9.jpg` | 468,306 | `f3c2745f79a79278ab2f24f6f4fc22a78c3818397844bdfc6b4c77c9103a308e` | 1086×1448 |
| 2 | `01a127e5-0ea0-7f4e-bc8f-72cd549124c3.jpg` | 474,703 | `1d431920ffd56552b6eacc58ceaeeaa02faf8ed9ab687ffde3eee104d2945d8d` | 1086×1448 |
| 3 | `01a12819-d6b1-7f76-b803-c088e4947d74.jpg` (named `SITE00_MARKETING_EMAIL_APPROVED_AUTHORITY_V1.jpg` in task) | 474,703 | `1d431920ffd56552b6eacc58ceaeeaa02faf8ed9ab687ffde3eee104d2945d8d` | 1086×1448 |

Copy 3 is **byte-identical** to copy 2 (same SHA256). It is not byte-identical to the expected digest.

A scan of image caches under the agent home, `/tmp/cursor`, `/opt/cursor`, `/home/workdir`, and all JPEGs under `/workspace` (excluding `node_modules` / `dist`) found **0** files with the expected digest. The digest is not in this repository.

## Re-encode evidence

Both copies are baseline JPEG, 4:2:0, JFIF 1.01, 72 dpi. EXIF is a five-tag IFD0 plus a three-tag EXIF sub-IFD that records 1086×1448. There is no software, camera, or date tag.

Copy 1 uses the same luminance quantization table as the committed board `REF-01-P01-P03.jpg` (table sum 378; first eight coefficients `1, 1, 1, 2, 3, 4, 6, 7`). It also carries a Photoshop 3.0 segment. That segment’s caption digest is the MD5 of empty data (`d41d8cd98f00b204e9800998ecf8427e`), not a hash of the approved file. Restart interval is 68. REF-01, which is landscape 1448×1086, uses restart interval 91 and the same quantization table. That is one encoder with a different MCU row width.

Copy 2 was encoded again. Its luminance table sum is 390 (first eight coefficients `1, 1, 1, 2, 3, 5, 6, 7`). The Photoshop segment is gone. The file is 6,397 bytes larger.

Decoded pixels are not identical. **63.6%** of pixels differ. Mean absolute channel delta is **0.98**. Maximum channel delta is **34**. That is a second lossy encode.

Sending the poster through chat again will not preserve `e814042c…`. The attachment path rewrites the JPEG before this agent can read it.

## What stayed unchanged

| Item | Value |
| --- | --- |
| Batch I images | 3 (DF-I01, DF-I02, DF-I03) |
| Batch I base credits | 951 |
| Balanced images | 18 |
| Balanced hard ceiling | **6,340** credits |
| Founder budget approval | PENDING |
| OpenArt credits spent this sprint | 0 |
| Merge / deploy | not done |

## How to resupply the original bytes

Put the original file where bytes are stored as-is: a git commit, or a GitHub release asset inside a zip. Quote the SHA256 in the sprint. Do not send another chat JPEG of the poster.
