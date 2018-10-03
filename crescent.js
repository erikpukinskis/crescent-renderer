var library = require("module-library")(require)

module.exports = library.export(
  "warrens/crescent",[
  "web-element"],
  function (element) {

    logFields(["name", "dx", "maxX", "top", "depth", "color"])

    function crescent(name, options) {

        var depth = options.depth
        var top = options.top
        if (top == null) { top = 0 }
        var width = options.width
        var oclock = options.oclock
        var radians = oclock*Math.PI/6
        var trailingRadians = radians - width
        var specular = Math.sin(radians/2-0.2)

        var baseColor = [300, 40, 60]
        var color = [300, Math.round(40+60*specular)+"%", Math.round(60+30*specular)+"%"]

        color = "hsl("+color.join(",")+")"


        // if (isShadow) {
        //   transform = (transform||"")+" rotate(180deg) translateY(-20px) "
        // }


        var didPassCameraPlane = radians > Math.PI/2

        var trailDidPassCameraPlane = trailingRadians > Math.PI/2

        var didPassObserverLine = radians > Math.PI

        var dx = Math.abs(Math.sin(radians) - Math.sin(trailingRadians))

        if (didPassObserverLine) {
          debugger
          var maxX = Math.sin(
            trailingRadians)
          dx = maxX
        } else if (trailDidPassCameraPlane) {
          var maxX = Math.sin(
            trailingRadians)

        } else if (didPassCameraPlane) {
          var maxX = 1
          dx = 1 - Math.sin(trailingRadians)

        } else {

          var maxX = Math.sin(
            radians)
        }

      logFields([name, dx, maxX, top, depth, color])


      var els = [
        crescentTemplate(name, dx, maxX, top, depth, color),
        // crescentTemplate(name+"-shadow", dx, maxX, color),
      ]

      return els
    }

    function logFields(values) {
      var out = ""
      for(var i=0; i<values.length; i++) {
        var value = values[i]

        if (typeof value == "number") {
          value = value.toFixed(1)
        } else {
          value = value.slice(0, 15)
        }
        var pad = new Array(15 - value.length).join(" ")
        out += value + pad
      }
      console.log(out)
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

        var left = (maxX - dx)*10*depth

        if (dx > maxX) {
          var borderWidth = maxX*10/maxX
        } else {
          var borderWidth = dx*10/maxX
        }
        borderWidth = Math.round(borderWidth)

        transform = (transform||"")+" scaleX("+maxX+")"

        this.appendStyles({
          "left": left+"px",
          "border-right": borderWidth+"px solid "+color})

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
