const canvas = document.getElementById("colored-triangle");
canvas.width = 500;
canvas.height = 500;
const gl = canvas.getContext("webgl");

// if you change canvas size after getting context
// gl.viewport(0, 0, width, height);

if (!gl) {
  console.log("WebGL not supported, falling back on eperimental");
  gl = canvas.getContext("experimental-webgl");
}
if (!gl) {
  alert("Your browser doesn't support WebGL");
}

gl.clearColor(0.11, 0.11, 0.22, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "",
  "void main() {",
  "  fragColor = vertColor;",
  "  gl_Position = vec4(vertPosition, 0.0, 1.0);",
  "}",
].join("\n");

const fragmentShaderText = [
  "precision mediump float;",
  "varying vec3 fragColor;",
  "",
  "void main() {",
  "  gl_FragColor = vec4(fragColor, 1.0);",
  "}",
].join("\n");

// Create shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText);

gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  console.error(
    "ERROR: compiling vertex shader;",
    gl.getShaderInfoLog(vertexShader)
  );
  // return;
}

gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
  console.error(
    "ERROR: compiling fragment shader;",
    gl.getShaderInfoLog(fragmentShader)
  );
  // return;
}

// Create a program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// Link the program
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("ERROR: linking program;", gl.getProgramInfoLog(program));
  // return;
}

// Validate program (only do in dev mode)
gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
  console.error("ERROR: validating program;", gl.getProgramInfoLog(program));
  // return;
}

// Create data we will store in a buffer
const triangle_verticies = new Float32Array([
  0.0, 0.5, 1.0, 1.0, 0.0, -0.5, -0.5, 0.7, 0.0, 1.0, 0.5, -0.5, 0.1, 1.0, 0.6,
]);

// A buffer is a chuck of memory on the GPU we can use
// Create a buffer and bind it to the active buffer
const triangle_vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangle_vertex_buffer);

// Set data to the active buffer (last bound)
// Static draw means we are passing data once (not going to change)
gl.bufferData(gl.ARRAY_BUFFER, triangle_verticies, gl.STATIC_DRAW);

// Inform vertex shader the variables to bound the buffer
const position_attrib_location = gl.getAttribLocation(program, "vertPosition");
const color_attrib_location = gl.getAttribLocation(program, "vertColor");
gl.vertexAttribPointer(
  position_attrib_location,
  2,
  gl.FLOAT,
  gl.FALSE,
  5 * Float32Array.BYTES_PER_ELEMENT,
  0
);
gl.vertexAttribPointer(
  color_attrib_location,
  3,
  gl.FLOAT,
  gl.FALSE,
  5 * Float32Array.BYTES_PER_ELEMENT,
  2 * Float32Array.BYTES_PER_ELEMENT
);
gl.enableVertexAttribArray(position_attrib_location);
gl.enableVertexAttribArray(color_attrib_location);

// Render Loop

//
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, triangle_verticies.length / 5);
