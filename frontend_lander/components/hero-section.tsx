"use client"

import styles from "./hero-section.module.css"

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <video autoPlay muted loop playsInline className={styles.heroVideo}>
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/back-wLIg7uB3xanIlH52FBTPEOGuHFbeQ4.webm"
          type="video/webm"
        />
      </video>

      <div className={styles.contentContainer}>
        <h1
          className={styles.heroTitle}
          style={{
            fontSize: "clamp(4.5rem, 6vw, 6rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            marginBottom: "3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ display: "block", color: "var(--tx1)" }}>Where Stars</span>
          <span style={{ display: "block", color: "var(--tx1)" }}>Whisper Prophecy</span>
        </h1>

        <img
          className={styles.typingSvg}
          src="https://readme-typing-svg.herokuapp.com?font=Arial&size=60&duration=4800&pause=2000&color=FFFFFF&center=true&vCenter=true&width=1250&height=100&lines=Analyzing+Planetary+Data+.+.+.;Predicting+Habitability+.+.+.;Connecting+Science+and+Machine+Learning+.+.+."
          alt="Typing Animation"
        />

        <div className={styles.buttonRow}>
          <button
            id="toggleFormButton"
            className={styles.toggleFormButton}
            onClick={() => (window.location.href = "https://cobalt-exoplaner-finder.vercel.app/")}
            data-info="For explorers — try out the app directly."
          >
            Launch Eukleídes
          </button>
          <label
            htmlFor="csvInput"
            onClick={() => (window.location.href = "https://cobalt-exoplaner-finder.vercel.app/")}
            className={styles.csvLabel}
            data-info="For researchers — upload data for batch analysis."
            tabIndex={0}
          >
            GitHub Repo
          </label>
          <input type="file" id="csvInput" accept=".csv" className={styles.csvInput} />
        </div>
        <div className={styles.infoBox} id="infoBox"></div>
      </div>
    </section>
  )
}
