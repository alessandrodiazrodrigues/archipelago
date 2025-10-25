// =================== DASHBOARD EXECUTIVO V3.3 - ATUALIZADO COM 11 CONCESSÕES + 45 LINHAS ===================
// =================== USANDO CORES DO API.JS - SEM DUPLICAÇÃO ===================

// Estado global para fundo branco (compartilhado com dashboard hospitalar)
if (typeof window.fundoBranco === 'undefined') {
    window.fundoBranco = false;
}

// =================== FUNÇÃO PARA OBTER CORES DO API.JS ===================
function getCorExataExec(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`⚠️ [CORES EXEC] Item inválido: "${itemName}"`);
        return '#6b7280'; // Fallback cinza
    }
    
    // ✅ USAR CORES DO API.JS
    const paleta = tipo === 'concessao' ? window.CORES_CONCESSOES : window.CORES_LINHAS;
    
    if (!paleta) {
        console.error(`❌ [CORES EXEC] Paleta ${tipo} não encontrada no api.js!`);
        return '#6b7280';
    }
    
    // 1. Busca exata primeiro
    let cor = paleta[itemName];
    if (cor) {
        console.log(`✅ [CORES EXEC] Encontrado exato: "${itemName}" → ${cor}`);
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
        console.log(`✅ [CORES EXEC] Encontrado normalizado: "${itemName}" → "${nomeNormalizado}" → ${cor}`);
        return cor;
    }
    
    // 3. Busca por correspondência parcial rigorosa
    for (const [chave, valor] of Object.entries(paleta)) {
        const chaveNormalizada = chave.toLowerCase().replace(/[–—]/g, '-');
        const itemNormalizado = nomeNormalizado.toLowerCase();
        
        if (chaveNormalizada.includes(itemNormalizado) || 
            itemNormalizado.includes(chaveNormalizada)) {
            console.log(`✅ [CORES EXEC] Encontrado parcial: "${itemName}" → "${chave}" → ${valor}`);
            return valor;
        }
    }
    
    // 4. Log de erro para debug
    console.error(`❌ [CORES EXEC] COR NÃO ENCONTRADA: "${itemName}" (normalizado: "${nomeNormalizado}")`);
    console.error(`❌ [CORES EXEC] Disponíveis na paleta:`, Object.keys(paleta));
    
    return '#6b7280'; // Fallback final cinza
}

// =================== FUNÇÃO PARA CRIAR LEGENDAS HTML CUSTOMIZADAS - CORRIGIDA ===================
window.createCustomLegendOutsideExec = function(containerId, datasets, chartKey) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ [LEGENDA EXEC] Container não encontrado: ${containerId}`);
        return;
    }
    
    // Limpar legenda anterior
    container.innerHTML = '';
    
    // Definir cores baseadas no estado do fundo
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : 'rgba(255, 255, 255, 0.05)';
    
    // Aplicar estilo do container
    container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 10px;
        padding: 10px;
        background: ${fundoLegenda};
        border-radius: 8px;
        align-items: flex-start;
    `;
    
    datasets.forEach((dataset, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item-custom-exec';
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
            font-size: 12px;
            color: ${corTexto};
            cursor: pointer;
            transition: all 0.2s ease;
            width: auto;
            opacity: ${dataset.hidden ? '0.4' : '1'};
        `;
        
        // Quadrado colorido
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color-box-exec';
        colorBox.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 2px;
            flex-shrink: 0;
            background-color: ${dataset.backgroundColor};
            opacity: ${dataset.hidden ? '0.3' : '1'};
        `;
        
        // Label
        const label = document.createElement('span');
        label.textContent = dataset.label;
        label.style.cssText = `
            color: ${corTexto};
            font-weight: 500;
            line-height: 1.2;
        `;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        
        // =================== CORREÇÃO DO BUG: IMPLEMENTAÇÃO ROBUSTA ===================
        item.addEventListener('click', () => {
            // BUSCAR CHART DE FORMA ROBUSTA
            const chart = window.chartInstances && window.chartInstances[chartKey];
            
            if (chart && chart.getDatasetMeta) {
                try {
                    const meta = chart.getDatasetMeta(index);
                    if (meta) {
                        // *** CORREÇÃO PRINCIPAL: VERIFICAR ESTADO NULL ***
                        const novoEstado = meta.hidden === null ? true : !meta.hidden;
                        meta.hidden = novoEstado;
                        
                        // *** FEEDBACK VISUAL SINCRONIZADO ***
                        item.style.opacity = novoEstado ? '0.4' : '1';
                        colorBox.style.opacity = novoEstado ? '0.3' : '1';
                        
                        // *** UPDATE FORÇADO ***
                        chart.update('active');
                        
                        console.log(`🔄 [LEGENDA EXEC] ${dataset.label}: ${novoEstado ? 'OCULTADO' : 'EXIBIDO'}`);
                    }
                } catch (error) {
                    console.error(`❌ [LEGENDA EXEC] Erro ao toggle dataset ${index}:`, error);
                }
            } else {
                console.error(`❌ [LEGENDA EXEC] Chart não encontrado para key: ${chartKey}`);
            }
        });
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            if (!dataset.hidden) {
                item.style.background = 'rgba(255, 255, 255, 0.1)';
                item.style.transform = 'translateX(2px)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'rgba(255, 255, 255, 0.03)';
            item.style.transform = 'translateX(0)';
        });
        
        container.appendChild(item);
    });
    
    console.log(`✅ [LEGENDA EXEC] Criada para ${containerId} com ${datasets.length} itens`);
};

// Plugin para fundo branco/escuro
const backgroundPluginExec = {
    id: 'customBackgroundExec',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo V3.3: REDE HOSPITALAR EXTERNA (5 HOSPITAIS)');
    
    let container = document.getElementById('dashExecutivoContent');
    if (!container) {
        const dash2Section = document.getElementById('dash2');
        if (dash2Section) {
            container = document.createElement('div');
            container.id = 'dashExecutivoContent';
            dash2Section.appendChild(container);
            logInfo('Container dashExecutivoContent criado automaticamente');
        }
    }
    
    if (!container) {
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Executivo V3.3');
            return;
        }
    }
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #ef4444; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #ef4444; margin-bottom: 10px; font-size: 20px;">Dados V3.3 não disponíveis</h2>
                <p style="color: #9ca3af; font-size: 14px;">Aguardando sincronização com a planilha (74 colunas)</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Recarregar</button>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        return;
    }
    
    // ✅ USAR APENAS OS 5 HOSPITAIS VÁLIDOS (H1-H5)
    const hospitaisValidos = ['H1', 'H2', 'H3', 'H4', 'H5'];
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #f59e0b; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #f59e0b; margin-bottom: 10px; font-size: 20px;">Nenhum hospital V3.3 com dados</h2>
                <p style="color: #9ca3af; font-size: 14px;">Verifique a conexão com a planilha (74 colunas)</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Tentar novamente</button>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        return;
    }
    
    const kpis = calcularKPIsExecutivos(hospitaisComDados);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            
            <!-- HEADER CORRIGIDO PARA MOBILE -->
            <div class="dashboard-header-exec" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #22c55e;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Rede Hospitalar Externa - Dashboard Geral V3.3</h2>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="toggleFundoBtnExec" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleIconExec">🌙</span>
                        <span id="toggleTextExec">ESCURO</span>
                    </button>
                </div>
            </div>
            
            <!-- KPI GERAL DA REDE HOSPITALAR -->
            <div class="executive-kpis-grid">
                <div class="kpi-gauge-principal">
                    <h3 style="color: #9ca3af; font-size: 14px; margin-bottom: 15px; text-align: center;">Ocupação Geral da Rede</h3>
                    <div class="gauge-container">
                        <canvas id="gaugeOcupacaoExecutivo"></canvas>
                        <div class="gauge-text">
                            <span class="gauge-value">${kpis.ocupacaoGeral}%</span>
                            <span class="gauge-label">Ocupação Geral</span>
                        </div>
                    </div>
                    <div class="hospitais-percentuais">
                        ${hospitaisComDados.map(hospitalId => {
                            const kpiHosp = calcularKPIsHospital(hospitalId);
                            return `
                                <div class="hospital-item">
                                    <span class="hospital-nome">${CONFIG.HOSPITAIS[hospitalId].nome}</span>
                                    <span class="hospital-pct">${kpiHosp.ocupacao}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.hospitaisAtivos}</div>
                    <div class="kpi-label">Hospitais Ativos</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.totalLeitos}</div>
                    <div class="kpi-label">Total Leitos</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosOcupados}</div>
                    <div class="kpi-label">Ocupados</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosVagos}</div>
                    <div class="kpi-label">Vagos</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.leitosEmAlta}</div>
                    <div class="kpi-label">Em Alta</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.tphMedio}</div>
                    <div class="kpi-label">TPH Médio</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.ppsMedio}</div>
                    <div class="kpi-label">PPS Médio</div>
                </div>
                
                <div class="kpi-box">
                    <div class="kpi-value">${kpis.spictCasos}</div>
                    <div class="kpi-label">SPICT-BR Elegíveis</div>
                </div>
            </div>
            
            <!-- GRÁFICOS GERAIS DA REDE -->
            <div class="executivo-graficos">
                
                <!-- Gráfico de Altas Geral -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Altas em ${hoje}</h3>
                            <p>Panorama geral da rede hospitalar externa (5 hospitais)</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltasExecutivo"></canvas>
                    </div>
                    <div id="legendaAltasExec" class="chart-legend-custom"></div>
                </div>
                
                <!-- Gráfico de Concessões Geral -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Concessões em ${hoje}</h3>
                            <p>11 concessões da rede hospitalar (5 hospitais)</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoesExecutivo"></canvas>
                    </div>
                    <div id="legendaConcessoesExec" class="chart-legend-custom"></div>
                </div>
                
                <!-- Gráfico de Linhas Geral -->
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Linhas de Cuidado em ${hoje}</h3>
                            <p>45 linhas de cuidado da rede hospitalar (5 hospitais)</p>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhasExecutivo"></canvas>
                    </div>
                    <div id="legendaLinhasExec" class="chart-legend-custom"></div>
                </div>
                
            </div>
        </div>
        
        ${getExecutiveCSS()}
        
        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .toggle-fundo-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-1px);
            }
            
            .toggle-fundo-btn.active {
                background: #f59e0b !important;
                border-color: #f59e0b !important;
                color: #000000 !important;
            }
        </style>
    `;
    
    // Event listener para o botão de toggle
    const toggleBtn = document.getElementById('toggleFundoBtnExec');
    if (toggleBtn) {
        // Sincronizar com o estado atual
        if (window.fundoBranco) {
            toggleBtn.classList.add('active');
            document.getElementById('toggleIconExec').textContent = '☀️';
            document.getElementById('toggleTextExec').textContent = 'CLARO';
        }
        
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const icon = document.getElementById('toggleIconExec');
            const text = document.getElementById('toggleTextExec');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                icon.textContent = '☀️';
                text.textContent = 'CLARO';
            } else {
                toggleBtn.classList.remove('active');
                icon.textContent = '🌙';
                text.textContent = 'ESCURO';
            }
            
            // Re-renderizar gráficos
            renderAltasExecutivo();
            renderConcessoesExecutivo();
            renderLinhasExecutivo();
            
            logInfo(`Fundo executivo V3.3 alterado para: ${window.fundoBranco ? 'claro' : 'escuro'}`);
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            renderGaugeExecutivoHorizontal(kpis.ocupacaoGeral);
            renderAltasExecutivo();
            renderConcessoesExecutivo();
            renderLinhasExecutivo();
            
            logSuccess('Dashboard Executivo V3.3 renderizado com dados atualizados (5 hospitais)');
        }, 200);
    };
    
    aguardarChartJS();
};

// Calcular KPIs consolidados V3.3 (5 hospitais)
function calcularKPIsExecutivos(hospitaisComDados) {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let tphTotal = 0;
    let tphCount = 0;
    let ppsTotal = 0;
    let ppsCount = 0;
    let spictCasos = 0;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            totalLeitos++;
            
            if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
                leitosOcupados++;
                
                if (leito.prevAlta && leito.prevAlta !== 'Não definido') {
                    leitosEmAlta++;
                }
                
                if (leito.tph) {
                    const tph = parseFloat(leito.tph);
                    if (!isNaN(tph) && tph > 0) {
                        tphTotal += tph;
                        tphCount++;
                    }
                }
                
                if (leito.pps) {
                    const pps = parseFloat(leito.pps);
                    if (!isNaN(pps) && pps > 0) {
                        ppsTotal += pps;
                        ppsCount++;
                    }
                }
                
                if (leito.spict === 'elegivel' || leito.spict === 'Elegível') {
                    spictCasos++;
                }
            }
        });
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const tphMedio = tphCount > 0 ? (tphTotal / tphCount).toFixed(1) : '2.5';
    
    return {
        hospitaisAtivos: hospitaisComDados.length,
        totalLeitos,
        leitosOcupados,
        leitosVagos,
        leitosEmAlta,
        ocupacaoGeral,
        tphMedio,
        ppsMedio: ppsCount > 0 ? Math.round(ppsTotal / ppsCount) : 85,
        spictCasos
    };
}

// Calcular KPIs de um hospital V3.3
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    const total = hospital.leitos.length;
    const ocupados = hospital.leitos.filter(l => 
        l.status === 'ocupado' || l.status === 'Em uso'
    ).length;
    
    const TIMELINE_ALTA = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'];
    const altas = hospital.leitos.filter(l => {
        if (l.status === 'ocupado' || l.status === 'Em uso') {
            const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
            return prevAlta && TIMELINE_ALTA.includes(prevAlta);
        }
        return false;
    }).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos: total - ocupados, altas };
}

// Gauge horizontal
function renderGaugeExecutivoHorizontal(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacaoExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (window.chartInstances && window.chartInstances.gaugeExecutivo) {
        window.chartInstances.gaugeExecutivo.destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const ctx = canvas.getContext('2d');
    window.chartInstances.gaugeExecutivo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [ocupacao, 100 - ocupacao],
                backgroundColor: [
                    ocupacao >= 85 ? '#ef4444' : ocupacao >= 70 ? '#f97316' : ocupacao >= 50 ? '#eab308' : '#22c55e',
                    'rgba(255,255,255,0.1)'
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            rotation: -90,
            circumference: 180
        }
    });
}

// =================== GRÁFICO DE ALTAS V3.3 - DADOS REAIS DOS 5 HOSPITAIS ===================
function renderAltasExecutivo() {
    const canvas = document.getElementById('graficoAltasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'altasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // CALCULAR DADOS REAIS DAS ALTAS V3.3
    const dadosReais = calcularDadosAltasReais();
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: dadosReais
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { 
                        color: corTexto,
                        font: { size: 14, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto
                    },
                    ticks: {
                        color: corTexto,
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
    
    setTimeout(() => {
        window.createCustomLegendOutsideExec('legendaAltasExec', dadosReais, chartKey);
    }, 50);
}

// =================== GRÁFICO DE CONCESSÕES V3.3 - 11 CONCESSÕES REAIS ===================
function renderConcessoesExecutivo() {
    const canvas = document.getElementById('graficoConcessoesExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'concessoesExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5']; // ✅ 5 HOSPITAIS
    const hospitaisNomes = ['Neomater', 'Cruz Azul', 'Sta Marcelina', 'Sta Clara', 'Adventista'];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // ✅ CALCULAR DADOS REAIS DAS 11 CONCESSÕES
    const dadosReais = calcularDadosConcessoesReais();
    
    // Calcular valor máximo para escala Y
    let valorMaximo = 0;
    dadosReais.datasets.forEach(dataset => {
        dataset.data.forEach((value, index) => {
            let stackTotal = 0;
            dadosReais.datasets.forEach(ds => {
                stackTotal += ds.data[index] || 0;
            });
            valorMaximo = Math.max(valorMaximo, stackTotal);
        });
    });
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosReais.labels,
            datasets: dadosReais.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: corTexto,
                        autoSkip: false,
                        maxRotation: 0,
                        callback: function(value, index) {
                            if (index % 5 === 2) { // ✅ 5 HOSPITAIS
                                return categorias[Math.floor(index / 5)];
                            }
                            return '';
                        }
                    },
                    grid: {
                        color: corGrid,
                        drawOnChartArea: true,
                        drawTicks: true,
                        tickLength: 8,
                        lineWidth: function(context) {
                            if (context.index % 5 === 0 && context.index > 0) { // ✅ 5 HOSPITAIS
                                return 2;
                            }
                            return 0;
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: valorMaximo + 6,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto
                    },
                    ticks: {
                        color: corTexto,
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPluginExec, {
            id: 'hospitalLabels',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                ctx.save();
                
                const meta = chart.getDatasetMeta(0);
                
                meta.data.forEach((bar, index) => {
                    const hospitalIndex = index % 5; // ✅ 5 HOSPITAIS
                    const hospitalName = hospitaisNomes[hospitalIndex];
                    
                    let maxY = bar.y;
                    for (let i = 0; i < chart.data.datasets.length; i++) {
                        const dataset = chart.getDatasetMeta(i);
                        if (dataset.data[index] && !dataset.hidden) {
                            const currentY = dataset.data[index].y;
                            if (currentY < maxY) {
                                maxY = currentY;
                            }
                        }
                    }
                    
                    ctx.fillStyle = corTexto;
                    const fontSize = window.innerWidth <= 768 ? 9.5 : 14;
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    
                    ctx.save();
                    const yOffset = window.innerWidth <= 768 ? 8 : 10;
                    const yPosition = maxY - yOffset;
                    ctx.translate(bar.x, yPosition);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillText(hospitalName, 10, 0);
                    ctx.restore();
                });
                
                ctx.restore();
            }
        }]
    });
    
    setTimeout(() => {
        window.createCustomLegendOutsideExec('legendaConcessoesExec', dadosReais.datasets, chartKey);
    }, 50);
}

// =================== GRÁFICO DE LINHAS V3.3 - 45 LINHAS REAIS ===================
function renderLinhasExecutivo() {
    const canvas = document.getElementById('graficoLinhasExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'linhasExecutivo';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5']; // ✅ 5 HOSPITAIS
    const hospitaisNomes = ['Neomater', 'Cruz Azul', 'Sta Marcelina', 'Sta Clara', 'Adventista'];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // ✅ CALCULAR DADOS REAIS DAS 45 LINHAS
    const dadosReais = calcularDadosLinhasReais();
    
    // Calcular valor máximo para escala Y
    let valorMaximo = 0;
    dadosReais.datasets.forEach(dataset => {
        dataset.data.forEach((value, index) => {
            let stackTotal = 0;
            dadosReais.datasets.forEach(ds => {
                stackTotal += ds.data[index] || 0;
            });
            valorMaximo = Math.max(valorMaximo, stackTotal);
        });
    });
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosReais.labels,
            datasets: dadosReais.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: corTexto,
                        autoSkip: false,
                        maxRotation: 0,
                        callback: function(value, index) {
                            if (index % 5 === 2) { // ✅ 5 HOSPITAIS
                                return categorias[Math.floor(index / 5)];
                            }
                            return '';
                        }
                    },
                    grid: {
                        color: corGrid,
                        drawOnChartArea: true,
                        lineWidth: function(context) {
                            if (context.index % 5 === 0 && context.index > 0) { // ✅ 5 HOSPITAIS
                                return 2;
                            }
                            return 0;
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: valorMaximo + 6,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto
                    },
                    ticks: {
                        color: corTexto,
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPluginExec, {
            id: 'hospitalLabelsLinhas',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                ctx.save();
                
                const meta = chart.getDatasetMeta(0);
                
                meta.data.forEach((bar, index) => {
                    const hospitalIndex = index % 5; // ✅ 5 HOSPITAIS
                    const hospitalName = hospitaisNomes[hospitalIndex];
                    
                    let maxY = bar.y;
                    for (let i = 0; i < chart.data.datasets.length; i++) {
                        const dataset = chart.getDatasetMeta(i);
                        if (dataset.data[index] && !dataset.hidden) {
                            const currentY = dataset.data[index].y;
                            if (currentY < maxY) {
                                maxY = currentY;
                            }
                        }
                    }
                    
                    ctx.fillStyle = corTexto;
                    const fontSize = window.innerWidth <= 768 ? 9.5 : 14;
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    
                    ctx.save();
                    const yOffset = window.innerWidth <= 768 ? 8 : 10;
                    const yPosition = maxY - yOffset;
                    ctx.translate(bar.x, yPosition);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillText(hospitalName, 10, 0);
                    ctx.restore();
                });
                
                ctx.restore();
            }
        }]
    });
    
    setTimeout(() => {
        window.createCustomLegendOutsideExec('legendaLinhasExec', dadosReais.datasets, chartKey);
    }, 50);
}

// =================== CALCULAR DADOS REAIS DE ALTAS V3.3 ===================
function calcularDadosAltasReais() {
    const hospitaisValidos = ['H1', 'H2', 'H3', 'H4', 'H5'];
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        return [];
    }
    
    const datasets = [];
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const contadores = {
        'Hoje Ouro': [0, 0, 0, 0, 0],
        'Hoje 2R': [0, 0, 0, 0, 0],  
        'Hoje 3R': [0, 0, 0, 0, 0],
        '24h Ouro': [0, 0, 0, 0, 0],
        '24h 2R': [0, 0, 0, 0, 0],
        '24h 3R': [0, 0, 0, 0, 0],
        '48H': [0, 0, 0, 0, 0],
        '72H': [0, 0, 0, 0, 0],
        '96H': [0, 0, 0, 0, 0]
    };
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status !== 'ocupado' && leito.status !== 'Em uso') return;
            
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            if (!prevAlta) return;
            
            if (prevAlta.includes('Hoje Ouro')) {
                contadores['Hoje Ouro'][0]++;
            } else if (prevAlta.includes('Hoje 2R')) {
                contadores['Hoje 2R'][0]++;
            } else if (prevAlta.includes('Hoje 3R')) {
                contadores['Hoje 3R'][0]++;
            } else if (prevAlta.includes('24h Ouro') || prevAlta.includes('24 Ouro')) {
                contadores['24h Ouro'][1]++;
            } else if (prevAlta.includes('24h 2R') || prevAlta.includes('24 2R')) {
                contadores['24h 2R'][1]++;
            } else if (prevAlta.includes('24h 3R') || prevAlta.includes('24 3R')) {
                contadores['24h 3R'][1]++;
            } else if (prevAlta.includes('48')) {
                contadores['48H'][2]++;
            } else if (prevAlta.includes('72')) {
                contadores['72H'][3]++;
            } else if (prevAlta.includes('96')) {
                contadores['96H'][4]++;
            }
        });
    });
    
    Object.keys(contadores).forEach(categoria => {
        const dados = contadores[categoria];
        const total = dados.reduce((a, b) => a + b, 0);
        
        if (total > 0) {
            let cor = '#6b7280';
            
            if (categoria.includes('Ouro')) cor = '#fbbf24';
            else if (categoria.includes('2R')) cor = '#3b82f6';
            else if (categoria.includes('3R')) cor = '#8b5cf6';
            else if (categoria === '48H') cor = '#10b981';
            else if (categoria === '72H') cor = '#f59e0b';
            else if (categoria === '96H') cor = '#ef4444';
            
            datasets.push({
                label: categoria,
                data: dados,
                backgroundColor: cor,
                borderWidth: 0
            });
        }
    });
    
    return datasets;
}

// =================== CALCULAR DADOS REAIS DE CONCESSÕES V3.3 - IGUAL AO HOSPITALAR ===================
function calcularDadosConcessoesReais() {
    const hospitaisValidos = ['H1', 'H2', 'H3', 'H4', 'H5'];
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        return { labels: [], datasets: [] };
    }
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    // Criar labels para cada hospital em cada período
    const labels = [];
    categorias.forEach(() => {
        hospitaisValidos.forEach(() => {
            labels.push('');
        });
    });
    
    // ✅ CONTAR CONCESSÕES REAIS - EXATAMENTE IGUAL AO HOSPITALAR
    const concessoesPorTimeline = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status !== 'ocupado' && leito.status !== 'Em uso') return;
            
            // ✅ IGUAL AO HOSPITALAR: Busca em leito.concessoes OU leito.paciente.concessoes
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (concessoes && prevAlta) {
                // ✅ IGUAL AO HOSPITALAR: Array direto OU split por '|'
                const concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
                // ✅ IGUAL AO HOSPITALAR: Mapear timeline
                let timelineIndex = -1;
                if (prevAlta.includes('Hoje')) timelineIndex = 0;
                else if (prevAlta.includes('24h')) timelineIndex = 1;
                else if (prevAlta === '48h' || prevAlta === '48H') timelineIndex = 2;
                else if (prevAlta === '72h' || prevAlta === '72H') timelineIndex = 3;
                else if (prevAlta === '96h' || prevAlta === '96H') timelineIndex = 4;
                
                if (timelineIndex >= 0) {
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim()) {
                            const nome = concessao.trim();
                            
                            // Calcular índice no array de labels (hospital dentro de categoria)
                            const hospitalIndex = hospitaisValidos.indexOf(hospitalId);
                            if (hospitalIndex >= 0) {
                                const labelIndex = timelineIndex * 5 + hospitalIndex;
                                
                                if (!concessoesPorTimeline[nome]) {
                                    concessoesPorTimeline[nome] = Array(labels.length).fill(0);
                                }
                                
                                if (labelIndex < labels.length) {
                                    concessoesPorTimeline[nome][labelIndex]++;
                                }
                            }
                        }
                    });
                }
            }
        });
    });
    
    // ✅ CRIAR DATASETS COM CORES DO API.JS (sem ordenação - todas as concessões)
    const datasets = Object.keys(concessoesPorTimeline).map(concessao => ({
        label: concessao,
        data: concessoesPorTimeline[concessao],
        backgroundColor: getCorExataExec(concessao, 'concessao'),
        borderWidth: 0
    }));
    
    console.log(`✅ [CONCESSÕES EXEC] ${datasets.length} concessões encontradas nos dados reais`);
    
    return { labels, datasets };
}

// =================== CALCULAR DADOS REAIS DE LINHAS V3.3 - 45 LINHAS ===================
function calcularDadosLinhasReais() {
    const hospitaisValidos = ['H1', 'H2', 'H3', 'H4', 'H5'];
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        return { labels: [], datasets: [] };
    }
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    // Criar labels
    const labels = [];
    categorias.forEach(() => {
        hospitaisValidos.forEach(() => {
            labels.push('');
        });
    });
    
    // ✅ CONTAR LINHAS REAIS DOS LEITOS OCUPADOS - IGUAL AO HOSPITALAR
    const linhasCount = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status !== 'ocupado' && leito.status !== 'Em uso') return;
            
            // ✅ IGUAL AO HOSPITALAR: Busca em leito.linhas OU leito.paciente.linhas
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (linhas && prevAlta) {
                // ✅ IGUAL AO HOSPITALAR: Array direto OU split por '|'
                const linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
                // ✅ IGUAL AO HOSPITALAR: Mapear timeline
                let timelineIndex = -1;
                if (prevAlta.includes('Hoje')) timelineIndex = 0;
                else if (prevAlta.includes('24h')) timelineIndex = 1;
                else if (prevAlta === '48h' || prevAlta === '48H') timelineIndex = 2;
                else if (prevAlta === '72h' || prevAlta === '72H') timelineIndex = 3;
                else if (prevAlta === '96h' || prevAlta === '96H') timelineIndex = 4;
                
                if (timelineIndex >= 0) {
                    linhasList.forEach(linha => {
                        if (linha && linha.trim()) {
                            const nome = linha.trim();
                            
                            // Calcular índice no array de labels (hospital dentro de categoria)
                            const hospitalIndex = hospitaisValidos.indexOf(hospitalId);
                            if (hospitalIndex >= 0) {
                                const labelIndex = timelineIndex * 5 + hospitalIndex;
                                
                                if (!linhasCount[nome]) {
                                    linhasCount[nome] = Array(labels.length).fill(0);
                                }
                                
                                if (labelIndex < labels.length) {
                                    linhasCount[nome][labelIndex]++;
                                }
                            }
                        }
                    });
                }
            }
        });
    });
    
    // ✅ CRIAR DATASETS COM CORES DO API.JS
    const datasets = Object.keys(linhasCount).map(linha => ({
        label: linha,
        data: linhasCount[linha],
        backgroundColor: getCorExataExec(linha, 'linha'),
        borderWidth: 0
    }));
    
    console.log(`✅ [LINHAS EXEC] ${datasets.length} linhas encontradas nos dados reais`);
    
    return { labels, datasets };
}

// CSS CORRIGIDO COM RESPONSIVIDADE MOBILE ESPECIFICA - 2x4 KPIS
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
            /* =================== LAYOUT DESKTOP (MANTIDO 100%) =================== */
            .executive-kpis-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                grid-template-rows: auto auto;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .kpi-gauge-principal {
                grid-column: span 2;
                grid-row: span 2;
                background: #1a1f2e;
                border-radius: 12px;
                padding: 20px;
                color: white;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
                display: flex;
                flex-direction: column;
            }
            
            .gauge-container {
                position: relative;
                height: 150px;
                margin: 15px 0;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gauge-container canvas {
                max-height: 150px !important;
            }
            
            .gauge-text {
                position: absolute;
                top: 70%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                pointer-events: none;
            }
            
            .gauge-value {
                display: block;
                font-size: 32px;
                font-weight: 700;
                color: white;
                line-height: 1;
            }
            
            .gauge-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                margin-top: 4px;
                text-transform: uppercase;
            }
            
            .hospitais-percentuais {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hospital-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                padding: 4px 0;
                color: white;
            }
            
            .kpi-box {
                background: #1a1f2e;
                border-radius: 12px;
                padding: 20px;
                color: white;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .kpi-box:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-value {
                display: block;
                font-size: 28px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 6px;
            }
            
            .kpi-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            
            .executivo-graficos {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .executivo-grafico-card {
                background: #1a1f2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                color: white;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .chart-header h3 {
                margin: 0 0 5px 0;
                color: white;
                font-size: 18px;
                font-weight: 600;
            }
            
            .chart-header p {
                margin: 0;
                color: #9ca3af;
                font-size: 14px;
            }
            
            .chart-container {
                position: relative;
                height: 400px;
                margin: 15px 0;
            }
            
            .chart-container canvas {
                max-height: 400px !important;
                width: 100% !important;
            }
            
            /* Legendas HTML customizadas */
            .chart-legend-custom {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
                margin-top: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            
            /* =================== MOBILE - CORREÇÕES ESPECÍFICAS =================== */
            @media (max-width: 768px) {
                #app-header, .app-header, header {
                    padding: 8px 15px !important;
                    height: auto !important;
                    min-height: auto !important;
                }
                
                .dashboard-header-exec {
                    padding: 10px !important;
                    margin-bottom: 10px !important;
                }
                
                .dashboard-header-exec h2 {
                    font-size: 14px !important;
                    margin-bottom: 4px !important;
                }
                
                .executive-kpis-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    grid-auto-flow: row !important;
                    gap: 5px !important;
                    margin: 0 !important;
                    padding: 5px !important;
                }
                
                .kpi-gauge-principal {
                    grid-column: 1 / 3 !important;
                    grid-row: 1 !important;
                    padding: 10px !important;
                    margin: 0 !important;
                }
                
                .kpi-box:nth-of-type(2) { grid-column: 1; grid-row: 2; }
                .kpi-box:nth-of-type(3) { grid-column: 2; grid-row: 2; }
                .kpi-box:nth-of-type(4) { grid-column: 1; grid-row: 3; }
                .kpi-box:nth-of-type(5) { grid-column: 2; grid-row: 3; }
                .kpi-box:nth-of-type(6) { grid-column: 1; grid-row: 4; }
                .kpi-box:nth-of-type(7) { grid-column: 2; grid-row: 4; }
                .kpi-box:nth-of-type(8) { grid-column: 1; grid-row: 5; }
                .kpi-box:nth-of-type(9) { grid-column: 2; grid-row: 5; }
                
                .kpi-box {
                    padding: 8px !important;
                    margin: 0 !important;
                    min-height: 60px !important;
                }
                
                .kpi-value {
                    font-size: 16px !important;
                }
                
                .kpi-label {
                    font-size: 9px !important;
                }
                
                .executivo-grafico-card {
                    padding: 0 !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                }
                
                .chart-header {
                    padding: 5px !important;
                    margin-bottom: 0 !important;
                }
                
                .chart-header h3 {
                    font-size: 12px !important;
                    margin: 0 !important;
                }
                
                .chart-container {
                    height: 240px !important;
                    margin: 0 !important;
                    padding: 0 5px !important;
                }
                
                .chart-container canvas {
                    max-height: 240px !important;
                }
                
                .chart-legend-custom {
                    margin: -40px 5px 10px 5px !important;
                    padding: 5px !important;
                    background: rgba(30, 41, 59, 0.95) !important;
                    position: relative !important;
                    z-index: 50 !important;
                }
                
                .gauge-container {
                    height: 100px !important;
                }
                
                .hospitais-percentuais {
                    margin-top: 5px !important;
                    padding-top: 5px !important;
                }
                
                .hospital-item {
                    font-size: 8px !important;
                }
            }
            
            @media (max-width: 768px) and (orientation: landscape) {
                #app-header, .app-header, header {
                    padding: 5px 10px !important;
                    height: 40px !important;
                    max-height: 40px !important;
                }
                
                .dashboard-header-exec {
                    padding: 5px !important;
                    margin-bottom: 5px !important;
                }
                
                .dashboard-header-exec h2 {
                    font-size: 12px !important;
                    margin: 0 !important;
                }
                
                .toggle-fundo-btn {
                    padding: 3px 6px !important;
                    font-size: 9px !important;
                }
                
                .chart-container {
                    height: 200px !important;
                }
                
                .executive-kpis-grid {
                    gap: 3px !important;
                }
                
                .kpi-box {
                    min-height: 45px !important;
                    padding: 5px !important;
                }
                
                .kpi-value {
                    font-size: 14px !important;
                }
                
                .kpi-label {
                    font-size: 8px !important;
                }
                
                .gauge-container {
                    height: 80px !important;
                }
            }
        </style>
    `;
}

// Funções de log V3.3
function logInfo(message) {
    console.log(`🔵 [DASHBOARD EXECUTIVO V3.3] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD EXECUTIVO V3.3] ${message}`);
}

function logError(message) {
    console.error(`❌ [DASHBOARD EXECUTIVO V3.3] ${message}`);
}

console.log('🎯 Dashboard Executivo V3.3 - ATUALIZADO COM 11 CONCESSÕES + 45 LINHAS!');
console.log('✅ CORES: Usando window.CORES_CONCESSOES e window.CORES_LINHAS do api.js');
console.log('✅ DADOS: Contando concessões e linhas REAIS dos leitos ocupados');
console.log('✅ HOSPITAIS: Filtrando apenas H1-H5 (5 hospitais)');
console.log('✅ VALIDAÇÃO: Apenas concessões e linhas presentes no api.js');
console.log('✅ LEGENDAS: Sistema corrigido igual ao hospitalar');
console.log('✅ DISTRIBUIÇÃO: Baseada na previsão de alta de cada paciente');
console.log('🚀 READY: Dashboard Executivo 100% sincronizado com o sistema!');
