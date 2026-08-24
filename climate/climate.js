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
  a.forEach(r=>{const reliable=r.quality_ok===undefined?r.coverage_pct>=99.9:r.quality_ok,c=se('circle',{cx:x(r.precip_pct_normal),cy:y(r.temp_anomaly_c),r:reliable?9:7,fill:reliable?cssv('--accent'):'#fff',stroke:cssv('--accent'),'stroke-width':reliable?1:3,style:'cursor:pointer'});c.addEventListener('mousemove',ev=>showTip(ev,`<b>${r.label}</b><div class="tip-row"><span>Anomalia T média</span><strong>${sign(r.temp_anomaly_c)}${n(r.temp_anomaly_c,2)} °C</strong></div><div class="tip-row"><span>Precipitação</span><strong>${n(r.precip_pct_normal,1)}% normal</strong></div><div class="tip-row"><span>Cobertura</span><strong>${n(r.coverage_pct,1)}%</strong></div>`));c.addEventListener('mouseleave',hideTip);svg.append(c);svg.append(se('text',{x:x(r.precip_pct_normal)+11,y:y(r.temp_anomaly_c)+4,'font-size':11,fill:'#24313a'},r.label))});
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
    ['Dias com Tmin ≤ 0 °C',n(o.frost_days,0),n(nn.frost_days,1),`${sign(o.frost_days-nn.frost_days)}${n(o.frost_days-nn.frost_days,1)}`,n(sr.frost_days,1),`${sign(sd.frost_days)}${n(sd.frost_days,1)}`]
  ];
  return `<div class="panel"><h2>${r.year} — até ${dpt(r.end)}</h2><p class="method">O valor observado é comparado separadamente com a normal 1991–2020 e com a referência dinâmica da própria estação para a mesma data.</p><div class="annual-compare">
    <div class="annual-row annual-head"><div>Indicador</div><div class="ref-cell">Observado</div><div class="ref-cell">Normal 1991–2020</div><div class="ref-cell station-col">Referência estação</div></div>
    ${rows.map(x=>`<div class="annual-row"><b>${x[0]}</b><div class="ref-cell"><strong>${x[1]}</strong></div><div class="ref-cell"><strong>${x[2]}</strong><small>${x[3]}</small></div><div class="ref-cell station-col"><strong>${x[4]}</strong><small>${x[5]}</small></div></div>`).join('')}
  </div><div class="station-ref-note">Referência da estação: ${stationRef?.sample_year_count??0} anos (${(stationRef?.sample_years||[]).join(', ')||'—'}); ${n(stationRef?.reference_coverage_pct,1)}% dos dias do período têm referência histórica.</div></div>`;
}


function heatClass(kind,value,valid=true){
  if(!valid || value===null || value===undefined || !Number.isFinite(Number(value)))return 'hm-missing';
  const v=Number(value);
  if(kind==='temp'){
    if(v<=-2)return 'hm-cold3'; if(v<=-1)return 'hm-cold2'; if(v<-0.3)return 'hm-cold1';
    if(v<0.3)return 'hm-neutral'; if(v<1)return 'hm-hot1'; if(v<2)return 'hm-hot2'; return 'hm-hot3';
  }
  if(v<50)return 'hm-dry3'; if(v<80)return 'hm-dry2'; if(v<=120)return 'hm-rain-normal'; if(v<=160)return 'hm-wet2'; return 'hm-wet3';
}
function renderHeatmap(host,monthly,kind){
  const years=[...new Set(monthly.map(r=>r.year))].sort((a,b)=>a-b);
  let h='<div class="hm-grid"><div></div>'+ms.slice(1).map(x=>`<div class="hm-head">${x}</div>`).join('');
  years.forEach(y=>{
    h+=`<div class="hm-year">${y}</div>`;
    for(let m=1;m<=12;m++){
      const r=monthly.find(x=>x.year===y&&x.month===m);
      if(!r){h+='<div class="hm-cell hm-missing">—</div>';continue}
      const val=kind==='temp'?r.anomaly?.tmean_c:r.anomaly?.precip_pct_normal;
      const valid=kind==='temp'?r.temperature_month_valid:r.precipitation_month_valid;
      const cls=heatClass(kind,val,valid);
      const label=valid?(kind==='temp'?`${sign(val)}${n(val,1)}°`:`${n(val,0)}%`):'!';
      const title=kind==='temp'
        ? `${r.month_name} ${y} · T média ${n(r.observed?.tmean_c,2)} °C · anomalia ${sign(val)}${n(val,2)} °C · falhas ${r.missing_day_count}`
        : `${r.month_name} ${y} · precipitação ${n(r.observed?.precip_mm,1)} mm · ${n(val,0)}% da normal · falhas ${r.missing_day_count}${valid?'':' · total mensal excluído da climatologia da estação'}`;
      h+=`<div class="hm-cell ${cls}" title="${title.replaceAll('"','&quot;')}">${label}</div>`;
    }
  });
  h+='</div>';host.innerHTML=h;
}



function rankVisual(a,unit,limit=5){
  if(!a?.length)return '<p class="method">Sem dados suficientes.</p>';
  const rows=a.slice(0,limit),max=Math.max(...rows.map(x=>Number(x.value)||0),1);
  return `<div class="mini-rank">${rows.map((x,i)=>`<div class="rank-row"><b>${i+1}</b><div><div>${x.label}</div><div class="rank-bar"><span style="width:${Math.max(4,(Number(x.value)||0)/max*100)}%"></span></div></div><div class="rank-value">${n(x.value,unit==='°C'?2:1)} ${unit}</div></div>`).join('')}</div>`;
}
function annualBarChart(el,rows,metric,opt={}){
  clear(el); const filtered=rows.filter(r=>r.observed && Number.isFinite(Number(metric.value(r))));
  if(!filtered.length){el.innerHTML='<div class="chart-empty">Sem dados suficientes para esta combinação.</div>';return}
  const W=960,H=390,m={l:65,r:25,t:25,b:58},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const vals=filtered.map(r=>Number(metric.value(r))); let ymin=Math.min(0,...vals),ymax=Math.max(0,...vals);
  if(metric.symmetric){const a=Math.max(Math.abs(ymin),Math.abs(ymax),1);ymin=-a;ymax=a}else{ymax=ymax*1.12||1}
  const span=ymax-ymin||1,y=v=>m.t+(ymax-v)/span*ih,group=iw/filtered.length,bw=Math.min(82,group*.58),svg=se('svg',{viewBox:`0 0 ${W} ${H}`});
  for(let i=0;i<=5;i++){const v=ymin+span*i/5,yy=y(v);svg.append(se('line',{x1:m.l,y1:yy,x2:W-m.r,y2:yy,stroke:'#e3e9ed'}));svg.append(se('text',{x:m.l-8,y:yy+4,'text-anchor':'end','font-size':11,fill:'#64727d'},`${n(v,metric.decimals??1)}${metric.unit||''}`))}
  if(ymin<0&&ymax>0)svg.append(se('line',{x1:m.l,y1:y(0),x2:W-m.r,y2:y(0),stroke:'#8e9ca6','stroke-width':1.2}));
  filtered.forEach((r,i)=>{const v=Number(metric.value(r)),cx=m.l+(i+.5)*group,x=cx-bw/2,yy=Math.min(y(v),y(0)),hh=Math.max(2,Math.abs(y(v)-y(0))),quality=metric.quality?metric.quality(r):true;const rect=se('rect',{x,y:yy,width:bw,height:hh,rx:5,fill:quality?cssv('--accent'):'#fff',stroke:quality?cssv('--accent'):cssv('--dry'),'stroke-width':quality?1:3,style:'cursor:pointer'});rect.addEventListener('mousemove',ev=>{const normal=metric.normal?metric.normal(r):null;let rowsHtml=`<div class="tip-row"><span>${metric.label}</span><strong>${n(v,metric.decimals??1)}${metric.unit||''}</strong></div>`;if(normal!==null&&normal!==undefined&&Number.isFinite(Number(normal)))rowsHtml+=`<div class="tip-row"><span>Normal comparável</span><strong>${n(normal,metric.decimals??1)}${metric.unit||''}</strong></div>`;rowsHtml+=`<div class="tip-row"><span>Cobertura</span><strong>${n(r.coverage_pct,1)}%</strong></div><div class="tip-note">${quality?'Período válido para esta métrica.':'Período mostrado com ressalva de qualidade.'}</div>`;showTip(ev,`<b>${r.label||r.year}</b>${rowsHtml}`)});rect.addEventListener('mouseleave',hideTip);svg.append(rect);svg.append(se('text',{x:cx,y:H-27,'text-anchor':'middle','font-size':11,fill:'#64727d'},String(r.label||r.year)))});
  el.append(svg);const note=document.createElement('div');note.className='annual-bar-note';note.innerHTML='<span class="quality-chip">válido</span> &nbsp; <span class="quality-chip warn">com ressalva</span>';el.append(note);
}
function makeCivilCumulative(days,stationMonths,year){
  const refs=yearDailyStationRef(days,year,true),obsDays=days.filter(x=>Number(x.date.slice(0,4))===year),obsCum=cumulative(obsDays,'precip_mm'),refCum=cumulative(refs,'rain');let nc=0;const norm=obsDays.map(x=>{const mm=Number(x.date.slice(5,7)),dim=new Date(year,mm,0).getDate(),v=stationMonths[String(mm)]?.official_normal_1991_2020?.precip_mm;if(Number.isFinite(Number(v)))nc+=Number(v)/dim;return nc});return {obsDays,obsCum,refCum,norm};
}
function contextCard(label,value,normalLine,stationLine,cls=''){return `<div class="context-card ${cls}"><span>${label}</span><b>${value}</b><small>${normalLine}</small><small>${stationLine}</small></div>`}

async function init(){
  tabs();
  const names=['climate_summary.json','climate_monthly.json','climate_hydrological.json','climate_quadrants.json','climate_waves.json','climate_extremes.json','climate_daily.json','climate_station.json','climate_indices.json','climate_records.json','climate_rankings.json','climate_annual.json','climate_annual_comparison.json'];
  const [s,m,h,q,w,e,d,st,ind,rec,ranks,annual,ac]=await Promise.all(names.map(f=>fetch(f).then(r=>r.json())));
  $('#generated').textContent=`Atualizado ${new Date(s.generated_utc).toLocaleString('pt-PT')} · último dia fechado ${dpt(s.source_last_closed_day)}`;
  const y=s.current_year,cm=s.current_month,hy=s.current_hydrological_year,live=s.live,sy=s.current_year_station_reference_prior_years||{},sd=s.current_year_difference_vs_station_reference||{},sr=sy.observed_reference||{};
  const years=[...new Set(d.days.map(x=>Number(x.date.slice(0,4))))].sort((a,b)=>a-b);

  // VISÃO GERAL
  $('#hero').innerHTML=`<div class="card"><span>${cm.month_name} · anomalia T média</span><b>${sign(cm.anomaly?.tmean_c)}${n(cm.anomaly?.tmean_c,2)} °C</b><small>vs 1991–2020</small></div><div class="card"><span>Precipitação no mês</span><b>${n(cm.observed?.precip_mm,1)} mm</b><small>${n(cm.anomaly?.precip_pct_normal,0)}% da normal até à data</small></div><div class="card ${s.heatwave.active?'wave-active':''}"><span>Onda de calor</span><b>${s.heatwave.active?'Ativa':'Não ativa'}</b><small>${s.heatwave.qualifying_streak_days} dias qualificativos</small></div><div class="card ${s.coldwave.active?'wave-cold':''}"><span>Onda de frio</span><b>${s.coldwave.active?'Ativa':'Não ativa'}</b><small>${s.coldwave.qualifying_streak_days} dias qualificativos</small></div>`;
  $('#year-context-title').textContent=`${y.year} em contexto — até ${dpt(y.end)}`;
  $('#year-context').innerHTML=
    contextCard('Temperatura média',`${n(y.observed?.tmean_c,2)} °C`,`vs normal: ${sign(y.anomaly?.tmean_c)}${n(y.anomaly?.tmean_c,2)} °C`,`vs estação: ${sign(sd.tmean_c)}${n(sd.tmean_c,2)} °C`,'hot')+
    contextCard('Precipitação',`${n(y.observed?.precip_mm,1)} mm`,`${n(y.anomaly?.precip_pct_normal,0)}% da normal`,`${n(sd.precip_pct_reference,0)}% da referência estação`,'wet')+
    contextCard('Dias >35 °C',`${n(y.observed?.tmax_gt_35,0)}`,`normal até à data: ${n(y.normal_1991_2020_same_period?.tmax_gt_35,1)}`,`referência estação: ${n(sr.tmax_gt_35,1)}`,'hot')+
    contextCard('Noites tropicais',`${n(y.observed?.tropical_nights,0)}`,`normal até à data: ${n(y.normal_1991_2020_same_period?.tropical_nights,1)}`,`referência estação: ${n(sr.tropical_nights,1)}`,'cold');
  $('#hydro-summary').innerHTML=`<div class="panel"><div class="section-title-row"><div><h2>Ano hidrológico ${hy.hydrological_year}</h2><p class="method">1 outubro–30 setembro · até ${dpt(hy.end)}</p></div><span class="badge">${n(hy.anomaly?.precip_pct_normal,0)}% da normal</span></div><div class="cards compact"><div class="card"><span>Acumulado</span><b>${n(hy.observed?.precip_mm,1)} mm</b></div><div class="card"><span>Normal até à data</span><b>${n(hy.normal_1991_2020_same_period?.precip_mm,1)} mm</b></div><div class="card"><span>Diferença</span><b>${sign(hy.anomaly?.precip_mm)}${n(hy.anomaly?.precip_mm,1)} mm</b></div><div class="card"><span>Cobertura</span><b>${n(hy.coverage_pct,1)}%</b></div></div></div>`;
  const currentMonths=m.months.filter(r=>r.year===y.year);
  interactiveGroupedBars($('#temp-anom-chart'),currentMonths.map(r=>ms[r.month]),[{label:'Anomalia T média',data:currentMonths.map(r=>r.anomaly?.tmean_c),unit:' °C',decimals:2,color:cssv('--warm')}],{unit:' °C',decimals:1});
  const civilNow=makeCivilCumulative(d.days,st.months,y.year);
  const civilSeries=[{label:'Observado',data:civilNow.obsDays.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:civilNow.obsCum[i]})),unit:' mm',color:cssv('--accent'),pointRadius:0},{label:'Normal 1991–2020',data:civilNow.obsDays.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:civilNow.norm[i]})),unit:' mm',color:cssv('--dry'),dash:'7 5',pointRadius:0},{label:'Referência estação',data:civilNow.obsDays.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:civilNow.refCum[i]})),unit:' mm',color:cssv('--cold'),dash:'2 5',pointRadius:0}];
  interactiveLineChart($('#summary-rain-cumulative'),civilSeries,{unit:' mm',decimals:0,zeroMin:true});
  const mref=s.current_month_station_reference_prior_years||{},mo=mref.observed_average||{},oo=cm.observed||{},on=cm.normal_1991_2020_same_period||{};
  $('#current-month-references').innerHTML=table(['Indicador','Observado','Normal 1991–2020','Estação — mesmos dias'],[['Tmax média',`${n(oo.tmax_mean_c,2)} °C`,`${n(on.tmax_mean_c,2)} °C`,`${n(mo.tmax_mean_c,2)} °C`],['T média',`${n(oo.tmean_c,2)} °C`,`${n(on.tmean_c,2)} °C`,`${n(mo.tmean_c,2)} °C`],['Tmin média',`${n(oo.tmin_mean_c,2)} °C`,`${n(on.tmin_mean_c,2)} °C`,`${n(mo.tmin_mean_c,2)} °C`],['Precipitação',`${n(oo.precip_mm,1)} mm`,`${n(on.precip_mm,1)} mm`,`${n(mo.precip_mm,1)} mm`],['Amostra','','',mref.sample_count?`${mref.sample_count} anos: ${mref.years_used.join(', ')}`:'—']]);

  // TEMPERATURA
  const ty=$('#temp-year'),tm=$('#temp-month'),tv=$('#temp-variable');years.forEach(v=>ty.add(new Option(String(v),String(v))));for(let i=1;i<=12;i++)tm.add(new Option(ml[i],String(i)));ty.value=String(y.year);tm.value=String(cm.month);
  function renderTemp(){const yy=Number(ty.value),mm=Number(tm.value),key=tv.value,rows=d.days.filter(x=>Number(x.date.slice(0,4))===yy&&Number(x.date.slice(5,7))===mm);if(!rows.length){$('#temperature-interactive-chart').innerHTML='<div class="chart-empty">Sem dados.</div>';return}const refs=stationDailyRef(d.days,yy,mm,yy===y.year),obsKey={tmax:'tmax_c',tmean:'tmean_c',tmin:'tmin_c'}[key],normKey={tmax:'normal_tmax_c',tmean:'normal_tmean_c',tmin:'normal_tmin_c'}[key];interactiveLineChart($('#temperature-interactive-chart'),[{label:'Observado',data:rows.map(r=>({label:String(Number(r.date.slice(8,10))),tooltipTitle:dpt(r.date),value:r[obsKey]})),unit:' °C',color:cssv('--accent'),width:3},{label:'Normal 1991–2020',data:rows.map(r=>({label:String(Number(r.date.slice(8,10))),tooltipTitle:dpt(r.date),value:r[normKey]})),unit:' °C',color:cssv('--dry'),dash:'7 5',pointRadius:0},{label:'Referência estação',data:refs.map(r=>({label:r.label,tooltipTitle:dpt(r.date),value:r[key]})),unit:' °C',color:cssv('--cold'),dash:'2 5',pointRadius:1.5}],{unit:' °C',decimals:1});const mrows=m.months.filter(r=>r.year===yy),field={tmax:'tmax_mean_c',tmean:'tmean_c',tmin:'tmin_mean_c'}[key];interactiveLineChart($('#temperature-monthly-chart'),[{label:'Observado',data:mrows.map(r=>({label:ms[r.month],value:r.observed?.[field]})),unit:' °C',color:cssv('--accent')},{label:'Normal 1991–2020',data:mrows.map(r=>({label:ms[r.month],value:r.normal_1991_2020_same_period?.[field]})),unit:' °C',color:cssv('--dry'),dash:'7 5'},{label:'Referência estação',data:mrows.map(r=>({label:ms[r.month],value:st.months[String(r.month)]?.station?.[field]})),unit:' °C',color:cssv('--cold'),dash:'2 5'}],{unit:' °C',decimals:1});}
  [ty,tm,tv].forEach(x=>x.addEventListener('change',renderTemp));renderTemp();
  $('#temperature-key-cards').innerHTML=`<div class="card"><span>Tmax absoluta</span><b>${n(e.all_time.tmax_absolute.value_c,1)} °C</b><small>${dpt(e.all_time.tmax_absolute.date)}</small></div><div class="card"><span>Tmin absoluta</span><b>${n(e.all_time.tmin_absolute.value_c,1)} °C</b><small>${dpt(e.all_time.tmin_absolute.date)}</small></div><div class="card"><span>Dias ≥30 °C em ${y.year}</span><b>${n(y.observed?.tmax_ge_30,0)}</b><small>até ${dpt(y.end)}</small></div><div class="card"><span>Tmin ≤0 °C em ${y.year}</span><b>${n(y.observed?.tmin_le_0,0)}</b><small>observacional; sem normal igual garantida</small></div>`;
  const stationRows=Object.values(st.months).sort((a,b)=>a.month-b.month),qdot=c=>`<span class="sample-dot ${c>=4?'sample-good':c>=2?'sample-medium':'sample-low'}"></span>${c}`;
  $('#station-temperature-table').innerHTML=table(['Mês','N temp.','Tmax','T média','Tmin','Δ T média'],stationRows.map(x=>[x.month_name,qdot(x.temperature_sample_count),`${n(x.station?.tmax_mean_c,2)} °C`,`${n(x.station?.tmean_c,2)} °C`,`${n(x.station?.tmin_mean_c,2)} °C`,`${sign(x.difference_station_vs_1991_2020?.tmean_c)}${n(x.difference_station_vs_1991_2020?.tmean_c,2)} °C`]));

  // Annual thermal indices.
  const thermalDefs=['tmax_ge_25','tmax_ge_30','tmax_ge_35','tmax_gt_35','tmax_ge_40','tropical_nights','tmin_le_0','frost_days'];
  thermalDefs.forEach(k=>{const def=ind.definitions[k];$('#thermal-index').add(new Option(`${def.label} · ${def.criterion}`,k))});$('#thermal-index').value='tmax_ge_30';
  function renderThermalAnnual(){const mode=$('#thermal-period').value,key=$('#thermal-index').value,def=ind.definitions[key],rows=mode==='same'?ac.same_period:ac.full_years;$('#thermal-index-note').textContent=`${def.criterion}. ${def.normal_available?'A normal é mostrada quando disponível e compatível.':'Sem normal 1991–2020 de Ranhados disponível com esta definição; comparação entre anos da estação.'}`;const metric={label:def.label,unit:' dias',decimals:0,value:r=>r.observed?.[key],normal:r=>def.normal_available?r.normal_1991_2020_same_period?.[key]:null,quality:r=>mode==='same'?(key.startsWith('rain')?r.quality?.precipitation_valid:r.quality?.temperature_valid):(key.startsWith('rain')?r.annual_quality?.precipitation_year_valid:r.annual_quality?.temperature_year_valid)};annualBarChart($('#thermal-index-chart'),rows,metric)}
  $('#thermal-period').addEventListener('change',renderThermalAnnual);$('#thermal-index').addEventListener('change',renderThermalAnnual);renderThermalAnnual();

  // PRECIPITAÇÃO
  const ry=$('#rain-year');years.forEach(v=>ry.add(new Option(String(v),String(v))));ry.value=String(y.year);
  function renderRain(){const yy=Number(ry.value),mrows=m.months.filter(r=>r.year===yy);interactiveGroupedBars($('#rain-interactive-chart'),mrows.map(r=>ms[r.month]),[{label:'Observado',data:mrows.map(r=>r.observed?.precip_mm),unit:' mm',color:cssv('--accent')},{label:'Normal 1991–2020',data:mrows.map(r=>r.normal_1991_2020_same_period?.precip_mm),unit:' mm',color:cssv('--dry')},{label:'Referência estação',data:mrows.map(r=>st.months[String(r.month)]?.station?.precip_mm),unit:' mm',color:cssv('--cold')}],{unit:' mm',decimals:0});const cc=makeCivilCumulative(d.days,st.months,yy),series=[{label:'Observado',data:cc.obsDays.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:cc.obsCum[i]})),unit:' mm',color:cssv('--accent'),pointRadius:0},{label:'Normal 1991–2020',data:cc.obsDays.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:cc.norm[i]})),unit:' mm',color:cssv('--dry'),dash:'7 5',pointRadius:0},{label:'Referência estação',data:cc.obsDays.map((x,i)=>({label:`${x.date.slice(8,10)}/${x.date.slice(5,7)}`,tooltipTitle:dpt(x.date),value:cc.refCum[i]})),unit:' mm',color:cssv('--cold'),dash:'2 5',pointRadius:0}];interactiveLineChart($('#rain-cumulative-chart'),series,{unit:' mm',zeroMin:true});const ar=annual.years.find(r=>r.year===yy),roll=ar?.rolling_precip_max||{};$('#rolling').innerHTML=Object.keys(roll).map(k=>`<div><span>${k} dia${k==='1'?'':'s'}</span><b>${n(roll[k]?.precip_mm,1)} mm</b><small>${dpt(roll[k]?.start)} → ${dpt(roll[k]?.end)}</small></div>`).join('');$('#rain-month-table').innerHTML=table(['Mês','Observado','Normal','% normal','Dias ≥1','>10','>20','>30'],mrows.map(r=>[r.month_name,`${n(r.observed?.precip_mm,1)} mm`,`${n(r.normal_1991_2020_same_period?.precip_mm,1)} mm`,`${n(r.anomaly?.precip_pct_normal,0)}%`,n(r.observed?.rain_days,0),n(r.observed?.rain_gt_10,0),n(r.observed?.rain_gt_20,0),n(r.observed?.rain_gt_30,0)]));}
  ry.addEventListener('change',renderRain);renderRain();
  const hp=hy.cumulative_points||[];interactiveLineChart($('#hydro-chart'),[{label:'Observado',data:hp.map(p=>({label:p.month_name,value:p.observed_cumulative_mm})),unit:' mm',color:cssv('--accent')},{label:'Normal 1991–2020',data:hp.map(p=>({label:p.month_name,value:p.normal_cumulative_mm})),unit:' mm',color:cssv('--dry')}],{unit:' mm',zeroMin:true});
  $('#station-rain-table').innerHTML=table(['Mês','N precip.','Chuva estação','Normal','% normal','Anos usados'],stationRows.map(x=>[x.month_name,qdot(x.precipitation_sample_count),`${n(x.station?.precip_mm,1)} mm`,`${n(x.official_normal_1991_2020?.precip_mm,1)} mm`,x.difference_station_vs_1991_2020?.precip_pct_normal===null?'—':`${n(x.difference_station_vs_1991_2020?.precip_pct_normal,0)}%`,x.precipitation_years_used.join(', ')||'—']));
  const rainDefs=['rain_days','rain_ge_10','rain_gt_10','rain_ge_20','rain_gt_20','rain_ge_30','rain_gt_30'];rainDefs.forEach(k=>{const def=ind.definitions[k];$('#rain-index').add(new Option(`${def.label} · ${def.criterion}`,k))});$('#rain-index').value='rain_days';
  function renderRainAnnual(){const mode=$('#rain-period').value,key=$('#rain-index').value,def=ind.definitions[key],rows=mode==='same'?ac.same_period:ac.full_years;$('#rain-index-note').textContent=`${def.criterion}. ${def.normal_available?'Normal comparável disponível.':'Indicador IPMA/WMO mostrado para a estação sem normal de Ranhados com definição garantidamente idêntica.'}`;annualBarChart($('#rain-index-chart'),rows,{label:def.label,unit:' dias',decimals:0,value:r=>r.observed?.[key],normal:r=>def.normal_available?r.normal_1991_2020_same_period?.[key]:null,quality:r=>mode==='same'?r.quality?.precipitation_valid:r.annual_quality?.precipitation_year_valid})}
  $('#rain-period').addEventListener('change',renderRainAnnual);$('#rain-index').addEventListener('change',renderRainAnnual);renderRainAnnual();

  // EXTREMOS E ONDAS
  $('#record-cards').innerHTML=`<div class="card"><span>Tmax absoluta</span><b>${n(rec.series?.tmax_absolute?.value_c,1)} °C</b><small>${dpt(rec.series?.tmax_absolute?.date)}</small></div><div class="card"><span>Tmin absoluta</span><b>${n(rec.series?.tmin_absolute?.value_c,1)} °C</b><small>${dpt(rec.series?.tmin_absolute?.date)}</small></div><div class="card"><span>Chuva diária máxima</span><b>${n(rec.series?.max_daily_precip?.value_mm,1)} mm</b><small>${dpt(rec.series?.max_daily_precip?.date)}</small></div><div class="card"><span>Onda de calor mais longa</span><b>${n(rec.waves?.longest_heatwave?.days,0)} dias</b><small>${dpt(rec.waves?.longest_heatwave?.start)} → ${dpt(rec.waves?.longest_heatwave?.end)}</small></div>`;
  $('#wave-summary').innerHTML=`<div class="card"><span>Ondas de calor</span><b>${w.heatwaves.length}</b><small>confirmadas</small></div><div class="card"><span>Ondas de frio</span><b>${w.coldwaves.length}</b><small>confirmadas</small></div><div class="card"><span>Quentes subcríticos</span><b>${w.subcritical_heat.length}</b><small>3–5 dias</small></div><div class="card"><span>Frios subcríticos</span><b>${w.subcritical_cold.length}</b><small>3–5 dias</small></div>`;
  $('#heatwaves').innerHTML=waveTable(w.heatwaves,true);$('#coldwaves').innerHTML=waveTable(w.coldwaves,true);
  const subState={heat:{all:false},cold:{all:false}};function sortedSub(arr,mode,kind){const a=[...arr];if(mode==='recent')return a.sort((x,y)=>y.start.localeCompare(x.start));if(mode==='long')return a.sort((x,y)=>(y.days-x.days)||(y.start.localeCompare(x.start)));return a.sort((x,y)=>kind==='heat'?(y.mean_departure_c-x.mean_departure_c):(x.mean_departure_c-y.mean_departure_c))}function renderSub(kind){const arr=kind==='heat'?w.subcritical_heat:w.subcritical_cold,sel=$(`#near-${kind}-sort`),host=$(`#near-${kind}`),btn=$(`#near-${kind}-toggle`),sorted=sortedSub(arr,sel.value,kind),show=subState[kind].all?sorted:sorted.slice(0,6);host.innerHTML=waveTable(show,false);btn.style.display=arr.length>6?'inline-block':'none';btn.textContent=subState[kind].all?'Mostrar apenas 6':'Ver todos'}['heat','cold'].forEach(kind=>{$(`#near-${kind}-sort`).addEventListener('change',()=>renderSub(kind));$(`#near-${kind}-toggle`).addEventListener('click',()=>{subState[kind].all=!subState[kind].all;renderSub(kind)});renderSub(kind)});
  const rm=$('#record-month');for(let i=1;i<=12;i++)rm.add(new Option(ml[i],String(i)));rm.value=String(cm.month);function renderRecordMonth(){const x=rec.by_calendar_month[rm.value]||{};$('#record-month-detail').innerHTML=table(['Recorde','Valor','Data/ano'],[['Tmax absoluta',`${n(x.tmax_absolute?.value_c,1)} °C`,dpt(x.tmax_absolute?.date)],['Tmin absoluta',`${n(x.tmin_absolute?.value_c,1)} °C`,dpt(x.tmin_absolute?.date)],['Chuva diária máxima',`${n(x.max_daily_precip?.value_mm,1)} mm`,dpt(x.max_daily_precip?.date)],['Mês com T média mais alta',`${n(x.warmest_month_mean?.value_c,2)} °C`,x.warmest_month_mean?.year??'—'],['Mês mais chuvoso',`${n(x.wettest_month?.value_mm,1)} mm`,x.wettest_month?.year??'—']])}rm.addEventListener('change',renderRecordMonth);renderRecordMonth();$('#rank-warm').innerHTML=rankVisual(ranks.monthly_global?.warmest_tmean,'°C');$('#rank-wet').innerHTML=rankVisual(ranks.monthly_global?.wettest,'mm');

  // HISTÓRICO / COMPARAÇÃO ANUAL
  const annualMetrics={tmean_anom:{label:'Anomalia da T média',unit:' °C',decimals:2,symmetric:true,value:r=>r.anomaly?.tmean_c,normal:null,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid},tmax:{label:'Tmax média',unit:' °C',decimals:2,value:r=>r.observed?.tmax_mean_c,normal:r=>r.normal_1991_2020_same_period?.tmax_mean_c,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid},tmin:{label:'Tmin média',unit:' °C',decimals:2,value:r=>r.observed?.tmin_mean_c,normal:r=>r.normal_1991_2020_same_period?.tmin_mean_c,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid},precip_pct:{label:'Precipitação em % da normal',unit:'%',decimals:0,value:r=>r.anomaly?.precip_pct_normal,normal:r=>100,quality:r=>r.quality?r.quality.precipitation_valid:r.annual_quality?.precipitation_year_valid},hot30:{label:'Dias ≥30 °C',unit:' dias',decimals:0,value:r=>r.observed?.tmax_ge_30,normal:null,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid},hot35:{label:'Dias >35 °C',unit:' dias',decimals:0,value:r=>r.observed?.tmax_gt_35,normal:r=>r.normal_1991_2020_same_period?.tmax_gt_35,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid},tropical:{label:'Noites tropicais',unit:' dias',decimals:0,value:r=>r.observed?.tropical_nights,normal:r=>r.normal_1991_2020_same_period?.tropical_nights,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid},rain_days:{label:'Dias ≥1 mm',unit:' dias',decimals:0,value:r=>r.observed?.rain_days,normal:r=>r.normal_1991_2020_same_period?.rain_days,quality:r=>r.quality?r.quality.precipitation_valid:r.annual_quality?.precipitation_year_valid},heatwave:{label:'Dias em ondas de calor',unit:' dias',decimals:0,value:r=>r.observed?.heatwave_days,normal:r=>r.normal_1991_2020_same_period?.heatwave_days,quality:r=>r.quality?r.quality.temperature_valid:r.annual_quality?.temperature_year_valid}};
  Object.entries(annualMetrics).forEach(([k,v])=>$('#annual-metric').add(new Option(v.label,k)));$('#annual-metric').value='tmean_anom';function renderAnnualCompare(){const mode=$('#annual-period').value,metric=annualMetrics[$('#annual-metric').value],rows=mode==='same'?ac.same_period:ac.full_years;$('#annual-comparison-note').textContent=mode==='same'?`Todos os anos de 1 Jan até ${ac.latest_month_day}; evita comparar ${y.year} parcial com anos inteiros.`:'Apenas anos de calendário fechados; barras vazias assinalam qualidade insuficiente para a métrica.';annualBarChart($('#annual-comparison-chart'),rows,metric)}$('#annual-period').addEventListener('change',renderAnnualCompare);$('#annual-metric').addEventListener('change',renderAnnualCompare);renderAnnualCompare();
  const qt=$('#q-type'),qd=$('#q-detail'),qdl=$('#q-detail-label');function populateQuadrantDetail(){const previous=qd.value;qd.innerHTML='';if(qt.value==='annual'){qdl.classList.add('hidden');return}qdl.classList.remove('hidden');if(qt.value==='seasonal')Object.entries({winter:'Inverno',spring:'Primavera',summer:'Verão',autumn:'Outono'}).forEach(([v,l])=>qd.add(new Option(l,v)));else for(let i=1;i<=12;i++)qd.add(new Option(ml[i],String(i)));if([...qd.options].some(o=>o.value===previous))qd.value=previous}function renderQuadrant(){if(qt.value==='annual')scatter($('#quadrant-chart'),q.annual);else if(qt.value==='seasonal')scatter($('#quadrant-chart'),q.seasonal[qd.value]||[]);else scatter($('#quadrant-chart'),q.monthly[qd.value]||[])}qt.addEventListener('change',()=>{populateQuadrantDetail();renderQuadrant()});qd.addEventListener('change',renderQuadrant);populateQuadrantDetail();renderQuadrant();renderHeatmap($('#temperature-heatmap'),m.months,'temp');renderHeatmap($('#rain-heatmap'),m.months,'rain');
  $('#station-climate-table').innerHTML=table(['Mês','N temp.','T média','Δ normal','N precip.','Chuva estação','Chuva normal','%'],stationRows.map(x=>[x.month_name,qdot(x.temperature_sample_count),`${n(x.station?.tmean_c,2)} °C`,`${sign(x.difference_station_vs_1991_2020?.tmean_c)}${n(x.difference_station_vs_1991_2020?.tmean_c,2)} °C`,qdot(x.precipitation_sample_count),`${n(x.station?.precip_mm,1)} mm`,`${n(x.official_normal_1991_2020?.precip_mm,1)} mm`,x.difference_station_vs_1991_2020?.precip_pct_normal===null?'—':`${n(x.difference_station_vs_1991_2020?.precip_pct_normal,0)}%`]));
  const ap=st.annual_profile||{},an=s.annual_normal_1991_2020||{};$('#station-context-cards').innerHTML=`<div class="card"><span>Perfil T média da estação</span><b>${n(ap.tmean_c,2)} °C</b><small>${ap.tmean_c&&an.tmean_c?`${sign(ap.tmean_c-an.tmean_c)}${n(ap.tmean_c-an.tmean_c,2)} °C vs 1991–2020`:''}</small></div><div class="card"><span>Perfil Tmax da estação</span><b>${n(ap.tmax_mean_c,2)} °C</b><small>${ap.tmax_mean_c&&an.tmax_mean_c?`${sign(ap.tmax_mean_c-an.tmax_mean_c)}${n(ap.tmax_mean_c-an.tmax_mean_c,2)} °C vs normal`:''}</small></div><div class="card"><span>Perfil Tmin da estação</span><b>${n(ap.tmin_mean_c,2)} °C</b><small>${ap.tmin_mean_c&&an.tmin_mean_c?`${sign(ap.tmin_mean_c-an.tmin_mean_c)}${n(ap.tmin_mean_c-an.tmin_mean_c,2)} °C vs normal`:''}</small></div><div class="card"><span>Série disponível</span><b>2022–presente</b><small>período curto; não é tendência climática</small></div>`;

  // METODOLOGIA
  $('#quality').innerHTML=`<div><span>Dias válidos</span><b>${s.quality.valid_days}</b></div><div><span>Dias em falta</span><b>${s.quality.missing_day_count}</b></div><div><span>Linhas inválidas</span><b>${s.quality.invalid_row_count}</b></div>`;$('#live-note').textContent=live&&!live.error?`Hoje (provisório): Tmin ${n(live.tmin,1)} °C · Tmax ${n(live.tmax,1)} °C · T média ${n(live.tmean,1)} °C · precipitação ${n(live.rain,1)} mm.`:'Dados live indisponíveis nesta atualização.';
  $('#definitions-table').innerHTML=table(['Indicador','Critério','Normal comparável?','Família'],Object.values(ind.definitions).map(x=>[x.label,x.criterion,x.normal_available?'Sim':'Não',x.family]));
}
init().catch(err=>{console.error(err);document.body.insertAdjacentHTML('beforeend',`<pre class="fatal">${String(err)}</pre>`)});
