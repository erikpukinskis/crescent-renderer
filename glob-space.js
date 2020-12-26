var library = require("module-library")(require)

module.exports = library.export(
  "glob-space",
  function() {

    function GlobSpace(rect, globSize, width, height, resolution) {
      this.rect = rect
      this.globSize = globSize
      this.width = width
      this.height = height
      this.resolution = resolution
    }

    GlobSpace.prototype.globPointToCanvas =
      function globPointToCanvas(point) {
        return [
          this.globXToCanvasX(
            point[0]),
          this.globYToCanvasY(
            point[1])]}

    GlobSpace.prototype.globXToCanvasX =
      function globXToCanvasX(globX) {
          var pixels = globX * this.globSize
          pixels = pixels + this.globSize
          var canvasX = 2*pixels/this.width - 1
          return canvasX }

    GlobSpace.prototype.globYToCanvasY =
      function globYToCanvasY(globY) {
          var pixels = globY * this.globSize
          pixels = pixels + this.globSize
          var canvasX = -2*pixels/this.height + 1
          return canvasX }

    GlobSpace.prototype.getRect =
      function(canvasId) {
        if (this.rect) {
          return this.rect
        }
        var canvas = document.getElementById(
          canvasId)
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
          rectX / this.globSize)}

    GlobSpace.prototype.getGlobY =
      function(event) {
        var rectY = this.getRectY(event)
        return Math.floor(
          rectY / this.globSize)}

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
          offset*36+index*6)
        points.set(color, offset*36+index*6+2)
      }

      point(x-1, y-1, 0)
      point(x, y-1, 1)
      point(x-1, y, 2)

      point(x-1, y, 3)
      point(x, y-1, 4)
      point(x, y, 5)

      return points}

    GlobSpace.prototype.getAllPixels = function(globs) {
      var points = new Float32Array(globs.length*6*6)

      var space = this

      this.globs.forEach(
        function(glob, offset) {
          x = glob.x + glob.nudgeX
          y = glob.y + glob.nudgeY


          space.getPixel(x, y, glob.color, points, offset)
        })

      return points
    }

    return GlobSpace
  }
)