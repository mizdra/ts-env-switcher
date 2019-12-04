// switch: { "lib": ["dom"] }
function fnA() {
  window.close();
}

const fnB = /* switch: { "lib": ["es5"] } */ function() {
  Date.now();
};
