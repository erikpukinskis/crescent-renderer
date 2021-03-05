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
  "./critter",
  "./positioned"],
  function(lib, BrowserBridge, WebSite, element, bridgeModule, _, GlobSpace, basicStyles, brush, critter, positioned) {

    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)
    var site = new WebSite()

    var ZOOM = 1
    var GLOB_SIZE = 64/ZOOM
    var APERTURE_WIDTH = 8*ZOOM
    var APERTURE_HEIGHT = 6*ZOOM

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

    critter.defineOn(baseBridge)

    baseBridge.addToHead(
      element.stylesheet(
        colorButton))

    baseBridge.addToHead(
      element(
        "title",
        "Trace Frames"))

    var tracer = element.template(
      ".tracer",
      positioned,
      "img",{
      "src": "/trace"},
      function() {
        this.assignId()})

    baseBridge.addToHead(
      element.stylesheet([
        positioned,
        tracer]))

    function getZoomScale(zoomLevel) {
      var scale
        if (zoomLevel == 0) {
          scale = 1}
        if (zoomLevel < 0) {
          scale = -1/(zoomLevel-1)
        } else {
          scale = 1*(zoomLevel+1)
        }
        return scale}

    var zoomBy = baseBridge.defineFunction([
      getQueryParam,
      setQueryParam,
      baseBridge.defineFunction(getZoomScale),
      apertureWidthInPixels,
      apertureHeightInPixels],
      function zoomBy(getQueryParam, setQueryParam, getZoomScale, apertureWidthInPixels, apertureHeightInPixels, tracingImageId, critterId, setCritterResolution, drawCritter, zoomIncrement) {
        var zoomLevel = getQueryParam("zoom", parseInt) || 0
        zoomLevel += zoomIncrement
        var scale = getZoomScale(zoomLevel)

        // [ ] tracing image width & height ×2
        // [ ] resolution on critter ×2
        // [ ] critter canvas width & height ×2

        var tracingImage = document.getElementById(
            tracingImageId)

        tracingImage.style.transform = "scale("+scale+")"

        // OK, so critter space needs to change resolution, and... double width?

        // var critter = document.getElementById(
        //     critterId)
        // critter.width = apertureWidthInPixels/scale
        // critter.height = apertureHeightInPixels/scale

        setCritterResolution(1/scale)

        drawCritter()

        setQueryParam(
          "zoom",
          zoomLevel)
      })

    var zoomButton = element.template(
      "button",
      function(zoom, zoomIncrement) {
        var direction = zoomIncrement > 0 ? "In" : "Out"
        this.addChild("Zoom "+direction)
        this.addAttributes({
          "onclick": zoom.withArgs(
            zoomIncrement).
            evalable()})})

    site.addRoute(
      "get",
      "/flurble",
      function(request, response) {
        var scale = getZoomScale(
          request.query.zoom)
        var color = new Float32Array(
          request.query.color.
            split("**"))
        var bridge = baseBridge.forResponse(
          response)

        var tracingImage = tracer()
        positioned.moveTo(tracingImage, scale)

        var foxSpace = new GlobSpace(
          undefined,
          undefined,
          GLOB_SIZE,
          apertureWidthInPixels,
          apertureHeightInPixels,
          1/scale)

        var fox = critter(
          bridge,
          foxSpace)

        var addGlob = critter.getAddGlobBinding(fox)

        // Not sure really what I'm doing here. I think zooming these different pieces in lockstep probably has to stop. When I zoom out to -1, the canvas width attribute doubles, even though it's the same size on screen. That seems really wrong. Like, wouldn't we necessarily be rendering 2x more than we need at that point?

        // Some lines I'm drawing here to keep things simple:

        // Don't worry about low res resolution, just assume the device resolution in glob space is the CSS screen resolution.

        // Just do the glue-up. Don't worry too much about architecture.


        // I get confused when I start thinking about the BlobSpace parameters under zoom though. So let's try to break those down:

        // - blob size: this is in units of screen pixels per blob. Not sure if it should change with the zoom. The question is whether the brush size should change with the zoom or independently. It maybe simplifies the interaction if its just alway constant. But it might be good to keep the programming model clear if we handle them separately, and allow any brush size at any zoom level. Not sure.

        // - resolution: this is in units of device pixels per screen pixel. That's exactly what should be changing when we zoom

        // - width/height: this is in units of blobs. It will be changing for brush when we zoom, but not for critter. Although if critter becomes more of a tiled situation then we'd be slicing and dicing those tiles. Still, not something I think we need to worry about just yet.

        // Then we have some outside parameters:

        // - canvas transform scale: this will be changing with the zoom. I think it needs to be roughly in lock step with the resolution parameter to the blob space.

        // - canvas width: this will be changing with the zoom for the brush but not the critter as of yet.

        var brushSpace = new GlobSpace(
          undefined,
          undefined,
          GLOB_SIZE,
          apertureWidthInPixels,
          apertureHeightInPixels,
          1/scale)

        var paintBrush = brush(
          bridge,
          addGlob,
          brushSpace)
        positioned.moveTo(paintBrush, scale)

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

        var app = element(
          element.style({
            "position": "relative" }))

        app.addChildren([
          tracingImage,
          fox,
          paintBrush])

        var zoom = zoomBy.withArgs(
          tracingImage.id,
          fox.id,
          critter.getSetResolutionBinding(fox),
          critter.getDrawBinding(fox))

        bridge.send([
          element(
          "p",[
            zoomButton(
              zoom,
              1),
            " ",
            zoomButton(
              zoom,
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
