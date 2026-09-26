const $=q=>document.querySelector(q);const fmt=(v,d=1)=>v==null||Number.isNaN(Number(v))?'—':Number(v).toFixed(d);
let report=null,caps=null,hist=null;
function issueHtml(x){return `<div class="issue"><span class="badge ${x.severity}">${x.severity}</span><div><strong>${x.title}</strong><p>${x.detail}</p></div></div>`}
function render(){
 $('#s-updated').textContent='Atualizado '+new Date(report.generated_utc).toLocaleString('pt-PT');
 $('#s-score').textContent=(report.health_score??'—')+'/100'; $('#s-status').textContent=report.status||'—';
 $('#s-temp').textContent=fmt(report.station?.temperature)+' °C';
 const ec=report.external_temperature_context;$('#s-temp-context').textContent=ec?`IPMA mediana ${fmt(ec.ipma_median_temperature_c)} °C · diferença ${ec.difference_c>0?'+':''}${fmt(ec.difference_c)} °C`:'sem comparação externa suficiente';
 $('#s-ipma-count').textContent=report.source_context?.nearby_station_count??0;
 const db=report.database||{};$('#s-db').textContent=db.persistent_mount_active?'persistente':'temporária';
 $('#s-db-note').textContent=db.persistent_mount_active?`${db.rows?.local_observations||0} obs. locais`:'falta montar /meteo-ai';
 const issues=report.issues||[];$('#s-issues').innerHTML=issues.length?issues.map(issueHtml).join(''):`<div class="issue"><span class="badge normal">normal</span><div><strong>Sem incoerências relevantes</strong><p>As regras do Sentinel não detetaram sinais que justifiquem aviso nesta atualização.</p></div></div>`;
 $('#s-ipma').innerHTML=(report.nearby_ipma||[]).map(x=>`<div class="station"><div><strong>${x.station_name}</strong><span>${fmt(x.distance_km)} km · ${x.observed_utc||'hora indisponível'}</span></div><div class="right"><strong>${fmt(x.temperature)} °C</strong><span>HR ${fmt(x.humidity,0)}% · vento ${fmt(x.wind_kmh)} km/h</span></div></div>`).join('')||'<div class="station"><span>Sem observações IPMA disponíveis.</span></div>';
 const gpu=caps.gpu||{},dbc=caps.database||{},ml=caps.ml||{};
 $('#s-cap').innerHTML=[
  ['SQLite',dbc.persistent_mount_active?'Persistência ativa':'Persistência por configurar',dbc.warning||dbc.path],
  ['Intel GPU no container',gpu.render_device_visible_in_container?'renderD128 visível':'ainda não exposta ao container',gpu.note],
  ['Machine learning',ml.status,ml.next]
 ].map(x=>`<div class="cap"><strong>${x[0]} · ${x[1]}</strong><span>${x[2]||''}</span></div>`).join('');
 $('#s-history').innerHTML=(hist.events||[]).slice(0,20).map(x=>`<div class="hist"><strong>${x.title} · ${x.severity}${x.active?' · ativo':''}</strong><span>${new Date(x.last_seen_utc).toLocaleString('pt-PT')} · ${x.count} ocorrência(s) · ${x.detail}</span></div>`).join('')||'<div class="hist"><span>Ainda não há eventos arquivados.</span></div>';
}
async function init(){try{const t=Date.now();[report,caps,hist]=await Promise.all([
 fetch('/api/v1/sentinel.json?t='+t,{cache:'no-store'}).then(r=>r.json()),
 fetch('/api/v1/ai-capabilities.json?t='+t,{cache:'no-store'}).then(r=>r.json()),
 fetch('/api/v1/sentinel-history.json?t='+t,{cache:'no-store'}).then(r=>r.json())]);render()}catch(e){document.querySelector('.s-page').innerHTML='<div class="panel">Sentinel v4 ainda não disponível.</div>'}}
init();