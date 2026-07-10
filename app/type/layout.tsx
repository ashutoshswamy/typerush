import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Test",
  description:
    "Take a timed or word-count typing test on typerush and see live WPM, accuracy, and consistency stats.",
  alternates: {
    canonical: "/type",
  },
  openGraph: {
    title: "Typing Test · typerush",
    description:
      "Take a timed or word-count typing test on typerush and see live WPM, accuracy, and consistency stats.",
    url: "https://typerush.ashutoshswamy.in/type",
  },
};

export default function TypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
