export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">{children}</div>
  );
}
