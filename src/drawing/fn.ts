type Point = {
  x: number;
  y: number;
  value: number;
};

const points: Point[] = [];

for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    points.push({ x, y, value: 0 });
  }
}

function animateGrid(fn: (Point) => number, points: Point[], time: number): Point[] {
  return points.map((point) => {
    return {
      ...point,
      value: fn({
        x: point.x + time,
        y: point.y + time,
        value: 0,
      }),
    };
  });
}
