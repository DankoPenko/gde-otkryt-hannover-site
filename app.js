let bakeries = [
  [52.3759,9.7320,"BackWerk Kröpcke"],[52.3745,9.7380,"Ditsch Hauptbahnhof"],[52.3705,9.7350,"Bäckerei am Aegi"],
  [52.3812,9.7177,"Linden Brot"],[52.3685,9.7140,"Calenberger Backstube"],[52.3600,9.7182,"Südstadt Bäckerei"],
  [52.3890,9.7356,"Nordstadt Backhaus"],[52.3978,9.7420,"Vahrenwalder Bäcker"],[52.4045,9.7650,"List Brot"],
  [52.3890,9.7610,"Lister Meile Bäckerei"],[52.3758,9.7720,"Kleefelder Backstube"],[52.3600,9.7700,"Bult Bäckerei"],
  [52.3508,9.7330,"Döhrener Brot"],[52.3415,9.7470,"Wülfeler Backhaus"],[52.3650,9.6900,"Linden-Mitte Bäckerei"],
  [52.3735,9.6810,"Limmer Brot"],[52.3980,9.6870,"Stöckener Backstube"],[52.4140,9.7100,"Hainholz Bäcker"],
  [52.4170,9.8040,"Bothfelder Backhaus"],[52.3900,9.8230,"Misburger Bäckerei"],[52.3540,9.8060,"Kirchroder Brot"],
  [52.3320,9.7000,"Ricklinger Backstube"],[52.3300,9.7800,"Mittelfelder Bäcker"],[52.3860,9.7020,"Bäckerei am Küchengarten"],
  [52.3937336,9.6845368,"Rautes MarktCafé Herrenhausen"]
];

const verifiedUserPoints = [[52.3937336,9.6845368,"Rautes MarktCafé Herrenhausen"]];
const candidates = [
  {id:1,name:"Mühlenberg · центр",lat:52.3433,lon:9.6625,score:89,population:4800,minutes:14,competitors:1,gap:2},
  {id:2,name:"Sahlkamp · север",lat:52.4198,lon:9.7560,score:84,population:4200,minutes:13,competitors:1,gap:2},
  {id:3,name:"Bemerode · восток",lat:52.3485,lon:9.8385,score:81,population:3900,minutes:12,competitors:1,gap:1},
  {id:4,name:"Ahlem · юг",lat:52.3728,lon:9.6465,score:76,population:3100,minutes:12,competitors:1,gap:1},
  {id:5,name:"Anderten · станция",lat:52.3595,lon:9.8565,score:71,population:2700,minutes:11,competitors:2,gap:1},
  {id:6,name:"Ledeburg · центр",lat:52.4230,lon:9.6935,score:68,population:2400,minutes:11,competitors:2,gap:1}
];

const overpassEndpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter"
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
  pitch:38,
  bearing:-8,
  minZoom:10.5,
  maxZoom:18,
  maxPitch:62,
  attributionControl:true,
  canvasContextAttributes:{antialias:true}
});
map.addControl(new maplibregl.NavigationControl({showCompass:true,visualizePitch:true}),"top-right");

function formatNumber(value) { return new Intl.NumberFormat("ru-RU").format(value); }
function scoreColor(score) { return score >= 80 ? "#f39a70" : score >= 70 ? "#f4c857" : "#d8ef72"; }
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
  safePaint("background","background-color","#f6e8be");
  safePaint("park","fill-color","#9edc7d");
  safePaint("park","fill-opacity",.92);
  safePaint("park_outline","line-color","#5f9360");
  safePaint("park_outline","line-width",2);
  safePaint("landuse_residential","fill-color","#f7dfad");
  safePaint("landuse_residential","fill-opacity",.76);
  safePaint("landcover_wood","fill-color","#82c779");
  safePaint("landcover_grass","fill-color","#b9e38d");
  safePaint("landcover_wetland","fill-color","#9dd7b0");
  safePaint("landcover_sand","fill-color","#f3d68a");
  safePaint("landuse_pitch","fill-color","#8ed394");
  safePaint("landuse_cemetery","fill-color","#b0d795");
  safePaint("landuse_hospital","fill-color","#f3b7b1");
  safePaint("landuse_school","fill-color","#f6cf86");
  safePaint("water","fill-color","#7bcbe8");
  ["waterway_river","waterway_other"].forEach(id => safePaint(id,"line-color","#69b9dc"));
  ["road_minor","road_service_track","road_link","tunnel_minor","bridge_street"].forEach(id => safePaint(id,"line-color","#fff7db"));
  ["road_secondary_tertiary","bridge_secondary_tertiary"].forEach(id => safePaint(id,"line-color","#ffe1a0"));
  ["road_trunk_primary","bridge_trunk_primary"].forEach(id => safePaint(id,"line-color","#f7ad77"));
  ["road_motorway","bridge_motorway"].forEach(id => safePaint(id,"line-color","#ef8f6f"));
  map.getStyle().layers.filter(layer => layer.id.includes("casing")).forEach(layer => safePaint(layer.id,"line-color","#8c7861"));
  safePaint("building","fill-color","#f0bf91");
  safePaint("building","fill-outline-color","#9c765d");
  safePaint("building","fill-opacity",.92);
  safeLayout("building-3d","visibility","visible");
  safePaint("building-3d","fill-extrusion-color",["interpolate",["linear"],["get","render_height"],0,"#ffd5a4",30,"#f1ad82",100,"#df8b74"]);
  safePaint("building-3d","fill-extrusion-opacity",.96);
  ["poi_r20","poi_r7","poi_r1","poi_transit","road_one_way_arrow","road_one_way_arrow_opposite","highway-name-path","highway-name-minor","highway-shield-non-us","highway-shield-us-interstate","road_shield_us","boundary_3","boundary_2","boundary_disputed"].forEach(id => safeLayout(id,"visibility","none"));
  ["highway-name-major","label_other","label_village","label_town","label_city","label_city_capital"].forEach(id => {
    safePaint(id,"text-color","#314d43");
    safePaint(id,"text-halo-color","#fff4cf");
    safePaint(id,"text-halo-width",2);
  });
  try { map.setLight({anchor:"viewport",color:"#fff3cf",intensity:.55,position:[1.15,210,35]}); } catch (_) {}
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
  const zoom = map.getZoom();
  if (zoom < 14) {
    const cellSize = zoom <= 12 ? .035 : .018;
    const groups = new Map();
    bakeries.forEach(point => {
      const key = `${Math.round(point[0]/cellSize)}:${Math.round(point[1]/cellSize)}`;
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(point);
    });
    groups.forEach(points => {
      const lat = points.reduce((sum,p)=>sum+p[0],0)/points.length;
      const lon = points.reduce((sum,p)=>sum+p[1],0)/points.length;
      if (points.length === 1) {
        bakeryMarkers.push(createBakeryMarker(points[0]));
        return;
      }
      const element = document.createElement("button");
      element.type = "button";
      element.className = "cluster-marker";
      element.textContent = points.length;
      element.setAttribute("aria-label",`${points.length} пекарен`);
      element.addEventListener("click",() => map.easeTo({center:[lon,lat],zoom:Math.min(15,zoom+2),duration:700}));
      bakeryMarkers.push(new maplibregl.Marker({element,anchor:"center"}).setLngLat([lon,lat]).addTo(map));
    });
    return;
  }
  const bounds = map.getBounds();
  bakeries.filter(([lat,lon])=>bounds.contains([lon,lat])).forEach(point => bakeryMarkers.push(createBakeryMarker(point)));
}

function createBakeryMarker([lat,lon,name]) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "bakery-pin";
  element.innerHTML = "<span>🥐</span>";
  element.setAttribute("aria-label",name);
  const popup = new maplibregl.Popup({offset:22,closeButton:false}).setHTML(`<strong>${name}</strong><br><span style="color:#6d7f76">Пекарня или кафе-пекарня</span>`);
  return new maplibregl.Marker({element,anchor:"bottom"}).setLngLat([lon,lat]).setPopup(popup).addTo(map);
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
}

function openCandidate(item,focusMap=false) {
  selectedCandidate = item;
  if (focusMap && mapReady) map.easeTo({center:[item.lon,item.lat],zoom:15.4,pitch:52,bearing:-18,duration:900});
  document.querySelectorAll(".candidate-card").forEach(card=>card.classList.toggle("active",Number(card.dataset.id)===item.id));
  document.getElementById("detailScore").textContent=item.score;
  document.getElementById("detailLevel").textContent=item.score>=80?"высокий":"средний";
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
  document.getElementById("drawerBackdrop").classList.remove("open");
  document.querySelectorAll(".candidate-card").forEach(card=>card.classList.remove("active"));
  selectedCandidate=null;
}

function coordinatesFor(element) {
  if (typeof element.lat === "number" && typeof element.lon === "number") return [element.lat,element.lon];
  if (element.center && typeof element.center.lat === "number") return [element.center.lat,element.center.lon];
  return null;
}
function mergeVerifiedPoints(points) {
  const merged=[...points];
  verifiedUserPoints.forEach(point=>{
    const index=merged.findIndex(item=>Math.abs(item[0]-point[0])<.00045&&Math.abs(item[1]-point[1])<.0007);
    if(index>=0) merged[index]=point; else merged.push(point);
  });
  return merged;
}
function applyBakeryData(points,sourceLabel,status) {
  bakeries=mergeVerifiedPoints(points);
  renderBakeries();
  renderCoverage();
  updateCandidateScores();
  document.getElementById("pointCount").textContent=bakeries.length;
  document.getElementById("sourceLabel").textContent=sourceLabel;
  document.getElementById("mapStatus").innerHTML=`<span></span> ${status}`;
}
async function loadLiveBakeries() {
  const query=`[out:json][timeout:20];(nwr["shop"="bakery"](52.30,9.60,52.45,9.88);nwr["amenity"="cafe"]["name"~"Bäck|Back|Brot|MarktCaf",i](52.30,9.60,52.45,9.88););out center tags;`;
  let cached=null;
  try {
    cached=JSON.parse(localStorage.getItem("hannover-bakeries-v1"));
    if(cached?.points?.length>10&&Date.now()-cached.savedAt<7*24*60*60*1000) applyBakeryData(cached.points,"кэш OSM + проверенные","Точки из кэша · обновляем…");
  } catch (_) { cached=null; }
  for(const endpoint of overpassEndpoints) {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch(`${endpoint}?data=${encodeURIComponent(query)}`,{signal:controller.signal});
      if(!response.ok) throw new Error(`OSM ${response.status}`);
      const payload=await response.json();
      const live=payload.elements.map(element=>{
        const coordinates=coordinatesFor(element);
        return coordinates?[coordinates[0],coordinates[1],element.tags?.name||element.tags?.brand||"Пекарня"]:null;
      }).filter(Boolean);
      if(live.length<10) throw new Error("Small OSM result");
      const merged=mergeVerifiedPoints(live);
      try { localStorage.setItem("hannover-bakeries-v1",JSON.stringify({savedAt:Date.now(),points:merged})); } catch (_) {}
      applyBakeryData(merged,"OSM + проверенные","Актуальные точки загружены");
      return;
    } catch (_) {} finally { clearTimeout(timer); }
  }
  if(cached?.points?.length>10) {
    document.getElementById("mapStatus").innerHTML="<span></span> Кэш OSM · обновление недоступно";
    return;
  }
  applyBakeryData(bakeries,"резервная выборка","Резервные данные · OSM недоступен");
}

function updateBuildingStatus() {
  const is3d=map.getZoom()>=15;
  document.getElementById("buildingCount").textContent=is3d?"3D":"2D";
  document.getElementById("buildingLabel").textContent=is3d?"дома в районе":"вид сверху";
  document.getElementById("buildingStatus").textContent=is3d?"⌂ Объёмные дома из OSM":"⌂ Приблизьте — домики станут объёмными";
}

map.on("load",()=>{
  mapReady=true;
  styleCartoonMap();
  map.addSource("potential",{type:"geojson",data:featureCollection()});
  map.addLayer({id:"potential-fill",type:"fill",source:"potential",paint:{"fill-color":["get","color"],"fill-opacity":.22}});
  map.addLayer({id:"potential-outline",type:"line",source:"potential",paint:{"line-color":["get","color"],"line-width":3,"line-opacity":.86}});
  map.addSource("coverage",{type:"geojson",data:featureCollection()});
  map.addLayer({id:"coverage-fill",type:"fill",source:"coverage",paint:{"fill-color":"#65b9a1","fill-opacity":.1}});
  map.addLayer({id:"coverage-outline",type:"line",source:"coverage",paint:{"line-color":"#438e7a","line-width":1.5,"line-opacity":.35}});
  renderCandidates();
  renderBakeries();
  renderCoverage();
  updateBuildingStatus();
  loadLiveBakeries();
});
map.on("moveend",()=>{ renderBakeries(); renderCoverage(); updateBuildingStatus(); });
map.on("error",event=>{ if(!mapReady) document.getElementById("mapStatus").innerHTML="<span></span> Карта временно недоступна"; });

document.querySelectorAll("[data-minutes]").forEach(button=>button.addEventListener("click",()=>{
  walkMinutes=Number(button.dataset.minutes);
  document.querySelectorAll("[data-minutes]").forEach(item=>item.classList.toggle("active",item===button));
  renderCoverage();
}));
document.getElementById("drawerClose").addEventListener("click",closeDrawer);
document.getElementById("drawerBackdrop").addEventListener("click",closeDrawer);
document.getElementById("mobileResults").addEventListener("click",()=>openCandidate(candidates[0],true));
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
