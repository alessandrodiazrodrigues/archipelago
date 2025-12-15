// =================== DASHBOARD UTI V7.5 ===================
// =================== LEITOS UTI - INICIAL: H2 CRUZ AZUL ===================
// =================== 20 CONTRATUAIS + 10 EXTRAS = 30 TOTAL ===================
// V7.5: SPICT-BR reativado, relatorio WhatsApp simplificado

console.log('Dashboard UTI V7.5 - Carregando...');

// =================== CONFIGURACAO UTI POR HOSPITAL ===================
const UTI_CAPACIDADE = {
    H1: { contratuais: 3, extras: 2, total: 5 },
    H2: { contratuais: 20, extras: 10, total: 30 },
    H3: { contratuais: 2, extras: 2, total: 4 },
    H4: { contratuais: 4, extras: 2, total: 6 },
    H5: { contratuais: 4, extras: 2, total: 6 },
    H6: { contratuais: 2, extras: 2, total: 4 },
    H7: { contratuais: 0, extras: 0, total: 0 },
    H8: { contratuais: 2, extras: 2, total: 4 },
    H9: { contratuais: 2, extras: 2, total: 4 }
};

// Hospitais com UTI (para dropdown)
const HOSPITAIS_COM_UTI = ['H2']; // Por enquanto so H2

// Cores do sistema
const CORES_UTI = {
    azulMarinhoEscuro: '#131b2e',
    azulEscuro: '#172945',
    azulMedio: '#1c5083',
    azulPrincipal: '#60a5fa',
    azulAcinzentado: '#577a97',
    azulClaro: '#a9c0d2',
    cinzaEscuro: '#3c3a3e',
    cinzaMedio: '#9ca3af',
    cinzaClaro: '#e9e5e2',
    cinzaBloqueado: '#4b5563',
    bloqueadoFundo: 'rgba(75, 85, 99, 0.3)'
};

// =================== FUNCOES AUXILIARES ===================
function isOcupadoUTI(leito) {
    if (!leito || !leito.status) return false;
    const s = (leito.status || '').toString().toLowerCase().trim();
    return s === 'ocupado' || s === 'em uso' || s === 'ocupada';
}

function isVagoUTI(leito) {
    if (!leito || !leito.status) return false;
    const s = (leito.status || '').toString().toLowerCase().trim();
    return s === 'vago' || s === 'disponivel' || s === 'disponível' || s === 'livre';
}

// Filtrar APENAS leitos UTI
function filtrarLeitosUTI(leitos) {
    if (!Array.isArray(leitos)) return [];
    return leitos.filter(l => l.tipo === 'UTI');
}

// Buscar reservas UTI por hospital
function getReservasUTI(hospitalId) {
    const reservas = window.reservasData || [];
    return reservas.filter(r => 
        r.hospital === hospitalId && 
        r.tipo === 'UTI' &&
        r.matricula && String(r.matricula).trim() !== ''
    );
}

// Parse data de admissao
function parseAdmDateUTI(admAt) {
    if (!admAt) return null;
    const d = new Date(admAt);
    if (!isNaN(d)) {
        const dias = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
        if (dias >= 0 && dias <= 365) return d;
    }
    return null;
}

// =================== CALCULAR GAUGE OFFSET ===================
function calcularGaugeOffsetUTI(porcentagem) {
    var circunferencia = Math.PI * 66;
    var progresso = (porcentagem / 100) * circunferencia;
    return circunferencia - progresso;
}

// =================== RENDER GAUGE V5 UTI ===================
function renderGaugeUTI(porcentagem, cor, numero) {
    var offset = calcularGaugeOffsetUTI(porcentagem);
    
    return '\
        <div class="v5-gauge-container-uti">\
            <div style="position: relative;">\
                <svg class="v5-gauge-uti" viewBox="0 0 168 96">\
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
                <div class="v5-number-inside-uti">' + numero.toString().padStart(2, '0') + '</div>\
            </div>\
            <div class="v5-badge-below-uti">' + porcentagem.toFixed(0) + '%</div>\
        </div>\
    ';
}

// =================== PROCESSAR DADOS HOSPITAL UTI ===================
function processarDadosUTI(hospitalId) {
    // V7.1: Buscar em window.leitosUTI (separado de hospitalData)
    const hospitalObj = window.leitosUTI[hospitalId] || {};
    let leitos = hospitalObj.leitos || [];
    
    if (!Array.isArray(leitos)) {
        leitos = [];
    }
    
    // Nao precisa filtrar - window.leitosUTI ja contem apenas UTI
    console.log('[UTI] Hospital ' + hospitalId + ' - Leitos encontrados: ' + leitos.length);
    
    // Buscar capacidade UTI
    const capacidade = UTI_CAPACIDADE[hospitalId];
    if (!capacidade) {
        console.error('[UTI] Capacidade nao encontrada para ' + hospitalId);
        return null;
    }
    
    // Buscar reservas UTI
    const reservas = getReservasUTI(hospitalId);
    
    // Ocupados
    const ocupados = leitos.filter(l => isOcupadoUTI(l));
    
    // Ocupados por Modalidade Contratada (categoriaEscolhida)
    const ocupadosApto = ocupados.filter(l => 
        l.categoriaEscolhida === 'Apartamento'
    ).length;
    const ocupadosEnf = ocupados.filter(l => 
        l.categoriaEscolhida === 'Enfermaria'
    ).length;
    
    // Previsao de Alta (Hoje)
    const previsaoAlta = ocupados.filter(l => {
        if (!l.prevAlta || String(l.prevAlta).trim() === '') return false;
        const prev = String(l.prevAlta).toLowerCase();
        return prev.includes('hoje');
    });
    
    // Lista de previsao de alta com leito e matricula
    const previsaoAltaLista = previsaoAlta.map(l => ({
        leito: l.identificacaoLeito || l.leito || '---',
        matricula: l.matricula || '---'
    }));
    
    const previsaoApto = previsaoAlta.filter(l => 
        l.categoriaEscolhida === 'Apartamento'
    ).length;
    const previsaoEnf = previsaoAlta.filter(l => 
        l.categoriaEscolhida === 'Enfermaria'
    ).length;
    
    // Reservados por Modalidade
    let reservadosApto = 0;
    let reservadosEnf = 0;
    
    reservas.forEach(r => {
        const cat = (r.categoriaEscolhida || r.tipo || '').toLowerCase();
        if (cat === 'apartamento' || cat === 'apto') {
            reservadosApto++;
        } else if (cat === 'enfermaria' || cat === 'enf') {
            reservadosEnf++;
        }
    });
    
    // Vagos
    const vagos = leitos.filter(l => isVagoUTI(l));
    
    // Disponiveis = contratuais - ocupados - reservados
    const disponiveisTotal = Math.max(capacidade.contratuais - ocupados.length - reservas.length, 0);
    
    // TPH
    const hoje = new Date();
    const tphValues = ocupados
        .map(l => {
            if (!l.admAt) return 0;
            const admData = parseAdmDateUTI(l.admAt);
            if (!admData) return 0;
            const dias = Math.floor((hoje - admData) / (1000 * 60 * 60 * 24));
            return (dias >= 0 && dias <= 365) ? dias : 0;
        })
        .filter(v => v >= 0);
    
    const tphMedio = tphValues.length > 0 
        ? (tphValues.reduce((a, b) => a + b, 0) / tphValues.length).toFixed(2)
        : '0.00';
    
    // Leitos com mais de 5 diarias (>= 120 horas)
    const leitosMais5Diarias = ocupados.filter(l => {
        if (!l.admAt) return false;
        const admData = parseAdmDateUTI(l.admAt);
        if (!admData) return false;
        const horas = (hoje - admData) / (1000 * 60 * 60);
        return horas >= 120; // 5 dias = 120 horas
    }).map(l => {
        const admData = parseAdmDateUTI(l.admAt);
        const dias = Math.floor((hoje - admData) / (1000 * 60 * 60 * 24));
        return {
            leito: l.identificacaoLeito || l.leito || '---',
            matricula: l.matricula || '---',
            dias: dias
        };
    }).sort((a, b) => b.dias - a.dias); // Ordenar por dias decrescente
    
    // Taxa de ocupacao
    const base = Math.max(capacidade.contratuais, ocupados.length);
    const taxaOcupacao = base > 0 ? Math.min((ocupados.length / base) * 100, 100) : 0;
    
    // Porcentagem de reservados
    const porcentagemReservados = capacidade.contratuais > 0 
        ? Math.min((reservas.length / capacidade.contratuais) * 100, 100) 
        : 0;
    
    // Nome do hospital
    const nomeHospital = hospitalId === 'H2' ? 'Cruz Azul' :
                         hospitalId === 'H1' ? 'Neomater' :
                         hospitalId === 'H3' ? 'Santa Marcelina' :
                         hospitalId === 'H4' ? 'Santa Clara' :
                         hospitalId === 'H5' ? 'Adventista' :
                         hospitalId === 'H6' ? 'Santa Cruz' :
                         hospitalId === 'H7' ? 'Santa Virginia' :
                         hospitalId === 'H8' ? 'Sao Camilo Ipiranga' :
                         hospitalId === 'H9' ? 'Sao Camilo Pompeia' : hospitalId;
    
    // V7.5: SPICT-BR - Contar elegiveis
    const spictElegiveis = ocupados.filter(l => {
        const spict = (l.spict || '').toLowerCase().trim();
        return spict === 'elegivel';
    });
    
    // Lista de SPICT elegiveis
    const spictLista = spictElegiveis.map(l => ({
        leito: l.identificacaoLeito || l.leito || '---',
        matricula: l.matricula || '---'
    }));
    
    return {
        id: hospitalId,
        nome: nomeHospital,
        contratuais: capacidade.contratuais,
        extras: capacidade.extras,
        total: capacidade.total,
        totalLeitos: leitos.length,
        taxaOcupacao: taxaOcupacao,
        porcentagemReservados: porcentagemReservados,
        ocupados: {
            total: ocupados.length,
            apartamento: ocupadosApto,
            enfermaria: ocupadosEnf
        },
        reservados: {
            total: reservas.length,
            apartamento: reservadosApto,
            enfermaria: reservadosEnf
        },
        previsao: {
            total: previsaoAlta.length,
            apartamento: previsaoApto,
            enfermaria: previsaoEnf,
            lista: previsaoAltaLista
        },
        disponiveis: {
            total: disponiveisTotal
        },
        tph: {
            medio: tphMedio,
            lista: leitosMais5Diarias
        },
        spict: {
            total: spictElegiveis.length,
            lista: spictLista
        }
    };
}

// =================== COPIAR PARA WHATSAPP UTI ===================
// V7.6: Formato simplificado - sem lista de vagos, sem bloqueados, com matriculas
function copiarParaWhatsAppUTI(hospitalId) {
    const dados = processarDadosUTI(hospitalId);
    if (!dados) {
        alert('Erro ao processar dados UTI');
        return;
    }
    
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const data = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Buscar reservas
    const reservas = getReservasUTI(hospitalId);
    
    // Montar texto
    let texto = `UTI - Hospital ${dados.nome} - ${data} ${hora}\n`;
    texto += `Leitos Ocupados: ${dados.ocupados.total}\n`;
    
    // Altas Sinalizadas (Previsao Hoje) com matricula
    texto += `Altas Sinalizadas: ${dados.previsao.total}\n`;
    if (dados.previsao.lista && dados.previsao.lista.length > 0) {
        dados.previsao.lista.forEach(l => {
            const mat = l.matricula ? ` | Mat: ${l.matricula}` : '';
            texto += `  . L${l.leito}${mat}\n`;
        });
    } else {
        texto += `  -\n`;
    }
    
    // Leitos Vagos - apenas quantidade (dos contratuais, nunca negativo)
    const vagosDisponiveis = Math.max(0, dados.contratuais - dados.ocupados.total - dados.reservados.total);
    texto += `Leitos Vagos: ${vagosDisponiveis}\n`;
    
    // Leitos Reservados com matricula
    texto += `Leitos Reservados: ${dados.reservados.total}\n`;
    if (reservas.length > 0) {
        reservas.forEach(r => {
            const mat = r.matricula ? ` | Mat: ${r.matricula}` : '';
            texto += `  . L${r.identificacaoLeito || r.leito || '?'}${mat}\n`;
        });
    } else {
        texto += `  -\n`;
    }
    
    // SPICT-BR Elegiveis com matricula
    texto += `SPICT-BR Elegiveis: ${dados.spict.total}\n`;
    if (dados.spict.lista && dados.spict.lista.length > 0) {
        dados.spict.lista.forEach(l => {
            const mat = l.matricula ? ` | Mat: ${l.matricula}` : '';
            texto += `  . L${l.leito}${mat}\n`;
        });
    } else {
        texto += `  -\n`;
    }
    
    navigator.clipboard.writeText(texto).then(() => {
        alert('Texto copiado para a area de transferencia!\n\nCole no WhatsApp e envie.');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar. Tente novamente.');
    });
}

// =================== RENDER MINI GAUGE TPH UTI ===================
function renderMiniGaugeTPHUTI(valor) {
    const maxTPH = 30;
    const porcentagem = Math.min((valor / maxTPH) * 100, 100);
    
    let cor = '#22c55e';
    if (valor >= 20) cor = '#ef4444';
    else if (valor >= 10) cor = '#f59e0b';
    
    const offset = calcularGaugeOffsetUTI(porcentagem);
    
    return `
        <div class="mini-gauge-tph-uti">
            <svg viewBox="0 0 168 96" style="width: 60px; height: 36px;">
                <path d="M 18 84 A 66 66 0 0 1 150 84" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.1)" 
                      stroke-width="17" 
                      stroke-linecap="round"/>
                <path d="M 18 84 A 66 66 0 0 1 150 84" 
                      fill="none" 
                      stroke="${cor}" 
                      stroke-width="17" 
                      stroke-linecap="round"
                      stroke-dasharray="207.3"
                      stroke-dashoffset="${offset}"/>
            </svg>
        </div>
    `;
}

// =================== RENDER DASHBOARD UTI ===================
window.renderDashboardUTI = function(hospitalId) {
    hospitalId = hospitalId || 'H2'; // Default H2
    
    console.log('[UTI] Renderizando Dashboard UTI para ' + hospitalId);
    
    let container = document.getElementById('dashUTIContent');
    if (!container) {
        const dashSection = document.getElementById('dash-uti') || document.getElementById('dashboardContainer');
        if (dashSection) {
            container = document.createElement('div');
            container.id = 'dashUTIContent';
            dashSection.innerHTML = '';
            dashSection.appendChild(container);
        }
    }
    
    if (!container) {
        console.error('[UTI] Container nao encontrado');
        return;
    }
    
    // Verificar dados - V7.1: usar window.leitosUTI
    if (!window.leitosUTI || !window.leitosUTI[hospitalId]) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <h2 style="color: #ef4444; margin-bottom: 10px;">Dados UTI nao disponiveis</h2>
                <p style="color: #9ca3af;">Aguardando sincronizacao com a planilha</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Recarregar</button>
            </div>
        `;
        return;
    }
    
    // Processar dados
    const dados = processarDadosUTI(hospitalId);
    if (!dados) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <h2>Nenhum leito UTI encontrado para ${hospitalId}</h2>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // Render HTML
    container.innerHTML = `
        ${getUTIDashboardCSS()}
        
        <div class="dashboard-uti-wrapper">
            
            <!-- Header -->
            <div class="dashboard-header-uti">
                <h2 class="dashboard-title-uti">Dashboard UTI - ${dados.nome}</h2>
                
                <div class="header-controls-uti">
                    <select id="hospitalSelectUTI" class="hospital-select-uti" onchange="window.renderDashboardUTI(this.value)">
                        ${HOSPITAIS_COM_UTI.map(h => `
                            <option value="${h}" ${h === hospitalId ? 'selected' : ''}>
                                ${h === 'H2' ? 'Cruz Azul' : h}
                            </option>
                        `).join('')}
                    </select>
                    
                    <button id="btnWhatsAppUTI" class="btn-whatsapp-uti" onclick="copiarParaWhatsAppUTI('${hospitalId}')">
                        Copiar para WhatsApp
                    </button>
                </div>
            </div>
            
            <!-- Grid de KPIs - 6 boxes (2 linhas x 3 colunas) -->
            <div class="kpis-grid-uti">
                
                <!-- BOX 1: OCUPACAO -->
                <div class="kpi-box-uti box-ocupacao-uti">
                    <div class="kpi-title-uti">Ocupacao</div>
                    
                    <div class="kpi-content-uti">
                        <div class="dual-gauges-container-uti">
                            <div class="gauge-with-label-uti">
                                <div class="gauge-label-uti">Ocupados</div>
                                ${renderGaugeUTI(dados.taxaOcupacao, CORES_UTI.azulPrincipal, dados.ocupados.total)}
                            </div>
                            <div class="gauge-with-label-uti">
                                <div class="gauge-label-uti">Reservados</div>
                                ${renderGaugeUTI(dados.porcentagemReservados, CORES_UTI.azulPrincipal, dados.reservados.total)}
                            </div>
                        </div>
                        
                        <div class="kpi-subtitle-uti">Total por Modalidade Contratada</div>
                        <table class="modalidade-table-uti">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Ocupados</th>
                                    <th>Reservados</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="modalidade-label">Apartamento</td>
                                    <td class="modalidade-valor">${dados.ocupados.apartamento}</td>
                                    <td class="modalidade-valor">${dados.reservados.apartamento}</td>
                                </tr>
                                <tr>
                                    <td class="modalidade-label">Enfermaria</td>
                                    <td class="modalidade-valor">${dados.ocupados.enfermaria}</td>
                                    <td class="modalidade-valor">${dados.reservados.enfermaria}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- BOX 2: PREVISAO DE ALTA -->
                <div class="kpi-box-uti box-previsao-uti">
                    <div class="kpi-title-uti">Leitos em Previsao de Alta</div>
                    
                    <div class="kpi-content-uti">
                        ${renderGaugeUTI(
                            dados.ocupados.total > 0 ? (dados.previsao.total / dados.ocupados.total * 100) : 0, 
                            CORES_UTI.azulPrincipal, 
                            dados.previsao.total
                        )}
                        
                        <div class="previsao-detalhes-uti">
                            ${dados.previsao.lista && dados.previsao.lista.length > 0 ? `
                                <table class="previsao-table-uti">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left;">Leito</th>
                                            <th style="text-align: right;">Matricula</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${dados.previsao.lista.map(l => `
                                            <tr>
                                                <td style="text-align: left;">${l.leito}</td>
                                                <td style="text-align: right;">${l.matricula}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<div class="sem-dados-uti">Nenhum Leito com Previsao de Alta Hoje</div>'}
                        </div>
                    </div>
                </div>
                
                <!-- BOX 3: DISPONIVEIS -->
                <div class="kpi-box-uti box-disponiveis-uti">
                    <div class="kpi-title-uti">Leitos Disponiveis</div>
                    
                    <div class="kpi-content-uti">
                        ${renderGaugeUTI(
                            dados.contratuais > 0 ? (dados.disponiveis.total / dados.contratuais * 100) : 0, 
                            CORES_UTI.azulPrincipal, 
                            dados.disponiveis.total
                        )}
                        
                        <table class="modalidade-table-uti single-column">
                            <tbody>
                                <tr>
                                    <td class="modalidade-label">UTIs</td>
                                    <td class="modalidade-valor">${dados.disponiveis.total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- BOX 4: TPH MEDIO -->
                <div class="kpi-box-uti box-tph-uti">
                    <div class="kpi-title-uti">TPH Medio</div>
                    
                    <div class="kpi-content-uti">
                        <div class="tph-display-uti">
                            <div class="tph-numero-uti">${dados.tph.medio}</div>
                            <div class="tph-label-uti">dias</div>
                        </div>
                        
                        <div class="tph-detalhes-uti">
                            <div class="detalhe-titulo-uti">N Diarias > 5</div>
                            ${dados.tph.lista && dados.tph.lista.length > 0 ? `
                                <table class="tph-table-uti">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left;">Leito</th>
                                            <th style="text-align: center;">Matricula</th>
                                            <th style="text-align: right;">Dias</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${dados.tph.lista.map(l => `
                                            <tr>
                                                <td style="text-align: left;">${l.leito}</td>
                                                <td style="text-align: center;">${l.matricula}</td>
                                                <td style="text-align: right;">${l.dias}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<div class="sem-dados-uti">Nenhum Leito com Mais de 5 Diarias</div>'}
                        </div>
                    </div>
                </div>
                
                <!-- BOX 5: PPS MEDIO (BLOQUEADO) -->
                <div class="kpi-box-uti box-bloqueado-uti">
                    <div class="kpi-title-uti titulo-bloqueado">PPS Medio</div>
                    
                    <div class="kpi-content-uti content-bloqueado">
                        <div class="bloqueado-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div class="bloqueado-texto">Nao aplicavel para UTI</div>
                    </div>
                </div>
                
                <!-- BOX 6: SPICT-BR ELEGIVEIS (V7.5: Reativado) -->
                <div class="kpi-box-uti box-spict-uti">
                    <div class="kpi-title-uti">SPICT-BR Elegiveis</div>
                    
                    <div class="kpi-content-uti">
                        <div class="spict-display-uti">
                            <div class="spict-numero-uti">${dados.spict.total}</div>
                            <div class="spict-label-uti">pacientes</div>
                        </div>
                        
                        <div class="spict-detalhes-uti">
                            <div class="detalhe-titulo-uti">Lista de Elegiveis</div>
                            ${dados.spict.lista && dados.spict.lista.length > 0 ? `
                                <table class="spict-table-uti">
                                    <thead>
                                        <tr>
                                            <th style="text-align: left;">Leito</th>
                                            <th style="text-align: right;">Matricula</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${dados.spict.lista.map(l => `
                                            <tr>
                                                <td style="text-align: left;">${l.leito}</td>
                                                <td style="text-align: right;">${l.matricula}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<div class="sem-dados-uti">Nenhum Paciente Elegivel</div>'}
                        </div>
                    </div>
                </div>
                
            </div>
            
        </div>
    `;
    
    console.log('[UTI] Dashboard UTI renderizado com sucesso');
};

// =================== CSS DO DASHBOARD UTI ===================
function getUTIDashboardCSS() {
    return `
        <style id="utiDashboardCSS">
            * {
                text-transform: none !important;
            }
            
            .dashboard-uti-wrapper {
                max-width: 1600px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                min-height: 100vh;
            }
            
            .dashboard-header-uti {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .dashboard-title-uti {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                text-align: center;
            }
            
            .header-controls-uti {
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: center;
            }
            
            .hospital-select-uti {
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 600;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                min-width: 200px;
            }
            
            .hospital-select-uti:focus {
                outline: none;
                border-color: ${CORES_UTI.azulPrincipal};
            }
            
            .btn-whatsapp-uti {
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 600;
                background: ${CORES_UTI.azulPrincipal};
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-whatsapp-uti:hover {
                background: #93c5fd;
                transform: translateY(-2px);
            }
            
            /* Grid de KPIs - 3 colunas */
            .kpis-grid-uti {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }
            
            /* Box KPI */
            .kpi-box-uti {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .kpi-title-uti {
                font-size: 16px;
                font-weight: 600;
                color: ${CORES_UTI.azulPrincipal};
                text-align: center;
                margin-bottom: 20px;
            }
            
            .kpi-content-uti {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
            }
            
            .kpi-subtitle-uti {
                font-size: 12px;
                color: ${CORES_UTI.cinzaMedio};
                text-align: center;
                margin-top: 10px;
            }
            
            /* Dual Gauges */
            .dual-gauges-container-uti {
                display: flex;
                justify-content: center;
                gap: 50px;
                width: 100%;
            }
            
            .gauge-with-label-uti {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .gauge-label-uti {
                font-size: 11px;
                font-weight: 600;
                color: ${CORES_UTI.azulPrincipal};
                margin-bottom: 5px;
            }
            
            /* Gauge styles */
            .v5-gauge-container-uti {
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 96px;
            }
            
            .v5-gauge-uti {
                width: 96px;
                height: 60px;
            }
            
            .v5-number-inside-uti {
                position: absolute;
                bottom: 6px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 26px;
                font-weight: 800;
                color: #ffffff;
            }
            
            .v5-badge-below-uti {
                background: ${CORES_UTI.azulPrincipal};
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                margin-top: 8px;
            }
            
            /* Tabela Modalidade */
            .modalidade-table-uti {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-top: 10px;
            }
            
            .modalidade-table-uti thead th {
                color: ${CORES_UTI.azulPrincipal};
                font-weight: 600;
                padding: 8px 4px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 11px;
            }
            
            .modalidade-table-uti thead th:first-child {
                text-align: left;
            }
            
            .modalidade-table-uti thead th:not(:first-child) {
                text-align: center;
            }
            
            .modalidade-table-uti tbody td {
                padding: 8px 4px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .modalidade-table-uti .modalidade-label {
                color: ${CORES_UTI.cinzaClaro};
                text-align: left;
            }
            
            .modalidade-table-uti .modalidade-valor {
                color: #ffffff;
                font-weight: 600;
                text-align: center;
            }
            
            .modalidade-table-uti.single-column .modalidade-valor {
                text-align: right;
            }
            
            /* TPH Display */
            .tph-display-uti {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .tph-numero-uti {
                font-size: 48px;
                font-weight: 800;
                color: #ffffff;
            }
            
            .tph-label-uti {
                font-size: 14px;
                color: ${CORES_UTI.cinzaMedio};
            }
            
            .mini-gauge-tph-uti {
                margin-top: 10px;
            }
            
            /* Previsao de Alta - Lista */
            .previsao-detalhes-uti {
                width: 100%;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .previsao-table-uti {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            
            .previsao-table-uti thead th {
                color: ${CORES_UTI.azulPrincipal};
                font-weight: 600;
                padding: 6px 4px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 10px;
            }
            
            .previsao-table-uti tbody td {
                padding: 6px 4px;
                color: ${CORES_UTI.cinzaClaro};
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            /* TPH Detalhes - Lista > 5 dias */
            .tph-detalhes-uti {
                width: 100%;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .detalhe-titulo-uti {
                font-size: 12px;
                font-weight: 600;
                color: ${CORES_UTI.azulPrincipal};
                text-align: center;
                margin-bottom: 10px;
            }
            
            .tph-table-uti {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            
            .tph-table-uti thead th {
                color: ${CORES_UTI.azulPrincipal};
                font-weight: 600;
                padding: 6px 4px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 10px;
            }
            
            .tph-table-uti tbody td {
                padding: 6px 4px;
                color: ${CORES_UTI.cinzaClaro};
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .sem-dados-uti {
                text-align: center;
                color: ${CORES_UTI.cinzaMedio};
                font-size: 11px;
                font-style: italic;
                padding: 10px;
            }
            
            /* Boxes Bloqueados */
            .box-bloqueado-uti {
                background: ${CORES_UTI.bloqueadoFundo};
                border-color: ${CORES_UTI.cinzaBloqueado};
            }
            
            .titulo-bloqueado {
                color: ${CORES_UTI.cinzaBloqueado} !important;
            }
            
            .content-bloqueado {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 200px;
                gap: 15px;
            }
            
            .bloqueado-icon {
                opacity: 0.5;
            }
            
            .bloqueado-texto {
                color: ${CORES_UTI.cinzaBloqueado};
                font-size: 14px;
                font-style: italic;
            }
            
            /* V7.5: SPICT-BR Display */
            .spict-display-uti {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .spict-numero-uti {
                font-size: 48px;
                font-weight: 800;
                color: #ffffff;
            }
            
            .spict-label-uti {
                font-size: 14px;
                color: ${CORES_UTI.cinzaMedio};
            }
            
            .spict-detalhes-uti {
                width: 100%;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .spict-table-uti {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            
            .spict-table-uti thead th {
                color: ${CORES_UTI.azulPrincipal};
                font-weight: 600;
                padding: 6px 4px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 10px;
            }
            
            .spict-table-uti tbody td {
                padding: 6px 4px;
                color: ${CORES_UTI.cinzaClaro};
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            /* Responsivo */
            @media (max-width: 1200px) {
                .kpis-grid-uti {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 768px) {
                .kpis-grid-uti {
                    grid-template-columns: 1fr;
                }
                
                .dual-gauges-container-uti {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .dashboard-title-uti {
                    font-size: 20px;
                }
            }
        </style>
    `;
}

console.log('Dashboard UTI V7.5 - Carregado com sucesso');
console.log('V7.5: SPICT-BR reativado, relatorio WhatsApp simplificado');
console.log('V7.5 Hospitais com UTI: ' + HOSPITAIS_COM_UTI.join(', '));
console.log('V7.5 H2 Cruz Azul: 20 contratuais + 10 extras = 30 total');