'use strict';
/**
 * Register tsx for Vite local API middleware (CommonJS entry — avoids ESM→CJS import breakage).
 * Loaded via createRequire from vite-site00-local-api.mjs; do not import tsx/dist paths directly.
 */
const { register } = require('tsx/cjs/api');
register();
