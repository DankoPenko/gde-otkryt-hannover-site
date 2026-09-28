/* Bakery coordinates are matched only to containing footprints, never to a
   guessed nearest house. Polygon holes (courtyards) are excluded. */
const BuildingMatch=(()=>{
  function inRing(ring,point){
    let inside=false;
    const [x,y]=point;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const [xi,yi]=ring[i], [xj,yj]=ring[j];
      const cross=(x-xi)*(yj-yi)-(y-yi)*(xj-xi);
      if(Math.abs(cross)<1e-12&&x>=Math.min(xi,xj)&&x<=Math.max(xi,xj)&&y>=Math.min(yi,yj)&&y<=Math.max(yi,yj))return true;
      if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
    }
    return inside;
  }
  function componentAt(geometry,point){
    const polygons=geometry?.type==="Polygon"?[geometry.coordinates]:geometry?.type==="MultiPolygon"?geometry.coordinates:[];
    const coordinates=polygons.find(rings=>rings.length&&inRing(rings[0],point)&&!rings.slice(1).some(ring=>inRing(ring,point)));
    return coordinates?{type:"Polygon",coordinates}:null;
  }
  function contains(geometry,point){return componentAt(geometry,point)!==null;}
  return {contains,componentAt};
})();
