// =================== DASHBOARD HOSPITALAR V3.3.2 - ESTILO CORRETO ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3.2 - Com gráficos no estilo correto e legendas HTML
// ==================================================================================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar' },
    H5: { concessoes: 'bar', linhas: 'bar' }
};

// Estado global para fundo branco
window.fundoBranco = false;

/**
 * Renderiza o dashboard para um hospital específico
 * @param {string} hospitalId - ID do hospital (H1, H2, H3, H4, H5)
 */
function renderizarDashboard(hospitalId) {
    console.log(`[DASH HOSP] Iniciando renderização para ${hospitalId}`);
    
    try {
        // Verificar se temos dados
        if (!window.hospitalData || !window.hospitalData[hospitalId]) {
            console.error(`[DASH HOSP] Dados não encontrados para ${hospitalId}`);
            document.getElementById('dashHospitalarContent').innerHTML = 
                '<div class="error-message">Nenhum dado disponível para este hospital</div>';
            return;
        }
        
        const hospital = window.hospitalData[hospitalId];
        console.log('[DASH HOSP] Dados do hospital:', hospital);
        
        // Mapear nome correto do hospital
        const nomeHospital = getNomeHospital(hospitalId);
        
        // Calcular todos os KPIs
        const kpis = calcularKPIs(hospital);
        console.log('[DASH HOSP] KPIs calculados:', kpis);
        
        // Preparar dados para gráficos
        const dadosGraficos = prepararDadosGraficos(hospital);
        console.log('[DASH HOSP] Dados dos gráficos preparados');
        
        // Renderizar HTML
        const html = gerarHTMLDashboard(hospitalId, nomeHospital, kpis, dadosGraficos);
        document.getElementById('dashHospitalarContent').innerHTML = html;
        
        // Aguardar DOM e renderizar gráficos
        setTimeout(() => {
            window.renderizarGraficos(hospitalId, dadosGraficos, kpis);
            
            // Adicionar event listeners para os toggles
            adicionarEventListenersToggles(hospitalId);
        }, 100);
        
        console.log(`[DASH HOSP] ✅ Dashboard renderizado com sucesso para ${hospitalId}`);
        
    } catch (error) {
        console.error('[DASH HOSP] Erro ao renderizar dashboard:', error);
        document.getElementById('dashHospitalarContent').innerHTML = 
            '<div class="error-message">Erro ao carregar dashboard. Por favor, recarregue a página.</div>';
    }
}

/**
 * Retorna o nome correto do hospital
 */
function getNomeHospital(hospitalId) {
    const nomes = {
        'H1': 'Neomater',
        'H2': 'Cruz Azul',
        'H3': 'Santa Marcelina',
        'H4': 'Santa Clara',
        'H5': 'Hospital Adventista'
    };
    return nomes[hospitalId] || hospitalId;
}

/**
 * Calcula os KPIs do hospital
 */
function calcularKPIs(hospital) {
    const leitos = hospital.leitos || [];
    const totalLeitos = leitos.length;
    
    // KPIs básicos
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const vagos = totalLeitos - ocupados;
    const taxaOcupacao = totalLeitos > 0 ? Math.round((ocupados / totalLeitos) * 100) : 0;
    
    // KPIs por tipo
    const apartamentos = leitos.filter(l => 
        l.tipo === 'Apartamento' || l.categoria === 'Apartamento' || 
        (l.tipo === 'Híbrido' && l.categoriaEscolhida === 'Apartamento')
    ).length;
    
    const enfermarias = leitos.filter(l => 
        l.tipo === 'Enfermaria' || l.categoria === 'Enfermaria' ||
        (l.tipo === 'Híbrido' && l.categoriaEscolhida === 'Enfermaria')
    ).length;
    
    const hibridos = leitos.filter(l => l.tipo === 'Híbrido').length;
    
    // KPIs ocupados por tipo
    const apartamentosOcupados = leitos.filter(l => 
        l.status === 'ocupado' && (
            l.tipo === 'Apartamento' || l.categoria === 'Apartamento' ||
            (l.tipo === 'Híbrido' && l.categoriaEscolhida === 'Apartamento')
        )
    ).length;
    
    const enfermariasOcupadas = leitos.filter(l => 
        l.status === 'ocupado' && (
            l.tipo === 'Enfermaria' || l.categoria === 'Enfermaria' ||
            (l.tipo === 'Híbrido' && l.categoriaEscolhida === 'Enfermaria')
        )
    ).length;
    
    // KPIs de isolamento
    const isolamentoContato = leitos.filter(l => 
        l.status === 'ocupado' && l.isolamento === 'Isolamento de Contato'
    ).length;
    const isolamentoRespiratorio = leitos.filter(l => 
        l.status === 'ocupado' && l.isolamento === 'Isolamento Respiratório'
    ).length;
    const totalIsolamento = isolamentoContato + isolamentoRespiratorio;
    
    // KPIs de gênero
    const masculino = leitos.filter(l => l.status === 'ocupado' && l.genero === 'Masculino').length;
    const feminino = leitos.filter(l => l.status === 'ocupado' && l.genero === 'Feminino').length;
    
    // KPIs de idade
    const idadeTotal = leitos
        .filter(l => l.status === 'ocupado' && l.idade)
        .reduce((sum, l) => sum + parseInt(l.idade), 0);
    const idadeCount = leitos.filter(l => l.status === 'ocupado' && l.idade).length;
    const idadeMedia = idadeCount > 0 ? Math.round(idadeTotal / idadeCount) : 0;
    
    // KPIs de complexidade
    const complexidadeI = leitos.filter(l => l.status === 'ocupado' && l.complexidade === 'I').length;
    const complexidadeII = leitos.filter(l => l.status === 'ocupado' && l.complexidade === 'II').length;
    const complexidadeIII = leitos.filter(l => l.status === 'ocupado' && l.complexidade === 'III').length;
    const complexidadeIV = leitos.filter(l => l.status === 'ocupado' && l.complexidade === 'IV').length;
    const complexidadeV = leitos.filter(l => l.status === 'ocupado' && l.complexidade === 'V').length;
    
    // KPIs de diretivas
    const diretivasSim = leitos.filter(l => l.status === 'ocupado' && l.diretivas === 'Sim').length;
    const diretivasNao = leitos.filter(l => l.status === 'ocupado' && l.diretivas === 'Não').length;
    
    // KPIs de SPICT
    const spictElegivel = leitos.filter(l => l.status === 'ocupado' && l.spict === 'elegivel').length;
    const spictNaoElegivel = leitos.filter(l => l.status === 'ocupado' && l.spict === 'nao_elegivel').length;
    
    // KPIs de previsão de alta
    const altaHoje = leitos.filter(l => 
        l.status === 'ocupado' && l.prevAlta && l.prevAlta.includes('Hoje')
    ).length;
    const alta24h = leitos.filter(l => l.status === 'ocupado' && l.prevAlta === '24H').length;
    const alta48h = leitos.filter(l => l.status === 'ocupado' && l.prevAlta === '48H').length;
    
    return {
        totalLeitos,
        ocupados,
        vagos,
        taxaOcupacao,
        apartamentos,
        enfermarias,
        hibridos,
        apartamentosOcupados,
        enfermariasOcupadas,
        isolamentoContato,
        isolamentoRespiratorio,
        totalIsolamento,
        masculino,
        feminino,
        idadeMedia,
        complexidadeI,
        complexidadeII,
        complexidadeIII,
        complexidadeIV,
        complexidadeV,
        diretivasSim,
        diretivasNao,
        spictElegivel,
        spictNaoElegivel,
        altaHoje,
        alta24h,
        alta48h
    };
}

/**
 * Prepara dados para os gráficos
 */
function prepararDadosGraficos(hospital) {
    const leitos = hospital.leitos || [];
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado');
    
    // 1. Dados para gráfico de distribuição por região
    const regioes = {};
    leitosOcupados.forEach(leito => {
        const regiao = leito.regiao || 'Não informado';
        regioes[regiao] = (regioes[regiao] || 0) + 1;
    });
    
    // 2. Dados para gráfico de concessões (top 10)
    const concessoes = {};
    leitosOcupados.forEach(leito => {
        if (leito.concessoes && Array.isArray(leito.concessoes)) {
            leito.concessoes.forEach(concessao => {
                concessoes[concessao] = (concessoes[concessao] || 0) + 1;
            });
        }
    });
    
    const concessoesTop = Object.entries(concessoes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    // 3. Dados para gráfico de linhas de cuidado (top 10)
    const linhasCuidado = {};
    leitosOcupados.forEach(leito => {
        if (leito.linhas && Array.isArray(leito.linhas)) {
            leito.linhas.forEach(linha => {
                linhasCuidado[linha] = (linhasCuidado[linha] || 0) + 1;
            });
        }
    });
    
    const linhasTop = Object.entries(linhasCuidado)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    // 4. Dados para gráfico de faixa etária
    const faixasEtarias = {
        '0-17': 0,
        '18-30': 0,
        '31-50': 0,
        '51-65': 0,
        '66-80': 0,
        '80+': 0
    };
    
    leitosOcupados.forEach(leito => {
        const idade = parseInt(leito.idade);
        if (!isNaN(idade)) {
            if (idade <= 17) faixasEtarias['0-17']++;
            else if (idade <= 30) faixasEtarias['18-30']++;
            else if (idade <= 50) faixasEtarias['31-50']++;
            else if (idade <= 65) faixasEtarias['51-65']++;
            else if (idade <= 80) faixasEtarias['66-80']++;
            else faixasEtarias['80+']++;
        }
    });
    
    return {
        regioes,
        concessoesTop,
        linhasTop,
        faixasEtarias
    };
}

/**
 * Gera o HTML do dashboard
 */
function gerarHTMLDashboard(hospitalId, nomeHospital, kpis, dadosGraficos) {
    return `
        <div class="dashboard-container">
            <!-- HEADER -->
            <div class="dashboard-header">
                <h2>Dashboard Hospitalar - ${nomeHospital}</h2>
                <div class="dashboard-controls">
                    <button id="toggleFundo" onclick="toggleFundoBranco()" class="btn-toggle-fundo">
                        ${window.fundoBranco ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
                    </button>
                </div>
                <div class="dashboard-subtitle">
                    <span>Total de Leitos: ${kpis.totalLeitos}</span>
                    <span class="separator">|</span>
                    <span>Taxa de Ocupação: ${kpis.taxaOcupacao}%</span>
                </div>
            </div>
            
            <!-- KPIS PRINCIPAIS -->
            <div class="kpis-grid">
                <!-- Ocupação -->
                <div class="kpi-card kpi-ocupacao">
                    <div class="kpi-icon">🏥</div>
                    <div class="kpi-info">
                        <h3>Ocupação</h3>
                        <div class="kpi-value">${kpis.ocupados}/${kpis.totalLeitos}</div>
                        <div class="kpi-percentage">${kpis.taxaOcupacao}%</div>
                    </div>
                </div>
                
                <!-- Vagos -->
                <div class="kpi-card kpi-vagos">
                    <div class="kpi-icon">✅</div>
                    <div class="kpi-info">
                        <h3>Leitos Vagos</h3>
                        <div class="kpi-value">${kpis.vagos}</div>
                        <div class="kpi-percentage">${100 - kpis.taxaOcupacao}%</div>
                    </div>
                </div>
                
                <!-- Isolamento -->
                <div class="kpi-card kpi-isolamento">
                    <div class="kpi-icon">⚠️</div>
                    <div class="kpi-info">
                        <h3>Em Isolamento</h3>
                        <div class="kpi-value">${kpis.totalIsolamento}</div>
                        <div class="kpi-detail">
                            <span>Contato: ${kpis.isolamentoContato}</span>
                            <span>Respiratório: ${kpis.isolamentoRespiratorio}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Previsão Alta Hoje -->
                <div class="kpi-card kpi-alta">
                    <div class="kpi-icon">🏠</div>
                    <div class="kpi-info">
                        <h3>Alta Hoje</h3>
                        <div class="kpi-value">${kpis.altaHoje}</div>
                        <div class="kpi-detail">
                            <span>24H: ${kpis.alta24h}</span>
                            <span>48H: ${kpis.alta48h}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- KPIS SECUNDÁRIOS -->
            <div class="kpis-secondary">
                <!-- Distribuição por Tipo -->
                <div class="kpi-group">
                    <h4>Distribuição por Tipo</h4>
                    <div class="kpi-items">
                        <div class="kpi-item">
                            <span class="kpi-label">Apartamentos:</span>
                            <span class="kpi-value">${kpis.apartamentosOcupados}/${kpis.apartamentos}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">Enfermarias:</span>
                            <span class="kpi-value">${kpis.enfermariasOcupadas}/${kpis.enfermarias}</span>
                        </div>
                        ${kpis.hibridos > 0 ? `
                        <div class="kpi-item">
                            <span class="kpi-label">Híbridos:</span>
                            <span class="kpi-value">${kpis.ocupados}/${kpis.hibridos}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Distribuição por Gênero -->
                <div class="kpi-group">
                    <h4>Distribuição por Gênero</h4>
                    <div class="kpi-items">
                        <div class="kpi-item">
                            <span class="kpi-label">Masculino:</span>
                            <span class="kpi-value">${kpis.masculino}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">Feminino:</span>
                            <span class="kpi-value">${kpis.feminino}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Indicadores Paliativos -->
                <div class="kpi-group">
                    <h4>Indicadores Paliativos</h4>
                    <div class="kpi-items">
                        <div class="kpi-item">
                            <span class="kpi-label">Diretivas (Sim):</span>
                            <span class="kpi-value">${kpis.diretivasSim}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">SPICT Elegível:</span>
                            <span class="kpi-value">${kpis.spictElegivel}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">Idade Média:</span>
                            <span class="kpi-value">${kpis.idadeMedia} anos</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- GRÁFICOS -->
            <div class="charts-container">
                <!-- Gráfico de Pizza - Ocupação por Tipo -->
                <div class="chart-wrapper">
                    <h3>Ocupação por Tipo de Leito</h3>
                    <div class="chart-container">
                        <canvas id="chartTipoLeito"></canvas>
                    </div>
                    <div id="legendaTipoLeito" class="chart-legend"></div>
                </div>
                
                <!-- Gráfico de Barras - Gênero -->
                <div class="chart-wrapper">
                    <h3>Distribuição por Gênero</h3>
                    <div class="chart-container">
                        <canvas id="chartGenero"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Barras - Faixa Etária -->
                <div class="chart-wrapper">
                    <h3>Distribuição por Faixa Etária</h3>
                    <div class="chart-container">
                        <canvas id="chartIdade"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Concessões com Toggle -->
                <div class="chart-wrapper chart-wide">
                    <h3>Top 10 Concessões de Alta</h3>
                    <div class="chart-toggle">
                        <button onclick="toggleGrafico('${hospitalId}', 'concessoes', 'bar')" 
                                class="toggle-btn ${window.graficosState[hospitalId].concessoes === 'bar' ? 'active' : ''}">
                            📊 Barras
                        </button>
                        <button onclick="toggleGrafico('${hospitalId}', 'concessoes', 'polar')" 
                                class="toggle-btn ${window.graficosState[hospitalId].concessoes === 'polar' ? 'active' : ''}">
                            🎯 Polar
                        </button>
                        <button onclick="toggleGrafico('${hospitalId}', 'concessoes', 'radar')" 
                                class="toggle-btn ${window.graficosState[hospitalId].concessoes === 'radar' ? 'active' : ''}">
                            🕸️ Radar
                        </button>
                    </div>
                    <div class="chart-container">
                        <canvas id="chartConcessoes"></canvas>
                    </div>
                    <div id="legendaConcessoes" class="chart-legend"></div>
                </div>
                
                <!-- Gráfico de Linhas com Toggle -->
                <div class="chart-wrapper chart-wide">
                    <h3>Top 10 Linhas de Cuidado</h3>
                    <div class="chart-toggle">
                        <button onclick="toggleGrafico('${hospitalId}', 'linhas', 'bar')" 
                                class="toggle-btn ${window.graficosState[hospitalId].linhas === 'bar' ? 'active' : ''}">
                            📊 Barras
                        </button>
                        <button onclick="toggleGrafico('${hospitalId}', 'linhas', 'polar')" 
                                class="toggle-btn ${window.graficosState[hospitalId].linhas === 'polar' ? 'active' : ''}">
                            🎯 Polar
                        </button>
                        <button onclick="toggleGrafico('${hospitalId}', 'linhas', 'radar')" 
                                class="toggle-btn ${window.graficosState[hospitalId].linhas === 'radar' ? 'active' : ''}">
                            🕸️ Radar
                        </button>
                    </div>
                    <div class="chart-container">
                        <canvas id="chartLinhas"></canvas>
                    </div>
                    <div id="legendaLinhas" class="chart-legend"></div>
                </div>
            </div>
            
            <!-- FOOTER DO DASHBOARD -->
            <div class="dashboard-footer">
                <p>Última atualização: ${new Date().toLocaleString('pt-BR')}</p>
                <p>Dashboard Hospitalar ${nomeHospital} - Archipelago V3.3.2</p>
            </div>
        </div>
    `;
}

/**
 * Renderiza todos os gráficos
 */
window.renderizarGraficos = function(hospitalId, dadosGraficos, kpis) {
    console.log('[DASH HOSP] Iniciando renderização dos gráficos');
    
    // Destruir gráficos existentes
    window.destruirGraficosExistentes();
    
    // 1. Gráfico de Pizza - Tipo de Leito
    window.renderizarGraficoTipoLeito(kpis);
    
    // 2. Gráfico de Barras - Gênero
    window.renderizarGraficoGenero(kpis);
    
    // 3. Gráfico de Barras - Faixa Etária
    window.renderizarGraficoIdade(dadosGraficos.faixasEtarias);
    
    // 4. Gráfico de Concessões (com toggle)
    window.renderizarGraficoConcessoes(hospitalId, dadosGraficos.concessoesTop);
    
    // 5. Gráfico de Linhas de Cuidado (com toggle)
    window.renderizarGraficoLinhas(hospitalId, dadosGraficos.linhasTop);
    
    console.log('[DASH HOSP] ✅ Todos os gráficos renderizados');
};

/**
 * Destruir gráficos existentes
 */
window.destruirGraficosExistentes = function() {
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
};

/**
 * Gráfico de Pizza - Tipo de Leito
 */
window.renderizarGraficoTipoLeito = function(kpis) {
    const ctx = document.getElementById('chartTipoLeito');
    if (!ctx) return;
    
    const data = {
        labels: ['Apartamentos', 'Enfermarias'],
        datasets: [{
            data: [kpis.apartamentosOcupados, kpis.enfermariasOcupadas],
            backgroundColor: ['#36A2EB', '#FF6384'],
            borderWidth: 2,
            borderColor: window.fundoBranco ? '#333' : '#fff'
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = kpis.ocupados;
                            const value = context.parsed;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Criar legenda HTML customizada
    window.criarLegendaHTML('legendaTipoLeito', data.labels, data.datasets[0].backgroundColor, data.datasets[0].data);
};

/**
 * Gráfico de Barras - Gênero
 */
window.renderizarGraficoGenero = function(kpis) {
    const ctx = document.getElementById('chartGenero');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Masculino', 'Feminino'],
            datasets: [{
                data: [kpis.masculino, kpis.feminino],
                backgroundColor: ['#36A2EB', '#FF6384'],
                borderColor: ['#2980B9', '#E74C3C'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: window.fundoBranco ? '#333' : '#ccc'
                    },
                    grid: {
                        color: window.fundoBranco ? '#ddd' : 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: window.fundoBranco ? '#333' : '#ccc'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Gráfico de Barras - Faixa Etária
 */
window.renderizarGraficoIdade = function(faixasEtarias) {
    const ctx = document.getElementById('chartIdade');
    if (!ctx) return;
    
    const labels = Object.keys(faixasEtarias);
    const data = Object.values(faixasEtarias);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: '#36A2EB',
                borderColor: '#2980B9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: window.fundoBranco ? '#333' : '#ccc'
                    },
                    grid: {
                        color: window.fundoBranco ? '#ddd' : 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: window.fundoBranco ? '#333' : '#ccc'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Gráfico de Concessões (com toggle)
 */
window.renderizarGraficoConcessoes = function(hospitalId, concessoesTop) {
    const ctx = document.getElementById('chartConcessoes');
    if (!ctx) return;
    
    const tipo = window.graficosState[hospitalId].concessoes;
    const labels = concessoesTop.map(c => c[0]);
    const data = concessoesTop.map(c => c[1]);
    
    // Buscar cores das concessões
    const cores = labels.map(label => {
        const cor = window.CORES_CONCESSOES && window.CORES_CONCESSOES[label];
        if (!cor) {
            console.warn(`[CORES] Cor não encontrada para concessão: "${label}"`);
            return '#999999';
        }
        return cor;
    });
    
    // Destruir gráfico anterior
    const chartExistente = Chart.getChart(ctx);
    if (chartExistente) {
        chartExistente.destroy();
    }
    
    let config;
    
    if (tipo === 'bar') {
        config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: cores,
                    borderColor: cores.map(c => c + '99'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: window.fundoBranco ? '#333' : '#ccc'
                        },
                        grid: {
                            color: window.fundoBranco ? '#ddd' : 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: window.fundoBranco ? '#333' : '#ccc'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    } else if (tipo === 'polar') {
        config = {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: cores.map(c => c + 'CC'),
                    borderColor: cores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    } else if (tipo === 'radar') {
        config = {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: cores[0] + '33',
                    borderColor: cores[0],
                    borderWidth: 2,
                    pointBackgroundColor: cores[0],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: cores[0]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    }
    
    new Chart(ctx, config);
    
    // Criar legenda HTML customizada
    if (tipo === 'bar') {
        window.criarLegendaHTML('legendaConcessoes', labels, cores, data);
    } else {
        document.getElementById('legendaConcessoes').innerHTML = '';
    }
};

/**
 * Gráfico de Linhas de Cuidado (com toggle)
 */
window.renderizarGraficoLinhas = function(hospitalId, linhasTop) {
    const ctx = document.getElementById('chartLinhas');
    if (!ctx) return;
    
    const tipo = window.graficosState[hospitalId].linhas;
    const labels = linhasTop.map(l => l[0]);
    const data = linhasTop.map(l => l[1]);
    
    // Buscar cores das linhas de cuidado
    const cores = labels.map(label => {
        // Tentar busca direta
        let cor = window.CORES_LINHAS && window.CORES_LINHAS[label];
        
        // Se não encontrar, tentar variações
        if (!cor) {
            // Tentar com Colorproctologia
            if (label === 'Colorproctologia' || label === 'Coloproctologia') {
                cor = window.CORES_LINHAS['Coloproctologia'] || window.CORES_LINHAS['Colorproctologia'];
            }
        }
        
        if (!cor) {
            console.warn(`[CORES] Cor não encontrada para linha: "${label}"`);
            return '#666666';
        }
        return cor;
    });
    
    // Destruir gráfico anterior
    const chartExistente = Chart.getChart(ctx);
    if (chartExistente) {
        chartExistente.destroy();
    }
    
    let config;
    
    if (tipo === 'bar') {
        config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: cores,
                    borderColor: cores.map(c => c + '99'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: window.fundoBranco ? '#333' : '#ccc'
                        },
                        grid: {
                            color: window.fundoBranco ? '#ddd' : 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: window.fundoBranco ? '#333' : '#ccc'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    } else if (tipo === 'polar') {
        config = {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: cores.map(c => c + 'CC'),
                    borderColor: cores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    } else if (tipo === 'radar') {
        config = {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: cores[0] + '33',
                    borderColor: cores[0],
                    borderWidth: 2,
                    pointBackgroundColor: cores[0],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: cores[0]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    }
    
    new Chart(ctx, config);
    
    // Criar legenda HTML customizada
    if (tipo === 'bar') {
        window.criarLegendaHTML('legendaLinhas', labels, cores, data);
    } else {
        document.getElementById('legendaLinhas').innerHTML = '';
    }
};

/**
 * Criar legenda HTML customizada
 */
window.criarLegendaHTML = function(containerId, labels, colors, values) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="legend-items">';
    
    labels.forEach((label, index) => {
        const color = colors[index];
        const value = values[index];
        
        html += `
            <div class="legend-item" onclick="toggleLegendItem(this, '${containerId}')" data-index="${index}">
                <span class="legend-color" style="background-color: ${color}"></span>
                <span class="legend-label">${label}</span>
                <span class="legend-value">(${value})</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Toggle item da legenda
 */
window.toggleLegendItem = function(element, containerId) {
    element.classList.toggle('disabled');
    
    // Encontrar o canvas associado
    let canvasId = '';
    if (containerId === 'legendaTipoLeito') canvasId = 'chartTipoLeito';
    else if (containerId === 'legendaConcessoes') canvasId = 'chartConcessoes';
    else if (containerId === 'legendaLinhas') canvasId = 'chartLinhas';
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const chart = Chart.getChart(canvas);
    if (!chart) return;
    
    const index = parseInt(element.dataset.index);
    const isHidden = element.classList.contains('disabled');
    
    // Toggle visibilidade dos dados
    if (chart.config.type === 'doughnut' || chart.config.type === 'polarArea') {
        const meta = chart.getDatasetMeta(0);
        meta.data[index].hidden = isHidden;
    } else {
        chart.toggleDataVisibility(index);
    }
    
    chart.update();
};

/**
 * Toggle tipo de gráfico
 */
window.toggleGrafico = function(hospitalId, tipo, novoTipo) {
    window.graficosState[hospitalId][tipo] = novoTipo;
    
    // Atualizar botões
    const buttons = document.querySelectorAll(`.chart-toggle button`);
    buttons.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes(tipo)) {
            btn.classList.remove('active');
            if (btn.onclick.toString().includes(novoTipo)) {
                btn.classList.add('active');
            }
        }
    });
    
    // Re-renderizar gráfico
    if (tipo === 'concessoes') {
        const hospital = window.hospitalData[hospitalId];
        const dados = prepararDadosGraficos(hospital);
        window.renderizarGraficoConcessoes(hospitalId, dados.concessoesTop);
    } else if (tipo === 'linhas') {
        const hospital = window.hospitalData[hospitalId];
        const dados = prepararDadosGraficos(hospital);
        window.renderizarGraficoLinhas(hospitalId, dados.linhasTop);
    }
};

/**
 * Toggle fundo branco
 */
window.toggleFundoBranco = function() {
    window.fundoBranco = !window.fundoBranco;
    
    // Atualizar classe do body
    if (window.fundoBranco) {
        document.body.classList.add('fundo-branco');
    } else {
        document.body.classList.remove('fundo-branco');
    }
    
    // Atualizar texto do botão
    const btn = document.getElementById('toggleFundo');
    if (btn) {
        btn.textContent = window.fundoBranco ? '🌙 Modo Escuro' : '☀️ Modo Claro';
    }
    
    // Re-renderizar dashboard atual
    const hospitalAtual = window.currentHospital || 'H1';
    renderizarDashboard(hospitalAtual);
};

/**
 * Adicionar event listeners para toggles
 */
function adicionarEventListenersToggles(hospitalId) {
    // Os event listeners são adicionados inline no HTML
    console.log('[DASH HOSP] Event listeners configurados para', hospitalId);
}

// =================== EXPORTS GLOBAIS ===================

// Definir a função com o nome que o app.js espera
window.renderizarDashboardHospital = renderizarDashboard;

// Também manter o nome original para compatibilidade
window.renderizarDashboard = renderizarDashboard;

// Para debug
window.dashboardHospitalar = {
    versao: 'V3.3.2',
    funcoes: {
        renderizar: renderizarDashboard,
        calcularKPIs: calcularKPIs,
        prepararDadosGraficos: prepararDadosGraficos,
        toggleGrafico: window.toggleGrafico,
        toggleFundoBranco: window.toggleFundoBranco,
        toggleLegendItem: window.toggleLegendItem
    }
};

console.log('[DASH HOSP] ✅ Dashboard Hospitalar V3.3.2 carregado com sucesso');
console.log('[DASH HOSP] Funções disponíveis: renderizarDashboardHospital, renderizarDashboard');
