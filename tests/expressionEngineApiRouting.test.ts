import { describe, it, expect } from 'vitest';
import handler from '../api/site00/expression-engine.js';

function mockRes() {
  const state: { status: number; body: unknown } = { status: 200, body: null };
  return {
    status(code: number) {
      state.status = code;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      return this;
    },
    get state() {
      return state;
    },
  };
}

describe('Expression Engine API phase routing', () => {
  it('GET ?phase=B1 returns sprint payload without brandId query', async () => {
    const res = mockRes();
    await handler({ method: 'GET', query: { phase: 'B1' }, body: {} } as never, res as never);
    expect(res.state.status).toBe(200);
    expect((res.state.body as { sprint?: string }).sprint).toBe('B1_PHASE_1');
  });

  it('GET ?phase=B1P2 returns blueprint payload', async () => {
    const res = mockRes();
    await handler({ method: 'GET', query: { phase: 'B1P2' }, body: {} } as never, res as never);
    expect(res.state.status).toBe(200);
    expect((res.state.body as { sprint?: string }).sprint).toBe('B1_PHASE_2');
    expect((res.state.body as { blueprint?: unknown }).blueprint).toBeTruthy();
  });
});
