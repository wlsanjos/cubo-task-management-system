"use client"

import { useState } from "react"
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react"
import { api } from "@/services/api"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleDownload = async (format: "csv" | "pdf") => {
    const isPdf = format === "pdf"
    const setLoader = isPdf ? setIsExportingPdf : setIsExportingCsv
    const endpoint = isPdf ? "/tasks/export/pdf" : "/tasks/export/csv"
    
    setLoader(true)
    
    try {
      const response = await api.get(endpoint, {
        responseType: "blob",
        // Here we could add params if we had a filter UI:
        // params: { status: 'concluida' }
      })

      // Extract filename from header or use default
      const contentDisposition = response.headers["content-disposition"]
      let fileName = `relatorio_tarefas_${new Date().getTime()}.${format}`
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1]
        }
      }

      // Create blob link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Relatório ${format.toUpperCase()} baixado com sucesso!`)
    } catch (error) {
      console.error(`Erro ao exportar ${format}:`, error)
      toast.error(`Falha ao gerar o arquivo ${format.toUpperCase()}. Tente novamente.`)
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Central de Relatórios</h1>
        <p className="text-slate-500 font-medium">Exporte seus dados e estatísticas do Orchestrator Enterprise Suite.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden border-t-4 border-t-emerald-500">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Dados Brutos (CSV)</CardTitle>
            <CardDescription className="text-slate-500">
              Ideal para importar no Excel, Google Sheets ou BI. Inclui todos os metadados das tarefas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                Destaques do formato
              </div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Streaming de alta performance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Compatibilidade universal
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t border-slate-50">
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98]"
              disabled={isExportingCsv || isExportingPdf}
              onClick={() => handleDownload("csv")}
            >
              {isExportingCsv ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Baixar CSV
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* PDF Export Card */}
        <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden border-t-4 border-t-slate-800">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-slate-700" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Relatório Formal (PDF)</CardTitle>
            <CardDescription className="text-slate-500">
              Documento formatado com design profissional, pronto para impressão ou apresentações executivas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                Destaques do formato
              </div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Layout profissional tabular
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Paginação e cabeçalho fixo
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t border-slate-50">
            <Button 
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
              disabled={isExportingPdf || isExportingCsv}
              onClick={() => handleDownload("pdf")}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando documento...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Baixar PDF
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4 mt-12">
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Regras de Exportação</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Os relatórios são gerados em tempo real com base nos dados mais recentes de suas tarefas. 
            Relatórios CSV são processados via streaming para maior eficiência, permitindo a exportação de grandes volumes de dados. 
            O processamento do PDF pode levar alguns segundos dependendo da complexidade do documento.
          </p>
        </div>
      </div>
    </div>
  )
}
