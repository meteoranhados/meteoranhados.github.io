(() => {
  const LEVEL={yellow:1,orange:2,red:3};
  const LEVEL_NAME={yellow:'Aviso amarelo',orange:'Aviso laranja',red:'Aviso vermelho'};
  const host=document.getElementById('ranhados-ipma-warning');
  if(!host)return;
  const dt=s=>{if(!s)return null;const d=new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s)?s:s+'Z');return Number.isNaN(d.getTime())?null:d};
  const fmt=d=>d?d.toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
  const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const iconMarkup=type=>{
    const t=norm(type);
    const common='viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    if(t.includes('precip')||t.includes('chuva'))return `<svg ${common}><path d="M7 17h10a4 4 0 0 0 .4-7.98A6 6 0 0 0 6.1 8.3 4.5 4.5 0 0 0 7 17Z"/><path d="m8 20 1-2m3 2 1-2m3 2 1-2"/></svg>`;
    if(t.includes('vento'))return `<svg ${common}><path d="M3 8h11c3 0 3-4 .5-4-1.3 0-2 .7-2.4 1.4M3 12h16c3 0 3 4 .5 4-1.2 0-2-.7-2.4-1.4M3 16h8"/></svg>`;
    if(t.includes('quente')||t.includes('calor'))return `<svg ${common}><path d="M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0Z"/><path d="M12 8v8"/></svg>`;
    if(t.includes('frio')||t.includes('neve')||t.includes('gelo'))return `<svg ${common}><path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5l-15.6 11M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5"/></svg>`;
    if(t.includes('trovo'))return `<svg ${common}><path d="M7 15h10a4 4 0 0 0 .4-7.98A6 6 0 0 0 6.1 6.3 4.5 4.5 0 0 0 7 15Z"/><path d="m13 13-3 5h3l-2 4 5-6h-3l2-3"/></svg>`;
    if(t.includes('nevo'))return `<svg ${common}><path d="M4 8h16M2 12h15M6 16h16"/></svg>`;
    if(t.includes('agit')||t.includes('marit')||t.includes('ond'))return `<svg ${common}><path d="M2 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/></svg>`;
    return `<svg ${common}><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>`;
  };
  const icon=type=>{const s=document.createElement('span');s.className='ranhados-warning-icon';s.innerHTML=iconMarkup(type);return s};
  const uniqueTypes=rows=>{const seen=new Set(),out=[];rows.forEach(w=>{const k=norm(w.type);if(!seen.has(k)){seen.add(k);out.push(w.type)}});return out};
  async function run(){
    try{
      const r=await fetch('/climate/ipma_warnings.json',{cache:'no-store'});if(!r.ok)return;
      const d=await r.json(),now=new Date();
      const rows=(d.warnings||[]).filter(w=>LEVEL[w.level]&&(!dt(w.endTime)||dt(w.endTime)>=now));
      if(!rows.length){host.className='ranhados-ipma-warning';host.replaceChildren();return}
      const highest=rows.reduce((a,w)=>LEVEL[w.level]>LEVEL[a.level]?w:a,rows[0]).level;
      rows.sort((a,b)=>LEVEL[b.level]-LEVEL[a.level]||(a.status==='active'?0:1)-(b.status==='active'?0:1)||(a.startTime||'').localeCompare(b.startTime||''));
      const types=uniqueTypes(rows),active=rows.filter(w=>w.status==='active').length,future=rows.length-active;
      host.className=`ranhados-ipma-warning is-${highest}`;host.replaceChildren();
      const inner=document.createElement('div');inner.className='ranhados-ipma-warning__inner';
      const badge=document.createElement('span');badge.className='ranhados-ipma-warning__badge';badge.textContent=LEVEL_NAME[highest];
      const phenomena=document.createElement('div');phenomena.className='ranhados-ipma-warning__phenomena';
      types.forEach(t=>{const item=document.createElement('span');item.className='ranhados-ipma-warning__phenomenon';item.append(icon(t));const tx=document.createElement('span');tx.textContent=t;item.append(tx);phenomena.append(item)});
      const main=document.createElement('div');main.className='ranhados-ipma-warning__main';
      const title=document.createElement('strong');title.textContent=types.length>1?'Avisos IPMA':types[0];
      const meta=document.createElement('span');meta.textContent=`${d.area_name||'Distrito da Guarda'} · ${rows.length} aviso${rows.length===1?'':'s'}${active?` · ${active} em vigor`:''}${future?` · ${future} previsto${future===1?'':'s'}`:''}`;
      main.append(title,meta);inner.append(badge,phenomena,main);host.append(inner);
      const details=document.createElement('details');details.className='ranhados-ipma-warning__details';
      const sum=document.createElement('summary');sum.textContent=rows.length>1?'Ver todos os avisos':'Ver detalhe do aviso';
      const list=document.createElement('div');list.className='ranhados-ipma-warning__list';
      rows.forEach(w=>{const card=document.createElement('div');card.className=`ranhados-ipma-warning__item is-${w.level}`;const head=document.createElement('div');head.className='ranhados-ipma-warning__itemhead';head.append(icon(w.type));const wrap=document.createElement('div');const h=document.createElement('strong');h.textContent=`${LEVEL_NAME[w.level]} · ${w.type}`;const t=document.createElement('span');t.textContent=`${fmt(dt(w.startTime))} → ${fmt(dt(w.endTime))}`;wrap.append(h,t);head.append(wrap);card.append(head);if(w.text){const p=document.createElement('p');p.textContent=w.text;card.append(p)}list.append(card)});
      const source=document.createElement('small');source.textContent=`Fonte: IPMA, I.P.${d.stale?' · última leitura válida em cache':''}`;list.append(source);details.append(sum,list);host.append(details);
    }catch(e){console.warn('Avisos IPMA indisponíveis',e)}
  }
  async function runStationStatus(){
    const el=document.getElementById('ranhados-station-status');if(!el)return;
    try{
      const r=await fetch('/estado/status.json',{cache:'no-store'});if(!r.ok)return;
      const d=await r.json(),name={ok:'Estação OK',attention:'Atenção',critical:'Problema'}[d.overall]||'Estado';
      el.className=`ranhados-shell__status is-${d.overall||'unknown'}`;
      const label=el.childNodes[el.childNodes.length-1];if(label)label.textContent=name;
      el.title=`Estado técnico · gerado ${d.generated_utc||''}`;
    }catch(e){}
  }
  run();setInterval(run,300000);runStationStatus();setInterval(runStationStatus,300000);
})();