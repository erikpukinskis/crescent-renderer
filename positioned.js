var library = require("module-library")(require)

module.exports = library.export(
  "warrens/positioned",[
  "web-element"],
  function(element) {

    var positioned = element.template(
      ".positioned",
      element.style({
        "transform-origin": "top left",
        "position": "absolute"}))

    positioned.moveTo = function moveTo(element, scale) {
      element.appendStyles({
        "transform": "scale("+scale+")"})}

    return positioned
  }
)