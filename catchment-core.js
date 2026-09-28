(function(root){
  const radians=Math.PI/180;
  function key(point){return `${point[0].toFixed(7)},${point[1].toFixed(7)}:${point[2]}`;}
  function vector(lon,lat){const p=lat*radians,l=lon*radians,c=Math.cos(p);return [c*Math.cos(l),c*Math.sin(l),Math.sin(p)];}
  function assign(buildings,bakeries){
    const sites=bakeries.map((point,index)=>({index,key:key(point),v:vector(point[1],point[0])})).sort((a,b)=>a.key.localeCompare(b.key));
    const groups=bakeries.map(point=>({key:key(point),indices:[],buildings:0,residential:0,unknown:0,other:0,population:0,levelsAssumed:0,distanceSum:0,maxDistance:0,edge:false}));
    if(!sites.length)return groups;
    buildings.forEach((building,index)=>{
      const v=vector(...building.c);let best=null,distance=Infinity;
      for(const site of sites){
        const d=(v[0]-site.v[0])**2+(v[1]-site.v[1])**2+(v[2]-site.v[2])**2;
        if(d<distance-1e-20){best=site;distance=d;}
      }
      const metres=2*6371000*Math.asin(Math.min(1,Math.sqrt(distance)/2));
      const group=groups[best.index];group.indices.push(index);group.buildings++;group[building.r]++;
      group.population+=building.p;
      if(building.r==='residential'&&!building.k)group.levelsAssumed++;
      group.distanceSum+=metres;group.maxDistance=Math.max(group.maxDistance,metres);
      if(building.c[0]<9.604||building.c[0]>9.876||building.c[1]<52.303||building.c[1]>52.447)group.edge=true;
    });
    return groups;
  }
  const api={key,assign};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.CatchmentCore=api;
})(typeof self!=='undefined'?self:globalThis);
