
const $=q=>document.querySelector(q);
const fmt=(v,d=1)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const dayFmt=s=>new Intl.DateTimeFormat('pt-PT',{weekday:'short',day:'2-digit',month:'2-digit'}).format(new Date(s+'T12:00:00'));
const dtFmt=s=>new Intl.DateTimeFormat('pt-PT',{weekday:'short',day:'2-digit',hour:'2-digit'}).format(new Date(s));
const timeFmt=s=>new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit'}).format(new Date(s));
const COLORS=['#245f77','#c55348','#65916e','#8070a1','#bd8b2d','#4f92b0'];
let forecast=null,current=null,verification=null,tab='temperature';

async function getJson(u){const r=await fetch(u+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(`${u}:${r.status}`);return r.json()}
function weatherSymbol(code){code=Number(code);if(code===0)return'☀️';if([1,2].includes(code))return'🌤️';if(code===3)return'☁️';if([45,48].includes(code))return'🌫️';if([51,53,55,56,57].includes(code))return'🌦️';if([61,63,65,66,67,80,81,82].includes(code))return'🌧️';if([71,73,75,77,85,86].includes(code))return'🌨️';if([95,96,99].includes(code))return'⛈️';return'☁️'}
function windDir(deg){if(deg==null)return'—';return['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(Number(deg)/22.5)%16]}
function hourlyRows(model){const h=model?.hourly||{},t=h.time||[];return t.map((time,i)=>{const r={time};Object.keys(h).forEach(k=>{if(k!=='time'&&Array.isArray(h[k]))r[k]=h[k][i]});return r})}
function dailyRows(model){const d=model?.daily||{},t=d.time||[];return t.map((time,i)=>{const r={time};Object.keys(d).forEach(k=>{if(k!=='time'&&Array.isArray(d[k]))r[k]=d[k][i]});return r})}
function future72(){const rows=hourlyRows(forecast?.primary),now=Date.now()-3600000;return rows.filter(r=>new Date(r.time).getTime()>=now).slice(0,72)}
function renderDays(){
 const rows=dailyRows(forecast?.primary).slice(0,10);
 $('#fx-days').innerHTML=rows.map((r,i)=>`<article class="fx-day ${i===0?'today':''}"><b>${i===0?'Hoje':dayFmt(r.time).split(',')[0]}</b><span class="date">${dayFmt(r.time).replace(/^[^,]+,\s*/,'')}</span><div class="symbol">${weatherSymbol(r.weather_code)}</div><span class="temp">${fmt(r.temperature_2m_max,0)}° <small style="display:inline">${fmt(r.temperature_2m_min,0)}°</small></span><small>🌧 ${fmt(r.precipitation_probability_max,0)}% · ${fmt(r.precipitation_sum,1)} mm</small><small>💨 ${windDir(r.wind_direction_10m_dominant)} · ${fmt(r.wind_gusts_10m_max,0)} km/h</small><small>UV ${fmt(r.uv_index_max,0)}</small></article>`).join('');
}
const TABS={
 temperature:{label:'Temperatura',unit:'°C',series:[['temperature_2m','Temperatura'],['dew_point_2m','Ponto de orvalho'],['apparent_temperature','Aparente']]},
 rain:{label:'Precipitação',unit:'mm',series:[['precipitation','Precipitação']]},
 wind:{label:'Vento',unit:'km/h',series:[['wind_speed_10m','Vento'],['wind_gusts_10m','Rajada']]},
 humidity:{label:'Humidade / nuvens',unit:'%',series:[['relative_humidity_2m','Humidade'],['cloud_cover','Nuvens']]},
 pressure:{label:'Pressão',unit:'hPa',series:[['pressure_msl','Pressão']]},
 solar:{label:'Solar / UV',unit:'W/m²',series:[['shortwave_radiation','Radiação']]}
};
function stats(vals){const v=vals.filter(Number.isFinite);return{min:v.length?Math.min(...v):null,max:v.length?Math.max(...v):null,avg:v.length?v.reduce((a,b)=>a+b,0)/v.length:null,sum:v.reduce((a,b)=>a+b,0)}}
function renderTabs(){$('#fx-tabs').innerHTML=Object.entries(TABS).map(([k,v])=>`<button class="fx-tab ${k===tab?'is-active':''}" data-tab="${k}">${v.label}</button>`).join('');document.querySelectorAll('.fx-tab').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;renderTabs();renderMeteogram()})}
function svgLine(points,x,y){return points.map((p,i)=>`${i?'L':'M'} ${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ')}
function renderMeteogram(){
 const rows=future72(),cfg=TABS[tab],W=1120,H=400,m={l:70,r:25,t:22,b:48},times=rows.map(r=>new Date(r.time).getTime()),minT=Math.min(...times),maxT=Math.max(...times),x=t=>m.l+(t-minT)/(maxT-minT||1)*(W-m.l-m.r);
 let defs=cfg.series.filter(d=>rows.some(r=>r[d[0]]!=null)),values=defs.flatMap(d=>rows.map(r=>Number(r[d[0]])).filter(Number.isFinite));
 if(tab==='rain')values=rows.map(r=>Number(r.precipitation||0));
 let mn=Math.min(...values),mx=Math.max(...values);if(!Number.isFinite(mn)||!Number.isFinite(mx)){mn=0;mx=1}let pad=(mx-mn)*.12||1;if(mn>=0&&mn-pad<0)mn=0;else mn-=pad;mx+=pad;
 const y=v=>m.t+(mx-v)/(mx-mn)*(H-m.t-m.b);
 let s=`<svg viewBox="0 0 ${W} ${H}">`;
 for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e7edef"/><text x="${m.l-8}" y="${yy+4}" text-anchor="end" font-size="9" fill="#72828b">${fmt(v,tab==='humidity'?0:1)}</text>`}
 s+=`<text x="15" y="${H/2}" text-anchor="middle" transform="rotate(-90 15 ${H/2})" font-size="10" font-weight="800" fill="#687a83">${cfg.unit}</text>`;
 const ticks=12;for(let i=0;i<=ticks;i++){const t=minT+(maxT-minT)*i/ticks,xx=x(t),d=new Date(t);s+=`<text x="${xx}" y="${H-17}" text-anchor="middle" font-size="8" fill="#72828b">${new Intl.DateTimeFormat('pt-PT',{day:'2-digit',hour:'2-digit'}).format(d)}</text>`}
 if(tab==='rain'){
   const bw=Math.max(3,(W-m.l-m.r)/rows.length*.7),zero=y(0);rows.forEach(r=>{const v=Number(r.precipitation||0),yy=y(v);s+=`<rect x="${x(new Date(r.time).getTime())-bw/2}" y="${yy}" width="${bw}" height="${Math.max(1,zero-yy)}" fill="#2f7d9e" opacity=".72" rx="1"/>`});
   const probs=rows.map(r=>Number(r.precipitation_probability)).filter(Number.isFinite),pmax=Math.max(100,...probs);const yp=v=>m.t+(100-v)/100*(H-m.t-m.b),pts=rows.filter(r=>r.precipitation_probability!=null).map(r=>({t:new Date(r.time).getTime(),v:Number(r.precipitation_probability)}));if(pts.length)s+=`<path d="${svgLine(pts,x,yp)}" fill="none" stroke="#bd8b2d" stroke-width="2" stroke-dasharray="5 4"/>`;
 }else{
   defs.forEach((d,i)=>{const pts=rows.filter(r=>r[d[0]]!=null).map(r=>({t:new Date(r.time).getTime(),v:Number(r[d[0]])}));if(pts.length)s+=`<path d="${svgLine(pts,x,y)}" fill="none" stroke="${COLORS[i]}" stroke-width="${i===0?2.6:1.8}" ${i>0?'stroke-dasharray="5 4"':''}/>`});
   if(tab==='temperature'&&forecast?.local_bridge?.available){
     const a=forecast.local_bridge.hourly?.temperature_2m||[],all=forecast.primary?.hourly?.time||[],pts=[];all.forEach((t,i)=>{if(a[i]!=null&&new Date(t).getTime()>=minT&&new Date(t).getTime()<=maxT)pts.push({t:new Date(t).getTime(),v:Number(a[i])})});if(pts.length)s+=`<path d="${svgLine(pts,x,y)}" fill="none" stroke="#65916e" stroke-width="2" stroke-dasharray="2 4"/>`;
   }
 }
 s+='</svg>';$('#fx-chart').innerHTML=s;
 let cards=[];
 if(tab==='temperature'){const v=rows.map(r=>Number(r.temperature_2m));const st=stats(v);cards=[['Mínima 72 h',`${fmt(st.min,1)} °C`],['Máxima 72 h',`${fmt(st.max,1)} °C`],['Média',`${fmt(st.avg,1)} °C`],['Maior aparente',`${fmt(Math.max(...rows.map(r=>Number(r.apparent_temperature)).filter(Number.isFinite)),1)} °C`]]}
 if(tab==='rain'){const p=rows.map(r=>Number(r.precipitation||0)),pr=rows.map(r=>Number(r.precipitation_probability||0));cards=[['Total 72 h',`${fmt(p.reduce((a,b)=>a+b,0),1)} mm`],['Maior hora',`${fmt(Math.max(...p),1)} mm`],['Prob. máxima',`${fmt(Math.max(...pr),0)}%`],['Horas com chuva',String(p.filter(x=>x>.05).length)]]}
 if(tab==='wind'){const w=stats(rows.map(r=>Number(r.wind_speed_10m))),g=stats(rows.map(r=>Number(r.wind_gusts_10m)));cards=[['Vento médio',`${fmt(w.avg,1)} km/h`],['Vento máximo',`${fmt(w.max,1)} km/h`],['Rajada máxima',`${fmt(g.max,1)} km/h`],['Direção agora',windDir(rows[0]?.wind_direction_10m)]]}
 if(tab==='humidity'){const h=stats(rows.map(r=>Number(r.relative_humidity_2m))),c=stats(rows.map(r=>Number(r.cloud_cover)));cards=[['Humidade mínima',`${fmt(h.min,0)}%`],['Humidade máxima',`${fmt(h.max,0)}%`],['Nuvens médias',`${fmt(c.avg,0)}%`],['Nuvens máximas',`${fmt(c.max,0)}%`]]}
 if(tab==='pressure'){const p=stats(rows.map(r=>Number(r.pressure_msl)));cards=[['Mínima',`${fmt(p.min,1)} hPa`],['Máxima',`${fmt(p.max,1)} hPa`],['Amplitude',`${fmt(p.max-p.min,1)} hPa`],['Média',`${fmt(p.avg,1)} hPa`]]}
 if(tab==='solar'){const s2=stats(rows.map(r=>Number(r.shortwave_radiation))),uv=stats(rows.map(r=>Number(r.uv_index)));cards=[['Radiação máxima',`${fmt(s2.max,0)} W/m²`],['UV máximo',fmt(uv.max,1)],['Radiação média',`${fmt(s2.avg,0)} W/m²`],['Horas com sol',String(rows.filter(r=>Number(r.shortwave_radiation)>120).length)]]}
 $('#fx-meteo-stats').innerHTML=cards.map(x=>`<div class="fx-stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 $('#fx-chart-note').textContent=tab==='rain'?'Barras: precipitação horária · linha dourada tracejada: probabilidade de precipitação.':`${defs.map(d=>d[1]).join(' · ')}${tab==='temperature'&&forecast?.local_bridge?.available?' · verde tracejado: Ponte local':''}.`;
}
function agreementLabel(v,type){if(type==='temp'){if(v<1.5)return['Bom acordo','good'];if(v<3)return['Divergência moderada','medium'];return['Divergência elevada','high']}if(v<2)return['Bom acordo','good'];if(v<7)return['Divergência moderada','medium'];return['Divergência elevada','high']}
function renderBridge(){
 const b=forecast?.local_bridge;if(!b?.available){$('#fx-bridge').innerHTML='<p>A ponte local não está disponível nesta atualização.</p>';return}
 const o=b.offsets||{};$('#fx-bridge').innerHTML=`<p style="font-size:10px;color:#6c7d85">${b.method}</p><div class="fx-bridge-grid"><div class="fx-mini"><span>Temperatura agora</span><b>${o.temperature_2m>=0?'+':''}${fmt(o.temperature_2m,1)} °C</b></div><div class="fx-mini"><span>Humidade agora</span><b>${o.relative_humidity_2m>=0?'+':''}${fmt(o.relative_humidity_2m,0)} p.p.</b></div><div class="fx-mini"><span>Pressão agora</span><b>${o.pressure_msl>=0?'+':''}${fmt(o.pressure_msl,1)} hPa</b></div></div><p style="font-size:8px;color:#7d8b93">A correção desvanece até zero; não é um novo modelo meteorológico.</p>`;
}
function renderAgreement(){
 const e=dailyRows(forecast?.models?.ecmwf),g=dailyRows(forecast?.models?.gfs),n=Math.min(e.length,g.length,10);let td=0,ed=0,gd=0;for(let i=0;i<n;i++){if(e[i]?.temperature_2m_max!=null&&g[i]?.temperature_2m_max!=null)td=Math.max(td,Math.abs(e[i].temperature_2m_max-g[i].temperature_2m_max));if(i<3){ed+=Number(e[i]?.precipitation_sum||0);gd+=Number(g[i]?.precipitation_sum||0)}}const rd=Math.abs(ed-gd),ta=agreementLabel(td,'temp'),ra=agreementLabel(rd,'rain');$('#fx-agreement').innerHTML=`<div class="fx-agree-grid"><div class="fx-mini"><span>Temperatura</span><b><i class="fx-agreement ${ta[1]}">${ta[0]}</i></b><small>maior Δ Tmax ${fmt(td,1)} °C</small></div><div class="fx-mini"><span>Chuva 3 dias</span><b><i class="fx-agreement ${ra[1]}">${ra[0]}</i></b><small>diferença ${fmt(rd,1)} mm</small></div><div class="fx-mini"><span>Acumulados 3 dias</span><b>${fmt(ed,1)} / ${fmt(gd,1)} mm</b><small>ECMWF / GFS</small></div></div>`;
}
function ensembleRows(){const h=forecast?.ensemble?.hourly||{},t=h.time||[];return t.map((time,i)=>{const r={time};Object.keys(h).forEach(k=>{if(k!=='time'&&Array.isArray(h[k]))r[k]=h[k][i]});return r}).filter(r=>new Date(r.time).getTime()>=Date.now()-3600000)}
function renderEnsemble(){
 const host=$('#fx-ensemble-chart'),statsHost=$('#fx-ensemble-stats'),ens=forecast?.ensemble;
 if(!ens?.available){statsHost.innerHTML='';host.innerHTML='<p style="padding:30px;color:#6c7d85">Ensemble temporariamente indisponível; a previsão determinística continua operacional.</p>';return}
 const kind=$('#fx-ensemble-var').value,rows=ensembleRows().slice(0,168),cfg={temperature:['temperature_2m','temperature_2m_spread','°C'],precipitation:['precipitation','precipitation_spread','mm'],wind:['wind_speed_10m','wind_speed_10m_spread','km/h']}[kind],meanKey=cfg[0],spreadKey=cfg[1],vals=rows.filter(r=>r[meanKey]!=null&&r[spreadKey]!=null);
 if(vals.length<2){host.innerHTML='<p style="padding:30px;color:#6c7d85">Sem spread suficiente para esta variável.</p>';return}
 const meanSpread=vals.reduce((a,r)=>a+Number(r[spreadKey]),0)/vals.length,maxSpread=Math.max(...vals.map(r=>Number(r[spreadKey]))),s24=vals.filter(r=>new Date(r.time).getTime()<Date.now()+24*3600000),s72=vals.filter(r=>new Date(r.time).getTime()<Date.now()+72*3600000),avg=a=>a.length?a.reduce((s,r)=>s+Number(r[spreadKey]),0)/a.length:null;
 statsHost.innerHTML=`<div class="fx-stat"><span>Spread médio 24 h</span><b>${fmt(avg(s24),2)} ${cfg[2]}</b></div><div class="fx-stat"><span>Spread médio 72 h</span><b>${fmt(avg(s72),2)} ${cfg[2]}</b></div><div class="fx-stat"><span>Spread médio 7 dias</span><b>${fmt(meanSpread,2)} ${cfg[2]}</b></div><div class="fx-stat"><span>Spread máximo</span><b>${fmt(maxSpread,2)} ${cfg[2]}</b></div>`;
 const W=1100,H=350,m={l:65,r:22,t:22,b:42},times=vals.map(r=>new Date(r.time).getTime()),minT=Math.min(...times),maxT=Math.max(...times),lo=vals.map(r=>Number(r[meanKey])-Number(r[spreadKey])),hi=vals.map(r=>Number(r[meanKey])+Number(r[spreadKey])),all=[...lo,...hi],mn=Math.min(...all),mx=Math.max(...all),pad=(mx-mn)*.08||1,ymin=kind==='precipitation'?Math.max(0,mn):mn-pad,ymax=mx+pad,x=t=>m.l+(t-minT)/(maxT-minT||1)*(W-m.l-m.r),y=v=>m.t+(ymax-v)/(ymax-ymin||1)*(H-m.t-m.b);
 let svg=`<svg viewBox="0 0 ${W} ${H}">`;for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,yy=y(v);svg+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e7edef"/><text x="${m.l-8}" y="${yy+4}" text-anchor="end" font-size="9" fill="#72828b">${fmt(v,1)}</text>`}svg+=`<text x="15" y="${H/2}" transform="rotate(-90 15 ${H/2})" text-anchor="middle" font-size="10" fill="#687a83">${cfg[2]}</text>`;
 const upper=vals.map((r,i)=>`${i?'L':'M'} ${x(new Date(r.time).getTime())} ${y(Number(r[meanKey])+Number(r[spreadKey]))}`).join(' '),lower=[...vals].reverse().map(r=>`L ${x(new Date(r.time).getTime())} ${y(Number(r[meanKey])-Number(r[spreadKey]))}`).join(' ');svg+=`<path d="${upper} ${lower} Z" fill="#2f7d9e" opacity=".14"/><path d="${vals.map((r,i)=>`${i?'L':'M'} ${x(new Date(r.time).getTime())} ${y(Number(r[meanKey]))}`).join(' ')}" fill="none" stroke="#2f7d9e" stroke-width="2.5"/>`;
 for(let i=0;i<=8;i++){const t=minT+(maxT-minT)*i/8;svg+=`<text x="${x(t)}" y="${H-16}" text-anchor="middle" font-size="8" fill="#72828b">${new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit'}).format(new Date(t))}</text>`}svg+='</svg>';host.innerHTML=svg;
}
function renderUsefulDetails(){
 const rows=future72().slice(0,24),maxCape=Math.max(0,...rows.map(x=>Number(x.cape||0))),vis=rows.map(x=>Number(x.visibility)).filter(Number.isFinite),minVis=vis.length?Math.min(...vis):null,freeze=rows.find(x=>x.freezing_level_height!=null)?.freezing_level_height,vpd=rows.find(x=>x.vapour_pressure_deficit!=null)?.vapour_pressure_deficit,et0=rows.reduce((a,x)=>a+Number(x.et0_fao_evapotranspiration||0),0),soil=rows.find(x=>x.soil_moisture_0_to_1cm!=null)?.soil_moisture_0_to_1cm;
 const items=[['Visibilidade mínima',minVis!=null?`${fmt(minVis/1000,1)} km`:'—','24 h'],['Nível 0 °C',freeze!=null?`${fmt(freeze,0)} m`:'—','altitude prevista'],['CAPE máximo',`${fmt(maxCape,0)} J/kg`,'energia convectiva'],['VPD',vpd!=null?`${fmt(vpd,2)} kPa`:'—','défice de pressão de vapor'],['ET₀ 24 h',`${fmt(et0,2)} mm`,'referência FAO-56'],['Humidade solo 0–1 cm',soil!=null?`${fmt(soil,3)} m³/m³`:'—','valor modelado']];
 $('#fx-details').innerHTML=items.map(x=>`<div class="fx-detail"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
}
function renderModelChart(){
 const kind=$('#fx-model-var').value,e=dailyRows(forecast?.models?.ecmwf).slice(0,10),g=dailyRows(forecast?.models?.gfs).slice(0,10),p=dailyRows(forecast?.primary).slice(0,10),n=Math.min(e.length,g.length,p.length);if(!n){$('#fx-model-chart').innerHTML='';return}
 const W=1100,H=350,m={l:62,r:22,t:22,b:42},keys=kind==='temperature'?['temperature_2m_max','°C']:['precipitation_sum','mm'],all=[...e,...g,...p].slice(0,n*3).map(r=>Number(r[keys[0]])).filter(Number.isFinite),mn=Math.min(...all),mx=Math.max(...all),pad=(mx-mn)*.12||1,ymin=Math.max(0,kind==='precipitation'?mn:mn-pad),ymax=mx+pad,x=i=>m.l+i/(Math.max(1,n-1))*(W-m.l-m.r),y=v=>m.t+(ymax-v)/(ymax-ymin||1)*(H-m.t-m.b);
 let s=`<svg viewBox="0 0 ${W} ${H}">`;for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e7edef"/><text x="${m.l-8}" y="${yy+4}" text-anchor="end" font-size="9" fill="#72828b">${fmt(v,1)}</text>`}s+=`<text x="15" y="${H/2}" transform="rotate(-90 15 ${H/2})" text-anchor="middle" font-size="10" fill="#687a83">${keys[1]}</text>`;
 const line=(rows,key,color,dash='')=>{const pts=rows.slice(0,n).map((r,i)=>({x:x(i),y:y(Number(r[key]))})).filter(p=>Number.isFinite(p.y));if(pts.length)s+=`<path d="${pts.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2.3" ${dash?`stroke-dasharray="${dash}"`:''}/>`};
 line(p,keys[0],'#245f77');line(e,keys[0],'#65916e','6 4');line(g,keys[0],'#c55348','4 4');
 for(let i=0;i<n;i++)s+=`<text x="${x(i)}" y="${H-15}" text-anchor="middle" font-size="8" fill="#72828b">${new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit'}).format(new Date(p[i].time+'T12:00'))}</text>`;
 s+=`<text x="${m.l}" y="13" font-size="9" fill="#245f77">● Best Match</text><text x="${m.l+90}" y="13" font-size="9" fill="#65916e">● ECMWF</text><text x="${m.l+158}" y="13" font-size="9" fill="#c55348">● GFS</text></svg>`;$('#fx-model-chart').innerHTML=s;
}
function renderHourly(){
 const rows=future72().slice(0,24);$('#fx-hourly-table').innerHTML=`<table><thead><tr><th>Hora</th><th>Tempo</th><th>Temperatura</th><th>Humidade</th><th>Chuva</th><th>Prob.</th><th>Vento</th><th>Rajada</th><th>Pressão</th><th>Nuvens</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${dtFmt(r.time)}</td><td>${weatherSymbol(r.weather_code)}</td><td>${fmt(r.temperature_2m,1)} °C</td><td>${fmt(r.relative_humidity_2m,0)}%</td><td>${fmt(r.precipitation,1)} mm</td><td>${fmt(r.precipitation_probability,0)}%</td><td>${windDir(r.wind_direction_10m)} ${fmt(r.wind_speed_10m,0)}</td><td>${fmt(r.wind_gusts_10m,0)} km/h</td><td>${fmt(r.pressure_msl,0)} hPa</td><td>${fmt(r.cloud_cover,0)}%</td></tr>`).join('')}</tbody></table>`;
}
function renderVerification(){
 if(!verification){$('#fx-verification').innerHTML='<p>Histórico de verificação ainda indisponível.</p>';return}
 if(!verification.available){$('#fx-verification').innerHTML=`<p style="font-size:10px;color:#6c7d85">${verification.message||'A recolher histórico.'}</p><div class="fx-stats"><div class="fx-stat"><span>Arquivadas</span><b>${verification.archive_records||0}</b></div><div class="fx-stat"><span>Comparáveis</span><b>${verification.matched_samples||0}</b></div></div>`;return}
 const rows=verification.samples||[],vars=[['temperature','Temperatura','°C'],['humidity','Humidade','%'],['wind','Vento',' km/h'],['precipitation','Chuva',' mm']];$('#fx-verification').innerHTML=`<div class="fx-stats">${vars.map(([k,l,u])=>{const pairs=rows.filter(r=>r.observed?.[k]!=null&&r.best_match?.[k]!=null),mae=pairs.length?pairs.reduce((a,r)=>a+Math.abs(Number(r.best_match[k])-Number(r.observed[k])),0)/pairs.length:null;return `<div class="fx-stat"><span>${l} · MAE</span><b>${fmt(mae,k==='humidity'?0:1)}${u}</b><small>${pairs.length} pontos</small></div>`}).join('')}</div>`;
}
async function init(){
 [forecast,current,verification]=await Promise.all([getJson('/agora/forecast.json'),getJson('/agora/current.json').catch(()=>null),getJson('/graficos/forecast-verification.json').catch(()=>null)]);
 $('#fx-status').textContent=`${forecast.source||'Open-Meteo'} · ${forecast.stale?'cache':'atualizada'} · 40.99643, −7.32928`;
 renderDays();renderTabs();renderMeteogram();renderBridge();renderAgreement();renderEnsemble();renderUsefulDetails();renderModelChart();renderHourly();renderVerification();
 $('#fx-model-var').onchange=renderModelChart;
 $('#fx-ensemble-var').onchange=renderEnsemble;
}
init();