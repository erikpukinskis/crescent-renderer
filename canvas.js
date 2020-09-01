var library = require("module-library")(require)

// flowers look like this: https://youtu.be/GbWMw249xY8?t=496

library.using([
  "browser-bridge",
  "web-site",
  "web-element",
  "bridge-module",
  "./shader",
  "basic-styles"],
  function(BrowserBridge, WebSite, element, bridgeModule, _, basicStyles) {

    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)
    var site = new WebSite()

    const canvasId = element.anId()

    const scene = baseBridge.defineSingleton(
      'scene',[
      canvasId,
      bridgeModule(
        library,
        "./shader",
        baseBridge)],
      function(canvasId, ShaderScene) {
        return new ShaderScene()
      })

    baseBridge.domReady([
      canvasId,
      scene],
      function initScene(canvasId, scene) {
        var canvas = document.getElementById(
          canvasId)
        scene.init(canvas)})

    var PIXEL_SIZE = 64
    var CANVAS_WIDTH = 8
    var CANVAS_HEIGHT = 6

    var canvasWidthInPixels = CANVAS_WIDTH * PIXEL_SIZE
    var canvasHeightInPixels = CANVAS_HEIGHT * PIXEL_SIZE

    const mouseMove = baseBridge.defineSingleton(
      [canvasId, canvasWidthInPixels, canvasHeightInPixels, scene, PIXEL_SIZE],
      function handleMouseMove(canvasId, canvasWidthInPixels, canvasHeightInPixels, scene, PIXEL_SIZE) {
        var rect

        function screenToX(n) {
          return 2*(n/canvasWidthInPixels - 0.4)
        }

        function screenToY(n) {
          return -2*(n/canvasHeightInPixels - 0.4)
        }

        function handleMove(event) {
          if (!rect) {
            getBoundingClientRect()}

          var x = event.clientX - rect.left
          var y = event.clientY - rect.top

          x = Math.floor(x/PIXEL_SIZE)*PIXEL_SIZE
          y = Math.floor(y/PIXEL_SIZE)*PIXEL_SIZE

          var coordinates = new Float32Array([
            screenToX(x-PIXEL_SIZE),
            screenToY(y),

            screenToX(x-PIXEL_SIZE),
            screenToY(y-PIXEL_SIZE),

            screenToX(x),
            screenToY(y),

            screenToX(x),
            screenToY(y-PIXEL_SIZE),
          ])

          scene.setCoordinates(coordinates)
          scene.draw()}

        function getBoundingClientRect() {
          var canvas = document.getElementById(
            canvasId)
          var gl = canvas.getContext(
            'experimental-webgl')
          rect = gl.canvas.getBoundingClientRect()}

        return handleMove})

    var canvas = element.template(
      "canvas.canvas",{
      "id": canvasId,
      "onmousemove": mouseMove.withArgs(
        BrowserBridge.event)
        .evalable()},
      element.style({
        "position": "absolute",
        "background": "rgba(0,0,0,0.05)",
        "border": "none"}),
      function() {
        this.addAttributes({
          "width": canvasWidthInPixels+"px",
          "height": canvasHeightInPixels+"px"})})

    var drawable = canvas()

    var colorButton = element.template(
      "button.swatch",
      element.style({
        "width": PIXEL_SIZE+"px",
        "height": PIXEL_SIZE+"px",
        "margin-right": "4px",
        "border": "none",
      }),
      function(color) {
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
          "onclick": brush.methodCall(
            "pickColor")
            .withArgs(
              color)
              .evalable()})})

    var brush = baseBridge.defineSingleton(
      [scene],
      function(scene) {
        function Brush() {}
        Brush.prototype.pickColor = function(color) {
          scene.setBrushColor(
            color)
          scene.draw()}
        return new Brush()})

    baseBridge.addToHead(
      element.stylesheet(
        canvas,
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
        debugger
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

    var swatches = [
      colorButton(
        new Float32Array([
          184/256,
          228/256,
          221/256,
          0.7])),
      colorButton(
        new Float32Array([
          202/256,
          209/256,
          203/256,
          0.7])),
      colorButton(
        new Float32Array([
          235/256,
          181/256,
          213/256,
          0.7])),
      colorButton(
        new Float32Array([
          195/256,
          250/256,
          188/256,
          0.7])),
      colorButton(
        new Float32Array([
          180/256,
          229/256,
          171/256,
          0.7]))]

    site.addRoute(
      "get",
      "/flurble",
      function(request, response) {
        var zoomLevel = request.query.zoom
        var bridge = baseBridge.forResponse(
          response)
        var tracingImage = tracer(zoomLevel)
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
          drawable])})

    site.addRoute(
      "get",
      "/trace",
      site.sendFile(__dirname, 'art', 'fox cycle 31 TRACE + ear + 07.25.png'))

    site.start(
      8221)})
