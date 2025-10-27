// =================== CARDS.JS V3.3 FINAL - ESTRUTURA MOCKUP APROVADA ===================
// =================== LAYOUT: HOSPITAL FORA DOS BOXES + LINHA DIVISÓRIA + CÍRCULO PESSOA ===================
// =================== LISTAS FINAIS: 12 CONCESSÕES + 45 LINHAS + DIRETIVAS (BV/73) ===================

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

// ⭐ NOVO V3.3: SANTA CLARA - TODOS OS LEITOS SÃO HÍBRIDOS (1-13)
// Mas com limite máximo de 4 enfermarias ocupadas simultaneamente
window.SANTA_CLARA_TOTAL_LEITOS = 13;

// ⭐ NOVO V3.3: TIPO DE QUARTO (2 OPÇÕES - APENAS PARA HÍBRIDOS)
window.TIPO_QUARTO_OPTIONS = ['Apartamento', 'Enfermaria'];

// ⭐ NOVO V3.3: IDENTIFICAÇÕES FIXAS CRUZ AZUL - ENFERMARIA (16 leitos)
// ⭐ NOVO V3.3: MAPEAMENTO FIXO NUMERAÇÃO CRUZ AZUL - ENFERMARIAS (16 leitos: 21-36)
// ✅ HARDCODED - NÃO BUSCA DA PLANILHA
window.CRUZ_AZUL_NUMERACAO = {
    21: '711.1',
    22: '711.2',
    23: '713.1',
    24: '713.2',
    25: '715.1',
    26: '715.2',
    27: '717.1',
    28: '717.2',
    29: '719.1',
    30: '719.2',
    31: '721.1',
    32: '721.2',
    33: '723.1',
    34: '723.2',
    35: '725.1',
    36: '725.2'
};

// ⭐ NOVO V3.3: MAPEAMENTO DE LEITOS IRMÃOS (CRUZ AZUL)
window.CRUZ_AZUL_IRMAOS = {
    21: 22, 22: 21,  // 711.1 ↔ 711.2
    23: 24, 24: 23,  // 713.1 ↔ 713.2
    25: 26, 26: 25,  // 715.1 ↔ 715.2
    27: 28, 28: 27,  // 717.1 ↔ 717.2
    29: 30, 30: 29,  // 719.1 ↔ 719.2
    31: 32, 32: 31,  // 721.1 ↔ 721.2
    33: 34, 34: 33,  // 723.1 ↔ 723.2
    35: 36, 36: 35   // 725.1 ↔ 725.2
};

// =================== LISTAS FINAIS CONFIRMADAS V3.3 ===================

// ✅ CORREÇÃO 2: CONCESSÕES - 12 ITENS (ADICIONADO "Não se aplica" COMO PRIMEIRO)
window.CONCESSOES_LIST = [
    "Não se aplica",
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

// ✅ CORREÇÃO 5: PREVISÃO DE ALTA - 10 OPÇÕES (TROCADO "SP" POR "Sem Previsão")
window.PREVISAO_ALTA_OPTIONS = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R', 
    '48h', '72h', '96h', 'Sem Previsão'
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
    
    // ✅ CORREÇÃO: ORDENAR CARDS - OCUPADOS PRIMEIRO, DEPOIS VAGOS
    const leitosOrdenados = hospital.leitos.sort((a, b) => {
        const aOcupado = (a.status === 'ocupado' || a.status === 'Em uso' || a.status === 'Ocupado');
        const bOcupado = (b.status === 'ocupado' || b.status === 'Em uso' || b.status === 'Ocupado');
        
        // Se status diferente, ocupados vêm primeiro
        if (aOcupado && !bOcupado) return -1;
        if (!aOcupado && bOcupado) return 1;
        
        // Se mesmo status, ordenar por número do leito (crescente)
        return (a.leito || 0) - (b.leito || 0);
    });
    
    leitosOrdenados.forEach(leito => {
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

// ✅ CORREÇÃO 6: BADGE DE DIRETIVAS (TROCADO 'N/A' POR 'Não se aplica')
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
        texto: 'Não se aplica'
    };
}

// ⭐ CORREÇÃO V3.3: DETERMINAR TIPO REAL DO LEITO
function getTipoLeito(leito, hospitalId) {
    // ⭐ CORREÇÃO AGRESSIVA: Tentar TODOS os nomes possíveis
    const categoriaValue = leito.categoriaEscolhida || 
                          leito.categoria || 
                          leito.categoria_escolhida || 
                          leito.tipo_quarto ||
                          leito.tipoQuarto;
    
    const numeroLeito = parseInt(leito.leito);
    
    // ⭐ DEBUG FORÇADO - Sempre mostrar
    console.log('🔍 getTipoLeito DEBUG COMPLETO:', {
        hospital: hospitalId,
        leito: leito.leito,
        numeroLeito: numeroLeito,
        status: leito.status,
        isHibrido: window.HOSPITAIS_HIBRIDOS.includes(hospitalId),
        isSantaClara: hospitalId === 'H4',
        tipo_coluna_C: leito.tipo,
        '🎯 categoriaEscolhida': leito.categoriaEscolhida,
        '❓ categoria': leito.categoria,
        '❓ categoria_escolhida': leito.categoria_escolhida,
        '✅ categoriaValue_final': categoriaValue,
        'status_is_vago': leito.status === 'Vago' || leito.status === 'vago',
        'status_is_ocupado': leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado'
    });
    
    // ⭐ SANTA CLARA: TODOS os leitos são híbridos (1-13)
    if (hospitalId === 'H4') {
        const isVago = leito.status === 'Vago' || leito.status === 'vago';
        if (isVago) {
            return 'Híbrido';
        }
        // Se ocupado, usar categoria escolhida
        if (categoriaValue && categoriaValue.trim() !== '') {
            return categoriaValue;
        }
        return 'Apartamento'; // Fallback
    }
    
    // Para leitos VAGOS de hospitais híbridos, mostrar "Híbrido"
    const isVago = leito.status === 'Vago' || leito.status === 'vago';
    if (window.HOSPITAIS_HIBRIDOS.includes(hospitalId) && isVago) {
        return 'Híbrido';
    }
    
    // ⭐ Para leitos OCUPADOS de hospitais híbridos, usar categoria
    const isOcupado = leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado';
    if (window.HOSPITAIS_HIBRIDOS.includes(hospitalId) && isOcupado) {
        // Se tem categoria (qualquer variação), usar ela
        if (categoriaValue && categoriaValue.trim() !== '' && categoriaValue !== 'Híbrido') {
            console.log(`✅ getTipoLeito FINAL: ${hospitalId}-${leito.leito} → "${categoriaValue}" (categoria escolhida)`);
            return categoriaValue; // Retornar como está, formatarTipoTexto() vai formatar
        }
        
        // Fallback: usar coluna C se não tem categoria
        if (leito.tipo && leito.tipo !== 'Híbrido') {
            console.log(`⚠️ getTipoLeito FALLBACK coluna C: ${hospitalId}-${leito.leito} → "${leito.tipo}"`);
            return leito.tipo;
        }
        
        // Último fallback
        console.log(`⚠️ getTipoLeito FALLBACK padrão: ${hospitalId}-${leito.leito} → "Apartamento"`);
        return 'Apartamento';
    }
    
    // Para hospitais não-híbridos, retornar o tipo fixo
    const tipoFixo = leito.tipo || 'Apartamento';
    console.log(`✅ getTipoLeito FINAL (não-híbrido): ${hospitalId}-${leito.leito} → "${tipoFixo}"`);
    return tipoFixo;
}

// ⭐ FORMATAÇÃO DO TIPO (SEM EMOJI)
function formatarTipoTexto(tipo) {
    const tipoUpper = (tipo || '').toUpperCase().trim();
    
    switch(tipoUpper) {
        case 'APARTAMENTO':
        case 'APTO':
            return 'Apartamento';
        case 'ENFERMARIA':
        case 'ENF':
            return 'Enfermaria';
        case 'HÍBRIDO':
        case 'HIBRIDO':
            return 'Híbrido';
        default:
            // Capitalizar primeira letra
            return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
    }
}

// ⭐ NOVO V3.3: VALIDAÇÃO DE BLOQUEIO CRUZ AZUL
function validarAdmissaoCruzAzul(leitoNumero, generoNovo) {
    // Só valida enfermarias (21-36)
    if (window.currentHospital !== 'H2' || leitoNumero < 21 || leitoNumero > 36) {
        return { permitido: true };
    }
    
    // Encontrar leito irmão
    const leitoIrmao = window.CRUZ_AZUL_IRMAOS[leitoNumero];
    if (!leitoIrmao) {
        return { permitido: true }; // Se não tem irmão mapeado, permite
    }
    
    // Buscar dados do leito irmão
    const leitosHospital = window.hospitalData['H2']?.leitos || [];
    const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
    
    if (!dadosLeitoIrmao || dadosLeitoIrmao.status === 'Vago' || dadosLeitoIrmao.status === 'vago') {
        return { permitido: true }; // Leito irmão vago, permite
    }
    
    // REGRA 1: Se leito irmão tem isolamento, BLOQUEIA
    const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
    if (isolamentoIrmao && isolamentoIrmao !== 'Não Isolamento' && isolamentoIrmao !== '') {
        return {
            permitido: false,
            motivo: `Leito bloqueado! O leito ${window.CRUZ_AZUL_NUMERACAO[leitoIrmao]} está com isolamento: ${isolamentoIrmao}`,
            tipo: 'isolamento'
        };
    }
    
    // REGRA 2: Se leito irmão tem gênero diferente, BLOQUEIA
    const generoIrmao = dadosLeitoIrmao.genero || '';
    if (generoIrmao && generoNovo && generoIrmao !== generoNovo) {
        return {
            permitido: false,
            motivo: `Leito bloqueado! O leito ${window.CRUZ_AZUL_NUMERACAO[leitoIrmao]} está ocupado por paciente do gênero ${generoIrmao}`,
            tipo: 'genero'
        };
    }
    
    return { permitido: true };
}

// ⭐ NOVO V3.3: VALIDAÇÃO LIMITE SANTA CLARA
function validarLimiteSantaClara(tipoQuarto) {
    // Só valida se for Santa Clara e escolheu Enfermaria
    if (window.currentHospital !== 'H4' || tipoQuarto !== 'Enfermaria') {
        return { permitido: true };
    }
    
    // Contar TODAS as enfermarias ocupadas (qualquer leito 1-13)
    const leitosHospital = window.hospitalData['H4']?.leitos || [];
    let enfermariaCount = 0;
    
    leitosHospital.forEach(leito => {
        if ((leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') &&
            leito.categoriaEscolhida === 'Enfermaria') {
            enfermariaCount++;
        }
    });
    
    if (enfermariaCount >= 4) {
        return {
            permitido: false,
            motivo: 'Limite de enfermarias atingido! Santa Clara permite no máximo 4 enfermarias ocupadas simultaneamente.'
        };
    }
    
    return { permitido: true };
}

// =================== CRIAR CARD INDIVIDUAL V3.3 FINAL - LAYOUT MOCKUP ===================
function createCard(leito, hospitalNome) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: var(--card); border-radius: 12px; padding: 18px; color: var(--text-white); box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    // ⭐ VERIFICAR BLOQUEIO CRUZ AZUL
    let bloqueadoPorIsolamento = false;
    let bloqueadoPorGenero = false;
    let generoPermitido = null;
    let motivoBloqueio = '';
    
    const hospitalId = window.currentHospital;
    const numeroLeito = parseInt(leito.leito);
    const isCruzAzulEnfermaria = (hospitalId === 'H2' && numeroLeito >= 21 && numeroLeito <= 36);
    
    if (isCruzAzulEnfermaria && (leito.status === 'Vago' || leito.status === 'vago')) {
        // Verificar leito irmão
        const leitoIrmao = window.CRUZ_AZUL_IRMAOS[numeroLeito];
        if (leitoIrmao) {
            const leitosHospital = window.hospitalData['H2']?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Em uso' || dadosLeitoIrmao.status === 'ocupado')) {
                // Verificar isolamento
                const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
                if (isolamentoIrmao && isolamentoIrmao !== 'Não Isolamento') {
                    bloqueadoPorIsolamento = true;
                    motivoBloqueio = `Isolamento no ${window.CRUZ_AZUL_NUMERACAO[leitoIrmao]}`;
                } else if (dadosLeitoIrmao.genero) {
                    // Se não tem isolamento, verificar gênero
                    bloqueadoPorGenero = true;
                    generoPermitido = dadosLeitoIrmao.genero;
                }
            }
        }
    }
    
    // Determinar status
    let isVago = false;
    let statusBgColor = '#22c55e'; // VERDE PADRÃO
    let statusTextColor = '#000000';
    let statusTexto = 'Disponível';
    
    if (bloqueadoPorIsolamento) {
        // BLOQUEADO POR ISOLAMENTO
        statusBgColor = '#dc2626'; // VERMELHO
        statusTextColor = '#ffffff';
        statusTexto = 'BLOQUEADO';
    } else if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
        isVago = false;
        statusBgColor = '#fbbf24'; // AMARELO PARA OCUPADO
        statusTextColor = '#000000';
        statusTexto = 'Ocupado';
    } else if (leito.status === 'Vago' || leito.status === 'vago') {
        isVago = true;
        if (bloqueadoPorGenero) {
            statusTexto = `Disp. ${generoPermitido === 'Masculino' ? 'Masc' : 'Fem'}`;
        }
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
    // ⭐ CORREÇÃO: Normalizar isolamento para formato correto (case-insensitive)
    let isolamento = leito.isolamento || 'Não Isolamento';
    // Converter para lowercase primeiro para comparar
    const isolamentoLower = isolamento.toLowerCase().trim();
    
    if (isolamentoLower === 'isolamento de contato' || isolamentoLower === 'isolamento contato') {
        isolamento = 'Isolamento de Contato';
    } else if (isolamentoLower === 'isolamento respiratório' || isolamentoLower === 'isolamento respiratorio') {
        isolamento = 'Isolamento Respiratório';
    } else if (isolamentoLower === 'não isolamento' || isolamentoLower === 'nao isolamento' || isolamentoLower.includes('não isol')) {
        isolamento = 'Não Isolamento';
    }
    // ⭐ CORREÇÃO V3.3: Numeração fixa para Cruz Azul enfermarias (leitos 21-36)
    let identificacaoLeito = '';
    // numeroLeito e isCruzAzulEnfermaria já foram declarados anteriormente
    
    if (isCruzAzulEnfermaria && window.CRUZ_AZUL_NUMERACAO[numeroLeito]) {
        // ✅ HARDCODED - Usar numeração fixa do mapeamento
        identificacaoLeito = window.CRUZ_AZUL_NUMERACAO[numeroLeito];
    } else {
        // ✅ Outros hospitais - Buscar da planilha normalmente
        identificacaoLeito = leito.identificacaoLeito || leito.identificacao_leito || '';
    }
    const regiao = leito.regiao || '';
    const sexo = leito.genero || ''; // ✅ CORRIGIDO: leito.genero (não leito.sexo)
    const diretivas = leito.diretivas || 'Não se aplica'; // ⭐ NOVO V3.3
    
    // ⭐ CORREÇÃO 1: Usar tipo real do leito (coluna C da planilha)
    // hospitalId já foi declarado anteriormente
    
    // ⭐ CORREÇÃO CRÍTICA AGRESSIVA: Garantir que categoria seja copiada
    // Tentar TODOS os nomes possíveis
    if (!leito.categoriaEscolhida) {
        leito.categoriaEscolhida = leito.categoria || 
                                   leito.categoria_escolhida || 
                                   leito.tipo_quarto ||
                                   leito.tipoQuarto;
    }
    
    // ⭐ DEBUG CRÍTICO - Sempre logar
    console.log('🔍 ANTES getTipoLeito:', {
        hospital: hospitalId,
        leito: leito.leito,
        status: leito.status,
        'leito.categoria': leito.categoria,
        'leito.categoriaEscolhida': leito.categoriaEscolhida,
        'leito.categoria_escolhida': leito.categoria_escolhida
    });
    
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
    
    // ID sequencial e leito personalizado
    const idSequencial = String(numeroLeito).padStart(2, '0');
    
    // ⭐ NOVO: Para Cruz Azul enfermarias, usar identificação fixa como display principal
    let leitoDisplay = identificacaoLeito && identificacaoLeito.trim() 
        ? identificacaoLeito.trim().toUpperCase()
        : `LEITO ${numeroLeito}`;
    
    // ⭐ Se for Cruz Azul enfermaria (21-36), já está com numeração fixa do mapeamento
    if (isCruzAzulEnfermaria && identificacaoLeito) {
        leitoDisplay = identificacaoLeito; // Já vem em maiúscula do mapeamento
    }
    
    // COR DO CÍRCULO PESSOA
    let circuloCor = '#C1FF72'; // VERDE (vago)
    let circuloStroke = '#7A9B4D';
    
    // ⭐ CRUZ AZUL: Se bloqueado por gênero, mostrar cor do gênero permitido
    if (isVago && bloqueadoPorGenero && generoPermitido) {
        if (generoPermitido === 'Masculino') {
            circuloCor = '#38BDF8'; // AZUL
            circuloStroke = '#0369A1';
        } else if (generoPermitido === 'Feminino') {
            circuloCor = '#EC4899'; // ROSA
            circuloStroke = '#9333EA';
        }
    } else if (!isVago) {
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
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${leitoDisplay}</div>
            </div>
            
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">TIPO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${formatarTipoTexto(tipoReal)}</div>
            </div>
            
            <div class="status-badge" style="background: ${statusBgColor}; color: ${statusTextColor}; padding: 12px 6px; border-radius: 6px; font-weight: 800; text-transform: uppercase; text-align: center; font-size: 11px; letter-spacing: 0.5px; min-height: 45px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div class="box-label" style="font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; color: ${statusTextColor};">STATUS</div>
                <div class="box-value" style="font-weight: 700; font-size: 11px; line-height: 1.2; color: ${statusTextColor};">${statusTexto}</div>
                ${motivoBloqueio ? `<div style="font-size: 8px; margin-top: 2px; color: ${statusTextColor};">${motivoBloqueio}</div>` : ''}
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
            
            <button class="btn-action" 
                    data-action="${isVago ? 'admitir' : 'atualizar'}" 
                    data-leito="${numeroLeito}" 
                    ${bloqueadoPorIsolamento ? 'disabled' : ''}
                    style="padding: 10px 18px; 
                           background: ${bloqueadoPorIsolamento ? '#6b7280' : (isVago ? '#C1FF72' : '#374151')}; 
                           color: ${isVago && !bloqueadoPorIsolamento ? '#000000' : '#ffffff'}; 
                           border: none; 
                           border-radius: 6px; 
                           cursor: ${bloqueadoPorIsolamento ? 'not-allowed' : 'pointer'}; 
                           font-weight: 800; 
                           text-transform: uppercase; 
                           font-size: 11px; 
                           transition: all 0.2s ease; 
                           letter-spacing: 0.5px; 
                           white-space: nowrap; 
                           flex-shrink: 0;
                           opacity: ${bloqueadoPorIsolamento ? '0.5' : '1'};">
                ${bloqueadoPorIsolamento ? 'BLOQUEADO' : (isVago ? 'ADMITIR' : 'ATUALIZAR')}
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
    modal.innerHTML = createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito);
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
    const isSantaClara = hospitalId === 'H4'; // TODO Santa Clara é híbrido
    const mostrarTipoQuarto = isHibrido || isSantaClara;
    
    // ⭐ CORREÇÃO V3.3: Verificar se é Cruz Azul Enfermaria (leitos 21-36)
    const isCruzAzulEnfermaria = (hospitalId === 'H2' && leitoNumero >= 21 && leitoNumero <= 36);
    
    // ⭐ VERIFICAR BLOQUEIO POR GÊNERO
    let generoPreDefinido = null;
    let generoDisabled = false;
    
    if (isCruzAzulEnfermaria) {
        const leitoIrmao = window.CRUZ_AZUL_IRMAOS[leitoNumero];
        if (leitoIrmao) {
            const leitosHospital = window.hospitalData['H2']?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Em uso' || dadosLeitoIrmao.status === 'ocupado')) {
                const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
                if (!isolamentoIrmao || isolamentoIrmao === 'Não Isolamento') {
                    // Só bloqueia gênero se NÃO tem isolamento
                    if (dadosLeitoIrmao.genero) {
                        generoPreDefinido = dadosLeitoIrmao.genero;
                        generoDisabled = true;
                    }
                }
            }
        }
    }
    
    // ⭐ Apartamentos fixos: apenas Cruz Azul (H2: 1-20)
    const isCruzAzulApartamento = (hospitalId === 'H2' && leitoNumero >= 1 && leitoNumero <= 20);
    const isApartamentoFixo = isCruzAzulApartamento;
    
    // ⭐ Santa Clara (H4): sem tipo fixo, opera com LIMITE de 4 enfermarias
    
    // ✅ Se for Cruz Azul enfermaria, usar numeração HARDCODED
    let identificacaoFixa = '';
    if (isCruzAzulEnfermaria) {
        identificacaoFixa = window.CRUZ_AZUL_NUMERACAO[leitoNumero] || '';
    }
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ADMITIR PACIENTE
            </h2>
            
            <!-- ⭐ CORREÇÃO 2: HEADER EM UMA LINHA -->
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <div style="margin-bottom: 8px;">
                    <strong>Hospital:</strong> ${hospitalNome} | <strong>ID:</strong> ${idSequencial} | <strong>Leito:</strong> ${leitoNumero}${isHibrido ? ' | <strong>LEITO HÍBRIDO</strong>' : ''}
                </div>
            </div>
            
            <!-- ✅ LINHA 1 REORGANIZADA: IDENTIFICAÇÃO | TIPO QUARTO | ISOLAMENTO -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: ${(isHibrido || isCruzAzulEnfermaria || isApartamentoFixo || hospitalId === 'H4') ? '1fr 1fr 1fr' : '1fr 1fr'}; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px; white-space: nowrap;">IDENTIFICAÇÃO DO LEITO <span style="color: #ef4444;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<input id="admIdentificacaoLeito" type="text" value="${identificacaoFixa}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed;">
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Numeração fixa (Cruz Azul - Enfermaria)</div>`
                            : `<input id="admIdentificacaoLeito" type="text" placeholder="Ex: 21 ou 711.1" maxlength="6" required style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">`
                        }
                    </div>
                    
                    <!-- ⭐ TIPO DE QUARTO -->
                    ${(isHibrido || isCruzAzulEnfermaria || isApartamentoFixo || hospitalId === 'H4') ? `
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">TIPO DE QUARTO <span style="color: #ef4444;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<select id="admTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed;">
                                <option value="Enfermaria" selected>Enfermaria</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Tipo fixo (Enfermaria)</div>`
                            : isApartamentoFixo
                            ? `<select id="admTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed;">
                                <option value="Apartamento" selected>Apartamento</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Tipo fixo (Apartamento)</div>`
                            : `<select id="admTipoQuarto" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                                <option value="">Selecionar...</option>
                                ${window.TIPO_QUARTO_OPTIONS.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                               </select>`
                        }
                    </div>
                    ` : ''}
                    
                    <!-- ISOLAMENTO -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">ISOLAMENTO <span style="color: #ef4444;">*</span></label>
                        <select id="admIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecione...</option>
                            ${window.ISOLAMENTO_OPTIONS.map(opcao => `<option value="${opcao}">${opcao}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- ✅ LINHA 2 REORGANIZADA: GÊNERO | REGIÃO | PREVISÃO ALTA -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">GÊNERO <span style="color: #ef4444;">*</span></label>
                        <select id="admSexo" required ${generoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${generoDisabled ? '#1f2937' : '#374151'} !important; color: ${generoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            ${generoPreDefinido 
                                ? `<option value="${generoPreDefinido}" selected>${generoPreDefinido}</option>`
                                : `<option value="">Selecionar...</option>
                                   ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}">${sexo}</option>`).join('')}`
                            }
                        </select>
                        ${generoDisabled ? '<div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Gênero definido pelo leito irmão</div>' : ''}
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">REGIÃO <span style="color: #ef4444;">*</span></label>
                        <select id="admRegiao" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecionar...</option>
                            ${window.REGIAO_OPTIONS.map(regiao => `<option value="${regiao}">${regiao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREVISÃO ALTA</label>
                        <select id="admPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 3: INICIAIS, MATRÍCULA, IDADE: 3 COLUNAS -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">INICIAIS</label>
                    <input id="admNome" type="text" placeholder="Ex: J S M" maxlength="10" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">MATRÍCULA</label>
                    <input id="admMatricula" type="text" placeholder="Ex: 0000000000" maxlength="10" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;" oninput="formatarMatricula(this)">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">IDADE</label>
                    <select id="admIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        <option value="">Selecionar...</option>
                        ${window.IDADE_OPTIONS.map(idade => `<option value="${idade}">${idade} anos</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- ✅ LINHA 4 REORGANIZADA: PPS | SPICT-BR | DIRETIVAS -->
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
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">DIRETIVAS</label>
                    <select id="admDiretivas" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        ${window.DIRETIVAS_OPTIONS.map((opcao, index) => `<option value="${opcao}" ${index === 0 ? 'selected' : ''}>${opcao}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- CONCESSÕES: 12 ITENS -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA (${window.CONCESSOES_LIST.length} opções)
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
            
            <!-- LINHAS DE CUIDADO: 45 ESPECIALIDADES -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHAS DE CUIDADO PREVISTAS NA ALTA (${window.LINHAS_CUIDADO_LIST.length} especialidades)
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
            
            <!-- BOTÕES -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
            </div>
        </div>
    `;
}

// =================== FORMULÁRIO DE ATUALIZAÇÃO V3.3 FINAL ===================
function createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito) {
    const tempoInternacao = dadosLeito?.admAt ? calcularTempoInternacao(dadosLeito.admAt) : '';
    const iniciais = dadosLeito?.nome ? getIniciais(dadosLeito.nome) : '';
    const idSequencial = String(leitoNumero).padStart(2, '0');
    const leitoPersonalizado = (dadosLeito?.identificacaoLeito && dadosLeito.identificacaoLeito.trim()) 
        ? dadosLeito.identificacaoLeito.trim().toUpperCase()
        : `LEITO ${leitoNumero}`;
    
    const concessoesAtuais = Array.isArray(dadosLeito?.concessoes) ? dadosLeito.concessoes : [];
    const linhasAtuais = Array.isArray(dadosLeito?.linhas) ? dadosLeito.linhas : [];
    
    // ⭐ CORREÇÃO: Normalizar isolamento para formato correto (case-insensitive)
    let isolamentoAtual = dadosLeito?.isolamento || 'Não Isolamento';
    const isolamentoLower = isolamentoAtual.toLowerCase().trim();
    
    if (isolamentoLower === 'isolamento de contato' || isolamentoLower === 'isolamento contato') {
        isolamentoAtual = 'Isolamento de Contato';
    } else if (isolamentoLower === 'isolamento respiratório' || isolamentoLower === 'isolamento respiratorio') {
        isolamentoAtual = 'Isolamento Respiratório';
    } else if (isolamentoLower === 'não isolamento' || isolamentoLower === 'nao isolamento' || isolamentoLower.includes('não isol')) {
        isolamentoAtual = 'Não Isolamento';
    }
    
    // ⭐ CORREÇÃO: Verificar tipos de leito fixos
    const hospitalId = window.currentHospital;
    const isCruzAzulEnfermaria = (hospitalId === 'H2' && leitoNumero >= 21 && leitoNumero <= 36);
    const isCruzAzulApartamento = (hospitalId === 'H2' && leitoNumero >= 1 && leitoNumero <= 20);
    const isApartamentoFixo = isCruzAzulApartamento;
    
    // ⭐ Santa Clara (H4): sem tipo fixo, mas TEM limite de 4 enfermarias
    
    // ✅ Se Cruz Azul enfermaria, usar numeração do mapeamento hardcoded
    let identificacaoAtual = '';
    if (isCruzAzulEnfermaria) {
        identificacaoAtual = window.CRUZ_AZUL_NUMERACAO[leitoNumero] || '';
    } else {
        identificacaoAtual = dadosLeito?.identificacaoLeito || dadosLeito?.identificacao_leito || '';
    }
    
    const regiaoAtual = dadosLeito?.regiao || '';
    const sexoAtual = dadosLeito?.genero || ''; // ⭐ CORRIGIDO: era .sexo
    const diretivasAtual = dadosLeito?.diretivas || 'Não se aplica';
    const admissaoData = dadosLeito?.admAt || '';
    
    // Verificar se o leito é híbrido
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    const tipoAtual = dadosLeito?.categoriaEscolhida || ''; // ⭐ CORRIGIDO: era .tipo
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                ATUALIZAR PACIENTE
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>ID:</strong> ${idSequencial} | <strong>Leito:</strong> ${leitoPersonalizado}
            </div>
            
            <!-- ✅ LINHA 1 REORGANIZADA: IDENTIFICAÇÃO | TIPO QUARTO | ISOLAMENTO -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: ${(isHibrido || isCruzAzulEnfermaria || isApartamentoFixo || hospitalId === 'H4') ? '1fr 1fr 1fr' : '1fr 1fr'}; gap: 15px;">
                    <!-- IDENTIFICAÇÃO DO LEITO -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; white-space: nowrap;">IDENTIFICAÇÃO DO LEITO <span style="color: #ef4444;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<input id="updIdentificacaoLeito" type="text" value="${identificacaoAtual}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed;">`
                            : `<input id="updIdentificacaoLeito" type="text" value="${identificacaoAtual}" placeholder="Ex: 21 ou 711.1" maxlength="6" required style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">`
                        }
                        ${isCruzAzulEnfermaria ? '<div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Identificação fixa</div>' : ''}
                    </div>
                    
                    <!-- ⭐ TIPO DE QUARTO -->
                    ${(isHibrido || isCruzAzulEnfermaria || isApartamentoFixo || hospitalId === 'H4') ? `
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">TIPO DE QUARTO <span style="color: #ef4444;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<select id="updTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed;">
                                <option value="Enfermaria" selected>Enfermaria</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Tipo fixo (Enfermaria)</div>`
                            : isApartamentoFixo
                            ? `<select id="updTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed;">
                                <option value="Apartamento" selected>Apartamento</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">🔒 Tipo fixo (Apartamento)</div>`
                            : `<select id="updTipoQuarto" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                                <option value="">Selecionar...</option>
                                ${window.TIPO_QUARTO_OPTIONS.map(tipo => `<option value="${tipo}" ${tipoAtual === tipo ? 'selected' : ''}>${tipo}</option>`).join('')}
                               </select>`
                        }
                    </div>
                    ` : ''}
                    
                    <!-- ISOLAMENTO -->
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">ISOLAMENTO <span style="color: #ef4444;">*</span></label>
                        <select id="updIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            ${window.ISOLAMENTO_OPTIONS.map(opcao => `<option value="${opcao}" ${isolamentoAtual === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- ✅ LINHA 2 REORGANIZADA: GÊNERO | REGIÃO | PREVISÃO ALTA -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">GÊNERO <span style="color: #ef4444;">*</span></label>
                        <select id="updSexo" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            <option value="">Selecionar...</option>
                            ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}" ${sexoAtual === sexo ? 'selected' : ''}>${sexo}</option>`).join('')}
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
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PREVISÃO ALTA</label>
                        <select id="updPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                            ${window.PREVISAO_ALTA_OPTIONS.map(opt => {
                                const previsaoAtual = (dadosLeito?.prevAlta || '').trim();
                                const isSelected = previsaoAtual === opt || 
                                                  (previsaoAtual === 'SP' && opt === 'Sem Previsão') ||
                                                  (previsaoAtual === 'Sem Previsão' && opt === 'Sem Previsão');
                                return `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 3: INICIAIS, MATRÍCULA, IDADE: 3 COLUNAS -->
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
            
            <!-- ✅ LINHA 4 REORGANIZADA: PPS | SPICT-BR | DIRETIVAS -->
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
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">DIRETIVAS</label>
                    <select id="updDiretivas" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">
                        ${window.DIRETIVAS_OPTIONS.map(opcao => `<option value="${opcao}" ${diretivasAtual === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- CONCESSÕES -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        CONCESSÕES PREVISTAS NA ALTA (${window.CONCESSOES_LIST.length} opções)
                    </div>
                </div>
                <div id="updConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => {
                        const isChecked = concessoesAtuais.includes(c);
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                                <input type="checkbox" value="${c}" ${isChecked ? 'checked' : ''} style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${c}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- LINHAS DE CUIDADO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.1); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        LINHAS DE CUIDADO PREVISTAS NA ALTA (${window.LINHAS_CUIDADO_LIST.length} especialidades)
                    </div>
                </div>
                <div id="updLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(l => {
                        const isChecked = linhasAtuais.includes(l);
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px;">
                                <input type="checkbox" value="${l}" ${isChecked ? 'checked' : ''} style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${l}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- ⭐ CORREÇÃO 3: BOTÕES COM INFO DE ADMISSÃO E TEMPO -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-alta" style="padding: 12px 30px; background: #ef4444; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">ALTA</button>
                
                <!-- INFO ADMISSÃO E TEMPO -->
                <div style="text-align: center; font-size: 10px; color: rgba(255,255,255,0.5);">
                    ${admissaoData ? `<div>ADMISSÃO: ${formatarDataHora(admissaoData)}</div>` : ''}
                    ${tempoInternacao ? `<div>INTERNADO: ${tempoInternacao}</div>` : ''}
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">CANCELAR</button>
                    <button class="btn-salvar" style="padding: 12px 30px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer;">SALVAR</button>
                </div>
            </div>
        </div>
    `;
}

// =================== PRÉ-MARCAÇÃO DE CHECKBOXES ===================
function forcarPreMarcacao(modal, dadosLeito) {
    logDebug(`Forçando pré-marcação V3.3 FINAL...`);
    
    const concessoesAtuais = Array.isArray(dadosLeito?.concessoes) ? dadosLeito.concessoes : [];
    const linhasAtuais = Array.isArray(dadosLeito?.linhas) ? dadosLeito.linhas : [];
    
    // Marcar concessões
    const concessoesCheckboxes = modal.querySelectorAll('#updConcessoes input[type="checkbox"]');
    const naoSeAplicaCheckbox = Array.from(concessoesCheckboxes)
        .find(cb => cb.value === 'Não se aplica');
    
    concessoesCheckboxes.forEach(checkbox => {
        if (checkbox.value === 'Não se aplica') {
            // Marcar "Não se aplica" apenas se não há outras concessões
            checkbox.checked = concessoesAtuais.length === 0;
        } else if (concessoesAtuais.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
    
    // Marcar linhas de cuidado
    const linhasCheckboxes = modal.querySelectorAll('#updLinhas input[type="checkbox"]');
    linhasCheckboxes.forEach(checkbox => {
        if (linhasAtuais.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
    
    logDebug(`Pré-marcação concluída`);
}

// ⭐ NOVO V3.3.2: LÓGICA "NÃO SE APLICA" PARA CONCESSÕES
function setupConcessoesLogic(modal, concessoesId) {
    const container = modal.querySelector(`#${concessoesId}`);
    if (!container) return;
    
    const naoSeAplicaCheckbox = Array.from(container.querySelectorAll('input[type="checkbox"]'))
        .find(cb => cb.value === 'Não se aplica');
    
    if (!naoSeAplicaCheckbox) return;
    
    const outrasCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'))
        .filter(cb => cb.value !== 'Não se aplica');
    
    // Evento: "Não se aplica" marcado
    naoSeAplicaCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // Desmarcar todas as outras
            outrasCheckboxes.forEach(cb => cb.checked = false);
        }
    });
    
    // Evento: Qualquer outra marcada
    outrasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Desmarcar "Não se aplica"
                naoSeAplicaCheckbox.checked = false;
            } else {
                // Se nenhuma estiver marcada, marcar "Não se aplica"
                const algumaOutraMarcada = outrasCheckboxes.some(cb => cb.checked);
                if (!algumaOutraMarcada) {
                    naoSeAplicaCheckbox.checked = true;
                }
            }
        });
    });
    
    // Estado inicial: se nenhuma marcada, marcar "Não se aplica"
    const algumaOutraMarcada = outrasCheckboxes.some(cb => cb.checked);
    if (!algumaOutraMarcada) {
        naoSeAplicaCheckbox.checked = true;
    }
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
        });
    }
    
    // Botão Salvar
    const btnSalvar = modal.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // VALIDAÇÕES
            const identificacaoField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoLeito' : '#updIdentificacaoLeito');
            if (!identificacaoField.value.trim()) {
                showErrorMessage('❌ Campo "Identificação do Leito" é obrigatório!');
                identificacaoField.focus();
                return;
            }
            
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
                showErrorMessage('❌ Campo "Gênero" é obrigatório!');
                sexoField.focus();
                return;
            }
            
            // ⭐ VALIDAÇÃO: Tipo de Quarto obrigatório para híbridos
            const hospitalId = window.currentHospital;
            const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
            const leitoNumero = parseInt(modal.querySelector('h3')?.textContent?.match(/\d+/)?.[0] || 0);
            const isSantaClara = hospitalId === 'H4';
            
            if (isHibrido || isSantaClara) {
                const tipoQuartoField = modal.querySelector(tipo === 'admissao' ? '#admTipoQuarto' : '#updTipoQuarto');
                if (tipoQuartoField && !tipoQuartoField.disabled && !tipoQuartoField.value) {
                    showErrorMessage('❌ Campo "Tipo de Quarto" é obrigatório para hospitais híbridos!');
                    tipoQuartoField.focus();
                    return;
                }
            }
            
            // ⭐ NOVO V3.3: VALIDAÇÃO CRUZ AZUL - BLOQUEIO LEITOS IRMÃOS
            if (tipo === 'admissao' && hospitalId === 'H2') {
                const generoNovo = sexoField.value;
                const validacaoCruz = validarAdmissaoCruzAzul(leitoNumero, generoNovo);
                
                if (!validacaoCruz.permitido) {
                    showErrorMessage('❌ ' + validacaoCruz.motivo);
                    return;
                }
            }
            
            // ⭐ NOVO V3.3: VALIDAÇÃO SANTA CLARA - LIMITE 4 ENFERMARIAS
            if (tipo === 'admissao' && hospitalId === 'H4') {
                const tipoQuartoField = modal.querySelector('#admTipoQuarto');
                const tipoEscolhido = tipoQuartoField?.value;
                const validacaoSanta = validarLimiteSantaClara(tipoEscolhido);
                
                if (!validacaoSanta.permitido) {
                    showErrorMessage('❌ ' + validacaoSanta.motivo);
                    return;
                }
            }
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'SALVANDO...');
            
            try {
                const dadosFormulario = coletarDadosFormulario(modal, tipo);
                
                // ⭐ VALIDAÇÃO SANTA CLARA NA ATUALIZAÇÃO
                if ((tipo === 'atualizacao' || tipo === 'atualizar') && hospitalId === 'H4') {
                    const tipoQuartoField = modal.querySelector('#updTipoQuarto');
                    const tipoAtual = dadosFormulario.categoriaEscolhida || tipoQuartoField?.value;
                    const tipoAnterior = window.selectedLeito?.categoriaEscolhida || window.selectedLeito?.categoria;
                    
                    // Se está mudando PARA enfermaria
                    if (tipoAtual === 'Enfermaria' && tipoAnterior !== 'Enfermaria') {
                        const validacaoSanta = validarLimiteSantaClara(tipoAtual);
                        if (!validacaoSanta.permitido) {
                            showErrorMessage('❌ ' + validacaoSanta.motivo);
                            hideButtonLoading(this, originalText);
                            return;
                        }
                    }
                }
                
                if (tipo === 'admissao') {
                    await window.admitirPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Paciente admitido com sucesso (V3.3 + DIRETIVAS)!');
                } else {
                    await window.atualizarPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('✅ Dados atualizados com sucesso (V3.3 + DIRETIVAS)!');
                }
                
                hideButtonLoading(this, originalText);
                closeModal(modal);
                
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao salvar: ' + error.message);
                logError('Erro ao salvar:', error);
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
                showSuccessMessage('✅ Alta processada!');
                closeModal(modal);
                
                await window.refreshAfterAction();
                
            } catch (error) {
                hideButtonLoading(this, originalText);
                showErrorMessage('❌ Erro ao processar alta: ' + error.message);
                logError('Erro alta:', error);
            }
        });
    }
    
    // Fechar clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // ⭐ NOVO V3.3.2: Configurar lógica "Não se aplica"
    if (tipo === 'admissao') {
        setupConcessoesLogic(modal, 'admConcessoes');
    } else {
        setupConcessoesLogic(modal, 'updConcessoes');
    }
}

// =================== CLOSE MODAL ===================
function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            window.selectedLeito = null;
        }, 300);
    }
}

// =================== COLETAR DADOS DO FORMULÁRIO V3.3 ===================
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
        dados.prevAlta = modal.querySelector('#admPrevAlta')?.value || 'Sem Previsão';
        dados.isolamento = modal.querySelector('#admIsolamento')?.value || '';
        dados.identificacaoLeito = modal.querySelector('#admIdentificacaoLeito')?.value?.trim().toUpperCase() || '';
        dados.regiao = modal.querySelector('#admRegiao')?.value || '';
        dados.genero = modal.querySelector('#admSexo')?.value || '';
        dados.diretivas = modal.querySelector('#admDiretivas')?.value || 'Não se aplica'; // ⭐ NOVO V3.3
        
        // Tipo de quarto para híbridos
        const tipoQuartoField = modal.querySelector('#admTipoQuarto');
        if (tipoQuartoField) {
            dados.categoriaEscolhida = tipoQuartoField.value || '';
        }
        
        dados.concessoes = coletarCheckboxesSelecionados(modal, '#admConcessoes');
        dados.linhas = coletarCheckboxesSelecionados(modal, '#admLinhas');
        
    } else {
        dados.idade = parseInt(modal.querySelector('#updIdade')?.value) || null;
        dados.pps = modal.querySelector('#updPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#updSPICT')?.value || 'nao_elegivel';
        dados.prevAlta = modal.querySelector('#updPrevAlta')?.value || 'Sem Previsão';
        dados.isolamento = modal.querySelector('#updIsolamento')?.value || '';
        dados.identificacaoLeito = modal.querySelector('#updIdentificacaoLeito')?.value?.trim().toUpperCase() || '';
        dados.regiao = modal.querySelector('#updRegiao')?.value || '';
        dados.genero = modal.querySelector('#updSexo')?.value || '';
        dados.diretivas = modal.querySelector('#updDiretivas')?.value || 'Não se aplica'; // ⭐ NOVO V3.3
        
        // ⭐ NOVO: Tipo de quarto para híbridos no ATUALIZAR
        const tipoQuartoField = modal.querySelector('#updTipoQuarto');
        if (tipoQuartoField) {
            dados.categoriaEscolhida = tipoQuartoField.value || '';
        }
        
        dados.concessoes = coletarCheckboxesSelecionados(modal, '#updConcessoes');
        dados.linhas = coletarCheckboxesSelecionados(modal, '#updLinhas');
    }
    
    logInfo('Dados V3.3 FINAL coletados (COM DIRETIVAS):', {
        isolamento: dados.isolamento,
        identificacaoLeito: dados.identificacaoLeito,
        regiao: dados.regiao,
        genero: dados.genero,
        diretivas: dados.diretivas, // ⭐ NOVO
        categoriaEscolhida: dados.categoriaEscolhida || 'N/A',
        concessoes: dados.concessoes.length,
        linhas: dados.linhas.length
    });
    
    return dados;
}

// =================== COLETAR CHECKBOXES SELECIONADOS ===================
function coletarCheckboxesSelecionados(modal, seletor) {
    const checkboxes = modal.querySelectorAll(`${seletor} input[type="checkbox"]`);
    const selecionados = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.value !== 'Não se aplica') {
            selecionados.push(checkbox.value);
        }
    });
    
    return selecionados;
}

// =================== VALIDAR LIMITE ENFERMARIAS SANTA CLARA ===================
function validarLimiteEnfermarias(hospitalId, tipoQuarto) {
    // Só valida se for Santa Clara tentando admitir Enfermaria
    if (hospitalId !== 'H4' || tipoQuarto !== 'Enfermaria') {
        return { valido: true };
    }
    
    // Contar enfermarias ocupadas no Santa Clara
    const santaClara = window.hospitalData?.H4;
    if (!santaClara || !santaClara.leitos) {
        return { valido: true };
    }
    
    let enfermariasOcupadas = 0;
    santaClara.leitos.forEach(leito => {
        const statusOcupado = leito.status === 'Em uso' || leito.status === 'Ocupado' || leito.status === 'ocupado';
        const tipoEnfermaria = leito.tipo === 'Enfermaria';
        
        if (statusOcupado && tipoEnfermaria) {
            enfermariasOcupadas++;
        }
    });
    
    logInfo(`Santa Clara: ${enfermariasOcupadas} enfermarias ocupadas (limite: 4)`);
    
    if (enfermariasOcupadas >= 4) {
        return {
            valido: false,
            mensagem: `❌ LIMITE ATINGIDO!\n\nO Santa Clara já possui 4 enfermarias ocupadas (máximo permitido).\n\nAguarde uma alta ou admita como Apartamento.`
        };
    }
    
    return { valido: true };
}

// ✅ CORREÇÃO 3: FORMATAÇÃO AUTOMÁTICA MATRÍCULA (10 DÍGITOS SEM HÍFEN)
function formatarMatricula(input) {
    let valor = input.value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    if (valor.length > 10) {
        valor = valor.substring(0, 10);
    }
    
    // Não formatar com hífen, apenas números
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
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #16a34a;
        color: white; padding: 15px 20px; border-radius: 8px; font-weight: 500;
        z-index: 10000; animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #dc2626;
        color: white; padding: 15px 20px; border-radius: 8px; font-weight: 500;
        z-index: 10000; animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

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
    console.log(`🔵 [CARDS V3.3.2 FINAL] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`🔴 [CARDS V3.3.2 FINAL ERROR] ${message}`, error || '');
}

function logSuccess(message) {
    console.log(`🟢 [CARDS V3.3.2 FINAL SUCCESS] ${message}`);
}

function logDebug(message, data = null) {
    console.log(`🟡 [CARDS V3.3.2 FINAL DEBUG] ${message}`, data || '');
}

// =================== CSS CONSOLIDADO COMPLETO V3.3 FINAL ===================
if (!document.getElementById('cardsConsolidadoCSS')) {
    const style = document.createElement('style');
    style.id = 'cardsConsolidadoCSS';
    style.textContent = `
        /* =================== ANIMAÇÕES =================== */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        /* =================== DESKTOP =================== */
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
    logSuccess('✅ CARDS.JS V3.3.2 FINAL CARREGADO COM TODAS AS CORREÇÕES');
    
    // Verificar listas
    if (window.CONCESSOES_LIST.length !== 12) {
        logError(`ERRO: Esperadas 12 concessões, encontradas ${window.CONCESSOES_LIST.length}`);
    } else {
        logSuccess(`✅ ${window.CONCESSOES_LIST.length} concessões confirmadas (COM "Não se aplica")`);
    }
    
    if (window.LINHAS_CUIDADO_LIST.length !== 45) {
        logError(`ERRO: Esperadas 45 linhas, encontradas ${window.LINHAS_CUIDADO_LIST.length}`);
    } else {
        logSuccess(`✅ ${window.LINHAS_CUIDADO_LIST.length} linhas de cuidado confirmadas`);
    }
    
    if (window.REGIAO_OPTIONS.length !== 9) {
        logError(`ERRO: Esperadas 9 regiões, encontradas ${window.REGIAO_OPTIONS.length}`);
    } else {
        logSuccess(`✅ ${window.REGIAO_OPTIONS.length} regiões confirmadas`);
    }
    
    if (window.SEXO_OPTIONS.length !== 2) {
        logError(`ERRO: Esperadas 2 opções sexo, encontradas ${window.SEXO_OPTIONS.length}`);
    } else {
        logSuccess(`✅ ${window.SEXO_OPTIONS.length} opções de gênero confirmadas (por extenso)`);
    }
    
    if (window.DIRETIVAS_OPTIONS.length !== 3) {
        logError(`ERRO: Esperadas 3 opções diretivas, encontradas ${window.DIRETIVAS_OPTIONS.length}`);
    } else {
        logSuccess(`✅ ${window.DIRETIVAS_OPTIONS.length} opções de diretivas confirmadas (NOVO V3.3)`);
    }
    
    logInfo('🚀 CORREÇÕES APLICADAS V3.3.2:');
    logInfo('  • ✅ CORREÇÃO 19: Reorganização do modal (4 linhas)');
    logInfo('  • ✅ CORREÇÃO 20: Ordenação dos cards (ocupados → vagos)');
    logInfo('  • ✅ CORREÇÃO 21: Campo identificação aceita 1-6 caracteres');
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

logSuccess('🎉 CARDS.JS V3.3.2 COMPLETO E CORRIGIDO!');
logInfo('📋 RESUMO DAS CORREÇÕES V3.3.2:');
logInfo('  • ✅ CORREÇÃO 19: Modal reorganizado (IDENTIFICAÇÃO | TIPO | ISOLAMENTO / GÊNERO | REGIÃO | PREV ALTA / INICIAIS | MATRÍCULA | IDADE / PPS | SPICT | DIRETIVAS)');
logInfo('  • ✅ CORREÇÃO 20: Cards ordenados (primeiro ocupados crescente, depois vagos crescente)');
logInfo('  • ✅ CORREÇÃO 21: Campo identificação aceita de 1 a 6 caracteres alfanuméricos');
console.log('✅ CARDS.JS V3.3.2 FINAL CARREGADO COM TODAS AS CORREÇÕES!');
