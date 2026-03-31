// =================== ENFERMEIRO-VIEW.JS V8.0 ===================
// Sistema Archipelago Dashboard
// Versao: V8.0 - Marco/2026
// Descricao: View dedicada para perfil enfermeiro
//   - Exibe reservas e leitos disponiveis do hospital vinculado
//   - Permite fazer e cancelar reservas
//   - Sem PPS, SPICT, concessoes, linhas de cuidado
//   - Campo Idade desabilitado na reserva (conforme decisao do cliente)
// Depende de: cards-config.js, app.js, api.js, cards.js (cancelarReserva)
// ================================================================

console.log('ENFERMEIRO-VIEW.JS V8.0 carregado');

// =================== RENDER PRINCIPAL ===================
window.renderViewEnfermeiro = function(hospitalId) {
    if (!hospitalId) {
        logError('[ENFERMEIRO] hospitalId nao definido');
        return;
    }

    const container = document.getElementById('enfermeiroContent');
    if (!container) {
        logError('[ENFERMEIRO] Container #enfermeiroContent nao encontrado');
        return;
    }

    const nomeHospital = (window.CONFIG && window.CONFIG.HOSPITAIS && window.CONFIG.HOSPITAIS[hospitalId])
        ? window.CONFIG.HOSPITAIS[hospitalId].nome
        : hospitalId;

    // Leitos do hospital (excluindo UTI)
    const leitosHospital = obterLeitosEnfermaria(hospitalId);

    // Reservas do hospital (excluindo UTI, excluindo bloqueios de irmao sem matricula)
    const reservasHospital = obterReservasEnfermaria(hospitalId);

    // KPIs
    const kpis = calcularKPIs(hospitalId, leitosHospital, reservasHospital);

    container.innerHTML = `
        <div style="padding: 16px; font-family: 'Poppins', sans-serif; max-width: 1400px; margin: 0 auto; box-sizing: border-box; width: 100%;">

            <!-- TITULO -->
            <div style="margin-bottom: 24px;">
                <h2 style="color: #131b2e; font-size: 22px; font-weight: 700; margin: 0 0 4px 0;">
                    Reservas de Leitos
                </h2>
                <p style="color: #0676bb; font-size: 18px; font-weight: 700; margin: 0;">
                    ${nomeHospital}
                </p>
            </div>

            <!-- KPI BOXES -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; width: 100%; box-sizing: border-box;">
                ${renderKPIBox('Ocupação', kpis.ocupados, kpis.total, '#f59a1d')}
                ${renderKPIBox('Reservados', kpis.reservados, kpis.total, '#f59a1d')}
                ${renderKPIBox('Disponíveis', kpis.disponiveis, kpis.total, '#60a5fa')}
            </div>

            <!-- MAPA DE LEITOS -->
            <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                <h3 style="color: #131b2e; font-size: 16px; font-weight: 700; margin: 0;">
                    Mapa de Leitos — Enfermarias
                </h3>
            </div>

            <div id="enfermeiroCards" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 16px;
            ">
                ${renderCardsEnfermeiro(hospitalId, leitosHospital, reservasHospital)}
            </div>
        </div>

        <!-- MODAL DE RESERVA -->
        <div id="modalReservaEnfermeiro" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
            <div style="background: #1e293b; border-radius: 12px; padding: 28px; width: 95%; max-width: 480px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #60a5fa; font-size: 18px; font-weight: 700; margin: 0;">Nova Reserva</h3>
                    <button onclick="fecharModalReservaEnfermeiro()" style="background: none; border: none; color: rgba(255,255,255,0.5); font-size: 24px; cursor: pointer; line-height: 1;">×</button>
                </div>
                <div id="modalReservaEnfermeiroBody"></div>
            </div>
        </div>
    `;

    // Vincular eventos dos botoes
    vincularEventosEnfermeiro(hospitalId);
};

// =================== KPI BOX ===================
function renderKPIBox(titulo, valor, total, cor) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
    return `
        <div style="background: #1e293b; border-radius: 12px; padding: 16px 12px; border: 1px solid rgba(255,255,255,0.08); text-align: center; box-sizing: border-box;">
            <div style="color: rgba(255,255,255,0.5); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                ${titulo}
            </div>
            <div style="color: ${cor}; font-size: 36px; font-weight: 800; line-height: 1; margin-bottom: 6px;">
                ${valor}
            </div>
            <div style="
                display: inline-block;
                background: ${cor}22;
                color: ${cor};
                font-size: 11px;
                font-weight: 700;
                padding: 3px 10px;
                border-radius: 20px;
            ">
                ${pct}%
            </div>
        </div>
    `;
}

// =================== CARDS ===================
function renderCardsEnfermeiro(hospitalId, leitosHospital, reservasHospital) {
    let html = '';

    // Reservas com matricula (reservas reais)
    const reservasReais = reservasHospital.filter(r => r.matricula && String(r.matricula).trim());

    // Bloqueios de irmão (sem matricula — gerados automaticamente pelo backend)
    const bloqueiosIrmao = reservasHospital.filter(r => !r.matricula || !String(r.matricula).trim());

    // IDs reservados (para excluir dos vagos)
    const idsReservados = new Set(
        reservasReais.map(r => String(r.identificacaoLeito || '').toUpperCase())
    );

    // IDs bloqueados por irmão
    const idsBloqueados = new Set(
        bloqueiosIrmao.map(r => String(r.identificacaoLeito || '').toUpperCase())
    );

    // 1. Reservados (com matricula)
    reservasReais.forEach(reserva => {
        html += renderCardReservado(hospitalId, reserva);
    });

    // 2. Bloqueados por irmão
    bloqueiosIrmao.forEach(bloqueio => {
        // Buscar a reserva principal que causou o bloqueio
        const reservaPrincipal = reservasReais.find(r =>
            String(r.identificacaoLeito || '').toUpperCase() === String(bloqueio.identificacaoIrmao || '').toUpperCase()
        );
        const motivoGenero = bloqueio.genero || (reservaPrincipal ? reservaPrincipal.genero : '');
        html += renderCardBloqueado(bloqueio.identificacaoLeito, bloqueio.tipo, motivoGenero, bloqueio.identificacaoIrmao);
    });

    // 3. Vagos — filtro inteligente idêntico ao Mapa de Leitos
    const vagosParaMostrar = filtrarVagosInteligente(hospitalId, leitosHospital, idsReservados, idsBloqueados);

    vagosParaMostrar.forEach(leito => {
        html += renderCardVagoEnfermeiro(hospitalId, leito);
    });

    if (!html) {
        html = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.4); font-size: 14px;">
                Nenhum leito disponivel para reserva neste momento.
            </div>
        `;
    }

    return html;
}

function renderCardReservado(hospitalId, reserva) {
    const identificacao = reserva.identificacaoLeito || '---';
    const tipo = reserva.tipo || '';
    const genero = reserva.genero || '';
    const iniciais = reserva.iniciais || '';
    const matricula = reserva.matricula || '';
    const isolamento = reserva.isolamento || '';

    // Indicador de isolamento — normaliza acentos antes de comparar
    const isolNorm = String(isolamento)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    const temIsolamento = isolNorm && !isolNorm.includes('nao isol') && isolNorm !== 'nao isolamento';

    return `
        <div style="
            background: #1e293b;
            border-radius: 12px;
            padding: 16px;
            border: 2px solid #f59a1d;
            font-family: 'Poppins', sans-serif;
            display: flex;
            flex-direction: column;
            min-height: 220px;
            box-sizing: border-box;
        ">
            <!-- BADGE STATUS -->
            <div style="margin-bottom: 8px;">
                <span style="background: #f59a1d; color: #131b2e; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    RESERVADO
                </span>
            </div>

            <!-- LINHA DE GENERO/ISOLAMENTO — espaço fixo igual ao DISPONÍVEL -->
            <div style="color: #60a5fa; font-size: 11px; font-weight: 600; margin-bottom: 4px; min-height: 16px;">
                ${temIsolamento ? isolamento : (genero ? genero : '')}
            </div>

            <!-- IDENTIFICACAO -->
            <div style="color: #ffffff; font-size: 26px; font-weight: 800; margin-bottom: 2px; line-height: 1;">
                ${identificacao}
            </div>

            <!-- TIPO -->
            <div style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 12px;">
                ${tipo}
            </div>

            <!-- DADOS DO PACIENTE -->
            <div style="background: rgba(245,154,29,0.08); border-radius: 8px; padding: 8px 10px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600; text-transform: uppercase;">Iniciais</span>
                    <span style="color: #ffffff; font-size: 11px; font-weight: 700;">${iniciais || '---'}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600; text-transform: uppercase;">Matrícula</span>
                    <span style="color: #ffffff; font-size: 11px; font-weight: 700;">${matricula || '---'}</span>
                </div>
            </div>

            <!-- BOTAO CANCELAR — sempre na base -->
            <div style="margin-top: auto;">
                <button
                    class="btn-cancelar-reserva-enf"
                    data-hospital="${hospitalId}"
                    data-identificacao="${identificacao}"
                    data-matricula="${matricula}"
                    style="width: 100%; padding: 10px; background: #c86420; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 11px; font-family: 'Poppins', sans-serif; letter-spacing: 0.5px;">
                    CANCELAR RESERVA
                </button>
            </div>
        </div>
    `;
}

// =================== FILTRO INTELIGENTE DE VAGOS ===================
// Replica exatamente a lógica do Mapa de Leitos (cards.js V6.1)
function filtrarVagosInteligente(hospitalId, leitos, idsReservados, idsBloqueados) {
    const isHibrido      = window.HOSPITAIS_HIBRIDOS && window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    const isTiposFixos   = window.HOSPITAIS_TIPOS_FIXOS && window.HOSPITAIS_TIPOS_FIXOS.includes(hospitalId);

    // Leitos vagos não reservados e não bloqueados
    const leitosVagos = leitos
        .filter(l => {
            const status = String(l.status || '').toLowerCase();
            if (status === 'ocupado' || status === 'em uso') return false;
            const idLeito = String(l.identificacaoLeito || '').toUpperCase();
            if (idLeito && idsReservados.has(idLeito)) return false;
            if (idLeito && idsBloqueados.has(idLeito)) return false;
            return true;
        })
        .sort((a, b) => (a.leito || 0) - (b.leito || 0));

    if (isHibrido) {
        // Híbridos: apenas 1 vago (menor número)
        return leitosVagos.length > 0 ? [leitosVagos[0]] : [];
    }

    if (isTiposFixos) {
        // Tipos fixos (H2, H4): separar apartamentos e enfermarias
        const vagosApto = leitosVagos.filter(l => {
            const t = (l.tipo || '').toUpperCase();
            return t.includes('APTO') || t === 'APARTAMENTO';
        });

        const vagosEnf = leitosVagos.filter(l => {
            const t = (l.tipo || '').toUpperCase();
            return t.includes('ENF') || t === 'ENFERMARIA';
        });

        // Apartamentos: apenas 1 vago
        const aptoParaMostrar = vagosApto.length > 0 ? [vagosApto[0]] : [];

        // Enfermarias: lógica de irmãos
        const enfParaMostrar = [];
        let parLivreJaAdicionado = false;

        vagosEnf.forEach(leitoVago => {
            const numeroLeito = parseInt(leitoVago.leito);
            const leitoIrmao  = window.getLeitoIrmao ? window.getLeitoIrmao(hospitalId, numeroLeito) : null;

            if (!leitoIrmao) {
                // Sem irmão — mostrar normalmente
                enfParaMostrar.push(leitoVago);
            } else {
                // Buscar dados do irmão nos leitos do hospital
                const dadosIrmao = leitos.find(l => parseInt(l.leito) === leitoIrmao);

                const irmaoVago = !dadosIrmao ||
                    String(dadosIrmao.status || '').toLowerCase() === 'vago' ||
                    dadosIrmao.status === '';

                if (irmaoVago) {
                    // Ambos vagos: mostrar apenas 1 par livre
                    if (!parLivreJaAdicionado) {
                        enfParaMostrar.push(leitoVago);
                        parLivreJaAdicionado = true;
                    }
                } else {
                    // Irmão ocupado: verificar isolamento
                    const isolIrmao = String(dadosIrmao.isolamento || '')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase();

                    const temIsolIrmao = isolIrmao &&
                        !isolIrmao.includes('nao isol') &&
                        isolIrmao !== 'nao isolamento';

                    if (temIsolIrmao) {
                        // Bloqueado por isolamento — não mostrar
                    } else {
                        // Irmão ocupado sem isolamento: vago com restrição de gênero
                        // Calcular _idLeito a partir do identificacaoLeito do irmão OCUPADO
                        const idIrmaoOcupado = String(dadosIrmao.identificacaoLeito || '').trim();
                        let idVago = null;

                        if (idIrmaoOcupado && idIrmaoOcupado.includes('-')) {
                            const partes = idIrmaoOcupado.split('-');
                            const base = partes[0];
                            const sufixoOcupado = partes[1];
                            let sufixoVago = '';

                            if (hospitalId === 'H2') {
                                sufixoVago = sufixoOcupado === '1' ? '3' : '1';
                            } else if (hospitalId === 'H4') {
                                sufixoVago = sufixoOcupado === 'A' ? 'C' : 'A';
                            }

                            if (sufixoVago) {
                                idVago = base + '-' + sufixoVago;
                            }
                        }

                        enfParaMostrar.push({
                            ...leitoVago,
                            _generoRestrito: dadosIrmao.genero || null,
                            _idLeito: idVago
                        });
                    }
                }
            }
        });

        return [...aptoParaMostrar, ...enfParaMostrar];
    }

    // Fallback: 1 vago
    return leitosVagos.length > 0 ? [leitosVagos[0]] : [];
}

function renderCardBloqueado(identificacao, tipo, genero, identificacaoPrincipal) {
    const motivo = genero
        ? `Leito bloqueado — reserva do quarto vinculado (${identificacaoPrincipal || ''}) restringe gênero ${genero}`
        : `Leito bloqueado — quarto vinculado (${identificacaoPrincipal || ''}) está reservado`;

    return `
        <div style="
            background: #1e293b;
            border-radius: 12px;
            padding: 16px;
            border: 2px solid #c86420;
            font-family: 'Poppins', sans-serif;
            opacity: 0.75;
        ">
            <!-- BADGE STATUS -->
            <div style="margin-bottom: 12px;">
                <span style="background: #c86420; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    BLOQUEADO
                </span>
            </div>

            <!-- IDENTIFICACAO -->
            <div style="color: rgba(255,255,255,0.5); font-size: 26px; font-weight: 800; margin-bottom: 4px; line-height: 1;">
                ${identificacao || '---'}
            </div>

            <!-- TIPO -->
            <div style="color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 10px;">
                ${tipo || ''}
            </div>

            <!-- MOTIVO -->
            <div style="
                background: rgba(200,100,32,0.1);
                border-radius: 6px;
                padding: 8px 10px;
                color: rgba(255,255,255,0.5);
                font-size: 10px;
                line-height: 1.5;
            ">
                ${motivo}
            </div>
        </div>
    `;
}

function renderCardVagoEnfermeiro(hospitalId, leito) {
    const numeroLeito   = leito.leito || '';
    const tipo          = leito.tipo || '';
    const generoRestrito = leito._generoRestrito || null;

    const badgeGenero = generoRestrito ? `
        <div style="
            color: #60a5fa;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 4px;
            min-height: 16px;
        ">
            Somente ${generoRestrito}
        </div>
    ` : '<div style="min-height: 16px; margin-bottom: 4px;"></div>';

    return `
        <div style="
            background: #1e293b;
            border-radius: 12px;
            padding: 16px;
            border: 1px solid rgba(255,255,255,0.06);
            font-family: 'Poppins', sans-serif;
            display: flex;
            flex-direction: column;
            min-height: 220px;
            box-sizing: border-box;
        ">
            <!-- BADGE STATUS -->
            <div style="margin-bottom: 8px;">
                <span style="background: rgba(96,165,250,0.15); color: #60a5fa; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    DISPONÍVEL
                </span>
            </div>

            <!-- LINHA DE GENERO — espaço fixo igual ao RESERVADO -->
            ${badgeGenero}

            <!-- NUMERO DO LEITO (quando identificado automaticamente) -->
            ${leito._idLeito ? `
            <div style="color: #ffffff; font-size: 26px; font-weight: 800; margin-bottom: 2px; line-height: 1;">
                ${leito._idLeito}
            </div>
            ` : '<div style="min-height: 32px;"></div>'}

            <!-- TIPO -->
            <div style="color: rgba(255,255,255,0.3); font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 12px;">
                ${tipo || 'Enfermaria'}
            </div>

            <!-- LABEL LEITO LIVRE — empurra botão para baixo -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div style="color: rgba(255,255,255,0.2); font-size: 13px; font-weight: 600;">
                    Leito Livre
                </div>
            </div>

            <!-- BOTAO RESERVAR — sempre na base -->
            <div style="margin-top: auto;">
                <button
                    class="btn-reservar-enf"
                    data-hospital="${hospitalId}"
                    data-leito="${numeroLeito}"
                    data-tipo="${tipo}"
                    data-genero-restrito="${generoRestrito || ''}"
                    data-id-leito="${leito._idLeito || ''}"
                    style="width: 100%; padding: 10px; background: #60a5fa; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 11px; font-family: 'Poppins', sans-serif; letter-spacing: 0.5px;">
                    RESERVAR LEITO
                </button>
            </div>
        </div>
    `;
}

// =================== EVENTOS ===================
function vincularEventosEnfermeiro(hospitalId) {
    // Cancelar reserva
    document.querySelectorAll('.btn-cancelar-reserva-enf').forEach(btn => {
        btn.addEventListener('click', async function() {
            const identificacao = this.dataset.identificacao;
            const matricula = this.dataset.matricula;
            const hospital = this.dataset.hospital;

            if (!confirm('Deseja cancelar esta reserva?')) return;

            this.disabled = true;
            this.textContent = 'Cancelando...';

            try {
                await window.cancelarReserva(hospital, identificacao, matricula);
                await recarregarEAtualizar(hospitalId);
            } catch (error) {
                alert('Erro ao cancelar reserva: ' + error.message);
                this.disabled = false;
                this.textContent = 'CANCELAR RESERVA';
            }
        });
    });

    // Abrir modal de reserva
    document.querySelectorAll('.btn-reservar-enf').forEach(btn => {
        btn.addEventListener('click', function() {
            const leito          = this.dataset.leito;
            const tipo           = this.dataset.tipo;
            const generoRestrito = this.dataset.generoRestrito || null;
            const idLeito        = this.dataset.idLeito || null;
            abrirModalReservaEnfermeiro(hospitalId, leito, tipo, generoRestrito, idLeito);
        });
    });
}

// =================== MODAL DE RESERVA ===================
window.abrirModalReservaEnfermeiro = abrirModalReservaEnfermeiro;

function abrirModalReservaEnfermeiro(hospitalId, numeroLeito, tipoLeito, generoRestrito, idLeito) {
    const modal = document.getElementById('modalReservaEnfermeiro');
    const body  = document.getElementById('modalReservaEnfermeiroBody');
    if (!modal || !body) return;

    const nomeHospital = (window.CONFIG && window.CONFIG.HOSPITAIS && window.CONFIG.HOSPITAIS[hospitalId])
        ? window.CONFIG.HOSPITAIS[hospitalId].nome
        : hospitalId;

    // Determinar se hibrido (precisa selecionar tipo) ou tipo fixo
    const tipoHospital = (window.CONFIG && window.CONFIG.HOSPITAIS && window.CONFIG.HOSPITAIS[hospitalId])
        ? window.CONFIG.HOSPITAIS[hospitalId].tipo
        : 'Híbrido';

    const ehTipoFixo = (tipoHospital === 'Misto');
    const tipoLabel  = ehTipoFixo ? tipoLeito : '';

    // Sufixos por hospital para enfermaria
    const sufixos = (window.SUFIXOS_ENFERMARIA && window.SUFIXOS_ENFERMARIA[hospitalId])
        ? window.SUFIXOS_ENFERMARIA[hospitalId]
        : ['1', '2'];

    const maxlength = (window.MAXLENGTH_IDENTIFICACAO && window.MAXLENGTH_IDENTIFICACAO[hospitalId])
        ? window.MAXLENGTH_IDENTIFICACAO[hospitalId]
        : 3;

    body.innerHTML = `
        <div style="font-family: 'Poppins', sans-serif;">

            <div style="margin-bottom: 4px; font-size: 11px; color: rgba(255,255,255,0.4);">
                Hospital: <strong style="color: rgba(255,255,255,0.7);">${nomeHospital}</strong>
            </div>

            <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 12px 0;"></div>

            <!-- TIPO DE QUARTO (apenas hibridos) -->
            ${!ehTipoFixo ? `
            <div style="margin-bottom: 14px;">
                <label style="display: block; color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Tipo de Quarto *
                </label>
                <select id="enf_tipoQuarto" onchange="atualizarIdentificacaoEnfermeiro('${hospitalId}')" style="${estiloInput()}">
                    <option value="">Selecione...</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Enfermaria">Enfermaria</option>
                </select>
            </div>
            ` : `<input type="hidden" id="enf_tipoQuarto" value="${tipoLabel}">`}

            <!-- IDENTIFICACAO DO LEITO -->
            <div style="margin-bottom: 14px;">
                <label style="display: block; color: ${idLeito ? '#60a5fa' : 'rgba(255,255,255,0.6)'}; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Identificação do Leito *${idLeito ? ' — definida automaticamente' : ''}
                </label>
                <div id="enf_identificacaoContainer">
                    ${idLeito
                        ? `<input type="text" id="enf_idFixo" value="${idLeito}" disabled style="${estiloInput(true)}">`
                        : (ehTipoFixo
                            ? renderIdentificacaoFixo(tipoLeito, hospitalId, sufixos, maxlength)
                            : `<input type="text" id="enf_idLeitoDisabled" disabled placeholder="Selecione o Tipo de Quarto primeiro" style="${estiloInput(true)}">`)
                    }
                </div>
            </div>

            <!-- ISOLAMENTO -->
            <div style="margin-bottom: 14px;">
                <label style="display: block; color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Isolamento *
                </label>
                <select id="enf_isolamento" style="${estiloInput()}">
                    <option value="">Selecione...</option>
                    <option value="Não Isolamento">Não Isolamento</option>
                    <option value="Isolamento de Contato">Isolamento de Contato</option>
                    <option value="Isolamento Respiratório">Isolamento Respiratório</option>
                </select>
            </div>

            <!-- GENERO -->
            <div style="margin-bottom: 14px;">
                <label style="display: block; color: ${generoRestrito ? '#60a5fa' : 'rgba(255,255,255,0.6)'}; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Gênero *${generoRestrito ? ' — restrito: ' + generoRestrito : ''}
                </label>
                <select id="enf_genero" ${generoRestrito ? 'disabled' : ''} style="${estiloInput(!!generoRestrito)}">
                    <option value="">Selecione...</option>
                    <option value="Feminino" ${generoRestrito === 'Feminino' ? 'selected' : ''}>Feminino</option>
                    <option value="Masculino" ${generoRestrito === 'Masculino' ? 'selected' : ''}>Masculino</option>
                </select>
                ${generoRestrito ? `<input type="hidden" id="enf_genero_hidden" value="${generoRestrito}">` : ''}
            </div>

            <!-- INICIAIS -->
            <div style="margin-bottom: 14px;">
                <label style="display: block; color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Iniciais
                </label>
                <input type="text" id="enf_iniciais" maxlength="20" placeholder="Ex: J S S" style="${estiloInput()}"
                    oninput="if(window.formatarIniciaisAutomatico) window.formatarIniciaisAutomatico(this)">
            </div>

            <!-- MATRICULA -->
            <div style="margin-bottom: 14px;">
                <label style="display: block; color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Matrícula *
                </label>
                <input type="text" id="enf_matricula" maxlength="20" placeholder="Ex: 0000000123-4" style="${estiloInput()}">
            </div>

            <!-- IDADE (desabilitado conforme definicao do cliente) -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: rgba(255,255,255,0.3); font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
                    Idade
                </label>
                <input type="number" id="enf_idade" disabled placeholder="Não informada na reserva" style="${estiloInput(true)}">
            </div>

            <!-- ERRO -->
            <div id="enf_erro" style="display: none; background: rgba(239,68,68,0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 10px; margin-bottom: 14px; color: #ef4444; font-size: 12px; font-weight: 600;"></div>

            <!-- BOTOES -->
            <div style="display: flex; gap: 10px;">
                <button onclick="fecharModalReservaEnfermeiro()" style="flex: 1; padding: 12px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: 'Poppins', sans-serif; font-size: 13px;">
                    Cancelar
                </button>
                <button onclick="salvarReservaEnfermeiro('${hospitalId}')" style="flex: 2; padding: 12px; background: #0676bb; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-family: 'Poppins', sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                    RESERVAR
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

// Renderiza campo de identificacao para hospitais de tipo fixo (H2, H4)
function renderIdentificacaoFixo(tipoLeito, hospitalId, sufixos, maxlength) {
    const ehEnfermaria = tipoLeito === 'Enfermaria' || tipoLeito === 'ENFERMARIA';

    if (ehEnfermaria) {
        return `
            <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="enf_idNumero" maxlength="${maxlength}" placeholder="Número"
                    style="${estiloInput()} flex: 1;"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                <select id="enf_idSufixo" style="${estiloInput()} width: 90px;">
                    ${sufixos.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
        `;
    } else {
        return `
            <input type="text" id="enf_idNumero" maxlength="${maxlength}" placeholder="Número do quarto"
                style="${estiloInput()}"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')">
        `;
    }
}

// Atualiza campo de identificacao ao mudar tipo de quarto (hospitais hibridos)
window.atualizarIdentificacaoEnfermeiro = function(hospitalId) {
    const select = document.getElementById('enf_tipoQuarto');
    const container = document.getElementById('enf_identificacaoContainer');
    if (!select || !container) return;

    const tipo = select.value;
    const sufixos = (window.SUFIXOS_ENFERMARIA && window.SUFIXOS_ENFERMARIA[hospitalId])
        ? window.SUFIXOS_ENFERMARIA[hospitalId]
        : ['1', '2'];
    const maxlength = (window.MAXLENGTH_IDENTIFICACAO && window.MAXLENGTH_IDENTIFICACAO[hospitalId])
        ? window.MAXLENGTH_IDENTIFICACAO[hospitalId]
        : 3;

    if (!tipo) {
        container.innerHTML = `<input type="text" disabled placeholder="Selecione o Tipo de Quarto primeiro" style="${estiloInput(true)}">`;
        return;
    }

    container.innerHTML = renderIdentificacaoFixo(tipo, hospitalId, sufixos, maxlength);
};

// Fechar modal
window.fecharModalReservaEnfermeiro = function() {
    const modal = document.getElementById('modalReservaEnfermeiro');
    if (modal) modal.style.display = 'none';
};

// =================== SALVAR RESERVA ===================
window.salvarReservaEnfermeiro = async function(hospitalId) {
    const erroEl = document.getElementById('enf_erro');
    erroEl.style.display = 'none';

    // Coletar tipo
    const tipoEl = document.getElementById('enf_tipoQuarto');
    const tipo = tipoEl ? tipoEl.value : '';

    // Coletar identificacao
    const numEl    = document.getElementById('enf_idNumero');
    const sufEl    = document.getElementById('enf_idSufixo');
    const idDisEl  = document.getElementById('enf_idLeitoDisabled');
    const idFixoEl = document.getElementById('enf_idFixo');
    let identificacaoLeito = '';

    if (idFixoEl) {
        identificacaoLeito = idFixoEl.value.trim();
    } else if (numEl) {
        const num = numEl.value.trim();
        const suf = sufEl ? sufEl.value : '';
        identificacaoLeito = suf ? (num + '-' + suf) : num;
    } else if (idDisEl) {
        identificacaoLeito = idDisEl.value.trim();
    }

    const isolamento = document.getElementById('enf_isolamento')?.value || '';
    const generoSelect = document.getElementById('enf_genero');
    const generoHidden = document.getElementById('enf_genero_hidden');
    const genero = (generoSelect && !generoSelect.disabled)
        ? generoSelect.value
        : (generoHidden ? generoHidden.value : '');
    const iniciais   = document.getElementById('enf_iniciais')?.value || '';
    const matricula  = document.getElementById('enf_matricula')?.value || '';

    // Validacoes
    if (!tipo) {
        mostrarErroReserva('Selecione o Tipo de Quarto.'); return;
    }
    if (!identificacaoLeito) {
        mostrarErroReserva('Informe a Identificação do Leito.'); return;
    }
    if (!isolamento) {
        mostrarErroReserva('Selecione o Isolamento.'); return;
    }
    if (!genero) {
        mostrarErroReserva('Selecione o Gênero.'); return;
    }
    if (!matricula.trim()) {
        mostrarErroReserva('Informe a Matrícula.'); return;
    }

    // Botao de submit
    const btnSalvar = document.querySelector('#modalReservaEnfermeiroBody button[onclick*="salvarReserva"]');
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Reservando...'; }

    try {
        const params = new URLSearchParams({
            action: 'reservar',
            hospital: hospitalId,
            tipo: tipo,
            identificacaoLeito: identificacaoLeito,
            isolamento: isolamento,
            genero: genero,
            iniciais: iniciais,
            matricula: matricula,
            idade: '',
            usuario: 'enfermeiro-' + hospitalId
        });

        const response = await fetch(window.API_URL + '?' + params.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();

        if (result.ok || result.success) {
            window.fecharModalReservaEnfermeiro();
            await recarregarEAtualizar(hospitalId);
        } else {
            mostrarErroReserva(result.error || result.message || 'Erro ao criar reserva.');
            if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = 'RESERVAR'; }
        }
    } catch (error) {
        mostrarErroReserva('Erro de conexão: ' + error.message);
        if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = 'RESERVAR'; }
    }
};

// =================== REFRESH PROPRIO DA VIEW ENFERMEIRO ===================
// Evita depender do refreshAfterAction do main.js que não conhecia esta view
async function recarregarEAtualizar(hospitalId) {
    try {
        if (window.showLoading) window.showLoading(null, 'Atualizando...');

        if (window.loadHospitalData) {
            await window.loadHospitalData();
        }
        if (window.carregarReservas) {
            await window.carregarReservas();
        }

        if (window.hideLoading) window.hideLoading();

        window.renderViewEnfermeiro(hospitalId);
    } catch (error) {
        if (window.hideLoading) window.hideLoading();
        logError('[ENFERMEIRO] Erro ao recarregar:', error);
        window.renderViewEnfermeiro(hospitalId);
    }
}

function mostrarErroReserva(msg) {
    const erroEl = document.getElementById('enf_erro');
    if (!erroEl) return;
    erroEl.textContent = msg;
    erroEl.style.display = 'block';
}

// =================== HELPERS DE DADOS ===================
function obterLeitosEnfermaria(hospitalId) {
    if (!window.hospitalData || !window.hospitalData[hospitalId]) return [];
    return (window.hospitalData[hospitalId].leitos || []).filter(l => {
        const tipo = String(l.tipo || '').toUpperCase();
        return tipo !== 'UTI';
    });
}

function obterReservasEnfermaria(hospitalId) {
    if (!window.reservasData) return [];
    return window.reservasData.filter(r => r.hospital === hospitalId && r.tipo !== 'UTI');
}

function calcularKPIs(hospitalId, leitos, reservas) {
    const capacidade  = window.HOSPITAL_CAPACIDADE && window.HOSPITAL_CAPACIDADE[hospitalId];
    const contratuais = capacidade ? capacidade.contratuais : leitos.length;
    const ocupados    = leitos.filter(l => String(l.status || '').toLowerCase() === 'ocupado').length;
    const reservados  = reservas.filter(r => r.matricula && String(r.matricula).trim()).length;
    const disponiveis = Math.max(0, contratuais - ocupados - reservados);

    return { total: contratuais, ocupados, reservados, disponiveis };
}

// =================== ESTILO PADRAO DOS INPUTS ===================
function estiloInput(disabled) {
    return `
        width: 100%;
        padding: 10px 12px;
        background: ${disabled ? 'rgba(255,255,255,0.03)' : '#0f172a'};
        border: 1px solid ${disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)'};
        border-radius: 6px;
        color: ${disabled ? 'rgba(255,255,255,0.25)' : '#ffffff'};
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        box-sizing: border-box;
        cursor: ${disabled ? 'not-allowed' : 'auto'};
    `;
}

console.log('ENFERMEIRO-VIEW.JS V8.0 pronto.');
