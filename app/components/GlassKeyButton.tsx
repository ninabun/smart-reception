"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useRef } from "react";
import type { Mesh } from "three";

type GlassKeyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  showScene?: boolean;
  tone?: "blue" | "green" | "red" | "neutral";
};

const toneColors = {
  blue: "#8cc8ff",
  green: "#8fe8bf",
  red: "#ff9a8f",
  neutral: "#f8fbff"
};

function KeyScene({ tone }: { tone: NonNullable<GlassKeyButtonProps["tone"]> }) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.x = -0.42 + Math.sin(elapsed * 0.7) * 0.018;
      meshRef.current.rotation.y = Math.sin(elapsed * 0.55) * 0.025;
    }

    if (glowRef.current) {
      glowRef.current.position.x = Math.sin(elapsed * 0.65) * 0.38;
      glowRef.current.position.y = 0.18 + Math.cos(elapsed * 0.45) * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight color="#ffffff" intensity={2.2} position={[1.8, 2.4, 3]} />
      <mesh ref={meshRef} position={[0, -0.08, 0]} scale={[2.9, 1.18, 0.16]}>
        <boxGeometry args={[1, 1, 0.16, 8, 8, 1]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.16}
          color="#ffffff"
          ior={1.35}
          metalness={0}
          opacity={0.5}
          roughness={0.12}
          thickness={0.9}
          transmission={0.45}
          transparent
        />
      </mesh>
      <mesh ref={glowRef} position={[0.2, 0.18, 0.16]} scale={[0.85, 0.18, 0.02]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color={toneColors[tone]} opacity={0.34} transparent />
      </mesh>
    </>
  );
}

export default function GlassKeyButton({
  children,
  className = "",
  showScene = true,
  tone = "neutral",
  type = "button",
  ...props
}: GlassKeyButtonProps) {
  return (
    <button className={`glass-key-button ${className}`} type={type} {...props}>
      {showScene ? (
        <span className="glass-key-canvas" aria-hidden="true">
          <Canvas camera={{ fov: 36, position: [0, 0, 4.4] }} dpr={[1, 1.5]} gl={{ alpha: true }}>
            <KeyScene tone={tone} />
          </Canvas>
        </span>
      ) : null}
      <span className="glass-key-content">{children}</span>
    </button>
  );
}
