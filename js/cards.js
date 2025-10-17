// =================== CARDS.JS V3.3 FINAL - ESTRUTURA MOCKUP APROVADA ===================
// =================== LAYOUT: HOSPITAL FORA DOS BOXES + LINHA DIVISÓRIA + CÍRCULO PESSOA ===================
// =================== LISTAS FINAIS: 11 CONCESSÕES + 45 LINHAS + DIRETIVAS (BV/73) ===================

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

// ⭐ NOVO V3.3: IDENTIFICAR HOSPITAIS HÍBRIDOS
window.HOSPITAIS_HIBRIDOS = ['H1', 'H3', 'H5'];

// ⭐ NOVO V3.3: TIPO DE QUARTO (2 OPÇÕES - APENAS PARA HÍBRIDOS)
window.TIPO_QUARTO_OPTIONS = ['Apartamento', 'Enfermaria'];

// =================== LISTAS FINAIS CONFIRMADAS V3.3 ===================

// CONCESSÕES: 11 ITENS (ORDEM CONFIRMADA)
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

// LINHAS DE CUIDADO: 45 ESPECIALIDADES (ORDEM CONFIRMADA)
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

// REGIÃO: 9 OPÇÕES (CONFIRMADAS)
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

// GÊNERO: 2 OPÇÕES (POR EXTENSO CONFIRMADO)
window.SEXO_OPTIONS = [
    'Masculino',
    'Feminino'
];

// ⭐ NOVO V3.3: DIRETIVAS ANTECIPADAS (BV/73)
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
        texto: '—'
    };
}

// ⭐ NOVO V3.3: BADGE DE DIRETIVAS
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
            cor: 'rgba(107,114,128,0.2)',
            borda: '#6b7280',
            textoCor: '#9ca3af',
            texto: 'Não'
        };
    }
    // Padrão: Não se aplica
    return {
        cor: 'rgba(96,165,250,0.2)',
        borda: '#60a5fa',
        textoCor: '#60a5fa',
        texto: 'N/A'
    };
}

// ⭐ CORREÇÃO 1: DETERMINAR TIPO REAL DO LEITO
function getTipoLeito(leito, hospitalId) {
    // Se for híbrido, verificar categoria escolhida
    if (window.HOSPITAIS_HIBRIDOS.includes(hospitalId)) {
        // Se tem categoria escolhida, usar ela
        if (leito.categoriaEscolhida) { // ✅ CORRIGIDO
            return leito.categoriaEscolhida;
        }
        // Se não tem, exibir "Híbrido"
        return 'Híbrido';
    }
    
    // Se não for híbrido, retornar o tipo fixo
    return leito.tipo || 'Apartamento';
}

// =================== CRIAR CARD INDIVIDUAL V3.3 FINAL - LAYOUT MOCKUP ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: var(--card); border-radius: 12px; padding: 18px; color: var(--text-white); box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    // Determinar status
    let isVago = false;
    let statusBgColor = '#22c55e'; // VERDE PADRÃO
    let statusTextColor = '#000000';
    let statusTexto = 'Disponível';
    
    if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
        isVago = false;
        statusBgColor = '#fbbf24'; // AMARELO PARA OCUPADO
        statusTextColor = '#000000';
        statusTexto = 'Ocupado';
    } else if (leito.status === 'Vago' || leito.status === 'vago') {
        isVago = true;
        statusBgColor = '#22c55e'; // VERDE PARA VAGO
        statusTextColor = '#000000';
        statusTexto = 'Disponível';
    }
    
    // Dados do paciente
    const nome = leito.nome || '';
    const matricula = leito.matricula || '';
    const idade = leito.idade || null;
    const admissao = leito.admAt || '';
    const pps = leito.pps || null;
    const spict = leito.spict || '';
    const previsaoAlta = leito.prevAlta || '';
    
    // Dados V3.3
    const isolamento = leito.isolamento || 'Não Isolamento';
    const identificacaoLeito = leito.identificacaoLeito || '';
    const regiao = leito.regiao || '';
    const sexo = leito.genero || ''; // ✅ CORRIGIDO: leito.genero (não leito.sexo)
    const diretivas = leito.diretivas || 'Não se aplica'; // ⭐ NOVO V3.3
    
    // ⭐ CORREÇÃO 1: Usar tipo real do leito
    const hospitalId = leito.hospital || window.currentHospital;
    const tipoReal = getTipoLeito(leito, hospitalId);
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId); // ✅ NOVO: detectar se é híbrido
    
    // Badges
    const badgeIsolamento = getBadgeIsolamento(isolamento);
    const badgeGenero = getBadgeGenero(sexo);
    const badgeDiretivas = getBadgeDiretivas(diretivas);
    
    // Arrays diretos
    const concessoes = Array.isArray(leito.concessoes) ? leito.concessoes : [];
    const linhas = Array.isArray(leito.linhas) ? leito.linhas : [];
    
    // Calcular tempo de internação
    let tempoInternacao = '';
    if (!isVago && admissao) {
        tempoInternacao = calcularTempoInternacao(admissao);
    }
    
    // Extrair iniciais
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
    
    // ID sequencial e leito personalizado
    const idSequencial = String(numeroLeito).padStart(2, '0');
    const leitoPersonalizado = (identificacaoLeito && identificacaoLeito.trim()) 
        ? identificacaoLeito.trim().toUpperCase()
        : `LEITO ${numeroLeito}`;
    
    // COR DO CÍRCULO PESSOA
    let circuloCor = '#C1FF72'; // VERDE (vago)
    let circuloStroke = '#7A9B4D';
    if (!isVago) {
        if (sexo === 'Masculino') {
            circuloCor = '#38BDF8'; // AZUL
            circuloStroke = '#0369A1';
        } else if (sexo === 'Feminino') {
            circuloCor = '#EC4899'; // ROSA
            circuloStroke = '#9333EA';
        }
    }
    
    // HTML do Card V3.3 FINAL (estrutura MOCKUP aprovada)
    card.innerHTML = `
        <!-- HEADER: HOSPITAL FORA DOS BOXES -->
        <div class="card-header" style="text-align: center; margin-bottom: 12px; padding-bottom: 8px;">
            <div style="font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">HOSPITAL</div>
            <div style="font-size: 16px; color: #ffffff; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${hospitalNome}</div>
            ${isHibrido ? '<div style="font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 600; margin-top: 2px;">Leito Híbrido</div>' : ''}
        </div>

        <!-- LINHA 1: LEITO | TIPO | STATUS -->
        <div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">LEITO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${leitoPersonalizado}</div>
            </div>
            
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">TIPO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${tipoReal}</div>
            </div>
            
            <div class="status-badge" style="background: ${statusBgColor}; color: ${statusTextColor}; padding: 12px 6px; border-radius: 6px; font-weight: 800; text-transform: uppercase; text-align: center; font-size: 11px; letter-spacing: 0.5px; min-height: 45px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div class="box-label" style="font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; color: ${statusTextColor};">STATUS</div>
                <div class="box-value" style="font-weight: 700; font-size: 11px; line-height: 1.2; color: ${statusTextColor};">${statusTexto}</div>
            </div>
        </div>

        <!-- LINHA 2: GÊNERO | ISOLAMENTO | PREV ALTA -->
        <div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="card-box" style="background: ${badgeGenero.cor}; border: 1px solid ${badgeGenero.borda}; border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: ${badgeGenero.textoCor}; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">GÊNERO</div>
                <div class="box-value" style="color: ${badgeGenero.textoCor}; font-weight: 700; font-size: 11px; line-height: 1.2;">${badgeGenero.texto}</div>
            </div>
            
            <div class="card-box" style="background: ${badgeIsolamento.cor}; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: ${badgeIsolamento.textoCor}; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">ISOLAMENTO</div>
                <div class="box-value" style="color: ${badgeIsolamento.textoCor}; font-weight: 700; font-size: 11px; line-height: 1.2;">${badgeIsolamento.texto}</div>
            </div>
            
            <div class="card-box prev-alta" style="background: #8FD3F4; border: 1px solid rgba(143,211,244,0.5); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: #000000; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">PREVISÃO ALTA</div>
                <div class="box-value" style="color: #000000; font-weight: 700; font-size: 11px; line-height: 1.2;">${previsaoAlta || '—'}</div>
            </div>
        </div>

        <!-- LINHA DIVISÓRIA -->
        <div class="divider" style="height: 2px; background: rgba(255,255,255,0.3); margin: 12px 0;"></div>

        <!-- SEÇÃO PESSOA: CÍRCULO + 4 CÉLULAS -->
        <div class="card-row-pessoa" style="display: grid; grid-template-columns: 100px 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <!-- CÍRCULO PERFEITO COM ÍCONE PESSOA -->
            <div class="pessoa-circle" style="grid-row: span 2; grid-column: 1; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: ${circuloCor};">
                <svg class="pessoa-icon" viewBox="0 0 24 24" fill="none" stroke="${circuloStroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 55%; height: 55%;">
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                </svg>
            </div>

            <!-- CÉLULA 1: INICIAIS -->
            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">INICIAIS</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">${iniciais}</div>
            </div>

            <!-- CÉLULA 2: MATRÍCULA -->
            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">MATRÍCULA</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">${matricula || '—'}</div>
            </div>

            <!-- CÉLULA 3: IDADE -->
            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">IDADE</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">${idade ? idade + ' anos' : '—'}</div>
            </div>

            <!-- CÉLULA 4: REGIÃO -->
            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">REGIÃO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">${regiao || '—'}</div>
            </div>
        </div>

        <!-- LINHA 3: PPS | SPICT-BR | DIRETIVAS (NOVO V3.3!) -->
        <div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">PPS</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${ppsFormatado}</div>
            </div>
            
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">SPICT-BR</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${spictFormatado}</div>
            </div>
            
            <div class="card-box" style="background: ${badgeDiretivas.cor}; border: 1px solid ${badgeDiretivas.borda}; border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: ${badgeDiretivas.textoCor}; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">DIRETIVAS</div>
                <div class="box-value" style="color: ${badgeDiretivas.textoCor}; font-weight: 700; font-size: 11px; line-height: 1.2;">${badgeDiretivas.texto}</div>
            </div>
        </div>

        <!-- CONCESSÕES -->
        <div class="card-section" style="margin-bottom: 12px;">
            <div class="section-header" style="background: #60a5fa; color: #ffffff; font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                CONCESSÕES PREVISTAS NA ALTA
            </div>
            <div class="chips-container" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; border-radius: 6px; padding: 8px;">
                ${(concessoes && concessoes.length > 0) 
                    ? concessoes.map(concessao => `<span class="chip" style="font-size: 9px; background: rgba(96,165,250,0.2); border: 1px solid rgba(96,165,250,0.4); color: #60a5fa; padding: 3px 8px; border-radius: 10px; font-weight: 700;">${concessao}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <!-- LINHAS DE CUIDADO -->
        <div class="card-section" style="margin-bottom: 15px;">
            <div class="section-header" style="background: #60a5fa; color: #ffffff; font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                LINHAS DE CUIDADO PREVISTAS NA ALTA
            </div>
            <div class="chips-container" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; border-radius: 6px; padding: 8px;">
                ${(linhas && linhas.length > 0) 
                    ? linhas.map(linha => `<span class="chip" style="font-size: 9px; background: rgba(96,165,250,0.2); border: 1px solid rgba(96,165,250,0.4); color: #60a5fa; padding: 3px 8px; border-radius: 10px; font-weight: 700;">${linha}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <!-- FOOTER -->
        <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); gap: 10px;">
            <div class="card-info" style="display: flex; gap: 8px; flex-wrap: wrap; flex: 1;">
                ${!isVago && admissao ? `
                <div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">ADMISSÃO</div>
                    <div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">${formatarDataHora(admissao)}</div>
                </div>
                ` : ''}
                
                ${!isVago && tempoInternacao ? `
                <div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">INTERNADO</div>
                    <div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">${tempoInternacao}</div>
                </div>
                ` : ''}
                
                ${isVago ? `
                <div class="info-item" style="display: flex; flex-direction: column;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">STATUS</div>
                    <div class="info-value" style="color: #C1FF72; font-weight: 700; font-size: 9px;">✓ Disponível</div>
                </div>
                ` : ''}
            </div>
            
            <button class="btn-action" data-action="${isVago ? 'admitir' : 'atualizar'}" data-leito="${numeroLeito}" style="padding: 10px 18px; background: ${isVago ? '#C1FF72' : '#374151'}; color: ${isVago ? '#000000' : '#ffffff'}; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 11px; transition: all 0.2s ease; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;">
                ${isVago ? 'ADMITIR' : 'ATUALIZAR'}
            </button>
        </div>
    `;

    // Event listeners
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
        logInfo(`Modal de admissão V3.3 FINAL aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

function openAtualizacaoFlow(leitoNumero, dadosLeito) {
    const button = document.querySelector(`[data-action="atualizar"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ATUALIZAR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAtualizacaoModal(leitoNumero, dadosLeito);
        logInfo(`Modal de atualização V3.3 FINAL aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

// =================== MODAIS V3.3 FINAL ===================
function openAdmissaoModal(leitoNumero) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAdmissaoForm(hospitalNome, leitoNumero, hospitalId);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'admissao');
}

function openAtualizacaoModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId] || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito, hospitalId);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'atualizacao');
    
    // Pré-marcação
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

// =================== FORMULÁRIO DE ADMISSÃO V3.3 FINAL ===================
function createAdmissaoForm(hospitalNome, leitoNumero, hospitalId) {
    const idSequencial = String(leitoNumero).padStart(2, '0');
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    // ⭐ CORREÇÃO 2: Header com informação híbrido na mesma linha, sem emoji
    const headerInfo = `Hospital: ${hospitalNome} | ID: ${idSequencial} | Leito: ${leitoNumero}${isHibrido ? ' | LEITO HÍBRIDO' : ''}`;
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ADMITIR PACIENTE
            </h2>
            
            <!-- ⭐ CORREÇÃO 2: Header simplificado em uma linha -->
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <div style="font-size: 14px; color: #ffffff;">
                    ${headerInfo}
                </div>
            </div>

            <form id="formAdmissao">
                
                <!-- LINHA 1: NOME | IDADE | MATRÍCULA -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Nome Completo <span style="color: #ef4444;">*</span>
                        </label>
                        <input type="text" id="admitNome" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Idade <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitIdade" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.IDADE_OPTIONS.map(i => `<option value="${i}">${i} anos</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Matrícula <span style="color: #ef4444;">*</span>
                        </label>
                        <input type="text" id="admitMatricula" required placeholder="00000-0" maxlength="7"
                            oninput="formatarMatricula(this)"
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                    </div>
                </div>
                
                <!-- LINHA 2: GÊNERO | REGIÃO | ISOLAMENTO -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Gênero <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitGenero" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.SEXO_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Região <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitRegiao" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.REGIAO_OPTIONS.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Isolamento <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitIsolamento" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.ISOLAMENTO_OPTIONS.map(i => `<option value="${i}">${i}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- LINHA 3: CATEGORIA (só híbridos) | MÉDICO | PPS -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    ${isHibrido ? `
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Categoria <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitCategoriaEscolhida" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.TIPO_QUARTO_OPTIONS.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    ` : '<div></div>'}
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Médico Responsável <span style="color: #ef4444;">*</span>
                        </label>
                        <input type="text" id="admitMedico" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            PPS <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitPps" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.PPS_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- LINHA 4: PREVISÃO ALTA | DIRETIVAS | SPICT -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Previsão de Alta <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitPrevisaoAlta" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.PREVISAO_ALTA_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Diretivas <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="admitDiretivas" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.DIRETIVAS_OPTIONS.map(d => `<option value="${d}">${d}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            SPICT-BR
                        </label>
                        <div style="display: flex; align-items: center; height: 42px; padding-left: 10px;">
                            <input type="checkbox" id="admitSpict"
                                style="width: 18px; height: 18px; margin-right: 8px; accent-color: #60a5fa; cursor: pointer;">
                            <label for="admitSpict" style="color: #ffffff; cursor: pointer; font-size: 14px;">Aplicável</label>
                        </div>
                    </div>
                </div>
                
                <!-- CONCESSÕES -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase;">
                        Concessões Previstas na Alta
                    </label>
                    <div id="admitConcessoes" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; max-height: 200px; overflow-y: auto;">
                        ${window.CONCESSOES_LIST.map(c => `
                            <label style="display: flex; align-items: center; padding: 6px; cursor: pointer; border-radius: 4px; transition: background 0.2s;">
                                <input type="checkbox" name="concessao" value="${c}" style="margin-right: 8px; width: 16px; height: 16px; accent-color: #60a5fa; cursor: pointer;">
                                <span style="font-size: 12px; color: rgba(255,255,255,0.9);">${c}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- LINHAS DE CUIDADO -->
                <div style="margin-bottom: 30px;">
                    <label style="display: block; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase;">
                        Linhas de Cuidado Previstas na Alta
                    </label>
                    <div id="admitLinhas" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; max-height: 250px; overflow-y: auto;">
                        ${window.LINHAS_CUIDADO_LIST.map(l => `
                            <label style="display: flex; align-items: center; padding: 6px; cursor: pointer; border-radius: 4px; transition: background 0.2s;">
                                <input type="checkbox" name="linha" value="${l}" style="margin-right: 8px; width: 16px; height: 16px; accent-color: #60a5fa; cursor: pointer;">
                                <span style="font-size: 12px; color: rgba(255,255,255,0.9);">${l}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <!-- BOTÕES -->
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn-cancelar" style="padding: 12px 24px; background: rgba(255,255,255,0.1); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 700; text-transform: uppercase; transition: all 0.2s;">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-submit" style="padding: 12px 32px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 700; text-transform: uppercase; transition: all 0.2s;">
                        Admitir Paciente
                    </button>
                </div>
            </form>
        </div>
    `;
}

// =================== FORMULÁRIO DE ATUALIZAÇÃO V3.3 FINAL ===================
function createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito, hospitalId) {
    const idSequencial = String(leitoNumero).padStart(2, '0');
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    // ⭐ CORREÇÃO 2: Header com informação híbrido na mesma linha, sem emoji
    const headerInfo = `Hospital: ${hospitalNome} | ID: ${idSequencial} | Leito: ${leitoNumero}${isHibrido ? ' | LEITO HÍBRIDO' : ''}`;
    
    // ⭐ CORREÇÃO 4: Calcular tempo de internação
    let tempoInternacao = '';
    let dataAdmissaoFormatada = '';
    if (dadosLeito.admAt) {
        const dataAdm = new Date(dadosLeito.admAt);
        dataAdmissaoFormatada = formatarDataHora(dadosLeito.admAt);
        tempoInternacao = calcularTempoInternacao(dadosLeito.admAt);
    }
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ATUALIZAR PACIENTE
            </h2>
            
            <!-- ⭐ CORREÇÃO 2: Header simplificado em uma linha -->
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <div style="font-size: 14px; color: #ffffff;">
                    ${headerInfo}
                </div>
            </div>

            <form id="formAtualizacao">
                
                <!-- LINHA 1: NOME | IDADE | MATRÍCULA -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Nome Completo <span style="color: #ef4444;">*</span>
                        </label>
                        <input type="text" id="updateNome" required value="${dadosLeito.nome || ''}"
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Idade <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updateIdade" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.IDADE_OPTIONS.map(i => `<option value="${i}" ${dadosLeito.idade == i ? 'selected' : ''}>${i} anos</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Matrícula <span style="color: #ef4444;">*</span>
                        </label>
                        <input type="text" id="updateMatricula" required placeholder="00000-0" maxlength="7" value="${dadosLeito.matricula || ''}"
                            oninput="formatarMatricula(this)"
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                    </div>
                </div>
                
                <!-- LINHA 2: GÊNERO | REGIÃO | ISOLAMENTO -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Gênero <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updateGenero" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.SEXO_OPTIONS.map(s => `<option value="${s}" ${dadosLeito.genero === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Região <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updateRegiao" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.REGIAO_OPTIONS.map(r => `<option value="${r}" ${dadosLeito.regiao === r ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Isolamento <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updateIsolamento" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.ISOLAMENTO_OPTIONS.map(i => `<option value="${i}" ${dadosLeito.isolamento === i ? 'selected' : ''}>${i}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- LINHA 3: CATEGORIA (só híbridos) | MÉDICO | PPS -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    ${isHibrido ? `
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Categoria <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updateCategoriaEscolhida" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.TIPO_QUARTO_OPTIONS.map(t => `<option value="${t}" ${dadosLeito.categoriaEscolhida === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    ` : '<div></div>'}
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Médico Responsável <span style="color: #ef4444;">*</span>
                        </label>
                        <input type="text" id="updateMedico" required value="${dadosLeito.medicoResp || ''}"
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            PPS <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updatePps" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.PPS_OPTIONS.map(p => `<option value="${p}" ${dadosLeito.pps === p ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- LINHA 4: PREVISÃO ALTA | DIRETIVAS | SPICT -->
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Previsão de Alta <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updatePrevisaoAlta" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.PREVISAO_ALTA_OPTIONS.map(p => `<option value="${p}" ${dadosLeito.prevAlta === p ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            Diretivas <span style="color: #ef4444;">*</span>
                        </label>
                        <select id="updateDiretivas" required
                            style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: #2d3748; color: #ffffff; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.DIRETIVAS_OPTIONS.map(d => `<option value="${d}" ${dadosLeito.diretivas === d ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: rgba(255,255,255,0.7); font-size: 12px; margin-bottom: 6px; font-weight: 600;">
                            SPICT-BR
                        </label>
                        <div style="display: flex; align-items: center; height: 42px; padding-left: 10px;">
                            <input type="checkbox" id="updateSpict" ${dadosLeito.spict === 'elegivel' ? 'checked' : ''}
                                style="width: 18px; height: 18px; margin-right: 8px; accent-color: #60a5fa; cursor: pointer;">
                            <label for="updateSpict" style="color: #ffffff; cursor: pointer; font-size: 14px;">Aplicável</label>
                        </div>
                    </div>
                </div>
                
                <!-- CONCESSÕES -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase;">
                        Concessões Previstas na Alta
                    </label>
                    <div id="updateConcessoes" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; max-height: 200px; overflow-y: auto;">
                        ${window.CONCESSOES_LIST.map(c => {
                            const checked = dadosLeito.concessoes && dadosLeito.concessoes.includes(c) ? 'checked' : '';
                            return `
                                <label style="display: flex; align-items: center; padding: 6px; cursor: pointer; border-radius: 4px; transition: background 0.2s;">
                                    <input type="checkbox" name="concessao" value="${c}" ${checked} style="margin-right: 8px; width: 16px; height: 16px; accent-color: #60a5fa; cursor: pointer;">
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.9);">${c}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- LINHAS DE CUIDADO -->
                <div style="margin-bottom: 30px;">
                    <label style="display: block; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase;">
                        Linhas de Cuidado Previstas na Alta
                    </label>
                    <div id="updateLinhas" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; max-height: 250px; overflow-y: auto;">
                        ${window.LINHAS_CUIDADO_LIST.map(l => {
                            const checked = dadosLeito.linhas && dadosLeito.linhas.includes(l) ? 'checked' : '';
                            return `
                                <label style="display: flex; align-items: center; padding: 6px; cursor: pointer; border-radius: 4px; transition: background 0.2s;">
                                    <input type="checkbox" name="linha" value="${l}" ${checked} style="margin-right: 8px; width: 16px; height: 16px; accent-color: #60a5fa; cursor: pointer;">
                                    <span style="font-size: 12px; color: rgba(255,255,255,0.9);">${l}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- ⭐ CORREÇÃO 4: INFO ADMISSÃO + BOTÕES -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 11px; color: rgba(255,255,255,0.6);">
                        ${dataAdmissaoFormatada ? `
                            <div style="margin-bottom: 4px;">
                                <strong style="color: rgba(255,255,255,0.5);">ADMISSÃO:</strong> ${dataAdmissaoFormatada}
                            </div>
                            <div>
                                <strong style="color: #22c55e;">INTERNADO:</strong> ${tempoInternacao}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn-alta" style="padding: 12px 20px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; text-transform: uppercase; transition: all 0.2s;">
                            Dar Alta
                        </button>
                        <button type="button" class="btn-cancelar" style="padding: 12px 20px; background: rgba(255,255,255,0.1); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; text-transform: uppercase; transition: all 0.2s;">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-submit" style="padding: 12px 28px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 700; text-transform: uppercase; transition: all 0.2s;">
                            Salvar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
}

// =================== SETUP DE EVENT LISTENERS ===================
function setupModalEventListeners(modal, tipo) {
    // Cancelar
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modal.remove();
            logInfo(`Modal de ${tipo} cancelado`);
        });
    }
    
    // Submit
    const form = modal.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (tipo === 'admissao') {
                submitAdmissao(form);
            } else if (tipo === 'atualizacao') {
                submitAtualizacao(form);
            }
        });
    }
    
    // Dar Alta (apenas atualização)
    if (tipo === 'atualizacao') {
        const btnAlta = modal.querySelector('.btn-alta');
        if (btnAlta) {
            btnAlta.addEventListener('click', () => {
                darAlta(window.selectedLeito);
                modal.remove();
            });
        }
    }
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            logInfo(`Modal de ${tipo} fechado`);
        }
    });
}

// =================== SUBMIT HANDLERS ===================
async function submitAdmissao(form) {
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
            document.querySelector('.modal-overlay').remove();
            await window.loadData();
        } else {
            logError('Erro na admissão:', result.error);
            alert('Erro ao admitir paciente: ' + result.error);
        }
    } catch (error) {
        logError('Erro ao processar admissão:', error);
        alert('Erro ao processar admissão. Verifique o console.');
    }
}

async function submitAtualizacao(form) {
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
            document.querySelector('.modal-overlay').remove();
            await window.loadData();
        } else {
            logError('Erro na atualização:', result.error);
            alert('Erro ao atualizar paciente: ' + result.error);
        }
    } catch (error) {
        logError('Erro ao processar atualização:', error);
        alert('Erro ao processar atualização. Verifique o console.');
    }
}

async function darAlta(leitoId) {
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
            await window.loadData();
        } else {
            logError('Erro ao dar alta:', result.error);
            alert('Erro ao dar alta: ' + result.error);
        }
    } catch (error) {
        logError('Erro ao processar alta:', error);
        alert('Erro ao processar alta. Verifique o console.');
    }
}

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

// =================== FUNÇÃO: FORMATAR MATRÍCULA ===================
function formatarMatricula(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length > 5) {
        valor = valor.slice(0, 5) + '-' + valor.slice(5, 6);
    }
    
    input.value = valor;
}

// =================== FUNÇÃO: PRÉ-MARCAÇÃO ===================
window.forcarPreMarcacao = function(modal, dadosLeito) {
    // Implementar se necessário
};

// =================== FUNÇÕES AUXILIARES ===================
function formatarDataHora(dataString) {
    if (!dataString) return '—';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calcularTempoInternacao(dataAdmissao) {
    if (!dataAdmissao) return '';
    
    const agora = new Date();
    const admissao = new Date(dataAdmissao);
    const diffMs = agora - admissao;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);
    const horasRestantes = diffHoras % 24;
    
    if (diffDias > 0) {
        return `${diffDias}d ${horasRestantes}h`;
    } else {
        return `${diffHoras}h`;
    }
}

function getIniciais(nomeCompleto) {
    if (!nomeCompleto) return '—';
    
    const palavras = nomeCompleto.trim().split(' ').filter(p => p.length > 0);
    if (palavras.length === 0) return '—';
    if (palavras.length === 1) return palavras[0].substring(0, 2).toUpperCase();
    
    return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase();
}

function showButtonLoading(button, text) {
    button.disabled = true;
    button.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>`;
}

function hideButtonLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

// =================== CSS INLINE COMPLETO ===================
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .modal-overlay {
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            animation: slideUp 0.3s ease;
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
            background-color: #2d3748 !important;
            color: #ffffff !important;
        }
        
        select:focus, input:focus {
            outline: none !important;
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
        }
        
        input[type="checkbox"] {
            accent-color: #60a5fa;
            cursor: pointer;
        }
        
        label:has(input[type="checkbox"]):hover {
            background-color: rgba(96, 165, 250, 0.08);
        }
        
        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16,185,129,0.4);
        }
        
        .btn-cancelar:hover {
            background: rgba(255,255,255,0.15);
        }
        
        .btn-alta:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239,68,68,0.4);
        }
        
        /* RESPONSIVO */
        @media (max-width: 768px) {
            .form-grid-3-cols {
                grid-template-columns: 1fr !important;
            }
            
            .modal-content {
                padding: 20px !important;
            }
        }
    `;
    document.head.appendChild(style);
})();

// =================== INICIALIZAÇÃO V3.3 FINAL ===================
document.addEventListener('DOMContentLoaded', function() {
    logSuccess('✅ CARDS.JS V3.3 FINAL CORRIGIDO CARREGADO');
    
    logSuccess(`✅ ${window.CONCESSOES_LIST.length} concessões`);
    logSuccess(`✅ ${window.LINHAS_CUIDADO_LIST.length} linhas de cuidado`);
    logSuccess(`✅ ${window.REGIAO_OPTIONS.length} regiões`);
    logSuccess(`✅ ${window.SEXO_OPTIONS.length} opções de gênero`);
    logSuccess(`✅ ${window.DIRETIVAS_OPTIONS.length} opções de diretivas`);
    
    logInfo('🎯 CORREÇÕES APLICADAS:');
    logInfo('  • ✅ Box TIPO reflete categoria escolhida (coluna C)');
    logInfo('  • ✅ Header: "LEITO HÍBRIDO" na mesma linha sem emoji');
    logInfo('  • ✅ Diretivas: seção duplicada removida');
    logInfo('  • ✅ Modal atualização: layout igual admitir + info internação no rodapé');
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

logSuccess('🎉 CARDS.JS V3.3 FINAL CORRIGIDO - COMPLETO!');
