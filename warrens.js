var library = require("module-library")(require)

library.using([
	"browser-bridge",
	"web-site",
	"web-element"],
	function(BrowserBridge, WebSite, element) {


		var bridge = new BrowserBridge

		var stylesheet = element.stylesheet([
			element.style(".key", {
				"background": "#223",
				"border-radius": "3px",
				"display": "inline-block",
				"width": "4em",
				"height": "2.5em",
				"text-align": "center",
				"color": "#eff",
				"line-height": "2.8em",
				"font-size": "8px",
				"border-top": "2px solid #667",
				"border-left": "1px solid black",
				"border-bottom": "2px solid black",
				"border-right": "1px solid #446",
				"vertical-align": "middle",
				"margin-right": "1em",
			}),
			element.style("body", {
				"font-family": "sans-serif",
				"color": "#538",
			}),
			element.style("h1", {
				"font-size": "1em",
			}),
			element.style("p", {
				"left": "20px",
				"top": "80px",
				"display": "block",
			}),
			element.style(".feather", {
				"position": "absolute",
			}),

			element.style(".neck-feather", {
				"left": "100px",
				"top": "100px",
			}),
			element.style(".wing-feather", {
				"left": "50px",
				"top": "150px",
			}),
			element.style(".back-wing-feather", {
				"left": "120px",
				"top": "140px",
			}),
			element.style(".tail-feather", {
				"left": "120px",
				"top": "240px",
			}),

		element.style(".crescent", {
				"border": "5px solid red",
				"border-left": "none",
				"border-bottom": "none",
				"border-top": "none",
				"border-radius": "20px",
				"width": "20px",
				"height": "20px",
				"position": "absolute",
			}),
			element.style(".feather-top", {
				"left": "27px",
			    "top": "53px",
			    "transform": "rotate(-6deg) scaleY(2.0)",
			    "border-width": "4px",
			}),
			element.style(".feather-bottom", {
				"border-width": "5px",
		    	"left": "41px",
		   		"top": "71px",
		   	    "transform": "rotate(-191deg) scaleY(0.8) scaleX(0.6)",
		   	})
		 ])


		bridge.addToHead(stylesheet)

		var crescent = element.template(
			".crescent",
			function(options) {

				// "color": "pink"
				// "belly": 180,
				// "o'clock": 6,
				// "depth": 4,

				if (options.color) {
					this.appendStyles({
						"border-color": options.color})}
			})

		var page = [
			element("h1", "feathers!"),
			element(
				"p",
				element("span.key", "&#9664;"),
				"move neck feather left"),
			element(
				"p",
				element("span.key", "&#9654;"),
				"move neck feather right"),
			element(
				".feather.neck-feather",
				element(".crescent.feather-top"),
				element(".crescent.feather-bottom")),
			crescent({
				"color": "pink"
				"belly": 180,
				"o'clock": 6,
				"depth": 4,
			}),
			element(
				".feather.belly",
				element(".crescent.belly"),
				element(".crescent.feather-bottom")),
			element(
				".feather.wing-feather",
				element(".crescent.feather-top"),
				element(".crescent.feather-bottom")),
			element(
				".feather.back-wing-feather",
				element(".crescent.feather-top"),
				element(".crescent.feather-bottom")),
			element(
				".feather.tail-feather",
				element(".crescent.feather-top"),
				element(".crescent.feather-bottom")),
		]


		var press = bridge.defineSingleton(
			function() {

				function press(event) {
					var d
					if (event.key == "ArrowRight") {
						d = 1
					} else if (event.key == "ArrowLeft") {
						d = -1
					}
					moveSelectedFeather(d)
				}

				var featherNode
				var feathers = {
					"neck-feather": {
						"left": 100,
						"top": 100,
					}
				}
				var feather

				function moveSelectedFeather(d) {
					if (!featherNode) {
						featherNode = document.querySelector(".neck-feather")
						feather = feathers["neck-feather"]
					}

					feather.left += d
					featherNode.style.left = feather.left+"px"
				}

				return press})

		var body = element(
			"body",{
			"onkeydown": press.withArgs(
				bridge.event)
				.evalable()},
			page)

		var site = new WebSite()
		site.start(8211)

		site.addRoute(
			"get",
			"/",
			bridge.requestHandler(body))


		// yay
	}
)
