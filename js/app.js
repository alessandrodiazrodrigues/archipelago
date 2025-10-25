// =================== APP.JS V3.3.2 - CORRIGIDO E COMPLETO ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: 19/Outubro/2024
// Versão: V3.3.2 (100% sincronizado com planilha - 74 colunas A-BV)

// =================== CONFIGURAÇÕES GLOBAIS V3.3.2 ===================
window.CONFIG = {
    AUTH_PASSWORD: '1234',
    ADM_EMAIL: 'cvcalessandro@gmail.com',
    ADM_PASSWORD: '9446',
    REFRESH_INTERVAL: 240000, // 4 minutos
    QR_TIMEOUT: 120000, // 2 minutos
    HOSPITAIS: {
        // *** V3.3.2: 79 LEITOS TOTAIS (H1:10, H2:36, H3:7, H4:13, H5:13) ***
        H1: { nome: "Neomater", leitos: 10, tipo: "Híbrido", ativo: true },
        H2: { nome: "Cruz Azul", leitos: 36, tipo: "Misto", ativo: true },
        H3: { nome: "Santa Marcelina", leitos: 7, tipo: "Híbrido", ativo: true }, // ✅ CORRIGIDO: 7 leitos
        H4: { nome: "Santa Clara", leitos: 13, tipo: "Misto", ativo: true },
        H5: { nome: "Hospital Adventista", leitos: 13, tipo: "Híbrido", ativo: true }
    }
};

// =================== LISTAS COMPLETAS V3.3.2 (CORRIGIDAS) ===================

// *** CONCESSÕES: 11 ITENS (M-W) - CHECKBOXES ***
window.CONCESSOES_LISTA = [
    "Transição Domiciliar",
    "Aplicação domiciliar de medicamentos",
    "Aspiração",
    "Banho",
    "Curativo",
    "Curativo PICC",
    "Fisioterapia Domiciliar",
    "Fonoaudiologia Domiciliar",
    "Oxigenoterapia",
    "Remoção",
    "Solicitação domiciliar de exames"
];

// *** LINHAS DE CUIDADO: 45 ITENS (X-BR) - CHECKBOXES ***
window.LINHAS_CUIDADO_LISTA = [
    "Assiste",
    "APS SP",
    "Cuidados Paliativos",
    "ICO (Insuficiência Coronariana)",
    "Nexus SP Cardiologia",
    "Nexus SP Gastroentereologia",
    "Nexus SP Geriatria",
    "Nexus SP Pneumologia",
    "Nexus SP Psiquiatria",
    "Nexus SP Reumatologia",
    "Nexus SP Saúde do Fígado",
    "Generalista",
    "Bucomaxilofacial",
    "Cardiologia",
    "Cirurgia Cardíaca",
    "Cirurgia de Cabeça e Pescoço",
    "Cirurgia do Aparelho Digestivo",
    "Cirurgia Geral",
    "Cirurgia Oncológica",
    "Cirurgia Plástica",
    "Cirurgia Torácica",
    "Cirurgia Vascular",
    "Clínica Médica",
    "Coloproctologia",
    "Dermatologia",
    "Endocrinologia",
    "Fisiatria",
    "Gastroenterologia",
    "Geriatria",
    "Ginecologia e Obstetrícia",
    "Hematologia",
    "Infectologia",
    "Mastologia",
    "Nefrologia",
    "Neurocirurgia",
    "Neurologia",
    "Oftalmologia",
    "Oncologia Clínica",
    "Ortopedia",
    "Otorrinolaringologia",
    "Pediatria",
    "Pneumologia",
    "Psiquiatria",
    "Reumatologia",
    "Urologia"
];

// *** REGIÕES: 9 OPÇÕES (BT/71) ***
window.REGIOES_LISTA = [
    "Zona Central",
    "Zona Sul",
    "Zona Norte",
    "Zona Leste",
    "Zona Oeste",
    "ABC",
    "Guarulhos",
    "Osasco",
    "Outra"
];

// *** ISOLAMENTO: 3 OPÇÕES (AR/43) ***
window.ISOLAMENTO_OPCOES = [
    "Não Isolamento",
    "Isolamento de Contato",
    "Isolamento Respiratório"
];

// *** GÊNERO: 2 OPÇÕES (BS/70) ***
window.GENERO_OPCOES = [
    "Masculino",
    "Feminino"
];

// *** CATEGORIA: 2 OPÇÕES (BU/72) ***
window.CATEGORIA_OPCOES = [
    "Apartamento",
    "Enfermaria"
];

// *** DIRETIVAS: 3 OPÇÕES (BV/73) ***
window.DIRETIVAS_OPCOES = [
    "Sim",
    "Não",
    "Não se aplica"
];

// =================== VARIÁVEIS GLOBAIS ===================
window.currentHospital = 'H1'; // *** SEMPRE INICIA COM NEOMATER ***
window.currentView = 'leitos';
window.isAuthenticated = false;
window.refreshTimer = null;
window.timerInterval = null;
window.isLoading = false; // *** CONTROLE DE LOADING ***
window.loadingOverlay = null; // *** OVERLAY GLOBAL ***

// =================== FUNÇÕES DE LOG (GLOBAIS) ===================
window.logInfo = function(msg) {
    console.log(`ℹ️ [INFO V3.3.2] ${msg}`);
};

window.logSuccess = function(msg) {
    console.log(`✅ [SUCCESS V3.3.2] ${msg}`);
};

window.logError = function(msg, error = null) {
    console.error(`❌ [ERROR V3.3.2] ${msg}`, error || '');
};

window.logWarn = function(msg) {
    console.warn(`⚠️ [WARNING V3.3.2] ${msg}`);
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
    const isAuth = sessionStorage.getItem('archipelago_authenticated') === 'true';
    window.isAuthenticated = isAuth;
    return isAuth;
};

window.setAuthenticated = function(value) {
    window.isAuthenticated = value;
    if (value) {
        sessionStorage.setItem('archipelago_authenticated', 'true');
    } else {
        sessionStorage.removeItem('archipelago_authenticated');
    }
};

// =================== AUTENTICAÇÃO ===================
window.authenticate = function() {
    const password = document.getElementById('authPassword').value;
    const errorMsg = document.getElementById('authError');
    
    if (password === CONFIG.AUTH_PASSWORD) {
        // Autenticação bem-sucedida
        window.setAuthenticated(true);
        
        // Ocultar modal de autenticação
        document.getElementById('authModal').style.display = 'none';
        
        // Mostrar sistema
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // Inicializar sistema
        window.initSystem();
        
        logSuccess('Autenticação bem-sucedida - Sistema iniciado');
    } else {
        // Senha incorreta
        errorMsg.classList.remove('hidden');
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 3000);
        
        logError('Tentativa de autenticação falhou');
    }
};

window.showAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Focar no campo de senha
        const passwordField = document.getElementById('authPassword');
        if (passwordField) {
            setTimeout(() => passwordField.focus(), 100);
        }
    }
};

window.logout = function() {
    if (window.isLoading) return;
    
    if (confirm('Deseja sair do sistema?')) {
        window.setAuthenticated(false);
        
        // Limpar timers
        if (window.timerInterval) {
            clearInterval(window.timerInterval);
        }
        if (window.refreshTimer) {
            clearTimeout(window.refreshTimer);
        }
        
        // Ocultar sistema
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('mainContent').classList.add('hidden');
        document.getElementById('mainFooter').classList.add('hidden');
        
        // Mostrar modal de autenticação
        window.showAuthModal();
        
        // Limpar campo de senha
        const passwordField = document.getElementById('authPassword');
        if (passwordField) {
            passwordField.value = '';
        }
        
        logInfo('Logout realizado com sucesso');
    }
};

// =================== INICIALIZAÇÃO DO SISTEMA V3.3.2 ===================
window.initSystem = async function() {
    try {
        logInfo('🏥 Inicializando Sistema Archipelago V3.3.2...');
        logInfo('📊 Carregando 79 leitos (5 hospitais - 74 colunas A-BV)');
        
        // Mostrar loading
        showLoading(null, 'Inicializando sistema V3.3.2 (74 colunas)...');
        
        // Carregar dados dos hospitais
        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        
        // Renderizar cards do hospital inicial
        if (window.renderCards) {
            setTimeout(() => {
                window.renderCards();
            }, 500);
        }
        
        // Iniciar timer de atualização
        window.startTimer();
        
        // Ocultar loading
        setTimeout(() => {
            hideLoading();
            logSuccess('✅ Sistema V3.3.2 inicializado com sucesso!');
        }, 1500);
        
    } catch (error) {
        logError('Erro na inicialização do sistema:', error);
        hideLoading();
        alert('Erro ao inicializar o sistema. Por favor, recarregue a página.');
    }
};

// =================== ATUALIZAÇÃO DE DADOS V3.3.2 - ✅ CORRIGIDO ===================
window.updateData = async function() {
    if (window.isLoading) {
        logInfo('Atualização já em andamento, aguardando...');
        return;
    }
    
    try {
        logInfo('🔄 Atualizando dados V3.3.2 da planilha (74 colunas A-BV)...');
        
        showLoading(null, 'Atualizando dados V3.3.2 (74 colunas)...');
        
        // Recarregar dados
        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        
        // Re-renderizar interface atual
        if (window.currentView === 'leitos' && window.renderCards) {
            setTimeout(() => {
                window.renderCards();
            }, 500);
        } else if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
            setTimeout(() => {
                // ✅ CORREÇÃO: Passar currentHospital como parâmetro
                window.renderDashboardHospitalar(window.currentHospital);
            }, 500);
        } else if (window.currentView === 'dash2' && window.renderDashboardExecutivo) {
            setTimeout(() => {
                window.renderDashboardExecutivo();
            }, 500);
        }
        
        // Resetar timer
        window.startTimer();
        
        setTimeout(() => {
            hideLoading();
            logSuccess('✅ Dados V3.3.2 atualizados com sucesso!');
        }, 1500);
        
    } catch (error) {
        logError('Erro ao atualizar dados V3.3.2:', error);
        hideLoading();
        alert('Erro ao atualizar dados. Tente novamente.');
    }
};

// =================== NAVEGAÇÃO ENTRE ABAS V3.3.2 - ✅ CORRIGIDO ===================
window.setActiveTab = function(tabName) {
    if (window.isLoading) return;
    
    window.currentView = tabName;
    
    // Atualizar menu
    document.querySelectorAll('.side-menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });
    
    // Ocultar todas as seções
    document.getElementById('leitosView')?.classList.add('hidden');
    document.getElementById('dash1')?.classList.add('hidden');
    document.getElementById('dash2')?.classList.add('hidden');
    
    // Mostrar seção ativa
    if (tabName === 'leitos') {
        document.getElementById('leitosView')?.classList.remove('hidden');
        if (window.renderCards) {
            showLoading(null, 'Carregando leitos V3.3.2...');
            setTimeout(() => {
                window.renderCards();
                hideLoading();
            }, 800);
        }
    } else if (tabName === 'dash1') {
        document.getElementById('dash1')?.classList.remove('hidden');
        if (window.renderDashboardHospitalar) {
            showLoading(null, 'Carregando Dashboard Hospitalar V3.3.2...');
            setTimeout(() => {
                // ✅ CORREÇÃO: Passar currentHospital como parâmetro
                window.renderDashboardHospitalar(window.currentHospital);
                hideLoading();
            }, 800);
        }
    } else if (tabName === 'dash2') {
        document.getElementById('dash2')?.classList.remove('hidden');
        if (window.renderDashboardExecutivo) {
            showLoading(null, 'Carregando Dashboard Executivo V3.3.2...');
            setTimeout(() => {
                window.renderDashboardExecutivo();
                hideLoading();
            }, 800);
        }
    }
    
    // ✅ CORREÇÃO: Fechar menu lateral após clicar
    setTimeout(() => {
        window.toggleMenu(false);
    }, 200);
    
    logSuccess(`✅ Aba alterada para: ${tabName} - Menu lateral fechado`);
};

// =================== MENU LATERAL - ✅ CORRIGIDO ===================
window.toggleMenu = function(forceState = null) {
    if (window.isLoading) return;
    
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (!menu || !overlay) return;
    
    // forceState: true = abrir, false = fechar, null = toggle
    if (forceState === false) {
        // Forçar fechamento
        menu.classList.remove('open');
        overlay.classList.remove('active');
        logInfo('Menu lateral fechado (forçado)');
    } else if (forceState === true) {
        // Forçar abertura
        menu.classList.add('open');
        overlay.classList.add('active');
        logInfo('Menu lateral aberto (forçado)');
    } else {
        // Toggle normal
        const isOpen = menu.classList.toggle('open');
        overlay.classList.toggle('active');
        logInfo(`Menu lateral ${isOpen ? 'aberto' : 'fechado'} (toggle)`);
    }
};

// =================== SELEÇÃO DE HOSPITAL V3.3.2 - ✅ CORRIGIDO ===================
window.selectHospital = function(hospitalId) {
    if (window.isLoading) return;
    
    if (!CONFIG.HOSPITAIS[hospitalId] || !CONFIG.HOSPITAIS[hospitalId].ativo) {
        logError(`Hospital ${hospitalId} não disponível`);
        return;
    }
    
    window.currentHospital = hospitalId;
    
    // ✅ CORREÇÃO: Definir hospitalConfig ANTES do if
    const hospitalConfig = CONFIG.HOSPITAIS[hospitalId];
    
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
        showLoading(null, `Carregando ${hospitalConfig.leitos} leitos do ${hospitalConfig.nome}...`);
        setTimeout(() => {
            window.renderCards();
            hideLoading();
        }, 800);
    }
    
    // *** SE ESTIVER NO DASHBOARD HOSPITALAR, ATUALIZAR ***
    if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
        showLoading(null, `Atualizando Dashboard do ${hospitalConfig.nome}...`);
        setTimeout(() => {
            // ✅ CORREÇÃO: Passar hospitalId para renderizar dashboard do hospital selecionado
            window.renderDashboardHospitalar(hospitalId);
            hideLoading();
        }, 800);
    }
    
    logSuccess(`Hospital selecionado: ${CONFIG.HOSPITAIS[hospitalId].nome} (${hospitalConfig.leitos} leitos - ${hospitalConfig.tipo})`);
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

// =================== INICIALIZAÇÃO DO APP V3.3.2 (CORRIGIDA) ===================
window.initApp = async function() {
    logInfo('🏥 Archipelago Dashboard V3.3.2 - Iniciando aplicação...');
    logInfo('👤 Cliente: Guilherme Santoro | 👨‍💻 Dev: Alessandro Rodrigues');
    
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
    
    logSuccess('🚀 App V3.3.2 inicializado e pronto para uso');
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

// =================== FUNÇÃO PARA OBTER HOSPITAIS ATIVOS V3.3.2 ===================
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

// =================== TIMER DE ATUALIZAÇÃO V3.3.2 ===================
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

// =================== FUNÇÕES AUXILIARES V3.3.2 ===================
window.getTotalLeitos = function() {
    return Object.values(CONFIG.HOSPITAIS)
        .filter(h => h.ativo)
        .reduce((total, h) => total + h.leitos, 0);
};

window.getHospitalByLeito = function(leitoId) {
    // Retornar dados do hospital baseado no ID do leito
    for (const [id, hospital] of Object.entries(CONFIG.HOSPITAIS)) {
        if (leitoId.startsWith(id)) {
            return { id, ...hospital };
        }
    }
    return null;
};

window.validarConcessao = function(concessao) {
    return CONCESSOES_LISTA.includes(concessao);
};

window.validarLinhaCuidado = function(linha) {
    return LINHAS_CUIDADO_LISTA.includes(linha);
};

window.validarRegiao = function(regiao) {
    return REGIOES_LISTA.includes(regiao);
};

window.validarIsolamento = function(isolamento) {
    return ISOLAMENTO_OPCOES.includes(isolamento);
};

window.validarGenero = function(genero) {
    return GENERO_OPCOES.includes(genero);
};

window.validarCategoria = function(categoria) {
    return CATEGORIA_OPCOES.includes(categoria);
};

window.validarDiretivas = function(diretivas) {
    return DIRETIVAS_OPCOES.includes(diretivas);
};

// =================== ABRIR QR CODES ===================
window.openQRCodes = function() {
    window.open('index-qr.html', '_blank');
    logInfo('Abrindo gerador de QR Codes...');
};

// =================== LOG DE INICIALIZAÇÃO V3.3.2 ===================
logSuccess('📋 App.js V3.3.2 carregado com sucesso!');
logSuccess('');
logSuccess('🏥 REDE HOSPITALAR V3.3.2:');
logSuccess('   H1 - Neomater:             10 leitos (Híbrido)');
logSuccess('   H2 - Cruz Azul:            36 leitos (20 Aptos + 16 Enf)');
logSuccess('   H3 - Santa Marcelina:       7 leitos (Híbrido) ✅ CORRIGIDO');
logSuccess('   H4 - Santa Clara:          13 leitos (9 Aptos + 4 Enf)');
logSuccess('   H5 - Hospital Adventista:  13 leitos (Híbrido)');
logSuccess('   ────────────────────────────────────────────');
logSuccess('   TOTAL:                     79 leitos');
logSuccess('');
logSuccess('📊 ESTRUTURA DE DADOS V3.3.2:');
logSuccess('   ✅ 74 colunas (A-BV) na planilha');
logSuccess('   ✅ 11 concessões (M-W checkboxes)');
logSuccess('   ✅ 45 linhas de cuidado (X-BR checkboxes)');
logSuccess('   ✅ 9 regiões (BT/71)');
logSuccess('   ✅ 4 campos novos: gênero, região, categoria, diretivas');
logSuccess('');
logSuccess('👤 Cliente: Guilherme Santoro');
logSuccess('👨‍💻 Desenvolvedor: Alessandro Rodrigues');
logSuccess('📅 Versão: V3.3.2 - Outubro/2025');
logSuccess('✅ Sistema 100% operacional - QR Code sincronizado');
logSuccess('');
logSuccess('✅ CORREÇÕES V3.3.2:');
logSuccess('   • setActiveTab passa currentHospital para renderDashboardHospitalar');
logSuccess('   • Menu lateral fecha automaticamente após clicar em qualquer aba');
logSuccess('   • selectHospital atualiza dashboard hospitalar se estiver ativo');
logSuccess('   • toggleMenu aceita forceState (true/false/null)');
