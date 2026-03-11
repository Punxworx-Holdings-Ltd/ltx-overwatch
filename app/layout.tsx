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
  title: "LTx OVERWATCH | Space Aye",
  description:
    "Seeing Earth is Easy. Identifying everything on it... is power. The world's only patented platform for merging IoT data with real-time satellite imagery.",
  openGraph: {
    title: "LTx OVERWATCH | Space Aye",
    description:
      "The world's only patented platform for merging IoT data with real-time satellite imagery.",
    siteName: "LTx OVERWATCH",
    type: "website",
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
