// =================== DASHBOARD HOSPITALAR V3.3 - COMPATÍVEL COM ESTRUTURA ATUAL ===================
// =================== SINCRONIZADO COM API V3.3 + CORES V3.3 + 74 COLUNAS ===================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar', idade: 'area', regiao: 'doughnut' },
    H2: { concessoes: 'bar', linhas: 'bar', idade: 'area', regiao: 'doughnut' },
    H3: { concessoes: 'bar', linhas: 'bar', idade: 'area', regiao: 'doughnut' },
    H4: { concessoes: 'bar', linhas: 'bar', idade: 'area', regiao: 'doughnut' },
    H5: { concessoes: 'bar', linhas: 'bar', idade: 'area', regiao: 'doughnut' }
};

// Estado global para fundo branco (compartilhado)
if (typeof window.fundoBranco === 'undefined') {
    window.fundoBranco = false;
}

// =================== CORES V3.3 EXATAS - SINCRONIZADAS COM API.JS ===================

// Cores das Concessões (11 itens) - COMPATÍVEL COM CONCESSOES_VALIDAS
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

// Cores das Linhas de Cuidado (45 itens) - COMPATÍVEL COM LINHAS_VALIDAS
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

// Função RIGOROSA para obter cores Pantone EXATAS (compatível com API V3.3)
function getCorExataHosp(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`⚠️ [CORES HOSP] Item inválido: "${itemName}"`);
        return '#6b7280';
    }
    
    const paleta = tipo === 'concessao' ? CORES_CONCESSOES_HOSP : CORES_LINHAS_HOSP;
    
    // 1. Busca exata primeiro
    let cor = paleta[itemName];
    if (cor) {
        console.log(`✅ [CORES HOSP] Encontrado exato: "${itemName}" → ${cor}`);
        return cor;
    }
    
    // 2. Normalizar para busca flexível
    const nomeNormalizado = itemName
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[–—]/g, '-')
        .replace(/O₂/g, 'O2')
        .replace(/²/g, '2');
    
    cor = paleta[nomeNormalizado];
    if (cor) {
        console.log(`✅ [CORES HOSP] Encontrado normalizado: "${itemName}" → "${nomeNormalizado}" → ${cor}`);
        return cor;
    }
    
    // 3. Busca por correspondência parcial
    for (const [chave, valor] of Object.entries(paleta)) {
        const chaveNormalizada = chave.toLowerCase().replace(/[–—]/g, '-');
        const itemNormalizado = nomeNormalizado.toLowerCase();
        
        if (chaveNormalizada.includes(itemNormalizado) || 
            itemNormalizado.includes(chaveNormalizada)) {
            console.log(`✅ [CORES HOSP] Encontrado parcial: "${itemName}" → "${chave}" → ${valor}`);
            return valor;
        }
    }
    
    console.error(`❌ [CORES HOSP] COR NÃO ENCONTRADA: "${itemName}"`);
    return '#6b7280';
}

// =================== FUNÇÃO PRINCIPAL COMPATIBLE COM API V3.3 ===================
window.renderDashboardHospitalar = function(hospital, dados) {
    console.log(`🏥 [DASHBOARD HOSPITALAR V3.3] Renderizando: ${hospital}`);
    
    // Verificar se dados existem
    if (!dados || !dados[hospital] || !dados[hospital].leitos) {
        console.error(`❌ Dados não encontrados para hospital ${hospital}`);
        return;
    }

    const leitos = dados[hospital].leitos;
    
    // Calcular KPIs usando estrutura V3.3
    const kpis = calcularKPIsHospitalV33(hospital, leitos);
    
    // Renderizar container principal
    const container = document.getElementById(`dash${hospital.replace('H', '')}Content`);
    if (!container) {
        console.error(`❌ Container não encontrado: dash${hospital.replace('H', '')}Content`);
        return;
    }

    // Determinar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    // HTML do dashboard
    container.innerHTML = renderHTMLDashboardHospitalV33(hospital, kpis, isMobile);

    // Criar gráficos após DOM estar pronto
    setTimeout(() => {
        criarGraficosHospitalarV33(hospital, leitos, kpis);
    }, 100);
};

// =================== HTML DO DASHBOARD V3.3 ===================
function renderHTMLDashboardHospitalV33(hospital, kpis, isMobile) {
    const hospitalNome = {
        'H1': 'Neomater',
        'H2': 'Cruz Azul', 
        'H3': 'Santa Marcelina',
        'H4': 'Santa Clara',
        'H5': 'Hospital Adventista'
    }[hospital] || hospital;

    return `
        <div class="hospital-card">
            <!-- TÍTULO DO HOSPITAL -->
            <div class="hospital-title">
                📊 Dashboard ${hospitalNome} V3.3
                <button class="toggle-fundo-btn" onclick="toggleFundoBrancoHosp()">
                    ${window.fundoBranco ? '🌙' : '☀️'} ${window.fundoBranco ? 'Escuro' : 'Claro'}
                </button>
            </div>
            
            <!-- SEÇÃO KPIs -->
            ${renderKPIsSectionV33(kpis, isMobile)}
            
            <!-- SEÇÃO GRÁFICOS -->
            ${renderGraficosSectionV33(hospital, isMobile)}
        </div>
    `;
}

// =================== SEÇÃO KPIs V3.3 ===================
function renderKPIsSectionV33(kpis, isMobile) {
    if (isMobile) {
        return `
            <div class="kpis-container-mobile">
                <!-- LINHA 1: OCUPAÇÃO PRINCIPAL -->
                <div class="kpis-linha-ocupacao">
                    <div class="kpi-box-ocupacao">
                        <canvas id="gaugeOcupacaoHosp" width="100" height="50"></canvas>
                        <span class="kpi-value-grande">${kpis.leitosOcupados}/${kpis.totalLeitos}</span>
                        <span class="kpi-label">TOTAL LEITOS</span>
                    </div>
                </div>
                
                <!-- LINHA 2: TIPOS DE LEITO -->
                <div class="kpis-linha-dupla">
                    <div class="kpi-box-inline">
                        <span class="kpi-value">${kpis.apartamentos.ocupados}/${kpis.apartamentos.total}</span>
                        <span class="kpi-label">APARTAMENTOS</span>
                    </div>
                    <div class="kpi-box-inline">
                        <span class="kpi-value">${kpis.enfermarias.ocupados}/${kpis.enfermarias.disponivel}</span>
                        <span class="kpi-label">ENFERMARIAS</span>
                        ${kpis.enfermarias.bloqueados ? `<span class="kpi-badge bloqueado">${kpis.enfermarias.bloqueados} BLOQ</span>` : ''}
                    </div>
                </div>
                
                <!-- LINHA 3: NOVOS CAMPOS V3.3 -->
                <div class="kpis-linha-dupla">
                    <div class="kpi-box-inline">
                        <span class="kpi-value">${kpis.porGenero.masculino}M / ${kpis.porGenero.feminino}F</span>
                        <span class="kpi-label">GÊNERO</span>
                    </div>
                    <div class="kpi-box-inline">
                        <span class="kpi-value">${kpis.isolamento.contato + kpis.isolamento.respiratorio}</span>
                        <span class="kpi-label">ISOLAMENTO</span>
                    </div>
                </div>
                
                <!-- LINHA 4: DIRETIVAS V3.3 -->
                <div class="kpis-linha-dupla">
                    <div class="kpi-box-inline">
                        <span class="kpi-value">${kpis.diretivas.sim}</span>
                        <span class="kpi-label">DIRETIVAS SIM</span>
                    </div>
                    <div class="kpi-box-inline">
                        <span class="kpi-value">${kpis.regiao.topRegiao || 'N/A'}</span>
                        <span class="kpi-label">REGIÃO PRINCIPAL</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Layout Desktop
        return `
            <div class="kpis-container-desktop">
                <div class="kpi-card">
                    <canvas id="gaugeOcupacaoHosp" width="120" height="60"></canvas>
                    <div class="kpi-number">${kpis.leitosOcupados}/${kpis.totalLeitos}</div>
                    <div class="kpi-label">TOTAL LEITOS</div>
                    <div class="kpi-percentage">${kpis.taxaOcupacao}%</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-number">${kpis.apartamentos.ocupados}/${kpis.apartamentos.total}</div>
                    <div class="kpi-label">APARTAMENTOS</div>
                    <div class="kpi-badge apartamento">APTO</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-number">${kpis.enfermarias.ocupados}/${kpis.enfermarias.disponivel}</div>
                    <div class="kpi-label">ENFERMARIAS</div>
                    ${kpis.enfermarias.bloqueados ? `<div class="kpi-badge bloqueado">${kpis.enfermarias.bloqueados} BLOQ</div>` : '<div class="kpi-badge enfermaria">ENF</div>'}
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-row">
                        <span class="kpi-mini masculino">${kpis.porGenero.masculino} M</span>
                        <span class="kpi-mini feminino">${kpis.porGenero.feminino} F</span>
                    </div>
                    <div class="kpi-label">POR GÊNERO</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-number">${kpis.isolamento.contato + kpis.isolamento.respiratorio}</div>
                    <div class="kpi-label">ISOLAMENTO</div>
                    <div class="kpi-badge isolamento">ATIVO</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-number">${kpis.diretivas.sim}</div>
                    <div class="kpi-label">DIRETIVAS</div>
                    <div class="kpi-badge diretivas">SIM</div>
                </div>
            </div>
        `;
    }
}

// =================== SEÇÃO GRÁFICOS V3.3 ===================
function renderGraficosSectionV33(hospital, isMobile) {
    const graficosLayout = isMobile ? 'graficos-mobile' : 'graficos-desktop';
    
    return `
        <div class="${graficosLayout}">
            <!-- GRÁFICO 1: CONCESSÕES -->
            <div class="grafico-item">
                <div class="chart-header">
                    <h4>📊 Concessões de Alta (11 tipos)</h4>
                    <div class="chart-controls">
                        <button class="chart-btn ${window.graficosState[hospital].concessoes === 'bar' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'concessoes', 'bar')">Barras</button>
                        <button class="chart-btn ${window.graficosState[hospital].concessoes === 'pie' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'concessoes', 'pie')">Pizza</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="chartConcessoesHosp${hospital}"></canvas>
                </div>
            </div>
            
            <!-- GRÁFICO 2: LINHAS DE CUIDADO -->
            <div class="grafico-item">
                <div class="chart-header">
                    <h4>🏥 Linhas de Cuidado (45 tipos)</h4>
                    <div class="chart-controls">
                        <button class="chart-btn ${window.graficosState[hospital].linhas === 'bar' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'linhas', 'bar')">Barras</button>
                        <button class="chart-btn ${window.graficosState[hospital].linhas === 'pie' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'linhas', 'pie')">Pizza</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="chartLinhasHosp${hospital}"></canvas>
                </div>
            </div>
            
            <!-- GRÁFICO 3: DISTRIBUIÇÃO DE IDADE -->
            <div class="grafico-item">
                <div class="chart-header">
                    <h4>👥 Distribuição de Idade</h4>
                    <div class="chart-controls">
                        <button class="chart-btn ${window.graficosState[hospital].idade === 'area' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'idade', 'area')">Área</button>
                        <button class="chart-btn ${window.graficosState[hospital].idade === 'bar' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'idade', 'bar')">Barras</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="chartIdadeHosp${hospital}"></canvas>
                </div>
            </div>
            
            <!-- GRÁFICO 4: DISTRIBUIÇÃO POR REGIÃO -->
            <div class="grafico-item">
                <div class="chart-header">
                    <h4>🗺️ Distribuição por Região (9 regiões)</h4>
                    <div class="chart-controls">
                        <button class="chart-btn ${window.graficosState[hospital].regiao === 'doughnut' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'regiao', 'doughnut')">Rosca</button>
                        <button class="chart-btn ${window.graficosState[hospital].regiao === 'bar' ? 'active' : ''}" 
                                onclick="alterarTipoGraficoHosp('${hospital}', 'regiao', 'bar')">Barras</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="chartRegiaoHosp${hospital}"></canvas>
                </div>
            </div>
        </div>
    `;
}

// =================== CÁLCULO DE KPIs V3.3 ===================
function calcularKPIsHospitalV33(hospital, leitos) {
    const totalLeitos = leitos.length;
    const leitosOcupados = leitos.filter(l => l.status === 'Em uso');
    const leitosVagos = leitos.filter(l => l.status === 'Vago');
    
    // Cálculos por tipo (considerando regras específicas V3.3)
    const apartamentos = calcularApartamentosV33(hospital, leitos);
    const enfermarias = calcularEnfermariasV33(hospital, leitos);
    
    // Cálculos por gênero (campo BS/70)
    const porGenero = calcularPorGeneroV33(leitosOcupados);
    
    // Cálculos de isolamento (campo AR/43)
    const isolamento = calcularIsolamentoV33(leitosOcupados);
    
    // Cálculos de diretivas (campo BV/73)
    const diretivas = calcularDiretivasV33(leitosOcupados);
    
    // Cálculos de região (campo BT/71)
    const regiao = calcularRegiaoV33(leitosOcupados);

    return {
        totalLeitos,
        leitosOcupados: leitosOcupados.length,
        leitosVagos: leitosVagos.length,
        apartamentos,
        enfermarias,
        porGenero,
        isolamento,
        diretivas,
        regiao,
        taxaOcupacao: Math.round((leitosOcupados.length / totalLeitos) * 100)
    };
}

function calcularApartamentosV33(hospital, leitos) {
    switch(hospital) {
        case 'H1': // Neomater - Híbridos
            return {
                ocupados: leitos.filter(l => l.status === 'Em uso' && l.categoria_escolhida === 'Apartamento').length,
                total: leitos.filter(l => l.categoria_escolhida === 'Apartamento' || l.status === 'Vago').length
            };
        case 'H2': // Cruz Azul - 20 fixos
            const aptosH2 = leitos.slice(0, 20);
            return {
                ocupados: aptosH2.filter(l => l.status === 'Em uso').length,
                total: 20
            };
        case 'H3': // Santa Marcelina - Híbridos
            return {
                ocupados: leitos.filter(l => l.status === 'Em uso' && l.categoria_escolhida === 'Apartamento').length,
                total: leitos.filter(l => l.categoria_escolhida === 'Apartamento' || l.status === 'Vago').length
            };
        case 'H4': // Santa Clara - 9 fixos
            const aptosH4 = leitos.slice(0, 9);
            return {
                ocupados: aptosH4.filter(l => l.status === 'Em uso').length,
                total: 9
            };
        case 'H5': // Adventista - Híbridos
            return {
                ocupados: leitos.filter(l => l.status === 'Em uso' && l.categoria_escolhida === 'Apartamento').length,
                total: leitos.filter(l => l.categoria_escolhida === 'Apartamento' || l.status === 'Vago').length
            };
        default:
            return { ocupados: 0, total: 0 };
    }
}

function calcularEnfermariasV33(hospital, leitos) {
    switch(hospital) {
        case 'H1': // Neomater - Híbridos
            return {
                ocupados: leitos.filter(l => l.status === 'Em uso' && l.categoria_escolhida === 'Enfermaria').length,
                disponivel: leitos.filter(l => l.categoria_escolhida === 'Enfermaria' || l.status === 'Vago').length
            };
        case 'H2': // Cruz Azul - 16 com bloqueios
            const enfH2 = leitos.slice(20, 36);
            const bloqueados = calcularBloqueadosCruzAzulV33(enfH2);
            return {
                ocupados: enfH2.filter(l => l.status === 'Em uso').length,
                disponivel: 16 - bloqueados,
                bloqueados: bloqueados
            };
        case 'H3': // Santa Marcelina - Híbridos
            return {
                ocupados: leitos.filter(l => l.status === 'Em uso' && l.categoria_escolhida === 'Enfermaria').length,
                disponivel: leitos.filter(l => l.categoria_escolhida === 'Enfermaria' || l.status === 'Vago').length
            };
        case 'H4': // Santa Clara - 4 com limite
            const enfH4 = leitos.slice(9, 13);
            const ocupadasH4 = enfH4.filter(l => l.status === 'Em uso').length;
            return {
                ocupados: ocupadasH4,
                disponivel: Math.max(0, 4 - ocupadasH4)
            };
        case 'H5': // Adventista - Híbridos
            return {
                ocupados: leitos.filter(l => l.status === 'Em uso' && l.categoria_escolhida === 'Enfermaria').length,
                disponivel: leitos.filter(l => l.categoria_escolhida === 'Enfermaria' || l.status === 'Vago').length
            };
        default:
            return { ocupados: 0, disponivel: 0 };
    }
}

function calcularBloqueadosCruzAzulV33(enfermarias) {
    let bloqueados = 0;
    
    // Verificar quartos (leitos irmãos)
    for (let i = 0; i < enfermarias.length; i += 2) {
        const leito1 = enfermarias[i];
        const leito2 = enfermarias[i + 1];
        
        if (!leito1 || !leito2) continue;
        
        // Se um tem isolamento, o outro fica bloqueado
        if (leito1.isolamento !== 'Não Isolamento' || leito2.isolamento !== 'Não Isolamento') {
            if (leito1.status === 'Vago') bloqueados++;
            if (leito2.status === 'Vago') bloqueados++;
        }
        // Se gêneros incompatíveis
        else if (leito1.status === 'Em uso' && leito2.status === 'Vago' && leito1.genero) {
            bloqueados++;
        }
        else if (leito2.status === 'Em uso' && leito1.status === 'Vago' && leito2.genero) {
            bloqueados++;
        }
    }
    
    return bloqueados;
}

function calcularPorGeneroV33(leitosOcupados) {
    const masculino = leitosOcupados.filter(l => l.genero === 'Masculino').length;
    const feminino = leitosOcupados.filter(l => l.genero === 'Feminino').length;
    const naoInformado = leitosOcupados.filter(l => !l.genero || l.genero === '').length;
    
    return { masculino, feminino, naoInformado };
}

function calcularIsolamentoV33(leitosOcupados) {
    const contato = leitosOcupados.filter(l => l.isolamento === 'Isolamento de Contato').length;
    const respiratorio = leitosOcupados.filter(l => l.isolamento === 'Isolamento Respiratório').length;
    const naoIsolamento = leitosOcupados.filter(l => l.isolamento === 'Não Isolamento' || !l.isolamento).length;
    
    return { contato, respiratorio, naoIsolamento };
}

function calcularDiretivasV33(leitosOcupados) {
    const sim = leitosOcupados.filter(l => l.diretivas === 'Sim').length;
    const nao = leitosOcupados.filter(l => l.diretivas === 'Não').length;
    const naoSeAplica = leitosOcupados.filter(l => l.diretivas === 'Não se aplica' || !l.diretivas).length;
    
    return { sim, nao, naoSeAplica };
}

function calcularRegiaoV33(leitosOcupados) {
    // Usar REGIOES_OPCOES do API.js
    const regioes = window.REGIOES_OPCOES || [
        'Zona Central', 'Zona Sul', 'Zona Norte', 'Zona Leste', 'Zona Oeste',
        'ABC', 'Guarulhos', 'Osasco', 'Outra'
    ];
    
    const distribuicao = {};
    let topRegiao = null;
    let maxCount = 0;
    
    regioes.forEach(regiao => {
        const count = leitosOcupados.filter(l => l.regiao === regiao).length;
        distribuicao[regiao] = count;
        if (count > maxCount) {
            maxCount = count;
            topRegiao = regiao;
        }
    });
    
    return { distribuicao, topRegiao, maxCount };
}

// =================== FUNÇÕES DE CRIAÇÃO DE GRÁFICOS V3.3 ===================
function criarGraficosHospitalarV33(hospital, leitos, kpis) {
    try {
        // Gauge de ocupação
        renderGaugeHospitalV33(kpis.taxaOcupacao);
        
        // Gráficos principais
        renderConcessoesHospitalV33(hospital, leitos);
        renderLinhasHospitalV33(hospital, leitos);
        renderIdadeHospitalV33(hospital, leitos);
        renderRegiaoHospitalV33(hospital, leitos, kpis.regiao);
        
        console.log(`✅ [DASHBOARD HOSP V3.3] Gráficos criados para ${hospital}`);
    } catch (error) {
        console.error(`❌ [DASHBOARD HOSP V3.3] Erro ao criar gráficos para ${hospital}:`, error);
    }
}

function renderGaugeHospitalV33(taxaOcupacao) {
    const canvas = document.getElementById('gaugeOcupacaoHosp');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Arco de fundo (cinza)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#374151';
    ctx.stroke();
    
    // Arco de progresso (colorido)
    const endAngle = Math.PI + (Math.PI * taxaOcupacao / 100);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
    ctx.lineWidth = 8;
    ctx.strokeStyle = taxaOcupacao > 80 ? '#ef4444' : taxaOcupacao > 60 ? '#f59e0b' : '#10b981';
    ctx.stroke();
    
    // Texto central
    ctx.fillStyle = window.fundoBranco ? '#000000' : '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${taxaOcupacao}%`, centerX, centerY + 4);
}

function renderConcessoesHospitalV33(hospital, leitos) {
    const chartId = `chartConcessoesHosp${hospital}`;
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const leitosOcupados = leitos.filter(l => l.status === 'Em uso');
    
    // Usar lista de concessões do API.js
    const concessoesList = window.CONCESSOES_VALIDAS || Object.keys(CORES_CONCESSOES_HOSP);
    const concessoesData = [];
    const concessoesCores = [];
    const concessoesLabels = [];
    
    concessoesList.forEach(concessao => {
        const count = leitosOcupados.filter(leito => {
            // Verificar se o leito tem esta concessão (campos M-W são salvos como arrays)
            if (leito.concessoes && Array.isArray(leito.concessoes)) {
                return leito.concessoes.includes(concessao);
            }
            return false;
        }).length;
        
        if (count > 0) {
            concessoesData.push(count);
            concessoesCores.push(getCorExataHosp(concessao, 'concessao'));
            concessoesLabels.push(concessao);
        }
    });
    
    const tipoGrafico = window.graficosState[hospital].concessoes;
    
    // Destruir gráfico existente
    if (window.chartInstances && window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
    }
    
    const config = {
        type: tipoGrafico,
        data: {
            labels: concessoesLabels,
            datasets: [{
                label: 'Concessões',
                data: concessoesData,
                backgroundColor: concessoesCores,
                borderColor: concessoesCores.map(cor => cor + '80'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: window.fundoBranco ? '#000000' : '#ffffff' }
                }
            },
            scales: tipoGrafico === 'bar' ? {
                x: {
                    ticks: { 
                        color: window.fundoBranco ? '#000000' : '#ffffff',
                        maxRotation: 45
                    },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: window.fundoBranco ? '#000000' : '#ffffff' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            } : {}
        }
    };
    
    // Criar novo gráfico
    const chart = new Chart(canvas, config);
    
    // Armazenar instância
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[chartId] = chart;
}

function renderLinhasHospitalV33(hospital, leitos) {
    const chartId = `chartLinhasHosp${hospital}`;
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const leitosOcupados = leitos.filter(l => l.status === 'Em uso');
    
    // Usar lista de linhas do API.js
    const linhasList = window.LINHAS_VALIDAS || Object.keys(CORES_LINHAS_HOSP);
    const linhasData = [];
    const linhasCores = [];
    const linhasLabels = [];
    
    linhasList.forEach(linha => {
        const count = leitosOcupados.filter(leito => {
            // Verificar se o leito tem esta linha (campos X-BR são salvos como arrays)
            if (leito.linhas && Array.isArray(leito.linhas)) {
                return leito.linhas.includes(linha);
            }
            return false;
        }).length;
        
        if (count > 0) {
            linhasData.push(count);
            linhasCores.push(getCorExataHosp(linha, 'linha'));
            linhasLabels.push(linha);
        }
    });
    
    const tipoGrafico = window.graficosState[hospital].linhas;
    
    // Destruir gráfico existente
    if (window.chartInstances && window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
    }
    
    const config = {
        type: tipoGrafico,
        data: {
            labels: linhasLabels,
            datasets: [{
                label: 'Linhas de Cuidado',
                data: linhasData,
                backgroundColor: linhasCores,
                borderColor: linhasCores.map(cor => cor + '80'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: window.fundoBranco ? '#000000' : '#ffffff' }
                }
            },
            scales: tipoGrafico === 'bar' ? {
                x: {
                    ticks: { 
                        color: window.fundoBranco ? '#000000' : '#ffffff',
                        maxRotation: 45
                    },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: window.fundoBranco ? '#000000' : '#ffffff' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            } : {}
        }
    };
    
    // Criar novo gráfico
    const chart = new Chart(canvas, config);
    
    // Armazenar instância
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[chartId] = chart;
}

function renderIdadeHospitalV33(hospital, leitos) {
    const chartId = `chartIdadeHosp${hospital}`;
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const leitosOcupados = leitos.filter(l => l.status === 'Em uso' && l.idade);
    
    // Agrupar por faixas etárias
    const faixas = ['0-20', '21-40', '41-60', '61-80', '80+'];
    const dadosIdade = [
        leitosOcupados.filter(l => l.idade >= 0 && l.idade <= 20).length,
        leitosOcupados.filter(l => l.idade >= 21 && l.idade <= 40).length,
        leitosOcupados.filter(l => l.idade >= 41 && l.idade <= 60).length,
        leitosOcupados.filter(l => l.idade >= 61 && l.idade <= 80).length,
        leitosOcupados.filter(l => l.idade > 80).length
    ];
    
    const tipoGrafico = window.graficosState[hospital].idade;
    
    // Destruir gráfico existente
    if (window.chartInstances && window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
    }
    
    const config = {
        type: tipoGrafico === 'area' ? 'line' : 'bar',
        data: {
            labels: faixas,
            datasets: [{
                label: 'Distribuição de Idade',
                data: dadosIdade,
                backgroundColor: tipoGrafico === 'area' ? 'rgba(59, 130, 246, 0.3)' : '#3b82f6',
                borderColor: '#3b82f6',
                borderWidth: 2,
                fill: tipoGrafico === 'area',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: window.fundoBranco ? '#000000' : '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: window.fundoBranco ? '#000000' : '#ffffff' },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: window.fundoBranco ? '#000000' : '#ffffff' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            }
        }
    };
    
    // Criar novo gráfico
    const chart = new Chart(canvas, config);
    
    // Armazenar instância
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[chartId] = chart;
}

function renderRegiaoHospitalV33(hospital, leitos, regiaoData) {
    const chartId = `chartRegiaoHosp${hospital}`;
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Usar dados de região calculados
    const regioes = Object.keys(regiaoData.distribuicao);
    const dadosRegiao = Object.values(regiaoData.distribuicao);
    
    // Filtrar apenas regiões com dados
    const regioesComDados = [];
    const dadosComDados = [];
    const coresRegiao = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316'
    ];
    const coresFiltradas = [];
    
    regioes.forEach((regiao, index) => {
        if (dadosRegiao[index] > 0) {
            regioesComDados.push(regiao);
            dadosComDados.push(dadosRegiao[index]);
            coresFiltradas.push(coresRegiao[index % coresRegiao.length]);
        }
    });
    
    const tipoGrafico = window.graficosState[hospital].regiao;
    
    // Destruir gráfico existente
    if (window.chartInstances && window.chartInstances[chartId]) {
        window.chartInstances[chartId].destroy();
    }
    
    const config = {
        type: tipoGrafico,
        data: {
            labels: regioesComDados,
            datasets: [{
                label: 'Pacientes por Região',
                data: dadosComDados,
                backgroundColor: coresFiltradas,
                borderColor: coresFiltradas.map(cor => cor + '80'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: tipoGrafico === 'doughnut' ? 'bottom' : 'top',
                    labels: { color: window.fundoBranco ? '#000000' : '#ffffff' }
                }
            },
            scales: tipoGrafico === 'bar' ? {
                x: {
                    ticks: { 
                        color: window.fundoBranco ? '#000000' : '#ffffff',
                        maxRotation: 45
                    },
                    grid: { color: '#374151' }
                },
                y: {
                    ticks: { color: window.fundoBranco ? '#000000' : '#ffffff' },
                    grid: { color: '#374151' },
                    beginAtZero: true
                }
            } : {}
        }
    };
    
    // Criar novo gráfico
    const chart = new Chart(canvas, config);
    
    // Armazenar instância
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[chartId] = chart;
}

// =================== FUNÇÕES DE CONTROLE V3.3 ===================
function alterarTipoGraficoHosp(hospital, categoria, tipo) {
    window.graficosState[hospital][categoria] = tipo;
    
    // Recriar o gráfico específico
    const dados = window.hospitalData;
    if (dados && dados[hospital]) {
        const leitos = dados[hospital].leitos;
        const kpis = calcularKPIsHospitalV33(hospital, leitos);
        
        switch(categoria) {
            case 'concessoes':
                renderConcessoesHospitalV33(hospital, leitos);
                break;
            case 'linhas':
                renderLinhasHospitalV33(hospital, leitos);
                break;
            case 'idade':
                renderIdadeHospitalV33(hospital, leitos);
                break;
            case 'regiao':
                renderRegiaoHospitalV33(hospital, leitos, kpis.regiao);
                break;
        }
        
        // Atualizar botões ativos
        atualizarBotoesAtivosHosp(hospital, categoria, tipo);
    }
}

function atualizarBotoesAtivosHosp(hospital, categoria, tipoAtivo) {
    const container = document.querySelector(`#dash${hospital.replace('H', '')}Content`);
    if (!container) return;
    
    // Encontrar os botões da categoria específica
    const botoes = container.querySelectorAll(`.chart-btn`);
    botoes.forEach(botao => {
        const onClick = botao.getAttribute('onclick');
        if (onClick && onClick.includes(`'${categoria}'`)) {
            botao.classList.remove('active');
            if (onClick.includes(`'${tipoAtivo}'`)) {
                botao.classList.add('active');
            }
        }
    });
}

function toggleFundoBrancoHosp() {
    window.fundoBranco = !window.fundoBranco;
    
    // Recarregar todos os dashboards hospitalares visíveis
    const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5'];
    hospitais.forEach(hospital => {
        const container = document.getElementById(`dash${hospital.replace('H', '')}Content`);
        if (container && container.innerHTML.trim() !== '') {
            const dados = window.hospitalData;
            if (dados && dados[hospital]) {
                window.renderDashboardHospitalar(hospital, dados);
            }
        }
    });
}

// =================== CSS INLINE COMPLETO V3.3 ===================
function adicionarCSSHospitalV33() {
    if (document.getElementById('dashboard-hospital-css-v33')) return;
    
    const css = `
        <style id="dashboard-hospital-css-v33">
            /* =================== CSS DASHBOARD HOSPITALAR V3.3 =================== */
            
            .hospital-card {
                background: ${window.fundoBranco ? '#ffffff' : '#0f172a'};
                border-radius: 16px;
                padding: 24px;
                margin: 16px 0;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
                transition: all 0.3s ease;
            }
            
            .hospital-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 20px;
                font-weight: 700;
                color: ${window.fundoBranco ? '#1f2937' : '#e2e8f0'};
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid ${window.fundoBranco ? '#e5e7eb' : '#374151'};
            }
            
            .toggle-fundo-btn {
                background: ${window.fundoBranco ? '#f3f4f6' : '#374151'};
                color: ${window.fundoBranco ? '#1f2937' : '#e2e8f0'};
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .toggle-fundo-btn:hover {
                background: ${window.fundoBranco ? '#e5e7eb' : '#4b5563'};
                transform: translateY(-1px);
            }
            
            /* =================== KPIs DESKTOP =================== */
            .kpis-container-desktop {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .kpi-card {
                background: ${window.fundoBranco ? '#f8fafc' : '#1a1f2e'};
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                color: ${window.fundoBranco ? '#1f2937' : '#ffffff'};
                position: relative;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
                transition: all 0.3s ease;
            }
            
            .kpi-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }
            
            .kpi-number {
                font-size: 28px;
                font-weight: 700;
                color: #60a5fa;
                margin-bottom: 8px;
                line-height: 1;
            }
            
            .kpi-label {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                color: ${window.fundoBranco ? '#6b7280' : '#9ca3af'};
                margin-bottom: 8px;
                letter-spacing: 0.5px;
            }
            
            .kpi-percentage {
                font-size: 14px;
                font-weight: 600;
                color: #10b981;
            }
            
            .kpi-row {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-bottom: 8px;
            }
            
            .kpi-mini {
                font-size: 16px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
            }
            
            .kpi-mini.masculino {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }
            
            .kpi-mini.feminino {
                background: rgba(236, 72, 153, 0.2);
                color: #ec4899;
            }
            
            .kpi-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                margin-top: 4px;
            }
            
            .kpi-badge.apartamento {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }
            
            .kpi-badge.enfermaria {
                background: rgba(245, 158, 11, 0.2);
                color: #f59e0b;
            }
            
            .kpi-badge.bloqueado {
                background: rgba(107, 114, 128, 0.2);
                color: #6b7280;
            }
            
            .kpi-badge.isolamento {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }
            
            .kpi-badge.diretivas {
                background: rgba(139, 92, 246, 0.2);
                color: #8b5cf6;
            }
            
            /* =================== KPIs MOBILE =================== */
            .kpis-container-mobile {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .kpis-linha-ocupacao {
                display: flex;
                justify-content: center;
                margin-bottom: 8px;
            }
            
            .kpi-box-ocupacao {
                background: ${window.fundoBranco ? '#f8fafc' : '#1a1f2e'};
                border-radius: 12px;
                padding: 16px 20px;
                color: ${window.fundoBranco ? '#1f2937' : '#ffffff'};
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 140px;
            }
            
            .kpi-value-grande {
                display: block;
                font-size: 32px;
                font-weight: 700;
                color: #60a5fa;
                line-height: 1;
                margin-bottom: 6px;
            }
            
            .kpis-linha-dupla {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .kpi-box-inline {
                background: ${window.fundoBranco ? '#f8fafc' : '#1a1f2e'};
                border-radius: 8px;
                padding: 12px 10px;
                color: ${window.fundoBranco ? '#1f2937' : '#ffffff'};
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 70px;
            }
            
            .kpi-value {
                font-size: 20px;
                font-weight: 700;
                color: #60a5fa;
                line-height: 1;
                margin-bottom: 4px;
            }
            
            /* =================== GRÁFICOS =================== */
            .graficos-desktop {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .graficos-mobile {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .grafico-item {
                background: ${window.fundoBranco ? '#f8fafc' : '#1a1f2e'};
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
                transition: all 0.3s ease;
            }
            
            .grafico-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .chart-header h4 {
                font-size: 16px;
                font-weight: 600;
                color: ${window.fundoBranco ? '#1f2937' : '#e2e8f0'};
                margin: 0;
                line-height: 1.2;
            }
            
            .chart-controls {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            
            .chart-btn {
                background: ${window.fundoBranco ? '#e5e7eb' : '#374151'};
                color: ${window.fundoBranco ? '#1f2937' : '#e2e8f0'};
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                transition: all 0.2s;
                letter-spacing: 0.5px;
            }
            
            .chart-btn:hover {
                background: ${window.fundoBranco ? '#d1d5db' : '#4b5563'};
                transform: translateY(-1px);
            }
            
            .chart-btn.active {
                background: #3b82f6;
                color: #ffffff;
            }
            
            .chart-container {
                position: relative;
                height: 300px;
                background: ${window.fundoBranco ? '#ffffff' : 'rgba(0, 0, 0, 0.1)'};
                border-radius: 8px;
                padding: 12px;
                border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
            }
            
            .chart-container canvas {
                max-height: 100%;
                border-radius: 6px;
            }
            
            /* =================== RESPONSIVIDADE =================== */
            @media (max-width: 768px) {
                .hospital-card {
                    padding: 16px;
                    margin: 8px 0;
                }
                
                .hospital-title {
                    font-size: 16px;
                    flex-direction: column;
                    gap: 12px;
                    text-align: center;
                }
                
                .kpis-container-desktop {
                    display: none;
                }
                
                .graficos-desktop {
                    grid-template-columns: 1fr;
                }
                
                .chart-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .chart-header h4 {
                    font-size: 14px;
                }
                
                .chart-btn {
                    padding: 4px 8px;
                    font-size: 9px;
                }
                
                .chart-container {
                    height: 250px;
                    padding: 8px;
                }
            }
            
            @media (max-width: 480px) {
                .hospital-card {
                    padding: 12px;
                    margin: 4px 0;
                }
                
                .kpi-box-ocupacao {
                    min-width: 120px;
                    padding: 12px 16px;
                }
                
                .kpi-value-grande {
                    font-size: 28px;
                }
                
                .kpis-linha-dupla {
                    gap: 6px;
                }
                
                .kpi-box-inline {
                    padding: 10px 8px;
                    min-height: 60px;
                }
                
                .kpi-value {
                    font-size: 18px;
                }
                
                .chart-container {
                    height: 220px;
                    padding: 6px;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', css);
}

// =================== INICIALIZAÇÃO =================== 
// Adicionar CSS ao carregar
document.addEventListener('DOMContentLoaded', adicionarCSSHospitalV33);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adicionarCSSHospitalV33);
} else {
    adicionarCSSHospitalV33();
}

// =================== EXPORTAÇÃO DE FUNÇÕES GLOBAIS ===================
window.calcularKPIsHospitalV33 = calcularKPIsHospitalV33;
window.renderGaugeHospitalV33 = renderGaugeHospitalV33;
window.renderConcessoesHospitalV33 = renderConcessoesHospitalV33;
window.renderLinhasHospitalV33 = renderLinhasHospitalV33;
window.renderIdadeHospitalV33 = renderIdadeHospitalV33;
window.renderRegiaoHospitalV33 = renderRegiaoHospitalV33;
window.alterarTipoGraficoHosp = alterarTipoGraficoHosp;
window.toggleFundoBrancoHosp = toggleFundoBrancoHosp;

console.log('🎯 Dashboard Hospitalar V3.3 COMPLETO CARREGADO!');
console.log('✅ COMPATÍVEL: API V3.3 + 74 colunas (A-BV)');
console.log('✅ CAMPOS: Gênero (BS/70) + Região (BT/71) + Categoria (BU/72) + Diretivas (BV/73)');
console.log('✅ CORES: 56 cores Pantone (11 concessões + 45 linhas)');
console.log('✅ ESTRUTURA: Dados diretos no objeto leito (compatível com cards.js)');
console.log('✅ GRÁFICOS: 4 tipos com controles dinâmicos + gauge de ocupação');
console.log('🚀 READY: Sistema V3.3 100% operacional!');
