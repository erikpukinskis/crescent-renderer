var library = require("module-library")(require)

library.using([
	"browser-bridge",
	"web-site",
	"web-element",
	"./crescent"],
	function(BrowserBridge, WebSite, element, crescent) {


		var bridge = new BrowserBridge

		crescent.addTo(bridge)
		
		var key = element.template(
			"span.key",
				element.style(".key", {
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
				"margin-right": "1em",

				".key-text": {
					"font-size": "12px",
					"height": "28px",
					"line-height": "28px",
				}
			}),
			function(name, attributes) {
				this.addAttributes(attributes)
				var character = {
					"left": "&#9664;",
					"up": "&#9650;",
					"down": "&#9660;",
					"right": "&#9654;"}[name]

				if (!character) {
					this.addSelector(".key-text")
				}
				this.addChild(character || name)
			})


		var stylesheet = element.stylesheet([
			element.style(".crescent.template", {
				"display": "none",
			}),
			key,
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

		var crescents = [
			{
	      "name": "wing",
	      "width": Math.PI/4,
	      "oclock": 9,
	      "depth": 2,
	      "height": 0.5
	    },

	    {
	    	"name": "back",
	      "width": Math.PI/4,
	      "oclock": 6,
	      "depth": 2,
	      "height": 0.5,
	    },

	    {
	    	"name": "back-wing",
	      "width": Math.PI/4,
	      "oclock": 3.5,
	      "depth": 2,
	      "height": 0.5,
	    }
	  ]

		var press = bridge.defineSingleton(
			"press",
			[updateCrescent, crescents],
			function(updateCrescent, crescents) {

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

						// planar

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
						event.preventDefault()

					} else if (didPressArrow) {
						var name = "4-oclock"
						var crescent = crescents[selectedIndex]

						crescent.height += dheight
						crescent.oclock += doclock
						crescent.curl += dcurl
						crescent.top += dtop
						updateCrescent(crescent)
						event.preventDefault()

					} else {
						console.log("unhandled", key)
					}
				}

				return press})


    var voxel = 
      element(
        ".voxel")

		crescents.forEach(function(options) {
      voxel.addChildren(crescent(options))
    })

		var page = [
			element(
				"h1",
				"feathers!"),
			voxel,
			element(
				"p",
				key(
					"M",{
					onclick: press.withArgs("o").evalable()}),
				"change mode"),
			element(
				"p",
				key(
					"left",{
					onclick: press.withArgs("ArrowLeft").evalable()}),
				"rotate feathers left"),
			element(
				"p",
				key(
					"right",{
					onclick: press.withArgs("ArrowRight").evalable()}),
				"rotate feathers right"),
			element(
				"p",
				key(
					"up",{
					onclick: press.withArgs("ArrowUp").evalable()}),
				"press feathers in"),
			element(
				"p",
				key(
					"down",{
					onclick: press.withArgs("ArrowDown").evalable()}),
				"fluff feathers out"),
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
