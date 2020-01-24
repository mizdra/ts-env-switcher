export function isBrowser() {
  return 'window' in globalThis;
}

export function isNodeJS() {
  return 'process' in globalThis;
}
