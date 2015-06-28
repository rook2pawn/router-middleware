var request = require('supertest')
  , app = require('../index');
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
  res.write('foo')
  res.end()
};
app.get('/foo',a,b,c);

request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', y.length)
  .expect(200)
  .end(function(err, res){
    if (err) throw err;
  });

request(app)
  .get('/foo')
  .expect('foo')
  .end(function(err, res){
    assert.equal(val,3)
    if (err) throw err;
  });
