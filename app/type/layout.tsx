import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Test",
  description:
    "Take a timed or word-count typing test on typerush and see live WPM, accuracy, and consistency stats.",
  alternates: {
    canonical: "/type",
  },
  openGraph: {
    siteName: "typerush",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1731, height: 909 }],
    title: "Typing Test · typerush",
    description:
      "Take a timed or word-count typing test on typerush and see live WPM, accuracy, and consistency stats.",
    url: "https://typerush.ashutoshswamy.in/type",
  },
};

export default function TypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
