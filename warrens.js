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
				"border-radius": "20px",
				"width": "20px",
				"height": "20px",
				"position": "absolute",
				"transform-origin": "20px top",
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
			function(name, options) {

				// "color": "pink"
				// "belly": 180,
				// "o'clock": 6,
				// "depth": 4,
				// "top": 1

				var transform
				var color = options.color || "red"
				this.appendStyles({
					"border-right": "10px solid "+color})				
				var depth = options.depth || 1

				if (options.top) {
					transform = (transform||"")+" translateY("+options.top*20+"px)" 
				}

				if (options.depth) {
					transform = (transform||"")+" scale("+options.depth+")" 
				}

				if (transform) {
					this.appendStyles({
						"transform": transform})
				}

				this.addSelector(
					"."+name+"-crescent")})

		var key = element.template(
			"span.key",
			function(name) {
				var character = {
					"left": "&#9664;",
					"up": "&#9650;",
					"down": "&#9660;",
					"right": "&#9654;"}
				this.addChild(
					character[name] || name)})

		var page = [
			element(
				"h1",
				"feathers!"),
			element(
				"p",
				key(
					"up"),
				"move belly up"),
			element(
				"p",
				key(
					"down"),
				"move belly down"),
			element(
				".feather.neck-feather",
				element(
					".crescent.feather-top"),
				element(
					".crescent.feather-bottom")),

			element(
				".bird",
				element.style({
					"position": "absolute",
					"left": "200px",
					"top": "100px",
				}),
				crescent(
					"back",{
					"color": "pink",
					"belly": 180,
					"o'clock": 6,
					"depth": 4,
				}),
				crescent(
					"belly",{
					"color": "palevioletred",
					"belly": 180,
					"o'clock": 6,
					"depth": 2,
					"top": 1,
				})),
			element(
				".feather.belly",
				element(
					".crescent.belly"),
				element(
					".crescent.feather-bottom")),
			element(
				".feather.wing-feather",
				element(
					".crescent.feather-top"),
				element(
					".crescent.feather-bottom")),
			element(
				".feather.back-wing-feather",
				element(
					".crescent.feather-top"),
				element(
					".crescent.feather-bottom")),
			element(
				".feather.tail-feather",
				element(
					".crescent.feather-top"),
				element(
					".crescent.feather-bottom")),
		]


		var press = bridge.defineSingleton(
			"press",
			function() {

				var belly = {
					"top": 1.0,
				}

				function press(event) {
					var dx
					var dy
					if (event.key == "ArrowRight") {
						dx = 1
					} else if (event.key == "ArrowLeft") {
						dx = -1
					} else if (event.key == "ArrowUp") {
						dy = -1
					} else if (event.key == "ArrowDown") {
						dy = 1
					} else {
						return
					}
					event.preventDefault()
					moveBelly(dy)
				}

				function moveBelly(d) {
					var bellyNode = document.querySelector(".belly-crescent")

					belly.top += d/20

					bellyNode.style.transform = "translateY("+belly.top*20+"px) scale(2)"
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
