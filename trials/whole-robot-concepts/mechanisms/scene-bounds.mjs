import {Box3} from 'three';

export function contentBounds(model,context) {
  const bounds=new Box3().setFromObject(model);
  if(context?.visible)bounds.union(new Box3().setFromObject(context));
  return bounds;
}