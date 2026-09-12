(()=>{
 const svg=(body,label='',cls='')=>`<span class="wx-glyph ${cls}"${label?` role="img" aria-label="${label}"`:' aria-hidden="true"'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${body}</svg></span>`;
 const SUN='<circle cx="12" cy="12" r="3.7"/><path d="M12 2v2.3m0 15.4V22M4.9 4.9l1.6 1.6m11 11 1.6 1.6M2 12h2.3m15.4 0H22M4.9 19.1l1.6-1.6m11-11 1.6-1.6"/>';
 const MOON='<path d="M19.5 15.4A8 8 0 0 1 8.6 4.5 8 8 0 1 0 19.5 15.4Z"/>';
 const CLOUD='<path d="M6.2 18h11.2a3.6 3.6 0 0 0 .4-7.2A5.7 5.7 0 0 0 7 9.8 4.2 4.2 0 0 0 6.2 18Z"/>';
 const cloud=(extra='')=>CLOUD+extra;
 const map={
  sun:SUN, moon:MOON, cloud:CLOUD,
  partly:`<circle cx="8" cy="7.5" r="3"/><path d="M8 2.5v1.4M2.9 7.5h1.4M4.4 3.9l1 1"/>${CLOUD}`,
  partlyNight:`${MOON}${CLOUD}`,
  fog:`${CLOUD}<path d="M4 20h16M6.5 16.2h11"/>`,
  drizzle:cloud('<path d="m8 20 .8-1.4m3.2 1.4.8-1.4m3.2 1.4.8-1.4"/>'),
  rain:cloud('<path d="m8 19-1 2.2m5-2.2-1 2.2m5-2.2-1 2.2"/>'),
  showers:cloud('<path d="m8 19-1 2.2m5-2.2-1 2.2m5-2.2-1 2.2"/><path d="M4 5.5h2m-1-1v2"/>'),
  snow:`${CLOUD}<path d="M8 19v3m-1.3-2.2 2.6 1.4m0-1.4-2.6 1.4M15 19v3m-1.3-2.2 2.6 1.4m0-1.4-2.6 1.4"/>`,
  storm:cloud('<path d="m13 17-3 4h2l-1 3 4-5h-2l2-2"/>'),
  rainUi:'<path d="M12 3s5.5 5.8 5.5 10.3a5.5 5.5 0 0 1-11 0C6.5 8.8 12 3 12 3Z"/>',
  windUi:'<path d="M3 8h11c3 0 3-4 .4-4-1.4 0-2.1.8-2.5 1.5M3 12h16c3 0 3 4 .4 4-1.4 0-2.1-.8-2.5-1.5M3 16h7"/>'
 };
 function kind(code,isDay=1){code=Number(code);if(code===0)return isDay?'sun':'moon';if(code<=2)return isDay?'partly':'partlyNight';if(code===3)return'cloud';if(code===45||code===48)return'fog';if(code>=51&&code<=57)return'drizzle';if(code>=61&&code<=67)return'rain';if(code>=71&&code<=77)return'snow';if(code>=80&&code<=82)return'showers';if(code>=85&&code<=86)return'snow';if(code>=95)return'storm';return'cloud'}
 function text(code){code=Number(code);if(code===0)return'Céu limpo';if(code===1)return'Pouco nublado';if(code===2)return'Parcialmente nublado';if(code===3)return'Encoberto';if(code===45||code===48)return'Nevoeiro';if(code>=51&&code<=57)return'Chuvisco';if(code>=61&&code<=67)return'Chuva';if(code>=71&&code<=77)return'Neve';if(code>=80&&code<=82)return'Aguaceiros';if(code>=85&&code<=86)return'Aguaceiros de neve';if(code>=95)return'Trovoada';return'Condições variáveis'}
 function icon(code,isDay=1,cls=''){const k=kind(code,isDay);return svg(map[k],text(code),`is-${k} ${cls}`)}
 function ui(name,cls=''){const k=name==='wind'?'windUi':'rainUi';return svg(map[k],'',`is-ui ${cls}`)}
 window.MeteoWeather={icon,text,kind,ui};
})();
