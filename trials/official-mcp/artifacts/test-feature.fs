FeatureScript 3070;
import(path:"onshape/std/common.fs",version:"3070.0");
function makeBox(context is Context,operationId is Id,minimum is Vector,maximum is Vector){fCuboid(context,operationId,{"corner1":minimum,"corner2":maximum}
);
}
function makeCylinder(context is Context,operationId is Id,minimumX is ValueWithUnits,maximumX is ValueWithUnits,centerY is ValueWithUnits,centerZ is ValueWithUnits,radius is ValueWithUnits){fCylinder(context,operationId,{"bottomCenter":vector(minimumX,centerY,centerZ),"topCenter":vector(maximumX,centerY,centerZ),"radius":radius}
);
}
function labelPart(context is Context,partId is Id,partName is string){setProperty(context,{"entities":qCreatedBy(partId,EntityType.BODY),"propertyType":PropertyType.NAME,"value":partName}
);
}
function drilledPlate(context is Context,partId is Id,minimumX is ValueWithUnits,maximumX is ValueWithUnits,rearY is ValueWithUnits,partName is string){makeBox(context,partId+"stock",vector(minimumX,0*millimeter,12.7*millimeter),vector(maximumX,320*millimeter,162.7*millimeter));
const holes=[[70*millimeter,65*millimeter,12.9*millimeter],[rearY,65*millimeter,12.9*millimeter],[140*millimeter,135*millimeter,6.6*millimeter],[300*millimeter,135*millimeter,6.6*millimeter],[25*millimeter,130*millimeter,12.9*millimeter]];
var cutters=[];
for(var holeIndex=0;
holeIndex<size(holes);
holeIndex+=1){const cutterId=partId+("hole"~holeIndex);
makeCylinder(context,cutterId,minimumX-millimeter,maximumX+millimeter,holes[holeIndex][0],holes[holeIndex][1],holes[holeIndex][2]/2);
cutters=append(cutters,qCreatedBy(cutterId,EntityType.BODY));
}
opBoolean(context,partId+"drill",{"targets":qCreatedBy(partId+"stock",EntityType.BODY),"tools":qUnion(cutters),"operationType":BooleanOperationType.SUBTRACTION}
);
labelPart(context,partId,partName);
}
function makeTube(context is Context,partId is Id,length is ValueWithUnits,centerY is ValueWithUnits,centerZ is ValueWithUnits,outerDiameter is ValueWithUnits,innerDiameter is ValueWithUnits,partName is string){makeCylinder(context,partId+"outside",-length/2,length/2,centerY,centerZ,outerDiameter/2);
makeCylinder(context,partId+"bore",-length/2-millimeter,length/2+millimeter,centerY,centerZ,innerDiameter/2);
opBoolean(context,partId+"hollow",{"targets":qCreatedBy(partId+"outside",EntityType.BODY),"tools":qCreatedBy(partId+"bore",EntityType.BODY),"operationType":BooleanOperationType.SUBTRACTION}
);
labelPart(context,partId,partName);
}
const officialIntake = defineFeature(function(context is Context,id is Id,definition is map)precondition{
annotation{"Name":"Inner width"}
isLength(definition.innerWidth,{(millimeter):[300,340,500]}
as LengthBoundSpec);
annotation{"Name":"Clear roller gap"}
isLength(definition.rollerGap,{(millimeter):[80,100,105]}
as LengthBoundSpec);
annotation{"Name":"Plate thickness"}
isLength(definition.plateThickness,{(millimeter):[3,6.35,12]}
as LengthBoundSpec);
}
{const halfWidth=definition.innerWidth/2;
const rearY=70*millimeter+76.2*millimeter+definition.rollerGap;
const rollerLength=definition.innerWidth-2*5*millimeter;
const shaftHalfLength=halfWidth+definition.plateThickness+12.7*millimeter;
drilledPlate(context,id+"leftPlate",-halfWidth-definition.plateThickness,-halfWidth,rearY,"leftPlate");
drilledPlate(context,id+"rightPlate",halfWidth,halfWidth+definition.plateThickness,rearY,"rightPlate");
makeTube(context,id+"frontRoller",rollerLength,70*millimeter,65*millimeter,76.2*millimeter,12.7*millimeter,"frontRoller");
makeTube(context,id+"rearRoller",rollerLength,rearY,65*millimeter,76.2*millimeter,12.7*millimeter,"rearRoller");
makeCylinder(context,id+"frontShaft",-shaftHalfLength,shaftHalfLength,70*millimeter,65*millimeter,6.35*millimeter);
labelPart(context,id+"frontShaft","frontShaft");
makeCylinder(context,id+"rearShaft",-shaftHalfLength,shaftHalfLength,rearY,65*millimeter,6.35*millimeter);
labelPart(context,id+"rearShaft","rearShaft");
makeBox(context,id+"frontCrossmember",vector(-halfWidth,127.3*millimeter,122.3*millimeter),vector(halfWidth,152.7*millimeter,147.7*millimeter));
labelPart(context,id+"frontCrossmember","frontCrossmember");
makeBox(context,id+"rearCrossmember",vector(-halfWidth,287.3*millimeter,122.3*millimeter),vector(halfWidth,312.7*millimeter,147.7*millimeter));
labelPart(context,id+"rearCrossmember","rearCrossmember");
makeTube(context,id+"coralReference",301.625*millimeter,-110*millimeter,57.15*millimeter,114.3*millimeter,101.6*millimeter,"coralReference - NON-BOM staged PVC");
setProperty(context,{"entities":qCreatedBy(id+"coralReference",EntityType.BODY),"propertyType":PropertyType.EXCLUDE_FROM_BOM,"value":true}
);
if(size(evaluateQuery(context,qBodyType(qCreatedBy(id,EntityType.BODY),BodyType.SOLID)))!=9)throw regenError("Expected nine separate intake solids");
}
,{"innerWidth":340*millimeter,"rollerGap":100*millimeter,"plateThickness":6.35*millimeter}
);
function officialIntakeEvidence(context is Context,featureId is Id)returns map{const roles=["leftPlate","rightPlate","frontRoller","rearRoller","frontShaft","rearShaft","frontCrossmember","rearCrossmember","coralReference"];
var parts=[];
for(var role in roles){const bodies=qBodyType(qCreatedBy(featureId+role,EntityType.BODY),BodyType.SOLID);
const bounds=evBox3d(context,{"topology":bodies,"tight":true}
);
const cylinders=evaluateQuery(context,qGeometry(qOwnedByBody(bodies,EntityType.FACE),GeometryType.CYLINDER));
var surfaces=[];
for(var face in cylinders){const surface=evSurfaceDefinition(context,{"face":face}
);
const faceBounds=evBox3d(context,{"topology":face,"tight":true}
);
surfaces=append(surfaces,{"radiusMm":surface.radius/millimeter,"axisOriginMm":surface.coordSystem.origin/millimeter,"axisDirection":surface.coordSystem.zAxis,"minMm":faceBounds.minCorner/millimeter,"maxMm":faceBounds.maxCorner/millimeter}
);
}
parts=append(parts,{"role":role,"solidCount":size(evaluateQuery(context,bodies)),"minMm":bounds.minCorner/millimeter,"maxMm":bounds.maxCorner/millimeter,"volumeMm3":evVolume(context,{"entities":bodies}
)/millimeter^3,"cylinders":surfaces}
);
}
return{"parts":parts,"partCount":size(evaluateQuery(context,qBodyType(qCreatedBy(featureId,EntityType.BODY),BodyType.SOLID)))}
;
}
function officialIntakeExpected(baseline is boolean)returns map{const packed=baseline?[340,100,[["leftPlate",[-176.35,0,12.7],[-170,320,162.7],301875.70934676356,[[6.45,70,65],[6.45,246.2,65],[3.3,140,135],[3.3,300,135],[6.45,25,130]]],["rightPlate",[170,0,12.7],[176.35,320,162.7],301875.70934676356,[[6.45,70,65],[6.45,246.2,65],[3.3,140,135],[3.3,300,135],[6.45,25,130]]],["frontRoller",[-165,31.9,26.9],[165,108.1,103.1],1463117.845894025,[[38.1,70,65],[6.35,70,65]]],["rearRoller",[-165,208.1,26.9],[165,284.3,103.1],1463117.845894025,[[38.1,246.2,65],[6.35,246.2,65]]],["frontShaft",[-189.04999999999998,63.65,58.65],[189.04999999999998,76.35,71.35],47896.52446169096,[[6.35,70,65]]],["rearShaft",[-189.04999999999998,239.85,58.65],[189.04999999999998,252.54999999999998,71.35],47896.52446169096,[[6.35,246.2,65]]],["frontCrossmember",[-170,127.3,122.3],[170,152.7,147.7],219354.4,[]],["rearCrossmember",[-170,287.3,122.3],[170,312.7,147.7],219354.4,[]],["coralReference",[-150.8125,-167.15,0],[150.8125,-52.85,114.3],649551.4843768268,[[57.15,-110,57.15],[50.8,-110,57.15]]]]]:[360,95,[["leftPlate",[-186.35,0,12.7],[-180,320,162.7],301875.70934676356,[[6.45,70,65],[6.45,241.2,65],[3.3,140,
135],[3.3,300,135],[6.45,25,130]]],["rightPlate",[180,0,12.7],[186.35,320,162.7],301875.70934676356,[[6.45,70,65],[6.45,241.2,65],[3.3,140,135],[3.3,300,135],[6.45,25,130]]],["frontRoller",[-175,31.9,26.9],[175,108.1,103.1],1551791.654736087,[[38.1,70,65],[6.35,70,65]]],["rearRoller",[-175,203.1,26.9],[175,279.3,103.1],1551791.654736087,[[38.1,241.2,65],[6.35,241.2,65]]],["frontShaft",[-199.04999999999998,63.65,58.65],[199.04999999999998,76.35,71.35],50430.06185717845,[[6.35,70,65]]],["rearShaft",[-199.04999999999998,234.85,58.65],[199.04999999999998,247.54999999999998,71.35],50430.06185717845,[[6.35,241.2,65]]],["frontCrossmember",[-180,127.3,122.3],[180,152.7,147.7],232257.59999999998,[]],["rearCrossmember",[-180,287.3,122.3],[180,312.7,147.7],232257.59999999998,[]],["coralReference",[-150.8125,-167.15,0],[150.8125,-52.85,114.3],649551.4843768268,[[57.15,-110,57.15],[50.8,-110,57.15]]]]];
var parts=[];
for(var row in packed[2]){var cylinders=[];
for(var cylinder in row[4])cylinders=append(cylinders,{"radiusMm":cylinder[0],"centerYZMm":[cylinder[1],cylinder[2]]}
);
parts=append(parts,{"role":row[0],"minMm":row[1],"maxMm":row[2],"volumeMm3":row[3],"cylinders":cylinders}
);
}
return{"innerWidthMm":packed[0],"rollerGapMm":packed[1],"parts":parts}
;
}
function officialIntakeParameters(baseline is boolean)returns map{return{"innerWidth":(baseline?340:360)*millimeter,"rollerGap":(baseline?100:95)*millimeter,"plateThickness":6.35*millimeter}
;
}
function officialIntakeNear(actual is number,expected is number,tolerance is number,label is string){if(abs(actual-expected)>tolerance)throw regenError(label~": expected "~expected~", measured "~actual);
}
function officialIntakeAssert(context is Context,featureId is Id,baseline is boolean)returns map{const expected=officialIntakeExpected(baseline);
const measured=officialIntakeEvidence(context,featureId);
if(measured.partCount!=9||size(measured.parts)!=9)throw regenError("Expected nine measured solids per phase");
for(var partIndex=0;
partIndex<size(expected.parts);
partIndex+=1){const actualPart=measured.parts[partIndex];
const expectedPart=expected.parts[partIndex];
if(actualPart.role!=expectedPart.role||actualPart.solidCount!=1)throw regenError("Expected exactly one solid for "~expectedPart.role);
for(var axisIndex=0;
axisIndex<3;
axisIndex+=1){officialIntakeNear(actualPart.minMm[axisIndex],expectedPart.minMm[axisIndex],0.00001,expectedPart.role~" minimum");
officialIntakeNear(actualPart.maxMm[axisIndex],expectedPart.maxMm[axisIndex],0.00001,expectedPart.role~" maximum");
}
officialIntakeNear(actualPart.volumeMm3,expectedPart.volumeMm3,max(0.001,expectedPart.volumeMm3*0.00000001),expectedPart.role~" volume");
if(size(actualPart.cylinders)!=size(expectedPart.cylinders))throw regenError(expectedPart.role~" cylindrical face count mismatch");
for(var expectedCylinder in expectedPart.cylinders){var matches=0;
for(var actualCylinder in actualPart.cylinders){if(abs(actualCylinder.radiusMm-expectedCylinder.radiusMm)>0.00001||abs(actualCylinder.axisOriginMm[1]-expectedCylinder.centerYZMm[0])>0.00001||abs(actualCylinder.axisOriginMm[2]-expectedCylinder.centerYZMm[1])>0.00001)continue;
officialIntakeNear(abs(actualCylinder.axisDirection[0]),1,0.00000001,expectedPart.role~" cylinder axis X");
officialIntakeNear(actualCylinder.axisDirection[1],0,0.00000001,expectedPart.role~" cylinder axis Y");
officialIntakeNear(actualCylinder.axisDirection[2],0,0.00000001,expectedPart.role~" cylinder axis Z");
officialIntakeNear(actualCylinder.minMm[0],expectedPart.minMm[0],0.00001,expectedPart.role~" through start");
officialIntakeNear(actualCylinder.maxMm[0],expectedPart.maxMm[0],0.00001,expectedPart.role~" through end");
matches+=1;
}
if(matches!=1)throw regenError(expectedPart.role~" missing or duplicated cylinder/bore");
}
}
officialIntakeNear(measured.parts[1].minMm[0]-measured.parts[0].maxMm[0],expected.innerWidthMm,0.00001,"inner width");
officialIntakeNear(measured.parts[3].minMm[1]-measured.parts[2].maxMm[1],expected.rollerGapMm,0.00001,"clear roller gap");
return{"phase":baseline?"baseline":"revision","assertionsPassed":true,"lengthToleranceMm":0.00001,"volumeToleranceMm3":"max(0.001, expectedVolume * 1e-8)","measurements":measured}
;
}
const officialIntakeDefaultBaseline=true;
annotation{"Feature Type Name":"OfficialIntakeSelfTest"}
export const officialIntakeSelfTest = defineFeature(function(context is Context,id is Id,definition is map)precondition{}
{var phases=[];
for(var baseline in[true,false]){const phaseId=id+(baseline?"baseline":"revision");
officialIntake(context,phaseId,officialIntakeParameters(baseline));
phases=append(phases,officialIntakeAssert(context,phaseId,baseline));
}
println({"evidenceClass":"TRANSIENT_SCRATCH_EVALUATION_NOT_PERSISTED","persisted":false,"solidsPerPhase":9,"evaluationTotalSolids":18,"phases":phases}
);
}
,{}
);
annotation{"Feature Type Name":"OfficialIntakeRetained"}
export const officialIntakeRetained = defineFeature(function(context is Context,id is Id,definition is map)precondition{}
{const intakeId=id+"intake";
officialIntake(context,intakeId,officialIntakeParameters(officialIntakeDefaultBaseline));
const measurements=officialIntakeAssert(context,intakeId,officialIntakeDefaultBaseline);
println({"evidenceClass":"REGENERATION_MEASUREMENTS_NOT_PERSISTENCE_READBACK","result":measurements}
);
}
,{}
);