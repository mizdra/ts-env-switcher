// switch: { "lib": ["dom"] }
function fnA() {
  window.close();
}

const fnB = /* switch: { "lib": ["es5"] } */ function() {
  Date.now();
};

const fnC = /* switch: { "lib": ["es5"] } */ () => {
  Date.now();
};

const fnD = /* switch: { "lib": ["es5"] } */ () => Date.now();
