export const MOTOR_ROLES = [
  {key: 'deployment', label: '1 / Deployment', id: 'pt_deploy_deployment_X44',
    function: 'Folds and deploys the pickup frame; does not power the rollers.',
    path: '12:60 spur > 14:36 chain > 16:60 chain > independent cheek flange',
    reduction: 5 * 36 / 14 * 60 / 16, output: 'Positioning pivot',
    note: 'The flange rotates around the rear roller shaft without being keyed to it. Stops and stow holding remain unfinished.'},
  {key: 'pickup', label: '2 / Pickup Rollers', id: 'pt_drive_pickup_X44',
    function: 'Spins the three upper pickup rows and the counter-rotating lower kicker.',
    path: '12:60 spur > 18:36 belt > rear roller > middle/front belts; rear 60:60 reversal > 36:15 belt > kicker',
    reduction: 10, kickerReduction: 25 / 6, output: 'Upper rollers + kicker',
    note: 'The kicker shares this motor. The reversing gear carrier moves with the intake, so folding and roller motion require coordinated control.'},
  {key: 'indexer_left', label: '3 / Left Indexer', id: 'v1_indexer_drive_L_X44',
    function: 'Drives the left bank to convey and orient coral toward the holding cradle.',
    path: '12:60 spur > first vertical shaft > two HTD belt loops',
    reduction: 5, output: 'Three left indexer shafts',
    note: 'Independent left/right speeds are intended for orientation and jam recovery; effectiveness is not yet physically verified.'},
  {key: 'indexer_right', label: '4 / Right Indexer', id: 'v1_indexer_drive_R_X44',
    function: 'Drives the right bank to convey and orient coral toward the holding cradle.',
    path: '12:60 spur > first vertical shaft > two HTD belt loops',
    reduction: 5, output: 'Three right indexer shafts',
    note: 'The passive tray and stop have no separate motor. An active scoring receiver is not part of this assembly.'},
];

export function motorInventory(manifest) {
  const motors = manifest.instances.filter(part => part.role === 'motor');
  if (motors.length !== MOTOR_ROLES.length) throw new Error('Motor-role map must cover the entire motor inventory');
  return MOTOR_ROLES.map(role => {
    const part = motors.find(candidate => candidate.id === role.id);
    if (!part) throw new Error('Missing mapped motor: ' + role.id);
    const source = manifest.definitions[part.definition].source_binding ?? manifest.definitions[part.definition].source;
    return {...role, centerDatumMm: part.matrix.slice(0, 3).map(row => row[3]),
      datumMeaning: 'Motor attachment datum, not a mass center', motorSku: source?.sku ?? 'UNRESOLVED',
      motion: part.motion, outputRatioQualified: false};
  });
}