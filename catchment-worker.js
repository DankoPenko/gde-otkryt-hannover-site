importScripts('./catchment-core.js');
let datasetPromise=null,dataset=null,groups=[],revision=0;
function load(){
  if(!datasetPromise)datasetPromise=fetch('./data/buildings.json.gz').then(r=>{
    if(!r.ok)throw new Error('Building data unavailable');
    return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();
  }).then(data=>{
    if(data.schema!==1||!Array.isArray(data.buildings)||!data.buildings.length)throw new Error('Invalid building data');
    dataset=data;return data;
  }).catch(error=>{datasetPromise=null;throw error;});
  return datasetPromise;
}
self.onmessage=async({data:message})=>{
  try{
    if(message.type==='compute'){
      revision=message.revision;
      const data=await load();
      if(revision!==message.revision)return;
      groups=CatchmentCore.assign(data.buildings,message.bakeries);
      self.postMessage({type:'ready',revision,meta:{snapshot:data.snapshot,summary:data.summary,assumptions:data.assumptions},groups:groups.map(({indices,...stats})=>stats)});
    }else if(message.type==='select'&&message.revision===revision&&dataset){
      const group=groups.find(g=>g.key===message.key);
      const features=(group?.indices||[]).map(index=>{
        const b=dataset.buildings[index];
        return {type:'Feature',id:b.id,geometry:b.g,properties:{height:b.h+.35,kind:b.r}};
      });
      self.postMessage({type:'selection',revision,key:message.key,request:message.request,features});
    }
  }catch(error){self.postMessage({type:'error',revision:message.revision,message:error.message});}
};
