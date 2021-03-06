var library = require("module-library")(require)

library.using(
  [library.ref(), "web-site", "browser-bridge", "bridge-module", "./shader", "web-element"],
  function(lib, WebSite, BrowserBridge, bridgeModule, _, element) {

    var site = new WebSite()
    site.start(9999)

    var canvas = element("canvas",
      element.style({
        "width": "512px",
        "height": "384px",
      }))

    canvas.assignId()

    var baseBridge = new BrowserBridge()

    baseBridge.domReady([
      bridgeModule(lib, "./shader", baseBridge),
      canvas.id],
      function(ShaderScene, canvasId) {

        var critter = new Float32Array([-0.28125, 0.296875, 0.5859375, 0.85546875, 0.5390625, 0.4000000059604645, -0.28125, 0.6302083134651184, 0.5859375, 0.85546875, 0.5390625, 0.4000000059604645, -0.03125, 0.296875, 0.5859375, 0.85546875, 0.5390625, 0.4000000059604645, -0.03125, 0.6302083134651184, 0.5859375, 0.85546875, 0.5390625, 0.4000000059604645])

        var point = new Float32Array([-0.75, 0.6666666865348816, 0.2265625, 0.296875, 0.5703125, 0.4000000059604645, -0.75, 1, 0.2265625, 0.296875, 0.5703125, 0.4000000059604645, -0.5, 0.6666666865348816, 0.2265625, 0.296875, 0.5703125, 0.4000000059604645, -0.5, 1, 0.2265625, 0.296875, 0.5703125, 0.4000000059604645])

        var scene = new ShaderScene()
        scene.setVisible(true)
        var canvas = document.getElementById(
          canvasId)
        scene.init(
          canvas)
        scene.bufferPoints(point)
        scene.draw()
      })

    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(
          response)

        bridge.send(canvas)})
  }
)
