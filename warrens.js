var library = require("module-library")(require)

library.using([
	"browser-bridge",
	"web-site",
	"web-element",
	"./crescent"],
	function(BrowserBridge, WebSite, element, crescent) {


		var bridge = new BrowserBridge

		crescent.addTo(bridge)
		
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
		   	}),
			element.style(".voxel", {
				"position": "relative",
				"width": "40px",
				"height": "40px",
				"margin-top": "20px",
				}),
		 ])


		bridge.addToHead(stylesheet)

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

		// var bird = element(
		// 	".bird",
		// 	element.style({
		// 		"position": "absolute",
		// 		"left": "200px",
		// 		"top": "100px",
		// 	}),
		// 	crescent(
		// 		"back",{
		// 		"color": "pink",
		// 		"belly": 180,
		// 		"oclock": 6,
		// 		"depth": 4,
		// 	}),
		// 	crescent(
		// 		"belly",{
		// 		"color": "palevioletred",
		// 		"belly": 180,
		// 		"oclock": 6,
		// 		"depth": 2,
		// 		"top": 1,
		// 	}))

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
			// bird,
			crescent.testCrescents,
		]

		var feathers = [
			element(
				".feather.neck-feather",
				element(
					".crescent.feather-top"),
				element(
					".crescent.feather-bottom")),
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
					".crescent.feather-bottom"))
		]


		var press = bridge.defineSingleton(
			"press",
			function() {

				var belly = {
					"top": 1.0,
					"oclock": 3.0,
				}

				function press(event) {
					var dolock
					var dtop
					if (event.key == "ArrowRight") {
						doc = 1
					} else if (event.key == "ArrowLeft") {
						doc = -1
					} else if (event.key == "ArrowUp") {
						dtop = -1
					} else if (event.key == "ArrowDown") {
						dtop = 1
					} else {
						return
					}
					event.preventDefault()
					moveBelly(dtop, doclock)
				}

				function moveBelly(dtop, doclock) {
					var bellyNode = document.querySelector(".belly-crescent")

					belly.top += dtop/20

					borderWidth = 10 * belly.oclock

					// 3 oclock = 10 width
					// 

					belly.oclock += doclock/5
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
