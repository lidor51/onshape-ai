import * as THREE from '../../trials/whole-robot-concepts/mechanisms/node_modules/three/build/three.module.js';

export function fitCircle(points){
  if(points.length<8)return undefined;
  const count=points.length;const average=points.reduce((sum,point)=>[sum[0]+point[0]/count,sum[1]+point[1]/count],[0,0]);
  const centered=points.map(point=>[point[0]-average[0],point[1]-average[1]]);
  let firstSquare=0;let cross=0;let secondSquare=0;let firstTarget=0;let secondTarget=0;
  for(const [first,second] of centered){const square=first*first+second*second;firstSquare+=first*first;cross+=first*second;secondSquare+=second*second;firstTarget+=first*square/2;secondTarget+=second*square/2;}
  const determinant=firstSquare*secondSquare-cross*cross;
  if(determinant<=1e-12)return undefined;
  const offset=[(firstTarget*secondSquare-secondTarget*cross)/determinant,(secondTarget*firstSquare-firstTarget*cross)/determinant];
  const center=[average[0]+offset[0],average[1]+offset[1]];
  const distances=points.map(point=>Math.hypot(point[0]-center[0],point[1]-center[1]));
  const radius=distances.reduce((sum,value)=>sum+value/count,0);
  const maximumResidual=Math.max(...distances.map(value=>Math.abs(value-radius)));
  return {center,radius,maximumResidual,samples:count};
}

export function boreLoops(holder,{includeNoncircular=false}={}){
  holder.updateMatrixWorld(true);const result=[];
  holder.traverse(object=>{
    if(!object.isMesh)return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld).scale(1000,1000,1000);
    geometry.computeBoundingBox();const bounds=geometry.boundingBox;const edges=new THREE.EdgesGeometry(geometry,20);const position=edges.attributes.position;
    for(const planeX of [bounds.min.x,bounds.max.x]){
      const points=new Map();const neighbors=new Map();
      const key=point=>`${Math.round(point[1]/0.001)},${Math.round(point[2]/0.001)}`;
      for(let index=0;index<position.count;index+=2){
        const first=[position.getX(index),position.getY(index),position.getZ(index)];const second=[position.getX(index+1),position.getY(index+1),position.getZ(index+1)];
        if(Math.abs(first[0]-planeX)>0.01||Math.abs(second[0]-planeX)>0.01)continue;
        const firstKey=key(first);const secondKey=key(second);if(firstKey===secondKey)continue;
        points.set(firstKey,first.slice(1));points.set(secondKey,second.slice(1));
        if(!neighbors.has(firstKey))neighbors.set(firstKey,new Set());if(!neighbors.has(secondKey))neighbors.set(secondKey,new Set());
        neighbors.get(firstKey).add(secondKey);neighbors.get(secondKey).add(firstKey);
      }
      const visited=new Set();
      for(const start of points.keys()){
        if(visited.has(start))continue;
        const component=[];const pending=[start];let closed=true;
        while(pending.length){const current=pending.pop();if(visited.has(current))continue;visited.add(current);component.push(points.get(current));if(neighbors.get(current).size!==2)closed=false;for(const neighbor of neighbors.get(current))if(!visited.has(neighbor))pending.push(neighbor);}
        if(!closed)continue;
        const circle=fitCircle(component);
        if(circle&&circle.maximumResidual<0.02&&circle.radius>=1&&circle.radius<=40)result.push({planeX,...circle});
        else if(includeNoncircular&&component.length>=6){
          const minimum=[Math.min(...component.map(point=>point[0])),Math.min(...component.map(point=>point[1]))];
          const maximum=[Math.max(...component.map(point=>point[0])),Math.max(...component.map(point=>point[1]))];
          const size=maximum.map((value,index)=>value-minimum[index]);
          if(Math.max(...size)<=80)result.push({planeX,type:'UNCLASSIFIED_CLOSED_OUTLINE',center:maximum.map((value,index)=>(value+minimum[index])/2),size,points:component});
        }
      }
    }
    edges.dispose();geometry.dispose();
  });
  return result;
}