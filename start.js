var library = require("module-library")(require)

// flowers look like this: https://youtu.be/GbWMw249xY8?t=496

library.using([
	"browser-bridge",
	"web-site",
	"web-element",
	"./crescent"],
	function(BrowserBridge, WebSite, element, crescent) {


		var bridge = new BrowserBridge

		crescent.addTo(bridge)
		
		var keyboardKey = element.template(
			"span.keyboard-key",
				element.style({
				"cursor": "pointer",
				"background": "#223",
				"border-radius": "3px",
				"display": "inline-block",
				"width": "32px",
				"height": "16px",
				"text-align": "center",
				"color": "#eff",
				"line-height": "16px",
				"font-size": "6px",
				"border-top": "2px solid #667",
				"border-left": "1px solid black",
				"border-bottom": "2px solid black",
				"border-right": "1px solid #446",
				"vertical-align": "middle",
				"margin-right": "16px",

				".key-text": {
					"font-family": "Trebuchet MS",
					"font-size": "14px",
					"height": "28px",
					"line-height": "28px",
					"margin-top": "-6px",
					"margin-bottom": "-6px",
				}
			}),
			function(key, attributes) {
				this.addAttributes(attributes)
				var character = {
					"ArrowLeft": "&#9664;",
					"ArrowUp": "&#9650;",
					"ArrowDown": "&#9660;",
					"ArrowRight": "&#9654;"}[key]

				if (!character) {
					this.addSelector(".key-text")
				}
				this.addChild(character || key)
			})


		var stylesheet = element.stylesheet([
			keyboardKey,
			element.style(".mode", {
				"text-transform	": "uppercase",
				"font-weight": "bold",
				"color": "#555",
				"font-size": "0.5em",
				"width": "5em",
				"text-align": "center",
				"border": "2px solid #555",
				"border-radius": "2px",
			}),
			element.style(".crescent.template", {
				"display": "none",
			}),
			element.style("body", {
				"font-family": "sans-serif",
				"margin-left": "200px",
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

		var updateCrescent = crescent.defineUpdateOn(bridge)

		var birdCrescents = [
			{
	      "name": "wing",
	      "width": Math.PI/4,
	      "oclock": 9,
	      "depth": 2,
	      "height": 0.5,
	      "top": 0,
	      "curl": 0,
	    },

	    {
	    	"name": "back",
	      "width": Math.PI/4,
	      "oclock": 6,
	      "depth": 2,
	      "height": 0.5,
	      "top": 0,
	      "curl": 0,
	    },

	    {
	    	"name": "back-wing",
	      "width": Math.PI/4,
	      "oclock": 3.5,
	      "depth": 2,
	      "height": 0.5,
	      "top": 0,
	      "curl": 0,
	    }
	  ]

	  // var crescents = crescent.clockCrescents
	  var crescents = birdCrescents

		var ONE_VOXEL_PER = false

		var keys = {
			0: [
				["ArrowLeft", "rotate feathers left"],
				["ArrowRight", "rotate feathers right"],
				["ArrowUp", "press feathers in"],
				["ArrowDown", "fluff feathers out"],
			],
			1: [
				["ArrowLeft", "tilt feathers out"],
				["ArrowRight", "tilt feathers in"],
				["ArrowUp", "slide feathers up"],
				["ArrowDown", "slide feathers down"],
			],
		}

		var press = bridge.defineSingleton(
			"press",
			[keys, crescents, updateCrescent],
			function(keys, crescents, updateCrescent) {

				var selectedIndex = 0
				var height = 0.0
				var mode = 0

				function press(event) {
					if (typeof event == "string") {
						var key = event
					} else {
						var key = event.key
					}

					if (!event.preventDefault) {
						event.preventDefault = function(){}
					}

					var doclock = 0
					var dheight = 0
					var dcurl = 0
					var dtop = 0

					var didPressArrow = true

					if (mode == 0) {

						// planar mode

						if (key == "ArrowRight") {
							doclock = 1/10
						} else if (key == "ArrowLeft") {
							doclock = -1/10
						} else if (key == "ArrowUp") {
							dheight = -0.1
						} else if (key == "ArrowDown") {
							dheight = 0.1
						} else {
							didPressArrow = false
						}

					} else {

						// trunk mode

						if (key == "ArrowRight") {
							dcurl = 1/10
						} else if (key == "ArrowLeft") {
							dcurl = -1/10
						} else if (key == "ArrowUp") {
							dtop = -0.1
						} else if (key == "ArrowDown") {
							dtop = 0.1
						} else {
							didPressArrow = false
						}

					}

					if (key == "Tab") {
						selectedIndex++
						if (selectedIndex == crescents.length) {
							selectedIndex = 0
						}
						event.preventDefault()
	
					} else if (key == "m") {
						mode++
						if (mode > 1) {
							mode = 0
						}
						keys[mode].forEach(function(args, i) {
							var label = document.querySelector('.mode-result-'+i)
							label.innerText = args[1]
						})

						document.querySelector(".mode").innerText = mode == 0 ? "Planar Mode" : "Trunk Mode"
						event.preventDefault()

					} else if (didPressArrow) {
						var name = "4-oclock"
						var crescent = crescents[selectedIndex]


						crescents.forEach(function(crescent) {
							crescent.height += dheight
							crescent.oclock += doclock
							crescent.curl += dcurl
							crescent.top += dtop
							console.log(crescent)
							updateCrescent(crescent)
						})

						event.preventDefault()

					} else {
						console.log("unhandled", key)
					}
				}

				return press})


		var crescentElements = crescents.map(crescent)
		if (ONE_VOXEL_PER) {
			var voxels = crescentElements.map(
				element.template(
					".voxel"))
		} else {
			var voxels = element(
				".voxel",
				crescentElements)
		}

		var mode = 0

		var keyMapEntry = element.template(
			"p",
			function (key, describeTheResult, index) {
				this.addChild(
					keyboardKey(
						key,{
						"onclick": press.withArgs(key).evalable()})
				)
				this.addChild(
					element(
						"span.mode-result-"+index,
						describeTheResult))
			})

		var keyMap = element(
			element(
				"p",
				keyboardKey(
					"M",{
					onclick: press.withArgs("o").evalable()}),
				"change mode"),
			keys[mode].map(function(args, i) {
				return keyMapEntry(args[0], args[1], i)
			})
		)

		var page = [
			element(
				"h1",
				"feathers!"),
			voxels,
			// element("p.mode", "Planar Mode"),
			// keyMap,
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
