// js/dashboards/dashboard-hospital.js
// Dashboard Hospitalar - Archipelago V4.0

console.log('Dashboard Hospitalar V4.0 - Inicializando...');

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
    tph: '#577a97',
    pps: '#1c5083',
    spict: '#172945'
};

const CONFIG_DASHBOARD = {
    MOSTRAR_LINHAS_CUIDADO: false,
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
    
    let cor = paleta[itemName];
    if (cor) return cor;
    
    const nomeNorm = itemName.trim().replace(/\s+/g, ' ').replace(/[–—]/g, '-');
    cor = paleta[nomeNorm];
    if (cor) return cor;
    
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
 * @param {HTMLElement} botao - Elemento do botão clicado
 */
window.filtrarHospitalDashboard = function(hospitalId, botao) {
    console.log('[FILTRO] Filtrando:', hospitalId);
    
    // Atualizar variável global
    window.hospitalFiltroAtual = hospitalId;
    
    // Remover active de todos os botões
    document.querySelectorAll('.hospital-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adicionar active no botão clicado
    if (botao) {
        botao.classList.add('active');
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
    
    console.log('[FILTRO] Visíveis:', totalVisiveis);
};

window.copiarDashboardParaWhatsApp = function() {
    const hospitaisIds = ['H5', 'H2', 'H1', 'H4', 'H3', 'H6', 'H7'];
    const hospitaisNomes = {
        'H1': 'NEOMATER',
        'H2': 'CRUZ AZUL',
        'H3': 'SANTA MARCELINA',
        'H4': 'SANTA CLARA',
        'H5': 'ADVENTISTA',
        'H6': 'SANTA CRUZ',
        'H7': 'SANTA VIRGINIA'
    };
    
    // Verificar qual hospital está selecionado
    const filtroAtual = window.hospitalFiltroAtual || 'todos';
    const hospitaisParaRelatorio = filtroAtual === 'todos' ? hospitaisIds : [filtroAtual];
    
    let texto = filtroAtual === 'todos' ? 
        `*DASHBOARD HOSPITALAR*\n` : 
        `*DASHBOARD HOSPITALAR - ${hospitaisNomes[filtroAtual]}*\n`;
    
    texto += `${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n\n`;
    
    hospitaisParaRelatorio.forEach((hospitalId, index) => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        const nome = hospitaisNomes[hospitalId];
        
        if (filtroAtual === 'todos') {
            texto += `━━━━━━━━━━━━━━━━━\n`;
            texto += `*${index + 1}. ${nome}*\n`;
            texto += `━━━━━━━━━━━━━━━━━\n\n`;
        }
        
        // ========== ALTAS PREVISTAS ==========
        const altasTimeline = {
            'HOJE': { 'Ouro': [], '2R': [], '3R': [] },
            '24H': { 'Ouro': [], '2R': [], '3R': [] },
            '48H': []
        };
        
        hospital.leitos.forEach(leito => {
            if (isOcupado(leito)) {
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || 'S/N';
                
                if (prevAlta) {
                    const prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    
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
        
        const temAltasHoje = altasTimeline['HOJE']['Ouro'].length > 0 || altasTimeline['HOJE']['2R'].length > 0 || altasTimeline['HOJE']['3R'].length > 0;
        const temAltas24h = altasTimeline['24H']['Ouro'].length > 0 || altasTimeline['24H']['2R'].length > 0 || altasTimeline['24H']['3R'].length > 0;
        const temAltas48h = altasTimeline['48H'].length > 0;
        
        if (temAltasHoje) {
            texto += `*Altas Previstas HOJE:*\n`;
            if (altasTimeline['HOJE']['Ouro'].length > 0) {
                texto += `Hoje Ouro: ${altasTimeline['HOJE']['Ouro'].join(', ')}\n`;
            }
            if (altasTimeline['HOJE']['2R'].length > 0) {
                texto += `Hoje 2R: ${altasTimeline['HOJE']['2R'].join(', ')}\n`;
            }
            if (altasTimeline['HOJE']['3R'].length > 0) {
                texto += `Hoje 3R: ${altasTimeline['HOJE']['3R'].join(', ')}\n`;
            }
            texto += `\n`;
        }
        
        if (temAltas24h) {
            texto += `*Altas Previstas 24H:*\n`;
            if (altasTimeline['24H']['Ouro'].length > 0) {
                texto += `24h Ouro: ${altasTimeline['24H']['Ouro'].join(', ')}\n`;
            }
            if (altasTimeline['24H']['2R'].length > 0) {
                texto += `24h 2R: ${altasTimeline['24H']['2R'].join(', ')}\n`;
            }
            if (altasTimeline['24H']['3R'].length > 0) {
                texto += `24h 3R: ${altasTimeline['24H']['3R'].join(', ')}\n`;
            }
            texto += `\n`;
        }
        
        if (temAltas48h) {
            texto += `*Altas Previstas 48H:*\n`;
            texto += `48h: ${altasTimeline['48H'].join(', ')}\n\n`;
        }
        
        // ========== CONCESSÕES PREVISTAS ==========
        const concessoesTimeline = {
            'HOJE': {},
            '24H': {}
        };
        
        hospital.leitos.forEach(leito => {
            if (isOcupado(leito)) {
                const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
                const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
                const matricula = leito.matricula || 'S/N';
                
                if (concessoes && prevAlta) {
                    const concessoesList = Array.isArray(concessoes) ? 
                        concessoes : 
                        String(concessoes).split('|');
                    
                    const prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    let timeline = null;
                    
                    if (prev.includes('hoje')) timeline = 'HOJE';
                    else if (prev.includes('24h') || prev.includes('24 h')) timeline = '24H';
                    
                    if (timeline) {
                        concessoesList.forEach(concessao => {
                            if (concessao && concessao.trim()) {
                                const nome = concessao.trim();
                                if (!concessoesTimeline[timeline][nome]) {
                                    concessoesTimeline[timeline][nome] = [];
                                }
                                concessoesTimeline[timeline][nome].push(matricula);
                            }
                        });
                    }
                }
            }
        });
        
        const temConcessoesHoje = Object.keys(concessoesTimeline['HOJE']).length > 0;
        const temConcessoes24h = Object.keys(concessoesTimeline['24H']).length > 0;
        
        if (temConcessoesHoje) {
            texto += `*Concessões Previstas HOJE:*\n`;
            Object.entries(concessoesTimeline['HOJE']).forEach(([nome, mats]) => {
                texto += `${nome}: ${mats.join(', ')}\n`;
            });
            texto += `\n`;
        }
        
        if (temConcessoes24h) {
            texto += `*Concessões Previstas 24H:*\n`;
            Object.entries(concessoesTimeline['24H']).forEach(([nome, mats]) => {
                texto += `${nome}: ${mats.join(', ')}\n`;
            });
            texto += `\n`;
        }
        
        // ========== DIRETIVAS PENDENTES ==========
        const diretivasPendentes = hospital.leitos.filter(l => {
            if (!isOcupado(l)) return false;
            
            const spict = l.spict;
            if (!spict) return false;
            
            const spictNorm = normStr(spict);
            const spictElegivel = spictNorm === 'elegivel' || spictNorm === 'elegível';
            
            if (!spictElegivel) return false;
            
            const diretivas = l.diretivas;
            const dirNorm = normStr(diretivas);
            
            const valoresPendentes = ['', 'não', 'nao', 'n/a', 'pendente', 'não se aplica'];
            
            return valoresPendentes.includes(dirNorm);
        });
        
        if (diretivasPendentes.length > 0) {
            texto += `*Diretivas Pendentes:*\n`;
            diretivasPendentes.forEach(l => {
                const leito = l.identificacaoLeito || l.leito || '---';
                const matricula = l.matricula || '---';
                texto += `Leito ${leito} - Mat. ${matricula}\n`;
            });
            texto += `\n`;
        }
        
        // Se não tem nada
        if (!temAltasHoje && !temAltas24h && !temAltas48h && !temConcessoesHoje && !temConcessoes24h && diretivasPendentes.length === 0) {
            texto += `_Nenhuma atividade prevista_\n\n`;
        }
    });
    
    navigator.clipboard.writeText(texto).then(() => {
        alert('Dados copiados para o WhatsApp!\n\nCole e envie.');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar. Tente novamente.');
    });
};

function calcularModalidadesVagos(leitos, hospitalId) {
    const modalidade = {
        flexiveis: 0,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
    };

    const vagos = leitos.filter(l => isVago(l));

    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        modalidade.flexiveis = vagos.length;
        return modalidade;
    }

    if (hospitalId === 'H4') {
        const ocupados = leitos.filter(l => isOcupado(l));
        
        const aptosOcupados = ocupados.filter(l => 
            l.categoriaEscolhida === 'Apartamento'
        ).length;
        
        const enfOcupadas = ocupados.filter(l => 
            l.categoriaEscolhida === 'Enfermaria'
        ).length;
        
        modalidade.flexiveis = 0;
        modalidade.exclusivo_apto = Math.max(0, 9 - aptosOcupados);
        modalidade.exclusivo_enf_sem_restricao = Math.max(0, 4 - enfOcupadas);
        modalidade.exclusivo_enf_fem = 0;
        modalidade.exclusivo_enf_masc = 0;
        
        return modalidade;
    }

    if (hospitalId === 'H2') {
        vagos.forEach(leitoVago => {
            const tipo = leitoVago.tipo || '';
            
            if (tipo === 'APTO' || tipo === 'Apartamento') {
                modalidade.exclusivo_apto++;
                return;
            }
            
            if (tipo === 'ENFERMARIA' || tipo === 'Enfermaria') {
                const numeroLeito = getLeitoNumero(leitoVago.leito);
                
                if (!numeroLeito) {
                    modalidade.exclusivo_enf_sem_restricao++;
                    return;
                }
                
                const numeroIrmao = (numeroLeito % 2 === 0) 
                    ? numeroLeito - 1
                    : numeroLeito + 1;
                
                const irmao = leitos.find(l => getLeitoNumero(l.leito) === numeroIrmao);
                
                if (!irmao || isVago(irmao)) {
                    modalidade.exclusivo_enf_sem_restricao++;
                } else if (irmao.isolamento && irmao.isolamento !== 'Não Isolamento') {
                    // Isolamento: leito não disponível
                } else {
                    if (irmao.genero === 'Feminino') {
                        modalidade.exclusivo_enf_fem++;
                    } else if (irmao.genero === 'Masculino') {
                        modalidade.exclusivo_enf_masc++;
                    } else {
                        modalidade.exclusivo_enf_sem_restricao++;
                    }
                }
            }
        });
        
        return modalidade;
    }

    return modalidade;
}

function calcularModalidadePorTipo(leitos, hospitalId) {
    const modalidade = {
        flexiveis: 0,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
    };

    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        modalidade.flexiveis = leitos.length;
        return modalidade;
    }

    leitos.forEach(leito => {
        const catEscolhida = leito.categoriaEscolhida || leito.categoria || '';
        const genero = leito.genero || '';
        
        if (catEscolhida === 'Apartamento') {
            modalidade.exclusivo_apto++;
        } else if (catEscolhida === 'Enfermaria') {
            if (hospitalId === 'H2') {
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

window.processarDadosHospital = function(hospitalId) {
    const hospitalObj = window.hospitalData[hospitalId] || {};
    
    let leitos = hospitalObj.leitos || hospitalObj || [];
    if (!Array.isArray(leitos)) {
        leitos = [];
    }
    
    const ocupados = leitos.filter(l => isOcupado(l));
    
    let ocupadosApto, ocupadosEnfFem, ocupadosEnfMasc;
    
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H4' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        ocupadosApto = ocupados.filter(l => 
            l.categoriaEscolhida === 'Apartamento'
        ).length;
        ocupadosEnfFem = ocupados.filter(l => 
            l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Feminino'
        ).length;
        ocupadosEnfMasc = ocupados.filter(l => 
            l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Masculino'
        ).length;
    } else {
        ocupadosApto = ocupados.filter(l => 
            l.tipo === 'Apartamento' || l.tipo === 'APTO'
        ).length;
        ocupadosEnfFem = ocupados.filter(l => 
            (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Feminino'
        ).length;
        ocupadosEnfMasc = ocupados.filter(l => 
            (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Masculino'
        ).length;
    }
    
    const previsaoAlta = leitos.filter(l => {
        if (!l.prevAlta || l.prevAlta.trim() === '') return false;
        const prev = normStr(l.prevAlta);
        return prev.includes('hoje');
    });
    
    let previsaoApto, previsaoEnfFem, previsaoEnfMasc;
    
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H4' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        previsaoApto = previsaoAlta.filter(l => 
            l.categoriaEscolhida === 'Apartamento'
        ).length;
        previsaoEnfFem = previsaoAlta.filter(l => 
            l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Feminino'
        ).length;
        previsaoEnfMasc = previsaoAlta.filter(l => 
            l.categoriaEscolhida === 'Enfermaria' && l.genero === 'Masculino'
        ).length;
    } else {
        previsaoApto = previsaoAlta.filter(l => 
            l.tipo === 'Apartamento' || l.tipo === 'APTO'
        ).length;
        previsaoEnfFem = previsaoAlta.filter(l => 
            (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Feminino'
        ).length;
        previsaoEnfMasc = previsaoAlta.filter(l => 
            (l.tipo === 'ENFERMARIA' || l.tipo === 'Enfermaria') && l.genero === 'Masculino'
        ).length;
    }
    
    const vagos = leitos.filter(l => isVago(l));
    
    let vagosApto, vagosEnfFem, vagosEnfMasc;
    
    if (hospitalId === 'H2') {
        vagosApto = vagos.filter(l => 
            l.tipo === 'Apartamento' || l.tipo === 'APTO'
        ).length;
        
        vagosEnfFem = 0;
        vagosEnfMasc = 0;
        let vagosEnfSemRestricao = 0;
        
        vagos.forEach(leitoVago => {
            const tipo = leitoVago.tipo || '';
            
            if (tipo === 'ENFERMARIA' || tipo === 'Enfermaria') {
                const numeroLeito = getLeitoNumero(leitoVago.leito);
                
                if (!numeroLeito) {
                    vagosEnfSemRestricao++;
                    return;
                }
                
                const numeroIrmao = (numeroLeito % 2 === 0) 
                    ? numeroLeito - 1
                    : numeroLeito + 1;
                
                const irmao = leitos.find(l => getLeitoNumero(l.leito) === numeroIrmao);
                
                if (!irmao || isVago(irmao)) {
                    vagosEnfSemRestricao++;
                } else if (irmao.isolamento && irmao.isolamento !== 'Não Isolamento') {
                    // Isolamento
                } else {
                    if (irmao.genero === 'Feminino') {
                        vagosEnfFem++;
                    } else if (irmao.genero === 'Masculino') {
                        vagosEnfMasc++;
                    } else {
                        vagosEnfSemRestricao++;
                    }
                }
            }
        });
    } else {
        vagosApto = vagos.filter(l => 
            l.tipo === 'Apartamento' || l.tipo === 'APTO' || l.tipo === 'Híbrido'
        ).length;
        vagosEnfFem = vagos.filter(l => 
            l.tipo === 'Enfermaria Feminina'
        ).length;
        vagosEnfMasc = vagos.filter(l => 
            l.tipo === 'Enfermaria Masculina'
        ).length;
    }

    let vagosAptoFinal = vagosApto;
    let vagosEnfFemFinal = vagosEnfFem;
    let vagosEnfMascFinal = vagosEnfMasc;
    
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        vagosAptoFinal = vagos.length;
        vagosEnfFemFinal = vagos.length;
        vagosEnfMascFinal = vagos.length;
    }
    
    const tphValues = ocupados
        .map(l => {
            const admAt = l.admAt;
            if (!admAt) return null;
            
            const admData = parseAdmDate_Hosp(admAt);
            if (!admData || isNaN(admData.getTime())) return null;
            
            const hoje = new Date();
            const dias = Math.floor((hoje - admData) / (1000 * 60 * 60 * 24));
            return (dias >= 0 && dias <= 365) ? dias : null;
        })
        .filter(v => v !== null);
    
    const tphMedio = tphValues.length > 0 
        ? (tphValues.reduce((a, b) => a + b, 0) / tphValues.length).toFixed(2)
        : '0.00';
    
    const leitosMais5Diarias = ocupados.filter(l => {
        const admAt = l.admAt;
        if (!admAt) return false;
        
        const admData = parseAdmDate_Hosp(admAt);
        if (!admData || isNaN(admData.getTime())) return false;
        
        const hoje = new Date();
        const horas = (hoje - admData) / (1000 * 60 * 60);
        return horas >= 120;
    }).map(l => {
        const admData = parseAdmDate_Hosp(l.admAt);
        const dias = Math.floor((new Date() - admData) / (1000 * 60 * 60 * 24));
        
        return { 
            leito: l.identificacaoLeito || l.leito || '---',
            matricula: l.matricula || '---',
            dias: dias
        };
    }).sort((a, b) => b.dias - a.dias);
    
    const ppsValues = ocupados
        .map(l => parseInt(l.pps) || 0)
        .filter(v => v > 0);
    const ppsMedio = ppsValues.length > 0
        ? Math.round(ppsValues.reduce((a, b) => a + b, 0) / ppsValues.length)
        : 0;
    
    const ppsMenor40 = ocupados.filter(l => {
        const pps = parseInt(l.pps) || 0;
        return pps > 0 && pps < 40;
    }).map(l => ({
        leito: l.identificacaoLeito || l.leito || '---',
        matricula: l.matricula || '---'
    }));
    
    const spictElegiveis = ocupados.filter(l => {
        const spict = l.spict;
        if (!spict) return false;
        const norm = normStr(spict);
        return norm === 'elegivel' || norm === 'elegível';
    });
    
    const diretivasPendentes = ocupados.filter(l => {
        const spict = l.spict;
        if (!spict) return false;
        
        const spictNorm = normStr(spict);
        const spictElegivel = spictNorm === 'elegivel' || spictNorm === 'elegível';
        
        if (!spictElegivel) return false;
        
        const diretivas = l.diretivas;
        const dirNorm = normStr(diretivas);
        
        const valoresPendentes = ['', 'não', 'nao', 'n/a', 'pendente', 'não se aplica'];
        
        return valoresPendentes.includes(dirNorm);
    }).map(l => ({
        leito: l.identificacaoLeito || l.leito || '---',
        matricula: l.matricula || '---'
    }));
    
    const totalLeitos = leitos.length;
    const taxaOcupacao = totalLeitos > 0 ? (ocupados.length / totalLeitos * 100) : 0;
    
    const modalidadeOcupados = calcularModalidadePorTipo(ocupados, hospitalId);
    const modalidadePrevisao = calcularModalidadePorTipo(previsaoAlta, hospitalId);
    const modalidadeDisponiveis = calcularModalidadesVagos(leitos, hospitalId);
    
    const nomeHospital = {
        'H1': 'Neomater',
        'H2': 'Cruz Azul',
        'H3': 'Santa Marcelina',
        'H4': 'Santa Clara',
        'H5': 'Adventista',
        'H6': 'Santa Cruz',
        'H7': 'Santa Virgínia'
    };
    
    return {
        nome: nomeHospital[hospitalId] || hospitalId,
        totalLeitos,
        taxaOcupacao,
        ocupados: {
            total: ocupados.length,
            apartamento: ocupadosApto,
            enf_feminina: ocupadosEnfFem,
            enf_masculina: ocupadosEnfMasc,
            modalidade: modalidadeOcupados
        },
        previsao: {
            total: previsaoAlta.length,
            apartamento: previsaoApto,
            enf_feminina: previsaoEnfFem,
            enf_masculina: previsaoEnfMasc,
            modalidade: modalidadePrevisao
        },
        disponiveis: {
            total: vagos.length,
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

function calcularGaugeOffset_Hosp(porcentagem) {
    const circunferencia = Math.PI * 55;
    const progresso = (porcentagem / 100) * circunferencia;
    return circunferencia - progresso;
}

function renderGaugeV5_Hosp(porcentagem, cor, numero) {
    const offset = calcularGaugeOffset_Hosp(porcentagem);
    const badgeClass = 'blue';
    cor = CORES_ARCHIPELAGO.azulPrincipal; 
    
    return `
        <div class="v5-gauge-container">
            <div style="position: relative;">
                <svg class="v5-gauge" viewBox="0 0 140 80">
                    <path d="M 15 70 A 55 55 0 0 1 125 70" 
                          fill="none" 
                          stroke="rgba(255,255,255,0.1)" 
                          stroke-width="14" 
                          stroke-linecap="round"/>
                    <path d="M 15 70 A 55 55 0 0 1 125 70" 
                          fill="none" 
                          stroke="${cor}" 
                          stroke-width="14" 
                          stroke-linecap="round"
                          stroke-dasharray="172.8"
                          stroke-dashoffset="${offset}"/>
                </svg>
                <div class="v5-number-inside">${numero.toString().padStart(2, '0')}</div>
            </div>
            <div class="v5-badge-below ${badgeClass}">${porcentagem.toFixed(0)}%</div>
        </div>
    `;
}

function renderModalidadeContratual_Hosp(modalidade) {
    return `
        <div class="lista-simples-compacta">
            <div class="lista-item-compacto">
                <span class="label">Flexíveis Quanto ao Plano</span>
                <span class="valor">${modalidade.flexiveis || 0}</span>
            </div>
            <div class="lista-item-compacto">
                <span class="label">Exclusivamente Apartamentos</span>
                <span class="valor">${modalidade.exclusivo_apto || 0}</span>
            </div>
            <div class="lista-item-compacto">
                <span class="label">Exclus. Enf Sem Restrição</span>
                <span class="valor">${modalidade.exclusivo_enf_sem_restricao || 0}</span>
            </div>
            <div class="lista-item-compacto">
                <span class="label">Exclus. Enf Feminina</span>
                <span class="valor">${modalidade.exclusivo_enf_fem || 0}</span>
            </div>
            <div class="lista-item-compacto">
                <span class="label">Exclus. Enf Masculina</span>
                <span class="valor">${modalidade.exclusivo_enf_masc || 0}</span>
            </div>
        </div>
    `;
}

function renderMiniGaugeTPH_Hosp(dias) {
    const diasNum = typeof dias === 'string' ? parseFloat(dias) : dias;
    
    const maxDias = 10;
    const porcentagem = (diasNum / maxDias) * 100;
    
    let corClass = 'green';
    if (diasNum >= 9) corClass = 'red';
    else if (diasNum >= 6) corClass = 'yellow';
    
    const totalBlocos = 20;
    const blocosCheios = Math.round((diasNum / maxDias) * totalBlocos);
    
    let blocos = '';
    for (let i = 0; i < totalBlocos; i++) {
        blocos += `<div class="tph-gauge-block ${i < blocosCheios ? 'filled' : 'empty'}"></div>`;
    }
    
    return `
        <div class="tph-mini-gauge">
            <div class="tph-gauge-bar ${corClass}">
                ${blocos}
            </div>
            <span class="tph-gauge-label">${diasNum.toFixed(2)}/${maxDias}</span>
        </div>
    `;
}

window.renderDashboardHospitalar = function() {
    console.log('Renderizando Dashboard Hospitalar V4.0');
    
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
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
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, ${CORES_ARCHIPELAGO.azulMarinhoEscuro} 0%, ${CORES_ARCHIPELAGO.azulEscuro} 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid ${CORES_ARCHIPELAGO.azulPrincipal}; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: ${CORES_ARCHIPELAGO.azulPrincipal}; margin-bottom: 10px; font-size: 20px;">Aguardando Dados</h2>
                <p style="color: ${CORES_ARCHIPELAGO.cinzaMedio}; font-size: 14px;">Conectando com Google Apps Script...</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
        return;
    }
    
    const ordemAlfabetica = ['H5', 'H2', 'H1', 'H4', 'H3', 'H6', 'H7'];
    
    const hospitaisComDados = ordemAlfabetica.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => isOcupado(l) || isVago(l));
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; background: ${CORES_ARCHIPELAGO.azulMarinhoEscuro}; border-radius: 12px;">
                <h3 style="color: ${CORES_ARCHIPELAGO.amarelo}; margin-bottom: 15px;">Nenhum Dado Hospitalar Disponível</h3>
                <p style="color: ${CORES_ARCHIPELAGO.cinzaMedio}; margin-bottom: 20px;">Aguardando dados reais da planilha Google.</p>
                <button onclick="window.forceDataRefresh()" style="background: ${CORES_ARCHIPELAGO.azulPrincipal}; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Recarregar Dados Reais
                </button>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div class="dashboard-hospitalar-wrapper" style="background: linear-gradient(135deg, ${CORES_ARCHIPELAGO.azulMarinhoEscuro} 0%, ${CORES_ARCHIPELAGO.azulEscuro} 100%); min-height: 100vh; padding: 20px; color: white; font-family: 'Poppins', sans-serif;">
            
            <!-- HEADER COM FILTRO -->
            <div class="dashboard-header-filtro">
                <h2 class="dashboard-title-central">Dashboard Hospitalar</h2>
                
                <!-- BOTÃO TODOS (PRIMEIRA LINHA) -->
                <div class="filtro-linha-todos">
                    <button class="hospital-filter-btn active" onclick="window.filtrarHospitalDashboard('todos', this)">
                        Todos
                    </button>
                </div>
                
                <!-- BOTÕES DE HOSPITAIS (SEGUNDA LINHA) -->
                <div class="hospital-filter-selector">
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H5', this)">
                        Adventista
                    </button>
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H2', this)">
                        Cruz Azul
                    </button>
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H1', this)">
                        Neomater
                    </button>
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H4', this)">
                        Santa Clara
                    </button>
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H6', this)">
                        Santa Cruz
                    </button>
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H3', this)">
                        Santa Marcelina
                    </button>
                    <button class="hospital-filter-btn" onclick="window.filtrarHospitalDashboard('H7', this)">
                        Santa Virginia
                    </button>
                </div>
                
                <button onclick="window.copiarDashboardParaWhatsApp()" class="btn-whatsapp-dashboard">
                    Relatorio Via WhatsApp
                </button>
            </div>
            
            <div class="hospitais-container">
                ${hospitaisComDados.map(hospitalId => renderHospitalSection(hospitalId, hoje)).join('')}
            </div>
        </div>
        
        ${getHospitalConsolidadoCSS()}
    `;
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            hospitaisComDados.forEach(hospitalId => {
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId);
                if (CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO) {
                    renderLinhasHospital(hospitalId);
                }
            });
            
            console.log('Dashboard renderizado com sucesso!');
        }, 100);
    };
    
    aguardarChartJS();
};

function renderHospitalSection(hospitalId, hoje) {
    const dados = window.processarDadosHospital(hospitalId);
    
    if (!dados || !dados.tph || !dados.pps || !dados.spict) {
        console.error(`Dados inválidos para ${hospitalId}`);
        return '';
    }
    
    return `
        <div class="hospital-card" data-hospital="${hospitalId}">
            <div class="hospital-header">
                <h3 class="hospital-title">${dados.nome}</h3>
            </div>
            
            <div class="kpis-grid">
                <div class="kpi-box box-ocupados">
                    <div class="kpi-title">Leitos Ocupados</div>
                    
                    <div class="kpi-content">
                        ${renderGaugeV5_Hosp(dados.taxaOcupacao, CORES_ARCHIPELAGO.ocupados, dados.ocupados.total)}
                        
                        <div class="kpi-items-lista">
                            <div class="kpi-subtitle">Total por Tipo de Leito</div>
                            <div class="item-lista">
                                <span class="label">Apartamento</span>
                                <span class="valor">${dados.ocupados.apartamento}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Feminina</span>
                                <span class="valor">${dados.ocupados.enf_feminina}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Masculina</span>
                                <span class="valor">${dados.ocupados.enf_masculina}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">Total por Modalidade Contratual</div>
                        ${renderModalidadeContratual_Hosp(dados.ocupados.modalidade)}
                    </div>
                </div>

                <div class="kpi-box box-previsao">
                    <div class="kpi-title">Leitos em Previsão de Alta</div>
                    
                    <div class="kpi-content">
                        ${renderGaugeV5_Hosp((dados.previsao.total / dados.ocupados.total * 100) || 0, CORES_ARCHIPELAGO.previsao, dados.previsao.total)}
                        
                        <div class="kpi-items-lista">
                            <div class="kpi-subtitle">Total por Tipo de Leito</div>
                            <div class="item-lista">
                                <span class="label">Apartamento</span>
                                <span class="valor">${dados.previsao.apartamento}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Feminina</span>
                                <span class="valor">${dados.previsao.enf_feminina}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Masculina</span>
                                <span class="valor">${dados.previsao.enf_masculina}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">Total por Modalidade Contratual</div>
                        ${renderModalidadeContratual_Hosp(dados.previsao.modalidade)}
                    </div>
                </div>

                <div class="kpi-box box-disponiveis">
                    <div class="kpi-title">Leitos Disponíveis</div>
                    
                    <div class="kpi-content">
                        ${renderGaugeV5_Hosp((dados.disponiveis.total / dados.totalLeitos * 100) || 0, CORES_ARCHIPELAGO.disponiveis, dados.disponiveis.total)}
                        
                        <div class="kpi-items-lista">
                            <div class="kpi-subtitle">Capacidade Total por Tipo de Leito (não Simultâneo)</div>
                            <div class="item-lista">
                                <span class="label">Apartamento</span>
                                <span class="valor">até ${dados.disponiveis.apartamento}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Feminina</span>
                                <span class="valor">até ${dados.disponiveis.enf_feminina}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Masculina</span>
                                <span class="valor">até ${dados.disponiveis.enf_masculina}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">Total por Modalidade Contratual</div>
                        ${renderModalidadeContratual_Hosp(dados.disponiveis.modalidade)}
                    </div>
                </div>

                <div class="kpi-box box-tph">
                    <div class="kpi-title">TPH Médio</div>
                    
                    <div class="kpi-tph-container">
                        <div class="kpi-tph-numero">${dados.tph.medio}</div>
                        <div class="kpi-tph-label">Dias</div>
                        ${renderMiniGaugeTPH_Hosp(dados.tph.medio)}
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">Nº Diárias > 5</div>
                        ${dados.tph.lista && dados.tph.lista.length > 0 ? `
                            <table class="hospitais-table">
                                <thead>
                                    <tr>
                                        <th style="text-align: left !important;">Leito</th>
                                        <th style="text-align: center !important;">Matrícula</th>
                                        <th style="text-align: right !important;">Dias</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dados.tph.lista.map(l => `
                                        <tr>
                                            <td style="text-align: left !important;">${l.leito}</td>
                                            <td style="text-align: center !important;">${l.matricula}</td>
                                            <td style="text-align: right !important;">${l.dias}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div class="sem-dados">Nenhum Leito com Mais de 5 Diárias</div>'}
                    </div>
                </div>

                <div class="kpi-box box-pps">
                    <div class="kpi-title">PPS</div>
                    
                    <div class="kpi-valores-duplos-divididos">
                        <div class="kpi-valor-metade">
                            <div class="valor">${dados.pps.medio}</div>
                            <div class="label">PPS Médio</div>
                        </div>
                        <div class="divisor-vertical"></div>
                        <div class="kpi-valor-metade">
                            <div class="valor">${(dados.pps.menor40 && dados.pps.menor40.length || 0).toString().padStart(2, '0')}</div>
                            <div class="label">PPS < 40%</div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">PPS < 40%</div>
                        ${dados.pps.menor40 && dados.pps.menor40.length > 0 ? `
                            <table class="hospitais-table">
                                <thead>
                                    <tr>
                                        <th style="text-align: left !important;">Leito</th>
                                        <th style="text-align: right !important;">Matrícula</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dados.pps.menor40.map(l => `
                                        <tr>
                                            <td style="text-align: left !important;">${l.leito}</td>
                                            <td style="text-align: right !important;">${l.matricula}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div class="sem-dados">Nenhum Leito com PPS < 40%</div>'}
                    </div>
                </div>

                <div class="kpi-box box-spict">
                    <div class="kpi-title">SPICT-BR | Diretivas</div>
                    
                    <div class="kpi-valores-duplos-divididos">
                        <div class="kpi-valor-metade">
                            <div class="valor">${dados.spict.elegiveis.toString().padStart(2, '0')}</div>
                            <div class="label">SPICT-BR</div>
                        </div>
                        <div class="divisor-vertical"></div>
                        <div class="kpi-valor-metade">
                            <div class="valor">${dados.spict.diretivas.toString().padStart(2, '0')}</div>
                            <div class="label">Diretivas</div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">Diretivas Pendentes</div>
                        ${dados.spict.listaDiretivas && dados.spict.listaDiretivas.length > 0 ? `
                            <table class="hospitais-table">
                                <thead>
                                    <tr>
                                        <th style="text-align: left !important;">Leito</th>
                                        <th style="text-align: right !important;">Matrícula</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dados.spict.listaDiretivas.map(l => `
                                        <tr>
                                            <td style="text-align: left !important;">${l.leito}</td>
                                            <td style="text-align: right !important;">${l.matricula}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div class="sem-dados">Nenhuma Diretiva Pendente</div>'}
                    </div>
                </div>
            </div>
            
            <div class="graficos-verticais">
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Análise Preditiva de Altas em ${hoje}</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="graficoAltas${hospitalId}"></canvas>
                    </div>
                </div>
                
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Concessões Previstas em ${hoje}</h4>
                    </div>
                    <div id="concessoesBoxes${hospitalId}" class="timeline-boxes-container"></div>
                </div>
                
                ${CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO ? `
                <div class="grafico-item">
                    <div class="chart-header">
                        <h4>Linhas de Cuidado Previstas em ${hoje}</h4>
                    </div>
                    <div id="linhasBoxes${hospitalId}" class="timeline-boxes-container"></div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

const backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

function renderAltasHospital(hospitalId) {
    const canvas = document.getElementById(`graficoAltas${hospitalId}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const chartKey = `altas${hospitalId}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const categorias = CONFIG_DASHBOARD.MOSTRAR_96H ? 
        ['HOJE', '24H', '48H', '72H', '96H'] : 
        ['HOJE', '24H', '48H', '72H'];
    
    const dados = {
        'Ouro': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '2R': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '3R': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '48H': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '72H': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : [0, 0, 0, 0],
        '96H': CONFIG_DASHBOARD.MOSTRAR_96H ? [0, 0, 0, 0, 0] : []
    };
    
    hospital.leitos.forEach(leito => {
        if (isOcupado(leito)) {
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (prevAlta) {
                const prev = normStr(prevAlta).replace(/\s+/g, ' ');
                
                let index = -1;
                let tipo = '';
                
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
    
    const corTexto = window.fundoBranco ? CORES_ARCHIPELAGO.cinzaEscuro : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(60, 58, 62, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    const dadosSimplificados = CONFIG_DASHBOARD.MOSTRAR_96H ? [
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
    
    const valorMaximo = Math.max(...dadosSimplificados, 0);
    const limiteSuperior = valorMaximo + 1;
    
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
                    backgroundColor: `rgba(19, 27, 46, 0.95)`,
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    titleFont: { family: 'Poppins', size: 13, weight: 600 },
                    bodyFont: { family: 'Poppins', size: 12 },
                    callbacks: {
                        label: function(context) {
                            return `Beneficiários: ${context.parsed.x}`;
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
                        font: { family: 'Poppins', size: 12, weight: 600 },
                        align: 'start'
                    },
                    ticks: {
                        stepSize: 1,
                        color: corTexto,
                        font: { family: 'Poppins', size: 11 },
                        callback: function(value) {
                            return Number.isInteger(value) && value >= 0 ? value : '';
                        }
                    },
                    grid: { color: corGrid }
                },
                y: {
                    ticks: {
                        color: corTexto,
                        font: { family: 'Poppins', size: 12, weight: 600 }
                    },
                    grid: { color: corGrid }
                }
            }
        },
        plugins: [backgroundPlugin]
    });
}

function renderConcessoesHospital(hospitalId) {
    const container = document.getElementById(`concessoesBoxes${hospitalId}`);
    if (!container) return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const concessoesPorTimeline = {
        'HOJE': {},
        '24H': {},
        '48H': {}
    };
    
    hospital.leitos.forEach(leito => {
        if (isOcupado(leito)) {
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || 'S/N';
            
            if (concessoes) {
                const concessoesList = Array.isArray(concessoes) ? 
                    concessoes : 
                    String(concessoes).split('|');
                
                let timeline = null;
                if (prevAlta) {
                    const prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    if (prev.includes('hoje')) timeline = 'HOJE';
                    else if (prev.includes('24h') || prev.includes('24 h')) timeline = '24H';
                    else if (prev.includes('48h')) timeline = '48H';
                }
                
                if (timeline) {
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim()) {
                            const nome = concessao.trim();
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
    
    let html = '<div class="timeline-boxes-grid">';
    
    ['HOJE', '24H', '48H'].forEach(timeline => {
        const concessoes = Object.entries(concessoesPorTimeline[timeline])
            .sort((a, b) => b[1].length - a[1].length);
        
        html += `<div class="timeline-box">`;
        html += `<div class="timeline-box-header">${timeline}</div>`;
        
        html += `<div class="timeline-chart-container">`;
        html += `<canvas id="graficoConcessoes${hospitalId}_${timeline}" class="timeline-chart"></canvas>`;
        html += `</div>`;
        
        html += `<div class="timeline-box-content">`;
        
        if (concessoes.length === 0) {
            html += `<div style="text-align: center; padding: 20px; color: ${CORES_ARCHIPELAGO.cinzaMedio}; font-style: italic; font-size: 12px;">Sem Concessões</div>`;
        } else {
            concessoes.forEach(([nome, mats]) => {
                const cor = getCorExata(nome, 'concessao');
                html += `<div class="timeline-item" style="border-left-color: ${cor};">`;
                html += `<div class="timeline-item-name">${nome}</div>`;
                html += `<div class="timeline-item-mats">${mats.join(', ')}</div>`;
                html += `</div>`;
            });
        }
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(() => {
        ['HOJE', '24H', '48H'].forEach(timeline => {
            renderDoughnutConcessoes(hospitalId, timeline, concessoesPorTimeline[timeline]);
        });
    }, 100);
}

function renderDoughnutConcessoes(hospitalId, timeline, dados) {
    const canvas = document.getElementById(`graficoConcessoes${hospitalId}_${timeline}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = `concessoes${hospitalId}_${timeline}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const concessoes = Object.entries(dados)
        .sort((a, b) => b[1].length - a[1].length);
    
    if (concessoes.length === 0) return;
    
    const labels = concessoes.map(([nome]) => nome);
    const values = concessoes.map(([, mats]) => mats.length);
    const colors = labels.map(label => getCorExata(label, 'concessao'));
    
    const ctx = canvas.getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: `rgba(19, 27, 46, 0.95)`,
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { family: 'Poppins', size: 13, weight: 600 },
                bodyFont: { family: 'Poppins', size: 12 },
                callbacks: {
                    label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percent}%)`;
                    }
                }
            }
        }
    };
    
    const chartPlugins = [backgroundPlugin];
    
    if (hasDataLabels) {
        chartOptions.plugins.datalabels = {
            color: '#ffffff',
            font: { family: 'Poppins', size: 14, weight: 'bold' },
            formatter: (value, context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const porcentagem = ((value / total) * 100).toFixed(0);
                return `${value}\n(${porcentagem}%)`;
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

function renderLinhasHospital(hospitalId) {
    const container = document.getElementById(`linhasBoxes${hospitalId}`);
    if (!container) return;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const linhasPorTimeline = {
        'HOJE': {},
        '24H': {},
        '48H': {}
    };
    
    hospital.leitos.forEach(leito => {
        if (isOcupado(leito)) {
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            const matricula = leito.matricula || 'S/N';
            
            if (linhas) {
                const linhasList = Array.isArray(linhas) ? 
                    linhas : 
                    String(linhas).split('|');
                
                let timeline = null;
                if (prevAlta) {
                    const prev = normStr(prevAlta).replace(/\s+/g, ' ');
                    if (prev.includes('hoje')) timeline = 'HOJE';
                    else if (prev.includes('24h') || prev.includes('24 h')) timeline = '24H';
                    else if (prev.includes('48h')) timeline = '48H';
                }
                
                if (timeline) {
                    linhasList.forEach(linha => {
                        if (linha && linha.trim()) {
                            const nome = linha.trim();
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
    
    let html = '<div class="timeline-boxes-grid">';
    
    ['HOJE', '24H', '48H'].forEach(timeline => {
        const linhas = Object.entries(linhasPorTimeline[timeline])
            .sort((a, b) => b[1].length - a[1].length);
        
        html += `<div class="timeline-box">`;
        html += `<div class="timeline-box-header">${timeline}</div>`;
        
        html += `<div class="timeline-chart-container">`;
        html += `<canvas id="graficoLinhas${hospitalId}_${timeline}" class="timeline-chart"></canvas>`;
        html += `</div>`;
        
        html += `<div class="timeline-box-content">`;
        
        if (linhas.length === 0) {
            html += `<div style="text-align: center; padding: 20px; color: ${CORES_ARCHIPELAGO.cinzaMedio}; font-style: italic; font-size: 12px;">Sem Linhas de Cuidado</div>`;
        } else {
            linhas.forEach(([nome, mats]) => {
                const cor = getCorExata(nome, 'linha');
                html += `<div class="timeline-item" style="border-left-color: ${cor};">`;
                html += `<div class="timeline-item-name">${nome}</div>`;
                html += `<div class="timeline-item-mats">${mats.join(', ')}</div>`;
                html += `</div>`;
            });
        }
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(() => {
        ['HOJE', '24H', '48H'].forEach(timeline => {
            renderDoughnutLinhas(hospitalId, timeline, linhasPorTimeline[timeline]);
        });
    }, 100);
}

function renderDoughnutLinhas(hospitalId, timeline, dados) {
    const canvas = document.getElementById(`graficoLinhas${hospitalId}_${timeline}`);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const chartKey = `linhas${hospitalId}_${timeline}`;
    if (window.chartInstances && window.chartInstances[chartKey]) {
        window.chartInstances[chartKey].destroy();
    }
    
    if (!window.chartInstances) window.chartInstances = {};
    
    const linhas = Object.entries(dados)
        .sort((a, b) => b[1].length - a[1].length);
    
    if (linhas.length === 0) return;
    
    const labels = linhas.map(([nome]) => nome);
    const values = linhas.map(([, mats]) => mats.length);
    const colors = labels.map(label => getCorExata(label, 'linha'));
    
    const ctx = canvas.getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: `rgba(19, 27, 46, 0.95)`,
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { family: 'Poppins', size: 13, weight: 600 },
                bodyFont: { family: 'Poppins', size: 12 },
                callbacks: {
                    label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percent}%)`;
                    }
                }
            }
        }
    };
    
    const chartPlugins = [backgroundPlugin];
    
    if (hasDataLabels) {
        chartOptions.plugins.datalabels = {
            color: '#ffffff',
            font: { family: 'Poppins', size: 14, weight: 'bold' },
            formatter: (value, context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const porcentagem = ((value / total) * 100).toFixed(0);
                return `${value}\n(${porcentagem}%)`;
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

function getHospitalConsolidadoCSS() {
    return `
        <style id="hospitalConsolidadoCSS">
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            
            * {
                font-family: 'Poppins', sans-serif;
                text-transform: none !important;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            #dashHospitalarContent,
            #dash1 {
                background: transparent !important;
            }
            
            .dashboard-hospitalar-wrapper {
                border-radius: 0;
                box-shadow: none;
            }
            
            /* =================== HEADER COM FILTRO =================== */
            .dashboard-header-filtro {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 25px;
                border-left: 4px solid #ffffff;
                margin-bottom: 30px;
            }
            
            .dashboard-title-central {
                color: #60a5fa !important;
                font-size: 24px !important;
                margin-bottom: 20px !important;
                font-family: 'Poppins', sans-serif !important;
                font-weight: 700 !important;
                text-align: center !important;
                text-transform: none !important;
            }
            
            /* =================== LINHA DO BOTÃO "TODOS" =================== */
            .filtro-linha-todos {
                display: flex;
                justify-content: center;
                margin-bottom: 15px;
            }
            
            /* =================== LINHA DOS HOSPITAIS =================== */
            .hospital-filter-selector {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
                margin-bottom: 20px;
            }
            
            /* =================== BOTÕES DE FILTRO =================== */
            .hospital-filter-btn {
                background-color: #60a5fa;
                color: #ffffff;
                border: none;
                padding: 14px 28px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 700;
                font-family: 'Poppins', sans-serif;
                transition: all 0.3s ease;
                flex: 1;
                min-width: 150px;
                max-width: 200px;
                text-transform: none;
            }
            
            .hospital-filter-btn:hover {
                background-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
            }
            
            .hospital-filter-btn.active {
                background-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
            }
            
            /* =================== BOTÃO WHATSAPP =================== */
            .btn-whatsapp-dashboard {
                display: block;
                margin: 0 auto;
                padding: 12px 24px;
                background: #25D366;
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                cursor: pointer;
                font-weight: 700;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            }
            
            .btn-whatsapp-dashboard:hover {
                background: #128C7E;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
            }
            
            .hospitais-container {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }
            
            .hospital-card {
                background: ${CORES_ARCHIPELAGO.azulMarinhoEscuro};
                border-radius: 16px;
                padding: 25px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .hospital-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }
            
            .hospital-header {
                margin-bottom: 25px;
            }
            
            .hospital-title {
                color: #60a5fa;
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 20px 0;
                letter-spacing: 0.5px;
                text-transform: none !important;
            }
            
            .kpis-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .kpi-box {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.8);
                border-top: 3px solid #ffffff !important;
                min-height: 350px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .kpi-title {
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 0.5px;
                margin-bottom: 15px;
                text-align: center;
                text-transform: none !important;
            }
            
            .v5-gauge-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                margin: 15px 0;
            }
            
            .v5-gauge {
                width: 100px;
                height: 60px;
            }
            
            .v5-number-inside {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 32px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-top: 8px;
            }
            
            .v5-badge-below {
                font-size: 13px;
                font-weight: 700;
                padding: 4px 10px;
                border-radius: 10px;
                border: 1px solid;
                background: rgba(96, 165, 250, 0.2) !important;
                color: ${CORES_ARCHIPELAGO.azulPrincipal} !important;
                border-color: ${CORES_ARCHIPELAGO.azulPrincipal} !important;
            }
            
            .kpi-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
                flex: 1;
            }
            
            .kpi-items-lista {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .item-lista {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 10px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.02);
                transition: background 0.2s ease;
            }
            
            .item-lista:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .item-lista .label {
                font-size: 12px;
                color: ${CORES_ARCHIPELAGO.cinzaMedio};
                text-transform: none !important;
            }
            
            .item-lista .valor {
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
            }
            
            .kpi-subtitle {
                font-size: 10px;
                color: #60a5fa;
                font-style: italic;
                text-align: center;
                margin-bottom: 8px;
                text-transform: none !important;
            }
            
            .kpi-detalhes {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 12px;
            }
            
            .detalhe-titulo {
                font-size: 10px;
                font-weight: 600;
                color: #60a5fa;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                text-transform: none !important;
            }
            
            .lista-simples-compacta {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            
            .lista-item-compacto {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 3px 8px;
                border-radius: 5px;
                background: rgba(255, 255, 255, 0.02);
                transition: background 0.2s ease;
            }
            
            .lista-item-compacto:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .lista-item-compacto .label {
                font-size: 11px;
                color: ${CORES_ARCHIPELAGO.cinzaMedio};
                text-transform: none !important;
            }
            
            .lista-item-compacto .valor {
                font-size: 11px;
                font-weight: 600;
                color: #ffffff;
            }
            
            .kpi-valores-duplos-divididos {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 15px;
            }
            
            .kpi-valor-metade {
                flex: 1;
                text-align: center;
            }
            
            .kpi-valor-metade .valor {
                font-size: 32px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 6px;
            }
            
            .kpi-valor-metade .label {
                font-size: 11px;
                color: ${CORES_ARCHIPELAGO.cinzaMedio};
                letter-spacing: 0.5px;
                text-transform: none !important;
            }
            
            .divisor-vertical {
                width: 1px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
            }
            
            .kpi-tph-container {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .kpi-tph-numero {
                font-size: 32px;
                font-weight: 700;
                color: white;
                line-height: 1;
            }
            
            .kpi-tph-label {
                font-size: 13px;
                color: ${CORES_ARCHIPELAGO.cinzaMedio};
                margin-top: 6px;
                text-transform: none !important;
            }
            
            .tph-mini-gauge {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 12px;
            }
            
            .tph-gauge-bar {
                display: flex;
                align-items: center;
                gap: 2px;
                height: 16px;
            }
            
            .tph-gauge-block {
                width: 6px;
                height: 16px;
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            
            .tph-gauge-block.filled {
                background: currentColor;
            }
            
            .tph-gauge-block.empty {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .tph-gauge-label {
                font-size: 11px;
                font-weight: 600;
                color: ${CORES_ARCHIPELAGO.cinzaMedio};
                text-transform: none !important;
            }
            
            .tph-gauge-bar.green { color: ${CORES_ARCHIPELAGO.verde}; }
            .tph-gauge-bar.yellow { color: ${CORES_ARCHIPELAGO.amarelo}; }
            .tph-gauge-bar.red { color: ${CORES_ARCHIPELAGO.laranja}; }
            
            .hospitais-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            
            .hospitais-table thead {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hospitais-table th {
                padding: 6px;
                color: ${CORES_ARCHIPELAGO.azulPrincipal};
                font-weight: 600;
                font-size: 9px;
                letter-spacing: 0.5px;
                text-transform: none !important;
            }
            
            .hospitais-table td {
                padding: 6px;
                color: #e5e7eb;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .box-tph .hospitais-table thead th:nth-child(1),
            .box-tph .hospitais-table tbody td:nth-child(1) {
                text-align: left !important;
            }
            .box-tph .hospitais-table thead th:nth-child(2),
            .box-tph .hospitais-table tbody td:nth-child(2) {
                text-align: center !important;
            }
            .box-tph .hospitais-table thead th:nth-child(3),
            .box-tph .hospitais-table tbody td:nth-child(3) {
                text-align: right !important;
            }
            
            .box-pps .hospitais-table thead th:nth-child(1),
            .box-pps .hospitais-table tbody td:nth-child(1),
            .box-spict .hospitais-table thead th:nth-child(1),
            .box-spict .hospitais-table tbody td:nth-child(1) {
                text-align: left !important;
            }
            .box-pps .hospitais-table thead th:nth-child(2),
            .box-pps .hospitais-table tbody td:nth-child(2),
            .box-spict .hospitais-table thead th:nth-child(2),
            .box-spict .hospitais-table tbody td:nth-child(2) {
                text-align: right !important;
            }
            
            .hospitais-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            .hospitais-table tbody tr:hover {
                background: rgba(255, 255, 255, 0.03);
            }
            
            .sem-dados {
                text-align: center;
                padding: 15px;
                color: ${CORES_ARCHIPELAGO.azulAcinzentado};
                font-style: italic;
                font-size: 11px;
                text-transform: none !important;
            }
            
            .graficos-verticais {
                display: flex;
                flex-direction: column;
                gap: 25px;
                width: 100%;
            }
            
            .grafico-item {
                width: 100%;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-sizing: border-box;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .chart-header h4 {
                margin: 0;
                color: #e2e8f0;
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-align: center;
                width: 100%;
                text-transform: none !important;
            }
            
            .chart-container {
                position: relative;
                height: 400px;
                width: 100%;
                background: rgba(156, 163, 175, 0.3);
                border-radius: 8px;
                padding: 15px;
                box-sizing: border-box;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-height: 370px !important;
            }
            
            .timeline-boxes-container {
                width: 100%;
                margin-top: 15px;
            }
            
            .timeline-boxes-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                width: 100%;
            }
            
            .timeline-box {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                overflow: hidden;
                min-height: 400px;
                display: flex;
                flex-direction: column;
            }
            
            .timeline-box-header {
                background: rgba(96, 165, 250, 0.2);
                padding: 12px;
                text-align: center;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 0.5px;
                color: ${CORES_ARCHIPELAGO.azulPrincipal};
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                text-transform: none !important;
            }
            
            .timeline-chart-container {
                height: 200px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .timeline-chart {
                max-height: 180px !important;
            }
            
            .timeline-box-content {
                padding: 12px;
                flex: 1;
                overflow-y: auto;
                max-height: 250px;
            }
            
            .timeline-item {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                border-left: 3px solid;
                transition: all 0.2s ease;
            }
            
            .timeline-item:hover {
                background: rgba(255, 255, 255, 0.07);
                transform: translateX(2px);
            }
            
            .timeline-item:last-child {
                margin-bottom: 0;
            }
            
            .timeline-item-name {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 6px;
                color: #ffffff;
                text-transform: none !important;
            }
            
            .timeline-item-mats {
                font-size: 11px;
                color: #ffffff;
                line-height: 1.4;
            }
            
            /* =================== RESPONSIVIDADE MOBILE =================== */
            @media (max-width: 768px) {
                .filtro-linha-todos,
                .hospital-filter-selector {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .hospital-filter-btn {
                    width: 100%;
                    max-width: 100%;
                }
                
                .dashboard-title-central {
                    font-size: 20px !important;
                }
                
                .btn-whatsapp-dashboard {
                    width: 100%;
                }
                
                .kpis-grid {
                    grid-template-columns: 1fr;
                    padding: 0 10px !important;
                    margin: 0 auto !important;
                }
                
                .kpi-box {
                    margin-left: auto !important;
                    margin-right: auto !important;
                    max-width: 100% !important;
                }
                
                .hospital-card {
                    padding: 15px !important;
                    margin: 0 auto 20px auto !important;
                    max-width: calc(100vw - 20px) !important;
                }
                
                .timeline-boxes-grid {
                    grid-template-columns: 1fr;
                }
                
                .dashboard-hospitalar-wrapper {
                    padding: 10px !important;
                }
                
                .hospitais-container {
                    padding: 0 !important;
                }
            }
        </style>
    `;
}

window.renderizarDashboard = window.renderDashboardHospitalar;
window.renderDashboard = window.renderDashboardHospitalar;

window.forceDataRefresh = function() {
    window.location.reload();
};

console.log('Dashboard Hospitalar V4.0 - Carregado com Sucesso!');
