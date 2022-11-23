import { OrbitControls, useHelper, useTexture } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { a, useSpring, useSprings } from "@react-spring/three";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  CustomBlending,
  DoubleSide,
  DstAlphaFactor,
  DstColorFactor,
  Mesh,
  OneMinusDstAlphaFactor,
  OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor,
  PointLightHelper,
  RepeatWrapping,
  SpotLight,
  SpotLightHelper,
  Texture,
  Vector3,
} from "three";
import {
  getSizeByAspect,
  getSizeByWidthAspect,
  pickRandom,
  pickRandomDecimalFromInterval,
  pickRandomIntFromInterval,
  pickRandomSphericalPos,
  range,
} from "./utils";
import { COLORS, BG_COLORS } from "./constants";
import DashedCircle from "./DashedCircle";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import Dots from "./Dots";

const bgColor = pickRandom(BG_COLORS);
const spotlightAngle = pickRandomDecimalFromInterval(0.15, 0.3);
const spotlightCorner1Y = pickRandomDecimalFromInterval(-4, 4);
const spotlightCorner2Y = pickRandomDecimalFromInterval(-4, 4);
const bgShapeCount = pickRandomIntFromInterval(3, 5);

const Scene = ({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) => {
  const { aspect } = useThree((state) => ({
    aspect: state.viewport.aspect,
  }));

  const spotlightCorner1Ref = useRef<SpotLight>();
  const spotlightCorner2Ref = useRef<SpotLight>();
  const lastDashedCircleRotation = useRef(0);
  const toneInitialized = useRef(false);

  const textures = useTexture([
    "/textures/1.png",
    "/textures/4.png",
    "/textures/5.png",
    "/textures/6.png",
    "/textures/7.png",
    "/textures/8.png",
    "/textures/9.png",
    "/textures/10.png",
    "/textures/11.png",
    "/textures/12.png",
    "/textures/13.png",
    "/textures/14.png",
    "/textures/15.png",
    "/textures/16.png",
  ]);

  const bgShapes = useMemo(
    () =>
      new Array(bgShapeCount).fill(null).map((o, i) => {
        return {
          opacity: pickRandomDecimalFromInterval(0.1, 0.5),
          width: pickRandomDecimalFromInterval(4, 8),
          height: pickRandomDecimalFromInterval(4, 8),
          color: pickRandom(COLORS),
          shape: pickRandom([0, 1, 2, 3]),
          texture: pickRandom(textures),
          position: new Vector3(
            pickRandomDecimalFromInterval(-3, 3),
            pickRandomDecimalFromInterval(-3, 3),
            -i
          ),
        };
      }),
    []
  );

  const ladder = useMemo(() => {
    const lineCount = pickRandomIntFromInterval(75, 150);
    const width = pickRandomDecimalFromInterval(12, 14);
    const wireframeOptions = pickRandom([0, 1, 2]);
    const wireframe =
      wireframeOptions === 0
        ? false
        : wireframeOptions === 1
        ? true
        : pickRandom([true, false]);

    const colorOptions = pickRandom([0, 1, 2]);
    const priColor = pickRandom(COLORS);
    const secColor = pickRandom(COLORS);
    const colorSeparator = pickRandomIntFromInterval(0, lineCount);

    return {
      size: pickRandomDecimalFromInterval(0.5, 1),
      rotation: pickRandomDecimalFromInterval(0, Math.PI * 2),
      innerRotation: pickRandomDecimalFromInterval(15, 80),
      separatorDistance: pickRandomDecimalFromInterval(2, 10),
      width,
      height: pickRandomDecimalFromInterval(0.1, 0.3),
      lines: new Array(lineCount).fill(null).map((o, i) => ({
        width: pickRandomDecimalFromInterval(width, width + 1),
        wireframe,
        color:
          colorOptions === 0
            ? priColor
            : colorOptions === 1
            ? i < colorSeparator
              ? priColor
              : secColor
            : i % 2 === 0
            ? priColor
            : secColor,
      })),
    };
  }, []);

  const [lineSprings, setLineSprings] = useSprings(
    ladder.lines.length,
    (i) => ({
      rotation: [0, 0, i / ladder.innerRotation],
      scale: 1,
    })
  );

  const [bgShapeSprings, setBgShapeSprings] = useSprings(bgShapeCount, (i) => ({
    position: [
      bgShapes[i].position.x,
      bgShapes[i].position.y,
      bgShapes[i].position.z,
    ],
    scale: [1, 1, 1],
  }));

  const [{ angle, intensity }, setSpotlightSpring] = useSpring(() => ({
    angle: spotlightAngle,
    intensity: 1,
  }));

  const [dashedCircleSprings, setDashedCircleSpring] = useSpring(() => ({
    rotation: [0, 0, 0],
  }));

  const onPointerDown = useCallback(() => {
    const newRotation = pickRandomDecimalFromInterval(15, 100);
    const newScale = pickRandomDecimalFromInterval(0.5, 1.5);

    setLineSprings.start((i) => ({
      rotation: [0, 0, i / newRotation],
      scale: pickRandomDecimalFromInterval(newScale - 0.1, newScale + 0.1),
      config: { mass: 1, tension: 100, friction: 25 },
    }));

    const newAngle = pickRandomDecimalFromInterval(0.15, 0.3);

    setSpotlightSpring.start(() => ({
      angle: newAngle,
      intensity: pickRandomDecimalFromInterval(0.5, 1),
      config: { mass: 1, tension: 100, friction: 25 },
    }));

    lastDashedCircleRotation.current = range(
      0.15,
      0.3,
      -Math.PI / 2,
      Math.PI / 2,
      angle.get()
    );

    setDashedCircleSpring.start(() => ({
      rotation: [0, 0, range(0.15, 0.3, -Math.PI / 2, Math.PI / 2, newAngle)],
      config: { mass: 1, tension: 100, friction: 25 },
    }));

    setBgShapeSprings.start((i) => ({
      position: [
        pickRandomDecimalFromInterval(-3, 3),
        pickRandomDecimalFromInterval(-3, 3),
        -i,
      ],
      scale: [
        pickRandomDecimalFromInterval(0.75, 1.25),
        pickRandomDecimalFromInterval(0.75, 1.25),
        1,
      ],
      delay: i * 20,
      config: { mass: 1, tension: 100, friction: 25 },
    }));
  }, [
    setLineSprings,
    setBgShapeSprings,
    setSpotlightSpring,
    setDashedCircleSpring,
    angle,
  ]);

  const onPointerUp = useCallback(() => {}, []);

  useEffect(() => {
    const ref = canvasRef?.current;

    if (!ref) {
      return;
    }

    ref.addEventListener("pointerdown", onPointerDown);
    ref.addEventListener("pointerup", onPointerUp);

    return () => {
      ref.removeEventListener("pointerdown", onPointerDown);
      ref.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerDown, onPointerUp, canvasRef]);

  useEffect(() => {
    spotlightCorner1Ref.current?.target.position.set(-3, spotlightCorner1Y, 0);
    spotlightCorner1Ref.current?.target.updateMatrixWorld();
    spotlightCorner2Ref.current?.target.position.set(3, spotlightCorner2Y, 0);
    spotlightCorner2Ref.current?.target.updateMatrixWorld();
  }, []);

  const spotlightRef = useRef<SpotLight>();
  useHelper(spotlightRef, SpotLightHelper, "red");

  const pointlightRef = useRef();
  useHelper(pointlightRef, PointLightHelper, 1, "red");
  const pointlightRef2 = useRef();
  useHelper(pointlightRef2, PointLightHelper, 1, "red");
  return (
    <>
      <color attach="background" args={[bgColor]} />
      <OrbitControls enabled={true} />
      {/* <ambientLight /> */}

      {/* <pointLight
        ref={pointlightRef}
        intensity={1}
        // castShadow
        position={[-4, 0, 5]}
      />
      <pointLight
        ref={pointlightRef2}
        intensity={1}
        // castShadow
        position={[4, 0, 5]}
      /> */}
      <group
        scale={[
          getSizeByAspect(1, aspect),
          getSizeByAspect(1, aspect),
          getSizeByAspect(1, aspect),
        ]}
      >
        {/*
      // @ts-ignore */}
        <a.spotLight
          // ref={spotlightRef}
          position={[0, 0, 20]}
          penumbra={0.5}
          angle={angle}
          intensity={intensity}
        />

        {/* <a.spotLight
          ref={spotlightCorner1Ref}
          position={[-3, spotlightCorner1Y, 20]}
          penumbra={0.5}
          angle={0.05}
          intensity={1}
        />

        <a.spotLight
          ref={spotlightCorner2Ref}
          position={[3, spotlightCorner2Y, 20]}
          penumbra={0.5}
          angle={0.05}
          intensity={1}
        /> */}

        <group
          rotation={[0, 0, ladder.rotation]}
          scale={[ladder.size, ladder.size, ladder.size]}
        >
          <group
            position={[
              0,
              -(ladder.lines.length / 2) / ladder.separatorDistance,
              -10,
            ]}
          >
            {ladder.lines.map((o, i) => (
              <a.mesh
                key={i}
                position={[0, i / 5, 0]}
                rotation={lineSprings[i].rotation as any}
                scale={lineSprings[i].scale as any}
              >
                <planeBufferGeometry args={[o.width, ladder.height]} />
                <meshBasicMaterial
                  color={o.color}
                  wireframe={o.wireframe}
                  blending={AdditiveBlending}
                />
              </a.mesh>
            ))}
          </group>
        </group>

        <group>
          {bgShapes.map((o, i) => (
            <a.mesh
              key={i}
              castShadow
              receiveShadow
              position={bgShapeSprings[i].position as any}
              scale={bgShapeSprings[i].scale as any}
              rotation={o.shape !== 0 ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
            >
              {o.shape === 0 ? (
                <boxBufferGeometry args={[o.width, o.height, 0.1]} />
              ) : o.shape === 1 ? (
                <cylinderBufferGeometry
                  args={[o.width / 2.5, o.width / 2.5, 0.1, 128, 128]}
                />
              ) : o.shape === 2 ? (
                <cylinderBufferGeometry
                  args={[o.width / 2.5, o.width / 2.5, 0.1, 128, 128]}
                />
              ) : (
                <cylinderBufferGeometry
                  args={[o.width / 2.5, o.width / 2.5, 0.1, 6, 6]}
                />
              )}

              <meshPhongMaterial
                color={o.color}
                side={DoubleSide}
                transparent
                depthWrite={false}
                opacity={o.opacity}
                toneMapped={false}
                blending={AdditiveBlending}
                // aoMap={o.texture}
                // metalness={0.5}
                // roughness={0.5}
                shininess={2}
              />
            </a.mesh>
          ))}
        </group>

        {/* <mesh position={[0, 5, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <planeBufferGeometry args={[10, 10]} />
          <meshStandardMaterial color={bgColor} blending={AdditiveBlending} />
        </mesh>
        <mesh position={[-5, 0, 5]} rotation={[0, Math.PI / 2, 0]}>
          <planeBufferGeometry args={[10, 10]} />
          <meshStandardMaterial color={bgColor} blending={AdditiveBlending} />
        </mesh>
        <mesh position={[5, 0, 5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeBufferGeometry args={[10, 10]} />
          <meshStandardMaterial color={bgColor} blending={AdditiveBlending} />
        </mesh>
        <mesh position={[0, -5, 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeBufferGeometry args={[10, 10]} />
          <meshStandardMaterial color={bgColor} blending={AdditiveBlending} />
        </mesh> */}

        <DashedCircle
          scale={angle}
          rotation={dashedCircleSprings.rotation}
          lastRotation={lastDashedCircleRotation}
        />
        {/* <Dots count={5000} /> */}
      </group>
      <EffectComposer>
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
        <Noise opacity={0.05} />
      </EffectComposer>
    </>
  );
};

export default Scene;
