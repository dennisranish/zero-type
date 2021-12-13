# zero-type - docs

Extensive and customizable type checking. Deep object structures, classes, specific values, and custom check functions. Compiles type validators into fast and small functions and has type guards if using typescript. Optionally type validators can be compiled to output list of errors in submitted object. This library also comes with handy basic type checking functions.

- [Building](https://github.com/dennisranish/zero-type/blob/master/docs/building.md)
- [Compiling](https://github.com/dennisranish/zero-type/blob/master/docs/compiling.md)
- [Functions](https://github.com/dennisranish/zero-type/blob/master/docs/functions.md) - basic type checking function that are included in this library
- [Writing Custom Checks](https://github.com/dennisranish/zero-type/blob/master/docs/customChecks.md)

---
## Example file structure if compiling before runtime
If you choose to compile before runtime here is a basic project structure you can follow to make things easier.
- Make sure libray is installed `npm install zero-type`
- Add another folder to project root directory. Ex: `./zero-type`
- Add ts/js file with code to generate validators. Ex: `./zero-type/index.ts`
```typescript
import { writeFileSync } from 'fs';
import { ZeroType, NonEmptyStringType, IntegerType } from 'zero-type';

const zt = new ZeroType();
const typeCheck = zt.create({
	foo: NonEmptyStringType,
	bar: IntegerType
}, 'foobarValidator');

zt.compile();
writeFileSync('./src/validate.ts', zt.code);
```
- Add script to package.json or just run the command when you need to compile validators
```
"scripts": {
	"zeroTypeCompile": "tsc ./zero-type/index.ts & node ./zero-type/index.js"
}
```
- To compile run `npm run zeroTypeCompile`