// =================== API V3.3 - ESTRUTURA COMPLETA 74 COLUNAS - COM DIRETIVAS ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Outubro/2025
// Versão: V3.3 (COMPLETO - Listas + Cores + Diretivas)
// =================== CHANGELOG V3.2 → V3.3 ===================
// ✅ Listas de concessões corrigidas (11 itens validados)
// ✅ Listas de linhas corrigidas (45 itens validados)
// ✅ Cores Pantone completas (56 cores)
// ✅ Campo Diretivas adicionado (coluna BV/73) ⬅️ NOVO!
// ✅ Total de colunas: 73 → 74 (A-BV)
// ✅ Estrutura validada com planilha real
// ✅ TODAS as funções do V3.2 mantidas + correções
// ==================================================================================

// *** URL DA API V3.3 ***
window.API_URL = 'https://script.google.com/macros/s/AKfycbyrdmoqC3J08_DM-VRKtHLC0htEJa4PnHeKQVTBsdSt1X1DFhc51axv-6TGyeKjn0Id/exec';

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = {};
window.apiCache = {};
window.lastAPICall = 0;
window.API_TIMEOUT = 15000; // 15 segundos

// =================== MAPEAMENTO DE COLUNAS V3.3 (74 COLUNAS: A-BV) ===================
window.COLUNAS = {
    // DADOS BÁSICOS (A-L) - 12 colunas
    HOSPITAL: 0,           // A
    LEITO: 1,              // B
    TIPO: 2,               // C
    STATUS: 3,             // D
    NOME: 4,               // E
    MATRICULA: 5,          // F
    IDADE: 6,              // G
    ADM_AT: 7,             // H
    PPS: 8,                // I
    SPICT: 9,              // J
    COMPLEXIDADE: 10,      // K
    PREV_ALTA: 11,         // L
    
    // CONCESSÕES (M-W) - 11 checkboxes
    C1_TRANSICAO_DOMICILIAR: 12,              // M
    C2_APLICACAO_MED_DOMICILIAR: 13,          // N
    C3_ASPIRACAO: 14,                          // O
    C4_BANHO: 15,                              // P
    C5_CURATIVO: 16,                           // Q
    C6_CURATIVO_PICC: 17,                      // R
    C7_FISIOTERAPIA_DOMICILIAR: 18,           // S
    C8_FONOAUDIOLOGIA_DOMICILIAR: 19,         // T
    C9_OXIGENOTERAPIA: 20,                     // U
    C10_REMOCAO: 21,                           // V
    C11_SOLICITACAO_EXAMES_DOMICILIAR: 22,    // W
    
    // LINHAS DE CUIDADO (X-BR) - 45 checkboxes
    L1_ASSISTE: 23,                            // X
    L2_APS_SP: 24,                             // Y
    L3_CUIDADOS_PALIATIVOS: 25,                // Z
    L4_ICO: 26,                                // AA
    L5_NEXUS_SP_CARDIOLOGIA: 27,              // AB
    L6_NEXUS_SP_GASTROENTEREOLOGIA: 28,       // AC
    L7_NEXUS_SP_GERIATRIA: 29,                // AD
    L8_NEXUS_SP_PNEUMOLOGIA: 30,              // AE
    L9_NEXUS_SP_PSIQUIATRIA: 31,              // AF
    L10_NEXUS_SP_REUMATOLOGIA: 32,            // AG
    L11_NEXUS_SP_SAUDE_FIGADO: 33,            // AH
    L12_GENERALISTA: 34,                       // AI
    L13_BUCOMAXILOFACIAL: 35,                  // AJ
    L14_CARDIOLOGIA: 36,                       // AK
    L15_CIRURGIA_CARDIACA: 37,                 // AL
    L16_CIRURGIA_CABECA_PESCOCO: 38,          // AM
    L17_CIRURGIA_APARELHO_DIGESTIVO: 39,      // AN
    L18_CIRURGIA_GERAL: 40,                    // AO
    L19_CIRURGIA_ONCOLOGICA: 41,               // AP
    IDENTIFICACAO_LEITO: 42,                   // AQ (campo especial)
    ISOLAMENTO: 43,                            // AR (campo especial)
    L20_CIRURGIA_PLASTICA: 44,                 // AS
    L21_CIRURGIA_TORACICA: 45,                 // AT
    L22_CIRURGIA_VASCULAR: 46,                 // AU
    L23_CLINICA_MEDICA: 47,                    // AV
    L24_COLOPROCTOLOGIA: 48,                   // AW
    L25_DERMATOLOGIA: 49,                      // AX
    L26_ENDOCRINOLOGIA: 50,                    // AY
    L27_FISIATRIA: 51,                         // AZ
    L28_GASTROENTEROLOGIA: 52,                 // BA
    L29_GERIATRIA: 53,                         // BB
    L30_GINECOLOGIA_OBSTETRICIA: 54,          // BC
    L31_HEMATOLOGIA: 55,                       // BD
    L32_INFECTOLOGIA: 56,                      // BE
    L33_MASTOLOGIA: 57,                        // BF
    L34_NEFROLOGIA: 58,                        // BG
    L35_NEUROCIRURGIA: 59,                     // BH
    L36_NEUROLOGIA: 60,                        // BI
    L37_OFTALMOLOGIA: 61,                      // BJ
    L38_ONCOLOGIA_CLINICA: 62,                 // BK
    L39_ORTOPEDIA: 63,                         // BL
    L40_OTORRINOLARINGOLOGIA: 64,              // BM
    L41_PEDIATRIA: 65,                         // BN
    L42_PNEUMOLOGIA: 66,                       // BO
    L43_PSIQUIATRIA: 67,                       // BP
    L44_REUMATOLOGIA: 68,                      // BQ
    L45_UROLOGIA: 69,                          // BR
    
    // CAMPOS NOVOS V3.2/V3.3 (BS-BV) - 4 dropdowns
    GENERO: 70,                                // BS
    REGIAO: 71,                                // BT
    CATEGORIA_ESCOLHIDA: 72,                   // BU
    DIRETIVAS: 73                              // BV ⬅️ NOVO V3.3!
};

// =================== TIMELINE (10 OPÇÕES) ===================
window.TIMELINE_OPCOES = [
    "Hoje Ouro", "Hoje 2R", "Hoje 3R",
    "24h Ouro", "24h 2R", "24h 3R", 
    "48h", "72h", "96h", "SP"
];

// =================== ISOLAMENTO (3 OPÇÕES - COLUNA AR) ===================
window.ISOLAMENTO_OPCOES = [
    "Não Isolamento",
    "Isolamento De Contato", 
    "Isolamento Respiratório"
];

// =================== REGIÕES (9 OPÇÕES - COLUNA BT/71) ===================
window.REGIOES_OPCOES = [
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

// =================== GÊNERO (2 OPÇÕES - COLUNA BS/70) ===================
window.GENERO_OPCOES = [
    "Masculino",
    "Feminino"
];

// =================== CATEGORIA (2 OPÇÕES - COLUNA BU/72) ===================
window.CATEGORIA_OPCOES = [
    "Apartamento",
    "Enfermaria"
];

// =================== DIRETIVAS (3 OPÇÕES - COLUNA BV/73) ⬅️ NOVO V3.3! ===================
window.DIRETIVAS_OPCOES = [
    "Sim",
    "Não",
    "Não se aplica"  // PADRÃO
];

// =================== LISTAS V3.3 CORRIGIDAS E VALIDADAS ===================

// *** CONCESSÕES: 11 ITENS CORRETOS (M-W checkboxes) ***
window.CONCESSOES_VALIDAS = [
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

// *** LINHAS DE CUIDADO: 45 ITENS CORRETOS (X-BR checkboxes) ***
window.LINHAS_VALIDAS = [
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

// =================== CORES PANTONE V3.3 - CONCESSÕES (11 CORES) ===================
window.CORES_CONCESSOES = {
    'Transição Domiciliar': '#007A53',
    'Aplicação domiciliar de medicamentos': '#582C83',
    'Aspiração': '#2E1A47',
    'Banho': '#8FD3F4',
    'Curativo': '#00BFB3',
    'Curativo PICC': '#E03C31',
    'Fisioterapia Domiciliar': '#009639',
    'Fonoaudiologia Domiciliar': '#FF671F',
    'Oxigenoterapia': '#64A70B',
    'Remoção': '#FFB81C',
    'Solicitação domiciliar de exames': '#546E7A'
};

// =================== CORES PANTONE V3.3 - LINHAS DE CUIDADO (45 CORES) ===================
window.CORES_LINHAS = {
    'Assiste': '#ED0A72',
    'APS SP': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO (Insuficiência Coronariana)': '#A6192E',
    'Nexus SP Cardiologia': '#C8102E',
    'Nexus SP Gastroentereologia': '#455A64',
    'Nexus SP Geriatria': '#E35205',
    'Nexus SP Pneumologia': '#4A148C',
    'Nexus SP Psiquiatria': '#3E2723',
    'Nexus SP Reumatologia': '#E91E63',
    'Nexus SP Saúde do Fígado': '#556F44',
    'Generalista': '#FFC72C',
    'Bucomaxilofacial': '#D81B60',
    'Cardiologia': '#5A0020',
    'Cirurgia Cardíaca': '#9CCC65',
    'Cirurgia de Cabeça e Pescoço': '#7CB342',
    'Cirurgia do Aparelho Digestivo': '#00263A',
    'Cirurgia Geral': '#00AEEF',
    'Cirurgia Oncológica': '#0072CE',
    'Cirurgia Plástica': '#8E24AA',
    'Cirurgia Torácica': '#BA68C8',
    'Cirurgia Vascular': '#AED581',
    'Clínica Médica': '#F4E285',
    'Coloproctologia': '#C2185B',
    'Dermatologia': '#9C27B0',
    'Endocrinologia': '#37474F',
    'Fisiatria': '#E8927C',
    'Gastroenterologia': '#003C57',
    'Geriatria': '#FF6F1D',
    'Ginecologia e Obstetrícia': '#582D40',
    'Hematologia': '#1E88E5',
    'Infectologia': '#4A7C59',
    'Mastologia': '#5C5EBE',
    'Nefrologia': '#7B1FA2',
    'Neurocirurgia': '#1565C0',
    'Neurologia': '#64B5F6',
    'Oftalmologia': '#6D4C41',
    'Oncologia Clínica': '#6A1B9A',
    'Ortopedia': '#42A5F5',
    'Otorrinolaringologia': '#AD1457',
    'Pediatria': '#5A646B',
    'Pneumologia': '#1976D2',
    'Psiquiatria': '#4E342E',
    'Reumatologia': '#880E4F',
    'Urologia': '#2D5016'
};

// =================== FUNÇÕES AUXILIARES ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API V3.3] ${message}`, data || '');
}

function logAPIError(message, error) {
    console.error(`❌ [API ERROR V3.3] ${message}`, error);
}

function logAPISuccess(message, data = null) {
    console.log(`✅ [API SUCCESS V3.3] ${message}`, data || '');
}

// =================== VALIDAÇÃO DE DADOS V3.3 ===================
function validarTimeline(prevAlta) {
    return window.TIMELINE_OPCOES.includes(prevAlta) ? prevAlta : 'SP';
}

function validarConcessoes(concessoes) {
    if (!Array.isArray(concessoes)) return [];
    return concessoes.filter(c => window.CONCESSOES_VALIDAS.includes(c));
}

function validarLinhas(linhas) {
    if (!Array.isArray(linhas)) return [];
    return linhas.filter(l => window.LINHAS_VALIDAS.includes(l));
}

function validarIsolamento(isolamento) {
    return window.ISOLAMENTO_OPCOES.includes(isolamento) ? isolamento : 'Não Isolamento';
}

function validarIdentificacaoLeito(identificacao) {
    if (!identificacao || typeof identificacao !== 'string') return '';
    const regex = /^[A-Za-z0-9]{1,6}$/;
    if (!regex.test(identificacao)) {
        throw new Error('Identificação do leito deve ter até 6 caracteres alfanuméricos');
    }
    return identificacao.toUpperCase();
}

function validarGenero(genero) {
    return window.GENERO_OPCOES.includes(genero) ? genero : '';
}

function validarRegiao(regiao) {
    return window.REGIOES_OPCOES.includes(regiao) ? regiao : '';
}

function validarCategoriaEscolhida(categoria) {
    return window.CATEGORIA_OPCOES.includes(categoria) ? categoria : '';
}

// *** NOVA V3.3: VALIDAR DIRETIVAS (COLUNA BV/73) ***
function validarDiretivas(diretiva) {
    return window.DIRETIVAS_OPCOES.includes(diretiva) ? diretiva : 'Não se aplica';
}

// *** FUNÇÃO PARA OBTER COR DE CONCESSÃO ***
function getCorConcessao(concessao) {
    return window.CORES_CONCESSOES[concessao] || '#999999';
}

// *** FUNÇÃO PARA OBTER COR DE LINHA ***
function getCorLinha(linha) {
    return window.CORES_LINHAS[linha] || '#999999';
}

// =================== CORREÇÃO CRÍTICA PARA CORS - JSONP ===================

function jsonpRequest(url, params = {}) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        const urlObj = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlObj.searchParams.append(key, String(params[key]));
            }
        });
        urlObj.searchParams.append('callback', callbackName);
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            resolve(data);
        };
        
        const script = document.createElement('script');
        script.src = urlObj.toString();
        script.onerror = () => {
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            reject(new Error('JSONP request failed'));
        };
        
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                reject(new Error('JSONP request timeout'));
            }
        }, window.API_TIMEOUT);
        
        document.head.appendChild(script);
    });
}

// =================== CONFIGURAÇÃO DE REQUISIÇÕES COM CORS FIX ===================

async function apiRequest(action, params = {}, method = 'GET') {
    try {
        logAPI(`Fazendo requisição ${method}: ${action}`, params);
        
        if (method === 'GET') {
            try {
                let url = new URL(window.API_URL);
                url.searchParams.append('action', action);
                Object.keys(params).forEach(key => {
                    if (params[key] !== null && params[key] !== undefined) {
                        url.searchParams.append(key, String(params[key]));
                    }
                });
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!data.ok) {
                    throw new Error(data.error || data.message || 'Erro desconhecido da API');
                }
                
                logAPISuccess(`${method} ${action} concluído (Fetch)`, data.data ? `${Object.keys(data.data).length || 0} registros` : 'sem dados');
                return data.data;
                
            } catch (fetchError) {
                logAPI(`Fetch falhou (${fetchError.message}), tentando JSONP...`);
                
                const data = await jsonpRequest(window.API_URL, { action, ...params });
                
                if (!data || !data.ok) {
                    throw new Error(data?.error || data?.message || 'Erro desconhecido da API via JSONP');
                }
                
                logAPISuccess(`${method} ${action} concluído (JSONP)`, data.data ? `${Object.keys(data.data).length || 0} registros` : 'sem dados');
                return data.data;
            }
            
        } else {
            try {
                const response = await fetch(window.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ action, ...params })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (!data.ok) throw new Error(data.error || 'Erro no POST');
                
                logAPISuccess(`${method} ${action} concluído (POST)`, 'dados salvos');
                return data.data;
                
            } catch (postError) {
                logAPI(`POST falhou (${postError.message}), tentando via GET com JSONP...`);
                
                const data = await jsonpRequest(window.API_URL, { action, ...params });
                if (!data || !data.ok) throw new Error(data?.error || 'Erro no POST via JSONP');
                
                logAPISuccess(`${method} ${action} concluído (POST via JSONP)`, 'dados salvos');
                return data.data;
            }
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            logAPIError(`Timeout na requisição ${method} ${action}`, 'Requisição cancelada por timeout');
            throw new Error('Timeout na API - verifique sua conexão');
        }
        
        logAPIError(`Erro na requisição ${method} ${action}`, error.message);
        throw error;
    }
}

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO V3.3 ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados V3.3 da planilha (74 colunas - A-BV)...');
        
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script V3.3...');
        }
        
        const apiData = await apiRequest('all', {}, 'GET');
        
        if (!apiData || typeof apiData !== 'object') {
            throw new Error('API V3.3 retornou dados inválidos');
        }
        
        window.hospitalData = {};
        
        if (apiData.H1 && apiData.H1.leitos) {
            logAPI('Dados V3.3 recebidos em formato agrupado');
            window.hospitalData = apiData;
        } 
        else if (Array.isArray(apiData)) {
            logAPI('Dados V3.3 recebidos em formato flat - convertendo...');
            apiData.forEach(leito => {
                const hospitalId = leito.hospital;
                if (!window.hospitalData[hospitalId]) {
                    window.hospitalData[hospitalId] = { leitos: [] };
                }
                window.hospitalData[hospitalId].leitos.push(leito);
            });
        }
        else {
            throw new Error('Formato de dados da API V3.3 não reconhecido');
        }
        
        const totalHospitais = Object.keys(window.hospitalData).length;
        if (totalHospitais === 0) {
            throw new Error('Nenhum hospital encontrado nos dados da API V3.3');
        }
        
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital && hospital.leitos) {
                hospital.leitos = hospital.leitos.map(leito => {
                    if (leito.status === 'Em uso') leito.status = 'ocupado';
                    if (leito.status === 'Vago') leito.status = 'vago';
                    
                    if (leito.prevAlta) {
                        leito.prevAlta = validarTimeline(leito.prevAlta);
                    }
                    
                    if (leito.concessoes) {
                        leito.concessoes = validarConcessoes(leito.concessoes);
                    }
                    if (leito.linhas) {
                        leito.linhas = validarLinhas(leito.linhas);
                    }
                    
                    if (leito.isolamento) {
                        leito.isolamento = validarIsolamento(leito.isolamento);
                    } else {
                        leito.isolamento = 'Não Isolamento';
                    }
                    
                    if (leito.identificacaoLeito) {
                        try {
                            leito.identificacaoLeito = validarIdentificacaoLeito(leito.identificacaoLeito);
                        } catch (error) {
                            logAPIError(`Erro na identificação do leito ${hospitalId}-${leito.leito}:`, error.message);
                            leito.identificacaoLeito = '';
                        }
                    } else {
                        leito.identificacaoLeito = '';
                    }
                    
                    if (leito.genero) {
                        leito.genero = validarGenero(leito.genero);
                    } else {
                        leito.genero = '';
                    }
                    
                    if (leito.regiao) {
                        leito.regiao = validarRegiao(leito.regiao);
                    } else {
                        leito.regiao = '';
                    }
                    
                    if (leito.categoriaEscolhida) {
                        leito.categoriaEscolhida = validarCategoriaEscolhida(leito.categoriaEscolhida);
                    } else {
                        leito.categoriaEscolhida = '';
                    }
                    
                    // *** NOVA V3.3: VALIDAR DIRETIVAS (COLUNA BV/73) ***
                    if (leito.diretivas) {
                        leito.diretivas = validarDiretivas(leito.diretivas);
                    } else {
                        leito.diretivas = 'Não se aplica'; // PADRÃO V3.3
                    }
                    
                    if (leito.status === 'ocupado' && leito.nome) {
                        leito.paciente = {
                            nome: leito.nome,
                            matricula: leito.matricula,
                            idade: leito.idade,
                            pps: leito.pps,
                            spict: leito.spict,
                            complexidade: leito.complexidade,
                            prevAlta: leito.prevAlta,
                            linhas: leito.linhas || [],
                            concessoes: leito.concessoes || [],
                            isolamento: leito.isolamento,
                            identificacaoLeito: leito.identificacaoLeito,
                            genero: leito.genero,
                            regiao: leito.regiao,
                            categoriaEscolhida: leito.categoriaEscolhida,
                            diretivas: leito.diretivas  // ⬅️ NOVO V3.3!
                        };
                    }
                    
                    return leito;
                });
                
                hospital.leitos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
            }
        });
        
        const totalLeitos = Object.values(window.hospitalData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        const leitosOcupados = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.filter(l => l.status === 'ocupado').length : 0), 0);
        const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
        
        let totalConcessoes = 0;
        let totalLinhas = 0;
        let leitosComIsolamento = 0;
        let leitosComIdentificacao = 0;
        let leitosComGenero = 0;
        let leitosComRegiao = 0;
        let leitosComCategoria = 0;
        let leitosComDiretivas = 0; // ⬅️ NOVO V3.3!
        
        Object.values(window.hospitalData).forEach(hospital => {
            hospital.leitos?.forEach(leito => {
                if (leito.status === 'ocupado') {
                    totalConcessoes += (leito.concessoes?.length || 0);
                    totalLinhas += (leito.linhas?.length || 0);
                }
                if (leito.isolamento && leito.isolamento !== 'Não Isolamento') {
                    leitosComIsolamento++;
                }
                if (leito.identificacaoLeito) {
                    leitosComIdentificacao++;
                }
                if (leito.genero) {
                    leitosComGenero++;
                }
                if (leito.regiao) {
                    leitosComRegiao++;
                }
                if (leito.categoriaEscolhida) {
                    leitosComCategoria++;
                }
                // ⬅️ NOVO V3.3!
                if (leito.diretivas && leito.diretivas !== 'Não se aplica') {
                    leitosComDiretivas++;
                }
            });
        });
        
        logAPISuccess(`Dados V3.3 carregados da planilha (74 colunas A-BV):`);
        logAPISuccess(`• ${totalHospitais} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        logAPISuccess(`• ${totalConcessoes} concessões ativas (11 tipos)`);
        logAPISuccess(`• ${totalLinhas} linhas de cuidado ativas (45 tipos)`);
        logAPISuccess(`• ${leitosComIsolamento} leitos com isolamento (AR)`);
        logAPISuccess(`• ${leitosComIdentificacao} leitos com identificação (AQ)`);
        logAPISuccess(`• ${leitosComGenero} leitos com gênero (BS/70)`);
        logAPISuccess(`• ${leitosComRegiao} leitos com região (BT/71)`);
        logAPISuccess(`• ${leitosComCategoria} leitos com categoria (BU/72)`);
        logAPISuccess(`• ${leitosComDiretivas} leitos com diretivas (BV/73) ⬅️ NOVO V3.3!`);
        
        window.lastAPICall = Date.now();
        
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        return window.hospitalData;
        
    } catch (error) {
        logAPIError('❌ ERRO ao carregar dados V3.3:', error.message);
        
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE SALVAMENTO V3.3 ===================

window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente V3.3 no ${hospital}-${leito} NA PLANILHA REAL (74 colunas A-BV)`);
        
        const concessoesValidas = validarConcessoes(dadosPaciente.concessoes || []);
        const linhasValidas = validarLinhas(dadosPaciente.linhas || []);
        const timelineValida = validarTimeline(dadosPaciente.prevAlta || 'SP');
        const isolamentoValido = validarIsolamento(dadosPaciente.isolamento || 'Não Isolamento');
        const generoValido = validarGenero(dadosPaciente.genero || '');
        const regiaoValida = validarRegiao(dadosPaciente.regiao || '');
        const categoriaValida = validarCategoriaEscolhida(dadosPaciente.categoriaEscolhida || '');
        const diretivasValida = validarDiretivas(dadosPaciente.diretivas || 'Não se aplica'); // ⬅️ NOVO V3.3!
        
        let identificacaoValida = '';
        if (dadosPaciente.identificacaoLeito) {
            try {
                identificacaoValida = validarIdentificacaoLeito(dadosPaciente.identificacaoLeito);
            } catch (error) {
                throw new Error(`Erro na identificação do leito: ${error.message}`);
            }
        }
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            nome: dadosPaciente.nome || '',
            matricula: dadosPaciente.matricula || '',
            idade: dadosPaciente.idade || null,
            pps: dadosPaciente.pps || null,
            spict: dadosPaciente.spict || '',
            complexidade: dadosPaciente.complexidade || 'I',
            prevAlta: timelineValida,
            linhas: linhasValidas,
            concessoes: concessoesValidas,
            isolamento: isolamentoValido,
            identificacaoLeito: identificacaoValida,
            genero: generoValido,
            regiao: regiaoValida,
            categoriaEscolhida: categoriaValida,
            diretivas: diretivasValida  // ⬅️ NOVO V3.3!
        };
        
        logAPI('Payload V3.3 validado (74 colunas):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento,
            identificacaoLeito: payload.identificacaoLeito || 'vazio',
            genero: payload.genero || 'vazio',
            regiao: payload.regiao || 'vazio',
            categoria: payload.categoriaEscolhida || 'vazio',
            diretivas: payload.diretivas // ⬅️ NOVO V3.3!
        });
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess(`✅ Paciente admitido V3.3 na planilha (74 colunas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente V3.3:', error.message);
        throw error;
    }
};

window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente V3.3 ${hospital}-${leito} NA PLANILHA REAL (74 colunas A-BV)`);
        
        const concessoesValidas = validarConcessoes(dadosAtualizados.concessoes || []);
        const linhasValidas = validarLinhas(dadosAtualizados.linhas || []);
        const timelineValida = dadosAtualizados.prevAlta ? validarTimeline(dadosAtualizados.prevAlta) : '';
        const isolamentoValido = dadosAtualizados.isolamento ? validarIsolamento(dadosAtualizados.isolamento) : '';
        const generoValido = dadosAtualizados.genero ? validarGenero(dadosAtualizados.genero) : '';
        const regiaoValida = dadosAtualizados.regiao ? validarRegiao(dadosAtualizados.regiao) : '';
        const categoriaValida = dadosAtualizados.categoriaEscolhida ? validarCategoriaEscolhida(dadosAtualizados.categoriaEscolhida) : '';
        const diretivasValida = dadosAtualizados.diretivas ? validarDiretivas(dadosAtualizados.diretivas) : ''; // ⬅️ NOVO V3.3!
        
        let identificacaoValida = '';
        if (dadosAtualizados.identificacaoLeito) {
            try {
                identificacaoValida = validarIdentificacaoLeito(dadosAtualizados.identificacaoLeito);
            } catch (error) {
                throw new Error(`Erro na identificação do leito: ${error.message}`);
            }
        }
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            idade: dadosAtualizados.idade || null,
            pps: dadosAtualizados.pps || null,
            spict: dadosAtualizados.spict || '',
            complexidade: dadosAtualizados.complexidade || '',
            prevAlta: timelineValida,
            linhas: linhasValidas,
            concessoes: concessoesValidas,
            isolamento: isolamentoValido,
            identificacaoLeito: identificacaoValida,
            genero: generoValido,
            regiao: regiaoValida,
            categoriaEscolhida: categoriaValida,
            diretivas: diretivasValida  // ⬅️ NOVO V3.3!
        };
        
        logAPI('Payload V3.3 atualização validado (74 colunas):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento || 'não alterado',
            identificacaoLeito: payload.identificacaoLeito || 'não alterado',
            genero: payload.genero || 'não alterado',
            regiao: payload.regiao || 'não alterado',
            categoria: payload.categoriaEscolhida || 'não alterado',
            diretivas: payload.diretivas || 'não alterado' // ⬅️ NOVO V3.3!
        });
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V3.3 atualizado na planilha (74 colunas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente V3.3:', error.message);
        throw error;
    }
};

window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta V3.3 ao paciente ${hospital}-${leito} NA PLANILHA REAL (74 colunas A-BV)`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta V3.3 processada na planilha (todas as 74 colunas limpas)!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao processar alta V3.3:', error.message);
        throw error;
    }
};

// *** V3.3: FUNÇÃO PARA COLETAR DADOS DO FORMULÁRIO (INCLUINDO BV/DIRETIVAS) ***
window.coletarDadosFormulario = function(tipo) {
    const dados = {
        nome: document.getElementById(`${tipo}Nome`)?.value || '',
        matricula: document.getElementById(`${tipo}Matricula`)?.value || '',
        idade: document.getElementById(`${tipo}Idade`)?.value || null,
        pps: document.getElementById(`${tipo}Pps`)?.value || null,
        spict: document.getElementById(`${tipo}Spict`)?.value || '',
        complexidade: document.getElementById(`${tipo}Complexidade`)?.value || '',
        prevAlta: document.getElementById(`${tipo}PrevAlta`)?.value || 'SP',
        concessoes: [],
        linhas: [],
        isolamento: document.getElementById(`${tipo}Isolamento`)?.value || 'Não Isolamento',
        identificacaoLeito: document.getElementById(`${tipo}IdentificacaoLeito`)?.value || '',
        genero: document.getElementById(`${tipo}Genero`)?.value || '',
        regiao: document.getElementById(`${tipo}Regiao`)?.value || '',
        categoriaEscolhida: document.getElementById(`${tipo}Categoria`)?.value || '',
        diretivas: document.getElementById(`${tipo}Diretivas`)?.value || 'Não se aplica'  // ⬅️ NOVO V3.3!
    };
    
    document.querySelectorAll(`input[name="${tipo}Concessoes"]:checked`).forEach(checkbox => {
        dados.concessoes.push(checkbox.value);
    });
    
    document.querySelectorAll(`input[name="${tipo}Linhas"]:checked`).forEach(checkbox => {
        dados.linhas.push(checkbox.value);
    });
    
    logAPI(`Dados V3.3 coletados do formulário (74 colunas):`, {
        isolamento: dados.isolamento,
        identificacaoLeito: dados.identificacaoLeito || 'vazio',
        genero: dados.genero || 'vazio',
        regiao: dados.regiao || 'vazio',
        categoria: dados.categoriaEscolhida || 'vazio',
        diretivas: dados.diretivas, // ⬅️ NOVO V3.3!
        concessoes: dados.concessoes.length,
        linhas: dados.linhas.length
    });
    
    return dados;
};

// =================== REFRESH APÓS AÇÕES V3.3 ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados V3.3 da planilha após ação...');
        
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #1a1f2e; border-radius: 12px;">
                    <div style="color: #60a5fa; margin-bottom: 15px; font-size: 18px;">
                        🔄 Sincronizando V3.3 com a planilha (74 colunas A-BV)...
                    </div>
                    <div style="color: #9ca3af; font-size: 14px;">
                        Atualizando dados - Checkboxes diretos + Diretivas V3.3
                    </div>
                </div>
            `;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await window.loadHospitalData();
        
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
                logAPISuccess('✅ Interface V3.3 atualizada com dados da planilha');
            }
        }, 500);
        
    } catch (error) {
        logAPIError('Erro ao refresh V3.3:', error.message);
        
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== FUNÇÕES DE TESTE E MONITORAMENTO V3.3 ===================

window.testAPI = async function() {
    try {
        logAPI('🔍 Testando conectividade V3.3 com a planilha (74 colunas A-BV)...');
        
        const result = await apiRequest('test', {}, 'GET');
        
        if (result) {
            logAPISuccess('✅ API V3.3 funcionando corretamente!', result);
            return { status: 'ok', data: result };
        } else {
            throw new Error('API V3.3 não retornou dados de teste válidos');
        }
        
    } catch (error) {
        logAPIError('❌ Erro na conectividade V3.3:', error.message);
        return { status: 'error', message: error.message };
    }
};

window.monitorAPI = function() {
    if (window.apiMonitorInterval) {
        clearInterval(window.apiMonitorInterval);
    }
    
    window.apiMonitorInterval = setInterval(async () => {
        try {
            const timeSinceLastCall = Date.now() - window.lastAPICall;
            
            if (timeSinceLastCall > 240000) {
                logAPI('🔄 Refresh automático V3.3 dos dados...');
                await window.loadHospitalData();
                
                if (window.currentView === 'leitos' && window.renderCards) {
                    setTimeout(() => window.renderCards(), 1000);
                }
            }
        } catch (error) {
            logAPIError('Erro no monitoramento automático V3.3:', error.message);
        }
    }, 60000);
    
    logAPI('🔍 Monitoramento automático V3.3 da API ativado');
};

// =================== COMPATIBILIDADE COM VERSÕES ANTERIORES ===================

window.fetchHospitalData = async function(hospital) {
    logAPI(`Buscando dados V3.3 do hospital: ${hospital}`);
    
    await window.loadHospitalData();
    
    if (window.hospitalData[hospital] && window.hospitalData[hospital].leitos) {
        return window.hospitalData[hospital].leitos;
    }
    
    return [];
};

window.loadAllHospitalsData = window.loadHospitalData;

window.fetchLeitoData = async function(hospital, leito) {
    try {
        const data = await apiRequest('one', { hospital: hospital, leito: leito }, 'GET');
        return data;
    } catch (error) {
        logAPIError(`Erro ao buscar leito V3.3 ${hospital}-${leito}:`, error.message);
        return null;
    }
};

// =================== FUNÇÕES DE CORES V3.3 ===================
window.loadColors = async function() {
    try {
        const colors = await apiRequest('getcolors', {}, 'GET');
        if (colors && typeof colors === 'object') {
            Object.entries(colors).forEach(([property, value]) => {
                if (property.startsWith('--') || property.startsWith('-')) {
                    document.documentElement.style.setProperty(property, value);
                }
            });
            logAPISuccess('✅ Cores V3.3 carregadas da planilha');
            return colors;
        }
    } catch (error) {
        logAPIError('Erro ao carregar cores V3.3:', error.message);
    }
    return null;
};

window.saveColors = async function(colors) {
    try {
        const result = await apiRequest('savecolors', { colors: colors }, 'POST');
        logAPISuccess('✅ Cores V3.3 salvas na planilha');
        return result;
    } catch (error) {
        logAPIError('Erro ao salvar cores V3.3:', error.message);
        throw error;
    }
};

// =================== INICIALIZAÇÃO V3.3 ===================
window.addEventListener('load', () => {
    logAPI('API.js V3.3 carregado - URL da API V3.3 configurada');
    logAPI(`URL: ${window.API_URL}`);
    logAPI(`Timeline: ${window.TIMELINE_OPCOES.length} opções`);
    logAPI(`Isolamento: ${window.ISOLAMENTO_OPCOES.length} opções (AR/43)`);
    logAPI(`Regiões: ${window.REGIOES_OPCOES.length} opções (BT/71)`);
    logAPI(`Gênero: ${window.GENERO_OPCOES.length} opções (BS/70)`);
    logAPI(`Categoria: ${window.CATEGORIA_OPCOES.length} opções (BU/72)`);
    logAPI(`Diretivas: ${window.DIRETIVAS_OPCOES.length} opções (BV/73) ⬅️ NOVO V3.3!`);
    logAPI(`Concessões: ${window.CONCESSOES_VALIDAS.length} tipos (M-W checkboxes)`);
    logAPI(`Linhas: ${window.LINHAS_VALIDAS.length} tipos (X-BR checkboxes)`);
    logAPI(`Cores: ${Object.keys(window.CORES_CONCESSOES).length + Object.keys(window.CORES_LINHAS).length} cores Pantone`);
    
    setTimeout(() => {
        if (window.monitorAPI) {
            window.monitorAPI();
        }
    }, 10000);
});

logAPISuccess('✅ API.js V3.3 100% FUNCIONAL - Nova estrutura 74 colunas (A-BV) ativa');
logAPISuccess('✅ Checkboxes diretos (M-W + X-BR) - ZERO parsing');
logAPISuccess('✅ Novos campos V3.3: BS/70 (genero), BT/71 (regiao), BU/72 (categoria), BV/73 (diretivas)');
logAPISuccess('✅ 11 concessões + 45 linhas de cuidado implementadas com cores Pantone');
logAPISuccess('✅ Campo Diretivas adicionado (Sim, Não, Não se aplica)');
