import { useEffect, useRef } from "react";
import { Camera, MathUtils, Vector3 } from "three";

declare const fxrand: () => number;

export const sortRandom = <T>(array: T[], rndFn = fxrand) =>
  array.sort((a, b) => 0.5 - rndFn());

export const pickRandom = <T>(array: T[], rndFn = fxrand) =>
  array[Math.floor(rndFn() * array.length)];

export const pickRandomNumberFromArray = <T>(array: T[], rndFn = fxrand) =>
  Math.floor(rndFn() * array.length);

export const pickRandomIntFromInterval = (
  min: number,
  max: number,
  rndFn = fxrand
) => {
  return Math.floor(rndFn() * (max - min + 1) + min);
};

export const pickRandomDecimalFromInterval = (
  min: number,
  max: number,
  decimalPlaces = 2,
  rndFn = fxrand
) => {
  const rand = rndFn() * (max - min) + min;
  const power = Math.pow(10, decimalPlaces);
  return Math.floor(rand * power) / power;
};

export const pickRandomNumber = () => fxrand();

export const pickRandomBoolean = (trueValue = 0.5) =>
  pickRandomNumber() < trueValue;

export const pickRandomSphericalPos = () => {
  const theta = 2 * Math.PI * pickRandomNumber();
  const phi = Math.acos(2 * pickRandomNumber() - 1);

  return new Vector3(theta, phi, 0);
};

export const range = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number
) => MathUtils.lerp(x2, y2, MathUtils.inverseLerp(x1, y1, a));

export const getSizeByAspect = (size: number, aspect: number) =>
  aspect > 1 ? size : size * aspect;

export const getSizeByWidthAspect = (size: number, aspect: number) =>
  aspect > 1 ? size * aspect : size;

export const adjustColor = (color: string, amount: number) => {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 255,
        g: 255,
        b: 255,
      };
};

export const rgbToHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

export const pickRandomColorWithTheme = (
  color: string,
  theme: string[],
  count: number
) => {
  const primaryColor = new Array(count).fill(null).map(() => color);

  return pickRandom([...primaryColor, ...theme]);
};

export const easeInOutSine = (t: number, b: number, _c: number, d: number) => {
  const c = _c - b;
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};

export const minMaxNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const generateUUID = () => {
  let d = new Date().getTime();
  let d2 = (performance && performance.now && performance.now() * 1000) || 0;

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x7) | 0x8).toString(16);
  });
};

export const worldPointFromScreenPoint = (
  screenPoint: { x: number; y: number },
  camera: Camera
) => {
  const vector = new Vector3();
  vector.set(
    (screenPoint.x / window.innerWidth) * 2 - 1,
    -(screenPoint.y / window.innerHeight) * 2 + 1,
    0
  );
  vector.unproject(camera);

  return vector;
};

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
