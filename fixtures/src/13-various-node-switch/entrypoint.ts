declare function isNodeJS(): boolean;
declare function isBrowser(): boolean;

Date.now(); // ok
document.title; // ok

/* switch: { "-lib": ["dom"] } */ Date.now(); // ok
/* switch: { "-lib": ["dom"] } */ document.title; // error

/* switch: { "-lib": ["dom"] } */
if (isNodeJS()) {
  Date.now(); // ok
  document.title; // error
  process.pid; // ok
}

/* switch: { "-types": ["node"] } */
if (isBrowser()) {
  Date.now(); // ok
  document.title; // ok
  process.pid; // error
}
