var library = require("module-library")(require)

// Very interesting discussion of vector performance: https://github.com/toji/gl-matrix/issues/359

// glBufferSubData is only if you want to replace data; to resize the buffer instead, you have to call glBufferData


module.exports = library.export(
  "shader",
  function() {

    function ShaderScene() {}

    // This code is adapted from the example at https://www.tutorialspoint.com/webgl/webgl_sample_application.htm

    ShaderScene.prototype._visible = false

    ShaderScene.prototype.init = function(canvas) {
        var gl = this.gl = canvas.getContext(
          "experimental-webgl",{
          antialias: false})

        // The shader program combines them together
        const shaderProgram = createShaderProgram(
          gl)

        // useProgram is similar to bindBuffer, since we can only have one program going at a time we need to tell OpenGL which is up.
        gl.useProgram(shaderProgram)


        // COORDINATES

        // There are three commands that you need to send to a actually write data into a buffer: create, bind, and buffer. First we create:
        this.buffer = gl.createBuffer()

        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          this.buffer)

        // This grabs a reference to a specific attribute in one of our shaders, in this case the coordinates attribute vertex shader
        this.coordinatesLocation = gl.getAttribLocation(
          shaderProgram,
          "coordinates")

        // Not sure exactly what's happening here, but we definitely need to have the buffer bound before we get here...
        gl.vertexAttribPointer(
          this.coordinatesLocation,
          2, // I assume this sets the chunk size
          gl.FLOAT, // and type
          false, // this would normalize if the type were int, but has no effect on floats
          6*4, // The stride between the start of each chunk, in floats (where each float is 4)
          0) // The position of the first chunk (also in floats)

        console.log('coordinates is attribute', this.coordinatesLocation)

        // This I guess just turns that attribute on
        gl.enableVertexAttribArray(
          this.coordinatesLocation)


        // COLORS

        // Then I think we can do the same thing for the brush color variable

        // We are using the same buffer for vertices and colors and that buffer is already bound, so we can just go ahead and add another attribute
        this.brushColorLocation = gl.getAttribLocation(
          shaderProgram,
          "color")

        gl.vertexAttribPointer(
          this.brushColorLocation,
          4,
          gl.FLOAT,
          false,
          6*4,
          2*4)

        gl.enableVertexAttribArray(
          this.brushColorLocation)

        console.log(
          "color is attribute",
          this.brushColorLocation)

        // This is where the draw begins
        gl.clearColor(
          0,
          0,
          0,
          0)

        gl.enable(
          gl.DEPTH_TEST)

        gl.viewport(
          0,
          0,
          canvas.width,
          canvas.height)
    }

    ShaderScene.prototype.draw = function() {
      if (!this.gl) {
        throw new Error(
          "Forgot to call ShaderScene.init")}
      var gl = this.gl

      if (!this._visible) {
        gl.clear(
          gl.COLOR_BUFFER_BIT)}
      else {
        gl.drawArrays(
          gl.TRIANGLE_STRIP,
          0, // first one to start at
          4)} // how many to draw
    }

    ShaderScene.prototype.assertInit = function() {
      if (!this.gl) {
        throw new Error(
        "Forgot to call ShaderScene.init")}}

    ShaderScene.prototype.bufferPoints = function(data) {
      this.assertInit()

      // Coordinates should be a Float32Array. We use floats because WebGL apparently doesn't support very many operations with ints. Will be interesting to revisit that after I've used floats for more things!

      var gl = this.gl

      // Then we need to tell OpenGL that's the buffer we want to write to. We need to do this each time we want to write to a different buffer, although we could do several bufferings in a row off this one bind:
      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        this.buffer)

      // It doesn't matter if we do this before or after the gl.vertexAttribPointer
      gl.bufferData(
        gl.ARRAY_BUFFER,
        data,
        // We are using DYNAMIC_DRAW here because the cursor position will be respecified repeatedly
        gl.DYNAMIC_DRAW)

      // At this point the data seems to be configured properly, so we can unbind it (by binding null)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }

    ShaderScene.prototype.setVisible = function(visible) {
      this._visible = visible
    }

    function createShaderProgram(gl) {
      // The shader program just glues together the vertex and fragment shader so they can work together.
      var shaderProgram = gl.createProgram()

      // The vertex shader is what tells the GPU where our verticies are, based on whatever world data we feed it
      var vertexShader = create2dPositionShader(
        gl)

      // The fragment shader renders all of the pixels inside that geometry
      var fragmentShader = createFillWithColorShader(
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
      var VEC2_CHUNK_TO_VEC4 = `
        // When we call vertexAttribPointer we tell WebGL to chunk coordinates into vec2s, even though we buffer in an array of 6 floats.
        attribute vec2 coordinates;

        // We proxy the _color variable along to the fragment shader. That's because fragment shaders can't have attributes of their own, they are interpolated between verticies, so the vertex shader provides all input data to the fragment shader.
        attribute vec4 color;
        varying vec4 _color;

        void main(void) {
          // Since we're going to stay in flat space for now, the third value, Z, is just 0.0.
          // The fourth value, W, from a Euclidian perspective, is a scaling value. (1,2,0,0.1) represents (10,20) in Euclidian space. It is also needed for matrix math to work (there has to be something there.) As it gets smaller, you can imagine the point heading out towards infinity, so that's why (1,2,0,0) represents a vector and not a point: it's kind of the point in that direction out at infinity. Explained here http://glprogramming.com/red/appendixf.html
          gl_Position = vec4(coordinates,0.0, 1.0);

          // All of these gl_ variables are special input and output variables see page 4 of file:///Users/some_eriks/Downloads/webgl-reference-card-1_0.pdf

          // We just proxy the color along to for fragment shader to use since fragment shaders can't have their own separate attributes
          _color = color;
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

    // OK this is a pretty interesting spot now. Which I guess is the point of this project: to get to interesting places.

    // So, I had all this working with one buffer. But I want two buffers, one for the color and one for the position. And I had to make quite a few changes to get that set up, and it just doesn't work. I get:

    //  ERROR :GL_INVALID_OPERATION : glDrawArrays: attempt to access out of range vertices in attribute 1

    // First off, I don't know what attribute 1 is... I kinda want to set a custom attribute index for each of my buffers to make it easier to debug. But I also want to keep these changes as atomic as possible so I'm gonna assume it's the color buffer for now, and maybe if I get stuck I'll do custom indexes.

    // I think the best path is just to try to get the old setup working again, with as much of the new code in place as possible, just to verify that all that stuff is still working.

    function createFillWithColorShader(gl) {
      // A fragment shader writes out color data for the pixel. This one has no inputs, and just returns a fixed value, but it could do lots of fancy stuff.
      var FILL_WITH_GRAY = `
        varying mediump vec4 _color;

        void main(void) {
          gl_FragColor = _color;
          // gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
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

    return ShaderScene
  }
)
