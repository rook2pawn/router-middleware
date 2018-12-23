Write fully featured http services and streaming templates without the bloat

[![Build Status](https://travis-ci.org/rook2pawn/router-middleware.svg?branch=master)](https://travis-ci.org/rook2pawn/router-middleware)

[![Coverage Status](https://coveralls.io/repos/github/rook2pawn/router-middleware/badge.svg?branch=master)](https://coveralls.io/github/rook2pawn/router-middleware?branch=master)

# router-middleware

## Full Example

```javascript
    var http = require('http')
    var router = require('router-middleware')
    var app = router();
    var server = http.createServer(app)

    app.post('/user/:userId/email', router.bodyParser, function(req,res,next) {

      console.log(req.query);
      // { authToken: '1234' }
      console.log(req.params);
      // { userId: 'abc123' }
      console.log(req.body);
      // { message: 'Hello World!' }
    })

    server.listen(5150);
```
    > curl -X POST -d '{"message" : "Hello World!"}' "http://localhost:5150/user/abc123/email?authToken=1234"

## Supports
* Legacy Support for Express Template Engines
* Legacy Support for Express Routes
* Legacy Support for Express Syntax

## Features
* Chainable middleware
* familiar req.params and req.query are there
* identical routing to what you are used to

## Any Template Engine
* Any Express-compatible template engine
* Any stream-based template engine
* Tagged Template Strings
* You design it!

## Any Fileserver
* Ecstatic
* express.static
* fs

## How to handle POST (this autodetects json or form querystring)

```javascript
    var http = require('http')
    var router = require('router-middleware')
    var app = router();
    var server = http.createServer(app)

    // router.bodyParser auto-detects json or querystring and places the result
    // on the req.body

    app.post('/user/email', router.bodyParser, function(req,res,next) {

      // req.body will be the JSON parsed object that is sent on the post
      // req.body.username == 'Manny';
      // req.body.species == 'cat';
    })

    server.listen(5150);
```

## How to do a simple GET Fall-Through
```javascript
    var http = require('http')
    var router = require('router-middleware')
    var ecstatic = require('ecstatic')({root:__dirname })
    var app = router();
    app.fileserver(ecstatic);
    var server = http.createServer(app)

    app.get('/admin', function(req,res,next) {
      if (some_condition) {
        next(); // will now pass through to the fileserver
                // i.e. /admin/index.html or /admin.html
      } else {
        res.writeHead(403)
        res.write('Denied, sorry')
        res.end()
      }
    })
    server.listen(5150);
```

### Example
```javascript
    var http = require('http')
    var router = require('router-middleware')
    var app = router()
    var server = http.createServer(app)

    app.get('/user/:username', function(req,res,next) {
      res.writeHead(200)
      res.end("Hello " + req.params.username + "!")
    })

    server.listen(5150);

    // GET /user/joe
    // Hello joe!
```

### With Fileserver Ecstatic
```javascript
    var http = require('http')
    var router = require('router-middleware')
    var app = router()
    var ecstatic = require('ecstatic')({root:__dirname })
    var server = http.createServer(app)

    app.fileserver(ecstatic)

    // any custom routes you set will have precedence
    // all other GET requests falls-through to the fileserver
```

### With Fileserver Express
```javascript
    var http = require('http')
    var router = require('router-middleware')
    var app = router()
    var express = require('express')
    var server = http.createServer(app)

    app.fileserver(express.static('mydirectory'))

    // any custom routes you set will have precedence
    // all other GET requests falls-through to the fileserver
```
### With a Express Template Engine
```javascript
    var router = require('router-middleware')
    var app = router()
    app.engine('view', yourengine) // i.e. index.view
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine (i.e. for extension .view)
```

### With a Stream Template Engine
```javascript
    var router = require('router-middleware')
    var through = require('through')

    var app = router()
    app.streamengine('view', yourengine)
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine
```

where "yourengine" callback will be called with filepath, options, and the response object.

Example callback:

```javascript
    function (filePath, options, res) { // define the template engine
      fs
      .createReadStream(filePath)
      .pipe(through(function write(data) {
          this.queue(data.toString().toUpperCase()) //data *must* not be null
        },
        function end () { //optional
          this.queue(null)
        }))
      .pipe(res)
    }
```

## Main Methods

### .\[method\] (get, post, ... etc)

Attach a handler to any [HTTP Method](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods) from the [full method verb list](https://github.com/jshttp/methods/ "METHODS")
Handler has the signature function(req, res, next).


### .get
```javascript
    app.get('/user/email',function(req,res,next) {
      res.write('foo@boop.com');
      res.end();
    })
```
### .post

This module comes with a POST body consumer that places the POST body on the `req.body` for you. If you want to use this simply add it
in your middleware stack for a route.

Then you can specify a route like the following:
```javascript
    // suppose we send JSON payload via POST
    // { username: 'Manny', species: 'cat' }

    app.post('/user/email', router.bodyParser, function(req,res,next) {

      // req.body will be the JSON parsed object that is sent on the post
      // req.body.username == 'Manny';
      // req.body.species == 'cat';
    })
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
    app.fileserver(require('ecstatic')({root:__dirname+'/web'}));
```
## Accessory methods

### .engine

Use templates with the same signature as express engines.
```javascript
    app.engine('view', yourengine) // i.e. index.view
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine (i.e. for extension .view)
```
### .streamengine
```javascript
    app.streamengine('view', your_stream_engine)
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine
```
#### An Example streamengine
```javascript
    var HtmlTemplate = require('html-template')
    app.streamengine('view', function(filename, opts, res) {
      // looking for {template: <template string name>, list: <list of objects to write> }
      res.setHeader('Content-Type','text/html');
      var html = HtmlTemplate()
      fs.createReadStream(filename)
          .pipe(html)
          .pipe(res)
      ;
      opts.forEach(function(opt) {
        var template = html.template(opt.template,{include:false});
        opt.list.forEach(function(obj) {
          template.write(obj)
        })
        template.end()
      })
    })
```
#### Using this example streamengine
```javascript
    res.streamrender('teamslist', [{
      template:'poll',
      list:JSON.parse(fs.readFileSync('poll_ap.json')).map(function(poll) {
        return {
          '[key=week]': {
            _text : poll.week
          },
          '[key=date]': {
            _text : poll.date
          },
          '[key=position]': {
            _text : poll.position
          },
          '[key=school]': {
            _text : poll.school,
            href: '/team/'.concat(poll.uuid)
          },
          '[key=conference]': {
            _text : poll.conference
          }
        }
      })
    }]
```
Where teamslist.view looks like

    <table>
      <tr>
        <th>Week</th>
        <th>date</th>
        <th>Position</th>
        <th>School</th>
        <th>Conference</th>
      </tr>
      <tr template='poll'>
        <td key='week'></td>
        <td key='date'></td>
        <td key='position'></td>
        <td><a key='school'></a></td>
        <td key='conference'></td>
      </tr>
    </table>

### .set

Used to set properties for .engine and .streamengine.
```javascript
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine (i.e. for extension .view)
```

### A Tale of Two Servers, Two Stories

Suppose customer Jim is shopping for shoes online.

Server A is built using Express and has a nice cache algorithm and perhaps Nginx in front serving out both the CDN and the cache hits and proxying on top of Node. The architect has deemed that every night at the lowest peak traffic, most pages would be recalculated, cache would be invalidated, and new cache would be resprinkled upon the CDN servers. Or items low in inventory automatically get recalculated and get new cache. This is fine. But then, there is a cache miss. Something changed, and it happened at a period of intense database traffic and activity. CPU Loads are huge. Jim, shopping for shoes, has to stare at a somewhat empty screen for a few seconds, then, like rain from heaven, there is a huge burst of traffic as alas his delivery is here and he can browse that page.

Server B is built on top of router-middleware and it too, has a cache algorithm. However cache misses aren't a cause for concern. The dev ops people sleep soundly while non-cached pages are being served fresh NodeJS produced HTML. Jim is browsing through the shoe catalog and happens to be browsing during a period where there is some intense traffic around the database and even though the data is coming out slowly, Jim doesn't have to wait while the traffic is being produced: he just gets it as it comes out. Is this javascript on the front calling out back home and doing some websocket or streaming over sockets? Nope. This is plain old HTML. Furthermore, there aren't any concerns about the size of the result-set. We know its going to come out as fast as the server can deliver, and at the capacity the the client can consume. There is no idle time, CPU loads are regular we see a nice even flat line with very little irregularity or spiking of CPU, Disk and other I/O usage. Likewise, Jim's computer doesn't suffer from having to go from completely idle to 100% of load simply because the traffic is finally here and the entire result set came in (or even paginated). It works at a smooth and steady pace.

How is this done? A router that is purpose-built expressly for

* Streaming Data with Templates over HTTP/HTML
* Streaming Data Webservices over HTTP
* Producing smoother CPU, Disk, I/O usages for *any size* result set of data that needs to be relayed
* More scalability!


To be fair, streaming data webservices over HTTP can be done with something as simple as, and yes, Express is suitable as well for this task.
```javascript
    http.createServer(function(req,res) {
      mystream.pipe(res)
    })
```



### html-template front and center

The example here is using the very awesome [html-template](https://npmjs.org/package/html-template) as its stream mechanism, however you are free to roll your own and simply use the callback in streamengine.


### Example

Using [html-template](https://npmjs.org/package/html-template) and [ecstatic](https://npmjs.org/package/estatic)
```javascript
    var router = require('router-middleware')
    var HtmlTemplate = require('html-template')
    var path = require('path')
    var ecstatic = require('ecstatic')({root:path.join(__dirname,'web') })

    var app = router()
    app.set('views', './views'); // specify the views directory
    app.set('view engine', 'view'); // register the template engine
    app.streamengine('view', function(filename, opts, res) {
      // looking for {template: <template string name>, list: <list of objects to write> }
      res.setHeader('Content-Type','text/html');
      var html = HtmlTemplate()
      fs.createReadStream(filename)
          .pipe(html)
          .pipe(res)
      ;
      var template = html.template(opts.template);
      opts.list.forEach(function(obj) {
        template.write(obj)
      })
      template.end()
    })
    app.fileserver(ecstatic)
```
And you could invoke it through a route like this
```javascript
    app.get('/', function(req,res) {
      res.streamrender('animal_list', {
        template:'animal',
        list: [
          {
            '[key=name]' : {
              _text : 'Aardvark',
              href : "animal/aardvark"
            }
          },
          {
            '[key=name]' : {
              _text : 'Cat',
              href : "animal/cat"
            }
          }
      })
    })
```
Where the arguments and options of res.streamrender end up going to the user-defined callback at app.streamengine,
and this would lookup 'views/animal_list.view' whose content was something like

    <div template='animal'>
       <a key="name"></a>
    </div>


To produce


    <div>
      <a href="animal/aardvark">Aardvark</a>
    </div>
    <div>
      <a href="animal/cat">Cat</a>
    </div>


Note that a request for anything that does not match any predefined GET routes falls through to any defined fileserver, in this case, ecstatic

    var ecstatic = require('ecstatic')({root:path.join(__dirname,'web') })

So while a request to "/" gives us the streamrender list, "/api"  would default to the fileserver which in this case would look up /web/api/index.html.


### Why?

Because the use case is so compelling and express simply could not support it. The use case being able to stream responses of templated data. For instance: suppose I load the top 1000 selling shoes from a shoe outlet. Now suppose each shoe has a whole bunch of data with each database entry and for some reason or another the DB lookup is taking a bit longer to complete, and that each entry is going to be formatted according to some HTML template. What we do not want is to have to have the user wait for the entire thing to be finished before they even see one shoe being listed: we want to be able to stream back the results to the user in real time as they are being loaded by the database or whatever particular constraints there are on the service.

Or consider a purely HTTP service that we are writing. We know for a fact we won't have server-to-browser relationship and instead it will be service to service. We want these **services to be composable**. We can have one server deliver results and have the consuming server simply pipe it in to its next destination.

### What's Wrong with Wait on Completion?

If we wait on completion, here's what goes wrong:

1. It doesn't scale. If the result set is larger than available memory, the computer is done.
2. It doesn't scale. Waiting on completion will result in idle-cpus that wait then explode with usage when completed. Streams allow the intelligent use of resources and maximizes scalability since we are allowing both producers and consumers to pipe results into toolchains before completion, allowing the computer to work on an as needed basis.
3. Non-Composibility. Good tools often follow UNIX tool principles.





### Contributions

Contributions are welcome! Pull requests are promptly reviewed.


### License

The MIT License (MIT)
Copyright (c) 2016 David Wee - rook2pawn@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
