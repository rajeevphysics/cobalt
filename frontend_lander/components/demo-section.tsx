import styles from "./demo-section.module.css"

export default function DemoSection() {
  return (
    <section id="demo" className={styles.demoSection}>
      <div className={styles.demoContainer}>
        <video autoPlay muted loop playsInline className={styles.demoVideo}>
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/demo-FohTvAYJwA4N6WqIjMxVizqMmQO6nf.webm"
            type="video/webm"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  )
}
