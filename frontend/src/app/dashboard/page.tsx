"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getTasks, getStats, type TaskPtBr, type TaskStats, type TaskFilters, mapTaskFromApi, type TaskStatusPtBr } from "@/services/task.service"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react"

const mockTasks: TaskPtBr[] = [
  {
    id: 1,
    title: "Implementar autenticação",
    description: "Criar sistema de login com Laravel Sanctum",
    status: "concluida",
    priority: "high",
    due_date: "2024-10-20",
    created_at: "2024-10-01",
    updated_at: "2024-10-20",
  },
  {
    id: 2,
    title: "Criar dashboard principal",
    description: "Implementar página inicial com estatísticas",
    status: "em_andamento",
    priority: "high",
    due_date: "2024-10-25",
    created_at: "2024-10-15",
    updated_at: "2024-10-22",
  },
  {
    id: 3,
    title: "Design do sistema de tarefas",
    description: "Criar interface para listagem de tarefas",
    status: "pendente",
    priority: "medium",
    due_date: "2024-10-28",
    created_at: "2024-10-18",
    updated_at: "2024-10-18",
  },
  {
    id: 4,
    title: "Configurar CI/CD",
    description: "Pipeline de deploy automático",
    status: "pendente",
    priority: "low",
    due_date: "2024-11-01",
    created_at: "2024-10-20",
    updated_at: "2024-10-20",
  },
  {
    id: 5,
    title: "Revisar documentação",
    description: "Atualizar README do projeto",
    status: "em_andamento",
    priority: "low",
    due_date: "2024-10-15",
    created_at: "2024-10-10",
    updated_at: "2024-10-10",
  },
]

const mockStats: TaskStats = {
  total_tasks: 24,
  pending_tasks: 8,
  in_progress_tasks: 10,
  completed_tasks: 4,
  overdue_tasks: 2,
  completion_rate: 16.67,
}

const statusConfig: Record<TaskStatusPtBr, { label: string; bgColor: string; textColor: string; borderColor: string; icon: React.ReactNode }> = {
  pendente: {
    label: "Pendente",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  em_andamento: {
    label: "Em Andamento",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  concluida: {
    label: "Concluída",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
}

function StatsCard({ title, value, icon, bgClass }: { title: string; value: number; icon: React.ReactNode; bgClass: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-0">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          {icon}
        </div>
        <span className="text-3xl font-bold text-[#191c1e]">{value}</span>
      </div>
      <p className="text-xs uppercase tracking-widest text-[#43474e] mt-4 font-medium">{title}</p>
    </div>
  )
}

function TaskSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 animate-pulse">
      <div className="w-10 h-10 bg-slate-100 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})

  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: undefined,
    start_date: undefined,
    end_date: undefined,
    page: 1,
  })

  const { data: stats } = useQuery<TaskStats>({
    queryKey: ["task-stats"],
    queryFn: getStats,
    staleTime: 30000,
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => getTasks(filters),
    staleTime: 30000,
  })

  const tasksFromApi = tasksData?.data?.map(mapTaskFromApi) || mockTasks
  console.log("tasksFromApi[0]:", tasksFromApi[0])

  const tasks = tasksFromApi

  const statsData = stats || mockStats
  const meta = tasksData?.meta

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleStatusFilter = (status: TaskStatusPtBr | undefined) => {
    setFilters(prev => ({ ...prev, status, page: 1 }))
  }

  const handleDateFilter = () => {
    setFilters(prev => ({
      ...prev,
      start_date: dateRange.start,
      end_date: dateRange.end,
      page: 1
    }))
    setShowDateFilter(false)
  }

  const clearDateFilter = () => {
    setDateRange({})
    setFilters(prev => ({
      ...prev,
      start_date: undefined,
      end_date: undefined,
      page: 1
    }))
    setShowDateFilter(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-slate-800">
            {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Usuário"}
          </h2>
          <p className="text-slate-500 max-w-lg">
            Seu workspace está {statsData.completion_rate || 0}% otimizado hoje. Você tem {statsData.pending_tasks} tarefas de alta prioridade requerendo atenção imediata.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl flex items-center gap-4 border border-slate-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Eficiência</div>
              <div className="text-xl font-bold text-slate-700">{stats?.completion_rate || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Bento Grid Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Pending Card */}
        <div className="col-span-1 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-xl space-y-4 shadow-sm border border-amber-100">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-700">{statsData.pending_tasks}</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-amber-700/80">Pendente</h3>
            <p className="text-sm text-amber-600/80">Aguardando aprovação</p>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="col-span-1 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-xl space-y-4 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-700">{statsData.in_progress_tasks}</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-600">Em Andamento</h3>
            <p className="text-sm text-slate-500">Sendo executada</p>
          </div>
        </div>

        {/* Completed Card - Larger */}
        <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl space-y-4 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{statsData.completed_tasks}</span>
            </div>
            <div className="pt-6">
              <h3 className="text-xs uppercase tracking-widest text-blue-100">Tarefas Concluídas</h3>
              <p className="text-lg font-medium text-white">{statsData.completion_rate}% de conclusão</p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="bg-white rounded-xl p-8 space-y-6 shadow-sm border border-slate-200">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar tarefas, equipes ou status..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800 placeholder-slate-400 transition-all"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
            <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filters.status === undefined ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => handleStatusFilter(undefined)}
              >
                Todas
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filters.status === 'pendente' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => handleStatusFilter("pendente")}
              >
                Pendente
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filters.status === 'em_andamento' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => handleStatusFilter("em_andamento")}
              >
                Em Andamento
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filters.status === 'concluida' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => handleStatusFilter("concluida")}
              >
                Concluída
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Período
              </button>
              {showDateFilter && (
                <div className="absolute top-full mt-2 right-0 bg-white p-4 rounded-xl shadow-lg border z-50 min-w-[280px]">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Data Início</label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={dateRange.start || ""}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Data Fim</label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={dateRange.end || ""}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={clearDateFilter} className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50">
                        Limpar
                      </Button>
                      <Button size="sm" onClick={handleDateFilter} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 border-none">
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 text-xs font-bold uppercase tracking-widest text-slate-500">
          <div className="col-span-5">Detalhes da Tarefa</div>
          <div className="col-span-2">Responsável</div>
          <div className="col-span-2">Prazo</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {tasksLoading ? (
            <>
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Nenhuma tarefa encontrada.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const status = statusConfig[task.status as TaskStatusPtBr] || {
                label: task.status,
                color: "bg-gray-100 text-gray-700 border-gray-200",
                bgColor: "bg-gray-100",
                textColor: "text-gray-700",
                dotColor: "bg-gray-500",
              }
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 bg-white rounded-xl items-center hover:bg-slate-50 transition-all cursor-pointer border border-slate-100 hover:border-slate-300"
                >
                  <div className="col-span-5 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${status.bgColor} ${status.borderColor}`}>
                      {status.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {task.description}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">
                      {task.assignees?.[0]?.name?.charAt(0) || "U"}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-slate-500 font-medium">
                    {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </div>
                  <div className="col-span-2 flex items-center justify-start">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button className="text-slate-400 hover:text-slate-800 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 font-medium tracking-tight">
              Mostrando {((meta.current_page - 1) * meta.per_page) + 1} a{" "}
              {Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} tarefas
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}