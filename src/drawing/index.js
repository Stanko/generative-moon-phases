import random from '../utils/random';
import memoize from '../utils/memoize';
import { drawImageOnCanvas, getRectColor } from '../utils/color';
import { createNoise2D } from 'simplex-noise';
import PoissonDiskSampling from 'poisson-disk-sampling';
import { kdTree } from 'kd-tree-javascript';

// Global instance on js-angusj-clipper
let clipper;

export default memoize(async function getDrawingData(options) {
  const { width, height, mainSeedRng, noiseSeedRng, easingFn, debug, moonPhase, noiseScale } = options;

  const noise = createNoise2D(noiseSeedRng);

  // clipper = getClipperInstance();

  // --------- Main logic

  const canvasData = await drawImageOnCanvas(`/images/${moonPhase}.jpg`, width, height);

  document.querySelector('.canvas').replaceChildren(canvasData.canvas);

  const MIN_DISTANCE = 5;

  let timer;

  console.time((timer = 'poisson'));
  const p = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: MIN_DISTANCE,
    maxDistance: MIN_DISTANCE * 10,
    tries: 40,
    distanceFunction: function ([x, y]) {
      const { brightness } = getRectColor(canvasData.ctx, x, y, MIN_DISTANCE);

      return easingFn(1 - brightness);
      // return Math.pow(1 - brightness, 2.7);
    },
  });

  const points = p.fill();
  console.timeEnd(timer);

  const colors = [];

  console.time((timer = 'colors'));
  points.forEach(([x, y]) => {
    const colorData = getRectColor(canvasData.ctx, x, y, MIN_DISTANCE);

    if (colorData.brightness > 0.1) {
      const angle = noise(x / noiseScale, y / noiseScale) * Math.PI;
      const r = 3 * colorData.brightness * colorData.brightness * colorData.brightness;
      const p2 = { x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r };

      const angle2 = noise(p2.x / noiseScale, p2.y / noiseScale) * Math.PI;
      const p3 = { x: p2.x + Math.cos(angle2) * r, y: p2.y + Math.sin(angle2) * r };

      colors.push({
        ...colorData,
        x,
        y,
        r: 2,
        angle: noise(x / noiseScale, y / noiseScale) * Math.PI,
        p2,
        p3,
      });
    }
  });
  console.timeEnd(timer);

  const lines = [];

  // const distance = function (a, b) {
  //   return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  // };
  // const tree = new kdTree(colors, distance, ['x', 'y']);

  // function continueLine(line, depth = 0) {
  //   if (depth > 20) {
  //     return;
  //   }

  //   const p = line[line.length - 1];

  //   const nearest = tree.nearest({ x: p.x, y: p.y }, 4, 10);

  //   p.done = true;
  //   // tree.remove(p);

  //   const next = nearest[0]?.[0];

  //   if (next) {
  //     console.log(nearest[1]);
  //     line.push(next);
  //     continueLine(line, depth + 1);
  //   }

  //   return line;
  // }

  // for (const p of colors) {
  //   if (p.done) {
  //     continue;
  //   }

  //   const line = continueLine([p]);
  //   lines.push(line);
  // }

  return {
    colors,
    lines,
  };
});
