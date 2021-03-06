var library = require("module-library")(require)

module.exports = library.export(
  "brush",
  [library.ref(), "web-element", "bridge-module", "glob-space", "./positioned"],
  function(lib, element, bridgeModule, GlobSpace, positioned) {

    var brush = element.template(
      "canvas.brush",
      positioned,
      element.style({
        "position": "absolute",
        "border": "1px solid rgba(255,0,0,0.5)",
        "box-sizing": "border-box",
        "background": "rgba(0,0,100,0.1)"}),
      function(bridge, addGlob, space) {
        this.assignId()

        var spaceBinding = this.__space = space.defineOn(bridge, "brushSpace")

        var glob = bridge.defineSingleton(
          "brushGlob",
          function() {
            return {
              down: false }})

        var scene = this.__scene = bridge.defineSingleton(
          "scene",[
          bridgeModule(
            lib,
            "./shader",
            bridge)],
          function brushScene(ShaderScene) {
            return new ShaderScene()})

        var color = this.__color = bridge.defineSingleton(
          "color",
          function() {
            function Color(){}
            Color.prototype.set = function(color) {
              this.color = color}
            Color.prototype.get = function() {
              return this.color}
            return new Color()})

        defineOn(bridge)

        this.addAttributes({
          "width": space.getWidth()+"px",
          "height": space.getHeight()+"px",
          "onmousedown": bridge.remember(
              "brush/brushDown").
              withArgs(
                scene,
                spaceBinding,
                glob,
                color,
                bridge.event).
              evalable(),
          "onmouseup": bridge.remember(
            "brush/brushUp").
              withArgs(
                addGlob,
                scene,
                color,
                glob,
                spaceBinding,
                bridge.event).
            evalable(),
          "onmousemove": bridge.remember(
            "brush/brushMove").
              withArgs(
                scene,
                spaceBinding,
                glob,
                color,
                bridge.event).
              evalable(),
          "onmouseout": bridge.remember(
            "brush/brushHide").
              withArgs(
                scene).
              evalable()})

        bridge.domReady([
          this.id,
          scene,
          spaceBinding],
          function initBrush(canvasId, scene, space) {
            var canvas = document.getElementById(
              canvasId)
            scene.init(
              canvas)
            space.getCanvasRect(
              canvas)})
      })

    function defineOn(bridge) {
      if (bridge.remember(
        "brush/brushDown")) {
        return }

      bridge.addToHead(
        element.stylesheet(
          brush))

      bridge.see(
        "brush/brushDown",
        bridge.defineFunction(
          function brushDown(scene, space, glob, color, event) {
            var x = space.getRectX(event)
            var y = space.getRectY(event)

            var brushSize = 64
            glob.down = true
            glob.x = space.getGlobX(event, brushSize)
            glob.y = space.getGlobY(event, brushSize)
            glob.startRectX = x
            glob.startRectY = y }))

      bridge.see(
        "brush/brushUp",
        bridge.defineFunction(
          function brushUp(addGlob, scene, color, glob, space, event) {
            glob.down = false
            scene.bufferPoints(
              [])
            var brushSize = 64
            var copy = {
              x: glob.x,
              y: glob.y,
              nudgeX: glob.nudgeX,
              nudgeY: glob.nudgeY,
              color: color.get(),
              size: brushSize,
              space: space }
            addGlob(
              copy)}))

      bridge.see(
        "brush/brushMove",
        bridge.defineFunction(
          function brushMove(scene, space, glob, color, event) {

            if (!color.get()) return

              var brushSize = 64

            if (glob.down) {
              var x = space.getRectX(event)
              var y = space.getRectY(event)

              var dx = x - glob.startRectX
              var dy = y - glob.startRectY
              glob.nudgeX = dx/brushSize
              glob.nudgeY = dy/brushSize

              var globX = glob.x + glob.nudgeX
              var globY = glob.y + glob.nudgeY

            } else {
              var globX = space.getGlobX(event, brushSize)
              var globY = space.getGlobY(event, brushSize)
            }

            var brushSize = 64

            var points = space.getPixel(
              globX,
              globY,
              color.get(),
              brushSize)

            scene.bufferPoints(points)
            scene.draw()}))

      bridge.see(
        "brush/brushHide",
        bridge.defineFunction(
          function brushHide(scene) {
            scene.bufferPoints(
              [])
            scene.draw()}))
    }

    brush.getPickColorBinding =
      function getPickColorBinding(brushElement) {
        return brushElement.__color.methodCall(
          "set")}

    brush.defineOn = defineOn

    return brush
  }
)
