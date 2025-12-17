// =================== QRCODE.JS - V7.0 IMPRESSAO COM UTI ===================
// Cliente: Guilherme Santoro / Prevent Senior
// Desenvolvedor: Alessandro Rodrigues - SYSTELOS MED
// Data: Dezembro/2025
// Versao: V7.0
// Novidades V7.0:
//   - Suporte a leitos UTI (63 leitos em 8 hospitais)
//   - Codigo de referencia REFXXXHXXYY
//   - Dropdown separado para Enfermaria e UTI
//   - Total: 356 leitos (293 enfermaria + 63 UTI)
// ==================================================================================

// *** AMBIENTE DE TESTE ***
// Para PRODUCAO, altere BASE_URL para: 'https://qr-code-systelos.vercel.app'
const QR_API = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE: 300,
    DELAY: 150,
    // Hospitais Enfermaria (293 leitos)
    HOSPITAIS: {
        H1: { nome: 'Neomater', leitos: 25 },
        H2: { nome: 'Cruz Azul', leitos: 67 },
        H3: { nome: 'Santa Marcelina', leitos: 28 },
        H4: { nome: 'Santa Clara', leitos: 57 },
        H5: { nome: 'Adventista', leitos: 28 },
        H6: { nome: 'Santa Cruz', leitos: 22 },
        H7: { nome: 'Santa Virginia', leitos: 22 },
        H8: { nome: 'Sao Camilo Ipiranga', leitos: 22 },
        H9: { nome: 'Sao Camilo Pompeia', leitos: 22 }
    },
    // Hospitais UTI (63 leitos - H7 nao tem UTI)
    UTI: {
        H1: { nome: 'Neomater', leitos: 5 },
        H2: { nome: 'Cruz Azul', leitos: 30 },
        H3: { nome: 'Santa Marcelina', leitos: 4 },
        H4: { nome: 'Santa Clara', leitos: 6 },
        H5: { nome: 'Adventista', leitos: 6 },
        H6: { nome: 'Santa Cruz', leitos: 4 },
        H8: { nome: 'Sao Camilo Ipiranga', leitos: 4 },
        H9: { nome: 'Sao Camilo Pompeia', leitos: 4 }
    }
};

// Pares de leitos irmaos (apenas enfermaria)
const LEITOS_IRMAOS = {
    H2: {
        21: 22, 22: 21,
        23: 24, 24: 23,
        25: 26, 26: 25,
        27: 28, 28: 27,
        29: 30, 30: 29,
        31: 32, 32: 31,
        33: 34, 34: 33,
        35: 36, 36: 35,
        37: 38, 38: 37,
        39: 40, 40: 39,
        41: 42, 42: 41,
        43: 44, 44: 43,
        45: 46, 46: 45
    },
    H4: {
        10: 11, 11: 10,
        12: 13, 13: 12,
        14: 15, 15: 14,
        16: 17, 17: 16,
        18: 19, 19: 18,
        20: 21, 21: 20,
        22: 23, 23: 22,
        24: 25, 25: 24,
        26: 27, 27: 26
    }
};

// Variaveis de controle
let isGenerating = false;
let generationProgress = 0;
let totalQRCodes = 0;
let leitosSelecionados = [];
let modoAtual = 'enfermaria'; // 'enfermaria' ou 'uti'

// =================== FUNCAO PARA GERAR CODIGO DE REFERENCIA ===================
function gerarCodigoReferencia(hospitalId, numeroLeito, tipo) {
    // tipo: 'Hibrido', 'Apartamento', 'Enfermaria', 'UTI'
    const tiposCodigo = {
        'Hibrido': 'HIB',
        'Hibrido': 'HIB',
        'Apartamento': 'APT',
        'Enfermaria': 'ENF',
        'UTI': 'UTI'
    };
    const tipoCod = tiposCodigo[tipo] || 'HIB';
    const idFormatado = String(numeroLeito).padStart(2, '0');
    return `REF${tipoCod}${hospitalId}X${idFormatado}`;
}

// =================== FUNCAO PARA OBTER TIPO DO LEITO ===================
function getTipoLeitoQR(hospitalId, numeroLeito, isUTI) {
    if (isUTI) return 'UTI';
    
    // H2 - CRUZ AZUL
    // 1-20: Apartamentos contratuais
    // 21-46: Enfermarias (13 pares de irmaos)
    // 47-67: Apartamentos extras
    if (hospitalId === 'H2') {
        if (numeroLeito >= 1 && numeroLeito <= 20) return 'Apartamento';
        if (numeroLeito >= 21 && numeroLeito <= 46) return 'Enfermaria';
        if (numeroLeito >= 47 && numeroLeito <= 67) return 'Apartamento';
    }
    
    // H4 - SANTA CLARA
    if (hospitalId === 'H4') {
        if ((numeroLeito >= 1 && numeroLeito <= 9) || (numeroLeito >= 28 && numeroLeito <= 57)) return 'Apartamento';
        if (numeroLeito >= 10 && numeroLeito <= 27) return 'Enfermaria';
    }
    
    // Demais hospitais sao hibridos
    return 'Hibrido';
}

// =================== FUNCAO PARA OBTER NOME DO LEITO ===================
function getNomeLeitoFormatado(hospitalId, numeroLeito, isUTI) {
    // UTI
    if (isUTI) {
        return `UTI Leito ${String(numeroLeito).padStart(2, '0')}`;
    }
    
    // H2 - CRUZ AZUL
    // 1-20: Apartamentos contratuais
    // 21-46: Enfermarias (13 pares de irmaos)
    // 47-67: Apartamentos extras
    if (hospitalId === 'H2') {
        if (numeroLeito >= 1 && numeroLeito <= 20) {
            return `Apartamento ID ${String(numeroLeito).padStart(2, '0')}`;
        } else if (numeroLeito >= 21 && numeroLeito <= 46) {
            return `Enfermaria ID ${String(numeroLeito).padStart(2, '0')}`;
        } else if (numeroLeito >= 47 && numeroLeito <= 67) {
            return `Apartamento ID ${String(numeroLeito).padStart(2, '0')}`;
        }
    }
    
    // H4 - SANTA CLARA
    if (hospitalId === 'H4') {
        if ((numeroLeito >= 1 && numeroLeito <= 9) || (numeroLeito >= 28 && numeroLeito <= 57)) {
            return `Apartamento ID ${String(numeroLeito).padStart(2, '0')}`;
        } else if (numeroLeito >= 10 && numeroLeito <= 27) {
            return `Enfermaria ID ${String(numeroLeito).padStart(2, '0')}`;
        }
    }
    
    // Outros hospitais: Leito XX
    return `Leito ${String(numeroLeito).padStart(2, '0')}`;
}

// =================== FUNCAO PRINCIPAL - MODAL COM OPCOES ===================
window.openQRCodesSimple = function() {
    console.log('Abrindo gerador de QR Codes V7.0...');
    
    if (document.querySelector('.qr-modal-simple')) {
        console.log('Modal ja esta aberto');
        return;
    }
    
    // Calcular totais
    const totalEnfermaria = Object.values(QR_API.HOSPITAIS).reduce((t, h) => t + h.leitos, 0);
    const totalUTI = Object.values(QR_API.UTI).reduce((t, h) => t + h.leitos, 0);
    
    const modal = document.createElement('div');
    modal.className = 'qr-modal-simple';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>QR Codes dos Leitos - Sistema V7.0</h2>
                <button onclick="closeQRModalSimple()" class="close-btn">X</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-tabs">
                    <button class="qr-tab active" onclick="switchQRTab('todos')">
                        Todos os Leitos
                    </button>
                    <button class="qr-tab" onclick="switchQRTab('selecao')">
                        Selecao Personalizada
                    </button>
                </div>
                
                <!-- TAB 1: TODOS OS LEITOS -->
                <div id="tabTodos" class="qr-tab-content active">
                    <!-- MODO: Enfermaria ou UTI -->
                    <div class="modo-selector">
                        <label class="modo-option active" id="modoEnfermaria">
                            <input type="radio" name="modoQR" value="enfermaria" checked onchange="trocarModoQR('enfermaria')">
                            <span>Enfermaria</span>
                            <small>${totalEnfermaria} leitos</small>
                        </label>
                        <label class="modo-option" id="modoUTI">
                            <input type="radio" name="modoQR" value="uti" onchange="trocarModoQR('uti')">
                            <span>UTI</span>
                            <small>${totalUTI} leitos</small>
                        </label>
                    </div>
                    
                    <div class="qr-controls">
                        <select id="qrHospitalSelect" onchange="generateQRCodesSimple()">
                            <!-- Opcoes preenchidas dinamicamente -->
                        </select>
                        <button onclick="generateAllQRCodesOptimized()" class="btn-all" id="btnGenerateAll">
                            Gerar Todos (${totalEnfermaria} QR Codes)
                        </button>
                        <button onclick="abrirJanelaImpressaoQRCodes()" class="btn-print">Imprimir</button>
                    </div>
                    
                    <div id="progressContainer" class="progress-container" style="display: none;">
                        <div class="progress-info">
                            <span id="progressText">Gerando QR Codes...</span>
                            <span id="progressCount">0/0</span>
                        </div>
                        <div class="progress-bar">
                            <div id="progressFill" class="progress-fill"></div>
                        </div>
                    </div>
                    
                    <div id="qrCodesContainer" class="qr-container"></div>
                </div>
                
                <!-- TAB 2: SELECAO PERSONALIZADA -->
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
                                <option value="H7">Santa Virginia</option>
                                <option value="H8">Sao Camilo Ipiranga</option>
                                <option value="H9">Sao Camilo Pompeia</option>
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
                                        Limpar Selecao
                                    </button>
                                </div>
                            </div>
                            
                            <div id="tabelaLeitosSelecao" class="tabela-leitos"></div>
                            
                            <div class="selecao-footer">
                                <div class="contador-selecao">
                                    <strong><span id="contadorSelecionados">0</span></strong> leitos selecionados
                                </div>
                                <button onclick="gerarQRCodesSelecionados()" class="btn-gerar-selecao" id="btnGerarSelecao" disabled>
                                    Gerar Impressao
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
    
    // Inicializar dropdown com modo enfermaria
    atualizarDropdownHospitais();
    generateQRCodesSimple();
};

// =================== TROCAR MODO (ENFERMARIA/UTI) ===================
window.trocarModoQR = function(modo) {
    modoAtual = modo;
    
    // Atualizar visual dos botoes
    document.getElementById('modoEnfermaria').classList.toggle('active', modo === 'enfermaria');
    document.getElementById('modoUTI').classList.toggle('active', modo === 'uti');
    
    // Atualizar dropdown
    atualizarDropdownHospitais();
    
    // Atualizar botao "Gerar Todos"
    const btnGenerateAll = document.getElementById('btnGenerateAll');
    if (modo === 'enfermaria') {
        const total = Object.values(QR_API.HOSPITAIS).reduce((t, h) => t + h.leitos, 0);
        btnGenerateAll.textContent = `Gerar Todos (${total} QR Codes)`;
    } else {
        const total = Object.values(QR_API.UTI).reduce((t, h) => t + h.leitos, 0);
        btnGenerateAll.textContent = `Gerar Todos (${total} QR Codes)`;
    }
    
    // Gerar QR codes do hospital selecionado
    generateQRCodesSimple();
};

// =================== ATUALIZAR DROPDOWN DE HOSPITAIS ===================
function atualizarDropdownHospitais() {
    const select = document.getElementById('qrHospitalSelect');
    select.innerHTML = '';
    
    if (modoAtual === 'enfermaria') {
        // Hospitais ordenados alfabeticamente
        const hospitaisOrdenados = [
            ['H5', QR_API.HOSPITAIS.H5],
            ['H2', QR_API.HOSPITAIS.H2],
            ['H1', QR_API.HOSPITAIS.H1],
            ['H4', QR_API.HOSPITAIS.H4],
            ['H6', QR_API.HOSPITAIS.H6],
            ['H3', QR_API.HOSPITAIS.H3],
            ['H7', QR_API.HOSPITAIS.H7],
            ['H8', QR_API.HOSPITAIS.H8],
            ['H9', QR_API.HOSPITAIS.H9]
        ];
        
        hospitaisOrdenados.forEach(([id, hospital]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${hospital.nome} (${hospital.leitos} leitos)`;
            select.appendChild(option);
        });
    } else {
        // UTI - hospitais que tem UTI (H7 nao tem)
        const hospitaisUTI = [
            ['H5', QR_API.UTI.H5],
            ['H2', QR_API.UTI.H2],
            ['H1', QR_API.UTI.H1],
            ['H4', QR_API.UTI.H4],
            ['H6', QR_API.UTI.H6],
            ['H3', QR_API.UTI.H3],
            ['H8', QR_API.UTI.H8],
            ['H9', QR_API.UTI.H9]
        ];
        
        hospitaisUTI.forEach(([id, hospital]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${hospital.nome} UTI (${hospital.leitos} leitos)`;
            select.appendChild(option);
        });
    }
}

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

// =================== CARREGAR LEITOS PARA SELECAO ===================
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
    
    const hospitalData = window.hospitalData?.[hospitalId];
    if (!hospitalData || !hospitalData.leitos) {
        tabela.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280;">Carregando dados...</p>';
        return;
    }
    
    const leitosOcupados = hospitalData.leitos.filter(l => 
        l.status === 'Ocupado' || l.status === 'Em uso' || l.status === 'ocupado'
    );
    
    if (leitosOcupados.length === 0) {
        tabela.innerHTML = '<p style="text-align: center; padding: 20px; color: #6b7280;">Nenhum leito ocupado neste hospital.</p>';
        return;
    }
    
    let html = `
        <table class="tabela-selecao">
            <thead>
                <tr>
                    <th style="width: 50px;">
                        <input type="checkbox" id="checkTodos" onchange="toggleTodosLeitos(this.checked)">
                    </th>
                    <th>Leito</th>
                    <th>Matricula</th>
                    <th>Iniciais</th>
                    <th>Tipo</th>
                    <th>Internado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    leitosOcupados.forEach(leito => {
        const identificacao = getNomeLeitoFormatado(hospitalId, leito.leito, false);
        const matricula = formatarMatricula(leito.matricula);
        const iniciais = leito.nome || '---';
        const tipo = leito.categoriaEscolhida || leito.tipo || '---';
        const tempoInternacao = leito.admAt ? calcularTempoInternacao(leito.admAt) : '---';
        
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

// =================== TOGGLE SELECAO DE LEITO ===================
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
window.gerarQRCodesSelecionados = function() {
    if (leitosSelecionados.length === 0) {
        alert('Selecione pelo menos um leito.');
        return;
    }
    
    const leitos = leitosSelecionados.map(l => {
        const hospitalData = window.hospitalData?.[l.hospital];
        const leitoData = hospitalData?.leitos?.find(lt => lt.leito === l.leito) || {};
        
        return {
            hospitalId: l.hospital,
            hospitalNome: QR_API.HOSPITAIS[l.hospital]?.nome || l.hospital,
            leito: l.leito,
            identificacao: l.identificacao,
            ...leitoData
        };
    });
    
    abrirJanelaImpressaoLeitos(leitos);
};

// =================== JANELA DE IMPRESSAO PARA LEITOS SELECIONADOS ===================
function abrirJanelaImpressaoLeitos(leitos) {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Impressao QR Codes - Leitos Selecionados</title>
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
            background: #f9fafb;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }

        .dado-item {
            padding: 3px;
        }

        .dado-item .label {
            font-size: 7px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 700;
        }

        .dado-item .valor {
            font-size: 10px;
            color: #000;
            font-weight: 600;
        }

        .concessoes-section {
            background: #fef3c7;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #fcd34d;
        }

        .concessoes-section .titulo {
            font-size: 8px;
            font-weight: 700;
            color: #92400e;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .concessoes-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
        }

        .chip {
            background: #fef9c3;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: 600;
            color: #713f12;
            border: 1px solid #facc15;
        }

        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }

            body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .controles {
                display: none !important;
            }

            .leito-item {
                page-break-inside: avoid;
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
            <h1 style="font-size: 18px; margin-bottom: 5px;">Impressao de QR Codes</h1>
            <p style="color: #6b7280; font-size: 13px;">
                <strong>${leitos.length} leitos</strong> selecionados
            </p>
        </div>
        <button class="btn-imprimir" onclick="window.print()">Imprimir</button>
    </div>

    <div class="impressao-container">`;
    
    leitos.forEach((leito) => {
        const qrURL = `${QR_API.BASE_URL}/?h=${leito.hospitalId}&l=${leito.leito}`;
        const qrImgURL = `${QR_API.API_URL}?size=300x300&data=${encodeURIComponent(qrURL)}`;
        
        const matricula = formatarMatricula(leito.matricula);
        const iniciais = leito.nome || '---';
        const idade = leito.idade ? `${leito.idade} anos` : '---';
        const genero = leito.genero || '---';
        const pps = leito.pps ? `${leito.pps}%` : '---';
        const spict = leito.spict === 'elegivel' ? 'Elegivel' : (leito.spict === 'nao_elegivel' ? 'Nao elegivel' : '---');
        const regiao = leito.regiao || '---';
        const isolamento = formatarIsolamento(leito.isolamento);
        const prevAlta = leito.prevAlta || '---';
        const diretivas = leito.diretivas || 'Nao se aplica';
        const tempoInternacao = leito.admAt ? calcularTempoInternacao(leito.admAt) : '---';
        
        const concessoes = Array.isArray(leito.concessoes) ? leito.concessoes : [];
        const concessoesHTML = concessoes.length > 0 
            ? concessoes.map(c => `<span class="chip">${c}</span>`).join('')
            : '<span style="color: #6b7280; font-size: 9px;">Nenhuma</span>';
        
        html += `
        <div class="leito-item">
            <div class="qr-section">
                <img src="${qrImgURL}" alt="QR Code" class="qr-code" loading="eager" decoding="sync">
                <div class="qr-label">Escaneie aqui</div>
            </div>

            <div class="dados-section">
                <div class="dados-header">
                    <h2>${leito.hospitalNome}</h2>
                    <p>${leito.identificacao} - Internado ha ${tempoInternacao}</p>
                </div>

                <div class="dados-principais">
                    <div class="dado-destaque">
                        <div class="label">Leito</div>
                        <div class="valor">${leito.identificacao}</div>
                    </div>
                    <div class="dado-destaque">
                        <div class="label">Matricula</div>
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
                        <div class="label">Genero</div>
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
                        <div class="label">Regiao</div>
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
                    <div class="titulo">Concessoes Previstas na Alta</div>
                    <div class="concessoes-chips">${concessoesHTML}</div>
                </div>
            </div>
        </div>`;
    });
    
    html += `
    </div>
    <script>
        console.log('Pagina de impressao carregada');
        console.log('${leitos.length} leitos prontos para impressao');
        
        window.addEventListener('load', function() {
            const imagens = document.querySelectorAll('img');
            let carregadas = 0;
            const total = imagens.length;
            
            console.log('Aguardando carregamento de ' + total + ' imagens...');
            
            function verificarCarregamento() {
                carregadas++;
                console.log('Imagem ' + carregadas + '/' + total + ' carregada');
                
                if (carregadas === total) {
                    console.log('Todas as imagens carregadas! Pronto para imprimir.');
                }
            }
            
            imagens.forEach(function(img, index) {
                if (img.complete) {
                    verificarCarregamento();
                } else {
                    img.onload = verificarCarregamento;
                    img.onerror = function() {
                        console.error('Erro ao carregar imagem ' + (index + 1));
                        verificarCarregamento();
                    };
                }
            });
        });
    <\/script>
</body>
</html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
}

// =================== FUNCOES AUXILIARES ===================
function formatarMatricula(matricula) {
    if (!matricula) return '---';
    const mat = String(matricula).replace(/\D/g, '');
    if (mat.length === 0) return '---';
    if (mat.length === 1) return mat;
    return mat.slice(0, -1) + '-' + mat.slice(-1);
}

function formatarIsolamento(isolamento) {
    if (!isolamento || isolamento === 'Nao Isolamento') return 'Nao Isol';
    if (isolamento === 'Isolamento de Contato') return 'Contato';
    if (isolamento === 'Isolamento Respiratorio') return 'Respiratorio';
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
        
        if (!dataAdmissao || isNaN(dataAdmissao.getTime())) return 'Data invalida';
        
        const agora = new Date();
        const diffTime = agora - dataAdmissao;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays === 0) return `${diffHours}h`;
        if (diffDays === 1) return `1d ${diffHours}h`;
        return `${diffDays}d ${diffHours}h`;
    } catch (error) {
        return '---';
    }
}

function formatarDataHora(dataISO) {
    if (!dataISO) return '---';
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
        return '---';
    }
}

// =================== VERIFICAR SE E LEITO IRMAO ===================
function isLeitoIrmao(hospitalId, numeroLeito) {
    return LEITOS_IRMAOS[hospitalId] && LEITOS_IRMAOS[hospitalId][numeroLeito];
}

function getLeitoIrmao(hospitalId, numeroLeito) {
    return LEITOS_IRMAOS[hospitalId]?.[numeroLeito];
}

// =================== ABRIR JANELA DE IMPRESSAO DOS QR CODES ===================
window.abrirJanelaImpressaoQRCodes = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const isUTI = (modoAtual === 'uti');
    const hospitalConfig = isUTI ? QR_API.UTI[hospitalId] : QR_API.HOSPITAIS[hospitalId];
    
    if (!hospitalConfig) {
        alert('Selecione um hospital primeiro.');
        return;
    }
    
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const tipoLabel = isUTI ? ' (UTI)' : '';
    const leitosIrmaos = isUTI ? {} : (LEITOS_IRMAOS[hospitalId] || {});
    const leitosProcessados = new Set();
    
    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Codes - ${hospitalConfig.nome}${tipoLabel}</title>
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
            padding: 10mm;
            color: #000;
        }
        
        .controles {
            background: #f3f4f6;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #d1d5db;
        }
        
        .controles h1 {
            font-size: 18px;
            color: #111;
            margin-bottom: 3px;
        }
        
        .controles p {
            font-size: 13px;
            color: #6b7280;
        }
        
        .btn-imprimir {
            background: #000;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }
        
        .btn-imprimir:hover {
            background: #333;
        }
        
        .hospital-title {
            font-size: 16px;
            font-weight: 700;
            color: #111;
            margin: 15px 0 10px 0;
            padding: 10px;
            background: #f3f4f6;
            border-left: 4px solid #3b82f6;
        }
        
        .qr-item {
            width: 95mm;
            height: 145mm;
            padding: 5mm;
            border: 2px solid #000;
            background: white;
            margin: 0 auto 10mm;
            border-radius: 3mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-inside: avoid;
            page-break-after: always;
        }
        
        .qr-item:last-child {
            page-break-after: auto;
        }
        
        .qr-label {
            text-align: center;
            margin-bottom: 8mm;
        }
        
        .qr-label .nome-hospital {
            font-size: 18px;
            font-weight: 700;
            color: #000;
            display: block;
        }
        
        .qr-label .tipo-leito {
            font-size: 14px;
            font-weight: 600;
            color: #555;
            margin-top: 2mm;
        }
        
        .qr-img {
            width: 70mm;
            height: 70mm;
            border-radius: 2mm;
        }
        
        .qr-ref {
            margin-top: 8mm;
            font-size: 12px;
            color: #888;
            letter-spacing: 1px;
            font-family: monospace;
        }
        
        /* Leitos Irmaos */
        .qr-item-duplo {
            width: 95mm;
            height: 145mm;
            border: 2px solid #000;
            border-radius: 3mm;
            padding: 3mm;
            background: white;
            page-break-inside: avoid;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            margin: 0 auto 10mm;
        }
        
        .qr-item-duplo:last-child {
            page-break-after: auto;
        }
        
        .qr-item-irmao {
            width: 100%;
            height: 48%;
            border: 1px solid #333;
            border-radius: 2mm;
            padding: 2mm;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .qr-item-irmao .qr-label {
            margin-bottom: 2mm;
        }
        
        .qr-item-irmao .qr-label .nome-hospital {
            font-size: 12px;
        }
        
        .qr-item-irmao .qr-label .tipo-leito {
            font-size: 10px;
        }
        
        .qr-item-irmao .qr-img {
            width: 40mm;
            height: 40mm;
        }
        
        .qr-item-irmao .qr-ref {
            margin-top: 2mm;
            font-size: 9px;
        }
        
        @media print {
            @page {
                size: A4 portrait;
                margin: 10mm;
            }
            
            body {
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .controles {
                display: none !important;
            }
            
            .hospital-title {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="controles">
        <div>
            <h1>QR Codes - ${hospitalConfig.nome}${tipoLabel}</h1>
            <p><strong>${hospitalConfig.leitos} leitos</strong> para impressao</p>
        </div>
        <button class="btn-imprimir" onclick="window.print()">Imprimir</button>
    </div>
    
    <div class="hospital-title">${hospitalConfig.nome}${tipoLabel}</div>
`;
    
    // Gerar QR codes normais (nao-irmaos)
    for (let i = 1; i <= hospitalConfig.leitos; i++) {
        if (!leitosIrmaos[i] && !leitosProcessados.has(i)) {
            let qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
            if (isUTI) {
                qrURL += '&t=UTI';
            }
            
            const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
            const tipoLeito = getTipoLeitoQR(hospitalId, i, isUTI);
            const codigoRef = gerarCodigoReferencia(hospitalId, i, tipoLeito);
            
            // Mostrar tipo apenas para H2 e H4 (Apartamento/Enfermaria)
            let tipoHTML = '';
            if (!isUTI && (hospitalId === 'H2' || hospitalId === 'H4')) {
                tipoHTML = `<span class="tipo-leito">${tipoLeito}</span>`;
            }
            
            html += `
    <div class="qr-item">
        <div class="qr-label">
            <span class="nome-hospital">${hospitalConfig.nome}</span>
            ${tipoHTML}
        </div>
        <img src="${imgURL}" alt="QR Code" class="qr-img">
        <div class="qr-ref">${codigoRef}</div>
    </div>
`;
            leitosProcessados.add(i);
        }
    }
    
    // Gerar QR codes de leitos irmaos (apenas enfermaria H2 e H4)
    if (Object.keys(leitosIrmaos).length > 0) {
        for (let i = 1; i <= hospitalConfig.leitos; i++) {
            const irmao = leitosIrmaos[i];
            
            if (irmao && !leitosProcessados.has(i) && i < irmao) {
                const qrURL1 = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
                const qrURL2 = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${irmao}`;
                const imgURL1 = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL1)}`;
                const imgURL2 = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL2)}`;
                
                const tipo1 = getTipoLeitoQR(hospitalId, i, false);
                const tipo2 = getTipoLeitoQR(hospitalId, irmao, false);
                const codigoRef1 = gerarCodigoReferencia(hospitalId, i, tipo1);
                const codigoRef2 = gerarCodigoReferencia(hospitalId, irmao, tipo2);
                
                html += `
    <div class="qr-item-duplo">
        <div class="qr-item-irmao">
            <div class="qr-label">
                <span class="nome-hospital">${hospitalConfig.nome}</span>
                <span class="tipo-leito">${tipo1}</span>
            </div>
            <img src="${imgURL1}" alt="QR Code" class="qr-img">
            <div class="qr-ref">${codigoRef1}</div>
        </div>
        <div class="qr-item-irmao">
            <div class="qr-label">
                <span class="nome-hospital">${hospitalConfig.nome}</span>
                <span class="tipo-leito">${tipo2}</span>
            </div>
            <img src="${imgURL2}" alt="QR Code" class="qr-img">
            <div class="qr-ref">${codigoRef2}</div>
        </div>
    </div>
`;
                leitosProcessados.add(i);
                leitosProcessados.add(irmao);
            }
        }
    }
    
    html += `
    <script>
        console.log('Pagina de impressao QR Codes carregada');
        console.log('${hospitalConfig.leitos} QR Codes prontos');
        
        window.addEventListener('load', function() {
            var imagens = document.querySelectorAll('img');
            var carregadas = 0;
            var total = imagens.length;
            
            console.log('Aguardando ' + total + ' imagens...');
            
            imagens.forEach(function(img) {
                if (img.complete) {
                    carregadas++;
                } else {
                    img.onload = function() {
                        carregadas++;
                        if (carregadas === total) {
                            console.log('Todas imagens carregadas!');
                        }
                    };
                }
            });
        });
    <\/script>
</body>
</html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
};

// =================== GERAR QR CODES DE UM HOSPITAL ===================
window.generateQRCodesSimple = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const container = document.getElementById('qrCodesContainer');
    const isUTI = (modoAtual === 'uti');
    
    const hospitalConfig = isUTI ? QR_API.UTI[hospitalId] : QR_API.HOSPITAIS[hospitalId];
    if (!hospitalConfig) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #ef4444;">Hospital nao encontrado.</p>';
        return;
    }
    
    document.getElementById('progressContainer').style.display = 'none';
    
    const tipoLabel = isUTI ? ' (UTI)' : '';
    container.innerHTML = `<h3>${hospitalConfig.nome}${tipoLabel}</h3>`;
    
    // UTI nao tem leitos irmaos
    const leitosIrmaos = isUTI ? {} : (LEITOS_IRMAOS[hospitalId] || {});
    const leitosProcessados = new Set();
    
    // Primeiro gerar QR codes nao-irmaos
    container.innerHTML += '<div class="qr-grid" id="grid-normais">';
    const gridNormais = container.querySelector('#grid-normais');
    
    for (let i = 1; i <= hospitalConfig.leitos; i++) {
        if (!leitosIrmaos[i] && !leitosProcessados.has(i)) {
            // URL com ou sem parametro t=UTI
            let qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
            if (isUTI) {
                qrURL += '&t=UTI';
            }
            
            const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
            const tipoLeito = getTipoLeitoQR(hospitalId, i, isUTI);
            const codigoRef = gerarCodigoReferencia(hospitalId, i, tipoLeito);
            
            // Mostrar tipo apenas para H2 e H4 (Apartamento/Enfermaria)
            let tipoHTML = '';
            if (!isUTI && (hospitalId === 'H2' || hospitalId === 'H4')) {
                tipoHTML = `<br><span style="font-size: 12px; color: #666;">${tipoLeito}</span>`;
            }
            
            gridNormais.innerHTML += `
                <div class="qr-item">
                    <div class="qr-label">
                        <strong>${hospitalConfig.nome}</strong>${tipoHTML}
                    </div>
                    <img src="${imgURL}" alt="QR Code" class="qr-img" loading="eager">
                    <div class="qr-ref">${codigoRef}</div>
                </div>
            `;
            leitosProcessados.add(i);
        }
    }
    container.innerHTML += '</div>';
    
    // Se houver leitos irmaos, gerar em grid separado empilhado (apenas enfermaria)
    if (Object.keys(leitosIrmaos).length > 0) {
        container.innerHTML += '<div class="qr-grid-irmaos" id="grid-irmaos">';
        const gridIrmaos = container.querySelector('#grid-irmaos');
        
        for (let i = 1; i <= hospitalConfig.leitos; i++) {
            const irmao = leitosIrmaos[i];
            
            if (irmao && !leitosProcessados.has(i) && i < irmao) {
                const qrURL1 = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
                const qrURL2 = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${irmao}`;
                const imgURL1 = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL1)}`;
                const imgURL2 = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL2)}`;
                
                const tipo1 = getTipoLeitoQR(hospitalId, i, false);
                const tipo2 = getTipoLeitoQR(hospitalId, irmao, false);
                const codigoRef1 = gerarCodigoReferencia(hospitalId, i, tipo1);
                const codigoRef2 = gerarCodigoReferencia(hospitalId, irmao, tipo2);
                
                gridIrmaos.innerHTML += `
                    <div class="qr-item-duplo">
                        <div class="qr-item-irmao">
                            <div class="qr-label">
                                <strong>${hospitalConfig.nome}</strong>
                                <br><span style="font-size: 11px; color: #666;">${tipo1}</span>
                            </div>
                            <img src="${imgURL1}" alt="QR Code" class="qr-img" loading="eager">
                            <div class="qr-ref">${codigoRef1}</div>
                        </div>
                        <div class="qr-item-irmao">
                            <div class="qr-label">
                                <strong>${hospitalConfig.nome}</strong>
                                <br><span style="font-size: 11px; color: #666;">${tipo2}</span>
                            </div>
                            <img src="${imgURL2}" alt="QR Code" class="qr-img" loading="eager">
                            <div class="qr-ref">${codigoRef2}</div>
                        </div>
                    </div>
                `;
                
                leitosProcessados.add(i);
                leitosProcessados.add(irmao);
            }
        }
        container.innerHTML += '</div>';
    }
    
    console.log(`${hospitalConfig.leitos} QR Codes gerados para ${hospitalConfig.nome}${tipoLabel}`);
};

// =================== GERAR TODOS OS QR CODES ===================
window.generateAllQRCodesOptimized = async function() {
    if (isGenerating) return;
    
    isGenerating = true;
    const btnGenerateAll = document.getElementById('btnGenerateAll');
    const progressContainer = document.getElementById('progressContainer');
    const container = document.getElementById('qrCodesContainer');
    const isUTI = (modoAtual === 'uti');
    
    const hospitaisConfig = isUTI ? QR_API.UTI : QR_API.HOSPITAIS;
    totalQRCodes = Object.values(hospitaisConfig).reduce((total, hospital) => total + hospital.leitos, 0);
    generationProgress = 0;
    
    btnGenerateAll.disabled = true;
    btnGenerateAll.textContent = 'Gerando...';
    progressContainer.style.display = 'block';
    container.innerHTML = '';
    
    try {
        // Ordenar hospitais alfabeticamente
        let hospitaisOrdenados;
        if (isUTI) {
            hospitaisOrdenados = [
                ['H5', QR_API.UTI.H5],
                ['H2', QR_API.UTI.H2],
                ['H1', QR_API.UTI.H1],
                ['H4', QR_API.UTI.H4],
                ['H6', QR_API.UTI.H6],
                ['H3', QR_API.UTI.H3],
                ['H8', QR_API.UTI.H8],
                ['H9', QR_API.UTI.H9]
            ];
        } else {
            hospitaisOrdenados = [
                ['H5', QR_API.HOSPITAIS.H5],
                ['H2', QR_API.HOSPITAIS.H2],
                ['H1', QR_API.HOSPITAIS.H1],
                ['H4', QR_API.HOSPITAIS.H4],
                ['H6', QR_API.HOSPITAIS.H6],
                ['H3', QR_API.HOSPITAIS.H3],
                ['H7', QR_API.HOSPITAIS.H7],
                ['H8', QR_API.HOSPITAIS.H8],
                ['H9', QR_API.HOSPITAIS.H9]
            ];
        }
        
        for (const [hospitalId, hospital] of hospitaisOrdenados) {
            await generateHospitalQRCodes(hospitalId, hospital, container, isUTI);
        }
        
        updateProgress('Concluido!', totalQRCodes, totalQRCodes);
        setTimeout(() => progressContainer.style.display = 'none', 2000);
        
    } catch (error) {
        console.error('Erro na geracao:', error);
    } finally {
        isGenerating = false;
        btnGenerateAll.disabled = false;
        btnGenerateAll.textContent = `Gerar Todos (${totalQRCodes} QR Codes)`;
    }
};

async function generateHospitalQRCodes(hospitalId, hospital, container, isUTI) {
    const tipoLabel = isUTI ? ' (UTI)' : '';
    container.innerHTML += `<h3 class="hospital-title">${hospital.nome}${tipoLabel}</h3>`;
    
    // UTI nao tem leitos irmaos
    const leitosIrmaos = isUTI ? {} : (LEITOS_IRMAOS[hospitalId] || {});
    const leitosProcessados = new Set();
    
    // Leitos normais
    container.innerHTML += '<div class="qr-grid" id="grid-' + hospitalId + '-normais">';
    const gridNormais = container.querySelector('#grid-' + hospitalId + '-normais');
    
    for (let i = 1; i <= hospital.leitos; i++) {
        if (!leitosIrmaos[i] && !leitosProcessados.has(i)) {
            let qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
            if (isUTI) {
                qrURL += '&t=UTI';
            }
            
            const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
            const tipoLeito = getTipoLeitoQR(hospitalId, i, isUTI);
            const codigoRef = gerarCodigoReferencia(hospitalId, i, tipoLeito);
            
            // Mostrar tipo apenas para H2 e H4 (Apartamento/Enfermaria)
            let tipoHTML = '';
            if (!isUTI && (hospitalId === 'H2' || hospitalId === 'H4')) {
                tipoHTML = `<br><span style="font-size: 12px; color: #666;">${tipoLeito}</span>`;
            }
            
            const qrItem = document.createElement('div');
            qrItem.className = 'qr-item';
            qrItem.innerHTML = `
                <div class="qr-label">
                    <strong>${hospital.nome}</strong>${tipoHTML}
                </div>
                <img src="${imgURL}" alt="QR Code" class="qr-img" loading="eager">
                <div class="qr-ref">${codigoRef}</div>
            `;
            
            gridNormais.appendChild(qrItem);
            leitosProcessados.add(i);
            generationProgress++;
            updateProgress(`Gerando ${hospital.nome}${tipoLabel}...`, generationProgress, totalQRCodes);
            await sleep(QR_API.DELAY);
        }
    }
    container.innerHTML += '</div>';
    
    // Leitos irmaos empilhados (apenas enfermaria)
    if (Object.keys(leitosIrmaos).length > 0) {
        container.innerHTML += '<div class="qr-grid-irmaos" id="grid-' + hospitalId + '-irmaos">';
        const gridIrmaos = container.querySelector('#grid-' + hospitalId + '-irmaos');
        
        for (let i = 1; i <= hospital.leitos; i++) {
            const irmao = leitosIrmaos[i];
            
            if (irmao && !leitosProcessados.has(i) && i < irmao) {
                const qrURL1 = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
                const qrURL2 = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${irmao}`;
                const imgURL1 = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL1)}`;
                const imgURL2 = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL2)}`;
                
                const tipo1 = getTipoLeitoQR(hospitalId, i, false);
                const tipo2 = getTipoLeitoQR(hospitalId, irmao, false);
                const codigoRef1 = gerarCodigoReferencia(hospitalId, i, tipo1);
                const codigoRef2 = gerarCodigoReferencia(hospitalId, irmao, tipo2);
                
                const qrItemDuplo = document.createElement('div');
                qrItemDuplo.className = 'qr-item-duplo';
                qrItemDuplo.innerHTML = `
                    <div class="qr-item-irmao">
                        <div class="qr-label">
                            <strong>${hospital.nome}</strong>
                            <br><span style="font-size: 11px; color: #666;">${tipo1}</span>
                        </div>
                        <img src="${imgURL1}" alt="QR Code" class="qr-img" loading="eager">
                        <div class="qr-ref">${codigoRef1}</div>
                    </div>
                    <div class="qr-item-irmao">
                        <div class="qr-label">
                            <strong>${hospital.nome}</strong>
                            <br><span style="font-size: 11px; color: #666;">${tipo2}</span>
                        </div>
                        <img src="${imgURL2}" alt="QR Code" class="qr-img" loading="eager">
                        <div class="qr-ref">${codigoRef2}</div>
                    </div>
                `;
                
                gridIrmaos.appendChild(qrItemDuplo);
                leitosProcessados.add(i);
                leitosProcessados.add(irmao);
                generationProgress += 2;
                updateProgress(`Gerando ${hospital.nome}...`, generationProgress, totalQRCodes);
                await sleep(QR_API.DELAY);
            }
        }
        container.innerHTML += '</div>';
    }
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

// =================== FECHAR MODAL ===================
window.closeQRModalSimple = function() {
    const modal = document.querySelector('.qr-modal-simple');
    if (modal) {
        modal.remove();
    }
};

// =================== ADICIONAR ESTILOS ===================
function addOptimizedStyles() {
    const styles = document.createElement('style');
    styles.id = 'qrOptimizedStyles';
    styles.textContent = `
        .qr-modal-simple {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 20px;
            z-index: 10000;
            overflow-y: auto;
        }
        
        .qr-modal-content {
            background: #1e293b;
            border-radius: 16px;
            width: 100%;
            max-width: 1200px;
            max-height: 95vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .qr-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 2px solid rgba(96, 165, 250, 0.3);
            position: sticky;
            top: 0;
            background: #1e293b;
            z-index: 10;
        }
        
        .qr-modal-header h2 {
            color: #60a5fa;
            font-size: 22px;
            font-weight: 700;
            font-family: 'Poppins', sans-serif;
        }
        
        .close-btn {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 700;
        }
        
        .close-btn:hover {
            background: #ef4444;
            color: white;
        }
        
        .qr-modal-body {
            padding: 30px;
        }
        
        /* TABS */
        .qr-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 15px;
        }
        
        .qr-tab {
            padding: 12px 25px;
            background: rgba(255, 255, 255, 0.05);
            color: #9ca3af;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Poppins', sans-serif;
        }
        
        .qr-tab:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .qr-tab.active {
            background: #60a5fa;
            color: white;
        }
        
        /* MODO SELECTOR (Enfermaria/UTI) */
        .modo-selector {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        }
        
        .modo-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            flex: 1;
        }
        
        .modo-option:hover {
            border-color: rgba(96, 165, 250, 0.5);
        }
        
        .modo-option.active {
            background: rgba(96, 165, 250, 0.2);
            border-color: #60a5fa;
        }
        
        .modo-option input[type="radio"] {
            width: 18px;
            height: 18px;
            accent-color: #60a5fa;
        }
        
        .modo-option span {
            color: white;
            font-weight: 600;
            font-size: 15px;
        }
        
        .modo-option small {
            color: #9ca3af;
            font-size: 12px;
            margin-left: auto;
        }
        
        .modo-option.active span {
            color: #60a5fa;
        }
        
        /* CONTROLES */
        .qr-controls {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .qr-controls select {
            padding: 12px 20px;
            background: #0f172a;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            min-width: 280px;
            font-family: 'Poppins', sans-serif;
        }
        
        .qr-controls select:focus {
            outline: none;
            border-color: #60a5fa;
        }
        
        .qr-controls button {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Poppins', sans-serif;
        }
        
        .btn-all {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        
        .btn-all:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        
        .btn-all:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-print {
            background: #60a5fa;
            color: white;
        }
        
        .btn-print:hover {
            background: #3b82f6;
        }
        
        /* PROGRESS */
        .progress-container {
            margin-bottom: 25px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        }
        
        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: #9ca3af;
            font-size: 14px;
            font-weight: 600;
        }
        
        .progress-bar {
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%);
            border-radius: 4px;
            transition: width 0.3s;
        }
        
        /* QR CONTAINER */
        .qr-container {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            padding: 20px;
        }
        
        .qr-container h3 {
            color: #60a5fa;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(96, 165, 250, 0.1);
            border-radius: 8px;
            border-left: 4px solid #60a5fa;
        }
        
        /* QR GRID */
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .qr-grid-irmaos {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        /* QR ITEM */
        .qr-item {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s;
            border: 2px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .qr-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            border-color: #60a5fa;
        }
        
        .qr-label {
            margin-bottom: 15px;
            line-height: 1.4;
            color: #1f2937;
            font-size: 13px;
        }
        
        .qr-label strong {
            color: #111827;
            font-size: 14px;
            font-weight: 700;
        }
        
        .qr-img {
            width: 180px;
            height: 180px;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
        }
        
        /* CODIGO DE REFERENCIA */
        .qr-ref {
            margin-top: 12px;
            font-size: 11px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 1px;
            font-family: monospace;
        }
        
        /* QR ITEM DUPLO (Irmaos) */
        .qr-item-duplo {
            background: white;
            border-radius: 12px;
            padding: 15px;
            border: 2px solid #60a5fa;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .qr-item-irmao {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .qr-item-irmao .qr-label {
            margin-bottom: 10px;
            font-size: 12px;
        }
        
        .qr-item-irmao .qr-label strong {
            font-size: 13px;
        }
        
        .qr-item-irmao .qr-img {
            width: 140px;
            height: 140px;
        }
        
        .qr-item-irmao .qr-ref {
            margin-top: 8px;
            font-size: 10px;
        }
        
        /* SELECAO PERSONALIZADA */
        .selecao-controls {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            padding: 25px;
        }
        
        .selecao-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .selecao-header h3 {
            color: #60a5fa;
            font-size: 16px;
            font-weight: 700;
        }
        
        .selecao-header select {
            padding: 10px 20px;
            background: #0f172a;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            min-width: 250px;
            font-family: 'Poppins', sans-serif;
        }
        
        .selecao-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-secondary {
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.1);
            color: #9ca3af;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Poppins', sans-serif;
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        /* TABELA DE SELECAO */
        .tabela-leitos {
            margin: 20px 0;
            max-height: 400px;
            overflow-y: auto;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tabela-selecao {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        
        .tabela-selecao th {
            background: rgba(96, 165, 250, 0.2);
            color: #60a5fa;
            padding: 12px 15px;
            text-align: left;
            font-weight: 700;
            position: sticky;
            top: 0;
        }
        
        .tabela-selecao td {
            padding: 12px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #e5e7eb;
        }
        
        .tabela-selecao tbody tr:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .tabela-selecao input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #60a5fa;
        }
        
        /* FOOTER SELECAO */
        .selecao-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;
        }
        
        .contador-selecao {
            color: #9ca3af;
            font-size: 14px;
        }
        
        .contador-selecao strong {
            color: #60a5fa;
            font-size: 20px;
        }
        
        .btn-gerar-selecao {
            padding: 12px 30px;
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Poppins', sans-serif;
        }
        
        .btn-gerar-selecao:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
        }
        
        .btn-gerar-selecao:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* =================== PRINT STYLES =================== */
        @media print {
            @page {
                size: A4 portrait;
                margin: 10mm;
            }
            
            body {
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .qr-modal-simple {
                position: static !important;
                background: white !important;
                padding: 0 !important;
                overflow: visible !important;
            }
            
            .qr-modal-content {
                background: white !important;
                box-shadow: none !important;
                max-height: none !important;
                margin: 0 !important;
                overflow: visible !important;
                border-radius: 0 !important;
            }
            
            .qr-modal-header,
            .qr-tabs,
            .qr-controls,
            .progress-container,
            .close-btn,
            .modo-selector {
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
                display: block !important;
                page-break-inside: auto !important;
                margin-bottom: 5mm !important;
            }
            
            .qr-grid-irmaos {
                display: block !important;
                page-break-inside: auto !important;
                margin-bottom: 5mm !important;
            }
            
            .qr-item-duplo {
                width: 95mm !important;
                height: 145mm !important;
                border: 2px solid #000 !important;
                border-radius: 2mm !important;
                padding: 3mm !important;
                background: white !important;
                page-break-inside: avoid !important;
                page-break-after: always !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin: 0 auto 5mm !important;
            }
            
            .qr-item-duplo:last-child {
                page-break-after: auto !important;
            }
            
            .qr-item-irmao {
                width: 100% !important;
                height: 48% !important;
                border: 1px solid #333 !important;
                border-radius: 2mm !important;
                padding: 2mm !important;
                background: white !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .qr-item {
                width: 95mm !important;
                height: 145mm !important;
                padding: 5mm !important;
                page-break-inside: avoid !important;
                page-break-after: always !important;
                border: 2px solid #000 !important;
                background: white !important;
                margin: 0 auto 5mm !important;
                border-radius: 2mm !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .qr-item:last-child {
                page-break-after: auto !important;
            }
            
            .qr-label {
                font-size: 14px !important;
                margin-bottom: 5mm !important;
                color: #000 !important;
                line-height: 1.4 !important;
                text-align: center !important;
            }
            
            .qr-label strong {
                color: #000 !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .qr-img {
                width: 70mm !important;
                height: 70mm !important;
                border: none !important;
                border-radius: 2mm !important;
                display: block !important;
            }
            
            .qr-ref {
                margin-top: 5mm !important;
                font-size: 10px !important;
                color: #666 !important;
                letter-spacing: 1px !important;
            }
            
            .qr-item-irmao .qr-img {
                width: 40mm !important;
                height: 40mm !important;
            }
            
            .qr-item-irmao .qr-label {
                font-size: 11px !important;
                margin-bottom: 2mm !important;
            }
            
            .qr-item-irmao .qr-label strong {
                font-size: 12px !important;
            }
            
            .qr-item-irmao .qr-ref {
                margin-top: 2mm !important;
                font-size: 9px !important;
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
            
            .modo-selector {
                flex-direction: column;
            }
            
            .qr-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .qr-grid-irmaos {
                grid-template-columns: 1fr;
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

// =================== INICIALIZACAO ===================
document.addEventListener('DOMContentLoaded', function() {
    window.openQRCodes = window.openQRCodesSimple;
    
    const totalEnfermaria = Object.values(QR_API.HOSPITAIS).reduce((t, h) => t + h.leitos, 0);
    const totalUTI = Object.values(QR_API.UTI).reduce((t, h) => t + h.leitos, 0);
    
    console.log('Sistema QR Code V7.0 carregado');
    console.log('AMBIENTE: TESTE');
    console.log('URL: ' + QR_API.BASE_URL);
    console.log('9 hospitais ativos - ' + totalEnfermaria + ' leitos enfermaria');
    console.log('8 hospitais com UTI - ' + totalUTI + ' leitos UTI');
    console.log('Total: ' + (totalEnfermaria + totalUTI) + ' leitos');
    console.log('H2: 13 pares de irmaos | H4: 9 pares de irmaos');
    console.log('Codigo de referencia: REFXXXHXXYY');
});
