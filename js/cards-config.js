// =================== CARDS-CONFIG.JS V7.0 - CONFIGURAÇÕES GLOBAIS ===================
// Versão: 7.0 - SISTEMA COMPLETO COM UTI E RESERVAS
// Descrição: Fonte única de verdade para mapas, funções e configurações
// ✅ NOVIDADE V7.0: Sistema de UTI (63 leitos em 8 hospitais)
// ✅ NOVIDADE V7.0: Sistema de Reservas
// ✅ NOVIDADE V7.0: Campos bloqueados para UTI
// ✅ NOVIDADE V7.0: H7 Santa Virgínia sem UTI
// ✅ MANTIDO V6.1: Cruz Azul - 13 pares de irmãos (8 contratuais + 5 extras)
// ✅ MANTIDO V6.1: Santa Clara - 9 pares de irmãos (4 contratuais + 5 extras)
// ✅ MANTIDO V6.0: Sistema de leitos extras dinâmico

console.log('🔵 CARDS-CONFIG.JS v7.0 - Iniciando carregamento...');

// =================== ✅ MAPAS DE DISPLAY (COM ACENTOS UTF-8) ===================
window.CONCESSOES_DISPLAY_MAP = {
    "Transicao Domiciliar": "Transição Domiciliar",
    "Aplicacao domiciliar de medicamentos": "Aplicação domiciliar de medicamentos",
    "Aspiracao": "Aspiração",
    "Banho": "Banho",
    "Curativo": "Curativo",
    "Curativo PICC": "Curativo PICC",
    "Fisioterapia Motora Domiciliar": "Fisioterapia Motora Domiciliar",
    "Fonoaudiologia Domiciliar": "Fonoaudiologia Domiciliar",
    "Oxigenoterapia": "Oxigenoterapia",
    "Remocao": "Remoção",
    "Solicitacao domiciliar de exames": "Solicitação domiciliar de exames",
    "Fisioterapia Respiratoria Domiciliar": "Fisioterapia Respiratória Domiciliar"
};

window.LINHAS_DISPLAY_MAP = {
    "Assiste": "Assiste",
    "APS SP": "APS SP",
    "Cuidados Paliativos": "Cuidados Paliativos",
    "ICO (Insuficiencia Coronariana)": "ICO (Insuficiência Coronariana)",
    "Nexus SP Cardiologia": "Nexus SP Cardiologia",
    "Nexus SP Gastroentereologia": "Nexus SP Gastroentereologia",
    "Nexus SP Geriatria": "Nexus SP Geriatria",
    "Nexus SP Pneumologia": "Nexus SP Pneumologia",
    "Nexus SP Psiquiatria": "Nexus SP Psiquiatria",
    "Nexus SP Reumatologia": "Nexus SP Reumatologia",
    "Nexus SP Saude do Figado": "Nexus SP Saúde do Fígado",
    "Generalista": "Generalista",
    "Bucomaxilofacial": "Bucomaxilofacial",
    "Cardiologia": "Cardiologia",
    "Cirurgia Cardiaca": "Cirurgia Cardíaca",
    "Cirurgia de Cabeca e Pescoco": "Cirurgia de Cabeça e Pescoço",
    "Cirurgia do Aparelho Digestivo": "Cirurgia do Aparelho Digestivo",
    "Cirurgia Geral": "Cirurgia Geral",
    "Cirurgia Oncologica": "Cirurgia Oncológica",
    "Cirurgia Plastica": "Cirurgia Plástica",
    "Cirurgia Toracica": "Cirurgia Torácica",
    "Cirurgia Vascular": "Cirurgia Vascular",
    "Clinica Medica": "Clínica Médica",
    "Coloproctologia": "Coloproctologia",
    "Dermatologia": "Dermatologia",
    "Endocrinologia": "Endocrinologia",
    "Fisiatria": "Fisiatria",
    "Gastroenterologia": "Gastroenterologia",
    "Geriatria": "Geriatria",
    "Ginecologia e Obstetricia": "Ginecologia e Obstetrícia",
    "Hematologia": "Hematologia",
    "Infectologia": "Infectologia",
    "Mastologia": "Mastologia",
    "Nefrologia": "Nefrologia",
    "Neurocirurgia": "Neurocirurgia",
    "Neurologia": "Neurologia",
    "Oftalmologia": "Oftalmologia",
    "Oncologia Clinica": "Oncologia Clínica",
    "Ortopedia": "Ortopedia",
    "Otorrinolaringologia": "Otorrinolaringologia",
    "Pediatria": "Pediatria",
    "Pneumologia": "Pneumologia",
    "Psiquiatria": "Psiquiatria",
    "Reumatologia": "Reumatologia",
    "Urologia": "Urologia"
};

// =================== ✅ FUNÇÕES DE NORMALIZAÇÃO ===================
window.normalizarTexto = function(texto) {
    if (!texto || typeof texto !== 'string') return texto;
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C');
};

window.desnormalizarTexto = function(texto) {
    if (!texto || typeof texto !== 'string') return texto;
    
    if (window.CONCESSOES_DISPLAY_MAP[texto]) {
        return window.CONCESSOES_DISPLAY_MAP[texto];
    }
    
    if (window.LINHAS_DISPLAY_MAP[texto]) {
        return window.LINHAS_DISPLAY_MAP[texto];
    }
    
    return texto;
};

// =================== ✅ CONFIGURAÇÕES DE HOSPITAIS - ENFERMARIA ===================
window.HOSPITAL_MAPPING = {
    H1: { nome: 'Neomater', leitos: 25, tipo: 'hibrido_puro' },
    H2: { nome: 'Cruz Azul', leitos: 67, tipo: 'tipos_fixos' },
    H3: { nome: 'Santa Marcelina', leitos: 28, tipo: 'hibrido_puro' },
    H4: { nome: 'Santa Clara', leitos: 57, tipo: 'tipos_fixos' },
    H5: { nome: 'Adventista', leitos: 28, tipo: 'hibrido_puro' },
    H6: { nome: 'Santa Cruz', leitos: 22, tipo: 'hibrido_puro' },
    H7: { nome: 'Santa Virgínia', leitos: 22, tipo: 'hibrido_puro' },
    H8: { nome: 'São Camilo Ipiranga', leitos: 22, tipo: 'hibrido_puro' },
    H9: { nome: 'São Camilo Pompeia', leitos: 22, tipo: 'hibrido_puro' }
    // H10 e H11 existem no backend mas não aparecem no frontend (reservas desabilitadas)
};

// =================== ✅ SISTEMA DE LEITOS EXTRAS - ENFERMARIA ===================
window.HOSPITAL_CAPACIDADE = {
    H1: { contratuais: 10, extras: 15, total: 25 },
    H2: { contratuais: 36, extras: 31, total: 67 },
    H3: { contratuais: 13, extras: 15, total: 28 },
    H4: { contratuais: 26, extras: 31, total: 57 },
    H5: { contratuais: 13, extras: 15, total: 28 },
    H6: { contratuais: 13, extras: 9, total: 22 },   // ✅ CORRIGIDO 03/DEZ/2025
    H7: { contratuais: 13, extras: 9, total: 22 },   // ✅ CORRIGIDO 03/DEZ/2025
    H8: { contratuais: 13, extras: 9, total: 22 },   // ✅ CORRIGIDO 11/JAN/2026
    H9: { contratuais: 13, extras: 9, total: 22 }    // ✅ CORRIGIDO 11/JAN/2026
};

// =================== ✅ NOVO V7.0: SISTEMA DE UTI (63 LEITOS) ===================
window.UTI_CAPACIDADE = {
    H1: { contratuais: 3, extras: 2, total: 5 },
    H2: { contratuais: 20, extras: 10, total: 30 },
    H3: { contratuais: 2, extras: 2, total: 4 },
    H4: { contratuais: 4, extras: 2, total: 6 },
    H5: { contratuais: 4, extras: 2, total: 6 },
    H6: { contratuais: 2, extras: 2, total: 4 },
    H7: { contratuais: 0, extras: 0, total: 0 },     // ✅ SEM UTI
    H8: { contratuais: 2, extras: 2, total: 4 },
    H9: { contratuais: 2, extras: 2, total: 4 }
};

console.log('✅ UTI_CAPACIDADE carregado: 63 leitos em 8 hospitais (H7 sem UTI)');

// =================== ✅ NOVO V7.0: HOSPITAIS SEM UTI ===================
window.HOSPITAIS_SEM_UTI = ['H7'];

// =================== ✅ NOVO V7.0: CAMPOS BLOQUEADOS PARA UTI ===================
// Estes campos não se aplicam a leitos UTI
window.CAMPOS_BLOQUEADOS_UTI = [
    'pps',
    'spict',
    'complexidade',
    'diretivas',
    'categoriaEscolhida'
];

// =================== ✅ NOVO V7.0: PREVISÃO DE ALTA UTI ===================
window.PREVISAO_ALTA_UTI = [
    'Alta para Enfermaria',
    'Alta Domiciliar',
    'Transferência Externa',
    'Sem Previsão'
];

// =================== ✅ NOVO V7.0: STATUS DE RESERVA ===================
window.STATUS_RESERVA = 'Reservado';
window.COR_RESERVADO = '#fbbf24';  // Amarelo
window.COR_BORDA_RESERVADO = '#f59e0b';

// =================== ✅ ORDEM ALFABÉTICA (9 HOSPITAIS ATIVOS) ===================
window.ORDEM_ALFABETICA_HOSPITAIS = ['H5', 'H2', 'H1', 'H4', 'H6', 'H3', 'H7', 'H8', 'H9'];

// =================== ✅ TIPOS DE HOSPITAL ===================
window.HOSPITAIS_HIBRIDOS = ['H1', 'H3', 'H5', 'H6', 'H7', 'H8', 'H9'];
window.HOSPITAIS_TIPOS_FIXOS = ['H2', 'H4'];

// =================== ✅ CRUZ AZUL - LEITOS IRMÃOS (13 PARES) ===================
// 8 pares contratuais (21-36) + 5 pares extras (37-46)
window.CRUZ_AZUL_IRMAOS = {
    // PARES CONTRATUAIS (8 pares - leitos 21-36)
    21: 22, 22: 21, // Par 1
    23: 24, 24: 23, // Par 2
    25: 26, 26: 25, // Par 3
    27: 28, 28: 27, // Par 4
    29: 30, 30: 29, // Par 5
    31: 32, 32: 31, // Par 6
    33: 34, 34: 33, // Par 7
    35: 36, 36: 35, // Par 8
    
    // PARES EXTRAS (5 pares - leitos 37-46)
    37: 38, 38: 37, // Par 9
    39: 40, 40: 39, // Par 10
    41: 42, 42: 41, // Par 11
    43: 44, 44: 43, // Par 12
    45: 46, 46: 45  // Par 13
};

console.log('✅ CRUZ_AZUL_IRMAOS carregado:', Object.keys(window.CRUZ_AZUL_IRMAOS).length / 2, 'pares (8 contratuais + 5 extras)');

// =================== ✅ SANTA CLARA - LEITOS IRMÃOS (9 PARES) ===================
// 4 pares contratuais (10-17) + 5 pares extras (18-27)
window.SANTA_CLARA_IRMAOS = {
    // PARES CONTRATUAIS (4 pares - leitos 10-17)
    10: 11, 11: 10, // Par 1
    12: 13, 13: 12, // Par 2
    14: 15, 15: 14, // Par 3
    16: 17, 17: 16, // Par 4
    
    // PARES EXTRAS (5 pares - leitos 18-27)
    18: 19, 19: 18, // Par 5
    20: 21, 21: 20, // Par 6
    22: 23, 23: 22, // Par 7
    24: 25, 25: 24, // Par 8
    26: 27, 27: 26  // Par 9
};

console.log('✅ SANTA_CLARA_IRMAOS carregado:', Object.keys(window.SANTA_CLARA_IRMAOS).length / 2, 'pares (4 contratuais + 5 extras)');

// =================== ✅ ESTRUTURA DE ENFERMARIAS POR HOSPITAL ===================
// Cruz Azul: 26 enfermarias (16 contratuais + 10 extras)
window.CRUZ_AZUL_ENFERMARIAS = {
    contratuais: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], // 16 leitos
    extras: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46], // 10 leitos
    apartamentos: 35 // 20 contratuais + 15 extras
};

// Santa Clara: 18 enfermarias (8 contratuais + 10 extras)
window.SANTA_CLARA_ENFERMARIAS = {
    contratuais: [10, 11, 12, 13, 14, 15, 16, 17], // 8 leitos
    extras: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27], // 10 leitos
    apartamentos: 33 // 18 contratuais + 15 extras
};

console.log('✅ Cruz Azul: 26 enfermarias (16 contratuais + 10 extras)');
console.log('✅ Santa Clara: 18 enfermarias (8 contratuais + 10 extras)');

// =================== ✅ SUFIXOS POR HOSPITAL ===================
window.CRUZ_AZUL_SUFIXOS = {
    impar: '1', // Leitos ímpares (21, 23, 25, ...)
    par: '3'    // Leitos pares (22, 24, 26, ...)
};

window.SANTA_CLARA_SUFIXOS = {
    impar: 'A', // Leitos ímpares (10, 12, 14, ...)
    par: 'C'    // Leitos pares (11, 13, 15, ...)
};

// =================== ✅ LISTAS DE OPÇÕES ===================
window.TIPO_QUARTO_OPTIONS = ['Apartamento', 'Enfermaria'];

window.CONCESSOES_LIST = [
    "Não se aplica",
    "Transição Domiciliar",
    "Aplicação domiciliar de medicamentos",
    "Aspiração",
    "Banho",
    "Curativo",
    "Curativo PICC",
    "Fisioterapia Motora Domiciliar",
    "Fonoaudiologia Domiciliar",
    "Oxigenoterapia",
    "Remoção",
    "Solicitação domiciliar de exames",
    "Fisioterapia Respiratória Domiciliar"
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

window.PPS_OPTIONS = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

window.PREVISAO_ALTA_OPTIONS = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R',
    '48h', '72h', '96h', 'Sem Previsão'
];

window.ISOLAMENTO_OPTIONS = [
    'Não Isolamento',
    'Isolamento de Contato',
    'Isolamento Respiratório'
];

window.REGIAO_OPTIONS = [
    'Zona Central', 'Zona Sul', 'Zona Norte', 'Zona Leste', 'Zona Oeste',
    'ABC', 'Guarulhos', 'Osasco', 'Outra'
];

window.SEXO_OPTIONS = ['Masculino', 'Feminino'];
window.DIRETIVAS_OPTIONS = ['Não se aplica', 'Sim', 'Não'];

window.IDADE_OPTIONS = [];
for (let i = 14; i <= 115; i++) {
    window.IDADE_OPTIONS.push(i);
}

// =================== ✅ VARIÁVEIS GLOBAIS ===================
window.selectedLeito = null;
window.currentHospital = 'H1';
window.fundoBranco = false;

// =================== ✅ FUNÇÕES AUXILIARES ===================
window.getHospitalNome = function(hospitalId) {
    return window.HOSPITAL_MAPPING[hospitalId]?.nome || hospitalId;
};

window.getHospitalTipo = function(hospitalId) {
    return window.HOSPITAL_MAPPING[hospitalId]?.tipo || 'hibrido_puro';
};

window.isHospitalHibrido = function(hospitalId) {
    return window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
};

window.isHospitalTiposFixos = function(hospitalId) {
    return window.HOSPITAIS_TIPOS_FIXOS.includes(hospitalId);
};

window.getCapacidade = function(hospitalId) {
    return window.HOSPITAL_CAPACIDADE[hospitalId] || { contratuais: 0, extras: 0, total: 0 };
};

window.getLeitoIrmao = function(hospitalId, leitoNum) {
    if (hospitalId === 'H2') {
        return window.CRUZ_AZUL_IRMAOS[leitoNum] || null;
    }
    if (hospitalId === 'H4') {
        return window.SANTA_CLARA_IRMAOS[leitoNum] || null;
    }
    return null;
};

// =================== ✅ VERIFICAÇÃO DE ENFERMARIA COM IRMÃO ===================
window.isEnfermariaComIrmao = function(hospitalId, leitoNum) {
    if (hospitalId === 'H2') {
        return window.CRUZ_AZUL_IRMAOS.hasOwnProperty(leitoNum);
    }
    if (hospitalId === 'H4') {
        return window.SANTA_CLARA_IRMAOS.hasOwnProperty(leitoNum);
    }
    return false;
};

// =================== ✅ OBTER SUFIXO DO LEITO ===================
window.getSufixoLeito = function(hospitalId, leitoNum) {
    if (hospitalId === 'H2') {
        return (leitoNum % 2 === 0) ? window.CRUZ_AZUL_SUFIXOS.par : window.CRUZ_AZUL_SUFIXOS.impar;
    }
    if (hospitalId === 'H4') {
        return (leitoNum % 2 === 0) ? window.SANTA_CLARA_SUFIXOS.par : window.SANTA_CLARA_SUFIXOS.impar;
    }
    return '';
};

// =================== ✅ OBTER OPÇÕES DE SUFIXO ===================
window.getSufixoOptions = function(hospitalId) {
    if (hospitalId === 'H2') {
        return [window.CRUZ_AZUL_SUFIXOS.impar, window.CRUZ_AZUL_SUFIXOS.par];
    }
    if (hospitalId === 'H4') {
        return [window.SANTA_CLARA_SUFIXOS.impar, window.SANTA_CLARA_SUFIXOS.par];
    }
    return [];
};

// =================== ✅ CÁLCULO DE LEITOS EXTRAS - ENFERMARIA ===================
window.calcularLeitosExtras = function(hospitalId, leitosOcupados) {
    const capacidade = window.getCapacidade(hospitalId);
    
    if (!capacidade || capacidade.contratuais === 0) {
        return { contratuais: 0, extras: 0 };
    }
    
    const ocupadosNum = Array.isArray(leitosOcupados) ? leitosOcupados.length : leitosOcupados;
    
    if (ocupadosNum <= capacidade.contratuais) {
        return {
            contratuais: ocupadosNum,
            extras: 0
        };
    } else {
        return {
            contratuais: capacidade.contratuais,
            extras: ocupadosNum - capacidade.contratuais
        };
    }
};

// =================== ✅ VALIDAÇÃO DE LEITO EXTRA ===================
window.isLeitoExtra = function(hospitalId, posicaoOcupacao) {
    const capacidade = window.getCapacidade(hospitalId);
    return posicaoOcupacao > capacidade.contratuais;
};

// =================== ✅ NOVO V7.0: FUNÇÕES UTI ===================

/**
 * Retorna capacidade UTI de um hospital
 */
window.getCapacidadeUTI = function(hospitalId) {
    return window.UTI_CAPACIDADE[hospitalId] || { contratuais: 0, extras: 0, total: 0 };
};

/**
 * Verifica se hospital tem UTI
 */
window.hospitalTemUTI = function(hospitalId) {
    const capacidade = window.UTI_CAPACIDADE[hospitalId];
    return capacidade && capacidade.total > 0;
};

/**
 * Verifica se um campo está bloqueado para UTI
 */
window.isCampoBloqueadoUTI = function(campo) {
    return window.CAMPOS_BLOQUEADOS_UTI.includes(campo);
};

/**
 * Verifica se leito é UTI
 */
window.isLeitoUTI = function(leito) {
    return leito && leito.tipo === 'UTI';
};

/**
 * Calcula leitos extras de UTI
 */
window.calcularLeitosExtrasUTI = function(hospitalId, leitosOcupados) {
    const capacidade = window.getCapacidadeUTI(hospitalId);
    
    if (!capacidade || capacidade.contratuais === 0) {
        return { contratuais: 0, extras: 0 };
    }
    
    const ocupadosNum = Array.isArray(leitosOcupados) ? leitosOcupados.length : leitosOcupados;
    
    if (ocupadosNum <= capacidade.contratuais) {
        return {
            contratuais: ocupadosNum,
            extras: 0
        };
    } else {
        return {
            contratuais: capacidade.contratuais,
            extras: ocupadosNum - capacidade.contratuais
        };
    }
};

/**
 * Retorna opções de previsão de alta baseado no tipo de leito
 */
window.getPrevisaoAltaOptions = function(isUTI) {
    return isUTI ? window.PREVISAO_ALTA_UTI : window.PREVISAO_ALTA_OPTIONS;
};

// =================== ✅ NOVO V7.0: FUNÇÕES DE TOTAIS ===================

/**
 * Calcula totais de enfermaria (9 hospitais ativos)
 */
window.getTotaisEnfermaria = function() {
    let total = 0, contratuais = 0, extras = 0;
    
    Object.values(window.HOSPITAL_CAPACIDADE).forEach(function(h) {
        total += h.total;
        contratuais += h.contratuais;
        extras += h.extras;
    });
    
    return { total, contratuais, extras };
};

/**
 * Calcula totais de UTI (8 hospitais com UTI)
 */
window.getTotaisUTI = function() {
    let total = 0, contratuais = 0, extras = 0;
    
    Object.values(window.UTI_CAPACIDADE).forEach(function(h) {
        total += h.total;
        contratuais += h.contratuais;
        extras += h.extras;
    });
    
    return { total, contratuais, extras };
};

/**
 * Calcula totais gerais (Enfermaria + UTI)
 */
window.getTotaisGerais = function() {
    const enf = window.getTotaisEnfermaria();
    const uti = window.getTotaisUTI();
    
    return {
        total: enf.total + uti.total,
        contratuais: enf.contratuais + uti.contratuais,
        extras: enf.extras + uti.extras
    };
};

// =================== ✅ CORES LEITOS ===================
window.COR_FLAG_CONTRATUAL = '#60a5fa';
window.COR_FLAG_EXTRA = '#f59a1d';
window.COR_BORDA_EXTRA = '#f59a1d';

// =================== ✅ LOG FINAL ===================
const totaisEnf = window.getTotaisEnfermaria();
const totaisUTI = window.getTotaisUTI();
const totaisGerais = window.getTotaisGerais();

console.log('═══════════════════════════════════════════════════');
console.log('✅ CARDS-CONFIG.JS v7.0 - Carregado com sucesso!');
console.log('═══════════════════════════════════════════════════');
console.log('🏥 ENFERMARIA:', totaisEnf.total, 'leitos (' + totaisEnf.contratuais + ' contr. + ' + totaisEnf.extras + ' extras)');
console.log('🏥 UTI:', totaisUTI.total, 'leitos (' + totaisUTI.contratuais + ' contr. + ' + totaisUTI.extras + ' extras)');
console.log('🏥 TOTAL GERAL:', totaisGerais.total, 'leitos');
console.log('───────────────────────────────────────────────────');
console.log('✅ Hospitais ativos:', Object.keys(window.HOSPITAL_MAPPING).length);
console.log('✅ Hospitais com UTI:', Object.keys(window.UTI_CAPACIDADE).filter(h => window.UTI_CAPACIDADE[h].total > 0).length);
console.log('✅ H7 Santa Virgínia: SEM UTI');
console.log('✅ Cruz Azul: 13 pares de irmãos');
console.log('✅ Santa Clara: 9 pares de irmãos');
console.log('✅ Campos bloqueados UTI:', window.CAMPOS_BLOQUEADOS_UTI.length);
console.log('═══════════════════════════════════════════════════');
console.log('✅ PRONTO para uso!');
