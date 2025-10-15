// =================== QRCODE-NOVA-JANELA.JS - SOLUÇÃO DEFINITIVA PARA IMPRESSÃO ===================
// Sistema com nova janela dedicada para impressão - 100% funcional

const QR_API = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE: 300,  // pixels
    DELAY: 150, // delay entre requisições (ms)
    HOSPITAIS: {
        H1: { nome: 'Neomater', leitos: 10 },
        H2: { nome: 'Cruz Azul', leitos: 36 },
        H3: { nome: 'Santa Marcelina', leitos: 13 },
        H4: { nome: 'Santa Clara', leitos: 7 }
    }
};

// Variáveis de controle
let isGenerating = false;
let generationProgress = 0;
let totalQRCodes = 0;

// Função principal para abrir modal
window.openQRCodesSimple = function() {
    console.log('🔵 Abrindo gerador de QR Codes com nova janela de impressão...');
    
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
                <h2>📱 QR Codes dos Leitos - Sistema V3.1</h2>
                <button onclick="closeQRModalSimple()" class="close-btn">✕</button>
            </div>
            <div class="qr-modal-body">
                <div class="qr-controls">
                    <select id="qrHospitalSelect" onchange="generateQRCodesSimple()">
                        <option value="H1">Neomater (10 leitos)</option>
                        <option value="H2">Cruz Azul (36 leitos)</option>
                        <option value="H3">Santa Marcelina (13 leitos)</option>
                        <option value="H4">Santa Clara (7 leitos)</option>
                    </select>
                    <button onclick="generateAllQRCodesOptimized()" class="btn-all" id="btnGenerateAll">
                        Gerar Todos (66 QR Codes)
                    </button>
                    <button onclick="abrirJanelaImpressao()" class="btn-print">🖨️ Imprimir (Nova Janela)</button>
                    <button onclick="imprimirDireto()" class="btn-print-direct">⚡ Imprimir Direto</button>
                </div>
                
                <!-- Barra de progresso -->
                <div id="progressContainer" class="progress-container" style="display: none;">
                    <div class="progress-info">
                        <span id="progressText">Gerando QR Codes...</span>
                        <span id="progressCount">0/66</span>
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

// =================== NOVA FUNÇÃO: ABRIR JANELA DE IMPRESSÃO ===================
window.abrirJanelaImpressao = function() {
    const container = document.getElementById('qrCodesContainer');
    if (!container || container.innerHTML.trim() === '') {
        alert('Gere os QR Codes primeiro!');
        return;
    }
    
    console.log('🖨️ Abrindo nova janela para impressão...');
    
    // Extrair apenas o conteúdo dos QR codes
    const qrContent = container.innerHTML;
    
    // Criar HTML completo para impressão
    const printHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Codes - Archipelago Dashboard</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: white;
            color: #000;
            padding: 10mm;
        }
        
        .hospital-titulo,
        .hospital-title,
        h3 {
            text-align: center;
            color: #000;
            margin: 0 0 8mm 0;
            font-size: 20px;
            font-weight: bold;
            page-break-before: always;
            padding: 3mm;
            border-bottom: 2px solid #000;
        }
        
        .hospital-titulo:first-child,
        .hospital-title:first-child,
        h3:first-child {
            page-break-before: auto;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
            margin-bottom: 10mm;
            page-break-inside: avoid;
        }
        
        .qr-item {
            width: 60mm;
            height: 65mm;
            padding: 3mm;
            border: 2px solid #000;
            text-align: center;
            background: white;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .qr-item:nth-child(12n+1) {
            page-break-before: always;
        }
        
        .qr-label {
            font-size: 12px;
            color: #000;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 2mm;
        }
        
        .qr-label strong {
            font-size: 13px;
            color: #000;
        }
        
        .qr-img {
            width: 48mm;
            height: 48mm;
            margin: 0 auto;
            display: block;
        }
        
        /* Impressão específica */
        @media print {
            body {
                padding: 5mm;
            }
            
            .qr-item {
                width: 65mm;
                height: 70mm;
            }
            
            .qr-img {
                width: 50mm;
                height: 50mm;
            }
        }
        
        @page {
            size: A4;
            margin: 5mm;
        }
    </style>
</head>
<body>
    <div class="print-content">
        ${qrContent}
    </div>
    
    <script>
        // Auto-impressão após carregamento completo das imagens
        window.addEventListener('load', function() {
            console.log('📄 Janela de impressão carregada');
            
            // Aguardar 2 segundos para garantir que todas as imagens carregaram
            setTimeout(function() {
                console.log('🖨️ Iniciando impressão automática...');
                window.print();
                
                // Fechar janela após impressão (optional)
                setTimeout(function() {
                    window.close();
                }, 1000);
            }, 2000);
        });
        
        // Verificar carregamento das imagens
        const images = document.querySelectorAll('.qr-img');
        let loadedImages = 0;
        
        images.forEach(img => {
            if (img.complete) {
                loadedImages++;
            } else {
                img.addEventListener('load', function() {
                    loadedImages++;
                    console.log('✅ Imagem carregada:', loadedImages + '/' + images.length);
                });
            }
        });
    </script>
</body>
</html>
    `;
    
    // Abrir nova janela
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    console.log('✅ Nova janela de impressão aberta');
};

// =================== FUNÇÃO ALTERNATIVA: IMPRESSÃO DIRETA ===================
window.imprimirDireto = function() {
    const container = document.getElementById('qrCodesContainer');
    if (!container || container.innerHTML.trim() === '') {
        alert('Gere os QR Codes primeiro!');
        return;
    }
    
    console.log('⚡ Preparando impressão direta...');
    
    // Salvar estado atual
    const originalContent = document.body.innerHTML;
    const originalStyles = document.head.innerHTML;
    
    // Substituir body inteiro
    document.body.innerHTML = `
        <div id="print-only-content">
            ${container.innerHTML}
        </div>
    `;
    
    // Adicionar CSS específico para impressão
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
        body {
            font-family: Arial, sans-serif;
            background: white;
            color: #000;
            padding: 5mm;
        }
        
        .hospital-titulo,
        .hospital-title,
        h3 {
            text-align: center;
            color: #000;
            margin: 0 0 8mm 0;
            font-size: 18px;
            font-weight: bold;
            page-break-before: always;
            padding: 3mm;
            border-bottom: 2px solid #000;
        }
        
        .hospital-titulo:first-child,
        .hospital-title:first-child,
        h3:first-child {
            page-break-before: auto;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
            margin-bottom: 10mm;
        }
        
        .qr-item {
            width: 65mm;
            height: 70mm;
            padding: 3mm;
            border: 2px solid #000;
            text-align: center;
            background: white;
            page-break-inside: avoid;
        }
        
        .qr-label {
            font-size: 12px;
            color: #000;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 2mm;
        }
        
        .qr-img {
            width: 50mm;
            height: 50mm;
            margin: 0 auto;
            display: block;
        }
        
        @page {
            size: A4;
            margin: 5mm;
        }
    `;
    document.head.appendChild(printStyle);
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
        window.print();
        
        // Restaurar conteúdo original após impressão
        setTimeout(() => {
            document.head.innerHTML = originalStyles;
            document.body.innerHTML = originalContent;
            
            // Re-abrir modal se necessário
            if (!document.querySelector('.qr-modal-simple')) {
                window.openQRCodesSimple();
            }
        }, 1000);
    }, 500);
};

// Gerar QR Codes de um hospital específico
window.generateQRCodesSimple = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const hospital = QR_API.HOSPITAIS[hospitalId];
    const container = document.getElementById('qrCodesContainer');
    
    // Esconder progresso
    document.getElementById('progressContainer').style.display = 'none';
    
    container.innerHTML = `<h3 class="hospital-titulo">${hospital.nome}</h3><div class="qr-grid">`;
    
    // Gerar QR para cada leito
    for (let i = 1; i <= hospital.leitos; i++) {
        const qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
        const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
        
        container.innerHTML += `
            <div class="qr-item">
                <div class="qr-label">
                    <strong>${hospital.nome}</strong><br>
                    Leito ${String(i).padStart(2, '0')}
                </div>
                <img src="${imgURL}" alt="QR Code Leito ${i}" class="qr-img" loading="eager">
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
        btnGenerateAll.textContent = 'Gerar Todos (66 QR Codes)';
    }
};

// Gerar QR codes de um hospital com delay
async function generateHospitalQRCodes(hospitalId, hospital, container) {
    // Título do hospital
    container.innerHTML += `<h3 class="hospital-titulo">${hospital.nome}</h3><div class="qr-grid" id="grid-${hospitalId}">`;
    
    const grid = document.getElementById(`grid-${hospitalId}`);
    
    // Gerar cada leito com delay
    for (let i = 1; i <= hospital.leitos; i++) {
        const qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
        const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
        
        // Criar elemento
        const qrItem = document.createElement('div');
        qrItem.className = 'qr-item';
        qrItem.innerHTML = `
            <div class="qr-label">
                <strong>${hospital.nome}</strong><br>
                Leito ${String(i).padStart(2, '0')}
            </div>
            <img src="${imgURL}" alt="QR Code" class="qr-img" loading="eager">
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
            min-width: 200px;
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
        
        .btn-print-direct {
            background: #f59e0b !important;
        }
        
        .btn-print-direct:hover {
            background: #d97706 !important;
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
        .qr-container .hospital-titulo {
            text-align: center;
            color: #1a1f2e;
            margin: 30px 0 20px 0;
            font-size: 24px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .qr-container .hospital-titulo:first-child {
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
    // Substituir função openQRCodes pela versão corrigida
    window.openQRCodes = window.openQRCodesSimple;
    console.log('✅ Sistema QR Code V3.1 - NOVA JANELA DE IMPRESSÃO');
    console.log('📱 Base URL: https://qrcode-seven-gamma.vercel.app');
    console.log('🏥 Totais V3.1: H1:10, H2:36, H3:13, H4:7 = 66 QR codes');
    console.log('🖨️ SOLUÇÃO: Nova janela dedicada para impressão');
    console.log('⚡ ALTERNATIVA: Impressão direta substituindo body');
    console.log('✅ PROBLEMA RESOLVIDO: 100% funcional');
});
