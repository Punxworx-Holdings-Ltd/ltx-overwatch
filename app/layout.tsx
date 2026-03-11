import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LTx OVERWATCH | Space Aye — Patented Satellite-IoT Fusion",
    template: "%s | LTx OVERWATCH",
  },
  description:
    "Seeing Earth is Easy. Identifying everything on it... is power. The world's only patented platform for merging IoT data with real-time satellite imagery. US Patent 10,951,814 B2.",
  keywords: [
    "satellite imagery",
    "IoT",
    "geospatial intelligence",
    "GEOINT",
    "earth observation",
    "remote sensing",
    "fusion",
    "Space Aye",
    "LTx OVERWATCH",
    "patent",
    "defence",
    "maritime",
    "agriculture",
    "disaster response",
  ],
  authors: [{ name: "Space Aye" }],
  creator: "Space Aye",
  openGraph: {
    title: "LTx OVERWATCH | Space Aye",
    description:
      "The world's only patented platform for merging IoT data with real-time satellite imagery. AI classifies. Space Aye identifies.",
    siteName: "LTx OVERWATCH",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "LTx OVERWATCH | Space Aye",
    description:
      "Patented satellite-IoT fusion platform. See IoT data IN satellite imagery, not ON a map.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
