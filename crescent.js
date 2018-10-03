var library = require("module-library")(require)

module.exports = library.export(
  "warrens/crescent",[
  "web-element"],
  function (element) {

    function crescent(name, options) {

        var depth = options.depth
        var top = options.top
        var width = options.width
        var oclock = options.oclock
        var radians = oclock*Math.PI/6
        var trailingRadians = radians - width
        var specular = Math.sin(radians/2-0.2)

        var baseColor = [300, 40, 60]
        var color = [300, 40+60*specular+"%", 60+30*specular+"%"]

        color = "hsl("+color.join(",")+")"


        // if (isShadow) {
        //   transform = (transform||"")+" rotate(180deg) translateY(-20px) "
        // }


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

      var els = [
        crescentTemplate(name, dx, maxX, top, depth, color),
        // crescentTemplate(name+"-shadow", dx, maxX, color),
      ]

      return els
    }

    var crescentTemplate = element.template(
      ".crescent",
      function(name, dx, maxX, top, depth, color) {
        var transform

        if (top) {
          transform = (transform||"")+" translateY("+options.top*20+"px)" 
        }

        if (depth) {
          transform = (transform||"")+" scale("+depth+")" 
        }

        var pixelWidth = dx*10/maxX
        var pixelGap = Math.max(0, (10-pixelWidth)*2)
        transform = (transform||"")+" scaleX("+maxX+")"

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
