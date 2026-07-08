"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { AsciiEffect } from "./ascii/AsciiEffect";

export type ModelKey =
  | "bust"
  | "dancer"
  | "starfish"
  | "rose"
  | "helmet"
  | "orchid"
  | "fish"
  | "skull"
  | "teapot"
  | "ladybug";

export const MODEL_OPTIONS: Array<{ key: ModelKey; label: string }> = [
  { key: "bust", label: "Bust" },
  { key: "dancer", label: "Dancer" },
  { key: "starfish", label: "Starfish" },
  { key: "rose", label: "Rose" },
  { key: "helmet", label: "Helmet" },
  { key: "orchid", label: "Orchid" },
  { key: "fish", label: "Fish" },
  { key: "skull", label: "Skull" },
  { key: "teapot", label: "Teapot" },
  { key: "ladybug", label: "Ladybug" },
];

const MODELS: Record<
  ModelKey,
  { url: string; orient: [number, number, number]; target: number; y: number }
> = {
  bust: { url: "/models/bust.glb", orient: [0, 0, 0], target: 5.3, y: -0.7 },
  dancer: { url: "/models/dancer.glb", orient: [0, 0, 0], target: 3.0, y: -0.2 },
  starfish: {
    url: "/models/starfish.glb",
    orient: [0, 0, 0],
    target: 3.8,
    y: -0.05,
  },
  rose: {
    url: "/models/dead-rose.glb",
    orient: [0, 0, 0],
    target: 4.0,
    y: -0.05,
  },
  helmet: {
    url: "/models/closed-helmet.glb",
    orient: [0, 0, 0],
    target: 3.8,
    y: -0.05,
  },
  orchid: {
    url: "/models/embreea.glb",
    orient: [0, 0, 0],
    target: 3.9,
    y: -0.05,
  },
  fish: {
    url: "/models/fish-box.glb",
    orient: [0, 0, 0],
    target: 3.8,
    y: -0.05,
  },
  skull: { url: "/models/skull.glb", orient: [0, 0, 0], target: 3.8, y: -0.05 },
  teapot: {
    url: "/models/teapot.glb",
    orient: [0, 0, 0],
    target: 3.6,
    y: -0.05,
  },
  ladybug: {
    url: "/models/ladybird.glb",
    orient: [0, 0, 0],
    target: 3.5,
    y: -0.05,
  },
};

const BASE_SPIN = 0.35;
const HOVER_MULTIPLIER = 2;
const TILT_FORWARD = 0.12;
const TILT_LEFT = -0.05;
const CAMERA_BASE_Z = 4.5;

function CameraHoverZoom({ hovered }: { hovered: boolean }) {
  useFrame((state) => {
    const targetZ = hovered ? CAMERA_BASE_Z / 1.12 : CAMERA_BASE_Z;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.08;
  });
  return null;
}

function Sculpture({
  modelKey,
  reducedMotion,
  hovered,
}: {
  modelKey: ModelKey;
  reducedMotion: boolean;
  hovered: boolean;
}) {
  const cfg = MODELS[modelKey];
  const { scene } = useGLTF(cfg.url);
  const spin = useRef<THREE.Group>(null);
  const drag = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const autoY = useRef(0);

  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        if (!mesh.geometry.getAttribute("normal")) {
          mesh.geometry.computeVertexNormals();
        }
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#8f86cf",
          roughness: 0.12,
          metalness: 0,
          side: THREE.DoubleSide,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { object: clone, scale: cfg.target / maxDim };
  }, [scene, cfg.target]);

  const spinSpeed = hovered ? BASE_SPIN * HOVER_MULTIPLIER : BASE_SPIN;

  useFrame((_, delta) => {
    const group = spin.current;
    if (!group) return;
    if (!dragging.current && !reducedMotion) autoY.current += delta * spinSpeed;
    group.rotation.x = drag.current.x + TILT_FORWARD;
    group.rotation.y = drag.current.y + autoY.current;
    group.rotation.z = TILT_LEFT;
  });

  useEffect(() => {
    const container = document.querySelector("[data-ascii-canvas]");
    if (!container) return;

    const down = (event: Event) => {
      const pointer = event as PointerEvent;
      dragging.current = true;
      last.current = { x: pointer.clientX, y: pointer.clientY };
    };
    const move = (event: Event) => {
      if (!dragging.current) return;
      const pointer = event as PointerEvent;
      const dx = (pointer.clientX - last.current.x) * 0.005;
      const dy = (pointer.clientY - last.current.y) * 0.005;
      last.current = { x: pointer.clientX, y: pointer.clientY };
      drag.current = { x: drag.current.x - dy, y: drag.current.y + dx };
    };
    const up = () => {
      dragging.current = false;
    };

    container.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      container.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <group ref={spin} position={[0, cfg.y, 0]}>
      <group rotation={cfg.orient} scale={scale}>
        <primitive object={object} />
      </group>
    </group>
  );
}

function Scene({
  modelKey,
  glyphColor,
  paperColor,
  reducedMotion,
  hovered,
  resolution,
  onReady,
}: {
  modelKey: ModelKey;
  glyphColor: string;
  paperColor: string;
  reducedMotion: boolean;
  hovered: boolean;
  resolution: THREE.Vector2;
  onReady?: () => void;
}) {
  const { gl } = useThree();
  const frames = useRef(0);
  const firedReady = useRef(false);

  useFrame(() => {
    frames.current++;
    if (!firedReady.current && frames.current >= 8) {
      const ctx = gl.getContext();
      if (ctx && !(ctx as WebGLRenderingContext).isContextLost?.()) {
        firedReady.current = true;
        onReady?.();
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.34} />
      <hemisphereLight args={["#ffffff", "#5c5a70", 0.78]} />
      <directionalLight position={[2.5, 3.5, 5]} intensity={3.4} />
      <directionalLight position={[-3, 1.8, 3]} intensity={1.1} />
      <CameraHoverZoom hovered={hovered} />
      <Suspense fallback={null}>
        <Sculpture
          modelKey={modelKey}
          reducedMotion={reducedMotion}
          hovered={hovered}
        />
      </Suspense>
      <EffectComposer multisampling={0}>
        <AsciiEffect
          cellSize={6}
          invert
          volumeShading
          tintColor={glyphColor}
          paperColor={paperColor}
          contrastAdjust={1.55}
          brightnessAdjust={0.04}
          resolution={resolution}
        />
      </EffectComposer>
    </>
  );
}

export function AsciiScene({
  modelKey,
  glyphColor,
  paperColor = "#fdfdf8",
  reducedMotion = false,
  onReady,
}: {
  modelKey: ModelKey;
  glyphColor: string;
  paperColor?: string;
  reducedMotion?: boolean;
  onReady?: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [resolution] = useState(() => new THREE.Vector2(1280, 1280));

  useEffect(() => {
    const element = wrap.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      resolution.set(rect.width || 1280, rect.height || 1280);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [resolution]);

  return (
    <div
      ref={wrap}
      data-ascii-canvas
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="ascii-canvas"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 0.6;
        }}
      >
        <Scene
          modelKey={modelKey}
          glyphColor={glyphColor}
          paperColor={paperColor}
          reducedMotion={reducedMotion}
          hovered={hovered}
          resolution={resolution}
          onReady={onReady}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/bust.glb");
useGLTF.preload("/models/dancer.glb");
useGLTF.preload("/models/starfish.glb");
useGLTF.preload("/models/dead-rose.glb");
useGLTF.preload("/models/closed-helmet.glb");
useGLTF.preload("/models/embreea.glb");
useGLTF.preload("/models/fish-box.glb");
useGLTF.preload("/models/skull.glb");
useGLTF.preload("/models/teapot.glb");
useGLTF.preload("/models/ladybird.glb");
