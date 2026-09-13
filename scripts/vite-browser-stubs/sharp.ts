/**
 * Browser build stub — sharp is Node-only. Twin hero materialization in the browser
 * must use the hero-asset-materialize API, not in-bundle cropping.
 */

function sharpStub(): never {
  throw new Error('sharp is not available in the browser bundle');
}

export default sharpStub;
