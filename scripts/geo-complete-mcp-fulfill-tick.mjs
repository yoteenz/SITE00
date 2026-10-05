#!/usr/bin/env node
/** One fulfill tick: print pending action JSON or status. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const pendingPath = '/tmp/geo_mcp_pending.json';
const runnerAlive =
  spawnSync('tmux', ['-f', '/exec-daemon/tmux.portal.conf', 'has-session', '-t', '=geo-complete-handshake'], {
    encoding: 'utf8',
  }).status === 0;

if (!runnerAlive) {
  console.log(JSON.stringify({ status: 'runner_stopped' }));
  process.exit(0);
}

if (!fs.existsSync(pendingPath)) {
  console.log(JSON.stringify({ status: 'idle' }));
  process.exit(0);
}

const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
if (pending.type === 'generate') {
  console.log(JSON.stringify({ status: 'need_mcp', action: 'openart_generate_image', call: pending.call, job: pending.job }));
} else if (pending.type === 'wait') {
  console.log(
    JSON.stringify({
      status: 'need_mcp',
      action: 'openart_creation_wait',
      historyId: pending.historyId,
      timeoutSeconds: pending.timeoutSeconds ?? 90,
    }),
  );
} else {
  console.log(JSON.stringify({ status: 'unknown', pending }));
  process.exit(1);
}
