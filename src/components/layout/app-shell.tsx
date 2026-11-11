import { Header } from "./header"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
      <Header />
      <main className="flex-1 pb-24 sm:pb-8 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
