var library = require("module-library")(require)

module.exports = library.export(
  "warrens/crescent",[
  "web-element"],
  function (element) {

    function crescent(name, options) {

      var els = [
        crescentTemplate(name, options),
        // crescentTemplate(name+"-shadow", options, true),
      ]

      return els
    }

    var crescentTemplate = element.template(
      ".crescent",
      function(name, options, isShadow) {

        // "color": "pink"
        // "belly": 180,
        // "o'clock": 6,
        // "depth": 4,
        // "top": 1

        var transform

        var color = options.color || "red"

        if (options.depth == null) {
          var depth = 1
        } else {             
          var depth = options.depth
        }

        if (options.oclock == null) {
          var oclock = 3
        } else {
          var oclock = options.oclock
        }

        if (options.width == null) {
          var width = Math.PI/6
        } else {
          var width = options.width
        }

        var radians = oclock*Math.PI/6
        var trailingRadians = radians - width

        if (options.top != null) {
          transform = (transform||"")+" translateY("+options.top*20+"px)" 
        }

        if (options.depth) {
          transform = (transform||"")+" scale("+options.depth+")" 
        }

        if (isShadow) {
          transform = (transform||"")+" rotate(180deg) translateY(-20px) "
        }


        if (options.oclock) {
          var didPassCameraPlane = radians > Math.PI/2

          var trailDidPassCameraPlane = trailingRadians > Math.PI/2

          var dx = Math.abs(Math.sin(radians) - Math.sin(trailingRadians))

          if (trailDidPassCameraPlane) {
            var maxX = Math.sin(
              trailingRadians)

          } else if (didPassCameraPlane) {
            var maxX = 1
            dx = 1 - Math.sin(trailingRadians)

          } else {

            var maxX = Math.sin(
              radians)
          }

          var pixelWidth = dx*10/maxX
          var pixelGap = Math.max(0, (10-pixelWidth)*2)
          transform = (transform||"")+" scaleX("+maxX+")"
        }


        console.log(name, radians, pixelGap)

        debugger

        if (pixelWidth > maxX*10) {
          pixelWidth = maxX*10
        }


        pixelWidth = Math.round(pixelWidth)
        this.appendStyles({
          "left": pixelGap+"px",
          "border-right": pixelWidth+"px solid "+color})

        if (transform) {
          this.appendStyles({
            "transform": transform})
        }

        this.addSelector(
          "."+name+"-crescent")
      })

    var stylesheet = element.stylesheet([
      element.style(".crescent", {
        "border-radius": "20px",
        "width": "20px",
        "height": "20px",
        "position": "absolute",
        "transform-origin": "20px top",
      }),
    ])

    crescent.addTo = function(bridge) {
      if (bridge.remember(
        "warrens/crescent")){
        return}

      bridge.addToHead(
        stylesheet)

      bridge.see(
        "warrens/crescent",
        true)}

    crescent.testCrescents = [      
      element(
        ".voxel",
        crescent(
          "3-oclock",{
          "color": "thistle",
          "width": Math.PI/2,
          "oclock": 3,
          "depth": 2,
        })),
      element(
        "p",
        "3 o'clock"),

      element(
        ".voxel",
        crescent(
          "4-oclock",{
          "color": "plum",
          "width": Math.PI/2,
          "oclock": 4,
          "depth": 2,
        })),
      element(
        "p",
        "4 o'clock"),


      element(
        ".voxel",
        crescent(
          "5-oclock",{
          "color": "lightslategray",
          "width": Math.PI/6,
          "oclock": 5,
          "depth": 2,
        })),
      element(
        "p",
        "5 o'clock"),


      element(
        ".voxel",
        crescent(
          "7-oclock",{
          "color": "violet",
          "width": Math.PI/3,
          "oclock": 7,
          "depth": 2,
        })),
      element(
        "p",
        "7 o'clock"),
    ]

    return crescent
  }
)
