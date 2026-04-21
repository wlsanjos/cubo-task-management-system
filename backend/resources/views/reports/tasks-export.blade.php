<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>Relatório Mensal de Produtividade - Orchestrator</title>
    <style>
        @page {
            margin: 1cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #0f172a;
            font-size: 10pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }

        /* Utility Classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .uppercase { text-transform: uppercase; }
        .bold { font-weight: bold; }
        .slate { color: #64748b; }
        .dark-blue { color: #0f172a; }

        /* Header Layout (Table for stability in DomPDF) */
        .header-table {
            width: 100%;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .logo-box {
            width: 30%;
        }

        .title-box {
            width: 40%;
            text-align: center;
        }

        .meta-box {
            width: 30%;
            text-align: right;
            font-size: 8pt;
        }

        .system-name {
            font-size: 16pt;
            font-weight: 900;
            letter-spacing: -1px;
            margin: 0;
        }

        .report-title {
            font-size: 11pt;
            font-weight: bold;
            color: #0f172a;
            margin: 5px 0 0 0;
        }

        /* KPI Cards Grid */
        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 35px;
        }

        .kpi-card {
            border: 1px solid #e2e8f0;
            padding: 15px;
            width: 25%;
        }

        .kpi-label {
            font-size: 7pt;
            font-weight: bold;
            color: #64748b;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .kpi-value {
            font-size: 18pt;
            font-weight: 900;
            margin: 0;
        }

        .kpi-subtext {
            font-size: 7pt;
            color: #64748b;
            margin-top: 3px;
        }

        /* Detailed Table */
        .section-header {
            margin-bottom: 15px;
        }

        .section-title {
            font-size: 9pt;
            font-weight: bold;
            letter-spacing: 1.5px;
            color: #0f172a;
            display: inline-block;
            border-left: 3px solid #0f172a;
            padding-left: 10px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            padding: 10px;
            text-align: left;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
        }

        .data-table td {
            padding: 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 8.5pt;
            vertical-align: middle;
        }

        /* Badges */
        .badge {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-pendente { background-color: #fef9c3; color: #854d0e; }
        .badge-em_andamento { background-color: #dbeafe; color: #1e40af; }
        .badge-concluida { background-color: #dcfce7; color: #166534; }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 7pt;
            color: #94a3b8;
        }

        .page-number:before {
            content: "Página " counter(page);
        }

    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td class="logo-box">
                <div class="system-name uppercase">Orchestrator</div>
                <div style="font-size: 7pt; letter-spacing: 2px;" class="slate uppercase">Enterprise Analytics</div>
            </td>
            <td class="title-box">
                <div class="report-title uppercase">Relatório de Produtividade</div>
                <div style="font-size: 8pt;" class="slate">Métricas Consolidadas de Desempenho</div>
            </td>
            <td class="meta-box">
                <div class="bold">Emissão: <span class="slate" style="font-weight: normal;">{{ $generated_at }}</span></div>
                <div class="bold">Responsável: <span class="slate" style="font-weight: normal;">{{ $responsible }}</span></div>
            </td>
        </tr>
    </table>

    <!-- Executive Summary -->
    <div class="section-header">
        <div class="section-title uppercase">Resumo Executivo</div>
    </div>
    <table class="kpi-table">
        <tr>
            <td class="kpi-card" style="border-left: 4px solid #0f172a;">
                <div class="kpi-label uppercase">Total de Tarefas</div>
                <div class="kpi-value">{{ $stats['total_tasks'] }}</div>
                <div class="kpi-subtext">Volume total gerido</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label uppercase">Eficiência Média</div>
                <div class="kpi-value">{{ $stats['completion_rate'] }}%</div>
                <div class="kpi-subtext">Taxa de conclusão geral</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label uppercase">Tempo Médio (Horas)</div>
                <div class="kpi-value">{{ $stats['avg_resolution_time'] }}h</div>
                <div class="kpi-subtext">Ciclo médio de vida</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label uppercase">Taxa de Sucesso</div>
                <div class="kpi-value text-green-600">{{ $stats['success_rate'] }}%</div>
                <div class="kpi-subtext">Conclusão dentro do prazo</div>
            </td>
        </tr>
    </table>

    <!-- Detailed Log -->
    <div class="section-header">
        <div class="section-title uppercase">Log de Atividades Detalhado</div>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="5%">ID</th>
                <th width="40%">Título da Tarefa</th>
                <th width="20%">Responsável</th>
                <th width="20%">Conclusão/Atualização</th>
                <th width="15%" class="text-right">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tasks as $task)
                <tr>
                    <td class="slate">#{{ $task->id }}</td>
                    <td class="bold">{{ $task->title }}</td>
                    <td>{{ $task->user->name ?? 'N/A' }}</td>
                    <td>{{ $task->updated_at->format('d/m/Y H:i') }}</td>
                    <td class="text-right">
                        <span class="badge badge-{{ $task->status }}">
                            {{ str_replace('_', ' ', $task->status) }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <table width="100%">
            <tr>
                <td>{{ strtoupper('Confidencialidade - Uso Restrito TaskOrchestrator Enterprise') }}</td>
                <td class="text-right page-number"></td>
            </tr>
        </table>
    </div>

</body>
</html>
