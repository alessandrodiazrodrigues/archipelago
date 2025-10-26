// =================== DASHBOARD HOSPITALAR V3.3.3 - VERSÃO CORRIGIDA ===================
// ✅ SEM ChartDataLabels (números via tooltip)
// ✅ Lista de matrículas abaixo de Análise Preditiva
// ✅ Legendas HTML apenas com itens existentes
// ✅ Botão copiar WhatsApp no header

// Estado global para fundo branco
window.fundoBranco = false;

// Função para obter cores Pantone EXATAS do api.js
function getCorExata(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`⚠️ [CORES] Item inválido: "${itemName}"`);
        return '#6b7280';
    }
    
    const paleta = tipo === 'concessao' ? 
        window.CORES_CONCESSOES :
        window.CORES_LINHAS;
    
    if (!paleta) {
        console.error(`❌ [CORES] Paleta não carregada! Verifique se api.js está carregado antes.`);
        return '#6b7280';
    }
    
    let cor = paleta[itemName];
    if (cor) {
        return cor;
    }
    
    const nomeNormalizado = itemName
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[–—]/g, '-');
    
    cor = paleta[nomeNormalizado];
    if (cor) {
        return cor;
    }
    
    console.error(`❌ [CORES] COR NÃO ENCONTRADA: "${itemName}"`);
    return '#6b7280';
}

// Detectar se é mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// =================== FUNÇÃO PARA ATUALIZAR TODAS AS CORES ===================
window.atualizarTodasAsCores = function() {
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && chart.options && chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = corTexto;
                    chart.options.scales.x.grid.color = corGrid;
                    if (chart.options.scales.x.title) {
                        chart.options.scales.x.title.color = corTexto;
                    }
                }
                
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = corTexto;
                    chart.options.scales.y.grid.color = corGrid;
                    if (chart.options.scales.y.title) {
                        chart.options.scales.y.title.color = corTexto;
                    }
                }
                
                chart.update('none');
            }
        });
    }
};

// =================== FUNÇÃO COPIAR WHATSAPP ===================
window.copiarDashboardParaWhatsApp = function() {
    const hospitaisIds = ['H5', 'H2', 'H1', 'H4', 'H3'];
    const hospitaisNomes = {
        'H1': 'NEOMATER',
        'H2': 'CRUZ AZUL',
        'H3': 'STA MARCELINA',
        'H4': 'SANTA CLARA',
        'H5': 'ADVENTISTA'
    };
    
    let texto = `*DASHBOARD HOSPITALAR*\n`;
    texto += `${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n\n`;
    
    hospitaisIds.forEach((hospitalId, index) => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        const nome = hospitaisNomes[hospitalId];
        texto += `━━━━━━━━━━━━━━━━━\n`;
        texto += `*${index + 1}. ${nome}*\n`;
        texto += `━━━━━━━━━━━━━━━━━\n\n`;
        
        // ALTAS PREVISTAS HOJE
        const altasHoje = {
            'Ouro': [],
            '2R': [],
            '3R': []
        };
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
                
                if (prevAlta === 'Hoje Ouro') altasHoje['Ouro'].push(matricula);
                else if (prevAlta === 'Hoje 2R') altasHoje['2R'].push(matricula);
                else if (prevAlta === 'Hoje 3R') altasHoje['3R'].push(matricula);
            }
        });
        
        const temAltas = altasHoje['Ouro'].length > 0 || altasHoje['2R'].length > 0 || altasHoje['3R'].length > 0;
        
        if (temAltas) {
            texto += `📊 *Altas Previstas HOJE:*\n`;
            if (altasHoje['Ouro'].length > 0) {
                texto += `• Hoje Ouro: ${altasHoje['Ouro'].join(', ')}\n`;
            }
            if (altasHoje['2R'].length > 0) {
                texto += `• Hoje 2R: ${altasHoje['2R'].join(', ')}\n`;
            }
            if (altasHoje['3R'].length > 0) {
                texto += `• Hoje 3R: ${altasHoje['3R'].join(', ')}\n`;
            }
            texto += `\n`;
        }
        
        // CONCESSÕES HOJE
        const concessoesHoje = {};
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
                
                if (concessoes && prevAlta && prevAlta.includes('Hoje')) {
                    const concessoesList = Array.isArray(concessoes) ? 
                        concessoes : 
                        String(concessoes).split('|');
                    
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim()) {
                            const nome = concessao.trim();
                            if (!concessoesHoje[nome]) {
                                concessoesHoje[nome] = [];
                            }
                            concessoesHoje[nome].push(matricula);
                        }
                    });
                }
            }
        });
        
        const concessoesOrdenadas = Object.entries(concessoesHoje)
            .sort((a, b) => b[1].length - a[1].length);
        
        if (concessoesOrdenadas.length > 0) {
            texto += `🏥 *Concessões (HOJE):*\n`;
            concessoesOrdenadas.forEach(([nome, mats]) => {
                texto += `• ${nome}: ${mats.join(', ')}\n`;
            });
            texto += `\n`;
        }
        
        // LINHAS DE CUIDADO HOJE
        const linhasHoje = {};
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
                
                if (linhas && prevAlta && prevAlta.includes('Hoje')) {
                    const linhasList = Array.isArray(linhas) ? 
                        linhas : 
                        String(linhas).split('|');
                    
                    linhasList.forEach(linha => {
                        if (linha && linha.trim()) {
                            const nome = linha.trim();
                            if (!linhasHoje[nome]) {
                                linhasHoje[nome] = [];
                            }
                            linhasHoje[nome].push(matricula);
                        }
                    });
                }
            }
        });
        
        const linhasOrdenadas = Object.entries(linhasHoje)
            .sort((a, b) => b[1].length - a[1].length);
        
        if (linhasOrdenadas.length > 0) {
            texto += `🩺 *Linhas de Cuidado (HOJE):*\n`;
            linhasOrdenadas.forEach(([nome, mats]) => {
                texto += `• ${nome}: ${mats.join(', ')}\n`;
            });
            texto += `\n`;
        }
        
        if (!temAltas && concessoesOrdenadas.length === 0 && linhasOrdenadas.length === 0) {
            texto += `_Nenhuma atividade prevista hoje_\n\n`;
        }
    });
    
    navigator.clipboard.writeText(texto).then(() => {
        alert('✅ Dados copiados para o WhatsApp!\n\nCole e envie.');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('❌ Erro ao copiar. Tente novamente.');
    });
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar V3.3.3 CORRIGIDO');
    
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
            logInfo('Container dashHospitalarContent criado automaticamente');
        }
    }
    
    if (!container) {
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Hospitalar');
            return;
        }
    }
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados reais da API V3.3.3</h2>
                <p style="color: #9ca3af; font-size: 14px;">Conectando com Google Apps Script...</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
        return;
    }
    
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => l.status === 'ocupado' || l.status === 'vago');
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; background: #1a1f2e; border-radius: 12px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">Nenhum dado hospitalar disponível</h3>
                <p style="color: #9ca3af; margin-bottom: 20px;">Aguardando dados reais da planilha Google.</p>
                <button onclick="window.forceDataRefresh()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Recarregar Dados Reais
                </button>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div class="dashboard-header" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 15px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; white-space: nowrap;">Dashboard Hospitalar V3.3.3</h2>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.copiarDashboardParaWhatsApp()" class="btn-whatsapp" style="padding: 8px 16px; background: #25D366; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;">
                            📱 WhatsApp
                        </button>
                        <button id="toggleFundoBtn" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                            <span id="toggleIcon">🌙</span>
                            <span id="toggleText">ESCURO</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="hospitais-container">
                ${hospitaisComDados.map(hospitalId => renderHospitalSection(hospitalId)).join('')}
            </div>
        </div>
        
        ${getHospitalConsolidadoCSS()}
    `;
    
    const toggleBtn = document.getElementById('toggleFundoBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const icon = document.getElementById('toggleIcon');
            const text = document.getElementById('toggleText');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                icon.textContent = '☀️';
                text.textContent = 'CLARO';
            } else {
                toggleBtn.classList.remove('active');
                icon.textContent = '🌙';
                text.textContent = 'ESCURO';
            }
            
            window.atualizarTodasAsCores();
            
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId);
                renderLinhasHospital(hospitalId);
            });
            
            logInfo(`Fundo alterado para: ${window.fundoBranco ? 'claro' : 'escuro'}`);
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId);
                renderLinhasHospital(hospitalId);
            });
            
            logSuccess('Dashboard Hospitalar V3.3.3 CORRIGIDO renderizado');
        }, 100);
    };
    
    aguardarChartJS();
};

// Renderizar seção de um hospital
function renderHospitalSection(hospitalId) {
    const hospital = CONFIG.HOSPITAIS[hospitalId];
    const kpis = calcularKPIsHospital(hospitalId);
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${hospital.nome}</h3>
                
                <div class="kpis-container-mobile">
                    <div class="kpi-ocupacao-linha">
                        <div class="kpi-box-ocupacao">
                            <div id="gauge${hospitalId}"></div>
                            <div class="kpi-label">OCUPAÇÃO</div>
                        </div>
                    </div>
                    
                    <div class="kpis-linha-dupla">
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.total}</div>
                            <div class="kpi-label">TOTAL</div>
                        </div>
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.ocupados}</div>
                            <div class="kpi-label">OCUPADOS</div>
                        </div>
                    </div>
                    
                    <div class="kpis-linha-dupla">
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.vagos}</div>
                            <div class="kpi-label">VAGOS</div>
                        </div>
                        <div class="kpi-box-inline">
                            <div class="kpi-value">${kpis.altas}</div>
                            <div class="kpi-label">EM ALTA</div>
                        </div>
                    </div>
                </div>
                
                <div class="kpis-horizontal-container">
                    <div class="kpi-box-inline kpi-gauge-box">
                        <div id="gaugeDesktop${hospitalId}"></div>
                        <div class="kpi-label">OCUPAÇÃO</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.total}</div>
                        <div class="kpi-label">TOTAL</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.ocupados}</div>
                        <div class="kpi-label">OCUPADOS</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.vagos}</div>
                        <div class="kpi-label">VAGOS</div>
                    </div>
                    
                    <div class="kpi-box-inline">
                        <div class="kpi-value">${kpis.altas}</div>
                        <div class="kpi-label">EM ALTA</div>
                    </div>
                </div>
            </div>
            
            <div class="graficos-verticais">
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Análise Preditiva de Altas em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                    <div id="listaAltas${hospitalId}"></div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                    <div id="listaConcessoes${hospitalId}"></div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                    <div id="listaLinhas${hospitalId}"></div>
                </div>
            </div>
        </div>
    `;
}

// Calcular KPIs de um hospital
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return { ocupacao: 0, total: 0, ocupados: 0, vagos: 0, altas: 0 };
    }
    
    let totalEnf = 0, totalApt = 0, totalUti = 0;
    let ocupadosEnf = 0, ocupadosApt = 0, ocupadosUti = 0;
    
    hospital.leitos.forEach(leito => {
        const tipo = leito.tipo || leito.categoria || 'ENF';
        
        if (tipo.includes('ENF') || tipo.includes('Enfermaria')) {
            totalEnf++;
            if (leito.status === 'ocupado') ocupadosEnf++;
        } else if (tipo.includes('APT') || tipo.includes('Apartamento')) {
            totalApt++;
            if (leito.status === 'ocupado') ocupadosApt++;
        } else if (tipo.includes('UTI')) {
            totalUti++;
            if (leito.status === 'ocupado') ocupadosUti++;
        } else {
            totalEnf++;
            if (leito.status === 'ocupado') ocupadosEnf++;
        }
    });
    
    const total = totalEnf + totalApt + totalUti;
    const ocupados = ocupadosEnf + ocupadosApt + ocupadosUti;
    const vagos = total - ocupados;
    
    const TIMELINE_ALTA = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'];
    const altas = hospital.leitos.filter(l => {
        if (l.status === 'ocupado') {
            const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
            return prevAlta && TIMELINE_ALTA.includes(prevAlta);
        }
        return false;
    }).length;
    
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    return { ocupacao, total, ocupados, vagos, altas };
}

// =================== GAUGE SVG CUSTOMIZADO ===================
function renderGaugeHospital(hospitalId) {
    const canvasMobile = document.getElementById(`gauge${hospitalId}`);
    const canvasDesktop = document.getElementById(`gaugeDesktop${hospitalId}`);
    
    const kpis = calcularKPIsHospital(hospitalId);
    const ocupacao = kpis.ocupacao;
    
    let cor = '#22c55e';
    if (ocupacao >= 85) cor = '#ef4444';
    else if (ocupacao >= 50) cor = '#eab308';
    
    const circunferencia = Math.PI * 90;
    const progresso = (ocupacao / 100) * circunferencia;
    
    if (canvasMobile) {
        canvasMobile.innerHTML = `
            <div style="position: relative; width: 120px; height: 70px; margin: 0 auto;">
                <svg viewBox="0 0 120 70" style="width: 100%; height: 100%;">
                    <path d="M 10 60 A 45 45 0 0 1 110 60" 
                          fill="none" 
                          stroke="rgba(255,255,255,0.1)" 
                          stroke-width="12" 
                          stroke-linecap="round"/>
                    <path d="M 10 60 A 45 45 0 0 1 110 60" 
                          fill="none" 
                          stroke="${cor}" 
                          stroke-width="12" 
                          stroke-linecap="round"
                          stroke-dasharray="${circunferencia}"
                          stroke-dashoffset="${circunferencia - progresso}"/>
                    <text x="60" y="55" 
                          text-anchor="middle" 
                          font-size="24" 
                          font-weight="700" 
                          fill="white">
                        ${ocupacao}%
                    </text>
                </svg>
            </div>
        `;
    }
    
    if (canvasDesktop) {
        canvasDesktop.innerHTML = `
            <div style="position: relative; width: 100px; height: 60px; margin: 0 auto;">
                <svg viewBox="0 0 120 70" style="width: 100%; height: 100%;">
                    <path d="M 10 60 A 45 45 0 0 1 110 60" 
                          fill="none" 
                          stroke="rgba(255,255,255,0.1)" 
                          stroke-width="12" 
                          stroke-linecap="round"/>
                    <path d="M 10 60 A 45 45 0 0 1 110 60" 
                          fill="none" 
                          stroke="${cor}" 
                          stroke-width="12" 
                          stroke-linecap="round"
                          stroke-dasharray="${circunferencia}"
                          stroke-dashoffset="${circunferencia - progresso}"/>
                    <text x="60" y="55" 
                          text-anchor="middle" 
                          font-size="20" 
                          font-weight="700" 
                          fill="white">
                        ${ocupacao}%
                    </text>
                </svg>
            </div>
        `;
    }
}

// Plugin para fundo branco/escuro nos gráficos
const backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

// =================== ANÁLISE PREDITIVA DE ALTAS - BARRAS AZUL + LISTA MATRÍCULAS ===================
function renderAltasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `altas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const dados = {
        'Ouro': [0, 0, 0, 0, 0],
        '2R': [0, 0, 0, 0, 0],
        '3R': [0, 0, 0, 0, 0],
        '48H': [0, 0, 0, 0, 0],
        '72H': [0, 0, 0, 0, 0],
        '96H': [0, 0, 0, 0, 0]
    };
    
    // ✅ NOVO: Coletar matrículas das altas HOJE
    const altasHoje = {
        'Ouro': [],
        '2R': [],
        '3R': []
    };
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
            
            if (prevAlta) {
                let index = -1;
                let tipo = '';
                
                if (prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; altasHoje['Ouro'].push(matricula); }
                else if (prevAlta === 'Hoje 2R') { index = 0; tipo = '2R'; altasHoje['2R'].push(matricula); }
                else if (prevAlta === 'Hoje 3R') { index = 0; tipo = '3R'; altasHoje['3R'].push(matricula); }
                else if (prevAlta === '24h Ouro') { index = 1; tipo = 'Ouro'; }
                else if (prevAlta === '24h 2R') { index = 1; tipo = '2R'; }
                else if (prevAlta === '24h 3R') { index = 1; tipo = '3R'; }
                else if (prevAlta === '48h' || prevAlta === '48H') { index = 2; tipo = '48H'; }
                else if (prevAlta === '72h' || prevAlta === '72H') { index = 3; tipo = '72H'; }
                else if (prevAlta === '96h' || prevAlta === '96H') { index = 4; tipo = '96H'; }
                
                if (index >= 0 && tipo && dados[tipo]) {
                    dados[tipo][index]++;
                }
            }
        }
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    const dadosSimplificados = [
        dados['Ouro'][0] + dados['2R'][0] + dados['3R'][0],
        dados['Ouro'][1] + dados['2R'][1] + dados['3R'][1],
        dados['48H'][2],
        dados['72H'][3],
        dados['96H'][4]
    ];
    
    const valorMaximo = Math.max(...dadosSimplificados, 0);
    const limiteSuperior = valorMaximo + 1;
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Previsão de Alta',
                data: dadosSimplificados,
                backgroundColor: '#0055A4',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Beneficiários: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: corTexto,
                        font: { size: 12, weight: 600 },
                        maxRotation: 0
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    max: limiteSuperior,
                    min: 0,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
    
    // ✅ LISTA DE MATRÍCULAS ABAIXO DO GRÁFICO
    const listaDiv = document.getElementById(`listaAltas${hospitalId}`);
    if (listaDiv) {
        const temAltas = altasHoje['Ouro'].length > 0 || altasHoje['2R'].length > 0 || altasHoje['3R'].length > 0;
        
        if (temAltas) {
            let listaHtml = '<div class="lista-concessoes">';
            listaHtml += '<h5 style="margin: 0 0 10px 0; color: ' + corTexto + '; font-size: 13px; font-weight: 600;">Matrículas das Altas Previstas HOJE:</h5>';
            
            if (altasHoje['Ouro'].length > 0) {
                listaHtml += `<div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid #FFD700;">`;
                listaHtml += `<strong style="color: ${corTexto}; font-size: 12px;">Hoje Ouro:</strong> `;
                listaHtml += `<span style="color: ${corTexto}; font-size: 11px;">${altasHoje['Ouro'].join(', ')}</span>`;
                listaHtml += `</div>`;
            }
            
            if (altasHoje['2R'].length > 0) {
                listaHtml += `<div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid #C0C0C0;">`;
                listaHtml += `<strong style="color: ${corTexto}; font-size: 12px;">Hoje 2R:</strong> `;
                listaHtml += `<span style="color: ${corTexto}; font-size: 11px;">${altasHoje['2R'].join(', ')}</span>`;
                listaHtml += `</div>`;
            }
            
            if (altasHoje['3R'].length > 0) {
                listaHtml += `<div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid #CD7F32;">`;
                listaHtml += `<strong style="color: ${corTexto}; font-size: 12px;">Hoje 3R:</strong> `;
                listaHtml += `<span style="color: ${corTexto}; font-size: 11px;">${altasHoje['3R'].join(', ')}</span>`;
                listaHtml += `</div>`;
            }
            
            listaHtml += '</div>';
            listaDiv.innerHTML = listaHtml;
        } else {
            listaDiv.innerHTML = '';
        }
    }
}

// =================== CONCESSÕES - ROSCA HOJE (SEM DATALABELS) ===================
function renderConcessoesHospital(hospitalId) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const concessoesPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula);
            
            if (concessoes && prevAlta && prevAlta.includes('Hoje')) {
                const concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
                concessoesList.forEach(concessao => {
                    if (concessao && concessao.trim()) {
                        const nome = concessao.trim();
                        if (!concessoesPorTimeline[nome]) {
                            concessoesPorTimeline[nome] = {
                                total: 0,
                                matriculas: []
                            };
                        }
                        concessoesPorTimeline[nome].total++;
                        concessoesPorTimeline[nome].matriculas.push(matricula || 'S/N');
                    }
                });
            }
        }
    });
    
    const concessoesOrdenadas = Object.entries(concessoesPorTimeline)
        .map(([nome, obj]) => [nome, obj.total, obj.matriculas])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    if (concessoesOrdenadas.length === 0) return;
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const ctx = canvas.getContext('2d');
    
    const dadosHoje = concessoesOrdenadas.map(([nome, total]) => total);
    const labels = concessoesOrdenadas.map(([nome]) => nome);
    const cores = labels.map(label => getCorExata(label, 'concessao'));
    const matriculas = concessoesOrdenadas.map(([nome, total, mats]) => mats);
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dadosHoje,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: corTexto,
                        font: { size: 11 },
                        padding: 10,
                        boxWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
    
    // ✅ LISTA SÓ COM AS QUE EXISTEM
    const listaDiv = document.getElementById(`listaConcessoes${hospitalId}`);
    if (listaDiv) {
        let listaHtml = '<div class="lista-concessoes">';
        listaHtml += '<h5 style="margin: 0 0 10px 0; color: ' + corTexto + '; font-size: 13px; font-weight: 600;">Matrículas por Concessão (HOJE):</h5>';
        
        labels.forEach((label, index) => {
            const mats = matriculas[index];
            if (mats && mats.length > 0) {
                listaHtml += `<div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid ${cores[index]};">`;
                listaHtml += `<strong style="color: ${corTexto}; font-size: 12px;">${label}:</strong> `;
                listaHtml += `<span style="color: ${corTexto}; font-size: 11px;">${mats.join(', ')}</span>`;
                listaHtml += `</div>`;
            }
        });
        
        listaHtml += '</div>';
        listaDiv.innerHTML = listaHtml;
    }
}

// =================== LINHAS DE CUIDADO - ROSCA HOJE (SEM DATALABELS) ===================
function renderLinhasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const linhasPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula);
            
            if (linhas && prevAlta && prevAlta.includes('Hoje')) {
                const linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
                linhasList.forEach(linha => {
                    if (linha && linha.trim()) {
                        const nome = linha.trim();
                        if (!linhasPorTimeline[nome]) {
                            linhasPorTimeline[nome] = {
                                total: 0,
                                matriculas: []
                            };
                        }
                        linhasPorTimeline[nome].total++;
                        linhasPorTimeline[nome].matriculas.push(matricula || 'S/N');
                    }
                });
            }
        }
    });
    
    const linhasOrdenadas = Object.entries(linhasPorTimeline)
        .map(([nome, obj]) => [nome, obj.total, obj.matriculas])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    if (linhasOrdenadas.length === 0) return;
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const ctx = canvas.getContext('2d');
    
    const dadosHoje = linhasOrdenadas.map(([nome, total]) => total);
    const labels = linhasOrdenadas.map(([nome]) => nome);
    const cores = labels.map(label => getCorExata(label, 'linha'));
    const matriculas = linhasOrdenadas.map(([nome, total, mats]) => mats);
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dadosHoje,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: corTexto,
                        font: { size: 11 },
                        padding: 10,
                        boxWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
    
    // ✅ LISTA SÓ COM AS QUE EXISTEM
    const listaDiv = document.getElementById(`listaLinhas${hospitalId}`);
    if (listaDiv) {
        let listaHtml = '<div class="lista-concessoes">';
        listaHtml += '<h5 style="margin: 0 0 10px 0; color: ' + corTexto + '; font-size: 13px; font-weight: 600;">Matrículas por Linha (HOJE):</h5>';
        
        labels.forEach((label, index) => {
            const mats = matriculas[index];
            if (mats && mats.length > 0) {
                listaHtml += `<div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; border-left: 3px solid ${cores[index]};">`;
                listaHtml += `<strong style="color: ${corTexto}; font-size: 12px;">${label}:</strong> `;
                listaHtml += `<span style="color: ${corTexto}; font-size: 11px;">${mats.join(', ')}</span>`;
                listaHtml += `</div>`;
            }
        });
        
        listaHtml += '</div>';
        listaDiv.innerHTML = listaHtml;
    }
}

// Função de força de atualização
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares V3.3.3...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    Recarregando dados reais da API V3.3.3...
                </div>
            </div>
        `;
    }
    
    if (window.loadHospitalData) {
        window.loadHospitalData().then(() => {
            setTimeout(() => {
                window.renderDashboardHospitalar();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            window.renderDashboardHospitalar();
        }, 2000);
    }
};

// CSS CONSOLIDADO
function getHospitalConsolidadoCSS() {
    return `
        <style id="hospitalConsolidadoCSS">
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .btn-whatsapp:hover {
                background: #128C7E !important;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
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
            
            .hospitais-container {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }
            
            .hospital-card {
                background: #1a1f2e;
                border-radius: 16px;
                padding: 25px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .hospital-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }
            
            .hospital-header {
                margin-bottom: 25px;
            }
            
            .hospital-title {
                color: #60a5fa;
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 20px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .kpis-container-mobile {
                display: none;
            }
            
            .kpis-horizontal-container {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                gap: 16px;
                margin-bottom: 30px;
                padding: 0;
                background: transparent;
                border-radius: 0;
            }
            
            .kpi-box-inline {
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
                min-height: 100px;
            }
            
            .kpi-box-inline:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-gauge-box {
                position: relative;
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
            
            .graficos-verticais {
                display: flex;
                flex-direction: column;
                gap: 25px;
                width: 100%;
            }
            
            .grafico-item {
                width: 100%;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-sizing: border-box;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .chart-header h4 {
                margin: 0;
                color: #e2e8f0;
                font-size: 16px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .chart-container {
                position: relative;
                height: 400px;
                width: 100%;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 15px;
                box-sizing: border-box;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-height: 370px !important;
            }
            
            .lista-concessoes {
                margin-top: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
            }
            
            @media (max-width: 1024px) and (min-width: 769px) {
                .hospitais-container {
                    gap: 25px;
                }
                
                .hospital-card {
                    padding: 20px;
                }
                
                .kpis-horizontal-container {
                    gap: 12px;
                }
                
                .kpi-box-inline {
                    padding: 15px 10px;
                    min-height: 85px;
                }
                
                .chart-container {
                    height: 350px;
                    padding: 12px;
                }
            }
            
            @media (max-width: 768px) {
                .dashboard-header {
                    padding: 15px !important;
                    margin-bottom: 20px !important;
                }
                
                .dashboard-header h2 {
                    font-size: 18px !important;
                    margin-bottom: 0 !important;
                    line-height: 1.2 !important;
                }
                
                .hospitais-container {
                    gap: 15px !important;
                }
                
                .hospital-card {
                    padding: 10px !important;
                    margin: 0 3px !important;
                    border-radius: 8px !important;
                }
                
                .kpis-horizontal-container {
                    display: none !important;
                }
                
                .kpis-container-mobile {
                    display: flex !important;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }
                
                .kpi-ocupacao-linha {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 5px;
                }
                
                .kpi-box-ocupacao {
                    background: #1a1f2e;
                    border-radius: 12px;
                    padding: 15px 20px;
                    color: white;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-width: 140px;
                }
                
                .kpis-linha-dupla {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                }
                
                .kpis-linha-dupla .kpi-box-inline {
                    background: #1a1f2e;
                    border-radius: 8px;
                    padding: 10px 8px;
                    color: white;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 70px;
                    width: 100%;
                }
                
                .kpis-linha-dupla .kpi-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                
                .kpis-linha-dupla .kpi-label {
                    font-size: 10px;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                
                .grafico-item {
                    padding: 8px !important;
                    margin: 0 !important;
                    border-radius: 6px !important;
                }
                
                .chart-container {
                    padding: 5px !important;
                    height: 280px !important;
                    background: rgba(0, 0, 0, 0.1) !important;
                }
                
                .chart-container canvas {
                    max-height: 270px !important;
                }
                
                .chart-header {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 6px !important;
                    margin-bottom: 8px !important;
                }
                
                .chart-header h4 {
                    font-size: 12px !important;
                    line-height: 1.2 !important;
                }
                
                .hospital-title {
                    font-size: 14px !important;
                    margin-bottom: 12px !important;
                }
                
                .btn-whatsapp {
                    padding: 6px 12px !important;
                    font-size: 12px !important;
                }
                
                .toggle-fundo-btn {
                    padding: 4px 8px !important;
                    font-size: 11px !important;
                    gap: 4px !important;
                }
            }
            
            @media (max-width: 480px) {
                .hospital-card {
                    padding: 8px !important;
                    margin: 0 2px !important;
                }
                
                .kpi-box-ocupacao {
                    min-width: 120px;
                    padding: 12px 16px;
                }
                
                .kpis-linha-dupla {
                    gap: 4px;
                    grid-template-columns: 1fr 1fr;
                }
                
                .kpis-linha-dupla .kpi-box-inline {
                    padding: 8px 6px;
                    min-height: 60px;
                }
                
                .kpis-linha-dupla .kpi-value {
                    font-size: 18px;
                }
                
                .kpis-linha-dupla .kpi-label {
                    font-size: 9px;
                }
                
                .chart-container {
                    padding: 3px !important;
                    height: 220px !important;
                }
                
                .chart-header h4 {
                    font-size: 10px !important;
                }
            }
            
            @media (max-width: 768px) and (orientation: landscape) {
                .hospital-card {
                    padding: 8px !important;
                }
                
                .kpis-container-mobile {
                    gap: 6px;
                }
                
                .kpis-linha-dupla {
                    grid-template-columns: 1fr 1fr;
                }
                
                .chart-container {
                    height: 200px !important;
                }
            }
        </style>
    `;
}

// Exportação de funções globais
window.calcularKPIsHospital = calcularKPIsHospital;
window.renderGaugeHospital = renderGaugeHospital;
window.renderAltasHospital = renderAltasHospital;
window.renderConcessoesHospital = renderConcessoesHospital;
window.renderLinhasHospital = renderLinhasHospital;

// Funções de log
function logInfo(message) {
    console.log(`🔵 [DASHBOARD HOSPITALAR V3.3.3] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD HOSPITALAR V3.3.3] ${message}`);
}

function logError(message, error) {
    console.error(`❌ [DASHBOARD HOSPITALAR V3.3.3] ${message}`, error || '');
}

console.log('🎯 Dashboard Hospitalar V3.3.3 - VERSÃO CORRIGIDA!');
console.log('✅ CORREÇÃO: SEM dependência ChartDataLabels');
console.log('✅ CORREÇÃO: Lista de matrículas abaixo de Análise Preditiva');
console.log('✅ CORREÇÃO: Legendas HTML apenas com itens existentes');
console.log('✅ NOVO: Botão copiar WhatsApp no header');
console.log('🚀 READY: Sistema V3.3.3 100% funcional!');
