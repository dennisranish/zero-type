# zero-type - building

Building converts easily readable data to a structure of `TypeDefinition` and `TypeCheck` classes that compile code. This set of build functions lets us keep things readable and help typescript generate the type of the validator we are building without needing to define it.
> Note: the build functions tell typescript that they return the type they check for when in reality they are returning `TypeDefinition`s.

Here is an example of building a type.

```typescript
zt.create({
	foo: NonEmptyStringType,
	bar: typeOptions([StringType, {
		foo: IntegerType,
		bar: StringType,
		baz: typeOptional(StringType),
	}]),
	baz: [ typeClass(MyClass) ],
}, 'foobarValidator');
```
---
### `recursiveTypeBuild(obj: any): TypeDefinition`
> Note: not for manual use; this should only be called from another build function
- `obj` - recursively builds this value into `TypeDefinition`s
	- `TypeDefinition`s get left as is
	- Objects - will check that the prototype top is an object and that all properties are present unless optional flag is marked on property's value using `typeOptional`; all property values will be evaluated using this same algorithm
	- Arrays - will check that the prototype top is an array, that all properties are match of one of the types in the array, and that there are no non-sequential proprties start from zero; all property values will be evaluated using this same algorithm
	- Classes (functions) - will check that the prototype chain includes this class
	> Note: when doing this typescript will assume `typeof myClass` rather than `myClass`; adding typeClass() fixes this. When compiling to a file typescript type is correct.
	- Other - will check that the prototype top is the same as the supplied value
---
### `ZeroType.prototype.create<Type>(obj: Type, name?: string): ZeroTypeDef<Type>`
- `obj` - builds this using `recursiveTypeBuild`
- `name` - name used when compiling for a file; if not name is supplied default of `'validateType'` is used; if name cannot be used an underscore and number will be added
---
### `typeOptional<Type>(obj: Type): undefined | Type`
marks optional flag as true
- `obj` - builds this using `recursiveTypeBuild`

returns a `TypeDefinition`

---
### `typeOptions<Type>(obj: Type[]): Type`
will check that value matches at least one of the `TypeDefinition`
- `obj` - array of options for a value; builds each option using `recursiveTypeBuild`

returns a `TypeDefinition`

---
### `typeObject<Type>(obj: Type, defaultOptions: any[], checks: TypeCheck[]): Type`
similar to objects passed to `recursiveTypeBuild`, but gives you more control
> Note: this does not add a prototype top bring object check
- `obj` - builds same as objects passed to `recursiveTypeBuild` except does not check that prototype top is object
- `defaultOptions` - array of options for any properties not in `obj`
- `checks` - array of additional checks (ex: `PrototypeTopCheck`, `PrototypeIncludesCheck`)

returns a `TypeDefinition`

For example this would check an object's properties and make sure that its prototype chain includes `MyClass`.
```typescript
typeObject({
	foo: [ IntegerType ],
	bar: NonEmptyStringType,
}, [], [
	new PrototypeIncludesCheck(MyClass),
])
```

---
### `typeClass<Type extends new (...args: any) => any>(classType: Type, top: boolean = false): InstanceType<Type>`
checks for a class; does not check any properties
- `classType` - class to check for
- `top` - weather or not to check only the top of the prototype chain

returns a `TypeDefinition`



---
### `typeValues<Type>(options: Type[]): Type`
similar to `typeOptions`, but it only checks for specific primitive values or types.
- `options` - specific primitive values or types to check for (ex: `typeValues([42, 'hi', false, NumberType, typeClass(MyClass)])`)

returns a `TypeDefinition`

### Notes
- When `TypeDefinition`s are passed, `PrototypeTopCheck` is looked for to resolve type.
- When primitives values are passed both type and value are checked. If something like the number 42 and `NumberType` are both present only a check for being a number is done. 
- Note that strict type check happens so 42 is not equal to '42'.
- Typescript will resolve primitive values as their type rather than a literal; you can fill in the `<Type>`
for it to be more accurate
```typescript
typeValues< 0 | 1 | 2 | 42 >([ 0, 1, 2, 42 ]); //by default typescript assumes type number
```

---
### `typeCustom<Type>(checks: TypeCheck[]): Type`
- `checks` - what to check for (ex: `PrototypeTopCheck`, `PrototypeIncludesCheck`)

returns a `TypeDefinition`
