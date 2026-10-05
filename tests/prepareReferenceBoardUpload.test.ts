import { describe, expect, it } from 'vitest';
import {
  isLikelyReferenceBoardImageFile,
  mimeTypeFromDataUrl,
} from '../src/site00/utils/prepareReferenceBoardUpload';

describe('prepareReferenceBoardUpload helpers', () => {
  it('accepts iOS picker files with empty MIME when extension is image', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'board.heic', { type: '' });
    expect(isLikelyReferenceBoardImageFile(file)).toBe(true);
  });

  it('rejects non-image extensions when MIME is empty', () => {
    const file = new File([new Uint8Array([1])], 'notes.pdf', { type: '' });
    expect(isLikelyReferenceBoardImageFile(file)).toBe(false);
  });

  it('parses mime from data URLs', () => {
    expect(mimeTypeFromDataUrl('data:image/jpeg;base64,abc')).toBe('image/jpeg');
    expect(mimeTypeFromDataUrl('data:image/png;base64,abc')).toBe('image/png');
  });
});
