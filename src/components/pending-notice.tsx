export function PendingNotice({
  title = "Integración pendiente",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="notice notice-gold">
      <b>{title}</b>
      <div className="mt-1">{children}</div>
    </div>
  );
}
