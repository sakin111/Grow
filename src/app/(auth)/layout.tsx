export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">🌱 Grow</h1>
      </div>
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
