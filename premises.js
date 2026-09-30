// Curated listings are a dated snapshot. Missing addresses never get invented pins.
window.Premises=(()=>{
  let data=null,selected=null,sort='default',loading=true,error=false,homeRequest=0;
  const markers=[],geometryCache=new Map();
  const content=document.getElementById('premisesContent'),dialog=document.getElementById('premisesCompare');
  const active=()=>document.body.dataset.view==='premises';
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=n=>formatNumber(n);
  const euro=n=>`${num(Math.round(n))} €`;
  const rent=item=>item.rent===null?'По запросу':`${item.rentPrefix}${euro(item.rent)}/мес.`;
  const stats=item=>item.analysis?.[activeCategory];
  const date=()=>new Date(data.checkedAt+'T12:00:00').toLocaleDateString(window.Locale?.current()==='en'?'en-GB':'ru-RU');
  const old=()=>Date.now()-new Date(data.checkedAt+'T00:00:00Z').getTime()>14*86400000;
  const external=(url,label)=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  const status=()=>`<p class="premises-disclaimer">${old()?'Снимок устарел — перепроверьте условия. ':''}Объявления проверены ${date()}. Свободность владельцем не подтверждена. Ручная подборка, не весь рынок.</p>`;
  function clearHomes(){homeRequest++;map.getSource('premises-homes')?.setData(featureCollection());if(mapReady)BuildingView.focus(map,false);}
  function setMode(enabled){
    if(enabled===active())return;
    Catchments.hide();closeDrawer();clearHomes();selected=null;
    document.body.dataset.view=enabled?'premises':'business';
    document.body.classList.remove('premises-map-only');
    document.getElementById('premisesMode').setAttribute('aria-pressed',String(enabled));
    document.getElementById('businessMode').setAttribute('aria-pressed',String(!enabled));
    mobileLabel();refresh();map.resize();
  }
  function mobileLabel(){const hidden=document.body.classList.contains('premises-map-only');const b=document.getElementById('premisesMobile');b.textContent=hidden?'Показать помещения':'Показать карту';b.setAttribute('aria-expanded',String(!hidden));}
  function refresh(){
    if(!active()){clearMarkers(markers);return;}
    render();renderMarkers();
    if(dialog.open)renderComparison();
  }
  function render(){
    document.getElementById('premisesPanel').classList.toggle('has-selection',!!selected);
    if(loading){content.innerHTML='<p>Загружаем подборку помещений…</p>';return;}
    if(error){content.innerHTML='<p>Подборка не загрузилась.</p><button class="premises-action" data-action="retry">Повторить</button>';return;}
    if(selected){renderDetail();return;}
    const items=[...data.listings];
    const value=i=>sort==='rent'?(i.rent??Infinity):sort==='competition'?(stats(i)?.competitors??Infinity):0;
    items.sort((a,b)=>value(a)-value(b));
    content.innerHTML=`<div class="premises-tools"><span>${items.length} объявления · ${items.filter(i=>i.location).length} на карте</span><button data-action="compare">Сравнить</button></div>
      <label class="premises-sort">Порядок <select id="premisesSort"><option value="default">Подборка</option><option value="rent">Аренда по возрастанию</option><option value="competition">Меньше конкурентов рядом</option></select></label>
      <p class="premises-scope">${activeCategory==='bakery'?'Подборка под пекарню / кафе.':'Подборка помещений под пекарню / кафе. Возможность салона пока не проверена.'} Статистика: ${escape(categories[activeCategory].title)}.</p>
      <div class="premises-list">${items.map(i=>{
        const s=stats(i);return `<button type="button" class="premises-item" data-listing="${i.id}"><span class="premises-item-top">${escape(i.district)} <span>${i.area} м²</span></span><strong>${escape(i.title)}</strong><span class="premises-price">${rent(i)}</span>${i.transfer!==null?`<span class="premises-transfer">+ ${euro(i.transfer)} за передачу</span>`:''}<span class="premises-badge">${escape(i.suitability)}</span><span class="premises-card-stats">${s?`Жителей: ≈ ${num(s.population)} · модель<br>Конкурентов в 800 м: ${s.competitors}`:'Адрес скрыт · статистика недоступна'}</span>${i.location?.precision==='project'?'<span class="premises-small">Приблизительно: ориентир квартала</span>':''}</button>`;
      }).join('')}</div>${status()}`;
    document.getElementById('premisesSort').value=sort;
  }
  function renderDetail(){
    const i=selected,s=stats(i),approx=i.location?.precision==='project';
    content.innerHTML=`<button class="premises-back" data-action="back">Все помещения</button><span class="eyebrow">${escape(i.district)} · ${i.area} м²</span><h2>${escape(i.title)}</h2><p class="premises-address">${escape(i.address)}</p>
      <div class="premises-rent">${rent(i)}</div><p class="premises-small">Базовая аренда, не полная стоимость</p><p>${escape(i.extras)}</p>
      ${i.transfer!==null?`<p class="premises-callout">Разовый платёж за передачу: <b>${euro(i.transfer)}</b>. Это не месячная аренда.</p>`:''}
      <p class="premises-small">Доступность по объявлению: ${escape(i.available)}</p>
      <a class="premises-action source-link" href="${escape(i.url)}" target="_blank" rel="noopener noreferrer">Открыть объявление · ${escape(i.source)}</a>
      <section class="premises-section"><h3>Окружение · 800 м</h3><p class="premises-small">По прямой · ${escape(categories[activeCategory].title)}${approx?' · приблизительный ориентир':''}</p>
      ${s?`<div class="premises-stats"><div><strong>≈ ${num(s.population)}</strong><span>жителей по модели</span></div><div><strong>${s.competitors}</strong><span>конкурентов в OSM</span></div><div><strong>${num(s.residential)}</strong><span>жилых зданий</span></div><div><strong>${s.nearest.length?num(s.nearest[0].distance)+' м':'—'}</strong><span>до ближайшей точки</span></div></div>
        <p class="premises-small">Не число клиентов и не эксклюзивная зона. ${num(s.unknown)} зданий без типа не учтены в населении.</p>
        <button class="premises-action secondary" data-action="homes">Показать жилые дома</button><p id="premisesGeometryStatus" class="premises-small" role="status"></p>
        <h4>Ближайшие ${activeCategory==='bakery'?'пекарни':'салоны'}</h4><ul class="premises-neighbors">${s.nearest.map(p=>`<li><span>${escape(p.name)}</span><b>${num(p.distance)} м</b></li>`).join('')}</ul>
        <p class="premises-small">${escape(i.location.label)}. ${external(i.location.source,'Геопривязка OSM')}${i.location.evidence?' · '+external(i.location.evidence,'Адрес квартала у брокера'):''}.</p>`:
        '<div class="premises-empty">Точный адрес не опубликован. Поэтому здесь нет маркера, оценки жителей и конкурентов. Сначала запросите адрес у автора объявления.</div>'}</section>
      <section class="premises-section"><h3>Что известно</h3><ul>${i.facts.map(f=>`<li>${escape(f)}</li>`).join('')}</ul><h3>Что проверить</h3><ul>${i.risks.map(f=>`<li>${escape(f)}</li>`).join('')}</ul>${activeCategory==='beauty'?'<p class="premises-callout">Пригодность под nail / beauty в источнике не подтверждена.</p>':''}</section>
      <details class="premises-method"><summary>Источники и методика</summary><p>Дома OSM: ${data.buildingSnapshot.slice(0,10)}; заведения: ${data.pointSnapshots[activeCategory].slice(0,10)}. Учтены центры контуров в пределах 800 м. Население = площадь × этажи × 80% ÷ 45 м². При неизвестной этажности — 2 для домов, 3 для многоквартирных зданий. ${s?`В этом окружении этажность принята для ${s.levelsAssumed} жилых зданий.`:''}</p><p>Население — модель, не перепись. Пешеходный трафик, офисные работники, покупательная способность, дороги и барьеры не учтены. Снимок ограничен 52.30–52.45° N, 9.60–9.88° E. Расчёты сохранены при публикации, а не выполняются в браузере.</p><p>${external('https://www.openstreetmap.org/copyright','© OpenStreetMap contributors · ODbL')}</p></details>${status()}`;
  }
  function select(id){
    const item=data?.listings.find(i=>i.id===id);if(!item)return;
    Catchments.hide();clearHomes();selected=item;document.body.classList.remove('premises-map-only');mobileLabel();refresh();
    document.getElementById('premisesPanel').scrollTop=0;
    if(item.location&&mapReady){const mobile=matchMedia('(max-width:820px)').matches;map.easeTo({center:item.location.coordinates,zoom:14.3,pitch:BuildingView.pitch,bearing:0,offset:mobile?[0,-140]:[0,0],duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:500});}
  }
  async function showHomes(){
    if(!selected?.geometry)return;
    if(!mapReady){document.getElementById('premisesGeometryStatus').textContent='Карта ещё загружается. Попробуйте через несколько секунд.';return;}
    const item=selected,ticket=++homeRequest,indicator=document.getElementById('premisesGeometryStatus');
    indicator.textContent='Загружаем сохранённые контуры…';
    try{
      if(!geometryCache.has(item.geometry))geometryCache.set(item.geometry,fetch('./data/'+item.geometry).then(r=>{if(!r.ok)throw Error('Geometry');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();}).catch(e=>{geometryCache.delete(item.geometry);throw e;}));
      const geo=await geometryCache.get(item.geometry);
      if(ticket!==homeRequest||!active()||selected?.id!==item.id)return;
      map.getSource('premises-homes').setData(geo);BuildingView.focus(map,true);
      indicator.textContent='Бирюзовым выделены жилые дома из расчёта. Серые — остальные.';
    }catch(_){if(ticket===homeRequest)indicator.textContent='Не удалось загрузить контуры. Нажмите кнопку ещё раз.';}
  }
  function initMap(){
    const layers=map.getStyle().layers,at=layers.findIndex(l=>l.id==='building'),before=layers.slice(at+1).find(l=>l.type==='symbol')?.id;
    map.addSource('premises-homes',{type:'geojson',data:featureCollection()});
    map.addLayer({id:'premises-homes-flat',type:'fill',source:'premises-homes',paint:{'fill-color':'#76c6b9','fill-opacity':1}},before);
    map.addLayer({id:'premises-homes-3d',type:'fill-extrusion',source:'premises-homes',minzoom:13,paint:{'fill-extrusion-color':'#76c6b9','fill-extrusion-height':['interpolate',['linear'],['zoom'],13,0,15,['get','viewHeight']],'fill-extrusion-opacity':1}},before);
    renderMarkers();
  }
  function renderMarkers(){
    clearMarkers(markers);if(!mapReady||!data||!active())return;
    data.listings.filter(i=>i.location).forEach(i=>{
      const el=document.createElement('button');el.type='button';el.className='premises-marker'+(selected?.id===i.id?' selected':'')+(i.location.precision==='project'?' approximate':'');
      el.textContent=(i.location.precision==='project'?'≈ ':'')+(i.rent===null?'Аренда':euro(i.rent));el.setAttribute('aria-label',`Помещение: ${i.title}, ${i.location.label}`);
      el.onclick=e=>{e.stopPropagation();select(i.id);};markers.push(new maplibregl.Marker({element:el}).setLngLat(i.location.coordinates).addTo(map));
    });
  }
  function renderComparison(){
    const fields=[['Площадь',i=>i.area+' м²'],['Базовая аренда',rent],['Разовый платёж',i=>i.transfer!==null?euro(i.transfer):'Не указан'],['Назначение',i=>activeCategory==='bakery'?i.suitability:'Под салон не проверено'],['Геопривязка',i=>i.location?.label||'Адрес скрыт'],['Жители в 800 м · модель',i=>stats(i)?'≈ '+num(stats(i).population):'Нет адреса'],['Конкуренты в 800 м',i=>stats(i)?.competitors??'Нет адреса'],['Ближайшая точка',i=>stats(i)?.nearest[0]?num(stats(i).nearest[0].distance)+' м':'Нет адреса']];
    document.getElementById('compareContent').innerHTML=`<p>${escape(categories[activeCategory].title)} · 800 м по прямой. Нет адреса ≠ нет конкурентов. Leineauen — расчёт от ориентира квартала.</p><div class="premises-table-scroll" tabindex="0" aria-label="Таблица сравнения, прокрутка по горизонтали"><table><thead><tr><th scope="col">Показатель</th>${data.listings.map(i=>`<th scope="col">${escape(i.title)}</th>`).join('')}</tr></thead><tbody>${fields.map(([label,fn])=>`<tr><th scope="row">${label}</th>${data.listings.map(i=>`<td>${escape(fn(i))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Условия и источник</th>${data.listings.map(i=>`<td>${external(i.url,'Объявление')}</td>`).join('')}</tr></tbody></table></div><p>Аренда не включает все расходы: доплаты, комиссию, НДС, ремонт и оснащение смотрите в карточках. Отсутствующая цена не означает бесплатную аренду.</p>${status()}`;
  }
  async function load(){
    loading=true;error=false;render();
    try{const r=await fetch('./data/premises-index.json',{cache:'no-cache'});if(!r.ok)throw Error('Listings');data=await r.json();if(data.schema!==1||!Array.isArray(data.listings))throw Error('Schema');}
    catch(_){error=true;}finally{loading=false;refresh();}
  }
  content.addEventListener('click',e=>{
    const item=e.target.closest('[data-listing]');if(item){select(item.dataset.listing);return;}
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='back'){selected=null;clearHomes();refresh();}
    if(action==='compare'){renderComparison();dialog.showModal();}
    if(action==='homes')showHomes();if(action==='retry')load();
  });
  content.addEventListener('change',e=>{if(e.target.id==='premisesSort'){sort=e.target.value;render();}});
  document.getElementById('premisesMode').onclick=()=>setMode(true);
  document.getElementById('businessMode').onclick=()=>setMode(false);
  document.getElementById('compareClose').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  document.getElementById('premisesMobile').onclick=()=>{document.body.classList.toggle('premises-map-only');mobileLabel();};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open&&active()&&selected){selected=null;clearHomes();refresh();}});
  load();return {active,setMode,refresh,initMap,clearHomes};
})();
