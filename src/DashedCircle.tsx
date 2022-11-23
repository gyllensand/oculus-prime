import { extend, useFrame } from "@react-three/fiber";
import { a, SpringValue } from "@react-spring/three";
import { MutableRefObject, useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, Group, Line } from "three";
import { MeshLine, MeshLineMaterial } from "meshline";
import { hexToRgb, pickRandom, pickRandomDecimalFromInterval } from "./utils";
import { LIGHT_BG_COLORS } from "./constants";

extend({ MeshLine, MeshLineMaterial });

const dashScale = pickRandom([
  pickRandomDecimalFromInterval(0.1, 0.5),
  pickRandomDecimalFromInterval(1, 4),
]);
const dashSize =
  dashScale <= 0.3 ? pickRandomDecimalFromInterval(0.2, 0.5) : 0.1;
const color = pickRandom(LIGHT_BG_COLORS);
const rgb = hexToRgb(color);

const DashedCircle = ({
  scale,
  rotation,
  lastRotation,
}: {
  scale: SpringValue<number>;
  rotation: SpringValue<number[]>;
  lastRotation: MutableRefObject<number>;
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
      vertices.push(x, y, 0.5);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  useFrame(() => {
    if (!groupRef.current || lastRotation.current === undefined) {
      return;
    }

    if (rotation.get()[2] > lastRotation.current) {
      lineRef.current!.rotation.z += 0.003;
    } else {
      lineRef.current!.rotation.z -= 0.003;
    }
  });

  return (
    // @ts-ignore
    <a.group ref={groupRef} rotation={rotation}>
      <a.line
        // @ts-ignore
        ref={lineRef}
        onUpdate={(line: Line) => line.computeLineDistances()}
        geometry={geometry}
        scale={scale.to({
          range: [0.15, 0.2, 0.25, 0.3],
          output: [2.6, 3.3, 4.1, 4.6],
        })}
      >
        <lineDashedMaterial
          color={[rgb.r, rgb.g, rgb.b]}
          scale={dashScale}
          dashSize={dashSize}
          gapSize={0.2}
        />
      </a.line>
    </a.group>
  );
};

export default DashedCircle;
