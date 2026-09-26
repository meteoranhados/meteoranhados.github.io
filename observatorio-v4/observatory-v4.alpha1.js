const $=q=>document.querySelector(q);let data=null;
const fmt=(v,d=2)=>v==null||Number.isNaN(Number(v))?'—':Number(v).toFixed(d);
const labelVar=v=>({tmax:'Tmax',tmin:'Tmin',tmean:'Tmédia',precip:'Precipitação'})[v]||v;
const unit=v=>v==='precip'?'mm':'°C';
function models(){return (data.model_order||Object.keys(data.models||{})).map(k=>[k,data.models?.[k]]).filter(x=>x[1])}
function metricValue(m,lead,v,metric){return m?.leads?.[String(lead)]?.[v]?.[metric]}
function samples(m,lead,v){return m?.leads?.[String(lead)]?.[v]?.samples||0}
function rankValue(v,metric){if(v==null)return Infinity;return metric==='bias'?Math.abs(Number(v)):Number(v)}
function renderGrid(){
 const v=$('#ov4-var').value,metric=$('#ov4-metric').value,leads=data.lead_days||[];
 const ms=models();let html=`<div class="cell head">Modelo</div>${leads.map(l=>`<div class="cell head">D+${l}</div>`).join('')}`;
 const best={};leads.forEach(l=>{const vals=ms.map(([k,m])=>({k,v:metricValue(m,l,v,metric)})).filter(x=>x.v!=null).sort((a,b)=>rankValue(a.v,metric)-rankValue(b.v,metric));best[l]=vals[0]?.k});
 ms.forEach(([k,m])=>{html+=`<div class="cell model">${m.label||k}</div>`;leads.forEach(l=>{const val=metricValue(m,l,v,metric),n=samples(m,l,v);html+=`<div class="cell value ${best[l]===k?'best':''} ${val==null?'na':''}">${val==null?'—':`${fmt(val)} ${unit(v)}`}<small>${n||0} casos</small></div>`})});
 $('#ov4-grid').innerHTML=html;
 renderTable();
}
function renderTable(){
 const v=$('#ov4-var').value,lead=$('#ov4-lead').value,ms=models().map(([k,m])=>({k,m,val:metricValue(m,lead,v,'mae')})).filter(x=>x.m);
 const sorted=[...ms].sort((a,b)=>rankValue(a.val,'mae')-rankValue(b.val,'mae'));const best=sorted.find(x=>x.val!=null)?.k;
 $('#ov4-table').innerHTML=sorted.map(x=>{const item=x.m.leads?.[String(lead)]?.[v]||{};return `<tr class="${x.k===best?'row-best':''} ${x.k==='consensus_base'?'row-baseline':''}"><td>${x.m.label||x.k}</td><td>${fmt(item.mae)} ${unit(v)}</td><td>${fmt(item.rmse)} ${unit(v)}</td><td>${fmt(item.bias)} ${unit(v)}</td><td>${item.samples||0}</td></tr>`}).join('');
 $('#ov4-note').textContent=`${labelVar(v)} · D+${lead}. Menor MAE/RMSE é melhor; no viés, mais perto de zero é melhor. Compare também o número de casos.`;
}
function renderCoverage(){
 const errors=data.fetch_errors||{},ms=models();$('#ov4-coverage').innerHTML=ms.map(([k,m])=>`<div class="info-row"><strong>${m.label||k}</strong><span>${m.available?'arquivo disponível':'sem arquivo nesta execução'} · D+1: ${samples(m,1,'tmax')} casos${errors[k]?` · <span class="error">${errors[k]}</span>`:''}</span></div>`).join('');
}
function renderMethod(){
 const m=data.methodology||{};$('#ov4-method').innerHTML=Object.entries(m).map(([k,v])=>`<div class="info-row"><strong>${k.replaceAll('_',' ')}</strong><span>${v}</span></div>`).join('');
}
async function init(){
 try{const r=await fetch('/api/v1/forecast-skill-v4.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);data=await r.json()}catch(e){document.querySelector('.ov4-page').innerHTML='<div class="note">Observatório v4 ainda não disponível.</div>';return}
 $('#ov4-period').textContent=`${data.period_start||'—'} → ${data.period_end||'—'}`;
 $('#ov4-count').textContent=Object.values(data.models||{}).filter(m=>m.available).length;
 $('#ov4-lead').innerHTML=(data.lead_days||[]).map(l=>`<option value="${l}">D+${l}</option>`).join('');
 ['ov4-var','ov4-metric'].forEach(id=>$('#'+id).addEventListener('change',renderGrid));$('#ov4-lead').addEventListener('change',renderTable);
 renderGrid();renderCoverage();renderMethod();
}
init();