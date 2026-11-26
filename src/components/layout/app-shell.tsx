"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen flex bg-background text-foreground antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Persistent Desktop Sidebar + Mobile Drawer */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Right Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 pb-24 lg:pb-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
