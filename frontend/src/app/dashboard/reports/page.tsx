"use client"

import { useState, useEffect } from "react"
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Loader2,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  BarChart3,
  PieChart
} from "lucide-react"
import { api } from "@/services/api"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ReportsPage() {
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/tasks/stats")
        setStats(response.data)
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
        toast.error("Não foi possível carregar os dados de desempenho.")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleDownload = async (format: "csv" | "pdf") => {
    const isPdf = format === "pdf"
    const setLoader = isPdf ? setIsExportingPdf : setIsExportingCsv
    const endpoint = isPdf ? "/tasks/export/pdf" : "/tasks/export/csv"
    
    setLoader(true)
    try {
      const response = await api.get(endpoint, { responseType: "blob" })
      const contentDisposition = response.headers["content-disposition"]
      let fileName = `relatorio_tarefas_${new Date().getTime()}.${format}`
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1]
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Relatório ${format.toUpperCase()} baixado com sucesso!`)
    } catch (error) {
      console.error(`Erro ao exportar ${format}:`, error)
      toast.error(`Falha ao gerar o arquivo ${format.toUpperCase()}.`)
    } finally {
      setLoader(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 max-w-[1400px] mx-auto px-4 md:px-0">
      {/* Header Executivo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-none">Relatórios de Desempenho</h1>
          <p className="text-slate-500 font-medium max-w-lg">Análise profunda da eficiência operacional e produtividade da plataforma Orchestrator.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-full border-slate-200"
            disabled={isExportingCsv}
            onClick={() => handleDownload("csv")}
          >
            {isExportingCsv ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Dados Brutos
          </Button>
          <Button 
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white"
            disabled={isExportingPdf}
            onClick={() => handleDownload("pdf")}
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Row (Layout Assimétrico) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-l-4 border-l-slate-900 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-slate-400">Taxa de Conclusão</CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl font-black">{stats?.completion_rate}%</CardTitle>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +2.4%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={stats?.completion_rate} className="h-1.5 bg-slate-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-slate-400">Tempo Médio Resolução</CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl font-black">{stats?.avg_resolution_time}h</CardTitle>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-0.5" /> -15%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 italic">Meta: Abaixo de 12h</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-slate-400">Taxa de Sucesso</CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl font-black">{stats?.success_rate}%</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 h-1.5">
              <div className="flex-1 bg-slate-900 rounded-full" />
              <div className="flex-1 bg-slate-900 rounded-full" />
              <div className="flex-1 bg-slate-200 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-600 text-white shadow-lg shadow-rose-200">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-bold tracking-widest text-white/70">Tarefas Críticas</CardDescription>
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl font-black">{String(stats?.critical_tasks).padStart(2, '0')}</CardTitle>
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-rose-100">Ação imediata requerida</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Bar Chart */}
        <Card className="lg:col-span-2 shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Volume de Trabalho Semanal</CardTitle>
              <CardDescription>Concluídas vs Pendentes por dia</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full" />
                <span className="text-xs font-semibold text-slate-500">Concluídas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-200 rounded-full" />
                <span className="text-xs font-semibold text-slate-500">Pendentes</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between px-6 pt-8">
            {stats?.weekly_volume.map((day: any) => (
              <div key={day.day} className="flex flex-col items-center gap-3 w-12 group h-full">
                <div className="flex-1 w-full flex flex-col justify-end bg-slate-50/50 rounded-t-lg group-hover:bg-slate-100/50 transition-colors">
                  <div 
                    className="w-full bg-slate-200 rounded-t-sm" 
                    style={{ height: `${(day.pending / (stats.total_tasks || 1)) * 100}%` }}
                    title={`Pendentes: ${day.pending}`} 
                  />
                  <div 
                    className="w-full bg-slate-900 rounded-b-sm" 
                    style={{ height: `${(day.completed / (stats.total_tasks || 1)) * 300}%` }}
                    title={`Concluídas: ${day.completed}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{day.day}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Distribution Donut (Simulated) */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Distribuição de Status</CardTitle>
            <CardDescription>Foco das atividades atuais</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4">
            <div className="relative w-48 h-48 rounded-full border-[1.2rem] border-slate-50 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[1.2rem] border-slate-900 border-t-transparent border-l-transparent rotate-45" />
              <div className="text-center">
                <span className="text-3xl font-black block">{stats?.total_tasks}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Tasks</span>
              </div>
            </div>
            <div className="w-full mt-10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="font-medium text-slate-600">Concluídas</span>
                </div>
                <span className="font-bold">{stats?.completion_rate}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-medium text-slate-600">Em Andamento</span>
                </div>
                <span className="font-bold">{Math.round((stats?.in_progress_tasks / stats?.total_tasks) * 100) || 0}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="font-medium text-slate-600">Pendentes</span>
                </div>
                <span className="font-bold">{Math.round((stats?.pending_tasks / stats?.total_tasks) * 100) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card className="shadow-sm border-slate-100 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
          <CardTitle className="text-lg font-bold">Desempenho da Equipe</CardTitle>
          <CardDescription>Métricas individuais de produtividade consolidada</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Membro da Equipe</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ativos</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Concluídos</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produtividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.team_performance.map((member: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={`https://avatar.iran.liara.run/username?username=${member.name}`} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-slate-700">{member.active} Tarefas</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-slate-700">{member.completed}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 max-w-[200px]">
                      <Progress value={member.efficiency} className="h-1.5" />
                      <span className="text-xs font-bold text-slate-800">{member.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 bg-slate-50/80 rounded-2xl border border-slate-200 border-dashed">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <TrendingUp className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Análise Preditiva e Histórica</h4>
            <p className="text-sm text-slate-500">Relatórios gerados em tempo real com base na atividade atual do ecossistema.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => handleDownload("pdf")} 
            className="gap-2"
            disabled={isExportingPdf}
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4" />}
            Imprimir Vista
          </Button>
          <Button onClick={() => handleDownload("pdf")} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <FileText className="w-4 h-4" /> Gerar PDF Completo
          </Button>
        </div>
      </div>
    </div>
  )
}
