// =================== QRCODE-OPTIMIZED.JS - GERADOR OTIMIZADO V3.3 ===================
// ✅ CORRIGIDO: 5 hospitais com quantidades corretas (79 QR codes total)
// Sistema otimizado com carregamento sequencial

const QR_API = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE: 300,  // pixels
    DELAY: 150, // delay entre requisições (ms)
    HOSPITAIS: {
        H1: { nome: 'Neomater', leitos: 10 },
        H2: { nome: 'Cruz Azul', leitos: 36 },
        H3: { nome: 'Sta Marcelina', leitos: 7 },
        H4: { nome: 'Santa Clara', leitos: 13 },
        H5: { nome: 'Adventista', leitos: 13 }
    }
};

// Variáveis de controle
let isGenerating = false;
let generationProgress = 0;
let totalQRCodes = 0;

// Função para obter nome do leito formatado
function getNomeLeitoFormatado(hospitalId, numeroLeito) {
    // H2 (Cruz Azul) tem numeração especial
    if (hospitalId === 'H2') {
        if (numeroLeito >= 1 && numeroLeito <= 20) {
            // Apartamentos 1-20
            return `Apartamento ${String(numeroLeito).padStart(2, '0')}`;
        } else if (numeroLeito >= 21 && numeroLeito <= 36) {
            // Enfermarias 21-36 com numeração especial
            // 21=711.1, 22=711.2, 23=713.1, 24=713.2, etc
            const parIndex = Math.floor((numeroLeito - 21) / 2); // 0,0,1,1,2,2,3,3...
            const numeroQuarto = 711 + (parIndex * 2); // 711, 711, 713, 713, 715, 715...
            const subNumero = ((numeroLeito - 21) % 2) + 1; // 1,2,1,2,1,2...
            return `Enfermaria ${numeroQuarto}.${subNumero}`;
        }
    }
    
    // Outros hospitais: apenas "Leito XX"
    return `Leito ${String(numeroLeito).padStart(2, '0')}`;
}

// Função principal para abrir modal
window.openQRCodesSimple = function() {
    console.log('🔵 Abrindo gerador de QR Codes otimizado V3.3...');
    
    // Prevenir múltiplas aberturas
    if (document.querySelector('.qr-modal-simple')) {
        console.log('Modal já está aberto');
        return;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'qr-modal-simple';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>📱 QR Codes dos Leitos - Sistema V3.3 Corrigido</h2>
                <button onclick="closeQRModalSimple()" class="close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-controls">
                    <select id="qrHospitalSelect" onchange="generateQRCodesSimple()">
                        <option value="H1">Neomater (10 leitos)</option>
                        <option value="H2">Cruz Azul (36 leitos)</option>
                        <option value="H3">Sta Marcelina (7 leitos)</option>
                        <option value="H4">Santa Clara (13 leitos)</option>
                        <option value="H5">Adventista (13 leitos)</option>
                    </select>
                    <button onclick="generateAllQRCodesOptimized()" class="btn-all" id="btnGenerateAll">
                        Gerar Todos (79 QR Codes)
                    </button>
                    <button onclick="window.print()" class="btn-print">🖨️ Imprimir</button>
                </div>
                
                <!-- Barra de progresso -->
                <div id="progressContainer" class="progress-container" style="display: none;">
                    <div class="progress-info">
                        <span id="progressText">Gerando QR Codes...</span>
                        <span id="progressCount">0/79</span>
                    </div>
                    <div class="progress-bar">
                        <div id="progressFill" class="progress-fill"></div>
                    </div>
                </div>
                
                <div id="qrCodesContainer" class="qr-container"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Adicionar CSS se não existir
    if (!document.getElementById('qrOptimizedStyles')) {
        addOptimizedStyles();
    }
    
    // Gerar QR codes iniciais
    generateQRCodesSimple();
};

// Gerar QR Codes de um hospital específico
window.generateQRCodesSimple = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const hospital = QR_API.HOSPITAIS[hospitalId];
    const container = document.getElementById('qrCodesContainer');
    
    // Esconder progresso
    document.getElementById('progressContainer').style.display = 'none';
    
    container.innerHTML = `<h3>${hospital.nome}</h3><div class="qr-grid">`;
    
    // Gerar QR para cada leito
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
    console.log(`✅ ${hospital.leitos} QR Codes gerados para ${hospital.nome}`);
};

// Gerar todos os hospitais com carregamento otimizado
window.generateAllQRCodesOptimized = async function() {
    if (isGenerating) {
        console.log('Geração já em andamento...');
        return;
    }
    
    isGenerating = true;
    const btnGenerateAll = document.getElementById('btnGenerateAll');
    const progressContainer = document.getElementById('progressContainer');
    const container = document.getElementById('qrCodesContainer');
    
    // Calcular total de QR codes
    totalQRCodes = Object.values(QR_API.HOSPITAIS).reduce((total, hospital) => total + hospital.leitos, 0);
    generationProgress = 0;
    
    // Configurar interface
    btnGenerateAll.disabled = true;
    btnGenerateAll.textContent = 'Gerando...';
    progressContainer.style.display = 'block';
    container.innerHTML = '';
    
    console.log(`🚀 Iniciando geração de ${totalQRCodes} QR Codes...`);
    
    try {
        // Gerar por hospital sequencialmente
        for (const [hospitalId, hospital] of Object.entries(QR_API.HOSPITAIS)) {
            await generateHospitalQRCodes(hospitalId, hospital, container);
        }
        
        console.log('✅ Todos os QR Codes gerados com sucesso!');
        updateProgress('Concluído!', totalQRCodes, totalQRCodes);
        
        // Pequeno delay para mostrar conclusão
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro na geração:', error);
        updateProgress('Erro na geração', generationProgress, totalQRCodes);
    } finally {
        isGenerating = false;
        btnGenerateAll.disabled = false;
        btnGenerateAll.textContent = 'Gerar Todos (79 QR Codes)';
    }
};

// Gerar QR codes de um hospital com delay
async function generateHospitalQRCodes(hospitalId, hospital, container) {
    // Título do hospital
    container.innerHTML += `<h3 class="hospital-title">${hospital.nome}</h3><div class="qr-grid" id="grid-${hospitalId}">`;
    
    const grid = document.getElementById(`grid-${hospitalId}`);
    
    // Gerar cada leito com delay
    for (let i = 1; i <= hospital.leitos; i++) {
        const qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
        const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
        const nomeLeitoFormatado = getNomeLeitoFormatado(hospitalId, i);
        
        // Criar elemento
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
        
        // Atualizar progresso
        generationProgress++;
        updateProgress(`Gerando ${hospital.nome}...`, generationProgress, totalQRCodes);
        
        // Delay para evitar sobrecarga da API
        if (i < hospital.leitos) {
            await sleep(QR_API.DELAY);
        }
    }
    
    container.innerHTML += '</div>';
    console.log(`✅ ${hospital.nome}: ${hospital.leitos} QR Codes gerados`);
}

// Atualizar barra de progresso
function updateProgress(text, current, total) {
    const progressText = document.getElementById('progressText');
    const progressCount = document.getElementById('progressCount');
    const progressFill = document.getElementById('progressFill');
    
    if (progressText) progressText.textContent = text;
    if (progressCount) progressCount.textContent = `${current}/${total}`;
    if (progressFill) {
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

// Função sleep para delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fechar modal
window.closeQRModalSimple = function() {
    const modal = document.querySelector('.qr-modal-simple');
    if (modal) {
        // Parar geração se estiver em andamento
        isGenerating = false;
        modal.remove();
    }
};

// Adicionar estilos otimizados
function addOptimizedStyles() {
    const styles = document.createElement('style');
    styles.id = 'qrOptimizedStyles';
    styles.innerHTML = `
        /* Modal */
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
        
        .qr-modal-body {
            padding: 20px;
        }
        
        .qr-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .qr-controls select {
            padding: 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            background: white;
            min-width: 250px;
        }
        
        .qr-controls button {
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
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
        
        /* Barra de progresso */
        .progress-container {
            background: #f1f5f9;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-weight: 600;
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
        
        /* Container de QR codes */
        .qr-container h3 {
            text-align: center;
            color: #1a1f2e;
            margin: 30px 0 20px 0;
            font-size: 24px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
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
        }
        
        .qr-item:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        
        .qr-label {
            font-size: 14px;
            margin-bottom: 12px;
            color: #374151;
            line-height: 1.4;
        }
        
        .qr-label strong {
            color: #1e40af;
            font-size: 16px;
        }
        
        .qr-img {
            width: 160px;
            height: 160px;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
        }
        
        /* IMPRESSÃO OTIMIZADA - 12 POR A4 (3x4) */
        @media print {
            @page {
                margin: 10mm;
                size: A4 portrait;
            }
            
            /* Esconder elementos desnecessários */
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
            .qr-controls,
            .progress-container,
            .close-btn {
                display: none !important;
            }
            
            .qr-modal-body {
                padding: 0 !important;
            }
            
            .qr-container {
                width: 100% !important;
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
                page-break-inside: avoid;
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
            
            .qr-item:nth-child(12n+1) {
                page-break-before: always;
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
        
        /* Responsivo */
        @media (max-width: 768px) {
            .qr-modal-content {
                width: 98%;
                margin: 10px;
            }
            
            .qr-controls {
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
        }
    `;
    document.head.appendChild(styles);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Substituir função openQRCodes pela versão otimizada
    window.openQRCodes = window.openQRCodesSimple;
    console.log('✅ Sistema QR Code V3.3 CORRIGIDO carregado');
    console.log('📱 Base URL: https://qrcode-seven-gamma.vercel.app');
    console.log('🏥 Totais CORRETOS: H1:10, H2:36, H3:7, H4:13, H5:13 = 79 QR codes');
    console.log('🖨️ Impressão: 12 QR codes por A4 (3x4)');
    console.log('⚡ Carregamento sequencial com delay otimizado');
});
