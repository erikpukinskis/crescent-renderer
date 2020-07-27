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

    var canvas = element.template(
      "canvas.canvas",
      element.style({
        "border": "8px solid lightgreen",
        "border-radius": "16px",
        "border-top-width": "24px",
        "box-sizing": "border-box",
        ":hover": {
          "border-color": "limegreen"}}),
      function() {
        this.addAttributes({
          "width": "384px",
          "height": "384px",
        })
      })

    var drawable = canvas()
    drawable.assignId()

    bridge.domReady([
      drawable.id,
      bridgeModule(
        library,
        './shader',
        bridge)],
      function(canvasId, shader) {
        var canvas = document.getElementById(
          canvasId)
        var gl = canvas.getContext(
          'webgl', 384, 384)
        shader(gl)
    })

    bridge.addToHead(
      element.stylesheet(
        canvas))

    site.addRoute(
      "get",
      "/",
      bridge.requestHandler([
        drawable]))

    site.start(8221)
  })
