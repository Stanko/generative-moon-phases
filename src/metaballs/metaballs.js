import { cellTypeToPolyCorners, classifyCells, metaball, sample, threshold, lerp, compareVectors } from './utils';
import simplify from 'simplify-js';
import RBush from 'rbush';

import './shader-test';

class Metaballs {
  constructor(options) {
    this.options = {
      threshold: 1.0,
      ...options,
    };

    this.circles = options.circles;

    console.time('recalculate');
    this.recalculate();
    console.timeEnd('recalculate');

    console.time('generateShapes');
    this.generateShapes();
    console.timeEnd('generateShapes');
  }

  recalculate() {
    console.time('sample');
    this.samples = sample({
      minX: 0,
      maxX: this.options.imageWidth, // TODO change to trail's bounding box, not the whole image
      stepX: this.options.cellSize,
      minY: 0,
      maxY: this.options.imageHeight, // TODO change to trail's bounding box, not the whole image
      stepY: this.options.cellSize,
      fn: function (x, y) {
        return metaball(x, y, this.circles);
      }.bind(this),
    });
    console.log(this.samples);
    console.timeEnd('sample');

    console.time('threshold');
    this.thresholdedSamples = threshold(this.samples, this.options.threshold);
    console.timeEnd('threshold');

    console.time('classifyCells');
    this.cellTypes = classifyCells(this.thresholdedSamples);
    console.timeEnd('classifyCells');
  }

  /**
   * Given coordinate pairs in (row, col) format, add a line to the list
   */
  addLine(a, b) {
    const x0 = a[1] * this.options.cellSize;
    const y0 = a[0] * this.options.cellSize;
    const x1 = b[1] * this.options.cellSize;
    const y1 = b[0] * this.options.cellSize;

    const line = [
      { x: x0, y: y0 },
      { x: x1, y: y1 },
    ];

    this.shapes.push(line);
  }

  generateShapes() {
    this.shapes = [];

    for (let i = 0; i < this.cellTypes.length; i++) {
      for (let j = 0; j < this.cellTypes[i].length; j++) {
        const cellType = this.cellTypes[i][j];
        const polyCompassCorners = cellTypeToPolyCorners[cellType];

        // The samples at the 4 corners of the current cell
        const NW = this.samples[i][j];
        const NE = this.samples[i][j + 1];
        const SW = this.samples[i + 1][j];
        const SE = this.samples[i + 1][j + 1];

        // The offset from top or left that the line intersection should be.
        const N = (cellType & 4) === (cellType & 8) ? 0.5 : lerp(NW, NE, 0, 1, this.options.threshold);
        const E = (cellType & 2) === (cellType & 4) ? 0.5 : lerp(NE, SE, 0, 1, this.options.threshold);
        const S = (cellType & 1) === (cellType & 2) ? 0.5 : lerp(SW, SE, 0, 1, this.options.threshold);
        const W = (cellType & 1) === (cellType & 8) ? 0.5 : lerp(NW, SW, 0, 1, this.options.threshold);

        const compassCoords = {
          N: [i, j + N],
          W: [i + W, j],
          E: [i + E, j + 1],
          S: [i + 1, j + S],
        };

        if (polyCompassCorners.length === 2) {
          this.addLine(compassCoords[polyCompassCorners[0]], compassCoords[polyCompassCorners[1]]);
        } else if (polyCompassCorners.length === 4) {
          this.addLine(compassCoords[polyCompassCorners[0]], compassCoords[polyCompassCorners[1]]);
          this.addLine(compassCoords[polyCompassCorners[2]], compassCoords[polyCompassCorners[3]]);
        }
      }
    }

    this.shapes = this.shapes.map((shape) => {
      return simplify(shape, 0.1, true);
    });

    this.treeItems = this.shapes.map((line, index) => {
      const start = line[0];
      const end = line[line.length - 1];

      return {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y),
        points: line,
        done: false,
        data: {},
        index,
      };
    });

    this.tree = new RBush();
    this.tree.load(this.treeItems);

    console.time('makeShapesFromLines');
    this.makeShapesFromLines();
    console.timeEnd('makeShapesFromLines');
  }

  continueLine(line) {
    const EPSILON = 0.1;

    let lineEnd = line.points[line.points.length - 1];

    while (lineEnd) {
      const area = {
        minX: lineEnd.x - EPSILON,
        maxX: lineEnd.x + EPSILON,
        minY: lineEnd.y - EPSILON,
        maxY: lineEnd.y + EPSILON,
      };

      const segments = this.tree.search(area);

      let segment;

      for (let i in segments) {
        if (line.index !== segments[i].index && !segments[i].done) {
          segment = segments[i];
          break;
        }
      }

      if (line.index === 1079) {
        console.log(segments.map((i) => i.index));
      }

      if (segment) {
        const segmentStart = segment.points[0];
        const segmentEnd = segment.points[1];

        if (compareVectors(lineEnd, segmentStart)) {
          line.points.push(segmentEnd);
          lineEnd = segmentEnd;
        } else {
          line.points.push(segmentStart);
          lineEnd = segmentStart;
        }

        segment.done = true;
      } else {
        lineEnd = null;
      }
    }
  }

  makeShapesFromLines() {
    this.treeItems.forEach((line) => {
      if (line.done) {
        return;
      }

      this.continueLine(line);
    });

    this.shapes = this.treeItems.map((item) => item.points).filter((line) => line.length > 2);
    // .filter((line) => compareVectors(line[0], line[line.length - 1]));

    // this.shapes.forEach((shape) => {
    //   console.log(JSON.stringify(shape[0]) === JSON.stringify(shape[shape.length - 1]));
    // });
  }
}

export default Metaballs;
