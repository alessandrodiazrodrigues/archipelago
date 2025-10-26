// =================== DASHBOARD HOSPITALAR V3.2 - CORREÇÕES APLICADAS ===================
// =================== GAUGE SVG + 4 TIPOS ALTAS + 3 FORMATOS CONCESSÕES/LINHAS ===================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' },
    H2: { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' },
    H3: { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' },
    H4: { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' },
    H5: { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' }
};

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

// =================== FUNÇÃO PARA CRIAR LEGENDAS HTML CUSTOMIZADAS ===================
window.createCustomLegendOutside = function(chartId, datasets) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const chartContainer = canvas.closest('.chart-container');
    if (!chartContainer) return;
    
    const existingLegend = chartContainer.parentNode.querySelector('.custom-legend-container');
    if (existingLegend) existingLegend.remove();
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : '#1a1f2e';
    
    const legendContainer = document.createElement('div');
    legendContainer.className = 'custom-legend-container';
    legendContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 15px;
        margin-top: 5px;
        align-items: flex-start;
        background: ${fundoLegenda};
        border-radius: 8px;
        border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    `;
    
    datasets.forEach((dataset, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 2px 0;
            opacity: ${dataset.hidden ? '0.4' : '1'};
            transition: all 0.2s;
        `;
        
        const colorBox = document.createElement('span');
        const bgColor = dataset.backgroundColor || dataset.borderColor || '#666';
        colorBox.style.cssText = `
            width: 12px;
            height: 12px;
            background-color: ${bgColor};
            border-radius: 2px;
            flex-shrink: 0;
            display: inline-block;
        `;
        
        const label = document.createElement('span');
        label.textContent = dataset.label || `Dataset ${index + 1}`;
        label.style.cssText = `
            font-size: 11px;
            color: ${corTexto};
            font-weight: 500;
            line-height: 1.2;
        `;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        
        item.addEventListener('click', () => {
            const chart = Object.values(window.chartInstances || {}).find(chartInstance => 
                chartInstance && chartInstance.canvas && chartInstance.canvas.id === chartId
            );
            
            if (chart && chart.getDatasetMeta) {
                try {
                    const meta = chart.getDatasetMeta(index);
                    if (meta) {
                        const novoEstado = meta.hidden === null ? true : !meta.hidden;
                        meta.hidden = novoEstado;
                        
                        item.style.opacity = novoEstado ? '0.4' : '1';
                        colorBox.style.opacity = novoEstado ? '0.3' : '1';
                        
                        chart.update('active');
                    }
                } catch (error) {
                    console.error(`❌ [LEGENDA] Erro ao toggle dataset ${index}:`, error);
                }
            }
        });
        
        item.addEventListener('mouseenter', () => {
            if (!dataset.hidden) {
                item.style.transform = 'translateX(2px)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
        
        legendContainer.appendChild(item);
    });
    
    chartContainer.parentNode.insertBefore(legendContainer, chartContainer.nextSibling);
};

// =================== FUNÇÃO PARA ATUALIZAR TODAS AS CORES ===================
window.atualizarTodasAsCores = function() {
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : '#1a1f2e';
    
    document.querySelectorAll('.custom-legend-container').forEach(container => {
        container.style.backgroundColor = fundoLegenda;
        container.style.background = fundoLegenda;
        container.style.border = `1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`;
        
        container.querySelectorAll('span').forEach((span, index) => {
            if (index % 2 === 1) {
                span.style.color = corTexto;
            }
        });
    });
    
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

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar V3.2');
    
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
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados reais da API V3.2</h2>
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; white-space: nowrap;">Dashboard Hospitalar V3.2</h2>
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button id="toggleFundoBtn" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleIcon">🌙</span>
                        <span id="toggleText">ESCURO</span>
                    </button>
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
                const altaType = window.graficosState[hospitalId]?.altas || 'bar1';
                const concessaoType = window.graficosState[hospitalId]?.concessoes || 'rosca-hoje';
                const linhaType = window.graficosState[hospitalId]?.linhas || 'rosca-hoje';
                
                renderAltasHospital(hospitalId, altaType);
                renderConcessoesHospital(hospitalId, concessaoType, 'HOJE');
                renderLinhasHospital(hospitalId, linhaType, 'HOJE');
            });
            
            setTimeout(() => {
                if (window.chartInstances) {
                    Object.entries(window.chartInstances).forEach(([key, chart]) => {
                        if (chart && chart.config && chart.canvas) {
                            window.createCustomLegendOutside(chart.canvas.id, chart.config.data.datasets);
                        }
                    });
                }
            }, 100);
            
            logInfo(`Fundo alterado para: ${window.fundoBranco ? 'claro' : 'escuro'}`);
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            // Event listeners para ALTAS
            document.querySelectorAll('[data-hospital][data-chart="altas"][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const hospital = e.target.dataset.hospital;
                    const type = e.target.dataset.type;
                    
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (!window.graficosState[hospital]) {
                        window.graficosState[hospital] = { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' };
                    }
                    window.graficosState[hospital].altas = type;
                    
                    renderAltasHospital(hospital, type);
                    
                    logInfo(`Gráfico de Altas alterado: ${hospital} - ${type}`);
                });
            });
            
            // Event listeners para CONCESSÕES
            document.querySelectorAll('[data-hospital][data-chart="concessoes"][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const hospital = e.target.dataset.hospital;
                    const type = e.target.dataset.type;
                    
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (!window.graficosState[hospital]) {
                        window.graficosState[hospital] = { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' };
                    }
                    window.graficosState[hospital].concessoes = type;
                    
                    renderConcessoesHospital(hospital, type, 'HOJE');
                    
                    logInfo(`Gráfico de Concessões alterado: ${hospital} - ${type}`);
                });
            });
            
            // Event listeners para LINHAS
            document.querySelectorAll('[data-hospital][data-chart="linhas"][data-type]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const hospital = e.target.dataset.hospital;
                    const type = e.target.dataset.type;
                    
                    const grupo = e.target.parentElement;
                    grupo.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (!window.graficosState[hospital]) {
                        window.graficosState[hospital] = { altas: 'bar1', concessoes: 'rosca-hoje', linhas: 'rosca-hoje' };
                    }
                    window.graficosState[hospital].linhas = type;
                    
                    renderLinhasHospital(hospital, type, 'HOJE');
                    
                    logInfo(`Gráfico de Linhas alterado: ${hospital} - ${type}`);
                });
            });
            
            // Event listeners para NAVEGADOR DE PERÍODOS (Rosca Navegável)
            setTimeout(() => {
                document.querySelectorAll('.nav-periodos .nav-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const periodo = e.target.dataset.periodo;
                        const container = e.target.closest('.grafico-item');
                        const canvasId = container.querySelector('canvas').id;
                        
                        let hospitalId, tipo;
                        if (canvasId.includes('graficoConcessoes')) {
                            hospitalId = canvasId.replace('graficoConcessoes', '');
                            tipo = 'concessoes';
                        } else if (canvasId.includes('graficoLinhas')) {
                            hospitalId = canvasId.replace('graficoLinhas', '');
                            tipo = 'linhas';
                        }
                        
                        const grupo = e.target.parentElement;
                        grupo.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        
                        if (tipo === 'concessoes') {
                            renderConcessoesHospital(hospitalId, 'rosca-nav', periodo);
                        } else if (tipo === 'linhas') {
                            renderLinhasHospital(hospitalId, 'rosca-nav', periodo);
                        }
                    });
                });
            }, 500);
            
            hospitaisComDados.forEach(hospitalId => {
                renderGaugeHospital(hospitalId);
                renderAltasHospital(hospitalId, 'bar1');
                renderConcessoesHospital(hospitalId, 'rosca-hoje', 'HOJE');
                renderLinhasHospital(hospitalId, 'rosca-hoje', 'HOJE');
            });
            
            logSuccess('Dashboard Hospitalar V3.2 renderizado');
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
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="altas" data-type="bar1">Barras 1</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="altas" data-type="bar2">Barras 2</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="altas" data-type="donut">Rosca</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="altas" data-type="stacked">Plus</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${hoje}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="concessoes" data-type="rosca-hoje">Rosca HOJE</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="rosca-nav">Rosca Nav</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="concessoes" data-type="heatmap">Heatmap</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoConcessoes${hospitalId}"></canvas>
                    </div>
                    <div id="listaConcessoes${hospitalId}"></div>
                    <div id="navConcessoes${hospitalId}"></div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado em ${hoje}</h4>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-hospital="${hospitalId}" data-chart="linhas" data-type="rosca-hoje">Rosca HOJE</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="rosca-nav">Rosca Nav</button>
                            <button class="chart-btn" data-hospital="${hospitalId}" data-chart="linhas" data-type="heatmap">Heatmap</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoLinhas${hospitalId}"></canvas>
                    </div>
                    <div id="listaLinhas${hospitalId}"></div>
                    <div id="navLinhas${hospitalId}"></div>
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

// =================== GAUGE SVG CUSTOMIZADO (CORREÇÃO 1) ===================
function renderGaugeHospital(hospitalId) {
    const canvasMobile = document.getElementById(`gauge${hospitalId}`);
    const canvasDesktop = document.getElementById(`gaugeDesktop${hospitalId}`);
    
    const kpis = calcularKPIsHospital(hospitalId);
    const ocupacao = kpis.ocupacao;
    
    // ✅ CORES DINÂMICAS BASEADAS EM OCUPAÇÃO
    let cor = '#22c55e'; // Verde (0-49%)
    if (ocupacao >= 85) cor = '#ef4444'; // Vermelho (85-100%)
    else if (ocupacao >= 50) cor = '#eab308'; // Amarelo (50-84%)
    
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

// =================== ANÁLISE PREDITIVA DE ALTAS - 4 TIPOS (CORREÇÃO 2) ===================
function renderAltasHospital(hospitalId, type = 'bar1') {
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
    
    // =================== TIPO 1: BARRAS EMPILHADAS (6 CORES) ===================
    if (type === 'bar1') {
        const todosDados = [...dados['Ouro'], ...dados['2R'], ...dados['3R'], ...dados['48H'], ...dados['72H'], ...dados['96H']];
        const valorMaximo = Math.max(...todosDados, 0);
        const limiteSuperior = valorMaximo + 1;
        
        const datasets = [
            { label: 'Ouro', data: dados['Ouro'], backgroundColor: '#fbbf24', borderWidth: 0 },
            { label: '2R', data: dados['2R'], backgroundColor: '#3b82f6', borderWidth: 0 },
            { label: '3R', data: dados['3R'], backgroundColor: '#8b5cf6', borderWidth: 0 },
            { label: '48H', data: dados['48H'], backgroundColor: '#10b981', borderWidth: 0 },
            { label: '72H', data: dados['72H'], backgroundColor: '#f59e0b', borderWidth: 0 },
            { label: '96H', data: dados['96H'], backgroundColor: '#ef4444', borderWidth: 0 }
        ];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
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
                                return `${context.dataset.label}: ${context.parsed.y} beneficiários`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: corTexto,
                            font: { size: 12, weight: 600 },
                            maxRotation: 0
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        stacked: true,
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
        
        setTimeout(() => {
            window.createCustomLegendOutside(`graficoAltas${hospitalId}`, datasets);
        }, 50);
    }
    
    // =================== TIPO 2: BARRAS AZUL (HOJE E 24H SOMAM OURO+2R+3R) ===================
    else if (type === 'bar2') {
        const dadosSimplificados = [
            dados['Ouro'][0] + dados['2R'][0] + dados['3R'][0], // HOJE = soma
            dados['Ouro'][1] + dados['2R'][1] + dados['3R'][1], // 24H = soma
            dados['48H'][2],
            dados['72H'][3],
            dados['96H'][4]
        ];
        
        const valorMaximo = Math.max(...dadosSimplificados, 0);
        const limiteSuperior = valorMaximo + 1;
        
        const datasets = [{
            label: 'Previsão de Alta',
            data: dadosSimplificados,
            backgroundColor: '#0055A4',
            borderWidth: 0
        }];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
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
    }
    
    // =================== TIPO 3: ROSCA (6 CORES, HOJE E 24H SOMAM) ===================
    else if (type === 'donut') {
        const dadosRosca = [
            dados['Ouro'][0] + dados['2R'][0] + dados['3R'][0], // HOJE
            dados['Ouro'][1] + dados['2R'][1] + dados['3R'][1], // 24H
            dados['48H'][2],
            dados['72H'][3],
            dados['96H'][4]
        ];
        
        const labels = ['HOJE', '24H', '48H', '72H', '96H'];
        const cores = ['#fbbf24', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        
        const datasets = [{
            data: dadosRosca,
            backgroundColor: cores,
            borderWidth: 2,
            borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
        }];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const porcentagem = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${porcentagem}%)`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value) => {
                            return value > 0 ? value : '';
                        }
                    }
                }
            },
            plugins: [backgroundPlugin, ChartDataLabels]
        });
        
        setTimeout(() => {
            const legendDatasets = labels.map((label, index) => ({
                label: label,
                backgroundColor: cores[index],
                data: [dadosRosca[index]]
            }));
            window.createCustomLegendOutside(`graficoAltas${hospitalId}`, legendDatasets);
        }, 50);
    }
    
    // =================== TIPO 4: STACKED PLUS (BARRAS COM SUBDIVISÃO) ===================
    else if (type === 'stacked') {
        const datasets = [
            { label: 'Ouro', data: dados['Ouro'], backgroundColor: '#fbbf24', borderWidth: 0, stack: 'Stack 0' },
            { label: '2R', data: dados['2R'], backgroundColor: '#3b82f6', borderWidth: 0, stack: 'Stack 0' },
            { label: '3R', data: dados['3R'], backgroundColor: '#8b5cf6', borderWidth: 0, stack: 'Stack 0' },
            { label: '48H', data: dados['48H'], backgroundColor: '#10b981', borderWidth: 0, stack: 'Stack 1' },
            { label: '72H', data: dados['72H'], backgroundColor: '#f59e0b', borderWidth: 0, stack: 'Stack 2' },
            { label: '96H', data: dados['96H'], backgroundColor: '#ef4444', borderWidth: 0, stack: 'Stack 3' }
        ];
        
        const todosDados = [...dados['Ouro'], ...dados['2R'], ...dados['3R'], ...dados['48H'], ...dados['72H'], ...dados['96H']];
        const valorMaximo = Math.max(...todosDados, 0);
        const limiteSuperior = valorMaximo + 2;
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                barPercentage: 0.7,
                categoryPercentage: 0.85,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} beneficiários`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: corTexto,
                            font: { size: 12, weight: 600 },
                            maxRotation: 0
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        stacked: true,
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
        
        setTimeout(() => {
            window.createCustomLegendOutside(`graficoAltas${hospitalId}`, datasets);
        }, 50);
    }
}

// =================== CONCESSÕES - 3 FORMATOS (CORREÇÃO 3) ===================
function renderConcessoesHospital(hospitalId, type = 'rosca-hoje', periodo = 'HOJE') {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `concessoes${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const concessoesPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula);
            
            if (concessoes && prevAlta) {
                const concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
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
                            if (!concessoesPorTimeline[nome]) {
                                concessoesPorTimeline[nome] = {
                                    dados: [0, 0, 0, 0, 0],
                                    matriculas: { 'HOJE': [], '24H': [], '48H': [], '72H': [], '96H': [] }
                                };
                            }
                            concessoesPorTimeline[nome].dados[timelineIndex]++;
                            concessoesPorTimeline[nome].matriculas[categorias[timelineIndex]].push(matricula || 'S/N');
                        }
                    });
                }
            }
        }
    });
    
    const concessoesOrdenadas = Object.entries(concessoesPorTimeline)
        .map(([nome, obj]) => [nome, obj.dados, obj.dados.reduce((a, b) => a + b, 0), obj.matriculas])
        .sort((a, b) => b[2] - a[2])
        .slice(0, 6);
    
    if (concessoesOrdenadas.length === 0) return;
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const ctx = canvas.getContext('2d');
    
    // =================== TIPO 1: ROSCA HOJE COM LISTA ===================
    if (type === 'rosca-hoje') {
        const dadosHoje = concessoesOrdenadas.map(([nome, dados]) => dados[0]);
        const labels = concessoesOrdenadas.map(([nome]) => nome);
        const cores = labels.map(label => getCorExata(label, 'concessao'));
        const matriculas = concessoesOrdenadas.map(([nome, dados, total, mats]) => mats['HOJE']);
        
        const datasets = [{
            data: dadosHoje,
            backgroundColor: cores,
            borderWidth: 2,
            borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
        }];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value) => {
                            return value > 0 ? value : '';
                        }
                    }
                }
            },
            plugins: [backgroundPlugin, ChartDataLabels]
        });
        
        setTimeout(() => {
            const legendDatasets = labels.map((label, index) => ({
                label: label,
                backgroundColor: cores[index],
                data: [dadosHoje[index]]
            }));
            window.createCustomLegendOutside(`graficoConcessoes${hospitalId}`, legendDatasets);
        }, 50);
        
        // LISTA DE CONCESSÕES COM MATRÍCULAS
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
        
        const navDiv = document.getElementById(`navConcessoes${hospitalId}`);
        if (navDiv) navDiv.innerHTML = '';
    }
    
    // =================== TIPO 2: ROSCA NAVEGÁVEL ===================
    else if (type === 'rosca-nav') {
        const periodoIndex = categorias.indexOf(periodo);
        
        const dadosPeriodo = concessoesOrdenadas.map(([nome, dados]) => dados[periodoIndex]);
        const labels = concessoesOrdenadas.map(([nome]) => nome);
        const cores = labels.map(label => getCorExata(label, 'concessao'));
        
        const datasets = [{
            data: dadosPeriodo,
            backgroundColor: cores,
            borderWidth: 2,
            borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
        }];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value) => {
                            return value > 0 ? value : '';
                        }
                    }
                }
            },
            plugins: [backgroundPlugin, ChartDataLabels]
        });
        
        setTimeout(() => {
            const legendDatasets = labels.map((label, index) => ({
                label: label,
                backgroundColor: cores[index],
                data: [dadosPeriodo[index]]
            }));
            window.createCustomLegendOutside(`graficoConcessoes${hospitalId}`, legendDatasets);
        }, 50);
        
        // NAVEGADOR DE PERÍODOS
        const navDiv = document.getElementById(`navConcessoes${hospitalId}`);
        if (navDiv) {
            let navHtml = '<div class="nav-periodos">';
            categorias.forEach(cat => {
                const active = cat === periodo ? 'active' : '';
                navHtml += `<button class="nav-btn ${active}" data-periodo="${cat}">${cat}</button>`;
            });
            navHtml += '</div>';
            navDiv.innerHTML = navHtml;
        }
        
        const listaDiv = document.getElementById(`listaConcessoes${hospitalId}`);
        if (listaDiv) listaDiv.innerHTML = '';
    }
    
    // =================== TIPO 3: HEATMAP ===================
    else if (type === 'heatmap') {
        renderHeatmapConcessoes(hospitalId, concessoesOrdenadas);
        
        const listaDiv = document.getElementById(`listaConcessoes${hospitalId}`);
        if (listaDiv) listaDiv.innerHTML = '';
        
        const navDiv = document.getElementById(`navConcessoes${hospitalId}`);
        if (navDiv) navDiv.innerHTML = '';
    }
}

function renderHeatmapConcessoes(hospitalId, concessoesOrdenadas) {
    const container = document.getElementById(`graficoConcessoes${hospitalId}`).closest('.chart-container');
    if (!container) return;
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    const corTexto = window.fundoBranco ? '#000' : '#fff';
    
    // Função para cor do heatmap baseado em valor
    function getHeatmapColor(value) {
        if (value === 0) return '#E5E5E5';
        if (value <= 2) return '#E5E5E5';
        if (value <= 4) return '#C6A664';
        if (value <= 6) return '#0055A4';
        return '#003366';
    }
    
    let heatmapHtml = `
        <table class="heatmap-table" style="width: 100%; border-collapse: collapse; font-size: 11px; color: ${corTexto};">
            <thead>
                <tr style="background: rgba(255,255,255,0.05);">
                    <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Concessão</th>
                    ${categorias.map(cat => `<th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">${cat}</th>`).join('')}
                    <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">Total</th>
                </tr>
            </thead>
            <tbody>
                ${concessoesOrdenadas.map(([nome, dados, total]) => {
                    return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${nome}</td>
                            ${dados.map(valor => {
                                const cor = getHeatmapColor(valor);
                                const textColor = valor > 4 ? '#fff' : '#000';
                                return `<td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1); background: ${cor}; color: ${textColor}; font-weight: 700;">${valor}</td>`;
                            }).join('')}
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1); font-weight: 700; background: rgba(96,165,250,0.2);">${total}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        
        <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 10px;">
            <strong style="color: ${corTexto};">Escala:</strong>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #E5E5E5; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">1-2</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #C6A664; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">3-4</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #0055A4; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">5-6</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #003366; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">7+</span>
            </div>
        </div>
    `;
    
    container.innerHTML = heatmapHtml;
}

// =================== LINHAS DE CUIDADO - 3 FORMATOS (CORREÇÃO 4) ===================
function renderLinhasHospital(hospitalId, type = 'rosca-hoje', periodo = 'HOJE') {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `linhas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    
    const linhasPorTimeline = {};
    
    hospital.leitos.forEach(leito => {
        if (leito.status === 'ocupado') {
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || (leito.paciente && leito.paciente.matricula);
            
            if (linhas && prevAlta) {
                const linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
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
                            if (!linhasPorTimeline[nome]) {
                                linhasPorTimeline[nome] = {
                                    dados: [0, 0, 0, 0, 0],
                                    matriculas: { 'HOJE': [], '24H': [], '48H': [], '72H': [], '96H': [] }
                                };
                            }
                            linhasPorTimeline[nome].dados[timelineIndex]++;
                            linhasPorTimeline[nome].matriculas[categorias[timelineIndex]].push(matricula || 'S/N');
                        }
                    });
                }
            }
        }
    });
    
    const linhasOrdenadas = Object.entries(linhasPorTimeline)
        .map(([nome, obj]) => [nome, obj.dados, obj.dados.reduce((a, b) => a + b, 0), obj.matriculas])
        .sort((a, b) => b[2] - a[2])
        .slice(0, 6);
    
    if (linhasOrdenadas.length === 0) return;
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const ctx = canvas.getContext('2d');
    
    // =================== TIPO 1: ROSCA HOJE COM LISTA ===================
    if (type === 'rosca-hoje') {
        const dadosHoje = linhasOrdenadas.map(([nome, dados]) => dados[0]);
        const labels = linhasOrdenadas.map(([nome]) => nome);
        const cores = labels.map(label => getCorExata(label, 'linha'));
        const matriculas = linhasOrdenadas.map(([nome, dados, total, mats]) => mats['HOJE']);
        
        const datasets = [{
            data: dadosHoje,
            backgroundColor: cores,
            borderWidth: 2,
            borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
        }];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value) => {
                            return value > 0 ? value : '';
                        }
                    }
                }
            },
            plugins: [backgroundPlugin, ChartDataLabels]
        });
        
        setTimeout(() => {
            const legendDatasets = labels.map((label, index) => ({
                label: label,
                backgroundColor: cores[index],
                data: [dadosHoje[index]]
            }));
            window.createCustomLegendOutside(`graficoLinhas${hospitalId}`, legendDatasets);
        }, 50);
        
        // LISTA DE LINHAS COM MATRÍCULAS
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
        
        const navDiv = document.getElementById(`navLinhas${hospitalId}`);
        if (navDiv) navDiv.innerHTML = '';
    }
    
    // =================== TIPO 2: ROSCA NAVEGÁVEL ===================
    else if (type === 'rosca-nav') {
        const periodoIndex = categorias.indexOf(periodo);
        
        const dadosPeriodo = linhasOrdenadas.map(([nome, dados]) => dados[periodoIndex]);
        const labels = linhasOrdenadas.map(([nome]) => nome);
        const cores = labels.map(label => getCorExata(label, 'linha'));
        
        const datasets = [{
            data: dadosPeriodo,
            backgroundColor: cores,
            borderWidth: 2,
            borderColor: window.fundoBranco ? '#ffffff' : '#1a1f2e'
        }];
        
        window.chartInstances[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { size: 14, weight: 'bold' },
                        formatter: (value) => {
                            return value > 0 ? value : '';
                        }
                    }
                }
            },
            plugins: [backgroundPlugin, ChartDataLabels]
        });
        
        setTimeout(() => {
            const legendDatasets = labels.map((label, index) => ({
                label: label,
                backgroundColor: cores[index],
                data: [dadosPeriodo[index]]
            }));
            window.createCustomLegendOutside(`graficoLinhas${hospitalId}`, legendDatasets);
        }, 50);
        
        // NAVEGADOR DE PERÍODOS
        const navDiv = document.getElementById(`navLinhas${hospitalId}`);
        if (navDiv) {
            let navHtml = '<div class="nav-periodos">';
            categorias.forEach(cat => {
                const active = cat === periodo ? 'active' : '';
                navHtml += `<button class="nav-btn ${active}" data-periodo="${cat}">${cat}</button>`;
            });
            navHtml += '</div>';
            navDiv.innerHTML = navHtml;
        }
        
        const listaDiv = document.getElementById(`listaLinhas${hospitalId}`);
        if (listaDiv) listaDiv.innerHTML = '';
    }
    
    // =================== TIPO 3: HEATMAP ===================
    else if (type === 'heatmap') {
        renderHeatmapLinhas(hospitalId, linhasOrdenadas);
        
        const listaDiv = document.getElementById(`listaLinhas${hospitalId}`);
        if (listaDiv) listaDiv.innerHTML = '';
        
        const navDiv = document.getElementById(`navLinhas${hospitalId}`);
        if (navDiv) navDiv.innerHTML = '';
    }
}

function renderHeatmapLinhas(hospitalId, linhasOrdenadas) {
    const container = document.getElementById(`graficoLinhas${hospitalId}`).closest('.chart-container');
    if (!container) return;
    
    const categorias = ['HOJE', '24H', '48H', '72H', '96H'];
    const corTexto = window.fundoBranco ? '#000' : '#fff';
    
    function getHeatmapColor(value) {
        if (value === 0) return '#E5E5E5';
        if (value <= 2) return '#E5E5E5';
        if (value <= 4) return '#C6A664';
        if (value <= 6) return '#0055A4';
        return '#003366';
    }
    
    let heatmapHtml = `
        <table class="heatmap-table" style="width: 100%; border-collapse: collapse; font-size: 11px; color: ${corTexto};">
            <thead>
                <tr style="background: rgba(255,255,255,0.05);">
                    <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">Linha de Cuidado</th>
                    ${categorias.map(cat => `<th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">${cat}</th>`).join('')}
                    <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">Total</th>
                </tr>
            </thead>
            <tbody>
                ${linhasOrdenadas.map(([nome, dados, total]) => {
                    return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${nome}</td>
                            ${dados.map(valor => {
                                const cor = getHeatmapColor(valor);
                                const textColor = valor > 4 ? '#fff' : '#000';
                                return `<td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1); background: ${cor}; color: ${textColor}; font-weight: 700;">${valor}</td>`;
                            }).join('')}
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.1); font-weight: 700; background: rgba(96,165,250,0.2);">${total}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        
        <div style="display: flex; align-items: center; gap: 15px; margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 10px;">
            <strong style="color: ${corTexto};">Escala:</strong>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #E5E5E5; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">1-2</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #C6A664; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">3-4</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #0055A4; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">5-6</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 15px; background: #003366; border-radius: 3px;"></div>
                <span style="color: ${corTexto};">7+</span>
            </div>
        </div>
    `;
    
    container.innerHTML = heatmapHtml;
}

// Função de força de atualização
window.forceDataRefresh = function() {
    logInfo('Forçando atualização dos dados hospitalares V3.2...');
    
    const container = document.getElementById('dashHospitalarContent');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    Recarregando dados reais da API V3.2...
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
            
            .chart-controls {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .chart-btn {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #e2e8f0;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
            }
            
            .chart-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #60a5fa;
            }
            
            .chart-btn.active {
                background: #60a5fa;
                border-color: #60a5fa;
                color: white;
                box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
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
            
            .nav-periodos {
                display: flex;
                gap: 6px;
                margin-top: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                justify-content: center;
            }
            
            .nav-btn {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #e2e8f0;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
            }
            
            .nav-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #60a5fa;
            }
            
            .nav-btn.active {
                background: #60a5fa;
                border-color: #60a5fa;
                color: white;
                box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
            }
            
            .heatmap-table {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .heatmap-table th,
            .heatmap-table td {
                padding: 10px !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            
            .heatmap-table th {
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
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
                
                .chart-controls {
                    justify-content: flex-start !important;
                    width: 100% !important;
                    gap: 4px !important;
                }
                
                .chart-btn {
                    padding: 3px 6px !important;
                    font-size: 8px !important;
                    border-radius: 3px !important;
                }
                
                .hospital-title {
                    font-size: 14px !important;
                    margin-bottom: 12px !important;
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
                
                .chart-btn {
                    padding: 2px 4px !important;
                    font-size: 7px !important;
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
    console.log(`🔵 [DASHBOARD HOSPITALAR V3.2] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD HOSPITALAR V3.2] ${message}`);
}

function logError(message, error) {
    console.error(`❌ [DASHBOARD HOSPITALAR V3.2] ${message}`, error || '');
}

console.log('🎯 Dashboard Hospitalar V3.2 - TODAS AS CORREÇÕES APLICADAS!');
console.log('✅ CORREÇÃO 1: Gauge SVG com percentual dentro e 3 cores');
console.log('✅ CORREÇÃO 2: Análise de Altas com 4 tipos de gráfico');
console.log('✅ CORREÇÃO 3: Concessões com 3 formatos (Rosca HOJE, Rosca Nav, Heatmap)');
console.log('✅ CORREÇÃO 4: Linhas com 3 formatos (Rosca HOJE, Rosca Nav, Heatmap)');
console.log('🚀 READY: Sistema completo V3.2 funcional!');
