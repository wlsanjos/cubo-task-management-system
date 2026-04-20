"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getTasks, type TaskPtBr, type TaskFilters, mapTaskFromApi, type TaskStatusPtBr } from "@/services/task.service"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { TaskForm } from "@/components/shared/task-form"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Search, 
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<TaskStatusPtBr, { label: string; dotColor: string }> = {
  pendente: {
    label: "Pendente",
    dotColor: "bg-amber-500",
  },
  em_andamento: {
    label: "Em Andamento",
    dotColor: "bg-blue-500",
  },
  concluida: {
    label: "Concluída",
    dotColor: "bg-emerald-500",
  },
}

function TaskSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-surface-container-low animate-pulse">
      <div className="w-10 h-10 bg-slate-100 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function TasksPage() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: undefined,
    page: 1,
    per_page: 10,
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "list", filters],
    queryFn: () => getTasks(filters),
    staleTime: 30000,
  })

  const tasks = tasksData?.data?.map(mapTaskFromApi) || []
  const meta = tasksData?.meta

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleStatusFilter = (status: TaskStatusPtBr | undefined) => {
    setFilters(prev => ({ ...prev, status, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePerPageChange = (newPerPage: number) => {
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col space-y-2">
          <h1 className="display-md text-on-surface">Minhas Tarefas</h1>
          <p className="text-on-surface-variant max-w-2xl font-medium">
            Gerencie e acompanhe o fluxo de pendências do seu projeto em tempo real com controle total.
          </p>
        </div>
        <Button
          onClick={() => setShowTaskForm(true)}
          className="h-14 px-8 signature-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary-container/20 order-none hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Tarefa</span>
        </Button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-sm border border-surface-container-low flex flex-col xl:flex-row gap-6 justify-between items-center">
         <div className="relative w-full xl:max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
            <input
              placeholder="Pesquisar tarefas..."
              className="w-full pl-12 pr-4 h-12 bg-surface-container-low rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all text-on-surface"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-xl shadow-inner overflow-x-auto">
              <button 
                onClick={() => handleStatusFilter(undefined)}
                className={cn("px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap", filters.status === undefined ? "bg-primary-container text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
              > Todas </button>
              <button 
                onClick={() => handleStatusFilter("pendente")}
                className={cn("px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap", filters.status === 'pendente' ? "bg-tertiary-container text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
              > Pendentes </button>
               <button 
                onClick={() => handleStatusFilter("em_andamento")}
                className={cn("px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap", filters.status === 'em_andamento' ? "bg-primary-container text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
              > Em Foco </button>
               <button 
                onClick={() => handleStatusFilter("concluida")}
                className={cn("px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap", filters.status === 'concluida' ? "bg-emerald-600 text-white shadow-lg" : "text-on-surface-variant hover:text-on-surface")}
              > Concluídas </button>
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 h-12 bg-surface-container-low hover:bg-surface-container-low/80 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all shrink-0 border-none shadow-none"
            >
              <Filter className="w-3.5 h-3.5" />
              Cronograma
            </Button>
          </div>
      </div>

      {showFilters && (
        <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm border border-surface-container-low animate-fade-in-up flex flex-wrap gap-6">
          <div className="w-full md:w-64 space-y-2">
            <label className="label-md">Data de Início</label>
            <DatePicker 
              date={filters.start_date ? new Date(filters.start_date + "T00:00:00") : undefined}
              setDate={(d) => setFilters(prev => ({ ...prev, start_date: d ? format(d, 'yyyy-MM-dd') : undefined, page: 1 }))}
              placeholder="Inicia em..."
            />
          </div>
          <div className="w-full md:w-64 space-y-2">
            <label className="label-md">Data Limite</label>
            <DatePicker 
              date={filters.end_date ? new Date(filters.end_date + "T00:00:00") : undefined}
              setDate={(d) => setFilters(prev => ({ ...prev, end_date: d ? format(d, 'yyyy-MM-dd') : undefined, page: 1 }))}
              placeholder="Termina em..."
            />
          </div>
          <div className="flex items-end underline-offset-4">
             <Button 
                variant="link" 
                className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60"
                onClick={() => setFilters(prev => ({ ...prev, start_date: undefined, end_date: undefined, page: 1 }))}
             >
               Limpar Datas
             </Button>
          </div>
        </div>
      )}

      {/* Full Task Table */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm border border-surface-container-low">
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-6 px-4 pb-4 border-b border-surface-container-low">
            <div className="col-span-12 lg:col-span-5 label-md text-on-surface-variant/70">Detalhes da Tarefa</div>
            <div className="hidden lg:block col-span-2 label-md text-on-surface-variant/70">Responsável</div>
            <div className="hidden lg:block col-span-2 label-md text-on-surface-variant/70">Prazo Final</div>
            <div className="hidden lg:block col-span-2 label-md text-on-surface-variant/70">Status</div>
          </div>

          <div className="space-y-1">
            {tasksLoading ? (
              <>
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </>
            ) : tasks.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mb-4">
                     <Search className="w-8 h-8 text-on-surface-variant/50" />
                   </div>
                   <h3 className="text-on-surface font-bold text-lg">Nenhuma tarefa encontrada</h3>
                   <p className="text-on-surface-variant/70 mt-1 max-w-sm">Ajuste seus filtros ou adicione uma nova tarefa para visualizá-la na lista.</p>
                </div>
            ) : (
              tasks.map((task) => {
                const status = statusConfig[task.status as TaskStatusPtBr]
                return (
                  <div
                    key={task.id}
                    onClick={() => router.push(`/dashboard/task/${task.id}`)}
                    className="grid grid-cols-12 gap-6 px-4 py-4 rounded-xl items-center hover:bg-surface-container-low transition-all cursor-pointer group"
                  >
                    <div className="col-span-12 lg:col-span-5 flex items-center gap-4">
                       <div className={cn("w-2 h-2 rounded-full flex-shrink-0", status?.dotColor || "bg-slate-300")} />
                       <div>
                         <div className="font-semibold text-on-surface text-sm group-hover:text-primary transition-colors">{task.title}</div>
                         <div className="text-[11px] font-medium text-on-surface-variant/60 tracking-tight mt-1 line-clamp-1">{task.description}</div>
                       </div>
                    </div>
                    
                    <div className="hidden lg:flex col-span-2 items-center gap-3">
                       <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center overflow-hidden flex-shrink-0 text-white">
                          <span className="text-[10px] font-bold">
                             {task.assignees?.[0]?.name?.charAt(0) || "U"}
                          </span>
                       </div>
                       <span className="text-sm font-medium text-on-surface truncate">{task.assignees?.[0]?.name || "Usuário"}</span>
                    </div>

                    <div className="hidden lg:block col-span-2 text-sm font-medium text-on-surface-variant">
                       {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'short', year: 'numeric' }) : "---"}
                    </div>

                    <div className="hidden lg:flex col-span-2 items-center">
                       <span className={cn(
                          "px-3 py-1 rounded-[6px] text-[9px] font-extrabold uppercase tracking-widest leading-none block w-fit",
                          task.status === 'concluida' ? "bg-emerald-100/50 text-emerald-700" : 
                          task.status === 'em_andamento' ? "bg-blue-100/50 text-blue-700" : 
                          "bg-surface-container-low text-on-surface-variant"
                       )}>
                          {status?.label || task.status}
                       </span>
                    </div>
                    
                    <div className="col-span-12 lg:col-span-1 flex items-center justify-end w-full">
                       <button className="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-on-surface transition-all rounded-md">
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
        {meta && meta.total > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-surface-container-low mt-8 gap-6">
              <div className="flex items-center gap-6">
                <p className="text-xs text-on-surface-variant font-medium">
                  Mostrando <span className="font-bold text-on-surface">{(meta.current_page - 1) * meta.per_page + 1}</span> a <span className="font-bold text-on-surface">{Math.min(meta.current_page * meta.per_page, meta.total)}</span> de <span className="font-bold text-on-surface">{meta.total}</span> resultados
                </p>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Exibir</span>
                  <select 
                    value={filters.per_page}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                    className="bg-surface-container-low border-none rounded-lg px-2 py-1 text-xs font-bold text-on-surface outline-none cursor-pointer hover:bg-surface-container-high transition-colors"
                  >
                    {[5, 10, 20, 50].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.current_page === 1}
                  onClick={() => handlePageChange(meta.current_page - 1)}
                  className="rounded-xl hover:bg-surface-container-low h-10 px-3 flex items-center gap-2 text-on-surface-variant"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Anterior</span>
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                    .filter(p => {
                      if (meta.last_page <= 5) return true;
                      if (p === 1 || p === meta.last_page) return true;
                      return Math.abs(p - meta.current_page) <= 1;
                    })
                    .map((pageNum, idx, arr) => (
                      <div key={pageNum} className="flex items-center">
                        {idx > 0 && pageNum - arr[idx-1] > 1 && (
                          <span className="px-2 text-on-surface-variant/30 text-xs font-bold">...</span>
                        )}
                        <Button
                          variant={meta.current_page === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={cn(
                            "h-9 w-9 rounded-xl font-black text-xs transition-all",
                            meta.current_page === pageNum 
                              ? "signature-gradient text-white shadow-lg shadow-primary/20 scale-110" 
                              : "hover:bg-surface-container-low text-on-surface-variant/60 hover:text-on-surface"
                          )}
                        >
                          {pageNum}
                        </Button>
                      </div>
                    ))
                  }
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => handlePageChange(meta.current_page + 1)}
                  className="rounded-xl hover:bg-surface-container-low h-10 px-3 flex items-center gap-2 text-on-surface-variant"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
          </div>
        )}
      </div>

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
      />
    </div>
  )
}
