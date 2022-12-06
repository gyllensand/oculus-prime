import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { a, useSpring, useSprings } from "@react-spring/three";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { AdditiveBlending, DoubleSide, SpotLight, Vector3 } from "three";
import {
  getSizeByAspect,
  hexToRgb,
  pickRandom,
  pickRandomBoolean,
  pickRandomDecimalFromInterval,
  pickRandomIntFromInterval,
  range,
} from "./utils";
import { COLORS, BG_COLORS, LIGHT_BG_COLORS } from "./constants";
import DashedCircle from "./DashedCircle";
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import Frame from "./Frame";

const bgColor = pickRandom(BG_COLORS);
const spotlightAngle = pickRandomDecimalFromInterval(0.08, 0.2, 2);
const spotlightCorner1Y = pickRandomDecimalFromInterval(-4, 4);
const spotlightCorner2Y = pickRandomDecimalFromInterval(-4, 4);
const bgShapeCount = pickRandomIntFromInterval(5, 10);

const reversedRotation = pickRandomBoolean();
const noiseOpacity = pickRandomDecimalFromInterval(0.05, 0.1);

/******** */

const frameLineCount = pickRandomIntFromInterval(20, 200);
const frameWidth = pickRandomDecimalFromInterval(0.1, 2, 3);
const frameWireframeOptions = pickRandom([0, 1, 2]);
const frameWireframe =
  frameWireframeOptions === 0
    ? false
    : frameWireframeOptions === 1
    ? true
    : pickRandom([true, false]);

const frameColorOptions = pickRandom([0, 1, 2]);
const framePriColor = pickRandom(COLORS);
const frameSecColor = pickRandom(COLORS);
const frameColorSeparator = pickRandomIntFromInterval(0, frameLineCount);
const frameRotation = pickRandomDecimalFromInterval(0, Math.PI * 2);
const frameGap =
  frameLineCount > 100
    ? pickRandom([
        pickRandomDecimalFromInterval(0.005, 0.01, 3),
        pickRandomDecimalFromInterval(0.01, 0.03, 3),
        pickRandomDecimalFromInterval(0.01, 0.03, 3),
      ])
    : pickRandomDecimalFromInterval(0.01, 0.03, 3);
const frameHeight = pickRandomDecimalFromInterval(0.03, 0.1, 3);
const frameLines = new Array(frameLineCount).fill(null).map((o, i) => ({
  width: pickRandomDecimalFromInterval(frameWidth, frameWidth + 0.5),
  wireframe: frameWireframe,
  color:
    frameColorOptions === 0
      ? framePriColor
      : frameColorOptions === 1
      ? i < frameColorSeparator
        ? framePriColor
        : frameSecColor
      : i % 2 === 0
      ? framePriColor
      : frameSecColor,
}));

/******** */

const dashedCircleCount = pickRandom([
  ...new Array(9).fill(null).map(() => 1),
  2,
]);

const dashedCircles = new Array(dashedCircleCount).fill(null).map(() => {
  const dashScale = pickRandom([
    pickRandomDecimalFromInterval(0.1, 0.5),
    pickRandomDecimalFromInterval(1, 4),
  ]);
  const dashSize =
    dashScale <= 0.3 ? pickRandomDecimalFromInterval(0.2, 0.5) : 0.1;
  const color = pickRandom(LIGHT_BG_COLORS);
  const rgb = hexToRgb(color);

  const dashSpeed = pickRandomDecimalFromInterval(0.002, 0.004, 4);

  return {
    dashScale,
    dashSize,
    rgb,
    dashSpeed,
  };
});

/********* */

const bgShapes = new Array(bgShapeCount).fill(null).map((o, i) => {
  const shape = pickRandom([0, 0, 1, 2, 3, 4]);
  const wireframe = shape === 0 || shape === 1 ? pickRandomBoolean() : false;
  const planeSegments = pickRandom([
    [1, 64],
    [64, 1],
    [64, 64],
  ]);
  const roughness = pickRandomDecimalFromInterval(0.5, 1, 2);
  const metalness = pickRandomDecimalFromInterval(0, 2, 2);

  return {
    opacity: pickRandomDecimalFromInterval(0.1, 0.5),
    width: pickRandomDecimalFromInterval(4, 8),
    height: pickRandomDecimalFromInterval(4, 8),
    color: pickRandom(COLORS),
    shape,
    wireframe,
    planeSegments,
    roughness,
    metalness,
    rotation: pickRandomDecimalFromInterval(-Math.PI, Math.PI),
    position: new Vector3(
      pickRandomDecimalFromInterval(-3, 3),
      pickRandomDecimalFromInterval(-3, 3),
      -i
    ),
  };
});

const Scene = ({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) => {
  const { aspect } = useThree((state) => ({
    aspect: state.viewport.aspect,
  }));

  const spotlightCorner1Ref = useRef<SpotLight>();
  const spotlightCorner2Ref = useRef<SpotLight>();
  const lastSpotlightAngle = useRef<number>();
  const currentSpotlightAngle = useRef(spotlightAngle);
  const toneInitialized = useRef(false);

  const [frameSprings, setFrameSprings] = useSprings(frameLineCount, (i) => ({
    scale: 1,
    gap: frameGap,
  }));

  const [bgShapeSprings, setBgShapeSprings] = useSprings(bgShapeCount, (i) => ({
    position: [
      bgShapes[i].position.x,
      bgShapes[i].position.y,
      bgShapes[i].position.z,
    ],
    scale: [1, 1, 1],
    rotation: [0, 0, bgShapes[i].rotation],
  }));

  const [{ angle, intensity }, setSpotlightSpring] = useSpring(() => ({
    angle: spotlightAngle,
    intensity: 1,
  }));

  const [dashedCircleSprings, setDashedCircleSpring] = useSpring(() => ({
    rotation: [0, 0, 0],
  }));

  const onPointerDown = useCallback(() => {
    const newRotation = pickRandomDecimalFromInterval(15, 100, 1, Math.random);
    const newScale = pickRandomDecimalFromInterval(0.5, 1.5, 1, Math.random);
    const newGap = pickRandomDecimalFromInterval(
      frameGap - 0.001,
      frameGap + 0.001,
      3,
      Math.random
    );

    setFrameSprings.start((i) => ({
      rotation: [0, 0, i / newRotation],
      gap: newGap,
      scale: pickRandomDecimalFromInterval(
        newScale - 0.1,
        newScale + 0.1,
        2,
        Math.random
      ),
      config: { mass: 1, tension: 100, friction: 25 },
    }));

    const newAngle = pickRandomDecimalFromInterval(0.08, 0.2, 2, Math.random);
    lastSpotlightAngle.current = angle.get();
    currentSpotlightAngle.current = newAngle;

    setSpotlightSpring.start(() => ({
      angle: newAngle,
      intensity: pickRandomDecimalFromInterval(1, 1.5, 1, Math.random),
      config: { mass: 1, tension: 100, friction: 25 },
    }));

    setDashedCircleSpring.start(() => ({
      rotation: [0, 0, range(0.08, 0.2, -Math.PI / 2, Math.PI / 2, newAngle)],
      config: { mass: 1, tension: 100, friction: 25 },
    }));

    setBgShapeSprings.start((i) => ({
      position: [
        pickRandomDecimalFromInterval(-3, 3, 1, Math.random),
        pickRandomDecimalFromInterval(-3, 3, 1, Math.random),
        -i,
      ],
      scale: [
        pickRandomDecimalFromInterval(0.75, 1.25, 2, Math.random),
        pickRandomDecimalFromInterval(0.75, 1.25, 2, Math.random),
        1,
      ],
      rotation: [
        0,
        0,
        pickRandomDecimalFromInterval(
          bgShapes[i].rotation - Math.PI / 2,
          bgShapes[i].rotation + Math.PI / 2,
          2,
          Math.random
        ),
      ],
      delay: i * 20,
      config: { mass: 1, tension: 100, friction: 25 },
    }));
  }, [
    setBgShapeSprings,
    setSpotlightSpring,
    setDashedCircleSpring,
    setFrameSprings,
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

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <OrbitControls enabled={true} />

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
          position={[0, 0, 20]}
          penumbra={0.5}
          angle={angle}
          intensity={intensity}
        />

        <group rotation={[0, 0, frameRotation]}>
          {frameLines.map((o, i) => (
            <Frame
              key={i}
              index={i}
              radius={angle}
              data={o}
              gap={frameSprings[i].gap}
              height={frameHeight}
              scale={frameSprings[i].scale}
            />
          ))}
        </group>

        <group>
          {bgShapes.map((o, i) => (
            <a.mesh
              key={i}
              position={bgShapeSprings[i].position as any}
              scale={bgShapeSprings[i].scale as any}
              rotation={bgShapeSprings[i].rotation as any}
            >
              {o.shape === 0 ? (
                <planeBufferGeometry
                  args={[
                    o.width,
                    o.height,
                    o.planeSegments[0],
                    o.planeSegments[1],
                  ]}
                />
              ) : o.shape === 1 ? (
                <circleBufferGeometry args={[o.width / 2.5, 128]} />
              ) : o.shape === 2 ? (
                <circleBufferGeometry args={[o.width / 2.5, 3]} />
              ) : o.shape === 3 ? (
                <circleBufferGeometry args={[o.width / 2.5, 128, 0, Math.PI]} />
              ) : (
                <circleBufferGeometry args={[o.width / 2.5, 6]} />
              )}

              <meshStandardMaterial
                color={o.color}
                side={DoubleSide}
                transparent
                depthWrite={false}
                opacity={o.opacity}
                toneMapped={false}
                blending={AdditiveBlending}
                roughness={o.roughness}
                metalness={o.metalness}
                wireframe={o.wireframe}
              />
            </a.mesh>
          ))}
        </group>

        {dashedCircles.map((o, i) => (
          <DashedCircle
            {...o}
            key={i}
            scale={angle}
            rotation={dashedCircleSprings.rotation}
            lastRotation={lastSpotlightAngle}
            currentRotation={currentSpotlightAngle}
            reversedRotation={reversedRotation}
            outputScale={i === 0 ? 1 : 0.95}
            innerCircle={i === 1}
          />
        ))}
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
        <Noise opacity={noiseOpacity} />
      </EffectComposer>
    </>
  );
};

export default Scene;
