import { primitiveTypes } from './consts.js';
import { ZeroType, TypeCheck, TypeDefinition, ZeroTypeDef } from './core.js';
import { OptionCheck, ObjectPropertiesCheck, PrototypeTopCheck, PrototypeIncludesCheck, ArrayStrictCheck, ValueOptionCheck } from './checks.js';
import { prototypeTop } from './functions.js';

ZeroType.prototype.create = function <Type>(obj: Type, name: string = ''): ZeroTypeDef<Type>
{
	let typeDefinition: ZeroTypeDef<Type> = new ZeroTypeDef(this, recursiveTypeBuild(obj));
	this.typeDefinitions.push(typeDefinition);
	this.typeNames.push(name);
	return typeDefinition;
}

export function typeOptional<Type>(obj: Type): undefined | Type
{
	let optionalType = new TypeDefinition();
	optionalType.optional = recursiveTypeBuild(obj);
	return optionalType as unknown as undefined | Type;
}

export function typeOptions<Type>(obj: Type[]): Type
{
	return new TypeDefinition([new OptionCheck(obj)]) as unknown as Type;
}

export function typeObject<Type>(obj: Type, defaultOptions: any[], checks?: TypeCheck[] | Function): Type
{
	let objTypeDef;
	if(checks == undefined) objTypeDef = new TypeDefinition([new PrototypeTopCheck(Object), new ObjectPropertiesCheck(obj, defaultOptions)]);
	else if(Array.isArray(checks)) objTypeDef = new TypeDefinition([...checks, new ObjectPropertiesCheck(obj, defaultOptions)]);
	else objTypeDef = new TypeDefinition([new PrototypeTopCheck(checks), new ObjectPropertiesCheck(obj, defaultOptions)]);
	return objTypeDef as unknown as Type;
}

export function typeClass<Type extends new (...args: any) => any>(classType: Type, top: boolean = false): InstanceType<Type>
{
	if(top) return new TypeDefinition([new PrototypeTopCheck(classType)]) as unknown as InstanceType<Type>;
	return new TypeDefinition([new PrototypeIncludesCheck(classType)]) as unknown as InstanceType<Type>;
}

export function typeValues<Type>(options: Type[]): Type
{
	let objTypeDef = new TypeDefinition([new ValueOptionCheck(options)]);
	return objTypeDef as unknown as Type;
}

export function typeCustom<Type>(checks: TypeCheck[]): Type
{
	let objTypeDef = new TypeDefinition([...checks]);
	return objTypeDef as unknown as Type;
}

export function recursiveTypeBuild(obj: any, leaveOptional: boolean = false): TypeDefinition
{
	let objPrototypeTop = prototypeTop(obj);
	if(objPrototypeTop == TypeDefinition) {
		if(!leaveOptional && obj.optional) return obj.optional;
		return obj;
	}
	else if(objPrototypeTop == Object)
	{
		let objTypeDef = new TypeDefinition([new PrototypeTopCheck(Object), new ObjectPropertiesCheck(obj, [])]);
		return objTypeDef;
	}
	else if(objPrototypeTop == Array)
	{
		let objTypeDef = new TypeDefinition([new PrototypeTopCheck(Array), new ArrayStrictCheck(obj)]);
		return objTypeDef;
	}
	else if(objPrototypeTop == Function) return new TypeDefinition([new PrototypeIncludesCheck(obj)]);
	else if(primitiveTypes.includes(objPrototypeTop)) return new TypeDefinition([new ValueOptionCheck([obj])]);
	else return new TypeDefinition([new PrototypeTopCheck(objPrototypeTop)]);
}

