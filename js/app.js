// =================== APP.JS V8.0 - COMPLETO E OTIMIZADO ===================
// Versão: V8.0 - Marco/2026
// NOVIDADES V8.0:
//    - authenticate() agora chama backend ?action=login
//    - setAuthenticated() salva perfil e hospital na sessão
//    - getPerfil() e getHospitalPerfil() helpers de sessão
//    - logout() limpa perfil e hospital
//    - Fallback local para erro de rede
// 9 Hospitais - 356 Leitos Totais (293 Enfermaria + 63 UTI)

// =================== CONFIGURAÇÕES GLOBAIS V7.0 ===================
window.CONFIG = {
    AUTH_PASSWORD: '1997',
    ADM_EMAIL: 'cvcalessandro@gmail.com',
    ADM_PASSWORD: '2305',
    REFRESH_INTERVAL: 240000, // 4 minutos
    QR_TIMEOUT: 120000, // 2 minutos
    HOSPITAIS: {
        // *** V7.0: 293 LEITOS ENFERMARIA + 63 UTI = 356 TOTAL (9 HOSPITAIS) ***
        H1: { nome: "Neomater", leitos: 25, tipo: "Híbrido", ativo: true },
        H2: { nome: "Cruz Azul", leitos: 67, tipo: "Misto", ativo: true },
        H3: { nome: "Santa Marcelina", leitos: 28, tipo: "Híbrido", ativo: true },
        H4: { nome: "Santa Clara", leitos: 57, tipo: "Misto", ativo: true },
        H5: { nome: "Hospital Adventista", leitos: 28, tipo: "Híbrido", ativo: true },
        H6: { nome: "Santa Cruz", leitos: 22, tipo: "Híbrido", ativo: true },
        H7: { nome: "Santa Virgínia", leitos: 22, tipo: "Híbrido", ativo: true },
        H8: { nome: "São Camilo Ipiranga", leitos: 22, tipo: "Híbrido", ativo: true },
        H9: { nome: "São Camilo Pompeia", leitos: 22, tipo: "Híbrido", ativo: true }
    }
};

// =================== LISTAS COMPLETAS V7.0 ===================

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
window.currentHospital = 'H5'; // Adventista como padrão
window.currentView = 'dash2'; // Dashboard Executivo como padrão
window.isAuthenticated = false;
window.refreshTimer = null;
window.timerInterval = null;
window.isLoading = false;
window.loadingOverlay = null;

// =================== FUNÇÕES DE LOG (GLOBAIS) ===================
window.logInfo = function(msg) {
    console.log(`ℹ️ [INFO V7.0] ${msg}`);
};

window.logSuccess = function(msg) {
    console.log(`✅ [SUCCESS V7.0] ${msg}`);
};

window.logError = function(msg, error = null) {
    console.error(`❌ [ERROR V7.0] ${msg}`, error || '');
};

window.logWarn = function(msg) {
    console.warn(`⚠️ [WARNING V7.0] ${msg}`);
};

// =================== SISTEMA DE LOADING OTIMIZADO COM BLOQUEIO ===================
window.showLoading = function(container = null, message = 'Carregando dados...') {
    window.isLoading = true;
    
    // Criar overlay global que bloqueia toda a interface
    if (!window.loadingOverlay) {
        window.loadingOverlay = document.createElement('div');
        window.loadingOverlay.id = 'globalLoadingOverlay';
        window.loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(6px);
            color: white;
            text-align: center;
            animation: fadeIn 0.3s ease-in;
        `;
        document.body.appendChild(window.loadingOverlay);
    }
    
    // Conteúdo do loading
    const loadingHTML = `
        <div class="loading-content" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 400px;
            padding: 40px;
            background: rgba(30, 41, 59, 0.95);
            border-radius: 16px;
            border: 2px solid rgba(96, 165, 250, 0.3);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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
            <h3 style="margin: 0 0 12px 0; font-size: 20px; color: #60a5fa; font-weight: 700; font-family: 'Poppins', sans-serif;">
                ${message}
            </h3>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; font-family: 'Poppins', sans-serif;">
                ⚡ Sistema bloqueado durante carregamento
            </p>
            <div style="margin-top: 16px; font-size: 12px; color: rgba(255, 255, 255, 0.5); font-family: 'Poppins', sans-serif;">
                Por favor, aguarde...
            </div>
        </div>
    `;
    
    window.loadingOverlay.innerHTML = loadingHTML;
    window.loadingOverlay.style.display = 'flex';
    
    // Bloquear todos os cliques e interações
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
    window.loadingOverlay.style.pointerEvents = 'all';
    
    // Adicionar CSS da animação se não existir
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
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.95); }
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
    
    // Remover overlay e desbloquear interface
    if (window.loadingOverlay) {
        window.loadingOverlay.style.animation = 'fadeOut 0.3s ease-out';
        window.loadingOverlay.style.opacity = '0';
        
        setTimeout(() => {
            if (window.loadingOverlay && window.loadingOverlay.parentNode) {
                window.loadingOverlay.style.display = 'none';
            }
            
            // Desbloquear interface
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

// V8.0: Helpers de perfil e hospital da sessão
window.getPerfil = function() {
    return sessionStorage.getItem('archipelago_perfil') || null;
};

window.getHospitalPerfil = function() {
    return sessionStorage.getItem('archipelago_hospital') || null;
};

window.setAuthenticated = function(value, perfil, hospital) {
    window.isAuthenticated = value;
    if (value) {
        sessionStorage.setItem('archipelago_authenticated', 'true');
        sessionStorage.setItem('archipelago_perfil', perfil || 'admin');
        sessionStorage.setItem('archipelago_hospital', hospital || '');
    } else {
        sessionStorage.removeItem('archipelago_authenticated');
        sessionStorage.removeItem('archipelago_perfil');
        sessionStorage.removeItem('archipelago_hospital');
    }
};

// =================== AUTENTICAÇÃO V8.0 ===================
window.authenticate = async function() {
    const password = document.getElementById('authPassword').value;
    const errorMsg = document.getElementById('authError');
    const btnEntrar = document.querySelector('#authModal button');

    if (!password) return;

    // Bloquear botão durante a requisição
    if (btnEntrar) btnEntrar.disabled = true;

    try {
        // Chamar backend para validar senha e obter perfil
        const url = window.API_URL + '?action=login&senha=' + encodeURIComponent(password);
        const response = await fetch(url);
        const result = await response.json();

        if (result.ok) {
            // Autenticação bem-sucedida — salvar perfil e hospital
            window.setAuthenticated(true, result.perfil, result.hospital);

            // Ocultar modal de autenticação
            document.getElementById('authModal').style.display = 'none';

            // Mostrar sistema
            document.getElementById('mainHeader').classList.remove('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            document.getElementById('mainFooter').classList.remove('hidden');

            // Inicializar sistema (main.js detectará o perfil para rotear)
            window.initSystem();

            logSuccess('Autenticação V8.0 bem-sucedida - Perfil: ' + result.perfil + ' | Hospital: ' + (result.hospital || 'todos'));
        } else {
            // Senha incorreta
            errorMsg.classList.remove('hidden');
            setTimeout(() => {
                errorMsg.classList.add('hidden');
            }, 3000);
            logError('Tentativa de autenticação falhou');
        }
    } catch (error) {
        // Erro de rede — fallback para senha local admin
        logWarn('Erro ao contactar backend, tentando fallback local: ' + error.toString());
        if (password === CONFIG.AUTH_PASSWORD) {
            window.setAuthenticated(true, 'admin', null);
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('mainHeader').classList.remove('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            document.getElementById('mainFooter').classList.remove('hidden');
            window.initSystem();
            logSuccess('Autenticação via fallback local');
        } else {
            errorMsg.classList.remove('hidden');
            setTimeout(() => { errorMsg.classList.add('hidden'); }, 3000);
        }
    } finally {
        if (btnEntrar) btnEntrar.disabled = false;
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
        // V8.0: limpa autenticação, perfil e hospital
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

// =================== INICIALIZAÇÃO DO SISTEMA V8.0 ===================
window.initSystem = async function() {
    try {
        logInfo('Inicializando Sistema Archipelago V8.0...');

        showLoading(null, 'Sincronizando com Google Apps Script V8.0...');

        if (typeof window.loadHospitalData !== 'function') {
            throw new Error('loadHospitalData não está disponível');
        }

        await window.loadHospitalData();

        if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
            throw new Error('Dados não foram carregados corretamente');
        }

        logSuccess('Dados carregados: ' + Object.keys(window.hospitalData).length + ' hospitais');

        // V8.0: Detectar perfil e rotear
        const perfil  = window.getPerfil ? window.getPerfil() : 'admin';
        const hospital = window.getHospitalPerfil ? window.getHospitalPerfil() : null;

        // Montar menu conforme perfil
        if (window.montarMenu) {
            window.montarMenu(perfil, hospital);
        }

        // Ocultar todas as sections
        ['dash1', 'dash2', 'dash3', 'leitosView', 'leitosUTIView', 'viewEnfermeiro'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        if (perfil === 'enfermeiro' && hospital) {
            // ENFERMEIRO: abrir direto a view de reservas do hospital
            window.currentView = 'viewEnfermeiro';
            window.currentHospital = hospital;

            document.getElementById('viewEnfermeiro')?.classList.remove('hidden');

            if (typeof window.renderViewEnfermeiro === 'function') {
                window.renderViewEnfermeiro(hospital);
            } else {
                logWarn('renderViewEnfermeiro ainda nao disponivel');
            }

        } else {
            // ADMIN: comportamento atual — Dashboard Executivo
            window.currentView = 'dash2';
            document.getElementById('dash2')?.classList.remove('hidden');

            document.querySelectorAll('.side-menu-item').forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-tab') === 'dash2');
            });

            if (typeof window.renderDashboardExecutivo === 'function') {
                window.renderDashboardExecutivo();
            }
        }

        window.startTimer();

        await new Promise(resolve => setTimeout(resolve, 300));
        hideLoading();

        logSuccess('Sistema V8.0 inicializado - Perfil: ' + perfil);

    } catch (error) {
        logError('Erro ao inicializar sistema:', error);
        hideLoading();

        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh;">
                    <div style="text-align: center; max-width: 500px; padding: 40px; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 16px;">
                        <h2 style="color: #ef4444; margin-bottom: 15px; font-size: 24px; font-family: 'Poppins', sans-serif; font-weight: 700;">Erro ao Carregar Dados</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 25px; font-family: 'Poppins', sans-serif;">${error.message}</p>
                        <button onclick="location.reload()" style="padding: 12px 32px; background: #60a5fa; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 16px;">
                            Recarregar Página
                        </button>
                    </div>
                </div>
            `;
            mainContent.classList.remove('hidden');
        }
    }
};

// =================== ATUALIZAÇÃO DE DADOS V7.0 OTIMIZADA ===================
window.updateData = async function() {
    if (window.isLoading) {
        logInfo('Atualização já em andamento, aguardando...');
        return;
    }
    
    try {
        logInfo('🔄 Atualizando dados V7.0...');
        
        showLoading(null, 'Atualizando dados V7.0...');
        
        // Recarregar dados (AGUARDAR)
        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        
        // Pequeno delay para processamento
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Re-renderizar interface atual
        if (window.currentView === 'leitos' && window.renderCards) {
            window.renderCards();
        } else if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar(window.currentHospital);
        } else if (window.currentView === 'dash2' && window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        } else if (window.currentView === 'leitosUTI' && window.renderCardsUTI) {
            // V7.0: Re-renderizar cards UTI
            window.renderCardsUTI(window.currentHospitalUTI || 'H2');
        } else if ((window.currentView === 'dash3' || window.currentView === 'uti') && window.renderDashboardUTI) {
            // V7.0: Re-renderizar dashboard UTI
            window.renderDashboardUTI();
        }
        
        // Resetar timer
        window.startTimer();
        
        // Delay mínimo antes de remover loading
        await new Promise(resolve => setTimeout(resolve, 300));
        
        hideLoading();
        
        logSuccess('✅ Dados V7.0 atualizados com sucesso!');
        
    } catch (error) {
        logError('Erro ao atualizar dados V7.0:', error);
        hideLoading();
        alert('Erro ao atualizar dados. Tente novamente.');
    }
};

// =================== NAVEGAÇÃO ENTRE ABAS V7.0 OTIMIZADA ===================
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
    document.getElementById('leitosUTIView')?.classList.add('hidden'); // V7.0: UTI
    document.getElementById('dash1')?.classList.add('hidden');
    document.getElementById('dash2')?.classList.add('hidden');
    document.getElementById('dash3')?.classList.add('hidden'); // V7.0: Dashboard UTI
    
    // Mostrar seção ativa
    if (tabName === 'leitos') {
        document.getElementById('leitosView')?.classList.remove('hidden');
        if (window.renderCards) {
            showLoading(null, 'Carregando leitos V7.0...');
            setTimeout(() => {
                window.renderCards();
                hideLoading();
            }, 400);
        }
    } else if (tabName === 'dash1') {
        document.getElementById('dash1')?.classList.remove('hidden');
        if (window.renderDashboardHospitalar) {
            showLoading(null, 'Carregando Dashboard Hospitalar V7.0...');
            setTimeout(() => {
                window.renderDashboardHospitalar(window.currentHospital);
                hideLoading();
            }, 400);
        }
    } else if (tabName === 'dash2') {
        document.getElementById('dash2')?.classList.remove('hidden');
        if (window.renderDashboardExecutivo) {
            showLoading(null, 'Carregando Dashboard Executivo V7.0...');
            setTimeout(() => {
                window.renderDashboardExecutivo();
                hideLoading();
            }, 400);
        }
    } else if (tabName === 'leitosUTI') {
        // V7.0: Mapa de Leitos UTI
        document.getElementById('leitosUTIView')?.classList.remove('hidden');
        if (window.renderCardsUTI) {
            showLoading(null, 'Carregando leitos UTI V7.0...');
            setTimeout(() => {
                window.renderCardsUTI('H2'); // Default Cruz Azul
                hideLoading();
            }, 400);
        }
    } else if (tabName === 'dash3' || tabName === 'uti') {
        // V7.0: Dashboard UTI
        document.getElementById('dash3')?.classList.remove('hidden');
        if (window.renderDashboardUTI) {
            showLoading(null, 'Carregando Dashboard UTI V7.0...');
            setTimeout(() => {
                window.renderDashboardUTI();
                hideLoading();
            }, 400);
        }
    }
    
    // Fechar menu lateral após clicar
    setTimeout(() => {
        window.toggleMenu(false);
    }, 150);
    
    logSuccess(`✅ Aba alterada para: ${tabName}`);
};

// =================== MENU LATERAL ===================
window.toggleMenu = function(forceState = null) {
    if (window.isLoading) return;
    
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (!menu || !overlay) return;
    
    if (forceState === false) {
        menu.classList.remove('open');
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        logInfo('Menu lateral fechado');
    } else if (forceState === true) {
        menu.classList.add('open');
        overlay.classList.add('active');
        overlay.style.display = 'block';
        logInfo('Menu lateral aberto');
    } else {
        const isOpen = menu.classList.toggle('open');
        overlay.classList.toggle('active');
        overlay.style.display = isOpen ? 'block' : 'none';
        logInfo(`Menu lateral ${isOpen ? 'aberto' : 'fechado'}`);
    }
};

// =================== SELEÇÃO DE HOSPITAL V7.0 OTIMIZADA ===================
window.selectHospital = function(hospitalId) {
    if (window.isLoading) return;
    
    if (!CONFIG.HOSPITAIS[hospitalId] || !CONFIG.HOSPITAIS[hospitalId].ativo) {
        logError(`Hospital ${hospitalId} não disponível`);
        return;
    }
    
    window.currentHospital = hospitalId;
    
    const hospitalConfig = CONFIG.HOSPITAIS[hospitalId];
    
    // Atualizar botões
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-hospital="${hospitalId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Re-renderizar cards com loading
    if (window.renderCards) {
        showLoading(null, `Carregando ${hospitalConfig.leitos} leitos do ${hospitalConfig.nome}...`);
        setTimeout(() => {
            window.renderCards();
            hideLoading();
        }, 400);
    }
    
    // Se estiver no dashboard hospitalar, atualizar
    if (window.currentView === 'dash1' && window.renderDashboardHospitalar) {
        showLoading(null, `Atualizando Dashboard do ${hospitalConfig.nome}...`);
        setTimeout(() => {
            window.renderDashboardHospitalar(hospitalId);
            hideLoading();
        }, 400);
    }
    
    logSuccess(`Hospital selecionado: ${hospitalConfig.nome} (${hospitalConfig.leitos} leitos)`);
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

// =================== INICIALIZAÇÃO DO APP V7.0 ===================
window.initApp = async function() {
    logInfo('🏥 Archipelago Dashboard V7.0 - Iniciando aplicação...');
    
    // Verificar autenticação
    if (window.checkAuthentication()) {
        // Já autenticado, mostrar sistema
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainFooter').classList.remove('hidden');
        
        // Inicializar sistema
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
    
    logSuccess('🚀 App V7.0 inicializado e pronto para uso');
};

// =================== GERENCIAR CORES ===================
window.restoreDefaultColors = function() {
    const defaultColors = {
        '--nav-header': '#60a5fa',
        '--nav-sidebar': '#60a5fa',
        '--status-vago': '#16a34a',
        '--status-uso': '#fbbf24',
        '--destaque': '#60a5fa'
    };
    
    Object.entries(defaultColors).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
    
    logSuccess('Cores padrão restauradas');
};

// =================== FUNÇÕES AUXILIARES V7.0 ===================
window.getActiveHospitals = function() {
    return Object.entries(CONFIG.HOSPITAIS)
        .filter(([id, hospital]) => hospital.ativo)
        .map(([id, hospital]) => ({ id, ...hospital }));
};

window.toggleHospital = function(hospitalId, ativo) {
    if (CONFIG.HOSPITAIS[hospitalId]) {
        CONFIG.HOSPITAIS[hospitalId].ativo = ativo;
        
        const btn = document.querySelector(`[data-hospital="${hospitalId}"]`);
        if (btn) {
            btn.style.display = ativo ? 'block' : 'none';
            if (!ativo && window.currentHospital === hospitalId) {
                window.selectHospital('H5');
            }
        }
        
        logInfo(`Hospital ${hospitalId} ${ativo ? 'ativado' : 'desativado'}`);
        return true;
    }
    return false;
};

window.getTotalLeitos = function() {
    return Object.values(CONFIG.HOSPITAIS)
        .filter(h => h.ativo)
        .reduce((total, h) => total + h.leitos, 0);
};

window.getHospitalByLeito = function(leitoId) {
    for (const [id, hospital] of Object.entries(CONFIG.HOSPITAIS)) {
        if (leitoId.startsWith(id)) {
            return { id, ...hospital };
        }
    }
    return null;
};

// =================== VALIDAÇÕES ===================
window.validarConcessao = (c) => CONCESSOES_LISTA.includes(c);
window.validarLinhaCuidado = (l) => LINHAS_CUIDADO_LISTA.includes(l);
window.validarRegiao = (r) => REGIOES_LISTA.includes(r);
window.validarIsolamento = (i) => ISOLAMENTO_OPCOES.includes(i);
window.validarGenero = (g) => GENERO_OPCOES.includes(g);
window.validarCategoria = (c) => CATEGORIA_OPCOES.includes(c);
window.validarDiretivas = (d) => DIRETIVAS_OPCOES.includes(d);

// =================== TIMER DE ATUALIZAÇÃO V7.0 ===================
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
            if (!window.isLoading) {
                window.updateData();
            }
            countdown = 240;
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
    updateTimer();
    
    logInfo('Timer de atualização iniciado (4 minutos)');
};

// =================== ABRIR QR CODES ===================
window.openQRCodes = function() {
    window.open('index-qr.html', '_blank');
    logInfo('Abrindo gerador de QR Codes...');
};

// =================== LOG DE INICIALIZAÇÃO V7.0 ===================
console.log('%c🚀 ARCHIPELAGO DASHBOARD V7.0', 'color: #60a5fa; font-size: 20px; font-weight: bold;');
console.log('%c📅 Novembro/2025', 'color: #10b981; font-weight: bold;');
console.log('');
console.log('%c🏥 REDE HOSPITALAR V7.0 - 356 LEITOS TOTAIS (293 ENF + 63 UTI)', 'color: #60a5fa; font-weight: bold;');
console.log('%c   H1 - Neomater:             10 leitos (Híbrido)', 'color: #10b981;');
console.log('%c   H2 - Cruz Azul:            36 leitos (Misto)', 'color: #10b981;');
console.log('%c   H3 - Santa Marcelina:       7 leitos (Híbrido)', 'color: #10b981;');
console.log('%c   H4 - Santa Clara:          13 leitos (Misto)', 'color: #10b981;');
console.log('%c   H5 - Hospital Adventista:  13 leitos (Híbrido)', 'color: #10b981;');
console.log('%c   H6 - Santa Cruz:            7 leitos (Híbrido)', 'color: #10b981;');
console.log('%c   H7 - Santa Virgínia:        7 leitos (Híbrido)', 'color: #10b981;');
console.log('%c   ────────────────────────────────────────────', 'color: #9ca3af;');
console.log('%c   TOTAL:                     93 leitos', 'color: #60a5fa; font-weight: bold;');
console.log('');
console.log('%c✨ NOVIDADES V7.0:', 'color: #fbbf24; font-weight: bold;');
console.log('%c   • ⚡ Carregamento ultrarrápido (delays reduzidos)', 'color: #10b981;');
console.log('%c   • ✅ await no loadHospitalData (dados antes de renderizar)', 'color: #10b981;');
console.log('%c   • 🎯 Dashboard Executivo como tela inicial', 'color: #10b981;');
console.log('%c   • 🏥 7 hospitais - 93 leitos totais', 'color: #10b981;');
console.log('%c   • 🎨 Interface otimizada e moderna', 'color: #10b981;');
console.log('');
console.log('%c📊 App.js V7.0 carregado com sucesso!', 'color: #60a5fa; font-weight: bold;');
