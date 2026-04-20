"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getTasks, getStats, type TaskPtBr, type TaskStats, type TaskFilters, mapTaskFromApi, type TaskStatusPtBr } from "@/services/task.service"
import { format } from "date-fns"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskForm } from "@/components/shared/task-form"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layout,
  Code2,
  FileText,
  BarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

const statusConfig: Record<TaskStatusPtBr, { label: string; bgColor: string; textColor: string; borderColor: string; icon: React.ReactNode; dotColor: string }> = {
  pendente: {
    label: "Pendente",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
    dotColor: "bg-amber-500",
  },
  em_andamento: {
    label: "Em Andamento",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    dotColor: "bg-blue-500",
  },
  concluida: {
    label: "Concluída",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    dotColor: "bg-emerald-500",
  },
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
  const router = useRouter()
  const { user } = useAuth()
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})
  const [showTaskForm, setShowTaskForm] = useState(false)

  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: undefined,
    start_date: undefined,
    end_date: undefined,
    page: 1,
    per_page: 5,
    sort_by: "created_at",
    order: "desc",
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

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <h1 className="display-md text-on-surface">Dashboard Overview</h1>
        <p className="text-on-surface-variant max-w-2xl font-medium leading-relaxed">
          Gestão centralizada de fluxos de trabalho e métricas de desempenho da equipe em tempo real. Seu workspace está <span className="text-primary font-bold">{statsData.completion_rate || 0}% otimizado</span> hoje.
        </p>
      </div>

      {/* Stats Cards - Premium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-on-surface-variant" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-tight">+12%</span>
          </div>
          <div>
            <p className="label-md mb-2">Total de Tarefas</p>
            <p className="text-4xl font-extrabold text-on-surface tracking-tighter">{statsData.total_tasks}</p>
          </div>
        </div>

        <div className="premium-card bg-[#fff7f5] space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-on-tertiary-container" />
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md tracking-tight">-5%</span>
          </div>
          <div>
            <p className="label-md mb-2 text-tertiary-container/70">Pendentes</p>
            <p className="text-4xl font-extrabold text-[#391303] tracking-tighter">{statsData.pending_tasks}</p>
          </div>
        </div>

        <div className="premium-card bg-[#f2f8ff] space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md tracking-tight">+24%</span>
          </div>
          <div>
            <p className="label-md mb-2 text-blue-800/70">Em Andamento</p>
            <p className="text-4xl font-extrabold text-blue-900 tracking-tighter">{statsData.in_progress_tasks}</p>
          </div>
        </div>

        <div className="premium-card space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md tracking-tight">89%</span>
          </div>
          <div>
            <p className="label-md mb-2">Concluídas</p>
            <p className="text-4xl font-extrabold text-on-surface tracking-tighter">{statsData.completed_tasks}</p>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] p-10 space-y-10 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-surface-container-low pb-6">
          <div className="flex gap-4 bg-surface-container-low p-1.5 rounded-xl shadow-inner">
            <button
              onClick={() => handleStatusFilter(undefined)}
              className={cn("px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", filters.status === undefined ? "bg-primary-container text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
            > Todos </button>
            <button
              onClick={() => handleStatusFilter("pendente")}
              className={cn("px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", filters.status === 'pendente' ? "bg-tertiary-container text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
            > Pendentes </button>
            <button
              onClick={() => handleStatusFilter("em_andamento")}
              className={cn("px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", filters.status === 'em_andamento' ? "bg-primary-container text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
            > Em Foco </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low hover:bg-surface-container-low/80 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              Data
            </button>
            {showDateFilter && (
              <div className="absolute top-full lg:right-0 mt-3 bg-surface-container-lowest p-6 rounded-2xl shadow-2xl border border-surface-container-low z-50 min-w-[320px]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="label-md">Data Início</label>
                    <DatePicker 
                      date={filters.start_date ? new Date(filters.start_date + "T00:00:00") : undefined}
                      setDate={(d) => setFilters(prev => ({ ...prev, start_date: d ? format(d, 'yyyy-MM-dd') : undefined, page: 1 }))}
                      placeholder="De..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-md">Data Fim</label>
                    <DatePicker 
                      date={filters.end_date ? new Date(filters.end_date + "T00:00:00") : undefined}
                      setDate={(d) => setFilters(prev => ({ ...prev, end_date: d ? format(d, 'yyyy-MM-dd') : undefined, page: 1 }))}
                      placeholder="Até..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-surface-container-low pt-6">
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, start_date: undefined, end_date: undefined, page: 1 }))
                        setShowDateFilter(false)
                      }} 
                      className="flex-1 h-12 bg-surface-container-low text-on-surface hover:bg-surface-container-low/80 border-none rounded-xl font-bold shadow-none"
                    >
                      Limpar
                    </Button>
                    <Button 
                      onClick={() => setShowDateFilter(false)} 
                      className="flex-1 h-12 signature-gradient text-white rounded-xl font-bold shadow-md shadow-primary/20 border-none"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Table */}
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-6 px-4 pb-4 border-b border-surface-container-low">
            <div className="col-span-5 label-md text-on-surface-variant/70">Título da Tarefa</div>
            <div className="col-span-3 label-md text-on-surface-variant/70">Responsável</div>
            <div className="col-span-2 label-md text-on-surface-variant/70">Prazo Final</div>
            <div className="col-span-2 label-md text-on-surface-variant/70">Status</div>
          </div>

          <div className="space-y-1">
            {tasksLoading ? (
              [...Array(4)].map((_, i) => <TaskSkeleton key={i} />)
            ) : (
              tasks.map((task) => {
                const status = statusConfig[task.status as TaskStatusPtBr]
                return (
                  <div
                    key={task.id}
                    onClick={() => router.push(`/dashboard/task/${task.id}`)}
                    className="grid grid-cols-12 gap-6 px-4 py-4 rounded-xl items-center hover:bg-surface-container-low transition-all cursor-pointer group"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", status?.dotColor || "bg-slate-300")} />
                      <div className="font-semibold text-on-surface text-sm truncate">{task.title}</div>
                    </div>

                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center overflow-hidden flex-shrink-0 text-white">
                        <span className="text-[10px] font-bold">
                          {task.assignees?.[0]?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-on-surface truncate">{task.assignees?.[0]?.name || "Usuário"}</span>
                    </div>

                    <div className="col-span-2 text-sm font-medium text-on-surface-variant">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'short', year: 'numeric' }) : "---"}
                    </div>

                    <div className="col-span-2 flex items-center justify-between">
                      <span className={cn(
                        "px-3 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-widest leading-none block w-fit",
                        task.status === 'concluida' ? "bg-[#eaf5ef] text-[#2c7a51]" :
                          task.status === 'em_andamento' ? "bg-[#e8effd] text-[#2c5282]" :
                            "bg-[#e1e2e3] text-[#43474e]"
                      )}>
                        {status?.label || task.status}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-on-surface transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-xs text-on-surface-variant font-medium">Exibindo {tasks.length} de {meta?.total || 128} tarefas</p>
          {meta && meta.last_page > 1 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                className="text-on-surface-variant"
              >
                &lt;
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                className="text-on-surface-variant"
              >
                &gt;
              </Button>
            </div>
          )}
        </div>
      </div>

      <TaskForm
        open={showTaskForm || (typeof window !== 'undefined' && window.location.search.includes('create=true'))}
        onOpenChange={(open) => {
          setShowTaskForm(open)
          if (!open && typeof window !== 'undefined' && window.location.search.includes('create=true')) {
            router.push('/dashboard')
          }
        }}
      />
    </div>
  )
}