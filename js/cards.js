// =================== CARDS.JS V3.2 - ESTRUTURA 4 LINHAS IMPLEMENTADA ===================
// =================== TODO CSS RESPONSIVO INCLUÍDO - SEM mobile.css ===================

// =================== VARIÁVEIS GLOBAIS ===================  
window.selectedLeito = null;
window.currentHospital = 'H1';

// =================== MAPEAMENTO DE HOSPITAIS V3.2 ===================
window.HOSPITAL_MAPPING = {
    H1: 'Neomater',
    H2: 'Cruz Azul', 
    H3: 'Santa Marcelina',
    H4: 'Santa Clara'
};

// =================== CORREÇÃO #7: LISTAS ATUALIZADAS CONFORME MANUAL ===================
window.CONCESSOES_LIST = [
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

window.LINHAS_CUIDADO_LIST = [
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
    "Medicina Domiciliar",
    "Nefrologia",
    "Neurocirurgia",
    "Neurologia",
    "Oftalmologia",
    "Onco-Hematologia",
    "Oncologia Clínica",
    "Ortopedia",
    "Otorrinolaringologia",
    "Pediatria",
    "Pneumologia",
    "Psiquiatria",
    "Reumatologia",
    "Urologista"
];

window.PPS_OPTIONS = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

// TIMELINE CORRIGIDA - 10 OPÇÕES
window.PREVISAO_ALTA_OPTIONS = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R', 
    '48h', '72h', '96h', 'SP'
];

// *** NOVA V3.1: OPÇÕES DE ISOLAMENTO (COLUNA AS) ***
window.ISOLAMENTO_OPTIONS = [
    'NÃO ISOLAMENTO',
    'ISOLAMENTO DE CONTATO', 
    'ISOLAMENTO RESPIRATÓRIO'
];

// *** NOVA V3.2: OPÇÕES DE REGIÃO - 9 OPÇÕES CONFORME ESPECIFICADO ***
window.REGIAO_OPTIONS = [
    'Zona Central',
    'Zona Sul',
    'Zona Norte',
    'Zona Leste',
    'Zona Oeste',
    'ABC',
    'Guarulhos',
    'Osasco',
    'Outra'
];

// *** NOVA V3.2: OPÇÕES DE SEXO ***
window.SEXO_OPTIONS = [
    'M',
    'F'
];

// *** NOVA V3.1: OPÇÕES DE IDADE DROPDOWN 14-115 ANOS (MOBILE) ***
window.IDADE_OPTIONS = [];
for (let i = 14; i <= 115; i++) {
    window.IDADE_OPTIONS.push(i);
}

// =================== FUNÇÃO: SELECT HOSPITAL ===================
window.selectHospital = function(hospitalId) {
    logInfo(`Selecionando hospital: ${hospitalId} (${window.HOSPITAL_MAPPING[hospitalId]})`);
    
    window.currentHospital = hospitalId;
    
    // Atualizar botões visuais
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.hospital === hospitalId) {
            btn.classList.add('active');
        }
    });
    
    window.renderCards();
    
    logSuccess(`Hospital selecionado: ${window.HOSPITAL_MAPPING[hospitalId]}`);
};

// =================== FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO ===================
window.renderCards = function() {
    logInfo('Renderizando cards V3.2 com estrutura 4 linhas - dados REAIS da API (incluindo AS/AT)');
    
    const container = document.getElementById('cardsContainer');
    if (!container) {
        logError('Container cardsContainer não encontrado');
        return;
    }

    container.innerHTML = '';
    const hospitalId = window.currentHospital || 'H1';
    const hospital = window.hospitalData[hospitalId];
    
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    if (!hospital || !hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="color: #60a5fa; margin-bottom: 15px;">
                    <h3>📋 ${hospitalNome}</h3>
                </div>
                <div style="background: rgba(96,165,250,0.1); border-radius: 8px; padding: 20px;">
                    <p style="margin-bottom: 15px;">Carregando dados da planilha V3.2 (46 colunas)...</p>
                    <p style="color: #28a745;"><em>✅ API V3.2 conectada - 11 concessões + 45 linhas + 4 linhas cards</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    hospital.leitos.forEach(leito => {
        const card = createCard(leito, hospitalNome);
        container.appendChild(card);
    });
    
    logInfo(`${hospital.leitos.length} cards V3.2 estrutura 4 linhas renderizados para ${hospitalNome}`);
};

// =================== FUNÇÃO: BADGE DE ISOLAMENTO ===================
function getBadgeIsolamento(isolamento) {
    if (!isolamento || isolamento === 'NÃO ISOLAMENTO') {
        return {
            cor: '#9ca3af',
            icone: '⚪',
            texto: 'Não Isolamento',
            textoCor: '#ffffff'
        };
    } else if (isolamento === 'ISOLAMENTO DE CONTATO') {
        return {
            cor: '#f59e0b',
            icone: '🟡',
            texto: 'Isolamento de Contato',
            textoCor: '#000000'
        };
    } else if (isolamento === 'ISOLAMENTO RESPIRATÓRIO') {
        return {
            cor: '#ef4444',
            icone: '🔴',
            texto: 'Isolamento Respiratório',
            textoCor: '#ffffff'
        };
    }
    return getBadgeIsolamento('NÃO ISOLAMENTO'); // Fallback
}

// =================== CRIAR CARD INDIVIDUAL V3.2 COM ESTRUTURA 4 LINHAS ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: var(--card); border-radius: 12px; padding: 20px; color: var(--text-white); box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    // *** CORREÇÃO FINAL: STATUS E CORES HARDCODED ***
    let isVago = false;
    let leitoBgColor = '#22c55e'; // VERDE PADRÃO
    let leitoTextColor = '#000000';
    
    // Normalizar status
    if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
        isVago = false;
        leitoBgColor = '#fbbf24'; // AMARELO PARA OCUPADO
        leitoTextColor = '#000000';
    } else if (leito.status === 'Vago' || leito.status === 'vago') {
        isVago = true;
        leitoBgColor = '#22c55e'; // VERDE PARA VAGO
        leitoTextColor = '#000000';
    }
    
    // Dados do paciente
    const nome = leito.nome || '';
    const matricula = leito.matricula || '';
    const idade = leito.idade || null;
    const admissao = leito.admAt || '';
    const pps = leito.pps || null;
    const spict = leito.spict || '';
    const previsaoAlta = leito.prevAlta || '';
    
    // *** NOVA V3.1: DADOS ISOLAMENTO E IDENTIFICAÇÃO ***
    const isolamento = leito.isolamento || 'NÃO ISOLAMENTO';
    const identificacaoLeito = leito.identificacaoLeito || '';
    const badgeIsolamento = getBadgeIsolamento(isolamento);
    
    // *** NOVA V3.2: DADOS REGIÃO E SEXO (VAZIOS POR ENQUANTO) ***
    const regiao = leito.regiao || '';
    const sexo = leito.sexo || '';
    
    // Arrays diretos - sem parsing
    const concessoes = Array.isArray(leito.concessoes) ? leito.concessoes : [];
    const linhas = Array.isArray(leito.linhas) ? leito.linhas : [];
    
    // Calcular tempo de internação
    let tempoInternacao = '';
    if (!isVago && admissao) {
        tempoInternacao = calcularTempoInternacao(admissao);
    }
    
    // *** CORREÇÃO V3.1: EXTRAIR APENAS INICIAIS DO NOME ***
    const iniciais = isVago ? '—' : getIniciais(nome);
    
    // Formatar PPS
    let ppsFormatado = pps ? `${pps}%` : '—';
    if (ppsFormatado !== '—' && !ppsFormatado.includes('%')) {
        ppsFormatado = `${pps}%`;
    }
    
    // Formatar SPICT-BR
    const spictFormatado = spict === 'elegivel' ? 'Elegível' : 
                          (spict === 'nao_elegivel' ? 'Não elegível' : '—');
    
    const numeroLeito = leito.leito || leito.numero || 'N/A';
    
    // *** CORREÇÃO 1: NOVA ESTRUTURA DO HEADER - ID SEQUENCIAL + LEITO PERSONALIZADO ***
    const idSequencial = String(numeroLeito).padStart(2, '0'); // 01, 02, 03...
    const leitoPersonalizado = (identificacaoLeito && identificacaoLeito.trim()) 
        ? identificacaoLeito.trim().toUpperCase()
        : `LEITO ${numeroLeito}`;
    
    // HTML do Card V3.2 (layout NOVA ESTRUTURA: 4 LINHAS)
    card.innerHTML = `
        <div class="card-row-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">HOSPITAL</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${hospitalNome}</div>
            </div>
            
            <div style="min-height: 50px; display: flex; align-items: center; justify-content: center;">
                <div class="leito-badge ${isVago ? '' : 'ocupado'}" style="background: ${leitoBgColor}; color: ${leitoTextColor}; width: 100%; padding: 15px 8px; border-radius: 8px; font-weight: 700; text-transform: uppercase; text-align: center; font-size: 12px; letter-spacing: 1px;">
                    ${leitoPersonalizado}
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">TIPO</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${leito.tipo === 'UTI' ? 'UTI' : 'ENF/APTO'}</div>
            </div>
        </div>

        <div class="card-row-2" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="background: ${badgeIsolamento.cor}; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="color: ${badgeIsolamento.textoCor}; font-weight: 600; font-size: 12px; line-height: 1.2; display: flex; align-items: center; text-align: center; justify-content: center;">
                    ${badgeIsolamento.texto}
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">REGIÃO</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${regiao || '—'}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">SEXO</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${sexo || '—'}</div>
            </div>
        </div>

        <div class="card-row-3" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">INICIAIS</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${iniciais}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">MATRÍCULA</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${matricula || '—'}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">IDADE</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${idade ? idade + ' anos' : '—'}</div>
            </div>
        </div>

        <div class="card-row-4" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">PPS</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${ppsFormatado}</div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">SPICT-BR</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 12px; line-height: 1.2;">${spictFormatado}</div>
            </div>
            
            <div style="background: var(--destaque); border: 1px solid rgba(143,211,244,0.5); border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 10px; color: #000000; font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">PREV ALTA</div>
                <div style="color: #000000; font-weight: 700; font-size: 12px; line-height: 1.2;">${previsaoAlta || '—'}</div>
            </div>
        </div>

        <div class="card-section" style="margin-bottom: 15px;">
            <div class="section-title" style="font-size: 11px; color: #ffffff; background: #60a5fa; padding: 8px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; font-weight: 700;">
                CONCESSÕES PREVISTAS NA ALTA
            </div>
            <div class="chips-container" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                ${(concessoes && concessoes.length > 0) 
                    ? concessoes.map(concessao => `<span class="chip" style="font-size: 10px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 3px 8px; border-radius: 12px; font-weight: 600;">${concessao}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <div class="card-section" style="margin-bottom: 15px;">
            <div class="section-title" style="font-size: 11px; color: #ffffff; background: #60a5fa; padding: 8px; border-radius: 4px; margin-bottom: 8px; text-transform: uppercase; font-weight: 700;">
                LINHAS DE CUIDADO PREVISTAS NA ALTA
            </div>
            <div class="chips-container" style="display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                ${(linhas && linhas.length > 0) 
                    ? linhas.map(linha => `<span class="chip" style="font-size: 10px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.3); color: #60a5fa; padding: 3px 8px; border-radius: 12px; font-weight: 600;">${linha}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; margin-bottom: 12px; flex-wrap: wrap;">
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">ADMISSÃO</div>
                    <div style="color: #ffffff; font-weight: 600; font-size: 11px;">${admissao ? formatarDataHora(admissao) : '—'}</div>
                </div>
                
                ${!isVago && tempoInternacao ? `
                <div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">INTERNADO HÁ</div>
                    <div style="color: #ffffff; font-weight: 600; font-size: 11px;">${tempoInternacao}</div>
                </div>
                ` : ''}
                
                ${!isVago ? `
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <div style="background: rgba(96,165,250,0.2); color: #60a5fa; padding: 4px 8px; border-radius: 8px; font-size: 9px; font-weight: 600; text-transform: uppercase;">ID: ${idSequencial}</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            ${isVago 
                ? `<button class="btn-action" data-action="admitir" data-leito="${numeroLeito}" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 12px;">ADMITIR</button>`
                : `<button class="btn-action" data-action="atualizar" data-leito="${numeroLeito}" style="padding: 10px 20px; background: #374151; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-transform: uppercase; font-size: 12px;">ATUALIZAR</button>`
            }
        </div>
    `;

    // Event listeners para os botões
    const admitBtn = card.querySelector('[data-action="admitir"]');
    if (admitBtn) {
        admitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAdmissaoFlow(numeroLeito);
        });
    }
    
    const updateBtn = card.querySelector('[data-action="atualizar"]');
    if (updateBtn) {
        updateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAtualizacaoFlow(numeroLeito, leito);
        });
    }

    return card;
}

// =================== FLUXOS DE ADMISSÃO E ATUALIZAÇÃO ===================
function openAdmissaoFlow(leitoNumero) {
    const button = document.querySelector(`[data-action="admitir"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ADMITIR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAdmissaoModal(leitoNumero);
        logInfo(`Modal de admissão V3.2 estrutura 4 linhas aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

function openAtualizacaoFlow(leitoNumero, dadosLeito) {
    const button = document.querySelector(`[data-action="atualizar"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ATUALIZAR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAtualizacaoModal(leitoNumero, dadosLeito);
        logInfo(`Modal de atualização V3.2 estrutura 4 linhas aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

// =================== MODAIS CORRIGIDOS V3.2 COM REGIÃO/SEXO ===================
function openAdmissaoModal(leitoNumero) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAdmissaoForm(hospitalNome, leitoNumero);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'admissao');
}

function openAtualizacaoModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'atualizacao');
    
    // Forçar pré-marcação com arrays diretos
    setTimeout(() => {
        forcarPreMarcacao(modal, dadosLeito);
    }, 100);
}

function createModalOverlay() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 9999; backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;
    return modal;
}

// *** FORMULÁRIO DE ADMISSÃO V3.2 COM REGIÃO/SEXO ***
function createAdmissaoForm(hospitalNome, leitoNumero) {
    const idSequencial = String(leitoNumero).padStart(2, '0');
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ADMITIR PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>ID:</strong> ${idSequencial} | <strong>Leito:</strong> ${leitoNumero}
            </div>
            
            <!-- CAMPO IDENTIFICAÇÃO PRIMEIRO E OBRIGATÓRIO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        IDENTIFICAÇÃO DO LEITO <span style="color: #ef4444;">*</span>
                    </div>
                </div>
                <input id="admIdentificacaoLeito" type="text" placeholder="Ex: NEO1, UTI-5, ENF12 (máx. 6 caracteres)" maxlength="6" required style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 5px;">Campo alfanumérico obrigatório com até 6 caracteres</div>
            </div>
            
            <!-- ISOLAMENTO, REGIÃO E SEXO - 3 COLUNAS OBRIGATÓRIAS -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        ISOLAMENTO, REGIÃO E SEXO (OBRIGATÓRIOS)
                    </div>
                </div>
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">ISOLAMENTO <span style="color: #ef4444;">*</span></label>
                        <select id="admIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            ${window.ISOLAMENTO_OPTIONS.map((opcao, index) => `<option value="${opcao}" ${index === 0 ? 'selected' : ''}>${opcao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">REGIÃO <span style="color: #ef4444;">*</span></label>
                        <select id="admRegiao" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecionar...</option>
                            ${window.REGIAO_OPTIONS.map(regiao => `<option value="${regiao}">${regiao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SEXO <span style="color: #ef4444;">*</span></label>
                        <select id="admSexo" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecionar...</option>
                            ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}">${sexo}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LAYOUT 3 COLUNAS COM PLACEHOLDER MATRÍCULA CORRIGIDO -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">INICIAIS</label>
                    <input id="admNome" type="text" placeholder="Ex: J S M" maxlength="10" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input id="admMatricula" type="text" placeholder="Ex: 00000-0" maxlength="8" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;" oninput="formatarMatricula(this)">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <select id="admIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.IDADE_OPTIONS.map(idade => `<option value="${idade}">${idade} anos</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select id="admPPS" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.PPS_OPTIONS.map(pps => `<option value="${pps}">${pps}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select id="admSPICT" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="nao_elegivel">Não elegível</option>
                        <option value="elegivel">Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREVISÃO ALTA</label>
                    <select id="admPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="admConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                            <input type="checkbox" value="${c}" style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHAS DE CUIDADO PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="admLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(l => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                            <input type="checkbox" value="${l}" style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${l}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
            </div>
        </div>
    `;
}

// *** FORMULÁRIO DE ATUALIZAÇÃO V3.2 COM REGIÃO/SEXO ***
function createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito) {
    const tempoInternacao = dadosLeito?.admAt ? calcularTempoInternacao(dadosLeito.admAt) : '';
    const iniciais = dadosLeito?.nome ? getIniciais(dadosLeito.nome) : '';
    const idSequencial = String(leitoNumero).padStart(2, '0');
    const leitoPersonalizado = (dadosLeito?.identificacaoLeito && dadosLeito.identificacaoLeito.trim()) 
        ? dadosLeito.identificacaoLeito.trim().toUpperCase()
        : `LEITO ${leitoNumero}`;
    
    // Arrays diretos - sem processamento
    const concessoesAtuais = Array.isArray(dadosLeito?.concessoes) ? dadosLeito.concessoes : [];
    const linhasAtuais = Array.isArray(dadosLeito?.linhas) ? dadosLeito.linhas : [];
    const isolamentoAtual = dadosLeito?.isolamento || 'NÃO ISOLAMENTO';
    const identificacaoAtual = dadosLeito?.identificacaoLeito || '';
    const regiaoAtual = dadosLeito?.regiao || '';
    const sexoAtual = dadosLeito?.sexo || '';
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ATUALIZAR PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>ID:</strong> ${idSequencial} | <strong>Leito:</strong> ${leitoPersonalizado}
            </div>
            
            <!-- CAMPO IDENTIFICAÇÃO PRIMEIRO E OBRIGATÓRIO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        IDENTIFICAÇÃO DO LEITO <span style="color: #ef4444;">*</span>
                    </div>
                </div>
                <input id="updIdentificacaoLeito" type="text" value="${identificacaoAtual}" placeholder="Ex: NEO1, UTI-5, ENF12 (máx. 6 caracteres)" maxlength="6" required style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 5px;">Campo alfanumérico obrigatório com até 6 caracteres</div>
            </div>
            
            <!-- ISOLAMENTO, REGIÃO E SEXO - 3 COLUNAS OBRIGATÓRIAS -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        ISOLAMENTO, REGIÃO E SEXO (OBRIGATÓRIOS)
                    </div>
                </div>
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">ISOLAMENTO <span style="color: #ef4444;">*</span></label>
                        <select id="updIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            ${window.ISOLAMENTO_OPTIONS.map(opcao => `<option value="${opcao}" ${isolamentoAtual === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">REGIÃO <span style="color: #ef4444;">*</span></label>
                        <select id="updRegiao" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecionar...</option>
                            ${window.REGIAO_OPTIONS.map(regiao => `<option value="${regiao}" ${regiaoAtual === regiao ? 'selected' : ''}>${regiao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SEXO <span style="color: #ef4444;">*</span></label>
                        <select id="updSexo" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecionar...</option>
                            ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}" ${sexoAtual === sexo ? 'selected' : ''}>${sexo}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">INICIAIS</label>
                    <input value="${iniciais}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input value="${dadosLeito?.matricula || ''}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <select id="updIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.IDADE_OPTIONS.map(idade => `<option value="${idade}" ${dadosLeito?.idade == idade ? 'selected' : ''}>${idade} anos</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select id="updPPS" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.PPS_OPTIONS.map(pps => `<option value="${pps}" ${dadosLeito?.pps && `${dadosLeito.pps}%` === pps ? 'selected' : ''}>${pps}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select id="updSPICT" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="nao_elegivel" ${dadosLeito?.spict === 'nao_elegivel' ? 'selected' : ''}>Não elegível</option>
                        <option value="elegivel" ${dadosLeito?.spict === 'elegivel' ? 'selected' : ''}>Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREVISÃO ALTA</label>
                    <select id="updPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}" ${dadosLeito?.prevAlta === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="updConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => {
                        const isChecked = concessoesAtuais.includes(c);
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                                <input type="checkbox" value="${c}" ${isChecked ? 'checked' : ''} data-original="${isChecked}" style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${c}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHAS DE CUIDADO PREVISTAS NA ALTA
                    </div>
                </div>
                <div id="updLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(l => {
                        const isChecked = linhasAtuais.includes(l);
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                                <input type="checkbox" value="${l}" ${isChecked ? 'checked' : ''} data-original="${isChecked}" style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${l}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            
            ${tempoInternacao ? `
            <div style="margin-bottom: 20px; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border-left: 4px solid #fbbf24;">
                <strong>Tempo de Internação:</strong> ${tempoInternacao}
            </div>
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-alta" style="padding: 12px 30px; background: #ef4444; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">ALTA</button>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                    <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
                </div>
            </div>
        </div>
    `;
}

// FUNÇÃO DE PRÉ-MARCAÇÃO COM ARRAYS DIRETOS
function forcarPreMarcacao(modal, dadosLeito) {
    logDebug(`Forçando pré-marcação V3.2 estrutura 4 linhas com arrays diretos...`);
    
    const concessoesAtuais = Array.isArray(dadosLeito?.concessoes) ? dadosLeito.concessoes : [];
    const linhasAtuais = Array.isArray(dadosLeito?.linhas) ? dadosLeito.linhas : [];
    
    // Forçar marcação das concessões
    const concessoesCheckboxes = modal.querySelectorAll('#updConcessoes input[type="checkbox"]');
    concessoesCheckboxes.forEach(checkbox => {
        const shouldBeChecked = concessoesAtuais.includes(checkbox.value);
        if (shouldBeChecked && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.setAttribute('checked', 'checked');
        }
    });
    
    // Forçar marcação das linhas de cuidado
    const linhasCheckboxes = modal.querySelectorAll('#updLinhas input[type="checkbox"]');
    linhasCheckboxes.forEach(checkbox => {
        const shouldBeChecked = linhasAtuais.includes(checkbox.value);
        if (shouldBeChecked && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.setAttribute('checked', 'checked');
        }
    });
    
    logDebug(`Pré-marcação V3.2 estrutura 4 linhas concluída com arrays diretos`);
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
            logInfo('Modal V3.2 estrutura 4 linhas cancelado pelo usuário');
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
            if (!identificacaoField.value.trim()) {
                showErrorMessage('❌ Campo "Identificação do Leito" é obrigatório!');
                identificacaoField.focus();
                return;
            }
            
            // VALIDAÇÃO: Campos isolamento, região e sexo obrigatórios
            const isolamentoField = modal.querySelector(tipo === 'admissao' ? '#admIsolamento' : '#updIsolamento');
            const regiaoField = modal.querySelector(tipo === 'admissao' ? '#admRegiao' : '#updRegiao');
            const sexoField = modal.querySelector(tipo === 'admissao' ? '#admSexo' : '#updSexo');
            
            if (!isolamentoField.value) {
                showErrorMessage('❌ Campo "Isolamento" é obrigatório!');
                isolamentoField.focus();
                return;
            }
            
            if (!regiaoField.value) {
                showErrorMessage('❌ Campo "Região" é obrigatório!');
                regiaoField.focus();
                return;
            }
            
            if (!sexoField.value) {
                showErrorMessage('❌ Campo "Sexo" é obrigatório!');
                sexoField.focus();
                return;
            }
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'SALVANDO...');
            
            try {
                const dadosFormulario = coletarDadosFormulario(modal, tipo);
                
                if (tipo === 'admissao') {
                    await window.admitirPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Paciente admitido com sucesso (V3.2 - estrutura 4 linhas + região/sexo)!');
                } else {
                    await window.atualizarPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Dados atualizados com sucesso (V3.2 - estrutura 4 linhas + região/sexo)!');
                }
                
                hideButtonLoading(this, originalText);
                closeModal(modal);
                
                // Refresh automático
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao salvar: ' + error.message);
                logError('Erro ao salvar V3.2 estrutura 4 linhas:', error);
            }
        });
    }
    
    // Botão Alta
    const btnAlta = modal.querySelector('.btn-alta');
    if (btnAlta) {
        btnAlta.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!confirm("Confirmar ALTA deste paciente?")) return;
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'PROCESSANDO ALTA...');
            
            try {
                await window.darAltaPaciente(window.currentHospital, window.selectedLeito);
                
                hideButtonLoading(this, originalText);
                showSuccessMessage('✅ Alta processada (todas as 46 colunas limpas)!');
                closeModal(modal);
                
                // Refresh automático
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao processar alta: ' + error.message);
                logError('Erro ao processar alta V3.2 estrutura 4 linhas:', error);
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

// FUNÇÃO: CLOSE MODAL
function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            window.selectedLeito = null;
            logInfo('Modal V3.2 estrutura 4 linhas fechado');
        }, 300);
    }
}

// *** COLETA DE DADOS V3.2 COM ARRAYS DIRETOS + AS/AT + REGIÃO/SEXO ***
function coletarDadosFormulario(modal, tipo) {
    const dados = {
        hospital: window.currentHospital,
        leito: window.selectedLeito
    };
    
    if (tipo === 'admissao') {
        dados.nome = modal.querySelector('#admNome')?.value?.trim() || '';
        dados.matricula = modal.querySelector('#admMatricula')?.value?.trim() || '';
        dados.idade = parseInt(modal.querySelector('#admIdade')?.value) || null;
        dados.pps = modal.querySelector('#admPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#admSPICT')?.value || 'nao_elegivel';
        dados.complexidade = modal.querySelector('#admComplexidade')?.value || 'I';
        dados.prevAlta = modal.querySelector('#admPrevAlta')?.value || 'SP';
        
        // *** COLETAR ISOLAMENTO (AS) DO DROPDOWN ***
        dados.isolamento = modal.querySelector('#admIsolamento')?.value || 'NÃO ISOLAMENTO';
        
        // *** COLETAR IDENTIFICAÇÃO DO LEITO (AT) ***
        dados.identificacaoLeito = modal.querySelector('#admIdentificacaoLeito')?.value?.trim().toUpperCase() || '';
        
        // *** COLETAR REGIÃO E SEXO (OBRIGATÓRIOS) ***
        dados.regiao = modal.querySelector('#admRegiao')?.value || '';
        dados.sexo = modal.querySelector('#admSexo')?.value || '';
        
        // Arrays diretos - sem join
        const concessoesSelecionadas = coletarCheckboxesSelecionados(modal, '#admConcessoes');
        const linhasSelecionadas = coletarCheckboxesSelecionados(modal, '#admLinhas');
        
        dados.concessoes = concessoesSelecionadas;  // Array direto
        dados.linhas = linhasSelecionadas;          // Array direto
        
    } else {
        dados.idade = parseInt(modal.querySelector('#updIdade')?.value) || null;
        dados.pps = modal.querySelector('#updPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#updSPICT')?.value || 'nao_elegivel';
        dados.complexidade = modal.querySelector('#updComplexidade')?.value || 'I';
        dados.prevAlta = modal.querySelector('#updPrevAlta')?.value || 'SP';
        
        // *** COLETAR ISOLAMENTO (AS) DO DROPDOWN ***
        dados.isolamento = modal.querySelector('#updIsolamento')?.value || 'NÃO ISOLAMENTO';
        
        // *** COLETAR IDENTIFICAÇÃO DO LEITO (AT) ***
        dados.identificacaoLeito = modal.querySelector('#updIdentificacaoLeito')?.value?.trim().toUpperCase() || '';
        
        // *** COLETAR REGIÃO E SEXO (OBRIGATÓRIOS) ***
        dados.regiao = modal.querySelector('#updRegiao')?.value || '';
        dados.sexo = modal.querySelector('#updSexo')?.value || '';
        
        // Arrays diretos - sem join
        const concessoesSelecionadas = coletarCheckboxesSelecionados(modal, '#updConcessoes');
        const linhasSelecionadas = coletarCheckboxesSelecionados(modal, '#updLinhas');
        
        dados.concessoes = concessoesSelecionadas;  // Array direto
        dados.linhas = linhasSelecionadas;          // Array direto
    }
    
    logInfo('Dados V3.2 estrutura 4 linhas coletados (incluindo AS/AT + região/sexo):', {
        isolamento: dados.isolamento,
        identificacaoLeito: dados.identificacaoLeito || 'vazio',
        regiao: dados.regiao || 'vazio',
        sexo: dados.sexo || 'vazio',
        concessoes: dados.concessoes.length,
        linhas: dados.linhas.length
    });
    
    return dados;
}

// FUNÇÃO: COLETA ROBUSTA DE CHECKBOXES
function coletarCheckboxesSelecionados(modal, seletor) {
    const checkboxes = modal.querySelectorAll(`${seletor} input[type="checkbox"]`);
    const selecionados = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selecionados.push(checkbox.value);
        }
    });
    
    return selecionados;
}

// =================== FUNÇÃO: FORMATAÇÃO AUTOMÁTICA DA MATRÍCULA ===================
function formatarMatricula(input) {
    // Remove todos os caracteres não numéricos
    let valor = input.value.replace(/\D/g, '');
    
    // Limita a 6 dígitos
    if (valor.length > 6) {
        valor = valor.substring(0, 6);
    }
    
    // Adiciona o hífen automaticamente após 5 dígitos
    if (valor.length > 5) {
        valor = valor.substring(0, 5) + '-' + valor.substring(5);
    }
    
    // Atualiza o valor do campo
    input.value = valor;
}

// =================== FUNÇÕES AUXILIARES ===================
function showButtonLoading(button, loadingText) {
    if (button) {
        button.disabled = true;
        button.innerHTML = loadingText;
        button.style.opacity = '0.7';
    }
}

function hideButtonLoading(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.opacity = '1';
    }
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success-toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error-toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// =================== FUNÇÕES AUXILIARES PRINCIPAIS ===================
function getIniciais(nomeCompleto) {
    if (!nomeCompleto) return '—';
    return nomeCompleto.split(' ')
        .filter(part => part.length > 0)
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 3)
        .join(' ');
}

function calcularTempoInternacao(admissao) {
    if (!admissao) return '';
    
    try {
        let dataAdmissao;
        
        if (typeof admissao === 'string') {
            if (admissao.includes('/')) {
                // Formato brasileiro: DD/MM/YYYY
                const [datePart] = admissao.split(' ');
                const [dia, mes, ano] = datePart.split('/');
                
                if (dia && mes && ano) {
                    const d = parseInt(dia);
                    const m = parseInt(mes);
                    const a = parseInt(ano);
                    
                    if (!isNaN(d) && !isNaN(m) && !isNaN(a) && 
                        d >= 1 && d <= 31 && m >= 1 && m <= 12 && a >= 1900) {
                        dataAdmissao = new Date(a, m - 1, d);
                    } else {
                        return 'Data inválida';
                    }
                } else {
                    return 'Data incompleta';
                }
            } else {
                dataAdmissao = new Date(admissao);
            }
        } else {
            dataAdmissao = new Date(admissao);
        }
        
        if (!dataAdmissao || isNaN(dataAdmissao.getTime())) {
            return 'Data inválida';
        }
        
        const agora = new Date();
        const diffTime = agora - dataAdmissao;
        
        if (diffTime < 0) return 'Data futura';
        if (diffTime > (2 * 365 * 24 * 60 * 60 * 1000)) return 'Data antiga';
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays === 0) return `${diffHours}h`;
        if (diffDays === 1) return `1d ${diffHours}h`;
        return `${diffDays}d ${diffHours}h`;
        
    } catch (error) {
        logError('Erro ao calcular tempo internação:', error);
        return 'Erro no cálculo';
    }
}

function formatarDataHora(dataISO) {
    if (!dataISO) return '—';
    
    try {
        const data = new Date(dataISO);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        logError('Erro ao formatar data:', error);
        return '—';
    }
}

// =================== FUNÇÕES DE LOG ===================
function logInfo(message, data = null) {
    console.log(`🔵 [CARDS V3.2 - 4 LINHAS] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`🔴 [CARDS V3.2 - 4 LINHAS ERROR] ${message}`, error || '');
}

function logSuccess(message) {
    console.log(`🟢 [CARDS V3.2 - 4 LINHAS SUCCESS] ${message}`);
}

function logDebug(message, data = null) {
    console.log(`🟡 [CARDS V3.2 - 4 LINHAS DEBUG] ${message}`, data || '');
}

// =================== CSS CONSOLIDADO COMPLETO V3.2 COM 4 LINHAS ===================
if (!document.getElementById('cardsConsolidadoCSS')) {
    const style = document.createElement('style');
    style.id = 'cardsConsolidadoCSS';
    style.textContent = `
        /* =================== ANIMAÇÕES BÁSICAS =================== */
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* =================== DESKTOP STYLES =================== */
        .btn-action {
            transition: all 0.2s ease;
        }
        
        .btn-action:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .btn-action:disabled {
            cursor: not-allowed;
            transform: none !important;
        }
        
        .toast {
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            border-left: 4px solid rgba(255,255,255,0.3);
        }
        
        /* Estilos para dropdowns */
        select {
            background-color: #374151 !important;
            color: #ffffff !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            border-radius: 6px !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.7rem center;
            background-size: 1em;
            padding-right: 2.5rem !important;
        }

        select option {
            background-color: #374151 !important;
            color: #ffffff !important;
        }

        select:focus {
            outline: none !important;
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
        }

        /* Checkboxes com estilo melhorado */
        input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #60a5fa;
            cursor: pointer;
        }
        
        input[type="checkbox"]:checked {
            background-color: #60a5fa !important;
            border-color: #60a5fa !important;
        }

        /* Radio buttons para isolamento */
        input[type="radio"] {
            width: 16px;
            height: 16px;
            accent-color: #60a5fa;
            cursor: pointer;
        }
        
        /* Labels com hover para melhor UX */
        label:has(input[type="checkbox"]),
        label:has(input[type="radio"]) {
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            padding: 4px !important;
        }
        
        label:has(input[type="checkbox"]):hover,
        label:has(input[type="radio"]):hover {
            background-color: rgba(96, 165, 250, 0.1);
        }

        /* Cards hover effects */
        .card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        /* =================== LAYOUT 3 COLUNAS DESKTOP =================== */
        .form-grid-3-cols {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 15px !important;
        }
        
        /* =================== LAYOUT 2 COLUNAS (REGIÃO/SEXO) =================== */
        .form-grid-2-cols {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 15px !important;
        }
        
        /* =================== TABLET STYLES (768px - 1024px) =================== */
        @media (max-width: 1024px) and (min-width: 769px) {
            .cards-grid {
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 18px;
            }
            
            .hospital-selector {
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .hospital-btn {
                flex: 1;
                min-width: 180px;
            }
            
            /* Layout 3 colunas em tablet */
            .form-grid-3-cols {
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 12px !important;
            }
            
            /* Layout 2 colunas em tablet */
            .form-grid-2-cols {
                grid-template-columns: 1fr 1fr !important;
                gap: 12px !important;
            }
        }

        /* =================== MOBILE STYLES (≤768px) =================== */
        @media (max-width: 768px) {
            /* Header responsivo */
            header {
                flex-direction: column;
                gap: 10px;
                padding: 10px;
            }
            
            header h1 {
                font-size: 18px;
            }
            
            .header-right {
                width: 100%;
                justify-content: space-between;
            }
            
            #timer,
            #updateTimer {
                font-size: 12px;
            }
            
            /* Cards em coluna única no mobile */
            .cards-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }
            
            /* *** ESTRUTURA 4 LINHAS NO MOBILE - FORÇAR LAYOUT 3x3 POR LINHA *** */
            .card-row-1,
            .card-row-2,
            .card-row-3,
            .card-row-4 {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 8px !important;
                margin-bottom: 10px !important;
            }
            
            /* GARANTIR LARGURA IGUAL PARA TODOS OS BOXES DAS 4 LINHAS */
            .card-row-1 > div,
            .card-row-3 > div,
            .card-row-4 > div {
                background: rgba(255,255,255,0.05) !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                border-radius: 8px !important;
                padding: 8px 4px !important;
                min-height: 45px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
            }
            
            /* EXCEÇÃO: Preservar cores específicas do isolamento na linha 2 */
            .card-row-2 > div:not(:first-child) {
                background: rgba(255,255,255,0.05) !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                border-radius: 8px !important;
                padding: 8px 4px !important;
                min-height: 45px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
            }
            
            /* ISOLAMENTO: Manter cores originais no mobile */
            .card-row-2 > div:first-child {
                /* Cores definidas via style inline - não sobrescrever */
                border-radius: 8px !important;
                padding: 8px 4px !important;
                min-height: 45px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
            }
            
            /* *** CORES ESPECÍFICAS PARA ISOLAMENTO NA LINHA 2 *** */
            .card-row-2 > div:first-child {
                /* O campo isolamento mantém sua cor específica definida inline */
            }
            
            /* *** CORREÇÃO CRÍTICA: CORES DO LEITO NO MOBILE (LINHA 1) *** */
            .leito-badge {
                background: #22c55e !important; /* Verde para vago */
                color: #000000 !important;
            }
            
            .leito-badge.ocupado {
                background: #fbbf24 !important; /* Amarelo para ocupado */
                color: #000000 !important;
            }
            
            /* Previsão de alta mantém cor especial (LINHA 4) */
            .card-row-4 > div:last-child {
                background: #8FD3F4 !important;
                color: #000000 !important;
            }
            
            /* Maior espaçamento entre elementos tocáveis */
            .card-actions {
                gap: 12px !important;
            }
            
            .hospital-selector {
                gap: 12px !important;
                flex-direction: column;
                padding: 15px;
            }
            
            .hospital-btn {
                width: 100%;
                min-width: auto;
                flex: none;
                padding: 12px 16px;
                font-size: 14px;
            }
            
            /* *** MODAL RESPONSIVO COM 3/2 COLUNAS *** */
            .modal-overlay .modal-content {
                width: 95% !important;
                max-width: none !important;
                margin: 10px !important;
                max-height: 95vh !important;
                padding: 20px !important;
            }
            
            /* *** LAYOUT 3 COLUNAS NO MOBILE *** */
            .form-grid-3-cols {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 8px !important;
            }
            
            /* *** LAYOUT 2 COLUNAS NO MOBILE (REGIÃO/SEXO) *** */
            .form-grid-2-cols {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 10px !important;
            }
            
            /* Inputs e selects menores para caber em 3/2 colunas */
            .form-grid-3-cols input,
            .form-grid-3-cols select,
            .form-grid-2-cols input,
            .form-grid-2-cols select {
                padding: 8px 6px !important;
                font-size: 12px !important;
            }
            
            /* Labels menores */
            .form-grid-3-cols label,
            .form-grid-2-cols label {
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
            
            /* Seções dos cards mais compactas */
            .card-section {
                margin-bottom: 12px !important;
            }
            
            .card-section .section-title {
                font-size: 10px !important;
                padding: 6px 8px !important;
                margin-bottom: 6px !important;
            }
            
            .card-section .chips-container {
                padding: 6px !important;
                min-height: 20px !important;
            }
            
            .card-section .chip {
                font-size: 9px !important;
                padding: 2px 6px !important;
                margin: 1px !important;
            }
            
            /* Botões de ação menores */
            .btn-action {
                padding: 8px 16px !important;
                font-size: 11px !important;
                width: 100% !important;
                text-align: center !important;
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
            
            /* Layout 4 linhas 3x3 ainda mais compacto */
            .card-row-1,
            .card-row-2,
            .card-row-3,
            .card-row-4 {
                gap: 6px !important;
                margin-bottom: 8px !important;
            }
            
            .card-row-1 > div,
            .card-row-3 > div,
            .card-row-4 > div {
                padding: 6px 3px !important;
                min-height: 40px !important;
            }
            
            /* Região e sexo na linha 2 */
            .card-row-2 > div:not(:first-child) {
                padding: 6px 3px !important;
                min-height: 40px !important;
            }
            
            /* Isolamento na linha 2 - manter cores originais */
            .card-row-2 > div:first-child {
                padding: 6px 3px !important;
                min-height: 40px !important;
            }
            
            /* Labels e valores ainda menores */
            .card-row-1 div[style*="font-size: 10px"],
            .card-row-2 div[style*="font-size: 10px"],
            .card-row-3 div[style*="font-size: 10px"],
            .card-row-4 div[style*="font-size: 10px"] {
                font-size: 8px !important;
            }
            
            .card-row-1 div[style*="font-size: 12px"],
            .card-row-2 div[style*="font-size: 12px"],
            .card-row-3 div[style*="font-size: 12px"],
            .card-row-4 div[style*="font-size: 12px"] {
                font-size: 10px !important;
            }
            
            /* Modal ainda mais compacto */
            .modal-content {
                padding: 15px !important;
            }
            
            .form-grid-3-cols {
                gap: 6px !important;
            }
            
            .form-grid-2-cols {
                gap: 8px !important;
            }
            
            .form-grid-3-cols input,
            .form-grid-3-cols select {
                padding: 6px 4px !important;
                font-size: 11px !important;
            }
            
            .form-grid-2-cols input,
            .form-grid-2-cols select {
                padding: 8px 6px !important;
                font-size: 11px !important;
            }
            
            .form-grid-3-cols label {
                font-size: 9px !important;
            }
            
            .form-grid-2-cols label {
                font-size: 10px !important;
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
            
            /* MANTER ESTRUTURA 4 LINHAS 3x3 MESMO EM LANDSCAPE */
            .card-row-1,
            .card-row-2,
            .card-row-3,
            .card-row-4 {
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
        
        /* =================== LOADING E ANIMAÇÕES =================== */
        .loading-spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #ffffff;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
        }
    `;
    document.head.appendChild(style);
}

// =================== INICIALIZAÇÃO V3.2 ===================
document.addEventListener('DOMContentLoaded', function() {
    logSuccess('✅ Cards.js V3.2 ESTRUTURA 4 LINHAS IMPLEMENTADA');
    
    // Verificar dependências
    if (typeof window.CONFIG === 'undefined') {
        logError('CONFIG não encontrado - algumas funcionalidades podem não funcionar');
    }
    
    if (typeof window.hospitalData === 'undefined') {
        window.hospitalData = {};
        logInfo('hospitalData V3.2 estrutura 4 linhas inicializado');
    }
    
    // Verificar se API V3.2 está disponível
    if (typeof window.admitirPaciente === 'undefined') {
        logError('Funções da API V3.2 não encontradas - verificar api.js');
    }
    
    // Verificar listas V3.2
    if (window.CONCESSOES_LIST.length !== 11) {
        logError(`ERRO: Esperadas 11 concessões, encontradas ${window.CONCESSOES_LIST.length}`);
    } else {
        logSuccess(`✅ ${window.CONCESSOES_LIST.length} concessões atualizadas conforme manual`);
    }
    
    if (window.LINHAS_CUIDADO_LIST.length !== 45) {
        logError(`ERRO: Esperadas 45 linhas, encontradas ${window.LINHAS_CUIDADO_LIST.length}`);
    } else {
        logSuccess(`✅ ${window.LINHAS_CUIDADO_LIST.length} linhas de cuidado atualizadas conforme manual`);
    }
    
    if (window.PREVISAO_ALTA_OPTIONS.length !== 10) {
        logError(`ERRO: Esperadas 10 opções timeline, encontradas ${window.PREVISAO_ALTA_OPTIONS.length}`);
    }
    
    if (window.ISOLAMENTO_OPTIONS.length !== 3) {
        logError(`ERRO: Esperadas 3 opções isolamento, encontradas ${window.ISOLAMENTO_OPTIONS.length}`);
    }
    
    if (window.REGIAO_OPTIONS.length !== 9) {
        logError(`ERRO: Esperadas 9 opções região, encontradas ${window.REGIAO_OPTIONS.length}`);
    } else {
        logSuccess(`✅ ${window.REGIAO_OPTIONS.length} opções de região implementadas`);
    }
    
    if (window.SEXO_OPTIONS.length !== 2) {
        logError(`ERRO: Esperadas 2 opções sexo, encontradas ${window.SEXO_OPTIONS.length}`);
    } else {
        logSuccess(`✅ ${window.SEXO_OPTIONS.length} opções de sexo implementadas`);
    }
    
    if (window.IDADE_OPTIONS.length !== 102) {
        logError(`ERRO: Esperadas 102 idades (14-115), encontradas ${window.IDADE_OPTIONS.length}`);
    }
    
    // Garantir que seleção inicial funcione
    if (window.currentHospital && window.HOSPITAL_MAPPING[window.currentHospital]) {
        logInfo(`Hospital inicial V3.2: ${window.currentHospital} - ${window.HOSPITAL_MAPPING[window.currentHospital]}`);
    }
    
    // Log das alterações implementadas V3.2
    logInfo('🚀 ESTRUTURA 4 LINHAS V3.2 IMPLEMENTADA:');
    logInfo('  • ✅ LINHA 1: HOSPITAL | LEITO | TIPO (mantida)');
    logInfo('  • ✅ LINHA 2: ISOLAMENTO | REGIÃO | SEXO (NOVA - 3 colunas)');
    logInfo('  • ✅ LINHA 3: INICIAIS | MATRÍCULA | IDADE (movida)');
    logInfo('  • ✅ LINHA 4: PPS | SPICT-BR | PREV ALTA (movida)');
    logInfo('  • ✅ RODAPÉ: sem badge isolamento (removido)');
    logInfo('  • ✅ REGIÃO: 9 opções (Zona Central, Zona Sul, ABC, etc.)');
    logInfo('  • ✅ SEXO: 2 opções (M, F)');
    logInfo('  • ✅ ISOLAMENTO: dropdown (não radio buttons)');
    logInfo('  • ✅ OBRIGATÓRIOS: isolamento + região + sexo');
    logInfo('  • ✅ MATRÍCULA: formatação automática com hífen');
    logInfo('  • ✅ Formulários: 3 colunas para isolamento/região/sexo');
    logInfo('  • ✅ CSS: estrutura 4 linhas mobile 3x3 forçado');
    logInfo('  • ✅ Responsivo: mobile pequeno + landscape');
    logInfo('  • ✅ Performance: otimizada para 4 linhas');
    logInfo('  • ✅ Validação: campos obrigatórios com foco');
    logInfo('  • ✅ Layout: 3 colunas equalizadas');
    logInfo('  • ✅ Cores: isolamento com background próprio');
    
    // Adicionar listener para resize
    window.addEventListener('resize', function() {
        const width = window.innerWidth;
        if (width <= 480) {
            logDebug('Modo mobile pequeno V3.2 estrutura 4 linhas ativado');
        } else if (width <= 768) {
            logDebug('Modo mobile V3.2 estrutura 4 linhas ativado');
        } else if (width <= 1024) {
            logDebug('Modo tablet V3.2 estrutura 4 linhas ativado');
        } else {
            logDebug('Modo desktop V3.2 estrutura 4 linhas ativado');
        }
    });
});

// =================== EXPORT DE FUNÇÕES PÚBLICAS ===================
window.createCard = createCard;
window.openAdmissaoModal = openAdmissaoModal;
window.openAtualizacaoModal = openAtualizacaoModal;
window.forcarPreMarcacao = forcarPreMarcacao;
window.coletarDadosFormulario = coletarDadosFormulario;
window.getBadgeIsolamento = getBadgeIsolamento;
window.formatarMatricula = formatarMatricula;

logSuccess('🏥 CARDS.JS V3.2 ESTRUTURA 4 LINHAS FINALIZADA!');
logInfo('📋 NOVA ESTRUTURA:');
logInfo('  • Linha 1: Hospital | Leito | Tipo');
logInfo('  • Linha 2: Isolamento | Região | Sexo');
logInfo('  • Linha 3: Iniciais | Matrícula | Idade');
logInfo('  • Linha 4: PPS | SPICT-BR | Prev Alta');
logInfo('✅ Todo CSS responsivo consolidado neste arquivo');
logInfo('✅ Eliminada dependência do mobile.css');
logInfo('✅ Cores hardcoded: Verde=vago, Amarelo=ocupado');
logInfo('✅ Layout 4 linhas 3x3 forçado no mobile');
logInfo('✅ Modais responsivos com campos região/sexo');
logInfo('✅ Performance otimizada com CSS inline');
logInfo('✅ ✨ ESTRUTURA 4 LINHAS IMPLEMENTADA ✨');
