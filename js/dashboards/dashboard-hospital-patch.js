// dashboard-hospital-patch.js
// PATCH V4.2 - Corrige tabelas TPH, PPS e Diretivas

console.log('🔧 Carregando Patch V4.2...');

// Aguardar que tudo esteja carregado
(function() {
    const aplicarPatch = () => {
        if (typeof window.processarDadosHospital !== 'function') {
            console.log('⏳ Aguardando processarDadosHospital...');
            setTimeout(aplicarPatch, 100);
            return;
        }
        
        // Guardar original
        window.processarDadosHospital_ORIGINAL = window.processarDadosHospital;
        
        // Aplicar patch
        window.processarDadosHospital = function(hospitalId) {
            const resultado = window.processarDadosHospital_ORIGINAL(hospitalId);
            
            const hospitalObj = window.hospitalData[hospitalId] || {};
            let leitos = hospitalObj.leitos || [];
            if (!Array.isArray(leitos)) leitos = [];
            
            const ocupados = leitos.filter(l => {
                if (!l || !l.status) return false;
                const status = l.status.toLowerCase();
                return status === 'ocupado' || status === 'em uso';
            });
            
            // ✅ TPH >= 5 dias
            resultado.tph.lista = ocupados.filter(l => {
                if (!l.admAt) return false;
                const admData = new Date(l.admAt);
                if (isNaN(admData.getTime())) return false;
                const horas = (new Date() - admData) / (1000 * 60 * 60);
                return horas >= 120;
            }).map(l => {
                const dias = Math.floor((new Date() - new Date(l.admAt)) / (1000 * 60 * 60 * 24));
                return { 
                    leito: l.identificacaoLeito || l.leito || '---',
                    matricula: l.matricula || '---',
                    dias: dias
                };
            }).sort((a, b) => b.dias - a.dias);
            
            // ✅ PPS < 40%
            resultado.pps.menor40 = ocupados.filter(l => {
                const pps = parseInt(l.pps) || 0;
                return pps > 0 && pps < 40;
            }).map(l => ({
                leito: l.identificacaoLeito || l.leito || '---',
                matricula: l.matricula || '---'
            }));
            
            // ✅ Diretivas
            resultado.spict.listaDiretivas = ocupados.filter(l => {
                if (!l.spict) return false;
                const spictNorm = l.spict.toLowerCase().trim();
                if (spictNorm !== 'elegivel' && spictNorm !== 'elegível') return false;
                
                const dir = l.diretivas ? l.diretivas.toLowerCase().trim() : '';
                const valoresPendentes = ['', 'não', 'nao', 'n/a', 'pendente', 'não se aplica'];
                return valoresPendentes.includes(dir);
            }).map(l => ({
                leito: l.identificacaoLeito || l.leito || '---',
                matricula: l.matricula || '---'
            }));
            
            return resultado;
        };
        
        console.log('✅ PATCH V4.2 APLICADO COM SUCESSO!');
    };
    
    aplicarPatch();
})();
