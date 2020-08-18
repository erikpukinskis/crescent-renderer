var library = require("module-library")(require)

// Very interesting discussion of vector performance: https://github.com/toji/gl-matrix/issues/359

module.exports = library.export(
  "shader",
  function() {
    function shader(gl, canvasWidth, canvasHeight) {

         /* Step1: Prepare the canvas and get WebGL context */

         /* Step2: Define the geometry and store it in buffer objects */

         var vertices = [-0.5, 0.5, -0.5, -0.5, 0.0, -0.5,];

         // Create a new buffer object
         var vertex_buffer = gl.createBuffer();

         // Bind an empty array buffer to it
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
         
         // Pass the vertices data to the buffer
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

         // Unbind the buffer
         gl.bindBuffer(gl.ARRAY_BUFFER, null);

         /* Step3: Create and compile Shader programs */

         // Vertex shader source code
         var vertCode =
            'attribute vec2 coordinates;' + 
            'void main(void) {' + ' gl_Position = vec4(coordinates,0.0, 1.0);' + '}';

         //Create a vertex shader object
         var vertShader = gl.createShader(gl.VERTEX_SHADER);

         //Attach vertex shader source code
         gl.shaderSource(vertShader, vertCode);

         //Compile the vertex shader
         gl.compileShader(vertShader);

         //Fragment shader source code
         var fragCode = 'void main(void) {' + 'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' + '}';

         // Create fragment shader object
         var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

         // Attach fragment shader source code
         gl.shaderSource(fragShader, fragCode);

         // Compile the fragment shader
         gl.compileShader(fragShader);

         // Create a shader program object to store combined shader program
         var shaderProgram = gl.createProgram();

         // Attach a vertex shader
         gl.attachShader(shaderProgram, vertShader); 
         
         // Attach a fragment shader
         gl.attachShader(shaderProgram, fragShader);

         // Link both programs
         gl.linkProgram(shaderProgram);

         // Use the combined shader program object
         gl.useProgram(shaderProgram);

         /* Step 4: Associate the shader programs to buffer objects */

         //Bind vertex buffer object
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

         //Get the attribute location
         var coord = gl.getAttribLocation(shaderProgram, "coordinates");

         //point an attribute to the currently bound VBO
         gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

         //Enable the attribute
         gl.enableVertexAttribArray(coord);

         /* Step5: Drawing the required object (triangle) */

         // Clear the canvas
         gl.clearColor(0.5, 0.5, 0.5, 0.9);

         // Enable the depth test
         gl.enable(gl.DEPTH_TEST); 
         
         // Clear the color buffer bit
         gl.clear(gl.COLOR_BUFFER_BIT);

         // Set the view port
         gl.viewport(0,0,canvasWidth,canvasHeight);

         // Draw the triangle
         gl.drawArrays(gl.TRIANGLES, 0, 3);

      // // The shader program combines them together
      // const shaderProgram = createShaderProgram(
      //   gl)

      // // useProgram is similar to bindBuffer, since we can only have one program going at a time we need to tell OpenGL which is up.
      // gl.useProgram(shaderProgram)

      // // Here are some coordinates that should make a spikey triangle. There are six values: x, y, x, y, x, y.
      // // We use floats because WebGL apparently doesn't support very many operations with ints. Will be interesting to revisit that after I've used floats for more things!
      // var coordinates = new Float32Array([
      //   -0.5,
      //   0.5,
      //   -0.5,
      //   -0.5,
      //   0.0,
      //   -0.5])

      // // There are three commands that you need to send to a actually write data into a buffer: create, bind, and buffer. First we create:
      // var vertexBuffer = gl.createBuffer()

      // // Then we need to tell OpenGL that's the buffer we want to write to. We need to do this each time we want to write to a different buffer, although we could do several bufferings in a row off this one bind:
      // gl.bindBuffer(
      //   gl.ARRAY_BUFFER,
      //   vertexBuffer)

      // // And then this actually writes the data to the GPU. Note that we don't specify which buffer we are writing to here, that's because OpenGL remembers which buffer we "bound":
      // gl.bufferData(
      //   gl.ARRAY_BUFFER,
      //   coordinates,
      //   gl.STATIC_DRAW)


      // // // Now we're done with that, so we unbind it, by bunding null
      // // gl.bindBuffer(gl.ARRAY_BUFFER, null)

      // // gl.bindBuffer(
      // //   gl.ARRAY_BUFFER,
      // //   vertexBuffer)

      // // This grabs a reference to a specific attribute in one of our shaders, in this case the coordinates attribute vertex shader
      // var coordinatesAttr = gl.getAttribLocation(
      //   shaderProgram,
      //   "coordinates")

      // // And this seems to configure it...
      // gl.vertexAttribPointer(
      //   coordinatesAttr,
      //   2, // I assume this sets the chunk size
      //   gl.FLOAT, // and type
      //   false, // this would normalize if the type were int, but has no effect on floats
      //   0, // I think this could be a gap between each chunk
      //   0) // and this could specify where to start in the array coordinate array we passed in

      // // This I guess just turns that attribute on
      // gl.enableVertexAttribArray(
      //   coordinatesAttr)


      // gl.clearColor(
      //   0.5,
      //   0.5,
      //   0.5,
      //   0.9)

      // gl.enable(
      //   gl.DEPTH_TEST)

      // gl.clear(
      //   gl.COLOR_BUFFER_BIT)

      // gl.viewport(
      //   0,
      //   0,
      //   canvasWidth,
      //   canvasHeight)

      // gl.drawArrays(
      //   gl.TRIANGLES,
      //   0, // first one to start at
      //   3) // how many to draw
    }

    function createShaderProgram(gl, vertexShader, fragmentShader) {
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
