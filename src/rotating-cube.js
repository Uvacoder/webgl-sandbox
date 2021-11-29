import { glMatrix, mat4 } from "gl-matrix";

const canvas = document.getElementById("rotating-cube");
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
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);
gl.cullFace(gl.BACK);

const vertexShaderText = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "",
  "void main() {",
  "  fragColor = vertColor;",
  "  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
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
const verticies = new Float32Array([
  -1.0, 1.0, -1.0,  0.5, 0.5, 0.5,
  -1.0, 1.0, 1.0,   0.5, 0.5, 0.5,
  1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
  1.0, 1.0, -1.0,   0.5, 0.5, 0.5,

  -1.0, 1.0, 1.0,   0.75, 0.25, 0.5,
  -1.0, -1.0, 1.0,  0.75, 0.25, 0.5,
  -1.0, -1.0, -1.0, 0.75, 0.25, 0.5,
  -1.0, 1.0, -1.0,  0.75, 0.25, 0.5,

  1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
  1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
  1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
  1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

  1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
  1.0, -1.0, 1.0,   1.0, 0.0, 0.15,
  -1.0, -1.0, 1.0,  1.0, 0.0, 0.15,
  -1.0, 1.0, 1.0,   1.0, 0.0, 0.15,

  1.0, 1.0, -1.0,   0.0, 1.0, 0.15,
  1.0, -1.0, -1.0,  0.0, 1.0, 0.15,
  -1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
  -1.0, 1.0, -1.0,  0.0, 1.0, 0.15,

  -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
  -1.0, -1.0, 1.0,  0.5, 0.5, 1.0,
  1.0, -1.0, 1.0,   0.5, 0.5, 1.0,
  1.0, -1.0, -1.0,  0.5, 0.5, 1.0,
]);

const indices = new Uint16Array([
  0, 1, 2,
  0, 2, 3,

  5, 4, 6,
  6, 4, 7,

  8, 9, 10,
  8, 10, 11,

  13, 12, 14,
  15, 14, 12,

  16, 17, 18,
  16, 18, 19,

  21, 20, 22,
  22, 20, 23,
]);


// A buffer is a chuck of memory on the GPU we can use
// Create a buffer and bind it to the active buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// Set data to the active buffer (last bound)
// Static draw means we are passing data once (not going to change)
gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


// Inform vertex shader the variables to bound the buffer
const position_attrib_location = gl.getAttribLocation(program, "vertPosition");
const color_attrib_location = gl.getAttribLocation(program, "vertColor");
gl.vertexAttribPointer(
  position_attrib_location,
  3,
  gl.FLOAT,
  gl.FALSE,
  6 * Float32Array.BYTES_PER_ELEMENT,
  0
);
gl.vertexAttribPointer(
  color_attrib_location,
  3,
  gl.FLOAT,
  gl.FALSE,
  6 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT
);
gl.enableVertexAttribArray(position_attrib_location);
gl.enableVertexAttribArray(color_attrib_location);

gl.useProgram(program);

const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
const matViewUniformLocation = gl.getUniformLocation(program, "mView");
const matProjUniformLocation = gl.getUniformLocation(program, "mProj");

const worldMatrix = new Float32Array(16);
const viewMatrix = new Float32Array(16);
const projMatrix = new Float32Array(16);
mat4.identity(worldMatrix);
mat4.lookAt(viewMatrix, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

const xRotation = new Float32Array(16);
const yRotation = new Float32Array(16);

// Render Loop
let angle;
const identityMatrix = new Float32Array(16);
mat4.identity(identityMatrix);
const loop = () => {

  angle = performance.now() / 1000 / 6 * 2 * Math.PI;
  mat4.rotate(xRotation, identityMatrix, angle, [1, 0, 0]);
  mat4.rotate(yRotation, identityMatrix, angle / 2, [0, 1, 0]);

  mat4.mul(worldMatrix, xRotation, yRotation);
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

  gl.clearColor(0.11, 0.11, 0.22, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
