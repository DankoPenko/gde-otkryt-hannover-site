const Catchments=(()=>{
  let status='loading',groups=new Map(),meta=null,selected=null,pinned=false,request=0,leaveTimer=null;
  const geometryCache=new Map();
  // Start the small saved index while the basemap style is loading.
  let indexRequest=0;
  const indexCache=new Map();
  function fetchIndex(category,force=false){
    if(force)indexCache.delete(category);
    if(!indexCache.has(category))indexCache.set(category,fetch('./data/'+categories[category].index,{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null));
    return indexCache.get(category);
  }
  fetchIndex('bakery');
  const card=document.getElementById('catchmentCard');
  const source=()=>map.getSource('bakery-catchment');
  async function init(){
    map.addSource('bakery-catchment',{type:'geojson',data:featureCollection()});
    const color=['match',['get','kind'],'residential','#20a793','#a4a4c5'];
    // Early arrow symbols occur BELOW buildings in Liberty. Insert above the
    // building layer, not before the first symbol, or gray footprints cover us.
    const layers=map.getStyle().layers,buildingIndex=layers.findIndex(layer=>layer.id==='building');
    const before=layers.slice(buildingIndex+1).find(layer=>layer.type==='symbol')?.id;
    map.addLayer({id:'catchment-flat',type:'fill',source:'bakery-catchment',paint:{'fill-color':color,'fill-opacity':1}},before);
    map.addLayer({id:'catchment-outline',type:'line',source:'bakery-catchment',paint:{'line-color':['match',['get','kind'],'residential','#087b70','#72769b'],'line-width':['interpolate',['linear'],['zoom'],11,.4,16,1.2],'line-opacity':.9}},before);
    await loadCategory();
  }
  async function loadCategory(force=false){
    const category=activeCategory,ticket=++indexRequest;
    status='loading';groups=new Map();meta=null;
    try{
      const data=await fetchIndex(category,force);
      if(ticket!==indexRequest||category!==activeCategory)return;
      const points=data?.points||data?.bakeries;
      if(data?.schema!==2||!data.groups?.length||data.groups.length!==points?.length||(data.category||'bakery')!==category)throw new Error('Invalid saved analysis');
      meta=data;groups=new Map(data.groups.map(group=>[group.key,group]));status='ready';
      const date=(data.pointSnapshot||data.bakerySnapshot||data.snapshot).slice(0,10);
      applyBakeryData(points,`OSM · ${date}`,'Сохранённый расчёт · '+date);
    }catch(_){
      if(ticket!==indexRequest||category!==activeCategory)return;
      indexCache.delete(category);
      status='error';const el=document.getElementById('mapStatus');el.textContent='Не удалось загрузить сохранённый расчёт. ';
      const button=document.createElement('button');button.textContent='Повторить';
      button.onclick=()=>{button.disabled=true;loadCategory(true);};el.append(button);
    }
  }
  async function selectGeometry(){
    if(status!=='ready'||!selected)return;
    const group=groups.get(CatchmentCore.key(selected)),ticket=++request;
    if(!group)return;
    const indicator=document.getElementById('catchmentGeometryState');
    indicator.textContent='Загружаем контуры выбранных домов…';
    if(!geometryCache.has(group.file)){
      const pending=fetch('./data/'+group.file,{cache:'force-cache'}).then(r=>{
        if(!r.ok)throw new Error('Geometry unavailable');
        return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();
      }).then(data=>{if(data.type!=='FeatureCollection'||data.features.length!==group.buildings+(group.auxiliary||0))throw new Error('Invalid geometry');return data;}).catch(error=>{geometryCache.delete(group.file);throw error;});
      geometryCache.set(group.file,pending);
      if(geometryCache.size>24)geometryCache.delete(geometryCache.keys().next().value);
    }
    try{
      const data=await geometryCache.get(group.file);
      if(ticket!==request||!selected)return;
      source()?.setData(data);indicator.textContent='Дома выбранного заведения выделены на карте';
    }catch(_){
      if(ticket!==request||!selected)return;
      indicator.textContent='Контуры не загрузились. ';
      const retry=document.createElement('button');retry.textContent='Повторить';retry.onclick=selectGeometry;indicator.append(retry);
    }
  }
  function focusGroup(){
    if(!selected)return;
    const group=groups.get(CatchmentCore.key(selected));
    if(!group?.bounds)return;
    const b=group.bounds,mobile=matchMedia('(max-width:820px)').matches;
    map.fitBounds([[Math.min(b[0],selected[1]),Math.min(b[1],selected[0])],[Math.max(b[2],selected[1]),Math.max(b[3],selected[0])]],{
      padding:mobile?{top:65,bottom:Math.min(innerHeight*.48+30,430),left:24,right:24}:{top:60,bottom:85,left:45,right:350},
      maxZoom:15.6,pitch:0,bearing:0,duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:500
    });
  }
  function render(){
    if(!selected)return;
    card.hidden=false;
    document.getElementById('catchmentName').textContent=selected[2];
    document.getElementById('catchmentLabel').textContent=categories[activeCategory].label;
    document.getElementById('catchmentHint').textContent=pinned?'Выбрано заведение · Esc, чтобы снять выбор':'Нажмите на значок, чтобы закрепить';
    const body=document.getElementById('catchmentBody');body.replaceChildren();
    if(status!=='ready'){
      const p=document.createElement('p');p.textContent='Загружаем сохранённые дома…';body.append(p);
      return;
    }
    const group=groups.get(CatchmentCore.key(selected));
    if(!group){const p=document.createElement('p');p.textContent='Для этой точки пока нет расчёта.';body.append(p);return;}
    const metric=document.createElement('div');metric.className='catchment-population';
    const value=document.createElement('strong');
    value.textContent=group.residential?`≈ ${formatNumber(Math.max(10,Math.round(group.population/10)*10))}`:'—';
    const label=document.createElement('span');label.textContent='жителей · модельная оценка';metric.append(value,label);body.append(metric);
    const grid=document.createElement('div');grid.className='catchment-grid';
    for(const [labelText,valueText] of [['Жилых домов',formatNumber(group.residential)],['Зданий в расчёте',formatNumber(group.buildings)]]){
      const item=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');label.textContent=labelText;value.textContent=valueText;item.append(label,value);grid.append(item);
    }
    body.append(grid);
    const note=document.createElement('p');note.className='catchment-note';
    note.textContent=group.residential?`Население оценено только для ${formatNumber(group.residential)} жилых домов. Это не число реальных покупателей.`:'В этой группе нет зданий с жилым типом в OSM. Население не оценено.';body.append(note);
    const legend=document.createElement('p');legend.className='catchment-colors';legend.innerHTML='<span><i class="swatch residential"></i>Жилые</span><span><i class="swatch other"></i>Прочие / тип неизвестен / постройки</span>';body.append(legend);
    const context=document.createElement('p');context.className='catchment-note';context.textContent='Серые контуры — вне выбранной группы или отсутствуют в сохранённом снимке.';body.append(context);
    const geometryState=document.createElement('p');geometryState.id='catchmentGeometryState';geometryState.className='catchment-note';geometryState.setAttribute('role','status');body.append(geometryState);
    const zoom=document.createElement('button');zoom.className='catchment-zoom';zoom.textContent='Показать все дома';zoom.onclick=()=>{pinned=true;document.getElementById('catchmentHint').textContent='Выбрано заведение · Esc, чтобы снять выбор';focusGroup();};body.append(zoom);
    const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Как рассчитано';details.append(summary);
    const auxiliary=document.createElement('p');auxiliary.textContent=`Дополнительно подсвечены ${formatNumber(group.auxiliary||0)} вспомогательных и малых построек: гаражи, навесы и другие контуры меньше 20 м². Они не входят в число зданий выше и в оценку жителей.`;details.append(auxiliary);
    const method=document.createElement('p');method.textContent=`Каждое здание относится к ближайшему заведению выбранной категории (${categories[activeCategory].title}) по расстоянию по прямой от центра контура. Категории рассчитываются независимо. Площадь × этажи × 80% ÷ 45 м² на жителя. Это допущения модели, не перепись. Для ${formatNumber(group.levelsAssumed)} жилых домов этажность принята: 2 для отдельных домов, 3 для многоквартирных. ${formatNumber(group.unknown)} зданий без типа и ${formatNumber(group.other)} нежилых не входят в оценку населения.`;details.append(method);
    const scope=document.createElement('p');scope.textContent=`Снимок домов OSM: ${String(meta.snapshot).slice(0,10)}; заведений: ${String(meta.pointSnapshot||meta.bakerySnapshot||meta.snapshot).slice(0,10)}. Среднее расстояние: ${group.buildings?Math.round(group.distanceSum/group.buildings):0} м. Выборка: 52.30–52.45° N, 9.60–9.88° E. Вне этой области дома и заведения не учтены; у границ оценка неполная. Пересчёт выполняется при публикации нового снимка, а не при открытии страницы.`;details.append(scope);body.append(details);
    if(group.edge){const edge=document.createElement('p');edge.className='catchment-note';edge.textContent='Зона достигает границы выборки — охват неполный.';body.append(edge);}
  }
  function show(point,pin=false){
    clearTimeout(leaveTimer);
    if(status!=='ready'||pinned&&!pin)return;
    const changed=!selected||CatchmentCore.key(selected)!==CatchmentCore.key(point);
    const wasPinned=pinned;
    selected=point;pinned=pin||pinned;
    if(!changed&&wasPinned===pinned)return;
    closeDrawer();
    if(changed){request++;source()?.setData(featureCollection());}
    render();selectGeometry();
    document.body.classList.add('catchment-active');
    document.querySelectorAll('.bakery-dot').forEach(el=>el.classList.toggle('selected',el.dataset.bakeryKey===CatchmentCore.key(point)));
    if(pin)focusGroup();
  }
  function hide(){
    clearTimeout(leaveTimer);selected=null;pinned=false;request++;card.hidden=true;source()?.setData(featureCollection());
    document.querySelectorAll('.bakery-dot.selected').forEach(el=>el.classList.remove('selected'));
    document.body.classList.remove('catchment-active');
    clearBuildingHighlight();
  }
  function leave(){if(!pinned)leaveTimer=setTimeout(hide,160);}
  card.addEventListener('mouseenter',()=>clearTimeout(leaveTimer));
  card.addEventListener('mouseleave',leave);
  document.getElementById('catchmentClose').addEventListener('click',hide);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  map.on('click',event=>{if(!event.originalEvent?.target?.closest('.bakery-dot'))hide();});
  return {init,loadCategory,show,leave,hide,isSelected:point=>!!selected&&CatchmentCore.key(selected)===CatchmentCore.key(point)};
})();
