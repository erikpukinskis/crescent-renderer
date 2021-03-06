var library = require("module-library")(require)

module.exports = library.export(
  "glob-space",
  [library.ref()],
  function(lib) {

    function GlobSpace(rect, width, height, resolution, extra) {
      // The rect is a DOM element getBoundingRect object. It defines the offset of the space from the origin of the page. The left and top are used to understand where document coordinates are in the glob space. The width an height of the rect are not currently used.
      this.rect = rect

      // With and height should always correspond to actual screen pixels.
      this.width = width
      this.height = height

      // The resolution defines how many addressable pixels are in each screen pixel. So if resolution is 2 then you can fit 256 virtual pixels in a glob space with a width of 128
      this.resolution = resolution
    }

    GlobSpace.prototype.setResolution = function setResolution(resolution) {
      this.resolution = resolution
    }

    GlobSpace.prototype.getResolution = function getResolution() {
      return this.resolution || this.parent.getResolution()
    }

    GlobSpace.prototype.getWidth = function getWidth() {
      return (this.width ? this.width : this.parent.getWidth())*this.getResolution()}

    GlobSpace.prototype.getHeight = function getHeight() {
      return (this.height ? this.height : this.parent.getHeight())*this.getResolution()}

    GlobSpace.prototype.globPointToCanvas =
      function globPointToCanvas(point, size) {
        return [
          this.globXToCanvasX(
            point[0], size),
          this.globYToCanvasY(
            point[1], size)]}

    GlobSpace.prototype.globXToCanvasX =
      function globXToCanvasX(globX, size) {
          if (!size) throw new Error('no size')
          var pixels = globX * size
          pixels = pixels + size
          var canvasX = 2*pixels/this.getWidth() - 1
          if (Number.isNaN(canvasX)) {
            debugger }
          return canvasX }

    GlobSpace.prototype.globYToCanvasY =
      function globYToCanvasY(globY, size) {
          if (!size) throw new Error('no size')
          var pixels = globY * size
          pixels = pixels + size
          var canvasY = -2*pixels/this.getHeight() + 1
          if (Number.isNaN(canvasY)) {
            debugger }
          return canvasY }

    GlobSpace.prototype.getCanvasRect =
      function(canvas) {
        var gl = canvas.getContext(
          "experimental-webgl")
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
      function(event, size) {
        var rectX = this.getRectX(event)
        return Math.floor(
          rectX / size)}

    GlobSpace.prototype.getGlobY =
      function(event, size) {
        var rectY = this.getRectY(event)
        return Math.floor(
          rectY / size)}

    GlobSpace.prototype.getPixel = function(x, y, color, size, points, offset) {
      if (!points) {
        points = new Float32Array(6*6)
        offset = 0
      }

      var space = this

      function point(globX, globY, index) {
        points.set([
          space.globXToCanvasX(
            globX, size),
          space.globYToCanvasY(
            globY, size)],
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

          space.getPixel(x, y, glob.color, glob.size, points, offset)
        })

      return points
    }

    GlobSpace.prototype.defineOn = function defineOn(bridge, name) {
      if (this._binding) return this._binding

      this._name = name
      if (this.parent) {
        var parent = this.parent.defineOn(
          bridge,
          "baseSpace")
      }

      this._binding = bridge.defineSingleton(
        name,[
        lib.module("glob-space"),
        parent || null,
        this],
        function(GlobSpace, parent, space) {
          return new GlobSpace(
            space.rect,
            space.width,
            space.height,
            space.resolution)})

      return this._binding }

    GlobSpace.prototype.getBinding = function getBinding(bridge) {
      if (!this._binding) {
        throw new Error("Must call globSpace.defineOn before globSpace.getBinding")
      }
      return this._binding
    }

    GlobSpace.prototype.mapFrom = function mapFrom(sourceSpace, sourceGlob) {

      var pixelRatio = this.resolution / sourceSpace.resolution

      var destinationGlob = {
        color: sourceGlob.color,
        x: sourceGlob.x,
        y: sourceGlob.y,
        nudgeX: sourceGlob.nudgeX,
        nudgeY: sourceGlob.nudgeY,
        size: sourceGlob.size * pixelRatio,
      }

      return destinationGlob
    }

    return GlobSpace
  }
)