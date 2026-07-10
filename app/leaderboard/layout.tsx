import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Global typing speed leaderboard — see the fastest typists on typerush, filterable by mode and duration.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Leaderboard · typerush",
    description: "Global typing speed leaderboard — see the fastest typists on typerush, filterable by mode and duration.",
    url: "https://typerush.ashutoshswamy.in/leaderboard",
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
