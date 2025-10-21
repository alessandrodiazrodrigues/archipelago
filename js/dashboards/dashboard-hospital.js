// =================== DASHBOARD HOSPITALAR V3.3 FINAL ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3 FINAL - 5 HOSPITAIS - COM CRIAÇÃO DINÂMICA DE HTML
// 
// CHANGELOG V3.1 → V3.3:
// ✅ Adicionado H5 (Hospital Adventista - 13 leitos)
// ✅ Total: 79 leitos (H1:10, H2:36, H3:7, H4:13, H5:13)
// ✅ CRIA TODA A ESTRUTURA HTML DINAMICAMENTE
// ✅ Regras de gráficos conforme manual completo
// ✅ Legendas HTML verticais com toggle
// ✅ SP não entra nos gráficos
// ✅ Eixo Y sempre +1 do máximo
// ✅ Hoje e 24h empilhados (Ouro/2R/3R)
// ✅ 48h, 72h, 96h cor única
// ✅ Concessões e linhas: múltiplas barras por período
// ✅ 56 cores Pantone (11 concessões + 45 linhas)
// ✅ Mobile responsivo
// ✅ NOME DA FUNÇÃO CORRETO: renderDashboardHospitalar
// ==========================================================================

// Estado global
window.fundoBranco = false;

// Configuração dos hospitais
const HOSPITAIS_CONFIG = {
    H1: { nome: 'Neomater', leitos: 10 },
    H2: { nome: 'Cruz Azul', leitos: 36 },
    H3: { nome: 'Santa Marcelina', leitos: 7 },
    H4: { nome: 'Santa Clara', leitos: 13 },
    H5: { nome: 'Hospital Adventista', leitos: 13 }
};

// =================== CORES PANTONE V3.3 ===================
// Cores para Análise Preditiva de Altas
const CORES_TIMELINE = {
    'Ouro': '#FFD700',
    '2R': '#FFA500',
    '3R': '#DC143C',
    'Padrão': '#3b82f6'
};

// Função para obter cor de concessão (usa window.CORES_CONCESSOES do api.js)
function getCorConcessao(nome) {
    if (!window.CORES_CONCESSOES) {
        console.warn('⚠️ [DASHBOARD] window.CORES_CONCESSOES não encontrado!');
        return '#999999';
    }
    return window.CORES_CONCESSOES[nome] || '#999999';
}

// Função para obter cor de linha de cuidado (usa window.CORES_LINHAS do api.js)
function getCorLinha(nome) {
    if (!window.CORES_LINHAS) {
        console.warn('⚠️ [DASHBOARD] window.CORES_LINHAS não encontrado!');
        return '#999999';
    }
    return window.CORES_LINHAS[nome] || '#999999';
}

// =================== DETECTAR MOBILE ===================
function isMobile() {
    return window.innerWidth <= 768;
}

// =================== CRIAR ESTRUTURA HTML DO HOSPITAL ===================
function criarHTMLHospital(hospitalId) {
    const config = HOSPITAIS_CONFIG[hospitalId];
    if (!config) {
        console.error(`❌ [HTML] Hospital ${hospitalId} não encontrado na configuração`);
        return null;
    }
    
    console.log(`🏗️ [HTML] Criando estrutura para ${hospitalId} - ${config.nome}`);
    
    const section = document.createElement('section');
    section.id = `hospital-${hospitalId}`;
    section.className = 'hospital-section';
    section.style.cssText = 'margin-bottom: 60px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px;';
    
    section.innerHTML = `
        <h2 style="color: #60a5fa; margin-bottom: 30px; font-size: 28px; font-weight: 700;">
            ${hospitalId} - ${config.nome}
        </h2>
        
        <!-- KPIs Grid -->
        <div class="kpis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
            
            <!-- Donut Ocupação -->
            <div class="kpi-card" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center;">
                <h3 style="color: #9ca3af; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">Ocupação</h3>
                <div class="donut-container" style="position: relative; margin: 0 auto; width: 160px; height: 160px;">
                    <canvas id="donutOcupacao${hospitalId}" width="160" height="160"></canvas>
                    <p id="donutText${hospitalId}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; font-weight: 700; color: #60a5fa; margin: 0;">
                        0/${config.leitos}
                    </p>
                </div>
            </div>
            
            <!-- Total -->
            <div class="kpi-card" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center;">
                <h3 style="color: #9ca3af; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">Total de Leitos</h3>
                <p id="kpiTotal${hospitalId}" style="font-size: 48px; font-weight: 700; color: #60a5fa; margin: 0;">
                    ${config.leitos}
                </p>
            </div>
            
            <!-- Disponíveis -->
            <div class="kpi-card" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center;">
                <h3 style="color: #9ca3af; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">Disponíveis</h3>
                <p id="kpiDisponiveis${hospitalId}" style="font-size: 48px; font-weight: 700; color: #10b981; margin: 0;">
                    0
                </p>
            </div>
            
            <!-- Alta Hoje -->
            <div class="kpi-card" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center;">
                <h3 style="color: #9ca3af; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">Com Alta Hoje</h3>
                <p id="kpiAltaHoje${hospitalId}" style="font-size: 48px; font-weight: 700; color: #f59e0b; margin: 0;">
                    0
                </p>
            </div>
        </div>
        
        <!-- Gráfico Altas -->
        <div class="chart-container" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; margin-bottom: 30px;">
            <h3 class="chart-title" style="color: #e2e8f0; font-size: 18px; font-weight: 600; margin-bottom: 20px;">
                Análise Preditiva de Altas
            </h3>
            <canvas id="chartAltas${hospitalId}" style="max-height: 400px;"></canvas>
        </div>
        
        <!-- Gráfico Concessões -->
        <div class="chart-container" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; margin-bottom: 30px;">
            <h3 class="chart-title" style="color: #e2e8f0; font-size: 18px; font-weight: 600; margin-bottom: 20px;">
                Concessões Previstas
            </h3>
            <canvas id="chartConcessoes${hospitalId}" style="max-height: 400px;"></canvas>
        </div>
        
        <!-- Gráfico Linhas -->
        <div class="chart-container" style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; margin-bottom: 30px;">
            <h3 class="chart-title" style="color: #e2e8f0; font-size: 18px; font-weight: 600; margin-bottom: 20px;">
                Linhas de Cuidado Previstas
            </h3>
            <canvas id="chartLinhas${hospitalId}" style="max-height: 400px;"></canvas>
        </div>
    `;
    
    return section;
}

// =================== CRIAR LEGENDAS HTML CUSTOMIZADAS ===================
window.createCustomLegendOutside = function(chartId, datasets) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        console.warn(`⚠️ [LEGENDA] Canvas ${chartId} não encontrado`);
        return;
    }
    
    // Procurar container pai
    const chartContainer = canvas.closest('.chart-container');
    if (!chartContainer) {
        console.warn(`⚠️ [LEGENDA] Container pai não encontrado para ${chartId}`);
        return;
    }
    
    // Remover legenda antiga se existir
    let legendDiv = chartContainer.querySelector('.custom-legend');
    if (legendDiv) {
        legendDiv.remove();
    }
    
    // Criar nova legenda
    legendDiv = document.createElement('div');
    legendDiv.className = 'custom-legend';
    legendDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 16px;
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        margin-top: 16px;
    `;
    
    // Criar items da legenda (VERTICAL - um por linha)
    datasets.forEach((dataset, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.index = index;
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: opacity 0.3s;
            padding: 4px 8px;
            border-radius: 4px;
        `;
        
        // Quadrado de cor
        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 4px;
            background-color: ${dataset.backgroundColor || dataset.borderColor || '#999'};
            flex-shrink: 0;
        `;
        
        // Label
        const label = document.createElement('span');
        label.className = 'legend-label';
        label.style.cssText = `
            font-size: 14px;
            color: #e2e8f0;
            user-select: none;
        `;
        label.textContent = dataset.label || `Dataset ${index + 1}`;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        
        // Toggle ao clicar
        item.addEventListener('click', function() {
            const chart = Chart.getChart(chartId);
            if (!chart) {
                console.warn(`⚠️ [LEGENDA] Gráfico ${chartId} não encontrado`);
                return;
            }
            
            const datasetIndex = parseInt(this.dataset.index);
            const meta = chart.getDatasetMeta(datasetIndex);
            
            // Toggle visibilidade
            meta.hidden = meta.hidden === null ? !chart.data.datasets[datasetIndex].hidden : !meta.hidden;
            
            // Atualizar estilo do item
            if (meta.hidden) {
                this.style.opacity = '0.3';
            } else {
                this.style.opacity = '1';
            }
            
            // Atualizar gráfico
            chart.update('active');
        });
        
        legendDiv.appendChild(item);
    });
    
    // Inserir legenda após o canvas
    chartContainer.appendChild(legendDiv);
    
    console.log(`✅ [LEGENDA] Legenda criada para ${chartId} com ${datasets.length} itens`);
};

// =================== PROCESSAR DADOS DE ALTAS ===================
function processarAltas(leitos) {
    const contadores = {
        'Hoje': { Ouro: 0, '2R': 0, '3R': 0 },
        '24H': { Ouro: 0, '2R': 0, '3R': 0 },
        '48H': { total: 0 },
        '72H': { total: 0 },
        '96H': { total: 0 }
    };
    
    leitos.forEach(leito => {
        const prevAlta = leito.prevAlta || '';
        
        // Ignorar "SP" (Sem Previsão)
        if (prevAlta === 'SP') return;
        
        // HOJE
        if (prevAlta.includes('Hoje')) {
            if (prevAlta.includes('Ouro')) contadores['Hoje'].Ouro++;
            else if (prevAlta.includes('Prata') || prevAlta.includes('2R')) contadores['Hoje']['2R']++;
            else if (prevAlta.includes('Bronze') || prevAlta.includes('3R')) contadores['Hoje']['3R']++;
        }
        // 24H
        else if (prevAlta === '24H') {
            contadores['24H']['2R']++; // 24H é sempre 2R
        }
        // 48H, 72H, 96H
        else if (prevAlta === '48H') {
            contadores['48H'].total++;
        }
        else if (prevAlta === '72H') {
            contadores['72H'].total++;
        }
        else if (prevAlta === '96H') {
            contadores['96H'].total++;
        }
    });
    
    return contadores;
}

// =================== PROCESSAR CONCESSÕES ===================
function processarConcessoes(leitos) {
    const concessoesPorPeriodo = {
        'Hoje': {},
        '24H': {},
        '48H': {},
        '72H': {},
        '96H': {}
    };
    
    leitos.forEach(leito => {
        const prevAlta = leito.prevAlta || '';
        const concessoes = leito.concessoes || [];
        
        // Ignorar "SP"
        if (prevAlta === 'SP') return;
        
        // Determinar período
        let periodo = null;
        if (prevAlta.includes('Hoje')) periodo = 'Hoje';
        else if (prevAlta === '24H') periodo = '24H';
        else if (prevAlta === '48H') periodo = '48H';
        else if (prevAlta === '72H') periodo = '72H';
        else if (prevAlta === '96H') periodo = '96H';
        
        if (!periodo) return;
        
        // Contar cada concessão
        concessoes.forEach(concessao => {
            if (!concessoesPorPeriodo[periodo][concessao]) {
                concessoesPorPeriodo[periodo][concessao] = 0;
            }
            concessoesPorPeriodo[periodo][concessao]++;
        });
    });
    
    return concessoesPorPeriodo;
}

// =================== PROCESSAR LINHAS DE CUIDADO ===================
function processarLinhas(leitos) {
    const linhasPorPeriodo = {
        'Hoje': {},
        '24H': {},
        '48H': {},
        '72H': {},
        '96H': {}
    };
    
    leitos.forEach(leito => {
        const prevAlta = leito.prevAlta || '';
        const linhas = leito.linhas || [];
        
        // Ignorar "SP"
        if (prevAlta === 'SP') return;
        
        // Determinar período
        let periodo = null;
        if (prevAlta.includes('Hoje')) periodo = 'Hoje';
        else if (prevAlta === '24H') periodo = '24H';
        else if (prevAlta === '48H') periodo = '48H';
        else if (prevAlta === '72H') periodo = '72H';
        else if (prevAlta === '96H') periodo = '96H';
        
        if (!periodo) return;
        
        // Contar cada linha
        linhas.forEach(linha => {
            if (!linhasPorPeriodo[periodo][linha]) {
                linhasPorPeriodo[periodo][linha] = 0;
            }
            linhasPorPeriodo[periodo][linha]++;
        });
    });
    
    return linhasPorPeriodo;
}

// =================== CRIAR GRÁFICO DE ALTAS ===================
function criarGraficoAltas(hospitalId, altas) {
    const canvasId = `chartAltas${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.warn(`⚠️ [GRÁFICO ALTAS] Canvas ${canvasId} não encontrado`);
        return;
    }
    
    // Destruir gráfico anterior se existir
    const chartExistente = Chart.getChart(canvasId);
    if (chartExistente) {
        chartExistente.destroy();
    }
    
    // Labels do eixo X
    const labels = ['Hoje', '24H', '48H', '72H', '96H'];
    
    // Datasets empilhados para Hoje e 24H
    const datasets = [
        {
            label: 'Ouro',
            data: [altas['Hoje'].Ouro, 0, 0, 0, 0],
            backgroundColor: CORES_TIMELINE['Ouro'],
            stack: 'stack0'
        },
        {
            label: '2R',
            data: [altas['Hoje']['2R'], altas['24H']['2R'], 0, 0, 0],
            backgroundColor: CORES_TIMELINE['2R'],
            stack: 'stack0'
        },
        {
            label: '3R',
            data: [altas['Hoje']['3R'], 0, 0, 0, 0],
            backgroundColor: CORES_TIMELINE['3R'],
            stack: 'stack0'
        },
        {
            label: '48H',
            data: [0, 0, altas['48H'].total, 0, 0],
            backgroundColor: CORES_TIMELINE['Padrão']
        },
        {
            label: '72H',
            data: [0, 0, 0, altas['72H'].total, 0],
            backgroundColor: CORES_TIMELINE['Padrão']
        },
        {
            label: '96H',
            data: [0, 0, 0, 0, altas['96H'].total],
            backgroundColor: CORES_TIMELINE['Padrão']
        }
    ];
    
    // Calcular máximo para eixo Y (+1)
    const todosValores = [
        altas['Hoje'].Ouro + altas['Hoje']['2R'] + altas['Hoje']['3R'],
        altas['24H']['2R'],
        altas['48H'].total,
        altas['72H'].total,
        altas['96H'].total
    ];
    const maxValor = Math.max(...todosValores, 1);
    const maxEixoY = maxValor + 1;
    
    // Criar gráfico
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: isMobile() ? 1 : 2,
            plugins: {
                legend: {
                    display: false // Usar legenda HTML
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 12, weight: '600' }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: maxEixoY,
                    ticks: {
                        stepSize: 1,
                        color: '#fff',
                        font: { size: 12, weight: '600' },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#fff',
                        font: { size: 14, weight: '700' }
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML
    window.createCustomLegendOutside(canvasId, datasets.slice(0, 3)); // Apenas Ouro, 2R, 3R
    
    console.log(`✅ [GRÁFICO ALTAS] ${canvasId} criado`);
}

// =================== CRIAR GRÁFICO DE CONCESSÕES ===================
function criarGraficoConcessoes(hospitalId, concessoesPorPeriodo) {
    const canvasId = `chartConcessoes${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.warn(`⚠️ [GRÁFICO CONCESSÕES] Canvas ${canvasId} não encontrado`);
        return;
    }
    
    // Destruir gráfico anterior
    const chartExistente = Chart.getChart(canvasId);
    if (chartExistente) {
        chartExistente.destroy();
    }
    
    // Labels do eixo X
    const labels = ['Hoje', '24H', '48H', '72H', '96H'];
    
    // Coletar todas as concessões únicas
    const concessoesSet = new Set();
    Object.values(concessoesPorPeriodo).forEach(periodo => {
        Object.keys(periodo).forEach(concessao => concessoesSet.add(concessao));
    });
    
    // Criar datasets (uma barra por concessão)
    const datasets = Array.from(concessoesSet).map(concessao => {
        return {
            label: concessao,
            data: labels.map(periodo => concessoesPorPeriodo[periodo][concessao] || 0),
            backgroundColor: getCorConcessao(concessao)
        };
    });
    
    // Calcular máximo (+1)
    const todosValores = datasets.flatMap(ds => ds.data);
    const maxValor = Math.max(...todosValores, 1);
    const maxEixoY = maxValor + 1;
    
    // Criar gráfico
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: isMobile() ? 1 : 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff',
                        font: { size: 12, weight: '600' }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: maxEixoY,
                    ticks: {
                        stepSize: 1,
                        color: '#fff',
                        font: { size: 12, weight: '600' },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#fff',
                        font: { size: 14, weight: '700' }
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML
    window.createCustomLegendOutside(canvasId, datasets);
    
    console.log(`✅ [GRÁFICO CONCESSÕES] ${canvasId} criado com ${datasets.length} concessões`);
}

// =================== CRIAR GRÁFICO DE LINHAS DE CUIDADO ===================
function criarGraficoLinhas(hospitalId, linhasPorPeriodo) {
    const canvasId = `chartLinhas${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.warn(`⚠️ [GRÁFICO LINHAS] Canvas ${canvasId} não encontrado`);
        return;
    }
    
    // Destruir gráfico anterior
    const chartExistente = Chart.getChart(canvasId);
    if (chartExistente) {
        chartExistente.destroy();
    }
    
    // Labels do eixo X
    const labels = ['Hoje', '24H', '48H', '72H', '96H'];
    
    // Coletar todas as linhas únicas
    const linhasSet = new Set();
    Object.values(linhasPorPeriodo).forEach(periodo => {
        Object.keys(periodo).forEach(linha => linhasSet.add(linha));
    });
    
    // Criar datasets (uma barra por linha)
    const datasets = Array.from(linhasSet).map(linha => {
        return {
            label: linha,
            data: labels.map(periodo => linhasPorPeriodo[periodo][linha] || 0),
            backgroundColor: getCorLinha(linha)
        };
    });
    
    // Calcular máximo (+1)
    const todosValores = datasets.flatMap(ds => ds.data);
    const maxValor = Math.max(...todosValores, 1);
    const maxEixoY = maxValor + 1;
    
    // Criar gráfico
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: isMobile() ? 1 : 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff',
                        font: { size: 12, weight: '600' }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: maxEixoY,
                    ticks: {
                        stepSize: 1,
                        color: '#fff',
                        font: { size: 12, weight: '600' },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#fff',
                        font: { size: 14, weight: '700' }
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML
    window.createCustomLegendOutside(canvasId, datasets);
    
    console.log(`✅ [GRÁFICO LINHAS] ${canvasId} criado com ${datasets.length} linhas`);
}

// =================== RENDERIZAR KPIS ===================
function renderizarKPIs(hospitalId, hospital) {
    const config = HOSPITAIS_CONFIG[hospitalId];
    const leitos = hospital.leitos || [];
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado');
    const leitosDisponiveis = leitos.filter(l => l.status === 'vago');
    const leitosAltaHoje = leitosOcupados.filter(l => (l.prevAlta || '').includes('Hoje'));
    
    // Atualizar textos dos KPIs
    const donutText = document.getElementById(`donutText${hospitalId}`);
    const kpiTotal = document.getElementById(`kpiTotal${hospitalId}`);
    const kpiDisponiveis = document.getElementById(`kpiDisponiveis${hospitalId}`);
    const kpiAltaHoje = document.getElementById(`kpiAltaHoje${hospitalId}`);
    
    if (donutText) donutText.textContent = `${leitosOcupados.length}/${config.leitos}`;
    if (kpiTotal) kpiTotal.textContent = config.leitos;
    if (kpiDisponiveis) kpiDisponiveis.textContent = leitosDisponiveis.length;
    if (kpiAltaHoje) kpiAltaHoje.textContent = leitosAltaHoje.length;
    
    // Criar donut de ocupação
    criarDonutOcupacao(hospitalId, leitosOcupados.length, config.leitos);
    
    console.log(`✅ [KPIs] ${hospitalId}: Total=${config.leitos}, Ocupados=${leitosOcupados.length}, Disponíveis=${leitosDisponiveis.length}, Alta Hoje=${leitosAltaHoje.length}`);
}

// =================== CRIAR DONUT DE OCUPAÇÃO ===================
function criarDonutOcupacao(hospitalId, ocupados, total) {
    const canvasId = `donutOcupacao${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.warn(`⚠️ [DONUT OCUPAÇÃO] Canvas ${canvasId} não encontrado`);
        return;
    }
    
    // Destruir gráfico anterior
    const chartExistente = Chart.getChart(canvasId);
    if (chartExistente) {
        chartExistente.destroy();
    }
    
    const disponiveis = total - ocupados;
    const percentual = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Ocupados', 'Disponíveis'],
            datasets: [{
                data: [ocupados, disponiveis],
                backgroundColor: ['#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed} leitos (${percentual}%)`;
                        }
                    }
                }
            }
        }
    });
    
    console.log(`✅ [DONUT] ${canvasId} criado: ${ocupados}/${total} (${percentual}%)`);
}

// =================== RENDERIZAR HOSPITAL ===================
function renderizarHospital(hospitalId) {
    console.log(`🏥 [DASHBOARD] Renderizando hospital: ${hospitalId}`);
    
    // Verificar se dados existem
    if (!window.hospitalData || !window.hospitalData[hospitalId]) {
        console.error(`❌ [DASHBOARD] Dados não encontrados para ${hospitalId}`);
        return;
    }
    
    const hospital = window.hospitalData[hospitalId];
    const leitos = hospital.leitos || [];
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado');
    
    console.log(`📊 [DASHBOARD] ${hospitalId} - ${hospital.nome}: ${leitosOcupados.length} leitos ocupados`);
    
    // Renderizar KPIs
    renderizarKPIs(hospitalId, hospital);
    
    // Processar dados
    const altas = processarAltas(leitosOcupados);
    const concessoes = processarConcessoes(leitosOcupados);
    const linhas = processarLinhas(leitosOcupados);
    
    // Criar gráficos
    criarGraficoAltas(hospitalId, altas);
    criarGraficoConcessoes(hospitalId, concessoes);
    criarGraficoLinhas(hospitalId, linhas);
    
    console.log(`✅ [DASHBOARD] ${hospitalId} renderizado com sucesso`);
}

// =================== FUNÇÃO PRINCIPAL DO DASHBOARD ===================
// CRÍTICO: Nome da função deve ser exatamente este!
window.renderDashboardHospitalar = function(hospitalId = 'todos') {
    console.log('🚀 [DASHBOARD HOSPITALAR] Inicializando...');
    console.log(`📍 [DASHBOARD] Parâmetro recebido: "${hospitalId}"`);
    
    // Verificar se dados estão disponíveis
    if (!window.hospitalData) {
        console.error('❌ [DASHBOARD] window.hospitalData não encontrado!');
        console.error('❌ [DASHBOARD] Execute window.loadHospitalData() primeiro');
        return;
    }
    
    // Obter container principal
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        console.error('❌ [DASHBOARD] Container dashHospitalarContent não encontrado!');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    console.log('🧹 [DASHBOARD] Container limpo');
    
    // Obter data atual
    const hoje = new Date();
    const dataAtual = hoje.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    
    // Determinar quais hospitais renderizar
    const hospitaisIds = ['H1', 'H2', 'H3', 'H4', 'H5'];
    let hospitaisParaRenderizar = [];
    
    if (hospitalId === 'todos') {
        console.log('📋 [DASHBOARD] Renderizando TODOS os hospitais (5)');
        hospitaisParaRenderizar = hospitaisIds;
    } else if (hospitaisIds.includes(hospitalId)) {
        console.log(`📋 [DASHBOARD] Renderizando hospital específico: ${hospitalId}`);
        hospitaisParaRenderizar = [hospitalId];
    } else {
        console.error(`❌ [DASHBOARD] Hospital inválido: "${hospitalId}"`);
        console.error(`❌ [DASHBOARD] Hospitais válidos: ${hospitaisIds.join(', ')}, 'todos'`);
        return;
    }
    
    // Criar estrutura HTML para cada hospital
    hospitaisParaRenderizar.forEach(id => {
        const section = criarHTMLHospital(id);
        if (section) {
            container.appendChild(section);
            console.log(`✅ [HTML] Estrutura de ${id} adicionada ao DOM`);
        }
    });
    
    // Aguardar DOM atualizar, depois renderizar dados
    setTimeout(() => {
        hospitaisParaRenderizar.forEach(id => {
            renderizarHospital(id);
        });
        
        console.log('✅ [DASHBOARD HOSPITALAR] Renderização concluída');
    }, 100);
};

// Criar alias para compatibilidade
window.renderizarDashboard = window.renderDashboardHospitalar;

// Log de carregamento
console.log('✅ [DASHBOARD HOSPITALAR V3.3] Módulo carregado');
console.log('📊 [DASHBOARD] Função disponível: window.renderDashboardHospitalar(hospitalId)');
console.log('🏥 [DASHBOARD] Hospitais suportados: H1, H2, H3, H4, H5, "todos"');
console.log('🎨 [DASHBOARD] 56 cores Pantone carregadas (11 concessões + 45 linhas)');
console.log('🏗️ [DASHBOARD] Estrutura HTML criada dinamicamente');
