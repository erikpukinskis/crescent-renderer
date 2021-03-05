var library = require("module-library")(require)

module.exports = library.export(
  "critter",
  [library.ref(), "web-element", "bridge-module", "./glob-space", "./positioned"],
  function(lib, element, bridgeModule, GlobSpace, positioned) {

    var critter = element.template(
      "canvas.critter",
      positioned,
      element.style({
        "background": "rgba(100,0,0,0.1)",
        "border": "4px solid rgba(0,255,80,0.3)",
        "box-sizing": "border-box"}),
      function(bridge, space) {

        this.assignId()

        var globs = bridge.defineSingleton(
          "foxGlobs",
          function() {
            return []})

        var spaceBinding = this.__space = space.defineOn(bridge, "critterSpace")

        var scene = bridge.defineSingleton(
          "scene",[
          bridgeModule(
            lib,
            "./shader",
            bridge)],
          function critterScene(ShaderScene) {
            return new ShaderScene()})

        this.addAttributes({
          "width": space.getWidth()+"px",
          "height": space.getHeight()+"px"})

        defineOn(bridge)

        this.__addGlobBinding = bridge.remember(
          "critter/addGlob").
          withArgs(
            globs,
            spaceBinding,
            scene)

        this.__drawBinding = bridge.remember(
          "critter/draw").
          withArgs(
            globs,
            spaceBinding,
            scene)

        this.__setResolutionBinding = bridge.defineFunction([
            spaceBinding],
            function(space, resolution) {
              space.setResolution(resolution)
            })

        bridge.domReady([
          this.id,
          scene,
          spaceBinding],
          function initCritter(canvasId, scene, space) {
            var canvas = document.getElementById(
              canvasId)
            scene.init(
              canvas)
            space.getCanvasRect(
              canvas)})
      })

    function defineOn(bridge) {
      if (bridge.remember(
        "critter/addGlob")) {
        return }

      bridge.addToHead(
        element.stylesheet(
          critter))

      var draw = bridge.defineFunction(
        function critterDraw(globs, space, scene) {
          var points = space.getAllPixels(globs)
          scene.bufferPoints(points)
          scene.draw()})

      bridge.see(
        "critter/draw",
        draw)

      bridge.see(
        "critter/addGlob",
        bridge.defineFunction([
          draw],
          function critterAddGlob(draw, globs, space, scene, glob) {
            var copy = space.mapFrom(glob.space, glob)
            globs.push(
              copy)

            draw(
              globs,
              space,
              scene)}))}

    critter.getAddGlobBinding =
      function getAddGlobBinding(critterElement) {
        return critterElement.__addGlobBinding }

    critter.getDrawBinding =
      function getDrawBinding(critterElement) {
        return critterElement.__drawBinding }

    critter.getSetResolutionBinding =       function getSetResolutionBinding(critterElement) {
        return critterElement.__setResolutionBinding }


    critter.defineOn = defineOn

    return critter
  }
)
