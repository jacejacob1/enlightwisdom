import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import Divisions from "@/components/sections/Divisions";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Products from "@/components/sections/Products";
import Education from "@/components/sections/Education";
import Partners from "@/components/sections/Partners";
import Proof from "@/components/sections/Proof";
import Team from "@/components/sections/Team";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[1]">
        <Hero />
        <Divisions />
        <About />
        <Services />
        <Products />
        <Education />
        <Partners />
        <Proof />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
