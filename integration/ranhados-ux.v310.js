/* Meteo Ranhados · UX & acessibilidade progressiva v3.1.0
   Não interfere nos valores, escalas ou funções de dados da estação. */
(()=>{'use strict';
 const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
 ready(()=>{
   const shell=document.querySelector('.ranhados-shell');
   if(!shell)return;
   const groups=[...shell.querySelectorAll('[data-rh-dropdown]')];
   groups.forEach(group=>{
     group.addEventListener('toggle',()=>{if(group.open)groups.filter(g=>g!==group).forEach(g=>g.open=false)});
     group.querySelector('summary')?.addEventListener('keydown',event=>{
       if((event.key==='ArrowDown'||event.key==='Enter'||event.key===' ')&&event.key==='ArrowDown'){
         event.preventDefault();group.open=true;group.querySelector('a')?.focus();
       }
     });
     group.addEventListener('keydown',event=>{
       if(event.key==='Escape'&&group.open){event.preventDefault();group.open=false;group.querySelector('summary')?.focus()}
     });
   });
   document.addEventListener('pointerdown',event=>{groups.forEach(g=>{if(g.open&&!g.contains(event.target))g.open=false})});
   const toggle=document.getElementById('ranhados-more-toggle');
   const sheet=document.getElementById('ranhados-more-sheet');
   if(toggle&&sheet){
     const panel=sheet.querySelector('[role="dialog"]');
     let opener=null,wasVisible=false;
     const visible=()=>!sheet.hidden;
     const focusables=()=>[...sheet.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length);
     toggle.addEventListener('click',()=>{
       if(visible()){
         opener=toggle;wasVisible=true;
         // old shell toggles hidden in the same click event; defer focus to after handler
         queueMicrotask(()=>{if(visible()){panel?.focus();sheet.querySelector('[data-rh-more-close]')?.focus()}});
       }
     });
     sheet.querySelectorAll('[data-rh-more-close]').forEach(close=>close.addEventListener('click',()=>{queueMicrotask(()=>toggle.focus())}));
     document.addEventListener('keydown',event=>{
       if(event.key==='Escape'&&visible()){queueMicrotask(()=>toggle.focus());return}
       if(event.key!=='Tab'||!visible())return;
       const fs=focusables();if(!fs.length)return;
       const first=fs[0],last=fs[fs.length-1];
       if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
       else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
     });
     // On resize to desktop, dismiss the sheet safely.
     const desktop=matchMedia('(min-width: 951px)');
     const onDesktop=()=>{if(desktop.matches&&!sheet.hidden){sheet.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.classList.remove('ranhados-chart-lock')}};
     desktop.addEventListener?.('change',onDesktop);
   }
   // ARIA labels for data controls that are populated dynamically by individual modules.
   const labelMap={
     'fx-ensemble-var':'Variável da previsão probabilística',
     'wind-year':'Ano a analisar nos registos de vento','wind-month':'Mês a analisar nos registos de vento',
     'wind-rose-mode':'Indicador da rosa dos ventos',
     'temp-year':'Ano da temperatura','temp-month':'Mês da temperatura','temp-variable':'Indicador térmico',
     'rain-year':'Ano da precipitação',
   };
   Object.entries(labelMap).forEach(([id,label])=>{
     const el=document.getElementById(id);
     if(el&&!el.labels?.length&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',label);
   });
   // Restore keyboard shortcuts without overriding other interactive input fields.
   document.addEventListener('keydown',event=>{
     if(event.key==='Escape')groups.forEach(g=>g.open=false);
   });
   // Accessible chart/table fallback prompt. Only a hint; charts keep their own rendering.
   document.querySelectorAll('.interactive-chart,.fx-chart,.gx-chart,.ox-chart,.recent-chart').forEach(el=>{
     if(!el.hasAttribute('role'))el.setAttribute('role','group');
     if(!el.hasAttribute('aria-label')&&!el.hasAttribute('aria-labelledby')){
       const title=el.closest('.panel,.fx-panel,.gx-panel,.ox-panel,.recent-panel')?.querySelector('h2,h3');
       if(title?.textContent.trim())el.setAttribute('aria-label','Gráfico: '+title.textContent.trim());
     }
   });
 });
})();
