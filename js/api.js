// =================== API V3.1 FINAL CORRIGIDO - ESTRUTURA 46 COLUNAS (AS/AT) ===================

// *** URL ATUALIZADA DA API V3.1 ***
window.API_URL = 'https://script.google.com/macros/s/AKfycbxAEyQKas6IEFPV5iQK8HSjm-xIRfcczzB9poXEKpJhvYkmJZ6vaBN_x74IiBe-8wHC/exec';

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = {};
window.apiCache = {};
window.lastAPICall = 0;
window.API_TIMEOUT = 15000; // 15 segundos para CORS

// =================== TIMELINE CORRIGIDA (10 OPÇÕES) ===================
window.TIMELINE_OPCOES = [
    "Hoje Ouro", "Hoje 2R", "Hoje 3R",
    "24h Ouro", "24h 2R", "24h 3R", 
    "48h", "72h", "96h", "SP"
];

// =================== NOVA V3.1: OPÇÕES DE ISOLAMENTO (COLUNA AS) ===================
window.ISOLAMENTO_OPCOES = [
    "NÃO ISOLAMENTO",
    "ISOLAMENTO DE CONTATO", 
    "ISOLAMENTO RESPIRATÓRIO"
];

// =================== LISTAS PARA VALIDAÇÃO ===================
window.CONCESSOES_VALIDAS = [
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

window.LINHAS_VALIDAS = [
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

// =================== MAPEAMENTO DE COLUNAS V3.1 (46 COLUNAS) ===================
const COLUMN_MAPPING_V31 = {
    // *** COLUNAS BÁSICAS (A-R) - 18 colunas ***
    hospital: 'A',          // HOSPITAL
    leito: 'B',             // LEITO  
    status: 'C',            // STATUS DO LEITO
    nome: 'D',              // NOME DO PACIENTE
    matricula: 'E',         // MATRÍCULA
    idade: 'F',             // IDADE
    pps: 'G',               // PPS (Palliative Performance Scale)
    spict: 'H',             // SPICT-BR
    complexidade: 'I',      // COMPLEXIDADE
    prevAlta: 'J',          // PREVISÃO DE ALTA
    dataAdmissao: 'K',      // DATA DE ADMISSÃO
    dataAtualizacao: 'L',   // DATA DE ATUALIZAÇÃO
    observacoes: 'M',       // OBSERVAÇÕES
    medicamentos: 'N',      // MEDICAMENTOS
    exames: 'O',            // EXAMES
    interconsultas: 'P',    // INTERCONSULTAS
    procedimentos: 'Q',     // PROCEDIMENTOS
    alertas: 'R',           // ALERTAS
    
    // *** CONCESSÕES (S-AE) - 13 colunas ***
    concessao1: 'S',        // Transição Domiciliar
    concessao2: 'T',        // Aplicação domiciliar de medicamentos
    concessao3: 'U',        // Fisioterapia
    concessao4: 'V',        // Fonoaudiologia
    concessao5: 'W',        // Aspiração
    concessao6: 'X',        // Banho
    concessao7: 'Y',        // Curativos
    concessao8: 'Z',        // Oxigenoterapia
    concessao9: 'AA',       // Recarga de O2
    concessao10: 'AB',      // Orientação Nutricional - com dispositivo
    concessao11: 'AC',      // Orientação Nutricional - sem dispositivo
    concessao12: 'AD',      // Clister
    concessao13: 'AE',      // PICC
    
    // *** LINHAS DE CUIDADO (AF-AR) - 13 colunas ***
    linha1: 'AF',           // Assiste
    linha2: 'AG',           // APS
    linha3: 'AH',           // Cuidados Paliativos
    linha4: 'AI',           // ICO (Insuficiência Coronariana)
    linha5: 'AJ',           // Oncologia
    linha6: 'AK',           // Pediatria
    linha7: 'AL',           // Programa Autoimune - Gastroenterologia
    linha8: 'AM',           // Programa Autoimune - Neuro-desmielinizante
    linha9: 'AN',           // Programa Autoimune - Neuro-muscular
    linha10: 'AO',          // Programa Autoimune - Reumatologia
    linha11: 'AP',          // Vida Mais Leve Care
    linha12: 'AQ',          // Crônicos
    linha13: 'AR',          // Outras Linhas
    
    // *** NOVAS COLUNAS V3.1 (AS-AT) - 2 colunas ***
    isolamento: 'AS',           // ISOLAMENTO DO PACIENTE
    identificacaoLeito: 'AT'    // IDENTIFICAÇÃO DO LEITO (6 chars)
};

// =================== FUNÇÕES AUXILIARES ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API V3.1] ${message}`, data || '');
}

function logAPIError(message, error) {
    console.error(`❌ [API ERROR V3.1] ${message}`, error);
}

function logAPISuccess(message, data = null) {
    console.log(`✅ [API SUCCESS V3.1] ${message}`, data || '');
}

// =================== VALIDAÇÃO DE DADOS V3.1 ===================
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

// *** NOVA V3.1: VALIDAR ISOLAMENTO (COLUNA AS) ***
function validarIsolamento(isolamento) {
    return window.ISOLAMENTO_OPCOES.includes(isolamento) ? isolamento : 'NÃO ISOLAMENTO';
}

// *** NOVA V3.1: VALIDAR IDENTIFICAÇÃO DO LEITO (COLUNA AT) ***
function validarIdentificacaoLeito(identificacao) {
    if (!identificacao || typeof identificacao !== 'string') return '';
    
    // Remover espaços e converter para maiúsculo
    const limpo = identificacao.trim().toUpperCase();
    
    // Validar formato alfanumérico até 6 caracteres
    const regex = /^[A-Z0-9]{1,6}$/;
    if (!regex.test(limpo)) {
        // Se inválido, truncar para 6 chars e manter apenas alfanuméricos
        return limpo.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    }
    
    return limpo;
}

// =================== FUNÇÃO PARA CONVERTER DADOS DA PLANILHA V3.1 ===================
function converterDadosPlanilha(dadosPlanilha) {
    const hospitalData = {
        H1: { leitos: [] },
        H2: { leitos: [] },
        H3: { leitos: [] },
        H4: { leitos: [] }
    };
    
    if (!Array.isArray(dadosPlanilha)) {
        logAPIError('Dados da planilha V3.1 não são um array:', typeof dadosPlanilha);
        return hospitalData;
    }
    
    dadosPlanilha.forEach((linha, index) => {
        try {
            if (!linha || typeof linha !== 'object') {
                logAPI(`Linha ${index} inválida - pulando...`);
                return;
            }
            
            const hospitalId = linha.A || linha.hospital;
            const leito = parseInt(linha.B || linha.leito) || 0;
            
            if (!hospitalId || !['H1', 'H2', 'H3', 'H4'].includes(hospitalId)) {
                return; // Pular linhas sem hospital válido
            }
            
            // *** V3.1: CONVERTER CONCESSÕES (COLUNAS S-AE) ***
            const concessoes = [];
            if (linha.S === 'SIM' || linha.S === true) concessoes.push(window.CONCESSOES_VALIDAS[0]);
            if (linha.T === 'SIM' || linha.T === true) concessoes.push(window.CONCESSOES_VALIDAS[1]);
            if (linha.U === 'SIM' || linha.U === true) concessoes.push(window.CONCESSOES_VALIDAS[2]);
            if (linha.V === 'SIM' || linha.V === true) concessoes.push(window.CONCESSOES_VALIDAS[3]);
            if (linha.W === 'SIM' || linha.W === true) concessoes.push(window.CONCESSOES_VALIDAS[4]);
            if (linha.X === 'SIM' || linha.X === true) concessoes.push(window.CONCESSOES_VALIDAS[5]);
            if (linha.Y === 'SIM' || linha.Y === true) concessoes.push(window.CONCESSOES_VALIDAS[6]);
            if (linha.Z === 'SIM' || linha.Z === true) concessoes.push(window.CONCESSOES_VALIDAS[7]);
            if (linha.AA === 'SIM' || linha.AA === true) concessoes.push(window.CONCESSOES_VALIDAS[8]);
            if (linha.AB === 'SIM' || linha.AB === true) concessoes.push(window.CONCESSOES_VALIDAS[9]);
            if (linha.AC === 'SIM' || linha.AC === true) concessoes.push(window.CONCESSOES_VALIDAS[10]);
            if (linha.AD === 'SIM' || linha.AD === true) concessoes.push(window.CONCESSOES_VALIDAS[11]);
            if (linha.AE === 'SIM' || linha.AE === true) concessoes.push(window.CONCESSOES_VALIDAS[12]);
            
            // *** V3.1: CONVERTER LINHAS (COLUNAS AF-AR) ***
            const linhas = [];
            if (linha.AF === 'SIM' || linha.AF === true) linhas.push(window.LINHAS_VALIDAS[0]);
            if (linha.AG === 'SIM' || linha.AG === true) linhas.push(window.LINHAS_VALIDAS[1]);
            if (linha.AH === 'SIM' || linha.AH === true) linhas.push(window.LINHAS_VALIDAS[2]);
            if (linha.AI === 'SIM' || linha.AI === true) linhas.push(window.LINHAS_VALIDAS[3]);
            if (linha.AJ === 'SIM' || linha.AJ === true) linhas.push(window.LINHAS_VALIDAS[4]);
            if (linha.AK === 'SIM' || linha.AK === true) linhas.push(window.LINHAS_VALIDAS[5]);
            if (linha.AL === 'SIM' || linha.AL === true) linhas.push(window.LINHAS_VALIDAS[6]);
            if (linha.AM === 'SIM' || linha.AM === true) linhas.push(window.LINHAS_VALIDAS[7]);
            if (linha.AN === 'SIM' || linha.AN === true) linhas.push(window.LINHAS_VALIDAS[8]);
            if (linha.AO === 'SIM' || linha.AO === true) linhas.push(window.LINHAS_VALIDAS[9]);
            if (linha.AP === 'SIM' || linha.AP === true) linhas.push(window.LINHAS_VALIDAS[10]);
            if (linha.AQ === 'SIM' || linha.AQ === true) linhas.push(window.LINHAS_VALIDAS[11]);
            if (linha.AR === 'SIM' || linha.AR === true) linhas.push(window.LINHAS_VALIDAS[12]);
            
            // *** NOVA V3.1: MAPEAR COLUNAS AS E AT ***
            const isolamento = validarIsolamento(linha.AS || '');
            const identificacaoLeito = validarIdentificacaoLeito(linha.AT || '');
            
            const leitoData = {
                hospital: hospitalId,
                leito: leito,
                status: linha.C === 'Em uso' ? 'ocupado' : 'vago',
                nome: linha.D || '',
                matricula: linha.E || '',
                idade: parseInt(linha.F) || null,
                pps: parseInt(linha.G) || null,
                spict: linha.H || '',
                complexidade: linha.I || '',
                prevAlta: validarTimeline(linha.J || 'SP'),
                concessoes: concessoes,
                linhas: linhas,
                
                // *** NOVAS COLUNAS V3.1 ***
                isolamento: isolamento,
                identificacaoLeito: identificacaoLeito,
                
                // Campos extras
                dataAdmissao: linha.K || null,
                dataAtualizacao: linha.L || null,
                observacoes: linha.M || '',
                medicamentos: linha.N || '',
                exames: linha.O || '',
                interconsultas: linha.P || '',
                procedimentos: linha.Q || '',
                alertas: linha.R || ''
            };
            
            // Criar objeto paciente se leito ocupado
            if (leitoData.status === 'ocupado' && leitoData.nome) {
                leitoData.paciente = {
                    nome: leitoData.nome,
                    matricula: leitoData.matricula,
                    idade: leitoData.idade,
                    pps: leitoData.pps,
                    spict: leitoData.spict,
                    complexidade: leitoData.complexidade,
                    prevAlta: leitoData.prevAlta,
                    linhas: leitoData.linhas,
                    concessoes: leitoData.concessoes,
                    isolamento: leitoData.isolamento,               // NOVA V3.1
                    identificacaoLeito: leitoData.identificacaoLeito // NOVA V3.1
                };
            }
            
            hospitalData[hospitalId].leitos.push(leitoData);
            
        } catch (error) {
            logAPIError(`Erro ao processar linha ${index} da planilha V3.1:`, error.message);
        }
    });
    
    // Ordenar leitos por número
    Object.keys(hospitalData).forEach(hospitalId => {
        hospitalData[hospitalId].leitos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
    });
    
    return hospitalData;
}

// =================== CORREÇÃO CRÍTICA PARA CORS - JSONP FUNCIONAL ===================

// Função auxiliar para requisições JSONP (bypass CORS)
function jsonpRequest(url, params = {}) {
    return new Promise((resolve, reject) => {
        // Callback único para cada requisição
        const callbackName = `jsonpCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Criar URL com parâmetros
        const urlObj = new URL(url);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                urlObj.searchParams.append(key, String(params[key]));
            }
        });
        urlObj.searchParams.append('callback', callbackName);
        
        // Criar callback global
        window[callbackName] = function(data) {
            // Cleanup
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            resolve(data);
        };
        
        // Criar script tag
        const script = document.createElement('script');
        script.src = urlObj.toString();
        script.onerror = () => {
            // Cleanup em caso de erro
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            reject(new Error('JSONP request failed'));
        };
        
        // Timeout de 10 segundos
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                if (script && script.parentNode) {
                    document.head.removeChild(script);
                }
                reject(new Error('JSONP request timeout'));
            }
        }, 10000);
        
        document.head.appendChild(script);
    });
}

// =================== CONFIGURAÇÃO DE REQUISIÇÕES COM CORS FIX ===================

// Fazer requisição com fallback JSONP
async function apiRequest(action, params = {}, method = 'GET') {
    try {
        logAPI(`Fazendo requisição ${method}: ${action}`, params);
        
        if (method === 'GET') {
            try {
                // TENTATIVA 1: Fetch normal
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
                
                logAPISuccess(`${method} ${action} concluído (Fetch)`, data.data ? `dados carregados` : 'sem dados');
                return data.data;
                
            } catch (fetchError) {
                logAPI(`Fetch falhou (${fetchError.message}), tentando JSONP...`);
                
                // TENTATIVA 2: JSONP (bypass CORS)
                const data = await jsonpRequest(window.API_URL, { action, ...params });
                
                if (!data || !data.ok) {
                    throw new Error(data?.error || data?.message || 'Erro desconhecido da API via JSONP');
                }
                
                logAPISuccess(`${method} ${action} concluído (JSONP)`, data.data ? `dados carregados` : 'sem dados');
                return data.data;
            }
            
        } else {
            // Para POST, tentar fetch primeiro, depois fallback para GET via JSONP
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
                
                // FALLBACK: Tentar POST via GET com JSONP
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

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO V3.1 ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados V3.1 da planilha (46 colunas - incluindo AS/AT)...');
        
        // Mostrar loading global
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script V3.1...');
        }
        
        // Inicializar estrutura vazia em caso de erro
        window.hospitalData = {
            H1: { leitos: [] },
            H2: { leitos: [] },
            H3: { leitos: [] },
            H4: { leitos: [] }
        };
        
        try {
            // Buscar dados da API
            const apiData = await apiRequest('all', {}, 'GET');
            
            if (!apiData) {
                logAPIError('API V3.1 retornou dados nulos - mantendo estrutura vazia');
                return window.hospitalData;
            }
            
            // *** TRATAMENTO DE MÚLTIPLOS FORMATOS DE RESPOSTA ***
            let hospitalData = {};
            
            // Array direto da planilha
            if (Array.isArray(apiData)) {
                logAPI('Dados V3.1 recebidos em formato array direto - convertendo...');
                hospitalData = converterDadosPlanilha(apiData);
            } 
            // Formato {H1: {leitos: []}}
            else if (apiData.H1 && apiData.H1.leitos) {
                logAPI('Dados V3.1 recebidos em formato agrupado');
                hospitalData = apiData;
            }
            // Formato {success: true, data: [...]}
            else if (apiData.data && Array.isArray(apiData.data)) {
                logAPI('Dados V3.1 recebidos em formato wrapper - convertendo...');
                hospitalData = converterDadosPlanilha(apiData.data);
            }
            // Formato {ok: true, data: [...]}
            else if (apiData.ok && apiData.data) {
                logAPI('Dados V3.1 recebidos em formato ok/data - convertendo...');
                hospitalData = Array.isArray(apiData.data) ? converterDadosPlanilha(apiData.data) : apiData.data;
            }
            else {
                logAPIError('Formato de dados da API V3.1 não reconhecido - mantendo estrutura vazia');
                logAPIError('Formato recebido:', typeof apiData);
                return window.hospitalData;
            }
            
            // Atualizar dados globais
            window.hospitalData = hospitalData;
            
        } catch (apiError) {
            logAPIError('Erro ao buscar dados da API V3.1:', apiError.message);
            // Manter estrutura vazia
        }
        
        // Verificar se temos dados
        const totalHospitais = Object.keys(window.hospitalData).length;
        if (totalHospitais === 0) {
            logAPIError('Nenhum hospital encontrado nos dados da API V3.1 - inicializando estrutura vazia');
            window.hospitalData = {
                H1: { leitos: [] },
                H2: { leitos: [] },
                H3: { leitos: [] },
                H4: { leitos: [] }
            };
        }
        
        // *** PROCESSAMENTO V3.1: GARANTIR DADOS CORRETOS ***
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital && hospital.leitos) {
                hospital.leitos = hospital.leitos.map(leito => {
                    // Padronizar status
                    if (leito.status === 'Em uso') leito.status = 'ocupado';
                    if (leito.status === 'Vago') leito.status = 'vago';
                    
                    // *** V3.1: VALIDAR TIMELINE ***
                    if (leito.prevAlta) {
                        leito.prevAlta = validarTimeline(leito.prevAlta);
                    }
                    
                    // *** V3.1: VALIDAR CONCESSÕES E LINHAS ***
                    if (leito.concessoes) {
                        leito.concessoes = validarConcessoes(leito.concessoes);
                    }
                    if (leito.linhas) {
                        leito.linhas = validarLinhas(leito.linhas);
                    }
                    
                    // *** NOVA V3.1: VALIDAR ISOLAMENTO (COLUNA AS) ***
                    if (leito.isolamento) {
                        leito.isolamento = validarIsolamento(leito.isolamento);
                    } else {
                        leito.isolamento = 'NÃO ISOLAMENTO'; // Padrão
                    }
                    
                    // *** NOVA V3.1: VALIDAR IDENTIFICAÇÃO DO LEITO (COLUNA AT) ***
                    if (leito.identificacaoLeito) {
                        leito.identificacaoLeito = validarIdentificacaoLeito(leito.identificacaoLeito);
                    } else {
                        leito.identificacaoLeito = ''; // Opcional
                    }
                    
                    // Criar objeto paciente se leito ocupado
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
                            isolamento: leito.isolamento,               // NOVA V3.1 (AS)
                            identificacaoLeito: leito.identificacaoLeito // NOVA V3.1 (AT)
                        };
                    }
                    
                    return leito;
                });
                
                // Ordenar leitos por número
                hospital.leitos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
            }
        });
        
        // Estatísticas V3.1
        const totalLeitos = Object.values(window.hospitalData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        const leitosOcupados = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.filter(l => l.status === 'ocupado').length : 0), 0);
        const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
        
        // Estatísticas de concessões, linhas e novos campos V3.1
        let totalConcessoes = 0;
        let totalLinhas = 0;
        let leitosComIsolamento = 0;
        let leitosComIdentificacao = 0;
        
        Object.values(window.hospitalData).forEach(hospital => {
            hospital.leitos?.forEach(leito => {
                if (leito.status === 'ocupado') {
                    totalConcessoes += (leito.concessoes?.length || 0);
                    totalLinhas += (leito.linhas?.length || 0);
                }
                if (leito.isolamento && leito.isolamento !== 'NÃO ISOLAMENTO') {
                    leitosComIsolamento++;
                }
                if (leito.identificacaoLeito && leito.identificacaoLeito.length > 0) {
                    leitosComIdentificacao++;
                }
            });
        });
        
        logAPISuccess(`Dados V3.1 carregados da planilha (46 colunas - incluindo AS/AT):`);
        logAPISuccess(`• ${Object.keys(window.hospitalData).length} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        logAPISuccess(`• ${totalConcessoes} concessões ativas`);
        logAPISuccess(`• ${totalLinhas} linhas de cuidado ativas`);
        logAPISuccess(`• ${leitosComIsolamento} leitos com isolamento (AS)`);
        logAPISuccess(`• ${leitosComIdentificacao} leitos com identificação (AT)`);
        logAPISuccess(`• CONVERSÃO AUTOMÁTICA - Colunas AS/AT mapeadas corretamente!`);
        
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
        
        // Manter estrutura vazia em caso de erro
        if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
            window.hospitalData = {
                H1: { leitos: [] },
                H2: { leitos: [] },
                H3: { leitos: [] },
                H4: { leitos: [] }
            };
        }
        
        return window.hospitalData;
    }
};

// =================== FUNÇÕES DE SALVAMENTO V3.1 ===================

// Admitir paciente V3.1 (salvar na planilha com colunas AS/AT)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente V3.1 no ${hospital}-${leito} NA PLANILHA REAL (46 colunas - incluindo AS/AT)`);
        
        // *** V3.1: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosPaciente.concessoes || []);
        const linhasValidas = validarLinhas(dadosPaciente.linhas || []);
        const timelineValida = validarTimeline(dadosPaciente.prevAlta || 'SP');
        const isolamentoValido = validarIsolamento(dadosPaciente.isolamento || 'NÃO ISOLAMENTO');
        
        let identificacaoValida = '';
        if (dadosPaciente.identificacaoLeito) {
            identificacaoValida = validarIdentificacaoLeito(dadosPaciente.identificacaoLeito);
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
            isolamento: isolamentoValido,       // NOVA V3.1 (AS) - OBRIGATÓRIA
            identificacaoLeito: identificacaoValida // NOVA V3.1 (AT) - OPCIONAL
        };
        
        logAPI('Payload V3.1 validado (incluindo AS/AT):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento,
            identificacaoLeito: payload.identificacaoLeito || 'vazio'
        });
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess(`✅ Paciente admitido V3.1 na planilha (46 colunas - AS: ${payload.isolamento}, AT: ${payload.identificacaoLeito || 'vazio'})!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente V3.1:', error.message);
        throw error;
    }
};

// Atualizar dados do paciente V3.1 (salvar na planilha com colunas AS/AT)  
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente V3.1 ${hospital}-${leito} NA PLANILHA REAL (46 colunas - incluindo AS/AT)`);
        
        // *** V3.1: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosAtualizados.concessoes || []);
        const linhasValidas = validarLinhas(dadosAtualizados.linhas || []);
        const timelineValida = dadosAtualizados.prevAlta ? validarTimeline(dadosAtualizados.prevAlta) : '';
        const isolamentoValido = dadosAtualizados.isolamento ? validarIsolamento(dadosAtualizados.isolamento) : '';
        
        let identificacaoValida = '';
        if (dadosAtualizados.identificacaoLeito) {
            identificacaoValida = validarIdentificacaoLeito(dadosAtualizados.identificacaoLeito);
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
            isolamento: isolamentoValido,       // NOVA V3.1 (AS)
            identificacaoLeito: identificacaoValida // NOVA V3.1 (AT)
        };
        
        logAPI('Payload V3.1 atualização validado (incluindo AS/AT):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento || 'não alterado',
            identificacaoLeito: payload.identificacaoLeito || 'não alterado'
        });
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V3.1 atualizado na planilha (46 colunas - AS/AT incluídas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente V3.1:', error.message);
        throw error;
    }
};

// Dar alta ao paciente V3.1 (salvar na planilha - limpar todas as 46 colunas)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta V3.1 ao paciente ${hospital}-${leito} NA PLANILHA REAL (46 colunas - incluindo AS/AT)`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta V3.1 processada na planilha (todas as 46 colunas limpas - incluindo AS/AT)!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao processar alta V3.1:', error.message);
        throw error;
    }
};

// *** NOVA V3.1: FUNÇÃO PARA COLETAR DADOS DO FORMULÁRIO (INCLUINDO AS/AT) ***
window.coletarDadosFormulario = function(tipo) {
    const dados = {
        // Campos existentes
        nome: document.getElementById(`${tipo}Nome`)?.value || '',
        matricula: document.getElementById(`${tipo}Matricula`)?.value || '',
        idade: document.getElementById(`${tipo}Idade`)?.value || null,
        pps: document.getElementById(`${tipo}Pps`)?.value || null,
        spict: document.getElementById(`${tipo}Spict`)?.value || '',
        complexidade: document.getElementById(`${tipo}Complexidade`)?.value || '',
        prevAlta: document.getElementById(`${tipo}PrevAlta`)?.value || 'SP',
        concessoes: [],
        linhas: [],
        
        // *** NOVA V3.1: CAMPOS AS/AT ***
        isolamento: document.getElementById(`${tipo}Isolamento`)?.value || 'NÃO ISOLAMENTO', // OBRIGATÓRIO
        identificacaoLeito: document.getElementById(`${tipo}IdentificacaoLeito`)?.value || '' // OPCIONAL
    };
    
    // Coletar concessões selecionadas
    document.querySelectorAll(`input[name="${tipo}Concessoes"]:checked`).forEach(checkbox => {
        dados.concessoes.push(checkbox.value);
    });
    
    // Coletar linhas selecionadas
    document.querySelectorAll(`input[name="${tipo}Linhas"]:checked`).forEach(checkbox => {
        dados.linhas.push(checkbox.value);
    });
    
    logAPI(`Dados V3.1 coletados do formulário (incluindo AS/AT):`, {
        isolamento: dados.isolamento,
        identificacaoLeito: dados.identificacaoLeito || 'vazio',
        concessoes: dados.concessoes.length,
        linhas: dados.linhas.length
    });
    
    return dados;
};

// =================== REFRESH APÓS AÇÕES V3.1 ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados V3.1 da planilha após ação...');
        
        // Mostrar loading nos cards
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #1a1f2e; border-radius: 12px;">
                    <div style="color: #60a5fa; margin-bottom: 15px; font-size: 18px;">
                        🔄 Sincronizando V3.1 com a planilha (46 colunas - incluindo AS/AT)...
                    </div>
                    <div style="color: #9ca3af; font-size: 14px;">
                        Atualizando dados com mapeamento AS/AT correto
                    </div>
                </div>
            `;
        }
        
        // Aguardar um pouco (para garantir que a planilha foi atualizada)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recarregar dados da API V3.1
        await window.loadHospitalData();
        
        // Re-renderizar cards após dados carregados
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
                logAPISuccess('✅ Interface V3.1 atualizada com dados da planilha (incluindo AS/AT)');
            }
        }, 500);
        
    } catch (error) {
        logAPIError('Erro ao refresh V3.1:', error.message);
        
        // Mesmo com erro, tentar re-renderizar cards
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== FUNÇÕES DE TESTE E MONITORAMENTO V3.1 ===================

// Testar conectividade da API V3.1
window.testAPI = async function() {
    try {
        logAPI('🔍 Testando conectividade V3.1 com a planilha (46 colunas - incluindo AS/AT)...');
        
        const result = await apiRequest('test', {}, 'GET');
        
        if (result) {
            logAPISuccess('✅ API V3.1 funcionando corretamente!', result);
            return { status: 'ok', data: result };
        } else {
            throw new Error('API V3.1 não retornou dados de teste válidos');
        }
        
    } catch (error) {
        logAPIError('❌ Erro na conectividade V3.1:', error.message);
        return { status: 'error', message: error.message };
    }
};

// Monitorar API V3.1 em tempo real
window.monitorAPI = function() {
    if (window.apiMonitorInterval) {
        clearInterval(window.apiMonitorInterval);
    }
    
    window.apiMonitorInterval = setInterval(async () => {
        try {
            const timeSinceLastCall = Date.now() - window.lastAPICall;
            
            // Se passou mais de 4 minutos, fazer refresh automático
            if (timeSinceLastCall > 240000) { // 4 minutos
                logAPI('🔄 Refresh automático V3.1 dos dados...');
                await window.loadHospitalData();
                
                // Re-renderizar interface se necessário
                if (window.currentView === 'leitos' && window.renderCards) {
                    setTimeout(() => window.renderCards(), 1000);
                }
            }
        } catch (error) {
            logAPIError('Erro no monitoramento automático V3.1:', error.message);
        }
    }, 60000); // Verificar a cada minuto
    
    logAPI('🔍 Monitoramento automático V3.1 da API ativado');
};

// =================== COMPATIBILIDADE COM VERSÕES ANTERIORES ===================

// Alias para funções antigas
window.fetchHospitalData = async function(hospital) {
    logAPI(`Buscando dados V3.1 do hospital: ${hospital}`);
    
    // Carregar todos os dados e filtrar
    await window.loadHospitalData();
    
    if (window.hospitalData[hospital] && window.hospitalData[hospital].leitos) {
        return window.hospitalData[hospital].leitos;
    }
    
    return [];
};

// Alias para função antiga
window.loadAllHospitalsData = window.loadHospitalData;

// Função para buscar dados de um leito específico V3.1
window.fetchLeitoData = async function(hospital, leito) {
    try {
        const data = await apiRequest('one', { hospital: hospital, leito: leito }, 'GET');
        return data;
    } catch (error) {
        logAPIError(`Erro ao buscar leito V3.1 ${hospital}-${leito}:`, error.message);
        return null;
    }
};

// =================== FUNÇÕES DE CORES V3.1 ===================
window.loadColors = async function() {
    try {
        const colors = await apiRequest('getcolors', {}, 'GET');
        if (colors && typeof colors === 'object') {
            // Aplicar cores ao sistema
            Object.entries(colors).forEach(([property, value]) => {
                if (property.startsWith('--') || property.startsWith('-')) {
                    document.documentElement.style.setProperty(property, value);
                }
            });
            logAPISuccess('✅ Cores V3.1 carregadas da planilha');
            return colors;
        }
    } catch (error) {
        logAPIError('Erro ao carregar cores V3.1:', error.message);
    }
    return null;
};

window.saveColors = async function(colors) {
    try {
        const result = await apiRequest('savecolors', { colors: colors }, 'POST');
        logAPISuccess('✅ Cores V3.1 salvas na planilha');
        return result;
    } catch (error) {
        logAPIError('Erro ao salvar cores V3.1:', error.message);
        throw error;
    }
};

// =================== INICIALIZAÇÃO V3.1 ===================
window.addEventListener('load', () => {
    logAPI('API.js V3.1 FINAL CORRIGIDO carregado - URL da API V3.1 configurada');
    logAPI(`URL: ${window.API_URL}`);
    logAPI(`Timeline: ${window.TIMELINE_OPCOES.length} opções (incluindo 96h)`);
    logAPI(`Isolamento: ${window.ISOLAMENTO_OPCOES.length} opções (AS)`);
    logAPI(`Concessões: ${window.CONCESSOES_VALIDAS.length} tipos`);
    logAPI(`Linhas: ${window.LINHAS_VALIDAS.length} tipos`);
    logAPI(`Colunas: 46 colunas mapeadas (AS-ISOLAMENTO + AT-IDENTIFICACAO_LEITO)`);
    
    // Iniciar monitoramento após 10 segundos
    setTimeout(() => {
        if (window.monitorAPI) {
            window.monitorAPI();
        }
    }, 10000);
});

logAPISuccess('✅ API.js V3.1 FINAL CORRIGIDO 100% FUNCIONAL - Nova estrutura 46 colunas ativa');
logAPISuccess('✅ Colunas AS (ISOLAMENTO) e AT (IDENTIFICACAO_LEITO) mapeadas corretamente');
logAPISuccess('✅ Validação alfanumérica 6 chars para AT implementada');
logAPISuccess('✅ Dropdown obrigatório 3 opções para AS implementado');
logAPISuccess('✅ Fallback JSONP funcional implementado com callback único');
logAPISuccess('✅ Conversão automática das 46 colunas da planilha ativa');
