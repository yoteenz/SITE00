/** Browser build stub — pngjs is Node-only (streams + util.inherits). */

function pngjsStub(): never {
  throw new Error('pngjs is not available in the browser bundle');
}

export const PNG = {
  sync: {
    read: pngjsStub,
    write: pngjsStub,
  },
};

export default { PNG };
