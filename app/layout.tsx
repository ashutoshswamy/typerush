import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Toaster } from "sileo";
import "sileo/styles.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { UsernamePrompt } from "@/components/UsernamePrompt";
import { CookieConsent } from "@/components/CookieConsent";

// Body, UI and the typing area: one quiet, open sans.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Headlines and result numbers only: characterful, tightly set.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
    images: [{ url: "/og-image.jpg", width: 1731, height: 909, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
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
  image: `${SITE_URL}/og-image.jpg`,
  author: {
    "@type": "Person",
    name: "Ashutosh Swamy",
    sameAs: [
      "https://github.com/ashutoshswamy",
      "https://linkedin.com/in/ashutoshswamy",
      "https://x.com/ashutoshswamy_",
    ],
  },
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
      className={`${dmSans.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
        <div className="ambient fixed inset-0 pointer-events-none z-0" aria-hidden="true" />
        <AuthProvider>
          <ThemeProvider>
            <UsernamePrompt />
            <NavBar />
            <main className="relative z-10 flex-1 flex flex-col justify-center px-4">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <CookieConsent />
            <Toaster position="top-center" theme="dark" offset={{ top: 16 }} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
