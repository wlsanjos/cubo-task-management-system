"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"
import { LogOut, Plus } from "lucide-react"

const navItems = [
  {
    href: "/dashboard",
    label: "Visão Geral",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tasks",
    label: "Minhas Tarefas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: "/dashboard/calendar",
    label: "Calendário",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/files",
    label: "Arquivos",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reports",
    label: "Relatórios",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    ),
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const getPageTitle = () => {
    const currentPath = navItems.find(item => item.href === pathname)
    return currentPath?.label || "Dashboard"
  }
  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-container text-white flex flex-col p-6 z-50 shadow-2xl shadow-primary-container/20">
        <div className="mb-12">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <span className="font-black tracking-tight text-xl block leading-none text-white">ORCHESTRATOR</span>
              <span className="sidebar-label mt-1 block">Enterprise Suite</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all grow-0 group",
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-sm"
                    : "text-blue-50/60 hover:text-white hover:bg-white/5"
                )}
              >
                <span className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-blue-100/30 group-hover:text-white/60")}>
                  {item.icon}
                </span>
                <span className={cn("label-md text-inherit lowercase first-letter:uppercase tracking-tight", isActive ? "sidebar-text-active" : "sidebar-text")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Remove create button from here */}

        <div className="mt-auto pt-8 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-blue-50/60 hover:text-white hover:bg-white/5 transition-all group"
          >
            <LogOut className="w-5 h-5 text-blue-100/30 group-hover:text-white/60 transition-colors" />
            <span className="label-md lowercase first-letter:uppercase tracking-tight">Sair do Sistema</span>
          </button>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/5 overflow-hidden">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-white uppercase tracking-tight">{user?.name || "Usuário"}</p>
                <p className="text-[10px] text-white/40 truncate font-medium uppercase tracking-widest leading-none mt-1">{user?.role || "Project Lead"}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl h-20 flex items-center justify-between px-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="Search tasks, members or projects..."
                className="w-full bg-surface-container-low h-12 pl-12 pr-4 rounded-xl text-sm font-medium focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
              </button>
              <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-on-surface-variant/10">
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface leading-tight">{user?.name || "Arthur Morgan"}</p>
                <p className="label-md text-[9px] mt-0.5">{user?.name || "Project Lead"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-container overflow-hidden p-0.5 shadow-sm border border-on-surface-variant/10">
                <div className="w-full h-full bg-slate-200 rounded-[9px] flex items-center justify-center overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-slate-400 p-1">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  )
}