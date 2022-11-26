import { useFrame } from "@react-three/fiber";
import { a, SpringValue } from "@react-spring/three";
import { MutableRefObject, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
} from "three";

const DashedCircle = ({
  scale,
  rotation,
  lastRotation,
  currentRotation,
  reversedRotation = false,
  outputScale,
  innerCircle,
  dashScale,
  dashSize,
  rgb,
  dashSpeed,
}: {
  scale: SpringValue<number>;
  rotation: SpringValue<number[]>;
  lastRotation: MutableRefObject<number | undefined>;
  currentRotation: MutableRefObject<number | undefined>;
  reversedRotation?: boolean;
  outputScale: number;
  innerCircle?: boolean;
  dashScale: number;
  dashSize: number;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  dashSpeed: number;
}) => {
  const lineRef = useRef<Line>();
  const groupRef = useRef<Group>();

  const geometry = useMemo(() => {
    const vertices = [];
    const divisions = 128;

    for (let i = 0; i <= divisions; i++) {
      const v = (i / divisions) * (Math.PI * 2);
      const x = Math.sin(v);
      const y = Math.cos(v);
      vertices.push(x, y, 0);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

    return geometry;
  }, []);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }

    if (innerCircle) {
      if (reversedRotation) {
        if (
          lastRotation?.current !== undefined &&
          currentRotation?.current !== undefined &&
          currentRotation.current < lastRotation.current
        ) {
          lineRef.current!.rotation.z += dashSpeed;
        } else {
          lineRef.current!.rotation.z -= dashSpeed;
        }
      } else {
        if (
          lastRotation?.current !== undefined &&
          currentRotation?.current !== undefined &&
          currentRotation.current > lastRotation.current
        ) {
          lineRef.current!.rotation.z -= dashSpeed;
        } else {
          lineRef.current!.rotation.z += dashSpeed;
        }
      }
    } else {
      if (reversedRotation) {
        if (
          lastRotation?.current !== undefined &&
          currentRotation?.current !== undefined &&
          currentRotation.current < lastRotation.current
        ) {
          lineRef.current!.rotation.z -= dashSpeed;
        } else {
          lineRef.current!.rotation.z += dashSpeed;
        }
      } else {
        if (
          lastRotation?.current !== undefined &&
          currentRotation?.current !== undefined &&
          currentRotation.current > lastRotation.current
        ) {
          lineRef.current!.rotation.z += dashSpeed;
        } else {
          lineRef.current!.rotation.z -= dashSpeed;
        }
      }
    }
  });

  return (
    <a.group
      ref={groupRef}
      // @ts-ignore
      rotation={rotation}
      scale={[outputScale, outputScale, outputScale]}
    >
      <a.line
        // @ts-ignore
        ref={lineRef}
        onUpdate={(line: Line) => line.computeLineDistances()}
        geometry={geometry}
        scale={scale.to({
          range: [0.08, 0.2],
          output: [1.55, 4],
        })}
      >
        <lineDashedMaterial
          color={[rgb.r, rgb.g, rgb.b]}
          scale={dashScale}
          dashSize={dashSize}
          gapSize={0.2}
          blending={AdditiveBlending}
          transparent
          opacity={innerCircle ? 0.2 : 1}
        />
      </a.line>
    </a.group>
  );
};

export default DashedCircle;
