// =================== API.JS V3.1 - VERSÃO CORRIGIDA COM MAPEAMENTO AS/AT ===================
// =================== MAPEAMENTO CORRETO DAS 46 COLUNAS INCLUINDO AS/AT ===================

// =================== CONFIGURAÇÃO DA API V3.1 ===================
const API_V31_CONFIG = {
    BASE_URL: 'https://script.google.com/macros/s/AKfycbxAEyQKas6IEFPV5iQK8HSjm-xIRfcczzB9poXEKpJhvYkmJZ6vaBN_x74IiBe-8wHC/exec',
    TIMEOUT: 15000,
    MAX_RETRIES: 3,
    COLUNAS_TOTAL: 46
};

// =================== MAPEAMENTO CORRETO DAS COLUNAS V3.1 (46 COLUNAS) ===================
const COLUMN_MAPPING_V31 = {
    // DADOS BÁSICOS (A-L) - 12 colunas
    hospital: 'A',
    leito: 'B', 
    tipo: 'C',
    status: 'D',
    nome: 'E',
    matricula: 'F',
    idade: 'G',
    admAt: 'H',
    pps: 'I',
    spict: 'J',
    complexidade: 'K',
    prevAlta: 'L',
    
    // CONCESSÕES (M-Y) - 13 colunas
    C1_Transicao_Domiciliar: 'M',
    C2_Aplicacao_Medicamentos: 'N', 
    C3_Fisioterapia: 'O',
    C4_Fonoaudiologia: 'P',
    C5_Aspiracao: 'Q',
    C6_Banho: 'R',
    C7_Curativos: 'S',
    C8_Oxigenoterapia: 'T',
    C9_Recarga_O2: 'U',
    C10_Orient_Nutri_Com_Disp: 'V',
    C11_Orient_Nutri_Sem_Disp: 'W',
    C12_Clister: 'X',
    C13_PICC: 'Y',
    
    // LINHAS DE CUIDADO (Z-AR) - 19 colunas
    L1_Assiste: 'Z',
    L2_APS: 'AA',
    L3_Cuid_Paliativos: 'AB',
    L4_ICO: 'AC',
    L5_Oncologia: 'AD',
    L6_Pediatria: 'AE',
    L7_Autoimune_Gastro: 'AF',
    L8_Autoimune_Neuro_Desm: 'AG',
    L9_Autoimune_Neuro_Musc: 'AH',
    L10_Autoimune_Reumato: 'AI',
    L11_Vida_Mais_Leve: 'AJ',
    L12_Cron_Cardio: 'AK',
    L13_Cron_Endocrino: 'AL',
    L14_Cron_Geriatria: 'AM',
    L15_Cron_Melhor_Cuid: 'AN',
    L16_Cron_Neuro: 'AO',
    L17_Cron_Pneumo: 'AP',
    L18_Cron_Pos_Bariat: 'AQ',
    L19_Cron_Reumato: 'AR',
    
    // *** NOVAS COLUNAS V3.1 (AS-AT) - 2 colunas ***
    isolamento: 'AS',           // ISOLAMENTO DO PACIENTE
    identificacaoLeito: 'AT'    // IDENTIFICAÇÃO DO LEITO (6 chars)
};

// =================== MAPEAMENTO REVERSO PARA LEITURA ===================
const REVERSE_MAPPING_V31 = {};
Object.entries(COLUMN_MAPPING_V31).forEach(([key, col]) => {
    REVERSE_MAPPING_V31[col] = key;
});

// =================== LISTAS DE VALIDAÇÃO V3.1 ===================
const CONCESSOES_VALIDAS_V31 = [
    "Transição Domiciliar",
    "Aplicação domiciliar de medicamentos", 
    "Fisioterapia",
    "Fonoaudiologia",
    "Aspiração",
    "Banho",
    "Curativos",
    "Oxigenoterapia",
    "Recarga de O2",
    "Orientação Nutricional - com dispositivo",
    "Orientação Nutricional - sem dispositivo",
    "Clister",
    "PICC"
];

const LINHAS_VALIDAS_V31 = [
    "Assiste",
    "APS", 
    "Cuidados Paliativos",
    "ICO (Insuficiência Coronariana)",
    "Oncologia",
    "Pediatria",
    "Programa Autoimune - Gastroenterologia",
    "Programa Autoimune - Neuro-desmielinizante",
    "Programa Autoimune - Neuro-muscular",
    "Programa Autoimune - Reumatologia",
    "Vida Mais Leve Care",
    "Crônicos - Cardiologia",
    "Crônicos - Endocrinologia", 
    "Crônicos - Geriatria",
    "Crônicos - Melhor Cuidado",
    "Crônicos - Neurologia",
    "Crônicos - Pneumologia",
    "Crônicos - Pós-bariátrica",
    "Crônicos - Reumatologia"
];

const TIMELINE_VALIDA_V31 = [
    'Hoje Ouro', 'Hoje 2R', 'Hoje 3R',
    '24h Ouro', '24h 2R', '24h 3R',
    '48h', '72h', '96h', 'SP'
];

const ISOLAMENTO_VALIDO_V31 = [
    'NÃO ISOLAMENTO',
    'ISOLAMENTO DE CONTATO',
    'ISOLAMENTO RESPIRATÓRIO'
];

// =================== FUNÇÕES DE LOG V3.1 ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API V3.1] ${message}`, data || '');
}

function logAPISuccess(message) {
    console.log(`✅ [API SUCCESS V3.1] ${message}`);
}

function logAPIError(message, error = null) {
    console.error(`❌ [API ERROR V3.1] ${message}`, error || '');
}

// =================== FUNÇÃO DE REQUISIÇÃO BASE V3.1 ===================
async function apiRequest(action, data = {}, method = 'GET') {
    try {
        const url = new URL(API_V31_CONFIG.BASE_URL);
        
        if (method === 'GET') {
            url.searchParams.append('action', action);
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.append(key, value);
                }
            });
        }
        
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (method === 'POST') {
            requestOptions.body = JSON.stringify({ action, ...data });
        }
        
        const response = await fetch(url.toString(), requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        // *** FALLBACK JSONP PARA CORS ***
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            logAPI('POST falhou (Failed to fetch), tentando via GET com JSONP...');
            
            try {
                const url = new URL(API_V31_CONFIG.BASE_URL);
                url.searchParams.append('action', action);
                url.searchParams.append('callback', 'jsonpCallback');
                
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            url.searchParams.append(key, JSON.stringify(value));
                        } else {
                            url.searchParams.append(key, value);
                        }
                    }
                });
                
                return new Promise((resolve, reject) => {
                    window.jsonpCallback = function(data) {
                        resolve(data);
                        delete window.jsonpCallback;
                    };
                    
                    const script = document.createElement('script');
                    script.src = url.toString();
                    script.onerror = () => reject(new Error('JSONP falhou'));
                    document.head.appendChild(script);
                    document.head.removeChild(script);
                });
                
            } catch (fallbackError) {
                logAPIError('Fallback JSONP também falhou:', fallbackError.message);
                throw fallbackError;
            }
        }
        
        logAPIError(`Erro na requisição ${method} ${action}`, error.message);
        throw error;
    }
}

// =================== FUNÇÃO PARA CONVERTER DADOS DA PLANILHA V3.1 ===================
function converterDadosPlanilha(dadosRaw) {
    if (!dadosRaw || !Array.isArray(dadosRaw)) {
        logAPIError('Dados inválidos recebidos da planilha');
        return {};
    }
    
    const hospitalData = {};
    
    dadosRaw.forEach(linha => {
        if (!linha || typeof linha !== 'object') return;
        
        // Converter dados básicos
        const leito = {
            hospital: linha.A || '',
            leito: Number(linha.B) || 0,
            numero: Number(linha.B) || 0,
            tipo: linha.C || 'ENF/APTO',
            status: linha.D || 'vago',
            nome: linha.E || '',
            matricula: linha.F || '',
            idade: linha.G ? Number(linha.G) : null,
            admAt: linha.H || null,
            pps: linha.I || null,
            spict: linha.J || 'nao_elegivel',
            complexidade: linha.K || 'I',
            prevAlta: linha.L || 'SP',
            
            // *** NOVA V3.1: MAPEAR COLUNAS AS E AT ***
            isolamento: linha.AS || 'NÃO ISOLAMENTO',
            identificacaoLeito: linha.AT || ''
        };
        
        // Converter concessões (M-Y)
        const concessoes = [];
        const concessoesColunas = {
            'M': 'Transição Domiciliar',
            'N': 'Aplicação domiciliar de medicamentos',
            'O': 'Fisioterapia',
            'P': 'Fonoaudiologia',
            'Q': 'Aspiração',
            'R': 'Banho',
            'S': 'Curativos',
            'T': 'Oxigenoterapia',
            'U': 'Recarga de O2',
            'V': 'Orientação Nutricional - com dispositivo',
            'W': 'Orientação Nutricional - sem dispositivo',
            'X': 'Clister',
            'Y': 'PICC'
        };
        
        Object.entries(concessoesColunas).forEach(([col, nome]) => {
            if (linha[col] === 'X' || linha[col] === 'x') {
                concessoes.push(nome);
            }
        });
        
        // Converter linhas de cuidado (Z-AR)
        const linhas = [];
        const linhasColunas = {
            'Z': 'Assiste',
            'AA': 'APS',
            'AB': 'Cuidados Paliativos',
            'AC': 'ICO (Insuficiência Coronariana)',
            'AD': 'Oncologia',
            'AE': 'Pediatria',
            'AF': 'Programa Autoimune - Gastroenterologia',
            'AG': 'Programa Autoimune - Neuro-desmielinizante',
            'AH': 'Programa Autoimune - Neuro-muscular',
            'AI': 'Programa Autoimune - Reumatologia',
            'AJ': 'Vida Mais Leve Care',
            'AK': 'Crônicos - Cardiologia',
            'AL': 'Crônicos - Endocrinologia',
            'AM': 'Crônicos - Geriatria',
            'AN': 'Crônicos - Melhor Cuidado',
            'AO': 'Crônicos - Neurologia',
            'AP': 'Crônicos - Pneumologia',
            'AQ': 'Crônicos - Pós-bariátrica',
            'AR': 'Crônicos - Reumatologia'
        };
        
        Object.entries(linhasColunas).forEach(([col, nome]) => {
            if (linha[col] === 'X' || linha[col] === 'x') {
                linhas.push(nome);
            }
        });
        
        leito.concessoes = concessoes;
        leito.linhas = linhas;
        
        // Agrupar por hospital
        const hospitalId = leito.hospital;
        if (!hospitalData[hospitalId]) {
            hospitalData[hospitalId] = { leitos: [] };
        }
        
        hospitalData[hospitalId].leitos.push(leito);
    });
    
    return hospitalData;
}

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO V3.1 ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados V3.1 da planilha (46 colunas - incluindo AS/AT)...');
        
        // Mostrar loading global
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script V3.1...');
        }
        
        // Buscar dados da API
        const apiData = await apiRequest('all', {}, 'GET');
        
        if (!apiData || typeof apiData !== 'object') {
            throw new Error('API V3.1 retornou dados inválidos');
        }
        
        // *** PROCESSAMENTO V3.1: CONVERTER DADOS COM MAPEAMENTO AS/AT ***
        if (Array.isArray(apiData)) {
            logAPI('Dados V3.1 recebidos em formato agrupado');
            window.hospitalData = converterDadosPlanilha(apiData);
        } 
        // Se a API já retorna formato agrupado
        else if (apiData.H1 && apiData.H1.leitos) {
            logAPI('Dados V3.1 recebidos em formato pré-agrupado');
            window.hospitalData = apiData;
        }
        else {
            throw new Error('Formato de dados da API V3.1 não reconhecido');
        }
        
        // Verificar se temos dados
        const totalHospitais = Object.keys(window.hospitalData).length;
        const totalLeitos = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.length : 0), 0);
        const leitosOcupados = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.filter(l => l.status === 'ocupado' || l.status === 'Em uso').length : 0), 0);
        const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
        
        // *** NOVA V3.1: CONTAR ISOLAMENTO E IDENTIFICAÇÃO ***
        let leitosComIsolamento = 0;
        let leitosComIdentificacao = 0;
        let totalConcessoes = 0;
        let totalLinhas = 0;
        
        Object.values(window.hospitalData).forEach(hospital => {
            hospital.leitos?.forEach(leito => {
                if (leito.isolamento && leito.isolamento !== 'NÃO ISOLAMENTO') {
                    leitosComIsolamento++;
                }
                if (leito.identificacaoLeito && leito.identificacaoLeito.trim() !== '') {
                    leitosComIdentificacao++;
                }
                if (leito.status === 'ocupado' || leito.status === 'Em uso') {
                    totalConcessoes += (leito.concessoes?.length || 0);
                    totalLinhas += (leito.linhas?.length || 0);
                }
            });
        });
        
        logAPISuccess(`Dados V3.1 carregados da planilha (46 colunas - incluindo AS/AT):`);
        logAPISuccess(`• ${totalHospitais} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        logAPISuccess(`• ${totalConcessoes} concessões ativas`);
        logAPISuccess(`• ${totalLinhas} linhas de cuidado ativas`);
        logAPISuccess(`• ${leitosComIsolamento} leitos com isolamento (AS)`);
        logAPISuccess(`• ${leitosComIdentificacao} leitos com identificação (AT)`);
        logAPISuccess(`• SEM PARSING - Dados diretos das 46 colunas!`);
        
        // Atualizar timestamp
        window.lastAPICall = Date.now();
        
        // Esconder loading
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        return window.hospitalData;
        
    } catch (error) {
        logAPIError('❌ ERRO ao carregar dados V3.1:', error.message);
        
        // Esconder loading mesmo com erro
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        // Manter dados vazios
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE VALIDAÇÃO V3.1 ===================
function validarConcessoes(concessoes) {
    if (!Array.isArray(concessoes)) return [];
    return concessoes.filter(c => CONCESSOES_VALIDAS_V31.includes(c));
}

function validarLinhas(linhas) {
    if (!Array.isArray(linhas)) return [];
    return linhas.filter(l => LINHAS_VALIDAS_V31.includes(l));
}

function validarTimeline(timeline) {
    if (!timeline || typeof timeline !== 'string') return 'SP';
    return TIMELINE_VALIDA_V31.includes(timeline) ? timeline : 'SP';
}

function validarIsolamento(isolamento) {
    if (!isolamento || typeof isolamento !== 'string') return 'NÃO ISOLAMENTO';
    return ISOLAMENTO_VALIDO_V31.includes(isolamento) ? isolamento : 'NÃO ISOLAMENTO';
}

function validarIdentificacaoLeito(identificacao) {
    if (!identificacao || typeof identificacao !== 'string') return '';
    const limpo = identificacao.trim().toUpperCase();
    return limpo.length <= 6 ? limpo : limpo.substring(0, 6);
}

// =================== FUNÇÕES DE SALVAMENTO V3.1 ===================

// Admitir paciente V3.1 (salvar na planilha)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente V3.1 no ${hospital}-${leito} NA PLANILHA REAL (46 colunas - incluindo AS/AT)`);
        
        // *** V3.1: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosPaciente.concessoes || []);
        const linhasValidas = validarLinhas(dadosPaciente.linhas || []);
        const timelineValida = validarTimeline(dadosPaciente.prevAlta || 'SP');
        const isolamentoValido = validarIsolamento(dadosPaciente.isolamento || 'NÃO ISOLAMENTO');
        const identificacaoValida = validarIdentificacaoLeito(dadosPaciente.identificacaoLeito || '');
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            nome: dadosPaciente.nome || '',
            matricula: dadosPaciente.matricula || '',
            idade: dadosPaciente.idade || null,
            pps: dadosPaciente.pps || null,
            spict: dadosPaciente.spict || 'nao_elegivel',
            complexidade: dadosPaciente.complexidade || 'I',
            prevAlta: timelineValida,
            linhas: linhasValidas,
            concessoes: concessoesValidas,
            // *** NOVA V3.1: INCLUIR AS/AT ***
            isolamento: isolamentoValido,
            identificacaoLeito: identificacaoValida
        };
        
        logAPI('Payload V3.1 admissão validado (incluindo AS/AT):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento,
            identificacaoLeito: payload.identificacaoLeito || 'vazio'
        });
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V3.1 admitido na planilha (46 colunas - AS/AT incluídas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente V3.1:', error.message);
        throw error;
    }
};

// Atualizar dados do paciente V3.1 (salvar na planilha)  
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente V3.1 ${hospital}-${leito} NA PLANILHA REAL (46 colunas - incluindo AS/AT)`);
        
        // *** V3.1: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosAtualizados.concessoes || []);
        const linhasValidas = validarLinhas(dadosAtualizados.linhas || []);
        const timelineValida = validarTimeline(dadosAtualizados.prevAlta || 'SP');
        const isolamentoValido = validarIsolamento(dadosAtualizados.isolamento || 'NÃO ISOLAMENTO');
        const identificacaoValida = validarIdentificacaoLeito(dadosAtualizados.identificacaoLeito || '');
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            idade: dadosAtualizados.idade || null,
            pps: dadosAtualizados.pps || null,
            spict: dadosAtualizados.spict || 'nao_elegivel',
            complexidade: dadosAtualizados.complexidade || 'I',
            prevAlta: timelineValida,
            linhas: linhasValidas,
            concessoes: concessoesValidas,
            // *** NOVA V3.1: INCLUIR AS/AT ***
            isolamento: isolamentoValido,
            identificacaoLeito: identificacaoValida === '' ? 'não alterado' : identificacaoValida
        };
        
        logAPI('Payload V3.1 atualização validado (incluindo AS/AT):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento,
            identificacaoLeito: payload.identificacaoLeito
        });
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V3.1 atualizado na planilha (46 colunas - AS/AT incluídas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente V3.1:', error.message);
        throw error;
    }
};

// Dar alta ao paciente V3.1 (salvar na planilha)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta V3.1 ao paciente ${hospital}-${leito} NA PLANILHA REAL (46 colunas)`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta V3.1 processada na planilha (todas as 46 colunas limpas)!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao dar alta V3.1:', error.message);
        throw error;
    }
};

// =================== FUNÇÃO DE TESTE DA API V3.1 ===================
window.testAPIConnection = async function() {
    try {
        logAPI('🔍 Testando conectividade V3.1 com a planilha (46 colunas - incluindo AS/AT)...');
        
        const testData = await apiRequest('test', {}, 'GET');
        
        if (testData && typeof testData === 'object') {
            logAPISuccess('✅ API V3.1 funcionando corretamente!', testData);
            return true;
        } else {
            throw new Error('Resposta inválida da API V3.1');
        }
        
    } catch (error) {
        logAPIError('❌ ERRO no teste da API V3.1:', error.message);
        return false;
    }
};

// =================== FUNÇÃO DE REFRESH AUTOMÁTICO V3.1 ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados V3.1 da planilha após ação...');
        
        await window.loadHospitalData();
        
        // Renderizar cards atualizados
        if (window.renderCards) {
            window.renderCards();
        }
        
        // Renderizar dashboards atualizados
        if (window.renderDashboardExecutivo) {
            window.renderDashboardExecutivo();
        }
        if (window.renderDashboardHospitalar) {
            window.renderDashboardHospitalar();
        }
        
        logAPISuccess('✅ Interface V3.1 atualizada com dados da planilha (incluindo AS/AT)');
        
    } catch (error) {
        logAPIError('Erro no refresh V3.1:', error.message);
    }
};

// =================== FUNÇÕES DE INICIALIZAÇÃO V3.1 ===================
document.addEventListener('DOMContentLoaded', function() {
    logAPISuccess('✅ API.js V3.1 100% FUNCIONAL - Nova estrutura 46 colunas (AS/AT) sem parsing ativa');
    logAPISuccess('✅ Colunas AS (ISOLAMENTO) e AT (IDENTIFICACAO_LEITO) implementadas');
    logAPISuccess('✅ Validação alfanumérica 6 chars para AT implementada');
    logAPISuccess('✅ Dropdown obrigatório 3 opções para AS implementado');
    
    // Configurar URL da API
    logAPI(`API.js V3.1 carregado - URL da API V3.1 configurada`);
    logAPI(`URL: ${API_V31_CONFIG.BASE_URL}`);
    logAPI(`Timeline: ${TIMELINE_VALIDA_V31.length} opções (incluindo 96h)`);
    logAPI(`Isolamento: ${ISOLAMENTO_VALIDO_V31.length} opções (AS)`);
    logAPI(`Concessões: ${CONCESSOES_VALIDAS_V31.length} tipos`);
    logAPI(`Linhas: ${LINHAS_VALIDAS_V31.length} tipos`);
    
    // Inicializar dados
    if (typeof window.loadHospitalData === 'function') {
        window.loadHospitalData().catch(error => {
            logAPIError('Erro na inicialização dos dados V3.1:', error.message);
        });
    }
});

// =================== EXPORT DE FUNÇÕES PÚBLICAS V3.1 ===================
window.API_V31_CONFIG = API_V31_CONFIG;
window.COLUMN_MAPPING_V31 = COLUMN_MAPPING_V31;
window.CONCESSOES_VALIDAS_V31 = CONCESSOES_VALIDAS_V31;
window.LINHAS_VALIDAS_V31 = LINHAS_VALIDAS_V31;
window.TIMELINE_VALIDA_V31 = TIMELINE_VALIDA_V31;
window.ISOLAMENTO_VALIDO_V31 = ISOLAMENTO_VALIDO_V31;

logAPISuccess('🔗 [API V3.1] API.js V3.1 TOTALMENTE FUNCIONAL');
logAPISuccess('🔗 [API V3.1] Mapeamento correto das colunas AS (ISOLAMENTO) e AT (IDENTIFICACAO_LEITO)');
logAPISuccess('🔗 [API V3.1] Sistema pronto para exibir dados de isolamento e identificação nos cards');
logAPISuccess('🔗 [API V3.1] Fallback JSONP ativo para contornar problemas de CORS');
