(() => {
  if (window.__meteoRanhadosAssistantLoaded) return;
  window.__meteoRanhadosAssistantLoaded = true;

  const ASSISTANT_URL = 'https://zimaos.tailf61a63.ts.net/widget?embed=1';
  const host = document.createElement('div');
  host.id = 'meteo-ranhados-assistant-host';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483000';
  host.style.right = '18px';
  host.style.bottom = '18px';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  const root = host.attachShadow({mode:'open'});
  root.innerHTML = `
    <style>
      :host{all:initial}
      *{box-sizing:border-box}
      .launcher,.panel{pointer-events:auto;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      .launcher{display:flex;align-items:center;gap:9px;border:0;border-radius:999px;background:#17384e;color:#fff;padding:12px 16px;box-shadow:0 12px 34px rgba(16,31,43,.24);cursor:pointer;font-weight:700;font-size:13px;letter-spacing:.01em}
      .launcher:hover{transform:translateY(-1px)}
      .spark{width:9px;height:9px;border-radius:50%;background:#79c59c;box-shadow:0 0 0 4px rgba(121,197,156,.16)}
      .panel{display:none;position:absolute;right:0;bottom:0;width:390px;height:min(560px,calc(100vh - 36px));background:#fff;border:1px solid rgba(23,56,78,.15);border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(16,31,43,.28)}
      .panel.open{display:flex;flex-direction:column}
      .panel.large{width:min(720px,calc(100vw - 36px));height:min(760px,calc(100vh - 36px))}
      .panel.min{height:54px;width:300px}
      .panel.min .framewrap{display:none}
      .bar{height:54px;flex:0 0 54px;display:flex;align-items:center;gap:10px;padding:0 10px 0 15px;background:linear-gradient(180deg,#fff,#f7f9fa);border-bottom:1px solid #e1e6ea;color:#18212b}
      .panel.min .bar{border-bottom:0}
      .title{min-width:0;flex:1}.title b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.title span{display:block;font-size:11px;color:#707c87;margin-top:2px}
      .tool{width:32px;height:32px;border:0;border-radius:9px;background:transparent;color:#46535e;cursor:pointer;font-size:17px;line-height:32px;text-align:center}.tool:hover{background:#edf1f3}
      .framewrap{flex:1;min-height:0;background:#f6f8fa}.frame{width:100%;height:100%;border:0;display:block;background:#fff}
      @media(max-width:560px){
        .panel,.panel.large{position:fixed;right:8px;bottom:8px;width:calc(100vw - 16px);height:min(72vh,620px);border-radius:16px}
        .panel.min{position:absolute;right:0;bottom:0;width:280px;height:54px}
      }
      @media(prefers-reduced-motion:no-preference){.launcher,.panel{transition:width .18s ease,height .18s ease,transform .18s ease,opacity .18s ease}}
    </style>
    <button class="launcher" type="button" aria-label="Abrir Assistente Meteo Ranhados"><span class="spark"></span><span>Pergunte à estação</span></button>
    <section class="panel" role="dialog" aria-label="Assistente Meteo Ranhados">
      <div class="bar">
        <span class="spark"></span>
        <div class="title"><b>Assistente Meteo Ranhados</b><span>Continua a ver o site enquanto pergunta</span></div>
        <button class="tool minimize" type="button" title="Minimizar" aria-label="Minimizar">−</button>
        <button class="tool expand" type="button" title="Aumentar" aria-label="Aumentar">↗</button>
        <button class="tool close" type="button" title="Fechar" aria-label="Fechar">×</button>
      </div>
      <div class="framewrap"><iframe class="frame" title="Assistente Meteo Ranhados" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="clipboard-write"></iframe></div>
    </section>`;

  const launcher = root.querySelector('.launcher');
  const panel = root.querySelector('.panel');
  const frame = root.querySelector('.frame');
  const minimize = root.querySelector('.minimize');
  const expand = root.querySelector('.expand');
  const close = root.querySelector('.close');
  let loaded = false;

  function openPanel(){
    if(!loaded){ frame.src = ASSISTANT_URL; loaded = true; }
    panel.classList.add('open');
    panel.classList.remove('min');
    launcher.style.display='none';
    try{localStorage.setItem('meteoAssistantOpen','1')}catch(e){}
  }
  function closePanel(){
    panel.classList.remove('open','min','large');
    launcher.style.display='flex';
    try{localStorage.setItem('meteoAssistantOpen','0')}catch(e){}
  }
  launcher.addEventListener('click',openPanel);
  close.addEventListener('click',closePanel);
  minimize.addEventListener('click',()=>{
    panel.classList.toggle('min');
    if(panel.classList.contains('min')) panel.classList.remove('large');
  });
  expand.addEventListener('click',()=>{
    panel.classList.remove('min');
    panel.classList.toggle('large');
  });

  try{if(localStorage.getItem('meteoAssistantOpen')==='1')openPanel();}catch(e){}
})();
