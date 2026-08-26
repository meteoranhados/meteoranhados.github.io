
const $=q=>document.querySelector(q);
const fmt=(v,d=1)=>v===null||v===undefined||v===''||Number.isNaN(Number(v))?'—':Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const dayName=d=>new Intl.DateTimeFormat('pt-PT',{weekday:'short'}).format(d).replace('.','');
const dateShort=d=>new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit'}).format(d);
const timeShort=d=>new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit'}).format(d);

function icon(name,cls=''){
  const common=`class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
  const p={
    temp:`<svg ${common}><path d="M14 14.8V5a4 4 0 0 0-8 0v9.8a6 6 0 1 0 8 0Z"/><path d="M10 11v5"/></svg>`,
    drop:`<svg ${common}><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z"/></svg>`,
    rain:`<svg ${common}><path d="M7 16a4 4 0 1 1 1-7.9A5.5 5.5 0 0 1 18.5 10 3.5 3.5 0 0 1 18 17H8"/><path d="m8 19-1 2m5-2-1 2m5-2-1 2"/></svg>`,
    wind:`<svg ${common}><path d="M3 8h11c3 0 3-4 0-4-1.5 0-2.2.8-2.5 1.5M3 12h16c3 0 3 4 0 4-1.5 0-2.2-.8-2.5-1.5M3 16h7"/></svg>`,
    pressure:`<svg ${common}><circle cx="12" cy="12" r="8"/><path d="m12 12 4-3"/><path d="M8 18h8"/></svg>`,
    sun:`<svg ${common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    uv:`<svg ${common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/><path d="M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>`,
    camera:`<svg ${common}><path d="M4 7h4l1.5-2h5L16 7h4v12H4Z"/><circle cx="12" cy="13" r="3"/></svg>`,
    chart:`<svg ${common}><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/></svg>`,
    report:`<svg ${common}><path d="M6 3h9l3 3v15H6Z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg>`,
    trophy:`<svg ${common}><path d="M8 4h8v4a4 4 0 0 1-8 0Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4M12 12v5m-4 4h8m-6-4h4"/></svg>`,
    cloud:`<svg ${common}><path d="M6 18a4 4 0 1 1 1-7.9A6 6 0 0 1 18.5 12 3 3 0 0 1 18 18Z"/></svg>`,
    fog:`<svg ${common}><path d="M6 13a4 4 0 1 1 1-7.9A6 6 0 0 1 18.5 7 3 3 0 0 1 18 13Z"/><path d="M4 17h16M6 21h12"/></svg>`,
    snow:`<svg ${common}><path d="M12 2v20M4 7l16 10M20 7 4 17M8 4l4 2 4-2M8 20l4-2 4 2"/></svg>`,
    storm:`<svg ${common}><path d="M6 14a4 4 0 1 1 1-7.9A6 6 0 0 1 18.5 8 3 3 0 0 1 18 14Z"/><path d="m13 14-3 5h3l-2 4"/></svg>`,
    partly:`<svg ${common}><circle cx="8" cy="8" r="3"/><path d="M8 2v2M2 8h2M3.8 3.8 5 5"/><path d="M8 19a4 4 0 1 1 1-7.9A6 6 0 0 1 20.5 13 3 3 0 0 1 20 19Z"/></svg>`
  };
  return p[name]||p.cloud;
}
function weatherIcon(code){
  code=Number(code);
  if(code===0)return icon('sun');
  if(code<=2)return icon('partly');
  if(code===3)return icon('cloud');
  if(code===45||code===48)return icon('fog');
  if((code>=51&&code<=67)||(code>=80&&code<=82))return icon('rain');
  if((code>=71&&code<=77)||(code>=85&&code<=86))return icon('snow');
  if(code>=95)return icon('storm');
  return icon('cloud');
}
function weatherText(code){
  code=Number(code);
  if(code===0)return'Céu limpo'; if(code===1)return'Pouco nublado'; if(code===2)return'Parcialmente nublado';
  if(code===3)return'Encoberto'; if(code===45||code===48)return'Nevoeiro';
  if(code>=51&&code<=57)return'Chuvisco'; if(code>=61&&code<=67)return'Chuva';
  if(code>=71&&code<=77)return'Neve'; if(code>=80&&code<=82)return'Aguaceiros';
  if(code>=85&&code<=86)return'Aguaceiros de neve'; if(code>=95)return'Trovoada'; return'Condições variáveis';
}
function windDir(deg){
  if(deg===null||deg===undefined||Number.isNaN(Number(deg)))return'—';
  const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(Number(deg)/22.5)%16];
}
async function getJson(url){
  const r=await fetch(url+'?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}
function val(d,k){return d?.data?.[k]}

let current=null,forecast=null,history=null;

function renderCurrent(){
  const d=current?.data||{}, primary=forecast?.primary?.hourly||{};
  $('#now-temp').textContent=d.temp===null||d.temp===undefined?'—':`${fmt(d.temp,1)}°`;
  const code=primary.weather_code?.[0]??0;
  $('#now-symbol').innerHTML=weatherIcon(code);
  let status=forecast?.available?weatherText(code):'Observação da estação';
  if(d.rrate>0)status=`A chover · ${fmt(d.rrate,1)} mm/h`;
  else if(Number(d.IsSunny)===1)status='Sol na estação';
  $('#now-status').textContent=status;
  $('#now-core').innerHTML=[
    ['drop','Humidade',`${fmt(d.hum,0)}%`,`Ponto de orvalho ${fmt(d.dew,1)}°C`],
    ['wind','Vento',`${esc(d.currentwdir||d.wdir||windDir(d.bearing))} ${fmt(d.wspeed,1)} km/h`,`rajada 10 min ${fmt(d.wgust,1)} km/h`],
    ['pressure','Pressão',`${fmt(d.press,1)} hPa`,`${Number(d.presstrendval)>0?'+':''}${fmt(d.presstrendval,1)} hPa/3h`],
    ['rain','Chuva hoje',`${fmt(d.rfall,1)} mm`,`última hora ${fmt(d.rhour,1)} mm`],
    ['temp','Sensação',`${fmt(d.feelslike,1)}°C`,`aparente ${fmt(d.apptemp,1)}°C`],
    ['sun','Solar',`${fmt(d.SolarRad,0)} W/m²`,`UV ${fmt(d.UV,1)}`]
  ].map(x=>`<div class="core-item">${icon(x[0])}<span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></div>`).join('');
  $('#now-updated').textContent=`Cumulus MX · ${d.date||''} ${d.timehhmmss||''}${current?.stale?' · última leitura válida em cache':''}`;

  const cards=[
    ['temp','T máxima',`${fmt(d.tempTH,1)} °C`,d.TtempTH||''],
    ['temp','T mínima',`${fmt(d.tempTL,1)} °C`,d.TtempTL||''],
    ['rain','Precipitação',`${fmt(d.rfall,1)} mm`,`máx. intensidade ${fmt(d.rrateTM,1)} mm/h`],
    ['wind','Rajada máxima',`${fmt(d.wgustTM,1)} km/h`,d.TwgustTM||''],
    ['uv','UV máximo',fmt(d.UVTH,1),`radiação máx. ${fmt(d.solarTH,0)} W/m²`],
    ['sun','Sol',`${fmt(d.SunshineHours,1)} h`,`ET ${fmt(d.ET,2)} mm`]
  ];
  $('#today-strip').innerHTML=cards.map(x=>`<div class="today-card">${icon(x[0])}<span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></div>`).join('');

  renderStationGroups();
}
function renderStationGroups(){
  const d=current?.data||{};
  const groups=[
    ['Temperatura',[
      ['Atual',d.temp,'°C',1],['Sensação',d.feelslike,'°C',1],['Aparente',d.apptemp,'°C',1],['Ponto de orvalho',d.dew,'°C',1],
      ['Wind chill',d.wchill,'°C',1],['Heat index',d.heatindex,'°C',1],['Humidex',d.humidex,'',1],['Média hoje',d.avgtemp,'°C',1]
    ]],
    ['Humidade e pressão',[
      ['Humidade exterior',d.hum,'%',0],['Pressão',d.press,' hPa',1],['Tendência 3 h',d.presstrendval,' hPa',1],
      ['Máx. pressão',d.pressTH,' hPa',1],['Mín. pressão',d.pressTL,' hPa',1],['Humidade interior',d.inhum,'%',0],['T interior',d.intemp,'°C',1]
    ]],
    ['Vento',[
      ['Média',d.wspeed,' km/h',1],['Última leitura',d.wlatest,' km/h',1],['Rajada 10 min',d.wgust,' km/h',1],
      ['Direção atual',d.currentwdir||windDir(d.bearing),'',null],['Direção média',d.wdir||windDir(d.avgbearing),'',null],
      ['Dominante hoje',d.domwinddir,'',null],['Percurso do vento',d.windrun,' km',1]
    ]],
    ['Precipitação',[
      ['Hoje',d.rfall,' mm',1],['Intensidade',d.rrate,' mm/h',1],['Última hora',d.rhour,' mm',1],['Últimas 24 h',d.r24hour,' mm',1],
      ['Semana',d.rweek,' mm',1],['Mês',d.rmonth,' mm',1],['Ano',d.ryear,' mm',1],['Última báscula',d.LastRainTipISO,'',null]
    ]],
    ['Sol e radiação',[
      ['UV',d.UV,'',1],['UV máximo hoje',d.UVTH,'',1],['Radiação solar',d.SolarRad,' W/m²',0],
      ['Máx. solar hoje',d.solarTH,' W/m²',0],['Máximo teórico',d.CurrentSolarMax,' W/m²',0],
      ['Horas de sol',d.SunshineHours,' h',1],['Sol agora',Number(d.IsSunny)===1?'Sim':'Não','',null],['ET hoje',d.ET,' mm',2]
    ]],
    ['Estação e extras',[
      ['Base das nuvens',d.cloudbasevalue,d.cloudbaseunit?` ${d.cloudbaseunit}`:'',0],['Contacto sensores',Number(d.SensorContactLost)===1?'Perdido':'OK','',null],
      ['Relâmpagos hoje',d.LightningStrikesToday,'',0],['Último raio',d.LightningDistance,' km',1],['Hora do último raio',d.LightningTime,'',null],
      ['Previsão Cumulus',d.cumulusforecast||d.forecast,'',null],['Cumulus MX',d.version?`${d.version} b${d.build||''}`:'—','',null]
    ]]
  ];
  $('#station-groups').innerHTML=groups.map(([name,rows])=>`<div class="station-group"><h3>${name}</h3>${
    rows.filter(r=>r[1]!==null&&r[1]!==undefined&&r[1]!==''&&r[1]!=='—').map(r=>{
      let shown=r[3]===null?esc(r[1]):fmt(r[1],r[3])+r[2];
      return `<div class="station-row"><span>${r[0]}</span><b>${shown}</b></div>`;
    }).join('')
  }</div>`).join('');
}
function dailyRows(model){
  const d=model?.daily||{},t=d.time||[];
  return t.map((time,i)=>Object.fromEntries(Object.keys(d).map(k=>[k,d[k]?.[i]])));
}
function renderForecast(){
  if(!forecast?.available){$('#daily-forecast').innerHTML='<div class="chart-empty">Previsão temporariamente indisponível.</div>';$('#forecast-source').textContent='Sem previsão';return}
  const rows=dailyRows(forecast.primary).slice(0,7);
  $('#forecast-source').textContent=`Best Match · ${forecast.stale?'cache':'atualizada'}`;
  $('#daily-forecast').innerHTML=rows.map((r,i)=>{
    const dd=new Date(r.time+'T12:00');
    return `<article class="forecast-day ${i===0?'today':''}">
      <div class="day">${i===0?'Hoje':dayName(dd)}</div><div class="date">${dateShort(dd)}</div>
      <div class="wx">${weatherIcon(r.weather_code)}</div>
      <div class="temps"><b>${fmt(r.temperature_2m_max,0)}°</b><span>${fmt(r.temperature_2m_min,0)}°</span></div>
      <div class="forecast-meta">
        <span>${icon('rain')} ${fmt(r.precipitation_probability_max,0)}% · ${fmt(r.precipitation_sum,1)} mm</span>
        <span>${icon('wind')} ${windDir(r.wind_direction_10m_dominant)} · ${fmt(r.wind_gusts_10m_max,0)} km/h</span>
        <span>${icon('uv')} UV ${fmt(r.uv_index_max,0)}</span>
      </div>
    </article>`;
  }).join('');
  renderModelCompare();
  renderTimeline();
}
function modelDayMap(model){
  const rows=dailyRows(model);return new Map(rows.map(r=>[r.time,r]));
}
function renderModelCompare(){
  const e=forecast?.models?.ecmwf,g=forecast?.models?.gfs,p=forecast?.primary;
  if(!e?.available||!g?.available||!p?.available){$('#model-summary').innerHTML='<div class="model-stat"><span>Comparação</span><b>Indisponível</b></div>';return}
  const em=modelDayMap(e),gm=modelDayMap(g),pm=modelDayMap(p),dates=[...new Set([...em.keys(),...gm.keys()])].sort().slice(0,7);
  let maxTempSpread=0,rain3e=0,rain3g=0,rows=[];
  dates.forEach((d,i)=>{
    const er=em.get(d)||{},gr=gm.get(d)||{},pr=pm.get(d)||{};
    const ts=(er.temperature_2m_max!=null&&gr.temperature_2m_max!=null)?Math.abs(er.temperature_2m_max-gr.temperature_2m_max):null;
    if(ts!=null)maxTempSpread=Math.max(maxTempSpread,ts);
    if(i<3){rain3e+=Number(er.precipitation_sum||0);rain3g+=Number(gr.precipitation_sum||0)}
    rows.push({date:d,e:er,g:gr,p:pr,ts});
  });
  const rainSpread=Math.abs(rain3e-rain3g);
  const spreadClass=maxTempSpread<1.5?'spread-low':maxTempSpread<3?'spread-mid':'spread-high';
  $('#model-summary').innerHTML=`
    <div class="model-stat"><span>Maior diferença Tmax</span><b class="${spreadClass}">${fmt(maxTempSpread,1)} °C</b><small>ECMWF vs GFS · 7 dias</small></div>
    <div class="model-stat"><span>Diferença chuva 3 dias</span><b>${fmt(rainSpread,1)} mm</b><small>totais previstos pelos dois modelos</small></div>
    <div class="model-stat"><span>Modelo principal</span><b>Best Match</b><small>usado nos cartões e na linha principal</small></div>`;
  $('#model-table').innerHTML=`<table class="model-table"><thead><tr><th>Dia</th><th>Best Match</th><th>ECMWF</th><th>GFS</th><th>Δ Tmax</th><th>Chuva ECMWF / GFS</th></tr></thead><tbody>${
    rows.map(r=>`<tr><td><b>${dateShort(new Date(r.date+'T12:00'))}</b></td>
      <td>${fmt(r.p.temperature_2m_max,0)} / ${fmt(r.p.temperature_2m_min,0)}°</td>
      <td class="model-name">${fmt(r.e.temperature_2m_max,0)} / ${fmt(r.e.temperature_2m_min,0)}°</td>
      <td class="model-name">${fmt(r.g.temperature_2m_max,0)} / ${fmt(r.g.temperature_2m_min,0)}°</td>
      <td>${r.ts==null?'—':fmt(r.ts,1)+'°'}</td><td>${fmt(r.e.precipitation_sum,1)} / ${fmt(r.g.precipitation_sum,1)} mm</td></tr>`).join('')
  }</tbody></table>`;
}
function futureHourly(){
  const h=forecast?.primary?.hourly||{},times=h.time||[],now=Date.now()-60*60*1000;
  return times.map((t,i)=>({time:t,i,ms:new Date(t).getTime()})).filter(x=>x.ms>=now).slice(0,49);
}
function obs24(){
  const a=history?.samples||[];if(!a.length)return[];
  const last=new Date(a[a.length-1].time).getTime(),cut=last-24*3600*1000;return a.filter(x=>new Date(x.time).getTime()>=cut);
}
function svgLinePath(points,x,y){return points.map((p,i)=>`${i?'L':'M'} ${x(p.ms).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ')}
function renderTimeline(){
  const host=$('#timeline-chart'),variable=$('#timeline-variable').value,useBridge=$('#local-bridge-toggle').checked;
  const obs=obs24(),fut=futureHourly(),h=forecast?.primary?.hourly||{},bridge=forecast?.local_bridge?.hourly||{};
  $('#local-bridge-label').style.display=['temperature','humidity','pressure'].includes(variable)?'flex':'none';
  const cfg={
    temperature:{obs:'temp',fc:'temperature_2m',bridge:'temperature_2m',unit:'°C',dec:1,label:'Temperatura'},
    humidity:{obs:'hum',fc:'relative_humidity_2m',bridge:'relative_humidity_2m',unit:'%',dec:0,label:'Humidade'},
    pressure:{obs:'pressure',fc:'pressure_msl',bridge:'pressure_msl',unit:' hPa',dec:0,label:'Pressão'},
    wind:{obs:'wind_avg',fc:'wind_speed_10m',unit:' km/h',dec:0,label:'Vento'},
    precipitation:{unit:' mm',dec:1,label:'Precipitação'}
  }[variable];
  if(variable==='precipitation'){renderPrecipTimeline(host,fut,h);return}
  const op=obs.filter(x=>x[cfg.obs]!=null).map(x=>({ms:new Date(x.time).getTime(),v:Number(x[cfg.obs])}));
  const fp=fut.filter(x=>h[cfg.fc]?.[x.i]!=null).map(x=>({ms:x.ms,v:Number(h[cfg.fc][x.i])}));
  const bp=(useBridge&&cfg.bridge&&bridge[cfg.bridge])?fut.filter(x=>bridge[cfg.bridge]?.[x.i]!=null).map(x=>({ms:x.ms,v:Number(bridge[cfg.bridge][x.i])})):[];
  drawLineTimeline(host,op,fp,bp,cfg);
  const bridgeOn=bp.length>0;
  $('#timeline-legend').innerHTML=`<span><i style="background:#193f52"></i>Observado</span><span><i style="background:#6f9a70"></i>Best Match</span>${bridgeOn?'<span><i style="background:#c54d42"></i>Ponte local</span>':''}`;
  $('#local-bridge-method').textContent=bridgeOn?(forecast.local_bridge?.method||''):'';
  $('#bridge-explainer').textContent=`${cfg.label}: últimas 24 h observadas + próximas 48 h previstas.`;
}
function drawLineTimeline(host,obs,fc,bridge,cfg){
  if(!obs.length&&!fc.length){host.innerHTML='<div class="chart-empty">Sem dados suficientes.</div>';return}
  const all=[...obs,...fc,...bridge],W=1040,H=360,m={l:58,r:20,t:22,b:44},minT=Math.min(...all.map(x=>x.ms)),maxT=Math.max(...all.map(x=>x.ms)),vals=all.map(x=>x.v),vmin=Math.min(...vals),vmax=Math.max(...vals),pad=(vmax-vmin)*.12||1,ymin=vmin-pad,ymax=vmax+pad;
  const x=t=>m.l+(t-minT)/(maxT-minT)*(W-m.l-m.r),y=v=>m.t+(ymax-v)/(ymax-ymin)*(H-m.t-m.b);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img">`;
  for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e5ecef"/><text x="${m.l-7}" y="${yy+4}" text-anchor="end" font-size="10" fill="#70818a">${fmt(v,cfg.dec)}${cfg.unit}</text>`}
  const now=Date.now(),nx=x(Math.max(minT,Math.min(maxT,now)));s+=`<line x1="${nx}" y1="${m.t}" x2="${nx}" y2="${H-m.b}" stroke="#9aabb3" stroke-dasharray="4 5"/><text x="${nx+5}" y="${m.t+11}" font-size="9" fill="#82939c">agora</text>`;
  for(let i=0;i<=6;i++){const t=minT+(maxT-minT)*i/6,xx=x(t);s+=`<text x="${xx}" y="${H-17}" text-anchor="middle" font-size="9" fill="#71828b">${timeShort(new Date(t))}<tspan x="${xx}" dy="11">${dateShort(new Date(t))}</tspan></text>`}
  if(obs.length)s+=`<path d="${svgLinePath(obs,x,y)}" fill="none" stroke="#193f52" stroke-width="3"/>`;
  if(fc.length)s+=`<path d="${svgLinePath(fc,x,y)}" fill="none" stroke="#6f9a70" stroke-width="2.3" stroke-dasharray="7 4"/>`;
  if(bridge.length)s+=`<path d="${svgLinePath(bridge,x,y)}" fill="none" stroke="#c54d42" stroke-width="2.6"/>`;
  s+='</svg>';host.innerHTML=s;
}
function renderPrecipTimeline(host,fut,h){
  const obs=(history?.hourly_rain||[]).map(x=>({ms:new Date(x.time).getTime(),v:Number(x.precip_mm||0)}));
  const fp=fut.filter(x=>h.precipitation?.[x.i]!=null).map(x=>({ms:x.ms,v:Number(h.precipitation[x.i]||0)}));
  const all=[...obs,...fp];if(!all.length){host.innerHTML='<div class="chart-empty">Sem dados de precipitação.</div>';return}
  const W=1040,H=360,m={l:52,r:20,t:22,b:44},minT=Math.min(...all.map(x=>x.ms)),maxT=Math.max(...all.map(x=>x.ms)),maxV=Math.max(1,...all.map(x=>x.v))*1.12,x=t=>m.l+(t-minT)/(maxT-minT)*(W-m.l-m.r),y=v=>m.t+(maxV-v)/maxV*(H-m.t-m.b),bw=Math.max(2,(W-m.l-m.r)/(all.length+5)*.72);
  let s=`<svg viewBox="0 0 ${W} ${H}">`;
  for(let i=0;i<=4;i++){const v=maxV*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e5ecef"/><text x="${m.l-6}" y="${yy+4}" text-anchor="end" font-size="10" fill="#70818a">${fmt(v,1)}</text>`}
  obs.forEach(p=>s+=`<rect x="${x(p.ms)-bw/2}" y="${y(p.v)}" width="${bw}" height="${Math.max(1,H-m.b-y(p.v))}" fill="#193f52" rx="2"/>`);
  fp.forEach(p=>s+=`<rect x="${x(p.ms)-bw/2}" y="${y(p.v)}" width="${bw}" height="${Math.max(1,H-m.b-y(p.v))}" fill="#2f7fa3" opacity=".72" rx="2"/>`);
  const nx=x(Math.max(minT,Math.min(maxT,Date.now())));s+=`<line x1="${nx}" y1="${m.t}" x2="${nx}" y2="${H-m.b}" stroke="#9aabb3" stroke-dasharray="4 5"/>`;
  for(let i=0;i<=6;i++){const t=minT+(maxT-minT)*i/6,xx=x(t);s+=`<text x="${xx}" y="${H-17}" text-anchor="middle" font-size="9" fill="#71828b">${timeShort(new Date(t))}<tspan x="${xx}" dy="11">${dateShort(new Date(t))}</tspan></text>`}
  s+='</svg>';host.innerHTML=s;$('#timeline-legend').innerHTML='<span><i style="background:#193f52"></i>Observado</span><span><i style="background:#2f7fa3"></i>Previsto</span>';$('#local-bridge-method').textContent='A ponte local não altera precipitação.';$('#bridge-explainer').textContent='Precipitação horária observada nas últimas 24 h e prevista nas próximas 48 h.';
}
async function init(){
  $('#ico-climate').innerHTML=icon('chart');$('#ico-report').innerHTML=icon('report');$('#ico-record').innerHTML=icon('trophy');$('#ico-camera').innerHTML=icon('camera');
  try{
    [current,forecast,history]=await Promise.all([getJson('current.json'),getJson('forecast.json'),getJson('history24h.json')]);
    renderCurrent();renderForecast();
  }catch(e){
    console.error(e);$('#now-status').textContent='Alguns dados estão temporariamente indisponíveis.';
  }
  $('#timeline-variable').addEventListener('change',renderTimeline);$('#local-bridge-toggle').addEventListener('change',renderTimeline);
  setInterval(async()=>{try{current=await getJson('current.json');renderCurrent()}catch(e){}},60000);
  setInterval(()=>{const img=$('#camera-img');if(img)img.src='/camera/latest.jpg?t='+Date.now()},300000);
}
init();
