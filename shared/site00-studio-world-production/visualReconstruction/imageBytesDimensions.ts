/** Client-safe PNG/JPEG dimension read — no pngjs/sharp. */

function readPngDimensions(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 24) throw new Error('IMAGE_DIMENSIONS_PNG_TOO_SMALL');
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i += 1) {
    if (bytes[i] !== sig[i]) throw new Error('IMAGE_DIMENSIONS_PNG_BAD_SIGNATURE');
  }
  const width =
    (bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!;
  const height =
    (bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!;
  return { width, height };
}

function readJpegDimensions(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('IMAGE_DIMENSIONS_JPEG_BAD_SIGNATURE');
  }
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1]!;
    if (marker === 0xd9 || marker === 0xda) break;
    const segmentLen = (bytes[i + 2]! << 8) | bytes[i + 3]!;
    if (segmentLen < 2) throw new Error('IMAGE_DIMENSIONS_JPEG_BAD_SEGMENT');
    const isSof =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;
    if (isSof && i + 8 < bytes.length) {
      const height = (bytes[i + 5]! << 8) | bytes[i + 6]!;
      const width = (bytes[i + 7]! << 8) | bytes[i + 8]!;
      return { width, height };
    }
    i += 2 + segmentLen;
  }
  throw new Error('IMAGE_DIMENSIONS_JPEG_SOF_NOT_FOUND');
}

export function readImageDimensionsFromBytes(bytes: Uint8Array): { width: number; height: number } {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return readPngDimensions(bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return readJpegDimensions(bytes);
  throw new Error('IMAGE_DIMENSIONS_UNSUPPORTED_FORMAT');
}
