/* =================== DASHBOARD HOSPITALAR V3.3 ===================
   Cliente: Guilherme Santoro
   Desenvolvedor: Alessandro Rodrigues
   Data: Outubro/2025
   Versao: V3.3 FINAL
   
   FUNCIONALIDADES:
   - 5 KPIs principais (Gauge + 4 boxes)
   - KPIs secundarios (Apartamentos, Enfermarias, Isolamentos, Diretivas)
   - 6 Graficos: Altas, Concessoes, Linhas, Regiao, Idade, Ocupacao
   - Legendas clicaveis (toggle on/off)
   - Responsivo (desktop/mobile)
   - Todos os 5 hospitais
   ================================================================== */

/**
 * Funcao principal: Renderiza dashboard de um hospital especifico
 * @param {string} hospitalId - ID do hospital ('H1', 'H2', 'H3', 'H4', 'H5')
 * @param {object} dados - Objeto com dados de todos os hospitais
 */
window.renderDashboardHospitalar = function(hospitalId, dados) {
    console.log('[DASH HOSP] Renderizando dashboard para:', hospitalId);
    
    // Validacoes
    if (!hospitalId) {
        console.error('[DASH HOSP] ID do hospital nao fornecido');
        return;
    }
    
    if (!dados || !dados[hospitalId]) {
        console.error('[DASH HOSP] Dados do hospital nao encontrados:', hospitalId);
        return;
    }
    
    const hospitalData = dados[hospitalId];
    const leitos = hospitalData.leitos || [];
    const nomeHospital = hospitalData.nome || hospitalId;
    
    console.log(`[DASH HOSP] ${nomeHospital}: ${leitos.length} leitos`);
    
    // Container principal
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        console.error('[DASH HOSP] Container nao encontrado');
        return;
    }
    
    // Limpar conteudo anterior
    container.innerHTML = '';
    
    // Criar titulo principal (apenas uma vez, antes do primeiro hospital)
    if (!container.querySelector('.dashboard-hospitalar-titulo')) {
        const titulo = document.createElement('h1');
        titulo.className = 'dashboard-hospitalar-titulo';
        titulo.textContent = 'Dashboard Hospitalar';
        titulo.style.cssText = 'text-align: center; font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 40px 0; padding: 20px 0; border-bottom: 2px solid rgba(255,255,255,0.1);';
        container.appendChild(titulo);
    }
    
    // Calcular KPIs
    const kpis = calcularKPIs(leitos);
    const kpisSecundarios = calcularKPIsSecundarios(leitos, hospitalId);
    
    // Criar secao do hospital
    const hospitalSection = document.createElement('div');
    hospitalSection.className = 'hospital-section';
    hospitalSection.id = `hospital-${hospitalId}`;
    
    // HTML da secao
    hospitalSection.innerHTML = `
        <!-- Header do Hospital -->
        <div class="hospital-header">
            <h2 style="text-align: center;">${nomeHospital}</h2>
            <div class="hospital-stats" style="justify-content: center;">
                <span>Total de ${leitos.length} leitos</span>
                <span class="separator">|</span>
                <span>${kpis.ocupados} ocupados</span>
                <span class="separator">|</span>
                <span>${kpis.vagos} vagos</span>
            </div>
        </div>
        
        <!-- KPIs Principais -->
        <div class="kpis-container">
            <div class="kpis-grid">
                <!-- Gauge de Ocupacao -->
                <div class="kpi-box kpi-gauge">
                    <div class="gauge-container">
                        <svg class="gauge-svg" viewBox="0 0 200 120">
                            <path d="M 20 100 A 80 80 0 0 1 180 100" 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.1)" 
                                  stroke-width="20" 
                                  stroke-linecap="round"/>
                            <path d="M 20 100 A 80 80 0 0 1 180 100" 
                                  fill="none" 
                                  stroke="${kpis.corGauge}" 
                                  stroke-width="20" 
                                  stroke-linecap="round"
                                  stroke-dasharray="${kpis.dasharray}"
                                  stroke-dashoffset="${kpis.dashoffset}"/>
                        </svg>
                        <div class="gauge-value">${kpis.taxaOcupacao}%</div>
                    </div>
                    <div class="gauge-label">OCUPACAO</div>
                </div>
                
                <!-- Total -->
                <div class="kpi-box">
                    <div class="kpi-icon">🏥</div>
                    <div class="kpi-value">${kpis.total}</div>
                    <div class="kpi-label">TOTAL</div>
                </div>
                
                <!-- Ocupados -->
                <div class="kpi-box">
                    <div class="kpi-icon">👤</div>
                    <div class="kpi-value">${kpis.ocupados}</div>
                    <div class="kpi-label">OCUPADOS</div>
                </div>
                
                <!-- Vagos -->
                <div class="kpi-box">
                    <div class="kpi-icon">🔓</div>
                    <div class="kpi-value">${kpis.vagos}</div>
                    <div class="kpi-label">VAGOS</div>
                </div>
                
                <!-- Em Alta -->
                <div class="kpi-box">
                    <div class="kpi-icon">📋</div>
                    <div class="kpi-value">${kpis.emAlta}</div>
                    <div class="kpi-label">EM ALTA</div>
                </div>
            </div>
        </div>
        
        <!-- KPIs Secundarios -->
        <div class="kpis-secondary">
            <!-- Apartamentos -->
            <div class="kpi-card">
                <h4>APARTAMENTOS OCUPADOS</h4>
                <div class="kpi-valor-grande">${kpisSecundarios.apartamentos}</div>
            </div>
            
            <!-- Enfermarias -->
            <div class="kpi-card">
                <h4>ENFERMARIAS OCUPADAS</h4>
                <div class="kpi-valor-grande">${kpisSecundarios.enfermarias}</div>
            </div>
            
            <!-- Isolamentos -->
            <div class="kpi-card ${kpisSecundarios.isolamentoTotal > 0 ? 'kpi-destaque' : ''}">
                <h4>ISOLAMENTOS</h4>
                <div class="kpi-valor-grande">${kpisSecundarios.isolamentoTotal}</div>
                <div class="kpi-detail">
                    <span>Respiratorio: <strong>${kpisSecundarios.isolamentoRespiratorio}</strong></span>
                    <span>Contato: <strong>${kpisSecundarios.isolamentoContato}</strong></span>
                </div>
            </div>
            
            <!-- Diretivas -->
            <div class="kpi-card">
                <h4>DIRETIVAS ANTECIPADAS</h4>
                <div class="kpi-valor-grande">${kpisSecundarios.diretivas}</div>
            </div>
            
            ${kpisSecundarios.htmlExtra}
        </div>
        
        <!-- Graficos -->
        <div class="graficos-section">
            <h3 class="section-title">Analises e Indicadores</h3>
            <div class="graficos-grid">
                <!-- Grafico 1: Altas -->
                <div class="grafico-container">
                    <h4>Analise Preditiva de Altas em ${formatarData()}</h4>
                    <canvas id="chartAltas-${hospitalId}"></canvas>
                    <div class="custom-legend" id="legendAltas-${hospitalId}"></div>
                </div>
                
                <!-- Grafico 2: Concessoes -->
                <div class="grafico-container">
                    <h4>Concessoes Previstas em ${formatarData()}</h4>
                    <canvas id="chartConcessoes-${hospitalId}"></canvas>
                    <div class="custom-legend" id="legendConcessoes-${hospitalId}"></div>
                </div>
                
                <!-- Grafico 3: Linhas -->
                <div class="grafico-container">
                    <h4>Linhas de Cuidado em ${formatarData()}</h4>
                    <canvas id="chartLinhas-${hospitalId}"></canvas>
                    <div class="custom-legend" id="legendLinhas-${hospitalId}"></div>
                </div>
                
                <!-- Grafico 4: Regiao -->
                <div class="grafico-container">
                    <h4>Beneficiarios por Regiao em ${formatarData()}</h4>
                    <canvas id="chartRegiao-${hospitalId}"></canvas>
                    <div class="custom-legend" id="legendRegiao-${hospitalId}"></div>
                </div>
                
                <!-- Grafico 5: Idade -->
                <div class="grafico-container">
                    <h4>Idade Beneficiarios em ${formatarData()}</h4>
                    <canvas id="chartIdade-${hospitalId}"></canvas>
                    <div class="custom-legend" id="legendIdade-${hospitalId}"></div>
                </div>
                
                <!-- Grafico 6: Ocupacao -->
                <div class="grafico-container">
                    <h4>Tipo de Ocupacao em ${formatarData()}</h4>
                    <canvas id="chartOcupacao-${hospitalId}"></canvas>
                    <div class="custom-legend" id="legendOcupacao-${hospitalId}"></div>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(hospitalSection);
    
    // Criar graficos
    setTimeout(() => {
        criarGraficos(hospitalId, leitos);
    }, 100);
};

/**
 * Calcula KPIs principais
 */
function calcularKPIs(leitos) {
    const total = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado' || l.status === 'Em uso').length;
    const vagos = total - ocupados;
    const taxaOcupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    // Contar previsoes de alta (hoje, 24h, 48h, 72h, 96h)
    const emAlta = leitos.filter(l => {
        if (l.status !== 'ocupado' && l.status !== 'Em uso') return false;
        const prevAlta = l.prevAlta || '';
        return prevAlta.includes('Hoje') || 
               prevAlta === '24H' || 
               prevAlta === '48H' || 
               prevAlta === '72H' || 
               prevAlta === '96H';
    }).length;
    
    // Cor do gauge
    let corGauge = '#10b981'; // Verde
    if (taxaOcupacao >= 90) corGauge = '#ef4444'; // Vermelho
    else if (taxaOcupacao >= 70) corGauge = '#f59e0b'; // Amarelo
    
    // Calcular dasharray para SVG (semicirculo = 251.2)
    const dasharray = 251.2;
    const dashoffset = 251.2 - (251.2 * taxaOcupacao / 100);
    
    return {
        total,
        ocupados,
        vagos,
        taxaOcupacao,
        emAlta,
        corGauge,
        dasharray,
        dashoffset
    };
}

/**
 * Calcula KPIs secundarios (novos V3.3)
 */
function calcularKPIsSecundarios(leitos, hospitalId) {
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado' || l.status === 'Em uso');
    
    // Apartamentos e Enfermarias
    const apartamentos = leitosOcupados.filter(l => {
        const cat = l.categoriaEscolhida || l.categoria || l.tipo;
        return cat === 'Apartamento' || cat === 'APTO';
    }).length;
    
    const enfermarias = leitosOcupados.filter(l => {
        const cat = l.categoriaEscolhida || l.categoria || l.tipo;
        return cat === 'Enfermaria' || cat === 'ENFERMARIA' || cat === 'ENF';
    }).length;
    
    // Isolamentos
    const isolamentos = leitosOcupados.filter(l => {
        const iso = l.isolamento || '';
        return iso !== 'Nao Isolamento' && iso !== '';
    });
    
    const isolamentoTotal = isolamentos.length;
    const isolamentoRespiratorio = isolamentos.filter(l => 
        (l.isolamento || '').includes('Respiratorio')
    ).length;
    const isolamentoContato = isolamentos.filter(l => 
        (l.isolamento || '').includes('Contato')
    ).length;
    
    // Diretivas
    const diretivas = leitosOcupados.filter(l => 
        (l.diretivas || '') === 'Sim'
    ).length;
    
    // HTML Extra para hospitais especificos
    let htmlExtra = '';
    
    // H2 - Cruz Azul: Enfermarias por genero
    if (hospitalId === 'H2') {
        const enfH2 = calcularEnfermariasH2(leitos);
        htmlExtra = `
            <div class="kpi-card kpi-destaque">
                <h4>ENFERMARIAS DISPONIVEIS</h4>
                <div class="kpi-detail">
                    <span>Masculino: <strong>${enfH2.masculino} vagas</strong></span>
                    <span>Feminino: <strong>${enfH2.feminino} vagas</strong></span>
                </div>
            </div>
        `;
    }
    
    // H4 - Santa Clara: Enfermarias (max 4)
    if (hospitalId === 'H4') {
        const enfH4 = calcularEnfermariasH4(leitos);
        htmlExtra = `
            <div class="kpi-card kpi-destaque">
                <h4>ENFERMARIAS</h4>
                <div class="kpi-valor-grande">${enfH4.disponiveis} de 4 vagas</div>
            </div>
        `;
    }
    
    return {
        apartamentos,
        enfermarias,
        isolamentoTotal,
        isolamentoRespiratorio,
        isolamentoContato,
        diretivas,
        htmlExtra
    };
}

/**
 * Calcula enfermarias disponiveis H2 - Cruz Azul (por genero)
 */
function calcularEnfermariasH2(leitos) {
    // Leitos 21-36 sao enfermarias
    const enfermarias = leitos.filter(l => l.leito >= 21 && l.leito <= 36);
    
    // Definir leitos irmaos
    const irmaos = {
        21: 22, 22: 21, 23: 24, 24: 23,
        25: 26, 26: 25, 27: 28, 28: 27,
        29: 30, 30: 29, 31: 32, 32: 31,
        33: 34, 34: 33, 35: 36, 36: 35
    };
    
    let dispMasc = 0;
    let dispFem = 0;
    
    enfermarias.forEach(leito => {
        const leitoIrmao = enfermarias.find(l => l.leito === irmaos[leito.leito]);
        
        // Vago
        if (leito.status === 'vago' || leito.status === 'Vago') {
            // Se irmao vago: conta para ambos
            if (!leitoIrmao || leitoIrmao.status === 'vago' || leitoIrmao.status === 'Vago') {
                dispMasc += 0.5;
                dispFem += 0.5;
            }
            // Se irmao ocupado: conta apenas para o genero do irmao
            else {
                const generoIrmao = leitoIrmao.genero || '';
                if (generoIrmao === 'Masculino') dispMasc++;
                else if (generoIrmao === 'Feminino') dispFem++;
            }
        }
    });
    
    return {
        masculino: Math.floor(dispMasc),
        feminino: Math.floor(dispFem)
    };
}

/**
 * Calcula enfermarias disponiveis H4 - Santa Clara (max 4)
 */
function calcularEnfermariasH4(leitos) {
    // Leitos 10-13 sao enfermarias
    const enfermarias = leitos.filter(l => l.leito >= 10 && l.leito <= 13);
    const ocupadas = enfermarias.filter(l => l.status === 'ocupado' || l.status === 'Em uso').length;
    const disponiveis = 4 - ocupadas;
    
    return {
        total: 4,
        ocupadas,
        disponiveis
    };
}

/**
 * Cria todos os 6 graficos
 */
function criarGraficos(hospitalId, leitos) {
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado' || l.status === 'Em uso');
    
    // 1. Grafico de Altas
    criarGraficoAltas(hospitalId, leitosOcupados);
    
    // 2. Grafico de Concessoes
    criarGraficoConcessoes(hospitalId, leitosOcupados);
    
    // 3. Grafico de Linhas
    criarGraficoLinhas(hospitalId, leitosOcupados);
    
    // 4. Grafico de Regiao (Pizza)
    criarGraficoRegiao(hospitalId, leitosOcupados);
    
    // 5. Grafico de Idade (Barras)
    criarGraficoIdade(hospitalId, leitosOcupados);
    
    // 6. Grafico de Ocupacao (Pizza)
    criarGraficoOcupacao(hospitalId, leitosOcupados);
}

/**
 * Grafico 1: Analise Preditiva de Altas (Barras Verticais)
 */
function criarGraficoAltas(hospitalId, leitos) {
    const canvas = document.getElementById(`chartAltas-${hospitalId}`);
    if (!canvas) return;
    
    // Contar por previsao
    const previsoes = {
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
        const prev = l.prevAlta || 'SP';
        if (previsoes.hasOwnProperty(prev)) {
            previsoes[prev]++;
        }
    });
    
    // Filtrar apenas com valores > 0
    const labels = [];
    const data = [];
    const colors = [];
    
    const coresPrevisao = {
        'Hoje Ouro': '#FFD700',
        'Hoje Prata': '#C0C0C0',
        'Hoje Bronze': '#CD7F32',
        '24H': '#10b981',
        '48H': '#3b82f6',
        '72H': '#8b5cf6',
        '96H': '#ec4899',
        'SP': '#6b7280'
    };
    
    Object.keys(previsoes).forEach(key => {
        if (previsoes[key] > 0) {
            labels.push(key);
            data.push(previsoes[key]);
            colors.push(coresPrevisao[key] || '#6b7280');
        }
    });
    
    // Se nao houver dados
    if (data.length === 0) {
        canvas.parentElement.innerHTML += '<p class="no-data">Nenhum dado disponivel</p>';
        return;
    }
    
    // Criar grafico
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} paciente(s)`;
                        }
                    }
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
    
    // Criar legenda clicavel
    criarLegendaClicavel(`chartAltas-${hospitalId}`, labels, data, colors, chart);
}

/**
 * Grafico 2: Concessoes Previstas (Barras Verticais)
 */
function criarGraficoConcessoes(hospitalId, leitos) {
    const canvas = document.getElementById(`chartConcessoes-${hospitalId}`);
    if (!canvas) return;
    
    // Contar concessoes
    const concessoes = {};
    
    leitos.forEach(l => {
        const conc = l.concessoes || [];
        conc.forEach(c => {
            concessoes[c] = (concessoes[c] || 0) + 1;
        });
    });
    
    // Ordenar por quantidade (decrescente)
    const sorted = Object.entries(concessoes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
    
    if (sorted.length === 0) {
        canvas.parentElement.innerHTML += '<p class="no-data">Nenhuma concessao ativa</p>';
        return;
    }
    
    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);
    const colors = labels.map(label => obterCorPantone(label, 'concessao'));
    
    // Criar grafico
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} paciente(s)`;
                        }
                    }
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
    
    // Criar legenda clicavel
    criarLegendaClicavel(`chartConcessoes-${hospitalId}`, labels, data, colors, chart);
}

/**
 * Grafico 3: Linhas de Cuidado (Barras Verticais)
 */
function criarGraficoLinhas(hospitalId, leitos) {
    const canvas = document.getElementById(`chartLinhas-${hospitalId}`);
    if (!canvas) return;
    
    // Contar linhas
    const linhas = {};
    
    leitos.forEach(l => {
        const lin = l.linhas || [];
        lin.forEach(linha => {
            linhas[linha] = (linhas[linha] || 0) + 1;
        });
    });
    
    // Ordenar por quantidade (decrescente)
    const sorted = Object.entries(linhas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
    
    if (sorted.length === 0) {
        canvas.parentElement.innerHTML += '<p class="no-data">Nenhuma linha de cuidado ativa</p>';
        return;
    }
    
    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);
    const colors = labels.map(label => obterCorPantone(label, 'linha'));
    
    // Criar grafico
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} paciente(s)`;
                        }
                    }
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
    
    // Criar legenda clicavel
    criarLegendaClicavel(`chartLinhas-${hospitalId}`, labels, data, colors, chart);
}

/**
 * Grafico 4: Beneficiarios por Regiao (Pizza)
 */
function criarGraficoRegiao(hospitalId, leitos) {
    const canvas = document.getElementById(`chartRegiao-${hospitalId}`);
    if (!canvas) return;
    
    // Contar por regiao
    const regioes = {};
    
    leitos.forEach(l => {
        const reg = l.regiao || 'Nao informado';
        regioes[reg] = (regioes[reg] || 0) + 1;
    });
    
    // Ordenar
    const sorted = Object.entries(regioes)
        .sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) {
        canvas.parentElement.innerHTML += '<p class="no-data">Nenhum dado de regiao</p>';
        return;
    }
    
    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);
    
    // Cores para regioes (paleta Pantone)
    const coresRegioes = [
        '#ED0A72', '#007A33', '#00B5A2', '#A6192E', '#C8102E',
        '#455A64', '#5A0020', '#8B1874', '#2E1A47'
    ];
    const colors = labels.map((_, idx) => coresRegioes[idx % coresRegioes.length]);
    
    // Criar grafico
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Criar legenda clicavel
    criarLegendaClicavel(`chartRegiao-${hospitalId}`, labels, data, colors, chart);
}

/**
 * Grafico 5: Idade Beneficiarios (Barras Verticais - Faixas Etarias)
 */
function criarGraficoIdade(hospitalId, leitos) {
    const canvas = document.getElementById(`chartIdade-${hospitalId}`);
    if (!canvas) return;
    
    // Agrupar por faixa etaria
    const faixas = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81+': 0
    };
    
    leitos.forEach(l => {
        const idade = parseInt(l.idade) || 0;
        if (idade === 0) return; // Ignora idades nao informadas
        
        if (idade <= 20) faixas['0-20']++;
        else if (idade <= 40) faixas['21-40']++;
        else if (idade <= 60) faixas['41-60']++;
        else if (idade <= 80) faixas['61-80']++;
        else faixas['81+']++;
    });
    
    const labels = Object.keys(faixas);
    const data = Object.values(faixas);
    
    // Verificar se ha dados
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) {
        canvas.parentElement.innerHTML += '<p class="no-data">Nenhum dado de idade</p>';
        return;
    }
    
    // Cores para faixas (gradiente)
    const colors = [
        '#10b981', // Verde
        '#3b82f6', // Azul
        '#8b5cf6', // Roxo
        '#f59e0b', // Amarelo
        '#ef4444'  // Vermelho
    ];
    
    // Criar grafico
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const percent = ((context.parsed.y / total) * 100).toFixed(1);
                            return `${context.parsed.y} paciente(s) (${percent}%)`;
                        }
                    }
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
    
    // Criar legenda clicavel
    criarLegendaClicavel(`chartIdade-${hospitalId}`, labels, data, colors, chart);
}

/**
 * Grafico 6: Tipo de Ocupacao (Pizza)
 */
function criarGraficoOcupacao(hospitalId, leitos) {
    const canvas = document.getElementById(`chartOcupacao-${hospitalId}`);
    if (!canvas) return;
    
    // Contar por tipo
    let apartamentos = 0;
    let enfermarias = 0;
    
    leitos.forEach(l => {
        const cat = l.categoriaEscolhida || l.categoria || l.tipo || '';
        if (cat === 'Apartamento' || cat === 'APTO') {
            apartamentos++;
        } else if (cat === 'Enfermaria' || cat === 'ENFERMARIA' || cat === 'ENF') {
            enfermarias++;
        }
    });
    
    if (apartamentos === 0 && enfermarias === 0) {
        canvas.parentElement.innerHTML += '<p class="no-data">Nenhum dado de tipo de ocupacao</p>';
        return;
    }
    
    const labels = ['Apartamento', 'Enfermaria'];
    const data = [apartamentos, enfermarias];
    const colors = ['#3b82f6', '#f59e0b']; // Azul e Amarelo
    
    // Criar grafico
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Criar legenda clicavel
    criarLegendaClicavel(`chartOcupacao-${hospitalId}`, labels, data, colors, chart);
}

/**
 * Cria legenda clicavel (toggle on/off)
 */
function criarLegendaClicavel(chartId, labels, data, colors, chart) {
    const legendContainer = document.getElementById(`legend${chartId.replace('chart', '')}`);
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '<div class="legend-items"></div>';
    const legendItems = legendContainer.querySelector('.legend-items');
    
    labels.forEach((label, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.setAttribute('data-index', index);
        
        item.innerHTML = `
            <span class="legend-color" style="background-color: ${colors[index]}"></span>
            <span class="legend-label">${label}</span>
            <span class="legend-value">${data[index]}</span>
        `;
        
        // Click handler
        item.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const meta = chart.getDatasetMeta(0);
            
            // Toggle visibility
            meta.data[idx].hidden = !meta.data[idx].hidden;
            
            // Update styles
            if (meta.data[idx].hidden) {
                this.style.opacity = '0.4';
                this.style.textDecoration = 'line-through';
            } else {
                this.style.opacity = '1';
                this.style.textDecoration = 'none';
            }
            
            chart.update();
        });
        
        legendItems.appendChild(item);
    });
}

/**
 * Formata data atual (DD/MM/YYYY)
 */
function formatarData() {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

/**
 * Obtem cor Pantone da paleta (concessao ou linha)
 */
function obterCorPantone(item, tipo) {
    // Cores das concessoes (window.CORES_CONCESSOES)
    if (tipo === 'concessao' && window.CORES_CONCESSOES) {
        return window.CORES_CONCESSOES[item] || '#6b7280';
    }
    
    // Cores das linhas (window.CORES_LINHAS)
    if (tipo === 'linha' && window.CORES_LINHAS) {
        return window.CORES_LINHAS[item] || '#6b7280';
    }
    
    // Cor padrao (cinza)
    return '#6b7280';
}

/* =================== FIM DO ARQUIVO =================== */
console.log('[DASH HOSP] dashboard-hospital.js V3.3 carregado');
