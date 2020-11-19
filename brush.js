var library = require("module-library")(require)

module.exports = library.export(
  "brush",
  [library.ref(), "web-element", "bridge-module"],
  function(lib, element, bridgeModule) {

    var brush = element.template(
      "canvas.brush",
      element.style({
        "position": "absolute",
        "background": "rgba(0,0,0,0.05)",
        "border": "none"}),
      function(bridge, brushGlobs, canvasGlobs, canvasId, width, height) {
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
            withArgs(scene, brushGlobs, bridge.event).
            evalable(),
          "onmousedown": events.brushDown.
            withArgs(brushGlobs, bridge.event).
            evalable(),
          "onmouseup": events.brushUp.
            withArgs(scene, brushGlobs, canvasGlobs, bridge.event).
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

          var color = new Float32Array([1.0, 1.0, 1.0, 0.5])

          var points = globs.getPixel(x, y, color)

          scene.bufferPoints(points)
          scene.draw()})

      var brushDown = bridge.defineFunction(
        function handleBrushDown(globs, event) {
          globs.start(
            globs.getRectX(event),
            globs.getRectY(event))})

      var brushUp = bridge.defineFunction(
        function handleBrushUp(scene, brushGlobs, canvasGlobs, event) {
          var glob = brushGlobs.pop()
          canvasGlobs.push(
            glob)})

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
