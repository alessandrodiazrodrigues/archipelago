// =================== MAIN.JS - CONTROLADOR PRINCIPAL CORRIGIDO BASEADO NO ORIGINAL ===================

// =================== INICIALIZAÇÃO GLOBAL ===================
document.addEventListener('DOMContentLoaded', function() {
    logInfo('🚀 Archipelago Dashboard V3.0 - Iniciando carregamento completo...');
    
    // Aguardar carregamento de todos os módulos
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            logSuccess('✅ Todos os módulos carregados, inicializando sistema...');
            window.initApp();
        } else {
            logError('❌ initApp não encontrada - tentando inicialização manual');
            setTimeout(() => {
                tryManualInit();
            }, 1000);// =================== MAIN.JS - CONTROLADOR PRINCIPAL CORRIGIDO BASEADO NO ORIGINAL ===================

// =================== INICIALIZAÇÃO GLOBAL ===================
document.addEventListener('DOMContentLoaded', function() {
    logInfo('🚀 Archipelago Dashboard V3.0 - Iniciando carregamento completo...');
    
    // Aguardar carregamento de todos os módulos
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            logSuccess('✅ Todos os módulos carregados, inicializando sistema...');
            window.initApp();
        } else {
            logError('❌ initApp não encontrada - tentando inicialização manual');
            setTimeout(() => {
                tryManualInit();
            }, 1000);
        }
    }, 200); // *** CORREÇÃO: Aguardar mais tempo para carregamento ***
});

// =================== INICIALIZAÇÃO MANUAL (FALLBACK MELHORADO) ===================
function tryManualInit() {
    logInfo('🔄 Tentando inicialização manual...');
    
    // *** CORREÇÃO: VERIFICAR MAIS FUNÇÕES CRÍTICAS ***
    const criticalFunctions = [
        'authenticate', 'logInfo', 'logSuccess', 'logError',
        'loadHospitalData', 'renderCards', 'CONFIG',
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'renderChartByType', 'showLoading', 'hideLoading'
    ];
    
    const missing = criticalFunctions.filter(fn => typeof window[fn] === 'undefined');
    
    if (missing.length > 0) {
        logError('❌ Funções críticas não encontradas:', missing);
        showInitError(missing);
        return;
    }
    
    // Se todas as funções existem, inicializar
    logSuccess('✅ Inicialização manual bem-sucedida');
    window.initApp();
}

// =================== MOSTRAR ERRO DE INICIALIZAÇÃO (MELHORADO) ===================
function showInitError(missingFunctions) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 16px; max-width: 600px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h1 style="color: #ef4444; margin-bottom: 20px; font-size: 24px; font-weight: 700;">Erro de Carregamento do Sistema</h1>
                <p style="margin-bottom: 20px; color: rgba(255, 255, 255, 0.8);">Algumas funções críticas não foram carregadas corretamente:</p>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <ul style="text-align: left; color: #fbbf24; margin: 0; padding: 0; list-style: none;">
                        ${missingFunctions.map(fn => `<li style="margin: 4px 0;">• ${fn}</li>`).join('')}
                    </ul>
                </div>
                <div style="display: flex; gap: 16px; justify-content: center; margin-top: 30px;">
                    <button onclick="location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">
                        🔄 Recarregar Página
                    </button>
                    <button onclick="tryForceInit()" style="padding: 12px 24px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">
                        🚀 Tentar Novamente
                    </button>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                    Sistema: Archipelago Dashboard V3.0<br>
                    Versão: Corrigida com Loading Bloqueante + Beneficiários Inteiros
                </div>
            </div>
        </div>
    `;
}

// =================== FORÇAR INICIALIZAÇÃO (PARA DEBUGGING) ===================
window.tryForceInit = function() {
    logInfo('🔧 Tentando forçar inicialização...');
    
    // Definir funções básicas se não existirem
    if (typeof window.logInfo === 'undefined') {
        window.logInfo = (msg) => console.log(`ℹ️ [INFO] ${msg}`);
        window.logSuccess = (msg) => console.log(`✅ [SUCCESS] ${msg}`);
        window.logError = (msg) => console.error(`❌ [ERROR] ${msg}`);
    }
    
    if (typeof window.showLoading === 'undefined') {
        window.showLoading = (container, message) => {
            console.log(`🔄 Loading: ${message}`);
        };
        window.hideLoading = () => {
            console.log('✅ Loading removido');
        };
    }
    
    // Tentar inicializar mesmo com funções faltando
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            window.initApp();
        } else {
            location.reload();
        }
    }, 1000);
};

// =================== FUNÇÕES DE UTILIDADE (MANTIDAS DO ORIGINAL) ===================
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

// =================== GERENCIAMENTO DE ESTADO (MANTIDO DO ORIGINAL) ===================
window.getSystemState = function() {
    return {
        authenticated: window.isAuthenticated || false,
        currentView: window.currentView || 'leitos',
        currentHospital: window.currentHospital || 'H1',
        hospitalsData: window.hospitalData || {},
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
            
            // Restaurar apenas dados seguros (não autenticação)
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

// =================== TRATAMENTO DE ERROS GLOBAIS (MANTIDO + MELHORADO) ===================
window.addEventListener('error', function(event) {
    if (typeof window.logError === 'function') {
        logError('Erro JavaScript:', event.error);
    } else {
        console.error('❌ Erro JavaScript:', event.error);
    }
    
    // Mostrar erro detalhado no console
    if (event.error && event.error.stack) {
        console.group('🔍 Detalhes do Erro:');
        console.error('Mensagem:', event.error.message);
        console.error('Arquivo:', event.filename);
        console.error('Linha:', event.lineno);
        console.error('Stack:', event.error.stack);
        console.groupEnd();
    }
    
    // *** CORREÇÃO: TENTAR RECUPERAÇÃO AUTOMÁTICA ***
    if (event.error && event.error.message) {
        const errorMsg = event.error.message.toLowerCase();
        if (errorMsg.includes('chart') || errorMsg.includes('canvas')) {
            setTimeout(() => {
                garantirChartJS().then(() => {
                    logSuccess('Chart.js recarregado após erro');
                });
            }, 1000);
        }
    }
});

window.addEventListener('unhandledrejection', function(event) {
    if (typeof window.logError === 'function') {
        logError('Promise rejeitada:', event.reason);
    } else {
        console.error('❌ Promise rejeitada:', event.reason);
    }
    event.preventDefault();
});

// =================== RESPONSIVIDADE (MANTIDA + MELHORADA) ===================
window.addEventListener('resize', function() {
    // Fechar menu em telas grandes
    if (window.innerWidth > 1024) {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        
        if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.classList.remove('menu-open');
        }
    }
    
    // *** CORREÇÃO: RE-RENDERIZAR GRÁFICOS COM DEBOUNCE ***
    if (window.chartInstances && Object.keys(window.chartInstances).length > 0) {
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            Object.values(window.chartInstances).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    try {
                        chart.resize();
                    } catch (error) {
                        console.warn('Erro ao redimensionar gráfico:', error);
                    }
                }
            });
        }, 300);
    }
});

// =================== ATALHOS DE TECLADO (MANTIDOS + MELHORADOS) ===================
document.addEventListener('keydown', function(event) {
    // *** CORREÇÃO: NÃO INTERCEPTAR SE USUÁRIO ESTÁ DIGITANDO ***
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        return;
    }
    
    // Alt + 1, 2, 3 para navegar entre tabs
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
            case 'u':
            case 'U':
                event.preventDefault();
                if (window.updateData) window.updateData();
                break;
        }
    }
    
    // Esc para fechar modais
    if (event.key === 'Escape') {
        // Fechar menu lateral
        const menu = document.getElementById('sideMenu');
        if (menu && menu.classList.contains('open')) {
            if (window.toggleMenu) window.toggleMenu();
        }
        
        // Fechar modais administrativos
        const adminModal = document.querySelector('.admin-modal');
        const adminPanel = document.querySelector('.admin-panel');
        if (adminModal && window.closeAdminModal) {
            window.closeAdminModal();
        } else if (adminPanel && window.closeAdminPanel) {
            window.closeAdminPanel();
        }
        
        // Fechar outros modais
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, [onclick*="close"]');
            if (closeBtn) closeBtn.click();
        });
    }
    
    // *** CORREÇÃO: F5 OU CTRL+R PARA ATUALIZAR DADOS ***
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
    
    // Ctrl + Alt + A para área administrativa
    if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        if (window.openAdmin) {
            window.openAdmin();
        }
    }
});

// =================== LIFECYCLE HOOKS (MANTIDOS) ===================
window.addEventListener('beforeunload', function(event) {
    // Salvar estado antes de sair
    if (window.saveSystemState) {
        window.saveSystemState();
    }
    
    // Limpar timers
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
    }
    
    // *** CORREÇÃO: LIMPAR GRÁFICOS PARA LIBERAR MEMÓRIA ***
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (error) {
                    console.warn('Erro ao destruir gráfico:', error);
                }
            }
        });
    }
    
    logInfo('🧹 Recursos limpos antes do unload');
});

// =================== DETECÇÃO DE CONECTIVIDADE (MANTIDA + MELHORADA) ===================
window.addEventListener('online', function() {
    if (typeof window.logSuccess === 'function') {
        logSuccess('🌐 Conexão restaurada');
    }
    
    // Testar API quando voltar online
    if (window.isAuthenticated && window.testAPI) {
        setTimeout(() => {
            window.testAPI().catch(error => {
                logError('Erro ao testar API após reconexão:', error);
            });
        }, 2000);
    }
    
    // Atualizar dados quando voltar online
    if (window.isAuthenticated && window.loadHospitalData) {
        setTimeout(() => {
            if (!window.isLoading) {
                window.updateData();
            }
        }, 3000);
    }
});

window.addEventListener('offline', function() {
    if (typeof window.logInfo === 'function') {
        logInfo('📡 Sem conexão - sistema funcionando em modo offline');
    }
});

// =================== PERFORMANCE MONITORING (MANTIDO + MELHORADO) ===================
window.addEventListener('load', function() {
    // Medir performance de carregamento
    if (performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 Página carregada em ${loadTime}ms`);
        
        // *** CORREÇÃO: LOG PERFORMANCE DETALHADO ***
        const perfData = {
            'DNS Lookup': performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
            'TCP Connect': performance.timing.connectEnd - performance.timing.connectStart,
            'Request': performance.timing.responseStart - performance.timing.requestStart,
            'Response': performance.timing.responseEnd - performance.timing.responseStart,
            'DOM Processing': performance.timing.domComplete - performance.timing.domLoading
        };
        
        console.table(perfData);
    }
    
    // *** CORREÇÃO: VERIFICAR MAIS MÓDULOS CRÍTICOS ***
    const requiredModules = [
        'CONFIG', 'loadHospitalData', 'renderCards', 
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'authenticate', 'setActiveTab', 'API_URL',
        'renderChartByType', 'showLoading', 'hideLoading'
    ];
    
    const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
    
    if (missingModules.length > 0) {
        logError('❌ Módulos não carregados:', missingModules.join(', '));
        
        // Tentar carregar módulos faltantes após um tempo
        setTimeout(() => {
            const stillMissing = requiredModules.filter(module => typeof window[module] === 'undefined');
            if (stillMissing.length === 0) {
                logSuccess('✅ Todos os módulos carregados após retry');
            } else {
                logError('⚠️  Módulos ainda faltando:', stillMissing.join(', '));
            }
        }, 3000);
    } else {
        logSuccess('✅ Todos os módulos críticos carregados');
    }
    
    // *** CORREÇÃO: LOG DA ESTRUTURA MAIS DETALHADO ***
    console.log('📁 Estrutura do sistema:', {
        hospitais: window.CONFIG?.HOSPITAIS ? Object.keys(window.CONFIG.HOSPITAIS).length : 0,
        apiUrl: window.API_URL ? 'Configurada' : 'Não configurada',
        cores: window.CHART_COLORS ? Object.keys(window.CHART_COLORS).length : 0,
        autenticacao: window.isAuthenticated ? 'Logado' : 'Não logado',
        graficos: window.chartInstances ? Object.keys(window.chartInstances).length : 0,
        loading: window.loadingOverlay ? 'Sistema ativo' : 'Não inicializado',
        funcoesCriticas: requiredModules.filter(module => typeof window[module] !== 'undefined').length
    });
});

// =================== MONITORAMENTO DA API (MANTIDO + MELHORADO) ===================
window.monitorAPI = function() {
    if (!window.API_URL || !window.testAPI) return;
    
    const interval = 5 * 60 * 1000; // 5 minutos
    
    setInterval(async () => {
        if (!window.isLoading) { // *** CORREÇÃO: NÃO MONITORAR DURANTE LOADING ***
            try {
                const startTime = performance.now();
                await window.testAPI();
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                
                if (responseTime > 5000) {
                    logError(`API lenta: ${responseTime}ms`);
                } else {
                    // API funcionando
                }
            } catch (error) {
                if (typeof window.logError === 'function') {
                    logError('API não responsiva:', error);
                }
            }
        }
    }, interval);
};

// =================== HEALTH CHECK SYSTEM (MANTIDO + MELHORADO) ===================
window.systemHealthCheck = function() {
    const checks = {
        modules: typeof window.CONFIG !== 'undefined',
        api: typeof window.API_URL !== 'undefined',
        charts: typeof window.renderChartByType !== 'undefined',
        colors: typeof window.CHART_COLORS !== 'undefined',
        authentication: typeof window.authenticate !== 'undefined',
        data: typeof window.hospitalData !== 'undefined',
        loading: typeof window.showLoading !== 'undefined',
        dashboards: typeof window.renderDashboardHospitalar !== 'undefined' && 
                   typeof window.renderDashboardExecutivo !== 'undefined',
        chartJS: typeof Chart !== 'undefined' // *** CORREÇÃO: VERIFICAR CHART.JS ***
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`🏥 System Health: ${passed}/${total} checks passed (${percentage}%)`);
    console.table(checks);
    
    // *** CORREÇÃO: STATUS VISUAL MELHORADO ***
    if (percentage >= 100) {
        console.log('%c✅ Sistema 100% operacional', 'color: #10b981; font-weight: bold; font-size: 16px;');
    } else if (percentage >= 80) {
        console.log('%c⚠️  Sistema parcialmente operacional', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
    } else {
        console.log('%c❌ Sistema com problemas críticos', 'color: #ef4444; font-weight: bold; font-size: 16px;');
    }
    
    return { passed, total, percentage, checks };
};

// =================== CORREÇÕES AUTOMÁTICAS - TODAS MANTIDAS DO ORIGINAL ===================

// =================== AUTO-CORREÇÃO DE CONTAINERS ===================
function verificarContainersDashboard() {
    const containers = [
        { id: 'dashExecutivoContent', section: 'dash2' },
        { id: 'dashHospitalarContent', section: 'dash1' }
    ];
    
    containers.forEach(({ id, section }) => {
        let container = document.getElementById(id);
        if (!container) {
            const section_element = document.getElementById(section);
            if (section_element) {
                container = document.createElement('div');
                container.id = id;
                section_element.appendChild(container);
                logInfo(`✅ Container ${id} criado automaticamente`);
            }
        }
    });
}

// =================== DIAGNÓSTICO AUTOMÁTICO ===================
window.diagnosticoSistema = function() {
    const diagnostico = {
        hospitalData: !!window.hospitalData,
        hospitalDataCount: window.hospitalData ? Object.keys(window.hospitalData).length : 0,
        chartJS: typeof Chart !== 'undefined',
        containers: {
            dashExecutivoContent: !!document.getElementById('dashExecutivoContent'),
            dashHospitalarContent: !!document.getElementById('dashHospitalarContent')
        },
        functions: {
            renderDashboardExecutivo: typeof window.renderDashboardExecutivo === 'function',
            renderDashboardHospitalar: typeof window.renderDashboardHospitalar === 'function',
            loadHospitalData: typeof window.loadHospitalData === 'function',
            renderChartByType: typeof window.renderChartByType === 'function' // *** CORREÇÃO ***
        },
        api: !!window.API_URL,
        loading: typeof window.showLoading === 'function',
        authentication: window.isAuthenticated || false
    };
    
    console.log('🔍 DIAGNÓSTICO DO SISTEMA:', diagnostico);
    
    // Lista de problemas encontrados
    const problemas = [];
    const solucoes = [];
    
    if (!diagnostico.hospitalData) {
        problemas.push('❌ Dados dos hospitais não carregados');
        solucoes.push('window.loadHospitalData()');
    }
    
    if (!diagnostico.chartJS) {
        problemas.push('❌ Chart.js não disponível');
        solucoes.push('garantirChartJS()');
    }
    
    if (!diagnostico.containers.dashExecutivoContent || !diagnostico.containers.dashHospitalarContent) {
        problemas.push('❌ Containers dos dashboards faltando');
        solucoes.push('verificarContainersDashboard()');
    }
    
    if (!diagnostico.functions.renderChartByType) {
        problemas.push('❌ Sistema de gráficos corrigido não carregado');
        solucoes.push('Recarregar charts.js');
    }
    
    if (problemas.length === 0) {
        console.log('✅ Sistema funcionando corretamente!');
    } else {
        console.log('⚠️ PROBLEMAS ENCONTRADOS:', problemas);
        console.log('🔧 SOLUÇÕES:', solucoes);
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
        
        logInfo('📊 Carregando Chart.js dinamicamente...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = () => {
            if (typeof Chart !== 'undefined') {
                logSuccess('✅ Chart.js carregado com sucesso');
                resolve(Chart);
            } else {
                reject(new Error('Falha ao carregar Chart.js'));
            }
        };
        script.onerror = () => reject(new Error('Erro no carregamento do Chart.js'));
        document.head.appendChild(script);
    });
}

// =================== FORÇAR RENDERIZAÇÃO DOS DASHBOARDS ===================
window.forcarRenderizacao = function() {
    logInfo('🔄 Forçando renderização dos dashboards...');
    
    // 1. Verificar containers
    verificarContainersDashboard();
    
    // 2. Renderizar dashboards
    setTimeout(() => {
        try {
            if (window.renderDashboardExecutivo) {
                window.renderDashboardExecutivo();
                logSuccess('✅ Dashboard Executivo forçado');
            }
        } catch (error) {
            logError('❌ Erro no Dashboard Executivo:', error);
        }
        
        try {
            if (window.renderDashboardHospitalar) {
                window.renderDashboardHospitalar();
                logSuccess('✅ Dashboard Hospitalar forçado');
            }
        } catch (error) {
            logError('❌ Erro no Dashboard Hospitalar:', error);
        }
    }, 500);
};

// =================== TESTE RÁPIDO ===================
window.testeRapido = function() {
    console.log('🧪 EXECUTANDO TESTE RÁPIDO...');
    
    const resultado = window.diagnosticoSistema();
    
    // Aplicar correções automáticas
    if (resultado.problemas.length > 0) {
        console.log('🔧 Aplicando correções automáticas...');
        
        // Carregar dados se necessário
        if (!window.hospitalData && window.loadHospitalData) {
            window.loadHospitalData().then(() => {
                logSuccess('✅ Dados carregados automaticamente');
                setTimeout(() => window.forcarRenderizacao(), 1000);
            });
        }
        
        // Garantir Chart.js
        garantirChartJS().then(() => {
            logSuccess('✅ Chart.js disponível');
        });
        
        // Verificar containers
        verificarContainersDashboard();
        
        // Forçar renderização
        setTimeout(() => window.forcarRenderizacao(), 2000);
    } else {
        window.forcarRenderizacao();
    }
    
    return resultado;
};

// =================== HOOK NO SISTEMA DE NAVEGAÇÃO ===================
const setActiveTabOriginal = window.setActiveTab;
window.setActiveTab = function(tab) {
    // *** CORREÇÃO: BLOQUEAR DURANTE LOADING ***
    if (window.isLoading) {
        logInfo('Navegação bloqueada durante carregamento');
        return;
    }
    
    // Verificar containers antes de navegar
    verificarContainersDashboard();
    
    // Chamar função original
    if (setActiveTabOriginal) {
        setActiveTabOriginal(tab);
    }
    
    // *** CORREÇÃO: RENDERIZAR DASHBOARDS APÓS MUDANÇA COM DELAY ***
    setTimeout(() => {
        if (tab === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
    }, 500); // *** CORREÇÃO: DELAY MAIOR PARA ESTABILIDADE ***
};

// =================== COMANDOS DE CONSOLE (MANTIDOS + MELHORADOS) ===================
window.debug = window.debug || {};
Object.assign(window.debug, {
    diagnostico: window.diagnosticoSistema,
    forcar: window.forcarRenderizacao,
    teste: window.testeRapido,
    dados: () => window.hospitalData,
    graficos: () => window.chartInstances,
    estado: window.getSystemState,
    saude: window.systemHealthCheck,
    recarregar: async () => {
        if (window.loadHospitalData) {
            await window.loadHospitalData();
            setTimeout(() => window.forcarRenderizacao(), 1000);
            return window.hospitalData;
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

// =================== OBSERVER PARA MUDANÇAS DE TAB ===================
const observarMudancasTab = () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                if (target.id === 'dash1' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardHospitalar) {
                            window.renderDashboardHospitalar();
                        }
                    }, 300); // *** CORREÇÃO: DELAY MAIOR ***
                } else if (target.id === 'dash2' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardExecutivo) {
                            window.renderDashboardExecutivo();
                        }
                    }, 300); // *** CORREÇÃO: DELAY MAIOR ***
                }
            }
        });
    });
    
    const dash1 = document.getElementById('dash1');
    const dash2 = document.getElementById('dash2');
    
    if (dash1) observer.observe(dash1, { attributes: true });
    if (dash2) observer.observe(dash2, { attributes: true });
};

// =================== INICIALIZAÇÃO AUTOMÁTICA ===================
setTimeout(() => {
    logInfo('🚀 Iniciando correções automáticas...');
    
    // 1. Carregar estado do sistema
    window.loadSystemState();
    
    // 2. Garantir Chart.js
    garantirChartJS().catch(() => {
        logError('Erro ao carregar Chart.js - alguns gráficos podem não funcionar');
    });
    
    // 3. Verificar containers
    verificarContainersDashboard();
    
    // 4. Se não há dados, tentar carregar
    if (!window.hospitalData && window.loadHospitalData) {
        logInfo('📊 Carregando dados dos hospitais...');
        window.loadHospitalData().then(() => {
            logSuccess('✅ Dados carregados automaticamente');
            setTimeout(() => {
                // Renderizar dashboards baseado na view atual
                if (window.currentView === 'dash1') {
                    window.renderDashboardHospitalar();
                } else if (window.currentView === 'dash2') {
                    window.renderDashboardExecutivo();
                }
            }, 1000);
        }).catch(error => {
            logError('Erro ao carregar dados:', error);
        });
    }
    
    // 5. Iniciar monitoramento da API
    if (window.monitorAPI) {
        window.monitorAPI();
    }
    
    // 6. Executar health check e correções após tudo
    setTimeout(() => {
        const resultado = window.systemHealthCheck();
        const diagnostico = window.diagnosticoSistema();
        
        if (diagnostico.problemas.length > 0) {
            console.log('🔧 Executando correções finais...');
            window.testeRapido();
        } else {
            logSuccess('✅ Sistema inicializado corretamente');
        }
    }, 5000);
    
}, 4000);

// =================== OBSERVER SETUP ===================
setTimeout(observarMudancasTab, 3000);

// =================== LOGS FINAIS ===================
console.log('%c🚀 ARCHIPELAGO DASHBOARD V3.0 - SISTEMA COMPLETO CORRIGIDO', 'color: #60a5fa; font-size: 16px; font-weight: bold;');
console.log('%c📋 CORREÇÕES IMPLEMENTADAS:', 'color: #10b981; font-weight: bold;');
console.log('%c   ✅ Loading com bloqueio total da interface', 'color: #10b981;');
console.log('%c   ✅ Beneficiários sempre números inteiros', 'color: #10b981;');
console.log('%c   ✅ Dashboard Executivo: Rede Hospitalar Externa + Gauge horizontal', 'color: #10b981;');
console.log('%c   ✅ Dashboard Hospitalar: Layout vertical obrigatório', 'color: #10b981;');
console.log('%c   ✅ Eixos horizontais: Hoje, 24h, 48h, 72h, 96h', 'color: #10b981;');
console.log('%c   ✅ Legendas posicionadas à esquerda, uma por linha', 'color: #10b981;');
console.log('%c   ✅ Eixo Y sempre mostra "Beneficiários"', 'color: #10b981;');
console.log('%c   ✅ 7 tipos de gráfico: Barras, Barras 3D, Linhas, Área, Bolinhas, Radar, Rosca', 'color: #10b981;');
console.log('%c   ✅ Divisão Ouro/2R/3R nas colunas Hoje e 24h', 'color: #10b981;');
console.log('%c   ✅ Linhas com transição suave (tension: 0.4)', 'color: #10b981;');

console.log(`
🔧 SISTEMA DE CORREÇÕES ATIVO

Comandos disponíveis:
• window.debug.teste() - Teste rápido + correções
• window.debug.diagnostico() - Diagnóstico completo  
• window.debug.forcar() - Forçar renderização
• window.debug.recarregar() - Recarregar dados da API
• window.debug.dados() - Ver dados carregados
• window.debug.limpar() - Limpar gráficos
• window.debug.estado() - Estado do sistema
• window.debug.saude() - Health check completo

🤖 Correções automáticas ativas - gráficos serão carregados automaticamente.
📊 Sistema pronto para uso com todas as correções implementadas!
`);
        }
    }, 200); // *** CORREÇÃO: Aguardar mais tempo para carregamento ***
});

// =================== INICIALIZAÇÃO MANUAL (FALLBACK MELHORADO) ===================
function tryManualInit() {
    logInfo('🔄 Tentando inicialização manual...');
    
    // *** CORREÇÃO: VERIFICAR MAIS FUNÇÕES CRÍTICAS ***
    const criticalFunctions = [
        'authenticate', 'logInfo', 'logSuccess', 'logError',
        'loadHospitalData', 'renderCards', 'CONFIG',
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'renderChartByType', 'showLoading', 'hideLoading'
    ];
    
    const missing = criticalFunctions.filter(fn => typeof window[fn] === 'undefined');
    
    if (missing.length > 0) {
        logError('❌ Funções críticas não encontradas:', missing);
        showInitError(missing);
        return;
    }
    
    // Se todas as funções existem, inicializar
    logSuccess('✅ Inicialização manual bem-sucedida');
    window.initApp();
}

// =================== MOSTRAR ERRO DE INICIALIZAÇÃO (MELHORADO) ===================
function showInitError(missingFunctions) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 16px; max-width: 600px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h1 style="color: #ef4444; margin-bottom: 20px; font-size: 24px; font-weight: 700;">Erro de Carregamento do Sistema</h1>
                <p style="margin-bottom: 20px; color: rgba(255, 255, 255, 0.8);">Algumas funções críticas não foram carregadas corretamente:</p>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <ul style="text-align: left; color: #fbbf24; margin: 0; padding: 0; list-style: none;">
                        ${missingFunctions.map(fn => `<li style="margin: 4px 0;">• ${fn}</li>`).join('')}
                    </ul>
                </div>
                <div style="display: flex; gap: 16px; justify-content: center; margin-top: 30px;">
                    <button onclick="location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">
                        🔄 Recarregar Página
                    </button>
                    <button onclick="tryForceInit()" style="padding: 12px 24px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">
                        🚀 Tentar Novamente
                    </button>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                    Sistema: Archipelago Dashboard V3.0<br>
                    Versão: Corrigida com Loading Bloqueante + Beneficiários Inteiros
                </div>
            </div>
        </div>
    `;
}

// =================== FORÇAR INICIALIZAÇÃO (PARA DEBUGGING) ===================
window.tryForceInit = function() {
    logInfo('🔧 Tentando forçar inicialização...');
    
    // Definir funções básicas se não existirem
    if (typeof window.logInfo === 'undefined') {
        window.logInfo = (msg) => console.log(`ℹ️ [INFO] ${msg}`);
        window.logSuccess = (msg) => console.log(`✅ [SUCCESS] ${msg}`);
        window.logError = (msg) => console.error(`❌ [ERROR] ${msg}`);
    }
    
    if (typeof window.showLoading === 'undefined') {
        window.showLoading = (container, message) => {
            console.log(`🔄 Loading: ${message}`);
        };
        window.hideLoading = () => {
            console.log('✅ Loading removido');
        };
    }
    
    // Tentar inicializar mesmo com funções faltando
    setTimeout(() => {
        if (typeof window.initApp === 'function') {
            window.initApp();
        } else {
            location.reload();
        }
    }, 1000);
};

// =================== FUNÇÕES DE UTILIDADE (MANTIDAS DO ORIGINAL) ===================
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

// =================== GERENCIAMENTO DE ESTADO (MANTIDO DO ORIGINAL) ===================
window.getSystemState = function() {
    return {
        authenticated: window.isAuthenticated || false,
        currentView: window.currentView || 'leitos',
        currentHospital: window.currentHospital || 'H1',
        hospitalsData: window.hospitalData || {},
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
            
            // Restaurar apenas dados seguros (não autenticação)
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

// =================== TRATAMENTO DE ERROS GLOBAIS (MANTIDO + MELHORADO) ===================
window.addEventListener('error', function(event) {
    if (typeof window.logError === 'function') {
        logError('Erro JavaScript:', event.error);
    } else {
        console.error('❌ Erro JavaScript:', event.error);
    }
    
    // Mostrar erro detalhado no console
    if (event.error && event.error.stack) {
        console.group('🔍 Detalhes do Erro:');
        console.error('Mensagem:', event.error.message);
        console.error('Arquivo:', event.filename);
        console.error('Linha:', event.lineno);
        console.error('Stack:', event.error.stack);
        console.groupEnd();
    }
    
    // *** CORREÇÃO: TENTAR RECUPERAÇÃO AUTOMÁTICA ***
    if (event.error && event.error.message) {
        const errorMsg = event.error.message.toLowerCase();
        if (errorMsg.includes('chart') || errorMsg.includes('canvas')) {
            setTimeout(() => {
                garantirChartJS().then(() => {
                    logSuccess('Chart.js recarregado após erro');
                });
            }, 1000);
        }
    }
});

window.addEventListener('unhandledrejection', function(event) {
    if (typeof window.logError === 'function') {
        logError('Promise rejeitada:', event.reason);
    } else {
        console.error('❌ Promise rejeitada:', event.reason);
    }
    event.preventDefault();
});

// =================== RESPONSIVIDADE (MANTIDA + MELHORADA) ===================
window.addEventListener('resize', function() {
    // Fechar menu em telas grandes
    if (window.innerWidth > 1024) {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        
        if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.classList.remove('menu-open');
        }
    }
    
    // *** CORREÇÃO: RE-RENDERIZAR GRÁFICOS COM DEBOUNCE ***
    if (window.chartInstances && Object.keys(window.chartInstances).length > 0) {
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            Object.values(window.chartInstances).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    try {
                        chart.resize();
                    } catch (error) {
                        console.warn('Erro ao redimensionar gráfico:', error);
                    }
                }
            });
        }, 300);
    }
});

// =================== ATALHOS DE TECLADO (MANTIDOS + MELHORADOS) ===================
document.addEventListener('keydown', function(event) {
    // *** CORREÇÃO: NÃO INTERCEPTAR SE USUÁRIO ESTÁ DIGITANDO ***
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        return;
    }
    
    // Alt + 1, 2, 3 para navegar entre tabs
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
            case 'u':
            case 'U':
                event.preventDefault();
                if (window.updateData) window.updateData();
                break;
        }
    }
    
    // Esc para fechar modais
    if (event.key === 'Escape') {
        // Fechar menu lateral
        const menu = document.getElementById('sideMenu');
        if (menu && menu.classList.contains('open')) {
            if (window.toggleMenu) window.toggleMenu();
        }
        
        // Fechar modais administrativos
        const adminModal = document.querySelector('.admin-modal');
        const adminPanel = document.querySelector('.admin-panel');
        if (adminModal && window.closeAdminModal) {
            window.closeAdminModal();
        } else if (adminPanel && window.closeAdminPanel) {
            window.closeAdminPanel();
        }
        
        // Fechar outros modais
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, [onclick*="close"]');
            if (closeBtn) closeBtn.click();
        });
    }
    
    // *** CORREÇÃO: F5 OU CTRL+R PARA ATUALIZAR DADOS ***
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
    
    // Ctrl + Alt + A para área administrativa
    if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        if (window.openAdmin) {
            window.openAdmin();
        }
    }
    
    // *** CORREÇÃO: CTRL + ALT + D PARA DIAGNÓSTICO RÁPIDO ***
    if (event.ctrlKey && event.altKey && event.key === 'd') {
        event.preventDefault();
        if (window.diagnosticoSistema) {
            window.testeRapido();
        }
    }
});

// =================== LIFECYCLE HOOKS (MANTIDOS) ===================
window.addEventListener('beforeunload', function(event) {
    // Salvar estado antes de sair
    if (window.saveSystemState) {
        window.saveSystemState();
    }
    
    // Limpar timers
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    if (window.qrTimeoutTimer) {
        clearInterval(window.qrTimeoutTimer);
    }
    
    // *** CORREÇÃO: LIMPAR GRÁFICOS PARA LIBERAR MEMÓRIA ***
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (error) {
                    console.warn('Erro ao destruir gráfico:', error);
                }
            }
        });
    }
    
    logInfo('🧹 Recursos limpos antes do unload');
});

// =================== DETECÇÃO DE CONECTIVIDADE (MANTIDA + MELHORADA) ===================
window.addEventListener('online', function() {
    if (typeof window.logSuccess === 'function') {
        logSuccess('🌐 Conexão restaurada');
    }
    
    // Testar API quando voltar online
    if (window.isAuthenticated && window.testAPI) {
        setTimeout(() => {
            window.testAPI().catch(error => {
                logError('Erro ao testar API após reconexão:', error);
            });
        }, 2000);
    }
    
    // Atualizar dados quando voltar online
    if (window.isAuthenticated && window.loadHospitalData) {
        setTimeout(() => {
            if (!window.isLoading) {
                window.updateData();
            }
        }, 3000);
    }
});

window.addEventListener('offline', function() {
    if (typeof window.logInfo === 'function') {
        logInfo('📡 Sem conexão - sistema funcionando em modo offline');
    }
});

// =================== PERFORMANCE MONITORING (MANTIDO + MELHORADO) ===================
window.addEventListener('load', function() {
    // Medir performance de carregamento
    if (performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 Página carregada em ${loadTime}ms`);
        
        // *** CORREÇÃO: LOG PERFORMANCE DETALHADO ***
        const perfData = {
            'DNS Lookup': performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
            'TCP Connect': performance.timing.connectEnd - performance.timing.connectStart,
            'Request': performance.timing.responseStart - performance.timing.requestStart,
            'Response': performance.timing.responseEnd - performance.timing.responseStart,
            'DOM Processing': performance.timing.domComplete - performance.timing.domLoading
        };
        
        console.table(perfData);
    }
    
    // *** CORREÇÃO: VERIFICAR MAIS MÓDULOS CRÍTICOS ***
    const requiredModules = [
        'CONFIG', 'loadHospitalData', 'renderCards', 
        'renderDashboardHospitalar', 'renderDashboardExecutivo',
        'authenticate', 'setActiveTab', 'API_URL',
        'renderChartByType', 'showLoading', 'hideLoading'
    ];
    
    const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
    
    if (missingModules.length > 0) {
        logError('❌ Módulos não carregados:', missingModules.join(', '));
        
        // Tentar carregar módulos faltantes após um tempo
        setTimeout(() => {
            const stillMissing = requiredModules.filter(module => typeof window[module] === 'undefined');
            if (stillMissing.length === 0) {
                logSuccess('✅ Todos os módulos carregados após retry');
            } else {
                logError('⚠️  Módulos ainda faltando:', stillMissing.join(', '));
            }
        }, 3000);
    } else {
        logSuccess('✅ Todos os módulos críticos carregados');
    }
    
    // *** CORREÇÃO: LOG DA ESTRUTURA MAIS DETALHADO ***
    console.log('📁 Estrutura do sistema:', {
        hospitais: window.CONFIG?.HOSPITAIS ? Object.keys(window.CONFIG.HOSPITAIS).length : 0,
        apiUrl: window.API_URL ? 'Configurada' : 'Não configurada',
        cores: window.CHART_COLORS ? Object.keys(window.CHART_COLORS).length : 0,
        autenticacao: window.isAuthenticated ? 'Logado' : 'Não logado',
        graficos: window.chartInstances ? Object.keys(window.chartInstances).length : 0,
        loading: window.loadingOverlay ? 'Sistema ativo' : 'Não inicializado',
        funcoesCriticas: requiredModules.filter(module => typeof window[module] !== 'undefined').length
    });
});

// =================== MONITORAMENTO DA API (MANTIDO + MELHORADO) ===================
window.monitorAPI = function() {
    if (!window.API_URL || !window.testAPI) return;
    
    const interval = 5 * 60 * 1000; // 5 minutos
    
    setInterval(async () => {
        if (!window.isLoading) { // *** CORREÇÃO: NÃO MONITORAR DURANTE LOADING ***
            try {
                const startTime = performance.now();
                await window.testAPI();
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                
                if (responseTime > 5000) {
                    logError(`API lenta: ${responseTime}ms`);
                } else {
                    // API funcionando
                }
            } catch (error) {
                if (typeof window.logError === 'function') {
                    logError('API não responsiva:', error);
                }
            }
        }
    }, interval);
};

// =================== HEALTH CHECK SYSTEM (MANTIDO + MELHORADO) ===================
window.systemHealthCheck = function() {
    const checks = {
        modules: typeof window.CONFIG !== 'undefined',
        api: typeof window.API_URL !== 'undefined',
        charts: typeof window.renderChartByType !== 'undefined',
        colors: typeof window.CHART_COLORS !== 'undefined',
        authentication: typeof window.authenticate !== 'undefined',
        data: typeof window.hospitalData !== 'undefined',
        loading: typeof window.showLoading !== 'undefined',
        dashboards: typeof window.renderDashboardHospitalar !== 'undefined' && 
                   typeof window.renderDashboardExecutivo !== 'undefined',
        chartJS: typeof Chart !== 'undefined' // *** CORREÇÃO: VERIFICAR CHART.JS ***
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`🏥 System Health: ${passed}/${total} checks passed (${percentage}%)`);
    console.table(checks);
    
    // *** CORREÇÃO: STATUS VISUAL MELHORADO ***
    if (percentage >= 100) {
        console.log('%c✅ Sistema 100% operacional', 'color: #10b981; font-weight: bold; font-size: 16px;');
    } else if (percentage >= 80) {
        console.log('%c⚠️  Sistema parcialmente operacional', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
    } else {
        console.log('%c❌ Sistema com problemas críticos', 'color: #ef4444; font-weight: bold; font-size: 16px;');
    }
    
    return { passed, total, percentage, checks };
};

// =================== CORREÇÕES AUTOMÁTICAS - TODAS MANTIDAS DO ORIGINAL ===================

// =================== AUTO-CORREÇÃO DE CONTAINERS ===================
function verificarContainersDashboard() {
    const containers = [
        { id: 'dashExecutivoContent', section: 'dash2' },
        { id: 'dashHospitalarContent', section: 'dash1' }
    ];
    
    containers.forEach(({ id, section }) => {
        let container = document.getElementById(id);
        if (!container) {
            const section_element = document.getElementById(section);
            if (section_element) {
                container = document.createElement('div');
                container.id = id;
                section_element.appendChild(container);
                logInfo(`✅ Container ${id} criado automaticamente`);
            }
        }
    });
}

// =================== DIAGNÓSTICO AUTOMÁTICO ===================
window.diagnosticoSistema = function() {
    const diagnostico = {
        hospitalData: !!window.hospitalData,
        hospitalDataCount: window.hospitalData ? Object.keys(window.hospitalData).length : 0,
        chartJS: typeof Chart !== 'undefined',
        containers: {
            dashExecutivoContent: !!document.getElementById('dashExecutivoContent'),
            dashHospitalarContent: !!document.getElementById('dashHospitalarContent')
        },
        functions: {
            renderDashboardExecutivo: typeof window.renderDashboardExecutivo === 'function',
            renderDashboardHospitalar: typeof window.renderDashboardHospitalar === 'function',
            loadHospitalData: typeof window.loadHospitalData === 'function',
            renderChartByType: typeof window.renderChartByType === 'function' // *** CORREÇÃO ***
        },
        api: !!window.API_URL,
        loading: typeof window.showLoading === 'function',
        authentication: window.isAuthenticated || false
    };
    
    console.log('🔍 DIAGNÓSTICO DO SISTEMA:', diagnostico);
    
    // Lista de problemas encontrados
    const problemas = [];
    const solucoes = [];
    
    if (!diagnostico.hospitalData) {
        problemas.push('❌ Dados dos hospitais não carregados');
        solucoes.push('window.loadHospitalData()');
    }
    
    if (!diagnostico.chartJS) {
        problemas.push('❌ Chart.js não disponível');
        solucoes.push('garantirChartJS()');
    }
    
    if (!diagnostico.containers.dashExecutivoContent || !diagnostico.containers.dashHospitalarContent) {
        problemas.push('❌ Containers dos dashboards faltando');
        solucoes.push('verificarContainersDashboard()');
    }
    
    if (!diagnostico.functions.renderChartByType) {
        problemas.push('❌ Sistema de gráficos corrigido não carregado');
        solucoes.push('Recarregar charts.js');
    }
    
    if (problemas.length === 0) {
        console.log('✅ Sistema funcionando corretamente!');
    } else {
        console.log('⚠️ PROBLEMAS ENCONTRADOS:', problemas);
        console.log('🔧 SOLUÇÕES:', solucoes);
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
        
        logInfo('📊 Carregando Chart.js dinamicamente...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
        script.onload = () => {
            if (typeof Chart !== 'undefined') {
                logSuccess('✅ Chart.js carregado com sucesso');
                resolve(Chart);
            } else {
                reject(new Error('Falha ao carregar Chart.js'));
            }
        };
        script.onerror = () => reject(new Error('Erro no carregamento do Chart.js'));
        document.head.appendChild(script);
    });
}

// =================== FORÇAR RENDERIZAÇÃO DOS DASHBOARDS ===================
window.forcarRenderizacao = function() {
    logInfo('🔄 Forçando renderização dos dashboards...');
    
    // 1. Verificar containers
    verificarContainersDashboard();
    
    // 2. Renderizar dashboards
    setTimeout(() => {
        try {
            if (window.renderDashboardExecutivo) {
                window.renderDashboardExecutivo();
                logSuccess('✅ Dashboard Executivo forçado');
            }
        } catch (error) {
            logError('❌ Erro no Dashboard Executivo:', error);
        }
        
        try {
            if (window.renderDashboardHospitalar) {
                window.renderDashboardHospitalar();
                logSuccess('✅ Dashboard Hospitalar forçado');
            }
        } catch (error) {
            logError('❌ Erro no Dashboard Hospitalar:', error);
        }
    }, 500);
};

// =================== TESTE RÁPIDO ===================
window.testeRapido = function() {
    console.log('🧪 EXECUTANDO TESTE RÁPIDO...');
    
    const resultado = window.diagnosticoSistema();
    
    // Aplicar correções automáticas
    if (resultado.problemas.length > 0) {
        console.log('🔧 Aplicando correções automáticas...');
        
        // Carregar dados se necessário
        if (!window.hospitalData && window.loadHospitalData) {
            window.loadHospitalData().then(() => {
                logSuccess('✅ Dados carregados automaticamente');
                setTimeout(() => window.forcarRenderizacao(), 1000);
            });
        }
        
        // Garantir Chart.js
        garantirChartJS().then(() => {
            logSuccess('✅ Chart.js disponível');
        });
        
        // Verificar containers
        verificarContainersDashboard();
        
        // Forçar renderização
        setTimeout(() => window.forcarRenderizacao(), 2000);
    } else {
        window.forcarRenderizacao();
    }
    
    return resultado;
};

// =================== HOOK NO SISTEMA DE NAVEGAÇÃO ===================
const setActiveTabOriginal = window.setActiveTab;
window.setActiveTab = function(tab) {
    // *** CORREÇÃO: BLOQUEAR DURANTE LOADING ***
    if (window.isLoading) {
        logInfo('Navegação bloqueada durante carregamento');
        return;
    }
    
    // Verificar containers antes de navegar
    verificarContainersDashboard();
    
    // Chamar função original
    if (setActiveTabOriginal) {
        setActiveTabOriginal(tab);
    }
    
    // *** CORREÇÃO: RENDERIZAR DASHBOARDS APÓS MUDANÇA COM DELAY ***
    setTimeout(() => {
        if (tab === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
    }, 500); // *** CORREÇÃO: DELAY MAIOR PARA ESTABILIDADE ***
};

// =================== ADICIONAR BOTÃO DE DIAGNÓSTICO ===================
function adicionarBotaoDiagnostico() {
    const menuFooter = document.querySelector('.menu-footer');
    if (menuFooter && !document.getElementById('btn-diagnostico')) {
        const botao = document.createElement('button');
        botao.id = 'btn-diagnostico';
        botao.className = 'menu-config';
        botao.innerHTML = '<span>🔧</span> Diagnóstico & Correção';
        botao.style.cssText = `
            display: flex;
            align-items: center;
            width: 100%;
            padding: 12px 16px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s;
        `;
        
        botao.onclick = () => {
            const resultado = window.diagnosticoSistema();
            
            let mensagem = '🔍 DIAGNÓSTICO DO SISTEMA\n\n';
            
            if (resultado.problemas.length === 0) {
                mensagem += '✅ SISTEMA OK!\n';
                mensagem += `📊 Hospitais: ${resultado.diagnostico.hospitalDataCount}\n`;
                mensagem += `📈 Chart.js: ${resultado.diagnostico.chartJS ? 'OK' : 'Carregando...'}\n`;
                mensagem += `📦 Containers: OK\n`;
                mensagem += `🔧 Gráficos Corrigidos: ${resultado.diagnostico.functions.renderChartByType ? 'OK' : 'Faltando'}\n\n`;
                mensagem += '🔄 Forçando renderização dos gráficos...';
            } else {
                mensagem += '⚠️ PROBLEMAS ENCONTRADOS:\n';
                resultado.problemas.forEach(p => mensagem += `${p}\n`);
                mensagem += '\n🔧 APLICANDO CORREÇÕES AUTOMÁTICAS...\n';
                resultado.solucoes.forEach(s => mensagem += `• ${s}\n`);
            }
            
            alert(mensagem);
            
            // Executar correções
            setTimeout(() => window.testeRapido(), 500);
        };
        
        botao.onmouseover = () => {
            botao.style.background = 'rgba(255, 255, 255, 0.2)';
            botao.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        };
        
        botao.onmouseout = () => {
            botao.style.background = 'rgba(255, 255, 255, 0.1)';
            botao.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        };
        
        menuFooter.appendChild(botao);
        logSuccess('✅ Botão de diagnóstico adicionado ao menu');
    }
}

// =================== COMANDOS DE CONSOLE (MANTIDOS + MELHORADOS) ===================
window.debug = window.debug || {};
Object.assign(window.debug, {
    diagnostico: window.diagnosticoSistema,
    forcar: window.forcarRenderizacao,
    teste: window.testeRapido,
    dados: () => window.hospitalData,
    graficos: () => window.chartInstances,
    estado: window.getSystemState,
    saude: window.systemHealthCheck,
    recarregar: async () => {
        if (window.loadHospitalData) {
            await window.loadHospitalData();
            setTimeout(() => window.forcarRenderizacao(), 1000);
            return window.hospitalData;
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

// =================== OBSERVER PARA MUDANÇAS DE TAB ===================
const observarMudancasTab = () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                if (target.id === 'dash1' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardHospitalar) {
                            window.renderDashboardHospitalar();
                        }
                    }, 300); // *** CORREÇÃO: DELAY MAIOR ***
                } else if (target.id === 'dash2' && !target.classList.contains('hidden')) {
                    setTimeout(() => {
                        verificarContainersDashboard();
                        if (window.renderDashboardExecutivo) {
                            window.renderDashboardExecutivo();
                        }
                    }, 300); // *** CORREÇÃO: DELAY MAIOR ***
                }
            }
        });
    });
    
    const dash1 = document.getElementById('dash1');
    const dash2 = document.getElementById('dash2');
    
    if (dash1) observer.observe(dash1, { attributes: true });
    if (dash2) observer.observe(dash2, { attributes: true });
};

// =================== INICIALIZAÇÃO AUTOMÁTICA ===================
setTimeout(() => {
    logInfo('🚀 Iniciando correções automáticas...');
    
    // 1. Carregar estado do sistema
    window.loadSystemState();
    
    // 2. Adicionar botão de diagnóstico
    adicionarBotaoDiagnostico();
    
    // 3. Garantir Chart.js
    garantirChartJS().catch(() => {
        logError('Erro ao carregar Chart.js - alguns gráficos podem não funcionar');
    });
    
    // 4. Verificar containers
    verificarContainersDashboard();
    
    // 5. Se não há dados, tentar carregar
    if (!window.hospitalData && window.loadHospitalData) {
        logInfo('📊 Carregando dados dos hospitais...');
        window.loadHospitalData().then(() => {
            logSuccess('✅ Dados carregados automaticamente');
            setTimeout(() => {
                // Renderizar dashboards baseado na view atual
                if (window.currentView === 'dash1') {
                    window.renderDashboardHospitalar();
                } else if (window.currentView === 'dash2') {
                    window.renderDashboardExecutivo();
                }
            }, 1000);
        }).catch(error => {
            logError('Erro ao carregar dados:', error);
        });
    }
    
    // 6. Iniciar monitoramento da API
    if (window.monitorAPI) {
        window.monitorAPI();
    }
    
    // 7. Executar health check e correções após tudo
    setTimeout(() => {
        const resultado = window.systemHealthCheck();
        const diagnostico = window.diagnosticoSistema();
        
        if (diagnostico.problemas.length > 0) {
            console.log('🔧 Executando correções finais...');
            window.testeRapido();
        } else {
            logSuccess('✅ Sistema inicializado corretamente');
        }
    }, 5000);
    
}, 4000);

// =================== OBSERVER SETUP ===================
setTimeout(observarMudancasTab, 3000);

// =================== LOGS FINAIS ===================
console.log('%c🚀 ARCHIPELAGO DASHBOARD V3.0 - SISTEMA COMPLETO CORRIGIDO', 'color: #60a5fa; font-size: 16px; font-weight: bold;');
console.log('%c📋 CORREÇÕES IMPLEMENTADAS:', 'color: #10b981; font-weight: bold;');
console.log('%c   ✅ Loading com bloqueio total da interface', 'color: #10b981;');
console.log('%c   ✅ Beneficiários sempre números inteiros', 'color: #10b981;');
console.log('%c   ✅ Dashboard Executivo: Rede Hospitalar Externa + Gauge horizontal', 'color: #10b981;');
console.log('%c   ✅ Dashboard Hospitalar: Layout vertical obrigatório', 'color: #10b981;');
console.log('%c   ✅ Eixos horizontais: Hoje, 24h, 48h, 72h, 96h', 'color: #10b981;');
console.log('%c   ✅ Legendas posicionadas à esquerda, uma por linha', 'color: #10b981;');
console.log('%c   ✅ Eixo Y sempre mostra "Beneficiários"', 'color: #10b981;');
console.log('%c   ✅ 7 tipos de gráfico: Barras, Barras 3D, Linhas, Área, Bolinhas, Radar, Rosca', 'color: #10b981;');
console.log('%c   ✅ Divisão Ouro/2R/3R nas colunas Hoje e 24h', 'color: #10b981;');
console.log('%c   ✅ Linhas com transição suave (tension: 0.4)', 'color: #10b981;');

console.log(`
🔧 SISTEMA DE CORREÇÕES ATIVO

Comandos disponíveis:
• window.debug.teste() - Teste rápido + correções
• window.debug.diagnostico() - Diagnóstico completo  
• window.debug.forcar() - Forçar renderização
• window.debug.recarregar() - Recarregar dados da API
• window.debug.dados() - Ver dados carregados
• window.debug.limpar() - Limpar gráficos
• window.debug.estado() - Estado do sistema
• window.debug.saude() - Health check completo

🔧 Botão "Diagnóstico & Correção" adicionado ao menu lateral.
🤖 Correções automáticas ativas - gráficos serão carregados automaticamente.
📊 Sistema pronto para uso com todas as correções implementadas!
`);
