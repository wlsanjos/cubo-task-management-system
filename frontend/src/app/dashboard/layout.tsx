"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col p-4 z-50 shadow-2xl shadow-slate-900/10">
        <div className="mb-8 px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="font-black tracking-tighter text-xl">Orchestrator</span>
          </Link>
          <span className="text-xs uppercase tracking-widest opacity-60 block mt-1">Enterprise Tier</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.icon}
                <span className="uppercase tracking-wider text-xs">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="uppercase tracking-wider text-xs">Sair</span>
          </Button>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{getPageTitle()}</h1>
            <nav className="hidden md:flex gap-6">
              <a className="text-sm tracking-tight text-blue-700 font-semibold border-b-2 border-blue-700 pb-1" href="#">Dashboard</a>
              <a className="text-sm tracking-tight text-slate-500 hover:text-slate-800 transition-colors" href="#">Tarefas</a>
              <a className="text-sm tracking-tight text-slate-500 hover:text-slate-800 transition-colors" href="#">Analytics</a>
              <a className="text-sm tracking-tight text-slate-500 hover:text-slate-800 transition-colors" href="#">Equipe</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
              Criar Tarefa
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-900">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}