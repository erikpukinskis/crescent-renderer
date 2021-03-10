var runTest = require("run-test")(require)


runTest(
  "drawing globs",[
  runTest.library.ref(),
  "./glob-space",
  "./float-color",
  "browser-task",
  "web-site",
  "browser-bridge",
  "web-element",
  "./expect-canvas-snapshot"],
  function(expect, done, lib, GlobSpace, floatColor, browserTask, WebSite, BrowserBridge, element, expectCanvasSnapshot) {

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

    var site = new WebSite()
    var bridge = new BrowserBridge()

    var canvas = element(
      "canvas",{
      "width": "512px",
      "height": "384px"},
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

    site.start(7721)

    expectCanvasSnapshot(
      "http://localhost:7721",
      canvas.id,
      "zoomed-out.png",
      function() {
        site.stop()
        done()})
  })


runTest("drawing globs in high resolution space")

  //   var space = new GlobSpace(
  //     null,
  //     256,
  //     192,
  //     2 )

  //   var site = new WebSite()
  //   var bridge = new BrowserBridge()

  //   var canvas = element(
  //     "canvas",{
  //     "width": "256px",
  //     "height": "192px"},
  // }
