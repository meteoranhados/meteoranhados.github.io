const $=q=>document.querySelector(q);
const fmt=(v,d=0)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('pt-PT',{maximumFractionDigits:d});
async function getJson(u){const r=await fetch(u+(u.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(`${u}: HTTP ${r.status}`);return r.json()}
function age(s){if(!s)return'—';const ms=Date.now()-new Date(s).getTime();if(!Number.isFinite(ms))return'—';const min=Math.max(0,Math.round(ms/60000));return min<60?`${min} min`:`${Math.floor(min/60)} h ${min%60} min`}
function row(a,b){return `<div class="sx-row"><span>${a}</span><b>${b??'—'}</b></div>`}
function setOverall(el,state,text){el.classList.remove('ok','attention','critical');el.classList.add(state);el.textContent=text}
async function init(){
 const overall=$('#sx-overall');
 try{
  const [d,cam]=await Promise.all([getJson('/api/v1/status.json'),getJson('/camera/status.json').catch(()=>null)]);
  const names={ok:'Estação OK',attention:'Atenção técnica',critical:'Problema técnico'};
  setOverall(overall,d.overall||'attention',names[d.overall]||'Estado desconhecido');
  const forecastText=!d.forecast?.available?'Indisponível':d.forecast?.stale?'Em cache':'Disponível';
  const ipmaText=!d.ipma?.available?(d.ipma?.stale?'Em cache':'Indisponível'):d.ipma?.stale?'Em cache':'Disponível';
  const graphText=!d.graphs?.available?'Indisponíveis':d.graphs?.stale?'Em cache':'Disponíveis';
  const camText=!cam?'Sem estado':cam.state==='ok'?'Atualizada':cam.state==='attention'?'Atraso':'Desatualizada';
  $('#sx-services').innerHTML=`<div class="sx-service"><span>Observação atual</span><b>${d.station?.available?'Disponível':'Indisponível'}</b><small>gerada há ${age(d.station?.current_generated_utc)}</small></div><div class="sx-service"><span>Previsão</span><b>${forecastText}</b><small>ensemble ${d.forecast?.ensemble_available?'OK':'indisponível'}</small></div><div class="sx-service"><span>IPMA</span><b>${ipmaText}</b><small>${d.ipma?.warning_count??0} aviso(s)</small></div><div class="sx-service"><span>Gráficos</span><b>${graphText}</b><small>${d.graphs?.sample_count??0} pontos recentes</small></div><div class="sx-service"><span>Câmara</span><b>${camText}</b><small>${cam?`última captura há ${Math.round((cam.age_seconds||0)/60)} min`:'status indisponível'}</small></div>`;
  $('#sx-system').innerHTML=row('Cumulus',`${d.station?.cumulus_version??'—'} ${d.station?.cumulus_build??''}`)+row('Uptime Cumulus',d.station?.program_uptime)+row('Uptime sistema',d.station?.system_uptime)+row('Uptime estação',d.station?.station_uptime)+row('CPU',d.station?.cpu_temp_c!=null?`${fmt(d.station.cpu_temp_c,1)} °C`:'—')+row('Baterias',d.station?.low_battery_list||'Sem aviso')+row('Nova versão Cumulus',d.station?.new_build_available?`Disponível ${d.station?.new_build_number||''}`:'Não sinalizada');
  $('#sx-quality').innerHTML=row('Último dia fechado',d.data?.last_closed_day)+row('Dias válidos',d.data?.valid_days)+row('Dias em falta',d.data?.missing_days)+row('Linhas inválidas',d.data?.invalid_rows)+row('Duplicados',d.data?.duplicates);
  const labels={data_stopped:'Dados parados',battery_low:'Bateria baixa',data_spike:'Spike/limite de dados',sensor_contact_lost:'Contacto de sensor perdido',error:'Erro Cumulus',high_wind_gust:'Rajada alta',high_wind_speed:'Vento alto',high_rain_today:'Chuva diária alta',high_rain_rate:'Intensidade de chuva alta',low_temp:'Temperatura baixa',high_temp:'Temperatura alta',low_pressure:'Pressão baixa',high_pressure:'Pressão alta'};
  $('#sx-alarms').innerHTML=Object.entries(d.station?.alarms||{}).map(([k,v])=>`<span class="sx-alarm ${v?'on':''}">${labels[k]||k}: ${v?'ATIVO':'ok'}</span>`).join('');
  const active=Object.entries(d.station?.alarms||{}).filter(([,v])=>v).map(([k])=>labels[k]||k);
  let explanation=$('#sx-explanation');if(!explanation){explanation=document.createElement('div');explanation.id='sx-explanation';explanation.className='sx-explanation';overall.insertAdjacentElement('afterend',explanation)}
  if(d.overall==='critical'){explanation.textContent=!d.station?.available?'A API local do Cumulus não respondeu nesta atualização.':active.length?`Alarme(s) ativo(s): ${active.join(', ')}.`:'O estado técnico assinalou uma condição crítica.';explanation.hidden=false}
  else if(d.overall==='attention'){explanation.textContent=active.length?`Atenção: ${active.join(', ')}.`:'Existe uma condição de manutenção a verificar.';explanation.hidden=false}
  else explanation.hidden=true;
 }catch(e){console.error('[Meteo Ranhados] Estado',e);setOverall(overall,'critical','Estado indisponível');let explanation=$('#sx-explanation');if(!explanation){explanation=document.createElement('div');explanation.id='sx-explanation';explanation.className='sx-explanation';overall.insertAdjacentElement('afterend',explanation)}explanation.textContent='Não foi possível ler o ficheiro de estado. Isto não significa, por si só, que a estação ou o publisher estejam parados.';explanation.hidden=false}
}
init();setInterval(init,60000);
