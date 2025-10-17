router-middleware

Tiny Express-style router with end to end typescript safety.

# install

```bash
npm i router-middleware
```

# import

```ts
// ESM
import createApp from "router-middleware";
const app = createApp();

// CommonJS
const rm = require("router-middleware").default; // ← yes, .default
const app = rm();
```

# quick start (ts)

```ts
import http from "node:http";
import rm from "router-middleware";

const app = rm();
const server = http.createServer(app);

// Enable JSON parsing for incoming requests (safe defaults: 1mb, application/json, etc.)
app.use(app.jsonParser());

// 1) Typed params — `id` inferred as string
app.get<"/user/:id">("/user/:id", (req, res) => {
  // req.params: { id: string }
  res.json({ id: req.params.id });
});

// 2) Typed body in and typed object out
type UpdateEmailBody = { email: string };
type UpdateEmailResult = { ok: true; id: string; email: string };

app.post<"/user/:id/email", UpdateEmailBody, UpdateEmailResult>(
  "/user/:id/email",
  (req, res) => {
    // req.body: { email: string }
    // req.params: { id: string }
    res.status(201).json({
      ok: true,
      id: req.params.id,
      email: req.body.email,
    });
  }
);

// 3) If you want to send text (not JSON), use .send with a string/Buffer/Uint8Array
app.get<"/health">("/health", (_req, res) => {
  res.status(200).send("OK"); // not an object here
});

// Optional: error middleware (Express-style)
app.use((err, _req, res, _next) => {
  res.status(err?.statusCode ?? 500).json({ error: err?.message ?? "error" });
});

server.listen(5150);
```

```bash
curl -X POST -H "content-type: application/json" \
  -d '{"email":"user@example.com"}' \
  "http://localhost:5150/user/abc123/email"
```

# Router for prefix based middleware

## Basics

```ts
import rm, { Router } from "router-middleware";

const app = rm();
const v1 = new Router();

v1.get("/strategies", (_req, res) => res.send("list"));
v1.post("/strategies", app.jsonParser(), (req, res) => res.json(req.body));

// Mount everything under /api/v1  →  /api/v1/strategies
app.use("/api/v1", v1);
```

## Prefix-scoped middleware

```ts
// runs only for /api/v1 and below
app.use("/api/v1", (req, _res, next) => {
  (req as any).ctx = "v1";
  next();
});
```

## Nested routers

```ts
const api = new Router();
const v2 = new Router();

v2.get("/ping", (_req, res) => res.send("pong"));

api.use("/v2", v2); // /api/v2/ping
app.use("/api", api);
```

# primary usage patterns and rules

### usage patterns

```ts
// OK JSON
res.status(201).json({ id: "abc123" });

// Plain text
res.set("Content-Type", "text/plain; charset=utf-8").send("ok");

// Empty body (204 No Content)
res.status(204).end();

// 405 with Allow
res.set("Allow", "GET, POST").status(405).end();

// Error
res.status(400).json({ error: "Bad request" });
```

### rules

- `res.send(body)` for string or buffers
- `res.json(object)` for objects
- `res.end()` for neither
- Default HTTP status is 200
- res.set(name, value) is chainable and sets headers before send.
- res.status(code) is chainable.
- res.json always sets Content-Type: application/json; charset=utf-8.

# why this over Express?

- Express-like DX: app.use, app.get/post, (req,res,next) handlers, works with most Express middleware.
- Fully typed: route params inferred from the path (/user/:id → req.params.id: string), Response<T> guards res.send.
- Safe by default: JSON body parser only, strict content-type, 1 MB limit, helpful 415/413/400 errors.
- Hardened runtime: async handlers supported out-of-the-box, centralized error path, 405/OPTIONS/HEAD helpers.
- Lean: no view engine, no globals, no surprises. Bring only what you need.
- Modern packaging: dual ESM/CJS exports, typed declarations included.

# features

- Routing: app.get/post/put/delete/patch/head/options(path, handler)
- Middleware: app.use(fn) (either “regular” or error (err, req, res, next) middleware)
- Fileserver: app.fileserver(fn) (falls through unmatched GET routes to your static handler)

## Helpers on res:

- res.status(code) → chainable
- res.set(name, value) → chainable
- res.json(obj) → sets JSON content-type
- res.send(body) → Buffer/string
- res.end() → No body end (such as OPTIONS 204)

## HTTP niceties:

- HEAD auto-handled for matching GET
- OPTIONS returns Allow for the route
- 405 Method Not Allowed with Allow header

# try it out right away

```
node test.mjs
```

# supports generic type handlers

```ts
// GET handler typed as <Path, RB=string, RO=object>
app.get<"/echo", string, { text: string; length: number }>(
  "/echo",
  (req, res) => {
    const text = req.query?.q ?? ""; //    string
    res.json({ text, length: s.length });
  }
);
```

```
curl -i "http://127.0.0.1:3000/echo?q=bart"
# returns { text: bart, length: 4 }
```

## More examples of strongly typed handlers

```ts
// Handlers are strongly typed:
app.get<"/ping", unknown, { ok: true }>("/ping", (_req, res) => {
  // res.send enforces { ok: true }
  res.json({ ok: true });
});
```

```ts
// If you want typed queries/bodies:
type Q = { search?: string };
type B = { email: string };
type R = { ok: true };

app.post<"/user/:id/email", Q, B, R>("/user/:id/email", (req, res) => {
  // req.query.search?: string
  // req.body.email: string
  res.status(201).json({ ok: true });
});
```

GET with path params + typed JSON response

```ts
// <Path, RB=unknown, RO=ResponseBody>
app.get<"/users/:id", unknown, { id: string; name: string }>(
  "/users/:id",
  (req, res) => {
    // req.params.id: string
    res.json({ id: req.params.id, name: "Ada" });
  }
);
```

GET with typed query object (string | string[])

```ts
type UserQuery = { q?: string | string[]; limit?: string };
app.get<"/users", unknown, { items: string[] }>(
  "/users",
  (req: Request<unknown, AnyParams, UserQuery>, res) => {
    const { q, limit } = req.query ?? {};
    const n = Number(limit ?? 10) || 10;
    const term = Array.isArray(q) ? q[0] : q;
    res.json({ items: Array(n).fill(term ?? "user") });
  }
);
```

POST create with JSON body + 201 + Location

```ts
type CreateUser = { name: string; email: string };
type CreateOut = { id: string };

app.post<"/users", CreateUser, CreateOut>(
  "/users",
  app.jsonParser(),
  (req, res) => {
    const { name, email } = req.body; // typed
    const id = crypto.randomUUID();
    res.set("Location", `/users/${id}`).status(201).json({ id });
  }
);
```

POST batch (array body) → summary object

```ts
type BatchIn = Array<{ name: string }>;
type BatchOut = { created: number };

app.post<"/users:batch", BatchIn, BatchOut>(
  "/users:batch",
  app.jsonParser(),
  (req, res) => {
    res.json({ created: req.body.length });
  }
);
```

PATCH partial update (typed partial body)

```ts
type UserPatch = Partial<{ name: string; email: string }>;
type UserOut = { id: string; name?: string; email?: string };

app.patch<"/users/:id", UserPatch, UserOut>(
  "/users/:id",
  app.jsonParser(),
  (req, res) => {
    res.json({ id: req.params.id, ...req.body });
  }
);
```

GET that returns plain text (typed send)

```ts
app.get<"/health", unknown, string>("/health", (_req, res) => {
  res.send("ok");
});
```

POST with simple validation middleware (still typed)

```ts
type LoginIn = { username: string; password: string };
type LoginOut = { token: string };

const requireFields: Handler<LoginIn> = (req, _res, next) => {
  if (!req.body?.username || !req.body?.password)
    return next(new Error("bad request"));
  next();
};

app.post<"/login", LoginIn, LoginOut>(
  "/login",
  app.jsonParser(),
  requireFields,
  (req, res) => {
    res.json({ token: "abc123" });
  }
);
```

Reminder of the signature order: app.METHOD< Path, RequestBody, ResponseBody >(path, ...handlers).
For GETs, RequestBody is usually unknown; for endpoints that read req.query, you can narrow Request<unknown, Params, YourQuery> in the handler arg for clean query typing.

# Param inference from path

```ts
app.get("/users/:id", (req, res) => res.send(req.params.id));
app.put("/users/:id", (req, res) => res.end());
app.delete("/users/:id", (req, res) => res.end());
// Also: post, patch, head, options
```

# Fileserver fall-through

```ts
import http from "node:http";
import rm from "router-middleware";
import ecstatic from "ecstatic";

const app = rm();
const server = http.createServer(app);

// Your custom routes take precedence
app.get("/admin", (req, res, next) => {
  const authorized = true;
  if (!authorized) return res.status(403).send("Denied");
  next(); // fall through to fileserver (serves /admin/*)
});

// Any GET not matched above will fall through here:
app.fileserver(ecstatic({ root: __dirname + "/public" }));

server.listen(5150);
```

# error handling

```ts
app.use((err, req, res, _next) => {
  if (res.headersSent) return;
  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Internal Error" });
});
```

# body parser

```ts
// global
app.use(app.jsonParser({ limit: "1mb" }));
// or per route
app.post(
  "/ingest/trade",
  app.jsonParser({ limit: "256kb", keepRaw: true }),
  handler
);
```

## body parser options

```ts
type ByteLimit = number | `${number}${"b" | "kb" | "mb" | "gb"}`;
interface JsonOptions {
  limit?: ByteLimit; // default '1mb'
  type?: string | RegExp; // default /application\/json/i
  strict?: boolean; // reject primitives if true (default false)
  keepRaw?: boolean; // attach req.rawBody as Buffer
  onError?: (err: Error, req: any, res: any, next: any) => void; // custom error
}
```

# License

License

MIT © 2025 David Wee (rook2pawn@gmail.com)
