var library = require("module-library")(require)

// Very interesting discussion of vector performance: https://github.com/toji/gl-matrix/issues/359

module.exports = library.export(
  "shader",
  function() {

    // This code is adapted from the example at https://www.tutorialspoint.com/webgl/webgl_sample_application.htm

    function shader(gl, canvasWidth, canvasHeight) {
        // There are three commands that you need to send to a actually write data into a buffer: create, bind, and buffer. First we create:
        var vertexBuffer = gl.createBuffer()

        // The shader program combines them together
        const shaderProgram = createShaderProgram(
          gl)

        // useProgram is similar to bindBuffer, since we can only have one program going at a time we need to tell OpenGL which is up.
        gl.useProgram(shaderProgram)

        // This grabs a reference to a specific attribute in one of our shaders, in this case the coordinates attribute vertex shader
        var coordinatesAttr = gl.getAttribLocation(
          shaderProgram,
          "coordinates")

        // This I guess just turns that attribute on
        gl.enableVertexAttribArray(
          coordinatesAttr)

        function setCoordinates(coordinates) {
          // Then we need to tell OpenGL that's the buffer we want to write to. We need to do this each time we want to write to a different buffer, although we could do several bufferings in a row off this one bind:
          gl.bindBuffer(
            gl.ARRAY_BUFFER,
            vertexBuffer)

          gl.bufferData(
            gl.ARRAY_BUFFER,
            coordinates,
            gl.STATIC_DRAW)

          // Not sure exactly what's happening here, but we definitely need to have the buffer bound before we get here...
          gl.vertexAttribPointer(
            coordinatesAttr,
            2, // I assume this sets the chunk size
            gl.FLOAT, // and type
            false, // this would normalize if the type were int, but has no effect on floats
            0, // I think this could be a gap between each chunk
            0) // and this could specify where to start in the array coordinate array we passed in

          // At this point the data seems to be configured properly, so we ca unbind it (by bunding null)
          gl.bindBuffer(gl.ARRAY_BUFFER, null)
        }

        // We use floats because WebGL apparently doesn't support very many operations with ints. Will be interesting to revisit that after I've used floats for more things!
        var coordinates = new Float32Array([
          -0.5,
          0.5,
          -0.5,
          -0.5,
          0.0,
          -0.5])

        setCoordinates(coordinates)

        // This is where the draw begins
        gl.clearColor(
          0.5,
          0.5,
          0.5,
          0.9)

        gl.enable(
          gl.DEPTH_TEST)

        gl.viewport(
          0,
          0,
          canvasWidth,
          canvasHeight)


        function draw() {
          gl.clear(
            gl.COLOR_BUFFER_BIT)

          gl.drawArrays(
            gl.TRIANGLES,
            0, // first one to start at
            3) // how many to draw
        }

        draw()
    }

    function createShaderProgram(gl) {
      // The shader program just glues together the vertex and fragment shader so they can work together.
      var shaderProgram = gl.createProgram()

      // The vertex shader is what tells the GPU where our verticies are, based on whatever world data we feed it
      var vertexShader = create2dPositionShader(
        gl)

      // The fragment shader renders all of the pixels inside that geometry
      var fragmentShader = createFillWithGrayShader(
        gl)


      gl.attachShader(
        shaderProgram,
        vertexShader)

      gl.attachShader(
        shaderProgram,
        fragmentShader)

      // The program has to be "linked" before it can be "used". There's not a lot of documentation out there, but it seems to be another kind of compile step that just checks that the vertex and fragment shaders are both there and make sense together.
      // Also, after the program is in use we can modify the individual shaders, but those changes won't take effect until we call linkProgram again.
      gl.linkProgram(shaderProgram)

      return shaderProgram
    }

    function create2dPositionShader(gl) {
      // This is some shader code that takes in whatever input we give it (in this case our six coordinates) and writes out a position by setting the gl_Position variable. A.k.a the "clip-space output position of the current vertex"
      // All of these gl_ variables are special input and output variables see page 4 of file:///Users/some_eriks/Downloads/webgl-reference-card-1_0.pdf
      // It looks like this is going to chunk up the input data into vec2s, but the position is a vec4.
      // Since we're going to stay in flat space for now, the third value, Z, is just 0.0.
      // The fourth value, W, from a Euclidian perspective, is a scaling value. (1,2,0,0.1) represents (10,20) in Euclidian space. It is also needed for matrix math to work (there has to be something there.) As it gets smaller, you can imagine the point heading out towards infinity, so that's why (1,2,0,0) represents a vector and not a point: it's kind of the point in that direction out at infinity. Explained here http://glprogramming.com/red/appendixf.html
      var VEC2_CHUNK_TO_VEC4 = `
        attribute vec2 coordinates;
        void main(void) {
          gl_Position = vec4(coordinates,0.0, 1.0);
        }
      `

      // To have that code usable on the GPU we need to create the shader, set its source code, and then compile it:
      var vertexShader = gl.createShader(
        gl.VERTEX_SHADER)

      gl.shaderSource(
        vertexShader,
        VEC2_CHUNK_TO_VEC4)

      // The compile step takes the source code we provided and builds an executable "Program Object". We could also write multiple strings to the shader with multiple shaderSource calls before compiling, if we wanted to use some shared code.
      gl.compileShader(vertexShader)

      checkCompileStatus(gl, vertexShader)

      return vertexShader
    }

    function createFillWithGrayShader(gl) {
      // A fragment shader writes out color data for the pixel. This one has no inputs, and just returns a fixed value, but it could do lots of fancy stuff.
      var FILL_WITH_GRAY = `
        void main(void) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
        }
      `

      var fragmentShader = gl.createShader(
        gl.FRAGMENT_SHADER)

      gl.shaderSource(fragmentShader, FILL_WITH_GRAY)

      gl.compileShader(fragmentShader)

      checkCompileStatus(gl, fragmentShader)
  
      return fragmentShader
    }

    function checkCompileStatus(gl, shader) {
      if (!gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader))
      }
    }

    return shader
  }
)
