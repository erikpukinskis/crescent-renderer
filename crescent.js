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

      var x = calculateCrescentScreenX(radians, width)
      var dx = x[1]
      var maxX = x[0]

      var remainder = dx - maxX

      if (remainder > 0) {
        dx = maxX
      }

      var crescent = element(".crescent.crescent-"+name)

      crescent.appendStyles(crescentStyles("right", dx, maxX, top, depth, radians))

      var shadow = element(".crescent.shadow-"+name)

      if (remainder > 0) {
        shadow.appendStyles(crescentStyles("left", remainder, remainder, top, depth, radians))
      } else {
        shadow.addSelector(".template")
      }

      return [crescent, shadow]
    }

    function defineUpdateOn(bridge) {

      var calc = bridge.defineFunction(calculateCrescentScreenX)
      var styles = bridge.defineFunction(crescentStyles)

      var binding = bridge.defineFunction(
        [calc, styles],
        function updateCrescent(calculateCrescentScreenX, crescentStyles, name, oclock, width, top, depth) {

          var radians = oclock*Math.PI/6

          var x = calculateCrescentScreenX(radians, width)
          var dx = x[1]
          var maxX = x[0]

          var remainder = dx - maxX

          if (remainder > 0) {
            dx = maxX
          }

          var crescent = document.querySelector(".crescent-"+name+"")

          var styles = crescentStyles("right", dx, maxX, top, depth, radians)

          crescent.style.left = styles.left
          crescent.style.top = styles.top
          crescent.style.transform = styles.transform
          crescent.style['border-right'] = styles['border-right']

          var shadow = document.querySelector(".shadow-"+name+"")

          if (remainder > 0) {
            shadow.classList.remove("template")
            styles = crescentStyles("left", remainder, remainder, top, depth, radians)

            shadow.style.left = styles.left
            shadow.style.top = styles.top
            shadow.style.transform = styles.transform
            shadow.style['border-right'] = styles['border-right']

          } else {
            shadow.classList.add("template")
          }
        }
      )

      return binding
    }

    function logFields(values) {
      var out = ""
      for(var i=0; i<values.length; i++) {
        var value = values[i]

        if (typeof value == "number") {
          value = value.toFixed(2)
        } else {
          value = value.slice(0, 15)
        }
        var pad = new Array(15 - value.length).join(" ")
        out += value + pad
      }
      console.log(out)
    }

    function calculateCrescentScreenX(radians, width) {
      var trailingRadians = radians - width

      var didPassCameraPlane = radians > Math.PI/2

      var trailDidPassCameraPlane = trailingRadians > Math.PI/2

      var didPassObserverLine = radians > Math.PI

      var dx = Math.abs(Math.sin(radians) - Math.sin(trailingRadians))

      if (didPassObserverLine) {
        debugger
        var maxX = Math.sin(
          trailingRadians)

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

      return [maxX, dx]
    }

    function crescentStyles(hemisphere, dx, maxX, top, depth, radians) {

      var transform

      var specular = Math.sin(radians/2-0.2)

      var baseColor = [300, 40, 60]
      var color = [300, Math.round(40+60*specular)+"%", Math.round(60+36*specular)+"%"]

      color = "hsl("+color.join(",")+")"

      if (hemisphere == "left") {
        var flipFactor = -20*depth
        transform = (transform||"")+" rotate(180deg) translateY("+flipFactor+"px) "
      }

      if (top) {
        transform = (transform||"")+" translateY("+top*20+"px)" 
      }

      if (depth) {
        transform = (transform||"")+" scale("+depth+")" 
      }

      var left = (maxX - dx)*10*depth

      var borderWidth = dx*10/maxX

      borderWidth = Math.round(borderWidth)

      transform = (transform||"")+" scaleX("+maxX+")"

      return {
        "left": left+"px",
        "border-right": borderWidth+"px solid "+color,
        "transform": transform
      }
    }

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

    crescent.defineUpdateOn = defineUpdateOn

    return crescent
  }
)
