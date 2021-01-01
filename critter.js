var library = require("module-library")(require)

module.exports = library.export(
  "critter",
  [library.ref(), "web-element", "bridge-module"],
  function(lib, element, bridgeModule) {

    var critter = element.template(
      "canvas.critter",
      element.style({
        "position": "absolute",
        "background": "rgba(100,0,0,0.1)",
        "border": "none"}),
      function(bridge, parentSpace, width, height) {

        this.assignId()

        var globs = bridge.defineSingleton(
          "foxGlobs",
          function() {
            return []})

        var space = bridge.defineSingleton(
          "fox",[
          bridgeModule(
            lib,
            "./glob-space",
            bridge),
          parentSpace],
          function(GlobSpace, parentSpace) {
            return new GlobSpace(
              parentSpace)})

        var scene = bridge.defineSingleton(
          'scene',[
          bridgeModule(
            lib,
            "./shader",
            bridge)],
          function critterScene(ShaderScene) {
            return new ShaderScene()})

        this.addAttributes({
          "width": width+"px",
          "height": height+"px"})

        defineOn(bridge)

        this.__addGlobBinding = bridge.remember(
          "warrens/addGlob").
          withArgs(
            globs,
            space,
            scene)

        bridge.domReady([
          this.id,
          scene,
          space],
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
        "warrens/addGlob")) {
        return }

      bridge.addToHead(
        element.stylesheet(
          critter))

      bridge.see(
        "warrens/addGlob",
        bridge.defineFunction(
        function addGlob(globs, space, scene, glob) {
          globs.push(glob)
          var points = space.getAllPixels(globs)
          scene.bufferPoints(points)
          scene.draw()}))
    }

    critter.getAddGlobBinding =
      function getAddGlobBinding(critterElement) {
        return critterElement.__addGlobBinding }

    critter.defineOn = defineOn

    return critter
  }
)
