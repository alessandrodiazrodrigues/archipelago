/**
 * ARCHIPELAGO DASHBOARD - DASHBOARD HOSPITALAR V3.3.2 FINAL
 * 
 * CORREÇÕES APLICADAS:
 * - Animações desativadas (sem loop infinito)
 * - Barras SEMPRE VERTICAIS
 * - KPIs funcionando
 * - Top 10 Concessões, Top 15 Linhas
 * - Gauge com percentual dentro
 * - Números visíveis nas pizzas
 */

(function() {
    'use strict';

    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Inicializando...');

    // ===== FUNÇÃO PRINCIPAL =====
    window.renderizarDashboardHospital = function(hospitalId = 'todos') {
        console.log('[DASHBOARD HOSPITALAR] Renderizando hospital:', hospitalId);

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

        // Renderizar dropdown + botão tema
        let html = renderDropdown(hospitalId);

        // Renderizar hospitais
        if (hospitalId === 'todos') {
            html += renderTodosHospitais(dados);
        } else {
            const hospital = dados[hospitalId];
            if (hospital) {
                html += renderHospitalHTML(hospitalId, hospital);
            }
        }

        container.innerHTML = html;

        // Renderizar gráficos após DOM estar pronto
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

    // Aliases para compatibilidade
    window.renderizarDashboard = window.renderizarDashboardHospital;
    window.renderDashboardHospitalar = window.renderizarDashboardHospital;

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
                        style="padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: opacity 0.2s;"
                        onmouseover="this.style.opacity='0.9'" 
                        onmouseout="this.style.opacity='1'">
                    ☀️ Tema Claro
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

        return `
            <div class="hospital-card" style="margin-bottom: 30px; padding: 20px; background: var(--card-bg); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: var(--primary-color); margin-bottom: 20px; font-size: 24px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">
                    🏥 ${nomeHospital}
                </h2>

                ${renderKPIsLinha1(kpis)}
                ${renderKPIsLinha2(kpis)}
                ${renderGraficosPlaceholders(hospitalId)}
            </div>
        `;
    }

    // ===== CALCULAR KPIS =====
    function calcularKPIs(leitos) {
        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado').length;
        const vagos = total - ocupados;
        const taxaOcupacao = total > 0 ? (ocupados / total * 100).toFixed(1) : 0;

        // Contar altas previstas
        const hoje = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.prevAlta && 
            ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze'].includes(l.prevAlta)
        ).length;

        // Contar por tipo
        const apartamentos = leitos.filter(l => 
            l.status === 'ocupado' && 
            (l.categoriaEscolhida === 'Apartamento' || l.categoria === 'Apartamento')
        ).length;

        const enfermarias = leitos.filter(l => 
            l.status === 'ocupado' && 
            (l.categoriaEscolhida === 'Enfermaria' || l.categoria === 'Enfermaria')
        ).length;

        // Disponíveis
        const aptosDisponiveis = leitos.filter(l => 
            l.status === 'vago' && 
            (l.tipo === 'Apartamento' || l.tipo === 'APTO')
        ).length;

        const enfDisponiveis = leitos.filter(l => 
            l.status === 'vago' && 
            (l.tipo === 'Enfermaria' || l.tipo === 'ENFERMARIA')
        ).length;

        // Isolamento
        const isolamentoResp = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.isolamento === 'Isolamento Respiratório'
        ).length;

        const isolamentoContato = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.isolamento === 'Isolamento de Contato'
        ).length;

        // Diretivas
        const diretivas = leitos.filter(l => 
            l.status === 'ocupado' && 
            l.diretivas === 'Sim'
        ).length;

        // Idade média
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
                <!-- GAUGE -->
                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">Taxa Ocupação</div>
                    ${renderGaugeSVG(parseFloat(kpis.taxaOcupacao))}
                </div>

                <!-- TOTAL -->
                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Total de Leitos</div>
                    <div style="font-size: 32px; font-weight: 700; color: var(--primary-color);">${kpis.total}</div>
                </div>

                <!-- OCUPADOS -->
                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Leitos Ocupados</div>
                    <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${kpis.ocupados}</div>
                </div>

                <!-- VAGOS -->
                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Leitos Vagos</div>
                    <div style="font-size: 32px; font-weight: 700; color: #10b981;">${kpis.vagos}</div>
                </div>

                <!-- EM ALTA -->
                <div class="kpi-card" style="text-align: center; padding: 15px; background: var(--card-bg-secondary); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Em Alta Hoje</div>
                    <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${kpis.hoje}</div>
                </div>
            </div>
        `;
    }

    // ===== KPIS LINHA 2 =====
    function renderKPIsLinha2(kpis) {
        return `
            <div class="kpis-linha2" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 15px; margin-bottom: 20px;">
                <!-- APARTAMENTOS -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Apartamentos</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${kpis.apartamentos}</div>
                    <div style="font-size: 10px; color: var(--text-secondary); margin-top: 3px;">${kpis.aptosDisponiveis} disp.</div>
                </div>

                <!-- ENFERMARIAS -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Enfermarias</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${kpis.enfermarias}</div>
                    <div style="font-size: 10px; color: var(--text-secondary); margin-top: 3px;">${kpis.enfDisponiveis} disp.</div>
                </div>

                <!-- DISPONÍVEIS -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Disponíveis</div>
                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">${kpis.aptosDisponiveis + kpis.enfDisponiveis}</div>
                </div>

                <!-- ISO RESPIRATÓRIO -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Iso. Resp.</div>
                    <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${kpis.isolamentoResp}</div>
                </div>

                <!-- ISO CONTATO -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Iso. Contato</div>
                    <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${kpis.isolamentoContato}</div>
                </div>

                <!-- DIRETIVAS -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Diretivas</div>
                    <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${kpis.diretivas}</div>
                </div>

                <!-- IDADE MÉDIA -->
                <div class="kpi-mini" style="text-align: center; padding: 12px; background: var(--card-bg-secondary); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 600;">Idade Média</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${kpis.idadeMedia}</div>
                    <div style="font-size: 10px; color: var(--text-secondary); margin-top: 3px;">anos</div>
                </div>
            </div>
        `;
    }

    // ===== GAUGE SVG =====
    function renderGaugeSVG(porcentagem) {
        // Limitar entre 0-100
        porcentagem = Math.max(0, Math.min(100, porcentagem));

        // Cores baseadas na porcentagem
        let cor = '#10b981'; // Verde
        if (porcentagem >= 90) cor = '#ef4444'; // Vermelho
        else if (porcentagem >= 70) cor = '#f59e0b'; // Amarelo

        // Cálculo para meia-rosca (180°)
        const circunferencia = Math.PI * 90; // Meia circunferência (raio 45)
        const progresso = (porcentagem / 100) * circunferencia;

        return `
            <svg width="120" height="70" viewBox="0 0 120 70" style="display: block; margin: 0 auto;">
                <!-- Fundo cinza (meia-rosca) -->
                <path 
                    d="M 10 60 A 45 45 0 0 1 110 60" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    stroke-width="12" 
                    stroke-linecap="round"
                />
                
                <!-- Progresso colorido -->
                <path 
                    d="M 10 60 A 45 45 0 0 1 110 60" 
                    fill="none" 
                    stroke="${cor}" 
                    stroke-width="12" 
                    stroke-linecap="round"
                    stroke-dasharray="${circunferencia}"
                    stroke-dashoffset="${circunferencia - progresso}"
                    style="transition: stroke-dashoffset 0.3s ease;"
                />
                
                <!-- PERCENTUAL DENTRO -->
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

    // ===== PLACEHOLDERS DOS GRÁFICOS =====
    function renderGraficosPlaceholders(hospitalId) {
        return `
            <div class="graficos-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px;">
                <!-- Linha 1 -->
                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">📊 Análise Preditiva de Altas</h3>
                    <canvas id="graficoAltas_${hospitalId}" width="400" height="250"></canvas>
                </div>

                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">🏥 Concessões de Alta (Top 10)</h3>
                    <canvas id="graficoConcessoes_${hospitalId}" width="400" height="250"></canvas>
                </div>

                <!-- Linha 2 -->
                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">🩺 Linhas de Cuidado (Top 15)</h3>
                    <canvas id="graficoLinhas_${hospitalId}" width="400" height="250"></canvas>
                </div>

                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">📍 Pacientes por Região</h3>
                    <canvas id="graficoRegiao_${hospitalId}" width="400" height="250"></canvas>
                </div>

                <!-- Linha 3 (span 2) -->
                <div class="grafico-box" style="background: var(--card-bg-secondary); padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); grid-column: span 2;">
                    <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">🏠 Tipo de Ocupação</h3>
                    <canvas id="graficoTipo_${hospitalId}" width="800" height="250"></canvas>
                </div>
            </div>
        `;
    }

    // ===== RENDERIZAR GRÁFICOS =====
    function renderGraficos(hospitalId, leitos) {
        console.log('[GRÁFICOS] Renderizando para', hospitalId, 'com', leitos.length, 'leitos');

        const leitosOcupados = leitos.filter(l => l.status === 'ocupado');

        // Destruir gráficos antigos se existirem
        ['Altas', 'Concessoes', 'Linhas', 'Regiao', 'Tipo'].forEach(tipo => {
            const canvasId = `grafico${tipo}_${hospitalId}`;
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const chartInstance = Chart.getChart(canvas);
                if (chartInstance) {
                    chartInstance.destroy();
                }
            }
        });

        // Renderizar cada gráfico
        renderGraficoAltas(hospitalId, leitosOcupados);
        renderGraficoConcessoes(hospitalId, leitosOcupados);
        renderGraficoLinhas(hospitalId, leitosOcupados);
        renderGraficoRegiao(hospitalId, leitosOcupados);
        renderGraficoTipo(hospitalId, leitosOcupados);
    }

    // ===== GRÁFICO DE ALTAS =====
    function renderGraficoAltas(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoAltas_${hospitalId}`);
        if (!canvas) return;

        // Ordem fixa conforme manual
        const ordemFixa = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze', '24H', '48H', '72H', '96H', 'SP'];
        const contadores = {};
        ordemFixa.forEach(k => contadores[k] = 0);

        // Contar
        leitos.forEach(leito => {
            const prev = leito.prevAlta;
            if (prev && contadores.hasOwnProperty(prev)) {
                contadores[prev]++;
            }
        });

        // Preparar dados
        const labels = [];
        const valores = [];
        ordemFixa.forEach(key => {
            labels.push(key);
            valores.push(contadores[key]);
        });

        // Cores fixas
        const coresFixas = {
            'Hoje Ouro': '#FFD700',
            'Hoje Prata': '#C0C0C0',
            'Hoje Bronze': '#CD7F32',
            '24H': '#3b82f6',
            '48H': '#10b981',
            '72H': '#f59e0b',
            '96H': '#ef4444',
            'SP': '#8b5cf6'
        };
        const cores = labels.map(l => coresFixas[l] || '#999999');

        new Chart(canvas, {
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
                animation: false, // ✅ DESATIVAR ANIMAÇÃO
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: 'var(--text-primary)',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: 'var(--text-secondary)'
                        },
                        grid: { color: 'var(--border-color)' }
                    },
                    x: {
                        ticks: { color: 'var(--text-secondary)' },
                        grid: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // ===== GRÁFICO DE CONCESSÕES =====
    function renderGraficoConcessoes(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoConcessoes_${hospitalId}`);
        if (!canvas) return;

        // Contar concessões
        const contadores = {};
        leitos.forEach(leito => {
            if (leito.concessoes && Array.isArray(leito.concessoes)) {
                leito.concessoes.forEach(c => {
                    contadores[c] = (contadores[c] || 0) + 1;
                });
            }
        });

        // Top 10
        const top10 = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (top10.length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const labels = top10.map(t => t[0]);
        const valores = top10.map(t => t[1]);

        // Buscar cores do api.js
        const cores = labels.map(label => {
            const cor = window.CORES_CONCESSOES?.[label];
            if (!cor) console.warn('[CORES] Não encontrada:', label);
            return cor || '#999999';
        });

        new Chart(canvas, {
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
                animation: false, // ✅ DESATIVAR ANIMAÇÃO
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: 'var(--text-primary)',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: 'var(--text-secondary)'
                        },
                        grid: { color: 'var(--border-color)' }
                    },
                    x: {
                        ticks: { 
                            color: 'var(--text-secondary)',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // ===== GRÁFICO DE LINHAS =====
    function renderGraficoLinhas(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoLinhas_${hospitalId}`);
        if (!canvas) return;

        // Contar linhas
        const contadores = {};
        leitos.forEach(leito => {
            if (leito.linhas && Array.isArray(leito.linhas)) {
                leito.linhas.forEach(l => {
                    contadores[l] = (contadores[l] || 0) + 1;
                });
            }
        });

        // Top 15
        const top15 = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        if (top15.length === 0) {
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Sem dados</p>';
            return;
        }

        const labels = top15.map(t => t[0]);
        const valores = top15.map(t => t[1]);

        // Buscar cores
        const cores = labels.map(label => {
            const cor = window.CORES_LINHAS?.[label];
            if (!cor) console.warn('[CORES] Não encontrada:', label);
            return cor || '#999999';
        });

        new Chart(canvas, {
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
                animation: false, // ✅ DESATIVAR ANIMAÇÃO
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: 'var(--text-primary)',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value > 0 ? value : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1,
                            color: 'var(--text-secondary)'
                        },
                        grid: { color: 'var(--border-color)' }
                    },
                    x: {
                        ticks: { 
                            color: 'var(--text-secondary)',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // ===== GRÁFICO DE REGIÃO (PIZZA) =====
    function renderGraficoRegiao(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoRegiao_${hospitalId}`);
        if (!canvas) return;

        // Contar regiões
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

        // Cores variadas para regiões
        const coresPadrao = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
        const cores = labels.map((_, i) => coresPadrao[i % coresPadrao.length]);

        new Chart(canvas, {
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
                animation: false, // ✅ DESATIVAR ANIMAÇÃO
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'var(--text-primary)' }
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
            plugins: [ChartDataLabels]
        });
    }

    // ===== GRÁFICO DE TIPO (PIZZA) =====
    function renderGraficoTipo(hospitalId, leitos) {
        const canvas = document.getElementById(`graficoTipo_${hospitalId}`);
        if (!canvas) return;

        // Contar por tipo
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

        // Remover zeros
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

        new Chart(canvas, {
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
                animation: false, // ✅ DESATIVAR ANIMAÇÃO
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'var(--text-primary)' }
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
            plugins: [ChartDataLabels]
        });
    }

    // ===== FUNÇÃO TEMA =====
    window.toggleDashboardTheme = function() {
        document.body.classList.toggle('light-theme');
    };

    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] ✅ Carregado com sucesso!');
})();
