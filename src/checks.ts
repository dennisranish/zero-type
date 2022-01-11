import { CompileInfo } from './compileHelper';
import { recursiveTypeBuild } from './build';
import { compileTsType, compileDebug, compileInlineIsPrimitive, compileAddScope } from './compile';
import { AnyTypeDefinition, TypeCheck, TypeDefinition } from './core';
import { isPrimitive, prototypeIncludes, prototypeTop } from './functions';
import { primitiveTypes } from './consts';

export class PrototypeTopCheck extends TypeCheck {
	prototype: Function;
	constructor(prototype: Function){ super(); this.prototype = prototype; }
	compileTsType(info: CompileInfo) { return compileTsType(info, this.prototype); }
	compile(info: CompileInfo, path: string, debugPath: string) {
		return `if(${info.ch.value(prototypeTop)}(${path})!=${info.ch.value(this.prototype)})${
		compileDebug(info, debugPath, `'PrototypeTopCheck'`, `'prototype is not \\''+${info.ch.value(this.prototype)}.name+'\\''`)}`;
	}
};

export class PrototypeIncludesCheck extends TypeCheck {
	prototype: Function;
	constructor(prototype: Function){ super(); this.prototype = prototype; }
	compileTsType(info: CompileInfo) { return compileTsType(info, this.prototype); }
	compile(info: CompileInfo, path: string, debugPath: string) {
		return `if(!${info.ch.value(prototypeIncludes)}(${path},${info.ch.value(this.prototype)}))${
		compileDebug(info, debugPath, `'PrototypeIncludesCheck'`, `'prototype does not include \\''+${info.ch.value(this.prototype)}.name+'\\''`)}`;
	}
};

export class IntegerCheck extends TypeCheck {
	compileTsType(info: CompileInfo) { return 'number'; }
	compile(info: CompileInfo, path: string, debugPath: string) {
		return `if(${info.ch.value(prototypeTop)}(${path})!=Number||!Number.isInteger(Number(${path})))${
		compileDebug(info, debugPath, `'IntegerCheck'`, `'not an integer'`)}`;
	}
};

export class NonEmptyStringCheck extends TypeCheck {
	compileTsType(info: CompileInfo) { return 'string'; }
	compile(info: CompileInfo, path: string, debugPath: string) {
		return `if(${info.ch.value(prototypeTop)}(${path})!=String||${path}=='')${
		compileDebug(info, debugPath, `'NonEmptyStringCheck'`, `'not a non empty string'`)}`;
	}
};

export class ValueOptionCheck extends TypeCheck {
	options: { prototype: Function, value?: any }[] = [];
	constructor(options: any[])
	{
		super();
		for(let option of options)
		{
			let prototype = prototypeTop(option);
			if(primitiveTypes.includes(prototype)) this.options.push({ prototype, value: option.valueOf() });
			else if(option instanceof TypeDefinition) for(let check of option.checks)
			{
				if(check instanceof PrototypeTopCheck)
				{
					this.options.push({ prototype: check.prototype });
					break;
				}
			}
			else this.options.push({ prototype });
		}
	}
	compileTsType(info: CompileInfo)
	{
		let type = `(`, first = true;
		for(let option of this.options)
		{
			if(!first) type += `|`;
			if('value' in option) type += compileTsType(info, option.value);
			else type += compileTsType(info, option.prototype);
			first = false;
		}
		return type + `)`;
	}
	compile(info: CompileInfo, path: string, debugPath: string)
	{
		let noValue = {};
		info.ch.enterScope();
		let sortedOptions = new Map<Function, any[]>();
		for(let option of this.options)
		{
			let sortedOption;
			if((sortedOption = sortedOptions.get(option.prototype)) == undefined) {
				sortedOptions.set(option.prototype, sortedOption = []);
			}
			if('value' in option) sortedOption.push(option.value);
			else sortedOption.push(noValue);
		}

		let type = ``, first = true;
		if(info.debug) for(let option of this.options)
		{
			if(!first) type += ` | `;
			if('value' in option) type += compileTsType(info, option.value);
			else if(typeof option.prototype == 'function') type += option.prototype.name;
			else type += String(option.prototype);
			first = false;
		}

		let failVar = info.ch.name();
		let code = `{let ${failVar};`;
		for(let [prototype, values] of sortedOptions)
		{
			code += `if(${info.ch.value(prototypeTop)}(${path})==${info.ch.value(prototype)})`;
			if(!values.includes(noValue))
			{
				code += `{if(`;
				let first = true;
				for(let value of values)
				{
					if(!first) code += `&&`;
					code += `${path}!=${info.ch.value(value)}`;
					first = false;
				}
				code += `)${failVar}=1;}`;
			}
			else code += `{}`;
			code += `else `;
		}
		code += `${failVar}=1;if(${failVar})${compileDebug(info, debugPath, `'ValueOptionCheck'`, `"not a value from ${type}"`)}}`;
		info.ch.exitScope();
		return code;
	}
};

export class ObjectPropertiesCheck extends TypeCheck
{
	names: Map<string, TypeDefinition> = new Map();
	namesOptional: Set<string> = new Set();
	default?: TypeDefinition;

	constructor(named: { [key: string]: any }, defaultOptions: any[])
	{
		super();

		for(let key in named)
		{
			let subObjTypeDef = recursiveTypeBuild(named[key]);
			this.names.set(key, subObjTypeDef);
			if('optinal' in subObjTypeDef) this.namesOptional.add(key);
		}

		if(defaultOptions.length > 1) this.default = new TypeDefinition([new OptionCheck(defaultOptions)]);
		else if(defaultOptions.length == 1) this.default = recursiveTypeBuild(defaultOptions[0]);
	}

	compileTsType(info: CompileInfo)
	{
		let type = '{';
		let defaultType = '';
		for(let [property, def] of this.names)
		{
			let defTsType = def.compileTsType(info);
			type += `${property}${this.namesOptional.has(property) ? '?' : ''}:${defTsType},`;
			if(defaultType.length == 0) defaultType += defTsType;
			else defaultType += '|' + defTsType;
		}
		if(this.default)
		{
			let defaultTsType = this.default.compileTsType(info)
			if(defaultType.length == 0) defaultType += defaultTsType;
			else defaultType += '|' + defaultTsType;
			type += `[key:string]:${defaultTsType},`;
		}
		type += '}';
		return type;
	}

	compile(info: CompileInfo, path: string, debugPath: string)
	{
		info.ch.enterScope();
		let propertyVar = info.ch.name();
		let code = `{if(${compileInlineIsPrimitive(path)})${compileDebug(info, debugPath, `'ObjectPropertiesCheck'`, `'not be a non primitive value'`)}else{`;
		for(let [property, _] of this.names)
		{
			if(this.namesOptional.has(property)) continue;
			code += `if(!('${property}' in ${path}))${compileDebug(info, `${debugPath}+'.${property}'`, `'ObjectPropertiesCheck'`, `'property is missing'`)}`;
		}
		code += `for(let ${propertyVar} in ${path}){`;
		for(let [property, def] of this.names)
		{
			code += `if(${propertyVar}=='${property}')${compileAddScope(def.compile(info, `${path}.${property}`, `${debugPath}+'.${property}'`))}else `;
		}
		if(this.default) code += compileAddScope(this.default.compile(info, `${path}[${propertyVar}]`, `${debugPath}+'.'+${propertyVar}`));
		else code += compileDebug(info, `${debugPath}+'.'+${propertyVar}`, `'ObjectPropertiesCheck'`, `'property is not allowed'`);
		code += `}}}`;
		info.ch.exitScope();
		return code;
	}
}

export class ArrayStrictCheck extends TypeCheck
{
	default: TypeDefinition;

	constructor(defaultOptions: any[])
	{
		super();

		if(defaultOptions.length > 1) this.default = new TypeDefinition([new OptionCheck(defaultOptions)]);
		else if(defaultOptions.length == 1) this.default = recursiveTypeBuild(defaultOptions[0]);
		else this.default = AnyTypeDefinition;
	}

	compileTsType(info: CompileInfo): string
	{
		return `${this.default.compileTsType(info)}[]`;
	}

	compile(info: CompileInfo, path: string, debugPath: string)
	{
		info.ch.enterScope();
		let indexVar = info.ch.name();
		let code = `{if(${compileInlineIsPrimitive(path, false)})${compileDebug(info, debugPath, `'ArrayStrictCheck'`, `'not be a non primitive value'`)}else{`
		+ `let ${indexVar} = 0;for(;${indexVar} in ${path};${indexVar}++)${compileAddScope(this.default.compile(info, `${path}[${indexVar}]`, `${debugPath}+'['+${indexVar}+']'`))}`
		+ `if(Object.keys(${path}).length!=${indexVar})${compileDebug(info, debugPath, `'ArrayStrictCheck'`, `'not a sequentially strict array'`)}}}`;
		info.ch.exitScope();
		return code;
	}
}

export class OptionCheck extends TypeCheck
{
	options: TypeDefinition[] = [];

	constructor(options: any[])
	{
		super();

		for(let option of options)
		{
			let subObjTypeDef = recursiveTypeBuild(option);
			this.options.push(subObjTypeDef);
		}
	}

	compileTsType(info: CompileInfo)
	{
		if(this.options.length == 0) return 'void';
		if(this.options.length == 1) return this.options[0].compileTsType(info);
		let type = '(';
		for(let def of this.options)
		{
			let defTsType = def.compileTsType(info);
			if(type.length == 1) type += defTsType;
			else type += '|' + defTsType;
		}
		type += ')';
		return type;
	}

	compile(info: CompileInfo, path: string, debugPath: string)
	{
		info.ch.enterScope();
		let errorList, errorListInner, error, subInfo: CompileInfo | undefined;
		if(info.debug)
		{
			errorList = info.ch.name();
			errorListInner = info.ch.name();
			error = info.ch.name();
			subInfo = { ch: info.ch, type: info.type, debug: info.debug, errorList: errorListInner };
		}

		let code = `{`;
		if(info.debug) code += `let ${errorList}=[];`;
		code += `if(`;
		let first = true;
		for(let option of this.options)
		{
			if(!first) code += `&&`;
			let subCode = ``;
			if(info.debug) subCode += `let ${errorListInner}=[];`;
			if(subInfo) subCode += option.compile(subInfo, 'obj', debugPath);
			else subCode += option.compile(info, 'obj', debugPath);
			if(info.debug) subCode += `if(${errorListInner}.length>0){for(let ${error} of ${errorListInner})${errorList}.push(${error});return false;}`;
			code += `((obj)=>${compileAddScope(subCode)})(${path})==false`
			first = false;
		}
		if(!info.debug) code += `)return false;`;
		else code += `)for(let ${error} of ${errorList})${info.errorList}.push(${error});`;
		code += `}`;
		info.ch.exitScope();
		return code;
	}
}

TypeDefinition.tsTypePrecedence = [
	[ObjectPropertiesCheck, ArrayStrictCheck, OptionCheck],
	[PrototypeTopCheck, PrototypeIncludesCheck, IntegerCheck, NonEmptyStringCheck, ValueOptionCheck],
];