import { useFrame } from "@react-three/fiber";
import { a, SpringValue } from "@react-spring/three";
import { useRef } from "react";
import { AdditiveBlending, Group } from "three";

const Frame = ({
  index,
  radius,
  data,
  height,
  gap,
  scale,
}: {
  index: number;
  radius: SpringValue<number>;
  scale: SpringValue<number>;
  height: number;
  gap: SpringValue<number>;
  data: {
    width: number;
    wireframe: boolean;
    color: string;
  };
}) => {
  const groupRef = useRef<Group>();

  useFrame(() => {
    const angle = index * Math.PI * gap.get();

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
