// =================== DASHBOARD HOSPITALAR V3.2 - VERSÃO COMPLETA ===================
// =================== NOVIDADES V3.2: LINHA 2 KPIS + PIZZA REGIÃO + LINHA 3 H2/H4 ===================
// Data: Outubro/2025
// Desenvolvedor: Alessandro Rodrigues
// Cliente: Guilherme Santoro
//
// ✅ MANTIDO: Todo código V3.1 (1913 linhas)
// ✅ ADICIONADO: Linha 2 KPIs (Isolamento, Enfermarias, Apartamentos, Diretivas, Média Idade)
// ✅ ADICIONADO: Gráfico Pizza Distribuição por Região
// ✅ ADICIONADO: Linha 3 KPIs condicional (H2: Enferm/Aptos/Bloqueados | H4: Enferm Ocup/Livres)
// ==================================================================================

// Estado dos gráficos selecionados por hospital
window.graficosState = {
    H1: { concessoes: 'bar', linhas: 'bar' },
    H2: { concessoes: 'bar', linhas: 'bar' },
    H3: { concessoes: 'bar', linhas: 'bar' },
    H4: { concessoes: 'bar', linhas: 'bar' },
    H5: { concessoes: 'bar', linhas: 'bar' }
};

// Estado global para fundo branco
window.fundoBranco = false;

// =================== CORES PANTONE V3.3 - USA api.js (window.CORES_*) ===================
// ✅ CORREÇÃO APLICADA: Este dashboard agora usa as cores definidas no api.js
// As cores são acessadas via window.CORES_CONCESSOES e window.CORES_LINHAS
// Isso garante consistência 100% com os nomes que vêm da planilha
//
// IMPORTANTE: As paletas locais antigas foram REMOVIDAS!
// Agora tudo vem do api.js para evitar nomes inconsistentes

// Função para obter cores Pantone EXATAS do api.js
function getCorExata(itemName, tipo = 'concessao') {
    if (!itemName || typeof itemName !== 'string') {
        console.warn(`⚠️ [CORES] Item inválido: "${itemName}"`);
        return '#6b7280'; // Único fallback permitido
    }
    
    // ✅ CORREÇÃO: Agora usa window.CORES do api.js!
    const paleta = tipo === 'concessao' ? 
        window.CORES_CONCESSOES :  // Do api.js
        window.CORES_LINHAS;       // Do api.js
    
    if (!paleta) {
        console.error(`❌ [CORES] Paleta não carregada! Verifique se api.js está carregado antes.`);
        return '#6b7280';
    }
    
    // 1. Busca exata primeiro
    let cor = paleta[itemName];
    if (cor) {
        console.log(`✅ [CORES] Encontrado exato: "${itemName}" → ${cor}`);
        return cor;
    }
    
    // 2. Normalizar para busca flexível (apenas caso não encontre exato)
    const nomeNormalizado = itemName
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[–—]/g, '-');
    
    cor = paleta[nomeNormalizado];
    if (cor) {
        console.log(`✅ [CORES] Encontrado normalizado: "${itemName}" → "${nomeNormalizado}" → ${cor}`);
        return cor;
    }
    
    // 3. Log de erro para debug
    console.error(`❌ [CORES] COR NÃO ENCONTRADA: "${itemName}" (normalizado: "${nomeNormalizado}")`);
    console.error(`❌ [CORES] Disponíveis na paleta (tipo: ${tipo}):`, Object.keys(paleta));
    
    return '#6b7280'; // Fallback final cinza
}

// Detectar se é mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// =================== FUNÇÃO PARA GERAR JITTER (DESLOCAMENTO) ===================
function getJitter(label, index) {
    // Usar o hash do label para gerar um offset consistente
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
        hash = ((hash << 5) - hash) + label.charCodeAt(i);
        hash = hash & hash;
    }
    
    // Jitter menor no mobile para não confundir visualização
    const mobile = isMobile();
    const jitterRange = mobile ? 0.15 : 0.2;
    
    // Retornar jitter entre -jitterRange e +jitterRange
    return ((hash % 40) - 20) / 100 * jitterRange;
}

// =================== FUNÇÃO PARA CRIAR LEGENDAS HTML CUSTOMIZADAS - BUG CORRIGIDO ===================
window.createCustomLegendOutside = function(chartId, datasets) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Procurar o container pai (.chart-container)
    const chartContainer = canvas.closest('.chart-container');
    if (!chartContainer) return;
    
    // Remover legenda antiga se existir
    const existingLegend = chartContainer.parentNode.querySelector('.custom-legend-container');
    if (existingLegend) existingLegend.remove();
    
    // Criar nova legenda
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : '#1a1f2e';
    const legendContainer = document.createElement('div');
    legendContainer.className = 'custom-legend-container';
    legendContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
        padding: 16px 12px;
        background: ${fundoLegenda};
        border-radius: 8px;
        margin-top: 16px;
        border: 1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    `;
    
    datasets.forEach((dataset, idx) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 6px;
            background: ${window.fundoBranco ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'};
            transition: all 0.2s ease;
            user-select: none;
        `;
        
        const colorBox = document.createElement('span');
        colorBox.style.cssText = `
            width: 18px;
            height: 18px;
            background: ${dataset.backgroundColor || dataset.borderColor || '#999'};
            border: 2px solid ${window.fundoBranco ? '#000' : '#fff'};
            border-radius: 3px;
            flex-shrink: 0;
        `;
        
        const label = document.createElement('span');
        label.textContent = dataset.label || `Dataset ${idx + 1}`;
        label.style.cssText = `
            color: ${corTexto};
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            opacity: 1;
        `;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        
        // ✅ EVENT LISTENER REESCRITO - BUSCA CHART POR canvas.id EM window.chartInstances
        item.addEventListener('click', () => {
            try {
                // 🔍 BUSCA O CHART PELA CHAVE DO CANVAS.ID NO REGISTRY GLOBAL
                const chart = window.chartInstances && window.chartInstances[canvas.id];
                
                if (!chart) {
                    console.error(`❌ [LEGENDA] Chart não encontrado para canvas.id: "${canvas.id}"`);
                    console.error(`❌ [LEGENDA] chartInstances disponíveis:`, Object.keys(window.chartInstances || {}));
                    return;
                }
                
                console.log(`🔵 [LEGENDA] Clicou em "${dataset.label}" (dataset ${idx})`);
                console.log(`🔵 [LEGENDA] Chart encontrado:`, chart);
                console.log(`🔵 [LEGENDA] Estado ANTES do toggle:`, chart.getDatasetMeta(idx).hidden);
                
                // ✅ TOGGLE: Alterna o estado de visibilidade
                const meta = chart.getDatasetMeta(idx);
                const novoEstado = !meta.hidden; // Se estava false (visível) → true (escondido)
                meta.hidden = novoEstado;
                
                console.log(`🔵 [LEGENDA] Novo estado definido para:`, novoEstado);
                
                // ✅ UPDATE: Atualizar gráfico com animação de transição
                chart.update('active');
                
                // ✅ FEEDBACK VISUAL: Alterar opacidade do item da legenda
                item.style.opacity = novoEstado ? '0.4' : '1';
                colorBox.style.opacity = novoEstado ? '0.4' : '1';
                
                console.log(`✅ [LEGENDA] Toggle concluído! Dataset ${idx} agora está: ${novoEstado ? 'OCULTO' : 'VISÍVEL'}`);
                console.log(`✅ [LEGENDA] Estado APÓS o toggle:`, chart.getDatasetMeta(idx).hidden);
                
            } catch (error) {
                console.error(`❌ [LEGENDA] Erro ao processar toggle para "${dataset.label}":`, error);
                console.error(`❌ [LEGENDA] canvas.id:`, canvas.id);
                console.error(`❌ [LEGENDA] idx do dataset:`, idx);
                console.error(`❌ [LEGENDA] Stack:`, error.stack);
            }
        });
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
            item.style.background = window.fundoBranco ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = window.fundoBranco ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)';
        });
        
        legendContainer.appendChild(item);
    });
    
    // Adicionar DEPOIS do chart-container (não dentro)
    chartContainer.parentNode.insertBefore(legendContainer, chartContainer.nextSibling);
    
    console.log(`✅ [LEGENDA] Criada para ${chartId} com ${datasets.length} itens`);
};

// =================== FUNÇÃO PARA ATUALIZAR TODAS AS CORES ===================
window.atualizarTodasAsCores = function() {
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const fundoLegenda = window.fundoBranco ? '#f0f0f0' : '#1a1f2e';
    
    // 1. Atualizar legendas customizadas
    document.querySelectorAll('.custom-legend-container').forEach(container => {
        container.style.backgroundColor = fundoLegenda;
        container.style.background = fundoLegenda;
        container.style.border = `1px solid ${window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`;
        
        container.querySelectorAll('span').forEach((span, index) => {
            if (index % 2 === 1) { // Apenas os labels de texto
                span.style.color = corTexto;
            }
        });
    });
    
    // 2. Atualizar eixos e grid dos gráficos
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(chart => {
            if (chart && chart.options && chart.options.scales) {
                // Eixo X
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = corTexto;
                    chart.options.scales.x.grid.color = corGrid;
                    if (chart.options.scales.x.title) {
                        chart.options.scales.x.title.color = corTexto;
                    }
                }
                
                // Eixo Y
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = corTexto;
                    chart.options.scales.y.grid.color = corGrid;
                    if (chart.options.scales.y.title) {
                        chart.options.scales.y.title.color = corTexto;
                    }
                }
                
                chart.update('none');
            }
        });
    }
};

window.renderDashboardHospitalar = function() {
    logInfo('Renderizando Dashboard Hospitalar V3.2');
    
    let container = document.getElementById('dashHospitalarContent');
    if (!container) {
        const dash1Section = document.getElementById('dash1');
        if (dash1Section) {
            container = document.createElement('div');
            container.id = 'dashHospitalarContent';
            dash1Section.appendChild(container);
            logInfo('Container dashHospitalarContent criado automaticamente');
        }
    }
    
    if (!container) {
        container = document.getElementById('dashboardContainer');
        if (!container) {
            logError('Nenhum container encontrado para Dashboard Hospitalar');
            return;
        }
    }
    
    // Verificar dados reais
    if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; color: white; background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); border-radius: 12px; margin: 20px; padding: 40px;">
                <div style="width: 60px; height: 60px; border: 3px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #60a5fa; margin-bottom: 10px; font-size: 20px;">Aguardando dados reais da API V3.2</h2>
                <p style="color: #9ca3af; font-size: 14px;">Conectando com Google Apps Script (74 colunas)...</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">Somente dados reais são exibidos</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        setTimeout(() => {
            if (window.hospitalData && Object.keys(window.hospitalData).length > 0) {
                window.renderDashboardHospitalar();
            }
        }, 3000);
        return;
    }
    
    const hospitaisComDados = Object.keys(CONFIG.HOSPITAIS).filter(hospitalId => {
        const hospital = window.hospitalData[hospitalId];
        return hospital && hospital.leitos && hospital.leitos.some(l => l.status === 'ocupado' || l.status === 'vago');
    });
    
    if (hospitaisComDados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: white; background: #1a1f2e; border-radius: 12px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">Nenhum dado hospitalar disponível</h3>
                <p style="color: #9ca3af; margin-bottom: 20px;">Aguardando dados reais da planilha Google (74 colunas V3.2).</p>
                <button onclick="window.forceDataRefresh()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    Recarregar Dados Reais
                </button>
            </div>
        `;
        return;
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 20px; color: white;">
            <!-- HEADER EM UMA LINHA -->
            <div class="dashboard-header" style="margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border-left: 4px solid #60a5fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; white-space: nowrap;">Dashboard Hospitalar V3.2</h2>
                </div>
                <!-- SWITCH NA LINHA DE BAIXO -->
                <div style="display: flex; justify-content: flex-end;">
                    <button id="toggleFundoBtn" class="toggle-fundo-btn" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #e2e8f0; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <span id="toggleIcon">🌙</span>
                        <span id="toggleText">ESCURO</span>
                    </button>
                </div>
            </div>
            
            <div class="hospitais-container">
                ${hospitaisComDados.map(hospitalId => renderHospitalSection(hospitalId)).join('')}
            </div>
        </div>
        
        ${getHospitalConsolidadoCSS()}
        
        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .toggle-fundo-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-1px);
            }
            
            .toggle-fundo-btn.active {
                background: #f59e0b !important;
                border-color: #f59e0b !important;
                color: #000000 !important;
            }
        </style>
    `;
    
    // Event listener para o botão único de toggle - ATUALIZADO COM CORES COMPLETAS
    const toggleBtn = document.getElementById('toggleFundoBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            window.fundoBranco = !window.fundoBranco;
            
            const icon = document.getElementById('toggleIcon');
            const text = document.getElementById('toggleText');
            
            if (window.fundoBranco) {
                toggleBtn.classList.add('active');
                icon.textContent = '☀️';
                text.textContent = 'CLARO';
            } else {
                toggleBtn.classList.remove('active');
                icon.textContent = '🌙';
                text.textContent = 'ESCURO';
            }
            
            // ATUALIZAR TODAS AS CORES
            window.atualizarTodasAsCores();
            
            // Re-renderizar todos os gráficos
            hospitaisComDados.forEach(hospitalId => {
                renderAltasHospital(hospitalId);
                renderConcessoesHospital(hospitalId, window.graficosState[hospitalId]?.concessoes || 'bar');
                renderLinhasHospital(hospitalId, window.graficosState[hospitalId]?.linhas || 'bar');
                renderPizzaRegiao(hospitalId); // ⬅️ NOVO V3.2!
            });
            
            // Recriar legendas com cores atualizadas
            setTimeout(() => {
                if (window.chartInstances) {
                    Object.entries(window.chartInstances).forEach(([key, chart]) => {
                        if (chart && chart.config && chart.canvas) {
                            const datasets = chart.config.data.datasets;
                            if (datasets && datasets.length > 0) {
                                window.createCustomLegendOutside(chart.canvas.id, datasets);
                            }
                        }
                    });
                }
            }, 100);
        });
    }
    
    logSuccess('Dashboard Hospitalar V3.2 renderizado com sucesso');
};

// =================== FUNÇÃO PARA CALCULAR KPIs DO HOSPITAL ===================
function calcularKPIsHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return {
            ocupacao: 0,
            total: 0,
            ocupados: 0,
            vagos: 0,
            emAlta: 0
        };
    }
    
    const leitos = hospital.leitos || [];
    const total = leitos.length;
    const ocupados = leitos.filter(l => l.status === 'ocupado').length;
    const vagos = total - ocupados;
    const ocupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
    
    // Contar pacientes em alta (prevAlta != 'SP' e != vazio)
    const emAlta = leitos.filter(l => {
        if (l.status !== 'ocupado') return false;
        const prevAlta = l.prevAlta || '';
        return prevAlta && prevAlta.toLowerCase() !== 'sp' && prevAlta.trim() !== '';
    }).length;
    
    return {
        ocupacao,
        total,
        ocupados,
        vagos,
        emAlta
    };
}

// =================== FUNÇÃO PARA CALCULAR KPIs DETALHADOS V3.2 (LINHA 2) ===================
function calcularKPIsDetalhados(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) {
        return {
            isolamentoTotal: 0,
            isolamentoResp: 0,
            isolamentoCont: 0,
            enfermariasOcupadas: 0,
            apartamentosOcupados: 0,
            diretivasSim: 0,
            mediaIdade: 0
        };
    }
    
    const leitosOcupados = hospital.leitos.filter(l => l.status === 'ocupado');
    
    // 1. ISOLAMENTO
    const isolamentoTotal = leitosOcupados.filter(l => {
        const iso = l.isolamento || '';
        return iso !== 'Não Isolamento' && iso.trim() !== '';
    }).length;
    
    const isolamentoResp = leitosOcupados.filter(l => {
        const iso = l.isolamento || '';
        return iso.includes('Respiratório');
    }).length;
    
    const isolamentoCont = leitosOcupados.filter(l => {
        const iso = l.isolamento || '';
        return iso.includes('Contato');
    }).length;
    
    // 2. ENFERMARIAS (pacientes com categoria = Enfermaria)
    const enfermariasOcupadas = leitosOcupados.filter(l => {
        const cat = l.categoriaEscolhida || l.categoria || l.tipo || '';
        return cat.toLowerCase().includes('enfermaria');
    }).length;
    
    // 3. APARTAMENTOS (pacientes com categoria = Apartamento)
    const apartamentosOcupados = leitosOcupados.filter(l => {
        const cat = l.categoriaEscolhida || l.categoria || l.tipo || '';
        return cat.toLowerCase().includes('apto') || cat.toLowerCase().includes('apartamento');
    }).length;
    
    // 4. DIRETIVAS (pacientes com diretivas = 'Sim')
    const diretivasSim = leitosOcupados.filter(l => {
        const dir = l.diretivas || '';
        return dir.toLowerCase() === 'sim';
    }).length;
    
    // 5. MÉDIA IDADE
    const idades = leitosOcupados
        .map(l => l.idade)
        .filter(idade => idade && !isNaN(idade) && idade > 0);
    
    const mediaIdade = idades.length > 0 ? 
        Math.round(idades.reduce((a, b) => a + b, 0) / idades.length) : 0;
    
    return {
        isolamentoTotal,
        isolamentoResp,
        isolamentoCont,
        enfermariasOcupadas,
        apartamentosOcupados,
        diretivasSim,
        mediaIdade
    };
}

// =================== FUNÇÃO PARA CALCULAR KPIs H2 (CRUZ AZUL) - LINHA 3 ===================
function calcularKPIsH2(hospitalId) {
    if (hospitalId !== 'H2') return null;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return null;
    
    const leitos = hospital.leitos;
    
    // Enfermarias: leitos 21-36 (16 leitos)
    const enfermarias = leitos.filter(l => l.leito >= 21 && l.leito <= 36);
    const enfermariasTotal = enfermarias.length;
    const enfermariasOcupadas = enfermarias.filter(l => l.status === 'ocupado').length;
    const enfermariasDisponiveis = enfermariasTotal - enfermariasOcupadas;
    const enfermariasPerc = enfermariasTotal > 0 ? 
        Math.round((enfermariasOcupadas / enfermariasTotal) * 100) : 0;
    
    // Apartamentos: leitos 1-20 (20 leitos)
    const apartamentos = leitos.filter(l => l.leito >= 1 && l.leito <= 20);
    const apartamentosTotal = apartamentos.length;
    const apartamentosOcupados = apartamentos.filter(l => l.status === 'ocupado').length;
    const apartamentosDisponiveis = apartamentosTotal - apartamentosOcupados;
    const apartamentosPerc = apartamentosTotal > 0 ? 
        Math.round((apartamentosOcupados / apartamentosTotal) * 100) : 0;
    
    // Leitos bloqueados (enfermarias com isolamento ou leito irmão ocupado com gênero diferente)
    // Lógica simplificada: contar leitos com isolamento
    const leitosBloqueados = enfermarias.filter(l => {
        const iso = l.isolamento || '';
        return iso !== 'Não Isolamento' && iso.trim() !== '';
    }).length;
    
    return {
        enfermariasTotal,
        enfermariasOcupadas,
        enfermariasDisponiveis,
        enfermariasPerc,
        apartamentosTotal,
        apartamentosOcupados,
        apartamentosDisponiveis,
        apartamentosPerc,
        leitosBloqueados
    };
}

// =================== FUNÇÃO PARA CALCULAR KPIs H4 (SANTA CLARA) - LINHA 3 ===================
function calcularKPIsH4(hospitalId) {
    if (hospitalId !== 'H4') return null;
    
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return null;
    
    const leitos = hospital.leitos;
    
    // Enfermarias: leitos 10-13 (4 leitos) - LIMITE MÁXIMO 4
    const enfermarias = leitos.filter(l => l.leito >= 10 && l.leito <= 13);
    const enfermariasTotal = enfermarias.length;
    const enfermariasOcupadas = enfermarias.filter(l => l.status === 'ocupado').length;
    const enfermariasLivres = enfermariasTotal - enfermariasOcupadas;
    const enfermariasPerc = enfermariasTotal > 0 ? 
        Math.round((enfermariasOcupadas / enfermariasTotal) * 100) : 0;
    
    return {
        enfermariasTotal,
        enfermariasOcupadas,
        enfermariasLivres,
        enfermariasPerc
    };
}

// =================== FUNÇÃO PARA RENDERIZAR SEÇÃO DO HOSPITAL ===================
function renderHospitalSection(hospitalId) {
    const nomeHospital = CONFIG.HOSPITAIS[hospitalId] || hospitalId;
    const kpis = calcularKPIsHospital(hospitalId);
    const kpisDetalhados = calcularKPIsDetalhados(hospitalId); // ⬅️ NOVO V3.2!
    const kpisH2 = calcularKPIsH2(hospitalId); // ⬅️ NOVO V3.2!
    const kpisH4 = calcularKPIsH4(hospitalId); // ⬅️ NOVO V3.2!
    
    return `
        <div class="hospital-card" style="margin-bottom: 40px; background: rgba(255, 255, 255, 0.02); border-radius: 16px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
            <!-- TÍTULO DO HOSPITAL -->
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid rgba(255, 255, 255, 0.1);">
                <h3 class="hospital-title" style="color: #60a5fa; margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    ${nomeHospital}
                </h3>
            </div>
            
            <!-- =================== LINHA 1: KPIs PRINCIPAIS (MANTIDO) =================== -->
            <div class="kpis-horizontal-container" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
                <!-- KPI OCUPAÇÃO (DESTAQUE) -->
                <div class="kpi-box-ocupacao" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 12px; padding: 20px 24px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); text-align: center;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">OCUPAÇÃO</span>
                        <span class="kpi-value-grande" style="font-size: 42px; font-weight: 800; color: white; line-height: 1; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">${kpis.ocupacao}%</span>
                        <div id="gauge-${hospitalId}" style="margin-top: 4px;"></div>
                    </div>
                </div>
                
                <!-- KPIs LINHA 1 (RESTANTE) -->
                <div class="kpis-linha-dupla" style="flex: 3; min-width: 300px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                    <!-- Total -->
                    <div class="kpi-box-inline" style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #f1f5f9; line-height: 1; margin-bottom: 6px;">${kpis.total}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total</span>
                    </div>
                    
                    <!-- Ocupados -->
                    <div class="kpi-box-inline" style="background: rgba(251, 191, 36, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(251, 191, 36, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #fbbf24; line-height: 1; margin-bottom: 6px;">${kpis.ocupados}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Ocupados</span>
                    </div>
                    
                    <!-- Vagos -->
                    <div class="kpi-box-inline" style="background: rgba(34, 197, 94, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(34, 197, 94, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #22c55e; line-height: 1; margin-bottom: 6px;">${kpis.vagos}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Vagos</span>
                    </div>
                    
                    <!-- Em Alta -->
                    <div class="kpi-box-inline" style="background: rgba(139, 92, 246, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #8b5cf6; line-height: 1; margin-bottom: 6px;">${kpis.emAlta}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Em Alta</span>
                    </div>
                </div>
            </div>
            
            <!-- =================== LINHA 2: KPIs DETALHADOS (NOVO V3.2!) =================== -->
            <div class="kpis-detalhados-container" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px;">
                <!-- Isolamento -->
                <div class="kpi-box-inline" style="background: rgba(239, 68, 68, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #ef4444; line-height: 1; margin-bottom: 6px;">${kpisDetalhados.isolamentoTotal}</span>
                    <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Isolamento</span>
                    <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">Resp: ${kpisDetalhados.isolamentoResp} | Cont: ${kpisDetalhados.isolamentoCont}</span>
                </div>
                
                <!-- Enfermarias -->
                <div class="kpi-box-inline" style="background: rgba(249, 115, 22, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(249, 115, 22, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #f97316; line-height: 1; margin-bottom: 6px;">${kpisDetalhados.enfermariasOcupadas}</span>
                    <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Enfermarias</span>
                    <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">ocupadas</span>
                </div>
                
                <!-- Apartamentos -->
                <div class="kpi-box-inline" style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(59, 130, 246, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #3b82f6; line-height: 1; margin-bottom: 6px;">${kpisDetalhados.apartamentosOcupados}</span>
                    <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Apartamentos</span>
                    <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">ocupados</span>
                </div>
                
                <!-- Diretivas -->
                <div class="kpi-box-inline" style="background: rgba(168, 85, 247, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(168, 85, 247, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #a855f7; line-height: 1; margin-bottom: 6px;">${kpisDetalhados.diretivasSim}</span>
                    <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Diretivas</span>
                    <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">beneficiários</span>
                </div>
                
                <!-- Média Idade -->
                <div class="kpi-box-inline" style="background: rgba(236, 72, 153, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(236, 72, 153, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #ec4899; line-height: 1; margin-bottom: 6px;">${kpisDetalhados.mediaIdade}</span>
                    <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Média Idade</span>
                    <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">anos</span>
                </div>
            </div>
            
            <!-- =================== LINHA 3: KPIs ESPECÍFICOS H2/H4 (NOVO V3.2!) =================== -->
            ${hospitalId === 'H2' && kpisH2 ? `
                <div class="kpis-especificos-h2" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px;">
                    <!-- Enfermarias Disponíveis -->
                    <div class="kpi-box-inline" style="background: rgba(16, 185, 129, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #10b981; line-height: 1; margin-bottom: 6px;">${kpisH2.enfermariasDisponiveis} / ${kpisH2.enfermariasTotal}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Enferm. Disp.</span>
                        <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">${kpisH2.enfermariasPerc}% ocupação</span>
                    </div>
                    
                    <!-- Apartamentos Disponíveis -->
                    <div class="kpi-box-inline" style="background: rgba(14, 165, 233, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(14, 165, 233, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #0ea5e9; line-height: 1; margin-bottom: 6px;">${kpisH2.apartamentosDisponiveis} / ${kpisH2.apartamentosTotal}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Aptos. Disp.</span>
                        <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">${kpisH2.apartamentosPerc}% ocupação</span>
                    </div>
                    
                    <!-- Leitos Bloqueados -->
                    <div class="kpi-box-inline" style="background: rgba(220, 38, 38, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(220, 38, 38, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #dc2626; line-height: 1; margin-bottom: 6px;">${kpisH2.leitosBloqueados}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Bloqueados</span>
                        <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">gên/isol.</span>
                    </div>
                    
                    <!-- Placeholders -->
                    <div style="opacity: 0;"></div>
                    <div style="opacity: 0;"></div>
                </div>
            ` : ''}
            
            ${hospitalId === 'H4' && kpisH4 ? `
                <div class="kpis-especificos-h4" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px;">
                    <!-- Enfermarias Ocupadas -->
                    <div class="kpi-box-inline" style="background: rgba(249, 115, 22, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(249, 115, 22, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #f97316; line-height: 1; margin-bottom: 6px;">${kpisH4.enfermariasOcupadas} / ${kpisH4.enfermariasTotal}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Enferm. Ocup.</span>
                        <span class="kpi-sublabel" style="display: block; font-size: 9px; color: ${kpisH4.enfermariasPerc >= 75 ? '#ef4444' : '#64748b'}; margin-top: 4px;">${kpisH4.enfermariasPerc >= 75 ? '⚠️' : ''} ${kpisH4.enfermariasPerc}%</span>
                    </div>
                    
                    <!-- Enfermarias Livres -->
                    <div class="kpi-box-inline" style="background: rgba(34, 197, 94, 0.1); border-radius: 10px; padding: 16px; text-align: center; border: 1px solid rgba(34, 197, 94, 0.3); transition: all 0.3s ease; min-height: 90px; display: flex; flex-direction: column; justify-content: center;">
                        <span class="kpi-value" style="display: block; font-size: 28px; font-weight: 700; color: #22c55e; line-height: 1; margin-bottom: 6px;">${kpisH4.enfermariasLivres}</span>
                        <span class="kpi-label" style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Enferm. Livres</span>
                        <span class="kpi-sublabel" style="display: block; font-size: 9px; color: #64748b; margin-top: 4px;">de ${kpisH4.enfermariasTotal}</span>
                    </div>
                    
                    <!-- Placeholders -->
                    <div style="opacity: 0;"></div>
                    <div style="opacity: 0;"></div>
                    <div style="opacity: 0;"></div>
                </div>
            ` : ''}
            
            <!-- =================== GRÁFICOS (MANTIDOS) =================== -->
            <div class="graficos-verticais" style="display: flex; flex-direction: column; gap: 25px; width: 100%;">
                <!-- Gráfico 1: Análise Preditiva de Altas -->
                <div class="grafico-item" style="width: 100%; background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); box-sizing: border-box;">
                    <div class="chart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <h4 style="margin: 0; color: #e2e8f0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Análise Preditiva de Altas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px; width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px; box-sizing: border-box;">
                        <canvas id="altas-${hospitalId}" style="width: 100% !important; height: 100% !important; max-height: 370px !important;"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico 2: Concessões -->
                <div class="grafico-item" style="width: 100%; background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); box-sizing: border-box;">
                    <div class="chart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <h4 style="margin: 0; color: #e2e8f0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Concessões Previstas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-controls" style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                            <button class="chart-btn ${window.graficosState[hospitalId]?.concessoes === 'bar' ? 'active' : ''}" onclick="renderConcessoesHospital('${hospitalId}', 'bar')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">BARRAS</button>
                            <button class="chart-btn ${window.graficosState[hospitalId]?.concessoes === 'scatter' ? 'active' : ''}" onclick="renderConcessoesHospital('${hospitalId}', 'scatter')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">BOLHAS</button>
                            <button class="chart-btn ${window.graficosState[hospitalId]?.concessoes === 'line' ? 'active' : ''}" onclick="renderConcessoesHospital('${hospitalId}', 'line')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">LINHA</button>
                            <button class="chart-btn ${window.graficosState[hospitalId]?.concessoes === 'area' ? 'active' : ''}" onclick="renderConcessoesHospital('${hospitalId}', 'area')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">ÁREA</button>
                        </div>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px; width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px; box-sizing: border-box;">
                        <canvas id="concessoes-${hospitalId}" style="width: 100% !important; height: 100% !important; max-height: 370px !important;"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico 3: Linhas de Cuidado -->
                <div class="grafico-item" style="width: 100%; background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); box-sizing: border-box;">
                    <div class="chart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <h4 style="margin: 0; color: #e2e8f0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Linhas de Cuidado Utilizadas em ${new Date().toLocaleDateString('pt-BR')}</h4>
                        <div class="chart-controls" style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                            <button class="chart-btn ${window.graficosState[hospitalId]?.linhas === 'bar' ? 'active' : ''}" onclick="renderLinhasHospital('${hospitalId}', 'bar')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">BARRAS</button>
                            <button class="chart-btn ${window.graficosState[hospitalId]?.linhas === 'scatter' ? 'active' : ''}" onclick="renderLinhasHospital('${hospitalId}', 'scatter')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">BOLHAS</button>
                            <button class="chart-btn ${window.graficosState[hospitalId]?.linhas === 'line' ? 'active' : ''}" onclick="renderLinhasHospital('${hospitalId}', 'line')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">LINHA</button>
                            <button class="chart-btn ${window.graficosState[hospitalId]?.linhas === 'area' ? 'active' : ''}" onclick="renderLinhasHospital('${hospitalId}', 'area')" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #e2e8f0; font-size: 11px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">ÁREA</button>
                        </div>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px; width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px; box-sizing: border-box;">
                        <canvas id="linhas-${hospitalId}" style="width: 100% !important; height: 100% !important; max-height: 370px !important;"></canvas>
                    </div>
                </div>
                
                <!-- =================== GRÁFICO 4: PIZZA REGIÃO (NOVO V3.2!) =================== -->
                <div class="grafico-item" style="width: 100%; background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); box-sizing: border-box;">
                    <div class="chart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <h4 style="margin: 0; color: #e2e8f0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Distribuição por Região</h4>
                    </div>
                    <div style="display: grid; grid-template-columns: 60% 40%; gap: 20px; align-items: center;">
                        <!-- Gráfico Pizza (Lado Esquerdo - 60%) -->
                        <div class="chart-container" style="position: relative; height: 350px; width: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 15px; box-sizing: border-box;">
                            <canvas id="pizza-regiao-${hospitalId}" style="width: 100% !important; height: 100% !important;"></canvas>
                        </div>
                        
                        <!-- Legenda Lateral (Lado Direito - 40%) -->
                        <div id="legenda-regiao-${hospitalId}" style="display: flex; flex-direction: column; gap: 12px; padding: 15px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; max-height: 350px; overflow-y: auto;">
                            <!-- Será preenchido por JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =================== FUNÇÃO PARA RENDERIZAR GAUGE DO HOSPITAL ===================
function renderGaugeHospital(hospitalId) {
    const kpis = calcularKPIsHospital(hospitalId);
    const gauge = document.getElementById(`gauge-${hospitalId}`);
    
    if (!gauge) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 40;
    gauge.innerHTML = '';
    gauge.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const centerX = 40;
    const centerY = 35;
    const radius = 30;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const occupancyAngle = startAngle + (endAngle - startAngle) * (kpis.ocupacao / 100);
    
    // Fundo do gauge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
    
    // Valor do gauge
    let color = '#22c55e';
    if (kpis.ocupacao >= 80) color = '#ef4444';
    else if (kpis.ocupacao >= 60) color = '#f59e0b';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, occupancyAngle);
    ctx.stroke();
}

// =================== FUNÇÃO PARA RENDERIZAR GRÁFICO DE ALTAS ===================
function renderAltasHospital(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const leitosOcupados = hospital.leitos.filter(l => l.status === 'ocupado');
    
    // Contadores por categoria de timeline
    const hoje = leitosOcupados.filter(l => {
        const pa = l.prevAlta || '';
        return pa.toLowerCase().includes('hoje') || pa.toLowerCase().includes('ouro') || pa.toLowerCase().includes('2r') || pa.toLowerCase().includes('3r');
    }).length;
    
    const h24 = leitosOcupados.filter(l => {
        const pa = l.prevAlta || '';
        return pa === '24H' || pa === '24h' || pa === '24h Ouro' || pa === '24h 2R' || pa === '24h 3R';
    }).length;
    
    const h48 = leitosOcupados.filter(l => {
        const pa = l.prevAlta || '';
        return pa === '48H' || pa === '48h';
    }).length;
    
    const h72 = leitosOcupados.filter(l => {
        const pa = l.prevAlta || '';
        return pa === '72H' || pa === '72h';
    }).length;
    
    const h96 = leitosOcupados.filter(l => {
        const pa = l.prevAlta || '';
        return pa === '96H' || pa === '96h';
    }).length;
    
    const canvasId = `altas-${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (window.chartInstances && window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
    }
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['HOJE', '24H', '48H', '72H', '96H'],
            datasets: [
                {
                    label: 'Ouro',
                    data: [hoje, 0, 0, 0, 0],
                    backgroundColor: '#ffd700',
                    borderRadius: 6
                },
                {
                    label: '24H',
                    data: [0, h24, 0, 0, 0],
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                },
                {
                    label: '48H',
                    data: [0, 0, h48, 0, 0],
                    backgroundColor: '#10b981',
                    borderRadius: 6
                },
                {
                    label: '72H',
                    data: [0, 0, 0, h72, 0],
                    backgroundColor: '#f59e0b',
                    borderRadius: 6
                },
                {
                    label: '96H',
                    data: [0, 0, 0, 0, h96],
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' beneficiários';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: corTexto,
                        font: { size: 12 }
                    },
                    grid: {
                        color: corGrid
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        color: corTexto,
                        stepSize: 1,
                        font: { size: 11 }
                    },
                    title: {
                        display: true,
                        text: 'Beneficiários',
                        color: corTexto,
                        font: { size: 13, weight: 'bold' }
                    },
                    grid: {
                        color: corGrid
                    }
                }
            }
        }
    });
    
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[canvasId] = chart;
    
    // Criar legenda customizada
    setTimeout(() => {
        window.createCustomLegendOutside(canvasId, chart.config.data.datasets);
    }, 100);
}

// =================== FUNÇÃO PARA RENDERIZAR GRÁFICO DE CONCESSÕES ===================
function renderConcessoesHospital(hospitalId, tipo = 'bar') {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // Atualizar estado global
    if (!window.graficosState[hospitalId]) {
        window.graficosState[hospitalId] = { concessoes: tipo, linhas: 'bar' };
    } else {
        window.graficosState[hospitalId].concessoes = tipo;
    }
    
    // Atualizar botões ativos
    const container = document.querySelector(`#concessoes-${hospitalId}`).closest('.grafico-item');
    if (container) {
        container.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = Array.from(container.querySelectorAll('.chart-btn')).find(btn => {
            const btnText = btn.textContent.trim().toLowerCase();
            if (tipo === 'bar' && btnText === 'barras') return true;
            if (tipo === 'scatter' && btnText === 'bolhas') return true;
            if (tipo === 'line' && btnText === 'linha') return true;
            if (tipo === 'area' && btnText === 'área') return true;
            return false;
        });
        
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    const leitosOcupados = hospital.leitos.filter(l => l.status === 'ocupado');
    
    // Contar concessões
    const concessoesCount = {};
    
    leitosOcupados.forEach(leito => {
        if (Array.isArray(leito.concessoes)) {
            leito.concessoes.forEach(concessao => {
                if (!concessao || typeof concessao !== 'string') return;
                const nome = concessao.trim();
                if (!nome) return;
                concessoesCount[nome] = (concessoesCount[nome] || 0) + 1;
            });
        }
    });
    
    // Filtrar concessões com valores > 0 e ordenar
    const concessoesOrdenadas = Object.entries(concessoesCount)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
    
    if (concessoesOrdenadas.length === 0) {
        console.log(`Nenhuma concessão encontrada para ${hospitalId}`);
        return;
    }
    
    const labels = concessoesOrdenadas.map(([nome, _]) => nome);
    const valores = concessoesOrdenadas.map(([_, count]) => count);
    
    // Cores exatas do api.js
    const cores = labels.map(nome => getCorExata(nome, 'concessao'));
    
    const canvasId = `concessoes-${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (window.chartInstances && window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
    }
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {};
    
    if (tipo === 'scatter') {
        // Scatter com jitter
        const scatterData = labels.map((label, idx) => ({
            x: idx + getJitter(label, idx),
            y: valores[idx]
        }));
        
        chartConfig = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Concessões',
                    data: scatterData,
                    backgroundColor: cores.map(c => c + 'CC'),
                    borderColor: cores,
                    borderWidth: 2,
                    pointRadius: isMobile() ? 8 : 10,
                    pointHoverRadius: isMobile() ? 10 : 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const idx = Math.round(context[0].parsed.x);
                                return labels[idx];
                            },
                            label: function(context) {
                                return 'Qtd: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: -0.5,
                        max: labels.length - 0.5,
                        ticks: {
                            callback: function(value) {
                                const idx = Math.round(value);
                                return labels[idx] || '';
                            },
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    } else if (tipo === 'line') {
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Concessões',
                    data: valores,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    } else if (tipo === 'area') {
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Concessões',
                    data: valores,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    } else {
        // Bar (padrão)
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Concessões',
                    data: valores,
                    backgroundColor: cores.map(c => c + 'CC'),
                    borderColor: cores,
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    }
    
    const chart = new Chart(ctx, chartConfig);
    
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[canvasId] = chart;
    
    // Criar legenda customizada apenas para bar e scatter
    if (tipo === 'bar' || tipo === 'scatter') {
        setTimeout(() => {
            const datasets = labels.map((label, idx) => ({
                label: label,
                backgroundColor: cores[idx],
                borderColor: cores[idx]
            }));
            window.createCustomLegendOutside(canvasId, datasets);
        }, 100);
    }
}

// =================== FUNÇÃO PARA RENDERIZAR GRÁFICO DE LINHAS DE CUIDADO ===================
function renderLinhasHospital(hospitalId, tipo = 'bar') {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    // Atualizar estado global
    if (!window.graficosState[hospitalId]) {
        window.graficosState[hospitalId] = { concessoes: 'bar', linhas: tipo };
    } else {
        window.graficosState[hospitalId].linhas = tipo;
    }
    
    // Atualizar botões ativos
    const container = document.querySelector(`#linhas-${hospitalId}`).closest('.grafico-item');
    if (container) {
        container.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = Array.from(container.querySelectorAll('.chart-btn')).find(btn => {
            const btnText = btn.textContent.trim().toLowerCase();
            if (tipo === 'bar' && btnText === 'barras') return true;
            if (tipo === 'scatter' && btnText === 'bolhas') return true;
            if (tipo === 'line' && btnText === 'linha') return true;
            if (tipo === 'area' && btnText === 'área') return true;
            return false;
        });
        
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    const leitosOcupados = hospital.leitos.filter(l => l.status === 'ocupado');
    
    // Contar linhas
    const linhasCount = {};
    
    leitosOcupados.forEach(leito => {
        if (Array.isArray(leito.linhas)) {
            leito.linhas.forEach(linha => {
                if (!linha || typeof linha !== 'string') return;
                const nome = linha.trim();
                if (!nome) return;
                linhasCount[nome] = (linhasCount[nome] || 0) + 1;
            });
        }
    });
    
    // Filtrar linhas com valores > 0 e ordenar
    const linhasOrdenadas = Object.entries(linhasCount)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
    
    if (linhasOrdenadas.length === 0) {
        console.log(`Nenhuma linha de cuidado encontrada para ${hospitalId}`);
        return;
    }
    
    const labels = linhasOrdenadas.map(([nome, _]) => nome);
    const valores = linhasOrdenadas.map(([_, count]) => count);
    
    // Cores exatas do api.js
    const cores = labels.map(nome => getCorExata(nome, 'linha'));
    
    const canvasId = `linhas-${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (window.chartInstances && window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
    }
    
    const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
    const corGrid = window.fundoBranco ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {};
    
    if (tipo === 'scatter') {
        // Scatter com jitter
        const scatterData = labels.map((label, idx) => ({
            x: idx + getJitter(label, idx),
            y: valores[idx]
        }));
        
        chartConfig = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Linhas',
                    data: scatterData,
                    backgroundColor: cores.map(c => c + 'CC'),
                    borderColor: cores,
                    borderWidth: 2,
                    pointRadius: isMobile() ? 8 : 10,
                    pointHoverRadius: isMobile() ? 10 : 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const idx = Math.round(context[0].parsed.x);
                                return labels[idx];
                            },
                            label: function(context) {
                                return 'Qtd: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: -0.5,
                        max: labels.length - 0.5,
                        ticks: {
                            callback: function(value) {
                                const idx = Math.round(value);
                                return labels[idx] || '';
                            },
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    } else if (tipo === 'line') {
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Linhas',
                    data: valores,
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    } else if (tipo === 'area') {
        chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Linhas',
                    data: valores,
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.3)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    } else {
        // Bar (padrão)
        chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Linhas',
                    data: valores,
                    backgroundColor: cores.map(c => c + 'CC'),
                    borderColor: cores,
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            color: corTexto,
                            font: { size: isMobile() ? 9 : 11 }
                        },
                        grid: { color: corGrid }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: corTexto,
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Qtd.',
                            color: corTexto,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: corGrid }
                    }
                }
            }
        };
    }
    
    const chart = new Chart(ctx, chartConfig);
    
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[canvasId] = chart;
    
    // Criar legenda customizada apenas para bar e scatter
    if (tipo === 'bar' || tipo === 'scatter') {
        setTimeout(() => {
            const datasets = labels.map((label, idx) => ({
                label: label,
                backgroundColor: cores[idx],
                borderColor: cores[idx]
            }));
            window.createCustomLegendOutside(canvasId, datasets);
        }, 100);
    }
}

// =================== FUNÇÃO PARA RENDERIZAR PIZZA REGIÃO (NOVO V3.2!) ===================
function renderPizzaRegiao(hospitalId) {
    const hospital = window.hospitalData[hospitalId];
    if (!hospital || !hospital.leitos) return;
    
    const leitosOcupados = hospital.leitos.filter(l => l.status === 'ocupado');
    
    // Contar pacientes por região
    const regioesCount = {};
    
    leitosOcupados.forEach(leito => {
        const regiao = leito.regiao || 'Não informado';
        regioesCount[regiao] = (regioesCount[regiao] || 0) + 1;
    });
    
    // Ordenar regiões por quantidade
    const regioesOrdenadas = Object.entries(regioesCount)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
    
    if (regioesOrdenadas.length === 0) {
        console.log(`Nenhuma região encontrada para ${hospitalId}`);
        return;
    }
    
    const labels = regioesOrdenadas.map(([nome, _]) => nome);
    const valores = regioesOrdenadas.map(([_, count]) => count);
    const total = valores.reduce((a, b) => a + b, 0);
    
    // Cores vibrantes para o gráfico de pizza
    const coresPizza = [
        '#3b82f6', // Azul
        '#10b981', // Verde
        '#f59e0b', // Amarelo
        '#ef4444', // Vermelho
        '#a855f7', // Roxo
        '#ec4899', // Rosa
        '#14b8a6', // Teal
        '#f97316', // Laranja
        '#8b5cf6'  // Violeta
    ];
    
    const cores = labels.map((_, idx) => coresPizza[idx % coresPizza.length]);
    
    // Renderizar gráfico de pizza
    const canvasId = `pizza-regiao-${hospitalId}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    if (window.chartInstances && window.chartInstances[canvasId]) {
        window.chartInstances[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false // Legenda desabilitada - vamos criar custom
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed;
                            const percentual = ((valor / total) * 100).toFixed(1);
                            return `${context.label}: ${valor} (${percentual}%)`;
                        }
                    }
                }
            }
        }
    });
    
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances[canvasId] = chart;
    
    // Criar legenda lateral customizada
    const legendaContainer = document.getElementById(`legenda-regiao-${hospitalId}`);
    if (legendaContainer) {
        const corTexto = window.fundoBranco ? '#000000' : '#ffffff';
        
        legendaContainer.innerHTML = `
            <div style="font-size: 14px; font-weight: 700; color: ${corTexto}; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                Legenda:
            </div>
        `;
        
        labels.forEach((label, idx) => {
            const valor = valores[idx];
            const percentual = ((valor / total) * 100).toFixed(1);
            const cor = cores[idx];
            
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                border-left: 4px solid ${cor};
                transition: all 0.2s ease;
                cursor: pointer;
            `;
            
            item.innerHTML = `
                <div style="width: 16px; height: 16px; background: ${cor}; border-radius: 50%; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                    <div style="color: ${corTexto}; font-size: 13px; font-weight: 600;">${label}</div>
                    <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">${valor} beneficiários (${percentual}%)</div>
                </div>
            `;
            
            // Hover effect
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(255, 255, 255, 0.1)';
                item.style.transform = 'translateX(4px)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(255, 255, 255, 0.05)';
                item.style.transform = 'translateX(0)';
            });
            
            legendaContainer.appendChild(item);
        });
    }
}

// =================== CSS CONSOLIDADO DO DASHBOARD ===================
function getHospitalConsolidadoCSS() {
    return `
        <style>
            /* =================== ESTILOS GLOBAIS =================== */
            .hospitais-container {
                display: flex;
                flex-direction: column;
                gap: 30px;
                width: 100%;
            }
            
            .hospital-card {
                width: 100%;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 16px;
                padding: 30px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .hospital-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
            }
            
            .hospital-title {
                color: #60a5fa;
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            /* =================== KPIs HORIZONTAIS =================== */
            .kpis-horizontal-container {
                display: flex;
                gap: 16px;
                margin-bottom: 24px;
                flex-wrap: wrap;
            }
            
            .kpi-box-ocupacao {
                flex: 1;
                min-width: 150px;
                background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
                border-radius: 12px;
                padding: 20px 24px;
                box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
                transition: transform 0.3s ease;
            }
            
            .kpi-box-ocupacao:hover {
                transform: translateY(-4px);
                box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
            }
            
            .kpi-value-grande {
                font-size: 42px;
                font-weight: 800;
                color: white;
                line-height: 1;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .kpis-linha-dupla {
                flex: 3;
                min-width: 300px;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }
            
            /* =================== KPIs DETALHADOS (LINHA 2 - NOVO V3.2!) =================== */
            .kpis-detalhados-container {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 16px;
                margin-bottom: 24px;
            }
            
            /* =================== KPIs ESPECÍFICOS H2/H4 (LINHA 3 - NOVO V3.2!) =================== */
            .kpis-especificos-h2,
            .kpis-especificos-h4 {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .kpi-box-inline {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 16px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
                min-height: 90px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .kpi-box-inline:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .kpi-gauge-box {
                position: relative;
            }
            
            .kpi-gauge-box canvas {
                margin-bottom: 8px;
                max-width: 80px;
                max-height: 40px;
            }
            
            .kpi-value {
                display: block;
                font-size: 28px;
                font-weight: 700;
                color: white;
                line-height: 1;
                margin-bottom: 6px;
            }
            
            .kpi-label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            
            .kpi-sublabel {
                display: block;
                font-size: 9px;
                color: #64748b;
                margin-top: 4px;
            }
            
            .graficos-verticais {
                display: flex;
                flex-direction: column;
                gap: 25px;
                width: 100%;
            }
            
            .grafico-item {
                width: 100%;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-sizing: border-box;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .chart-header h4 {
                margin: 0;
                color: #e2e8f0;
                font-size: 16px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .chart-controls {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                align-items: center;
            }
            
            .chart-btn {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #e2e8f0;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 500;
            }
            
            .chart-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #60a5fa;
            }
            
            .chart-btn.active {
                background: #60a5fa;
                border-color: #60a5fa;
                color: white;
                box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
            }
            
            .chart-container {
                position: relative;
                height: 400px;
                width: 100%;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 15px;
                box-sizing: border-box;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-height: 370px !important;
            }
            
            /* =================== TABLET STYLES (768px - 1024px) =================== */
            @media (max-width: 1024px) and (min-width: 769px) {
                .hospitais-container {
                    gap: 25px;
                }
                
                .hospital-card {
                    padding: 20px;
                }
                
                .kpis-horizontal-container {
                    gap: 12px;
                }
                
                .kpi-box-inline {
                    padding: 15px 10px;
                    min-height: 85px;
                }
                
                .kpis-detalhados-container {
                    grid-template-columns: repeat(5, 1fr);
                    gap: 12px;
                }
                
                .chart-container {
                    height: 350px;
                    padding: 12px;
                }
            }
            
            /* =================== MOBILE STYLES (≤768px) =================== */
            @media (max-width: 768px) {
                /* Header dashboard responsivo */
                .dashboard-header {
                    padding: 15px !important;
                    margin-bottom: 20px !important;
                }
                
                .dashboard-header h2 {
                    font-size: 18px !important;
                }
                
                /* Container hospitais */
                .hospitais-container {
                    gap: 20px;
                    padding: 5px;
                }
                
                .hospital-card {
                    padding: 12px;
                    margin: 0 4px;
                }
                
                .hospital-title {
                    font-size: 16px !important;
                    margin-bottom: 15px !important;
                }
                
                /* KPIs Horizontais responsivos */
                .kpis-horizontal-container {
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                
                .kpi-box-ocupacao {
                    min-width: 100%;
                    padding: 16px 20px;
                }
                
                .kpi-value-grande {
                    font-size: 36px;
                }
                
                /* KPIs Linha Dupla (2 colunas) */
                .kpis-linha-dupla {
                    min-width: 100%;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
                .kpis-linha-dupla .kpi-box-inline {
                    padding: 12px 10px;
                    min-height: 70px;
                }
                
                .kpis-linha-dupla .kpi-value {
                    font-size: 22px;
                }
                
                .kpis-linha-dupla .kpi-label {
                    font-size: 10px;
                }
                
                /* KPIs Detalhados (Linha 2) - 2 colunas */
                .kpis-detalhados-container {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 16px;
                }
                
                .kpis-detalhados-container .kpi-box-inline {
                    padding: 12px 10px;
                    min-height: 70px;
                }
                
                .kpis-detalhados-container .kpi-value {
                    font-size: 22px;
                }
                
                .kpis-detalhados-container .kpi-label {
                    font-size: 10px;
                }
                
                .kpis-detalhados-container .kpi-sublabel {
                    font-size: 8px;
                }
                
                /* KPIs Específicos H2/H4 (Linha 3) - 2 colunas */
                .kpis-especificos-h2,
                .kpis-especificos-h4 {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 16px;
                }
                
                .kpis-especificos-h2 .kpi-box-inline,
                .kpis-especificos-h4 .kpi-box-inline {
                    padding: 12px 10px;
                    min-height: 70px;
                }
                
                /* Gráficos */
                .grafico-item {
                    padding: 12px;
                    margin-bottom: 15px;
                }
                
                .chart-header {
                    margin-bottom: 10px;
                    gap: 8px;
                }
                
                .chart-header h4 {
                    font-size: 12px;
                }
                
                .chart-controls {
                    gap: 4px;
                }
                
                .chart-btn {
                    padding: 4px 8px;
                    font-size: 9px;
                }
                
                .chart-container {
                    height: 250px;
                    padding: 8px;
                }
                
                .chart-container canvas {
                    max-height: 234px !important;
                }
                
                /* Pizza Região - Empilhar verticalmente */
                .grafico-item > div {
                    grid-template-columns: 1fr !important;
                    gap: 15px !important;
                }
                
                /* Botão toggle menor */
                .toggle-fundo-btn {
                    padding: 4px 8px !important;
                    font-size: 11px !important;
                    gap: 4px !important;
                }
            }
            
            /* =================== MOBILE PEQUENO (≤480px) =================== */
            @media (max-width: 480px) {
                .hospital-card {
                    padding: 8px !important;
                    margin: 0 2px !important;
                }
                
                .kpi-box-ocupacao {
                    min-width: 120px;
                    padding: 12px 16px;
                }
                
                .kpi-value-grande {
                    font-size: 28px;
                }
                
                .kpis-linha-dupla {
                    gap: 4px;
                    grid-template-columns: 1fr 1fr;
                }
                
                .kpis-linha-dupla .kpi-box-inline {
                    padding: 8px 6px;
                    min-height: 60px;
                }
                
                .kpis-linha-dupla .kpi-value {
                    font-size: 18px;
                }
                
                .kpis-linha-dupla .kpi-label {
                    font-size: 9px;
                }
                
                .chart-container {
                    padding: 3px !important;
                    height: 220px !important;
                }
                
                .chart-header h4 {
                    font-size: 10px !important;
                }
                
                .chart-btn {
                    padding: 2px 4px !important;
                    font-size: 7px !important;
                }
            }
            
            /* =================== LANDSCAPE MOBILE =================== */
            @media (max-width: 768px) and (orientation: landscape) {
                .hospital-card {
                    padding: 8px !important;
                }
                
                .kpis-container-mobile {
                    gap: 6px;
                }
                
                .kpis-linha-dupla {
                    grid-template-columns: 1fr 1fr;
                }
                
                .chart-container {
                    height: 200px !important;
                }
            }
        </style>
    `;
}

// =================== EXPORTAÇÃO DE FUNÇÕES GLOBAIS ===================
window.calcularKPIsHospital = calcularKPIsHospital;
window.calcularKPIsDetalhados = calcularKPIsDetalhados; // ⬅️ NOVO V3.2!
window.calcularKPIsH2 = calcularKPIsH2; // ⬅️ NOVO V3.2!
window.calcularKPIsH4 = calcularKPIsH4; // ⬅️ NOVO V3.2!
window.renderGaugeHospital = renderGaugeHospital;
window.renderAltasHospital = renderAltasHospital;
window.renderConcessoesHospital = renderConcessoesHospital;
window.renderLinhasHospital = renderLinhasHospital;
window.renderPizzaRegiao = renderPizzaRegiao; // ⬅️ NOVO V3.2!

// Funções de log
function logInfo(message) {
    console.log(`🔵 [DASHBOARD HOSPITALAR V3.2] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD HOSPITALAR V3.2] ${message}`);
}

function logError(message, error) {
    console.error(`❌ [DASHBOARD HOSPITALAR V3.2] ${message}`, error || '');
}

console.log('🎯 Dashboard Hospitalar V3.2 - VERSÃO COMPLETA CARREGADA!');
console.log('✅ NOVIDADES V3.2:');
console.log('   • ✅ Linha 2 KPIs: Isolamento, Enfermarias, Apartamentos, Diretivas, Média Idade');
console.log('   • ✅ Gráfico Pizza: Distribuição por Região (pizza 60% + legenda 40%)');
console.log('   • ✅ Linha 3 KPIs H2: Enferm.Disp, Aptos.Disp, Bloqueados');
console.log('   • ✅ Linha 3 KPIs H4: Enferm.Ocup, Enferm.Livres');
console.log('   • ✅ Layout responsivo (mobile + tablet)');
console.log('   • ✅ Compatibilidade com API V3.3 (74 colunas)');
console.log('🚀 READY: Dashboard V3.2 100% funcional com todas as melhorias!');
