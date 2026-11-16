import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import SmoothScroll from "@/components/SmoothScroll";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], style: ["italic", "normal"], axes: ["opsz"], display: "swap" });
const josefin = Josefin_Sans({ variable: "--font-josefin", subsets: ["latin"], weight: ["300", "400", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://enlightwisdom.com"),
  title: site.seoTitle,
  description: site.seoDescription,
  keywords: [
    "robotics company Chennai",
    "AI automation",
    "RPA",
    "IoT",
    "robotics courses for schools",
    "AI courses for colleges",
    "Enlight Wisdom",
  ],
  openGraph: {
    title: site.seoTitle,
    description: site.seoDescription,
    type: "website",
    images: ["/brand/ew-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#141110",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bodoni.variable} ${josefin.variable} antialiased`}
    >
      <body className="grain theme-light min-h-screen">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
