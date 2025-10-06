import "./globals.css"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import DemoSection from "@/components/demo-section"
import AccuracySection from "@/components/accuracy-section"
import InterfaceSection from "@/components/interface-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <DemoSection />
      <AccuracySection />
      <InterfaceSection />
      <Footer />
    </>
  )
}
