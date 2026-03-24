// =================== MAIN.JS - CONTROLADOR PRINCIPAL V7.0 ===================
// Sistema Archipelago Dashboard
// Versao: 7.0 - Dezembro/2025
// Alteracoes V7.0:
// - Sistema de Reservas integrado
// - Suporte a Dashboard UTI
// - Nomenclatura atualizada (Enfermarias, Mapa de Leitos)
// - Carregamento de reservas no init
// - 356 leitos (293 enfermaria + 63 UTI)

// =================== INICIALIZACAO GLOBAL ===================
document.addEventListener('DOMContentLoaded', function() {
    logInfo('Archipelago Dashboard V7.0 - Inicializando...');
    
    // REDUZIDO: de 200ms para 100ms
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            logSuccess('Todos os modulos carregados, inicializando sistema...');
            window.initApp();
        } else {
            logError('initApp nao encontrada - tentando inicializacao manual');
            setTimeout(() => {
                tryManualInit();
            }, 500); // REDUZIDO: de 1000ms para 500ms
        }
    }, 100);
});

// =================== INICIALIZACAO MANUAL (FALLBACK MELHORADO) ===================
function tryManualInit() {
    logInfo('Tentando inicializacao manual...');
    
    const criticalFunctions = [
        'authenticate', 'logInfo', 'logSuccess', 'logError',
        'loadHospitalData', 'renderCards', 'CONFIG',
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'renderChartByType', 'showLoading', 'hideLoading',
        'carregarReservas' // V7.0: Funcao de reservas
    ];
    
    const missing = criticalFunctions.filter(fn => typeof window[fn] === 'undefined');
    
    if (missing.length > 0) {
        logError('Funcoes criticas nao encontradas:', missing);
        showInitError(missing);
        return;
    }
    
    logSuccess('Inicializacao manual bem-sucedida');
    window.initApp();
}

// =================== MOSTRAR ERRO DE INICIALIZACAO ===================
function showInitError(missingFunctions) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 16px; max-width: 600px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="font-size: 64px; margin-bottom: 20px;">!</div>
                <h1 style="color: #ef4444; margin-bottom: 20px; font-size: 24px; font-weight: 700;">Erro de Carregamento do Sistema</h1>
                <p style="margin-bottom: 20px; color: rgba(255, 255, 255, 0.8);">Algumas funcoes criticas nao foram carregadas corretamente:</p>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <ul style="text-align: left; color: #fbbf24; margin: 0; padding: 0; list-style: none;">
                        ${missingFunctions.map(fn => `<li style="margin: 4px 0;">- ${fn}</li>`).join('')}
                    </ul>
                </div>
                <div style="display: flex; gap: 16px; justify-content: center; margin-top: 30px;">
                    <button onclick="location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">
                        Recarregar Pagina
                    </button>
                    <button onclick="tryForceInit()" style="padding: 12px 24px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">
                        Tentar Novamente
                    </button>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                    Sistema: Archipelago Dashboard V7.0<br>
                    Versao: Dezembro/2025
                </div>
            </div>
        </div>
    `;
}

// =================== FORCAR INICIALIZACAO ===================
window.tryForceInit = function() {
    logInfo('Tentando forcar inicializacao...');
    
    if (typeof window.logInfo === 'undefined') {
        window.logInfo = (msg) => console.log(`[INFO] ${msg}`);
        window.logSuccess = (msg) => console.log(`[SUCCESS] ${msg}`);
        window.logError = (msg) => console.error(`[ERROR] ${msg}`);
    }
    
    if (typeof window.showLoading === 'undefined') {
        window.showLoading = (container, message) => {
            console.log(`Loading: ${message}`);
        };
        window.hideLoading = () => {
            console.log('Loading removido');
        };
    }
    
    // REDUZIDO: de 1000ms para 500ms
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            window.initApp();
        } else {
            location.reload();
        }
    }, 500);
};

// =================== FUNCOES DE UTILIDADE ===================
window.formatarData = function(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
};

window.formatarHora = function(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

window.calcularIdade = function(dataNascimento) {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade;
};

// =================== GERENCIAMENTO DE ESTADO ===================
window.getSystemState = function() {
    return {
        authenticated: window.isAuthenticated || false,
        currentView: window.currentView || 'leitos',
        currentHospital: window.currentHospital || 'H1',
        hospitalsData: window.hospitalData || {},
        reservasData: window.reservasData || [], // V7.0: Estado das reservas
        apiConnected: typeof window.API_URL !== 'undefined',
        chartsLoaded: typeof Chart !== 'undefined',
        loadingActive: window.isLoading || false,
        timestamp: new Date().toISOString()
    };
};

window.saveSystemState = function() {
    try {
        const state = window.getSystemState();
        localStorage.setItem('archipelago_state', JSON.stringify(state));
        logInfo('Estado do sistema salvo');
    } catch (error) {
        logError('Erro ao salvar estado do sistema', error);
    }
};

window.loadSystemState = function() {
    try {
        const savedState = localStorage.getItem('archipelago_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            if (state.currentView) {
                window.currentView = state.currentView;
            }
            if (state.currentHospital) {
                window.currentHospital = state.currentHospital;
            }
            
            logInfo('Estado do sistema carregado');
            return state;
        }
    } catch (error) {
        logError('Erro ao carregar estado do sistema', error);
    }
    return null;
};

// =================== V7.0: CARREGAMENTO DE RESERVAS ===================
window.carregarReservas = async function() {
    try {
        // V7.0: Se reservas ja foram carregadas pelo api.js, nao sobrescrever
        if (window.reservasData && window.reservasData.length > 0) {
            logSuccess('Reservas ja carregadas pelo api.js: ' + window.reservasData.length);
            return window.reservasData;
        }
        
        logInfo('Carregando reservas...');
        
        if (!window.API_URL) {
            logError('API_URL nao definida');
            window.reservasData = [];
            return [];
        }
        
        const url = window.API_URL + '?action=reservas&callback=?';
        
        // Tentar fetch direto primeiro
        try {
            const response = await fetch(window.API_URL + '?action=reservas');
            if (response.ok) {
                const data = await response.json();
                if (data.ok && data.reservas) {
                    window.reservasData = data.reservas || [];
                    logSuccess('Reservas carregadas: ' + window.reservasData.length);
                    return window.reservasData;
                }
            }
        } catch (fetchError) {
            // Se fetch falhar, tentar JSONP
            logInfo('Tentando JSONP para reservas...');
        }
        
        // Fallback JSONP
        return new Promise((resolve, reject) => {
            const callbackName = 'reservasCallback_' + Date.now();
            
            window[callbackName] = function(data) {
                window.reservasData = data.reservas || [];
                logSuccess('Reservas carregadas via JSONP: ' + window.reservasData.length);
                delete window[callbackName];
                resolve(window.reservasData);
            };
            
            const script = document.createElement('script');
            script.src = window.API_URL + '?action=reservas&callback=' + callbackName;
            script.onerror = function() {
                logError('Erro ao carregar reservas via JSONP');
                window.reservasData = [];
                delete window[callbackName];
                resolve([]);
            };
            
            document.head.appendChild(script);
            
            // Timeout de 10 segundos
            setTimeout(() => {
                if (window[callbackName]) {
                    logError('Timeout ao carregar reservas');
                    window.reservasData = [];
                    delete window[callbackName];
                    resolve([]);
                }
            }, 10000);
        });
        
    } catch (error) {
        logError('Erro ao carregar reservas:', error);
        window.reservasData = [];
        return [];
    }
};

// =================== V7.0: REFRESH APOS ACAO DE RESERVA ===================
window.refreshAfterAction = async function() {
    try {
        logInfo('Atualizando dados apos acao...');
        
        // Recarregar dados dos hospitais
        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        
        // Recarregar reservas
        await window.carregarReservas();
        
        // Re-renderizar view atual
        if (window.currentView === 'leitos' && window.renderCards) {
            window.renderCards(window.currentHospital);
        } else if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (window.currentView === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        } else if (window.currentView === 'uti' && window.renderDashboardUTI) {
            window.renderDashboardUTI();
        } else if (window.currentView === 'leitosUTI' && window.renderCardsUTI) { // V7.0: Mapa UTI
            window.renderCardsUTI(window.currentHospitalUTI || 'H2');
        }
        
        logSuccess('Dados atualizados com sucesso');
    } catch (error) {
        logError('Erro ao atualizar dados:', error);
    }
};

// =================== TRATAMENTO DE ERROS GLOBAIS ===================
window.addEventListener('error', function(event) {
    if (typeof window.logError === 'function') {
        logError('Erro JavaScript:', event.error);
    } else {
        console.error('Erro JavaScript:', event.error);
    }
    
    if (event.error && event.error.stack) {
        console.group('Detalhes do Erro:');
        console.error('Mensagem:', event.error.message);
        console.error('Arquivo:', event.filename);
        console.error('Linha:', event.lineno);
        console.error('Stack:', event.error.stack);
        console.groupEnd();
    }
    
    if (event.error && event.error.message) {
        const errorMsg = event.error.message.toLowerCase();
        if (errorMsg.includes('chart') || errorMsg.includes('canvas')) {
            setTimeout(() => {
                garantirChartJS().then(() => {
                    logSuccess('Chart.js recarregado apos erro');
                });
            }, 500); // REDUZIDO: de 1000ms para 500ms
        }
    }
});

window.addEventListener('unhandledrejection', function(event) {
    if (typeof window.logError === 'function') {
        logError('Promise rejeitada:', event.reason);
    } else {
        console.error('Promise rejeitada:', event.reason);
    }
    event.preventDefault();
});

// =================== RESPONSIVIDADE ===================
window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        
        if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.classList.remove('menu-open');
        }
    }
    
    if (window.chartInstances && Object.keys(window.chartInstances).length > 0) {
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            Object.values(window.chartInstances).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    try {
                        chart.resize();
                    } catch (error) {
                        console.warn('Erro ao redimensionar grafico:', error);
                    }
                }
            });
        }, 300);
    }
});

// =================== ATALHOS DE TECLADO ===================
document.addEventListener('keydown', function(event) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        return;
    }
    
    if (event.altKey && !event.ctrlKey && !event.shiftKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('leitos');
                break;
            case '2':
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('dash1');
                break;
            case '3':
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('dash2');
                break;
            case '4': // V7.0: Atalho para Dashboard UTI
                event.preventDefault();
                if (window.setActiveTab) window.setActiveTab('uti');
                break;
            case 'u':
            case 'U':
                event.preventDefault();
                if (window.updateData) window.updateData();
                break;
        }
    }
    
    if (event.key === 'Escape') {
        const menu = document.getElementById('sideMenu');
        if (menu && menu.classList.contains('open')) {
            if (window.toggleMenu) window.toggleMenu();
        }
        
        const adminModal = document.querySelector('.admin-modal');
        const adminPanel = document.querySelector('.admin-panel');
        if (adminModal && window.closeAdminModal) {
            window.closeAdminModal();
        } else if (adminPanel && window.closeAdminPanel) {
            window.closeAdminPanel();
        }
        
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, [onclick*="close"]');
            if (closeBtn) closeBtn.click();
        });
    }
    
    if ((event.key === 'F5') || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        if (window.updateData && !window.isLoading) {
            window.updateData();
        } else if (window.loadHospitalData && !window.isLoading) {
            window.loadHospitalData();
        } else {
            location.reload();
        }
    }
    
    if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        if (window.openAdmin) {
            window.openAdmin();
        }
    }
});

// =================== LIFECYCLE HOOKS ===================
window.addEventListener('beforeunload', function(event) {
    if (window.saveSystemState) {
        window.saveSystemState();
    }
    
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
    }
    
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (error) {
                    console.warn('Erro ao destruir grafico:', error);
                }
            }
        });
    }
    
    logInfo('Recursos limpos antes do unload');
});

// =================== DETECCAO DE CONECTIVIDADE ===================
window.addEventListener('online', function() {
    if (typeof window.logSuccess === 'function') {
        logSuccess('Conexao restaurada');
    }
    
    if (window.isAuthenticated && window.testAPI) {
        setTimeout(() => {
            window.testAPI().catch(error => {
                logError('Erro ao testar API apos reconexao:', error);
            });
        }, 1000); // REDUZIDO: de 2000ms para 1000ms
    }
    
    if (window.isAuthenticated && window.loadHospitalData) {
        setTimeout(() => {
            if (!window.isLoading) {
                window.updateData();
            }
        }, 1500); // REDUZIDO: de 3000ms para 1500ms
    }
});

window.addEventListener('offline', function() {
    if (typeof window.logInfo === 'function') {
        logInfo('Sem conexao - sistema funcionando em modo offline');
    }
});

// =================== PERFORMANCE MONITORING ===================
window.addEventListener('load', function() {
    if (performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Pagina carregada em ' + loadTime + 'ms');
        
        const perfData = {
            'DNS Lookup': performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
            'TCP Connect': performance.timing.connectEnd - performance.timing.connectStart,
            'Request': performance.timing.responseStart - performance.timing.requestStart,
            'Response': performance.timing.responseEnd - performance.timing.responseStart,
            'DOM Processing': performance.timing.domComplete - performance.timing.domLoading
        };
        
        console.table(perfData);
    }
    
    const requiredModules = [
        'CONFIG', 'loadHospitalData', 'renderCards', 
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'authenticate', 'setActiveTab', 'API_URL',
        'renderChartByType', 'showLoading', 'hideLoading',
        'carregarReservas' // V7.0: Modulo de reservas
    ];
    
    const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
    
    if (missingModules.length > 0) {
        logError('Modulos nao carregados:', missingModules.join(', '));
        
        // REDUZIDO: de 3000ms para 1500ms
        setTimeout(() => {
            const stillMissing = requiredModules.filter(module => typeof window[module] === 'undefined');
            if (stillMissing.length === 0) {
                logSuccess('Todos os modulos carregados apos retry');
            } else {
                logError('Modulos ainda faltando:', stillMissing.join(', '));
            }
        }, 1500);
    } else {
        logSuccess('Todos os modulos criticos carregados');
    }
    
    console.log('Estrutura do sistema:', {
        hospitais: window.CONFIG?.HOSPITAIS ? Object.keys(window.CONFIG.HOSPITAIS).length : 0,
        apiUrl: window.API_URL ? 'Configurada' : 'Nao configurada',
        cores: window.CHART_COLORS ? Object.keys(window.CHART_COLORS).length : 0,
        autenticacao: window.isAuthenticated ? 'Logado' : 'Nao logado',
        graficos: window.chartInstances ? Object.keys(window.chartInstances).length : 0,
        reservas: window.reservasData ? window.reservasData.length : 0, // V7.0
        loading: window.loadingOverlay ? 'Sistema ativo' : 'Nao inicializado',
        funcoesCriticas: requiredModules.filter(module => typeof window[module] !== 'undefined').length
    });
});

// =================== MONITORAMENTO DA API ===================
window.monitorAPI = function() {
    if (!window.API_URL || !window.testAPI) return;
    
    const interval = 5 * 60 * 1000; // 5 minutos
    
    setInterval(async () => {
        if (!window.isLoading) {
            try {
                const startTime = performance.now();
                await window.testAPI();
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                
                if (responseTime > 5000) {
                    logError('API lenta: ' + responseTime + 'ms');
                }
            } catch (error) {
                if (typeof window.logError === 'function') {
                    logError('API nao responsiva:', error);
                }
            }
        }
    }, interval);
};

// =================== HEALTH CHECK SYSTEM ===================
window.systemHealthCheck = function() {
    const checks = {
        modules: typeof window.CONFIG !== 'undefined',
        api: typeof window.API_URL !== 'undefined',
        charts: typeof window.renderChartByType !== 'undefined',
        colors: typeof window.CHART_COLORS !== 'undefined',
        authentication: typeof window.authenticate !== 'undefined',
        data: typeof window.hospitalData !== 'undefined',
        reservas: typeof window.reservasData !== 'undefined', // V7.0
        loading: typeof window.showLoading !== 'undefined',
        dashboards: typeof window.renderDashboardHospitalar !== 'undefined' && 
                   typeof window.renderDashboardExecutivo !== 'undefined',
        chartJS: typeof Chart !== 'undefined'
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log('System Health: ' + passed + '/' + total + ' checks passed (' + percentage + '%)');
    console.table(checks);
    
    if (percentage >= 100) {
        console.log('%cSistema 100% operacional', 'color: #10b981; font-weight: bold; font-size: 16px;');
    } else if (percentage >= 80) {
        console.log('%cSistema parcialmente operacional', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
    } else {
        console.log('%cSistema com problemas criticos', 'color: #ef4444; font-weight: bold; font-size: 16px;');
    }
    
    return { passed, total, percentage, checks };
};

// =================== AUTO-CORRECAO DE CONTAINERS ===================
function verificarContainersDashboard() {
    const containers = [
        { id: 'dashExecutivoContent', section: 'dash2' },
        { id: 'dashHospitalarContent', section: 'dash1' },
        { id: 'dashUTIContent', section: 'uti' } // V7.0: Container UTI
    ];
    
    containers.forEach(({ id, section }) => {
        let container = document.getElementById(id);
        if (!container) {
            const section_element = document.getElementById(section);
            if (section_element) {
                container = document.createElement('div');
                container.id = id;
                section_element.appendChild(container);
                logInfo('Container ' + id + ' criado automaticamente');
            }
        }
    });
}

// =================== DIAGNOSTICO AUTOMATICO ===================
window.diagnosticoSistema = function() {
    const diagnostico = {
        hospitalData: !!window.hospitalData,
        hospitalDataCount: window.hospitalData ? Object.keys(window.hospitalData).length : 0,
        reservasData: !!window.reservasData, // V7.0
        reservasCount: window.reservasData ? window.reservasData.length : 0, // V7.0
        chartJS: typeof Chart !== 'undefined',
        containers: {
            dashExecutivoContent: !!document.getElementById('dashExecutivoContent'),
            dashHospitalarContent: !!document.getElementById('dashHospitalarContent'),
            dashUTIContent: !!document.getElementById('dashUTIContent') // V7.0
        },
        functions: {
            renderDashboardExecutivo: typeof window.renderDashboardExecutivo === 'function',
            renderDashboardHospitalar: typeof window.renderDashboardHospitalar === 'function',
            renderDashboardUTI: typeof window.renderDashboardUTI === 'function', // V7.0
            loadHospitalData: typeof window.loadHospitalData === 'function',
            carregarReservas: typeof window.carregarReservas === 'function', // V7.0
            renderChartByType: typeof window.renderChartByType === 'function'
        },
        api: !!window.API_URL,
        loading: typeof window.showLoading === 'function',
        authentication: window.isAuthenticated || false
    };
    
    console.log('DIAGNOSTICO DO SISTEMA:', diagnostico);
    
    const problemas = [];
    const solucoes = [];
    
    if (!diagnostico.hospitalData) {
        problemas.push('Dados dos hospitais nao carregados');
        solucoes.push('window.loadHospitalData()');
    }
    
    if (!diagnostico.reservasData) {
        problemas.push('Dados das reservas nao carregados');
        solucoes.push('window.carregarReservas()');
    }
    
    if (!diagnostico.chartJS) {
        problemas.push('Chart.js nao disponivel');
        solucoes.push('garantirChartJS()');
    }
    
    if (!diagnostico.containers.dashExecutivoContent || !diagnostico.containers.dashHospitalarContent) {
        problemas.push('Containers dos dashboards faltando');
        solucoes.push('verificarContainersDashboard()');
    }
    
    if (!diagnostico.functions.renderChartByType) {
        problemas.push('Sistema de graficos corrigido nao carregado');
        solucoes.push('Recarregar charts.js');
    }
    
    if (problemas.length === 0) {
        console.log('Sistema funcionando corretamente!');
    } else {
        console.log('PROBLEMAS ENCONTRADOS:', problemas);
        console.log('SOLUCOES:', solucoes);
    }
    
    return { diagnostico, problemas, solucoes };
};

// =================== CARREGAR CHART.JS DINAMICAMENTE ===================
function garantirChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve(Chart);
            return;
        }
        
        logInfo('Carregando Chart.js dinamicamente...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = () => {
            if (typeof Chart !== 'undefined') {
                logSuccess('Chart.js carregado com sucesso');
                resolve(Chart);
            } else {
                reject(new Error('Falha ao carregar Chart.js'));
            }
        };
        script.onerror = () => reject(new Error('Erro no carregamento do Chart.js'));
        document.head.appendChild(script);
    });
}

// =================== FORCAR RENDERIZACAO DOS DASHBOARDS ===================
window.forcarRenderizacao = function() {
    logInfo('Forcando renderizacao dos dashboards...');
    
    verificarContainersDashboard();
    
    // REDUZIDO: de 500ms para 200ms
    setTimeout(() => {
        try {
            if (window.renderDashboardExecutivo) {
                window.renderDashboardExecutivo();
                logSuccess('Dashboard Executivo forcado');
            }
        } catch (error) {
            logError('Erro no Dashboard Executivo:', error);
        }
        
        try {
            if (window.renderDashboardHospitalar) {
                window.renderDashboardHospitalar();
                logSuccess('Dashboard Enfermarias forcado'); // V7.0: Nome atualizado
            }
        } catch (error) {
            logError('Erro no Dashboard Enfermarias:', error);
        }
        
        // V7.0: Dashboard UTI
        try {
            if (window.renderDashboardUTI) {
                window.renderDashboardUTI();
                logSuccess('Dashboard UTI forcado');
            }
        } catch (error) {
            // Dashboard UTI pode nao estar carregado ainda
            console.log('Dashboard UTI nao disponivel (esperado se nao estiver na aba)');
        }
        
        // V7.0: Mapa de Leitos UTI (Cards)
        try {
            if (window.renderCardsUTI && window.currentView === 'leitosUTI') {
                window.renderCardsUTI(window.currentHospitalUTI || 'H2');
                logSuccess('Mapa de Leitos UTI forcado');
            }
        } catch (error) {
            console.log('Mapa de Leitos UTI nao disponivel');
        }
    }, 200);
};

// =================== TESTE RAPIDO ===================
window.testeRapido = function() {
    console.log('EXECUTANDO TESTE RAPIDO...');
    
    const resultado = window.diagnosticoSistema();
    
    if (resultado.problemas.length > 0) {
        console.log('Aplicando correcoes automaticas...');
        
        if (!window.hospitalData && window.loadHospitalData) {
            window.loadHospitalData().then(() => {
                logSuccess('Dados carregados automaticamente');
                // V7.0: Carregar reservas apos dados
                if (window.carregarReservas) {
                    window.carregarReservas().then(() => {
                        logSuccess('Reservas carregadas automaticamente');
                    });
                }
                // REDUZIDO: de 1000ms para 500ms
                setTimeout(() => window.forcarRenderizacao(), 500);
            });
        }
        
        garantirChartJS().then(() => {
            logSuccess('Chart.js disponivel');
        });
        
        verificarContainersDashboard();
        
        // REDUZIDO: de 2000ms para 1000ms
        setTimeout(() => window.forcarRenderizacao(), 1000);
    } else {
        window.forcarRenderizacao();
    }
    
    return resultado;
};

// =================== HOOK NO SISTEMA DE NAVEGACAO ===================
const setActiveTabOriginal = window.setActiveTab;
window.setActiveTab = function(tab) {
    if (window.isLoading) {
        logInfo('Navegacao bloqueada durante carregamento');
        return;
    }
    
    verificarContainersDashboard();
    
    if (setActiveTabOriginal) {
        setActiveTabOriginal(tab);
    }
    
    // REDUZIDO: de 500ms para 200ms
    setTimeout(() => {
        if (tab === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        } else if (tab === 'uti' && window.renderDashboardUTI) { // V7.0: Dashboard UTI
            window.renderDashboardUTI();
        } else if (tab === 'leitosUTI' && window.renderCardsUTI) { // V7.0: Mapa de Leitos UTI
            window.renderCardsUTI(window.currentHospitalUTI || 'H2');
        }
    }, 200);
};

// =================== COMANDOS DE CONSOLE ===================
window.debug = window.debug || {};
Object.assign(window.debug, {
    diagnostico: window.diagnosticoSistema,
    forcar: window.forcarRenderizacao,
    teste: window.testeRapido,
    dados: () => window.hospitalData,
    reservas: () => window.reservasData, // V7.0
    graficos: () => window.chartInstances,
    estado: window.getSystemState,
    saude: window.systemHealthCheck,
    recarregar: async () => {
        if (window.loadHospitalData) {
            await window.loadHospitalData();
            // V7.0: Recarregar reservas tambem
            if (window.carregarReservas) {
                await window.carregarReservas();
            }
            // REDUZIDO: de 1000ms para 500ms
            setTimeout(() => window.forcarRenderizacao(), 500);
            return { hospitalData: window.hospitalData, reservasData: window.reservasData };
        }
    },
    limpar: () => {
        if (window.chartInstances) {
            Object.values(window.chartInstances).forEach(chart => {
                try { chart.destroy(); } catch (e) {}
            });
            window.chartInstances = {};
        }
    },
    resetar: () => {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }
});

// =================== OBSERVER PARA MUDANCAS DE TAB ===================
const observarMudancasTab = () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // REDUZIDO: de 300ms para 150ms
                if (target.id === 'dash1' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardHospitalar) {
                            window.renderDashboardHospitalar();
                        }
                    }, 150);
                } else if (target.id === 'dash2' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardExecutivo) {
                            window.renderDashboardExecutivo();
                        }
                    }, 150);
                } else if (target.id === 'uti' && !target.classList.contains('hidden')) { // V7.0
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardUTI) {
                            window.renderDashboardUTI();
                        }
                    }, 150);
                } else if (target.id === 'leitosUTIView' && !target.classList.contains('hidden')) { // V7.0: Mapa UTI
                    setTimeout(() => {
                        if (window.renderCardsUTI) {
                            window.renderCardsUTI(window.currentHospitalUTI || 'H2');
                        }
                    }, 150);
                }
            }
        });
    });
    
    const dash1 = document.getElementById('dash1');
    const dash2 = document.getElementById('dash2');
    const dashUTI = document.getElementById('uti'); // V7.0
    const leitosUTIView = document.getElementById('leitosUTIView'); // V7.0: Mapa UTI
    
    if (dash1) observer.observe(dash1, { attributes: true });
    if (dash2) observer.observe(dash2, { attributes: true });
    if (dashUTI) observer.observe(dashUTI, { attributes: true }); // V7.0
    if (leitosUTIView) observer.observe(leitosUTIView, { attributes: true }); // V7.0: Mapa UTI
};

// =================== INICIALIZACAO AUTOMATICA OTIMIZADA ===================
// REDUZIDO: de 4000ms para 800ms
setTimeout(() => {
    logInfo('Iniciando correcoes automaticas...');
    
    window.loadSystemState();
    
    garantirChartJS().catch(() => {
        logError('Erro ao carregar Chart.js - alguns graficos podem nao funcionar');
    });
    
    verificarContainersDashboard();
    
    if (!window.hospitalData && window.loadHospitalData) {
        logInfo('Carregando dados dos hospitais...');
        window.loadHospitalData().then(() => {
            logSuccess('Dados carregados automaticamente');
            
            // V7.0: Carregar reservas apos dados dos hospitais
            if (window.carregarReservas) {
                window.carregarReservas().then(() => {
                    logSuccess('Reservas carregadas automaticamente');
                }).catch(err => {
                    logError('Erro ao carregar reservas:', err);
                });
            }
            
            // REDUZIDO: de 1000ms para 300ms
            setTimeout(() => {
                if (window.currentView === 'dash1') {
                    window.renderDashboardHospitalar();
                } else if (window.currentView === 'dash2') {
                    window.renderDashboardExecutivo();
                } else if (window.currentView === 'uti') { // V7.0
                    window.renderDashboardUTI();
                } else if (window.currentView === 'leitosUTI' && window.renderCardsUTI) { // V7.0: Mapa UTI
                    window.renderCardsUTI(window.currentHospitalUTI || 'H2');
                }
            }, 300);
        }).catch(error => {
            logError('Erro ao carregar dados:', error);
        });
    }
    
    if (window.monitorAPI) {
        window.monitorAPI();
    }
    
    // REDUZIDO: de 5000ms para 1500ms
    setTimeout(() => {
        const resultado = window.systemHealthCheck();
        const diagnostico = window.diagnosticoSistema();
        
        if (diagnostico.problemas.length > 0) {
            console.log('Executando correcoes finais...');
            window.testeRapido();
        } else {
            logSuccess('Sistema inicializado corretamente');
        }
    }, 1500);
    
}, 800);

// =================== OBSERVER SETUP ===================
// REDUZIDO: de 3000ms para 1000ms
setTimeout(observarMudancasTab, 1000);

// =================== LOGS FINAIS ===================
console.log('%cARCHIPELAGO DASHBOARD V7.0 - SISTEMA COM RESERVAS E UTI', 'color: #60a5fa; font-size: 16px; font-weight: bold;');
console.log('%cDezembro/2025', 'color: #10b981; font-weight: bold;');
console.log('%cCarregamento ultrarapido ativado', 'color: #10b981;');
console.log('%c9 Hospitais - 356 Leitos (293 Enfermaria + 63 UTI)', 'color: #10b981;');

console.log(`
COMANDOS DISPONIVEIS:

- window.debug.teste() - Teste rapido + correcoes
- window.debug.diagnostico() - Diagnostico completo  
- window.debug.forcar() - Forcar renderizacao
- window.debug.recarregar() - Recarregar dados da API
- window.debug.dados() - Ver dados carregados
- window.debug.reservas() - Ver reservas carregadas (V7.0)
- window.debug.limpar() - Limpar graficos
- window.debug.estado() - Estado do sistema
- window.debug.saude() - Health check completo

Sistema V7.0 pronto com Reservas e Dashboard UTI!
`);

// =================== EXPORTS V7.0 ===================
window.carregarReservas = window.carregarReservas;
window.refreshAfterAction = window.refreshAfterAction;
window.verificarContainersDashboard = verificarContainersDashboard;
window.garantirChartJS = garantirChartJS;
