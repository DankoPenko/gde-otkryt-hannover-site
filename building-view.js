// Lightweight, code-native material for the map geometry; no image downloads.
const BuildingView=(()=>{
  const pitch=28;
  const colors={neutral:[205,215,224],residential:[70,169,155],other:[154,149,182]};
  function material(rgb){
    const size=64,data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const i=(y*size+x)*4;
      // Fine matte grain and very faint horizontal seams, not busy brickwork.
      const grain=((x*73+y*151+x*y*7)%11)-5;
      const seam=y%16===0?-7:0;
      for(let c=0;c<3;c++)data[i+c]=Math.max(0,Math.min(255,rgb[c]+grain+seam));
      data[i+3]=255;
    }
    return {width:size,height:size,data};
  }
  const height=['max',2.5,['min',18,['*',.75,['coalesce',['get','render_height'],8]]]];
  const grow=value=>['interpolate',['linear'],['zoom'],13,0,15,value];
  const selectedHeight=['coalesce',['get','viewHeight'],8];
  const pattern=['match',['get','kind'],'residential','matte-residential','matte-other'];
  const roofColor=['match',['get','kind'],'residential','#76c6b9','#b7b2d0'];
  function paint(h,texture,color,cap=false){
    return {
      'fill-extrusion-height':grow(cap?h:['max',0,['-',h,.35]]),
      'fill-extrusion-base':cap?grow(['max',0,['-',h,.35]]):0,
      'fill-extrusion-opacity':1,
      'fill-extrusion-vertical-gradient':true,
      ...(cap?{'fill-extrusion-color':color}:{'fill-extrusion-pattern':texture})
    };
  }
  function init(map){
    Object.entries(colors).forEach(([name,rgb])=>map.addImage('matte-'+name,material(rgb),{pixelRatio:2}));
    map.setLight({anchor:'viewport',color:'#ffffff',intensity:.32,position:[1.4,210,35]});
    const layer=map.getLayer('building-3d');
    if(!layer)return;
    map.setLayerZoomRange('building-3d',13,24);
    Object.entries(paint(height,'matte-neutral','#dce4e9')).forEach(([key,value])=>map.setPaintProperty('building-3d',key,value));
    map.setLayoutProperty('building-3d','visibility','visible');
    const layers=map.getStyle().layers;
    const next=layers[layers.findIndex(l=>l.id==='building-3d')+1]?.id;
    map.addLayer({id:'building-roofs',type:'fill-extrusion',source:'openmaptiles','source-layer':'building',minzoom:13,paint:paint(height,null,'#dce4e9',true)},next);
  }
  function addCatchment(map,before){
    map.addLayer({id:'catchment-3d',type:'fill-extrusion',source:'bakery-catchment',minzoom:13,paint:paint(selectedHeight,pattern,roofColor)},before);
    map.addLayer({id:'catchment-roofs',type:'fill-extrusion',source:'bakery-catchment',minzoom:13,paint:paint(selectedHeight,null,roofColor,true)},before);
  }
  function focus(map,selected){
    // The vector basemap and saved OSM snapshot can differ. Never draw their
    // extrusions on top of each other: contextual footprints stay visible.
    for(const id of ['building-3d','building-roofs'])if(map.getLayer(id))map.setLayoutProperty(id,'visibility',selected?'none':'visible');
  }
  return {pitch,init,addCatchment,focus};
})();
