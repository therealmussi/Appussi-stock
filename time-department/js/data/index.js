/* TIME DEPARTMENT — case registry */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});
  TD.CASES = [TD.CASE_1, TD.CASE_2, TD.CASE_3, TD.CASE_4, TD.CASE_5];
  if (typeof module !== "undefined" && module.exports) { module.exports = TD.CASES; }
})(typeof window !== "undefined" ? window : globalThis);
