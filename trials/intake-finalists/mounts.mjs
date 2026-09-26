export function placePoint([across,rearward,up],mount='front'){
  if(mount==='front')return [across,rearward,up];
  if(mount==='left')return [-350+rearward,380-across,up];
  if(mount==='right')return [350-rearward,380+across,up];
  throw new Error(`Unknown mount ${mount}`);
}

export function unplacePoint([across,rearward,up],mount='front'){
  if(mount==='front')return [across,rearward,up];
  if(mount==='left')return [380-rearward,across+350,up];
  if(mount==='right')return [rearward-380,350-across,up];
  throw new Error(`Unknown mount ${mount}`);
}