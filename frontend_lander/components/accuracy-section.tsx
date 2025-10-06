"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./accuracy-section.module.css"

export default function AccuracySection() {
  const [accuracyCount, setAccuracyCount] = useState(0)
  const accuracyRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            // Animate from 0 to 70
            let count = 0
            const interval = setInterval(() => {
              count += 1
              setAccuracyCount(count)
              if (count >= 70) {
                clearInterval(interval)
              }
            }, 30)
          }
        })
      },
      { threshold: 0.5 },
    )

    if (accuracyRef.current) {
      observer.observe(accuracyRef.current)
    }

    return () => {
      if (accuracyRef.current) {
        observer.unobserve(accuracyRef.current)
      }
    }
  }, [])

  return (
    <section id="about" className={styles.infoSection} ref={accuracyRef}>
      <div className={styles.infoContainer}>
        <div className={styles.infoText}>
          <h2 className={styles.infoTitle}>
            <span className={styles.accuracyNumber}>{accuracyCount}%</span>
            <span className={styles.accuracyLabel}>Accuracy Rate</span>
          </h2>
          <p className={styles.infoBody}>
            Eukleídes is an innovative ML algorithm that analyzes exoplanetary data to predict habitability.
          </p>
        </div>

        <div className={styles.infoImageBox}>
          <img
            src="/images/design-mode/image%20%281%29.webp"
            alt="Eukleídes visualization"
            className={styles.infoImage}
          />
        </div>
      </div>
    </section>
  )
}
