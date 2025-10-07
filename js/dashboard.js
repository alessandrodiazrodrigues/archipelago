// =================== DASHBOARD.JS V4.0 - VERSÃO CORRIGIDA ===================
// Remove a renderização do dashboard hospitalar para usar o arquivo dashboard-hospital.js

// =================== CONFIGURAÇÃO GLOBAL ===================
window.chartInstances = window.chartInstances || {};

// =================== DASHBOARD EXECUTIVO V4.0 ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo V4.0 com arrays diretos...');
    
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
        logError('Container dashExecutivoContent não encontrado');
        return;
    }
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <div style="color: #60a5fa; font-size: 18px; margin-bottom: 15px;">
                    🔄 Carregando dados V4.0 do sistema...
                </div>
                <div style="color: #9ca3af; font-size: 14px;">
                    Aguarde enquanto sincronizamos com a API V4.0 (arrays diretos)
                </div>
            </div>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardExecutivo();
            }
        }, 2000);
        return;
    }
    
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => 
            l.status === 'ocupado' && l.paciente && l.paciente.nome && l.paciente.matricula
        );
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <h2 style="color: #1a1f2e; margin-bottom: 20px;">🏥 Rede Hospitalar Externa V4.0</h2>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #6c757d; margin-bottom: 15px;">📋 Aguardando Dados da Planilha V4.0</h3>
                    <p style="margin-bottom: 10px;">Nenhum hospital possui dados de pacientes na planilha Google (44 colunas).</p>
                    <p><strong>Hospitais configurados:</strong> ${Object.values(CONFIG.HOSPITAIS).map(h => h.nome).join(', ')}</p>
                    <p style="color: #28a745; margin-top: 15px;"><em>✅ API V4.0 conectada - Arrays diretos funcionando</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    // Calcular KPIs
    let totalLeitos = 0;
    let leitosOcupados = 0;
    let leitosEmAlta = 0;
    let ppsTotal = 0;
    let ppsCont = 0;
    let spictElegiveis = 0;
    let spictTotal = 0;
    
    const TIMELINE_ALTA = ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R', '24h Ouro', '24h 2R', '24h 3R'];
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        totalLeitos += hospital.leitos.length;
        hospital.leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.paciente) {
                leitosOcupados++;
                
                if (leito.paciente.prevAlta && TIMELINE_ALTA.includes(leito.paciente.prevAlta)) {
                    leitosEmAlta++;
                }
                
                if (leito.paciente.pps) {
                    const ppsNum = parseInt(leito.paciente.pps);
                    if (!isNaN(ppsNum)) {
                        ppsTotal += ppsNum;
                        ppsCont++;
                    }
                }
                
                if (leito.paciente.spict === 'elegivel') {
                    spictElegiveis++;
                }
                spictTotal++;
            }
        });
    });
    
    const leitosVagos = totalLeitos - leitosOcupados;
    const ocupacaoGeral = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
    const ppsMedia = ppsCont > 0 ? Math.round(ppsTotal / ppsCont) : 0;
    const spictPerc = spictTotal > 0 ? Math.round((spictElegiveis / spictTotal) * 100) : 0;
    const tph = leitosOcupados > 0 ? (leitosEmAlta / leitosOcupados * 100).toFixed(1) : "0.0";
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                🏥 Rede Hospitalar Externa V4.0
            </h2>
            
            <div style="background: #e6f3ff; border: 2px solid #0066cc; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <p style="margin: 0; color: #0066cc; font-weight: 600;">
                    📊 <strong>Dados V4.0 da planilha Google (44 colunas)</strong> • ${hospitaisComDados.length} hospitais ativos • ${leitosOcupados} pacientes • Arrays diretos
                </p>
            </div>
            
            <!-- KPIs Grid com Gauge Principal V4.0 -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; grid-template-rows: auto auto; gap: 16px; margin-bottom: 30px;">
                <div style="grid-column: 1; grid-row: 1 / 3; background: #1a1f2e; color: white; padding: 20px; border-radius: 12px; display: flex; align-items: center;">
                    <div style="flex: 1;">
                        <div style="width: 200px; height: 100px; position: relative; margin: 0 auto;">
                            <canvas id="gaugeOcupacaoExecutivo" width="200" height="100"></canvas>
                            <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); font-size: 24px; font-weight: 700; color: #60a5fa;">${ocupacaoGeral}%</div>
                            <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); font-size: 10px; text-transform: uppercase; color: #e2e8f0; font-weight: 600;">OCUPAÇÃO GERAL</div>
                        </div>
                    </div>
                    <div style="flex: 1; padding-left: 20px;">
                        <h4 style="color: #60a5fa; margin-bottom: 12px; font-size: 14px;">Hospitais V4.0:</h4>
                        ${hospitaisComDados.map(hospitalId => {
                            const hospital = window.hospitalData[hospitalId];
                            const ocupados = hospital.leitos.filter(l => l.status === 'ocupado').length;
                            const perc = hospital.leitos.length > 0 ? Math.round((ocupados / hospital.leitos.length) * 100) : 0;
                            return `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
                                    <span style="color: #e2e8f0;">${CONFIG.HOSPITAIS[hospitalId].nome}</span>
                                    <span style="color: #60a5fa; font-weight: 700;">${perc}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- KPIs linha 1 -->
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${hospitaisComDados.length}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">HOSPITAIS ATIVOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${totalLeitos}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TOTAL DE LEITOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${leitosOcupados}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS OCUPADOS</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${leitosVagos}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS VAGOS</div>
                </div>
                
                <!-- KPIs linha 2 -->
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${leitosEmAlta}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">LEITOS EM ALTA</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${tph}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">TPH</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${ppsMedia}</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">PPS MÉDIO</div>
                </div>
                <div style="background: #1a1f2e; color: white; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa;">${spictPerc}%</div>
                    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #e2e8f0;">SPICT ELEGÍVEL</div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        // Renderizar gauge e outros gráficos do executivo
        renderGaugeExecutivo(ocupacaoGeral);
        logSuccess('Dashboard Executivo V4.0 renderizado');
    }, 100);
};

// =================== FUNÇÕES AUXILIARES ===================

// Renderizar Gauge Executivo
function renderGaugeExecutivo(ocupacao) {
    const canvas = document.getElementById('gaugeOcupacaoExecutivo');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (window.chartInstances && window.chartInstances.gaugeExecutivo) {
        window.chartInstances.gaugeExecutivo.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    window.chartInstances.gaugeExecutivo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [ocupacao, 100 - ocupacao],
                backgroundColor: [
                    ocupacao >= 80 ? '#ef4444' : ocupacao >= 60 ? '#f59e0b' : '#3b82f6',
                    'rgba(255, 255, 255, 0.1)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: Math.PI,
            rotation: Math.PI,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// =================== SISTEMA DE LOGS ===================
function logInfo(message) {
    console.log(`🔷 [DASHBOARD V4.0] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD V4.0] ${message}`);
}

function logError(message) {
    console.error(`❌ [DASHBOARD V4.0] ${message}`);
}

// =================== NAVEGAÇÃO ===================
// IMPORTANTE: Não redefinir renderDashboardHospitalar aqui
// O dashboard-hospital.js cuida disso

console.log('🚀 Dashboard.js V4.0 CORRIGIDO - Usando dashboard-hospital.js separado');
