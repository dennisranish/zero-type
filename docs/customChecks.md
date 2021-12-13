# zero-type - custom checks

You can write custom checks. Here is an example.

```typescript
export class CustomCheck extends TypeCheck {
	value: number;
	constructor(value: number){ super(); this.value = value; }
	compile(info: CompileInfo, path: string, debugPath: string) {
		return `if(${path}<${info.ch.value(this.value)})${
		compileDebug(info, debugPath, `'CustomCheck'`, `'is not \\''+${info.ch.value(this.value)}.name+'\\''`)}`;
	}
};
```

---
### `TypeCheck.prototype.compileTsType(info: CompileInfo)`
returns a typescript type; if you are not planning on using typescript you can excluded it

If this wont be checking the type but something like, if a number is under a certain value, you can also exclude it. Note you will want to make sure a type check like `PrototypeTopCheck` is used along with this.

Also `TypeDefinition.tsTypePrecedence` is the precedence used to determine which check the type should come from.

---
### `TypeCheck.prototype.compile(info: CompileInfo, path: string, debugPath: string)`
returns code of the compiled type check; code should be block or single if/else if/else chain
- `path` - is how you get your value in the object
- `debugPath` - is how you get a string of the values path in the object for debug purposes

---
### `CompileInfo`
- `ch: CompileHelper`
- `type: CompileType` - `const enum CompileType { file, instance }`
- `debug: boolean` - debug mode
- `errorList: string` - how to access the error list

---
### `CompileHelper.prototype.value(value: any)`
resolve any value to code

---
### `CompileHelper.prototype.name()`
return a unique name to use when declaring a variable

---
### `compileTsType(info: CompileInfo, value: any)`
compiles any value to a typescript type

---
### `compileDebug(info: CompileInfo, debugPath: string, check: string, errorMessage: string)`
returns code to run when check failed
- `debugPath`
- `check` - a string the checks name
- `errorMessage` - a string of the error message

> Note: make sure you pass strings: ``` `'error'` ``` and not ``` `error` ```

---
### `compileInlineIsPrimitive(value: string, outerParentheses = true)`
return equation that checks if value is a primitive
- `value` - code to get a value to check

---
### `compileAddScope(code: string)`
adds a scope block around code if there isn't one