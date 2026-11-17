
(() => {
  const q=document.getElementById('ev-q'), yr=document.getElementById('ev-year'), kind=document.getElementById('ev-type');
  q?.closest('form')?.addEventListener('submit', e=>e.preventDefault());
  const cards=[...document.querySelectorAll('.ev-card[data-year]')], counter=document.getElementById('ev-count');
  if(!q||!yr||!kind)return;
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const run=()=>{const txt=norm(q.value);let shown=0;cards.forEach(c=>{
    const ok=(!txt||norm(c.dataset.search).includes(txt))&&(!yr.value||c.dataset.year===yr.value)&&(!kind.value||c.dataset.type===kind.value);
    c.classList.toggle('ev-hidden',!ok);shown+=ok?1:0;
  });counter.textContent=`${shown} episódio${shown===1?'':'s'} apresentado${shown===1?'':'s'}`;
  document.getElementById('ev-empty').hidden=shown!==0;
  };
  [q,yr,kind].forEach(el=>el.addEventListener(el===q?'input':'change',run));run();
})();
