const EPSILON = 0.1;

export function compareVectors(v1, v2) {
  return Math.abs(v1.x - v2.x) < EPSILON && Math.abs(v1.y - v2.y) < EPSILON;
}

export function lerp(x0, x1, y0, y1, x) {
  if (x0 === x1) {
    return null;
  }

  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * Maps from 0-15 cell classification to compass points indicating a sequence of
 * corners to visit to form a polygon based on the pmapping described on
 * http://en.wikipedia.org/wiki/Marching_squares
 */
export const cellTypeToPolyCorners = {
  0: [],
  1: ['W', 'S'],
  2: ['E', 'S'],
  3: ['W', 'E'],
  4: ['N', 'E'],
  5: ['N', 'W', 'S', 'E'],
  6: ['N', 'S'],
  7: ['N', 'W'],
  8: ['N', 'W'],
  9: ['N', 'S'],
  10: ['N', 'E', 'S', 'W'],
  11: ['N', 'E'],
  12: ['E', 'W'],
  13: ['E', 'S'],
  14: ['S', 'W'],
  15: [],
};

/**
 * Given a nxm grid of booleans, produce an (n-1)x(m-1) grid of square classifications
 * following the marching squares algorithm here:
 * http://en.wikipedia.org/wiki/Marching_squares
 * The input grid used as the values of the corners.
 *
 * The output grid is a 2D array of values 0-15
 */
export const classifyCells = function (corners) {
  const ret = [];

  for (let i = 0; i < corners.length - 1; i++) {
    ret.push([]);
    for (var j = 0; j < corners[i].length - 1; j++) {
      const NW = corners[i][j];
      const NE = corners[i][j + 1];
      const SW = corners[i + 1][j];
      const SE = corners[i + 1][j + 1];

      ret[i].push((SW << 0) + (SE << 1) + (NE << 2) + (NW << 3));
    }
  }

  return ret;
};

export const metaball = function (x, y, circles) {
  let sum = 0;

  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    const dx = x - c.x;
    const dy = y - c.y;

    const d2 = dx * dx + dy * dy;
    sum += c.r2 / d2;
  }

  return sum;
};

/**
 * Convert a grid of continuous values to a
 * grid of booleans.
 */
export const threshold = function (grid, value) {
  const ret = [];

  for (var i = 0; i < grid.length; i++) {
    ret.push([]);

    for (var j = 0; j < grid[i].length; j++) {
      ret[i].push(grid[i][j] > value);
    }
  }

  return ret;
};

/**
 * Sample an f(x, y) in a 2D grid.
 */
export const sample = function (options) {
  const maxX = options.maxX;
  const stepX = options.stepX;

  const maxY = options.maxY;
  const stepY = options.stepX;

  const fn = options.fn;

  const numRows = Math.ceil(maxY / stepY);
  const numCols = Math.ceil(maxX / stepX);

  const samples = [];

  for (let row = 0; row <= numRows; row++) {
    const y = row * stepY;
    samples.push([]);

    for (let col = 0; col <= numCols; col++) {
      const x = col * stepX;
      samples[row].push(fn(x, y));
    }
  }

  return samples;
};
