var library = require("module-library")(require)

module.exports = library.export(
  "glob-space",
  function() {

    function GlobSpace(canvasId, GLOB_SIZE, canvasWidthInPixels, canvasHeightInPixels) {
      this.globs = []
      this.canvasId = canvasId
      this.GLOB_SIZE = GLOB_SIZE
      this.canvasWidthInPixels = canvasWidthInPixels
      this.canvasHeightInPixels = canvasHeightInPixels
    }

    GlobSpace.prototype.globXToCanvasX =
      function globXToCanvasX(globX) {
          var pixels = globX * this.GLOB_SIZE
          pixels = pixels + this.GLOB_SIZE
          var canvasX = 2*pixels/this.canvasWidthInPixels - 1
          return canvasX }

    GlobSpace.prototype.globYToCanvasY =
      function globYToCanvasY(globY) {
          var pixels = globY * this.GLOB_SIZE
          pixels = pixels + this.GLOB_SIZE
          var canvasX = -2*pixels/this.canvasHeightInPixels + 1
          return canvasX }

    GlobSpace.prototype.getRect =
      function() {
        if (this.rect) {
          return this.rect
        }
        var canvas = document.getElementById(
          this.canvasId)
        var gl = canvas.getContext(
          'experimental-webgl')
        this.rect = gl.canvas.getBoundingClientRect()
        return this.rect}

    GlobSpace.prototype.getRectX =
      function(event) {
        var canvasLeft = this.getRect()
            .left
        return event.clientX - canvasLeft }

    GlobSpace.prototype.getRectY =
      function(event) {
        var canvasTop = this.getRect()
            .top
        return event.clientY - canvasTop }

    GlobSpace.prototype.getGlobX =
      function( event) {
        var rectX = this.getRectX(event)
        return Math.floor(
          rectX / this.GLOB_SIZE)}

    GlobSpace.prototype.getGlobY =
      function(event) {
        var rectY = this.getRectY(event)
        return Math.floor(
          rectY / this.GLOB_SIZE)}

    GlobSpace.prototype.getPixel = function(x, y) {
        return new Float32Array([
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
            y - 1)])}


    GlobSpace.prototype.activeGlob = function() {
      if (this.activeGlobIndex != null) {
        return this.globs[
          this.activeGlobIndex]}}

    GlobSpace.prototype.start = function(rectX,rectY) {
      this.activeGlobIndex = this.globs.length
      this.activeGlobStartRectX = rectX
      this.activeGlobStartRectY = rectY
      this.globs.push({
        "x": Math.floor(
          rectX/this.GLOB_SIZE),
        "y": Math.floor(
          rectY/this.GLOB_SIZE),
        "nudgeX": 0,
        "nudgeY": 0})}

    GlobSpace.prototype.nudge = function(rectX,rectY) {
      var dx = rectX - this.activeGlobStartRectX
      var dy = rectY - this.activeGlobStartRectY

      this.globs[this.activeGlobIndex].nudgeX = dx/this.GLOB_SIZE
      this.globs[this.activeGlobIndex].nudgeY = dy/this.GLOB_SIZE}

    GlobSpace.prototype.pop = function() {
      return this.globs.pop()}

    GlobSpace.prototype.push = function(glob) {
      this.activeGlobIndex = undefined
      return this.globs.push(glob)}

    GlobSpace.prototype.end = function() {
      this.activeGlobIndex = undefined}

    return GlobSpace
  }
)