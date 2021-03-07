var library = require("module-library")(require)

module.exports = library.export(
  "float-color",
  function() {
    function floatColor(r,g,b,a) {
      return new Float32Array([
        r/256,
        g/256,
        b/256,
        a])}

    floatColor.toRgbaString = function floatColorToRgba(color) {
      return color.map(
        function(component) {
          return Math.floor(
            component*256)})
            .join(
              ",")}

    floatColor.fromQuery = function floatColorFromQuery(queryString) {
      return new Float32Array(queryString.
        split("**"))}

    return floatColor })