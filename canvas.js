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

    const mouseMove = bridge.defineSingleton(
      [canvasId],
      function(canvasId) {
        var rect
        function handleMove(event) {
          if (!rect) {
            var canvas = document.getElementById(
              canvasId)
            var gl = canvas.getContext(
              'experimental-webgl')
            rect = gl.canvas.getBoundingClientRect()}
          var x = event.clientX - rect.left;
          var y = event.clientY - rect.top;
          console.log(
            x,
            y)}
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

    bridge.domReady([
      drawable.id,
      bridgeModule(
        library,
        "./shader",
        bridge)],
      function(canvasId, shader) {
        var canvas = document.getElementById(canvasId);
        var gl = canvas.getContext(
          "experimental-webgl",{
          antialias: false})
        shader(
          gl,
          canvas.width,
          canvas.height)})

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
