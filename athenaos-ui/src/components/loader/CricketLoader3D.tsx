'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

function CricketBat() {
    // Procedural Cricket Bat using basic geometry
    // Handle + Blade
    return (
        <group rotation={[0, 0, -Math.PI / 4]}>
            {/* Handle */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.5, 32]} />
                <meshStandardMaterial color="#d4c5a3" roughness={0.8} />
            </mesh>
            {/* Blade */}
            <mesh position={[0, -0.6, 0]}>
                <boxGeometry args={[0.25, 1.5, 0.05]} />
                <meshStandardMaterial
                    color="#e8dcb5"
                    roughness={0.4}
                    metalness={0.1}
                />
            </mesh>
            {/* Spine/Ridge (Subtle) */}
            <mesh position={[0, -0.6, 0.025]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.1, 1.4, 0.02]} />
                <meshStandardMaterial color="#e0d4ae" />
            </mesh>
        </group>
    );
}

function CricketBall() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * 2;
        meshRef.current.rotation.y += delta * 1.5;
    });

    return (
        <mesh ref={meshRef} position={[0.6, -0.2, 0.5]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial
                color="#a31a1a" // Deep Cricket Red
                roughness={0.3}
                metalness={0.2}
            />
            {/* Simulate Seam with a ring/torus? Or just simple texture. Keeping procedural simple for now. */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.12, 0.005, 16, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
        </mesh>
    );
}

function Scene() {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        // Gentle floating rotation of the entire ensemble
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
        groupRef.current.position.y = Math.sin(t * 1) * 0.1;
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <CricketBat />
                <CricketBall />
            </Float>
        </group>
    );
}

export default function CricketLoader3D() {
    return (
        <div className="w-full h-[400px] md:h-[500px]">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Scene />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
