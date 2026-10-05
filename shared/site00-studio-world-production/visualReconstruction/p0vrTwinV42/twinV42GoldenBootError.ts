export class TwinV42GoldenBootError extends Error {
  readonly code: string;

  constructor(code: string, detail?: string) {
    super(detail ? `${code} — ${detail}` : code);
    this.name = 'TwinV42GoldenBootError';
    this.code = code;
  }
}
