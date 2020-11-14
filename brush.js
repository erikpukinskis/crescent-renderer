var library = require("module-library")(require)

module.exports = library.export(
  "brush",
  [library.ref(), "web-element", "bridge-module"],
  function(lib, element, bridgeModule) {

    var brush = element.template(
      "canvas",
      element.style({
        "position": "absolute",
        "background": "rgba(0,0,0,0.05)",
        "border": "none"}),
      function(bridge, globs, canvasId, width, height) {
        var events = bridge.remember(
          "warrens/brush")

        console.log("canvas id inside is", canvasId)

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
          "height": height+"px",
          "onmousemove": events.mouseMove.
            withArgs(scene, globs, bridge.event).
            evalable(),
          "onmousedown": events.brushDown.
            withArgs(globs, bridge.event).
            evalable(),
          "onmouseup": events.brushUp.
            withArgs(scene, globs, bridge.event).
            evalable(),
          "onmouseout": events.setBrushVisible.
            withArgs(scene, false).
            evalable(),
          "onmouseenter": events.setBrushVisible.
            withArgs(
              scene,
              true).
            evalable()})

        this.__scene = scene

        bridge.domReady([
          canvasId,
          scene],
          function initScene(canvasId, scene) {
            var canvas = document.getElementById(
              canvasId)
            scene.init(
              canvas)})})

    function defineOn(bridge) {

      var events = bridge.remember(
        "warrens/brush")

      if (events) return events

      bridge.addToHead(
        element.stylesheet(
          brush))

      var mouseMove = bridge.defineFunction(
        function handleMouseMove(scene, globs, event) {

          var x
          var y

          var activeGlob = globs.activeGlob()
          if (activeGlob) {
            globs.nudge(
              globs.getRectX(event),
              globs.getRectY(event))
            x = activeGlob.x + activeGlob.nudgeX
            y = activeGlob.y + activeGlob.nudgeY
          } else {
            x = globs.getGlobX(event)
            y = globs.getGlobY(event)
          }

          var coordinates = new Float32Array([
            globs.globXToCanvasX(
              x - 1),
            globs.globYToCanvasY(
              y),

            globs.globXToCanvasX(
              x - 1),
            globs.globYToCanvasY(
              y - 1),

            globs.globXToCanvasX(
              x),
            globs.globYToCanvasY(
              y),

            globs.globXToCanvasX(
              x),
            globs.globYToCanvasY(
              y - 1),
          ])

          scene.setCoordinates(coordinates)
          scene.draw()})

      var brushDown = bridge.defineFunction(
        function handleBrushDown(globs, event) {
          globs.start(
            globs.getRectX(event),
            globs.getRectY(event))})

      var brushUp = bridge.defineFunction(
        function handleBrushUp(scene, globs, event) {
          globs.end()})

      var setBrushVisible = bridge.defineFunction(function setBrushVisible(scene, isVisible) {
          scene.setBrushVisible(
            isVisible)
          scene.draw()})

      var events = {
        "mouseMove": mouseMove,
        "brushDown": brushDown,
        "brushUp": brushUp,
        "setBrushVisible": setBrushVisible
      }

      bridge.see(
        "warrens/brush",
        events)

      return events}

    function getPickColorBinding(brushElement) {
      return brushElement.__scene.methodCall('setBrushColor')
    }

    brush.defineOn = defineOn
    brush.getPickColorBinding = getPickColorBinding

    return brush
  }
)
