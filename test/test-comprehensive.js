var request = require('supertest');
var test = require('tape');
var router = require('../index');
var response = require('response');
var fs = require('fs');
var qs = require('querystring');


test('test parameterization', function(t) {
  t.plan(2)
  var app = router()
  app.get('/user/:username/:postnumber',function(req,res) {
    t.equal(req.params.postnumber,'341')
    res.write(req.params.username)
    res.end()
  })
  var x = request(app);
  x
  .get('/user/frank/341')
  .end(function(err,res) {
    t.equal(res.text, 'frank')
  })
})
test('test parameterization using uuids and query', function(t) {
  t.plan(2)
  var qobj = {foo:'bar', life:'42' }
  var app = router()
  app.get('/user/:id',function(req,res) {
    console.log(req.params)
    console.log(req.query)
    t.deepEquals(req.query, qobj)
    res.write(req.params.id)
    res.end()
  })
  var id = '0efa7810-5a6e-4427-9b32-63c9102bbfe'
  var x = request(app);
  x
  .get('/user/'.concat(id).concat('?').concat(qs.stringify(qobj)))
  .end(function(err,res) {
    t.equal(res.text, id)
  })
});

test('content type,accept', function(t) {
  var app = router()
  t.plan(1);
  app.get('/user/:username',function(req,res,next) {
    next()
  },function(req,res,next) {
    res.end(req.params.username)
  })
  var x = request(app);
  x
  .get('/user/frank')
  .set('Accept', 'cool/beans')
  .end(function(err,res) {
    t.equal(res.text, 'frank')
  })
});

test('test view engine,next middleware call', function(t) {
  t.plan(3);
  var app = router()
  app.get('/', function(req,res,next) {
    t.equal(req.headers.accept,'cool/beans')
    res.render('index', { title: 'Hey ' + req.query.from , message: 'Hello there!'});
  })

  app.engine('ntl', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
      if (err) return callback(new Error(err));
      // this is an extremely simple template engine
      var rendered = content.toString().replace('#title#', ''+ options.title +'')
      .replace('#message#', ''+ options.message +'');
      return callback(null, rendered);
    })
  });
  app.set('views', './views'); // specify the views directory
  app.set('view engine', 'ntl'); // register the template engine

  var x = request(app);

  x
  .get('/?from=garen')
  .set('Accept', 'cool/beans')
  .end(function(err,res) {
    t.equal(res.headers['content-type'], 'text/html')
    t.equal(res.text.match(/<h2>(.+?)<\/h2>/)[1], 'Yo!! Hey garen');
  })
})


test('test comprehensive', function(t) {
  t.plan(2);
  var x = { name: 'tobi' }
  var y = JSON.stringify(x)
  var app = router()
  app.get('/user', function(req, res,next){
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length':y.length
    })
    res.write(y)
    res.end()
  });

  var val = 0;
  var a = function(req,res,next) {
    val++;
    next()
  };
  var b = function(req,res,next) {
    val++;
    next()
  };
  var c = function(req,res,next) {
    val++;
    res.write(val.toString())
    res.end()
  };
  app.get('/foo',a,b,c);

  app.get('/user/:username/:type', function(req,res,next) {
    response.json(req.params).status(200).pipe(res)
  })

  var x = request(app)
  x
  .get('/user')
  .expect('Content-Type', 'application/json')
  .expect('Content-Length', y.length)
  .expect(200)
  .end(function(err, res){
    t.deepEqual(res.body,{name:'tobi'})
    if (err) throw err;
  });

  x
  .get('/foo')
  .expect('3')
  .end(function(err, res){
    if (err) throw err;
  });

  x
  .get('/user/ernie/update')
  .expect('Content-Type', 'application/json')
  .end(function(err, res){
    t.deepEqual(res.body, {username:'ernie',type:'update'})
    if (err) throw err;
  });
})
