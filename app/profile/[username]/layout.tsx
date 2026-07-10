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
    alternates: {
      canonical: `/profile/${username}`,
    },
    openGraph: {
      title: `${title} · typerush`,
      description,
      url: `https://typerush.ashutoshswamy.in/profile/${username}`,
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
