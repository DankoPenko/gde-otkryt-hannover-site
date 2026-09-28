const Catchments=(()=>{
  let worker=null,revision=0,status='loading',groups=new Map(),meta=null,selected=null,pinned=false,request=0,leaveTimer=null;
  const card=document.getElementById('catchmentCard');
  const source=()=>map.getSource('bakery-catchment');
  function init(){
    map.addSource('bakery-catchment',{type:'geojson',data:featureCollection()});
    const color=['match',['get','kind'],'residential','#29b9a3','unknown','#91a7b9','#aab2b8'];
    map.addLayer({id:'catchment-flat',type:'fill',source:'bakery-catchment',maxzoom:14,paint:{'fill-color':color,'fill-opacity':.7}});
    map.addLayer({id:'catchment-outline',type:'line',source:'bakery-catchment',paint:{'line-color':color,'line-width':1,'line-opacity':.9}});
    map.addLayer({id:'catchment-3d',type:'fill-extrusion',source:'bakery-catchment',minzoom:14,paint:{'fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-color':color,'fill-extrusion-opacity':.64}});
    try{
      worker=new Worker('./catchment-worker.js');
      worker.onmessage=({data})=>{
        if(data.revision!==revision)return;
        if(data.type==='ready'){
          status='ready';meta=data.meta;groups=new Map(data.groups.map(group=>[group.key,group]));
          if(selected){render();selectGeometry();}
        }else if(data.type==='selection'&&selected&&data.key===CatchmentCore.key(selected)&&data.request===request){
          source()?.setData(featureCollection(data.features));
        }else if(data.type==='error'){status='error';source()?.setData(featureCollection());if(selected)render();}
      };
      worker.onerror=()=>{status='error';source()?.setData(featureCollection());if(selected)render();};
      recompute();
    }catch(_){status='error';}
  }
  function recompute(){
    if(!worker||!bakeries.length)return;
    revision++;request++;status='loading';groups.clear();source()?.setData(featureCollection());
    if(selected){selected=bakeries.find(point=>CatchmentCore.key(point)===CatchmentCore.key(selected))||null;if(!selected)hide();else render();}
    worker.postMessage({type:'compute',revision,bakeries});
  }
  function selectGeometry(){
    if(status!=='ready'||!selected)return;
    worker.postMessage({type:'select',revision,key:CatchmentCore.key(selected),request:++request});
  }
  function render(){
    if(!selected)return;
    card.hidden=false;
    document.getElementById('catchmentName').textContent=selected[2];
    document.getElementById('catchmentHint').textContent=pinned?'Выбрана пекарня · Esc, чтобы снять выбор':'Нажмите на точку, чтобы закрепить';
    const body=document.getElementById('catchmentBody');body.replaceChildren();
    if(status!=='ready'){
      const p=document.createElement('p');p.textContent=status==='error'?'Не удалось загрузить дома. Оценка недоступна.':'Распределяем дома между ближайшими пекарнями…';body.append(p);
      if(status==='error'){const button=document.createElement('button');button.textContent='Повторить';button.onclick=recompute;body.append(button);}
      return;
    }
    const group=groups.get(CatchmentCore.key(selected));
    if(!group){const p=document.createElement('p');p.textContent='Для этой точки пока нет расчёта.';body.append(p);return;}
    const metric=document.createElement('div');metric.className='catchment-population';
    const value=document.createElement('strong');
    value.textContent=group.residential?`≈ ${formatNumber(Math.max(10,Math.round(group.population/10)*10))}`:'—';
    const label=document.createElement('span');label.textContent='жителей · модельная оценка';metric.append(value,label);body.append(metric);
    const grid=document.createElement('div');grid.className='catchment-grid';
    for(const [labelText,valueText] of [['Зданий закреплено',formatNumber(group.buildings)],['Из них жилых',formatNumber(group.residential)],['Среднее расстояние',group.buildings?`${formatNumber(Math.round(group.distanceSum/group.buildings))} м`:'—']]){
      const item=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');label.textContent=labelText;value.textContent=valueText;item.append(label,value);grid.append(item);
    }
    body.append(grid);
    const note=document.createElement('p');note.className='catchment-note';
    note.textContent=group.residential?`Население оценено только для ${formatNumber(group.residential)} жилых домов. Это не число реальных покупателей.`:'В этой группе нет зданий с жилым типом в OSM. Население не оценено.';body.append(note);
    const legend=document.createElement('p');legend.className='catchment-colors';legend.textContent='Бирюзовые — жилые · серые — прочие';body.append(legend);
    const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Как рассчитано';details.append(summary);
    const method=document.createElement('p');method.textContent=`Каждое здание относится к ближайшей пекарне по расстоянию по прямой от центра контура. Площадь × этажи × 80% ÷ 45 м² на жителя. Это допущения модели, не перепись. Для ${formatNumber(group.levelsAssumed)} жилых домов этажность принята: 2 для отдельных домов, 3 для многоквартирных. ${formatNumber(group.unknown)} зданий без типа и ${formatNumber(group.other)} нежилых не входят в оценку населения.`;details.append(method);
    const scope=document.createElement('p');scope.textContent=`Контуры OSM: ${String(meta.snapshot).slice(0,10)}. Выборка: 52.30–52.45° N, 9.60–9.88° E. Вне этой области дома и пекарни не учтены; у границ оценка неполная. Отсутствующие в OSM здания не учитываются.`;details.append(scope);body.append(details);
    if(group.edge){const edge=document.createElement('p');edge.className='catchment-note';edge.textContent='Зона достигает границы выборки — охват неполный.';body.append(edge);}
  }
  function show(point,pin=false){
    clearTimeout(leaveTimer);
    if(pinned&&!pin)return;
    const changed=!selected||CatchmentCore.key(selected)!==CatchmentCore.key(point);
    const wasPinned=pinned;
    selected=point;pinned=pin||pinned;
    if(!changed&&wasPinned===pinned)return;
    closeDrawer();
    if(changed){request++;source()?.setData(featureCollection());}
    render();selectGeometry();
    document.querySelectorAll('.bakery-dot').forEach(el=>el.classList.toggle('selected',el.dataset.bakeryKey===CatchmentCore.key(point)));
  }
  function hide(){
    clearTimeout(leaveTimer);selected=null;pinned=false;request++;card.hidden=true;source()?.setData(featureCollection());
    document.querySelectorAll('.bakery-dot.selected').forEach(el=>el.classList.remove('selected'));
    clearBuildingHighlight();
  }
  function leave(){if(!pinned)leaveTimer=setTimeout(hide,160);}
  card.addEventListener('mouseenter',()=>clearTimeout(leaveTimer));
  card.addEventListener('mouseleave',leave);
  document.getElementById('catchmentClose').addEventListener('click',hide);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  map.on('click',event=>{if(!event.originalEvent?.target?.closest('.bakery-dot'))hide();});
  return {init,recompute,show,leave,hide,isSelected:point=>!!selected&&CatchmentCore.key(selected)===CatchmentCore.key(point)};
})();
