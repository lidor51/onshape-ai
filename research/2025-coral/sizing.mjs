import assert from 'node:assert/strict';

function positive(value, label) {
  assert.ok(Number.isFinite(value) && value > 0, `${label} must be finite and positive`);
  return value;
}

export function surfaceSpeedMps(diameterMm, motorRpm, reduction) {
  positive(diameterMm, 'diameter');
  positive(motorRpm, 'motor speed');
  positive(reduction, 'reduction');
  return Math.PI * diameterMm / 1000 * motorRpm / (60 * reduction);
}

export function rollerScreen(diameterMm, motorRpm, reduction, targetMps) {
  positive(targetMps, 'target speed');
  const noLoadSurfaceSpeedMps = surfaceSpeedMps(diameterMm, motorRpm, reduction);
  return {
    diameterMm, reduction, targetMps, noLoadSurfaceSpeedMps,
    requiredRollerRpm: targetMps * 60000 / (Math.PI * diameterMm),
    requiredFractionOfMotorFreeSpeed: targetMps / noLoadSurfaceSpeedMps,
    noLoadSpeedReachable: targetMps <= noLoadSurfaceSpeedMps,
    loadAndTractionVerified: false,
  };
}

export function motorReference(catalog, id, mode) {
  const motor = catalog.candidates.find(candidate => candidate.id === id);
  assert.ok(motor, 'Motor candidate missing');
  const dataset = motor.motor_data?.ctre_12V_reference;
  assert.equal(dataset?.test_voltage_V, 12, 'Use a voltage-qualified single dataset');
  const row = dataset.modes.find(candidate => candidate.mode === mode);
  assert.ok(row, 'Requested motor mode missing');
  positive(row.free_speed_rpm, 'motor free rpm');
  positive(row.stall_torque_Nm, 'motor endpoint torque');
  return { id, partNumber: motor.part_number, dataset: dataset.dataset,
    testDate: dataset.test_date, voltageV: dataset.test_voltage_V,
    mode, freeRpm: row.free_speed_rpm, endpointTorqueNm: row.stall_torque_Nm };
}

export function coralInertia(massKg, lengthMm, outerDiameterMm, innerDiameterMm) {
  for (const [label, value] of Object.entries({ massKg, lengthMm, outerDiameterMm, innerDiameterMm })) positive(value, label);
  assert.ok(innerDiameterMm < outerDiameterMm, 'Coral bore must be smaller than outer diameter');
  const radiusSquaresM2 = (outerDiameterMm / 2000) ** 2 + (innerDiameterMm / 2000) ** 2;
  return {
    massKg,
    worstAxisCentroidalInertiaKgM2: Math.max(massKg * radiusSquaresM2 / 2,
      massKg * (3 * radiusSquaresM2 + (lengthMm / 1000) ** 2) / 12),
    model: 'Uniform annular tube about its center, worst principal axis; nominal geometry, not measured mass distribution',
  };
}

export function pivotScreen(assumptions, coralMassKg, motor, reduction, coralCentroidalInertiaKgM2) {
  for (const key of ['pivotMovingStructureMassKg', 'pivotStructureCenterOfMassRadiusM',
    'pivotStructureInertiaKgM2', 'pivotCoralCenterOfMassRadiusM', 'pivotTravelDeg',
    'pivotMoveDurationS', 'pivotAssumedEfficiency', 'pivotLoadFactor', 'gravityMps2']) {
    positive(assumptions[key], key);
  }
  positive(coralMassKg, 'coral mass');
  positive(coralCentroidalInertiaKgM2, 'coral centroidal inertia');
  positive(reduction, 'reduction');
  assert.equal(assumptions.pivotStructureInertiaAxis, 'pivot', 'Structure inertia must be about the pivot axis');
  assert.ok(assumptions.pivotStructureInertiaKgM2 >= assumptions.pivotMovingStructureMassKg * assumptions.pivotStructureCenterOfMassRadiusM ** 2,
    'Structure inertia is below the parallel-axis minimum');
  assert.ok(assumptions.pivotAssumedEfficiency <= 1, 'Efficiency must not exceed one');
  assert.ok(assumptions.pivotLoadFactor >= 1, 'Load factor must be at least one');
  assert.ok(Number.isFinite(assumptions.pivotFrictionTorqueNm) && assumptions.pivotFrictionTorqueNm >= 0, 'Invalid friction torque');
  const angleRad = assumptions.pivotTravelDeg * Math.PI / 180;
  const peakSpeedRadS = 2 * angleRad / assumptions.pivotMoveDurationS;
  const accelerationRadS2 = 4 * angleRad / assumptions.pivotMoveDurationS ** 2;
  const inertiaKgM2 = assumptions.pivotStructureInertiaKgM2 + coralCentroidalInertiaKgM2 + coralMassKg * assumptions.pivotCoralCenterOfMassRadiusM ** 2;
  const gravityTorqueNm = assumptions.gravityMps2 * (assumptions.pivotMovingStructureMassKg * assumptions.pivotStructureCenterOfMassRadiusM
    + coralMassKg * assumptions.pivotCoralCenterOfMassRadiusM);
  const conservativeOutputTorqueNm = assumptions.pivotLoadFactor * (gravityTorqueNm + inertiaKgM2 * accelerationRadS2 + assumptions.pivotFrictionTorqueNm);
  const requiredMotorTorqueNm = conservativeOutputTorqueNm / (reduction * assumptions.pivotAssumedEfficiency);
  return {
    reduction, motionModel: 'Ideal triangular rest-to-rest velocity, direct constant-ratio pivot; not a four-bar model',
    coralMassKg, coralCentroidalInertiaKgM2, inertiaKgM2, peakSpeedRadS, accelerationRadS2, gravityTorqueNm,
    conservativeOutputTorqueNm, requiredMotorTorqueNm,
    requiredPeakMotorRpm: peakSpeedRadS * reduction * 60 / (2 * Math.PI),
    requiredFractionOfMotorFreeSpeed: peakSpeedRadS * reduction * 60 / (2 * Math.PI * motor.freeRpm),
    requiredFractionOfExtrapolatedStallTorque: requiredMotorTorqueNm / motor.endpointTorqueNm,
    motorSpeedTorqueFeasibility: 'UNVERIFIED: separate endpoint fractions do not prove a simultaneous operating point',
    motorCurrentLimit: 'UNSELECTED: supply current is not a stator-current limit',
    thermalImpactAndGearStrength: 'UNVERIFIED',
  };
}

export function canBeginAcquisition(state) {
  return state.occupancyKnown === true && state.robotCoralCount === 0 &&
    state.receiverHasCoral === false && state.pathClear === true &&
    state.pickupDeployed === true && state.fault === false;
}

export function canReleaseToReceiver(state) {
  return state.occupancyKnown === true && state.robotCoralCount === 1 &&
    state.receiverReady === true && state.receiverAligned === true &&
    state.receiverHasSameCoralConfirmed === true && state.fault === false;
}

export function canClearJam(state) {
  return state.lowEnergyMode === true && state.releasePathClear === true &&
    state.locationAllowsRelease === true && state.retryBudgetRemaining === true &&
    state.operatorAbort === false;
}

export function createSizingReport(inputs, rules, catalog) {
  assert.equal(rules.season, 2025);
  assert.equal(inputs.motorDataset, 'ctre_12V_reference');
  assert.equal(inputs.motorMode, 'trapezoidal', 'This screen assumes no paid FOC entitlement');
  const assumptions = inputs.designAssumptions;
  const limit = id => {
    const constraint = rules.constraints.find(item => item.id === id);
    assert.ok(constraint, `Missing sourced rule ${id}`);
    return constraint;
  };
  const x44 = motorReference(catalog, 'x44', inputs.motorMode);
  const x60 = motorReference(catalog, 'x60', inputs.motorMode);
  const wheel = catalog.candidates.find(item => item.id === 'compliant_wheel');
  assert.ok(wheel?.interface?.diameter_m > 0, 'Missing sourced contact-wheel diameter');
  for (const key of ['blankChassisWidthMm', 'blankChassisLengthMm', 'startingHeightTargetMm',
    'frontExtensionTargetMm', 'pickupMouthWidthMm', 'coralSweptEnvelopeExtraPerSideMm']) positive(assumptions[key], key);
  const perimeterMm = 2 * (assumptions.blankChassisWidthMm + assumptions.blankChassisLengthMm);
  const allowedPerimeterMm = limit('starting_perimeter').mm;
  const preliminaryPerimeterCheck = perimeterMm <= allowedPerimeterMm;
  const transferSweptDiameterMm = Math.hypot(limit('coral_length').mm, limit('coral_outer_diameter').mm);
  const coral = coralInertia(limit('coral_mass_upper').kg, limit('coral_length').mm,
    limit('coral_outer_diameter').mm, limit('coral_inner_diameter').mm);
  return {
    status: 'LOCAL_CONCEPT_SCREEN_NOT_MECHANISM_VALIDATION',
    apiCalls: 0, cadCreated: false, physicalTestsRun: false,
    rulesSeason: rules.season, motorReferences: [x44, x60], coralInertiaAssumption: coral,
    candidateEnvelope: {
      perimeterMm, rulePerimeterMm: allowedPerimeterMm,
      perimeterMarginMm: allowedPerimeterMm - perimeterMm, preliminaryPerimeterCheck,
      startingHeightMarginMm: limit('starting_height').mm - assumptions.startingHeightTargetMm,
      frontExtensionMarginMm: limit('perimeter_extension').mm - assumptions.frontExtensionTargetMm,
      exactUninflatedCoralYawDiskDiameterMm: transferSweptDiameterMm,
      conservativeInflatedCoralYawDiskDiameterMm: transferSweptDiameterMm + 2 * assumptions.coralSweptEnvelopeExtraPerSideMm,
      fullSweepBumperAndCableClearance: 'UNVERIFIED: scalar margins are not a collision or compliance check',
      planViewAssumption: `Horizontal coral rotates around its center; full cylinder lies inside this conservative disk; ${assumptions.coralSweptEnvelopeExtraPerSideMm} mm inflation is a proposed uncertainty allowance, not a rule`,
    },
    pickupScreens: inputs.designAssumptions.pickupDiameterExamplesMm.flatMap(diameter =>
      assumptions.pickupTotalReductionCandidates.flatMap(reduction => assumptions.pickupSurfaceSpeedTargetsMps.map(target =>
        ({ motor: x44.id, ...rollerScreen(diameter, x44.freeRpm, reduction, target) })))),
    alignmentScreens: assumptions.alignmentTotalReductionCandidates.flatMap(reduction =>
      assumptions.alignmentSurfaceSpeedTargetsMps.map(target => ({ motor: x44.id, wheelPartNumber: wheel.part_number,
        ...rollerScreen(wheel.interface.diameter_m * 1000, x44.freeRpm, reduction, target) }))),
    pivotScreens: assumptions.pivotReductionCandidates.map(reduction =>
      ({ motor: x44.id, ...pivotScreen(assumptions, coral.massKg, x44, reduction, coral.worstAxisCentroidalInertiaKgM2) })),
    applicability: 'The X44 performance data is post-Championships. Motor legality is independently sourced. No copied 2056 ratio is assumed correct for this concept.',
  };
}