var library = require("module-library")(require)

module.exports = library.export(
  "glob-space",
  [library.ref()],
  function(lib) {

    function GlobSpace(parent, rect, globSize, width, height, resolution) {
      // If a child glob space's width, resolution, etc are undefined, it optionally can fall back to a parent's
      this.parent = parent

      // The rect is a DOM element getBoundingRect object. It defines the offset of the space from the origin of the page. The left and top are used to understand where document coordinates are in the glob space. The width an height of the rect are not currently used.
      this.rect = rect

      // With and height should always correspond to actual screen pixels.
      this.width = width
      this.height = height

      // The resolution defines how many addressable pixels are in each screen pixel. So if resolution is 2 then you can fit 256 virtual pixels in a glob space with a width of 128
      this.resolution = resolution

      // The glob size is the number of virtual pixels in each glob. It is not likely to last very long as a global property of the glob space, it seems like it's likely going to become a per-glob attribute. So you can have globs of different sizes in one space.
      this.globSize = globSize
    }

    GlobSpace.prototype.setResolution = function setResolution(resolution) {
      this.resolution = resolution
    }

    GlobSpace.prototype.setGlobSize = function setGlobSize(globSize) {
      this.globSize = globSize
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
            parent,
            space.rect,
            space.globSize,
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
        x: sourceGlob.x * pixelRatio,
        y: sourceGlob.y * pixelRatio,
        nudgeX: sourceGlob.nudgeX * pixelRatio,
        nudgeY: sourceGlob.nudgeY * pixelRatio,
      }

      return destinationGlob
    }

    return GlobSpace
  }
)