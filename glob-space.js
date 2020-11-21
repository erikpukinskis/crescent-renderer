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

    GlobSpace.prototype.getPixel = function(x, y, color, points, offset) {
      if (!points) {
        points = new Float32Array(6*6)
        offset = 0
      }

      var space = this

      function point(globX, globY, index) {
        points.set([
          space.globXToCanvasX(
            globX),
          space.globYToCanvasY(
            globY)],
          offset*24+index*6)
        points.set(color, index*6+2)
      }

      point(x-1, y-1, 0)
      point(x, y-1, 1)
      point(x-1, y, 2)

      point(x-1, y, 3)
      point(x, y-1, 4)
      point(x, y, 5)

      return points}

    GlobSpace.prototype.getAllPixels = function() {
      var color = new Float32Array([0.5859375,0.85546875,0.5390625,0.4000000059604645])

      // return this.getPixel(this.globs[0].x + this.globs[0].nudgeX, this.globs[0].y + this.globs[0].nudgeY, color)

      var points = new Float32Array(this.globs.length*6*6)
      console.log(points.length, "points")
      var globs = this
      this.globs.forEach(
        function(glob, offset) {
          x = glob.x + glob.nudgeX
          y = glob.y + glob.nudgeY


          globs.getPixel(x, y, color, points, offset)
        })
      return points
    }

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