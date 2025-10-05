"use client"

import React from "react"
import { useRef, useState, useMemo, useCallback, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"
import type { Exoplanet, StarData } from "./exoplanet-visualization"

interface ExoplanetMapProps {
  exoplanet: Exoplanet
  starData: StarData
  selectedPlanet: Exoplanet | null
  onSelectPlanet: (planet: Exoplanet) => void
  isPlaying: boolean
  zoomLevel: number
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

  const starColor = starData.color

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

      <Html position={[0, planetSize + 0.5, 0]} center distanceFactor={8}>
        <div className="bg-background/90 border border-primary/50 px-2 py-1 text-xs font-mono text-primary whitespace-nowrap pointer-events-none">
          {exoplanet.name}
        </div>
      </Html>

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

function StarlightHeadliner() {
  const starsRef = useRef<THREE.Points>(null)

  const { positions, sizes, colors } = useMemo(() => {
    const count = 3000 // Increased from 2000
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Position stars on a large sphere (radius 80-100)
      const radius = 80 + Math.random() * 20
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Larger star sizes for better visibility (increased from 0.1-0.6 to 0.3-1.5)
      sizes[i] = Math.random() * 1.2 + 0.3

      // Add brightness variation - some stars brighter than others
      const brightness = 0.7 + Math.random() * 0.3 // Range from 0.7 to 1.0
      colors[i * 3] = brightness
      colors[i * 3 + 1] = brightness
      colors[i * 3 + 2] = brightness
    }

    return { positions, sizes, colors }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, sizes, colors])

  return (
    <points ref={starsRef} geometry={geometry}>
      <pointsMaterial
        color="#ffffff"
        size={0.4} // Increased from 0.15
        sizeAttenuation={true}
        transparent={true}
        opacity={0.9} // Increased from 0.6
        depthWrite={false}
        vertexColors={true} // Enable per-vertex colors for brightness variation
      />
    </points>
  )
}

function CameraController({ zoomLevel }: { zoomLevel: number }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.setLength(zoomLevel)
  }, [zoomLevel, camera])

  return null
}

function Scene({ exoplanet, starData, selectedPlanet, onSelectPlanet, isPlaying, zoomLevel }: ExoplanetMapProps) {
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

      <CameraController zoomLevel={zoomLevel} />

      <StarlightHeadliner />

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

export function ExoplanetMap({
  exoplanet,
  starData,
  selectedPlanet,
  onSelectPlanet,
  isPlaying,
  zoomLevel,
}: ExoplanetMapProps) {
  const timeScale = useMemo(() => {
    if (exoplanet.orbitalPeriod && !isNaN(exoplanet.orbitalPeriod)) {
      const daysPerSecond = exoplanet.orbitalPeriod / (exoplanet.orbitalPeriod * 0.1)
      return daysPerSecond.toFixed(1)
    }
    return "10.0"
  }, [exoplanet.orbitalPeriod])

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [12, 10, 12], fov: 50 }}
        style={{ background: "#000000" }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Scene
          exoplanet={exoplanet}
          starData={starData}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={onSelectPlanet}
          isPlaying={isPlaying}
          zoomLevel={zoomLevel}
        />
      </Canvas>

      {/* Simulation speed indicator as fixed overlay in bottom left */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/90 border border-primary/50 px-3 py-2 font-mono pointer-events-none">
        <div className="text-[10px] text-muted-foreground mb-1">SIMULATION SPEED</div>
        <div className="text-xs text-primary font-bold">1 sec = {timeScale} Earth days</div>
      </div>
    </div>
  )
}
