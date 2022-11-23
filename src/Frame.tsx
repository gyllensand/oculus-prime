import { useFrame } from "@react-three/fiber";
import { a, SpringValue } from "@react-spring/three";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  Vector3,
} from "three";
import {
  hexToRgb,
  pickRandom,
  pickRandomDecimalFromInterval,
  pickRandomSphericalPos,
} from "./utils";
import { LIGHT_BG_COLORS } from "./constants";

const dashScale = pickRandom([
  pickRandomDecimalFromInterval(0.1, 0.5),
  pickRandomDecimalFromInterval(1, 4),
]);
const dashSize =
  dashScale <= 0.3 ? pickRandomDecimalFromInterval(0.2, 0.5) : 0.1;
const color = pickRandom(LIGHT_BG_COLORS);
const rgb = hexToRgb(color);

const Frame = ({
  pos,
  index,
  radius,
  data,
  height,
  gap,
  scale,
}: {
  pos: Vector3;
  index: number;
  radius: SpringValue<number>;
  scale: SpringValue<number>;
  height: number;
  gap: number;
  data: {
    width: number;
    wireframe: boolean;
    color: string;
  };
}) => {
  const groupRef = useRef<Group>();
  // const width = Math.random();

  useFrame(() => {
    const angle = index * Math.PI * gap;

    groupRef
      .current!.position.set(Math.cos(angle), Math.sin(angle), 0)
      .multiplyScalar(radius.get() * 21 + (data.width / 2) * scale.get());

    groupRef.current?.lookAt(0, 0, 0);
  });

  return (
    <a.mesh ref={groupRef} scale={scale as any}>
      <boxBufferGeometry args={[0.1, height, data.width, 1, 1]} />
      <meshBasicMaterial
        color={data.color}
        wireframe={data.wireframe}
        blending={AdditiveBlending}
        transparent
        toneMapped={false}
      />
    </a.mesh>
  );
};

export default Frame;
