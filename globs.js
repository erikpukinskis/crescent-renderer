var library = require("module-library")(require)

module.exports = library.export(
  "globs",
  function() {

    function Globs(canvasId, GLOB_SIZE, canvasWidthInPixels, canvasHeightInPixels) {
      this.globs = []
      this.canvasId = canvasId
      this.GLOB_SIZE = GLOB_SIZE
      this.canvasWidthInPixels = canvasWidthInPixels
      this.canvasHeightInPixels = canvasHeightInPixels
    }

    Globs.prototype.globXToCanvasX =
      function globXToCanvasX(globs) {
          var pixels = globs * this.GLOB_SIZE
          pixels = pixels + this.GLOB_SIZE
          var canvasX = 2*pixels/this.canvasWidthInPixels - 1
          return canvasX }

    Globs.prototype.globYToCanvasY =
      function globYToCanvasY(globs) {
          var pixels = globs * this.GLOB_SIZE
          pixels = pixels + this.GLOB_SIZE
          var canvasX = -2*pixels/this.canvasHeightInPixels + 1
          return canvasX }

    Globs.prototype.getRect =
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

    Globs.prototype.getRectX =
      function(event) {
        var canvasLeft = this.getRect()
            .left
        return event.clientX - canvasLeft }

    Globs.prototype.getRectY =
      function(event) {
        var canvasTop = this.getRect()
            .top
        return event.clientY - canvasTop }

    Globs.prototype.getGlobX =
      function( event) {
        var rectX = this.getRectX(event)
        return Math.floor(
          rectX / this.GLOB_SIZE)}

    Globs.prototype.getGlobY =
      function(event) {
        var rectY = this.getRectY(event)
        return Math.floor(
          rectY / this.GLOB_SIZE)}

    Globs.prototype.activeGlob = function() {
      if (this.activeGlobIndex != null) {
        return this.globs[
          this.activeGlobIndex]}}

    Globs.prototype.start = function(rectX,rectY) {
      this.activeGlobIndex = this.globs.length
      this.activeGlobStartRectX = rectX
      this.activeGlobStartRectY = rectY
      this.globs.push({
        "x": Math.floor(rectX/this.GLOB_SIZE),
        "y": Math.floor(rectY/this.GLOB_SIZE),
        "nudgeX": 0,
        "nudgeY": 0})}

    Globs.prototype.nudge = function(rectX,rectY) {
      var dx = rectX - this.activeGlobStartRectX
      var dy = rectY - this.activeGlobStartRectY

      this.globs[this.activeGlobIndex].nudgeX = dx/this.GLOB_SIZE
      this.globs[this.activeGlobIndex].nudgeY = dy/this.GLOB_SIZE}

    Globs.prototype.end = function() {
      this.activeGlobIndex = undefined
      console.log("new glob!", this.globs)}

    return Globs
  }
)