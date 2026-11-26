import { Header } from "./header"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pb-24 sm:pb-8 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 focus:outline-none"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
