"use client"

import styles from "./navbar.module.css"

export default function Navbar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToInterface = () => {
    const interfaceSection = document.querySelector('[data-section="interface"]')
    if (interfaceSection) {
      interfaceSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        <h2 className={styles.navLogo} onClick={scrollToTop} style={{ cursor: "pointer" }}>
          Eukleídes
        </h2>
        <nav className={styles.navLinks}>
          <a href="#about">ML Modeling</a>
          <a
            href="#interface"
            onClick={(e) => {
              e.preventDefault()
              scrollToInterface()
            }}
          >
            Interface
          </a>
          <a href="https://cobalt-exoplaner-finder.vercel.app/" target="_blank" rel="noopener noreferrer">
            Launch App
          </a>
        </nav>
      </div>
    </header>
  )
}
