const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const n = (v,d=1) => v===null || v===undefined || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const sign = v => Number(v)>0 ? '+' : '';
const dpt = s => s ? new Date(s+'T12:00:00').toLocaleDateString('pt-PT') : '—';
const ms = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ml = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function tabs(){
  $$('.tab').forEach(b=>b.addEventListener('click',()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    $$('.section').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); $('#'+b.dataset.target).classList.add('active');
    history.replaceState(null,'','#'+b.dataset.target);
  }));
  const h=location.hash.slice(1); if(h && $('#'+h)){ const b=$(`.tab[data-target="${h}"]`); if(b)b.click(); }
}
function se(tag,a={},t=''){ const e=document.createElementNS('http://www.w3.org/2000/svg',tag); Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v)); if(t)e.textContent=t; return e; }
function clear(e){ while(e.firstChild)e.removeChild(e.firstChild); }

function bars(el,rows,key,opt={}){
  clear(el); if(!rows.length){el.textContent='Sem dados.';return;}
  const W=900,H=330,m={l:58,r:22,t:24,b:52},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const vals=rows.map(r=>Number(r[key])||0), min=Math.min(0,...vals), max=Math.max(0,...vals), span=(max-min)||1;
  const y=v=>m.t+(max-v)/span*ih, svg=se('svg',{viewBox:`0 0 ${W} ${H}`,'aria-label':opt.aria||'Gráfico'});
  for(let i=0;i<=4;i++){ const v=min+span*i/4,yy=y(v); svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e3e9ed'})); svg.append(se('text',{x:m.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},`${n(v,opt.d??1)}${opt.s||''}`)); }
  const bw=iw/rows.length*.58;
  rows.forEach((r,i)=>{
    const x=m.l+(i+.5)*iw/rows.length-bw/2,v=Number(r[key])||0,yy=Math.min(y(v),y(0)),hh=Math.max(1,Math.abs(y(v)-y(0)));
    const rect=se('rect',{x,y:yy,width:bw,height:hh,rx:3,fill:v>=0?(opt.pos||'#c85b32'):(opt.neg||'#4777a8')});
    rect.append(se('title',{},`${r.tooltip||r.label}: ${n(v,opt.d??1)}${opt.s||''}`)); svg.append(rect);
    svg.append(se('text',{x:x+bw/2,y:H-22,'text-anchor':'middle','font-size':11,fill:'#64727d'},r.label));
  }); el.append(svg);
}
function lines(el,series){
  clear(el); const all=series.flatMap(s=>s.data.map(p=>Number(p.value))).filter(Number.isFinite); if(!all.length){el.textContent='Sem dados.';return;}
  const W=900,H=340,m={l:58,r:24,t:26,b:50},iw=W-m.l-m.r,ih=H-m.t-m.b,max=Math.max(...all)*1.08||1,y=v=>m.t+(max-v)/max*ih,count=Math.max(...series.map(s=>s.data.length)),x=i=>m.l+(count<=1?iw/2:i*iw/(count-1)),svg=se('svg',{viewBox:`0 0 ${W} ${H}`}),colors=['#176b87','#9a7b45','#6f7f8a'];
  for(let i=0;i<=4;i++){const v=max*i/4,yy=y(v);svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e3e9ed'}));svg.append(se('text',{x:m.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},n(v,0)));}
  series.forEach((s,si)=>{svg.append(se('polyline',{points:s.data.map((p,i)=>`${x(i)},${y(p.value)}`).join(' '),fill:'none',stroke:colors[si%colors.length],'stroke-width':3}));s.data.forEach((p,i)=>{const c=se('circle',{cx:x(i),cy:y(p.value),r:4,fill:colors[si%colors.length]});c.append(se('title',{},`${s.label} · ${p.label}: ${n(p.value,1)} mm`));svg.append(c);if(si===0)svg.append(se('text',{x:x(i),y:H-22,'text-anchor':'middle','font-size':11,fill:'#64727d'},p.label));});}); el.append(svg);
}
function scatter(el,rows){
  clear(el); const a=rows.filter(r=>Number.isFinite(r.temp_anomaly_c)&&Number.isFinite(r.precip_pct_normal)); if(!a.length){el.innerHTML='<p class="method">Sem períodos concluídos suficientes.</p>';return;}
  const W=900,H=480,m={l:72,r:32,t:36,b:62},iw=W-m.l-m.r,ih=H-m.t-m.b;
  let xmin=Math.min(80,...a.map(r=>r.precip_pct_normal)),xmax=Math.max(120,...a.map(r=>r.precip_pct_normal)),ymin=Math.min(-1,...a.map(r=>r.temp_anomaly_c)),ymax=Math.max(1,...a.map(r=>r.temp_anomaly_c));
  const xp=(xmax-xmin)*.12,yp=(ymax-ymin)*.15;xmin=Math.max(0,xmin-xp);xmax+=xp;ymin-=yp;ymax+=yp;
  const x=v=>m.l+(v-xmin)/(xmax-xmin)*iw,y=v=>m.t+(ymax-v)/(ymax-ymin)*ih,svg=se('svg',{viewBox:`0 0 ${W} ${H}`});
  for(let i=0;i<=5;i++){const xv=xmin+(xmax-xmin)*i/5,xx=x(xv);svg.append(se('line',{x1:xx,y1:m.t,x2:xx,y2:H-m.b,stroke:'#e6ebef'}));svg.append(se('text',{x:xx,y:H-32,'text-anchor':'middle','font-size':11,fill:'#64727d'},`${n(xv,0)}%`));const yv=ymin+(ymax-ymin)*i/5,yy=y(yv);svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e6ebef'}));svg.append(se('text',{x:m.l-9,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},`${n(yv,1)}°`));}
  if(100>=xmin&&100<=xmax)svg.append(se('line',{x1:x(100),y1:m.t,x2:x(100),y2:H-m.b,stroke:'#788994','stroke-width':1.5})); if(0>=ymin&&0<=ymax)svg.append(se('line',{x1:m.l,y1:y(0),x2:W-m.r,y2:y(0),stroke:'#788994','stroke-width':1.5}));
  svg.append(se('text',{x:m.l+5,y:m.t+16,'font-size':12,fill:'#b2762d'},'Mais seco'));svg.append(se('text',{x:W-m.r-5,y:m.t+16,'text-anchor':'end','font-size':12,fill:'#176b87'},'Mais chuvoso'));svg.append(se('text',{x:m.l+5,y:m.t+34,'font-size':12,fill:'#c85b32'},'Mais quente ↑'));svg.append(se('text',{x:m.l+5,y:H-m.b-8,'font-size':12,fill:'#4777a8'},'Mais frio ↓'));
  a.forEach(r=>{const reliable=r.coverage_pct>=99.9,c=se('circle',{cx:x(r.precip_pct_normal),cy:y(r.temp_anomaly_c),r:reliable?9:7,fill:reliable?'#176b87':'#fff',stroke:'#176b87','stroke-width':reliable?1:3});c.append(se('title',{},`${r.label}\nAnomalia T média: ${sign(r.temp_anomaly_c)}${n(r.temp_anomaly_c,2)} °C\nPrecipitação: ${n(r.precip_pct_normal,1)}% da normal\nCobertura: ${n(r.coverage_pct,1)}%`));svg.append(c);svg.append(se('text',{x:x(r.precip_pct_normal)+11,y:y(r.temp_anomaly_c)+4,'font-size':11,fill:'#24313a'},r.label));});
  svg.append(se('text',{x:W/2,y:H-7,'text-anchor':'middle','font-size':12,fill:'#64727d'},'Precipitação em relação à normal 1991–2020'));svg.append(se('text',{transform:`translate(17 ${H/2}) rotate(-90)`,'text-anchor':'middle','font-size':12,fill:'#64727d'},'Anomalia da temperatura média (°C)'));el.append(svg);
}
function metrics(r,title){
  const o=r?.observed||{},nn=r?.normal_1991_2020_same_period||{},a=r?.anomaly||{};
  const rows=[['Tmax média',`${n(o.tmax_mean_c,2)} °C`,`${n(nn.tmax_mean_c,2)} °C`,`${sign(a.tmax_c)}${n(a.tmax_c,2)} °C`],['Temperatura média',`${n(o.tmean_c,2)} °C`,`${n(nn.tmean_c,2)} °C`,`${sign(a.tmean_c)}${n(a.tmean_c,2)} °C`],['Tmin média',`${n(o.tmin_mean_c,2)} °C`,`${n(nn.tmin_mean_c,2)} °C`,`${sign(a.tmin_c)}${n(a.tmin_c,2)} °C`],['Precipitação',`${n(o.precip_mm,1)} mm`,`${n(nn.precip_mm,1)} mm`,`${n(a.precip_pct_normal,1)}%`],['Dias ≥1 mm',n(o.rain_days,0),n(nn.rain_days,1),''],['Dias >35 °C',n(o.tmax_gt_35,0),n(nn.tmax_gt_35,1),''],['Noites tropicais',n(o.tropical_nights,0),n(nn.tropical_nights,1),''],['Dias de geada',n(o.frost_days,0),n(nn.frost_days,1),'']];
  return `<div class="panel"><h2>${title}</h2><p class="method">Observado · normal 1991–2020 para o mesmo período · desvio/relação</p>${rows.map((x,i)=>`<div class="metric-row"><b>${x[0]}</b><span class="num">${x[1]}</span><span class="num hide-mobile">${x[2]}</span><span class="num ${i<3?(Number([a.tmax_c,a.tmean_c,a.tmin_c][i])>=0?'pos':'neg'):''}">${x[3]}</span></div>`).join('')}</div>`;
}
function table(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i===0?' class="left"':''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function waveTable(a,confirmed=true){
  if(!a.length)return '<p>Sem episódios.</p>';
  return table(['Início','Fim','Dias','Anomalia média',confirmed?'Excesso acumulado':'Faltaram'],a.slice().reverse().map(x=>[dpt(x.start),dpt(x.end),x.days,`${sign(x.mean_departure_c)}${n(x.mean_departure_c,2)} °C`,confirmed?`${n(x.cumulative_margin_beyond_threshold_c,1)} °C`:`${x.days_needed_for_confirmation} dia${x.days_needed_for_confirmation===1?'':'s'}`]));
}
function rankingTable(a,unit){ if(!a?.length)return '<p>Sem dados suficientes.</p>'; return table(['#','Período','Valor','Cobertura'],a.slice(0,10).map((x,i)=>[i+1,x.label,`${n(x.value,unit==='°C'?2:1)} ${unit}`,`${n(x.coverage_pct,1)}%`])); }

async function init(){
  tabs();
  const names=['climate_summary.json','climate_monthly.json','climate_hydrological.json','climate_quadrants.json','climate_waves.json','climate_extremes.json','climate_daily.json','climate_station.json','climate_indices.json','climate_records.json','climate_rankings.json'];
  const [s,m,h,q,w,e,d,st,ind,rec,ranks]=await Promise.all(names.map(f=>fetch(f).then(r=>r.json())));
  $('#generated').textContent=`Atualizado ${new Date(s.generated_utc).toLocaleString('pt-PT')} · último dia fechado ${dpt(s.source_last_closed_day)}`;
  const y=s.current_year,cm=s.current_month,hy=s.current_hydrological_year,live=s.live;

  $('#hero').innerHTML=`
    <div class="card"><span>Mês atual · ${cm.month_name}</span><b>${sign(cm.anomaly?.tmean_c)}${n(cm.anomaly?.tmean_c,2)} °C</b><small>anomalia T média vs 1991–2020</small></div>
    <div class="card"><span>Precipitação no mês</span><b>${n(cm.observed?.precip_mm,1)} mm</b><small>${n(cm.anomaly?.precip_pct_normal,0)}% da normal até à data</small></div>
    <div class="card ${s.heatwave.active?'wave-active':''}"><span>Onda de calor</span><b>${s.heatwave.active?'Ativa':'Não ativa'}</b><small>${s.heatwave.qualifying_streak_days} dias qualificativos</small></div>
    <div class="card ${s.coldwave.active?'wave-cold':''}"><span>Onda de frio</span><b>${s.coldwave.active?'Ativa':'Não ativa'}</b><small>${s.coldwave.qualifying_streak_days} dias qualificativos</small></div>`;

  $('#civil').innerHTML=metrics(y,`Ano civil ${y.year} — até ${dpt(y.end)}`);
  $('#hydro').innerHTML=`<div class="panel"><h2>Ano hidrológico ${hy.hydrological_year}</h2><p class="method">1 outubro–30 setembro · até ${dpt(hy.end)}</p><div class="cards compact"><div class="card"><span>Acumulado</span><b>${n(hy.observed?.precip_mm,1)} mm</b></div><div class="card"><span>Normal até à data</span><b>${n(hy.normal_1991_2020_same_period?.precip_mm,1)} mm</b></div><div class="card"><span>% da normal</span><b>${n(hy.anomaly?.precip_pct_normal,0)}%</b></div><div class="card"><span>Cobertura</span><b>${n(hy.coverage_pct,1)}%</b><small>${hy.missing_day_count} dias em falta</small></div></div></div>`;

  const sr=s.current_month_station_reference_prior_years||{}, so=sr.observed_average||{}, oo=cm.observed||{}, on=cm.normal_1991_2020_same_period||{};
  $('#current-month-references').innerHTML=table(['Indicador',`${cm.month_name} ${y.year} até ${dpt(cm.end)}`,'Normal 1991–2020','Estação — mesmos dias anteriores'],[
    ['Tmax média',`${n(oo.tmax_mean_c,2)} °C`,`${n(on.tmax_mean_c,2)} °C`,`${n(so.tmax_mean_c,2)} °C`],
    ['T média',`${n(oo.tmean_c,2)} °C`,`${n(on.tmean_c,2)} °C`,`${n(so.tmean_c,2)} °C`],
    ['Tmin média',`${n(oo.tmin_mean_c,2)} °C`,`${n(on.tmin_mean_c,2)} °C`,`${n(so.tmin_mean_c,2)} °C`],
    ['Precipitação',`${n(oo.precip_mm,1)} mm`,`${n(on.precip_mm,1)} mm`,`${n(so.precip_mm,1)} mm`],
    ['Amostra','','',sr.sample_count?`${sr.sample_count} anos: ${sr.years_used.join(', ')}`:'sem período anterior completo']
  ]);

  const cur=m.months.filter(r=>r.year===y.year);
  bars($('#temp-anom-chart'),cur.map(r=>({label:ms[r.month],v:r.anomaly?.tmean_c??0,tooltip:`${r.month_name} ${r.year}`})),'v',{s:' °C'});
  bars($('#rain-pct-chart'),cur.map(r=>({label:ms[r.month],v:r.anomaly?.precip_pct_normal??0,tooltip:`${r.month_name} ${r.year}`})),'v',{s:'%',d:0,pos:'#2d7b8a',neg:'#b98233'});
  const hp=hy.cumulative_points||[];lines($('#hydro-chart'),[{label:'Observado',data:hp.map(p=>({label:p.month_name,value:p.observed_cumulative_mm}))},{label:'Normal 1991–2020',data:hp.map(p=>({label:p.month_name,value:p.normal_cumulative_mm}))}]);

  const md=d.days.filter(x=>x.date.slice(0,7)===s.source_last_closed_day.slice(0,7));
  bars($('#daily-temp-chart'),md.map(x=>({label:String(Number(x.date.slice(8,10))),v:Number((x.tmean_c-x.normal_tmean_c).toFixed(2)),tooltip:`${dpt(x.date)} · T média ${n(x.tmean_c,1)} °C · normal ${n(x.normal_tmean_c,2)} °C`})),'v',{s:' °C'});
  $('#extreme-cards').innerHTML=`<div class="card"><span>Tmax absoluta da série</span><b>${n(e.all_time.tmax_absolute.value_c,1)} °C</b><small>${dpt(e.all_time.tmax_absolute.date)}</small></div><div class="card"><span>Tmin absoluta da série</span><b>${n(e.all_time.tmin_absolute.value_c,1)} °C</b><small>${dpt(e.all_time.tmin_absolute.date)}</small></div><div class="card"><span>Maior precipitação diária</span><b>${n(e.all_time.max_daily_precip.value_mm,1)} mm</b><small>${dpt(e.all_time.max_daily_precip.date)}</small></div><div class="card"><span>Máximo em 5 dias</span><b>${n(e.all_time.rolling_precip['5']?.precip_mm,1)} mm</b><small>${dpt(e.all_time.rolling_precip['5']?.start)} → ${dpt(e.all_time.rolling_precip['5']?.end)}</small></div>`;

  const stationRows=Object.values(st.months);
  $('#station-temperature-table').innerHTML=table(['Mês','Anos usados','Tmax estação','T média estação','Tmin estação','T média 1991–2020','Dif.'],stationRows.map(x=>[x.month_name,x.years_used.join(', ')||'—',`${n(x.station?.tmax_mean_c,2)} °C`,`${n(x.station?.tmean_c,2)} °C`,`${n(x.station?.tmin_mean_c,2)} °C`,`${n(x.official_normal_1991_2020?.tmean_c,2)} °C`,`${sign(x.difference_station_vs_1991_2020?.tmean_c)}${n(x.difference_station_vs_1991_2020?.tmean_c,2)} °C`]));

  const roll=y.rolling_precip_max||{}; $('#rolling').innerHTML=Object.keys(roll).map(k=>`<div><span>${k} dia${k==='1'?'':'s'}</span><b>${n(roll[k]?.precip_mm,1)} mm</b><small>${dpt(roll[k]?.start)} → ${dpt(roll[k]?.end)}</small></div>`).join('');
  $('#rain-month-table').innerHTML=table(['Mês','Observado','Normal comparável','% normal','Dias ≥1','>10','>20','>30'],cur.map(r=>[r.month_name,`${n(r.observed?.precip_mm,1)} mm`,`${n(r.normal_1991_2020_same_period?.precip_mm,1)} mm`,`${n(r.anomaly?.precip_pct_normal,0)}%`,n(r.observed?.rain_days,0),n(r.observed?.rain_gt_10,0),n(r.observed?.rain_gt_20,0),n(r.observed?.rain_gt_30,0)]));
  $('#station-rain-table').innerHTML=table(['Mês','Amostra','Chuva média estação','Normal 1991–2020','% normal','Dias chuva estação'],stationRows.map(x=>[x.month_name,`${x.sample_count} ano${x.sample_count===1?'':'s'}`,`${n(x.station?.precip_mm,1)} mm`,`${n(x.official_normal_1991_2020?.precip_mm,1)} mm`,`${n(x.difference_station_vs_1991_2020?.precip_pct_normal,0)}%`,n(x.station?.rain_days,1)]));

  $('#heatwaves').innerHTML=waveTable(w.heatwaves,true); $('#coldwaves').innerHTML=waveTable(w.coldwaves,true); $('#near-heat').innerHTML=waveTable(w.subcritical_heat||[],false); $('#near-cold').innerHTML=waveTable(w.subcritical_cold||[],false);

  const iy=ind.annual.find(x=>x.label===String(y.year))?.observed||{};
  $('#index-cards').innerHTML=`<div class="card"><span>Noites tropicais</span><b>${n(iy.tropical_nights,0)}</b><small>Tmin ≥20 °C</small></div><div class="card"><span>Dias de geada</span><b>${n(iy.frost_days,0)}</b><small>Tmin &lt;0 °C</small></div><div class="card"><span>Dias ≥30 °C</span><b>${n(iy.tmax_ge_30,0)}</b></div><div class="card"><span>Dias &gt;35 °C</span><b>${n(iy.tmax_gt_35,0)}</b></div>`;
  $('#indices-table').innerHTML=table(['Ano','Cobertura','≥25 °C','≥30 °C','>35 °C','≥40 °C','Noites tropicais','Geadas','Dias ≥1 mm'],ind.annual.map(r=>[r.label,`${n(r.coverage_pct,1)}%`,n(r.observed.tmax_ge_25,0),n(r.observed.tmax_ge_30,0),n(r.observed.tmax_gt_35,0),n(r.observed.tmax_ge_40,0),n(r.observed.tropical_nights,0),n(r.observed.frost_days,0),n(r.observed.rain_days,0)]));

  // Quadrant selectors: detail is populated only when the main type changes.
  const qt=$('#q-type'), qd=$('#q-detail'), qdl=$('#q-detail-label');
  function populateQuadrantDetail(){
    const previous=qd.value; qd.innerHTML='';
    if(qt.value==='annual'){qdl.classList.add('hidden'); return;}
    qdl.classList.remove('hidden');
    if(qt.value==='seasonal') Object.entries({winter:'Inverno',spring:'Primavera',summer:'Verão',autumn:'Outono'}).forEach(([v,l])=>qd.add(new Option(l,v)));
    else for(let i=1;i<=12;i++)qd.add(new Option(ml[i],String(i)));
    if([...qd.options].some(o=>o.value===previous)) qd.value=previous;
  }
  function renderQuadrant(){ if(qt.value==='annual')scatter($('#quadrant-chart'),q.annual); else if(qt.value==='seasonal')scatter($('#quadrant-chart'),q.seasonal[qd.value]||[]); else scatter($('#quadrant-chart'),q.monthly[qd.value]||[]); }
  qt.addEventListener('change',()=>{populateQuadrantDetail();renderQuadrant();}); qd.addEventListener('change',renderQuadrant); populateQuadrantDetail(); renderQuadrant();

  $('#station-climate-table').innerHTML=table(['Mês','N','Anos','T média estação','Normal 1991–2020','Dif. térmica','Chuva estação','Chuva normal','%'],stationRows.map(x=>[x.month_name,x.sample_count,x.years_used.join(', ')||'—',`${n(x.station?.tmean_c,2)} °C`,`${n(x.official_normal_1991_2020?.tmean_c,2)} °C`,`${sign(x.difference_station_vs_1991_2020?.tmean_c)}${n(x.difference_station_vs_1991_2020?.tmean_c,2)} °C`,`${n(x.station?.precip_mm,1)} mm`,`${n(x.official_normal_1991_2020?.precip_mm,1)} mm`,`${n(x.difference_station_vs_1991_2020?.precip_pct_normal,0)}%`]));

  $('#record-cards').innerHTML=`<div class="card"><span>Tmax absoluta</span><b>${n(rec.series?.tmax_absolute?.value_c,1)} °C</b><small>${dpt(rec.series?.tmax_absolute?.date)}</small></div><div class="card"><span>Tmin absoluta</span><b>${n(rec.series?.tmin_absolute?.value_c,1)} °C</b><small>${dpt(rec.series?.tmin_absolute?.date)}</small></div><div class="card"><span>Chuva diária máxima</span><b>${n(rec.series?.max_daily_precip?.value_mm,1)} mm</b><small>${dpt(rec.series?.max_daily_precip?.date)}</small></div><div class="card"><span>Onda de calor mais longa</span><b>${n(rec.waves?.longest_heatwave?.days,0)} dias</b><small>${dpt(rec.waves?.longest_heatwave?.start)} → ${dpt(rec.waves?.longest_heatwave?.end)}</small></div>`;
  const rm=$('#record-month'); for(let i=1;i<=12;i++)rm.add(new Option(ml[i],String(i))); rm.value=String(new Date(s.source_last_closed_day+'T12:00:00').getMonth()+1);
  function renderRecordMonth(){const x=rec.by_calendar_month[rm.value]||{};$('#record-month-detail').innerHTML=table(['Recorde','Valor','Data/ano'],[['Tmax absoluta',`${n(x.tmax_absolute?.value_c,1)} °C`,dpt(x.tmax_absolute?.date)],['Tmin absoluta',`${n(x.tmin_absolute?.value_c,1)} °C`,dpt(x.tmin_absolute?.date)],['Precipitação diária máxima',`${n(x.max_daily_precip?.value_mm,1)} mm`,dpt(x.max_daily_precip?.date)],['Mês com T média mais alta',`${n(x.warmest_month_mean?.value_c,2)} °C`,x.warmest_month_mean?.year??'—'],['Mês com T média mais baixa',`${n(x.coldest_month_mean?.value_c,2)} °C`,x.coldest_month_mean?.year??'—'],['Mês mais chuvoso',`${n(x.wettest_month?.value_mm,1)} mm`,x.wettest_month?.year??'—'],['Mês mais seco',`${n(x.driest_month?.value_mm,1)} mm`,x.driest_month?.year??'—']]);}
  rm.addEventListener('change',renderRecordMonth); renderRecordMonth();
  $('#rank-warm').innerHTML=rankingTable(ranks.monthly_global?.warmest_tmean,'°C'); $('#rank-wet').innerHTML=rankingTable(ranks.monthly_global?.wettest,'mm');

  $('#quality').innerHTML=`<div><span>Dias válidos</span><b>${s.quality.valid_days}</b></div><div><span>Dias em falta</span><b>${s.quality.missing_day_count}</b></div><div><span>Linhas inválidas</span><b>${s.quality.invalid_row_count}</b></div>`;
  $('#live-note').textContent=live&&!live.error?`Hoje (provisório): Tmin ${n(live.tmin,1)} °C · Tmax ${n(live.tmax,1)} °C · T média ${n(live.tmean,1)} °C · precipitação ${n(live.rain,1)} mm.`:'Dados live indisponíveis nesta atualização.';
}
init().catch(err=>{console.error(err);document.body.insertAdjacentHTML('beforeend',`<pre class="fatal">${String(err)}</pre>`);});
