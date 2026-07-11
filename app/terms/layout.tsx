import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for typerush.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service · typerush",
    description: "Terms of Service for typerush.",
    url: "https://typerush.ashutoshswamy.in/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
