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

    const mouseMove = bridge.defineSingleton(
      [canvasId, scene],
      function handleMouseMove(canvasId, scene) {
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
          coordinates[0] = x/384 - 0.5
          coordinates[1] = -1 * (y/384 - 0.5)
          scene.setCoordinates(coordinates)
          scene.draw()
          console.log(
            x,
            y)}

        function getBoundingClientRect() {
          var canvas = document.getElementById(
            canvasId)
          var gl = canvas.getContext(
            'experimental-webgl')
          rect = gl.canvas.getBoundingClientRect()}

        return handleMove})

    var PIXEL_SIZE = 64
    var CANVAS_WIDTH = 6
    var CANVAS_HEIGHT = 6

    var canvas = element.template(
      "canvas.canvas",{
      "id": canvasId,
      "onmousemove": mouseMove.withArgs(
        bridge.event)
        .evalable()},
      element.style({
        "border": "none"}),
      function() {
        this.addAttributes({
          "width": PIXEL_SIZE*CANVAS_WIDTH+"px",
          "height": PIXEL_SIZE*CANVAS_HEIGHT+"px"})})

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
        drawable]))

    site.start(
      8221)})
