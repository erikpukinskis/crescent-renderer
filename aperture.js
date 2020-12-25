var library = require("module-library")(require)

// flowers look like this: https://youtu.be/GbWMw249xY8?t=496

library.using([
  library.ref(),
  "browser-bridge",
  "web-site",
  "web-element",
  "bridge-module",
  "./shader",
  "./glob-space",
  "basic-styles",
  "./brush",
  "./critter"],
  function(lib, BrowserBridge, WebSite, element, bridgeModule, _, __, basicStyles, brush, critter) {

    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)
    var site = new WebSite()

    var ZOOM = 1
    var GLOB_SIZE = 64/ZOOM
    var APERTURE_WIDTH = 8*ZOOM
    var APERTURE_HEIGHT = 6*ZOOM

    // These two vars are dupliated in brush.js, which is questionable:
    var apertureWidthInPixels = APERTURE_WIDTH * GLOB_SIZE
    var apertureHeightInPixels = APERTURE_HEIGHT * GLOB_SIZE

    var colorButton = element.template(
      "button.swatch",
      element.style({
        "width": GLOB_SIZE+"px",
        "height": GLOB_SIZE+"px",
        "margin-right": "4px",
        "border": "none",
        "opacity": "0.6",
      }),
      function(pickColor, r,g,b) {
        var color = new Float32Array([
          r/256,
          g/256,
          b/256,
          0.4])
        var rgba = colorToRgba(color)
        function colorToRgba(color) {
          return color.map(
            function(component) {
              return Math.floor(
                component*256)})
                .join(
                  ",")}
        this.appendStyles({
          "background": "rgba("
            +rgba+")"})
        this.addAttributes({
          "onclick": pickColor
            .withArgs(
              color)
              .evalable()})})

    var setQueryParam = baseBridge.defineFunction(
      function setQueryParam(key, value) {
        var params = new URLSearchParams(
          document.location.search)
        params.set(key, value)
        history.replaceState(
          null,
          null,
          "?"+params.toString())})

    var getQueryParam = baseBridge.defineFunction(
      function getQueryParam(key, sanitize) {
        var params = new URLSearchParams(
          document.location.search)
        var string = params.get(
          key)
        if (sanitize) {
          return sanitize(string)
        } else {
          return string}})

    brush.defineOn(baseBridge, getQueryParam)
    critter.defineOn(baseBridge)

    baseBridge.addToHead(
      element.stylesheet(
        colorButton))

    baseBridge.addToHead(
      element(
        "title",
        "Trace Frames"))

    var aperture = element.template(
      ".aperture",
      element.style({
        "transform-origin": "top left",
        "position": "relative"}),
      function(zoomLevel) {
        this.assignId()
        if (!zoomLevel) {
          return }
        this.appendStyles({
          "transform": getZoomTransform(
            zoomLevel)})})

    var tracer = element.template(
      ".tracer",
      "img",
      element.style({
        "position": "absolute"}),{
      "src": "/trace"})

    baseBridge.addToHead(
      element.stylesheet([
        aperture,
        tracer]))

    function getZoomTransform(zoomLevel) {
      var scale
        if (zoomLevel == 0) {
          scale = 1}
        if (zoomLevel < 0) {
          scale = -1/(zoomLevel-1)
        } else {
          scale = 1*(zoomLevel+1)
        }
        return "scale("+scale+")"}

    var zoomBy = baseBridge.defineFunction(
      [getQueryParam, setQueryParam, getZoomTransform],
      function zoomBy(getQueryParam, setQueryParam, getZoomTransform, elementId, zoomIncrement) {
        var zoomLevel = getQueryParam("zoom", parseInt) || 0
        zoomLevel += zoomIncrement
        var element = document.getElementById(
            elementId)
        element.style.transform = getZoomTransform(zoomLevel)

        setQueryParam(
          "zoom",
          zoomLevel)})

    var zoomButton = element.template(
      "button",
      function(elementId, zoomIncrement) {
        var zoom = zoomBy.withArgs(
            elementId,
            zoomIncrement)
        var direction = zoomIncrement > 0 ? "In" : "Out"
        this.addChild("Zoom "+direction)
        this.addAttributes({
          "onclick": zoom.evalable()})})

    site.addRoute(
      "get",
      "/flurble",
      function(request, response) {
        var zoomLevel = request.query.zoom
        var colorParam = request.query.color
        var color = new Float32Array(colorParam.split("**"))
        var bridge = baseBridge.forResponse(
          response)

        var tracingImage = tracer()

        var foxCanvasId = element.anId()

        var foxGlobs = bridge.defineSingleton(
          "fox",[
          bridgeModule(
            lib,
            "./glob-space",
            baseBridge),
          foxCanvasId,
          GLOB_SIZE,
          apertureWidthInPixels,
          apertureHeightInPixels],
          function(GlobSpace, foxCanvasId, GLOB_SIZE, apertureWidthInPixels, apertureHeightInPixels) {
            return new GlobSpace(foxCanvasId, GLOB_SIZE, apertureWidthInPixels, apertureHeightInPixels)})

        var fox = critter(bridge, foxGlobs, foxCanvasId, apertureWidthInPixels, apertureHeightInPixels)

        var addGlob = critter.getAddGlobBinding(fox)

        // More specifically I think what's happening here is that I'm realizing how much boilerplate is required to instantiate and wire up the multiple independent pieces of this page.

        // I am scared because I know this wiring is something EZJS is undeveloped in, and I don't know how it will turn out.

        // But is there any real danger here? I have a zoomBy function, and I need that to send signals to either the brush and the critter canvases, or to their globs.

        // (In the back of my mind I am also wondering if I need to switch from an action-passing to a handler-providing model, but my gut says not right now and maybe never)

        // Question stack:

        // Can the globs control who all gets notified about the zooming?

        // Do the globs even need to know zooming is happening?

        // Does the zoom level need to affect what happens in glob-space?

          // Should it do, just as a matter of convenience?

          // In other words, can zoom be orthogonal to what's happening in glob-space?

            // I don't _think_ so. At least not completely. As long as we have pixels with different sizes in glob-space, then we need that thing to be at least somewhat aware of zoom.

              // But wait, why not? Can we have a different canvas for each zoom? Like, zooming in would blow up all the canvases, but each one would have a different size of pixel?

                // a) that seems inflexible, maybe I want infinite sizes of pixel

                // b) the canvases still need to know canvasWidthInPixels, I don't see any way around that.

            // We could just be passing the brush size in there (in where? into glob-space? in pixels?). And then there's a nice "critter depends on brush" thing, where the critter doesn't even really need to be keeping track of the zoom. (how? because brush tells critter when the zoom changes? that seems off, I have been hoping brush would be its own body of complexity)

            // I guess then there's two parts to this, 1) zooming the aperture 2), altering the brush size

            // I'm unsure of how much we'll have to mess with canvas dimensions to keep glob-space working. It seems like at a very minimum "canvas width in pixels" is going to be changing for sure.

            // It does seem like glob-space is going to eventually need to be shared across an aperture. Or at least part of it.

              // Like maybe there is one glob-space that is used by both brush and critter, but they each have their own array of globs.

                // That feels like kind of a nice goal, and maybe then the start/stop stuff can get moved out of glob-space into brush.

        // OK, but I maybe need to back out some of this global zoom stuff I did.

        // One other question that pops up, do we want all of these canvases to be full rez? Like, I've kind of been assuming all of the canvases would be rendered at screen rez but that's not a necessary assumption. Maybe that's another parameter for glob-space to take.

          // Besides the obvious performance opportunities

          // That might be really nice for art. To be able to draw at one glob size, and nudge just one level down, say 3x.

        var brushCanvasId = element.anId()

        var brushGlobs = bridge.defineSingleton(
          "brush", [
          bridgeModule(
            lib,
            "./glob-space",
            baseBridge),
          brushCanvasId,
          GLOB_SIZE,
          apertureWidthInPixels,
          apertureHeightInPixels],
          function(GlobSpace, brushCanvasId, GLOB_SIZE, apertureWidthInPixels, apertureHeightInPixels) {
            return new GlobSpace(brushCanvasId, GLOB_SIZE, apertureWidthInPixels, apertureHeightInPixels)})

        var paintBrush = brush(bridge, brushGlobs, addGlob, brushCanvasId, apertureWidthInPixels, apertureHeightInPixels)

        var pickColor = brush.getPickColorBinding(paintBrush)

        if (color.length === 4) {
          bridge.domReady(
            pickColor.withArgs(
              color))}

        var swatches = [
          colorButton(
            pickColor,
            56,
            148,
            133),
          colorButton(
            pickColor,
            58,
            76,
            146),
          colorButton(
            pickColor,
            160,
            44,
            114),
          colorButton(
            pickColor,
            35,
            190,
            14),
          colorButton(
            pickColor,
            150,
            219,
            138)]

        var app = aperture(
          zoomLevel)

        app.addChildren([
          tracingImage,
          fox,
          paintBrush])

        bridge.send([
          element(
          "p",[
            zoomButton(
              app.id,
              1),
            " ",
            zoomButton(
              app.id,
              -1)]),
          element(
            "p",
            swatches),
          element("br"),
          app,
          ])})

    site.addRoute(
      "get",
      "/trace",
      site.sendFile(
        __dirname,
        "art",
        "fox cycle 31 TRACE + ear + 07.25.png"))

    site.start(
      8221)})
