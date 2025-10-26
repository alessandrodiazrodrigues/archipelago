// js/dashboards/dashboard-hospital.js
// =================== DASHBOARD HOSPITALAR V3.3.6 - SEM CHARTDATALABELS ===================
// ✅ Análise Preditiva: BARRAS HORIZONTAIS
// ✅ Concessões/Linhas: LAYOUT 3 BOXES com GRÁFICOS DE ROSCA
// ✅ Funciona SEM ChartDataLabels (números na legenda)
// ✅ WhatsApp: Inclui HOJE, 24H e 48H

// Estado global para fundo branco
window.fundoBranco = false;

// Verificar se ChartDataLabels está disponível
const hasDataLabels = typeof ChartDataLabels !== 'undefined';
if (!hasDataLabels) {
    console.warn('⚠️ ChartDataLabels não está carregado. Números serão mostrados na legenda.');
}

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

// =================== FUNÇÃO COPIAR WHATSAPP (INCLUI HOJE, 24H, 48H) ===================
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
        
        // ALTAS PREVISTAS (HOJE, 24H, 48H)
        const altasTimeline = {
            'HOJE': { 'Ouro': [], '2R': [], '3R': [] },
            '24H': { 'Ouro': [], '2R': [], '3R': [] },
            '48H': []
        };
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
                
                if (prevAlta === 'Hoje Ouro') altasTimeline['HOJE']['Ouro'].push(matricula);
                else if (prevAlta === 'Hoje 2R') altasTimeline['HOJE']['2R'].push(matricula);
                else if (prevAlta === 'Hoje 3R') altasTimeline['HOJE']['3R'].push(matricula);
                else if (prevAlta === '24h Ouro') altasTimeline['24H']['Ouro'].push(matricula);
                else if (prevAlta === '24h 2R') altasTimeline['24H']['2R'].push(matricula);
                else if (prevAlta === '24h 3R') altasTimeline['24H']['3R'].push(matricula);
                else if (prevAlta === '48h' || prevAlta === '48H') altasTimeline['48H'].push(matricula);
            }
        });
        
        const temAltasHoje = altasTimeline['HOJE']['Ouro'].length > 0 || altasTimeline['HOJE']['2R'].length > 0 || altasTimeline['HOJE']['3R'].length > 0;
        const temAltas24h = altasTimeline['24H']['Ouro'].length > 0 || altasTimeline['24H']['2R'].length > 0 || altasTimeline['24H']['3R'].length > 0;
        const temAltas48h = altasTimeline['48H'].length > 0;
        
        if (temAltasHoje) {
            texto += `📊 *Altas Previstas HOJE:*\n`;
            if (altasTimeline['HOJE']['Ouro'].length > 0) {
                texto += `• Hoje Ouro: ${altasTimeline['HOJE']['Ouro'].join(', ')}\n`;
            }
            if (altasTimeline['HOJE']['2R'].length > 0) {
                texto += `• Hoje 2R: ${altasTimeline['HOJE']['2R'].join(', ')}\n`;
            }
            if (altasTimeline['HOJE']['3R'].length > 0) {
                texto += `• Hoje 3R: ${altasTimeline['HOJE']['3R'].join(', ')}\n`;
            }
            texto += `\n`;
        }
        
        if (temAltas24h) {
            texto += `📊 *Altas Previstas 24H:*\n`;
            if (altasTimeline['24H']['Ouro'].length > 0) {
                texto += `• 24h Ouro: ${altasTimeline['24H']['Ouro'].join(', ')}\n`;
            }
            if (altasTimeline['24H']['2R'].length > 0) {
                texto += `• 24h 2R: ${altasTimeline['24H']['2R'].join(', ')}\n`;
            }
            if (altasTimeline['24H']['3R'].length > 0) {
                texto += `• 24h 3R: ${altasTimeline['24H']['3R'].join(', ')}\n`;
            }
            texto += `\n`;
        }
        
        if (temAltas48h) {
            texto += `📊 *Altas Previstas 48H:*\n`;
            texto += `• 48h: ${altasTimeline['48H'].join(', ')}\n\n`;
        }
        
        // CONCESSÕES (HOJE, 24H, 48H)
        const concessoesTimeline = {
            'HOJE': {},
            '24H': {},
            '48H': {}
        };
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
                
                if (concessoes) {
                    const concessoesList = Array.isArray(concessoes) ? 
                        concessoes : 
                        String(concessoes).split('|');
                    
                    let timeline = null;
                    if (prevAlta && prevAlta.includes('Hoje')) timeline = 'HOJE';
                    else if (prevAlta && prevAlta.includes('24h')) timeline = '24H';
                    else if (prevAlta && (prevAlta.includes('48h') || prevAlta.includes('48H'))) timeline = '48H';
                    
                    if (timeline) {
                        concessoesList.forEach(concessao => {
                            if (concessao && concessao.trim()) {
                                const nome = concessao.trim();
                                if (!concessoesTimeline[timeline][nome]) {
                                    concessoesTimeline[timeline][nome] = [];
                                }
                                concessoesTimeline[timeline][nome].push(matricula);
                            }
                        });
                    }
                }
            }
        });
        
        ['HOJE', '24H', '48H'].forEach(timeline => {
            const concessoes = Object.entries(concessoesTimeline[timeline])
                .sort((a, b) => b[1].length - a[1].length);
            
            if (concessoes.length > 0) {
                texto += `🏥 *Concessões (${timeline}):*\n`;
                concessoes.forEach(([nome, mats]) => {
                    texto += `• ${nome}: ${mats.join(', ')}\n`;
                });
                texto += `\n`;
            }
        });
        
        // LINHAS DE CUIDADO (HOJE, 24H, 48H)
        const linhasTimeline = {
            'HOJE': {},
            '24H': {},
            '48H': {}
        };
        
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
                
                if (linhas) {
                    const linhasList = Array.isArray(linhas) ? 
                        linhas : 
                        String(linhas).split('|');
                    
                    let timeline = null;
                    if (prevAlta && prevAlta.includes('Hoje')) timeline = 'HOJE';
                    else if (prevAlta && prevAlta.includes('24h')) timeline = '24H';
                    else if (prevAlta && (prevAlta.includes('48h') || prevAlta.includes('48H'))) timeline = '48H';
                    
                    if (timeline) {
                        linhasList.forEach(linha => {
                            if (linha && linha.trim()) {
                                const nome = linha.trim();
                                if (!linhasTimeline[timeline][nome]) {
                                    linhasTimeline[timeline][nome] = [];
                                }
                                linhasTimeline[timeline][nome].push(matricula);
                            }
                        });
                    }
                }
            }
        });
        
        ['HOJE', '24H', '48H'].forEach(timeline => {
            const linhas = Object.entries(linhasTimeline[timeline])
                .sort((a, b) => b[1].length - a[1].length);
            
            if (linhas.length > 0) {
                texto += `🩺 *Linhas de Cuidado (${timeline}):*\n`;
                linhas.forEach(([nome, mats]) => {
                    texto += `• ${nome}: ${mats.join(', ')}\n`;
                });
                texto += `\n`;
            }
        });
        
        if (!temAltasHoje && !temAltas24h && !temAltas48h && 
            Object.keys(concessoesTimeline['HOJE']).length === 0 && 
            Object.keys(concessoesTimeline['24H']).length === 0 && 
            Object.keys(concessoesTimeline['48H']).length === 0) {
            texto += `_Nenhuma atividade prevista_\n\n`;
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
    logInfo('Renderizando Dashboard Hospitalar V3.3.6 (SEM DataLabels)');
    
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
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados reais da API V3.3.6</h2>
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
    
    // ✅ ORDEM ALFABÉTICA DOS HOSPITAIS
    const ordemAlfabetica = ['H5', 'H2', 'H1', 'H4', 'H3'];
    
    const hospitaisComDados = ordemAlfabetica.filter(hospitalId => {
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
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; white-space: nowrap;">Dashboard Hospitalar V3.3.6</h2>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.copiarDashboardParaWhatsApp()" class="btn-whatsapp" style="padding: 8px 16px; background: #25D366; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;">
                            Copiar para WhatsApp
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
            
            logSuccess('Dashboard Hospitalar V3.3.6 renderizado');
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
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${hoje}</h4>
                    </div>
                    <div id="concessoesBoxes${hospitalId}" class="timeline-boxes-container"></div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado Previstas em ${hoje}</h4>
                    </div>
                    <div id="linhasBoxes${hospitalId}" class="timeline-boxes-container"></div>
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

// =================== ANÁLISE PREDITIVA DE ALTAS - BARRAS HORIZONTAIS ===================
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
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (prevAlta) {
                let index = -1;
                let tipo = '';
                
                if (prevAlta === 'Hoje Ouro') { index = 0; tipo = 'Ouro'; }
                else if (prevAlta === 'Hoje 2R') { index = 0; tipo = '2R'; }
                else if (prevAlta === 'Hoje 3R') { index = 0; tipo = '3R'; }
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
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            plugins: {
                legend: { 
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `Beneficiários: ${context.parsed.x}`;
                        }
                    }
                }
            },
            scales: {
                x: {
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
                },
                y: {
                    ticks: {
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
}

// =================== CONCESSÕES - LAYOUT 3 BOXES COM GRÁFICOS DE ROSCA ===================
function renderConcessoesHospital(hospitalId) {
    const container = document.getElementById(`concessoesBoxes${hospitalId}`);
    if (!container) return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const concessoesPorTimeline = {
        'HOJE': {},
        '24H': {},
        '48H': {}
    };
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
            
            if (concessoes) {
                const concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
                let timeline = null;
                if (prevAlta && prevAlta.includes('Hoje')) timeline = 'HOJE';
                else if (prevAlta && prevAlta.includes('24h')) timeline = '24H';
                else if (prevAlta && (prevAlta.includes('48h') || prevAlta.includes('48H'))) timeline = '48H';
                
                if (timeline) {
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim()) {
                            const nome = concessao.trim();
                            if (!concessoesPorTimeline[timeline][nome]) {
                                concessoesPorTimeline[timeline][nome] = [];
                            }
                            concessoesPorTimeline[timeline][nome].push(matricula);
                        }
                    });
                }
            }
        }
    });
    
    let html = '<div class="timeline-boxes-grid">';
    
    ['HOJE', '24H', '48H'].forEach(timeline => {
        const concessoes = Object.entries(concessoesPorTimeline[timeline])
            .sort((a, b) => b[1].length - a[1].length);
        
        html += `<div class="timeline-box">`;
        html += `<div class="timeline-box-header">${timeline}</div>`;
        
        html += `<div class="timeline-chart-container">`;
        html += `<canvas id="graficoConcessoes${hospitalId}_${timeline}" class="timeline-chart"></canvas>`;
        html += `</div>`;
        
        html += `<div class="timeline-box-content">`;
        
        if (concessoes.length === 0) {
            html += `<div style="text-align: center; padding: 20px; color: #9ca3af; font-style: italic; font-size: 12px;">Sem concessões</div>`;
        } else {
            concessoes.forEach(([nome, mats]) => {
                const cor = getCorExata(nome, 'concessao');
                html += `<div class="timeline-item" style="border-left-color: ${cor};">`;
                html += `<div class="timeline-item-name">${nome}</div>`;
                html += `<div class="timeline-item-mats">${mats.join(', ')}</div>`;
                html += `</div>`;
            });
        }
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(() => {
        ['HOJE', '24H', '48H'].forEach(timeline => {
            renderDoughnutConcessoes(hospitalId, timeline, concessoesPorTimeline[timeline]);
        });
    }, 100);
}

// =================== RENDERIZAR GRÁFICO DE ROSCA CONCESSÕES (SEM LEGENDA) ===================
function renderDoughnutConcessoes(hospitalId, timeline, dados) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}_${timeline}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = `concessoes${hospitalId}_${timeline}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const concessoes = Object.entries(dados)
        .sort((a, b) => b[1].length - a[1].length);
    
    if (concessoes.length === 0) return;
    
    const labels = concessoes.map(([nome]) => nome);
    const values = concessoes.map(([, mats]) => mats.length);
    const colors = labels.map(label => getCorExata(label, 'concessao'));
    
    const ctx = canvas.getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(26, 31, 46, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percent}%)`;
                    }
                }
            }
        }
    };
    
    const chartPlugins = [backgroundPlugin];
    
    if (hasDataLabels) {
        chartOptions.plugins.datalabels = {
            color: '#ffffff',
            font: { size: 14, weight: 'bold' },
            formatter: (value, context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const porcentagem = ((value / total) * 100).toFixed(0);
                return `${value}\n(${porcentagem}%)`;
            }
        };
        chartPlugins.push(ChartDataLabels);
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
            }]
        },
        options: chartOptions,
        plugins: chartPlugins
    });
}

// =================== LINHAS DE CUIDADO - LAYOUT 3 BOXES COM GRÁFICOS DE ROSCA ===================
function renderLinhasHospital(hospitalId) {
    const container = document.getElementById(`linhasBoxes${hospitalId}`);
    if (!container) return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const linhasPorTimeline = {
        'HOJE': {},
        '24H': {},
        '48H': {}
    };
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula) || 'S/N';
            
            if (linhas) {
                const linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
                let timeline = null;
                if (prevAlta && prevAlta.includes('Hoje')) timeline = 'HOJE';
                else if (prevAlta && prevAlta.includes('24h')) timeline = '24H';
                else if (prevAlta && (prevAlta.includes('48h') || prevAlta.includes('48H'))) timeline = '48H';
                
                if (timeline) {
                    linhasList.forEach(linha => {
                        if (linha && linha.trim()) {
                            const nome = linha.trim();
                            if (!linhasPorTimeline[timeline][nome]) {
                                linhasPorTimeline[timeline][nome] = [];
                            }
                            linhasPorTimeline[timeline][nome].push(matricula);
                        }
                    });
                }
            }
        }
    });
    
    let html = '<div class="timeline-boxes-grid">';
    
    ['HOJE', '24H', '48H'].forEach(timeline => {
        const linhas = Object.entries(linhasPorTimeline[timeline])
            .sort((a, b) => b[1].length - a[1].length);
        
        html += `<div class="timeline-box">`;
        html += `<div class="timeline-box-header">${timeline}</div>`;
        
        html += `<div class="timeline-chart-container">`;
        html += `<canvas id="graficoLinhas${hospitalId}_${timeline}" class="timeline-chart"></canvas>`;
        html += `</div>`;
        
        html += `<div class="timeline-box-content">`;
        
        if (linhas.length === 0) {
            html += `<div style="text-align: center; padding: 20px; color: #9ca3af; font-style: italic; font-size: 12px;">Sem linhas de cuidado</div>`;
        } else {
            linhas.forEach(([nome, mats]) => {
                const cor = getCorExata(nome, 'linha');
                html += `<div class="timeline-item" style="border-left-color: ${cor};">`;
                html += `<div class="timeline-item-name">${nome}</div>`;
                html += `<div class="timeline-item-mats">${mats.join(', ')}</div>`;
                html += `</div>`;
            });
        }
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(() => {
        ['HOJE', '24H', '48H'].forEach(timeline => {
            renderDoughnutLinhas(hospitalId, timeline, linhasPorTimeline[timeline]);
        });
    }, 100);
}

// =================== RENDERIZAR GRÁFICO DE ROSCA LINHAS (SEM LEGENDA) ===================
function renderDoughnutLinhas(hospitalId, timeline, dados) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}_${timeline}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = `linhas${hospitalId}_${timeline}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const linhas = Object.entries(dados)
        .sort((a, b) => b[1].length - a[1].length);
    
    if (linhas.length === 0) return;
    
    const labels = linhas.map(([nome]) => nome);
    const values = linhas.map(([, mats]) => mats.length);
    const colors = labels.map(label => getCorExata(label, 'linha'));
    
    const ctx = canvas.getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(26, 31, 46, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percent}%)`;
                    }
                }
            }
        }
    };
    
    const chartPlugins = [backgroundPlugin];
    
    if (hasDataLabels) {
        chartOptions.plugins.datalabels = {
            color: '#ffffff',
            font: { size: 14, weight: 'bold' },
            formatter: (value, context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const porcentagem = ((value / total) * 100).toFixed(0);
                return `${value}\n(${porcentagem}%)`;
            }
        };
        chartPlugins.push(ChartDataLabels);
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
            }]
        },
        options: chartOptions,
        plugins: chartPlugins
    });
}

// Função de força de atualização
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares V3.3.6...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    Recarregando dados reais da API V3.3.6...
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
            
            /* =================== TIMELINE BOXES (3 COLUNAS COM GRÁFICOS) =================== */
            .timeline-boxes-container {
                width: 100%;
                margin-top: 15px;
            }
            
            .timeline-boxes-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                width: 100%;
            }
            
            .timeline-box {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                overflow: hidden;
                min-height: 400px;
                display: flex;
                flex-direction: column;
            }
            
            .timeline-box-header {
                background: rgba(96, 165, 250, 0.2);
                padding: 12px;
                text-align: center;
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #60a5fa;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .timeline-chart-container {
                height: 200px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .timeline-chart {
                max-height: 180px !important;
            }
            
            .timeline-box-content {
                padding: 12px;
                flex: 1;
                overflow-y: auto;
                max-height: 250px;
            }
            
            .timeline-item {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                border-left: 3px solid;
                transition: all 0.2s ease;
            }
            
            .timeline-item:hover {
                background: rgba(255, 255, 255, 0.07);
                transform: translateX(2px);
            }
            
            .timeline-item:last-child {
                margin-bottom: 0;
            }
            
            .timeline-item-name {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 6px;
                color: #ffffff;
            }
            
            .timeline-item-mats {
                font-size: 11px;
                color: #ffffff;
                line-height: 1.4;
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
                
                .timeline-boxes-grid {
                    gap: 12px;
                }
                
                .timeline-chart-container {
                    height: 180px;
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
                
                .timeline-boxes-grid {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                
                .timeline-box {
                    min-height: 350px;
                }
                
                .timeline-box-header {
                    font-size: 12px;
                    padding: 10px;
                }
                
                .timeline-chart-container {
                    height: 150px;
                    padding: 10px;
                }
                
                .timeline-chart {
                    max-height: 130px !important;
                }
                
                .timeline-box-content {
                    padding: 8px;
                    max-height: 180px;
                }
                
                .timeline-item {
                    padding: 8px;
                }
                
                .timeline-item-name {
                    font-size: 12px;
                }
                
                .timeline-item-mats {
                    font-size: 10px;
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
                
                .timeline-chart-container {
                    height: 120px;
                    padding: 8px;
                }
                
                .timeline-chart {
                    max-height: 100px !important;
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
                
                .timeline-chart-container {
                    height: 140px;
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
window.renderDoughnutConcessoes = renderDoughnutConcessoes;
window.renderDoughnutLinhas = renderDoughnutLinhas;

// Funções de log
function logInfo(message) {
    console.log(`🔵 [DASHBOARD HOSPITALAR V3.3.6] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD HOSPITALAR V3.3.6] ${message}`);
}

function logError(message, error) {
    console.error(`❌ [DASHBOARD HOSPITALAR V3.3.6] ${message}`, error || '');
}

console.log('🎯 Dashboard Hospitalar V3.3.6 - SEM CHARTDATALABELS!');
console.log('✅ Análise Preditiva: BARRAS HORIZONTAIS');
console.log('✅ Concessões/Linhas: GRÁFICOS DE ROSCA (SEM legenda do Chart.js)');
console.log('✅ Funciona SEM ChartDataLabels');
console.log('⚠️ Para números DENTRO dos gráficos, adicione ChartDataLabels ao HTML');
console.log('🚀 READY: Sistema V3.3.6 100% funcional!');
