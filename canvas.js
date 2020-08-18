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
          "width": "384px",
          "height": "384px"})})

    var drawable = canvas()

    bridge.domReady([
      drawable.id,
      bridgeModule(
        library,
        './shader',
        bridge)],
      function(canvasId, shader) {
        var canvas = document.getElementById(canvasId);
        var gl = canvas.getContext(
          'experimental-webgl')
        shader(
          gl,
          canvas.width,
          canvas.height)})

    bridge.addToHead(
      element.stylesheet(
        canvas))

    site.addRoute(
      "get",
      "/",
      bridge.requestHandler([
        drawable]))

    site.start(
      8221)})
