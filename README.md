# zero-type

Fast, extensive and customizable type checking library. Deep object structures, specific values, options, and custom check functions. Compiles type validators into fast and small functions and has type guards if using typescript. Optionally type validators can be compiled to output a list of errors in submitted the object. This library also comes with handy basic type checking functions.

> Note this readme is just a preview for full docs [go here](https://github.com/dennisranish/zero-type/tree/master/docs#readme).


```
npm install zero-type
```

---
## Compile **during** runtime example
Here a simple validator is created and used to check some data. When using typescript `typeCheck.validate` is a type guard and the type is automatically generated for us when we create the validator.
```typescript
import { NumberType, StringType, typeOptional, ZeroType, IntegerType } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create({
	foo: NumberType,
	bar: typeOptional(StringType),
	baz: [ IntegerType ],
});

typeCheck.compile();

...

let isValid = typeCheck.validate(myObject);
```

---
## Compile **before** runtime example
This creates two validator functions and writes the generated typescript code to a file so that it only needs to be compiled once before the program that uses it runs.

The validators can check using user defined values, but need to be told how to get a reference to the value in the generated file (if you are compiling during runtime this is handled automatically). Either use `addStaticImport` to let the generated file import the value or dynamically link the values (explained further down).

```typescript
import { writeFileSync } from 'fs';
import { StringType, ZeroType, NonEmptyStringType, NullType, typeOptions, UndefinedType } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create({
	foo: NonEmptyStringType,
	bar: typeOptions([StringType, {
		foo: typeValues([StringType, NullType]),
		bar: StringType,
		baz: typeValues([0, 1, 2, UndefinedType]),
	}]),
	baz: typeArraySameSize(myArray), //custom check
	quz: typeCorporateEmail(companyInfo), //custom check
}, 'foobarValidator');
const typeCheck2 = zt.create(typeOptions([NonEmptyStringType, NullType]), 'validator2');

zt.addStaticImport(corporateEmailCheckFunction, 'corporateEmailCheckFunction', './MyCustomCheckFuntions'); 
zt.addStaticImport(companyInfo, 'companyInfo', './config');

zt.compile();
writeFileSync('./src/validate.ts', zt.code);
console.log(zt.dynamicLinksSummary);
```
> Note: `typeValues` is similar to `typeOptions`, but it only checks for specific primitive values or types. [More on that here.](https://github.com/dennisranish/zero-type/blob/master/docs/building.md)

One reason for imports is that values can change anytime and validators will use those new values without needing to be recompiled. For example, `companyInfo` can change between calls to the validator and it will check for the updated information. Similarly in this example, the array-same-size check, links `myArray` rather than hard coding the size so that the validator checks for whatever the current size of the array is.

This is the console output logging `zt.dynamicLinksSummary`, which is a template of the values the validators will need provided to them. Replace the undefined with the value commented and supply the object as the second argument to the validator functions. Make sure not to change the property names.

```typescript
let dynamicLinks = {
	a: undefined, //myArray
};
```

Then using the validator would look like this. Also the validator function is a type guard if typescript compile setting is enabled.

```typescript
import { foobarValidator } from "./validate";

let dynamicLinks = {
	a: myArray, //myArray
};

let isValid = foobarValidator(obj, dynamicLinks);
```

---
## More examples

In this example the validator checks for an array containing one of three object types. Here the type property checks for specific values by using `typeValues` or supplying a specific value. This way the proprties `creationInfo` and `data` will both only be allowed when `type` is `requestTypes.create` aka `2`. Same logic is used for the other two objects.
```typescript
import { writeFileSync } from 'fs';
import { NonEmptyStringType, StringType, typeOptional, typeValues, ZeroType } from "zero-type";

const enum requestTypes {
	read = 0, readInfo = 1, create = 2, remove = 3, update = 4
}

let zt = new ZeroType();
zt.create([{
		type: typeValues([requestTypes.read, requestTypes.readInfo, requestTypes.remove]),
	}, {
		type: requestTypes.create,
		creationInfo: NonEmptyStringType,
		data: typeOptional(StringType),
	}, {
		type: requestTypes.update,
		data: StringType
	}
], 'validateUpdatePartsRequest');

zt.compile();
writeFileSync('./src/validate.ts', zt.code as string);

```
> Note: An array will result in a check for one of the supplied values at all existent indexes. It will not act as tuple; if that functionality is need use the `typeTuple` build function. [More on that here.](https://github.com/dennisranish/zero-type/blob/master/docs/building.md)

This is the validator functions type.
```typescript
function validateUpdatePartsRequest(obj: any, _?: any): obj is ({
    type: (0 | 1 | 3);
} | {
    type: (2);
    creationInfo: string;
    data?: string;
} | {
    type: (4);
    data: string;
})[]
```

---

> Note this readme is just a preview for full docs [go here](https://github.com/dennisranish/zero-type/tree/master/docs#readme).