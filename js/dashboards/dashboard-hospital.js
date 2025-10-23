// =================== DASHBOARD HOSPITALAR V3.2 - SISTEMA DE 3 CARDS ===================
// Data: Janeiro/2025
// Sistema: Archipelago Dashboard V3.2
// Cliente: Guilherme Santoro
// Desenvolvedor: Alessandro Rodrigues

console.log('🏥 Dashboard Hospitalar V3.2 - Sistema de 3 Cards Carregado');
console.log('✅ H1 - Neomater (10 leitos híbridos)');
console.log('✅ H2 - Cruz Azul (36 leitos com bloqueio por gênero)');
console.log('✅ H3 - Santa Marcelina (7 leitos híbridos)');
console.log('✅ H4 - Santa Clara (13 leitos com limite 4 enfermarias)');
console.log('✅ H5 - Adventista (13 leitos híbridos)');

// =================== FUNÇÕES DE CÁLCULO POR HOSPITAL ===================

/**
 * H1 - NEOMATER (HÍBRIDOS)
 * Total: 10 leitos
 * Regra: Médico escolhe Apartamento OU Enfermaria ao admitir
 * Campo BU: OBRIGATÓRIO
 */
function calcularLeitosH1(dados) {
  const leitos = dados.filter(l => l.hospital === 'H1');

  // 1. OCUPADOS
  const ocupados = leitos.filter(l => l.status === 'ocupado');

  const aptos_ocupados = ocupados.filter(l =>
    l.categoriaEscolhida === 'Apartamento' ||
    l.categoriaEscolhida === 'APT'
  ).length;

  const enf_fem_ocupadas = ocupados.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Feminino'
  ).length;

  const enf_masc_ocupadas = ocupados.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Masculino'
  ).length;

  // 2. PREVISÃO DE ALTA
  const alta = leitos.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  );

  const alta_aptos = alta.filter(l =>
    l.categoriaEscolhida === 'Apartamento' ||
    l.categoriaEscolhida === 'APT'
  ).length;

  const alta_enf_fem = alta.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Feminino'
  ).length;

  const alta_enf_masc = alta.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Masculino'
  ).length;

  // 3. DISPONÍVEIS
  const vagos = leitos.filter(l => l.status === 'vago').length;

  return {
    ocupados: {
      total: ocupados.length,
      apartamento: aptos_ocupados,
      enf_feminina: enf_fem_ocupadas,
      enf_masculina: enf_masc_ocupadas,
      detalhado: {
        flexiveis: ocupados.length,  // TODOS são flexíveis
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    previsao_alta: {
      total: alta.length,
      apartamento: alta_aptos,
      enf_feminina: alta_enf_fem,
      enf_masculina: alta_enf_masc,
      detalhado: {
        flexiveis: alta.length,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    disponiveis: {
      total: vagos,
      capacidade_nao_simultanea: {
        apartamento: vagos,      // Todos podem virar apto
        enf_feminina: vagos,     // Todos podem virar enf fem
        enf_masculina: vagos     // Todos podem virar enf masc
      },
      detalhado: {
        flexiveis: vagos,        // TODOS são flexíveis
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    }
  };
}

/**
 * H2 - CRUZ AZUL (BLOQUEIO POR GÊNERO)
 * Total: 36 leitos
 * Apartamentos: 20 leitos (1-20) - FIXOS
 * Enfermarias: 16 leitos (21-36) - 8 quartos
 * Regra: Leitos irmãos devem ter mesmo gênero + Isolamento bloqueia leito irmão
 */
function calcularLeitosH2(dados) {
  const leitos = dados.filter(l => l.hospital === 'H2');

  // 1. APARTAMENTOS (1-20)
  const aptos = leitos.filter(l => l.leito >= 1 && l.leito <= 20);
  const aptos_ocupados = aptos.filter(l => l.status === 'ocupado').length;
  const aptos_alta = aptos.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  ).length;
  const aptos_vagos = 20 - aptos_ocupados;

  // 2. ENFERMARIAS (21-36)
  const enfermarias = leitos.filter(l => l.leito >= 21 && l.leito <= 36);

  const enf_ocupadas = enfermarias.filter(l => l.status === 'ocupado');

  const enf_fem_ocupadas = enf_ocupadas.filter(l =>
    l.genero === 'Feminino'
  ).length;

  const enf_masc_ocupadas = enf_ocupadas.filter(l =>
    l.genero === 'Masculino'
  ).length;

  const enf_alta = enfermarias.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  );

  const enf_fem_alta = enf_alta.filter(l =>
    l.genero === 'Feminino'
  ).length;

  const enf_masc_alta = enf_alta.filter(l =>
    l.genero === 'Masculino'
  ).length;

  // 3. CALCULAR BLOQUEIOS E CAPACIDADES
  const capacidades = calcularEnfermariasDisponiveisH2(enfermarias);

  return {
    ocupados: {
      total: aptos_ocupados + enf_ocupadas.length,
      apartamento: aptos_ocupados,
      enf_feminina: enf_fem_ocupadas,
      enf_masculina: enf_masc_ocupadas,
      detalhado: {
        flexiveis: 0,                    // Cruz Azul não tem flexíveis
        exclusivo_apto: aptos_ocupados,
        exclusivo_enf_sem_restricao: 0,  // Todas têm restrição
        exclusivo_enf_fem: enf_fem_ocupadas,
        exclusivo_enf_masc: enf_masc_ocupadas
      }
    },
    previsao_alta: {
      total: aptos_alta + enf_alta.length,
      apartamento: aptos_alta,
      enf_feminina: enf_fem_alta,
      enf_masculina: enf_masc_alta,
      detalhado: {
        flexiveis: 0,
        exclusivo_apto: aptos_alta,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: enf_fem_alta,
        exclusivo_enf_masc: enf_masc_alta
      }
    },
    disponiveis: {
      total: aptos_vagos + capacidades.total_vagos,
      capacidade_nao_simultanea: {
        apartamento: aptos_vagos,
        enf_feminina: capacidades.capacidade_feminina,
        enf_masculina: capacidades.capacidade_masculina
      },
      detalhado: {
        flexiveis: 0,
        exclusivo_apto: aptos_vagos,
        exclusivo_enf_sem_restricao: capacidades.sem_restricao,
        exclusivo_enf_fem: capacidades.so_feminino,
        exclusivo_enf_masc: capacidades.so_masculino
      }
    }
  };
}

/**
 * Função auxiliar para calcular enfermarias disponíveis H2
 * Considera bloqueio por gênero e isolamento
 */
function calcularEnfermariasDisponiveisH2(enfermarias) {
  const quartos = [
    {num: 711, leitos: [21, 22]},
    {num: 713, leitos: [23, 24]},
    {num: 715, leitos: [25, 26]},
    {num: 717, leitos: [27, 28]},
    {num: 719, leitos: [29, 30]},
    {num: 721, leitos: [31, 32]},
    {num: 723, leitos: [33, 34]},
    {num: 725, leitos: [35, 36]}
  ];

  let total_vagos = 0;
  let sem_restricao = 0;        // Quartos totalmente vazios
  let so_feminino = 0;          // Vago bloqueado só para feminino
  let so_masculino = 0;         // Vago bloqueado só para masculino
  let bloqueado_isolamento = 0; // Vago mas bloqueado por isolamento

  quartos.forEach(quarto => {
    const leito1 = enfermarias.find(l => l.leito === quarto.leitos[0]);
    const leito2 = enfermarias.find(l => l.leito === quarto.leitos[1]);

    if (!leito1 || !leito2) return;

    const vago1 = leito1.status === 'vago';
    const vago2 = leito2.status === 'vago';

    // AMBOS VAGOS → sem restrição
    if (vago1 && vago2) {
      total_vagos += 2;
      sem_restricao += 2;
    }
    // APENAS 1 VAGO
    else if (vago1 || vago2) {
      total_vagos += 1;

      const ocupado = vago1 ? leito2 : leito1;

      // PRIORIDADE 1: Isolamento bloqueia
      if (ocupado.isolamento && ocupado.isolamento !== 'Não Isolamento') {
        bloqueado_isolamento += 1;
        // NÃO conta em nenhuma categoria de gênero
      }
      // PRIORIDADE 2: Gênero define restrição
      else {
        if (ocupado.genero === 'Feminino') {
          so_feminino += 1;
        } else if (ocupado.genero === 'Masculino') {
          so_masculino += 1;
        }
      }
    }
    // AMBOS OCUPADOS → não conta
  });

  return {
    total_vagos: total_vagos,
    sem_restricao: sem_restricao,
    so_feminino: so_feminino,
    so_masculino: so_masculino,
    bloqueado_isolamento: bloqueado_isolamento,
    capacidade_feminina: sem_restricao + so_feminino,
    capacidade_masculina: sem_restricao + so_masculino
  };
}

/**
 * H3 - SANTA MARCELINA (HÍBRIDOS)
 * Total: 7 leitos
 * Regra: Médico escolhe Apartamento OU Enfermaria ao admitir
 * Campo BU: OBRIGATÓRIO
 * Lógica IDÊNTICA ao H1, apenas muda o total de leitos
 */
function calcularLeitosH3(dados) {
  const leitos = dados.filter(l => l.hospital === 'H3');

  // 1. OCUPADOS
  const ocupados = leitos.filter(l => l.status === 'ocupado');

  const aptos_ocupados = ocupados.filter(l =>
    l.categoriaEscolhida === 'Apartamento' ||
    l.categoriaEscolhida === 'APT'
  ).length;

  const enf_fem_ocupadas = ocupados.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Feminino'
  ).length;

  const enf_masc_ocupadas = ocupados.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Masculino'
  ).length;

  // 2. PREVISÃO DE ALTA
  const alta = leitos.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  );

  const alta_aptos = alta.filter(l =>
    l.categoriaEscolhida === 'Apartamento' ||
    l.categoriaEscolhida === 'APT'
  ).length;

  const alta_enf_fem = alta.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Feminino'
  ).length;

  const alta_enf_masc = alta.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Masculino'
  ).length;

  // 3. DISPONÍVEIS
  const vagos = leitos.filter(l => l.status === 'vago').length;

  return {
    ocupados: {
      total: ocupados.length,
      apartamento: aptos_ocupados,
      enf_feminina: enf_fem_ocupadas,
      enf_masculina: enf_masc_ocupadas,
      detalhado: {
        flexiveis: ocupados.length,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    previsao_alta: {
      total: alta.length,
      apartamento: alta_aptos,
      enf_feminina: alta_enf_fem,
      enf_masculina: alta_enf_masc,
      detalhado: {
        flexiveis: alta.length,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    disponiveis: {
      total: vagos,
      capacidade_nao_simultanea: {
        apartamento: vagos,
        enf_feminina: vagos,
        enf_masculina: vagos
      },
      detalhado: {
        flexiveis: vagos,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    }
  };
}

/**
 * H4 - SANTA CLARA (LIMITE 4 ENFERMARIAS)
 * Total: 13 leitos
 * Apartamentos: 9 leitos (1-9) - FIXOS
 * Enfermarias: 4 leitos (10-13) - INDEPENDENTES
 * Regra: Máximo 4 pacientes com plano enfermaria
 * Diferencial: Card com nome do gestor
 */
function calcularLeitosH4(dados) {
  const leitos = dados.filter(l => l.hospital === 'H4');

  // 1. APARTAMENTOS (1-9)
  const aptos = leitos.filter(l => l.leito >= 1 && l.leito <= 9);
  const aptos_ocupados = aptos.filter(l => l.status === 'ocupado').length;
  const aptos_alta = aptos.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  ).length;
  const aptos_vagos = 9 - aptos_ocupados;

  // 2. ENFERMARIAS (10-13)
  const enfermarias = leitos.filter(l => l.leito >= 10 && l.leito <= 13);

  const enf_ocupadas = enfermarias.filter(l => l.status === 'ocupado');

  const enf_fem_ocupadas = enf_ocupadas.filter(l =>
    l.genero === 'Feminino'
  ).length;

  const enf_masc_ocupadas = enf_ocupadas.filter(l =>
    l.genero === 'Masculino'
  ).length;

  const enf_alta = enfermarias.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  );

  const enf_fem_alta = enf_alta.filter(l =>
    l.genero === 'Feminino'
  ).length;

  const enf_masc_alta = enf_alta.filter(l =>
    l.genero === 'Masculino'
  ).length;

  const enf_vagos = 4 - enf_ocupadas.length;

  return {
    ocupados: {
      total: aptos_ocupados + enf_ocupadas.length,
      apartamento: aptos_ocupados,
      enf_feminina: enf_fem_ocupadas,
      enf_masculina: enf_masc_ocupadas,
      detalhado: {
        flexiveis: 0,
        exclusivo_apto: aptos_ocupados,
        exclusivo_enf_sem_restricao: enf_ocupadas.length, // SEM bloqueio
        exclusivo_enf_fem: 0,  // Conta como "sem restrição"
        exclusivo_enf_masc: 0  // Conta como "sem restrição"
      }
    },
    previsao_alta: {
      total: aptos_alta + enf_alta.length,
      apartamento: aptos_alta,
      enf_feminina: enf_fem_alta,
      enf_masculina: enf_masc_alta,
      detalhado: {
        flexiveis: 0,
        exclusivo_apto: aptos_alta,
        exclusivo_enf_sem_restricao: enf_alta.length,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    disponiveis: {
      total: aptos_vagos + enf_vagos,
      capacidade_nao_simultanea: {
        apartamento: aptos_vagos,
        enf_feminina: enf_vagos,   // SEM bloqueio
        enf_masculina: enf_vagos   // SEM bloqueio
      },
      detalhado: {
        flexiveis: 0,
        exclusivo_apto: aptos_vagos,
        exclusivo_enf_sem_restricao: enf_vagos,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    // Informação adicional
    limite_enfermarias: {
      total_permitido: 4,
      ocupadas: enf_ocupadas.length,
      vagas_restantes: 4 - enf_ocupadas.length
    }
  };
}

/**
 * H5 - ADVENTISTA (HÍBRIDOS)
 * Total: 13 leitos
 * Regra: Médico escolhe Apartamento OU Enfermaria ao admitir
 * Campo BU: OBRIGATÓRIO
 * Lógica IDÊNTICA ao H1, apenas muda o total de leitos
 */
function calcularLeitosH5(dados) {
  const leitos = dados.filter(l => l.hospital === 'H5');

  // 1. OCUPADOS
  const ocupados = leitos.filter(l => l.status === 'ocupado');

  const aptos_ocupados = ocupados.filter(l =>
    l.categoriaEscolhida === 'Apartamento' ||
    l.categoriaEscolhida === 'APT'
  ).length;

  const enf_fem_ocupadas = ocupados.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Feminino'
  ).length;

  const enf_masc_ocupadas = ocupados.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Masculino'
  ).length;

  // 2. PREVISÃO DE ALTA
  const alta = leitos.filter(l =>
    l.status === 'ocupado' && l.prevAlta && l.prevAlta !== 'SP'
  );

  const alta_aptos = alta.filter(l =>
    l.categoriaEscolhida === 'Apartamento' ||
    l.categoriaEscolhida === 'APT'
  ).length;

  const alta_enf_fem = alta.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Feminino'
  ).length;

  const alta_enf_masc = alta.filter(l =>
    (l.categoriaEscolhida === 'Enfermaria' || l.categoriaEscolhida === 'ENF') &&
    l.genero === 'Masculino'
  ).length;

  // 3. DISPONÍVEIS
  const vagos = leitos.filter(l => l.status === 'vago').length;

  return {
    ocupados: {
      total: ocupados.length,
      apartamento: aptos_ocupados,
      enf_feminina: enf_fem_ocupadas,
      enf_masculina: enf_masc_ocupadas,
      detalhado: {
        flexiveis: ocupados.length,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    previsao_alta: {
      total: alta.length,
      apartamento: alta_aptos,
      enf_feminina: alta_enf_fem,
      enf_masculina: alta_enf_masc,
      detalhado: {
        flexiveis: alta.length,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    },
    disponiveis: {
      total: vagos,
      capacidade_nao_simultanea: {
        apartamento: vagos,
        enf_feminina: vagos,
        enf_masculina: vagos
      },
      detalhado: {
        flexiveis: vagos,
        exclusivo_apto: 0,
        exclusivo_enf_sem_restricao: 0,
        exclusivo_enf_fem: 0,
        exclusivo_enf_masc: 0
      }
    }
  };
}

// =================== FUNÇÕES DE RENDERIZAÇÃO DOS CARDS ===================

/**
 * Renderiza o Card 1: LEITOS OCUPADOS
 */
function renderizarCardOcupados(metricas, hospitalId, nomeHospital) {
  const dados = metricas.ocupados;

  // Destaque especial para Santa Clara (H4)
  const destaqueGestor = (hospitalId === 'H4') ? `
    <div class="destaque-gestor">
      <div class="nome-gestor">Guilherme Santoro</div>
      <div class="divisao-gestor">
        <div class="item">
          <span>Apartamento</span>
          <span>${dados.apartamento}</span>
        </div>
        <div class="item">
          <span>Enfermaria Feminina</span>
          <span>${dados.enf_feminina}</span>
        </div>
        <div class="item">
          <span>Enfermaria Masculina</span>
          <span>${dados.enf_masculina}</span>
        </div>
      </div>
    </div>
  ` : '';

  return `
    <div class="card card-ocupados">
      <h3>Leitos Ocupados</h3>
      <div class="numero-grande">${dados.total}</div>

      ${destaqueGestor}

      <div class="divisao-principal">
        <div class="item">
          <span>Apartamento</span>
          <span>${dados.apartamento}</span>
        </div>
        <div class="item">
          <span>Enfermaria Feminina</span>
          <span>${dados.enf_feminina}</span>
        </div>
        <div class="item">
          <span>Enfermaria Masculina</span>
          <span>${dados.enf_masculina}</span>
        </div>
      </div>

      <div class="divisao-linha"></div>

      <div class="divisao-titulo">
        LEITOS DIVIDIDOS CONFORME MODALIDADE<br>
        CONTRATUAL COM O CREDENCIADO
      </div>

      <div class="divisao-detalhada">
        <div class="item">
          <span>FLEXÍVEIS QUANTO AO PLANO</span>
          <span>${dados.detalhado.flexiveis}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE APARTAMENTOS</span>
          <span>${dados.detalhado.exclusivo_apto}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIAS SEM<br>RESTRIÇÃO DE GÊNERO</span>
          <span>${dados.detalhado.exclusivo_enf_sem_restricao}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIA FEMININA</span>
          <span>${dados.detalhado.exclusivo_enf_fem}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIA MASCULINA</span>
          <span>${dados.detalhado.exclusivo_enf_masc}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o Card 2: LEITOS EM PREVISÃO DE ALTA
 */
function renderizarCardPrevisaoAlta(metricas) {
  const dados = metricas.previsao_alta;

  return `
    <div class="card card-previsao-alta">
      <h3>Leitos em Previsão de Alta</h3>
      <div class="numero-grande">${dados.total}</div>

      <div class="divisao-principal">
        <div class="item">
          <span>Apartamento</span>
          <span>${dados.apartamento}</span>
        </div>
        <div class="item">
          <span>Enfermaria Feminina</span>
          <span>${dados.enf_feminina}</span>
        </div>
        <div class="item">
          <span>Enfermaria Masculina</span>
          <span>${dados.enf_masculina}</span>
        </div>
      </div>

      <div class="divisao-linha"></div>

      <div class="divisao-titulo">
        LEITOS DIVIDIDOS CONFORME MODALIDADE<br>
        CONTRATUAL COM O CREDENCIADO
      </div>

      <div class="divisao-detalhada">
        <div class="item">
          <span>FLEXÍVEIS QUANTO AO PLANO</span>
          <span>${dados.detalhado.flexiveis}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE APARTAMENTOS</span>
          <span>${dados.detalhado.exclusivo_apto}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIAS SEM<br>RESTRIÇÃO DE GÊNERO</span>
          <span>${dados.detalhado.exclusivo_enf_sem_restricao}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIA FEMININA</span>
          <span>${dados.detalhado.exclusivo_enf_fem}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIA MASCULINA</span>
          <span>${dados.detalhado.exclusivo_enf_masc}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o Card 3: LEITOS DISPONÍVEIS
 */
function renderizarCardDisponiveis(metricas) {
  const dados = metricas.disponiveis;

  return `
    <div class="card card-disponiveis">
      <h3>Leitos Disponíveis</h3>
      <div class="numero-grande">${dados.total}</div>

      <div class="capacidade-titulo">
        Capacidade por tipo de leito<br>
        <span style="font-size: 0.85rem;">(não simultâneo)</span>
      </div>

      <div class="divisao-principal">
        <div class="item">
          <span>Apartamento</span>
          <span>até ${dados.capacidade_nao_simultanea.apartamento}</span>
        </div>
        <div class="item">
          <span>Enfermaria Feminina</span>
          <span>até ${dados.capacidade_nao_simultanea.enf_feminina}</span>
        </div>
        <div class="item">
          <span>Enfermaria Masculina</span>
          <span>até ${dados.capacidade_nao_simultanea.enf_masculina}</span>
        </div>
      </div>

      <div class="divisao-linha"></div>

      <div class="divisao-titulo">
        LEITOS DIVIDIDOS CONFORME MODALIDADE<br>
        CONTRATUAL COM O CREDENCIADO
      </div>

      <div class="divisao-detalhada">
        <div class="item">
          <span>FLEXÍVEIS QUANTO AO PLANO</span>
          <span>${dados.detalhado.flexiveis}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE APARTAMENTOS</span>
          <span>${dados.detalhado.exclusivo_apto}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIAS SEM<br>RESTRIÇÃO DE GÊNERO</span>
          <span>${dados.detalhado.exclusivo_enf_sem_restricao}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIA FEMININA</span>
          <span>${dados.detalhado.exclusivo_enf_fem}</span>
        </div>
        <div class="item">
          <span>EXCLUSIVAMENTE ENFERMARIA MASCULINA</span>
          <span>${dados.detalhado.exclusivo_enf_masc}</span>
        </div>
      </div>
    </div>
  `;
}

// =================== FUNÇÃO PRINCIPAL - RENDERIZAR DASHBOARD ===================

/**
 * Função principal para renderizar o dashboard de um hospital específico
 */
window.renderizarDashboardHospital = function(hospitalId) {
  console.log(`🏥 Renderizando Dashboard: ${hospitalId}`);

  // 1. Buscar dados do hospital
  const dados = window.hospitalData[hospitalId];

  if (!dados || !dados.leitos) {
    console.error('❌ Dados não encontrados:', hospitalId);
    return;
  }

  // 2. Calcular métricas conforme tipo de hospital
  let metricas;

  switch(hospitalId) {
    case 'H1':
      metricas = calcularLeitosH1(dados.leitos);
      break;
    case 'H2':
      metricas = calcularLeitosH2(dados.leitos);
      break;
    case 'H3':
      metricas = calcularLeitosH3(dados.leitos);
      break;
    case 'H4':
      metricas = calcularLeitosH4(dados.leitos);
      break;
    case 'H5':
      metricas = calcularLeitosH5(dados.leitos);
      break;
    default:
      console.error('❌ Hospital inválido:', hospitalId);
      return;
  }

  // 3. Renderizar HTML
  const container = document.getElementById('dashHospitalarContent');

  if (!container) {
    console.error('❌ Container dashHospitalarContent não encontrado');
    return;
  }

  container.innerHTML = `
    <div class="dashboard-hospitalar">
      <h2>Dashboard Hospitalar - ${dados.nome}</h2>
      <div class="cards-container">
        ${renderizarCardOcupados(metricas, hospitalId, dados.nome)}
        ${renderizarCardPrevisaoAlta(metricas)}
        ${renderizarCardDisponiveis(metricas)}
      </div>
    </div>

    ${getDashboardCSS()}
  `;

  console.log('✅ Dashboard renderizado com sucesso');
};

// =================== CSS COMPLETO ===================

function getDashboardCSS() {
  return `
    <style>
      /* CARDS */
      .dashboard-hospitalar {
        padding: 20px;
      }

      .dashboard-hospitalar h2 {
        color: #1e40af;
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
      }

      .cards-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 20px;
      }

      .card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }

      .card-ocupados {
        background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
        color: white;
      }

      .card-previsao-alta {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
      }

      .card-disponiveis {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
      }

      .card h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 16px;
        text-align: center;
      }

      .numero-grande {
        font-size: 4rem;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
      }

      /* DESTAQUE GESTOR (H4) */
      .destaque-gestor {
        background: #065f46;
        border: 2px solid white;
        border-radius: 8px;
        padding: 12px;
        margin: 16px 0;
      }

      .nome-gestor {
        font-weight: bold;
        font-size: 1.1rem;
        display: block;
        margin-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.3);
        padding-bottom: 8px;
      }

      .divisao-gestor {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .divisao-gestor .item {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
      }

      /* DIVISÕES */
      .divisao-principal {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 16px 0;
      }

      .divisao-principal .item {
        display: flex;
        justify-content: space-between;
        font-size: 1rem;
        padding: 4px 0;
      }

      .divisao-linha {
        height: 2px;
        background: rgba(255,255,255,0.3);
        margin: 16px 0;
      }

      .divisao-titulo {
        text-align: center;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 16px 0;
        line-height: 1.4;
      }

      .divisao-detalhada {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 12px;
      }

      .divisao-detalhada .item {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        padding: 4px 0;
        line-height: 1.3;
      }

      .capacidade-titulo {
        text-align: center;
        font-size: 0.9rem;
        font-weight: 600;
        margin: 12px 0;
        line-height: 1.4;
      }

      /* RESPONSIVO */
      @media (max-width: 1200px) {
        .cards-container {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .dashboard-hospitalar {
          padding: 10px;
        }

        .card {
          padding: 16px;
        }

        .numero-grande {
          font-size: 3rem;
        }

        .divisao-detalhada .item {
          font-size: 0.75rem;
        }
      }
    </style>
  `;
}

// =================== EXPORTAÇÃO GLOBAL ===================
window.calcularLeitosH1 = calcularLeitosH1;
window.calcularLeitosH2 = calcularLeitosH2;
window.calcularLeitosH3 = calcularLeitosH3;
window.calcularLeitosH4 = calcularLeitosH4;
window.calcularLeitosH5 = calcularLeitosH5;

console.log('🚀 Dashboard Hospitalar V3.2 - Sistema de 3 Cards PRONTO!');
