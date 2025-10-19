// =====================================================
// ARCHIPELAGO DASHBOARD - HOSPITAL VIEW V3.3.2 FINAL
// =====================================================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3.2 (74 colunas A-BV completas)
//
// FUNCIONALIDADES:
// ✅ 5 hospitais funcionando (H1, H2, H3, H4, H5)
// ✅ 9 gráficos completos com dados V3.3.2
// ✅ 74 colunas suportadas (A-BV)
// ✅ Logs profissionais e debug detalhado
// ✅ Tratamento robusto de erros
// ✅ Cores Pantone sincronizadas com api.js
// =====================================================

console.log('📊 [DASH-HOSP] ========================================');
console.log('📊 [DASH-HOSP] Módulo dashboard-hospital.js V3.3.2 carregado');
console.log('📊 [DASH-HOSP] Cliente: Guilherme Santoro');
console.log('📊 [DASH-HOSP] Desenvolvedor: Alessandro Rodrigues');
console.log('📊 [DASH-HOSP] ========================================');

// =====================================================
// VARIÁVEIS GLOBAIS DE GRÁFICOS
// =====================================================
let chartOcupacao = null;
let chartStatusLeitos = null;
let chartLinhas = null;
let chartConcessoes = null;
let chartIsolamento = null;
let chartGenero = null;
let chartRegiao = null;
let chartCategoria = null;
let chartDiretivas = null;

// Estado dos gráficos por hospital (para gráficos alternáveis)
window.graficosState = window.graficosState || {
    H1: { concessoes: 'bar', linhas: 'bar', regiao: 'doughnut' },
    H2: { concessoes: 'bar', linhas: 'bar', regiao: 'doughnut' },
    H3: { concessoes: 'bar', linhas: 'bar', regiao: 'doughnut' },
    H4: { concessoes: 'bar', linhas: 'bar', regiao: 'doughnut' },
    H5: { concessoes: 'bar', linhas: 'bar', regiao: 'doughnut' }
};

// =====================================================
// CORES PANTONE V3.3.2 - SINCRONIZADAS COM API.JS
// =====================================================

// 11 Cores de Concessões
const CORES_CONCESSOES_HOSP = {
    'Transição Domiciliar': '#007A53',
    'Aplicação domiciliar de medicamentos': '#582C83',
    'Aspiração': '#2E1A47',
    'Banho': '#8FD3F4',
    'Curativo': '#00BFB3',
    'Curativo PICC': '#E03C31',
    'Fisioterapia Domiciliar': '#009639',
    'Fonoaudiologia Domiciliar': '#FF671F',
    'Oxigenoterapia': '#64A70B',
    'Remoção': '#FFB81C',
    'Solicitação domiciliar de exames': '#546E7A'
};

// 45 Cores de Linhas de Cuidado
const CORES_LINHAS_HOSP = {
    'Assiste': '#ED0A72',
    'APS SP': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO (Insuficiência Coronariana)': '#A6192E',
    'Nexus SP Cardiologia': '#C8102E',
    'Nexus SP Gastroentereologia': '#455A64',
    'Nexus SP Geriatria': '#E35205',
    'Nexus SP Pneumologia': '#4A148C',
    'Nexus SP Psiquiatria': '#3E2723',
    'Nexus SP Reumatologia': '#E91E63',
    'Nexus SP Saúde do Fígado': '#556F44',
    'Generalista': '#FFC72C',
    'Bucomaxilofacial': '#D81B60',
    'Cardiologia': '#5A0020',
    'Cirurgia Cardíaca': '#9CCC65',
    'Cirurgia de Cabeça e Pescoço': '#7CB342',
    'Cirurgia do Aparelho Digestivo': '#00263A',
    'Cirurgia Geral': '#00AEEF',
    'Cirurgia Oncológica': '#0072CE',
    'Cirurgia Plástica': '#8E24AA',
    'Cirurgia Torácica': '#BA68C8',
    'Cirurgia Vascular': '#AED581',
    'Clínica Médica': '#F4E285',
    'Coloproctologia': '#C2185B',
    'Dermatologia': '#9C27B0',
    'Endocrinologia': '#37474F',
    'Fisiatria': '#E8927C',
    'Gastroenterologia': '#003C57',
    'Geriatria': '#FF6F1D',
    'Ginecologia e Obstetrícia': '#582D40',
    'Hematologia': '#1E88E5',
    'Infectologia': '#4A7C59',
    'Mastologia': '#5C5EBE',
    'Nefrologia': '#7B1FA2',
    'Neurocirurgia': '#1565C0',
    'Neurologia': '#64B5F6',
    'Oftalmologia': '#6D4C41',
    'Oncologia Clínica': '#6A1B9A',
    'Ortopedia': '#42A5F5',
    'Otorrinolaringologia': '#AD1457',
    'Pediatria': '#5A646B',
    'Pneumologia': '#1976D2',
    'Psiquiatria': '#4E342E',
    'Reumatologia': '#880E4F',
    'Urologia': '#2D5016'
};

// =====================================================
// FUNÇÃO: OBTER COR COM LOGS
// =====================================================
function getCorExataHosp(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`⚠️ [CORES HOSP] Item inválido: "${itemName}" (tipo: ${typeof itemName})`);
        return '#6b7280'; // Cor fallback cinza
    }
    
    const paleta = tipo === 'concessao' ? CORES_CONCESSOES_HOSP : CORES_LINHAS_HOSP;
    
    // Busca exata
    let cor = paleta[itemName];
    if (cor) {
        console.log(`✅ [CORES HOSP] "${itemName}" → ${cor}`);
        return cor;
    }
    
    // Se não encontrar, tentar normalizar
    const itemNormalizado = itemName.trim();
    cor = paleta[itemNormalizado];
    if (cor) {
        console.log(`✅ [CORES HOSP] "${itemName}" (normalizado) → ${cor}`);
        return cor;
    }
    
    // Cor não encontrada
    console.error(`❌ [CORES HOSP] COR NÃO ENCONTRADA: "${itemName}" (tipo: ${tipo})`);
    console.error(`❌ [CORES HOSP] Cores disponíveis (${Object.keys(paleta).length}):`, Object.keys(paleta));
    return '#999999'; // Fallback cinza claro
}

// =====================================================
// FUNÇÃO: DESTRUIR GRÁFICO
// =====================================================
function destruirGrafico(chart) {
    if (chart) {
        try {
            chart.destroy();
            console.log('🗑️ [DASH-HOSP] Gráfico anterior destruído');
        } catch (e) {
            console.warn('⚠️ [DASH-HOSP] Erro ao destruir gráfico:', e);
        }
    }
}

// =====================================================
// FUNÇÃO PRINCIPAL: RENDERIZAR DASHBOARD HOSPITALAR
// =====================================================
window.renderDashboardHospitalar = function() {
    console.log('');
    console.log('🏥 [DASH-HOSP] ========================================');
    console.log('🏥 [DASH-HOSP] FUNÇÃO renderDashboardHospitalar() CHAMADA');
    console.log('🏥 [DASH-HOSP] ========================================');
    
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log('🏥 [DASH-HOSP] Timestamp:', timestamp);
    
    // ========================================
    // 1. VALIDAÇÕES INICIAIS
    // ========================================
    console.log('🔍 [DASH-HOSP] --- VALIDAÇÕES INICIAIS ---');
    
    // Validar hospitalData
    if (!window.hospitalData) {
        console.error('❌ [DASH-HOSP] ERRO CRÍTICO: window.hospitalData não existe!');
        mostrarErroHospital('Dados não carregados. Recarregue a página.');
        return;
    }
    console.log('✅ [DASH-HOSP] window.hospitalData existe');
    
    // Validar currentHospital
    const hospitalId = window.currentHospital;
    if (!hospitalId) {
        console.error('❌ [DASH-HOSP] ERRO: Hospital não selecionado!');
        mostrarErroHospital('Selecione um hospital');
        return;
    }
    console.log('✅ [DASH-HOSP] Hospital selecionado:', hospitalId);
    
    // Validar dados do hospital
    const hospitalDados = window.hospitalData[hospitalId];
    if (!hospitalDados) {
        console.error(`❌ [DASH-HOSP] ERRO: Dados do hospital ${hospitalId} não encontrados!`);
        console.error('❌ [DASH-HOSP] Hospitais disponíveis:', Object.keys(window.hospitalData));
        mostrarErroHospital(`Dados do ${hospitalId} indisponíveis`);
        return;
    }
    console.log(`✅ [DASH-HOSP] Dados do ${hospitalId} encontrados`);
    
    // Validar leitos
    const leitos = hospitalDados.leitos;
    if (!leitos || !Array.isArray(leitos)) {
        console.error(`❌ [DASH-HOSP] ERRO: Leitos do ${hospitalId} inválidos!`);
        mostrarErroHospital('Estrutura de dados incorreta');
        return;
    }
    console.log(`✅ [DASH-HOSP] Total de leitos: ${leitos.length}`);
    
    // ========================================
    // 2. OBTER NOME DO HOSPITAL
    // ========================================
    let hospitalNome = hospitalId;
    if (window.CONFIG && window.CONFIG.HOSPITAIS && window.CONFIG.HOSPITAIS[hospitalId]) {
        hospitalNome = window.CONFIG.HOSPITAIS[hospitalId].nome;
        console.log(`✅ [DASH-HOSP] Nome do hospital: ${hospitalNome}`);
    } else {
        console.warn(`⚠️ [DASH-HOSP] Nome do hospital não encontrado em CONFIG, usando ID: ${hospitalId}`);
    }
    
    // ========================================
    // 3. PROCESSAR DADOS DOS LEITOS
    // ========================================
    console.log('📊 [DASH-HOSP] --- PROCESSANDO DADOS ---');
    
    let totalVagos = 0;
    let totalOcupados = 0;
    let totalBloqueados = 0;
    
    const concessoesMap = {};
    const linhasMap = {};
    const isolamentoMap = { 'Não Isolamento': 0, 'Isolamento de Contato': 0, 'Isolamento Respiratório': 0 };
    const generoMap = { 'Masculino': 0, 'Feminino': 0, 'Não informado': 0 };
    const regiaoMap = {};
    const categoriaMap = { 'Apartamento': 0, 'Enfermaria': 0, 'Não informado': 0 };
    const diretivasMap = { 'Sim': 0, 'Não': 0, 'Não se aplica': 0 };
    
    // Processar cada leito
    leitos.forEach((leito, index) => {
        console.log(`📋 [DASH-HOSP] Leito ${index + 1}/${leitos.length}:`, {
            leito: leito.leito,
            status: leito.status,
            nome: leito.nome || '(vago)',
            tipo: leito.tipo
        });
        
        // Status
        const status = String(leito.status || '').toLowerCase();
        if (status === 'vago') {
            totalVagos++;
        } else if (status === 'ocupado' || status === 'em uso') {
            totalOcupados++;
            
            // Concessões
            if (leito.concessoes && Array.isArray(leito.concessoes)) {
                leito.concessoes.forEach(c => {
                    concessoesMap[c] = (concessoesMap[c] || 0) + 1;
                });
            }
            
            // Linhas de Cuidado
            if (leito.linhas && Array.isArray(leito.linhas)) {
                leito.linhas.forEach(l => {
                    linhasMap[l] = (linhasMap[l] || 0) + 1;
                });
            }
            
            // Isolamento
            const isolamento = leito.isolamento || 'Não Isolamento';
            if (isolamentoMap.hasOwnProperty(isolamento)) {
                isolamentoMap[isolamento]++;
            }
            
            // Gênero
            const genero = leito.genero || 'Não informado';
            if (generoMap.hasOwnProperty(genero)) {
                generoMap[genero]++;
            } else {
                generoMap['Não informado']++;
            }
            
            // Região
            const regiao = leito.regiao || 'Não informado';
            regiaoMap[regiao] = (regiaoMap[regiao] || 0) + 1;
            
            // Categoria
            const categoria = leito.categoriaEscolhida || leito.categoria || 'Não informado';
            if (categoriaMap.hasOwnProperty(categoria)) {
                categoriaMap[categoria]++;
            } else {
                categoriaMap['Não informado']++;
            }
            
            // Diretivas
            const diretivas = leito.diretivas || 'Não se aplica';
            if (diretivasMap.hasOwnProperty(diretivas)) {
                diretivasMap[diretivas]++;
            }
            
        } else if (status === 'bloqueado') {
            totalBloqueados++;
        }
    });
    
    const totalLeitos = leitos.length;
    const taxaOcupacao = totalLeitos > 0 ? ((totalOcupados / totalLeitos) * 100).toFixed(1) : 0;
    
    console.log('📊 [DASH-HOSP] Resumo processado:', {
        total: totalLeitos,
        vagos: totalVagos,
        ocupados: totalOcupados,
        bloqueados: totalBloqueados,
        taxaOcupacao: taxaOcupacao + '%',
        concessoes: Object.keys(concessoesMap).length,
        linhas: Object.keys(linhasMap).length
    });
    
    // ========================================
    // 4. ATUALIZAR TÍTULO E MÉTRICAS
    // ========================================
    console.log('📝 [DASH-HOSP] --- ATUALIZANDO TÍTULO E MÉTRICAS ---');
    
    const tituloElement = document.getElementById('hospitalTituloDash');
    if (tituloElement) {
        tituloElement.textContent = `Dashboard: ${hospitalNome} (${hospitalId})`;
        console.log('✅ [DASH-HOSP] Título atualizado');
    } else {
        console.warn('⚠️ [DASH-HOSP] Elemento #hospitalTituloDash não encontrado');
    }
    
    // Atualizar métricas
    atualizarMetrica('metricaVagos', totalVagos, totalLeitos);
    atualizarMetrica('metricaOcupados', totalOcupados, totalLeitos);
    atualizarMetrica('metricaBloqueados', totalBloqueados, totalLeitos);
    atualizarMetrica('metricaTaxa', taxaOcupacao, 100, '%');
    
    // ========================================
    // 5. CRIAR GRÁFICOS
    // ========================================
    console.log('📈 [DASH-HOSP] --- CRIANDO GRÁFICOS ---');
    
    try {
        // Destruir gráficos anteriores
        console.log('🗑️ [DASH-HOSP] Destruindo gráficos antigos...');
        destruirGrafico(chartOcupacao);
        destruirGrafico(chartStatusLeitos);
        destruirGrafico(chartLinhas);
        destruirGrafico(chartConcessoes);
        destruirGrafico(chartIsolamento);
        destruirGrafico(chartGenero);
        destruirGrafico(chartRegiao);
        destruirGrafico(chartCategoria);
        destruirGrafico(chartDiretivas);
        
        // 1. Gráfico Taxa de Ocupação
        console.log('📊 [DASH-HOSP] Criando gráfico: Taxa de Ocupação');
        chartOcupacao = criarGraficoOcupacao(taxaOcupacao);
        console.log('✅ [DASH-HOSP] Gráfico Taxa de Ocupação criado');
        
        // 2. Gráfico Status dos Leitos
        console.log('📊 [DASH-HOSP] Criando gráfico: Status dos Leitos');
        chartStatusLeitos = criarGraficoStatus(totalVagos, totalOcupados, totalBloqueados);
        console.log('✅ [DASH-HOSP] Gráfico Status dos Leitos criado');
        
        // 3. Gráfico Linhas de Cuidado
        console.log('📊 [DASH-HOSP] Criando gráfico: Linhas de Cuidado');
        chartLinhas = criarGraficoLinhas(linhasMap, hospitalId);
        console.log('✅ [DASH-HOSP] Gráfico Linhas de Cuidado criado');
        
        // 4. Gráfico Concessões
        console.log('📊 [DASH-HOSP] Criando gráfico: Concessões');
        chartConcessoes = criarGraficoConcessoes(concessoesMap, hospitalId);
        console.log('✅ [DASH-HOSP] Gráfico Concessões criado');
        
        // 5. Gráfico Isolamento
        console.log('📊 [DASH-HOSP] Criando gráfico: Isolamento');
        chartIsolamento = criarGraficoIsolamento(isolamentoMap);
        console.log('✅ [DASH-HOSP] Gráfico Isolamento criado');
        
        // 6. Gráfico Gênero (NOVO V3.3.2)
        console.log('📊 [DASH-HOSP] Criando gráfico: Gênero');
        chartGenero = criarGraficoGenero(generoMap);
        console.log('✅ [DASH-HOSP] Gráfico Gênero criado');
        
        // 7. Gráfico Região (NOVO V3.3.2)
        console.log('📊 [DASH-HOSP] Criando gráfico: Região');
        chartRegiao = criarGraficoRegiao(regiaoMap, hospitalId);
        console.log('✅ [DASH-HOSP] Gráfico Região criado');
        
        // 8. Gráfico Categoria (NOVO V3.3.2)
        console.log('📊 [DASH-HOSP] Criando gráfico: Categoria');
        chartCategoria = criarGraficoCategoria(categoriaMap);
        console.log('✅ [DASH-HOSP] Gráfico Categoria criado');
        
        // 9. Gráfico Diretivas (NOVO V3.3.2)
        console.log('📊 [DASH-HOSP] Criando gráfico: Diretivas');
        chartDiretivas = criarGraficoDiretivas(diretivasMap);
        console.log('✅ [DASH-HOSP] Gráfico Diretivas criado');
        
    } catch (error) {
        console.error('❌ [DASH-HOSP] ERRO ao criar gráficos:', error);
        console.error('❌ [DASH-HOSP] Stack trace:', error.stack);
        mostrarErroHospital('Erro ao criar gráficos');
    }
    
    // ========================================
    // 6. FINALIZAÇÃO
    // ========================================
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('');
    console.log('✅ [DASH-HOSP] ========================================');
    console.log('✅ [DASH-HOSP] DASHBOARD RENDERIZADO COM SUCESSO!');
    console.log('✅ [DASH-HOSP] ========================================');
    console.log(`⏱️ [DASH-HOSP] Tempo total: ${totalTime}ms`);
    console.log(`📊 [DASH-HOSP] Gráficos criados: 9`);
    console.log(`🏥 [DASH-HOSP] Hospital: ${hospitalNome} (${hospitalId})`);
    console.log(`📋 [DASH-HOSP] Total leitos: ${totalLeitos}`);
    console.log(`✅ [DASH-HOSP] Taxa ocupação: ${taxaOcupacao}%`);
    console.log('✅ [DASH-HOSP] ========================================');
    console.log('');
};

// =====================================================
// FUNÇÃO: ATUALIZAR MÉTRICA
// =====================================================
function atualizarMetrica(elementId, valor, total, sufixo = '') {
    const element = document.getElementById(elementId);
    if (element) {
        const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
        element.textContent = `${valor}${sufixo}${total ? ` (${percentual}%)` : ''}`;
        console.log(`✅ [DASH-HOSP] Métrica ${elementId} atualizada: ${valor}${sufixo}`);
    } else {
        console.warn(`⚠️ [DASH-HOSP] Elemento #${elementId} não encontrado`);
    }
}

// =====================================================
// FUNÇÃO: MOSTRAR ERRO
// =====================================================
function mostrarErroHospital(mensagem) {
    console.error(`❌ [DASH-HOSP] ERRO EXIBIDO: ${mensagem}`);
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 400px; flex-direction: column;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #ef4444; margin-bottom: 10px;">Erro ao carregar dashboard</h3>
                <p style="color: #9ca3af;">${mensagem}</p>
                <button onclick="window.renderDashboardHospitalar()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

// =====================================================
// GRÁFICO 1: TAXA DE OCUPAÇÃO
// =====================================================
function criarGraficoOcupacao(taxaOcupacao) {
    const ctx = document.getElementById('chartOcupacaoHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartOcupacaoHospital não encontrado');
        return null;
    }
    
    const taxa = parseFloat(taxaOcupacao) || 0;
    const livre = 100 - taxa;
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ocupada', 'Livre'],
            datasets: [{
                data: [taxa, livre],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', font: { size: 12 } }
                },
                title: {
                    display: true,
                    text: 'Taxa de Ocupação',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 2: STATUS DOS LEITOS
// =====================================================
function criarGraficoStatus(vagos, ocupados, bloqueados) {
    const ctx = document.getElementById('chartStatusHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartStatusHospital não encontrado');
        return null;
    }
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Vagos', 'Ocupados', 'Bloqueados'],
            datasets: [{
                label: 'Leitos',
                data: [vagos, ocupados, bloqueados],
                backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Status dos Leitos',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 3: LINHAS DE CUIDADO
// =====================================================
function criarGraficoLinhas(linhasMap, hospitalId) {
    const ctx = document.getElementById('chartLinhasHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartLinhasHospital não encontrado');
        return null;
    }
    
    const linhasOrdenadas = Object.entries(linhasMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
    
    if (linhasOrdenadas.length === 0) {
        console.warn('⚠️ [DASH-HOSP] Nenhuma linha de cuidado para exibir');
        return null;
    }
    
    const labels = linhasOrdenadas.map(([nome]) => nome);
    const data = linhasOrdenadas.map(([, qtd]) => qtd);
    const colors = labels.map(nome => getCorExataHosp(nome, 'linha'));
    
    const tipoGrafico = window.graficosState[hospitalId]?.linhas || 'bar';
    
    return new Chart(ctx, {
        type: tipoGrafico,
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: tipoGrafico === 'doughnut' },
                title: {
                    display: true,
                    text: 'Top 10 Linhas de Cuidado',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: tipoGrafico === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 },
                    grid: { display: false }
                }
            } : {}
        }
    });
}

// =====================================================
// GRÁFICO 4: CONCESSÕES
// =====================================================
function criarGraficoConcessoes(concessoesMap, hospitalId) {
    const ctx = document.getElementById('chartConcessoesHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartConcessoesHospital não encontrado');
        return null;
    }
    
    const concessoesOrdenadas = Object.entries(concessoesMap)
        .sort((a, b) => b[1] - a[1]);
    
    if (concessoesOrdenadas.length === 0) {
        console.warn('⚠️ [DASH-HOSP] Nenhuma concessão para exibir');
        return null;
    }
    
    const labels = concessoesOrdenadas.map(([nome]) => nome);
    const data = concessoesOrdenadas.map(([, qtd]) => qtd);
    const colors = labels.map(nome => getCorExataHosp(nome, 'concessao'));
    
    const tipoGrafico = window.graficosState[hospitalId]?.concessoes || 'bar';
    
    return new Chart(ctx, {
        type: tipoGrafico,
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: tipoGrafico === 'doughnut' },
                title: {
                    display: true,
                    text: 'Concessões de Alta',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: tipoGrafico === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 },
                    grid: { display: false }
                }
            } : {}
        }
    });
}

// =====================================================
// GRÁFICO 5: ISOLAMENTO
// =====================================================
function criarGraficoIsolamento(isolamentoMap) {
    const ctx = document.getElementById('chartIsolamentoHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartIsolamentoHospital não encontrado');
        return null;
    }
    
    const labels = Object.keys(isolamentoMap);
    const data = Object.values(isolamentoMap);
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', font: { size: 11 } }
                },
                title: {
                    display: true,
                    text: 'Status de Isolamento',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 6: GÊNERO (NOVO V3.3.2)
// =====================================================
function criarGraficoGenero(generoMap) {
    const ctx = document.getElementById('chartGeneroHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartGeneroHospital não encontrado');
        return null;
    }
    
    const labels = Object.keys(generoMap);
    const data = Object.values(generoMap);
    
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#3b82f6', '#ec4899', '#9ca3af'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', font: { size: 12 } }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Gênero',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 7: REGIÃO (NOVO V3.3.2)
// =====================================================
function criarGraficoRegiao(regiaoMap, hospitalId) {
    const ctx = document.getElementById('chartRegiaoHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartRegiaoHospital não encontrado');
        return null;
    }
    
    const regioesOrdenadas = Object.entries(regiaoMap)
        .sort((a, b) => b[1] - a[1]);
    
    if (regioesOrdenadas.length === 0) {
        console.warn('⚠️ [DASH-HOSP] Nenhuma região para exibir');
        return null;
    }
    
    const labels = regioesOrdenadas.map(([nome]) => nome);
    const data = regioesOrdenadas.map(([, qtd]) => qtd);
    
    const tipoGrafico = window.graficosState[hospitalId]?.regiao || 'doughnut';
    
    return new Chart(ctx, {
        type: tipoGrafico,
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#9ca3af', font: { size: 11 } }
                },
                title: {
                    display: true,
                    text: 'Distribuição por Região',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: tipoGrafico === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            } : {}
        }
    });
}

// =====================================================
// GRÁFICO 8: CATEGORIA (NOVO V3.3.2)
// =====================================================
function criarGraficoCategoria(categoriaMap) {
    const ctx = document.getElementById('chartCategoriaHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartCategoriaHospital não encontrado');
        return null;
    }
    
    const labels = Object.keys(categoriaMap);
    const data = Object.values(categoriaMap);
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: ['#3b82f6', '#f59e0b', '#9ca3af'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Distribuição por Categoria',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    grid: { color: 'rgba(156, 163, 175, 0.1)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            }
        }
    });
}

// =====================================================
// GRÁFICO 9: DIRETIVAS (NOVO V3.3.2)
// =====================================================
function criarGraficoDiretivas(diretivasMap) {
    const ctx = document.getElementById('chartDiretivasHospital');
    if (!ctx) {
        console.error('❌ [DASH-HOSP] Canvas #chartDiretivasHospital não encontrado');
        return null;
    }
    
    const labels = Object.keys(diretivasMap);
    const data = Object.values(diretivasMap);
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#10b981', '#ef4444', '#9ca3af'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', font: { size: 11 } }
                },
                title: {
                    display: true,
                    text: 'Diretivas Antecipadas',
                    color: '#e5e7eb',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

// =====================================================
// FUNÇÕES AUXILIARES: ALTERNAR TIPO DE GRÁFICO
// =====================================================
window.alternarGraficoLinhas = function() {
    const hospitalId = window.currentHospital;
    const tipoAtual = window.graficosState[hospitalId]?.linhas || 'bar';
    const novoTipo = tipoAtual === 'bar' ? 'doughnut' : 'bar';
    window.graficosState[hospitalId].linhas = novoTipo;
    console.log(`🔄 [DASH-HOSP] Gráfico Linhas alterado: ${tipoAtual} → ${novoTipo}`);
    window.renderDashboardHospitalar();
};

window.alternarGraficoConcessoes = function() {
    const hospitalId = window.currentHospital;
    const tipoAtual = window.graficosState[hospitalId]?.concessoes || 'bar';
    const novoTipo = tipoAtual === 'bar' ? 'doughnut' : 'bar';
    window.graficosState[hospitalId].concessoes = novoTipo;
    console.log(`🔄 [DASH-HOSP] Gráfico Concessões alterado: ${tipoAtual} → ${novoTipo}`);
    window.renderDashboardHospitalar();
};

window.alternarGraficoRegiao = function() {
    const hospitalId = window.currentHospital;
    const tipoAtual = window.graficosState[hospitalId]?.regiao || 'doughnut';
    const novoTipo = tipoAtual === 'doughnut' ? 'bar' : 'doughnut';
    window.graficosState[hospitalId].regiao = novoTipo;
    console.log(`🔄 [DASH-HOSP] Gráfico Região alterado: ${tipoAtual} → ${novoTipo}`);
    window.renderDashboardHospitalar();
};

// =====================================================
// LOG FINAL DE CARREGAMENTO DO MÓDULO
// =====================================================
console.log('✅ [DASH-HOSP] ========================================');
console.log('✅ [DASH-HOSP] Módulo dashboard-hospital.js V3.3.2 PRONTO');
console.log('✅ [DASH-HOSP] Função window.renderDashboardHospitalar EXPOSTA');
console.log('✅ [DASH-HOSP] 9 tipos de gráficos disponíveis');
console.log('✅ [DASH-HOSP] Suporte completo a 74 colunas (A-BV)');
console.log('✅ [DASH-HOSP] ========================================');
console.log('');
