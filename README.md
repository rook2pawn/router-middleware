router-middleware
=================

Supports
========

* Express style routing
* Parameterized routes
* Any template engines 
* Any fileserver
    
Features
========
* Use Stream based template engines

Example
=======
    var http = require('http')
    var router = require('router-middleware')

    router.get('/user/:username', function(req,res,next) {
      res.writeHead(200)
      res.end("Hello " + res.body.username + "!")
    })    
 
    // GET /user/joe
    // Hello joe!


With Ecstatic
=============
    var http = require('http')
    var router = require('router-middleware')
    var ecstatic = require('ecstatic')({root:__dirname })

    router.fileserver(ecstatic)

    // any custom routes you set will have precedence 
    // any non-matching GET request falls-through to the fileserver
