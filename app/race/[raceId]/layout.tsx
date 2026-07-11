import type { Metadata } from "next";

// Private, ephemeral, auth-gated 1v1 lobby — zero SEO value, never indexed.
export const metadata: Metadata = {
  title: "Race",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
