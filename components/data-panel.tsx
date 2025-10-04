"use client"

import type { Exoplanet } from "./exoplanet-visualization"
import { Card } from "./ui/card"

interface DataPanelProps {
  selectedPlanet: Exoplanet | null
}

export function DataPanel({ selectedPlanet }: DataPanelProps) {
  if (!selectedPlanet) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2 opacity-20">◯</div>
          <p className="text-sm uppercase tracking-wider">NO OBJECT SELECTED</p>
          <p className="text-xs mt-2">Click on a planet in the 3D map to view data</p>
        </div>
      </div>
    )
  }

  const DataRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/30">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-mono text-primary retro-glow">{value !== undefined ? value : "N/A"}</span>
    </div>
  )

  const getStatusColor = () => {
    if (selectedPlanet.type === "confirmed") return "text-accent"
    if (selectedPlanet.type === "candidate") return "text-secondary"
    return "text-destructive"
  }

  const getStatusText = () => {
    if (selectedPlanet.type === "confirmed") return "CONFIRMED EXOPLANET"
    if (selectedPlanet.type === "candidate") return "CANDIDATE"
    return "FALSE POSITIVE"
  }

  return (
    <div className="p-4 space-y-4">
      {/* Object Header */}
      <Card className="retro-border bg-card/50 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary retro-glow uppercase tracking-wider">
              {selectedPlanet.name}
            </h2>
            <span className={`text-xs font-bold ${getStatusColor()} uppercase tracking-wider`}>{getStatusText()}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {selectedPlanet.id} | HOST: {selectedPlanet.hostStar}
          </div>
        </div>
      </Card>

      {/* Physical Properties */}
      <Card className="retro-border bg-card/50 p-4">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 border-b border-primary/30 pb-2">
          Physical Properties
        </h3>
        <div className="space-y-1">
          <DataRow label="Mass" value={selectedPlanet.mass ? `${selectedPlanet.mass} M⊕` : undefined} />
          <DataRow label="Radius" value={selectedPlanet.radius ? `${selectedPlanet.radius} R⊕` : undefined} />
          <DataRow
            label="Temperature"
            value={selectedPlanet.temperature ? `${selectedPlanet.temperature} K` : undefined}
          />
        </div>
      </Card>

      {/* Orbital Properties */}
      <Card className="retro-border bg-card/50 p-4">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 border-b border-primary/30 pb-2">
          Orbital Properties
        </h3>
        <div className="space-y-1">
          <DataRow
            label="Orbital Period"
            value={selectedPlanet.orbitalPeriod ? `${selectedPlanet.orbitalPeriod} days` : undefined}
          />
          <DataRow label="Distance" value={selectedPlanet.distance ? `${selectedPlanet.distance} ly` : undefined} />
        </div>
      </Card>

      {/* Discovery Info */}
      <Card className="retro-border bg-card/50 p-4">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 border-b border-primary/30 pb-2">
          Discovery Information
        </h3>
        <div className="space-y-1">
          <DataRow label="Method" value={selectedPlanet.discoveryMethod} />
          <DataRow label="Host Star" value={selectedPlanet.hostStar} />
        </div>
      </Card>

      {/* ML Analysis Placeholder */}
      <Card className="retro-border bg-card/50 p-4">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 border-b border-secondary/30 pb-2">
          AI Model Analysis
        </h3>
        <div className="text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>ML model integration pending</span>
          </div>
          <div className="bg-muted/20 p-3 rounded font-mono text-[10px] leading-relaxed">
            <div>CONFIDENCE: ---%</div>
            <div>HABITABILITY: ---</div>
            <div>ATMOSPHERE: ---</div>
            <div>BIOSIGNATURES: ---</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
