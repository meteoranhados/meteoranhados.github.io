
const $=q=>document.querySelector(q);
const fmt=(v,d=1)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('pt-PT',{minimumFractionDigits:d,maximumFractionDigits:d});
const monthNames=['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const week=['S','T','Q','Q','S','S','D'];
const dateText=s=>new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(s+'T12:00:00'));
let data=null,current=null,year=null,mode='tmean',selectedDate=null;
async function getJson(u){const r=await fetch(u+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json()}
function lerp(a,b,t){return Math.round(a+(b-a)*t)}
function rgb(a,b,t){return `rgb(${lerp(a[0],b[0],t)},${lerp(a[1],b[1],t)},${lerp(a[2],b[2],t)})`}
function tempColor(v,min=-2,max=30){let t=Math.max(0,Math.min(1,(Number(v)-min)/(max-min)));if(t<.5)return rgb([55,126,166],[242,243,220],t*2);return rgb([242,243,220],[196,73,61],(t-.5)*2)}
function rainColor(v){v=Number(v);if(v<=0)return'#f8fafb';let t=Math.min(1,Math.log1p(v)/Math.log1p(40));return rgb([223,239,246],[35,111,147],t)}
function cellStyle(d){
 if(!d)return'';
 if(mode==='tmean')return `background:${tempColor(d.tmean,-2,28)}`;
 if(mode==='tmax')return `background:${tempColor(d.tmax,0,40)}`;
 if(mode==='tmin')return `background:${tempColor(d.tmin,-8,22)}`;
 if(mode==='rain')return `background:${rainColor(d.rain)};color:${d.rain>10?'#fff':''}`;
 return 'background:#f8fafb';
}
function legend(){
 const h=$('#cx-legend');
 if(mode==='rain')h.innerHTML='<span>0 mm</span><i style="background:#f8fafb"></i><i style="background:#b9dbe9"></i><i style="background:#5b9fbd"></i><i style="background:#236f93"></i><span>≥40 mm</span>';
 else if(mode==='extremes')h.innerHTML='<span>● ≥30 °C</span><span style="color:#c64f43">● &gt;35 °C</span><span style="color:#8a5f9e">● noite tropical</span><span style="color:#3d82aa">● geada</span><span style="color:#2c7598">● chuva intensa</span>';
 else h.innerHTML='<span>frio</span><i style="background:#377ea6"></i><i style="background:#d7dfdb"></i><i style="background:#f2e7bd"></i><i style="background:#c4493d"></i><span>quente</span>';
}
function dayMap(){return new Map((data.days||[]).filter(d=>d.year===Number(year)).map(d=>[d.date,d]))}
function liveToday(){
 const d=current?.data||{},now=new Date(),iso=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 if(Number(year)!==now.getFullYear())return null;
 return {date:iso,year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate(),tmin:d.tempTL,tmax:d.tempTH,tmean:null,rain:d.rfall,wind_gust_max:d.wgustTM,uv_max_day:d.UVTH,sunshine_hours:d.SunshineHours,live:true};
}
function renderCalendar(){
 const map=dayMap(),live=liveToday();if(live&&!map.has(live.date))map.set(live.date,live);
 let out='';
 const now=new Date();
 for(let m=1;m<=12;m++){
   const first=new Date(Number(year),m-1,1),days=new Date(Number(year),m,0).getDate(),start=(first.getDay()+6)%7;
   let cells=Array.from({length:start},()=>'<div class="cx-day empty"></div>');
   for(let day=1;day<=days;day++){
     const iso=`${year}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`,dt=new Date(Number(year),m-1,day),d=map.get(iso);
     const future=dt>now;
     if(future){cells.push(`<div class="cx-day future">${day}</div>`);continue}
     if(!d){cells.push(`<div class="cx-day missing" data-date="${iso}">${day}</div>`);continue}
     let markers='';
     if(mode==='extremes'){
       const f=d.flags||{};
       if(f.tmax_ge_30||Number(d.tmax)>=30)markers+='<i class="dot hot"></i>';
       if(f.tmax_gt_35||Number(d.tmax)>35)markers+='<i class="dot hot"></i>';
       if(f.tropical_night||Number(d.tmin)>=20)markers+='<i class="dot tropical"></i>';
       if(f.frost||Number(d.tmin)<0)markers+='<i class="dot frost"></i>';
       if(f.rain_gt_10||Number(d.rain)>10)markers+='<i class="dot rain"></i>';
     }
     cells.push(`<div class="cx-day ${d.live?'today-live':''}" data-date="${iso}" style="${mode==='extremes'?'':cellStyle(d)}">${day}<span class="markers">${markers}</span></div>`);
   }
   out+=`<section class="cx-month"><h3>${monthNames[m]}</h3><div class="cx-weekdays">${week.map(x=>`<span>${x}</span>`).join('')}</div><div class="cx-days">${cells.join('')}</div></section>`;
 }
 $('#cx-calendar').innerHTML=out;
 $('#cx-calendar').querySelectorAll('.cx-day[data-date]').forEach(el=>el.onclick=()=>selectDate(el.dataset.date));
 legend();
}
function renderSummary(){
 const s=data.year_summaries?.[String(year)];if(!s){$('#cx-summary').innerHTML='';return}
 const cards=[
  ['Cobertura',`${fmt(s.coverage_pct,1)}%`,`${s.days_present}/${s.days_expected} dias`],
  ['Dia mais quente',`${fmt(s.hottest_day?.value_c,1)} °C`,s.hottest_day?dateText(s.hottest_day.date):''],
  ['Noite mais fria',`${fmt(s.coldest_night?.value_c,1)} °C`,s.coldest_night?dateText(s.coldest_night.date):''],
  ['Dia mais chuvoso',`${fmt(s.wettest_day?.value_mm,1)} mm`,s.wettest_day?dateText(s.wettest_day.date):''],
  ['Dias >35 °C',s.tmax_gt_35,''],
  ['Maior período seco',`${s.longest_dry_spell?.max_streak_days||0} dias`,s.longest_dry_spell?.max_streak_start?`${dateText(s.longest_dry_spell.max_streak_start)} — ${dateText(s.longest_dry_spell.max_streak_end)}`:'']
 ];
 $('#cx-summary').innerHTML=cards.map(x=>`<div class="cx-stat"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join('');
}
function detailMetrics(d){
 if(!d)return'<p>Sem registo diário.</p>';
 const arr=[['T mínima',`${fmt(d.tmin,1)} °C`],['T média',d.tmean==null?'dia em curso':`${fmt(d.tmean,1)} °C`],['T máxima',`${fmt(d.tmax,1)} °C`],['Precipitação',`${fmt(d.rain,1)} mm`],['Rajada máxima',d.wind_gust_max==null?'—':`${fmt(d.wind_gust_max,1)} km/h`],['UV máximo',fmt(d.uv_max_day,1)],['Horas de sol',d.sunshine_hours==null?'—':`${fmt(d.sunshine_hours,1)} h`],['ET',d.et_mm==null?'—':`${fmt(d.et_mm,2)} mm`]];
 return arr.map(x=>`<div class="cx-metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
}
function historyRows(month,day){
 const key=`${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,rows=[...(data.same_calendar_day?.[key]||[])];
 const live=liveToday();if(live&&live.month===month&&live.day===day)rows.push({year:live.year,date:live.date,tmin:live.tmin,tmax:live.tmax,tmean:null,rain:live.rain,live:true});
 rows.sort((a,b)=>a.year-b.year);return rows;
}
function selectDate(iso){
 selectedDate=iso;history.replaceState(null,'',`?date=${iso}`);const [y,m,d]=iso.split('-').map(Number),map=dayMap(),live=liveToday(),row=map.get(iso)||(live?.date===iso?live:null);
 $('#cx-day-title').textContent=`${d} de ${monthNames[m].toLowerCase()} de ${y}${row?.live?' · em curso':''}`;
 $('#cx-day-detail').innerHTML=detailMetrics(row);
 const rows=historyRows(m,d);$('#cx-history-title').textContent=`${d} de ${monthNames[m].toLowerCase()} ao longo dos anos`;
 $('#cx-history').innerHTML=rows.map(r=>`<div class="cx-history-row ${r.live?'current':''}"><b>${r.year}${r.live?' *':''}</b><span>${fmt(r.tmin,1)} / ${fmt(r.tmax,1)} °C</span><span>${r.tmean==null?'—':fmt(r.tmean,1)+' °C'}</span><span>${fmt(r.rain,1)} mm</span></div>`).join('')+(rows.some(r=>r.live)?'<p style="font-size:8px;color:#7f8d94">* Hoje está em curso; não é usado para ranking até o dia fechar.</p>':'');
}
function setMode(m){mode=m;document.querySelectorAll('#cx-modes button').forEach(b=>b.classList.toggle('is-active',b.dataset.mode===mode));const names={tmean:'Temperatura média diária',rain:'Precipitação diária',tmax:'Temperatura máxima diária',tmin:'Temperatura mínima diária',extremes:'Extremos e limiares'};$('#cx-kicker').textContent=names[m];$('#cx-desc').textContent=m==='extremes'?'Marcadores assinalam dias que ultrapassaram limiares meteorológicos.':'Clique num dia para ver detalhe e comparar a mesma data entre anos.';renderCalendar()}
function setYear(y){year=Number(y);document.querySelectorAll('#cx-years button').forEach(b=>b.classList.toggle('is-active',Number(b.dataset.year)===year));$('#cx-title').textContent=year;renderSummary();renderCalendar();}
async function init(){
 [data,current]=await Promise.all([getJson('/api/v1/calendar.json'),getJson('/api/v1/current.json').catch(()=>null)]);
 $('#cx-series').textContent=`Série ${dateText(data.series_start)} — ${dateText(data.series_end)}`;
 $('#cx-years').innerHTML=(data.years||[]).map(y=>`<button data-year="${y}">${y}</button>`).join('');
 document.querySelectorAll('#cx-years button').forEach(b=>b.onclick=()=>setYear(b.dataset.year));
 document.querySelectorAll('#cx-modes button').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
 const requested=new URLSearchParams(location.search).get('date'),last=data.series_end;year=requested&&/^\d{4}-\d{2}-\d{2}$/.test(requested)?Number(requested.slice(0,4)):Math.max(...data.years);setMode('tmean');setYear(year);const initial=requested&&data.days?.some(d=>d.date===requested)?requested:last;const iy=Number(initial.slice(0,4));if(iy!==year)setYear(iy);selectDate(initial);$('#cx-latest').onclick=()=>{const d=data.series_end;setYear(Number(d.slice(0,4)));selectDate(d)};
}
init();