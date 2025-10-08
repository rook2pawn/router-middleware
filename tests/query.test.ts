import { parseQueryFromURL, searchParamsToObject } from "../src/query";
import tape from "tape";

tape(
  "searchParamsToObject: singles, bracket-arrays, and duplicate non-bracket keys",
  (t) => {
    const sp = new URLSearchParams("a=1&b=2&c[]=x&c[]=y&d=one&d=two");
    const out = searchParamsToObject(sp);

    t.same(out, {
      a: "1", // single
      b: "2", // single
      c: ["x", "y"], // bracketed => array
      d: ["one", "two"], // duplicate (no brackets) => array
    });
    t.end();
  }
);

tape("parseQueryFromURL: handles path-only URLs safely", (t) => {
  const out = parseQueryFromURL("/foo/bar?x=1&y[]=a&y[]=b&z=2&z=3");
  t.same(out, {
    x: "1",
    y: ["a", "b"],
    z: ["2", "3"],
  });
  t.end();
});

tape("searchParamsToObject: percent-decoding and [] key trimming", (t) => {
  // name%5B%5D === name[]
  const sp = new URLSearchParams("name%5B%5D=Alice%20A.&name%5B%5D=Bob%20B.");
  const out = searchParamsToObject(sp);
  t.same(out, { name: ["Alice A.", "Bob B."] });
  t.end();
});
