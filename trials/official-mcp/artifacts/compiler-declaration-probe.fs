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
function officialIntakeNear(actual is number,expected is number,tolerance is number,label is string){if(abs(actual-expected)>tolerance)throw regenError(label~": expected "~expected~", measured "~actual);
}
function inputs()returns map{return{}
;
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
{qBodyType(qNothing(),BodyType.SOLID);
}
,{"innerWidth":340*millimeter,"rollerGap":100*millimeter,"plateThickness":6.35*millimeter}
);
annotation{"Feature Type Name":"PROBE"}
export const probe = defineFeature(function(context is Context,id is Id,definition is map)precondition{}
{officialIntake(context,id+"probe",inputs());
println("OFFICIAL_DECL_OK");
}
,{}
);
annotation{"Feature Type Name":"PROBE2"}
export const probe2 = defineFeature(function(context is Context,id is Id,definition is map)precondition{}
{}
,{}
);