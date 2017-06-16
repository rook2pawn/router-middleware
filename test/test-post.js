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
})
