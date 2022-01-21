import { toBijectiveNumber } from './compile.js';
import { digitSetFirst_simple, digitSet_simple, renderConsts, javascriptKeywords, digitSetFirst_ascii, digitSet_ascii } from './consts.js';
import { fixedTypeof } from './functions.js';

export const enum CompileType { file, instance }

export type CompileInfo = {
	ch: CompileHelper;
	type: CompileType;
	debug: boolean;
	errorList: string,
};

export const enum LinkType { staticImport, staticDefine, dynamic };

export type Link = {
	type: LinkType,
	key?: string,
	//code?: string,
	importName?: string, importFile?: string,
}

export class CompileHelper
{
	globalNameLatest = 0;
	dynamicNameLatest = 0;
	scopeNameLatest = [0];
	links: Map<any, Link> = new Map();
	reservedGlobalNames: string[] = [];

	value(value: any)
	{
		let primitiveType = fixedTypeof(value);
		if(primitiveType == 'null'
		|| primitiveType == 'undefined'
		|| primitiveType == 'boolean'
		|| primitiveType == 'number') return String(value);
		if(primitiveType == 'string') return `'${String(value)}'`;
		if(primitiveType == 'bigint') return `${String(value)}n`;
		if(renderConsts.has(value)) return renderConsts.get(value) as string;

		let link;
		if((link = this.links.get(value)) == undefined)
		{
			this.links.set(value, link = {
				type: LinkType.dynamic
			});
		}
		if(link.key == undefined)
		{
			if(link.type == LinkType.dynamic) link.key = this.dynamicName();
			else link.key = this.globalName();
		}
		if(link.type == LinkType.dynamic) return `_.${link.key}`;
		return link.key;
	}

	name()
	{
		for(;;)
		{
			let name = ++this.scopeNameLatest[this.scopeNameLatest.length - 1];
			let strName = toBijectiveNumber(name, [digitSetFirst_simple, digitSet_simple]);
			if(this.nameOk(strName)) return strName;
		}
	}

	dynamicName()
	{
		for(;;)
		{
			let name = ++this.dynamicNameLatest;
			let strName = toBijectiveNumber(name, [digitSetFirst_simple, digitSet_simple]);
			if(this.nameOk(strName)) return strName;
		}
	}

	globalName()
	{
		for(;;)
		{
			let name = ++this.globalNameLatest;
			let strName = '_' + toBijectiveNumber(name, [digitSetFirst_simple, digitSet_simple]);
			if(this.nameOk(strName, true)) return strName;
		}
	}

	enterScope()
	{
		this.scopeNameLatest.push(this.scopeNameLatest[this.scopeNameLatest.length - 1]);
	}

	exitScope()
	{
		this.scopeNameLatest.pop();
	}

	nameOk(name: string, global = true)
	{
		if(global && this.reservedGlobalNames.includes(name)) return false;
		if(global && javascriptKeywords.includes(name)) return false;
		return true;
	}

	isSafeName(name: string): boolean {
		if(javascriptKeywords.includes(name)) return false;
		if(!digitSetFirst_ascii.includes(name[0])) return false;
		for(let i = 1; i < name.length; i++) {
			if(!digitSet_ascii.includes(name[i])) return false;
		}
		return true;
	}

	reset()
	{
		this.globalNameLatest = 0;
		this.dynamicNameLatest = 0;
		this.scopeNameLatest = [0];
		for(let [linkValue, link] of this.links)
		{
			if(link.type == LinkType.dynamic) this.links.delete(linkValue);
			else delete link.key;
		}
	}

	addStaticImport(value: any, importName: string, importFile: string)
	{
		this.links.set(value, {
			type: LinkType.staticImport,
			importName, importFile,
		});
	}

	compileStaticImports()
	{
		let code = '';
		let linkByFile: { [key: string]: string[] } = {};
		for(let link of this.links.values())
		{
			if(link.type != LinkType.staticImport || link.key == undefined) continue;
			let aLinkByFile
			if((aLinkByFile = linkByFile[link.importFile as string]) == undefined)
			{
				linkByFile[link.importFile as string] = aLinkByFile = [];
			}
			aLinkByFile.push(`${link.importName} as ${link.key}`);
		}
		for(let [linkFile, links] of Object.entries(linkByFile))
		{
			code += `import{`;
			let first = true;
			for(let link of links)
			{
				if(!first) code += ',';
				code += link;
				first = false;
			}
			code += `}from'${linkFile}';`;
		}
		return code;
	}
}