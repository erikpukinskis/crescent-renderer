var runTest = require("run-test")(require)

runTest(
  "getting points in high resolution space",[
  "./glob-space", "./float-color", "browser-task", "web-site", "browser-bridge"],
  function(expect, done, GlobSpace, floatColor, browserTask, WebSite, BrowserBridge) {

    var glob = {
      "color": floatColor(
        0.2265625,
        0.296875,
        0.5703125,
        1),
      "x": 0,
      "y": 0,
      "nudgeX": 0.3,
      "nudgeY": 0.3,
      "size": 64 }

    var space = GlobSpace(
      null,
      256,
      192,
      2 )

    var site = new WebSite()
    var bridge = new BrowserBridge()

    site.addRoute("get", "/",
      bridge.requestHandler(
        'hola'))

    site.start(7721)

    var browser = browserTask(
      "http://localhost:7721",
      function() {
        browser.assertText(
          "body",
          "hola",
          browser.done,
          site.stop,
          done)})
  })
