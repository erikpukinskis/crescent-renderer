var library = require("module-library")(require)

// flowers look like this: https://youtu.be/GbWMw249xY8?t=496

library.using([
  "browser-bridge",
  "web-site",
  "web-element",
  "bridge-module",
  "./shader",
  "basic-styles"],
  function(BrowserBridge, WebSite, element, bridgeModule, _, basicStyles) {

    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)
    var site = new WebSite()

    baseBridge.addToHead(
      element.stylesheet(
        element.style(
          "body",{
            "margin": "0"})))

    const canvasId = element.anId()

    const scene = baseBridge.defineSingleton(
      'scene',[
      canvasId,
      bridgeModule(
        library,
        "./shader",
        baseBridge)],
      function(canvasId, ShaderScene) {
        return new ShaderScene()
      })

    baseBridge.domReady([
      canvasId,
      scene],
      function initScene(canvasId, scene) {
        var canvas = document.getElementById(
          canvasId)
        scene.init(canvas)})

    var ZOOM = 1
    var GLOB_SIZE = 64/ZOOM
    var CANVAS_WIDTH = 8*ZOOM
    var CANVAS_HEIGHT = 6*ZOOM

    var canvasWidthInPixels = CANVAS_WIDTH * GLOB_SIZE
    var canvasHeightInPixels = CANVAS_HEIGHT * GLOB_SIZE

    const globs = baseBridge.defineSingleton(
      [GLOB_SIZE],
      function(GLOB_SIZE) {
        function Globs() {
          this.globs = []}

        Globs.prototype.activeGlob = function() {
          if (this.activeGlobIndex != null) {
            return this.globs[
              this.activeGlobIndex]}}

        Globs.prototype.start = function(rectX,rectY) {
          this.activeGlobIndex = this.globs.length
          this.activeGlobStartRectX = rectX
          this.activeGlobStartRectY = rectY
          this.globs.push({
            "x": Math.floor(rectX/GLOB_SIZE),
            "y": Math.floor(rectY/GLOB_SIZE),
            "nudgeX": 0,
            "nudgeY": 0})}

        Globs.prototype.nudge = function(rectX,rectY) {
          var dx = rectX - this.activeGlobStartRectX
          var dy = rectY - this.activeGlobStartRectY

          this.globs[this.activeGlobIndex].nudgeX = dx/GLOB_SIZE
          this.globs[this.activeGlobIndex].nudgeY = dy/GLOB_SIZE}

        Globs.prototype.end = function() {
          this.activeGlobIndex = undefined
          console.log("new glob!", this.globs)}

        return new Globs()})

    var globXToCanvasX = baseBridge.defineFunction(
      [GLOB_SIZE, canvasWidthInPixels],
      function globXToCanvasX(GLOB_SIZE, canvasWidthInPixels, globs) {
        var pixels = globs * GLOB_SIZE
        pixels = pixels + GLOB_SIZE
        var canvasX = 2*pixels/canvasWidthInPixels - 1
        return canvasX
      })

    var globYToCanvasY = baseBridge.defineFunction(
      [GLOB_SIZE, canvasHeightInPixels],
      function globYToCanvasY(GLOB_SIZE, canvasHeightInPixels, globs) {
        var pixels = globs * GLOB_SIZE
        pixels = pixels + GLOB_SIZE
        var canvasX = -2*pixels/canvasHeightInPixels + 1
        return canvasX
      })

    var brushDown = baseBridge.defineFunction([
      scene,
      globs],
      function(scene, globs, event) {
        globs.start(
          event.getRectX(),
          event.getRectY())
      })

    var brushUp = baseBridge.defineFunction([
      scene,
      globs],
      function(scene, globs, event) {
        globs.end()
      })


    var mouseMove = baseBridge.defineFunction([
      scene,
      globs,
      globXToCanvasX,
      globYToCanvasY],
      function handleMouseMove(scene, globs, globXToCanvasX, globYToCanvasY, event) {

        var x
        var y

        var activeGlob = globs.activeGlob()
        if (activeGlob) {
          globs.nudge(
            event.getRectX(),
            event.getRectY())
          x = activeGlob.x + activeGlob.nudgeX
          y = activeGlob.y + activeGlob.nudgeY
        } else {
          x = event.getGlobX()
          y = event.getGlobY()
        }

        var coordinates = new Float32Array([
          globXToCanvasX(
            x - 1),
          globYToCanvasY(
            y),

          globXToCanvasX(
            x - 1),
          globYToCanvasY(
            y - 1),

          globXToCanvasX(
            x),
          globYToCanvasY(
            y),

          globXToCanvasX(
            x),
          globYToCanvasY(
            y - 1),
        ])

        scene.setCoordinates(coordinates)
        scene.draw()})

    var canvasEvent = baseBridge.defineFunction(
      [canvasId, canvasWidthInPixels, canvasHeightInPixels, GLOB_SIZE],
      function canvasEvent(canvasId, canvasWidthInPixels, canvasHeightInPixels, GLOB_SIZE, callback, mouseEvent) {

        var rect

        function getRect() {
          if (!rect) {
            var canvas = document.getElementById(
            canvasId)
            var gl = canvas.getContext(
              'experimental-webgl')
            rect = gl.canvas.getBoundingClientRect()}
          return rect}


        function CanvasEvent(mouseEvent) {
          this._event = mouseEvent
        }


        CanvasEvent.prototype.getRectX = function() {
          return this._event.clientX - getRect().left
        }

        CanvasEvent.prototype.getRectY = function() {
          return this._event.clientY - getRect().top
        }

        CanvasEvent.prototype.getGlobX = function() {
          return Math.floor(this.getRectX()/GLOB_SIZE)
        }

        CanvasEvent.prototype.getGlobY = function() {
          return Math.floor(this.getRectY()/GLOB_SIZE)
        }

        const canvasEvent = new CanvasEvent(mouseEvent)

        callback(canvasEvent)
      })

    var setBrushVisible = baseBridge.defineFunction([
      scene],
      function(scene, isVisible) {
        scene.setBrushVisible(isVisible)
        scene.draw()})

    var canvas = element.template(
      "canvas.canvas",{
      "id": canvasId,
      "onmousemove": canvasEvent.withArgs(
        mouseMove, BrowserBridge.event).evalable(),
      "onmousedown": canvasEvent.withArgs(brushDown, BrowserBridge.event).evalable(),
      "onmouseup": canvasEvent.withArgs(brushUp, BrowserBridge.event).evalable(),
      "onmouseout": setBrushVisible.withArgs(
        false)
        .evalable(),
      "onmouseenter": setBrushVisible.withArgs(
        true)
        .evalable()},
      element.style({
        "position": "absolute",
        "background": "rgba(0,0,0,0.05)",
        "border": "none"}),
      function() {
        this.addAttributes({
          "width": canvasWidthInPixels+"px",
          "height": canvasHeightInPixels+"px"})})

    var drawable = canvas()

    var colorButton = element.template(
      "button.swatch",
      element.style({
        "width": GLOB_SIZE+"px",
        "height": GLOB_SIZE+"px",
        "margin-right": "4px",
        "border": "none",
        "opacity": "0.6",
      }),
      function(r,g,b) {
        var color = new Float32Array([
          r/256,
          g/256,
          b/256,
          0.4])
        var rgba = colorToRgba(color)
        function colorToRgba(color) {
          return color.map(
            function(component) {
              return Math.floor(
                component*256)})
                .join(
                  ",")}
        this.appendStyles({
          "background": "rgba("
            +rgba+")"})
        this.addAttributes({
          "onclick": brush.methodCall(
            "pickColor")
            .withArgs(
              color)
              .evalable()})})

    var setQueryParam = baseBridge.defineFunction(
      function setQueryParam(key, value) {
        var params = new URLSearchParams(
          document.location.search)
        params.set(key, value)
        history.replaceState(
          null,
          null,
          "?"+params.toString())})

    var getQueryParam = baseBridge.defineFunction(
      function getQueryParam(key, sanitize) {
        var params = new URLSearchParams(
          document.location.search)
        var string = params.get(
          key)
        if (sanitize) {
          return sanitize(string)
        } else {
          return string}})

    var brush = baseBridge.defineSingleton(
      [scene, setQueryParam],
      function(scene, setQueryParam) {
        function Brush() {}
        Brush.prototype.pickColor = function(color) {
          setQueryParam("color", color.join('**'))
          scene.setBrushColor(
            color)
          scene.draw()}
        return new Brush()})

    baseBridge.addToHead(
      element.stylesheet(
        canvas,
        colorButton))

    baseBridge.addToHead(
      element(
        "title",
        "Hi!"))

    var tracer = element.template(
      ".tracer",
      "img",{
      "src": "/trace"},
      element.style({
        "transform-origin": "top left",
        "position": "absolute"}),
      function(zoomLevel) {
        this.assignId()
        if (!zoomLevel) {
          return }
        this.appendStyles({
          "transform": getZoomTransform(
            zoomLevel)})})

    baseBridge.addToHead(
      element.stylesheet([
        tracer]))

    function getZoomTransform(zoomLevel) {
      var scale
        if (zoomLevel == 0) {
          scale = 1}
        if (zoomLevel < 0) {
          scale = -1/(zoomLevel-1)
        } else {
          scale = 1*(zoomLevel+1)
        }
        return "scale("+scale+")"}

    var zoomBy = baseBridge.defineFunction(
      [getQueryParam, setQueryParam, getZoomTransform],
      function zoomBy(getQueryParam, setQueryParam, getZoomTransform, elementId, zoomIncrement) {
        var zoomLevel = getQueryParam("zoom", parseInt) || 0
        zoomLevel += zoomIncrement
        var element = document.getElementById(
            elementId)
        element.style.transform = getZoomTransform(zoomLevel)
        setQueryParam(
          "zoom",
          zoomLevel)})

    var zoomButton = element.template(
      "button",
      function(elementId, zoomIncrement) {
        var zoom = zoomBy.withArgs(
            elementId,
            zoomIncrement)
        var direction = zoomIncrement > 0 ? "In" : "Out"
        this.addChild("Zoom "+direction)
        this.addAttributes({
          "onclick": zoom.evalable()})})

    var swatches = [
      colorButton(
        56,
        148,
        133),
      colorButton(
        58,
        76,
        146),
      colorButton(
        160,
        44,
        114),
      colorButton(
        35,
        190,
        14),
      colorButton(
        150,
        219,
        138)]

    site.addRoute(
      "get",
      "/flurble",
      function(request, response) {
        var zoomLevel = request.query.zoom
        var colorParam = request.query.color
        var color = new Float32Array(colorParam.split("**"))
        var bridge = baseBridge.forResponse(
          response)
        var tracingImage = tracer(zoomLevel)

        if (color.length === 4) {
          bridge.domReady(
            scene.methodCall(
              "setBrushColor")
              .withArgs(
                color))}

        bridge.send([
          element(
          "p",[
            zoomButton(
              tracingImage.id,
              1),
            " ",
            zoomButton(
              tracingImage.id,
              -1)]),
          element(
            "p",
            swatches),
          element("br"),
          tracingImage,
          drawable])})

    site.addRoute(
      "get",
      "/trace",
      site.sendFile(__dirname, 'art', 'fox cycle 31 TRACE + ear + 07.25.png'))

    site.start(
      8221)})
