import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Sampler } from "tone";

console.log(
  "%c * Computer Emotions * ",
  "color: #d80fe7; font-size: 14px; background-color: #000000;"
);

console.log(
  "%c http://www.computeremotions.com ",
  "font-size: 12px; background-color: #000000;"
);

const baseUrl = `${process.env.PUBLIC_URL}/audio/`;

export interface Sample {
  index: number;
  sampler: Sampler;
}

export const LONGS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `1.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `2.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `4.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `5.mp3`,
      },
      baseUrl,
    }),
  },
];

export const SHORTS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `1-short.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `2-short.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `3-short.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `4-short.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `5-short.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `6-short.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 6,
    sampler: new Sampler({
      urls: {
        1: `7-short.mp3`,
      },
      baseUrl,
    }),
  },
];

export const DOUBLES: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `1-double.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `2-double.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `3-double.mp3`,
      },
      baseUrl,
    }),
  },
];

export const LONG_PLUCKS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `long-pluck-a2.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `long-pluck-cs3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `long-pluck-d3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `long-pluck-e3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `long-pluck-e32.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `long-pluck-fs3.mp3`,
      },
      baseUrl,
    }),
  },
];

export const SHORT_PLUCKS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `short-pluck-a2.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `short-pluck-cs3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `short-pluck-d3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `short-pluck-e3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `short-pluck-e32.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `short-pluck-fs3.mp3`,
      },
      baseUrl,
    }),
  },
];

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={window.devicePixelRatio}
      shadows
    >
      <Suspense fallback={null}>
        <Scene canvasRef={canvasRef} />
      </Suspense>
    </Canvas>
  );
};

export default App;
