/**
 * DASHBOARD HOSPITALAR V3.3.2 FINAL
 * Guilherme Santoro + Alessandro Rodrigues
 * Data: 19/Outubro/2025
 * 
 * MUDANCAS V3.3.2:
 * - 5 hospitais completos (H1-H5)
 * - Novos KPIs: Apto/Enf ocupados, Isolamentos, Diretivas
 * - KPIs especiais: Cruz Azul (genero) e Santa Clara (limite)
 * - Novos graficos: Regiao (pizza), Idade (area), Tipo Ocupacao (pizza)
 * - Layout igual ao antigo: KPIs em linha, legendas HTML clicaveis
 * - SEM EMOJIS
 */

console.log('[DASHBOARD HOSPITALAR V3.3.2] Inicializando...');

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
            ${index < hospitais.length - 1 ? '<hr style="margin: 40px 0; border: 1px solid #e0e0e0;">' : ''}
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
            <h3 style="text-align: center; margin: 10px 0;">${nomeHospital}</h3>
        </div>

        <!-- KPIS PRINCIPAIS -->
        <div class="kpis-container">
            ${renderKPIsPrincipais(kpis)}
        </div>

        <!-- KPIS ESPECIFICOS DO HOSPITAL -->
        ${renderKPIsEspecificos(hospitalId, kpis)}

        <!-- KPIS NOVOS (Isolamento e Diretivas) -->
        <div class="kpis-secundarios">
            ${renderKPIIsolamento(kpis)}
            ${renderKPIDiretivas(kpis)}
        </div>

        <!-- GRAFICOS -->
        <div class="graficos-container">
            <!-- LINHA 1: Altas e Concessoes -->
            <div class="grafico-row">
                <div class="grafico-wrapper">
                    <h4>Analise Preditiva de Altas em ${dataAtual}</h4>
                    <div class="chart-legend-wrapper">
                        <canvas id="chart-altas-${hospitalId}" width="400" height="300"></canvas>
                        <div id="legend-altas-${hospitalId}" class="chart-legend"></div>
                    </div>
                </div>
                
                <div class="grafico-wrapper">
                    <h4>Concessoes Previstas em ${dataAtual}</h4>
                    <div class="chart-legend-wrapper">
                        <canvas id="chart-concessoes-${hospitalId}" width="400" height="300"></canvas>
                        <div id="legend-concessoes-${hospitalId}" class="chart-legend"></div>
                    </div>
                </div>
            </div>

            <!-- LINHA 2: Linhas de Cuidado -->
            <div class="grafico-row">
                <div class="grafico-wrapper grafico-full">
                    <h4>Linhas de Cuidado em ${dataAtual}</h4>
                    <div class="chart-legend-wrapper">
                        <canvas id="chart-linhas-${hospitalId}" width="800" height="400"></canvas>
                        <div id="legend-linhas-${hospitalId}" class="chart-legend"></div>
                    </div>
                </div>
            </div>

            <!-- LINHA 3: Novos Graficos (Regiao e Idade) -->
            <div class="grafico-row">
                <div class="grafico-wrapper">
                    <h4>Beneficiarios por Regiao em ${dataAtual}</h4>
                    <div class="chart-legend-wrapper">
                        <canvas id="chart-regiao-${hospitalId}" width="400" height="300"></canvas>
                        <div id="legend-regiao-${hospitalId}" class="chart-legend"></div>
                    </div>
                </div>
                
                <div class="grafico-wrapper">
                    <h4>Idade Beneficiarios em ${dataAtual}</h4>
                    <div class="chart-legend-wrapper">
                        <canvas id="chart-idade-${hospitalId}" width="400" height="300"></canvas>
                        <div id="legend-idade-${hospitalId}" class="chart-legend"></div>
                    </div>
                </div>
            </div>

            <!-- LINHA 4: Tipo de Ocupacao -->
            <div class="grafico-row">
                <div class="grafico-wrapper grafico-half">
                    <h4>Tipo de Ocupacao em ${dataAtual}</h4>
                    <div class="chart-legend-wrapper">
                        <canvas id="chart-tipo-${hospitalId}" width="400" height="300"></canvas>
                        <div id="legend-tipo-${hospitalId}" class="chart-legend"></div>
                    </div>
                </div>
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
        if (l.status !== 'ocupado') return 0;
        const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
        return cat.includes('apto') || cat.includes('apartamento');
    }).length;
    
    const enfOcupados = leitos.filter(l => {
        if (l.status !== 'ocupado') return 0;
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
 * RENDERIZAR KPIS PRINCIPAIS
 */
function renderKPIsPrincipais(kpis) {
    return `
        <div class="kpi-box kpi-ocupacao">
            <div class="kpi-gauge">
                <svg viewBox="0 0 100 50" style="width: 100%; height: auto;">
                    <path d="M 10,45 A 40,40 0 0,1 90,45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                    <path d="M 10,45 A 40,40 0 0,1 90,45" fill="none" stroke="#4CAF50" stroke-width="8"
                          stroke-dasharray="${kpis.ocupacao * 1.26} 126" stroke-linecap="round"/>
                    <text x="50" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">
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
 * RENDERIZAR KPIS ESPECIFICOS
 */
function renderKPIsEspecificos(hospitalId, kpis) {
    let html = '<div class="kpis-especificos">';
    
    // KPIS GERAIS (todos hospitais)
    html += `
        <div class="kpi-box-especifico">
            <div class="kpi-value-especifico">${kpis.aptosOcupados}</div>
            <div class="kpi-label-especifico">APARTAMENTOS OCUPADOS</div>
        </div>
        <div class="kpi-box-especifico">
            <div class="kpi-value-especifico">${kpis.enfOcupados}</div>
            <div class="kpi-label-especifico">ENFERMARIAS OCUPADAS</div>
        </div>
    `;
    
    // CRUZ AZUL - Enfermarias por genero
    if (hospitalId === 'H2') {
        html += `
            <div class="kpi-box-especifico kpi-cruz-azul">
                <div class="kpi-label-especifico">ENFERMARIAS DISPONIVEIS</div>
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 10px;">
                    <div>
                        <div class="kpi-value-especifico">${kpis.enfDisponivelM}</div>
                        <div class="kpi-sublabel">Masculino</div>
                    </div>
                    <div>
                        <div class="kpi-value-especifico">${kpis.enfDisponivelF}</div>
                        <div class="kpi-sublabel">Feminino</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // SANTA CLARA - Enfermarias disponiveis
    if (hospitalId === 'H4') {
        html += `
            <div class="kpi-box-especifico kpi-santa-clara">
                <div class="kpi-value-especifico">${kpis.enfSantaClara} de 4</div>
                <div class="kpi-label-especifico">ENFERMARIAS OCUPADAS</div>
                <div class="kpi-sublabel">${kpis.enfSantaClaraDisponiveis} disponiveis</div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

/**
 * RENDERIZAR KPI ISOLAMENTO
 */
function renderKPIIsolamento(kpis) {
    return `
        <div class="kpi-box-isolamento">
            <div class="kpi-value-especifico">${kpis.isolamentos}</div>
            <div class="kpi-label-especifico">ISOLAMENTOS</div>
            <div class="kpi-breakdown">
                <span>${kpis.isoRespiratorio} Respiratorio</span>
                <span>${kpis.isoContato} Contato</span>
            </div>
        </div>
    `;
}

/**
 * RENDERIZAR KPI DIRETIVAS
 */
function renderKPIDiretivas(kpis) {
    return `
        <div class="kpi-box-diretivas">
            <div class="kpi-value-especifico">${kpis.comDiretivas}</div>
            <div class="kpi-label-especifico">COM DIRETIVAS</div>
        </div>
    `;
}

/**
 * RENDERIZAR GRAFICOS DO HOSPITAL
 */
function renderGraficosHospital(hospitalId, hospital) {
    console.log(`[DASHBOARD HOSPITALAR] Renderizando graficos: ${hospitalId}`);
    
    const leitos = hospital.leitos || [];
    const ocupados = leitos.filter(l => l.status === 'ocupado');
    
    // 1. GRAFICO DE ALTAS
    renderGraficoAltas(hospitalId, ocupados);
    
    // 2. GRAFICO DE CONCESSOES
    renderGraficoConcessoes(hospitalId, ocupados);
    
    // 3. GRAFICO DE LINHAS DE CUIDADO
    renderGraficoLinhas(hospitalId, ocupados);
    
    // 4. GRAFICO DE REGIAO (NOVO)
    renderGraficoRegiao(hospitalId, ocupados);
    
    // 5. GRAFICO DE IDADE (NOVO)
    renderGraficoIdade(hospitalId, ocupados);
    
    // 6. GRAFICO DE TIPO OCUPACAO (NOVO)
    renderGraficoTipoOcupacao(hospitalId, ocupados);
}

/**
 * GRAFICO DE ALTAS
 */
function renderGraficoAltas(hospitalId, ocupados) {
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
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px;">Sem dados de altas</p>';
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
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
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Legenda customizada
    gerarLegendaHTML(`legend-altas-${hospitalId}`, labels, colors, chart);
}

/**
 * GRAFICO DE CONCESSOES
 */
function renderGraficoConcessoes(hospitalId, ocupados) {
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
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px;">Sem concessoes</p>';
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
                label: 'Pacientes',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Legenda customizada
    gerarLegendaHTML(`legend-concessoes-${hospitalId}`, labels, colors, chart);
}

/**
 * GRAFICO DE LINHAS DE CUIDADO
 */
function renderGraficoLinhas(hospitalId, ocupados) {
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
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px;">Sem linhas de cuidado</p>';
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
                label: 'Pacientes',
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Legenda customizada
    gerarLegendaHTML(`legend-linhas-${hospitalId}`, labels, colors, chart);
}

/**
 * GRAFICO DE REGIAO (NOVO - PIZZA)
 */
function renderGraficoRegiao(hospitalId, ocupados) {
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
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px;">Sem dados de regiao</p>';
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
                borderColor: '#fff',
                borderWidth: 2
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
    });
    
    // Legenda customizada
    gerarLegendaHTML(`legend-regiao-${hospitalId}`, labels, coresRegiao.slice(0, labels.length), chart);
}

/**
 * GRAFICO DE IDADE (NOVO - AREA)
 */
function renderGraficoIdade(hospitalId, ocupados) {
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
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
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
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * GRAFICO DE TIPO OCUPACAO (NOVO - PIZZA)
 */
function renderGraficoTipoOcupacao(hospitalId, ocupados) {
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
        canvas.parentElement.innerHTML = '<p style="text-align: center; padding: 40px;">Sem dados de tipo</p>';
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
                borderColor: '#fff',
                borderWidth: 2
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
    });
    
    // Legenda customizada
    gerarLegendaHTML(`legend-tipo-${hospitalId}`, ['Apartamento', 'Enfermaria'], ['#4CAF50', '#2196F3'], chart);
}

/**
 * GERAR LEGENDA HTML CLICAVEL
 */
function gerarLegendaHTML(legendId, labels, colors, chart) {
    const legendContainer = document.getElementById(legendId);
    if (!legendContainer) return;
    
    let html = '<div class="legend-items">';
    
    labels.forEach((label, index) => {
        const color = colors[index] || '#999';
        html += `
            <div class="legend-item" data-index="${index}">
                <span class="legend-color" style="background-color: ${color};"></span>
                <span class="legend-label">${label}</span>
            </div>
        `;
    });
    
    html += '</div>';
    legendContainer.innerHTML = html;
    
    // Adicionar eventos de clique
    legendContainer.querySelectorAll('.legend-item').forEach((item, index) => {
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
    /* CONTAINER PRINCIPAL */
    .dashboard-hospitalar-completo,
    .dashboard-hospitalar-individual {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
    }

    .hospital-section {
        margin-bottom: 60px;
    }

    .hospital-header h2 {
        text-align: center;
        font-size: 28px;
        margin-bottom: 10px;
        color: #333;
    }

    .hospital-header h3 {
        text-align: center;
        font-size: 22px;
        color: #666;
        font-weight: normal;
    }

    /* KPIS PRINCIPAIS */
    .kpis-container {
        display: flex;
        gap: 15px;
        margin: 30px 0;
        flex-wrap: wrap;
    }

    .kpi-box {
        flex: 1;
        min-width: 150px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
        text-align: center;
    }

    .kpi-gauge {
        margin-bottom: 10px;
    }

    .kpi-value {
        font-size: 36px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
    }

    .kpi-label {
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* KPIS ESPECIFICOS */
    .kpis-especificos {
        display: flex;
        gap: 15px;
        margin: 20px 0;
        flex-wrap: wrap;
    }

    .kpi-box-especifico {
        flex: 1;
        min-width: 200px;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
    }

    .kpi-value-especifico {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
    }

    .kpi-label-especifico {
        font-size: 11px;
        color: #666;
        text-transform: uppercase;
    }

    .kpi-sublabel {
        font-size: 10px;
        color: #999;
        margin-top: 5px;
    }

    /* KPIS SECUNDARIOS */
    .kpis-secundarios {
        display: flex;
        gap: 15px;
        margin: 20px 0;
        flex-wrap: wrap;
    }

    .kpi-box-isolamento,
    .kpi-box-diretivas {
        flex: 1;
        min-width: 200px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 15px;
        text-align: center;
    }

    .kpi-breakdown {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 10px;
        font-size: 12px;
        color: #666;
    }

    /* GRAFICOS */
    .graficos-container {
        margin-top: 40px;
    }

    .grafico-row {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        flex-wrap: wrap;
    }

    .grafico-wrapper {
        flex: 1;
        min-width: 300px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
    }

    .grafico-wrapper.grafico-full {
        flex: 1 1 100%;
    }

    .grafico-wrapper.grafico-half {
        flex: 1 1 45%;
    }

    .grafico-wrapper h4 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #333;
        text-align: center;
    }

    .chart-legend-wrapper {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }

    .chart-legend-wrapper canvas {
        flex: 1;
        max-height: 300px;
    }

    .chart-legend {
        width: 200px;
        flex-shrink: 0;
    }

    .legend-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .legend-item:hover {
        background: #f5f5f5;
    }

    .legend-item.legend-hidden {
        opacity: 0.4;
    }

    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        flex-shrink: 0;
    }

    .legend-label {
        font-size: 12px;
        color: #333;
    }

    /* MOBILE */
    @media (max-width: 768px) {
        .kpis-container {
            flex-direction: column;
        }

        .kpi-box:first-child {
            order: 1;
        }

        .kpi-box:nth-child(2),
        .kpi-box:nth-child(3) {
            order: 2;
            flex: 1 1 45%;
        }

        .kpi-box:nth-child(4),
        .kpi-box:nth-child(5) {
            order: 3;
            flex: 1 1 45%;
        }

        .grafico-row {
            flex-direction: column;
        }

        .chart-legend-wrapper {
            flex-direction: column;
        }

        .chart-legend {
            width: 100%;
        }
    }
`;

document.head.appendChild(style);

console.log('[DASHBOARD HOSPITALAR V3.3.2] Modulo carregado com sucesso');
