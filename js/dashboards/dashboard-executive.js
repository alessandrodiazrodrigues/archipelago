// =================== DASHBOARD EXECUTIVO V4.0 - CORRIGIDO COMPLETO ===================
// =================== 7 HOSPITAIS | 93 LEITOS | DIRETIVAS CORRIGIDAS ===================

// Estado global para fundo branco (compartilhado com dashboard hospitalar)
if (typeof window.fundoBranco === 'undefined') {
    window.fundoBranco = false;
}

// =================== FUNÇÃO PARSE DATE CORRIGIDA ===================
function parseAdmDate(admAt) {
    if (!admAt) return null;
    const d = new Date(admAt);
    if (!isNaN(d)) {
        const dias = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
        if (dias >= 0 && dias <= 365) return d;
    }
    return null;
}

// =================== ORDEM ALFABÉTICA DOS HOSPITAIS (7 HOSPITAIS) ===================
const ORDEM_ALFABETICA_HOSPITAIS = ['H5', 'H2', 'H1', 'H4', 'H3', 'H6', 'H7'];

// =================== FUNÇÃO PARA OBTER CORES DO API.JS ===================
function getCorExataExec(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn('[CORES EXEC] Item inválido:', itemName);
        return '#6b7280';
    }
    
    const paleta = tipo === 'concessao' ? window.CORES_CONCESSOES : window.CORES_LINHAS;
    
    if (!paleta) {
        console.error('[CORES EXEC] Paleta', tipo, 'não encontrada no api.js!');
        return '#6b7280';
    }
    
    let cor = paleta[itemName];
    if (cor) {
        return cor;
    }
    
    const nomeNormalizado = itemName
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[–—]/g, '-')
        .replace(/O₂/g, 'O2')
        .replace(/²/g, '2');
    
    cor = paleta[nomeNormalizado];
    if (cor) {
        return cor;
    }
    
    for (const [chave, valor] of Object.entries(paleta)) {
        const chaveNormalizada = chave.toLowerCase().replace(/[–—]/g, '-');
        const itemNormalizado = nomeNormalizado.toLowerCase();
        
        if (chaveNormalizada.includes(itemNormalizado) || 
            itemNormalizado.includes(chaveNormalizada)) {
            return valor;
        }
    }
    
    return '#6b7280';
}

// Plugin para fundo branco/escuro
const backgroundPluginExec = {
    id: 'customBackgroundExec',
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = window.fundoBranco ? '#ffffff' : 'transparent';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

// =================== FUNÇÕES AUXILIARES DE STATUS (EXECUTIVO) ===================
function isOcupadoExecutivo(leito) {
    if (!leito || !leito.status) return false;
    const s = (leito.status || '').toString().toLowerCase().trim();
    return s === 'ocupado' || s === 'em uso' || s === 'ocupada';
}

function isVagoExecutivo(leito) {
    if (!leito || !leito.status) return false;
    const s = (leito.status || '').toString().toLowerCase().trim();
    return s === 'vago' || s === 'disponivel' || s === 'disponível' || s === 'livre';
}

// =================== FUNÇÃO: RENDER BARRA DE OCUPAÇÃO ===================
function renderBarraOcupacao(porcentagem) {
    let cor = '#22c55e';
    if (porcentagem >= 85) cor = '#ef4444';
    else if (porcentagem >= 50) cor = '#f59e0b';
    
    const totalBlocos = 20;
    const blocosCheios = Math.round((porcentagem / 100) * totalBlocos);
    
    let blocos = '';
    for (let i = 0; i < totalBlocos; i++) {
        blocos += `<div class="ocupacao-gauge-block ${i < blocosCheios ? 'filled' : 'empty'}"></div>`;
    }
    
    return `
        <div class="ocupacao-mini-gauge">
            <div class="ocupacao-gauge-bar" style="color: ${cor};">
                ${blocos}
            </div>
        </div>
    `;
}

// =================== FUNÇÃO: CALCULAR GAUGE OFFSET ===================
function calcularGaugeLargoOffset(porcentagem) {
    const circunferencia = Math.PI * 200;
    const progresso = (porcentagem / 100) * circunferencia;
    return circunferencia - progresso;
}

// =================== FUNÇÃO: RENDER GAUGE LARGO (EXECUTIVO) ===================
function renderGaugeLargo(porcentagem, numeroTotal) {
    const offset = calcularGaugeLargoOffset(porcentagem);
    
    return `
        <div style="display: flex; justify-content: center; margin: 20px 0 30px 0;">
            <div class="gauge-largo-container">
                <svg viewBox="0 0 500 280" style="width: 100%; height: 100%;">
                    <path d="M 50 220 A 200 200 0 0 1 450 220" 
                          fill="none" 
                          stroke="rgba(255,255,255,0.1)" 
                          stroke-width="30" 
                          stroke-linecap="round"/>
                    <path d="M 50 220 A 200 200 0 0 1 450 220" 
                          fill="none" 
                          stroke="#22c55e" 
                          stroke-width="30" 
                          stroke-linecap="round"
                          stroke-dasharray="628.3"
                          stroke-dashoffset="${offset}"/>
                </svg>
                
                <div class="gauge-largo-info">
                    <div class="gauge-largo-number">${numeroTotal}</div>
                    <div class="gauge-largo-label">Leitos Ocupados</div>
                    <div class="gauge-largo-percentage">${porcentagem.toFixed(0)}%</div>
                    <div class="gauge-largo-subtitle">Total da Rede Externa (7 Hospitais)</div>
                </div>
            </div>
        </div>
    `;
}

// =================== FUNÇÃO: RENDER GAUGE V5 (MEIA ROSCA - NORMAL) ===================
function calcularGaugeOffset(porcentagem) {
    const circunferencia = Math.PI * 55;
    const progresso = (porcentagem / 100) * circunferencia;
    return circunferencia - progresso;
}

function renderGaugeV5(porcentagem, cor, numero) {
    const offset = calcularGaugeOffset(porcentagem);
    const badgeClass = cor === '#22c55e' ? 'green' : (cor === '#0676bb' ? 'blue' : 'orange');
    
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

// =================== FUNÇÃO: RENDER MODALIDADE CONTRATUAL ===================
function renderModalidadeContratual(modalidade) {
    return `
        <div class="lista-simples-compacta">
            <div class="lista-item-compacto">
                <span class="label">Flexíveis quanto ao Plano</span>
                <span class="valor">${modalidade.flexiveis || 0}</span>
            </div>
            <div class="lista-item-compacto">
                <span class="label">Exclusivamente Apartamentos</span>
                <span class="valor">${modalidade.exclusivo_apto || 0}</span>
            </div>
            <div class="lista-item-compacto">
                <span class="label">Exclus. Enf sem Restrição</span>
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

// =================== FUNÇÃO: RENDER MINI GAUGE TPH (ESCALA 0-10) ===================
function renderMiniGaugeTPH(dias) {
    const maxDias = 10;
    const porcentagem = Math.min((dias / maxDias) * 100, 100);
    
    let corClass = 'green';
    if (dias >= 9) corClass = 'red';
    else if (dias >= 6) corClass = 'yellow';
    
    const totalBlocos = 20;
    const blocosCheios = Math.round((Math.min(dias, maxDias) / maxDias) * totalBlocos);
    
    let blocos = '';
    for (let i = 0; i < totalBlocos; i++) {
        blocos += `<div class="tph-gauge-block ${i < blocosCheios ? 'filled' : 'empty'}"></div>`;
    }
    
    return `
        <div class="tph-mini-gauge">
            <div class="tph-gauge-bar ${corClass}">
                ${blocos}
            </div>
            <span class="tph-gauge-label">${dias.toFixed(2)}/${maxDias}</span>
        </div>
    `;
}

// =================== FUNÇÃO: CALCULAR MODALIDADES ===================
function calcularModalidadesVagosExecutivo(leitos, hospitalId) {
    const modalidade = {
        flexiveis: 0,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
    };

    const vagos = leitos.filter(l => isVagoExecutivo(l));

    // Híbridos Puros: H1, H3, H5, H6, H7
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        modalidade.flexiveis = vagos.length;
        return modalidade;
    }

    // H4 - Santa Clara (Híbrido com limites)
    if (hospitalId === 'H4') {
        const ocupados = leitos.filter(l => isOcupadoExecutivo(l));
        
        const aptosOcupados = ocupados.filter(l => 
            l.categoriaEscolhida === 'Apartamento'
        ).length;
        
        const enfOcupadas = ocupados.filter(l => 
            l.categoriaEscolhida === 'Enfermaria'
        ).length;
        
        modalidade.flexiveis = 0;
        modalidade.exclusivo_apto = 9 - aptosOcupados;
        modalidade.exclusivo_enf_sem_restricao = 4 - enfOcupadas;
        modalidade.exclusivo_enf_fem = 0;
        modalidade.exclusivo_enf_masc = 0;
        
        return modalidade;
    }

    // H2 - Cruz Azul (Tipos fixos + Leito irmão)
    if (hospitalId === 'H2') {
        vagos.forEach(leitoVago => {
            const tipo = leitoVago.tipo || '';
            
            if (tipo === 'APTO' || tipo === 'Apartamento') {
                modalidade.exclusivo_apto++;
                return;
            }
            
            if (tipo === 'ENFERMARIA' || tipo === 'Enfermaria') {
                const numeroLeito = leitoVago.leito;
                
                if (!numeroLeito || typeof numeroLeito !== 'number') {
                    modalidade.exclusivo_enf_sem_restricao++;
                    return;
                }
                
                const numeroIrmao = (numeroLeito % 2 === 0) 
                    ? numeroLeito - 1
                    : numeroLeito + 1;
                
                const irmao = leitos.find(l => l.leito === numeroIrmao);
                
                if (!irmao || isVagoExecutivo(irmao)) {
                    modalidade.exclusivo_enf_sem_restricao++;
                } else if (irmao.isolamento && irmao.isolamento !== 'Não Isolamento') {
                    // Isolamento: não conta
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

function calcularModalidadePorTipoExecutivo(leitos, hospitalId) {
    const modalidade = {
        flexiveis: 0,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
    };

    // Híbridos Puros: H1, H3, H5, H6, H7
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

// =================== FUNÇÃO: PROCESSAR DADOS DO HOSPITAL (EXECUTIVO) ===================
function processarDadosHospitalExecutivo(hospitalId) {
    const hospitalObj = window.hospitalData[hospitalId] || {};
    
    let leitos = hospitalObj.leitos || hospitalObj || [];
    if (!Array.isArray(leitos)) {
        leitos = [];
    }
    
    const ocupados = leitos.filter(l => isOcupadoExecutivo(l));
    
    let ocupadosApto, ocupadosEnfFem, ocupadosEnfMasc;
    
    // Híbridos (H1, H3, H4, H5, H6, H7) usam categoriaEscolhida
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
        // H2 usa tipo estrutural
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
        const prev = l.prevAlta.toLowerCase();
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
    
    const vagos = leitos.filter(l => isVagoExecutivo(l));
    
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
                const numeroLeito = leitoVago.leito;
                
                if (!numeroLeito || typeof numeroLeito !== 'number') {
                    vagosEnfSemRestricao++;
                    return;
                }
                
                const numeroIrmao = (numeroLeito % 2 === 0) 
                    ? numeroLeito - 1
                    : numeroLeito + 1;
                
                const irmao = leitos.find(l => l.leito === numeroIrmao);
                
                if (!irmao || isVagoExecutivo(irmao)) {
                    vagosEnfSemRestricao++;
                } else if (irmao.isolamento && irmao.isolamento !== 'Não Isolamento') {
                    // Isolamento: não conta
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
    
    // Híbridos Puros: todos os vagos podem ser qualquer tipo
    if (hospitalId === 'H1' || hospitalId === 'H3' || hospitalId === 'H5' || hospitalId === 'H6' || hospitalId === 'H7') {
        vagosAptoFinal = vagos.length;
        vagosEnfFemFinal = vagos.length;
        vagosEnfMascFinal = vagos.length;
    }
    
    // =================== TPH CORRIGIDO ===================
    const hoje = new Date();
    const tphValues = ocupados
        .map(l => {
            if (!l.admAt) return 0;
            const admData = parseAdmDate(l.admAt);
            if (!admData) return 0;
            const dias = Math.floor((hoje - admData) / (1000 * 60 * 60 * 24));
            return (dias >= 0 && dias <= 365) ? dias : 0;
        })
        .filter(v => v >= 0);
    const tphMedio = tphValues.length > 0 
        ? (tphValues.reduce((a, b) => a + b, 0) / tphValues.length).toFixed(2)
        : '0.00';
    
    const ppsValues = ocupados
        .map(l => parseInt(l.pps) || 0)
        .filter(v => v > 0);
    const ppsMedio = ppsValues.length > 0
        ? Math.round(ppsValues.reduce((a, b) => a + b, 0) / ppsValues.length)
        : 0;
    const ppsMenor40 = ocupados.filter(l => parseInt(l.pps) < 40);
    
    const spictElegiveis = ocupados.filter(l => 
        l.spict && l.spict.toLowerCase() === 'elegivel'
    );
    
    // =================== DIRETIVAS CORRIGIDA: SÓ "Não" ===================
    const diretivasPendentes = ocupados.filter(l => 
        l.spict && l.spict.toLowerCase() === 'elegivel' && 
        l.diretivas === 'Não'
    );
    
    const totalLeitos = leitos.length;
    const taxaOcupacao = totalLeitos > 0 ? (ocupados.length / totalLeitos * 100) : 0;
    
    const modalidadeOcupados = calcularModalidadePorTipoExecutivo(ocupados, hospitalId);
    const modalidadePrevisao = calcularModalidadePorTipoExecutivo(previsaoAlta, hospitalId);
    const modalidadeDisponiveis = calcularModalidadesVagosExecutivo(leitos, hospitalId);
    
    const nomeHospital = window.HOSPITAL_MAPPING?.[hospitalId] || 
                        (hospitalId === 'H1' ? 'Neomater' :
                         hospitalId === 'H2' ? 'Cruz Azul' :
                         hospitalId === 'H3' ? 'Santa Marcelina' :
                         hospitalId === 'H4' ? 'Santa Clara' :
                         hospitalId === 'H5' ? 'Adventista' :
                         hospitalId === 'H6' ? 'Santa Cruz' :
                         'Santa Virgínia');
    
    return {
        nome: nomeHospital,
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
            medio: tphMedio
        },
        pps: {
            medio: ppsMedio,
            menor40: ppsMenor40
        },
        spict: {
            elegiveis: spictElegiveis.length,
            diretivas: diretivasPendentes.length
        }
    };
}

// =================== FUNÇÃO: COPIAR PARA WHATSAPP ===================
function copiarParaWhatsAppExecutivo() {
    const hospitais = ORDEM_ALFABETICA_HOSPITAIS.map(processarDadosHospitalExecutivo);
    
    const totalLeitos = hospitais.reduce((sum, h) => sum + h.totalLeitos, 0);
    const totalOcupados = hospitais.reduce((sum, h) => sum + h.ocupados.total, 0);
    const taxaOcupacao = ((totalOcupados / totalLeitos) * 100).toFixed(1);
    
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let texto = `*KPIs ARCHIPELAGO*\n`;
    texto += `${dataFormatada}\n`;
    texto += `━━━━━━━━━━━━━━━━━\n`;
    texto += `*REDE EXTERNA (7 HOSPITAIS)*\n`;
    texto += `━━━━━━━━━━━━━━━━━\n`;
    texto += `Taxa de Ocupação: *${taxaOcupacao}%*\n`;
    texto += `Leitos Ocupados: *${totalOcupados}/${totalLeitos}*\n\n`;
    
    hospitais.forEach((h, index) => {
        texto += `*${index + 1}. ${h.nome}*\n`;
        texto += `━━━━━━━━━━━━━━━━━\n`;
        texto += `• Taxa: ${h.taxaOcupacao.toFixed(1)}%\n`;
        texto += `• Ocupados: ${h.ocupados.total}/${h.totalLeitos}\n`;
        texto += `• Previsão Alta: ${h.previsao.total}\n`;
        texto += `• Disponíveis: ${h.disponiveis.total}\n`;
        texto += `• TPH: ${h.tph.medio} dias\n`;
        texto += `• PPS Médio: ${h.pps.medio}\n`;
        texto += `• SPICT: ${h.spict.elegiveis} | Diretivas: ${h.spict.diretivas}\n\n`;
        texto += `_Modalidades Disponíveis:_\n`;
        texto += `  Flexíveis: ${h.disponiveis.modalidade.flexiveis}\n`;
        texto += `  Exclus. Apto: ${h.disponiveis.modalidade.exclusivo_apto}\n`;
        texto += `  Exclus. Enf s/ Restr: ${h.disponiveis.modalidade.exclusivo_enf_sem_restricao}\n`;
        texto += `  Exclus. Enf Fem: ${h.disponiveis.modalidade.exclusivo_enf_fem}\n`;
        texto += `  Exclus. Enf Masc: ${h.disponiveis.modalidade.exclusivo_enf_masc}\n`;
        
        if (index < hospitais.length - 1) {
            texto += `\n`;
        }
    });
    
    navigator.clipboard.writeText(texto).then(() => {
        alert('Texto copiado para a área de transferência!\n\nCole no WhatsApp e envie.');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar. Tente novamente.');
    });
}

// =================== FUNÇÃO PRINCIPAL: RENDER DASHBOARD ===================
window.renderDashboardExecutivo = function() {
    logInfo('Renderizando Dashboard Executivo: REDE HOSPITALAR EXTERNA (7 HOSPITAIS - 93 LEITOS)');
    
    let container = document.getElementById('dashExecutivoContent');
    if (!container) {
        const dash2Section = document.getElementById('dash2');
        if (dash2Section) {
            container = document.createElement('div');
            container.id = 'dashExecutivoContent';
            dash2Section.appendChild(container);
            logInfo('Container dashExecutivoContent criado automaticamente');
        }
    }
    
    if (!container) {
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Executivo');
            return;
        }
    }
    
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #ef4444; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #ef4444; margin-bottom: 10px; font-size: 20px;">Dados não disponíveis</h2>
                <p style="color: #9ca3af; font-size: 14px;">Aguardando sincronização com a planilha</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Recarregar</button>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        return;
    }
    
    const hospitaisValidos = ORDEM_ALFABETICA_HOSPITAIS;
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #f59e0b; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #f59e0b; margin-bottom: 10px; font-size: 20px;">Nenhum hospital com dados</h2>
                <p style="color: #9ca3af; font-size: 14px;">Verifique a conexão com a planilha</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Tentar novamente</button>
                <style>
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        return;
    }
    
    const hospitais = hospitaisComDados.map(processarDadosHospitalExecutivo);
    
    const totalLeitos = hospitais.reduce((sum, h) => sum + h.totalLeitos, 0);
    const totalOcupados = hospitais.reduce((sum, h) => sum + h.ocupados.total, 0);
    const totalPrevisao = hospitais.reduce((sum, h) => sum + h.previsao.total, 0);
    const totalDisponiveis = hospitais.reduce((sum, h) => sum + h.disponiveis.total, 0);
    const taxaOcupacao = (totalOcupados / totalLeitos * 100);
    
    const previsaoApto = hospitais.reduce((sum, h) => sum + h.previsao.apartamento, 0);
    const previsaoEnfFem = hospitais.reduce((sum, h) => sum + h.previsao.enf_feminina, 0);
    const previsaoEnfMasc = hospitais.reduce((sum, h) => sum + h.previsao.enf_masculina, 0);
    
    const disponiveisApto = hospitais.reduce((sum, h) => sum + h.disponiveis.apartamento, 0);
    const disponiveisEnfFem = hospitais.reduce((sum, h) => sum + h.disponiveis.enf_feminina, 0);
    const disponiveisEnfMasc = hospitais.reduce((sum, h) => sum + h.disponiveis.enf_masculina, 0);
    
    const modalidadePrevisao = {
        flexiveis: hospitais.reduce((sum, h) => sum + h.previsao.modalidade.flexiveis, 0),
        exclusivo_apto: hospitais.reduce((sum, h) => sum + h.previsao.modalidade.exclusivo_apto, 0),
        exclusivo_enf_sem_restricao: hospitais.reduce((sum, h) => sum + h.previsao.modalidade.exclusivo_enf_sem_restricao, 0),
        exclusivo_enf_fem: hospitais.reduce((sum, h) => sum + h.previsao.modalidade.exclusivo_enf_fem, 0),
        exclusivo_enf_masc: hospitais.reduce((sum, h) => sum + h.previsao.modalidade.exclusivo_enf_masc, 0)
    };
    
    const modalidadeDisponiveis = {
        flexiveis: hospitais.reduce((sum, h) => sum + h.disponiveis.modalidade.flexiveis, 0),
        exclusivo_apto: hospitais.reduce((sum, h) => sum + h.disponiveis.modalidade.exclusivo_apto, 0),
        exclusivo_enf_sem_restricao: hospitais.reduce((sum, h) => sum + h.disponiveis.modalidade.exclusivo_enf_sem_restricao, 0),
        exclusivo_enf_fem: hospitais.reduce((sum, h) => sum + h.disponiveis.modalidade.exclusivo_enf_fem, 0),
        exclusivo_enf_masc: hospitais.reduce((sum, h) => sum + h.disponiveis.modalidade.exclusivo_enf_masc, 0)
    };
    
    // =================== TPH MÉDIO GERAL CORRIGIDO (MÉDIA PONDERADA) ===================
    let totalDiasPonderado = 0;
    let totalPacientesPonderado = 0;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            hospital.leitos.forEach(l => {
                if (isOcupadoExecutivo(l) && l.admAt) {
                    const admData = parseAdmDate(l.admAt);
                    if (admData) {
                        const dias = Math.floor((new Date() - admData) / (1000 * 60 * 60 * 24));
                        if (dias >= 0 && dias <= 365) {
                            totalDiasPonderado += dias;
                            totalPacientesPonderado++;
                        }
                    }
                }
            });
        }
    });
    
    const tphMedioGeral = totalPacientesPonderado > 0 
        ? (totalDiasPonderado / totalPacientesPonderado).toFixed(2)
        : '0.00';
    
    const ppsTodos = hospitais.map(h => h.pps.medio).filter(v => v > 0);
    const ppsMedioGeral = ppsTodos.length > 0
        ? Math.round(ppsTodos.reduce((a, b) => a + b, 0) / ppsTodos.length)
        : 0;
    const totalPPSMenor40 = hospitais.reduce((sum, h) => sum + h.pps.menor40.length, 0);
    
    const totalSpict = hospitais.reduce((sum, h) => sum + h.spict.elegiveis, 0);
    const totalDiretivas = hospitais.reduce((sum, h) => sum + h.spict.diretivas, 0);
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    const CORES_ARCHIPELAGO = window.CORES_ARCHIPELAGO || { azulPrincipal: '#0676bb' };
    
    const CONFIG = {
        HOSPITAIS: {
            H1: { nome: 'Neomater', cor: '#10b981' },
            H2: { nome: 'Cruz Azul', cor: '#3b82f6' },
            H3: { nome: 'Santa Marcelina', cor: '#8b5cf6' },
            H4: { nome: 'Santa Clara', cor: '#ec4899' },
            H5: { nome: 'Adventista', cor: '#f59e0b' },
            H6: { nome: 'Santa Cruz', cor: '#06b6d4' },
            H7: { nome: 'Santa Virgínia', cor: '#f43f5e' }
        }
    };
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            
            <div class="dashboard-header-exec" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #ffffff;">
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #60a5fa; font-size: 24px; font-weight: 700; text-align: center; text-transform: none !important;">Rede Hospitalar Externa - Dashboard Geral</h2>
                </div>
                <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <button id="btnWhatsAppExec" style="padding: 8px 16px; background: #25D366; border: 1px solid #25D366; border-radius: 8px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; text-transform: none !important;">
                        Copiar para WhatsApp
                    </button>
                    <button id="toggleFundoBtnExec" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: none; align-items: center; gap: 8px; text-transform: none !important;">
                        <span id="toggleTextExec">Tema Escuro</span>
                    </button>
                </div>
            </div>
            
            <div class="kpis-grid-executivo">
                
                <div class="kpi-box box-ocupacao-geral">
                    <div class="kpi-title">Ocupação Geral - Rede Externa</div>
                    
                    <div class="kpi-content">
                        ${renderGaugeLargo(taxaOcupacao, totalOcupados)}
                    </div>
                    
                    <div class="kpi-detalhes">
                        <table class="hospitais-table-ocupacao">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Leitos Fixos</th>
                                    <th>Leitos Ocupados</th>
                                    <th>Taxa Ocupação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hospitais.map(h => `
                                    <tr>
                                        <td><strong>${h.nome}</strong></td>
                                        <td>${h.totalLeitos}</td>
                                        <td>${h.ocupados.total}</td>
                                        <td>${h.taxaOcupacao.toFixed(1)}%</td>
                                    </tr>
                                    <tr class="regua-row">
                                        <td colspan="4" style="padding: 4px 8px;">
                                            ${renderBarraOcupacao(h.taxaOcupacao)}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="kpi-box box-previsao">
                    <div class="kpi-title">Leitos em Previsão de Alta</div>
                    
                    <div class="kpi-content">
                        ${renderGaugeV5((totalPrevisao / totalOcupados * 100), CORES_ARCHIPELAGO.azulPrincipal, totalPrevisao)}
                        
                        <div class="kpi-items-lista">
                            <div class="kpi-subtitle">Total de Leitos com Alta na Data de Hoje</div>
                            <div class="item-lista">
                                <span class="label">Apartamento</span>
                                <span class="valor">${previsaoApto}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Feminina</span>
                                <span class="valor">${previsaoEnfFem}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Masculina</span>
                                <span class="valor">${previsaoEnfMasc}</span>
                            </div>
                        </div>
                        
                        <div class="kpi-modalidade-section">
                            <div class="modalidade-titulo">Leitos Divididos Conforme Modalidade Contratual com o Credenciado</div>
                            ${renderModalidadeContratual(modalidadePrevisao)}
                        </div>
                    </div>
                </div>

                <div class="kpi-box box-disponiveis">
                    <div class="kpi-title">Leitos Disponíveis</div>
                    
                    <div class="kpi-content">
                        ${renderGaugeV5((totalDisponiveis / totalLeitos * 100), '#3b82f6', totalDisponiveis)}
                        
                        <div class="kpi-items-lista">
                            <div class="kpi-subtitle">Capacidade por Tipo de Leito (não Simultâneo)</div>
                            <div class="item-lista">
                                <span class="label">Apartamento</span>
                                <span class="valor">até ${disponiveisApto}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Feminina</span>
                                <span class="valor">até ${disponiveisEnfFem}</span>
                            </div>
                            <div class="item-lista">
                                <span class="label">Enfermaria Masculina</span>
                                <span class="valor">até ${disponiveisEnfMasc}</span>
                            </div>
                        </div>
                        
                        <div class="kpi-modalidade-section">
                            <div class="modalidade-titulo">Leitos Divididos Conforme Modalidade Contratual com o Credenciado</div>
                            ${renderModalidadeContratual(modalidadeDisponiveis)}
                        </div>
                    </div>
                </div>

                <div class="kpi-box box-tph">
                    <div class="kpi-title">TPH Médio</div>
                    
                    <div class="kpi-tph-container">
                        <div class="kpi-tph-numero">${tphMedioGeral}</div>
                        <div class="kpi-tph-label">dias</div>
                        ${renderMiniGaugeTPH(parseFloat(tphMedioGeral))}
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">TPH (dias)</div>
                        <table class="hospitais-table">
                            <thead>
                                <tr>
                                    <th>Hospital</th>
                                    <th>TPH (dias)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hospitais.map(h => `
                                    <tr>
                                        <td>${h.nome}</td>
                                        <td>${h.tph.medio}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="kpi-box box-pps">
                    <div class="kpi-title">PPS</div>
                    
                    <div class="kpi-valores-duplos-divididos">
                        <div class="kpi-valor-metade">
                            <div class="valor">${ppsMedioGeral}</div>
                            <div class="label">PPS Médio</div>
                        </div>
                        <div class="divisor-vertical"></div>
                        <div class="kpi-valor-metade">
                            <div class="valor">${totalPPSMenor40.toString().padStart(2, '0')}</div>
                            <div class="label">PPS < 40%</div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">PPS < 40% por Hospital</div>
                        <table class="hospitais-table">
                            <thead>
                                <tr>
                                    <th>Hospital</th>
                                    <th>PPS < 40%</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hospitais.map(h => `
                                    <tr>
                                        <td>${h.nome}</td>
                                        <td>${h.pps.menor40.length}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="kpi-box box-spict">
                    <div class="kpi-title">SPICT-BR | Diretivas</div>
                    
                    <div class="kpi-valores-duplos-divididos">
                        <div class="kpi-valor-metade">
                            <div class="valor">${totalSpict.toString().padStart(2, '0')}</div>
                            <div class="label">SPICT-BR</div>
                        </div>
                        <div class="divisor-vertical"></div>
                        <div class="kpi-valor-metade">
                            <div class="valor">${totalDiretivas.toString().padStart(2, '0')}</div>
                            <div class="label">Diretivas</div>
                        </div>
                    </div>
                    
                    <div class="kpi-detalhes">
                        <div class="detalhe-titulo">Diretivas Pendentes por Hospital</div>
                        <table class="hospitais-table">
                            <thead>
                                <tr>
                                    <th>Hospital</th>
                                    <th>Diretivas Pendentes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hospitais.map(h => `
                                    <tr>
                                        <td>${h.nome}</td>
                                        <td>${h.spict.diretivas}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
            </div>
            
            <div class="executivo-graficos">
                
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Concessões em ${hoje}</h3>
                            <p>Previsão por Hospital e Período - Heatmap Temporal</p>
                        </div>
                    </div>
                    <div id="heatmapConcessoesContainer"></div>
                </div>
                
                ${CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO ? `
                <div class="executivo-grafico-card">
                    <div class="chart-header">
                        <div>
                            <h3>Análise Geral - Preditiva de Linhas de Cuidado em ${hoje}</h3>
                            <p>Previsão por Hospital e Período - Heatmap Temporal</p>
                        </div>
                    </div>
                    <div id="heatmapLinhasContainer"></div>
                </div>
                ` : ''}
                
            </div>
        </div>
        
        ${getExecutiveCSS()}
    `;
    
    const btnWhatsApp = document.getElementById('btnWhatsAppExec');
    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', copiarParaWhatsAppExecutivo);
    }
    
    const toggleBtn = document.getElementById('toggleFundoBtnExec');
    if (toggleBtn) {
        if (window.fundoBranco) {
            toggleBtn.classList.add('active');
            document.getElementById('toggleTextExec').textContent = 'Tema Claro';
        }
        
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const text = document.getElementById('toggleTextExec');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                text.textContent = 'Tema Claro';
            } else {
                toggleBtn.classList.remove('active');
                text.textContent = 'Tema Escuro';
            }
            
            renderHeatmapConcessoes();
            
            if (CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO) {
                renderHeatmapLinhas();
            }
            
            logInfo('Fundo executivo alterado para: ' + (window.fundoBranco ? 'claro' : 'escuro'));
        });
    }
    
    const aguardarChartJS = () => {
        if (typeof Chart === 'undefined') {
            setTimeout(aguardarChartJS, 100);
            return;
        }
        
        setTimeout(() => {
            renderHeatmapConcessoes();
            
            if (CONFIG_DASHBOARD.MOSTRAR_LINHAS_CUIDADO) {
                renderHeatmapLinhas();
            }
            
            logSuccess('Dashboard Executivo renderizado com dados atualizados (7 hospitais - 93 leitos)');
        }, 200);
    };
    
    aguardarChartJS();
};

// =================== FUNÇÃO PARA OBTER COR POR VALOR ===================
function getCorPorValor(valor) {
    if (valor === 0) return window.fundoBranco ? '#f8f9fa' : '#2d3748';
    if (valor <= 2) return '#E5E5E5';
    if (valor <= 4) return '#C6A664';
    if (valor <= 6) return '#0055A4';
    return '#003366';
}

function getCorTexto(valor) {
    if (valor === 0) return window.fundoBranco ? '#6b7280' : '#9ca3af';
    if (valor <= 4) return '#1e293b';
    return '#ffffff';
}

// =================== HEATMAP CONCESSÕES ===================
function renderHeatmapConcessoes() {
    const container = document.getElementById('heatmapConcessoesContainer');
    if (!container) return;
    
    const hospitaisValidos = ORDEM_ALFABETICA_HOSPITAIS;
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">Nenhum dado disponível</p>';
        return;
    }
    
    const periodos = ['HOJE', '24H', '48H', '72H'];
    const dadosConcessoes = calcularDadosConcessoesReais(hospitaisComDados);
    
    const CONFIG = {
        HOSPITAIS: {
            H1: { nome: 'Neomater', cor: '#2d3748' },
            H2: { nome: 'Cruz Azul', cor: '#2d3748' },
            H3: { nome: 'Santa Marcelina', cor: '#2d3748' },
            H4: { nome: 'Santa Clara', cor: '#2d3748' },
            H5: { nome: 'Adventista', cor: '#2d3748' },
            H6: { nome: 'Santa Cruz', cor: '#2d3748' },
            H7: { nome: 'Santa Virgínia', cor: '#2d3748' }
        }
    };
    
    let html = `
        <div class="heatmap-legenda">
            <strong>Escala:</strong>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #E5E5E5"></div>
                <span>1-2</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #C6A664"></div>
                <span>3-4</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #0055A4"></div>
                <span>5-6</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #003366"></div>
                <span>7+</span>
            </div>
        </div>
        
        <div class="heatmap-container">
            <table class="heatmap-table">
                <thead>
                    <tr>
                        <th class="concessao-label" style="background: ${window.fundoBranco ? '#f3f4f6' : '#1e293b'}; color: ${window.fundoBranco ? '#000' : '#fff'}; min-width: 200px;">Concessão</th>
    `;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        html += `<th colspan="4" style="background: ${hospital.cor}; color: white; border-left: 3px solid rgba(255,255,255,0.5);">${hospital.nome}</th>`;
    });
    
    html += '</tr><tr><th style="background: ' + (window.fundoBranco ? '#f3f4f6' : '#1e293b') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';"></th>';
    
    hospitaisComDados.forEach((hospitalId, idx) => {
        periodos.forEach((periodo, pIdx) => {
            html += '<th style="font-size: 11px; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + ' background: ' + (window.fundoBranco ? '#f3f4f6' : 'rgba(255,255,255,0.05)') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + periodo + '</th>';
        });
    });
    
    html += '</tr></thead><tbody>';
    
    Object.entries(dadosConcessoes).forEach(([concessao, hospitaisData], idx) => {
        html += '<tr style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f9fafb' : 'rgba(255,255,255,0.02)') : (window.fundoBranco ? '#ffffff' : 'transparent')) + ';">';
        html += '<td class="concessao-label" style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f3f4f6' : '#1e293b') : (window.fundoBranco ? '#e5e7eb' : '#0f172a')) + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + concessao + '</td>';
        
        hospitaisComDados.forEach((hospitalId, hIdx) => {
            periodos.forEach((periodo, pIdx) => {
                const valor = hospitaisData[hospitalId]?.[periodo] || 0;
                const cor = getCorPorValor(valor);
                const corTexto = getCorTexto(valor);
                
                html += '<td class="heatmap-cell" style="background: ' + cor + '; color: ' + corTexto + '; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + '" title="' + concessao + ' - ' + CONFIG.HOSPITAIS[hospitalId].nome + ' - ' + periodo + ': ' + valor + ' casos">' + (valor > 0 ? valor : '—') + '</td>';
            });
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
}

// =================== HEATMAP LINHAS ===================
function renderHeatmapLinhas() {
    const container = document.getElementById('heatmapLinhasContainer');
    if (!container) return;
    
    const hospitaisValidos = ORDEM_ALFABETICA_HOSPITAIS;
    const hospitaisComDados = hospitaisValidos.filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.length > 0;
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">Nenhum dado disponível</p>';
        return;
    }
    
    const periodos = ['HOJE', '24H', '48H', '72H'];
    const dadosLinhas = calcularDadosLinhasReais(hospitaisComDados);
    
    const CONFIG = {
        HOSPITAIS: {
            H1: { nome: 'Neomater', cor: '#2d3748' },
            H2: { nome: 'Cruz Azul', cor: '#2d3748' },
            H3: { nome: 'Santa Marcelina', cor: '#2d3748' },
            H4: { nome: 'Santa Clara', cor: '#2d3748' },
            H5: { nome: 'Adventista', cor: '#2d3748' },
            H6: { nome: 'Santa Cruz', cor: '#2d3748' },
            H7: { nome: 'Santa Virgínia', cor: '#2d3748' }
        }
    };
    
    let html = `
        <div class="heatmap-legenda">
            <strong>Escala:</strong>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #E5E5E5"></div>
                <span>1-2</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #C6A664"></div>
                <span>3-4</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #0055A4"></div>
                <span>5-6</span>
            </div>
            <div class="legenda-item">
                <div class="legenda-cor" style="background: #003366"></div>
                <span>7+</span>
            </div>
        </div>
        
        <div class="heatmap-container">
            <table class="heatmap-table">
                <thead>
                    <tr>
                        <th class="concessao-label" style="background: ${window.fundoBranco ? '#f3f4f6' : '#1e293b'}; color: ${window.fundoBranco ? '#000' : '#fff'}; min-width: 200px;">Linha de Cuidado</th>
    `;
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = CONFIG.HOSPITAIS[hospitalId];
        html += `<th colspan="4" style="background: ${hospital.cor}; color: white; border-left: 3px solid rgba(255,255,255,0.5);">${hospital.nome}</th>`;
    });
    
    html += '</tr><tr><th style="background: ' + (window.fundoBranco ? '#f3f4f6' : '#1e293b') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';"></th>';
    
    hospitaisComDados.forEach(() => {
        periodos.forEach((periodo, pIdx) => {
            html += '<th style="font-size: 11px; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + ' background: ' + (window.fundoBranco ? '#f3f4f6' : 'rgba(255,255,255,0.05)') + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + periodo + '</th>';
        });
    });
    
    html += '</tr></thead><tbody>';
    
    Object.entries(dadosLinhas).forEach(([linha, hospitaisData], idx) => {
        html += '<tr style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f9fafb' : 'rgba(255,255,255,0.02)') : (window.fundoBranco ? '#ffffff' : 'transparent')) + ';">';
        html += '<td class="concessao-label" style="background: ' + (idx % 2 === 0 ? (window.fundoBranco ? '#f3f4f6' : '#1e293b') : (window.fundoBranco ? '#e5e7eb' : '#0f172a')) + '; color: ' + (window.fundoBranco ? '#000' : '#fff') + ';">' + linha + '</td>';
        
        hospitaisComDados.forEach((hospitalId) => {
            periodos.forEach((periodo, pIdx) => {
                const valor = hospitaisData[hospitalId]?.[periodo] || 0;
                const cor = getCorPorValor(valor);
                const corTexto = getCorTexto(valor);
                
                html += '<td class="heatmap-cell" style="background: ' + cor + '; color: ' + corTexto + '; ' + (pIdx === 0 ? 'border-left: 3px solid rgba(255,255,255,0.5);' : '') + '" title="' + linha + ' - ' + CONFIG.HOSPITAIS[hospitalId].nome + ' - ' + periodo + ': ' + valor + ' casos">' + (valor > 0 ? valor : '—') + '</td>';
            });
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
}

// =================== CALCULAR DADOS CONCESSÕES ===================
function calcularDadosConcessoesReais(hospitaisComDados) {
    const concessoesPorItem = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (!isOcupadoExecutivo(leito)) return;
            
            const concessoes = leito.concessoes || (leito.paciente && leito.paciente.concessoes);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (concessoes && prevAlta) {
                const concessoesList = Array.isArray(concessoes) ? concessoes : String(concessoes).split('|');
                
                let periodo = '';
                if (prevAlta.includes('Hoje')) periodo = 'HOJE';
                else if (prevAlta.includes('24h') || prevAlta.includes('24H')) periodo = '24H';
                else if (prevAlta === '48h' || prevAlta === '48H') periodo = '48H';
                else if (prevAlta === '72h' || prevAlta === '72H') periodo = '72H';
                
                if (periodo) {
                    concessoesList.forEach(concessao => {
                        if (concessao && concessao.trim()) {
                            const nome = concessao.trim();
                            
                            if (!concessoesPorItem[nome]) {
                                concessoesPorItem[nome] = {};
                                hospitaisComDados.forEach(hId => {
                                    concessoesPorItem[nome][hId] = {
                                        'HOJE': 0,
                                        '24H': 0,
                                        '48H': 0,
                                        '72H': 0
                                    };
                                });
                            }
                            
                            concessoesPorItem[nome][hospitalId][periodo]++;
                        }
                    });
                }
            }
        });
    });
    
    return concessoesPorItem;
}

// =================== CALCULAR DADOS LINHAS ===================
function calcularDadosLinhasReais(hospitaisComDados) {
    const linhasPorItem = {};
    
    hospitaisComDados.forEach(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        if (!hospital || !hospital.leitos) return;
        
        hospital.leitos.forEach(leito => {
            if (!isOcupadoExecutivo(leito)) return;
            
            const linhas = leito.linhas || (leito.paciente && leito.paciente.linhas);
            const prevAlta = leito.prevAlta || (leito.paciente && leito.paciente.prevAlta);
            
            if (linhas && prevAlta) {
                const linhasList = Array.isArray(linhas) ? linhas : String(linhas).split('|');
                
                let periodo = '';
                if (prevAlta.includes('Hoje')) periodo = 'HOJE';
                else if (prevAlta.includes('24h') || prevAlta.includes('24H')) periodo = '24H';
                else if (prevAlta === '48h' || prevAlta === '48H') periodo = '48H';
                else if (prevAlta === '72h' || prevAlta === '72H') periodo = '72H';
                
                if (periodo) {
                    linhasList.forEach(linha => {
                        if (linha && linha.trim()) {
                            const nome = linha.trim();
                            
                            if (!linhasPorItem[nome]) {
                                linhasPorItem[nome] = {};
                                hospitaisComDados.forEach(hId => {
                                    linhasPorItem[nome][hId] = {
                                        'HOJE': 0,
                                        '24H': 0,
                                        '48H': 0,
                                        '72H': 0
                                    };
                                });
                            }
                            
                            linhasPorItem[nome][hospitalId][periodo]++;
                        }
                    });
                }
            }
        });
    });
    
    return linhasPorItem;
}

// CSS COM text-transform: none !important E BORDAS BRANCAS FIXAS
function getExecutiveCSS() {
    return `
        <style id="executiveCSS">
            * {
                text-transform: none !important;
            }
            
            .kpis-grid-executivo {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .kpi-box {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 25px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.8);
                border-top: 3px solid #ffffff !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                min-height: 500px;
                display: flex;
                flex-direction: column;
                color: white;
            }
            
            .kpi-box:hover {
                background: rgba(255, 255, 255, 0.05);
                border-color: #ffffff !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-title {
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
                text-transform: none !important;
                letter-spacing: 0.5px;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .gauge-largo-container {
                position: relative;
                width: 100%;
                max-width: 500px;
                height: 280px;
                margin: 0 auto;
                padding-top: 20px;
            }
            
            .gauge-largo-info {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -40%);
                text-align: center;
                width: 100%;
                pointer-events: none;
                z-index: 10;
            }
            
            .gauge-largo-number {
                font-size: 35px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 18px;
                margin-top: 25px;
                text-transform: none !important;
            }
            
            .gauge-largo-label {
                font-size: 10px;
                color: #9ca3af;
                text-transform: none !important;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }
            
            .gauge-largo-percentage {
                font-size: 60px;
                font-weight: 700;
                color: #22c55e;
                padding: 6px 16px;
                border-radius: 12px;
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid #22c55e;
                display: inline-block;
                margin-top: 8px;
                text-transform: none !important;
            }
            
            .gauge-largo-subtitle {
                font-size: 11px;
                color: #6b7280;
                line-height: 1.4;
                margin-top: 8px;
                text-transform: none !important;
            }
            
            .v5-gauge-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                margin: 20px 0;
            }
            
            .v5-gauge {
                width: 120px;
                height: 70px;
            }
            
            .v5-number-inside {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 43px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-top: 8px;
                text-transform: none !important;
            }
            
            .v5-badge-below {
                font-size: 14px;
                font-weight: 700;
                padding: 4px 12px;
                border-radius: 12px;
                border: 1px solid;
                text-transform: none !important;
            }
            
            .v5-badge-below.green {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
                border-color: #22c55e;
            }
            
            .v5-badge-below.orange {
                background: rgba(249, 115, 22, 0.2);
                color: #f97316;
                border-color: #f97316;
            }
            
            .v5-badge-below.blue {
                background: rgba(6, 118, 187, 0.2);
                color: #0676bb;
                border-color: #0676bb;
            }
            
            .kpi-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .kpi-items-lista {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .kpi-modalidade-section {
                width: 100%;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .modalidade-titulo {
                font-size: 11px;
                font-weight: 600;
                color: #60a5fa;
                text-transform: none !important;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
                text-align: left;
            }
            
            .item-lista {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.02);
                transition: background 0.2s ease;
            }
            
            .item-lista:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .item-lista .label {
                font-size: 14px;
                color: #9ca3af;
                text-transform: none !important;
            }
            
            .item-lista .valor {
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
                text-transform: none !important;
            }
            
            .kpi-subtitle {
                font-size: 11px;
                color: #6b7280;
                font-style: italic;
                text-align: center;
                margin-bottom: 10px;
                text-transform: none !important;
            }
            
            .kpi-detalhes {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 15px;
            }
            
            .detalhe-titulo {
                font-size: 11px;
                font-weight: 600;
                color: #60a5fa;
                text-transform: none !important;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
            }
            
            .lista-simples-compacta {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .lista-item-compacto {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 3px 10px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.02);
                transition: background 0.2s ease;
            }
            
            .lista-item-compacto:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .lista-item-compacto .label {
                font-size: 13px;
                color: #9ca3af;
                text-transform: none !important;
            }
            
            .lista-item-compacto .valor {
                font-size: 13px;
                font-weight: 600;
                color: #ffffff;
                text-transform: none !important;
            }
            
            .kpi-valores-duplos-divididos {
                display: flex;
                align-items: center;
                gap: 25px;
                margin-bottom: 20px;
            }
            
            .kpi-valor-metade {
                flex: 1;
                text-align: center;
            }
            
            .kpi-valor-metade .valor {
                font-size: 43px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 8px;
                text-transform: none !important;
            }
            
            .kpi-valor-metade .label {
                font-size: 13px;
                color: #9ca3af;
                text-transform: none !important;
                letter-spacing: 0.5px;
            }
            
            .divisor-vertical {
                width: 1px;
                height: 80px;
                background: rgba(255, 255, 255, 0.2);
            }
            
            .kpi-tph-container {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .kpi-tph-numero {
                font-size: 43px;
                font-weight: 700;
                color: white;
                line-height: 1;
                text-transform: none !important;
            }
            
            .kpi-tph-label {
                font-size: 16px;
                color: #9ca3af;
                margin-top: 8px;
                text-transform: none !important;
            }
            
            .tph-mini-gauge {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-top: 15px;
            }
            
            .tph-gauge-bar {
                display: flex;
                align-items: center;
                gap: 2px;
                height: 20px;
            }
            
            .tph-gauge-block {
                width: 8px;
                height: 20px;
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
                font-size: 13px;
                font-weight: 600;
                color: #9ca3af;
                text-transform: none !important;
            }
            
            .tph-gauge-bar.green { color: #22c55e; }
            .tph-gauge-bar.yellow { color: #f59e0b; }
            .tph-gauge-bar.red { color: #ef4444; }
            
            .hospitais-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            
            .hospitais-table thead {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hospitais-table th {
                text-align: left;
                padding: 8px;
                color: #60a5fa;
                font-weight: 600;
                text-transform: none !important;
                font-size: 11px;
                letter-spacing: 0.5px;
            }
            
            .hospitais-table td {
                padding: 8px;
                color: #e5e7eb;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                text-transform: none !important;
            }
            
            .hospitais-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            .hospitais-table tbody tr:hover {
                background: rgba(255, 255, 255, 0.03);
            }
            
            .hospitais-table-ocupacao {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            
            .hospitais-table-ocupacao thead {
                border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            }
            
            .hospitais-table-ocupacao th {
                text-align: left;
                padding: 10px 8px;
                color: #60a5fa;
                font-weight: 600;
                text-transform: none !important;
                font-size: 11px;
                letter-spacing: 0.5px;
            }
            
            .hospitais-table-ocupacao th:nth-child(2),
            .hospitais-table-ocupacao th:nth-child(3),
            .hospitais-table-ocupacao th:nth-child(4) {
                text-align: center;
            }
            
            .hospitais-table-ocupacao tbody tr:not(.regua-row) td {
                padding: 10px 8px;
                color: #e5e7eb;
                border-bottom: none;
                text-transform: none !important;
            }
            
            .hospitais-table-ocupacao tbody tr:not(.regua-row) td:nth-child(2),
            .hospitais-table-ocupacao tbody tr:not(.regua-row) td:nth-child(3),
            .hospitais-table-ocupacao tbody tr:not(.regua-row) td:nth-child(4) {
                text-align: center;
            }
            
            .hospitais-table-ocupacao tbody tr.regua-row td {
                padding: 4px 8px 12px 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .hospitais-table-ocupacao tbody tr:not(.regua-row):hover {
                background: rgba(255, 255, 255, 0.03);
            }
            
            .ocupacao-mini-gauge {
                width: 100%;
            }
            
            .ocupacao-gauge-bar {
                display: flex;
                align-items: center;
                gap: 2px;
                height: 8px;
            }
            
            .ocupacao-gauge-block {
                flex: 1;
                height: 100%;
                border-radius: 1px;
                transition: all 0.3s ease;
            }
            
            .ocupacao-gauge-block.filled {
                background: currentColor;
            }
            
            .ocupacao-gauge-block.empty {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .executivo-graficos {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .executivo-grafico-card {
                background: #1a1f2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                color: white;
            }
            
            .chart-header {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .chart-header h3 {
                margin: 0 0 5px 0;
                color: white;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                text-transform: none !important;
            }
            
            .chart-header p {
                margin: 0;
                color: #9ca3af;
                font-size: 14px;
                text-transform: none !important;
            }
            
            .heatmap-container {
                overflow-x: auto;
                margin: 20px 0;
            }
            
            .heatmap-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }
            
            .heatmap-table th,
            .heatmap-table td {
                padding: 12px;
                text-align: center;
                border: 2px solid rgba(15, 23, 42, 0.3);
                text-transform: none !important;
            }
            
            .heatmap-table th {
                background: rgba(255, 255, 255, 0.1);
                font-weight: 700;
                text-transform: none !important;
            }
            
            .heatmap-cell {
                font-weight: 700;
                transition: all 0.2s ease;
                cursor: pointer;
                text-transform: none !important;
            }
            
            .heatmap-cell:hover {
                transform: scale(1.15);
                z-index: 20;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }
            
            .concessao-label {
                text-align: left !important;
                font-weight: 600;
                position: sticky;
                left: 0;
                z-index: 5;
                text-transform: none !important;
            }
            
            .heatmap-legenda {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                font-size: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .legenda-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .legenda-cor {
                width: 20px;
                height: 20px;
                border-radius: 4px;
                border: 1px solid rgba(0, 0, 0, 0.2);
            }
            
            .toggle-fundo-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-1px);
            }
            
            .toggle-fundo-btn.active {
                background: #f59e0b !important;
                border-color: #f59e0b !important;
                color: #000000 !important;
            }

            #btnWhatsAppExec:hover {
                background: #1da851 !important;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
            }
            
            @media (min-width: 768px) and (max-width: 1024px) {
                .gauge-largo-info {
                    top: 52% !important;
                    transform: translate(-50%, -42%) !important;
                }
                
                .gauge-largo-number {
                    font-size: 32px !important;
                    margin-top: 20px !important;
                    margin-bottom: 15px !important;
                }
                
                .gauge-largo-percentage {
                    font-size: 55px !important;
                }
            }
            
            @media (max-width: 1200px) {
                .kpis-grid-executivo {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }
            }
            
            @media (max-width: 768px) {
                .kpis-grid-executivo {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 20px !important;
                    width: 100% !important;
                    padding: 0 !important;
                }
                
                .kpi-box {
                    min-height: auto !important;
                    padding: 20px 15px !important;
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 0 20px 0 !important;
                    box-sizing: border-box !important;
                }
                
                .dashboard-header-exec {
                    padding: 15px !important;
                    margin-bottom: 20px !important;
                }
                
                .dashboard-header-exec h2 {
                    font-size: 16px !important;
                    margin-bottom: 15px !important;
                    text-align: center !important;
                }
                
                .dashboard-header-exec > div:last-child {
                    flex-direction: column !important;
                    width: 100% !important;
                    gap: 10px !important;
                }
                
                #btnWhatsAppExec,
                #toggleFundoBtnExec {
                    width: 100% !important;
                    justify-content: center !important;
                }
                
                .gauge-largo-container {
                    width: 100% !important;
                    height: 250px !important;
                    padding: 10px !important;
                    position: relative !important;
                    min-height: 250px !important;
                }
                
                .gauge-largo-container svg {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 300px !important;
                    margin: 0 auto !important;
                }
                
                .gauge-largo-info {
                    position: absolute !important;
                    top: 45% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: 100% !important;
                    padding: 0 10px !important;
                    pointer-events: none !important;
                    z-index: 10 !important;
                }
                
                .gauge-largo-number {
                    font-size: 28px !important;
                    margin-bottom: 8px !important;
                    margin-top: 20px !important;
                }
                
                .gauge-largo-label {
                    font-size: 9px !important;
                    margin-bottom: 5px !important;
                }
                
                .gauge-largo-percentage {
                    font-size: 40px !important;
                    padding: 4px 12px !important;
                    margin-top: 5px !important;
                }
                
                .gauge-largo-subtitle {
                    font-size: 9px !important;
                    margin-top: 5px !important;
                    white-space: normal !important;
                    line-height: 1.2 !important;
                }
                
                .v5-gauge-container {
                    margin: 15px 0 !important;
                }
                
                .v5-gauge {
                    width: 100px !important;
                    height: 60px !important;
                }
                
                .v5-number-inside {
                    font-size: 28px !important;
                    margin-top: 5px !important;
                }
                
                .v5-badge-below {
                    font-size: 12px !important;
                    padding: 3px 10px !important;
                }
                
                .kpi-valores-duplos-divididos {
                    gap: 15px !important;
                }
                
                .kpi-valor-metade .valor {
                    font-size: 28px !important;
                }
                
                .kpi-valor-metade .label {
                    font-size: 11px !important;
                }
                
                .divisor-vertical {
                    height: 60px !important;
                }
                
                .kpi-tph-numero {
                    font-size: 28px !important;
                }
                
                .kpi-tph-label {
                    font-size: 14px !important;
                }
                
                .tph-gauge-block {
                    width: 6px !important;
                    height: 16px !important;
                }
                
                .ocupacao-gauge-block {
                    height: 6px !important;
                }
                
                .hospitais-table-ocupacao,
                .hospitais-table {
                    font-size: 11px !important;
                }
                
                .hospitais-table-ocupacao th,
                .hospitais-table-ocupacao td,
                .hospitais-table th,
                .hospitais-table td {
                    padding: 6px 4px !important;
                    font-size: 11px !important;
                }
                
                .kpi-items-lista {
                    gap: 5px !important;
                    padding-top: 10px !important;
                }
                
                .kpi-modalidade-section {
                    margin-top: 15px !important;
                    padding-top: 10px !important;
                }
                
                .modalidade-titulo {
                    font-size: 10px !important;
                    margin-bottom: 8px !important;
                    line-height: 1.3 !important;
                }
                
                .item-lista {
                    padding: 6px 10px !important;
                }
                
                .item-lista .label {
                    font-size: 12px !important;
                }
                
                .item-lista .valor {
                    font-size: 13px !important;
                }
                
                .lista-simples-compacta {
                    gap: 3px !important;
                }
                
                .lista-item-compacto {
                    padding: 3px 8px !important;
                }
                
                .lista-item-compacto .label {
                    font-size: 11px !important;
                }
                
                .lista-item-compacto .valor {
                    font-size: 11px !important;
                }
                
                .kpi-detalhes {
                    padding-top: 10px !important;
                }
                
                .detalhe-titulo {
                    font-size: 10px !important;
                    margin-bottom: 8px !important;
                    line-height: 1.3 !important;
                }
                
                .executivo-grafico-card {
                    padding: 15px !important;
                    margin-bottom: 20px !important;
                }
                
                .chart-header h3 {
                    font-size: 14px !important;
                    line-height: 1.3 !important;
                }
                
                .chart-header p {
                    font-size: 12px !important;
                }
                
                .heatmap-container {
                    overflow-x: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                
                .heatmap-table {
                    min-width: 600px !important;
                    font-size: 10px !important;
                }
                
                .heatmap-table th,
                .heatmap-table td {
                    padding: 8px 4px !important;
                    font-size: 10px !important;
                }
                
                .concessao-label {
                    min-width: 120px !important;
                    font-size: 10px !important;
                }
                
                .heatmap-legenda {
                    font-size: 10px !important;
                    gap: 8px !important;
                }
                
                .legenda-cor {
                    width: 15px !important;
                    height: 15px !important;
                }
                
                .kpi-title {
                    font-size: 13px !important;
                    font-weight: 700 !important;
                    color: #ffffff !important;
                    margin-bottom: 15px !important;
                }
                
                body > div[style*="background: linear-gradient"] {
                    padding: 10px !important;
                }
            }
            
            @media (max-width: 480px) {
                .gauge-largo-container {
                    height: 220px !important;
                    min-height: 220px !important;
                }
                
                .gauge-largo-number {
                    font-size: 24px !important;
                }
                
                .gauge-largo-percentage {
                    font-size: 32px !important;
                }
                
                .v5-number-inside {
                    font-size: 24px !important;
                }
                
                .kpi-valor-metade .valor {
                    font-size: 24px !important;
                }
                
                .kpi-tph-numero {
                    font-size: 24px !important;
                }
                
                .hospitais-table-ocupacao,
                .hospitais-table {
                    font-size: 10px !important;
                }
                
                .hospitais-table-ocupacao th,
                .hospitais-table-ocupacao td,
                .hospitais-table th,
                .hospitais-table td {
                    padding: 4px 2px !important;
                    font-size: 10px !important;
                }
                
                .dashboard-header-exec h2 {
                    font-size: 14px !important;
                }
                
                .kpi-box {
                    padding: 15px 10px !important;
                    margin-bottom: 20px !important;
                }
            }
            
            @media (max-width: 768px) {
                body {
                    overflow-x: hidden !important;
                }
                
                * {
                    max-width: 100vw !important;
                }
            }
        </style>
    `;
}

function logInfo(message) {
    console.log('[DASHBOARD EXECUTIVO V4.0] ' + message);
}

function logSuccess(message) {
    console.log('[DASHBOARD EXECUTIVO V4.0] ✅ ' + message);
}

function logError(message) {
    console.error('[DASHBOARD EXECUTIVO V4.0] ❌ ' + message);
}

console.log('Dashboard Executivo V4.0 - CORRIGIDO COMPLETO');
console.log('✅ 7 Hospitais (H1-H7) | 93 Leitos');
console.log('✅ Diretivas: SPICT elegível + Diretivas = "Não"');
console.log('✅ text-transform: none !important em TUDO');
console.log('✅ Bordas brancas sempre visíveis');
console.log('✅ Ordem alfabética: Adventista → Santa Virgínia');
