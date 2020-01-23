function isBrowser() {
  return 'window' in globalThis;
}

function isNodeJS() {
  return 'process' in globalThis;
}

export function log(message: string) {
  const formattedMessage = Date.now() + ': ' + message;
  /* switch: { "-types": ["node"] } */
  if (isBrowser()) {
    document.write(formattedMessage);
  }
  /* switch: { "-lib": ["dom"] } */
  if (isNodeJS()) {
    document.write(formattedMessage); // error
    // process.stdout.write(message);
  }
}
