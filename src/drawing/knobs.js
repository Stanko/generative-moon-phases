import { knobTypes } from '../knobs/constants';

const KNOBS = [
  {
    name: 'debug',
    type: knobTypes.BOOL,
    default: true,
    disableRandomization: true,
  },
  {
    name: 'size',
    type: knobTypes.RANGE,
    disableRandomization: true,
    min: 500,
    step: 50,
    max: 4000,
    default: 600,
  },
  {
    name: 'moonPhase',
    type: knobTypes.RANGE,
    disableRandomization: true,
    moon: true,
    min: 1,
    step: 1,
    max: 5,
    default: 3,
  },
  {
    name: 'noiseScale',
    type: knobTypes.RANGE,
    disableRandomization: true,
    min: 1,
    step: 1,
    max: 5000,
    default: 1000,
  },
  {
    name: 'mainSeed',
    type: knobTypes.SEED,
  },
  {
    name: 'noiseSeed',
    type: knobTypes.SEED,
  },
  {
    name: 'easing',
    type: knobTypes.EASING,
    default: '0.73,0.15,0.87,0.62',
  },
];

export default KNOBS;
