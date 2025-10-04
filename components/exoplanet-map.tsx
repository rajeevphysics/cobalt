"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Grid } from "@react-three/drei"
import * as THREE from "three"
import type { Exoplanet } from "./exoplanet-visualization"

interface ExoplanetMapProps {
  exoplanets: Exoplanet[]
  selectedPlanet: Exoplanet | null
  onSelectPlanet: (planet: Exoplanet) => void
}

function Planet({
  exoplanet,
  isSelected,
  onClick,
}: {
  exoplanet: Exoplanet
  isSelected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        exoplanet.position[1] + Math.sin(state.clock.elapsedTime + exoplanet.position[0]) * 0.1
    }
  })

  const getColor = () => {
    if (exoplanet.type === "confirmed") return "#00ff88" // Green
    if (exoplanet.type === "candidate") return "#ffaa00" // Orange/Yellow
    return "#ff3344" // Red
  }

  const scale = isSelected ? 0.35 : hovered ? 0.3 : 0.25

  return (
    <group position={exoplanet.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.8} wireframe={false} />
      </mesh>

      {/* Glow effect */}
      <mesh scale={scale * 1.3}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>

      {/* Planet name label */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-background/90 border border-primary px-2 py-1 text-xs font-mono text-primary whitespace-nowrap pointer-events-none retro-glow">
            {exoplanet.name}
          </div>
        </Html>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.45, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

function Scene({ exoplanets, selectedPlanet, onSelectPlanet }: ExoplanetMapProps) {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Grid floor */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#00ffff"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#00ffff"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, -5, 0]}
      />

      {/* Planets */}
      {exoplanets.map((exoplanet) => (
        <Planet
          key={exoplanet.id}
          exoplanet={exoplanet}
          isSelected={selectedPlanet?.id === exoplanet.id}
          onClick={() => onSelectPlanet(exoplanet)}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export function ExoplanetMap({ exoplanets, selectedPlanet, onSelectPlanet }: ExoplanetMapProps) {
  return (
    <Canvas camera={{ position: [10, 8, 10], fov: 50 }} style={{ background: "#0a0a0a" }}>
      <Scene exoplanets={exoplanets} selectedPlanet={selectedPlanet} onSelectPlanet={onSelectPlanet} />
    </Canvas>
  )
}
