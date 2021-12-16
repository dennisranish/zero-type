# zero-type - compiling

There are two ways to use validators
- compile them during runtime
- compile them before runtime

This **compiles during runtime**; note that you call compile on each function, and don't need to worry about linking at all. Building and compiling take some time to run, likely not long, but it is best to only run them once when the program starts. Also when using typescript `typeCheck.validate` is a type guard and the type is automatically generated for us when we create the validator.

```typescript
import { ... } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create(...); //build type checker
typeCheck.compile(); //compile type checker

...

let isValid = typeCheck.validate(myObject); //use type checker
```

This **compiles before runtime**; creating two validator functions and writing the generated typescript code to a file so that it only needs to be compiled once before the program that uses it runs.

The validators can check using user defined values like classes, but need to be told how to get a reference to the value in the generated file (if you are compiling during runtime this is handled automatically). Either use addStaticImport to let the generated file import the value or dynamically link the values (explained further down).

```typescript
import { writeFileSync } from 'fs';
import { ... } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create(..., 'foobarValidator'); //build type checker
const typeCheck2 = zt.create(..., 'foobarValidator2'); //build other type checker

//add static imports if they are needed
zt.addStaticImport(MyClass, 'MyClass', './MyClassFile');

zt.compile(); //compile both type checks
writeFileSync('./src/validate.ts', zt.code); //save code to file
console.log(zt.dynamicLinksSummary); //get dynamic links if they are needed
```

This is the console output logging `zt.dynamicLinksSummary`, which is a template of the values the validators will need provided to them. Replace the undefined with the value commented and supply the object as the seconds argument to the validator functions. Make sure not to change the property names.

```typescript
let dynamicLinks = {
	a: undefined, //MyClass2
};
```

Then using the validator would look like this. Also the validator function is a type guard if typescript compile setting is enabled.

```typescript
import { foobarValidator } from "./validate";

let dynamicLinks = {
	a: MyClass2, //MyClass2
};

let isValid = foobarValidator(obj, dynamicLinks);
```

---
## Linking

When your validator needs to use user defined values like classes or values stored in objects it needs to know how to get references to them.
- If you are **compiling during runtime** you do not need to do anything extra.
- If you are **compiling before runtime** and **no links are needed** you do not need to do anything extra.
- If you are **compiling before runtime** and **links are needed** you will need to either add static imports using `ZeroType.prototype.addStaticImport` or supply them using dynamic linking. `ZeroType.prototype.dynamicLinksSummary` will return a template for the object needed for the dynamic links. That object is passed to the validator as the second argument or excluded if no dynamic links are needed.

---
## Debug Mode

Validator functions can be compiled in debug mode, which makes a list of errors in object checked. To use this set debug parameter to true when compiling. Validators will function in a similar way, but the errors list will contain errors from previous validation.

How to access errors when **compiling during runtime**.
```typescript
console.log(typeCheck.errors);
```

How to access errors when **compiling before runtime**.
```typescript
import { ..., errors } from "./validate";

console.log(errors);
```

---
## Functions

### `ZeroType.prototype.create<Type>(obj: Type, name?: string): ZeroTypeDef<Type>`
- `obj` - builds this using `recursiveTypeBuild`
- `name` - name used when compiling for a file; if not name is supplied default of `'validateType'` is used; if name cannot be used an underscore and number will be added
> [More on building here.](https://github.com/dennisranish/zero-type/blob/master/docs/building.md)

---
### `ZeroType.prototype.compile(isTypescript: boolean = true, debug: boolean = false)`
compiles all validators created with `ZeroType` instance

Typescript type guards are generated from `TypeDefinitons` and not what typescript currently thinks the types are so inaccurate types are irrelevant when compiling before runtime.

---
### `ZeroType.prototype.addStaticImport(value: any, importName: string, importFile: string)`
adds a static import that can be used when compiling
> Note: if import is not needed by the validators it is not included in the code

---
### Compiled before runtime: `validator(obj: any, dynamicLinks: any): obj is Type`
runs validator


---
### Compiled before runtime: `errors: { path: string, check: string, error: string }[]`
errors are only generated if debug was set to true when compiling
- `path` - path in object error is at
- `check` - which check generated the error
- `error` - the error
---
### `ZeroTypeDef.prototype.compile(debug: boolean = false)`
compiles only this validator

---
### `ZeroTypeDef.prototype.validate(obj: any): obj is Type`
runs validator; you must compile this validator running it

---
### `ZeroTypeDef.prototype.errors: { path: string, check: string, error: string }[]`
errors are only generated if debug was set to true when compiling
- `path` - path in object error is at
- `check` - which check generated the error
- `error` - the error