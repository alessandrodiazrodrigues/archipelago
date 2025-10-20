/**
 * ARCHIPELAGO DASHBOARD - DASHBOARD EXECUTIVO V3.3.2 CORRIGIDO
 * Adaptado para 5 hospitais + Tabela WhatsApp + Botao PDF
 * Linhas de Cuidado em 20/10/2025
 */

(function() {
    'use strict';

    console.log('[DASHBOARD EXECUTIVO V3.3.2 CORRIGIDO] Inicializando...');
    
    if (!window.chartInstances) window.chartInstances = {};

    window.renderDashboardExecutivo = function() {
        console.log('[DASHBOARD EXECUTIVO] Renderizando...');

        const container = document.getElementById('dashExecutivoContent');
        if (!container) {
            console.error('[DASHBOARD EXECUTIVO] Container nao encontrado!');
            return;
        }

        const dados = window.hospitalData;
        if (!dados) {
            container.innerHTML = '<div class="loading">Carregando dados...</div>';
            return;
        }

        const hospitaisAtivos = ['H1', 'H2', 'H3', 'H4', 'H5'];
        const kpis = calcularKPIsExecutivos(hospitaisAtivos);
        const hoje = '20/10/2025';

        let html = renderKPIsExecutivo(kpis, hoje);
        html += renderGraficosExecutivo(hospitaisAtivos, hoje);
        html += renderTabelaConsolidada(kpis, hospitaisAtivos, hoje);

        container.innerHTML = html;

        setTimeout(() => {
            renderGraficoAltasExecutivo(hospitaisAtivos);
            renderGraficoConcessoesExecutivo(hospitaisAtivos);
            renderGraficoLinhasExecutivo(hospitaisAtivos);
            renderGraficoOcupacaoHospitais(hospitaisAtivos);
        }, 100);
    };

    window.renderizarDashboardExecutivo = window.renderDashboardExecutivo;

    function renderKPIsExecutivo(kpis, hoje) {
        return `
            <div style="margin-bottom: 30px;">
                <h1 style="font-size: 24px; color: var(--text-primary); margin-bottom: 20px; font-weight: 700;">Dashboard Executivo - Rede Archipelago</h1>
                <p style="font-size: 14px; color: var(--text-secondary);">Dados consolidados dos 5 hospitais em ${hoje}</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Hospitais Ativos</div>
                    <div style="font-size: 32px; color: #3b82f6; font-weight: 700;">${kpis.hospitaisAtivos}</div>
                </div>
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Total de Leitos</div>
                    <div style="font-size: 32px; color: var(--text-primary); font-weight: 700;">${kpis.totalLeitos}</div>
                </div>
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Ocupados</div>
                    <div style="font-size: 32px; color: #10b981; font-weight: 700;">${kpis.leitosOcupados}</div>
                </div>
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Vagos</div>
                    <div style="font-size: 32px; color: #3b82f6; font-weight: 700;">${kpis.leitosVagos}</div>
                </div>
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Taxa Ocupacao</div>
                    <div style="font-size: 32px; color: #f59e0b; font-weight: 700;">${kpis.ocupacaoGeral}%</div>
                </div>
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Altas Hoje</div>
                    <div style="font-size: 32px; color: #fbbf24; font-weight: 700;">${kpis.altasHoje}</div>
                </div>
            </div>
        `;
    }

    function renderGraficosExecutivo(hospitaisAtivos, hoje) {
        return `
            <div style="display: grid; grid-template-columns: 1fr; gap: 30px; margin-bottom: 30px;">
                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px;">
                    <h3 style="font-size: 16px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">Ocupacao por Hospital em ${hoje}</h3>
                    <div class="chart-container" style="height: 400px; position: relative;">
                        <canvas id="graficoOcupacaoHospitais"></canvas>
                    </div>
                </div>

                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px;">
                    <h3 style="font-size: 16px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">Analise Preditiva de Altas Consolidada em ${hoje}</h3>
                    <div class="chart-container" style="height: 450px; position: relative;">
                        <canvas id="graficoAltasExecutivo"></canvas>
                    </div>
                </div>

                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px;">
                    <h3 style="font-size: 16px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">Concessoes Consolidadas em ${hoje}</h3>
                    <div class="chart-container" style="height: 450px; position: relative;">
                        <canvas id="graficoConcessoesExecutivo"></canvas>
                    </div>
                </div>

                <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px;">
                    <h3 style="font-size: 16px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">Linhas de Cuidado Consolidadas em ${hoje}</h3>
                    <div class="chart-container" style="height: 500px; position: relative;">
                        <canvas id="graficoLinhasExecutivo"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTabelaConsolidada(kpis, hospitaisAtivos, hoje) {
        const hospitais = window.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };

        let linhasHospitais = '';
        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            const total = leitos.length;
            const ocupados = leitos.filter(l => l.status === 'ocupado').length;
            const vagos = total - ocupados;
            const apartamentos = leitos.filter(l => 
                l.categoriaEscolhida === 'Apartamento' || 
                l.categoria === 'Apartamento' ||
                (l.tipo && l.tipo.includes('APTO'))
            ).length;
            const enfermarias = leitos.filter(l => 
                l.categoriaEscolhida === 'Enfermaria' || 
                l.categoria === 'Enfermaria' ||
                (l.tipo && l.tipo.includes('ENF'))
            ).length;

            linhasHospitais += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 12px; color: var(--text-primary);">${hospitais[id].nome}</td>
                    <td style="padding: 12px; color: var(--text-primary); text-align: center;">${total}</td>
                    <td style="padding: 12px; color: #10b981; text-align: center; font-weight: 600;">${ocupados}</td>
                    <td style="padding: 12px; color: #3b82f6; text-align: center; font-weight: 600;">${vagos}</td>
                    <td style="padding: 12px; color: var(--text-primary); text-align: center;">${apartamentos}</td>
                    <td style="padding: 12px; color: var(--text-primary); text-align: center;">${enfermarias}</td>
                </tr>
            `;
        });

        const totalApartamentos = hospitaisAtivos.reduce((sum, id) => {
            const hospital = window.hospitalData[id];
            if (!hospital) return sum;
            const leitos = hospital.leitos || [];
            return sum + leitos.filter(l => 
                l.categoriaEscolhida === 'Apartamento' || 
                l.categoria === 'Apartamento' ||
                (l.tipo && l.tipo.includes('APTO'))
            ).length;
        }, 0);

        const totalEnfermarias = hospitaisAtivos.reduce((sum, id) => {
            const hospital = window.hospitalData[id];
            if (!hospital) return sum;
            const leitos = hospital.leitos || [];
            return sum + leitos.filter(l => 
                l.categoriaEscolhida === 'Enfermaria' || 
                l.categoria === 'Enfermaria' ||
                (l.tipo && l.tipo.includes('ENF'))
            ).length;
        }, 0);

        return `
            <div style="background: var(--card-bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                <h3 style="font-size: 16px; color: var(--text-secondary); margin-bottom: 15px; font-weight: 600;">Dados Consolidados - ${hoje}</h3>
                
                <div style="overflow-x: auto;">
                    <table id="tabelaDadosConsolidados" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: rgba(255,255,255,0.05);">
                                <th style="padding: 12px; text-align: left; color: var(--text-secondary); font-weight: 600;">Hospital</th>
                                <th style="padding: 12px; text-align: center; color: var(--text-secondary); font-weight: 600;">Total</th>
                                <th style="padding: 12px; text-align: center; color: var(--text-secondary); font-weight: 600;">Ocupados</th>
                                <th style="padding: 12px; text-align: center; color: var(--text-secondary); font-weight: 600;">Vagos</th>
                                <th style="padding: 12px; text-align: center; color: var(--text-secondary); font-weight: 600;">Apartamentos</th>
                                <th style="padding: 12px; text-align: center; color: var(--text-secondary); font-weight: 600;">Enfermarias</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasHospitais}
                            <tr style="background: rgba(255,255,255,0.05); font-weight: 700;">
                                <td style="padding: 12px; color: var(--text-primary);">TOTAL REDE</td>
                                <td style="padding: 12px; color: var(--text-primary); text-align: center;">${kpis.totalLeitos}</td>
                                <td style="padding: 12px; color: #10b981; text-align: center;">${kpis.leitosOcupados}</td>
                                <td style="padding: 12px; color: #3b82f6; text-align: center;">${kpis.leitosVagos}</td>
                                <td style="padding: 12px; color: var(--text-primary); text-align: center;">${totalApartamentos}</td>
                                <td style="padding: 12px; color: var(--text-primary); text-align: center;">${totalEnfermarias}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <button 
                        onclick="window.copiarDadosWhatsApp()" 
                        style="flex: 1; padding: 12px 24px; background: #25D366; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;"
                    >
                        Copiar para WhatsApp
                    </button>
                    <button 
                        onclick="window.gerarPDFDashboard()" 
                        style="flex: 1; padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;"
                    >
                        Gerar PDF
                    </button>
                </div>
            </div>
        `;
    }

    function calcularKPIsExecutivos(hospitaisAtivos) {
        let totalLeitos = 0;
        let leitosOcupados = 0;
        let altasHoje = 0;

        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            totalLeitos += leitos.length;
            leitosOcupados += leitos.filter(l => l.status === 'ocupado').length;
            
            altasHoje += leitos.filter(l => 
                l.status === 'ocupado' && 
                ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'].includes(l.prevAlta)
            ).length;
        });

        const leitosVagos = totalLeitos - leitosOcupados;
        const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;

        return {
            hospitaisAtivos: hospitaisAtivos.length,
            totalLeitos,
            leitosOcupados,
            leitosVagos,
            ocupacaoGeral,
            altasHoje
        };
    }

    function renderGraficoOcupacaoHospitais(hospitaisAtivos) {
        const canvas = document.getElementById('graficoOcupacaoHospitais');
        if (!canvas) return;

        const chartKey = 'ocupacaoHospitais';
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
            delete window.chartInstances[chartKey];
        }

        const hospitais = window.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };

        const labels = [];
        const ocupados = [];
        const vagos = [];

        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            const total = leitos.length;
            const ocupadosCount = leitos.filter(l => l.status === 'ocupado').length;
            const vagosCount = total - ocupadosCount;

            labels.push(hospitais[id].nome);
            ocupados.push(ocupadosCount);
            vagos.push(vagosCount);
        });

        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ocupados',
                        data: ocupados,
                        backgroundColor: '#10b981'
                    },
                    {
                        label: 'Vagos',
                        data: vagos,
                        backgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#ffffff' }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: '#ffffff',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { 
                            color: '#ffffff',
                            font: { size: 12 }
                        },
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 5,
                            color: '#ffffff',
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            },
            plugins: typeof window.ChartDataLabels !== 'undefined' ? [window.ChartDataLabels] : []
        });
    }

    function renderGraficoAltasExecutivo(hospitaisAtivos) {
        const canvas = document.getElementById('graficoAltasExecutivo');
        if (!canvas) return;

        const chartKey = 'altasExecutivo';
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
            delete window.chartInstances[chartKey];
        }

        const contadores = {
            'Hoje Ouro': 0,
            'Hoje 2R': 0,
            'Hoje 3R': 0,
            '24h Ouro': 0,
            '24h 2R': 0,
            '24h 3R': 0,
            '48h': 0,
            '72h': 0,
            '96h': 0,
            'SP': 0
        };

        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            leitos.forEach(leito => {
                if (leito.status === 'ocupado') {
                    const prevAlta = leito.prevAlta || 'SP';
                    if (contadores.hasOwnProperty(prevAlta)) {
                        contadores[prevAlta]++;
                    }
                }
            });
        });

        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);

        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pacientes',
                    data: valores,
                    backgroundColor: [
                        '#fbbf24', '#f59e0b', '#f97316',
                        '#3b82f6', '#10b981', '#8b5cf6',
                        '#ef4444', '#ec4899', '#6b7280', '#4b5563'
                    ],
                    maxBarThickness: 80
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: '#ffffff',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { 
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
                        grid: { display: false }
                    }
                }
            },
            plugins: typeof window.ChartDataLabels !== 'undefined' ? [window.ChartDataLabels] : []
        });
    }

    function renderGraficoConcessoesExecutivo(hospitaisAtivos) {
        const canvas = document.getElementById('graficoConcessoesExecutivo');
        if (!canvas) return;

        const chartKey = 'concessoesExecutivo';
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
            delete window.chartInstances[chartKey];
        }

        const contadores = {};

        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            leitos.forEach(leito => {
                if (leito.status === 'ocupado') {
                    const concessoes = leito.concessoes || [];
                    if (Array.isArray(concessoes)) {
                        concessoes.forEach(c => {
                            if (c && c.trim()) {
                                const nome = c.trim();
                                contadores[nome] = (contadores[nome] || 0) + 1;
                            }
                        });
                    }
                }
            });
        });

        const top10 = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (top10.length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const labels = top10.map(t => t[0]);
        const valores = top10.map(t => t[1]);

        const cores = labels.map(label => {
            const cor = window.CORES_CONCESSOES?.[label];
            return cor || '#999999';
        });

        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pacientes',
                    data: valores,
                    backgroundColor: cores,
                    maxBarThickness: 80
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: '#ffffff',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { 
                            color: '#ffffff',
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            },
            plugins: typeof window.ChartDataLabels !== 'undefined' ? [window.ChartDataLabels] : []
        });
    }

    function renderGraficoLinhasExecutivo(hospitaisAtivos) {
        const canvas = document.getElementById('graficoLinhasExecutivo');
        if (!canvas) return;

        const chartKey = 'linhasExecutivo';
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
            delete window.chartInstances[chartKey];
        }

        const contadores = {};

        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            leitos.forEach(leito => {
                if (leito.status === 'ocupado') {
                    const linhas = leito.linhas || [];
                    if (Array.isArray(linhas)) {
                        linhas.forEach(l => {
                            if (l && l.trim()) {
                                const nome = l.trim();
                                contadores[nome] = (contadores[nome] || 0) + 1;
                            }
                        });
                    }
                }
            });
        });

        const top10 = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (top10.length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const labels = top10.map(t => t[0]);
        const valores = top10.map(t => t[1]);

        const cores = labels.map(label => {
            const cor = window.CORES_LINHAS?.[label];
            return cor || '#999999';
        });

        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pacientes',
                    data: valores,
                    backgroundColor: cores,
                    maxBarThickness: 80
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: '#ffffff',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { 
                            color: '#ffffff',
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            },
            plugins: typeof window.ChartDataLabels !== 'undefined' ? [window.ChartDataLabels] : []
        });
    }

    window.copiarDadosWhatsApp = function() {
        const hospitais = window.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };

        const hospitaisAtivos = ['H1', 'H2', 'H3', 'H4', 'H5'];
        const kpis = calcularKPIsExecutivos(hospitaisAtivos);
        const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let texto = `ARCHIPELAGO - DASHBOARD EXECUTIVO\nData: ${hoje}\n\n`;
        texto += `REDE CONSOLIDADA\n`;
        texto += `- Total de Leitos: ${kpis.totalLeitos}\n`;
        texto += `- Ocupados: ${kpis.leitosOcupados}\n`;
        texto += `- Vagos: ${kpis.leitosVagos}\n`;
        texto += `- Taxa de Ocupacao: ${kpis.ocupacaoGeral}%\n`;
        texto += `- Altas Hoje: ${kpis.altasHoje}\n\n`;

        texto += `POR HOSPITAL:\n`;
        hospitaisAtivos.forEach(id => {
            const hospital = window.hospitalData[id];
            if (!hospital) return;

            const leitos = hospital.leitos || [];
            const total = leitos.length;
            const ocupados = leitos.filter(l => l.status === 'ocupado').length;
            const vagos = total - ocupados;

            texto += `\n${hospitais[id].nome}:\n`;
            texto += `  - Total: ${total}\n`;
            texto += `  - Ocupados: ${ocupados}\n`;
            texto += `  - Vagos: ${vagos}\n`;
        });

        navigator.clipboard.writeText(texto).then(() => {
            alert('Dados copiados para a area de transferencia!');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            alert('Erro ao copiar dados. Tente novamente.');
        });
    };

    window.gerarPDFDashboard = function() {
        const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        const printContent = document.getElementById('dashExecutivoContent');
        if (!printContent) {
            alert('Erro ao gerar PDF. Conteudo nao encontrado.');
            return;
        }

        const originalTitle = document.title;
        document.title = `Dashboard_Executivo_${hoje.replace(/[/:]/g, '-')}`;

        const printWindow = window.open('', '', 'height=800,width=1200');
        printWindow.document.write('<html><head><title>' + document.title + '</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
        printWindow.document.write('h1, h2, h3 { color: #1a1f2e; }');
        printWindow.document.write('table { border-collapse: collapse; width: 100%; margin: 20px 0; }');
        printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
        printWindow.document.write('th { background-color: #f2f2f2; }');
        printWindow.document.write('button { display: none; }');
        printWindow.document.write('.chart-container { page-break-inside: avoid; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Dashboard Executivo - Rede Archipelago</h1>');
        printWindow.document.write('<p>Gerado em: ' + hoje + '</p>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            document.title = originalTitle;
        }, 500);
    };

    console.log('[DASHBOARD EXECUTIVO V3.3.2 CORRIGIDO] Carregado com sucesso!');
})();
