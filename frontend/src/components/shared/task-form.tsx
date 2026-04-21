"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask, updateTask, type CreateTaskPayload, type TaskPtBr, STATUS_MAP_REVERSE, type TaskStatusPtBr } from "@/services/task.service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"
import {
  X,
  Calendar,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

import { DatePicker } from "@/components/ui/date-picker"
import { parseISO, format } from "date-fns"

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskPtBr | null
}

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida", label: "Concluída" },
] as const

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const queryClient = useQueryClient()
  
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [status, setStatus] = useState<TaskStatusPtBr>(task?.status || "pendente")
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date + 'T00:00:00') : undefined
  )

  const isEdit = !!task

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-stats"] })
      toast.success("Tarefa criada com sucesso!")
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar tarefa")
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: Partial<CreateTaskPayload> }) =>
      updateTask(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-stats"] })
      toast.success("Tarefa atualizada com sucesso!")
      handleClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar tarefa")
    },
  })

  const handleClose = () => {
    setTitle("")
    setDescription("")
    setStatus("pendente")
    setDueDate(undefined)
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("O título é obrigatório")
      return
    }

    const apiStatus = STATUS_MAP_REVERSE[status as keyof typeof STATUS_MAP_REVERSE]
    const formattedDate = dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined

    if (isEdit && task) {
      updateMutation.mutate({
        id: task.id,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          status: apiStatus,
          due_date: formattedDate || undefined,
        },
      })
    } else {
      createMutation.mutate({
        title: title.trim(),
        description: description.trim() || undefined,
        status: apiStatus,
        due_date: formattedDate || undefined,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(val) => !val ? handleClose() : onOpenChange(val)}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-xl p-0 bg-transparent border-none shadow-none ring-0 focus:outline-none overflow-visible"
      >
        <div className="relative glass-morphism rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
          {/* Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 signature-gradient opacity-80" />

          <button
            onClick={handleClose}
            className="absolute right-8 top-8 w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-all z-10 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          <div className="p-12">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                <Calendar className="w-3 h-3" />
                Gestão Estratégica
              </div>
              <h2 className="display-md text-3xl !text-on-surface tracking-tight font-black">
                {isEdit ? "Refinar Iniciativa" : "Nova Iniciativa"}
              </h2>
              <p className="label-md font-medium mt-3 text-on-surface-variant/70 leading-relaxed max-w-sm">
                Documente os detalhes e prazos para garantir a excelência na execução do seu projeto.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="label-md ml-1">Título do Objetivo</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Defina um título claro e acionável..."
                  disabled={isLoading}
                  className="h-16 bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-base font-bold tracking-tight px-6"
                />
              </div>

              <div className="space-y-3">
                <label className="label-md ml-1">Contexto e Requisitos</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Quais são os critérios de sucesso para esta tarefa?"
                  disabled={isLoading}
                  rows={4}
                  className="bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium resize-none leading-relaxed p-6"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="label-md ml-1">Status da Iniciativa</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatusPtBr)}
                      disabled={isLoading}
                      className="h-16 w-full bg-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold appearance-none px-6 cursor-pointer"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="label-md ml-1">Prazo de Entrega</label>
                  <DatePicker
                    date={dueDate}
                    setDate={setDueDate}
                    placeholder="Agendar para..."
                  />
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 h-16 text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container-low transition-all border-none"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] h-16 signature-gradient text-white font-black rounded-2xl shadow-2xl shadow-primary-container/20 border-none transition-all active:scale-[0.98] hover:brightness-110"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-3" />
                      Processando...
                    </>
                  ) : isEdit ? (
                    "Atualizar Registro"
                  ) : (
                    "Ativar Iniciativa"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}