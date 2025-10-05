"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { Button } from "./ui/button"
import { Upload, FileText, ArrowLeft, Loader2 } from "lucide-react"
import { AnalysisSummary } from "./analysis-summary"

interface DatasetAnalysisProps {
  onBackToIndividual: () => void
}

export function DatasetAnalysis({ onBackToIndividual }: DatasetAnalysisProps) {
  const [fileName, setFileName] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedData, setUploadedData] = useState<any[] | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [leftWidth, setLeftWidth] = useState(65) // percentage
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Constrain between 30% and 80%
    if (newLeftWidth >= 30 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploadedFile(file)
    setIsProcessing(true)
    setAnalysisResults(null)
    setAnalysisError("")

    try {
      const text = await file.text()

      if (file.name.endsWith(".csv")) {
        // Parse CSV file
        const lines = text.split("\n").filter((line) => line.trim() && !line.startsWith("#"))
        if (lines.length < 2) {
          throw new Error("CSV file must have at least a header and one data row")
        }

        const headers = lines[0].split(",").map((h) => h.trim())
        const data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index]
          })
          return obj
        })

        setUploadedData(data)
      } else {
        throw new Error("Only CSV files are supported")
      }
    } catch (error) {
      console.error("Error parsing file:", error)
      alert("Error parsing file. Please check the file format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAnalyzeDataset = async () => {
    if (!uploadedFile) {
      setAnalysisError("Please select a file first.")
      return
    }

    setIsLoadingAnalysis(true)
    setAnalysisError("")
    setAnalysisResults(null)

    const formData = new FormData()
    formData.append("file", uploadedFile)

    try {
      const response = await fetch("https://xgboostcsv-api.onrender.com/predict_csv", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${response.statusText}. Response: ${errorText}`)
      }

      const data = await response.json()
      setAnalysisResults(data)
    } catch (error) {
      console.error("Analysis API error:", error)
      setAnalysisError("Failed to analyze the dataset. Please try again.")
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  const processedData = useMemo(() => {
    if (!analysisResults?.csv) {
      return null
    }

    // Parse the CSV string from the API
    const lines = analysisResults.csv.split("\n").filter((line: string) => line.trim())
    if (lines.length < 2) return null

    const headers = lines[0].split(",").map((h: string) => h.trim())
    const allRows = lines.slice(1).map((line: string) => {
      const values = line.split(",").map((v: string) => v.trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        // Convert numeric values
        const value = values[index]
        obj[header] = isNaN(Number(value)) ? value : Number(value)
      })
      return obj
    })

    // Calculate key insights
    const candidates = allRows.filter((row) => row["Overall Prediction"] === "Candidate Planet")
    const confirmed = allRows.filter((row) => row["Overall Prediction"] === "Confirmed Planet")
    const falsePositives = allRows.filter((row) => row["Overall Prediction"] === "False Positive")

    const findBest = (arr: any[], metric: string, sortOrder: "desc" | "asc" = "desc") => {
      if (!arr || arr.length === 0) return null
      const sorted = [...arr].sort((a, b) => {
        return sortOrder === "desc" ? b[metric] - a[metric] : a[metric] - b[metric]
      })
      return sorted[0]
    }

    const mostPromisingCandidate = findBest(candidates, "Prediction Confidence (%)")
    const mostConfidentConfirmation = findBest(confirmed, "Prediction Confidence (%)")
    const highestPriorityReview = findBest(falsePositives, "Prediction Confidence (%)", "asc")

    return {
      summary: analysisResults.summary,
      allRows,
      keyInsights: {
        mostPromisingCandidate,
        mostConfidentConfirmation,
        highestPriorityReview,
      },
    }
  }, [analysisResults])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="h-full flex flex-col" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="retro-border border-b px-3 py-2 flex items-center justify-between bg-card">
        <div className="flex items-center flex-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider" style={{ width: `${leftWidth}%` }}>
            DATASET ANALYSIS
          </span>
          <span className="text-xs font-bold text-primary uppercase tracking-wider pl-6">AI MODEL PROPERTIES</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToIndividual}
          className="h-6 px-2 text-xs hover:bg-primary/20 hover:text-primary retro-border"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          INDIVIDUAL DATA ANALYSIS
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative" ref={containerRef}>
        <div className="flex h-full">
          {/* Left Column - Dataset Analysis */}
          <div className="overflow-auto" style={{ width: `${leftWidth}%` }}>
            <div className="p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* File Upload Section */}
                <div className="retro-border bg-card/50 p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-primary uppercase">Upload Dataset</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload a CSV file containing exoplanet data for batch analysis
                    </p>
                  </div>

                  {/* Hidden file input */}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />

                  {/* Upload button */}
                  <Button
                    onClick={handleButtonClick}
                    disabled={isProcessing}
                    className="w-full retro-border bg-primary/20 hover:bg-primary/30 text-primary border-primary/50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isProcessing ? "PROCESSING..." : "SELECT FILE (.csv)"}
                  </Button>

                  {/* File name display */}
                  {fileName && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground retro-border bg-background p-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-primary font-mono">{fileName}</span>
                    </div>
                  )}
                </div>

                {/* Data Preview Section */}
                {uploadedData && uploadedData.length > 0 && !processedData && (
                  <div className="retro-border bg-card/50 p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-primary uppercase">Data Preview</h3>
                      <p className="text-xs text-muted-foreground">Loaded {uploadedData.length} records</p>
                    </div>

                    <div className="retro-border bg-background overflow-auto max-h-96">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-card sticky top-0">
                          <tr>
                            {Object.keys(uploadedData[0]).map((key) => (
                              <th key={key} className="text-left p-2 text-primary border-b border-border">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedData.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-b border-border/50 hover:bg-card/30">
                              {Object.values(row).map((value: any, cellIndex) => (
                                <td key={cellIndex} className="p-2 text-muted-foreground">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {uploadedData.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Showing first 10 of {uploadedData.length} records
                      </p>
                    )}

                    <Button
                      onClick={handleAnalyzeDataset}
                      disabled={isLoadingAnalysis}
                      className="w-full retro-border bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50"
                    >
                      {isLoadingAnalysis ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ANALYZING...
                        </>
                      ) : (
                        "ANALYZE DATASET"
                      )}
                    </Button>

                    {analysisError && (
                      <div className="retro-border bg-red-500/10 border-red-500/50 p-3 text-xs text-red-400">
                        {analysisError}
                      </div>
                    )}
                  </div>
                )}

                {processedData && (
                  <AnalysisSummary data={processedData} totalRows={processedData.allRows.length} fileName={fileName} />
                )}

                {/* Instructions Section */}
                {!uploadedData && (
                  <div className="retro-border bg-card/50 p-6 space-y-4">
                    <h3 className="text-xs font-bold text-primary uppercase">Expected File Format</h3>
                    <div className="space-y-3 text-xs text-muted-foreground">
                      <div>
                        <p className="font-bold text-white mb-2">CSV Format:</p>
                        <pre className="retro-border bg-background p-3 overflow-auto text-[10px] font-mono">
                          {`orbital_period,planet_radius,stellar_temp,stellar_radius,transit_depth,transit_duration
365.0,1.0,5778,1.0,100,13
11.2,1.02,3050,0.14,0,0`}
                        </pre>
                      </div>
                      <div className="space-y-2 pt-2">
                        <p className="font-bold text-white">✅ Required Columns:</p>
                        <ul className="space-y-1 text-[10px] pl-4">
                          <li>• orbital_period → orbital period in Earth days</li>
                          <li>• planet_radius → planet radius in Earth radii</li>
                          <li>• stellar_temp → star temperature in Kelvin</li>
                          <li>• stellar_radius → star radius in Solar radii</li>
                          <li>• transit_depth → brightness drop during transit (ppm/1e6)</li>
                          <li>• transit_duration → transit duration in Earth hours</li>
                        </ul>
                      </div>
                      <div className="space-y-2 pt-2">
                        <p className="font-bold text-white">⚙️ Formatting Rules:</p>
                        <ul className="space-y-1 text-[10px] pl-4">
                          <li>• Use commas (,) as separators</li>
                          <li>• Use UTF-8 encoding</li>
                          <li>• Column names must match exactly (lowercase, underscores)</li>
                          <li>• Extra columns (e.g., name, id) are allowed</li>
                          <li>• Blank rows or lines starting with # are ignored</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors relative group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          {/* Right Column - AI Model Properties */}
          <div className="flex-1 overflow-auto bg-card/30">
            <div className="p-6">
              <div className="space-y-6">
                <div className="retro-border bg-card/50 p-4 space-y-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Model Type</p>
                    <p className="font-bold text-primary">XGBoost Classifier</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Training Dataset</p>
                    <p className="font-bold text-primary">
                      Kepler Objects of Interest (KOI) and TESS Objects of Interest (TOI)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Model Accuracy</p>
                    <p className="font-bold text-green-400">70.49%</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Features Used</p>
                    <ul className="text-[10px] text-muted-foreground space-y-0.5 pl-3">
                      <li>• Orbital Period</li>
                      <li>• Planet Radius</li>
                      <li>• Stellar Temperature</li>
                      <li>• Stellar Radius</li>
                      <li>• Transit Depth</li>
                      <li>• Transit Duration</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Classification Types</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-[10px]">Confirmed Planet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-[10px]">Candidate Planet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-[10px]">False Positive</span>
                      </div>
                    </div>
                  </div>

                  <div className="retro-border bg-background p-3 space-y-1">
                    <p className="font-bold text-primary text-[10px]">About XGBoost</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      XGBoost is a powerful machine learning algorithm that excels at classification tasks. It learns
                      patterns from thousands of known exoplanets to identify new candidates in telescope data.
                    </p>
                  </div>
                </div>

                <div className="retro-border bg-card/50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase">What Clues Does the AI Look For?</h3>
                  <div className="retro-border bg-background p-2">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JrHb4v5H9wzvIx25cbiUwFqO3Qb1KF.png"
                      alt="Feature Importance Plot"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Our AI model learned to identify exoplanets by focusing on key physical characteristics. As you can
                    see, Transit Depth and Planet Radius were the most important factors in its decision-making, showing
                    it has learned to spot the tell-tale signs of a planet passing in front of its star.
                  </p>
                </div>

                <div className="retro-border bg-card/50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase">How Accurate is the Model?</h3>
                  <div className="retro-border bg-background p-2">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hm6h0AgCi7PH5lyd3lihfZ4DPY6NN7.png"
                      alt="Confusion Matrix"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This grid shows our model's accuracy. The diagonal line shows correct predictions. For example, our
                    model correctly identified 1038 Candidate planets, 493 Confirmed planets, and 904 False Positives.
                    The off-diagonal numbers show where it made mistakes, giving us insight into how to improve it
                    further.
                  </p>
                </div>

                <div className="retro-border bg-card/50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase">Statistical Performance Breakdown</h3>
                  <div className="retro-border bg-background overflow-x-auto">
                    <table className="w-full text-[10px] font-mono">
                      <thead>
                        <tr className="border-b border-primary/30">
                          <th className="text-left p-2 text-primary font-bold">Class</th>
                          <th className="text-center p-2 text-primary font-bold">Precision</th>
                          <th className="text-center p-2 text-primary font-bold">Recall</th>
                          <th className="text-center p-2 text-primary font-bold">F1-Score</th>
                          <th className="text-center p-2 text-primary font-bold">Support</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/30 hover:bg-card/30">
                          <td className="p-2 text-yellow-400">Candidate</td>
                          <td className="p-2 text-center text-muted-foreground">0.67</td>
                          <td className="p-2 text-center text-muted-foreground">0.73</td>
                          <td className="p-2 text-center text-muted-foreground">0.70</td>
                          <td className="p-2 text-center text-muted-foreground">1424</td>
                        </tr>
                        <tr className="border-b border-border/30 hover:bg-card/30">
                          <td className="p-2 text-green-400">Confirmed</td>
                          <td className="p-2 text-center text-muted-foreground">0.62</td>
                          <td className="p-2 text-center text-muted-foreground">0.61</td>
                          <td className="p-2 text-center text-muted-foreground">0.62</td>
                          <td className="p-2 text-center text-muted-foreground">803</td>
                        </tr>
                        <tr className="border-b border-border/30 hover:bg-card/30">
                          <td className="p-2 text-red-400">False Positive</td>
                          <td className="p-2 text-center text-muted-foreground">0.81</td>
                          <td className="p-2 text-center text-muted-foreground">0.74</td>
                          <td className="p-2 text-center text-muted-foreground">0.77</td>
                          <td className="p-2 text-center text-muted-foreground">1227</td>
                        </tr>
                        <tr className="border-b border-primary/50 bg-primary/10">
                          <td className="p-2 text-primary font-bold">Accuracy</td>
                          <td className="p-2 text-center text-muted-foreground">—</td>
                          <td className="p-2 text-center text-muted-foreground">—</td>
                          <td className="p-2 text-center text-primary font-bold">0.70</td>
                          <td className="p-2 text-center text-primary font-bold">3454</td>
                        </tr>
                        <tr className="border-b border-border/30 hover:bg-card/30">
                          <td className="p-2 text-muted-foreground">Macro Avg</td>
                          <td className="p-2 text-center text-muted-foreground">0.70</td>
                          <td className="p-2 text-center text-muted-foreground">0.69</td>
                          <td className="p-2 text-center text-muted-foreground">0.70</td>
                          <td className="p-2 text-center text-muted-foreground">3454</td>
                        </tr>
                        <tr className="hover:bg-card/30">
                          <td className="p-2 text-muted-foreground">Weighted Avg</td>
                          <td className="p-2 text-center text-muted-foreground">0.71</td>
                          <td className="p-2 text-center text-muted-foreground">0.70</td>
                          <td className="p-2 text-center text-muted-foreground">0.71</td>
                          <td className="p-2 text-center text-muted-foreground">3454</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Here's a statistical breakdown of our model's performance. The recall score for 'Confirmed' tells us
                    that our model successfully found 61% of all the real planets in our test data. The precision shows
                    that when it predicts a planet is confirmed, it's correct 62% of the time.
                  </p>
                </div>

                <div className="retro-border bg-card/50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase">The Challenge: Imbalanced Dataset</h3>
                  <div className="retro-border bg-black p-4 space-y-3">
                    <div className="space-y-4">
                      {/* Chart Title */}
                      <h4 className="text-xs text-center text-primary font-bold">
                        Distribution of Classes in Combined Dataset
                      </h4>

                      {/* Chart Bars */}
                      <div className="space-y-3">
                        {/* Candidate Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">Candidate</span>
                            <span className="text-primary font-mono">7200</span>
                          </div>
                          <div className="retro-border bg-background h-8 relative overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-900 to-indigo-700 flex items-center justify-center"
                              style={{ width: "100%" }}
                            >
                              <span className="text-[10px] font-bold text-white">7200 objects</span>
                            </div>
                          </div>
                        </div>

                        {/* False Positive Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">False Positive</span>
                            <span className="text-primary font-mono">6100</span>
                          </div>
                          <div className="retro-border bg-background h-8 relative overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-700 to-teal-500 flex items-center justify-center"
                              style={{ width: "85%" }}
                            >
                              <span className="text-[10px] font-bold text-white">6100 objects</span>
                            </div>
                          </div>
                        </div>

                        {/* Confirmed Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">Confirmed</span>
                            <span className="text-primary font-mono">4000</span>
                          </div>
                          <div className="retro-border bg-background h-8 relative overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 flex items-center justify-center"
                              style={{ width: "56%" }}
                            >
                              <span className="text-[10px] font-bold text-white">4000 objects</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Y-axis label */}
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Number of Objects</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This chart shows why finding exoplanets with AI is challenging. Confirmed planets are relatively
                    rare compared to candidates and false positives in our training data. The model's success, despite
                    this imbalance, highlights its effectiveness at learning from limited examples.
                  </p>
                </div>

                <div className="retro-border bg-card/50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-primary uppercase">Model's Ability to Distinguish Classes</h3>
                  <div className="retro-border bg-background p-2">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LyAVhMTpdqF2hRZfpaJqqClKb2oV47.png"
                      alt="ROC Curve"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The Receiver Operating Characteristic (ROC) curve visualizes our classifier's performance. A curve
                    that bows towards the top-left corner indicates a better model. Our model achieved strong AUC
                    scores: 0.91 for False Positives, 0.87 for Confirmed planets, and 0.81 for Candidates, all well
                    above the 0.5 baseline (dashed line), confirming strong predictive capability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
