export function Undefined(){}
export function Null(){}
export function Exotic(){}
export function PrototypeEnd(){}

export const primitiveTypes: Function[] = [
	Undefined,
	Null,
	Boolean,
	Number,
	String,
	BigInt,
	Symbol,
];

export const javascriptKeywords = [
	'do',
	'if',
	'in',
	'for',
	'let',
	'new',
	'try',
	'var',
	'case',
	'else',
	'enum',
	'eval',
	'false',
	'null',
	'this',
	'true',
	'void',
	'with',
	'break',
	'catch',
	'class',
	'const',
	'super',
	'throw',
	'while',
	'yield',
	'delete',
	'export',
	'import',
	'public',
	'return',
	'static',
	'switch',
	'typeof',
	'default',
	'extends',
	'finally',
	'package',
	'private',
	'continue',
	'debugger',
	'function',
	'arguments',
	'interface',
	'protected',
	'implements',
	'instanceof',

	'NaN',
	'Infinity',
	'undefined',
];

export const digitSetFirst_simple = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const digitSet_simple = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const digitSetFirst_ascii = '_$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const digitSet_ascii = '-$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const tsTypePrimitives = new Map<Function, string>([
	[Undefined, 'undefined'],
	[Null, 'null'],
	[Exotic, 'any'],
	[Boolean, 'boolean'],
	[Number, 'number'],
	[BigInt, 'bigint'],
	[String, 'string'],
	[Symbol, 'symbol'],
]);

export const renderConsts = new Map<any, string>([
	[Object, 'Object'],
	[Function, 'Function'],
	[Boolean, 'Boolean'],
	[Symbol, 'Symbol'],

	[Error, 'Error'],
	[EvalError, 'EvalError'],
	[RangeError, 'RangeError'],
	[ReferenceError, 'ReferenceError'],
	[SyntaxError, 'SyntaxError'],
	[TypeError, 'TypeError'],
	[URIError, 'URIError'],

	[Number, 'Number'],
	[BigInt, 'BigInt'],
	[Math, 'Math'],
	[Date, 'Date'],

	[String, 'String'],
	[RegExp, 'RegExp'],

	[Array, 'Array'],
	[Int8Array, 'Int8Array'],
	[Uint8Array, 'Uint8Array'],
	[Uint8ClampedArray, 'Uint8ClampedArray'],
	[Int16Array, 'Int16Array'],
	[Uint16Array, 'Uint16Array'],
	[Int32Array, 'Int32Array'],
	[Uint32Array, 'Uint32Array'],
	[Float32Array, 'Float32Array'],
	[Float64Array, 'Float64Array'],
	[BigInt64Array, 'BigInt64Array'],
	[BigUint64Array, 'BigUint64Array'],

	[Map, 'Map'],
	[Set, 'Set'],
	[WeakMap, 'WeakMap'],
	[WeakSet, 'WeakSet'],

	[ArrayBuffer, 'ArrayBuffer'],
	[SharedArrayBuffer, 'SharedArrayBuffer'],
	[Atomics, 'Atomics'],
	[DataView, 'DataView'],
	[JSON, 'JSON'],

	[Promise, 'Promise'],

	[Reflect, 'Reflect'],
	[Proxy, 'Proxy'],

	[Intl, 'Intl'],
	[Intl.Collator, 'Intl.Collator'],
	[Intl.DateTimeFormat, 'Intl.DateTimeFormat'],
	[Intl.NumberFormat, 'Intl.NumberFormat'],
	[Intl.PluralRules, 'Intl.PluralRules'],
	[Intl.RelativeTimeFormat, 'Intl.RelativeTimeFormat'],

	[WebAssembly, 'WebAssembly'],
	[WebAssembly.Module, 'WebAssembly.Module'],
	[WebAssembly.Instance, 'WebAssembly.Instance'],
	[WebAssembly.Memory, 'WebAssembly.Memory'],
	[WebAssembly.Table, 'WebAssembly.Table'],
	[WebAssembly.CompileError, 'WebAssembly.CompileError'],
	[WebAssembly.LinkError, 'WebAssembly.LinkError'],
	[WebAssembly.RuntimeError, 'WebAssembly.RuntimeError'],
]);