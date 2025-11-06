// =================== QRCODE-OPTIMIZED.JS - V4.2 CORRIGIDO ===================
// CORRIGIDO: Função de impressão personalizada (erro 404)
// NOVO: Seleção individual de leitos com dados do paciente
// Sistema otimizado com carregamento sequencial

const QR_API = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE: 300,  // pixels
    DELAY: 150, // delay entre requisições (ms)
    HOSPITAIS: {
        H1: { nome: 'Neomater', leitos: 10 },
        H2: { nome: 'Cruz Azul', leitos: 36 },
        H3: { nome: 'Santa Marcelina', leitos: 7 },
        H4: { nome: 'Santa Clara', leitos: 13 },
        H5: { nome: 'Adventista', leitos: 13 },
        H6: { nome: 'Santa Cruz', leitos: 7 },
        H7: { nome: 'Santa Virgínia', leitos: 7 }
    }
};

// Variáveis de controle
let isGenerating = false;
let generationProgress = 0;
let totalQRCodes = 0;
let leitosSelecionados = [];

// =================== FUNÇÃO PARA OBTER NOME DO LEITO FORMATADO ===================
function getNomeLeitoFormatado(hospitalId, numeroLeito) {
    if (hospitalId === 'H2') {
        if (numeroLeito >= 1 && numeroLeito <= 20) {
            return `Apartamento ${String(numeroLeito).padStart(2, '0')}`;
        } else if (numeroLeito >= 21 && numeroLeito <= 36) {
            const parIndex = Math.floor((numeroLeito - 21) / 2);
            const numeroQuarto = 711 + (parIndex * 2);
            const subNumero = ((numeroLeito - 21) % 2) + 1;
            return `Enfermaria ${numeroQuarto}.${subNumero}`;
        }
    }
    return `Leito ${String(numeroLeito).padStart(2, '0')}`;
}

// =================== FUNÇÃO PRINCIPAL - MODAL COM OPÇÕES ===================
window.openQRCodesSimple = function() {
    console.log('Abrindo gerador de QR Codes V4.2...');
    
    if (document.querySelector('.qr-modal-simple')) {
        console.log('Modal já está aberto');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'qr-modal-simple';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>QR Codes dos Leitos - Sistema V4.2</h2>
                <button onclick="closeQRModalSimple()" class="close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-tabs">
                    <button class="qr-tab active" onclick="switchQRTab('todos')">
                        Todos os Leitos
                    </button>
                    <button class="qr-tab" onclick="switchQRTab('selecao')">
                        Seleção Personalizada
                    </button>
                </div>
                
                <!-- TAB 1: TODOS OS LEITOS -->
                <div id="tabTodos" class="qr-tab-content active">
                    <div class="qr-controls">
                        <select id="qrHospitalSelect" onchange="generateQRCodesSimple()">
                            <option value="H5">Adventista (13 leitos)</option>
                            <option value="H2">Cruz Azul (36 leitos)</option>
                            <option value="H1">Neomater (10 leitos)</option>
                            <option value="H4">Santa Clara (13 leitos)</option>
                            <option value="H6">Santa Cruz (7 leitos)</option>
                            <option value="H3">Santa Marcelina (7 leitos)</option>
                            <option value="H7">Santa Virgínia (7 leitos)</option>
                        </select>
                        <button onclick="generateAllQRCodesOptimized()" class="btn-all" id="btnGenerateAll">
                            Gerar Todos (93 QR Codes)
                        </button>
                        <button onclick="window.print()" class="btn-print">Imprimir</button>
                    </div>
                    
                    <div id="progressContainer" class="progress-container" style="display: none;">
                        <div class="progress-info">
                            <span id="progressText">Gerando QR Codes...</span>
                            <span id="progressCount">0/93</span>
                        </div>
                        <div class="progress-bar">
                            <div id="progressFill" class="progress-fill"></div>
                        </div>
                    </div>
                    
                    <div id="qrCodesContainer" class="qr-container"></div>
                </div>
                
                <!-- TAB 2: SELEÇÃO PERSONALIZADA -->
                <div id="tabSelecao" class="qr-tab-content" style="display: none;">
                    <div class="selecao-controls">
                        <div class="selecao-header">
                            <h3>1. Selecione o Hospital</h3>
                            <select id="selecaoHospitalSelect" onchange="carregarLeitosParaSelecao()">
                                <option value="">Escolha um hospital...</option>
                                <option value="H5">Adventista</option>
                                <option value="H2">Cruz Azul</option>
                                <option value="H1">Neomater</option>
                                <option value="H4">Santa Clara</option>
                                <option value="H6">Santa Cruz</option>
                                <option value="H3">Santa Marcelina</option>
                                <option value="H7">Santa Virgínia</option>
                            </select>
                        </div>
                        
                        <div id="leitosSelecaoContainer" style="display: none;">
                            <div class="selecao-header">
                                <h3>2. Selecione os Leitos Ocupados</h3>
                                <div class="selecao-actions">
                                    <button onclick="selecionarTodosLeitos()" class="btn-secondary">
                                        Selecionar Todos
                                    </button>
                                    <button onclick="limparSelecaoLeitos()" class="btn-secondary">
                                        Limpar Seleção
                                    </button>
                                </div>
                            </div>
                            
                            <div id="tabelaLeitosSelecao" class="tabela-leitos"></div>
                            
                            <div class="selecao-footer">
                                <div class="contador-selecao">
                                    <strong><span id="contadorSelecionados">0</span></strong> leitos selecionados
                                </div>
                                <button onclick="gerarQRCodesSelecionados()" class="btn-gerar-selecao" id="btnGerarSelecao" disabled>
                                    Gerar Impressão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    if (!document.getElementById('qrOptimizedStyles')) {
        addOptimizedStyles();
    }
    
    generateQRCodesSimple();
};

// =================== TROCAR ABA ===================
window.switchQRTab = function(tab) {
    document.querySelectorAll('.qr-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.qr-tab-content').forEach(content => content.style.display = 'none');
    
    if (tab === 'todos') {
        document.querySelector('.qr-tab:nth-child(1)').classList.add('active');
        document.getElementById('tabTodos').style.display = 'block';
    } else {
        document.querySelector('.qr-tab:nth-child(2)').classList.add('active');
        document.getElementById('tabSelecao').style.display = 'block';
    }
};

// =================== CARREGAR LEITOS PARA SELEÇÃO ===================
window.carregarLeitosParaSelecao = function() {
    const hospitalId = document.getElementById('selecaoHospitalSelect').value;
    const container = document.getElementById('leitosSelecaoContainer');
    const tabela = document.getElementById('tabelaLeitosSelecao');
    
    if (!hospitalId) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    leitosSelecionados = [];
    atualizarContadorSelecao();
    
    // Buscar dados do hospital
    const hospitalData = window.hospitalData?.[hospitalId];
    if (!hospitalData || !hospitalData.leitos) {
        tabela.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280;">Carregando dados...</p>';
        return;
    }
    
    // Filtrar apenas leitos ocupados
    const leitosOcupados = hospitalData.leitos.filter(l => 
        l.status === 'Ocupado' || l.status === 'Em uso' || l.status === 'ocupado'
    );
    
    if (leitosOcupados.length === 0) {
        tabela.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280;">Nenhum leito ocupado neste hospital.</p>';
        return;
    }
    
    // Criar tabela
    let html = `
        <table class="tabela-selecao">
            <thead>
                <tr>
                    <th style="width: 50px;">
                        <input type="checkbox" id="checkTodos" onchange="toggleTodosLeitos(this.checked)">
                    </th>
                    <th>Leito</th>
                    <th>Matrícula</th>
                    <th>Iniciais</th>
                    <th>Tipo</th>
                    <th>Internado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    leitosOcupados.forEach(leito => {
        const identificacao = leito.identificacaoLeito || leito.identificacao_leito || getNomeLeitoFormatado(hospitalId, leito.leito);
        const matricula = formatarMatricula(leito.matricula);
        const iniciais = leito.nome || '—';
        const tipo = leito.categoriaEscolhida || leito.tipo || '—';
        const tempoInternacao = leito.admAt ? calcularTempoInternacao(leito.admAt) : '—';
        
        html += `
            <tr class="linha-leito" data-leito-id="${leito.leito}">
                <td>
                    <input type="checkbox" class="checkbox-leito" 
                           data-hospital="${hospitalId}"
                           data-leito="${leito.leito}"
                           data-identificacao="${identificacao}"
                           data-matricula="${leito.matricula || ''}"
                           data-iniciais="${iniciais}"
                           data-tipo="${tipo}"
                           data-admissao="${leito.admAt || ''}"
                           onchange="toggleLeitoSelecao(this)">
                </td>
                <td><strong>${identificacao}</strong></td>
                <td>${matricula}</td>
                <td>${iniciais}</td>
                <td>${tipo}</td>
                <td>${tempoInternacao}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    tabela.innerHTML = html;
};

// =================== TOGGLE SELEÇÃO DE LEITO ===================
window.toggleLeitoSelecao = function(checkbox) {
    const leitoData = {
        hospital: checkbox.dataset.hospital,
        leito: parseInt(checkbox.dataset.leito),
        identificacao: checkbox.dataset.identificacao,
        matricula: checkbox.dataset.matricula,
        iniciais: checkbox.dataset.iniciais,
        tipo: checkbox.dataset.tipo,
        admissao: checkbox.dataset.admissao
    };
    
    if (checkbox.checked) {
        leitosSelecionados.push(leitoData);
    } else {
        leitosSelecionados = leitosSelecionados.filter(l => 
            !(l.hospital === leitoData.hospital && l.leito === leitoData.leito)
        );
    }
    
    atualizarContadorSelecao();
};

// =================== TOGGLE TODOS OS LEITOS ===================
window.toggleTodosLeitos = function(checked) {
    document.querySelectorAll('.checkbox-leito').forEach(cb => {
        cb.checked = checked;
        toggleLeitoSelecao(cb);
    });
};

window.selecionarTodosLeitos = function() {
    document.getElementById('checkTodos').checked = true;
    toggleTodosLeitos(true);
};

window.limparSelecaoLeitos = function() {
    document.getElementById('checkTodos').checked = false;
    toggleTodosLeitos(false);
};

// =================== ATUALIZAR CONTADOR ===================
function atualizarContadorSelecao() {
    const contador = document.getElementById('contadorSelecionados');
    const btnGerar = document.getElementById('btnGerarSelecao');
    
    if (contador) contador.textContent = leitosSelecionados.length;
    if (btnGerar) btnGerar.disabled = leitosSelecionados.length === 0;
}

// =================== GERAR QR CODES SELECIONADOS ===================
window.gerarQRCodesSelecionados = async function() {
    if (leitosSelecionados.length === 0) {
        alert('Selecione pelo menos um leito!');
        return;
    }
    
    console.log('Gerando impressão de', leitosSelecionados.length, 'leitos selecionados...');
    
    // Buscar dados completos dos leitos selecionados
    const leitosCompletos = [];
    
    for (const leitoInfo of leitosSelecionados) {
        const hospitalData = window.hospitalData?.[leitoInfo.hospital];
        if (hospitalData) {
            const leitoCompleto = hospitalData.leitos.find(l => l.leito === leitoInfo.leito);
            if (leitoCompleto) {
                leitosCompletos.push({
                    ...leitoCompleto,
                    hospitalId: leitoInfo.hospital,
                    hospitalNome: QR_API.HOSPITAIS[leitoInfo.hospital].nome,
                    identificacao: leitoInfo.identificacao
                });
            }
        }
    }
    
    // Abrir página de impressão
    abrirPaginaImpressao(leitosCompletos);
};

// =================== ABRIR PÁGINA DE IMPRESSÃO PERSONALIZADA (CORRIGIDA) ===================
function abrirPaginaImpressao(leitos) {
    console.log('Abrindo página de impressão com', leitos.length, 'leitos...');
    
    // Criar blob com o HTML
    const htmlContent = gerarHTMLImpressao(leitos);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Abrir em nova aba
    const janelaImpressao = window.open(url, '_blank');
    
    if (!janelaImpressao) {
        alert('Bloqueador de pop-ups detectado! Por favor, permita pop-ups para este site.');
        console.error('Não foi possível abrir a janela de impressão');
        return;
    }
    
    // Limpar URL após 5 segundos (tempo para página carregar)
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 5000);
    
    console.log('Página de impressão aberta com sucesso!');
}

// =================== GERAR HTML DA IMPRESSÃO ===================
function gerarHTMLImpressao(leitos) {
    let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Impressão QR Code - ${leitos.length} Leitos</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            background: white;
            padding: 15mm;
            color: #000;
        }

        .controles {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #d1d5db;
        }

        .btn-imprimir {
            background: #000;
            color: white;
            border: none;
            padding: 10px 25px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }

        .btn-imprimir:hover {
            background: #333;
        }

        .impressao-container {
            background: white;
        }

        .leito-item {
            display: grid;
            grid-template-columns: 160px 1fr;
            gap: 15px;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #000;
            border-radius: 6px;
            page-break-inside: avoid;
            min-height: 160px;
            align-items: center;
        }

        .leito-item:nth-child(4n) {
            page-break-after: always;
        }

        .leito-item:last-child {
            page-break-after: auto;
        }

        .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border: 2px solid #000;
            border-radius: 4px;
            background: white;
        }

        .qr-code {
            width: 140px;
            height: 140px;
            margin-bottom: 5px;
        }

        .qr-label {
            font-size: 9px;
            color: #000;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
        }

        .dados-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .dados-header {
            background: #000;
            color: white;
            padding: 8px 10px;
            border-radius: 4px;
            margin-bottom: 4px;
        }

        .dados-header h2 {
            font-size: 14px;
            font-weight: 800;
            margin-bottom: 2px;
        }

        .dados-header p {
            font-size: 10px;
        }

        .dados-principais {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            margin-bottom: 6px;
        }

        .dado-destaque {
            background: white;
            padding: 6px;
            border-radius: 4px;
            border: 2px solid #000;
        }

        .dado-destaque .label {
            font-size: 8px;
            color: #000;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .dado-destaque .valor {
            font-size: 13px;
            color: #000;
            font-weight: 800;
        }

        .dados-secundarios {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
        }

        .dado-item {
            background: #f9fafb;
            padding: 4px;
            border-radius: 3px;
            border: 1px solid #d1d5db;
        }

        .dado-item .label {
            font-size: 7px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 1px;
        }

        .dado-item .valor {
            font-size: 10px;
            color: #000;
            font-weight: 700;
        }

        .concessoes-section {
            margin-top: 6px;
            padding: 6px;
            background: #f9fafb;
            border-radius: 4px;
            border: 1px solid #d1d5db;
        }

        .concessoes-section .titulo {
            font-size: 8px;
            color: #000;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .concessoes-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
        }

        .chip {
            background: white;
            border: 1px solid #000;
            color: #000;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 8px;
            font-weight: 700;
        }

        @media print {
            body {
                padding: 10mm;
            }

            .controles {
                display: none;
            }

            @page {
                size: A4 portrait;
                margin: 10mm;
            }

            .leito-item {
                margin-bottom: 8mm;
            }

            .leito-item:nth-child(4n) {
                page-break-after: always;
                margin-bottom: 0;
            }

            .leito-item:last-child {
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    <div class="controles">
        <div>
            <h1 style="font-size: 18px; margin-bottom: 5px;">Impressão de QR Codes</h1>
            <p style="color: #6b7280; font-size: 13px;">
                <strong>${leitos.length} leitos</strong> selecionados
            </p>
        </div>
        <button class="btn-imprimir" onclick="window.print()">Imprimir</button>
    </div>

    <div class="impressao-container">`;
    
    // Gerar cada leito
    leitos.forEach((leito) => {
        const qrURL = `${QR_API.BASE_URL}/?h=${leito.hospitalId}&l=${leito.leito}`;
        const qrImgURL = `${QR_API.API_URL}?size=300x300&data=${encodeURIComponent(qrURL)}`;
        
        const matricula = formatarMatricula(leito.matricula);
        const iniciais = leito.nome || '—';
        const idade = leito.idade ? `${leito.idade} anos` : '—';
        const genero = leito.genero || '—';
        const pps = leito.pps ? `${leito.pps}%` : '—';
        const spict = leito.spict === 'elegivel' ? 'Elegível' : (leito.spict === 'nao_elegivel' ? 'Não elegível' : '—');
        const regiao = leito.regiao || '—';
        const isolamento = formatarIsolamento(leito.isolamento);
        const prevAlta = leito.prevAlta || '—';
        const diretivas = leito.diretivas || 'Não se aplica';
        const tempoInternacao = leito.admAt ? calcularTempoInternacao(leito.admAt) : '—';
        
        const concessoes = Array.isArray(leito.concessoes) ? leito.concessoes : [];
        const concessoesHTML = concessoes.length > 0 
            ? concessoes.map(c => `<span class="chip">${c}</span>`).join('')
            : '<span style="color: #6b7280; font-size: 9px;">Nenhuma</span>';
        
        html += `
        <div class="leito-item">
            <div class="qr-section">
                <img src="${qrImgURL}" alt="QR Code" class="qr-code">
                <div class="qr-label">Escaneie aqui</div>
            </div>

            <div class="dados-section">
                <div class="dados-header">
                    <h2>${leito.hospitalNome}</h2>
                    <p>${leito.identificacao} • Internado há ${tempoInternacao}</p>
                </div>

                <div class="dados-principais">
                    <div class="dado-destaque">
                        <div class="label">Leito</div>
                        <div class="valor">${leito.identificacao}</div>
                    </div>
                    <div class="dado-destaque">
                        <div class="label">Matrícula</div>
                        <div class="valor">${matricula}</div>
                    </div>
                    <div class="dado-destaque">
                        <div class="label">Iniciais</div>
                        <div class="valor">${iniciais}</div>
                    </div>
                </div>

                <div class="dados-secundarios">
                    <div class="dado-item">
                        <div class="label">Idade</div>
                        <div class="valor">${idade}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">Gênero</div>
                        <div class="valor">${genero}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">PPS</div>
                        <div class="valor">${pps}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">SPICT-BR</div>
                        <div class="valor">${spict}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">Região</div>
                        <div class="valor">${regiao}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">Isolamento</div>
                        <div class="valor">${isolamento}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">Prev. Alta</div>
                        <div class="valor">${prevAlta}</div>
                    </div>
                    <div class="dado-item">
                        <div class="label">Diretivas</div>
                        <div class="valor">${diretivas}</div>
                    </div>
                </div>

                <div class="concessoes-section">
                    <div class="titulo">Concessões Previstas na Alta</div>
                    <div class="concessoes-chips">${concessoesHTML}</div>
                </div>
            </div>
        </div>`;
    });
    
    html += `
    </div>
    <script>
        console.log('Página de impressão carregada');
        console.log('${leitos.length} leitos prontos para impressão');
    </script>
</body>
</html>`;
    
    return html;
}

// =================== FUNÇÕES AUXILIARES ===================
function formatarMatricula(matricula) {
    if (!matricula || matricula === '—') return '—';
    const mat = String(matricula).replace(/\D/g, '');
    if (mat.length === 0) return '—';
    if (mat.length === 1) return mat;
    return mat.slice(0, -1) + '-' + mat.slice(-1);
}

function formatarIsolamento(isolamento) {
    if (!isolamento || isolamento === 'Não Isolamento') return 'Não Isol';
    if (isolamento === 'Isolamento de Contato') return 'Contato';
    if (isolamento === 'Isolamento Respiratório') return 'Respiratório';
    return isolamento;
}

function calcularTempoInternacao(admissao) {
    if (!admissao) return '';
    
    try {
        let dataAdmissao;
        if (typeof admissao === 'string' && admissao.includes('/')) {
            const [datePart] = admissao.split(' ');
            const [dia, mes, ano] = datePart.split('/');
            dataAdmissao = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        } else {
            dataAdmissao = new Date(admissao);
        }
        
        if (!dataAdmissao || isNaN(dataAdmissao.getTime())) return 'Data inválida';
        
        const agora = new Date();
        const diffTime = agora - dataAdmissao;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays === 0) return `${diffHours}h`;
        if (diffDays === 1) return `1d ${diffHours}h`;
        return `${diffDays}d ${diffHours}h`;
    } catch (error) {
        return '—';
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
        return '—';
    }
}

// =================== GERAR QR CODES DE UM HOSPITAL ===================
window.generateQRCodesSimple = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const hospital = QR_API.HOSPITAIS[hospitalId];
    const container = document.getElementById('qrCodesContainer');
    
    document.getElementById('progressContainer').style.display = 'none';
    
    container.innerHTML = `<h3>${hospital.nome}</h3><div class="qr-grid">`;
    
    for (let i = 1; i <= hospital.leitos; i++) {
        const qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
        const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
        const nomeLeitoFormatado = getNomeLeitoFormatado(hospitalId, i);
        
        container.innerHTML += `
            <div class="qr-item">
                <div class="qr-label">
                    <strong>${hospital.nome}</strong><br>
                    ${nomeLeitoFormatado}
                </div>
                <img src="${imgURL}" alt="QR Code ${nomeLeitoFormatado}" class="qr-img" loading="lazy">
            </div>
        `;
    }
    
    container.innerHTML += '</div>';
    console.log(`${hospital.leitos} QR Codes gerados para ${hospital.nome}`);
};

// =================== GERAR TODOS OS QR CODES ===================
window.generateAllQRCodesOptimized = async function() {
    if (isGenerating) return;
    
    isGenerating = true;
    const btnGenerateAll = document.getElementById('btnGenerateAll');
    const progressContainer = document.getElementById('progressContainer');
    const container = document.getElementById('qrCodesContainer');
    
    totalQRCodes = Object.values(QR_API.HOSPITAIS).reduce((total, hospital) => total + hospital.leitos, 0);
    generationProgress = 0;
    
    btnGenerateAll.disabled = true;
    btnGenerateAll.textContent = 'Gerando...';
    progressContainer.style.display = 'block';
    container.innerHTML = '';
    
    try {
        const hospitaisOrdenados = [
            ['H5', QR_API.HOSPITAIS.H5],
            ['H2', QR_API.HOSPITAIS.H2],
            ['H1', QR_API.HOSPITAIS.H1],
            ['H4', QR_API.HOSPITAIS.H4],
            ['H6', QR_API.HOSPITAIS.H6],
            ['H3', QR_API.HOSPITAIS.H3],
            ['H7', QR_API.HOSPITAIS.H7]
        ];
        
        for (const [hospitalId, hospital] of hospitaisOrdenados) {
            await generateHospitalQRCodes(hospitalId, hospital, container);
        }
        
        updateProgress('Concluído!', totalQRCodes, totalQRCodes);
        setTimeout(() => progressContainer.style.display = 'none', 2000);
        
    } catch (error) {
        console.error('Erro na geração:', error);
    } finally {
        isGenerating = false;
        btnGenerateAll.disabled = false;
        btnGenerateAll.textContent = 'Gerar Todos (93 QR Codes)';
    }
};

async function generateHospitalQRCodes(hospitalId, hospital, container) {
    container.innerHTML += `<h3 class="hospital-title">${hospital.nome}</h3><div class="qr-grid" id="grid-${hospitalId}">`;
    const grid = document.getElementById(`grid-${hospitalId}`);
    
    for (let i = 1; i <= hospital.leitos; i++) {
        const qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
        const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
        const nomeLeitoFormatado = getNomeLeitoFormatado(hospitalId, i);
        
        const qrItem = document.createElement('div');
        qrItem.className = 'qr-item';
        qrItem.innerHTML = `
            <div class="qr-label">
                <strong>${hospital.nome}</strong><br>
                ${nomeLeitoFormatado}
            </div>
            <img src="${imgURL}" alt="QR Code ${nomeLeitoFormatado}" class="qr-img" loading="lazy">
        `;
        
        grid.appendChild(qrItem);
        generationProgress++;
        updateProgress(`Gerando ${hospital.nome}...`, generationProgress, totalQRCodes);
        
        if (i < hospital.leitos) await sleep(QR_API.DELAY);
    }
    
    container.innerHTML += '</div>';
}

function updateProgress(text, current, total) {
    const progressText = document.getElementById('progressText');
    const progressCount = document.getElementById('progressCount');
    const progressFill = document.getElementById('progressFill');
    
    if (progressText) progressText.textContent = text;
    if (progressCount) progressCount.textContent = `${current}/${total}`;
    if (progressFill) progressFill.style.width = `${(current / total) * 100}%`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.closeQRModalSimple = function() {
    const modal = document.querySelector('.qr-modal-simple');
    if (modal) {
        isGenerating = false;
        modal.remove();
    }
};

// =================== ESTILOS CSS ===================
function addOptimizedStyles() {
    const styles = document.createElement('style');
    styles.id = 'qrOptimizedStyles';
    styles.innerHTML = `
        .qr-modal-simple {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            overflow: auto;
        }
        
        .qr-modal-content {
            background: white;
            border-radius: 12px;
            width: 95%;
            max-width: 1400px;
            max-height: 95vh;
            overflow: auto;
            color: #333;
            margin: 20px;
        }
        
        .qr-modal-header {
            padding: 20px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
        }
        
        .qr-modal-header h2 {
            margin: 0;
            color: #1a1f2e;
            font-size: 24px;
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
        }
        
        .close-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 16px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: background 0.2s;
        }
        
        .close-btn:hover {
            background: #dc2626;
        }
        
        .qr-tabs {
            display: flex;
            gap: 10px;
            padding: 15px 20px 0;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .qr-tab {
            padding: 10px 20px;
            background: transparent;
            border: none;
            border-bottom: 3px solid transparent;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
            color: #6b7280;
        }
        
        .qr-tab:hover {
            color: #1a1f2e;
        }
        
        .qr-tab.active {
            color: #60a5fa;
            border-bottom-color: #60a5fa;
        }
        
        .qr-tab-content {
            padding: 20px;
        }
        
        .selecao-controls {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .selecao-header {
            margin-bottom: 20px;
        }
        
        .selecao-header h3 {
            font-size: 18px;
            font-weight: 700;
            color: #1a1f2e;
            margin-bottom: 10px;
        }
        
        .selecao-header select {
            width: 100%;
            padding: 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
        }
        
        .selecao-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-secondary {
            padding: 8px 16px;
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
        }
        
        .tabela-leitos {
            margin-top: 20px;
        }
        
        .tabela-selecao {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .tabela-selecao thead {
            background: #1a1f2e;
            color: white;
        }
        
        .tabela-selecao th {
            padding: 12px;
            text-align: left;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
        }
        
        .tabela-selecao td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        
        .linha-leito:hover {
            background: #f9fafb;
        }
        
        .checkbox-leito {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #60a5fa;
        }
        
        .selecao-footer {
            margin-top: 20px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .contador-selecao {
            font-size: 18px;
            color: #1a1f2e;
        }
        
        .contador-selecao strong {
            font-size: 24px;
            color: #60a5fa;
        }
        
        .btn-gerar-selecao {
            padding: 12px 30px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-gerar-selecao:hover:not(:disabled) {
            background: #059669;
            transform: translateY(-2px);
        }
        
        .btn-gerar-selecao:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
        }
        
        .qr-modal-body {
            padding: 0;
        }
        
        .qr-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
            padding: 0 20px;
        }
        
        .qr-controls select {
            padding: 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            background: white;
            min-width: 250px;
            font-weight: 700;
        }
        
        .qr-controls button {
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.2s;
        }
        
        .qr-controls button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        .btn-all {
            background: #10b981 !important;
        }
        
        .btn-all:hover:not(:disabled) {
            background: #059669 !important;
        }
        
        .btn-print {
            background: #8b5cf6 !important;
        }
        
        .btn-print:hover {
            background: #7c3aed !important;
        }
        
        .progress-container {
            background: #f1f5f9;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 0 20px 20px;
        }
        
        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-weight: 700;
            color: #374151;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .qr-container {
            padding: 0 20px;
        }
        
        .qr-container h3 {
            text-align: center;
            color: #1a1f2e;
            margin: 30px 0 20px 0;
            font-size: 24px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #60a5fa;
            font-weight: 700;
        }
        
        .qr-container h3:first-child {
            margin-top: 0;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .qr-item {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            background: #f9fafb;
            transition: all 0.2s;
            page-break-inside: avoid;
        }
        
        .qr-item:hover {
            border-color: #60a5fa;
            box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
        }
        
        .qr-label {
            font-size: 14px;
            margin-bottom: 12px;
            color: #374151;
            line-height: 1.4;
            font-weight: 700;
        }
        
        .qr-label strong {
            color: #1e40af;
            font-size: 16px;
            font-weight: 700;
        }
        
        .qr-img {
            width: 160px;
            height: 160px;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
        }
        
        @media print {
            @page {
                margin: 10mm;
                size: A4 portrait;
            }
            
            body > *:not(.qr-modal-simple) {
                display: none !important;
            }
            
            .qr-modal-simple {
                position: static !important;
                background: white !important;
                display: block !important;
                overflow: visible !important;
            }
            
            .qr-modal-content {
                width: 100% !important;
                max-width: none !important;
                max-height: none !important;
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                overflow: visible !important;
                border-radius: 0 !important;
            }
            
            .qr-modal-header,
            .qr-tabs,
            .qr-controls,
            .progress-container,
            .close-btn {
                display: none !important;
            }
            
            .qr-tab-content {
                padding: 0 !important;
            }
            
            .qr-modal-body {
                padding: 0 !important;
            }
            
            .qr-container {
                width: 100% !important;
                padding: 0 !important;
            }
            
            .qr-container h3 {
                page-break-before: always;
                page-break-after: avoid;
                margin: 0 0 5mm 0 !important;
                font-size: 16px !important;
                background: white !important;
                border: none !important;
                padding: 2mm 0 !important;
                color: #000 !important;
                text-align: left !important;
            }
            
            .qr-container h3:first-child {
                page-break-before: auto;
            }
            
            .qr-grid {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 2mm !important;
                page-break-inside: auto !important;
                margin-bottom: 5mm !important;
            }
            
            .qr-item {
                width: 62mm !important;
                height: 68mm !important;
                padding: 2mm !important;
                page-break-inside: avoid !important;
                border: 1px solid #333 !important;
                background: white !important;
                margin: 0 !important;
                border-radius: 2mm !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .qr-item:nth-child(12n) {
                page-break-after: always !important;
            }
            
            .qr-label {
                font-size: 11px !important;
                margin-bottom: 2mm !important;
                color: #000 !important;
                line-height: 1.3 !important;
                text-align: center !important;
            }
            
            .qr-label strong {
                color: #000 !important;
                font-size: 12px !important;
                font-weight: bold !important;
            }
            
            .qr-img {
                width: 48mm !important;
                height: 48mm !important;
                border: none !important;
                border-radius: 1mm !important;
                display: block !important;
            }
        }
        
        @media (max-width: 768px) {
            .qr-modal-content {
                width: 98%;
                margin: 10px;
            }
            
            .qr-controls, .selecao-actions {
                flex-direction: column;
                align-items: stretch;
            }
            
            .qr-controls select,
            .qr-controls button {
                width: 100%;
            }
            
            .qr-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .qr-img {
                width: 120px;
                height: 120px;
            }
            
            .tabela-selecao {
                font-size: 12px;
            }
            
            .tabela-selecao th,
            .tabela-selecao td {
                padding: 8px 6px;
            }
        }
    `;
    document.head.appendChild(styles);
}

// =================== INICIALIZAÇÃO ===================
document.addEventListener('DOMContentLoaded', function() {
    window.openQRCodes = window.openQRCodesSimple;
    console.log('Sistema QR Code V4.2 carregado');
    console.log('Base URL:', QR_API.BASE_URL);
    console.log('Total: 93 QR codes (7 hospitais)');
    console.log('Impressão: 4 leitos por página A4');
    console.log('CORRIGIDO: Função de impressão personalizada');
});
