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
  "png.js",
  "fs"],
  function(expect, done, lib, GlobSpace, floatColor, browserTask, WebSite, BrowserBridge, element, PNGReader, fs) {

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

        scene.draw()})

    bridge.domReady(draw)

    site.addRoute("get", "/",
      bridge.requestHandler(
        canvas))

    site.start(7721)

    done.failAfter(1000*60*5)

    var browser = browserTask(
      "http://localhost:7721",
      function() {
        browser.eval(
          function(canvasId, callback) {
            var canvas = document.getElementById(canvasId)
            callback(canvas.toDataURL())
          },
          [canvas.id],
          parseActual)})

    var actualDataURL
    var expectedDataURL
    function parseActual(dataURL) {
      actualDataURL = dataURL
      var name = "zoomed-out"
      var data = dataURL.split(",")[1]
      var buffer = Buffer.from(
        data,
        "base64")
      var actualReader = new PNGReader(buffer)
      actualReader.parse(
        function(err, actualPng){
          if (err) throw err
          fs.readFile(
            "snapshots/"+name+".png",
            function(err, expectedBuffer) {
              if (err) throw err
              var expectedReader = new PNGReader(
                expectedBuffer)
              expectedDataURL = "data:image/png;base64,"+expectedBuffer.toString('base64')
              var compareToActual = compare.bind(
                null,
                name,
                actualPng)
              expectedReader.parse(
                compareToActual)})})}

    function compare(name, actualPng, err, expectedPng){
      if (err) throw err

      var actualSize = actualPng.getWidth() + '×' + actualPng.getHeight()
      var expectedSize = expectedPng.getWidth() + '×' + expectedPng.getHeight()

      var mismatches = findMismatchedPixels(
        actualPng,
        expectedPng)

      if (actualSize !== expectedSize || mismatches.length > 0) {
        dumpImageDiff(name, actualDataURL, expectedDataURL, mismatches)}

      var diffInstructions = "open snapshots/"+name+".diff.html to see the difference"

      expect(actualSize, diffInstructions).to.equal(expectedSize)

      expect(mismatches).to.have.lengthOf(0, diffInstructions)

      // saveSnapshot(dataURL)
      browser.done()
      site.stop()
      done()}

    function findMismatchedPixels(actualPng, expectedPng) {
      var width = actualPng.getWidth()
      var height = actualPng.getHeight()
      var mismatches = []

      for(x=0; x<width; x++) {
        for(y=0; y<height; y++) {
          if (pixelsMatch(
            actualPng.getPixel(
              x,
              y),
            expectedPng.getPixel(
              x,
              y))) {
            continue }

          mismatches.push([x,y])}}

      return mismatches}

    function pixelsMatch(a, b) {
      for(i=0; i<4; i++) {
        if (a[i] === b[i]) {
          continue}
        return false}
      return true}

    function dumpImageDiff(name, actualDataURL, expectedDataURL, mismatches) {

      var hover = element.template.container(
        ".hover",
        element.style({
          "display": "inline-block",
          "margin-top": "3em",
          " h2": {
            "line-height": "1em",
            "margin": "-2em 0 1em 0",
          },
          " .instruction": {
            "line-height": "1em",
            "margin": "1em 0 -2em 0",
          },
          " .actual": {
            "display": "inline-block",
            "border": "1px solid gray"
          },
          " .expected": {
            "display": "none",
            "border": "1px solid gray"
          },
          ":hover .actual": {
            "display": "none"
          },
          ":hover .expected": {
            "display": "inline-block",
          }
        }))

      var page = element("html",
        element("head",
          element.stylesheet(hover)),
        element("body",
          hover(
            element(".expected",
              element("h2", "What we expected \""+name+"\" to look like:"),
              element("img",{
                "src": expectedDataURL}),
              element(".instruction", "(hover to see what it actually looks like)")),
            element(".actual",
              element("h2", "What \""+name+"\" actually looks like:"),
              element("img",{
                "src": actualDataURL}),
              element(".instruction", "(hover to see what we expected it to look like)")))))

      fs.writeFileSync(
        "snapshots/"+name+".diff.html",
        page.html())}

    function saveSnapshot(dataURL) {
      var buffer = Buffer.from(dataURL.split(",")[1], 'base64')
      fs.writeFileSync('snapshots/zoomed-out.png', buffer)
    }
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

