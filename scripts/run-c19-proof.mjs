import { runC19LiveProductionProof } from '../api/_lib/site00ExpressionEngine/runC19LiveProductionProof.ts';

async function main() {
  delete process.env.VITEST;
  const r = await runC19LiveProductionProof();
  console.log(JSON.stringify(r, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
