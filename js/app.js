// =================== APP.JS - ARQUIVO PRINCIPAL CORRIGIDO V3.1 ===================

// =================== CONFIGURAÇÕES GLOBAIS V3.1 ===================
window.CONFIG = {
    AUTH_PASSWORD: '170284',
    ADM_EMAIL: 'cvcalessandro@gmail.com',
    ADM_PASSWORD: '9446',
    REFRESH_INTERVAL: 240000, // 4 minutos
    QR_TIMEOUT: 120000, // 2 minutos
    HOSPITAIS: {
        // *** CORREÇÃO V3.1: ATUALIZAR 49→66 leitos (H1:10, H2:36, H3:13, H4:7) ***
        H1: { nome: "Neomater", leitos: 10, ativo: true },
        H2: { nome: "Cruz Azul", leitos: 36, ativo: true },
        H3: { nome: "Santa Marcelina", leitos: 13, ativo: true },
        H4: { nome: "Santa Clara", leitos: 7, ativo: true }
    }
};

// =================== VARIÁVEIS GLOBAIS ===================
window.currentHospital = 'H1'; // *** SEMPRE INICIA COM NEOMATER ***
window.currentView = 'leitos';
window.isAuthenticated = false;
window.refreshTimer = null;
window.timerInterval = null;
window.isLoading = false; // *** NOVO: CONTROLE DE LOADING ***
window.loadingOverlay = null; // *** NOVO: OVERLAY GLOBAL ***

// =================== FUNÇÕES DE LOG (GLOBAIS) ===================
window.logInfo = function(msg) {
    console.log(`ℹ️ [INFO] ${msg}`);
};

window.logSuccess = function(msg) {
    console.log(`✅ [SUCCESS] ${msg}`);
};

window.logError = function(msg, error = null) {
    console.error(`❌ [ERROR] ${msg}`, error || '');
};

// =================== SISTEMA DE LOADING MELHORADO COM BLOQUEIO ===================
window.showLoading = function(container = null, message = 'Carregando dados...') {
    window.isLoading = true;
    
    // *** CRIAR OVERLAY GLOBAL QUE BLOQUEIA TODA A INTERFACE ***
    if (!window.loadingOverlay) {
        window.loadingOverlay = document.createElement('div');
        window.loadingOverlay.id = 'globalLoadingOverlay';
        window.loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(26, 31, 46, 0.98);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(4px);
            color: white;
            text-align: center;
            animation: fadeIn 0.3s ease-in;
        `;
        document.body.appendChild(window.loadingOverlay);
    }
    
    // *** CONTEÚDO DO LOADING ***
    const loadingHTML = `
        <div class="loading-content" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 400px;
            padding: 40px;
            background: rgba(26, 31, 46, 0.95);
            border-radius: 16px;
            border: 1px solid rgba(96, 165, 250, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        ">
            <div class="spinner" style="
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-left-color: #60a5fa;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 24px;
            "></div>
            <h3 style="margin: 0 0 12px 0; font-size: 20px; color: #60a5fa; font-weight: 700;">
                ${message}
            </h3>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                ⚡ Sistema bloqueado durante carregamento
            </p>
            <div style="margin-top: 16px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
                Por favor, aguarde...
            </div>
        </div>
    `;
    
    window.loadingOverlay.innerHTML = loadingHTML;
    window.loadingOverlay.style.display = 'flex';
    
    // *** BLOQUEAR TODOS OS CLIQUES E INTERAÇÕES ***
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
    window.loadingOverlay.style.pointerEvents = 'all';
    
    // *** ADICIONAR CSS DA ANIMAÇÃO SE NÃO EXISTIR ***
    if (!document.getElementById('loadingStyles')) {
        const style = document.createElement('style');
        style.id = 'loadingStyles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .loading-content {
                animation: fadeIn 0.4s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
    
    logInfo(`Loading ativado: ${message}`);
};

window.hideLoading = function() {
    if (!window.isLoading) return;
    
    window.isLoading = false;
    
    // *** REMOVER OVERLAY E DESBLOQUEAR INTERFACE ***
    if (window.loadingOverlay) {
        // Animação de saída
        window.loadingOverlay.style.animation = 'fadeOut 0.3s ease-out';
        window.loadingOverlay.style.opacity = '0';
        
        setTimeout(() => {
            if (window.loadingOverlay && window.loadingOverlay.parentNode) {
                window.loadingOverlay.style.display = 'none';
            }
            
            // *** DESBLOQUEAR INTERFACE ***
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
        }, 300);
    }
    
    logSuccess('Loading removido - Interface desbloqueada');
};

// =================== VERIFICAÇÃO DE AUTENTICAÇÃO ===================
window.checkAuthentication = function() {
    // Verificar se já está autenticado (sessionStorage)
    const isAuth = sessionStorage.getItem('archipelago_authenticated');
    if (isAuth === 'true') {
        window.isAuthenticated = true;
        return true;
    }
    return false;
};

// =================== MOSTRAR MODAL DE AUTENTICAÇÃO ===================
window.showAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Focar no campo de senha
        setTimeout(() => {
            const passwordField = document.getElementById('authPassword');
            if (passwordField) {
                passwordField.focus();
            }
        }, 100);
    }
};

// =================== AUTENTICAÇÃO ===================
window.authenticate = function() {
    const password = document.getElementById('authPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (password === CONFIG.AUTH_PASSWORD) {
        window.isAuthenticated = true;
        
        // Salvar autenticação na sessão
        sessionStorage.setItem('archipelago_authenticated', 'true');
        
        // Esconder modal e mostrar sistema
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // *** INICIALIZAR SISTEMA COM LOADING TOTAL ***
        window.initSystem();
        logSuccess('Autenticação bem-sucedida');
    } else {
        if (errorDiv) {
            errorDiv.textContent = 'Senha incorreta. Tente novamente.';
            errorDiv.classList.remove('hidden');
        }
        document.getElementById('authPassword').value = '';
        logError('Senha incorreta');
    }
};

// =================== INICIALIZAÇÃO DO SISTEMA (CORRIGIDA COM BLOQUEIO) ===================
window.initSystem = async function() {
    logInfo('Inicializando sistema Archipelago Dashboard V3.1...');
    
    try {
        // *** FASE 1: LOADING INICIAL ***
        showLoading(null, 'Inicializando sistema V3.1...');
        await delay(800);
        
        // *** FASE 2: TESTAR API ***
        if (window.testAPI) {
            showLoading(null, 'Testando conexão com API...');
            await window.testAPI();
            await delay(500);
        }
        
        // *** FASE 3: CARREGAR DADOS DOS HOSPITAIS ***
        if (window.loadHospitalData) {
            showLoading(null, 'Carregando dados dos 66 leitos...');
            await window.loadHospitalData();
            await delay(800);
        }
        
        // *** FASE 4: INICIALIZAR COMPONENTES ***
        showLoading(null, 'Inicializando componentes...');
        
        // Iniciar timer de atualização
        window.startTimer();
        await delay(300);
        
        // *** FASE 5: RENDERIZAR VIEW INICIAL ***
        showLoading(null, 'Preparando interface...');
        window.setActiveTab('leitos');
        await delay(500);
        
        // *** FASE 6: CARREGAR NEOMATER AUTOMATICAMENTE ***
        if (window.renderCards) {
            showLoading(null, 'Carregando 10 leitos do Neomater...');
            await delay(600);
            window.renderCards();
            await delay(400);
        }
        
        // *** FINALIZAR: REMOVER LOADING E LIBERAR SISTEMA ***
        hideLoading();
        logSuccess('✅ Sistema V3.1 inicializado! Configuração: 66 leitos (H1:10, H2:36, H3:13, H4:7)');
        
    } catch (error) {
        logError('Erro na inicialização V3.1:', error);
        hideLoading();
        alert('Erro ao inicializar o sistema. Verifique a conexão e tente recarregar a página.');
        
        // Tentar inicialização básica mesmo com erro
        setTimeout(() => {
            window.setActiveTab('leitos');
            if (window.renderCards) {
                window.renderCards();
            }
        }, 2000);
    }
};

// =================== FUNÇÃO AUXILIAR PARA DELAYS ===================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =================== NAVEGAÇÃO ENTRE TABS (CORRIGIDO COM LOADING) ===================
window.setActiveTab = function(tab) {
    // *** VERIFICAR SE JÁ ESTÁ EM LOADING PARA EVITAR CONFLITOS ***
    if (window.isLoading) {
        logInfo('Sistema em carregamento - aguarde...');
        return;
    }
    
    logInfo(`Mudando para tab: ${tab}`);
    window.currentView = tab;
    
    // Esconder todas as seções
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar seção ativa
    let activeSection;
    if (tab === 'leitos') {
        activeSection = document.getElementById('leitosView');
    } else if (tab === 'dash1') {
        activeSection = document.getElementById('dash1');
    } else if (tab === 'dash2') {
        activeSection = document.getElementById('dash2');
    }
    
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
    
    // Atualizar menu lateral
    document.querySelectorAll('.side-menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        }
    });
    
    // *** FECHAR MENU AUTOMATICAMENTE APÓS CLICAR ***
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    }
    
    // *** RENDERIZAR CONTEÚDO COM LOADING ESPECÍFICO ***
    setTimeout(() => {
        if (tab === 'leitos' && window.renderCards) {
            // Se não há dados, mostrar loading e carregar
            if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
                showLoading(null, 'Carregando dados dos 66 leitos...');
                if (window.loadHospitalData) {
                    window.loadHospitalData().then(() => {
                        setTimeout(() => {
                            window.renderCards();
                            hideLoading();
                        }, 500);
                    }).catch((error) => {
                        logError('Erro ao carregar dados:', error);
                        hideLoading();
                    });
                }
            } else {
                window.renderCards();
            }
        } else if (tab === 'dash1' && window.renderDashboardHospitalar) {
            showLoading(null, 'Carregando Dashboard Hospitalar...');
            setTimeout(() => {
                window.renderDashboardHospitalar();
                hideLoading();
            }, 1000);
        } else if (tab === 'dash2' && window.renderDashboardExecutivo) {
            showLoading(null, 'Carregando Dashboard Executivo...');
            setTimeout(() => {
                window.renderDashboardExecutivo();
                hideLoading();
            }, 1000);
        }
    }, 100);
};

// =================== MENU LATERAL ===================
window.toggleMenu = function() {
    // *** NÃO PERMITIR ABERTURA DO MENU DURANTE LOADING ***
    if (window.isLoading) {
        logInfo('Menu bloqueado durante carregamento');
        return;
    }
    
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    } else {
        menu.classList.add('open');
        if (overlay) overlay.classList.add('show');
        document.body.classList.add('menu-open');
    }
};

// =================== ATUALIZAÇÃO DE DADOS (CORRIGIDO COM LOADING) ===================
window.updateData = async function() {
    if (window.isLoading) {
        logInfo('Atualização bloqueada - sistema já está carregando');
        return;
    }
    
    logInfo('Iniciando atualização manual de dados V3.1...');
    
    try {
        showLoading(null, 'Atualizando 66 leitos...');
        
        // Carregar dados dos hospitais
        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        
        await delay(800);
        
        // Re-renderizar view atual
        if (window.currentView === 'leitos' && window.renderCards) {
            window.renderCards();
        } else if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        } else if (window.currentView === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
        
        hideLoading();
        logSuccess('Dados V3.1 atualizados com sucesso');
        
    } catch (error) {
        logError('Erro na atualização V3.1:', error);
        hideLoading();
        alert('Erro ao atualizar dados. Verifique a conexão com a internet.');
    }
};

// =================== SELEÇÃO DE HOSPITAL (CORRIGIDO COM LOADING) ===================
window.selectHospital = function(hospitalId) {
    // *** BLOQUEAR SELEÇÃO DURANTE LOADING ***
    if (window.isLoading) {
        logInfo('Seleção de hospital bloqueada durante carregamento');
        return;
    }
    
    // *** VERIFICAR SE HOSPITAL ESTÁ ATIVO ***
    if (!CONFIG.HOSPITAIS[hospitalId] || !CONFIG.HOSPITAIS[hospitalId].ativo) {
        logInfo(`Hospital ${hospitalId} está desabilitado`);
        return;
    }
    
    window.currentHospital = hospitalId;
    
    // Atualizar botões
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-hospital="${hospitalId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // *** RE-RENDERIZAR CARDS COM LOADING ***
    if (window.renderCards) {
        const hospitalConfig = CONFIG.HOSPITAIS[hospitalId];
        showLoading(null, `Carregando ${hospitalConfig.leitos} leitos do ${hospitalConfig.nome}...`);
        setTimeout(() => {
            window.renderCards();
            hideLoading();
        }, 800);
    }
    
    logSuccess(`Hospital selecionado: ${CONFIG.HOSPITAIS[hospitalId].nome} (${CONFIG.HOSPITAIS[hospitalId].leitos} leitos)`);
};

// =================== FUNÇÕES DE CONFIGURAÇÃO ===================
window.openConfig = function() {
    if (window.isLoading) return;
    logInfo('Abrindo configurações');
    alert('Configurações em desenvolvimento');
};

window.openQRGenerator = function() {
    if (window.isLoading) return;
    if (window.openQRCodes) {
        window.openQRCodes();
    } else {
        logError('Sistema QR Code não carregado');
        alert('Sistema QR Code não disponível');
    }
};

// =================== MODAL FUNCTIONS ===================
window.closeModal = function() {
    if (window.isLoading) return;
    const modal = document.getElementById('patientModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.savePatient = function() {
    if (window.isLoading) return;
    // Implementar salvamento de paciente
    logInfo('Salvando paciente...');
    alert('Funcionalidade em desenvolvimento');
};

window.darAlta = function() {
    if (window.isLoading) return;
    if (confirm('Confirma a alta do paciente?')) {
        logInfo('Processando alta...');
        alert('Alta processada com sucesso!');
        window.closeModal();
    }
};

// =================== INICIALIZAÇÃO DO APP (CORRIGIDA) ===================
window.initApp = async function() {
    logInfo('🏥 Archipelago Dashboard V3.1 - Iniciando aplicação...');
    
    // Verificar autenticação
    if (window.checkAuthentication()) {
        // Já autenticado, mostrar sistema
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // *** INICIALIZAR SISTEMA COM LOADING COMPLETO ***
        await window.initSystem();
    } else {
        // Mostrar tela de autenticação
        window.showAuthModal();
        
        // Adicionar listener para Enter na senha
        const passwordField = document.getElementById('authPassword');
        if (passwordField) {
            passwordField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    window.authenticate();
                }
            });
        }
    }
    
    logSuccess('🚀 App V3.1 inicializado e pronto para uso');
};

// =================== GERENCIAR CORES (Para integração com Admin) ===================
window.restoreDefaultColors = function() {
    const defaultColors = {
        '--nav-header': '#3b82f6',
        '--nav-sidebar': '#60a5fa',
        '--status-vago': '#16a34a',
        '--status-uso': '#fbbf24',
        '--destaque': '#8FD3F4'
    };
    
    Object.entries(defaultColors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
    
    logSuccess('Cores padrão restauradas');
};

// =================== FUNÇÃO PARA OBTER HOSPITAIS ATIVOS ===================
window.getActiveHospitals = function() {
    return Object.entries(CONFIG.HOSPITAIS)
        .filter(([id, hospital]) => hospital.ativo)
        .map(([id, hospital]) => ({ id, ...hospital }));
};

// =================== FUNÇÃO PARA TOGGLEAR HOSPITAL ===================
window.toggleHospital = function(hospitalId, ativo) {
    if (CONFIG.HOSPITAIS[hospitalId]) {
        CONFIG.HOSPITAIS[hospitalId].ativo = ativo;
        
        // Atualizar interface
        const btn = document.querySelector(`[data-hospital="${hospitalId}"]`);
        if (btn) {
            if (ativo) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
                // Se hospital ativo foi desabilitado, mudar para H1
                if (window.currentHospital === hospitalId) {
                    window.selectHospital('H1');
                }
            }
        }
        
        logInfo(`Hospital ${hospitalId} ${ativo ? 'ativado' : 'desativado'}`);
        return true;
    }
    return false;
};

// =================== TIMER DE ATUALIZAÇÃO ===================
window.startTimer = function() {
    let countdown = 240; // 4 minutos em segundos
    
    const updateTimer = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        const timerElement = document.getElementById('updateTimer');
        
        if (timerElement) {
            timerElement.textContent = `Próxima atualização em: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (countdown <= 0) {
            // Auto-atualizar dados
            if (!window.isLoading) {
                window.updateData();
            }
            countdown = 240; // Reset para 4 minutos
        } else {
            countdown--;
        }
    };
    
    // Limpar timer existente
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    // Iniciar novo timer
    window.timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Executar imediatamente
    
    logInfo('Timer de atualização iniciado (4 minutos)');
};

// =================== LOG DE INICIALIZAÇÃO V3.1 ===================
logSuccess('📋 App.js V3.1 carregado - CORREÇÃO IMPLEMENTADA:');
logSuccess('🏥 Hospitais atualizados: H1:10, H2:36, H3:13, H4:7 leitos (66 total)');
logSuccess('✅ Sistema com loading bloqueante implementado');
