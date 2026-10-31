'use strict';
(() => {
  const S = globalThis.PLEITO_SOURCES, C = globalThis.PLEITO_CONTENT;
  const main = document.querySelector('#main');
  const guidePath = S.guidePath || S.documents.find(d=>d.path.endsWith('/guia-pleito.md')).path;
  const pageRoot = new URL('.', location.href);
  const workspaceURL = new URL('../../../', new URL('.', location.href));
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const docs = S.documents;
  const byId = new Map(docs.map(d => [d.id,d]));
  const byPath = new Map(docs.map(d => [d.path,d]));
  const chapter = id => S.chapters.find(c => c.id === id) || S.chapters[0];
  const localURL = path => {
    if (S.publication || S.localDocuments) {
      const asset = (S.publication?.files || S.localDocuments)[path];
      return asset ? new URL(asset.split('/').map(encodeURIComponent).join('/'), pageRoot).href : null;
    }
    return new URL(path.split('/').map(encodeURIComponent).join('/'), workspaceURL).href;
  };
  const srcMatch = key => docs.find(d => d.id === key || d.path.includes(key));
  let sourceFilter = '', sourceKind = '', sourceMode = 'reading', fileFilter = '', fileKind = '', searchLimit = 25;
  let lastRoute = '';
  const announce = text => {document.querySelector('#announcement').textContent = text;};

  // Resolve links against the original document; preserve raw text separately.
  function resolveLink(href, origin) {
    if (!href) return null;
    if (href.startsWith('#')) return href;
    if (/^https?:\/\//i.test(href)) return href;
    if (/^[a-z][a-z\d+.-]*:/i.test(href)) return null;
    let clean;
    try {
      href = decodeURIComponent(href);
      if (href.startsWith('/home/ed/andre/repos/vote/')) clean = href.slice('/home/ed/andre/repos/vote/'.length);
      else clean = new URL(href, 'https://acervo.local/' + origin).pathname.slice(1);
      if (origin.endsWith('/docs/arquivos-tse-info.md') && href.startsWith('data/')) clean=href;
      if (/compilado-docs-data|guia-conferencia-dos-votos/.test(clean)) return null;
      if (clean.startsWith('docs/')) clean = 'vote-pipeline-analysis/' + clean;
      if (clean.includes('/docs/interactive/')) clean=clean.replace('/docs/interactive/','/docs/how-it-works/');
      if (clean.startsWith('vote-pipeline-analysis/docs/') && !clean.includes('official-knowledgebase') &&
          !clean.includes('/info/') && !clean.includes('/how-it-works/') && !clean.endsWith('arquivos-tse-info.md')) {
        clean = clean.replace('vote-pipeline-analysis/docs/', 'vote-pipeline-analysis/docs/official-knowledgebase/');
      }
      if (clean.startsWith('vote-pipeline-analysis/docs/interactive-docs/')) return null;
      const doc = byPath.get(clean);
      if (doc) return '#fontes/' + doc.id;
      if (clean.startsWith('@')) return null;
      return localURL(clean);
    } catch { return null; }
  }

  const renderer = new marked.Renderer();
  renderer.html = token => e(token.text);
  const allowed = new Set(['P','H1','H2','H3','H4','H5','H6','UL','OL','LI','A','STRONG','EM','DEL','CODE','PRE','BLOCKQUOTE','TABLE','THEAD','TBODY','TR','TH','TD','HR','BR','INPUT']);
  function md(text, origin = guidePath) {
    const box = document.createElement('template');
    box.innerHTML = marked.parse(text, {renderer, gfm:true, breaks:false});
    let head = 0;
    for (const node of [...box.content.querySelectorAll('*')]) {
      if (!allowed.has(node.tagName)) {node.replaceWith(document.createTextNode(node.textContent)); continue;}
      const href = node.tagName === 'A' ? node.getAttribute('href') : null;
      const isCheck = node.tagName === 'INPUT' && node.getAttribute('type') === 'checkbox';
      const checked = node.hasAttribute('checked');
      for (const a of [...node.attributes]) node.removeAttribute(a.name);
      if (node.tagName === 'A') {
        const target = resolveLink(href, origin);
        if (target) {
          node.setAttribute('href', target);
          if (/^https?:/.test(target)) {node.setAttribute('target','_blank');node.setAttribute('rel','noopener noreferrer');}
        } else {
          const span = document.createElement('span');span.textContent = node.textContent + (S.publication?' [arquivo não incluído nesta publicação]':' [referência fora do escopo deste guia]');node.replaceWith(span);
        }
      }
      if (node.tagName === 'INPUT') {
        if (isCheck) {node.type='checkbox';node.disabled=true;node.checked=checked;}
        else node.remove();
      }
      if (/^H[1-6]$/.test(node.tagName)) node.id = 'heading-' + (++head);
    }
    for (const t of box.content.querySelectorAll('table')) {
      const div = document.createElement('div');div.className='table-scroll';div.tabIndex=0;
      div.setAttribute('role','region');div.setAttribute('aria-label','Tabela com rolagem horizontal');
      t.replaceWith(div);div.append(t);
    }
    const container = document.createElement('div');container.append(box.content);return container.innerHTML;
  }

  function heading(eyebrow,title,intro='') {
    return `<p class="eyebrow">${e(eyebrow)}</p><h1>${e(title)}</h1>${intro?`<p class="intro">${e(intro)}</p>`:''}`;
  }
  function home() {
    main.innerHTML = `<div class="lead-grid"><div>${heading('Contratos oficiais · leitura para backend','Do voto aos arquivos públicos do TSE.','Entenda o processo técnico do pleito, os produtos de cada etapa e as chaves que relacionam os arquivos de urna e os resultados publicados.')}
      <div class="actions"><a class="button" href="#pipeline">Percorrer o pipeline →</a><a class="button secondary" href="#relacoes">Explorar os relacionamentos</a></div></div>
      <aside class="side-note"><span class="eyebrow">Modelo de leitura</span><p>Identidade do domínio, registros por cargo, totais da seção, assinaturas e representações públicas.</p><p class="note">O processo segue as fontes do TSE. O inventário identifica quais produtos estão no pacote baixado.</p></aside></div>
      <section class="process-overview" aria-labelledby="map-title"><h2 id="map-title">O pipeline técnico em ${C.stages.length} etapas</h2><p class="note">Cada etapa mostra entradas, processamento, produtos e regra de leitura. Selecione para aprofundar.</p>
      <div class="flow-grid">${C.stages.map(s=>`<a class="stage-node" href="#pipeline/${s.id}"><span class="num">${s.n}</span><span><strong>${e(s.title)}</strong><small>${e(s.short)}</small></span></a>`).join('')}</div>
      <div class="layer"><strong>Caminhos de produção:</strong> ${C.branches.map(b=>`<a href="#aprender/06">${e(b.name)}</a> · ${e(b.text)}`).join(' / ')}</div></section>
      <div class="reading-routes"><div class="route-item"><span class="eyebrow">01 / Processo e contratos</span><h3><a href="#aprender/01">Documentação técnica</a></h3><p>Preparação, votação, apuração, transmissão, totalização e divulgação, com os campos que preservam seu contexto.</p></div><div class="route-item"><span class="eyebrow">02 / Chaves e granularidades</span><h3><a href="#relacoes">Como os arquivos se ligam</a></h3><p>EA16 → EA18 → produtos da seção. RDV ↔ BU ↔ CSV. VSC, impressão e resultados agregados.</p></div><div class="route-item"><span class="eyebrow">03 / Produtos disponíveis</span><h3><a href="#arquivos">Biblioteca dos arquivos</a></h3><p>Função, conteúdo, contrato e disponibilidade. Exemplos simulados e referências complementares identificados.</p></div></div>
      <div class="facts"><span><strong>${S.chapters.length}</strong> capítulos técnicos</span><span><strong>${docs.length}</strong> documentos e referências</span><span>Busca e explicações disponíveis offline</span></div>
      <p class="note">Base documental: manuais e especificações TSE, referências oficiais consultadas em 30/10/2026 e <a href="#fontes/${srcMatch('arquivos-tse-info.md').id}">inventário do pacote baixado</a>. O guia é explicativo; os contratos oficiais são as fontes. <a href="#fontes">Consultar proveniência e referências.</a></p>`;
  }

  function pipeline(id) {
    const stage = C.stages.find(s=>s.id===id) || C.stages[0];
    main.innerHTML = `${heading('Etapas e relações','O pipeline do pleito','Acompanhe os produtos da preparação à divulgação. As etapas descrevem o processo eleitoral e seus contratos públicos.')}
      <div class="split"><aside class="sidenav" aria-label="Etapas do pipeline"><h2>ESCOLHA UMA ETAPA</h2>${C.stages.map(s=>`<a href="#pipeline/${s.id}" ${stage===s?'aria-current="step"':''}><span class="num">${s.n}</span><span>${e(s.title)}</span></a>`).join('')}<p class="note">VOTA, RED e SA são caminhos de produção: <a href="#aprender/06">ver a ramificação</a>.</p></aside>
      <div class="reader-wrap"><section class="detail-card"><span class="eyebrow">Etapa ${stage.n} / ${String(C.stages.length).padStart(2,'0')}</span><h2>${e(stage.title)}</h2><dl><dt>Entrada</dt><dd>${e(stage.input)}</dd><dt>O que acontece</dt><dd>${e(stage.work)}</dd><dt>Saída</dt><dd>${e(stage.output)}</dd><dt>Regra que organiza esta etapa</dt><dd>${e(stage.rule)}</dd></dl><p class="note">Produtos e referências: ${stage.files.map(e).join(' · ')}</p><a href="#aprender/${stage.chapter}">Abrir este capítulo na documentação →</a></section>
      <article class="reader">${md(chapter(stage.chapter).text)}</article>${chapterNav(stage.chapter)}</div></div>`;
  }
  function chapterNav(id) {
    const i = S.chapters.findIndex(c=>c.id===id), prev=S.chapters[i-1], next=S.chapters[i+1];
    return `<nav class="chapter-navigation" aria-label="Capítulos próximos">${prev?`<a href="#aprender/${prev.id}">← ${e(prev.title)}</a>`:'<span></span>'}${next?`<a href="#aprender/${next.id}">${e(next.title)} →</a>`:'<a href="#fontes">Consultar as fontes →</a>'}</nav>`;
  }
  function learn(id) {
    const c=chapter(id);
    main.innerHTML=`<div class="split"><aside class="sidenav" aria-label="Capítulos da documentação"><h2>DOCUMENTAÇÃO COMPLETA</h2>${S.chapters.map(x=>`<a href="#aprender/${x.id}" ${x.id===c.id?'aria-current="page"':''}><span class="num">${x.id}</span><span>${e(x.title)}</span></a>`).join('')}</aside><div class="reader-wrap"><p class="chapter-meta">Capítulo ${c.id} de ${S.chapters.length} · <a href="#fontes/${byPath.get(guidePath).id}">Texto completo do guia</a></p>${heading('Aprenda em sequência',c.title)}<article class="reader">${md(c.text)}</article>${chapterNav(c.id)}</div></div>`;
  }

  function relationships(id) {
    const selected=C.nodes.find(n=>n.id===id)||C.nodes.find(n=>n.id==='bu');
    const layers=['Cadastro e disponibilidade','Produtos do resultado da seção','Representações públicas de resultado'];
    main.innerHTML=`${heading('Chaves · granularidade · proveniência','Como os arquivos oficiais se relacionam','Selecione um objeto para ver produtor, momento, granularidade e campos de ligação. As linhas conceituais descrevem os contratos públicos.')}
      <div class="relationship-layout"><section class="artifact-map" aria-label="Mapa de relacionamentos dos arquivos">${layers.map((label,i)=>`<div class="graph-layer"><h2><span class="num">0${i+1}</span> ${label}</h2><div class="graph-row ${i===1?'products':''}">${C.nodes.filter(n=>n.layer===i).map(n=>`<a class="graph-node" href="#relacoes/${n.id}" ${n===selected?'aria-current="true"':''}><strong>${e(n.title)}</strong><small>${e(n.grain)}</small></a>`).join('')}</div></div>`).join('')}<div class="relationship-caption"><p><strong>Identificação:</strong> EA16 → EA18 → nomes dos produtos.</p><p><strong>Conteúdo:</strong> RDV ↔ subtotais do BU ↔ linhas do CSV.</p><p><strong>Integridade:</strong> VSC → arquivos relacionados; cadeia de tuplas → totais do BU.</p><p><strong>Consolidação:</strong> resultados da seção → resultado por abrangência. Snapshots sucessivos são retratos desse estado.</p></div></section>
      <article class="detail-card relationship-detail"><span class="eyebrow">Objeto selecionado</span><h2>${e(selected.title)}</h2><p>${e(selected.role)}</p><dl><dt>Produtor / papel</dt><dd>${e(selected.producer)}</dd><dt>Momento</dt><dd>${e(selected.moment)}</dd><dt>Granularidade</dt><dd>${e(selected.grain)}</dd><dt>Campos de ligação</dt><dd><code>${e(selected.key)}</code></dd><dt>Relações</dt><dd><ul>${selected.links.map(t=>`<li>${e(t)}</li>`).join('')}</ul></dd></dl><div class="actions"><a class="button secondary" href="#aprender/${selected.chapter}">Ler o contrato explicado</a><a class="button secondary" href="#fontes/${srcMatch(selected.source).id}">Consultar a referência</a></div></article></div>
      <section class="workbench"><span class="eyebrow">Ligações entre representações</span><h2>Qual chave liga este par de arquivos?</h2><label for="join-select">Relação<select id="join-select">${C.joins.map(j=>`<option value="${j.id}">${e(j.title)}</option>`).join('')}</select></label><div id="join-detail" role="status"></div><p class="note">As chaves mostram as dimensões semânticas. A posição e a representação de cada campo são definidas no contrato correspondente.</p></section>`;
    function explainJoin(){
      const j=C.joins.find(x=>x.id===document.querySelector('#join-select').value);
      document.querySelector('#join-detail').innerHTML=`<div class="mini-columns"><div class="result-line"><small>Origem / representação A</small><p><code>${e(j.left)}</code></p></div><div class="result-line"><small>Destino / representação B</small><p><code>${e(j.right)}</code></p></div></div><p>${e(j.meaning)}</p><a href="#aprender/${j.chapter}">Aprofundar esta relação →</a>`;
    }
    document.querySelector('#join-select').addEventListener('change',explainJoin);explainJoin();
  }

  function sourceRole(d) {
    if(d.description) return d.description;
    const name=d.path.split('/').pop();
    if(C.roles[name]) return C.roles[name];
    if(d.path.includes('/exemplos-de-boletins')) return 'Representação visual de um cenário oficial de documentação do BU com QR code. A fase s identifica simulado.';
    if(d.path.includes('Resumos digitais')) return 'Referência de programas e resumos digitais dos sistemas preparados para o pleito.';
    if(d.path.includes('/formato-')&&name==='README.pdf') return 'Manual de produtos da urna: sistemas de origem, formatos, nomenclatura e integridade dos dados.';
    if(name.includes('6257_')) return 'Relatório presidencial de primeiro turno em MG, eleição 6257; produto de totalização complementar.';
    if(name.includes('6259_')) return 'Relatório de primeiro turno das eleições estaduais de MG, eleição 6259; produto de totalização complementar.';
    if(name==='_leiame.pdf') return 'Conteúdo e nomenclatura dos relatórios de totalização.';
    if(name==='leiame.pdf') return 'Leiaute oficial do CSV de votação por seção: campos, codificação, delimitador e convenções.';
    if(d.kind.startsWith('JSON')) return d.path.includes('configuracoes')?'Amostra completa do cadastro de seções de AC no pleito 3221.':d.path.includes('auxiliares')?'Amostra completa do EA18 da seção CE-13897-0095-0364.':'Amostra completa de um resultado presidencial de abrangência PI. Documento independente do exemplo CE.';
    return 'Nomes exatos das colunas do CSV de votação por seção de MG disponível no pacote baixado.';
  }

  const sourceType=d=>d.externalUrl?'Referência oficial':d.kind.startsWith('PDF')?'Manual / PDF':d.kind.startsWith('JSON')?'Amostra JSON':d.kind;
  const exampleFiles=docs.filter(d=>d.path.includes('/exemplos-de-boletins')&&d.path.endsWith('.pdf')).map(d=>({id:'dat-'+d.id,name:d.path.split('/').pop().replace(/\.pdf$/,'.dat'),type:'Exemplo DAT',context:'Impressão · simulado',role:'Arquivo de conteúdo de impressão do cenário de demonstração correspondente ao PDF.',inside:'Conteúdo DAT do BU de exemplo, com protocolo próprio de impressão.',relation:'O PDF associado oferece a leitura visual. O nome preserva a fase s de simulado e o cenário/modelo.',where:d.path.replace(/\.pdf$/,'.dat'),original:d.path.replace(/\.pdf$/,'.dat'),scope:'Material de referência para aprender os layouts e os QR codes, separado dos resultados em data.',source:d.id,chapter:'17'}));
  const catalog = [...C.families,...docs.map(d=>({id:d.id,name:d.path.split('/').pop(),type:sourceType(d),context:d.group,role:sourceRole(d),inside:d.externalUrl?'Nota de referência com link para o documento oficial online.':`${d.kind}${d.pages?` · ${d.pages} páginas de texto extraídas`:''}. Texto local completo disponível no leitor.`,relation:'A explicação editorial e o texto original ficam separados; o leitor permite consultar a fonte.',where:d.path,scope:d.externalUrl?'O documento original é acessado no portal oficial. A nota de referência fica disponível offline.':d.kind.startsWith('PDF')?'O texto extraído pode não reproduzir a diagramação e as figuras. O PDF original permanece acessível.':'O texto está incorporado integralmente no snapshot local.',source:d.id})),...exampleFiles];

  function files(id) {
    const selected=catalog.find(f=>f.id===id)||catalog[0];
    const types=[...new Set(catalog.map(f=>f.type))].sort((a,b)=>a.localeCompare(b,'pt'));
    main.innerHTML=`${heading('A função de cada peça','Biblioteca dos arquivos','Produtos e contratos públicos relacionados ao pleito. Cada entrada distingue tipo documentado, produto disponível, amostra e referência oficial.')}
      <div class="toolbar"><label>Buscar nome, função ou caminho<input id="file-search" type="search" value="${e(fileFilter)}" placeholder="Ex.: log, certificado, totalização…"></label><label>Tipo de arquivo<select id="file-type"><option value="">Todos os tipos</option>${types.map(t=>`<option ${t===fileKind?'selected':''}>${e(t)}</option>`).join('')}</select></label></div><p id="file-count" class="count" role="status"></p>
      <div class="catalog-grid"><div class="file-list" id="file-list" aria-label="Arquivos encontrados"></div><article id="file-detail" class="detail-card"></article></div>`;
    function list() {
      const matches=catalog.filter(f=>(!fileKind||f.type===fileKind)&&norm([f.name,f.role,f.where,f.context,f.inside].join(' ')).includes(norm(fileFilter)));
      document.querySelector('#file-count').textContent=`${matches.length} de ${catalog.length} entradas · ${C.families.length} famílias, ${docs.length} fontes e ${exampleFiles.length} exemplos DAT.`;
      document.querySelector('#file-list').innerHTML=matches.length?matches.map(f=>`<button type="button" class="file-row" data-file="${f.id}" aria-pressed="${f.id===selected.id}"><strong>${e(f.name)}</strong><small>${e(f.type)} · ${e(f.context)}</small></button>`).join(''):'<p class="empty">Nenhum arquivo corresponde aos filtros. O detalhe selecionado continua disponível.</p>';
    }
    list();
    const d=selected.source?srcMatch(selected.source):null;
    document.querySelector('#file-detail').innerHTML=`<span class="badge">${e(selected.type)}</span><h2>${e(selected.name)}</h2><p>${e(selected.role)}</p><dl><dt>O que contém</dt><dd>${e(selected.inside)}</dd><dt>Como se relaciona</dt><dd>${e(selected.relation)}</dd><dt>Onde está</dt><dd class="path">${e(selected.where)}</dd><dt>Contexto da leitura</dt><dd>${e(selected.scope)}</dd></dl><div class="actions">${selected.chapter?`<a class="button secondary" href="#aprender/${selected.chapter}">Ler a explicação</a>`:''}${d?`<a class="button secondary" href="#fontes/${d.id}">Abrir a fonte completa</a>`:''}${selected.original&&localURL(selected.original)?`<a class="button secondary" href="${e(localURL(selected.original))}">Abrir DAT do exemplo</a>`:''}</div>`;
    document.querySelector('#file-search').addEventListener('input',ev=>{fileFilter=ev.target.value;list();});
    document.querySelector('#file-type').addEventListener('change',ev=>{fileKind=ev.target.value;list();});
  }

  function labs() {
    main.innerHTML=`${heading('Interações para aprender','Explore os conceitos','Cada controle explica um contrato oficial. As quantidades de votos são fictícias e as situações ilustram os domínios publicados.')}
      <section class="workbench" aria-labelledby="name-title"><span class="eyebrow">01 / Identificação</span><h2 id="name-title">Leia um nome de arquivo</h2><p>O prefixo reúne fase, pleito, UF, município, zona e seção. O sufixo identifica o produto.</p><label for="name-input">Nome de arquivo de resultado</label><input id="name-input" type="text" value="o03221ce1389700950364-bu.dat" spellcheck="false"><div id="name-result" role="status"></div><p class="note">Padrão: fpppppuuMMMMMZZZZSSSS-suf.ext. O EA18 usa outro padrão de nome, com pleito de seis dígitos. <a href="#aprender/02">Entender as chaves.</a></p></section>
      <section class="workbench" aria-labelledby="state-title"><span class="eyebrow">02 / Recebimento e publicação</span><h2 id="state-title">Dois níveis de situação no EA18</h2><p>Selecione um momento para ver os campos previstos no manual. As opções após a totalização são domínios separados; o manual não estabelece todas as combinações entre eles.</p><div class="choice-buttons" id="state-buttons"><button type="button" data-state="before" aria-pressed="true">Antes do recebimento</button><button type="button" data-state="received" aria-pressed="false">Arquivos recebidos</button><button type="button" data-state="final" aria-pressed="false">Após a totalização final</button></div><div id="state-result" role="status"></div><p class="note"><a href="#aprender/14">Ler o fluxo e o dicionário EA18.</a></p></section>
      <section class="workbench" aria-labelledby="enum-title"><span class="eyebrow">03 / Classificação semântica</span><h2 id="enum-title">O mesmo significado, códigos diferentes</h2><label for="vote-kind">Categoria de voto<select id="vote-kind"><option value="nominal">Nominal</option><option value="legenda">Legenda</option><option value="branco">Branco</option><option value="nulo">Nulo</option><option value="especial">Nulo por repetição · categoria especial do RDV</option></select></label><div id="enum-result" role="status"></div><p class="note"><a href="#aprender/12">Ver todas as categorias e os campos opcionais.</a></p></section>
      <section class="workbench" aria-labelledby="count-title"><span class="eyebrow">04 / Registros e subtotais</span><h2 id="count-title">Do RDV aos totais do BU</h2><p class="example-label">Exemplo fictício: um cargo majoritário com uma escolha, sem categorias especiais.</p><p>Altere as quantidades para ver como registros da mesma categoria se tornam subtotais. A demonstração usa candidatos A e B.</p><div class="sample-inputs"><label>Candidato A<input type="number" data-count="a" min="0" max="100" value="4"></label><label>Candidato B<input type="number" data-count="b" min="0" max="100" value="2"></label><label>Brancos<input type="number" data-count="white" min="0" max="100" value="1"></label><label>Nulos<input type="number" data-count="null" min="0" max="100" value="1"></label></div><div id="count-result" role="status"></div><p class="note">O limite 0–100 pertence somente ao controle didático. As regras do cargo e quantidadeEscolhas acompanham a leitura de arquivos reais. <a href="#aprender/20">Seguir o exemplo completo.</a></p></section>`;
    main.insertAdjacentHTML('beforeend',`<section class="workbench" aria-labelledby="progress-title"><span class="eyebrow">05 / Estado da divulgação</span><h2 id="progress-title">Andamento, totalização final e definição matemática</h2><p>Os indicadores do EA20 têm significados diferentes. Selecione um exemplo conceitual, sem dados de uma disputa real.</p><div class="choice-buttons" id="progress-buttons"><button type="button" data-progress="and" aria-pressed="true">Andamento finalizado</button><button type="button" data-progress="tf" aria-pressed="false">Totalização final</button><button type="button" data-progress="md" aria-pressed="false">Definição matemática</button></div><div id="progress-result" role="status"></div><p class="note"><a href="#aprender/15">Consultar os campos e as condições do EA20.</a></p></section>`);
    function progress(which){
      const cases={and:['{"and":"f","tf":"n"}','Exemplo de leitura em uma abrangência de eleição geral: o andamento pode estar finalizado sem totalização final. O contexto da abrangência acompanha o significado de and.'],tf:['{"tf":"s"}','O campo informa existência de totalização final. Esse significado não é deduzido apenas do percentual de seções.'],md:['{"tf":"n","md":"e"}','Exemplo para os cargos e condições previstos: definição matemática de eleito antes da totalização final. O contrato também prevê segundo turno e condição de não definido.']};
      document.querySelectorAll('[data-progress]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.progress===which)));
      const item=cases[which];document.querySelector('#progress-result').innerHTML=`<pre><code>${e(item[0])}</code></pre><p>${e(item[1])}</p>`;
    }
    document.querySelector('#progress-buttons').addEventListener('click',ev=>{const b=ev.target.closest('[data-progress]');if(b)progress(b.dataset.progress);});progress('and');
    const input=document.querySelector('#name-input');
    function parseName(){
      const m=input.value.trim().match(/^([os])(\d{5})([a-z]{2})(\d{5})(\d{4})(\d{4})-([a-z\d]+)\.(dat|vsc|jez|ver)$/i);
      if(!m){document.querySelector('#name-result').innerHTML='<p class="callout warning">O nome não corresponde ao padrão de resultado descrito. Exemplo: o03221ce1389700950364-rdv.dat.</p>';return;}
      const known={'bu.dat':'BU · totais','busa.dat':'BU do SA','rdv.dat':'RDV · registros','rdvred.dat':'RDV recuperado','imgbu.dat':'Impressão do BU','imgbusa.dat':'Impressão do SA','vota.vsc':'Assinaturas VOTA','sa.vsc':'Assinaturas SA','red.vsc':'Assinaturas RED','log.jez':'Log da urna','logsa.jez':'Log do SA','hash.dat':'Hashes','imgze.dat':'Impressão da zerésima','jufa.dat':'Comparecimento','mr.ver':'Versões dos pacotes ASN.1','wsqbio.jez':'Imagens biométricas','wsqman.jez':'Imagens da habilitação manual','wsqmes.jez':'Imagens de mesários'};
      const suffix=(m[7]+'.'+m[8]).toLowerCase();
      const tokens=[['Fase',m[1].toLowerCase()==='o'?'Oficial · o':'Simulado · s'],['Pleito',m[2]],['UF',m[3].toUpperCase()],['Município eleitoral',m[4]],['Zona',m[5]],['Seção',m[6]],['Produto',known[suffix]||suffix+' · sufixo não identificado']];
      document.querySelector('#name-result').innerHTML=`<div class="token-grid">${tokens.map(([label,value])=>`<div class="token"><small>${e(label)}</small><strong>${e(value)}</strong></div>`).join('')}</div><p class="note">Esta leitura interpreta a sintaxe do nome. A identificação interna e a versão são informações do conteúdo e do auxiliar.</p>`;
    }
    input.addEventListener('input',parseName);parseName();
    function state(which){
      document.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state===which)));
      const r=document.querySelector('#state-result');
      if(which==='before')r.innerHTML='<div class="result-line">Não há JSON gerado para a seção, conforme o momento anterior ao recebimento descrito no EA18.</div>';
      if(which==='received')r.innerHTML='<div class="mini-columns"><div class="result-line">Seção: <strong>Recebida</strong><br><small>Campo st na raiz</small></div><div class="result-line">Hash: <strong>Recebido</strong><br><small>Campo hashes[].st</small></div></div><p class="note">O JSON é gerado com os dados do último hash recebido. A lista arq anuncia nomes e tipos.</p>';
      if(which==='final')r.innerHTML='<div class="mini-columns"><div><h3>Domínio da seção</h3><ul><li>Não instalada</li><li>Não apurada</li><li>Anulada</li><li>Totalizada</li></ul></div><div><h3>Domínio do hash</h3><ul><li>Rejeitado</li><li>Excluído</li><li>Totalizado</li></ul></div></div><p class="note">O JSON é atualizado após totalização final ou retransmissão. Estes conjuntos de valores não formam uma lista de combinações automáticas.</p>';
    }
    document.querySelector('#state-buttons').addEventListener('click',ev=>{const b=ev.target.closest('[data-state]');if(b)state(b.dataset.state);});state('before');
    const vote=document.querySelector('#vote-kind');
    function enumResult(){
      const map={nominal:[2,1,'Identificação do candidato e contexto do cargo.'],legenda:[1,4,'Identificação do partido; o manual descreve legenda nos cargos proporcionais.'],branco:[3,2,'Digitação ausente no RDV; identificação do votável omitida no BU.'],nulo:[4,3,'Preserve a classificação de nulo, mesmo quando há digitação registrada.'],especial:[7,'Sem equivalente automático','Preserve esta categoria separada até aplicar a regra de representação da eleição/cargo.']};
      const a=map[vote.value];document.querySelector('#enum-result').innerHTML=`<div class="mini-columns"><div class="result-line">Código no RDV: <strong>${e(a[0])}</strong></div><div class="result-line">Código no BU: <strong>${e(a[1])}</strong></div></div><p>${e(a[2])}</p>`;
    }
    vote.addEventListener('change',enumResult);enumResult();
    function recount(){
      const values=[...document.querySelectorAll('[data-count]')].map(x=>Number(x.value));
      if(values.some((n,i)=>!Number.isInteger(n)||n<0||n>100||document.querySelectorAll('[data-count]')[i].value==='')){document.querySelector('#count-result').innerHTML='<p class="callout warning">Use quantidades inteiras de 0 a 100 em todos os campos.</p>';return;}
      const total=values.reduce((a,b)=>a+b,0), labels=['Nominal A','Nominal B','Branco','Nulo'];
      document.querySelector('#count-result').innerHTML=`<div class="result-line"><strong>${total}</strong> registros ilustrativos → <strong>${values.filter(x=>x>0).length}</strong> grupos com quantidade positiva.</div><div class="table-scroll"><table><thead><tr><th>Categoria</th><th>Tipo RDV</th><th>Tipo BU</th><th>Subtotal</th></tr></thead><tbody>${values.map((v,i)=>`<tr><td>${labels[i]}</td><td>${[2,2,3,4][i]}</td><td>${[1,1,2,3][i]}</td><td>${v}</td></tr>`).join('')}</tbody></table></div><p class="note">A conta agrupa registros em categorias equivalentes. O BU armazena quantidades; o RDV armazena registros.</p>`;
    }
    document.querySelectorAll('[data-count]').forEach(x=>x.addEventListener('input',recount));recount();
  }

  function sources(id) {
    const d=byId.get(id)||srcMatch('arquivos-tse-info.md');
    main.innerHTML=`${heading('Texto original e proveniência','Fontes e contratos','Leia os textos locais completos e as notas com links oficiais. A proveniência distingue contrato TSE, amostra, inventário e explicação editorial.')}
      <div class="toolbar"><label>Buscar no conteúdo integral das fontes<input id="source-search" type="search" value="${e(sourceFilter)}" placeholder="Nome, caminho ou qualquer trecho…"></label><label>Grupo<select id="source-kind"><option value="">Todos os grupos</option>${[...new Set(docs.map(x=>x.group))].map(t=>`<option ${t===sourceKind?'selected':''}>${e(t)}</option>`).join('')}</select></label></div><p id="source-count" class="count" role="status"></p>
      <div class="source-layout"><aside id="source-list" class="source-list" aria-label="Documentos do snapshot"></aside><div id="source-detail" class="reader-wrap"></div></div>`;
    function list(){
      const matches=docs.filter(x=>(!sourceKind||x.group===sourceKind)&&norm(x.title+' '+x.path+' '+x.text).includes(norm(sourceFilter)));
      document.querySelector('#source-count').textContent=`${matches.length} de ${docs.length} fontes correspondem aos filtros.${matches.includes(d)?'':' A fonte selecionada continua aberta à direita/abaixo.'}`;
      document.querySelector('#source-list').innerHTML=matches.length?matches.map(x=>`<button type="button" data-source="${x.id}" aria-pressed="${x.id===d.id}">${e(x.title)}<small>${e(x.kind)}</small></button>`).join(''):'<p class="empty">Nenhuma fonte encontrada. Tente outro termo ou grupo.</p>';
    }
    function detail(){
      const isMd=d.kind==='Markdown'||Boolean(d.externalUrl),isPdf=d.kind.startsWith('PDF');
      const originalURL=!d.path.startsWith('@')?localURL(d.path):d.originalPath?localURL(d.originalPath):null;
      document.querySelector('#source-detail').innerHTML=`<p class="eyebrow">${e(d.nature||d.kind)}</p><h2>${e(d.title)}</h2><div class="source-meta"><p>${e(d.path)}</p><p>${e(sourceRole(d))}</p>${d.sha256?`<p>SHA-256 do arquivo original: <code>${e(d.sha256)}</code></p>`:''}<p>Snapshot textual · ${d.externalUrl?'Nota editorial com link para a referência oficial; não é o texto integral do documento online.':isPdf?`${d.pages} páginas de texto extraídas. Figuras e diagramação estão no PDF original.`:'Texto local integral incorporado, com sua proveniência identificada.'}</p></div><div class="source-actions">${d.externalUrl?`<a class="button secondary" href="${e(d.externalUrl)}" target="_blank" rel="noopener noreferrer">Abrir referência oficial</a>`:originalURL?`<a class="button secondary" href="${e(originalURL)}">${d.originalPath?'Abrir CSV original':'Abrir arquivo original'}</a>`:''}${isMd?`<button class="button secondary" id="toggle-source" type="button">${sourceMode==='raw'?'Ver leitura formatada':'Ver texto bruto exato'}</button>`:''}<button class="button secondary" id="download-source" type="button">Baixar texto incorporado</button></div>${S.publication&&!d.externalUrl&&!originalURL?'<p class="note">O texto ou cabeçalho está incorporado abaixo. O arquivo de dados brutos não acompanha esta publicação.</p>':''}<div id="source-toc"></div><article id="source-body" class="source-body reader"></article>`;
      const body=document.querySelector('#source-body');
      if(isMd&&sourceMode!=='raw')body.innerHTML=md(d.text,d.path);
      else if(isPdf&&sourceMode!=='raw'){
        body.innerHTML=d.text.split(/(?=──── Página \d+ ────)/).filter(x=>x.trim()).map((page,i)=>`<section id="pdf-page-${i+1}"><h3>Página ${i+1}</h3><pre class="raw-source">${e(page.replace(/^──── Página \d+ ────\n/,''))}</pre></section>`).join('');
      }else body.innerHTML=`<pre class="raw-source">${e(d.text)}</pre>`;
      const headings=[...body.querySelectorAll('h1,h2,h3')];
      const toc=document.querySelector('#source-toc');
      if(headings.length)toc.innerHTML=`<details class="source-toc"><summary>Sumário do documento · ${headings.length} itens</summary>${headings.map(h=>`<a href="#${h.id}" data-scroll="${h.id}">${e(h.textContent)}</a>`).join('')}</details>`;
      if(isMd)document.querySelector('#toggle-source').addEventListener('click',()=>{sourceMode=sourceMode==='raw'?'reading':'raw';detail();});
      document.querySelector('#download-source').addEventListener('click',()=>{
        const blob=new Blob([d.text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url;a.download=d.path.split('/').pop()+(isPdf?'.extraido.txt':'.txt');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Texto incorporado preparado para download.');
      });
    }
    document.querySelector('#source-search').addEventListener('input',ev=>{sourceFilter=ev.target.value;list();});
    document.querySelector('#source-kind').addEventListener('change',ev=>{sourceKind=ev.target.value;list();});
    list();detail();
  }

  const dialog=document.querySelector('#search-dialog'), search=document.querySelector('#global-search');
  const searchIndex=[...S.chapters.map(c=>({title:c.title,type:'Capítulo '+c.id,text:c.text,href:'#aprender/'+c.id})),...catalog.map(f=>({title:f.name,type:'Biblioteca · '+f.type,text:[f.role,f.inside,f.where,f.context].join(' '),href:'#arquivos/'+f.id})),...docs.map(d=>({title:d.title,type:'Fonte · '+d.kind,text:d.path+'\n'+d.text,href:'#fontes/'+d.id}))].map(x=>({...x,normalized:norm(x.title+' '+x.text)}));
  function searchAll(reset=true){
    if(reset)searchLimit=25;
    const q=norm(search.value.trim());
    const output=document.querySelector('#search-results'),count=document.querySelector('#search-count');
    if(q.length<2){count.textContent='Digite ao menos dois caracteres. A busca percorre todos os capítulos, funções e textos integrais incorporados.';output.innerHTML='';return;}
    const results=searchIndex.filter(x=>x.normalized.includes(q));
    count.textContent=`${results.length} resultados. Exibindo ${Math.min(searchLimit,results.length)}. Busca sem distinção de acentos ou maiúsculas.`;
    output.innerHTML=results.length?results.slice(0,searchLimit).map(r=>{
      const pos=Math.max(0,norm(r.text).indexOf(q)),excerpt=r.text.slice(Math.max(0,pos-60),pos+180).replace(/\s+/g,' ');
      return `<a href="${r.href}" data-search-result><small>${e(r.type)}</small><strong>${e(r.title)}</strong><p>${pos>60?'… ':''}${e(excerpt)}…</p></a>`;
    }).join('')+(results.length>searchLimit?'<button type="button" class="button secondary" id="more-search">Mostrar mais 25 resultados</button>':''):'<p class="empty">Nenhum resultado. Experimente um conceito ou parte do nome de um arquivo.</p>';
    const more=document.querySelector('#more-search');if(more)more.addEventListener('click',()=>{searchLimit+=25;searchAll(false);});
  }
  function openSearch(){dialog.showModal();search.focus();searchAll();}
  document.querySelector('#search-open').addEventListener('click',openSearch);
  document.querySelector('#search-close').addEventListener('click',()=>dialog.close());
  search.addEventListener('input',()=>searchAll());
  document.addEventListener('keydown',ev=>{if(ev.key==='/'&&!dialog.open&&!/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)){ev.preventDefault();openSearch();}});
  document.addEventListener('click',ev=>{
    const scroll=ev.target.closest('[data-scroll]');
    if(scroll){ev.preventDefault();document.getElementById(scroll.dataset.scroll)?.scrollIntoView({block:'start'});return;}
    const source=ev.target.closest('[data-source]');if(source){location.hash='fontes/'+source.dataset.source;return;}
    const file=ev.target.closest('[data-file]');if(file){location.hash='arquivos/'+file.dataset.file;return;}
    if(ev.target.closest('[data-search-result]'))dialog.close();
  });
  function render(){
    const [view='inicio',id]=location.hash.slice(1).split('/');
    if(view.startsWith('heading-')||view.startsWith('pdf-page-'))return;
    const actual=['inicio','pipeline','aprender','relacoes','arquivos','laboratorio','fontes'].includes(view)?view:'inicio';
    document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===actual)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const sameView=lastRoute.split('/')[0]===actual;
    ({inicio:home,pipeline,aprender:learn,relacoes:relationships,arquivos:files,laboratorio:labs,fontes:sources})[actual](id);
    const side=main.querySelector('.sidenav'), active=side?.querySelector('[aria-current]');
    if(side&&active)side.scrollTop+=active.getBoundingClientRect().top-side.getBoundingClientRect().top-side.clientHeight/2+active.clientHeight/2;
    if(!sameView||!['fontes','arquivos','relacoes'].includes(actual))window.scrollTo(0,0);
    if(lastRoute&&!['fontes','arquivos','relacoes'].includes(actual))main.focus({preventScroll:true});
    lastRoute=actual+'/'+(id||'');
    document.title=(main.querySelector('h1')?.textContent||'Pleito eleitoral')+' · Guia interativo';
    announce('Conteúdo aberto: '+document.title);
  }
  document.querySelector('#print').addEventListener('click',()=>{
    let print=document.querySelector('.full-print');if(!print){print=document.createElement('article');print.className='full-print';document.body.append(print);}
    print.innerHTML=md(byPath.get(guidePath).text);window.print();
  });
  if(S.publication)document.querySelector('.offline-label').textContent='Guia e documentos';
  window.addEventListener('hashchange',render);render();
})();
