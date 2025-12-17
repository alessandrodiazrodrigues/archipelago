// js/dashboards/dashboard-hospital.js
// Dashboard Enfermarias - Archipelago V7.0
// Versão: 7.0 - Dezembro/2025
// Alterações V7.0:
// - Renomeado de "Dashboard Hospitalar" para "Dashboard Enfermarias"
// - Filtro UTI (leitos UTI não aparecem neste dashboard)
// - Sistema de reservas integrado
// - Box "Ocupação" com dois gauges (Reservados | Ocupados)
// - Tabela por tipo com colunas Ocupados | Reservados
// - Cálculo de disponíveis desconta reservas

// =================== DASHBOARD ENFERMARIAS V7.0 ===================
// Depende de: cards-config.js (carregar ANTES)

console.log('Dashboard Enfermarias V7.0 - Carregando...');

// =================== VALIDAR DEPENDÊNCIAS ===================
if (typeof window.desnormalizarTexto === 'undefined') {
    console.error('ERRO CRITICO: cards-config.js NÃO foi carregado!');
    throw new Error('cards-config.js deve ser carregado ANTES de dashboard-hospital.js');
}

console.log('Dependências validadas - cards-config.js OK');

// =================== CONTINUAÇÃO DO DASHBOARD ENFERMARIAS ===================

console.log('Dashboard Enfermarias V7.0 - Inicializando...');

// Variável global para controlar o filtro atual
window.hospitalFiltroAtual = 'todos';

const CORES_ARCHIPELAGO = {
    azulMarinhoEscuro: '#131b2e',
    azulEscuro: '#172945',
    azulMedio: '#1c5083',
    azulPrincipal: '#60a5fa',
    azulAcinzentado: '#577a97',
    azulClaro: '#a9c0d2',
    cinzaEscuro: '#3c3a3e',
    cinzaMedio: '#9ca3af',
    cinzaClaro: '#e9e5e2',
    laranja: '#c86420',
    amarelo: '#f59a1d',
    verde: '#29ad8d',
    ocupados: '#60a5fa',
    previsao: '#60a5fa',
    disponiveis: '#60a5fa',
    reservados: '#60a5fa',
    tph: '#577a97',
    pps: '#1c5083',
    spict: '#172945'
};

const CONFIG_DASHBOARD = {
    MOSTRAR_LINHAS_CUIDADO: true,
    MOSTRAR_96H: false,
};

window.fundoBranco = false;

const hasDataLabels = typeof ChartDataLabels !== 'undefined';
if (!hasDataLabels) {
    console.warn('ChartDataLabels não carregado. Números nas pizzas via legenda.');
}

function normStr(s) {
    return (s ?? '').toString()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim().toLowerCase();
}

function parseAdmDate_Hosp(admAt) {
    if (!admAt) return null;
    
    const d = new Date(admAt);
    if (!isNaN(d)) {
        const hoje = new Date();
        const dias = Math.floor((hoje - d) / (1000 * 60 * 60 * 24));
        
        if (dias >= 0 && dias <= 365) {
            return d;
        }
    }
    
    return null;
}

function getLeitoNumero(val) {
    if (typeof val === 'number') return val;
    const m = String(val || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
}

function isOcupado(leito) {
    const s = (leito?.status || '').toString().toLowerCase().trim();
    return s === 'ocupado' || s === 'em uso' || s === 'ocupada';
}

function isVago(leito) {
    const s = (leito?.status || '').toString().toLowerCase().trim();
    return s === 'vago' || s === 'disponivel' || s === 'disponível' || s === 'livre';
}

// =================== V7.0: FUNÇÃO PARA BUSCAR RESERVAS ===================
// Retorna apenas RESERVAS REAIS (com matricula) - bloqueios de irmão não são contados
function getReservasHospital(hospitalId) {
    if (!window.reservasData || !Array.isArray(window.reservasData)) return [];
    return window.reservasData.filter(r => {
        if (r.hospital !== hospitalId) return false;
        if (r.tipo === 'UTI') return false;
        // V7.0: Apenas reservas COM matricula são reservas reais
        const temMatricula = r.matricula && String(r.matricula).trim();
        return temMatricula;
    });
}

// =================== V7.0: FILTRAR LEITOS SEM UTI ===================
function filtrarLeitosSemUTI(leitos) {
    if (!Array.isArray(leitos)) return [];
    return leitos.filter(l => l.tipo !== 'UTI');
}

function getCorExata(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        return CORES_ARCHIPELAGO.cinzaMedio;
    }
    
    const paleta = tipo === 'concessao' ? 
        window.CORES_CONCESSOES : 
        window.CORES_LINHAS;
    
    if (!paleta) {
        console.warn('Paleta de cores não carregada (api.js)');
        return CORES_ARCHIPELAGO.cinzaMedio;
    }
    
    // USAR A FUNÇÃO DE NORMALIZAÇÃO DO cards-config.js
    const itemNormalizado = window.normalizarTexto(itemName);
    
    // Buscar com nome normalizado (SEM acentos)
    let cor = paleta[itemNormalizado];
    if (cor) return cor;
    
    // Tentar com limpeza adicional
    const nomeNorm = itemNormalizado.trim().replace(/\s+/g, ' ').replace(/[–—]/g, '-');
    cor = paleta[nomeNorm];
    if (cor) return cor;
    
    // Se não encontrou, avisar no console
    console.warn('[CORES] Não encontrada: "' + itemName + '" -> normalizado: "' + itemNormalizado + '"');
    return CORES_ARCHIPELAGO.cinzaMedio;
}

window.atualizarTodasAsCores = function() {
    const corTexto = window.fundoBranco ? CORES_ARCHIPELAGO.cinzaEscuro : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(60, 58, 62, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && chart.options && chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = corTexto;
                    chart.options.scales.x.grid.color = corGrid;
                    if (chart.options.scales.x.title) {
                        chart.options.scales.x.title.color = corTexto;
                    }
                }
                
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = corTexto;
                    chart.options.scales.y.grid.color = corGrid;
                    if (chart.options.scales.y.title) {
                        chart.options.scales.y.title.color = corTexto;
                    }
                }
                
                chart.update('none');
            }
        });
    }
};

/**
 * Filtra hospitais no dashboard
 * @param {string} hospitalId - ID do hospital ou 'todos'
 */
window.filtrarHospitalDashboard = function(hospitalId) {
    console.log('[FILTRO] Filtrando:', hospitalId);
    
    // Atualizar variavel global
    window.hospitalFiltroAtual = hospitalId;
    
    // Atualizar dropdown
    const dropdown = document.getElementById('hospitalFilterDropdown');
    if (dropdown) {
        dropdown.value = hospitalId;
    }
    
    // Filtrar cards
    const hospitaisCards = document.querySelectorAll('.hospital-card');
    let totalVisiveis = 0;
    
    hospitaisCards.forEach(card => {
        const cardHospitalId = card.getAttribute('data-hospital');
        
        if (hospitalId === 'todos') {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
            totalVisiveis++;
        } else {
            if (cardHospitalId === hospitalId) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
                totalVisiveis++;
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    console.log('[FILTRO] Visiveis:', totalVisiveis);
};

window.copiarDashboardParaWhatsApp = function() {
    const hospitaisIds = ['H5', 'H2', 'H1', 'H4', 'H6', 'H3', 'H7', 'H8', 'H9'];
    const hospitaisNomes = {
        'H1': 'NEOMATER',
        'H2': 'CRUZ AZUL',
        'H3': 'SANTA MARCELINA',
        'H4': 'SANTA CLARA',
        'H5': 'ADVENTISTA',
        'H6': 'SANTA CRUZ',
        'H7': 'SANTA VIRGÍNIA',
        'H8': 'SÃO CAMILO IPIRANGA',
        'H9': 'SÃO CAMILO POMPEIA'
    };
    
    // Verificar qual hospital está selecionado
    const filtroAtual = window.hospitalFiltroAtual || 'todos';
    const hospitaisParaRelatorio = filtroAtual === 'todos' ? hospitaisIds : [filtroAtual];
    
    let texto = filtroAtual === 'todos' ? 
        '*DASHBOARD ENFERMARIAS*\n' : 
        '*DASHBOARD ENFERMARIAS - ' + hospitaisNomes[filtroAtual] + '*\n';
    
    texto += new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + '\n\n';
    
    hospitaisParaRelatorio.forEach(function(hospitalId, index) {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        const nome = hospitaisNomes[hospitalId];
        
        // V7.0: Filtrar UTI
        const leitos = filtrarLeitosSemUTI(hospital.leitos);
        
        // V7.0: Buscar reservas
        const reservas = getReservasHospital(hospitalId);
        
        if (filtroAtual === 'todos') {
            texto += '━━━━━━━━━━━━━━━━━\n';
            texto += '*' + (index + 1) + '. ' + nome + '*\n';
            texto += '━━━━━━━━━━━━━━━━━\n\n';
        }
        
        // V7.0: Adicionar info de reservas
        const ocupados = leitos.filter(function(l) { return isOcupado(l); }).length;
        const totalReservados = reservas.length;
        if (totalReservados > 0) {
            texto += '*Ocupados:* ' + ocupados + ' | *Reservados:* ' + totalReservados + '\n\n';
        }
        
        // ========== ALTAS PREVISTAS ==========
        var altasTimeline = {
            'HOJE': { 'Ouro': [], '2R': [], '3R': [] },
            '24H': { 'Ouro': [], '2R': [], '3R': [] },
            '48H': []
        };
        
        leitos.forEach(function(leito) {
            if (isOcupado(leito)) {
                var prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                var matricula = leito.matricula || 'S/N';
                
                if (prevAlta) {
                    var prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    
                    if (prev.includes('hoje') && prev.includes('ouro')) altasTimeline['HOJE']['Ouro'].push(matricula);
                    else if (prev.includes('hoje') && prev.includes('2r')) altasTimeline['HOJE']['2R'].push(matricula);
                    else if (prev.includes('hoje') && prev.includes('3r')) altasTimeline['HOJE']['3R'].push(matricula);
                    else if ((prev.includes('24h') || prev.includes('24 h')) && prev.includes('ouro')) altasTimeline['24H']['Ouro'].push(matricula);
                    else if ((prev.includes('24h') || prev.includes('24 h')) && prev.includes('2r')) altasTimeline['24H']['2R'].push(matricula);
                    else if ((prev.includes('24h') || prev.includes('24 h')) && prev.includes('3r')) altasTimeline['24H']['3R'].push(matricula);
                    else if (prev.includes('48h')) altasTimeline['48H'].push(matricula);
                }
            }
        });
        
        var temAltasHoje = altasTimeline['HOJE']['Ouro'].length > 0 || altasTimeline['HOJE']['2R'].length > 0 || altasTimeline['HOJE']['3R'].length > 0;
        var temAltas24h = altasTimeline['24H']['Ouro'].length > 0 || altasTimeline['24H']['2R'].length > 0 || altasTimeline['24H']['3R'].length > 0;
        var temAltas48h = altasTimeline['48H'].length > 0;
        
        if (temAltasHoje) {
            texto += '*Altas Previstas HOJE:*\n';
            if (altasTimeline['HOJE']['Ouro'].length > 0) {
                texto += 'Hoje Ouro: ' + altasTimeline['HOJE']['Ouro'].join(', ') + '\n';
            }
            if (altasTimeline['HOJE']['2R'].length > 0) {
                texto += 'Hoje 2R: ' + altasTimeline['HOJE']['2R'].join(', ') + '\n';
            }
            if (altasTimeline['HOJE']['3R'].length > 0) {
                texto += 'Hoje 3R: ' + altasTimeline['HOJE']['3R'].join(', ') + '\n';
            }
            texto += '\n';
        }
        
        if (temAltas24h) {
            texto += '*Altas Previstas 24H:*\n';
            if (altasTimeline['24H']['Ouro'].length > 0) {
                texto += '24h Ouro: ' + altasTimeline['24H']['Ouro'].join(', ') + '\n';
            }
            if (altasTimeline['24H']['2R'].length > 0) {
                texto += '24h 2R: ' + altasTimeline['24H']['2R'].join(', ') + '\n';
            }
            if (altasTimeline['24H']['3R'].length > 0) {
                texto += '24h 3R: ' + altasTimeline['24H']['3R'].join(', ') + '\n';
            }
            texto += '\n';
        }
        
        if (temAltas48h) {
            texto += '*Altas Previstas 48H:*\n';
            texto += '48h: ' + altasTimeline['48H'].join(', ') + '\n\n';
        }
        
        // ========== CONCESSÕES PREVISTAS ==========
        var concessoesTimeline = {
            'HOJE': {},
            '24H': {}
        };
        
        leitos.forEach(function(leito) {
            if (isOcupado(leito)) {
                var concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
                var prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                var matricula = leito.matricula || 'S/N';
                
                if (concessoes && prevAlta) {
                    var concessoesList = Array.isArray(concessoes) ? 
                        concessoes : 
                        String(concessoes).split('|');
                    
                    var prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    var timeline = null;
                    
                    if (prev.includes('hoje')) timeline = 'HOJE';
                    else if (prev.includes('24h') || prev.includes('24 h')) timeline = '24H';
                    
                    if (timeline) {
                        concessoesList.forEach(function(concessao) {
                            if (concessao && concessao.trim()) {
                                var nomeConc = window.desnormalizarTexto ? window.desnormalizarTexto(concessao.trim()) : concessao.trim();
                                if (!concessoesTimeline[timeline][nomeConc]) {
                                    concessoesTimeline[timeline][nomeConc] = [];
                                }
                                concessoesTimeline[timeline][nomeConc].push(matricula);
                            }
                        });
                    }
                }
            }
        });
        
        var temConcessoesHoje = Object.keys(concessoesTimeline['HOJE']).length > 0;
        var temConcessoes24h = Object.keys(concessoesTimeline['24H']).length > 0;
        
        if (temConcessoesHoje) {
            texto += '*Concessões Previstas HOJE:*\n';
            Object.entries(concessoesTimeline['HOJE']).forEach(function(entry) {
                var nomeC = entry[0];
                var matsC = entry[1];
                var nomeFinal = window.desnormalizarTexto ? window.desnormalizarTexto(nomeC) : nomeC;
                texto += nomeFinal + ': ' + matsC.join(', ') + '\n';
            });
            texto += '\n';
        }
        
        if (temConcessoes24h) {
            texto += '*Concessões Previstas 24H:*\n';
            Object.entries(concessoesTimeline['24H']).forEach(function(entry) {
                var nomeC = entry[0];
                var matsC = entry[1];
                var nomeFinal = window.desnormalizarTexto ? window.desnormalizarTexto(nomeC) : nomeC;
                texto += nomeFinal + ': ' + matsC.join(', ') + '\n';
            });
            texto += '\n';
        }
        
        // ========== DIRETIVAS PENDENTES ==========
        var diretivasPendentes = leitos.filter(function(l) {
            if (!isOcupado(l)) return false;
            
            var spict = l.spict;
            if (!spict) return false;
            
            var spictNorm = normStr(spict);
            var spictElegivel = spictNorm === 'elegivel' || spictNorm === 'elegível';
            
            if (!spictElegivel) return false;
            
            var diretivas = l.diretivas;
            var dirNorm = normStr(diretivas);
            
            var valoresPendentes = ['', 'nao', 'n/a', 'pendente', 'nao se aplica'];
            
            return valoresPendentes.includes(dirNorm);
        });
        
        if (diretivasPendentes.length > 0) {
            texto += '*Diretivas Pendentes:*\n';
            diretivasPendentes.forEach(function(l) {
                var leitoId = l.identificacaoLeito || l.leito || '---';
                var mat = l.matricula || '---';
                texto += 'Leito ' + leitoId + ' - Mat. ' + mat + '\n';
            });
            texto += '\n';
        }
        
        // Se não tem nada
        if (!temAltasHoje && !temAltas24h && !temAltas48h && !temConcessoesHoje && !temConcessoes24h && diretivasPendentes.length === 0) {
            texto += '_Nenhuma atividade prevista_\n\n';
        }
    });
    
    navigator.clipboard.writeText(texto).then(function() {
        alert('Dados copiados para o WhatsApp!\n\nCole e envie.');
    }).catch(function(err) {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar. Tente novamente.');
    });
};

function calcularModalidadesVagos(leitos, hospitalId, reservas) {
    // V7.0: Filtrar UTI
    var leitosFiltrados = filtrarLeitosSemUTI(leitos);
    
    // V7.4: Garantir que reservas seja um array
    var reservasArray = reservas || [];
    
    var modalidade = {
        flexiveis: 0,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restrição: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
    };

    var vagos = leitosFiltrados.filter(function(l) { return isVago(l); });

    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7' || hospitalId === 'H8' || hospitalId === 'H9') {
        // V6.0: Usar contratuais (não conta extras)
        var capacidadeInfo = window.HOSPITAL_CAPACIDADE ? window.HOSPITAL_CAPACIDADE[hospitalId] : null;
        var contratuais = capacidadeInfo ? capacidadeInfo.contratuais : leitosFiltrados.length;
        var ocupados = leitosFiltrados.filter(function(l) { return isOcupado(l); }).length;
        // V7.4: Descontar reservas no calculo de flexiveis
        var totalReservados = reservasArray.length;
        modalidade.flexiveis = Math.max(0, contratuais - ocupados - totalReservados);
        return modalidade;
    }

    // =================== H2 - CRUZ AZUL ===================
    if (hospitalId === 'H2') {
        // APARTAMENTOS: contratuais - ocupados - reservados
        var aptosContratuais = 20;
        var aptosOcupados = leitosFiltrados.filter(function(l) {
            return isOcupado(l) && (l.tipo === 'APTO' || l.tipo === 'Apartamento');
        }).length;
        // V7.4: Descontar reservas de apartamento
        var aptosReservados = reservasArray.filter(function(r) { return r.tipo === 'Apartamento'; }).length;
        modalidade.exclusivo_apto = Math.max(0, aptosContratuais - aptosOcupados - aptosReservados);
        
        // ENFERMARIAS: apenas leitos contratuais (21-36)
        var vagosContratuais = vagos.filter(function(l) {
            var tipo = l.tipo || '';
            if (tipo !== 'ENFERMARIA' && tipo !== 'Enfermaria') return false;
            var numeroLeito = getLeitoNumero(l.leito);
            return numeroLeito && numeroLeito >= 21 && numeroLeito <= 36;
        });
        
        vagosContratuais.forEach(function(leitoVago) {
            var numeroLeito = getLeitoNumero(leitoVago.leito);
            
            // Buscar irmão usando CRUZ_AZUL_IRMAOS
            var irmaosMap = window.CRUZ_AZUL_IRMAOS || {};
            var numeroIrmao = irmaosMap[numeroLeito];
            
            if (!numeroIrmao) {
                modalidade.exclusivo_enf_sem_restricao++;
                return;
            }
            
            var irmao = leitosFiltrados.find(function(l) { return getLeitoNumero(l.leito) === numeroIrmao; });
            
            if (!irmao || isVago(irmao)) {
                modalidade.exclusivo_enf_sem_restricao++;
            } else if (irmao.isolamento && irmao.isolamento !== 'Nao Isolamento' && irmao.isolamento !== 'Não Isolamento') {
                // Isolamento: leito não disponível (não conta)
            } else {
                if (irmao.genero === 'Feminino') {
                    modalidade.exclusivo_enf_fem++;
                } else if (irmao.genero === 'Masculino') {
                    modalidade.exclusivo_enf_masc++;
                } else {
                    modalidade.exclusivo_enf_sem_restricao++;
                }
            }
        });
        
        return modalidade;
    }
    
    // =================== H4 - SANTA CLARA ===================
    if (hospitalId === 'H4') {
        // APARTAMENTOS: contratuais - ocupados - reservados
        var aptosContratuaisH4 = 18;
        var aptosOcupadosH4 = leitosFiltrados.filter(function(l) {
            return isOcupado(l) && (l.tipo === 'APTO' || l.tipo === 'Apartamento');
        }).length;
        // V7.4: Descontar reservas de apartamento
        var aptosReservadosH4 = reservasArray.filter(function(r) { return r.tipo === 'Apartamento'; }).length;
        modalidade.exclusivo_apto = Math.max(0, aptosContratuaisH4 - aptosOcupadosH4 - aptosReservadosH4);
        
        // ENFERMARIAS: apenas leitos contratuais (10-17)
        var vagosContratuaisH4 = vagos.filter(function(l) {
            var tipo = l.tipo || '';
            if (tipo !== 'ENFERMARIA' && tipo !== 'Enfermaria') return false;
            var numeroLeito = getLeitoNumero(l.leito);
            return numeroLeito && numeroLeito >= 10 && numeroLeito <= 17;
        });
        
        vagosContratuaisH4.forEach(function(leitoVago) {
            var numeroLeito = getLeitoNumero(leitoVago.leito);
            
            // Determinar irmão usando SANTA_CLARA_IRMAOS
            var irmaosMap = window.SANTA_CLARA_IRMAOS || {
                10: 11, 11: 10,
                12: 13, 13: 12,
                14: 15, 15: 14,
                16: 17, 17: 16
            };
            
            var numeroIrmao = irmaosMap[numeroLeito];
            
            if (!numeroIrmao) {
                modalidade.exclusivo_enf_sem_restricao++;
                return;
            }
            
            var irmao = leitosFiltrados.find(function(l) { return getLeitoNumero(l.leito) === numeroIrmao; });
            
            if (!irmao || isVago(irmao)) {
                modalidade.exclusivo_enf_sem_restricao++;
            } else if (irmao.isolamento && irmao.isolamento !== 'Nao Isolamento' && irmao.isolamento !== 'Não Isolamento') {
                // Isolamento: leito não disponível (não conta)
            } else {
                if (irmao.genero === 'Feminino') {
                    modalidade.exclusivo_enf_fem++;
                } else if (irmao.genero === 'Masculino') {
                    modalidade.exclusivo_enf_masc++;
                } else {
                    modalidade.exclusivo_enf_sem_restricao++;
                }
            }
        });
        
        return modalidade;
    }

    return modalidade;
}

function calcularModalidadePorTipo(leitos, hospitalId) {
    // V7.0: Filtrar UTI
    var leitosFiltrados = filtrarLeitosSemUTI(leitos);
    
    var modalidade = {
        flexiveis: 0,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restrição: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
    };

    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7' || hospitalId === 'H8' || hospitalId === 'H9') {
        modalidade.flexiveis = leitosFiltrados.length;
        return modalidade;
    }

    leitosFiltrados.forEach(function(leito) {
        var genero = leito.genero || '';
        
        // Para H2 e H4: usar TIPO estrutural
        if (hospitalId === 'H2' || hospitalId === 'H4') {
            var tipo = leito.tipo || '';
            if (tipo === 'APTO' || tipo === 'Apartamento') {
                modalidade.exclusivo_apto++;
            } else if (tipo === 'ENFERMARIA' || tipo === 'Enfermaria') {
                if (genero === 'Feminino') {
                    modalidade.exclusivo_enf_fem++;
                } else if (genero === 'Masculino') {
                    modalidade.exclusivo_enf_masc++;
                } else {
                    modalidade.exclusivo_enf_sem_restricao++;
                }
            }
            return;
        }
        
        // Para híbridos: usar categoriaEscolhida
        var catEscolhida = leito.categoriaEscolhida || leito.categoria || '';
        
        if (catEscolhida === 'Apartamento') {
            modalidade.exclusivo_apto++;
        } else if (catEscolhida === 'Enfermaria') {
            if (hospitalId === 'H2' || hospitalId === 'H4') {
                if (genero === 'Feminino') {
                    modalidade.exclusivo_enf_fem++;
                } else if (genero === 'Masculino') {
                    modalidade.exclusivo_enf_masc++;
                } else {
                    modalidade.exclusivo_enf_sem_restricao++;
                }
            } else {
                modalidade.exclusivo_enf_sem_restricao++;
            }
        } else {
            modalidade.flexiveis++;
        }
    });

    return modalidade;
}

// =================== V7.0: PROCESSAR DADOS HOSPITAL (COM RESERVAS E FILTRO UTI) ===================
window.processarDadosHospital = function(hospitalId) {
    var hospitalObj = window.hospitalData[hospitalId] || {};
    
    var leitosRaw = hospitalObj.leitos || hospitalObj || [];
    if (!Array.isArray(leitosRaw)) {
        leitosRaw = [];
    }
    
    // V7.0: Filtrar leitos UTI
    var leitos = filtrarLeitosSemUTI(leitosRaw);
    
    var ocupados = leitos.filter(function(l) { return isOcupado(l); });
    
    // V7.0: Buscar reservas do hospital (já vem filtrada sem UTI)
    var reservas = getReservasHospital(hospitalId);
    
    var ocupadosApto, ocupadosEnfFem, ocupadosEnfMasc;
    
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7' || hospitalId === 'H8' || hospitalId === 'H9') {
        ocupadosApto = ocupados.filter(function(l) {
            return l.categoriaEscolhida === 'Apartamento';
        }).length;
        ocupadosEnfFem = ocupados.filter(function(l) {
            return l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Feminino';
        }).length;
        ocupadosEnfMasc = ocupados.filter(function(l) {
            return l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Masculino';
        }).length;
    } else {
        ocupadosApto = ocupados.filter(function(l) {
            return l.tipo === 'Apartamento' || l.tipo === 'APTO';
        }).length;
        ocupadosEnfFem = ocupados.filter(function(l) {
            return (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Feminino';
        }).length;
        ocupadosEnfMasc = ocupados.filter(function(l) {
            return (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Masculino';
        }).length;
    }
    
    // V7.0: Calcular reservas por tipo
    var reservadosApto = reservas.filter(function(r) { return r.tipo === 'Apartamento'; }).length;
    var reservadosEnfFem = reservas.filter(function(r) { return r.tipo === 'Enfermaria' && r.genero === 'Feminino'; }).length;
    var reservadosEnfMasc = reservas.filter(function(r) { return r.tipo === 'Enfermaria' && r.genero === 'Masculino'; }).length;
    
    var previsaoAlta = leitos.filter(function(l) {
        if (!l.prevAlta || l.prevAlta.trim() === '') return false;
        var prev = normStr(l.prevAlta);
        return prev.includes('hoje');
    });
    
    var previsaoApto, previsaoEnfFem, previsaoEnfMasc;
    
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7' || hospitalId === 'H8' || hospitalId === 'H9') {
        previsaoApto = previsaoAlta.filter(function(l) {
            return l.categoriaEscolhida === 'Apartamento';
        }).length;
        previsaoEnfFem = previsaoAlta.filter(function(l) {
            return l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Feminino';
        }).length;
        previsaoEnfMasc = previsaoAlta.filter(function(l) {
            return l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Masculino';
        }).length;
    } else {
        previsaoApto = previsaoAlta.filter(function(l) {
            return l.tipo === 'Apartamento' || l.tipo === 'APTO';
        }).length;
        previsaoEnfFem = previsaoAlta.filter(function(l) {
            return (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Feminino';
        }).length;
        previsaoEnfMasc = previsaoAlta.filter(function(l) {
            return (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Masculino';
        }).length;
    }
    
    var vagos = leitos.filter(function(l) { return isVago(l); });
    
    var vagosApto = 0, vagosEnfFem = 0, vagosEnfMasc = 0;
    var vagosEnfSemRestricao = 0, vagosEnfFemRestrita = 0, vagosEnfMascRestrita = 0;
    
    if (hospitalId === 'H2' || hospitalId === 'H4') {
        // =================== LÓGICA APENAS PARA CONTRATUAIS ===================
        var capacidadeInfo = window.HOSPITAL_CAPACIDADE ? window.HOSPITAL_CAPACIDADE[hospitalId] : null;
        
        // Definir estrutura de contratuais
        var aptosContratuais, enfsContratuais;
        if (hospitalId === 'H2') {
            aptosContratuais = 20; // leitos 1-20
            enfsContratuais = 16;  // leitos 21-36 (8 pares)
        } else {
            aptosContratuais = 18; // leitos 1-9 + 27-35
            enfsContratuais = 8;   // leitos 10-17 (4 pares)
        }
        
        // APARTAMENTOS: contratuais - ocupados - reservados
        vagosApto = Math.max(0, aptosContratuais - ocupadosApto - reservadosApto);
        
        // ENFERMARIAS: processar apenas leitos CONTRATUAIS com sistema de irmãos
        var irmaosMap, rangeMin, rangeMax;
        if (hospitalId === 'H2') {
            irmaosMap = window.CRUZ_AZUL_IRMAOS || {
                21: 22, 22: 21,
                23: 24, 24: 23,
                25: 26, 26: 25,
                27: 28, 28: 27,
                29: 30, 30: 29,
                31: 32, 32: 31,
                33: 34, 34: 33,
                35: 36, 36: 35
            };
            rangeMin = 21;
            rangeMax = 36;
        } else {
            irmaosMap = window.SANTA_CLARA_IRMAOS || {
                10: 11, 11: 10,
                12: 13, 13: 12,
                14: 15, 15: 14,
                16: 17, 17: 16
            };
            rangeMin = 10;
            rangeMax = 17;
        }
        
        // Processar APENAS leitos vagos DENTRO DO RANGE CONTRATUAL
        var vagosContratuais = vagos.filter(function(l) {
            var tipo = l.tipo || '';
            if (tipo !== 'ENFERMARIA' && tipo !== 'Enfermaria') return false;
            
            var numeroLeito = getLeitoNumero(l.leito);
            return numeroLeito && numeroLeito >= rangeMin && numeroLeito <= rangeMax;
        });
        
        vagosContratuais.forEach(function(leitoVago) {
            var numeroLeito = getLeitoNumero(leitoVago.leito);
            var numeroIrmao = irmaosMap[numeroLeito];
            
            if (!numeroIrmao) {
                vagosEnfSemRestricao++;
                return;
            }
            
            var irmao = leitos.find(function(l) { return getLeitoNumero(l.leito) === numeroIrmao; });
            
            // Irmão vago: sem restrição
            if (!irmao || isVago(irmao)) {
                vagosEnfSemRestricao++;
            }
            // Irmão com isolamento: NÃO conta (leito bloqueado)
            else if (irmao.isolamento && irmao.isolamento !== 'Nao Isolamento' && irmao.isolamento !== 'Não Isolamento') {
                // Não conta nada - leito bloqueado
            }
            // Irmão ocupado: contar por genero
            else {
                if (irmao.genero === 'Feminino') {
                    vagosEnfFemRestrita++;
                } else if (irmao.genero === 'Masculino') {
                    vagosEnfMascRestrita++;
                } else {
                    vagosEnfSemRestricao++;
                }
            }
        });
        
        // CAPACIDADE TOTAL: somar todas as possibilidades
        vagosEnfFem = vagosEnfSemRestricao + vagosEnfFemRestrita;
        vagosEnfMasc = vagosEnfSemRestricao + vagosEnfMascRestrita;
    }

    // Para híbridos, as variáveis serão definidas abaixo no bloco específico
    var vagosAptoFinal = vagosApto || 0;
    var vagosEnfFemFinal = vagosEnfFem || 0;
    var vagosEnfMascFinal = vagosEnfMasc || 0;
    
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7' || hospitalId === 'H8' || hospitalId === 'H9') {
        // V7.0: Híbridos - leitos são 100% flexíveis
        var capacidadeInfoHib = window.HOSPITAL_CAPACIDADE ? window.HOSPITAL_CAPACIDADE[hospitalId] : null;
        var contratuaisHib = capacidadeInfoHib ? capacidadeInfoHib.contratuais : leitos.length;
        
        // V7.0: Calcular total de disponiveis contratuais (descontando reservas)
        var disponiveisTotais = Math.max(0, contratuaisHib - ocupados.length - reservas.length);
        
        // HÍBRIDOS: Cada vago PODE ser qualquer tipo (não simultâneo)
        vagosAptoFinal = disponiveisTotais;
        vagosEnfFemFinal = disponiveisTotais;
        vagosEnfMascFinal = disponiveisTotais;
    }
    
    var tphValues = ocupados
        .map(function(l) {
            var admAt = l.admAt;
            if (!admAt) return null;
            
            var admData = parseAdmDate_Hosp(admAt);
            if (!admData || isNaN(admData.getTime())) return null;
            
            var hoje = new Date();
            var dias = Math.floor((hoje - admData) / (1000 * 60 * 60 * 24));
            return (dias >= 0 && dias <= 365) ? dias : null;
        })
        .filter(function(v) { return v !== null; });
    
    var tphMedio = tphValues.length > 0 
        ? (tphValues.reduce(function(a, b) { return a + b; }, 0) / tphValues.length).toFixed(2)
        : '0.00';
    
    var leitosMais5Diarias = ocupados.filter(function(l) {
        var admAt = l.admAt;
        if (!admAt) return false;
        
        var admData = parseAdmDate_Hosp(admAt);
        if (!admData || isNaN(admData.getTime())) return false;
        
        var hoje = new Date();
        var horas = (hoje - admData) / (1000 * 60 * 60);
        return horas >= 120;
    }).map(function(l) {
        var admData = parseAdmDate_Hosp(l.admAt);
        var dias = Math.floor((new Date() - admData) / (1000 * 60 * 60 * 24));
        
        return { 
            leito: l.identificacaoLeito || l.leito || '---',
            matricula: l.matricula || '---',
            dias: dias
        };
    }).sort(function(a, b) { return b.dias - a.dias; });
    
    var ppsValues = ocupados
        .map(function(l) { return parseInt(l.pps) || 0; })
        .filter(function(v) { return v > 0; });
    var ppsMedio = ppsValues.length > 0
        ? Math.round(ppsValues.reduce(function(a, b) { return a + b; }, 0) / ppsValues.length)
        : 0;
    
    var ppsMenor40 = ocupados.filter(function(l) {
        var pps = parseInt(l.pps) || 0;
        return pps > 0 && pps < 40;
    }).map(function(l) {
        return {
            leito: l.identificacaoLeito || l.leito || '---',
            matricula: l.matricula || '---'
        };
    });
    
    var spictElegiveis = ocupados.filter(function(l) {
        var spict = l.spict;
        if (!spict) return false;
        var norm = normStr(spict);
        return norm === 'elegivel' || norm === 'elegível';
    });
    
    var diretivasPendentes = ocupados.filter(function(l) {
        var spict = l.spict;
        if (!spict) return false;
        
        var spictNorm = normStr(spict);
        var spictElegivel = spictNorm === 'elegivel' || spictNorm === 'elegível';
        
        if (!spictElegivel) return false;
        
        var diretivas = l.diretivas;
        var dirNorm = normStr(diretivas);
        
        var valoresPendentes = ['', 'nao', 'n/a', 'pendente', 'nao se aplica'];
        
        return valoresPendentes.includes(dirNorm);
    }).map(function(l) {
        return {
            leito: l.identificacaoLeito || l.leito || '---',
            matricula: l.matricula || '---'
        };
    });
    
    var totalLeitos = leitos.length;
    
    // V7.0: Usar HOSPITAL_CAPACIDADE para base de calculo
    var capacidadeInfoFinal = window.HOSPITAL_CAPACIDADE ? window.HOSPITAL_CAPACIDADE[hospitalId] : null;
    var contratuais = capacidadeInfoFinal ? capacidadeInfoFinal.contratuais : totalLeitos;
    var base = Math.max(contratuais, ocupados.length);
    var taxaOcupacao = totalLeitos > 0 ? Math.min((ocupados.length / base * 100), 100) : 0;
    
    var modalidadeOcupados = calcularModalidadePorTipo(ocupados, hospitalId);
    var modalidadePrevisao = calcularModalidadePorTipo(previsaoAlta, hospitalId);
    var modalidadeDisponiveis = calcularModalidadesVagos(leitos, hospitalId, reservas);
    
    var nomeHospital = {
        'H1': 'Neomater',
        'H2': 'Cruz Azul',
        'H3': 'Santa Marcelina',
        'H4': 'Santa Clara',
        'H5': 'Adventista',
        'H6': 'Santa Cruz',
        'H7': 'Santa Virgínia',
        'H8': 'São Camilo Ipiranga',
        'H9': 'São Camilo Pompeia'
    };
    
    return {
        nome: nomeHospital[hospitalId] || hospitalId,
        totalLeitos: totalLeitos,
        contratuais: contratuais,
        taxaOcupacao: taxaOcupacao,
        ocupados: {
            total: ocupados.length,
            apartamento: ocupadosApto,
            enf_feminina: ocupadosEnfFem,
            enf_masculina: ocupadosEnfMasc,
            modalidade: modalidadeOcupados
        },
        // V7.0: Novo objeto de reservados
        reservados: {
            total: reservas.length,
            apartamento: reservadosApto,
            enf_feminina: reservadosEnfFem,
            enf_masculina: reservadosEnfMasc
        },
        previsao: {
            total: previsaoAlta.length,
            apartamento: previsaoApto,
            enf_feminina: previsaoEnfFem,
            enf_masculina: previsaoEnfMasc,
            modalidade: modalidadePrevisao
        },
        disponiveis: {
            // V7.0: Disponiveis = Contratuais - Ocupados - Reservados
            total: Math.max(contratuais - ocupados.length - reservas.length, 0),
            apartamento: vagosAptoFinal,
            enf_feminina: vagosEnfFemFinal,
            enf_masculina: vagosEnfMascFinal,
            modalidade: modalidadeDisponiveis
        },
        tph: {
            medio: tphMedio,
            lista: leitosMais5Diarias
        },
        pps: {
            medio: ppsMedio,
            menor40: ppsMenor40
        },
        spict: {
            elegiveis: spictElegiveis.length,
            diretivas: diretivasPendentes.length,
            listaDiretivas: diretivasPendentes
        }
    };
};

// =================== FUNÇÕES DE GAUGE E MODALIDADE ===================
function calcularGaugeOffset_Hosp(porcentagem) {
    var circunferencia = Math.PI * 66; // Raio 66 (20% maior que 55)
    var progresso = (porcentagem / 100) * circunferencia;
    return circunferencia - progresso;
}

function renderGaugeV5_Hosp(porcentagem, cor, numero) {
    var offset = calcularGaugeOffset_Hosp(porcentagem);
    var badgeClass = 'blue';
    cor = CORES_ARCHIPELAGO.azulPrincipal; 
    
    return '\
        <div class="v5-gauge-container">\
            <div style="position: relative;">\
                <svg class="v5-gauge" viewBox="0 0 168 96">\
                    <path d="M 18 84 A 66 66 0 0 1 150 84" \
                          fill="none" \
                          stroke="rgba(255,255,255,0.1)" \
                          stroke-width="17" \
                          stroke-linecap="round"/>\
                    <path d="M 18 84 A 66 66 0 0 1 150 84" \
                          fill="none" \
                          stroke="' + cor + '" \
                          stroke-width="17" \
                          stroke-linecap="round"\
                          stroke-dasharray="207.3"\
                          stroke-dashoffset="' + offset + '"/>\
                </svg>\
                <div class="v5-number-inside">' + numero.toString().padStart(2, '0') + '</div>\
            </div>\
            <div class="v5-badge-below ' + badgeClass + '">' + porcentagem.toFixed(0) + '%</div>\
        </div>\
    ';
}

function renderModalidadeContratual_Hosp(modalidade) {
    return '\
        <div class="lista-simples-compacta">\
            <div class="lista-item-compacto">\
                <span class="label">Flexíveis Quanto ao Plano</span>\
                <span class="valor">' + (modalidade.flexiveis || 0) + '</span>\
            </div>\
            <div class="lista-item-compacto">\
                <span class="label">Exclusivamente Apartamentos</span>\
                <span class="valor">' + (modalidade.exclusivo_apto || 0) + '</span>\
            </div>\
            <div class="lista-item-compacto">\
                <span class="label">Exclus. Enf Sem Restrição</span>\
                <span class="valor">' + (modalidade.exclusivo_enf_sem_restricao || 0) + '</span>\
            </div>\
            <div class="lista-item-compacto">\
                <span class="label">Exclus. Enf Feminina</span>\
                <span class="valor">' + (modalidade.exclusivo_enf_fem || 0) + '</span>\
            </div>\
            <div class="lista-item-compacto">\
                <span class="label">Exclus. Enf Masculina</span>\
                <span class="valor">' + (modalidade.exclusivo_enf_masc || 0) + '</span>\
            </div>\
        </div>\
    ';
}

function renderMiniGaugeTPH_Hosp(dias) {
    var diasNum = typeof dias === 'string' ? parseFloat(dias) : dias;
    
    var maxDias = 10;
    var porcentagem = (diasNum / maxDias) * 100;
    
    var corClass = 'green';
    if (diasNum >= 9) corClass = 'red';
    else if (diasNum >= 6) corClass = 'yellow';
    
    var totalBlocos = 20;
    var blocosCheios = Math.round((diasNum / maxDias) * totalBlocos);
    
    var blocos = '';
    for (var i = 0; i < totalBlocos; i++) {
        blocos += '<div class="tph-gauge-block ' + (i < blocosCheios ? 'filled' : 'empty') + '"></div>';
    }
    
    return '\
        <div class="tph-mini-gauge">\
            <div class="tph-gauge-bar ' + corClass + '">\
                ' + blocos + '\
            </div>\
            <span class="tph-gauge-label">' + diasNum.toFixed(2) + '/' + maxDias + '</span>\
        </div>\
    ';
}

window.renderDashboardHospitalar = function() {
    console.log('Renderizando Dashboard Enfermarias V7.0');
    
    var container = document.getElementById('dashHospitalarContent');
    if (!container) {
        var dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
        }
    }
    
    if (!container) {
        container = document.getElementById('dashboardContainer');
        if (!container) {
            console.error('Nenhum container encontrado');
            return;
        }
    }
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = '\
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, ' + CORES_ARCHIPELAGO.azulMarinhoEscuro + ' 0%, ' + CORES_ARCHIPELAGO.azulEscuro + ' 100%); border-radius: 12px; margin: 20px; padding: 40px;">\
                <div style="width: 60px; height: 60px; border: 3px solid ' + CORES_ARCHIPELAGO.azulPrincipal + '; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>\
                <h2 style="color: ' + CORES_ARCHIPELAGO.azulPrincipal + '; margin-bottom: 10px; font-size: 20px;">Aguardando Dados</h2>\
                <p style="color: ' + CORES_ARCHIPELAGO.cinzaMedio + '; font-size: 14px;">Conectando com Google Apps Script...</p>\
            </div>\
            <style>\
                @keyframes spin {\
                    from { transform: rotate(0deg); }\
                    to { transform: rotate(360deg); }\
                }\
            </style>\
        ';
        
        setTimeout(function() {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
        return;
    }
    
    var ordemAlfabetica = ['H5', 'H2', 'H1', 'H4', 'H3', 'H6', 'H7', 'H8', 'H9'];
    
    var hospitaisComDados = ordemAlfabetica.filter(function(hospitalId) {
        var hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(function(l) { return isOcupado(l) || isVago(l); });
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = '\
            <div style="text-align: center; padding: 50px; color: white; background: ' + CORES_ARCHIPELAGO.azulMarinhoEscuro + '; border-radius: 12px;">\
                <h3 style="color: ' + CORES_ARCHIPELAGO.amarelo + '; margin-bottom: 15px;">Nenhum Dado Hospitalar Disponível</h3>\
                <p style="color: ' + CORES_ARCHIPELAGO.cinzaMedio + '; margin-bottom: 20px;">Aguardando dados reais da planilha Google.</p>\
                <button onclick="window.forceDataRefresh()" style="background: ' + CORES_ARCHIPELAGO.azulPrincipal + '; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">\
                    Recarregar Dados Reais\
                </button>\
            </div>\
        ';
        return;
    }
    
    var hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = '\
        <div class="dashboard-hospitalar-wrapper" style="background: linear-gradient(135deg, ' + CORES_ARCHIPELAGO.azulMarinhoEscuro + ' 0%, ' + CORES_ARCHIPELAGO.azulEscuro + ' 100%); min-height: 100vh; padding: 20px; color: white; font-family: \'Poppins\', sans-serif;">\
            \
            <!-- HEADER STICKY MOBILE - V7.4 -->\
            <div id="stickyHospitalHeader" class="sticky-hospital-header">\
                <span id="stickyHospitalName">Dashboard Enfermarias</span>\
            </div>\
            \
            <!-- HEADER COM FILTRO -->\
            <div class="dashboard-header-filtro">\
                <h2 class="dashboard-title-central">Dashboard Enfermarias</h2>\
                \
                <!-- DROPDOWN COM TODOS OS HOSPITAIS -->\
                <div class="hospital-filter-selector">\
                    <select id="hospitalFilterDropdown" class="hospital-filter-select" onchange="window.filtrarHospitalDashboard(this.value)">\
                        <option value="todos" selected>Todos</option>\
                        <option value="H5">Adventista</option>\
                        <option value="H2">Cruz Azul</option>\
                        <option value="H1">Neomater</option>\
                        <option value="H4">Santa Clara</option>\
                        <option value="H6">Santa Cruz</option>\
                        <option value="H3">Santa Marcelina</option>\
                        <option value="H7">Santa Virgínia</option>\
                        <option value="H8">São Camilo Ipiranga</option>\
                        <option value="H9">São Camilo Pompeia</option>\
                    </select>\
                </div>\
                \
                <button onclick="window.copiarDashboardParaWhatsApp()" class="btn-whatsapp-dashboard">\
                    Relatório Via WhatsApp\
                </button>\
            </div>\
            \
            <div class="hospitais-container">\
                ' + hospitaisComDados.map(function(hospitalId) { return renderHospitalSection(hospitalId, hoje); }).join('') + '\
            </div>\
        </div>\
        \
        ' + getHospitalConsolidadoCSS() + '\
    ';
    
    var aguardarChartJS = function() {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(function() {
            hospitaisComDados.forEach(function(hospitalId) {
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId);
                if (CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO) {
                    renderLinhasHospital(hospitalId);
                }
            });
            
            console.log('Dashboard Enfermarias renderizado com sucesso!');
        }, 100);
    };
    
    aguardarChartJS();
    
    // =================== V7.4: HEADER STICKY MOBILE - INTERSECTION OBSERVER ===================
    setupStickyHospitalHeader();
};

// V7.4: Setup do header sticky para mobile
function setupStickyHospitalHeader() {
    var stickyHeader = document.getElementById('stickyHospitalHeader');
    var stickyName = document.getElementById('stickyHospitalName');
    var headerFiltro = document.querySelector('.dashboard-header-filtro');
    
    if (!stickyHeader || !stickyName || !headerFiltro) return;
    
    // Detectar se é mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Mapa de nomes dos hospitais
    var nomesHospitais = {
        'H1': 'Neomater',
        'H2': 'Cruz Azul',
        'H3': 'Santa Marcelina',
        'H4': 'Santa Clara',
        'H5': 'Adventista',
        'H6': 'Santa Cruz',
        'H7': 'Santa Virgínia',
        'H8': 'São Camilo Ipiranga',
        'H9': 'São Camilo Pompeia'
    };
    
    // Hospital atualmente visível
    var hospitalAtual = null;
    
    // Intersection Observer para detectar qual hospital está visível
    var observerOptions = {
        root: null,
        rootMargin: '-80px 0px -50% 0px',
        threshold: 0
    };
    
    var hospitalObserver = new IntersectionObserver(function(entries) {
        if (!isMobile()) return;
        
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var hospitalId = entry.target.getAttribute('data-hospital');
                if (hospitalId && nomesHospitais[hospitalId]) {
                    hospitalAtual = hospitalId;
                    stickyName.textContent = nomesHospitais[hospitalId];
                }
            }
        });
    }, observerOptions);
    
    // Observar todos os hospital-cards
    var hospitalCards = document.querySelectorAll('.hospital-card');
    hospitalCards.forEach(function(card) {
        hospitalObserver.observe(card);
    });
    
    // Observer para mostrar/esconder o header sticky baseado no scroll
    var headerObserver = new IntersectionObserver(function(entries) {
        if (!isMobile()) {
            stickyHeader.classList.remove('visible');
            return;
        }
        
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) {
                // Header principal saiu da tela - mostrar sticky
                stickyHeader.classList.add('visible');
            } else {
                // Header principal visível - esconder sticky
                stickyHeader.classList.remove('visible');
            }
        });
    }, { threshold: 0 });
    
    headerObserver.observe(headerFiltro);
    
    // Atualizar em resize
    window.addEventListener('resize', function() {
        if (!isMobile()) {
            stickyHeader.classList.remove('visible');
        }
    });
}
function renderHospitalSection(hospitalId, hoje) {
    var dados = window.processarDadosHospital(hospitalId);
    
    if (!dados || !dados.tph || !dados.pps || !dados.spict) {
        console.error('Dados inválidos para ' + hospitalId);
        return '';
    }
    
    // V7.0: Calcular porcentagem de reservados
    var porcentagemReservados = dados.contratuais > 0 ? (dados.reservados.total / dados.contratuais * 100) : 0;
    
    return '\
        <div class="hospital-card" data-hospital="' + hospitalId + '">\
            <div class="hospital-header">\
                <h3 class="hospital-title">' + dados.nome + '</h3>\
            </div>\
            \
            <div class="kpis-grid">\
                <!-- V7.0: BOX OCUPACAO COM DOIS GAUGES -->\
                <div class="kpi-box box-ocupados">\
                    <div class="kpi-title">Ocupação</div>\
                    \
                    <div class="kpi-content">\
                        <!-- V7.0: Dois gauges lado a lado (Ocupados | Reservados) -->\
                        <div class="dual-gauges-container">\
                            <div class="gauge-with-label">\
                                <div class="gauge-label">Ocupados</div>\
                                ' + renderGaugeV5_Hosp(dados.taxaOcupacao, CORES_ARCHIPELAGO.azulPrincipal, dados.ocupados.total) + '\
                            </div>\
                            <div class="gauge-with-label">\
                                <div class="gauge-label">Reservados</div>\
                                ' + renderGaugeV5_Hosp(porcentagemReservados, CORES_ARCHIPELAGO.azulPrincipal, dados.reservados.total) + '\
                            </div>\
                        </div>\
                        \
                        <!-- V7.0: Tabela com duas colunas -->\
                        <div class="kpi-items-lista">\
                            <div class="kpi-subtitle">Total por Tipo de Leito</div>\
                            <table class="tipo-leito-table">\
                                <thead>\
                                    <tr>\
                                        <th></th>\
                                        <th>Ocupados</th>\
                                        <th>Reservados</th>\
                                    </tr>\
                                </thead>\
                                <tbody>\
                                    <tr>\
                                        <td class="tipo-label">Apartamento</td>\
                                        <td class="tipo-valor">' + dados.ocupados.apartamento + '</td>\
                                        <td class="tipo-valor">' + dados.reservados.apartamento + '</td>\
                                    </tr>\
                                    <tr>\
                                        <td class="tipo-label">Enfermaria Feminina</td>\
                                        <td class="tipo-valor">' + dados.ocupados.enf_feminina + '</td>\
                                        <td class="tipo-valor">' + dados.reservados.enf_feminina + '</td>\
                                    </tr>\
                                    <tr>\
                                        <td class="tipo-label">Enfermaria Masculina</td>\
                                        <td class="tipo-valor">' + dados.ocupados.enf_masculina + '</td>\
                                        <td class="tipo-valor">' + dados.reservados.enf_masculina + '</td>\
                                    </tr>\
                                </tbody>\
                            </table>\
                        </div>\
                    </div>\
                    \
                    <div class="kpi-detalhes">\
                        <div class="detalhe-titulo">Total por Modalidade Contratual</div>\
                        ' + renderModalidadeContratual_Hosp(dados.ocupados.modalidade) + '\
                    </div>\
                </div>\
\
                <div class="kpi-box box-previsao">\
                    <div class="kpi-title">Leitos em Previsão de Alta</div>\
                    \
                    <div class="kpi-content">\
                        ' + renderGaugeV5_Hosp((dados.previsao.total / dados.ocupados.total * 100) || 0, CORES_ARCHIPELAGO.previsao, dados.previsao.total) + '\
                        \
                        <div class="kpi-items-lista">\
                            <div class="kpi-subtitle">Total por Tipo de Leito</div>\
                            <div class="item-lista">\
                                <span class="label">Apartamento</span>\
                                <span class="valor">' + dados.previsao.apartamento + '</span>\
                            </div>\
                            <div class="item-lista">\
                                <span class="label">Enfermaria Feminina</span>\
                                <span class="valor">' + dados.previsao.enf_feminina + '</span>\
                            </div>\
                            <div class="item-lista">\
                                <span class="label">Enfermaria Masculina</span>\
                                <span class="valor">' + dados.previsao.enf_masculina + '</span>\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <div class="kpi-detalhes">\
                        <div class="detalhe-titulo">Total por Modalidade Contratual</div>\
                        ' + renderModalidadeContratual_Hosp(dados.previsao.modalidade) + '\
                    </div>\
                </div>\
\
                <div class="kpi-box box-disponiveis">\
                    <div class="kpi-title">Leitos Disponíveis</div>\
                    \
                    <div class="kpi-content">\
                        ' + renderGaugeV5_Hosp((dados.disponiveis.total / dados.contratuais * 100) || 0, CORES_ARCHIPELAGO.disponiveis, dados.disponiveis.total) + '\
                        \
                        <div class="kpi-items-lista">\
                            <div class="kpi-subtitle">Capacidade Total por Tipo de Leito (não Simultâneo)</div>\
                            <div class="item-lista">\
                                <span class="label">Apartamento</span>\
                                <span class="valor">ate ' + dados.disponiveis.apartamento + '</span>\
                            </div>\
                            <div class="item-lista">\
                                <span class="label">Enfermaria Feminina</span>\
                                <span class="valor">ate ' + dados.disponiveis.enf_feminina + '</span>\
                            </div>\
                            <div class="item-lista">\
                                <span class="label">Enfermaria Masculina</span>\
                                <span class="valor">ate ' + dados.disponiveis.enf_masculina + '</span>\
                            </div>\
                        </div>\
                    </div>\
                    \
                    <div class="kpi-detalhes">\
                        <div class="detalhe-titulo">Total por Modalidade Contratual</div>\
                        ' + renderModalidadeContratual_Hosp(dados.disponiveis.modalidade) + '\
                    </div>\
                </div>\
\
                <div class="kpi-box box-tph">\
                    <div class="kpi-title">TPH Médio</div>\
                    \
                    <div class="kpi-tph-container">\
                        <div class="kpi-tph-numero">' + dados.tph.medio + '</div>\
                        <div class="kpi-tph-label">Dias</div>\
                        ' + renderMiniGaugeTPH_Hosp(dados.tph.medio) + '\
                    </div>\
                    \
                    <div class="kpi-detalhes">\
                        <div class="detalhe-titulo">N Diárias >= 5</div>\
                        ' + (dados.tph.lista && dados.tph.lista.length > 0 ? '\
                            <table class="hospitais-table">\
                                <thead>\
                                    <tr>\
                                        <th style="text-align: left !important;">Leito</th>\
                                        <th style="text-align: center !important;">Matrícula</th>\
                                        <th style="text-align: right !important;">Dias</th>\
                                    </tr>\
                                </thead>\
                                <tbody>\
                                    ' + dados.tph.lista.map(function(l) { return '\
                                        <tr>\
                                            <td style="text-align: left !important;">' + l.leito + '</td>\
                                            <td style="text-align: center !important;">' + l.matricula + '</td>\
                                            <td style="text-align: right !important;">' + l.dias + '</td>\
                                        </tr>\
                                    '; }).join('') + '\
                                </tbody>\
                            </table>\
                        ' : '<div class="sem-dados">Nenhum Leito com 5 ou Mais Diárias</div>') + '\
                    </div>\
                </div>\
\
                <div class="kpi-box box-pps">\
                    <div class="kpi-title">PPS</div>\
                    \
                    <div class="kpi-valores-duplos-divididos">\
                        <div class="kpi-valor-metade">\
                            <div class="valor">' + dados.pps.medio + '</div>\
                            <div class="label">PPS Médio</div>\
                        </div>\
                        <div class="divisor-vertical"></div>\
                        <div class="kpi-valor-metade">\
                            <div class="valor">' + (dados.pps.menor40 && dados.pps.menor40.length || 0).toString().padStart(2, '0') + '</div>\
                            <div class="label">PPS < 40%</div>\
                        </div>\
                    </div>\
                    \
                    <div class="kpi-detalhes">\
                        <div class="detalhe-titulo">PPS < 40%</div>\
                        ' + (dados.pps.menor40 && dados.pps.menor40.length > 0 ? '\
                            <table class="hospitais-table">\
                                <thead>\
                                    <tr>\
                                        <th style="text-align: left !important;">Leito</th>\
                                        <th style="text-align: right !important;">Matrícula</th>\
                                    </tr>\
                                </thead>\
                                <tbody>\
                                    ' + dados.pps.menor40.map(function(l) { return '\
                                        <tr>\
                                            <td style="text-align: left !important;">' + l.leito + '</td>\
                                            <td style="text-align: right !important;">' + l.matricula + '</td>\
                                        </tr>\
                                    '; }).join('') + '\
                                </tbody>\
                            </table>\
                        ' : '<div class="sem-dados">Nenhum Leito com PPS < 40%</div>') + '\
                    </div>\
                </div>\
\
                <div class="kpi-box box-spict">\
                    <div class="kpi-title">SPICT-BR | Diretivas</div>\
                    \
                    <div class="kpi-valores-duplos-divididos">\
                        <div class="kpi-valor-metade">\
                            <div class="valor">' + dados.spict.elegiveis.toString().padStart(2, '0') + '</div>\
                            <div class="label">SPICT-BR</div>\
                        </div>\
                        <div class="divisor-vertical"></div>\
                        <div class="kpi-valor-metade">\
                            <div class="valor">' + dados.spict.diretivas.toString().padStart(2, '0') + '</div>\
                            <div class="label">Diretivas</div>\
                        </div>\
                    </div>\
                    \
                    <div class="kpi-detalhes">\
                        <div class="detalhe-titulo">Diretivas Pendentes</div>\
                        ' + (dados.spict.listaDiretivas && dados.spict.listaDiretivas.length > 0 ? '\
                            <table class="hospitais-table">\
                                <thead>\
                                    <tr>\
                                        <th style="text-align: left !important;">Leito</th>\
                                        <th style="text-align: right !important;">Matrícula</th>\
                                    </tr>\
                                </thead>\
                                <tbody>\
                                    ' + dados.spict.listaDiretivas.map(function(l) { return '\
                                        <tr>\
                                            <td style="text-align: left !important;">' + l.leito + '</td>\
                                            <td style="text-align: right !important;">' + l.matricula + '</td>\
                                        </tr>\
                                    '; }).join('') + '\
                                </tbody>\
                            </table>\
                        ' : '<div class="sem-dados">Nenhuma Diretiva Pendente</div>') + '\
                    </div>\
                </div>\
            </div>\
            \
            <div class="graficos-verticais">\
                <div class="grafico-item">\
                    <div class="chart-header">\
                        <h4>Análise Preditiva de Altas em ' + hoje + '</h4>\
                    </div>\
                    <div class="chart-container">\
                        <canvas id="graficoAltas' + hospitalId + '"></canvas>\
                    </div>\
                </div>\
                \
                <div class="grafico-item">\
                    <div class="chart-header">\
                        <h4>Concessões Previstas em ' + hoje + '</h4>\
                    </div>\
                    <div id="concessoesBoxes' + hospitalId + '" class="timeline-boxes-container"></div>\
                </div>\
                \
                ' + (CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO ? '\
                <div class="grafico-item">\
                    <div class="chart-header">\
                        <h4>Linhas de Cuidado Previstas em ' + hoje + '</h4>\
                    </div>\
                    <div id="linhasBoxes' + hospitalId + '" class="timeline-boxes-container"></div>\
                </div>\
                ' : '') + '\
            </div>\
        </div>\
    ';
}

// =================== GRÁFICOS (COM FILTRO UTI) ===================
var backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: function(chart) {
        var ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

function renderAltasHospital(hospitalId) {
    var canvas = document.getElementById('graficoAltas' + hospitalId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    var hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // V7.0: Filtrar UTI
    var leitos = filtrarLeitosSemUTI(hospital.leitos);
    
    var chartKey = 'altas' + hospitalId;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    var categorias = CONFIG_DASHBOARD.MOSTRAR_96H ? 
        ['HOJE', '24H', '48H', '72H', '96H'] : 
        ['HOJE', '24H', '48H', '72H'];
    
    var dados = {
        'Ouro': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '2R': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '3R': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '48H': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '72H': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '96H': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : []
    };
    
    leitos.forEach(function(leito) {
        if (isOcupado(leito)) {
            var prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (prevAlta) {
                var prev = normStr(prevAlta).replace(/\s+/g, ' ');
                
                var index = -1;
                var tipo = '';
                
                if (prev.includes('hoje') && prev.includes('ouro')) { index = 0; tipo = 'Ouro'; }
                else if (prev.includes('hoje') && prev.includes('2r')) { index = 0; tipo = '2R'; }
                else if (prev.includes('hoje') && prev.includes('3r')) { index = 0; tipo = '3R'; }
                else if ((prev.includes('24h') || prev.includes('24 h')) && prev.includes('ouro')) { index = 1; tipo = 'Ouro'; }
                else if ((prev.includes('24h') || prev.includes('24 h')) && prev.includes('2r')) { index = 1; tipo = '2R'; }
                else if ((prev.includes('24h') || prev.includes('24 h')) && prev.includes('3r')) { index = 1; tipo = '3R'; }
                else if (prev.includes('48h')) { index = 2; tipo = '48H'; }
                else if (prev.includes('72h')) { index = 3; tipo = '72H'; }
                else if (CONFIG_DASHBOARD.MOSTRAR_96H && prev.includes('96h')) { index = 4; tipo = '96H'; }
                
                if (index >= 0 && tipo && dados[tipo]) {
                    dados[tipo][index]++;
                }
            }
        }
    });
    
    var corTexto = window.fundoBranco ? CORES_ARCHIPELAGO.cinzaEscuro : '#ffffff';
    var corGrid = window.fundoBranco ? 'rgba(60, 58, 62, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    var ctx = canvas.getContext('2d');
    
    var dadosSimplificados = CONFIG_DASHBOARD.MOSTRAR_96H ? [
        dados['Ouro'][0] + dados['2R'][0] + dados['3R'][0],
        dados['Ouro'][1] + dados['2R'][1] + dados['3R'][1],
        dados['48H'][2],
        dados['72H'][3],
        dados['96H'][4]
    ] : [
        dados['Ouro'][0] + dados['2R'][0] + dados['3R'][0],
        dados['Ouro'][1] + dados['2R'][1] + dados['3R'][1],
        dados['48H'][2],
        dados['72H'][3]
    ];
    
    var valorMáximo = Math.max.apply(null, dadosSimplificados.concat([0]));
    var limiteSuperior = valorMáximo + 1;
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Previsão de Alta',
                data: dadosSimplificados,
                backgroundColor: CORES_ARCHIPELAGO.azulPrincipal,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            plugins: {
                legend: { 
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(19, 27, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    titleFont: { family: 'Poppins', size: 13, weight: 600 },
                    bodyFont: { family: 'Poppins', size: 12 },
                    callbacks: {
                        label: function(context) {
                            return 'Beneficiários: ' + context.parsed.x;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: limiteSuperior,
                    min: 0,
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto,
                        font: { family: 'Poppins', size: 13, weight: 600 }
                    },
                    grid: {
                        color: corGrid,
                        drawBorder: false
                    },
                    ticks: {
                        color: corTexto,
                        font: { family: 'Poppins', size: 12 },
                        stepSize: 1,
                        precision: 0
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: corTexto,
                        font: { family: 'Poppins', size: 13, weight: 600 }
                    }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
}

// =================== RENDER CONCESSOES HOSPITAL (COM FILTRO UTI E GRÁFICO ROSCA) ===================
function renderConcessoesHospital(hospitalId) {
    var container = document.getElementById('concessoesBoxes' + hospitalId);
    if (!container) return;
    
    var hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // V7.0: Filtrar UTI
    var leitos = filtrarLeitosSemUTI(hospital.leitos);
    
    var concessoesPorTimeline = {
        'HOJE': {},
        '24H': {},
        '48H': {}
    };
    
    leitos.forEach(function(leito) {
        if (isOcupado(leito)) {
            var concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            var prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            var matricula = leito.matricula || 'S/N';
            
            if (concessoes) {
                var concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
                var timeline = null;
                if (prevAlta) {
                    var prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    if (prev.includes('hoje')) timeline = 'HOJE';
                    else if (prev.includes('24h') || prev.includes('24 h')) timeline = '24H';
                    else if (prev.includes('48h')) timeline = '48H';
                }
                
                if (timeline) {
                    concessoesList.forEach(function(concessao) {
                        if (concessao && concessao.trim()) {
                            var nome = window.desnormalizarTexto ? window.desnormalizarTexto(concessao.trim()) : concessao.trim();
                            if (!concessoesPorTimeline[timeline][nome]) {
                                concessoesPorTimeline[timeline][nome] = [];
                            }
                            concessoesPorTimeline[timeline][nome].push(matricula);
                        }
                    });
                }
            }
        }
    });
    
    var html = '<div class="timeline-boxes-grid">';
    
    ['HOJE', '24H', '48H'].forEach(function(timeline) {
        var concessoes = Object.entries(concessoesPorTimeline[timeline])
            .sort(function(a, b) { return b[1].length - a[1].length; });
        
        html += '<div class="timeline-box">';
        html += '<div class="timeline-box-header">' + timeline + '</div>';
        
        html += '<div class="timeline-chart-container">';
        html += '<canvas id="graficoConcessoes' + hospitalId + '_' + timeline + '" class="timeline-chart"></canvas>';
        html += '</div>';
        
        html += '<div class="timeline-box-content">';
        
        if (concessoes.length === 0) {
            html += '<div style="text-align: center; padding: 20px; color: ' + CORES_ARCHIPELAGO.cinzaMedio + '; font-style: italic; font-size: 12px;">Sem Concessões</div>';
        } else {
            concessoes.forEach(function(entry) {
                var nome = entry[0];
                var mats = entry[1];
                var cor = getCorExata(nome, 'concessao');
                html += '<div class="timeline-item" style="border-left-color: ' + cor + ';">';
                html += '<div class="timeline-item-name">' + nome + '</div>';
                html += '<div class="timeline-item-mats">' + mats.join(', ') + '</div>';
                html += '</div>';
            });
        }
        
        html += '</div></div>';
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(function() {
        ['HOJE', '24H', '48H'].forEach(function(timeline) {
            renderDoughnutConcessoes(hospitalId, timeline, concessoesPorTimeline[timeline]);
        });
    }, 100);
}

function renderDoughnutConcessoes(hospitalId, timeline, dados) {
    var canvas = document.getElementById('graficoConcessoes' + hospitalId + '_' + timeline);
    if (!canvas || typeof Chart === 'undefined') return;
    
    var chartKey = 'concessoes' + hospitalId + '_' + timeline;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    var concessoes = Object.entries(dados)
        .sort(function(a, b) { return b[1].length - a[1].length; });
    
    if (concessoes.length === 0) return;
    
    var labels = concessoes.map(function(entry) { return entry[0]; });
    var values = concessoes.map(function(entry) { return entry[1].length; });
    var colors = labels.map(function(label) { return getCorExata(label, 'concessao'); });
    
    var ctx = canvas.getContext('2d');
    
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(19, 27, 46, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { family: 'Poppins', size: 13, weight: 600 },
                bodyFont: { family: 'Poppins', size: 12 },
                callbacks: {
                    label: function(context) {
                        var value = context.parsed;
                        var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                        var percent = ((value / total) * 100).toFixed(1);
                        return context.label + ': ' + value + ' (' + percent + '%)';
                    }
                }
            }
        }
    };
    
    var chartPlugins = [backgroundPlugin];
    
    if (hasDataLabels) {
        chartOptions.plugins.datalabels = {
            color: '#ffffff',
            font: { family: 'Poppins', size: 14, weight: 'bold' },
            formatter: function(value, context) {
                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var porcentagem = ((value / total) * 100).toFixed(0);
                return value + '\n(' + porcentagem + '%)';
            }
        };
        chartPlugins.push(ChartDataLabels);
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                borderColor: 'transparent'
            }]
        },
        options: chartOptions,
        plugins: chartPlugins
    });
}

// =================== RENDER LINHAS HOSPITAL (COM FILTRO UTI E GRÁFICO ROSCA) ===================
function renderLinhasHospital(hospitalId) {
    var container = document.getElementById('linhasBoxes' + hospitalId);
    if (!container) return;
    
    var hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // V7.0: Filtrar UTI
    var leitos = filtrarLeitosSemUTI(hospital.leitos);
    
    var linhasPorTimeline = {
        'HOJE': {},
        '24H': {},
        '48H': {}
    };
    
    leitos.forEach(function(leito) {
        if (isOcupado(leito)) {
            var linhas = leito.linhasCuidado || leito.linhas || (leito.paciente && leito.paciente.linhasCuidado) || (leito.paciente && leito.paciente.linhas);
            var prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            var matricula = leito.matricula || 'S/N';
            
            if (linhas) {
                var linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
                var timeline = null;
                if (prevAlta) {
                    var prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    if (prev.includes('hoje')) timeline = 'HOJE';
                    else if (prev.includes('24h') || prev.includes('24 h')) timeline = '24H';
                    else if (prev.includes('48h')) timeline = '48H';
                }
                
                if (timeline) {
                    linhasList.forEach(function(linha) {
                        if (linha && linha.trim()) {
                            var nome = window.desnormalizarTexto ? window.desnormalizarTexto(linha.trim()) : linha.trim();
                            if (!linhasPorTimeline[timeline][nome]) {
                                linhasPorTimeline[timeline][nome] = [];
                            }
                            linhasPorTimeline[timeline][nome].push(matricula);
                        }
                    });
                }
            }
        }
    });
    
    var html = '<div class="timeline-boxes-grid">';
    
    ['HOJE', '24H', '48H'].forEach(function(timeline) {
        var linhas = Object.entries(linhasPorTimeline[timeline])
            .sort(function(a, b) { return b[1].length - a[1].length; });
        
        html += '<div class="timeline-box">';
        html += '<div class="timeline-box-header">' + timeline + '</div>';
        
        html += '<div class="timeline-chart-container">';
        html += '<canvas id="graficoLinhas' + hospitalId + '_' + timeline + '" class="timeline-chart"></canvas>';
        html += '</div>';
        
        html += '<div class="timeline-box-content">';
        
        if (linhas.length === 0) {
            html += '<div style="text-align: center; padding: 20px; color: ' + CORES_ARCHIPELAGO.cinzaMedio + '; font-style: italic; font-size: 12px;">Sem Linhas de Cuidado</div>';
        } else {
            linhas.forEach(function(entry) {
                var nome = entry[0];
                var mats = entry[1];
                var cor = getCorExata(nome, 'linha');
                html += '<div class="timeline-item" style="border-left-color: ' + cor + ';">';
                html += '<div class="timeline-item-name">' + nome + '</div>';
                html += '<div class="timeline-item-mats">' + mats.join(', ') + '</div>';
                html += '</div>';
            });
        }
        
        html += '</div></div>';
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(function() {
        ['HOJE', '24H', '48H'].forEach(function(timeline) {
            renderDoughnutLinhas(hospitalId, timeline, linhasPorTimeline[timeline]);
        });
    }, 100);
}

function renderDoughnutLinhas(hospitalId, timeline, dados) {
    var canvas = document.getElementById('graficoLinhas' + hospitalId + '_' + timeline);
    if (!canvas || typeof Chart === 'undefined') return;
    
    var chartKey = 'linhas' + hospitalId + '_' + timeline;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    var linhas = Object.entries(dados)
        .sort(function(a, b) { return b[1].length - a[1].length; });
    
    if (linhas.length === 0) return;
    
    var labels = linhas.map(function(entry) { return entry[0]; });
    var values = linhas.map(function(entry) { return entry[1].length; });
    var colors = labels.map(function(label) { return getCorExata(label, 'linha'); });
    
    var ctx = canvas.getContext('2d');
    
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(19, 27, 46, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { family: 'Poppins', size: 13, weight: 600 },
                bodyFont: { family: 'Poppins', size: 12 },
                callbacks: {
                    label: function(context) {
                        var value = context.parsed;
                        var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                        var percent = ((value / total) * 100).toFixed(1);
                        return context.label + ': ' + value + ' (' + percent + '%)';
                    }
                }
            }
        }
    };
    
    var chartPlugins = [backgroundPlugin];
    
    if (hasDataLabels) {
        chartOptions.plugins.datalabels = {
            color: '#ffffff',
            font: { family: 'Poppins', size: 14, weight: 'bold' },
            formatter: function(value, context) {
                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var porcentagem = ((value / total) * 100).toFixed(0);
                return value + '\n(' + porcentagem + '%)';
            }
        };
        chartPlugins.push(ChartDataLabels);
    }
    
    window.chartInstances[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                borderColor: 'transparent'
            }]
        },
        options: chartOptions,
        plugins: chartPlugins
    });
}

// =================== CSS DO DASHBOARD ENFERMARIAS V7.0 ===================
function getHospitalConsolidadoCSS() {
    return '\
        <style>\
            /* V7.4: HEADER STICKY MOBILE */\
            .sticky-hospital-header {\
                display: none;\
                position: fixed;\
                top: 75px;\
                left: 0;\
                right: 0;\
                background: linear-gradient(135deg, #131b2e 0%, #1a2744 100%);\
                padding: 12px 20px;\
                z-index: 999;\
                border-bottom: 2px solid #60a5fa;\
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\
                transform: translateY(-100%);\
                transition: transform 0.3s ease;\
            }\
            \
            .sticky-hospital-header.visible {\
                transform: translateY(0);\
            }\
            \
            .sticky-hospital-header span {\
                color: #60a5fa;\
                font-size: 16px;\
                font-weight: 700;\
                font-family: \'Poppins\', sans-serif;\
                text-align: center;\
                display: block;\
            }\
            \
            @média (max-width: 768px) {\
                .sticky-hospital-header {\
                    display: block;\
                }\
            }\
            \
            @keyframes fadeIn {\
                from { opacity: 0; transform: translateY(10px); }\
                to { opacity: 1; transform: translateY(0); }\
            }\
            \
            .dashboard-hospitalar-wrapper {\
                max-width: 1600px;\
                margin: 0 auto;\
            }\
            \
            .dashboard-header-filtro {\
                display: flex;\
                flex-direction: column;\
                align-items: center;\
                gap: 20px;\
                margin-bottom: 30px;\
                padding: 20px;\
            }\
            \
            .dashboard-title-central {\
                font-size: 28px;\
                font-weight: 700;\
                color: #ffffff;\
                margin: 0;\
                text-align: center;\
                letter-spacing: 0.5px;\
                text-transform: none !important;\
            }\
            \
            .hospital-filter-selector {\
                display: flex;\
                justify-content: center;\
                width: 100%;\
                max-width: 400px;\
            }\
            \
            .hospital-filter-select {\
                width: 100%;\
                min-width: 280px;\
                max-width: 400px;\
                padding: 14px 20px;\
                font-size: 15px;\
                font-weight: 600;\
                color: #ffffff;\
                background: ' + CORES_ARCHIPELAGO.azulEscuro + ';\
                border: 2px solid ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                border-radius: 10px;\
                cursor: pointer;\
                appearance: none;\
                -webkit-appearance: none;\
                -moz-appearance: none;\
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2360a5fa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e");\
                background-repeat: no-repeat;\
                background-position: right 15px center;\
                background-size: 20px;\
                transition: all 0.3s ease;\
                font-family: \'Poppins\', sans-serif;\
            }\
            \
            .hospital-filter-select:hover {\
                border-color: #93c5fd;\
                background-color: rgba(96, 165, 250, 0.1);\
            }\
            \
            .hospital-filter-select:focus {\
                outline: none;\
                border-color: #93c5fd;\
                box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);\
            }\
            \
            .hospital-filter-select option {\
                background: ' + CORES_ARCHIPELAGO.azulMarinhoEscuro + ';\
                color: #ffffff;\
                padding: 12px;\
            }\
            \
            .btn-whatsapp-dashboard {\
                background: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                color: white;\
                border: none;\
                padding: 14px 28px;\
                border-radius: 10px;\
                font-size: 14px;\
                font-weight: 600;\
                cursor: pointer;\
                transition: all 0.3s ease;\
                font-family: \'Poppins\', sans-serif;\
                box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);\
            }\
            \
            .btn-whatsapp-dashboard:hover {\
                transform: translateY(-2px);\
                box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);\
                background: #93c5fd;\
            }\
            \
            .hospitais-container {\
                display: flex;\
                flex-direction: column;\
                gap: 40px;\
            }\
            \
            .hospital-card {\
                background: rgba(255, 255, 255, 0.03);\
                border-radius: 16px;\
                padding: 25px;\
                border: 1px solid rgba(255, 255, 255, 0.08);\
                animation: fadeIn 0.4s ease;\
            }\
            \
            .hospital-header {\
                margin-bottom: 25px;\
                padding-bottom: 15px;\
                border-bottom: 2px solid ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
            }\
            \
            .hospital-title {\
                font-size: 22px;\
                font-weight: 700;\
                color: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                margin: 0;\
                text-transform: none !important;\
            }\
            \
            .kpis-grid {\
                display: grid;\
                grid-template-columns: repeat(3, 1fr);\
                gap: 20px;\
                margin-bottom: 30px;\
            }\
            \
            .kpi-box {\
                background: rgba(255, 255, 255, 0.05);\
                border-radius: 12px;\
                padding: 20px;\
                border: 1px solid rgba(255, 255, 255, 0.1);\
                min-height: 280px;\
                display: flex;\
                flex-direction: column;\
            }\
            \
            .kpi-title {\
                font-size: 14px;\
                font-weight: 700;\
                color: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                margin-bottom: 15px;\
                text-align: center;\
                letter-spacing: 0.5px;\
                text-transform: none !important;\
            }\
            \
            .kpi-content {\
                display: flex;\
                flex-direction: column;\
                align-items: center;\
                gap: 15px;\
                margin-bottom: 15px;\
            }\
            \
            /* V7.0: Estilos para dois gauges lado a lado */\
            .dual-gauges-container {\
                display: flex;\
                justify-content: center;\
                gap: 50px;\
                width: 100%;\
            }\
            \
            .gauge-with-label {\
                display: flex;\
                flex-direction: column;\
                align-items: center;\
            }\
            \
            .gauge-label {\
                font-size: 11px;\
                font-weight: 600;\
                color: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                margin-bottom: 5px;\
                text-transform: none;\
            }\
            \
            /* V7.0: Tabela de tipos de leito com duas colunas */\
            .tipo-leito-table {\
                width: 100%;\
                border-collapse: collapse;\
                font-size: 11px;\
                margin-top: 10px;\
            }\
            \
            .tipo-leito-table thead th {\
                color: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                font-weight: 600;\
                padding: 6px 4px;\
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);\
                font-size: 10px;\
                text-transform: none !important;\
            }\
            \
            .tipo-leito-table thead th:first-child {\
                text-align: left;\
            }\
            \
            .tipo-leito-table thead th:not(:first-child) {\
                text-align: center;\
            }\
            \
            .tipo-leito-table tbody td {\
                padding: 6px 4px;\
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);\
            }\
            \
            .tipo-leito-table tbody td.tipo-label {\
                color: ' + CORES_ARCHIPELAGO.cinzaClaro + ';\
                text-align: left;\
            }\
            \
            .tipo-leito-table tbody td.tipo-valor {\
                color: #ffffff;\
                font-weight: 600;\
                text-align: center;\
            }\
            \
            .v5-gauge-container {\
                display: flex;\
                flex-direction: column;\
                align-items: center;\
                min-width: 96px;\
            }\
            \
            .v5-gauge {\
                width: 96px;\
                height: 60px;\
            }\
            \
            .v5-number-inside {\
                position: absolute;\
                bottom: 6px;\
                left: 50%;\
                transform: translateX(-50%);\
                font-size: 26px;\
                font-weight: 800;\
                color: #ffffff;\
            }\
            \
            .v5-badge-below {\
                margin-top: 8px;\
                padding: 4px 12px;\
                border-radius: 12px;\
                font-size: 11px;\
                font-weight: 700;\
            }\
            \
            .v5-badge-below.blue {\
                background: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                color: ' + CORES_ARCHIPELAGO.azulMarinhoEscuro + ';\
            }\
            \
            .kpi-items-lista {\
                width: 100%;\
            }\
            \
            .kpi-subtitle {\
                font-size: 11px;\
                color: ' + CORES_ARCHIPELAGO.cinzaMedio + ';\
                margin-bottom: 10px;\
                text-transform: none !important;\
            }\
            \
            .item-lista {\
                display: flex;\
                justify-content: space-between;\
                padding: 6px 0;\
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);\
            }\
            \
            .item-lista .label {\
                color: ' + CORES_ARCHIPELAGO.cinzaClaro + ';\
                font-size: 12px;\
            }\
            \
            .item-lista .valor {\
                color: #ffffff;\
                font-weight: 600;\
                font-size: 13px;\
            }\
            \
            .kpi-detalhes {\
                margin-top: auto;\
                padding-top: 15px;\
                border-top: 1px solid rgba(255, 255, 255, 0.1);\
            }\
            \
            .detalhe-titulo {\
                font-size: 11px;\
                color: ' + CORES_ARCHIPELAGO.cinzaMedio + ';\
                margin-bottom: 10px;\
                text-transform: none !important;\
            }\
            \
            .lista-simples-compacta {\
                display: flex;\
                flex-direction: column;\
                gap: 4px;\
            }\
            \
            .lista-item-compacto {\
                display: flex;\
                justify-content: space-between;\
                font-size: 11px;\
            }\
            \
            .lista-item-compacto .label {\
                color: ' + CORES_ARCHIPELAGO.azulClaro + ';\
            }\
            \
            .lista-item-compacto .valor {\
                color: #ffffff;\
                font-weight: 600;\
            }\
            \
            .kpi-tph-container {\
                text-align: center;\
                padding: 20px 0;\
            }\
            \
            .kpi-tph-numero {\
                font-size: 48px;\
                font-weight: 800;\
                color: #ffffff;\
                line-height: 1;\
            }\
            \
            .kpi-tph-label {\
                font-size: 14px;\
                color: ' + CORES_ARCHIPELAGO.cinzaMedio + ';\
                margin-top: 5px;\
            }\
            \
            .tph-mini-gauge {\
                margin-top: 15px;\
            }\
            \
            .tph-gauge-bar {\
                display: flex;\
                gap: 2px;\
                justify-content: center;\
            }\
            \
            .tph-gauge-block {\
                width: 8px;\
                height: 20px;\
                border-radius: 2px;\
                background: rgba(255, 255, 255, 0.1);\
            }\
            \
            .tph-gauge-bar.green .tph-gauge-block.filled {\
                background: ' + CORES_ARCHIPELAGO.verde + ';\
            }\
            \
            .tph-gauge-bar.yellow .tph-gauge-block.filled {\
                background: ' + CORES_ARCHIPELAGO.amarelo + ';\
            }\
            \
            .tph-gauge-bar.red .tph-gauge-block.filled {\
                background: #ef4444;\
            }\
            \
            .tph-gauge-label {\
                font-size: 11px;\
                color: ' + CORES_ARCHIPELAGO.cinzaMedio + ';\
                margin-left: 10px;\
            }\
            \
            .kpi-valores-duplos-divididos {\
                display: flex;\
                align-items: center;\
                justify-content: center;\
                gap: 20px;\
                padding: 20px 0;\
            }\
            \
            .kpi-valor-metade {\
                text-align: center;\
                flex: 1;\
            }\
            \
            .kpi-valor-metade .valor {\
                font-size: 36px;\
                font-weight: 800;\
                color: #ffffff;\
            }\
            \
            .kpi-valor-metade .label {\
                font-size: 12px;\
                color: ' + CORES_ARCHIPELAGO.cinzaMedio + ';\
                margin-top: 5px;\
            }\
            \
            .divisor-vertical {\
                width: 1px;\
                height: 60px;\
                background: rgba(255, 255, 255, 0.2);\
            }\
            \
            .hospitais-table {\
                width: 100%;\
                border-collapse: collapse;\
                font-size: 11px;\
            }\
            \
            .hospitais-table thead th {\
                color: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                font-weight: 600;\
                padding: 8px 4px;\
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);\
                font-size: 10px;\
                text-transform: none !important;\
            }\
            \
            .hospitais-table tbody td {\
                color: #ffffff;\
                padding: 6px 4px;\
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);\
            }\
            \
            .box-tph .hospitais-table thead th:nth-child(1),\
            .box-tph .hospitais-table tbody td:nth-child(1) {\
                text-align: left !important;\
            }\
            .box-tph .hospitais-table thead th:nth-child(2),\
            .box-tph .hospitais-table tbody td:nth-child(2) {\
                text-align: center !important;\
            }\
            .box-tph .hospitais-table thead th:nth-child(3),\
            .box-tph .hospitais-table tbody td:nth-child(3) {\
                text-align: right !important;\
            }\
            \
            .box-pps .hospitais-table thead th:nth-child(1),\
            .box-pps .hospitais-table tbody td:nth-child(1),\
            .box-spict .hospitais-table thead th:nth-child(1),\
            .box-spict .hospitais-table tbody td:nth-child(1) {\
                text-align: left !important;\
            }\
            .box-pps .hospitais-table thead th:nth-child(2),\
            .box-pps .hospitais-table tbody td:nth-child(2),\
            .box-spict .hospitais-table thead th:nth-child(2),\
            .box-spict .hospitais-table tbody td:nth-child(2) {\
                text-align: right !important;\
            }\
            \
            .hospitais-table tbody tr:last-child td {\
                border-bottom: none;\
            }\
            \
            .hospitais-table tbody tr:hover {\
                background: rgba(255, 255, 255, 0.03);\
            }\
            \
            .sem-dados {\
                text-align: center;\
                padding: 15px;\
                color: ' + CORES_ARCHIPELAGO.azulAcinzentado + ';\
                font-style: italic;\
                font-size: 11px;\
                text-transform: none !important;\
            }\
            \
            .graficos-verticais {\
                display: flex;\
                flex-direction: column;\
                gap: 25px;\
                width: 100%;\
            }\
            \
            .grafico-item {\
                width: 100%;\
                background: rgba(255, 255, 255, 0.03);\
                border-radius: 12px;\
                padding: 20px;\
                border: 1px solid rgba(255, 255, 255, 0.8);\
                border-top: 3px solid #ffffff;\
                box-sizing: border-box;\
            }\
            \
            .chart-header {\
                display: flex;\
                justify-content: space-between;\
                align-items: center;\
                margin-bottom: 15px;\
                flex-wrap: wrap;\
                gap: 10px;\
            }\
            \
            .chart-header h4 {\
                margin: 0;\
                color: #e2e8f0;\
                font-size: 16px;\
                font-weight: 600;\
                letter-spacing: 0.5px;\
                text-align: center;\
                width: 100%;\
                text-transform: none !important;\
            }\
            \
            .chart-container {\
                position: relative;\
                height: 400px;\
                width: 100%;\
                background: rgba(156, 163, 175, 0.3);\
                border-radius: 8px;\
                padding: 15px;\
                box-sizing: border-box;\
            }\
            \
            .chart-container canvas {\
                width: 100% !important;\
                height: 100% !important;\
                max-height: 370px !important;\
            }\
            \
            .timeline-boxes-container {\
                width: 100%;\
                margin-top: 15px;\
            }\
            \
            .timeline-boxes-grid {\
                display: grid;\
                grid-template-columns: repeat(3, 1fr);\
                gap: 15px;\
                width: 100%;\
            }\
            \
            .timeline-box {\
                background: rgba(255, 255, 255, 0.05);\
                border-radius: 8px;\
                border: 1px solid rgba(255, 255, 255, 0.1);\
                overflow: hidden;\
                min-height: 400px;\
                display: flex;\
                flex-direction: column;\
            }\
            \
            .timeline-box-header {\
                background: rgba(96, 165, 250, 0.2);\
                padding: 12px;\
                text-align: center;\
                font-size: 14px;\
                font-weight: 700;\
                letter-spacing: 0.5px;\
                color: ' + CORES_ARCHIPELAGO.azulPrincipal + ';\
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);\
                text-transform: none !important;\
            }\
            \
            .timeline-chart-container {\
                height: 200px;\
                padding: 15px;\
                background: rgba(0, 0, 0, 0.1);\
                display: flex;\
                align-items: center;\
                justify-content: center;\
            }\
            \
            .timeline-chart {\
                max-height: 180px !important;\
            }\
            \
            .timeline-box-content {\
                padding: 12px;\
                flex: 1;\
                overflow-y: auto;\
                max-height: 250px;\
            }\
            \
            .timeline-item {\
                background: rgba(255, 255, 255, 0.03);\
                border-radius: 6px;\
                padding: 10px;\
                margin-bottom: 8px;\
                border-left: 3px solid;\
                transition: all 0.2s ease;\
            }\
            \
            .timeline-item:hover {\
                background: rgba(255, 255, 255, 0.07);\
                transform: translateX(2px);\
            }\
            \
            .timeline-item:last-child {\
                margin-bottom: 0;\
            }\
            \
            .timeline-item-name {\
                font-size: 13px;\
                font-weight: 600;\
                margin-bottom: 6px;\
                color: #ffffff;\
                text-transform: none !important;\
            }\
            \
            .timeline-item-mats {\
                font-size: 11px;\
                color: #ffffff;\
                line-height: 1.4;\
            }\
            \
            /* =================== RESPONSIVIDADE MOBILE =================== */\
            @média (max-width: 768px) {\
                .hospital-filter-selector {\
                    padding: 0 10px;\
                }\
                \
                .hospital-filter-select {\
                    width: 100%;\
                    min-width: auto;\
                    max-width: 100%;\
                    padding: 12px 16px;\
                    font-size: 14px;\
                }\
                \
                .dashboard-title-central {\
                    font-size: 20px !important;\
                }\
                \
                .btn-whatsapp-dashboard {\
                    width: 100%;\
                }\
                \
                .kpis-grid {\
                    grid-template-columns: 1fr;\
                    padding: 0 10px !important;\
                    margin: 0 auto !important;\
                }\
                \
                .kpi-box {\
                    margin-left: auto !important;\
                    margin-right: auto !important;\
                    max-width: 100% !important;\
                }\
                \
                .hospital-card {\
                    padding: 15px !important;\
                    margin: 0 auto 20px auto !important;\
                    max-width: calc(100vw - 20px) !important;\
                }\
                \
                .timeline-boxes-grid {\
                    grid-template-columns: 1fr;\
                }\
                \
                .dashboard-hospitalar-wrapper {\
                    padding: 10px !important;\
                }\
                \
                .hospitais-container {\
                    padding: 0 !important;\
                }\
                \
                .dual-gauges-container {\
                    flex-direction: column;\
                    gap: 15px;\
                }\
            }\
        </style>\
    ';
}

// =================== ALIASES E EXPORTS V7.0 ===================
window.renderizarDashboard = window.renderDashboardHospitalar;
window.renderDashboard = window.renderDashboardHospitalar;

// V7.0: Exportar funções de reservas
window.getReservasHospital = getReservasHospital;
window.filtrarLeitosSemUTI = filtrarLeitosSemUTI;

window.forceDataRefresh = function() {
    window.location.reload();
};

console.log('Dashboard Enfermarias V7.0 - Carregado com Sucesso!');
