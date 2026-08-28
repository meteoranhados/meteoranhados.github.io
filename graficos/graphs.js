
const $=q=>document.querySelector(q);
const fmt=(v,d=1)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const dateFmt=(ms,long=false)=>new Intl.DateTimeFormat('pt-PT',long?{day:'2-digit',month:'short',year:'numeric'}:{day:'2-digit',month:'short'}).format(new Date(ms));
const dateTimeFmt=ms=>new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(ms));
const download=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},100)};
function icon(name){
 const c='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
 const x={
 temp:`<svg ${c}><path d="M14 14.8V5a4 4 0 0 0-8 0v9.8a6 6 0 1 0 8 0Z"/><path d="M10 11v5"/></svg>`,
 hum:`<svg ${c}><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z"/></svg>`,
 press:`<svg ${c}><circle cx="12" cy="12" r="8"/><path d="m12 12 4-3M8 18h8"/></svg>`,
 rain:`<svg ${c}><path d="M7 16a4 4 0 1 1 1-7.9A5.5 5.5 0 0 1 18.5 10 3.5 3.5 0 0 1 18 17H8"/><path d="m8 19-1 2m5-2-1 2m5-2-1 2"/></svg>`,
 wind:`<svg ${c}><path d="M3 8h11c3 0 3-4 0-4-1.5 0-2.2.8-2.5 1.5M3 12h16c3 0 3 4 0 4-1.5 0-2.2-.8-2.5-1.5M3 16h7"/></svg>`,
 sun:`<svg ${c}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>`,
 agro:`<svg ${c}><path d="M12 21V9"/><path d="M12 13c-4 0-7-2-7-6 4 0 7 2 7 6Zm0-2c4 0 7-2 7-6-4 0-7 2-7 6Z"/></svg>`
 };return x[name]||x.temp;
}
const COLORS=['#245e75','#c55448','#6e956f','#8072a4','#c5902f','#5793ad','#924d72'];

const CATS={
 temp:{icon:'temp',label:'Temperatura',title:'Evolução térmica',desc:'Temperatura e índices térmicos medidos pela estação.',interval:[
   ['temp','Temperatura','°C',1],['dew','Ponto de orvalho','°C',1],['feelslike','Sensação','°C',1],['apparent','Aparente','°C',1],['heat_index','Heat index','°C',1],['wind_chill','Wind chill','°C',1]
 ],daily:[['tmin','T mínima','°C',1],['tmean','T média','°C',1],['tmax','T máxima','°C',1]]},
 hum:{icon:'hum',label:'Humidade',title:'Humidade relativa',desc:'Humidade exterior e, quando disponível, interior.',interval:[
   ['hum','Exterior','%',0],['inside_hum','Interior','%',0]
 ],daily:[['hum_min','Mínima diária','%',0],['hum_mid','Centro min–max','%',0],['hum_max','Máxima diária','%',0]]},
 press:{icon:'press',label:'Pressão',title:'Pressão atmosférica',desc:'Evolução da pressão ao nível do mar medida pela estação.',interval:[
   ['pressure','Pressão',' hPa',1]
 ],daily:[['press_min','Mínima diária',' hPa',1],['press_mid','Centro min–max',' hPa',1],['press_max','Máxima diária',' hPa',1]]},
 rain:{icon:'rain',label:'Precipitação',title:'Precipitação',desc:'Quantidade precipitada e intensidade. Não existe preenchimento artificial de falhas.',interval:[
   ['rain_mm','Chuva por intervalo',' mm',2,'bar'],['rain_rate','Intensidade máxima',' mm/h',1],['rain_cumulative','Acumulado no período',' mm',1,'right']
 ],daily:[['rain_mm','Chuva diária',' mm',1,'bar']]},
 wind:{icon:'wind',label:'Vento',title:'Vento',desc:'Velocidade, rajadas e direção. Nos períodos longos são usados os resumos diários.',interval:[
   ['wind_avg','Vento médio',' km/h',1],['wind_gust','Rajada',' km/h',1]
 ],daily:[['wind_avg_max','Maior média diária',' km/h',1],['wind_gust_max','Rajada máxima',' km/h',1],['wind_run','Percurso diário',' km',0,'right']]},
 solar:{icon:'sun',label:'Solar / UV',title:'Radiação solar e UV',desc:'Radiação observada, potencial solar teórico e índice UV.',interval:[
   ['solar','Radiação',' W/m²',0],['solar_max','Potencial teórico',' W/m²',0],['uv','Índice UV','',1,'right']
 ],daily:[['solar_max_day','Máximo solar diário',' W/m²',0],['uv_max_day','UV máximo','',1,'right'],['sunshine_hours','Horas de sol',' h',1,'right']]},
 agro:{icon:'agro',label:'Agro / sazonal',title:'Indicadores agroclimáticos',desc:'ET, horas de sol, graus-dia e acumulação de frio. Disponível nos resumos diários.',interval:[],
 daily:[['et_mm','Evapotranspiração (ET)',' mm',2],['sunshine_hours','Horas de sol',' h',1],['heating_degree_days','Graus-dia aquecimento','',1,'right'],['cooling_degree_days','Graus-dia arrefecimento','',1,'right'],['chill_hours_daily','Horas de frio diárias',' h',1,'right'],['chill_hours_cumulative','Horas de frio — acumulado da época',' h',1,'right']]}
};
const COMPARES={
 '':'Nenhuma',
 hum:'Humidade',pressure:'Pressão',wind_avg:'Vento médio',dew:'Ponto de orvalho',rain_mm:'Precipitação',solar:'Radiação solar'
};
let manifest=null,currentData=null,period='24h',category='temp',activeKeys=new Set(),compareKey='',lastSvg='',verification=null;

async function getJson(url){const r=await fetch(url+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(`${url}: ${r.status}`);return r.json()}
function rowsForDailyPeriod(rows,p){
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
 if(p==='90d')return rows.filter(x=>x.time_ms>=today-90*86400000);
 if(p==='year')return rows.filter(x=>new Date(x.time_ms).getFullYear()===now.getFullYear());
 return rows;
}
async function loadPeriod(p){
 $('#gx-chart').classList.add('gx-loading');
 try{
   let data;
   if(['24h','7d','30d'].includes(p))data=await getJson(`period-${p}.json`);
   else{data=await getJson('daily-archive.json');data={...data,samples:rowsForDailyPeriod(data.samples||[],p)}}
   currentData=data;period=p;$('#gx-chart').classList.remove('gx-loading');render();
 }catch(e){console.error(e);currentData={available:false,samples:[],error:String(e)};$('#gx-chart').classList.remove('gx-loading');render()}
}
function catSeries(){
 const kind=currentData?.kind==='daily'?'daily':'interval';return CATS[category][kind]||[];
}
function available(s){return (currentData?.samples||[]).some(r=>r[s[0]]!==null&&r[s[0]]!==undefined)}
function setupSeries(reset=false){
 const s=catSeries(),avail=s.filter(available),valid=new Set(avail.map(x=>x[0]));
 activeKeys=new Set([...activeKeys].filter(k=>valid.has(k)));
 if(reset||!activeKeys.size){
   activeKeys=new Set();
   const daily=currentData?.kind==='daily';
   const defaults=daily?{
     temp:['tmin','tmean','tmax'],hum:['hum_min','hum_mid','hum_max'],press:['press_min','press_mid','press_max'],
     rain:['rain_mm'],wind:['wind_avg_max','wind_gust_max'],solar:['solar_max_day'],agro:['et_mm']
   }:{
     temp:['temp','dew'],hum:['hum'],press:['pressure'],rain:['rain_mm','rain_cumulative'],
     wind:['wind_avg','wind_gust'],solar:['solar','solar_max'],agro:[]
   };
   (defaults[category]||[]).filter(k=>valid.has(k)).forEach(k=>activeKeys.add(k));
   if(!activeKeys.size&&avail.length)activeKeys.add(avail[0][0]);
 }
 $('#gx-series').innerHTML=s.map(x=>`<button type="button" data-key="${x[0]}" class="${activeKeys.has(x[0])?'is-on':''} ${available(x)?'':'is-unavailable'}">${x[1]}</button>`).join('');
 $('#gx-series').querySelectorAll('button:not(.is-unavailable)').forEach(b=>b.onclick=()=>{
   const k=b.dataset.key,def=s.find(x=>x[0]===k);
   if(activeKeys.has(k)){
     // Never allow a graph state with no valid indicator selected.
     if(activeKeys.size>1)activeKeys.delete(k);
   }else{
     const selected=s.filter(x=>activeKeys.has(x[0])),primaryUnit=selected[0]?.[2]||def?.[2]||'';
     const units=new Set(selected.map(x=>x[2]).filter(Boolean));
     const newUnit=def?.[2]||'';
     if(newUnit&&!units.has(newUnit)&&units.size>=2){
       // Keep the primary axis and replace the previous secondary-unit family.
       selected.filter(x=>x[2]!==primaryUnit).forEach(x=>activeKeys.delete(x[0]));
     }
     if(compareKey&&newUnit&&newUnit!==primaryUnit){
       compareKey='';$('#gx-compare').value='';
     }
     activeKeys.add(k);
   }
   render();
 });
}
function setupCompare(){
 const sel=$('#gx-compare'),daily=currentData?.kind==='daily';
 sel.innerHTML=Object.entries(COMPARES).map(([k,l])=>`<option value="${k}">${l}</option>`).join('');
 [...sel.options].forEach(o=>{
   if(!o.value)return;
   const map=daily?{hum:'hum_mid',pressure:'press_mid',wind_avg:'wind_avg_max',dew:'tmean',rain_mm:'rain_mm',solar:'solar_max_day'}:null;
   const key=daily?map[o.value]:o.value;
   o.disabled=!(currentData?.samples||[]).some(r=>r[key]!=null);
 });
 if(sel.querySelector(`option[value="${compareKey}"]`)?.disabled)compareKey='';
 sel.value=compareKey;
}
function valMeta(key){
 for(const k of Object.keys(CATS))for(const mode of ['interval','daily'])for(const s of CATS[k][mode])if(s[0]===key)return s;
 const fall={hum:['hum','Humidade','%',0],pressure:['pressure','Pressão',' hPa',1],wind_avg:['wind_avg','Vento',' km/h',1],dew:['dew','Ponto de orvalho','°C',1],rain_mm:['rain_mm','Chuva',' mm',1],solar:['solar','Radiação',' W/m²',0]};
 return fall[key]||[key,key,'',1];
}
function compareActualKey(){
 if(!compareKey)return'';
 if(currentData?.kind!=='daily')return compareKey;
 return {hum:'hum_mid',pressure:'press_mid',wind_avg:'wind_avg_max',dew:'tmean',rain_mm:'rain_mm',solar:'solar_max_day'}[compareKey]||'';
}
function seriesStats(vals){
 const v=vals.filter(Number.isFinite);if(!v.length)return{min:null,max:null,avg:null,sum:null};
 return{min:Math.min(...v),max:Math.max(...v),avg:v.reduce((a,b)=>a+b,0)/v.length,sum:v.reduce((a,b)=>a+b,0)};
}
function windDir(deg){if(deg==null||!Number.isFinite(Number(deg)))return'—';return['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(Number(deg)/22.5)%16]}
function renderStats(){
 const rows=currentData?.samples||[],series=catSeries().filter(s=>activeKeys.has(s[0])&&available(s)),first=series[0];
 if(!first){$('#gx-stats').innerHTML='';return}
 const vals=rows.map(r=>Number(r[first[0]])).filter(Number.isFinite),st=seriesStats(vals),last=[...rows].reverse().find(r=>r[first[0]]!=null)?.[first[0]],u=first[2],d=first[3];
 let cards=[
  ['Último',`${fmt(last,d)}${u}`],['Mínimo',`${fmt(st.min,d)}${u}`],['Máximo',`${fmt(st.max,d)}${u}`],['Média',`${fmt(st.avg,d)}${u}`]
 ];
 if(category==='rain'){const rain=rows.map(r=>Number(r.rain_mm||0));cards=[['Total',`${fmt(rain.reduce((a,b)=>a+b,0),1)} mm`],['Maior intervalo',`${fmt(Math.max(0,...rain),1)} mm`],['Intensidade máx.',`${fmt(Math.max(0,...rows.map(r=>Number(r.rain_rate||0))),1)} mm/h`],['Dias/pontos com chuva',String(rain.filter(x=>x>0).length)]]}
 if(category==='wind')cards[4]=['Direção',windDir([...rows].reverse().find(r=>(r.wind_bearing??r.dom_wind_bearing)!=null)?.wind_bearing??[...rows].reverse().find(r=>r.dom_wind_bearing!=null)?.dom_wind_bearing)];
 else if(category==='solar')cards[4]=['UV máximo',fmt(Math.max(0,...rows.map(r=>Number(r.uv??r.uv_max_day??0))),1)];
 $('#gx-stats').innerHTML=cards.map(c=>`<div class="gx-stat"><span>${c[0]}</span><b>${c[1]}</b></div>`).join('');
}
function renderAnalysis(){
 const rows=currentData?.samples||[],kind=currentData?.kind;
 let items=[],secondary='';
 if(category==='temp'){
   const k=kind==='daily'?'tmean':'temp',v=rows.map(r=>Number(r[k])).filter(Number.isFinite),st=seriesStats(v);
   const range=kind==='daily'?rows.map(r=>r.tmax!=null&&r.tmin!=null?Number(r.tmax)-Number(r.tmin):null).filter(Number.isFinite):[];
   items=[['Amplitude da série',`${fmt(st.max-st.min,1)} °C`],['Temperatura média',`${fmt(st.avg,1)} °C`]];
   if(range.length)items.push(['Amplitude diária média',`${fmt(seriesStats(range).avg,1)} °C`]);
   secondary='<p>Use <strong>Ponto de orvalho</strong> ou <strong>Humidade</strong> em “Comparar com” para perceber melhor conforto e secura do ar.</p>';
 }else if(category==='hum'){
   const key=kind==='daily'?'hum_mid':'hum',st=seriesStats(rows.map(r=>Number(r[key])).filter(Number.isFinite));
   items=[['Humidade média',`${fmt(st.avg,0)}%`],['Intervalo',`${fmt(st.min,0)}–${fmt(st.max,0)}%`]];
   secondary='<p>A humidade relativa depende fortemente da temperatura; a comparação com temperatura ou ponto de orvalho é normalmente mais informativa do que a humidade isolada.</p>';
 }else if(category==='press'){
   const key=kind==='daily'?'press_mid':'pressure',st=seriesStats(rows.map(r=>Number(r[key])).filter(Number.isFinite));
   items=[['Pressão média',`${fmt(st.avg,1)} hPa`],['Amplitude',`${fmt(st.max-st.min,1)} hPa`]];
   secondary='<p>Quedas rápidas de pressão, sobretudo quando acompanhadas por vento e precipitação, ajudam a visualizar a passagem de sistemas frontais.</p>';
 }else if(category==='rain'){
   const rain=rows.map(r=>Number(r.rain_mm||0)),total=rain.reduce((a,b)=>a+b,0),wet=rain.filter(x=>x>0).length;
   items=[['Precipitação total',`${fmt(total,1)} mm`],['Intervalos/dias com chuva',String(wet)],['Maior quantidade',`${fmt(Math.max(0,...rain),1)} mm`]];
   secondary='<p>Para climatologia e comparação com 1991–2020, use a área <a href="/climate/">Climatologia</a>. Este gráfico concentra-se na distribuição temporal da chuva.</p>';
 }else if(category==='wind'){
   const avgKey=kind==='daily'?'wind_avg_max':'wind_avg',gustKey=kind==='daily'?'wind_gust_max':'wind_gust',av=seriesStats(rows.map(r=>Number(r[avgKey])).filter(Number.isFinite)),gu=seriesStats(rows.map(r=>Number(r[gustKey])).filter(Number.isFinite));
   items=[['Velocidade média',`${fmt(av.avg,1)} km/h`],['Rajada máxima',`${fmt(gu.max,1)} km/h`],['Percurso total',kind==='daily'?`${fmt(rows.reduce((a,r)=>a+Number(r.wind_run||0),0),0)} km`:'—']];
   const bearings=rows.map(r=>Number(r.wind_bearing??r.dom_wind_bearing)).filter(Number.isFinite),sin=bearings.reduce((a,x)=>a+Math.sin(x*Math.PI/180),0),cos=bearings.reduce((a,x)=>a+Math.cos(x*Math.PI/180),0),bearing=bearings.length?(Math.atan2(sin,cos)*180/Math.PI+360)%360:null;
   secondary=bearing==null?'<p>Sem direção suficiente neste período.</p>':`<div class="gx-direction"><div class="gx-compass"><span class="gx-compass-label n">N</span><span class="gx-compass-label e">E</span><span class="gx-compass-label s">S</span><span class="gx-compass-label w">W</span><div class="gx-compass-arrow" style="transform:translate(-2px,-3px) rotate(${bearing}deg)"></div></div><div><b>Direção média vetorial</b><p>${windDir(bearing)} · ${fmt(bearing,0)}°</p><p>Para a rosa dos ventos completa, consulte a área Vento da Climatologia.</p></div></div>`;
 }else if(category==='solar'){
   const sk=kind==='daily'?'solar_max_day':'solar',sv=seriesStats(rows.map(r=>Number(r[sk])).filter(Number.isFinite)),uv=seriesStats(rows.map(r=>Number(r[kind==='daily'?'uv_max_day':'uv'])).filter(Number.isFinite));
   items=[['Radiação média',`${fmt(sv.avg,0)} W/m²`],['Máximo',`${fmt(sv.max,0)} W/m²`],['UV máximo',fmt(uv.max,1)]];
   secondary='<p>Nos períodos recentes pode sobrepor <strong>Potencial teórico</strong> à radiação observada. A diferença ajuda a visualizar nebulosidade e transparência atmosférica.</p>';
 }else{
   const et=rows.reduce((a,r)=>a+Number(r.et_mm||0),0),sun=rows.reduce((a,r)=>a+Number(r.sunshine_hours||0),0),hdd=rows.reduce((a,r)=>a+Number(r.heating_degree_days||0),0),cdd=rows.reduce((a,r)=>a+Number(r.cooling_degree_days||0),0);
   items=[['ET total',`${fmt(et,1)} mm`],['Horas de sol',`${fmt(sun,1)} h`],['Graus-dia aquecimento',fmt(hdd,1)],['Graus-dia arrefecimento',fmt(cdd,1)]];
   secondary=`<div class="gx-definitions">
     <div class="gx-definition"><b>Evapotranspiração (ET)</b><p>Estimativa da água transferida do solo e da vegetação para a atmosfera. É expressa em milímetros, tal como a precipitação.</p></div>
     <div class="gx-definition"><b>Graus-dia de aquecimento</b><p>Acumulam, ao longo do tempo, o défice de temperatura abaixo da temperatura-base configurada no Cumulus. Quanto maior o valor, maior foi a necessidade térmica de aquecimento.</p></div>
     <div class="gx-definition"><b>Graus-dia de arrefecimento</b><p>Acumulam o excedente térmico acima da temperatura-base configurada. São um indicador da necessidade de arrefecimento.</p></div>
     <div class="gx-definition"><b>Horas de frio (Chill Hours)</b><p>Horas que cumprem o intervalo de frio configurado no Cumulus. O acumulado reinicia no início da época definido na configuração e é especialmente útil em fruticultura.</p></div>
   </div>`;
 }
 $('#gx-analysis').innerHTML=items.map(x=>`<div class="gx-analysis-item"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 $('#gx-secondary').innerHTML=secondary;
 $('#gx-secondary-title').textContent=category==='wind'?'Direção do vento':'Detalhe meteorológico';
}
function linePath(points,x,y){return points.map((p,i)=>`${i?'L':'M'} ${x(p.ms).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ')}
function renderChart(){
 const host=$('#gx-chart'),rows=currentData?.samples||[],defs=catSeries().filter(s=>activeKeys.has(s[0])&&available(s));
 if(!currentData?.available||!rows.length||!defs.length){lastSvg='';host.innerHTML='<div class="gx-empty">Ainda não há dados válidos para esta combinação. Foi mantido automaticamente pelo menos um indicador disponível.</div><div id="gx-tooltip" class="gx-tooltip"></div>';return}
 const primaryUnit=defs[0][2]||'',cmp=compareActualKey(),cmpMeta=cmp?valMeta(compareKey):null,cmpUnit=cmpMeta?.[2]||'';
 const leftDefs=defs.filter(d=>(d[2]||'')===primaryUnit);
 let rightDefs=defs.filter(d=>(d[2]||'')!==primaryUnit);
 // A user comparison owns the secondary axis. Avoid mixing unrelated units.
 if(cmp&&cmpUnit&&rightDefs.length&&rightDefs[0][2]!==cmpUnit)rightDefs=[];
 const W=1120,H=420,m={l:72,r:(rightDefs.length||cmp&&cmpUnit!==primaryUnit)?76:25,t:23,b:49};
 const times=rows.map(r=>Number(r.time_ms)).filter(Number.isFinite),minT=Math.min(...times),maxT=Math.max(...times),x=t=>m.l+(t-minT)/(maxT-minT||1)*(W-m.l-m.r);
 const leftVals=[],rightVals=[];
 leftDefs.forEach(d=>rows.forEach(r=>{if(Number.isFinite(Number(r[d[0]])))leftVals.push(Number(r[d[0]]))}));
 rightDefs.forEach(d=>rows.forEach(r=>{if(Number.isFinite(Number(r[d[0]])))rightVals.push(Number(r[d[0]]))}));
 if(cmp)rows.forEach(r=>{if(Number.isFinite(Number(r[cmp])))(cmpUnit===primaryUnit?leftVals:rightVals).push(Number(r[cmp]))});
 const range=vals=>{let mn=Math.min(...vals),mx=Math.max(...vals);if(!Number.isFinite(mn)||!Number.isFinite(mx)){mn=0;mx=1}let pad=(mx-mn)*.10||1;if(mn>=0&&mn-pad<0)mn=0;else mn-=pad;mx+=pad;return[mn,mx]};
 const [lmin,lmax]=range(leftVals),[rmin,rmax]=rightVals.length?range(rightVals):[0,1],yL=v=>m.t+(lmax-v)/(lmax-lmin)*(H-m.t-m.b),yR=v=>m.t+(rmax-v)/(rmax-rmin)*(H-m.t-m.b);
 const unitText=u=>(u||'').trim();
 let s=`<svg id="gx-svg" viewBox="0 0 ${W} ${H}" role="img">`;
 for(let i=0;i<=4;i++){
   const lv=lmin+(lmax-lmin)*i/4,yy=yL(lv);
   s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e7edef"/><text x="${m.l-8}" y="${yy+4}" text-anchor="end" font-size="9" fill="#71828b">${fmt(lv,primaryUnit==='%'?0:1)}</text>`;
   if(rightVals.length){const rv=rmin+(rmax-rmin)*i/4;s+=`<text x="${W-m.r+8}" y="${yy+4}" font-size="9" fill="#8a7686">${fmt(rv,1)}</text>`}
 }
 if(unitText(primaryUnit))s+=`<text class="gx-axis-unit" x="15" y="${(m.t+H-m.b)/2}" text-anchor="middle" transform="rotate(-90 15 ${(m.t+H-m.b)/2})">${unitText(primaryUnit)}</text>`;
 const rightUnit=cmp&&cmpUnit!==primaryUnit?cmpUnit:(rightDefs[0]?.[2]||'');
 if(rightVals.length&&unitText(rightUnit))s+=`<text class="gx-axis-unit" x="${W-13}" y="${(m.t+H-m.b)/2}" text-anchor="middle" transform="rotate(90 ${W-13} ${(m.t+H-m.b)/2})">${unitText(rightUnit)}</text>`;
 const mobile=window.innerWidth<760;
 const tickMap=mobile?{'24h':6,'7d':7,'30d':7,'90d':6,'year':6,'all':6}:{'24h':12,'7d':14,'30d':15,'90d':10,'year':12,'all':10};
 const ticks=tickMap[period]||8;
 const labelFor=t=>{
   const d=new Date(t);
   if(period==='24h')return new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit'}).format(d);
   if(period==='7d')return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit'}).format(d).replace(',',' ');
   if(period==='all')return new Intl.DateTimeFormat('pt-PT',{month:'2-digit',year:'2-digit'}).format(d);
   return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit'}).format(d);
 };
 for(let i=0;i<=ticks;i++){const t=minT+(maxT-minT)*i/ticks,xx=x(t);s+=`<text x="${xx}" y="${H-18}" text-anchor="middle" font-size="${mobile?8:8.5}" fill="#72828b">${labelFor(t)}</text>`}
 const allDefs=[...leftDefs,...rightDefs],barDefs=allDefs.filter(d=>d[4]==='bar'),lineDefs=allDefs.filter(d=>d[4]!=='bar');
 barDefs.forEach((d,di)=>{const yy=(d[2]||'')===primaryUnit?yL:yR,points=rows.filter(r=>Number.isFinite(Number(r[d[0]]))),bw=Math.max(1,Math.min(18,(W-m.l-m.r)/(points.length+3)*.72));points.forEach(r=>{const v=Number(r[d[0]]),yv=yy(v),zero=yy(Math.max(0,(d[2]||'')===primaryUnit?lmin:rmin));s+=`<rect x="${x(r.time_ms)-bw/2}" y="${Math.min(yv,zero)}" width="${bw}" height="${Math.max(1,Math.abs(zero-yv))}" fill="${COLORS[di%COLORS.length]}" opacity=".62" rx="1"/>`})});
 lineDefs.forEach((d,di)=>{const yy=(d[2]||'')===primaryUnit?yL:yR,pts=rows.filter(r=>Number.isFinite(Number(r[d[0]]))).map(r=>({ms:Number(r.time_ms),v:Number(r[d[0]])}));if(pts.length)s+=`<path d="${linePath(pts,x,yy)}" fill="none" stroke="${COLORS[(di+barDefs.length)%COLORS.length]}" stroke-width="${di===0?2.6:1.8}" ${(d[2]||'')!==primaryUnit?'stroke-dasharray="6 4"':''}/>`});
 if(cmp){const yy=cmpUnit===primaryUnit?yL:yR,pts=rows.filter(r=>Number.isFinite(Number(r[cmp]))).map(r=>({ms:Number(r.time_ms),v:Number(r[cmp])}));if(pts.length)s+=`<path d="${linePath(pts,x,yy)}" fill="none" stroke="#924d72" stroke-width="2.1" stroke-dasharray="3 4"/>`}
 s+=`<rect id="gx-hit" x="${m.l}" y="${m.t}" width="${W-m.l-m.r}" height="${H-m.t-m.b}" fill="transparent"/><line id="gx-cross" x1="0" y1="${m.t}" x2="0" y2="${H-m.b}" stroke="#6c7d85" stroke-dasharray="3 4" visibility="hidden"/></svg>`;
 lastSvg=s;host.innerHTML=s+'<div id="gx-tooltip" class="gx-tooltip"></div>';
 const svg=$('#gx-svg'),hit=$('#gx-hit'),cross=$('#gx-cross'),tooltip=$('#gx-tooltip');
 hit.addEventListener('mousemove',ev=>{const rect=svg.getBoundingClientRect(),vx=(ev.clientX-rect.left)/rect.width*W,target=minT+(vx-m.l)/(W-m.l-m.r)*(maxT-minT),nearest=rows.reduce((a,b)=>Math.abs(b.time_ms-target)<Math.abs(a.time_ms-target)?b:a,rows[0]),xx=x(nearest.time_ms);cross.setAttribute('x1',xx);cross.setAttribute('x2',xx);cross.setAttribute('visibility','visible');const items=allDefs.filter(d=>nearest[d[0]]!=null).map(d=>`<div class="gx-tooltip-row"><span>${d[1]}</span><strong>${fmt(nearest[d[0]],d[3])}${d[2]}</strong></div>`);if(cmp&&nearest[cmp]!=null)items.push(`<div class="gx-tooltip-row"><span>${COMPARES[compareKey]}</span><strong>${fmt(nearest[cmp],cmpMeta[3])}${cmpMeta[2]}</strong></div>`);tooltip.innerHTML=`<b>${currentData.kind==='daily'?dateFmt(nearest.time_ms,true):dateTimeFmt(nearest.time_ms)}</b>${items.join('')}`;tooltip.style.display='block';tooltip.style.left=Math.min(rect.width-170,Math.max(5,ev.clientX-rect.left+12))+'px';tooltip.style.top=Math.max(8,ev.clientY-rect.top-30)+'px'});
 hit.addEventListener('mouseleave',()=>{cross.setAttribute('visibility','hidden');tooltip.style.display='none'});
 const legend=allDefs.map(d=>d[1]).join(' · ')+(cmp?` · comparação: ${COMPARES[compareKey]}`:'');
 $('#gx-chart-note').textContent=`${legend}. ${currentData.kind==='daily'?'Um ponto por dia.':`Resolução publicada: ${currentData.bucket_minutes} min.`}`;
}
function render(){
 const cat=CATS[category],pLabel=manifest?.period_labels?.[period]||period;
 $('#gx-kicker').textContent=cat.label;$('#gx-title').textContent=`${cat.title} · ${pLabel}`;$('#gx-description').textContent=cat.desc;
 $('#gx-source-status').textContent=currentData?.available?`${currentData.source}${currentData.stale?' · cache':''} · ${currentData.samples?.length||0} pontos`:'Dados indisponíveis';
 setupSeries(false);setupCompare();renderStats();renderChart();renderAnalysis();
 document.querySelectorAll('#gx-periods button').forEach(b=>b.classList.toggle('is-active',b.dataset.period===period));
 document.querySelectorAll('.gx-category').forEach(b=>b.classList.toggle('is-active',b.dataset.cat===category));
}
function exportCSV(){
 const rows=currentData?.samples||[],defs=catSeries().filter(s=>activeKeys.has(s[0])&&available(s)),cmp=compareActualKey(),keys=['time_ms',...defs.map(d=>d[0]),...(cmp?[cmp]:[])],header=['data/hora',...defs.map(d=>d[1]),...(cmp?[COMPARES[compareKey]]:[])],lines=[header.join(';')];
 rows.forEach(r=>lines.push([new Date(r.time_ms).toISOString(),...keys.slice(1).map(k=>r[k]??'')].join(';')));
 download(`ranhados-${category}-${period}.csv`,lines.join('\n'),'text/csv;charset=utf-8');
}


function verificationMeta(){
 const v=$('#gx-verify-variable')?.value||'temperature';
 return {
  temperature:{label:'Temperatura',unit:'°C',dec:1},
  humidity:{label:'Humidade',unit:'%',dec:0},
  pressure:{label:'Pressão',unit:' hPa',dec:1},
  wind:{label:'Vento',unit:' km/h',dec:1},
  precipitation:{label:'Precipitação horária',unit:' mm',dec:1}
 }[v];
}
function renderVerification(){
 const host=$('#gx-verify-chart'),stats=$('#gx-verify-stats'),note=$('#gx-verify-note');
 if(!verification){host.innerHTML='<div class="gx-empty">A carregar arquivo de previsões…</div>';return}
 if(!verification.available){
   stats.innerHTML=`<div class="gx-stat"><span>Previsões arquivadas</span><b>${verification.archive_records||0}</b></div><div class="gx-stat"><span>Já comparáveis</span><b>${verification.matched_samples||0}</b></div>`;
   host.innerHTML=`<div class="gx-empty">${verification.message||'A recolher histórico de previsões.'}</div>`;
   note.textContent='Este histórico não pode ser reconstruído a partir das previsões atuais; começa a acumular automaticamente com a v1.6.1.';
   return;
 }
 const model=$('#gx-verify-model').value,variable=$('#gx-verify-variable').value,meta=verificationMeta(),rows=(verification.samples||[]).filter(r=>r.observed?.[variable]!=null&&r[model]?.[variable]!=null);
 if(rows.length<2){host.innerHTML='<div class="gx-empty">Ainda não existem pontos suficientes para esta variável/modelo.</div>';stats.innerHTML='';return}
 const err=rows.map(r=>Number(r[model][variable])-Number(r.observed[variable])),mae=err.reduce((a,b)=>a+Math.abs(b),0)/err.length,bias=err.reduce((a,b)=>a+b,0)/err.length;
 stats.innerHTML=`<div class="gx-stat"><span>Erro absoluto médio</span><b>${fmt(mae,meta.dec)}${meta.unit}</b></div><div class="gx-stat"><span>Viés médio</span><b>${bias>0?'+':''}${fmt(bias,meta.dec)}${meta.unit}</b></div><div class="gx-stat"><span>Pontos comparados</span><b>${rows.length}</b></div><div class="gx-stat"><span>Antecedência</span><b>≈24 h</b></div>`;
 const W=1120,H=350,m={l:72,r:24,t:22,b:45},times=rows.map(r=>r.target_utc_ms),minT=Math.min(...times),maxT=Math.max(...times),vals=rows.flatMap(r=>[Number(r.observed[variable]),Number(r[model][variable])]),mn=Math.min(...vals),mx=Math.max(...vals),pad=(mx-mn)*.12||1,ymin=mn-pad,ymax=mx+pad,x=t=>m.l+(t-minT)/(maxT-minT||1)*(W-m.l-m.r),y=v=>m.t+(ymax-v)/(ymax-ymin)*(H-m.t-m.b);
 let s=`<svg viewBox="0 0 ${W} ${H}">`;
 for(let i=0;i<=4;i++){const v=ymin+(ymax-ymin)*i/4,yy=y(v);s+=`<line x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}" stroke="#e7edef"/><text x="${m.l-8}" y="${yy+4}" text-anchor="end" font-size="9" fill="#71828b">${fmt(v,meta.dec)}</text>`}
 s+=`<text class="gx-axis-unit" x="15" y="${(m.t+H-m.b)/2}" text-anchor="middle" transform="rotate(-90 15 ${(m.t+H-m.b)/2})">${meta.unit.trim()}</text>`;
 const ticks=Math.min(12,Math.max(4,rows.length-1));for(let i=0;i<=ticks;i++){const t=minT+(maxT-minT)*i/ticks,xx=x(t);s+=`<text x="${xx}" y="${H-17}" text-anchor="middle" font-size="8.5" fill="#72828b">${new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit'}).format(new Date(t))}</text>`}
 const obs=rows.map(r=>({ms:r.target_utc_ms,v:Number(r.observed[variable])})),fc=rows.map(r=>({ms:r.target_utc_ms,v:Number(r[model][variable])}));
 s+=`<path d="${linePath(obs,x,y)}" fill="none" stroke="#193f52" stroke-width="2.8"/><path d="${linePath(fc,x,y)}" fill="none" stroke="#c55448" stroke-width="2.3" stroke-dasharray="6 4"/>`;
 s+=`<text x="${m.l}" y="13" font-size="9" fill="#193f52">● Observado</text><text x="${m.l+90}" y="13" font-size="9" fill="#c55448">┄ Previsto ~24 h antes</text><line id="gx-vcross" x1="0" y1="${m.t}" x2="0" y2="${H-m.b}" stroke="#6c7d85" stroke-dasharray="3 4" visibility="hidden"/><rect id="gx-vhit" x="${m.l}" y="${m.t}" width="${W-m.l-m.r}" height="${H-m.t-m.b}" fill="transparent"/></svg>`;
 host.innerHTML=s+'<div class="gx-tooltip" id="gx-vtip"></div>';const svg=host.querySelector('svg'),hit=host.querySelector('#gx-vhit'),cross=host.querySelector('#gx-vcross'),tip=host.querySelector('#gx-vtip');hit.addEventListener('mousemove',ev=>{const rect=svg.getBoundingClientRect(),vx=(ev.clientX-rect.left)/rect.width*W,target=minT+(vx-m.l)/(W-m.l-m.r)*(maxT-minT),r=rows.reduce((a,b)=>Math.abs(b.target_utc_ms-target)<Math.abs(a.target_utc_ms-target)?b:a,rows[0]),xx=x(r.target_utc_ms),ob=Number(r.observed[variable]),fcv=Number(r[model][variable]),er=fcv-ob;cross.setAttribute('x1',xx);cross.setAttribute('x2',xx);cross.setAttribute('visibility','visible');tip.innerHTML=`<b>${dateTimeFmt(r.target_utc_ms)}</b><div class="gx-tooltip-row"><span>Observado</span><strong>${fmt(ob,meta.dec)}${meta.unit}</strong></div><div class="gx-tooltip-row"><span>Previsto</span><strong>${fmt(fcv,meta.dec)}${meta.unit}</strong></div><div class="gx-tooltip-row"><span>Erro</span><strong>${er>0?'+':''}${fmt(er,meta.dec)}${meta.unit}</strong></div>`;tip.style.display='block';tip.style.left=Math.min(rect.width-175,Math.max(5,ev.clientX-rect.left+12))+'px';tip.style.top=Math.max(8,ev.clientY-rect.top-35)+'px'});hit.addEventListener('mouseleave',()=>{cross.setAttribute('visibility','hidden');tip.style.display='none'});note.textContent=`${meta.label} · ${model==='best_match'?'Best Match':model.toUpperCase()} · passe o rato para comparar cada ponto.${variable==='precipitation'?' A precipitação prevista e observada representa o total da hora precedente.':''}`;
}
async function loadVerification(){
 try{verification=await getJson('forecast-verification.json')}catch(e){verification={available:false,collecting:true,archive_records:0,matched_samples:0,message:'O arquivo de verificação ainda está a ser criado.'}}
 renderVerification();
}


function exportPNG(){
 const svg=document.querySelector('#gx-svg');if(!svg)return;
 const clone=svg.cloneNode(true);
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 clone.setAttribute('width','1400');clone.setAttribute('height','525');
 const cross=clone.querySelector('#gx-cross');if(cross)cross.setAttribute('visibility','hidden');
 const xml=new XMLSerializer().serializeToString(clone),blob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();
 img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=525;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ranhados-${category}-${period}.png`;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},100)},'image/png')};
 img.src=url;
}

function initUI(){
 $('#gx-categories').innerHTML=Object.entries(CATS).map(([k,c])=>`<button class="gx-category" data-cat="${k}" type="button">${icon(c.icon)}<span>${c.label}</span></button>`).join('');
 document.querySelectorAll('.gx-category').forEach(b=>b.onclick=()=>{category=b.dataset.cat;activeKeys=new Set();if(category==='agro'&&['24h','7d','30d'].includes(period)){loadPeriod('90d');return}render()});
 document.querySelectorAll('#gx-periods button').forEach(b=>b.onclick=()=>{const p=b.dataset.period;activeKeys=new Set();compareKey='';if(category==='agro'&&['24h','7d','30d'].includes(p))category='temp';loadPeriod(p)});
 $('#gx-compare').onchange=e=>{
   compareKey=e.target.value;
   if(compareKey){
     const defs=catSeries().filter(s=>activeKeys.has(s[0])&&available(s)),primaryUnit=defs[0]?.[2]||'',cmpUnit=valMeta(compareKey)[2]||'';
     if(cmpUnit&&cmpUnit!==primaryUnit)activeKeys=new Set(defs.filter(d=>(d[2]||'')===primaryUnit).map(d=>d[0]));
   }
   render();
 };
 $('#gx-export-csv').onclick=exportCSV;
 $('#gx-export-png').onclick=exportPNG;
 $('#gx-verify-model').onchange=renderVerification;
 $('#gx-verify-variable').onchange=renderVerification;
}
async function init(){
 initUI();
 try{manifest=await getJson('manifest.json')}catch(e){manifest={period_labels:{'24h':'24 horas','7d':'7 dias','30d':'30 dias','90d':'90 dias',year:'Este ano',all:'Toda a série'}}}
 await loadPeriod('24h');
 await loadVerification();
}
init();
