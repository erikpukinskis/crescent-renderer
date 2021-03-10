var runTest = require("run-test")(require)

// runTest.only("drawing globs")

runTest.only("drawing globs in high resolution space")

runTest.library.define(
  "glob-test-site",[
  runTest.library.ref(),
  "web-site",
  "browser-bridge",
  "web-element"],
  function(lib, WebSite, BrowserBridge, element) {

    function globTestSite(glob, space, canvasWidth, canvasHeight) {
      var site = new WebSite()
      var bridge = new BrowserBridge()

      var canvas = element(
        "canvas",{
        "width": canvasWidth,
        "height": canvasHeight},
        element.style({
          "border": "1px solid #CCC",
          "box-sizing": "border-box"}))

      canvas.assignId()

      var scene = bridge.defineSingleton(
        "scene",[
        lib.module("./shader")],
        function critterScene(ShaderScene) {
          return new ShaderScene()})

      const draw = bridge.defineFunction([
        canvas.id,
        scene,
        glob,
        space.defineOn(
          bridge,
          "testSpace")],
        function(canvasId, scene, glob, space) {
          var canvas = document.getElementById(
            canvasId)
          scene.init(
            canvas)
          space.getCanvasRect(
            canvas)
          var points = space.getAllPixels([glob])

          scene.bufferPoints(points)
          scene.draw()
        })

      bridge.domReady(draw)

      site.addRoute("get", "/",
        bridge.requestHandler(
          canvas))

      site.canvasId = canvas.id

      return site
    }

    return globTestSite
  })

runTest(
  "drawing globs",[
  "./glob-space",
  "./float-color",
  "./expect-canvas-snapshot",
  "glob-test-site"],
  function(expect, done, GlobSpace, floatColor, expectCanvasSnapshot, globTestSite) {

    var glob = {
      "color": floatColor(
        56,
        148,
        133,
        1),
      "x": 0,
      "y": 0,
      "nudgeX": 0.3,
      "nudgeY": 0.3,
      "size": 64 }

    var space = new GlobSpace(
      null,
      512,
      384,
      1 )

    var site = globTestSite(glob, space, "512px", "384px")
    site.start(7721)

    expectCanvasSnapshot(
      "http://localhost:7721",
      site.canvasId,
      "zoomed-out.png",
      function() {
        site.stop()
        done()})
  })


runTest("drawing globs in high resolution space",[
  "./glob-space",
  "./float-color",
  "./expect-canvas-snapshot",
  "glob-test-site"],
  function(expect, done, GlobSpace, floatColor, expectCanvasSnapshot, globTestSite) {

    var glob = {
      "color": floatColor(
        56,
        148,
        133,
        1),
      "x": 0,
      "y": 0,
      "nudgeX": 0.3,
      "nudgeY": 0.3,
      "size": 64 }

    var space = new GlobSpace(
      null,
      256,
      192,
      2)

    var site = globTestSite(glob, space, "256px", "192px")
    site.start(7722)

    expectCanvasSnapshot(
      "http://localhost:7722",
      site.canvasId,
      "high-res.png",
      function() {
        site.stop()
        done()})
  })


  //   var site = new WebSite()
  //   var bridge = new BrowserBridge()

  //   var canvas = element(
  //     "canvas",{
  //     "width": "256px",
  //     "height": "192px"},
  // }

