import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Big_Shoulders } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { UsernamePrompt } from "@/components/UsernamePrompt";

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

const SITE_URL = "https://typerush.ashutoshswamy.in";
const SITE_TITLE = "typerush — fast, minimalist typing speed test";
const SITE_DESCRIPTION =
  "Test your typing speed with typerush — a minimalist, Monkeytype-style WPM test with real-time stats, accuracy, consistency tracking, and global leaderboards.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · typerush",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "typing test",
    "typing speed test",
    "WPM test",
    "words per minute",
    "monkeytype alternative",
    "typing practice",
    "typing game",
    "typerush",
  ],
  authors: [{ name: "Ashutosh Swamy" }],
  creator: "Ashutosh Swamy",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "typerush",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

// Static, non-user-derived JSON — safe to render as a plain script child
// (no dangerouslySetInnerHTML needed) for a SoftwareApplication rich result.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "typerush",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Ashutosh Swamy" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="ayu"
      className={`${geistSans.variable} ${plexMono.variable} ${bigShoulders.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
        <div className="grid-backdrop fixed inset-0 pointer-events-none z-0" aria-hidden="true" />
        <AuthProvider>
          <ThemeProvider>
            <UsernamePrompt />
            <NavBar />
            <main className="relative z-10 flex-1 flex flex-col justify-center px-4">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
