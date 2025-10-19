// =================== DASHBOARD HOSPITALAR V3.3.2 - ESTILO CLÁSSICO ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3.2 - Modelo clássico com barras verticais
// ====================================================================================

/**
 * Renderiza o dashboard hospitalar principal
 * @param {string} hospitalId - ID do hospital (opcional, padrão 'todos')
 */
window.renderizarDashboardHospital = function(hospitalId = 'todos') {
    console.log('[DASH HOSP] Iniciando renderização para:', hospitalId);
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        console.error('[DASH HOSP] Container dashHospitalarContent não encontrado');
        return;
    }

    // Verificar se temos dados
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        console.error('[DASH HOSP] Dados hospitalares não encontrados');
        container.innerHTML = `
            <div class="error-message">
                <p>Carregando dados...</p>
            </div>
        `;
        return;
    }

    // Preparar dados do hospital
    const hospital = window.hospitalData[hospitalId || 'H1'];
    if (!hospital || !hospital.leitos) {
        console.error('[DASH HOSP] Hospital não encontrado:', hospitalId);
        container.innerHTML = `
            <div class="error-message">
                <p>Hospital não encontrado</p>
            </div>
        `;
        return;
    }

    // Calcular KPIs
    const kpis = calcularKPIs(hospital);
    
    // Preparar dados dos gráficos
    const dadosGraficos = prepararDadosGraficos(hospital);
    
    // Renderizar HTML
    container.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h2>Dashboard Hospitalar - ${hospital.nome || 'Hospital'}</h2>
                <div class="dashboard-subtitle">
                    <span>Total de Leitos: ${hospital.leitos.length}</span>
                    <span class="separator">|</span>
                    <span>Taxa de Ocupação: ${kpis.taxaOcupacao}%</span>
                </div>
            </div>
            
            ${renderizarKPIs(kpis)}
            
            <div class="charts-container">
                ${renderizarGraficos(hospitalId, dadosGraficos)}
            </div>
        </div>
    `;
    
    // Aguardar DOM e renderizar gráficos
    setTimeout(() => {
        renderizarTodosGraficos(hospitalId, dadosGraficos, kpis);
    }, 100);
};

/**
 * Calcula KPIs do hospital
 */
function calcularKPIs(hospital) {
    const leitos = hospital.leitos || [];
    const total = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    
    // Contar por tipo
    const apartamentosOcupados = leitos.filter(l => 
        l.status === 'ocupado' && (l.tipo === 'Apartamento' || l.tipo === 'APTO')
    ).length;
    
    const enfermariasOcupadas = leitos.filter(l => 
        l.status === 'ocupado' && (l.tipo === 'Enfermaria' || l.tipo === 'ENF')
    ).length;
    
    // Contar por gênero
    const masculino = leitos.filter(l => 
        l.status === 'ocupado' && l.genero === 'Masculino'
    ).length;
    
    const feminino = leitos.filter(l => 
        l.status === 'ocupado' && l.genero === 'Feminino'
    ).length;
    
    // Isolamento
    const isolamento = leitos.filter(l => 
        l.status === 'ocupado' && l.isolamento && l.isolamento !== 'Não Isolamento'
    ).length;
    
    // Alta hoje
    const altaHoje = leitos.filter(l => 
        l.status === 'ocupado' && l.prevAlta && l.prevAlta.includes('Hoje')
    ).length;
    
    const taxaOcupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return {
        total,
        ocupados,
        vagos,
        apartamentosOcupados,
        enfermariasOcupadas,
        masculino,
        feminino,
        isolamento,
        altaHoje,
        taxaOcupacao
    };
}

/**
 * Renderiza os KPIs principais
 */
function renderizarKPIs(kpis) {
    return `
        <div class="kpis-grid">
            <div class="kpi-card kpi-ocupacao">
                <div class="kpi-icon">◉</div>
                <div class="kpi-info">
                    <h3>OCUPAÇÃO</h3>
                    <div class="kpi-value">${kpis.ocupados}/${kpis.total}</div>
                    <div class="kpi-percentage">${kpis.taxaOcupacao}%</div>
                </div>
            </div>
            
            <div class="kpi-card kpi-vagos">
                <div class="kpi-icon">○</div>
                <div class="kpi-info">
                    <h3>LEITOS VAGOS</h3>
                    <div class="kpi-value">${kpis.vagos}</div>
                    <div class="kpi-percentage">${100 - kpis.taxaOcupacao}%</div>
                </div>
            </div>
            
            <div class="kpi-card kpi-isolamento">
                <div class="kpi-icon">⚠</div>
                <div class="kpi-info">
                    <h3>EM ISOLAMENTO</h3>
                    <div class="kpi-value">${kpis.isolamento}</div>
                    <div class="kpi-detail">
                        <span>Contato: ${kpis.isolamento}</span>
                        <span>Respiratório: 0</span>
                    </div>
                </div>
            </div>
            
            <div class="kpi-card kpi-alta">
                <div class="kpi-icon">↗</div>
                <div class="kpi-info">
                    <h3>ALTA HOJE</h3>
                    <div class="kpi-value">${kpis.altaHoje}</div>
                    <div class="kpi-detail">
                        <span>24H: 0</span>
                        <span>48H: 0</span>
                        <span>72H: 0</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="kpis-secondary">
            <div class="kpi-group">
                <h4>DISTRIBUIÇÃO POR TIPO</h4>
                <div class="kpi-items">
                    <div class="kpi-item">
                        <span class="kpi-label">APARTAMENTOS</span>
                        <span class="kpi-value">${kpis.apartamentosOcupados}/${kpis.total}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">ENFERMARIAS</span>
                        <span class="kpi-value">${kpis.enfermariasOcupadas}/${kpis.total}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">HÍBRIDOS</span>
                        <span class="kpi-value">0/0</span>
                    </div>
                </div>
            </div>
            
            <div class="kpi-group">
                <h4>DISTRIBUIÇÃO POR GÊNERO</h4>
                <div class="kpi-items">
                    <div class="kpi-item">
                        <span class="kpi-label">MASCULINO</span>
                        <span class="kpi-value">${kpis.masculino}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">FEMININO</span>
                        <span class="kpi-value">${kpis.feminino}</span>
                    </div>
                </div>
            </div>
            
            <div class="kpi-group">
                <h4>INDICADORES PALIATIVOS</h4>
                <div class="kpi-items">
                    <div class="kpi-item">
                        <span class="kpi-label">DIRETIVAS (SIM)</span>
                        <span class="kpi-value">2</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Prepara dados para os gráficos
 */
function prepararDadosGraficos(hospital) {
    const leitosOcupados = hospital.leitos.filter(l => l.status === 'ocupado');
    
    // Faixas etárias
    const faixasEtarias = {
        '0-17': 0,
        '18-30': 0,
        '31-50': 0,
        '51-65': 0,
        '66-80': 0,
        '80+': 0
    };
    
    // Concessões (contador para TODAS as concessões)
    const concessoesContador = {};
    
    // Linhas de cuidado (contador para TODAS as linhas)
    const linhasContador = {};
    
    leitosOcupados.forEach(leito => {
        // Idade
        const idade = parseInt(leito.idade) || 0;
        if (idade <= 17) faixasEtarias['0-17']++;
        else if (idade <= 30) faixasEtarias['18-30']++;
        else if (idade <= 50) faixasEtarias['31-50']++;
        else if (idade <= 65) faixasEtarias['51-65']++;
        else if (idade <= 80) faixasEtarias['66-80']++;
        else faixasEtarias['80+']++;
        
        // Concessões
        if (leito.concessoes && Array.isArray(leito.concessoes)) {
            leito.concessoes.forEach(concessao => {
                if (concessao) {
                    concessoesContador[concessao] = (concessoesContador[concessao] || 0) + 1;
                }
            });
        }
        
        // Linhas
        if (leito.linhas && Array.isArray(leito.linhas)) {
            leito.linhas.forEach(linha => {
                if (linha) {
                    linhasContador[linha] = (linhasContador[linha] || 0) + 1;
                }
            });
        }
    });
    
    // Converter para arrays ordenados (TODAS as concessões e linhas)
    const concessoesArray = Object.entries(concessoesContador)
        .sort((a, b) => b[1] - a[1]);
    
    const linhasArray = Object.entries(linhasContador)
        .sort((a, b) => b[1] - a[1]);
    
    return {
        faixasEtarias,
        concessoes: concessoesArray,
        linhas: linhasArray
    };
}

/**
 * Renderiza estrutura HTML dos gráficos
 */
function renderizarGraficos(hospitalId, dadosGraficos) {
    return `
        <div class="chart-wrapper">
            <h3>DISTRIBUIÇÃO POR TIPO DE LEITO</h3>
            <div class="chart-container">
                <canvas id="chartTipoLeito"></canvas>
            </div>
            <div id="legendaTipoLeito" class="chart-legend"></div>
        </div>
        
        <div class="chart-wrapper">
            <h3>DISTRIBUIÇÃO POR GÊNERO</h3>
            <div class="chart-container">
                <canvas id="chartGenero"></canvas>
            </div>
        </div>
        
        <div class="chart-wrapper">
            <h3>DISTRIBUIÇÃO POR FAIXA ETÁRIA</h3>
            <div class="chart-container">
                <canvas id="chartIdade"></canvas>
            </div>
        </div>
        
        <div class="chart-wrapper chart-wide">
            <h3>CONCESSÕES DE ALTA</h3>
            <div class="chart-container">
                <canvas id="chartConcessoes"></canvas>
            </div>
            <div id="legendaConcessoes" class="chart-legend"></div>
        </div>
        
        <div class="chart-wrapper chart-wide">
            <h3>LINHAS DE CUIDADO</h3>
            <div class="chart-container">
                <canvas id="chartLinhas"></canvas>
            </div>
            <div id="legendaLinhas" class="chart-legend"></div>
        </div>
    `;
}

/**
 * Renderiza todos os gráficos
 */
function renderizarTodosGraficos(hospitalId, dadosGraficos, kpis) {
    console.log('[DASH HOSP] Iniciando renderização dos gráficos');
    
    // Destruir gráficos existentes
    destruirGraficosExistentes();
    
    // 1. Gráfico de Pizza - Tipo de Leito
    renderizarGraficoTipoLeito(kpis);
    
    // 2. Gráfico de Barras - Gênero
    renderizarGraficoGenero(kpis);
    
    // 3. Gráfico de Barras - Faixa Etária
    renderizarGraficoIdade(dadosGraficos.faixasEtarias);
    
    // 4. Gráfico de Barras - Concessões (TODAS)
    renderizarGraficoConcessoes(dadosGraficos.concessoes);
    
    // 5. Gráfico de Barras - Linhas de Cuidado (TODAS)
    renderizarGraficoLinhas(dadosGraficos.linhas);
    
    console.log('[DASH HOSP] Todos os gráficos renderizados');
}

/**
 * Destruir gráficos existentes
 */
function destruirGraficosExistentes() {
    const charts = ['chartTipoLeito', 'chartGenero', 'chartIdade', 'chartConcessoes', 'chartLinhas'];
    
    charts.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const chart = Chart.getChart(canvas);
            if (chart) {
                chart.destroy();
            }
        }
    });
}

/**
 * Gráfico de Pizza - Tipo de Leito
 */
function renderizarGraficoTipoLeito(kpis) {
    const canvas = document.getElementById('chartTipoLeito');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = {
        labels: ['Apartamentos', 'Enfermarias'],
        datasets: [{
            data: [kpis.apartamentosOcupados, kpis.enfermariasOcupadas],
            backgroundColor: ['#3b82f6', '#8b5cf6'],
            borderWidth: 0
        }]
    };
    
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Criar legenda HTML customizada
    criarLegendaHTML('legendaTipoLeito', data.labels, data.datasets[0].backgroundColor, data.datasets[0].data);
}

/**
 * Gráfico de Barras - Gênero
 */
function renderizarGraficoGenero(kpis) {
    const canvas = document.getElementById('chartGenero');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Masculino', 'Feminino'],
            datasets: [{
                data: [kpis.masculino, kpis.feminino],
                backgroundColor: ['#3b82f6', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de Barras - Faixa Etária
 */
function renderizarGraficoIdade(faixasEtarias) {
    const canvas = document.getElementById('chartIdade');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = Object.keys(faixasEtarias);
    const data = Object.values(faixasEtarias);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: '#22c55e',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de Barras - Concessões (TODAS)
 */
function renderizarGraficoConcessoes(concessoes) {
    const canvas = document.getElementById('chartConcessoes');
    if (!canvas) return;
    
    if (concessoes.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af;">Nenhuma concessão registrada</p>';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const labels = concessoes.map(c => c[0]);
    const data = concessoes.map(c => c[1]);
    const cores = labels.map(label => buscarCorConcessao(label));
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af',
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML customizada (vertical)
    criarLegendaVertical('legendaConcessoes', labels, cores, data);
}

/**
 * Gráfico de Barras - Linhas de Cuidado (TODAS)
 */
function renderizarGraficoLinhas(linhas) {
    const canvas = document.getElementById('chartLinhas');
    if (!canvas) return;
    
    if (linhas.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af;">Nenhuma linha de cuidado registrada</p>';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const labels = linhas.map(l => l[0]);
    const data = linhas.map(l => l[1]);
    const cores = labels.map(label => buscarCorLinha(label));
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af',
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML customizada (vertical)
    criarLegendaVertical('legendaLinhas', labels, cores, data);
}

/**
 * Criar legenda HTML customizada (horizontal para gráficos simples)
 */
function criarLegendaHTML(containerId, labels, colors, values) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="legend-items">';
    
    labels.forEach((label, index) => {
        html += `
            <div class="legend-item">
                <span class="legend-color" style="background-color: ${colors[index]}"></span>
                <span class="legend-label">${label}</span>
                <span class="legend-value">(${values[index]})</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Criar legenda HTML customizada vertical (estilo antigo)
 */
function criarLegendaVertical(containerId, labels, colors, values) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="legend-items-vertical">';
    
    labels.forEach((label, index) => {
        html += `
            <div class="legend-item-vertical">
                <span class="legend-color" style="background-color: ${colors[index]}"></span>
                <span class="legend-label">${label}</span>
                <span class="legend-value">(${values[index]})</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Buscar cor da concessão
 */
function buscarCorConcessao(nome) {
    if (window.CORES_CONCESSOES && window.CORES_CONCESSOES[nome]) {
        return window.CORES_CONCESSOES[nome];
    }
    
    // Se tiver a função de busca inteligente
    if (window.buscarCorConcessao) {
        return window.buscarCorConcessao(nome);
    }
    
    return '#666666';
}

/**
 * Buscar cor da linha de cuidado
 */
function buscarCorLinha(nome) {
    if (window.CORES_LINHAS && window.CORES_LINHAS[nome]) {
        return window.CORES_LINHAS[nome];
    }
    
    // Se tiver a função de busca inteligente
    if (window.buscarCorLinha) {
        return window.buscarCorLinha(nome);
    }
    
    // Tentar com Colorproctologia/Coloproctologia
    if (nome === 'Colorproctologia' && window.CORES_LINHAS && window.CORES_LINHAS['Coloproctologia']) {
        return window.CORES_LINHAS['Coloproctologia'];
    }
    
    return '#666666';
}

// Alias para compatibilidade
window.renderizarDashboard = window.renderizarDashboardHospital;

console.log('[DASH HOSP] Dashboard Hospitalar V3.3.2 Clássico carregado');
