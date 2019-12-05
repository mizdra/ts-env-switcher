// switch: { "lib": ["es5", "dom"] }
function fnA() {
  window.close();
}

const fnB = /* switch: { "lib": ["es5", "dom"] } */ function() {
  window.close();
  Date.now();
};

const fnC = /* switch: { "lib": ["es5", "webworker"] } */ () => {
  Date.now();
  self.location.hostname;
};

const fnD = /* switch: { "lib": ["webworker"] } */ () => self.location.hostname;

function fnE() {}
