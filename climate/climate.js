const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const n = (v,d=1) => v===null || v===undefined || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const sign = v => Number(v)>0 ? '+' : '';
const dpt = s => s ? new Date(s+'T12:00:00').toLocaleDateString('pt-PT') : '—';
const ms = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ml = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const cssv = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();

let tip;
function ensureTooltip(){
  if(tip)return tip;
  tip=document.createElement('div'); tip.className='chart-tooltip'; document.body.appendChild(tip); return tip;
}
function showTip(ev,html){
  const t=ensureTooltip(); t.innerHTML=html; t.style.display='block';
  const pad=14, w=t.offsetWidth, h=t.offsetHeight;
  let x=ev.clientX+16,y=ev.clientY+16;
  if(x+w>innerWidth-pad)x=ev.clientX-w-16;
  if(y+h>innerHeight-pad)y=ev.clientY-h-16;
  t.style.left=x+'px';t.style.top=y+'px';
}
function hideTip(){if(tip)tip.style.display='none';}

function tabs(){
  $$('.tab').forEach(b=>b.addEventListener('click',()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    $$('.section').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); $('#'+b.dataset.target).classList.add('active');
    history.replaceState(null,'','#'+b.dataset.target);
  }));
  const h=location.hash.slice(1); if(h && $('#'+h)){ const b=$(`.tab[data-target="${h}"]`); if(b)b.click(); }
}
function se(tag,a={},t=''){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));if(t)e.textContent=t;return e}
function clear(e){while(e.firstChild)e.removeChild(e.firstChild)}
function table(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i===0?' class="left"':''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function waveTable(a,confirmed=true){
  if(!a.length)return '<p>Sem episódios.</p>';
  return table(['Início','Fim','Dias','Anomalia média',confirmed?'Excesso acumulado':'Faltaram'],a.slice().reverse().map(x=>[dpt(x.start),dpt(x.end),x.days,`${sign(x.mean_departure_c)}${n(x.mean_departure_c,2)} °C`,confirmed?`${n(x.cumulative_margin_beyond_threshold_c,1)} °C`:`${x.days_needed_for_confirmation} dia${x.days_needed_for_confirmation===1?'':'s'}`]));
}
function rankingTable(a,unit){if(!a?.length)return '<p>Sem dados suficientes.</p>';return table(['#','Período','Valor','Cobertura'],a.slice(0,10).map((x,i)=>[i+1,x.label,`${n(x.value,unit==='°C'?2:1)} ${unit}`,`${n(x.coverage_pct,1)}%`]))}

function palette(i){
  return [cssv('--accent'),cssv('--dry'),cssv('--cold'),cssv('--warm'),cssv('--wet'),'#777'][i%6];
}
function renderLegend(host,series,rerender){
  const leg=document.createElement('div');leg.className='chart-legend';
  series.forEach((s,i)=>{
    const b=document.createElement('button');b.type='button';b.className='legend-btn'+(s.visible===false?' off':'');
    const sw=document.createElement('span');sw.className='legend-swatch';sw.style.background=s.color||palette(i);
    b.append(sw,document.createTextNode(s.label));b.addEventListener('click',()=>{s.visible=s.visible===false?true:false;b.classList.toggle('off',s.visible===false);rerender()});leg.append(b);
  });host.append(leg);
}

function interactiveLineChart(el,series,opt={}){
  clear(el);
  const valid=series.some(s=>s.data?.some(p=>Number.isFinite(Number(p.value))));
  if(!valid){el.innerHTML='<div class="chart-empty">Sem dados suficientes.</div>';return;}
  series.forEach((s,i)=>{if(!s.color)s.color=palette(i);if(s.visible===undefined)s.visible=true});
  const stateSeries=series;
  const draw=()=>{
    clear(el);
    renderLegend(el,stateSeries,draw);
    const active=stateSeries.filter(s=>s.visible!==false);
    const values=active.flatMap(s=>s.data.map(p=>Number(p.value))).filter(Number.isFinite);
    if(!values.length){el.insertAdjacentHTML('beforeend','<div class="chart-empty">Ative pelo menos uma série.</div>');return;}
    const W=960,H=390,m={l:64,r:25,t:18,b:55},iw=W-m.l-m.r,ih=H-m.t-m.b;
    let ymin=opt.zeroMin?0:Math.min(...values), ymax=Math.max(...values);
    if(opt.symmetric){const a=Math.max(Math.abs(ymin),Math.abs(ymax));ymin=-a;ymax=a}
    let span=(ymax-ymin)||1; ymin-=opt.zeroMin?0:span*.08; ymax+=span*.08; span=ymax-ymin||1;
    const count=Math.max(...active.map(s=>s.data.length));
    const x=i=>m.l+(count<=1?iw/2:i*iw/(count-1)), y=v=>m.t+(ymax-v)/span*ih;
    const wrap=document.createElement('div');wrap.style.position='relative';
    const svg=se('svg',{viewBox:`0 0 ${W} ${H}`,'aria-label':opt.aria||'Gráfico interativo'});
    for(let i=0;i<=5;i++){
      const v=ymin+span*i/5,yy=y(v);
      svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e3e9ed'}));
      svg.append(se('text',{x:m.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},`${n(v,opt.decimals??1)}${opt.unit||''}`));
    }
    const labels=active[0].data;
    const step=Math.max(1,Math.ceil(count/12));
    labels.forEach((p,i)=>{if(i%step===0||i===count-1)svg.append(se('text',{x:x(i),y:H-24,'text-anchor':'middle','font-size':11,fill:'#64727d'},p.label))});
    if(ymin<0&&ymax>0)svg.append(se('line',{x1:m.l,y1:y(0),x2:W-m.r,y2:y(0),stroke:'#9aa7b0','stroke-width':1.2}));

    active.forEach((s,si)=>{
      const pts=s.data.map((p,i)=>Number.isFinite(Number(p.value))?`${x(i)},${y(Number(p.value))}`:null);
      let segment=[];
      const flush=()=>{if(segment.length>1)svg.append(se('polyline',{points:segment.join(' '),fill:'none',stroke:s.color,'stroke-width':s.width||2.6,'stroke-dasharray':s.dash||'',opacity:s.opacity||1}));segment=[]};
      pts.forEach(p=>{if(p)segment.push(p);else flush()});flush();
      s.data.forEach((p,i)=>{if(!Number.isFinite(Number(p.value)))return;svg.append(se('circle',{cx:x(i),cy:y(Number(p.value)),r:s.pointRadius??2.7,fill:s.color,opacity:s.opacity||1}))});
    });

    const cross=se('line',{x1:m.l,y1:m.t,x2:m.l,y2:H-m.b,stroke:'#7a8994','stroke-width':1,'stroke-dasharray':'3 3',visibility:'hidden'});svg.append(cross);
    const focus=active.map(s=>{const c=se('circle',{r:5,fill:'#fff',stroke:s.color,'stroke-width':2,visibility:'hidden'});svg.append(c);return c});
    const overlay=se('rect',{x:m.l,y:m.t,width:iw,height:ih,fill:'transparent',style:'cursor:crosshair'});svg.append(overlay);
    overlay.addEventListener('mousemove',ev=>{
      const rect=svg.getBoundingClientRect(),px=(ev.clientX-rect.left)/rect.width*W;
      let idx=Math.round((px-m.l)/iw*(count-1));idx=Math.max(0,Math.min(count-1,idx));
      const xx=x(idx);cross.setAttribute('x1',xx);cross.setAttribute('x2',xx);cross.setAttribute('visibility','visible');
      let rows='', title=labels[idx]?.tooltipTitle||labels[idx]?.label||'';
      active.forEach((s,j)=>{
        const p=s.data[idx],val=Number(p?.value);
        if(Number.isFinite(val)){focus[j].setAttribute('cx',xx);focus[j].setAttribute('cy',y(val));focus[j].setAttribute('visibility','visible');rows+=`<div class="tip-row"><span>${s.label}</span><strong>${n(val,s.decimals??opt.decimals??1)}${s.unit??opt.unit??''}</strong></div>`}
        else focus[j].setAttribute('visibility','hidden');
      });
      const note=opt.tooltipNote?`<div class="tip-note">${opt.tooltipNote(labels[idx],idx)||''}</div>`:'';
      showTip(ev,`<b>${title}</b>${rows}${note}`);
    });
    overlay.addEventListener('mouseleave',()=>{cross.setAttribute('visibility','hidden');focus.forEach(c=>c.setAttribute('visibility','hidden'));hideTip()});
    wrap.append(svg);el.append(wrap);
  };
  draw();
}

function interactiveGroupedBars(el,categories,series,opt={}){
  clear(el);
  series.forEach((s,i)=>{if(!s.color)s.color=palette(i);if(s.visible===undefined)s.visible=true});
  const draw=()=>{
    clear(el);renderLegend(el,series,draw);
    const active=series.filter(s=>s.visible!==false);
    const vals=active.flatMap(s=>s.data).filter(v=>Number.isFinite(Number(v))).map(Number);
    if(!vals.length){el.insertAdjacentHTML('beforeend','<div class="chart-empty">Sem dados.</div>');return}
    const W=960,H=390,m={l:65,r:25,t:20,b:55},iw=W-m.l-m.r,ih=H-m.t-m.b;
    const max=Math.max(...vals)*1.1||1,y=v=>m.t+(max-v)/max*ih,svg=se('svg',{viewBox:`0 0 ${W} ${H}`});
    for(let i=0;i<=5;i++){const v=max*i/5,yy=y(v);svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e3e9ed'}));svg.append(se('text',{x:m.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},`${n(v,opt.decimals??0)}${opt.unit||''}`))}
    const groupW=iw/categories.length,bw=Math.min(26,groupW*.72/Math.max(1,active.length));
    categories.forEach((cat,i)=>{
      const center=m.l+(i+.5)*groupW;svg.append(se('text',{x:center,y:H-24,'text-anchor':'middle','font-size':11,fill:'#64727d'},cat));
      active.forEach((s,j)=>{
        const val=Number(s.data[i]);if(!Number.isFinite(val))return;
        const x=center-(active.length*bw)/2+j*bw, yy=y(val), r=se('rect',{x,y:yy,width:bw-2,height:H-m.b-yy,rx:2,fill:s.color,opacity:.9,style:'cursor:pointer'});
        r.addEventListener('mousemove',ev=>showTip(ev,`<b>${cat}</b><div class="tip-row"><span>${s.label}</span><strong>${n(val,s.decimals??opt.decimals??1)}${s.unit??opt.unit??''}</strong></div>`));
        r.addEventListener('mouseleave',hideTip);svg.append(r);
      });
    });
    el.append(svg);
  };draw();
}

function scatter(el,rows){
  clear(el);const a=rows.filter(r=>Number.isFinite(r.temp_anomaly_c)&&Number.isFinite(r.precip_pct_normal));
  if(!a.length){el.innerHTML='<p class="method">Sem períodos concluídos suficientes.</p>';return}
  const W=960,H=500,m={l:74,r:34,t:38,b:64},iw=W-m.l-m.r,ih=H-m.t-m.b;
  let xmin=Math.min(80,...a.map(r=>r.precip_pct_normal)),xmax=Math.max(120,...a.map(r=>r.precip_pct_normal)),ymin=Math.min(-1,...a.map(r=>r.temp_anomaly_c)),ymax=Math.max(1,...a.map(r=>r.temp_anomaly_c));
  const xp=(xmax-xmin)*.12,yp=(ymax-ymin)*.15;xmin=Math.max(0,xmin-xp);xmax+=xp;ymin-=yp;ymax+=yp;
  const x=v=>m.l+(v-xmin)/(xmax-xmin)*iw,y=v=>m.t+(ymax-v)/(ymax-ymin)*ih,svg=se('svg',{viewBox:`0 0 ${W} ${H}`});
  for(let i=0;i<=5;i++){const xv=xmin+(xmax-xmin)*i/5,xx=x(xv);svg.append(se('line',{x1:xx,y1:m.t,x2:xx,y2:H-m.b,stroke:'#e6ebef'}));svg.append(se('text',{x:xx,y:H-32,'text-anchor':'middle','font-size':11,fill:'#64727d'},`${n(xv,0)}%`));const yv=ymin+(ymax-ymin)*i/5,yy=y(yv);svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e6ebef'}));svg.append(se('text',{x:m.l-9,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},`${n(yv,1)}°`))}
  if(100>=xmin&&100<=xmax)svg.append(se('line',{x1:x(100),y1:m.t,x2:x(100),y2:H-m.b,stroke:'#788994','stroke-width':1.5}));if(0>=ymin&&0<=ymax)svg.append(se('line',{x1:m.l,y1:y(0),x2:W-m.r,y2:y(0),stroke:'#788994','stroke-width':1.5}));
  svg.append(se('text',{x:m.l+5,y:m.t+16,'font-size':12,fill:'#b2762d'},'Mais seco'));svg.append(se('text',{x:W-m.r-5,y:m.t+16,'text-anchor':'end','font-size':12,fill:'#176b87'},'Mais chuvoso'));svg.append(se('text',{x:m.l+5,y:m.t+34,'font-size':12,fill:'#c85b32'},'Mais quente ↑'));svg.append(se('text',{x:m.l+5,y:H-m.b-8,'font-size':12,fill:'#4777a8'},'Mais frio ↓'));
  a.forEach(r=>{const reliable=r.coverage_pct>=99.9,c=se('circle',{cx:x(r.precip_pct_normal),cy:y(r.temp_anomaly_c),r:reliable?9:7,fill:reliable?cssv('--accent'):'#fff',stroke:cssv('--accent'),'stroke-width':reliable?1:3,style:'cursor:pointer'});c.addEventListener('mousemove',ev=>showTip(ev,`<b>${r.label}</b><div class="tip-row"><span>Anomalia T média</span><strong>${sign(r.temp_anomaly_c)}${n(r.temp_anomaly_c,2)} °C</strong></div><div class="tip-row"><span>Precipitação</span><strong>${n(r.precip_pct_normal,1)}% normal</strong></div><div class="tip-row"><span>Cobertura</span><strong>${n(r.coverage_pct,1)}%</strong></div>`));c.addEventListener('mouseleave',hideTip);svg.append(c);svg.append(se('text',{x:x(r.precip_pct_normal)+11,y:y(r.temp_anomaly_c)+4,'font-size':11,fill:'#24313a'},r.label))});
  svg.append(se('text',{x:W/2,y:H-7,'text-anchor':'middle','font-size':12,fill:'#64727d'},'Precipitação em relação à normal 1991–2020'));svg.append(se('text',{transform:`translate(17 ${H/2}) rotate(-90)`,'text-anchor':'middle','font-size':12,fill:'#64727d'},'Anomalia da temperatura média (°C)'));el.append(svg)
}

function stationDailyRef(allDays,targetYear,month,priorOnly=false){
  const target=allDays.filter(x=>Number(x.date.slice(0,4))===targetYear&&Number(x.date.slice(5,7))===month);
  return target.map(t=>{
    const md=t.date.slice(5),samples=allDays.filter(x=>x.date.slice(5)===md && (priorOnly?Number(x.date.slice(0,4))<targetYear:Number(x.date.slice(0,4))!==targetYear));
    const avg=k=>samples.length?samples.reduce((a,x)=>a+Number(x[k]),0)/samples.length:null;
    return {label:String(Number(t.date.slice(8,10))),date:t.date,tmax:avg('tmax_c'),tmean:avg('tmean_c'),tmin:avg('tmin_c'),rain:avg('precip_mm'),sample_count:samples.length};
  });
}
function yearDailyStationRef(allDays,targetYear,priorOnly=false){
  const target=allDays.filter(x=>Number(x.date.slice(0,4))===targetYear);
  return target.map(t=>{
    const md=t.date.slice(5),samples=allDays.filter(x=>x.date.slice(5)===md && (priorOnly?Number(x.date.slice(0,4))<targetYear:Number(x.date.slice(0,4))!==targetYear));
    const avg=k=>samples.length?samples.reduce((a,x)=>a+Number(x[k]),0)/samples.length:null;
    return {date:t.date,rain:avg('precip_mm'),sample_count:samples.length};
  });
}
function cumulative(arr,key){let total=0;return arr.map(x=>{const v=Number(x[key]);if(Number.isFinite(v))total+=v;return total})}

function annualComparison(r,stationRef,stationDiff){
  const o=r?.observed||{},nn=r?.normal_1991_2020_same_period||{},sr=stationRef?.observed_reference||{},a=r?.anomaly||{},sd=stationDiff||{};
  const rows=[
    ['Tmax média',`${n(o.tmax_mean_c,2)} °C`,`${n(nn.tmax_mean_c,2)} °C`,`${sign(a.tmax_c)}${n(a.tmax_c,2)} °C`,`${n(sr.tmax_mean_c,2)} °C`,`${sign(sd.tmax_c)}${n(sd.tmax_c,2)} °C`],
    ['Temperatura média',`${n(o.tmean_c,2)} °C`,`${n(nn.tmean_c,2)} °C`,`${sign(a.tmean_c)}${n(a.tmean_c,2)} °C`,`${n(sr.tmean_c,2)} °C`,`${sign(sd.tmean_c)}${n(sd.tmean_c,2)} °C`],
    ['Tmin média',`${n(o.tmin_mean_c,2)} °C`,`${n(nn.tmin_mean_c,2)} °C`,`${sign(a.tmin_c)}${n(a.tmin_c,2)} °C`,`${n(sr.tmin_mean_c,2)} °C`,`${sign(sd.tmin_c)}${n(sd.tmin_c,2)} °C`],
    ['Precipitação',`${n(o.precip_mm,1)} mm`,`${n(nn.precip_mm,1)} mm`,`${n(a.precip_pct_normal,1)}%`,`${n(sr.precip_mm,1)} mm`,`${n(sd.precip_pct_reference,1)}%`],
    ['Dias ≥1 mm',n(o.rain_days,0),n(nn.rain_days,1),`${sign(o.rain_days-nn.rain_days)}${n(o.rain_days-nn.rain_days,1)}`,n(sr.rain_days,1),`${sign(sd.rain_days)}${n(sd.rain_days,1)}`],
    ['Dias >35 °C',n(o.tmax_gt_35,0),n(nn.tmax_gt_35,1),`${sign(o.tmax_gt_35-nn.tmax_gt_35)}${n(o.tmax_gt_35-nn.tmax_gt_35,1)}`,n(sr.tmax_gt_35,1),`${sign(sd.tmax_gt_35)}${n(sd.tmax_gt_35,1)}`],
    ['Noites tropicais',n(o.tropical_nights,0),n(nn.tropical_nights,1),`${sign(o.tropical_nights-nn.tropical_nights)}${n(o.tropical_nights-nn.tropical_nights,1)}`,n(sr.tropical_nights,1),`${sign(sd.tropical_nights)}${n(sd.tropical_nights,1)}`],
    ['Dias de geada',n(o.frost_days,0),n(nn.frost_days,1),`${sign(o.frost_days-nn.frost_days)}${n(o.frost_days-nn.frost_days,1)}`,n(sr.frost_days,1),`${sign(sd.frost_days)}${n(sd.frost_days,1)}`]
  ];
  return `<div class="panel"><h2>Ano civil ${r.year} — até ${dpt(r.end)}</h2><p class="method">O valor observado é comparado separadamente com a normal 1991–2020 e com a referência dinâmica da própria estação para a mesma data.</p><div class="annual-compare">
    <div class="annual-row annual-head"><div>Indicador</div><div class="ref-cell">Observado</div><div class="ref-cell">Normal 1991–2020</div><div class="ref-cell station-col">Referência estação</div></div>
    ${rows.map(x=>`<div class="annual-row"><b>${x[0]}</b><div class="ref-cell"><strong>${x[1]}</strong></div><div class="ref-cell"><strong>${x[2]}</strong><small>${x[3]}</small></div><div class="ref-cell station-col"><strong>${x[4]}</strong><small>${x[5]}</small></div></div>`).join('')}
  </div><div class="station-ref-note">Referência da estação: ${stationRef?.sample_year_count??0} anos (${(stationRef?.sample_years||[]).join(', ')||'—'}); ${n(stationRef?.reference_coverage_pct,1)}% dos dias do período têm referência histórica.</div></div>`;
}

async function init(){
  tabs();
  const names=['climate_summary.json','climate_monthly.json','climate_hydrological.json','climate_quadrants.json','climate_waves.json','climate_extremes.json','climate_daily.json','climate_station.json','climate_indices.json','climate_records.json','climate_rankings.json','climate_annual.json'];
  const [s,m,h,q,w,e,d,st,ind,rec,ranks,annual]=await Promise.all(names.map(f=>fetch(f).then(r=>r.json())));
  $('#generated').textContent=`Atualizado ${new Date(s.generated_utc).toLocaleString('pt-PT')} · último dia fechado ${dpt(s.source_last_closed_day)}`;
  const y=s.current_year,cm=s.current_month,hy=s.current_hydrological_year,live=s.live;
  const stationY=s.current_year_station_reference_prior_years||{}, stationDiff=s.current_year_difference_vs_station_reference||{};

  $('#hero').innerHTML=`
    <div class="card"><span>Mês atual · ${cm.month_name}</span><b>${sign(cm.anomaly?.tmean_c)}${n(cm.anomaly?.tmean_c,2)} °C</b><small>anomalia T média vs 1991–2020</small></div>
    <div class="card"><span>Precipitação no mês</span><b>${n(cm.observed?.precip_mm,1)} mm</b><small>${n(cm.anomaly?.precip_pct_normal,0)}% da normal até à data</small></div>
    <div class="card ${s.heatwave.active?'wave-active':''}"><span>Onda de calor</span><b>${s.heatwave.active?'Ativa':'Não ativa'}</b><small>${s.heatwave.qualifying_streak_days} dias qualificativos</small></div>
    <div class="card ${s.coldwave.active?'wave-cold':''}"><span>Onda de frio</span><b>${s.coldwave.active?'Ativa':'Não ativa'}</b><small>${s.coldwave.qualifying_streak_days} dias qualificativos</small></div>`;

  $('#civil').innerHTML=annualComparison(y,stationY,stationDiff);
  $('#hydro').innerHTML=`<div class="panel"><h2>Ano hidrológico ${hy.hydrological_year}</h2><p class="method">1 outubro–30 setembro · até ${dpt(hy.end)}</p><div class="cards compact"><div class="card"><span>Acumulado</span><b>${n(hy.observed?.precip_mm,1)} mm</b></div><div class="card"><span>Normal até à data</span><b>${n(hy.normal_1991_2020_same_period?.precip_mm,1)} mm</b></div><div class="card"><span>% da normal</span><b>${n(hy.anomaly?.precip_pct_normal,0)}%</b></div><div class="card"><span>Cobertura</span><b>${n(hy.coverage_pct,1)}%</b><small>${hy.missing_day_count} dias em falta</small></div></div></div>`;

  const sr=s.current_month_station_reference_prior_years||{},so=sr.observed_average||{},oo=cm.observed||{},on=cm.normal_1991_2020_same_period||{};
  $('#current-month-references').innerHTML=table(['Indicador',`${cm.month_name} ${cm.year} até ${dpt(cm.end)}`,'Normal 1991–2020','Estação — mesmos dias anteriores'],[
    ['Tmax média',`${n(oo.tmax_mean_c,2)} °C`,`${n(on.tmax_mean_c,2)} °C`,`${n(so.tmax_mean_c,2)} °C`],
    ['T média',`${n(oo.tmean_c,2)} °C`,`${n(on.tmean_c,2)} °C`,`${n(so.tmean_c,2)} °C`],
    ['Tmin média',`${n(oo.tmin_mean_c,2)} °C`,`${n(on.tmin_mean_c,2)} °C`,`${n(so.tmin_mean_c,2)} °C`],
    ['Precipitação',`${n(oo.precip_mm,1)} mm`,`${n(on.precip_mm,1)} mm`,`${n(so.precip_mm,1)} mm`],
    ['Amostra','','',sr.sample_count?`${sr.sample_count} anos: ${sr.years_used.join(', ')}`:'Sem série completa suficiente']
  ]);

  const currentMonths=m.months.filter(r=>r.year===y.year);
  interactiveGroupedBars($('#temp-anom-chart'),currentMonths.map(r=>ms[r.month]),[{label:'Anomalia T média',data:currentMonths.map(r=>r.anomaly?.tmean_c),unit:' °C',decimals:2,color:cssv('--warm')}],{unit:' °C',decimals:1});
  interactiveGroupedBars($('#rain-pct-chart'),currentMonths.map(r=>ms[r.month]),[{label:'% da normal',data:currentMonths.map(r=>r.anomaly?.precip_pct_normal),unit:'%',decimals:0,color:cssv('--wet')}],{unit:'%',decimals:0});

  const hp=hy.cumulative_points||[];
  interactiveLineChart($('#hydro-chart'),[
    {label:'Observado',data:hp.map(p=>({label:p.month_name,value:p.observed_cumulative_mm,tooltipTitle:`${p.month_name} ${p.year}`})),unit:' mm',decimals:1,color:cssv('--accent')},
    {label:'Normal 1991–2020',data:hp.map(p=>({label:p.month_name,value:p.normal_cumulative_mm,tooltipTitle:`${p.month_name} ${p.year}`})),unit:' mm',decimals:1,color:cssv('--dry')}
  ],{unit:' mm',decimals:0,zeroMin:true});

  const stationRows=Object.values(st.months).sort((a,b)=>a.month-b.month);
  $('#station-temperature-table').innerHTML=table(['Mês','N','Tmax','T média','Tmin','Dif. T média vs normal'],stationRows.map(x=>[x.month_name,x.sample_count,`${n(x.station?.tmax_mean_c,2)} °C`,`${n(x.station?.tmean_c,2)} °C`,`${n(x.station?.tmin_mean_c,2)} °C`,`${sign(x.difference_station_vs_1991_2020?.tmean_c)}${n(x.difference_station_vs_1991_2020?.tmean_c,2)} °C`]));
  $('#station-rain-table').innerHTML=table(['Mês','N','Chuva média estação','Normal 1991–2020','% da normal','Anos usados'],stationRows.map(x=>[x.month_name,x.sample_count,`${n(x.station?.precip_mm,1)} mm`,`${n(x.official_normal_1991_2020?.precip_mm,1)} mm`,`${n(x.difference_station_vs_1991_2020?.precip_pct_normal,0)}%`,x.years_used.join(', ')||'—']));
  $('#station-climate-table').innerHTML=table(['Mês','N','Anos','T média estação','Normal 1991–2020','Dif. térmica','Chuva estação','Chuva normal','%'],stationRows.map(x=>[x.month_name,x.sample_count,x.years_used.join(', ')||'—',`${n(x.station?.tmean_c,2)} °C`,`${n(x.official_normal_1991_2020?.tmean_c,2)} °C`,`${sign(x.difference_station_vs_1991_2020?.tmean_c)}${n(x.difference_station_vs_1991_2020?.tmean_c,2)} °C`,`${n(x.station?.precip_mm,1)} mm`,`${n(x.official_normal_1991_2020?.precip_mm,1)} mm`,`${n(x.difference_station_vs_1991_2020?.precip_pct_normal,0)}%`]));

  // Interactive temperature controls.
  const years=[...new Set(d.days.map(x=>Number(x.date.slice(0,4))))].sort((a,b)=>a-b);
  const ty=$('#temp-year'),tm=$('#temp-month'),tv=$('#temp-variable');
  years.forEach(v=>ty.add(new Option(String(v),String(v)))); for(let i=1;i<=12;i++)tm.add(new Option(ml[i],String(i)));
  ty.value=String(y.year); tm.value=String(cm.month);
  function renderTemp(){
    const yy=Number(ty.value),mm=Number(tm.value),key=tv.value;
    const rows=d.days.filter(x=>Number(x.date.slice(0,4))===yy&&Number(x.date.slice(5,7))===mm);
    if(!rows.length){$('#temperature-interactive-chart').innerHTML='<div class="chart-empty">Sem dados para este mês.</div>';return}
    const refs=stationDailyRef(d.days,yy,mm,yy===y.year);
    const obsKey={tmax:'tmax_c',tmean:'tmean_c',tmin:'tmin_c'}[key],normKey={tmax:'normal_tmax_c',tmean:'normal_tmean_c',tmin:'normal_tmin_c'}[key];
    interactiveLineChart($('#temperature-interactive-chart'),[
      {label:'Observado',data:rows.map(r=>({label:String(Number(r.date.slice(8,10))),tooltipTitle:dpt(r.date),value:r[obsKey]})),unit:' °C',decimals:1,color:cssv('--accent'),width:3},
      {label:'Normal 1991–2020',data:rows.map(r=>({label:String(Number(r.date.slice(8,10))),tooltipTitle:dpt(r.date),value:r[normKey]})),unit:' °C',decimals:2,color:cssv('--dry'),dash:'7 5',pointRadius:0},
      {label:'Referência estação',data:refs.map(r=>({label:r.label,tooltipTitle:dpt(r.date),value:r[key]})),unit:' °C',decimals:2,color:cssv('--cold'),dash:'2 5',pointRadius:1.8}
    ],{unit:' °C',decimals:1,tooltipNote:(p,i)=>`Referência da estação calculada com outros anos disponíveis para este dia.`});

    const mrows=m.months.filter(r=>r.year===yy);
    const varField={tmax:'tmax_mean_c',tmean:'tmean_c',tmin:'tmin_mean_c'}[key];
    interactiveLineChart($('#temperature-monthly-chart'),[
      {label:'Observado',data:mrows.map(r=>({label:ms[r.month],tooltipTitle:`${ml[r.month]} ${yy}`,value:r.observed?.[varField]})),unit:' °C',decimals:2,color:cssv('--accent'),width:3},
      {label:'Normal 1991–2020',data:mrows.map(r=>({label:ms[r.month],tooltipTitle:`${ml[r.month]} ${yy}`,value:r.normal_1991_2020_same_period?.[varField]})),unit:' °C',decimals:2,color:cssv('--dry'),dash:'7 5',pointRadius:2},
      {label:'Climatologia estação',data:mrows.map(r=>({label:ms[r.month],tooltipTitle:`${ml[r.month]} ${yy}`,value:st.months[String(r.month)]?.station?.[varField]})),unit:' °C',decimals:2,color:cssv('--cold'),dash:'2 5',pointRadius:2}
    ],{unit:' °C',decimals:1});
  }
  ty.addEventListener('change',renderTemp);tm.addEventListener('change',renderTemp);tv.addEventListener('change',renderTemp);renderTemp();

  $('#extreme-cards').innerHTML=`<div class="card"><span>Tmax absoluta da série</span><b>${n(e.all_time.tmax_absolute.value_c,1)} °C</b><small>${dpt(e.all_time.tmax_absolute.date)}</small></div><div class="card"><span>Tmin absoluta da série</span><b>${n(e.all_time.tmin_absolute.value_c,1)} °C</b><small>${dpt(e.all_time.tmin_absolute.date)}</small></div><div class="card"><span>Maior precipitação diária</span><b>${n(e.all_time.max_daily_precip.value_mm,1)} mm</b><small>${dpt(e.all_time.max_daily_precip.date)}</small></div><div class="card"><span>Máximo em 5 dias</span><b>${n(e.all_time.rolling_precip['5']?.precip_mm,1)} mm</b><small>${dpt(e.all_time.rolling_precip['5']?.start)} → ${dpt(e.all_time.rolling_precip['5']?.end)}</small></div>`;

  // Interactive precipitation controls.
  const ry=$('#rain-year');years.forEach(v=>ry.add(new Option(String(v),String(v))));ry.value=String(y.year);
  function renderRain(){
    const yy=Number(ry.value), mrows=m.months.filter(r=>r.year===yy);
    const cats=mrows.map(r=>ms[r.month]);
    interactiveGroupedBars($('#rain-interactive-chart'),cats,[
      {label:'Observado',data:mrows.map(r=>r.observed?.precip_mm),unit:' mm',decimals:1,color:cssv('--accent')},
      {label:'Normal 1991–2020',data:mrows.map(r=>r.normal_1991_2020_same_period?.precip_mm),unit:' mm',decimals:1,color:cssv('--dry')},
      {label:'Climatologia estação',data:mrows.map(r=>st.months[String(r.month)]?.station?.precip_mm),unit:' mm',decimals:1,color:cssv('--cold')}
    ],{unit:' mm',decimals:0});

    const days=d.days.filter(x=>Number(x.date.slice(0,4))===yy);
    const refs=yearDailyStationRef(d.days,yy,yy===y.year);
    const obsCum=cumulative(days,'precip_mm'), normCum=cumulative(days,'normalDailyRain'), refCum=cumulative(refs,'rain');
    // climate_daily has no normal daily rain: derive uniform monthly share from monthly normal total.
    let nc=0; const normalSeries=days.map(x=>{const mm=Number(x.date.slice(5,7)),dim=new Date(yy,mm,0).getDate(),normal=st.months[String(mm)]?.official_normal_1991_2020?.precip_mm; if(Number.isFinite(Number(normal)))nc+=Number(normal)/dim;return nc});
    interactiveLineChart($('#rain-cumulative-chart'),[
      {label:'Observado',data:days.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:obsCum[i]})),unit:' mm',decimals:1,color:cssv('--accent'),width:3},
      {label:'Normal 1991–2020',data:days.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:normalSeries[i]})),unit:' mm',decimals:1,color:cssv('--dry'),dash:'7 5',pointRadius:0},
      {label:'Referência estação',data:days.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:refCum[i]})),unit:' mm',decimals:1,color:cssv('--cold'),dash:'2 5',pointRadius:0}
    ],{unit:' mm',decimals:0,zeroMin:true});

    const annualRow=annual.years.find(r=>r.year===yy);
    const roll=annualRow?.rolling_precip_max||{};
    $('#rolling').innerHTML=Object.keys(roll).map(k=>`<div><span>${k} dia${k==='1'?'':'s'}</span><b>${n(roll[k]?.precip_mm,1)} mm</b><small>${dpt(roll[k]?.start)} → ${dpt(roll[k]?.end)}</small></div>`).join('');
    $('#rain-month-table').innerHTML=table(['Mês','Observado','Normal comparável','% normal','Dias ≥1','>10','>20','>30'],mrows.map(r=>[r.month_name,`${n(r.observed?.precip_mm,1)} mm`,`${n(r.normal_1991_2020_same_period?.precip_mm,1)} mm`,`${n(r.anomaly?.precip_pct_normal,0)}%`,n(r.observed?.rain_days,0),n(r.observed?.rain_gt_10,0),n(r.observed?.rain_gt_20,0),n(r.observed?.rain_gt_30,0)]));
  }
  ry.addEventListener('change',renderRain);renderRain();

  $('#heatwaves').innerHTML=waveTable(w.heatwaves,true);$('#coldwaves').innerHTML=waveTable(w.coldwaves,true);
  $('#near-heat').innerHTML=waveTable(w.subcritical_heat,false);$('#near-cold').innerHTML=waveTable(w.subcritical_cold,false);

  const ci=ind.current_year?.observed||{};
  $('#index-cards').innerHTML=`<div class="card"><span>Dias ≥25 °C</span><b>${n(ci.tmax_ge_25,0)}</b></div><div class="card"><span>Dias ≥30 °C</span><b>${n(ci.tmax_ge_30,0)}</b></div><div class="card"><span>Dias >35 °C</span><b>${n(ci.tmax_gt_35,0)}</b></div><div class="card"><span>Dias ≥40 °C</span><b>${n(ci.tmax_ge_40,0)}</b></div>`;
  $('#indices-table').innerHTML=table(['Ano','Cobertura','≥25 °C','≥30 °C','>35 °C','≥40 °C','Noites tropicais','Geadas','Dias ≥1 mm'],ind.annual.map(r=>[r.label,`${n(r.coverage_pct,1)}%`,n(r.observed.tmax_ge_25,0),n(r.observed.tmax_ge_30,0),n(r.observed.tmax_gt_35,0),n(r.observed.tmax_ge_40,0),n(r.observed.tropical_nights,0),n(r.observed.frost_days,0),n(r.observed.rain_days,0)]));

  const qt=$('#q-type'),qd=$('#q-detail'),qdl=$('#q-detail-label');
  function populateQuadrantDetail(){const previous=qd.value;qd.innerHTML='';if(qt.value==='annual'){qdl.classList.add('hidden');return}qdl.classList.remove('hidden');if(qt.value==='seasonal')Object.entries({winter:'Inverno',spring:'Primavera',summer:'Verão',autumn:'Outono'}).forEach(([v,l])=>qd.add(new Option(l,v)));else for(let i=1;i<=12;i++)qd.add(new Option(ml[i],String(i)));if([...qd.options].some(o=>o.value===previous))qd.value=previous}
  function renderQuadrant(){if(qt.value==='annual')scatter($('#quadrant-chart'),q.annual);else if(qt.value==='seasonal')scatter($('#quadrant-chart'),q.seasonal[qd.value]||[]);else scatter($('#quadrant-chart'),q.monthly[qd.value]||[])}
  qt.addEventListener('change',()=>{populateQuadrantDetail();renderQuadrant()});qd.addEventListener('change',renderQuadrant);populateQuadrantDetail();renderQuadrant();

  $('#record-cards').innerHTML=`<div class="card"><span>Tmax absoluta</span><b>${n(rec.series?.tmax_absolute?.value_c,1)} °C</b><small>${dpt(rec.series?.tmax_absolute?.date)}</small></div><div class="card"><span>Tmin absoluta</span><b>${n(rec.series?.tmin_absolute?.value_c,1)} °C</b><small>${dpt(rec.series?.tmin_absolute?.date)}</small></div><div class="card"><span>Chuva diária máxima</span><b>${n(rec.series?.max_daily_precip?.value_mm,1)} mm</b><small>${dpt(rec.series?.max_daily_precip?.date)}</small></div><div class="card"><span>Onda de calor mais longa</span><b>${n(rec.waves?.longest_heatwave?.days,0)} dias</b><small>${dpt(rec.waves?.longest_heatwave?.start)} → ${dpt(rec.waves?.longest_heatwave?.end)}</small></div>`;
  const rm=$('#record-month');for(let i=1;i<=12;i++)rm.add(new Option(ml[i],String(i)));rm.value=String(cm.month);
  function renderRecordMonth(){const x=rec.by_calendar_month[rm.value]||{};$('#record-month-detail').innerHTML=table(['Recorde','Valor','Data/ano'],[['Tmax absoluta',`${n(x.tmax_absolute?.value_c,1)} °C`,dpt(x.tmax_absolute?.date)],['Tmin absoluta',`${n(x.tmin_absolute?.value_c,1)} °C`,dpt(x.tmin_absolute?.date)],['Precipitação diária máxima',`${n(x.max_daily_precip?.value_mm,1)} mm`,dpt(x.max_daily_precip?.date)],['Mês com T média mais alta',`${n(x.warmest_month_mean?.value_c,2)} °C`,x.warmest_month_mean?.year??'—'],['Mês com T média mais baixa',`${n(x.coldest_month_mean?.value_c,2)} °C`,x.coldest_month_mean?.year??'—'],['Mês mais chuvoso',`${n(x.wettest_month?.value_mm,1)} mm`,x.wettest_month?.year??'—'],['Mês mais seco',`${n(x.driest_month?.value_mm,1)} mm`,x.driest_month?.year??'—']])}
  rm.addEventListener('change',renderRecordMonth);renderRecordMonth();
  $('#rank-warm').innerHTML=rankingTable(ranks.monthly_global?.warmest_tmean,'°C');$('#rank-wet').innerHTML=rankingTable(ranks.monthly_global?.wettest,'mm');

  $('#quality').innerHTML=`<div><span>Dias válidos</span><b>${s.quality.valid_days}</b></div><div><span>Dias em falta</span><b>${s.quality.missing_day_count}</b></div><div><span>Linhas inválidas</span><b>${s.quality.invalid_row_count}</b></div>`;
  $('#live-note').textContent=live&&!live.error?`Hoje (provisório): Tmin ${n(live.tmin,1)} °C · Tmax ${n(live.tmax,1)} °C · T média ${n(live.tmean,1)} °C · precipitação ${n(live.rain,1)} mm.`:'Dados live indisponíveis nesta atualização.';
}
init().catch(err=>{console.error(err);document.body.insertAdjacentHTML('beforeend',`<pre class="fatal">${String(err)}</pre>`);});
