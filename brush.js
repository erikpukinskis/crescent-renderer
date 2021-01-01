var library = require("module-library")(require)

module.exports = library.export(
  "brush",
  [library.ref(), "web-element", "bridge-module", "glob-space"],
  function(lib, element, bridgeModule, GlobSpace) {

    var brush = element.template(
      "canvas.brush",
      element.style({
        "position": "absolute",
        "border": "none",
        "background": "rgba(0,0,100,0.1)"}),
      function(bridge, addGlob, parentSpace) {
        this.assignId()

        var space = new GlobSpace(parentSpace)

        var spaceBinding = this.__space = space.defineOn(bridge, "brushSpace")

        var glob = bridge.defineSingleton(
          "brushGlob",
          function() {
            return {
              down: false }})

        var scene = this.__scene = bridge.defineSingleton(
          'scene',[
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
              "warrens/brushDown").
              withArgs(
                scene,
                spaceBinding,
                glob,
                color,
                bridge.event).
              evalable(),
          "onmouseup": bridge.remember(
            "warrens/brushUp").
              withArgs(
                addGlob,
                scene,
                color,
                glob,
                bridge.event).
            evalable(),
          "onmousemove": bridge.remember(
            "warrens/brushMove").
              withArgs(
                scene,
                spaceBinding,
                glob,
                color,
                bridge.event).
              evalable(),
          "onmouseout": bridge.remember(
            "warrens/brushHide").
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
        "warrens/brushDown")) {
        return }

      bridge.addToHead(
        element.stylesheet(
          brush))

      bridge.see(
        "warrens/brushDown",
        bridge.defineFunction(
          function brushDown(scene, space, glob, color, event) {
            var x = space.getRectX(event)
            var y = space.getRectY(event)

            glob.down = true
            glob.x = space.getGlobX(event)
            glob.y = space.getGlobY(event)
            glob.startRectX = x
            glob.startRectY = y }))

      bridge.see(
        "warrens/brushUp",
        bridge.defineFunction(
          function brushUp(addGlob, scene, color, glob, event) {
            glob.down = false
            scene.bufferPoints(
              [])
            var copy = {
              x: glob.x,
              y: glob.y,
              nudgeX: glob.nudgeX,
              nudgeY: glob.nudgeY,
              color: color.get()
            }
            addGlob(
              copy)}))

      bridge.see(
        "warrens/brushMove",
        bridge.defineFunction(
          function brushMove(scene, space, glob, color, event) {

            if (!color.get()) return

            if (glob.down) {
              var x = space.getRectX(event)
              var y = space.getRectY(event)

              var dx = x - glob.startRectX
              var dy = y - glob.startRectY
              glob.nudgeX = dx/space.getGlobSize()
              glob.nudgeY = dy/space.getGlobSize()

              var globX = glob.x + glob.nudgeX
              var globY = glob.y + glob.nudgeY

            } else {
              var globX = space.getGlobX(event)
              var globY = space.getGlobY(event)
            }

            var points = space.getPixel(
              globX,
              globY,
              color.get())

            scene.bufferPoints(points)
            scene.draw()}))

      bridge.see(
        "warrens/brushHide",
        bridge.defineFunction(
          function brushHide(scene) {
            scene.bufferPoints(
              [])
            scene.draw()}))
    }

    brush.getPickColorBinding =
      function getPickColorBinding(brushElement) {
        return brushElement.__color.methodCall(
          'set')}

    brush.getSetResolutionBinding =
      function getSetResolutionBinding(brushElement) {
        return brushElement.__space.methodCall(
          'setResolution')}

    brush.defineOn = defineOn

    return brush
  }
)
