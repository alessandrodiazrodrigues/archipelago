/**
 * DASHBOARD HOSPITALAR V3.3.2 - FINAL CORRIGIDO
 * 
 * Data: 20/Outubro/2025
 * Cliente: Guilherme Santoro
 * Desenvolvedor: Alessandro Rodrigues
 * 
 * CORREÇÕES APLICADAS:
 * ✅ Gauge meia-rosca com PERCENTUAL DENTRO
 * ✅ KPIs carregam dados REAIS (não hardcoded)
 * ✅ Barras SEMPRE VERTICAIS (Concessões e Linhas)
 * ✅ Números SEMPRE VISÍVEIS nos pizzas
 * ✅ Todos os 5 hospitais carregam
 */

(function() {
    'use strict';
    
    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Inicializando...');
    
    // ==================== CORES E TEMAS ====================
    
    let temaAtual = 'escuro';
    
    const CORES_TEMA = {
        escuro: {
            fundo: '#1a1a2e',
            texto: '#ffffff',
            textoSecundario: '#b0b0b0',
            card: '#16213e',
            borda: '#0f3460',
            graficoBg: 'rgba(255, 255, 255, 0.05)'
        },
        claro: {
            fundo: '#f5f5f5',
            texto: '#333333',
            textoSecundario: '#666666',
            card: '#ffffff',
            borda: '#e0e0e0',
            graficoBg: 'rgba(0, 0, 0, 0.02)'
        }
    };
    
    function getCorTema(propriedade) {
        return CORES_TEMA[temaAtual][propriedade];
    }
    
    // ==================== BOTÃO TEMA ====================
    
    function criarBotaoTema() {
        // Remove botão existente se houver
        const btnExistente = document.getElementById('btn-tema-dashboard');
        if (btnExistente) {
            btnExistente.remove();
        }
        
        const btn = document.createElement('button');
        btn.id = 'btn-tema-dashboard';
        btn.className = 'btn-tema-dashboard';
        btn.textContent = temaAtual === 'escuro' ? '☀️ Tema Claro' : '🌙 Tema Escuro';
        btn.style.cssText = `
            padding: 8px 16px;
            border: 2px solid ${getCorTema('borda')};
            background: ${getCorTema('card')};
            color: ${getCorTema('texto')};
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-left: 10px;
        `;
        
        btn.addEventListener('click', alternarTema);
        
        // Tenta inserir ao lado do botão Atualizar
        const header = document.querySelector('.main-header') || document.querySelector('header');
        const btnAtualizar = document.querySelector('[onclick*="loadHospitalData"]');
        
        if (btnAtualizar && btnAtualizar.parentNode) {
            btnAtualizar.parentNode.insertBefore(btn, btnAtualizar.nextSibling);
        } else if (header) {
            header.appendChild(btn);
        } else {
            // Fallback: posição fixa
            btn.style.position = 'fixed';
            btn.style.top = '20px';
            btn.style.right = '20px';
            btn.style.zIndex = '9999';
            document.body.appendChild(btn);
        }
    }
    
    function alternarTema() {
        temaAtual = temaAtual === 'escuro' ? 'claro' : 'escuro';
        
        // Atualizar botão
        const btn = document.getElementById('btn-tema-dashboard');
        if (btn) {
            btn.textContent = temaAtual === 'escuro' ? '☀️ Tema Claro' : '🌙 Tema Escuro';
            btn.style.border = `2px solid ${getCorTema('borda')}`;
            btn.style.background = getCorTema('card');
            btn.style.color = getCorTema('texto');
        }
        
        // Re-renderizar dashboard
        const hospitalSelecionado = document.getElementById('hospital-select')?.value || 'todos';
        window.renderizarDashboardHospital(hospitalSelecionado);
    }
    
    // ==================== RENDERIZAÇÃO PRINCIPAL ====================
    
    window.renderizarDashboardHospital = function(hospitalId = 'todos') {
        console.log('[DASHBOARD HOSPITALAR] Renderizando hospital:', hospitalId);
        
        const container = document.getElementById('dashHospitalarContent');
        if (!container) {
            console.error('[DASHBOARD HOSPITALAR] Container não encontrado');
            return;
        }
        
        // Criar botão tema (se não existir)
        criarBotaoTema();
        
        // Buscar dados
        const dados = window.hospitalData;
        if (!dados) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: ${getCorTema('textoSecundario')};">
                    <p style="font-size: 18px;">Carregando dados...</p>
                </div>
            `;
            return;
        }
        
        // Renderizar dropdown + conteúdo
        let html = renderDropdown(hospitalId);
        
        if (hospitalId === 'todos') {
            html += renderTodosHospitais(dados);
        } else {
            const hospital = dados[hospitalId];
            if (hospital) {
                html += renderHospitalHTML(hospitalId, hospital);
            }
        }
        
        container.innerHTML = html;
        
        // Renderizar gráficos após DOM atualizar
        setTimeout(() => {
            if (hospitalId === 'todos') {
                renderGraficosHospitais(dados);
            } else {
                const hospital = dados[hospitalId];
                if (hospital) {
                    renderGraficosHospital(hospitalId, hospital);
                }
            }
        }, 100);
    };
    
    // ==================== DROPDOWN ====================
    
    function renderDropdown(hospitalSelecionado) {
        const hospitais = window.HOSPITAIS || {
            H1: { nome: 'Neomater' },
            H2: { nome: 'Cruz Azul' },
            H3: { nome: 'Santa Marcelina' },
            H4: { nome: 'Santa Clara' },
            H5: { nome: 'Hospital Adventista' }
        };
        
        let options = '<option value="todos">Todos os Hospitais</option>';
        Object.keys(hospitais).forEach(id => {
            const selected = id === hospitalSelecionado ? 'selected' : '';
            options += `<option value="${id}" ${selected}>${hospitais[id].nome}</option>`;
        });
        
        return `
            <div style="margin-bottom: 30px; padding: 20px; background: ${getCorTema('card')}; border-radius: 12px; border: 2px solid ${getCorTema('borda')};">
                <label for="hospital-select" style="display: block; margin-bottom: 10px; font-size: 16px; font-weight: 600; color: ${getCorTema('texto')};">
                    Selecione o Hospital:
                </label>
                <select 
                    id="hospital-select" 
                    onchange="window.renderizarDashboardHospital(this.value)"
                    style="width: 100%; max-width: 400px; padding: 12px; font-size: 16px; border: 2px solid ${getCorTema('borda')}; border-radius: 8px; background: ${getCorTema('fundo')}; color: ${getCorTema('texto')}; cursor: pointer;"
                >
                    ${options}
                </select>
            </div>
        `;
    }
    
    // ==================== RENDER TODOS OS HOSPITAIS ====================
    
    function renderTodosHospitais(dados) {
        console.log('[DASHBOARD HOSPITALAR] Renderizando todos os hospitais');
        
        const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5'];
        let html = '';
        
        hospitais.forEach((hospitalId, index) => {
            try {
                const hospital = dados[hospitalId];
                if (!hospital) {
                    console.warn(`[DASHBOARD] Hospital ${hospitalId} não encontrado`);
                    return;
                }
                
                console.log(`[DASHBOARD] Processando ${hospitalId}:`, hospital);
                
                html += `
                    <div class="hospital-section" id="hospital-${hospitalId}">
                        ${renderHospitalHTML(hospitalId, hospital)}
                    </div>
                    ${index < hospitais.length - 1 ? '<hr style="border: 1px solid ' + getCorTema('borda') + '; margin: 40px 0;">' : ''}
                `;
            } catch (error) {
                console.error(`[DASHBOARD] Erro ao processar ${hospitalId}:`, error);
            }
        });
        
        return html;
    }
    
    function renderGraficosHospitais(dados) {
        const hospitais = ['H1', 'H2', 'H3', 'H4', 'H5'];
        
        hospitais.forEach(hospitalId => {
            try {
                const hospital = dados[hospitalId];
                if (hospital) {
                    console.log(`[DASHBOARD] Renderizando gráficos de ${hospitalId}`);
                    renderGraficosHospital(hospitalId, hospital);
                }
            } catch (error) {
                console.error(`[DASHBOARD] Erro ao renderizar gráficos de ${hospitalId}:`, error);
            }
        });
    }
    
    // ==================== RENDER HOSPITAL ====================
    
    function renderHospitalHTML(hospitalId, hospital) {
        const nomeHospital = hospital.nome || window.HOSPITAIS?.[hospitalId]?.nome || hospitalId;
        const leitos = hospital.leitos || [];
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        
        // CALCULAR KPIS REAIS
        const kpis = calcularKPIs(leitos);
        
        return `
            <div style="background: ${getCorTema('fundo')}; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                <!-- TÍTULO -->
                <h2 style="color: ${getCorTema('texto')}; margin: 0 0 30px 0; font-size: 28px; font-weight: 700; text-align: center;">
                    ${nomeHospital}
                </h2>
                
                <!-- KPIS LINHA 1 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <!-- GAUGE OCUPAÇÃO -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="position: relative; height: 120px; margin-bottom: 10px;">
                            <canvas id="gauge-${hospitalId}" style="width: 100%; height: 100%;"></canvas>
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase; letter-spacing: 1px;">
                            OCUPAÇÃO
                        </div>
                    </div>
                    
                    <!-- TOTAL -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 8px;">
                            ${kpis.total}
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase; letter-spacing: 1px;">
                            TOTAL
                        </div>
                    </div>
                    
                    <!-- OCUPADOS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">
                            ${kpis.ocupados}
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase; letter-spacing: 1px;">
                            OCUPADOS
                        </div>
                    </div>
                    
                    <!-- VAGOS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: #10b981; margin-bottom: 8px;">
                            ${kpis.vagos}
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase; letter-spacing: 1px;">
                            VAGOS
                        </div>
                    </div>
                    
                    <!-- EM ALTA -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: #3b82f6; margin-bottom: 8px;">
                            ${kpis.emAlta}
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase; letter-spacing: 1px;">
                            EM ALTA
                        </div>
                    </div>
                </div>
                
                <!-- KPIS LINHA 2 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <!-- APARTAMENTOS OCUPADOS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 5px;">
                            ${kpis.aptosOcupados}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase;">
                            APTOS OCUPADOS
                        </div>
                    </div>
                    
                    <!-- ENFERMARIAS OCUPADAS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 5px;">
                            ${kpis.enfsOcupadas}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase;">
                            ENFS OCUPADAS
                        </div>
                    </div>
                    
                    <!-- ENFERMARIAS DISPONÍVEIS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 5px;">
                            ${kpis.enfsDisponiveis}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase;">
                            ENFS DISPONÍVEIS
                        </div>
                    </div>
                    
                    <!-- ISOLAMENTOS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 20px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 5px;">
                            ${kpis.isolamentoResp} Resp | ${kpis.isolamentoContato} Cont
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase;">
                            ISOLAMENTOS
                        </div>
                    </div>
                    
                    <!-- COM DIRETIVAS -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 5px;">
                            ${kpis.comDiretivas}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase;">
                            COM DIRETIVAS
                        </div>
                    </div>
                    
                    <!-- IDADE MÉDIA -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 700; color: ${getCorTema('texto')}; margin-bottom: 5px;">
                            ${kpis.idadeMedia}
                        </div>
                        <div style="font-size: 11px; font-weight: 600; color: ${getCorTema('textoSecundario')}; text-transform: uppercase;">
                            IDADE MÉDIA (ANOS)
                        </div>
                    </div>
                </div>
                
                <!-- GRÁFICOS -->
                <div style="display: grid; grid-template-columns: 1fr; gap: 30px;">
                    <!-- GRÁFICO 1: ANÁLISE PREDITIVA -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 25px;">
                        <h4 style="color: ${getCorTema('texto')}; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                            Análise Preditiva de Altas em ${dataAtual}
                        </h4>
                        <div style="position: relative; height: 300px;">
                            <canvas id="chart-altas-${hospitalId}"></canvas>
                        </div>
                    </div>
                    
                    <!-- GRÁFICO 2: CONCESSÕES (VERTICAL) -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 25px;">
                        <h4 style="color: ${getCorTema('texto')}; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                            Concessões Previstas em ${dataAtual}
                        </h4>
                        <div style="position: relative; height: 400px;">
                            <canvas id="chart-concessoes-${hospitalId}"></canvas>
                        </div>
                    </div>
                    
                    <!-- GRÁFICO 3: LINHAS DE CUIDADO (VERTICAL) -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 25px;">
                        <h4 style="color: ${getCorTema('texto')}; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                            Linhas de Cuidado em ${dataAtual}
                        </h4>
                        <div style="position: relative; height: 500px;">
                            <canvas id="chart-linhas-${hospitalId}"></canvas>
                        </div>
                    </div>
                    
                    <!-- GRÁFICO 4: REGIÃO -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 25px;">
                        <h4 style="color: ${getCorTema('texto')}; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                            Beneficiários por Região em ${dataAtual}
                        </h4>
                        <div style="position: relative; height: 350px;">
                            <canvas id="chart-regiao-${hospitalId}"></canvas>
                        </div>
                    </div>
                    
                    <!-- GRÁFICO 5: TIPO OCUPAÇÃO -->
                    <div style="background: ${getCorTema('card')}; border: 2px solid ${getCorTema('borda')}; border-radius: 12px; padding: 25px;">
                        <h4 style="color: ${getCorTema('texto')}; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                            Tipo de Ocupação em ${dataAtual}
                        </h4>
                        <div style="position: relative; height: 300px;">
                            <canvas id="chart-tipo-${hospitalId}"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== CALCULAR KPIS ====================
    
    function calcularKPIs(leitos) {
        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado').length;
        const vagos = leitos.filter(l => l.status === 'vago').length;
        const percentualOcupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;
        
        // EM ALTA
        const emAlta = leitos.filter(l => {
            if (l.status !== 'ocupado') return false;
            const prev = (l.prevAlta || '').toLowerCase();
            return prev.includes('hoje') || prev === '24h';
        }).length;
        
        // APARTAMENTOS OCUPADOS
        const aptosOcupados = leitos.filter(l => {
            if (l.status !== 'ocupado') return false;
            const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
            return cat.includes('apto') || cat.includes('apartamento');
        }).length;
        
        // ENFERMARIAS OCUPADAS
        const enfsOcupadas = leitos.filter(l => {
            if (l.status !== 'ocupado') return false;
            const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
            return cat.includes('enf') || cat.includes('enfermaria');
        }).length;
        
        // ENFERMARIAS DISPONÍVEIS
        const totalEnfs = leitos.filter(l => {
            const cat = (l.categoriaEscolhida || l.categoria || l.tipo || '').toLowerCase();
            return cat.includes('enf') || cat.includes('enfermaria');
        }).length;
        
        const enfsDisponiveis = totalEnfs > 0 ? (totalEnfs - enfsOcupadas) : 'N/A';
        
        // ISOLAMENTOS (SEPARADOS)
        const isolamentoResp = leitos.filter(l => 
            (l.isolamento || '').includes('Respirat')
        ).length;
        
        const isolamentoContato = leitos.filter(l => 
            (l.isolamento || '').includes('Contato')
        ).length;
        
        // COM DIRETIVAS
        const comDiretivas = leitos.filter(l => 
            (l.diretivas || '') === 'Sim'
        ).length;
        
        // IDADE MÉDIA
        const idades = leitos
            .filter(l => l.status === 'ocupado' && l.idade)
            .map(l => parseInt(l.idade));
        
        const idadeMedia = idades.length > 0
            ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length)
            : 0;
        
        return {
            total,
            ocupados,
            vagos,
            percentualOcupacao,
            emAlta,
            aptosOcupados,
            enfsOcupadas,
            enfsDisponiveis,
            isolamentoResp,
            isolamentoContato,
            comDiretivas,
            idadeMedia
        };
    }
    
    // ==================== RENDER GRÁFICOS ====================
    
    function renderGraficosHospital(hospitalId, hospital) {
        const leitos = hospital.leitos || [];
        const kpis = calcularKPIs(leitos);
        
        // Gráfico 1: Gauge
        criarGaugeOcupacao(hospitalId, kpis.percentualOcupacao);
        
        // Gráfico 2: Altas
        criarGraficoAltas(hospitalId, leitos);
        
        // Gráfico 3: Concessões (VERTICAL)
        criarGraficoConcessoes(hospitalId, leitos);
        
        // Gráfico 4: Linhas (VERTICAL)
        criarGraficoLinhas(hospitalId, leitos);
        
        // Gráfico 5: Região
        criarGraficoRegiao(hospitalId, leitos);
        
        // Gráfico 6: Tipo Ocupação
        criarGraficoTipoOcupacao(hospitalId, leitos);
    }
    
    // ==================== GAUGE OCUPAÇÃO (MEIA-ROSCA COM % DENTRO) ====================
    
    function criarGaugeOcupacao(hospitalId, percentual) {
        const canvas = document.getElementById(`gauge-${hospitalId}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (window[`chart_gauge_${hospitalId}`]) {
            window[`chart_gauge_${hospitalId}`].destroy();
        }
        
        // Cores baseadas no percentual
        let corPreenchimento;
        if (percentual >= 80) {
            corPreenchimento = '#ef4444'; // Vermelho
        } else if (percentual >= 60) {
            corPreenchimento = '#f59e0b'; // Amarelo
        } else {
            corPreenchimento = '#10b981'; // Verde
        }
        
        const corFundo = temaAtual === 'escuro' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        // Plugin para texto central
        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
                const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2 + 20;
                
                ctx.save();
                ctx.font = 'bold 32px Arial';
                ctx.fillStyle = getCorTema('texto');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${percentual}%`, centerX, centerY);
                ctx.restore();
            }
        };
        
        const config = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentual, 100 - percentual],
                    backgroundColor: [corPreenchimento, corFundo],
                    borderWidth: 0
                }]
            },
            options: {
                rotation: -90,        // ← MEIA ROSCA
                circumference: 180,   // ← MEIA ROSCA
                cutout: '75%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            },
            plugins: [centerTextPlugin]
        };
        
        window[`chart_gauge_${hospitalId}`] = new Chart(ctx, config);
    }
    
    // ==================== GRÁFICO ALTAS ====================
    
    function criarGraficoAltas(hospitalId, leitos) {
        const canvas = document.getElementById(`chart-altas-${hospitalId}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (window[`chart_altas_${hospitalId}`]) {
            window[`chart_altas_${hospitalId}`].destroy();
        }
        
        // Contar altas
        const categorias = ['Hoje Ouro', 'Hoje Prata', 'Hoje Bronze', '24H', '48H', '72H', '96H', 'SP'];
        const valores = categorias.map(cat => {
            return leitos.filter(l => {
                const prev = l.prevAlta || '';
                return prev === cat || prev.toLowerCase() === cat.toLowerCase();
            }).length;
        });
        
        const cores = [
            '#FFD700', '#C0C0C0', '#CD7F32', 
            '#3b82f6', '#8b5cf6', '#ec4899', 
            '#f59e0b', '#10b981'
        ];
        
        const config = {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: [{
                    label: 'Pacientes',
                    data: valores,
                    backgroundColor: cores,
                    borderColor: getCorTema('borda'),
                    borderWidth: 2,
                    maxBarThickness: 80
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    }
                },
                scales: {
                    x: {
                        ticks: { color: getCorTema('texto') },
                        grid: { color: getCorTema('borda') }
                    },
                    y: {
                        ticks: { color: getCorTema('texto'), stepSize: 1 },
                        grid: { color: getCorTema('borda') }
                    }
                }
            }
        };
        
        window[`chart_altas_${hospitalId}`] = new Chart(ctx, config);
    }
    
    // ==================== GRÁFICO CONCESSÕES (VERTICAL) ====================
    
    function criarGraficoConcessoes(hospitalId, leitos) {
        const canvas = document.getElementById(`chart-concessoes-${hospitalId}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (window[`chart_concessoes_${hospitalId}`]) {
            window[`chart_concessoes_${hospitalId}`].destroy();
        }
        
        // Contar concessões
        const concessoesMap = {};
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.concessoes) {
                leito.concessoes.forEach(c => {
                    concessoesMap[c] = (concessoesMap[c] || 0) + 1;
                });
            }
        });
        
        const labels = Object.keys(concessoesMap);
        const valores = Object.values(concessoesMap);
        
        // Buscar cores
        const cores = labels.map(label => {
            return window.CORES_CONCESSOES?.[label] || '#999999';
        });
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: valores,
                    backgroundColor: cores,
                    borderColor: getCorTema('borda'),
                    borderWidth: 2,
                    maxBarThickness: 80
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',  // ← VERTICAL
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: getCorTema('texto'),
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { color: getCorTema('borda') }
                    },
                    y: {
                        ticks: { color: getCorTema('texto'), stepSize: 1 },
                        grid: { color: getCorTema('borda') }
                    }
                }
            }
        };
        
        window[`chart_concessoes_${hospitalId}`] = new Chart(ctx, config);
    }
    
    // ==================== GRÁFICO LINHAS (VERTICAL) ====================
    
    function criarGraficoLinhas(hospitalId, leitos) {
        const canvas = document.getElementById(`chart-linhas-${hospitalId}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (window[`chart_linhas_${hospitalId}`]) {
            window[`chart_linhas_${hospitalId}`].destroy();
        }
        
        // Contar linhas
        const linhasMap = {};
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.linhas) {
                leito.linhas.forEach(l => {
                    linhasMap[l] = (linhasMap[l] || 0) + 1;
                });
            }
        });
        
        const labels = Object.keys(linhasMap);
        const valores = Object.values(linhasMap);
        
        // Buscar cores
        const cores = labels.map(label => {
            return window.CORES_LINHAS?.[label] || '#999999';
        });
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: valores,
                    backgroundColor: cores,
                    borderColor: getCorTema('borda'),
                    borderWidth: 2,
                    maxBarThickness: 80
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',  // ← VERTICAL
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: getCorTema('texto'),
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { color: getCorTema('borda') }
                    },
                    y: {
                        ticks: { color: getCorTema('texto'), stepSize: 1 },
                        grid: { color: getCorTema('borda') }
                    }
                }
            }
        };
        
        window[`chart_linhas_${hospitalId}`] = new Chart(ctx, config);
    }
    
    // ==================== GRÁFICO REGIÃO (PIZZA COM NÚMEROS) ====================
    
    function criarGraficoRegiao(hospitalId, leitos) {
        const canvas = document.getElementById(`chart-regiao-${hospitalId}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (window[`chart_regiao_${hospitalId}`]) {
            window[`chart_regiao_${hospitalId}`].destroy();
        }
        
        // Contar regiões
        const regiaoMap = {};
        leitos.forEach(leito => {
            if (leito.status === 'ocupado' && leito.regiao) {
                regiaoMap[leito.regiao] = (regiaoMap[leito.regiao] || 0) + 1;
            }
        });
        
        const labels = Object.keys(regiaoMap);
        const valores = Object.values(regiaoMap);
        
        const cores = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
        ];
        
        const config = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: getCorTema('texto'),
                            font: { size: 14 },
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ${data.datasets[0].data[i]}`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    },
                    datalabels: {
                        display: true,
                        color: '#ffffff',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        formatter: (value) => value
                    }
                }
            }
        };
        
        window[`chart_regiao_${hospitalId}`] = new Chart(ctx, config);
    }
    
    // ==================== GRÁFICO TIPO OCUPAÇÃO (PIZZA COM NÚMEROS) ====================
    
    function criarGraficoTipoOcupacao(hospitalId, leitos) {
        const canvas = document.getElementById(`chart-tipo-${hospitalId}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (window[`chart_tipo_${hospitalId}`]) {
            window[`chart_tipo_${hospitalId}`].destroy();
        }
        
        // Contar tipos
        const tipoMap = { 'Apartamento': 0, 'Enfermaria': 0 };
        leitos.forEach(leito => {
            if (leito.status === 'ocupado') {
                const cat = (leito.categoriaEscolhida || leito.categoria || leito.tipo || '').toLowerCase();
                if (cat.includes('apto') || cat.includes('apartamento')) {
                    tipoMap['Apartamento']++;
                } else if (cat.includes('enf') || cat.includes('enfermaria')) {
                    tipoMap['Enfermaria']++;
                }
            }
        });
        
        const labels = Object.keys(tipoMap);
        const valores = Object.values(tipoMap);
        
        const config = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: ['#3b82f6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: getCorTema('texto'),
                            font: { size: 14 },
                            generateLabels: (chart) => {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ${data.datasets[0].data[i]}`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    },
                    datalabels: {
                        display: true,
                        color: '#ffffff',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        formatter: (value) => value
                    }
                }
            }
        };
        
        window[`chart_tipo_${hospitalId}`] = new Chart(ctx, config);
    }
    
    // ==================== INICIALIZAÇÃO ====================
    
    console.log('[DASHBOARD HOSPITALAR V3.3.2 FINAL] Módulo carregado com sucesso');
    console.log('[CORREÇÕES APLICADAS]');
    console.log('  ✅ Gauge meia-rosca com percentual DENTRO');
    console.log('  ✅ KPIs com dados REAIS (não hardcoded)');
    console.log('  ✅ Barras SEMPRE VERTICAIS (Concessões e Linhas)');
    console.log('  ✅ Números SEMPRE VISÍVEIS nos pizzas');
    console.log('  ✅ Todos os 5 hospitais carregam');
    
})();
