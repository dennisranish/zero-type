import { PrototypeEnd, Exotic, Null, Undefined } from "./consts";

export function isExoticPrototype(prototype: any)
{
	return prototype.constructor === undefined
	|| typeof prototype.constructor != 'function'
	|| prototype.constructor.prototype != prototype;
}

export function prototypeTop(obj: any): Function
{
	if(obj === undefined) return Undefined;
	if(obj === null) return Null;
	let prototype = Object.getPrototypeOf(obj);
	if(prototype == null) return PrototypeEnd;
	if(isExoticPrototype(prototype)) return Exotic;
	return prototype.constructor;
}

export function prototypeIncludes(obj: any, what: Function): boolean
{
	if(obj === undefined) return what == Undefined;
	if(obj === null) return what == Null;
	if(what === Exotic || what === PrototypeEnd)
	{
		for(let prototype = obj;;) {
			prototype = Object.getPrototypeOf(prototype);
			if(prototype == null) return what == PrototypeEnd;
			if(isExoticPrototype(prototype)) return what == Exotic;
		}
	}
	if(typeof what == 'function') return Object(obj) instanceof what;
	return false;
}

export function prototypeChain(obj: any): Array<Function>
{
	if(obj === undefined) return [Undefined, Exotic];
	if(obj === null) return [Null, Exotic];
	let chain: Array<Function> = [];
	for(let prototype = obj;;) {
		prototype = Object.getPrototypeOf(prototype);
		if(prototype == null)
		{
			chain.push(PrototypeEnd);
			break;
		}
		if(isExoticPrototype(prototype))
		{
			chain.push(Exotic);
			break;
		}
		chain.push(prototype.constructor);
	}
	return chain;
}

export function isPrimitive(obj: any): boolean
{
	if(obj === null) return true;
	let type = typeof obj;
	return type != 'object' && type != 'function';
}

export function fixedTypeof(obj: any)
{
	if(obj === null) return 'null';
	return typeof obj;
}