var library = require("module-library")(require)

module.exports = library.export(
  "expect-canvas-snapshot",[
  "browser-task",
  "png.js",
  "fs",
  "web-element",
  "chai"],
  function(browserTask, PNGReader, fs, element, chai) {

    function expectCanvasSnapshot(url, canvasId, name, callback) {
      var browser = browserTask(
        "http://localhost:7721",
        function() {
          browser.eval(
            function(canvasId, callback) {
              var canvas = document.getElementById(canvasId)
              var data = canvas.toDataURL()
              callback(data)
            },
            [canvasId],
            function(dataURL) {
              browser.done()
              parseSnapshot(
                name,
                callback,
                dataURL)})})}


    var actualDataURL
    var expectedDataURL

    function parseSnapshot(name, callback, dataURL) {
      actualDataURL = dataURL
      var data = dataURL.split(",")[1]
      var buffer = Buffer.from(
        data,
        "base64")
      var actualReader = new PNGReader(buffer)
      actualReader.parse(
        function(err, actualPng){
          if (err) throw err
          var path = "snapshots/"+name
          if (!fs.existsSync(path)) {
            saveSnapshot(dataURL, path)
            callback()
            return}
          fs.readFile(
            path,
            function(err, expectedBuffer) {
              if (err) {
                throw err
              }
              var expectedReader = new PNGReader(
                expectedBuffer)
              expectedDataURL = "data:image/png;base64,"+expectedBuffer.toString('base64')
              var compareToActual = compare.bind(
                null,
                name,
                callback,
                actualPng)
              expectedReader.parse(
                compareToActual)})})}

    function compare(name, callback, actualPng, err, expectedPng){
      if (err) throw err

      var actualSize = actualPng.getWidth() + '×' + actualPng.getHeight()
      var expectedSize = expectedPng.getWidth() + '×' + expectedPng.getHeight()

      var mismatches = findMismatchedPixels(
        actualPng,
        expectedPng)

      if (actualSize !== expectedSize || mismatches.length > 0) {
        dumpImageDiff(name, actualDataURL, expectedDataURL, mismatches)}

      var diffInstructions = "open snapshots/"+name+".diff.html to see the difference. Or delete snapshots/"+name+" to generate a new snapshot"

      chai.expect(actualSize, diffInstructions).to.equal(expectedSize)

      chai.expect(mismatches).to.have.lengthOf(0, diffInstructions)

      callback()}

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
              element(".instruction", "(move cursor out of canvas to see what it actually looks like)")),
            element(".actual",
              element("h2", "What \""+name+"\" actually looks like:"),
              element("img",{
                "src": actualDataURL}),
              element(".instruction", "(hover to see what we expected it to look like)")))))

      fs.writeFileSync(
        "snapshots/"+name+".diff.html",
        page.html())}

    function saveSnapshot(dataURL, path) {
      var buffer = Buffer.from(
        dataURL.split(",")[1],
        "base64")
      fs.writeFileSync(
        path,
        buffer)
      console.log(
        "📸  Saved new snapshot to "+path)}

    return expectCanvasSnapshot
  }
)