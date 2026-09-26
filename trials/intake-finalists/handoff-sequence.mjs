const fraction=(progress,start,end)=>Math.max(0,Math.min(1,(progress-start)/(end-start)));

export function liftAwaySequence(progress,{liftMm=160}={}){
  if(!Number.isFinite(progress)||progress<0||progress>1)throw new Error('Progress must be in [0,1]');
  if(!Number.isFinite(liftMm)||liftMm<=0)throw new Error('Lift stroke must be positive');
  const receiverClosed=fraction(progress,0,0.2);
  const carrierReleased=fraction(progress,0.2,0.4);
  const receiverLift=fraction(progress,0.4,0.65)*liftMm;
  const carrierReturn=fraction(progress,0.65,1);
  return {
    receiverClosed,carrierReleased,receiverLift,carrierReturn,
    owner:progress<0.2?'carrier':progress<0.4?'both':'receiver',
    phase:progress<0.2?'receiver-capture':progress<0.4?'carrier-release':progress<0.65?'receiver-lift':'carrier-return',
  };
}