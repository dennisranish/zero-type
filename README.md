# zero-type

Extensive and customizable type checking. Deep object structures, classes, specific values, and custom check functions. Compiles type validators into fast and small functions and has type guards if using typescript. Optionally type validators can be compiled to output a list of errors in submitted the object. This library also comes with handy basic type checking functions.

> Note this readme is just a preview for full docs [go here](https://github.com/dennisranish/zero-type/tree/master/docs#readme).


```
npm install zero-type
```

---
## Compile **during** runtime example
Here a simple validator is created and used to check some data. When using typescript `typeCheck.validate` is a type guard and the type is automatically generated for us when we create the validator.
```typescript
import { NumberType, StringType, typeOptional, ZeroType, IntegerType, typeClass } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create({
	foo: NumberType,
	bar: typeOptional(StringType),
	baz: [ IntegerType ],
	quz: typeClass(MyClass),
});

typeCheck.compile();

...

let isValid = typeCheck.validate(myObject);
```

---
## Compile **before** runtime example
This creates two validator functions and writes the generated typescript code to a file so that it only needs to be compiled once before the program that uses it runs.

The validators can check using user defined values like classes, but need to be told how to get a reference to the value in the generated file (if you are compiling during runtime this is handled automatically). Either use `addStaticImport` to let the generated file import the value or dynamically link the values (explained further down).

```typescript
import { writeFileSync } from 'fs';
import { StringType, ZeroType, NonEmptyStringType, NullType, typeOptions, UndefinedType, typeValues } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create({
	foo: NonEmptyStringType,
	bar: typeOptions([StringType, {
		foo: typeValues([StringType, NullType]),
		bar: StringType,
		baz: typeValues([0, 1, 2, UndefinedType]),
	}]),
	baz: typeValues([typeClass(MyClass), typeClass(MyClass2)]),
}, 'foobarValidator');
const typeCheck2 = zt.create(typeOptions([NonEmptyStringType, NullType]), 'validator2');

zt.addStaticImport(MyClass, 'MyClass', './MyClassFile');

zt.compile();
writeFileSync('./src/validate.ts', zt.code);
console.log(zt.dynamicLinksSummary);
```
> Note: `typeValues` is similar to `typeOptions`, but it only checks for specific primitive values or types. [More on that here.](https://github.com/dennisranish/zero-type/blob/master/docs/building.md)

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
