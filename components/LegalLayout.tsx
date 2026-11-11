import { PageHeader } from "./PageHeader";

export interface LegalTocItem {
  id: string;
  title: string;
}

// Read-mode layout for long text: sticky contents list beside the copy.
export function LegalLayout({
  title,
  updated,
  toc,
  children,
}: {
  title: string;
  updated: string;
  toc: LegalTocItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl py-12 sm:py-16">
      <PageHeader title={title} description={`Last updated ${updated}`} />
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <nav aria-label="Contents" className="hidden lg:block">
          <ul className="sticky top-8 flex flex-col gap-1 text-sm">
            {toc.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className="block rounded-lg px-3 py-1.5 text-text/65 transition-colors hover:bg-main/10 hover:text-main"
                >
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="surface flex min-w-0 flex-col gap-10 break-words p-6 text-base leading-relaxed text-text/85 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-8 flex-col gap-3">
      <h2 className="font-display text-2xl font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}
