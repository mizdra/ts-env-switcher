Date.now(); // ok
document.title; // ok
process.pid; // error

/* switch: { "-lib": ["dom"] } */
function fn1() {
  Date.now(); // ok
  document.title; // error
  process.pid; // error

  // switch: {}
  function fn2() {
    Date.now(); // ok
    document.title; // ok
    process.pid; // error
  }
}
