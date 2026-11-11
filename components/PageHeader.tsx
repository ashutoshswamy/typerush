// Shared page title block: big Bricolage heading with one quiet line under it.
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.05] tracking-tight text-text">
        {title}
      </h1>
      {description && <p className="max-w-xl text-lg leading-relaxed text-text/65">{description}</p>}
      {children}
    </header>
  );
}
