import { PrototypeTopCheck, IntegerCheck, NonEmptyStringCheck } from "./checks";
import { Null, Undefined } from "./consts";
import { AnyTypeDefinition, TypeDefinition } from "./core";

export const UndefinedTypeDefinition = new TypeDefinition([new PrototypeTopCheck(Undefined)]);
export const NullTypeDefinition = new TypeDefinition([new PrototypeTopCheck(Null)]);
export const BooleanTypeDefinition = new TypeDefinition([new PrototypeTopCheck(Boolean)]);
export const NumberTypeDefinition = new TypeDefinition([new PrototypeTopCheck(Number)]);
export const BigIntTypeDefinition = new TypeDefinition([new PrototypeTopCheck(BigInt)]);
export const StringTypeDefinition = new TypeDefinition([new PrototypeTopCheck(String)]);
export const SymbolTypeDefinition = new TypeDefinition([new PrototypeTopCheck(Symbol)]);
export const IntegerTypeDefinition = new TypeDefinition([new IntegerCheck()]);
export const NonEmptyStringTypeDefinition = new TypeDefinition([new NonEmptyStringCheck()]);

export const AnyType: any = AnyTypeDefinition as any;
export const UndefinedType: undefined = UndefinedTypeDefinition as unknown as undefined;
export const NullType: null = NullTypeDefinition as unknown as null;
export const BooleanType: boolean = BooleanTypeDefinition as unknown as boolean;
export const NumberType: number = NumberTypeDefinition as unknown as number;
export const BigIntType: bigint = BigIntTypeDefinition as unknown as bigint;
export const StringType: string = StringTypeDefinition as unknown as string;
export const SymbolType: symbol = SymbolTypeDefinition as unknown as symbol;
export const IntegerType: number = IntegerTypeDefinition as unknown as number;
export const NonEmptyStringType: string = NonEmptyStringTypeDefinition as unknown as string;