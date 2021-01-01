var library = require("module-library")(require)

module.exports = library.export(
  "glob-space",
  function() {

    function GlobSpace(parent, rect, globSize, width, height, resolution) {
      this.rect = rect
      this.globSize = globSize
      this.width = width
      this.height = height
      this.resolution = resolution
      this.parent = parent
      console.log(this)
    }

    GlobSpace.prototype.setResolution = function setResolution(resolution) {
      this.resolution = resolution
      console.log('space', this)
    }

    GlobSpace.prototype.getResolution = function getResolution() {
      return this.resolution || this.parent.getResolution()
    }

    GlobSpace.prototype.getGlobSize = function getGlobSize() {
      return (this.globSize ? this.globSize : this.parent.getGlobSize())}

    GlobSpace.prototype.getWidth = function getWidth() {
      return (this.width ? this.width : this.parent.getWidth())*this.getResolution()}

    GlobSpace.prototype.getHeight = function getHeight() {
      return (this.height ? this.height : this.parent.getHeight())*this.getResolution()}

    GlobSpace.prototype.globPointToCanvas =
      function globPointToCanvas(point) {
        return [
          this.globXToCanvasX(
            point[0]),
          this.globYToCanvasY(
            point[1])]}

    GlobSpace.prototype.globXToCanvasX =
      function globXToCanvasX(globX) {
          var pixels = globX * this.getGlobSize()
          pixels = pixels + this.getGlobSize()
          var canvasX = 2*pixels/this.getWidth() - 1
          if (Number.isNaN(canvasX)) {
            debugger }
          return canvasX }

    GlobSpace.prototype.globYToCanvasY =
      function globYToCanvasY(globY) {
          var pixels = globY * this.getGlobSize()
          pixels = pixels + this.getGlobSize()
          var canvasY = -2*pixels/this.getHeight() + 1
          if (Number.isNaN(canvasY)) {
            debugger }
          return canvasY }

    GlobSpace.prototype.getCanvasRect =
      function(canvas) {
        var gl = canvas.getContext(
          'experimental-webgl')
        this.rect = gl.canvas.getBoundingClientRect()}

    GlobSpace.prototype.getRectX =
      function(event) {
        var canvasLeft = this.rect.left
        return event.clientX - canvasLeft }

    GlobSpace.prototype.getRectY =
      function(event) {
        var canvasTop = this.rect.top
        return event.clientY - canvasTop }

    GlobSpace.prototype.getGlobX =
      function(event) {
        var rectX = this.getRectX(event)
        return Math.floor(
          rectX / this.getGlobSize())}

    GlobSpace.prototype.getGlobY =
      function(event) {
        var rectY = this.getRectY(event)
        return Math.floor(
          rectY / this.getGlobSize())}

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
        if (!color) {
          debugger
        }
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

      globs.forEach(
        function(glob, offset) {
          x = glob.x + glob.nudgeX
          y = glob.y + glob.nudgeY

          if (Number.isNaN(x) || Number.isNaN(y)) {
            debugger
          }

          space.getPixel(x, y, glob.color, points, offset)
        })

      return points
    }

    return GlobSpace
  }
)