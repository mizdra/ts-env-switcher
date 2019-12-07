// switch: { "lib": ["dom"] }
function fnA() {}

const fnB = /* switch: { "lib": ["es5"] } */ function() {};

const fnC = /* switch: { "lib": ["ESNext"] } */ () => {};

const obj = {
  /* switch: { "lib": ["ESNext"] } */
  fcD() {},
};
