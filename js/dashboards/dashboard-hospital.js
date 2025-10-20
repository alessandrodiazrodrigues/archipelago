// DASHBOARD HOSPITALAR V3.3.2 - LEGENDAS HTML CLICAVEIS + CORES DINAMICAS
// Cliente: Guilherme Santoro | Dev: Alessandro Rodrigues
// Data: 20/10/2025

// Estado global para fundo branco
window.fundoBranco = false;

// Paleta de cores Pantone para Concessoes
const CORES_CONCESSOES = {
    'Transicao Domiciliar': '#007A53',
    'Aplicacao Med. Domiciliar': '#582C83',
    'Aspiracao': '#2E1A47',
    'Banho': '#8FD3F4',
    'Curativo': '#00BFB3',
    'Curativo PICC': '#E03C31',
    'Fisioterapia Domiciliar': '#009639',
    'Fonoaudiologia Domiciliar': '#FF671F',
    'Oxigenoterapia': '#64A70B',
    'Remocao': '#FFB81C',
    'Solicitacao Exames Dom.': '#546E7A'
};

// Paleta de cores Pantone para Linhas de Cuidado (45 cores)
const CORES_LINHAS = {
    'Assiste': '#ED0A72',
    'APS SP': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO': '#A6192E',
    'Nexus SP Cardiologia': '#C8102E',
    'Nexus SP Gastroenterologia': '#455A64',
    'Nexus SP Geriatria': '#FF6F1D',
    'Nexus SP Pneumologia': '#E35205',
    'Nexus SP Psiquiatria': '#0072CE',
    'Nexus SP Reumatologia': '#5A0020',
    'Nexus SP Saude do Figado': '#582D40',
    'Generalista': '#5A646B',
    'Bucomaxilofacial': '#6A1B9A',
    'Cardiologia': '#C8102E',
    'Cirurgia Cardiaca': '#A6192E',
    'Cirurgia de Cabeca e Pescoco': '#582C83',
    'Cirurgia do Aparelho Digestivo': '#5C5EBE',
    'Cirurgia Geral': '#00263A',
    'Cirurgia Oncologica': '#6A1B9A',
    'Cirurgia Plastica': '#ED0A72',
    'Cirurgia Toracica': '#003C57',
    'Cirurgia Vascular': '#556F44',
    'Clinica Medica': '#5A646B',
    'Coloproctologia': '#582D40',
    'Dermatologia': '#8FD3F4',
    'Endocrinologia': '#582C83',
    'Fisiatria': '#009639',
    'Gastroenterologia': '#455A64',
    'Geriatria': '#FF6F1D',
    'Ginecologia e Obstetricia': '#ED0A72',
    'Hematologia': '#A6192E',
    'Infectologia': '#64A70B',
    'Mastologia': '#ED0A72',
    'Nefrologia': '#0072CE',
    'Neurocirurgia': '#00263A',
    'Neurologia': '#0072CE',
    'Oftalmologia': '#00AEEF',
    'Oncologia Clinica': '#6A1B9A',
    'Ortopedia': '#556F44',
    'Otorrinolaringologia': '#FF671F',
    'Pediatria': '#5A646B',
    'Pneumologia': '#E35205',
    'Psiquiatria': '#0072CE',
    'Reumatologia': '#5A0020',
    'Urologia': '#00263A'
};

// Funcao para obter cores
function getCorExata(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`Aviso [CORES] Item invalido: "${itemName}"`);
        return '#6b7280';
    }
    
    const paleta = tipo === 'concessao' ? CORES_CONCESSOES : CORES_LINHAS;
    
    // Busca exata
    let cor = paleta[itemName];
    if (cor) {
        return cor;
    }
    
    // Normalizar
    const nomeNormalizado = itemName.trim().replace(/\s+/g, ' ');
    cor = paleta[nomeNormalizado];
    if (cor) {
        return cor;
    }
    
    console.error(`Erro [CORES] Cor nao encontrada: "${itemName}"`);
    return '#6b7280';
}

// FUNCAO PARA CRIAR LEGENDAS HTML CUSTOMIZADAS - CLICAVEIS
window.createCustomLegendOutside = function(chartId, datasets) {
    const chartContainer = document.getElementById(chartId)?.parentElement;
    if (!chartContainer) {
        console.error(`Erro [LEGENDA] Container nao encontrado: ${chartId}`);
        return;
    }
    
    // Remover legenda anterior
    const oldLegend = chartContainer.parentNode.querySelector('.custom-legend-container');
    if (oldLegend) {
        oldLegend.remove();
    }
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : 'rgba(255, 255, 255, 0.05)';
    
    const legendContainer = document.createElement('div');
    legendContainer.className = 'custom-legend-container';
    legendContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 10px;
        padding: 10px;
        background: ${fundoLegenda};
        border-radius: 8px;
        border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    `;
    
    datasets.forEach((dataset, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: ${dataset.hidden ? '0.4' : '1'};
        `;
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background-color: ${dataset.backgroundColor};
            flex-shrink: 0;
            opacity: ${dataset.hidden ? '0.3' : '1'};
        `;
        
        const label = document.createElement('span');
        label.textContent = dataset.label || `Dataset ${index + 1}`;
        label.style.cssText = `
            font-size: 11px;
            color: ${corTexto};
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
                    }
                } catch (error) {
                    console.error(`Erro [LEGENDA] Toggle dataset ${index}:`, error);
                }
            }
        });
        
        // Hover effect
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
};

// FUNCAO PARA ATUALIZAR CORES
window.atualizarTodasAsCores = function() {
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : '#1a1f2e';
    
    // Atualizar legendas
    document.querySelectorAll('.custom-legend-container').forEach(container => {
        container.style.backgroundColor = fundoLegenda;
        container.style.border = `1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`;
        
        container.querySelectorAll('span').forEach((span, index) => {
            if (index % 2 === 1) {
                span.style.color = corTexto;
            }
        });
    });
    
    // Atualizar graficos
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && chart.options && chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = corTexto;
                    chart.options.scales.x.grid.color = corGrid;
                    if (chart.options.scales.x.title) {
                        chart.options.scales.x.title.color = corTexto;
                    }
                }
                
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = corTexto;
                    chart.options.scales.y.grid.color = corGrid;
                    if (chart.options.scales.y.title) {
                        chart.options.scales.y.title.color = corTexto;
                    }
                }
                
                chart.update('none');
            }
        });
    }
};

// FUNCAO PRINCIPAL: RENDERIZAR DASHBOARD
window.renderDashboardHospitalar = function() {
    console.log('Renderizando Dashboard Hospitalar V3.3.2');
    
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
        }
    }
    
    if (!container) {
        console.error('Container nao encontrado');
        return;
    }
    
    // Verificar dados
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados da API V3.3.2</h2>
                <p style="color: #9ca3af; font-size: 14px;">Conectando com Google Apps Script...</p>
            </div>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
        return;
    }
    
    const hospitaisComDados = Object.keys(window.CONFIG?.HOSPITAIS || {}).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => l.status === 'ocupado' || l.status === 'vago');
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; background: #1a1f2e; border-radius: 12px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">Nenhum dado hospitalar disponivel</h3>
                <p style="color: #9ca3af; margin-bottom: 20px;">Aguardando dados da planilha Google (74 colunas V3.3.2).</p>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div class="dashboard-header" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Dashboard Hospitalar V3.3.2 - ${hoje}</h2>
                    <button id="toggleFundoBtn" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer;">
                        <span id="toggleIcon">Escuro</span>
                    </button>
                </div>
            </div>
            
            <div class="hospitais-container">
                ${hospitaisComDados.map(hospitalId => renderHospitalSection(hospitalId)).join('')}
            </div>
        </div>
        
        ${getHospitalConsolidadoCSS()}
    `;
    
    // Event listeners
    setTimeout(() => {
        document.getElementById('toggleFundoBtn')?.addEventListener('click', toggleFundo);
        
        hospitaisComDados.forEach(hospitalId => {
            renderGaugeHospital(hospitalId);
            renderAltasHospital(hospitalId);
            renderConcessoesHospital(hospitalId);
            renderLinhasHospital(hospitalId);
            renderRegiaoHospital(hospitalId);
        });
    }, 100);
};

// Funcao para alternar fundo
function toggleFundo() {
    window.fundoBranco = !window.fundoBranco;
    const icon = document.getElementById('toggleIcon');
    if (icon) {
        icon.textContent = window.fundoBranco ? 'Claro' : 'Escuro';
    }
    window.atualizarTodasAsCores();
}

// Renderizar secao do hospital
function renderHospitalSection(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital) return '';
    
    const kpis = calcularKPIsHospital(hospitalId);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    return `
        <div class="hospital-section" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3>${hospital.nome || hospitalId}</h3>
            </div>
            
            <div class="kpis-grid">
                <div class="kpi-card">
                    <div class="kpi-label">Total Leitos</div>
                    <div class="kpi-value">${kpis.total}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Ocupados</div>
                    <div class="kpi-value" style="color: #f97316;">${kpis.ocupados}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Vagos</div>
                    <div class="kpi-value" style="color: #22c55e;">${kpis.vagos}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Altas Hoje</div>
                    <div class="kpi-value" style="color: #60a5fa;">${kpis.altas}</div>
                </div>
            </div>
            
            <div class="gauge-container" style="margin: 20px 0;">
                <h4 style="text-align: center; margin-bottom: 10px;">Taxa de Ocupacao</h4>
                <div style="position: relative; height: 120px;">
                    <canvas id="gauge${hospitalId}"></canvas>
                    <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: bold; color: ${kpis.ocupacao >= 80 ? '#ef4444' : kpis.ocupacao >= 60 ? '#f97316' : '#22c55e'};">
                        ${kpis.ocupacao}%
                    </div>
                </div>
            </div>
            
            <div class="graficos-grid">
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Previsao de Alta em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessoes em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Distribuicao por Regiao em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoRegiao${hospitalId}"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calcular KPIs
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    
    // Altas HOJE (Hoje Ouro, Hoje Prata, Hoje Bronze)
    const TIMELINE_ALTA_HOJE = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze'];
    const altas = hospital.leitos.filter(l => {
        if (l.status === 'ocupado') {
            const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
            return prevAlta && TIMELINE_ALTA_HOJE.includes(prevAlta);
        }
        return false;
    }).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos, altas };
}

// Plugin para fundo
const backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

// Gauge do hospital
function renderGaugeHospital(hospitalId) {
    const canvas = document.getElementById(`gauge${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const kpis = calcularKPIsHospital(hospitalId);
    const ocupacao = kpis.ocupacao;
    
    const chartKey = `gauge${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    try {
        const ctx = canvas.getContext('2d');
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [ocupacao, 100 - ocupacao],
                    backgroundColor: [
                        ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f97316' : '#22c55e',
                        'rgba(255,255,255,0.1)'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                rotation: -90,
                circumference: 180
            }
        });
    } catch (error) {
        console.error(`Erro ao renderizar gauge ${hospitalId}:`, error);
    }
}

// Grafico de Altas
function renderAltasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `altas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // CATEGORIAS CORRETAS DE PREVISAO DE ALTA
    const categorias = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze', '24H', '48H', '72H', '96H', 'SP'];
    const dados = categorias.map(cat => {
        return hospital.leitos.filter(l => {
            if (l.status === 'ocupado') {
                const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
                return prevAlta === cat;
            }
            return false;
        }).length;
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Pacientes',
                data: dados,
                backgroundColor: '#60a5fa',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    ticks: {
                        color: corTexto,
                        font: { size: 11, weight: 600 },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
}

// Grafico de Concessoes
function renderConcessoesHospital(hospitalId) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Contar concessoes
    const concessoesMap = {};
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.concessoes && Array.isArray(leito.concessoes)) {
            leito.concessoes.forEach(concessao => {
                concessoesMap[concessao] = (concessoesMap[concessao] || 0) + 1;
            });
        }
    });
    
    const labels = Object.keys(concessoesMap);
    const dados = Object.values(concessoesMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem concessoes registradas</p>';
        return;
    }
    
    const datasets = labels.map((nome, idx) => {
        const cor = getCorExata(nome, 'concessao');
        return {
            label: nome,
            data: [dados[idx]],
            backgroundColor: cor,
            borderWidth: 0
        };
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Concessoes'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
    
    // Criar legenda HTML customizada
    setTimeout(() => {
        window.createCustomLegendOutside(`graficoConcessoes${hospitalId}`, datasets);
    }, 50);
}

// Grafico de Linhas
function renderLinhasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Contar linhas
    const linhasMap = {};
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.linhas && Array.isArray(leito.linhas)) {
            leito.linhas.forEach(linha => {
                linhasMap[linha] = (linhasMap[linha] || 0) + 1;
            });
        }
    });
    
    const labels = Object.keys(linhasMap);
    const dados = Object.values(linhasMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem linhas de cuidado registradas</p>';
        return;
    }
    
    const datasets = labels.map((nome, idx) => {
        const cor = getCorExata(nome, 'linha');
        return {
            label: nome,
            data: [dados[idx]],
            backgroundColor: cor,
            borderWidth: 0
        };
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Linhas de Cuidado'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
    
    // Criar legenda HTML customizada
    setTimeout(() => {
        window.createCustomLegendOutside(`graficoLinhas${hospitalId}`, datasets);
    }, 50);
}

// Grafico de Regiao (PIZZA)
function renderRegiaoHospital(hospitalId) {
    const canvas = document.getElementById(`graficoRegiao${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `regiao${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    // Contar regioes
    const regioesMap = {};
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado' && leito.regiao) {
            regioesMap[leito.regiao] = (regioesMap[leito.regiao] || 0) + 1;
        }
    });
    
    const labels = Object.keys(regioesMap);
    const dados = Object.values(regioesMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem dados de regiao</p>';
        return;
    }
    
    const cores = [
        '#60a5fa', '#f97316', '#22c55e', '#a855f7', '#ec4899',
        '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'
    ];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores.slice(0, labels.length),
                borderWidth: 2,
                borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: corTexto,
                        font: { size: 11 },
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
}

// CSS
function getHospitalConsolidadoCSS() {
    return `
        <style>
            .hospital-section {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .hospital-header h3 {
                margin: 0 0 20px 0;
                color: #60a5fa;
                font-size: 22px;
                font-weight: 700;
            }
            
            .kpis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .kpi-card {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            }
            
            .kpi-label {
                font-size: 12px;
                color: #9ca3af;
                margin-bottom: 8px;
            }
            
            .kpi-value {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
            }
            
            .graficos-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .grafico-item {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
            }
            
            .chart-header {
                margin-bottom: 10px;
            }
            
            .chart-header h4 {
                margin: 0;
                color: #e2e8f0;
                font-size: 14px;
                font-weight: 600;
            }
            
            .chart-container {
                position: relative;
                height: 300px;
            }
            
            .gauge-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
            }
        </style>
    `;
}

console.log('Dashboard Hospitalar V3.3.2 carregado com sucesso');
