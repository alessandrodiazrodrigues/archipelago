// =================== CARDS.JS V3.3 FINAL CORRIGIDO ===================
// =================== CORREÇÕES: TIPO REFLETE CATEGORIA + HEADER ADMISSÃO + DIRETIVAS + MODAL ATUALIZAÇÃO ===================

// =================== VARIÁVEIS GLOBAIS ===================  
window.selectedLeito = null;
window.currentHospital = 'H1';

// =================== MAPEAMENTO DE HOSPITAIS V3.3 ===================
window.HOSPITAL_MAPPING = {
    H1: 'Neomater',
    H2: 'Cruz Azul', 
    H3: 'Santa Marcelina',
    H4: 'Santa Clara',
    H5: 'Adventista'
};

// ⭐ HOSPITAIS HÍBRIDOS
window.HOSPITAIS_HIBRIDOS = ['H1', 'H3', 'H5'];

// ⭐ TIPO DE QUARTO (2 OPÇÕES - APENAS PARA HÍBRIDOS)
window.TIPO_QUARTO_OPTIONS = ['Apartamento', 'Enfermaria'];

// =================== LISTAS FINAIS CONFIRMADAS V3.3 ===================

// CONCESSÕES: 11 ITENS
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

// LINHAS DE CUIDADO: 45 ESPECIALIDADES
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

// PPS: 10 OPÇÕES
window.PPS_OPTIONS = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

// PREVISÃO DE ALTA: 10 OPÇÕES
window.PREVISAO_ALTA_OPTIONS = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R', 
    '48h', '72h', '96h', 'SP'
];

// ISOLAMENTO: 3 OPÇÕES
window.ISOLAMENTO_OPTIONS = [
    'Não Isolamento',
    'Isolamento de Contato', 
    'Isolamento Respiratório'
];

// REGIÃO: 9 OPÇÕES
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

// GÊNERO: 2 OPÇÕES
window.SEXO_OPTIONS = [
    'Masculino',
    'Feminino'
];

// ⭐ DIRETIVAS ANTECIPADAS (BV/73)
window.DIRETIVAS_OPTIONS = [
    'Não se aplica',
    'Sim',
    'Não'
];

// IDADE: DROPDOWN 14-115 ANOS
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
    logInfo('Renderizando cards V3.3 FINAL - layout MOCKUP + DIRETIVAS');
    
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
                    <p style="margin-bottom: 15px;">Carregando dados da planilha V3.3...</p>
                    <p style="color: #28a745;"><em>✅ API V3.3 conectada - 74 colunas + DIRETIVAS (BV/73)</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    hospital.leitos.forEach(leito => {
        const card = createCard(leito, hospitalNome);
        container.appendChild(card);
    });
    
    logInfo(`${hospital.leitos.length} cards V3.3 FINAL renderizados para ${hospitalNome}`);
};

// =================== FUNÇÃO: BADGE DE ISOLAMENTO ===================
function getBadgeIsolamento(isolamento) {
    if (!isolamento || isolamento === 'Não Isolamento') {
        return {
            cor: '#9ca3af',
            texto: 'Não Isol',
            textoCor: '#ffffff'
        };
    } else if (isolamento === 'Isolamento de Contato') {
        return {
            cor: '#f59e0b',
            texto: 'Contato',
            textoCor: '#000000'
        };
    } else if (isolamento === 'Isolamento Respiratório') {
        return {
            cor: '#ef4444',
            texto: 'Respiratório',
            textoCor: '#ffffff'
        };
    }
    return getBadgeIsolamento('Não Isolamento');
}

// =================== FUNÇÃO: BADGE DE GÊNERO ===================
function getBadgeGenero(sexo) {
    if (sexo === 'Masculino') {
        return {
            cor: 'rgba(59,130,246,0.2)',
            borda: '#3b82f6',
            textoCor: '#60a5fa',
            texto: 'Masculino'
        };
    } else if (sexo === 'Feminino') {
        return {
            cor: 'rgba(236,72,153,0.2)',
            borda: '#ec4899',
            textoCor: '#ec4899',
            texto: 'Feminino'
        };
    }
    return {
        cor: 'rgba(255,255,255,0.05)',
        borda: 'rgba(255,255,255,0.1)',
        textoCor: '#ffffff',
        texto: 'Não informado'
    };
}

// =================== FUNÇÃO: BADGE DE DIRETIVAS ===================
function getBadgeDiretivas(diretivas) {
    if (diretivas === 'Sim') {
        return {
            cor: 'rgba(34,197,94,0.2)',
            borda: '#22c55e',
            textoCor: '#22c55e',
            texto: 'Sim'
        };
    } else if (diretivas === 'Não') {
        return {
            cor: 'rgba(239,68,68,0.2)',
            borda: '#ef4444',
            textoCor: '#ef4444',
            texto: 'Não'
        };
    }
    return {
        cor: 'rgba(156,163,175,0.2)',
        borda: '#9ca3af',
        textoCor: '#9ca3af',
        texto: 'N/A'
    };
}

// =================== FUNÇÃO: CRIAR CARD ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = `
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 16px;
        position: relative;
    `;

    const isVago = !leito.status || leito.status === 'VAGO' || leito.status === '';
    const isOcupado = leito.status === 'OCUPADO';
    
    // ⭐ CORREÇÃO 1: TIPO reflete categoria escolhida (coluna C)
    let tipoDisplay = 'Híbrido';
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(window.currentHospital);
    
    if (isHibrido) {
        // Hospital híbrido: mostrar categoria escolhida ou "Híbrido" se vago
        if (isOcupado && leito.categoriaEscolhida) {
            tipoDisplay = leito.categoriaEscolhida; // "Apartamento" ou "Enfermaria"
        } else {
            tipoDisplay = 'Híbrido'; // Vago ou sem categoria
        }
    } else {
        // Hospital não-híbrido: tipo fixo (Apartamento ou Enfermaria)
        if (window.currentHospital === 'H2') {
            // Cruz Azul: verificar se é apartamento ou enfermaria
            tipoDisplay = leito.tipo || 'Apartamento';
        } else if (window.currentHospital === 'H4') {
            // Santa Clara: apartamento ou enfermaria
            tipoDisplay = leito.tipo || 'Apartamento';
        }
    }

    // Badge isolamento
    const badgeIsol = getBadgeIsolamento(leito.isolamento);
    
    // Badge gênero
    const badgeGen = getBadgeGenero(leito.genero);
    
    // Badge diretivas
    const badgeDir = getBadgeDiretivas(leito.diretivas);

    // Status cor
    let statusCor = '#9ca3af';
    let statusTexto = 'VAGO';
    if (isOcupado) {
        statusCor = '#22c55e';
        statusTexto = 'OCUPADO';
    }

    // Cor do círculo pessoa
    let circuloCor = '#10b981'; // Verde (vago)
    if (leito.genero === 'Masculino') {
        circuloCor = '#3b82f6'; // Azul
    } else if (leito.genero === 'Feminino') {
        circuloCor = '#ec4899'; // Rosa
    }

    // ========== HEADER: HOSPITAL (FORA DOS BOXES) ==========
    const headerHTML = `
        <div style="margin-bottom: 12px;">
            <h3 style="color: #60a5fa; font-size: 14px; font-weight: 600; margin: 0;">
                🏥 ${hospitalNome}
            </h3>
        </div>
    `;

    // ========== LINHA 1: LEITO | TIPO | STATUS ==========
    const linha1HTML = `
        <div class="card-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="card-box" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 4px;">LEITO</div>
                <div style="color: #ffffff; font-size: 16px; font-weight: 600;">${leito.idLeito || '-'}</div>
            </div>
            <div class="card-box" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 4px;">TIPO</div>
                <div style="color: #ffffff; font-size: 14px; font-weight: 500;">${tipoDisplay}</div>
            </div>
            <div class="card-box" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 4px;">STATUS</div>
                <div style="color: ${statusCor}; font-size: 14px; font-weight: 600;">${statusTexto}</div>
            </div>
        </div>
    `;

    // ========== LINHA 2: GÊNERO | ISOLAMENTO | PREV ALTA ==========
    const prevAltaTexto = leito.previsaoAlta || '-';
    const linha2HTML = `
        <div class="card-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="card-box" style="background: ${badgeGen.cor}; border: 1px solid ${badgeGen.borda}; border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.7); font-size: 11px; margin-bottom: 4px;">GÊNERO</div>
                <div style="color: ${badgeGen.textoCor}; font-size: 13px; font-weight: 500;">${badgeGen.texto}</div>
            </div>
            <div class="card-box" style="background: ${badgeIsol.cor}; border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.7); font-size: 11px; margin-bottom: 4px;">ISOLAMENTO</div>
                <div style="color: ${badgeIsol.textoCor}; font-size: 12px; font-weight: 600;">${badgeIsol.texto}</div>
            </div>
            <div class="card-box" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 4px;">PREV ALTA</div>
                <div style="color: #ffffff; font-size: 13px; font-weight: 500;">${prevAltaTexto}</div>
            </div>
        </div>
    `;

    // ========== LINHA DIVISÓRIA ==========
    const divisoriaHTML = `
        <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 12px 0;"></div>
    `;

    // ========== SEÇÃO PESSOA: CÍRCULO 100px + GRID 2x2 ==========
    const pessoaHTML = `
        <div class="card-row-pessoa" style="display: grid; grid-template-columns: 100px 1fr; gap: 12px; align-items: start; margin-bottom: 12px;">
            <div class="pessoa-circle" style="
                width: 100px; 
                height: 100px; 
                border-radius: 50%; 
                background: ${circuloCor}; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                flex-shrink: 0;
            ">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                    <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 3px;">NOME</div>
                    <div style="color: #ffffff; font-size: 13px; font-weight: 500;">${leito.nome || '-'}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                    <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 3px;">IDADE</div>
                    <div style="color: #ffffff; font-size: 13px; font-weight: 500;">${leito.idade || '-'}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                    <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 3px;">MATRÍCULA</div>
                    <div style="color: #ffffff; font-size: 13px; font-weight: 500;">${leito.matricula || '-'}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px;">
                    <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 3px;">MÉDICO</div>
                    <div style="color: #ffffff; font-size: 13px; font-weight: 500;">${leito.medicoResp || '-'}</div>
                </div>
            </div>
        </div>
    `;

    // ========== LINHA 3: PPS | SPICT-BR | DIRETIVAS ==========
    const ppsTexto = leito.pps || '-';
    const spictTexto = leito.spict ? 'Sim' : 'Não';
    const linha3HTML = `
        <div class="card-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="card-box" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 4px;">PPS</div>
                <div style="color: #ffffff; font-size: 14px; font-weight: 500;">${ppsTexto}</div>
            </div>
            <div class="card-box" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.5); font-size: 11px; margin-bottom: 4px;">SPICT-BR</div>
                <div style="color: #ffffff; font-size: 14px; font-weight: 500;">${spictTexto}</div>
            </div>
            <div class="card-box" style="background: ${badgeDir.cor}; border: 1px solid ${badgeDir.borda}; border-radius: 8px; padding: 10px;">
                <div style="color: rgba(255,255,255,0.7); font-size: 11px; margin-bottom: 4px;">DIRETIVAS</div>
                <div style="color: ${badgeDir.textoCor}; font-size: 13px; font-weight: 500;">${badgeDir.texto}</div>
            </div>
        </div>
    `;

    // ========== BOTÕES ==========
    let botoesHTML = '';
    if (isVago) {
        botoesHTML = `
            <button onclick="openAdmissaoModal('${leito.idLeito}')" style="
                width: 100%;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16,185,129,0.4)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                ➕ ADMITIR
            </button>
        `;
    } else {
        botoesHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button onclick="openAtualizacaoModal('${leito.idLeito}')" style="
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59,130,246,0.4)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    🔄 ATUALIZAR
                </button>
                <button onclick="darAlta('${leito.idLeito}')" style="
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(239,68,68,0.4)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    🚪 DAR ALTA
                </button>
            </div>
        `;
    }

    card.innerHTML = headerHTML + linha1HTML + linha2HTML + divisoriaHTML + pessoaHTML + linha3HTML + botoesHTML;
    
    return card;
}

// =================== FUNÇÃO: FORMATAR MATRÍCULA ===================
function formatarMatricula(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length > 5) {
        valor = valor.slice(0, 5) + '-' + valor.slice(5, 6);
    }
    
    input.value = valor;
}

// =================== FUNÇÃO: ABRIR MODAL DE ADMISSÃO ===================
function openAdmissaoModal(leitoId) {
    logInfo(`Abrindo modal de admissão para leito ${leitoId}`);
    
    window.selectedLeito = leitoId;
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId];
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    // ⭐ CORREÇÃO 2: Header com "LEITO HÍBRIDO" na mesma linha sem emoji
    let headerTexto = `Hospital: ${hospitalNome} | ID: ${hospitalId.replace('H', '')} | Leito: ${leitoId}`;
    if (isHibrido) {
        headerTexto += ' | LEITO HÍBRIDO';
    }

    const concessoesCheckboxes = window.CONCESSOES_LIST.map(c => 
        `<label style="display: flex; align-items: center; padding: 6px;"><input type="checkbox" name="concessao" value="${c}" style="margin-right: 8px;">${c}</label>`
    ).join('');
    
    const linhasCheckboxes = window.LINHAS_CUIDADO_LIST.map(l => 
        `<label style="display: flex; align-items: center; padding: 6px;"><input type="checkbox" name="linha" value="${l}" style="margin-right: 8px;">${l}</label>`
    ).join('');

    // ⭐ Seletor de categoria APENAS para hospitais híbridos
    let seletorCategoria = '';
    if (isHibrido) {
        seletorCategoria = `
            <div>
                <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                    Categoria <span style="color: #ef4444;">*</span>
                </label>
                <select id="admitCategoriaEscolhida" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                    <option value="">Selecione...</option>
                    ${window.TIPO_QUARTO_OPTIONS.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
        `;
    }

    const modalHTML = `
        <div id="modalAdmissao" class="modal-overlay" onclick="if(event.target === this) closeModal('modalAdmissao')">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: #1f2937; border-radius: 12px; padding: 30px; max-width: 900px; max-height: 90vh; overflow-y: auto;">
                
                <!-- HEADER -->
                <div style="background: rgba(96,165,250,0.1); border-left: 4px solid #60a5fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #60a5fa; margin: 0; font-size: 16px; font-weight: 600;">
                        ${headerTexto}
                    </h2>
                </div>

                <form id="formAdmissao" onsubmit="submitAdmissao(event)">
                    
                    <!-- LINHA 1: NOME + IDADE + MATRÍCULA -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Nome Completo <span style="color: #ef4444;">*</span>
                            </label>
                            <input type="text" id="admitNome" required placeholder="Nome do paciente" 
                                style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Idade <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitIdade" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.IDADE_OPTIONS.map(i => `<option value="${i}">${i}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Matrícula <span style="color: #ef4444;">*</span>
                            </label>
                            <input type="text" id="admitMatricula" required placeholder="00000-0" maxlength="7"
                                oninput="formatarMatricula(this)"
                                style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                        </div>
                    </div>

                    <!-- LINHA 2: GÊNERO + REGIÃO + ISOLAMENTO -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Gênero <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitGenero" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.SEXO_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Região <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitRegiao" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.REGIAO_OPTIONS.map(r => `<option value="${r}">${r}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Isolamento <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitIsolamento" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.ISOLAMENTO_OPTIONS.map(i => `<option value="${i}">${i}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- LINHA 3: CATEGORIA (apenas híbridos) + MÉDICO + PPS -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        ${seletorCategoria}
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Médico Responsável <span style="color: #ef4444;">*</span>
                            </label>
                            <input type="text" id="admitMedico" required placeholder="Dr(a)..." 
                                style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                PPS <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitPps" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.PPS_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- LINHA 4: PREVISÃO ALTA + DIRETIVAS + SPICT -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Previsão de Alta <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitPrevisaoAlta" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.PREVISAO_ALTA_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Diretivas Antecipadas <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="admitDiretivas" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.DIRETIVAS_OPTIONS.map(d => `<option value="${d}">${d}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                SPICT-BR
                            </label>
                            <div style="display: flex; align-items: center; height: 40px;">
                                <input type="checkbox" id="admitSpict" style="width: 20px; height: 20px; margin-right: 10px; accent-color: #60a5fa; cursor: pointer;">
                                <label for="admitSpict" style="color: #ffffff; cursor: pointer;">Aplicável</label>
                            </div>
                        </div>
                    </div>

                    <!-- CONCESSÕES -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; margin-bottom: 10px;">
                            Concessões
                        </label>
                        <div id="admitConcessoes" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 200px; overflow-y: auto;">
                            ${concessoesCheckboxes}
                        </div>
                    </div>

                    <!-- LINHAS DE CUIDADO -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; margin-bottom: 10px;">
                            Linhas de Cuidado
                        </label>
                        <div id="admitLinhas" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 250px; overflow-y: auto;">
                            ${linhasCheckboxes}
                        </div>
                    </div>

                    <!-- BOTÕES -->
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeModal('modalAdmissao')" style="padding: 12px 24px; background: rgba(255,255,255,0.1); color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            Cancelar
                        </button>
                        <button type="submit" style="padding: 12px 24px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            ✅ Admitir Paciente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Forçar pré-marcação
    setTimeout(() => forcarPreMarcacao('admitConcessoes', 'admitLinhas'), 100);
}

// =================== FUNÇÃO: ABRIR MODAL DE ATUALIZAÇÃO ===================
function openAtualizacaoModal(leitoId) {
    logInfo(`Abrindo modal de atualização para leito ${leitoId}`);
    
    window.selectedLeito = leitoId;
    const hospitalId = window.currentHospital;
    const hospital = window.hospitalData[hospitalId];
    const leito = hospital?.leitos?.find(l => l.idLeito === leitoId);
    
    if (!leito) {
        logError('Leito não encontrado para atualização');
        return;
    }

    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId];
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    // ⭐ CORREÇÃO 2: Header com "LEITO HÍBRIDO" na mesma linha
    let headerTexto = `Hospital: ${hospitalNome} | ID: ${hospitalId.replace('H', '')} | Leito: ${leitoId}`;
    if (isHibrido) {
        headerTexto += ' | LEITO HÍBRIDO';
    }

    const concessoesCheckboxes = window.CONCESSOES_LIST.map(c => {
        const checked = leito.concessoes && leito.concessoes.includes(c) ? 'checked' : '';
        return `<label style="display: flex; align-items: center; padding: 6px;"><input type="checkbox" name="concessao" value="${c}" ${checked} style="margin-right: 8px;">${c}</label>`;
    }).join('');
    
    const linhasCheckboxes = window.LINHAS_CUIDADO_LIST.map(l => {
        const checked = leito.linhas && leito.linhas.includes(l) ? 'checked' : '';
        return `<label style="display: flex; align-items: center; padding: 6px;"><input type="checkbox" name="linha" value="${l}" ${checked} style="margin-right: 8px;">${l}</label>`;
    }).join('');

    // ⭐ Seletor de categoria APENAS para hospitais híbridos
    let seletorCategoria = '';
    if (isHibrido) {
        seletorCategoria = `
            <div>
                <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                    Categoria <span style="color: #ef4444;">*</span>
                </label>
                <select id="updateCategoriaEscolhida" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                    <option value="">Selecione...</option>
                    ${window.TIPO_QUARTO_OPTIONS.map(t => `<option value="${t}" ${leito.categoriaEscolhida === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        `;
    }

    // ⭐ CORREÇÃO 4: Calcular tempo de internação
    let tempoInternacao = '';
    if (leito.dataAdmissao) {
        const dataAdm = new Date(leito.dataAdmissao);
        const agora = new Date();
        const diffMs = agora - dataAdm;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDias = Math.floor(diffHoras / 24);
        const horasRestantes = diffHoras % 24;
        
        if (diffDias > 0) {
            tempoInternacao = `${diffDias}d ${horasRestantes}h`;
        } else {
            tempoInternacao = `${diffHoras}h`;
        }
    }

    const modalHTML = `
        <div id="modalAtualizacao" class="modal-overlay" onclick="if(event.target === this) closeModal('modalAtualizacao')">
            <div class="modal-content" onclick="event.stopPropagation()" style="background: #1f2937; border-radius: 12px; padding: 30px; max-width: 900px; max-height: 90vh; overflow-y: auto;">
                
                <!-- HEADER -->
                <div style="background: rgba(96,165,250,0.1); border-left: 4px solid #60a5fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #60a5fa; margin: 0; font-size: 16px; font-weight: 600;">
                        ${headerTexto}
                    </h2>
                </div>

                <form id="formAtualizacao" onsubmit="submitAtualizacao(event)">
                    
                    <!-- LINHA 1: NOME + IDADE + MATRÍCULA -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Nome Completo <span style="color: #ef4444;">*</span>
                            </label>
                            <input type="text" id="updateNome" required placeholder="Nome do paciente" value="${leito.nome || ''}"
                                style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Idade <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updateIdade" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.IDADE_OPTIONS.map(i => `<option value="${i}" ${leito.idade == i ? 'selected' : ''}>${i}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Matrícula <span style="color: #ef4444;">*</span>
                            </label>
                            <input type="text" id="updateMatricula" required placeholder="00000-0" maxlength="7" value="${leito.matricula || ''}"
                                oninput="formatarMatricula(this)"
                                style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                        </div>
                    </div>

                    <!-- LINHA 2: GÊNERO + REGIÃO + ISOLAMENTO -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Gênero <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updateGenero" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.SEXO_OPTIONS.map(s => `<option value="${s}" ${leito.genero === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Região <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updateRegiao" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.REGIAO_OPTIONS.map(r => `<option value="${r}" ${leito.regiao === r ? 'selected' : ''}>${r}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Isolamento <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updateIsolamento" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.ISOLAMENTO_OPTIONS.map(i => `<option value="${i}" ${leito.isolamento === i ? 'selected' : ''}>${i}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- LINHA 3: CATEGORIA (apenas híbridos) + MÉDICO + PPS -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        ${seletorCategoria}
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Médico Responsável <span style="color: #ef4444;">*</span>
                            </label>
                            <input type="text" id="updateMedico" required placeholder="Dr(a)..." value="${leito.medicoResp || ''}"
                                style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                PPS <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updatePps" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.PPS_OPTIONS.map(p => `<option value="${p}" ${leito.pps === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- LINHA 4: PREVISÃO ALTA + DIRETIVAS + SPICT -->
                    <div class="form-grid-3-cols" style="margin-bottom: 20px;">
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Previsão de Alta <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updatePrevisaoAlta" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.PREVISAO_ALTA_OPTIONS.map(p => `<option value="${p}" ${leito.previsaoAlta === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                Diretivas Antecipadas <span style="color: #ef4444;">*</span>
                            </label>
                            <select id="updateDiretivas" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #374151; color: #ffffff;">
                                <option value="">Selecione...</option>
                                ${window.DIRETIVAS_OPTIONS.map(d => `<option value="${d}" ${leito.diretivas === d ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px;">
                                SPICT-BR
                            </label>
                            <div style="display: flex; align-items: center; height: 40px;">
                                <input type="checkbox" id="updateSpict" ${leito.spict ? 'checked' : ''} style="width: 20px; height: 20px; margin-right: 10px; accent-color: #60a5fa; cursor: pointer;">
                                <label for="updateSpict" style="color: #ffffff; cursor: pointer;">Aplicável</label>
                            </div>
                        </div>
                    </div>

                    <!-- CONCESSÕES -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; margin-bottom: 10px;">
                            Concessões
                        </label>
                        <div id="updateConcessoes" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 200px; overflow-y: auto;">
                            ${concessoesCheckboxes}
                        </div>
                    </div>

                    <!-- LINHAS DE CUIDADO -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; margin-bottom: 10px;">
                            Linhas de Cuidado
                        </label>
                        <div id="updateLinhas" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; max-height: 250px; overflow-y: auto;">
                            ${linhasCheckboxes}
                        </div>
                    </div>

                    <!-- ⭐ CORREÇÃO 4: INFO ADMISSÃO + BOTÕES -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5);">
                            ${leito.dataAdmissao ? `
                                <div>ADMISSÃO: ${new Date(leito.dataAdmissao).toLocaleString('pt-BR')}</div>
                                <div style="color: #22c55e; font-weight: 600;">INTERNADO: ${tempoInternacao}</div>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button type="button" onclick="darAlta('${leitoId}')" style="padding: 10px 20px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                                🚪 DAR ALTA
                            </button>
                            <button type="button" onclick="closeModal('modalAtualizacao')" style="padding: 10px 20px; background: rgba(255,255,255,0.1); color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                                Cancelar
                            </button>
                            <button type="submit" style="padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                                💾 SALVAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// =================== FUNÇÃO: FECHAR MODAL ===================
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
};

// =================== FUNÇÃO: FORÇAR PRÉ-MARCAÇÃO ===================
window.forcarPreMarcacao = function(concessoesId, linhasId) {
    setTimeout(() => {
        const concessoesDiv = document.getElementById(concessoesId);
        const linhasDiv = document.getElementById(linhasId);
        
        if (concessoesDiv) {
            const checkboxesConcessoes = concessoesDiv.querySelectorAll('input[type="checkbox"]');
            checkboxesConcessoes.forEach((checkbox, index) => {
                if (index < 3) checkbox.checked = true;
            });
        }
        
        if (linhasDiv) {
            const checkboxesLinhas = linhasDiv.querySelectorAll('input[type="checkbox"]');
            checkboxesLinhas.forEach((checkbox, index) => {
                if (index < 3) checkbox.checked = true;
            });
        }
    }, 150);
};

// =================== FUNÇÃO: COLETAR DADOS DO FORMULÁRIO ===================
window.coletarDadosFormulario = function(prefixo) {
    const concessoesSelecionadas = Array.from(document.querySelectorAll(`#${prefixo}Concessoes input[type="checkbox"]:checked`))
        .map(cb => cb.value);
    
    const linhasSelecionadas = Array.from(document.querySelectorAll(`#${prefixo}Linhas input[type="checkbox"]:checked`))
        .map(cb => cb.value);

    const dados = {
        nome: document.getElementById(`${prefixo}Nome`).value,
        idade: document.getElementById(`${prefixo}Idade`).value,
        matricula: document.getElementById(`${prefixo}Matricula`).value,
        genero: document.getElementById(`${prefixo}Genero`).value,
        regiao: document.getElementById(`${prefixo}Regiao`).value,
        isolamento: document.getElementById(`${prefixo}Isolamento`).value,
        medicoResp: document.getElementById(`${prefixo}Medico`).value,
        pps: document.getElementById(`${prefixo}Pps`).value,
        previsaoAlta: document.getElementById(`${prefixo}PrevisaoAlta`).value,
        diretivas: document.getElementById(`${prefixo}Diretivas`).value,
        spict: document.getElementById(`${prefixo}Spict`).checked,
        concessoes: concessoesSelecionadas,
        linhas: linhasSelecionadas
    };

    // Adicionar categoriaEscolhida apenas para hospitais híbridos
    const categoriaSelect = document.getElementById(`${prefixo}CategoriaEscolhida`);
    if (categoriaSelect) {
        dados.categoriaEscolhida = categoriaSelect.value;
    }

    return dados;
};

// =================== FUNÇÃO: SUBMIT ADMISSÃO ===================
window.submitAdmissao = async function(event) {
    event.preventDefault();
    
    try {
        const dados = coletarDadosFormulario('admit');
        
        const payload = {
            action: 'admitir',
            hospitalId: window.currentHospital,
            leitoId: window.selectedLeito,
            ...dados
        };
        
        logInfo('Enviando admissão:', payload);
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            logSuccess('Admissão realizada com sucesso!');
            closeModal('modalAdmissao');
            await window.loadData();
        } else {
            logError('Erro na admissão:', result.error);
            alert('Erro ao admitir paciente: ' + result.error);
        }
    } catch (error) {
        logError('Erro ao processar admissão:', error);
        alert('Erro ao processar admissão. Verifique o console.');
    }
};

// =================== FUNÇÃO: SUBMIT ATUALIZAÇÃO ===================
window.submitAtualizacao = async function(event) {
    event.preventDefault();
    
    try {
        const dados = coletarDadosFormulario('update');
        
        const payload = {
            action: 'atualizar',
            hospitalId: window.currentHospital,
            leitoId: window.selectedLeito,
            ...dados
        };
        
        logInfo('Enviando atualização:', payload);
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            logSuccess('Atualização realizada com sucesso!');
            closeModal('modalAtualizacao');
            await window.loadData();
        } else {
            logError('Erro na atualização:', result.error);
            alert('Erro ao atualizar paciente: ' + result.error);
        }
    } catch (error) {
        logError('Erro ao processar atualização:', error);
        alert('Erro ao processar atualização. Verifique o console.');
    }
};

// =================== FUNÇÃO: DAR ALTA ===================
window.darAlta = async function(leitoId) {
    if (!confirm(`Confirma a alta do paciente do leito ${leitoId}?`)) {
        return;
    }
    
    try {
        const payload = {
            action: 'darAlta',
            hospitalId: window.currentHospital,
            leitoId: leitoId
        };
        
        logInfo('Dando alta:', payload);
        
        const response = await fetch(window.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            logSuccess('Alta realizada com sucesso!');
            
            // Fechar modal se estiver aberto
            const modalAtualizacao = document.getElementById('modalAtualizacao');
            if (modalAtualizacao) {
                modalAtualizacao.remove();
            }
            
            await window.loadData();
        } else {
            logError('Erro ao dar alta:', result.error);
            alert('Erro ao dar alta: ' + result.error);
        }
    } catch (error) {
        logError('Erro ao processar alta:', error);
        alert('Erro ao processar alta. Verifique o console.');
    }
};

// =================== CSS INLINE COMPLETO ===================
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .modal-content {
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        input, select {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }

        select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
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

        input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #60a5fa;
            cursor: pointer;
        }
        
        label:has(input[type="checkbox"]) {
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            padding: 4px !important;
        }
        
        label:has(input[type="checkbox"]):hover {
            background-color: rgba(96, 165, 250, 0.1);
        }

        .card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .form-grid-3-cols {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 15px !important;
        }
        
        /* =================== TABLET (768px - 1024px) =================== */
        @media (max-width: 1024px) and (min-width: 769px) {
            .cards-grid {
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 18px;
            }
            
            .form-grid-3-cols {
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 12px !important;
            }
        }

        /* =================== MOBILE (≤768px) =================== */
        @media (max-width: 768px) {
            .cards-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }
            
            .card-row,
            .card-row-pessoa {
                display: grid !important;
                grid-template-columns: 100px 1fr 1fr !important;
                gap: 8px !important;
            }
            
            .pessoa-circle {
                width: 100px !important;
                height: 100px !important;
            }
            
            .modal-overlay .modal-content {
                width: 95% !important;
                max-width: none !important;
                margin: 10px !important;
                max-height: 95vh !important;
                padding: 20px !important;
            }
            
            .form-grid-3-cols {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 8px !important;
            }
            
            .form-grid-3-cols input,
            .form-grid-3-cols select {
                padding: 8px 6px !important;
                font-size: 12px !important;
            }
            
            .form-grid-3-cols label {
                font-size: 10px !important;
                margin-bottom: 3px !important;
            }
            
            .modal-content div[id$="Concessoes"], 
            .modal-content div[id$="Linhas"] {
                grid-template-columns: 1fr !important;
                max-height: 120px !important;
            }
            
            input[type="checkbox"] {
                width: 18px !important;
                height: 18px !important;
                margin-right: 10px !important;
            }
            
            label:has(input[type="checkbox"]) {
                padding: 8px !important;
                font-size: 12px !important;
            }
        }
        
        /* =================== MOBILE PEQUENO (≤480px) =================== */
        @media (max-width: 480px) {
            .card {
                padding: 12px !important;
            }
            
            .card-row,
            .card-row-pessoa {
                gap: 6px !important;
            }
            
            .modal-content {
                padding: 15px !important;
            }
            
            .form-grid-3-cols {
                gap: 6px !important;
            }
        }
        
        /* =================== LANDSCAPE =================== */
        @media (max-width: 768px) and (orientation: landscape) {
            .cards-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 12px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// =================== INICIALIZAÇÃO V3.3 FINAL ===================
document.addEventListener('DOMContentLoaded', function() {
    logSuccess('✅ CARDS.JS V3.3 FINAL CORRIGIDO CARREGADO');
    injectStyles();
    
    // Verificar listas
    logSuccess(`✅ ${window.CONCESSOES_LIST.length} concessões`);
    logSuccess(`✅ ${window.LINHAS_CUIDADO_LIST.length} linhas de cuidado`);
    logSuccess(`✅ ${window.REGIAO_OPTIONS.length} regiões`);
    logSuccess(`✅ ${window.SEXO_OPTIONS.length} opções de gênero`);
    logSuccess(`✅ ${window.DIRETIVAS_OPTIONS.length} opções de diretivas`);
    
    logInfo('🎯 CORREÇÕES APLICADAS V3.3:');
    logInfo('  • ✅ Box TIPO reflete categoria escolhida (coluna C)');
    logInfo('  • ✅ Header admissão: "LEITO HÍBRIDO" na mesma linha');
    logInfo('  • ✅ Diretivas duplicadas removidas');
    logInfo('  • ✅ Modal atualização: layout igual admitir + info internação');
});

// =================== EXPORTS ===================
window.createCard = createCard;
window.openAdmissaoModal = openAdmissaoModal;
window.openAtualizacaoModal = openAtualizacaoModal;
window.forcarPreMarcacao = forcarPreMarcacao;
window.coletarDadosFormulario = coletarDadosFormulario;
window.getBadgeIsolamento = getBadgeIsolamento;
window.getBadgeGenero = getBadgeGenero;
window.getBadgeDiretivas = getBadgeDiretivas;
window.formatarMatricula = formatarMatricula;

logSuccess('🎉 CARDS.JS V3.3 FINAL CORRIGIDO - COMPLETO E PRONTO!');
