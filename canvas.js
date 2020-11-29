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
    var CANVAS_WIDTH = 8*ZOOM
    var CANVAS_HEIGHT = 6*ZOOM

    // These two vars are dupliated in brush.js, which is questionable:
    var canvasWidthInPixels = CANVAS_WIDTH * GLOB_SIZE
    var canvasHeightInPixels = CANVAS_HEIGHT * GLOB_SIZE

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
        "Hi!"))

    var tracer = element.template(
      ".tracer",
      "img",{
      "src": "/trace"},
      element.style({
        "transform-origin": "top left",
        "position": "absolute"}),
      function(zoomLevel) {
        this.assignId()
        if (!zoomLevel) {
          return }
        this.appendStyles({
          "transform": getZoomTransform(
            zoomLevel)})})

    baseBridge.addToHead(
      element.stylesheet([
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
        var tracingImage = tracer(zoomLevel)

        var foxCanvasId = element.anId()

        var foxGlobs = bridge.defineSingleton(
          "fox",[
          bridgeModule(
            lib,
            "./glob-space",
            baseBridge),
          foxCanvasId,
          GLOB_SIZE,
          canvasWidthInPixels,
          canvasHeightInPixels],
          function(GlobSpace, foxCanvasId, GLOB_SIZE, canvasWidthInPixels, canvasHeightInPixels) {
            return new GlobSpace(foxCanvasId, GLOB_SIZE, canvasWidthInPixels, canvasHeightInPixels)})

        var fox = critter(bridge, foxGlobs, foxCanvasId, canvasWidthInPixels, canvasHeightInPixels)

        var addGlob = critter.getAddGlobBinding(fox)

        // OK, this is obviously getting a little wild. We're wiring up a lot here, about 100 lines of code. But I think that's OK. I am trying to remind myself that the way EZJS is designed to work is that the architecture is emergent from just consistent adding and refactoring.

        // More specifically I think what's happening here is that I'm realizing how much boilerplate is required to instantiate and wire up the multiple independent pieces of this page. And it's a good thing that all these pieces are independent. But EZJS puts the overhead of working out how to keep things independent on the developer.

        // Modern programming solves this problem by creating a russian doll of frameworks. You limit the complexity within any given layer by enforcing, either via material realities or by culture that certain things don't happen in that layer. That sort of solves the "keep things somewhat independent" problem, but in a very blunt way.

        // A handlful of very senior people make architectural decisions on behalf of an entire industry of practitioners. And those practitioners then need to be experts in their framework layer to know exactly what to do and what not to do. And often need expertise in adjacent framework layers too.

        // But learning an entire framework takes time, so that has a gating effect.

        // And the underlying problem is still not solved. "Architectural" discussions become arguments about trying to exhume massive bodies of code from one framework into another. Which is not refactoring, it's rewriting.

        var brushCanvasId = element.anId()

        var brushGlobs = bridge.defineSingleton(
          "brush", [
          bridgeModule(
            lib,
            "./glob-space",
            baseBridge),
          brushCanvasId,
          GLOB_SIZE,
          canvasWidthInPixels,
          canvasHeightInPixels],
          function(GlobSpace, brushCanvasId, GLOB_SIZE, canvasWidthInPixels, canvasHeightInPixels) {
            return new GlobSpace(brushCanvasId, GLOB_SIZE, canvasWidthInPixels, canvasHeightInPixels)})

        var paintBrush = brush(bridge, brushGlobs, addGlob, brushCanvasId, canvasWidthInPixels, canvasHeightInPixels)

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

        bridge.send([
          element(
          "p",[
            zoomButton(
              tracingImage.id,
              1),
            " ",
            zoomButton(
              tracingImage.id,
              -1)]),
          element(
            "p",
            swatches),
          element("br"),
          tracingImage,
          fox,
          paintBrush,
          ])})

    site.addRoute(
      "get",
      "/trace",
      site.sendFile(__dirname, 'art', 'fox cycle 31 TRACE + ear + 07.25.png'))

    site.start(
      8221)})
