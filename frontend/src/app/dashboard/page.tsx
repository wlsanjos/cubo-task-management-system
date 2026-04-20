"use client"

import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Bem-vindo, {user?.name}!</p>
      <button onClick={logout} className="text-red-500">
        Sair
      </button>
    </div>
  )
}