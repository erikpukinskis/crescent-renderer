var library = require("module-library")(require)

module.exports = library.export(
  "shader",
  function() {
    function shader(gl) {
      console.log('gl is', gl)
    }
    return shader
  }
)