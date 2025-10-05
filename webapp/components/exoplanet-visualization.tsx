"use client"

import type React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { ExoplanetMap } from "./exoplanet-map"
import { DataPanel } from "./data-panel"
import { DatasetAnalysis } from "./dataset-analysis"
import { Logo } from "./logo"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Maximize2, Minimize2, Play, Pause, Plus, Minus, Upload, Info } from "lucide-react"

export interface Exoplanet {
  id: string
  name: string
  position: [number, number, number]
  type: "confirmed" | "candidate" | "false-positive"
  mass?: number
  radius?: number
  orbitalPeriod?: number
  distance?: number
  temperature?: number
  discoveryMethod?: string
  hostStar?: string
  orbitalRadius?: number
  orbitalAngle?: number
  visualScale?: number
}

export interface StarData {
  temperature: number
  radius: number
  color: string
  type: string
  visualScale?: number
}

const TARGET_ORBIT_VISUAL_RADIUS = 4.0

const BODY_VISIBILITY_MULTIPLIER = 20

const AU_IN_KM = 149597870.7
const SUN_RADIUS_KM = 696340.0
const EARTH_RADIUS_KM = 6371.0
const SUN_RADII_PER_AU = AU_IN_KM / SUN_RADIUS_KM
const EARTH_RADII_PER_AU = AU_IN_KM / EARTH_RADIUS_KM

function calculateOrbitalRadius(orbitalPeriodDays: number, stellarRadiusSunRadii: number): number {
  const orbitalPeriodYears = orbitalPeriodDays / 365.25
  const stellarMassSolarMasses = Math.pow(stellarRadiusSunRadii, 1.25)
  const aCubed = stellarMassSolarMasses * Math.pow(orbitalPeriodYears, 2)
  const orbitalRadiusAU = Math.pow(aCubed, 1 / 3)
  return orbitalRadiusAU
}

function getStarProperties(temperatureK: number): { type: string; color: string } {
  if (temperatureK >= 11273) {
    return { type: "O/B Type (Blue)", color: "#9bb0ff" }
  } else if (temperatureK >= 7773) {
    return { type: "A Type (Blue-White)", color: "#aabfff" }
  } else if (temperatureK >= 6273) {
    return { type: "F Type (White)", color: "#ffd2a1" }
  } else if (temperatureK >= 5273) {
    return { type: "G Type (Yellow)", color: "#ffd2a1" }
  } else if (temperatureK >= 3873) {
    return { type: "K Type (Orange)", color: "#ffcc6f" }
  } else if (temperatureK >= 2273) {
    return { type: "M Type (Red)", color: "#ff6b38" }
  } else {
    return { type: "M Type (Red)", color: "#ff6b38" }
  }
}

export function ExoplanetVisualization() {
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [mapSize, setMapSize] = useState<"normal" | "large" | "fullscreen">("normal")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(12)
  const [leftColumnWidth, setLeftColumnWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [viewMode, setViewMode] = useState<"individual" | "dataset">("individual")

  const [currentExoplanetName, setCurrentExoplanetName] = useState("Custom Exoplanet")
  const [showPlanetInfo, setShowPlanetInfo] = useState(false)

  const [orbitalPeriod, setOrbitalPeriod] = useState("11.2")
  const [planetRadius, setPlanetRadius] = useState("1.02")
  const [stellarTemp, setStellarTemp] = useState("3050")
  const [stellarRadius, setStellarRadius] = useState("0.14")
  const [transitDepth, setTransitDepth] = useState("0")
  const [transitDuration, setTransitDuration] = useState("0")
  const [prediction, setPrediction] = useState<{
    label: string
    confidence: number
    probabilities: { label: string; probability: number }[]
  } | null>(null)

  const { exoplanet, starData, orbitalRadiusAU, stellarRadiusAU, planetRadiusAU, auPerGridSquare } = useMemo(() => {
    const period = Number.parseFloat(orbitalPeriod) || 365
    const radius = Number.parseFloat(planetRadius) || 1.0
    const temp = Number.parseFloat(stellarTemp) || 5778
    const sRadius = Number.parseFloat(stellarRadius) || 1.0

    const orbitalRadiusAU = calculateOrbitalRadius(period, sRadius)
    const stellarRadiusAU = sRadius / SUN_RADII_PER_AU
    const planetRadiusAU = radius / EARTH_RADII_PER_AU

    const orbitalRadiusVisualization = TARGET_ORBIT_VISUAL_RADIUS
    const safeOrbitalRadiusAU = orbitalRadiusAU > 0 ? orbitalRadiusAU : 1e-6
    const safeStellarRadiusAU = stellarRadiusAU > 0 ? stellarRadiusAU : 1e-9

    const idealStarVisualScale =
      (stellarRadiusAU / safeOrbitalRadiusAU) * orbitalRadiusVisualization * BODY_VISIBILITY_MULTIPLIER

    const maxStarVisualScale = orbitalRadiusVisualization * 0.8

    const finalStarVisualScale = Math.min(idealStarVisualScale, maxStarVisualScale)

    const realSizeRatio = planetRadiusAU / safeStellarRadiusAU
    const finalPlanetVisualScale = finalStarVisualScale * realSizeRatio

    const auPerGridSquare = safeOrbitalRadiusAU / TARGET_ORBIT_VISUAL_RADIUS

    const starProps = getStarProperties(temp)

    const planet: Exoplanet = {
      id: "custom-planet-1",
      name: currentExoplanetName,
      position: [orbitalRadiusVisualization, 0, 0],
      type: "confirmed",
      radius: radius,
      orbitalPeriod: period,
      temperature: temp,
      hostStar: "Custom Star",
      orbitalRadius: orbitalRadiusVisualization,
      orbitalAngle: 0,
      visualScale: finalPlanetVisualScale,
    }

    const star: StarData = {
      temperature: temp,
      radius: sRadius,
      color: starProps.color,
      type: starProps.type,
      visualScale: finalStarVisualScale,
    }

    return { exoplanet: planet, starData: star, orbitalRadiusAU, stellarRadiusAU, planetRadiusAU, auPerGridSquare }
  }, [orbitalPeriod, planetRadius, stellarTemp, stellarRadius, currentExoplanetName])

  const formatAuScale = (au: number) => {
    if (au >= 0.1) {
      return `${au.toFixed(2)} AU`
    }
    if (au >= 0.001) {
      return `${au.toFixed(4)} AU`
    }
    return `${au.toExponential(1)} AU`
  }

  const toggleMapSize = () => {
    setMapSize((prev) => {
      if (prev === "normal") return "large"
      if (prev === "large") return "fullscreen"
      return "normal"
    })
  }

  const handleResetView = () => {
    setOrbitalPeriod("365")
    setPlanetRadius("1.0")
    setStellarTemp("5778")
    setStellarRadius("1.0")
    setTransitDepth("100")
    setTransitDuration("13")
    setSelectedPlanet(null)
    setMapSize("normal")
    setIsPlaying(false)
    setPrediction(null)
    setZoomLevel(12)
    setCurrentExoplanetName("Custom Exoplanet")
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(3, prev - 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(50, prev + 2))
  }

  const handlePredict = async () => {
    setIsLoadingPrediction(true)
    setPrediction(null)

    const featureArray = [
      Number.parseFloat(orbitalPeriod),
      Number.parseFloat(planetRadius),
      Number.parseFloat(stellarTemp),
      Number.parseFloat(stellarRadius),
      Number.parseFloat(transitDepth),
      Number.parseFloat(transitDuration),
    ]

    try {
      const response = await fetch("https://cobalt-90dg.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: featureArray }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      const data = await response.json()

      console.log("[v0] Response from /predict endpoint:", data)

      setPrediction({
        label: data.overall_prediction ?? "N/A",
        confidence: data["prediction_confidence(%)"] ?? 0,
        probabilities: Object.entries(data["probability_breakdown(%)"] ?? {}).map(([label, probability]) => ({
          label: label,
          probability: (probability as number) ?? 0,
        })),
      })
    } catch (error) {
      console.error("Prediction error:", error)
    } finally {
      setIsLoadingPrediction(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      if (newWidth >= 20 && newWidth <= 80) {
        setLeftColumnWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      <div className="retro-border border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-wider">
              <span>Eukleídes</span> - exoplanet predictor
            </h1>
          </div>
        </div>
        {viewMode === "individual" && (
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground font-mono">
              EXOPLANET: <span className="text-primary font-bold">{currentExoplanetName}</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              ORBITAL RADIUS: <span className="text-primary font-bold">{orbitalRadiusAU.toFixed(3)} AU</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              STAR TYPE: <span className="text-primary font-bold">{starData.type}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {viewMode === "individual" ? (
          <>
            <div
              className={`retro-border border-r transition-all duration-300 h-full ${
                mapSize === "fullscreen" ? "w-full" : mapSize === "large" ? "w-3/4" : ""
              }`}
              style={mapSize === "normal" ? { width: `${leftColumnWidth}%` } : undefined}
            >
              <div className="h-full flex flex-col">
                <div className="retro-border border-b px-3 py-2 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">3D ORBITAL VIEW</span>
                    <span className="text-xs text-muted-foreground">[SINGLE PLANET SYSTEM]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 retro-border bg-background px-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        className="h-6 w-6 p-0 hover:bg-primary/20 hover:text-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        className="h-6 w-6 p-0 hover:bg-primary/20 hover:text-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary retro-border"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          PAUSE
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          START
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMapSize}
                      className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
                    >
                      {mapSize === "fullscreen" ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
                    <div className="retro-border bg-background/90 px-2 py-1">
                      <div className="text-[10px] text-muted-foreground font-mono mb-1">SCALE</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-0.5 bg-primary"></div>
                          <span className="text-[10px] text-primary font-mono">1 AU</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground font-mono">
                          1 square = {formatAuScale(auPerGridSquare)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ExoplanetMap
                    exoplanet={exoplanet}
                    starData={starData}
                    selectedPlanet={selectedPlanet}
                    onSelectPlanet={setSelectedPlanet}
                    isPlaying={isPlaying}
                    zoomLevel={zoomLevel}
                  />
                </div>

                <div className="retro-border border-t px-3 py-2 bg-card">
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: starData.color }} />
                      <span className="text-muted-foreground">HOST STAR ({starData.type})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-muted-foreground">EXOPLANET</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {mapSize === "normal" && (
              <div
                className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors relative group"
                onMouseDown={handleMouseDown}
              >
                <div className="absolute inset-y-0 -left-1 -right-1" />
              </div>
            )}

            {mapSize !== "fullscreen" && (
              <>
                {!sidebarCollapsed ? (
                  <div
                    className="h-full overflow-hidden"
                    style={mapSize === "normal" ? { width: `${100 - leftColumnWidth}%` } : { width: "25%" }}
                  >
                    <div className="h-full flex flex-col">
                      <div className="retro-border border-b px-3 py-2 flex items-center justify-between bg-card">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            SYSTEM PARAMETERS
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("dataset")}
                          className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary retro-border"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          UPLOAD DATASET
                        </Button>
                      </div>

                      <div className="flex-1 overflow-auto p-4 space-y-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="orbital-period" className="text-xs uppercase">
                              <span className="font-bold text-white">Orbital Period</span>{" "}
                              <span className="text-muted-foreground">(Earth Days)</span>
                            </Label>
                            <Input
                              id="orbital-period"
                              type="number"
                              value={orbitalPeriod}
                              onChange={(e) => {
                                setOrbitalPeriod(e.target.value)
                                setCurrentExoplanetName("Custom Exoplanet")
                              }}
                              className="retro-border bg-background text-primary font-mono"
                              placeholder="365"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Time for one complete orbit around the star
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="planet-radius" className="text-xs uppercase">
                              <span className="font-bold text-white">Planet Radius</span>{" "}
                              <span className="text-muted-foreground">(Earth Radii)</span>
                            </Label>
                            <Input
                              id="planet-radius"
                              type="number"
                              step="0.1"
                              value={planetRadius}
                              onChange={(e) => {
                                setPlanetRadius(e.target.value)
                                setCurrentExoplanetName("Custom Exoplanet")
                              }}
                              className="retro-border bg-background text-primary font-mono"
                              placeholder="1.0"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Size relative to Earth (1.0 = Earth-sized)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="stellar-temp" className="text-xs uppercase">
                              <span className="font-bold text-white">Stellar Effective Temperature</span>{" "}
                              <span className="text-muted-foreground">(K)</span>
                            </Label>
                            <Input
                              id="stellar-temp"
                              type="number"
                              value={stellarTemp}
                              onChange={(e) => {
                                setStellarTemp(e.target.value)
                                setCurrentExoplanetName("Custom Exoplanet")
                              }}
                              className="retro-border bg-background text-primary font-mono"
                              placeholder="5778"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Surface temperature in Kelvin (Sun = 5778K)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="stellar-radius" className="text-xs uppercase">
                              <span className="font-bold text-white">Stellar Radius</span>{" "}
                              <span className="text-muted-foreground">(Sun Radii)</span>
                            </Label>
                            <Input
                              id="stellar-radius"
                              type="number"
                              step="0.1"
                              value={stellarRadius}
                              onChange={(e) => {
                                setStellarRadius(e.target.value)
                                setCurrentExoplanetName("Custom Exoplanet")
                              }}
                              className="retro-border bg-background text-primary font-mono"
                              placeholder="1.0"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Size relative to the Sun (1.0 = Sun-sized)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transit-depth" className="text-xs uppercase">
                              <span className="font-bold text-white">Transit Depth</span>{" "}
                              <span className="text-muted-foreground">(ppm)</span>
                            </Label>
                            <Input
                              id="transit-depth"
                              type="number"
                              value={transitDepth}
                              onChange={(e) => {
                                setTransitDepth(e.target.value)
                                setCurrentExoplanetName("Custom Exoplanet")
                              }}
                              className="retro-border bg-background text-primary font-mono"
                              placeholder="100"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Dimming of star light during transit (parts per million)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transit-duration" className="text-xs uppercase">
                              <span className="font-bold text-white">Transit Duration</span>{" "}
                              <span className="text-muted-foreground">(Earth Hours)</span>
                            </Label>
                            <Input
                              id="transit-duration"
                              type="number"
                              step="0.1"
                              value={transitDuration}
                              onChange={(e) => {
                                setTransitDuration(e.target.value)
                                setCurrentExoplanetName("Custom Exoplanet")
                              }}
                              className="retro-border bg-background text-primary font-mono"
                              placeholder="13"
                            />
                            <p className="text-[10px] text-muted-foreground">Time planet takes to cross star's disk</p>
                          </div>
                        </div>

                        <Button
                          onClick={handlePredict}
                          disabled={isLoadingPrediction}
                          className="w-full retro-border bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50"
                        >
                          {isLoadingPrediction ? "ANALYZING..." : "PREDICT CLASSIFICATION"}
                        </Button>

                        {prediction && (
                          <div className="retro-border bg-card/50 p-4 space-y-3">
                            <h3 className="text-xs font-bold text-primary uppercase">Prediction Result</h3>
                            <div className="space-y-2">
                              <div
                                className={`text-center py-3 retro-border ${
                                  prediction.label.toLowerCase().includes("candidate")
                                    ? "bg-yellow-500/20 border-yellow-500/50"
                                    : prediction.label.toLowerCase().includes("confirmed")
                                      ? "bg-green-500/20 border-green-500/50"
                                      : "bg-red-500/20 border-red-500/50"
                                }`}
                              >
                                <div
                                  className={`text-lg font-bold ${
                                    prediction.label.toLowerCase().includes("candidate")
                                      ? "text-yellow-400"
                                      : prediction.label.toLowerCase().includes("confirmed")
                                        ? "text-green-400"
                                        : "text-red-400"
                                  }`}
                                >
                                  {prediction.label}
                                </div>
                                <div
                                  className={`text-sm ${
                                    prediction.label.toLowerCase().includes("candidate")
                                      ? "text-yellow-300/80"
                                      : prediction.label.toLowerCase().includes("confirmed")
                                        ? "text-green-300/80"
                                        : "text-red-300/80"
                                  }`}
                                >
                                  {prediction.confidence}% confident
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase">
                                  Probability Breakdown
                                </h4>
                                {prediction.probabilities.map((prob) => (
                                  <div key={prob.label} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span
                                        className={`${
                                          prob.label.toLowerCase().includes("candidate")
                                            ? "text-yellow-400"
                                            : prob.label.toLowerCase().includes("confirmed")
                                              ? "text-green-400"
                                              : "text-red-400"
                                        }`}
                                      >
                                        {prob.label}
                                      </span>
                                      <span className="text-accent font-mono">{prob.probability}%</span>
                                    </div>
                                    <div className="h-2 bg-background retro-border overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-300 ${
                                          prob.label.toLowerCase().includes("candidate")
                                            ? "bg-yellow-500/30"
                                            : prob.label.toLowerCase().includes("confirmed")
                                              ? "bg-green-500/30"
                                              : "bg-red-500/30"
                                        }`}
                                        style={{ width: `${prob.probability}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="retro-border bg-card/50 p-3 space-y-2">
                          <h3 className="text-xs font-bold text-primary uppercase">Calculated Results</h3>
                          <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Orbital Radius:</span>
                              <span className="text-accent">{orbitalRadiusAU.toFixed(6)} AU</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Stellar Radius:</span>
                              <span className="text-accent">{stellarRadiusAU.toFixed(6)} AU</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Planet Radius:</span>
                              <span className="text-accent">{planetRadiusAU.toFixed(6)} AU</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Star Type:</span>
                              <span className="text-accent">{starData.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Star Color:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: starData.color }} />
                                <span className="text-accent">{starData.color}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-primary uppercase">Quick Presets</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("289.9")
                                setPlanetRadius("2.38")
                                setStellarTemp("5518")
                                setStellarRadius("0.98")
                                setTransitDepth("492")
                                setTransitDuration("0")
                                setCurrentExoplanetName("Kepler-22b")
                              }}
                              className="text-xs retro-border"
                            >
                              Kepler-22b
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("11.2")
                                setPlanetRadius("1.02")
                                setStellarTemp("3050")
                                setStellarRadius("0.14")
                                setTransitDepth("0")
                                setTransitDuration("0")
                                setCurrentExoplanetName("Proxima Centauri b")
                              }}
                              className="text-xs retro-border"
                            >
                              Proxima Centauri b
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("6.10")
                                setPlanetRadius("0.92")
                                setStellarTemp("2559")
                                setStellarRadius("0.121")
                                setTransitDepth("5500")
                                setTransitDuration("0.93")
                                setCurrentExoplanetName("TRAPPIST-1e")
                              }}
                              className="text-xs retro-border"
                            >
                              TRAPPIST-1e
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("3.52")
                                setPlanetRadius("15.5")
                                setStellarTemp("6065")
                                setStellarRadius("1.15")
                                setTransitDepth("15000")
                                setTransitDuration("2")
                                setCurrentExoplanetName("HD 209458 b")
                              }}
                              className="text-xs retro-border"
                            >
                              HD 209458 b
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("4.23")
                                setPlanetRadius("14.3")
                                setStellarTemp("5793")
                                setStellarRadius("1.24")
                                setTransitDepth("0")
                                setTransitDuration("0")
                                setCurrentExoplanetName("51 Pegasi b")
                              }}
                              className="text-xs retro-border"
                            >
                              51 Pegasi b
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("384.8")
                                setPlanetRadius("1.6")
                                setStellarTemp("5757")
                                setStellarRadius("1.11")
                                setTransitDepth("200")
                                setTransitDuration("0")
                                setCurrentExoplanetName("Kepler-452b")
                              }}
                              className="text-xs retro-border"
                            >
                              Kepler-452b
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrbitalPeriod("1.58")
                                setPlanetRadius("2.7")
                                setStellarTemp("3026")
                                setStellarRadius("0.21")
                                setTransitDepth("14000")
                                setTransitDuration("1")
                                setCurrentExoplanetName("GJ 1214b")
                              }}
                              className="text-xs retro-border"
                            >
                              GJ 1214b
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPlanetInfo(true)}
                            className="w-full text-xs retro-border bg-primary/10 hover:bg-primary/20 text-primary"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            MORE INFO ABOUT THE PLANET
                          </Button>
                        </div>

                        {selectedPlanet && (
                          <div className="retro-border bg-card/50 p-3">
                            <DataPanel selectedPlanet={selectedPlanet} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : (
          <DatasetAnalysis onBackToIndividual={() => setViewMode("individual")} />
        )}
      </div>

      <Dialog open={showPlanetInfo} onOpenChange={setShowPlanetInfo}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto retro-border bg-background">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary uppercase tracking-wider">
              {currentExoplanetName}
            </DialogTitle>
            <div className="text-sm text-green-400 font-bold uppercase tracking-wide">
              {prediction?.label || "EXOPLANET"}
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* ID and Host */}
            <div className="text-xs text-muted-foreground font-mono">
              <span>ID: {exoplanet.id}</span> | <span>HOST: {exoplanet.hostStar}</span>
            </div>

            {/* Physical Properties */}
            <div className="retro-border bg-card/50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Physical Properties</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Mass</div>
                  <div className="text-sm text-accent font-mono">{exoplanet.mass ? `${exoplanet.mass} M⊕` : "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Radius</div>
                  <div className="text-sm text-accent font-mono">{planetRadius} R⊕</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Temperature</div>
                  <div className="text-sm text-accent font-mono">{stellarTemp} K</div>
                </div>
              </div>
            </div>

            {/* Orbital Properties */}
            <div className="retro-border bg-card/50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Orbital Properties</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Orbital Period</div>
                  <div className="text-sm text-accent font-mono">{orbitalPeriod} days</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Orbital Radius</div>
                  <div className="text-sm text-accent font-mono">{orbitalRadiusAU.toFixed(4)} AU</div>
                </div>
              </div>
            </div>

            {/* Discovery Information */}
            <div className="retro-border bg-card/50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Discovery Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Method</div>
                  <div className="text-sm text-accent font-mono">{exoplanet.discoveryMethod || "Transit Method"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Host Star</div>
                  <div className="text-sm text-accent font-mono">{exoplanet.hostStar}</div>
                </div>
              </div>
            </div>

            {/* AI Model Analysis */}
            <div className="retro-border bg-card/50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">AI Model Analysis</h3>
              {prediction ? (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    ML model has analyzed this exoplanet based on its physical and orbital characteristics
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase mb-1">Confidence</div>
                      <div
                        className={`text-lg font-bold font-mono ${
                          prediction.label.toLowerCase().includes("candidate")
                            ? "text-yellow-400"
                            : prediction.label.toLowerCase().includes("confirmed")
                              ? "text-green-400"
                              : "text-red-400"
                        }`}
                      >
                        {prediction.confidence}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase mb-1">Classification</div>
                      <div
                        className={`text-sm font-bold uppercase ${
                          prediction.label.toLowerCase().includes("candidate")
                            ? "text-yellow-400"
                            : prediction.label.toLowerCase().includes("confirmed")
                              ? "text-green-400"
                              : "text-red-400"
                        }`}
                      >
                        {prediction.label}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase">Probability Breakdown</div>
                    {prediction.probabilities.map((prob) => (
                      <div key={prob.label} className="flex justify-between items-center text-xs">
                        <span
                          className={`${
                            prob.label.toLowerCase().includes("candidate")
                              ? "text-yellow-400"
                              : prob.label.toLowerCase().includes("confirmed")
                                ? "text-green-400"
                                : "text-red-400"
                          }`}
                        >
                          {prob.label}
                        </span>
                        <span className="text-accent font-mono">{prob.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Click "PREDICT CLASSIFICATION" to analyze this exoplanet with our AI model
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground uppercase mb-1">Confidence</div>
                      <div className="text-accent font-mono">---%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase mb-1">Habitability</div>
                      <div className="text-accent font-mono">---</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase mb-1">Atmosphere</div>
                      <div className="text-accent font-mono">---</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
