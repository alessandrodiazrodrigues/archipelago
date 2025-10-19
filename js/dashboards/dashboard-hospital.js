// =================== DASHBOARD HOSPITALAR V3.3.2 ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3.2 CORRIGIDA - Compatível com app.js
// ==================================================================================

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
            renderizarGraficos(dadosGraficos);
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
    const apartamentos = leitos.filter(l => l.tipo === 'Apartamento' || l.categoria === 'Apartamento').length;
    const enfermarias = leitos.filter(l => l.tipo === 'Enfermaria' || l.categoria === 'Enfermaria').length;
    const hibridos = leitos.filter(l => l.tipo === 'Híbrido').length;
    
    // KPIs ocupados por tipo
    const apartamentosOcupados = leitos.filter(l => 
        (l.tipo === 'Apartamento' || l.categoria === 'Apartamento') && l.status === 'ocupado'
    ).length;
    const enfermariasOcupadas = leitos.filter(l => 
        (l.tipo === 'Enfermaria' || l.categoria === 'Enfermaria') && l.status === 'ocupado'
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
    
    // 3. Dados para gráfico de linhas de cuidado (top 15)
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
        .slice(0, 15);
    
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
    
    // 5. Dados para gráfico de PPS (Performance Status)
    const ppsDistribuicao = {
        '100%': 0,
        '90%': 0,
        '80%': 0,
        '70%': 0,
        '60%': 0,
        '50%': 0,
        '40%': 0,
        '30%': 0,
        '20%': 0,
        '10%': 0
    };
    
    leitosOcupados.forEach(leito => {
        if (leito.pps && ppsDistribuicao.hasOwnProperty(leito.pps)) {
            ppsDistribuicao[leito.pps]++;
        }
    });
    
    return {
        regioes,
        concessoesTop,
        linhasTop,
        faixasEtarias,
        ppsDistribuicao
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
                            <span class="kpi-value">${kpis.apartamentosOcupados + kpis.enfermariasOcupadas}/${kpis.hibridos}</span>
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
                
                <!-- Complexidade -->
                <div class="kpi-group">
                    <h4>Complexidade</h4>
                    <div class="kpi-items">
                        <div class="kpi-item">
                            <span class="kpi-label">I:</span>
                            <span class="kpi-value">${kpis.complexidadeI}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">II:</span>
                            <span class="kpi-value">${kpis.complexidadeII}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">III:</span>
                            <span class="kpi-value">${kpis.complexidadeIII}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">IV:</span>
                            <span class="kpi-value">${kpis.complexidadeIV}</span>
                        </div>
                        <div class="kpi-item">
                            <span class="kpi-label">V:</span>
                            <span class="kpi-value">${kpis.complexidadeV}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Diretivas e SPICT -->
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
                <!-- Primeira linha de gráficos -->
                <div class="charts-row">
                    <!-- Gráfico de Regiões -->
                    <div class="chart-wrapper">
                        <h3>Distribuição por Região</h3>
                        <div class="chart-container">
                            <canvas id="chartRegioes"></canvas>
                        </div>
                    </div>
                    
                    <!-- Gráfico de Faixa Etária -->
                    <div class="chart-wrapper">
                        <h3>Distribuição por Faixa Etária</h3>
                        <div class="chart-container">
                            <canvas id="chartIdade"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Segunda linha de gráficos -->
                <div class="charts-row">
                    <!-- Gráfico de Concessões -->
                    <div class="chart-wrapper">
                        <h3>Top 10 Concessões de Alta</h3>
                        <div class="chart-container">
                            <canvas id="chartConcessoes"></canvas>
                        </div>
                    </div>
                    
                    <!-- Gráfico de PPS -->
                    <div class="chart-wrapper">
                        <h3>Distribuição PPS (Performance Status)</h3>
                        <div class="chart-container">
                            <canvas id="chartPPS"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Terceira linha - gráfico maior -->
                <div class="charts-row">
                    <div class="chart-wrapper chart-wide">
                        <h3>Top 15 Linhas de Cuidado</h3>
                        <div class="chart-container">
                            <canvas id="chartLinhas"></canvas>
                        </div>
                    </div>
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
function renderizarGraficos(dadosGraficos) {
    console.log('[DASH HOSP] Iniciando renderização dos gráficos');
    
    // Destruir gráficos existentes
    destruirGraficosExistentes();
    
    // 1. Gráfico de Regiões
    renderizarGraficoRegioes(dadosGraficos.regioes);
    
    // 2. Gráfico de Faixa Etária
    renderizarGraficoIdade(dadosGraficos.faixasEtarias);
    
    // 3. Gráfico de Concessões
    renderizarGraficoConcessoes(dadosGraficos.concessoesTop);
    
    // 4. Gráfico de PPS
    renderizarGraficoPPS(dadosGraficos.ppsDistribuicao);
    
    // 5. Gráfico de Linhas de Cuidado
    renderizarGraficoLinhas(dadosGraficos.linhasTop);
    
    console.log('[DASH HOSP] ✅ Todos os gráficos renderizados');
}

/**
 * Destruir gráficos existentes
 */
function destruirGraficosExistentes() {
    const charts = ['chartRegioes', 'chartIdade', 'chartConcessoes', 'chartPPS', 'chartLinhas'];
    
    charts.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas && canvas.chart) {
            canvas.chart.destroy();
        }
    });
}

/**
 * Gráfico de Regiões (Pizza)
 */
function renderizarGraficoRegioes(regioes) {
    const ctx = document.getElementById('chartRegioes');
    if (!ctx) return;
    
    const labels = Object.keys(regioes);
    const data = Object.values(regioes);
    
    // Cores para as regiões
    const cores = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ];
    
    ctx.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Gráfico de Faixa Etária (Barras)
 */
function renderizarGraficoIdade(faixasEtarias) {
    const ctx = document.getElementById('chartIdade');
    if (!ctx) return;
    
    const labels = Object.keys(faixasEtarias);
    const data = Object.values(faixasEtarias);
    
    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
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
                        stepSize: 1
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
 * Gráfico de Concessões (Barras Horizontais)
 */
function renderizarGraficoConcessoes(concessoesTop) {
    const ctx = document.getElementById('chartConcessoes');
    if (!ctx) return;
    
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
    
    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Concessões',
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
                        stepSize: 1
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
 * Gráfico de PPS (Linha)
 */
function renderizarGraficoPPS(ppsDistribuicao) {
    const ctx = document.getElementById('chartPPS');
    if (!ctx) return;
    
    const labels = Object.keys(ppsDistribuicao).reverse();
    const data = labels.map(l => ppsDistribuicao[l]);
    
    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes por PPS',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
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
 * Gráfico de Linhas de Cuidado (Barras Horizontais)
 */
function renderizarGraficoLinhas(linhasTop) {
    const ctx = document.getElementById('chartLinhas');
    if (!ctx) return;
    
    const labels = linhasTop.map(l => l[0]);
    const data = linhasTop.map(l => l[1]);
    
    // Buscar cores das linhas de cuidado
    const cores = labels.map(label => {
        const cor = window.CORES_LINHAS && window.CORES_LINHAS[label];
        if (!cor) {
            console.warn(`[CORES] Cor não encontrada para linha: "${label}"`);
            return '#666666';
        }
        return cor;
    });
    
    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Linhas de Cuidado',
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
                        stepSize: 1
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
        prepararDadosGraficos: prepararDadosGraficos
    }
};

console.log('[DASH HOSP] ✅ Dashboard Hospitalar V3.3.2 carregado com sucesso');
console.log('[DASH HOSP] Funções disponíveis: renderizarDashboardHospital, renderizarDashboard');
