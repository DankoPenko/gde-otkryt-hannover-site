let bakeries = [];

const candidates = [
  {id:1,name:"Mühlenberg · центр",lat:52.3433,lon:9.6625,score:89,population:4800,minutes:14,competitors:1,gap:2},
  {id:2,name:"Sahlkamp · север",lat:52.4198,lon:9.7560,score:84,population:4200,minutes:13,competitors:1,gap:2},
  {id:3,name:"Bemerode · восток",lat:52.3485,lon:9.8385,score:81,population:3900,minutes:12,competitors:1,gap:1},
  {id:4,name:"Ahlem · юг",lat:52.3728,lon:9.6465,score:76,population:3100,minutes:12,competitors:1,gap:1},
  {id:5,name:"Anderten · станция",lat:52.3595,lon:9.8565,score:71,population:2700,minutes:11,competitors:2,gap:1},
  {id:6,name:"Ledeburg · центр",lat:52.4230,lon:9.6935,score:68,population:2400,minutes:11,competitors:2,gap:1}
];


let walkMinutes = 10;
let selectedCandidate = null;
let mapReady = false;
let bakeryMarkers = [];
let candidateMarkers = [];

const map = new maplibregl.Map({
  container:"map",
  style:"https://tiles.openfreemap.org/styles/liberty",
  center:[9.7386,52.3745],
  zoom:11.55,
  pitch:0,
  bearing:0,
  minZoom:10.5,
  maxZoom:18,
  maxPitch:0,
  attributionControl:true,
  canvasContextAttributes:{antialias:true}
});
map.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

function formatNumber(value) { return new Intl.NumberFormat("ru-RU").format(value); }
function scoreColor(score) { return score >= 80 ? "#9dd9c5" : score >= 70 ? "#a9cee9" : "#d2dbdf"; }
function distanceKm(lat1,lon1,lat2,lon2) {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(lat2-lat1), dLon = rad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function circleFeature(lon,lat,radius,properties={}) {
  const points = [];
  const latRadius = radius / 111320;
  const lonRadius = radius / (111320 * Math.cos(lat * Math.PI / 180));
  for (let i=0;i<=48;i++) {
    const angle = i/48 * Math.PI*2;
    points.push([lon + Math.cos(angle)*lonRadius,lat + Math.sin(angle)*latRadius]);
  }
  return {type:"Feature",properties,geometry:{type:"Polygon",coordinates:[points]}};
}
function featureCollection(features=[]) { return {type:"FeatureCollection",features}; }

function safePaint(id,property,value) {
  if (!map.getLayer(id)) return;
  try { map.setPaintProperty(id,property,value); } catch (_) {}
}
function safeLayout(id,property,value) {
  if (!map.getLayer(id)) return;
  try { map.setLayoutProperty(id,property,value); } catch (_) {}
}

function styleCartoonMap() {
  safePaint("background","background-color","#f0f3f5");
  safePaint("park","fill-color","#b7d9bd");
  safePaint("park","fill-opacity",.92);
  safePaint("park_outline","line-color","#5f9360");
  safePaint("park_outline","line-width",2);
  safePaint("landuse_residential","fill-color","#e8eef0");
  safePaint("landuse_residential","fill-opacity",.76);
  safePaint("landcover_wood","fill-color","#a1cbb3");
  safePaint("landcover_grass","fill-color","#d1e5d3");
  safePaint("landcover_wetland","fill-color","#9dd7b0");
  safePaint("landcover_sand","fill-color","#e0e5e7");
  safePaint("landuse_pitch","fill-color","#8ed394");
  safePaint("landuse_cemetery","fill-color","#b0d795");
  safePaint("landuse_hospital","fill-color","#f3b7b1");
  safePaint("landuse_school","fill-color","#dce3ef");
  safePaint("water","fill-color","#7bcbe8");
  ["waterway_river","waterway_other"].forEach(id => safePaint(id,"line-color","#69b9dc"));
  map.getStyle().layers.forEach(layer=>{
    if(layer.type==="fill"&&/farmland|farmyard|industrial|commercial|retail|construction/.test(layer.id))safePaint(layer.id,"fill-color","#e1e9e4");
    if(layer.type==="line"&&/road|bridge|tunnel/.test(layer.id)){
      safePaint(layer.id,"line-color",layer.id.includes("casing")?"#cbd6db":"#ffffff");
      if(/path|pedestrian|footway/.test(layer.id)){
        safePaint(layer.id,'line-width',.8);
        safePaint(layer.id,'line-opacity',.5);
      }
    }
  });
  safePaint("building","fill-color","#d5dde3");
  safePaint("building","fill-outline-color","#b8c5cf");
  safePaint("building","fill-opacity",.9);
  safePaint("building","fill-pattern",null);
  map.setLayerZoomRange("building",12,24);
  safeLayout("building-3d","visibility","none");
  ["poi_r20","poi_r7","poi_r1","poi_transit","road_one_way_arrow","road_one_way_arrow_opposite","highway-name-path","highway-name-minor","highway-shield-non-us","highway-shield-us-interstate","road_shield_us","boundary_3","boundary_2","boundary_disputed"].forEach(id => safeLayout(id,"visibility","none"));
  ["highway-name-major","label_other","label_village","label_town","label_city","label_city_capital"].forEach(id => {
    safePaint(id,"text-color","#314d43");
    safePaint(id,"text-halo-color","#ffffff");
    safePaint(id,"text-halo-width",2);
  });
  safePaint('park','fill-color','#dce8de');
  safePaint('park_outline','line-width',.5);
  safePaint('landcover_wood','fill-color','#d3e1d7');
  safePaint('landcover_grass','fill-color','#e2ebe2');
  safePaint('water','fill-color','#b9dbe8');
}

function renderCoverage() {
  if (!mapReady || !map.getSource("coverage")) return;
  if (map.getZoom() < 14) {
    map.getSource("coverage").setData(featureCollection());
    return;
  }
  const radius = ({5:360,10:720,15:1080})[walkMinutes];
  const bounds = map.getBounds();
  const visible = bakeries.filter(([lat,lon]) => bounds.contains([lon,lat]));
  map.getSource("coverage").setData(featureCollection(visible.map(([lat,lon]) => circleFeature(lon,lat,radius))));
}

function clearMarkers(markers) { markers.forEach(marker => marker.remove()); markers.length = 0; }
function renderBakeries() {
  if (!mapReady) return;
  clearMarkers(bakeryMarkers);
  const bounds = map.getBounds();
  bakeries.filter(([lat,lon])=>bounds.contains([lon,lat])).forEach(point => bakeryMarkers.push(createBakeryMarker(point)));
}

function createBakeryMarker([lat,lon,name]) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "bakery-dot";
  element.classList.toggle("detailed",map.getZoom()>=14);
  element.setAttribute("aria-label",name);
  const point=[lat,lon,name];
  element.dataset.bakeryKey=CatchmentCore.key(point);
  element.classList.toggle('selected',Catchments.isSelected(point));
  const preview=()=>{
    const building=findBuildingForBakery(point);
    highlightBuilding(building);
    Catchments.show(point);
  };
  element.addEventListener("mouseenter",preview);
  element.addEventListener("focus",preview);
  element.addEventListener("mouseleave",()=>{clearBuildingHighlight();Catchments.leave();});
  element.addEventListener("blur",()=>{clearBuildingHighlight();Catchments.leave();});
  element.addEventListener("click",event=>{event.stopPropagation();highlightBuilding(findBuildingForBakery(point));Catchments.show(point,true);});
  return new maplibregl.Marker({element,anchor:"center"}).setLngLat([lon,lat]).addTo(map);
}

const buildingPopup=new maplibregl.Popup({closeButton:false,offset:14});
let highlightedBuildingKey=null;
function findBuildingForBakery(point) {
  if(!mapReady||map.getZoom()<14)return null;
  const features=map.querySourceFeatures("openmaptiles",{sourceLayer:"building"});
  for(const feature of features){
    const geometry=BuildingMatch.componentAt(feature.geometry,[point[1],point[0]]);
    if(geometry)return {geometry,properties:feature.properties};
  }
  return null;
}
function highlightBuilding(feature) {
  const source=map.getSource("bakery-building-highlight");
  if(!source)return;
  if(!feature){clearBuildingHighlight();return;}
  const key=JSON.stringify(feature.geometry);
  if(key===highlightedBuildingKey)return;
  highlightedBuildingKey=key;
  source.setData(featureCollection([{type:"Feature",geometry:feature.geometry,properties:{
    height:Math.max(3,Number(feature.properties.render_height)||6)+.25,
    base:Number(feature.properties.render_min_height)||0
  }}]));
}
function clearBuildingHighlight() {
  if(highlightedBuildingKey!==null){
    map.getSource("bakery-building-highlight")?.setData(featureCollection());
    highlightedBuildingKey=null;
  }
  buildingPopup.remove();
  map.getCanvas().style.cursor="";
}
function inspectBakeryBuilding(event) {
  if(!mapReady||map.getZoom()<14||map.isMoving())return;
  if(event.originalEvent?.target?.closest('.bakery-dot'))return;
  const rendered=map.queryRenderedFeatures(event.point,{layers:["building"]})[0];
  // Vector tiles may merge hundreds of separate houses into one MultiPolygon.
  // Select the polygon under the pointer before matching any bakery.
  const geometry=rendered&&BuildingMatch.componentAt(rendered.geometry,[event.lngLat.lng,event.lngLat.lat]);
  const feature=geometry?{geometry,properties:rendered.properties}:null;
  const matches=feature?bakeries.filter(([lat,lon])=>BuildingMatch.contains(feature.geometry,[lon,lat])):[];
  if(!matches.length){clearBuildingHighlight();Catchments.leave();return;}
  highlightBuilding(feature);
  map.getCanvas().style.cursor="pointer";
  Catchments.show(matches[0]);
}

function renderCandidates() {
  const list = document.getElementById("candidateList");
  list.innerHTML = candidates.map(item => `
    <button class="candidate-card" type="button" data-id="${item.id}" aria-label="Открыть зону ${item.name}, потенциал ${item.score} из 100">
      <span class="score-ring" style="--score-color:${scoreColor(item.score)}"><span>${item.score}</span></span>
      <span><strong>${item.name}</strong><small>${formatNumber(item.population)} жителей · ${item.minutes} мин до точки</small></span>
      <span class="candidate-arrow">›</span>
    </button>`).join("");
  list.onclick = event => {
    const card = event.target.closest(".candidate-card");
    if (!card) return;
    const item = candidates.find(candidate => candidate.id === Number(card.dataset.id));
    openCandidate(item,true);
  };
  if (!mapReady) return;
  clearMarkers(candidateMarkers);
  if (map.getSource("potential")) {
    map.getSource("potential").setData(featureCollection(candidates.map(item => circleFeature(item.lon,item.lat,560,{score:item.score,color:scoreColor(item.score)}))));
  }
  candidates.forEach(item => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "potential-marker";
    element.textContent = item.score;
    element.style.setProperty("--potential",scoreColor(item.score));
    element.setAttribute("aria-label",`${item.name}: ${item.score}`);
    element.addEventListener("click",()=>openCandidate(item,true));
    candidateMarkers.push(new maplibregl.Marker({element,anchor:"center"}).setLngLat([item.lon,item.lat]).addTo(map));
  });
}

function updateCandidateScores() {
  candidates.forEach(item => {
    const distances = bakeries.map(([lat,lon])=>distanceKm(item.lat,item.lon,lat,lon)).sort((a,b)=>a-b);
    item.minutes = Math.max(1,Math.round((distances[0]||1)*15));
    item.competitors = distances.filter(distance=>distance<=.8).length;
    item.gap = Math.max(0,Math.round(item.population/2200)-item.competitors);
    const demand = Math.min(100,item.population/45);
    const access = Math.min(100,item.minutes*7);
    const scarcity = Math.max(0,100-item.competitors*20);
    item.score = Math.round(demand*.42+access*.33+scarcity*.25);
    item.reason = item.minutes >= 10 ? "Жилой кластер остаётся за пределами комфортной прогулки до ближайшей точки." : "Спрос поддерживается плотностью жителей, но ближайшие конкуренты снижают потенциал.";
    item.factors = [`${formatNumber(item.population)} жителей в радиусе анализа`,`${item.competitors} ${item.competitors===1?"конкурент":"конкурентов"} в пределах 800 м`,`ближайшая точка — около ${item.minutes} минут пешком`];
  });
  candidates.sort((a,b)=>b.score-a.score);
  renderCandidates();
  if(selectedCandidate)openCandidate(selectedCandidate);
}

function openCandidate(item,focusMap=false) {
  if(focusMap)Catchments.hide();
  selectedCandidate = item;
  document.querySelector(".sidebar").classList.remove("mobile-open");
  document.getElementById("mobileResults").setAttribute("aria-expanded","false");
  document.getElementById("mobileResults").textContent="Показать 6 лучших зон";
  const drawer=document.getElementById("detailDrawer");
  drawer.inert=false;
  if (focusMap && mapReady) {
    const mobile=window.matchMedia("(max-width: 820px)").matches;
    const offset=mobile?[0,-Math.min(window.innerHeight*.23,170)]:[-185,0];
    map.easeTo({center:[item.lon,item.lat],zoom:15.5,pitch:0,bearing:0,offset,duration:650});
  }
  document.querySelectorAll(".candidate-card").forEach(card=>card.classList.toggle("active",Number(card.dataset.id)===item.id));
  document.getElementById("detailScore").textContent=item.score;
  document.getElementById("detailLevel").textContent=item.score>=80?"высокий":item.score>=70?"средний":"умеренный";
  document.getElementById("detailTitle").textContent=item.name;
  document.getElementById("detailReason").textContent=item.reason || "Жилой кластер с потенциалом для новой точки.";
  document.getElementById("detailPopulation").textContent=formatNumber(item.population);
  document.getElementById("detailDistance").textContent=`${item.minutes} мин`;
  document.getElementById("detailCompetitors").textContent=item.competitors;
  document.getElementById("detailGap").textContent=`≈ ${item.gap} ${item.gap===1?"точка":"точки"}`;
  document.getElementById("detailFactors").innerHTML=(item.factors||[]).map(factor=>`<li>${factor}</li>`).join("");
  document.getElementById("detailDrawer").classList.add("open");
  document.getElementById("detailDrawer").setAttribute("aria-hidden","false");
  document.getElementById("drawerBackdrop").classList.add("open");
}
function closeDrawer() {
  document.getElementById("detailDrawer").classList.remove("open");
  document.getElementById("detailDrawer").setAttribute("aria-hidden","true");
  document.getElementById("detailDrawer").inert=true;
  document.getElementById("drawerBackdrop").classList.remove("open");
  document.querySelectorAll(".candidate-card").forEach(card=>card.classList.remove("active"));
  selectedCandidate=null;
}

function applyBakeryData(points,sourceLabel,status) {
  bakeries=points;
  renderBakeries();
  renderCoverage();
  updateCandidateScores();
  document.getElementById("pointCount").textContent=bakeries.length;
  document.getElementById("sourceLabel").textContent=sourceLabel;
  document.getElementById("mapStatus").innerHTML=`<span></span> ${status}`;
}
function updateBuildingStatus() {
  document.getElementById("buildingCount").textContent='2D';
  document.getElementById("buildingLabel").textContent='вид сверху';
  document.getElementById("buildingStatus").textContent='Наведите на пекарню · нажмите, чтобы рассмотреть дома';
}

map.on("load",()=>{
  mapReady=true;
  styleCartoonMap();
  map.addSource("bakery-building-highlight",{type:"geojson",data:featureCollection()});
  map.addLayer({id:"bakery-building-highlight",type:"line",source:"bakery-building-highlight",minzoom:14,
    paint:{"line-color":"#087d73","line-width":2}});
  map.addSource("potential",{type:"geojson",data:featureCollection()});
  const beforeBuildings=map.getLayer("building")?"building":undefined;
  map.addLayer({id:"potential-fill",type:"fill",source:"potential",paint:{"fill-color":["get","color"],"fill-opacity":.1}},beforeBuildings);
  map.addLayer({id:"potential-outline",type:"line",source:"potential",paint:{"line-color":["get","color"],"line-width":2,"line-opacity":.55,"line-dasharray":[3,3]}},beforeBuildings);
  map.addSource("coverage",{type:"geojson",data:featureCollection()});
  map.addLayer({id:"coverage-fill",type:"fill",source:"coverage",paint:{"fill-color":"#65b9a1","fill-opacity":.035}},beforeBuildings);
  map.addLayer({id:"coverage-outline",type:"line",source:"coverage",paint:{"line-color":"#438e7a","line-width":1,"line-opacity":.2}},beforeBuildings);
  // Radius overlays are temporarily hidden; keep points and zone markers.
  ["potential-fill","potential-outline","coverage-fill","coverage-outline"].forEach(id=>map.setLayoutProperty(id,"visibility","none"));
  renderCandidates();
  renderBakeries();
  renderCoverage();
  updateBuildingStatus();
  Catchments.init();
});
map.on("moveend",()=>{ renderBakeries(); renderCoverage(); updateBuildingStatus(); });
map.on("mousemove",inspectBakeryBuilding);
map.on("movestart",clearBuildingHighlight);
map.getCanvas().addEventListener("mouseleave",()=>{clearBuildingHighlight();Catchments.leave();});
map.on("error",event=>{ if(!mapReady) document.getElementById("mapStatus").innerHTML="<span></span> Карта временно недоступна"; });

document.querySelectorAll("[data-minutes]").forEach(button=>button.addEventListener("click",()=>{
  walkMinutes=Number(button.dataset.minutes);
  document.querySelectorAll("[data-minutes]").forEach(item=>item.classList.toggle("active",item===button));
  renderCoverage();
}));
document.getElementById("drawerClose").addEventListener("click",closeDrawer);
document.getElementById("drawerBackdrop").addEventListener("click",closeDrawer);
document.getElementById("mobileResults").addEventListener("click",()=>{
  closeDrawer();
  const open=document.querySelector(".sidebar").classList.toggle("mobile-open");
  document.getElementById("mobileResults").setAttribute("aria-expanded",String(open));
  document.getElementById("mobileResults").textContent=open?"Вернуться к карте":"Показать 6 лучших зон";
});
const methodDialog=document.getElementById("methodDialog");
document.getElementById("methodButton").addEventListener("click",()=>methodDialog.showModal());
document.getElementById("dialogClose").addEventListener("click",()=>methodDialog.close());
methodDialog.addEventListener("click",event=>{if(event.target===methodDialog)methodDialog.close();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&selectedCandidate)closeDrawer();});
renderCandidates();

const modelContext=document.modelContext;
if(modelContext?.registerTool){
  try{
    void Promise.resolve(modelContext.registerTool({
      name:"list_candidate_zones",title:"List candidate zones",
      description:"Read the ranked candidate zones for a new bakery in Hannover, optionally filtered by minimum potential score.",
      inputSchema:{type:"object",properties:{minimumScore:{type:"number",minimum:0,maximum:100,description:"Minimum potential score from 0 to 100"}},additionalProperties:false},
      annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute:(input={})=>{
        const minimumScore=input.minimumScore??0;
        if(typeof minimumScore!=="number"||minimumScore<0||minimumScore>100)throw new Error("minimumScore must be a number from 0 to 100");
        return candidates.filter(item=>item.score>=minimumScore);
      }
    })).catch(()=>{});
  }catch(_){}
}
