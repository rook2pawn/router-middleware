Write fully featured http services and streaming templates without the bloat

[![Build Status](https://travis-ci.org/rook2pawn/router-middleware.svg?branch=master)](https://travis-ci.org/rook2pawn/router-middleware)

[![Coverage Status](https://coveralls.io/repos/github/rook2pawn/router-middleware/badge.svg?branch=master)](https://coveralls.io/github/rook2pawn/router-middleware?branch=master)

# router-middleware

## Full Example

```javascript
var http = require("http");
var router = require("router-middleware");
var app = router();
var server = http.createServer(app);

app.post("/user/:userId/email", router.bodyParser, function (req, res, next) {
  console.log("Query:", req.query);
  // { authToken: '1234' }
  console.log("Params:", req.params);
  // { userId: 'abc123' }
  console.log("Body:", req.body);
  return res.end(`user id was: ${req.params.userId}\n`);
});

server.listen(5150);
```

    > curl -X POST -d '{"message" : "Hello World!"}' "http://localhost:5150/user/abc123/email?authToken=1234"

## Features

- Chainable middleware
- familiar req.params and req.query are there
- identical routing to what you are used to

## Any Fileserver

- Ecstatic
- express.static
- fs

## How to handle POST (this autodetects json or form querystring)

```javascript
var http = require("http");
var router = require("router-middleware");
var app = router();
var server = http.createServer(app);

// router.bodyParser auto-detects json or querystring and places the result
// on the req.body

app.post("/user/email", router.bodyParser, function (req, res, next) {
  // Now req.body will be populated with the body posted.
  // req.body.username == 'Manny';
  // req.body.species == 'cat';
});

server.listen(5150);
```

## How to do a simple GET Fall-Through

```javascript
var http = require("http");
var router = require("router-middleware");
var ecstatic = require("ecstatic")({ root: __dirname });
var app = router();
app.fileserver(ecstatic);
var server = http.createServer(app);

app.get("/admin", function (req, res, next) {
  if (some_condition) {
    next(); // will now pass through to the fileserver
    // i.e. /admin/index.html or /admin.html
  } else {
    res.writeHead(403);
    res.write("Denied, sorry");
    res.end();
  }
});
server.listen(5150);
```

### Example

```javascript
var http = require("http");
var router = require("router-middleware");
var app = router();
var server = http.createServer(app);

app.get("/user/:username", function (req, res, next) {
  res.writeHead(200);
  res.end("Hello " + req.params.username + "!");
});

server.listen(5150);

// GET /user/joe
// Hello joe!
```

### With Fileserver Ecstatic

```javascript
var http = require("http");
var router = require("router-middleware");
var app = router();
var ecstatic = require("ecstatic")({ root: __dirname });
var server = http.createServer(app);

app.fileserver(ecstatic);

// any custom routes you set will have precedence
// all other GET requests falls-through to the fileserver
```

### With Fileserver Express

```javascript
var http = require("http");
var router = require("router-middleware");
var app = router();
var express = require("express");
var server = http.createServer(app);

app.fileserver(express.static("mydirectory"));

// any custom routes you set will have precedence
// all other GET requests falls-through to the fileserver
```

## Main Methods

### .\[method\] (get, post, ... etc)

Attach a handler to any [HTTP Method](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) from the [full method verb list](https://github.com/jshttp/methods/ "METHODS")
Handler has the signature function(req, res, next).

### .get

```javascript
app.get("/user/email", function (req, res, next) {
  res.write("foo@boop.com");
  res.end();
});
```

### .post

This module comes with a POST body consumer that places the POST body on the `req.body` for you. If you want to use this simply add it
in your middleware stack for a route.

Then you can specify a route like the following:

```javascript
// suppose we send JSON payload via POST
// { username: 'Manny', species: 'cat' }

app.post("/user/email", router.bodyParser, function (req, res, next) {
  // req.body will be the JSON parsed object that is sent on the post
  // req.body.username == 'Manny';
  // req.body.species == 'cat';
});
```

### .use

Add a use handler that is placed in front of every call.

```javascript
app.use(logger);
app.use(parser);
```

### .fileserver(yourFileServer)

Attach any fileserver. Any custom routes you set will have precedence. All other unmatched GET requests falls-through to the fileserver.

Example

```javascript
app.fileserver(require("ecstatic")({ root: __dirname + "/web" }));
```

## Accessory methods

### .set

```javascript
app.set("<key>", "<value>"); // specify the views directory
```

### License

The MIT License (MIT)
Copyright (c) 2020 David Wee - rook2pawn@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
