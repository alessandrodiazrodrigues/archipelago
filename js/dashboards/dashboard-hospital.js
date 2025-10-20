/**
 * =====================================================
 * DASHBOARD HOSPITALAR - ARCHIPELAGO V3.3 FINAL
 * =====================================================
 * 
 * Arquivo: dashboard-hospital.js
 * Versão: V3.3 CORRIGIDO
 * Data: 20/Outubro/2025
 * 
 * Correções aplicadas:
 * ✅ Gráfico Ocupação: Conta bloqueados corretamente
 * ✅ Gráfico Previsão Alta: Ordem fixa conforme manual
 * ✅ Gráfico PPS: Ordem fixa com %
 * ✅ Gráfico Concessões: Cores robustas + logs
 * ✅ Gráfico Linhas: Cores robustas + TOP 15 + logs
 * ✅ Tabela: Campo Categoria adicionado
 * ✅ KPIs: Taxa de ocupação considera bloqueados
 * ✅ Funciona para TODOS os 5 hospitais (H1-H5)
 * 
 * Cliente: Guilherme Santoro
 * Desenvolvedor: Alessandro Rodrigues
 * =====================================================
 */

/**
 * =====================================================
 * FUNÇÃO PRINCIPAL: renderizarDashboardHospital
 * =====================================================
 * 
 * Renderiza dashboard completo de um hospital específico
 * 
 * @param {string} hospitalId - ID do hospital (H1, H2, H3, H4, H5)
 * 
 * Estrutura:
 * 1. KPIs principais
 * 2. Gráfico: Ocupação (Vagos/Ocupados/Bloqueados)
 * 3. Gráfico: Previsão de Alta
 * 4. Gráfico: Distribuição PPS
 * 5. Gráfico: Top 10 Concessões
 * 6. Gráfico: Top 15 Linhas de Cuidado
 * 7. Tabela: Lista completa de leitos
 */
window.renderizarDashboardHospital = function(hospitalId) {
    console.log(`🏥 [DASHBOARD HOSPITAL] Renderizando para: ${hospitalId}`);
    
    // Validar hospitalId
    if (!hospitalId || !['H1', 'H2', 'H3', 'H4', 'H5'].includes(hospitalId)) {
        console.error('❌ [DASHBOARD HOSPITAL] Hospital inválido:', hospitalId);
        alert('Erro: Hospital inválido!');
        return;
    }
    
    // Buscar dados do hospital
    const hospital = window.hospitalData?.[hospitalId];
    
    if (!hospital) {
        console.error('❌ [DASHBOARD HOSPITAL] Dados não encontrados para:', hospitalId);
        alert('Erro: Dados do hospital não encontrados!');
        return;
    }
    
    const leitos = hospital.leitos || [];
    console.log(`📊 [DASHBOARD HOSPITAL] ${leitos.length} leitos carregados`);
    
    // =====================================================
    // SEÇÃO 1: CALCULAR KPIs
    // =====================================================
    
    const totalLeitos = leitos.length;
    const leitosVagos = leitos.filter(l => l.status === 'vago' && !l.bloqueado).length;
    const leitosOcupados = leitos.filter(l => l.status === 'ocupado').length;
    const leitosBloqueados = leitos.filter(l => l.bloqueado === true).length;
    
    // Taxa de ocupação: apenas sobre leitos disponíveis (total - bloqueados)
    const leitosDisponiveis = totalLeitos - leitosBloqueados;
    const taxaOcupacao = leitosDisponiveis > 0 
        ? ((leitosOcupados / leitosDisponiveis) * 100).toFixed(1)
        : '0.0';
    
    console.log(`📈 [KPIs] Total: ${totalLeitos} | Vagos: ${leitosVagos} | Ocupados: ${leitosOcupados} | Bloqueados: ${leitosBloqueados} | Taxa: ${taxaOcupacao}%`);
    
    // =====================================================
    // SEÇÃO 2: MONTAR HTML DO DASHBOARD
    // =====================================================
    
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        console.error('❌ [DASHBOARD HOSPITAL] Container não encontrado!');
        return;
    }
    
    container.innerHTML = `
        <!-- HEADER -->
        <div class="dashboard-header">
            <div>
                <h2>${hospital.nome}</h2>
                <p class="subtitle">Dashboard Individual - ${totalLeitos} leitos</p>
            </div>
            <button onclick="window.exportarDashboardPDF('${hospitalId}')" class="btn-export">
                📥 Exportar PDF
            </button>
        </div>
        
        <!-- KPIs -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon">🏥</div>
                <div class="kpi-content">
                    <div class="kpi-label">Total de Leitos</div>
                    <div class="kpi-value">${totalLeitos}</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon" style="background: #10b981">✓</div>
                <div class="kpi-content">
                    <div class="kpi-label">Leitos Vagos</div>
                    <div class="kpi-value">${leitosVagos}</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon" style="background: #f59e0b">👤</div>
                <div class="kpi-content">
                    <div class="kpi-label">Leitos Ocupados</div>
                    <div class="kpi-value">${leitosOcupados}</div>
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-icon" style="background: #ef4444">🚫</div>
                <div class="kpi-content">
                    <div class="kpi-label">Leitos Bloqueados</div>
                    <div class="kpi-value">${leitosBloqueados}</div>
                </div>
            </div>
            
            <div class="kpi-card highlight">
                <div class="kpi-icon" style="background: #3b82f6">📊</div>
                <div class="kpi-content">
                    <div class="kpi-label">Taxa de Ocupação</div>
                    <div class="kpi-value">${taxaOcupacao}%</div>
                    <div class="kpi-subtitle">Sobre ${leitosDisponiveis} disponíveis</div>
                </div>
            </div>
        </div>
        
        <!-- GRÁFICOS -->
        <div class="charts-grid">
            <!-- Gráfico 1: Ocupação -->
            <div class="chart-card">
                <h3>Ocupação de Leitos</h3>
                <canvas id="chartOcupacao${hospitalId}"></canvas>
            </div>
            
            <!-- Gráfico 2: Previsão de Alta -->
            <div class="chart-card">
                <h3>Previsão de Alta</h3>
                <canvas id="chartPrevisaoAlta${hospitalId}"></canvas>
            </div>
            
            <!-- Gráfico 3: PPS -->
            <div class="chart-card">
                <h3>Distribuição PPS</h3>
                <canvas id="chartPPS${hospitalId}"></canvas>
            </div>
            
            <!-- Gráfico 4: Concessões -->
            <div class="chart-card wide">
                <h3>Top 10 Concessões</h3>
                <canvas id="chartConcessoes${hospitalId}"></canvas>
            </div>
            
            <!-- Gráfico 5: Linhas de Cuidado -->
            <div class="chart-card wide">
                <h3>Top 15 Linhas de Cuidado</h3>
                <canvas id="chartLinhas${hospitalId}"></canvas>
            </div>
        </div>
        
        <!-- TABELA DE LEITOS -->
        <div class="table-container">
            <h3>Lista Completa de Leitos</h3>
            <table class="leitos-table">
                <thead>
                    <tr>
                        <th>Leito</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Categoria</th>
                        <th>Paciente</th>
                        <th>Matrícula</th>
                        <th>Idade</th>
                        <th>PPS</th>
                        <th>Previsão Alta</th>
                    </tr>
                </thead>
                <tbody id="tabelaLeitos${hospitalId}">
                    <!-- Preenchido via JS -->
                </tbody>
            </table>
        </div>
    `;
    
    // =====================================================
    // SEÇÃO 3: RENDERIZAR GRÁFICOS
    // =====================================================
    
    // GRÁFICO 1: OCUPAÇÃO
    renderizarGraficoOcupacao(hospitalId, leitosVagos, leitosOcupados, leitosBloqueados);
    
    // GRÁFICO 2: PREVISÃO DE ALTA
    renderizarGraficoPrevisaoAlta(hospitalId, leitos);
    
    // GRÁFICO 3: PPS
    renderizarGraficoPPS(hospitalId, leitos);
    
    // GRÁFICO 4: CONCESSÕES
    renderizarGraficoConcessoes(hospitalId, leitos);
    
    // GRÁFICO 5: LINHAS DE CUIDADO
    renderizarGraficoLinhas(hospitalId, leitos);
    
    // =====================================================
    // SEÇÃO 4: PREENCHER TABELA
    // =====================================================
    
    preencherTabelaLeitos(hospitalId, leitos);
    
    console.log('✅ [DASHBOARD HOSPITAL] Renderizado com sucesso!');
};

/**
 * =====================================================
 * GRÁFICO 1: OCUPAÇÃO DE LEITOS
 * =====================================================
 * 
 * Pizza mostrando: Vagos / Ocupados / Bloqueados
 * 
 * CORREÇÃO V3.3: Agora conta bloqueados corretamente
 */
function renderizarGraficoOcupacao(hospitalId, vagos, ocupados, bloqueados) {
    console.log(`📊 [GRÁFICO OCUPAÇÃO] ${hospitalId}: Vagos=${vagos}, Ocupados=${ocupados}, Bloqueados=${bloqueados}`);
    
    const ctx = document.getElementById(`chartOcupacao${hospitalId}`);
    if (!ctx) {
        console.error('❌ Canvas não encontrado:', `chartOcupacao${hospitalId}`);
        return;
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Vagos', 'Ocupados', 'Bloqueados'],
            datasets: [{
                data: [vagos, ocupados, bloqueados],
                backgroundColor: [
                    '#10b981',  // Verde (vagos)
                    '#f59e0b',  // Laranja (ocupados)
                    '#ef4444'   // Vermelho (bloqueados)
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = vagos + ocupados + bloqueados;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * =====================================================
 * GRÁFICO 2: PREVISÃO DE ALTA
 * =====================================================
 * 
 * Barra horizontal mostrando distribuição de previsões
 * 
 * CORREÇÃO V3.3: Ordem fixa conforme manual
 */
function renderizarGraficoPrevisaoAlta(hospitalId, leitos) {
    console.log(`📊 [GRÁFICO PREVISÃO ALTA] ${hospitalId}`);
    
    const ctx = document.getElementById(`chartPrevisaoAlta${hospitalId}`);
    if (!ctx) {
        console.error('❌ Canvas não encontrado:', `chartPrevisaoAlta${hospitalId}`);
        return;
    }
    
    // Ordem FIXA conforme manual (linha 143)
    const ordemCorreta = [
        'Hoje Ouro', 'Hoje Prata', 'Hoje Bronze',
        '24H', '48H', '72H', '96H', 'SP'
    ];
    
    // Contar por categoria
    const previsaoAltaData = {};
    ordemCorreta.forEach(cat => {
        previsaoAltaData[cat] = leitos.filter(l => 
            l.status === 'ocupado' && l.prevAlta === cat
        ).length;
    });
    
    // Filtrar apenas categorias com dados
    const labels = ordemCorreta.filter(cat => previsaoAltaData[cat] > 0);
    const valores = labels.map(cat => previsaoAltaData[cat]);
    
    console.log(`   Dados: ${JSON.stringify(Object.fromEntries(labels.map((l, i) => [l, valores[i]])))}`);
    
    // Cores por categoria
    const coresPrevisao = {
        'Hoje Ouro': '#FFD700',
        'Hoje Prata': '#C0C0C0',
        'Hoje Bronze': '#CD7F32',
        '24H': '#10b981',
        '48H': '#3b82f6',
        '72H': '#8b5cf6',
        '96H': '#f59e0b',
        'SP': '#6b7280'
    };
    
    const cores = labels.map(l => coresPrevisao[l] || '#999999');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: cores.map(c => c),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} pacientes`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * =====================================================
 * GRÁFICO 3: DISTRIBUIÇÃO PPS
 * =====================================================
 * 
 * Barra vertical mostrando distribuição de PPS
 * 
 * CORREÇÃO V3.3: Ordem fixa com % (manual linha 195)
 */
function renderizarGraficoPPS(hospitalId, leitos) {
    console.log(`📊 [GRÁFICO PPS] ${hospitalId}`);
    
    const ctx = document.getElementById(`chartPPS${hospitalId}`);
    if (!ctx) {
        console.error('❌ Canvas não encontrado:', `chartPPS${hospitalId}`);
        return;
    }
    
    // Ordem FIXA com %
    const ppsOrdem = [
        '10%', '20%', '30%', '40%', '50%',
        '60%', '70%', '80%', '90%', '100%'
    ];
    
    // Contar por categoria
    const ppsData = {};
    ppsOrdem.forEach(pps => {
        ppsData[pps] = leitos.filter(l => 
            l.status === 'ocupado' && l.pps === pps
        ).length;
    });
    
    // Filtrar apenas PPS com dados
    const labels = ppsOrdem.filter(pps => ppsData[pps] > 0);
    const valores = labels.map(pps => ppsData[pps]);
    
    console.log(`   Dados: ${JSON.stringify(Object.fromEntries(labels.map((l, i) => [l, valores[i]])))}`);
    
    // Gradiente de cores (verde → vermelho)
    const cores = labels.map((pps, idx) => {
        const percent = parseInt(pps);
        if (percent <= 30) return '#ef4444'; // Vermelho (pior)
        if (percent <= 50) return '#f59e0b'; // Laranja
        if (percent <= 70) return '#eab308'; // Amarelo
        return '#10b981'; // Verde (melhor)
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `PPS ${context.label}: ${context.parsed.y} pacientes`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * =====================================================
 * GRÁFICO 4: TOP 10 CONCESSÕES
 * =====================================================
 * 
 * Barra horizontal mostrando concessões mais frequentes
 * 
 * CORREÇÃO V3.3: Cores robustas + logs de debug
 */
function renderizarGraficoConcessoes(hospitalId, leitos) {
    console.log(`📊 [GRÁFICO CONCESSÕES] ${hospitalId}`);
    
    const ctx = document.getElementById(`chartConcessoes${hospitalId}`);
    if (!ctx) {
        console.error('❌ Canvas não encontrado:', `chartConcessoes${hospitalId}`);
        return;
    }
    
    // Lista COMPLETA de concessões (para garantir ordem)
    const concessoesOrdenadas = window.CONCESSOES_LISTA || [
        "Transição Domiciliar",
        "Aplicação domiciliar de medicamentos",
        "Aspiração",
        "Banho",
        "Curativo",
        "Curativo PICC",
        "Fisioterapia Domiciliar",
        "Fonoaudiologia Domiciliar",
        "Oxigenoterapia",
        "Remoção",
        "Solicitação domiciliar de exames"
    ];
    
    // Contar ocorrências
    const concessoesCount = {};
    concessoesOrdenadas.forEach(c => concessoesCount[c] = 0);
    
    leitos
        .filter(l => l.status === 'ocupado' && Array.isArray(l.concessoes))
        .forEach(l => {
            l.concessoes.forEach(concessao => {
                if (concessoesCount.hasOwnProperty(concessao)) {
                    concessoesCount[concessao]++;
                } else {
                    console.warn(`⚠️ [CONCESSÕES] Concessão desconhecida: "${concessao}"`);
                }
            });
        });
    
    // Ordenar por frequência (top 10)
    const sortedConcessoes = Object.entries(concessoesCount)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    if (sortedConcessoes.length === 0) {
        console.log('   ℹ️ Nenhuma concessão registrada');
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    const labels = sortedConcessoes.map(([nome]) => nome);
    const valores = sortedConcessoes.map(([_, count]) => count);
    
    console.log(`   Top 10: ${labels.join(', ')}`);
    
    // Buscar cores com FALLBACK ROBUSTO
    const cores = sortedConcessoes.map(([concessao]) => {
        const cor = window.CORES_CONCESSOES?.[concessao];
        
        if (!cor) {
            console.warn(`⚠️ [CORES] Concessão sem cor definida: "${concessao}"`);
            return '#999999';
        }
        
        return cor;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} pacientes`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * =====================================================
 * GRÁFICO 5: TOP 15 LINHAS DE CUIDADO
 * =====================================================
 * 
 * Barra horizontal mostrando linhas mais frequentes
 * 
 * CORREÇÃO V3.3: Cores robustas + TOP 15 + logs de debug
 */
function renderizarGraficoLinhas(hospitalId, leitos) {
    console.log(`📊 [GRÁFICO LINHAS] ${hospitalId}`);
    
    const ctx = document.getElementById(`chartLinhas${hospitalId}`);
    if (!ctx) {
        console.error('❌ Canvas não encontrado:', `chartLinhas${hospitalId}`);
        return;
    }
    
    // Lista COMPLETA de linhas (para garantir ordem)
    const linhasOrdenadas = window.LINHAS_CUIDADO_LISTA || [
        "Assiste",
        "APS SP",
        "Cuidados Paliativos",
        "ICO (Insuficiência Coronariana)",
        "Nexus SP Cardiologia",
        "Nexus SP Gastroentereologia",
        "Nexus SP Geriatria",
        "Nexus SP Pneumologia",
        "Nexus SP Psiquiatria",
        "Nexus SP Reumatologia",
        "Nexus SP Saúde do Fígado",
        "Generalista",
        "Bucomaxilofacial",
        "Cardiologia",
        "Cirurgia Cardíaca",
        "Cirurgia de Cabeça e Pescoço",
        "Cirurgia do Aparelho Digestivo",
        "Cirurgia Geral",
        "Cirurgia Oncológica",
        "Cirurgia Plástica",
        "Cirurgia Torácica",
        "Cirurgia Vascular",
        "Clínica Médica",
        "Coloproctologia",
        "Dermatologia",
        "Endocrinologia",
        "Fisiatria",
        "Gastroenterologia",
        "Geriatria",
        "Ginecologia e Obstetrícia",
        "Hematologia",
        "Infectologia",
        "Mastologia",
        "Nefrologia",
        "Neurocirurgia",
        "Neurologia",
        "Oftalmologia",
        "Oncologia Clínica",
        "Ortopedia",
        "Otorrinolaringologia",
        "Pediatria",
        "Pneumologia",
        "Psiquiatria",
        "Reumatologia",
        "Urologia"
    ];
    
    // Contar ocorrências
    const linhasCount = {};
    linhasOrdenadas.forEach(l => linhasCount[l] = 0);
    
    leitos
        .filter(l => l.status === 'ocupado' && Array.isArray(l.linhas))
        .forEach(l => {
            l.linhas.forEach(linha => {
                if (linhasCount.hasOwnProperty(linha)) {
                    linhasCount[linha]++;
                } else {
                    console.warn(`⚠️ [LINHAS] Linha desconhecida: "${linha}"`);
                }
            });
        });
    
    // Ordenar por frequência (top 15)
    const sortedLinhas = Object.entries(linhasCount)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    if (sortedLinhas.length === 0) {
        console.log('   ℹ️ Nenhuma linha de cuidado registrada');
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    const labels = sortedLinhas.map(([nome]) => nome);
    const valores = sortedLinhas.map(([_, count]) => count);
    
    console.log(`   Top 15: ${labels.join(', ')}`);
    
    // Buscar cores com FALLBACK ROBUSTO
    const cores = sortedLinhas.map(([linha]) => {
        const cor = window.CORES_LINHAS?.[linha];
        
        if (!cor) {
            console.warn(`⚠️ [CORES] Linha sem cor definida: "${linha}"`);
            return '#999999';
        }
        
        return cor;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: valores,
                backgroundColor: cores,
                borderColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} pacientes`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * =====================================================
 * PREENCHER TABELA DE LEITOS
 * =====================================================
 * 
 * Mostra todos os leitos com detalhes
 * 
 * CORREÇÃO V3.3: Campo Categoria adicionado
 */
function preencherTabelaLeitos(hospitalId, leitos) {
    console.log(`📋 [TABELA LEITOS] ${hospitalId}`);
    
    const tbody = document.getElementById(`tabelaLeitos${hospitalId}`);
    if (!tbody) {
        console.error('❌ Tbody não encontrado:', `tabelaLeitos${hospitalId}`);
        return;
    }
    
    tbody.innerHTML = '';
    
    // Ordenar leitos por número
    const leitosOrdenados = [...leitos].sort((a, b) => {
        const numA = parseInt(a.leito) || 0;
        const numB = parseInt(b.leito) || 0;
        return numA - numB;
    });
    
    leitosOrdenados.forEach(leito => {
        // Determinar categoria
        let categoria = '';
        if (leito.tipo === 'Híbrido') {
            // Para híbridos, usar categoria escolhida pelo médico
            categoria = leito.categoria || leito.categoriaEscolhida || '-';
        } else if (leito.tipo === 'APTO') {
            categoria = 'Apartamento';
        } else if (leito.tipo === 'ENFERMARIA') {
            categoria = 'Enfermaria';
        } else {
            categoria = leito.tipo || '-';
        }
        
        // Determinar status visual
        let statusTexto = 'Vago';
        let statusClass = 'vago';
        
        if (leito.bloqueado) {
            statusTexto = 'Bloqueado';
            statusClass = 'bloqueado';
        } else if (leito.status === 'ocupado') {
            statusTexto = 'Ocupado';
            statusClass = 'ocupado';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${leito.leito}</strong></td>
            <td>${leito.tipo || '-'}</td>
            <td>
                <span class="status-badge status-${statusClass}">
                    ${statusTexto}
                </span>
            </td>
            <td><strong>${categoria}</strong></td>
            <td>${leito.nome || '-'}</td>
            <td>${leito.matricula || '-'}</td>
            <td>${leito.idade || '-'}</td>
            <td>${leito.pps || '-'}</td>
            <td>${leito.prevAlta || '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log(`   ✅ ${leitosOrdenados.length} linhas adicionadas`);
}

/**
 * =====================================================
 * EXPORTAR DASHBOARD PARA PDF
 * =====================================================
 * 
 * TODO: Implementar exportação via jsPDF ou html2canvas
 */
window.exportarDashboardPDF = function(hospitalId) {
    console.log(`📥 [EXPORTAR PDF] ${hospitalId}`);
    alert('Funcionalidade de exportação em desenvolvimento!');
};

/**
 * =====================================================
 * LOG DE INICIALIZAÇÃO
 * =====================================================
 */
console.log('✅ [DASHBOARD HOSPITAL] Módulo carregado - V3.3 CORRIGIDO');
console.log('   • 5 hospitais suportados: H1, H2, H3, H4, H5');
console.log('   • 5 gráficos: Ocupação, Previsão Alta, PPS, Concessões (Top 10), Linhas (Top 15)');
console.log('   • Tabela completa com campo Categoria');
console.log('   • Cores robustas com fallback');
console.log('   • Logs de debug habilitados');
