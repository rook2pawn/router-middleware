type ByteLimit = number | `${number}${"b" | "kb" | "mb" | "gb"}`;
interface JsonOptions {
  limit?: ByteLimit; // default '1mb'
  type?: string | RegExp; // default /application\/json/i
  strict?: boolean; // reject primitives if true (default false)
  keepRaw?: boolean; // attach req.rawBody as Buffer
  onError?: (err: Error, req: any, res: any, next: any) => void; // custom error
}

function parseLimit(l?: ByteLimit): number {
  if (typeof l === "number") return l;
  const str = (l ?? "1mb").toString().toLowerCase();
  const m = str.match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  const n = parseFloat(m?.[1] ?? "1");
  const unit = m?.[2] ?? "mb";
  const mult =
    unit === "gb"
      ? 1 << 30
      : unit === "mb"
      ? 1 << 20
      : unit === "kb"
      ? 1 << 10
      : 1;
  return Math.floor(n * mult);
}

export function jsonParser(opts: JsonOptions = {}) {
  const limit = parseLimit(opts.limit);
  const matcher = opts.type ?? /application\/json/i;

  return (req: any, res: any, next: any) => {
    if (req.body !== undefined) return next(); // already parsed
    const ct = String(req.headers["content-type"] || "");
    if (
      !(typeof matcher === "string" ? ct.includes(matcher) : matcher.test(ct))
    )
      return next();

    let size = 0;
    const chunks: Buffer[] = [];
    let aborted = false;

    req.on("aborted", () => {
      aborted = true;
    });
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limit) {
        req.removeAllListeners("data");
        req.removeAllListeners("end");
        res.statusCode = 413; // Payload Too Large
        return res.end("Payload too large");
      }
      chunks.push(c);
    });

    req.on("end", () => {
      if (aborted) return; // client disconnected
      try {
        const buf = Buffer.concat(chunks, size);
        if (opts.keepRaw) req.rawBody = buf;
        const text = buf.length ? buf.toString("utf8") : "";
        const val = text ? JSON.parse(text) : {};
        if (opts.strict && (val === null || typeof val !== "object")) {
          res.statusCode = 400;
          return res.end("Invalid JSON (strict)");
        }
        req.body = val;
        console.log("Attached body:", req.body);
        next();
      } catch (err: any) {
        if (opts.onError) return opts.onError(err, req, res, next);
        res.statusCode = 400;
        res.end("Invalid JSON");
      }
    });
  };
}
