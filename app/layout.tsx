import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Big_Shoulders } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

// UI chrome — deliberately quiet, meant to recede.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// The typing area's own face — engineered, legible at speed. The signature.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Results/headings only — tall, condensed, reads like a scoreboard digit.
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  title: "typerush",
  description: "A minimalist, fast typing speed test.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="signal"
      className={`${geistSans.variable} ${plexMono.variable} ${bigShoulders.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <div className="grid-backdrop fixed inset-0 pointer-events-none z-0" aria-hidden="true" />
        <AuthProvider>
          <ThemeProvider>
            <NavBar />
            <main className="relative z-10 flex-1 flex flex-col justify-center px-4">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
