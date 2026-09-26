import { requireThat } from './ledger.mjs';

export const isCots = part => /^cots(?:-|$)/.test(part.category);
export const identity = () => [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
export function translation(offset) {
  requireThat(offset?.length === 3 && offset.every(Number.isFinite), 'OFFSET_REQUIRED');
  const matrix = identity();
  offset.forEach((value, axis) => { matrix[axis][3] = value; });
  return matrix;
}
export function multiply(left, right) {
  return left.map(row => right[0].map((_, column) => row.reduce((sum, value, index) => sum + value * right[index][column], 0)));
}
export function inverseRigid(matrix) {
  const inverse = identity();
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) inverse[row][column] = matrix[column][row];
    inverse[row][3] = -inverse[row].slice(0, 3).reduce((sum, value, axis) => sum + value * matrix[axis][3], 0);
  }
  return inverse;
}
export function errorBetween(left, right) {
  return Math.max(...left.flatMap((row, rowIndex) => row.map((value, column) => Math.abs(value - right[rowIndex][column]))));
}
export function rigid(matrix) {
  requireThat(Array.isArray(matrix) && matrix.length === 4 && matrix.every(row =>
    Array.isArray(row) && row.length === 4 && row.every(Number.isFinite)), 'MATRIX_4X4_REQUIRED');
  requireThat(errorBetween(multiply(matrix, inverseRigid(matrix)), identity()) < 1e-8 &&
    matrix[3].every((value, axis) => value === (axis === 3 ? 1 : 0)), 'RIGID_MATRIX_REQUIRED');
  const determinant = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
  requireThat(Math.abs(determinant - 1) < 1e-8, 'RIGHT_HANDED_REQUIRED');
  return matrix;
}
export function toSI(matrix) {
  return rigid(matrix).flatMap((row, rowIndex) => row.map((value, column) => column === 3 && rowIndex < 3 ? value / 1000 : value));
}

export function assemblyGraph(packet, variant, cotsBindings = {}) {
  requireThat(['baseline', 'revision'].includes(variant), 'UNKNOWN_VARIANT');
  const { contract, geometry, expected } = packet;
  requireThat(contract.parameters.units === 'mm', 'PACKET_UNITS_NOT_MM');
  const poses = expected[variant].poses.deployed.instanceTransformsRowMajorMm;
  const instances = contract.instances.filter(instance => instance.id !== 'held_coral').map(instance => {
    const sourceToNeutral = cotsBindings[instance.part]?.sourceToNeutralRowMajorMm ??
      translation(geometry.partStudioLayoutOffsetsMm[instance.part].map(value => -value));
    const worldFromSource = multiply(rigid(poses[instance.id]), rigid(sourceToNeutral));
    return { ...instance, sourceToNeutral, worldFromSource, transform: toSI(worldFromSource),
      sourceKind: isCots(contract.parts[instance.part]) ? 'COTS_BINDING_REQUIRED' : 'CUSTOM_OR_REFERENCE' };
  });
  requireThat(instances.length === contract.nativeInstanceCount && new Set(instances.map(instance => instance.id)).size === instances.length,
    'INSTANCE_COUNT_OR_ID_MISMATCH');
  const byId = new Map(instances.map(instance => [instance.id, instance]));
  const frames = variant === 'baseline' ? contract.baselineMates : contract.revisionMates;
  const joints = frames.filter(joint => joint.child !== 'held_coral').map(joint => {
    requireThat(['FASTENED', 'REVOLUTE'].includes(joint.type), 'UNSUPPORTED_MATE_TYPE');
    const connectors = ['parent', 'child'].map(side => {
      const instance = byId.get(joint[side]);
      requireThat(instance, 'MISSING_MATE_INSTANCE');
      const frame = multiply(inverseRigid(instance.sourceToNeutral), rigid(joint[`${side}PartLocalFrameRowMajorMm`]));
      requireThat(errorBetween(multiply(instance.worldFromSource, frame), joint.worldJointFrameRowMajorMm) < 1e-7,
        'SOURCE_CONNECTOR_WORLD_PARITY');
      return { instance: instance.id, part: instance.part, sourceFrameMm: frame, sourceFrameSI: toSI(frame) };
    });
    return { ...joint, connectors };
  });
  const children = joints.map(joint => joint.child);
  requireThat(joints.length === instances.length - 1 && new Set(children).size === children.length && !children.includes('chassis'),
    'ASSEMBLY_TREE_REQUIRED');
  const reached = new Set(['chassis']);
  for (let pass = 0; pass < instances.length; pass++) {
    for (const joint of joints) if (reached.has(joint.parent)) reached.add(joint.child);
  }
  requireThat(reached.size === instances.length, 'DISCONNECTED_ASSEMBLY');
  for (const relation of contract.relations) {
    requireThat(['GEAR_RELATION', 'BELT_RELATION'].includes(relation.type) && Number.isFinite(relation.outputPerInput) &&
      relation.outputPerInput !== 0 && [relation.driverMate, relation.drivenMate].every(id =>
        joints.some(joint => joint.id === id && joint.type === 'REVOLUTE')), 'RELATION_GRAPH_INVALID');
  }
  return { variant, instances, joints, relations: contract.relations };
}

export function fastenedGroups(graph) {
  const roots = new Map(graph.instances.map(instance => [instance.id, instance.id]));
  const root = instance => {
    requireThat(roots.has(instance), 'UNKNOWN_GROUP_INSTANCE');
    while (roots.get(instance) !== instance) instance = roots.get(instance);
    return instance;
  };
  for (const joint of graph.joints.filter(joint => joint.type === 'FASTENED')) roots.set(root(joint.child), root(joint.parent));
  for (const joint of graph.joints.filter(joint => joint.type === 'REVOLUTE'))
    requireThat(root(joint.parent) !== root(joint.child), 'REVOLUTE_COLLAPSED_BY_RIGID_GROUP');
  const groups = new Map();
  for (const instance of graph.instances) {
    const owner = root(instance.id);
    if (!groups.has(owner)) groups.set(owner, []);
    groups.get(owner).push(instance.id);
  }
  return [...groups.values()].filter(members => members.length > 1).map(members => ({
    id: `rigid-${members.slice().sort()[0]}`, members,
    logicalMates: graph.joints.filter(joint => joint.type === 'FASTENED' && members.includes(joint.child)).map(joint => joint.id),
  }));
}