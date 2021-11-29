const load = async (url) => {
  const res = await fetch(url);
  const file = await res.text();
  return file;
};

const run = async () => {
  const canvas = document.getElementById("random-dots");
  canvas.width = 500;
  canvas.height = 500;
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL not supported, falling back on eperimental");
    gl = canvas.getContext("experimental-webgl");
  }
  if (!gl) {
    alert("Your browser doesn't support WebGL");
  }

  gl.clearColor(0.11, 0.11, 0.22, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShaderText = await load("/dist/random-dots/vertex.glsl");
  const fragmentShaderText = await load("/dist/random-dots/fragment.glsl");

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
    -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0,
  ]);

  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

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
  const position_attrib_location = gl.getAttribLocation(program, "vertex");
  gl.vertexAttribPointer(
    position_attrib_location,
    2,
    gl.FLOAT,
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(position_attrib_location);

  gl.useProgram(program);

  const uCanvasSizeLocation = gl.getUniformLocation(program, "u_resolution");
  const uCanvasSize = new Float32Array([canvas.width, canvas.height]);
  gl.uniform2fv(uCanvasSizeLocation, uCanvasSize);

  const uTimeLocation = gl.getUniformLocation(program, "u_time");
  const uTime = 0.0;
  gl.uniform1f(uTimeLocation, uTime);

  const loop = () => {
    gl.uniform1f(uTimeLocation, performance.now() / 1000);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

run();
