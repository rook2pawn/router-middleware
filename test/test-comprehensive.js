var request = require('supertest')
  , app = require('../index');
var response = require('response')
var assert = require('assert')

var x = { name: 'tobi' }
var y = JSON.stringify(x)

app.get('/user', function(req, res,next){
  res.writeHead(200, {
    'Content-Type': 'text/json',
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
.expect('Content-Type', /json/)
.expect('Content-Length', y.length)
.expect(200)
.end(function(err, res){
  assert.deepEqual(res.body,{name:'tobi'})
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
  assert.deepEqual(res.body, {username:'ernie',type:'update'})
  if (err) throw err;
});
