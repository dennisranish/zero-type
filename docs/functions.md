# zero-type - functions

This lists the basic type checking function that are included in this library.

---

## Prototype Chain
Objects have a chain of prototypes. Primitive values technically don't have a prototype chain, but function as though they do. This library assumes they do and additionally adds empty functions `Undefined`, `Null`, `Exotic`, and `PrototypeEnd` to make everything consistent. The `Exotic` value is for things that shouldn't be in the prototype chain, but are, like for example an instance of an array. The prototype chain for various values would look like this.

```typescript
//**Not the actual prototype chains**//
undefined -> [Undefined, PrototypeEnd]
null -> [Null, PrototypeEnd]
42 -> [Number, Object, PrototypeEnd]
'hi' -> [String, Object, PrototypeEnd]
{} -> [Object, PrototypeEnd]
[] -> [Array, Object, PrototypeEnd]
new MyClass() -> [MyClass, BaseClass, Object, PrototypeEnd]
```
> Note: this also treats object version of primitive values (ex: new String()) the same; regardless you should still not use object version of primitives

### `prototypeTop(obj: any): Function`
returns the top (first) element in `obj`s prototype chain

### `prototypeIncludes(obj: any, what: Function): boolean`
returns true if `obj`s prototype chain includes `what` otherwise false

### `prototypeChain(obj: any): Array<Function>`
returns `obj`s full prototype chain

---
## Other

### `isPrimitive(obj: any): boolean`
check weather `obj` is a primitive or object (`new String()` would return false)

### `fixedTypeof(obj: any)`
same as typeof but null returns `null`