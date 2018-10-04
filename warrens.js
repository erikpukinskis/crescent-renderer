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
			element.style(".crescent.template", {
				"display": "none",
			}),
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
			function(name, attributes) {
				this.addAttributes(attributes)
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


		var updateCrescent = crescent.defineUpdateOn(bridge)

		var press = bridge.defineSingleton(
			"press",
			[updateCrescent],
			function(updateCrescent) {

				var crescents = {
					"3-oclock": {
						"top": 1.0,
						"oclock": 3.0,
					},
					"4-oclock": {
						"top": 1.0,
						"oclock": 4.0,
					}
				}

				function press(event) {
					if (typeof event == "string") {
						var key = event
					} else {
						var key = event.key
					}

					var doclock
					var dtop
					if (key == "ArrowRight") {
						doclock = 1/10
					} else if (key == "ArrowLeft") {
						doclock = -1/10
					} else if (key == "ArrowUp") {
						dtop = -1
					} else if (key == "ArrowDown") {
						dtop = 1
					} else {
						return
					}

					if (doclock && event.preventDefault) {
						event.preventDefault()
					}

					var name = "4-oclock"

					var crescent = crescents[name]
					crescent.oclock += doclock

					document.querySelector(".label-"+name).innerText = crescent.oclock.toFixed(2)+" o'clock"

					updateCrescent(name, crescent.oclock, Math.PI/2, 0, 2.0)

					// moveBelly(dtop, doclock)
				}

				return press})


		var page = [
			element(
				"h1",
				"feathers!"),
			element(
				"p",
				key(
					"left",{
					onclick: press.withArgs("ArrowLeft").evalable()}),
				"rotate feather left"),
			element(
				"p",
				key(
					"right",{
					onclick: press.withArgs("ArrowRight").evalable()}),
				"rotate feather right"),
			// bird,
			crescent.testCrescents,
		]

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
