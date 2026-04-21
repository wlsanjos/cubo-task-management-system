<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Tarefas - Cubo</title>
    <style>
        @page {
            margin: 100px 25px;
        }

        header {
            position: fixed;
            top: -60px;
            left: 0px;
            right: 0px;
            height: 50px;
            text-align: center;
            border-bottom: 2px solid #334155;
            padding-bottom: 10px;
        }

        footer {
            position: fixed;
            bottom: -60px;
            left: 0px;
            right: 0px;
            height: 30px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.5;
        }

        h1 {
            color: #0f172a;
            font-size: 18px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .system-name {
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 1px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th {
            background-color: #334155;
            color: white;
            text-align: left;
            padding: 8px;
            text-transform: uppercase;
            font-size: 10px;
        }

        td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .status {
            font-weight: bold;
            text-transform: capitalize;
        }

        .status-pendente { color: #f59e0b; }
        .status-em_andamento { color: #3b82f6; }
        .status-concluida { color: #10b981; }

        .pagenum:before {
            content: counter(page);
        }
    </style>
</head>
<body>
    <header>
        <span class="system-name">ORCHESTRATOR ENTERPRISE</span>
        <h1>Relatório Geral de Tarefas</h1>
    </header>

    <footer>
        Gerado em {{ $generated_at }} - Página <span class="pagenum"></span>
    </footer>

    <table>
        <thead>
            <tr>
                <th width="5%">ID</th>
                <th width="45%">Título</th>
                <th width="15%">Status</th>
                <th width="15%">Vencimento</th>
                <th width="20%">Criado em</th>
            </tr>
        </thead>
        <tbody>
            @forelse($tasks as $task)
                <tr>
                    <td>{{ $task->id }}</td>
                    <td>{{ $task->title }}</td>
                    <td class="status status-{{ $task->status }}">
                        {{ str_replace('_', ' ', $task->status) }}
                    </td>
                    <td>{{ $task->due_date ? $task->due_date->format('d/m/Y') : '-' }}</td>
                    <td>{{ $task->created_at->format('d/m/Y H:i') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">Nenhuma tarefa encontrada.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
