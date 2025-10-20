// DASHBOARD EXECUTIVO V3.3.2 - CONSOLIDADO 5 HOSPITAIS + TABELA WHATSAPP + PDF
// Cliente: Guilherme Santoro | Dev: Alessandro Rodrigues
// Data: 20/10/2025

// Estado global para fundo branco
if (typeof window.fundoBranco === 'undefined') {
    window.fundoBranco = false;
}

// Paleta de cores Pantone para Concessoes
const CORES_CONCESSOES_EXEC = {
    'Transicao Domiciliar': '#007A53',
    'Aplicacao Med. Domiciliar': '#582C83',
    'Aspiracao': '#2E1A47',
    'Banho': '#8FD3F4',
    'Curativo': '#00BFB3',
    'Curativo PICC': '#E03C31',
    'Fisioterapia Domiciliar': '#009639',
    'Fonoaudiologia Domiciliar': '#FF671F',
    'Oxigenoterapia': '#64A70B',
    'Remocao': '#FFB81C',
    'Solicitacao Exames Dom.': '#546E7A'
};

// Paleta de cores Pantone para Linhas de Cuidado (45 cores)
const CORES_LINHAS_EXEC = {
    'Assiste': '#ED0A72',
    'APS SP': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO': '#A6192E',
    'Nexus SP Cardiologia': '#C8102E',
    'Nexus SP Gastroenterologia': '#455A64',
    'Nexus SP Geriatria': '#FF6F1D',
    'Nexus SP Pneumologia': '#E35205',
    'Nexus SP Psiquiatria': '#0072CE',
    'Nexus SP Reumatologia': '#5A0020',
    'Nexus SP Saude do Figado': '#582D40',
    'Generalista': '#5A646B',
    'Bucomaxilofacial': '#6A1B9A',
    'Cardiologia': '#C8102E',
    'Cirurgia Cardiaca': '#A6192E',
    'Cirurgia de Cabeca e Pescoco': '#582C83',
    'Cirurgia do Aparelho Digestivo': '#5C5EBE',
    'Cirurgia Geral': '#00263A',
    'Cirurgia Oncologica': '#6A1B9A',
    'Cirurgia Plastica': '#ED0A72',
    'Cirurgia Toracica': '#003C57',
    'Cirurgia Vascular': '#556F44',
    'Clinica Medica': '#5A646B',
    'Coloproctologia': '#582D40',
    'Dermatologia': '#8FD3F4',
    'Endocrinologia': '#582C83',
    'Fisiatria': '#009639',
    'Gastroenterologia': '#455A64',
    'Geriatria': '#FF6F1D',
    'Ginecologia e Obstetricia': '#ED0A72',
    'Hematologia': '#A6192E',
    'Infectologia': '#64A70B',
    'Mastologia': '#ED0A72',
    'Nefrologia': '#0072CE',
    'Neurocirurgia': '#00263A',
    'Neurologia': '#0072CE',
    'Oftalmologia': '#00AEEF',
    'Oncologia Clinica': '#6A1B9A',
    'Ortopedia': '#556F44',
    'Otorrinolaringologia': '#FF671F',
    'Pediatria': '#5A646B',
    'Pneumologia': '#E35205',
    'Psiquiatria': '#0072CE',
    'Reumatologia': '#5A0020',
    'Urologia': '#00263A'
};

// Funcao para obter cores
function getCorExataExec(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`Aviso [CORES EXEC] Item invalido: "${itemName}"`);
        return '#6b7280';
    }
    
    const paleta = tipo === 'concessao' ? CORES_CONCESSOES_EXEC : CORES_LINHAS_EXEC;
    
    // Busca exata
    let cor = paleta[itemName];
    if (cor) {
        return cor;
    }
    
    // Normalizar
    const nomeNormalizado = itemName.trim().replace(/\s+/g, ' ');
    cor = paleta[nomeNormalizado];
    if (cor) {
        return cor;
    }
    
    console.error(`Erro [CORES EXEC] Cor nao encontrada: "${itemName}"`);
    return '#6b7280';
}

// FUNCAO PARA CRIAR LEGENDAS HTML CUSTOMIZADAS
window.createCustomLegendOutsideExec = function(containerId, datasets, chartKey) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Erro [LEGENDA EXEC] Container nao encontrado: ${containerId}`);
        return;
    }
    
    // Limpar legenda anterior
    container.innerHTML = '';
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : 'rgba(255, 255, 255, 0.05)';
    
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
        
        const label = document.createElement('span');
        label.textContent = dataset.label;
        label.style.cssText = `
            color: ${corTexto};
            font-weight: 500;
            line-height: 1.2;
        `;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        
        // CLICK PARA MOSTRAR/OCULTAR
        item.addEventListener('click', () => {
            const chart = window.chartInstances && window.chartInstances[chartKey];
            
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
                    console.error(`Erro [LEGENDA EXEC] Toggle dataset ${index}:`, error);
                }
            }
        });
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            if (!dataset.hidden) {
                item.style.transform = 'translateX(2px)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
        
        container.appendChild(item);
    });
};

// FUNCAO PRINCIPAL: RENDERIZAR DASHBOARD EXECUTIVO
window.renderDashboardExecutivo = function() {
    console.log('Renderizando Dashboard Executivo V3.3.2');
    
    let container = document.getElementById('dashExecutivoContent');
    if (!container) {
        const dash2Section = document.getElementById('dash2');
        if (dash2Section) {
            container = document.createElement('div');
            container.id = 'dashExecutivoContent';
            dash2Section.appendChild(container);
        }
    }
    
    if (!container) {
        console.error('Container nao encontrado');
        return;
    }
    
    // Verificar dados
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados da API V3.3.2</h2>
                <p style="color: #9ca3af; font-size: 14px;">Conectando com Google Apps Script...</p>
            </div>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardExecutivo();
            }
        }, 3000);
        return;
    }
    
    const kpis = calcularKPIsConsolidado();
    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    container.innerHTML = `
        <div id="dashExecutivoContainer" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <div class="dashboard-header" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Dashboard Executivo - Rede Archipelago</h2>
                        <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 14px;">Consolidado de ${Object.keys(window.hospitalData).length} hospitais - ${hoje} as ${agora}</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="toggleFundoBtnExec" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer;">
                            <span id="toggleIconExec">Escuro</span>
                        </button>
                        <button id="gerarPdfBtn" style="padding: 8px 16px; background: #ef4444; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; font-weight: 600;">
                            Gerar PDF
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="kpis-grid-exec">
                <div class="kpi-card-exec">
                    <div class="kpi-label-exec">Total de Leitos</div>
                    <div class="kpi-value-exec">${kpis.total}</div>
                </div>
                <div class="kpi-card-exec">
                    <div class="kpi-label-exec">Ocupados</div>
                    <div class="kpi-value-exec" style="color: #f97316;">${kpis.ocupados}</div>
                </div>
                <div class="kpi-card-exec">
                    <div class="kpi-label-exec">Vagos</div>
                    <div class="kpi-value-exec" style="color: #22c55e;">${kpis.vagos}</div>
                </div>
                <div class="kpi-card-exec">
                    <div class="kpi-label-exec">Taxa Ocupacao</div>
                    <div class="kpi-value-exec" style="color: ${kpis.ocupacao >= 80 ? '#ef4444' : kpis.ocupacao >= 60 ? '#f97316' : '#22c55e'};">${kpis.ocupacao}%</div>
                </div>
                <div class="kpi-card-exec">
                    <div class="kpi-label-exec">Altas Hoje</div>
                    <div class="kpi-value-exec" style="color: #60a5fa;">${kpis.altas}</div>
                </div>
            </div>
            
            <div class="graficos-grid-exec">
                <div class="grafico-item-exec">
                    <div class="chart-header-exec">
                        <h4>Ocupacao por Hospital - ${hoje}</h4>
                    </div>
                    <div class="chart-container-exec">
                        <canvas id="graficoOcupacaoExec"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item-exec">
                    <div class="chart-header-exec">
                        <h4>Previsao de Alta Consolidada - ${hoje}</h4>
                    </div>
                    <div class="chart-container-exec">
                        <canvas id="graficoAltasExec"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item-exec">
                    <div class="chart-header-exec">
                        <h4>Concessoes Rede - ${hoje}</h4>
                    </div>
                    <div class="chart-container-exec">
                        <canvas id="graficoConcessoesExec"></canvas>
                    </div>
                    <div id="legendaConcessoesExec"></div>
                </div>
                
                <div class="grafico-item-exec">
                    <div class="chart-header-exec">
                        <h4>Linhas de Cuidado Rede - ${hoje}</h4>
                    </div>
                    <div class="chart-container-exec">
                        <canvas id="graficoLinhasExec"></canvas>
                    </div>
                    <div id="legendaLinhasExec"></div>
                </div>
                
                <div class="grafico-item-exec">
                    <div class="chart-header-exec">
                        <h4>Distribuicao por Regiao - ${hoje}</h4>
                    </div>
                    <div class="chart-container-exec">
                        <canvas id="graficoRegiaoExec"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item-exec">
                    <div class="chart-header-exec">
                        <h4>Distribuicao por Tipo de Leito - ${hoje}</h4>
                    </div>
                    <div class="chart-container-exec">
                        <canvas id="graficoTipoLeitoExec"></canvas>
                    </div>
                </div>
            </div>
            
            ${renderTabelaWhatsApp(kpis, hoje, agora)}
        </div>
        
        ${getExecutivoCSS()}
    `;
    
    // Event listeners
    setTimeout(() => {
        document.getElementById('toggleFundoBtnExec')?.addEventListener('click', toggleFundoExec);
        document.getElementById('gerarPdfBtn')?.addEventListener('click', gerarPDF);
        document.getElementById('copiarWhatsBtn')?.addEventListener('click', copiarParaWhatsApp);
        
        renderGraficoOcupacao();
        renderGraficoAltasExec();
        renderGraficoConcessoesExec();
        renderGraficoLinhasExec();
        renderGraficoRegiaoExec();
        renderGraficoTipoLeito();
    }, 100);
};

// Funcao para alternar fundo
function toggleFundoExec() {
    window.fundoBranco = !window.fundoBranco;
    const icon = document.getElementById('toggleIconExec');
    if (icon) {
        icon.textContent = window.fundoBranco ? 'Claro' : 'Escuro';
    }
    window.renderDashboardExecutivo();
}

// Calcular KPIs consolidado
function calcularKPIsConsolidado() {
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let altasHoje = 0;
    const TIMELINE_ALTA_HOJE = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze'];
    
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital && hospital.leitos) {
            totalLeitos += hospital.leitos.length;
            leitosOcupados += hospital.leitos.filter(l => l.status === 'ocupado').length;
            
            altasHoje += hospital.leitos.filter(l => {
                if (l.status === 'ocupado') {
                    const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
                    return prevAlta && TIMELINE_ALTA_HOJE.includes(prevAlta);
                }
                return false;
            }).length;
        }
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    
    return {
        total: totalLeitos,
        ocupados: leitosOcupados,
        vagos: leitosVagos,
        ocupacao: ocupacao,
        altas: altasHoje
    };
}

// Renderizar tabela para WhatsApp
function renderTabelaWhatsApp(kpis, hoje, agora) {
    const hospitaisData = Object.keys(window.hospitalData).map(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        const leitos = hospital.leitos || [];
        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado').length;
        const vagos = total - ocupados;
        const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
        
        return {
            nome: hospital.nome || hospitalId,
            total,
            ocupados,
            vagos,
            ocupacao
        };
    });
    
    return `
        <div class="tabela-whatsapp-container" style="margin-top: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #60a5fa; font-size: 20px; font-weight: 700;">Resumo para WhatsApp</h3>
                <button id="copiarWhatsBtn" style="padding: 10px 20px; background: #25D366; border: none; border-radius: 8px; color: white; font-size: 14px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    Copiar Mensagem
                </button>
            </div>
            
            <div id="mensagemWhatsApp" style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 20px; font-family: monospace; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">ARCHIPELAGO - ${hoje} as ${agora}

CONSOLIDADO GERAL:
Total: ${kpis.total} leitos
Ocupados: ${kpis.ocupados} (${kpis.ocupacao}%)
Vagos: ${kpis.vagos}
Altas Hoje: ${kpis.altas}

POR HOSPITAL:
${hospitaisData.map(h => `${h.nome}
- Total: ${h.total} | Ocupados: ${h.ocupados} | Vagos: ${h.vagos} (${h.ocupacao}%)`).join('\n\n')}</div>
        </div>
    `;
}

// Copiar para WhatsApp
function copiarParaWhatsApp() {
    const mensagem = document.getElementById('mensagemWhatsApp');
    if (!mensagem) return;
    
    const texto = mensagem.textContent;
    
    navigator.clipboard.writeText(texto).then(() => {
        const btn = document.getElementById('copiarWhatsBtn');
        if (btn) {
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = 'Copiado!';
            btn.style.background = '#22c55e';
            
            setTimeout(() => {
                btn.innerHTML = textoOriginal;
                btn.style.background = '#25D366';
            }, 2000);
        }
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar mensagem');
    });
}

// Gerar PDF
function gerarPDF() {
    const btn = document.getElementById('gerarPdfBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Gerando PDF...';
    }
    
    window.print();
    
    setTimeout(() => {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Gerar PDF';
        }
    }, 1000);
}

// Plugin para fundo
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

// Grafico de Ocupacao por Hospital
function renderGraficoOcupacao() {
    const canvas = document.getElementById('graficoOcupacaoExec');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'ocupacaoExec';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const labels = [];
    const ocupados = [];
    const vagos = [];
    
    Object.keys(window.hospitalData).forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            labels.push(hospital.nome || hospitalId);
            const total = hospital.leitos.length;
            const ocup = hospital.leitos.filter(l => l.status === 'ocupado').length;
            ocupados.push(ocup);
            vagos.push(total - ocup);
        }
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ocupados',
                    data: ocupados,
                    backgroundColor: '#f97316',
                    borderWidth: 0
                },
                {
                    label: 'Vagos',
                    data: vagos,
                    backgroundColor: '#22c55e',
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: corTexto,
                        font: { size: 12 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 31, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: corTexto,
                        font: { size: 11, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 5,
                        color: corTexto,
                        font: { size: 11 }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Leitos',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
}

// Grafico de Altas Consolidado
function renderGraficoAltasExec() {
    const canvas = document.getElementById('graficoAltasExec');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'altasExec';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze', '24H', '48H', '72H', '96H', 'SP'];
    const dados = categorias.map(cat => {
        let count = 0;
        Object.values(window.hospitalData).forEach(hospital => {
            if (hospital && hospital.leitos) {
                count += hospital.leitos.filter(l => {
                    if (l.status === 'ocupado') {
                        const prevAlta = l.prevAlta || (l.paciente && l.paciente.prevAlta);
                        return prevAlta === cat;
                    }
                    return false;
                }).length;
            }
        });
        return count;
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Pacientes',
                data: dados,
                backgroundColor: '#60a5fa',
                borderWidth: 0
            }]
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
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: corTexto,
                        font: { size: 11, weight: 600 },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
}

// Grafico de Concessoes Consolidado
function renderGraficoConcessoesExec() {
    const canvas = document.getElementById('graficoConcessoesExec');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'concessoesExec';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const concessoesMap = {};
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.concessoes && Array.isArray(leito.concessoes)) {
                    leito.concessoes.forEach(concessao => {
                        concessoesMap[concessao] = (concessoesMap[concessao] || 0) + 1;
                    });
                }
            });
        }
    });
    
    const labels = Object.keys(concessoesMap);
    const dados = Object.values(concessoesMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem concessoes registradas</p>';
        return;
    }
    
    const datasets = labels.map((nome, idx) => {
        const cor = getCorExataExec(nome, 'concessao');
        return {
            label: nome,
            data: [dados[idx]],
            backgroundColor: cor,
            borderWidth: 0
        };
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Concessoes'],
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
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
    
    setTimeout(() => {
        window.createCustomLegendOutsideExec('legendaConcessoesExec', datasets, chartKey);
    }, 50);
}

// Grafico de Linhas Consolidado
function renderGraficoLinhasExec() {
    const canvas = document.getElementById('graficoLinhasExec');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'linhasExec';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const linhasMap = {};
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.linhas && Array.isArray(leito.linhas)) {
                    leito.linhas.forEach(linha => {
                        linhasMap[linha] = (linhasMap[linha] || 0) + 1;
                    });
                }
            });
        }
    });
    
    const labels = Object.keys(linhasMap);
    const dados = Object.values(linhasMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem linhas de cuidado registradas</p>';
        return;
    }
    
    const datasets = labels.map((nome, idx) => {
        const cor = getCorExataExec(nome, 'linha');
        return {
            label: nome,
            data: [dados[idx]],
            backgroundColor: cor,
            borderWidth: 0
        };
    });
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Linhas de Cuidado'],
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
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
    
    setTimeout(() => {
        window.createCustomLegendOutsideExec('legendaLinhasExec', datasets, chartKey);
    }, 50);
}

// Grafico de Regiao (PIZZA)
function renderGraficoRegiaoExec() {
    const canvas = document.getElementById('graficoRegiaoExec');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'regiaoExec';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const regioesMap = {};
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado' && leito.regiao) {
                    regioesMap[leito.regiao] = (regioesMap[leito.regiao] || 0) + 1;
                }
            });
        }
    });
    
    const labels = Object.keys(regioesMap);
    const dados = Object.values(regioesMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem dados de regiao</p>';
        return;
    }
    
    const cores = [
        '#60a5fa', '#f97316', '#22c55e', '#a855f7', '#ec4899',
        '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'
    ];
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores.slice(0, labels.length),
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
                        usePointStyle: true
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
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
}

// Grafico de Tipo de Leito
function renderGraficoTipoLeito() {
    const canvas = document.getElementById('graficoTipoLeitoExec');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = 'tipoLeitoExec';
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const tiposMap = {};
    Object.values(window.hospitalData).forEach(hospital => {
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(leito => {
                if (leito.status === 'ocupado') {
                    const tipo = leito.categoriaEscolhida || leito.categoria || leito.tipo || 'Nao Informado';
                    tiposMap[tipo] = (tiposMap[tipo] || 0) + 1;
                }
            });
        }
    });
    
    const labels = Object.keys(tiposMap);
    const dados = Object.values(tiposMap);
    
    if (labels.length === 0) {
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">Sem dados de tipo de leito</p>';
        return;
    }
    
    const cores = ['#60a5fa', '#f97316', '#22c55e'];
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: dados,
                backgroundColor: cores.slice(0, labels.length),
                borderWidth: 0
            }]
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
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5,
                        color: corTexto,
                        font: { size: 11 }
                    },
                    grid: { color: corGrid },
                    title: {
                        display: true,
                        text: 'Pacientes',
                        color: corTexto,
                        font: { size: 12, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPluginExec]
    });
}

// CSS
function getExecutivoCSS() {
    return `
        <style>
            .kpis-grid-exec {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .kpi-card-exec {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .kpi-label-exec {
                font-size: 13px;
                color: #9ca3af;
                margin-bottom: 10px;
                font-weight: 500;
            }
            
            .kpi-value-exec {
                font-size: 32px;
                font-weight: 700;
                color: #ffffff;
            }
            
            .graficos-grid-exec {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 25px;
            }
            
            .grafico-item-exec {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chart-header-exec {
                margin-bottom: 15px;
            }
            
            .chart-header-exec h4 {
                margin: 0;
                color: #e2e8f0;
                font-size: 15px;
                font-weight: 600;
            }
            
            .chart-container-exec {
                position: relative;
                height: 350px;
            }
            
            @media print {
                body * {
                    visibility: hidden;
                }
                #dashExecutivoContainer, #dashExecutivoContainer * {
                    visibility: visible;
                }
                #dashExecutivoContainer {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                button {
                    display: none !important;
                }
                .tabela-whatsapp-container {
                    page-break-after: always;
                }
            }
        </style>
    `;
}

console.log('Dashboard Executivo V3.3.2 carregado com sucesso');
