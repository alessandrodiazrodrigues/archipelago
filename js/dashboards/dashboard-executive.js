// =================== DASHBOARD EXECUTIVO V3.3 - HEATMAP TEMPORAL ===================
// =================== USANDO CORES DO API.JS - SEM DUPLICAÇÃO ===================

// Estado global para fundo branco (compartilhado com dashboard hospitalar)
if (typeof window.fundoBranco === 'undefined') {
    window.fundoBranco = false;
}

// =================== ORDEM ALFABÉTICA DOS HOSPITAIS ===================
const ORDEM_ALFABETICA_HOSPITAIS = ['H5', 'H2', 'H1', 'H4', 'H3'];

// =================== FUNÇÃO PARA OBTER CORES DO API.JS ===================
function getCorExataExec(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn('[CORES EXEC] Item inválido:', itemName);
        return '#6b7280';
    }
    
    const paleta = tipo === 'concessao' ? window.CORES_CONCESSOES : window.CORES_LINHAS;
    
    if (!paleta) {
        console.error('[CORES EXEC] Paleta', tipo, 'não encontrada no api.js!');
        return '#6b7280';
    }
    
    let cor = paleta[itemName];
    if (cor) {
        return cor;
    }
    
    const nomeNormalizado = itemName
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[–—]/g, '-')
        .replace(/O₂/g, 'O2')
        .replace(/²/g, '2');
    
    cor = paleta[nomeNormalizado];
    if (cor) {
        return cor;
    }
    
    for (const [chave, valor] of Object.entries(paleta)) {
        const chaveNormalizada = chave.toLowerCase().replace(/[–—]/g, '-');
        const itemNormalizado = nomeNormalizado.toLowerCase();
        
        if (chaveNormalizada.includes(itemNormalizado) || 
            itemNormalizado.includes(chaveNormalizada)) {
            return valor;
        }
    }
    
    return '#6b7280';
}

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
    
    const hospitaisValidos = ORDEM_ALFABETICA_HOSPITAIS;
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
            
            <div class="dashboard-header-exec" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #22c55e;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Rede Hospitalar Externa - Dashboard Geral V3.3</h2>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="toggleFundoBtnExec" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleTextExec">Tema Escuro</span>
                    </button>
                </div>
            </div>
            
            <div class="executive-kpis-grid">
                <div class="kpi-gauge-principal">
                    <h3 style="color: #9ca3af; font-size: 14px; margin-bottom: 15px; text-align: center;">Ocupação Geral da Rede</h3>
                    <div class="gauge-container">
                        <div id="gaugeOcupacaoExecutivo"></div>
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
            
            <div class="executivo-graficos">
                
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Concessões em ${hoje}</h3>
                            <p>Previsão por Hospital e Período - Heatmap Temporal</p>
                        </div>
                    </div>
                    <div id="heatmapConcessoesContainer"></div>
                </div>
                
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Linhas de Cuidado em ${hoje}</h3>
                            <p>Previsão por Hospital e Período - Heatmap Temporal</p>
                        </div>
                    </div>
                    <div id="heatmapLinhasContainer"></div>
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
            
            .heatmap-container {
                overflow-x: auto;
                margin: 20px 0;
            }
            
            .heatmap-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            
            .heatmap-table th,
            .heatmap-table td {
                padding: 12px;
                text-align: center;
                border: 2px solid rgba(15, 23, 42, 0.3);
            }
            
            .heatmap-table th {
                background: rgba(255, 255, 255, 0.1);
                font-weight: 700;
            }
            
            .heatmap-cell {
                font-weight: 700;
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .heatmap-cell:hover {
                transform: scale(1.15);
                z-index: 20;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }
            
            .concessao-label {
                text-align: left !important;
                font-weight: 600;
                position: sticky;
                left: 0;
                z-index: 5;
            }
            
            .heatmap-legenda {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                font-size: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .legenda-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .legenda-cor {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                border: 1px solid rgba(0, 0, 0, 0.2);
            }
        </style>
    `;
    
    const toggleBtn = document.getElementById('toggleFundoBtnExec');
    if (toggleBtn) {
        if (window.fundoBranco) {
            toggleBtn.classList.add('active');
            document.getElementById('toggleTextExec').textContent = 'Tema Claro';
        }
        
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const text = document.getElementById('toggleTextExec');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                text.textContent = 'Tema Claro';
            } else {
                toggleBtn.classList.remove('active');
                text.textContent = 'Tema Escuro';
            }
            
            renderHeatmapConcessoes();
            renderHeatmapLinhas();
            
            logInfo('Fundo executivo V3.3 alterado para: ' + (window.fundoBranco ? 'claro' : 'escuro'));
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            renderGaugeExecutivoHorizontal(kpis.ocupacaoGeral);
            renderHeatmapConcessoes();
            renderHeatmapLinhas();
            
            logSuccess('Dashboard Executivo V3.3 renderizado com dados atualizados (5 hospitais)');
        }, 200);
    };
    
    aguardarChartJS();
};

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

function renderGaugeExecutivoHorizontal(ocupacao) {
    const container = document.getElementById('gaugeOcupacaoExecutivo');
    if (!container) return;
    
    // Limpar qualquer Chart.js anterior
    if (window.chartInstances && window.chartInstances.gaugeExecutivo) {
        window.chartInstances.gaugeExecutivo.destroy();
    }
    
    // Calcular cor baseada na ocupação
    let cor = '#22c55e'; // verde
    if (ocupacao >= 85) cor = '#ef4444'; // vermelho
    else if (ocupacao >= 70) cor = '#f97316'; // laranja
    else if (ocupacao >= 50) cor = '#eab308'; // amarelo
    
    // Calcular offset para o progresso
    const circunferencia = Math.PI * 110; // raio 55 * 2 * PI
    const progresso = (ocupacao / 100) * circunferencia;
    const offset = circunferencia - progresso;
    
    // Criar SVG customizado (igual ao KPIs Archipelago)
    container.style.width = '140px';
    container.style.height = '80px';
    container.style.position = 'relative';
    
    container.innerHTML = `
        <svg viewBox="0 0 140 80" style="width: 100%; height: 100%;">
            <!-- Fundo cinza -->
            <path d="M 15 70 A 55 55 0 0 1 125 70" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.1)" 
                  stroke-width="14" 
                  stroke-linecap="round"/>
            <!-- Progresso colorido -->
            <path d="M 15 70 A 55 55 0 0 1 125 70" 
                  fill="none" 
                  stroke="${cor}" 
                  stroke-width="14" 
                  stroke-linecap="round"
                  stroke-dasharray="172.8"
                  stroke-dashoffset="${offset}"/>
        </svg>
    `;
}

// =================== FUNÇÃO PARA OBTER COR POR VALOR ===================
function getCorPorValor(valor) {
    if (valor === 0) return window.fundoBranco ? '#f8f9fa' : '#2d3748';
    if (valor <= 2) return '#E5E5E5';  // Cinza claro
    if (valor <= 4) return '#C6A664';  // Dourado suave
    if (valor <= 6) return '#0055A4';  // Azul-claro
    return '#003366';                  // Azul-escuro
}

function getCorTexto(valor) {
    if (valor === 0) return window.fundoBranco ? '#6b7280' : '#9ca3af';
    if (valor <= 4) return '#1e293b';  // Texto escuro para cinza e dourado
    return '#ffffff';  // Texto branco para azul-claro e azul-escuro
}

// =================== HEATMAP CONCESSÕES ===================
function renderHeatmapConcessoes() {
    const container = document.getElementById('heatmapConcessoesContainer');
    if (!container) return;
    
    const hospitaisValidos = ORDEM_ALFABETICA_HOSPITAIS;
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">Nenhum dado disponível</p>';
        return;
    }
    
    const periodos = ['HOJE', '24H', '48H', '72H'];
    const dadosConcessoes = calcularDadosConcessoesReais(hospitaisComDados);
    
    let html = `
        <div class="heatmap-legenda">
            <strong>Escala:</strong>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #E5E5E5"></div>
                <span>1-2</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #C6A664"></div>
                <span>3-4</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #0055A4"></div>
                <span>5-6</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #003366"></div>
                <span>7+</span>
            </div>
        </div>
        
        <div class="heatmap-container">
            <table class="heatmap-table">
                <thead>
                    <tr>
                        <th class="concessao-label" style="background: ${window.fundoBranco ? '#f3f4f6' : '#1e293b'}; color: ${window.fundoBranco ? '#000' : '#fff'}; min-width: 200px;">Concessão</th>
    `;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        html += `<th colspan="4" style="background: ${hospital.cor}; color: white; border-left: 3px solid rgba(255,255,255,0.5);">${hospital.nome}</th>`;
    });
    
    html += '</tr><tr><th style="background: ' + (window.fundoBranco ? '#f3f4f6' : '#1e293b') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';"></th>';
    
    hospitaisComDados.forEach((hospitalId, idx) => {
        periodos.forEach((periodo, pIdx) => {
            html += '<th style="font-size: 11px; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + ' background: ' + (window.fundoBranco ? '#f3f4f6' : 'rgba(255,255,255,0.05)') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + periodo + '</th>';
        });
    });
    
    html += '</tr></thead><tbody>';
    
    Object.entries(dadosConcessoes).forEach(([concessao, hospitaisData], idx) => {
        html += '<tr style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f9fafb' : 'rgba(255,255,255,0.02)') : (window.fundoBranco ? '#ffffff' : 'transparent')) + ';">';
        html += '<td class="concessao-label" style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f3f4f6' : '#1e293b') : (window.fundoBranco ? '#e5e7eb' : '#0f172a')) + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + concessao + '</td>';
        
        hospitaisComDados.forEach((hospitalId, hIdx) => {
            periodos.forEach((periodo, pIdx) => {
                const valor = hospitaisData[hospitalId]?.[periodo] || 0;
                const cor = getCorPorValor(valor);
                const corTexto = getCorTexto(valor);
                
                html += '<td class="heatmap-cell" style="background: ' + cor + '; color: ' + corTexto + '; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + '" title="' + concessao + ' - ' + CONFIG.HOSPITAIS[hospitalId].nome + ' - ' + periodo + ': ' + valor + ' casos">' + (valor > 0 ? valor : '—') + '</td>';
            });
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
}

// =================== HEATMAP LINHAS ===================
function renderHeatmapLinhas() {
    const container = document.getElementById('heatmapLinhasContainer');
    if (!container) return;
    
    const hospitaisValidos = ORDEM_ALFABETICA_HOSPITAIS;
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">Nenhum dado disponível</p>';
        return;
    }
    
    const periodos = ['HOJE', '24H', '48H', '72H'];
    const dadosLinhas = calcularDadosLinhasReais(hospitaisComDados);
    
    let html = `
        <div class="heatmap-legenda">
            <strong>Escala:</strong>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #E5E5E5"></div>
                <span>1-2</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #C6A664"></div>
                <span>3-4</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #0055A4"></div>
                <span>5-6</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #003366"></div>
                <span>7+</span>
            </div>
        </div>
        
        <div class="heatmap-container">
            <table class="heatmap-table">
                <thead>
                    <tr>
                        <th class="concessao-label" style="background: ${window.fundoBranco ? '#f3f4f6' : '#1e293b'}; color: ${window.fundoBranco ? '#000' : '#fff'}; min-width: 200px;">Linha de Cuidado</th>
    `;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        html += `<th colspan="4" style="background: ${hospital.cor}; color: white; border-left: 3px solid rgba(255,255,255,0.5);">${hospital.nome}</th>`;
    });
    
    html += '</tr><tr><th style="background: ' + (window.fundoBranco ? '#f3f4f6' : '#1e293b') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';"></th>';
    
    hospitaisComDados.forEach(() => {
        periodos.forEach((periodo, pIdx) => {
            html += '<th style="font-size: 11px; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + ' background: ' + (window.fundoBranco ? '#f3f4f6' : 'rgba(255,255,255,0.05)') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + periodo + '</th>';
        });
    });
    
    html += '</tr></thead><tbody>';
    
    Object.entries(dadosLinhas).forEach(([linha, hospitaisData], idx) => {
        html += '<tr style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f9fafb' : 'rgba(255,255,255,0.02)') : (window.fundoBranco ? '#ffffff' : 'transparent')) + ';">';
        html += '<td class="concessao-label" style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f3f4f6' : '#1e293b') : (window.fundoBranco ? '#e5e7eb' : '#0f172a')) + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + linha + '</td>';
        
        hospitaisComDados.forEach((hospitalId) => {
            periodos.forEach((periodo, pIdx) => {
                const valor = hospitaisData[hospitalId]?.[periodo] || 0;
                const cor = getCorPorValor(valor);
                const corTexto = getCorTexto(valor);
                
                html += '<td class="heatmap-cell" style="background: ' + cor + '; color: ' + corTexto + '; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + '" title="' + linha + ' - ' + CONFIG.HOSPITAIS[hospitalId].nome + ' - ' + periodo + ': ' + valor + ' casos">' + (valor > 0 ? valor : '—') + '</td>';
            });
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
}

// =================== CALCULAR DADOS CONCESSÕES ===================
function calcularDadosConcessoesReais(hospitaisComDados) {
    const concessoesPorItem = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status !== 'ocupado' && leito.status !== 'Em uso') return;
            
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (concessoes && prevAlta) {
                const concessoesList = Array.isArray(concessoes) ? concessoes : String(concessoes).split('|');
                
                let periodo = '';
                if (prevAlta.includes('Hoje')) periodo = 'HOJE';
                else if (prevAlta.includes('24h') || prevAlta.includes('24H')) periodo = '24H';
                else if (prevAlta === '48h' || prevAlta === '48H') periodo = '48H';
                else if (prevAlta === '72h' || prevAlta === '72H') periodo = '72H';
                
                if (periodo) {
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim()) {
                            const nome = concessao.trim();
                            
                            if (!concessoesPorItem[nome]) {
                                concessoesPorItem[nome] = {};
                                hospitaisComDados.forEach(hId => {
                                    concessoesPorItem[nome][hId] = {
                                        'HOJE': 0,
                                        '24H': 0,
                                        '48H': 0,
                                        '72H': 0
                                    };
                                });
                            }
                            
                            concessoesPorItem[nome][hospitalId][periodo]++;
                        }
                    });
                }
            }
        });
    });
    
    return concessoesPorItem;
}

// =================== CALCULAR DADOS LINHAS ===================
function calcularDadosLinhasReais(hospitaisComDados) {
    const linhasPorItem = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (leito.status !== 'ocupado' && leito.status !== 'Em uso') return;
            
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (linhas && prevAlta) {
                const linhasList = Array.isArray(linhas) ? linhas : String(linhas).split('|');
                
                let periodo = '';
                if (prevAlta.includes('Hoje')) periodo = 'HOJE';
                else if (prevAlta.includes('24h') || prevAlta.includes('24H')) periodo = '24H';
                else if (prevAlta === '48h' || prevAlta === '48H') periodo = '48H';
                else if (prevAlta === '72h' || prevAlta === '72H') periodo = '72H';
                
                if (periodo) {
                    linhasList.forEach(linha => {
                        if (linha && linha.trim()) {
                            const nome = linha.trim();
                            
                            if (!linhasPorItem[nome]) {
                                linhasPorItem[nome] = {};
                                hospitaisComDados.forEach(hId => {
                                    linhasPorItem[nome][hId] = {
                                        'HOJE': 0,
                                        '24H': 0,
                                        '48H': 0,
                                        '72H': 0
                                    };
                                });
                            }
                            
                            linhasPorItem[nome][hospitalId][periodo]++;
                        }
                    });
                }
            }
        });
    });
    
    return linhasPorItem;
}

// CSS
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
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
            
            .gauge-container #gaugeOcupacaoExecutivo {
                width: 140px;
                height: 80px;
            }
            
            .gauge-text {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                text-align: center;
                pointer-events: none;
            }
            
            .gauge-value {
                position: absolute;
                top: 65%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 36px;
                font-weight: 700;
                color: #22c55e;
                line-height: 1;
                margin: 0;
                padding: 6px 16px;
                border-radius: 12px;
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid #22c55e;
                display: inline-block;
            }
            
            .gauge-label {
                display: none;
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
            
            @media (max-width: 768px) {
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
                    padding: 15px !important;
                }
                
                .heatmap-table {
                    font-size: 10px !important;
                }
                
                .heatmap-table th,
                .heatmap-table td {
                    padding: 6px !important;
                }
            }
        </style>
    `;
}

function logInfo(message) {
    console.log('[DASHBOARD EXECUTIVO V3.3] ' + message);
}

function logSuccess(message) {
    console.log('[DASHBOARD EXECUTIVO V3.3] ' + message);
}

function logError(message) {
    console.error('[DASHBOARD EXECUTIVO V3.3] ' + message);
}

console.log('Dashboard Executivo V3.3 - HEATMAP TEMPORAL carregado!');
console.log('Hospitais em ordem alfabética: ADVENTISTA, CRUZ AZUL, NEOMATER, SANTA CLARA, STA MARCELINA');
