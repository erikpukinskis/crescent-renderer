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

    // There's something I would like to do here, which is I would like to create a singleton that can be curried.

    var buildZoom = bridge.defineFunction(
      function buildZoom(zoomIncrement, elementId) {
        var zoomLevel = 0
        var element
        function zoom() {
          zoomLevel += zoomIncrement
          if (!element) {
            element = document.getElementById(
              elementId)}
          var scale
          if (zoomLevel == 0) {
            scale = 1}
          if (zoomLevel < 0) {
            scale = -1/(zoomLevel-1)
          } else {
            scale = 1*(zoomLevel+1)
          }
          element.style.transform = "scale("+scale+")"}

        return zoom})

    var tracingId = element.anId()
    var tracingImage = element(
      "img",{
      "id": tracingId,
      "src": "/trace"},
      element.style({
        "transform-origin": "top left",
        "position": "absolute"}))

    // Got some stuff done:
    // 6) Investigate why jobPool.resign is requesting work -> it's basically "re-requesting" the worker function be enqueued
    // 5) Try to figure out what's happening in browser-task -> We just weren't logging out the right variable for the socket.id
    // 4) Get browser-bridge tests running
    // 8) Have browserTask resign remove all the associated tasks from the queue
    // 9) Clean up job-pool naming
    // 10) Fix multiple All is done's
    // 11) Get browser-task tests to run at all
    // 7) Get "partials can be loaded via POST" to run reliably
    // 3) Add test for bridge.call
    // 2) Add bridge.call


    // This is my stack right now, I added this function and it works, but when I tried to run the browser-bridge tests, they fail. So:
    // 1) Add Zoom In button to canvas.js

    var zoomInButton = element(
      "button",
      "Zoom In",{
      "onclick": bridge.call(
        buildZoom.withArgs(
          1,
          tracingId),
        "zoomIn")})

    site.addRoute(
      "get",
      "/",
      bridge.requestHandler([
        zoomInButton,
        element("br"),
        tracingImage,
        drawable]))

    site.addRoute(
      "get",
      "/trace",
      site.sendFile(__dirname, 'art', 'fox cycle 31 TRACE + ear + 07.25.png'))

    site.start(
      8221)})
