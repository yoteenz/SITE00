import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE,
  SITE00_PUBLIC_PROJECT_REF,
} from '../src/site00/components/loader/site00LoaderMedia';

const root = process.cwd();
const bootScript = readFileSync(join(root, 'public/site00-assts-loader-boot.js'), 'utf8');
const mediaModule = readFileSync(join(root, 'src/site00/components/loader/site00LoaderMedia.ts'), 'utf8');

const resolvedMobile = `https://${SITE00_PUBLIC_PROJECT_REF}.supabase.co/storage/v1/object/public/live-preview/site00/${SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE}`;

const checks: Array<{ label: string; ok: boolean; detail?: string }> = [
  {
    label: 'mobile remote path is approved BLDR asset (745c8292)',
    ok: SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE.endsWith('745c8292.mp4'),
  },
  {
    label: 'boot script preloads approved mobile animation',
    ok: bootScript.includes(SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE),
  },
  {
    label: 'boot script does not preload legacy geometry assets',
    ok: !/geometry-v1|kling-v2|assts-loader-geometry/i.test(bootScript),
  },
  {
    label: 'loader media module exports mobile remote path',
    ok: mediaModule.includes(SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE),
  },
  {
    label: 'resolved mobile URL uses public project ref',
    ok: resolvedMobile.includes(SITE00_PUBLIC_PROJECT_REF),
    detail: resolvedMobile,
  },
];

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error('SITE 00 mobile loader animation regression detected:\n');
  for (const failure of failures) {
    console.error(`- ${failure.label}${failure.detail ? `: ${failure.detail}` : ''}`);
  }
  process.exit(1);
}

console.log('SITE 00 mobile loader animation verified:', resolvedMobile);
