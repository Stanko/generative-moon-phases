// Get a reference to the WebGL rendering context
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

// Define the vertex shader code
const vsSource = `
  attribute vec4 aVertexPosition;
  void main(void) {
    gl_Position = aVertexPosition;
  }
`;

const circles = [
  { x: 100.0, y: 50.0, r: 80.0 },
  { x: 100.0, y: 100.0, r: 100.0 },
  { x: 120.0, y: 120.0, r: 70.0 },
];

// Define the fragment shader code
const fsSource = `
  precision highp float;
  
  void main(void) {
    vec3 circles[${circles.length}];

    ${circles
      .map((circle, index) => {
        return `circles[${index}] = vec3(${circle.x.toFixed(2)}, ${circle.y.toFixed(2)}, ${circle.r.toFixed(2)} );`;
      })
      .join('\n')}

    float r = 1.0;
  
    for (int i = 0; i < ${circles.length}; ++i) {
      vec3 circle = circles[i];

      float dx = gl_FragCoord.x - circle.x;
      float dy = gl_FragCoord.y - circle.y;
      float d2 = dx * dx + dy * dy;
  
      r += circle.z * circle.z / d2;
    }
  

    r = r / 100.0;
    
    float g = 0.0;
    float b = 0.0;
    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

// Create the vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

// Create the fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

// Create the shader program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Define vertices for a full-screen quad (covers the entire canvas)
const vertices = new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0]);

// Create a buffer and bind the triangle vertices to it
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Get the attribute location and enable it
const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.enableVertexAttribArray(positionAttributeLocation);

// Specify how to interpret the vertex data
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Clear the canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Draw the full-screen quad (2 triangles)
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

const pixels = new Uint8Array(4);
gl.readPixels(100, 100, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

console.log(pixels);
