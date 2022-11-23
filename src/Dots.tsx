import { useRef, useMemo, useEffect } from "react";
import { InstancedMesh, Matrix4, Vector3 } from "three";

const Dots = ({ count }: { count: number }) => {
  const ref = useRef<InstancedMesh>();

  const { vec, transform, positions } = useMemo(() => {
    const vec = new Vector3();
    const transform = new Matrix4();

    const positions = [...Array(count)].map((_, i) => {
      const position = new Vector3();

      position.x = (i % 100) - 50;
      position.y = Math.floor(i / 100) - 50;

      position.y += (i % 2) * 0.5;

      position.x += Math.random() * 0.3;
      position.y += Math.random() * 0.3;

      return position;
    });

    return { vec, transform, positions };
  }, [count]);

  //   useFrame(({ clock }) => {
  //     if (!ref.current) {
  //       return;
  //     }

  //     for (let i = 0; i < 10000; ++i) {
  //       const dist = distances[i];
  //       const t = clock.elapsedTime - dist / 25;
  //       const wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1 / 3.8);

  //       vec.copy(positions[i]).multiplyScalar(wave + 1.3);
  //       transform.setPosition(vec);

  //       ref.current?.setMatrixAt(i, transform);
  //     }

  //     // @ts-ignore
  //     ref.current!.instanceMatrix.needsUpdate = true;
  //   });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    for (let i = 0; i < count; ++i) {
      vec.copy(positions[i]).multiplyScalar(3);
      transform.setPosition(vec);

      ref.current!.setMatrixAt(i, transform);
    }

    // @ts-ignore
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [positions, vec, transform, count]);

  return (
    <instancedMesh
      position={[0, 50, -50]}
      ref={ref}
      args={[undefined, undefined, count]}
    >
      <circleBufferGeometry args={[0.15]} />
      <meshBasicMaterial transparent opacity={0.1} />
    </instancedMesh>
  );
};

export default Dots;
