// One-off smoke test: confirm FAL_KEY is live and openai/gpt-image-2 responds.
// Not part of the production pipeline — safe to delete after the pilot.
import { fal } from '@fal-ai/client';

const falKey = process.env.FAL_KEY?.trim();
if (!falKey) {
  console.error('FAL_KEY missing');
  process.exit(1);
}
fal.config({ credentials: falKey });

const started = Date.now();
try {
  const result = await fal.subscribe('openai/gpt-image-2', {
    input: {
      prompt:
        'A single minimal line drawing of a small cube on a plain white background, extremely simple, no text, no shadow.',
      image_size: 'square_hd',
      quality: 'high',
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  console.log('OK in', Date.now() - started, 'ms');
  console.log(JSON.stringify(result.data, null, 2).slice(0, 2000));
} catch (e) {
  console.error('FAL call failed:', e?.message || e);
  if (e?.body) console.error('body:', JSON.stringify(e.body).slice(0, 1000));
  process.exit(1);
}
