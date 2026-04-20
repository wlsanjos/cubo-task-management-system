"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getComments, createComment, type Comment } from "@/services/task.service"
import { useAuth } from "@/hooks"
import { Button } from "@/components/ui/button"
import { 
  Send,
  Loader2,
  MessageSquare,
  User,
  Paperclip,
  Smile,
  MoreVertical,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CommentSectionProps {
  taskId: number
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(taskId),
    staleTime: 30000,
  })

  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] })
      setNewComment("")
      toast.success("Comentário adicionado!")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao adicionar comentário")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    createMutation.mutate(newComment.trim())
  }

  const isSubmitting = createMutation.isPending
  const totalComments = comments?.length || 0

  return (
    <div className="flex flex-col h-[700px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <MessageSquare className="w-4 h-4" />
          <h3 className="text-xs uppercase tracking-widest font-bold">Atividade & Comentários</h3>
        </div>
        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-slate-500">
          {totalComments} Total
        </span>
      </div>

      {/* Scrollable Comments Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : !comments?.length ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwnComment = user?.email === comment.user.email
            return (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                isOwn={isOwnComment}
              />
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              disabled={isSubmitting}
              rows={2}
              className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm placeholder:text-slate-400/50 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-all rounded-md"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-all rounded-md"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-all rounded-md"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function CommentItem({ comment, isOwn }: { comment: Comment; isOwn: boolean }) {
  const [showFullDate, setShowFullDate] = useState(false)

  const formatDate = (date: string) => {
    const d = new Date(date)
    if (showFullDate) {
      return format(d, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    }
    return format(d, "dd MMM 'às' HH:mm", { locale: ptBR })
  }

  const getTimeAgo = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "agora"
    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return format(d, "dd MMM", { locale: ptBR })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isOwn) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {getInitials(comment.user.name)}
        </div>
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-slate-500">{getTimeAgo(comment.created_at)}</span>
            <span className="text-xs font-bold text-slate-700">Você</span>
          </div>
          <div className="bg-blue-600 text-white p-3 rounded-xl rounded-tr-none text-sm shadow-sm inline-block text-left max-w-[80%]">
            {comment.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold flex-shrink-0">
        <User className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{comment.user.name}</span>
          <span 
            className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-700"
            onClick={() => setShowFullDate(!showFullDate)}
            title={formatDate(comment.created_at)}
          >
            {getTimeAgo(comment.created_at)}
          </span>
        </div>
        <div className="bg-white p-3 rounded-xl rounded-tl-none text-sm text-slate-600 shadow-sm border border-slate-100">
          {comment.content}
        </div>
      </div>
    </div>
  )
}