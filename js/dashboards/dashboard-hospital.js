/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               DASHBOARD HOSPITALAR V3.3.2 - ARCHIPELAGO                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Cliente: Guilherme Santoro                                                ║
 * ║ Desenvolvedor: Alessandro Rodrigues                                       ║
 * ║ Data: 20/Outubro/2025                                                     ║
 * ║ Status: ✅ COMPLETO - CONFORME MANUAL V3.3.2                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * PRINCÍPIOS OBRIGATÓRIOS (DO MANUAL):
 * ✅ Zero mock - tudo de window.hospitalData
 * ✅ Função única: window.renderDashboardHospitalar(hospitalId = 'todos')
 * ✅ Ordem fixa: Neomater sempre primeiro
 * ✅ UI antiga: gauge meia-rosca como primeiro KPI
 * ✅ Legendas HTML: abaixo dos gráficos, 1 por linha, clicáveis
 * ✅ Barras verticais apenas
 * ✅ Sem "SP" no gráfico de Altas
 * ✅ Fallbacks: 0 (numérico), "—" (textual)
 * ✅ Cores oficiais: CORES_CONCESSOES e CORES_LINHAS
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURAÇÕES E CONSTANTES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Ordem fixa dos hospitais (Neomater sempre primeiro)
     */
    const ORDEM_HOSPITAIS = ['H1', 'H2', 'H3', 'H4', 'H5'];

    /**
     * Nomes dos hospitais
     */
    const NOMES_HOSPITAIS = {
        H1: 'Neomater',
        H2: 'Cruz Azul',
        H3: 'Santa Marcelina',
        H4: 'Santa Clara',
        H5: 'Hospital Adventista'
    };

    /**
     * Capacidades de enfermaria por hospital
     */
    const CAPACIDADE_ENFERMARIA = {
        H4: 4  // Santa Clara tem limite de 4 enfermarias
    };

    /**
     * Cores para o gauge de ocupação
     */
    const CORES_GAUGE = {
        baixo: '#10b981',    // Verde (<60%)
        medio: '#f59e0b',    // Laranja (60-79%)
        alto: '#ef4444'      // Vermelho (>=80%)
    };

    /**
     * Cores para gráfico de Altas (empilhado)
     */
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

    /**
     * Registros de gráficos Chart.js (para destroy)
     */
    const chartInstances = {};

    // ═══════════════════════════════════════════════════════════════════════
    // FUNÇÕES AUXILIARES - SANITIZAÇÃO E VALIDAÇÃO
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Retorna número seguro (0 se inválido)
     */
    function safeInt(v) {
        return Number.isFinite(+v) ? +v : 0;
    }

    /**
     * Retorna texto seguro ("—" se vazio)
     */
    function safeTxt(v) {
        return (v === null || v === undefined || v === '') ? '—' : String(v);
    }

    /**
     * Sanitiza objeto de KPIs
     */
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

    /**
     * Obtém cor de concessão
     */
    function corConcessao(nome) {
        return window.CORES_CONCESSOES?.[nome] || '#999999';
    }

    /**
     * Obtém cor de linha de cuidado
     */
    function corLinha(nome) {
        return window.CORES_LINHAS?.[nome] || '#999999';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FUNÇÃO PRINCIPAL - RENDERIZAÇÃO DO DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Renderiza dashboard hospitalar
     * @param {string} hospitalId - 'todos' ou código do hospital (H1-H5)
     */
    window.renderDashboardHospitalar = function(hospitalId = 'todos') {
        console.log('🏥 [DASHBOARD HOSPITALAR] Renderizando:', hospitalId);

        // Validar dados
        if (!window.hospitalData || Object.keys(window.hospitalData).length === 0) {
            mostrarErro('Nenhum dado disponível. Aguarde o carregamento dos dados.');
            return;
        }

        // Limpar container
        const container = document.getElementById('dashHospitalarContent');
        if (!container) {
            console.error('❌ Container #dashHospitalarContent não encontrado');
            return;
        }
        container.innerHTML = '';

        // Renderizar hospital(is)
        if (hospitalId === 'todos') {
            renderizarTodos(container);
        } else {
            renderizarSingle(container, hospitalId);
        }

        console.log('✅ [DASHBOARD HOSPITALAR] Renderização concluída');
    };

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERIZAÇÃO - TODOS OS HOSPITAIS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Renderiza todos os hospitais na ordem fixa
     */
    function renderizarTodos(container) {
        console.log('📊 Renderizando todos os hospitais...');

        ORDEM_HOSPITAIS.forEach(hospitalId => {
            if (window.hospitalData[hospitalId]) {
                const section = document.createElement('div');
                section.className = 'dashboard-hospital-section';
                section.style.marginBottom = '3rem';
                section.style.pageBreakAfter = 'always';

                renderizarHospital(section, hospitalId);
                container.appendChild(section);
            }
        });
    }

    /**
     * Renderiza um único hospital
     */
    function renderizarSingle(container, hospitalId) {
        console.log(`🏥 Renderizando hospital: ${hospitalId}`);

        if (!window.hospitalData[hospitalId]) {
            mostrarErro(`Hospital ${hospitalId} não encontrado`);
            return;
        }

        renderizarHospital(container, hospitalId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERIZAÇÃO - HOSPITAL INDIVIDUAL
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Renderiza um hospital completo (KPIs + gráficos)
     */
    function renderizarHospital(container, hospitalId) {
        const hospital = window.hospitalData[hospitalId];
        const leitos = hospital.leitos || [];
        
        // Calcular KPIs
        const kpis = calcularKPIs(leitos, hospitalId);
        const kpisSeguros = kpiSeguros(kpis);

        // Cabeçalho
        const header = criarCabecalho(hospitalId);
        container.appendChild(header);

        // KPIs linha 1
        const linha1 = criarKPIsLinha1(kpisSeguros);
        container.appendChild(linha1);

        // KPIs linha 2
        const linha2 = criarKPIsLinha2(kpisSeguros, hospitalId);
        container.appendChild(linha2);

        // Gráficos
        renderizarGraficos(container, leitos, hospitalId);
    }

    /**
     * Cria cabeçalho do hospital
     */
    function criarCabecalho(hospitalId) {
        const div = document.createElement('div');
        div.className = 'dashboard-header';
        div.style.cssText = `
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #e5e7eb;
        `;

        const titulo = document.createElement('h2');
        titulo.textContent = NOMES_HOSPITAIS[hospitalId] || hospitalId;
        titulo.style.cssText = `
            font-size: 1.875rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        `;

        div.appendChild(titulo);
        return div;
    }

    /**
     * Cria KPIs da linha 1 (5 boxes obrigatórios)
     */
    function criarKPIsLinha1(kpis) {
        const linha = document.createElement('div');
        linha.className = 'kpi-row-1';
        linha.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        `;

        // 1. Gauge de Ocupação
        linha.appendChild(criarKPIGauge(kpis.ocupacao));

        // 2. Total de leitos
        linha.appendChild(criarKPIBox('Total de Leitos', kpis.total, '#6366f1'));

        // 3. Ocupados
        linha.appendChild(criarKPIBox('Ocupados', kpis.ocupados, '#ef4444'));

        // 4. Vagos
        linha.appendChild(criarKPIBox('Vagos', kpis.vagos, '#10b981'));

        // 5. Em alta (hoje)
        linha.appendChild(criarKPIBox('Em alta (hoje)', kpis.altasHoje, '#f59e0b'));

        return linha;
    }

    /**
     * Cria KPIs da linha 2 (até 5 boxes, conforme hospital)
     */
    function criarKPIsLinha2(kpis, hospitalId) {
        const linha = document.createElement('div');
        linha.className = 'kpi-row-2';
        linha.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        `;

        // Apartamentos ocupados (se existir)
        if (kpis.aptoOcup > 0) {
            linha.appendChild(criarKPIBox('Apartamentos ocupados', kpis.aptoOcup, '#3b82f6'));
        }

        // Enfermarias ocupadas (se existir)
        if (kpis.enfOcup > 0) {
            linha.appendChild(criarKPIBox('Enfermarias ocupadas', kpis.enfOcup, '#8b5cf6'));
        }

        // Enfermarias disponíveis (só se houver capacidade)
        if (CAPACIDADE_ENFERMARIA[hospitalId] && kpis.enfDisp >= 0) {
            linha.appendChild(criarKPIBox('Enfermarias disponíveis', kpis.enfDisp, '#14b8a6'));
        }

        // Isolamentos
        const isolTotal = kpis.isolResp + kpis.isolContato;
        const kpiIsol = criarKPIBox('Isolamentos', isolTotal, '#dc2626');
        const subtitulo = document.createElement('div');
        subtitulo.style.cssText = `
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 0.25rem;
        `;
        subtitulo.textContent = `Resp: ${kpis.isolResp} | Contato: ${kpis.isolContato}`;
        kpiIsol.appendChild(subtitulo);
        linha.appendChild(kpiIsol);

        // Com diretivas
        linha.appendChild(criarKPIBox('Com diretivas', kpis.diretivas, '#f59e0b'));

        // Idade média
        linha.appendChild(criarKPIBox('Idade média', kpis.idadeMedia, '#6366f1'));

        return linha;
    }

    /**
     * Cria box KPI simples
     */
    function criarKPIBox(label, valor, cor) {
        const box = document.createElement('div');
        box.className = 'kpi-box';
        box.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid ${cor};
        `;

        const labelEl = document.createElement('div');
        labelEl.style.cssText = `
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
            font-weight: 500;
        `;
        labelEl.textContent = label;

        const valorEl = document.createElement('div');
        valorEl.style.cssText = `
            font-size: 2rem;
            font-weight: 700;
            color: ${cor};
        `;
        valorEl.textContent = safeTxt(valor);

        box.appendChild(labelEl);
        box.appendChild(valorEl);

        return box;
    }

    /**
     * Cria KPI com gauge meia-rosca (primeiro da linha 1)
     */
    function criarKPIGauge(ocupacao) {
        const box = document.createElement('div');
        box.className = 'kpi-box kpi-gauge';
        box.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const labelEl = document.createElement('div');
        labelEl.style.cssText = `
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 1rem;
            font-weight: 500;
            text-align: center;
        `;
        labelEl.textContent = 'Ocupação (%)';

        // Canvas para gauge
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 120;
        canvas.style.cssText = `
            width: 180px;
            height: 120px;
        `;

        // Valor centralizado
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

        // Desenhar gauge após adicionar ao DOM
        setTimeout(() => desenharGauge(canvas, ocupacao), 10);

        return box;
    }

    /**
     * Desenha gauge meia-rosca (180°)
     */
    function desenharGauge(canvas, valor) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 10;
        const radius = 70;
        const lineWidth = 18;

        // Limpar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo (cinza)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Arco colorido
        const endAngle = Math.PI + (Math.PI * valor / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = getCorOcupacao(valor);
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    /**
     * Retorna cor baseada no percentual de ocupação
     */
    function getCorOcupacao(ocupacao) {
        if (ocupacao < 60) return CORES_GAUGE.baixo;
        if (ocupacao < 80) return CORES_GAUGE.medio;
        return CORES_GAUGE.alto;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CÁLCULO DE KPIs
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calcula todos os KPIs do hospital
     */
    function calcularKPIs(leitos, hospitalId) {
        const total = leitos.length;
        const ocupados = leitos.filter(l => l.status === 'ocupado');
        const numOcupados = ocupados.length;
        const numVagos = total - numOcupados;
        const ocupacao = total > 0 ? Math.round((numOcupados / total) * 100) : 0;

        // Em alta hoje
        const altasHoje = ocupados.filter(l => 
            ['Hoje Ouro', 'Hoje 2R', 'Hoje 3R'].includes(l.prevAlta)
        ).length;

        // Apartamentos e enfermarias
        const aptoOcup = ocupados.filter(l => 
            l.categoria === 'Apartamento' || l.categoriaEscolhida === 'Apartamento'
        ).length;
        
        const enfOcup = ocupados.filter(l => 
            l.categoria === 'Enfermaria' || l.categoriaEscolhida === 'Enfermaria'
        ).length;

        // Enfermarias disponíveis
        let enfDisp = 0;
        if (CAPACIDADE_ENFERMARIA[hospitalId]) {
            enfDisp = CAPACIDADE_ENFERMARIA[hospitalId] - enfOcup;
        }

        // Isolamentos
        const isolResp = ocupados.filter(l => 
            l.isolamento === 'Isolamento Respiratório'
        ).length;

        const isolContato = ocupados.filter(l => 
            l.isolamento === 'Isolamento de Contato'
        ).length;

        // Diretivas
        const diretivas = ocupados.filter(l => l.diretivas === 'Sim').length;

        // Idade média
        const idades = ocupados.map(l => safeInt(l.idade)).filter(i => i > 0);
        const idadeMedia = idades.length > 0 
            ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length)
            : 0;

        return {
            total,
            ocupados: numOcupados,
            vagos: numVagos,
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
    // RENDERIZAÇÃO DE GRÁFICOS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Renderiza todos os gráficos do hospital
     */
    function renderizarGraficos(container, leitos, hospitalId) {
        const ocupados = leitos.filter(l => l.status === 'ocupado');
        
        const graficosContainer = document.createElement('div');
        graficosContainer.className = 'graficos-container';
        graficosContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        `;

        // 1. Análise preditiva de altas
        graficosContainer.appendChild(
            criarGraficoAltas(ocupados, hospitalId)
        );

        // 2. Concessões previstas
        graficosContainer.appendChild(
            criarGraficoConcessoes(ocupados, hospitalId)
        );

        // 3. Linhas de cuidado
        graficosContainer.appendChild(
            criarGraficoLinhas(ocupados, hospitalId)
        );

        // 4. Região (pizza)
        graficosContainer.appendChild(
            criarGraficoRegiao(ocupados, hospitalId)
        );

        // 5. Tipo de acomodação (pizza)
        graficosContainer.appendChild(
            criarGraficoTipo(ocupados, hospitalId)
        );

        container.appendChild(graficosContainer);
    }

    /**
     * Cria gráfico de Altas (barras empilhadas)
     */
    function criarGraficoAltas(ocupados, hospitalId) {
        const hoje = new Date();
        const dataStr = hoje.toLocaleDateString('pt-BR');

        // Agrupar por prazo
        const series = agruparPorPrazo(ocupados);

        // Build datasets
        const datasets = buildDatasetsAltas(series);

        // Container
        const wrapper = criarWrapperGrafico(
            `Análise preditiva de altas em ${dataStr}`,
            `grafico-altas-${hospitalId}`
        );

        // Renderizar
        const canvas = wrapper.querySelector('canvas');
        renderizarBarrasVerticais(
            canvas,
            ['Hoje', '24h', '48h', '72h', '96h'],
            datasets,
            'Beneficiários',
            `chart-altas-${hospitalId}`
        );

        // Legenda HTML
        const legenda = criarLegendaHTML(datasets, `chart-altas-${hospitalId}`);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    /**
     * Agrupa ocupados por prazo de alta
     */
    function agruparPorPrazo(ocupados) {
        const series = {
            'Hoje Ouro': 0, 'Hoje 2R': 0, 'Hoje 3R': 0,
            '24h Ouro': 0, '24h 2R': 0, '24h 3R': 0,
            '48h': 0, '72h': 0, '96h': 0
        };

        ocupados.forEach(l => {
            const prazo = l.prevAlta || '';
            if (series.hasOwnProperty(prazo)) {
                series[prazo]++;
            }
        });

        return series;
    }

    /**
     * Build datasets para gráfico de Altas
     */
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

        const mk = k => series[k] || 0;

        return [
            ...gruposHoje24.map(g => ({
                label: g.label,
                backgroundColor: g.color,
                stack: g.stack,
                data: [
                    g.chave.startsWith('Hoje') ? mk(g.chave) : 0,
                    g.chave.startsWith('24h') ? mk(g.chave) : 0,
                    0, 0, 0
                ]
            })),
            ...simples.map(s => ({
                label: s.label,
                backgroundColor: s.color,
                data: [
                    0, 0,
                    s.chave === '48h' ? mk('48h') : 0,
                    s.chave === '72h' ? mk('72h') : 0,
                    s.chave === '96h' ? mk('96h') : 0
                ]
            }))
        ];
    }

    /**
     * Cria gráfico de Concessões
     */
    function criarGraficoConcessoes(ocupados, hospitalId) {
        const hoje = new Date();
        const dataStr = hoje.toLocaleDateString('pt-BR');

        // Mapear concessões por prazo
        const mapaPrazo = mapearCategoriaPorPrazo(ocupados, 'concessoes');
        mapaPrazo.__tipo = 'concessao';

        // Build datasets
        const datasets = buildSeriesCategoria(mapaPrazo);

        // Container
        const wrapper = criarWrapperGrafico(
            `Concessões previstas em ${dataStr}`,
            `grafico-concessoes-${hospitalId}`
        );

        // Renderizar
        const canvas = wrapper.querySelector('canvas');
        renderizarBarrasVerticais(
            canvas,
            ['Hoje', '24h', '48h', '72h', '96h'],
            datasets,
            'Beneficiários',
            `chart-concessoes-${hospitalId}`
        );

        // Legenda HTML
        const legenda = criarLegendaHTML(datasets, `chart-concessoes-${hospitalId}`);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    /**
     * Cria gráfico de Linhas de Cuidado
     */
    function criarGraficoLinhas(ocupados, hospitalId) {
        const hoje = new Date();
        const dataStr = hoje.toLocaleDateString('pt-BR');

        // Mapear linhas por prazo
        const mapaPrazo = mapearCategoriaPorPrazo(ocupados, 'linhas');
        mapaPrazo.__tipo = 'linha';

        // Build datasets
        const datasets = buildSeriesCategoria(mapaPrazo);

        // Container
        const wrapper = criarWrapperGrafico(
            `Linhas de cuidado em ${dataStr}`,
            `grafico-linhas-${hospitalId}`
        );

        // Renderizar
        const canvas = wrapper.querySelector('canvas');
        renderizarBarrasVerticais(
            canvas,
            ['Hoje', '24h', '48h', '72h', '96h'],
            datasets,
            'Beneficiários',
            `chart-linhas-${hospitalId}`
        );

        // Legenda HTML
        const legenda = criarLegendaHTML(datasets, `chart-linhas-${hospitalId}`);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    /**
     * Mapeia categoria (concessões/linhas) por prazo
     */
    function mapearCategoriaPorPrazo(ocupados, campo) {
        const mapa = {};

        ocupados.forEach(l => {
            const prazo = normalizarPrazo(l.prevAlta);
            const lista = l[campo] || [];

            lista.forEach(item => {
                if (!mapa[item]) {
                    mapa[item] = { Hoje: 0, '24h': 0, '48h': 0, '72h': 0, '96h': 0 };
                }
                mapa[item][prazo]++;
            });
        });

        return mapa;
    }

    /**
     * Normaliza prazo para labels do gráfico
     */
    function normalizarPrazo(prevAlta) {
        if (!prevAlta) return 'SP';
        if (prevAlta.startsWith('Hoje')) return 'Hoje';
        if (prevAlta.startsWith('24h')) return '24h';
        if (prevAlta.startsWith('48h')) return '48h';
        if (prevAlta.startsWith('72h')) return '72h';
        if (prevAlta.startsWith('96h')) return '96h';
        return 'SP';
    }

    /**
     * Build datasets para concessões/linhas
     */
    function buildSeriesCategoria(mapaPrazo) {
        const tipo = mapaPrazo.__tipo;
        const chaves = Object.keys(mapaPrazo).filter(k => k !== '__tipo');

        return chaves.map(ch => ({
            label: ch,
            backgroundColor: tipo === 'concessao' ? corConcessao(ch) : corLinha(ch),
            data: [
                mapaPrazo[ch].Hoje || 0,
                mapaPrazo[ch]['24h'] || 0,
                mapaPrazo[ch]['48h'] || 0,
                mapaPrazo[ch]['72h'] || 0,
                mapaPrazo[ch]['96h'] || 0
            ]
        }));
    }

    /**
     * Cria gráfico de Região (pizza)
     */
    function criarGraficoRegiao(ocupados, hospitalId) {
        const hoje = new Date();
        const dataStr = hoje.toLocaleDateString('pt-BR');

        // Contar por região
        const contagem = {};
        ocupados.forEach(l => {
            const regiao = l.regiao || 'Não informado';
            contagem[regiao] = (contagem[regiao] || 0) + 1;
        });

        const labels = Object.keys(contagem);
        const values = Object.values(contagem);

        // Container
        const wrapper = criarWrapperGrafico(
            `Distribuição por região em ${dataStr}`,
            `grafico-regiao-${hospitalId}`
        );

        // Renderizar
        const canvas = wrapper.querySelector('canvas');
        renderizarPizza(
            canvas,
            labels,
            values,
            `chart-regiao-${hospitalId}`
        );

        // Legenda HTML
        const datasets = [{ label: 'Região', backgroundColor: gerarCoresPizza(labels.length) }];
        const legenda = criarLegendaHTML(datasets, `chart-regiao-${hospitalId}`, labels);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    /**
     * Cria gráfico de Tipo de Acomodação (pizza)
     */
    function criarGraficoTipo(ocupados, hospitalId) {
        const hoje = new Date();
        const dataStr = hoje.toLocaleDateString('pt-BR');

        // Contar por tipo
        const contagem = {};
        ocupados.forEach(l => {
            const tipo = l.categoria || l.categoriaEscolhida || 'Não informado';
            contagem[tipo] = (contagem[tipo] || 0) + 1;
        });

        const labels = Object.keys(contagem);
        const values = Object.values(contagem);

        // Container
        const wrapper = criarWrapperGrafico(
            `Tipo de acomodação em ${dataStr}`,
            `grafico-tipo-${hospitalId}`
        );

        // Renderizar
        const canvas = wrapper.querySelector('canvas');
        renderizarPizza(
            canvas,
            labels,
            values,
            `chart-tipo-${hospitalId}`
        );

        // Legenda HTML
        const datasets = [{ label: 'Tipo', backgroundColor: gerarCoresPizza(labels.length) }];
        const legenda = criarLegendaHTML(datasets, `chart-tipo-${hospitalId}`, labels);
        wrapper.appendChild(legenda);

        return wrapper;
    }

    /**
     * Gera cores para gráfico de pizza
     */
    function gerarCoresPizza(n) {
        const cores = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
            '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
        ];
        return Array.from({ length: n }, (_, i) => cores[i % cores.length]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FUNÇÕES DE RENDERIZAÇÃO DE GRÁFICOS (CHART.JS)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Cria wrapper para gráfico
     */
    function criarWrapperGrafico(titulo, id) {
        const wrapper = document.createElement('div');
        wrapper.className = 'grafico-wrapper';
        wrapper.style.cssText = `
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        canvas.style.cssText = `
            max-height: 280px;
        `;

        wrapper.appendChild(tituloEl);
        wrapper.appendChild(canvas);

        return wrapper;
    }

    /**
     * Renderiza gráfico de barras verticais
     */
    function renderizarBarrasVerticais(canvas, labels, datasets, yLabel, chartId) {
        // Destruir gráfico anterior se existir
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }

        const ctx = canvas.getContext('2d');
        chartInstances[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false  // Usando legenda HTML
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yLabel
                        }
                    }
                }
            }
        });
    }

    /**
     * Renderiza gráfico de pizza
     */
    function renderizarPizza(canvas, labels, values, chartId) {
        // Destruir gráfico anterior se existir
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }

        const ctx = canvas.getContext('2d');
        const cores = gerarCoresPizza(labels.length);

        chartInstances[chartId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: cores
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false  // Usando legenda HTML
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria legenda HTML clicável
     */
    function criarLegendaHTML(datasets, chartId, customLabels = null) {
        const legenda = document.createElement('ul');
        legenda.className = 'chart-legend';
        legenda.style.cssText = `
            list-style: none;
            padding: 0;
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
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
            `;

            const texto = document.createElement('span');
            texto.style.cssText = `
                font-size: 0.875rem;
                color: #374151;
            `;
            texto.textContent = label;

            item.appendChild(box);
            item.appendChild(texto);

            // Toggle ao clicar
            item.addEventListener('click', () => {
                const chart = chartInstances[chartId];
                if (chart) {
                    const meta = chart.getDatasetMeta(index);
                    meta.hidden = !meta.hidden;
                    chart.update();

                    // Atualizar opacidade
                    item.style.opacity = meta.hidden ? '0.35' : '1';
                }
            });

            // Hover
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
    // FUNÇÕES AUXILIARES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Mostra mensagem de erro
     */
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

    // ═══════════════════════════════════════════════════════════════════════
    // LOG DE INICIALIZAÇÃO
    // ═══════════════════════════════════════════════════════════════════════

    console.log('✅ [DASHBOARD HOSPITALAR V3.3.2] Módulo carregado');
    console.log('📋 Função disponível: window.renderDashboardHospitalar(hospitalId)');
    console.log('🎨 Cores oficiais: window.CORES_CONCESSOES e window.CORES_LINHAS');
    console.log('📊 Ordem fixa: Neomater sempre primeiro');

})();
