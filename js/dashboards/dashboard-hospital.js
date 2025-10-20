/**
 * ARCHIPELAGO DASHBOARD - DASHBOARD HOSPITALAR V3.3.2 FINAL
 * SEM EMOJIS | LEGENDAS BRANCAS HTML | DATA NOS TÍTULOS | ALTURA FIXA
 */

(function() {
    'use strict';

    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Inicializando...');
    
    if (!window.chartInstances) window.chartInstances = {};

    // ===== FUNÇÃO PRINCIPAL =====
    window.renderizarDashboardHospital = function(hospitalId = 'todos') {
        console.log('[DASHBOARD HOSPITALAR] Renderizando:', hospitalId);

        const container = document.getElementById('dashHospitalarContent');
        if (!container) {
            console.error('[DASHBOARD HOSPITALAR] Container não encontrado!');
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

    window.renderizarDashboard = window.renderizarDashboardHospital;
    window.renderDashboardHospitalar = window.renderizarDashboardHospital;

    // ===== LEGENDA HTML CUSTOMIZADA COM CORES BRANCAS =====
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
            
            item.addEventListener('click', () => {
                const chart = Object.values(window.chartInstances || {}).find(c => 
                    c && c.canvas && c.canvas.id === chartId
                );
                
                if (chart && chart.getDatasetMeta) {
                    const meta = chart.getDatasetMeta(index);
                    if (meta) {
                        const novoEstado = meta.hidden === null ? true : !meta.hidden;
                        meta.hidden = novoEstado;
                        item.style.opacity = novoEstado ? '0.4' : '1';
                        chart.update('active');
                    }
                }
            });
            
            legendContainer.appendChild(item);
        });
        
        chartContainer.parentNode.insertBefore(legendContainer, chartContainer.nextSibling);
        console.log(`Legenda HTML criada para ${chartId}`);
    };

    // ===== DROPDOWN =====
    function renderDropdown(hospitalId) {
        return `
            <div class="dashboard-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: var(--card-bg); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <label for="selectHospital" style="font-weight: 600; color: var(--text-primary);">
                        Selecione o Hospital:
                    </label>
                    <select id="selectHospital" 
                            onchange="window.renderizarDashboardHospital(this.value)"
                            style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 14px; background: var(--input-bg); color: var(--text-primary); cursor: pointer;">
                        <option value="todos" ${hospitalId === 'todos' ? 'selected' : ''}>Todos os Hospitais</option>
                        <option value="H1" ${hospitalId === 'H1' ? 'selected' : ''}>H1 - Neomater</option>
                        <option value="H2" ${hospitalId === 'H2' ? 'selected' : ''}>H2 - Cruz Azul</option>
                        <option value="H3" ${hospitalId === 'H3' ? 'selected' : ''}>H3 - Santa Marcelina</option>
                        <option value="H4" ${hospitalId === 'H4' ? 'selected' : ''}>H4 - Santa Clara</option>
                        <option value="H5" ${hospitalId === 'H5' ? 'selected' : ''}>H5 - Hospital Adventista</option>
                    </select>
                </div>
                <button onclick="toggleDashboardTheme()" 
                        style="padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    Tema Claro
                </button>
            </div>
        `;
    }

    // ===== RENDERIZAR TODOS OS HOSPITAIS =====
    function renderTodosHospitais(dados) {
        let html = '';
        ['H1', 'H2', 'H3', 'H4', 'H5'].forEach(id => {
            const hospital = dados[id];
            if (hospital) {
                html += renderHospitalHTML(id, hospital);
            }
        });
        return html;
    }

    // ===== RENDERIZAR UM HOSPITAL =====
    function renderHospitalHTML(hospitalId, hospital) {
        const leitos = hospital.leitos || [];
        const kpis = calcularKPIs(leitos);
        const nomeHospital = hospital.nome || hospitalId;
        const hoje = new Date().toLocaleDateString('pt-BR');

        return `
            <div class="hospital-card" style="margin-bottom: 30px; padding: 20px; background: var(--card-bg); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: var(--primary-color); margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">
                    ${nomeHospital}
                </h2>

                ${renderKPIsLinha1(kpis)}
                ${renderKPIsLinha2(kpis)}
                ${renderGraficosPlaceholders(hospitalId, hoje)}
            </div>
        `;
    }

    // ===== CALCULAR KPIS =====
    function calcularKPIs(leitos) {
        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado').length;
        const vagos = total - ocupados;
        const taxaOcupacao = total > 0 ? (ocupados / total * 100).toFixed(1) : 0;

        const hoje = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.prevAlta && 
            ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze'].includes(l.prevAlta)
        ).length;

        const apartamentos = leitos.filter(l => 
            l.status === 'ocupado' && 
            (l.categoriaEscolhida === 'Apartamento' || l.categoria === 'Apartamento')
        ).length;

        const enfermarias = leitos.filter(l => 
            l.status === 'ocupado' && 
            (l.categoriaEscolhida === 'Enfermaria' || l.categoria === 'Enfermaria')
        ).length;

        const aptosDisponiveis = leitos.filter(l => 
            l.status === 'vago' && 
            (l.tipo === 'Apartamento' || l.tipo === 'APTO')
        ).length;

        const enfDisponiveis = leitos.filter(l => 
            l.status === 'vago' && 
            (l.tipo === 'Enfermaria' || l.tipo === 'ENFERMARIA')
        ).length;

        const isolamentoResp = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.isolamento === 'Isolamento Respiratório'
        ).length;

        const isolamentoContato = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.isolamento === 'Isolamento de Contato'
        ).length;

        const diretivas = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.diretivas === 'Sim'
        ).length;

        const idades = leitos
            .filter(l => l.status === 'ocupado' && l.idade && l.idade > 0)
            .map(l => parseInt(l.idade));
        const idadeMedia = idades.length > 0 
            ? (idades.reduce((a, b) => a + b, 0) / idades.length).toFixed(1) 
            : 0;

        return {
            total,
            ocupados,
            vagos,
            taxaOcupacao,
            hoje,
            apartamentos,
            enfermarias,
            aptosDisponiveis,
            enfDisponiveis,
            isolamentoResp,
            isolamentoContato,
            diretivas,
            idadeMedia
        };
    }

    // ===== KPIS LINHA 1 =====
    function renderKPIsLinha1(kpis) {
        return `
            <div class="kpis-linha1" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px;">
                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px;">
                    ${renderGaugeSVG(kpis.taxaOcupacao)}
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">Taxa de Ocupação</div>
                </div>

                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Total Leitos</div>
                    <div style="font-size: 36px; font-weight: 700; color: var(--text-primary);">${kpis.total}</div>
                </div>

                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Ocupados</div>
                    <div style="font-size: 36px; font-weight: 700; color: #f59e0b;">${kpis.ocupados}</div>
                </div>

                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Vagos</div>
                    <div style="font-size: 36px; font-weight: 700; color: #10b981;">${kpis.vagos}</div>
                </div>

                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Altas Hoje</div>
                    <div style="font-size: 36px; font-weight: 700; color: #ef4444;">${kpis.hoje}</div>
                </div>
            </div>
        `;
    }

    // ===== KPIS LINHA 2 =====
    function renderKPIsLinha2(kpis) {
        return `
            <div class="kpis-linha2" style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; margin-bottom: 20px;">
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Aptos Ocup</div>
                    <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${kpis.apartamentos}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Enf Ocup</div>
                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">${kpis.enfermarias}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Aptos Disp</div>
                    <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${kpis.aptosDisponiveis}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Enf Disp</div>
                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">${kpis.enfDisponiveis}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Isol Resp</div>
                    <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${kpis.isolamentoResp}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Isol Contato</div>
                    <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${kpis.isolamentoContato}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Diretivas</div>
                    <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${kpis.diretivas}</div>
                </div>

                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">Idade Média</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${kpis.idadeMedia}</div>
                </div>
            </div>
        `;
    }

    // ===== GAUGE SVG =====
    function renderGaugeSVG(porcentagem) {
        porcentagem = Math.max(0, Math.min(100, porcentagem));

        let cor = '#10b981';
        if (porcentagem >= 90) cor = '#ef4444';
        else if (porcentagem >= 70) cor = '#f59e0b';

        const circunferencia = Math.PI * 90;
        const progresso = (porcentagem / 100) * circunferencia;

        return `
            <svg width="120" height="70" viewBox="0 0 120 70" style="display: block; margin: 0 auto;">
                <path 
                    d="M 10 60 A 45 45 0 0 1 110 60" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    stroke-width="12" 
                    stroke-linecap="round"
                />
                <path 
                    d="M 10 60 A 45 45 0 0 1 110 60" 
                    fill="none" 
                    stroke="${cor}" 
                    stroke-width="12" 
                    stroke-linecap="round"
                    stroke-dasharray="${circunferencia}"
                    stroke-dashoffset="${circunferencia - progresso}"
                />
                <text 
                    x="60" 
                    y="55" 
                    text-anchor="middle" 
                    font-size="24" 
                    font-weight="700" 
                    fill="var(--text-primary)"
                >
                    ${porcentagem}%
                </text>
            </svg>
        `;
    }

    // ===== PLACEHOLDERS DOS GRÁFICOS (1 COLUNA, ALTURA FIXA, SEM EMOJIS, COM DATA) =====
    function renderGraficosPlaceholders(hospitalId, hoje) {
        return `
            <div class="graficos-container" style="display: grid; grid-template-columns: 1fr; gap: 30px; margin-top: 20px;">
                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Análise Preditiva de Altas em ${hoje}</h3>
                    <div class="chart-container" style="height: 400px; position: relative;">
                        <canvas id="graficoAltas_${hospitalId}"></canvas>
                    </div>
                </div>

                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Concessões Previstas em ${hoje}</h3>
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
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Pacientes por Região em ${hoje}</h3>
                    <div class="chart-container" style="height: 400px; position: relative;">
                        <canvas id="graficoRegiao_${hospitalId}"></canvas>
                    </div>
                </div>

                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px;">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Distribuição por Tipo em ${hoje}</h3>
                    <div class="chart-container" style="height: 400px; position: relative;">
                        <canvas id="graficoTipo_${hospitalId}"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== RENDERIZAR GRÁFICOS =====
    function renderGraficos(hospitalId, leitos) {
        console.log('[GRÁFICOS] Renderizando para', hospitalId);

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

    // ===== GRÁFICO DE ALTAS (BARRAS VERTICAIS) =====
    function renderGraficoAltas(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoAltas_${hospitalId}`);
        if (!canvas) return;

        const contadores = { 'Hoje Ouro': 0, 'Hoje Prata': 0, 'Hoje Bronze': 0, '24H': 0, '48H': 0, '72H': 0, '96H': 0, 'SP': 0 };

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
                    backgroundColor: ['#fbbf24', '#f59e0b', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'],
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

    // ===== GRÁFICO DE CONCESSÕES (BARRAS VERTICAIS, TOP 10) =====
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
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 12, weight: 600 }
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

    // ===== GRÁFICO DE LINHAS (BARRAS VERTICAIS, TOP 15) =====
    function renderGraficoLinhas(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoLinhas_${hospitalId}`);
        if (!canvas) return;

        const contadores = {};

        leitos.forEach(leito => {
            const linhas = leito.linhas || [];
            if (Array.isArray(linhas)) {
                linhas.forEach(linha => {
                    if (linha && linha.trim()) {
                        const nome = linha.trim();
                        contadores[nome] = (contadores[nome] || 0) + 1;
                    }
                });
            }
        });

        const top15 = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        if (top15.length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const labels = top15.map(t => t[0]);
        const valores = top15.map(t => t[1]);

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
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 12, weight: 600 }
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

    // ===== GRÁFICO DE REGIÃO (PIZZA) =====
    function renderGraficoRegiao(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoRegiao_${hospitalId}`);
        if (!canvas) return;

        const contadores = {};
        leitos.forEach(leito => {
            const regiao = leito.regiao || 'Não informado';
            contadores[regiao] = (contadores[regiao] || 0) + 1;
        });

        if (Object.keys(contadores).length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);

        const coresPadrao = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
        const cores = labels.map((_, i) => coresPadrao[i % coresPadrao.length]);

        const ctx = canvas.getContext('2d');
        const chartKey = `Regiao_${hospitalId}`;

        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores
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

    // ===== GRÁFICO DE TIPO (PIZZA) =====
    function renderGraficoTipo(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoTipo_${hospitalId}`);
        if (!canvas) return;

        const contadores = {
            'Apartamento': 0,
            'Enfermaria': 0,
            'Não informado': 0
        };

        leitos.forEach(leito => {
            const cat = leito.categoriaEscolhida || leito.categoria || 'Não informado';
            if (cat === 'Apartamento') {
                contadores['Apartamento']++;
            } else if (cat === 'Enfermaria') {
                contadores['Enfermaria']++;
            } else {
                contadores['Não informado']++;
            }
        });

        const labels = [];
        const valores = [];
        Object.entries(contadores).forEach(([key, value]) => {
            if (value > 0) {
                labels.push(key);
                valores.push(value);
            }
        });

        if (labels.length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const cores = {
            'Apartamento': '#3b82f6',
            'Enfermaria': '#10b981',
            'Não informado': '#6b7280'
        };
        const coresArray = labels.map(l => cores[l] || '#999999');

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

    // ===== FUNÇÃO TEMA =====
    window.toggleDashboardTheme = function() {
        document.body.classList.toggle('light-theme');
    };

    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Carregado com sucesso!');
})();
