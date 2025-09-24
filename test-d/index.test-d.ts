import createApp, { type App, type Request, type Response } from "router-middleware";
import { expectNotAssignable, expectType } from "tsd";


const app = createApp();

// Assert API surface type
expectType<App>(app);
// factory function type signature
expectType<() => App>(createApp);

// Route with explicit generics
app.get<"/greet", { name: string }, string>("/greet", (req, res) => {
  // req.body is {name: string} | undefined here
  expectType<string | undefined>(req.body?.name);
  res.send("ok"); // res expects string
});

// Response helper shape
const r: Response<string> = { statusCode: 200, send: (_s: string) => {} };
expectType<(b: string) => void>(r.send);
expectNotAssignable<(b: number) => void>(r.send); // r.send must not accept number
