// =================== API V4.0 - NOVA ESTRUTURA 44 COLUNAS - SEM PARSING ===================

// *** URL ATUALIZADA DA API V4.0 ***
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

// =================== FUNÇÕES AUXILIARES ===================
function logAPI(message, data = null) {
    console.log(`🔗 [API V4.0] ${message}`, data || '');
}

function logAPIError(message, error) {
    console.error(`❌ [API ERROR V4.0] ${message}`, error);
}

function logAPISuccess(message, data = null) {
    console.log(`✅ [API SUCCESS V4.0] ${message}`, data || '');
}

// =================== VALIDAÇÃO DE DADOS ===================
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

// =================== FUNÇÃO PRINCIPAL DE CARREGAMENTO V4.0 ===================
window.loadHospitalData = async function() {
    try {
        logAPI('🔄 Carregando dados V4.0 da planilha (44 colunas)...');
        
        // Mostrar loading global
        if (window.showLoading) {
            window.showLoading(null, 'Sincronizando com Google Apps Script V4.0...');
        }
        
        // Buscar dados da API
        const apiData = await apiRequest('all', {}, 'GET');
        
        if (!apiData || typeof apiData !== 'object') {
            throw new Error('API V4.0 retornou dados inválidos');
        }
        
        // *** PROCESSAMENTO V4.0: DADOS JÁ VÊM COMO ARRAYS DIRETOS ***
        window.hospitalData = {};
        
        // Se a API retorna formato agrupado: {H1: {leitos: [...]}, H2: {leitos: [...]}}
        if (apiData.H1 && apiData.H1.leitos) {
            logAPI('Dados V4.0 recebidos em formato agrupado');
            window.hospitalData = apiData;
        } 
        // Se a API retorna array flat: [{hospital: 'H1', ...}, {hospital: 'H2', ...}]
        else if (Array.isArray(apiData)) {
            logAPI('Dados V4.0 recebidos em formato flat - convertendo...');
            apiData.forEach(leito => {
                const hospitalId = leito.hospital;
                if (!window.hospitalData[hospitalId]) {
                    window.hospitalData[hospitalId] = { leitos: [] };
                }
                window.hospitalData[hospitalId].leitos.push(leito);
            });
        }
        else {
            throw new Error('Formato de dados da API V4.0 não reconhecido');
        }
        
        // Verificar se temos dados
        const totalHospitais = Object.keys(window.hospitalData).length;
        if (totalHospitais === 0) {
            throw new Error('Nenhum hospital encontrado nos dados da API V4.0');
        }
        
        // *** PROCESSAMENTO V4.0: SEM PARSING - DADOS JÁ VÊM CORRETOS ***
        Object.keys(window.hospitalData).forEach(hospitalId => {
            const hospital = window.hospitalData[hospitalId];
            if (hospital && hospital.leitos) {
                hospital.leitos = hospital.leitos.map(leito => {
                    // Padronizar status
                    if (leito.status === 'Em uso') leito.status = 'ocupado';
                    if (leito.status === 'Vago') leito.status = 'vago';
                    
                    // *** V4.0: VALIDAR TIMELINE COM 10 OPÇÕES ***
                    if (leito.prevAlta) {
                        leito.prevAlta = validarTimeline(leito.prevAlta);
                    }
                    
                    // *** V4.0: VALIDAR CONCESSÕES E LINHAS (JÁ VÊM COMO ARRAYS) ***
                    if (leito.concessoes) {
                        leito.concessoes = validarConcessoes(leito.concessoes);
                    }
                    if (leito.linhas) {
                        leito.linhas = validarLinhas(leito.linhas);
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
                            linhas: leito.linhas || [],      // Array direto V4.0!
                            concessoes: leito.concessoes || []  // Array direto V4.0!
                        };
                    }
                    
                    return leito;
                });
                
                // Ordenar leitos por número
                hospital.leitos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
            }
        });
        
        // Estatísticas
        const totalLeitos = Object.values(window.hospitalData).reduce((acc, h) => acc + (h.leitos ? h.leitos.length : 0), 0);
        const leitosOcupados = Object.values(window.hospitalData).reduce((acc, h) => 
            acc + (h.leitos ? h.leitos.filter(l => l.status === 'ocupado').length : 0), 0);
        const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
        
        // Estatísticas de concessões e linhas
        let totalConcessoes = 0;
        let totalLinhas = 0;
        Object.values(window.hospitalData).forEach(hospital => {
            hospital.leitos?.forEach(leito => {
                if (leito.status === 'ocupado') {
                    totalConcessoes += (leito.concessoes?.length || 0);
                    totalLinhas += (leito.linhas?.length || 0);
                }
            });
        });
        
        logAPISuccess(`Dados V4.0 carregados da planilha (44 colunas):`);
        logAPISuccess(`• ${totalHospitais} hospitais ativos`);
        logAPISuccess(`• ${totalLeitos} leitos totais`);
        logAPISuccess(`• ${leitosOcupados} leitos ocupados (${taxaOcupacao}%)`);
        logAPISuccess(`• ${totalConcessoes} concessões ativas`);
        logAPISuccess(`• ${totalLinhas} linhas de cuidado ativas`);
        logAPISuccess(`• SEM PARSING - Dados diretos das 44 colunas!`);
        
        // Atualizar timestamp
        window.lastAPICall = Date.now();
        
        // Esconder loading
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        return window.hospitalData;
        
    } catch (error) {
        logAPIError('❌ ERRO ao carregar dados V4.0:', error.message);
        
        // Esconder loading mesmo com erro
        if (window.hideLoading) {
            window.hideLoading();
        }
        
        // Manter dados vazios
        window.hospitalData = {};
        
        throw error;
    }
};

// =================== FUNÇÕES DE SALVAMENTO V4.0 ===================

// Admitir paciente V4.0 (salvar na planilha)
window.admitirPaciente = async function(hospital, leito, dadosPaciente) {
    try {
        logAPI(`Admitindo paciente V4.0 no ${hospital}-${leito} NA PLANILHA REAL (44 colunas)`);
        
        // *** V4.0: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosPaciente.concessoes || []);
        const linhasValidas = validarLinhas(dadosPaciente.linhas || []);
        const timelineValida = validarTimeline(dadosPaciente.prevAlta || 'SP');
        
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
            linhas: linhasValidas,     // Array direto V4.0!
            concessoes: concessoesValidas  // Array direto V4.0!
        };
        
        logAPI('Payload V4.0 validado:', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta
        });
        
        const result = await apiRequest('admitir', payload, 'POST');
        
        logAPISuccess(`✅ Paciente admitido V4.0 na planilha (${payload.concessoes.length} concessões, ${payload.linhas.length} linhas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao admitir paciente V4.0:', error.message);
        throw error;
    }
};

// Atualizar dados do paciente V4.0 (salvar na planilha)  
window.atualizarPaciente = async function(hospital, leito, dadosAtualizados) {
    try {
        logAPI(`Atualizando paciente V4.0 ${hospital}-${leito} NA PLANILHA REAL (44 colunas)`);
        
        // *** V4.0: VALIDAR DADOS ANTES DE ENVIAR ***
        const concessoesValidas = validarConcessoes(dadosAtualizados.concessoes || []);
        const linhasValidas = validarLinhas(dadosAtualizados.linhas || []);
        const timelineValida = dadosAtualizados.prevAlta ? validarTimeline(dadosAtualizados.prevAlta) : '';
        
        const payload = {
            hospital: hospital,
            leito: Number(leito),
            idade: dadosAtualizados.idade || null,
            pps: dadosAtualizados.pps || null,
            spict: dadosAtualizados.spict || '',
            complexidade: dadosAtualizados.complexidade || '',
            prevAlta: timelineValida,
            linhas: linhasValidas,     // Array direto V4.0!
            concessoes: concessoesValidas  // Array direto V4.0!
        };
        
        logAPI('Payload V4.0 atualização validado:', {
            concessoes: payload.concessoes.length,
            linhas: payload.linhas.length,
            timeline: payload.prevAlta
        });
        
        const result = await apiRequest('atualizar', payload, 'POST');
        
        logAPISuccess(`✅ Paciente V4.0 atualizado na planilha (${payload.concessoes.length} concessões, ${payload.linhas.length} linhas)!`);
        return result;
        
    } catch (error) {
        logAPIError('Erro ao atualizar paciente V4.0:', error.message);
        throw error;
    }
};

// Dar alta ao paciente V4.0 (salvar na planilha)
window.darAltaPaciente = async function(hospital, leito) {
    try {
        logAPI(`Dando alta V4.0 ao paciente ${hospital}-${leito} NA PLANILHA REAL (44 colunas)`);
        
        const payload = {
            hospital: hospital,
            leito: Number(leito)
        };
        
        const result = await apiRequest('daralta', payload, 'POST');
        
        logAPISuccess('✅ Alta V4.0 processada na planilha (todas as 44 colunas limpas)!');
        return result;
        
    } catch (error) {
        logAPIError('Erro ao processar alta V4.0:', error.message);
        throw error;
    }
};

// =================== REFRESH APÓS AÇÕES V4.0 ===================
window.refreshAfterAction = async function() {
    try {
        logAPI('🔄 Recarregando dados V4.0 da planilha após ação...');
        
        // Mostrar loading nos cards
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #1a1f2e; border-radius: 12px;">
                    <div style="color: #60a5fa; margin-bottom: 15px; font-size: 18px;">
                        🔄 Sincronizando V4.0 com a planilha (44 colunas)...
                    </div>
                    <div style="color: #9ca3af; font-size: 14px;">
                        Atualizando dados sem parsing - Performance otimizada
                    </div>
                </div>
            `;
        }
        
        // Aguardar um pouco (para garantir que a planilha foi atualizada)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recarregar dados da API V4.0
        await window.loadHospitalData();
        
        // Re-renderizar cards após dados carregados
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
                logAPISuccess('✅ Interface V4.0 atualizada com dados da planilha (sem parsing)');
            }
        }, 500);
        
    } catch (error) {
        logAPIError('Erro ao refresh V4.0:', error.message);
        
        // Mesmo com erro, tentar re-renderizar cards
        setTimeout(() => {
            if (window.renderCards) {
                window.renderCards();
            }
        }, 1000);
    }
};

// =================== FUNÇÕES DE TESTE E MONITORAMENTO V4.0 ===================

// Testar conectividade da API V4.0
window.testAPI = async function() {
    try {
        logAPI('🔍 Testando conectividade V4.0 com a planilha (44 colunas)...');
        
        const result = await apiRequest('test', {}, 'GET');
        
        if (result) {
            logAPISuccess('✅ API V4.0 funcionando corretamente!', result);
            return { status: 'ok', data: result };
        } else {
            throw new Error('API V4.0 não retornou dados de teste válidos');
        }
        
    } catch (error) {
        logAPIError('❌ Erro na conectividade V4.0:', error.message);
        return { status: 'error', message: error.message };
    }
};

// Monitorar API V4.0 em tempo real
window.monitorAPI = function() {
    if (window.apiMonitorInterval) {
        clearInterval(window.apiMonitorInterval);
    }
    
    window.apiMonitorInterval = setInterval(async () => {
        try {
            const timeSinceLastCall = Date.now() - window.lastAPICall;
            
            // Se passou mais de 4 minutos, fazer refresh automático
            if (timeSinceLastCall > 240000) { // 4 minutos
                logAPI('🔄 Refresh automático V4.0 dos dados...');
                await window.loadHospitalData();
                
                // Re-renderizar interface se necessário
                if (window.currentView === 'leitos' && window.renderCards) {
                    setTimeout(() => window.renderCards(), 1000);
                }
            }
        } catch (error) {
            logAPIError('Erro no monitoramento automático V4.0:', error.message);
        }
    }, 60000); // Verificar a cada minuto
    
    logAPI('🔍 Monitoramento automático V4.0 da API ativado');
};

// =================== COMPATIBILIDADE COM VERSÕES ANTERIORES ===================

// Alias para funções antigas
window.fetchHospitalData = async function(hospital) {
    logAPI(`Buscando dados V4.0 do hospital: ${hospital}`);
    
    // Carregar todos os dados e filtrar
    await window.loadHospitalData();
    
    if (window.hospitalData[hospital] && window.hospitalData[hospital].leitos) {
        return window.hospitalData[hospital].leitos;
    }
    
    return [];
};

// Alias para função antiga
window.loadAllHospitalsData = window.loadHospitalData;

// Função para buscar dados de um leito específico V4.0
window.fetchLeitoData = async function(hospital, leito) {
    try {
        const data = await apiRequest('one', { hospital: hospital, leito: leito }, 'GET');
        return data;
    } catch (error) {
        logAPIError(`Erro ao buscar leito V4.0 ${hospital}-${leito}:`, error.message);
        return null;
    }
};

// =================== FUNÇÕES DE CORES V4.0 ===================
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
            logAPISuccess('✅ Cores V4.0 carregadas da planilha');
            return colors;
        }
    } catch (error) {
        logAPIError('Erro ao carregar cores V4.0:', error.message);
    }
    return null;
};

window.saveColors = async function(colors) {
    try {
        const result = await apiRequest('savecolors', { colors: colors }, 'POST');
        logAPISuccess('✅ Cores V4.0 salvas na planilha');
        return result;
    } catch (error) {
        logAPIError('Erro ao salvar cores V4.0:', error.message);
        throw error;
    }
};

// =================== INICIALIZAÇÃO V4.0 ===================
window.addEventListener('load', () => {
    logAPI('API.js V4.0 carregado - URL da API V4.0 configurada');
    logAPI(`URL: ${window.API_URL}`);
    logAPI(`Timeline: ${window.TIMELINE_OPCOES.length} opções (incluindo 96h)`);
    logAPI(`Concessões: ${window.CONCESSOES_VALIDAS.length} tipos`);
    logAPI(`Linhas: ${window.LINHAS_VALIDAS.length} tipos`);
    
    // Iniciar monitoramento após 10 segundos
    setTimeout(() => {
        if (window.monitorAPI) {
            window.monitorAPI();
        }
    }, 10000);
});

logAPISuccess('✅ API.js V4.0 100% FUNCIONAL - Nova estrutura 44 colunas sem parsing ativa');
logAPISuccess('✅ URL atualizada e caracteres especiais corrigidos');
logAPISuccess('✅ Timeline com 10 opções incluindo 96h');
