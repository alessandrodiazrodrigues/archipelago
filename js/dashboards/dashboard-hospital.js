// =================== DASHBOARD HOSPITALAR V3.3 FINAL ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3 FINAL - Com todos os KPIs e gráficos solicitados
// =========================================================================

/**
 * 🎯 RENDERIZA O DASHBOARD HOSPITALAR COMPLETO
 * 
 * ✅ CORREÇÃO CRÍTICA: Nome da função corrigido para renderDashboardHospitalar
 * ✅ Renderiza TODOS os hospitais (ou apenas 1 se especificado)
 * ✅ 10 KPIs por hospital (5 básicos + 5 novos)
 * ✅ 6 gráficos por hospital (3 existentes + 3 novos)
 * ✅ Layout responsivo (desktop e mobile)
 * ✅ Legendas HTML customizadas com toggle
 * 
 * @param {string} hospitalId - ID do hospital ('H1'-'H5' ou 'todos')
 */
window.renderDashboardHospitalar = function(hospitalId = 'todos') {
    console.log('🏥 [DASHBOARD V3.3] Iniciando renderização para:', hospitalId);
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        console.error('❌ [DASHBOARD V3.3] Container não encontrado');
        return;
    }

    // Verificar se temos dados
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        console.error('❌ [DASHBOARD V3.3] Dados hospitalares não carregados');
        container.innerHTML = `
            <div class="loading-message">
                <div class="spinner"></div>
                <p>Carregando dados dos hospitais...</p>
            </div>
        `;
        return;
    }

    // Determinar quais hospitais renderizar
    let hospitaisParaRenderizar = [];
    
    if (hospitalId === 'todos') {
        // Renderizar TODOS os hospitais
        hospitaisParaRenderizar = Object.keys(window.hospitalData);
    } else if (window.hospitalData[hospitalId]) {
        // Renderizar apenas 1 hospital específico
        hospitaisParaRenderizar = [hospitalId];
    } else {
        console.error('❌ [DASHBOARD V3.3] Hospital não encontrado:', hospitalId);
        container.innerHTML = `
            <div class="error-message">
                <p>❌ Hospital não encontrado: ${hospitalId}</p>
            </div>
        `;
        return;
    }

    console.log('✅ [DASHBOARD V3.3] Hospitais a renderizar:', hospitaisParaRenderizar);

    // Construir HTML
    let html = '<div class="dashboard-hospitalar-container">';
    
    hospitaisParaRenderizar.forEach(hId => {
        const hospital = window.hospitalData[hId];
        if (!hospital || !hospital.leitos) return;
        
        html += renderizarHospitalCompleto(hId, hospital);
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Aguardar DOM e renderizar todos os gráficos
    setTimeout(() => {
        hospitaisParaRenderizar.forEach(hId => {
            renderizarGraficosHospital(hId);
        });
    }, 100);
    
    console.log('✅ [DASHBOARD V3.3] Renderização concluída');
};

/**
 * Renderiza um hospital completo (KPIs + Gráficos)
 */
function renderizarHospitalCompleto(hospitalId, hospital) {
    const kpis = calcularKPIsCompletos(hospital, hospitalId);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    return `
        <div class="hospital-section" id="hospital_${hospitalId}">
            <div class="hospital-header">
                <h2>${hospital.nome || hospitalId}</h2>
                <div class="hospital-stats">
                    <span>Total: ${kpis.total} leitos</span>
                    <span class="separator">|</span>
                    <span>Ocupação: ${kpis.taxaOcupacao}%</span>
                </div>
            </div>
            
            ${renderizarKPIs(kpis, hospitalId)}
            
            <div class="graficos-section">
                <h3 class="section-title">Gráficos e Indicadores - ${dataAtual}</h3>
                <div class="graficos-grid" id="graficos_${hospitalId}">
                    <!-- Gráficos existentes -->
                    <div class="grafico-container">
                        <h4>Análise Preditiva de Altas</h4>
                        <canvas id="chartAltas_${hospitalId}"></canvas>
                        <div class="custom-legend" id="legendaAltas_${hospitalId}"></div>
                    </div>
                    
                    <div class="grafico-container">
                        <h4>Concessões Previstas</h4>
                        <canvas id="chartConcessoes_${hospitalId}"></canvas>
                        <div class="custom-legend" id="legendaConcessoes_${hospitalId}"></div>
                    </div>
                    
                    <div class="grafico-container">
                        <h4>Linhas de Cuidado</h4>
                        <canvas id="chartLinhas_${hospitalId}"></canvas>
                        <div class="custom-legend" id="legendaLinhas_${hospitalId}"></div>
                    </div>
                    
                    <!-- Novos gráficos V3.3 -->
                    <div class="grafico-container">
                        <h4>Beneficiários por Região</h4>
                        <canvas id="chartRegiao_${hospitalId}"></canvas>
                        <div class="custom-legend" id="legendaRegiao_${hospitalId}"></div>
                    </div>
                    
                    <div class="grafico-container">
                        <h4>Idade dos Beneficiários</h4>
                        <canvas id="chartIdade_${hospitalId}"></canvas>
                    </div>
                    
                    <div class="grafico-container">
                        <h4>Tipo de Ocupação</h4>
                        <canvas id="chartTipo_${hospitalId}"></canvas>
                        <div class="custom-legend" id="legendaTipo_${hospitalId}"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 📊 CALCULA TODOS OS KPIs DO HOSPITAL
 * Inclui KPIs básicos + novos KPIs V3.3
 */
function calcularKPIsCompletos(hospital, hospitalId) {
    const leitos = hospital.leitos || [];
    const total = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso').length;
    const vagos = total - ocupados;
    
    // KPIs básicos
    const emAlta = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') &&
        l.prevAlta && (
            l.prevAlta.includes('Hoje') || 
            l.prevAlta === 'Hoje Ouro' || 
            l.prevAlta === 'Hoje 2R' || 
            l.prevAlta === 'Hoje 3R'
        )
    ).length;
    
    const taxaOcupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    // Novo KPI: Apartamentos/Enfermarias
    const apartamentosOcupados = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') && 
        (l.tipo === 'APTO' || l.tipo === 'Apartamento' || l.categoria_escolhida === 'Apartamento')
    ).length;
    
    const enfermariasOcupadas = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') && 
        (l.tipo === 'ENF' || l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria' || l.categoria_escolhida === 'Enfermaria')
    ).length;
    
    // Novo KPI: Isolamentos
    const isolamentoTotal = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') &&
        l.isolamento && l.isolamento !== 'Não Isolamento'
    ).length;
    
    const isolamentoResp = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') &&
        l.isolamento === 'Isolamento Respiratório'
    ).length;
    
    const isolamentoContato = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') &&
        l.isolamento === 'Isolamento de Contato'
    ).length;
    
    // Novo KPI: Diretivas
    const diretivasSim = leitos.filter(l => 
        (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') &&
        l.diretivas === 'Sim'
    ).length;
    
    // KPIs específicos por hospital
    const kpisEspecificos = calcularKPIsEspecificos(leitos, hospitalId);
    
    return {
        total,
        ocupados,
        vagos,
        emAlta,
        taxaOcupacao,
        apartamentosOcupados,
        enfermariasOcupadas,
        isolamentoTotal,
        isolamentoResp,
        isolamentoContato,
        diretivasSim,
        ...kpisEspecificos
    };
}

/**
 * Calcula KPIs específicos por hospital
 */
function calcularKPIsEspecificos(leitos, hospitalId) {
    const kpis = {};
    
    if (hospitalId === 'H2') {
        // CRUZ AZUL - Enfermarias por gênero (leitos 21-36)
        const enfermarias = leitos.filter(l => l.leito >= 21 && l.leito <= 36);
        
        // Quartos disponíveis por gênero
        let disponivelMasculino = 0;
        let disponivelFeminino = 0;
        let bloqueado = 0;
        
        // Verificar cada quarto (8 quartos: 711, 713, 715, 717, 719, 721, 723, 725)
        const quartos = [
            {l1: 21, l2: 22}, {l1: 23, l2: 24}, {l1: 25, l2: 26}, {l1: 27, l2: 28},
            {l1: 29, l2: 30}, {l1: 31, l2: 32}, {l1: 33, l2: 34}, {l1: 35, l2: 36}
        ];
        
        quartos.forEach(quarto => {
            const leito1 = leitos.find(l => l.leito === quarto.l1);
            const leito2 = leitos.find(l => l.leito === quarto.l2);
            
            const vago1 = !leito1 || leito1.status === 'vago' || leito1.status === 'Vago';
            const vago2 = !leito2 || leito2.status === 'vago' || leito2.status === 'Vago';
            
            const isolamento1 = leito1 && leito1.isolamento && leito1.isolamento !== 'Não Isolamento';
            const isolamento2 = leito2 && leito2.isolamento && leito2.isolamento !== 'Não Isolamento';
            
            // Se algum tem isolamento → quarto bloqueado
            if (isolamento1 || isolamento2) {
                bloqueado++;
            }
            // Se ambos vagos → disponível para ambos gêneros
            else if (vago1 && vago2) {
                disponivelMasculino++;
                disponivelFeminino++;
            }
            // Se 1 ocupado → só disponível para mesmo gênero
            else if (!vago1 && vago2) {
                if (leito1.genero === 'Masculino') disponivelMasculino++;
                if (leito1.genero === 'Feminino') disponivelFeminino++;
            }
            else if (vago1 && !vago2) {
                if (leito2.genero === 'Masculino') disponivelMasculino++;
                if (leito2.genero === 'Feminino') disponivelFeminino++;
            }
        });
        
        kpis.enfermariasDispMasculino = disponivelMasculino;
        kpis.enfermariasDispFeminino = disponivelFeminino;
        kpis.enfermariasBloqueadas = bloqueado;
    }
    
    if (hospitalId === 'H4') {
        // SANTA CLARA - Limite de 4 enfermarias (leitos 10-13)
        const enfermariasOcupadas = leitos.filter(l => 
            l.leito >= 10 && l.leito <= 13 &&
            (l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso') &&
            (l.tipo === 'ENF' || l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria' || l.categoria_escolhida === 'Enfermaria')
        ).length;
        
        kpis.enfermariasDisponiveis = 4 - enfermariasOcupadas;
        kpis.enfermariasTotal = 4;
    }
    
    return kpis;
}

/**
 * 🎨 RENDERIZA KPIs (RESPONSIVO)
 * Desktop: 5 em 1 linha (gauge + 4 boxes)
 * Mobile: Gauge sozinho, depois 2 linhas de 2 boxes
 */
function renderizarKPIs(kpis, hospitalId) {
    // Determinar cor do gauge
    let corGauge = '#10b981'; // Verde
    if (kpis.taxaOcupacao >= 90) corGauge = '#ef4444'; // Vermelho
    else if (kpis.taxaOcupacao >= 70) corGauge = '#f59e0b'; // Amarelo
    
    return `
        <div class="kpis-container">
            <!-- KPIs Básicos (linha principal) -->
            <div class="kpis-grid">
                <!-- Gauge de Ocupação -->
                <div class="kpi-box kpi-gauge">
                    <div class="gauge-container">
                        <svg viewBox="0 0 200 120" class="gauge-svg">
                            <!-- Background arc -->
                            <path d="M 30 100 A 70 70 0 0 1 170 100" 
                                  fill="none" 
                                  stroke="#374151" 
                                  stroke-width="20"/>
                            <!-- Colored arc -->
                            <path d="M 30 100 A 70 70 0 0 1 170 100" 
                                  fill="none" 
                                  stroke="${corGauge}" 
                                  stroke-width="20"
                                  stroke-dasharray="${(kpis.taxaOcupacao * 4.398)}px 439.8px"
                                  stroke-linecap="round"/>
                        </svg>
                        <div class="gauge-value">${kpis.taxaOcupacao}%</div>
                        <div class="gauge-label">OCUPAÇÃO</div>
                    </div>
                </div>
                
                <!-- Total -->
                <div class="kpi-box">
                    <div class="kpi-icon">🏥</div>
                    <div class="kpi-value">${kpis.total}</div>
                    <div class="kpi-label">TOTAL</div>
                </div>
                
                <!-- Ocupados -->
                <div class="kpi-box">
                    <div class="kpi-icon">🟢</div>
                    <div class="kpi-value">${kpis.ocupados}</div>
                    <div class="kpi-label">OCUPADOS</div>
                </div>
                
                <!-- Vagos -->
                <div class="kpi-box">
                    <div class="kpi-icon">⚪</div>
                    <div class="kpi-value">${kpis.vagos}</div>
                    <div class="kpi-label">VAGOS</div>
                </div>
                
                <!-- Em Alta -->
                <div class="kpi-box">
                    <div class="kpi-icon">📤</div>
                    <div class="kpi-value">${kpis.emAlta}</div>
                    <div class="kpi-label">EM ALTA</div>
                </div>
            </div>
            
            <!-- KPIs Novos V3.3 (linha secundária) -->
            <div class="kpis-secondary">
                <!-- Apartamentos/Enfermarias -->
                <div class="kpi-card">
                    <h4>TIPO DE OCUPAÇÃO</h4>
                    <div class="kpi-detail">
                        <span>Apartamentos: <strong>${kpis.apartamentosOcupados}</strong></span>
                        <span>Enfermarias: <strong>${kpis.enfermariasOcupadas}</strong></span>
                    </div>
                </div>
                
                ${hospitalId === 'H2' ? `
                <!-- KPI especial Cruz Azul -->
                <div class="kpi-card kpi-destaque">
                    <h4>🔒 ENFERMARIAS DISPONÍVEIS</h4>
                    <div class="kpi-detail">
                        <span>Masculino: <strong>${kpis.enfermariasDispMasculino || 0}</strong></span>
                        <span>Feminino: <strong>${kpis.enfermariasDispFeminino || 0}</strong></span>
                        <span>Bloqueado: <strong>${kpis.enfermariasBloqueadas || 0}</strong></span>
                    </div>
                </div>
                ` : ''}
                
                ${hospitalId === 'H4' ? `
                <!-- KPI especial Santa Clara -->
                <div class="kpi-card kpi-destaque">
                    <h4>🔢 ENFERMARIAS DISPONÍVEIS</h4>
                    <div class="kpi-valor-grande">
                        ${kpis.enfermariasDisponiveis || 0} de ${kpis.enfermariasTotal || 4}
                    </div>
                </div>
                ` : ''}
                
                <!-- Isolamentos -->
                <div class="kpi-card">
                    <h4>ISOLAMENTOS</h4>
                    <div class="kpi-detail">
                        <span>Total: <strong>${kpis.isolamentoTotal}</strong></span>
                        <span>Respiratório: <strong>${kpis.isolamentoResp}</strong></span>
                        <span>Contato: <strong>${kpis.isolamentoContato}</strong></span>
                    </div>
                </div>
                
                <!-- Diretivas -->
                <div class="kpi-card">
                    <h4>DIRETIVAS ANTECIPADAS</h4>
                    <div class="kpi-valor-grande">
                        ${kpis.diretivasSim} pacientes
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 📊 RENDERIZA TODOS OS GRÁFICOS DO HOSPITAL
 */
function renderizarGraficosHospital(hospitalId) {
    console.log(`📊 [GRÁFICOS ${hospitalId}] Iniciando renderização`);
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        console.error(`❌ [GRÁFICOS ${hospitalId}] Hospital não encontrado`);
        return;
    }
    
    const leitos = hospital.leitos;
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado' || l.status === 'Ocupado' || l.status === 'Em uso');
    
    // Destruir gráficos existentes deste hospital
    destruirGraficosHospital(hospitalId);
    
    // 1. Análise Preditiva de Altas (barras verticais)
    renderizarGraficoAltas(hospitalId, leitosOcupados);
    
    // 2. Concessões (barras verticais)
    renderizarGraficoConcessoes(hospitalId, leitosOcupados);
    
    // 3. Linhas de Cuidado (barras verticais)
    renderizarGraficoLinhas(hospitalId, leitosOcupados);
    
    // 4. NOVO: Região (pizza)
    renderizarGraficoRegiao(hospitalId, leitosOcupados);
    
    // 5. NOVO: Idade (área)
    renderizarGraficoIdade(hospitalId, leitosOcupados);
    
    // 6. NOVO: Tipo de Ocupação (donut)
    renderizarGraficoTipoOcupacao(hospitalId, leitosOcupados);
    
    console.log(`✅ [GRÁFICOS ${hospitalId}] Todos os gráficos renderizados`);
}

/**
 * Destrói gráficos existentes de um hospital
 */
function destruirGraficosHospital(hospitalId) {
    const chartIds = [
        `chartAltas_${hospitalId}`,
        `chartConcessoes_${hospitalId}`,
        `chartLinhas_${hospitalId}`,
        `chartRegiao_${hospitalId}`,
        `chartIdade_${hospitalId}`,
        `chartTipo_${hospitalId}`
    ];
    
    chartIds.forEach(chartId => {
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
 * 1️⃣ GRÁFICO: Análise Preditiva de Altas (Barras Verticais)
 */
function renderizarGraficoAltas(hospitalId, leitosOcupados) {
    const canvas = document.getElementById(`chartAltas_${hospitalId}`);
    if (!canvas) return;
    
    // Categorias de alta
    const categorias = {
        'Hoje Ouro': 0,
        'Hoje 2R': 0,
        'Hoje 3R': 0,
        '24H': 0,
        '48H': 0,
        '72H': 0,
        '96H': 0
    };
    
    leitosOcupados.forEach(leito => {
        const prevAlta = leito.prevAlta || 'SP';
        if (categorias.hasOwnProperty(prevAlta)) {
            categorias[prevAlta]++;
        }
    });
    
    const labels = Object.keys(categorias);
    const dados = Object.values(categorias);
    const cores = [
        '#FFD700', // Ouro
        '#C0C0C0', // Prata
        '#CD7F32', // Bronze
        '#60a5fa', // 24H
        '#3b82f6', // 48H
        '#1d4ed8', // 72H
        '#1e3a8a'  // 96H
    ];
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiários',
                data: dados,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            }
        }
    });
    
    // Legenda customizada
    criarLegendaHTML(`legendaAltas_${hospitalId}`, labels, cores, dados);
}

/**
 * 2️⃣ GRÁFICO: Concessões (Barras Verticais)
 */
function renderizarGraficoConcessoes(hospitalId, leitosOcupados) {
    const canvas = document.getElementById(`chartConcessoes_${hospitalId}`);
    if (!canvas) return;
    
    const concessoesContador = {};
    
    leitosOcupados.forEach(leito => {
        if (leito.concessoes && Array.isArray(leito.concessoes)) {
            leito.concessoes.forEach(concessao => {
                if (concessao) {
                    concessoesContador[concessao] = (concessoesContador[concessao] || 0) + 1;
                }
            });
        }
    });
    
    if (Object.keys(concessoesContador).length === 0) {
        canvas.parentElement.innerHTML = '<p class="no-data">Nenhuma concessão registrada</p>';
        return;
    }
    
    const concessoesArray = Object.entries(concessoesContador).sort((a, b) => b[1] - a[1]);
    const labels = concessoesArray.map(c => c[0]);
    const dados = concessoesArray.map(c => c[1]);
    const cores = labels.map(label => buscarCorConcessao(label));
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: dados,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { 
                        color: '#9ca3af',
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false }
                }
            }
        }
    });
    
    criarLegendaHTML(`legendaConcessoes_${hospitalId}`, labels, cores, dados);
}

/**
 * 3️⃣ GRÁFICO: Linhas de Cuidado (Barras Verticais)
 */
function renderizarGraficoLinhas(hospitalId, leitosOcupados) {
    const canvas = document.getElementById(`chartLinhas_${hospitalId}`);
    if (!canvas) return;
    
    const linhasContador = {};
    
    leitosOcupados.forEach(leito => {
        if (leito.linhas && Array.isArray(leito.linhas)) {
            leito.linhas.forEach(linha => {
                if (linha) {
                    linhasContador[linha] = (linhasContador[linha] || 0) + 1;
                }
            });
        }
    });
    
    if (Object.keys(linhasContador).length === 0) {
        canvas.parentElement.innerHTML = '<p class="no-data">Nenhuma linha de cuidado registrada</p>';
        return;
    }
    
    const linhasArray = Object.entries(linhasContador).sort((a, b) => b[1] - a[1]);
    const labels = linhasArray.map(l => l[0]);
    const dados = linhasArray.map(l => l[1]);
    const cores = labels.map(label => buscarCorLinha(label));
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: dados,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { 
                        color: '#9ca3af',
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false }
                }
            }
        }
    });
    
    criarLegendaHTML(`legendaLinhas_${hospitalId}`, labels, cores, dados);
}

/**
 * 4️⃣ NOVO: Beneficiários por Região (Pizza)
 */
function renderizarGraficoRegiao(hospitalId, leitosOcupados) {
    const canvas = document.getElementById(`chartRegiao_${hospitalId}`);
    if (!canvas) return;
    
    const regioes = [
        'Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste',
        'Santo Amaro', 'Vila Mariana', 'Santana', 'Pinheiros'
    ];
    
    const dados = regioes.map(regiao => 
        leitosOcupados.filter(l => l.regiao === regiao).length
    );
    
    // Cores automáticas Chart.js
    const cores = [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
        '#ff9f40', '#c9cbcf', '#e7e9ed', '#4dc9f6'
    ];
    
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: regioes,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    criarLegendaHTML(`legendaRegiao_${hospitalId}`, regioes, cores, dados);
}

/**
 * 5️⃣ NOVO: Idade dos Beneficiários (Área)
 */
function renderizarGraficoIdade(hospitalId, leitosOcupados) {
    const canvas = document.getElementById(`chartIdade_${hospitalId}`);
    if (!canvas) return;
    
    const faixas = [
        {nome: '0-18', min: 0, max: 18},
        {nome: '19-30', min: 19, max: 30},
        {nome: '31-45', min: 31, max: 45},
        {nome: '46-60', min: 46, max: 60},
        {nome: '61-75', min: 61, max: 75},
        {nome: '76+', min: 76, max: 150}
    ];
    
    const dados = faixas.map(faixa => 
        leitosOcupados.filter(l => {
            const idade = parseInt(l.idade) || 0;
            return idade >= faixa.min && idade <= faixa.max;
        }).length
    );
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: faixas.map(f => f.nome),
            datasets: [{
                label: 'Beneficiários',
                data: dados,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                fill: true,
                tension: 0.4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * 6️⃣ NOVO: Tipo de Ocupação (Donut)
 */
function renderizarGraficoTipoOcupacao(hospitalId, leitosOcupados) {
    const canvas = document.getElementById(`chartTipo_${hospitalId}`);
    if (!canvas) return;
    
    const apartamentos = leitosOcupados.filter(l => 
        l.tipo === 'APTO' || l.tipo === 'Apartamento' || l.categoria_escolhida === 'Apartamento'
    ).length;
    
    const enfermarias = leitosOcupados.filter(l => 
        l.tipo === 'ENF' || l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria' || l.categoria_escolhida === 'Enfermaria'
    ).length;
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Apartamento', 'Enfermaria'],
            datasets: [{
                data: [apartamentos, enfermarias],
                backgroundColor: ['#3b82f6', '#10b981'],
                borderWidth: 2,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            cutout: '60%'
        }
    });
    
    criarLegendaHTML(`legendaTipo_${hospitalId}`, 
        ['Apartamento', 'Enfermaria'], 
        ['#3b82f6', '#10b981'], 
        [apartamentos, enfermarias]
    );
}

/**
 * 🎨 CRIA LEGENDA HTML CUSTOMIZADA
 * Estilo vertical com toggle funcional
 */
function criarLegendaHTML(containerId, labels, colors, values) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="legend-items">';
    
    labels.forEach((label, index) => {
        html += `
            <div class="legend-item" data-index="${index}">
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
 * Busca cor de concessão (com fallback)
 */
function buscarCorConcessao(nome) {
    if (window.CORES_CONCESSOES && window.CORES_CONCESSOES[nome]) {
        return window.CORES_CONCESSOES[nome];
    }
    
    if (window.buscarCorConcessao) {
        return window.buscarCorConcessao(nome);
    }
    
    return '#666666';
}

/**
 * Busca cor de linha de cuidado (com fallback)
 */
function buscarCorLinha(nome) {
    if (window.CORES_LINHAS && window.CORES_LINHAS[nome]) {
        return window.CORES_LINHAS[nome];
    }
    
    if (window.buscarCorLinha) {
        return window.buscarCorLinha(nome);
    }
    
    // Fallback para variações conhecidas
    if (nome === 'Colorproctologia' && window.CORES_LINHAS && window.CORES_LINHAS['Coloproctologia']) {
        return window.CORES_LINHAS['Coloproctologia'];
    }
    
    return '#666666';
}

// ✅ ALIAS PARA COMPATIBILIDADE
window.renderizarDashboard = window.renderDashboardHospitalar;

console.log('✅ [DASHBOARD V3.3 FINAL] Dashboard Hospitalar carregado com sucesso');
console.log('✅ Função principal: window.renderDashboardHospitalar()');
console.log('✅ Alias disponível: window.renderizarDashboard()');
