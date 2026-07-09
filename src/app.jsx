import React from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import TrustBar from "./components/TrustBar.jsx";
import Products from "./components/Products.jsx";
import QualitySection from "./components/QualitySection.jsx";
import LifestyleSection from "./components/LifestyleSection.jsx";
import FAQ from "./components/FAQ.jsx";
import Newsletter from "./components/Newsletter.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-porcelain text-ink">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Products />
        <QualitySection />
        <LifestyleSection />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
