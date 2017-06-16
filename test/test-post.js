var request = require('supertest');
var test = require('tape');
var router = require('../index');
var response = require('response');
var fs = require('fs');
var qs = require('querystring');


test('test post', function(t) {
  t.plan(2)
  var app = router()
  app.post('/user',function(req,res) {
    t.ok(req.body);
    res.write(req.body.username)
    res.end()
  })
  var x = request(app);
  x
  .post('/user/')
  .send({ username: 'Manny', species: 'cat' })
  .end(function(err,res) {
    console.log(res.text);
    t.equal(res.text, 'Manny')
  })
});

test('test post', function(t) {

  t.plan(3);
  var app = router()
  app.post('/user/:userId/notify',function(req,res) {
    t.ok(req.body.message);
    t.ok(req.params.userId);
    var username = req.params.userId;
    var message = req.body.message;
    res.write(username.concat(':').concat(message))
    res.end()
  })
  var x = request(app);
  x
  .post('/user/manny/notify')
  .send({ message: 'Hello!' })
  .end(function(err,res) {
    t.equal(res.text, 'manny:Hello!')
  })
})
