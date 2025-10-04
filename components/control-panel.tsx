"use client"

import { Button } from "./ui/button"
import { Play, Pause, RotateCcw, Zap, Database, Settings } from "lucide-react"

export function ControlPanel() {
  return (
    <div className="px-4 py-3 bg-card/30">
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-mono uppercase tracking-wider hover:bg-primary/20 hover:text-primary hover:border-primary retro-border bg-transparent"
          >
            <Play className="h-3 w-3 mr-1" />
            Scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-mono uppercase tracking-wider hover:bg-primary/20 hover:text-primary hover:border-primary retro-border bg-transparent"
          >
            <Pause className="h-3 w-3 mr-1" />
            Pause
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-mono uppercase tracking-wider hover:bg-primary/20 hover:text-primary hover:border-primary retro-border bg-transparent"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Center Status */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-muted-foreground">SYSTEM ACTIVE</span>
          </div>
          <div className="text-muted-foreground">
            CPU: <span className="text-primary">23%</span>
          </div>
          <div className="text-muted-foreground">
            MEM: <span className="text-primary">1.2GB</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-mono uppercase tracking-wider hover:bg-accent/20 hover:text-accent hover:border-accent retro-border bg-transparent"
          >
            <Zap className="h-3 w-3 mr-1" />
            AI Model
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-mono uppercase tracking-wider hover:bg-primary/20 hover:text-primary hover:border-primary retro-border bg-transparent"
          >
            <Database className="h-3 w-3 mr-1" />
            Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-mono uppercase tracking-wider hover:bg-primary/20 hover:text-primary hover:border-primary retro-border bg-transparent"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
