Date.now(); // ok
document.title; // ok
globalThis.importScripts(); // ok

// switch: { "-lib": ["WebWorker"] }
function fnA() {
  Date.now(); // ok
  document.title; // ok
  globalThis.importScripts(); // error

  // switch: { "-lib": ["dom"] }
  function fnB() {
    Date.now(); // ok
    document.title; // error
    globalThis.importScripts(); // ok
  }
}
