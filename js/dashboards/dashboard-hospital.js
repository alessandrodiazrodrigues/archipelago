/*!
 * Dashboard Hospitalar V3.3.2 — Archipelago MVP
 * Requisitos:
 * - Sem mock (usa apenas window.hospitalData carregado pela API)
 * - Função pública: window.renderDashboardHospitalar(hospitalId = 'todos')
 * - Neomater primeiro; gauge meia-rosca como 1º KPI
 * - Barras verticais (Altas, Concessões, Linhas); Pizzas (Região, Tipo)
 * - Legenda HTML externa, 1 item/linha, clicável
 */

(function(){
  'use strict';

  // ============================
  //  CORES OFICIAIS (constantes)
  // ============================
  window.CORES_CONCESSOES = {
    'Transição Domiciliar': '#007A53',
    'Aplicação domiciliar de medicamentos': '#582C83',
    'Aspiração': '#2E1A47',
    'Banho': '#8FD3F4',
    'Curativo': '#00BFB3',
    'Curativo PICC': '#E03C31',
    'Fisioterapia Domiciliar': '#009639',
    'Fonoaudiologia Domiciliar': '#FF671F',
    'Oxigenoterapia': '#64A70B',
    'Remoção': '#FFB81C',
    'Solicitação domiciliar de exames': '#546E7A',
  };

  window.CORES_LINHAS = {
    'Assiste': '#ED0A72',
    'APS SP': '#007A33',
    'Cuidados Paliativos': '#00B5A2',
    'ICO (Insuficiência Coronariana)': '#A6192E',
    'Nexus SP Cardiologia': '#C8102E',
    'Nexus SP Gastroentereologia': '#455A64',
    'Nexus SP Geriatria': '#E35205',
    'Nexus SP Pneumologia': '#4A148C',
    'Nexus SP Psiquiatria': '#3E2723',
    'Nexus SP Reumatologia': '#E91E63',
    'Nexus SP Saúde do Fígado': '#556F44',
    'Generalista': '#FFC72C',
    'Bucomaxilofacial': '#D81B60',
    'Cardiologia': '#5A0020',
    'Cirurgia Cardíaca': '#9CCC65',
    'Cirurgia de Cabeça e Pescoço': '#7CB342',
    'Cirurgia do Aparelho Digestivo': '#00263A',
    'Cirurgia Geral': '#00AEEF',
    'Cirurgia Oncológica': '#0072CE',
    'Cirurgia Plástica': '#8E24AA',
    'Cirurgia Torácica': '#BA68C8',
    'Cirurgia Vascular': '#AED581',
    'Clínica Médica': '#F4E285',
    'Coloproctologia': '#C2185B',
    'Dermatologia': '#9C27B0',
    'Endocrinologia': '#37474F',
    'Fisiatria': '#E8927C',
    'Gastroenterologia': '#003C57',
    'Geriatria': '#FF6F1D',
    'Ginecologia e Obstetrícia': '#582D40',
    'Hematologia': '#1E88E5',
    'Infectologia': '#4A7C59',
    'Mastologia': '#5C5EBE',
    'Nefrologia': '#7B1FA2',
    'Neurocirurgia': '#1565C0',
    'Neurologia': '#64B5F6',
    'Oftalmologia': '#6D4C41',
    'Oncologia Clínica': '#6A1B9A',
    'Ortopedia': '#42A5F5',
    'Otorrinolaringologia': '#AD1457',
    'Pediatria': '#5A646B',
    'Pneumologia': '#1976D2',
    'Psiquiatria': '#4E342E',
    'Reumatologia': '#880E4F',
    'Urologia': '#2D5016',
  };

  // Helpers de cor
  function corConcessao(nome){ return window.CORES_CONCESSOES?.[nome] || '#999999'; }
  function corLinha(nome){ return window.CORES_LINHAS?.[nome] || '#999999'; }

  // ============================
  //     SANITIZAÇÃO E BASE
  // ============================
  const safeInt = v => Number.isFinite(+v) ? +v : 0;
  const safeTxt = v => (v===null||v===undefined||v==='') ? '—' : String(v);

  // Armazena instâncias de gráficos para destruir ao re-render
  const chartStore = {};

  function ensureData(){
    if(!window.hospitalData || typeof window.hospitalData !== 'object'){
      throw new Error('[DASH HOSP] Dados ausentes: window.hospitalData não está definido. Carregue via API antes de renderizar.');
    }
  }

  // Ordena colocando Neomater primeiro
  function ordenarHospitais(hmap){
    const nomes = Object.keys(hmap || {});
    nomes.sort((a,b)=>{
      const na = String(a||'').toLowerCase();
      const nb = String(b||'').toLowerCase();
      if(na.includes('neomater') && !nb.includes('neomater')) return -1;
      if(nb.includes('neomater') && !na.includes('neomater')) return 1;
      return na.localeCompare(nb);
    });
    return nomes;
  }

  // ============================
  //       CÁLCULOS DE KPI
  // ============================
  function calcKPIs(leitos, meta){
    const total = safeInt(leitos.length);
    let ocupados = 0, vagos = 0;
    let altasHoje = 0;
    let aptoOcup=0, enfOcup=0, enfDisp=0;
    let isolResp=0, isolContato=0, diretivas=0;
    let somaIdade=0, countIdade=0;

    for(const l of leitos){
      const status = (l.status||'').toLowerCase();
      const tipo = (l.categoria || l.categoriaEscolhida || l.tipo || '').toLowerCase();
      const prev = l.prevAlta || l.previsao || '';
      const idade = Number(l.idade);

      if(status==='ocupado'){
        ocupados++;
        if(tipo.includes('apart')) aptoOcup++;
        if(tipo.includes('enferm')) enfOcup++;

        if(prev==='Hoje Ouro' || prev==='Hoje 2R' || prev==='Hoje 3R') altasHoje++;

        // Isolamentos
        const isoResp = safeInt(l?.isolamento?.resp || l?.isolamentoResp || 0);
        const isoCont = safeInt(l?.isolamento?.contato || l?.isolamentoContato || 0);
        isolResp += isoResp>0 ? 1 : 0;
        isolContato += isoCont>0 ? 1 : 0;

        // Diretivas
        const d = (l.diretiva || l.diretivas || '').toString().toLowerCase();
        if(d==='sim' || d==='true' || d==='1') diretivas++;

        if(Number.isFinite(idade)){
          somaIdade += idade;
          countIdade++;
        }
      }
    }
    vagos = Math.max(0, total - ocupados);
    const ocupacao = total>0 ? Math.round((ocupados/total)*100) : 0;

    if(meta && Number.isFinite(meta.capacidadeEnfermarias)){
      enfDisp = Math.max(0, safeInt(meta.capacidadeEnfermarias) - enfOcup);
    }

    const idadeMedia = countIdade>0 ? Math.round(somaIdade / countIdade) : 0;

    return {
      total, ocupados, vagos, ocupacao,
      altasHoje, aptoOcup, enfOcup, enfDisp,
      isolResp, isolContato, diretivas, idadeMedia
    };
  }

  // ============================
  //     AGREGAÇÕES PARA GRÁFICOS
  // ============================
  function aggAltas(leitos){
    const out = {
      'Hoje Ouro':0, 'Hoje 2R':0, 'Hoje 3R':0,
      '24h Ouro':0, '24h 2R':0, '24h 3R':0,
      '48h':0,'72h':0,'96h':0
    };
    for(const l of leitos){
      if((l.status||'').toLowerCase()!=='ocupado') continue;
      const p = l.prevAlta || l.previsao || '';
      if(out.hasOwnProperty(p)) out[p]++;
      // SP fora por regra
    }
    return out;
  }

  function aggPorCategoriaPrazo(leitos, tipo='concessao'){
    // retorna { item: {Hoje, '24h','48h','72h','96h'} }
    const acc = {};
    for(const l of leitos){
      if((l.status||'').toLowerCase()!=='ocupado') continue;
      const p0 = l.prevAlta || l.previsao || '';
      const prazo = p0.startsWith('Hoje') ? 'Hoje' :
                    p0.startsWith('24h') ? '24h' :
                    (p0==='48h'||p0==='72h'||p0==='96h') ? p0 : null;
      if(!prazo) continue; // ignora SP

      const lista = (tipo==='concessao')
        ? (Array.isArray(l.concessoes)? l.concessoes : (l.concessoes? String(l.concessoes).split('|'):[]))
        : (Array.isArray(l.linhas)? l.linhas : (l.linhas? String(l.linhas).split('|'):[]));

      for(let raw of lista){
        const nome = String(raw||'').trim();
        if(!nome) continue;
        if(!acc[nome]) acc[nome] = {Hoje:0,'24h':0,'48h':0,'72h':0,'96h':0};
        acc[nome][prazo]++;
      }
    }
    acc.__tipo = (tipo==='concessao')?'concessao':'linha';
    return acc;
  }

  function aggPizza(leitos, campo){
    const acc = {};
    for(const l of leitos){
      if((l.status||'').toLowerCase()!=='ocupado') continue;
      let chave = 'Não informado';
      if(campo==='regiao'){
        chave = String(l.regiao||l.região||'Não informado').trim() || 'Não informado';
      } else if(campo==='tipo'){
        chave = String(l.categoria||l.categoriaEscolhida||l.tipo||'Não informado').trim() || 'Não informado';
        if(/apart/i.test(chave)) chave='Apartamento';
        else if(/enferm/i.test(chave)) chave='Enfermaria';
        else if(/uti/i.test(chave)) chave='UTI';
      }
      acc[chave] = (acc[chave]||0) + 1;
    }
    const labels = Object.keys(acc);
    const data = labels.map(k=>acc[k]);
    return { labels, data };
  }

  // ============================
  //         CHART UTILS
  // ============================
  function destroyIfExists(key){
    if(chartStore[key]){
      try{ chartStore[key].destroy(); }catch(e){}
      delete chartStore[key];
    }
  }

  function labelsValoresAbsolutos(values){
    const total = (values||[]).reduce((a,b)=>a+b,0) || 1;
    return v => `${v} (${(v*100/total).toFixed(1)}%)`;
  }

  function buildDatasetsAltas(series){
    const mk = k=>series[k]||0;
    const stacks = [
      { key:'Hoje Ouro',  label:'Hoje Ouro',  color:'#FFC72C', idx:0 },
      { key:'Hoje 2R',    label:'Hoje 2R',    color:'#304FFE', idx:0 },
      { key:'Hoje 3R',    label:'Hoje 3R',    color:'#7E57C2', idx:0 },
      { key:'24h Ouro',   label:'24h Ouro',   color:'#FFE082', idx:1 },
      { key:'24h 2R',     label:'24h 2R',     color:'#82B1FF', idx:1 },
      { key:'24h 3R',     label:'24h 3R',     color:'#B39DDB', idx:1 },
    ];
    const simples = [
      { key:'48h', label:'48h', color:'#64B5F6', idx:2 },
      { key:'72h', label:'72h', color:'#90CAF9', idx:3 },
      { key:'96h', label:'96h', color:'#BBDEFB', idx:4 }
    ];

    const out = [];
    for(const s of stacks){
      const data = [0,0,0,0,0];
      data[s.idx] = mk(s.key);
      out.push({label:s.label, backgroundColor:s.color, data, stack:`S${s.idx}`});
    }
    for(const s of simples){
      const data = [0,0,0,0,0];
      data[s.idx] = mk(s.key);
      out.push({label:s.label, backgroundColor:s.color, data});
    }
    return out;
  }

  function buildSeriesCategoria(mapaPrazo){
    const chaves = Object.keys(mapaPrazo).filter(k=>k!=='__tipo');
    return chaves.map(ch=>{
      const m = mapaPrazo[ch]||{};
      return {
        label: ch,
        backgroundColor: (mapaPrazo.__tipo==='concessao')?corConcessao(ch):corLinha(ch),
        data: [m.Hoje||0, m['24h']||0, m['48h']||0, m['72h']||0, m['96h']||0]
      };
    });
  }

  function createLegend(container, chart){
    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'legend-externa';
    chart.data.datasets.forEach((ds, i)=>{
      const li = document.createElement('li');
      li.style.cursor = 'pointer';
      li.style.display = 'block';
      li.style.margin = '4px 0';
      const box = document.createElement('span');
      box.style.display='inline-block';
      box.style.width='12px';
      box.style.height='12px';
      box.style.marginRight='8px';
      box.style.background = Array.isArray(ds.backgroundColor)? ds.backgroundColor[0] : ds.backgroundColor;
      const lbl = document.createElement('span');
      lbl.textContent = ds.label;
      li.appendChild(box);
      li.appendChild(lbl);
      li.onclick = ()=>{
        const vis = chart.isDatasetVisible(i);
        chart.setDatasetVisibility(i, !vis);
        li.style.opacity = vis ? .35 : 1;
        chart.update();
      };
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  // ============================
  //        RENDER POR HOSP
  // ============================
  function renderHospital(container, hid, leitos, meta){
    // ------ KPIs ------
    const kpi = calcKPIs(leitos, meta);
    const k = {
      total: safeInt(kpi.total),
      ocupados: safeInt(kpi.ocupados),
      vagos: safeInt(kpi.vagos),
      ocupacao: safeInt(kpi.ocupacao),
      altasHoje: safeInt(kpi.altasHoje),
      aptoOcup: safeInt(kpi.aptoOcup),
      enfOcup: safeInt(kpi.enfOcup),
      enfDisp: safeInt(kpi.enfDisp),
      isolResp: safeInt(kpi.isolResp),
      isolContato: safeInt(kpi.isolContato),
      diretivas: safeInt(kpi.diretivas),
      idadeMedia: safeInt(kpi.idadeMedia)
    };

    // Construção do bloco HTML
    const wrap = document.createElement('section');
    wrap.className = 'bloco-hospital';
    wrap.innerHTML = `
      <h2 class="titulo-hospital">${safeTxt(hid)}</h2>

      <div class="kpis linha1">
        <div class="kpi gauge" id="gauge_${hid}">
          <div class="gauge-value">${k.ocupacao}%</div>
          <div class="kpi-label">OCUPAÇÃO</div>
        </div>
        <div class="kpi"><div class="kpi-value">${k.total}</div><div class="kpi-label">TOTAL</div></div>
        <div class="kpi"><div class="kpi-value">${k.ocupados}</div><div class="kpi-label">OCUPADOS</div></div>
        <div class="kpi"><div class="kpi-value">${k.vagos}</div><div class="kpi-label">VAGOS</div></div>
        <div class="kpi"><div class="kpi-value">${k.altasHoje}</div><div class="kpi-label">EM ALTA (HOJE)</div></div>
      </div>

      <div class="kpis linha2">
        ${k.aptoOcup ? `<div class="kpi"><div class="kpi-value">${k.aptoOcup}</div><div class="kpi-label">APARTAMENTOS OCUPADOS</div></div>`:''}
        ${k.enfOcup ? `<div class="kpi"><div class="kpi-value">${k.enfOcup}</div><div class="kpi-label">ENFERMARIAS OCUPADAS</div></div>`:''}
        ${(Number.isFinite(meta?.capacidadeEnfermarias) && meta.capacidadeEnfermarias>0) ?
          `<div class="kpi"><div class="kpi-value">${k.enfDisp}</div><div class="kpi-label">ENFERMARIAS DISPONÍVEIS</div></div>` : ''}
        ${(k.isolResp+k.isolContato)>0 ? `<div class="kpi"><div class="kpi-value">${k.isolResp+k.isolContato}</div><div class="kpi-label">ISOLAMENTOS</div><div class="kpi-sub">Resp: ${k.isolResp} | Contato: ${k.isolContato}</div></div>`:''}
        ${k.diretivas ? `<div class="kpi"><div class="kpi-value">${k.diretivas}</div><div class="kpi-label">COM DIRETIVAS</div></div>`:''}
        ${k.idadeMedia ? `<div class="kpi"><div class="kpi-value">${k.idadeMedia}</div><div class="kpi-label">IDADE MÉDIA (ANOS)</div></div>`:''}
      </div>

      <div class="graf bloco">
        <h3>Análise preditiva de altas em <span class="data-ref"></span></h3>
        <canvas id="graficoAltas_${hid}"></canvas>
        <div class="legend legend-altas" id="legendAltas_${hid}"></div>
      </div>

      <div class="graf bloco">
        <h3>Concessões previstas em <span class="data-ref"></span></h3>
        <canvas id="graficoConcessoes_${hid}"></canvas>
        <div class="legend" id="legendConcessoes_${hid}"></div>
      </div>

      <div class="graf bloco">
        <h3>Linhas de cuidado em <span class="data-ref"></span></h3>
        <canvas id="graficoLinhas_${hid}"></canvas>
        <div class="legend" id="legendLinhas_${hid}"></div>
      </div>

      <div class="graf bloco">
        <h3>Pacientes por região em <span class="data-ref"></span></h3>
        <canvas id="graficoRegiao_${hid}"></canvas>
        <div class="legend" id="legendRegiao_${hid}"></div>
      </div>

      <div class="graf bloco">
        <h3>Distribuição por tipo de acomodação em <span class="data-ref"></span></h3>
        <canvas id="graficoTipo_${hid}"></canvas>
        <div class="legend" id="legendTipo_${hid}"></div>
      </div>
    `;
    container.appendChild(wrap);

    // Data ref (hoje)
    const today = new Date();
    const dd = String(today.getDate()).padStart(2,'0');
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const yyyy = today.getFullYear();
    wrap.querySelectorAll('.data-ref').forEach(el=>el.textContent = `${dd}/${mm}/${yyyy}`);

    // Gauge meia-rosca (SVG leve)
    renderGaugeMeiaRosca(wrap.querySelector('#gauge_'+hid), k.ocupacao);

    // ------ GRÁFICOS ------
    const altAgg = aggAltas(leitos);
    renderBarrasAltas(`graficoAltas_${hid}`, `legendAltas_${hid}`, altAgg, `Altas_${hid}`);

    const cons = aggPorCategoriaPrazo(leitos,'concessao');
    renderBarrasCategoria(`graficoConcessoes_${hid}`, `legendConcessoes_${hid}`, cons, `Concessoes_${hid}`);

    const lin  = aggPorCategoriaPrazo(leitos,'linha');
    renderBarrasCategoria(`graficoLinhas_${hid}`, `legendLinhas_${hid}`, lin, `Linhas_${hid}`);

    const pr = aggPizza(leitos,'regiao');
    renderPizza(`graficoRegiao_${hid}`, `legendRegiao_${hid}`, pr, `Regiao_${hid}`);

    const pt = aggPizza(leitos,'tipo');
    renderPizza(`graficoTipo_${hid}`, `legendTipo_${hid}`, pt, `Tipo_${hid}`);
  }

  // ============================
  //          RENDER GRAF
  // ============================
  function destroyIfExists(key){
    if(chartStore[key]){
      try{ chartStore[key].destroy(); }catch(e){}
      delete chartStore[key];
    }
  }

  function labelsValoresAbsolutos(values){
    const total = (values||[]).reduce((a,b)=>a+b,0) || 1;
    return v => `${v} (${(v*100/total).toFixed(1)}%)`;
  }

  function buildDatasetsAltas(series){
    const mk = k=>series[k]||0;
    const stacks = [
      { key:'Hoje Ouro',  label:'Hoje Ouro',  color:'#FFC72C', idx:0 },
      { key:'Hoje 2R',    label:'Hoje 2R',    color:'#304FFE', idx:0 },
      { key:'Hoje 3R',    label:'Hoje 3R',    color:'#7E57C2', idx:0 },
      { key:'24h Ouro',   label:'24h Ouro',   color:'#FFE082', idx:1 },
      { key:'24h 2R',     label:'24h 2R',     color:'#82B1FF', idx:1 },
      { key:'24h 3R',     label:'24h 3R',     color:'#B39DDB', idx:1 },
    ];
    const simples = [
      { key:'48h', label:'48h', color:'#64B5F6', idx:2 },
      { key:'72h', label:'72h', color:'#90CAF9', idx:3 },
      { key:'96h', label:'96h', color:'#BBDEFB', idx:4 }
    ];

    const out = [];
    for(const s of stacks){
      const data = [0,0,0,0,0];
      data[s.idx] = mk(s.key);
      out.push({label:s.label, backgroundColor:s.color, data, stack:`S${s.idx}`});
    }
    for(const s of simples){
      const data = [0,0,0,0,0];
      data[s.idx] = mk(s.key);
      out.push({label:s.label, backgroundColor:s.color, data});
    }
    return out;
  }

  function buildSeriesCategoria(mapaPrazo){
    const chaves = Object.keys(mapaPrazo).filter(k=>k!=='__tipo');
    return chaves.map(ch=>{
      const m = mapaPrazo[ch]||{};
      return {
        label: ch,
        backgroundColor: (mapaPrazo.__tipo==='concessao')?corConcessao(ch):corLinha(ch),
        data: [m.Hoje||0, m['24h']||0, m['48h']||0, m['72h']||0, m['96h']||0]
      };
    });
  }

  function createLegend(container, chart){
    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'legend-externa';
    chart.data.datasets.forEach((ds, i)=>{
      const li = document.createElement('li');
      li.style.cursor = 'pointer';
      li.style.display = 'block';
      li.style.margin = '4px 0';
      const box = document.createElement('span');
      box.style.display='inline-block';
      box.style.width='12px';
      box.style.height='12px';
      box.style.marginRight='8px';
      box.style.background = Array.isArray(ds.backgroundColor)? ds.backgroundColor[0] : ds.backgroundColor;
      const lbl = document.createElement('span');
      lbl.textContent = ds.label;
      li.appendChild(box);
      li.appendChild(lbl);
      li.onclick = ()=>{
        const vis = chart.isDatasetVisible(i);
        chart.setDatasetVisibility(i, !vis);
        li.style.opacity = vis ? .35 : 1;
        chart.update();
      };
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  // Pizzas / Barras
  function renderBarrasAltas(canvasId, legendId, series, key){
    destroyIfExists(key);
    const ctx = document.getElementById(canvasId);
    if(!ctx){ return; }
    const datasets = buildDatasetsAltas(series);
    const config = {
      type: 'bar',
      data: { labels: ['Hoje','24h','48h','72h','96h'], datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display:false }, tooltip: { enabled:true } },
        scales: {
          x: { stacked: true },
          y: { stacked: true, title: { display:true, text:'Beneficiários' }, beginAtZero:true, precision:0 }
        }
      }
    };
    const chart = new Chart(ctx, config);
    chartStore[key] = chart;
    const legendContainer = document.getElementById(legendId);
    if(legendContainer) createLegend(legendContainer, chart);
  }

  function renderBarrasCategoria(canvasId, legendId, mapaPrazo, key){
    destroyIfExists(key);
    const ctx = document.getElementById(canvasId);
    if(!ctx){ return; }

    const datasets = buildSeriesCategoria(mapaPrazo);
    if(datasets.length===0){
      ctx.replaceWith(placeholderSemDados());
      return;
    }

    const config = {
      type: 'bar',
      data: { labels:['Hoje','24h','48h','72h','96h'], datasets },
      options: {
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{ display:false }, tooltip:{ enabled:true } },
        scales:{
          x:{ stacked:false },
          y:{ beginAtZero:true, title:{ display:true, text:'Beneficiários' }, precision:0 }
        }
      }
    };
    const chart = new Chart(ctx, config);
    chartStore[key] = chart;
    const legendContainer = document.getElementById(legendId);
    if(legendContainer) createLegend(legendContainer, chart);
  }

  function renderPizza(canvasId, legendId, dados, key){
    destroyIfExists(key);
    const ctx = document.getElementById(canvasId);
    if(!ctx){ return; }

    if(!dados.labels.length){
      ctx.replaceWith(placeholderSemDados());
      return;
    }

    const baseColors = ['#90CAF9','#A5D6A7','#FFCC80','#CE93D8','#FFF59D','#80CBC4','#EF9A9A','#B0BEC5','#F48FB1','#B39DDB'];
    const bg = dados.labels.map((_,i)=> baseColors[i % baseColors.length]);

    const config = {
      type: 'pie',
      data: { labels: dados.labels, datasets: [{ data: dados.data, backgroundColor: bg }] },
      options: {
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{
          legend:{ display:false },
          tooltip:{
            callbacks:{
              label:(ctx)=>{
                const getTxt = labelsValoresAbsolutos(ctx.dataset.data);
                return `${ctx.label}: ${getTxt(ctx.parsed)}`;
              }
            }
          }
        }
      }
    };
    const chart = new Chart(ctx, config);
    chartStore[key] = chart;
    const legendContainer = document.getElementById(legendId);
    if(legendContainer) createLegend(legendContainer, chart);
  }

  function placeholderSemDados(){
    const div = document.createElement('div');
    div.className = 'sem-dados';
    div.textContent = 'Sem dados';
    div.style.padding = '24px';
    div.style.textAlign = 'center';
    div.style.opacity = '.8';
    div.style.border = '1px dashed rgba(255,255,255,.2)';
    div.style.borderRadius = '8px';
    return div;
  }

  // Gauge meia-rosca com SVG leve
  function renderGaugeMeiaRosca(el, valor){
    if(!el) return;
    const pct = Math.max(0, Math.min(100, Number(valor)||0));
    let cor = '#4CAF50';
    if(pct>=80) cor = '#E53935';
    else if(pct>=60) cor = '#FB8C00';

    el.innerHTML = `
      <svg viewBox="0 0 200 100" class="gauge-svg">
        <path d="M10,100 A90,90 0 0,1 190,100" stroke="rgba(255,255,255,.15)" stroke-width="18" fill="none" stroke-linecap="round"></path>
        <path d="M10,100 A90,90 0 0,1 ${10 + 180*(pct/100)},100" stroke="${cor}" stroke-width="18" fill="none" stroke-linecap="round"></path>
      </svg>
      <div class="gauge-value">${pct}%</div>
      <div class="kpi-label">OCUPAÇÃO</div>
    `;
  }

  // ============================
  //     FUNÇÃO PÚBLICA (GLOBAL)
  // ============================
  window.renderDashboardHospitalar = function renderDashboardHospitalar(hospitalId='todos'){
    ensureData();

    const root = document.getElementById('dashHospitalarContent') || document.getElementById('dashboard-hospitalar');
    if(!root){
      console.error('[DASH HOSP] Container #dashHospitalarContent não encontrado.');
      return;
    }
    root.innerHTML = '';

    const todos = (hospitalId==='todos' || hospitalId==='all' || hospitalId==='*');
    const ordem = ordenarHospitais(window.hospitalData);
    const alvos = todos ? ordem : ordem.filter(n=>String(n).toLowerCase()===String(hospitalId).toLowerCase());

    if(alvos.length===0){
      const msg = document.createElement('div');
      msg.className = 'sem-dados';
      msg.textContent = 'Nenhum hospital encontrado para exibição.';
      root.appendChild(msg);
      return;
    }

    for(const hid of alvos){
      const pacote = window.hospitalData[hid] || {};
      const leitos = Array.isArray(pacote.leitos) ? pacote.leitos : (Array.isArray(pacote) ? pacote : []);
      const meta   = pacote.meta || {};
      try{
        renderHospital(root, hid, leitos, meta);
      }catch(e){
        console.error('[DASH HOSP] Falha ao renderizar hospital', hid, e);
      }
    }
  };

  // Alias (retrocompat com menus antigos)
  window.renderizarDashboard = window.renderDashboardHospitalar;

  // ============================
  //      ESTILOS MÍNIMOS
  // ============================
  const css = document.createElement('style');
  css.textContent = `
    .bloco-hospital{ padding:16px 12px; border:1px solid rgba(255,255,255,.05); border-radius:12px; margin:16px 0; background:rgba(255,255,255,.02); }
    .titulo-hospital{ margin:0 0 12px 0; color:#7CFC9C; font-weight:700; letter-spacing:.5px; }
    .kpis{ display:grid; grid-gap:12px; }
    .kpis.linha1{ grid-template-columns: repeat(5, minmax(120px, 1fr)); }
    .kpis.linha2{ grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); margin-top:8px; }
    .kpi{ background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:14px; text-align:center; position:relative; }
    .kpi .kpi-value{ font-size:26px; font-weight:700; margin-bottom:6px; }
    .kpi .kpi-label{ font-size:11px; letter-spacing:.6px; opacity:.85; }
    .kpi .kpi-sub{ font-size:11px; opacity:.75; margin-top:6px; }
    .kpi.gauge{ display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .kpi.gauge .gauge-svg{ width:120px; height:60px; margin-bottom:8px; }
    .graf.bloco{ margin-top:18px; }
    .graf.bloco h3{ margin:0 0 8px 0; font-size:15px; font-weight:600; opacity:.95; }
    .legend-externa{ list-style:none; padding:6px 0 0 0; margin:6px 0 0 0; }
    .legend-externa li{ font-size:12px; }
    .sem-dados{ color:rgba(255,255,255,.8); }
    @media (max-width: 768px){
      .kpis.linha1{ grid-template-columns: repeat(2, 1fr); }
    }
  `;
  document.head.appendChild(css);

  console.log('[DASH HOSP] Dashboard Hospitalar V3.3.2 carregado');
})();

