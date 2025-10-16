// =================== API V3.2 - NOVA ESTRUTURA 73 COLUNAS - COM BS/BT/BU ===================

// *** URL DA API V3.2 ***
window.API_URL = 'https://script.google.com/macros/s/AKfycbxC9Gdvu3_mzXko0VjIYOFgtiH_Z_d8E9VXniUpBxyfaHRC1BHilyEuKhAtLnzmnusT/exec';

// =================== VARIÁVEIS GLOBAIS ===================
window.hospitalData = {};
window.apiCache = {};
window.lastAPICall = 0;
window.API_TIMEOUT = 15000; // 15 segundos

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

// =================== REGIÕES (9 OPÇÕES - COLUNA BT/72) ===================
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

// =================== LISTAS V3.2 ATUALIZADAS ===================

// *** CONCESSÕES: 11 ITENS (M-W checkboxes) ***
window.CONCESSOES_VALIDAS = [
    "Fisioterapia Domiciliar",
    "Fonoaudiologia Domiciliar",
    "Aspiração",
    "Banho",
    "Curativo",
    "Oxigenoterapia",
    "Recarga O2",
    "Orientação Nutricional Com Dispositivo",
    "Orientação Nutricional Sem Dispositivo",
    "Clister",
    "Curativo PICC"
];

// *** LINHAS DE CUIDADO: 45 ITENS (X-AP + AS-BR checkboxes) ***
window.LINHAS_VALIDAS = [
    "Assiste",
    "APS",
    "Cuidados Paliativos",
    "ICO",
    "Oncologia",
    "Pediatria",
    "Autoimune Gastro",
    "Autoimune Neuro Desm",
    "Autoimune Neuro Musc",
    "Autoimune Reumato",
    "Vida Mais Leve",
    "Cron Cardio",
    "Cron Endocrino",
    "Cron Geriatria",
    "Cron Melhor Cuid",
    "Cron Neuro",
    "Cron Pneumo",
    "Cron Pos Bariat",
    "Cron Reumato",
    "Cardiologia",
    "Cirurgia Geral",
    "Clinica Medica",
    "Dermatologia",
    "Endocrinologia",
    "Fisiatria",
    "Gastroenterologia",
    "Geriatria",
    "Gineco Obstetricia",
    "Hematologia",
    "Infectologia",
    "Nefrologia",
    "Neurologia",
    "Nutricao",
    "Odontologia",
    "Oftalmologia",
    "Ortopedia Traumato",
    "Otorrinolaringologia",
    "Pneumologia",
    "Proctologia",
    "Psiquiatria",
    "Urologia",
    "Psicologia",
    "Servico Social",
    "Terapia Ocupacional",
    "Farmacia Clinica"
];

// =================== FUNÇÕES AUXILIARES ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API V3.2] ${message}`, data || '');
}

function logAPIError(message, error) {
    console.error(`❌ [API ERROR V3.2] ${message}`, error);
}

function logAPISuccess(message, data = null) {
    console.log(`✅ [API SUCCESS V3.2] ${message}`, data || '');
}

// =================== VALIDAÇÃO DE DADOS V3.2 ===================
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

// *** VALIDAR ISOLAMENTO (COLUNA AR/44) ***
function validarIsolamento(isolamento) {
    return window.ISOLAMENTO_OPCOES.includes(isolamento) ? isolamento : 'Não Isolamento';
}

// *** VALIDAR IDENTIFICAÇÃO DO LEITO (COLUNA AQ/43) ***
function validarIdentificacaoLeito(identificacao) {
    if (!identificacao || typeof identificacao !== 'string') return '';
    
    // Validar formato alfanumérico 6 caracteres
    const regex = /^[A-Za-z0-9]{1,6}$/;
    if (!regex.test(identificacao)) {
        throw new Error('Identificação do leito deve ter até 6 caracteres alfanuméricos');
    }
    
    return identificacao.toUpperCase();
}

// *** NOVA V3.2: VALIDAR GÊNERO (COLUNA BS/71) ***
function validarGenero(genero) {
    const generosValidos = ['Masculino', 'Feminino'];
    return generosValidos.includes(genero) ? genero : '';
}

// *** NOVA V3.2: VALIDAR REGIÃO (COLUNA BT/72) ***
function validarRegiao(regiao) {
    return window.REGIOES_OPCOES.includes(regiao) ? regiao : '';
}

// *** NOVA V3.2: VALIDAR CATEGORIA ESCOLHIDA (COLUNA BU/73) ***
function validarCategoriaEscolhida(categoria) {
    const categoriasValidas = ['Apartamento', 'Enfermaria'];
    return categoriasValidas.includes(categoria) ? categoria : '';
}

// =================== CORREÇÃO CRÍTICA PARA CORS - JSONP ===================

// Função auxiliar para requisições JSONP (bypass CORS)
function jsonpRequest(url, params = {}) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
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
            delete window[callbackName];
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            reject(new Error('JSONP request failed'));
        };
        
        // Timeout
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
                
                logAPISuccess(`${method} ${action} concluído (Fetch)`, data.data ? `${Object.keys(data.data).length || 0} registros` : 'sem dados');
                return data.data;
                
            } catch (fetchError) {
                logAPI(`Fetch falhou (${fetchError.message}), tentando JSONP...`);
                
                // TENTATIVA 2: JSONP (bypass CORS)
                const data = await jsonpRequest(window.API_URL, { action, ...params });
                
                if (!data || !data.ok) {
                    throw new Error(data?.error || data?.message || 'Erro desconhecido da API via JSONP');
                }
                
                logAPISuccess(`${method} ${action} concluído (JSONP)`, data.data ? `${Object.keys(data.data).length || 0} registros` : 'sem dados');
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

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO V3.2 ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados V3.2 da planilha (73 colunas - A-BU)...');
        
        // Mostrar loading global
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script V3.2...');
        }
        
        // Buscar dados da API
        const apiData = await apiRequest('all', {}, 'GET');
        
        if (!apiData || typeof apiData !== 'object') {
            throw new Error('API V3.2 retornou dados inválidos');
        }
        
        // *** PROCESSAMENTO V3.2: DADOS JÁ VÊM COMO ARRAYS DIRETOS (CHECKBOXES) ***
        window.hospitalData = {};
        
        // Se a API retorna formato agrupado: {H1: {leitos: [...]}, H2: {leitos: [...]}}
        if (apiData.H1 && apiData.H1.leitos) {
            logAPI('Dados V3.2 recebidos em formato agrupado');
            window.hospitalData = apiData;
        } 
        // Se a API retorna array flat: [{hospital: 'H1', ...}, {hospital: 'H2', ...}]
        else if (Array.isArray(apiData)) {
            logAPI('Dados V3.2 recebidos em formato flat - convertendo...');
            apiData.forEach(leito => {
                const hospitalId = leito.hospital;
                if (!window.hospitalData[hospitalId]) {
                    window.hospitalData[hospitalId] = { leitos: [] };
                }
                window.hospitalData[hospitalId].leitos.push(leito);
            });
        }
        else {
            throw new Error('Formato de dados da API V3.2 não reconhecido');
        }
        
        // Verificar se temos dados
        const totalHospitais = Object.keys(window.hospitalData).length;
        if (totalHospitais === 0) {
            throw new Error('Nenhum hospital encontrado nos dados da API V3.2');
        }
        
        // *** PROCESSAMENTO V3.2: CHECKBOXES DIRETOS - SEM PARSING DE M/N ***
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital && hospital.leitos) {
                hospital.leitos = hospital.leitos.map(leito => {
                    // Padronizar status
                    if (leito.status === 'Em uso') leito.status = 'ocupado';
                    if (leito.status === 'Vago') leito.status = 'vago';
                    
                    // *** V3.2: VALIDAR TIMELINE COM 10 OPÇÕES ***
                    if (leito.prevAlta) {
                        leito.prevAlta = validarTimeline(leito.prevAlta);
                    }
                    
                    // *** V3.2: VALIDAR CONCESSÕES E LINHAS (JÁ VÊM COMO ARRAYS DOS CHECKBOXES) ***
                    if (leito.concessoes) {
                        leito.concessoes = validarConcessoes(leito.concessoes);
                    }
                    if (leito.linhas) {
                        leito.linhas = validarLinhas(leito.linhas);
                    }
                    
                    // *** V3.2: VALIDAR ISOLAMENTO (COLUNA AR/44) ***
                    if (leito.isolamento) {
                        leito.isolamento = validarIsolamento(leito.isolamento);
                    } else {
                        leito.isolamento = 'Não Isolamento'; // Padrão
                    }
                    
                    // *** V3.2: VALIDAR IDENTIFICAÇÃO DO LEITO (COLUNA AQ/43) ***
                    if (leito.identificacaoLeito) {
                        try {
                            leito.identificacaoLeito = validarIdentificacaoLeito(leito.identificacaoLeito);
                        } catch (error) {
                            logAPIError(`Erro na identificação do leito ${hospitalId}-${leito.leito}:`, error.message);
                            leito.identificacaoLeito = '';
                        }
                    } else {
                        leito.identificacaoLeito = ''; // Opcional
                    }
                    
                    // *** NOVA V3.2: VALIDAR GÊNERO (COLUNA BS/71) ***
                    if (leito.genero) {
                        leito.genero = validarGenero(leito.genero);
                    } else {
                        leito.genero = '';
                    }
                    
                    // *** NOVA V3.2: VALIDAR REGIÃO (COLUNA BT/72) ***
                    if (leito.regiao) {
                        leito.regiao = validarRegiao(leito.regiao);
                    } else {
                        leito.regiao = '';
                    }
                    
                    // *** NOVA V3.2: VALIDAR CATEGORIA ESCOLHIDA (COLUNA BU/73) ***
                    if (leito.categoriaEscolhida) {
                        leito.categoriaEscolhida = validarCategoriaEscolhida(leito.categoriaEscolhida);
                    } else {
                        leito.categoriaEscolhida = '';
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
                            linhas: leito.linhas || [],                      // Array de checkboxes
                            concessoes: leito.concessoes || [],              // Array de checkboxes
                            isolamento: leito.isolamento,                    // AR/44
                            identificacaoLeito: leito.identificacaoLeito,    // AQ/43
                            genero: leito.genero,                            // BS/71 (NOVA V3.2)
                            regiao: leito.regiao,                            // BT/72 (NOVA V3.2)
                            categoriaEscolhida: leito.categoriaEscolhida     // BU/73 (NOVA V3.2)
                        };
                    }
                    
                    return leito;
                });
                
                // Ordenar leitos por número
                hospital.leitos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
            }
        });
        
        // Estatísticas V3.2
        const totalLeitos = Object.values(window.hospitalData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        const leitosOcupados = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.filter(l => l.status === 'ocupado').length : 0), 0);
        const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
        
        // Estatísticas de concessões, linhas e novos campos V3.2
        let totalConcessoes = 0;
        let totalLinhas = 0;
        let leitosComIsolamento = 0;
        let leitosComIdentificacao = 0;
        let leitosComGenero = 0;
        let leitosComRegiao = 0;
        let leitosComCategoria = 0;
        
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
            });
        });
        
        logAPISuccess(`Dados V3.2 carregados da planilha (73 colunas A-BU):`);
        logAPISuccess(`• ${totalHospitais} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        logAPISuccess(`• ${totalConcessoes} concessões ativas (11 tipos)`);
        logAPISuccess(`• ${totalLinhas} linhas de cuidado ativas (45 tipos)`);
        logAPISuccess(`• ${leitosComIsolamento} leitos com isolamento (AR)`);
        logAPISuccess(`• ${leitosComIdentificacao} leitos com identificação (AQ)`);
        logAPISuccess(`• ${leitosComGenero} leitos com gênero (BS/71)`);
        logAPISuccess(`• ${leitosComRegiao} leitos com região (BT/72)`);
        logAPISuccess(`• ${leitosComCategoria} leitos com categoria (BU/73)`);
        logAPISuccess(`• CHECKBOXES DIRETOS - Zero parsing!`);
        
        // Atualizar timestamp
        window.lastAPICall = Date.now();
        
        // Esconder loading
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        return window.hospitalData;
        
    } catch (error) {
        logAPIError('❌ ERRO ao carregar dados V3.2:', error.message);
        
        // Esconder loading mesmo com erro
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        // Manter dados vazios
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE SALVAMENTO V3.2 ===================

// Admitir paciente V3.2 (salvar na planilha com 73 colunas)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente V3.2 no ${hospital}-${leito} NA PLANILHA REAL (73 colunas A-BU)`);
        
        // *** V3.2: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosPaciente.concessoes || []);
        const linhasValidas = validarLinhas(dadosPaciente.linhas || []);
        const timelineValida = validarTimeline(dadosPaciente.prevAlta || 'SP');
        const isolamentoValido = validarIsolamento(dadosPaciente.isolamento || 'Não Isolamento');
        const generoValido = validarGenero(dadosPaciente.genero || '');
        const regiaoValida = validarRegiao(dadosPaciente.regiao || '');
        const categoriaValida = validarCategoriaEscolhida(dadosPaciente.categoriaEscolhida || '');
        
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
            linhas: linhasValidas,                      // Array de checkboxes
            concessoes: concessoesValidas,              // Array de checkboxes
            isolamento: isolamentoValido,               // AR/44
            identificacaoLeito: identificacaoValida,    // AQ/43
            genero: generoValido,                       // BS/71 (NOVA V3.2)
            regiao: regiaoValida,                       // BT/72 (NOVA V3.2)
            categoriaEscolhida: categoriaValida         // BU/73 (NOVA V3.2)
        };
        
        logAPI('Payload V3.2 validado (73 colunas):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento,
            identificacaoLeito: payload.identificacaoLeito || 'vazio',
            genero: payload.genero || 'vazio',
            regiao: payload.regiao || 'vazio',
            categoria: payload.categoriaEscolhida || 'vazio'
        });
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess(`✅ Paciente admitido V3.2 na planilha (73 colunas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente V3.2:', error.message);
        throw error;
    }
};

// Atualizar dados do paciente V3.2 (salvar na planilha com 73 colunas)  
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente V3.2 ${hospital}-${leito} NA PLANILHA REAL (73 colunas A-BU)`);
        
        // *** V3.2: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosAtualizados.concessoes || []);
        const linhasValidas = validarLinhas(dadosAtualizados.linhas || []);
        const timelineValida = dadosAtualizados.prevAlta ? validarTimeline(dadosAtualizados.prevAlta) : '';
        const isolamentoValido = dadosAtualizados.isolamento ? validarIsolamento(dadosAtualizados.isolamento) : '';
        const generoValido = dadosAtualizados.genero ? validarGenero(dadosAtualizados.genero) : '';
        const regiaoValida = dadosAtualizados.regiao ? validarRegiao(dadosAtualizados.regiao) : '';
        const categoriaValida = dadosAtualizados.categoriaEscolhida ? validarCategoriaEscolhida(dadosAtualizados.categoriaEscolhida) : '';
        
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
            linhas: linhasValidas,                      // Array de checkboxes
            concessoes: concessoesValidas,              // Array de checkboxes
            isolamento: isolamentoValido,               // AR/44
            identificacaoLeito: identificacaoValida,    // AQ/43
            genero: generoValido,                       // BS/71 (NOVA V3.2)
            regiao: regiaoValida,                       // BT/72 (NOVA V3.2)
            categoriaEscolhida: categoriaValida         // BU/73 (NOVA V3.2)
        };
        
        logAPI('Payload V3.2 atualização validado (73 colunas):', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta,
            isolamento: payload.isolamento || 'não alterado',
            identificacaoLeito: payload.identificacaoLeito || 'não alterado',
            genero: payload.genero || 'não alterado',
            regiao: payload.regiao || 'não alterado',
            categoria: payload.categoriaEscolhida || 'não alterado'
        });
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V3.2 atualizado na planilha (73 colunas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente V3.2:', error.message);
        throw error;
    }
};

// Dar alta ao paciente V3.2 (salvar na planilha - limpar todas as 73 colunas)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta V3.2 ao paciente ${hospital}-${leito} NA PLANILHA REAL (73 colunas A-BU)`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta V3.2 processada na planilha (todas as 73 colunas limpas)!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao processar alta V3.2:', error.message);
        throw error;
    }
};

// *** NOVA V3.2: FUNÇÃO PARA COLETAR DADOS DO FORMULÁRIO (INCLUINDO BS/BT/BU) ***
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
        
        // Campos V3.1
        isolamento: document.getElementById(`${tipo}Isolamento`)?.value || 'Não Isolamento',
        identificacaoLeito: document.getElementById(`${tipo}IdentificacaoLeito`)?.value || '',
        
        // *** NOVOS CAMPOS V3.2: BS/BT/BU ***
        genero: document.getElementById(`${tipo}Genero`)?.value || '',              // BS/71
        regiao: document.getElementById(`${tipo}Regiao`)?.value || '',              // BT/72
        categoriaEscolhida: document.getElementById(`${tipo}Categoria`)?.value || '' // BU/73
    };
    
    // Coletar concessões selecionadas
    document.querySelectorAll(`input[name="${tipo}Concessoes"]:checked`).forEach(checkbox => {
        dados.concessoes.push(checkbox.value);
    });
    
    // Coletar linhas selecionadas
    document.querySelectorAll(`input[name="${tipo}Linhas"]:checked`).forEach(checkbox => {
        dados.linhas.push(checkbox.value);
    });
    
    logAPI(`Dados V3.2 coletados do formulário (73 colunas):`, {
        isolamento: dados.isolamento,
        identificacaoLeito: dados.identificacaoLeito || 'vazio',
        genero: dados.genero || 'vazio',
        regiao: dados.regiao || 'vazio',
        categoria: dados.categoriaEscolhida || 'vazio',
        concessoes: dados.concessoes.length,
        linhas: dados.linhas.length
    });
    
    return dados;
};

// =================== REFRESH APÓS AÇÕES V3.2 ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados V3.2 da planilha após ação...');
        
        // Mostrar loading nos cards
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #1a1f2e; border-radius: 12px;">
                    <div style="color: #60a5fa; margin-bottom: 15px; font-size: 18px;">
                        🔄 Sincronizando V3.2 com a planilha (73 colunas A-BU)...
                    </div>
                    <div style="color: #9ca3af; font-size: 14px;">
                        Atualizando dados - Checkboxes diretos V3.2
                    </div>
                </div>
            `;
        }
        
        // Aguardar um pouco (para garantir que a planilha foi atualizada)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recarregar dados da API V3.2
        await window.loadHospitalData();
        
        // Re-renderizar cards após dados carregados
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
                logAPISuccess('✅ Interface V3.2 atualizada com dados da planilha');
            }
        }, 500);
        
    } catch (error) {
        logAPIError('Erro ao refresh V3.2:', error.message);
        
        // Mesmo com erro, tentar re-renderizar cards
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== FUNÇÕES DE TESTE E MONITORAMENTO V3.2 ===================

// Testar conectividade da API V3.2
window.testAPI = async function() {
    try {
        logAPI('🔍 Testando conectividade V3.2 com a planilha (73 colunas A-BU)...');
        
        const result = await apiRequest('test', {}, 'GET');
        
        if (result) {
            logAPISuccess('✅ API V3.2 funcionando corretamente!', result);
            return { status: 'ok', data: result };
        } else {
            throw new Error('API V3.2 não retornou dados de teste válidos');
        }
        
    } catch (error) {
        logAPIError('❌ Erro na conectividade V3.2:', error.message);
        return { status: 'error', message: error.message };
    }
};

// Monitorar API V3.2 em tempo real
window.monitorAPI = function() {
    if (window.apiMonitorInterval) {
        clearInterval(window.apiMonitorInterval);
    }
    
    window.apiMonitorInterval = setInterval(async () => {
        try {
            const timeSinceLastCall = Date.now() - window.lastAPICall;
            
            // Se passou mais de 4 minutos, fazer refresh automático
            if (timeSinceLastCall > 240000) { // 4 minutos
                logAPI('🔄 Refresh automático V3.2 dos dados...');
                await window.loadHospitalData();
                
                // Re-renderizar interface se necessário
                if (window.currentView === 'leitos' && window.renderCards) {
                    setTimeout(() => window.renderCards(), 1000);
                }
            }
        } catch (error) {
            logAPIError('Erro no monitoramento automático V3.2:', error.message);
        }
    }, 60000); // Verificar a cada minuto
    
    logAPI('🔍 Monitoramento automático V3.2 da API ativado');
};

// =================== COMPATIBILIDADE COM VERSÕES ANTERIORES ===================

// Alias para funções antigas
window.fetchHospitalData = async function(hospital) {
    logAPI(`Buscando dados V3.2 do hospital: ${hospital}`);
    
    // Carregar todos os dados e filtrar
    await window.loadHospitalData();
    
    if (window.hospitalData[hospital] && window.hospitalData[hospital].leitos) {
        return window.hospitalData[hospital].leitos;
    }
    
    return [];
};

// Alias para função antiga
window.loadAllHospitalsData = window.loadHospitalData;

// Função para buscar dados de um leito específico V3.2
window.fetchLeitoData = async function(hospital, leito) {
    try {
        const data = await apiRequest('one', { hospital: hospital, leito: leito }, 'GET');
        return data;
    } catch (error) {
        logAPIError(`Erro ao buscar leito V3.2 ${hospital}-${leito}:`, error.message);
        return null;
    }
};

// =================== FUNÇÕES DE CORES V3.2 ===================
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
            logAPISuccess('✅ Cores V3.2 carregadas da planilha');
            return colors;
        }
    } catch (error) {
        logAPIError('Erro ao carregar cores V3.2:', error.message);
    }
    return null;
};

window.saveColors = async function(colors) {
    try {
        const result = await apiRequest('savecolors', { colors: colors }, 'POST');
        logAPISuccess('✅ Cores V3.2 salvas na planilha');
        return result;
    } catch (error) {
        logAPIError('Erro ao salvar cores V3.2:', error.message);
        throw error;
    }
};

// =================== INICIALIZAÇÃO V3.2 ===================
window.addEventListener('load', () => {
    logAPI('API.js V3.2 carregado - URL da API V3.2 configurada');
    logAPI(`URL: ${window.API_URL}`);
    logAPI(`Timeline: ${window.TIMELINE_OPCOES.length} opções`);
    logAPI(`Isolamento: ${window.ISOLAMENTO_OPCOES.length} opções (AR/44)`);
    logAPI(`Regiões: ${window.REGIOES_OPCOES.length} opções (BT/72)`);
    logAPI(`Concessões: ${window.CONCESSOES_VALIDAS.length} tipos (M-W checkboxes)`);
    logAPI(`Linhas: ${window.LINHAS_VALIDAS.length} tipos (X-AP + AS-BR checkboxes)`);
    logAPI(`Novos campos: BS/71 (genero), BT/72 (regiao), BU/73 (categoria)`);
    
    // Iniciar monitoramento após 10 segundos
    setTimeout(() => {
        if (window.monitorAPI) {
            window.monitorAPI();
        }
    }, 10000);
});

logAPISuccess('✅ API.js V3.2 100% FUNCIONAL - Nova estrutura 73 colunas (A-BU) ativa');
logAPISuccess('✅ Checkboxes diretos (M-W + X-AP + AS-BR) - ZERO parsing');
logAPISuccess('✅ Novos campos V3.2: BS/71 (genero), BT/72 (regiao), BU/73 (categoria)');
logAPISuccess('✅ 11 concessões + 45 linhas de cuidado implementadas');
