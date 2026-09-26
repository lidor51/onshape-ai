import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import {buildIntake, intakePoses, intakeRecipes} from './intake-models.mjs';

function select(root, predicate) {
  const found = [];
  root.traverse(object => { if (predicate(object)) found.push(object); });
  return found;
}

function role(root, name) {
  return select(root,object => object.userData.role === name);
}

function bounds(root) {
  root.updateWorldMatrix(true,true);
  return new THREE.Box3().setFromObject(root);
}

function hardware(root) {
  return select(root,object => object.isMesh && !object.userData.role?.startsWith('coral'));
}

function hardwareBounds(root) {
  root.updateWorldMatrix(true,true);
  const envelope = new THREE.Box3();
  for (const mesh of hardware(root)) {
    mesh.geometry.computeBoundingBox();
    envelope.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
  }
  return envelope;
}

function near(actual, expected, tolerance = 1e-5) {
  assert.ok(Math.abs(actual-expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
}

function vectorNear(actual, expected, tolerance = 1e-5) {
  actual.forEach((value,index) => near(value,expected[index],tolerance));
}

function dispose(root) {
  const materials = new Set();
  root.traverse(object => {
    object.geometry?.dispose();
    if (object.userData.role === 'coralSurface' || object.userData.role === 'coralRim') materials.add(object.material);
  });
  materials.forEach(material => material.dispose());
}

test('14 distinct recipes preserve original mouth widths and side/plan receiver datums', () => {
  const originals = JSON.parse(readFileSync(new URL('../../../outputs/concepts/concepts.json',import.meta.url),'utf8'));
  assert.deepEqual(intakePoses,['open','collapsed','handoff']);
  assert.equal(intakeRecipes.length,14);
  assert.equal(new Set(intakeRecipes.map(recipe => recipe.mechanismId)).size,14);
  assert.deepEqual(intakeRecipes.map(recipe => recipe.id),Array.from({length:14},(_,index) => String(index+1).padStart(2,'0')));
  for (const recipe of intakeRecipes) {
    const original = originals.find(item => item.id === recipe.id);
    assert.equal(recipe.mouthWidthMm,original.mouthWidthMm);
    vectorNear(recipe.receiverCenter,[...original.plan.receiver.center,original.side.receiver.center[1]]);
    assert.equal(recipe.receiverAxis,original.plan.coralYawDeg === 90 ? 'x' : 'y');
    assert.ok(recipe.stowIntent.length > 20);
  }
});

test('all 42 intake proposals are finite, bounded, structured and contain one actual-size hollow coral', () => {
  for (const recipe of intakeRecipes) for (const pose of intakePoses) {
    const root = buildIntake(recipe.id,pose);
    const label = `${recipe.id} ${pose}`;
    assert.ok(root instanceof THREE.Group,label);
    assert.equal(root.userData.status,'INTAKE_MECHANISM_PROPOSAL');
    assert.equal(root.userData.kinematicsProven,false);
    assert.equal(root.userData.id,recipe.id);
    assert.equal(root.userData.pose,pose);
    assert.equal(root.userData.title,recipe.title);
    assert.equal(root.userData.mechanismId,recipe.mechanismId);
    assert.equal(root.userData.flowHref,`../concept-${recipe.id}.png`);
    assert.equal(root.userData.pieceCount,1);
    assert.match(root.userData.warning,/not continuous physics/);
    assert.match(root.userData.warning,/stow/);
    vectorNear(root.userData.receiverCenter,recipe.receiverCenter);
    assert.equal(role(root,'movingSection').length,1,label);
    assert.equal(select(root,object => object.userData.component === 'nose').length,1,label);
    assert.equal(role(root,'receiver').length,1,label);
    assert.equal(role(root,'fixedIndexer').length,1,label);
    assert.equal(role(root,'chassis').length,1,label);
    const meshes = select(root,object => object.isMesh);
    assert.ok(meshes.length >= 40 && meshes.length <= 120,`${label}: ${meshes.length} meshes`);
    assert.ok(role(root,'structure').length >= 23,`${label}: structural mesh count`);
    assert.ok(recipe.id === '08' || role(root,'roller').length >= 1,`${label}: recognizable cylindrical or segmented contacts`);
    root.traverse(object => {
      assert.ok(object.visible,`${label}: no hidden components`);
      assert.ok(object.matrixWorld.elements.every(Number.isFinite),`${label}: finite world transform`);
      if (object.isMesh) assert.ok(object.geometry.attributes.position.array.every(Number.isFinite),`${label}: finite vertices`);
    });
    const envelope = bounds(root);
    assert.ok(envelope.min.x >= -1000 && envelope.max.x <= 1000,`${label}: across bounds`);
    assert.ok(envelope.min.y >= -600 && envelope.max.y <= 1000,`${label}: fore/aft bounds`);
    assert.ok(envelope.max.z < 1500,`${label}: gross height`);
    const pieces = role(root,'coral');
    assert.equal(pieces.length,1,label);
    const piece = pieces[0];
    assert.equal(piece.userData.outerDiameterMm,114.3);
    assert.equal(piece.userData.lengthMm,301.625);
    assert.equal(piece.userData.openEnds,2);
    assert.equal(role(piece,'coralRim').length,2);
    for (const rim of role(piece,'coralRim')) {
      assert.equal(rim.geometry.type,'RingGeometry');
      near(rim.geometry.parameters.innerRadius,50.8);
      near(rim.geometry.parameters.outerRadius,57.15);
      near(Math.abs(rim.position.y),301.625/2);
    }
    for (const shell of role(piece,'coralSurface')) {
      assert.equal(shell.geometry.parameters.openEnded,true);
      near(shell.geometry.parameters.height,301.625);
      assert.equal(shell.material.side,THREE.DoubleSide);
    }
    assert.ok(role(piece,'coralSurface').some(surface => surface.userData.surface === 'bore'));
    if (pose === 'open') near(bounds(piece).min.z,0,1e-3);
    if (pose === 'handoff') {
      vectorNear(piece.getWorldPosition(new THREE.Vector3()).toArray(),recipe.receiverCenter);
      const pieceAxis = new THREE.Vector3(0,1,0).transformDirection(piece.matrixWorld).toArray();
      vectorNear(pieceAxis,recipe.receiverAxis === 'x' ? [1,0,0] : [0,1,0]);
    }
    dispose(root);
  }
});

test('collapsed poses transform one nose while chassis, indexer and accepting receiver remain fixed', () => {
  for (const recipe of intakeRecipes) {
    const open = buildIntake(recipe.id,'open');
    const collapsed = buildIntake(recipe.id,'collapsed');
    const handoff = buildIntake(recipe.id,'handoff');
    for (const fixedRole of ['chassis','fixedIndexer','receiver']) {
      const original = role(open,fixedRole)[0];
      for (const variant of [collapsed,handoff]) {
        const fixed = role(variant,fixedRole)[0];
        assert.deepEqual(fixed.matrixWorld.elements,original.matrixWorld.elements,`${recipe.id} ${fixedRole} must stay fixed`);
        assert.ok(hardwareBounds(fixed).equals(hardwareBounds(original)),`${recipe.id} ${fixedRole} geometry must stay fixed`);
        assert.equal(hardware(fixed).length,hardware(original).length);
        hardware(fixed).forEach((mesh,index) => assert.deepEqual(mesh.matrixWorld.elements,hardware(original)[index].matrixWorld.elements));
      }
    }
    const movingOpen = role(open,'movingSection')[0];
    const movingCollapsed = role(collapsed,'movingSection')[0];
    assert.notDeepEqual(movingCollapsed.matrixWorld.elements,movingOpen.matrixWorld.elements,`${recipe.id}: actual moving-group transform`);
    assert.equal(select(movingOpen,object => object.isMesh && !object.userData.role?.startsWith('coral')).length,select(movingCollapsed,object => object.isMesh && !object.userData.role?.startsWith('coral')).length,`${recipe.id}: fixed number of nose components`);
    if (bounds(open).equals(bounds(collapsed))) assert.ok(!bounds(movingOpen).equals(bounds(movingCollapsed)),`${recipe.id}: movement remains measurable even under a fixed overall frame envelope`);
    assert.equal(role(collapsed,'coral')[0].userData.state,'captured-proposal');
    for (const root of [open,collapsed,handoff]) {
      assert.deepEqual(root.position.toArray(),[0,0,0]);
      assert.deepEqual(root.quaternion.toArray(),[0,0,0,1]);
      dispose(root);
    }
  }
});

test('only 12 removes the actual central 350 mm bumper and recesses frame 340 mm', () => {
  for (const recipe of intakeRecipes) for (const pose of intakePoses) {
    const root = buildIntake(recipe.id,pose);
    const frame = role(root,'chassis')[0];
    const front = select(frame,object => object.userData.role === 'bumper' && object.userData.section === 'front');
    if (recipe.id === '12') {
      assert.match(root.userData.warning,/KNOWN NONCOMPLIANT 2025/);
      assert.match(root.userData.warning,/R401\/R402\/R405/);
      assert.equal(front.length,2);
      assert.equal(front.filter(mesh => mesh.userData.intactCentral).length,0);
      const ordered = front.map(bounds).sort((left,right) => left.min.x-right.min.x);
      near(ordered[0].max.x,-175);
      near(ordered[1].min.x,175);
      const opening = new THREE.Box3(new THREE.Vector3(-174.99,-84.99,45.01),new THREE.Vector3(174.99,-0.01,164.99));
      assert.ok(front.every(mesh => !bounds(mesh).intersectsBox(opening)));
      const recess = new THREE.Box3(new THREE.Vector3(-174.99,0.01,0),new THREE.Vector3(174.99,339.99,150));
      assert.ok(select(frame,object => object.isMesh).every(mesh => !bounds(mesh).intersectsBox(recess)),'No chassis rail or pan fills the specified recess');
      assert.equal(frame.userData.frameRecessDepthMm,340);
    } else {
      assert.equal(front.length,1);
      assert.equal(front[0].userData.intactCentral,true);
      near(bounds(front[0]).min.x,-435);
      near(bounds(front[0]).max.x,435);
      assert.equal(frame.userData.bumperGapMm,0);
    }
    dispose(root);
  }
});

test('side-entry floor coral is outside the side bumper with its full radius', () => {
  const root = buildIntake('07');
  const piece = role(root,'coral')[0];
  const envelope = bounds(piece);
  const bumpers = role(root,'bumper');
  assert.ok(envelope.max.x < -435);
  assert.ok(bumpers.every(bumper => !bounds(bumper).intersectsBox(envelope)));
  near(envelope.min.z,0,1e-3);
  near(envelope.max.x-envelope.min.x,114.3,1e-3);
  dispose(root);
});

test('13 exposes real internal pads through a dedicated transparent half-shell without changing shared materials', () => {
  const ordinary = buildIntake('01');
  const shared = select(ordinary,object => object.isMesh && object.userData.role === 'roller')[0].material;
  const before = {opacity:shared.opacity,transparent:shared.transparent,color:shared.color.getHex()};
  const root = buildIntake('13','collapsed');
  const piece = role(root,'coral')[0];
  const pads = role(root,'mandrelPad');
  assert.equal(pads.length,3);
  const inspect = role(piece,'coralSurface').filter(mesh => mesh.material.transparent);
  assert.equal(inspect.length,2);
  assert.ok(inspect.every(mesh => mesh.geometry.parameters.thetaLength === Math.PI && mesh.material.opacity > 0 && mesh.material.opacity < 0.5));
  const pieceCenter = piece.getWorldPosition(new THREE.Vector3());
  for (const pad of pads) {
    const center = pad.getWorldPosition(new THREE.Vector3());
    assert.ok(Math.hypot(center.x-pieceCenter.x,center.z-pieceCenter.z) < 50.8);
    assert.ok(Math.abs(center.y-pieceCenter.y) < 301.625/2);
  }
  assert.deepEqual({opacity:shared.opacity,transparent:shared.transparent,color:shared.color.getHex()},before);
  assert.notEqual(inspect[0].material,shared);
  const other = buildIntake('13','collapsed');
  assert.notEqual(role(other,'coralSurface').find(mesh => mesh.material.transparent).material,inspect[0].material);
  dispose(ordinary);
  dispose(root);
  dispose(other);
});

test('14 lower contact and dark cross remain locked relative to the moving carrier, not the world', () => {
  const models = intakePoses.map(pose => buildIntake('14',pose));
  const localTransforms = [];
  const worldTransforms = [];
  for (const root of models) {
    const locked = role(root,'lockedContact');
    assert.equal(locked.length,1);
    assert.equal(locked[0].userData.rotation,'locked');
    assert.equal(locked[0].userData.relativeTo,'movingCarrier');
    assert.match(root.userData.warning,/nonrotating relative to the moving carrier, not world-fixed/);
    const marks = role(locked[0],'lockedAxisMark');
    assert.equal(marks.length,4);
    assert.ok(marks.every(mark => mark.isMesh && mark.material.color.getHex() === 0x283235));
    const carrier = role(root,'movingSection')[0];
    localTransforms.push(carrier.matrixWorld.clone().invert().multiply(locked[0].matrixWorld));
    worldTransforms.push(locked[0].matrixWorld.clone());
  }
  for (const transform of localTransforms.slice(1)) vectorNear(transform.elements,localTransforms[0].elements);
  assert.notDeepEqual(worldTransforms[0].elements,worldTransforms[1].elements);
  assert.notDeepEqual(worldTransforms[0].elements,worldTransforms[2].elements);
  vectorNear(role(models[2],'lockedContact')[0].getWorldPosition(new THREE.Vector3()).toArray(),[0,-20.238822,279.061178]);
  models.forEach(dispose);
});

test('01 fixed V and 11 reference chain have materially different hardware layouts', () => {
  const kicker = buildIntake('01');
  const chain = buildIntake('11');
  assert.equal(role(kicker,'straightenerBank').length,0);
  assert.equal(role(chain,'straightenerBank').length,2);
  assert.ok(kicker.getObjectByName('Fixed V converging bank'));
  assert.ok(!chain.getObjectByName('Fixed V converging bank'));
  assert.ok(chain.getObjectByName('Stopped cradle lip'));
  assert.ok(chain.getObjectByName('Retained rear drive packet row shaft'));
  assert.ok(!kicker.getObjectByName('Retained rear drive packet row shaft'));
  assert.notEqual(role(kicker,'roller').length,role(chain,'roller').length);
  assert.notDeepEqual(kicker.userData.receiverCenter,chain.userData.receiverCenter);
  dispose(kicker);
  dispose(chain);
});

test('default pose is open, invalid requests fail, and returned metadata cannot mutate recipe datums', () => {
  assert.throws(() => buildIntake('15'),/Unknown intake/);
  assert.throws(() => buildIntake('01','travel'),/Unknown intake/);
  assert.throws(() => buildIntake(1),/Unknown intake/);
  const root = buildIntake('01');
  assert.equal(root.userData.pose,'open');
  root.userData.receiverCenter[0] = 999;
  assert.equal(intakeRecipes[0].receiverCenter[0],0);
  dispose(root);
});