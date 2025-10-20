/**
 * ARCHIPELAGO DASHBOARD - DASHBOARD HOSPITALAR V3.3.2 FINAL
 * Baseado no arquivo antigo funcional
 * Sem seletor de tipo de grafico (barras verticais padrao)
 * Todas as categorias de previsao de alta
 * Legendas HTML clicaveis
 */

(function() {
    'use strict';

    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Inicializando...');
    
    if (!window.chartInstances) window.chartInstances = {};
    if (!window.graficosState) window.graficosState = {};

    // Cores Pantone para Concessoes
    const CORES_CONCESSOES = {
        'Transicao Domiciliar': '#007A53',
        'Aplicacao domiciliar de medicamentos': '#582C83',
        'Fisioterapia': '#009639',
        'Fonoaudiologia': '#FF671F',
        'Aspiracao': '#2E1A47',
        'Banho': '#8FD3F4',
        'Curativos': '#00BFB3',
        'Oxigenoterapia': '#64A70B',
        'Recarga de O2': '#00AEEF',
        'Orientacao Nutricional - com dispositivo': '#FFC72C',
        'Orientacao Nutricional - sem dispositivo': '#F4E285',
        'Clister': '#E8927C',
        'PICC': '#E03C31',
        'Curativo PICC': '#E03C31'
    };

    // Cores Pantone para Linhas de Cuidado
    const CORES_LINHAS = {
        'Assiste': '#ED0A72',
        'APS': '#007A33',
        'Cuidados Paliativos': '#00B5A2',
        'ICO': '#A6192E',
        'ICO (Insuficiencia Coronariana)': '#A6192E',
        'Oncologia': '#6A1B9A',
        'Pediatria': '#5A646B',
        'Programa Autoimune - Gastroenterologia': '#5C5EBE',
        'Programa Autoimune - Neuro-desmielinizante': '#00AEEF',
        'Programa Autoimune - Neuro-muscular': '#00263A',
        'Programa Autoimune - Reumatologia': '#582D40',
        'Vida Mais Leve Care': '#FFB81C',
        'Cronicos - Cardiologia': '#C8102E',
        'Cronicos - Endocrinologia': '#582C83',
        'Cronicos - Geriatria': '#FF6F1D',
        'Cronicos - Melhor Cuidado': '#556F44',
        'Cronicos - Neurologia': '#0072CE',
        'Cronicos - Pneumologia': '#E35205',
        'Cronicos - Pos-bariatrica': '#003C57',
        'Cronicos - Reumatologia': '#5A0020',
        'Cardiologia': '#C8102E',
        'Cirurgia Geral': '#556F44',
        'Geriatria': '#FF6F1D'
    };

    // Funcao para obter cor exata
    function getCorExata(itemName, tipo = 'concessao') {
        if (!itemName || typeof itemName !== 'string') return '#6b7280';
        
        const paleta = tipo === 'concessao' ? CORES_CONCESSOES : CORES_LINHAS;
        
        let cor = paleta[itemName];
        if (cor) return cor;
        
        const nomeNormalizado = itemName
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[–—]/g, '-')
            .replace(/O₂/g, 'O2')
            .replace(/²/g, '2');
        
        cor = paleta[nomeNormalizado];
        if (cor) return cor;
        
        const nomeSemAcentos = nomeNormalizado
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        
        cor = paleta[nomeSemAcentos];
        if (cor) return cor;
        
        for (const [key, value] of Object.entries(paleta)) {
            const keySemAcentos = key
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            if (keySemAcentos === nomeSemAcentos) return value;
        }
        
        return '#6b7280';
    }

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
            
            // Click para mostrar/ocultar
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
                        }
                    } catch (error) {
                        console.error('[LEGENDA] Erro:', error);
                    }
                }
            });
            
            item.addEventListener('mouseenter', () => {
                if (!dataset.hidden) {
                    item.style.transform = 'translateX(2px)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'none';
            });
            
            legendContainer.appendChild(item);
        });
        
        chartContainer.parentNode.appendChild(legendContainer);
    };

    // FUNCAO PRINCIPAL
    window.renderDashboardHospitalar = function(hospitalId = 'todos') {
        console.log('[DASHBOARD HOSPITALAR] Renderizando:', hospitalId);

        const container = document.getElementById('dashHospitalarContent');
        if (!container) {
            console.error('[DASHBOARD HOSPITALAR] Container nao encontrado');
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
                        renderGraficos(id, hospital);
                    }
                });
            } else {
                const hospital = dados[hospitalId];
                if (hospital) {
                    renderGraficos(hospitalId, hospital);
                }
            }
        }, 100);
    };

    window.renderizarDashboardHospital = window.renderDashboardHospitalar;
    window.renderizarDashboard = window.renderDashboardHospitalar;

    // DROPDOWN
    function renderDropdown(hospitalId) {
        const hospitais = window.CONFIG?.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };

        return `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ffffff; font-weight: 600;">
                    Selecione o Hospital:
                </label>
                <select id="hospitalSelector" onchange="window.renderDashboardHospitalar(this.value)" style="
                    width: 100%;
                    max-width: 400px;
                    padding: 12px;
                    background: #1a1f2e;
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    <option value="todos" ${hospitalId === 'todos' ? 'selected' : ''}>Todos os Hospitais</option>
                    ${Object.entries(hospitais).map(([id, h]) => 
                        `<option value="${id}" ${hospitalId === id ? 'selected' : ''}>${h.nome}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }

    // RENDERIZAR TODOS OS HOSPITAIS
    function renderTodosHospitais(dados) {
        let html = '<div class="hospitais-container">';
        
        ['H1', 'H2', 'H3', 'H4', 'H5'].forEach(id => {
            const hospital = dados[id];
            if (hospital) {
                html += renderHospitalHTML(id, hospital);
            }
        });
        
        html += '</div>';
        return html;
    }

    // RENDERIZAR UM HOSPITAL
    function renderHospitalHTML(hospitalId, hospital) {
        const hospitais = window.CONFIG?.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };

        const nome = hospitais[hospitalId]?.nome || 'Hospital';
        const kpis = calcularKPIs(hospital.leitos);
        const hoje = new Date().toLocaleDateString('pt-BR');

        return `
            <div class="hospital-card" data-hospital="${hospitalId}">
                <div class="hospital-header">
                    <h3 class="hospital-title">${nome}</h3>
                    
                    <div class="kpis-horizontal-container">
                        <div class="kpi-box-inline kpi-gauge-box">
                            <canvas id="gauge_${hospitalId}" width="80" height="40"></canvas>
                            <div class="kpi-value">${kpis.ocupacao}%</div>
                            <div class="kpi-label">OCUPACAO</div>
                        </div>
                        
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.total}</div>
                            <div class="kpi-label">TOTAL</div>
                        </div>
                        
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.ocupados}</div>
                            <div class="kpi-label">OCUPADOS</div>
                        </div>
                        
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.vagos}</div>
                            <div class="kpi-label">VAGOS</div>
                        </div>
                        
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.altas}</div>
                            <div class="kpi-label">EM ALTA</div>
                        </div>
                    </div>
                </div>
                
                <div class="graficos-verticais">
                    <div class="grafico-item">
                        <div class="chart-header">
                            <h4>Analise Preditiva de Altas em ${hoje}</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="graficoAltas_${hospitalId}"></canvas>
                        </div>
                    </div>
                    
                    <div class="grafico-item">
                        <div class="chart-header">
                            <h4>Concessoes por Timeline (Top 10)</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="graficoConcessoes_${hospitalId}"></canvas>
                        </div>
                    </div>
                    
                    <div class="grafico-item">
                        <div class="chart-header">
                            <h4>Linhas de Cuidado por Timeline (Top 15)</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="graficoLinhas_${hospitalId}"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // CALCULAR KPIs
    function calcularKPIs(leitos) {
        if (!Array.isArray(leitos)) return { total: 0, ocupados: 0, vagos: 0, ocupacao: 0, altas: 0 };

        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado').length;
        const vagos = leitos.filter(l => l.status === 'vago').length;
        const ocupacao = total > 0 ? ((ocupados / total) * 100).toFixed(1) : 0;
        
        const altas = leitos.filter(l => {
            if (l.status !== 'ocupado') return false;
            const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
            return prevAlta && prevAlta !== 'SP' && prevAlta !== '';
        }).length;

        return { total, ocupados, vagos, ocupacao, altas };
    }

    // RENDERIZAR TODOS OS GRAFICOS
    function renderGraficos(hospitalId, hospital) {
        renderGaugeHospital(hospitalId, hospital.leitos);
        renderAltasHospital(hospitalId, hospital);
        renderConcessoesHospital(hospitalId, hospital);
        renderLinhasHospital(hospitalId, hospital);
    }

    // GAUGE
    function renderGaugeHospital(hospitalId, leitos) {
        const canvas = document.getElementById(`gauge_${hospitalId}`);
        if (!canvas) return;

        const kpis = calcularKPIs(leitos);
        const porcentagem = parseFloat(kpis.ocupacao) || 0;

        const ctx = canvas.getContext('2d');
        const centerX = 40;
        const centerY = 35;
        const radius = 30;

        ctx.clearRect(0, 0, 80, 40);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 6;
        ctx.stroke();

        const endAngle = Math.PI + (Math.PI * (porcentagem / 100));
        let cor = '#10b981';
        if (porcentagem >= 90) cor = '#ef4444';
        else if (porcentagem >= 75) cor = '#f59e0b';

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${porcentagem}%`, centerX, centerY - 5);
    }

    // GRAFICO DE ALTAS
    function renderAltasHospital(hospitalId, hospital) {
        const canvas = document.getElementById(`graficoAltas_${hospitalId}`);
        if (!canvas) return;

        const chartKey = `Altas_${hospitalId}`;
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
        }

        const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
        
        const dados = {
            'Ouro': [0, 0, 0, 0, 0],
            '2R': [0, 0, 0, 0, 0],
            '3R': [0, 0, 0, 0, 0],
            '48H': [0, 0, 0, 0, 0],
            '72H': [0, 0, 0, 0, 0],
            '96H': [0, 0, 0, 0, 0]
        };
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                
                if (prevAlta) {
                    let index = -1;
                    let tipo = '';
                    
                    if (prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; }
                    else if (prevAlta === 'Hoje 2R' || prevAlta === 'Hoje Prata') { index = 0; tipo = '2R'; }
                    else if (prevAlta === 'Hoje 3R' || prevAlta === 'Hoje Bronze') { index = 0; tipo = '3R'; }
                    else if (prevAlta === '24h Ouro' || prevAlta === '24H Ouro') { index = 1; tipo = 'Ouro'; }
                    else if (prevAlta === '24h 2R' || prevAlta === '24H 2R' || prevAlta === '24H Prata' || prevAlta === '24h Prata') { index = 1; tipo = '2R'; }
                    else if (prevAlta === '24h 3R' || prevAlta === '24H 3R' || prevAlta === '24H Bronze' || prevAlta === '24h Bronze') { index = 1; tipo = '3R'; }
                    else if (prevAlta === '48h' || prevAlta === '48H') { index = 2; tipo = '48H'; }
                    else if (prevAlta === '72h' || prevAlta === '72H') { index = 3; tipo = '72H'; }
                    else if (prevAlta === '96h' || prevAlta === '96H') { index = 4; tipo = '96H'; }
                    
                    if (index >= 0 && tipo && dados[tipo]) {
                        dados[tipo][index]++;
                    }
                }
            }
        });
        
        const todosDados = [...dados['Ouro'], ...dados['2R'], ...dados['3R'], ...dados['48H'], ...dados['72H'], ...dados['96H']];
        const valorMaximo = Math.max(...todosDados, 0);
        const limiteSuperior = valorMaximo + 1;
        
        const datasets = [
            { label: 'Ouro', data: dados['Ouro'], backgroundColor: '#fbbf24', borderWidth: 0 },
            { label: '2R', data: dados['2R'], backgroundColor: '#3b82f6', borderWidth: 0 },
            { label: '3R', data: dados['3R'], backgroundColor: '#8b5cf6', borderWidth: 0 },
            { label: '48H', data: dados['48H'], backgroundColor: '#10b981', borderWidth: 0 },
            { label: '72H', data: dados['72H'], backgroundColor: '#f59e0b', borderWidth: 0 },
            { label: '96H', data: dados['96H'], backgroundColor: '#ef4444', borderWidth: 0 }
        ];
        
        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} beneficiarios`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: '#ffffff',
                            font: { size: 12, weight: 600 },
                            maxRotation: 0
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        max: limiteSuperior,
                        min: 0,
                        title: {
                            display: true,
                            text: 'Beneficiarios',
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
                        ticks: {
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 11 },
                            callback: function(value) {
                                return Number.isInteger(value) && value >= 0 ? value : '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        setTimeout(() => {
            window.createCustomLegendOutside(`graficoAltas_${hospitalId}`, datasets);
        }, 50);
    }

    // GRAFICO DE CONCESSOES
    function renderConcessoesHospital(hospitalId, hospital) {
        const canvas = document.getElementById(`graficoConcessoes_${hospitalId}`);
        if (!canvas) return;

        const chartKey = `Concessoes_${hospitalId}`;
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
        }

        const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
        const concessoesPorTimeline = {};
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                
                if (concessoes && prevAlta) {
                    const concessoesList = Array.isArray(concessoes) ? 
                        concessoes : 
                        String(concessoes).split('|');
                    
                    let timelineIndex = -1;
                    if (prevAlta.includes('Hoje')) timelineIndex = 0;
                    else if (prevAlta.includes('24h') || prevAlta.includes('24H')) timelineIndex = 1;
                    else if (prevAlta === '48h' || prevAlta === '48H') timelineIndex = 2;
                    else if (prevAlta === '72h' || prevAlta === '72H') timelineIndex = 3;
                    else if (prevAlta === '96h' || prevAlta === '96H') timelineIndex = 4;
                    
                    if (timelineIndex >= 0) {
                        concessoesList.forEach(concessao => {
                            if (concessao && concessao.trim()) {
                                const nome = concessao.trim();
                                if (!concessoesPorTimeline[nome]) {
                                    concessoesPorTimeline[nome] = [0, 0, 0, 0, 0];
                                }
                                concessoesPorTimeline[nome][timelineIndex]++;
                            }
                        });
                    }
                }
            }
        });
        
        const concessoesOrdenadas = Object.entries(concessoesPorTimeline)
            .map(([nome, dados]) => [nome, dados, dados.reduce((a, b) => a + b, 0)])
            .sort((a, b) => b[2] - a[2])
            .slice(0, 10);
        
        if (concessoesOrdenadas.length === 0) return;
        
        const datasets = concessoesOrdenadas.map(([nome, dados]) => ({
            label: nome,
            data: dados,
            backgroundColor: getCorExata(nome, 'concessao'),
            borderWidth: 0
        }));
        
        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade',
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
                        ticks: {
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        setTimeout(() => {
            window.createCustomLegendOutside(`graficoConcessoes_${hospitalId}`, datasets);
        }, 50);
    }

    // GRAFICO DE LINHAS DE CUIDADO
    function renderLinhasHospital(hospitalId, hospital) {
        const canvas = document.getElementById(`graficoLinhas_${hospitalId}`);
        if (!canvas) return;

        const chartKey = `Linhas_${hospitalId}`;
        if (window.chartInstances[chartKey]) {
            window.chartInstances[chartKey].destroy();
        }

        const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
        const linhasPorTimeline = {};
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                
                if (linhas && prevAlta) {
                    const linhasList = Array.isArray(linhas) ? 
                        linhas : 
                        String(linhas).split('|');
                    
                    let timelineIndex = -1;
                    if (prevAlta.includes('Hoje')) timelineIndex = 0;
                    else if (prevAlta.includes('24h') || prevAlta.includes('24H')) timelineIndex = 1;
                    else if (prevAlta === '48h' || prevAlta === '48H') timelineIndex = 2;
                    else if (prevAlta === '72h' || prevAlta === '72H') timelineIndex = 3;
                    else if (prevAlta === '96h' || prevAlta === '96H') timelineIndex = 4;
                    
                    if (timelineIndex >= 0) {
                        linhasList.forEach(linha => {
                            if (linha && linha.trim()) {
                                const nome = linha.trim();
                                if (!linhasPorTimeline[nome]) {
                                    linhasPorTimeline[nome] = [0, 0, 0, 0, 0];
                                }
                                linhasPorTimeline[nome][timelineIndex]++;
                            }
                        });
                    }
                }
            }
        });
        
        const linhasOrdenadas = Object.entries(linhasPorTimeline)
            .map(([nome, dados]) => [nome, dados, dados.reduce((a, b) => a + b, 0)])
            .sort((a, b) => b[2] - a[2])
            .slice(0, 15);
        
        if (linhasOrdenadas.length === 0) return;
        
        const datasets = linhasOrdenadas.map(([nome, dados]) => ({
            label: nome,
            data: dados,
            backgroundColor: getCorExata(nome, 'linha'),
            borderWidth: 0
        }));
        
        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade',
                            color: '#ffffff',
                            font: { size: 12, weight: 600 }
                        },
                        ticks: {
                            stepSize: 1,
                            color: '#ffffff',
                            font: { size: 11 }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        setTimeout(() => {
            window.createCustomLegendOutside(`graficoLinhas_${hospitalId}`, datasets);
        }, 50);
    }

    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Carregado com sucesso');
})();
