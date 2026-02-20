"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    Float,
    Environment,
    Sparkles,
    ContactShadows,
    PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { useScroll } from "framer-motion";

// --- PROCEDURAL 3D COMPONENTS ---

function CricketBall(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2} {...props}>
            <mesh ref={meshRef} castShadow receiveShadow>
                <sphereGeometry args={[0.5, 64, 64]} />
                <meshPhysicalMaterial
                    color="#cf1b1b"
                    roughness={0.4}
                    metalness={0.1}
                    clearcoat={0.3}
                    clearcoatRoughness={0.2}
                />
                {/* The Seam */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.51, 0.02, 16, 100]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.8} />
                </mesh>
            </mesh>
        </Float>
    );
}

function CricketBat(props: any) {
    const groupRef = useRef<THREE.Group>(null);

    // Slowly rotate the bat over time
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} {...props}>
            <group ref={groupRef} castShadow receiveShadow>
                {/* Blade */}
                <mesh position={[0, -1, 0]} castShadow>
                    <boxGeometry args={[1.2, 3.5, 0.3]} />
                    <meshStandardMaterial color="#f0dca8" roughness={0.7} />
                </mesh>
                {/* Handle */}
                <mesh position={[0, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.15, 0.15, 1.5, 32]} />
                    <meshStandardMaterial color="#333333" roughness={0.6} />
                </mesh>
                {/* Grip */}
                <mesh position={[0, 0.75, 0]} castShadow>
                    <cylinderGeometry args={[0.18, 0.18, 0.2, 32]} />
                    <meshStandardMaterial color="#4f46e5" />
                </mesh>
            </group>
        </Float>
    );
}

function CricketStumps(props: any) {
    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} {...props}>
            <group castShadow receiveShadow>
                {/* 3 Stumps */}
                <mesh position={[-0.4, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 2.5, 16]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 2.5, 16]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
                </mesh>
                <mesh position={[0.4, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 2.5, 16]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
                </mesh>
                {/* 2 Bails */}
                <mesh position={[-0.2, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
                <mesh position={[0.2, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
            </group>
        </Float>
    );
}

// Procedural abstract stadium tunnel rings
function StadiumTunnel() {
    return (
        <group position={[0, 0, -20]}>
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[0, 0, i * 4]} castShadow receiveShadow>
                    <torusGeometry args={[12, 0.2, 16, 100]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
        </group>
    );
}

function StadiumLights() {
    return (
        <group>
            <spotLight position={[10, 15, 10]} angle={0.4} penumbra={1} intensity={300} color="#4f46e5" castShadow />
            <spotLight position={[-10, 15, 10]} angle={0.4} penumbra={1} intensity={300} color="#06b6d4" castShadow />
            <spotLight position={[0, 10, -20]} angle={0.6} penumbra={0.5} intensity={500} color="#ffffff" />

            {/* Tunnel glow */}
            <pointLight position={[0, 0, -10]} intensity={100} color="#818cf8" distance={30} />
        </group>
    );
}

interface CricketJerseyProps {
    primaryColor: string;
    secondaryColor: string;
    teamName: string;
    [key: string]: any;
}

function CricketJersey({ primaryColor, secondaryColor, teamName, ...props }: CricketJerseyProps) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5} {...props}>
            <group ref={groupRef} castShadow receiveShadow>
                {/* Torso */}
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[1.8, 2.5, 0.4]} />
                    <meshStandardMaterial color={primaryColor} roughness={0.9} />
                </mesh>
                {/* Left Sleeve */}
                <mesh position={[-1.2, 0.8, 0]} rotation={[0, 0, 0.5]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
                    <meshStandardMaterial color={secondaryColor} roughness={0.9} />
                </mesh>
                {/* Right Sleeve */}
                <mesh position={[1.2, 0.8, 0]} rotation={[0, 0, -0.5]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
                    <meshStandardMaterial color={secondaryColor} roughness={0.9} />
                </mesh>
                {/* Collar/Neck hole */}
                <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.42, 16]} />
                    <meshStandardMaterial color="#0B0F19" />
                </mesh>
            </group>
        </Float>
    );
}

// --- MAIN CAMERA & SCENE COMPONENT ---

function SceneContents() {
    // Track page scroll
    const { scrollYProgress } = useScroll();

    useFrame((state) => {
        const scroll = scrollYProgress.get(); // 0 to 1

        // Map scroll to Z position: 8 to -30
        const targetZ = 8 - (scroll * 38);
        // Map scroll to slight X rotation (tilt down): 0 to -0.2
        const targetRotX = -(scroll * 0.2);

        // Smoothly interpolate the camera coordinates
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
        state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />

            <color attach="background" args={["#0B0F19"]} />
            <fog attach="fog" args={["#0B0F19", 2, 40]} />
            <ambientLight intensity={0.2} />
            <StadiumLights />

            <Environment preset="city" />

            <Sparkles count={500} scale={30} size={3} speed={0.4} opacity={0.2} color="#a5b4fc" />

            {/* TUNNEL BACKGROUND relative to camera so it seems huge */}
            <StadiumTunnel />

            {/* FOREGROUND ELEMENTS */}
            <CricketBall position={[2.5, 0, -6]} rotation={[0.5, 0.2, 0]} />
            <CricketBat position={[-3, 1, -9]} rotation={[0.2, 0.5, -0.3]} scale={0.8} />

            {/* MIDDLE GROUND ELEMENTS */}
            {/* INDIA JERSEY */}
            <CricketJersey primaryColor="#2563eb" secondaryColor="#1e40af" teamName="INDIA" position={[4, 2, -15]} rotation={[0, -0.2, 0.1]} />
            <CricketStumps position={[-4, -1, -18]} rotation={[0, 0.2, 0]} scale={1.5} />

            {/* BACKGROUND ELEMENTS (Fly past as you scroll deep) */}
            <CricketBall position={[-3, 4, -25]} rotation={[1, 0, 0]} scale={0.7} />
            {/* AUSTRALIA JERSEY */}
            <CricketJersey primaryColor="#eab308" secondaryColor="#ca8a04" teamName="AUS" position={[-2, -1, -26]} rotation={[0.2, 0.5, -0.1]} scale={0.8} />

            <CricketBat position={[3, 2, -28]} rotation={[-0.5, -1, 0.2]} scale={0.6} />

            {/* WEST INDIES JERSEY */}
            <CricketJersey primaryColor="#7f1d1d" secondaryColor="#450a0a" teamName="WINDIES" position={[5, 4, -34]} rotation={[-0.1, -0.6, 0.2]} scale={1.2} />

            {/* Abstract "Pitch" */}
            <ContactShadows position={[0, -3, -15]} opacity={0.5} scale={60} blur={2} far={30} color="#000000" />
            <gridHelper args={[60, 60, "#1e293b", "#0f172a"]} position={[0, -2.9, -15]} />
        </>
    );
}

export default function HeroScene() {
    return (
        <div className="fixed top-0 left-0 w-[100vw] h-[100vh] z-0 pointer-events-none">
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <SceneContents />
                </Suspense>
            </Canvas>
        </div>
    );
}
