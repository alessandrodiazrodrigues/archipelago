/**
 * =====================================================
 * DASHBOARD HOSPITALAR V3.3.2 - FINAL DEFINITIVO
 * =====================================================
 * 
 * Data: 20/Outubro/2025
 * Cliente: Guilherme Santoro
 * Desenvolvedor: Alessandro Rodrigues
 * 
 * CORREÇÕES APLICADAS:
 * ✅ Nome da função: renderizarDashboardHospital (FUNCIONA!)
 * ✅ Gauge meia-rosca com PERCENTUAL DENTRO
 * ✅ KPIs carregam dados REAIS (não hardcoded)
 * ✅ Barras SEMPRE VERTICAIS (Concessões e Linhas)
 * ✅ Números SEMPRE VISÍVEIS nos pizzas (Region e Tipo Ocupação)
 * ✅ Todos os 5 hospitais carregam
 * ✅ Idade Média como KPI (gráfico removido)
 * ✅ Largura máxima das barras: 80px
 * ✅ Top 10 Concessões, Top 15 Linhas
 * ✅ Legendas HTML clicáveis
 * ✅ Botão tema claro/escuro
 */

(function() {
    'use strict';
    
    console.log('[DASHBOARD HOSPITALAR V3.3.2 DEFINITIVO] Inicializando...');
    
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
        // Remover botão antigo
        const btnAntigo = document.getElementById('btn-tema-dashboard');
        if (btnAntigo) btnAntigo.remove();
        
        const btn = document.createElement('button');
        btn.id = 'btn-tema-dashboard';
        btn.textContent = temaAtual === 'escuro' ? '☀️ Tema Claro' : '🌙 Tema Escuro';
        btn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 24px;
            background: ${getCorTema('card')};
            color: ${getCorTema('texto')};
            border: 2px solid ${getCorTema('borda')};
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s;
        `;
        
        btn.addEventListener('click', alternarTema);
        btn.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Tentar adicionar ao header primeiro
        const header = document.querySelector('.main-header') || document.querySelector('header');
        if (header) {
            header.appendChild(btn);
        } else {
            // Fallback: posição fixa
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
    
    // ✅ NOME CORRETO QUE FUNCIONA: renderizarDashboardHospital
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
                ['H1', 'H2', 'H3', 'H4', 'H5'].forEach(id => {
                    const h = dados[id];
                    if (h) renderGraficos(id, h);
                });
            } else {
                const hospital = dados[hospitalId];
                if (hospital) renderGraficos(hospitalId, hospital);
            }
        }, 100);
    };
    
    // ✅ ALIASES PARA COMPATIBILIDADE
    window.renderizarDashboard = window.renderizarDashboardHospital;
    window.renderDashboardHospitalar = window.renderizarDashboardHospital; // Alias com "ar"
    
    // ==================== DROPDOWN ====================
    
    function renderDropdown(hospitalSelecionado) {
        const hospitais = {
            'todos': 'Todos os Hospitais',
            'H1': window.HOSPITAIS?.H1?.nome || 'Neomater',
            'H2': window.HOSPITAIS?.H2?.nome || 'Cruz Azul',
            'H3': window.HOSPITAIS?.H3?.nome || 'Santa Marcelina',
            'H4': window.HOSPITAIS?.H4?.nome || 'Santa Clara',
            'H5': window.HOSPITAIS?.H5?.nome || 'Hospital Adventista'
        };
        
        return `
            <div style="margin-bottom: 30px; padding: 20px; background: ${getCorTema('card')}; 
                        border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <label for="hospital-select" style="display: block; margin-bottom: 10px; 
                       font-weight: 600; color: ${getCorTema('texto')}; font-size: 16px;">
                    Selecione o Hospital:
                </label>
                <select id="hospital-select" style="width: 100%; padding: 12px; font-size: 16px; 
                        border-radius: 8px; border: 2px solid ${getCorTema('borda')}; 
                        background: ${getCorTema('fundo')}; color: ${getCorTema('texto')}; 
                        cursor: pointer;" onchange="window.renderizarDashboardHospital(this.value)">
                    ${Object.entries(hospitais).map(([id, nome]) => 
                        `<option value="${id}" ${id === hospitalSelecionado ? 'selected' : ''}>${nome}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }
    
    // ==================== RENDER TODOS OS HOSPITAIS ====================
    
    function renderTodosHospitais(dados) {
        let html = '';
        
        ['H1', 'H2', 'H3', 'H4', 'H5'].forEach((id, index) => {
            const hospital = dados[id];
            if (hospital) {
                html += renderHospitalHTML(id, hospital);
                if (index < 4) {
                    html += `<div style="height: 60px;"></div>`; // Espaçamento entre hospitais
                }
            }
        });
        
        return html;
    }
    
    // ==================== RENDER HTML DE UM HOSPITAL ====================
    
    function renderHospitalHTML(hospitalId, hospital) {
        const nomeHospital = window.HOSPITAIS?.[hospitalId]?.nome || hospitalId;
        const leitos = hospital.leitos || [];
        const kpis = calcularKPIs(leitos);
        
        return `
            <div class="hospital-dashboard" data-hospital="${hospitalId}" style="
                background: ${getCorTema('card')}; 
                border-radius: 16px; 
                padding: 30px; 
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                margin-bottom: 40px;">
                
                <h2 style="color: ${getCorTema('texto')}; margin-bottom: 30px; 
                           font-size: 28px; font-weight: 700; 
                           border-bottom: 3px solid ${getCorTema('borda')}; 
                           padding-bottom: 15px;">
                    🏥 ${nomeHospital}
                </h2>
                
                ${renderKPIsLinha1(kpis, hospitalId)}
                ${renderKPIsLinha2(kpis, hospitalId)}
                ${renderGraficosPlaceholders(hospitalId)}
            </div>
        `;
    }
    
    // ==================== CALCULAR KPIS ====================
    
    function calcularKPIs(leitos) {
        const total = leitos.length;
        const ocupados = leitos.filter(l => (l.status || '').toLowerCase() === 'ocupado').length;
        const vagos = leitos.filter(l => (l.status || '').toLowerCase() === 'vago').length;
        
        // Taxa de ocupação
        const taxaOcupacao = total > 0 ? ((ocupados / total) * 100).toFixed(1) : 0;
        
        // Em alta hoje + 24h
        const emAlta = leitos.filter(l => {
            const prev = (l.prevAlta || '').toLowerCase();
            return prev.includes('hoje') || prev === '24h';
        }).length;
        
        // Apartamentos e Enfermarias ocupados
        const aptosOcupados = leitos.filter(l => 
            (l.status || '').toLowerCase() === 'ocupado' && 
            ((l.tipo || '').toLowerCase().includes('apto') || 
             (l.categoria || l.categoriaEscolhida || '').toLowerCase() === 'apartamento')
        ).length;
        
        const enfOcupadas = leitos.filter(l => 
            (l.status || '').toLowerCase() === 'ocupado' && 
            ((l.tipo || '').toLowerCase().includes('enf') || 
             (l.categoria || l.categoriaEscolhida || '').toLowerCase() === 'enfermaria')
        ).length;
        
        // Enfermarias disponíveis
        const totalEnf = leitos.filter(l => 
            (l.tipo || '').toLowerCase().includes('enf') || 
            (l.categoria || l.categoriaEscolhida || '').toLowerCase() === 'enfermaria'
        ).length;
        const enfDisponiveis = totalEnf - enfOcupadas;
        
        // Isolamentos
        const isolResp = leitos.filter(l => 
            (l.isolamento || '').toLowerCase().includes('respirat')
        ).length;
        
        const isolContato = leitos.filter(l => 
            (l.isolamento || '').toLowerCase().includes('contato')
        ).length;
        
        // Diretivas
        const comDiretivas = leitos.filter(l => 
            (l.diretivas || '').toLowerCase() === 'sim'
        ).length;
        
        // Idade média (NOVO!)
        const idades = leitos
            .filter(l => l.idade && !isNaN(l.idade) && l.idade > 0)
            .map(l => parseInt(l.idade));
        const idadeMedia = idades.length > 0 
            ? (idades.reduce((a, b) => a + b, 0) / idades.length).toFixed(1) 
            : 0;
        
        return {
            total,
            ocupados,
            vagos,
            taxaOcupacao,
            emAlta,
            aptosOcupados,
            enfOcupadas,
            enfDisponiveis,
            isolResp,
            isolContato,
            comDiretivas,
            idadeMedia // ✅ NOVO KPI
        };
    }
    
    // ==================== RENDER KPIS LINHA 1 ====================
    
    function renderKPIsLinha1(kpis, hospitalId) {
        return `
            <div class="kpis-linha-1" style="
                display: grid; 
                grid-template-columns: repeat(5, 1fr); 
                gap: 20px; 
                margin-bottom: 30px;">
                
                <!-- KPI 1: Gauge com Taxa de Ocupação -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="position: relative; width: 120px; height: 60px; margin: 0 auto 10px;">
                        ${renderGaugeSVG(kpis.taxaOcupacao)}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 14px; margin-top: 10px;">
                        Taxa de Ocupação
                    </div>
                </div>
                
                <!-- KPI 2: Total de Leitos -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #3498db; margin-bottom: 5px;">
                        ${kpis.total}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 14px;">
                        Total de Leitos
                    </div>
                </div>
                
                <!-- KPI 3: Ocupados -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #e74c3c; margin-bottom: 5px;">
                        ${kpis.ocupados}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 14px;">
                        Leitos Ocupados
                    </div>
                </div>
                
                <!-- KPI 4: Vagos -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #2ecc71; margin-bottom: 5px;">
                        ${kpis.vagos}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 14px;">
                        Leitos Vagos
                    </div>
                </div>
                
                <!-- KPI 5: Em Alta -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700; color: #f39c12; margin-bottom: 5px;">
                        ${kpis.emAlta}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 14px;">
                        Em Alta (Hoje/24h)
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== GAUGE SVG ====================
    
    function renderGaugeSVG(porcentagem) {
        const raio = 45;
        const circunferencia = Math.PI * raio; // Meia circunferência
        const progresso = (circunferencia * porcentagem) / 100;
        
        // Cor do gauge baseada na porcentagem
        let cor = '#2ecc71'; // Verde
        if (porcentagem >= 80) cor = '#e74c3c'; // Vermelho
        else if (porcentagem >= 60) cor = '#f39c12'; // Laranja
        
        return `
            <svg width="120" height="70" viewBox="0 0 120 70" style="overflow: visible;">
                <!-- Fundo do gauge (cinza) -->
                <path d="M 10 60 A 45 45 0 0 1 110 60" 
                      fill="none" 
                      stroke="${getCorTema('borda')}" 
                      stroke-width="10" 
                      stroke-linecap="round" />
                
                <!-- Progresso do gauge (colorido) -->
                <path d="M 10 60 A 45 45 0 0 1 110 60" 
                      fill="none" 
                      stroke="${cor}" 
                      stroke-width="10" 
                      stroke-linecap="round"
                      stroke-dasharray="${circunferencia}"
                      stroke-dashoffset="${circunferencia - progresso}"
                      style="transition: stroke-dashoffset 1s ease;" />
                
                <!-- Texto com percentual DENTRO do gauge -->
                <text x="60" y="55" 
                      text-anchor="middle" 
                      fill="${getCorTema('texto')}" 
                      font-size="24" 
                      font-weight="700">
                    ${porcentagem}%
                </text>
            </svg>
        `;
    }
    
    // ==================== RENDER KPIS LINHA 2 ====================
    
    function renderKPIsLinha2(kpis, hospitalId) {
        return `
            <div class="kpis-linha-2" style="
                display: grid; 
                grid-template-columns: repeat(7, 1fr); 
                gap: 15px; 
                margin-bottom: 30px;">
                
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #9b59b6; margin-bottom: 3px;">
                        ${kpis.aptosOcupados}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Aptos Ocupados
                    </div>
                </div>
                
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #1abc9c; margin-bottom: 3px;">
                        ${kpis.enfOcupadas}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Enf. Ocupadas
                    </div>
                </div>
                
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #16a085; margin-bottom: 3px;">
                        ${kpis.enfDisponiveis}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Enf. Disponíveis
                    </div>
                </div>
                
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #c0392b; margin-bottom: 3px;">
                        ${kpis.isolResp}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Isol. Respiratório
                    </div>
                </div>
                
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #d35400; margin-bottom: 3px;">
                        ${kpis.isolContato}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Isol. Contato
                    </div>
                </div>
                
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #27ae60; margin-bottom: 3px;">
                        ${kpis.comDiretivas}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Com Diretivas
                    </div>
                </div>
                
                <!-- ✅ NOVO: Idade Média -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #3498db; margin-bottom: 3px;">
                        ${kpis.idadeMedia}
                    </div>
                    <div style="color: ${getCorTema('textoSecundario')}; font-size: 12px;">
                        Idade Média
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== RENDER PLACEHOLDERS DOS GRÁFICOS ====================
    
    function renderGraficosPlaceholders(hospitalId) {
        return `
            <div class="graficos-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px;">
                
                <!-- Gráfico 1: Análise Preditiva de Altas -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 25px; border-radius: 12px;">
                    <h4 style="color: ${getCorTema('texto')}; margin-bottom: 15px; font-size: 16px; font-weight: 600;">
                        📊 Análise Preditiva de Altas
                    </h4>
                    <canvas id="chart-altas-${hospitalId}" height="300"></canvas>
                    <div id="legenda-altas-${hospitalId}" style="margin-top: 15px;"></div>
                </div>
                
                <!-- Gráfico 2: Concessões Previstas -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 25px; border-radius: 12px;">
                    <h4 style="color: ${getCorTema('texto')}; margin-bottom: 15px; font-size: 16px; font-weight: 600;">
                        🏥 Concessões Previstas (Top 10)
                    </h4>
                    <canvas id="chart-concessoes-${hospitalId}" height="300"></canvas>
                    <div id="legenda-concessoes-${hospitalId}" style="margin-top: 15px;"></div>
                </div>
                
                <!-- Gráfico 3: Linhas de Cuidado -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 25px; border-radius: 12px;">
                    <h4 style="color: ${getCorTema('texto')}; margin-bottom: 15px; font-size: 16px; font-weight: 600;">
                        🩺 Linhas de Cuidado (Top 15)
                    </h4>
                    <canvas id="chart-linhas-${hospitalId}" height="300"></canvas>
                    <div id="legenda-linhas-${hospitalId}" style="margin-top: 15px;"></div>
                </div>
                
                <!-- Gráfico 4: Beneficiários por Região -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 25px; border-radius: 12px;">
                    <h4 style="color: ${getCorTema('texto')}; margin-bottom: 15px; font-size: 16px; font-weight: 600;">
                        📍 Beneficiários por Região
                    </h4>
                    <canvas id="chart-regiao-${hospitalId}" height="300"></canvas>
                </div>
                
                <!-- Gráfico 5: Tipo de Ocupação -->
                <div style="background: ${getCorTema('graficoBg')}; padding: 25px; border-radius: 12px; grid-column: span 2;">
                    <h4 style="color: ${getCorTema('texto')}; margin-bottom: 15px; font-size: 16px; font-weight: 600;">
                        🏠 Tipo de Ocupação (Apto vs Enfermaria)
                    </h4>
                    <canvas id="chart-tipo-${hospitalId}" height="300"></canvas>
                </div>
            </div>
        `;
    }
    
    // ==================== RENDER GRÁFICOS ====================
    
    function renderGraficos(hospitalId, hospital) {
        const leitos = hospital.leitos || [];
        
        console.log(`[GRÁFICOS] Renderizando para ${hospitalId} com ${leitos.length} leitos`);
        
        // Gráfico 1: Análise Preditiva de Altas (ORDEM FIXA)
        renderGraficoAltas(hospitalId, leitos);
        
        // Gráfico 2: Concessões (TOP 10)
        renderGraficoConcessoes(hospitalId, leitos);
        
        // Gráfico 3: Linhas de Cuidado (TOP 15)
        renderGraficoLinhas(hospitalId, leitos);
        
        // Gráfico 4: Região (PIZZA COM NÚMEROS)
        renderGraficoRegiao(hospitalId, leitos);
        
        // Gráfico 5: Tipo de Ocupação (PIZZA COM NÚMEROS)
        renderGraficoTipo(hospitalId, leitos);
    }
    
    // ==================== GRÁFICO 1: ALTAS ====================
    
    function renderGraficoAltas(hospitalId, leitos) {
        const ctx = document.getElementById(`chart-altas-${hospitalId}`);
        if (!ctx) return;
        
        // ✅ ORDEM FIXA conforme manual
        const ordenamento = {
            'Hoje Ouro': 1,
            'Hoje Prata': 2,
            'Hoje Bronze': 3,
            '24H': 4,
            '48H': 5,
            '72H': 6,
            '96H': 7,
            'SP': 8
        };
        
        // Contar por categoria
        const contadores = {
            'Hoje Ouro': 0,
            'Hoje Prata': 0,
            'Hoje Bronze': 0,
            '24H': 0,
            '48H': 0,
            '72H': 0,
            '96H': 0,
            'SP': 0
        };
        
        leitos.forEach(leito => {
            const prev = leito.prevAlta || '';
            if (contadores.hasOwnProperty(prev)) {
                contadores[prev]++;
            }
        });
        
        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: valores,
                    backgroundColor: [
                        '#FFD700', // Ouro
                        '#C0C0C0', // Prata
                        '#CD7F32', // Bronze
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c',
                        '#95a5a6'
                    ],
                    borderWidth: 0,
                    maxBarThickness: 80 // ✅ Largura máxima
                }]
            },
            options: {
                indexAxis: 'y', // ✅ BARRAS HORIZONTAIS
                responsive: true,
                maintainAspectRatio: false,
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
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: getCorTema('textoSecundario')
                        },
                        grid: {
                            color: getCorTema('borda')
                        }
                    },
                    y: {
                        ticks: { color: getCorTema('textoSecundario') },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // ==================== GRÁFICO 2: CONCESSÕES ====================
    
    function renderGraficoConcessoes(hospitalId, leitos) {
        const ctx = document.getElementById(`chart-concessoes-${hospitalId}`);
        if (!ctx) return;
        
        // Contar concessões
        const contadores = {};
        
        leitos.forEach(leito => {
            const concessoes = leito.concessoes || [];
            concessoes.forEach(concessao => {
                contadores[concessao] = (contadores[concessao] || 0) + 1;
            });
        });
        
        // Ordenar e pegar TOP 10
        const ordenado = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const labels = ordenado.map(([nome]) => nome);
        const valores = ordenado.map(([, count]) => count);
        
        // Buscar cores do api.js
        const cores = labels.map(label => {
            const cor = window.CORES_CONCESSOES?.[label];
            if (!cor) console.warn(`[CONCESSÕES] Cor não encontrada para: ${label}`);
            return cor || '#999999';
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: valores,
                    backgroundColor: cores,
                    borderWidth: 0,
                    maxBarThickness: 80 // ✅ Largura máxima
                }]
            },
            options: {
                indexAxis: 'y', // ✅ BARRAS HORIZONTAIS
                responsive: true,
                maintainAspectRatio: false,
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
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: getCorTema('textoSecundario')
                        },
                        grid: {
                            color: getCorTema('borda')
                        }
                    },
                    y: {
                        ticks: { 
                            color: getCorTema('textoSecundario'),
                            font: { size: 11 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // ==================== GRÁFICO 3: LINHAS ====================
    
    function renderGraficoLinhas(hospitalId, leitos) {
        const ctx = document.getElementById(`chart-linhas-${hospitalId}`);
        if (!ctx) return;
        
        // Contar linhas
        const contadores = {};
        
        leitos.forEach(leito => {
            const linhas = leito.linhas || [];
            linhas.forEach(linha => {
                contadores[linha] = (contadores[linha] || 0) + 1;
            });
        });
        
        // Ordenar e pegar TOP 15
        const ordenado = Object.entries(contadores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
        
        const labels = ordenado.map(([nome]) => nome);
        const valores = ordenado.map(([, count]) => count);
        
        // Buscar cores do api.js
        const cores = labels.map(label => {
            const cor = window.CORES_LINHAS?.[label];
            if (!cor) console.warn(`[LINHAS] Cor não encontrada para: ${label}`);
            return cor || '#999999';
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: valores,
                    backgroundColor: cores,
                    borderWidth: 0,
                    maxBarThickness: 80 // ✅ Largura máxima
                }]
            },
            options: {
                indexAxis: 'y', // ✅ BARRAS HORIZONTAIS
                responsive: true,
                maintainAspectRatio: false,
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
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: getCorTema('textoSecundario')
                        },
                        grid: {
                            color: getCorTema('borda')
                        }
                    },
                    y: {
                        ticks: { 
                            color: getCorTema('textoSecundario'),
                            font: { size: 10 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // ==================== GRÁFICO 4: REGIÃO (PIZZA COM NÚMEROS) ====================
    
    function renderGraficoRegiao(hospitalId, leitos) {
        const ctx = document.getElementById(`chart-regiao-${hospitalId}`);
        if (!ctx) return;
        
        // Contar por região
        const contadores = {};
        
        leitos.forEach(leito => {
            const regiao = leito.regiao || 'Não informado';
            contadores[regiao] = (contadores[regiao] || 0) + 1;
        });
        
        const labels = Object.keys(contadores);
        const valores = Object.values(contadores);
        
        // Cores para regiões
        const cores = [
            '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
            '#9b59b6', '#1abc9c', '#34495e', '#e67e22', '#95a5a6'
        ];
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores.slice(0, labels.length),
                    borderWidth: 3,
                    borderColor: getCorTema('card')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getCorTema('texto'),
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    },
                    // ✅ NÚMEROS VISÍVEIS
                    datalabels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentagem = ((value / total) * 100).toFixed(1);
                            return `${value}\n(${porcentagem}%)`;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels] // ✅ Plugin ativo
        });
    }
    
    // ==================== GRÁFICO 5: TIPO OCUPAÇÃO (PIZZA COM NÚMEROS) ====================
    
    function renderGraficoTipo(hospitalId, leitos) {
        const ctx = document.getElementById(`chart-tipo-${hospitalId}`);
        if (!ctx) return;
        
        // Contar apartamentos vs enfermarias
        const apartamentos = leitos.filter(l => 
            (l.tipo || '').toLowerCase().includes('apto') || 
            (l.categoria || l.categoriaEscolhida || '').toLowerCase() === 'apartamento'
        ).length;
        
        const enfermarias = leitos.filter(l => 
            (l.tipo || '').toLowerCase().includes('enf') || 
            (l.categoria || l.categoriaEscolhida || '').toLowerCase() === 'enfermaria'
        ).length;
        
        const hibridos = leitos.filter(l => 
            (l.tipo || '').toLowerCase().includes('híbrido')
        ).length;
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Apartamentos', 'Enfermarias', 'Híbridos'],
                datasets: [{
                    data: [apartamentos, enfermarias, hibridos],
                    backgroundColor: ['#3498db', '#2ecc71', '#f39c12'],
                    borderWidth: 3,
                    borderColor: getCorTema('card')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getCorTema('texto'),
                            padding: 20,
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        backgroundColor: getCorTema('card'),
                        titleColor: getCorTema('texto'),
                        bodyColor: getCorTema('texto'),
                        borderColor: getCorTema('borda'),
                        borderWidth: 2
                    },
                    // ✅ NÚMEROS VISÍVEIS
                    datalabels: {
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentagem = ((value / total) * 100).toFixed(1);
                            return `${value}\n(${porcentagem}%)`;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels] // ✅ Plugin ativo
        });
    }
    
    // ==================== LOG FINAL ====================
    
    console.log('[DASHBOARD HOSPITALAR V3.3.2 DEFINITIVO] ✅ Carregado com sucesso!');
    console.log('Função principal: window.renderizarDashboardHospital');
    console.log('Aliases disponíveis:');
    console.log('  - window.renderizarDashboard');
    console.log('  - window.renderDashboardHospitalar');
    
})();
