import { CompileInfo } from './compileHelper.js';
import { tsTypePrimitives } from './consts.js';

export function toBijectiveNumber(number = 0, digitSets: string[])
{
	let str = '';
	if(number <= 0) return str;
	for(let i = 0;;i++)
	{
		let set = digitSets[Math.min(i, digitSets.length)];
		number--;
		str += set[number % set.length];
		if(number < set.length) break;
		number = Math.floor(number / set.length);
	}
	return str;
}

export function compileTsType(info: CompileInfo, value: any)
{
	let primitiveType = tsTypePrimitives.get(value);
	if(primitiveType) return primitiveType;
	let type = info.ch.value(value);
	if(type.includes('.')) return `InstanceType<typeof ${type}>`;
	return type;
}

export function compileDebug(info: CompileInfo, debugPath: string, check: string, errorMessage: string)
{
	if(!info.debug) return 'return false;';
	return `${info.errorList}.push({path:${debugPath},check:${check},error:${errorMessage}});`;
}

export function compileInlineIsPrimitive(value: string, outerParentheses = true)
{
	let code = `${value}===null||(typeof ${value}!='object'&&typeof ${value}!='function')`;
	if(outerParentheses) code = `(${code})`;
	return code;
}

export function compileAddScope(code: string): string
{
	if(code[0] == '{' && code[code.length - 1] == '}') return code;
	return `{${code}}`
}