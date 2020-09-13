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

    var setBrushVisible = baseBridge.defineFunction([
      scene],
      function(scene, isVisible) {
        console.log("brush is visible", isVisible)
        scene.setBrushVisible(isVisible)
        scene.draw()})

    var canvas = element.template(
      "canvas.canvas",{
      "id": canvasId,
      "onmousemove": mouseMove.withArgs(
        BrowserBridge.event)
        .evalable(),
      "onmouseout": setBrushVisible.withArgs(
        false)
        .evalable(),
      "onmouseenter": setBrushVisible.withArgs(
        true)
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
        "opacity": "0.6",
      }),
      function(r,g,b) {
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
          "onclick": brush.methodCall(
            "pickColor")
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

    var brush = baseBridge.defineSingleton(
      [scene, setQueryParam],
      function(scene, setQueryParam) {
        function Brush() {}
        Brush.prototype.pickColor = function(color) {
          setQueryParam("color", color.join('**'))
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

    var swatches = [
      colorButton(
        56,
        148,
        133),
      colorButton(
        58,
        76,
        146),
      colorButton(
        160,
        44,
        114),
      colorButton(
        35,
        190,
        14),
      colorButton(
        150,
        219,
        138)]

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

        if (color.length === 4) {
          bridge.domReady(
            scene.methodCall(
              "setBrushColor")
              .withArgs(
                color))}

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
