// =================== CARDS-CONFIG.JS - CONFIGURAÇÕES GLOBAIS ===================
// Versão: 2.2 - CORRIGIDO
// Descrição: Fonte única de verdade para mapas, funções e configurações
// ✅ CORREÇÃO V2.2: REMOVIDO window.CRUZ_AZUL_NUMERACAO (usar sempre coluna AQ)

console.log('🔵 CARDS-CONFIG.JS v2.2 - Iniciando carregamento...');

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

// =================== ✅ CONFIGURAÇÕES DE HOSPITAIS ===================
window.HOSPITAL_MAPPING = {
    H1: 'Neomater',
    H2: 'Cruz Azul',
    H3: 'Santa Marcelina',
    H4: 'Santa Clara',
    H5: 'Adventista',
    H6: 'Santa Cruz',
    H7: 'Santa Virgínia'
};

window.ORDEM_ALFABETICA_HOSPITAIS = ['H5', 'H2', 'H1', 'H4', 'H3', 'H6', 'H7'];
window.HOSPITAIS_HIBRIDOS = ['H1', 'H3', 'H5', 'H6', 'H7'];

window.SANTA_CLARA_TOTAL_LEITOS = 13;
window.SANTA_CLARA_LIMITE_APTOS = 9;
window.SANTA_CLARA_LIMITE_ENFS = 4;

// =================== ✅ MAPEAMENTO CRUZ AZUL - LEITOS IRMÃOS ===================
// Sistema de leitos irmãos para enfermarias (21-36)
// Compartilham o mesmo quarto, restrições por isolamento/gênero
window.CRUZ_AZUL_IRMAOS = {
    21: 22, 22: 21, 23: 24, 24: 23,
    25: 26, 26: 25, 27: 28, 28: 27,
    29: 30, 30: 29, 31: 32, 32: 31,
    33: 34, 34: 33, 35: 36, 36: 35
};

console.log('✅ CRUZ_AZUL_IRMAOS carregado:', Object.keys(window.CRUZ_AZUL_IRMAOS).length / 2, 'pares');

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

// =================== ✅ LOG FINAL ===================
console.log('✅ CARDS-CONFIG.JS v2.2 - Carregado com sucesso!');
console.log('✅ Concessões:', window.CONCESSOES_LIST.length, 'itens');
console.log('✅ Linhas:', window.LINHAS_CUIDADO_LIST.length, 'itens');
console.log('✅ Hospitais:', Object.keys(window.HOSPITAL_MAPPING).length);
console.log('✅ Cruz Azul Irmãos:', Object.keys(window.CRUZ_AZUL_IRMAOS).length / 2, 'pares');
console.log('✅ SEMPRE usar coluna AQ (identificacaoLeito)');
console.log('✅ PRONTO para uso!');
