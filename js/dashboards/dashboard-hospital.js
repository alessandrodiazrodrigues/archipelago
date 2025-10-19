// =================== DASHBOARD-HOSPITAL.JS V3.3.2 ===================
// Sistema Archipelago - Dashboard Individual por Hospital
// Data: 19/Outubro/2024
// Desenvolvedor: Alessandro Rodrigues
// Cliente: Guilherme Santoro

// =================== CONFIGURAÇÃO GLOBAL ===================
const CONFIG_DASHBOARD_HOSPITAL = {
    REGIOES: [
        'Centro',
        'Zona Sul',
        'Zona Norte',
        'Zona Oeste',
        'Zona Leste',
        'Santo Amaro',
        'Vila Mariana',
        'Santana',
        'Pinheiros'
    ],
    FAIXAS_ETARIAS: ['0-20', '21-40', '41-60', '61-80', '80+'],
    ISOLAMENTO_TIPOS: [
        'Não Isolamento',
        'Isolamento de Contato',
        'Isolamento Respiratório'
    ],
    CORES: {
        MASCULINO: '#3b82f6',
        FEMININO: '#ec4899',
        APARTAMENTO: '#8b5cf6',
        ENFERMARIA: '#f59e0b',
        ISOLAMENTO_SIM: '#ef4444',
        ISOLAMENTO_NAO: '#10b981',
        DIRETIVAS_SIM: '#3b82f6',
        DIRETIVAS_NAO: '#6b7280',
        DIRETIVAS_NA: '#f59e0b',
        REGIAO: '#60a5fa',
        IDADE: 'rgba(96, 165, 250, 0.2)',
        IDADE_BORDER: '#60a5fa'
    }
};

// Instâncias dos gráficos
window.chartInstancesHospital = window.chartInstancesHospital || {};

// =================== FUNÇÃO PRINCIPAL ===================
window.renderDashboardHospitalar = function(hospitalId) {
    logInfo(`🏥 Renderizando Dashboard Hospitalar V3.3.2 - ${hospitalId}`);
    
    // 1. Validações
    if (!validarDadosHospital(hospitalId)) {
        logError(`Dados inválidos para hospital ${hospitalId}`);
        return;
    }
    
    // 2. Obter dados do hospital
    const dadosHospital = window.hospitalData[hospitalId];
    if (!dadosHospital || dadosHospital.length === 0) {
        renderizarHospitalVazio(hospitalId);
        return;
    }
    
    // 3. Calcular KPIs
    const kpis = calcularKPIsHospital(hospitalId, dadosHospital);
    
    // 4. Renderizar container principal
    renderizarContainerHospital(hospitalId, kpis);
    
    // 5. Renderizar gráficos (aguardar DOM estar pronto)
    setTimeout(() => {
        renderizarGraficosHospital(hospitalId, dadosHospital, kpis);
    }, 150);
    
    logSuccess(`✅ Dashboard Hospitalar ${hospitalId} renderizado com sucesso`);
};

// =================== VALIDAÇÕES ===================
function validarDadosHospital(hospitalId) {
    if (!hospitalId) {
        logError('hospitalId não fornecido');
        return false;
    }
    
    if (!CONFIG.HOSPITAIS[hospitalId]) {
        logError(`Hospital ${hospitalId} não encontrado na configuração`);
        return false;
    }
    
    if (!window.hospitalData) {
        logError('window.hospitalData não existe');
        return false;
    }
    
    return true;
}

// =================== CÁLCULO DE KPIs ===================
function calcularKPIsHospital(hospitalId, dadosHospital) {
    const kpis = {
        // Totais básicos
        totalLeitos: dadosHospital.length,
        leitosOcupados: 0,
        leitosVagos: 0,
        
        // Por tipo de quarto
        aptosOcupados: 0,
        enfermariasOcupadas: 0,
        aptosVagos: 0,
        enfermariasVagas: 0,
        
        // Isolamento
        isolamentoAtivos: 0,
        isolamentoContato: 0,
        isolamentoRespiratorio: 0,
        semIsolamento: 0,
        
        // Diretivas
        diretivasSim: 0,
        diretivasNao: 0,
        diretivasNA: 0,
        
        // PPS e SPICT
        ppsTotal: 0,
        ppsCont: 0,
        ppsMedia: 0,
        spictElegiveis: 0,
        spictNaoElegiveis: 0,
        
        // Por gênero
        masculino: 0,
        feminino: 0,
        
        // Por região
        porRegiao: {},
        
        // Por idade
        porIdade: {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '80+': 0
        },
        
        // Disponibilidade específica
        disponibilidade: null
    };
    
    // Inicializar contadores de região
    CONFIG_DASHBOARD_HOSPITAL.REGIOES.forEach(regiao => {
        kpis.porRegiao[regiao] = 0;
    });
    
    // Processar cada leito
    dadosHospital.forEach(leito => {
        const status = leito[3]; // coluna D (status)
        const categoria = leito[72]; // coluna BU (categoria_escolhida)
        const isolamento = leito[43]; // coluna AR (isolamento)
        const genero = leito[70]; // coluna BS (genero)
        const regiao = leito[71]; // coluna BT (regiao)
        const diretivas = leito[73]; // coluna BV (diretivas)
        const idade = leito[6]; // coluna G (idade)
        const pps = leito[8]; // coluna I (pps)
        const spict = leito[9]; // coluna J (spict)
        
        // Contar ocupação
        if (status === 'ocupado') {
            kpis.leitosOcupados++;
            
            // Contar por tipo
            if (categoria === 'Apartamento') {
                kpis.aptosOcupados++;
            } else if (categoria === 'Enfermaria') {
                kpis.enfermariasOcupadas++;
            }
            
            // Contar isolamento
            if (isolamento === 'Isolamento de Contato') {
                kpis.isolamentoContato++;
                kpis.isolamentoAtivos++;
            } else if (isolamento === 'Isolamento Respiratório') {
                kpis.isolamentoRespiratorio++;
                kpis.isolamentoAtivos++;
            } else {
                kpis.semIsolamento++;
            }
            
            // Contar diretivas
            if (diretivas === 'Sim') {
                kpis.diretivasSim++;
            } else if (diretivas === 'Não') {
                kpis.diretivasNao++;
            } else {
                kpis.diretivasNA++;
            }
            
            // Contar gênero
            if (genero === 'Masculino') {
                kpis.masculino++;
            } else if (genero === 'Feminino') {
                kpis.feminino++;
            }
            
            // Contar região
            if (regiao && kpis.porRegiao.hasOwnProperty(regiao)) {
                kpis.porRegiao[regiao]++;
            }
            
            // Contar idade
            if (idade !== undefined && idade !== null && idade !== '') {
                const idadeNum = parseInt(idade);
                if (!isNaN(idadeNum)) {
                    if (idadeNum <= 20) kpis.porIdade['0-20']++;
                    else if (idadeNum <= 40) kpis.porIdade['21-40']++;
                    else if (idadeNum <= 60) kpis.porIdade['41-60']++;
                    else if (idadeNum <= 80) kpis.porIdade['61-80']++;
                    else kpis.porIdade['80+']++;
                }
            }
            
            // Calcular PPS
            if (pps) {
                const ppsNum = parseInt(pps);
                if (!isNaN(ppsNum)) {
                    kpis.ppsTotal += ppsNum;
                    kpis.ppsCont++;
                }
            }
            
            // Contar SPICT
            if (spict === 'elegivel') {
                kpis.spictElegiveis++;
            } else if (spict === 'nao_elegivel') {
                kpis.spictNaoElegiveis++;
            }
            
        } else if (status === 'vago') {
            kpis.leitosVagos++;
            
            // Contar vagos por tipo (baseado no tipo fixo do leito)
            const tipoLeito = leito[2]; // coluna C (tipo)
            if (tipoLeito === 'Apartamento' || tipoLeito === 'APTO') {
                kpis.aptosVagos++;
            } else if (tipoLeito === 'Enfermaria' || tipoLeito === 'ENFERMARIA') {
                kpis.enfermariasVagas++;
            }
        }
    });
    
    // Calcular PPS médio
    if (kpis.ppsCont > 0) {
        kpis.ppsMedia = Math.round(kpis.ppsTotal / kpis.ppsCont);
    }
    
    // Calcular ocupação percentual
    kpis.ocupacaoPercent = kpis.totalLeitos > 0 
        ? Math.round((kpis.leitosOcupados / kpis.totalLeitos) * 100) 
        : 0;
    
    // Calcular disponibilidade específica por hospital
    kpis.disponibilidade = calcularDisponibilidadeHospital(hospitalId, dadosHospital, kpis);
    
    return kpis;
}

// =================== DISPONIBILIDADE POR HOSPITAL ===================
function calcularDisponibilidadeHospital(hospitalId, dadosHospital, kpis) {
    const disponibilidade = {
        tipo: '',
        dados: {}
    };
    
    if (hospitalId === 'H2') {
        // CRUZ AZUL - Enfermarias com bloqueio por gênero
        disponibilidade.tipo = 'cruz_azul';
        
        // Apartamentos: leitos 1-20
        const apartamentos = dadosHospital.filter(l => parseInt(l[1]) >= 1 && parseInt(l[1]) <= 20);
        const aptosDisponiveis = apartamentos.filter(l => l[3] === 'vago').length;
        
        // Enfermarias: leitos 21-36 (8 quartos duplos)
        const enfermarias = dadosHospital.filter(l => parseInt(l[1]) >= 21 && parseInt(l[1]) <= 36);
        const enfDisp = enfermarias.filter(l => l[3] === 'vago').length;
        
        // Calcular quartos disponíveis (ambos leitos vagos)
        const quartosDisponiveis = calcularQuartosDisponiveisCruzAzul(dadosHospital);
        
        // Calcular bloqueios
        const bloqueios = calcularBloqueiosCruzAzul(dadosHospital);
        
        disponibilidade.dados = {
            apartamentos: {
                total: 20,
                disponiveis: aptosDisponiveis
            },
            enfermarias: {
                total: 16,
                disponiveis: enfDisp
            },
            quartos: {
                total: 8,
                disponiveis: quartosDisponiveis
            },
            bloqueios: bloqueios
        };
        
    } else if (hospitalId === 'H4') {
        // SANTA CLARA - Limite de 4 enfermarias
        disponibilidade.tipo = 'santa_clara';
        
        // Apartamentos: leitos 1-9
        const apartamentos = dadosHospital.filter(l => parseInt(l[1]) >= 1 && parseInt(l[1]) <= 9);
        const aptosDisponiveis = apartamentos.filter(l => l[3] === 'vago').length;
        
        // Enfermarias: leitos 10-13 (máximo 4 ocupadas)
        const enfermarias = dadosHospital.filter(l => parseInt(l[1]) >= 10 && parseInt(l[1]) <= 13);
        const enfOcupadas = enfermarias.filter(l => l[3] === 'ocupado' && l[72] === 'Enfermaria').length;
        const enfDisp = 4 - enfOcupadas;
        const bloqueado = enfOcupadas >= 4;
        
        disponibilidade.dados = {
            apartamentos: {
                total: 9,
                disponiveis: aptosDisponiveis
            },
            enfermarias: {
                total: 4,
                ocupadas: enfOcupadas,
                disponiveis: Math.max(0, enfDisp),
                bloqueado: bloqueado
            }
        };
        
    } else {
        // HOSPITAIS HÍBRIDOS (H1, H3, H5) - Sem restrições
        disponibilidade.tipo = 'hibrido';
        
        // Contar escolhas dos médicos nos leitos ocupados
        const comoApartamento = dadosHospital.filter(l => 
            l[3] === 'ocupado' && l[72] === 'Apartamento'
        ).length;
        
        const comoEnfermaria = dadosHospital.filter(l => 
            l[3] === 'ocupado' && l[72] === 'Enfermaria'
        ).length;
        
        disponibilidade.dados = {
            totalLeitos: kpis.totalLeitos,
            disponiveis: kpis.leitosVagos,
            ocupadosComoApartamento: comoApartamento,
            ocupadosComoEnfermaria: comoEnfermaria
        };
    }
    
    return disponibilidade;
}

// Calcular quartos disponíveis no Cruz Azul (ambos leitos vagos)
function calcularQuartosDisponiveisCruzAzul(dadosHospital) {
    const quartos = [
        [21, 22], [23, 24], [25, 26], [27, 28],
        [29, 30], [31, 32], [33, 34], [35, 36]
    ];
    
    let quartosDisponiveis = 0;
    
    quartos.forEach(([leito1, leito2]) => {
        const l1 = dadosHospital.find(l => parseInt(l[1]) === leito1);
        const l2 = dadosHospital.find(l => parseInt(l[1]) === leito2);
        
        if (l1 && l2 && l1[3] === 'vago' && l2[3] === 'vago') {
            quartosDisponiveis++;
        }
    });
    
    return quartosDisponiveis;
}

// Calcular bloqueios do Cruz Azul
function calcularBloqueiosCruzAzul(dadosHospital) {
    let bloqueioIsolamento = 0;
    let bloqueioGenero = 0;
    
    const quartos = [
        [21, 22], [23, 24], [25, 26], [27, 28],
        [29, 30], [31, 32], [33, 34], [35, 36]
    ];
    
    quartos.forEach(([leito1, leito2]) => {
        const l1 = dadosHospital.find(l => parseInt(l[1]) === leito1);
        const l2 = dadosHospital.find(l => parseInt(l[1]) === leito2);
        
        if (l1 && l2) {
            // Verificar isolamento (prioridade 1)
            if (l1[3] === 'ocupado' && l1[43] !== 'Não Isolamento' && l2[3] === 'vago') {
                bloqueioIsolamento++;
            } else if (l2[3] === 'ocupado' && l2[43] !== 'Não Isolamento' && l1[3] === 'vago') {
                bloqueioIsolamento++;
            }
            // Verificar gênero (prioridade 2)
            else if (l1[3] === 'ocupado' && l2[3] === 'vago' && l1[70]) {
                bloqueioGenero++;
            } else if (l2[3] === 'ocupado' && l1[3] === 'vago' && l2[70]) {
                bloqueioGenero++;
            }
        }
    });
    
    return {
        isolamento: bloqueioIsolamento,
        genero: bloqueioGenero,
        total: bloqueioIsolamento + bloqueioGenero
    };
}

// =================== RENDERIZAÇÃO DO CONTAINER ===================
function renderizarContainerHospital(hospitalId, kpis) {
    const container = document.getElementById('dashHospitalarContent');
    if (!container) {
        logError('Container dashHospitalarContent não encontrado');
        return;
    }
    
    const nomeHospital = CONFIG.HOSPITAIS[hospitalId].nome;
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div class="dashboard-hospitalar-v332">
            <!-- Header -->
            <div class="dashboard-header">
                <h2 style="text-align: center; color: #1a1f2e; margin-bottom: 15px; font-size: 24px; font-weight: 700;">
                    🏥 Dashboard - ${nomeHospital}
                </h2>
                <div style="background: #e6f3ff; border: 2px solid #0066cc; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 25px;">
                    <p style="margin: 0; color: #0066cc; font-weight: 600; font-size: 14px;">
                        📊 Dados V3.3.2 da planilha Google (74 colunas) • ${kpis.leitosOcupados} pacientes • ${hoje}
                    </p>
                </div>
            </div>
            
            <!-- KPIs Grid Responsivo -->
            <div class="kpis-grid-hospital">
                ${renderizarKPIsGrid(kpis)}
            </div>
            
            <!-- Card de Disponibilidade -->
            ${renderizarCardDisponibilidade(hospitalId, kpis)}
            
            <!-- Gráficos -->
            <div class="charts-grid-hospital">
                ${renderizarCanvasGraficos()}
            </div>
        </div>
        
        <style>
            .dashboard-hospitalar-v332 {
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .kpis-grid-hospital {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 25px;
            }
            
            .kpi-card-hospital {
                background: #1a1f2e;
                color: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                transition: transform 0.2s;
            }
            
            .kpi-card-hospital:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .kpi-valor {
                font-size: 32px;
                font-weight: 700;
                color: #60a5fa;
                margin-bottom: 8px;
            }
            
            .kpi-label {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                color: #e2e8f0;
                letter-spacing: 0.5px;
            }
            
            .disponibilidade-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 25px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .disponibilidade-titulo {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .disponibilidade-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .disponibilidade-item {
                background: rgba(255,255,255,0.15);
                padding: 15px;
                border-radius: 8px;
                backdrop-filter: blur(10px);
            }
            
            .disponibilidade-item-titulo {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                opacity: 0.9;
                margin-bottom: 8px;
            }
            
            .disponibilidade-item-valor {
                font-size: 24px;
                font-weight: 700;
            }
            
            .bloqueios-alert {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.5);
                padding: 12px;
                border-radius: 8px;
                margin-top: 15px;
            }
            
            .bloqueios-alert-titulo {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .charts-grid-hospital {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-top: 25px;
            }
            
            .chart-container-hospital {
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .chart-titulo {
                font-size: 16px;
                font-weight: 700;
                color: #1a1f2e;
                margin-bottom: 15px;
                text-align: center;
            }
            
            /* Responsividade - Tablet */
            @media (max-width: 1023px) {
                .kpis-grid-hospital {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .charts-grid-hospital {
                    grid-template-columns: 1fr;
                }
            }
            
            /* Responsividade - Mobile */
            @media (max-width: 767px) {
                .dashboard-hospitalar-v332 {
                    padding: 15px;
                }
                
                .kpis-grid-hospital {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                
                .kpi-card-hospital {
                    padding: 15px;
                }
                
                .kpi-valor {
                    font-size: 24px;
                }
                
                .kpi-label {
                    font-size: 10px;
                }
                
                .disponibilidade-card {
                    padding: 20px;
                }
                
                .charts-grid-hospital {
                    gap: 15px;
                }
                
                .chart-container-hospital {
                    padding: 15px;
                }
            }
        </style>
    `;
}

// =================== RENDERIZAÇÃO DOS KPIs ===================
function renderizarKPIsGrid(kpis) {
    return `
        <!-- Linha 1: KPIs Principais -->
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.ocupacaoPercent}%</div>
            <div class="kpi-label">Ocupação Geral</div>
        </div>
        
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.leitosVagos}</div>
            <div class="kpi-label">Leitos Vagos</div>
        </div>
        
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.aptosOcupados}</div>
            <div class="kpi-label">Apartamentos</div>
        </div>
        
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.enfermariasOcupadas}</div>
            <div class="kpi-label">Enfermarias</div>
        </div>
        
        <!-- Linha 2: KPIs Secundários -->
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.isolamentoAtivos}</div>
            <div class="kpi-label">Isolamento Ativo</div>
        </div>
        
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.ppsMedia}</div>
            <div class="kpi-label">PPS Médio</div>
        </div>
        
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.spictElegiveis}</div>
            <div class="kpi-label">SPICT Elegível</div>
        </div>
        
        <div class="kpi-card-hospital">
            <div class="kpi-valor">${kpis.diretivasSim}</div>
            <div class="kpi-label">Diretivas Sim</div>
        </div>
    `;
}

// =================== CARD DE DISPONIBILIDADE ===================
function renderizarCardDisponibilidade(hospitalId, kpis) {
    const disp = kpis.disponibilidade;
    
    if (disp.tipo === 'cruz_azul') {
        return `
            <div class="disponibilidade-card">
                <div class="disponibilidade-titulo">
                    📊 Disponibilidade Detalhada - Cruz Azul
                </div>
                <div class="disponibilidade-grid">
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Apartamentos</div>
                        <div class="disponibilidade-item-valor">${disp.dados.apartamentos.disponiveis}/${disp.dados.apartamentos.total}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Enfermarias</div>
                        <div class="disponibilidade-item-valor">${disp.dados.enfermarias.disponiveis}/${disp.dados.enfermarias.total}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Quartos Duplos</div>
                        <div class="disponibilidade-item-valor">${disp.dados.quartos.disponiveis}/${disp.dados.quartos.total}</div>
                    </div>
                </div>
                ${disp.dados.bloqueios.total > 0 ? `
                    <div class="bloqueios-alert">
                        <div class="bloqueios-alert-titulo">⚠️ Bloqueios Ativos</div>
                        <div style="font-size: 13px; opacity: 0.95;">
                            • <strong>Isolamento:</strong> ${disp.dados.bloqueios.isolamento} leito(s)<br>
                            • <strong>Gênero incompatível:</strong> ${disp.dados.bloqueios.genero} leito(s)<br>
                            • <strong>Total bloqueado:</strong> ${disp.dados.bloqueios.total} leito(s)
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else if (disp.tipo === 'santa_clara') {
        return `
            <div class="disponibilidade-card">
                <div class="disponibilidade-titulo">
                    📊 Disponibilidade Detalhada - Santa Clara
                </div>
                <div class="disponibilidade-grid">
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Apartamentos</div>
                        <div class="disponibilidade-item-valor">${disp.dados.apartamentos.disponiveis}/${disp.dados.apartamentos.total}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Enfermarias Ocupadas</div>
                        <div class="disponibilidade-item-valor">${disp.dados.enfermarias.ocupadas}/${disp.dados.enfermarias.total}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Enfermarias Disponíveis</div>
                        <div class="disponibilidade-item-valor">${disp.dados.enfermarias.disponiveis}</div>
                    </div>
                </div>
                ${disp.dados.enfermarias.bloqueado ? `
                    <div class="bloqueios-alert">
                        <div class="bloqueios-alert-titulo">⚠️ Limite Atingido</div>
                        <div style="font-size: 13px; opacity: 0.95;">
                            Máximo de 4 enfermarias atingido. Novas admissões devem ser como apartamento.
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Hospitais híbridos
        return `
            <div class="disponibilidade-card">
                <div class="disponibilidade-titulo">
                    📊 Disponibilidade Detalhada - Hospital Híbrido
                </div>
                <div class="disponibilidade-grid">
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Total de Leitos</div>
                        <div class="disponibilidade-item-valor">${disp.dados.totalLeitos}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Leitos Disponíveis</div>
                        <div class="disponibilidade-item-valor">${disp.dados.disponiveis}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Como Apartamento</div>
                        <div class="disponibilidade-item-valor">${disp.dados.ocupadosComoApartamento}</div>
                    </div>
                    <div class="disponibilidade-item">
                        <div class="disponibilidade-item-titulo">Como Enfermaria</div>
                        <div class="disponibilidade-item-valor">${disp.dados.ocupadosComoEnfermaria}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// =================== RENDERIZAÇÃO DOS CANVAS DOS GRÁFICOS ===================
function renderizarCanvasGraficos() {
    return `
        <div class="chart-container-hospital">
            <div class="chart-titulo">👥 Ocupação por Gênero</div>
            <canvas id="chartGeneroHospital"></canvas>
        </div>
        
        <div class="chart-container-hospital">
            <div class="chart-titulo">📍 Distribuição por Região</div>
            <canvas id="chartRegiaoHospital"></canvas>
        </div>
        
        <div class="chart-container-hospital">
            <div class="chart-titulo">📅 Distribuição por Idade</div>
            <canvas id="chartIdadeHospital"></canvas>
        </div>
        
        <div class="chart-container-hospital">
            <div class="chart-titulo">🦠 Status de Isolamento</div>
            <canvas id="chartIsolamentoHospital"></canvas>
        </div>
        
        <div class="chart-container-hospital">
            <div class="chart-titulo">📋 Diretivas Antecipadas</div>
            <canvas id="chartDiretivasHospital"></canvas>
        </div>
    `;
}

// =================== RENDERIZAÇÃO DOS GRÁFICOS ===================
function renderizarGraficosHospital(hospitalId, dadosHospital, kpis) {
    destruirGraficosAnteriores();
    
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        logError('Chart.js não carregado');
        return;
    }
    
    try {
        renderizarGraficoGenero(kpis);
        renderizarGraficoRegiao(kpis);
        renderizarGraficoIdade(kpis);
        renderizarGraficoIsolamento(kpis);
        renderizarGraficoDiretivas(kpis);
        
        logSuccess('Todos os gráficos renderizados com sucesso');
    } catch (error) {
        logError(`Erro ao renderizar gráficos: ${error.message}`);
    }
}

// Destruir gráficos anteriores
function destruirGraficosAnteriores() {
    Object.keys(window.chartInstancesHospital).forEach(key => {
        if (window.chartInstancesHospital[key]) {
            window.chartInstancesHospital[key].destroy();
            delete window.chartInstancesHospital[key];
        }
    });
}

// =================== GRÁFICO: GÊNERO ===================
function renderizarGraficoGenero(kpis) {
    const canvas = document.getElementById('chartGeneroHospital');
    if (!canvas) {
        logError('Canvas chartGeneroHospital não encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    window.chartInstancesHospital.genero = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Masculino', 'Feminino'],
            datasets: [{
                label: 'Pacientes',
                data: [kpis.masculino, kpis.feminino],
                backgroundColor: [
                    CONFIG_DASHBOARD_HOSPITAL.CORES.MASCULINO,
                    CONFIG_DASHBOARD_HOSPITAL.CORES.FEMININO
                ],
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    ticks: {
                        font: { size: 13, weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    logSuccess('Gráfico de gênero renderizado');
}

// =================== GRÁFICO: REGIÃO ===================
function renderizarGraficoRegiao(kpis) {
    const canvas = document.getElementById('chartRegiaoHospital');
    if (!canvas) {
        logError('Canvas chartRegiaoHospital não encontrado');
        return;
    }
    
    const labels = CONFIG_DASHBOARD_HOSPITAL.REGIOES;
    const dados = labels.map(regiao => kpis.porRegiao[regiao] || 0);
    
    const ctx = canvas.getContext('2d');
    window.chartInstancesHospital.regiao = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: dados,
                backgroundColor: CONFIG_DASHBOARD_HOSPITAL.CORES.REGIAO,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 11 },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    logSuccess('Gráfico de região renderizado');
}

// =================== GRÁFICO: IDADE (ÁREA) ===================
function renderizarGraficoIdade(kpis) {
    const canvas = document.getElementById('chartIdadeHospital');
    if (!canvas) {
        logError('Canvas chartIdadeHospital não encontrado');
        return;
    }
    
    const labels = CONFIG_DASHBOARD_HOSPITAL.FAIXAS_ETARIAS;
    const dados = labels.map(faixa => kpis.porIdade[faixa] || 0);
    
    const ctx = canvas.getContext('2d');
    window.chartInstancesHospital.idade = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: dados,
                fill: true,
                backgroundColor: CONFIG_DASHBOARD_HOSPITAL.CORES.IDADE,
                borderColor: CONFIG_DASHBOARD_HOSPITAL.CORES.IDADE_BORDER,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: CONFIG_DASHBOARD_HOSPITAL.CORES.IDADE_BORDER,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 12, weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    logSuccess('Gráfico de idade (área) renderizado');
}

// =================== GRÁFICO: ISOLAMENTO ===================
function renderizarGraficoIsolamento(kpis) {
    const canvas = document.getElementById('chartIsolamentoHospital');
    if (!canvas) {
        logError('Canvas chartIsolamentoHospital não encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    window.chartInstancesHospital.isolamento = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sem Isolamento', 'Contato', 'Respiratório'],
            datasets: [{
                label: 'Pacientes',
                data: [
                    kpis.semIsolamento,
                    kpis.isolamentoContato,
                    kpis.isolamentoRespiratorio
                ],
                backgroundColor: [
                    CONFIG_DASHBOARD_HOSPITAL.CORES.ISOLAMENTO_NAO,
                    '#f59e0b',
                    CONFIG_DASHBOARD_HOSPITAL.CORES.ISOLAMENTO_SIM
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 12, weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    logSuccess('Gráfico de isolamento renderizado');
}

// =================== GRÁFICO: DIRETIVAS ===================
function renderizarGraficoDiretivas(kpis) {
    const canvas = document.getElementById('chartDiretivasHospital');
    if (!canvas) {
        logError('Canvas chartDiretivasHospital não encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    window.chartInstancesHospital.diretivas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sim', 'Não', 'Não se Aplica'],
            datasets: [{
                label: 'Pacientes',
                data: [
                    kpis.diretivasSim,
                    kpis.diretivasNao,
                    kpis.diretivasNA
                ],
                backgroundColor: [
                    CONFIG_DASHBOARD_HOSPITAL.CORES.DIRETIVAS_SIM,
                    CONFIG_DASHBOARD_HOSPITAL.CORES.DIRETIVAS_NAO,
                    CONFIG_DASHBOARD_HOSPITAL.CORES.DIRETIVAS_NA
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { size: 12, weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12 }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    logSuccess('Gráfico de diretivas renderizado');
}

// =================== RENDERIZAR HOSPITAL VAZIO ===================
function renderizarHospitalVazio(hospitalId) {
    const container = document.getElementById('dashHospitalarContent');
    if (!container) return;
    
    const nomeHospital = CONFIG.HOSPITAIS[hospitalId].nome;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2 style="color: #1a1f2e; margin-bottom: 20px;">🏥 ${nomeHospital}</h2>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
                <h3 style="color: #6c757d; margin-bottom: 15px;">📋 Aguardando Dados</h3>
                <p style="color: #666;">Nenhum paciente registrado neste hospital.</p>
                <p style="color: #28a745; margin-top: 15px;">✅ Sistema V3.3.2 operacional</p>
            </div>
        </div>
    `;
}

// =================== SISTEMA DE LOGS ===================
function logInfo(message) {
    console.log(`🔷 [DASHBOARD-HOSPITAL V3.3.2] ${message}`);
}

function logSuccess(message) {
    console.log(`✅ [DASHBOARD-HOSPITAL V3.3.2] ${message}`);
}

function logError(message) {
    console.error(`❌ [DASHBOARD-HOSPITAL V3.3.2] ${message}`);
}

// =================== LOG DE INICIALIZAÇÃO ===================
console.log('🚀 Dashboard-Hospital.js V3.3.2 carregado com sucesso');
console.log('📊 Novos campos implementados: Gênero, Região, Categoria, Diretivas');
console.log('📈 5 gráficos: Gênero (barras H), Região (barras V), Idade (área), Isolamento (barras), Diretivas (barras)');
console.log('🏥 Disponibilidade inteligente: Cruz Azul (bloqueios), Santa Clara (limite 4), Híbridos (sem restrição)');
