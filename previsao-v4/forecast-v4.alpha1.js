const $=q=>document.querySelector(q);let data=null;
const fmt=(v,d=1)=>v==null||Number.isNaN(Number(v))?'—':Number(v).toFixed(d);
const dt=s=>{try{return new Intl.DateTimeFormat('pt-PT',{weekday:'short',day:'2-digit',month:'short'}).format(new Date(s+'T12:00:00'))}catch{return s}};
function rowFor(model,day){return (model?.daily||[]).find(x=>x.date===day)||null}
function consensusDay(day){return (data?.consensus?.days||[]).find(x=>x.date===day)||null}
function modelMeta(key){return data?.models?.[key]||{}}
function renderDays(){
 const host=$('#v4-days'),days=(data?.consensus?.days||[]).slice(0,8);
 if(!days.length){host.innerHTML='<div class="mr-empty">Sem consenso disponível.</div>';return}
 host.innerHTML=days.map(d=>{const t=d.temperature_2m_max||{},r=d.precipitation_sum||{},g=d.wind_gusts_10m_max||{},a=t.agreement||'insuficiente';return `<article class="day-card agreement-${a}"><div class="day-date">${dt(d.date)}</div><div class="day-main"><b>${fmt(t.median)}°</b><span>mín ${fmt(d.temperature_2m_min?.median)}°</span></div><div class="range">Tmax entre ${fmt(t.min)} e ${fmt(t.max)} °C · ${d.models_available} modelos</div><div class="chips"><span class="chip ${a==='elevado'?'good':a==='baixo'?'low':''}">acordo ${a}</span><span class="chip">chuva ${fmt(r.median)} mm</span><span class="chip">${fmt(r.wet_model_vote_pct,0)}% modelos ≥1 mm</span><span class="chip">rajada ${fmt(g.median,0)} km/h</span></div></article>`}).join('');
}
function renderSelected(){
 const day=$('#v4-day-select').value,c=consensusDay(day);if(!c)return;
 const t=c.temperature_2m_max||{},r=c.precipitation_sum||{},g=c.wind_gusts_10m_max||{};
 $('#v4-selected-summary').innerHTML=[
  ['Consensus Tmax',`${fmt(t.median)} °C`,`P25–P75 ${fmt(t.p25)}–${fmt(t.p75)} °C`],
  ['Amplitude modelos',`${fmt(t.spread)} °C`,`acordo ${t.agreement||'—'}`],
  ['Chuva mediana',`${fmt(r.median)} mm`,`${fmt(r.wet_model_vote_pct,0)}% dos modelos ≥1 mm`],
  ['Rajada mediana',`${fmt(g.median,0)} km/h`,`${c.models_available||0} modelos no consenso`],
 ].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
 const keys=data.model_order||Object.keys(data.models||{}),rows=[];
 rows.push({key:'consensus_base',label:'Ranhados Consensus Base',kind:'baseline',c:true,row:{
  temperature_2m_max:t.median,temperature_2m_min:c.temperature_2m_min?.median,precipitation_sum:r.median,
  precipitation_probability_max:c.precipitation_probability_max?.median,wind_gusts_10m_max:g.median}});
 keys.forEach(key=>{const m=modelMeta(key),row=rowFor(m,day);if(row)rows.push({key,label:m.label||key,kind:m.kind,row})});
 $('#v4-model-table').innerHTML=rows.map(x=>`<tr class="${x.c?'row-consensus':''} ${x.kind==='benchmark'?'row-benchmark':''}"><td>${x.label}<span class="model-kind">${x.kind||''}</span></td><td>${fmt(x.row.temperature_2m_max)} °C</td><td>${fmt(x.row.temperature_2m_min)} °C</td><td>${fmt(x.row.precipitation_sum)} mm</td><td>${fmt(x.row.precipitation_probability_max,0)}%</td><td>${fmt(x.row.wind_gusts_10m_max,0)} km/h</td></tr>`).join('');
}
function renderMethod(){
 const m=data.methodology||{};$('#v4-method').innerHTML=[
 ['Ainda não é IA',m.consensus],['Best Match',m.best_match],['Concordância',m.agreement],['Chuva',m.rain_vote],['Próxima etapa',m.next]
 ].map(x=>`<div class="method-item"><strong>${x[0]}</strong><span>${x[1]||'—'}</span></div>`).join('');
}
function renderSources(){
 const keys=data.model_order||[];$('#v4-source-status').innerHTML=keys.map(k=>{const m=modelMeta(k);return `<div class="source-item"><div><strong>${m.label||k}</strong><span>${m.provider||''} · ${m.kind||''}</span></div><span class="${m.available?'ok':'bad'}">${m.available?'disponível':'indisponível'}</span></div>`}).join('');
}
async function init(){
 try{const r=await fetch('/api/v1/forecast-v4.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);data=await r.json()}catch(e){document.querySelector('.v4-page').innerHTML='<div class="mr-empty">Previsão v4 ainda não disponível.</div>';return}
 $('#v4-updated').textContent=`Atualizado ${new Date(data.generated_utc).toLocaleString('pt-PT')}${data.stale?' · cache':''}`;
 $('#v4-model-count').textContent=Object.values(data.models||{}).filter(m=>m.available&&m.independent).length;
 const days=(data.consensus?.days||[]).map(x=>x.date);$('#v4-day-select').innerHTML=days.map(d=>`<option value="${d}">${dt(d)}</option>`).join('');
 $('#v4-day-select').addEventListener('change',renderSelected);
 renderDays();renderSelected();renderMethod();renderSources();
}
init();