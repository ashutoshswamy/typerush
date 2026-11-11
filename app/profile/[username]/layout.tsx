import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const title = `${username}'s profile`;
  const description = `${username}'s typing stats, personal bests, and recent tests on typerush.`;

  return {
    title,
    description,
    robots: { index: false, follow: true }, // client-rendered, thin, unknown users still 200
    alternates: {
      canonical: `/profile/${username}`,
    },
    openGraph: {
      siteName: "typerush",
      images: [{ url: "/og-image.jpg", width: 1731, height: 909 }],
      title: `${title} · typerush`,
      description,
      url: `https://typerush.ashutoshswamy.in/profile/${username}`,
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
