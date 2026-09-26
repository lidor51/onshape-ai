import * as THREE from 'three';

export const palette = {
  frame: 0xb7c6c6, bumper: 0xc78f81, rail: 0x6b9da5, plate: 0x90b694,
  coral: 0xd4af59, algae: 0x83aa72, climb: 0xa58abc, shaft: 0x65777c,
  rubber: 0x414b4e, battery: 0x454f55, ball: 0x5db1aa,
};

const materials = new Map();
function material(color) {
  if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.72,metalness:0.08}));
  return materials.get(color);
}

export function solid(parent,name,geometry,color,position=[0,0,0]) {
  const mesh = new THREE.Mesh(geometry,material(color));
  mesh.name=name;
  mesh.position.set(...position);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  parent.add(mesh);
  return mesh;
}

export function box(parent,name,center,size,color) {
  return solid(parent,name,new THREE.BoxGeometry(...size),color,center);
}

export function beam(parent,name,from,to,width,depth,color) {
  const start=new THREE.Vector3(...from);
  const end=new THREE.Vector3(...to);
  const span=end.clone().sub(start);
  if (span.length()<1e-5) throw new Error(`${name}: zero-length beam`);
  const mesh=box(parent,name,start.clone().add(end).multiplyScalar(0.5).toArray(),[width,depth,span.length()],color);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),span.normalize());
  return mesh;
}

export function axle(parent,name,from,to,radius,color=palette.shaft) {
  const start=new THREE.Vector3(...from);
  const end=new THREE.Vector3(...to);
  const span=end.clone().sub(start);
  if (span.length()<1e-5) throw new Error(`${name}: zero-length axle`);
  const mesh=solid(parent,name,new THREE.CylinderGeometry(radius,radius,span.length(),24),color,start.clone().add(end).multiplyScalar(0.5).toArray());
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),span.normalize());
  return mesh;
}

export function roller(parent,name,center,length,radius,color=palette.coral,segmented=false) {
  const [across,rearward,up]=center;
  axle(parent,`${name} shaft`,[across-length/2-18,rearward,up],[across+length/2+18,rearward,up],6.35);
  if (segmented) {
    const count=Math.max(3,Math.floor(length/55));
    for (let index=0;index<count;index++) {
      const location=across-length/2+(index+0.5)*length/count;
      axle(parent,`${name} compliant wheel ${index+1}`,[location-14,rearward,up],[location+14,rearward,up],radius,color);
    }
  } else axle(parent,`${name} tube`,[across-length/2,rearward,up],[across+length/2,rearward,up],radius,color);
}

export function sidePlate(parent,name,across,outline,thickness,color=palette.plate) {
  const shape=new THREE.Shape();
  outline.forEach(([rearward,up],index)=>index?shape.lineTo(rearward,up):shape.moveTo(rearward,up));
  shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false});
  geometry.applyMatrix4(new THREE.Matrix4().set(0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1));
  return solid(parent,name,geometry,color,[across-thickness/2,0,0]);
}