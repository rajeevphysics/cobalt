"use client"

import { useState } from "react"
import { ExoplanetMap } from "./exoplanet-map"
import { DataPanel } from "./data-panel"
import { ControlPanel } from "./control-panel"
import { Logo } from "./logo"
import { Button } from "./ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sun,
  Moon,
} from "lucide-react"

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
}

const mockExoplanets: Exoplanet[] = [
  {
    id: "1",
    name: "KEPLER-442B",
    position: [5, 2, 3],
    type: "confirmed",
    mass: 2.34,
    radius: 1.34,
    orbitalPeriod: 112.3,
    distance: 1206,
    temperature: 233,
    discoveryMethod: "Transit",
    hostStar: "Kepler-442",
  },
  {
    id: "2",
    name: "PROXIMA-B",
    position: [-4, -1, 2],
    type: "confirmed",
    mass: 1.27,
    radius: 1.1,
    orbitalPeriod: 11.2,
    distance: 4.24,
    temperature: 234,
    discoveryMethod: "Radial Velocity",
    hostStar: "Proxima Centauri",
  },
  {
    id: "3",
    name: "TRAPPIST-1E",
    position: [3, -3, -2],
    type: "confirmed",
    mass: 0.62,
    radius: 0.92,
    orbitalPeriod: 6.1,
    distance: 39.5,
    temperature: 246,
    discoveryMethod: "Transit",
    hostStar: "TRAPPIST-1",
  },
  {
    id: "4",
    name: "KOI-4878.01",
    position: [-2, 4, -1],
    type: "candidate",
    mass: 1.8,
    radius: 1.2,
    orbitalPeriod: 89.5,
    distance: 1850,
    temperature: 280,
    discoveryMethod: "Transit",
    hostStar: "KOI-4878",
  },
  {
    id: "5",
    name: "HD-40307G",
    position: [2, 1, -4],
    type: "confirmed",
    mass: 7.1,
    radius: 1.8,
    orbitalPeriod: 197.8,
    distance: 42,
    temperature: 198,
    discoveryMethod: "Radial Velocity",
    hostStar: "HD 40307",
  },
  {
    id: "6",
    name: "FALSE-POS-12",
    position: [-3, -2, 3],
    type: "false-positive",
    distance: 2100,
    discoveryMethod: "Transit",
    hostStar: "Unknown",
  },
  {
    id: "7",
    name: "GLIESE-667CC",
    position: [4, 3, 1],
    type: "confirmed",
    mass: 3.8,
    radius: 1.5,
    orbitalPeriod: 28.1,
    distance: 23.6,
    temperature: 277,
    discoveryMethod: "Radial Velocity",
    hostStar: "Gliese 667C",
  },
  {
    id: "8",
    name: "KOI-5923.02",
    position: [-1, -4, -3],
    type: "candidate",
    mass: 2.1,
    radius: 1.3,
    orbitalPeriod: 156.2,
    distance: 1650,
    temperature: 255,
    discoveryMethod: "Transit",
    hostStar: "KOI-5923",
  },
]

export function ExoplanetVisualization() {
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [mapSize, setMapSize] = useState<"normal" | "large" | "fullscreen">("normal")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>(mockExoplanets)

  const toggleMapSize = () => {
    setMapSize((prev) => {
      if (prev === "normal") return "large"
      if (prev === "large") return "fullscreen"
      return "normal"
    })
  }

  const handleAddSample = () => {
    const newPlanet: Exoplanet = {
      id: `${exoplanets.length + 1}`,
      name: `SAMPLE-${exoplanets.length + 1}`,
      position: [Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4],
      type: Math.random() > 0.5 ? "confirmed" : "candidate",
      mass: Math.random() * 5 + 0.5,
      radius: Math.random() * 2 + 0.5,
      orbitalPeriod: Math.random() * 200 + 10,
      distance: Math.random() * 2000 + 10,
      temperature: Math.random() * 300 + 150,
      discoveryMethod: "Transit",
      hostStar: `Star-${exoplanets.length + 1}`,
    }
    setExoplanets([...exoplanets, newPlanet])
  }

  const handleClearData = () => {
    setExoplanets([])
    setSelectedPlanet(null)
  }

  const handleResetView = () => {
    setExoplanets(mockExoplanets)
    setSelectedPlanet(null)
    setMapSize("normal")
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
            <h1 className="text-lg font-bold retro-glow text-primary uppercase tracking-wider">EXOPLANET HUNTER</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI-Powered Detection System</p>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-accent">●</span> SYSTEM ONLINE
          </div>
        </div>
        <div className="flex items-center gap-4">
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
            onClick={handleAddSample}
            className="h-8 px-3 text-xs hover:bg-accent/20 hover:text-accent retro-border text-accent"
          >
            <Plus className="h-3 w-3 mr-1" />+ ADD SAMPLE DATA
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearData}
            className="h-8 px-3 text-xs hover:bg-destructive/20 hover:text-destructive retro-border text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />- CLEAR DATA
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="h-8 px-3 text-xs hover:bg-primary/20 hover:text-primary retro-border text-primary"
          >
            <RotateCcw className="h-3 w-3 mr-1" />↻ RESET VIEW
          </Button>
        </div>
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
                <span className="text-xs font-bold text-primary uppercase tracking-wider">3D SPATIAL MAP</span>
                <span className="text-xs text-muted-foreground">[{exoplanets.length} OBJECTS TRACKED]</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
                  title="Step Backward"
                >
                  <SkipBack className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
                  title="Step Forward"
                >
                  <SkipForward className="h-3 w-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground ml-2">TIME: T+0.00</span>
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
                exoplanets={exoplanets}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={setSelectedPlanet}
              />
            </div>

            {/* Map Legend */}
            <div className="retro-border border-t px-3 py-2 bg-card">
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-muted-foreground">CONFIRMED</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">CANDIDATE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">FALSE POSITIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Data Panel */}
        {mapSize !== "fullscreen" && (
          <>
            {!sidebarCollapsed ? (
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Collapse Button */}
                  <div className="retro-border border-b px-3 py-2 flex items-center justify-between bg-card">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">DATA ANALYSIS</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarCollapsed(true)}
                      className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Data Panel Content */}
                  <div className="flex-1 overflow-auto">
                    <DataPanel selectedPlanet={selectedPlanet} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="retro-border border-l">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(false)}
                  className="h-full px-2 hover:bg-primary/20 hover:text-primary rounded-none"
                  title="Expand Data Panel"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Control Panel */}
      <div className="retro-border border-t">
        <ControlPanel />
      </div>
    </div>
  )
}
