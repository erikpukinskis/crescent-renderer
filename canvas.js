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

    baseBridge.addToHead(
      element.stylesheet(
        canvas))
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
          element("br"),
          tracingImage,
          drawable])})

    site.addRoute(
      "get",
      "/trace",
      site.sendFile(__dirname, 'art', 'fox cycle 31 TRACE + ear + 07.25.png'))

    site.start(
      8221)})
