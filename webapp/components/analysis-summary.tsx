"use client"

import { Button } from "./ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface AnalysisSummaryProps {
  data: {
    summary: {
      "Confirmed Planets": number
      "Candidate Planets": number
      "False Positives": number
      "Average Prediction Confidence (%)": number
    }
    allRows: any[]
    keyInsights: {
      mostPromisingCandidate: any
      mostConfidentConfirmation: any
      highestPriorityReview: any
    }
  }
  totalRows: number
  fileName: string
}

export function AnalysisSummary({ data, totalRows, fileName }: AnalysisSummaryProps) {
  const { summary, keyInsights, allRows } = data

  const chartData = [
    { name: "Candidates", count: summary["Candidate Planets"], color: "bg-yellow-500" },
    { name: "Confirmed", count: summary["Confirmed Planets"], color: "bg-green-500" },
    { name: "False Positives", count: summary["False Positives"], color: "bg-red-500" },
  ]

  const maxCount = Math.max(...chartData.map((d) => d.count))

  const handleDownload = () => {
    const csvContent = allRows.map((row) => Object.values(row).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8," })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "analysis_results.csv")
    link.click()
    URL.revokeObjectURL(url)
  }

  const pieChartData = [
    { name: "Candidate Planets", value: summary["Candidate Planets"], color: "#eab308" },
    { name: "Confirmed Planets", value: summary["Confirmed Planets"], color: "#22c55e" },
    { name: "False Positives", value: summary["False Positives"], color: "#ef4444" },
  ]

  return (
    <div className="space-y-6 text-sm">
      {/* A. High-Level Overview */}
      <div className="retro-border bg-card/50 p-4 space-y-3">
        <h3 className="text-base font-bold text-primary uppercase">High-Level Overview</h3>
        <p className="text-xs">
          Analyzed <span className="font-bold text-accent">{totalRows}</span> systems from{" "}
          <span className="font-mono text-accent">{fileName}</span>.
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase">Classification Breakdown</h4>
          <div className="space-y-2">
            {chartData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-bold text-primary">{item.count}</span>
                </div>
                <div className="h-6 retro-border bg-background overflow-hidden">
                  <div
                    className={`h-full ${item.color} opacity-60 transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs">
          <span className="text-muted-foreground">Overall Model Confidence:</span>
          <span className="font-bold text-accent ml-2">{summary["Average Prediction Confidence (%)"]}%</span>
        </div>
      </div>

      {/* B. Key Insights */}
      <div className="retro-border bg-card/50 p-4 space-y-4">
        <h3 className="text-base font-bold text-primary uppercase">Key Insights for Researchers</h3>

        {keyInsights.mostPromisingCandidate && (
          <div className="space-y-1">
            <h4 className="font-bold text-yellow-400 text-xs">Most Promising Candidate</h4>
            <p className="text-muted-foreground text-xs">
              A signal with a{" "}
              <span className="font-bold text-accent">{keyInsights.mostPromisingCandidate.orbital_period} day</span>{" "}
              orbit was found. The model is{" "}
              <span className="font-bold text-accent">
                {keyInsights.mostPromisingCandidate["Prediction Confidence (%)"]}%
              </span>{" "}
              confident it's a real planet.
            </p>
          </div>
        )}

        {keyInsights.mostConfidentConfirmation && (
          <div className="space-y-1">
            <h4 className="font-bold text-green-400 text-xs">Most Confident Confirmation</h4>
            <p className="text-muted-foreground text-xs">
              The model is most certain about the planet with a{" "}
              <span className="font-bold text-accent">{keyInsights.mostConfidentConfirmation.orbital_period} day</span>{" "}
              orbit, classifying it as Confirmed with{" "}
              <span className="font-bold text-accent">
                {keyInsights.mostConfidentConfirmation["Prediction Confidence (%)"]}%
              </span>{" "}
              confidence.
            </p>
          </div>
        )}

        {keyInsights.highestPriorityReview && (
          <div className="space-y-1">
            <h4 className="font-bold text-red-400 text-xs">Highest Priority for Review</h4>
            <p className="text-muted-foreground text-xs">
              A system was flagged as a False Positive, but with only{" "}
              <span className="font-bold text-accent">
                {keyInsights.highestPriorityReview["Prediction Confidence (%)"]}%
              </span>{" "}
              confidence. This case may warrant manual inspection.
            </p>
          </div>
        )}
      </div>

      {/* C. Educational Insights */}
      <div className="retro-border bg-card/50 p-4 space-y-3">
        <h3 className="text-base font-bold text-primary uppercase">What Does This Mean?</h3>
        <div className="space-y-1">
          <h4 className="font-bold text-yellow-400 text-xs">What is a "Candidate"?</h4>
          <p className="text-muted-foreground text-xs">
            A Candidate is a signal that looks like a planet but needs more observation to be proven. Your file contains{" "}
            <span className="font-bold text-accent">{summary["Candidate Planets"]}</span> of these exciting
            possibilities!
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-green-400 text-xs">What is a "Confirmed"?</h4>
          <p className="text-muted-foreground text-xs">
            A Confirmed planet is a signal that has been verified through multiple observations and analysis methods.
            The AI model has high confidence that these{" "}
            <span className="font-bold text-accent">{summary["Confirmed Planets"]}</span> signals are genuine exoplanets
            orbiting their host stars.
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-red-400 text-xs">What is a "False Positive"?</h4>
          <p className="text-muted-foreground text-xs">
            This is a signal that mimics a planet but is likely caused by something else, like starspots or another
            background object. Our AI helps scientists filter out{" "}
            <span className="font-bold text-accent">{summary["False Positives"]}</span> of these from the data.
          </p>
        </div>
      </div>

      {/* D. Download Button */}
      <div className="text-center">
        <Button
          onClick={handleDownload}
          className="w-full retro-border bg-primary/20 hover:bg-primary/30 text-primary border-primary/50"
        >
          Download Full Results (.csv)
        </Button>
      </div>
    </div>
  )
}
