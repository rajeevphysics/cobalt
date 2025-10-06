"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./interface-section.module.css"

export default function InterfaceSection() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const section = sectionRef.current
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      const sectionFullyVisible = rect.top <= 0
      const scrollPastSection = Math.abs(rect.top)
      const transitionRange = windowHeight * 2.5

      let progress = 0
      if (sectionFullyVisible) {
        progress = Math.max(0, Math.min(1, scrollPastSection / transitionRange))
      }

      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Stage 1: Planet moves up and fades out (0-33%)
  const stage1Progress = Math.min(scrollProgress / 0.33, 1)
  const planetTransform = `translateY(${-stage1Progress * 150}%)`
  const planetOpacity = 1 - stage1Progress

  // Stage 2: Text moves from right to left with smooth transition (33-66%)
  const stage2Progress = Math.max(0, Math.min((scrollProgress - 0.33) / 0.33, 1))

  // Calculate horizontal movement for text from right side to left side
  const textRightToLeft = stage2Progress * 100 // 0 to 100%
  const textInitialTransform = `translate(${-textRightToLeft}%, -50%)`
  const textInitialOpacity = 1 - stage2Progress

  const textMovingTransform = `translate(${100 - textRightToLeft}%, -50%)`
  const textMovingOpacity = stage2Progress

  // Text content changes at midpoint
  const showNewText = stage2Progress > 0.5

  // Stage 3: Image fades in (66-100%)
  const stage3Progress = Math.max(0, Math.min((scrollProgress - 0.66) / 0.34, 1))
  const imageOpacity = stage3Progress
  const imageTransform = `translate(-50%, calc(-50% + ${(1 - stage3Progress) * 50}px))`

  return (
    <section ref={sectionRef} className={styles.interfaceSection} data-section="interface">
      <div className={styles.interfaceContainer}>
        <div className={styles.interfaceLeft}>
          {/* Planet (disappears during stage 1) */}
          <div
            className={styles.planetContainer}
            style={{
              transform: planetTransform,
              opacity: planetOpacity,
              pointerEvents: planetOpacity > 0 ? "auto" : "none",
            }}
          >
            <div className={styles.planet}>
              <div className={styles.planetSurface}></div>
              <div className={styles.planetAtmosphere}></div>
            </div>
          </div>

          {/* Text moving from right (appears on left during stage 2) */}
          <div
            className={styles.textMoving}
            style={{
              transform: textMovingTransform,
              opacity: textMovingOpacity,
              pointerEvents: textMovingOpacity > 0 ? "auto" : "none",
            }}
          >
            <h2 className={styles.interfaceTitle}>{showNewText ? "Advanced Analytics" : "Simple Interface"}</h2>
            <p className={styles.interfaceDescription}>
              {showNewText
                ? "Advanced data visualization tools bring your exoplanet discoveries to life. Interactive charts, real-time analysis, and comprehensive reporting make it easy to understand complex astronomical data."
                : "Our intuitive platform makes exoplanet analysis accessible to everyone. Upload your data, run predictions, and visualize results with just a few clicks."}
            </p>
          </div>
        </div>

        <div className={styles.interfaceRight}>
          {/* Initial text on right (moves left and fades during stage 2) */}
          <div
            className={styles.textInitial}
            style={{
              transform: textInitialTransform,
              opacity: textInitialOpacity,
              pointerEvents: textInitialOpacity > 0 ? "auto" : "none",
            }}
          >
            <h2 className={styles.interfaceTitle}>Simple Interface</h2>
            <p className={styles.interfaceDescription}>
              Our intuitive platform makes exoplanet analysis accessible to everyone. Upload your data, run predictions,
              and visualize results with just a few clicks. No complex setup required.
            </p>
          </div>

          {/* Replacement image (appears during stage 3) */}
          <div
            className={styles.imageBox}
            style={{
              opacity: imageOpacity,
              transform: imageTransform,
              pointerEvents: imageOpacity > 0 ? "auto" : "none",
            }}
          >
            <img src="/final.webp" alt="Data Preview Table" className={styles.interfaceImage} />
          </div>
        </div>
      </div>
    </section>
  )
}
