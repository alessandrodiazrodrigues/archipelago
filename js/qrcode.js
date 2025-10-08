// =================== QRCODE-V3.1-CORRIGIDO.JS - SISTEMA COMPLETO ===================
// Sistema QR Code com impressão corrigida e configuração V3.1 atualizada

const QR_API = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE: 300,  // pixels
    // *** CONFIGURAÇÃO V3.1: 66 LEITOS TOTAL ***
    HOSPITAIS: {
        H1: { nome: 'Neomater', leitos: 10 },        // CORRIGIDO: 13→10
        H2: { nome: 'Cruz Azul', leitos: 36 },       // CORRIGIDO: 10→36
        H3: { nome: 'Santa Marcelina', leitos: 13 }, // CORRIGIDO: 12→13
        H4: { nome: 'Santa Clara', leitos: 7 }       // CORRIGIDO: 8→7
    }
    // TOTAL V3.1: 66 leitos (10+36+13+7)
};

// Função principal para abrir QR Codes
window.openQRCodesSimple = function() {
    console.log('📱 Abrindo gerador de QR Codes V3.1 (66 leitos total)...');
    
    // Remover modal existente se houver
    const existingModal = document.querySelector('.qr-modal-simple');
    if (existingModal) existingModal.remove();
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'qr-modal-simple';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <div class="qr-modal-header">
                <h2>📱 QR Codes dos Leitos - Sistema V3.1 (66 leitos)</h2>
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
                    <button onclick="generateAllQRCodes()" class="btn-all">Gerar Todos os Hospitais (66 leitos)</button>
                    <button onclick="printQRCodesFixed()" class="btn-print">🖨️ Imprimir (Corrigido)</button>
                </div>
                <div id="qrCodesContainer" class="qr-container"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Adicionar CSS se não existir
    if (!document.getElementById('qrSimpleStyles')) {
        addSimpleStyles();
    }
    
    // Gerar QR codes iniciais
    generateQRCodesSimple();
};

// Gerar QR Codes de um hospital
window.generateQRCodesSimple = function() {
    const hospitalId = document.getElementById('qrHospitalSelect').value;
    const hospital = QR_API.HOSPITAIS[hospitalId];
    const container = document.getElementById('qrCodesContainer');
    
    container.innerHTML = `<h3 class="hospital-title">${hospital.nome} - ${hospital.leitos} leitos (V3.1)</h3><div class="qr-grid">`;
    
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
                <img src="${imgURL}" alt="QR Code Leito ${i}" class="qr-img" loading="lazy">
            </div>
        `;
    }
    
    container.innerHTML += '</div>';
    console.log(`✅ ${hospital.leitos} QR Codes V3.1 gerados para ${hospital.nome}`);
};

// Gerar todos os hospitais
window.generateAllQRCodes = function() {
    const container = document.getElementById('qrCodesContainer');
    container.innerHTML = '';
    
    let totalQRs = 0;
    
    Object.keys(QR_API.HOSPITAIS).forEach(hospitalId => {
        const hospital = QR_API.HOSPITAIS[hospitalId];
        
        // Título do hospital com quantidade V3.1
        container.innerHTML += `<h3 class="hospital-title">${hospital.nome} - ${hospital.leitos} leitos</h3><div class="qr-grid">`;
        
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
                    <img src="${imgURL}" alt="QR Code" class="qr-img" loading="lazy">
                </div>
            `;
            totalQRs++;
        }
        
        container.innerHTML += '</div>';
    });
    
    console.log(`✅ Todos os QR Codes V3.1 gerados: ${totalQRs} leitos (66 total)`);
};

// *** IMPRESSÃO CORRIGIDA - NOVA FUNÇÃO ***
window.printQRCodesFixed = function() {
    console.log('🖨️ Preparando impressão corrigida...');
    
    const container = document.getElementById('qrCodesContainer');
    const qrItems = container.querySelectorAll('.qr-item');
    
    if (qrItems.length === 0) {
        alert('⚠️ Gere os QR codes primeiro!');
        return;
    }
    
    // Criar uma janela específica para impressão
    const printWindow = window.open('', '_blank');
    
    // Aguardar imagens carregarem
    const images = container.querySelectorAll('.qr-img');
    let loadedImages = 0;
    
    const preparePrint = () => {
        // HTML específico para impressão
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Codes - Archipelago V3.1</title>
                <style>
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        background: white;
                        color: black;
                    }
                    
                    .hospital-title {
                        background: #333 !important;
                        color: white !important;
                        padding: 8px 15px;
                        margin: 0 0 8mm 0;
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        page-break-before: always;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .hospital-title:first-child {
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
                        border: 1px solid black;
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
                        font-size: 10pt;
                        color: black;
                        margin-bottom: 3mm;
                        line-height: 1.2;
                    }
                    
                    .qr-label strong {
                        font-weight: bold;
                    }
                    
                    .qr-img {
                        width: 45mm;
                        height: 45mm;
                        margin: 0 auto;
                        display: block;
                    }
                    
                    @media print {
                        .hospital-title {
                            background: #333 !important;
                            color: white !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${container.innerHTML}
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Aguardar um pouco e imprimir
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };
    
    const checkAllLoaded = () => {
        loadedImages++;
        if (loadedImages === images.length) {
            console.log('✅ Todas as imagens carregadas, preparando impressão...');
            preparePrint();
        }
    };
    
    if (images.length === 0) {
        preparePrint();
        return;
    }
    
    images.forEach(img => {
        if (img.complete) {
            checkAllLoaded();
        } else {
            img.onload = checkAllLoaded;
            img.onerror = checkAllLoaded;
        }
    });
    
    // Timeout de segurança
    setTimeout(() => {
        if (loadedImages < images.length) {
            console.log('⚠️ Timeout na carga de imagens, imprimindo mesmo assim...');
            preparePrint();
        }
    }, 5000);
};

// Fechar modal
window.closeQRModalSimple = function() {
    const modal = document.querySelector('.qr-modal-simple');
    if (modal) modal.remove();
};

// Adicionar estilos
function addSimpleStyles() {
    const styles = document.createElement('style');
    styles.id = 'qrSimpleStyles';
    styles.innerHTML = `
        /* =================== MODAL STYLES =================== */
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
            backdrop-filter: blur(5px);
        }
        
        .qr-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 1200px;
            max-height: 90vh;
            overflow: auto;
            color: #333;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        
        .qr-modal-header {
            padding: 20px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
            border-radius: 12px 12px 0 0;
        }
        
        .qr-modal-header h2 {
            margin: 0;
            color: white;
            font-size: 20px;
        }
        
        .close-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        
        .close-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .qr-modal-body {
            padding: 20px;
        }
        
        /* =================== CONTROLS =================== */
        .qr-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .qr-controls select {
            padding: 12px 15px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            font-size: 16px;
            min-width: 250px;
            background: white;
            cursor: pointer;
            transition: border-color 0.3s ease;
        }
        
        .qr-controls select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .qr-controls button {
            padding: 12px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .qr-controls button:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .btn-all {
            background: #10b981 !important;
        }
        
        .btn-all:hover {
            background: #059669 !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
        }
        
        .btn-print {
            background: #8b5cf6 !important;
        }
        
        .btn-print:hover {
            background: #7c3aed !important;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
        }
        
        /* =================== CONTAINER E GRID =================== */
        .qr-container h3 {
            text-align: center;
            color: #1a1f2e;
            margin: 20px 0;
            font-size: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .hospital-title {
            background: linear-gradient(135deg, #3b82f6, #1e40af) !important;
            color: white !important;
            padding: 15px 20px !important;
            border-radius: 8px !important;
            margin: 25px 0 15px 0 !important;
            border: none !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .qr-item {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            background: #f9fafb;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .qr-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-color: #3b82f6;
        }
        
        .qr-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
            transition: left 0.5s ease;
        }
        
        .qr-item:hover::before {
            left: 100%;
        }
        
        .qr-label {
            font-size: 14px;
            margin-bottom: 12px;
            color: #374151;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        .qr-label strong {
            color: #1e40af;
            font-weight: 700;
        }
        
        .qr-img {
            width: 150px;
            height: 150px;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease;
        }
        
        .qr-item:hover .qr-img {
            transform: scale(1.05);
        }
        
        /* =================== RESPONSIVIDADE =================== */
        @media (max-width: 768px) {
            .qr-modal-content {
                width: 95%;
                height: 95vh;
                margin: 10px;
            }
            
            .qr-modal-header {
                padding: 15px;
            }
            
            .qr-modal-header h2 {
                font-size: 16px;
            }
            
            .qr-controls {
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
            }
            
            .qr-controls select,
            .qr-controls button {
                width: 100%;
                margin-bottom: 0;
                min-width: auto;
            }
            
            .qr-grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 10px;
            }
            
            .qr-img {
                width: 120px;
                height: 120px;
            }
            
            .hospital-title {
                font-size: 16px !important;
                padding: 12px 15px !important;
            }
        }
        
        @media (max-width: 480px) {
            .qr-modal-content {
                width: 98%;
                height: 98vh;
                margin: 5px;
            }
            
            .qr-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            
            .qr-img {
                width: 100px;
                height: 100px;
            }
            
            .qr-item {
                padding: 10px;
            }
        }
        
        /* =================== LOADING STATES =================== */
        .qr-img {
            background: #f3f4f6;
            background-image: linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
                            linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
                            linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        
        /* =================== PRINT FALLBACK (REMOVIDO O PROBLEMÁTICO) =================== */
        /* CSS de impressão removido intencionalmente para evitar conflitos */
        /* A impressão agora usa uma janela separada com CSS específico */
    `;
    document.head.appendChild(styles);
}

// =================== INICIALIZAÇÃO V3.1 ===================
document.addEventListener('DOMContentLoaded', function() {
    // Substituir função openQRCodes pela versão corrigida
    window.openQRCodes = window.openQRCodesSimple;
    
    console.log('✅ Sistema QR Code V3.1 CORRIGIDO carregado');
    console.log('🏥 Hospitais V3.1: H1:10, H2:36, H3:13, H4:7 leitos (66 total)');
    console.log('📱 API: api.qrserver.com');
    console.log('🖨️ Impressão: CORRIGIDA - usa janela separada');
    console.log('🔧 Melhorias: loading lazy, timeout de segurança, CSS melhorado');
    
    // Verificar se URL base está funcionando
    fetch(QR_API.BASE_URL + '/?test=1')
        .then(() => console.log('✅ URL base QR acessível'))
        .catch(() => console.warn('⚠️ URL base QR pode estar indisponível'));
});

// =================== EXPORT DE FUNÇÕES GLOBAIS ===================
window.QR_API = QR_API;
window.generateQRCodesSimple = generateQRCodesSimple;
window.generateAllQRCodes = generateAllQRCodes;
window.printQRCodesFixed = printQRCodesFixed;
window.closeQRModalSimple = closeQRModalSimple;

console.log('📱 QR Code V3.1 System - Fully Loaded & Fixed');
