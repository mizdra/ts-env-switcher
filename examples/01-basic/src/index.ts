function isBrowser() {
  return 'window' in globalThis;
}

function isNodeJS() {
  return 'process' in globalThis;
}

function log(message: string) {
  const formattedMessage = Date.now() + ': ' + message;
  if (isBrowser()) /* switch: { "-types": ["node"] } */ {
    document.write(formattedMessage);
  }
  if (isNodeJS()) /* switch: { "-lib": ["dom"] } */ {
    document.write(formattedMessage);
  }
}

log('message');
