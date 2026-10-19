/* Sterling Management Reports — bottom tab bar + offline/install support */
(function(){
  var here=(location.pathname.split('/').pop()||'index.html');
  var T=[['index.html','⌂','Home'],['merchandising-kpi.html','🎯','Merch KPI'],['revenue.html','$','Revenue & CM']];
  var n=document.createElement('nav'); n.className='atabs'; n.setAttribute('aria-label','Main');
  n.innerHTML=T.map(function(t){return '<a href="'+t[0]+'"'+(here===t[0]?' class="on" aria-current="page"':'')+'><span class="ti">'+t[1]+'</span>'+t[2]+'</a>';}).join('');
  document.body.appendChild(n);
  if('serviceWorker' in navigator && location.protocol.indexOf('http')===0) navigator.serviceWorker.register('sw.js').catch(function(){});
})();
