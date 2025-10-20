/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               DASHBOARD HOSPITALAR V3.3.2 - ARCHIPELAGO                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Cliente: Guilherme Santoro                                                ║
 * ║ Desenvolvedor: Alessandro Rodrigues                                       ║
 * ║ Data: 20/Outubro/2025                                                     ║
 * ║ Status: ✅ CORRIGIDO - Fundo dark, layout 1/linha, barras individuais    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * CORREÇÕES APLICADAS:
 * ✅ Fundo dark (#1a202c) aplicado automaticamente
 * ✅ Gráficos 1 por linha (grid-template-columns: 1fr)
 * ✅ Concessões: 1 barra POR concessão (total de todos os prazos)
 * ✅ Linhas: 1 barra POR linha de cuidado (total de todos os prazos)
 * ✅ Logs de debug detalhados
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURAÇÕES E CONSTANTES
    // ═══════════════════════════════════════════════════════════════════════

    const ORDEM_HOSPITAIS = ['H1', 'H2', 'H3', 'H4', 'H5'];

    const NOMES_HOSPITAIS = {
        H1: 'Neomater',
        H2: 'Cruz Azul',
        H3: 'Santa Marcelina',
        H4: 'Santa Clara',
        H5: 'Hospital Adventista'
    };

    const CAPACIDADE_ENFERMARIA = {
        H4: 4
    };

    const CORES_GAUGE = {
        baixo: '#10b981',
        medio: '#f59e0b',
        alto: '#ef4444'
    };

    const CORES_ALTAS = {
        'Hoje Ouro': '#FFC72C',
        'Hoje 2R': '#304FFE',
        'Hoje 3R': '#7E57C2',
        '24h Ouro': '#FFE082',
        '24h 2R': '#82B1FF',
        '24h 3R': '#B39DDB',
        '48h': '#64B5F6',
        '72h': '#90CAF9',
        '96h': '#BBDEFB'
    };

    const chartInstances = {};

    // ═══════════════════════════════════════════════════════════════════════
    // FUNÇÕES AUXILIARES
    // ═══════════════════════════════════════════════════════════════════════

    function safeInt(v) {
        return Number.isFinite(+v) ? +v : 0;
    }

    function safeTxt(v) {
        return (v === null || v === undefined || v === '') ? '—' : String(v);
    }

    function kpiSeguros(k) {
        return {
            total: safeInt(k.total),
            ocupados: safeInt(k.ocupados),
            vagos: safeInt(k.vagos),
            ocupacao: safeInt(k.ocupacao),
            altasHoje: safeInt(k.altasHoje),
            aptoOcup: safeInt(k.aptoOcup),
            enfOcup: safeInt(k.enfOcup),
            enfDisp: safeInt(k.enfDisp),
            isolResp: safeInt(k.isolResp),
            isolContato: safeInt(k.isolContato),
            diretivas: safeInt(k.diretivas),
            idadeMedia: safeInt(k.idadeMedia)
        };
    }

    function corConcessao(nome) {
        return window.CORES_CONCESSOES?.[nome] || '#999999';
    }

    function corLinha(nome) {
        return window.CORES_LINHAS?.[nome] || '#999999';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FUNÇÃO PRINCIPAL
    // ═══════════════════════════════════════════════════════════════════════

    window.renderDashboardHospitalar = function(hospitalId = 'todos') {
        console.log('🏥 [DASHBOARD] Renderizando:', hospitalId);

        if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
            mostrarErro('Dados não carregados');
            return;
        }

        console.log('📊 [DEBUG] Hospitais disponíveis:', Object.keys(window.hospitalData));

        const container = document.getElementById('dashHospitalarContent');
        if (!container) {
            console.error('❌ Container não encontrado');
            return;
        }

        container.innerHTML = '';
        container.style.cssText = `
            background: #1a202c;
            min-height: 100vh;
            padding: 2rem;
        `;

        if (hospitalId === 'todos') {
            renderizarTodos(container);
        } else {
            renderizarSingle(container, hospitalId);
        }

        console.log('✅ [DASHBOARD] Concluído');
    };

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERIZAÇÃO
    // ═══════════════════════════════════════════════════════════════════════

    function renderizarTodos(container) {
        ORDEM_HOSPITAIS.forEach(hospitalId => {
            if (window.hospitalData[hospitalId]) {
                const section = document.createElement('div');
                section.style.marginBottom = '3rem';
                renderizarHospital(section, hospitalId);
                container.appendChild(section);
            }
        });
    }

    function renderizarSingle(container, hospitalId) {
        if (!window.hospitalData[hospitalId]) {
            mostrarErro(`Hospital ${hospitalId} não encontrado`);
            return;
        }
        renderizarHospital(container, hospitalId);
    }

    function renderizarHospital(container, hospitalId) {
        const hospital = window.hospitalData[hospitalId];
        const leitos = hospital.leitos || [];
        
        console.log(`📊 [${hospitalId}] Leitos:`, leitos.length);

        const kpis = calcularKPIs(leitos, hospitalId);
        const kpisSeguros = kpiSeguros(kpis);

        container.appendChild(criarCabecalho(hospitalId));
        container.appendChild(criarKPIsLinha1(kpisSeguros));
        container.appendChild(criarKPIsLinha2(kpisSeguros, hospitalId));
        renderizarGraficos(container, leitos, hospitalId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CABEÇALHO E KPIS
    // ═══════════════════════════════════════════════════════════════════════

    function criarCabecalho(hospitalId) {
        const div = document.createElement('div');
        div.style.cssText = `
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #4a5568;
        `;
        const titulo = document.createElement('h2');
        titulo.style.cssText = `
            font-size: 1.875rem;
            font-weight: 700;
            color: #f7fafc;
            margin: 0;
        `;
        titulo.textContent = NOMES_HOSPITAIS[hospitalId] || hospitalId;
        div.appendChild(titulo);
        return div;
    }

    function criarKPIsLinha1(kpis) {
        const linha = document.createElement('div');
        linha.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        `;

        linha.appendChild(criarKPIGauge(kpis.ocupacao));
        linha.appendChild(criarKPIBox('Total de Leitos', kpis.total, '#6366f1'));
        linha.appendChild(criarKPIBox('Ocupados', kpis.ocupados, '#ef4444'));
        linha.appendChild(criarKPIBox('Vagos', kpis.vagos, '#10b981'));
        linha.appendChild(criarKPIBox('Em alta (hoje)', kpis.altasHoje, '#f59e0b'));

        return linha;
    }

    function criarKPIsLinha2(kpis, hospitalId) {
        const linha = document.createElement('div');
        linha.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        `;

        if (kpis.aptoOcup > 0) {
            linha.appendChild(criarKPIBox('Apartamentos ocupados', kpis.aptoOcup, '#3b82f6'));
        }

        if (kpis.enfOcup > 0) {
            linha.appendChild(criarKPIBox('Enfermarias ocupadas', kpis.enfOcup, '#8b5cf6'));
        }

        if (CAPACIDADE_ENFERMARIA[hospitalId] !== undefined) {
            linha.appendChild(criarKPIBox('Enfermarias disponíveis', kpis.enfDisp, '#14b8a6'));
        }

        const isolTotal = kpis.isolResp + kpis.isolContato;
        const kpiIsol = criarKPIBox('Isolamentos', isolTotal, '#dc2626');
        const subtitulo = document.createElement('div');
        subtitulo.style.cssText = `font-size: 0.75rem; color: #cbd5e0; margin-top: 0.25rem;`;
        subtitulo.textContent = `Resp: ${kpis.isolResp} | Contato: ${kpis.isolContato}`;
        kpiIsol.appendChild(subtitulo);
        linha.appendChild(kpiIsol);

        linha.appendChild(criarKPIBox('Com diretivas', kpis.diretivas, '#f59e0b'));
        linha.appendChild(criarKPIBox('Idade média', kpis.idadeMedia, '#6366f1'));

        return linha;
    }

    function criarKPIBox(label, valor, cor) {
        const box = document.createElement('div');
        box.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            border-left: 4px solid ${cor};
        `;

        const labelEl = document.createElement('div');
        labelEl.style.cssText = `
            font-size: 0.875rem;
            color: #4a5568;
            margin-bottom: 0.5rem;
            font-weight: 500;
        `;
        labelEl.textContent = label;

        const valorEl = document.createElement('div');
        valorEl.style.cssText = `font-size: 2rem; font-weight: 700; color: ${cor};`;
        valorEl.textContent = safeTxt(valor);

        box.appendChild(labelEl);
        box.appendChild(valorEl);
        return box;
    }

    function criarKPIGauge(ocupacao) {
        const box = document.createElement('div');
        box.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const labelEl = document.createElement('div');
        labelEl.style.cssText = `
            font-size: 0.875rem;
            color: #4a5568;
            margin-bottom: 1rem;
            font-weight: 500;
        `;
        labelEl.textContent = 'Ocupação (%)';

        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 120;

        const valorEl = document.createElement('div');
        valorEl.style.cssText = `
            font-size: 2.5rem;
            font-weight: 700;
            margin-top: -2.5rem;
            color: ${getCorOcupacao(ocupacao)};
        `;
        valorEl.textContent = `${ocupacao}%`;

        box.appendChild(labelEl);
        box.appendChild(canvas);
        box.appendChild(valorEl);

        setTimeout(() => desenharGauge(canvas, ocupacao), 10);
        return box;
    }

    function desenharGauge(canvas, valor) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 10;
        const radius = 70;
        const lineWidth = 18;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineCap = 'round';
        ctx.stroke();

        const endAngle = Math.PI + (Math.PI * valor / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = getCorOcupacao(valor);
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function getCorOcupacao(ocupacao) {
        if (ocupacao < 60) return CORES_GAUGE.baixo;
        if (ocupacao < 80) return CORES_GAUGE.medio;
        return CORES_GAUGE.alto;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CÁLCULO DE KPIS
    // ═══════════════════════════════════════════════════════════════════════

    function calcularKPIs(leitos, hospitalId) {
        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado');
        const numOcupados = ocupados.length;
        const ocupacao = total > 0 ? Math.round((numOcupados / total) * 100) : 0;

        const altasHoje = ocupados.filter(l => 
            ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'].includes(l.prevAlta)
        ).length;

        const aptoOcup = ocupados.filter(l => 
            l.categoria === 'Apartamento' || l.categoriaEscolhida === 'Apartamento'
        ).length;
        
        const enfOcup = ocupados.filter(l => 
            l.categoria === 'Enfermaria' || l.categoriaEscolhida === 'Enfermaria'
        ).length;

        let enfDisp = 0;
        if (CAPACIDADE_ENFERMARIA[hospitalId] !== undefined) {
            enfDisp = CAPACIDADE_ENFERMARIA[hospitalId] - enfOcup;
        }

        const isolResp = ocupados.filter(l => 
            l.isolamento === 'Isolamento Respiratório'
        ).length;

        const isolContato = ocupados.filter(l => 
            l.isolamento === 'Isolamento de Contato'
        ).length;

        const diretivas = ocupados.filter(l => l.diretivas === 'Sim').length;

        const idades = ocupados.map(l => safeInt(l.idade)).filter(i => i > 0);
        const idadeMedia = idades.length > 0 
            ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length)
            : 0;

        return {
            total,
            ocupados: numOcupados,
            vagos: total - numOcupados,
            ocupacao,
            altasHoje,
            aptoOcup,
            enfOcup,
            enfDisp,
            isolResp,
            isolContato,
            diretivas,
            idadeMedia
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GRÁFICOS - LAYOUT 1 POR LINHA
    // ═══════════════════════════════════════════════════════════════════════

    function renderizarGraficos(container, leitos, hospitalId) {
        const ocupados = leitos.filter(l => l.status === 'ocupado');
        
        const graficosContainer = document.createElement('div');
        graficosContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-top: 2rem;
        `;

        graficosContainer.appendChild(criarGraficoAltas(ocupados, hospitalId));
        graficosContainer.appendChild(criarGraficoConcessoes(ocupados, hospitalId));
        graficosContainer.appendChild(criarGraficoLinhas(ocupados, hospitalId));
        graficosContainer.appendChild(criarGraficoRegiao(ocupados, hospitalId));
        graficosContainer.appendChild(criarGraficoTipo(ocupados, hospitalId));

        container.appendChild(graficosContainer);
    }

    function criarWrapperGrafico(titulo, id) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;

        const tituloEl = document.createElement('h3');
        tituloEl.style.cssText = `
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1.5rem;
        `;
        tituloEl.textContent = titulo;

        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.style.maxHeight = '400px';

        wrapper.appendChild(tituloEl);
        wrapper.appendChild(canvas);
        return wrapper;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GRÁFICO DE ALTAS (EMPILHADO)
    // ═══════════════════════════════════════════════════════════════════════

    function criarGraficoAltas(ocupados, hospitalId) {
        const dataStr = new Date().toLocaleDateString('pt-BR');
        const series = agruparPorPrazo(ocupados);
        const datasets = buildDatasetsAltas(series);

        const wrapper = criarWrapperGrafico(
            `Análise preditiva de altas em ${dataStr}`,
            `grafico-altas-${hospitalId}`
        );

        const canvas = wrapper.querySelector('canvas');
        renderizarBarrasVerticais(
            canvas,
            ['Hoje', '24h', '48h', '72h', '96h'],
            datasets,
            'Beneficiários',
            `chart-altas-${hospitalId}`
        );

        const legenda = criarLegendaHTML(datasets, `chart-altas-${hospitalId}`);
        wrapper.appendChild(legenda);
        return wrapper;
    }

    function agruparPorPrazo(ocupados) {
        const series = {
            'Hoje Ouro': 0, 'Hoje 2R': 0, 'Hoje 3R': 0,
            '24h Ouro': 0, '24h 2R': 0, '24h 3R': 0,
            '48h': 0, '72h': 0, '96h': 0
        };

        ocupados.forEach(l => {
            if (series.hasOwnProperty(l.prevAlta)) {
                series[l.prevAlta]++;
            }
        });

        return series;
    }

    function buildDatasetsAltas(series) {
        const gruposHoje24 = [
            { chave: 'Hoje Ouro', label: 'Hoje Ouro', color: CORES_ALTAS['Hoje Ouro'], stack: 'H' },
            { chave: 'Hoje 2R', label: 'Hoje 2R', color: CORES_ALTAS['Hoje 2R'], stack: 'H' },
            { chave: 'Hoje 3R', label: 'Hoje 3R', color: CORES_ALTAS['Hoje 3R'], stack: 'H' },
            { chave: '24h Ouro', label: '24h Ouro', color: CORES_ALTAS['24h Ouro'], stack: 'D' },
            { chave: '24h 2R', label: '24h 2R', color: CORES_ALTAS['24h 2R'], stack: 'D' },
            { chave: '24h 3R', label: '24h 3R', color: CORES_ALTAS['24h 3R'], stack: 'D' }
        ];

        const simples = [
            { chave: '48h', label: '48h', color: CORES_ALTAS['48h'] },
            { chave: '72h', label: '72h', color: CORES_ALTAS['72h'] },
            { chave: '96h', label: '96h', color: CORES_ALTAS['96h'] }
        ];

        return [
            ...gruposHoje24.map(g => ({
                label: g.label,
                backgroundColor: g.color,
                stack: g.stack,
                data: [
                    g.chave.startsWith('Hoje') ? (series[g.chave] || 0) : 0,
                    g.chave.startsWith('24h') ? (series[g.chave] || 0) : 0,
                    0, 0, 0
                ]
            })),
            ...simples.map(s => ({
                label: s.label,
                backgroundColor: s.color,
                data: [
                    0, 0,
                    s.chave === '48h' ? (series['48h'] || 0) : 0,
                    s.chave === '72h' ? (series['72h'] || 0) : 0,
                    s.chave === '96h' ? (series['96h'] || 0) : 0
                ]
            }))
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GRÁFICO DE CONCESSÕES (1 BARRA POR CONCESSÃO)
    // ═══════════════════════════════════════════════════════════════════════

    function criarGraficoConcessoes(ocupados, hospitalId) {
        const dataStr = new Date().toLocaleDateString('pt-BR');
        
        const contagem = {};
        ocupados.forEach(l => {
            (l.concessoes || []).forEach(c => {
                contagem[c] = (contagem[c] || 0) + 1;
            });
        });

        console.log(`📊 [${hospitalId}] Concessões:`, contagem);

        if (Object.keys(contagem).length === 0) {
            return criarPlaceholder(`Concessões previstas em ${dataStr}`, 'Sem concessões');
        }

        const labels = Object.keys(contagem);
        const values = Object.values(contagem);
        const cores = labels.map(l => corConcessao(l));

        const wrapper = criarWrapperGrafico(
            `Concessões previstas em ${dataStr}`,
            `grafico-concessoes-${hospitalId}`
        );

        const canvas = wrapper.querySelector('canvas');
        renderizarBarrasIndividuais(
            canvas,
            labels,
            values,
            cores,
            'Beneficiários',
            `chart-concessoes-${hospitalId}`
        );

        const datasets = labels.map((l, i) => ({ label: l, backgroundColor: cores[i] }));
        const legenda = criarLegendaHTML(datasets, `chart-concessoes-${hospitalId}`);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GRÁFICO DE LINHAS (1 BARRA POR LINHA)
    // ═══════════════════════════════════════════════════════════════════════

    function criarGraficoLinhas(ocupados, hospitalId) {
        const dataStr = new Date().toLocaleDateString('pt-BR');
        
        const contagem = {};
        ocupados.forEach(l => {
            (l.linhas || []).forEach(linha => {
                contagem[linha] = (contagem[linha] || 0) + 1;
            });
        });

        console.log(`📊 [${hospitalId}] Linhas:`, contagem);

        if (Object.keys(contagem).length === 0) {
            return criarPlaceholder(`Linhas de cuidado em ${dataStr}`, 'Sem linhas de cuidado');
        }

        const labels = Object.keys(contagem);
        const values = Object.values(contagem);
        const cores = labels.map(l => corLinha(l));

        const wrapper = criarWrapperGrafico(
            `Linhas de cuidado em ${dataStr}`,
            `grafico-linhas-${hospitalId}`
        );

        const canvas = wrapper.querySelector('canvas');
        renderizarBarrasIndividuais(
            canvas,
            labels,
            values,
            cores,
            'Beneficiários',
            `chart-linhas-${hospitalId}`
        );

        const datasets = labels.map((l, i) => ({ label: l, backgroundColor: cores[i] }));
        const legenda = criarLegendaHTML(datasets, `chart-linhas-${hospitalId}`);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    function criarPlaceholder(titulo, mensagem) {
        const wrapper = criarWrapperGrafico(titulo, `placeholder-${Date.now()}`);
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            padding: 3rem;
            text-align: center;
            color: #9ca3af;
            font-size: 1.125rem;
        `;
        placeholder.textContent = mensagem;
        wrapper.appendChild(placeholder);
        return wrapper;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GRÁFICOS DE PIZZA
    // ═══════════════════════════════════════════════════════════════════════

    function criarGraficoRegiao(ocupados, hospitalId) {
        const dataStr = new Date().toLocaleDateString('pt-BR');

        const contagem = {};
        ocupados.forEach(l => {
            const regiao = l.regiao || 'Não informado';
            contagem[regiao] = (contagem[regiao] || 0) + 1;
        });

        const labels = Object.keys(contagem);
        const values = Object.values(contagem);

        const wrapper = criarWrapperGrafico(
            `Distribuição por região em ${dataStr}`,
            `grafico-regiao-${hospitalId}`
        );

        const canvas = wrapper.querySelector('canvas');
        renderizarPizza(canvas, labels, values, `chart-regiao-${hospitalId}`);

        const datasets = [{ label: 'Região', backgroundColor: gerarCoresPizza(labels.length) }];
        const legenda = criarLegendaHTML(datasets, `chart-regiao-${hospitalId}`, labels);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    function criarGraficoTipo(ocupados, hospitalId) {
        const dataStr = new Date().toLocaleDateString('pt-BR');

        const contagem = {};
        ocupados.forEach(l => {
            const tipo = l.categoria || l.categoriaEscolhida || 'Não informado';
            contagem[tipo] = (contagem[tipo] || 0) + 1;
        });

        const labels = Object.keys(contagem);
        const values = Object.values(contagem);

        const wrapper = criarWrapperGrafico(
            `Tipo de acomodação em ${dataStr}`,
            `grafico-tipo-${hospitalId}`
        );

        const canvas = wrapper.querySelector('canvas');
        renderizarPizza(canvas, labels, values, `chart-tipo-${hospitalId}`);

        const datasets = [{ label: 'Tipo', backgroundColor: gerarCoresPizza(labels.length) }];
        const legenda = criarLegendaHTML(datasets, `chart-tipo-${hospitalId}`, labels);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    function gerarCoresPizza(n) {
        const cores = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
            '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
        ];
        return Array.from({ length: n }, (_, i) => cores[i % cores.length]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERIZAÇÃO CHART.JS
    // ═══════════════════════════════════════════════════════════════════════

    function renderizarBarrasVerticais(canvas, labels, datasets, yLabel, chartId) {
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }

        chartInstances[chartId] = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, title: { display: true, text: yLabel } }
                }
            }
        });
    }

    function renderizarBarrasIndividuais(canvas, labels, values, cores, yLabel, chartId) {
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }

        chartInstances[chartId] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: yLabel, data: values, backgroundColor: cores }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.parsed.y}`
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: yLabel } }
                }
            }
        });
    }

    function renderizarPizza(canvas, labels, values, chartId) {
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }

        chartInstances[chartId] = new Chart(canvas, {
            type: 'pie',
            data: {
                labels,
                datasets: [{ data: values, backgroundColor: gerarCoresPizza(labels.length) }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((ctx.parsed / total) * 100).toFixed(1);
                                return `${ctx.label}: ${ctx.parsed} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function criarLegendaHTML(datasets, chartId, customLabels = null) {
        const legenda = document.createElement('ul');
        legenda.style.cssText = `
            list-style: none;
            padding: 0;
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-height: 300px;
            overflow-y: auto;
        `;

        const labels = customLabels || datasets.map(d => d.label);

        labels.forEach((label, index) => {
            const item = document.createElement('li');
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 0.25rem;
                transition: background 0.2s;
            `;

            const cor = Array.isArray(datasets[0]?.backgroundColor)
                ? datasets[0].backgroundColor[index]
                : datasets[index]?.backgroundColor || '#999999';

            const box = document.createElement('span');
            box.style.cssText = `
                width: 16px;
                height: 16px;
                background: ${cor};
                border-radius: 0.25rem;
                flex-shrink: 0;
            `;

            const texto = document.createElement('span');
            texto.style.cssText = `font-size: 0.875rem; color: #374151;`;
            texto.textContent = label;

            item.appendChild(box);
            item.appendChild(texto);

            item.addEventListener('click', () => {
                const chart = chartInstances[chartId];
                if (chart) {
                    const meta = chart.getDatasetMeta(index);
                    if (meta) {
                        meta.hidden = !meta.hidden;
                        chart.update();
                        item.style.opacity = meta.hidden ? '0.35' : '1';
                    }
                }
            });

            item.addEventListener('mouseenter', () => {
                if (item.style.opacity !== '0.35') {
                    item.style.background = '#f3f4f6';
                }
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });

            legenda.appendChild(item);
        });

        return legenda;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUXILIARES
    // ═══════════════════════════════════════════════════════════════════════

    function mostrarErro(mensagem) {
        const container = document.getElementById('dashHospitalarContent');
        if (!container) return;

        container.innerHTML = `
            <div style="
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 0.5rem;
                padding: 1rem;
                color: #991b1b;
                text-align: center;
            ">
                <strong>⚠️ Erro:</strong> ${mensagem}
            </div>
        `;
    }

    console.log('✅ [DASHBOARD HOSPITALAR V3.3.2 CORRIGIDO] Carregado');
    console.log('📊 Gráficos: 1 por linha');
    console.log('📊 Concessões/Linhas: 1 barra por item');

})();
