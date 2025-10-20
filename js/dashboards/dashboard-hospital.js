/**
 * ARCHIPELAGO DASHBOARD - DASHBOARD HOSPITALAR V3.3.2 CORRIGIDO
 * Correcoes: Previsao de Alta completa + Legenda clicavel
 */

(function() {
    'use strict';

    console.log('[DASHBOARD HOSPITALAR V3.3.2 CORRIGIDO] Inicializando...');
    
    if (!window.chartInstances) window.chartInstances = {};

    // FUNCAO PRINCIPAL
    window.renderDashboardHospitalar = function(hospitalId = 'todos') {
        console.log('[DASHBOARD HOSPITALAR] Renderizando:', hospitalId);

        const container = document.getElementById('dashHospitalarContent');
        if (!container) {
            console.error('[DASHBOARD HOSPITALAR] Container nao encontrado!');
            return;
        }

        const dados = window.hospitalData;
        if (!dados) {
            container.innerHTML = '<div class="loading">Carregando dados...</div>';
            return;
        }

        let html = renderDropdown(hospitalId);

        if (hospitalId === 'todos') {
            html += renderTodosHospitais(dados);
        } else {
            const hospital = dados[hospitalId];
            if (hospital) {
                html += renderHospitalHTML(hospitalId, hospital);
            }
        }

        container.innerHTML = html;

        setTimeout(() => {
            if (hospitalId === 'todos') {
                ['H1', 'H2', 'H3', 'H4', 'H5'].forEach(id => {
                    const hospital = dados[id];
                    if (hospital) {
                        renderGraficos(id, hospital.leitos);
                    }
                });
            } else {
                const hospital = dados[hospitalId];
                if (hospital) {
                    renderGraficos(hospitalId, hospital.leitos);
                }
            }
        }, 100);
    };

    window.renderizarDashboardHospital = window.renderDashboardHospitalar;
    window.renderizarDashboard = window.renderDashboardHospitalar;

    // LEGENDA HTML CUSTOMIZADA CLICAVEL
    window.createCustomLegendOutside = function(chartId, datasets) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;
        
        const chartContainer = canvas.closest('.chart-container');
        if (!chartContainer) return;
        
        const existingLegend = chartContainer.parentNode.querySelector('.custom-legend-container');
        if (existingLegend) existingLegend.remove();
        
        const legendContainer = document.createElement('div');
        legendContainer.className = 'custom-legend-container';
        legendContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 10px 15px;
            margin-top: 5px;
            align-items: flex-start;
            background: #1a1f2e;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        datasets.forEach((dataset, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                padding: 2px 0;
                opacity: ${dataset.hidden ? '0.4' : '1'};
                transition: all 0.2s;
            `;
            
            const colorBox = document.createElement('span');
            const bgColor = dataset.backgroundColor || dataset.borderColor || '#666';
            colorBox.style.cssText = `
                width: 12px;
                height: 12px;
                background-color: ${bgColor};
                border-radius: 2px;
                flex-shrink: 0;
                display: inline-block;
            `;
            
            const label = document.createElement('span');
            label.textContent = dataset.label || `Dataset ${index + 1}`;
            label.style.cssText = `
                font-size: 11px;
                color: #ffffff;
                font-weight: 500;
                line-height: 1.2;
            `;
            
            item.appendChild(colorBox);
            item.appendChild(label);
            
            // CLICK PARA MOSTRAR/OCULTAR
            item.addEventListener('click', () => {
                const chart = Object.values(window.chartInstances || {}).find(chartInstance => 
                    chartInstance && chartInstance.canvas && chartInstance.canvas.id === chartId
                );
                
                if (chart && chart.getDatasetMeta) {
                    try {
                        const meta = chart.getDatasetMeta(index);
                        if (meta) {
                            const novoEstado = meta.hidden === null ? true : !meta.hidden;
                            meta.hidden = novoEstado;
                            
                            item.style.opacity = novoEstado ? '0.4' : '1';
                            colorBox.style.opacity = novoEstado ? '0.3' : '1';
                            
                            chart.update('active');
                            
                            console.log(`[LEGENDA] ${dataset.label}: ${novoEstado ? 'OCULTADO' : 'EXIBIDO'}`);
                        }
                    } catch (error) {
                        console.error(`[LEGENDA] Erro ao toggle dataset ${index}:`, error);
                    }
                } else {
                    console.error(`[LEGENDA] Chart nao encontrado para ID: ${chartId}`);
                }
            });
            
            item.addEventListener('mouseenter', () => {
                if (!dataset.hidden) {
                    item.style.transform = 'translateX(2px)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
            });
            
            legendContainer.appendChild(item);
        });
        
        chartContainer.parentNode.insertBefore(legendContainer, chartContainer.nextSibling);
        
        console.log(`[LEGENDA] Criada para ${chartId} com ${datasets.length} itens`);
    };

    // FUNCAO DROPDOWN
    function renderDropdown(hospitalId) {
        const hospitais = window.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };

        let options = '<option value="todos">Todos os Hospitais</option>';
        Object.keys(hospitais).forEach(id => {
            const selected = id === hospitalId ? 'selected' : '';
            options += `<option value="${id}" ${selected}>${hospitais[id].nome}</option>`;
        });

        return `
            <div style="margin-bottom: 20px;">
                <select 
                    id="hospitalSelector" 
                    style="padding: 10px; border-radius: 8px; background: var(--card-bg); color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1);"
                    onchange="window.renderDashboardHospitalar(this.value)"
                >
                    ${options}
                </select>
            </div>
        `;
    }

    // RENDERIZAR TODOS OS HOSPITAIS
    function renderTodosHospitais(dados) {
        let html = '<div style="display: grid; gap: 30px;">';
        ['H1', 'H2', 'H3', 'H4', 'H5'].forEach(id => {
            const hospital = dados[id];
            if (hospital) {
                html += renderHospitalHTML(id, hospital);
            }
        });
        html += '</div>';
        return html;
    }

    // RENDERIZAR HOSPITAL INDIVIDUAL
    function renderHospitalHTML(hospitalId, hospital) {
        const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const leitos = hospital.leitos || [];
        const ocupados = leitos.filter(l => l.status === 'ocupado').length;
        const vagos = leitos.filter(l => l.status === 'vago').length;
        const total = leitos.length;
        const taxaOcupacao = total > 0 ? ((ocupados / total) * 100).toFixed(1) : 0;

        const hoje3 = leitos.filter(l => 
            l.status === 'ocupado' && 
            ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'].includes(l.prevAlta)
        ).length;

        const h24 = leitos.filter(l => 
            l.status === 'ocupado' && 
            ['24h Ouro', '24h 2R', '24h 3R'].includes(l.prevAlta)
        ).length;

        const h48 = leitos.filter(l => 
            l.status === 'ocupado' && l.prevAlta === '48h'
        ).length;

        return `
            <div style="background: var(--card-bg); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <h2 style="font-size: 18px; color: var(--text-primary); margin-bottom: 15px; font-weight: 700;">${hospital.nome}</h2>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Total</div>
                        <div style="font-size: 24px; color: var(--text-primary); font-weight: 700;">${total}</div>
                    </div>
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Ocupados</div>
                        <div style="font-size: 24px; color: #10b981; font-weight: 700;">${ocupados}</div>
                    </div>
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Vagos</div>
                        <div style="font-size: 24px; color: #3b82f6; font-weight: 700;">${vagos}</div>
                    </div>
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Ocupacao</div>
                        <div style="font-size: 24px; color: #f59e0b; font-weight: 700;">${taxaOcupacao}%</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Hoje (Ouro/2R/3R)</div>
                        <div style="font-size: 24px; color: #fbbf24; font-weight: 700;">${hoje3}</div>
                    </div>
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">24h (Ouro/2R/3R)</div>
                        <div style="font-size: 24px; color: #f59e0b; font-weight: 700;">${h24}</div>
                    </div>
                    <div style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">48h</div>
                        <div style="font-size: 24px; color: #f97316; font-weight: 700;">${h48}</div>
                    </div>
                </div>

                <div class="graficos-container" style="display: grid; grid-template-columns: 1fr; gap: 30px; margin-top: 20px;">
                    <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Analise Preditiva de Altas em ${hoje}</h3>
                        <div class="chart-container" style="height: 400px; position: relative;">
                            <canvas id="graficoAltas_${hospitalId}"></canvas>
                        </div>
                    </div>

                    <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Concessoes Previstas em ${hoje}</h3>
                        <div class="chart-container" style="height: 400px; position: relative;">
                            <canvas id="graficoConcessoes_${hospitalId}"></canvas>
                        </div>
                    </div>

                    <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Linhas de Cuidado em ${hoje}</h3>
                        <div class="chart-container" style="height: 500px; position: relative;">
                            <canvas id="graficoLinhas_${hospitalId}"></canvas>
                        </div>
                    </div>

                    <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Pacientes por Regiao em ${hoje}</h3>
                        <div class="chart-container" style="height: 400px; position: relative;">
                            <canvas id="graficoRegiao_${hospitalId}"></canvas>
                        </div>
                    </div>

                    <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                        <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Distribuicao por Tipo em ${hoje}</h3>
                        <div class="chart-container" style="height: 400px; position: relative;">
                            <canvas id="graficoTipo_${hospitalId}"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // RENDERIZAR GRAFICOS
    function renderGraficos(hospitalId, leitos) {
        console.log('[GRAFICOS] Renderizando para', hospitalId);

        const leitosOcupados = leitos.filter(l => l.status === 'ocupado');

        ['Altas', 'Concessoes', 'Linhas', 'Regiao', 'Tipo'].forEach(tipo => {
            const canvasId = `grafico${tipo}_${hospitalId}`;
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const chartKey = `${tipo}_${hospitalId}`;
                if (window.chartInstances[chartKey]) {
                    window.chartInstances[chartKey].destroy();
                    delete window.chartInstances[chartKey];
                }
            }
        });

        if (typeof Chart !== 'undefined') {
            renderGraficoAltas(hospitalId, leitosOcupados);
            renderGraficoConcessoes(hospitalId, leitosOcupados);
            renderGraficoLinhas(hospitalId, leitosOcupados);
            renderGraficoRegiao(hospitalId, leitosOcupados);
            renderGraficoTipo(hospitalId, leitosOcupados);
        }
    }

    // GRAFICO DE ALTAS (BARRAS VERTICAIS) - OPCOES COMPLETAS
    function renderGraficoAltas(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoAltas_${hospitalId}`);
        if (!canvas) return;

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

        leitos.forEach(leito => {
            const prevAlta = leito.prevAlta || 'SP';
            if (contadores.hasOwnProperty(prevAlta)) {
                contadores[prevAlta]++;
            }
        });

        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);

        const ctx = canvas.getContext('2d');
        const chartKey = `Altas_${hospitalId}`;

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
                        title: {
                            display: true,
                            text: 'Pacientes',
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
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

        setTimeout(() => {
            window.createCustomLegendOutside(`graficoAltas_${hospitalId}`, window.chartInstances[chartKey].data.datasets);
        }, 50);
    }

    // GRAFICO DE CONCESSOES (BARRAS VERTICAIS, TOP 10)
    function renderGraficoConcessoes(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoConcessoes_${hospitalId}`);
        if (!canvas) return;

        const contadores = {};

        leitos.forEach(leito => {
            const concessoes = leito.concessoes || [];
            if (Array.isArray(concessoes)) {
                concessoes.forEach(c => {
                    if (c && c.trim()) {
                        const nome = c.trim();
                        contadores[nome] = (contadores[nome] || 0) + 1;
                    }
                });
            }
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
        const chartKey = `Concessoes_${hospitalId}`;

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
                        title: {
                            display: true,
                            text: 'Pacientes',
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
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

        setTimeout(() => {
            window.createCustomLegendOutside(`graficoConcessoes_${hospitalId}`, window.chartInstances[chartKey].data.datasets);
        }, 50);
    }

    // GRAFICO DE LINHAS DE CUIDADO (BARRAS VERTICAIS, TOP 10)
    function renderGraficoLinhas(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoLinhas_${hospitalId}`);
        if (!canvas) return;

        const contadores = {};

        leitos.forEach(leito => {
            const linhas = leito.linhas || [];
            if (Array.isArray(linhas)) {
                linhas.forEach(l => {
                    if (l && l.trim()) {
                        const nome = l.trim();
                        contadores[nome] = (contadores[nome] || 0) + 1;
                    }
                });
            }
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
        const chartKey = `Linhas_${hospitalId}`;

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
                        title: {
                            display: true,
                            text: 'Pacientes',
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
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

        setTimeout(() => {
            window.createCustomLegendOutside(`graficoLinhas_${hospitalId}`, window.chartInstances[chartKey].data.datasets);
        }, 50);
    }

    // GRAFICO DE REGIAO (PIZZA)
    function renderGraficoRegiao(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoRegiao_${hospitalId}`);
        if (!canvas) return;

        const contadores = {};

        leitos.forEach(leito => {
            const regiao = leito.regiao || 'Não informado';
            contadores[regiao] = (contadores[regiao] || 0) + 1;
        });

        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);

        const coresArray = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
            '#6366f1', '#a855f7'
        ];

        const ctx = canvas.getContext('2d');
        const chartKey = `Regiao_${hospitalId}`;

        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: coresArray
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentagem = ((value / total) * 100).toFixed(1);
                            return `${value}\n(${porcentagem}%)`;
                        }
                    }
                }
            },
            plugins: typeof window.ChartDataLabels !== 'undefined' ? [window.ChartDataLabels] : []
        });
    }

    // GRAFICO DE TIPO (PIZZA)
    function renderGraficoTipo(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoTipo_${hospitalId}`);
        if (!canvas) return;

        const contadores = {};

        leitos.forEach(leito => {
            const categoria = leito.categoriaEscolhida || leito.categoria || 'Não informado';
            contadores[categoria] = (contadores[categoria] || 0) + 1;
        });

        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);

        const coresArray = ['#3b82f6', '#10b981', '#f59e0b'];

        const ctx = canvas.getContext('2d');
        const chartKey = `Tipo_${hospitalId}`;

        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: coresArray
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentagem = ((value / total) * 100).toFixed(1);
                            return `${value}\n(${porcentagem}%)`;
                        }
                    }
                }
            },
            plugins: typeof window.ChartDataLabels !== 'undefined' ? [window.ChartDataLabels] : []
        });
    }

    // FUNCAO TEMA
    window.toggleDashboardTheme = function() {
        document.body.classList.toggle('light-theme');
    };

    console.log('[DASHBOARD HOSPITALAR V3.3.2 CORRIGIDO] Carregado com sucesso!');
})();
