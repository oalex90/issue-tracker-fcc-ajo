/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

module.exports = function (app,db) {
  
  //Sample front-end
  app.route('/:project/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/issue.html');
    });


  app.route('/api/issues/:project')

    .get(function (req, res){
      var project = req.params.project;
      var params = req.query;
      
      params.project = project;
      if(params.hasOwnProperty('open')){
         params.open = (params.open == 'true');
      }
      if(params.hasOwnProperty('created_on')){
        params.created_on = new Date(params.created_on);
      }
      if(params.hasOwnProperty('updated_on')){
        params.updated_on = new Date(params.updated_on);
      }
      //console.log("params", params);
      
      

      db.collection('issues').find(params).toArray((err, results)=>{
        //console.log("results", results);
        res.json({results});

      });
    })

    .post(function (req, res){
      var project = req.params.project;
      var newIssue = {
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      };
      //console.log("new issue:", newIssue);
      if(!newIssue.issue_title || !newIssue.issue_text || !newIssue.created_by){
        res.send("issue_title, issue_text, and created_by are required fields");
        return;
      }
    
      db.collection("issues").insertOne(newIssue, (err, document)=>{
        if (err) throw err;
        //console.log("document", document);
        res.json(document.ops[0]);
      })

    })

    .put(function (req, res){
      //console.log("req.body", req.body);
      let criteria;
      try{
        criteria = {_id: ObjectId(req.body._id)};
      } catch (e){
        res.send("_id error");
        return
      }
      if(!criteria) return;
      
      let update = {
        issue_title: req.body.issue_title || null,
        issue_text: req.body.issue_text || null,
        created_by: req.body.created_by || null,
        assigned_to: req.body.assigned_to || null,
        status_text: req.body.status_text || null,
        open: req.body.open == 'false' ? false : null,
        updated_on: new Date()
      }

      for(let prop in update){
        //console.log("typeof " + prop, typeof update[prop] )
        if(update[prop] == null){
          delete update[prop];
        }
          
      }
      //console.log("criteria:", criteria);
      //console.log("update:", update);
      //console.log("count of props:", Object.keys(update).length);
      if(Object.keys(update).length <=1){
        res.send("no updated field sent");
        return;
      }
    
      db.collection("issues").updateOne(criteria, {$set: update}, (err,count)=>{
        if (err || count.result.n == 0){
          res.send("could not update " + req.body._id);
          return;
        } 
        //console.log("count", count);
        res.send("successfully updated");
      });
    })

    .delete(function (req, res){
      //console.log(req.body._id);
      if(!req.body._id){
        res.send("_id error");
        return;
      }
      let criteria;
    
      try{
          criteria = {_id: ObjectId(req.body._id)};
        } catch (e){
          res.send("_id error");
          return;
        }
        if(!criteria) return;
      
      //console.log("criteria:", criteria);
    
      db.collection("issues").deleteOne(criteria, (err, result)=>{
        if (err || result.result.n == 0) {
          res.send("could not delete " + criteria._id);
          return;
        };
        //console.log("result", result.result);
        res.send("deleted " + criteria._id);
      })
    });
    
    
};
