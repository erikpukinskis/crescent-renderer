var library = require("module-library")(require)

module.exports = library.export(
  "brush",
  [library.ref(), "web-element", "bridge-module"],
  function(lib, element, bridgeModule) {

    var brush = element.template(
      "canvas.brush",
      element.style({
        "position": "absolute",
        "border": "none"}),
      function(bridge, brushGlobs, addGlob, canvasId, width, height) {
        var events = bridge.remember(
          "warrens/brush")

        this.addAttribute(
          "id",
          canvasId)

        var scene = bridge.defineSingleton(
          'scene',[
          bridgeModule(
            lib,
            "./shader",
            bridge)],
          function brushScene(ShaderScene) {
            return new ShaderScene()})

        bridge.domReady([
          scene,
          canvasId],
          function brushInit(scene, canvasId) {
            var canvas = document.getElementById(
              canvasId)
            scene.init(
              canvas)})

        this.__color = bridge.defineSingleton(
          "color",
          function() {
            function Color(){}
            Color.prototype.set = function(color) {
              this.color = color}
            Color.prototype.get = function() {
              return this.color}
            return new Color()})

        this.addAttributes({
          "width": width+"px",
          "height": height+"px",
          "onmousemove": events.mouseMove.
            withArgs(scene, brushGlobs, this.__color, bridge.event).
            evalable(),
          "onmousedown": events.brushDown.
            withArgs(brushGlobs, this.__color, bridge.event).
            evalable(),
          "onmouseup": events.brushUp.
            withArgs(scene, brushGlobs, addGlob, bridge.event).
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
        function handleMouseMove(scene, globs, color, event) {

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

          var c = color.get()

          if (!c) return

          var points = globs.getPixel(x, y, c)

          scene.bufferPoints(points)
          scene.draw()})

      var brushDown = bridge.defineFunction(
        function handleBrushDown(globs, color, event) {
          globs.start(
            globs.getRectX(event),
            globs.getRectY(event),
            color.get())})

      var brushUp = bridge.defineFunction(
        function handleBrushUp(scene, brushGlobs, addGlob, event) {
          var glob = brushGlobs.pop()
          addGlob(
            glob)})

      var setBrushVisible = bridge.defineFunction(function setBrushVisible(scene, isVisible) {
          scene.bufferPoints(
            [])
          scene.draw()})


/////////

    function activeGlob() {
      if (this.activeGlobIndex != null) {
        return this.globs[
          this.activeGlobIndex]}}

    function start(rectX,rectY, color) {
      this.activeGlobIndex = this.globs.length
      this.activeGlobStartRectX = rectX
      this.activeGlobStartRectY = rectY
      this.globs.push({
        "x": Math.floor(
          rectX/this.GLOB_SIZE),
        "y": Math.floor(
          rectY/this.GLOB_SIZE),
        "nudgeX": 0,
        "nudgeY": 0,
        "color": color})}

    function nudge(rectX,rectY) {
      var dx = rectX - this.activeGlobStartRectX
      var dy = rectY - this.activeGlobStartRectY

      this.globs[this.activeGlobIndex].nudgeX = dx/this.GLOB_SIZE
      this.globs[this.activeGlobIndex].nudgeY = dy/this.GLOB_SIZE}

    function pop() {
      return this.globs.pop()}

    function push(glob) {
      this.activeGlobIndex = undefined
      return this.globs.push(glob)}

    function end() {
      this.activeGlobIndex = undefined}

////////

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
      return brushElement.__color.methodCall(
        'set')
    }

    brush.defineOn = defineOn
    brush.getPickColorBinding = getPickColorBinding

    return brush
  }
)
