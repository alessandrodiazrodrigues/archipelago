/**
 * DASHBOARD HOSPITALAR V3.3.2 FINAL - CORRIGIDO
 * Guilherme Santoro + Alessandro Rodrigues
 * Data: 20/Outubro/2025
 * 
 * CORRECOES APLICADAS:
 * - KPIS corrigidos (sem "undefined")
 * - Botao Claro/Escuro reposicionado ao lado de "Atualizar"
 * - Largura maxima das barras (maxBarThickness: 80)
 * - Grafico de Idade REMOVIDO
 * - KPI "Idade Media" ADICIONADO na linha 2
 * - Numeros nos graficos de pizza (datalabels)
 * - Bug corrigido: todos os 5 hospitais carregam
 */

console.log('[DASHBOARD HOSPITALAR V3.3.2 CORRIGIDO] Inicializando...');

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

    // Adicionar botao tema (REPOSICIONADO)
    adicionarBotaoTema();

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
 * ADICIONAR BOTAO TEMA CLARO/ESCURO - REPOSICIONADO
 * Agora aparece ao lado do botao "Atualizar"
 */
function adicionarBotaoTema() {
    // Remover botao antigo se existir
    const btnAntigo = document.getElementById('btnTemaDashboard');
    if (btnAntigo) btnAntigo.remove();
    
    // Buscar container de botoes no header
    const header = document.querySelector('.main-header') || document.querySelector('header');
    const btnAtualizar = document.querySelector('[onclick*="loadHospitalData"]') || 
                        document.querySelector('.btn-atualizar') ||
                        document.querySelector('button');
    
    const btn = document.createElement('button');
    btn.id = 'btnTemaDashboard';
    btn.className = 'btn-tema-toggle';
    btn.innerHTML = window.dashboardTema === 'escuro' ? 'Tema Claro' : 'Tema Escuro';
    btn.style.cssText = `
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        margin-left: 10px;
    `;
    
    btn.addEventListener('click', () => {
        window.dashboardTema = window.dashboardTema === 'escuro' ? 'claro' : 'escuro';
        btn.innerHTML = window.dashboardTema === 'escuro' ? 'Tema Claro' : 'Tema Escuro';
        
        // Aplicar tema
        aplicarTema();
        
        // Re-renderizar graficos
        window.renderDashboardHospitalar('todos');
    });
    
    // Tentar inserir ao lado do botao Atualizar
    if (btnAtualizar && btnAtualizar.parentNode) {
        btnAtualizar.parentNode.insertBefore(btn, btnAtualizar.nextSibling);
    } else if (header) {
        header.appendChild(btn);
    } else {
        // Fallback: posicao fixa
        btn.style.position = 'fixed';
        btn.style.top = '80px';
        btn.style.right = '20px';
        btn.style.zIndex = '1000';
        document.body.appendChild(btn);
    }
    
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
 * RENDERIZAR TODOS OS HOSPITAIS - BUG CORRIGIDO
 */
function renderTodosHospitais(container) {
    console.log('[DASHBOARD HOSPITALAR] Renderizando todos os hospitais');
    
    const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5'];
    let html = '<div class="dashboard-hospitalar-completo">';
    
    // Loop corrigido - adicionar try/catch para nao quebrar
    hospitais.forEach((hospitalId, index) => {
        try {
            const hospital = window.hospitalData[hospitalId];
            if (!hospital) {
                console.warn(`[DASHBOARD] Hospital ${hospitalId} nao encontrado`);
                return;
            }
            
            console.log(`[DASHBOARD] Processando ${hospitalId}:`, hospital);
            
            html += `
                <div class="hospital-section" id="hospital-${hospitalId}">
                    ${renderHospitalHTML(hospitalId, hospital)}
                </div>
                ${index < hospitais.length - 1 ? '<hr class="hospital-separator">' : ''}
            `;
        } catch (error) {
            console.error(`[DASHBOARD] Erro ao processar ${hospitalId}:`, error);
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Renderizar graficos - try/catch para cada hospital
    setTimeout(() => {
        hospitais.forEach(hospitalId => {
            try {
                const hospital = window.hospitalData[hospitalId];
                if (hospital) {
                    console.log(`[DASHBOARD] Renderizando graficos de ${hospitalId}`);
                    renderGraficosHospital(hospitalId, hospital);
                }
            } catch (error) {
                console.error(`[DASHBOARD] Erro ao renderizar graficos de ${hospitalId}:`, error);
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

        <!-- LINHA 2: KPIS ESPECIFICOS + IDADE MEDIA -->
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

            <!-- GRAFICO 4: REGIAO (COM NUMEROS) -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Beneficiarios por Regiao em ${dataAtual}</h4>
                <canvas id="chart-regiao-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-regiao-${hospitalId}" class="chart-legend-bottom"></div>
            </div>

            <!-- GRAFICO 5: IDADE - REMOVIDO -->
            <!-- Idade Media agora esta nos KPIs -->

            <!-- GRAFICO 6: TIPO OCUPACAO (COM NUMEROS) -->
            <div class="grafico-wrapper">
                <h4 class="grafico-titulo">Tipo de Ocupacao em ${dataAtual}</h4>
                <canvas id="chart-tipo-${hospitalId}" class="chart-canvas"></canvas>
                <div id="legend-tipo-${hospitalId}" class="chart-legend-bottom"></div>
            </div>
        </div>
    `;
}

/**
 * CALCULAR KPIS DO HOSPITAL - CORRIGIDO
 */
function calcularKPIsHospital(hospitalId, hospital) {
    const leitos = hospital.leitos || [];
    const total = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    // EM ALTA - CORRIGIDO
    const emAlta = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const prev = (l.prevAlta || '').toLowerCase();
        return prev.includes('hoje') || prev === '24h';
    }).length;
    
    // APARTAMENTOS OCUPADOS - CORRIGIDO
    const aptosOcupados = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
        return cat.includes('apto') || cat.includes('apartamento');
    }).length;
    
    // ENFERMARIAS OCUPADAS - CORRIGIDO
    const enfsOcupadas = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
        return cat.includes('enf') || cat.includes('enfermaria');
    }).length;
    
    // ENFERMARIAS DISPONIVEIS - CORRIGIDO
    const temEnfermaria = leitos.some(l => {
        const tipo = (l.tipo || '').toLowerCase();
        return tipo.includes('enf') || tipo.includes('enfermaria') || tipo.includes('hibrido');
    });
    
    const enfsDisponiveis = temEnfermaria ? 
        leitos.filter(l => {
            const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
            return cat.includes('enf') || cat.includes('enfermaria');
        }).length : null;
    
    // ISOLAMENTOS - CORRIGIDO E SEPARADO
    const isolamentoResp = leitos.filter(l => 
        (l.isolamento || '').includes('Respirat')
    ).length;
    
    const isolamentoContato = leitos.filter(l => 
        (l.isolamento || '').includes('Contato')
    ).length;
    
    // COM DIRETIVAS - CORRIGIDO
    const comDiretivas = leitos.filter(l => 
        (l.diretivas || '') === 'Sim'
    ).length;
    
    // IDADE MEDIA - NOVO KPI
    const idades = leitos
        .filter(l => l.status === 'ocupado' && l.idade)
        .map(l => parseInt(l.idade));
    
    const idadeMedia = idades.length > 0
        ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length)
        : 0;
    
    return {
        total,
        ocupados,
        vagos,
        ocupacao,
        emAlta,
        aptosOcupados,
        enfsOcupadas,
        enfsDisponiveis,
        temEnfermaria,
        isolamentoResp,
        isolamentoContato,
        comDiretivas,
        idadeMedia
    };
}

/**
 * RENDERIZAR KPIS PRINCIPAIS (LINHA 1)
 */
function renderKPIsPrincipais(kpis) {
    return `
        <!-- GAUGE OCUPACAO -->
        <div class="kpi-box kpi-gauge">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ddd" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#4CAF50" stroke-width="8"
                    stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * kpis.ocupacao / 100)}"
                    transform="rotate(-90 50 50)"/>
            </svg>
            <div class="kpi-value">${kpis.ocupacao}%</div>
            <div class="kpi-label">OCUPACAO</div>
        </div>

        <!-- TOTAL -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.total}</div>
            <div class="kpi-label">TOTAL</div>
        </div>

        <!-- OCUPADOS -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.ocupados}</div>
            <div class="kpi-label">OCUPADOS</div>
        </div>

        <!-- VAGOS -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.vagos}</div>
            <div class="kpi-label">VAGOS</div>
        </div>

        <!-- EM ALTA - CORRIGIDO -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.emAlta}</div>
            <div class="kpi-label">EM ALTA</div>
        </div>
    `;
}

/**
 * RENDERIZAR KPIS LINHA 2 - CORRIGIDO + IDADE MEDIA
 */
function renderKPIsLinha2(hospitalId, kpis) {
    return `
        <!-- APARTAMENTOS OCUPADOS - CORRIGIDO -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.aptosOcupados}</div>
            <div class="kpi-label">APARTAMENTOS</div>
            <div class="kpi-sublabel">OCUPADOS</div>
        </div>

        <!-- ENFERMARIAS OCUPADAS - CORRIGIDO -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.temEnfermaria ? kpis.enfsOcupadas : 'N/A'}</div>
            <div class="kpi-label">ENFERMARIAS</div>
            <div class="kpi-sublabel">OCUPADAS</div>
        </div>

        <!-- ENFERMARIAS DISPONIVEIS - CORRIGIDO -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.enfsDisponiveis !== null ? kpis.enfsDisponiveis : 'N/A'}</div>
            <div class="kpi-label">ENFERMARIAS</div>
            <div class="kpi-sublabel">DISPONIVEIS</div>
        </div>

        <!-- ISOLAMENTOS - CORRIGIDO E SEPARADO -->
        <div class="kpi-box">
            <div class="kpi-value-small">${kpis.isolamentoResp + kpis.isolamentoContato}</div>
            <div class="kpi-label">ISOLAMENTOS</div>
            <div class="kpi-breakdown">
                Resp: ${kpis.isolamentoResp} | Contato: ${kpis.isolamentoContato}
            </div>
        </div>

        <!-- COM DIRETIVAS - CORRIGIDO -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.comDiretivas}</div>
            <div class="kpi-label">COM DIRETIVAS</div>
        </div>

        <!-- IDADE MEDIA - NOVO KPI -->
        <div class="kpi-box">
            <div class="kpi-value">${kpis.idadeMedia}</div>
            <div class="kpi-label">IDADE MEDIA</div>
            <div class="kpi-sublabel">ANOS</div>
        </div>
    `;
}

/**
 * RENDERIZAR GRAFICOS DO HOSPITAL
 */
function renderGraficosHospital(hospitalId, hospital) {
    const leitos = hospital.leitos || [];
    
    // Grafico 1: Altas
    criarGraficoAltas(hospitalId, leitos);
    
    // Grafico 2: Concessoes
    criarGraficoConcessoes(hospitalId, leitos);
    
    // Grafico 3: Linhas de Cuidado
    criarGraficoLinhas(hospitalId, leitos);
    
    // Grafico 4: Regiao (COM NUMEROS)
    criarGraficoRegiao(hospitalId, leitos);
    
    // Grafico 5: Idade - REMOVIDO
    // Agora esta como KPI
    
    // Grafico 6: Tipo Ocupacao (COM NUMEROS)
    criarGraficoTipoOcupacao(hospitalId, leitos);
}

/**
 * GRAFICO 1: ALTAS - COM LARGURA MAXIMA
 */
function criarGraficoAltas(hospitalId, leitos) {
    const canvas = document.getElementById(`chart-altas-${hospitalId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Contar por previsao de alta
    const contadores = {
        'Hoje Ouro': 0,
        'Hoje Prata': 0,
        'Hoje Bronze': 0,
        '24H': 0,
        '48H': 0,
        '72H': 0,
        '96H': 0,
        'SP': 0
    };
    
    leitos.forEach(l => {
        if (l.status === 'ocupado' && l.prevAlta) {
            const prev = l.prevAlta;
            if (contadores.hasOwnProperty(prev)) {
                contadores[prev]++;
            }
        }
    });
    
    const labels = Object.keys(contadores);
    const valores = Object.values(contadores);
    const cores = ['#FFD700', '#C0C0C0', '#CD7F32', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336'];
    
    const corFundo = window.dashboardTema === 'escuro' ? '#0f3460' : '#ffffff';
    const corTexto = window.dashboardTema === 'escuro' ? '#ffffff' : '#333333';
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: corFundo,
                borderWidth: 2,
                maxBarThickness: 80  // LARGURA MAXIMA APLICADA
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
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: corTexto
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-altas-${hospitalId}`, labels, cores, chart);
}

/**
 * GRAFICO 2: CONCESSOES - COM LARGURA MAXIMA
 */
function criarGraficoConcessoes(hospitalId, leitos) {
    const canvas = document.getElementById(`chart-concessoes-${hospitalId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Contar concessoes
    const contadores = {};
    
    leitos.forEach(l => {
        if (l.status === 'ocupado' && l.concessoes && Array.isArray(l.concessoes)) {
            l.concessoes.forEach(c => {
                contadores[c] = (contadores[c] || 0) + 1;
            });
        }
    });
    
    // Ordenar
    const concessoesOrdenadas = Object.entries(contadores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = concessoesOrdenadas.map(c => c[0]);
    const valores = concessoesOrdenadas.map(c => c[1]);
    
    // Buscar cores do api.js
    const cores = labels.map(label => {
        return (window.CORES_CONCESSOES && window.CORES_CONCESSOES[label]) || '#999999';
    });
    
    const corFundo = window.dashboardTema === 'escuro' ? '#0f3460' : '#ffffff';
    const corTexto = window.dashboardTema === 'escuro' ? '#ffffff' : '#333333';
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: corFundo,
                borderWidth: 2,
                maxBarThickness: 80  // LARGURA MAXIMA APLICADA
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: corTexto,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-concessoes-${hospitalId}`, labels, cores, chart);
}

/**
 * GRAFICO 3: LINHAS DE CUIDADO - COM LARGURA MAXIMA
 */
function criarGraficoLinhas(hospitalId, leitos) {
    const canvas = document.getElementById(`chart-linhas-${hospitalId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Contar linhas
    const contadores = {};
    
    leitos.forEach(l => {
        if (l.status === 'ocupado' && l.linhas && Array.isArray(l.linhas)) {
            l.linhas.forEach(linha => {
                contadores[linha] = (contadores[linha] || 0) + 1;
            });
        }
    });
    
    // Ordenar
    const linhasOrdenadas = Object.entries(contadores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const labels = linhasOrdenadas.map(l => l[0]);
    const valores = linhasOrdenadas.map(l => l[1]);
    
    // Buscar cores do api.js
    const cores = labels.map(label => {
        return (window.CORES_LINHAS && window.CORES_LINHAS[label]) || '#999999';
    });
    
    const corFundo = window.dashboardTema === 'escuro' ? '#0f3460' : '#ffffff';
    const corTexto = window.dashboardTema === 'escuro' ? '#ffffff' : '#333333';
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: corFundo,
                borderWidth: 2,
                maxBarThickness: 80  // LARGURA MAXIMA APLICADA
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: corTexto,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-linhas-${hospitalId}`, labels, cores, chart);
}

/**
 * GRAFICO 4: REGIAO - COM NUMEROS NOS SETORES
 */
function criarGraficoRegiao(hospitalId, leitos) {
    const canvas = document.getElementById(`chart-regiao-${hospitalId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Contar por regiao
    const contadores = {};
    
    leitos.forEach(l => {
        if (l.status === 'ocupado' && l.regiao) {
            contadores[l.regiao] = (contadores[l.regiao] || 0) + 1;
        }
    });
    
    const labels = Object.keys(contadores);
    const valores = Object.values(contadores);
    
    const cores = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ];
    
    const corFundo = window.dashboardTema === 'escuro' ? '#0f3460' : '#ffffff';
    
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
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
                },
                // NUMEROS NO GRAFICO
                datalabels: {
                    display: true,
                    color: '#ffffff',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    formatter: (value, context) => {
                        return value;
                    }
                }
            }
        }
    });
    
    // Legenda abaixo
    gerarLegendaAbaixo(`legend-regiao-${hospitalId}`, labels, cores, chart);
}

/**
 * GRAFICO 6: TIPO OCUPACAO - COM NUMEROS NOS SETORES
 */
function criarGraficoTipoOcupacao(hospitalId, leitos) {
    const canvas = document.getElementById(`chart-tipo-${hospitalId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Contar por tipo
    let apartamentos = 0;
    let enfermarias = 0;
    
    leitos.forEach(l => {
        if (l.status === 'ocupado') {
            const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
            if (cat.includes('apto') || cat.includes('apartamento')) {
                apartamentos++;
            } else if (cat.includes('enf') || cat.includes('enfermaria')) {
                enfermarias++;
            }
        }
    });
    
    const corFundo = window.dashboardTema === 'escuro' ? '#0f3460' : '#ffffff';
    
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
                },
                // NUMEROS NO GRAFICO
                datalabels: {
                    display: true,
                    color: '#ffffff',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    formatter: (value, context) => {
                        return value;
                    }
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

console.log('[DASHBOARD HOSPITALAR V3.3.2 CORRIGIDO] Modulo carregado com sucesso');
console.log('[CORRECOES APLICADAS]');
console.log('  - KPIs sem "undefined"');
console.log('  - Botao tema reposicionado');
console.log('  - Largura maxima das barras: 80px');
console.log('  - Grafico de Idade removido');
console.log('  - KPI Idade Media adicionado');
console.log('  - Numeros nos graficos de pizza');
console.log('  - Bug corrigido: todos os 5 hospitais');
