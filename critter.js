var library = require("module-library")(require)

module.exports = library.export(
  "brush",
  [library.ref(), "web-element", "bridge-module"],
  function(lib, element, bridgeModule) {

    var brush = element.template(
      "canvas.critter",
      element.style({
        "position": "absolute",
        "background": "rgba(0,0,0,0.05)",
        "border": "none"}),
      function(bridge, globs, canvasId, width, height) {

        this.addAttribute(
          "id",
          canvasId)

        var scene = bridge.defineSingleton(
          'scene',[
          canvasId,
          bridgeModule(
            lib,
            "./shader",
            bridge)],
          function(canvasId, ShaderScene) {
            return new ShaderScene()})

        bridge.domReady([
          scene,
          canvasId],
          function(scene, canvasId) {
            var canvas = document.getElementById(
              canvasId)
            scene.init(
              canvas)})

        this.addAttributes({
          "width": width+"px",
          "height": height+"px"})

        bridge.domReady([
          globs,
          scene],
          function(globs, scene) {
            globs.onGlob(
              function(glob) {
                x = glob.x + glob.nudgeX
                y = glob.y + glob.nudgeY
                var coordinates = globs.getPixel(
                  x,
                  y)
                scene.pushCoordinates(
                  coordinates)
                // I think where I need to go from here is to just write the whole array of points in each time I get a new one. I don't think WebGL really has much in the way of abilities to reopen a buffer.

                // Which kind of suggests I should just move to like an xyrgba kind of thing. Or at least xy,rgba thing.

                scene.draw()
              })
          })

        bridge.domReady([
          canvasId,
          scene],
          function initScene(canvasId, scene) {
            var canvas = document.getElementById(
              canvasId)
            scene.init(
              canvas)})})

    function getAddGlobBinding(critterElement) {
      return brushElement.__addGlobBinding
    }

    brush.defineOn = defineOn
    brush.getAddGlobBinding = getAddGlobBinding

    return brush
  }
)
