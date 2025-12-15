(function() {
    'use strict';
    
    // =================== CARDS UTI V7.7 - DEZEMBRO/2025 ===================
    // V7.7:
    // - TIPO UTI substituido por MOD. CONTRATADA (Apartamento/Enfermaria)
    // - Ocupado: usa categoriaEscolhida (coluna BU)
    // - Reservado: usa categoriaEscolhida (da coluna L aba reservas)
    // V7.6:
    // - CORRIGIDO: leito.anotacoes.trim() erro quando anotacoes eh numero
    // V7.4: 
    // - Admissão bloqueada nos cards (só via QR Code)
    // - "Tipo de Convênio" renomeado para "Modalidade Contratada"
    // - Ordem invertida: Identificação primeiro, Modalidade depois
    // - Limite 2 dígitos na identificação
    // - Auto-completar zeros na matrícula (10 dígitos + dígito)
    // - Botão "Salvar Reserva" alterado para "RESERVAR"
    console.log('CARDS-UTI.JS V7.7 - Carregando...');
    
    // =================== CONFIGURACAO UTI ===================
    // V7.1: Todos os hospitais com UTI ativados (H7 nao tem UTI)
    var HOSPITAIS_UTI_ATIVOS_CARDS = window.HOSPITAIS_UTI_ATIVOS || ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H8', 'H9'];
    
    var UTI_CAPACIDADE_CARDS = {
        H1: { contratuais: 3, extras: 2, total: 5, nome: 'Neomater' },
        H2: { contratuais: 20, extras: 10, total: 30, nome: 'Cruz Azul' },
        H3: { contratuais: 2, extras: 2, total: 4, nome: 'Santa Marcelina' },
        H4: { contratuais: 4, extras: 2, total: 6, nome: 'Santa Clara' },
        H5: { contratuais: 4, extras: 2, total: 6, nome: 'Adventista' },
        H6: { contratuais: 2, extras: 2, total: 4, nome: 'Santa Cruz' },
        H7: { contratuais: 0, extras: 0, total: 0, nome: 'Santa Virginia' },
        H8: { contratuais: 2, extras: 2, total: 4, nome: 'Sao Camilo Ipiranga' },
        H9: { contratuais: 2, extras: 2, total: 4, nome: 'Sao Camilo Pompeia' }
    };
    
    var PREV_ALTA_UTI_OPTIONS = ['Hoje', '24h', '48h', '72h', '96h', 'Sem Previsao'];
    
    // =================== FUNCOES AUXILIARES ===================
    function logInfoUTI(msg) {
        console.log('[CARDS-UTI V7.7] ' + msg);
    }
    
    function showSuccessMessageUTI(msg) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 25px; background: #22c55e; color: white; border-radius: 8px; font-family: Poppins, sans-serif; font-weight: 600; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
    }
    
    function showErrorMessageUTI(msg) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 25px; background: #ef4444; color: white; border-radius: 8px; font-family: Poppins, sans-serif; font-weight: 600; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 4000);
    }
    
    // V7.4: Loading overlay para bloquear interface durante operacoes
    function showLoadingOverlayUTI(mensagem) {
        mensagem = mensagem || 'Processando...';
        // Remover overlay existente se houver
        var existente = document.getElementById('loadingOverlayUTI');
        if (existente) existente.remove();
        
        var overlay = document.createElement('div');
        overlay.id = 'loadingOverlayUTI';
        overlay.innerHTML = '<div class="loading-overlay-content-uti">' +
            '<div class="loading-spinner-uti"></div>' +
            '<div class="loading-text-uti">' + mensagem + '</div>' +
        '</div>';
        
        // Estilos inline
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 99999; backdrop-filter: blur(3px);';
        
        var content = overlay.querySelector('.loading-overlay-content-uti');
        content.style.cssText = 'text-align: center; color: white;';
        
        var spinner = overlay.querySelector('.loading-spinner-uti');
        spinner.style.cssText = 'width: 50px; height: 50px; border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #60a5fa; border-radius: 50%; margin: 0 auto 15px; animation: spinUTI 1s linear infinite;';
        
        var text = overlay.querySelector('.loading-text-uti');
        text.style.cssText = 'font-size: 16px; font-weight: 500; color: #e2e8f0;';
        
        // Adicionar keyframes
        if (!document.getElementById('loadingSpinnerStyleUTI')) {
            var style = document.createElement('style');
            style.id = 'loadingSpinnerStyleUTI';
            style.textContent = '@keyframes spinUTI { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        console.log('[CARDS-UTI] Loading ativado:', mensagem);
    }
    
    function hideLoadingOverlayUTI() {
        var overlay = document.getElementById('loadingOverlayUTI');
        if (overlay) {
            overlay.remove();
            console.log('[CARDS-UTI] Loading removido');
        }
    }
    
    function getBadgeIsolamentoUTI(isolamento) {
        if (!isolamento) return { cor: '#b2adaa', texto: 'Nao Isol', textoCor: '#ffffff' };
        var iso = String(isolamento).toLowerCase().trim();
        if (iso.indexOf('contato') !== -1) {
            return { cor: '#f59a1d', texto: 'Contato', textoCor: '#131b2e' };
        } else if (iso.indexOf('respirat') !== -1) {
            return { cor: '#c86420', texto: 'Respiratorio', textoCor: '#ffffff' };
        }
        return { cor: '#b2adaa', texto: 'Nao Isol', textoCor: '#ffffff' };
    }
    
    function getBadgeGeneroUTI(sexo) {
        if (sexo === 'Masculino') {
            return { cor: 'rgba(96,165,250,0.2)', borda: '#60a5fa', textoCor: '#60a5fa', texto: 'Masculino' };
        } else if (sexo === 'Feminino') {
            return { cor: 'rgba(236,72,153,0.2)', borda: '#ec4899', textoCor: '#ec4899', texto: 'Feminino' };
        }
        return { cor: 'rgba(255,255,255,0.05)', borda: 'rgba(255,255,255,0.1)', textoCor: '#ffffff', texto: '-' };
    }
    
    function formatarMatriculaUTI(matricula) {
        if (!matricula || matricula === '-') return '-';
        var mat = String(matricula).replace(/\D/g, '');
        if (mat.length === 0) return '-';
        if (mat.length === 1) return mat;
        return mat.slice(0, -1) + '-' + mat.slice(-1);
    }
    
    // V7.4: Auto-completar zeros à esquerda na matrícula (10 dígitos + 1 dígito verificador)
    function autoCompletarMatriculaUTI(input) {
        var valor = input.value.replace(/\D/g, ''); // Remove tudo que não é número
        if (valor.length === 0) return;
        if (valor.length < 2) return; // Precisa ter pelo menos 2 dígitos para ter número + dígito
        
        // Separar número e dígito verificador
        var digito = valor.slice(-1);
        var numero = valor.slice(0, -1);
        
        // Completar com zeros à esquerda até ter 10 dígitos
        while (numero.length < 10) {
            numero = '0' + numero;
        }
        
        // Limitar a 10 dígitos (caso tenha mais)
        numero = numero.slice(-10);
        
        // Formatar com hífen
        input.value = numero + '-' + digito;
    }
    
    // Expor função globalmente para uso nos modais
    window.autoCompletarMatriculaUTI = autoCompletarMatriculaUTI;
    
    function formatarDataHoraUTI(dataStr) {
        if (!dataStr) return '-';
        try {
            var data = new Date(dataStr);
            if (isNaN(data.getTime())) return dataStr;
            var dia = String(data.getDate()).padStart(2, '0');
            var mes = String(data.getMonth() + 1).padStart(2, '0');
            var ano = data.getFullYear();
            var hora = String(data.getHours()).padStart(2, '0');
            var min = String(data.getMinutes()).padStart(2, '0');
            return dia + '/' + mes + '/' + ano + ', ' + hora + ':' + min;
        } catch (e) {
            return dataStr;
        }
    }
    
    function calcularTempoInternacaoUTI(admissao) {
        if (!admissao) return '';
        try {
            var admData = new Date(admissao);
            if (isNaN(admData.getTime())) return '';
            var hoje = new Date();
            var diffMs = hoje - admData;
            var diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            var diffHoras = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (diffDias > 0) {
                return diffDias + 'd ' + diffHoras + 'h';
            }
            return diffHoras + 'h';
        } catch (e) {
            return '';
        }
    }
    
    function isLeitoExtraUTI(hospitalId, posicao) {
        var config = UTI_CAPACIDADE_CARDS[hospitalId];
        if (!config) return false;
        return posicao > config.contratuais;
    }
    
    // FLAG DE OCUPACAO - IDENTICO AO CARDS.JS
    function renderFlagOcupacaoUTI(hospitalId, status, posicaoOcupacao) {
        if (!posicaoOcupacao || posicaoOcupacao <= 0) return '';
        if (status === 'Vago' || status === 'vago') return '';
        
        var config = UTI_CAPACIDADE_CARDS[hospitalId];
        if (!config) return '';
        
        var contratuais = config.contratuais;
        var isExtra = posicaoOcupacao > contratuais;
        
        if (isExtra) {
            // LEITO EXTRA - borda laranja, fundo laranja
            var numExtra = posicaoOcupacao - contratuais;
            var totalExtras = config.extras;
            return '<div style="background: #f59a1d; color: #131b2e; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; margin-top: 8px; display: inline-block;">LEITO EXTRA ' + numExtra + '/' + totalExtras + '</div>';
        } else {
            // LEITO CONTRATUAL - borda azul, fundo azul
            return '<div style="background: #60a5fa; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 700; margin-top: 8px; display: inline-block;">OCUPACAO UTI ' + posicaoOcupacao + '/' + contratuais + '</div>';
        }
    }
    
    // =================== RENDERIZAR CARDS UTI ===================
    function renderCardsUTI(hospitalId) {
        logInfoUTI('Renderizando cards UTI para ' + hospitalId);
        
        var container = document.getElementById('cardsContainerUTI');
        if (!container) {
            console.error('[CARDS-UTI V7.7] Container cardsContainerUTI nao encontrado');
            return;
        }
        
        container.innerHTML = '';
        
        if (HOSPITAIS_UTI_ATIVOS_CARDS.indexOf(hospitalId) === -1) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);"><h3 style="color: #60a5fa; margin-bottom: 10px;">UTI Inativa</h3><p>Este hospital ainda nao possui leitos UTI ativos no sistema.</p></div>';
            return;
        }
        
        var dropdown = document.getElementById('hospitalDropdownUTI');
        if (dropdown && dropdown.value !== hospitalId) {
            dropdown.value = hospitalId;
        }
        
        window.currentHospitalUTI = hospitalId;
        
        var config = UTI_CAPACIDADE_CARDS[hospitalId];
        var hospitalNome = config ? config.nome : hospitalId;
        
        // V7.1: Buscar em window.leitosUTI primeiro (separado pelo api.js V7.1)
        var leitosUTI = [];
        
        if (window.leitosUTI && window.leitosUTI[hospitalId] && window.leitosUTI[hospitalId].leitos) {
            // V7.1: Dados separados em window.leitosUTI
            leitosUTI = window.leitosUTI[hospitalId].leitos;
            logInfoUTI('Fonte: window.leitosUTI (V7.1) - ' + leitosUTI.length + ' leitos');
        } else if (window.hospitalData && window.hospitalData[hospitalId] && window.hospitalData[hospitalId].leitos) {
            // Fallback V7.0: Filtrar UTI de window.hospitalData
            leitosUTI = window.hospitalData[hospitalId].leitos.filter(function(l) {
                var tipo = (l.tipo || '').toUpperCase();
                return tipo === 'UTI';
            });
            logInfoUTI('Fonte: window.hospitalData filtrado (V7.0) - ' + leitosUTI.length + ' leitos');
        } else {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p style="color: rgba(255,255,255,0.7);">Carregando dados...</p></div>';
            return;
        }
        
        logInfoUTI('Total de leitos UTI encontrados: ' + leitosUTI.length);
        
        if (leitosUTI.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);"><h3 style="color: #60a5fa; margin-bottom: 10px;">Nenhum Leito UTI</h3><p>Nao foram encontrados leitos UTI para este hospital.</p></div>';
            return;
        }
        
        var ocupados = leitosUTI.filter(function(l) {
            var status = (l.status || '').toLowerCase().trim();
            return status === 'ocupado' || status === 'em uso';
        });
        var vagos = leitosUTI.filter(function(l) {
            var status = (l.status || '').toLowerCase().trim();
            return status === 'vago' || status === '' || status === 'vagos';
        });
        
        ocupados.sort(function(a, b) { return (a.leito || 0) - (b.leito || 0); });
        vagos.sort(function(a, b) { return (a.leito || 0) - (b.leito || 0); });
        
        var reservasUTI = (window.reservasData || []).filter(function(r) {
            return r.hospital === hospitalId && r.tipo === 'UTI' && r.matricula;
        });
        
        logInfoUTI('Ocupados: ' + ocupados.length + ', Vagos: ' + vagos.length + ', Reservas: ' + reservasUTI.length);
        
        // Renderizar OCUPADOS
        ocupados.forEach(function(leito, index) {
            var posicao = index + 1;
            var card = createCardUTI(leito, hospitalNome, hospitalId, posicao);
            container.appendChild(card);
        });
        
        // Renderizar RESERVAS
        reservasUTI.forEach(function(reserva) {
            var leitoReservado = {
                leito: reserva.leito,
                status: 'Reservado',
                tipo: 'UTI',
                identificacaoLeito: String(reserva.identificacaoLeito || ''),
                isolamento: reserva.isolamento || '',
                genero: reserva.genero || '',
                nome: reserva.iniciais || '',
                matricula: String(reserva.matricula || ''),
                idade: reserva.idade || '',
                categoriaEscolhida: reserva.categoriaEscolhida || '',
                prevAlta: '',
                admAt: '',
                _isReserva: true
            };
            var card = createCardUTI(leitoReservado, hospitalNome, hospitalId, 0);
            container.appendChild(card);
        });
        
        // Renderizar 1 VAGO
        if (vagos.length > 0) {
            var card = createCardUTI(vagos[0], hospitalNome, hospitalId, 0);
            container.appendChild(card);
        }
        
        logInfoUTI('Cards renderizados: ' + container.children.length);
    }
    
    // =================== CRIAR CARD UTI - IDENTICO AO CARDS.JS ===================
    function createCardUTI(leito, hospitalNome, hospitalId, posicaoOcupacao) {
        var card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = 'background: #1a1f2e; border-radius: 12px; padding: 18px; color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: "Poppins", sans-serif;';
        
        // BORDA LARANJA SE LEITO EXTRA
        var isExtra = isLeitoExtraUTI(hospitalId, posicaoOcupacao);
        if (isExtra && posicaoOcupacao > 0) {
            card.style.cssText += ' border: 2px solid #f59a1d !important;';
        }
        
        var numeroLeito = parseInt(leito.leito);
        
        var isVago = false;
        var isReservado = false;
        var statusBgColor = '#60a5fa';
        var statusTextColor = '#ffffff';
        var statusTexto = 'Disponivel';
        
        if (leito.status === 'Em uso' || leito.status === 'ocupado' || leito.status === 'Ocupado') {
            statusBgColor = '#f59a1d';
            statusTextColor = '#131b2e';
            statusTexto = 'Ocupado';
        } else if (leito.status === 'Reservado') {
            isReservado = true;
            statusBgColor = '#f59a1d';
            statusTextColor = '#131b2e';
            statusTexto = 'Reservado';
        } else if (leito.status === 'Vago' || leito.status === 'vago') {
            isVago = true;
        }
        
        var nome = leito.nome || '';
        var matricula = leito.matricula || '';
        var matriculaFormatada = formatarMatriculaUTI(matricula);
        var idade = leito.idade || null;
        var admissao = leito.admAt || '';
        var previsaoAlta = leito.prevAlta || '';
        var sexo = leito.genero || '';
        var isolamento = leito.isolamento || 'Nao Isolamento';
        var identificacaoLeito = String(leito.identificacaoLeito || leito.identificacao_leito || '');
        var modalidadeContratada = leito.categoriaEscolhida || '';
        
        var badgeIsolamento = getBadgeIsolamentoUTI(isolamento);
        var badgeGenero = getBadgeGeneroUTI(sexo);
        
        var tempoInternacao = '';
        if (!isVago && !isReservado && admissao) {
            tempoInternacao = calcularTempoInternacaoUTI(admissao);
        }
        
        var iniciais = isVago ? '-' : (nome ? String(nome).trim() : '-');
        var idSequencial = String(numeroLeito).padStart(2, '0');
        
        var leitoDisplay = isVago ? '-' : (identificacaoLeito.trim() || 'LEITO ' + numeroLeito);
        if (!isVago && identificacaoLeito.trim()) {
            leitoDisplay = identificacaoLeito.trim().toUpperCase();
        }
        
        var circuloCor = '#60a5fa';
        var circuloStroke = isVago ? '#1a1f2e' : '#ffffff';
        
        // ESTILOS BLOQUEADOS VS NORMAL
        var styleBloqueado = 'background: rgba(100,100,100,0.3); border: 1px solid rgba(100,100,100,0.4); opacity: 0.5;';
        var styleNormal = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);';
        
        var cardHTML = '';
        
        // =================== HEADER ===================
        cardHTML += '<div class="card-header" style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div style="font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">HOSPITAL</div>';
        cardHTML += '<div style="font-size: 16px; color: #ffffff; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">' + hospitalNome + '</div>';
        cardHTML += '<div style="font-size: 10px; color: #f59a1d; font-weight: 600; margin-top: 2px;">UTI</div>';
        // FLAG DE OCUPACAO
        cardHTML += renderFlagOcupacaoUTI(hospitalId, leito.status, posicaoOcupacao);
        cardHTML += '</div>';
        
        // =================== LINHA 1: LEITO | TIPO | STATUS ===================
        cardHTML += '<div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="card-box" style="' + styleNormal + ' border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">LEITO</div>';
        cardHTML += '<div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">' + leitoDisplay + '</div>';
        cardHTML += '</div>';
        cardHTML += '<div class="card-box" style="' + styleNormal + ' border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">MOD. CONTRATADA</div>';
        cardHTML += '<div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">' + (modalidadeContratada || '-') + '</div>';
        cardHTML += '</div>';
        cardHTML += '<div class="status-badge" style="background: ' + statusBgColor + '; color: ' + statusTextColor + '; padding: 12px 6px; border-radius: 6px; font-weight: 800; text-transform: uppercase; text-align: center; font-size: 11px; letter-spacing: 0.5px; min-height: 45px; display: flex; flex-direction: column; align-items: center; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; color: ' + statusTextColor + ';">STATUS</div>';
        cardHTML += '<div class="box-value" style="font-weight: 700; font-size: 11px; line-height: 1.2; color: ' + statusTextColor + ';">' + statusTexto + '</div>';
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== LINHA 2: GENERO | ISOLAMENTO | PREV ALTA ===================
        cardHTML += '<div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="card-box" style="background: ' + badgeGenero.cor + '; border: 1px solid ' + badgeGenero.borda + '; border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: ' + badgeGenero.textoCor + '; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">GENERO</div>';
        cardHTML += '<div class="box-value" style="color: ' + badgeGenero.textoCor + '; font-weight: 700; font-size: 11px; line-height: 1.2;">' + badgeGenero.texto + '</div>';
        cardHTML += '</div>';
        cardHTML += '<div class="card-box" style="background: ' + badgeIsolamento.cor + '; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: ' + badgeIsolamento.textoCor + '; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">ISOLAMENTO</div>';
        cardHTML += '<div class="box-value" style="color: ' + badgeIsolamento.textoCor + '; font-weight: 700; font-size: 11px; line-height: 1.2;">' + badgeIsolamento.texto + '</div>';
        cardHTML += '</div>';
        cardHTML += '<div class="card-box prev-alta" style="background: #60a5fa; border: 1px solid rgba(96,165,250,0.5); border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: #ffffff; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">PREVISAO ALTA</div>';
        cardHTML += '<div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 11px; line-height: 1.2;">' + (previsaoAlta || '-') + '</div>';
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== LINHA DIVISORIA BRANCA SOLIDA ===================
        cardHTML += '<div class="divider" style="height: 2px; background: #ffffff; margin: 12px 0;"></div>';
        
        // =================== SECAO PESSOA: CIRCULO + 4 CELULAS ===================
        cardHTML += '<div class="card-row-pessoa" style="display: grid; grid-template-columns: 100px 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="pessoa-circle" style="grid-row: span 2; grid-column: 1; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: ' + circuloCor + ';">';
        cardHTML += '<svg class="pessoa-icon" viewBox="0 0 24 24" fill="none" stroke="' + circuloStroke + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 55%; height: 55%;"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path></svg>';
        cardHTML += '</div>';
        // INICIAIS
        cardHTML += '<div class="small-cell" style="' + styleNormal + ' border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">';
        cardHTML += '<div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">INICIAIS</div>';
        cardHTML += '<div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">' + iniciais + '</div>';
        cardHTML += '</div>';
        // MATRICULA
        cardHTML += '<div class="small-cell" style="' + styleNormal + ' border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">';
        cardHTML += '<div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">MATRICULA</div>';
        cardHTML += '<div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">' + matriculaFormatada + '</div>';
        cardHTML += '</div>';
        // IDADE
        cardHTML += '<div class="small-cell" style="' + styleNormal + ' border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">';
        cardHTML += '<div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">IDADE</div>';
        cardHTML += '<div class="box-value" style="color: #ffffff; font-weight: 700; font-size: 10px; line-height: 1.2;">' + (idade ? idade + ' anos' : '-') + '</div>';
        cardHTML += '</div>';
        // REGIAO - BLOQUEADO
        cardHTML += '<div class="small-cell" style="' + styleBloqueado + ' border-radius: 6px; padding: 6px; display: flex; flex-direction: column; justify-content: center; min-height: 46px;">';
        cardHTML += '<div class="box-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">REGIAO</div>';
        cardHTML += '<div class="box-value" style="color: rgba(255,255,255,0.5); font-weight: 700; font-size: 10px; line-height: 1.2;">-</div>';
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== LINHA 3: PPS | SPICT-BR | DIRETIVAS - BLOQUEADOS ===================
        cardHTML += '<div class="card-row" style="display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 12px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="card-box" style="' + styleBloqueado + ' border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">PPS</div>';
        cardHTML += '<div class="box-value" style="color: rgba(255,255,255,0.5); font-weight: 700; font-size: 11px; line-height: 1.2;">-</div>';
        cardHTML += '</div>';
        cardHTML += '<div class="card-box" style="' + styleBloqueado + ' border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">SPICT-BR</div>';
        cardHTML += '<div class="box-value" style="color: rgba(255,255,255,0.5); font-weight: 700; font-size: 11px; line-height: 1.2;">-</div>';
        cardHTML += '</div>';
        cardHTML += '<div class="card-box" style="' + styleBloqueado + ' border-radius: 6px; padding: 8px; min-height: 45px; display: flex; flex-direction: column; justify-content: center;">';
        cardHTML += '<div class="box-label" style="font-size: 9px; color: rgba(255,255,255,0.5); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">DIRETIVAS</div>';
        cardHTML += '<div class="box-value" style="color: rgba(255,255,255,0.5); font-weight: 700; font-size: 11px; line-height: 1.2;">-</div>';
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== CONCESSOES - BLOQUEADO ===================
        cardHTML += '<div class="card-section" style="margin-bottom: 15px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="section-header" style="background: rgba(100,100,100,0.5); color: rgba(255,255,255,0.5); font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">CONCESSOES PREVISTAS NA ALTA</div>';
        cardHTML += '<div class="chips-container" style="' + styleBloqueado + ' display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; border-radius: 6px; padding: 8px;">';
        cardHTML += '<span style="color: rgba(255,255,255,0.4); font-size: 10px; font-style: italic;">Campo nao disponivel para UTI</span>';
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== LINHAS DE CUIDADO - BLOQUEADO ===================
        cardHTML += '<div class="card-section" style="margin-bottom: 15px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="section-header" style="background: rgba(100,100,100,0.5); color: rgba(255,255,255,0.5); font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">LINHAS DE CUIDADO</div>';
        cardHTML += '<div class="chips-container" style="' + styleBloqueado + ' display: flex; flex-wrap: wrap; gap: 4px; min-height: 24px; border-radius: 6px; padding: 8px;">';
        cardHTML += '<span style="color: rgba(255,255,255,0.4); font-size: 10px; font-style: italic;">Campo nao disponivel para UTI</span>';
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== ANOTACOES ===================
        cardHTML += '<div class="card-section" style="margin-bottom: 15px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="section-header" style="background: #60a5fa; color: #ffffff; font-size: 10px; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">ANOTACOES</div>';
        cardHTML += '<div class="anotacoes-container" style="' + styleNormal + ' border-radius: 6px; padding: 8px; min-height: 40px;">';
        // V7.6: Converter para string antes de usar trim()
        var anotacoesTexto = leito.anotacoes ? String(leito.anotacoes).trim() : '';
        if (anotacoesTexto) {
            cardHTML += '<span style="color: rgba(255,255,255,0.9); font-size: 11px; line-height: 1.6; font-family: \'Poppins\', sans-serif; white-space: pre-wrap;">' + anotacoesTexto + '</span>';
        } else {
            cardHTML += '<span style="color: rgba(255,255,255,0.5); font-size: 10px; font-style: italic;">Sem anotacoes</span>';
        }
        cardHTML += '</div>';
        cardHTML += '</div>';
        
        // =================== FOOTER ===================
        cardHTML += '<div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); gap: 10px; font-family: \'Poppins\', sans-serif;">';
        cardHTML += '<div class="card-info" style="display: flex; gap: 8px; flex-wrap: wrap; flex: 1;">';
        if (!isVago && !isReservado && admissao) {
            cardHTML += '<div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;"><div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">ADMISSAO</div><div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">' + formatarDataHoraUTI(admissao) + '</div></div>';
        }
        if (!isVago && !isReservado && tempoInternacao) {
            cardHTML += '<div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;"><div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">INTERNADO</div><div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">' + tempoInternacao + '</div></div>';
        }
        cardHTML += '<div class="info-item" style="display: flex; flex-direction: column; opacity: 0.5;"><div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">ID</div><div class="info-value" style="color: rgba(255,255,255,0.6); font-weight: 600; font-size: 9px;">' + idSequencial + '</div></div>';
        if (isVago) {
            cardHTML += '<div class="info-item" style="display: flex; flex-direction: column;"><div class="info-label" style="font-size: 8px; color: rgba(255,255,255,0.5); font-weight: 600; text-transform: uppercase; margin-bottom: 1px;">STATUS</div><div class="info-value" style="color: #60a5fa; font-weight: 700; font-size: 9px;">' + statusTexto + '</div></div>';
        }
        cardHTML += '</div>';
        
        // BOTOES - RESERVAR AZUL (#60a5fa)
        if (isReservado) {
            cardHTML += '<div style="display: flex; gap: 8px;">';
            cardHTML += '<button class="btn-action btn-cancelar-reserva-uti" data-action="cancelar-reserva-uti" data-leito="' + numeroLeito + '" data-identificacao="' + identificacaoLeito + '" data-matricula="' + matricula + '" style="padding: 10px 16px; background: #c86420; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: \'Poppins\', sans-serif;">CANCELAR</button>';
            cardHTML += '<button class="btn-action btn-admitir-reserva-uti" data-action="admitir-reserva-uti" data-leito="' + numeroLeito + '" style="padding: 10px 16px; background: #60a5fa; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: \'Poppins\', sans-serif;">ADMITIR</button>';
            cardHTML += '</div>';
        } else if (isVago) {
            cardHTML += '<div style="display: flex; gap: 8px;">';
            // RESERVAR AZUL (igual cards.js)
            cardHTML += '<button class="btn-action btn-reservar-uti" data-action="reservar-uti" data-leito="' + numeroLeito + '" style="padding: 10px 16px; background: #60a5fa; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: \'Poppins\', sans-serif;">RESERVAR</button>';
            cardHTML += '<button class="btn-action btn-admitir-uti" data-action="admitir-uti" data-leito="' + numeroLeito + '" style="padding: 10px 16px; background: #60a5fa; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 10px; font-family: \'Poppins\', sans-serif;">ADMITIR</button>';
            cardHTML += '</div>';
        } else {
            cardHTML += '<button class="btn-action btn-atualizar-uti" data-action="atualizar-uti" data-leito="' + numeroLeito + '" style="padding: 10px 18px; background: rgba(156,163,175,0.5); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 11px; font-family: \'Poppins\', sans-serif;">ATUALIZAR</button>';
        }
        cardHTML += '</div>';
        
        card.innerHTML = cardHTML;
        
        // EVENT LISTENERS
        var admitirBtn = card.querySelector('[data-action="admitir-uti"]');
        if (admitirBtn) {
            admitirBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // V7.4: Admissão só permitida via QR Code
                alert('Admissão só permitida pelo sistema de admissão via QR Code');
            });
        }
        
        var reservarBtn = card.querySelector('[data-action="reservar-uti"]');
        if (reservarBtn) {
            reservarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModalReservaUTI(numeroLeito, leito);
            });
        }
        
        var atualizarBtn = card.querySelector('[data-action="atualizar-uti"]');
        if (atualizarBtn) {
            atualizarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModalAtualizarUTI(numeroLeito, leito);
            });
        }
        
        var cancelarBtn = card.querySelector('[data-action="cancelar-reserva-uti"]');
        if (cancelarBtn) {
            cancelarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Deseja cancelar esta reserva UTI?')) {
                    if (window.cancelarReserva) {
                        showLoadingOverlayUTI('Cancelando reserva...');
                        window.cancelarReserva(hospitalId, cancelarBtn.dataset.identificacao, cancelarBtn.dataset.matricula)
                            .then(function() {
                                hideLoadingOverlayUTI();
                                showSuccessMessageUTI('Reserva UTI cancelada!');
                                setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                            })
                            .catch(function(error) {
                                hideLoadingOverlayUTI();
                                showErrorMessageUTI('Erro: ' + error.message);
                            });
                    }
                }
            });
        }
        
        var admitirReservaBtn = card.querySelector('[data-action="admitir-reserva-uti"]');
        if (admitirReservaBtn) {
            admitirReservaBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // V7.4: Admissão só permitida via QR Code
                alert('Admissão só permitida pelo sistema de admissão via QR Code');
            });
        }
        
        return card;
    }
    
    // =================== MODAL DE RESERVA UTI ===================
    function openModalReservaUTI(leitoNumero, dadosLeito) {
        var hospitalId = window.currentHospitalUTI || 'H2';
        var config = UTI_CAPACIDADE_CARDS[hospitalId];
        var hospitalNome = config ? config.nome : hospitalId;
        var idSequencial = String(leitoNumero).padStart(2, '0');
        
        var existingModal = document.getElementById('modalReservaUTI');
        if (existingModal) existingModal.remove();
        
        var estiloCampoBloqueado = 'background: #1f2937 !important; color: #6b7280 !important;';
        
        var modal = document.createElement('div');
        modal.id = 'modalReservaUTI';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(5px); font-family: \'Poppins\', sans-serif;';
        
        // Gerar opcoes de idade se disponivel
        var idadeOptions = '';
        if (window.IDADE_OPTIONS) {
            idadeOptions = window.IDADE_OPTIONS.map(function(idade) {
                return '<option value="' + idade + '">' + idade + ' anos</option>';
            }).join('');
        } else {
            for (var i = 18; i <= 120; i++) {
                idadeOptions += '<option value="' + i + '">' + i + ' anos</option>';
            }
        }
        
        var modalHTML = '';
        modalHTML += '<div style="background: #1e293b; border-radius: 16px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">';
        
        // V7.3: HEADER DISCRETO (igual cards.js padrao)
        modalHTML += '<div style="padding: 25px 25px 0 25px; text-align: center;">';
        modalHTML += '<h2 style="color: #f59a1d; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; text-transform: uppercase;">Reservar Leito UTI</h2>';
        modalHTML += '<div style="margin-bottom: 20px; padding: 12px; background: rgba(245,154,29,0.1); border: 1px solid rgba(245,154,29,0.3); border-radius: 8px;"><div style="color: #f59a1d; font-size: 12px;"><strong>Reserva de Leito:</strong> Preencha apenas os campos obrigatorios. Os demais campos serao preenchidos no momento da admissao.</div></div>';
        modalHTML += '<div style="margin-bottom: 20px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;"><strong>Hospital:</strong> ' + hospitalNome + ' | <strong>Leito:</strong> ' + idSequencial + ' | <strong>LEITO UTI</strong></div>';
        modalHTML += '</div>';
        
        // FORM
        modalHTML += '<div style="padding: 25px;">';
        modalHTML += '<form id="formReservaUTI">';
        
        // LINHA 1: IDENTIFICACAO | MODALIDADE CONTRATADA | ISOLAMENTO
        modalHTML += '<div style="margin-bottom: 20px;"><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Identificacao do Leito <span style="color: #c86420;">*</span></label>';
        modalHTML += '<input id="resUtiIdentificacao" type="text" placeholder="Ex: 22" maxlength="2" required oninput="this.value = this.value.replace(/[^0-9]/g, \'\')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; box-sizing: border-box;"></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Modalidade Contratada <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="resUtiTipoConvenio" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option><option value="Apartamento">Apartamento</option><option value="Enfermaria">Enfermaria</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Isolamento <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="resUtiIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option><option value="Nao Isolamento">Nao Isolamento</option><option value="Isolamento de Contato">Isolamento de Contato</option><option value="Isolamento Respiratorio">Isolamento Respiratorio</option></select></div>';
        modalHTML += '</div></div>';
        
        // LINHA 2: GENERO | REGIAO (bloqueado) | PREV ALTA (bloqueado)
        modalHTML += '<div style="margin-bottom: 20px;"><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Genero <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="resUtiGenero" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">Regiao</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">Previsao Alta</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Preenchido na admissao</option></select></div>';
        modalHTML += '</div></div>';
        
        // LINHA 3: INICIAIS | MATRICULA | IDADE
        modalHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Iniciais (opcional)</label>';
        modalHTML += '<input id="resUtiNome" type="text" placeholder="Ex: A B C" maxlength="20" oninput="if(window.formatarIniciaisAutomatico) window.formatarIniciaisAutomatico(this);" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; letter-spacing: 2px; box-sizing: border-box;"></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Matricula (opcional)</label>';
        modalHTML += '<input id="resUtiMatricula" type="text" placeholder="Ex: 0000000123-4" maxlength="12" oninput="if(window.formatarMatriculaInput) window.formatarMatriculaInput(this);" onblur="if(window.autoCompletarMatriculaUTI) window.autoCompletarMatriculaUTI(this);" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; box-sizing: border-box;"></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Idade (opcional)</label>';
        modalHTML += '<select id="resUtiIdade" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">';
        modalHTML += '<option value="">Ex: 75</option>' + idadeOptions + '</select></div>';
        modalHTML += '</div>';
        
        // LINHA 4: PPS | SPICT-BR | DIRETIVAS (todos bloqueados)
        modalHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">PPS</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">SPICT-BR</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">Diretivas</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '</div>';
        
        // CONCESSOES BLOQUEADO
        modalHTML += '<div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 8px; color: #6b7280; font-weight: 700; font-size: 13px;">Concessoes Previstas na Alta</label>';
        modalHTML += '<div style="background: #1f2937; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; text-align: center;"><span style="color: #6b7280; font-size: 12px; font-style: italic;">Campo nao disponivel para leitos UTI</span></div></div>';
        
        // LINHAS DE CUIDADO BLOQUEADO
        modalHTML += '<div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 8px; color: #6b7280; font-weight: 700; font-size: 13px;">Linhas de Cuidado</label>';
        modalHTML += '<div style="background: #1f2937; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; text-align: center;"><span style="color: #6b7280; font-size: 12px; font-style: italic;">Campo nao disponivel para leitos UTI</span></div></div>';
        
        // BOTOES - V7.3 PADRAO
        modalHTML += '<div style="display: flex; gap: 15px; margin-top: 25px;">';
        modalHTML += '<button type="button" id="btnCancelarReservaUTI" style="flex: 1; padding: 14px 20px; background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Cancelar</button>';
        modalHTML += '<button type="submit" style="flex: 1; padding: 14px 20px; background: #f59a1d; color: #131b2e; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">RESERVAR</button>';
        modalHTML += '</div>';
        
        modalHTML += '</form></div></div>';
        
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);
        
        document.getElementById('btnCancelarReservaUTI').addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        
        document.getElementById('formReservaUTI').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var matriculaRaw = document.getElementById('resUtiMatricula').value.replace(/\D/g, '');
            
            var params = new URLSearchParams();
            params.append('action', 'reservar');
            params.append('hospital', hospitalId);
            params.append('leito', leitoNumero);
            params.append('tipo', 'UTI');
            params.append('categoriaEscolhida', document.getElementById('resUtiTipoConvenio').value);
            params.append('identificacaoLeito', document.getElementById('resUtiIdentificacao').value);
            params.append('isolamento', document.getElementById('resUtiIsolamento').value);
            params.append('genero', document.getElementById('resUtiGenero').value);
            params.append('iniciais', document.getElementById('resUtiNome').value.replace(/\s/g, ''));
            params.append('matricula', matriculaRaw);
            params.append('idade', document.getElementById('resUtiIdade').value);
            
            showLoadingOverlayUTI('Salvando reserva...');
            
            fetch(window.API_URL + '?' + params.toString())
                .then(function(response) { return response.json(); })
                .then(function(result) {
                    if (result.ok || result.success) {
                        modal.remove();
                        hideLoadingOverlayUTI();
                        showSuccessMessageUTI('Leito UTI reservado!');
                        if (window.carregarReservas) {
                            window.carregarReservas().then(function() {
                                setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                            });
                        } else {
                            setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                        }
                    } else {
                        throw new Error(result.message || result.error || 'Erro ao reservar');
                    }
                })
                .catch(function(error) {
                    hideLoadingOverlayUTI();
                    showErrorMessageUTI('Erro: ' + error.message);
                });
        });
    }
    
    // =================== MODAL DE ADMISSAO UTI ===================
    function openModalAdmissaoUTI(leitoNumero, dadosLeito, isFromReserva) {
        var hospitalId = window.currentHospitalUTI || 'H2';
        var config = UTI_CAPACIDADE_CARDS[hospitalId];
        var hospitalNome = config ? config.nome : hospitalId;
        var idSequencial = String(leitoNumero).padStart(2, '0');
        
        var existingModal = document.getElementById('modalAdmissaoUTI');
        if (existingModal) existingModal.remove();
        
        var estiloCampoBloqueado = 'background: #1f2937 !important; color: #6b7280 !important;';
        
        var tipoConvenio = isFromReserva ? (dadosLeito.categoriaEscolhida || '') : '';
        var identificacao = isFromReserva ? (dadosLeito.identificacaoLeito || '') : '';
        var isolamento = isFromReserva ? (dadosLeito.isolamento || '') : '';
        var genero = isFromReserva ? (dadosLeito.genero || '') : '';
        var iniciais = isFromReserva ? (dadosLeito.nome || '') : '';
        var matricula = isFromReserva ? (dadosLeito.matricula || '') : '';
        var idade = isFromReserva ? (dadosLeito.idade || '') : '';
        
        if (iniciais && iniciais.indexOf(' ') === -1) {
            iniciais = iniciais.split('').join(' ');
        }
        
        var modal = document.createElement('div');
        modal.id = 'modalAdmissaoUTI';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(5px); font-family: \'Poppins\', sans-serif;';
        
        var idadeOptions = '';
        if (window.IDADE_OPTIONS) {
            idadeOptions = window.IDADE_OPTIONS.map(function(i) {
                return '<option value="' + i + '"' + (String(idade) === String(i) ? ' selected' : '') + '>' + i + ' anos</option>';
            }).join('');
        } else {
            for (var i = 18; i <= 120; i++) {
                idadeOptions += '<option value="' + i + '"' + (String(idade) === String(i) ? ' selected' : '') + '>' + i + ' anos</option>';
            }
        }
        
        var prevAltaOptions = PREV_ALTA_UTI_OPTIONS.map(function(p) {
            return '<option value="' + p + '">' + p + '</option>';
        }).join('');
        
        var modalHTML = '';
        modalHTML += '<div style="background: #1e293b; border-radius: 16px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">';
        
        // V7.3: HEADER DISCRETO (igual cards.js padrao)
        modalHTML += '<div style="padding: 25px 25px 0 25px; text-align: center;">';
        modalHTML += '<h2 style="color: #60a5fa; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; text-transform: uppercase;">' + (isFromReserva ? 'Confirmar Admissao' : 'Admitir Paciente') + ' - UTI</h2>';
        modalHTML += '<div style="margin-bottom: 20px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;"><strong>Hospital:</strong> ' + hospitalNome + ' | <strong>ID:</strong> ' + idSequencial + ' | <strong>LEITO UTI</strong></div>';
        modalHTML += '</div>';
        
        modalHTML += '<div style="padding: 25px;">';
        modalHTML += '<form id="formAdmissaoUTI">';
        
        // LINHA 1: IDENTIFICACAO | MODALIDADE CONTRATADA | ISOLAMENTO
        modalHTML += '<div style="margin-bottom: 20px;"><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Identificacao do Leito <span style="color: #c86420;">*</span></label>';
        modalHTML += '<input id="admUtiIdentificacao" type="text" value="' + identificacao + '" placeholder="Ex: 22" maxlength="2" required oninput="this.value = this.value.replace(/[^0-9]/g, \'\')" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; box-sizing: border-box;"></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Modalidade Contratada <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="admUtiTipoConvenio" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option><option value="Apartamento"' + (tipoConvenio === 'Apartamento' ? ' selected' : '') + '>Apartamento</option><option value="Enfermaria"' + (tipoConvenio === 'Enfermaria' ? ' selected' : '') + '>Enfermaria</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Isolamento <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="admUtiIsolamento" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option><option value="Nao Isolamento"' + (isolamento.indexOf('Nao') !== -1 || !isolamento ? ' selected' : '') + '>Nao Isolamento</option><option value="Isolamento de Contato"' + (isolamento === 'Isolamento de Contato' ? ' selected' : '') + '>Isolamento de Contato</option><option value="Isolamento Respiratorio"' + (isolamento.indexOf('Respirat') !== -1 ? ' selected' : '') + '>Isolamento Respiratorio</option></select></div>';
        modalHTML += '</div></div>';
        
        // LINHA 2
        modalHTML += '<div style="margin-bottom: 20px;"><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Genero <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="admUtiGenero" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option><option value="Masculino"' + (genero === 'Masculino' ? ' selected' : '') + '>Masculino</option><option value="Feminino"' + (genero === 'Feminino' ? ' selected' : '') + '>Feminino</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">Regiao</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Previsao Alta</label>';
        modalHTML += '<select id="admUtiPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="">Selecione...</option>' + prevAltaOptions + '</select></div>';
        modalHTML += '</div></div>';
        
        // LINHA 3
        modalHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Iniciais do Paciente <span style="color: #c86420;">*</span></label>';
        modalHTML += '<input id="admUtiNome" type="text" value="' + iniciais + '" placeholder="Ex: A B C" maxlength="20" required oninput="if(window.formatarIniciaisAutomatico) window.formatarIniciaisAutomatico(this);" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; letter-spacing: 2px; box-sizing: border-box;"></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Matricula <span style="color: #c86420;">*</span></label>';
        modalHTML += '<input id="admUtiMatricula" type="text" value="' + formatarMatriculaUTI(matricula) + '" placeholder="Ex: 0000000123-4" maxlength="12" required oninput="if(window.formatarMatriculaInput) window.formatarMatriculaInput(this);" onblur="if(window.autoCompletarMatriculaUTI) window.autoCompletarMatriculaUTI(this);" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px; box-sizing: border-box;"></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Idade <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="admUtiIdade" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">';
        modalHTML += '<option value="">Selecione...</option>' + idadeOptions + '</select></div>';
        modalHTML += '</div>';
        
        // LINHA 4 BLOQUEADOS
        modalHTML += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">PPS</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">SPICT-BR <span style="color: #c86420;">*</span></label>';
        modalHTML += '<select id="admUtiSpict" required style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;"><option value="nao_elegivel">Nao elegivel</option><option value="elegivel">Elegivel</option></select></div>';
        modalHTML += '<div><label style="display: block; margin-bottom: 5px; color: #6b7280; font-weight: 600; font-size: 12px;">Diretivas</label>';
        modalHTML += '<select disabled style="width: 100%; padding: 12px; ' + estiloCampoBloqueado + ' border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 14px;"><option value="">Nao disponivel UTI</option></select></div>';
        modalHTML += '</div>';
        
        // CONCESSOES BLOQUEADO
        modalHTML += '<div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 8px; color: #6b7280; font-weight: 700; font-size: 13px;">Concessoes Previstas na Alta</label>';
        modalHTML += '<div style="background: #1f2937; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; text-align: center;"><span style="color: #6b7280; font-size: 12px; font-style: italic;">Campo nao disponivel para leitos UTI</span></div></div>';
        
        // LINHAS BLOQUEADO
        modalHTML += '<div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 8px; color: #6b7280; font-weight: 700; font-size: 13px;">Linhas de Cuidado</label>';
        modalHTML += '<div style="background: #1f2937; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; text-align: center;"><span style="color: #6b7280; font-size: 12px; font-style: italic;">Campo nao disponivel para leitos UTI</span></div></div>';
        
        // ANOTACOES
        modalHTML += '<div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 8px; color: #e2e8f0; font-weight: 700; font-size: 13px;">Anotacoes</label>';
        modalHTML += '<textarea id="admUtiAnotacoes" rows="3" maxlength="800" placeholder="Observacoes (max 800 caracteres)" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box;"></textarea></div>';
        
        // BOTOES - V7.3 PADRAO
        modalHTML += '<div style="display: flex; gap: 15px; margin-top: 25px;">';
        modalHTML += '<button type="button" id="btnCancelarAdmissaoUTI" style="flex: 1; padding: 14px 20px; background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">CANCELAR</button>';
        modalHTML += '<button type="submit" style="flex: 1; padding: 14px 20px; background: #0676bb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">' + (isFromReserva ? 'CONFIRMAR' : 'ADMITIR') + '</button>';
        modalHTML += '</div>';
        
        modalHTML += '</form></div></div>';
        
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);
        
        document.getElementById('btnCancelarAdmissaoUTI').addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        
        document.getElementById('formAdmissaoUTI').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var iniciaisRaw = document.getElementById('admUtiNome').value.replace(/\s/g, '');
            var matriculaRaw = document.getElementById('admUtiMatricula').value.replace(/\D/g, '');
            
            var dados = {
                hospital: hospitalId,
                leito: leitoNumero,
                tipo: 'UTI',
                categoriaEscolhida: document.getElementById('admUtiTipoConvenio').value,
                identificacaoLeito: document.getElementById('admUtiIdentificacao').value,
                isolamento: document.getElementById('admUtiIsolamento').value,
                genero: document.getElementById('admUtiGenero').value,
                nome: iniciaisRaw,
                matricula: matriculaRaw,
                idade: document.getElementById('admUtiIdade').value,
                prevAlta: document.getElementById('admUtiPrevAlta').value,
                anotacoes: document.getElementById('admUtiAnotacoes').value,
                pps: '',
                spict: document.getElementById('admUtiSpict').value,
                regiao: '',
                diretivas: '',
                concessoes: '[]',
                linhas: '[]'
            };
            
            var params = new URLSearchParams();
            params.append('action', 'admitir');
            Object.keys(dados).forEach(function(key) {
                params.append(key, dados[key]);
            });
            
            showLoadingOverlayUTI('Admitindo paciente...');
            
            fetch(window.API_URL + '?' + params.toString())
                .then(function(response) { return response.json(); })
                .then(function(result) {
                    if (result.ok || result.success) {
                        if (isFromReserva && dadosLeito._isReserva && window.cancelarReserva) {
                            window.cancelarReserva(hospitalId, dadosLeito.identificacaoLeito, dadosLeito.matricula).catch(function() {});
                        }
                        modal.remove();
                        hideLoadingOverlayUTI();
                        showSuccessMessageUTI('Paciente admitido na UTI!');
                        if (window.loadHospitalData) {
                            window.loadHospitalData().then(function() {
                                setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                            });
                        } else {
                            setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                        }
                    } else {
                        throw new Error(result.message || result.error || 'Erro ao admitir');
                    }
                })
                .catch(function(error) {
                    hideLoadingOverlayUTI();
                    showErrorMessageUTI('Erro: ' + error.message);
                });
        });
    }
    
    // =================== MODAL DE ATUALIZAR UTI ===================
    function openModalAtualizarUTI(leitoNumero, leito) {
        var hospitalId = window.currentHospitalUTI || 'H2';
        var config = UTI_CAPACIDADE_CARDS[hospitalId];
        var hospitalNome = config ? config.nome : hospitalId;
        
        var existingModal = document.getElementById('modalAtualizarUTI');
        if (existingModal) existingModal.remove();
        
        var identificacao = leito.identificacaoLeito || leito.identificacao_leito || '';
        var isolamento = leito.isolamento || 'Nao Isolamento';
        var prevAlta = leito.prevAlta || '';
        var anotacoes = leito.anotacoes || '';
        var spictAtual = leito.spict || 'nao_elegivel';
        
        var modal = document.createElement('div');
        modal.id = 'modalAtualizarUTI';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(5px); font-family: \'Poppins\', sans-serif;';
        
        var prevAltaOptions = PREV_ALTA_UTI_OPTIONS.map(function(p) {
            return '<option value="' + p + '"' + (prevAlta === p ? ' selected' : '') + '>' + p + '</option>';
        }).join('');
        
        var modalHTML = '';
        modalHTML += '<div style="background: #1e293b; border-radius: 16px; max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">';
        
        // V7.3: HEADER DISCRETO (igual cards.js padrao)
        modalHTML += '<div style="padding: 25px 25px 0 25px; text-align: center;">';
        modalHTML += '<h2 style="color: #60a5fa; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; text-transform: uppercase;">Atualizar Paciente UTI</h2>';
        modalHTML += '<div style="margin-bottom: 20px; padding: 15px; background: rgba(96,165,250,0.1); border-radius: 8px;"><strong>Hospital:</strong> ' + hospitalNome + ' | <strong>Leito:</strong> ' + (identificacao || leitoNumero) + '</div>';
        modalHTML += '<div style="margin-bottom: 15px; color: #f59a1d; font-size: 14px;">' + (leito.nome || '') + ' - ' + formatarMatriculaUTI(leito.matricula) + '</div>';
        modalHTML += '</div>';
        
        modalHTML += '<div style="padding: 25px;">';
        modalHTML += '<form id="formAtualizarUTI">';
        
        // ISOLAMENTO
        modalHTML += '<div style="margin-bottom: 20px;">';
        modalHTML += '<label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Isolamento</label>';
        modalHTML += '<select id="updUtiIsolamento" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">';
        modalHTML += '<option value="Nao Isolamento"' + (isolamento.indexOf('Nao') !== -1 || !isolamento ? ' selected' : '') + '>Nao Isolamento</option>';
        modalHTML += '<option value="Isolamento de Contato"' + (isolamento === 'Isolamento de Contato' ? ' selected' : '') + '>Isolamento de Contato</option>';
        modalHTML += '<option value="Isolamento Respiratorio"' + (isolamento.indexOf('Respirat') !== -1 ? ' selected' : '') + '>Isolamento Respiratorio</option>';
        modalHTML += '</select></div>';
        
        // PREVISAO ALTA - SEM TURNOS
        modalHTML += '<div style="margin-bottom: 20px;">';
        modalHTML += '<label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Previsao de Alta</label>';
        modalHTML += '<select id="updUtiPrevAlta" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">';
        modalHTML += '<option value="">Selecione...</option>' + prevAltaOptions + '</select></div>';
        
        // SPICT-BR - V7.5: Reativado
        modalHTML += '<div style="margin-bottom: 20px;">';
        modalHTML += '<label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">SPICT-BR</label>';
        modalHTML += '<select id="updUtiSpict" style="width: 100%; padding: 12px; background: #374151 !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; font-size: 14px;">';
        modalHTML += '<option value="nao_elegivel"' + (spictAtual === 'nao_elegivel' ? ' selected' : '') + '>Nao elegivel</option>';
        modalHTML += '<option value="elegivel"' + (spictAtual === 'elegivel' ? ' selected' : '') + '>Elegivel</option>';
        modalHTML += '</select></div>';
        
        // ANOTACOES
        modalHTML += '<div style="margin-bottom: 20px;">';
        modalHTML += '<label style="display: block; margin-bottom: 5px; color: #e2e8f0; font-weight: 600; font-size: 12px;">Anotacoes</label>';
        modalHTML += '<textarea id="updUtiAnotacoes" rows="4" maxlength="800" placeholder="Observacoes" style="width: 100%; padding: 12px; background: #374151; color: #ffffff; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box;">' + anotacoes + '</textarea></div>';
        
        // BOTOES - V7.3 PADRAO
        modalHTML += '<div style="display: flex; gap: 10px; margin-top: 25px;">';
        modalHTML += '<button type="button" id="btnDarAltaUTI" style="flex: 1; padding: 14px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px;">DAR ALTA</button>';
        modalHTML += '<button type="button" id="btnCancelarAtualizarUTI" style="flex: 1; padding: 14px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">CANCELAR</button>';
        modalHTML += '<button type="submit" style="flex: 1; padding: 14px; background: #0676bb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px;">SALVAR</button>';
        modalHTML += '</div>';
        
        modalHTML += '</form></div></div>';
        
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);
        
        document.getElementById('btnCancelarAtualizarUTI').addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        
        document.getElementById('btnDarAltaUTI').addEventListener('click', function() {
            if (!confirm('Confirma a alta deste paciente UTI?')) return;
            
            var params = new URLSearchParams();
            params.append('action', 'daralta');
            params.append('hospital', hospitalId);
            params.append('leito', leitoNumero);
            
            showLoadingOverlayUTI('Processando alta...');
            
            fetch(window.API_URL + '?' + params.toString())
                .then(function(response) { return response.json(); })
                .then(function(result) {
                    if (result.ok || result.success) {
                        modal.remove();
                        hideLoadingOverlayUTI();
                        showSuccessMessageUTI('Alta realizada com sucesso!');
                        if (window.loadHospitalData) {
                            window.loadHospitalData().then(function() {
                                setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                            });
                        } else {
                            setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                        }
                    } else {
                        throw new Error(result.message || result.error || 'Erro ao dar alta');
                    }
                })
                .catch(function(error) {
                    hideLoadingOverlayUTI();
                    showErrorMessageUTI('Erro: ' + error.message);
                });
        });
        
        document.getElementById('formAtualizarUTI').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var params = new URLSearchParams();
            params.append('action', 'atualizar');
            params.append('hospital', hospitalId);
            params.append('leito', leitoNumero);
            params.append('isolamento', document.getElementById('updUtiIsolamento').value);
            params.append('prevAlta', document.getElementById('updUtiPrevAlta').value);
            params.append('spict', document.getElementById('updUtiSpict').value);
            params.append('anotacoes', document.getElementById('updUtiAnotacoes').value);
            
            showLoadingOverlayUTI('Atualizando dados...');
            
            fetch(window.API_URL + '?' + params.toString())
                .then(function(response) { return response.json(); })
                .then(function(result) {
                    if (result.ok || result.success) {
                        modal.remove();
                        hideLoadingOverlayUTI();
                        showSuccessMessageUTI('Dados atualizados!');
                        if (window.loadHospitalData) {
                            window.loadHospitalData().then(function() {
                                setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                            });
                        } else {
                            setTimeout(function() { renderCardsUTI(hospitalId); }, 500);
                        }
                    } else {
                        throw new Error(result.message || result.error || 'Erro ao atualizar');
                    }
                })
                .catch(function(error) {
                    hideLoadingOverlayUTI();
                    showErrorMessageUTI('Erro: ' + error.message);
                });
        });
    }
    
    // =================== EXPORTAR FUNCOES GLOBAIS ===================
    window.selectHospitalUTI = function(hospitalId) {
        logInfoUTI('Selecionando hospital UTI: ' + hospitalId);
        window.currentHospitalUTI = hospitalId;
        renderCardsUTI(hospitalId);
    };
    
    window.renderCardsUTI = renderCardsUTI;
    
    console.log('CARDS-UTI.JS V7.7 - Carregado com sucesso!');
    console.log('[CARDS-UTI V7.7] Hospitais UTI ativos: ' + HOSPITAIS_UTI_ATIVOS_CARDS.join(', '));
    console.log('[CARDS-UTI V7.7] Fonte de dados: window.leitosUTI (V7.1) ou window.hospitalData (fallback)');
    console.log('[CARDS-UTI V7.7] Botao RESERVAR = AZUL (#60a5fa)');
    console.log('[CARDS-UTI V7.7] Flag LEITO CONTRATUAL/EXTRA implementada');
    console.log('[CARDS-UTI V7.7] NOVIDADE: MOD. CONTRATADA substituiu TIPO UTI no card');
    
})();