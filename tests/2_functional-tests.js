/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var testId;
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
         testId = res.body._id;
         //console.log("res.text", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.body.project, "test", "project incorrect");
          assert.equal(res.body.issue_title, "Title", "title incorrect");
          assert.equal(res.body.issue_text, "text", "text incorrect");
          assert.equal(res.body.created_by, "Functional Test - Every field filled in", "created_by incorrect");
          assert.equal(res.body.assigned_to, "Chai and Mocha", "assigned_to incorrect");
          assert.equal(res.body.status_text, "In QA", "status text incorrect");
          assert.equal(res.body.open, true, "open not true");
          assert.exists(res.body.created_on, "created_on does not exist");
          assert.exists(res.body.updated_on, "updated_on does not exist");
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
         //console.log("res.text", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.body.project, "test", "project incorrect");
          assert.equal(res.body.issue_title, "Title", "title incorrect");
          assert.equal(res.body.issue_text, "text", "text incorrect");
          assert.equal(res.body.created_by, "Functional Test - Required fields filled in");
          assert.equal(res.body.open, true, "open not true");
          assert.exists(res.body.created_on, "created_on does not exist");
          assert.exists(res.body.updated_on, "updated_on does not exist");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          chai.request(server)
            .delete('/api/issues/test')
            .send({
              _id: res.body._id
            })
            .end(()=>{
                done();
              });
          
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "issue_title, issue_text, and created_by are required fields");
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "no updated field sent");
          done();
        });
      });
      
      test('One field to update', function(done) {
        //console.log("testId", testId);
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_title: "New Title"
        })
        .end(function(err, res){
          //console.log("res.text", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "successfully updated");
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_title: 'New Title',
          issue_text: 'New Text',
          created_by: 'Functional Test - Multiple fields to update',
          assigned_to: 'Not Chai and Mocha',
          status_text: 'Not In QA'
        })
        .end(function(err, res){
          //console.log("res.text", res.text);
          assert.equal(res.status, 200);
          assert.equal(res.text, "successfully updated");
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.results);
          assert.property(res.body.results[0], 'issue_title');
          assert.property(res.body.results[0], 'issue_text');
          assert.property(res.body.results[0], 'created_on');
          assert.property(res.body.results[0], 'updated_on');
          assert.property(res.body.results[0], 'created_by');
          assert.property(res.body.results[0], 'assigned_to');
          assert.property(res.body.results[0], 'open');
          assert.property(res.body.results[0], 'status_text');
          assert.property(res.body.results[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: true
        })
        .end(function(err, res){
          //console.log("res.text", res.body.results);
          assert.equal(res.status, 200);
          assert.isAtLeast(res.body.results.length, 1);
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: true,
          issue_title: "New Title"
        })
        .end(function(err, res){
          //console.log("res.text", res.body.results);
          assert.equal(res.status, 200);
          assert.isAtLeast(res.body.results.length, 1);
          done();
        });
      });
      
    });//
    
    suite('DELETE /api/issues/{project} => text', function() {
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err,res){
            assert.equal(res.text, "_id error");
            done();
          });//
      });
      
      test('Valid _id', function(done) {//
        //console.log("testId", testId);
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id: testId
          })
          .end(function(err,res){
            assert.equal(res.text, "deleted " + testId);
            done();
          });
      });     
    });
});
