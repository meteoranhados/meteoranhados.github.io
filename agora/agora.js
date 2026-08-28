
const $=q=>document.querySelector(q);
const fmt=(v,d=1)=>v===null||v===undefined||v===''||Number.isNaN(Number(v))?'—':Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const dayName=d=>new Intl.DateTimeFormat('pt-PT',{weekday:'short'}).format(d).replace('.','');
const dateShort=d=>new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit'}).format(d);
const timeShort=d=>new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit'}).format(d);
const toMs=t=>typeof t==='number'?t:(t&&typeof t==='object'&&t.time_ms?Number(t.time_ms):new Date(t).getTime());

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
    calendar:`<svg ${common}><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16M8 14h2m4 0h2M8 17h2m4 0h2"/></svg>`,
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

let current=null,forecast=null,history=null,climate=null,calendarData=null;

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
    ['sun','Solar',`${fmt(d.SolarRad,0)} W/m²`,`UV ${fmt(d.UV,1)}${d.CurrentSolarMax>0?` · ${fmt(100*d.SolarRad/d.CurrentSolarMax,0)}% potencial`:''}`]
  ].map(x=>`<div class="core-item">${icon(x[0])}<span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></div>`).join('');
  $('#now-updated').textContent=`Cumulus MX · ${d.date||''} ${d.timehhmmss||''}${current?.stale?' · última leitura válida em cache':''}`;
  const astro=[];
  if(d.sunrise)astro.push(`<span>${icon('sun')} Nascer ${esc(d.sunrise)}</span>`);
  if(d.sunset)astro.push(`<span>${icon('sun')} Pôr ${esc(d.sunset)}</span>`);
  if(d.daylength)astro.push(`<span>${icon('chart')} ${esc(d.daylength)} de luz</span>`);
  $('#astro-line').innerHTML=astro.join('');

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
      ['Horas de sol hoje',d.SunshineHours,' h',1],['Horas de sol no mês',d.SunshineHoursMonth,' h',1],
      ['Potencial solar atual',d.CurrentSolarMax,' W/m²',0],['% do potencial',d.CurrentSolarMax>0?100*d.SolarRad/d.CurrentSolarMax:null,'%',0],
      ['Sol agora',Number(d.IsSunny)===1?'Sim':'Não','',null],['ET hoje',d.ET,' mm',2]
    ]],
    ['Agro / sazonal',[
      ['Graus-dia aquecimento hoje',d.heatdegdays,'',2],['Graus-dia arrefecimento hoje',d.cooldegdays,'',2],
      ['Chill hours hoje',d.chillhoursToday,' h',1],['Chill hours da época',d.chillhours,' h',1]
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
function agreement(kind,value,aux=null){
  if(kind==='temp'){
    if(value<1.5)return{label:'Bom acordo',cls:'agreement-good'};
    if(value<3)return{label:'Divergência moderada',cls:'agreement-medium'};
    return{label:'Divergência elevada',cls:'agreement-high'};
  }
  if(aux!=null && aux<2)return{label:'Pouca chuva prevista',cls:'agreement-good'};
  if(value<.30)return{label:'Bom acordo',cls:'agreement-good'};
  if(value<.70)return{label:'Divergência moderada',cls:'agreement-medium'};
  return{label:'Divergência elevada',cls:'agreement-high'};
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
  const rainSpread=Math.abs(rain3e-rain3g),rainMean=(rain3e+rain3g)/2,rainRelative=rainSpread/Math.max(rainMean,1);
  const ta=agreement('temp',maxTempSpread),ra=agreement('rain',rainRelative,rainMean);
  $('#model-summary').innerHTML=`
    <div class="model-stat"><span>Acordo em temperatura</span><div class="agreement-badge ${ta.cls}">${ta.label}</div><small class="agreement-detail">maior Δ Tmax: ${fmt(maxTempSpread,1)} °C · 7 dias</small></div>
    <div class="model-stat"><span>Acordo em precipitação</span><div class="agreement-badge ${ra.cls}">${ra.label}</div><small class="agreement-detail">ECMWF ${fmt(rain3e,1)} · GFS ${fmt(rain3g,1)} mm · 3 dias</small></div>
    <div class="model-stat"><span>Modelo principal</span><b>Best Match</b><small>os dois modelos abaixo servem para perceber a dispersão, não a “confiança” absoluta</small></div>`;
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
  const last=Number(a[a.length-1].time_ms||toMs(a[a.length-1].time));
  if(!Number.isFinite(last))return[];
  // Never join a stale historical fragment to a current forecast.
  if(Math.abs(Date.now()-last)>48*3600*1000)return[];
  const cut=last-24*3600*1000;
  return a.filter(x=>Number(x.time_ms||toMs(x.time))>=cut);
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
  const op=obs.filter(x=>x[cfg.obs]!=null).map(x=>({ms:Number(x.time_ms||toMs(x.time)),v:Number(x[cfg.obs])}));
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
  const obs=(history?.hourly_rain||[]).map(x=>({ms:Number(x.time_ms||toMs(x.time)),v:Number(x.precip_mm||0)}));
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
function monthDescriptor(tempAnom,rainPct){
  let t={text:'próximo do normal',cls:'neutral'};
  if(tempAnom>=2)t={text:'muito mais quente',cls:'warm'};
  else if(tempAnom>=.7)t={text:'mais quente',cls:'warm'};
  else if(tempAnom<=-2)t={text:'muito mais frio',cls:'cold'};
  else if(tempAnom<=-.7)t={text:'mais frio',cls:'cold'};
  let r={text:'próximo do normal',cls:'neutral'};
  if(rainPct>=160)r={text:'muito mais chuvoso',cls:'wet'};
  else if(rainPct>=115)r={text:'mais chuvoso',cls:'wet'};
  else if(rainPct<=50)r={text:'muito mais seco',cls:'dry'};
  else if(rainPct<=85)r={text:'mais seco',cls:'dry'};
  return{t,r};
}
function monthFeature(iconName,label,value,sub=''){
  return `<div class="month-feature">${icon(iconName)}<span>${label}</span><b>${value}</b><small>${sub}</small></div>`;
}
function monthIndex(label,value,sub=''){
  return `<div class="month-index"><span>${label}</span><b>${value}</b>${sub?`<small>${sub}</small>`:''}</div>`;
}
function renderMonthContext(){
  const cm=climate?.current_month,obs=cm?.observed,norm=cm?.normal_1991_2020_same_period,anom=cm?.anomaly,ref=climate?.current_month_station_reference_prior_years?.observed_average,d=current?.data||{};
  if(!obs||!norm){
    $('#month-story').textContent='Contexto climatológico temporariamente indisponível.';
    $('#month-feature-stats').innerHTML='';$('#month-indices').innerHTML='';return;
  }
  const last=climate?.source_last_closed_day?new Date(climate.source_last_closed_day+'T12:00'):null;
  const title=last?new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric'}).format(last):'Este mês';
  $('#month-title').textContent=`${title.charAt(0).toUpperCase()+title.slice(1)} — em números`;
  const ds=monthDescriptor(Number(anom.tmean_c||0),Number(anom.precip_pct_normal||100));
  $('#month-story').textContent=`Até ao último dia fechado, o mês está ${ds.t.text} e ${ds.r.text} do que a referência 1991–2020 para o mesmo período.`;
  const stationTemp=ref?.tmean_c!=null?Number(obs.tmean_c)-Number(ref.tmean_c):null;
  const stationRain=ref?.precip_mm?Number(obs.precip_mm)/Number(ref.precip_mm)*100:null;
  $('#month-context-badges').innerHTML=`
    <span class="context-badge ${ds.t.cls}">T média ${Number(anom.tmean_c)>=0?'+':''}${fmt(anom.tmean_c,1)} °C vs normal</span>
    <span class="context-badge ${ds.r.cls}">Chuva ${fmt(anom.precip_pct_normal,0)}% da normal</span>
    ${stationTemp!=null?`<span class="context-badge ${stationTemp>.5?'warm':stationTemp<-.5?'cold':'neutral'}">${stationTemp>=0?'+':''}${fmt(stationTemp,1)} °C vs estação</span>`:''}
    ${stationRain!=null?`<span class="context-badge ${stationRain>115?'wet':stationRain<85?'dry':'neutral'}">${fmt(stationRain,0)}% vs estação</span>`:''}`;
  const sunMonth=d.SunshineHoursMonth!=null?Number(d.SunshineHoursMonth):obs.sunshine_hours;
  const et=obs.et_mm;
  $('#month-feature-stats').innerHTML=
    monthFeature('temp','Temperatura média',`${fmt(obs.tmean_c,1)} °C`,`${Number(anom.tmean_c)>=0?'+':''}${fmt(anom.tmean_c,1)} °C vs normal${stationTemp!=null?` · ${stationTemp>=0?'+':''}${fmt(stationTemp,1)} °C vs estação`:''}`)+
    monthFeature('rain','Precipitação',`${fmt(obs.precip_mm,1)} mm`,`${fmt(anom.precip_pct_normal,0)}% da normal${stationRain!=null?` · ${fmt(stationRain,0)}% da estação`:''}`)+
    monthFeature('sun','Horas de sol',sunMonth!=null?`${fmt(sunMonth,1)} h`:'—',d.SunshineHoursMonth!=null?'mês até ao momento, Cumulus':'dias fechados')+
    monthFeature('chart','Evapotranspiração',et!=null?`${fmt(et,1)} mm`:'—','soma dos dias fechados do mês');
  const x=obs;
  const maxRain=cm.extremes?.max_daily_precip;
  const heatActive=climate?.heatwave?.active===true||climate?.heatwave?.status==='active';
  const coldActive=climate?.coldwave?.active===true||climate?.coldwave?.status==='active';
  const idx=[
    ['Dias ≥25 °C',x.tmax_ge_25,''],
    ['Dias ≥30 °C',x.tmax_ge_30,''],
    ['Dias >35 °C',x.tmax_gt_35,`normal ≈ ${fmt(norm.tmax_gt_35,1)}`],
    ['Dias ≥40 °C',x.tmax_ge_40,''],
    ['Noites tropicais',x.tropical_nights,`normal ≈ ${fmt(norm.tropical_nights,1)}`],
    ['Dias de geada',x.frost_days,`normal ≈ ${fmt(norm.frost_days,1)}`],
    ['Dias de chuva',x.rain_days,`normal ≈ ${fmt(norm.rain_days,1)}`],
    ['Chuva >10 mm',x.rain_gt_10,`normal ≈ ${fmt(norm.rain_gt_10,1)}`],
    ['Chuva >20 mm',x.rain_gt_20,`normal ≈ ${fmt(norm.rain_gt_20,1)}`],
    ['Chuva >30 mm',x.rain_gt_30,`normal ≈ ${fmt(norm.rain_gt_30,1)}`],
    ['Dias em onda de calor',x.heatwave_days,heatActive?'onda ativa':''],
    ['Dias em onda de frio',x.coldwave_days,coldActive?'onda ativa':''],
    ['Maior chuva diária',maxRain?`${fmt(maxRain.value_mm,1)} mm`:'—',maxRain?.date?dateShort(new Date(maxRain.date+'T12:00')):''],
    ['Dias secos seguidos',climate?.current_dry_spell?.current_streak_days??'—',`P < ${fmt(climate?.current_dry_spell?.threshold_mm??1,1)} mm/dia`],
    ['Maior sequência seca mês',cm?.dry_spell?.max_streak_days??'—',cm?.dry_spell?.max_streak_start?`${dateShort(new Date(cm.dry_spell.max_streak_start+'T12:00'))}–${dateShort(new Date(cm.dry_spell.max_streak_end+'T12:00'))}`:''],
    ['Graus-dia aquecimento',x.heating_degree_days!=null?fmt(x.heating_degree_days,1):'—','dias fechados'],
    ['Graus-dia arrefecimento',x.cooling_degree_days!=null?fmt(x.cooling_degree_days,1):'—','dias fechados'],
    ['Horas de frio da época',d.chillhours!=null?`${fmt(d.chillhours,1)} h`:'—','Chill Hours · acumulado sazonal Cumulus']
  ];
  $('#month-indices').innerHTML=idx.map(v=>monthIndex(v[0],v[1],v[2])).join('');
  const miss=cm.missing_day_count||0;
  $('#month-quality-note').textContent=`Período climatológico: ${cm.start} a ${cm.end} · ${cm.days_available}/${cm.days_expected} dias disponíveis${miss?` · ${miss} dia(s) em falta`:''}. As “normais” indicadas nos índices são proporcionais ao mesmo período do mês.`;
}

function recentData(){
  return obs24();
}
function seriesStats(values){
  const v=values.filter(Number.isFinite);
  if(!v.length)return{min:null,max:null,avg:null};
  return{min:Math.min(...v),max:Math.max(...v),avg:v.reduce((a,b)=>a+b,0)/v.length};
}
function valueAtHoursAgo(rows,key,hours){
  if(!rows.length)return null;
  const end=Number(rows[rows.length-1].time_ms||toMs(rows[rows.length-1].time));
  const target=end-hours*3600*1000;
  let best=null,delta=Infinity;
  rows.forEach(r=>{
    if(r[key]==null)return;
    const d=Math.abs(Number(r.time_ms||toMs(r.time))-target);
    if(d<delta){delta=d;best=Number(r[key])}
  });
  return best;
}
function recentStat(label,value,sub=''){
  return `<div class="recent-stat"><span>${label}</span><b>${value}</b>${sub?`<small>${sub}</small>`:''}</div>`;
}
function drawRecentLine(host,points,cfg,second=[]){
  if(!points.length){host.innerHTML='<div class="chart-empty">Sem observações recentes suficientes.</div>';return}
  const all=[...points,...second],W=1040,H=325,m={l:58,r:20,t:20,b:42},minT=Math.min(...all.map(x=>x.ms)),maxT=Math.max(...all.map(x=>x.ms)),vals=all.map(x=>x.v).filter(Number.isFinite),vmin=Math.min(...vals),vmax=Math.max(...vals),pad=(vmax-vmin)*.12||1,ymin=vmin-pad,ymax=vmax+pad,x=t=>m.l+(t-minT)/(maxT-minT)*(W-m.l-m.r),y=v=>m.t+(ymax-v)/(ymax-ymin)*(H-m.t-m.b);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img">`;
  for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e6edef"/><text x="${m.l-7}" y="${yy+4}" text-anchor="end" font-size="10" fill="#70818a">${fmt(v,cfg.dec)}${cfg.unit}</text>`}
  for(let i=0;i<=6;i++){const t=minT+(maxT-minT)*i/6,xx=x(t);s+=`<text x="${xx}" y="${H-15}" text-anchor="middle" font-size="9" fill="#71828b">${timeShort(new Date(t))}<tspan x="${xx}" dy="11">${dateShort(new Date(t))}</tspan></text>`}
  s+=`<path d="${svgLinePath(points,x,y)}" fill="none" stroke="#193f52" stroke-width="3"/>`;
  if(second.length)s+=`<path d="${svgLinePath(second,x,y)}" fill="none" stroke="#c54d42" stroke-width="2" stroke-dasharray="5 4"/>`;
  const last=points[points.length-1];s+=`<circle cx="${x(last.ms)}" cy="${y(last.v)}" r="4" fill="#193f52" stroke="#fff" stroke-width="2"/>`;
  s+='</svg>';host.innerHTML=s;
}
function drawRecentBars(host,points,unit=' mm'){
  if(!points.length){host.innerHTML='<div class="chart-empty">Sem precipitação recente.</div>';return}
  const W=1040,H=325,m={l:52,r:20,t:20,b:42},minT=Math.min(...points.map(x=>x.ms)),maxT=Math.max(...points.map(x=>x.ms)),maxV=Math.max(1,...points.map(x=>x.v))*1.15,x=t=>m.l+(t-minT)/(maxT-minT)*(W-m.l-m.r),y=v=>m.t+(maxV-v)/maxV*(H-m.t-m.b),bw=Math.max(4,(W-m.l-m.r)/(points.length+2)*.65);
  let s=`<svg viewBox="0 0 ${W} ${H}">`;
  for(let i=0;i<=4;i++){const v=maxV*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e6edef"/><text x="${m.l-6}" y="${yy+4}" text-anchor="end" font-size="10" fill="#70818a">${fmt(v,1)}</text>`}
  points.forEach(p=>s+=`<rect x="${x(p.ms)-bw/2}" y="${y(p.v)}" width="${bw}" height="${Math.max(1,H-m.b-y(p.v))}" fill="#2f7fa3" rx="2"/>`);
  for(let i=0;i<=6;i++){const t=minT+(maxT-minT)*i/6,xx=x(t);s+=`<text x="${xx}" y="${H-15}" text-anchor="middle" font-size="9" fill="#71828b">${timeShort(new Date(t))}<tspan x="${xx}" dy="11">${dateShort(new Date(t))}</tspan></text>`}
  s+='</svg>';host.innerHTML=s;
}
function renderRecent(variable='temperature'){
  const rows=recentData(),host=$('#recent-chart'),sum=$('#recent-summary');
  const source=history?.source||'Cumulus';
  $('#recent-source-note').textContent=history?.available?`Dados medidos pela estação · ${source}.`:'Histórico recente temporariamente indisponível.';
  [...document.querySelectorAll('.recent-tab')].forEach(b=>b.classList.toggle('is-active',b.dataset.recentVar===variable));
  if(!rows.length){sum.innerHTML='';host.innerHTML='<div class="chart-empty">O histórico recente ainda não está disponível. A leitura atual da estação continua válida.</div>';return}
  const ms=r=>Number(r.time_ms||toMs(r.time));
  if(variable==='temperature'){
    const pts=rows.filter(r=>r.temp!=null).map(r=>({ms:ms(r),v:Number(r.temp)})),st=seriesStats(pts.map(x=>x.v)),cur=current?.data?.temp!=null?Number(current.data.temp):pts.at(-1)?.v,ago=valueAtHoursAgo(rows,'temp',3),delta=cur!=null&&ago!=null?cur-ago:null;
    sum.innerHTML=recentStat('Atual',`${fmt(cur,1)} °C`)+recentStat('Máxima 24 h',`${fmt(st.max,1)} °C`)+recentStat('Mínima 24 h',`${fmt(st.min,1)} °C`)+recentStat('Variação 3 h',`${delta!=null&&delta>0?'+':''}${fmt(delta,1)} °C`);
    drawRecentLine(host,pts,{unit:'°C',dec:1});
  }else if(variable==='humidity'){
    const pts=rows.filter(r=>r.hum!=null).map(r=>({ms:ms(r),v:Number(r.hum)})),st=seriesStats(pts.map(x=>x.v)),cur=current?.data?.hum!=null?Number(current.data.hum):pts.at(-1)?.v,ago=valueAtHoursAgo(rows,'hum',3),delta=cur!=null&&ago!=null?cur-ago:null;
    sum.innerHTML=recentStat('Atual',`${fmt(cur,0)}%`)+recentStat('Máxima 24 h',`${fmt(st.max,0)}%`)+recentStat('Mínima 24 h',`${fmt(st.min,0)}%`)+recentStat('Variação 3 h',`${delta!=null&&delta>0?'+':''}${fmt(delta,0)} p.p.`);
    drawRecentLine(host,pts,{unit:'%',dec:0});
  }else if(variable==='pressure'){
    const pts=rows.filter(r=>r.pressure!=null).map(r=>({ms:ms(r),v:Number(r.pressure)})),st=seriesStats(pts.map(x=>x.v)),cur=current?.data?.press!=null?Number(current.data.press):pts.at(-1)?.v,ago=valueAtHoursAgo(rows,'pressure',3),delta=cur!=null&&ago!=null?cur-ago:null;
    sum.innerHTML=recentStat('Atual',`${fmt(cur,1)} hPa`)+recentStat('Máxima 24 h',`${fmt(st.max,1)} hPa`)+recentStat('Mínima 24 h',`${fmt(st.min,1)} hPa`)+recentStat('Variação 3 h',`${delta!=null&&delta>0?'+':''}${fmt(delta,1)} hPa`);
    drawRecentLine(host,pts,{unit:' hPa',dec:1});
  }else if(variable==='wind'){
    const pts=rows.filter(r=>r.wind_avg!=null).map(r=>({ms:ms(r),v:Number(r.wind_avg)})),gust=rows.filter(r=>r.wind_gust!=null).map(r=>({ms:ms(r),v:Number(r.wind_gust)})),st=seriesStats(pts.map(x=>x.v)),gs=seriesStats(gust.map(x=>x.v)),last=rows.at(-1),cw=current?.data||{};
    const currentWind=cw.wspeed!=null?Number(cw.wspeed):last.wind_avg,currentDir=cw.currentwdir||cw.wdir||windDir(cw.bearing??last.wind_bearing);
    sum.innerHTML=recentStat('Atual',`${fmt(currentWind,1)} km/h`,currentDir)+recentStat('Média 24 h',`${fmt(st.avg,1)} km/h`)+recentStat('Rajada máxima',`${fmt(gs.max,1)} km/h`)+recentStat('Direção atual',currentDir);
    drawRecentLine(host,pts,{unit:' km/h',dec:0},gust);
  }else if(variable==='solar'){
    const pts=rows.filter(r=>r.solar!=null).map(r=>({ms:ms(r),v:Number(r.solar)})),st=seriesStats(pts.map(x=>x.v)),uv=rows.filter(r=>r.uv!=null).map(r=>Number(r.uv)),uvs=seriesStats(uv),last=rows.at(-1),cd=current?.data||{};
    const solarNow=cd.SolarRad!=null?Number(cd.SolarRad):last.solar,uvNow=cd.UV!=null?Number(cd.UV):last.uv;
    sum.innerHTML=recentStat('Radiação atual',`${fmt(solarNow,0)} W/m²`)+recentStat('Máx. 24 h',`${fmt(st.max,0)} W/m²`)+recentStat('UV atual',fmt(uvNow,1))+recentStat('UV máximo 24 h',fmt(uvs.max,1));
    drawRecentLine(host,pts,{unit:' W/m²',dec:0});
  }else{
    const bars=(history?.hourly_rain||[]).filter(x=>Number(x.time_ms||toMs(x.time))>=Number(rows[0].time_ms||toMs(rows[0].time))).map(x=>({ms:Number(x.time_ms||toMs(x.time)),v:Number(x.precip_mm||0)}));
    const total=bars.reduce((a,b)=>a+b.v,0),maxHour=Math.max(0,...bars.map(x=>x.v)),rates=rows.filter(r=>r.rain_rate!=null).map(r=>Number(r.rain_rate)),rateMax=Math.max(0,...rates),last=rows.at(-1);
    sum.innerHTML=recentStat('Total 24 h',`${fmt(total,1)} mm`)+recentStat('Hora mais chuvosa',`${fmt(maxHour,1)} mm`)+recentStat('Intensidade máxima',`${fmt(rateMax,1)} mm/h`)+recentStat('Acumulado hoje',`${fmt(last.rain_today,1)} mm`);
    drawRecentBars(host,bars);
  }
}


function renderTodayHistory(){
 if(!calendarData?.available)return;
 const now=new Date(),m=now.getMonth()+1,d=now.getDate(),key=`${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,rows=[...(calendarData.same_calendar_day?.[key]||[])];
 const names=['','janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
 $('#today-history-title').textContent=`${d} de ${names[m]} ao longo da série`;
 const cd=current?.data||{};
 rows.push({year:now.getFullYear(),tmin:cd.tempTL,tmax:cd.tempTH,tmean:null,rain:cd.rfall,live:true});
 rows.sort((a,b)=>a.year-b.year);
 $('#today-history-grid').innerHTML=rows.map(r=>`<div class="today-history-card ${r.live?'live':''}"><b>${r.year}${r.live?' · hoje':''}</b><span>${fmt(r.tmin,1)} / ${fmt(r.tmax,1)} °C</span><span>${r.tmean==null?'média: —':`média: ${fmt(r.tmean,1)} °C`}</span><span>chuva: ${fmt(r.rain,1)} mm</span>${r.live?'<small>dia em curso — sem ranking</small>':''}</div>`).join('');
 const closed=rows.filter(r=>!r.live&&r.tmax!=null);
 if(closed.length){
   const max=Math.max(...closed.map(r=>Number(r.tmax))),min=Math.min(...closed.map(r=>Number(r.tmin))),wet=Math.max(...closed.map(r=>Number(r.rain||0)));
   $('#today-history-text').textContent=`Nos anos fechados desta data: Tmax recorde ${fmt(max,1)} °C · Tmin recorde ${fmt(min,1)} °C · maior chuva ${fmt(wet,1)} mm. O dia atual só entra no ranking depois de fechar.`;
 }
}

async function init(){
  $('#ico-climate').innerHTML=icon('chart');$('#ico-report').innerHTML=icon('report');$('#ico-record').innerHTML=icon('trophy');$('#ico-calendar').innerHTML=icon('calendar');$('#ico-camera').innerHTML=icon('camera');
  const recentLabels={temperature:['temp','Temperatura'],precipitation:['rain','Chuva'],wind:['wind','Vento'],pressure:['pressure','Pressão'],humidity:['drop','Humidade'],solar:['sun','Solar / UV']};
  document.querySelectorAll('.recent-tab').forEach(b=>{const x=recentLabels[b.dataset.recentVar];b.innerHTML=icon(x[0])+`<span>${x[1]}</span>`;b.addEventListener('click',()=>renderRecent(b.dataset.recentVar))});
  try{
    [current,forecast,history,climate,calendarData]=await Promise.all([getJson('current.json'),getJson('forecast.json'),getJson('history24h.json'),getJson('/climate/climate_summary.json'),getJson('/calendario/calendar.json')]);
    renderCurrent();renderRecent('temperature');renderForecast();renderMonthContext();renderTodayHistory();
  }catch(e){
    console.error(e);$('#now-status').textContent='Alguns dados estão temporariamente indisponíveis.';
  }
  $('#timeline-variable').addEventListener('change',renderTimeline);$('#local-bridge-toggle').addEventListener('change',renderTimeline);
  setInterval(async()=>{try{current=await getJson('current.json');renderCurrent();renderMonthContext();renderTodayHistory()}catch(e){}},60000);
  setInterval(()=>{const img=$('#camera-img');if(img)img.src='/camera/latest.jpg?t='+Date.now()},300000);
}
init();
