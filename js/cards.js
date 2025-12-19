// =================== CARDS.JS - GESTÃO DE LEITOS HOSPITALARES ===================
// Versão: 7.7 - 19/Dezembro/2025
// Depende de: cards-config.js (carregar ANTES)
// 
// V7.7 - CORREÇÃO PREVISÃO DE ALTA (SP):
// - Normalizar valor "SP" para "Sem Previsão" ao abrir modal de atualização
// - Normalizar valor "Sem Previsao" (sem acento) para "Sem Previsão"
// V7.6 - CORREÇÃO FLAG EXTRA H2/H4 + AUTO-SUFIXO IRMÃO:
// - Tratar tipo "Hibrido" em H2/H4 corretamente (usar contratuais totais)
// - Quando irmão ocupado/reservado com identificação, auto-definir sufixo alternativo
// - Dropdown de sufixo desabilitado quando herdado do irmão
// V7.4 - BLOQUEIO ADMISSÃO + AUTO-COMPLETAR MATRÍCULA:
// 1. Botão ADMITIR bloqueado nos cards (só via QR Code)
// 2. Botão ADMITIR RESERVA bloqueado (só via QR Code)
// 3. Botão "Salvar Reserva" alterado para "RESERVAR"
// 4. Auto-completar zeros à esquerda na matrícula (onblur)
// 5. Placeholder matrícula: Ex: 0000000123-4
//
// V7.0 - SISTEMA DE RESERVAS + CAMPO IDENTIFICAÇÃO DINÂMICO:
// 1. Filtro tipo !== 'UTI' (apenas Enfermarias)
// 2. Botao RESERVAR nos cards vagos
// 3. Modal de reserva igual ao de admissao (campos bloqueados)
// 4. Ordenação: Ocupados > Reservados > Vagos
// 5. Campo Identificação dinâmico para HIBRIDOS (Enfermaria: número+dígito)

console.log('CARDS.JS V7.7 - Correção Previsão de Alta (SP)...');

// =================== VALIDAR DEPENDENCIAS ===================
if (typeof window.CONCESSOES_DISPLAY_MAP === 'undefined') {
    console.error('ERRO CRÍTICO: cards-config.js NÃO foi carregado!');
    throw new Error('cards-config.js deve ser carregado ANTES de cards.js');
}

if (typeof window.desnormalizarTexto === 'undefined') {
    console.error('ERRO CRÍTICO: desnormalizarTexto() não encontrada!');
    throw new Error('cards-config.js não carregou corretamente');
}

console.log('Dependências validadas - cards-config.js OK');

// =================== V7.4: CONFIGURAÇÃO DE SUFIXOS POR HOSPITAL ===================
// Sufixos para Enfermaria por hospital (híbridos)
window.SUFIXOS_ENFERMARIA = {
    H1: ['A', 'B'],
    H2: ['1', '3'],  // Tipo fixo
    H3: ['1', '2'],
    H4: ['A', 'C'],  // Tipo fixo
    H5: ['1', '2'],
    H6: ['1', '2'],
    H7: ['1', '2'],
    H8: ['1', '2'],
    H9: ['1', '2']
};

// Sufixos para Apartamento (alguns hospitais têm sufixo fixo)
window.SUFIXOS_APARTAMENTO = {
    H3: ['1'],  // Fixo "-1"
    H7: ['1']   // Fixo "-1"
};

// V7.4: Maxlength do campo identificação por hospital
// H3 = 4 dígitos, todos os outros = 3 dígitos
window.MAXLENGTH_IDENTIFICACAO = {
    H1: 3,
    H2: 3,
    H3: 4,
    H4: 3,
    H5: 3,
    H6: 3,
    H7: 3,
    H8: 3,
    H9: 3
};

// =================== V7.4: LOADING OVERLAY ===================
// Bloqueia toda a interface durante operações assíncronas

window.showLoadingOverlay = function(mensagem = 'Processando...') {
    // Remover overlay existente se houver
    const existente = document.getElementById('loadingOverlayCards');
    if (existente) existente.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlayCards';
    overlay.innerHTML = `
        <div class="loading-overlay-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">${mensagem}</div>
        </div>
    `;
    
    // Estilos inline para garantir funcionamento
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        backdrop-filter: blur(3px);
    `;
    
    const content = overlay.querySelector('.loading-overlay-content');
    content.style.cssText = `
        text-align: center;
        color: white;
    `;
    
    const spinner = overlay.querySelector('.loading-spinner');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid #60a5fa;
        border-radius: 50%;
        margin: 0 auto 15px;
        animation: spin 1s linear infinite;
    `;
    
    const text = overlay.querySelector('.loading-text');
    text.style.cssText = `
        font-size: 16px;
        font-weight: 500;
        color: #e2e8f0;
    `;
    
    // Adicionar keyframes para animação
    if (!document.getElementById('loadingSpinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'loadingSpinnerStyle';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(overlay);
    console.log('[LOADING] Overlay ativado:', mensagem);
};

window.hideLoadingOverlay = function() {
    const overlay = document.getElementById('loadingOverlayCards');
    if (overlay) {
        overlay.remove();
        console.log('[LOADING] Overlay removido');
    }
};

// =================== V7.0: FUNÇÕES DE RESERVA ===================

// Retorna TODAS as reservas do hospital (incluindo bloqueios de irmão)
window.getTodasReservasHospital = function(hospitalId) {
    const todasReservas = window.reservasData || [];
    return todasReservas.filter(r => r.hospital === hospitalId && r.tipo !== 'UTI');
};

// Retorna apenas RESERVAS REAIS (com matricula) - para contagem no dashboard
window.getReservasHospital = function(hospitalId) {
    const todasReservas = window.reservasData || [];
    return todasReservas.filter(r => {
        if (r.hospital !== hospitalId) return false;
        if (r.tipo === 'UTI') return false;
        // V7.0: Apenas reservas COM matrícula são reservas reais
        const temMatricula = r.matricula && String(r.matricula).trim();
        return temMatricula;
    });
};

// Retorna BLOQUEIOS de irmao (sem matricula) - para mostrar cards Disp. Masc/Fem
window.getBloqueiosHospital = function(hospitalId) {
    const todasReservas = window.reservasData || [];
    return todasReservas.filter(r => {
        if (r.hospital !== hospitalId) return false;
        if (r.tipo === 'UTI') return false;
        // V7.0: Bloqueios NÃO têm matrícula
        const temMatricula = r.matricula && String(r.matricula).trim();
        return !temMatricula;
    });
};

window.isLeitoReservado = function(hospitalId, leitoNumero) {
    const reservas = window.getReservasHospital(hospitalId);
    return reservas.find(r => parseInt(r.leito) === parseInt(leitoNumero));
};

window.cancelarReserva = async function(hospital, identificacaoLeito, matricula) {
    console.log('[V7.0] Cancelando reserva:', hospital, identificacaoLeito);
    try {
        // Usar GET com parametros na URL (evita CORS)
        const idLeito = String(identificacaoLeito || '');
        const mat = String(matricula || '');
        const params = new URLSearchParams({
            action: 'cancelarReserva',
            hospital: hospital,
            identificacaoLeito: idLeito,
            matricula: mat
        });
        
        const response = await fetch(window.API_URL + '?' + params.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        if (result.ok || result.success) {
            if (window.reservasData) {
                window.reservasData = window.reservasData.filter(r => 
                    !(r.hospital === hospital && (String(r.identificacaoLeito || '') === idLeito || String(r.matricula || '') === mat))
                );
            }
            return true;
        }
        throw new Error(result.message || result.error || 'Erro ao cancelar reserva');
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        throw error;
    }
};

// =================== FUNÇÃO: FORMATAR INICIAIS AUTOMATICAMENTE ===================
window.formatarIniciaisAutomatico = function(input) {
    let texto = input.value || '';
    
    // Remove tudo que não é letra
    texto = texto.replace(/[^a-zA-Z]/g, '');
    
    // Converte para maiúsculas
    texto = texto.toUpperCase();
    
    // Limita a 6 letras (exemplo: A D R = 3 letras, mas pode ter até 6)
    if (texto.length > 6) {
        texto = texto.substring(0, 6);
    }
    
    // Adiciona espaço entre cada letra
    const resultado = texto.split('').join(' ');
    
    // Atualiza o campo
    input.value = resultado;
    
    return resultado;
};

// =================== FUNÇÃO: SELECT HOSPITAL ===================
window.selectHospital = function(hospitalId) {
    logInfo(`Selecionando hospital: ${hospitalId} (${window.HOSPITAL_MAPPING[hospitalId]})`);
    
    window.currentHospital = hospitalId;
    
    document.querySelectorAll('.hospital-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.hospital === hospitalId) {
            btn.classList.add('active');
        }
    });
    
    window.renderCards();
    logSuccess(`Hospital selecionado: ${window.HOSPITAL_MAPPING[hospitalId]}`);
};

// =================== FUNÇÃO DE BUSCA ===================
window.searchLeitos = function() {
    const searchInput = document.getElementById('searchLeitosInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('#cardsContainer .card');
    
    cards.forEach(card => {
        if (searchTerm === '') {
            card.style.display = '';
            return;
        }
        
        const cardText = card.textContent.toLowerCase();
        const matricula = card.querySelector('[data-matricula]')?.dataset.matricula || '';
        const leito = card.querySelector('[data-leito-numero]')?.dataset.leitoNumero || '';
        const iniciais = card.querySelector('[data-iniciais]')?.dataset.iniciais || '';
        
        const matchMatricula = matricula.includes(searchTerm);
        const matchLeito = leito.includes(searchTerm);
        const matchIniciais = iniciais.toLowerCase().includes(searchTerm);
        const matchGeral = cardText.includes(searchTerm);
        
        if (matchMatricula || matchLeito || matchIniciais || matchGeral) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
    logInfo(`Busca: "${searchTerm}" - ${visibleCards.length} resultados`);
};

// =================== 🆕 FUNÇÃO: RENDERIZAR FLAG DE OCUPAÇÃO V6.3 FINAL ===================
window.renderFlagOcupacao = function(hospitalId, status, posicaoOcupacao, tipoLeito) {
    // Se leito vago, não exibe flag
    if (status === 'Vago' || status === 'vago') {
        return '';
    }

    if (!posicaoOcupacao || posicaoOcupacao <= 0) return '';

    const capacidade = window.getCapacidade(hospitalId);
    
    // Determinar se é apartamento ou enfermaria
    const tipoUpper = (tipoLeito || '').toUpperCase().trim();
    const isApartamento = tipoUpper.includes('APTO') || tipoUpper === 'APARTAMENTO';
    const isEnfermaria = tipoUpper.includes('ENF') || tipoUpper === 'ENFERMARIA';

    // Calcular total de contratuais POR TIPO
    let textoTipo = '';
    let totalContratuaisPorTipo = 0;

    if (hospitalId === 'H2' || hospitalId === 'H4') {
        // ✅ TIPOS FIXOS: Usar cards-config.js
        const enfInfo = (hospitalId === 'H2') ? window.CRUZ_AZUL_ENFERMARIAS : window.SANTA_CLARA_ENFERMARIAS;
        
        if (isApartamento) {
            // Apartamentos contratuais = Total contratuais - Enfermarias contratuais
            if (enfInfo && enfInfo.contratuais) {
                totalContratuaisPorTipo = capacidade.contratuais - enfInfo.contratuais.length;
            } else {
                totalContratuaisPorTipo = (hospitalId === 'H2') ? 20 : 18; // Fallback
            }
            textoTipo = 'APARTAMENTO';
            
        } else if (isEnfermaria) {
            // Enfermarias contratuais = Do cards-config.js
            if (enfInfo && enfInfo.contratuais) {
                totalContratuaisPorTipo = enfInfo.contratuais.length;
            } else {
                totalContratuaisPorTipo = (hospitalId === 'H2') ? 16 : 8; // Fallback
            }
            textoTipo = 'ENFERMARIA';
        } else {
            // V7.6: Fallback de segurança - se tipo vier vazio/inválido
            totalContratuaisPorTipo = capacidade.contratuais;
            textoTipo = '';
        }
    } else {
        // ✅ HÍBRIDOS: Sem tipo na flag
        totalContratuaisPorTipo = capacidade.contratuais;
        textoTipo = '';
    }

    // ✅ VERIFICAR SE É EXTRA (baseado na posição dentro do tipo)
    const isLeitoExtra = (posicaoOcupacao > totalContratuaisPorTipo);

    if (isLeitoExtra) {
        // ✅ LEITO EXTRA - Contagem incremental X/X
        const numExtra = posicaoOcupacao - totalContratuaisPorTipo;

        return `
            <div style="
                background: ${window.COR_FLAG_EXTRA};
                color: #131b2e;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                margin-top: 8px;
                font-family: 'Poppins', sans-serif;
            ">
                EXTRA ${textoTipo} ${numExtra}/${numExtra}
            </div>
        `;
    } else {
        // ✅ LEITO CONTRATUAL - Usa posicaoOcupacao
        return `
            <div style="
                background: ${window.COR_FLAG_CONTRATUAL};
                color: #ffffff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                margin-top: 8px;
                font-family: 'Poppins', sans-serif;
            ">
                OCUPAÇÃO ${textoTipo} ${posicaoOcupacao}/${totalContratuaisPorTipo}
            </div>
        `;
    }
};

// =================== FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO ===================
window.renderCards = function() {
    logInfo('[CARDS V6.1] Renderizando com filtro inteligente de vagos...');
    console.log('[CARDS V6.1] Logica:');
    console.log('  - Hibridos: TODOS ocupados + 1 vago (menor ID)');
    console.log('  - Apartamentos: TODOS ocupados + 1 vago (menor ID)');
    console.log('  - Enfermarias: TODOS ocupados + TODOS vagos (exceto bloqueados por isolamento)');
    
    const container = document.getElementById('cardsContainer');
    if (!container) {
        logError('Container cardsContainer não encontrado');
        return;
    }

    container.innerHTML = '';
    const hospitalId = window.currentHospital || 'H1';
    
    // V7.0: Sincronizar dropdown com currentHospital
    const dropdown = document.getElementById('hospitalDropdown');
    if (dropdown && dropdown.value !== hospitalId) {
        dropdown.value = hospitalId;
        console.log('[V7.0] Dropdown sincronizado com hospital: ' + hospitalId);
    }
    
    const hospital = window.hospitalData[hospitalId];
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId]?.nome || 'Hospital';
    
    if (!hospital || !hospital.leitos || hospital.leitos.length === 0) {
        container.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="color: #60a5fa; margin-bottom: 15px;">
                    <h3 style="font-family: 'Poppins', sans-serif;">${hospitalNome}</h3>
                </div>
                <div style="background: rgba(96,165,250,0.1); border-radius: 8px; padding: 20px;">
                    <p style="margin-bottom: 15px; font-family: 'Poppins', sans-serif;">Carregando dados...</p>
                    <p style="color: #60a5fa; font-family: 'Poppins', sans-serif;"><em>API conectada</em></p>
                </div>
            </div>
        `;
        return;
    }
    
    // V7.0: Filtrar leitos (remover UTI)
    const leitosSemUTI = hospital.leitos.filter(l => {
        const tipo = (l.tipo || '').toUpperCase();
        return tipo !== 'UTI';
    });
    
    // V7.0: Buscar reservas REAIS deste hospital (para contagem)
    const reservasHospital = window.getReservasHospital(hospitalId);
    console.log('[V7.0] Hospital ' + hospitalId + ': ' + reservasHospital.length + ' reservas reais');
    
    // V7.0: Buscar TODAS as reservas (incluindo bloqueios) para renderizacao
    const todasReservas = window.getTodasReservasHospital(hospitalId);
    console.log('[V7.0] Hospital ' + hospitalId + ': ' + todasReservas.length + ' total (reservas + bloqueios)');
    
    // Separar ocupados e vagos (usando leitos filtrados)
    const leitosOcupados = leitosSemUTI.filter(l => 
        l.status === 'Ocupado' || l.status === 'Em uso' || l.status === 'ocupado'
    );
    const leitosVagos = leitosSemUTI.filter(l => 
        l.status === 'Vago' || l.status === 'vago'
    );
    
    // Ordenar OCUPADOS
    if (hospitalId === 'H2' || hospitalId === 'H4') {
        // TIPOS FIXOS: Apartamentos ANTES de Enfermarias, depois por identificacaoLeito
        leitosOcupados.sort((a, b) => {
            const tipoA = (a.tipo || '').toUpperCase();
            const tipoB = (b.tipo || '').toUpperCase();
            
            const isAptoA = tipoA.includes('APTO') || tipoA === 'APARTAMENTO';
            const isAptoB = tipoB.includes('APTO') || tipoB === 'APARTAMENTO';
            
            // Apartamentos antes de enfermarias
            if (isAptoA && !isAptoB) return -1;
            if (!isAptoA && isAptoB) return 1;
            
            // Dentro do mesmo tipo, ordenar por identificacaoLeito
            const idA = a.identificacaoLeito || a.identificacao_leito || a.leito;
            const idB = b.identificacaoLeito || b.identificacao_leito || b.leito;
            
            return String(idA).localeCompare(String(idB), undefined, {numeric: true});
        });
    } else {
        // HÍBRIDOS: ordenação padrão por identificacaoLeito
        leitosOcupados.sort((a, b) => {
            const idA = String(a.identificacaoLeito || a.identificacao_leito || '');
            const idB = String(b.identificacaoLeito || b.identificacao_leito || '');
            
            if (idA && idB) {
                return idA.localeCompare(idB, undefined, {numeric: true});
            }
            
            if (idA) return -1;
            if (idB) return 1;
            
            return (a.leito || 0) - (b.leito || 0);
        });
    }
    
    // Ordenar VAGOS por número do leito
    leitosVagos.sort((a, b) => (a.leito || 0) - (b.leito || 0));
    
    // =================== 🎯 FILTRO INTELIGENTE DE VAGOS V6.1 ===================
    // hospitalId já declarado na linha 111
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    const isTiposFixos = window.HOSPITAIS_TIPOS_FIXOS.includes(hospitalId);
    
    let vagosParaMostrar = [];
    
    if (isHibrido) {
        // ✅ HÍBRIDOS: Mostrar apenas 1 vago (menor ID)
        vagosParaMostrar = leitosVagos.length > 0 ? [leitosVagos[0]] : [];
        console.log('[CARDS V6.1] Híbrido: 1 vago (menor ID)');
        
    } else if (isTiposFixos) {
        // ✅ TIPOS FIXOS: Separar apartamentos e enfermarias
        const vagosApartamentos = leitosVagos.filter(l => {
            const tipo = l.tipo || '';
            return tipo.toUpperCase().includes('APTO') || tipo === 'APTO' || tipo === 'Apartamento';
        });
        
        const vagosEnfermarias = leitosVagos.filter(l => {
            const tipo = l.tipo || '';
            return tipo.toUpperCase().includes('ENF') || tipo === 'ENFERMARIA' || tipo === 'Enfermaria';
        });
        
        // 1️⃣ APARTAMENTOS: Apenas 1 vago (menor ID)
        const apartamentoParaMostrar = vagosApartamentos.length > 0 ? [vagosApartamentos[0]] : [];
        
        // 2️⃣ ENFERMARIAS: ✅ CORREÇÃO V6.1
        // ✅ TODAS com 1 ocupado + 1 vago (restrição de gênero)
        // ✅ APENAS 1 par com AMBOS vagos (livre para isolamento)
        const enfermariasParaMostrar = [];
        let parLivreJaAdicionado = false; // 🆕 FLAG NOVA
        
        vagosEnfermarias.forEach(leitoVago => {
            const numeroLeito = parseInt(leitoVago.leito);
            const leitoIrmao = window.getLeitoIrmao(hospitalId, numeroLeito);
            
            if (!leitoIrmao) {
                // Não tem irmão, pode mostrar
                enfermariasParaMostrar.push(leitoVago);
            } else {
                // Tem irmão, verificar status
                const dadosIrmao = hospital.leitos.find(l => parseInt(l.leito) === leitoIrmao);
                
                if (!dadosIrmao || dadosIrmao.status === 'Vago' || dadosIrmao.status === 'vago') {
                    // ✅ IRMÃO VAGO: Mostrar APENAS 1 par livre
                    if (!parLivreJaAdicionado) {
                        enfermariasParaMostrar.push(leitoVago);
                        parLivreJaAdicionado = true;
                        console.log(`[CARDS V6.1] Par livre: leitos ${numeroLeito}-${leitoIrmao} (1º par livre)`);
                    } else {
                        console.log(`[CARDS V6.1] Par ${numeroLeito}-${leitoIrmao} OCULTO (já tem 1 par livre)`);
                    }
                } else {
                    // ✅ IRMÃO OCUPADO: Verificar isolamento
                    const isolamentoIrmao = dadosIrmao.isolamento || '';
                    
                    // ✅ CORREÇÃO: Bloquear APENAS isolamentos reais (não "Não Isolamento")
                    if (isolamentoIrmao === 'Isolamento de Contato' || isolamentoIrmao === 'Isolamento Respiratório') {
                        // ❌ BLOQUEADO por isolamento
                        console.log(`[CARDS V6.1] Leito ${numeroLeito} BLOQUEADO - Irmão ${leitoIrmao} com isolamento`);
                    } else {
                        // ✅ MOSTRAR (vago com restrição de gênero)
                        enfermariasParaMostrar.push(leitoVago);
                        const generoIrmao = dadosIrmao.genero || 'desconhecido';
                        console.log(`[CARDS V6.1] Leito ${numeroLeito} OK - Restrição ${generoIrmao}`);
                    }
                }
            }
        });
        
        vagosParaMostrar = [...apartamentoParaMostrar, ...enfermariasParaMostrar];
        console.log('[CARDS V6.1] Tipos Fixos: ' + apartamentoParaMostrar.length + ' apto + ' + enfermariasParaMostrar.length + ' enf');
        
    } else {
        // Fallback: mostrar 1 vago
        vagosParaMostrar = leitosVagos.length > 0 ? [leitosVagos[0]] : [];
    }
    
    // V7.0: Renderizar na ordem: OCUPADOS > RESERVADOS > VAGOS
    const bloqueiosCount = todasReservas.length - reservasHospital.length;
    console.log('[V7.0] Total: ' + leitosOcupados.length + ' ocupados + ' + reservasHospital.length + ' reservados + ' + bloqueiosCount + ' bloqueios + ' + vagosParaMostrar.length + ' vagos');
    
    // 1. Renderizar OCUPADOS
    leitosOcupados.forEach((leito, index) => {
        let posicaoOcupacao = 1;
        if (hospitalId === 'H2' || hospitalId === 'H4') {
            const tipoLeito = (leito.tipo || '').toUpperCase();
            const isApto = tipoLeito.includes('APTO') || tipoLeito === 'APARTAMENTO';
            const isEnf = tipoLeito.includes('ENF') || tipoLeito === 'ENFERMARIA';
            
            // V7.6: Se tipo é Hibrido ou outro, contar todos os ocupados juntos
            if (!isApto && !isEnf) {
                posicaoOcupacao = leitosOcupados.findIndex(l => l.leito === leito.leito) + 1;
            } else {
                const ocupadosMesmoTipo = leitosOcupados.filter(l => {
                    const tipoL = (l.tipo || '').toUpperCase();
                    const isAptoL = tipoL.includes('APTO') || tipoL === 'APARTAMENTO';
                    return isApto === isAptoL;
                });
                posicaoOcupacao = ocupadosMesmoTipo.findIndex(l => l.leito === leito.leito) + 1;
            }
        } else {
            posicaoOcupacao = leitosOcupados.findIndex(l => l.leito === leito.leito) + 1;
        }
        const card = createCard(leito, hospitalNome, hospitalId, posicaoOcupacao);
        container.appendChild(card);
    });
    
    // 2. V7.0: Renderizar RESERVADOS
    // - COM matricula = Reserva REAL -> Card "Reservado"
    // - SEM matricula = Bloqueio do irmao -> Card "Disp. Masc/Fem" (vaga restrita)
    todasReservas.forEach((reserva) => {
        const temMatricula = reserva.matricula && String(reserva.matricula).trim();
        
        if (temMatricula) {
            // RESERVA REAL - mostrar como Reservado
            const leitoReservado = {
                leito: reserva.leito,
                status: 'Reservado',
                tipo: reserva.tipo || 'Híbrido',
                identificacaoLeito: String(reserva.identificacaoLeito || ''),
                identificacao_leito: String(reserva.identificacaoLeito || ''),
                isolamento: reserva.isolamento || '',
                genero: reserva.genero || '',
                nome: reserva.iniciais || '',
                matricula: String(reserva.matricula || ''),
                idade: reserva.idade || '',
                pps: '', spict: '', complexidade: '', prevAlta: '',
                regiao: '', diretivas: '', anotacoes: '', admAt: '',
                _isReserva: true,
                _reservaId: reserva.linha || reserva.id,
                _identificacaoIrmão: reserva.identificacaoIrmao || ''
            };
            const card = createCard(leitoReservado, hospitalNome, hospitalId, 0);
            container.appendChild(card);
        } else {
            // BLOQUEIO DO IRMAO - mostrar como Disponivel restrito por genero
            // Não é reserva real, é apenas uma vaga que precisa respeitar o gênero do irmão
            const leitoRestrito = {
                leito: reserva.leito,
                status: 'Vago',  // Mostra como vago
                tipo: reserva.tipo || 'Enfermaria',
                identificacaoLeito: String(reserva.identificacaoLeito || ''),
                identificacao_leito: String(reserva.identificacaoLeito || ''),
                isolamento: 'Nao Isolamento',
                genero: '',  // Gênero não definido ainda
                nome: '',
                matricula: '',
                idade: '',
                pps: '', spict: '', complexidade: '', prevAlta: '',
                regiao: '', diretivas: '', anotacoes: '', admAt: '',
                _isBloqueioIrmão: true,
                _generoRestrito: reserva.genero || '',  // Genero que DEVE ser usado
                _identificacaoIrmão: reserva.identificacaoIrmao || '',
                _reservaLinhaIrmão: reserva.linha  // Para poder cancelar quando irmao for cancelado
            };
            const card = createCard(leitoRestrito, hospitalNome, hospitalId, 0);
            container.appendChild(card);
        }
    });
    
    // 3. Renderizar VAGOS
    vagosParaMostrar.forEach((leito) => {
        const card = createCard(leito, hospitalNome, hospitalId, 0);
        container.appendChild(card);
    });
    
    const total = leitosOcupados.length + todasReservas.length + vagosParaMostrar.length;
    logInfo(total + ' cards renderizados para ' + hospitalNome + ' (incluindo ' + bloqueiosCount + ' bloqueios de irmão)');
};

// =================== FUNÇÃO: BADGE DE ISOLAMENTO ===================
function getBadgeIsolamento(isolamento) {
    if (!isolamento || isolamento === 'Não Isolamento' || isolamento === 'Nao Isolamento') {
        return { cor: '#b2adaa', texto: 'Não Isol', textoCor: '#ffffff' };
    } else if (isolamento === 'Isolamento de Contato') {
        return { cor: '#f59a1d', texto: 'Contato', textoCor: '#131b2e' };
    } else if (isolamento === 'Isolamento Respiratório') {
        return { cor: '#c86420', texto: 'Respiratório', textoCor: '#ffffff' };
    }
    return getBadgeIsolamento('Não Isolamento');
}

// =================== FUNÇÃO: BADGE DE GÊNERO ===================
function getBadgeGenero(sexo) {
    if (sexo === 'Masculino') {
        return {
            cor: 'rgba(96,165,250,0.2)',
            borda: '#60a5fa',
            textoCor: '#60a5fa',
            texto: 'Masculino'
        };
    } else if (sexo === 'Feminino') {
        return {
            cor: 'rgba(236,72,153,0.2)',
            borda: '#ec4899',
            textoCor: '#ec4899',
            texto: 'Feminino'
        };
    }
    return {
        cor: 'rgba(255,255,255,0.05)',
        borda: 'rgba(255,255,255,0.1)',
        textoCor: '#ffffff',
        texto: '—'
    };
}

// BADGE DE DIRETIVAS
function getBadgeDiretivas(diretivas) {
    if (diretivas === 'Sim') {
        return { cor: 'rgba(96,165,250,0.2)', borda: '#60a5fa', textoCor: '#60a5fa', texto: 'Sim' };
    } else if (diretivas === 'Não') {
        return { cor: 'rgba(60,58,62,0.2)', borda: '#3c3a3e', textoCor: '#b2adaa', texto: 'Não' };
    }
    return { cor: 'rgba(96,165,250,0.2)', borda: '#60a5fa', textoCor: '#60a5fa', texto: 'Não se aplica' };
}

// DETERMINAR TIPO REAL DO LEITO
function getTipoLeito(leito, hospitalId) {
    const categoriaValue = leito.categoriaEscolhida || 
                          leito.categoria || 
                          leito.categoria_escolhida || 
                          leito.tipo_quarto ||
                          leito.tipoQuarto;
    
    const numeroLeito = parseInt(leito.leito);
    
    // V7.6: CRUZ AZUL (H2) e SANTA CLARA (H4): TIPOS FIXOS
    // A coluna C (tipo) ja tem APTO ou ENFERMARIA - usar diretamente
    if (hospitalId === 'H2' || hospitalId === 'H4') {
        return leito.tipo || 'APTO';
    }
    
    // VAGOS de hibridos: "Hibrido"
    const isVago = leito.status === 'Vago' || leito.status === 'vago';
    if (window.HOSPITAIS_HIBRIDOS.includes(hospitalId) && isVago) {
        return 'Híbrido';
    }
    
    // OCUPADOS de hibridos: usar categoria
    const isOcupado = leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado';
    if (window.HOSPITAIS_HIBRIDOS.includes(hospitalId) && isOcupado) {
        if (categoriaValue && categoriaValue.trim() !== '' && categoriaValue !== 'Híbrido') {
            return categoriaValue;
        }
        if (leito.tipo && leito.tipo !== 'Híbrido') return leito.tipo;
        return 'Apartamento';
    }
    
    return leito.tipo || 'Apartamento';
}

// FORMATAÇÃO DO TIPO (SEM EMOJI)
function formatarTipoTexto(tipo) {
    const tipoUpper = (tipo || '').toUpperCase().trim();
    
    switch(tipoUpper) {
        case 'APARTAMENTO':
        case 'APTO':
            return 'Apartamento';
        case 'ENFERMARIA':
        case 'ENF':
            return 'Enfermaria';
        case 'HIBRIDO':
        case 'HÍBRIDO':
            return 'Híbrido';
        default:
            return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
    }
}

// FORMATAR MATRÍCULA COM HÍFEN NO ÚLTIMO DÍGITO
function formatarMatriculaExibicao(matricula) {
    if (!matricula || matricula === '—') return '—';
    const mat = String(matricula).replace(/\D/g, '');
    if (mat.length === 0) return '—';
    if (mat.length === 1) return mat;
    return mat.slice(0, -1) + '-' + mat.slice(-1);
}

// VALIDAÇÃO DE BLOQUEIO CRUZ AZUL E SANTA CLARA (LEITOS IRMÃOS)
function validarAdmissaoCruzAzul(leitoNumero, generoNovo) {
    const hospitalId = window.currentHospital;
    
    // ✅ Verificar se é H2 ou H4 e se o leito tem irmão
    const isCruzAzul = (hospitalId === 'H2') && (leitoNumero in window.CRUZ_AZUL_IRMAOS);
    const isSantaClara = (hospitalId === 'H4') && (leitoNumero in window.SANTA_CLARA_IRMAOS);
    
    if (!isCruzAzul && !isSantaClara) {
        return { permitido: true };
    }
    
    // ✅ Usar mapa correto
    const mapaIrmaos = isCruzAzul ? window.CRUZ_AZUL_IRMAOS : window.SANTA_CLARA_IRMAOS;
    const leitoIrmao = mapaIrmaos[leitoNumero];
    if (!leitoIrmao) return { permitido: true };
    
    // ✅ Buscar no hospital correto
    const leitosHospital = window.hospitalData[hospitalId]?.leitos || [];
    const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
    
    if (!dadosLeitoIrmao || dadosLeitoIrmao.status === 'Vago' || dadosLeitoIrmao.status === 'vago') {
        return { permitido: true };
    }
    
    const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
    if (isolamentoIrmao && isolamentoIrmao !== 'Não Isolamento' && isolamentoIrmao !== 'Nao Isolamento' && isolamentoIrmao !== '') {
        return {
            permitido: false,
            motivo: `Leito bloqueado! O leito ${leitoIrmao} está com isolamento: ${isolamentoIrmao}`,
            tipo: 'isolamento'
        };
    }
    
    const generoIrmao = dadosLeitoIrmao.genero || '';
    if (generoIrmao && generoNovo && generoIrmao !== generoNovo) {
        return {
            permitido: false,
            motivo: `Leito bloqueado! O leito ${leitoIrmao} está ocupado por paciente do gênero ${generoIrmao}`,
            tipo: 'genero'
        };
    }
    
    return { permitido: true };
}

// =================== CRIAR CARD INDIVIDUAL ===================
function createCard(leito, hospitalNome, hospitalId, posicaoOcupacao) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background: #1a1f2e; border-radius: 12px; padding: 18px; color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: "Poppins", sans-serif;';
    
    // ✅ ADICIONAR BORDA LARANJA SE LEITO EXTRA
    const isExtra = window.isLeitoExtra(hospitalId, posicaoOcupacao);
    if (isExtra) {
        card.style.cssText += ' border: 2px solid #f59a1d !important;';
    }
    
    // VERIFICAR BLOQUEIO CRUZ AZUL
    let bloqueadoPorIsolamento = false;
    let bloqueadoPorGenero = false;
    let generoPermitido = null;
    let motivoBloqueio = '';

    const numeroLeito = parseInt(leito.leito);
    
    // 🔍 DEBUG - Santa Clara
    if (hospitalId === 'H4') {
        console.log('🔍 DEBUG H4 - Leito:', numeroLeito);
        console.log('🔍 SANTA_CLARA_IRMAOS existe?', typeof window.SANTA_CLARA_IRMAOS);
        console.log('🔍 SANTA_CLARA_IRMAOS:', window.SANTA_CLARA_IRMAOS);
        console.log('🔍 Leito está no mapa?', numeroLeito in window.SANTA_CLARA_IRMAOS);
    }
    
    // ✅ Verificar diretamente nos mapas de irmãos (sem depender de função externa)
    const isCruzAzulEnfermaria = (hospitalId === 'H2') && (numeroLeito in window.CRUZ_AZUL_IRMAOS);
    const isSantaClaraEnfermaria = (hospitalId === 'H4') && (numeroLeito in window.SANTA_CLARA_IRMAOS);
    
    // 🔍 DEBUG - Resultado da verificação
    if (hospitalId === 'H4') {
        console.log('🔍 isSantaClaraEnfermaria:', isSantaClaraEnfermaria);
    }

    if ((isCruzAzulEnfermaria || isSantaClaraEnfermaria) && (leito.status === 'Vago' || leito.status === 'vago')) {
        // Usar mapa correto baseado no hospital
        const mapaIrmaos = isCruzAzulEnfermaria ? window.CRUZ_AZUL_IRMAOS : window.SANTA_CLARA_IRMAOS;
        const leitoIrmao = mapaIrmaos[numeroLeito];
        
        if (leitoIrmao) {
            // Buscar dados do leito irmão OCUPADO
            const leitosHospital = window.hospitalData[hospitalId]?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            // V7.0: TAMBÉM buscar RESERVA do leito irmao
            const reservasHospital = (window.reservasData || []).filter(r => r.hospital === hospitalId);
            const reservaLeitoIrmao = reservasHospital.find(r => {
                // Verificar pelo número do leito OU pela identificação do leito
                const identificacaoReserva = String(r.identificacaoLeito || '').toUpperCase();
                // Para H2: sufixos 1 e 3 (ex: 100-1 e 100-3)
                // Para H4: sufixos A e C (ex: 201-A e 201-C)
                const sufixos = isCruzAzulEnfermaria ? ['1', '3'] : ['A', 'C'];
                
                // Extrair base da identificacao (ex: "100" de "100-1")
                const baseIdentAtual = String(leito.identificacaoLeito || leito.identificacao_leito || '').replace(/-[13AC]$/i, '');
                const baseIdentReserva = identificacaoReserva.replace(/-[13AC]$/i, '');
                
                // Se a reserva tem a mesma base de identificacao mas sufixo diferente, eh o irmao
                if (baseIdentAtual && baseIdentReserva && baseIdentAtual === baseIdentReserva) {
                    const sufixoAtual = String(leito.identificacaoLeito || leito.identificacao_leito || '').match(/-([13AC])$/i)?.[1]?.toUpperCase();
                    const sufixoReserva = identificacaoReserva.match(/-([13AC])$/i)?.[1]?.toUpperCase();
                    if (sufixoAtual && sufixoReserva && sufixoAtual !== sufixoReserva) {
                        return true;
                    }
                }
                
                // Verificar pelo número do leito na planilha
                return parseInt(r.leito) === parseInt(leitoIrmao);
            });
            
            console.log('[V7.0 IRMAO] Leito:', numeroLeito, 'Irmão:', leitoIrmao);
            console.log('[V7.0 IRMAO] Irmão ocupado?', dadosLeitoIrmao?.status);
            console.log('[V7.0 IRMAO] Irmão tem reserva?', reservaLeitoIrmao ? 'SIM' : 'NAO');
            
            // PRIMEIRO: Verificar se irmao esta OCUPADO
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Em uso' || dadosLeitoIrmao.status === 'ocupado' || dadosLeitoIrmao.status === 'Ocupado')) {
                const isolamentoIrmao = String(dadosLeitoIrmao.isolamento || '').trim();
                
                // V7.0: Verificar se NÃO é isolamento (todas as variacoes)
                const ehNaoIsolamento = !isolamentoIrmao || 
                                        isolamentoIrmao === 'Não Isolamento' ||
                                        isolamentoIrmao === 'Nao Isolamento' ||
                                        isolamentoIrmao.toLowerCase().includes('nao isol') ||
                                        isolamentoIrmao.toLowerCase().includes('não isol');
                
                if (!ehNaoIsolamento) {
                    // TEM isolamento real - bloquear
                    bloqueadoPorIsolamento = true;
                    const identificacaoIrmao = String(dadosLeitoIrmao?.identificacaoLeito || 
                                               dadosLeitoIrmao?.identificacao_leito || 
                                               `Leito ${leitoIrmao}`);
                    motivoBloqueio = `Isolamento no ${identificacaoIrmao}`;
                    console.log('[V7.0 IRMAO] BLOQUEADO por isolamento do OCUPADO:', motivoBloqueio);
                } else if (dadosLeitoIrmao.genero) {
                    // NÃO tem isolamento - apenas restringir gênero
                    bloqueadoPorGenero = true;
                    generoPermitido = dadosLeitoIrmao.genero;
                    console.log('[V7.0 IRMAO] Restrito por gênero do OCUPADO:', generoPermitido);
                }
            }
            // SEGUNDO: V7.0 - Verificar se irmao tem RESERVA (mesmo que nao esteja ocupado)
            else if (reservaLeitoIrmao) {
                const isolamentoReserva = String(reservaLeitoIrmao.isolamento || '').trim();
                
                // V7.0: Verificar se NÃO é isolamento (todas as variacoes)
                const ehNaoIsolamentoReserva = !isolamentoReserva || 
                                               isolamentoReserva === 'Não Isolamento' ||
                                               isolamentoReserva === 'Nao Isolamento' ||
                                               isolamentoReserva.toLowerCase().includes('nao isol') ||
                                               isolamentoReserva.toLowerCase().includes('não isol');
                
                if (!ehNaoIsolamentoReserva) {
                    // TEM isolamento real - bloquear
                    bloqueadoPorIsolamento = true;
                    const identificacaoReserva = String(reservaLeitoIrmao.identificacaoLeito || `Leito ${leitoIrmao}`);
                    motivoBloqueio = `Isolamento na reserva ${identificacaoReserva}`;
                    console.log('[V7.0 IRMAO] BLOQUEADO por isolamento da RESERVA:', motivoBloqueio);
                } else if (reservaLeitoIrmao.genero) {
                    // NÃO tem isolamento - apenas restringir gênero
                    bloqueadoPorGenero = true;
                    generoPermitido = reservaLeitoIrmao.genero;
                    console.log('[V7.0 IRMAO] Restrito por gênero da RESERVA:', generoPermitido);
                }
            }
        }
    }
    
    // Determinar status
    let isVago = false;
    let isReservado = false;
    let isBloqueioIrmao = leito._isBloqueioIrmao || false;
    let statusBgColor = '#60a5fa';
    let statusTextColor = '#ffffff';
    let statusTexto = 'Disponível';
    
    // V7.0: Se é bloqueio de irmão (vaga restrita por gênero)
    if (isBloqueioIrmao && leito._generoRestrito) {
        isVago = true;
        bloqueadoPorGenero = true;
        generoPermitido = leito._generoRestrito;
        statusTexto = `Disp. ${generoPermitido === 'Masculino' ? 'Masc' : 'Fem'}`;
        console.log('[V7.0 BLOQUEIO IRMÃO] Vaga restrita por genero:', generoPermitido);
    } else if (bloqueadoPorIsolamento) {
        statusBgColor = '#c86420';
        statusTextColor = '#ffffff';
        statusTexto = 'BLOQUEADO';
    } else if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
        isVago = false;
        statusBgColor = '#f59a1d';
        statusTextColor = '#131b2e';
        statusTexto = 'Ocupado';
    } else if (leito.status === 'Reservado') {
        // V7.0: Status Reservado
        isVago = false;
        isReservado = true;
        statusBgColor = '#f59a1d';
        statusTextColor = '#131b2e';
        statusTexto = 'Reservado';
    } else if (leito.status === 'Vago' || leito.status === 'vago') {
        isVago = true;
        if (bloqueadoPorGenero) {
            statusTexto = `Disp. ${generoPermitido === 'Masculino' ? 'Masc' : 'Fem'}`;
        }
    }
    
    // Dados do paciente
    const nome = leito.nome || '';
    const matricula = leito.matricula || '';
    const matriculaFormatada = formatarMatriculaExibicao(matricula);
    const idade = leito.idade || null;
    const admissao = leito.admAt || '';
    const pps = leito.pps || null;
    const spict = leito.spict || '';
    const previsaoAlta = leito.prevAlta || '';
    
    // Normalizar isolamento
    let isolamento = leito.isolamento || 'Não Isolamento';
    const isolamentoLower = isolamento.toLowerCase().trim();
    
    if (isolamentoLower === 'isolamento de contato' || isolamentoLower === 'isolamento contato') {
        isolamento = 'Isolamento de Contato';
    } else if (isolamentoLower === 'isolamento respiratorio' || isolamentoLower === 'isolamento respiratório') {
        isolamento = 'Isolamento Respiratório';
    } else if (isolamentoLower === 'nao isolamento' || isolamentoLower === 'não isolamento' || isolamentoLower.includes('nao isol')) {
        isolamento = 'Não Isolamento';
    }
    
    // Identificacao do leito - CORRECAO: sempre converter para string
    let identificacaoLeito = String(leito.identificacaoLeito || leito.identificacao_leito || '');
    
    const regiao = leito.regiao || '';
    const sexo = leito.genero || '';
    const diretivas = leito.diretivas || 'Não se aplica';
    
    const tipoReal = getTipoLeito(leito, hospitalId);
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    const badgeIsolamento = getBadgeIsolamento(isolamento);
    const badgeGenero = getBadgeGenero(sexo);
    const badgeDiretivas = getBadgeDiretivas(diretivas);
    
    // DESNORMALIZAR CONCESSÕES E LINHAS
    const concessoesRaw = Array.isArray(leito.concessoes) ? leito.concessoes : [];
    const concessoes = concessoesRaw.map(c => window.desnormalizarTexto(c));
    
    const linhasRaw = Array.isArray(leito.linhas) ? leito.linhas : [];
    const linhas = linhasRaw.map(l => window.desnormalizarTexto(l));
    
    let tempoInternacao = '';
    if (!isVago && admissao) {
        tempoInternacao = calcularTempoInternacao(admissao);
    }
    
    const iniciais = isVago ? '—' : (nome ? String(nome).trim() : '—');
    
    let ppsFormatado = pps ? `${pps}%` : '—';
    if (ppsFormatado !== '—' && !ppsFormatado.includes('%')) {
        ppsFormatado = `${pps}%`;
    }
    
    const spictFormatado = (spict === 'elegivel' || spict === 'elegível') ? 'Elegível' : 
                          ((spict === 'nao_elegivel' || spict === 'não_elegível') ? 'Não elegível' : '—');
    
    const idSequencial = String(numeroLeito).padStart(2, '0');
    
    // ✅ AJUSTE: Leitos vagos mostram "-" se não tiver identificação
    let leitoDisplay;
    if (isVago) {
        // Se vago E tem identificação (caso dos irmãos) → mostra número
        // Se vago SEM identificação → mostra "-"
        leitoDisplay = (identificacaoLeito && identificacaoLeito.trim()) 
            ? identificacaoLeito.trim().toUpperCase()
            : '—';
    } else {
        // Se ocupado → mostra identificação ou "LEITO X"
        leitoDisplay = (identificacaoLeito && identificacaoLeito.trim()) 
            ? identificacaoLeito.trim().toUpperCase()
            : `LEITO ${numeroLeito}`;
    }
    
    // COR DO CÍRCULO PESSOA
    const circuloCor = '#60a5fa';
    const circuloStroke = isVago ? '#1a1f2e' : '#ffffff';
    
    // HTML do Card
    card.innerHTML = `
        <!-- HEADER: HOSPITAL FORA DOS BOXES -->
        <div class="card-header" style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; font-family: 'Poppins', sans-serif;">
            <div style="font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">HOSPITAL</div>
            <div style="font-size: 16px; color: #ffffff; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${hospitalNome}</div>
            ${isHibrido ? '<div style="font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 600; margin-top: 2px;">Leito Híbrido</div>' : ''}
            ${window.renderFlagOcupacao(hospitalId, leito.status, posicaoOcupacao, tipoReal)}
        </div>

        <!-- LINHA 1: LEITO | TIPO | STATUS -->
        <div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">LEITO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;" data-leito-numero="${numeroLeito}">${leitoDisplay}</div>
            </div>
            
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">TIPO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${formatarTipoTexto(tipoReal)}</div>
            </div>
            
            <div class="status-badge" style="background: ${statusBgColor}; color: ${statusTextColor}; padding: 12px 6px; border-radius: 6px; font-weight: 800; text-transform: uppercase; text-align: center; font-size: 11px; letter-spacing: 0.5px; min-height: 45px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div class="box-label" style="font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; color: ${statusTextColor};">STATUS</div>
                <div class="box-value" style="font-weight: 700; font-size: 11px; line-height: 1.2; color: ${statusTextColor};">${statusTexto}</div>
                ${motivoBloqueio ? `<div style="font-size: 8px; margin-top: 2px; color: ${statusTextColor};">${motivoBloqueio}</div>` : ''}
            </div>
        </div>

        <!-- LINHA 2: GÊNERO | ISOLAMENTO | PREV ALTA -->
        <div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
            <div class="card-box" style="background: ${badgeGenero.cor}; border: 1px solid ${badgeGenero.borda}; border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: ${badgeGenero.textoCor}; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">GÊNERO</div>
                <div class="box-value" style="color: ${badgeGenero.textoCor}; font-weight: 700; font-size: 11px; line-height: 1.2;">${badgeGenero.texto}</div>
            </div>
            
            <div class="card-box" style="background: ${badgeIsolamento.cor}; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: ${badgeIsolamento.textoCor}; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">ISOLAMENTO</div>
                <div class="box-value" style="color: ${badgeIsolamento.textoCor}; font-weight: 700; font-size: 11px; line-height: 1.2;">${badgeIsolamento.texto}</div>
            </div>
            
            <div class="card-box prev-alta" style="background: #60a5fa; border: 1px solid rgba(96,165,250,0.5); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: #ffffff; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">PREVISÃO ALTA</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${previsaoAlta || '—'}</div>
            </div>
        </div>

        <!-- LINHA DIVISÓRIA BRANCA SÓLIDA -->
        <div class="divider" style="height: 2px; background: #ffffff; margin: 12px 0;"></div>

        <!-- SEÇÃO PESSOA: CÍRCULO + 4 CÉLULAS -->
        <div class="card-row-pessoa" style="display: grid; grid-template-columns: 100px 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-family: 'Poppins', sans-serif;">
            <div class="pessoa-circle" style="grid-row: span 2; grid-column: 1; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: ${circuloCor};">
                <svg class="pessoa-icon" viewBox="0 0 24 24" fill="none" stroke="${circuloStroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 55%; height: 55%;">
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                </svg>
            </div>

            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">INICIAIS</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;" data-iniciais="${iniciais}">${iniciais}</div>
            </div>

            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">MATRÍCULA</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;" data-matricula="${matricula}">${matriculaFormatada}</div>
            </div>

            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">IDADE</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">${idade ? idade + ' anos' : '—'}</div>
            </div>

            <div class="small-cell" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">
                <div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">REGIÃO</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">${regiao || '—'}</div>
            </div>
        </div>

        <!-- LINHA 3: PPS | SPICT-BR | DIRETIVAS -->
        <div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 12px; font-family: 'Poppins', sans-serif;">
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">PPS</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${ppsFormatado}</div>
            </div>
            
            <div class="card-box" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">SPICT-BR</div>
                <div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">${spictFormatado}</div>
            </div>
            
            <div class="card-box" style="background: ${badgeDiretivas.cor}; border: 1px solid ${badgeDiretivas.borda}; border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">
                <div class="box-label" style="font-size: 9px; color: ${badgeDiretivas.textoCor}; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">DIRETIVAS</div>
                <div class="box-value" style="color: ${badgeDiretivas.textoCor}; font-weight: 700; font-size: 11px; line-height: 1.2;">${badgeDiretivas.texto}</div>
            </div>
        </div>

        <!-- CONCESSÕES -->
        <div class="card-section" style="margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
            <div class="section-header" style="background: #60a5fa; color: #ffffff; font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                CONCESSÕES PREVISTAS NA ALTA
            </div>
            <div class="chips-container" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; border-radius: 6px; padding: 8px;">
                ${(concessoes && concessoes.length > 0) 
                    ? concessoes.map(concessao => `<span class="chip" style="font-size: 9px; background: rgba(96,165,250,0.2); border: 1px solid rgba(96,165,250,0.4); color: #60a5fa; padding: 3px 8px; border-radius: 10px; font-weight: 700; font-family: 'Poppins', sans-serif;">${concessao}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <!-- LINHAS DE CUIDADO -->
        <div class="card-section" style="margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
            <div class="section-header" style="background: #60a5fa; color: #ffffff; font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                LINHAS DE CUIDADO
            </div>
            <div class="chips-container" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; border-radius: 6px; padding: 8px;">
                ${(linhas && linhas.length > 0) 
                    ? linhas.map(linha => `<span class="chip" style="font-size: 9px; background: rgba(96,165,250,0.2); border: 1px solid rgba(96,165,250,0.4); color: #60a5fa; padding: 3px 8px; border-radius: 10px; font-weight: 700; font-family: 'Poppins', sans-serif;">${linha}</span>`).join('') 
                    : '<span style="color: rgba(255,255,255,0.7); font-size: 10px;">Nenhuma</span>'
                }
            </div>
        </div>

        <!-- ANOTAÇÕES -->
        <div class="card-section" style="margin-bottom: 15px; font-family: 'Poppins', sans-serif;">
            <div class="section-header" style="background: #60a5fa; color: #ffffff; font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
                ANOTAÇÕES
            </div>
            <div class="anotacoes-container" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; min-height: 40px;">
                ${(leito.anotacoes && leito.anotacoes.trim()) 
                    ? `<span style="color: rgba(255,255,255,0.9); font-size: 11px; line-height: 1.6; font-family: 'Poppins', sans-serif; white-space: pre-wrap;">${leito.anotacoes}</span>`
                    : '<span style="color: rgba(255,255,255,0.5); font-size: 10px; font-style: italic;">Sem anotações</span>'
                }
            </div>
        </div>

        <!-- FOOTER -->
        <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); gap: 10px; font-family: 'Poppins', sans-serif;">
            <div class="card-info" style="display: flex; gap: 8px; flex-wrap: wrap; flex: 1;">
                ${!isVago && admissao ? `
                <div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">ADMISSÃO</div>
                    <div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">${formatarDataHora(admissao)}</div>
                </div>
                ` : ''}
                
                ${!isVago && tempoInternacao ? `
                <div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">INTERNADO</div>
                    <div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">${tempoInternacao}</div>
                </div>
                ` : ''}
                
                <div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">ID</div>
                    <div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">${idSequencial}</div>
                </div>
                
                ${isVago ? `
                <div class="info-item" style="display: flex; flex-direction: column;">
                    <div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">STATUS</div>
                    <div class="info-value" style="color: #60a5fa; font-weight: 700; font-size: 9px;">${statusTexto}</div>
                </div>
                ` : ''}
            </div>
            
            ${isReservado ? `
            <!-- V7.0: Botoes RESERVADO -->
            <div style="display: flex; gap: 8px;">
                <button class="btn-action btn-cancelar-reserva" 
                        data-action="cancelar-reserva" 
                        data-leito="${numeroLeito}"
                        data-identificacao="${identificacaoLeito}"
                        data-matricula="${matricula}"
                        style="padding: 10px 16px; background: #c86420; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: 'Poppins', sans-serif;">
                    CANCELAR
                </button>
                <button class="btn-action" 
                        data-action="admitir-reserva" 
                        data-leito="${numeroLeito}"
                        style="padding: 10px 16px; background: #60a5fa; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: 'Poppins', sans-serif;">
                    ADMITIR
                </button>
            </div>
            ` : isVago ? `
            <!-- V7.0: Botoes VAGO -->
            <div style="display: flex; gap: 8px;">
                <button class="btn-action btn-reservar" 
                        data-action="reservar" 
                        data-leito="${numeroLeito}" 
                        ${bloqueadoPorIsolamento ? 'disabled' : ''}
                        style="padding: 10px 16px; background: ${bloqueadoPorIsolamento ? '#b2adaa' : '#60a5fa'}; color: #ffffff; border: none; border-radius: 6px; cursor: ${bloqueadoPorIsolamento ? 'not-allowed' : 'pointer'}; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: 'Poppins', sans-serif; opacity: ${bloqueadoPorIsolamento ? '0.5' : '1'};">
                    ${bloqueadoPorIsolamento ? 'BLOQUEADO' : 'RESERVAR'}
                </button>
                ${isBloqueioIrmao ? '' : `
                <button class="btn-action" 
                        data-action="admitir" 
                        data-leito="${numeroLeito}" 
                        ${bloqueadoPorIsolamento ? 'disabled' : ''}
                        style="padding: 10px 16px; background: ${bloqueadoPorIsolamento ? '#b2adaa' : '#60a5fa'}; color: #ffffff; border: none; border-radius: 6px; cursor: ${bloqueadoPorIsolamento ? 'not-allowed' : 'pointer'}; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: 'Poppins', sans-serif; opacity: ${bloqueadoPorIsolamento ? '0.5' : '1'};">
                    ${bloqueadoPorIsolamento ? 'BLOQUEADO' : 'ADMITIR'}
                </button>
                `}
            </div>
            ` : `
            <!-- Botao OCUPADO -->
            <button class="btn-action" 
                    data-action="atualizar" 
                    data-leito="${numeroLeito}" 
                    style="padding: 10px 18px; background: rgba(156,163,175,0.5); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 11px; font-family: 'Poppins', sans-serif;">
                ATUALIZAR
            </button>
            `}
        </div>
    `;

    // Event listeners
    const admitBtn = card.querySelector('[data-action="admitir"]');
    if (admitBtn) {
        admitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // V7.4: Admissão só permitida via QR Code
            alert('Admissão só permitida pelo sistema de admissão via QR Code');
        });
    }
    
    // V7.0: Event listener RESERVAR
    const reservarBtn = card.querySelector('[data-action="reservar"]');
    if (reservarBtn) {
        reservarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openReservaFlow(numeroLeito, leito);
        });
    }
    
    // V7.0: Event listener CANCELAR RESERVA
    const cancelarBtn = card.querySelector('[data-action="cancelar-reserva"]');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Deseja cancelar esta reserva?')) {
                window.showLoadingOverlay('Cancelando reserva...');
                try {
                    await window.cancelarReserva(hospitalId, cancelarBtn.dataset.identificacao, cancelarBtn.dataset.matricula);
                    showSuccessMessage('Reserva cancelada!');
                    await window.refreshAfterAction();
                } catch (error) {
                    showErrorMessage('Erro: ' + error.message);
                } finally {
                    window.hideLoadingOverlay();
                }
            }
        });
    }
    
    // V7.0: Event listener ADMITIR RESERVA
    const admitirReservaBtn = card.querySelector('[data-action="admitir-reserva"]');
    if (admitirReservaBtn) {
        admitirReservaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // V7.4: Admissão só permitida via QR Code
            alert('Admissão só permitida pelo sistema de admissão via QR Code');
        });
    }
    
    const updateBtn = card.querySelector('[data-action="atualizar"]');
    if (updateBtn) {
        updateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAtualizacaoFlow(numeroLeito, leito);
        });
    }

    return card;
}

// =================== FLUXOS DE ADMISSÃO E ATUALIZAÇÃO ===================
function openAdmissaoFlow(leitoNumero) {
    const button = document.querySelector(`[data-action="admitir"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ADMITIR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAdmissaoModal(leitoNumero);
        logInfo(`Modal de admissão aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

function openAtualizacaoFlow(leitoNumero, dadosLeito) {
    const button = document.querySelector(`[data-action="atualizar"][data-leito="${leitoNumero}"]`);
    const originalText = button.innerHTML;
    
    showButtonLoading(button, 'ATUALIZAR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openAtualizacaoModal(leitoNumero, dadosLeito);
        logInfo(`Modal de atualização aberto: ${window.currentHospital} - Leito ${leitoNumero}`);
    }, 800);
}

// =================== V7.0: FLUXO DE RESERVA ===================
function openReservaFlow(leitoNumero, dadosLeito) {
    const button = document.querySelector(`[data-action="reservar"][data-leito="${leitoNumero}"]`);
    if (!button) return;
    
    const originalText = button.innerHTML;
    showButtonLoading(button, 'RESERVAR');
    
    setTimeout(() => {
        hideButtonLoading(button, originalText);
        openReservaModal(leitoNumero, dadosLeito);
        logInfo('[V7.0] Modal de reserva aberto: ' + window.currentHospital + ' - Leito ' + leitoNumero);
    }, 800);
}

function openReservaModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId]?.nome || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    window.isReservaMode = true;
    
    const modal = createModalOverlay();
    modal.innerHTML = createReservaForm(hospitalNome, leitoNumero, hospitalId, dadosLeito);
    document.body.appendChild(modal);
    
    setupReservaModalEventListeners(modal);
}

function openAdmissaoModalComReserva(leitoNumero, dadosReserva) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId]?.nome || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    window.reservaParaAdmitir = dadosReserva;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAdmissaoForm(hospitalNome, leitoNumero, hospitalId);
    document.body.appendChild(modal);
    
    // Pre-preencher com dados da reserva
    setTimeout(() => {
        const idInput = modal.querySelector('#admIdentificacaoLeito') || modal.querySelector('#admIdentificacaoNumero');
        const identificacaoReserva = String(dadosReserva.identificacaoLeito || '');
        if (idInput && identificacaoReserva) {
            if (identificacaoReserva.includes('-')) {
                const partes = identificacaoReserva.split('-');
                const numInput = modal.querySelector('#admIdentificacaoNumero');
                const sufInput = modal.querySelector('#admIdentificacaoSufixo');
                if (numInput) numInput.value = partes[0];
                if (sufInput) sufInput.value = partes[1];
            } else {
                idInput.value = identificacaoReserva;
            }
        }
        const isoSelect = modal.querySelector('#admIsolamento');
        if (isoSelect && dadosReserva.isolamento) isoSelect.value = dadosReserva.isolamento;
        const genSelect = modal.querySelector('#admSexo');
        if (genSelect && dadosReserva.genero) genSelect.value = dadosReserva.genero;
        const nomeInput = modal.querySelector('#admNome');
        if (nomeInput && dadosReserva.nome) nomeInput.value = dadosReserva.nome;
        const matInput = modal.querySelector('#admMatricula');
        if (matInput && dadosReserva.matricula) matInput.value = dadosReserva.matricula;
        const idadeSelect = modal.querySelector('#admIdade');
        if (idadeSelect && dadosReserva.idade) idadeSelect.value = dadosReserva.idade;
        const tipoSelect = modal.querySelector('#admTipoQuarto');
        if (tipoSelect && dadosReserva.tipo && !tipoSelect.disabled) tipoSelect.value = dadosReserva.tipo;
    }, 100);
    
    setupModalEventListeners(modal, 'admissao');
    setupSearchFilter(modal, 'admConcessoes', 'searchConcessoes');
    setupSearchFilter(modal, 'admLinhas', 'searchLinhas');
}

// =================== MODAIS ===================
function openAdmissaoModal(leitoNumero) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId]?.nome || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAdmissaoForm(hospitalNome, leitoNumero, hospitalId);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'admissao');
    setupSearchFilter(modal, 'admConcessoes', 'searchConcessoes');
    setupSearchFilter(modal, 'admLinhas', 'searchLinhas');
}

function openAtualizacaoModal(leitoNumero, dadosLeito) {
    const hospitalId = window.currentHospital;
    const hospitalNome = window.HOSPITAL_MAPPING[hospitalId]?.nome || 'Hospital';
    
    window.selectedLeito = leitoNumero;
    
    const modal = createModalOverlay();
    modal.innerHTML = createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito);
    document.body.appendChild(modal);
    
    setupModalEventListeners(modal, 'atualizacao');
    setupSearchFilter(modal, 'updConcessoes', 'searchConcessoesUpd');
    setupSearchFilter(modal, 'updLinhas', 'searchLinhasUpd');
    
    setTimeout(() => {
        forcarPreMarcacao(modal, dadosLeito);
    }, 100);
}

function createModalOverlay() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 9999; backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease; font-family: 'Poppins', sans-serif;
    `;
    return modal;
}

// FUNÇÃO DE BUSCA DINÂMICA
function setupSearchFilter(modal, containerId, searchId) {
    const searchInput = modal.querySelector(`#${searchId}`);
    const container = modal.querySelector(`#${containerId}`);
    
    if (!searchInput || !container) {
        logError(`Elementos não encontrados: ${searchId} ou ${containerId}`);
        return;
    }
    
    const labels = container.querySelectorAll('label');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        labels.forEach(label => {
            const text = label.textContent.toLowerCase();
            const checkbox = label.querySelector('input[type="checkbox"]');
            
            if (searchTerm === '' || text.includes(searchTerm)) {
                label.style.display = 'flex';
            } else {
                label.style.display = 'none';
            }
        });
        
        const visibleLabels = Array.from(labels).filter(l => l.style.display !== 'none');
        
        let msgNoResults = container.querySelector('.no-results-message');
        
        if (visibleLabels.length === 0) {
            if (!msgNoResults) {
                msgNoResults = document.createElement('div');
                msgNoResults.className = 'no-results-message';
                msgNoResults.style.cssText = 'padding: 10px; text-align: center; color: rgba(255,255,255,0.5); font-size: 12px;';
                msgNoResults.textContent = `Nenhum resultado para "${searchTerm}"`;
                container.appendChild(msgNoResults);
            }
        } else {
            if (msgNoResults) {
                msgNoResults.remove();
            }
        }
    });
    
    logSuccess(`Busca dinâmica configurada: ${searchId}`);
}

// =================== FORMULÁRIO DE ADMISSÃO ===================
function createAdmissaoForm(hospitalNome, leitoNumero, hospitalId) {
    const idSequencial = String(leitoNumero).padStart(2, '0');
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    // APENAS hospitais híbridos puros mostram campo "Tipo de Quarto"
    // Santa Clara (H4) e Cruz Azul (H2) são tipos fixos - tipos hardcoded na planilha
    const mostrarTipoQuarto = isHibrido;

    // CRUZ AZUL: TODAS as enfermarias com irmão (contratuais + extras)
    const isCruzAzulEnfermaria = (hospitalId === 'H2') && (window.CRUZ_AZUL_IRMAOS[leitoNumero] !== undefined);

    // SANTA CLARA: TODAS as enfermarias com irmão (contratuais + extras)
    const isSantaClaraEnfermaria = (hospitalId === 'H4') && (window.SANTA_CLARA_IRMAOS[leitoNumero] !== undefined);

    let generoPreDefinido = null;
    let generoDisabled = false;
    let isolamentoPreDefinido = null;
    let isolamentoDisabled = false;
    
    // LÓGICA DE LEITOS IRMÃOS - CRUZ AZUL
    let numeroBasePreenchido = '';
    let sufixoPreDefinido = '';
    
    if (isCruzAzulEnfermaria) {
        const leitoIrmao = window.CRUZ_AZUL_IRMAOS[leitoNumero];
        if (leitoIrmao) {
            const leitosHospital = window.hospitalData['H2']?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            // V7.0: TAMBEM verificar RESERVA do leito irmao
            const reservasH2 = (window.reservasData || []).filter(r => r.hospital === 'H2');
            const reservaLeitoIrmao = reservasH2.find(r => parseInt(r.leito) === parseInt(leitoIrmao));
            
            // PRIMEIRO: Verificar se irmao esta OCUPADO
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Em uso' || dadosLeitoIrmao.status === 'ocupado' || dadosLeitoIrmao.status === 'Ocupado')) {
                const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
                
                // Se irmão NÃO tem isolamento → forçar "Não Isolamento" no leito atual
                if (!isolamentoIrmao || isolamentoIrmao === 'Não Isolamento' || isolamentoIrmao === 'Nao Isolamento') {
                    isolamentoPreDefinido = 'Não Isolamento';
                    isolamentoDisabled = true;
                    
                    if (dadosLeitoIrmao.genero) {
                        generoPreDefinido = dadosLeitoIrmao.genero;
                        generoDisabled = true;
                    }
                }
                
                // PRE-PREENCHER NUMERO BASE SE IRMAO OCUPADO
                const identificacaoIrmao = String(dadosLeitoIrmao.identificacaoLeito || dadosLeitoIrmao.identificacao_leito || '');
                if (identificacaoIrmao) {
                    // Extrair numero base (ex: "101-1" -> "101")
                    const partes = identificacaoIrmao.split('-');
                    if (partes.length > 0) {
                        numeroBasePreenchido = partes[0];
                    }
                }
            }
            // SEGUNDO: V7.0 - Verificar se irmao tem RESERVA
            else if (reservaLeitoIrmao) {
                const isolamentoReserva = reservaLeitoIrmao.isolamento || '';
                
                // Se reserva do irmão NÃO tem isolamento → forçar "Não Isolamento" no leito atual
                if (!isolamentoReserva || isolamentoReserva === 'Não Isolamento' || isolamentoReserva === 'Nao Isolamento' || isolamentoReserva.includes('Nao Isol')) {
                    isolamentoPreDefinido = 'Não Isolamento';
                    isolamentoDisabled = true;
                    
                    if (reservaLeitoIrmao.genero) {
                        generoPreDefinido = reservaLeitoIrmao.genero;
                        generoDisabled = true;
                        console.log('[V7.0 ADMISSÃO IRMAO H2] Genero herdado da reserva do irmão:', generoPreDefinido);
                    }
                }
                
                // PRE-PREENCHER NUMERO BASE SE IRMAO TEM RESERVA
                const identificacaoReserva = String(reservaLeitoIrmao.identificacaoLeito || '');
                if (identificacaoReserva) {
                    const partes = identificacaoReserva.split('-');
                    if (partes.length > 0) {
                        numeroBasePreenchido = partes[0];
                    }
                }
            }
        }
        
        // Definir sufixo padrão baseado no número do leito (par=3, ímpar=1)
        sufixoPreDefinido = (leitoNumero % 2 === 0) ? '3' : '1';
    }
    
    // LÓGICA DE LEITOS IRMÃOS - SANTA CLARA
    if (isSantaClaraEnfermaria) {
        const leitoIrmao = window.SANTA_CLARA_IRMAOS[leitoNumero];
        if (leitoIrmao) {
            const leitosHospital = window.hospitalData['H4']?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            // V7.0: TAMBEM verificar RESERVA do leito irmao
            const reservasH4 = (window.reservasData || []).filter(r => r.hospital === 'H4');
            const reservaLeitoIrmao = reservasH4.find(r => parseInt(r.leito) === parseInt(leitoIrmao));
            
            // PRIMEIRO: Verificar se irmao esta OCUPADO
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Em uso' || dadosLeitoIrmao.status === 'ocupado' || dadosLeitoIrmao.status === 'Ocupado')) {
                const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
                
                // Se irmão NÃO tem isolamento → forçar "Não Isolamento" no leito atual
                if (!isolamentoIrmao || isolamentoIrmao === 'Não Isolamento' || isolamentoIrmao === 'Nao Isolamento') {
                    isolamentoPreDefinido = 'Não Isolamento';
                    isolamentoDisabled = true;
                    
                    if (dadosLeitoIrmao.genero) {
                        generoPreDefinido = dadosLeitoIrmao.genero;
                        generoDisabled = true;
                    }
                }
                
                // PRE-PREENCHER NUMERO BASE SE IRMAO OCUPADO
                const identificacaoIrmao = String(dadosLeitoIrmao.identificacaoLeito || dadosLeitoIrmao.identificacao_leito || '');
                if (identificacaoIrmao) {
                    // Extrair numero base (ex: "201-A" -> "201")
                    const partes = identificacaoIrmao.split('-');
                    if (partes.length > 0) {
                        numeroBasePreenchido = partes[0];
                    }
                }
            }
            // SEGUNDO: V7.0 - Verificar se irmao tem RESERVA
            else if (reservaLeitoIrmao) {
                const isolamentoReserva = reservaLeitoIrmao.isolamento || '';
                
                // Se reserva do irmão NÃO tem isolamento → forçar "Não Isolamento" no leito atual
                if (!isolamentoReserva || isolamentoReserva === 'Não Isolamento' || isolamentoReserva === 'Nao Isolamento' || isolamentoReserva.includes('Nao Isol')) {
                    isolamentoPreDefinido = 'Não Isolamento';
                    isolamentoDisabled = true;
                    
                    if (reservaLeitoIrmao.genero) {
                        generoPreDefinido = reservaLeitoIrmao.genero;
                        generoDisabled = true;
                        console.log('[V7.0 ADMISSÃO IRMAO H4] Genero herdado da reserva do irmão:', generoPreDefinido);
                    }
                }
                
                // PRE-PREENCHER NUMERO BASE SE IRMAO TEM RESERVA
                const identificacaoReserva = String(reservaLeitoIrmao.identificacaoLeito || '');
                if (identificacaoReserva) {
                    const partes = identificacaoReserva.split('-');
                    if (partes.length > 0) {
                        numeroBasePreenchido = partes[0];
                    }
                }
            }
        }
        
        // Definir sufixo padrão baseado no número do leito (par=C, ímpar=A)
        sufixoPreDefinido = (leitoNumero % 2 === 0) ? 'C' : 'A';
    }
    
    // Buscar tipo estrutural do leito
    let isApartamentoFixo = false;
    let isEnfermariaFixa = false;
    
    // Para hospitais com tipos fixos (H2, H4), buscar tipo da estrutura
    if (hospitalId === 'H2' || hospitalId === 'H4') {
        const hospital = window.hospitalData && window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            const dadosLeito = hospital.leitos.find(l => parseInt(l.leito) === parseInt(leitoNumero));
            if (dadosLeito && dadosLeito.tipo) {
                const tipoUpper = dadosLeito.tipo.toUpperCase();
                isApartamentoFixo = tipoUpper.includes('APTO') || tipoUpper === 'APARTAMENTO';
                isEnfermariaFixa = tipoUpper.includes('ENF') || tipoUpper === 'ENFERMARIA';
            }
        }
        
        // Fallback: lógica antiga para contratuais
        if (!isApartamentoFixo && !isEnfermariaFixa) {
            if (hospitalId === 'H2') {
                isApartamentoFixo = (leitoNumero >= 1 && leitoNumero <= 20) || (leitoNumero >= 47 && leitoNumero <= 67);
                isEnfermariaFixa = (leitoNumero >= 21 && leitoNumero <= 46);
            } else if (hospitalId === 'H4') {
                isApartamentoFixo = ((leitoNumero >= 1 && leitoNumero <= 9) || (leitoNumero >= 28 && leitoNumero <= 57));
                isEnfermariaFixa = (leitoNumero >= 10 && leitoNumero <= 27);
            }
        }
    }
    
    // V7.4: Maxlength dinamico por hospital (H3=4, outros=3)
    const maxLen = window.MAXLENGTH_IDENTIFICACAO[hospitalId] || 3;
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff; font-family: 'Poppins', sans-serif;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                Admitir Paciente
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <div style="margin-bottom: 8px;">
                    <strong>Hospital:</strong> ${hospitalNome} | <strong>ID:</strong> ${idSequencial}${isHibrido ? ' | <strong>LEITO HÍBRIDO</strong>' : ''}
                </div>
            </div>
            
            <!-- LINHA 1: IDENTIFICAÇÃO | TIPO QUARTO | ISOLAMENTO -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px; white-space: nowrap;">Identificação do Leito <span style="color: #c86420;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                                <input id="admIdentificacaoNumero" type="text" value="${numeroBasePreenchido}" placeholder="Ex: 101" maxlength="${maxLen}" required ${numeroBasePreenchido ? 'readonly' : ''} oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: ${numeroBasePreenchido ? '#1f2937' : '#374151'}; color: ${numeroBasePreenchido ? '#9ca3af' : '#ffffff'}; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; ${numeroBasePreenchido ? 'cursor: not-allowed;' : ''}">
                                <select id="admIdentificacaoSufixo" required ${numeroBasePreenchido ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${numeroBasePreenchido ? '#1f2937' : '#374151'} !important; color: ${numeroBasePreenchido ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; ${numeroBasePreenchido ? 'cursor: not-allowed;' : ''}">
                                    <option value="1" ${sufixoPreDefinido === '1' ? 'selected' : ''}>1</option>
                                    <option value="3" ${sufixoPreDefinido === '3' ? 'selected' : ''}>3</option>
                                </select>
                               </div>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Número + Sufixo (1 ou 3)</div>`
                            : isSantaClaraEnfermaria
                            ? `<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                                <input id="admIdentificacaoNumero" type="text" value="${numeroBasePreenchido}" placeholder="Ex: 201" maxlength="${maxLen}" required ${numeroBasePreenchido ? 'readonly' : ''} oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: ${numeroBasePreenchido ? '#1f2937' : '#374151'}; color: ${numeroBasePreenchido ? '#9ca3af' : '#ffffff'}; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; ${numeroBasePreenchido ? 'cursor: not-allowed;' : ''}">
                                <select id="admIdentificacaoSufixo" required ${numeroBasePreenchido ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${numeroBasePreenchido ? '#1f2937' : '#374151'} !important; color: ${numeroBasePreenchido ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; ${numeroBasePreenchido ? 'cursor: not-allowed;' : ''}">
                                    <option value="A" ${sufixoPreDefinido === 'A' ? 'selected' : ''}>A</option>
                                    <option value="C" ${sufixoPreDefinido === 'C' ? 'selected' : ''}>C</option>
                                </select>
                               </div>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Número + Sufixo (A ou C)</div>`
                            : isHibrido
                            ? `<div id="admIdentificacaoContainer">
                                <input id="admIdentificacaoLeito" type="text" placeholder="Selecione o Tipo de Quarto" disabled style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; cursor: not-allowed;">
                               </div>
                               <div id="admIdentificacaoHint" style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Primeiro selecione o Tipo de Quarto</div>`
                            : `<input id="admIdentificacaoLeito" type="text" placeholder="Ex: 101, 202" maxlength="${maxLen}" required oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Apenas numeros</div>`
                        }
                    </div>
                    
                    
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Tipo de Quarto <span style="color: #c86420;">*</span></label>
                        ${isCruzAzulEnfermaria || isSantaClaraEnfermaria
                            ? `<select id="admTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed; font-family: 'Poppins', sans-serif;">
                                <option value="Enfermaria" selected>Enfermaria</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Tipo fixo (Enfermaria)</div>`
                            : isApartamentoFixo
                            ? `<select id="admTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed; font-family: 'Poppins', sans-serif;">
                                <option value="Apartamento" selected>Apartamento</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Tipo fixo (Apartamento)</div>`
                            : `<select id="admTipoQuarto" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <option value="">Selecionar...</option>
                                ${window.TIPO_QUARTO_OPTIONS.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                               </select>`
                        }
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Isolamento <span style="color: #c86420;">*</span></label>
                        <select id="admIsolamento" required ${isolamentoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${isolamentoDisabled ? '#1f2937' : '#374151'} !important; color: ${isolamentoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; ${isolamentoDisabled ? 'cursor: not-allowed;' : ''}">
                            ${isolamentoPreDefinido ? '' : '<option value="">Selecione...</option>'}
                            ${window.ISOLAMENTO_OPTIONS.map(opcao => `<option value="${opcao}" ${isolamentoPreDefinido === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                        </select>
                        ${isolamentoDisabled ? '<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">⚠️ Leito irmão ocupado sem isolamento</div>' : ''}
                    </div>
                </div>
            </div>
            
            <!-- LINHA 2: GÊNERO | REGIÃO | PREVISÃO ALTA -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Gênero <span style="color: #c86420;">*</span></label>
                        <select id="admSexo" required ${generoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${generoDisabled ? '#1f2937' : '#374151'} !important; color: ${generoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${generoPreDefinido 
                                ? `<option value="${generoPreDefinido}" selected>${generoPreDefinido}</option>`
                                : `<option value="">Selecionar...</option>
                                   ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}">${sexo}</option>`).join('')}`
                            }
                        </select>
                        ${generoDisabled ? '<div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Gênero definido pelo leito irmão</div>' : ''}
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Região <span style="color: #c86420;">*</span></label>
                        <select id="admRegiao" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            <option value="">Selecionar...</option>
                            ${window.REGIAO_OPTIONS.map(regiao => `<option value="${regiao}">${regiao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Previsão Alta</label>
                        <select id="admPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 3: INICIAIS, MATRÍCULA, IDADE -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Iniciais</label>
                    <input id="admNome" type="text" placeholder="Ex: ADR" maxlength="20" oninput="window.formatarIniciaisAutomatico(this)" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; letter-spacing: 2px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Matrícula</label>
                    <input id="admMatricula" type="text" placeholder="Ex: 0000000123-4" maxlength="12" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;" oninput="formatarMatriculaInput(this)" onblur="autoCompletarMatricula(this)">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Idade</label>
                    <select id="admIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Selecionar...</option>
                        ${window.IDADE_OPTIONS.map(idade => `<option value="${idade}">${idade} anos</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- LINHA 4: PPS | SPICT-BR | DIRETIVAS -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select id="admPPS" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Selecionar...</option>
                        ${window.PPS_OPTIONS.map(pps => `<option value="${pps}">${pps}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select id="admSPICT" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="nao_elegivel">Não elegível</option>
                        <option value="elegivel">Elegível</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Diretivas</label>
                    <select id="admDiretivas" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        ${window.DIRETIVAS_OPTIONS.map((opcao, index) => `<option value="${opcao}" ${index === 0 ? 'selected' : ''}>${opcao}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- CONCESSÕES COM BUSCA - VISUAL ANTIGO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        Concessões Previstas na Alta
                    </div>
                </div>
                
                <div style="position: relative; margin-bottom: 8px;">
                    <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; pointer-events: none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="searchConcessoes" placeholder="Digite para buscar... (ex: 'o2', 'banho')" style="width: 100%; padding: 10px 10px 10px 36px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 13px; font-family: 'Poppins', sans-serif;">
                </div>
                
                <div id="admConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px; font-family: 'Poppins', sans-serif;">
                            <input type="checkbox" value="${c}" style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- LINHAS DE CUIDADO COM BUSCA - VISUAL ANTIGO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        Linhas de Cuidado
                    </div>
                </div>
                
                <div style="position: relative; margin-bottom: 8px;">
                    <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; pointer-events: none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="searchLinhas" placeholder="Digite para buscar... (ex: 'cardiologia', 'geriatria')" style="width: 100%; padding: 10px 10px 10px 36px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 13px; font-family: 'Poppins', sans-serif;">
                </div>
                
                <div id="admLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(linha => `
                        <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px; font-family: 'Poppins', sans-serif;">
                            <input type="checkbox" value="${linha}" style="margin-right: 8px; accent-color: #60a5fa;">
                            <span>${linha}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- ANOTAÇÕES (800 CARACTERES) - VISUAL ANTIGO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        Anotações (800 caracteres)
                    </div>
                </div>
                
                <div style="position: relative;">
                    <textarea id="admAnotacoes" maxlength="800" rows="4" placeholder="Digite observações adicionais..." style="width: 100%; padding: 12px; background: rgba(255,255,255,0.03); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 13px; font-family: 'Poppins', sans-serif; resize: vertical;"></textarea>
                    <div id="admAnotacoesCount" style="position: absolute; bottom: 8px; right: 12px; font-size: 10px; color: rgba(255,255,255,0.5);">0/800</div>
                </div>
            </div>
            
            <!-- BOTÕES -->
            <div class="modal-buttons" style="display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">Cancelar</button>
                <button class="btn-salvar" style="padding: 12px 30px; background: #60a5fa; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">Salvar</button>
            </div>
        </div>
    `;
}

// =================== V7.0: FORMULÁRIO DE RESERVA ===================
// Igual ao formulário de admissão, mas com campos bloqueados em cinza
function createReservaForm(hospitalNome, leitoNumero, hospitalId, dadosLeito) {
    const idSequencial = String(leitoNumero).padStart(2, '0');
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    const isCruzAzulEnfermaria = (hospitalId === 'H2') && (window.CRUZ_AZUL_IRMAOS[leitoNumero] !== undefined);
    const isSantaClaraEnfermaria = (hospitalId === 'H4') && (window.SANTA_CLARA_IRMAOS[leitoNumero] !== undefined);
    
    // Verificar leito irmão para pré-definir gênero/isolamento
    let generoPreDefinido = null;
    let generoDisabled = false;
    let isolamentoPreDefinido = null;
    let isolamentoDisabled = false;
    let numeroBasePreenchido = '';
    let sufixoPreDefinido = '';
    let sufixoDisabled = false;
    
    // V7.0: Se é um bloqueio de irmão (vaga flutuante), já vem com gênero restrito
    if (dadosLeito && dadosLeito._isBloqueioIrmao && dadosLeito._generoRestrito) {
        generoPreDefinido = dadosLeito._generoRestrito;
        generoDisabled = true;
        isolamentoPreDefinido = 'Não Isolamento';
        isolamentoDisabled = true;
        
        // Pré-preencher identificação se tiver
        const identificacaoLeito = String(dadosLeito.identificacaoLeito || dadosLeito.identificacao_leito || '');
        if (identificacaoLeito && identificacaoLeito.includes('-')) {
            const partes = identificacaoLeito.split('-');
            numeroBasePreenchido = partes[0];
            sufixoPreDefinido = partes[1];
        }
        
        console.log('[V7.0 BLOQUEIO IRMAO] Genero restrito no modal de reserva:', generoPreDefinido);
    }
    
    // Lógica de leitos irmãos H2
    if (isCruzAzulEnfermaria) {
        const leitoIrmao = window.CRUZ_AZUL_IRMAOS[leitoNumero];
        if (leitoIrmao) {
            const leitosHospital = window.hospitalData['H2']?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            // V7.0: TAMBEM verificar RESERVA do leito irmao
            const reservasH2 = (window.reservasData || []).filter(r => r.hospital === 'H2');
            const reservaLeitoIrmao = reservasH2.find(r => parseInt(r.leito) === parseInt(leitoIrmao));
            
            // PRIMEIRO: Verificar se irmao esta OCUPADO
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Ocupado' || dadosLeitoIrmao.status === 'ocupado')) {
                const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
                if (!isolamentoIrmao || isolamentoIrmao === 'Não Isolamento' || isolamentoIrmao === 'Nao Isolamento') {
                    isolamentoPreDefinido = 'Não Isolamento';
                    isolamentoDisabled = true;
                    if (dadosLeitoIrmao.genero) {
                        generoPreDefinido = dadosLeitoIrmao.genero;
                        generoDisabled = true;
                    }
                }
                const identificacaoIrmao = String(dadosLeitoIrmao.identificacaoLeito || dadosLeitoIrmao.identificacao_leito || '');
                if (identificacaoIrmao && identificacaoIrmao.includes('-')) {
                    const partes = identificacaoIrmao.split('-');
                    numeroBasePreenchido = partes[0];
                    // V7.6: Definir sufixo alternativo ao do irmão ocupado
                    if (partes[1]) {
                        sufixoPreDefinido = (partes[1] === '1') ? '3' : '1';
                        sufixoDisabled = true;
                        console.log('[V7.6 SUFIXO H2] Irmão ocupado com sufixo ' + partes[1] + ', definindo ' + sufixoPreDefinido);
                    }
                }
            }
            // SEGUNDO: V7.0 - Verificar se irmao tem RESERVA
            else if (reservaLeitoIrmao) {
                const isolamentoReserva = reservaLeitoIrmao.isolamento || '';
                if (!isolamentoReserva || isolamentoReserva === 'Não Isolamento' || isolamentoReserva === 'Nao Isolamento' || isolamentoReserva.includes('Nao Isol')) {
                    isolamentoPreDefinido = 'Não Isolamento';
                    isolamentoDisabled = true;
                    if (reservaLeitoIrmao.genero) {
                        generoPreDefinido = reservaLeitoIrmao.genero;
                        generoDisabled = true;
                        console.log('[V7.0 RESERVA IRMAO H2] Genero herdado da reserva do irmão:', generoPreDefinido);
                    }
                }
                const identificacaoReserva = String(reservaLeitoIrmao.identificacaoLeito || '');
                if (identificacaoReserva && identificacaoReserva.includes('-')) {
                    const partes = identificacaoReserva.split('-');
                    numeroBasePreenchido = partes[0];
                    // V7.6: Definir sufixo alternativo ao da reserva do irmão
                    if (partes[1]) {
                        sufixoPreDefinido = (partes[1] === '1') ? '3' : '1';
                        sufixoDisabled = true;
                        console.log('[V7.6 SUFIXO H2] Irmao reservado com sufixo ' + partes[1] + ', definindo ' + sufixoPreDefinido);
                    }
                }
            }
        }
        // V7.6: Só definir por par/ímpar se sufixo não foi herdado do irmão
        if (!sufixoDisabled) {
            sufixoPreDefinido = (leitoNumero % 2 === 0) ? '3' : '1';
        }
    }
    
    // Logica de leitos irmaos H4
    if (isSantaClaraEnfermaria) {
        const leitoIrmao = window.SANTA_CLARA_IRMAOS[leitoNumero];
        if (leitoIrmao) {
            const leitosHospital = window.hospitalData['H4']?.leitos || [];
            const dadosLeitoIrmao = leitosHospital.find(l => l.leito == leitoIrmao);
            
            // V7.0: TAMBEM verificar RESERVA do leito irmao
            const reservasH4 = (window.reservasData || []).filter(r => r.hospital === 'H4');
            const reservaLeitoIrmao = reservasH4.find(r => parseInt(r.leito) === parseInt(leitoIrmao));
            
            // PRIMEIRO: Verificar se irmao esta OCUPADO
            if (dadosLeitoIrmao && (dadosLeitoIrmao.status === 'Ocupado' || dadosLeitoIrmao.status === 'ocupado')) {
                const isolamentoIrmao = dadosLeitoIrmao.isolamento || '';
                if (!isolamentoIrmao || isolamentoIrmao === 'Nao Isolamento' || isolamentoIrmao === 'Não Isolamento') {
                    isolamentoPreDefinido = 'Nao Isolamento';
                    isolamentoDisabled = true;
                    if (dadosLeitoIrmao.genero) {
                        generoPreDefinido = dadosLeitoIrmao.genero;
                        generoDisabled = true;
                    }
                }
                const identificacaoIrmao2 = String(dadosLeitoIrmao.identificacaoLeito || dadosLeitoIrmao.identificacao_leito || '');
                if (identificacaoIrmao2 && identificacaoIrmao2.includes('-')) {
                    const partes = identificacaoIrmao2.split('-');
                    numeroBasePreenchido = partes[0];
                    // V7.6: Definir sufixo alternativo ao do irmão ocupado
                    if (partes[1]) {
                        sufixoPreDefinido = (partes[1] === 'A') ? 'C' : 'A';
                        sufixoDisabled = true;
                        console.log('[V7.6 SUFIXO H4] Irmão ocupado com sufixo ' + partes[1] + ', definindo ' + sufixoPreDefinido);
                    }
                }
            }
            // SEGUNDO: V7.0 - Verificar se irmao tem RESERVA
            else if (reservaLeitoIrmao) {
                const isolamentoReserva = reservaLeitoIrmao.isolamento || '';
                if (!isolamentoReserva || isolamentoReserva === 'Nao Isolamento' || isolamentoReserva === 'Não Isolamento' || isolamentoReserva.includes('Nao Isol')) {
                    isolamentoPreDefinido = 'Nao Isolamento';
                    isolamentoDisabled = true;
                    if (reservaLeitoIrmao.genero) {
                        generoPreDefinido = reservaLeitoIrmao.genero;
                        generoDisabled = true;
                        console.log('[V7.0 RESERVA IRMAO H4] Genero herdado da reserva do irmão:', generoPreDefinido);
                    }
                }
                const identificacaoReserva = String(reservaLeitoIrmao.identificacaoLeito || '');
                if (identificacaoReserva && identificacaoReserva.includes('-')) {
                    const partes = identificacaoReserva.split('-');
                    numeroBasePreenchido = partes[0];
                    // V7.6: Definir sufixo alternativo ao da reserva do irmão
                    if (partes[1]) {
                        sufixoPreDefinido = (partes[1] === 'A') ? 'C' : 'A';
                        sufixoDisabled = true;
                        console.log('[V7.6 SUFIXO H4] Irmao reservado com sufixo ' + partes[1] + ', definindo ' + sufixoPreDefinido);
                    }
                }
            }
        }
        // V7.6: Só definir por par/ímpar se sufixo não foi herdado do irmão
        if (!sufixoDisabled) {
            sufixoPreDefinido = (leitoNumero % 2 === 0) ? 'C' : 'A';
        }
    }
    
    // Tipo fixo para H2/H4
    let isApartamentoFixo = false;
    let isEnfermariaFixa = isCruzAzulEnfermaria || isSantaClaraEnfermaria;
    if (hospitalId === 'H2' || hospitalId === 'H4') {
        const hospital = window.hospitalData && window.hospitalData[hospitalId];
        if (hospital && hospital.leitos) {
            const dadosLeitoAtual = hospital.leitos.find(l => parseInt(l.leito) === parseInt(leitoNumero));
            if (dadosLeitoAtual && dadosLeitoAtual.tipo) {
                const tipoUpper = dadosLeitoAtual.tipo.toUpperCase();
                isApartamentoFixo = tipoUpper.includes('APTO') || tipoUpper === 'APARTAMENTO';
            }
        }
    }
    
    const estiloCampoBloqueado = 'background: #1f2937 !important; color: #6b7280 !important; cursor: not-allowed;';
    
    // V7.4: Maxlength dinamico por hospital (H3=4, outros=3)
    const maxLen = window.MAXLENGTH_IDENTIFICACAO[hospitalId] || 3;
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff; font-family: 'Poppins', sans-serif;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #f59a1d; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                Reservar Leito
            </h2>
            
            <div style="text-align: center; margin-bottom: 20px; padding: 12px; background: rgba(245,154,29,0.1); border: 1px solid rgba(245,154,29,0.3); border-radius: 8px;">
                <div style="color: #f59a1d; font-size: 12px;">
                    <strong>Reserva de Leito:</strong> Preencha apenas os campos obrigatorios. Os demais campos serao preenchidos no momento da admissao.
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>Leito:</strong> ${idSequencial}${isHibrido ? ' | <strong>LEITO HÍBRIDO</strong>' : ''}
            </div>
            
            <!-- LINHA 1: IDENTIFICAÇÃO | TIPO QUARTO | ISOLAMENTO (V7.4: ordem invertida) -->
            <div style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Identificacao do Leito <span style="color: #c86420;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                                <input id="resIdentificacaoNumero" type="text" value="${numeroBasePreenchido}" placeholder="Numero" maxlength="${maxLen}" required ${numeroBasePreenchido ? 'readonly' : ''} oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: ${numeroBasePreenchido ? '#1f2937' : '#374151'}; color: ${numeroBasePreenchido ? '#9ca3af' : '#ffffff'}; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <select id="resIdentificacaoSufixo" required ${sufixoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${sufixoDisabled ? '#1f2937' : '#374151'} !important; color: ${sufixoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                    <option value="1" ${sufixoPreDefinido === '1' ? 'selected' : ''}>1</option>
                                    <option value="3" ${sufixoPreDefinido === '3' ? 'selected' : ''}>3</option>
                                </select>
                               </div>`
                            : isSantaClaraEnfermaria
                            ? `<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                                <input id="resIdentificacaoNumero" type="text" value="${numeroBasePreenchido}" placeholder="Numero" maxlength="${maxLen}" required ${numeroBasePreenchido ? 'readonly' : ''} oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: ${numeroBasePreenchido ? '#1f2937' : '#374151'}; color: ${numeroBasePreenchido ? '#9ca3af' : '#ffffff'}; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <select id="resIdentificacaoSufixo" required ${sufixoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${sufixoDisabled ? '#1f2937' : '#374151'} !important; color: ${sufixoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                    <option value="A" ${sufixoPreDefinido === 'A' ? 'selected' : ''}>A</option>
                                    <option value="C" ${sufixoPreDefinido === 'C' ? 'selected' : ''}>C</option>
                                </select>
                               </div>`
                            : isApartamentoFixo
                            ? `<input id="resIdentificacaoLeito" type="text" placeholder="Numero do quarto" maxlength="${maxLen}" required oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">`
                            : isHibrido
                            ? `<div id="resIdentificacaoContainer">
                                <input id="resIdentificacaoLeito" type="text" placeholder="Selecione o Tipo de Quarto" disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                               </div>`
                            : `<input id="resIdentificacaoLeito" type="text" placeholder="Numero do quarto" maxlength="${maxLen}" required oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">`
                        }
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Tipo de Quarto <span style="color: #c86420;">*</span></label>
                        ${isCruzAzulEnfermaria || isSantaClaraEnfermaria || isEnfermariaFixa
                            ? `<select id="resTipoQuarto" disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <option value="Enfermaria" selected>Enfermaria</option>
                               </select>`
                            : isApartamentoFixo
                            ? `<select id="resTipoQuarto" disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <option value="Apartamento" selected>Apartamento</option>
                               </select>`
                            : `<select id="resTipoQuarto" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <option value="">Selecionar...</option>
                                ${window.TIPO_QUARTO_OPTIONS.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                               </select>`
                        }
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Isolamento <span style="color: #c86420;">*</span></label>
                        <select id="resIsolamento" required ${isolamentoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${isolamentoDisabled ? '#1f2937' : '#374151'} !important; color: ${isolamentoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${isolamentoPreDefinido ? '' : '<option value="">Selecione...</option>'}
                            ${window.ISOLAMENTO_OPTIONS.map(opcao => `<option value="${opcao}" ${isolamentoPreDefinido === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 2: GÊNERO | REGIÃO (bloqueado) | PREVISÃO ALTA (bloqueado) -->
            <div style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Genero <span style="color: #c86420;">*</span></label>
                        <select id="resSexo" required ${generoDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; background: ${generoDisabled ? '#1f2937' : '#374151'} !important; color: ${generoDisabled ? '#9ca3af' : '#ffffff'} !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${generoPreDefinido 
                                ? `<option value="${generoPreDefinido}" selected>${generoPreDefinido}</option>`
                                : `<option value="">Selecionar...</option>
                                   ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}">${sexo}</option>`).join('')}`
                            }
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600;">Regiao</label>
                        <select disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            <option value="">Preenchido na admissao</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600;">Previsao Alta</label>
                        <select disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            <option value="">Preenchido na admissao</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 3: INICIAIS, MATRÍCULA, IDADE -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Iniciais (opcional)</label>
                    <input id="resNome" type="text" placeholder="Ex: ABC" maxlength="20" oninput="window.formatarIniciaisAutomatico(this)" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; letter-spacing: 2px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Matricula (opcional)</label>
                    <input id="resMatricula" type="text" placeholder="Ex: 0000000123-4" maxlength="12" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;" oninput="formatarMatriculaInput(this)" onblur="autoCompletarMatricula(this)">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Idade (opcional)</label>
                    <select id="resIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Ex: 75</option>
                        ${window.IDADE_OPTIONS.map(idade => `<option value="${idade}">${idade} anos</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- LINHA 4: PPS | SPICT-BR | DIRETIVAS (todos bloqueados) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600;">PPS</label>
                    <select disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Preenchido na admissao</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600;">SPICT-BR</label>
                    <select disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Preenchido na admissao</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600;">Diretivas</label>
                    <select disabled style="width: 100%; padding: 12px; ${estiloCampoBloqueado} border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Preenchido na admissao</option>
                    </select>
                </div>
            </div>
            
            <!-- AVISO CAMPOS BLOQUEADOS -->
            <div style="background: rgba(107,114,128,0.2); border: 1px solid rgba(107,114,128,0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <div style="color: #9ca3af; font-size: 12px; text-align: center;">
                    <strong>Campos preenchidos na admissao:</strong><br>
                    PPS, SPICT-BR, Complexidade, Previsao de Alta, Regiao, Diretivas Antecipadas, Concessoes, Linhas de Cuidado, Anotacoes
                </div>
            </div>
            
            <!-- BOTÕES -->
            <div class="modal-buttons" style="display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">Cancelar</button>
                <button class="btn-salvar-reserva" style="padding: 12px 30px; background: #f59a1d; color: #131b2e; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">RESERVAR</button>
            </div>
        </div>
    `;
}

// =================== V7.0: EVENT LISTENERS DO MODAL DE RESERVA ===================
function setupReservaModalEventListeners(modal) {
    const hospitalId = window.currentHospital;
    const isHibrido = window.HOSPITAIS_HIBRIDOS && window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    // V7.4: Maxlength dinamico por hospital (H3=4, outros=3)
    const maxLen = window.MAXLENGTH_IDENTIFICACAO[hospitalId] || 3;
    
    // V7.4: Campo dinâmico para híbridos com dropdown de sufixo por hospital
    const tipoQuartoSelect = modal.querySelector('#resTipoQuarto');
    const identificacaoContainer = modal.querySelector('#resIdentificacaoContainer');
    
    if (tipoQuartoSelect && identificacaoContainer && !tipoQuartoSelect.disabled) {
        tipoQuartoSelect.addEventListener('change', function() {
            const tipoSelecionado = this.value;
            const sufixosEnf = window.SUFIXOS_ENFERMARIA[hospitalId] || ['A', 'B'];
            const sufixosApto = window.SUFIXOS_APARTAMENTO[hospitalId] || null;
            
            if (!tipoSelecionado) {
                identificacaoContainer.innerHTML = `<input id="resIdentificacaoLeito" type="text" placeholder="Selecione o Tipo de Quarto" disabled style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; cursor: not-allowed;">`;
            } else if (tipoSelecionado === 'Enfermaria') {
                // V7.4: Dropdown de sufixo com opções do hospital
                const sufixoOptions = sufixosEnf.map(s => `<option value="${s}">${s}</option>`).join('');
                identificacaoContainer.innerHTML = `
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                        <input id="resIdentificacaoNumero" type="text" placeholder="Numero" maxlength="${maxLen}" required oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <select id="resIdentificacaoSufixo" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${sufixoOptions}
                        </select>
                    </div>`;
            } else {
                // Apartamento
                if (sufixosApto && sufixosApto.length > 0) {
                    // H3/H7: sufixo fixo "-1"
                    identificacaoContainer.innerHTML = `
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                            <input id="resIdentificacaoNumero" type="text" placeholder="Numero" maxlength="${maxLen}" required oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            <input id="resIdentificacaoSufixoFixo" type="text" value="${sufixosApto[0]}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; text-align: center;">
                        </div>`;
                } else {
                    // Campo livre para número
                    identificacaoContainer.innerHTML = `<input id="resIdentificacaoLeito" type="text" placeholder="Numero do quarto" maxlength="${maxLen}" required oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">`;
                }
            }
        });
    }
    
    // Botão Cancelar
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            modal.remove();
        });
    }
    
    // Click fora do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Botao Salvar Reserva
    const btnSalvar = modal.querySelector('.btn-salvar-reserva');
    if (btnSalvar) {
        console.log('[V7.0 RESERVA] Configurando evento do botao Salvar Reserva');
        btnSalvar.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('[V7.0 RESERVA] Botao Salvar Reserva clicado');
            
            // V7.0: TUDO dentro de try-catch para evitar Promise rejeitada
            try {
                const leitoNumero = window.selectedLeito;
                console.log('[V7.0 RESERVA] leitoNumero:', leitoNumero, 'hospitalId:', hospitalId);
                
                // Verificar variaveis globais com seguranca
                const cruzAzulIrmaos = window.CRUZ_AZUL_IRMAOS || {};
                const santaClaraIrmaos = window.SANTA_CLARA_IRMAOS || {};
                
                const isCruzAzulEnfermaria = (hospitalId === 'H2') && (cruzAzulIrmaos[leitoNumero] !== undefined);
                const isSantaClaraEnfermaria = (hospitalId === 'H4') && (santaClaraIrmaos[leitoNumero] !== undefined);
                
                console.log('[V7.0 RESERVA] isCruzAzulEnfermaria:', isCruzAzulEnfermaria, 'isSantaClaraEnfermaria:', isSantaClaraEnfermaria);
                
                // Coletar dados
                const tipoQuarto = modal.querySelector('#resTipoQuarto')?.value || '';
                const isolamento = modal.querySelector('#resIsolamento')?.value || '';
                const genero = modal.querySelector('#resSexo')?.value || '';
                const iniciais = modal.querySelector('#resNome')?.value?.trim() || '';
                const matricula = modal.querySelector('#resMatricula')?.value?.trim().replace(/-/g, '') || '';
                const idade = modal.querySelector('#resIdade')?.value || '';
                
                console.log('[V7.0 RESERVA] Dados coletados:', { tipoQuarto, isolamento, genero, iniciais, matricula, idade });
                
                // V7.4: Montar identificacao com dropdown de sufixo
                let identificacaoLeito = '';
                if (isCruzAzulEnfermaria || isSantaClaraEnfermaria) {
                    const numero = modal.querySelector('#resIdentificacaoNumero')?.value?.trim() || '';
                    const sufixo = modal.querySelector('#resIdentificacaoSufixo')?.value || '';
                    identificacaoLeito = numero && sufixo ? `${numero}-${sufixo}` : numero;
                    console.log('[V7.0 RESERVA] Identificacao Cruz Azul/Santa Clara:', numero, sufixo);
                } else if (isHibrido && tipoQuarto === 'Enfermaria') {
                    // V7.4: Usar dropdown de sufixo
                    const numero = modal.querySelector('#resIdentificacaoNumero')?.value?.trim() || '';
                    const sufixo = modal.querySelector('#resIdentificacaoSufixo')?.value || '';
                    identificacaoLeito = numero && sufixo ? `${numero}-${sufixo}` : numero;
                    console.log('[V7.4 RESERVA] Identificacao Hibrido Enfermaria:', numero, sufixo);
                } else if (isHibrido && tipoQuarto === 'Apartamento') {
                    // V7.4: Verificar se tem sufixo fixo (H3/H7)
                    const numeroEl = modal.querySelector('#resIdentificacaoNumero');
                    const sufixoFixoEl = modal.querySelector('#resIdentificacaoSufixoFixo');
                    const leitoEl = modal.querySelector('#resIdentificacaoLeito');
                    
                    if (numeroEl && sufixoFixoEl) {
                        const numero = numeroEl.value?.trim() || '';
                        const sufixo = sufixoFixoEl.value || '';
                        identificacaoLeito = numero && sufixo ? `${numero}-${sufixo}` : numero;
                        console.log('[V7.4 RESERVA] Identificacao Hibrido Apartamento com sufixo:', numero, sufixo);
                    } else if (leitoEl) {
                        identificacaoLeito = leitoEl.value?.trim() || '';
                        console.log('[V7.4 RESERVA] Identificacao Hibrido Apartamento simples:', identificacaoLeito);
                    }
                } else {
                    identificacaoLeito = modal.querySelector('#resIdentificacaoLeito')?.value?.trim() || '';
                    console.log('[V7.0 RESERVA] Identificacao simples:', identificacaoLeito);
                }
                
                console.log('[V7.0 RESERVA] identificacaoLeito final:', identificacaoLeito);
                
                // V7.4: Calcular identificacao do leito irmao para H2/H4 enfermaria
                let identificacaoIrmao = '';
                let leitoIrmao = '';
                
                if (isCruzAzulEnfermaria) {
                    leitoIrmao = cruzAzulIrmaos[leitoNumero];
                    if (leitoIrmao && identificacaoLeito && identificacaoLeito.includes('-')) {
                        const partes = identificacaoLeito.split('-');
                        const numero = partes[0];
                        const sufixo = partes[1];
                        // Alternar sufixo: 1 -> 3, 3 -> 1
                        const sufixoIrmao = (sufixo === '1') ? '3' : '1';
                        identificacaoIrmao = `${numero}-${sufixoIrmao}`;
                        console.log('[V7.4 RESERVA] Leito irmao H2:', leitoIrmao, 'Identificacao irmao:', identificacaoIrmao);
                    }
                } else if (isSantaClaraEnfermaria) {
                    leitoIrmao = santaClaraIrmaos[leitoNumero];
                    if (leitoIrmao && identificacaoLeito && identificacaoLeito.includes('-')) {
                        const partes = identificacaoLeito.split('-');
                        const numero = partes[0];
                        const sufixo = partes[1];
                        // Alternar sufixo: A -> C, C -> A
                        const sufixoIrmao = (sufixo === 'A') ? 'C' : 'A';
                        identificacaoIrmao = `${numero}-${sufixoIrmao}`;
                        console.log('[V7.4 RESERVA] Leito irmao H4:', leitoIrmao, 'Identificacao irmao:', identificacaoIrmao);
                    }
                }
                
                // Validacoes
                if (isHibrido && !tipoQuarto) {
                    showErrorMessage('Selecione o Tipo de Quarto');
                    return;
                }
                if (!identificacaoLeito) {
                    showErrorMessage('Preencha a Identificacao do Leito');
                    return;
                }
                if (!isolamento) {
                    showErrorMessage('Selecione o Isolamento');
                    return;
                }
                if (!genero) {
                    showErrorMessage('Selecione o Genero');
                    return;
                }
                
                // V7.0: Validar duplicidade de identificacao do leito
                console.log('[V7.0 RESERVA] Validando duplicidade de identificacao...');
                const validacaoId = validarIdentificacaoDuplicada(hospitalId, identificacaoLeito);
                if (!validacaoId.valido) {
                    showErrorMessage(validacaoId.mensagem);
                    return;
                }
                
                // V7.0: Validar duplicidade de matricula (se preenchida)
                if (matricula) {
                    console.log('[V7.0 RESERVA] Validando duplicidade de matricula...');
                    const validacaoMat = validarMatriculaDuplicada(hospitalId, matricula);
                    if (!validacaoMat.valido) {
                        showErrorMessage(validacaoMat.mensagem);
                        return;
                    }
                }
                
                // Salvar
                const originalText = btnSalvar.innerHTML;
                btnSalvar.innerHTML = 'SALVANDO...';
                btnSalvar.disabled = true;
                
                // V7.4: Mostrar loading overlay
                window.showLoadingOverlay('Salvando reserva...');
                
                console.log('[V7.0 RESERVA] Enviando para API...');
                
                // Usar GET com parametros na URL (evita CORS)
                const params = new URLSearchParams({
                    action: 'reservar',
                    hospital: hospitalId,
                    leito: leitoNumero,
                    tipo: tipoQuarto || '',
                    identificacaoLeito: identificacaoLeito,
                    isolamento: isolamento,
                    genero: genero,
                    iniciais: iniciais.replace(/\s/g, ''),
                    matricula: matricula,
                    idade: idade || '',
                    // V7.4: Dados do leito irmao (para criar segunda linha)
                    leitoIrmão: leitoIrmao || '',
                    identificacaoIrmão: identificacaoIrmao || ''
                });
                
                const urlCompleta = window.API_URL + '?' + params.toString();
                console.log('[V7.0 RESERVA] URL:', urlCompleta);
                
                const response = await fetch(urlCompleta, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                
                console.log('[V7.0 RESERVA] Response status:', response.status);
                const result = await response.json();
                console.log('[V7.0 RESERVA] Result:', result);
                
                if (result.ok || result.success) {
                    modal.remove();
                    showSuccessMessage('Leito reservado com sucesso!');
                    
                    // V7.0: Forçar atualização completa dos cards
                    console.log('[V7.0 RESERVA] Reserva salva, forçando atualização...');
                    
                    // Guardar reserva local antes de recarregar
                    const reservaLocal = {
                        hospital: hospitalId,
                        leito: leitoNumero,
                        tipo: tipoQuarto,
                        identificacaoLeito: String(identificacaoLeito || ''),
                        isolamento: isolamento,
                        genero: genero,
                        iniciais: String(iniciais || '').replace(/\s/g, ''),
                        matricula: String(matricula || ''),
                        idade: idade,
                        linha: result.linha || result.data?.linha
                    };
                    
                    if (window.loadHospitalData) {
                        await window.loadHospitalData();
                    }
                    
                    // Nao re-adicionar reserva local - loadHospitalData ja carrega do backend
                    
                    if (window.renderCards && window.currentHospital) {
                        window.renderCards(window.currentHospital);
                    }
                    
                    // V7.4: Esconder loading apos sucesso
                    window.hideLoadingOverlay();
                } else {
                    // V7.4: Esconder loading antes de mostrar erro
                    window.hideLoadingOverlay();
                    btnSalvar.innerHTML = originalText;
                    btnSalvar.disabled = false;
                    throw new Error(result.message || result.error || 'Erro ao reservar leito');
                }
            } catch (error) {
                // V7.4: Esconder loading em caso de erro
                window.hideLoadingOverlay();
                console.error('[V7.0 RESERVA] ERRO:', error);
                const btnSalvarErr = modal.querySelector('.btn-salvar-reserva');
                if (btnSalvarErr) {
                    btnSalvarErr.innerHTML = 'RESERVAR';
                    btnSalvarErr.disabled = false;
                }
                showErrorMessage('Erro ao reservar: ' + (error.message || 'Erro desconhecido'));
            }
        });
    } else {
        console.error('[V7.0 RESERVA] ERRO: Botão .btn-salvar-reserva NÃO encontrado no modal!');
    }
}

// =================== FORMULÁRIO DE ATUALIZAÇÃO - CORRIGIDO ===================
function createAtualizacaoForm(hospitalNome, leitoNumero, dadosLeito) {
    const tempoInternacao = dadosLeito?.admAt ? calcularTempoInternacao(dadosLeito.admAt) : '';
    const iniciais = dadosLeito?.nome ? dadosLeito.nome.trim() : '';
    const idSequencial = String(leitoNumero).padStart(2, '0');
    
    const concessoesAtuais = Array.isArray(dadosLeito?.concessoes) ? dadosLeito.concessoes : [];
    
    let isolamentoAtual = dadosLeito?.isolamento || 'Não Isolamento';
    const isolamentoLower = isolamentoAtual.toLowerCase().trim();
    
    if (isolamentoLower === 'isolamento de contato' || isolamentoLower === 'isolamento contato') {
        isolamentoAtual = 'Isolamento de Contato';
    } else if (isolamentoLower === 'isolamento respiratorio' || isolamentoLower === 'isolamento respiratório') {
        isolamentoAtual = 'Isolamento Respiratório';
    } else if (isolamentoLower === 'nao isolamento' || isolamentoLower === 'não isolamento' || isolamentoLower.includes('nao isol')) {
        isolamentoAtual = 'Não Isolamento';
    }
    
    const hospitalId = window.currentHospital;
    // ✅ Verificar diretamente nos mapas de irmãos (sem depender de função externa)
    const isCruzAzulEnfermaria = (hospitalId === 'H2') && (leitoNumero in window.CRUZ_AZUL_IRMAOS);
    const isSantaClaraEnfermaria = (hospitalId === 'H4') && (leitoNumero in window.SANTA_CLARA_IRMAOS);
    const isCruzAzulApartamento = (hospitalId === 'H2' && leitoNumero >= 1 && leitoNumero <= 20);
    const isApartamentoFixo = isCruzAzulApartamento;
    
    let identificacaoAtual = String(dadosLeito?.identificacaoLeito || 
                        dadosLeito?.identificacao_leito || 
                        '');
    
    let leitoDisplay = identificacaoAtual.trim() 
        ? identificacaoAtual.trim().toUpperCase()
        : `LEITO ${leitoNumero}`;
    
    const regiaoAtual = dadosLeito?.regiao || '';
    const sexoAtual = dadosLeito?.genero || '';
    const diretivasAtual = dadosLeito?.diretivas || 'Não se aplica';
    const admissaoData = dadosLeito?.admAt || '';
    
    const isHibrido = window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    const tipoAtual = dadosLeito?.categoriaEscolhida || '';
    
    // V7.4: Maxlength dinamico por hospital (H3=4, outros=3)
    const maxLen = window.MAXLENGTH_IDENTIFICACAO[hospitalId] || 3;
    
    const matriculaAtual = dadosLeito?.matricula || '';
    const matriculaFormatada = formatarMatriculaExibicao(matriculaAtual);
    
    const idadeAtual = dadosLeito?.idade || '';
    const ppsAtual = dadosLeito?.pps || '';
    const spictAtual = dadosLeito?.spict || 'nao_elegivel';
    
    // V7.7: Normalizar valor de Previsão de Alta (valores legados)
    let prevAltaAtual = dadosLeito?.prevAlta || 'Sem Previsão';
    if (prevAltaAtual === 'SP' || prevAltaAtual.toLowerCase() === 'sp') {
        prevAltaAtual = 'Sem Previsão';
    } else if (prevAltaAtual === 'Sem Previsao') {
        prevAltaAtual = 'Sem Previsão';
    }
    
    const anotacoesAtual = dadosLeito?.anotacoes || '';
    
    return `
        <div class="modal-content" style="background: #1a1f2e; border-radius: 12px; padding: 30px; max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; color: #ffffff; font-family: 'Poppins', sans-serif;">
            <h2 style="margin: 0 0 20px 0; text-align: center; color: #60a5fa; font-size: 24px; font-weight: 700; text-transform: uppercase;">
                Atualizar Paciente
            </h2>
            
            <div style="text-align: center; margin-bottom: 30px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;">
                <strong>Hospital:</strong> ${hospitalNome} | <strong>ID:</strong> ${idSequencial} | <strong>Leito:</strong> ${leitoDisplay}
            </div>
            
            <!-- LINHA 1: IDENTIFICAÇÃO | TIPO QUARTO | ISOLAMENTO -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; white-space: nowrap;">Identificação do Leito <span style="color: #c86420;">*</span></label>
                        ${(isCruzAzulEnfermaria || isSantaClaraEnfermaria) 
                            ? `<input id="updIdentificacaoLeito" type="text" value="${identificacaoAtual}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed; font-family: 'Poppins', sans-serif;">`
                            : `<input id="updIdentificacaoLeito" type="text" value="${identificacaoAtual}" placeholder="Ex: 101, 202" maxlength="${maxLen}" required style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">`
                        }
                        ${(isCruzAzulEnfermaria || isSantaClaraEnfermaria) ? '<div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Identificação fixa</div>' : '<div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Apenas numeros</div>'}
                    </div>
                    
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Tipo de Quarto <span style="color: #c86420;">*</span></label>
                        ${isCruzAzulEnfermaria 
                            ? `<select id="updTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed; font-family: 'Poppins', sans-serif;">
                                <option value="Enfermaria" selected>Enfermaria</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Tipo fixo (Enfermaria)</div>`
                            : isApartamentoFixo
                            ? `<select id="updTipoQuarto" disabled style="width: 100%; padding: 12px; background: #1f2937 !important; color: #9ca3af !important; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; cursor: not-allowed; font-family: 'Poppins', sans-serif;">
                                <option value="Apartamento" selected>Apartamento</option>
                               </select>
                               <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 3px;">Tipo fixo (Apartamento)</div>`
                            : `<select id="updTipoQuarto" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                                <option value="">Selecionar...</option>
                                ${window.TIPO_QUARTO_OPTIONS.map(tipo => `<option value="${tipo}" ${tipoAtual === tipo ? 'selected' : ''}>${tipo}</option>`).join('')}
                               </select>`
                        }
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Isolamento <span style="color: #c86420;">*</span></label>
                        <select id="updIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${window.ISOLAMENTO_OPTIONS.map(opcao => `<option value="${opcao}" ${isolamentoAtual === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 2: GÊNERO | REGIÃO | PREVISÃO ALTA -->
            <div style="margin-bottom: 20px;">
                <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Gênero <span style="color: #c86420;">*</span></label>
                        <select id="updSexo" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            <option value="">Selecionar...</option>
                            ${window.SEXO_OPTIONS.map(sexo => `<option value="${sexo}" ${sexoAtual === sexo ? 'selected' : ''}>${sexo}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Região <span style="color: #c86420;">*</span></label>
                        <select id="updRegiao" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            <option value="">Selecionar...</option>
                            ${window.REGIAO_OPTIONS.map(regiao => `<option value="${regiao}" ${regiaoAtual === regiao ? 'selected' : ''}>${regiao}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Previsão Alta</label>
                        <select id="updPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${window.PREVISAO_ALTA_OPTIONS.map(opt => `<option value="${opt}" ${prevAltaAtual === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- LINHA 3: INICIAIS, MATRÍCULA, IDADE -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Iniciais</label>
                    <input value="${iniciais}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Matrícula</label>
                    <input value="${matriculaFormatada}" readonly style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Idade</label>
                    <select id="updIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Selecionar...</option>
                        ${window.IDADE_OPTIONS.map(idade => `<option value="${idade}" ${idadeAtual == idade ? 'selected' : ''}>${idade} anos</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- LINHA 4: PPS | SPICT-BR | DIRETIVAS -->
            <div class="form-grid-3-cols" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">PPS</label>
                    <select id="updPPS" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="">Selecionar...</option>
                        ${window.PPS_OPTIONS.map(pps => `<option value="${pps}" ${ppsAtual && `${ppsAtual}%` === pps ? 'selected' : ''}>${pps}</option>`).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">SPICT-BR</label>
                    <select id="updSPICT" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <option value="nao_elegivel" ${spictAtual === 'nao_elegivel' ? 'selected' : ''}>Não elegível</option>
                        <option value="elegivel" ${spictAtual === 'elegivel' ? 'selected' : ''}>Elegível</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600;">Diretivas</label>
                    <select id="updDiretivas" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        ${window.DIRETIVAS_OPTIONS.map(opcao => `<option value="${opcao}" ${diretivasAtual === opcao ? 'selected' : ''}>${opcao}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <!-- CONCESSÕES COM BUSCA - VISUAL ANTIGO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        Concessões Previstas na Alta
                    </div>
                </div>
                
                <div style="position: relative; margin-bottom: 8px;">
                    <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; pointer-events: none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="searchConcessoesUpd" placeholder="Digite para buscar... (ex: 'o2', 'banho')" style="width: 100%; padding: 10px 10px 10px 36px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 13px; font-family: 'Poppins', sans-serif;">
                </div>
                
                <div id="updConcessoes" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.CONCESSOES_LIST.map(c => {
                        const checkboxNormalizado = normalizarTexto(c);
                        const isChecked = concessoesAtuais.some(atual => 
                            normalizarTexto(atual) === checkboxNormalizado
                        );
                        
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px; font-family: 'Poppins', sans-serif;">
                                <input type="checkbox" value="${c}" ${isChecked ? 'checked' : ''} style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${c}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- LINHAS DE CUIDADO COM BUSCA - VISUAL ANTIGO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        Linhas de Cuidado
                    </div>
                </div>
                
                <div style="position: relative; margin-bottom: 8px;">
                    <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; pointer-events: none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" id="searchLinhasUpd" placeholder="Digite para buscar... (ex: 'cardiologia', 'geriatria')" style="width: 100%; padding: 10px 10px 10px 36px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 13px; font-family: 'Poppins', sans-serif;">
                </div>
                
                <div id="updLinhas" style="max-height: 150px; overflow-y: auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr; gap: 6px;">
                    ${window.LINHAS_CUIDADO_LIST.map(linha => {
                        const linhasAtuais = Array.isArray(dadosLeito?.linhas) ? dadosLeito.linhas : [];
                        const linhaNormalizada = normalizarTexto(linha);
                        const isChecked = linhasAtuais.some(atual => 
                            normalizarTexto(atual) === linhaNormalizada
                        );
                        
                        return `
                            <label style="display: flex; align-items: center; padding: 4px 0; cursor: pointer; font-size: 12px; font-family: 'Poppins', sans-serif;">
                                <input type="checkbox" value="${linha}" ${isChecked ? 'checked' : ''} style="margin-right: 8px; accent-color: #60a5fa;">
                                <span>${linha}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- ANOTAÇÕES (800 CARACTERES) - VISUAL ANTIGO -->
            <div style="margin-bottom: 20px;">
                <div style="background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 10px 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #ffffff; text-transform: uppercase; font-weight: 700;">
                        Anotações (800 caracteres)
                    </div>
                </div>
                
                <div style="position: relative;">
                    <textarea id="updAnotacoes" maxlength="800" rows="4" placeholder="Digite observações adicionais..." style="width: 100%; padding: 12px; background: rgba(255,255,255,0.03); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 13px; font-family: 'Poppins', sans-serif; resize: vertical;">${anotacoesAtual}</textarea>
                    <div id="updAnotacoesCount" style="position: absolute; bottom: 8px; right: 12px; font-size: 10px; color: rgba(255,255,255,0.5);">${anotacoesAtual.length}/800</div>
                </div>
            </div>
            
            <!-- BOTÕES -->
            <div class="modal-buttons" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <button class="btn-alta" style="padding: 12px 30px; background: #c86420; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">Alta</button>
                
                <div style="text-align: center; font-size: 10px; color: rgba(255,255,255,0.5);">
                    ${admissaoData ? `<div>Admissão: ${formatarDataHora(admissaoData)}</div>` : ''}
                    ${tempoInternacao ? `<div>Internado: ${tempoInternacao}</div>` : ''}
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button class="btn-cancelar" style="padding: 12px 30px; background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">Cancelar</button>
                    <button class="btn-salvar" style="padding: 12px 30px; background: #60a5fa; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; font-family: 'Poppins', sans-serif;">Salvar</button>
                </div>
            </div>
        </div>
    `;
}

// =================== PRÉ-MARCAÇÃO COM NORMALIZAÇÃO ===================
function forcarPreMarcacao(modal, dadosLeito) {
    logDebug(`Forçando pré-marcação com normalização...`);
    
    // CONCESSÕES
    const concessoesAtuais = Array.isArray(dadosLeito?.concessoes) ? dadosLeito.concessoes : [];
    const concessoesCheckboxes = modal.querySelectorAll('#updConcessoes input[type="checkbox"]');
    const naoSeAplicaCheckbox = Array.from(concessoesCheckboxes)
        .find(cb => cb.value === 'Não se aplica');
    
    concessoesCheckboxes.forEach(checkbox => {
        if (checkbox.value === 'Não se aplica') {
            checkbox.checked = concessoesAtuais.length === 0;
        } else {
            const checkboxNormalizado = normalizarTexto(checkbox.value);
            const isChecked = concessoesAtuais.some(atual => 
                normalizarTexto(atual) === checkboxNormalizado
            );
            checkbox.checked = isChecked;
        }
    });

    // LINHAS
    const linhasAtuais = Array.isArray(dadosLeito?.linhas) ? dadosLeito.linhas : [];
    const linhasCheckboxes = modal.querySelectorAll('#updLinhas input[type="checkbox"]');

    linhasCheckboxes.forEach(checkbox => {
        const linhaNormalizada = normalizarTexto(checkbox.value);
        const isChecked = linhasAtuais.some(atual => 
            normalizarTexto(atual) === linhaNormalizada
        );
        checkbox.checked = isChecked;
    });

    logDebug(`Concessões pré-marcadas: ${concessoesAtuais.length}`);
    logDebug(`Linhas pré-marcadas: ${linhasAtuais.length}`);
    logSuccess(`Pré-marcação concluída com normalização!`);
}

// LÓGICA "NÃO SE APLICA" PARA CONCESSÕES
function setupConcessoesLogic(modal, concessoesId) {
    const container = modal.querySelector(`#${concessoesId}`);
    if (!container) return;
    
    const naoSeAplicaCheckbox = Array.from(container.querySelectorAll('input[type="checkbox"]'))
        .find(cb => cb.value === 'Não se aplica');
    
    if (!naoSeAplicaCheckbox) return;
    
    const outrasCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'))
        .filter(cb => cb.value !== 'Não se aplica');
    
    naoSeAplicaCheckbox.addEventListener('change', function() {
        if (this.checked) {
            outrasCheckboxes.forEach(cb => cb.checked = false);
        }
    });
    
    outrasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                naoSeAplicaCheckbox.checked = false;
            } else {
                const algumaOutraMarcada = outrasCheckboxes.some(cb => cb.checked);
                if (!algumaOutraMarcada) {
                    naoSeAplicaCheckbox.checked = true;
                }
            }
        });
    });
    
    const algumaOutraMarcada = outrasCheckboxes.some(cb => cb.checked);
    if (!algumaOutraMarcada) {
        naoSeAplicaCheckbox.checked = true;
    }
}

// =================== EVENT LISTENERS DOS MODAIS ===================
function setupModalEventListeners(modal, tipo) {
    // V7.4: Obter hospitalId e maxLen para campo dinâmico
    const hospitalId = window.currentHospital;
    const maxLen = window.MAXLENGTH_IDENTIFICACAO[hospitalId] || 3;
    
    // V7.0: CAMPO IDENTIFICAÇÃO DINÂMICO PARA HIBRIDOS
    const tipoQuartoSelect = modal.querySelector('#admTipoQuarto');
    const identificacaoContainer = modal.querySelector('#admIdentificacaoContainer');
    const identificacaoHint = modal.querySelector('#admIdentificacaoHint');
    
    if (tipoQuartoSelect && identificacaoContainer && !tipoQuartoSelect.disabled) {
        tipoQuartoSelect.addEventListener('change', function() {
            const tipoSelecionado = this.value;
            // V7.4: Obter sufixos do hospital para enfermaria
            const sufixosEnf = window.SUFIXOS_ENFERMARIA[hospitalId] || ['A', 'B'];
            const sufixoOptions = sufixosEnf.map(s => `<option value="${s}">${s}</option>`).join('');
            
            if (!tipoSelecionado) {
                identificacaoContainer.innerHTML = `
                    <input id="admIdentificacaoLeito" type="text" placeholder="Selecione o Tipo de Quarto" disabled 
                           style="width: 100%; padding: 12px; background: #1f2937; color: #9ca3af; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif; cursor: not-allowed;">
                `;
                if (identificacaoHint) identificacaoHint.textContent = 'Primeiro selecione o Tipo de Quarto';
            } else if (tipoSelecionado === 'Enfermaria') {
                // V7.4: Enfermaria com dropdown de sufixo por hospital
                identificacaoContainer.innerHTML = `
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                        <input id="admIdentificacaoNumero" type="text" placeholder="Numero" maxlength="${maxLen}" required 
                               oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                               style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                        <select id="admIdentificacaoSufixo" required 
                               style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                            ${sufixoOptions}
                        </select>
                    </div>
                `;
                if (identificacaoHint) identificacaoHint.textContent = 'Numero + Sufixo';
            } else {
                // Apartamento: campo simples (apenas numeros)
                identificacaoContainer.innerHTML = `
                    <input id="admIdentificacaoLeito" type="text" placeholder="Numero do quarto" maxlength="${maxLen}" required 
                           oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                           style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; font-family: 'Poppins', sans-serif;">
                `;
                if (identificacaoHint) identificacaoHint.textContent = 'Apenas numeros';
            }
        });
    }
    
    // CONTADOR DE CARACTERES PARA ANOTAÇÕES
    const anotacoesField = modal.querySelector(tipo === 'admissao' ? '#admAnotacoes' : '#updAnotacoes');
    const anotacoesCount = modal.querySelector(tipo === 'admissao' ? '#admAnotacoesCount' : '#updAnotacoesCount');
    
    if (anotacoesField && anotacoesCount) {
        anotacoesField.addEventListener('input', function() {
            const length = this.value.length;
            anotacoesCount.textContent = `${length}/800`;
        });
    }
    
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
        });
    }
    
    const btnSalvar = modal.querySelector('.btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const hospitalId = window.currentHospital;
            const leitoNumero = window.selectedLeito;
            const isCruzAzulEnfermaria = (hospitalId === 'H2' && leitoNumero >= 21 && leitoNumero <= 46);
            const isSantaClaraEnfermaria = (hospitalId === 'H4' && leitoNumero >= 10 && leitoNumero <= 27);
            const isHibrido = window.HOSPITAIS_HIBRIDOS && window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
            
            // VALIDAR IDENTIFICAÇÃO DO LEITO
            if (isCruzAzulEnfermaria || isSantaClaraEnfermaria) {
                // H2/H4 enfermarias: numero + sufixo (select)
                const numeroField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoNumero' : '#updIdentificacaoNumero');
                const sufixoField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoSufixo' : '#updIdentificacaoSufixo');
                
                if (numeroField && sufixoField) {
                    if (!numeroField.value.trim()) {
                        showErrorMessage('Campo "Numero do Leito" é obrigatorio!');
                        numeroField.focus();
                        return;
                    }
                    if (!sufixoField.value) {
                        showErrorMessage('Campo "Sufixo" é obrigatorio!');
                        sufixoField.focus();
                        return;
                    }
                }
            } else if (isHibrido && tipo === 'admissao') {
                // V7.0: Hibridos - verificar se tem número+dígito ou campo simples
                const tipoQuartoField = modal.querySelector('#admTipoQuarto');
                const tipoQuarto = tipoQuartoField ? tipoQuartoField.value : '';
                
                if (!tipoQuarto) {
                    showErrorMessage('Campo "Tipo de Quarto" é obrigatorio!');
                    tipoQuartoField.focus();
                    return;
                }
                
                if (tipoQuarto === 'Enfermaria') {
                    const numeroField = modal.querySelector('#admIdentificacaoNumero');
                    const digitoField = modal.querySelector('#admIdentificacaoDigito');
                    
                    if (!numeroField || !numeroField.value.trim()) {
                        showErrorMessage('Campo "Numero" é obrigatorio!');
                        if (numeroField) numeroField.focus();
                        return;
                    }
                    if (!digitoField || !digitoField.value.trim()) {
                        showErrorMessage('Campo "Digito" é obrigatorio!');
                        if (digitoField) digitoField.focus();
                        return;
                    }
                } else {
                    const identificacaoField = modal.querySelector('#admIdentificacaoLeito');
                    if (!identificacaoField || !identificacaoField.value.trim()) {
                        showErrorMessage('Campo "Identificacao do Leito" é obrigatorio!');
                        if (identificacaoField) identificacaoField.focus();
                        return;
                    }
                }
            } else {
                const identificacaoField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoLeito' : '#updIdentificacaoLeito');
                if (identificacaoField && !identificacaoField.value.trim()) {
                    showErrorMessage('Campo "Identificação do Leito" é obrigatório!');
                    identificacaoField.focus();
                    return;
                }
                
                if (identificacaoField) {
                    const identificacao = identificacaoField.value.trim();
                    if (identificacao.length < 1 || identificacao.length > 6) {
                        showErrorMessage('Identificação deve ter de 1 a 6 caracteres!');
                        identificacaoField.focus();
                        return;
                    }
                }
            }
            
            const isolamentoField = modal.querySelector(tipo === 'admissao' ? '#admIsolamento' : '#updIsolamento');
            const regiaoField = modal.querySelector(tipo === 'admissao' ? '#admRegiao' : '#updRegiao');
            const sexoField = modal.querySelector(tipo === 'admissao' ? '#admSexo' : '#updSexo');
            
            if (!isolamentoField.value) {
                showErrorMessage('Campo "Isolamento" é obrigatório!');
                isolamentoField.focus();
                return;
            }
            
            if (!regiaoField.value) {
                showErrorMessage('Campo "Região" é obrigatório!');
                regiaoField.focus();
                return;
            }
            
            if (!sexoField.value) {
                showErrorMessage('Campo "Gênero" é obrigatório!');
                sexoField.focus();
                return;
            }
            
            // Validação específica para hospitais HÍBRIDOS PUROS (H1, H3, H5, H6, H7, H8, H9)
            const hospitaisHibridos = ['H1', 'H3', 'H5', 'H6', 'H7', 'H8', 'H9'];
            if (hospitaisHibridos.includes(hospitalId)) {
                const tipoQuartoField = modal.querySelector(tipo === 'admissao' ? '#admTipoQuarto' : '#updTipoQuarto');
                if (tipoQuartoField && !tipoQuartoField.disabled && !tipoQuartoField.value) {
                    showErrorMessage('Campo "Tipo de Quarto" é obrigatório para hospitais híbridos!');
                    tipoQuartoField.focus();
                    return;
                }
            }
            
            if (tipo === 'admissao' && hospitalId === 'H2') {
                const generoNovo = sexoField.value;
                const validacaoCruz = validarAdmissaoCruzAzul(leitoNumero, generoNovo);
                
                if (!validacaoCruz.permitido) {
                    showErrorMessage(validacaoCruz.motivo);
                    return;
                }
            }
            
            
            
            // ✅ V7.0: VALIDAR DUPLICATAS E VERIFICAR RESERVAS
            try {
                const identificacaoNumeroField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoNumero' : null);
                const identificacaoDigitoField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoDigito' : null);
                const identificacaoSufixoField = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoSufixo' : null);
                
                let identificacaoParaValidar = '';
                if (identificacaoNumeroField && identificacaoDigitoField) {
                    // Campo dinamico: numero + digito
                    const numero = identificacaoNumeroField.value.trim();
                    const digito = identificacaoDigitoField.value.trim();
                    identificacaoParaValidar = numero && digito ? `${numero}-${digito}` : numero;
                } else if (identificacaoNumeroField && identificacaoSufixoField) {
                    // Campo H2/H4: numero + sufixo
                    const numero = identificacaoNumeroField.value.trim();
                    const sufixo = identificacaoSufixoField.value;
                    identificacaoParaValidar = numero && sufixo ? `${numero}-${sufixo}` : numero;
                } else {
                    const identificacaoFieldSimples = modal.querySelector(tipo === 'admissao' ? '#admIdentificacaoLeito' : '#updIdentificacaoLeito');
                    if (identificacaoFieldSimples) {
                        identificacaoParaValidar = identificacaoFieldSimples.value.trim();
                    }
                }
                
                const matriculaField = modal.querySelector(tipo === 'admissao' ? '#admMatricula' : null);
                const matriculaParaValidar = matriculaField ? matriculaField.value.trim() : '';
                
                // V7.0: Verificar se existe RESERVA com este leito ou matricula
                if (tipo === 'admissao') {
                    const reservaEncontrada = buscarReservaParaAdmissao(hospitalId, identificacaoParaValidar, matriculaParaValidar);
                    
                    if (reservaEncontrada) {
                        // Perguntar se quer admitir usando a reserva
                        const confirma = await mostrarConfirmacaoReserva(reservaEncontrada);
                        
                        if (confirma) {
                            // Cancelar a reserva no backend
                            try {
                                console.log('[V7.0] Tentando cancelar reserva antes da admissao...');
                                const cancelado = await window.cancelarReserva(
                                    reservaEncontrada.hospital, 
                                    reservaEncontrada.identificacaoLeito, 
                                    reservaEncontrada.matricula
                                );
                                if (cancelado) {
                                    console.log('[V7.0] Reserva cancelada com sucesso!');
                                } else {
                                    console.warn('[V7.0] Reserva não foi cancelada, mas continuando admissão...');
                                }
                            } catch (err) {
                                console.error('[V7.0] ERRO ao cancelar reserva:', err);
                                // Perguntar se quer continuar mesmo assim
                                const continuarMesmoAssim = confirm('Erro ao cancelar a reserva na planilha. Deseja continuar com a admissao mesmo assim?\n\nVoce precisara apagar a reserva manualmente na aba "reservas".');
                                if (!continuarMesmoAssim) {
                                    return;
                                }
                            }
                            // Continuar com a admissao normalmente
                        } else {
                            // Usuario cancelou
                            return;
                        }
                    }
                }
                
                // Validar duplicatas em OCUPADOS (reservas ja foram tratadas acima)
                if (identificacaoParaValidar && window.hospitalData && window.hospitalData[hospitalId]) {
                    const validacaoId = validarIdentificacaoOcupada(
                        hospitalId, 
                        identificacaoParaValidar,
                        tipo === 'atualizacao' ? leitoNumero : null
                    );
                    if (!validacaoId.valido) {
                        showErrorMessage(validacaoId.mensagem);
                        return;
                    }
                }
                
                if (matriculaParaValidar && tipo === 'admissao' && window.hospitalData && window.hospitalData[hospitalId]) {
                    const validacaoMat = validarMatriculaOcupada(
                        hospitalId, 
                        matriculaParaValidar,
                        null
                    );
                    if (!validacaoMat.valido) {
                        showErrorMessage(validacaoMat.mensagem);
                        return;
                    }
                }
            } catch (error) {
                console.warn('[VALIDAÇÃO] Erro ao validar duplicatas:', error);
            }
            const originalText = this.innerHTML;
            showButtonLoading(this, 'SALVANDO...');
            
            // V7.4: Mostrar loading overlay
            window.showLoadingOverlay(tipo === 'admissao' ? 'Admitindo paciente...' : 'Atualizando dados...');
            
            try {
                const dadosFormulario = coletarDadosFormulario(modal, tipo);
                
                if (tipo === 'admissao') {
                    await window.admitirPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('Paciente admitido com sucesso!');
                } else {
                    await window.atualizarPaciente(dadosFormulario.hospital, dadosFormulario.leito, dadosFormulario);
                    showSuccessMessage('Dados atualizados com sucesso!');
                }
                
                hideButtonLoading(this, originalText);
                closeModal(modal);
                
                await window.refreshAfterAction();
                
                // V7.4: Esconder loading apos sucesso
                window.hideLoadingOverlay();
                
            } catch (error) {
                // V7.4: Esconder loading em caso de erro
                window.hideLoadingOverlay();
                hideButtonLoading(this, originalText);
                showErrorMessage('Erro ao salvar: ' + error.message);
                logError('Erro ao salvar:', error);
            }
        });
    }
    
    const btnAlta = modal.querySelector('.btn-alta');
    if (btnAlta) {
        btnAlta.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!confirm("Confirmar ALTA deste paciente?")) return;
            
            const originalText = this.innerHTML;
            showButtonLoading(this, 'PROCESSANDO ALTA...');
            
            // V7.4: Mostrar loading overlay
            window.showLoadingOverlay('Processando alta...');
            
            try {
                await window.darAlta(window.currentHospital, window.selectedLeito);
                
                hideButtonLoading(this, originalText);
                showSuccessMessage('Alta processada!');
                closeModal(modal);
                
                await window.refreshAfterAction();
                
                // V7.4: Esconder loading apos sucesso
                window.hideLoadingOverlay();
                
            } catch (error) {
                // V7.4: Esconder loading em caso de erro
                window.hideLoadingOverlay();
                hideButtonLoading(this, originalText);
                showErrorMessage('Erro ao processar alta: ' + error.message);
                logError('Erro alta:', error);
            }
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    if (tipo === 'admissao') {
        setupConcessoesLogic(modal, 'admConcessoes');
    } else {
        setupConcessoesLogic(modal, 'updConcessoes');
    }
}

// =================== CLOSE MODAL ===================
function closeModal(modal) {
    if (modal && modal.parentNode) {
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            window.selectedLeito = null;
        }, 300);
    }
}

// =================== COLETAR DADOS DO FORMULÁRIO ===================

// =================== V7.0: FUNÇÕES DE RESERVA NA ADMISSÃO ===================

// Buscar reserva para admissao (por leito ou matricula)
function buscarReservaParaAdmissao(hospitalId, identificacaoLeito, matricula) {
    const reservas = window.reservasData || [];
    
    // Normalizar para comparacao
    const idNorm = String(identificacaoLeito || '').trim().toUpperCase();
    const matNorm = String(matricula || '').replace(/-/g, '').trim();
    
    // Buscar por identificacao do leito (mesmo hospital)
    if (idNorm) {
        const porLeito = reservas.find(r => {
            if (r.hospital !== hospitalId) return false;
            const idReserva = String(r.identificacaoLeito || '').trim().toUpperCase();
            return idReserva === idNorm;
        });
        if (porLeito) return porLeito;
    }
    
    // Buscar por matricula (qualquer hospital)
    if (matNorm) {
        const porMatricula = reservas.find(r => {
            const matReserva = String(r.matricula || '').replace(/-/g, '').trim();
            return matReserva === matNorm;
        });
        if (porMatricula) return porMatricula;
    }
    
    return null;
}

// Modal de confirmacao para admitir usando reserva existente
function mostrarConfirmacaoReserva(reserva) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; justify-content: center;
            align-items: center; z-index: 10001;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #1e293b; border-radius: 12px; padding: 24px;
            max-width: 400px; width: 90%; border: 1px solid rgba(255,255,255,0.1);
            font-family: 'Poppins', sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">&#9888;</div>
                <h3 style="color: #f59a1d; margin: 0 0 10px 0; font-size: 18px;">Reserva Encontrada</h3>
            </div>
            <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #9ca3af; margin: 0 0 12px 0; font-size: 14px;">
                    Existe uma reserva com estes dados:
                </p>
                <div style="color: #ffffff; font-size: 13px; line-height: 1.8;">
                    <div><strong>Leito:</strong> ${reserva.identificacaoLeito || '-'}</div>
                    <div><strong>Matricula:</strong> ${reserva.matricula || '-'}</div>
                    <div><strong>Iniciais:</strong> ${reserva.iniciais || '-'}</div>
                    <div><strong>Genero:</strong> ${reserva.genero || '-'}</div>
                    <div><strong>Isolamento:</strong> ${reserva.isolamento || '-'}</div>
                </div>
            </div>
            <p style="color: #9ca3af; text-align: center; font-size: 13px; margin-bottom: 20px;">
                Deseja cancelar a reserva e admitir o paciente?
            </p>
            <div style="display: flex; gap: 12px;">
                <button id="btnCancelarConfirm" style="
                    flex: 1; padding: 12px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.1); color: #9ca3af;
                    font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
                ">NAO, VOLTAR</button>
                <button id="btnConfirmarAdmissao" style="
                    flex: 1; padding: 12px; border-radius: 8px; border: none;
                    background: #60a5fa; color: #ffffff;
                    font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
                ">SIM, ADMITIR</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        modal.querySelector('#btnCancelarConfirm').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        
        modal.querySelector('#btnConfirmarAdmissao').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });
        
        // Fechar ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
    });
}

// Validar se identificacao ja esta em uso em leitos OCUPADOS (sem verificar reservas)
function validarIdentificacaoOcupada(hospitalId, identificacao, leitoAtual = null) {
    if (!identificacao || !identificacao.trim()) return { valido: true };
    
    const identificacaoNorm = identificacao.trim().toUpperCase();
    
    const leitosHospital = window.hospitalData[hospitalId]?.leitos || [];
    const duplicadoOcupado = leitosHospital.find(l => {
        const idLeito = l.identificacaoLeito || l.identificacao_leito || '';
        const statusOcupado = (l.status === 'Ocupado' || l.status === 'ocupado' || l.status === 'Em uso');
        
        if (leitoAtual && parseInt(l.leito) === parseInt(leitoAtual)) {
            return false;
        }
        
        return statusOcupado && idLeito.trim().toUpperCase() === identificacaoNorm;
    });
    
    if (duplicadoOcupado) {
        const matricula = duplicadoOcupado.matricula || 'sem matricula';
        return {
            valido: false,
            mensagem: `Leito ${identificacao} ja esta OCUPADO (matricula: ${matricula})`
        };
    }
    
    return { valido: true };
}

// Validar se matricula ja esta em uso em leitos OCUPADOS (sem verificar reservas)
function validarMatriculaOcupada(hospitalId, matricula, leitoAtual = null) {
    // V7.4: Converter para string antes de usar trim
    const matriculaStr = String(matricula || '').trim();
    if (!matriculaStr) return { valido: true };
    
    const matriculaSemHifen = matriculaStr.replace(/-/g, '').trim();
    if (!matriculaSemHifen) return { valido: true };
    
    const leitosHospital = window.hospitalData[hospitalId]?.leitos || [];
    const duplicadoOcupado = leitosHospital.find(l => {
        const matLeito = (l.matricula || '').replace(/-/g, '').trim();
        const statusOcupado = (l.status === 'Ocupado' || l.status === 'ocupado' || l.status === 'Em uso');
        
        if (leitoAtual && parseInt(l.leito) === parseInt(leitoAtual)) {
            return false;
        }
        
        return statusOcupado && matLeito === matriculaSemHifen;
    });
    
    if (duplicadoOcupado) {
        const numeroLeito = duplicadoOcupado.identificacaoLeito || duplicadoOcupado.identificacao_leito || `Leito ${duplicadoOcupado.leito}`;
        return {
            valido: false,
            mensagem: `Matricula ${matricula} ja esta em uso no leito ${numeroLeito} (OCUPADO)`
        };
    }
    
    return { valido: true };
}

// =================== VALIDACOES DE DUPLICATAS (para RESERVA) ===================

// Validar se identificacao ja esta sendo usada no hospital
function validarIdentificacaoDuplicada(hospitalId, identificacao, leitoAtual = null) {
    if (!identificacao) return { valido: true };
    
    // CORRECAO: Converter para string antes de usar trim/toUpperCase
    const identificacaoStr = String(identificacao).trim();
    if (!identificacaoStr) return { valido: true };
    
    const identificacaoNorm = identificacaoStr.toUpperCase();
    
    // 1. Verificar em leitos OCUPADOS
    const leitosHospital = window.hospitalData[hospitalId]?.leitos || [];
    const duplicadoOcupado = leitosHospital.find(l => {
        // CORRECAO: Converter para string antes de usar trim/toUpperCase
        const idLeito = String(l.identificacaoLeito || l.identificacao_leito || '').trim().toUpperCase();
        const statusOcupado = (l.status === 'Ocupado' || l.status === 'ocupado' || l.status === 'Em uso');
        
        // Se for atualizacao, ignorar o proprio leito
        if (leitoAtual && parseInt(l.leito) === parseInt(leitoAtual)) {
            return false;
        }
        
        return statusOcupado && idLeito === identificacaoNorm;
    });
    
    if (duplicadoOcupado) {
        const matricula = duplicadoOcupado.matricula || 'sem matricula';
        return {
            valido: false,
            mensagem: `Leito ${identificacao} ja esta OCUPADO (matricula: ${matricula})`
        };
    }
    
    // 2. V7.0: Verificar em RESERVAS
    const reservas = window.reservasData || [];
    const duplicadoReserva = reservas.find(r => {
        if (r.hospital !== hospitalId) return false;
        // CORRECAO: Converter para string antes de usar trim/toUpperCase
        const idReserva = String(r.identificacaoLeito || '').trim().toUpperCase();
        return idReserva === identificacaoNorm;
    });
    
    if (duplicadoReserva) {
        // V7.0: Se a reserva existente for um BLOQUEIO (sem matricula), permitir!
        // O backend vai atualizar a linha em vez de criar nova
        const temMatricula = duplicadoReserva.matricula && String(duplicadoReserva.matricula).trim();
        if (!temMatricula) {
            console.log('[V7.0 VALIDACAO] Bloqueio existente encontrado para ' + identificacao + ' - permitindo atualizacao');
            return { valido: true, bloqueioExistente: true };
        }
        
        return {
            valido: false,
            mensagem: `Leito ${identificacao} ja esta RESERVADO (matricula: ${duplicadoReserva.matricula})`
        };
    }
    
    return { valido: true };
}

// Validar se matrícula já está sendo usada no hospital
function validarMatriculaDuplicada(hospitalId, matricula, leitoAtual = null) {
    if (!matricula) return { valido: true };
    
    // Converter para string e remover hifen para comparacao
    const matriculaStr = String(matricula).trim();
    if (!matriculaStr) return { valido: true };
    
    const matriculaSemHifen = matriculaStr.replace(/-/g, '').trim();
    if (!matriculaSemHifen) return { valido: true };
    
    // 1. Verificar em leitos OCUPADOS
    const leitosHospital = window.hospitalData[hospitalId]?.leitos || [];
    const duplicadoOcupado = leitosHospital.find(l => {
        // CORRECAO: Converter para string antes de usar replace
        const matLeito = String(l.matricula || '').replace(/-/g, '').trim();
        const statusOcupado = (l.status === 'Ocupado' || l.status === 'ocupado' || l.status === 'Em uso');
        
        // Se for atualizacao, ignorar o proprio leito
        if (leitoAtual && parseInt(l.leito) === parseInt(leitoAtual)) {
            return false;
        }
        
        return statusOcupado && matLeito === matriculaSemHifen;
    });
    
    if (duplicadoOcupado) {
        const numeroLeito = duplicadoOcupado.identificacaoLeito || duplicadoOcupado.identificacao_leito || `Leito ${duplicadoOcupado.leito}`;
        return {
            valido: false,
            mensagem: `Matricula ${matricula} ja esta em uso no leito ${numeroLeito} (OCUPADO)`
        };
    }
    
    // 2. V7.0: Verificar em RESERVAS (TODOS os hospitais)
    const reservas = window.reservasData || [];
    const duplicadoReserva = reservas.find(r => {
        // CORRECAO: Converter para string antes de usar replace
        const matReserva = String(r.matricula || '').replace(/-/g, '').trim();
        return matReserva === matriculaSemHifen;
    });
    
    if (duplicadoReserva) {
        const numeroLeito = duplicadoReserva.identificacaoLeito || 'desconhecido';
        const hospitalReserva = duplicadoReserva.hospital || '';
        return {
            valido: false,
            mensagem: `Matricula ${matricula} ja esta RESERVADA no leito ${numeroLeito} (${hospitalReserva})`
        };
    }
    
    return { valido: true };
}

function coletarDadosFormulario(modal, tipo) {
    const dados = {
        hospital: window.currentHospital,
        leito: window.selectedLeito
    };
    
    const hospitalId = window.currentHospital;
    const leitoNumero = window.selectedLeito;
    const isCruzAzulEnfermaria = (hospitalId === 'H2') && (window.CRUZ_AZUL_IRMAOS[leitoNumero] !== undefined);
    const isSantaClaraEnfermaria = (hospitalId === 'H4') && (window.SANTA_CLARA_IRMAOS[leitoNumero] !== undefined);
    const isHibrido = window.HOSPITAIS_HIBRIDOS && window.HOSPITAIS_HIBRIDOS.includes(hospitalId);
    
    if (tipo === 'admissao') {
        dados.nome = modal.querySelector('#admNome')?.value?.trim() || '';
        const matriculaInput = modal.querySelector('#admMatricula')?.value?.trim() || '';
        dados.matricula = matriculaInput.replace(/-/g, '');
        dados.idade = parseInt(modal.querySelector('#admIdade')?.value) || null;
        dados.pps = modal.querySelector('#admPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#admSPICT')?.value || 'nao_elegivel';
        dados.prevAlta = modal.querySelector('#admPrevAlta')?.value || 'Sem Previsão';
        dados.isolamento = modal.querySelector('#admIsolamento')?.value || '';
        
        // IDENTIFICAÇÃO DO LEITO - V7.0: suporte a hibridos com número+dígito
        if (isCruzAzulEnfermaria || isSantaClaraEnfermaria) {
            const numero = modal.querySelector('#admIdentificacaoNumero')?.value?.trim() || '';
            const sufixo = modal.querySelector('#admIdentificacaoSufixo')?.value || '';
            dados.identificacaoLeito = numero && sufixo ? `${numero}-${sufixo}` : numero;
        } else if (isHibrido) {
            // V7.0: Hibridos - verificar se é enfermaria (número+dígito) ou apartamento
            const tipoQuarto = modal.querySelector('#admTipoQuarto')?.value || '';
            if (tipoQuarto === 'Enfermaria') {
                const numero = modal.querySelector('#admIdentificacaoNumero')?.value?.trim() || '';
                const digito = modal.querySelector('#admIdentificacaoDigito')?.value?.trim() || '';
                dados.identificacaoLeito = numero && digito ? `${numero}-${digito}` : numero;
            } else {
                dados.identificacaoLeito = modal.querySelector('#admIdentificacaoLeito')?.value?.trim() || '';
            }
        } else {
            dados.identificacaoLeito = modal.querySelector('#admIdentificacaoLeito')?.value?.trim() || '';
        }
        
        dados.regiao = modal.querySelector('#admRegiao')?.value || '';
        dados.genero = modal.querySelector('#admSexo')?.value || '';
        dados.diretivas = modal.querySelector('#admDiretivas')?.value || 'Não se aplica';
        dados.anotacoes = modal.querySelector('#admAnotacoes')?.value?.trim() || '';
        
        const tipoQuartoField = modal.querySelector('#admTipoQuarto');
        if (tipoQuartoField) {
            dados.categoriaEscolhida = tipoQuartoField.value || '';
        }
        
        dados.concessoes = coletarCheckboxesSelecionados(modal, '#admConcessoes');
        dados.linhas = coletarCheckboxesSelecionados(modal, '#admLinhas');
        
    } else {
        dados.idade = parseInt(modal.querySelector('#updIdade')?.value) || null;
        dados.pps = modal.querySelector('#updPPS')?.value?.replace('%', '') || null;
        dados.spict = modal.querySelector('#updSPICT')?.value || 'nao_elegivel';
        dados.prevAlta = modal.querySelector('#updPrevAlta')?.value || 'Sem Previsão';
        dados.isolamento = modal.querySelector('#updIsolamento')?.value || '';
        dados.identificacaoLeito = modal.querySelector('#updIdentificacaoLeito')?.value?.trim() || '';
        dados.regiao = modal.querySelector('#updRegiao')?.value || '';
        dados.genero = modal.querySelector('#updSexo')?.value || '';
        dados.diretivas = modal.querySelector('#updDiretivas')?.value || 'Não se aplica';
        dados.anotacoes = modal.querySelector('#updAnotacoes')?.value?.trim() || '';
        
        const tipoQuartoField = modal.querySelector('#updTipoQuarto');
        if (tipoQuartoField) {
            dados.categoriaEscolhida = tipoQuartoField.value || '';
        }
        
        dados.concessoes = coletarCheckboxesSelecionados(modal, '#updConcessoes');
        dados.linhas = coletarCheckboxesSelecionados(modal, '#updLinhas');
    }
    
    return dados;
}

// =================== COLETAR CHECKBOXES ===================
function coletarCheckboxesSelecionados(modal, seletor) {
    const checkboxes = modal.querySelectorAll(`${seletor} input[type="checkbox"]`);
    const selecionados = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.value !== 'Não se aplica') {
            selecionados.push(checkbox.value);
        }
    });
    
    return selecionados;
}

// FORMATAÇÃO AUTOMÁTICA MATRÍCULA
function formatarMatriculaInput(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 10) {
        valor = valor.substring(0, 10);
    }
    if (valor.length > 1) {
        input.value = valor.slice(0, -1) + '-' + valor.slice(-1);
    } else {
        input.value = valor;
    }
}

window.formatarMatriculaInput = formatarMatriculaInput;

// V7.4: AUTO-COMPLETAR ZEROS À ESQUERDA NA MATRÍCULA (10 dígitos + 1 dígito verificador)
function autoCompletarMatricula(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (valor.length === 0) return;
    if (valor.length < 2) return; // Precisa ter pelo menos 2 dígitos para ter número + dígito
    
    // Separar número e dígito verificador
    let digito = valor.slice(-1);
    let numero = valor.slice(0, -1);
    
    // Completar com zeros à esquerda até ter 10 dígitos
    while (numero.length < 10) {
        numero = '0' + numero;
    }
    
    // Limitar a 10 dígitos (caso tenha mais)
    numero = numero.slice(-10);
    
    // Formatar com hífen
    input.value = numero + '-' + digito;
}

window.autoCompletarMatricula = autoCompletarMatricula;

// =================== FUNÇÕES AUXILIARES ===================
function showButtonLoading(button, loadingText) {
    if (button) {
        button.disabled = true;
        button.innerHTML = loadingText;
        button.style.opacity = '0.7';
    }
}

function hideButtonLoading(button, originalText) {
    if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.opacity = '1';
    }
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #60a5fa;
        color: white; padding: 15px 20px; border-radius: 8px; font-weight: 500;
        z-index: 10000; animation: slideIn 0.3s ease; font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #c86420;
        color: white; padding: 15px 20px; border-radius: 8px; font-weight: 500;
        z-index: 10000; animation: slideIn 0.3s ease; font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function calcularTempoInternacao(admissao) {
    if (!admissao) return '';
    
    try {
        let dataAdmissao;
        
        if (typeof admissao === 'string') {
            if (admissao.includes('/')) {
                const [datePart] = admissao.split(' ');
                const [dia, mes, ano] = datePart.split('/');
                
                if (dia && mes && ano) {
                    const d = parseInt(dia);
                    const m = parseInt(mes);
                    const a = parseInt(ano);
                    
                    if (!isNaN(d) && !isNaN(m) && !isNaN(a) && 
                        d >= 1 && d <= 31 && m >= 1 && m <= 12 && a >= 1900) {
                        dataAdmissao = new Date(a, m - 1, d);
                    } else {
                        return 'Data inválida';
                    }
                } else {
                    return 'Data incompleta';
                }
            } else {
                dataAdmissao = new Date(admissao);
            }
        } else {
            dataAdmissao = new Date(admissao);
        }
        
        if (!dataAdmissao || isNaN(dataAdmissao.getTime())) {
            return 'Data inválida';
        }
        
        const agora = new Date();
        const diffTime = agora - dataAdmissao;
        
        if (diffTime < 0) return 'Data futura';
        if (diffTime > (2 * 365 * 24 * 60 * 60 * 1000)) return 'Data antiga';
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays === 0) return `${diffHours}h`;
        if (diffDays === 1) return `1d ${diffHours}h`;
        return `${diffDays}d ${diffHours}h`;
        
    } catch (error) {
        logError('Erro ao calcular tempo internação:', error);
        return 'Erro no cálculo';
    }
}

function formatarDataHora(dataISO) {
    if (!dataISO) return '—';
    
    try {
        const data = new Date(dataISO);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        logError('Erro ao formatar data:', error);
        return '—';
    }
}

// =================== FUNÇÕES DE LOG ===================
function logInfo(message, data = null) {
    console.log(`[CARDS] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`[CARDS ERROR] ${message}`, error || '');
}

function logSuccess(message) {
    console.log(`[CARDS SUCCESS] ${message}`);
}

function logDebug(message, data = null) {
    console.log(`[CARDS DEBUG] ${message}`, data || '');
}

// =================== CSS CONSOLIDADO ===================
if (!document.getElementById('cardsConsolidadoCSS')) {
    const style = document.createElement('style');
    style.id = 'cardsConsolidadoCSS';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
            font-family: 'Poppins', sans-serif !important;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        .btn-action {
            transition: all 0.2s ease;
        }
        
        .btn-action:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .btn-action:disabled {
            cursor: not-allowed;
            transform: none !important;
        }
        
        select {
            background-color: #374151 !important;
            color: #ffffff !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            border-radius: 6px !important;
            appearance: none !important;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.7rem center;
            background-size: 1em;
            padding-right: 2.5rem !important;
        }

        select option {
            background-color: #374151 !important;
            color: #ffffff !important;
        }

        select:focus {
            outline: none !important;
            border-color: #60a5fa !important;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
        }

        input[type="checkbox"] {
            width: 16px;
            height: 16px;
            accent-color: #60a5fa;
            cursor: pointer;
        }
        
        label:has(input[type="checkbox"]) {
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 4px;
            padding: 4px !important;
        }
        
        label:has(input[type="checkbox"]):hover {
            background-color: rgba(96, 165, 250, 0.1);
        }

        .card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .form-grid-3-cols {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 15px !important;
        }
        
        @media (max-width: 1024px) and (min-width: 769px) {
            .cards-grid {
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 18px;
            }
            
            .form-grid-3-cols {
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 12px !important;
            }
        }

        @media (max-width: 768px) {
            .cards-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }
            
            .card-row,
            .card-row-pessoa {
                display: grid !important;
                grid-template-columns: 100px 1fr 1fr !important;
                gap: 8px !important;
            }
            
            .pessoa-circle {
                width: 100px !important;
                height: 100px !important;
            }
            
            .modal-overlay .modal-content {
                width: 95% !important;
                max-width: none !important;
                margin: 10px !important;
                max-height: 95vh !important;
                padding: 20px !important;
            }
            
            .form-grid-3-cols {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 8px !important;
            }
            
            .form-grid-3-cols input,
            .form-grid-3-cols select {
                padding: 8px 6px !important;
                font-size: 12px !important;
            }
            
            .form-grid-3-cols label {
                font-size: 10px !important;
                margin-bottom: 3px !important;
            }
            
            .modal-content div[id$="Concessoes"],
            .modal-content div[id$="Linhas"] {
                grid-template-columns: 1fr !important;
                max-height: 120px !important;
            }
            
            input[type="checkbox"] {
                width: 18px !important;
                height: 18px !important;
                margin-right: 10px !important;
            }
            
            label:has(input[type="checkbox"]) {
                padding: 8px !important;
                font-size: 12px !important;
            }
            
            .modal-buttons {
                position: sticky !important;
                bottom: 0 !important;
                background: #1a1f2e !important;
                padding: 12px 10px !important;
                margin: 0 -20px -20px -20px !important;
                border-top: 2px solid rgba(96, 165, 250, 0.3) !important;
                z-index: 10 !important;
                display: flex !important;
                flex-direction: row !important;
                justify-content: center !important;
                gap: 6px !important;
                flex-wrap: nowrap !important;
            }
            
            .modal-buttons button {
                flex: 1 !important;
                max-width: 31% !important;
                min-width: 85px !important;
                padding: 11px 6px !important;
                font-size: 11px !important;
                white-space: nowrap !important;
            }
            
            .btn-alta {
                /* Botão de alta na mesma linha - sem order */
            }
        }
        
        @media (max-width: 480px) {
            .card {
                padding: 12px !important;
            }
            
            .card-row,
            .card-row-pessoa {
                gap: 6px !important;
            }
            
            .modal-content {
                padding: 15px !important;
            }
            
            .form-grid-3-cols {
                gap: 6px !important;
            }
        }
        
        @media (max-width: 768px) and (orientation: landscape) {
            .cards-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 12px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    logSuccess('CARDS.JS V4.3 CORRIGIDO CARREGADO');
    
    if (window.CONCESSOES_LIST.length !== 13) {
        logError(`ERRO: Esperadas 13 concessões (12 + "Não se aplica"), encontradas ${window.CONCESSOES_LIST.length}`);
    } else {
        logSuccess(`✅ ${window.CONCESSOES_LIST.length} concessões confirmadas`);
    }
    
    if (window.LINHAS_CUIDADO_LIST.length !== 45) {
        logError(`ERRO: Esperadas 45 linhas, encontradas ${window.LINHAS_CUIDADO_LIST.length}`);
    } else {
        logSuccess(`✅ ${window.LINHAS_CUIDADO_LIST.length} linhas de cuidado confirmadas`);
    }
});

// =================== EXPORTS V7.0 ===================
window.renderCards = renderCards;
window.selectHospital = selectHospital;
window.createCard = createCard;
window.openAdmissaoModal = openAdmissaoModal;
window.openAtualizacaoModal = openAtualizacaoModal;
window.openReservaModal = openReservaModal;
window.openReservaFlow = openReservaFlow;
window.openAdmissaoModalComReserva = openAdmissaoModalComReserva;
window.forcarPreMarcacao = forcarPreMarcacao;
window.coletarDadosFormulario = coletarDadosFormulario;
window.getBadgeIsolamento = getBadgeIsolamento;
window.getBadgeGenero = getBadgeGenero;
window.getBadgeDiretivas = getBadgeDiretivas;
window.formatarMatriculaInput = formatarMatriculaInput;
window.formatarMatriculaExibicao = formatarMatriculaExibicao;
window.setupSearchFilter = setupSearchFilter;
window.searchLeitos = searchLeitos;

console.log('CARDS.JS V7.0 COMPLETO - SISTEMA DE RESERVAS + CAMPO IDENTIFICAÇÃO DINÂMICO!');
