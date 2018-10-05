var library = require("module-library")(require)

module.exports = library.export(
  "warrens/crescent",[
  "web-element"],
  function (element) {

    logFields(["name", "dx", "maxX", "top", "depth", "color"])

    function crescent(options) {

      var name = options.name
      var depth = options.depth
      var top = options.top
      if (top == null) { top = 0 }
      var width = options.width
      var height = options.height
      var oclock = options.oclock
      oclock = oclock - parseFloat(Math.floor(oclock/12)*12)
      var radians = oclock*Math.PI/6

      var data = calculateCrescentScreenX(radians, width)

      var crescent = element(".crescent.crescent-"+name)

      if (data.rightHandDx > 0) {
        crescent.appendStyles(crescentStyles(data.rightHandDx, data.maxX, top, depth, data.normal, height))
      } else {
        crescent.addSelector(".template")
      }

      var shadow = element(".crescent.shadow-"+name)

      if (data.leftHandDx) {
        shadow.appendStyles(crescentStyles(data.leftHandDx, data.minX, top, depth, data.normal, height))

      } else {
        shadow.addSelector(".template")
      }

      return [crescent, shadow]
    }

    function calculateCrescentScreenX(radians, width) {
      var trailingRadians = radians - width

      var radiansAtPeak = Math.asin(1)
      var radiansAtTrough = radiansAtPeak + Math.PI

      var sin = Math.sin(radians)
      var trailingSin = Math.sin(trailingRadians)

      var normal  = radians - width/2

      if (radians >= radiansAtPeak && trailingRadians < radiansAtPeak) {
        var maxX = 1
        var minX = Math.min(sin, trailingSin)

      } else if (trailingRadians >= radiansAtPeak && radians < radiansAtTrough) {
        var maxX = Math.sin(trailingRadians)
        var minX = Math.sin(radians)

      } else if (radians >= radiansAtTrough && trailingRadians < radiansAtTrough) {
        var maxX = Math.max(sin, trailingSin)
        var minX = -1

      } else if (radians >= radiansAtTrough && trailingRadians >= radiansAtTrough) {
        var maxX = sin
        var minX = trailingSin

      } else if (radians < radiansAtPeak && trailingRadians < radiansAtTrough) {
        var maxX = sin
        var minX = trailingSin

      } else {
        throw new Error("mathematically impossible!")
      }

      var data = {
        minX: minX,
        maxX: maxX,
        normal: normal}

      if (maxX > 0) {
        if (minX < 0) {
          data.rightHandDx = maxX 
        } else {
          data.rightHandDx = maxX - minX}}

      if (minX < 0) {
        if (maxX > 0) {
          data.leftHandDx = minX
        } else {
          data.leftHandDx = minX - maxX}}

      return data
    }

    function crescentStyles(dx, outsideX, top, depth, normal, height) {

      var transform

      var specular = (Math.sin((normal+0.5)*2)+1)/2
      specular = specular*specular*specular
      var baseColor = [300, 40, 60]
      var color = [300, Math.round(40+40*specular)+"%", Math.round(60+12*specular)+"%"]
      color = "hsl("+color.join(",")+")"
      var isLefty = dx < 0

      if (isLefty) {
        var flipFactor = -20*depth
        transform = (transform||"")+" rotate(180deg) translateY("+flipFactor+"px) "
        dx = Math.abs(dx)
        outsideX = Math.abs(outsideX)
      }

      if (top) {
        transform = (transform||"")+" translateY("+top*20+"px)" 
      }

      if (depth) {
        transform = (transform||"")+" scale("+depth+")" 
      }

      var heightDisplacement = Math.sin(normal)*height * 20

      var left = (outsideX - dx) * 10 * depth

      if (isLefty) {
        left = -1*left
      }

      left += heightDisplacement

      var borderWidth = dx*10/outsideX

      transform = (transform||"")+" scaleX("+outsideX+")"

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

    function defineUpdateOn(bridge) {

      var calc = bridge.defineFunction(calculateCrescentScreenX)
      var styles = bridge.defineFunction(crescentStyles)

      var binding = bridge.defineFunction(
        [calc, styles],
        function updateCrescent(calculateCrescentScreenX, crescentStyles, options) {

          var oclock = options.oclock
          oclock = oclock - parseFloat(Math.floor(oclock/12)*12)
          var radians = oclock*Math.PI/6
          var data = calculateCrescentScreenX(radians, options.width)
          var crescent = document.querySelector(".crescent-"+options.name+"")
          var shadow = document.querySelector(".shadow-"+options.name+"")

          if (data.rightHandDx) {
            crescent.classList.remove("template")
            copyStyles(
              crescentStyles(data.rightHandDx, data.maxX, options.top, options.depth, data.normal, options.height),
              crescent)
          } else {
            crescent.classList.add("template")
          }

          if (data.leftHandDx) {
            shadow.classList.remove("template")
            copyStyles(
              crescentStyles(data.leftHandDx, data.minX, options.top, options.depth, data.normal, options.height),
              shadow)
          } else {
            shadow.classList.add("template")
          }

          function copyStyles(styles, node) {
            node.style.left = styles.left
            node.style.top = styles.top
            node.style.transform = styles.transform
            node.style['border-right'] = styles['border-right']
          }

        }
      )

      return binding
    }

    crescent.clockCrescents = [      

      element(
        ".voxel",
        crescent({
          "name": "3-oclock",
          "width": Math.PI/2,
          "oclock": 3,
          "depth": 2,
        })),
      element(
        "p",
        "3 o'clock, back 3 hours"),

      element(
        ".voxel",
        crescent({
          "name": "4-oclock",
          "width": Math.PI/2,
          "oclock": 4,
          "depth": 2,
        })),
      element(
        "p.label-4-oclock",
        "4 o'clock, back 3 hours"),

      element(
        ".voxel",
        crescent({
          "name": "5-oclock",
          "width": Math.PI/6,
          "oclock": 5,
          "depth": 2,
        })),
      element(
        "p",
        "5 o'clock, back 1 hour"),

      element(
        ".voxel",
        crescent({
          "name": "7-oclock",
          "width": Math.PI/3,
          "oclock": 7,
          "depth": 2,
        })),
      element(
        "p",
        "7 o'clock, back two hours"),

      element(
        ".voxel",
        crescent({
          "name": "9-oclock",
          "width": Math.PI/3,
          "oclock": 9,
          "depth": 2,
        })),
      element(
        "p.label-4-oclock",
        "9 o'clock, back 2 hours"),

    ]


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

    crescent.defineUpdateOn = defineUpdateOn

    return crescent
  }
)
