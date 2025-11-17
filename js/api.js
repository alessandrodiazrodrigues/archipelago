// =================== API V6.0 - ARCHIPELAGO DASHBOARD ===================
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues
// Data: Novembro/2025
// Versão: V6.0 (11 HOSPITAIS - 341 LEITOS - 76 COLUNAS)
// ✅ NOVIDADES: H8, H9 (2 novos ativos)
// ✅ NOVIDADES: H10, H11 (2 reservas - backend preparado, frontend desabilitado)
// ✅ NOVIDADES: Sistema de leitos extras dinâmico
// ✅ NOVIDADES: Campo anotações (BX - 800 caracteres)
// ✅ NOVIDADES: Santa Clara reestruturado (4 pares de irmãos)
// ✅ NOVIDADES: Santa Marcelina expandido (28 leitos)
// ==================================================================================

window.API_URL = 'https://script.google.com/macros/s/AKfycbzUfGJXoX6sEfdMjvz7XUBDIYzpoxxclefTnm7BnIwwOWvre2MJc-7PlE16DjqHugMpdA/exec';

// =================== CONFIGURAÇÃO DOS HOSPITAIS V6.0 ===================
window.HOSPITAIS_CONFIG = {
    H1: { nome: 'Neomater', leitos: 25 },
    H2: { nome: 'Cruz Azul', leitos: 67 },
    H3: { nome: 'Santa Marcelina', leitos: 28 },
    H4: { nome: 'Santa Clara', leitos: 57 },
    H5: { nome: 'Adventista', leitos: 28 },
    H6: { nome: 'Santa Cruz', leitos: 22 },
    H7: { nome: 'Santa Virgínia', leitos: 22 },
    H8: { nome: 'São Camilo Ipiranga', leitos: 22 },
    H9: { nome: 'São Camilo Pompeia', leitos: 22 }
    // H10 e H11 existem no backend mas não aparecem no frontend (reservas)
};

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = {};
window.apiCache = {};
window.lastAPICall = 0;
window.API_TIMEOUT = 15000;

// =================== MAPEAMENTO DE COLUNAS V6.0 (76 COLUNAS: A-BX) ===================
window.COLUNAS = {
    HOSPITAL: 0, LEITO: 1, TIPO: 2, STATUS: 3, NOME: 4, MATRICULA: 5,
    IDADE: 6, ADM_AT: 7, PPS: 8, SPICT: 9, COMPLEXIDADE: 10, PREV_ALTA: 11,
    C1_TRANSICAO_DOMICILIAR: 12, C2_APLICACAO_MED_DOMICILIAR: 13,
    C3_ASPIRACAO: 14, C4_BANHO: 15, C5_CURATIVO: 16, C6_CURATIVO_PICC: 17,
    C7_FISIOTERAPIA_MOTORA_DOMICILIAR: 18, C8_FONOAUDIOLOGIA_DOMICILIAR: 19,
    C9_OXIGENOTERAPIA: 20, C10_REMOCAO: 21, C11_SOLICITACAO_EXAMES_DOMICILIAR: 22,
    L1_ASSISTE: 23, L2_APS_SP: 24, L3_CUIDADOS_PALIATIVOS: 25, L4_ICO: 26,
    L5_NEXUS_SP_CARDIOLOGIA: 27, L6_NEXUS_SP_GASTROENTEREOLOGIA: 28,
    L7_NEXUS_SP_GERIATRIA: 29, L8_NEXUS_SP_PNEUMOLOGIA: 30,
    L9_NEXUS_SP_PSIQUIATRIA: 31, L10_NEXUS_SP_REUMATOLOGIA: 32,
    L11_NEXUS_SP_SAUDE_FIGADO: 33, L12_GENERALISTA: 34,
    L13_BUCOMAXILOFACIAL: 35, L14_CARDIOLOGIA: 36, L15_CIRURGIA_CARDIACA: 37,
    L16_CIRURGIA_CABECA_PESCOCO: 38, L17_CIRURGIA_APARELHO_DIGESTIVO: 39,
    L18_CIRURGIA_GERAL: 40, L19_CIRURGIA_ONCOLOGICA: 41,
    IDENTIFICACAO_LEITO: 42, ISOLAMENTO: 43,
    L20_CIRURGIA_PLASTICA: 44, L21_CIRURGIA_TORACICA: 45,
    L22_CIRURGIA_VASCULAR: 46, L23_CLINICA_MEDICA: 47,
    L24_COLOPROCTOLOGIA: 48, L25_DERMATOLOGIA: 49,
    L26_ENDOCRINOLOGIA: 50, L27_FISIATRIA: 51,
    L28_GASTROENTEROLOGIA: 52, L29_GERIATRIA: 53,
    L30_GINECOLOGIA_OBSTETRICIA: 54, L31_HEMATOLOGIA: 55,
    L32_INFECTOLOGIA: 56, L33_MASTOLOGIA: 57, L34_NEFROLOGIA: 58,
    L35_NEUROCIRURGIA: 59, L36_NEUROLOGIA: 60, L37_OFTALMOLOGIA: 61,
    L38_ONCOLOGIA_CLINICA: 62, L39_ORTOPEDIA: 63,
    L40_OTORRINOLARINGOLOGIA: 64, L41_PEDIATRIA: 65,
    L42_PNEUMOLOGIA: 66, L43_PSIQUIATRIA: 67, L44_REUMATOLOGIA: 68,
    L45_UROLOGIA: 69, GENERO: 70, REGIAO: 71,
    CATEGORIA_ESCOLHIDA: 72, DIRETIVAS: 73,
    C12_FISIOTERAPIA_RESPIRATORIA_DOMICILIAR: 74,
    ANOTACOES: 75  // ✅ NOVA COLUNA BX (800 caracteres)
};

// =================== TIMELINE (10 OPÇÕES) ===================
window.TIMELINE_OPCOES = [
    "Hoje Ouro", "Hoje 2R", "Hoje 3R",
    "24h Ouro", "24h 2R", "24h 3R", 
    "48h", "48H", "72h", "72H", "96h", "96H", "SP"
];

window.ISOLAMENTO_OPCOES = [
    "Não Isolamento",
    "Isolamento de Contato",
    "Isolamento Respiratório"
];

window.REGIOES_OPCOES = [
    "Zona Central", "Zona Sul", "Zona Norte", "Zona Leste", "Zona Oeste",
    "ABC", "Guarulhos", "Osasco", "Outra"
];

window.GENERO_OPCOES = ["Masculino", "Feminino"];
window.CATEGORIA_OPCOES = ["Apartamento", "Enfermaria"];
window.DIRETIVAS_OPCOES = ["Sim", "Não", "Não se aplica"];

// =================== ✅ LISTAS PARA VALIDAÇÃO - 12 CONCESSÕES (SEM ACENTOS) ===================
window.CONCESSOES_VALIDAS = [
    "Transicao Domiciliar",
    "Aplicacao domiciliar de medicamentos",
    "Aspiracao",
    "Banho",
    "Curativo",
    "Curativo PICC",
    "Fisioterapia Motora Domiciliar",
    "Fonoaudiologia Domiciliar",
    "Oxigenoterapia",
    "Remocao",
    "Solicitacao domiciliar de exames",
    "Fisioterapia Respiratoria Domiciliar"
];

window.LINHAS_VALIDAS = [
    "Assiste", "APS SP", "Cuidados Paliativos",
    "ICO (Insuficiencia Coronariana)", "Nexus SP Cardiologia",
    "Nexus SP Gastroentereologia", "Nexus SP Geriatria",
    "Nexus SP Pneumologia", "Nexus SP Psiquiatria",
    "Nexus SP Reumatologia", "Nexus SP Saude do Figado",
    "Generalista", "Bucomaxilofacial", "Cardiologia",
    "Cirurgia Cardiaca", "Cirurgia de Cabeca e Pescoco",
    "Cirurgia do Aparelho Digestivo", "Cirurgia Geral",
    "Cirurgia Oncologica", "Cirurgia Plastica",
    "Cirurgia Toracica", "Cirurgia Vascular",
    "Clinica Medica", "Coloproctologia", "Dermatologia",
    "Endocrinologia", "Fisiatria", "Gastroenterologia",
    "Geriatria", "Ginecologia e Obstetricia",
    "Hematologia", "Infectologia", "Mastologia",
    "Nefrologia", "Neurocirurgia", "Neurologia",
    "Oftalmologia", "Oncologia Clinica", "Ortopedia",
    "Otorrinolaringologia", "Pediatria", "Pneumologia",
    "Psiquiatria", "Reumatologia", "Urologia"
];

// =================== ✅ CORES PANTONE - 12 CONCESSÕES (SEM ACENTOS NAS CHAVES) ===================
window.CORES_CONCESSOES = {
    'Transicao Domiciliar': '#007A53',
    'Aplicacao domiciliar de medicamentos': '#582C83',
    'Aspiracao': '#2E1A47',
    'Banho': '#8FD3F4',
    'Curativo': '#00BFB3',
    'Curativo PICC': '#E03C31',
    'Fisioterapia Motora Domiciliar': '#009639',
    'Fonoaudiologia Domiciliar': '#FF671F',
    'Oxigenoterapia': '#64A70B',
    'Remocao': '#FFB81C',
    'Solicitacao domiciliar de exames': '#546E7A',
    'Fisioterapia Respiratoria Domiciliar': '#1B5E20'
};

window.CORES_LINHAS = {
    'Assiste': '#ED0A72', 'APS SP': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO (Insuficiencia Coronariana)': '#A6192E',
    'Nexus SP Cardiologia': '#C8102E',
    'Nexus SP Gastroentereologia': '#455A64',
    'Nexus SP Geriatria': '#E35205',
    'Nexus SP Pneumologia': '#4A148C',
    'Nexus SP Psiquiatria': '#3E2723',
    'Nexus SP Reumatologia': '#E91E63',
    'Nexus SP Saude do Figado': '#556F44',
    'Generalista': '#FFC72C', 'Bucomaxilofacial': '#D81B60',
    'Cardiologia': '#5A0020', 'Cirurgia Cardiaca': '#9CCC65',
    'Cirurgia de Cabeca e Pescoco': '#7CB342',
    'Cirurgia do Aparelho Digestivo': '#00263A',
    'Cirurgia Geral': '#00AEEF', 'Cirurgia Oncologica': '#0072CE',
    'Cirurgia Plastica': '#8E24AA', 'Cirurgia Toracica': '#BA68C8',
    'Cirurgia Vascular': '#AED581', 'Clinica Medica': '#F4E285',
    'Coloproctologia': '#C2185B', 'Dermatologia': '#9C27B0',
    'Endocrinologia': '#37474F', 'Fisiatria': '#E8927C',
    'Gastroenterologia': '#003C57', 'Geriatria': '#FF6F1D',
    'Ginecologia e Obstetricia': '#582D40',
    'Hematologia': '#1E88E5', 'Infectologia': '#4A7C59',
    'Mastologia': '#5C5EBE', 'Nefrologia': '#7B1FA2',
    'Neurocirurgia': '#1565C0', 'Neurologia': '#64B5F6',
    'Oftalmologia': '#6D4C41', 'Oncologia Clinica': '#6A1B9A',
    'Ortopedia': '#42A5F5', 'Otorrinolaringologia': '#AD1457',
    'Pediatria': '#5A646B', 'Pneumologia': '#1976D2',
    'Psiquiatria': '#4E342E', 'Reumatologia': '#880E4F',
    'Urologia': '#2D5016'
};

// =================== ✅ NORMALIZAÇÃO (APENAS PARA VALIDAÇÃO) ===================
function normalizarTexto(texto) {
    if (!texto || typeof texto !== 'string') return texto;
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C');
}

// =================== FUNÇÕES AUXILIARES ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API V6.0] ${message}`, data || '');
}

function logAPIError(message, error) {
    console.error(`❌ [API ERROR V6.0] ${message}`, error);
}

function logAPISuccess(message, data = null) {
    console.log(`✅ [API SUCCESS V6.0] ${message}`, data || '');
}

// =================== ✅ VALIDAÇÃO QUE PRESERVA ACENTOS ORIGINAIS ===================
function validarTimeline(prevAlta) {
    return window.TIMELINE_OPCOES.includes(prevAlta) ? prevAlta : 'SP';
}

function validarConcessoes(concessoes) {
    if (!Array.isArray(concessoes)) return [];
    
    return concessoes.filter(c => {
        const normalizada = normalizarTexto(c);
        return window.CONCESSOES_VALIDAS.includes(normalizada);
    });
}

function validarLinhas(linhas) {
    if (!Array.isArray(linhas)) return [];
    
    return linhas.filter(l => {
        const normalizada = normalizarTexto(l);
        return window.LINHAS_VALIDAS.includes(normalizada);
    });
}

function validarIsolamento(isolamento) {
    if (!isolamento || typeof isolamento !== 'string') {
        return 'Não Isolamento';
    }
    
    const isolamentoNormalizado = isolamento.trim();
    const isolamentoLower = isolamentoNormalizado.toLowerCase();
    
    if (isolamentoLower === 'isolamento de contato' || 
        isolamentoLower === 'isolamento contato') {
        return 'Isolamento de Contato';
    }
    
    if (isolamentoLower === 'isolamento respiratório' || 
        isolamentoLower === 'isolamento respiratorio') {
        return 'Isolamento Respiratório';
    }
    
    if (isolamentoLower === 'não isolamento' || 
        isolamentoLower === 'nao isolamento') {
        return 'Não Isolamento';
    }
    
    if (window.ISOLAMENTO_OPCOES.includes(isolamentoNormalizado)) {
        return isolamentoNormalizado;
    }
    
    return 'Não Isolamento';
}

function validarIdentificacaoLeito(identificacao) {
    if (identificacao === null || identificacao === undefined) return '';
    const identificacaoStr = String(identificacao).trim();
    if (identificacaoStr === '') return '';
    
    if (identificacaoStr.length > 10) {
        console.warn(`⚠️ Identificação "${identificacaoStr}" excede 10 caracteres, truncando...`);
        return identificacaoStr.substring(0, 10).toUpperCase();
    }
    
    return identificacaoStr.toUpperCase();
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

function validarDiretivas(diretiva) {
    return window.DIRETIVAS_OPCOES.includes(diretiva) ? diretiva : 'Não se aplica';
}

function getCorConcessao(concessao) {
    const normalizada = normalizarTexto(concessao);
    return window.CORES_CONCESSOES[normalizada] || '#999999';
}

function getCorLinha(linha) {
    const normalizada = normalizarTexto(linha);
    return window.CORES_LINHAS[normalizada] || '#999999';
}

// =================== JSONP ===================
function jsonpRequest(url, params = {}) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            resolve(data);
        };
        
        const urlObj = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlObj.searchParams.append(key, String(params[key]));
            }
        });
        urlObj.searchParams.append('callback', callbackName);
        
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
        }, 20000);
        
        setTimeout(() => {
            document.head.appendChild(script);
        }, 100);
    });
}

// =================== API REQUEST ===================
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
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
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

// =================== CARREGAMENTO DE DADOS ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados V6.0 da planilha (11 hospitais - 341 leitos - 76 colunas)...');
        
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script V6.0...');
        }
        
        const apiData = await apiRequest('all', {}, 'GET');
        
        if (!apiData || typeof apiData !== 'object') {
            throw new Error('API V6.0 retornou dados inválidos');
        }
        
        window.hospitalData = {};
        
        if (apiData.H1 && apiData.H1.leitos) {
            logAPI('Dados V6.0 recebidos em formato agrupado');
            window.hospitalData = apiData;
        } 
        else if (Array.isArray(apiData)) {
            logAPI('Dados V6.0 recebidos em formato flat - convertendo...');
            apiData.forEach(leito => {
                const hospitalId = leito.hospital;
                if (!window.hospitalData[hospitalId]) {
                    window.hospitalData[hospitalId] = { leitos: [] };
                }
                window.hospitalData[hospitalId].leitos.push(leito);
            });
        }
        else {
            throw new Error('Formato de dados da API V6.0 não reconhecido');
        }
        
        const totalHospitais = Object.keys(window.hospitalData).length;
        if (totalHospitais === 0) {
            throw new Error('Nenhum hospital encontrado nos dados da API V6.0');
        }
        
        if (totalHospitais < 9) {
            console.warn(`⚠️ AVISO: Esperados 9+ hospitais, mas foram encontrados ${totalHospitais}`);
        }
        
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital && hospital.leitos) {
                hospital.leitos = hospital.leitos.map(leito => {
                    if (leito.status === 'Em uso') leito.status = 'ocupado';
                    if (leito.status === 'Ocupado') leito.status = 'ocupado';
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
                        leito.categoria = leito.categoriaEscolhida;
                    } else {
                        leito.categoriaEscolhida = '';
                        leito.categoria = '';
                    }
                    
                    if (leito.diretivas) {
                        leito.diretivas = validarDiretivas(leito.diretivas);
                    } else {
                        leito.diretivas = 'Não se aplica';
                    }
                    
                    if (!leito.anotacoes) {
                        leito.anotacoes = '';
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
                            diretivas: leito.diretivas,
                            anotacoes: leito.anotacoes
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
        
        if (totalLeitos < 300) {
            console.warn(`⚠️ AVISO: Esperados 341 leitos, mas foram encontrados ${totalLeitos}`);
        }
        
        let totalConcessoes = 0;
        let totalLinhas = 0;
        let leitosComIsolamento = 0;
        let leitosComIdentificacao = 0;
        let leitosComGenero = 0;
        let leitosComRegiao = 0;
        let leitosComCategoria = 0;
        let leitosComDiretivas = 0;
        let leitosComAnotacoes = 0;
        
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
                if (leito.diretivas && leito.diretivas !== 'Não se aplica') {
                    leitosComDiretivas++;
                }
                if (leito.anotacoes) {
                    leitosComAnotacoes++;
                }
            });
        });
        
        logAPISuccess(`✅ Dados V6.0 carregados da planilha (76 colunas A-BX):`);
        logAPISuccess(`• ${totalHospitais} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        logAPISuccess(`• ${totalConcessoes} concessões ativas (12 tipos)`);
        logAPISuccess(`• ${totalLinhas} linhas de cuidado ativas (45 tipos)`);
        logAPISuccess(`• ${leitosComIsolamento} leitos com isolamento (AR)`);
        logAPISuccess(`• ${leitosComIdentificacao} leitos com identificação (AQ)`);
        logAPISuccess(`• ${leitosComGenero} leitos com gênero (BS/70)`);
        logAPISuccess(`• ${leitosComRegiao} leitos com região (BT/71)`);
        logAPISuccess(`• ${leitosComCategoria} leitos com categoria (BU/72)`);
        logAPISuccess(`• ${leitosComDiretivas} leitos com diretivas (BV/73)`);
        logAPISuccess(`• ${leitosComAnotacoes} leitos com anotações (BX/75)`);
        
        window.lastAPICall = Date.now();
        
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        return window.hospitalData;
        
    } catch (error) {
        logAPIError('❌ ERRO ao carregar dados V6.0:', error.message);
        
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== ✅ ADMITIR PACIENTE (PRESERVA ACENTOS) ===================
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente V6.0 no ${hospital}-${leito} (76 colunas)`);
        
        const concessoesValidas = validarConcessoes(dadosPaciente.concessoes || []);
        const linhasValidas = validarLinhas(dadosPaciente.linhas || []);
        const timelineValida = validarTimeline(dadosPaciente.prevAlta || 'SP');
        const isolamentoValido = validarIsolamento(dadosPaciente.isolamento || 'Não Isolamento');
        const generoValido = validarGenero(dadosPaciente.genero || '');
        const regiaoValida = validarRegiao(dadosPaciente.regiao || '');
        const categoriaValida = validarCategoriaEscolhida(dadosPaciente.categoriaEscolhida || '');
        const diretivasValida = validarDiretivas(dadosPaciente.diretivas || 'Não se aplica');
        
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
            diretivas: diretivasValida,
            anotacoes: dadosPaciente.anotacoes || ''
        };
        
        logAPI('Payload V6.0 validado:', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento,
            identificacaoLeito: payload.identificacaoLeito || 'vazio',
            genero: payload.genero || 'vazio',
            regiao: payload.regiao || 'vazio',
            categoria: payload.categoriaEscolhida || 'vazio',
            diretivas: payload.diretivas,
            anotacoes: payload.anotacoes ? `${payload.anotacoes.length} chars` : 'vazio'
        });
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess(`✅ Paciente admitido V6.0!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente V6.0:', error.message);
        throw error;
    }
};

// =================== ✅ ATUALIZAR PACIENTE (PRESERVA ACENTOS) ===================
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente V6.0 ${hospital}-${leito} (76 colunas)`);
        
        const concessoesValidas = validarConcessoes(dadosAtualizados.concessoes || []);
        const linhasValidas = validarLinhas(dadosAtualizados.linhas || []);
        const timelineValida = dadosAtualizados.prevAlta ? validarTimeline(dadosAtualizados.prevAlta) : '';
        const isolamentoValido = dadosAtualizados.isolamento ? validarIsolamento(dadosAtualizados.isolamento) : '';
        const generoValido = dadosAtualizados.genero ? validarGenero(dadosAtualizados.genero) : '';
        const regiaoValida = dadosAtualizados.regiao ? validarRegiao(dadosAtualizados.regiao) : '';
        const categoriaValida = dadosAtualizados.categoriaEscolhida ? validarCategoriaEscolhida(dadosAtualizados.categoriaEscolhida) : '';
        const diretivasValida = dadosAtualizados.diretivas ? validarDiretivas(dadosAtualizados.diretivas) : '';
        
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
            diretivas: diretivasValida,
            anotacoes: dadosAtualizados.anotacoes !== undefined ? dadosAtualizados.anotacoes : ''
        };
        
        logAPI('Payload V6.0 atualização validado:', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento || 'não alterado',
            identificacaoLeito: payload.identificacaoLeito || 'não alterado',
            genero: payload.genero || 'não alterado',
            regiao: payload.regiao || 'não alterado',
            categoria: payload.categoriaEscolhida || 'não alterado',
            diretivas: payload.diretivas || 'não alterado',
            anotacoes: payload.anotacoes ? `${payload.anotacoes.length} chars` : 'não alterado'
        });
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V6.0 atualizado!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente V6.0:', error.message);
        throw error;
    }
};

// =================== DAR ALTA ===================
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta V6.0 ao paciente ${hospital}-${leito}`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta V6.0 processada (76 colunas limpas)!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao processar alta V6.0:', error.message);
        throw error;
    }
};

// =================== COLETAR DADOS FORMULÁRIO ===================
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
        diretivas: document.getElementById(`${tipo}Diretivas`)?.value || 'Não se aplica',
        anotacoes: document.getElementById(`${tipo}Anotacoes`)?.value || ''
    };
    
    document.querySelectorAll(`input[name="${tipo}Concessoes"]:checked`).forEach(checkbox => {
        dados.concessoes.push(checkbox.value);
    });
    
    document.querySelectorAll(`input[name="${tipo}Linhas"]:checked`).forEach(checkbox => {
        dados.linhas.push(checkbox.value);
    });
    
    logAPI(`Dados V6.0 coletados do formulário:`, {
        isolamento: dados.isolamento,
        identificacaoLeito: dados.identificacaoLeito || 'vazio',
        genero: dados.genero || 'vazio',
        regiao: dados.regiao || 'vazio',
        categoria: dados.categoriaEscolhida || 'vazio',
        diretivas: dados.diretivas,
        anotacoes: dados.anotacoes ? `${dados.anotacoes.length} chars` : 'vazio',
        concessoes: dados.concessoes.length,
        linhas: dados.linhas.length
    });
    
    return dados;
};

// =================== ✅ PARSE DADOS (MANTER ACENTOS) ===================
window.parseLeitoData = function(leito) {
    if (!leito) return null;
    
    const dados = {
        hospital: leito.hospital,
        leito: leito.leito,
        tipo: leito.tipo,
        status: leito.status,
        nome: leito.nome,
        matricula: leito.matricula,
        idade: leito.idade,
        admAt: leito.admAt,
        pps: leito.pps,
        spict: leito.spict,
        complexidade: leito.complexidade,
        prevAlta: leito.prevAlta,
        concessoes: Array.isArray(leito.concessoes) ? leito.concessoes : [],
        linhas: Array.isArray(leito.linhas) ? leito.linhas : [],
        identificacaoLeito: leito.identificacaoLeito,
        isolamento: leito.isolamento,
        genero: leito.genero,
        regiao: leito.regiao,
        categoriaEscolhida: leito.categoriaEscolhida,
        diretivas: leito.diretivas,
        anotacoes: leito.anotacoes || ''
    };
    
    return dados;
};

// =================== REFRESH ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados V6.0 após ação...');
        
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #1a1f2e; border-radius: 12px;">
                    <div style="color: #60a5fa; margin-bottom: 15px; font-size: 18px;">
                        🔄 Sincronizando V6.0 (11 hospitais - 341 leitos - 76 colunas)...
                    </div>
                    <div style="color: #9ca3af; font-size: 14px;">
                        Atualizando dados
                    </div>
                </div>
            `;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await window.loadHospitalData();
        
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
                logAPISuccess('✅ Interface V6.0 atualizada!');
            }
        }, 500);
        
    } catch (error) {
        logAPIError('Erro ao refresh V6.0:', error.message);
        
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== FUNÇÕES AUXILIARES ===================
window.testAPI = async function() {
    try {
        logAPI('🔍 Testando conectividade V6.0...');
        
        const result = await apiRequest('test', {}, 'GET');
        
        if (result) {
            logAPISuccess('✅ API V6.0 funcionando!', result);
            return { status: 'ok', data: result };
        } else {
            throw new Error('API V6.0 não retornou dados válidos');
        }
        
    } catch (error) {
        logAPIError('❌ Erro na conectividade V6.0:', error.message);
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
                logAPI('🔄 Refresh automático V6.0...');
                await window.loadHospitalData();
                
                if (window.currentView === 'leitos' && window.renderCards) {
                    setTimeout(() => window.renderCards(), 1000);
                }
            }
        } catch (error) {
            logAPIError('Erro no monitoramento V6.0:', error.message);
        }
    }, 60000);
    
    logAPI('🔍 Monitoramento V6.0 ativado');
};

window.fetchHospitalData = async function(hospital) {
    logAPI(`Buscando dados V6.0 do hospital: ${hospital}`);
    
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
        logAPIError(`Erro ao buscar leito V6.0 ${hospital}-${leito}:`, error.message);
        return null;
    }
};

window.loadColors = async function() {
    try {
        const colors = await apiRequest('getcolors', {}, 'GET');
        if (colors && typeof colors === 'object') {
            Object.entries(colors).forEach(([property, value]) => {
                if (property.startsWith('--') || property.startsWith('-')) {
                    document.documentElement.style.setProperty(property, value);
                }
            });
            logAPISuccess('✅ Cores V6.0 carregadas');
            return colors;
        }
    } catch (error) {
        logAPIError('Erro ao carregar cores V6.0:', error.message);
    }
    return null;
};

window.saveColors = async function(colors) {
    try {
        const result = await apiRequest('savecolors', { colors: colors }, 'POST');
        logAPISuccess('✅ Cores V6.0 salvas');
        return result;
    } catch (error) {
        logAPIError('Erro ao salvar cores V6.0:', error.message);
        throw error;
    }
};

// =================== INICIALIZAÇÃO ===================
window.addEventListener('load', () => {
    logAPI('🚀 API.js V6.0 COMPLETO carregado');
    logAPI(`🏥 Hospitais: 11 (9 ativos + 2 reservas)`);
    logAPI(`🛏️  Leitos: 341 totais`);
    logAPI(`🔗 URL: ${window.API_URL}`);
    logAPI(`📋 Colunas: 76 (A-BX)`);
    logAPI(`🎁 Concessões: 12 tipos`);
    logAPI(`🏥 Linhas: 45 tipos`);
    logAPI(`⏱️  Timeline: ${window.TIMELINE_OPCOES.length} opções`);
    logAPI(`📄 Anotações: Campo livre 800 chars (BX/75)`);
    
    logAPISuccess('✅ Hospitais V6.0:');
    Object.entries(window.HOSPITAIS_CONFIG).forEach(([id, config]) => {
        logAPI(`   ${id}: ${config.nome} (${config.leitos} leitos)`);
    });
    
    setTimeout(() => {
        if (window.monitorAPI) {
            window.monitorAPI();
        }
    }, 10000);
});

logAPISuccess('✅ API.js V6.0 100% FUNCIONAL');
logAPISuccess('✅ Nova URL configurada');
logAPISuccess('✅ 11 hospitais (9 ativos + 2 reservas)');
logAPISuccess('✅ 341 leitos totais');
logAPISuccess('✅ 76 colunas (A-BX)');
logAPISuccess('✅ Campo anotações implementado');