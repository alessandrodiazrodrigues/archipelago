// =================== QRCODE-SIMPLE.JS V3.1 - GERADOR VIA API ===================
// Sistema simplificado usando API do QR Server - CORRIGIDO V3.1

const QR_API = {
    BASE_URL: 'https://qrcode-seven-gamma.vercel.app',
    API_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    SIZE: 300,  // pixels
    // *** CORREÇÃO V3.1: SINCRONIZAR COM NOVA CONFIGURAÇÃO DE HOSPITAIS ***
    HOSPITAIS: {
        H1: { nome: 'Neomater', leitos: 10 },        // CORRIGIDO: 13→10
        H2: { nome: 'Cruz Azul', leitos: 36 },       // CORRIGIDO: 10→36
        H3: { nome: 'Santa Marcelina', leitos: 13 }, // CORRIGIDO: 12→13
        H4: { nome: 'Santa Clara', leitos: 7 }       // CORRIGIDO: 8→7
    }
    // TOTAL V3.1: 66 leitos (10+36+13+7)
};

// Função para gerar QR Codes simples
window.openQRCodesSimple = function() {
    console.log('🔵 Abrindo gerador de QR Codes V3.1 (66 leitos total)...');
    
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
                    <button onclick="generateAllQRCodes()" class="btn-all">Gerar Todos os Hospitais (66 leitos)</button>
                    <button onclick="window.print()" class="btn-print">🖨️ Imprimir (12 por A4)</button>
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
    
    container.innerHTML = `<h3>${hospital.nome} - ${hospital.leitos} leitos (V3.1)</h3><div class="qr-grid">`;
    
    // Gerar QR para cada leito
    for (let i = 1; i <= hospital.leitos; i++) {
        const qrURL = `${QR_API.BASE_URL}/?h=${hospitalId}&l=${i}`;
        const imgURL = `${QR_API.API_URL}?size=${QR_API.SIZE}x${QR_API.SIZE}&data=${encodeURIComponent(qrURL)}`;
        
        container.innerHTML += `
            <div class="qr-item">
                <div class="qr-label">
                    <strong>${hospital.nome}</strong><br>
                    Leito ${i}
                </div>
                <img src="${imgURL}" alt="QR Code Leito ${i}" class="qr-img">
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
                        Leito ${i}
                    </div>
                    <img src="${imgURL}" alt="QR Code" class="qr-img">
                </div>
            `;
            totalQRs++;
        }
        
        container.innerHTML += '</div>';
    });
    
    console.log(`✅ Todos os QR Codes V3.1 gerados: ${totalQRs} leitos (66 total)`);
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
        }
        
        .qr-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 1200px;
            max-height: 90vh;
            overflow: auto;
            color: #333;
        }
        
        .qr-modal-header {
            padding: 20px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .qr-modal-header h2 {
            margin: 0;
            color: #1a1f2e;
        }
        
        .close-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
        }
        
        .qr-modal-body {
            padding: 20px;
        }
        
        .qr-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .qr-controls select {
            padding: 10px;
            border: 2px solid #d1d5db;
            border-radius: 6px;
            font-size: 16px;
            min-width: 200px;
        }
        
        .qr-controls button {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease;
        }
        
        .qr-controls button:hover {
            background: #2563eb;
        }
        
        .btn-all {
            background: #10b981 !important;
        }
        
        .btn-all:hover {
            background: #059669 !important;
        }
        
        .btn-print {
            background: #8b5cf6 !important;
        }
        
        .btn-print:hover {
            background: #7c3aed !important;
        }
        
        .qr-container h3 {
            text-align: center;
            color: #1a1f2e;
            margin: 20px 0;
            font-size: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .hospital-title {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white !important;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0 !important;
            border: none !important;
        }
        
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .qr-item {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            background: #f9fafb;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .qr-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: #3b82f6;
        }
        
        .qr-label {
            font-size: 14px;
            margin-bottom: 10px;
            color: #374151;
        }
        
        .qr-label strong {
            color: #1e40af;
        }
        
        .qr-img {
            width: 150px;
            height: 150px;
            display: block;
            margin: 0 auto;
            border-radius: 4px;
        }
        
        /* RESPONSIVIDADE MELHORADA */
        @media (max-width: 768px) {
            .qr-modal-content {
                width: 95%;
                height: 95vh;
            }
            
            .qr-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .qr-controls select,
            .qr-controls button {
                width: 100%;
                margin-bottom: 10px;
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
        
        /* IMPRESSÃO - 12 POR A4 (3x4) - MELHORADA */
        @media print {
            body * {
                display: none !important;
            }
            
            .qr-modal-content,
            .qr-modal-content * {
                display: block !important;
            }
            
            .qr-modal-simple {
                position: static !important;
            }
            
            .qr-modal-content {
                width: 100% !important;
                max-width: none !important;
                border: none !important;
                box-shadow: none !important;
            }
            
            .qr-modal-header,
            .qr-controls {
                display: none !important;
            }
            
            .qr-container h3 {
                page-break-before: always;
                margin: 0 0 10mm 0 !important;
                font-size: 14pt !important;
                text-align: center !important;
            }
            
            .qr-container h3:first-child {
                page-break-before: auto;
            }
            
            .hospital-title {
                background: #333 !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .qr-grid {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 5mm !important;
                page-break-inside: avoid;
            }
            
            .qr-item {
                width: 60mm !important;
                height: 65mm !important;
                padding: 3mm !important;
                page-break-inside: avoid !important;
                border: 1px solid black !important;
                background: white !important;
            }
            
            .qr-item:nth-child(12n+1) {
                page-break-before: always;
            }
            
            .qr-img {
                width: 45mm !important;
                height: 45mm !important;
            }
            
            .qr-label {
                font-size: 10pt !important;
                color: black !important;
            }
        }
    `;
    document.head.appendChild(styles);
}

// Adicionar botão alternativo no menu - V3.1
document.addEventListener('DOMContentLoaded', function() {
    // Substituir função openQRCodes pela versão simples
    window.openQRCodes = window.openQRCodesSimple;
    console.log('✅ Sistema QR Code V3.1 carregado');
    console.log('🏥 Hospitais: H1:10, H2:36, H3:13, H4:7 leitos (66 total)');
    console.log('📱 Usando API: api.qrserver.com');
    console.log('🖨️ Impressão: 12 QR codes por A4');
});
