var library = require("module-library")(require)

// flowers look like this: https://youtu.be/GbWMw249xY8?t=496

library.using([
  "browser-bridge",
  "web-site",
  "web-element",
  "bridge-module",
  "./shader"],
  function(BrowserBridge, WebSite, element, bridgeModule, _) {

    var bridge = new BrowserBridge()

    var site = new WebSite()

    const canvasId = element.anId()

    const scene = bridge.defineSingleton(
      'scene',[
      canvasId,
      bridgeModule(
        library,
        "./shader",
        bridge)],
      function(canvasId, ShaderScene) {
        return new ShaderScene()
      })

    bridge.domReady([
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

    const mouseMove = bridge.defineSingleton(
      [canvasId, canvasWidthInPixels, canvasHeightInPixels, scene],
      function handleMouseMove(canvasId, canvasWidthInPixels, canvasHeightInPixels, scene) {
        var rect
        var coordinates = new Float32Array([
          -0.5,
          0.5,
          -0.5,
          -0.5,
          0.0,
          -0.5])

        function handleMove(event) {
          if (!rect) {
            getBoundingClientRect()}

          var x = event.clientX - rect.left
          var y = event.clientY - rect.top
          coordinates[0] = 2 * (x /canvasWidthInPixels - 0.5)
          coordinates[1] = -2 * (y / canvasHeightInPixels - 0.5)
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
        bridge.event)
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

    bridge.addToHead(
      element.stylesheet(
        canvas))
    bridge.addToHead(
      element(
        "title",
        "Hi!"))

    site.addRoute(
      "get",
      "/",
      bridge.requestHandler([
        element(
          "img",{
          "src": "/trace.gif"},
          element.style({
            "position": "absolute"})),
        drawable]))

    site.addRoute(
      "get",
      "/trace.gif",
      site.sendFile(__dirname, 'art/02.gif'))

    site.start(
      8221)})
