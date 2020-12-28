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

        var baseSpace = bridge.defineSingleton(
          "baseSpace",[
          bridgeModule(
            lib,
            "./glob-space",
            baseBridge),
          GLOB_SIZE,
          apertureWidthInPixels,
          apertureHeightInPixels],
          function(GlobSpace, GLOB_SIZE, width, height) {
            const space = new GlobSpace(
              undefined,
              undefined,
              GLOB_SIZE,
              width,
              height)

            return space})

        var fox = critter(
          bridge,
          baseSpace,
          apertureWidthInPixels,
          apertureHeightInPixels)

        var addGlob = critter.getAddGlobBinding(fox)

        // TODO

        // ✓ Share a single glob space between critter and brush (and move start/stop into brush)

        // ✓ Add a test for GlobSpace

        // - Add a resolution parameter to glob space

        // I'm trying to get the zooming working again.

        // I thought to work on dragging around the apertures, because of a hunch that it might make it easier to think about the zooming.

        // But generally "one thing at a time" is a good approach.

        // What needs to happen when we zoom?

        // - the aperture shouldn't change size, but the contents should zoom. So, I think width on the GlobSpace should maybe decrease and then the transform on the canvas should increase

        // I am a little disinclined to use DOM nesting to control the zoom. Let's think about how the different elements are different:

        // - brush: will be able to move it around, outside dimensions shouldn't change with zoom
        // - tracing image: may not have any canvas or glob space or anything, outside dimensions WILL change with zoom
        // - critter: will likely be tiled at some scale? outside dimensions will change with zoom

        // So, the issue that the brush aperture is going to stay fixed size while the critter aperture grows is enough for me to think I should undo the "zoom all the things" approach with a single transform: scale for all elements.

        // And the whole point of adding the parent glob spaces was to be able to share the zoom information somehow between canvases.

        // I get confused when I start thinking about the BlobSpace parameters under zoom though. So let's try to break those down:

        // - blob size: this is in units of screen pixels per blob. Not sure if it should change with the zoom. The question is whether the brush size should change with the zoom or independently. It maybe simplifies the interaction if its just alway constant. But it might be good to keep the programming model clear if we handle them separately, and allow any brush size at any zoom level. Not sure.

        // - resolution: this is in units of device pixels per screen pixel. That's exactly what should be changing when we zoom

        // - width/height: this is in units of blobs. It will be changing for brush when we zoom, but not for critter. Although if critter becomes more of a tiled situation then we'd be slicing and dicing those tiles. Still, not something I think we need to worry about just yet.

        // Then we have some outside parameters:

        // - canvas transform scale: this will be changing with the zoom. I think it needs to be roughly in lock step with the resolution parameter to the blob space.

        // - canvas width: this will be changing with the zoom for the brush but not the critter as of yet.

        var paintBrush = brush(bridge, addGlob, baseSpace, apertureWidthInPixels, apertureHeightInPixels)

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
