"use client"

import styles from "./footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <h2 className={styles.footerTitle}>Try The App Now</h2>
        <button
          className={styles.launchButton}
          onClick={() => (window.location.href = "https://cobalt-exoplaner-finder.vercel.app/")}
        >
          Launch Eukleídes
        </button>
      </div>
    </footer>
  )
}
