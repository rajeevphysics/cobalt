"use client"

import { useState, useMemo } from "react"
import { ExoplanetMap } from "./exoplanet-map"
import { DataPanel } from "./data-panel"
import { Logo } from "./logo"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Maximize2, Minimize2, RotateCcw, Play, Pause, Sun, Moon } from "lucide-react"

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

const ORBIT_SCALE_FACTOR = 10 // 1 AU = 10 units in 3D scene
const STAR_VISUAL_SCALE_FACTOR = 0.8 // Base scale for star size
const PLANET_VISUAL_SCALE_FACTOR = 0.2 // Base scale for planet size

function calculateOrbitalRadius(orbitalPeriodDays: number, stellarRadiusSunRadii: number): number {
  // Constants
  const G = 6.6743e-11 // gravitational constant (m^3 kg^-1 s^-2)
  const M_sun = 1.98847e30 // solar mass (kg)
  const day_to_sec = 86400 // seconds in a day
  const AU = 1.496e11 // 1 astronomical unit (m)

  // Convert inputs
  const P = orbitalPeriodDays * day_to_sec

  // Estimate stellar mass using radius relation (M ∝ R^1.25)
  const M_star = M_sun * Math.pow(stellarRadiusSunRadii, 1.25)

  // Apply Kepler's Third Law: a^3 = (G * M * P^2) / (4 * π^2)
  const a_m = Math.pow((G * M_star * Math.pow(P, 2)) / (4 * Math.pow(Math.PI, 2)), 1 / 3)

  // Convert to AU
  const a_AU = a_m / AU

  return a_AU
}

function getStarProperties(temperatureK: number): { type: string; color: string } {
  // Convert Kelvin to Celsius for comparison
  const tempC = temperatureK - 273.15

  if (tempC >= 11000) {
    return { type: "O/B Type (Blue)", color: "#ffffff" }
  } else if (tempC >= 7500) {
    return { type: "A Type (Blue-White)", color: "#ffffff" }
  } else if (tempC >= 6000) {
    return { type: "F Type (White)", color: "#ffffff" }
  } else if (tempC >= 5000) {
    return { type: "G Type (Yellow)", color: "#ffffff" }
  } else if (tempC >= 3600) {
    return { type: "K Type (Orange)", color: "#ffffff" }
  } else {
    return { type: "M Type (Red)", color: "#ffffff" }
  }
}

export function ExoplanetVisualization() {
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [mapSize, setMapSize] = useState<"normal" | "large" | "fullscreen">("normal")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const [orbitalPeriod, setOrbitalPeriod] = useState<string>("365")
  const [planetRadius, setPlanetRadius] = useState<string>("1.0")
  const [stellarTemp, setStellarTemp] = useState<string>("5778")
  const [stellarRadius, setStellarRadius] = useState<string>("1.0")

  const { exoplanet, starData, orbitalRadiusAU } = useMemo(() => {
    const period = Number.parseFloat(orbitalPeriod) || 365
    const radius = Number.parseFloat(planetRadius) || 1.0
    const temp = Number.parseFloat(stellarTemp) || 5778
    const sRadius = Number.parseFloat(stellarRadius) || 1.0

    const orbitalRadiusAU = calculateOrbitalRadius(period, sRadius)
    const orbitalRadiusVisualization = orbitalRadiusAU * ORBIT_SCALE_FACTOR

    const starVisualScale = Math.pow(sRadius, 0.5) * STAR_VISUAL_SCALE_FACTOR
    const planetVisualScale = Math.pow(radius, 0.5) * PLANET_VISUAL_SCALE_FACTOR

    const starProps = getStarProperties(temp)

    const planet: Exoplanet = {
      id: "custom-planet-1",
      name: "Custom Exoplanet",
      position: [orbitalRadiusVisualization, 0, 0],
      type: "confirmed",
      radius: radius,
      orbitalPeriod: period,
      temperature: temp,
      hostStar: "Custom Star",
      orbitalRadius: orbitalRadiusVisualization,
      orbitalAngle: 0,
      visualScale: planetVisualScale,
    }

    const star: StarData = {
      temperature: temp,
      radius: sRadius,
      color: starProps.color,
      type: starProps.type,
      visualScale: starVisualScale,
    }

    return { exoplanet: planet, starData: star, orbitalRadiusAU }
  }, [orbitalPeriod, planetRadius, stellarTemp, stellarRadius])

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
    setSelectedPlanet(null)
    setMapSize("normal")
    setIsPlaying(false)
  }

  const toggleLightMode = () => {
    setIsLightMode(!isLightMode)
    document.documentElement.classList.toggle("light")
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Header */}
      <div className="retro-border border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-lg font-bold retro-glow text-primary uppercase tracking-wider">EXOPLANET SIMULATOR</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Custom Orbital Mechanics Calculator
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-accent">●</span> SYSTEM ONLINE
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground font-mono">
            ORBITAL RADIUS: <span className="text-primary font-bold">{orbitalRadiusAU.toFixed(3)} AU</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            STAR TYPE: <span className="text-primary font-bold">{starData.type}</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLightMode}
            className="h-8 px-3 text-xs hover:bg-primary/20 hover:text-primary retro-border"
          >
            {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="retro-border border-b px-4 py-2 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="h-8 px-3 text-xs hover:bg-primary/20 hover:text-primary retro-border text-primary"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            RESET TO EARTH-SUN
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-3 text-xs hover:bg-primary/20 hover:text-primary retro-border text-primary"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                PAUSE ORBIT
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                START ORBIT
              </>
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">KEPLER'S THIRD LAW SIMULATION</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - 3D Map */}
        <div
          className={`retro-border border-r transition-all duration-300 ${
            mapSize === "fullscreen" ? "w-full" : mapSize === "large" ? "w-3/4" : "w-2/3"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Map Header */}
            <div className="retro-border border-b px-3 py-2 flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">3D ORBITAL VIEW</span>
                <span className="text-xs text-muted-foreground">[SINGLE PLANET SYSTEM]</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMapSize}
                className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
              >
                {mapSize === "fullscreen" ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>

            {/* 3D Map */}
            <div className="flex-1 relative">
              <ExoplanetMap
                exoplanet={exoplanet}
                starData={starData}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={setSelectedPlanet}
                isPlaying={isPlaying}
              />
            </div>

            {/* Map Legend */}
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

        {/* Right Section - Input Panel */}
        {mapSize !== "fullscreen" && (
          <>
            {!sidebarCollapsed ? (
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Panel Header */}
                  <div className="retro-border border-b px-3 py-2 flex items-center justify-between bg-card">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">SYSTEM PARAMETERS</span>
                  </div>

                  {/* Input Form */}
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="orbital-period" className="text-xs text-muted-foreground uppercase">
                          Orbital Period (Earth Days)
                        </Label>
                        <Input
                          id="orbital-period"
                          type="number"
                          value={orbitalPeriod}
                          onChange={(e) => setOrbitalPeriod(e.target.value)}
                          className="retro-border bg-background text-primary font-mono"
                          placeholder="365"
                        />
                        <p className="text-[10px] text-muted-foreground">Time for one complete orbit around the star</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="planet-radius" className="text-xs text-muted-foreground uppercase">
                          Planet Radius (Earth Radii)
                        </Label>
                        <Input
                          id="planet-radius"
                          type="number"
                          step="0.1"
                          value={planetRadius}
                          onChange={(e) => setPlanetRadius(e.target.value)}
                          className="retro-border bg-background text-primary font-mono"
                          placeholder="1.0"
                        />
                        <p className="text-[10px] text-muted-foreground">Size relative to Earth (1.0 = Earth-sized)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stellar-temp" className="text-xs text-muted-foreground uppercase">
                          Stellar Effective Temperature (K)
                        </Label>
                        <Input
                          id="stellar-temp"
                          type="number"
                          value={stellarTemp}
                          onChange={(e) => setStellarTemp(e.target.value)}
                          className="retro-border bg-background text-primary font-mono"
                          placeholder="5778"
                        />
                        <p className="text-[10px] text-muted-foreground">Surface temperature in Kelvin (Sun = 5778K)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stellar-radius" className="text-xs text-muted-foreground uppercase">
                          Stellar Radius (Sun Radii)
                        </Label>
                        <Input
                          id="stellar-radius"
                          type="number"
                          step="0.1"
                          value={stellarRadius}
                          onChange={(e) => setStellarRadius(e.target.value)}
                          className="retro-border bg-background text-primary font-mono"
                          placeholder="1.0"
                        />
                        <p className="text-[10px] text-muted-foreground">Size relative to the Sun (1.0 = Sun-sized)</p>
                      </div>
                    </div>

                    {/* Calculated Results */}
                    <div className="retro-border bg-card/50 p-3 space-y-2">
                      <h3 className="text-xs font-bold text-primary uppercase">Calculated Results</h3>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Orbital Radius:</span>
                          <span className="text-accent">{orbitalRadiusAU.toFixed(4)} AU</span>
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

                    {/* Presets */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-primary uppercase">Quick Presets</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOrbitalPeriod("365")
                            setPlanetRadius("1.0")
                            setStellarTemp("5778")
                            setStellarRadius("1.0")
                          }}
                          className="text-xs retro-border"
                        >
                          Earth-Sun
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOrbitalPeriod("11.2")
                            setPlanetRadius("1.27")
                            setStellarTemp("3042")
                            setStellarRadius("0.12")
                          }}
                          className="text-xs retro-border"
                        >
                          Proxima b
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOrbitalPeriod("4333")
                            setPlanetRadius("11.2")
                            setStellarTemp("5778")
                            setStellarRadius("1.0")
                          }}
                          className="text-xs retro-border"
                        >
                          Jupiter-Sun
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOrbitalPeriod("88")
                            setPlanetRadius("0.38")
                            setStellarTemp("5778")
                            setStellarRadius("1.0")
                          }}
                          className="text-xs retro-border"
                        >
                          Mercury-Sun
                        </Button>
                      </div>
                    </div>

                    {/* Data Panel for selected planet */}
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
      </div>
    </div>
  )
}
