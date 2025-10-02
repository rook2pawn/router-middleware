import { expectType, expectNotAssignable } from "tsd";
import type { Response } from "../src/index.js";

const rStr: Response<string> = {} as any;
expectType<(b: string) => void>(rStr.send);
expectType<() => void>(rStr.end);
expectNotAssignable<() => void>(rStr.send); // must pass body

const rVoid: Response<void> = {} as any;
expectType<(b: void) => void>(rVoid.send); // still requires an arg by design
expectType<() => void>(rVoid.end); // the way to flush with no body
