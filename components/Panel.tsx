// Rounded surface used wherever a block of content needs a container.
export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return <div className={`surface ${className}`}>{children}</div>;
}
