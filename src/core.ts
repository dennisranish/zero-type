import { compileAddScope } from "./compile";
import { CompileHelper, CompileInfo, CompileType, LinkType } from "./compileHelper";
import { Exotic, javascriptKeywords, Null, Undefined } from "./consts";
import { prototypeIncludes, prototypeTop } from './functions';

export class ZeroType
{
	typeDefinitions: ZeroTypeDef<any>[] = [];
	typeNames: string[] = [];
	compileHelper = new CompileHelper();
	dynamicLinksSummary?: string;
	code?: string;

	constructor()
	{
		this.compileHelper.addStaticImport(Undefined, 'Undefined', 'zero-type');
		this.compileHelper.addStaticImport(Null, 'Null', 'zero-type');
		this.compileHelper.addStaticImport(Exotic, 'Exotic', 'zero-type');
		this.compileHelper.addStaticImport(prototypeTop, 'prototypeTop', 'zero-type');
		this.compileHelper.addStaticImport(prototypeIncludes, 'prototypeIncludes', 'zero-type');
	}

	create<Type>(obj: Type, name: string = ''): ZeroTypeDef<Type>
	{
		throw Error('ZeroType.create function gets defined in build');
	}

	compile(isTypescript: boolean = true, debug: boolean = false)
	{
		this.compileHelper.reset();
		let code = '', functionNames: string[] = [];
		for(let name of this.typeNames)
		{
			if(name === '') name = 'validateType';
			let checkName = name;
			for(let i = 0;; i++)
			{
				if(!functionNames.includes(checkName)
				&& !javascriptKeywords.includes(checkName)) break;
				checkName = name + '_' + i;
			}
			functionNames.push(checkName);
		}
		this.compileHelper.reservedGlobalNames.push(...functionNames);
		this.compileHelper.reservedGlobalNames.push('errors')
		if(isTypescript && debug) code += 'export let errors:{path:string,check:string,error:string}[]=[];';
		if(!isTypescript && debug) code += 'export let errors=[];';
		for(let i in this.typeDefinitions)
		{
			let info: CompileInfo = { ch: this.compileHelper, type: CompileType.file, debug, errorList: 'errors' };
			code += `export function ${functionNames[i]}`;
			if(isTypescript) code += `(obj:any,_:any={}):obj is ${this.typeDefinitions[i].definition.compileTsType(info)}`;
			else code += `(obj,_={})`;

			let subCode = ``;
			if(debug) subCode += `errors=[];`;
			subCode += this.typeDefinitions[i].definition.compile(info, 'obj', `''`);
			subCode += `return true;`;
			code += compileAddScope(subCode);
		}
		this.code = this.compileHelper.compileStaticImports() + code;

		this.dynamicLinksSummary = `let dynamicLinks = {\n`;
		for(let [linkValue, link] of this.compileHelper.links)
		{
			if(link.type != LinkType.dynamic || link.key == undefined) continue;

			this.dynamicLinksSummary += `\t${link.key}: undefined, //`;
			if(typeof linkValue == 'function') this.dynamicLinksSummary += linkValue.name;
			else this.dynamicLinksSummary += String(linkValue);
			this.dynamicLinksSummary += `\n`;
		}
		this.dynamicLinksSummary += `};`;
	}

	addStaticImport(value: any, importName: string, importFile: string)
	{
		this.compileHelper.addStaticImport(value, importName, importFile);
	}
}

export class ZeroTypeDef<Type>
{
	parent: ZeroType;
	definition: TypeDefinition;

	errors: { path: string, check: string, error: string }[] = [];
	errorsLinkName: string = '';
	isDebug = false;
	instanceFunction?: Function;
	instanceValues: { [key: string]: any } = {};
	compileHelper = new CompileHelper();

	constructor(parent: ZeroType, definition: TypeDefinition)
	{
		this.parent = parent;
		this.definition = definition;
	}

	compile(debug: boolean = false)
	{
		this.isDebug = debug;
		this.compileHelper.reset();
		let info: CompileInfo = { ch: this.compileHelper, type: CompileType.instance, debug, errorList: this.errorsLinkName = this.compileHelper.value(this.errors) };
		let code = this.definition.compile(info, 'obj', `''`) + 'return true;';
		this.instanceFunction = new Function('obj', '_', code);
		this.instanceValues = {};
		for(let [value, link] of this.compileHelper.links)
		{
			if(!link.key) continue;
			this.instanceValues[link.key] = value;
		}
	}

	validate(obj: any): obj is Type
	{
		if(this.instanceFunction == undefined) throw Error('ZeroType: function must be compiled before running');
		this.instanceValues[this.errorsLinkName] = this.errors = [];
		let result = this.instanceFunction(obj, this.instanceValues);
		if(this.isDebug) return this.errors.length == 0;
		return result;
	}
}

export class TypeDefinition
{
	static tsTypePrecedence: Function[][];
	optinal: undefined;
	checks: TypeCheck[];

	constructor(checks: TypeCheck[] = [])
	{
		this.checks = checks;
	}

	compileTsType(info: CompileInfo): string
	{
		if(this.checks.length == 0) return 'any';
		if(this.checks.length == 1) return this.checks[0].compileTsType(info);
		let mainCheck;
		for(let precedenceLevel of TypeDefinition.tsTypePrecedence)
		{
			for(let check of this.checks)
			{
				for(let checkType of precedenceLevel)
				{
					if(check instanceof checkType)
					{
						mainCheck = check;
						break;
					}
				}
				if(mainCheck) break;
			}
			if(mainCheck) break;
		}
		if(!mainCheck) mainCheck = this.checks[0];
		return mainCheck.compileTsType(info);
	}

	compile(info: CompileInfo, path: string, debugPath: string)
	{
		let code = '';
		for(let check of this.checks) code += check.compile(info, path, debugPath);
		return code;
	}
}

export class TypeCheck
{
	compileTsType(info: CompileInfo): string { return 'any'; }
	compile(info: CompileInfo, path: string, debugPath: string): string { return ''; }
}

export const AnyTypeDefinition = new TypeDefinition();