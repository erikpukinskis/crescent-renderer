var runTest = require("run-test")(require)


function expectClosePoints(expect,a,b) {
  expect(a[0]).to.be.closeTo(b[0], 0.0001, "x coordinates do not match")
  expect(a[1]).to.be.closeTo(b[1], 0.0001, "y coordinates do not match")
}

runTest(
  "transform glob coordinates to pixel space",
  ["./glob-space"],
  function(expect, done, GlobSpace) {

    // So, the way WebGL wants canvas coordinates is 0,0 is the center of the coordinate space, and -1,1 is the top left corner. It's a kind of a unit space.

    // Glob space starts at 0,0 at the top left and then marches down to n+1,m+1 at the bottom right, where n is the width of the canvas in globs and m is the height in globs (ignoring the sub-glob offset and remainder for now.)

    // Also, for reasons not totally clear to me, the canvas coordinate for a glob starts at the _bottom right_ of the glob. So on a canvas that's 6x4, glob 0,0 is going to be at canvas -0.66,0.5. The x component is 2/3 of the way from 0,0 to -1,1 and the y component is halfway from 0,0 to 0,1.

    // So let's test that...

    var space = new GlobSpace(
      // getting canvas coordinates is independent of the canvas origin, we just use that for the getGlobX/getGlobY functions that handle a mouse event. So we can just use undefined for the rect
      undefined,

      // canvas width, in screen pixels
      5*6,

      // canvas height, in screen pixels
      5*4,

      // resolution
      1)

    const globSize = 5

    expectClosePoints(
      expect,
      space.globPointToCanvas([0,0], globSize),
      [-2/3,1/2])

    expectClosePoints(
      expect,
      space.globPointToCanvas([2,1], globSize),
      [0,0])

    expectClosePoints(
      expect,
      space.globPointToCanvas([3,2], globSize),
      [1/3,-1/2])

    done()
  }
)

runTest(
  "zooming",[
  "./glob-space"],
  function(expect, done, GlobSpace) {
    var sourceSpace = new GlobSpace(
      null,
      256,
      256,
      1)

    var destinationSpace = new GlobSpace(
      null,
      256,
      256,
      2)

    var sourceGlob = {
      color: {},
      x: 1,
      y: 1,
      nudgeX: 0.1,
      nudgeY: 0.2,
      size: 64 }

    var destinationGlob = destinationSpace.mapFrom(sourceSpace, sourceGlob)

    expect(destinationGlob.x).to.equal(1)
    expect(destinationGlob.y).to.equal(1)
    expect(destinationGlob.nudgeX).to.equal(0.1)
    expect(destinationGlob.nudgeY).to.equal(0.2)

    expect(destinationGlob.color).not.to.be.undefined
    expect(destinationGlob.size).to.equal(128)

    done()
  })

runTest(
  "offset")

runTest(
  "getting pixels in a Float32Array")
