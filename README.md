router-middleware

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
// Strongly typed Response body:
app.get<"/ping", unknown, { ok: true }>("/ping", (_req, res) => {
  // res.send enforces { ok: true }
  res.json({ ok: true });
});

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

# Param inference from path

```ts
app.get("/teams/:teamId/members/:memberId", (req, res) => {
  // req.params.teamId: string
  // req.params.memberId: string
  res.json(req.params);
});
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
