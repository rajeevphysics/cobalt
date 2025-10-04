"use client"

import React from "react"
import { useRef, useState, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"
import type { Exoplanet, StarData } from "./exoplanet-visualization"

interface ExoplanetMapProps {
  exoplanet: Exoplanet
  starData: StarData
  selectedPlanet: Exoplanet | null
  onSelectPlanet: (planet: Exoplanet) => void
  isPlaying: boolean
}

function HostStar({ starData }: { starData: StarData }) {
  const starRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      glowRef.current.scale.setScalar(pulse)
    }
  })

  const starSize = starData.visualScale || 1.0

  const starColor = "#ffffff" // All stars are white in black and white mode

  return (
    <group>
      {/* Core star */}
      <mesh ref={starRef}>
        <sphereGeometry args={[starSize, 16, 16]} />
        <meshBasicMaterial color={starColor} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[starSize, 16, 16]} />
        <meshBasicMaterial color={starColor} transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Outer glow */}
      <mesh scale={2.5}>
        <sphereGeometry args={[starSize, 16, 16]} />
        <meshBasicMaterial color={starColor} transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>

      {/* Point light for illumination */}
      <pointLight position={[0, 0, 0]} intensity={3} distance={30} color={starColor} />
    </group>
  )
}

function OrbitalPath({ radius }: { radius: number }) {
  const geometry = useMemo(() => {
    const points = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.4} />
    </line>
  )
}

const Planet = React.memo(function Planet({
  exoplanet,
  isSelected,
  onClick,
  isPlaying,
  currentTime,
}: {
  exoplanet: Exoplanet
  isSelected: boolean
  onClick: () => void
  isPlaying: boolean
  currentTime: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const position = useMemo(() => {
    if (
      exoplanet.orbitalRadius &&
      exoplanet.orbitalPeriod &&
      !isNaN(exoplanet.orbitalRadius) &&
      !isNaN(exoplanet.orbitalPeriod)
    ) {
      const orbitalSpeed = (2 * Math.PI) / (exoplanet.orbitalPeriod * 0.1)
      const currentAngle = (exoplanet.orbitalAngle || 0) + (isPlaying ? currentTime * orbitalSpeed : 0)
      const x = Math.cos(currentAngle) * exoplanet.orbitalRadius
      const z = Math.sin(currentAngle) * exoplanet.orbitalRadius

      // Validate calculated values
      if (!isNaN(x) && !isNaN(z)) {
        return [x, 0, z] as [number, number, number]
      }
    }

    // Fallback to exoplanet.position if it exists and is valid, otherwise use origin
    if (
      exoplanet.position &&
      Array.isArray(exoplanet.position) &&
      exoplanet.position.length === 3 &&
      !isNaN(exoplanet.position[0]) &&
      !isNaN(exoplanet.position[1]) &&
      !isNaN(exoplanet.position[2])
    ) {
      return exoplanet.position
    }

    // Final fallback to origin
    return [0, 0, 0] as [number, number, number]
  }, [exoplanet, isPlaying, currentTime])

  const color = "#ffffff"

  const basePlanetSize = exoplanet.visualScale || 0.2
  const planetSize = basePlanetSize * (isSelected ? 1.5 : hovered ? 1.2 : 1.0)

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[planetSize, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      {(hovered || isSelected) && (
        <Html position={[0, planetSize + 0.1, 0]} center distanceFactor={8}>
          <div className="bg-background/90 border border-primary/50 px-2 py-1 text-xs font-mono text-primary whitespace-nowrap pointer-events-none">
            {exoplanet.name}
          </div>
        </Html>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planetSize * 1.3, planetSize * 1.5, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
})

function InfiniteGrid() {
  return (
    <>
      <gridHelper
        args={[100, 50, "#ffffff", "#ffffff"]}
        position={[0, -0.01, 0]}
        material-opacity={0.15}
        material-transparent={true}
      />
    </>
  )
}

function Scene({ exoplanet, starData, selectedPlanet, onSelectPlanet, isPlaying }: ExoplanetMapProps) {
  const [currentTime, setCurrentTime] = useState(0)

  useFrame((state) => {
    if (isPlaying) {
      setCurrentTime(state.clock.elapsedTime)
    }
  })

  const handlePlanetClick = useCallback(() => {
    onSelectPlanet(exoplanet)
  }, [exoplanet, onSelectPlanet])

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.2} />

      <InfiniteGrid />

      <HostStar starData={starData} />

      {exoplanet.orbitalRadius && <OrbitalPath radius={exoplanet.orbitalRadius} />}

      <Planet
        exoplanet={exoplanet}
        isSelected={selectedPlanet?.id === exoplanet.id}
        onClick={handlePlanetClick}
        isPlaying={isPlaying}
        currentTime={currentTime}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export function ExoplanetMap({ exoplanet, starData, selectedPlanet, onSelectPlanet, isPlaying }: ExoplanetMapProps) {
  return (
    <Canvas
      camera={{ position: [12, 10, 12], fov: 50 }}
      style={{ background: "#000000" }} // Changed background to pure black
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <Scene
        exoplanet={exoplanet}
        starData={starData}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
        isPlaying={isPlaying}
      />
    </Canvas>
  )
}
