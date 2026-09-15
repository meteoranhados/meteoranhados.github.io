const $=q=>document.querySelector(q);let cfg={},meta={},loadedAt=Date.now();
async function load(){
 try{const r=await fetch('/contact-public.json?t='+Date.now(),{cache:'no-store'});cfg=r.ok?await r.json():{}}catch(e){}
 try{const r=await fetch('/site-meta.json?t='+Date.now(),{cache:'no-store'});meta=r.ok?await r.json():{}}catch(e){}
 let origin=location.href;try{if(document.referrer&&new URL(document.referrer).origin===location.origin)origin=document.referrer}catch(e){}
 $('#ct-origin').textContent=origin;
 if(!cfg.api_url){setStatus('O serviço de contacto está temporariamente indisponível.','error');$('#ct-send').disabled=true}
}
function setStatus(text,kind=''){const el=$('#ct-status');el.textContent=text;el.className='ct-status'+(kind?' is-'+kind:'')}
function validEmail(s){return !s||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)}
$('#ct-form').addEventListener('submit',async ev=>{
 ev.preventDefault();
 if(!cfg.api_url){setStatus('O serviço de contacto está temporariamente indisponível.','error');return}
 const message=$('#ct-message').value.trim(),reply=$('#ct-reply').value.trim();
 if(message.length<10){setStatus('Escreva uma mensagem um pouco mais detalhada.','error');$('#ct-message').focus();return}
 if(!validEmail(reply)){setStatus('O email para resposta não parece válido.','error');$('#ct-reply').focus();return}
 const btn=$('#ct-send');btn.disabled=true;setStatus('A enviar…');
 const payload={type:$('#ct-type').value,subject:$('#ct-subject').value.trim(),message,reply_email:reply,website:$('#ct-website').value,page:$('#ct-origin').textContent,version:meta.version||'—',started_at:loadedAt};
 try{
   const r=await fetch(cfg.api_url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
   let d={};try{d=await r.json()}catch(e){}
   if(!r.ok)throw new Error(d.message||d.error||'Não foi possível enviar.');
   setStatus('Mensagem enviada com sucesso. Obrigado pelo contacto.','ok');
   $('#ct-subject').value='';$('#ct-message').value='';$('#ct-reply').value='';$('#ct-website').value='';loadedAt=Date.now();
 }catch(e){setStatus('Não foi possível enviar agora. Tente novamente dentro de alguns minutos.','error')}
 finally{btn.disabled=false}
});
load();