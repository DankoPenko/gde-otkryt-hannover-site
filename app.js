const bakeries = [
  [52.3759,9.7320,"BackWerk Kröpcke"],[52.3745,9.7380,"Ditsch Hauptbahnhof"],[52.3705,9.7350,"Bäckerei am Aegi"],
  [52.3812,9.7177,"Linden Brot"],[52.3685,9.7140,"Calenberger Backstube"],[52.3600,9.7182,"Südstadt Bäckerei"],
  [52.3890,9.7356,"Nordstadt Backhaus"],[52.3978,9.7420,"Vahrenwalder Bäcker"],[52.4045,9.7650,"List Brot"],
  [52.3890,9.7610,"Lister Meile Bäckerei"],[52.3758,9.7720,"Kleefelder Backstube"],[52.3600,9.7700,"Bult Bäckerei"],
  [52.3508,9.7330,"Döhrener Brot"],[52.3415,9.7470,"Wülfeler Backhaus"],[52.3650,9.6900,"Linden-Mitte Bäckerei"],
  [52.3735,9.6810,"Limmer Brot"],[52.3980,9.6870,"Stöckener Backstube"],[52.4140,9.7100,"Hainholz Bäcker"],
  [52.4170,9.8040,"Bothfelder Backhaus"],[52.3900,9.8230,"Misburger Bäckerei"],[52.3540,9.8060,"Kirchroder Brot"],
  [52.3320,9.7000,"Ricklinger Backstube"],[52.3300,9.7800,"Mittelfelder Bäcker"],[52.3860,9.7020,"Bäckerei am Küchengarten"]
];

const candidates = [
  { id:1, name:"Mühlenberg · центр", lat:52.3433, lon:9.6625, score:89, population:4800, minutes:14, competitors:1, gap:2, reason:"Крупный жилой кластер и мало точек в комфортной пешей доступности.", factors:["4 800 жителей в радиусе анализа","только 1 конкурент рядом","ближайшая точка — около 14 минут пешком"] },
  { id:2, name:"Sahlkamp · север", lat:52.4198, lon:9.7560, score:84, population:4200, minutes:13, competitors:1, gap:2, reason:"Плотная жилая застройка на границе существующих зон обслуживания.", factors:["высокая плотность жилых домов","слабое перекрытие доступности","разрыв между соседними торговыми улицами"] },
  { id:3, name:"Bemerode · восток", lat:52.3485, lon:9.8385, score:81, population:3900, minutes:12, competitors:1, gap:1, reason:"Растущий жилой кластер находится за пределами удобной прогулки.", factors:["3 900 жителей рядом","низкая плотность прямых конкурентов","точка может закрыть восточную часть района"] },
  { id:4, name:"Ahlem · юг", lat:52.3728, lon:9.6465, score:76, population:3100, minutes:12, competitors:1, gap:1, reason:"Заметный карман спроса между Ahlem и Davenstedt.", factors:["жилой кластер без близкой точки","умеренная конкуренция","хорошая связность с соседними кварталами"] },
  { id:5, name:"Anderten · станция", lat:52.3595, lon:9.8565, score:71, population:2700, minutes:11, competitors:2, gap:1, reason:"Потенциал поддерживает транспортный узел, но конкуренция выше.", factors:["поток у станции","2 конкурента в расширенной зоне","локальный разрыв в южном направлении"] },
  { id:6, name:"Ledeburg · центр", lat:52.4230, lon:9.6935, score:68, population:2400, minutes:11, competitors:2, gap:1, reason:"Небольшая, но хорошо очерченная зона неудовлетворённого спроса.", factors:["2 400 жителей рядом","слабое покрытие в центре квартала","ограниченный, но понятный локальный рынок"] }
];

const map = L.map("map", { zoomControl:false, minZoom:11, maxZoom:18 }).setView([52.3745, 9.7386], 12);
L.control.zoom({ position:"topright" }).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom:19,
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const bakeryLayer = L.layerGroup().addTo(map);
const coverageLayer = L.layerGroup().addTo(map);
const candidateLayer = L.layerGroup().addTo(map);
const candidateMarkers = new Map();
let walkMinutes = 10;
let selectedCandidate = null;

const bakeryIcon = L.divIcon({ className:"", html:'<div class="bakery-marker"></div>', iconSize:[22,22], iconAnchor:[11,20] });

function coverageRadius() { return ({5:360,10:720,15:1080})[walkMinutes]; }
function formatNumber(value) { return new Intl.NumberFormat("ru-RU").format(value); }
function scoreColor(score) { return score >= 80 ? "#ea8157" : score >= 70 ? "#efcc68" : "#d8f36a"; }

function renderCoverage() {
  coverageLayer.clearLayers();
  const radius = coverageRadius();
  bakeries.forEach(([lat, lon]) => {
    L.circle([lat,lon], { radius, stroke:true, weight:1, color:"#7d9b8e", opacity:.18, fill:true, fillColor:"#a9c0b5", fillOpacity:.08, interactive:false }).addTo(coverageLayer);
  });
  document.getElementById("walkLabel").textContent = `при ${walkMinutes} мин пешком`;
  const totals = {5:"31,4 тыс.",10:"18,7 тыс.",15:"9,2 тыс."};
  document.getElementById("uncoveredTotal").textContent = totals[walkMinutes];
}

function renderBakeries() {
  bakeries.forEach(([lat,lon,name]) => {
    L.marker([lat,lon], {icon:bakeryIcon, keyboard:true, title:name})
      .bindTooltip(`<b>${name}</b><br><span style="color:#74817c">Существующая точка</span>`, {direction:"top", offset:[0,-16]})
      .addTo(bakeryLayer);
  });
}

function renderCandidates() {
  const list = document.getElementById("candidateList");
  list.innerHTML = candidates.map(item => `
    <button class="candidate-card" type="button" data-id="${item.id}" aria-label="Открыть зону ${item.name}, потенциал ${item.score} из 100">
      <span class="score-ring" style="--score:${item.score};--score-color:${scoreColor(item.score)}"><span>${item.score}</span></span>
      <span><strong>${item.name}</strong><small>${formatNumber(item.population)} жителей · ${item.minutes} мин до точки</small></span>
      <span class="candidate-arrow">›</span>
    </button>`).join("");

  candidates.forEach(item => {
    const icon = L.divIcon({className:"", html:`<div class="potential-marker" style="--potential:${scoreColor(item.score)}">${item.score}</div>`, iconSize:[36,36], iconAnchor:[18,18]});
    const halo = L.circle([item.lat,item.lon], {radius:520, color:scoreColor(item.score), weight:1.5, opacity:.65, fillColor:scoreColor(item.score), fillOpacity:.16}).addTo(candidateLayer);
    const marker = L.marker([item.lat,item.lon], {icon, title:`${item.name}: ${item.score}`}).addTo(candidateLayer);
    marker.on("click", () => openCandidate(item));
    halo.on("click", () => openCandidate(item));
    candidateMarkers.set(item.id, marker);
  });

  list.addEventListener("click", event => {
    const card = event.target.closest(".candidate-card");
    if (!card) return;
    const item = candidates.find(candidate => candidate.id === Number(card.dataset.id));
    map.flyTo([item.lat,item.lon], 14, {duration:.7});
    openCandidate(item);
  });
}

function openCandidate(item) {
  selectedCandidate = item;
  document.querySelectorAll(".candidate-card").forEach(card => card.classList.toggle("active", Number(card.dataset.id) === item.id));
  document.getElementById("detailScore").textContent = item.score;
  document.getElementById("detailLevel").textContent = item.score >= 80 ? "высокий" : "средний";
  document.getElementById("detailTitle").textContent = item.name;
  document.getElementById("detailReason").textContent = item.reason;
  document.getElementById("detailPopulation").textContent = formatNumber(item.population);
  document.getElementById("detailDistance").textContent = `${item.minutes} мин`;
  document.getElementById("detailCompetitors").textContent = item.competitors;
  document.getElementById("detailGap").textContent = `≈ ${item.gap} ${item.gap === 1 ? "точка" : "точки"}`;
  document.getElementById("detailFactors").innerHTML = item.factors.map(factor => `<li>${factor}</li>`).join("");
  document.getElementById("detailDrawer").classList.add("open");
  document.getElementById("detailDrawer").setAttribute("aria-hidden","false");
  document.getElementById("drawerBackdrop").classList.add("open");
}

function closeDrawer() {
  document.getElementById("detailDrawer").classList.remove("open");
  document.getElementById("detailDrawer").setAttribute("aria-hidden","true");
  document.getElementById("drawerBackdrop").classList.remove("open");
  document.querySelectorAll(".candidate-card").forEach(card => card.classList.remove("active"));
  selectedCandidate = null;
}

document.querySelectorAll("[data-minutes]").forEach(button => button.addEventListener("click", () => {
  walkMinutes = Number(button.dataset.minutes);
  document.querySelectorAll("[data-minutes]").forEach(item => item.classList.toggle("active", item === button));
  renderCoverage();
}));
document.getElementById("drawerClose").addEventListener("click", closeDrawer);
document.getElementById("drawerBackdrop").addEventListener("click", closeDrawer);
document.getElementById("mobileResults").addEventListener("click", () => openCandidate(candidates[0]));

const methodDialog = document.getElementById("methodDialog");
document.getElementById("methodButton").addEventListener("click", () => methodDialog.showModal());
document.getElementById("dialogClose").addEventListener("click", () => methodDialog.close());
methodDialog.addEventListener("click", event => { if (event.target === methodDialog) methodDialog.close(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && selectedCandidate) closeDrawer(); });

renderCoverage();
renderBakeries();
renderCandidates();

window.addEventListener("load", () => setTimeout(() => map.invalidateSize(), 50));

// WebMCP: lets compatible agents inspect the same ranking shown in the interface.
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  try {
    void Promise.resolve(modelContext.registerTool({
      name:"list_candidate_zones",
      title:"List candidate zones",
      description:"Read the ranked candidate zones for a new bakery in Hannover, optionally filtered by minimum potential score.",
      inputSchema:{
        type:"object",
        properties:{minimumScore:{type:"number",minimum:0,maximum:100,description:"Minimum potential score from 0 to 100"}},
        additionalProperties:false
      },
      annotations:{readOnlyHint:true,untrustedContentHint:false},
      execute:(input={}) => {
        const minimumScore = input.minimumScore ?? 0;
        if (typeof minimumScore !== "number" || minimumScore < 0 || minimumScore > 100) throw new Error("minimumScore must be a number from 0 to 100");
        return candidates.filter(item => item.score >= minimumScore);
      }
    })).catch(() => {});
  } catch (_) {}
}
