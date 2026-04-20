"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { 
  getTaskById, 
  deleteTask, 
  mapTaskFromApi, 
  STATUS_MAP_REVERSE,
  updateTask,
  type UpdateTaskPayload,
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  type Attachment
} from "@/services/task.service"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AxiosError } from "axios"
import { 
  ArrowLeft, 
  Calendar, 
  Clock,
  Trash2,
  Settings2,
  Loader2,
  FileText,
  Image as ImageIcon,
  Download,
  Plus,
  ArrowUpRight,
  X,
  AlertCircle,
} from "lucide-react"
import { TaskForm } from "@/components/shared/task-form"
import { CommentSection } from "@/components/shared/comment-section"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida", label: "Concluída" },
]

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const taskId = Number(params.id)
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  // 1. Task Data
  const { data: task, isLoading: isTaskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId).then(mapTaskFromApi),
  })

  // 2. Attachments Data
  const { data: attachments = [], isLoading: isAttachmentsLoading } = useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => getAttachments(taskId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-stats"] })
      toast.success("Iniciativa removida com sucesso.")
      router.push("/dashboard/tasks")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Falha ao remover iniciativa")
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTaskPayload) => updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Evolução registrada.")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao registrar evolução")
    },
  })

  // Attachment Mutations
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(taskId, file, (progress) => setUploadProgress(progress)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] })
      toast.success("Anexo enviado com sucesso.")
      setUploadProgress(null)
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const data = error.response?.data
      toast.error(data?.message || "Falha ao enviar arquivo")
      setUploadProgress(null)
    }
  })

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(taskId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] })
      toast.success("Anexo removido.")
    },
    onError: () => {
      toast.error("Erro ao remover anexo.")
    }
  })

  if (isTaskLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
           <p className="label-md lowercase first-letter:uppercase animate-pulse">Sincronizando dados...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="p-6 bg-surface-container-low rounded-3xl">
           <AlertCircle className="w-12 h-12 text-on-surface-variant/40" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-on-surface">Tarefa não encontrada</h2>
          <p className="text-sm text-on-surface-variant font-medium">O registro solicitado pode ter sido movido ou excluído.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/tasks")} className="signature-gradient text-white px-8 h-12 rounded-xl transition-all active:scale-95">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retornar às Tarefas
        </Button>
      </div>
    )
  }

  const handleStatusChange = (newStatus: string) => {
    const apiStatusValue = STATUS_MAP_REVERSE[newStatus as keyof typeof STATUS_MAP_REVERSE]
    updateMutation.mutate({ status: apiStatusValue })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-primary" />
    return <FileText className="w-5 h-5 text-primary" />
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Frontend Validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG, PDF ou DOCX.")
      return
    }

    if (file.size > maxSize) {
      toast.error("O arquivo excede o limite de 10MB.")
      return
    }

    uploadMutation.mutate(file)
    e.target.value = "" // Reset
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      const blob = await downloadAttachment(taskId, attachment.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", attachment.original_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Erro ao baixar arquivo.")
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".jpg,.jpeg,.png,.pdf,.docx"
      />

      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="space-y-4 max-w-3xl">
          <nav className="flex items-center gap-3 sidebar-label mb-2">
            <button onClick={() => router.push("/dashboard/tasks")} className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Workflow
            </button>
            <span className="opacity-30">/</span>
            <span className="text-on-surface">Registro #{task.id}</span>
          </nav>
          
          <div className="space-y-2">
             <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-primary/10">
                  Alta Prioridade
                </span>
                <span className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-surface-container-low">
                   Sprint Q4
                </span>
             </div>
             <h1 className="display-md text-on-surface lg:text-5xl">{task.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button 
            onClick={() => setShowEditForm(true)}
            className="flex-1 lg:flex-none h-12 bg-surface-container-lowest border border-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-low shadow-sm px-6"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button 
            onClick={() => setShowDeleteAlert(true)}
            className="flex-1 lg:flex-none h-12 bg-red-50/50 text-red-600 font-bold rounded-xl hover:bg-red-50 border border-red-100 shadow-sm px-6"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left/Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Main Info Card */}
          <div className="premium-card !p-10 space-y-12">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pb-10 border-b border-surface-container-low">
               <div className="space-y-3">
                  <p className="label-md">Status Operacional</p>
                  <div className="relative group">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updateMutation.isPending}
                      className="w-full h-11 bg-surface-container-low text-on-surface text-sm font-bold pl-4 pr-10 rounded-xl border-none focus:ring-2 focus:ring-primary/10 cursor-pointer appearance-none transition-all hover:bg-surface-container-low/80"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="label-md">Data de Entrega</p>
                  <div className="flex items-center gap-3 h-11">
                     <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary/60">
                        <Calendar className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-bold text-on-surface">
                        {task.due_date 
                          ? format(new Date(task.due_date), "dd 'de' MMMM", { locale: ptBR })
                          : "Indefinido"}
                     </span>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="label-md">Liderança</p>
                  <div className="flex items-center gap-3 h-11">
                     <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-black shadow-inner">
                        {user?.name?.charAt(0) || "U"}
                     </div>
                     <span className="text-sm font-bold text-on-surface truncate">
                        {user?.name || "Usuário Master"}
                     </span>
                  </div>
               </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h3 className="label-md !text-on-surface font-black">Escopo e Contexto</h3>
               </div>
               <div className="text-on-surface-variant text-[15px] leading-[1.8] font-medium max-w-none">
                  {task.description ? (
                    <div className="whitespace-pre-wrap">{task.description}</div>
                  ) : (
                    <p className="text-on-surface-variant/40 italic font-normal">Nenhum contexto detalhado foi fornecido para esta iniciativa ainda.</p>
                  )}
               </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-6 pt-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="label-md !text-on-surface font-black">Ativos Digitais</h3>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest bg-surface-container-low px-2 py-1 rounded">
                     {isAttachmentsLoading ? "--" : attachments.length} Arquivos
                  </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all border border-transparent hover:border-primary/5 group relative"
                    >
                      <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {getFileIcon(attachment.mime_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">
                          {attachment.original_name}
                        </p>
                        <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">
                          {formatFileSize(attachment.size)} • {format(new Date(attachment.created_at), "dd MMM")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDownload(attachment)}
                          className="p-2 text-on-surface-variant/30 hover:text-primary transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => removeAttachmentMutation.mutate(attachment.id)}
                          disabled={removeAttachmentMutation.isPending}
                          className="p-2 text-on-surface-variant/30 hover:text-red-500 transition-colors"
                          title="Remover"
                        >
                          {removeAttachmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Upload Card */}
                  <div 
                    onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
                    className={cn(
                      "p-4 rounded-2xl bg-surface-container-low/30 border-2 border-dashed flex flex-col gap-4 transition-all overflow-hidden",
                      uploadMutation.isPending 
                        ? "border-primary/40 bg-surface-container-low/50 cursor-wait" 
                        : "border-surface-container-low hover:border-primary/20 hover:bg-surface-container-low/50 cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-sm text-on-surface-variant/40">
                        {uploadMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-on-surface-variant/60">
                          {uploadMutation.isPending ? "Processando Ativo..." : "Upload de Ativo"}
                        </p>
                        {uploadMutation.isPending && uploadProgress !== null && (
                          <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest animate-pulse">
                            {uploadProgress}% Enviado
                          </p>
                        )}
                      </div>
                    </div>

                    {uploadMutation.isPending && uploadProgress !== null && (
                      <div className="px-1 animate-fade-in">
                        <Progress value={uploadProgress} className="h-1.5" />
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Section */}
        <div className="col-span-12 lg:col-span-4 space-y-8 h-full">
           <div className="premium-card !p-0 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-10 border-b border-surface-container-low bg-surface-container-low/10">
                 <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="label-md !text-on-surface font-black">Histórico de Avanços</h3>
                 </div>
                 <p className="text-[11px] font-medium text-on-surface-variant/60">Colaboração em tempo real e log de eventos.</p>
              </div>
              <div className="flex-1 flex flex-col p-8 pt-0">
                <CommentSection taskId={taskId} />
              </div>
           </div>
        </div>
      </div>

      <TaskForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        task={task}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="glass-morphism rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden animate-fade-in-up sm:max-w-md">
          <div className="p-10">
             <div className="mb-8 space-y-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                   <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-extrabold text-on-surface">Excluir Iniciativa?</h3>
                   <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                      Esta ação irá remover todos os registros associados a esta tarefa. Considere apenas arquivar se desejar manter o histórico.
                   </p>
                </div>
             </div>

             <div className="flex gap-4">
                <AlertDialogCancel asChild>
                   <Button variant="ghost" className="flex-1 h-12 font-bold rounded-xl text-on-surface-variant hover:bg-surface-container-low">
                      Preservar
                   </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                   <Button 
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/10 transition-all active:scale-95 border-none"
                   >
                      {deleteMutation.isPending ? "Processando..." : "Confirmar Remoção"}
                   </Button>
                </AlertDialogAction>
             </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}