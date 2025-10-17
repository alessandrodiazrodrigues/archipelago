// =================== CARDS.JS V3.3 - FINAL COM TODAS AS CORREÇÕES ===================
// Sistema: Archipelago Dashboard - Gestão Hospitalar Multi-unidade
// Versão: V3.3 FINAL CORRIGIDO
// Data: 17/10/2025
// Desenvolvedor: Alessandro Rodrigues
// Cliente: Guilherme Santoro
//
// ✅ CORREÇÕES IMPLEMENTADAS NESTA VERSÃO:
// 1. Header modais: SEM emoji, 1 linha, mostra identificação do leito
// 2. Campo DIRETIVAS duplicado REMOVIDO
// 3. Modal ATUALIZAR com mesmo layout do modal ADMITIR
// 4. Rodapé no modal ATUALIZAR (admissão + tempo internado)
// 5. Campo TIPO nos cards mostra Apartamento/Enfermaria corretamente
// 6. Mantém todas as funcionalidades da V3.1 (checkboxes, validações, etc.)
//
// FUNCIONALIDADES:
// - Admissão de pacientes com validação completa
// - Atualização de dados de pacientes internados
// - Alta de pacientes com limpeza completa
// - Checkboxes múltiplas seleções (concessões + linhas)
// - Validação campo identificação obrigatório
// - Interface responsiva (desktop + mobile)
// - Layout 3x3 nos cards mantido
// - CSS responsivo consolidado neste arquivo
// ==================================================================================

// =================== LOGGING E DEBUG ===================
function logInfo(msg) {
    console.log(`[CARDS V3.3] ${msg}`);
}

function logError(msg, error) {
    console.error(`[CARDS V3.3] ${msg}`, error);
}

function logDebug(msg) {
    if (window.DEBUG_MODE) {
        console.log(`[DEBUG CARDS V3.3] ${msg}`);
    }
}

// =================== CSS RESPONSIVO CONSOLIDADO ===================
const MOBILE_CSS = `
    <style id="cards-mobile-css">
        /* =================== DESKTOP (>768px) =================== */
        @media (min-width: 769px) {
            .cards-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                padding: 20px;
            }
            
            .card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            /* Layout 3x3 dos cards - FORÇADO */
            .card-row-1,
            .card-row-2,
            .card-row-3 {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 12px;
                margin-bottom: 12px;
            }
            
            .card-row-1 > div,
            .card-row-2 > div,
            .card-row-3 > div {
                background: #f8f9fa;
                padding: 10px 8px;
                border-radius: 6px;
                text-align: center;
                min-height: 60px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            /* Modal em 3 colunas no desktop */
            .form-grid-3-cols {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
        }
        
        /* =================== TABLET E MOBILE (≤768px) =================== */
        @media (max-width: 768px) {
            /* Cards em coluna única */
            .cards-grid {
                display: flex !important;
                flex-direction: column !important;
                gap: 15px !important;
                padding: 10px !important;
            }
            
            /* Card mais compacto */
            .card {
                background: white;
                border-radius: 10px;
                padding: 15px !important;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                margin-bottom: 12px;
            }
            
            /* CORES HARDCODED - Verde para vago, Amarelo para ocupado */
            .card[data-status="vago"] {
                border-left: 4px solid #4CAF50 !important;
                background: #F0F4F8 !important;
            }
            
            .card[data-status="ocupado"] {
                border-left: 4px solid #FFA726 !important;
                background: #FFF8E1 !important;
            }
            
            /* MANTER LAYOUT 3x3 MESMO NO MOBILE */
            .card-row-1,
            .card-row-2,
            .card-row-3 {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 8px !important;
                margin-bottom: 10px !important;
            }
            
            .card-row-1 > div,
            .card-row-2 > div,
            .card-row-3 > div {
                background: #f8f9fa;
                padding: 8px 4px !important;
                border-radius: 4px;
                text-align: center;
                min-height: 50px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                font-size: 11px !important;
            }
            
            /* Labels menores */
            .card-row-1 div[style*="font-size: 10px"],
            .card-row-2 div[style*="font-size: 10px"],
            .card-row-3 div[style*="font-size: 10px"] {
                font-size: 9px !important;
            }
            
            /* Valores menores */
            .card-row-1 div[style*="font-size: 14px"],
            .card-row-2 div[style*="font-size: 14px"],
            .card-row-3 div[style*="font-size: 14px"] {
                font-size: 12px !important;
            }
            
            /* Header do card */
            .card h3 {
                font-size: 16px !important;
                margin-bottom: 10px !important;
            }
            
            /* Seções de concessões e linhas */
            .card-section {
                margin-bottom: 12px;
            }
            
            .card-section .section-title {
                font-size: 11px;
                padding: 6px 8px;
                background: #e3f2fd;
                border-radius: 4px;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .card-section .chips-container {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                padding: 8px;
                background: #f5f5f5;
                border-radius: 4px;
                min-height: 30px;
            }
            
            .card-section .chip {
                background: #2196F3;
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
            }
            
            /* Botões de ação */
            .btn-action {
                width: 100%;
                padding: 10px;
                font-size: 12px;
                font-weight: 600;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s;
                margin-bottom: 8px;
            }
            
            /* Modal responsivo */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 10px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 20px;
                width: 95%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            /* Formulário em 1 coluna no mobile */
            .form-grid-3-cols {
                display: flex !important;
                flex-direction: column !important;
                gap: 12px !important;
            }
            
            .form-grid-3-cols input,
            .form-grid-3-cols select {
                width: 100%;
                padding: 10px 8px !important;
                font-size: 12px !important;
            }
            
            /* Labels menores */
            .form-grid-3-cols label {
                font-size: 10px !important;
                margin-bottom: 3px !important;
            }
            
            /* Concessões e Linhas em 1 coluna */
            .modal-content div[id$="Concessoes"], 
            .modal-content div[id$="Linhas"] {
                grid-template-columns: 1fr !important;
                max-height: 120px !important;
            }
            
            /* Checkboxes maiores no mobile */
            input[type="checkbox"],
            input[type="radio"] {
                width: 18px !important;
                height: 18px !important;
                margin-right: 10px !important;
            }
            
            label:has(input[type="checkbox"]),
            label:has(input[type="radio"]) {
                padding: 8px !important;
                font-size: 12px !important;
            }
            
            /* Botões dos modais */
            .btn-cancelar,
            .btn-salvar,
            .btn-alta {
                font-size: 11px !important;
                padding: 10px 15px !important;
            }
        }
        
        /* =================== MOBILE PEQUENO (≤480px) =================== */
        @media (max-width: 480px) {
            /* Cards com padding ainda menor */
            .card {
                padding: 12px !important;
                margin-bottom: 10px !important;
            }
            
            /* Layout 3x3 ainda mais compacto */
            .card-row-1,
            .card-row-2,
            .card-row-3 {
                gap: 6px !important;
                margin-bottom: 8px !important;
            }
            
            .card-row-1 > div,
            .card-row-2 > div,
            .card-row-3 > div {
                padding: 6px 3px !important;
                min-height: 40px !important;
            }
            
            /* Labels e valores ainda menores */
            .card-row-1 div[style*="font-size: 10px"],
            .card-row-2 div[style*="font-size: 10px"],
            .card-row-3 div[style*="font-size: 10px"] {
                font-size: 8px !important;
            }
            
            .card-row-1 div[style*="font-size: 12px"],
            .card-row-2 div[style*="font-size: 12px"],
            .card-row-3 div[style*="font-size: 12px"] {
                font-size: 10px !important;
            }
            
            /* Modal ainda mais compacto */
            .modal-content {
                padding: 15px !important;
            }
            
            .form-grid-3-cols {
                gap: 6px !important;
            }
            
            .form-grid-3-cols input,
            .form-grid-3-cols select {
                padding: 6px 4px !important;
                font-size: 11px !important;
            }
            
            .form-grid-3-cols label {
                font-size: 9px !important;
            }
        }
        
        /* =================== LANDSCAPE MOBILE =================== */
        @media (max-width: 768px) and (orientation: landscape) {
            /* Header mais compacto em landscape */
            header {
                padding: 5px 10px;
            }
            
            /* Cards em 2 colunas em landscape */
            .cards-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 12px !important;
            }
            
            /* MANTER LAYOUT 3x3 MESMO EM LANDSCAPE */
            .card-row-1,
            .card-row-2,
            .card-row-3 {
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 6px !important;
            }
            
            /* Modal em landscape */
            .modal-overlay .modal-content {
                max-height: 85vh !important;
                padding: 15px !important;
            }
            
            .modal-content div[id$="Concessoes"], 
            .modal-content div[id$="Linhas"] {
                max-height: 100px !important;
            }
        }
        
        /* =================== LOADING E MENSAGENS =================== */
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .success-message,
        .error-message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideIn 0.3s ease;
            font-weight: 600;
        }
        
        .success-message {
            background: #4CAF50;
            color: white;
        }
        
        .error-message {
            background: #f44336;
            color: white;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    </style>
`;

// Injetar CSS ao carregar
if (!document.getElementById('cards-mobile-css')) {
    document.head.insertAdjacentHTML('beforeend', MOBILE_CSS);
    logInfo('✅ CSS responsivo consolidado injetado');
}

// =================== FUNÇÕES DE UI (Loading, Mensagens) ===================
function showButtonLoading(button, text = 'SALVANDO...') {
    if (!button) return;
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    button.innerHTML = `<span class="loading-spinner"></span> ${text}`;
}

function hideButtonLoading(button, originalText) {
    if (!button) return;
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.innerHTML = originalText;
}

function showSuccessMessage(msg) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showErrorMessage(msg) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

// =================== FUNÇÕES PRINCIPAIS DE CARD ===================
function handleAdmitirClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const leitoNumero = button.getAttribute('data-leito');
    
    if (!leitoNumero) {
        showErrorMessage('❌ Erro: Número do leito não encontrado');
        return;
    }
    
    const originalText = button.innerHTML;
    showButtonLoading(button, 'ABRINDO...');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAdmissaoModal(leitoNumero);
        logInfo(`Modal de admissão V3.3 aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 500);
}

function handleAtualizarClick(event, dadosLeito) {
    event.preventDefault();
    event.stopPropagation();
    
    const leitoNumero = event.currentTarget.getAttribute('data-leito');
    
    if (!leitoNumero) {
        showErrorMessage('❌ Erro: Número do leito não encontrado');
        return;
    }
    
    const button = event.currentTarget;
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ABRINDO...');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAtualizacaoModal(leitoNumero, dadosLeito);
        logInfo(`Modal de atualização V3.3 aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 500);
}

// =================== CRIAÇÃO DOS MODAIS ===================
function createModalOverlay() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); display: flex; align-items: center;
        justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease;
    `;
    return modal;
}

function openAdmissaoModal(leitoNumero) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING?.[hospitalId] || 'Hospital';
    
    // Buscar dados do leito para pegar a identificação
    const leito = window.allHospitalData?.[hospitalId]?.find(l => l.leito == leitoNumero) || {};
    const identificacaoLeito = leito.identificacaoLeito || '';
    const tipoLeito = leito.tipo || 'Leito';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createFormularioAdmissao(hospitalNome, leitoNumero, identificacaoLeito, tipoLeito);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'admissao');
    logInfo(`Modal admissão criado para leito ${leitoNumero}`);
}

function openAtualizacaoModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING?.[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createFormularioAtualizacao(hospitalNome, leitoNumero, dadosLeito);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'atualizacao');
    
    // Pré-marcar checkboxes após renderização
    setTimeout(() => {
        preMarcarCheckboxes(modal, dadosLeito);
    }, 100);
    
    logInfo(`Modal atualização criado para leito ${leitoNumero}`);
}

// =================== FORMULÁRIO DE ADMISSÃO ===================
function createFormularioAdmissao(hospitalNome, leitoNumero, identificacaoLeito, tipoLeito) {
    // Opções de idade (14-115 anos)
    const idadeOptions = Array.from({length: 102}, (_, i) => {
        const idade = i + 14;
        return `<option value="${idade}">${idade} anos</option>`;
    }).join('');
    
    return `
        <div class="modal-content" style="background: white; border-radius: 16px; padding: 25px; max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto;">
            
            <!-- ✅ HEADER CORRIGIDO: SEM EMOJI, 1 LINHA, COM IDENTIFICAÇÃO -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600;">
                    ADMISSÃO DE PACIENTE | Hospital: ${hospitalNome} | Leito: ${identificacaoLeito || leitoNumero} | ${tipoLeito}
                </h2>
            </div>
            
            <!-- LINHA 1: Identificação do Leito (OBRIGATÓRIO) -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px; text-transform: uppercase;">
                    Identificação do Leito *
                </label>
                <input type="text" id="admIdentificacaoLeito" 
                       value="${identificacaoLeito}" 
                       placeholder="Ex: NEO1, ALE4, UTI-5" 
                       maxlength="6" 
                       pattern="[A-Za-z0-9]{1,6}" 
                       required
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
            </div>
            
            <!-- LINHA 2: Nome, Matrícula, Idade -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">NOME COMPLETO *</label>
                    <input type="text" id="admNome" placeholder="Nome do paciente" required
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">MATRÍCULA *</label>
                    <input type="text" id="admMatricula" placeholder="00000-0" required
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">IDADE *</label>
                    <select id="admIdade" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        ${idadeOptions}
                    </select>
                </div>
            </div>
            
            <!-- LINHA 3: PPS, SPICT, Previsão Alta -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">PPS % *</label>
                    <select id="admPPS" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        ${[10,20,30,40,50,60,70,80,90,100].map(v => 
                            `<option value="${v}">${v}%</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">SPICT *</label>
                    <select id="admSPICT" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="nao_elegivel">Não Elegível</option>
                        <option value="elegivel">Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">PREVISÃO ALTA *</label>
                    <select id="admPrevAlta" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="SP">SP (Sem Previsão)</option>
                        <option value="1-3">1-3 dias</option>
                        <option value="4-7">4-7 dias</option>
                        <option value="8-15">8-15 dias</option>
                        <option value="+15">+15 dias</option>
                    </select>
                </div>
            </div>
            
            <!-- LINHA 4: Complexidade, Gênero, Região -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">COMPLEXIDADE *</label>
                    <select id="admComplexidade" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="I">I - Baixa</option>
                        <option value="II" selected>II - Média</option>
                        <option value="III">III - Alta</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">GÊNERO *</label>
                    <select id="admGenero" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">REGIÃO *</label>
                    <select id="admRegiao" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        <option value="Zona Central">Zona Central</option>
                        <option value="Zona Sul">Zona Sul</option>
                        <option value="Zona Norte">Zona Norte</option>
                        <option value="Zona Leste">Zona Leste</option>
                        <option value="Zona Oeste">Zona Oeste</option>
                        <option value="ABC">ABC</option>
                        <option value="Guarulhos">Guarulhos</option>
                        <option value="Osasco">Osasco</option>
                        <option value="Outra">Outra</option>
                    </select>
                </div>
            </div>
            
            <!-- LINHA 5: Isolamento -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 10px; text-transform: uppercase;">
                    Isolamento
                </label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <label style="display: flex; align-items: center; padding: 12px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                        <input type="radio" name="admIsolamento" value="Não Isolamento" checked style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-size: 12px; font-weight: 500;">Não Isolamento</span>
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                        <input type="radio" name="admIsolamento" value="Isolamento" style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-size: 12px; font-weight: 500;">Isolamento</span>
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                        <input type="radio" name="admIsolamento" value="Isolamento De Contato" style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-size: 12px; font-weight: 500;">Isolamento De Contato</span>
                    </label>
                </div>
            </div>
            
            <!-- LINHA 6: Diretivas -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px; text-transform: uppercase;">
                    Diretivas
                </label>
                <select id="admDiretivas"
                        style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                    <option value="Não se aplica" selected>Não se aplica</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                </select>
            </div>
            
            <!-- SEÇÃO: Concessões -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 12px; color: #555; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; background: #e3f2fd; padding: 10px; border-radius: 8px;">
                    💊 Concessões
                </label>
                <div id="admConcessoes" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 200px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    ${window.CONCESSOES_VALIDAS?.map(c => `
                        <label style="display: flex; align-items: center; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer;">
                            <input type="checkbox" value="${c}" style="margin-right: 8px; width: 16px; height: 16px;">
                            <span style="font-size: 12px;">${c}</span>
                        </label>
                    `).join('') || ''}
                </div>
            </div>
            
            <!-- SEÇÃO: Linhas de Cuidado -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 12px; color: #555; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; background: #fff3e0; padding: 10px; border-radius: 8px;">
                    🏥 Linhas de Cuidado
                </label>
                <div id="admLinhas" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 250px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    ${window.LINHAS_VALIDAS?.map(l => `
                        <label style="display: flex; align-items: center; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer;">
                            <input type="checkbox" value="${l}" style="margin-right: 8px; width: 16px; height: 16px;">
                            <span style="font-size: 12px;">${l}</span>
                        </label>
                    `).join('') || ''}
                </div>
            </div>
            
            <!-- BOTÕES DE AÇÃO -->
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="btn-cancelar" style="flex: 1; padding: 14px; background: #757575; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    ❌ CANCELAR
                </button>
                <button class="btn-salvar" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    ✅ ADMITIR PACIENTE
                </button>
            </div>
        </div>
    `;
}

// =================== FORMULÁRIO DE ATUALIZAÇÃO ===================
function createFormularioAtualizacao(hospitalNome, leitoNumero, dadosLeito) {
    // Calcular tempo internado
    const dataAdmissao = dadosLeito.dataAdmissao || '';
    const horaAdmissao = dadosLeito.horaAdmissao || '';
    let tempoInternado = '';
    
    if (dataAdmissao && horaAdmissao) {
        try {
            const [dia, mes, ano] = dataAdmissao.split('/');
            const [hora, minuto] = horaAdmissao.split(':');
            const dataHoraAdmissao = new Date(ano, mes - 1, dia, hora, minuto);
            const agora = new Date();
            const diffMs = agora - dataHoraAdmissao;
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDias = Math.floor(diffHoras / 24);
            
            if (diffDias > 0) {
                tempoInternado = `${diffDias}d ${diffHoras % 24}h`;
            } else {
                tempoInternado = `${diffHoras}h`;
            }
        } catch (e) {
            tempoInternado = 'N/A';
        }
    }
    
    // Opções de idade (14-115 anos)
    const idadeOptions = Array.from({length: 102}, (_, i) => {
        const idade = i + 14;
        const selected = dadosLeito.idade == idade ? 'selected' : '';
        return `<option value="${idade}" ${selected}>${idade} anos</option>`;
    }).join('');
    
    const identificacaoLeito = dadosLeito.identificacaoLeito || '';
    const tipoLeito = dadosLeito.tipo || 'Leito';
    
    return `
        <div class="modal-content" style="background: white; border-radius: 16px; padding: 25px; max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto;">
            
            <!-- ✅ HEADER CORRIGIDO: SEM EMOJI, 1 LINHA, COM IDENTIFICAÇÃO -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600;">
                    ATUALIZAÇÃO DE DADOS | Hospital: ${hospitalNome} | Leito: ${identificacaoLeito || leitoNumero} | ${tipoLeito}
                </h2>
            </div>
            
            <!-- LINHA 1: Identificação do Leito (OBRIGATÓRIO) -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px; text-transform: uppercase;">
                    Identificação do Leito *
                </label>
                <input type="text" id="updIdentificacaoLeito" 
                       value="${identificacaoLeito}" 
                       placeholder="Ex: NEO1, ALE4, UTI-5" 
                       maxlength="6" 
                       pattern="[A-Za-z0-9]{1,6}" 
                       required
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
            </div>
            
            <!-- LINHA 2: Nome (readonly), Matrícula (readonly), Idade (editável) -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">NOME COMPLETO</label>
                    <input type="text" value="${dadosLeito.nome || ''}" readonly
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #f5f5f5; cursor: not-allowed;">
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">MATRÍCULA</label>
                    <input type="text" value="${dadosLeito.matricula || ''}" readonly
                           style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #f5f5f5; cursor: not-allowed;">
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">IDADE *</label>
                    <select id="updIdade" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        ${idadeOptions}
                    </select>
                </div>
            </div>
            
            <!-- LINHA 3: PPS, SPICT, Previsão Alta -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">PPS % *</label>
                    <select id="updPPS" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        ${[10,20,30,40,50,60,70,80,90,100].map(v => 
                            `<option value="${v}" ${dadosLeito.pps == v ? 'selected' : ''}>${v}%</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">SPICT *</label>
                    <select id="updSPICT" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="nao_elegivel" ${dadosLeito.spict === 'nao_elegivel' ? 'selected' : ''}>Não Elegível</option>
                        <option value="elegivel" ${dadosLeito.spict === 'elegivel' ? 'selected' : ''}>Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">PREVISÃO ALTA *</label>
                    <select id="updPrevAlta" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="SP" ${dadosLeito.prevAlta === 'SP' ? 'selected' : ''}>SP (Sem Previsão)</option>
                        <option value="1-3" ${dadosLeito.prevAlta === '1-3' ? 'selected' : ''}>1-3 dias</option>
                        <option value="4-7" ${dadosLeito.prevAlta === '4-7' ? 'selected' : ''}>4-7 dias</option>
                        <option value="8-15" ${dadosLeito.prevAlta === '8-15' ? 'selected' : ''}>8-15 dias</option>
                        <option value="+15" ${dadosLeito.prevAlta === '+15' ? 'selected' : ''}>+15 dias</option>
                    </select>
                </div>
            </div>
            
            <!-- LINHA 4: Complexidade, Gênero, Região -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">COMPLEXIDADE *</label>
                    <select id="updComplexidade" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="I" ${dadosLeito.complexidade === 'I' ? 'selected' : ''}>I - Baixa</option>
                        <option value="II" ${dadosLeito.complexidade === 'II' ? 'selected' : ''}>II - Média</option>
                        <option value="III" ${dadosLeito.complexidade === 'III' ? 'selected' : ''}>III - Alta</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">GÊNERO *</label>
                    <select id="updGenero" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        <option value="Masculino" ${dadosLeito.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
                        <option value="Feminino" ${dadosLeito.genero === 'Feminino' ? 'selected' : ''}>Feminino</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px;">REGIÃO *</label>
                    <select id="updRegiao" required
                            style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                        <option value="">Selecionar...</option>
                        ${['Zona Central', 'Zona Sul', 'Zona Norte', 'Zona Leste', 'Zona Oeste', 'ABC', 'Guarulhos', 'Osasco', 'Outra'].map(r => 
                            `<option value="${r}" ${dadosLeito.regiao === r ? 'selected' : ''}>${r}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <!-- LINHA 5: Isolamento -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 10px; text-transform: uppercase;">
                    Isolamento
                </label>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <label style="display: flex; align-items: center; padding: 12px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                        <input type="radio" name="updIsolamento" value="Não Isolamento" ${dadosLeito.isolamento === 'Não Isolamento' ? 'checked' : ''} style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-size: 12px; font-weight: 500;">Não Isolamento</span>
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                        <input type="radio" name="updIsolamento" value="Isolamento" ${dadosLeito.isolamento === 'Isolamento' ? 'checked' : ''} style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-size: 12px; font-weight: 500;">Isolamento</span>
                    </label>
                    <label style="display: flex; align-items: center; padding: 12px; background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                        <input type="radio" name="updIsolamento" value="Isolamento De Contato" ${dadosLeito.isolamento === 'Isolamento De Contato' ? 'checked' : ''} style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-size: 12px; font-weight: 500;">Isolamento De Contato</span>
                    </label>
                </div>
            </div>
            
            <!-- LINHA 6: Diretivas -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 11px; color: #555; font-weight: 600; margin-bottom: 5px; text-transform: uppercase;">
                    Diretivas
                </label>
                <select id="updDiretivas"
                        style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px;">
                    <option value="Não se aplica" ${dadosLeito.diretivas === 'Não se aplica' ? 'selected' : ''}>Não se aplica</option>
                    <option value="Sim" ${dadosLeito.diretivas === 'Sim' ? 'selected' : ''}>Sim</option>
                    <option value="Não" ${dadosLeito.diretivas === 'Não' ? 'selected' : ''}>Não</option>
                </select>
            </div>
            
            <!-- SEÇÃO: Concessões -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 12px; color: #555; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; background: #e3f2fd; padding: 10px; border-radius: 8px;">
                    💊 Concessões
                </label>
                <div id="updConcessoes" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 200px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    ${window.CONCESSOES_VALIDAS?.map(c => `
                        <label style="display: flex; align-items: center; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer;">
                            <input type="checkbox" value="${c}" style="margin-right: 8px; width: 16px; height: 16px;">
                            <span style="font-size: 12px;">${c}</span>
                        </label>
                    `).join('') || ''}
                </div>
            </div>
            
            <!-- SEÇÃO: Linhas de Cuidado -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-size: 12px; color: #555; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; background: #fff3e0; padding: 10px; border-radius: 8px;">
                    🏥 Linhas de Cuidado
                </label>
                <div id="updLinhas" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 250px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    ${window.LINHAS_VALIDAS?.map(l => `
                        <label style="display: flex; align-items: center; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer;">
                            <input type="checkbox" value="${l}" style="margin-right: 8px; width: 16px; height: 16px;">
                            <span style="font-size: 12px;">${l}</span>
                        </label>
                    `).join('') || ''}
                </div>
            </div>
            
            <!-- ✅ RODAPÉ: Admissão e Tempo Internado -->
            <div style="padding: 12px; background: #f5f5f5; border-radius: 8px; margin-bottom: 20px; text-align: center; opacity: 0.7;">
                <span style="font-size: 11px; color: #666;">
                    Admissão: ${dataAdmissao}, ${horaAdmissao} | Internado: ${tempoInternado}
                </span>
            </div>
            
            <!-- BOTÕES DE AÇÃO -->
            <div style="display: flex; gap: 15px;">
                <button class="btn-cancelar" style="flex: 1; padding: 14px; background: #757575; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    ❌ CANCELAR
                </button>
                <button class="btn-salvar" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    💾 SALVAR ALTERAÇÕES
                </button>
                <button class="btn-alta" style="flex: 1; padding: 14px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    🚪 DAR ALTA
                </button>
            </div>
        </div>
    `;
}

// =================== PRÉ-MARCAÇÃO DE CHECKBOXES ===================
function preMarcarCheckboxes(modal, dadosLeito) {
    if (!dadosLeito) return;
    
    // Pré-marcar concessões
    const concessoes = dadosLeito.concessoes || [];
    if (Array.isArray(concessoes)) {
        concessoes.forEach(concessao => {
            const checkbox = modal.querySelector(`#updConcessoes input[value="${concessao}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
    
    // Pré-marcar linhas
    const linhas = dadosLeito.linhas || [];
    if (Array.isArray(linhas)) {
        linhas.forEach(linha => {
            const checkbox = modal.querySelector(`#updLinhas input[value="${linha}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
    
    logInfo(`Pré-marcação: ${concessoes.length} concessões + ${linhas.length} linhas`);
}

// =================== EVENT LISTENERS DOS MODAIS ===================
function setupModalEventListeners(modal, tipo) {
    // Botão Cancelar
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
            logInfo('Modal cancelado');
        });
    }
    
    // Botão Salvar
    const btnSalvar = modal.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // VALIDAÇÃO: Campo identificação obrigatório
            const identificacaoField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoLeito' : '#updIdentificacaoLeito');
            if (!identificacaoField || !identificacaoField.value.trim()) {
                showErrorMessage('❌ Campo "Identificação do Leito" é obrigatório!');
                if (identificacaoField) identificacaoField.focus();
                return;
            }
            
            const originalText = this.innerHTML;
            showButtonLoading(this, tipo === 'admissao' ? 'ADMITINDO...' : 'SALVANDO...');
            
            try {
                const dadosFormulario = coletarDadosFormulario(modal, tipo);
                
                if (tipo === 'admissao') {
                    await window.admitirPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Paciente admitido com sucesso!');
                } else {
                    await window.atualizarPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Dados atualizados com sucesso!');
                }
                
                hideButtonLoading(this, originalText);
                closeModal(modal);
                
                // Refresh automático
                if (typeof window.refreshAfterAction === 'function') {
                    await window.refreshAfterAction();
                }
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro: ' + error.message);
                logError('Erro ao salvar:', error);
            }
        });
    }
    
    // Botão Alta (apenas no modal de atualização)
    const btnAlta = modal.querySelector('.btn-alta');
    if (btnAlta) {
        btnAlta.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!confirm('⚠️ Confirma dar alta neste paciente?')) return;
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'PROCESSANDO...');
            
            try {
                await window.darAltaPaciente(window.currentHospital, window.selectedLeito);
                
                hideButtonLoading(this, originalText);
                showSuccessMessage('✅ Alta processada com sucesso!');
                closeModal(modal);
                
                // Refresh automático
                if (typeof window.refreshAfterAction === 'function') {
                    await window.refreshAfterAction();
                }
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao processar alta: ' + error.message);
                logError('Erro ao dar alta:', error);
            }
        });
    }
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
        }
    });
}

// =================== FECHAR MODAL ===================
function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            window.selectedLeito = null;
            logInfo('Modal fechado');
        }, 300);
    }
}

// =================== COLETAR DADOS DO FORMULÁRIO ===================
function coletarDadosFormulario(modal, tipo) {
    const prefix = tipo === 'admissao' ? 'adm' : 'upd';
    
    const dados = {
        hospital: window.currentHospital,
        leito: window.selectedLeito,
        identificacaoLeito: modal.querySelector(`#${prefix}IdentificacaoLeito`)?.value?.trim()?.toUpperCase() || '',
        idade: parseInt(modal.querySelector(`#${prefix}Idade`)?.value) || null,
        pps: modal.querySelector(`#${prefix}PPS`)?.value?.replace('%', '') || null,
        spict: modal.querySelector(`#${prefix}SPICT`)?.value || 'nao_elegivel',
        complexidade: modal.querySelector(`#${prefix}Complexidade`)?.value || 'II',
        prevAlta: modal.querySelector(`#${prefix}PrevAlta`)?.value || 'SP',
        isolamento: modal.querySelector(`input[name="${prefix}Isolamento"]:checked`)?.value || 'Não Isolamento',
        genero: modal.querySelector(`#${prefix}Genero`)?.value || '',
        regiao: modal.querySelector(`#${prefix}Regiao`)?.value || '',
        diretivas: modal.querySelector(`#${prefix}Diretivas`)?.value || 'Não se aplica'
    };
    
    // Campos específicos de admissão
    if (tipo === 'admissao') {
        dados.nome = modal.querySelector('#admNome')?.value?.trim() || '';
        dados.matricula = modal.querySelector('#admMatricula')?.value?.trim() || '';
    }
    
    // Coletar concessões
    const concessoes = [];
    modal.querySelectorAll(`#${prefix}Concessoes input[type="checkbox"]:checked`).forEach(checkbox => {
        concessoes.push(checkbox.value);
    });
    dados.concessoes = concessoes;
    
    // Coletar linhas
    const linhas = [];
    modal.querySelectorAll(`#${prefix}Linhas input[type="checkbox"]:checked`).forEach(checkbox => {
        linhas.push(checkbox.value);
    });
    dados.linhas = linhas;
    
    logInfo(`Dados coletados: ${JSON.stringify({...dados, concessoes: concessoes.length, linhas: linhas.length})}`);
    
    return dados;
}

// =================== RENDERIZAR CARDS (FUNÇÃO PRINCIPAL) ===================
window.renderCards = function() {
    logInfo('🎨 Renderizando cards V3.3...');
    
    const container = document.getElementById('cardsContainer');
    if (!container) {
        logError('❌ Container #cardsContainer não encontrado!');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Hospital atual
    const hospitalId = window.currentHospital || 'H1';
    logInfo(`Hospital atual: ${hospitalId}`);
    
    // ✅ CORREÇÃO: Usar window.hospitalData[H1].leitos
    if (!window.hospitalData || !window.hospitalData[hospitalId]) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; background: #fff; border-radius: 12px;"><h3>⚠️ Carregando dados...</h3></div>';
        logError(`Hospital ${hospitalId} não encontrado em window.hospitalData`);
        return;
    }
    
    const leitos = window.hospitalData[hospitalId].leitos || [];
    logInfo(`✅ ${leitos.length} leitos encontrados para ${hospitalId}`);
    
    if (leitos.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; background: #fff; border-radius: 12px;"><h3>📋 Nenhum leito disponível</h3></div>';
        return;
    }
    
    // Renderizar cada leito
    leitos.forEach(leito => {
        const card = createCard(leito, hospitalId);
        container.appendChild(card);
    });
    
    logInfo(`✅ ${leitos.length} cards renderizados com sucesso!`);
};

// =================== CRIAR CARD (ELEMENTO DOM) ===================
function createCard(leito, hospitalId) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = createCardHTML(leito, hospitalId);
    
    // Adicionar event listeners aos botões
    setTimeout(() => {
        const btnAdmitir = div.querySelector('[data-action="admitir"]');
        if (btnAdmitir) {
            btnAdmitir.addEventListener('click', handleAdmitirClick);
        }
        
        const btnAtualizar = div.querySelector('[data-action="atualizar"]');
        if (btnAtualizar) {
            btnAtualizar.addEventListener('click', (e) => handleAtualizarClick(e, leito));
        }
    }, 0);
    
    return div;
}

// =================== CRIAR CARD HTML ===================
// ✅ CORREÇÃO: Mostrar tipo correto (Apartamento/Enfermaria/Híbrido)
function createCardHTML(leito, hospitalId) {
    const isOcupado = leito.status === 'Em uso';
    const isBloqueado = leito.bloqueado === true;
    
    // ✅ DETERMINAR TIPO CORRETO DO LEITO
    let tipoLeito = leito.tipo || 'N/A';
    if (leito.categoriaEscolhida) {
        tipoLeito = leito.categoriaEscolhida; // Apartamento ou Enfermaria (escolha do médico)
    }
    
    // Calcular tempo internado
    let tempoInternado = '';
    if (isOcupado && leito.dataAdmissao && leito.horaAdmissao) {
        try {
            const [dia, mes, ano] = leito.dataAdmissao.split('/');
            const [hora, minuto] = leito.horaAdmissao.split(':');
            const dataHoraAdmissao = new Date(ano, mes - 1, dia, hora, minuto);
            const agora = new Date();
            const diffMs = agora - dataHoraAdmissao;
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDias = Math.floor(diffHoras / 24);
            
            if (diffDias > 0) {
                tempoInternado = `${diffDias}d`;
            } else {
                tempoInternado = `${diffHoras}h`;
            }
        } catch (e) {
            tempoInternado = 'N/A';
        }
    }
    
    if (isBloqueado) {
        return `
            <div class="card bloqueado" style="background: #ffebee; border-left: 4px solid #d32f2f; opacity: 0.7;">
                <h3 style="color: #d32f2f; margin-bottom: 15px;">
                    🔒 ${hospital}.${leito.leito} - BLOQUEADO
                </h3>
                <div style="padding: 15px; background: #ffcdd2; border-radius: 8px; text-align: center;">
                    <p style="font-size: 14px; font-weight: 600; color: #b71c1c; margin: 0;">
                        ${leito.motivoBloqueio || 'Leito bloqueado'}
                    </p>
                </div>
            </div>
        `;
    }
    
    if (!isOcupado) {
        return `
            <div class="card vago" data-status="vago" style="background: #F0F4F8; border-left: 4px solid #4CAF50;">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">
                    🟢 ${hospitalId}.${leito.leito} - VAGO
                </h3>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px; margin-bottom: 15px;">
                    <p style="font-size: 13px; font-weight: 600; color: #555; margin: 0;">
                        Tipo: ${tipoLeito}
                    </p>
                </div>
                <button class="btn-action" data-action="admitir" data-leito="${leito.leito}"
                        style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                    ✅ ADMITIR PACIENTE
                </button>
            </div>
        `;
    }
    
    // CARD OCUPADO
    return `
        <div class="card ocupado" data-status="ocupado" style="background: #FFF8E1; border-left: 4px solid #FFA726;">
            <h3 style="color: #F57C00; margin-bottom: 15px;">
                🔴 ${hospitalId}.${leito.leito} - OCUPADO
            </h3>
            
            <!-- LINHA 1: Tipo, Complexidade, Tempo -->
            <div class="card-row-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">TIPO</div>
                    <div style="font-size: 12px; font-weight: 600; color: #333;">${tipoLeito}</div>
                </div>
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">COMPLEX</div>
                    <div style="font-size: 14px; font-weight: 600; color: #F57C00;">${leito.complexidade || 'N/A'}</div>
                </div>
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">TEMPO</div>
                    <div style="font-size: 12px; font-weight: 600; color: #333;">${tempoInternado}</div>
                </div>
            </div>
            
            <!-- LINHA 2: Paciente, Idade, Matrícula -->
            <div class="card-row-2" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">PACIENTE</div>
                    <div style="font-size: 12px; font-weight: 600; color: #333;">${leito.nome || leito.iniciais || 'N/A'}</div>
                </div>
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">IDADE</div>
                    <div style="font-size: 12px; font-weight: 600; color: #333;">${leito.idade || 'N/A'}a</div>
                </div>
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">MATRÍCULA</div>
                    <div style="font-size: 11px; font-weight: 600; color: #333;">${leito.matricula || 'N/A'}</div>
                </div>
            </div>
            
            <!-- LINHA 3: PPS, SPICT, Alta -->
            <div class="card-row-3" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">PPS</div>
                    <div style="font-size: 14px; font-weight: 600; color: #2196F3;">${leito.pps || 'N/A'}%</div>
                </div>
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">SPICT</div>
                    <div style="font-size: 11px; font-weight: 600; color: ${leito.spict === 'elegivel' ? '#4CAF50' : '#999'};">
                        ${leito.spict === 'elegivel' ? 'ELEG' : 'N/ELEG'}
                    </div>
                </div>
                <div style="background: #fff; padding: 10px 8px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">ALTA</div>
                    <div style="font-size: 11px; font-weight: 600; color: #333;">${leito.prevAlta || 'SP'}</div>
                </div>
            </div>
            
            <!-- SEÇÃO: Concessões -->
            ${leito.concessoes && leito.concessoes.length > 0 ? `
                <div class="card-section" style="margin-bottom: 12px;">
                    <div class="section-title" style="font-size: 11px; padding: 6px 8px; background: #e3f2fd; border-radius: 4px; margin-bottom: 8px; font-weight: 600;">
                        💊 CONCESSÕES (${leito.concessoes.length})
                    </div>
                    <div class="chips-container" style="display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; background: #f5f5f5; border-radius: 4px; min-height: 30px;">
                        ${leito.concessoes.map(c => `
                            <span class="chip" style="background: #2196F3; color: white; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
                                ${c.length > 15 ? c.substring(0, 13) + '...' : c}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- SEÇÃO: Linhas de Cuidado -->
            ${leito.linhas && leito.linhas.length > 0 ? `
                <div class="card-section" style="margin-bottom: 15px;">
                    <div class="section-title" style="font-size: 11px; padding: 6px 8px; background: #fff3e0; border-radius: 4px; margin-bottom: 8px; font-weight: 600;">
                        🏥 LINHAS (${leito.linhas.length})
                    </div>
                    <div class="chips-container" style="display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; background: #f5f5f5; border-radius: 4px; min-height: 30px;">
                        ${leito.linhas.map(l => `
                            <span class="chip" style="background: #FF9800; color: white; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
                                ${l.length > 15 ? l.substring(0, 13) + '...' : l}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- BOTÃO ATUALIZAR -->
            <button class="btn-action" data-action="atualizar" data-leito="${leito.leito}"
                    style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                📝 ATUALIZAR DADOS
            </button>
        </div>
    `;
}

// =================== INICIALIZAÇÃO ===================
logInfo('====================================');
logInfo('📋 CARDS.JS V3.3 CARREGADO');
logInfo('✅ Todas as correções implementadas:');
logInfo('  1. Header sem emoji, 1 linha, com identificação');
logInfo('  2. Campo Diretivas não duplicado');
logInfo('  3. Modal ATUALIZAR igual ao ADMITIR');
logInfo('  4. Rodapé com admissão + tempo internado');
logInfo('  5. Campo TIPO mostra Apartamento/Enfermaria');
logInfo('✅ CSS responsivo consolidado');
logInfo('✅ Layout 3x3 forçado no mobile');
logInfo('✅ Checkboxes múltiplas seleções');
logInfo('✅ Validações completas');
logInfo('====================================');
