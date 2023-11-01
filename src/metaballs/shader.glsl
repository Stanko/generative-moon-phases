uniform float width;
uniform float step;
uniform float height;
uniform vec3[] circles;

float metaball(vec2 pixel) {
  float sum = 0.0;

  for (float i = 0.0; i < length(circles); i++) {
    vec3 circle = circles[i]

    float dx = pixel.x - circles.x;
    float dy = pixel.y - circles.y;
    float d2 = dx * dx + dy * dy;

    sum += circle.r * circle.r / d2;
  }

  return sum;
} 

vec2[][] sample (float width, float height, float step) {
  float numRows = height / step;
  float numCols = width / step;

  vec2 samples[numRows];

  for (let row = 0; row <= numRows; row++) {
    float y = row * step;
    samples[y] = vec2 [numCols];

    for (float col = 0.0; col <= numCols; col++) {
      float x = col * step;
      samples[row][col] = metaball(x, y);
    }
  }

  return samples;
}

void main() {
  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}