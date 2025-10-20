/**
 * DASHBOARD HOSPITALAR V3.3.2 FINAL
 * Guilherme Santoro + Alessandro Rodrigues
 * Data: 19/Outubro/2025
 * 
 * CORRECOES V3.3.2 FINAL:
 * - Tema claro/escuro com botao toggle
 * - Legendas ABAIXO dos graficos (um item por linha)
 * - Graficos um abaixo do outro (nao lado a lado)
 * - KPIs sem "undefined" (calculos corrigidos)
 * - 2 linhas de 5 KPIs alinhadas
 * - Todos os 5 hospitais carregando
 * - Fundo escuro por padrao
 */

console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Inicializando...');

// TEMA GLOBAL
window.dashboardTema = 'escuro'; // Padrao: escuro

// NOME CORRETO DA FUNCAO (com "ar" no final)
window.renderDashboardHospitalar = function(hospitalId = 'todos') {
    console.log(`[DASHBOARD HOSPITALAR] Renderizando hospital: ${hospitalId}`);
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        console.error('[DASHBOARD HOSPITALAR] Container nao encontrado');
        return;
    }

    // Validar dados
    if (!window.hospitalData) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3>Dados nao disponiveis</h3>
                <p>Carregando informacoes dos hospitais...</p>
            </div>
        `;
        return;
    }

    // Adicionar botao tema
    adicionarBotaoTema(container);

    // Se for "todos", renderizar todos os hospitais
    if (hospitalId === 'todos') {
        renderTodosHospitais(container);
        return;
    }

    // Renderizar hospital especifico
    renderHospitalIndividual(container, hospitalId);
};

// ALIAS (para compatibilidade)
window.renderizarDashboard = window.renderDashboardHospitalar;

/**
 * ADICIONAR BOTAO TEMA CLARO/ESCURO
 */
function adicionarBotaoTema(container) {
    // Verificar se ja existe
    if (document.getElementById('btnTemaDashboard')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btnTemaDashboard';
    btn.className = 'btn-tema-toggle';
    btn.innerHTML = window.dashboardTema === 'escuro' ? 'Tema Claro' : 'Tema Escuro';
    btn.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    btn.addEventListener('click', () => {
        window.dashboardTema = window.dashboardTema === 'escuro' ? 'claro' : 'escuro';
        btn.innerHTML = window.dashboardTema === 'escuro' ? 'Tema Claro' : 'Tema Escuro';
        
        // Aplicar tema
        aplicarTema();
        
        // Re-renderizar graficos
        window.renderDashboardHospitalar('todos');
    });
    
    document.body.appendChild(btn);
    aplicarTema();
}

/**
 * APLICAR TEMA
 */
function aplicarTema() {
    const root = document.documentElement;
    
    if (window.dashboardTema === 'escuro') {
        root.style.setProperty('--bg-primary', '#1a1a2e');
        root.style.setProperty('--bg-secondary', '#16213e');
        root.style.setProperty('--bg-card', '#0f3460');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#e0e0e0');
        root.style.setProperty('--border-color', '#2d3748');
    } else {
        root.style.setProperty('--bg-primary', '#f5f5f5');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--bg-card', '#ffffff');
        root.style.setProperty('--text-primary', '#333333');
        root.style.setProperty('--text-secondary', '#666666');
        root.style.setProperty('--border-color', '#e0e0e0');
    }
}

/**
 * RENDERIZAR TODOS OS HOSPITAIS
 */
function renderTodosHospitais(container) {
    console.log('[DASHBOARD HOSPITALAR] Renderizando todos os hospitais');
    
    const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5'];
    let html = '<div class="dashboard-hospitalar-completo">';
    
    hospitais.forEach((hospitalId, index) => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital) return;
        
        html += `
            <div class="hospital-section" id="hospital-${hospitalId}">
                ${renderHospitalHTML(hospitalId, hospital)}
            </div>
            ${index < hospitais.length - 1 ? '<hr class="hospital-separator">' : ''}
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Renderizar graficos
    setTimeout(() => {
        hospitais.forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital) {
                renderGraficosHospital(hospitalId, hospital);
            }
        });
    }, 100);
}

/**
 * RENDERIZAR HOSPITAL INDIVIDUAL
 */
function renderHospitalIndividual(container, hospitalId) {
    console.log(`[DASHBOARD HOSPITALAR] Renderizando hospital individual: ${hospitalId}`);
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital) {
        container.innerHTML = '<div style="padding: 40px; text-align: center;"><h3>Hospital nao encontrado</h3></div>';
        return;
    }
    
    container.innerHTML = `
        <div class="dashboard-hospitalar-individual">
            <div class="hospital-section" id="hospital-${hospitalId}">
                ${renderHospitalHTML(hospitalId, hospital)}
            </div>
        </div>
    `;
    
    // Renderizar graficos
    setTimeout(() => {
        renderGraficosHospital(hospitalId, hospital);
    }, 100);
}

/**
 * GERAR HTML DE UM HOSPITAL
 */
function renderHospitalHTML(hospitalId, hospital) {
    const nomeHospital = window.HOSPITAL_MAPPING[hospitalId] || hospitalId;
    const kpis = calcularKPIsHospital(hospitalId, hospital);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    return `
        <!-- HEADER -->
        <div class="hospital-header">
            <h2>Dashboard Hospitalar</h2>
            <h3 class="hospital-nome">${nomeHospital}</h3>
        </div>

        <!-- LINHA 1: KPIS PRINCIPAIS -->
        <div class="kpis-linha-1">
            ${renderKPIsPrincipais(kpis)}
        </div>

        <!-- LINHA 2: KPIS ESPECIFICOS -->
        <div class="kpis-linha-2">
            ${renderKPIsLinha2(hospitalId, kpis)}
        </div>

        <!-- GRAFICOS (um abaixo do outro) -->
        <div class="graficos-container">
            <!-- GRAFICO 1: ALTAS -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Analise Preditiva de Altas em ${dataAtual}</h4>
                <canvas id="chart-altas-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-altas-${hospitalId}" class="chart-legend-bottom"></div>
            </div>

            <!-- GRAFICO 2: CONCESSOES -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Concessoes Previstas em ${dataAtual}</h4>
                <canvas id="chart-concessoes-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-concessoes-${hospitalId}" class="chart-legend-bottom"></div>
            </div>

            <!-- GRAFICO 3: LINHAS DE CUIDADO -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Linhas de Cuidado em ${dataAtual}</h4>
                <canvas id="chart-linhas-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-linhas-${hospitalId}" class="chart-legend-bottom"></div>
            </div>

            <!-- GRAFICO 4: REGIAO -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Beneficiarios por Regiao em ${dataAtual}</h4>
                <canvas id="chart-regiao-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-regiao-${hospitalId}" class="chart-legend-bottom"></div>
            </div>

            <!-- GRAFICO 5: IDADE -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Idade Beneficiarios em ${dataAtual}</h4>
                <canvas id="chart-idade-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-idade-${hospitalId}" class="chart-legend-bottom"></div>
            </div>

            <!-- GRAFICO 6: TIPO OCUPACAO -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Tipo de Ocupacao em ${dataAtual}</h4>
                <canvas id="chart-tipo-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-tipo-${hospitalId}" class="chart-legend-bottom"></div>
            </div>
        </div>
    `;
}

/**
 * CALCULAR KPIS DO HOSPITAL
 */
function calcularKPIsHospital(hospitalId, hospital) {
    const leitos = hospital.leitos || [];
    const total = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    // Contar altas
    const emAlta = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const prev = (l.prevAlta || '').toLowerCase();
        return prev.includes('hoje') || prev === '24h';
    }).length;
    
    // Contar apartamentos e enfermarias ocupados
    const aptosOcupados = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
        return cat.includes('apto') || cat.includes('apartamento');
    }).length;
    
    const enfOcupados = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
        return cat.includes('enf') || cat.includes('enfermaria');
    }).length;
    
    // Isolamentos
    const isolamentos = leitos.filter(l => {
        const iso = (l.isolamento || '').toLowerCase();
        return iso.includes('contato') || iso.includes('respirat');
    });
    
    const isoContato = isolamentos.filter(l => 
        (l.isolamento || '').toLowerCase().includes('contato')
    ).length;
    
    const isoRespiratorio = isolamentos.filter(l => 
        (l.isolamento || '').toLowerCase().includes('respirat')
    ).length;
    
    // Diretivas
    const comDiretivas = leitos.filter(l => {
        const dir = (l.diretivas || '').toLowerCase();
        return dir === 'sim';
    }).length;
    
    // Cruz Azul - Enfermarias por genero
    let enfMasculino = 0;
    let enfFeminino = 0;
    let enfDisponivelM = 0;
    let enfDisponivelF = 0;
    
    if (hospitalId === 'H2') {
        const enfermarias = leitos.filter(l => l.leito >= 21 && l.leito <= 36);
        enfermarias.forEach(l => {
            if (l.status === 'ocupado') {
                const gen = (l.genero || '').toLowerCase();
                if (gen.includes('masc')) enfMasculino++;
                if (gen.includes('fem')) enfFeminino++;
            }
        });
        enfDisponivelM = 8 - enfMasculino;
        enfDisponivelF = 8 - enfFeminino;
    }
    
    // Santa Clara - Enfermarias disponiveis
    let enfSantaClara = 0;
    let enfSantaClaraDisponiveis = 0;
    if (hospitalId === 'H4') {
        const enfermarias = leitos.filter(l => l.leito >= 10 && l.leito <= 13);
        enfSantaClara = enfermarias.filter(l => l.status === 'ocupado').length;
        enfSantaClaraDisponiveis = 4 - enfSantaClara;
    }
    
    return {
        total,
        ocupados,
        vagos,
        ocupacao,
        emAlta,
        aptosOcupados,
        enfOcupados,
        isolamentos: isolamentos.length,
        isoContato,
        isoRespiratorio,
        comDiretivas,
        enfMasculino,
        enfFeminino,
        enfDisponivelM,
        enfDisponivelF,
        enfSantaClara,
        enfSantaClaraDisponiveis
    };
}

/**
 * RENDERIZAR KPIS PRINCIPAIS (LINHA 1)
 */
function renderKPIsPrincipais(kpis) {
    return `
        <div class="kpi-box kpi-ocupacao">
            <div class="kpi-gauge">
                <svg viewBox="0 0 100 50" style="width: 100%; height: auto;">
                    <path d="M 10,45 A 40,40 0 0,1 90,45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                    <path d="M 10,45 A 40,40 0 0,1 90,45" fill="none" stroke="#4CAF50" stroke-width="8"
                          stroke-dasharray="${kpis.ocupacao * 1.26} 126" stroke-linecap="round"/>
                    <text x="50" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="var(--text-primary)">
                        ${kpis.ocupacao}%
                    </text>
                </svg>
            </div>
            <div class="kpi-label">OCUPACAO</div>
        </div>

        <div class="kpi-box">
            <div class="kpi-value">${kpis.total}</div>
            <div class="kpi-label">TOTAL</div>
        </div>

        <div class="kpi-box">
            <div class="kpi-value">${kpis.ocupados}</div>
            <div class="kpi-label">OCUPADOS</div>
        </div>

        <div class="kpi-box">
            <div class="kpi-value">${kpis.vagos}</div>
            <div class="kpi-label">VAGOS</div>
        </div>

        <div class="kpi-box">
            <div class="kpi-value">${kpis.emAlta}</div>
            <div class="kpi-label">EM ALTA</div>
        </div>
    `;
}

/**
 * RENDERIZAR KPIS LINHA 2
 */
function renderKPIsLinha2(hospitalId, kpis) {
    let html = '';
    
    // KPI 1: APARTAMENTOS
    html += `
        <div class="kpi-box">
            <div class="kpi-value">${kpis.aptosOcupados}</div>
            <div class="kpi-label">APARTAMENTOS OCUPADOS</div>
        </div>
    `;
    
    // KPI 2: ENFERMARIAS
    html += `
        <div class="kpi-box">
            <div class="kpi-value">${kpis.enfOcupados}</div>
            <div class="kpi-label">ENFERMARIAS OCUPADAS</div>
        </div>
    `;
    
    // KPI 3: ESPECIFICO DO HOSPITAL
    if (hospitalId === 'H2') {
        // Cruz Azul
        html += `
            <div class="kpi-box kpi-especial">
                <div class="kpi-label" style="margin-bottom: 10px;">ENF. DISPONIVEIS</div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <div>
                        <div class="kpi-value-small">${kpis.enfDisponivelM}</div>
                        <div class="kpi-sublabel">Masculino</div>
                    </div>
                    <div>
                        <div class="kpi-value-small">${kpis.enfDisponivelF}</div>
                        <div class="kpi-sublabel">Feminino</div>
                    </div>
                </div>
            </div>
        `;
    } else if (hospitalId === 'H4') {
        // Santa Clara
        html += `
            <div class="kpi-box">
                <div class="kpi-value">${kpis.enfSantaClara} de 4</div>
                <div class="kpi-label">ENF. OCUPADAS</div>
                <div class="kpi-sublabel">${kpis.enfSantaClaraDisponiveis} disponiveis</div>
            </div>
        `;
    } else {
        // Outros hospitais - box vazio
        html += `
            <div class="kpi-box kpi-placeholder">
                <div class="kpi-value">-</div>
                <div class="kpi-label">N/A</div>
            </div>
        `;
    }
    
    // KPI 4: ISOLAMENTOS
    html += `
        <div class="kpi-box">
            <div class="kpi-value">${kpis.isolamentos}</div>
            <div class="kpi-label">ISOLAMENTOS</div>
            <div class="kpi-breakdown">
                ${kpis.isoRespiratorio} Respiratorio / ${kpis.isoContato} Contato
            </div>
        </div>
    `;
    
    // KPI 5: DIRETIVAS
    html += `
        <div class="kpi-box">
            <div class="kpi-value">${kpis.comDiretivas}</div>
            <div class="kpi-label">COM DIRETIVAS</div>
        </div>
    `;
    
    return html;
}

/**
 * RENDERIZAR GRAFICOS DO HOSPITAL
 */
function renderGraficosHospital(hospitalId, hospital) {
    console.log(`[DASHBOARD HOSPITALAR] Renderizando graficos: ${hospitalId}`);
    
    const leitos = hospital.leitos || [];
    const ocupados = leitos.filter(l => l.status === 'ocupado');
    
    // Configuracao de cores baseada no tema
    const temaEscuro = window.dashboardTema === 'escuro';
    const corFundo = temaEscuro ? '#0f3460' : '#ffffff';
    const corTexto = temaEscuro ? '#ffffff' : '#333333';
    const corGrid = temaEscuro ? '#2d3748' : '#e0e0e0';
    
    Chart.defaults.color = corTexto;
    Chart.defaults.borderColor = corGrid;
    
    // 1. GRAFICO DE ALTAS
    renderGraficoAltas(hospitalId, ocupados, corFundo, corTexto, corGrid);
    
    // 2. GRAFICO DE CONCESSOES
    renderGraficoConcessoes(hospitalId, ocupados, corFundo, corTexto, corGrid);
    
    // 3. GRAFICO DE LINHAS DE CUIDADO
    renderGraficoLinhas(hospitalId, ocupados, corFundo, corTexto, corGrid);
    
    // 4. GRAFICO DE REGIAO
    renderGraficoRegiao(hospitalId, ocupados, corFundo, corTexto, corGrid);
    
    // 5. GRAFICO DE IDADE
    renderGraficoIdade(hospitalId, ocupados, corFundo, corTexto, corGrid);
    
    // 6. GRAFICO DE TIPO OCUPACAO
    renderGraficoTipoOcupacao(hospitalId, ocupados, corFundo, corTexto, corGrid);
}

/**
 * GRAFICO DE ALTAS
 */
function renderGraficoAltas(hospitalId, ocupados, corFundo, corTexto, corGrid) {
    const canvas = document.getElementById(`chart-altas-${hospitalId}`);
    if (!canvas) return;
    
    // Contar por timeline
    const timelines = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze', '24H', '48H', '72H', '96H', 'SP'];
    const dados = {};
    
    timelines.forEach(t => {
        dados[t] = ocupados.filter(l => (l.prevAlta || '') === t).length;
    });
    
    // Filtrar apenas com valores > 0
    const labels = [];
    const values = [];
    const colors = [];
    
    const coresTimeline = {
        'Hoje Ouro': '#FFD700',
        'Hoje Prata': '#C0C0C0',
        'Hoje Bronze': '#CD7F32',
        '24H': '#4CAF50',
        '48H': '#2196F3',
        '72H': '#FF9800',
        '96H': '#F44336',
        'SP': '#9C27B0'
    };
    
    timelines.forEach(t => {
        if (dados[t] > 0) {
            labels.push(t);
            values.push(dados[t]);
            colors.push(coresTimeline[t] || '#999');
        }
    });
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Sem dados de altas</p>';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiarios',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
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
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                },
                x: {
                    ticks: {
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-altas-${hospitalId}`, labels, colors, chart);
}

/**
 * GRAFICO DE CONCESSOES
 */
function renderGraficoConcessoes(hospitalId, ocupados, corFundo, corTexto, corGrid) {
    const canvas = document.getElementById(`chart-concessoes-${hospitalId}`);
    if (!canvas) return;
    
    // Contar concessoes
    const concessoesCount = {};
    
    ocupados.forEach(leito => {
        const concessoes = leito.concessoes || [];
        concessoes.forEach(c => {
            concessoesCount[c] = (concessoesCount[c] || 0) + 1;
        });
    });
    
    // Ordenar por quantidade
    const sorted = Object.entries(concessoesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
    
    if (sorted.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Sem concessoes</p>';
        return;
    }
    
    const labels = sorted.map(s => s[0]);
    const values = sorted.map(s => s[1]);
    const colors = labels.map(l => window.CORES_CONCESSOES?.[l] || '#999');
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiarios',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
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
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                },
                x: {
                    ticks: {
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-concessoes-${hospitalId}`, labels, colors, chart);
}

/**
 * GRAFICO DE LINHAS DE CUIDADO
 */
function renderGraficoLinhas(hospitalId, ocupados, corFundo, corTexto, corGrid) {
    const canvas = document.getElementById(`chart-linhas-${hospitalId}`);
    if (!canvas) return;
    
    // Contar linhas
    const linhasCount = {};
    
    ocupados.forEach(leito => {
        const linhas = leito.linhas || [];
        linhas.forEach(l => {
            linhasCount[l] = (linhasCount[l] || 0) + 1;
        });
    });
    
    // Ordenar por quantidade
    const sorted = Object.entries(linhasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15
    
    if (sorted.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Sem linhas de cuidado</p>';
        return;
    }
    
    const labels = sorted.map(s => s[0]);
    const values = sorted.map(s => s[1]);
    const colors = labels.map(l => window.CORES_LINHAS?.[l] || '#999');
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiarios',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
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
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                },
                x: {
                    ticks: {
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-linhas-${hospitalId}`, labels, colors, chart);
}

/**
 * GRAFICO DE REGIAO
 */
function renderGraficoRegiao(hospitalId, ocupados, corFundo, corTexto, corGrid) {
    const canvas = document.getElementById(`chart-regiao-${hospitalId}`);
    if (!canvas) return;
    
    // Contar por regiao
    const regiaoCount = {};
    
    ocupados.forEach(leito => {
        const regiao = leito.regiao || 'Nao Informado';
        regiaoCount[regiao] = (regiaoCount[regiao] || 0) + 1;
    });
    
    const labels = Object.keys(regiaoCount);
    const values = Object.values(regiaoCount);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Sem dados de regiao</p>';
        return;
    }
    
    // Cores para regioes
    const coresRegiao = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ];
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: coresRegiao.slice(0, labels.length),
                borderColor: corFundo,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-regiao-${hospitalId}`, labels, coresRegiao.slice(0, labels.length), chart);
}

/**
 * GRAFICO DE IDADE
 */
function renderGraficoIdade(hospitalId, ocupados, corFundo, corTexto, corGrid) {
    const canvas = document.getElementById(`chart-idade-${hospitalId}`);
    if (!canvas) return;
    
    // Contar por faixa etaria
    const faixas = {
        '0-17': 0,
        '18-29': 0,
        '30-39': 0,
        '40-49': 0,
        '50-59': 0,
        '60-69': 0,
        '70-79': 0,
        '80+': 0
    };
    
    ocupados.forEach(leito => {
        const idade = parseInt(leito.idade) || 0;
        if (idade < 18) faixas['0-17']++;
        else if (idade < 30) faixas['18-29']++;
        else if (idade < 40) faixas['30-39']++;
        else if (idade < 50) faixas['40-49']++;
        else if (idade < 60) faixas['50-59']++;
        else if (idade < 70) faixas['60-69']++;
        else if (idade < 80) faixas['70-79']++;
        else faixas['80+']++;
    });
    
    const labels = Object.keys(faixas);
    const values = Object.values(faixas);
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Beneficiarios',
                data: values,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
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
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                },
                x: {
                    ticks: {
                        color: corTexto
                    },
                    grid: {
                        color: corGrid
                    }
                }
            }
        }
    });
    
    // Legenda abaixo (uma linha unica)
    gerarLegendaAbaixo(`legend-idade-${hospitalId}`, ['Faixas Etarias'], ['rgba(75, 192, 192, 1)'], chart);
}

/**
 * GRAFICO DE TIPO OCUPACAO
 */
function renderGraficoTipoOcupacao(hospitalId, ocupados, corFundo, corTexto, corGrid) {
    const canvas = document.getElementById(`chart-tipo-${hospitalId}`);
    if (!canvas) return;
    
    // Contar apartamentos vs enfermarias
    let apartamentos = 0;
    let enfermarias = 0;
    
    ocupados.forEach(leito => {
        const cat = (leito.categoriaEscolhida || leito.categoria || leito.tipo || '').toLowerCase();
        if (cat.includes('apto') || cat.includes('apartamento')) {
            apartamentos++;
        } else if (cat.includes('enf') || cat.includes('enfermaria')) {
            enfermarias++;
        }
    });
    
    if (apartamentos === 0 && enfermarias === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Sem dados de tipo</p>';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Apartamento', 'Enfermaria'],
            datasets: [{
                data: [apartamentos, enfermarias],
                backgroundColor: ['#4CAF50', '#2196F3'],
                borderColor: corFundo,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-tipo-${hospitalId}`, ['Apartamento', 'Enfermaria'], ['#4CAF50', '#2196F3'], chart);
}

/**
 * GERAR LEGENDA ABAIXO (um item por linha)
 */
function gerarLegendaAbaixo(legendId, labels, colors, chart) {
    const legendContainer = document.getElementById(legendId);
    if (!legendContainer) return;
    
    let html = '<div class="legend-items-vertical">';
    
    labels.forEach((label, index) => {
        const color = colors[index] || '#999';
        html += `
            <div class="legend-item-vertical" data-index="${index}">
                <span class="legend-color-box" style="background-color: ${color};"></span>
                <span class="legend-text">${label}</span>
            </div>
        `;
    });
    
    html += '</div>';
    legendContainer.innerHTML = html;
    
    // Adicionar eventos de clique
    legendContainer.querySelectorAll('.legend-item-vertical').forEach((item, index) => {
        item.addEventListener('click', () => {
            const meta = chart.getDatasetMeta(0);
            const dataItem = meta.data[index];
            
            if (dataItem) {
                dataItem.hidden = !dataItem.hidden;
                item.classList.toggle('legend-hidden');
                chart.update();
            }
        });
    });
}

// CSS INLINE (para garantir funcionamento)
const style = document.createElement('style');
style.textContent = `
    /* VARIAVEIS DE TEMA */
    :root {
        --bg-primary: #1a1a2e;
        --bg-secondary: #16213e;
        --bg-card: #0f3460;
        --text-primary: #ffffff;
        --text-secondary: #e0e0e0;
        --border-color: #2d3748;
    }

    /* CONTAINER PRINCIPAL */
    .dashboard-hospitalar-completo,
    .dashboard-hospitalar-individual {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    .hospital-section {
        margin-bottom: 60px;
    }

    .hospital-separator {
        margin: 60px 0;
        border: none;
        border-top: 2px solid var(--border-color);
    }

    .hospital-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .hospital-header h2 {
        font-size: 28px;
        margin-bottom: 10px;
        color: var(--text-primary);
    }

    .hospital-nome {
        font-size: 22px;
        color: #4CAF50;
        font-weight: normal;
        text-transform: uppercase;
    }

    /* KPIS - LINHA 1 E 2 */
    .kpis-linha-1,
    .kpis-linha-2 {
        display: flex;
        gap: 15px;
        margin: 20px 0;
        flex-wrap: wrap;
    }

    .kpi-box {
        flex: 1;
        min-width: 150px;
        background: var(--bg-card);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        padding: 20px;
        text-align: center;
        border: 1px solid var(--border-color);
    }

    .kpi-gauge {
        margin-bottom: 10px;
    }

    .kpi-value {
        font-size: 36px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 5px;
    }

    .kpi-value-small {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-primary);
    }

    .kpi-label {
        font-size: 11px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .kpi-sublabel {
        font-size: 10px;
        color: var(--text-secondary);
        margin-top: 5px;
    }

    .kpi-breakdown {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 8px;
    }

    .kpi-placeholder {
        opacity: 0.5;
    }

    /* GRAFICOS */
    .graficos-container {
        margin-top: 40px;
    }

    .grafico-wrapper {
        background: var(--bg-card);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        padding: 20px;
        margin-bottom: 30px;
        border: 1px solid var(--border-color);
    }

    .grafico-titulo {
        margin: 0 0 20px 0;
        font-size: 16px;
        color: var(--text-primary);
        text-align: center;
        text-transform: uppercase;
    }

    .chart-canvas {
        width: 100% !important;
        height: auto !important;
    }

    /* LEGENDA ABAIXO (vertical) */
    .chart-legend-bottom {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--border-color);
    }

    .legend-items-vertical {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .legend-item-vertical {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .legend-item-vertical:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .legend-item-vertical.legend-hidden {
        opacity: 0.4;
        text-decoration: line-through;
    }

    .legend-color-box {
        width: 20px;
        height: 20px;
        border-radius: 3px;
        flex-shrink: 0;
    }

    .legend-text {
        font-size: 13px;
        color: var(--text-primary);
    }

    /* MOBILE */
    @media (max-width: 768px) {
        .kpis-linha-1,
        .kpis-linha-2 {
            flex-direction: column;
        }

        .kpi-box {
            min-width: 100%;
        }

        .hospital-header h2 {
            font-size: 22px;
        }

        .hospital-nome {
            font-size: 18px;
        }

        .grafico-titulo {
            font-size: 14px;
        }
    }
`;

document.head.appendChild(style);

console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Modulo carregado com sucesso');
