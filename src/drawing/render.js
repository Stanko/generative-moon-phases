import getDrawingData from './index';
import setMainSeed from '../utils/set-main-seed';
import svg from '../utils/svg';
import random from '../utils/random';

let timer;

export default async function render(options) {
  options.width = options.size;
  options.height = options.size;

  const { width, height, debug, mainSeed, shapeIndex } = options;

  // Swap Math.random for a seeded rng
  setMainSeed(mainSeed);

  // --------- Main logic
  console.time((timer = 'data'));
  const data = await getDrawingData(options);
  console.timeEnd(timer);

  // --------- Render

  const svgElement = svg.create(options);
  console.time((timer = 'svg render'));
  let svgContent = '';
  svgContent += `\n\n\n<!-- ${window.location.href} -->\n\n\n`;
  svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="black" />`;

  function getRandomProperty(obj) {
    const keys = Object.keys(obj);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return obj[keys[randomIndex]];
  }

  const thresholds = {
    WHITE: 1,
    SILVER: 0.9,
    BRONZE: 0.7,
    GOLD: 0.6,
    GRAY: 0.55,
  };

  function getColor(value) {
    const colors = {
      gray: '#909090',
      gold: '#FFD700',
      bronze: '#cd9f72',
      silver: '#c0c0c0',
      white: '#ffffff',
    };

    // if (random() > 0.95) {
    //   return colors.gold;
    // } else if (random() > 0.95) {
    //   return colors.bronze;
    // }

    if (value <= thresholds.GRAY) {
      return colors.gray;
    } else if (value <= thresholds.GOLD) {
      return colors.gold;
    } else if (value <= thresholds.BRONZE) {
      return colors.bronze;
    } else if (value <= thresholds.SILVER) {
      return colors.silver;
    } else {
      return colors.white;
    }
  }

  function getColorName(value) {
    if (value <= thresholds.GRAY) {
      return '5-gray';
    } else if (value <= thresholds.GOLD) {
      return '4-gold';
    } else if (value <= thresholds.BRONZE) {
      return '3-bronze';
    } else if (value <= thresholds.SILVER) {
      return '2-silver';
    } else {
      return '1-white';
    }
  }

  const colorGroups = {};

  // data.lines.forEach((line) => {
  //   svgContent += svg.path(line, false, {
  //     stroke: getColor(line[0].brightness),
  //     fill: 'none',
  //   });
  // });

  data.colors.forEach((circle) => {
    // svgContent += svg.circle(circle, 2, {
    //   // fill: circle.hex,
    //   // fill: getRandomProperty(colors),
    //   fill: getColor(circle.brightness),
    //   // fill: 'white',
    //   // fill: 'none',
    //   // stroke: 'none',
    //   // stroke: getColor(circle.brightness),
    //   // style: `opacity: ${circle.brightness}`,
    // });

    // const r = circle.brightness * circle.brightness * 10;
    // svgContent += svg.path(
    //   [circle, { x: circle.x + Math.cos(circle.angle) * r, y: circle.y + Math.sin(circle.angle) * r }],
    //   false,
    //   {
    //     stroke: getColor(circle.brightness),
    //     fill: 'none',
    //     'stroke-width': 5,
    //   }
    // );

    const color = getColor(circle.brightness);

    if (!colorGroups[color]) {
      colorGroups[color] = [];
      colorGroups[color].id = getColorName(circle.brightness);
    }

    colorGroups[color].push(
      `<path d="M ${circle.x} ${circle.y} Q ${circle.p2.x} ${circle.p2.y} ${circle.p3.x} ${circle.p3.y}"  />`
    );
  });

  const stroke = 6;
  const strokeHalf = stroke / 2;
  const helper = 50;

  colorGroups[Object.keys(colorGroups)[0]].push(
    `<path d="M ${width + strokeHalf} ${height + helper + strokeHalf} v -${helper} h ${helper}" fill="none" />`
  );

  Object.keys(colorGroups).forEach((color) => {
    svgContent += `<g 
      id="${colorGroups[color].id}"
      stroke-width="${stroke}" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke="${color}"
    >
      ${colorGroups[color].join('')}
    </g>`;
  });

  svgElement.innerHTML = svgContent;
  console.timeEnd(timer);
}
