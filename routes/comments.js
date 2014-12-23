/*jshint node:true*/
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var Comment = require('../models/comment');

var router = express.Router();

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function(err, comment) {
    if (err) return next(err);
    if (!comment) return next(new Error("comment not found"));

    req.comment = comment;
    return next();
  });
});

router.post('/', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment) {
    if (err) return next(err);

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if (err) return next(err);
      res.json(comment);
    });
  });
});

router.put('/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment) {
    if (err) return next(err);
    res.json(comment);
  });
});

module.exports = router;
