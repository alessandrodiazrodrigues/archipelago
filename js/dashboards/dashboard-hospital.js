// =================== DASHBOARD HOSPITALAR V3.3 FINAL ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3 FINAL - 5 HOSPITAIS
// 
// CHANGELOG V3.1 → V3.3:
// ✅ Adicionado H5 (Hospital Adventista - 13 leitos)
// ✅ Total: 79 leitos (H1:10, H2:36, H3:7, H4:13, H5:13)
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
    
    // Criar items da legenda (VERTICAL - um por linha)
    datasets.forEach((dataset, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.index = index;
        
        // Quadrado de cor
        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = dataset.backgroundColor || dataset.borderColor || '#999';
        
        // Label
        const label = document.createElement('span');
        label.className = 'legend-label';
        label.textContent = dataset.label || `Dataset ${index + 1}`;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        
        // Click handler para toggle
        item.addEventListener('click', () => {
            const chart = Chart.getChart(chartId);
            if (!chart) return;
            
            const meta = chart.getDatasetMeta(index);
            meta.hidden = !meta.hidden;
            
            // Toggle classe visual
            item.classList.toggle('inactive');
            
            chart.update();
        });
        
        legendDiv.appendChild(item);
    });
    
    // Adicionar legenda abaixo do canvas
    chartContainer.appendChild(legendDiv);
    
    console.log(`✅ [LEGENDA] Legenda criada para ${chartId} com ${datasets.length} itens`);
};

// =================== EXTRAIR PERÍODO DE PREVISÃO DE ALTA ===================
function extrairPeriodo(prevAlta) {
    if (!prevAlta) return null;
    
    // Normalizar string
    const str = prevAlta.toLowerCase().trim();
    
    // Hoje
    if (str.startsWith('hoje')) return 'Hoje';
    
    // 24h, 48h, 72h, 96h
    if (str.includes('24')) return '24h';
    if (str.includes('48')) return '48h';
    if (str.includes('72')) return '72h';
    if (str.includes('96')) return '96h';
    
    // SP
    if (str === 'sp') return 'SP';
    
    return null;
}

// =================== EXTRAIR SUBCATEGORIA (OURO, 2R, 3R) ===================
function extrairSubcategoria(prevAlta) {
    if (!prevAlta) return null;
    
    const str = prevAlta.toLowerCase().trim();
    
    if (str.includes('ouro')) return 'Ouro';
    if (str.includes('2r')) return '2R';
    if (str.includes('3r')) return '3R';
    
    return null;
}

// =================== PROCESSAR DADOS DE ALTAS ===================
function processarAltas(leitos) {
    const altas = {
        'Hoje Ouro': 0,
        'Hoje 2R': 0,
        'Hoje 3R': 0,
        '24h Ouro': 0,
        '24h 2R': 0,
        '24h 3R': 0,
        '48h': 0,
        '72h': 0,
        '96h': 0
        // SP é excluído propositalmente!
    };
    
    leitos.forEach(leito => {
        if (!leito.prevAlta || leito.prevAlta === 'SP') return;
        
        const periodo = extrairPeriodo(leito.prevAlta);
        const subcat = extrairSubcategoria(leito.prevAlta);
        
        // Hoje e 24h com subcategoria
        if ((periodo === 'Hoje' || periodo === '24h') && subcat) {
            const chave = `${periodo} ${subcat}`;
            if (altas[chave] !== undefined) {
                altas[chave]++;
            }
        }
        // 48h, 72h, 96h sem subcategoria
        else if (['48h', '72h', '96h'].includes(periodo)) {
            altas[periodo]++;
        }
    });
    
    return altas;
}

// =================== PROCESSAR CONCESSÕES POR PERÍODO ===================
function processarConcessoes(leitos) {
    const concessoesPorPeriodo = {
        'Hoje': {},
        '24h': {},
        '48h': {},
        '72h': {},
        '96h': {}
    };
    
    leitos.forEach(leito => {
        if (!leito.prevAlta || leito.prevAlta === 'SP') return;
        if (!leito.concessoes || !Array.isArray(leito.concessoes)) return;
        
        const periodo = extrairPeriodo(leito.prevAlta);
        if (!periodo || periodo === 'SP') return;
        
        leito.concessoes.forEach(concessao => {
            if (!concessoesPorPeriodo[periodo][concessao]) {
                concessoesPorPeriodo[periodo][concessao] = 0;
            }
            concessoesPorPeriodo[periodo][concessao]++;
        });
    });
    
    return concessoesPorPeriodo;
}

// =================== PROCESSAR LINHAS DE CUIDADO POR PERÍODO ===================
function processarLinhas(leitos) {
    const linhasPorPeriodo = {
        'Hoje': {},
        '24h': {},
        '48h': {},
        '72h': {},
        '96h': {}
    };
    
    leitos.forEach(leito => {
        if (!leito.prevAlta || leito.prevAlta === 'SP') return;
        if (!leito.linhas || !Array.isArray(leito.linhas)) return;
        
        const periodo = extrairPeriodo(leito.prevAlta);
        if (!periodo || periodo === 'SP') return;
        
        leito.linhas.forEach(linha => {
            if (!linhasPorPeriodo[periodo][linha]) {
                linhasPorPeriodo[periodo][linha] = 0;
            }
            linhasPorPeriodo[periodo][linha]++;
        });
    });
    
    return linhasPorPeriodo;
}

// =================== CRIAR GRÁFICO DE ANÁLISE PREDITIVA DE ALTAS ===================
function criarGraficoAltas(hospitalId, altas) {
    const chartId = `chartAltas${hospitalId}`;
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.warn(`⚠️ [GRÁFICO ALTAS] Canvas ${chartId} não encontrado`);
        return;
    }
    
    // Destruir gráfico existente
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Preparar datasets empilhados para Hoje e 24h
    const datasetsEmpilhados = [
        {
            label: 'Ouro',
            data: [altas['Hoje Ouro'], altas['24h Ouro'], 0, 0, 0],
            backgroundColor: CORES_TIMELINE['Ouro'],
            stack: 'stack0'
        },
        {
            label: '2R',
            data: [altas['Hoje 2R'], altas['24h 2R'], 0, 0, 0],
            backgroundColor: CORES_TIMELINE['2R'],
            stack: 'stack0'
        },
        {
            label: '3R',
            data: [altas['Hoje 3R'], altas['24h 3R'], 0, 0, 0],
            backgroundColor: CORES_TIMELINE['3R'],
            stack: 'stack0'
        }
    ];
    
    // Datasets não empilhados para 48h, 72h, 96h
    const datasetsSimples = [
        {
            label: '48h',
            data: [0, 0, altas['48h'], 0, 0],
            backgroundColor: CORES_TIMELINE['Padrão']
        },
        {
            label: '72h',
            data: [0, 0, 0, altas['72h'], 0],
            backgroundColor: CORES_TIMELINE['Padrão']
        },
        {
            label: '96h',
            data: [0, 0, 0, 0, altas['96h']],
            backgroundColor: CORES_TIMELINE['Padrão']
        }
    ];
    
    const allDatasets = [...datasetsEmpilhados, ...datasetsSimples];
    
    // Calcular máximo para eixo Y (sempre +1)
    const allValues = Object.values(altas);
    const maxValue = Math.max(...allValues, 0);
    const yMax = maxValue + 1;
    
    // Altura do gráfico (responsivo)
    const mobile = isMobile();
    canvas.style.height = mobile ? '200px' : '300px';
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'],
            datasets: allDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Legenda HTML externa
                },
                tooltip: {
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => `${item.dataset.label}: ${item.raw}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: mobile ? 10 : 12 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: mobile ? 10 : 12 },
                        callback: (value) => value
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#ffffff',
                        font: { size: mobile ? 12 : 14 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML (apenas para Ouro, 2R, 3R)
    window.createCustomLegendOutside(chartId, datasetsEmpilhados);
    
    console.log(`✅ [GRÁFICO ALTAS] Criado para ${hospitalId} com yMax=${yMax}`);
}

// =================== CRIAR GRÁFICO DE CONCESSÕES ===================
function criarGraficoConcessoes(hospitalId, concessoesPorPeriodo) {
    const chartId = `chartConcessoes${hospitalId}`;
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.warn(`⚠️ [GRÁFICO CONCESSÕES] Canvas ${chartId} não encontrado`);
        return;
    }
    
    // Destruir gráfico existente
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Coletar todas as concessões únicas
    const todasConcessoes = new Set();
    Object.values(concessoesPorPeriodo).forEach(periodo => {
        Object.keys(periodo).forEach(concessao => todasConcessoes.add(concessao));
    });
    
    // Criar um dataset por concessão
    const datasets = Array.from(todasConcessoes).map(concessao => {
        return {
            label: concessao,
            data: [
                concessoesPorPeriodo['Hoje'][concessao] || 0,
                concessoesPorPeriodo['24h'][concessao] || 0,
                concessoesPorPeriodo['48h'][concessao] || 0,
                concessoesPorPeriodo['72h'][concessao] || 0,
                concessoesPorPeriodo['96h'][concessao] || 0
            ],
            backgroundColor: getCorConcessao(concessao)
        };
    });
    
    // Calcular máximo para eixo Y (sempre +1)
    const allValues = datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 0);
    const yMax = maxValue + 1;
    
    // Altura do gráfico (responsivo)
    const mobile = isMobile();
    canvas.style.height = mobile ? '200px' : '300px';
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Legenda HTML externa
                },
                tooltip: {
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => `${item.dataset.label}: ${item.raw}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: mobile ? 10 : 12 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: mobile ? 10 : 12 },
                        callback: (value) => value
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#ffffff',
                        font: { size: mobile ? 12 : 14 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML
    window.createCustomLegendOutside(chartId, datasets);
    
    console.log(`✅ [GRÁFICO CONCESSÕES] Criado para ${hospitalId} com ${datasets.length} concessões, yMax=${yMax}`);
}

// =================== CRIAR GRÁFICO DE LINHAS DE CUIDADO ===================
function criarGraficoLinhas(hospitalId, linhasPorPeriodo) {
    const chartId = `chartLinhas${hospitalId}`;
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.warn(`⚠️ [GRÁFICO LINHAS] Canvas ${chartId} não encontrado`);
        return;
    }
    
    // Destruir gráfico existente
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Coletar todas as linhas únicas
    const todasLinhas = new Set();
    Object.values(linhasPorPeriodo).forEach(periodo => {
        Object.keys(periodo).forEach(linha => todasLinhas.add(linha));
    });
    
    // Criar um dataset por linha
    const datasets = Array.from(todasLinhas).map(linha => {
        return {
            label: linha,
            data: [
                linhasPorPeriodo['Hoje'][linha] || 0,
                linhasPorPeriodo['24h'][linha] || 0,
                linhasPorPeriodo['48h'][linha] || 0,
                linhasPorPeriodo['72h'][linha] || 0,
                linhasPorPeriodo['96h'][linha] || 0
            ],
            backgroundColor: getCorLinha(linha)
        };
    });
    
    // Calcular máximo para eixo Y (sempre +1)
    const allValues = datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 0);
    const yMax = maxValue + 1;
    
    // Altura do gráfico (responsivo)
    const mobile = isMobile();
    canvas.style.height = mobile ? '200px' : '300px';
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hoje', '24h', '48h', '72h', '96h'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Legenda HTML externa
                },
                tooltip: {
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => `${item.dataset.label}: ${item.raw}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: { size: mobile ? 10 : 12 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff',
                        font: { size: mobile ? 10 : 12 },
                        callback: (value) => value
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: '#ffffff',
                        font: { size: mobile ? 12 : 14 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML
    window.createCustomLegendOutside(chartId, datasets);
    
    console.log(`✅ [GRÁFICO LINHAS] Criado para ${hospitalId} com ${datasets.length} linhas, yMax=${yMax}`);
}

// =================== CRIAR DONUT CHART DE OCUPAÇÃO ===================
function criarDonutOcupacao(hospitalId, ocupados, total) {
    const chartId = `donutOcupacao${hospitalId}`;
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.warn(`⚠️ [DONUT OCUPAÇÃO] Canvas ${chartId} não encontrado`);
        return;
    }
    
    // Destruir gráfico existente
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }
    
    const vagos = total - ocupados;
    const percentual = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    // Altura do donut (responsivo)
    const mobile = isMobile();
    canvas.style.height = mobile ? '120px' : '150px';
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ocupados', 'Vagos'],
            datasets: [{
                data: [ocupados, vagos],
                backgroundColor: ['#10b981', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.label}: ${item.raw}`
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: (chart) => {
                const { ctx, chartArea } = chart;
                if (!chartArea) return;
                
                ctx.save();
                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = (chartArea.top + chartArea.bottom) / 2;
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = window.fundoBranco ? '#1f2937' : '#ffffff';
                ctx.font = mobile ? 'bold 20px Inter' : 'bold 24px Inter';
                ctx.fillText(`${percentual}%`, centerX, centerY);
                ctx.restore();
            }
        }]
    });
    
    console.log(`✅ [DONUT OCUPAÇÃO] Criado para ${hospitalId}: ${ocupados}/${total} (${percentual}%)`);
}

// =================== RENDERIZAR KPIs ===================
function renderizarKPIs(hospitalId, hospital) {
    const leitos = hospital.leitos || [];
    const totalLeitos = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const disponiveis = totalLeitos - ocupados;
    const comAltaHoje = leitos.filter(l => {
        if (!l.prevAlta) return false;
        const periodo = extrairPeriodo(l.prevAlta);
        return periodo === 'Hoje';
    }).length;
    
    // Criar donut de ocupação
    criarDonutOcupacao(hospitalId, ocupados, totalLeitos);
    
    // Atualizar texto do donut
    const donutText = document.getElementById(`donutText${hospitalId}`);
    if (donutText) {
        donutText.textContent = `${ocupados}/${totalLeitos} leitos`;
    }
    
    // Atualizar KPI total
    const kpiTotal = document.getElementById(`kpiTotal${hospitalId}`);
    if (kpiTotal) {
        kpiTotal.textContent = totalLeitos;
    }
    
    // Atualizar KPI disponíveis
    const kpiDisponiveis = document.getElementById(`kpiDisponiveis${hospitalId}`);
    if (kpiDisponiveis) {
        kpiDisponiveis.textContent = disponiveis;
    }
    
    // Atualizar KPI alta hoje
    const kpiAltaHoje = document.getElementById(`kpiAltaHoje${hospitalId}`);
    if (kpiAltaHoje) {
        kpiAltaHoje.textContent = comAltaHoje;
    }
    
    console.log(`✅ [KPIs] ${hospitalId}: Total=${totalLeitos}, Ocupados=${ocupados}, Disponíveis=${disponiveis}, Alta Hoje=${comAltaHoje}`);
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
    
    // Obter data atual para títulos
    const hoje = new Date();
    const dataAtual = hoje.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    
    // Atualizar títulos dos gráficos com data
    document.querySelectorAll('.chart-title[data-type="altas"]').forEach(el => {
        el.textContent = `Análise Preditiva de Altas em ${dataAtual}`;
    });
    
    document.querySelectorAll('.chart-title[data-type="concessoes"]').forEach(el => {
        el.textContent = `Concessões Previstas em ${dataAtual}`;
    });
    
    document.querySelectorAll('.chart-title[data-type="linhas"]').forEach(el => {
        el.textContent = `Linhas de Cuidado Previstas em ${dataAtual}`;
    });
    
    // Renderizar hospitais
    const hospitaisIds = ['H1', 'H2', 'H3', 'H4', 'H5'];
    
    if (hospitalId === 'todos') {
        console.log('📋 [DASHBOARD] Renderizando TODOS os hospitais (5)');
        hospitaisIds.forEach(id => renderizarHospital(id));
    } else if (hospitaisIds.includes(hospitalId)) {
        console.log(`📋 [DASHBOARD] Renderizando hospital específico: ${hospitalId}`);
        renderizarHospital(hospitalId);
    } else {
        console.error(`❌ [DASHBOARD] Hospital inválido: "${hospitalId}"`);
        console.error(`❌ [DASHBOARD] Hospitais válidos: ${hospitaisIds.join(', ')}, 'todos'`);
    }
    
    console.log('✅ [DASHBOARD HOSPITALAR] Renderização concluída');
};

// Criar alias para compatibilidade
window.renderizarDashboard = window.renderDashboardHospitalar;

// Log de carregamento
console.log('✅ [DASHBOARD HOSPITALAR V3.3] Módulo carregado');
console.log('📊 [DASHBOARD] Função disponível: window.renderDashboardHospitalar(hospitalId)');
console.log('🏥 [DASHBOARD] Hospitais suportados: H1, H2, H3, H4, H5, "todos"');
console.log('🎨 [DASHBOARD] 56 cores Pantone carregadas (11 concessões + 45 linhas)');
