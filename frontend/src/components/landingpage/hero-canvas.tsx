"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 3200;
  const elapsed = useRef(0);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!ref.current) return;
    ref.current.rotation.y = elapsed.current * 0.04;
    ref.current.rotation.x = elapsed.current * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#c8a96e" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function GlassMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);

  useFrame((state, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;
    if (!meshRef.current) return;
    meshRef.current.rotation.x = t * 0.07;
    meshRef.current.rotation.y = t * 0.11;
    // Gentle mouse parallax
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      state.pointer.x * 1.2,
      0.03,
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      state.pointer.y * 0.7,
      0.03,
    );
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(t * 0.7) * 4;
      lightRef.current.position.y = Math.cos(t * 0.5) * 3;
      lightRef.current.position.z = Math.cos(t * 0.4) * 2 + 2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.5}>
      <pointLight ref={lightRef} color="#c8a96e" intensity={8} distance={10} />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 6]} />
        <meshPhysicalMaterial
          color="#0e0e1a"
          metalness={0.85}
          roughness={0.08}
          transmission={0.2}
          thickness={2}
          envMapIntensity={0}
          iridescence={0.5}
          iridescenceIOR={1.5}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <icosahedronGeometry args={[2.22, 2]} />
        <meshBasicMaterial color="#c8a96e" wireframe transparent opacity={0.06} />
      </mesh>
    </Float>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.15} color="#1a1a2e" />
      <pointLight color="#c8a96e" intensity={4} position={[3, 2, 4]} />
      <pointLight color="#818cf8" intensity={2} position={[-4, -2, 2]} />
      <GlassMesh />
      <Particles />
    </Canvas>
  );
}
